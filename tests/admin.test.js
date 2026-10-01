// Clinic admin (admin/js/core.js): loads in Node, branded The Prime Fit, with its own storage.
const test = require('node:test');
const assert = require('node:assert');
const A = require('../admin/js/core.js');

test('new clinic admin data is branded The Prime Fit', () => {
  const admin = A.createAdmin(A.memoryStorage());
  assert.strictEqual(admin.state.settings.clinic, 'The Prime Fit');
});

test('The Prime Fit keeps its own data, apart from the old Hindivine apps', () => {
  assert.strictEqual(A.KEY, 'primefit.admin.v1');
  const admin = A.createAdmin(A.memoryStorage());
  assert.strictEqual(JSON.parse(admin.exportBackup()).app, 'primefit-admin');
});

const fresh = () => A.createAdmin(A.memoryStorage());

test('a service with no stock limit sells without stock and stays off stock alerts', () => {
  const admin = fresh();
  const m = admin.saveMember({ name: 'Asha' });
  const it = admin.saveItem({ name: 'Body scan', category: 'Protein', kind: 'protein', price: 500, track: false });
  assert.strictEqual(admin.stockOf(it.id), Infinity);
  admin.saveSale({ type: 'protein', itemId: it.id, qty: 3, amount: 1500, refId: m.id, patientName: 'Ravi', mobile: '9876543210' });
  assert.ok(!admin.lowStock().some((x) => x.item.id === it.id));
  assert.ok(!admin.dashboard(null).stock.available.some((x) => x.item.id === it.id));
});

test('items and categories move up and down; a deleted item leaves lists and the dashboard', () => {
  const admin = fresh();
  const list = admin.itemsOf('injection', true);
  const [a, b] = [list[0], list[1]];
  admin.moveItem(b.id, -1);
  const after = admin.itemsOf('injection', true).filter((x) => x.category === a.category);
  if (a.category === b.category) assert.strictEqual(after[0].id, b.id);
  const cats = admin.state.categories.map((c) => c.name);
  admin.moveCategory(cats[1], -1);
  assert.strictEqual(admin.state.categories[0].name, cats[1]);
  admin.deleteItem(a.id);
  assert.ok(!admin.itemsOf('injection', true).some((x) => x.id === a.id));
  assert.ok(!admin.stockReport(null).some((x) => x.id === a.id));
});

test('expenses by founder, ads and editing add up by category and by name', () => {
  const admin = fresh();
  admin.saveExpense({ category: 'Founder', name: 'Founder 1', amount: 1000, date: '2026-09-01' });
  admin.saveExpense({ category: 'Founder', name: 'Founder 1', amount: 500, date: '2026-09-02' });
  admin.saveExpense({ category: 'Ads', name: 'Meta Ads', amount: 300, date: '2026-09-02' });
  admin.saveExpense({ category: 'Editing', name: 'New Editor', amount: 200, date: '2026-09-03' });
  const s = admin.expenseSummary({ from: '2026-09-01', to: '2026-09-30' });
  assert.strictEqual(s.total, 2000);
  assert.deepStrictEqual(s.byName.find((x) => x.name === 'Founder 1'), { name: 'Founder 1', amount: 1500, count: 2 });
  assert.strictEqual(s.byCategory.find((x) => x.name === 'Ads').amount, 300);
  assert.ok(admin.state.settings.lists.expenseNames.includes('New Editor'));
});

test('doctor profiles are picked on appointments and videos are counted edited, posted and remaining', () => {
  const admin = fresh();
  const d = admin.saveDoctor({ name: 'Dr. Mehta', speciality: 'Physician', fee: 800 });
  const a = admin.saveAppointment({ date: '2026-09-05', time: '10:00', mode: 'clinic', patientName: 'Ravi', mobile: '9876543210', doctorId: d.id, fee: '' });
  assert.strictEqual(admin.doctorName(a), 'Dr. Mehta');
  admin.saveContent({ title: 'Reel 1', status: 'posted', postedDate: '2026-09-05', date: '2026-09-01', editor: 'Sam', cost: 400 });
  admin.saveContent({ title: 'Reel 2', status: 'scheduled', scheduledDate: '2026-09-05', date: '2026-09-02' });
  admin.saveContent({ title: 'Reel 3', status: 'idea', date: '2026-09-03' });
  const st = admin.contentStats({ from: '2026-09-01', to: '2026-09-30' }, '2026-09-05');
  assert.deepStrictEqual([st.total, st.edited, st.posted, st.remaining, st.dueToday.length], [3, 2, 1, 1, 1]);
  assert.ok(admin.state.expenses.some((e) => e.category === 'Editing' && e.amount === 400 && e.name === 'Sam'));
});
