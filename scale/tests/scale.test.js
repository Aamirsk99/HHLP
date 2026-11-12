const test = require('node:test');
const assert = require('node:assert');
const P = require('../js/protocol.js');
const M = require('../js/metrics.js');

const user = { age: 42, heightCm: 168, sex: 'male' };
const H = (hex) => P.fromHex(hex);
const types = (r) => r.events.map((e) => e.type);
const keyed = (rows) => { const o = {}; rows.forEach((r) => { o[r.key] = r; }); return o; };

test('advertisement tells the model and protocol variant', () => {
  const b = P.parseAdvert(H('0001010311A1B2C3D4E5F602198701F4A1'));
  assert.deepStrictEqual([b.model, b.proto, b.broadcast, b.mac], ['0311', 'broadcast2', true, 'a1b2c3d4e5f6']);
  assert.strictEqual(P.parseAdvert(H('0001010328A1B2C3D4E5F6')).proto, 'broadcast1');
  assert.strictEqual(P.parseAdvert(H('0001010303A1B2C3D4E5F6')).proto, 'v1');
  assert.strictEqual(P.parseAdvert(H('0001110321A1B2C3D4E5F6')).proto, 'v11');
  assert.strictEqual(P.parseAdvert(H('0001300326A1B2C3D4E5F6')).proto, 'v30');
  assert.strictEqual(P.parseAdvert(H('4c000215aabbccddeeff00112233')), null); // someone else's beacon
  assert.strictEqual(P.parseAdvert([]), null);
});

test('broadcast scales: weight, stable flag and impedance from the advertisement', () => {
  const v2 = P.parseAdvert(H('0001010311A1B2C3D4E5F602198701F4A1'));
  assert.deepStrictEqual(P.parseBroadcast(v2), { kg: 65.35, stable: true, impedance: 500 });
  const v1 = P.parseAdvert(H('0001010328A1B2C3D4E5F602198701F48101'));
  assert.deepStrictEqual(P.parseBroadcast(v1), { kg: 65.35, stable: true, impedance: 500 });

  const s = P.createSession(user, v2);
  let r = s.feedAdvert(P.parseAdvert(H('0001010311A1B2C3D4E5F6021900000001'))); // moving
  assert.deepStrictEqual(r.events, [{ type: 'weight', kg: 64, stable: false }]);
  r = s.feedAdvert(v2);
  assert.deepStrictEqual(types(r), ['weight', 'result']);
  assert.deepStrictEqual(r.events[1].data, { source: 'Senssun scale', weightKg: 65.35, impedance: 500 });
  assert.deepStrictEqual(s.feedAdvert(v2).events, []); // repeats while the person keeps standing
  s.feedAdvert(P.parseAdvert(H('0001010311A1B2C3D4E5F6020000000001'))); // stepped off
  assert.deepStrictEqual(types(s.feedAdvert(v2)), ['weight', 'result']); // next person
});

test('broadcast scale without impedance: stable weight is offered as weight only', () => {
  const s = P.createSession(user);
  const r = s.feedAdvert(P.parseAdvert(H('0001010311A1B2C3D4E5F60219870000A1')));
  assert.deepStrictEqual(types(r), ['weight']);
  assert.strictEqual(s.stableWithoutResult(), true);
  assert.deepStrictEqual(s.partial(), { source: 'Scale (weight only)', weightKg: 65.35 });
});

test('v1: live weight, user frame and final result', () => {
  const s = P.createSession(user);
  let r = s.feed('fff1', H('100000C50E0380028D000001A0C1'));
  assert.deepStrictEqual(r.events, [{ type: 'weight', kg: 65.3, stable: false }]);
  assert.strictEqual(r.writes.length, 1); // the scale is told who is standing on it, once
  const u = r.writes[0];
  assert.deepStrictEqual(u.slice(0, 17), [0x10, 0, 0, 0xc5, 0x13, 0x03, 0x01, 0x00, 0x01, 0x00, 0x01, 1, 168, 42, 0, 0, 0]);
  assert.strictEqual(u[18], u.slice(4, 18).reduce((a, b) => a + b, 0) & 0xff);

  r = s.feed('fff1', H('100000C50E03801987000011AAEC'));
  assert.deepStrictEqual(r.events, [{ type: 'weight', kg: 65.35, stable: true }]);
  assert.strictEqual(r.writes.length, 0);

  r = s.feed('fff1', H('100000C51E0382001234198700D201F40226015E002805DC0000000011F1'));
  assert.deepStrictEqual(r.events[1], { type: 'result', data: {
    source: 'Senssun scale', weightKg: 65.35, fatPct: 21, waterPct: 55, musclePct: 35, bonePct: 4, bmrKcal: 1500, impedance: 500,
  } });
});

