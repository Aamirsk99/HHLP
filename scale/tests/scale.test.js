const test = require('node:test');
const assert = require('node:assert');
const P = require('../js/protocol.js');
const M = require('../js/metrics.js');

const user = { age: 42, heightCm: 168, sex: 'male' };
// FF A5 <d1..d4> <type> <pad> : one Senssun notification
const frame = (d1, d2, d3, d4, type) => [0xff, 0xa5, d1, d2, d3, d4, type, 0x00, 0x00];

test('Senssun: unstable weight, then stable weight asks for the user frame', () => {
  const s = P.createSession(user);
  let r = s.feed(P.full('fff1'), frame(0x02, 0xe0, 0, 0, 0xa0)); // 73.6 kg, still moving
  assert.deepStrictEqual(r.events, [{ type: 'weight', kg: 73.6, stable: false }]);
  assert.strictEqual(r.writes.length, 0);
  r = s.feed(P.full('fff1'), frame(0x02, 0xea, 0, 0, 0xaa)); // 74.6 kg, stable
  assert.deepStrictEqual(r.events, [{ type: 'weight', kg: 74.6, stable: true }]);
  assert.deepStrictEqual(r.writes, [P.senssunUser(user)]);
});

test('Senssun: full measurement gives weight, fat, water, muscle, bone and BMR', () => {
  const s = P.createSession(user);
  s.feed('fff1', frame(0x02, 0xea, 0, 0, 0xaa));
  s.feed('fff1', frame(0x00, 0xf8, 0x02, 0x09, 0xb0)); // fat 24.8, water 52.1
  s.feed('fff1', frame(0x01, 0x80, 0x1d, 0x00, 0xc0)); // muscle 38.4, bone 2.9 (little-endian)
  const r = s.feed('fff1', frame(0x06, 0x2e, 0, 0, 0xd0)); // 1582 kcal
  assert.deepStrictEqual(r.events, [{ type: 'result', data: {
    source: 'Senssun scale', weightKg: 74.6, fatPct: 24.8, waterPct: 52.1, musclePct: 38.4, boneKg: 2.9, bmrKcal: 1582,
  } }]);
  // repeated frames do not report the result twice
  assert.strictEqual(s.feed('fff1', frame(0x06, 0x2e, 0, 0, 0xd0)).events.length, 0);
});

test('Senssun: weight only is available as a partial reading', () => {
  const s = P.createSession(user);
  assert.strictEqual(s.partial(), null);
  s.feed('ffb2', frame(0x02, 0xea, 0, 0, 0xaa));
  assert.strictEqual(s.partial().weightKg, 74.6);
});

test('Senssun: body-fat error frame', () => {
  const r = P.createSession(user).feed('fff1', frame(0, 0, 0, 0, 0xbe));
  assert.strictEqual(r.events[0].type, 'error');
});

test('Senssun command frames carry the checksum', () => {
  const u = P.senssunUser(user);
  assert.deepStrictEqual(u, [0xa5, 0x10, 0xf1, 42, 168, 0, 0, (0x10 + 0xf1 + 42 + 168) & 0xff, 0]);
  assert.strictEqual(P.senssunUser({ age: 30, heightCm: 160, sex: 'female' })[2], 0x01);
  const d = P.senssunDate(new Date(2026, 10, 12)); // 12 Nov 2026 = day 316
  assert.deepStrictEqual(d.slice(0, 5), [0xa5, 0x30, 26, 0x01, 0x3c]);
  assert.deepStrictEqual(P.senssunTime(new Date(2026, 0, 1, 9, 5, 7)).slice(1, 5), [0x31, 9, 5, 7]);
});

test('standard Weight Scale and Body Composition services', () => {
  assert.deepStrictEqual(P.parseWeightMeasurement([0x00, 0x48, 0x3a]), { weightKg: 74.6 }); // 14920 * 0.005
  const bc = P.parseBodyComposition([0x10, 0x04, 0xf8, 0x00, 0x80, 0x01, 0x48, 0x3a]); // muscle % + weight
  assert.deepStrictEqual(bc, { fatPct: 24.8, musclePct: 38.4, weightKg: 74.6 });
  const s = P.createSession(user);
  const r = s.feed(P.full('2a9d'), [0x00, 0x48, 0x3a]);
  assert.strictEqual(r.events[1].data.weightKg, 74.6);
});

test('pickKinds, hex helpers', () => {
  assert.deepStrictEqual(P.pickKinds([P.full('1800'), P.full('fff0')]), ['senssunA']);
  assert.deepStrictEqual(P.pickKinds([P.full('180a')]), []);
  assert.deepStrictEqual(P.fromHex(P.toHex([0xff, 0xa5, 0x00])), [0xff, 0xa5, 0x00]);
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

test('rows: BMI, fat status and derived values', () => {
  const rows = M.buildRows({ weightKg: 74.6, fatPct: 24.8, waterPct: 52.1, musclePct: 38.4, boneKg: 2.9, bmrKcal: 1582 }, user);
  const by = {};
  rows.forEach((r) => { by[r.key] = r; });
  assert.strictEqual(by.bmi.value, 26.4);
  assert.strictEqual(by.bmi.status, 'Obese');
  assert.strictEqual(by.fat.status, 'High'); // male 40-59: 12-23
  assert.strictEqual(by.fatMass.value, 18.5);
  assert.strictEqual(by.lean.value, 56.1);
  assert.strictEqual(by.bmr.value, 1582);
  assert.strictEqual(by.bmr.calculated, false);
});

test('rows: weight only still gives BMI and a calculated BMR; nothing invented', () => {
  const rows = M.buildRows({ weightKg: 60 }, { age: 30, heightCm: 160, sex: 'female' });
  assert.deepStrictEqual(rows.map((r) => r.key), ['weight', 'bmi', 'ideal', 'bmr']);
  assert.strictEqual(rows[3].value, 1289);
  assert.strictEqual(rows[3].calculated, true);
  assert.deepStrictEqual(M.buildRows({ weightKg: 60 }, {}).map((r) => r.key), ['weight']);
  assert.deepStrictEqual(M.buildRows({}, user), []);
});
