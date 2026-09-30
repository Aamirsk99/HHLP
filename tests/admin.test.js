const test = require('node:test');
const assert = require('node:assert/strict');
const A = require('../admin/js/core.js');

const setup = (day = '2026-09-15') => {
  let now = new Date(`${day}T10:00:00`);
  const admin = A.createAdmin(A.memoryStorage(), () => now);
  admin.setDay = (d) => { now = new Date(`${d}T10:00:00`); };
  return admin;
};
const byName = (admin, name) => admin.state.items.find((i) => i.name === name);

test('default products, inventory and incentives', () => {
  const a = setup();
  const inj = a.itemsOf('injection').map((i) => i.name);
  assert.deepEqual(inj, ['Mounjaro 2.5mg', 'Mounjaro 5mg', 'Mounjaro 10mg', 'Mounjaro 15mg',
    'Wegovy 0.25mg', 'Wegovy 1mg', 'Wegovy 2.4mg', 'Ozempic 0.25mg', 'Ozempic 1mg']);
  const cats = a.state.categories.map((c) => c.name);
  for (const c of ['Needles', 'Alcohol Swabs', 'Insulin Syringes', 'Ice Gel Packs', 'Travel Bags', 'Protein']) assert.ok(cats.includes(c), c);
  assert.equal(a.state.settings.incentive.injection, 1000);
  assert.equal(a.state.settings.incentive.protein, 500);
  assert.deepEqual(a.state.settings.dietPlans.map((p) => [p.name, p.incentive]), [['1 Month', 1000], ['3 Month', 2000]]);
  assert.equal(A.SHEETS.length, 12);
});

test('incentive split: single, 50-50, custom and rounding', () => {
  assert.deepEqual(A.splitIncentive(1000, [{ memberId: 'a', pct: 100 }]), [{ memberId: 'a', pct: 100, amount: 1000 }]);
  assert.deepEqual(A.splitIncentive(1000, [{ memberId: 'a', pct: 50 }, { memberId: 'b', pct: 50 }]).map((x) => x.amount), [500, 500]);
  assert.deepEqual(A.splitIncentive(2000, [{ memberId: 'a', pct: 70 }, { memberId: 'b', pct: 30 }]).map((x) => x.amount), [1400, 600]);
  const odd = A.splitIncentive(1000, [{ memberId: 'a', pct: 1 }, { memberId: 'b', pct: 2 }]);
  assert.equal(odd[0].amount + odd[1].amount, 1000);
});

test('injection sale: stock out, incentive, revenue, new then renewal', () => {
  const a = setup();
  const m = a.saveMember({ name: 'Murshida', designation: 'Counsellor', salary: 25000 });
  const pen = byName(a, 'Mounjaro 15mg');
  assert.throws(() => a.saveSale({ type: 'injection', patientName: 'Asha', mobile: '98765 43210', itemId: pen.id, amount: 17000, refId: m.id }), /in stock/);
  a.adjustStock(pen.id, 3, 'count');
  const s1 = a.saveSale({ type: 'injection', patientName: 'Asha', mobile: '98765 43210', itemId: pen.id, amount: 17000, refId: m.id, date: '2026-09-01' });
  assert.equal(s1.patientType, 'new');
  assert.equal(s1.incentive, 1000);
  assert.equal(a.stockOf(pen.id), 2);
  const s2 = a.saveSale({ type: 'injection', patientName: 'Asha', mobile: '+91 9876543210', itemId: pen.id, amount: 17000, refId: m.id, date: '2026-09-10' });
  assert.equal(s2.patientType, 'renewal');
  assert.equal(a.state.patients.length, 1, 'same mobile = same patient');
  const d = a.dashboard(A.rangeFor('month', '2026-09-15'));
  assert.equal(d.sales.orders, 2);
  assert.equal(d.sales.revenue, 34000);
  assert.equal(d.sales.injection, 34000);
  assert.equal(d.patients.new, 1);
  assert.equal(d.patients.renewal, 1);
  assert.equal(d.team.incentives, 2000);
  assert.equal(d.team.top.name, 'Murshida');
  assert.equal(d.stock.injection, 1);
  a.deleteSale(s2.id);
  assert.equal(a.stockOf(pen.id), 2, 'deleting a sale returns stock');
});

