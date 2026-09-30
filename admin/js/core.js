/*
 * Hindivine Admin — data and business rules: team, products, sales, stock,
 * purchases, incentives, salary, expenses, renewals, reports and the rows for
 * Google Sheets. Everything lives in one JSON document in localStorage.
 * No DOM access: works in the browser and in Node (tests).
 */
(function (root) {
  const KEY = 'hindivine.admin.v1';
  // Settings that stay on each device and never go to the shared Google Sheet.
  const LOCAL_SETTINGS = ['apiKey', 'pinHash', 'pinSalt', 'sheetsUrl', 'sheetsSecret', 'autoSync', 'lastSync'];

  const KINDS = { injection: 'Injection', protein: 'Protein', other: 'Other' };
  const SALE_TYPES = { injection: 'Injection', protein: 'Protein', diet: 'Diet Support' };
  const EXPENSE_CATEGORIES = ['Salary', 'Incentive', 'Rent', 'Electricity', 'Courier', 'Marketing',
    'Protein Purchase', 'Injection Purchase', 'Miscellaneous'];
  const SHEETS = ['Dashboard', 'Patients', 'Injection Sales', 'Protein Sales', 'Diet Support', 'Purchases',
    'Inventory', 'Team', 'Incentives', 'Salary', 'Expenses', 'Renewals'];

  const INJECTIONS = [
    ['Mounjaro', ['2.5mg', '5mg', '10mg', '15mg']],
    ['Wegovy', ['0.25mg', '1mg', '2.4mg']],
    ['Ozempic', ['0.25mg', '1mg']],
  ];
  const OTHER_CATEGORIES = ['Needles', 'Alcohol Swabs', 'Insulin Syringes', 'Ice Gel Packs', 'Travel Bags'];

  function defaultState() {
    const items = [];
    let n = 0;
    const add = (o) => items.push({
      id: 'i' + (++n), price: 0, incentive: null, opening: 0, lowAt: 5, unit: 'pcs', disabled: false, ...o,
    });
    INJECTIONS.forEach(([brand, doses]) => doses.forEach((dose) => add({
      kind: 'injection', category: 'Injection', brand, name: `${brand} ${dose}`, unit: 'pen', lowAt: 2,
    })));
    add({ kind: 'protein', category: 'Protein', brand: '', name: 'Protein Sachets', unit: 'sachet', lowAt: 20 });
    OTHER_CATEGORIES.forEach((c) => add({ kind: 'other', category: c, brand: '', name: c, lowAt: 20 }));
    return {
      version: 1,
      settings: {
        clinic: 'Hindivine Healthcare',
        incentive: { injection: 1000, protein: 500 },
        dietPlans: [
          { id: 'd1', name: '1 Month', months: 1, price: 0, incentive: 1000, disabled: false },
          { id: 'd3', name: '3 Month', months: 3, price: 0, incentive: 2000, disabled: false },
        ],
        renewalDays: [60, 90],
        activeDays: 90,
        purchaseExpense: true, // purchases also book an expense
        autoSaveScan: true, // a scanned invoice whose lines all match is saved without review
        pinHash: '', pinSalt: '',
        apiKey: '', aiModel: 'claude-opus-5-5',
        sheetsUrl: '', sheetsSecret: '', autoSync: false, lastSync: 0,
      },
      categories: [{ name: 'Injection', kind: 'injection' }, { name: 'Protein', kind: 'protein' },
        ...OTHER_CATEGORIES.map((name) => ({ name, kind: 'other' }))],
      items, team: [], patients: [], sales: [], purchases: [], expenses: [], moves: [], renewalsDone: {},
    };
  }

  // ── Small helpers ─────────────────────────────────────────────
  const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const r2 = (x) => Math.round((Number(x) || 0) * 100) / 100;
  const sum = (arr, f) => arr.reduce((s, x) => s + (Number(f ? f(x) : x) || 0), 0);
  const low = (s) => String(s == null ? '' : s).trim().toLowerCase();
  const digits = (s) => String(s || '').replace(/\D/g, '').slice(-10);
  const pad = (x) => String(x).padStart(2, '0');
  const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseDate = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  const daysBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86400000);
  const inRange = (date, range) => !range || ((!range.from || date >= range.from) && (!range.to || date <= range.to));
  const monthOf = (date) => String(date).slice(0, 7);

  /** Named periods for filters: today, month, lastMonth, year, all. */
  function rangeFor(name, today) {
    const t = parseDate(today);
    const y = t.getFullYear(); const m = t.getMonth();
    switch (name) {
      case 'today': return { from: today, to: today };
      case 'month': return { from: isoDate(new Date(y, m, 1)), to: isoDate(new Date(y, m + 1, 0)) };
      case 'lastMonth': return { from: isoDate(new Date(y, m - 1, 1)), to: isoDate(new Date(y, m, 0)) };
      case 'year': return { from: `${y}-01-01`, to: `${y}-12-31` };
      default: return null;
    }
  }

  function monthRange(month) {
    const [y, m] = month.split('-').map(Number);
    return { from: `${month}-01`, to: isoDate(new Date(y, m, 0)) };
  }

  /**
   * Split an incentive between references. refs: [{memberId, pct}]; percentages
   * are normalised to 100 and the rounding remainder goes to the first reference.
   */
  function splitIncentive(total, refs) {
    const list = refs.filter((r) => r && r.memberId);
    if (!list.length) return [];
    const pctSum = sum(list, (r) => r.pct);
    const pcts = pctSum > 0 ? list.map((r) => (Number(r.pct) || 0) * 100 / pctSum) : list.map(() => 100 / list.length);
    const amounts = pcts.map((p) => Math.floor(total * p / 100));
    amounts[0] += Math.round(total - sum(amounts));
    return list.map((r, i) => ({ memberId: r.memberId, pct: r2(pcts[i]), amount: amounts[i] }));
  }

  // Product matching for scanned invoices: "MOUNJARO KWIKPEN 2.5 MG/0.5ML" → Mounjaro 2.5mg.
  const doseOf = (s) => {
    const m = low(s).match(/(\d+(?:\.\d+)?)\s*mg\b/);
    return m ? String(Number(m[1])) : null;
  };
  const words = (s) => low(s).replace(/(\d)\s*mg\b/g, '$1mg').split(/[^a-z0-9.]+/).filter((w) => w.length > 1);

  function matchItem(items, name) {
    const text = low(name);
    if (!text) return null;
    const exact = items.find((i) => low(i.name) === text);
    if (exact) return exact;
    const dose = doseOf(text);
    let best = null; let bestScore = 0;
    for (const it of items) {
      if (it.brand) {
        if (!text.includes(low(it.brand))) continue;
        const d = doseOf(it.name);
        if (d && dose) { if (d === dose) return it; continue; }
      }
      const iw = words(it.name);
      const tw = new Set(words(text).map((w) => w.replace(/s$/, '')));
      const hits = iw.filter((w) => tw.has(w.replace(/s$/, ''))).length;
      const score = iw.length ? hits / iw.length : 0;
      if (score > bestScore) { best = it; bestScore = score; }
    }
    return bestScore >= 0.5 ? best : null;
  }

  // ── Store ─────────────────────────────────────────────────────
  function createAdmin(storage, clock) {
    const today = () => isoDate(clock ? clock() : new Date());
    let S = load();
    const listeners = [];

    function load() {
      let s = null;
      try { s = JSON.parse(storage.getItem(KEY) || 'null'); } catch (_) { s = null; }
      const d = defaultState();
      if (!s || typeof s !== 'object') return d;
      Object.keys(d).forEach((k) => { if (s[k] == null) s[k] = d[k]; });
      s.settings = { ...d.settings, ...s.settings, incentive: { ...d.settings.incentive, ...(s.settings || {}).incentive } };
      return s;
    }
    function save(source) {
      try { storage.setItem(KEY, JSON.stringify(S)); } catch (_) { throw new Error('Storage is full: export a backup and remove old data.'); }
      listeners.forEach((f) => f(source || 'local'));
    }
    const fail = (msg) => { throw new Error(msg); };

    // Team
    const member = (id) => S.team.find((m) => m.id === id) || null;
    const memberName = (id) => (member(id) || {}).name || '—';
    const TEAM_FIELDS = ['name', 'designation', 'mobile', 'salary', 'incentiveOn', 'joiningDate'];
    function saveMember(input) {
      if (!low(input.name)) fail('Name is required');
      let m = input.id && member(input.id);
      if (!m) { m = { id: uid('m'), disabled: false, created: Date.now() }; S.team.push(m); }
      TEAM_FIELDS.forEach((k) => { if (k in input) m[k] = input[k]; });
      m.salary = Number(m.salary) || 0;
      m.incentiveOn = m.incentiveOn !== false;
      save();
      return m;
    }
    function setMemberDisabled(id, disabled) { const m = member(id); if (m) { m.disabled = !!disabled; save(); } }
    function deleteMember(id) {
      // Sales keep the reference name, so history stays readable.
      S.team = S.team.filter((m) => m.id !== id);
      save();
    }

    // Items, categories, stock
    const item = (id) => S.items.find((i) => i.id === id) || null;
    const itemsOf = (kind, all) => S.items.filter((i) => i.kind === kind && (all || !i.disabled));
    function saveItem(input) {
      if (!low(input.name)) fail('Name is required');
      let it = input.id && item(input.id);
      if (!it) {
        it = { id: uid('i'), brand: '', price: 0, incentive: null, opening: 0, lowAt: 5, unit: 'pcs', disabled: false };
        S.items.push(it);
      }
      ['name', 'brand', 'category', 'kind', 'price', 'incentive', 'opening', 'lowAt', 'unit', 'disabled'].forEach((k) => {
        if (k in input) it[k] = input[k];
      });
      const cat = S.categories.find((c) => c.name === it.category);
      if (!cat) S.categories.push({ name: it.category || 'Other', kind: it.kind || 'other' });
      it.kind = it.kind || (cat ? cat.kind : 'other');
      ['price', 'opening', 'lowAt'].forEach((k) => { it[k] = Number(it[k]) || 0; });
      it.incentive = it.incentive === '' || it.incentive == null ? null : Number(it.incentive);
      save();
      return it;
    }
    function deleteItem(id) {
      if (S.moves.some((mv) => mv.itemId === id)) fail('This item has stock history. Disable it instead.');
      S.items = S.items.filter((i) => i.id !== id);
      save();
    }
    function addCategory(name, kind) {
      const n = String(name || '').trim();
      if (!n) fail('Category name is required');
      if (S.categories.some((c) => low(c.name) === low(n))) fail('That category already exists');
      S.categories.push({ name: n, kind: kind || 'other' });
      save();
    }
    function stockOf(itemId, until) {
      const it = item(itemId);
      if (!it) return 0;
      return it.opening + sum(S.moves.filter((m) => m.itemId === itemId && (!until || m.date <= until)), (m) => m.qty);
    }
    function adjustStock(itemId, qty, note, date) {
      if (!item(itemId)) fail('Unknown item');
      if (!Number(qty)) fail('Enter a quantity');
      S.moves.push({ id: uid('v'), itemId, qty: Number(qty), type: 'adjust', ref: note || '', date: date || today() });
      save();
    }
    const lowStock = () => S.items.filter((i) => !i.disabled && stockOf(i.id) <= i.lowAt)
      .map((i) => ({ item: i, stock: stockOf(i.id) }));

    // Patients
    function findOrCreatePatient(name, mobile) {
      const nm = String(name || '').trim();
      if (!nm) fail('Patient name is required');
      const ph = digits(mobile);
      let p = (ph && S.patients.find((x) => digits(x.mobile) === ph && low(x.name) === low(nm)))
        || (ph && S.patients.find((x) => digits(x.mobile) === ph))
        || (!ph && S.patients.find((x) => low(x.name) === low(nm) && !digits(x.mobile)));
      if (!p) { p = { id: uid('p'), name: nm, mobile: String(mobile || '').trim(), created: today() }; S.patients.push(p); }
      return p;
    }
    const patientSales = (pid) => S.sales.filter((s) => s.patientId === pid).sort((a, b) => (a.date < b.date ? -1 : 1));

    // Sales
    function incentiveFor(input) {
      if (input.type === 'diet') {
        const plan = S.settings.dietPlans.find((p) => p.id === input.planId);
        return plan ? Number(plan.incentive) || 0 : 0;
      }
      const it = item(input.itemId);
      const base = it && it.incentive != null ? it.incentive : S.settings.incentive[input.type] || 0;
      // Injections pay per pen; a protein sale pays once, whatever the quantity.
      return input.type === 'injection' ? base * (Number(input.qty) || 1) : base;
    }

    function buildSale(input, id) {
      const type = input.type;
      if (!SALE_TYPES[type]) fail('Unknown sale type');
      const date = input.date || today();
      const amount = Number(input.amount);
      if (!(amount >= 0) || input.amount === '' || input.amount == null) fail('Sale amount is required');
      const qty = type === 'diet' ? 1 : Number(input.qty) || 1;
      if (qty <= 0) fail('Quantity must be more than 0');
      let product = '';
      if (type === 'diet') {
        const plan = S.settings.dietPlans.find((p) => p.id === input.planId);
        if (!plan) fail('Choose a diet plan');
        product = `Diet Support ${plan.name}`;
      } else {
        const it = item(input.itemId);
        if (!it || it.kind !== type) fail(`Choose a ${SALE_TYPES[type].toLowerCase()} product`);
        product = it.name;
      }
      if (!input.refId) fail('Choose the reference team member');
      const refs = [{ memberId: input.refId, pct: 100 }];
      if (input.sharedId && input.sharedId !== input.refId) {
        const pct = input.sharePct == null || input.sharePct === '' ? 50 : Math.min(100, Math.max(0, Number(input.sharePct)));
        refs[0].pct = 100 - pct;
        refs.push({ memberId: input.sharedId, pct });
      }
      const incentive = incentiveFor({ ...input, qty });
      const splits = splitIncentive(incentive, refs).map((s) => {
        const m = member(s.memberId);
        return { ...s, name: m ? m.name : '—', amount: m && m.incentiveOn === false ? 0 : s.amount };
      });
      const patient = findOrCreatePatient(input.patientName, input.mobile);
      const earlier = S.sales.some((s) => s.patientId === patient.id && s.id !== id && s.date <= date);
      return {
        id, type, date, patientId: patient.id, patientName: patient.name, mobile: patient.mobile,
        patientType: input.patientType || (earlier ? 'renewal' : 'new'),
        itemId: type === 'diet' ? null : input.itemId, planId: type === 'diet' ? input.planId : null,
        product, qty, amount,
        refId: input.refId, sharedId: refs[1] ? refs[1].memberId : '', sharePct: refs[1] ? refs[1].pct : 0,
        dietitianId: input.dietitianId || '', notes: String(input.notes || '').trim(),
        incentive: sum(splits, (x) => x.amount), splits, created: Date.now(),
      };
    }

    /** Record (or update) a sale: stock out, incentive split and revenue in one step. */
    function saveSale(input) {
      const existing = input.id ? S.sales.find((s) => s.id === input.id) : null;
      const sale = buildSale(input, existing ? existing.id : uid('s'));
      if (sale.itemId) {
        const other = existing && existing.itemId === sale.itemId ? existing.qty : 0;
        const available = stockOf(sale.itemId) + other;
        if (available < sale.qty && !input.allowNegative) {
          fail(`Only ${available} ${item(sale.itemId).unit} of ${sale.product} in stock`);
        }
      }
      if (existing) {
        S.moves = S.moves.filter((m) => m.ref !== existing.id);
        Object.assign(existing, sale, { created: existing.created });
      } else S.sales.push(sale);
      if (sale.itemId) S.moves.push({ id: uid('v'), itemId: sale.itemId, qty: -sale.qty, type: 'sale', ref: sale.id, date: sale.date });
      save();
      return existing || sale;
    }
    function deleteSale(id) {
      S.sales = S.sales.filter((s) => s.id !== id);
      S.moves = S.moves.filter((m) => m.ref !== id);
      save();
    }

    // Purchases
    const lineTotal = (l) => r2((Number(l.qty) || 0) * (Number(l.rate) || 0) * (1 + (Number(l.gst) || 0) / 100));
    function findDuplicatePurchase(p) {
      if (!p.invoiceNo) return null;
      return S.purchases.find((x) => x.id !== p.id && low(x.invoiceNo) === low(p.invoiceNo) && low(x.vendor) === low(p.vendor)) || null;
    }
    /** Save an invoice: every line adds stock; optionally books a purchase expense. */
    function savePurchase(input) {
      const lines = (input.lines || []).filter((l) => l.itemId && Number(l.qty) > 0);
      if (!lines.length) fail('Add at least one product line with a quantity');
      lines.forEach((l) => { if (!item(l.itemId)) fail('Unknown product in the invoice'); });
      if (findDuplicatePurchase(input) && !input.allowDuplicate) fail(`Invoice ${input.invoiceNo} from ${input.vendor} is already saved`);
      const existing = input.id ? S.purchases.find((p) => p.id === input.id) : null;
      const p = {
        id: existing ? existing.id : uid('b'),
        vendor: String(input.vendor || '').trim(), invoiceNo: String(input.invoiceNo || '').trim(),
        date: input.date || today(), scanned: !!input.scanned,
        lines: lines.map((l) => ({
          itemId: l.itemId, name: item(l.itemId).name, invoiceName: l.invoiceName || '', qty: Number(l.qty),
          batch: l.batch || '', expiry: l.expiry || '', rate: Number(l.rate) || 0, gst: Number(l.gst) || 0, total: lineTotal(l),
        })),
      };
      p.total = r2(sum(p.lines, (l) => l.total));
      if (existing) {
        S.moves = S.moves.filter((m) => m.ref !== existing.id);
        S.expenses = S.expenses.filter((e) => e.ref !== existing.id);
        Object.assign(existing, p);
      } else S.purchases.push(p);
      p.lines.forEach((l) => S.moves.push({ id: uid('v'), itemId: l.itemId, qty: l.qty, type: 'purchase', ref: p.id, date: p.date }));
      if (S.settings.purchaseExpense && p.total > 0) {
        const byCat = {};
        p.lines.forEach((l) => {
          const k = item(l.itemId).kind;
          const cat = k === 'injection' ? 'Injection Purchase' : k === 'protein' ? 'Protein Purchase' : 'Miscellaneous';
          byCat[cat] = (byCat[cat] || 0) + l.total;
        });
        Object.entries(byCat).forEach(([category, amount]) => S.expenses.push({
          id: uid('e'), date: p.date, category, amount: r2(amount), note: `Invoice ${p.invoiceNo || ''} ${p.vendor}`.trim(), ref: p.id, auto: true,
        }));
      }
      save();
      return existing || p;
    }
    function deletePurchase(id) {
      S.purchases = S.purchases.filter((p) => p.id !== id);
      S.moves = S.moves.filter((m) => m.ref !== id);
      S.expenses = S.expenses.filter((e) => e.ref !== id);
      save();
    }

    // Expenses
    function saveExpense(input) {
      if (!(Number(input.amount) > 0)) fail('Enter an amount');
      if (!input.category) fail('Choose a category');
      let e = input.id && S.expenses.find((x) => x.id === input.id);
      if (!e) { e = { id: uid('e') }; S.expenses.push(e); }
      Object.assign(e, { date: input.date || today(), category: input.category, amount: r2(input.amount), note: String(input.note || '').trim() });
      save();
      return e;
    }
    function deleteExpense(id) { S.expenses = S.expenses.filter((e) => e.id !== id); save(); }

    // Incentives, salary
    function incentiveLedger(range) {
      const rows = [];
      S.sales.filter((s) => inRange(s.date, range)).forEach((s) => s.splits.forEach((sp) => rows.push({
        date: s.date, memberId: sp.memberId, name: sp.name, type: s.type, patient: s.patientName, product: s.product,
        pct: sp.pct, amount: sp.amount, saleId: s.id,
      })));
      return rows.sort((a, b) => (a.date < b.date ? 1 : -1));
    }
    function salarySheet(month) {
      const range = monthRange(month);
      const ledger = incentiveLedger(range);
      const ids = new Set([...S.team.filter((m) => !m.disabled).map((m) => m.id), ...ledger.map((l) => l.memberId)]);
      return [...ids].map((id) => {
        const m = member(id);
        const salary = m && !m.disabled && (!m.joiningDate || m.joiningDate <= range.to) ? m.salary : 0;
        const incentive = sum(ledger.filter((l) => l.memberId === id), (l) => l.amount);
        return { memberId: id, name: m ? m.name : (ledger.find((l) => l.memberId === id) || {}).name, designation: m ? m.designation : '', salary, incentive, total: salary + incentive };
      }).sort((a, b) => b.total - a.total);
    }
    /** Book the month's salary and incentive as expenses (replaces an earlier booking of the same month). */
    function postSalary(month) {
      const rows = salarySheet(month);
      const tag = `salary:${month}`;
      S.expenses = S.expenses.filter((e) => e.ref !== tag);
      const date = monthRange(month).to;
      const sal = sum(rows, (r) => r.salary); const inc = sum(rows, (r) => r.incentive);
      if (sal) S.expenses.push({ id: uid('e'), date, category: 'Salary', amount: sal, note: `Salary ${month} (${rows.filter((r) => r.salary).length} staff)`, ref: tag, auto: true });
      if (inc) S.expenses.push({ id: uid('e'), date, category: 'Incentive', amount: inc, note: `Incentives ${month}`, ref: tag, auto: true });
      save();
      return { salary: sal, incentive: inc };
    }
    const salaryPosted = (month) => S.expenses.some((e) => e.ref === `salary:${month}`);

    // Renewals
    function renewals(onDate) {
      const d = onDate || today();
      const [first, second] = S.settings.renewalDays;
      const out = [];
      S.patients.forEach((p) => {
        const inj = patientSales(p.id).filter((s) => s.type === 'injection');
        const last = inj[inj.length - 1];
        if (!last) return;
        const days = daysBetween(last.date, d);
        const stage = days >= second ? second : days >= first ? first : 0;
        const dueIn = first - days;
        out.push({
          patientId: p.id, name: p.name, mobile: p.mobile, product: last.product, lastDate: last.date, days, stage,
          dueIn, ref: memberName(last.refId), saleId: last.id, done: !!S.renewalsDone[`${last.id}:${stage}`],
        });
      });
      return out.sort((a, b) => b.days - a.days);
    }
    function markRenewal(saleId, stage, done) {
      const k = `${saleId}:${stage}`;
      if (done) S.renewalsDone[k] = today(); else delete S.renewalsDone[k];
      save();
    }

    // Reports
    function teamReport(range) {
      const sales = S.sales.filter((s) => inRange(s.date, range));
      const ids = new Set([...S.team.map((m) => m.id), ...sales.flatMap((s) => s.splits.map((x) => x.memberId))]);
      return [...ids].map((id) => {
        const mine = sales.filter((s) => s.splits.some((x) => x.memberId === id));
        const share = (s) => (s.splits.find((x) => x.memberId === id).pct || 0) / 100;
        const m = member(id);
        const byType = (t) => r2(sum(mine.filter((s) => s.type === t), (s) => s.amount * share(s)));
        return {
          memberId: id, name: m ? m.name : mine[0] && mine[0].splits.find((x) => x.memberId === id).name,
          disabled: m ? m.disabled : true,
          orders: mine.length,
          totalSales: r2(sum(mine, (s) => s.amount * share(s))),
          newPatients: new Set(mine.filter((s) => s.patientType === 'new').map((s) => s.patientId)).size,
          renewals: mine.filter((s) => s.patientType === 'renewal').length,
          injectionSales: byType('injection'), proteinSales: byType('protein'), dietSales: byType('diet'),
          incentive: sum(mine, (s) => s.splits.find((x) => x.memberId === id).amount),
        };
      }).sort((a, b) => b.totalSales - a.totalSales);
    }
    function financialReport(range) {
      const sales = S.sales.filter((s) => inRange(s.date, range));
      const expenses = S.expenses.filter((e) => inRange(e.date, range));
      const revenue = r2(sum(sales, (s) => s.amount));
      const totalExp = r2(sum(expenses, (e) => e.amount));
      const byCategory = {};
      EXPENSE_CATEGORIES.forEach((c) => { byCategory[c] = 0; });
      expenses.forEach((e) => { byCategory[e.category] = r2((byCategory[e.category] || 0) + e.amount); });
      const revenueByType = {};
      Object.keys(SALE_TYPES).forEach((t) => { revenueByType[t] = r2(sum(sales.filter((s) => s.type === t), (s) => s.amount)); });
      const months = {};
      sales.forEach((s) => { const m = monthOf(s.date); months[m] = months[m] || { revenue: 0, expenses: 0 }; months[m].revenue += s.amount; });
      expenses.forEach((e) => { const m = monthOf(e.date); months[m] = months[m] || { revenue: 0, expenses: 0 }; months[m].expenses += e.amount; });
      const monthly = Object.keys(months).sort().map((m) => ({ month: m, revenue: r2(months[m].revenue), expenses: r2(months[m].expenses), profit: r2(months[m].revenue - months[m].expenses) }));
      return { revenue, expenses: totalExp, profit: r2(revenue - totalExp), byCategory, revenueByType, monthly };
    }
    function stockReport(range) {
      const from = range && range.from; const to = range && range.to;
      return S.items.map((it) => {
        const mv = S.moves.filter((m) => m.itemId === it.id);
        const before = from ? sum(mv.filter((m) => m.date < from), (m) => m.qty) : 0;
        const within = mv.filter((m) => inRange(m.date, range));
        const q = (t) => sum(within.filter((m) => m.type === t), (m) => m.qty);
        const opening = it.opening + before;
        const purchased = q('purchase'); const sold = -q('sale'); const adjusted = q('adjust');
        return {
          itemId: it.id, category: it.category, kind: it.kind, name: it.name, unit: it.unit, disabled: it.disabled,
          opening, purchased, sold, adjusted, current: opening + purchased - sold + adjusted, closingToday: stockOf(it.id, to), lowAt: it.lowAt,
        };
      });
    }

    function dashboard(range) {
      const d = today();
      const sales = S.sales.filter((s) => inRange(s.date, range));
      const fin = financialReport(range);
      const byType = (t) => sales.filter((s) => s.type === t);
      const uniq = (list) => new Set(list.map((s) => s.patientId)).size;
      const activeFrom = isoDate(new Date(parseDate(d) - S.settings.activeDays * 86400000));
      const team = teamReport(range);
      const top = team.find((t) => t.totalSales > 0) || null;
      const stockSum = (f) => sum(S.items.filter((i) => !i.disabled && f(i)), (i) => stockOf(i.id));
      const cat = (re) => (i) => re.test(i.category) || re.test(i.name);
      return {
        sales: {
          orders: sales.length, revenue: fin.revenue, expenses: fin.expenses, profit: fin.profit,
          injection: fin.revenueByType.injection, protein: fin.revenueByType.protein, diet: fin.revenueByType.diet,
          injectionCount: byType('injection').length, proteinCount: byType('protein').length, dietCount: byType('diet').length,
        },
        patients: {
          total: S.patients.length,
          new: uniq(sales.filter((s) => s.patientType === 'new')),
          renewal: uniq(sales.filter((s) => s.patientType === 'renewal')),
          active: uniq(S.sales.filter((s) => s.date >= activeFrom && s.date <= d)),
        },
        team: {
          members: S.team.filter((m) => !m.disabled).length,
          incentives: sum(team, (t) => t.incentive),
          salary: sum(S.team.filter((m) => !m.disabled), (m) => m.salary),
          top,
        },
        stock: {
          injection: stockSum((i) => i.kind === 'injection'),
          protein: stockSum((i) => i.kind === 'protein'),
          needles: stockSum(cat(/needle/i)), swabs: stockSum(cat(/swab/i)), syringes: stockSum(cat(/syringe/i)),
          low: lowStock(),
        },
        renewalsDue: renewals(d).filter((r) => r.stage && !r.done).length,
        monthly: fin.monthly,
      };
    }

    // Google Sheets rows (header first)
    function sheetsData() {
      const d = today();
      const refNames = (s) => [memberName(s.refId) === '—' ? (s.splits[0] || {}).name || '' : memberName(s.refId), s.sharedId ? ((s.splits[1] || {}).name || memberName(s.sharedId)) : ''];
      const split = (s) => s.splits.map((x) => `${x.name} ${x.pct}%`).join(' / ');
      const byDate = [...S.sales].sort((a, b) => (a.date < b.date ? -1 : 1));
      const month = rangeFor('month', d);
      const db = dashboard(month);
      const all = dashboard(null);
      const out = {};
      out.Dashboard = [
        ['Metric', 'This month', 'All time'],
        ['Total Orders', db.sales.orders, all.sales.orders],
        ['Total Revenue', db.sales.revenue, all.sales.revenue],
        ['Total Expenses', db.sales.expenses, all.sales.expenses],
        ['Net Profit', db.sales.profit, all.sales.profit],
        ['Injection Sales', db.sales.injection, all.sales.injection],
        ['Protein Sales', db.sales.protein, all.sales.protein],
        ['Diet Support Sales', db.sales.diet, all.sales.diet],
        ['Total Patients', db.patients.total, all.patients.total],
        ['New Patients', db.patients.new, all.patients.new],
        ['Renewal Patients', db.patients.renewal, all.patients.renewal],
        ['Active Patients', db.patients.active, all.patients.active],
        ['Team Members', db.team.members, all.team.members],
        ['Total Incentives', db.team.incentives, all.team.incentives],
        ['Monthly Salary', db.team.salary, all.team.salary],
        ['Top Performer', db.team.top ? db.team.top.name : '', all.team.top ? all.team.top.name : ''],
        ['Injection Stock', db.stock.injection, ''],
        ['Protein Stock', db.stock.protein, ''],
        ['Needles Stock', db.stock.needles, ''],
        ['Swabs Stock', db.stock.swabs, ''],
        ['Syringe Stock', db.stock.syringes, ''],
        ['Low Stock Alerts', db.stock.low.map((l) => `${l.item.name} (${l.stock})`).join(', '), ''],
        ['Updated', new Date(clock ? clock() : Date.now()).toISOString(), ''],
      ];
      out.Patients = [['Name', 'Mobile', 'First Purchase', 'Last Purchase', 'Orders', 'Total Spent', 'Last Product', 'Reference Team', 'Status']];
      const activeFrom = isoDate(new Date(parseDate(d) - S.settings.activeDays * 86400000));
      S.patients.forEach((p) => {
        const ps = patientSales(p.id);
        const last = ps[ps.length - 1];
        out.Patients.push([p.name, p.mobile, ps[0] ? ps[0].date : '', last ? last.date : '', ps.length, sum(ps, (s) => s.amount),
          last ? last.product : '', last ? refNames(last)[0] : '', last && last.date >= activeFrom ? 'Active' : 'Inactive']);
      });
      out['Injection Sales'] = [['Date', 'Patient', 'Mobile', 'New/Renewal', 'Product', 'Qty', 'Amount', 'Reference', 'Shared Reference', 'Split', 'Dietitian', 'Incentive', 'Notes']];
      out['Protein Sales'] = [['Date', 'Patient', 'Mobile', 'Protein Type', 'Qty', 'Amount', 'Reference', 'Shared Reference', 'Split', 'Incentive', 'Notes']];
      out['Diet Support'] = [['Date', 'Patient', 'Mobile', 'Plan', 'Amount', 'Reference', 'Shared Reference', 'Split', 'Incentive', 'Notes']];
      byDate.forEach((s) => {
        const [ref, shared] = refNames(s);
        if (s.type === 'injection') out['Injection Sales'].push([s.date, s.patientName, s.mobile, s.patientType === 'new' ? 'New' : 'Renewal', s.product, s.qty, s.amount, ref, shared, split(s), s.dietitianId ? memberName(s.dietitianId) : '', s.incentive, s.notes]);
        else if (s.type === 'protein') out['Protein Sales'].push([s.date, s.patientName, s.mobile, s.product, s.qty, s.amount, ref, shared, split(s), s.incentive, s.notes]);
        else out['Diet Support'].push([s.date, s.patientName, s.mobile, s.product.replace('Diet Support ', ''), s.amount, ref, shared, split(s), s.incentive, s.notes]);
      });
      out.Purchases = [['Date', 'Vendor', 'Invoice No', 'Product', 'Invoice Product Name', 'Qty', 'Batch', 'Expiry', 'Rate', 'GST %', 'Line Total']];
      [...S.purchases].sort((a, b) => (a.date < b.date ? -1 : 1)).forEach((p) => p.lines.forEach((l) => out.Purchases.push(
        [p.date, p.vendor, p.invoiceNo, l.name, l.invoiceName, l.qty, l.batch, l.expiry, l.rate, l.gst, l.total])));
      out.Inventory = [['Category', 'Item', 'Opening Stock', 'Purchased Stock', 'Sold Stock', 'Adjusted', 'Available Stock', 'Low Stock At', 'Status']];
      stockReport(null).forEach((r) => out.Inventory.push([r.category, r.name, r.opening, r.purchased, r.sold, r.adjusted, r.current, r.lowAt,
        r.disabled ? 'Disabled' : r.current <= r.lowAt ? 'LOW' : 'OK']));
      out.Team = [['Name', 'Designation', 'Mobile', 'Salary', 'Incentive Status', 'Joining Date', 'Status']];
      S.team.forEach((m) => out.Team.push([m.name, m.designation || '', m.mobile || '', m.salary, m.incentiveOn === false ? 'Off' : 'On', m.joiningDate || '', m.disabled ? 'Disabled' : 'Active']));
      out.Incentives = [['Date', 'Team Member', 'Sale Type', 'Patient', 'Product', 'Share %', 'Incentive']];
      incentiveLedger(null).reverse().forEach((l) => out.Incentives.push([l.date, l.name, SALE_TYPES[l.type], l.patient, l.product, l.pct, l.amount]));
      out.Salary = [['Month', 'Name', 'Designation', 'Salary', 'Incentive', 'Salary + Incentive', 'Booked as Expense']];
      const months = new Set([monthOf(d), ...S.sales.map((s) => monthOf(s.date))]);
      [...months].sort().forEach((mo) => salarySheet(mo).forEach((r) => out.Salary.push([mo, r.name, r.designation || '', r.salary, r.incentive, r.total, salaryPosted(mo) ? 'Yes' : 'No'])));
      out.Expenses = [['Date', 'Category', 'Amount', 'Note']];
      [...S.expenses].sort((a, b) => (a.date < b.date ? -1 : 1)).forEach((e) => out.Expenses.push([e.date, e.category, e.amount, e.note || '']));
      out.Renewals = [['Patient', 'Mobile', 'Product', 'Last Purchase Date', 'Days Since', 'Reminder', 'Reference Team', 'Contacted']];
      renewals(d).forEach((r) => out.Renewals.push([r.name, r.mobile, r.product, r.lastDate, r.days, r.stage ? `${r.stage} Day` : `Due in ${r.dueIn} days`, r.ref, r.done ? 'Yes' : 'No']));
      return out;
    }

    // Settings and backup
    function updateSettings(patch) {
      Object.assign(S.settings, patch);
      save();
    }
    function saveDietPlan(input) {
      let p = input.id && S.settings.dietPlans.find((x) => x.id === input.id);
      if (!p) { p = { id: uid('d'), disabled: false }; S.settings.dietPlans.push(p); }
      ['name', 'months', 'price', 'incentive', 'disabled'].forEach((k) => { if (k in input) p[k] = input[k]; });
      p.price = Number(p.price) || 0; p.incentive = Number(p.incentive) || 0;
      save();
      return p;
    }
    const exportBackup = () => JSON.stringify({ app: 'hindivine-admin', exported: new Date().toISOString(), data: { ...S, settings: { ...S.settings, apiKey: '', pinHash: '', pinSalt: '' } } });
    function importBackup(text) {
      const obj = JSON.parse(text);
      if (!obj || obj.app !== 'hindivine-admin' || !obj.data) fail('This is not a Hindivine Admin backup');
      const keep = { apiKey: S.settings.apiKey, pinHash: S.settings.pinHash, pinSalt: S.settings.pinSalt };
      storage.setItem(KEY, JSON.stringify(obj.data));
      S = load();
      Object.assign(S.settings, keep);
      save();
    }
    function resetAll() { S = defaultState(); save(); }

    // Shared data for the Google Sheet store: everything except this device's own settings.
    function exportState() {
      const settings = { ...S.settings };
      LOCAL_SETTINGS.forEach((k) => { delete settings[k]; });
      return { ...S, settings };
    }
    /** Replace the data with a copy loaded from the Google Sheet, keeping this device's own settings. */
    function loadState(remote) {
      if (!remote || typeof remote !== 'object' || !Array.isArray(remote.sales)) fail('The Google Sheet data is not readable');
      const keep = {};
      LOCAL_SETTINGS.forEach((k) => { keep[k] = S.settings[k]; });
      storage.setItem(KEY, JSON.stringify(remote));
      S = load();
      Object.assign(S.settings, keep);
      save('remote');
    }

    return {
      get state() { return S; },
      today, onChange: (f) => listeners.push(f),
      member, memberName, saveMember, setMemberDisabled, deleteMember,
      item, itemsOf, saveItem, deleteItem, addCategory, stockOf, adjustStock, lowStock,
      matchItem: (name, kind) => matchItem(S.items.filter((i) => !i.disabled && (!kind || i.kind === kind)), name),
      findOrCreatePatient, patientSales, saveSale, deleteSale, incentiveFor,
      savePurchase, deletePurchase, findDuplicatePurchase, lineTotal,
      saveExpense, deleteExpense,
      incentiveLedger, salarySheet, postSalary, salaryPosted,
      renewals, markRenewal,
      teamReport, financialReport, stockReport, dashboard, sheetsData,
      updateSettings, saveDietPlan, exportBackup, importBackup, resetAll, exportState, loadState,
    };
  }

  function memoryStorage() {
    const m = new Map();
    return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
  }

  const api = {
    createAdmin, memoryStorage, defaultState, splitIncentive, matchItem, rangeFor, monthRange, isoDate, daysBetween,
    KINDS, SALE_TYPES, EXPENSE_CATEGORIES, SHEETS, KEY,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ADMIN = api;
})(typeof window !== 'undefined' ? window : globalThis);