test('v1: frames split across notifications, bad checksum, stored records', () => {
  const s = P.createSession(user);
  assert.deepStrictEqual(s.feed('fff1', H('100000C50E0380')).events, []);
  assert.deepStrictEqual(types(s.feed('fff1', H('1987000011AAEC'))), ['weight']);
  assert.deepStrictEqual(s.feed('fff1', H('100000C50E03801987000011AA00')).events, []); // wrong checksum
  const stored = H('100000C51E0382051234198700D201F40226015E002805DC0000000011');
  stored.push(stored.slice(4).reduce((a, b) => a + b, 0) & 0xff);
  assert.deepStrictEqual(s.feed('fff1', stored).events, []); // sn 5 = history record
});

test('0x0F variant: time sync goes out before the user frame', () => {
  const clock = () => ({ getTimezoneOffset: () => -330, getTime: () => 1700000000000 });
  const w = P.createSession(user, P.parseAdvert(H('00010F0303A1B2C3D4E5F6')), clock).start();
  assert.strictEqual(P.toHex(w[0]).slice(0, 26), '100000c50e030a014a6553f100');
  assert.strictEqual(w[1][6], 0x01);
});

test('v1 female user frame', () => {
  assert.strictEqual(P.v1AddUser({ sex: 'female', age: 30, heightCm: 160 }, 60.5)[11], 0);
  assert.deepStrictEqual(P.v1AddUser(user, 65.3).slice(16, 18), [0x02, 0x8d]);
});

test('v11: time sync and user on connect, live weight, final result with ACK', () => {
  const clock = () => ({ getTimezoneOffset: () => -60, getTime: () => 1700000000000 });
  const s = P.createSession(user, P.parseAdvert(H('0001110321A1B2C3D4E5F6')), clock);
  const hello = s.start();
  assert.strictEqual(P.toHex(hello[0]), '33cc0f0002001001003c6553f10007');
  assert.deepStrictEqual(hello[1].slice(0, 16), [0x33, 0xcc, 0x11, 0, 3, 0, 0x01, 0x01, 0x00, 0x00, 0x01, 1, 168, 42, 0, 1]);

  let r = s.feed('fff1', H('33CC11000100800019873847020102 8036'));
  assert.deepStrictEqual(r.events, [{ type: 'weight', kg: 65.35, stable: true }]);
  assert.strictEqual(r.writes.length, 0);

  const final = P.v11Frame(7, 0x81, H('01 FFFF 1987 3847 02 01 02 80 6553F100' + '0E01 000001F4 00000000 00000000' + '0C02 00D2 0226 015E 0028 05DC' + '0303 48'));
  r = s.feed('fff1', final);
  assert.strictEqual(P.toHex(r.writes[0]), '33cc0b000400ff81000796'); // ACK with the scale's sequence number
  assert.deepStrictEqual(r.events[1].data, {
    source: 'Senssun scale', weightKg: 65.35, impedance: 500, fatPct: 21, waterPct: 55, musclePct: 35, bonePct: 4, bmrKcal: 1500, heartRate: 72,
  });
  assert.strictEqual(P.toHex(P.v11Ack(5, 0x81, 0x00, 0x07)), '33cc0b000500ff81000797');
});

test('v11 without a known advertisement: the first frame triggers the hello', () => {
  const s = P.createSession(user);
  assert.deepStrictEqual(s.start(), []);
  const r = s.feed('fff1', H('33CC110001008000198738470201028036'));
  assert.strictEqual(r.writes.length, 2);
});

test('first-generation scales (FF A5 frames)', () => {
  const s = P.createSession(user);
  const f = (d1, d2, d3, d4, type) => [0xff, 0xa5, d1, d2, d3, d4, type, 0, 0];
  let r = s.feed('fff1', f(0x02, 0xea, 0, 0, 0xaa));
  assert.deepStrictEqual(r.events, [{ type: 'weight', kg: 74.6, stable: true }]);
  assert.deepStrictEqual(r.writes, [P.oldUser(user)]);
  s.feed('fff1', f(0x00, 0xf8, 0x02, 0x09, 0xb0));
  s.feed('fff1', f(0x01, 0x80, 0x1d, 0x00, 0xc0));
  r = s.feed('fff1', f(0x06, 0x2e, 0, 0, 0xd0));
  assert.deepStrictEqual(r.events[0].data, { source: 'Senssun scale', weightKg: 74.6, fatPct: 24.8, waterPct: 52.1, musclePct: 38.4, boneKg: 2.9, bmrKcal: 1582 });
});

test('standard Weight Scale and Body Composition services', () => {
  assert.deepStrictEqual(P.parseWeightMeasurement([0x00, 0x48, 0x3a]), { weightKg: 74.6 });
  assert.deepStrictEqual(P.parseBodyComposition([0x10, 0x04, 0xf8, 0x00, 0x80, 0x01, 0x48, 0x3a]), { fatPct: 24.8, musclePct: 38.4, weightKg: 74.6 });
  assert.strictEqual(P.createSession(user).feed(P.full('2a9d'), [0x00, 0x48, 0x3a]).events[1].data.weightKg, 74.6);
});

