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
// A clinic that has added its own injection and protein types, products and diet plans.
const stocked = () => {
  const admin = fresh();
  admin.saveKind({ name: 'Injection' });
  admin.saveKind({ name: 'Protein' });
  ['Mounjaro 2.5mg', 'Mounjaro 5mg'].forEach((name) => admin.saveItem({ name, category: 'Injection', kind: 'injection', price: 3500, unit: 'pen' }));
  admin.saveItem({ name: 'Protein Sachets', category: 'Protein', kind: 'protein', price: 100, unit: 'sachet' });
  admin.saveDietPlan({ name: '1 Month', months: 1, price: 2000, incentive: 500 });
  admin.saveDietPlan({ name: '3 Month', months: 3, price: 5000, incentive: 1000 });
  return admin;
};

test('a service with no stock limit sells without stock and stays off stock alerts', () => {
  const admin = stocked();
  const m = admin.saveMember({ name: 'Asha' });
  const it = admin.saveItem({ name: 'Body scan', category: 'Protein', kind: 'protein', price: 500, track: false });
  assert.strictEqual(admin.stockOf(it.id), Infinity);
  admin.saveSale({ type: 'protein', itemId: it.id, qty: 3, amount: 1500, refId: m.id, patientName: 'Ravi', mobile: '9876543210' });
  assert.ok(!admin.lowStock().some((x) => x.item.id === it.id));
  assert.ok(!admin.dashboard(null).stock.available.some((x) => x.item.id === it.id));
});