test('shared reference and incentive status off', () => {
  const a = setup();
  const x = a.saveMember({ name: 'A', salary: 10000 });
  const y = a.saveMember({ name: 'B', salary: 10000, incentiveOn: false });
  const plan = a.state.settings.dietPlans.find((p) => p.name === '3 Month');
  const s = a.saveSale({ type: 'diet', patientName: 'Ravi', planId: plan.id, amount: 6000, refId: x.id, sharedId: y.id, sharePct: 40 });
  assert.deepEqual(s.splits.map((v) => [v.name, v.pct, v.amount]), [['A', 60, 1200], ['B', 40, 0]]);
  assert.equal(s.incentive, 1200);
});

test('protein incentive per sale, product override, settings change applies to new sales only', () => {
  const a = setup();
  const m = a.saveMember({ name: 'M', salary: 0 });
  const prot = byName(a, 'Protein Sachets');
  a.adjustStock(prot.id, 100);
  const s1 = a.saveSale({ type: 'protein', patientName: 'P', itemId: prot.id, qty: 30, amount: 3000, refId: m.id });
  assert.equal(s1.incentive, 500);
  a.updateSettings({ incentive: { injection: 1000, protein: 300 } });
  const s2 = a.saveSale({ type: 'protein', patientName: 'Q', itemId: prot.id, qty: 10, amount: 1000, refId: m.id });
  assert.equal(s2.incentive, 300);
  assert.equal(a.state.sales[0].incentive, 500);
  const pen = byName(a, 'Wegovy 2.4mg');
  a.saveItem({ ...pen, incentive: 1500 });
  a.adjustStock(pen.id, 2);
  assert.equal(a.saveSale({ type: 'injection', patientName: 'R', itemId: pen.id, qty: 2, amount: 50000, refId: m.id }).incentive, 3000);
  assert.equal(a.stockOf(prot.id), 60);
});

test('invoice product matching', () => {
  const a = setup();
  const name = (s, k) => (a.matchItem(s, k) || {}).name;
  assert.equal(name('MOUNJARO KWIKPEN 15 MG/0.5ML', 'injection'), 'Mounjaro 15mg');
  assert.equal(name('Mounjaro 2.5 mg inj', 'injection'), 'Mounjaro 2.5mg');
  assert.equal(name('WEGOVY 2.4MG FLEXTOUCH'), 'Wegovy 2.4mg');
  assert.equal(name('Ozempic 0.25 mg pen'), 'Ozempic 0.25mg');
  assert.equal(name('Alcohol swab 100s'), 'Alcohol Swabs');
  assert.equal(name('BD Insulin Syringe 1ml'), 'Insulin Syringes');
  assert.equal(name('Mounjaro 7.5mg'), undefined, 'no such dose');
  assert.equal(name('Paracetamol 500mg'), undefined);
});

test('purchase adds stock and expense; duplicate invoices are refused', () => {
  const a = setup();
  const pen = byName(a, 'Mounjaro 15mg');
  const p = a.savePurchase({ vendor: 'Pharma Dist', invoiceNo: 'INV-7', date: '2026-09-05',
    lines: [{ itemId: pen.id, qty: 2, rate: 10000, gst: 12, batch: 'B1', expiry: '2027-06' }] });
  assert.equal(a.stockOf(pen.id), 2);
  assert.equal(p.total, 22400);
  const e = a.state.expenses.find((x) => x.ref === p.id);
  assert.equal(e.category, 'Injection Purchase');
  assert.equal(e.amount, 22400);
  assert.throws(() => a.savePurchase({ vendor: 'pharma dist', invoiceNo: 'inv-7', lines: [{ itemId: pen.id, qty: 1 }] }), /already saved/);
  a.deletePurchase(p.id);
  assert.equal(a.stockOf(pen.id), 0);
  assert.equal(a.state.expenses.length, 0);
});