test('pickKinds, hex helpers', () => {
  assert.deepStrictEqual(P.pickKinds([P.full('1800'), P.full('fff0')]), ['senssun']);
  assert.deepStrictEqual(P.pickKinds([P.full('180a')]), []);
  assert.deepStrictEqual(P.fromHex(P.toHex([0xff, 0xa5, 0x00])), [0xff, 0xa5, 0x00]);
});

test('impedance-only reading: fat and water are estimated and marked', () => {
  const rows = M.buildRows({ weightKg: 65.35, impedance: 500 }, { age: 30, heightCm: 170, sex: 'male' });
  const by = keyed(rows);
  assert.strictEqual(by.fat.label, 'Body fat (estimated)');
  assert.strictEqual(by.fat.estimated, true);
  assert.ok(by.fat.value > 8 && by.fat.value < 30, 'plausible fat % for 65 kg / 170 cm / 500 ohm: ' + by.fat.value);
  assert.ok(by.water.value > 45 && by.water.value < 70, 'plausible water %: ' + by.water.value);
  assert.strictEqual(by.impedance.value, 500);
  // nothing is estimated without sex/height, or with an implausible impedance
  assert.strictEqual(M.estimateFromImpedance(65, 170, '', 500), null);
  assert.strictEqual(M.estimateFromImpedance(65, 170, 'male', 20), null);
  // the scale's own values win over the estimate, and bone % becomes kg
  const own = keyed(M.buildRows({ weightKg: 65.35, impedance: 500, fatPct: 21, bonePct: 4 }, { age: 30, heightCm: 170, sex: 'male' }));
  assert.strictEqual(own.fat.value, 21);
  assert.strictEqual(own.fat.estimated, undefined);
  assert.strictEqual(own.bone.value, 2.6);
});

test('height entry: cm or feet.inches', () => {
  assert.strictEqual(M.heightToCm('170'), 170);
  assert.strictEqual(M.heightToCm('5.7'), 170);
  assert.strictEqual(M.heightToCm("5'7\""), 170);
  assert.strictEqual(M.heightToCm('5 ft 10 in'), 178);
  assert.strictEqual(M.heightToCm('5'), 152);
  assert.strictEqual(M.heightToCm(''), null);
  assert.strictEqual(M.heightToCm('abc'), null);
});


test('rows: machine values are kept, the rest is calculated from them', () => {
  const by = keyed(M.buildRows({ weightKg: 74.6, fatPct: 24.8, waterPct: 52.1, musclePct: 38.4, boneKg: 2.9, bmrKcal: 1582 }, user));
  assert.strictEqual(by.bmi.value, 26.4);
  assert.strictEqual(by.bmi.status, 'Obese');
  assert.strictEqual(by.fat.status, 'High'); // male 40-59: 12-23
  assert.deepStrictEqual([by.water.value, by.water.calculated], [52.1, false]);
  assert.deepStrictEqual([by.skeletal.value, by.skeletal.calculated], [38.4, false]); // a machine value under 62 % is skeletal muscle
  assert.deepStrictEqual([by.bone.value, by.bone.calculated], [2.9, false]);
  assert.deepStrictEqual([by.bmr.value, by.bmr.calculated], [1582, false]);
  assert.strictEqual(by.lean.value, 56.1);
  assert.strictEqual(by.muscle.value, 71.3); // lean mass without minerals
  assert.strictEqual(by.amr.value, 2057);
  assert.strictEqual(by.standard.value, 62.1);
  assert.strictEqual(by.weightControl.value, '−12.5');
  assert.strictEqual(by.visceral, undefined); // never invented
});

test('rows: lean mass splits into water, protein and minerals', () => {
  // the composition shown by the MovingLife app for 76 kg, 45.7 % fat
  const by = keyed(M.buildRows({ weightKg: 76, fatPct: 45.7 }, { age: 60, sex: 'female', heightCm: 152 }));
  assert.strictEqual(by.bmi.value, 32.9);
  assert.strictEqual(by.lean.value, 41.3);
  assert.strictEqual(by.water.value, 40);
  assert.strictEqual(by.protein.value, 11);
  assert.strictEqual(by.bonePct.value, 3.3);
  assert.strictEqual(by.bone.value, 2.5);
  assert.strictEqual(by.muscle.value, 51);
  assert.strictEqual(by.type.value, 'Obesity');
  assert.ok(by.score.value < 60 && by.bodyAge.value > 60);
  assert.strictEqual(by.fatControl.group, 'manage');
});

test('rows: weight only still gives BMI, BMR and standard weight; nothing invented', () => {
  const rows = M.buildRows({ weightKg: 60 }, { age: 30, heightCm: 160, sex: 'female' });
  assert.deepStrictEqual(rows.map((r) => r.key), ['weight', 'bmi', 'bmr', 'amr', 'standard', 'weightControl']);
  assert.deepStrictEqual([rows[2].value, rows[2].calculated], [1289, true]);
  assert.deepStrictEqual(M.buildRows({ weightKg: 60 }, {}).map((r) => r.key), ['weight']);
  assert.deepStrictEqual(M.buildRows({}, user), []);
});
