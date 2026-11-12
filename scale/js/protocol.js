/*
 * Bluetooth body-scale protocols, with no DOM or Bluetooth access so they run in Node tests.
 *
 *  - Senssun body-fat scales (the machines sold for the MovingLife app):
 *    service FFF0 (notify FFF1, write FFF2) or service FFB0 (notify + write FFB2).
 *  - Bluetooth standard Weight Scale (181D / 2A9D) and Body Composition (181B / 2A9C).
 *
 * A session takes notification bytes and returns { events, writes }:
 *   events: { type: 'weight', kg, stable } | { type: 'result', data } | { type: 'error', message }
 *   writes: byte arrays to send to the scale's write characteristic.
 */
(function (root) {
  const full = (short) => '0000' + short + '-0000-1000-8000-00805f9b34fb';
  const short = (uuid) => {
    const u = String(uuid).toLowerCase();
    return /^0000[0-9a-f]{4}-0000-1000-8000-00805f9b34fb$/.test(u) ? u.slice(4, 8) : u;
  };

  const SERVICES = {
    senssunA: { service: 'fff0', notify: ['fff1'], write: 'fff2' },
    senssunB: { service: 'ffb0', notify: ['ffb2'], write: 'ffb2' },
    weight: { service: '181d', notify: ['2a9d'], write: null },
    composition: { service: '181b', notify: ['2a9c'], write: null },
  };
  const KNOWN_SERVICES = Object.keys(SERVICES).map((k) => SERVICES[k].service);

  const toHex = (bytes) => Array.from(bytes, (b) => (b & 0xff).toString(16).padStart(2, '0')).join('');
  const fromHex = (hex) => {
    const out = [];
    const s = String(hex || '').replace(/[^0-9a-f]/gi, '');
    for (let i = 0; i + 1 < s.length; i += 2) out.push(parseInt(s.substr(i, 2), 16));
    return out;
  };
  const be16 = (b, i) => ((b[i] & 0xff) << 8) | (b[i + 1] & 0xff);
  const le16 = (b, i) => ((b[i + 1] & 0xff) << 8) | (b[i] & 0xff);
  const r1 = (n) => Math.round(n * 10) / 10;

  /** Senssun command frame: A5, command, 3 data bytes, 2 zero bytes, checksum, 0. */
  function senssunFrame(cmd, d1, d2, d3) {
    const m = [0xa5, cmd & 0xff, d1 & 0xff, d2 & 0xff, d3 & 0xff, 0, 0, 0, 0];
    let sum = 0;
    for (let i = 1; i < m.length - 2; i++) sum = (sum + m[i]) & 0xff;
    m[m.length - 2] = sum;
    return m;
  }

  function senssunDate(now) {
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - start) / 86400000);
    return senssunFrame(0x30, now.getFullYear() % 100, dayOfYear >> 8, dayOfYear & 0xff);
  }
  const senssunTime = (now) => senssunFrame(0x31, now.getHours(), now.getMinutes(), now.getSeconds());

  /** The scale needs sex, age and height to work out body fat from the impedance it measures. */
  function senssunUser(user) {
    const age = Math.max(10, Math.min(99, Math.round(Number(user.age) || 30)));
    const height = Math.max(100, Math.min(220, Math.round(Number(user.heightCm) || 165)));
    return senssunFrame(0x10, (user.sex === 'male' ? 0xf0 : 0x00) + 1, age, height);
  }

  /** Bluetooth standard Weight Measurement (2A9D). */
  function parseWeightMeasurement(b) {
    if (b.length < 3) return null;
    const imperial = b[0] & 1;
    const raw = le16(b, 1);
    const kg = imperial ? raw * 0.01 * 0.45359237 : raw * 0.005;
    return { weightKg: Math.round(kg * 100) / 100 };
  }

  /** Bluetooth standard Body Composition Measurement (2A9C). */
  function parseBodyComposition(b) {
    if (b.length < 4) return null;
    const flags = le16(b, 0);
    const imperial = flags & 1;
    const mass = (raw) => Math.round((imperial ? raw * 0.01 * 0.45359237 : raw * 0.005) * 100) / 100;
    const out = {};
    let i = 2;
    const fat = le16(b, i); i += 2;
    if (fat !== 0xffff) out.fatPct = r1(fat * 0.1);
    if (flags & 0x0002) i += 7;
    if (flags & 0x0004) i += 1;
    const take = (bit, fn) => {
      if (!(flags & bit) || i + 1 >= b.length) return;
      fn(le16(b, i)); i += 2;
    };
    take(0x0008, (v) => { out.bmrKcal = Math.round(v / 4.184); }); // sent in kilojoules
    take(0x0010, (v) => { out.musclePct = r1(v * 0.1); });
    take(0x0020, (v) => { out.muscleKg = mass(v); });
    take(0x0040, (v) => { out.fatFreeKg = mass(v); });
    take(0x0080, (v) => { out.softLeanKg = mass(v); });
    take(0x0100, (v) => { out.waterKg = mass(v); });
    take(0x0200, (v) => { out.impedance = r1(v * 0.1); });
    take(0x0400, (v) => { out.weightKg = mass(v); });
    return out;
  }

  function createSession(user, now) {
    let s = { weight: null, stable: false, got: 0, data: {} };
    let done = false;

    function senssun(bytes) {
      const events = [];
      const writes = [];
      // Frames are FF A5 <5 data bytes> <type> ..., one or more per notification.
      for (let at = 0; at + 7 < bytes.length; at++) {
        if (bytes[at] !== 0xff || bytes[at + 1] !== 0xa5) continue;
        const d = bytes.slice(at + 1);
        const type = d[5];
        if (type === 0xaa || type === 0xa0) {
          if (s.stable) { at += 7; continue; }
          const kg = be16(d, 1) / 10;
          s.weight = kg;
          s.stable = type === 0xaa;
          events.push({ type: 'weight', kg, stable: s.stable });
          if (s.stable) { s.got |= 1; s.data.weightKg = kg; writes.push(senssunUser(user)); }
        } else if (type === 0xbe) {
          events.push({ type: 'error', message: 'The scale could not measure body fat. Stand barefoot on the metal pads and try again.' });
        } else if (type === 0xb0) {
          s.data.fatPct = be16(d, 1) / 10;
          s.data.waterPct = be16(d, 3) / 10;
          s.got |= 2;
        } else if (type === 0xc0) {
          s.data.musclePct = be16(d, 1) / 10;
          s.data.boneKg = le16(d, 3) / 10;
          s.got |= 4;
        } else if (type === 0xd0) {
          s.data.bmrKcal = be16(d, 1);
          s.got |= 8;
        }
        at += 7;
      }
      if (s.got === 15 && !done) {
        done = true;
        events.push({ type: 'result', data: Object.assign({ source: 'Senssun scale' }, s.data) });
      }
      return { events, writes };
    }

    return {
      /** Frames to send once the scale is connected. */
      start(kind) {
        return kind === 'senssunA' || kind === 'senssunB' ? [senssunDate(now || new Date()), senssunTime(now || new Date())] : [];
      },
      /** Feed one notification. */
      feed(charUuid, bytes) {
        const c = short(charUuid);
        if (c === 'fff1' || c === 'ffb2') return senssun(bytes);
        if (c === '2a9d') {
          const w = parseWeightMeasurement(bytes);
          if (!w) return { events: [], writes: [] };
          s.data.weightKg = w.weightKg;
          return { events: [
            { type: 'weight', kg: w.weightKg, stable: true },
            { type: 'result', data: Object.assign({ source: 'Bluetooth scale' }, s.data) },
          ], writes: [] };
        }
        if (c === '2a9c') {
          const bc = parseBodyComposition(bytes);
          if (!bc) return { events: [], writes: [] };
          Object.assign(s.data, bc);
          const events = [];
          if (s.data.weightKg) events.push({ type: 'result', data: Object.assign({ source: 'Bluetooth scale' }, s.data) });
          return { events, writes: [] };
        }
        return { events: [], writes: [] };
      },
      /** Whatever has arrived so far, e.g. weight only when the scale sent no body-fat frames. */
      partial() { return s.data.weightKg ? Object.assign({ source: 'Scale (weight only)' }, s.data) : null; },
      reset() { s = { weight: null, stable: false, got: 0, data: {} }; done = false; },
    };
  }

  /** Pick the protocol from the services a connected scale offers. */
  function pickKinds(serviceUuids) {
    const have = serviceUuids.map(short);
    return Object.keys(SERVICES).filter((k) => have.includes(SERVICES[k].service));
  }

  const api = {
    SERVICES, KNOWN_SERVICES, full, short, toHex, fromHex,
    senssunFrame, senssunDate, senssunTime, senssunUser,
    parseWeightMeasurement, parseBodyComposition, createSession, pickKinds,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ScaleProtocol = api;
})(typeof self !== 'undefined' ? self : this);
