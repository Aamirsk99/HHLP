/*
 * One Bluetooth interface over two transports:
 *   native — the Android app (MainActivity exposes window.AndroidBle)
 *   web    — Web Bluetooth (Chrome on Android, Windows, Mac, with HTTPS)
 *
 * Events sent to Ble.on(handler):
 *   { type: 'state', state: 'scanning' | 'watching' | 'scan-ended' | 'connecting' | 'connected' | 'disconnected' | 'error', message }
 *   { type: 'device', id, name, rssi, adv }             (native only; adv = manufacturer data bytes)
 *   { type: 'services', services: [{ uuid, chars: [uuid] }] }
 *   { type: 'notify', char, bytes }
 */
(function (root) {
  const P = root.ScaleProtocol;
  let handler = () => {};
  const send = (e) => { try { handler(e); } catch (err) { console.error(err); } };
  const native = root.AndroidBle || null;
  const web = !native && root.navigator && root.navigator.bluetooth ? root.navigator.bluetooth : null;

  // ── Android ──────────────────────────────────────────────────
  if (native) {
    root.BleNative = {
      emit(event, p) {
        if (event === 'state') send({ type: 'state', state: p.state, message: p.message || '' });
        else if (event === 'device') send({ type: 'device', id: p.id, name: p.name, rssi: p.rssi, adv: P.fromHex(p.adv) });
        else if (event === 'services') send({ type: 'services', services: p.services.map((s) => ({ uuid: s.uuid, chars: s.chars.map((c) => c.uuid) })) });
        else if (event === 'log') send({ type: 'log', line: p.line });
        else if (event === 'notify') send({ type: 'notify', char: p.char, bytes: P.fromHex(p.hex) });
      },
    };
  }

  // ── Web Bluetooth ────────────────────────────────────────────
  let device = null;
  let chars = {};

  async function webConnect() {
    try {
      device = await web.requestDevice({ acceptAllDevices: true, optionalServices: P.KNOWN_SERVICES.map(P.full) });
    } catch (e) {
      send({ type: 'state', state: 'scan-ended', message: '' });
      return;
    }
    send({ type: 'state', state: 'connecting', message: '' });
    try {
      device.addEventListener('gattserverdisconnected', () => send({ type: 'state', state: 'disconnected', message: '' }));
      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();
      const found = [];
      chars = {};
      for (const svc of services) {
        const list = await svc.getCharacteristics();
        found.push({ uuid: svc.uuid, chars: list.map((c) => c.uuid) });
        for (const c of list) {
          chars[svc.uuid + '|' + c.uuid] = c;
          if (c.properties.notify || c.properties.indicate) {
            c.addEventListener('characteristicvaluechanged', (ev) => {
              const v = ev.target.value;
              send({ type: 'notify', char: c.uuid, bytes: Array.from(new Uint8Array(v.buffer, v.byteOffset, v.byteLength)) });
            });
            await c.startNotifications();
          }
        }
      }
      send({ type: 'services', services: found });
      send({ type: 'state', state: 'connected', message: device.name || '' });
    } catch (e) {
      send({ type: 'state', state: 'error', message: 'Could not connect to the machine. Wake it up (step on it) and try again.' });
    }
  }

  root.Ble = {
    mode: native ? 'native' : web ? 'web' : 'none',
    on(fn) { handler = fn; },
    /** native: starts a scan and reports devices. web: opens the browser's device chooser and connects. */
    scan() {
      if (native) native.startScan();
      else if (web) webConnect();
      else send({ type: 'state', state: 'error', message: 'Bluetooth is not available here. Install the Android app, or open this page in Chrome.' });
    },
    stopScan() { if (native) native.stopScan(); },
    /** native only: keep listening to a broadcast-only scale's advertisements. */
    watch(id) { if (native) native.watch(id); },
    connect(id) { if (native) native.connect(id); },
    write(service, characteristic, bytes) {
      if (native) { native.write(P.full(P.short(service)), P.full(P.short(characteristic)), P.toHex(bytes)); return; }
      const c = chars[P.full(P.short(service)) + '|' + P.full(P.short(characteristic))];
      if (!c) return;
      const data = new Uint8Array(bytes);
      (c.properties.write ? c.writeValueWithResponse(data) : c.writeValueWithoutResponse(data)).catch(() => {});
    },
    disconnect() {
      if (native) native.disconnect();
      else if (device && device.gatt.connected) device.gatt.disconnect();
    },
  };
})(typeof self !== 'undefined' ? self : this);
