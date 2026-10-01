/*
 * The Prime Fit Admin — data and business rules: team, products, sales, stock,
 * purchases, incentives, salary, expenses, renewals, reports and the rows for
 * Google Sheets. Everything lives in one JSON document in localStorage.
 * No DOM access: works in the browser and in Node (tests).
 */
(function (root) {
  const KEY = 'primefit.admin.v1';
  // Settings that stay on each device and never go to the shared Google Sheet.
  const LOCAL_SETTINGS = ['sheetsUrl', 'sheetsSecret', 'autoSync', 'lastSync'];

  // Inventory / product types. Service and Other are built in; the clinic adds its own (Injection, Protein, …)
  // in Products. KINDS and SALE_TYPES are refreshed from settings.kinds whenever data loads or a type changes.
  const BASE_KINDS = [{ id: 'service', name: 'Service / Package', sell: true }, { id: 'other', name: 'Other inventory', sell: false }];
  const KINDS = { service: 'Service / Package', other: 'Other inventory' };
  const SALE_TYPES = { service: 'Service', diet: 'Diet Support' };
  function syncKinds(s) {
    Object.keys(KINDS).forEach((k) => { delete KINDS[k]; });
    Object.keys(SALE_TYPES).forEach((k) => { delete SALE_TYPES[k]; });
    (s.settings.kinds || BASE_KINDS).filter((k) => !k.removed).forEach((k) => {
      KINDS[k.id] = k.name;
      if (k.sell) SALE_TYPES[k.id] = k.id === 'service' ? 'Service' : k.name;
    });
    SALE_TYPES.diet = 'Diet Support';
  }
  const EXPENSE_CATEGORIES = ['Salary', 'Incentive', 'Rent', 'Electricity', 'Courier', 'Marketing',
    'Founder', 'Ads', 'Editing', 'Product Purchase', 'Miscellaneous'];
  const SHEETS = ['Dashboard', 'Appointments', 'Leads', 'Patients', 'Service Sales', 'Injection Sales', 'Protein Sales', 'Other Sales', 'Diet Support', 'Purchases',
    'Inventory', 'Team', 'Incentives', 'Salary', 'Expenses', 'Renewals', 'Doctors', 'Editors', 'Content', 'Campaigns', 'Ads Report', 'Tasks', 'Attendance', 'Founder Notes', 'Activity Log'];

  // Login roles. Every person can have their own login (name + PIN), shared through the Google Sheet.
  const ROLES = { super: 'Super Admin', admin: 'Admin', manager: 'Manager', desk: 'Front Desk', editor: 'Video Editor', marketing: 'Marketing', viewer: 'View only' };
  // Choice lists that the admins can extend ("+ Add new") from any form.
  const DEFAULT_LISTS = {
    expenseCategories: EXPENSE_CATEGORIES,
    services: ['Weight loss consultation', 'GLP-1 consultation', 'Diet plan', 'Follow-up visit', 'Body composition analysis'],
    leadSources: ['Instagram', 'Facebook', 'Google', 'Website', 'WhatsApp', 'Walk-in', 'Referral', 'Phone call', 'Other'],
    leadStatuses: ['New', 'Contacted', 'Interested', 'Follow-up', 'Appointment booked', 'Converted', 'Not interested', 'Lost'],
    payMethods: ['Cash', 'UPI', 'Card', 'Bank transfer'],
    designations: ['Doctor', 'Dietitian', 'Counsellor', 'Front Desk', 'Manager', 'Nurse', 'Pharmacist'],
    // "Paid for / by" names on expenses (each founder, ad platform, editor…), totalled separately.
    expenseNames: ['Founder 1', 'Founder 2', 'Meta Ads', 'Google Ads'],
    platforms: ['Instagram', 'YouTube', 'Facebook', 'WhatsApp'],
    specialities: ['Physician', 'Endocrinologist', 'Dietitian', 'Bariatric surgeon'],
  };
  // Built-in expense categories the app books by itself; they can't be removed.
  const LOCKED_LIST_ITEMS = { expenseCategories: ['Salary', 'Incentive', 'Miscellaneous'], leadStatuses: ['New', 'Converted'] };
  const LEAD_PRIORITIES = { hot: 'Hot', warm: 'Warm', cold: 'Cold' };
  // What each role can open. Super Admin always has everything; the others are editable in Settings.
  const DEFAULT_PERMS = {
    admin: { screens: ['diet', 'dashboard', 'today', 'appointments', 'leads', 'sell', 'sales', 'patients', 'renewals', 'doctors', 'products', 'inventory', 'purchases', 'team', 'incentives', 'salary', 'expenses', 'content', 'marketing', 'manage', 'reports', 'activity'], del: true },
    manager: { screens: ['diet', 'dashboard', 'today', 'appointments', 'leads', 'sell', 'sales', 'patients', 'renewals', 'doctors', 'products', 'inventory', 'purchases', 'expenses', 'content', 'marketing', 'manage', 'reports', 'activity'], del: false },
    desk: { screens: ['diet', 'appointments', 'leads'], del: false },
    editor: { screens: ['content'], del: false },
    marketing: { screens: ['dashboard', 'leads', 'content', 'marketing'], del: false },
    viewer: { screens: ['diet', 'dashboard', 'today', 'appointments', 'sales', 'patients', 'renewals', 'products', 'inventory', 'expenses', 'content', 'reports'], del: false, view: true },
  };
  // GLP-1 Success Support packages (from the clinic's offer posters): price, regular price, days.
  const GLP1_INCLUDES = '1-on-1 initial consultation (10–15 mins) · Personalised diet & protein guidance · Side-effect management guidance · WhatsApp support · Weekly progress review';
  const PACKAGES = [['1 Week', 1499, 3000, 7], ['1 Month', 2999, 5000, 30], ['2 Months', 4500, 8000, 60], ['3 Months', 5999, 12000, 90]];
  const PACKAGE_CATEGORY = 'GLP-1 Success Support';
  const KIT_DEFAULTS = [['Travel Bags', 1], ['Ice Gel Packs', 1], ['Alcohol Swabs', 16], ['Needles', 2]];
  const LOG_MAX = 3000;
  const APPT_MODES = { clinic: 'Clinic visit', online: 'Online' };
  const APPT_STATUS = { booked: 'Booked', completed: 'Completed', cancelled: 'Cancelled', noshow: 'No-show' };
  // Content (videos): shot → edited → scheduled → posted.
  const CONTENT_STATUS = { idea: 'With editor', edited: 'Received', scheduled: 'Scheduled', posted: 'Posted' };
  const PAY_METHODS = ['Cash', 'UPI', 'Card', 'Bank transfer'];

  const INJECTIONS = [
    ['Mounjaro', ['2.5mg', '5mg', '10mg', '15mg']],
    ['Wegovy', ['0.25mg', '1mg', '2.4mg']],
    ['Ozempic', ['0.25mg', '1mg']],
  ];
  const OTHER_CATEGORIES = ['Needles', 'Alcohol Swabs', 'Insulin Syringes', 'Ice Gel Packs', 'Travel Bags'];

  // A new clinic starts with the GLP-1 packages only; injections, protein, supplies and diet plans are added by the clinic.
  function defaultState() {
    const items = [];
    let n = 0;
    const add = (o) => items.push({
      id: 'i' + (++n), price: 0, incentive: null, opening: 0, lowAt: 5, unit: 'pcs', disabled: false, ...o,
    });
    PACKAGES.forEach((pk) => add(packageItem(pk)));
    applyItemDefaults(items);
    return {
      version: 1,
      settings: {
        clinic: 'The Prime Fit',
        incentive: { service: 0 },
        groups: { service: true, diet: true }, // what can be sold (switch off what the clinic does not offer)
        kinds: JSON.parse(JSON.stringify(BASE_KINDS)), // inventory / product types
        clinics: [{ id: 'c1', name: 'The Prime Fit Clinic', address: '', phone: '' }], // OPD locations (offline visits)
        dashShow: {}, // dashboard boxes switched off: { 'Box name': false }
        invoicePrefix: 'TPF', invoiceSeq: 0, gstin: '', invoiceGst: 0, invoiceNote: 'Thank you for choosing The Prime Fit.', // patient sale invoices
        phone: '+91 92051 36303', instagram: 'https://www.instagram.com/theprimefit_', youtube: 'https://www.youtube.com/@ThePrimeFit', website: 'www.theprimefit.in',
        dashHide: [], // dashboard cards switched off
        dietPlans: [],
        renewalDays: [75, 90], // renewal alert at 75 days, overdue at 90
        consultFee: 1000, // OPD consultation fee (₹)
        activeDays: 90,
        purchaseExpense: true, // purchases also book an expense
        stockAlerts: true, // low-stock alerts (each item can also be switched off)
        kitOn: true, // every injection sold also takes its kit out of stock
        kit: [], // [{ itemId, qty }] per injection pen
        lists: JSON.parse(JSON.stringify(DEFAULT_LISTS)),
        perms: JSON.parse(JSON.stringify(DEFAULT_PERMS)),
        sheetsUrl: '', sheetsSecret: '', autoSync: false, lastSync: 0,
        videoFee: 150, // default editor fee per video (₹)
        defaultGst: 12, // GST % filled on new purchase lines
        expenseOff: { categories: [], names: [] }, // expenses not counted in totals and profit
        founder: { name: '', title: 'Founder', mobile: '', email: '', share: 100, budget: 0, about: '' }, // founder profile (Founder Hub)
        followUpDays: 2, // new leads get a follow-up this many days ahead
        remindMins: 10, // follow-up alert this many minutes before
        autoAssign: false, // new leads are shared in turn between the lead-handling logins
        autoLockMins: 0, // sign out after this many idle minutes (0 = never)
        leadTags: ['GLP-1', 'Diet', 'Price asked', 'Callback', 'VIP'],
        waTemplates: {},
      },
      categories: [{ name: PACKAGE_CATEGORY, kind: 'service' }],
      items, team: [], patients: [], sales: [], purchases: [], expenses: [], moves: [], renewalsDone: {}, appointments: [],
      leads: [], log: [], doctors: [], content: [], editors: [], workDays: {}, campaigns: [], ideas: [], tasks: [], attendance: {}, targets: {}, notes: [], social: { youtube: {}, instagram: {}, fetchedAt: 0 },
      seeded: { packages: true, cleared: true, r7: true, r8: true },
      accounts: [
        { id: 'super', name: 'Super Admin', username: 'superadmin', role: 'super', hash: '', salt: '', len: 0, pin: '' },
        { id: 'admin', name: 'Admin', username: 'admin', role: 'admin', hash: '', salt: '', len: 0, pin: '' },
        { id: 'manager', name: 'Manager', username: 'manager', role: 'manager', hash: '', salt: '', len: 0, pin: '' },
        { id: 'desk', name: 'Front Desk', username: 'frontdesk', role: 'desk', hash: '', salt: '', len: 0, pin: '' },
      ],
    };
  }
  function packageItem([label, price, mrp, days]) {
    return { kind: 'service', category: PACKAGE_CATEGORY, brand: 'GLP-1', name: `GLP-1 Success Support · ${label}`, unit: 'package', price, mrp, days, lowAt: 0, track: false, includes: GLP1_INCLUDES, incentive: null };
  }
  // "Order required" when stock falls below 2 for protein and Mounjaro 10mg / 15mg (editable per item).
  function applyItemDefaults(items) {
    items.forEach((it) => {
      if (it.orderAt === undefined) it.orderAt = it.kind === 'protein' || /^mounjaro (10|15)\s*mg$/i.test(it.name) ? 2 : null;
      if (it.alertOff === undefined) it.alertOff = false;
      if (it.track === undefined) it.track = true; // false = service / unlimited: no stock count or alerts
    });
  }
  function kitDefaults(items) {
    return KIT_DEFAULTS.map(([name, qty]) => { const it = items.find((i) => i.name === name); return it ? { itemId: it.id, qty } : null; }).filter(Boolean);
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

  const slug = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '') || 'user';
  function uniqueUsername(accounts, name, selfId) {
    const base = slug(name); let u = base; let n = 2;
    while (accounts.some((a) => a.id !== selfId && a.username === u)) u = `${base}${n++}`;
    return u;
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
      if (!s || typeof s !== 'object') { syncKinds(d); return d; }
      Object.keys(d).forEach((k) => { if (s[k] == null) s[k] = d[k]; });
      const hadKit = s.settings && s.settings.kit;
      const hadKinds = s.settings && Array.isArray(s.settings.kinds);
      s.settings = { ...d.settings, ...s.settings, incentive: { ...d.settings.incentive, ...(s.settings || {}).incentive } };
      s.settings.lists = { ...JSON.parse(JSON.stringify(DEFAULT_LISTS)), ...(s.settings.lists || {}) };
      s.settings.perms = { ...JSON.parse(JSON.stringify(DEFAULT_PERMS)), ...(s.settings.perms || {}) };
      if (!hadKit) s.settings.kit = kitDefaults(s.items);
      applyItemDefaults(s.items);
      // Older versions: logins were three fixed roles (and before that one PIN in settings).
      if (s.users) {
        s.accounts = d.accounts.map((acc) => {
          const u = s.users[acc.id];
          return u ? { ...acc, name: u.name || acc.name, hash: u.hash || '', salt: u.salt || '', len: u.len || 0 } : acc;
        });
        delete s.users;
      }
      if (s.settings.pinHash && !s.accounts.find((a) => a.id === 'super').hash) Object.assign(s.accounts.find((a) => a.id === 'super'), { hash: s.settings.pinHash, salt: s.settings.pinSalt });
      ['pinHash', 'pinSalt', 'apiKey', 'aiModel', 'autoSaveScan'].forEach((k) => { delete s.settings[k]; });
      // Logins sign in with a user ID; older logins get one from their name.
      s.accounts.forEach((a) => { if (!a.username) a.username = uniqueUsername(s.accounts, a.name, a.id); });
      Object.keys(DEFAULT_PERMS).forEach((r) => { if (!s.settings.perms[r]) s.settings.perms[r] = JSON.parse(JSON.stringify(DEFAULT_PERMS[r])); });
      s.settings.expenseOff = { categories: [], names: [], ...(s.settings.expenseOff || {}) };
      s.settings.groups = { ...d.settings.groups, ...(s.settings.groups || {}) };
      if (s.settings.incentive.service == null) s.settings.incentive.service = 0;
      // Older data: add the GLP-1 support packages once.
      if (!(s.seeded && s.seeded.packages)) {
        if (!s.items.some((i) => i.kind === 'service')) {
          if (!s.categories.some((c) => c.name === PACKAGE_CATEGORY)) s.categories.unshift({ name: PACKAGE_CATEGORY, kind: 'service' });
          PACKAGES.forEach((pk, i) => s.items.push({ id: `pk${i + 1}${Date.now().toString(36)}`, opening: 0, disabled: false, alertOff: false, orderAt: null, ...packageItem(pk) }));
        }
        s.seeded = { ...(s.seeded || {}), packages: true };
      }
      if (s.settings.renewalDays[0] === 60 && s.settings.renewalDays[1] === 90) s.settings.renewalDays = [75, 90];
      // Version 1.4: the starter injections, protein, supplies and diet plans are removed when nothing uses them.
      if (!s.seeded.cleared) { clearStarterData(s); s.seeded.cleared = true; }
      // Version 1.5: Marketing and Team desk screens for Admin and Manager.
      if (!s.seeded.r7) {
        ['admin', 'manager'].forEach((r) => { const p = s.settings.perms[r]; if (p && p.screens) ['marketing', 'manage'].forEach((x) => { if (!p.screens.includes(x)) p.screens.push(x); }); });
        s.seeded.r7 = true;
      }
      // Version 1.6: expenses are Common or Founder; the old Founder category becomes Founder expenses.
      if (!s.seeded.r8) {
        (s.expenses || []).forEach((e) => { if (!e.scope) e.scope = e.category === 'Founder' ? 'founder' : 'common'; });
        s.seeded.r8 = true;
      }
      if (!Array.isArray(s.notes)) s.notes = [];
      if (!hadKinds) {
        s.settings.kinds = JSON.parse(JSON.stringify(BASE_KINDS));
        [['injection', 'Injection'], ['protein', 'Protein']].forEach(([id, name]) => {
          if (s.items.some((i) => i.kind === id && !i.deleted) || s.sales.some((x) => x.type === id)) s.settings.kinds.splice(1, 0, { id, name, sell: true });
        });
      }
      if (!Array.isArray(s.settings.clinics) || !s.settings.clinics.length) s.settings.clinics = JSON.parse(JSON.stringify(d.settings.clinics));
      s.settings.dashShow = s.settings.dashShow || {};
      syncKinds(s);
      return s;
    }
    function clearStarterData(s) {
      const used = new Set([...s.sales.map((x) => x.itemId), ...s.purchases.flatMap((p) => p.lines.map((l) => l.itemId)), ...s.moves.map((m) => m.itemId)]);
      const starter = new Set([...INJECTIONS.flatMap(([b, ds]) => ds.map((x) => `${b} ${x}`)), 'Protein Sachets', ...OTHER_CATEGORIES]);
      s.items = s.items.filter((i) => !(starter.has(i.name) && !used.has(i.id) && !(Number(i.opening) > 0)));
      const usedPlans = new Set(s.sales.filter((x) => x.type === 'diet').map((x) => x.planId));
      s.settings.dietPlans = (s.settings.dietPlans || []).filter((p) => !(['d1', 'd3'].includes(p.id) && !p.price && !usedPlans.has(p.id)));
      s.categories = s.categories.filter((c) => !(['Injection', 'Protein', ...OTHER_CATEGORIES].includes(c.name) && !s.items.some((i) => i.category === c.name)));
      s.settings.kit = (s.settings.kit || []).filter((k) => s.items.some((i) => i.id === k.itemId));
    }
    function save(source) {
      try { storage.setItem(KEY, JSON.stringify(S)); } catch (_) { throw new Error('Storage is full: export a backup and remove old data.'); }
      listeners.forEach((f) => f(source || 'local'));
    }
    const fail = (msg) => { throw new Error(msg); };
    let actor = '';
    /** Every change is written to the activity log with who made it. */
    function log(action, detail) {
      S.log.push({ at: clock ? clock().getTime() : Date.now(), by: actor || 'System', action, detail: String(detail || '') });
      if (S.log.length > LOG_MAX) S.log.splice(0, S.log.length - LOG_MAX);
    }

    // Team
    const member = (id) => S.team.find((m) => m.id === id) || null;
    const memberName = (id) => (member(id) || {}).name || '—';
    const TEAM_FIELDS = ['name', 'designation', 'mobile', 'salary', 'incentiveOn', 'joiningDate', 'incInjection', 'incProtein', 'payMode', 'salaryType', 'incentiveType', 'incPercent', 'incService'];
    const SALARY_TYPES = { monthly: 'Monthly fixed', daily: 'Per working day', none: 'No salary' };
    const INCENTIVE_TYPES = { product: 'Fixed ₹ per product / package', percent: '% of sale amount', none: 'No incentive' };
    const numOrNull = (v) => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v));
    function saveMember(input) {
      if (!low(input.name)) fail('Name is required');
      let m = input.id && member(input.id);
      const isNew = !m;
      if (!m) { m = { id: uid('m'), disabled: false, created: Date.now() }; S.team.push(m); }
      TEAM_FIELDS.forEach((k) => { if (k in input) m[k] = input[k]; });
      m.salary = Number(m.salary) || 0;
      m.incentiveOn = m.incentiveOn !== false;
      // Personal incentive rates; blank = the clinic default (₹1000 per injection, ₹500 per protein sale).
      m.incInjection = numOrNull(m.incInjection);
      m.incProtein = numOrNull(m.incProtein);
      m.incService = numOrNull(m.incService);
      m.incPercent = numOrNull(m.incPercent);
      if (!SALARY_TYPES[m.salaryType]) m.salaryType = 'monthly';
      if (!INCENTIVE_TYPES[m.incentiveType]) m.incentiveType = m.incentiveOn === false ? 'none' : 'product';
      m.incentiveOn = m.incentiveType !== 'none';
      // What counts in this person's monthly pay: salary + incentive, salary only or incentive only.
      if (!['both', 'salary', 'incentive'].includes(m.payMode)) m.payMode = 'both';
      log(isNew ? 'Team member added' : 'Team member updated', m.name);
      save();
      return m;
    }
    function setMemberDisabled(id, disabled) { const m = member(id); if (m) { m.disabled = !!disabled; log(disabled ? 'Team member disabled' : 'Team member enabled', m.name); save(); } }
    function deleteMember(id) {
      // Sales keep the reference name, so history stays readable.
      const m = member(id);
      S.team = S.team.filter((x) => x.id !== id);
      S.accounts.forEach((a) => { if (a.memberId === id) a.memberId = ''; });
      log('Team member deleted', m ? m.name : id);
      save();
    }
    /** Incentive rate for one person: their own rate, else the product's, else the clinic default. */
    const rateOwn = (m, type) => (m ? (type === 'injection' ? m.incInjection : type === 'protein' ? m.incProtein : type === 'service' ? m.incService : null) : null);
    function rateFor(m, type, it) {
      const own = m && (type === 'injection' ? m.incInjection : type === 'protein' ? m.incProtein : type === 'service' ? m.incService : null);
      if (own != null) return own;
      if (it && it.incentive != null) return it.incentive;
      return (S.settings.incentive || {})[type] || 0;
    }

    // Inventory / product types
    const kindName = (id) => (id === 'diet' ? 'Diet Support' : ((S.settings.kinds || []).find((k) => k.id === id) || {}).name || KINDS[id] || id || '');
    const kinds = () => (S.settings.kinds || []).filter((k) => !k.removed);
    function saveKind(input) {
      const name = String(input.name || '').trim();
      if (!name) fail('Enter the type name');
      const list = S.settings.kinds;
      let k = input.id && list.find((x) => x.id === input.id);
      if (list.some((x) => !x.removed && x !== k && low(x.name) === low(name))) fail(`“${name}” already exists`);
      if (!k) {
        // Injection and protein types keep their special rules (per-pen incentive, kit, renewals, own sheets).
        const known = /inject/i.test(name) ? 'injection' : /protein/i.test(name) ? 'protein' : '';
        const old = known && list.find((x) => x.id === known);
        if (old && old.removed) { k = old; delete k.removed; } else {
          k = { id: known && !old ? known : uid('k'), name, sell: true };
          list.splice(list.length - 1, 0, k);
        }
      }
      k.name = name;
      if ('sell' in input && k.id !== 'other') k.sell = !!input.sell;
      if (k.id === 'other') k.sell = false;
      if (S.settings.incentive[k.id] == null && k.sell) S.settings.incentive[k.id] = Number(input.incentive) || 0;
      if (!S.categories.some((c) => c.kind === k.id) && k.id !== 'other') S.categories.push({ name, kind: k.id });
      syncKinds(S);
      log('Product type saved', name);
      save();
      return k;
    }
    function deleteKind(id) {
      if (id === 'service') fail('Services stay; switch them off in Settings if you do not sell them');
      const k = (S.settings.kinds || []).find((x) => x.id === id);
      if (!k) return;
      const n = liveItems().filter((i) => i.kind === id).length;
      if (n) fail(`Delete or move its ${n} product${n > 1 ? 's' : ''} first`);
      // Kept (hidden) so old sales still show their type name.
      if (S.sales.some((x) => x.type === id)) k.removed = true; else S.settings.kinds = S.settings.kinds.filter((x) => x.id !== id);
      S.categories = S.categories.filter((c) => c.kind !== id || S.items.some((i) => i.category === c.name && !i.deleted));
      syncKinds(S);
      log('Product type deleted', k.name);
      save();
    }
    function moveKind(id, dir) {
      const list = S.settings.kinds; const i = list.findIndex((x) => x.id === id); const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
      syncKinds(S); save();
    }

    // Marketing: ad campaigns (spend → leads → patients) and a bank of content ideas.
    const listFix = (k) => { if (!Array.isArray(S[k])) S[k] = []; return S[k]; };
    function saveCampaign(input) {
      const name = String(input.name || '').trim();
      if (!name) fail('Enter the campaign name');
      let c = input.id && listFix('campaigns').find((x) => x.id === input.id);
      if (!c) { c = { id: uid('cp'), created: Date.now() }; S.campaigns.push(c); }
      Object.assign(c, { name, platform: String(input.platform || '').trim(), start: input.start || today(), end: input.end || '', budget: Number(input.budget) || 0, spent: Number(input.spent) || 0, goal: String(input.goal || '').trim(), notes: String(input.notes || '').trim() });
      log('Campaign saved', name); save();
      return c;
    }
    function deleteCampaign(id) { const c = listFix('campaigns').find((x) => x.id === id); S.campaigns = S.campaigns.filter((x) => x.id !== id); if (c) log('Campaign deleted', c.name); save(); }
    /** Each campaign's leads are the leads from its platform (lead source) within its dates. */
    function campaignStats(c) {
      const end = c.end || today();
      const leads = S.leads.filter((l) => low(l.source) === low(c.platform) && l.date >= c.start && l.date <= end);
      const won = leads.filter((l) => l.patientId || l.apptId || ['Converted', 'Appointment booked'].includes(l.status));
      const pids = new Set(won.map((l) => l.patientId).filter(Boolean));
      const revenue = r2(sum(S.sales.filter((x) => pids.has(x.patientId) && x.date >= c.start), (x) => x.amount));
      return { leads: leads.length, won: won.length, revenue, cpl: leads.length ? r2(c.spent / leads.length) : 0, roi: c.spent ? r2(((revenue - c.spent) / c.spent) * 100) : 0 };
    }
    function leadSources(range) {
      const list = S.leads.filter((l) => inRange(l.date, range));
      const by = {};
      list.forEach((l) => {
        const k = l.source || 'Not set';
        by[k] = by[k] || { source: k, leads: 0, won: 0 };
        by[k].leads += 1;
        if (l.patientId || l.apptId || ['Converted', 'Appointment booked'].includes(l.status)) by[k].won += 1;
      });
      return Object.values(by).map((x) => ({ ...x, conversion: x.leads ? Math.round((x.won / x.leads) * 100) : 0 })).sort((a, b) => b.leads - a.leads);
    }
    function saveIdea(input) {
      let x = input.id && listFix('ideas').find((i) => i.id === input.id);
      if ((!x || 'title' in input) && !String(input.title || '').trim()) fail('Write the idea');
      if (!x) { x = { id: uid('id'), created: Date.now(), status: 'idea' }; S.ideas.push(x); }
      ['title', 'format', 'hook', 'tags', 'status', 'platform'].forEach((k) => { if (k in input) x[k] = String(input[k] || '').trim(); });
      save();
      return x;
    }
    function deleteIdea(id) { S.ideas = listFix('ideas').filter((x) => x.id !== id); save(); }

    // Management: tasks, attendance and monthly targets.
    function saveTask(input) {
      const title = String(input.title || '').trim();
      if (!title) fail('Write the task');
      let t = input.id && listFix('tasks').find((x) => x.id === input.id);
      if (!t) { t = { id: uid('t'), created: Date.now(), by: actor, done: false }; S.tasks.push(t); }
      Object.assign(t, { title, assignedTo: input.assignedTo || '', due: input.due || '', priority: input.priority || 'normal', notes: String(input.notes || '').trim() });
      log('Task saved', title); save();
      return t;
    }
    function setTaskDone(id, done) { const t = listFix('tasks').find((x) => x.id === id); if (t) { t.done = !!done; t.doneAt = done ? Date.now() : 0; t.doneBy = done ? actor : ''; log(done ? 'Task done' : 'Task reopened', t.title); save(); } }
    function deleteTask(id) { S.tasks = listFix('tasks').filter((x) => x.id !== id); save(); }
    const ATT = { P: 1, H: 0.5, A: 0, L: 0, O: 0 };
    /** Mark one person on one day: P present, H half day, A absent, L leave, O week off. Daily-wage days follow. */
    function setAttendance(date, memberId, mark) {
      if (!S.attendance || typeof S.attendance !== 'object') S.attendance = {};
      S.attendance[date] = { ...(S.attendance[date] || {}) };
      if (mark) S.attendance[date][memberId] = mark; else delete S.attendance[date][memberId];
      const month = date.slice(0, 7);
      const days = sum(Object.keys(S.attendance).filter((d) => d.startsWith(month)), (d) => ATT[(S.attendance[d] || {})[memberId]] || 0);
      S.workDays = S.workDays || {};
      S.workDays[month] = { ...(S.workDays[month] || {}), [memberId]: days };
      save();
    }
    function attendanceMonth(month) {
      return S.team.filter((m) => !m.disabled).map((m) => {
        const marks = Object.keys(S.attendance || {}).filter((d) => d.startsWith(month)).map((d) => S.attendance[d][m.id]).filter(Boolean);
        const n = (k) => marks.filter((x) => x === k).length;
        return { memberId: m.id, name: m.name, present: n('P'), half: n('H'), absent: n('A'), leave: n('L'), off: n('O'), days: sum(marks, (x) => ATT[x] || 0) };
      });
    }
    function setTarget(month, patch) {
      if (!S.targets || typeof S.targets !== 'object') S.targets = {};
      S.targets[month] = { members: {}, ...(S.targets[month] || {}), ...patch };
      save();
    }
    function targetProgress(month) {
      const t = (S.targets || {})[month] || { members: {} };
      const r = { from: `${month}-01`, to: `${month}-31` };
      const sales = S.sales.filter((x) => inRange(x.date, r));
      const fees = sum(S.appointments.filter((a) => inRange(a.date, r)), feeEarned);
      const revenue = r2(sum(sales, (x) => x.amount) + fees);
      const leads = S.leads.filter((l) => inRange(l.date, r)).length;
      const team = S.team.filter((m) => !m.disabled).map((m) => {
        const mine = r2(sum(sales.filter((x) => x.splits.some((y) => y.memberId === m.id)), (x) => x.amount * ((x.splits.find((y) => y.memberId === m.id).pct || 0) / 100)));
        const goal = Number((t.members || {})[m.id]) || 0;
        return { memberId: m.id, name: m.name, sales: mine, goal, pct: goal ? Math.round((mine / goal) * 100) : 0 };
      });
      const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
      return { month, revenue, revenueGoal: Number(t.revenue) || 0, revenuePct: pct(revenue, Number(t.revenue) || 0), leads, leadsGoal: Number(t.leads) || 0, leadsPct: pct(leads, Number(t.leads) || 0), patients: new Set(sales.filter((x) => x.patientType === 'new').map((x) => x.patientId)).size, patientsGoal: Number(t.patients) || 0, team };
    }

    // Founder Hub: discussions, decisions and important notes.
    function saveNote(input) {
      const text = String(input.text || '').trim(); const title = String(input.title || '').trim();
      let n = input.id && listFix('notes').find((x) => x.id === input.id);
      if ((!n || 'title' in input || 'text' in input) && !title && !text) fail('Write the note');
      if (!n) { n = { id: uid('n'), at: Date.now(), by: actor, pinned: false, done: false, tag: 'discussion' }; S.notes.push(n); }
      if ('title' in input) n.title = title;
      if ('text' in input) n.text = text;
      ['tag', 'due'].forEach((k) => { if (k in input) n[k] = String(input[k] || ''); });
      ['pinned', 'done'].forEach((k) => { if (k in input) n[k] = !!input[k]; });
      n.updated = Date.now();
      save();
      return n;
    }
    function deleteNote(id) { S.notes = listFix('notes').filter((x) => x.id !== id); save(); }
    /** Ads report: spend from Ads expenses (name = platform) and campaigns, leads from the lead source, revenue from converted patients. */
    function adReport(range) {
      const by = {};
      const row = (k) => { const key = k || 'Ads'; by[low(key)] = by[low(key)] || { platform: key, spend: 0, entries: 0, manualLeads: 0, hasManual: false, leads: 0, won: 0, revenue: 0 }; return by[low(key)]; };
      S.expenses.filter((e) => inRange(e.date, range) && /^ads?$|advert|marketing/i.test(e.category || '')).forEach((e) => {
        const r = row(e.name || 'Ads'); r.spend = r2(r.spend + e.amount); r.entries += 1;
        if (e.adLeads != null) { r.manualLeads += e.adLeads; r.hasManual = true; }
      });
      const leads = S.leads.filter((l) => inRange(l.date, range));
      Object.values(by).forEach((r) => {
        const mine = leads.filter((l) => low(l.source) === low(r.platform));
        r.leads = mine.length;
        const won = mine.filter((l) => l.patientId || l.apptId || ['Converted', 'Appointment booked'].includes(l.status));
        r.won = won.length;
        const pids = new Set(won.map((l) => l.patientId).filter(Boolean));
        r.revenue = r2(sum(S.sales.filter((x) => pids.has(x.patientId) && inRange(x.date, range)), (x) => x.amount));
        const n = r.leads || r.manualLeads;
        r.cpl = n ? r2(r.spend / n) : 0;
        r.roi = r.spend ? r2(((r.revenue - r.spend) / r.spend) * 100) : 0;
      });
      // Lead sources with leads but no spend still show (organic).
      leads.forEach((l) => { if (l.source && !by[low(l.source)]) { const r = row(l.source); r.organic = true; } });
      Object.values(by).filter((r) => r.organic).forEach((r) => {
        const mine = leads.filter((l) => low(l.source) === low(r.platform));
        r.leads = mine.length; r.won = mine.filter((l) => l.patientId || l.apptId || ['Converted', 'Appointment booked'].includes(l.status)).length;
      });
      const rows = Object.values(by).sort((a, b) => b.spend - a.spend || b.leads - a.leads);
      const spend = r2(sum(rows, (r) => r.spend)); const paidLeads = sum(rows.filter((r) => r.spend), (r) => r.leads || r.manualLeads);
      return { rows, spend, leads: leads.length, paidLeads, cpl: paidLeads ? r2(spend / paidLeads) : 0, won: sum(rows, (r) => r.won), revenue: r2(sum(rows.filter((r) => r.spend), (r) => r.revenue)) };
    }
    /** Every alert in the app in one list (Founder Hub, bell). level: bad | warn | info */
    function alerts() {
      const d = today(); const out = [];
      const add = (level, area, text, go) => out.push({ level, area, text, go });
      stockItems().forEach((i) => {
        const st = stockOf(i.id);
        if (i.orderAt != null && st < i.orderAt) add('bad', 'Stock', `Order required: ${i.name} (${st} left)`, 'inventory');
        else if (S.settings.stockAlerts !== false && !i.alertOff && st <= (i.lowAt || 0)) add('warn', 'Stock', `Low stock: ${i.name} (${st} left)`, 'inventory');
      });
      const open = S.leads.filter((l) => !isClosedLead(l));
      const over = open.filter((l) => l.followUp && l.followUp < d).length; if (over) add('bad', 'Leads', `${over} lead follow-up${over > 1 ? 's' : ''} overdue`, 'leads');
      const due = open.filter((l) => l.followUp === d).length; if (due) add('info', 'Leads', `${due} follow-up${due > 1 ? 's' : ''} due today`, 'leads');
      const noOwner = open.filter((l) => !l.assignedTo).length; if (noOwner) add('warn', 'Leads', `${noOwner} open lead${noOwner > 1 ? 's' : ''} not assigned`, 'leads');
      const ren = renewals().filter((r) => r.stage && !r.done).length; if (ren) add('warn', 'Renewals', `${ren} patient${ren > 1 ? 's' : ''} due for renewal`, 'renewals');
      const unpaid = S.appointments.filter((a) => a.status !== 'cancelled' && !a.paid && a.date <= d && Number(a.fee) > 0).length; if (unpaid) add('warn', 'OPD', `${unpaid} OPD fee${unpaid > 1 ? 's' : ''} unpaid`, 'appointments');
      const posts = S.content.filter((c) => c.status === 'scheduled' && c.scheduledDate && c.scheduledDate < d).length; if (posts) add('warn', 'Content', `${posts} scheduled post${posts > 1 ? 's' : ''} overdue`, 'content');
      const tasks = listFix('tasks').filter((t) => !t.done && t.due && t.due < d).length; if (tasks) add('warn', 'Tasks', `${tasks} task${tasks > 1 ? 's' : ''} overdue`, 'manage');
      listFix('campaigns').filter((c) => c.budget && c.spent > c.budget).forEach((c) => add('bad', 'Ads', `${c.name} is over budget (₹${Number(c.spent).toLocaleString('en-IN')} of ₹${Number(c.budget).toLocaleString('en-IN')})`, 'marketing'));
      const f = S.settings.founder || {}; const month = d.slice(0, 7);
      if (f.budget) { const spent = r2(sum(S.expenses.filter((e) => e.scope === 'founder' && (e.date || '').startsWith(month)), (e) => e.amount)); if (spent > f.budget) add('bad', 'Founder', `Founder expenses ₹${spent.toLocaleString('en-IN')} are over the monthly limit ₹${Number(f.budget).toLocaleString('en-IN')}`, 'founder'); }
      const t = (S.targets || {})[month];
      if (t && t.revenue) { const tp = targetProgress(month); const dayPct = Math.round((Number(d.slice(8)) / 30) * 100); if (tp.revenuePct + 15 < dayPct) add('warn', 'Targets', `Revenue is at ${tp.revenuePct}% of target with ${dayPct}% of the month gone`, 'manage'); }
      listFix('notes').filter((n) => !n.done && n.due && n.due <= d).forEach((n) => add('info', 'Notes', `Due: ${n.title || n.text.slice(0, 40)}`, 'founder'));
      const order = { bad: 0, warn: 1, info: 2 };
      return out.sort((a, b) => order[a.level] - order[b.level]);
    }
    /** Next login to get a new lead when auto-assign is on (fewest open leads first). */
    function nextAssignee() {
      const pool = S.accounts.filter((a) => !a.disabled && ['desk', 'marketing'].includes(a.role));
      if (!pool.length) return '';
      const load = (id) => S.leads.filter((l) => l.assignedTo === id && !isClosedLead(l)).length;
      return pool.sort((a, b) => load(a.id) - load(b.id))[0].id;
    }

    // OPD clinics (locations for clinic visits)
    const clinic = (id) => (S.settings.clinics || []).find((c) => c.id === id) || null;
    function saveClinic(input) {
      const name = String(input.name || '').trim();
      if (!name) fail('Enter the clinic name');
      let c = input.id && clinic(input.id);
      if (!c) { c = { id: uid('c') }; S.settings.clinics.push(c); }
      Object.assign(c, { name, address: String(input.address || '').trim(), phone: String(input.phone || '').trim(), timings: String(input.timings || '').trim(), disabled: !!input.disabled });
      log('Clinic saved', name);
      save();
      return c;
    }
    function deleteClinic(id) {
      const c = clinic(id);
      if (!c) return;
      if (S.settings.clinics.length === 1) fail('Keep at least one clinic');
      S.settings.clinics = S.settings.clinics.filter((x) => x.id !== id);
      log('Clinic deleted', c.name);
      save();
    }

    // Items, categories, stock
    const item = (id) => S.items.find((i) => i.id === id) || null;
    // Deleted items keep their history (sales, purchases) but appear nowhere else.
    const liveItems = () => S.items.filter((i) => !i.deleted);
    // Items whose stock is counted (not deleted, not disabled, not unlimited services).
    const stockItems = () => liveItems().filter((i) => !i.disabled && i.track !== false);
    const itemsOf = (kind, all) => liveItems().filter((i) => i.kind === kind && (all || !i.disabled));
    function saveItem(input) {
      if (!low(input.name)) fail('Name is required');
      let it = input.id && item(input.id);
      if (!it) {
        it = { id: uid('i'), brand: '', price: 0, incentive: null, opening: 0, lowAt: 5, unit: 'pcs', disabled: false };
        S.items.push(it);
      }
      const isNew = !input.id;
      ['name', 'brand', 'category', 'kind', 'price', 'incentive', 'incentiveType', 'opening', 'lowAt', 'unit', 'disabled', 'alertOff', 'orderAt', 'track', 'mrp', 'days', 'includes'].forEach((k) => {
        if (k in input) it[k] = input[k];
      });
      it.alertOff = !!it.alertOff;
      it.track = it.track !== false;
      it.orderAt = it.orderAt === '' || it.orderAt == null ? null : Number(it.orderAt);
      const cat = S.categories.find((c) => c.name === it.category);
      if (!cat) S.categories.push({ name: it.category || 'Other', kind: it.kind || 'other' });
      it.kind = it.kind || (cat ? cat.kind : 'other');
      ['price', 'opening', 'lowAt'].forEach((k) => { it[k] = Number(it[k]) || 0; });
      it.incentive = it.incentive === '' || it.incentive == null ? null : Number(it.incentive);
      it.mrp = it.mrp === '' || it.mrp == null ? null : Number(it.mrp) || 0;
      it.days = it.days === '' || it.days == null ? null : Number(it.days) || 0;
      if (it.incentiveType !== 'percent') it.incentiveType = 'fixed';
      if (it.kind === 'service' && input.track === undefined && isNew) it.track = false;
      log(isNew ? 'Item added' : 'Item updated', it.name);
      save();
      return it;
    }
    function deleteItem(id) {
      const it = item(id);
      if (!it) return;
      // With stock history the item is hidden (sales and purchases keep its name); otherwise removed.
      if (S.moves.some((mv) => mv.itemId === id)) Object.assign(it, { deleted: true, disabled: true });
      else S.items = S.items.filter((i) => i.id !== id);
      S.settings.kit = S.settings.kit.filter((k) => k.itemId !== id);
      S.items.forEach((i) => { if (i.kit) i.kit = i.kit.filter((k) => k.itemId !== id); });
      log('Item deleted', it.name);
      save();
    }
    /** Move an item up (-1) or down (+1) within its category; lists and reports follow this order. */
    function moveItem(id, dir) {
      const it = item(id);
      if (!it) return;
      const peers = liveItems().filter((i) => i.category === it.category);
      const other = peers[peers.indexOf(it) + (dir < 0 ? -1 : 1)];
      if (!other) return;
      const a = S.items.indexOf(it); const b = S.items.indexOf(other);
      S.items[a] = other; S.items[b] = it;
      save();
    }
    function moveCategory(name, dir) {
      const i = S.categories.findIndex((c) => c.name === name);
      const j = i + (dir < 0 ? -1 : 1);
      if (i < 0 || j < 0 || j >= S.categories.length) return;
      [S.categories[i], S.categories[j]] = [S.categories[j], S.categories[i]];
      save();
    }
    /** Items taken out of stock with each unit of one product (its own kit); null/[] = none. */
    function setItemKit(id, kit) {
      const it = item(id);
      if (!it) fail('Unknown item');
      it.kit = (kit || []).filter((k) => k.itemId && k.itemId !== id && item(k.itemId) && Number(k.qty) > 0).map((k) => ({ itemId: k.itemId, qty: Number(k.qty) }));
      log('Product kit updated', `${it.name}: ${it.kit.map((k) => `${item(k.itemId).name} ${k.qty}`).join(', ') || 'none'}`);
      save();
    }
    function addCategory(name, kind) {
      const n = String(name || '').trim();
      if (!n) fail('Category name is required');
      if (S.categories.some((c) => low(c.name) === low(n))) fail('That category already exists');
      S.categories.push({ name: n, kind: kind || 'other' });
      log('Category added', n);
      save();
    }
    function renameCategory(oldName, name) {
      const n = String(name || '').trim();
      const c = S.categories.find((x) => x.name === oldName);
      if (!c || !n) fail('Enter a category name');
      if (S.categories.some((x) => x !== c && low(x.name) === low(n))) fail('That category already exists');
      S.items.forEach((i) => { if (i.category === oldName) i.category = n; });
      c.name = n;
      log('Category renamed', `${oldName} → ${n}`);
      save();
    }
    function deleteCategory(name) {
      if (liveItems().some((i) => i.category === name)) fail('Move or delete the items in this category first');
      S.categories = S.categories.filter((c) => c.name !== name);
      log('Category deleted', name);
      save();
    }
    /** Kit taken out of stock with every injection pen (needles, swabs, ice gel, travel bag…). */
    function setKit(kit) {
      S.settings.kit = (kit || []).filter((k) => k.itemId && item(k.itemId) && Number(k.qty) > 0).map((k) => ({ itemId: k.itemId, qty: Number(k.qty) }));
      log('Injection kit updated', S.settings.kit.map((k) => `${item(k.itemId).name} ${k.qty}`).join(', '));
      save();
    }
    function stockOf(itemId, until) {
      const it = item(itemId);
      if (!it) return 0;
      if (it.track === false) return Infinity; // unlimited service
      return it.opening + sum(S.moves.filter((m) => m.itemId === itemId && (!until || m.date <= until)), (m) => m.qty);
    }
    function adjustStock(itemId, qty, note, date) {
      if (!item(itemId)) fail('Unknown item');
      if (!Number(qty)) fail('Enter a quantity');
      S.moves.push({ id: uid('v'), itemId, qty: Number(qty), type: 'adjust', ref: note || '', date: date || today() });
      log('Stock adjusted', `${item(itemId).name} ${Number(qty) > 0 ? '+' : ''}${qty}${note ? ` (${note})` : ''}`);
      save();
    }
    // Low-stock alerts can be switched off for the whole clinic or per item.
    const lowStock = () => (S.settings.stockAlerts === false ? [] : stockItems().filter((i) => !i.alertOff && stockOf(i.id) <= i.lowAt)
      .map((i) => ({ item: i, stock: stockOf(i.id) })));
    const orderRequired = () => stockItems().filter((i) => i.orderAt != null && stockOf(i.id) < i.orderAt)
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
    function updatePatient(id, input) {
      const p = S.patients.find((x) => x.id === id);
      if (!p) fail('Patient not found');
      const nm = String(input.name || '').trim();
      if (!nm) fail('Patient name is required');
      p.name = nm; p.mobile = String(input.mobile || '').trim();
      ['age', 'gender', 'city', 'notes'].forEach((k) => { if (k in input) p[k] = input[k]; });
      S.sales.forEach((x) => { if (x.patientId === id) { x.patientName = p.name; x.mobile = p.mobile; } });
      S.appointments.forEach((x) => { if (x.patientId === id) { x.patientName = p.name; x.mobile = p.mobile; } });
      log('Patient updated', p.name);
      save();
      return p;
    }
    /** Delete a patient. With withRecords, their sales (stock goes back) and appointments go too. */
    function deletePatient(id, withRecords) {
      const p = S.patients.find((x) => x.id === id);
      if (!p) fail('Patient not found');
      const saleIds = S.sales.filter((x) => x.patientId === id).map((x) => x.id);
      const appts = S.appointments.filter((x) => x.patientId === id).length;
      if ((saleIds.length || appts) && !withRecords) fail(`${p.name} has ${saleIds.length} sales and ${appts} appointments`);
      S.sales = S.sales.filter((x) => x.patientId !== id);
      S.moves = S.moves.filter((m) => !saleIds.includes(m.ref));
      S.appointments = S.appointments.filter((x) => x.patientId !== id);
      S.leads.forEach((l) => { if (l.patientId === id) l.patientId = ''; });
      S.patients = S.patients.filter((x) => x.id !== id);
      log('Patient deleted', `${p.name}${saleIds.length || appts ? ` with ${saleIds.length} sales and ${appts} appointments` : ''}`);
      save();
    }

    // Sales
    function incentiveFor(input) {
      if (input.type === 'diet') {
        const plan = S.settings.dietPlans.find((p) => p.id === input.planId);
        return plan ? Number(plan.incentive) || 0 : 0;
      }
      const it = item(input.itemId);
      if (it && it.incentiveType === 'percent') return Math.round((Number(input.amount) || 0) * (Number(it.incentive) || 0) / 100);
      const base = it && it.incentive != null ? it.incentive : S.settings.incentive[input.type] || 0;
      // Injections pay per pen; a protein sale pays once, whatever the quantity.
      return input.type === 'injection' ? base * (Number(input.qty) || 1) : base;
    }

    /**
     * Each reference earns their own rate × their share: injection per pen, protein once per sale,
     * diet support by plan. Incentive status Off = ₹0.
     */
    function splitsFor(input, refs) {
      const units = input.type === 'injection' ? (Number(input.qty) || 1) : 1;
      const plan = input.type === 'diet' ? S.settings.dietPlans.find((p) => p.id === input.planId) : null;
      const it = input.type === 'diet' ? null : item(input.itemId);
      const amount = Number(input.amount) || 0;
      const bases = refs.map((r) => {
        const m = member(r.memberId);
        // % of sale: from the person's profile, else the product's own % incentive.
        if (m && m.incentiveType === 'percent') return Math.round(amount * (Number(m.incPercent) || 0) / 100);
        if (input.type !== 'diet' && it && it.incentiveType === 'percent' && !(m && rateOwn(m, input.type) != null)) return Math.round(amount * (Number(it.incentive) || 0) / 100);
        return input.type === 'diet' ? (plan ? Number(plan.incentive) || 0 : 0) : rateFor(m, input.type, it) * units;
      });
      const same = bases.every((b) => b === bases[0]);
      // Same rate for everyone: split exactly (remainder to the first); otherwise each gets rate × share.
      const parts = same ? splitIncentive(bases[0], refs) : refs.map((r, i) => ({ memberId: r.memberId, pct: r.pct, amount: Math.round(bases[i] * r.pct / 100) }));
      return parts.map((x) => {
        const m = member(x.memberId);
        return { ...x, name: m ? m.name : '—', amount: m && (m.incentiveOn === false || m.incentiveType === 'none') ? 0 : x.amount };
      });
    }
    function previewSplits(input) {
      if (!input.refId) return [];
      const refs = [{ memberId: input.refId, pct: 100 }];
      if (input.sharedId && input.sharedId !== input.refId) {
        const pct = input.sharePct == null || input.sharePct === '' ? 50 : Math.min(100, Math.max(0, Number(input.sharePct)));
        refs[0].pct = 100 - pct; refs.push({ memberId: input.sharedId, pct });
      }
      return splitsFor(input, refs);
    }
    /** Kit moves for an injection sale (per pen), when switched on. */
    // A product's own kit wins; injections without one use the clinic injection kit.
    const kitOf = (it) => (it && it.kit && it.kit.length ? it.kit : it && it.kind === 'injection' ? S.settings.kit : []);
    const kitFor = (sale) => (sale.itemId && S.settings.kitOn !== false
      ? kitOf(item(sale.itemId)).filter((k) => item(k.itemId) && !item(k.itemId).deleted).map((k) => ({ itemId: k.itemId, qty: k.qty * sale.qty })) : []);

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
      const splits = splitsFor({ ...input, type, qty }, refs);
      const patient = findOrCreatePatient(input.patientName, input.mobile);
      const earlier = S.sales.some((s) => s.patientId === patient.id && s.id !== id && s.date <= date);
      return {
        id, type, date, patientId: patient.id, patientName: patient.name, mobile: patient.mobile,
        patientType: input.patientType || (earlier ? 'renewal' : 'new'),
        itemId: type === 'diet' ? null : input.itemId, planId: type === 'diet' ? input.planId : null,
        product, qty, amount,
        refId: input.refId, sharedId: refs[1] ? refs[1].memberId : '', sharePct: refs[1] ? refs[1].pct : 0,
        dietitianId: input.dietitianId || '', notes: String(input.notes || '').trim(), payMethod: input.payMethod || '',
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
        if (item(sale.itemId).track !== false && available < sale.qty && !input.allowNegative) {
          fail(`Only ${available} ${item(sale.itemId).unit} of ${sale.product} in stock`);
        }
      }
      if (existing) {
        S.moves = S.moves.filter((m) => m.ref !== existing.id);
        Object.assign(existing, sale, { created: existing.created, invoiceNo: existing.invoiceNo });
      } else { sale.invoiceNo = nextInvoiceNo(); S.sales.push(sale); }
      if (sale.itemId) S.moves.push({ id: uid('v'), itemId: sale.itemId, qty: -sale.qty, type: 'sale', ref: sale.id, date: sale.date });
      kitFor(sale).forEach((k) => S.moves.push({ id: uid('v'), itemId: k.itemId, qty: -k.qty, type: 'kit', ref: sale.id, date: sale.date }));
      log(existing ? 'Sale updated' : 'Sale added', `${sale.product} × ${sale.qty} · ${sale.patientName} · ₹${sale.amount}`);
      save();
      return existing || sale;
    }
    // Patient invoices: TPF-2026-0001, numbered in order of saving.
    function nextInvoiceNo() {
      S.settings.invoiceSeq = (Number(S.settings.invoiceSeq) || 0) + 1;
      return `${S.settings.invoicePrefix || 'INV'}-${today().slice(0, 4)}-${String(S.settings.invoiceSeq).padStart(4, '0')}`;
    }
    /** Everything the invoice PDF needs; older sales get their number the first time. */
    function invoiceFor(id) {
      const x = S.sales.find((s) => s.id === id);
      if (!x) fail('Sale not found');
      if (!x.invoiceNo) { x.invoiceNo = nextInvoiceNo(); save(); }
      const it = x.itemId ? item(x.itemId) : null;
      const gst = Number(S.settings.invoiceGst) || 0; // GST % included in the amount
      const taxable = r2(x.amount / (1 + gst / 100));
      const rate = x.qty ? r2(x.amount / x.qty) : x.amount;
      return {
        no: x.invoiceNo, date: x.date, patient: x.patientName, mobile: x.mobile, patientId: x.patientId,
        lines: [{ name: x.product, detail: it && it.days ? `${it.days} days${it.includes ? ` · ${it.includes}` : ''}` : (it && it.includes) || '', qty: x.qty, rate, mrp: it && it.mrp ? it.mrp : null, amount: x.amount }],
        total: x.amount, gst, taxable, tax: r2(x.amount - taxable), payMethod: x.payMethod || '', by: memberName(x.refId), notes: x.notes,
      };
    }
    function deleteSale(id) {
      const x = S.sales.find((s) => s.id === id);
      S.sales = S.sales.filter((s) => s.id !== id);
      S.moves = S.moves.filter((m) => m.ref !== id);
      if (x) log('Sale deleted', `${x.product} · ${x.patientName} · ₹${x.amount}`);
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
        date: input.date || today(), scanned: !!input.scanned, gstOff: !!input.gstOff,
        lines: lines.map((l) => (input.gstOff ? { ...l, gst: 0 } : l)).map((l) => ({
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
          const cat = k === 'other' || !KINDS[k] ? 'Miscellaneous' : `${k === 'service' ? 'Service' : KINDS[k]} Purchase`;
          if (!S.settings.lists.expenseCategories.includes(cat)) S.settings.lists.expenseCategories.push(cat);
          byCat[cat] = (byCat[cat] || 0) + l.total;
        });
        Object.entries(byCat).forEach(([category, amount]) => S.expenses.push({
          id: uid('e'), date: p.date, category, amount: r2(amount), note: `Invoice ${p.invoiceNo || ''} ${p.vendor}`.trim(), ref: p.id, auto: true,
        }));
      }
      log(existing ? 'Purchase updated' : 'Purchase added', `${p.vendor || 'Vendor'} ${p.invoiceNo} · ${p.lines.map((l) => `${l.name} +${l.qty}`).join(', ')}`);
      save();
      return existing || p;
    }
    function deletePurchase(id) {
      const x = S.purchases.find((p) => p.id === id);
      S.purchases = S.purchases.filter((p) => p.id !== id);
      S.moves = S.moves.filter((m) => m.ref !== id);
      S.expenses = S.expenses.filter((e) => e.ref !== id);
      if (x) log('Purchase deleted', `${x.vendor} ${x.invoiceNo}`);
      save();
    }

    // Expenses
    function saveExpense(input) {
      if (!(Number(input.amount) > 0)) fail('Enter an amount');
      if (!input.category) fail('Choose a category');
      let e = input.id && S.expenses.find((x) => x.id === input.id);
      if (!e) { e = { id: uid('e') }; S.expenses.push(e); }
      Object.assign(e, { date: input.date || today(), category: input.category, amount: r2(input.amount), note: String(input.note || '').trim(),
        name: String(input.name || '').trim(), payMethod: input.payMethod || '', noCount: !!input.noCount,
        scope: input.scope === 'founder' || (!input.scope && input.category === 'Founder') ? 'founder' : 'common',
        adLeads: input.adLeads === '' || input.adLeads == null ? null : Math.max(0, Math.round(Number(input.adLeads) || 0)) });
      if (!S.settings.lists.expenseCategories.includes(e.category)) S.settings.lists.expenseCategories.push(e.category);
      if (e.name && !S.settings.lists.expenseNames.some((x) => low(x) === low(e.name))) S.settings.lists.expenseNames.push(e.name);
      log(input.id ? 'Expense updated' : 'Expense added', `${e.category}${e.name ? ` (${e.name})` : ''} ₹${e.amount}${e.note ? ` · ${e.note}` : ''}`);
      save();
      return e;
    }
    function deleteExpense(id) {
      const x = S.expenses.find((e) => e.id === id);
      S.expenses = S.expenses.filter((e) => e.id !== id);
      if (x) log('Expense deleted', `${x.category} ₹${x.amount}`);
      save();
    }

    /** Whether an expense counts in totals and profit (categories, names or single entries can be switched off). */
    function counted(e) {
      const off = S.settings.expenseOff || {};
      return !e.noCount && !(off.categories || []).includes(e.category) && !(e.name && (off.names || []).includes(e.name));
    }
    function setExpenseCounted(kind, name, on) {
      const off = S.settings.expenseOff = { categories: [], names: [], ...(S.settings.expenseOff || {}) };
      const key = kind === 'name' ? 'names' : 'categories';
      off[key] = off[key].filter((x) => x !== name);
      if (!on) off[key].push(name);
      log('Expense counting changed', `${name}: ${on ? 'counted' : 'not counted'}`);
      save();
    }
    /** Expense totals by category, by name and by category + name, with counts. total = counted only. */
    function expenseSummary(range) {
      const all = S.expenses.filter((e) => inRange(e.date, range));
      const list = all;
      const group = (key) => {
        const m = {};
        list.forEach((e) => { const k = key(e); if (!k) return; m[k] = m[k] || { name: k, amount: 0, count: 0 }; m[k].amount = r2(m[k].amount + e.amount); m[k].count += 1; });
        return Object.values(m).sort((a, b) => b.amount - a.amount);
      };
      const off = S.settings.expenseOff || { categories: [], names: [] };
      const mark = (arr, kind) => arr.map((x) => ({ ...x, counted: !(off[kind] || []).includes(x.name) }));
      return {
        total: r2(sum(all.filter(counted), (e) => e.amount)), all: r2(sum(all, (e) => e.amount)), notCounted: r2(sum(all.filter((e) => !counted(e)), (e) => e.amount)), count: list.length,
        byCategory: mark(group((e) => e.category), 'categories'), byName: mark(group((e) => e.name), 'names'),
        byBoth: group((e) => (e.name ? `${e.category} · ${e.name}` : '')),
        common: r2(sum(all.filter((e) => counted(e) && e.scope !== 'founder'), (e) => e.amount)),
        founder: r2(sum(all.filter((e) => counted(e) && e.scope === 'founder'), (e) => e.amount)),
        founderAll: r2(sum(all.filter((e) => e.scope === 'founder'), (e) => e.amount)),
      };
    }

    // Doctors (profiles picked on appointments)
    const doctor = (id) => S.doctors.find((d) => d.id === id) || null;
    function saveDoctor(input) {
      const name = String(input.name || '').trim();
      if (!name) fail('Enter the doctor name');
      let d = input.id && doctor(input.id);
      const isNew = !d;
      if (!d) { d = { id: uid('dr'), disabled: false, created: Date.now() }; S.doctors.push(d); }
      ['speciality', 'qualification', 'mobile', 'days', 'timing', 'notes'].forEach((k) => { if (k in input) d[k] = String(input[k] || '').trim(); });
      d.name = name;
      d.fee = input.fee === '' || input.fee == null ? null : Number(input.fee) || 0;
      if ('disabled' in input) d.disabled = !!input.disabled;
      if (d.speciality && !S.settings.lists.specialities.some((x) => low(x) === low(d.speciality))) S.settings.lists.specialities.push(d.speciality);
      log(isNew ? 'Doctor added' : 'Doctor updated', d.name);
      save();
      return d;
    }
    function deleteDoctor(id) {
      const d = doctor(id);
      if (!d) return;
      // Appointments keep the doctor's name.
      S.appointments.forEach((a) => { if (a.doctorId === id) { a.doctorName = d.name; a.doctorId = ''; } });
      S.doctors = S.doctors.filter((x) => x.id !== id);
      log('Doctor deleted', d.name);
      save();
    }
    const doctorName = (a) => (a.doctorId && doctor(a.doctorId) ? doctor(a.doctorId).name : a.doctorName || '');

    // Social media counts (fetched through the Google Sheet script, or typed in).
    function setSocial(patch) {
      S.social = { youtube: {}, instagram: {}, ...(S.social || {}) };
      if (patch.youtube) S.social.youtube = { ...S.social.youtube, ...patch.youtube };
      if (patch.instagram) S.social.instagram = { ...S.social.instagram, ...patch.instagram };
      S.social.fetchedAt = patch.fetchedAt || Date.now();
      save();
    }

    // Video editors: profiles with a fee per video; an editor may also have a login.
    const editor = (id) => S.editors.find((x) => x.id === id) || null;
    const videoFee = (ed) => (ed && ed.fee != null ? ed.fee : S.settings.videoFee != null ? S.settings.videoFee : 150);
    function saveEditor(input) {
      const name = String(input.name || '').trim();
      if (!name) fail('Enter the editor name');
      if (S.editors.some((x) => x.id !== input.id && low(x.name) === low(name))) fail('An editor with this name already exists');
      let ed = input.id && editor(input.id);
      const isNew = !ed;
      if (!ed) { ed = { id: uid('ed'), disabled: false, created: Date.now() }; S.editors.push(ed); }
      const old = ed.name;
      ['mobile', 'notes'].forEach((k) => { if (k in input) ed[k] = String(input[k] || '').trim(); });
      ed.name = name;
      ed.fee = input.fee === '' || input.fee == null ? null : Number(input.fee) || 0;
      if ('disabled' in input) ed.disabled = !!input.disabled;
      if (old && old !== name) S.content.forEach((c) => { if (c.editorId === ed.id) c.editor = name; });
      log(isNew ? 'Editor added' : 'Editor updated', ed.name);
      save();
      return ed;
    }
    function deleteEditor(id) {
      const ed = editor(id);
      if (!ed) return;
      S.content.forEach((c) => { if (c.editorId === id) c.editorId = ''; });
      S.editors = S.editors.filter((x) => x.id !== id);
      S.accounts.forEach((a) => { if (a.editorId === id) a.editorId = ''; });
      log('Editor deleted', ed.name);
      save();
    }

    // Content (videos): edit, schedule and post tracking with reminders.
    const contentItem = (id) => S.content.find((c) => c.id === id) || null;
    function saveContent(input) {
      const title = String(input.title || '').trim();
      if (!title) fail('Enter a title for the video');
      let c = input.id && contentItem(input.id);
      const isNew = !c;
      if (!c) { c = { id: uid('c'), created: Date.now(), date: today() }; S.content.push(c); }
      ['title', 'platform', 'editor', 'scheduledDate', 'scheduledTime', 'postedDate', 'link', 'notes', 'date', 'receivedDate'].forEach((k) => { if (k in input) c[k] = String(input[k] || '').trim(); });
      c.title = title;
      if ('editorId' in input) {
        c.editorId = input.editorId || '';
        const ed = editor(c.editorId);
        if (ed) c.editor = ed.name;
      }
      c.status = CONTENT_STATUS[input.status] ? input.status : c.status || 'idea';
      if (c.status === 'posted' && !c.postedDate) c.postedDate = today();
      if (c.status !== 'idea' && !c.receivedDate) c.receivedDate = today();
      if (c.status === 'idea') c.receivedDate = '';
      if (c.status !== 'posted') c.postedDate = '';
      if (c.platform && !S.settings.lists.platforms.some((x) => low(x) === low(c.platform))) S.settings.lists.platforms.push(c.platform);
      // Editing cost books an "Editing" expense, named after the editor.
      // Fee: as entered; blank = the editor's fee per video once the video is received.
      const cost = input.cost === '' || input.cost == null ? (c.status !== 'idea' && (c.editorId || c.editor) ? videoFee(editor(c.editorId)) : 0) : Number(input.cost) || 0;
      c.cost = cost;
      const ex = S.expenses.find((e) => e.ref === `content:${c.id}`);
      if (cost > 0) {
        const e = ex || { id: uid('e'), ref: `content:${c.id}` };
        if (!ex) S.expenses.push(e);
        Object.assign(e, { date: c.receivedDate || c.date || today(), category: 'Editing', name: c.editor || '', amount: r2(cost), note: `Video: ${c.title}` });
      } else if (ex) S.expenses = S.expenses.filter((e) => e !== ex);
      log(isNew ? 'Video added' : 'Video updated', `${c.title} · ${CONTENT_STATUS[c.status]}`);
      save();
      return c;
    }
    function deleteContent(id) {
      const c = contentItem(id);
      S.content = S.content.filter((x) => x.id !== id);
      S.expenses = S.expenses.filter((e) => e.ref !== `content:${id}`);
      if (c) log('Video deleted', c.title);
      save();
    }
    /** Totals: videos, edited, posted, remaining (edited or scheduled, not posted yet), and post reminders. */
    function contentStats(range, onDate, editorId) {
      const d = onDate || today();
      const mine = S.content.filter((c) => !editorId || c.editorId === editorId);
      const list = mine.filter((c) => !range || inRange(c.date || '', range) || inRange(c.postedDate || '', range) || inRange(c.receivedDate || '', range));
      const n = (f) => list.filter(f).length;
      const scheduled = mine.filter((c) => c.status === 'scheduled' && c.scheduledDate)
        .sort((a, b) => (`${a.scheduledDate} ${a.scheduledTime}` < `${b.scheduledDate} ${b.scheduledTime}` ? -1 : 1));
      return {
        total: list.length,
        toEdit: n((c) => c.status === 'idea'),
        fees: r2(sum(list, (c) => Number(c.cost) || 0)),
        edited: n((c) => c.status !== 'idea'),
        posted: n((c) => c.status === 'posted'),
        remaining: n((c) => c.status === 'edited' || c.status === 'scheduled'),
        scheduled: n((c) => c.status === 'scheduled'),
        dueToday: scheduled.filter((c) => c.scheduledDate === d),
        overdue: scheduled.filter((c) => c.scheduledDate < d),
        upcoming: scheduled.filter((c) => c.scheduledDate > d).slice(0, 10),
        byEditor: Object.values(list.reduce((m, c) => { const k = c.editor || '—'; m[k] = m[k] || { name: k, edited: 0, posted: 0, cost: 0 }; if (c.status !== 'idea') m[k].edited += 1; if (c.status === 'posted') m[k].posted += 1; m[k].cost += Number(c.cost) || 0; return m; }, {})),
      };
    }

    // OPD appointments
    const appointment = (id) => S.appointments.find((a) => a.id === id) || null;
    function saveAppointment(input) {
      if (!input.date) fail('Choose the appointment date');
      if (!APPT_MODES[input.mode]) fail('Choose clinic visit or online');
      const patient = findOrCreatePatient(input.patientName, input.mobile);
      let a = input.id && appointment(input.id);
      if (!a) { a = { id: uid('a'), created: Date.now(), status: 'booked', paid: false }; S.appointments.push(a); }
      const fee = input.fee === '' || input.fee == null ? S.settings.consultFee : Number(input.fee);
      if (!(fee >= 0)) fail('Enter the consultation fee');
      Object.assign(a, {
        date: input.date, time: input.time || '', patientId: patient.id, patientName: patient.name, mobile: patient.mobile,
        mode: input.mode, fee, link: String(input.link || '').trim(), notes: String(input.notes || '').trim(),
        service: String(input.service || '').trim(), doctorId: input.doctorId || '',
      });
      if (input.mode === 'clinic') {
        const c = clinic(input.clinicId) || (S.settings.clinics.length === 1 ? S.settings.clinics[0] : null);
        a.clinicId = c ? c.id : ''; a.clinicName = c ? c.name : '';
      } else { a.clinicId = ''; a.clinicName = ''; }
      if (a.doctorId && doctor(a.doctorId)) a.doctorName = doctor(a.doctorId).name;
      ['status', 'paid', 'payMethod', 'by', 'leadId'].forEach((k) => { if (k in input) a[k] = input[k]; });
      if (!APPT_STATUS[a.status]) a.status = 'booked';
      a.paid = !!a.paid;
      if (a.service && !S.settings.lists.services.includes(a.service)) S.settings.lists.services.push(a.service);
      log(input.id ? 'Appointment updated' : 'Appointment booked', `${a.patientName} · ${a.date} ${a.time}${a.service ? ` · ${a.service}` : ''}${a.doctorName ? ` · ${a.doctorName}` : ''}`);
      save();
      return a;
    }
    function updateAppointment(id, patch) {
      const a = appointment(id);
      if (!a) fail('Appointment not found');
      Object.assign(a, patch);
      const what = patch.status ? `status ${APPT_STATUS[patch.status]}` : patch.paid ? `paid ₹${a.fee}${a.payMethod ? ` ${a.payMethod}` : ''}` : 'changed';
      log('Appointment updated', `${a.patientName} · ${what}`);
      save();
      return a;
    }
    function deleteAppointment(id) {
      const a = appointment(id);
      S.appointments = S.appointments.filter((x) => x.id !== id);
      if (a) log('Appointment deleted', `${a.patientName} · ${a.date}`);
      save();
    }
    const appointmentsIn = (range) => S.appointments.filter((a) => inRange(a.date, range))
      .sort((a, b) => (a.date === b.date ? String(a.time).localeCompare(String(b.time)) : a.date < b.date ? -1 : 1));
    // Fees count as revenue once paid, unless the appointment was cancelled.
    const feeEarned = (a) => (a.paid && a.status !== 'cancelled' ? Number(a.fee) || 0 : 0);
    function appointmentStats(range) {
      const list = appointmentsIn(range);
      const n = (f) => list.filter(f).length;
      return {
        total: list.length, booked: n((a) => a.status === 'booked'), completed: n((a) => a.status === 'completed'),
        cancelled: n((a) => a.status === 'cancelled'), noshow: n((a) => a.status === 'noshow'),
        clinic: n((a) => a.mode === 'clinic' && a.status !== 'cancelled'), online: n((a) => a.mode === 'online' && a.status !== 'cancelled'),
        fees: r2(sum(list, feeEarned)), unpaid: n((a) => !a.paid && a.status !== 'cancelled'),
        byClinic: (S.settings.clinics || []).map((c) => ({ id: c.id, name: c.name, count: n((a) => a.clinicId === c.id && a.status !== 'cancelled'), fees: r2(sum(list.filter((a) => a.clinicId === c.id), feeEarned)) })),
      };
    }

    // Logins: one per person (name, role, PIN). Staff PINs are visible to the Super Admin.
    const account = (id) => S.accounts.find((a) => a.id === id) || null;
    function saveAccount(input) {
      const name = String(input.name || '').trim();
      if (!name) fail('Enter a name for the login');
      if (!ROLES[input.role]) fail('Choose a role');
      if (S.accounts.some((a) => a.id !== input.id && low(a.name) === low(name))) fail('Another login already has this name');
      let a = input.id && account(input.id);
      const isNew = !a;
      if (!a) { a = { id: uid('u'), hash: '', salt: '', len: 0, pin: '', created: Date.now() }; S.accounts.push(a); }
      if (a.role === 'super' && input.role !== 'super' && S.accounts.filter((x) => x.role === 'super' && !x.disabled).length === 1) fail('Keep at least one Super Admin');
      const username = slug(input.username || a.username || name);
      if (S.accounts.some((x) => x.id !== a.id && x.username === username)) fail(`User ID "${username}" is taken`);
      Object.assign(a, { name, username, role: input.role, memberId: input.memberId || '', editorId: input.editorId || '', ownOnly: !!input.ownOnly, disabled: !!input.disabled });
      log(isNew ? 'Login added' : 'Login updated', `${a.name} (${ROLES[a.role]})`);
      save();
      return a;
    }
    function setAccountPin(id, hash, salt, len, plain) {
      const a = account(id);
      if (!a) fail('Unknown login');
      // Passwords are stored only as a salted hash; a forgotten one is reset by the Super Admin.
      Object.assign(a, { hash, salt, len: 0, pin: '' });
      log(hash ? 'Password changed' : 'Password removed', a.name);
      save();
    }
    function deleteAccount(id) {
      const a = account(id);
      if (!a) return;
      if (a.role === 'super' && S.accounts.filter((x) => x.role === 'super').length === 1) fail('Keep at least one Super Admin');
      S.accounts = S.accounts.filter((x) => x.id !== id);
      log('Login deleted', a.name);
      save();
    }
    const setActor = (name) => { actor = name || ''; };
    const accountByUsername = (u) => S.accounts.find((a) => a.username === slug(u)) || null;

    // Choice lists ("+ Add new" everywhere)
    function addListItem(list, name) {
      const n = String(name || '').trim();
      if (!S.settings.lists[list]) fail('Unknown list');
      if (!n) fail('Enter a name');
      if (S.settings.lists[list].some((x) => low(x) === low(n))) return n;
      S.settings.lists[list].push(n);
      log('Option added', `${list}: ${n}`);
      save();
      return n;
    }
    function removeListItem(list, name) {
      if ((LOCKED_LIST_ITEMS[list] || []).includes(name)) fail(`"${name}" is used by the app and can't be removed`);
      S.settings.lists[list] = S.settings.lists[list].filter((x) => x !== name);
      log('Option removed', `${list}: ${name}`);
      save();
    }
    function renameListItem(list, oldName, name) {
      const n = String(name || '').trim();
      if (!n) fail('Enter a name');
      if ((LOCKED_LIST_ITEMS[list] || []).includes(oldName)) fail(`"${oldName}" is used by the app and can't be renamed`);
      const l = S.settings.lists[list]; const i = l.indexOf(oldName);
      if (i < 0) fail('Option not found');
      l[i] = n;
      if (list === 'expenseCategories') S.expenses.forEach((e) => { if (e.category === oldName) e.category = n; });
      if (list === 'leadSources') S.leads.forEach((x) => { if (x.source === oldName) x.source = n; });
      if (list === 'leadStatuses') S.leads.forEach((x) => { if (x.status === oldName) x.status = n; });
      if (list === 'services') { S.appointments.forEach((x) => { if (x.service === oldName) x.service = n; }); S.leads.forEach((x) => { if (x.interest === oldName) x.interest = n; }); }
      log('Option renamed', `${list}: ${oldName} → ${n}`);
      save();
    }

    // Lead management (CRM)
    const lead = (id) => S.leads.find((l) => l.id === id) || null;
    const LEAD_FIELDS = ['name', 'mobile', 'altMobile', 'age', 'gender', 'city', 'source', 'interest', 'priority', 'assignedTo', 'followUp', 'followTime', 'weight', 'targetWeight', 'height', 'budget', 'notes', 'email', 'tags', 'lostReason'];
    function findLeadByMobile(mobile, exceptId) {
      const ph = digits(mobile);
      return ph ? S.leads.find((l) => l.id !== exceptId && digits(l.mobile) === ph) || null : null;
    }
    function saveLead(input) {
      const name = String(input.name || '').trim();
      if (!name) fail('Enter the lead name');
      if (!digits(input.mobile)) fail('Enter a mobile number');
      const dup = findLeadByMobile(input.mobile, input.id);
      if (dup && !input.allowDuplicate) fail(`${dup.name} already has this mobile number (status: ${dup.status})`);
      let l = input.id && lead(input.id);
      const isNew = !l;
      if (!l) { l = { id: uid('l'), created: clock ? clock().getTime() : Date.now(), createdBy: actor, date: today(), status: 'New', history: [] }; S.leads.push(l); }
      LEAD_FIELDS.forEach((k) => { if (k in input) l[k] = typeof input[k] === 'string' ? input[k].trim() : input[k]; });
      l.name = name;
      if (!LEAD_PRIORITIES[l.priority]) l.priority = 'warm';
      if (isNew && !l.assignedTo && S.settings.autoAssign) l.assignedTo = nextAssignee();
      if (input.status && input.status !== l.status) setLeadStatusRaw(l, input.status);
      if (l.source && !S.settings.lists.leadSources.includes(l.source)) S.settings.lists.leadSources.push(l.source);
      if (l.interest && !S.settings.lists.services.includes(l.interest)) S.settings.lists.services.push(l.interest);
      if (isNew) l.history.push({ at: l.created, by: actor, type: 'created', text: `Lead added${l.source ? ` from ${l.source}` : ''}` });
      log(isNew ? 'Lead added' : 'Lead updated', `${l.name} · ${l.mobile}`);
      save();
      return l;
    }
    /** Many leads at once: { status, assignedTo, followUp, tag } or remove. */
    function bulkLeads(ids, patch) {
      const set = new Set(ids || []);
      const list = S.leads.filter((l) => set.has(l.id));
      if (!list.length) fail('Select leads first');
      if (patch.remove) { S.leads = S.leads.filter((l) => !set.has(l.id)); log('Leads deleted', `${list.length} leads`); save(); return list.length; }
      list.forEach((l) => {
        if (patch.status && patch.status !== l.status) setLeadStatusRaw(l, patch.status);
        if ('assignedTo' in patch) l.assignedTo = patch.assignedTo;
        if (patch.followUp) l.followUp = patch.followUp;
        if (patch.tag) { const t = (l.tags || '').split(',').map((x) => x.trim()).filter(Boolean); if (!t.includes(patch.tag)) t.push(patch.tag); l.tags = t.join(', '); }
      });
      log('Leads updated', `${list.length} leads`); save();
      return list.length;
    }
    /** Paste leads: one per line, "name, mobile, source, interest" (tabs or commas). Duplicates are skipped. */
    function importLeads(text, defaults) {
      let added = 0; let skipped = 0;
      String(text || '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean).forEach((line) => {
        const [name, mobile, source, interest] = line.split(/\t|,|;/).map((x) => x.trim());
        if (!name || !digits(mobile) || findLeadByMobile(mobile)) { skipped += 1; return; }
        saveLead({ ...(defaults || {}), name, mobile, ...(source ? { source } : {}), ...(interest ? { interest } : {}) });
        added += 1;
      });
      return { added, skipped };
    }
    /** 0–100: how likely a lead is to convert (priority, recent contact, follow-up kept, budget, visits). */
    function leadScore(l) {
      let s = { hot: 40, warm: 25, cold: 10 }[l.priority] || 20;
      const touches = (l.history || []).filter((h) => ['call', 'whatsapp', 'visit', 'note'].includes(h.type)).length;
      s += Math.min(25, touches * 6);
      if (l.followUp && l.followUp >= today()) s += 10;
      if (l.budget) s += 10;
      if (l.apptId) s += 15;
      if (isClosedLead(l) && !['Converted', 'Appointment booked'].includes(l.status)) s = 5;
      return Math.max(0, Math.min(100, s));
    }
    function setLeadStatusRaw(l, status) {
      if (!S.settings.lists.leadStatuses.includes(status)) S.settings.lists.leadStatuses.push(status);
      const from = l.status;
      l.status = status;
      l.history.push({ at: clock ? clock().getTime() : Date.now(), by: actor, type: 'status', text: `${from || 'New'} → ${status}` });
    }
    function setLeadStatus(id, status) {
      const l = lead(id);
      if (!l) fail('Lead not found');
      setLeadStatusRaw(l, status);
      log('Lead status', `${l.name}: ${status}`);
      save();
    }
    /** A call, WhatsApp message or note on a lead; optionally sets the next follow-up. */
    function addLeadActivity(id, input) {
      const l = lead(id);
      if (!l) fail('Lead not found');
      const text = String(input.text || '').trim();
      if (!text && !input.followUp) fail('Write a note or choose a follow-up date');
      const at = clock ? clock().getTime() : Date.now();
      if (text) l.history.push({ at, by: actor, type: input.type || 'note', text });
      if ('followUp' in input) { l.followUp = input.followUp || ''; l.followTime = input.followTime || ''; if (input.followUp) l.history.push({ at, by: actor, type: 'followup', text: `Follow-up set for ${input.followUp}${input.followTime ? ` ${input.followTime}` : ''}` }); }
      if (input.type === 'call' || input.type === 'whatsapp') l.lastContact = at;
      if (l.status === 'New' && (input.type === 'call' || input.type === 'whatsapp')) setLeadStatusRaw(l, 'Contacted');
      log('Lead activity', `${l.name} · ${input.type || 'note'}${text ? `: ${text.slice(0, 60)}` : ''}`);
      save();
      return l;
    }
    function deleteLead(id) {
      const l = lead(id);
      S.leads = S.leads.filter((x) => x.id !== id);
      if (l) log('Lead deleted', `${l.name} · ${l.mobile}`);
      save();
    }
    /** Convert a lead: creates (or finds) the patient and, optionally, books an OPD appointment. */
    function convertLead(id, appt) {
      const l = lead(id);
      if (!l) fail('Lead not found');
      const p = findOrCreatePatient(l.name, l.mobile);
      l.patientId = p.id;
      let a = null;
      if (appt) {
        a = saveAppointment({ ...appt, patientName: p.name, mobile: p.mobile, leadId: l.id, service: appt.service || l.interest || '' });
        l.apptId = a.id;
        setLeadStatusRaw(l, 'Appointment booked');
      } else setLeadStatusRaw(l, 'Converted');
      log('Lead converted', `${l.name}${a ? ` · appointment ${a.date}` : ''}`);
      save();
      return { patient: p, appointment: a };
    }
    const isClosedLead = (l) => ['Converted', 'Not interested', 'Lost'].includes(l.status);
    function leadStats(range, filter) {
      const all = S.leads.filter((l) => !filter || filter(l));
      const inR = all.filter((l) => inRange(l.date, range));
      const d = today();
      const open = all.filter((l) => !isClosedLead(l));
      const won = inR.filter((l) => l.status === 'Converted' || l.status === 'Appointment booked' || l.apptId || l.patientId).length;
      return {
        total: inR.length, open: open.length, won, conversion: inR.length ? Math.round((won / inR.length) * 100) : 0,
        dueToday: open.filter((l) => l.followUp === d).length, overdue: open.filter((l) => l.followUp && l.followUp < d).length,
        hot: open.filter((l) => l.priority === 'hot').length, newToday: all.filter((l) => l.date === d).length,
      };
    }

    /** One day of lead work: new leads, responses (calls, WhatsApp, notes), status changes, follow-ups. */
    function leadDay(date, filter) {
      const d = date || today();
      const all = S.leads.filter((l) => !filter || filter(l));
      const dayOf = (at) => isoDate(new Date(at));
      const acts = all.flatMap((l) => (l.history || []).filter((h) => dayOf(h.at) === d).map((h) => ({ ...h, lead: l })));
      const open = all.filter((l) => !isClosedLead(l));
      const week = isoDate(new Date(parseDate(d).getTime() + 7 * 86400000));
      const byStatus = {};
      S.settings.lists.leadStatuses.forEach((x) => { byStatus[x] = 0; });
      all.forEach((l) => { byStatus[l.status] = (byStatus[l.status] || 0) + 1; });
      const sortF = (a, b) => (a.followUp + (a.followTime || '')).localeCompare(b.followUp + (b.followTime || ''));
      return {
        date: d,
        newLeads: all.filter((l) => l.date === d),
        responses: acts.filter((h) => ['call', 'whatsapp', 'note'].includes(h.type)),
        calls: acts.filter((h) => h.type === 'call').length, whatsapp: acts.filter((h) => h.type === 'whatsapp').length, notes: acts.filter((h) => h.type === 'note').length,
        statusChanges: acts.filter((h) => h.type === 'status'),
        contacted: new Set(acts.filter((h) => ['call', 'whatsapp', 'note', 'status'].includes(h.type)).map((h) => h.lead.id)).size,
        converted: acts.filter((h) => h.type === 'status' && /→ (Converted|Appointment booked)$/.test(h.text)).length,
        byStatus,
        dueToday: open.filter((l) => l.followUp === d).sort(sortF),
        overdue: open.filter((l) => l.followUp && l.followUp < d).sort(sortF),
        upcoming: open.filter((l) => l.followUp > d && l.followUp <= week).sort(sortF),
        noFollowUp: open.filter((l) => !l.followUp).length,
      };
    }

    /** Today's summary: sales, purchases, OPD, stock available / not available, order required. */
    function daySummary(date) {
      const d = date || today();
      const r = { from: d, to: d };
      const sales = S.sales.filter((x) => x.date === d);
      const purchases = S.purchases.filter((x) => x.date === d);
      const stock = stockItems().map((i) => ({ item: i, stock: stockOf(i.id, d) }));
      return {
        date: d, sales, purchases, appointments: appointmentsIn(r), appt: appointmentStats(r),
        salesTotal: r2(sum(sales, (x) => x.amount)), purchaseTotal: r2(sum(purchases, (x) => x.total)),
        expenses: S.expenses.filter((e) => e.date === d), expenseTotal: r2(sum(S.expenses.filter((e) => e.date === d && counted(e)), (e) => e.amount)),
        available: stock.filter((x) => x.stock > 0), notAvailable: stock.filter((x) => x.stock <= 0),
        order: stock.filter((x) => x.item.orderAt != null && x.stock < x.item.orderAt),
        leads: S.leads.filter((l) => l.date === d).length,
        leadList: S.leads.filter((l) => l.date === d),
        followUps: S.leads.filter((l) => l.followUp === d && !['Converted', 'Lost', 'Not interested'].includes(l.status)),
        renewals: renewals(d).filter((x) => x.stage && !x.done),
        content: contentStats(null, d),
        posted: S.content.filter((c) => c.postedDate === d),
        services: liveItems().filter((i) => !i.disabled && i.track === false),
      };
    }

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
        const mode = (m && m.payMode) || 'both';
        const st = (m && m.salaryType) || 'monthly';
        const days = st === 'daily' ? Number(((S.workDays || {})[month] || {})[id]) || 0 : null;
        const base = st === 'none' ? 0 : st === 'daily' ? r2((m ? m.salary : 0) * days) : m ? m.salary : 0;
        const salary = m && !m.disabled && mode !== 'incentive' && (!m.joiningDate || m.joiningDate <= range.to) ? base : 0;
        const incentive = mode === 'salary' ? 0 : sum(ledger.filter((l) => l.memberId === id), (l) => l.amount);
        return { memberId: id, name: m ? m.name : (ledger.find((l) => l.memberId === id) || {}).name, designation: m ? m.designation : '', mode, salaryType: st, days, rate: m ? m.salary : 0, salary, incentive, total: salary + incentive };
      }).sort((a, b) => b.total - a.total);
    }
    function setWorkDays(month, memberId, days) {
      S.workDays = S.workDays || {};
      S.workDays[month] = { ...(S.workDays[month] || {}), [memberId]: Number(days) || 0 };
      save();
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
      log('Salary booked', `${month}: salary ₹${sal}, incentive ₹${inc}`);
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
      // Service packages (with a length in days): due 3 days before the package ends.
      S.patients.forEach((p) => {
        const pk = patientSales(p.id).filter((s) => s.type === 'service' && (item(s.itemId) || {}).days);
        const last = pk[pk.length - 1];
        if (!last) return;
        const len = item(last.itemId).days;
        const days = daysBetween(last.date, d);
        const stage = days >= len - 3 ? len : 0;
        out.push({
          patientId: p.id, name: p.name, mobile: p.mobile, product: last.product, lastDate: last.date, days, stage, pkgDays: len,
          dueIn: len - days, ref: memberName(last.refId), saleId: last.id, done: !!S.renewalsDone[`${last.id}:${stage}`],
        });
      });
      return out.sort((a, b) => b.days - a.days);
    }
    function markRenewal(saleId, stage, done) {
      const k = `${saleId}:${stage}`;
      if (done) S.renewalsDone[k] = today(); else delete S.renewalsDone[k];
      const x = S.sales.find((y) => y.id === saleId);
      log(done ? 'Renewal contacted' : 'Renewal reopened', x ? x.patientName : saleId);
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
          typeSales: Object.fromEntries(Object.keys(SALE_TYPES).map((t) => [t, byType(t)])),
          incentive: sum(mine, (s) => s.splits.find((x) => x.memberId === id).amount),
        };
      }).sort((a, b) => b.totalSales - a.totalSales);
    }
    function financialReport(range) {
      const sales = S.sales.filter((s) => inRange(s.date, range));
      const expenses = S.expenses.filter((e) => inRange(e.date, range) && counted(e));
      const appts = S.appointments.filter((a) => inRange(a.date, range));
      const consultation = r2(sum(appts, feeEarned));
      const revenue = r2(sum(sales, (s) => s.amount) + consultation);
      const totalExp = r2(sum(expenses, (e) => e.amount));
      const byCategory = {};
      S.settings.lists.expenseCategories.forEach((c) => { byCategory[c] = 0; });
      expenses.forEach((e) => { byCategory[e.category] = r2((byCategory[e.category] || 0) + e.amount); });
      const revenueByType = {};
      Object.keys(SALE_TYPES).forEach((t) => { revenueByType[t] = r2(sum(sales.filter((s) => s.type === t), (s) => s.amount)); });
      revenueByType.consultation = consultation;
      const months = {};
      appts.forEach((a) => { if (!feeEarned(a)) return; const m = monthOf(a.date); months[m] = months[m] || { revenue: 0, expenses: 0 }; months[m].revenue += feeEarned(a); });
      sales.forEach((s) => { const m = monthOf(s.date); months[m] = months[m] || { revenue: 0, expenses: 0 }; months[m].revenue += s.amount; });
      expenses.forEach((e) => { const m = monthOf(e.date); months[m] = months[m] || { revenue: 0, expenses: 0 }; months[m].expenses += e.amount; });
      const monthly = Object.keys(months).sort().map((m) => ({ month: m, revenue: r2(months[m].revenue), expenses: r2(months[m].expenses), profit: r2(months[m].revenue - months[m].expenses) }));
      return { revenue, expenses: totalExp, profit: r2(revenue - totalExp), byCategory, revenueByType, monthly };
    }
    function stockReport(range) {
      const from = range && range.from; const to = range && range.to;
      return liveItems().map((it) => {
        const mv = S.moves.filter((m) => m.itemId === it.id);
        const before = from ? sum(mv.filter((m) => m.date < from), (m) => m.qty) : 0;
        const within = mv.filter((m) => inRange(m.date, range));
        const q = (t) => sum(within.filter((m) => m.type === t), (m) => m.qty);
        const opening = it.opening + before;
        const purchased = q('purchase'); const sold = -q('sale'); const used = -q('kit'); const adjusted = q('adjust');
        return {
          itemId: it.id, category: it.category, kind: it.kind, name: it.name, unit: it.unit, disabled: it.disabled, alertOff: it.alertOff, orderAt: it.orderAt, track: it.track !== false,
          opening, purchased, sold, used, adjusted, current: opening + purchased - sold - used + adjusted, closingToday: stockOf(it.id, to), lowAt: it.lowAt,
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
      const stockSum = (f) => sum(stockItems().filter(f), (i) => stockOf(i.id));
      const cat = (re) => (i) => re.test(i.category) || re.test(i.name);
      return {
        sales: {
          orders: sales.length, revenue: fin.revenue, expenses: fin.expenses, profit: fin.profit,
          injection: fin.revenueByType.injection, protein: fin.revenueByType.protein, diet: fin.revenueByType.diet, consultation: fin.revenueByType.consultation,
          service: fin.revenueByType.service, serviceCount: byType('service').length,
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
          order: orderRequired(),
          available: stockItems().filter((i) => stockOf(i.id) > 0).map((i) => ({ item: i, stock: stockOf(i.id) })),
          services: liveItems().filter((i) => !i.disabled && i.track === false),
        },
        todaySales: S.sales.filter((s) => s.date === d),
        byType: Object.keys(SALE_TYPES).map((t) => ({ type: t, label: SALE_TYPES[t], amount: r2(sum(byType(t), (s) => s.amount)), count: byType(t).length,
          items: t === 'diet' ? (S.settings.dietPlans || []).length : liveItems().filter((i) => i.kind === t).length })),
        stockByKind: kinds().filter((k) => k.id !== 'service').map((k) => ({ id: k.id, name: k.name, stock: stockSum((i) => i.kind === k.id), items: stockItems().filter((i) => i.kind === k.id).length })),
        content: contentStats(range, d),
        expenseSummary: expenseSummary(range),
        productExpenses: r2(sum(S.expenses.filter((e) => inRange(e.date, range) && counted(e) && /purchase/i.test(e.category)), (e) => e.amount)),
        founderExpenses: r2(sum(S.expenses.filter((e) => inRange(e.date, range) && (e.scope === 'founder' || (!e.scope && e.category === 'Founder'))), (e) => e.amount)),
        leads: leadStats(range),
        renewalsDue: renewals(d).filter((r) => r.stage && !r.done).length,
        appointments: appointmentStats(range),
        today: appointmentStats({ from: d, to: d }),
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
        ['Consultation Fees', db.sales.consultation, all.sales.consultation],
        ['Appointments', db.appointments.total, all.appointments.total],
        ['Clinic Visits', db.appointments.clinic, all.appointments.clinic],
        ['Online Consultations', db.appointments.online, all.appointments.online],
        ['New Leads', db.leads.total, all.leads.total],
        ['Leads Converted', db.leads.won, all.leads.won],
        ['Open Leads', db.leads.open, all.leads.open],
        ['Order Required', db.stock.order.map((l) => `${l.item.name} (${l.stock})`).join(', '), ''],
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
        ['Videos Edited', db.content.edited, all.content.edited],
        ['Videos Posted', db.content.posted, all.content.posted],
        ['Videos Remaining', db.content.remaining, all.content.remaining],
        ['Updated', new Date(clock ? clock() : Date.now()).toISOString(), ''],
      ];
      out.Appointments = [['Date', 'Time', 'Patient', 'Mobile', 'Mode', 'Clinic', 'Doctor', 'Service', 'Fee', 'Payment', 'Payment Method', 'Status', 'Online Link', 'Notes']];
      appointmentsIn(null).forEach((a) => out.Appointments.push([a.date, a.time, a.patientName, a.mobile, APPT_MODES[a.mode], a.clinicName || '', doctorName(a), a.service || '', a.fee,
        a.paid ? 'Paid' : 'Unpaid', a.payMethod || '', APPT_STATUS[a.status], a.link || '', a.notes || '']));
      const accName = (id) => (account(id) || {}).name || '';
      out.Leads = [['Date', 'Name', 'Mobile', 'Alt Mobile', 'Age', 'Gender', 'City', 'Source', 'Interested In', 'Priority', 'Status', 'Assigned To', 'Next Follow-up', 'Weight (kg)', 'Target (kg)', 'Height (cm)', 'Budget', 'Last Note', 'Added By']];
      [...S.leads].sort((a, b) => (a.date < b.date ? -1 : 1)).forEach((l) => {
        const note = [...(l.history || [])].reverse().find((h) => ['note', 'call', 'whatsapp'].includes(h.type));
        out.Leads.push([l.date, l.name, l.mobile, l.altMobile || '', l.age || '', l.gender || '', l.city || '', l.source || '', l.interest || '', LEAD_PRIORITIES[l.priority] || '',
          l.status, accName(l.assignedTo), l.followUp ? `${l.followUp} ${l.followTime || ''}`.trim() : '', l.weight || '', l.targetWeight || '', l.height || '', l.budget || '', note ? note.text : '', l.createdBy || '']);
      });
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
      out['Other Sales'] = [['Date', 'Type', 'Patient', 'Mobile', 'New/Renewal', 'Product', 'Qty', 'Amount', 'Reference', 'Shared Reference', 'Split', 'Incentive', 'Notes']];
      out['Service Sales'] = [['Date', 'Patient', 'Mobile', 'New/Renewal', 'Service / Package', 'Qty', 'Amount', 'Reference', 'Shared Reference', 'Split', 'Incentive', 'Notes']];
      byDate.forEach((s) => {
        const [ref, shared] = refNames(s);
        if (s.type === 'injection') out['Injection Sales'].push([s.date, s.patientName, s.mobile, s.patientType === 'new' ? 'New' : 'Renewal', s.product, s.qty, s.amount, ref, shared, split(s), s.dietitianId ? memberName(s.dietitianId) : '', s.incentive, s.notes]);
        else if (s.type === 'protein') out['Protein Sales'].push([s.date, s.patientName, s.mobile, s.product, s.qty, s.amount, ref, shared, split(s), s.incentive, s.notes]);
        else if (s.type !== 'service' && s.type !== 'diet') out['Other Sales'].push([s.date, kindName(s.type), s.patientName, s.mobile, s.patientType === 'new' ? 'New' : 'Renewal', s.product, s.qty, s.amount, ref, shared, split(s), s.incentive, s.notes]);
        else if (s.type === 'service') out['Service Sales'].push([s.date, s.patientName, s.mobile, s.patientType === 'new' ? 'New' : 'Renewal', s.product, s.qty, s.amount, ref, shared, split(s), s.incentive, s.notes]);
        else out['Diet Support'].push([s.date, s.patientName, s.mobile, s.product.replace('Diet Support ', ''), s.amount, ref, shared, split(s), s.incentive, s.notes]);
      });
      out.Purchases = [['Date', 'Vendor', 'Invoice No', 'Product', 'Invoice Product Name', 'Qty', 'Batch', 'Expiry', 'Rate', 'GST %', 'Line Total']];
      [...S.purchases].sort((a, b) => (a.date < b.date ? -1 : 1)).forEach((p) => p.lines.forEach((l) => out.Purchases.push(
        [p.date, p.vendor, p.invoiceNo, l.name, l.invoiceName, l.qty, l.batch, l.expiry, l.rate, l.gst, l.total])));
      out.Inventory = [['Category', 'Item', 'Opening Stock', 'Purchased Stock', 'Sold Stock', 'Used (kit)', 'Adjusted', 'Available Stock', 'Low Stock At', 'Status', 'Order Required']];
      stockReport(null).forEach((r) => out.Inventory.push([r.category, r.name, r.track ? r.opening : 'Unlimited', r.purchased, r.sold, r.used, r.adjusted, r.track ? r.current : 'Unlimited', r.track ? r.lowAt : '',
        r.disabled ? 'Disabled' : !r.track ? 'Service' : r.alertOff || S.settings.stockAlerts === false ? 'Alert off' : r.current <= r.lowAt ? 'LOW' : 'OK', r.orderAt != null && r.current < r.orderAt ? 'ORDER REQUIRED' : '']));
      out.Team = [['Name', 'Designation', 'Mobile', 'Salary', 'Incentive Status', 'Injection Incentive', 'Protein Incentive', 'Pay Counts', 'Joining Date', 'Status']];
      const PAY = { both: 'Salary + Incentive', salary: 'Salary only', incentive: 'Incentive only' };
      S.team.forEach((m) => out.Team.push([m.name, m.designation || '', m.mobile || '', m.salary, m.incentiveOn === false ? 'Off' : 'On',
        rateFor(m, 'injection', null), rateFor(m, 'protein', null), PAY[m.payMode || 'both'], m.joiningDate || '', m.disabled ? 'Disabled' : 'Active']));
      out.Incentives = [['Date', 'Team Member', 'Sale Type', 'Patient', 'Product', 'Share %', 'Incentive']];
      incentiveLedger(null).reverse().forEach((l) => out.Incentives.push([l.date, l.name, kindName(l.type), l.patient, l.product, l.pct, l.amount]));
      out.Salary = [['Month', 'Name', 'Designation', 'Salary', 'Incentive', 'Total Pay', 'Booked as Expense']];
      const months = new Set([monthOf(d), ...S.sales.map((s) => monthOf(s.date))]);
      [...months].sort().forEach((mo) => salarySheet(mo).forEach((r) => out.Salary.push([mo, r.name, r.designation || '', r.salary, r.incentive, r.total, salaryPosted(mo) ? 'Yes' : 'No'])));
      out.Expenses = [['Date', 'Type', 'Category', 'Name', 'Amount', 'Payment Method', 'Note', 'Counted', 'Ad Leads (manual)']];
      [...S.expenses].sort((a, b) => (a.date < b.date ? -1 : 1)).forEach((e) => out.Expenses.push([e.date, e.scope === 'founder' ? 'Founder' : 'Common', e.category, e.name || '', e.amount, e.payMethod || '', e.note || '', counted(e) ? 'Yes' : 'No', e.adLeads == null ? '' : e.adLeads]));
      out.Renewals = [['Patient', 'Mobile', 'Product', 'Last Purchase Date', 'Days Since', 'Reminder', 'Reference Team', 'Contacted']];
      renewals(d).forEach((r) => out.Renewals.push([r.name, r.mobile, r.product, r.lastDate, r.days, r.stage ? `${r.stage} Day alert` : `Due in ${r.dueIn} days`, r.ref, r.done ? 'Yes' : 'No']));
      out.Doctors = [['Name', 'Speciality', 'Qualification', 'Mobile', 'Fee', 'Days', 'Timing', 'Appointments', 'Status']];
      S.doctors.forEach((x) => out.Doctors.push([x.name, x.speciality || '', x.qualification || '', x.mobile || '', x.fee == null ? '' : x.fee, x.days || '', x.timing || '',
        S.appointments.filter((a) => a.doctorId === x.id).length, x.disabled ? 'Disabled' : 'Active']));
      out.Content = [['Added', 'Title', 'Platform', 'Editor', 'Status', 'Received', 'Scheduled', 'Posted', 'Editor Fee', 'Link', 'Notes']];
      [...S.content].sort((a, b) => (a.date < b.date ? -1 : 1)).forEach((c) => out.Content.push([c.date || '', c.title, c.platform || '', c.editor || '', CONTENT_STATUS[c.status], c.receivedDate || '',
        c.scheduledDate ? `${c.scheduledDate} ${c.scheduledTime || ''}`.trim() : '', c.postedDate || '', c.cost || 0, c.link || '', c.notes || '']));
      out.Editors = [['Name', 'Mobile', 'Fee per Video', 'Videos Received', 'Videos Posted', 'Total Fees', 'Status']];
      S.editors.forEach((x) => { const mine = S.content.filter((c) => c.editorId === x.id); out.Editors.push([x.name, x.mobile || '', videoFee(x), mine.filter((c) => c.status !== 'idea').length, mine.filter((c) => c.status === 'posted').length, sum(mine, (c) => Number(c.cost) || 0), x.disabled ? 'Disabled' : 'Active']); });
      out.Campaigns = [['Campaign', 'Platform', 'Start', 'End', 'Budget', 'Spent', 'Leads', 'Converted', 'Cost per Lead', 'Revenue', 'ROI %', 'Goal', 'Notes']];
      (S.campaigns || []).forEach((c) => { const x = campaignStats(c); out.Campaigns.push([c.name, c.platform, c.start, c.end, c.budget, c.spent, x.leads, x.won, x.cpl, x.revenue, x.roi, c.goal, c.notes]); });
      out['Ads Report'] = [['Platform', 'Ad Spend', 'Leads (app)', 'Leads (manual)', 'Cost per Lead', 'Converted', 'Revenue', 'ROI %']];
      adReport(null).rows.forEach((r) => out['Ads Report'].push([r.platform, r.spend, r.leads, r.hasManual ? r.manualLeads : '', r.cpl, r.won, r.revenue, r.spend ? r.roi : '']));
      out.Tasks = [['Task', 'Assigned To', 'Due', 'Priority', 'Status', 'Created By', 'Done By', 'Notes']];
      (S.tasks || []).forEach((t) => out.Tasks.push([t.title, (account(t.assignedTo) || {}).name || '', t.due, t.priority, t.done ? 'Done' : 'Open', t.by || '', t.doneBy || '', t.notes]));
      out.Attendance = [['Date', 'Team Member', 'Mark']];
      const MARK = { P: 'Present', H: 'Half day', A: 'Absent', L: 'Leave', O: 'Week off' };
      Object.keys(S.attendance || {}).sort().reverse().slice(0, 400).forEach((d) => Object.entries(S.attendance[d]).forEach(([id, m]) => out.Attendance.push([d, memberName(id), MARK[m] || m])));
      out['Founder Notes'] = [['Date', 'Type', 'Title', 'Note', 'Due', 'Pinned', 'Status', 'By']];
      listFix('notes').forEach((n) => out['Founder Notes'].push([new Date(n.at).toISOString().slice(0, 10), n.tag || '', n.title || '', n.text || '', n.due || '', n.pinned ? 'Yes' : '', n.done ? 'Done' : 'Open', n.by || '']));
      out['Activity Log'] = [['Date & Time', 'By', 'Action', 'Details']];
      S.log.slice(-1500).reverse().forEach((x) => out['Activity Log'].push([new Date(x.at).toISOString().replace('T', ' ').slice(0, 16), x.by, x.action, x.detail]));
      return out;
    }

    // Settings and backup
    function updateSettings(patch) {
      Object.assign(S.settings, patch);
      const keys = Object.keys(patch).filter((k) => !LOCAL_SETTINGS.includes(k));
      if (keys.length) log('Settings changed', keys.join(', '));
      save();
    }
    function saveDietPlan(input) {
      let p = input.id && S.settings.dietPlans.find((x) => x.id === input.id);
      if (!p) { p = { id: uid('d'), disabled: false }; S.settings.dietPlans.push(p); }
      ['name', 'months', 'price', 'incentive', 'disabled'].forEach((k) => { if (k in input) p[k] = input[k]; });
      p.price = Number(p.price) || 0; p.incentive = Number(p.incentive) || 0;
      log('Diet plan saved', p.name);
      save();
      return p;
    }
    function moveDietPlan(id, dir) {
      const L = S.settings.dietPlans; const i = L.findIndex((p) => p.id === id); const j = i + (dir < 0 ? -1 : 1);
      if (i < 0 || j < 0 || j >= L.length) return;
      [L[i], L[j]] = [L[j], L[i]];
      save();
    }
    function deleteDietPlan(id) {
      const p = S.settings.dietPlans.find((x) => x.id === id);
      if (!p) return;
      S.settings.dietPlans = S.settings.dietPlans.filter((x) => x.id !== id);
      log('Diet plan deleted', p.name);
      save();
    }
    const exportBackup = () => JSON.stringify({ app: 'primefit-admin', exported: new Date().toISOString(), data: exportState() });
    function importBackup(text) {
      const obj = JSON.parse(text);
      if (!obj || obj.app !== 'primefit-admin' || !obj.data) fail('This is not a Prime Fit Admin backup');
      const keep = {};
      LOCAL_SETTINGS.forEach((k) => { keep[k] = S.settings[k]; });
      const accounts = S.accounts;
      storage.setItem(KEY, JSON.stringify(obj.data));
      S = load();
      Object.assign(S.settings, keep);
      if (!S.accounts.some((a) => a.role === 'super' && a.hash)) S.accounts = accounts; // a backup without logins keeps this device's
      log('Backup imported', '');
      save();
    }
    /** Erase all data; the logins and this device's Google Sheet connection stay. */
    function resetAll() {
      const accounts = S.accounts; const keep = {};
      LOCAL_SETTINGS.forEach((k) => { keep[k] = S.settings[k]; });
      S = defaultState(); S.accounts = accounts; Object.assign(S.settings, keep);
      log('All data erased', '');
      save();
    }

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
      item, itemsOf, liveItems, saveItem, deleteItem, moveItem, moveCategory, setItemKit, kitOf, addCategory, stockOf, adjustStock, lowStock,
      expenseSummary, setWorkDays, setSocial, counted, setExpenseCounted, editor, videoFee, saveEditor, deleteEditor, moveDietPlan, deleteDietPlan, accountByUsername, doctor, saveDoctor, deleteDoctor, doctorName, contentItem, saveContent, deleteContent, contentStats,
      matchItem: (name, kind) => matchItem(liveItems().filter((i) => !i.disabled && (!kind || i.kind === kind)), name),
      findOrCreatePatient, patientSales, saveSale, deleteSale, incentiveFor,
      savePurchase, deletePurchase, findDuplicatePurchase, lineTotal,
      saveExpense, deleteExpense,
      incentiveLedger, salarySheet, postSalary, salaryPosted,
      renewals, markRenewal,
      appointment, saveAppointment, updateAppointment, deleteAppointment, appointmentsIn, appointmentStats, feeEarned,
      account, saveAccount, setAccountPin, deleteAccount, setActor,
      addListItem, removeListItem, renameListItem, renameCategory, deleteCategory, setKit, orderRequired, previewSplits, rateFor,
      updatePatient, deletePatient, daySummary,
      invoiceFor, saveCampaign, deleteCampaign, campaignStats, leadSources, saveIdea, deleteIdea, saveTask, setTaskDone, deleteTask, setAttendance, attendanceMonth, setTarget, targetProgress, saveNote, deleteNote, adReport, alerts, nextAssignee, bulkLeads, importLeads, leadScore,
      lead, saveLead, setLeadStatus, addLeadActivity, deleteLead, convertLead, leadStats, leadDay, kindName, kinds, saveKind, deleteKind, moveKind, clinic, saveClinic, deleteClinic, findLeadByMobile, isClosedLead,
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
    SALARY_TYPES: { monthly: 'Monthly fixed', daily: 'Per working day', none: 'No salary' }, INCENTIVE_TYPES: { product: 'Fixed ₹ per product / package', percent: '% of sale amount', none: 'No incentive' }, PACKAGES, KINDS, SALE_TYPES, EXPENSE_CATEGORIES, SHEETS, CONTENT_STATUS, KEY, ROLES, APPT_MODES, APPT_STATUS, PAY_METHODS, DEFAULT_PERMS, LEAD_PRIORITIES, DEFAULT_LISTS,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ADMIN = api;
})(typeof window !== 'undefined' ? window : globalThis);