test('items and categories move up and down; a deleted item leaves lists and the dashboard', () => {
  const admin = stocked();
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
  assert.deepStrictEqual(s.byName.find((x) => x.name === 'Founder 1'), { name: 'Founder 1', amount: 1500, count: 2, counted: true });
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

test('expenses switched off are left out of totals and profit', () => {
  const admin = fresh();
  admin.saveExpense({ category: 'Ads', name: 'Meta Ads', amount: 300, date: '2026-09-02' });
  admin.saveExpense({ category: 'Founder', name: 'Founder 1', amount: 1000, date: '2026-09-02' });
  admin.saveExpense({ category: 'Rent', amount: 50, date: '2026-09-02', noCount: true });
  const r = { from: '2026-09-01', to: '2026-09-30' };
  admin.setExpenseCounted('category', 'Founder', false);
  assert.strictEqual(admin.expenseSummary(r).total, 300);
  assert.strictEqual(admin.expenseSummary(r).all, 1350);
  assert.strictEqual(admin.financialReport(r).expenses, 300);
  admin.setExpenseCounted('category', 'Founder', true);
  admin.setExpenseCounted('name', 'Meta Ads', false);
  assert.strictEqual(admin.financialReport(r).expenses, 1000);
});

test('editors get a fee per video (default 150) booked when the video is received', () => {
  const admin = fresh();
  const ed = admin.saveEditor({ name: 'Sam' });
  const c = admin.saveContent({ title: 'Reel', editorId: ed.id, status: 'edited', date: '2026-09-01', cost: '' });
  assert.strictEqual(c.cost, 150);
  assert.strictEqual(c.editor, 'Sam');
  const c2 = admin.saveContent({ title: 'Reel 2', editorId: ed.id, status: 'edited', cost: 200 });
  assert.strictEqual(c2.cost, 200);
  const waiting = admin.saveContent({ title: 'Reel 3', editorId: ed.id, status: 'idea', cost: '' });
  assert.strictEqual(waiting.cost, 0);
  assert.ok(admin.sheetsData().Editors[1][3] === 2);
});

test('logins sign in by user ID and passwords are never kept in plain text', () => {
  const admin = fresh();
  assert.strictEqual(admin.accountByUsername('SuperAdmin').id, 'super');
  const a = admin.saveAccount({ name: 'Riya Shah', role: 'editor' });
  assert.strictEqual(a.username, 'riyashah');
  admin.setAccountPin(a.id, 'h', 's', 6, 'secret1');
  assert.strictEqual(admin.account(a.id).pin, '');
  assert.throws(() => admin.saveAccount({ name: 'Other', username: 'riyashah', role: 'desk' }), /taken/);
});

test('purchases can switch GST off and diet plans move and delete', () => {
  const admin = stocked();
  const it = admin.itemsOf('protein', true)[0];
  const p = admin.savePurchase({ vendor: 'V', lines: [{ itemId: it.id, qty: 2, rate: 100, gst: 18 }], gstOff: true });
  assert.strictEqual(p.total, 200);
  const ids = admin.state.settings.dietPlans.map((x) => x.id);
  admin.moveDietPlan(ids[1], -1);
  assert.strictEqual(admin.state.settings.dietPlans[0].id, ids[1]);
  admin.deleteDietPlan(ids[0]);
  assert.ok(!admin.state.settings.dietPlans.some((x) => x.id === ids[0]));
});

test('GLP-1 packages are services; percent incentives, daily salary and package renewals work', () => {
  const admin = fresh();
  const pk = admin.itemsOf('service', true);
  assert.strictEqual(pk.length, 4);
  assert.deepStrictEqual(pk.map((i) => i.price), [1499, 2999, 4500, 5999]);
  assert.strictEqual(pk[1].mrp, 5000);
  const m = admin.saveMember({ name: 'Riya', salaryType: 'daily', salary: 800, incentiveType: 'percent', incPercent: 10 });
  const s = admin.saveSale({ type: 'service', patientName: 'Asha', mobile: '9876543210', itemId: pk[0].id, qty: 1, amount: 1499, date: admin.today(), refId: m.id });
  assert.strictEqual(s.splits[0].amount, 150);
  admin.setWorkDays(admin.today().slice(0, 7), m.id, 20);
  const row = admin.salarySheet(admin.today().slice(0, 7)).find((r) => r.memberId === m.id);
  assert.strictEqual(row.salary, 16000);
  assert.ok(admin.renewals().some((r) => r.saleId === s.id));
  const none = admin.saveMember({ name: 'Raj', salaryType: 'none', incentiveType: 'none' });
  const s2 = admin.saveSale({ type: 'service', patientName: 'B', itemId: pk[2].id, qty: 1, amount: 4500, date: admin.today(), refId: none.id });
  assert.strictEqual(s2.splits[0].amount, 0);
  assert.ok(admin.sheetsData()['Service Sales'].length === 3);
  assert.ok(A.DEFAULT_PERMS.viewer.view);
});

test('a new clinic starts with packages only; types, clinics and the lead day summary work', () => {
  const admin = fresh();
  assert.deepStrictEqual(Object.keys(A.KINDS), ['service', 'other']);
  assert.strictEqual(admin.state.items.length, 4);
  assert.strictEqual(admin.state.settings.dietPlans.length, 0);
  const k = admin.saveKind({ name: 'Supplements' });
  assert.strictEqual(A.SALE_TYPES[k.id], 'Supplements');
  const it = admin.saveItem({ name: 'Omega 3', category: 'Supplements', kind: k.id, price: 600 });
  assert.throws(() => admin.deleteKind(k.id), /first/);
  const m = admin.saveMember({ name: 'Asha' });
  admin.saveItem({ ...it, id: it.id, opening: 10 });
  admin.saveSale({ type: k.id, itemId: it.id, qty: 1, amount: 600, refId: m.id, patientName: 'Ravi', mobile: '9876543210' });
  assert.strictEqual(admin.sheetsData()['Other Sales'][1][1], 'Supplements');
  assert.strictEqual(admin.dashboard(null).byType.find((x) => x.type === k.id).amount, 600);
  const inj = admin.saveKind({ name: 'Injections' });
  assert.strictEqual(inj.id, 'injection');
  admin.deleteKind('injection');
  assert.ok(!A.KINDS.injection);
  const c2 = admin.saveClinic({ name: 'Andheri branch', address: 'Mumbai' });
  const a = admin.saveAppointment({ date: admin.today(), mode: 'clinic', clinicId: c2.id, patientName: 'Ravi', mobile: '9876543210', fee: 500 });
  assert.strictEqual(a.clinicName, 'Andheri branch');
  assert.strictEqual(admin.appointmentStats(null).byClinic.find((x) => x.id === c2.id).count, 1);
  admin.deleteClinic(c2.id);
  assert.throws(() => admin.deleteClinic(admin.state.settings.clinics[0].id), /at least one/);
  const l = admin.saveLead({ name: 'Neha', mobile: '9811111111', followUp: admin.today() });
  admin.addLeadActivity(l.id, { type: 'call', text: 'Interested' });
  const day = admin.leadDay();
  assert.strictEqual(day.newLeads.length, 1);
  assert.strictEqual(day.calls, 1);
  assert.strictEqual(day.dueToday.length, 1);
});

test('older data loses the unused starter injections and diet plans but keeps used ones', () => {
  const st = A.memoryStorage();
  const old = fresh().state;
  old.seeded = { packages: true };
  delete old.settings.kinds;
  old.items.push({ id: 'x1', kind: 'injection', category: 'Injection', name: 'Mounjaro 5mg', opening: 0 }, { id: 'x2', kind: 'injection', category: 'Injection', name: 'Mounjaro 10mg', opening: 0 });
  old.moves.push({ id: 'v1', itemId: 'x2', qty: 3, type: 'purchase', date: '2026-09-01' });
  old.settings.dietPlans = [{ id: 'd1', name: '1 Month', price: 0 }];
  st.setItem(A.KEY, JSON.stringify(old));
  const admin = A.createAdmin(st);
  assert.ok(!admin.state.items.some((i) => i.id === 'x1'));
  assert.ok(admin.state.items.some((i) => i.id === 'x2'));
  assert.strictEqual(admin.state.settings.dietPlans.length, 0);
  assert.ok(A.KINDS.injection);
});

test('sales get invoice numbers in order and the invoice carries GST and the line', () => {
  const admin = stocked();
  admin.updateSettings({ invoicePrefix: 'TPF', invoiceGst: 18 });
  const pen = admin.itemsOf('injection')[0];
  const m = admin.saveMember({ name: 'Asha' });
  const a = admin.saveSale({ type: 'injection', itemId: pen.id, qty: 1, amount: 3540, refId: m.id, allowNegative: true, patientName: 'Ravi', mobile: '9876543210', payMethod: 'UPI' });
  const b = admin.saveSale({ type: 'injection', itemId: pen.id, qty: 1, amount: 3540, refId: m.id, allowNegative: true, patientName: 'Meena', mobile: '9876500000' });
  const yr = admin.today().slice(0, 4);
  assert.strictEqual(a.invoiceNo, `TPF-${yr}-0001`);
  assert.strictEqual(b.invoiceNo, `TPF-${yr}-0002`);
  admin.saveSale({ id: a.id, type: 'injection', itemId: pen.id, qty: 1, amount: 3540, refId: m.id, allowNegative: true, patientName: 'Ravi K', mobile: '9876543210' });
  const inv = admin.invoiceFor(a.id);
  assert.strictEqual(inv.no, `TPF-${yr}-0001`);
  assert.strictEqual(inv.taxable, 3000);
  assert.strictEqual(inv.tax, 540);
  assert.strictEqual(inv.lines[0].name, pen.name);
});

test('marketing role, campaigns with cost per lead, and ideas whose status changes alone', () => {
  const admin = fresh();
  assert.ok(A.ROLES.marketing);
  const acc = admin.saveAccount({ name: 'Riya', role: 'marketing' });
  assert.strictEqual(acc.role, 'marketing');
  const d = admin.today();
  admin.saveLead({ name: 'L1', mobile: '9000000001', source: 'Instagram' });
  admin.saveLead({ name: 'L2', mobile: '9000000002', source: 'Instagram', status: 'Converted' });
  admin.saveLead({ name: 'L3', mobile: '9000000003', source: 'Google' });
  const c = admin.saveCampaign({ name: 'Oct offer', platform: 'Instagram', start: d, budget: 5000, spent: 1000 });
  const st = admin.campaignStats(c);
  assert.strictEqual(st.leads, 2);
  assert.strictEqual(st.won, 1);
  assert.strictEqual(st.cpl, 500);
  const src = admin.leadSources(null);
  assert.strictEqual(src[0].source, 'Instagram');
  assert.strictEqual(src[0].conversion, 50);
  const idea = admin.saveIdea({ title: 'What I eat in a day', format: 'Reel' });
  admin.saveIdea({ id: idea.id, status: 'posted' });
  assert.strictEqual(admin.state.ideas[0].status, 'posted');
  assert.strictEqual(admin.state.ideas[0].title, 'What I eat in a day');
  assert.throws(() => admin.saveIdea({ title: ' ' }));
});

test('attendance fills paid days; tasks and monthly targets track progress', () => {
  const admin = fresh();
  const m = admin.saveMember({ name: 'Asha' });
  const month = admin.today().slice(0, 7);
  admin.setAttendance(`${month}-01`, m.id, 'P');
  admin.setAttendance(`${month}-02`, m.id, 'H');
  admin.setAttendance(`${month}-03`, m.id, 'A');
  assert.strictEqual(admin.state.workDays[month][m.id], 1.5);
  const row = admin.attendanceMonth(month).find((x) => x.memberId === m.id);
  assert.deepStrictEqual([row.present, row.half, row.absent, row.days], [1, 1, 1, 1.5]);
  admin.setAttendance(`${month}-02`, m.id, '');
  assert.strictEqual(admin.state.workDays[month][m.id], 1);
  const t = admin.saveTask({ title: 'Call overdue leads', priority: 'high' });
  admin.setTaskDone(t.id, true);
  assert.ok(admin.state.tasks[0].done);
  admin.setTarget(month, { revenue: 10000, leads: 4 });
  admin.saveLead({ name: 'L1', mobile: '9000000001' });
  const tp = admin.targetProgress(month);
  assert.strictEqual(tp.leadsGoal, 4);
  assert.strictEqual(tp.leadsPct, 25);
});
