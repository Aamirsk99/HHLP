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

test('expenses are common or founder; founder limit shows as an alert', () => {
  const admin = fresh();
  admin.saveFounder({ name: 'Aamir', budget: 1000 });
  admin.saveExpense({ category: 'Rent', amount: 5000 });
  admin.saveExpense({ category: 'Travel', amount: 1500, scope: 'founder' });
  admin.saveExpense({ category: 'Founder', amount: 200 });
  const sm = admin.expenseSummary(null);
  assert.strictEqual(sm.common, 5000);
  assert.strictEqual(sm.founder, 1700);
  assert.ok(admin.alerts().some((a) => a.area === 'Founder' && a.level === 'bad'));
});

test('ads report: spend by platform from Ads expenses, leads from sources or typed in', () => {
  const admin = fresh();
  admin.saveExpense({ category: 'Ads', name: 'Instagram', amount: 2000 });
  admin.saveExpense({ category: 'Ads', name: 'Facebook', amount: 1000, adLeads: 5 });
  admin.saveLead({ name: 'A', mobile: '9000000001', source: 'Instagram' });
  admin.saveLead({ name: 'B', mobile: '9000000002', source: 'Instagram', status: 'Converted' });
  admin.saveLead({ name: 'C', mobile: '9000000003', source: 'Referral' });
  const r = admin.adReport(null);
  const ig = r.rows.find((x) => x.platform === 'Instagram');
  const fb = r.rows.find((x) => x.platform === 'Facebook');
  assert.deepStrictEqual([ig.spend, ig.leads, ig.won, ig.cpl], [2000, 2, 1, 1000]);
  assert.deepStrictEqual([fb.manualLeads, fb.cpl], [5, 200]);
  assert.ok(r.rows.find((x) => x.platform === 'Referral').organic);
  assert.strictEqual(r.spend, 3000);
});

test('notes, bulk lead changes, pasted leads, scores and auto-assign', () => {
  const admin = fresh();
  const n = admin.saveNote({ title: 'Second clinic?', text: 'Discuss rent', tag: 'decision' });
  admin.saveNote({ id: n.id, pinned: true });
  assert.ok(admin.state.notes[0].pinned);
  assert.strictEqual(admin.state.notes[0].title, 'Second clinic?');
  const r = admin.importLeads('Priya, 9876543210, Instagram, GLP-1\nBad line\nRavi\t9811111111\nPriya again, 9876543210');
  assert.deepStrictEqual(r, { added: 2, skipped: 2 });
  const ids = admin.state.leads.map((l) => l.id);
  admin.bulkLeads(ids, { status: 'Contacted', tag: 'VIP' });
  assert.ok(admin.state.leads.every((l) => l.status === 'Contacted' && l.tags === 'VIP'));
  const sc = admin.leadScore(admin.state.leads[0]);
  assert.ok(sc >= 0 && sc <= 100);
  const d = admin.saveAccount({ name: 'Desk 2', role: 'desk' });
  admin.updateSettings({ autoAssign: true });
  const l = admin.saveLead({ name: 'Auto', mobile: '9000000009' });
  assert.ok(['desk', d.id].includes(l.assignedTo));
  assert.strictEqual(admin.bulkLeads(ids, { remove: true }), 2);
});

test('several founders: own spending, limits, capital and profit share; discussions keep time and mode', () => {
  const admin = fresh();
  const a = admin.saveFounder({ name: 'Aamir', share: 60, budget: 5000 });
  const b = admin.saveFounder({ name: 'Sara', share: 40 });
  admin.saveExpense({ category: 'Travel', amount: 6000, scope: 'founder', founderId: a.id });
  admin.saveExpense({ category: 'Meals', amount: 700, scope: 'founder', founderId: b.id });
  admin.saveCapital({ founderId: a.id, amount: 100000, type: 'invest' });
  admin.saveCapital({ founderId: a.id, amount: 20000, type: 'withdraw' });
  const st = admin.founderStats(null);
  const fa = st.find((x) => x.id === a.id); const fb = st.find((x) => x.id === b.id);
  assert.deepStrictEqual([fa.spentAll, fa.net, fb.spentAll], [6000, 80000, 700]);
  assert.ok(admin.alerts().some((x) => x.area === 'Founder' && x.text.startsWith('Aamir')));
  admin.deleteFounder(b.id);
  assert.strictEqual(admin.founders().length, 1);
  const n = admin.saveNote({ title: 'Pricing', text: 'Raise 1M package', mode: 'Call', date: '2026-10-01', time: '18:30', with: [a.id], outcome: 'Agreed', mins: 20 });
  assert.deepStrictEqual([n.mode, n.time, n.outcome, n.with[0], n.mins], ['Call', '18:30', 'Agreed', a.id, 20]);
  assert.ok(admin.sheetsData().Founders.length > 2);
});