test('salary = salary + incentive; booking expenses; profit', () => {
  const a = setup();
  const m = a.saveMember({ name: 'Murshida', salary: 25000 });
  const plan = a.state.settings.dietPlans[0];
  const pen = byName(a, 'Mounjaro 5mg');
  a.adjustStock(pen.id, 20, '', '2026-09-01');
  for (let i = 0; i < 16; i++) a.saveSale({ type: 'injection', patientName: `P${i}`, itemId: pen.id, amount: 5000, refId: m.id, date: '2026-09-02' });
  a.saveSale({ type: 'diet', patientName: 'D', planId: plan.id, amount: 3000, refId: m.id, date: '2026-09-03' });
  a.saveSale({ type: 'diet', patientName: 'E', planId: plan.id, amount: 3000, refId: m.id, date: '2026-09-03' });
  const row = a.salarySheet('2026-09').find((r) => r.name === 'Murshida');
  assert.deepEqual([row.salary, row.incentive, row.total], [25000, 18000, 43000]);
  a.postSalary('2026-09');
  a.postSalary('2026-09'); // idempotent
  a.saveExpense({ category: 'Rent', amount: 15000, date: '2026-09-01' });
  const f = a.financialReport(A.monthRange('2026-09'));
  assert.equal(f.revenue, 86000);
  assert.equal(f.expenses, 25000 + 18000 + 15000);
  assert.equal(f.profit, 86000 - 58000);
  assert.equal(f.byCategory.Salary, 25000);
  assert.equal(f.byCategory.Incentive, 18000);
});

test('renewal reminders at 60 and 90 days', () => {
  const a = setup('2026-01-01');
  const m = a.saveMember({ name: 'Ref' });
  const pen = byName(a, 'Wegovy 1mg');
  a.adjustStock(pen.id, 5, '', '2026-01-01');
  a.saveSale({ type: 'injection', patientName: 'A', mobile: '9000000001', itemId: pen.id, amount: 1, refId: m.id, date: '2026-01-01' });
  a.saveSale({ type: 'injection', patientName: 'B', mobile: '9000000002', itemId: pen.id, amount: 1, refId: m.id, date: '2026-02-10' });
  const r = a.renewals('2026-04-05');
  const get = (n) => r.find((x) => x.name === n);
  assert.equal(get('A').stage, 90);
  assert.equal(get('A').days, 94);
  assert.equal(get('A').ref, 'Ref');
  assert.equal(get('B').stage, 0, '54 days: not yet');
  assert.equal(a.renewals('2026-04-11').find((x) => x.name === 'B').stage, 60);
  a.markRenewal(get('A').saleId, 90, true);
  assert.equal(a.renewals('2026-04-05').find((x) => x.name === 'A').done, true);
});

test('stock report and Google Sheets data', () => {
  const a = setup();
  const m = a.saveMember({ name: 'Z' });
  const pen = byName(a, 'Ozempic 1mg');
  a.saveItem({ ...pen, opening: 4 });
  a.savePurchase({ vendor: 'V', invoiceNo: '1', date: '2026-09-02', lines: [{ itemId: pen.id, qty: 3, rate: 100 }] });
  a.saveSale({ type: 'injection', patientName: 'X', itemId: pen.id, amount: 9000, refId: m.id, date: '2026-09-03' });
  const r = a.stockReport(A.monthRange('2026-09')).find((x) => x.name === 'Ozempic 1mg');
  assert.deepEqual([r.opening, r.purchased, r.sold, r.current], [4, 3, 1, 6]);
  const sheets = a.sheetsData();
  assert.deepEqual(Object.keys(sheets), A.SHEETS);
  assert.equal(sheets['Injection Sales'].length, 2);
  assert.equal(sheets['Injection Sales'][1][4], 'Ozempic 1mg');
  for (const rows of Object.values(sheets)) rows.forEach((row) => assert.equal(row.length, rows[0].length));
});

test('backup round trip keeps secrets out of the file', () => {
  const a = setup();
  a.updateSettings({ apiKey: 'sk-secret' });
  a.saveMember({ name: 'Kept' });
  const text = a.exportBackup();
  assert.ok(!text.includes('sk-secret'));
  const b = setup();
  b.importBackup(text);
  assert.equal(b.state.team[0].name, 'Kept');
  assert.throws(() => b.importBackup('{"x":1}'), /not a Hindivine Admin backup/);
});
