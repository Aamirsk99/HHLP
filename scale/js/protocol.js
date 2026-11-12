/*
 * Bluetooth body-scale protocols, with no DOM or Bluetooth access so they run in Node tests.
 *
 * Senssun body-fat scales (the machines used with the MovingLife app). A scale says which
 * variant it speaks in its advertisement (manufacturer data): vendor(2) version(1) model(2) MAC(6).
 *   - "v1"   connectable, service FFF0, frames 10 00 00 C5 LEN 03 FUNC … CS
 *   - "v11"  connectable, service FFF0, frames 33 CC LEN SEQ SEQ 00 FUNC … CS
 *   - broadcast-only: weight and impedance inside the advertisement, never connected
 *   - "old"  first-generation scales, frames FF A5 …
 * Also the Bluetooth standard Weight Scale (181D) and Body Composition (181B) services.
 *
 * A session takes notification or advertisement bytes and returns { events, writes }:
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
    senssun: { service: 'fff0', notify: ['fff1', 'fff3', 'ffb2'], write: 'fff2' },
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
  const be32 = (b, i) => ((b[i] & 0xff) * 0x1000000) + (((b[i + 1] & 0xff) << 16) | ((b[i + 2] & 0xff) << 8) | (b[i + 3] & 0xff));
  const le16 = (b, i) => ((b[i + 1] & 0xff) << 8) | (b[i] & 0xff);
  const r1 = (n) => Math.round(n * 10) / 10;
  const r2 = (n) => Math.round(n * 100) / 100;
  const sum = (b, from, to) => { let s = 0; for (let i = from; i <= to; i++) s += b[i] & 0xff; return s & 0xff; };

  // ── Which scale is it? ───────────────────────────────────────
  // Models that only broadcast (the app never connects to them).
  const BROADCAST_MODELS = ['0202', '0204', '0311', '0312', '0313', '0315', '0316', '0328'];
  const BROADCAST_V2_MODELS = ['0202', '0311', '0312', '0313'];
  const isBodyModel = (m) => /^(02|03|90)[0-9a-f]{2}$/.test(m);

  /**
   * Manufacturer data of an advertisement (company-ID bytes included) → what the scale is.
   * Returns null when the data does not look like one of these scales.
   */
  function parseAdvert(bytes, name) {
    let b = bytes || [];
    const n = String(name || '');
    // Fix-ups for models that advertise a non-standard prefix.
    if (n === 'XS-iF1150-B2A' && b[0] === 0xff && b[1] === 0xf0 && b.length >= 6) b = [0x00, 0x01, 0x01, 0x03, 0x03].concat(b.slice(-6));
    else if (n === 'BW326P' && b.length >= 6) b = [0x80, 0x02, 0x01, 0x03, 0x11].concat(b.slice(-6));
    if (b.length < 11) return null;
    const model = toHex(b.slice(3, 5));
    if (!isBodyModel(model)) return null;
    const version = b[2];
    const broadcast = BROADCAST_MODELS.includes(model);
    const proto = broadcast ? (BROADCAST_V2_MODELS.includes(model) ? 'broadcast2' : 'broadcast1')
      : version === 0x30 ? 'v30' : version > 0x10 ? 'v11' : 'v1';
    return { model, version, proto, broadcast, mac: toHex(b.slice(5, 11)), payload: b.slice(11) };
  }

  /** Weight in a broadcast advertisement: { kg, stable, impedance } or null. */
  function parseBroadcast(info) {
    const p = info.payload;
    if (p.length < 6) return null;
    const raw = be16(p, 1);
    if (raw === 0xffff) return { overload: true };
    const imp = be16(p, 3);
    if (info.proto === 'broadcast2') {
      return { kg: r2(raw / 100), stable: (p[5] >> 4) === 0x0a, impedance: imp };
    }
    const div = p[0] & 0x1f;
    const factor = div === 1 || div === 4 ? 100 : div === 2 || div === 3 ? 10 : div >= 18 && div <= 20 ? 0.1 : div >= 23 && div <= 25 ? 0.01 : 1;
    const out = { kg: r2(raw * factor / 1000), stable: !!(p[5] & 0x80), impedance: 0 };
    if (p.length >= 7 && p[6] === 1) out.impedance = imp;
    return out;
  }

  // ── Commands ─────────────────────────────────────────────────
  const clamp = (v, lo, hi, dflt) => { const n = Math.round(Number(v)); return isFinite(n) && n > 0 ? Math.max(lo, Math.min(hi, n)) : dflt; };
  const userBytes = (user) => [user.sex === 'male' ? 1 : 0, clamp(user.heightCm, 100, 220, 165), clamp(user.age, 10, 99, 30), 0];
  const PIN = [0x00, 0x01];

  /** v1: tell the scale who is standing on it (it needs sex, height and age for body fat). */
  function v1AddUser(user, weightKg) {
    const w = Math.round((Number(weightKg) || 0) * 10);
    const m = [0x10, 0x00, 0x00, 0xc5, 0x13, 0x03, 0x01, 0x00, 0x01].concat(PIN, userBytes(user), [0x00, (w >> 8) & 0xff, w & 0xff, 0]);
    m[m.length - 1] = sum(m, 4, m.length - 2);
    return m;
  }

  function v11Frame(seq, func, payload) {
    const m = [0x33, 0xcc, 0, (seq >> 8) & 0xff, seq & 0xff, 0x00, func].concat(payload, [0]);
    m[2] = m.length;
    m[m.length - 1] = sum(m, 2, m.length - 2);
    return m;
  }
  const v11AddUser = (seq, user) => v11Frame(seq, 0x01, [0x01, 0x00].concat(PIN, userBytes(user), [0x01]));
  function v11Time(seq, now) {
    const tz = -now.getTimezoneOffset() & 0xffff;
    const t = Math.floor(now.getTime() / 1000);
    return v11Frame(seq, 0x10, [0x01, tz >> 8, tz & 0xff, (t >>> 24) & 0xff, (t >> 16) & 0xff, (t >> 8) & 0xff, t & 0xff]);
  }
  const v11Ack = (seq, func, scaleSeqHi, scaleSeqLo) => v11Frame(seq, 0xff, [func, scaleSeqHi, scaleSeqLo]);

  /** First-generation scales: A5, command, 3 data bytes, 2 zero bytes, checksum, 0. */
  function oldFrame(cmd, d1, d2, d3) {
    const m = [0xa5, cmd & 0xff, d1 & 0xff, d2 & 0xff, d3 & 0xff, 0, 0, 0, 0];
    m[m.length - 2] = sum(m, 1, m.length - 3);
    return m;
  }
  const oldUser = (user) => oldFrame(0x10, (user.sex === 'male' ? 0xf0 : 0x00) + 1, clamp(user.age, 10, 99, 30), clamp(user.heightCm, 100, 220, 165));

  // ── Standard Bluetooth services ──────────────────────────────
  function parseWeightMeasurement(b) {
    if (b.length < 3) return null;
    const raw = le16(b, 1);
    return { weightKg: r2((b[0] & 1) ? raw * 0.01 * 0.45359237 : raw * 0.005) };
  }

  function parseBodyComposition(b) {
    if (b.length < 4) return null;
    const flags = le16(b, 0);
    const imperial = flags & 1;
    const mass = (raw) => r2(imperial ? raw * 0.01 * 0.45359237 : raw * 0.005);
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

  // ── Session ──────────────────────────────────────────────────
  /** @param info result of parseAdvert for the bound scale, when known */
  function createSession(user, info, clock) {
    const now = clock || (() => new Date());
    let buf = [];
    let seq = 1;
    let family = '';        // 'v1' | 'v11' | 'old', learnt from the advertisement or the first frame
    let userSent = false;
    let unit = { factor: 100 }; // v1: grams per raw unit, remembered from the live-weight frame
    let last = null;        // last weight seen, for a weight-only reading
    let latched = false;    // broadcast: result already reported for this stand-on
    let old = { got: 0, data: {}, stable: false };
    const nextSeq = () => { seq = seq >= 255 ? 1 : seq + 1; return seq; };

    const withScaleValues = (data, fat, water, muscle, bone, bmr) => {
      if (fat > 0) data.fatPct = fat / 10;
      if (water > 0) data.waterPct = water / 10;
      if (muscle > 0) data.musclePct = muscle / 10;
      if (bone > 0) data.bonePct = bone / 10;
      if (bmr > 0) data.bmrKcal = bmr;
      return data;
    };

    function hello(fam, out) {
      if (userSent) return;
      userSent = true;
      if (fam === 'v11') { out.writes.push(v11Time(nextSeq(), now())); out.writes.push(v11AddUser(nextSeq(), user)); }
      else if (fam === 'v1') out.writes.push(v1AddUser(user, last ? last.kg : 0));
    }

    function v1(f, out) {
      const func = f[6];
      if (func === 0x80 && f.length >= 14) {
        const raw = be16(f, 7);
        if (raw === 0xffff) { out.events.push({ type: 'error', message: 'Overload: the weight is above the machine\'s limit.' }); return; }
        const h = f[11] >> 4;
        unit.factor = h === 1 || h === 2 ? 10 : 100;
        const kg = r2(raw * unit.factor / 1000);
        const stable = (f[12] | 0x10) === 0xba;
        last = { kg, stable };
        out.events.push({ type: 'weight', kg, stable });
      } else if (func === 0x82 && f.length >= 13) {
        if (f[7] !== 0) return; // a stored record, not this measurement
        const n = f.length - 8;
        let factor = unit.factor;
        if (n >= 22) { const h = f[28] >> 4; factor = h === 1 || h === 2 ? 10 : 100; }
        const data = { source: 'Senssun scale', weightKg: r2(be16(f, 10) * factor / 1000) };
        withScaleValues(data, n >= 7 ? be16(f, 12) : 0, n >= 11 ? be16(f, 16) : 0, n >= 13 ? be16(f, 18) : 0, n >= 15 ? be16(f, 20) : 0, n >= 17 ? be16(f, 22) : 0);
        if (n >= 9 && be16(f, 14) > 0) data.impedance = be16(f, 14);
        if (n >= 23 && f[29] > 0) data.heartRate = f[29];
        last = { kg: data.weightKg, stable: true };
        out.events.push({ type: 'weight', kg: data.weightKg, stable: true });
        out.events.push({ type: 'result', data });
      }
    }

    function v11(f, out) {
      const func = f[6];
      if (func === 0x80 && f.length >= 17) {
        if (f[15] & 0x40) { out.events.push({ type: 'error', message: 'Overload: the weight is above the machine\'s limit.' }); return; }
        const kg = r2(be16(f, 8) / 100);
        last = { kg, stable: !!(f[15] & 0x80) };
        out.events.push({ type: 'weight', kg, stable: last.stable });
      } else if (func === 0x81 && f.length >= 23) {
        if (f[7] === 1) out.writes.push(v11Ack(nextSeq(), 0x81, f[3], f[4]));
        const data = { source: 'Senssun scale', weightKg: r2(be16(f, 10) / 100) };
        let i = 22;
        while (i + 1 < f.length - 1) {
          const len = f[i];
          const t = f[i + 1];
          if (len < 2 || i + len > f.length - 1) break;
          if (t === 1 && len >= 6 && be32(f, i + 2) > 0) data.impedance = be32(f, i + 2);
          else if (t === 2 && len >= 12) withScaleValues(data, be16(f, i + 2), be16(f, i + 4), be16(f, i + 6), be16(f, i + 8), be16(f, i + 10));
          else if (t === 3 && len >= 3 && f[i + 2] > 0) data.heartRate = f[i + 2];
          i += len;
        }
        last = { kg: data.weightKg, stable: true };
        out.events.push({ type: 'weight', kg: data.weightKg, stable: true });
        if (!(f[17] & 0x80) && data.fatPct == null && !data.impedance) {
          out.events.push({ type: 'error', message: 'The machine could not measure body fat. Stand barefoot on the metal pads and stay still.' });
        }
        out.events.push({ type: 'result', data });
      }
    }

    function oldGen(d, out) {
      const type = d[5];
      if (type === 0xaa || type === 0xa0) {
        if (old.stable) return;
        const kg = be16(d, 1) / 10;
        old.stable = type === 0xaa;
        last = { kg, stable: old.stable };
        out.events.push({ type: 'weight', kg, stable: old.stable });
        if (old.stable) { old.got |= 1; old.data.weightKg = kg; out.writes.push(oldUser(user)); }
      } else if (type === 0xbe) {
        out.events.push({ type: 'error', message: 'The machine could not measure body fat. Stand barefoot on the metal pads and try again.' });
      } else if (type === 0xb0) { old.data.fatPct = be16(d, 1) / 10; old.data.waterPct = be16(d, 3) / 10; old.got |= 2; }
      else if (type === 0xc0) { old.data.musclePct = be16(d, 1) / 10; old.data.boneKg = le16(d, 3) / 10; old.got |= 4; }
      else if (type === 0xd0) { old.data.bmrKcal = be16(d, 1); old.got |= 8; }
      if (old.got === 15) {
        old.got = 16;
        out.events.push({ type: 'result', data: Object.assign({ source: 'Senssun scale' }, old.data) });
      }
    }

    /** Cut complete frames out of the notification stream (frames can arrive in pieces). */
    function senssun(bytes, out) {
      buf = buf.concat(bytes);
      if (buf.length > 600) buf = buf.slice(-300);
      for (;;) {
        let at = -1;
        let kind = '';
        for (let i = 0; i < buf.length - 1 && at < 0; i++) {
          if (buf[i] === 0x10 && buf[i + 1] === 0x00 && buf[i + 2] === 0x00 && buf[i + 3] === 0xc5) { at = i; kind = 'v1'; }
          else if (buf[i] === 0x33 && buf[i + 1] === 0xcc) { at = i; kind = 'v11'; }
          else if (buf[i] === 0xff && buf[i + 1] === 0xa5) { at = i; kind = 'old'; }
        }
        if (at < 0) { buf = buf.slice(-3); return; }
        buf = buf.slice(at);
        if (kind === 'old') {
          if (buf.length < 8) return;
          family = family || 'old';
          oldGen(buf.slice(1, 8), out);
          buf = buf.slice(8);
          continue;
        }
        const lenAt = kind === 'v1' ? 4 : 2;
        if (buf.length <= lenAt) return;
        const len = buf[lenAt];
        if (len < 8) { buf = buf.slice(2); continue; }
        if (buf.length < len) return; // wait for the rest
        const f = buf.slice(0, len);
        if (sum(f, lenAt, len - 2) !== f[len - 1]) { buf = buf.slice(2); continue; }
        buf = buf.slice(len);
        family = kind;
        hello(kind, out);
        if (kind === 'v1') v1(f, out); else v11(f, out);
      }
    }

    return {
      /** Frames to send once the scale is connected (when the advertisement told us the variant). */
      start() {
        const out = { events: [], writes: [] };
        if (info && (info.proto === 'v1' || info.proto === 'v11')) { family = info.proto; hello(family, out); }
        return out.writes;
      },
      /** Feed one notification. */
      feed(charUuid, bytes) {
        const c = short(charUuid);
        const out = { events: [], writes: [] };
        if (c === 'fff1' || c === 'fff3' || c === 'ffb2') { senssun(bytes, out); return out; }
        if (c === '2a9d') {
          const w = parseWeightMeasurement(bytes);
          if (!w) return out;
          last = { kg: w.weightKg, stable: true };
          old.data.weightKg = w.weightKg;
          out.events.push({ type: 'weight', kg: w.weightKg, stable: true });
          out.events.push({ type: 'result', data: Object.assign({ source: 'Bluetooth scale' }, old.data) });
        } else if (c === '2a9c') {
          const bc = parseBodyComposition(bytes);
          if (!bc) return out;
          Object.assign(old.data, bc);
          if (old.data.weightKg) out.events.push({ type: 'result', data: Object.assign({ source: 'Bluetooth scale' }, old.data) });
        }
        return out;
      },
      /** Feed one advertisement of a broadcast-only scale. */
      feedAdvert(advInfo) {
        const out = { events: [], writes: [] };
        const w = parseBroadcast(advInfo);
        if (!w) return out;
        if (w.overload) { out.events.push({ type: 'error', message: 'Overload: the weight is above the machine\'s limit.' }); return out; }
        if (!w.stable || w.kg < 1) latched = false;
        if (w.kg < 1) return out;
        if (!latched) out.events.push({ type: 'weight', kg: w.kg, stable: w.stable });
        last = { kg: w.kg, stable: w.stable };
        if (w.stable && w.impedance > 0 && !latched) {
          latched = true;
          out.events.push({ type: 'result', data: { source: 'Senssun scale', weightKg: w.kg, impedance: w.impedance } });
        }
        return out;
      },
      /** Whatever has arrived so far: weight only, when the scale sent no body-fat values. */
      partial() { return last && last.kg >= 1 ? { source: 'Scale (weight only)', weightKg: last.kg } : null; },
      /** True when a stable weight is showing but no result was reported (broadcast scale without impedance). */
      stableWithoutResult() { return !!(last && last.stable && !latched); },
      latch() { latched = true; },
      reset() { buf = []; last = null; latched = false; old = { got: 0, data: {}, stable: false }; },
    };
  }

  /** Pick the protocols from the services a connected scale offers. */
  function pickKinds(serviceUuids) {
    const have = serviceUuids.map(short);
    return Object.keys(SERVICES).filter((k) => have.includes(SERVICES[k].service));
  }

  const api = {
    SERVICES, KNOWN_SERVICES, full, short, toHex, fromHex,
    parseAdvert, parseBroadcast, v1AddUser, v11AddUser, v11Time, v11Ack, v11Frame, oldUser,
    parseWeightMeasurement, parseBodyComposition, createSession, pickKinds,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ScaleProtocol = api;
})(typeof self !== 'undefined' ? self : this);