test('founders can be disabled and re-enabled without losing data, and keep extra profile fields', () => {
  const admin = fresh();
  const a = admin.saveFounder({ name: 'Aamir', share: 60, city: 'Mumbai', role: 'Operations', joined: '2025-01-01' });
  const b = admin.saveFounder({ name: 'Sara', share: 40, budget: 100 });
  admin.saveExpense({ category: 'Meals', amount: 500, scope: 'founder', founderId: b.id });
  admin.setFounderActive(b.id, false);
  assert.deepStrictEqual(admin.founders().map((f) => f.name), ['Aamir']);
  assert.strictEqual(admin.founders({ all: true }).length, 2);
  const all = admin.founderStats(null, { all: true }); const sb = all.find((x) => x.id === b.id);
  assert.strictEqual(sb.spentAll, 500); assert.strictEqual(sb.profitShare, 0);
  assert.ok(!admin.alerts().some((x) => /Sara/.test(x.text)));
  assert.ok(admin.sheetsData().Founders.some((r) => r[0] === 'Sara' && r[10] === 'Disabled'));
  admin.setFounderActive(b.id, true);
  assert.strictEqual(admin.founders().length, 2);
  const again = admin.saveFounder({ id: a.id, name: 'Aamir S', share: 60 });
  assert.deepStrictEqual([again.city, again.role, again.joined, again.disabled], ['Mumbai', 'Operations', '2025-01-01', false]);
});

test('Call and WhatsApp taps count once per lead, button and person within the gap, per team member', () => {
  let now = new Date('2026-10-02T10:00:00').getTime();
  const admin = A.createAdmin(A.memoryStorage(), () => new Date(now));
  const l = admin.saveLead({ name: 'Riya', mobile: '9876543210' });
  admin.setActor('Asha');
  assert.strictEqual(admin.logLeadClick(l.id, 'call').counted, true);
  assert.strictEqual(admin.logLeadClick(l.id, 'call').counted, false); // repeat tap
  now += 5 * 60000;
  assert.strictEqual(admin.logLeadClick(l.id, 'call').counted, false);
  assert.strictEqual(admin.logLeadClick(l.id, 'whatsapp').counted, true);
  admin.setActor('Ravi');
  assert.strictEqual(admin.logLeadClick(l.id, 'call').counted, true);
  now += 20 * 60000;
  admin.setActor('Asha');
  assert.strictEqual(admin.logLeadClick(l.id, 'call').counted, true);
  const st = admin.clickStats({ from: '2026-10-02', to: '2026-10-02' });
  const asha = st.find((r) => r.name === 'Asha'); const ravi = st.find((r) => r.name === 'Ravi');
  assert.deepStrictEqual([asha.calls, asha.whatsapp, asha.leads, asha.ignored], [2, 1, 1, 2]);
  assert.deepStrictEqual([ravi.calls, ravi.whatsapp], [1, 0]);
  assert.strictEqual(admin.clickStats({ from: '2026-10-03', to: '2026-10-03' }).length, 0);
});

test('a sales slip combines several sales of one patient', () => {
  const admin = stocked();
  const m = admin.saveMember({ name: 'Asha' });
  const it = admin.saveItem({ name: 'Consult', category: 'Protein', kind: 'protein', price: 100, track: false });
  const a = admin.saveSale({ type: 'protein', itemId: it.id, qty: 2, amount: 200, refId: m.id, patientName: 'Ravi', mobile: '9876543210', payMethod: 'UPI' });
  const b = admin.saveSale({ type: 'protein', itemId: it.id, qty: 1, amount: 100, refId: m.id, patientName: 'Ravi', mobile: '9876543210' });
  const s = admin.slipFor([a.id, b.id]);
  assert.strictEqual(s.total, 300); assert.strictEqual(s.lines.length, 2); assert.strictEqual(s.unpaid, 1);
  assert.strictEqual(s.nos.length, 2); assert.strictEqual(s.payMethod, 'UPI');
});

test('slips get serial numbers per kind, reprints keep the number, and the Slips sheet lists them', () => {
  const admin = stocked();
  const m = admin.saveMember({ name: 'Asha' });
  const it = admin.saveItem({ name: 'Consult', category: 'Protein', kind: 'protein', price: 100, track: false });
  const a = admin.saveSale({ type: 'protein', itemId: it.id, qty: 1, amount: 100, refId: m.id, patientName: 'Ravi', mobile: '9876543210', payMethod: 'Cash' });
  const b = admin.saveSale({ type: 'protein', itemId: it.id, qty: 1, amount: 200, refId: m.id, patientName: 'Ravi', mobile: '9876543210' });
  assert.strictEqual(admin.issueSlip([a.id], 'slip').no, 'TPF-SL-0001');
  assert.strictEqual(admin.issueSlip([a.id, b.id], 'slip').no, 'TPF-SL-0002');
  assert.strictEqual(admin.issueSlip([b.id, a.id], 'slip').no, 'TPF-SL-0002'); // same sales, same number
  assert.strictEqual(admin.issueSlip([a.id], 'receipt').no, 'TPF-RC-0001');
  assert.strictEqual(admin.issueSlip([a.id], 'invoice').no, admin.invoiceFor(a.id).no);
  const sheet = admin.sheetsData().Slips;
  assert.strictEqual(sheet.length, 5); assert.strictEqual(sheet[2][0], 'TPF-SL-0002'); assert.strictEqual(sheet[2][6], 300);
});

test('mergeStates keeps changes made on two devices', () => {
  const base = { sales: [{ id: 's1', amount: 100 }], leads: [{ id: 'l1', name: 'A', status: 'New' }], settings: { slipSeq: 3, tags: ['x'] }, notes: [] };
  const local = { sales: [{ id: 's2', amount: 50 }, { id: 's1', amount: 100 }], leads: [{ id: 'l1', name: 'A', status: 'Contacted' }], settings: { slipSeq: 4, tags: ['x', 'y'] }, notes: [] };
  const remote = { sales: [{ id: 's3', amount: 70 }, { id: 's1', amount: 120 }], leads: [], settings: { slipSeq: 5, tags: ['x', 'z'] }, notes: [{ id: 'n1' }] };
  const out = A.mergeStates(base, local, remote);
  assert.deepStrictEqual(out.sales.map((x) => x.id).sort(), ['s1', 's2', 's3']);
  assert.strictEqual(out.sales.find((x) => x.id === 's1').amount, 120); // edited only on the sheet
  assert.strictEqual(out.leads.length, 1); // deleted on the sheet but edited here: kept
  assert.strictEqual(out.settings.slipSeq, 5); // counters never go back
  assert.deepStrictEqual(out.settings.tags.sort(), ['x', 'y', 'z']);
  assert.strictEqual(out.notes.length, 1);
});

test('mergeStates drops a record deleted on one side and unchanged on the other', () => {
  const base = { sales: [{ id: 's1' }, { id: 's2' }] };
  assert.deepStrictEqual(A.mergeStates(base, { sales: [{ id: 's1' }] }, base).sales, [{ id: 's1' }]);
  assert.deepStrictEqual(A.mergeStates(base, base, { sales: [{ id: 's2' }] }).sales, [{ id: 's2' }]);
});

test('a refused sale adds no patient; a shared mobile with another name is a new patient', () => {
  const a = stocked();
  const it = a.state.items.find((x) => x.name === 'Mounjaro 2.5mg');
  const m = a.saveMember({ name: 'Asha' });
  assert.throws(() => a.saveSale({ type: 'injection', itemId: it.id, qty: 1, amount: 1000, patientName: 'Ghost', mobile: '9811111111', refId: m.id }));
  assert.strictEqual(a.state.patients.length, 0);
  a.adjustStock(it.id, 5, 'in');
  const s1 = a.saveSale({ type: 'injection', itemId: it.id, qty: 1, amount: 1000, patientName: 'Sunita', mobile: '9811111111', refId: m.id });
  const s2 = a.saveSale({ type: 'injection', itemId: it.id, qty: 1, amount: 1000, patientName: 'Riya', mobile: '9811111111', refId: m.id });
  assert.notStrictEqual(s1.patientId, s2.patientId);
  assert.strictEqual(s2.patientName, 'Riya');
  assert.strictEqual(a.state.patients.length, 2);
});

test('sign-in and sign-out are logged under the member, without changing the current actor', () => {
  const admin = fresh();
  admin.setActor('Asha');
  admin.logSession('Signed in', 'Front Desk · Android app', 'Ravi');
  const last = admin.state.log[admin.state.log.length - 1];
  assert.equal(last.by, 'Ravi');
  assert.equal(last.action, 'Signed in');
  admin.addListItem('services', 'Skin check');
  assert.equal(admin.state.log[admin.state.log.length - 1].by, 'Asha');
});

test('founder chat: messages are saved with sender, empty messages refused, and can be deleted', () => {
  const admin = fresh();
  admin.setActor('Ravi');
  assert.throws(() => admin.sendChat('   ', 'a1'), /Write a message/);
  const m = admin.sendChat(' Review ad spend today? ', 'a1');
  assert.equal(m.text, 'Review ad spend today?');
  assert.equal(m.by, 'Ravi');
  assert.equal(m.byId, 'a1');
  assert.equal(admin.chat().length, 1);
  admin.deleteChat(m.id);
  assert.equal(admin.chat().length, 0);
});
