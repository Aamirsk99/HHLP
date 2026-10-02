/* The Prime Fit Admin — dashboard, today summary, OPD appointments, lead management (CRM), sales,
 * patients, renewals, products, inventory, purchases, team, incentives, salary, expenses,
 * reports (PDF / Excel / A4 image), activity log and settings. Logins: Super Admin, Admin,
 * Manager, Front Desk, plus a personal login for any team member.
 * Developed by Aamir Sk · The Prime Fit Digital Marketing Team. */
(function () {
  const A = window.ADMIN;
  const X = window.EXPORT;
  const APP_VERSION = '4.1';
  const CREDIT = 'Developed by Aamir Sk · The Prime Fit Digital Marketing Team';
  const ROLE_KEY = 'primefit.admin.role'; // signed-in login id for this browser session
  const AUTO_REFRESH_MS = 30000;
  const SYNC_KEY = 'primefit.admin.lastSync';
  const BASE_KEY = 'primefit.admin.sheetVersion'; // version of the Google Sheet data this device last had
  const DIRTY_KEY = 'primefit.admin.savedHash'; // fingerprint of the data last saved to / loaded from the sheet
  const SHEET_LINK = ''; // link to the Google Sheet made from ThePrimeFit_Sheets.xlsx (optional)
  const IDLE_LOCK_MS = 15 * 60 * 1000;

  let storage;
  try { storage = window.localStorage; storage.getItem('x'); } catch (_) { storage = A.memoryStorage(); }
  const admin = A.createAdmin(storage);
  const S = () => admin.state;
  const set = () => admin.state.settings;

  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Formatters are built once; toLocaleString on every number is slow on phones.
  const NF = new Intl.NumberFormat('en-IN'); const TF = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  const inr = (n) => { const v = Math.round(Number(n) || 0); return (v < 0 ? '−₹' : '₹') + NF.format(Math.abs(v)); };
  const plural = (n, one, many) => `${num(n)} ${n === 1 ? one : many || one + 's'}`;
  const num = (n) => NF.format(Number(n) || 0);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fdate = (d) => { if (!d) return ''; const [y, m, dd] = d.split('-'); return dd ? `${Number(dd)} ${MONTHS[m - 1]} ${y}` : `${MONTHS[m - 1]} ${y}`; };
  const ftime = (ms) => TF.format(new Date(ms));
  const opt = (v, label, sel) => `<option value="${esc(v)}"${String(v) === String(sel) ? ' selected' : ''}>${esc(label)}</option>`;
  const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;

  const view = $('#view');
  const modal = $('#modal');
  let toastTimer;
  function toast(msg, bad) {
    const t = $('#toast');
    t.textContent = msg; t.className = 'toast show' + (bad ? ' bad' : '');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.className = 'toast'; }, bad ? 5000 : 3000);
  }

  // ── Navigation ────────────────────────────────────────────────
  const ICON_CAL = '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 14h3"/>';
  const ICON_TODAY = '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';
  const ICON_LEADS = '<path d="M3 4h18l-7 8v6l-4 2v-8z"/>';
  const ICON_INV = '<rect x="4" y="4" width="16" height="6" rx="1"/><rect x="4" y="14" width="16" height="6" rx="1"/><path d="M9 7h6M9 17h6"/>';
  // Menu section icons.
  const GROUP_ICONS = {
    Overview: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    'Patients & OPD': '<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/><path d="M12 10v4M10 12h4"/>',
    Sales: '<path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>',
    Stock: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    'Team & money': '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/><circle cx="18" cy="9" r="2.5"/><path d="M18 14c2.4 0 4 1.6 4 4"/>',
    Founder: '<path d="M3 7l4 4 5-7 5 7 4-4-2 12H5z"/>',
    Marketing: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a4 4 0 0 1 0 6"/>',
    Reports: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    Admin: '<path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/>',
  };
  const NAV = [
    ['home', 'Home', '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>', 'Overview'],
    ['dashboard', 'Dashboard', '<path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-4H4zM14 4v4h6V4z"/>'],
    ['today', 'Today Summary', ICON_TODAY],
    ['appointments', 'OPD Appointments', ICON_CAL, 'Patients & OPD'],
    ['leads', 'Leads (CRM)', ICON_LEADS],
    ['patients', 'Patients', '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M16 11a3 3 0 1 0 0-6M21 20c0-2.6-1.5-4.8-4-5.6"/>'],
    ['renewals', 'Renewals', '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/>'],
    ['doctors', 'Doctors', '<circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2M12 14v4M10 16h4"/>'],
    ['sell', 'New Sale', '<path d="M12 5v14M5 12h14"/>', 'Sales'],
    ['sales', 'Sales', '<path d="M4 19h16M7 16V9M12 16V5M17 16v-4"/>'],
    ['products', 'Products', '<path d="M4 8l8-4 8 4-8 4zM4 8v8l8 4 8-4V8M12 12v8"/>', 'Stock'],
    ['inventory', 'Inventory', ICON_INV],
    ['purchases', 'Purchases', '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/>'],
    ['team', 'Team', '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>', 'Team & money'],
    ['manage', 'Team Desk', '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>'],
    ['incentives', 'Incentives', '<path d="M12 3v18M17 7H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6"/>'],
    ['salary', 'Salary', '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>'],
    ['expenses', 'Expenses', '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'],
    ['founder', 'Founder Hub', '<path d="M3 7l4 4 5-7 5 7 4-4-2 12H5z"/><path d="M5 21h14"/>', 'Founder'],
    ['marketing', 'Marketing Hub', '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/>', 'Marketing'],
    ['content', 'Content & Posts', '<rect x="3" y="5" width="14" height="14" rx="2"/><path d="M17 10l4-2v8l-4-2M8 9l4 3-4 3z"/>'],
    ['reports', 'Reports', '<path d="M5 3h14v18H5zM9 8h6M9 12h6M9 16h3"/>', 'Reports'],
    ['activity', 'Activity Log', '<path d="M3 12h4l3-8 4 16 3-8h4"/>'],
    ['settings', 'Settings', '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>', 'Admin'],
    ['about', "What's new", '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>'],
  ];
  // Access: Super Admin opens everything; Admin, Manager and Front Desk follow Settings → Roles.
  const ALL = NAV.map((n) => n[0]).concat('purchase-new', 'diet');
  const EXTRA = { purchases: ['purchase-new'] };
  const TITLES = { 'purchase-new': 'Purchase Entry' };
  let me = null; // signed-in login
  let role = null;
  let screen = 'dashboard';
  let params = {};
  let period = { name: 'month', from: '', to: '', month: '' };
  function allowed(r) {
    if (r === 'super') return ALL;
    const list = ((set().perms || {})[r] || A.DEFAULT_PERMS[r] || { screens: [] }).screens.slice();
    list.forEach((id) => (EXTRA[id] || []).forEach((x) => list.push(x)));
    if (list.includes('diet')) list.push('home'); // the split Diet charts | Clinic admin start page
    const ro = r !== 'super' && !!((set().perms || {})[r] || A.DEFAULT_PERMS[r] || {}).view;
    const off = (set().ui || {}).off || [];
    return list.filter((id) => (!ro || !['sell', 'purchase-new', 'settings'].includes(id)) && !off.includes(id)).concat('about');
  }
  // Super Admin's own names for menu items, brand line, colour, fonts and spacing (Settings → Look → Branding & menu).
  const ui = () => set().ui || {};
  const navLabel = (id, fallback) => (ui().labels || {})[id] || fallback;
  function applyUi() {
    const u = ui(); const d = document.documentElement;
    if (u.accent) { d.style.setProperty('--brand', u.accent); d.style.setProperty('--brand-mid', u.accent); } else { d.style.removeProperty('--brand'); d.style.removeProperty('--brand-mid'); }
    if (u.gold) d.style.setProperty('--gold', u.gold); else d.style.removeProperty('--gold');
    if (u.radius) d.style.setProperty('--radius', `${u.radius}px`); else d.style.removeProperty('--radius');
    document.body.classList.toggle('ui-modern', u.font === 'modern');
    document.body.classList.toggle('ui-compact', u.density === 'compact');
    document.body.classList.toggle('ui-still', !!u.noAnim);
    const b = $('.side-head b'); if (b) b.textContent = u.brand || 'The Prime Fit';
  }
  const can = (id) => !!role && allowed(role).includes(id);
  const permOf = (r) => (set().perms || {})[r] || A.DEFAULT_PERMS[r] || {};
  // A login whose role is marked "View only" sees its screens but cannot add, edit or delete anything.
  const readOnly = () => !!role && role !== 'super' && !!permOf(role).view;
  const canDelete = () => !readOnly() && (role === 'super' || !!permOf(role).del);
  const adminHome = () => ['dashboard', 'today', 'appointments', 'leads', 'content'].find(can) || NAV.map((n) => n[0]).find((id) => id !== 'home' && can(id)) || 'about';
  const home = () => (can('home') ? 'home' : adminHome());
  let changedScreen = true;
  // Long lists show a page at a time ("Show more"), so thousands of rows never slow the phone down.
  const PAGE = 50; let showN = {};
  const capList = (arr, k) => arr.slice(0, showN[k] || PAGE);
  const moreBtn = (k, total) => { const n = showN[k] || PAGE; return total > n ? `<button type="button" class="btn more-btn" data-act="show-more" data-k="${k}">Show more · ${num(total - n)} left</button>` : ''; };

  function go(id, p, fromHistory) {
    if (id === 'menu') { openMenu(true); return; }
    if (!can(id)) id = home();
    changedScreen = id !== screen;
    if (changedScreen) { showN = {}; waShowAll = false; }
    screen = id; params = p || {};
    openMenu(false);
    if (!fromHistory && changedScreen) { try { history.pushState({ screen: id }, ''); } catch (_) { /* file:// may refuse */ } }
    render();
    window.scrollTo(0, 0);
  }
  function openMenu(on) {
    if (!on && $('#nav-q') && $('#nav-q').value) { $('#nav-q').value = ''; renderNav(); }
    $('#side').classList.toggle('open', on);
    document.body.classList.toggle('menu-open', !!on);
    if (on) $('#side').scrollTop = 0;
    $('#scrim').hidden = !on;
  }
  // Back button (Android and browser): close a dialog or the menu first, then go to the previous screen.
  window.addEventListener('popstate', (e) => {
    if (modal.open) { modal.close(); try { history.pushState({ screen }, ''); } catch (_) { /* ignore */ } return; }
    if ($('#side').classList.contains('open')) { openMenu(false); try { history.pushState({ screen }, ''); } catch (_) { /* ignore */ } return; }
    if (!role) return;
    const to = e.state && e.state.screen ? e.state.screen : adminHome();
    go(to === 'home' && screen !== 'home' ? adminHome() : to, {}, true);
  });

  // Bottom menu: 1 Dashboard · 2 Today summary · 3 Sale · 4 OPD · 5 Inventory (only what the login may open).
  const TAB_ORDER = ['dashboard', 'today', 'sell', 'appointments', 'inventory'];
  const DESK_TABS = ['appointments', 'leads', 'today'];
  const navClosed = () => { try { return JSON.parse(localStorage.getItem('primefit.navClosed') || 'null'); } catch (_) { return null; } };
  function renderNav() {
    const due = can('renewals') ? admin.renewals().filter((r) => r.stage && !r.done).length : 0;
    const lowN = can('inventory') ? admin.lowStock().length + admin.orderRequired().length : 0;
    const todayN = admin.appointmentsIn({ from: admin.today(), to: admin.today() }).filter((a) => a.status === 'booked').length;
    const ls0 = can('leads') ? admin.leadStats(null, myLeadFilter()) : null; const leadsDue = ls0 ? ls0.dueToday + ls0.overdue : 0;
    const badge = (id) => (id === 'renewals' && due ? `<span class="badge warn">${due}</span>`
      : id === 'inventory' && lowN ? `<span class="badge bad">${lowN}</span>`
        : id === 'appointments' && todayN ? `<span class="badge info">${todayN}</span>`
          : id === 'leads' && leadsDue ? `<span class="badge warn">${leadsDue}</span>` : '');
    const sd = $('.side-diet'); if (sd) sd.hidden = !can('diet');
    const q = (($('#nav-q') || {}).value || '').trim().toLowerCase();
    const items = NAV.filter((n) => can(n[0]) && (!q || navLabel(n[0], n[1]).toLowerCase().includes(q) || (n[3] || '').toLowerCase().includes(q)));
    const quick = [['sell', 'Sale', '<path d="M12 5v14M5 12h14"/>', 'go'], ['new-lead', 'Lead', ICON_LEADS, 'act', 'leads'], ['new-appt', 'OPD', ICON_CAL, 'act', 'appointments'], ['add-expense', 'Expense', '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>', 'act', 'expenses']]
      .filter(([id, , , kind, scr]) => !readOnly() && can(kind === 'go' ? id : scr));
    $('#side-quick').innerHTML = quick.map(([id, label, icon, kind]) => `<button type="button" ${kind === 'go' ? `data-go="${id}"` : `data-act="${id}"`}>${svg(icon)}${label}</button>`).join('');
    $('#side-quick').hidden = !quick.length;
    if (!items.length) { $('#nav').innerHTML = '<p class="nav-empty">Nothing matches.</p>'; } else {
      // Grouped, colour-coded sections that fold away; the section of the open screen always stays open.
      const groups = []; let gName = 'Overview';
      NAV.forEach((n) => { if (n[3]) gName = n[3]; if (items.includes(n)) { let g = groups.find((x) => x.name === gName); if (!g) { g = { name: gName, items: [] }; groups.push(g); } g.items.push(n); } });
      const closed = navClosed();
      const gIcon = (n) => `<i class="ng-ic">${svg(GROUP_ICONS[n] || '<circle cx="12" cy="12" r="4"/>')}</i>`;
      $('#nav').innerHTML = groups.map((g, gi) => {
        const active = g.items.some(([id]) => screen === id || (id === 'purchases' && screen === 'purchase-new'));
        const open = q || active || (closed ? !closed.includes(g.name) : g.name === 'Overview') || g.items.length === 1;
        const cnt = g.items.reduce((a, [id]) => a + (badge(id) ? 1 : 0), 0);
        return `<div class="nav-sec c${gi % 6} ${open ? 'open' : ''}">${g.items.length > 1 ? `<button type="button" class="nav-group" data-navgroup="${esc(g.name)}">${gIcon(g.name)}<span>${esc(g.name)}</span>${!open && cnt ? `<em>${cnt}</em>` : ''}<svg viewBox="0 0 24 24" class="chev"><path d="M6 9l6 6 6-6"/></svg></button>` : `<div class="nav-group solo">${gIcon(g.name)}<span>${esc(g.name)}</span></div>`}
          <div class="nav-items">${g.items.map(([id, label, icon]) => `<button type="button" data-go="${id}" class="${screen === id || (id === 'purchases' && screen === 'purchase-new') ? 'on' : ''}">${svg(icon)}<span>${esc(navLabel(id, label))}</span>${badge(id)}</button>`).join('')}</div></div>`;
      }).join('');
    }
    const tabs = (can('dashboard') ? TAB_ORDER : DESK_TABS).filter(can);
    $('#tabs').hidden = tabs.length < 2;
    const tabLabel = { dashboard: 'Dashboard', today: 'Today', appointments: 'OPD', inventory: 'Inventory', leads: 'Leads' };
    $('#tabs').innerHTML = tabs.map((id) => {
      if (id === 'sell') return `<button type="button" data-go="sell" class="fab" aria-label="New sale">${svg('<path d="M12 5v14M5 12h14"/>')}<span>Sale</span></button>`;
      const n = NAV.find((x) => x[0] === id);
      return `<button type="button" data-go="${id}" class="${screen === id ? 'on' : ''}">${svg(n[2])}<span>${esc((ui().labels || {})[id] || tabLabel[id] || n[1])}</span>${badge(id).replace('badge', 'badge dot')}</button>`;
    }).join('');
    $('#side-sub').textContent = `${me.name} · ${A.ROLES[role]}`;
    $('#user-initial').textContent = me.name.trim().charAt(0).toUpperCase();
  }

  // Company profile from Settings: every PDF, slip and invoice reads it, and so do the diet charts (same phone, same storage).
  const PROFILE_KEYS = ['legalName', 'tagline', 'phone', 'whatsapp', 'email', 'website', 'address', 'gstin', 'regNo', 'doctor', 'qualification', 'instagram', 'youtube', 'facebook', 'upi', 'payee', 'bankName', 'accountNo', 'ifsc', 'branch', 'disclaimer', 'terms'];
  function profile() {
    const st = set(); const c = (st.clinics || [])[0] || {};
    const p = { name: st.clinic || 'The Prime Fit' };
    PROFILE_KEYS.forEach((k) => { p[k] = st[k] || ''; });
    if (!p.address) p.address = c.address || '';
    return p;
  }
  let sharedProfile = '';
  function shareProfile() {
    try {
      const p = profile(); window.PRIMEFIT_PROFILE = p; window.PRIMEFIT_SOCIAL = p;
      const j = JSON.stringify(p);
      if (j !== sharedProfile) { sharedProfile = j; localStorage.setItem('primefit.profile', j); }
    } catch (_) { /* ignore */ }
  }
  function render() {
    if (!role) return;
    shareProfile();
    const f = SCREENS[screen] || SCREENS[home()];
    const nav = NAV.find((n) => n[0] === screen);
    $('#title').textContent = TITLES[screen] || (screen === 'sell' && params.edit ? 'Edit Sale' : nav ? navLabel(nav[0], nav[1]) : '');
    applyUi();
    $('#top-sub').textContent = SUBS[screen] ? SUBS[screen]() : `${me.name} · ${A.ROLES[role]}`;
    document.body.classList.toggle('ro', readOnly());
    view.innerHTML = f();
    view.classList.toggle('enter', changedScreen);
    labelTables(view);
    renderNav();
    if (AFTER[screen]) AFTER[screen]();
    applyHidden();
    linkBoxes();
    updateBell();
    if (!$('#side').classList.contains('open')) document.body.classList.remove('menu-open');
    if (changedScreen) countUp(view);
    changedScreen = false;
  }
  // Numbers in the summary boxes count up when a screen opens.
  function countUp(root) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    $$('.kpi b, .hk b', root).slice(0, 8).forEach((el) => {
      const text = el.textContent;
      const m = text.match(/^(−?₹?)([\d,]+)$/);
      if (!m) return;
      const target = Number(m[2].replace(/,/g, ''));
      if (!target || target > 1e9) return;
      const t0 = performance.now(); const dur = 420;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 3);
        el.textContent = m[1] + NF.format(Math.round(target * e));
        if (k < 1) requestAnimationFrame(step); else el.textContent = text;
      };
      requestAnimationFrame(step);
    });
  }
  // Phones show table rows as cards: each cell gets its column name, and columns marked
  // "~" in the header are hidden on phones to keep the cards short.
  function labelTables(root) {
    $$('table', root).forEach((t) => {
      t.classList.add('rt');
      const heads = $$('thead th', t).map((th) => ({ text: th.textContent.replace(/^~/, ''), hide: th.dataset.hm === '1' }));
      $$('tbody tr, tfoot tr', t).forEach((tr) => {
        let i = 0;
        Array.from(tr.children).forEach((td) => {
          const h = heads[i];
          if (h && !td.hasAttribute('colspan')) { td.dataset.label = h.text; if (h.hide) td.classList.add('hm'); }
          i += Number(td.getAttribute('colspan') || 1);
        });
      });
    });
  }

  // ── Period filter: any month on its own, this month (auto), or all time ──
  const PERIODS = [['today', 'Today'], ['month', 'This month'], ['pick', 'Choose month'], ['lastMonth', 'Last month'], ['year', 'This year'], ['all', 'All time'], ['custom', 'Custom dates']];
  function range() {
    if (period.name === 'custom') return { from: period.from || null, to: period.to || null };
    if (period.name === 'pick') return A.monthRange(period.month || admin.today().slice(0, 7));
    return A.rangeFor(period.name, admin.today());
  }
  const periodBar = () => `<div class="scroll-x"><div class="seg">${PERIODS.map(([k, l]) => `<button type="button" data-period="${k}" class="${period.name === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
    ${period.name === 'custom' ? `<input type="date" data-pdate="from" value="${esc(period.from)}" aria-label="From"><input type="date" data-pdate="to" value="${esc(period.to)}" aria-label="To">` : ''}
    ${period.name === 'pick' ? `<input type="month" data-pdate="month" value="${esc(period.month || admin.today().slice(0, 7))}" aria-label="Month">` : ''}`;
  const periodLabel = () => {
    const r = range();
    if (!r) return 'All time';
    if (period.name === 'pick' || period.name === 'month' || period.name === 'lastMonth') return fdate(r.from.slice(0, 7));
    return r.from === r.to ? fdate(r.from) : `${fdate(r.from) || '…'} – ${fdate(r.to) || '…'}`;
  };

  // "+ Add new…" in any choice list: the new name is saved to the list for everyone.
  const listSelect = (list, attrs, value, blank) => {
    const opts = list === '__categories' ? S().categories.map((c) => c.name) : (set().lists[list] || []);
    const vals = value && !opts.includes(value) ? [...opts, value] : opts;
    return `<select ${attrs} data-list="${list}">${blank != null ? opt('', blank, value) : ''}${vals.map((o) => opt(o, o, value)).join('')}<option value="__new__">+ Add new…</option></select>`;
  };
  document.addEventListener('change', (e) => {
    const sel = e.target;
    if (!sel.matches || !sel.matches('select[data-list]') || sel.value !== '__new__') return;
    sel.value = sel.dataset.prev || '';
    if (sel.nextElementSibling && sel.nextElementSibling.classList.contains('addnew')) return;
    sel.insertAdjacentHTML('afterend', `<span class="addnew"><input type="text" placeholder="New name" aria-label="New name"><button type="button" class="btn xs primary" data-addnew>Add</button><button type="button" class="btn xs ghost" data-addnew-cancel aria-label="Cancel">✕</button></span>`);
    sel.nextElementSibling.querySelector('input').focus();
  }, true);
  document.addEventListener('focusin', (e) => { if (e.target.matches && e.target.matches('select[data-list]')) e.target.dataset.prev = e.target.value; });
  document.addEventListener('click', (e) => {
    const box = e.target.closest('.addnew');
    if (!box) return;
    e.preventDefault(); e.stopPropagation();
    const sel = box.previousElementSibling;
    if (e.target.closest('[data-addnew-cancel]')) { box.remove(); return; }
    if (!e.target.closest('[data-addnew]')) return;
    const name = box.querySelector('input').value.trim();
    if (!name) return;
    try {
      if (sel.dataset.list === '__categories') { if (!S().categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) admin.addCategory(name, 'other'); } else admin.addListItem(sel.dataset.list, name);
      const o = document.createElement('option'); o.value = name; o.textContent = name;
      sel.insertBefore(o, sel.querySelector('option[value="__new__"]'));
      sel.value = name;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      box.remove();
      toast(`Added “${name}”`);
    } catch (err) { toast(err.message, true); }
  }, true);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.closest && e.target.closest('.addnew')) { e.preventDefault(); e.target.closest('.addnew').querySelector('[data-addnew]').click(); }
  }, true);

  // ── Helpers for markup ────────────────────────────────────────
  const kpi = (label, value, sub, cls) => `<div class="kpi ${cls || ''}"><small>${esc(label)}</small><b title="${esc(value)}">${esc(value)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>`;
  // Header prefixes: ">" right-aligned number, "~" hidden on phones (details stay in exports).
  const th = (h) => {
    let hm = ''; if (h.startsWith('~')) { hm = ' data-hm="1"'; h = h.slice(1); }
    return h.startsWith('>') ? `<th class="r"${hm}>${h.slice(1)}</th>` : `<th${hm}>${h}</th>`;
  };
  const table = (head, rows, foot) => `<div class="tbl-wrap"><table><thead><tr>${head.map(th).join('')}</tr></thead>
    <tbody>${rows.join('') || `<tr><td colspan="${head.length}" class="empty">${svg('<path d="M4 7h16M4 12h16M4 17h10"/>')}No records for this selection.</td></tr>`}</tbody>${foot ? `<tfoot><tr>${foot}</tr></tfoot>` : ''}</table></div>`;
  // PDF + Excel buttons for a screen; EXPORTS[key]() builds the report from the current filters.
  const exportBtns = (key) => `<span class="btn-group"><button type="button" class="btn sm" data-act="export" data-what="${key}" data-fmt="pdf">${svg('<path d="M6 3h9l4 4v14H6zM14 3v5h5"/><path d="M9 14h6M9 17h4"/>')}PDF</button><button type="button" class="btn sm" data-act="export" data-what="${key}" data-fmt="xlsx">${svg('<rect x="4" y="3" width="18" height="16" rx="2"/><path d="M8 8l8 8M16 8l-8 8"/>')}Excel</button><button type="button" class="btn sm" data-act="export" data-what="${key}" data-fmt="jpeg">${svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>')}Image</button></span>`;
  const SUBS = {};
  const activeMembers = () => S().team.filter((m) => !m.disabled);
  const memberOptions = (sel, blank) => (blank != null ? opt('', blank, sel) : '') + activeMembers().map((m) => opt(m.id, m.name + (m.designation ? ` · ${m.designation}` : ''), sel)).join('')
    + (sel && !activeMembers().some((m) => m.id === sel) && admin.member(sel) ? opt(sel, admin.member(sel).name + ' (disabled)', sel) : '');
  const typeBadge = (t) => `<span class="badge ${t === 'injection' ? 'info' : t === 'protein' ? 'ok' : t === 'service' ? 'teal' : 'warn'}">${saleLabel(t)}</span>`;
  // What the clinic sells (Settings → What you sell); switched-off groups are hidden from Sell and Products.
  const groupOn = (t) => (set().groups || {})[t] !== false;
  // A sale tab shows for each type that is switched on and has something to sell.
  const hasStock = (k) => (k === 'diet' ? set().dietPlans.some((p) => !p.disabled) : admin.itemsOf(k, true).some((i) => !i.disabled));
  const saleTypes = () => Object.entries(A.SALE_TYPES).filter(([k]) => groupOn(k) && hasStock(k));
  const saleLabel = (t) => A.SALE_TYPES[t] || admin.kindName(t);
  const soldKinds = () => admin.kinds().filter((k) => k.sell);
  const splitText = (s) => s.splits.map((x) => `${esc(x.name)}${s.splits.length > 1 ? ` ${x.pct}%` : ''}`).join(' + ');

  function download(name, text, type) {
    // The Android app has no blob downloads; its bridge opens the system "Save as" screen.
    if (window.AndroidBridge && window.AndroidBridge.saveFile) { window.AndroidBridge.saveFile(name, (type || 'text/csv').split(';')[0], text); return; }
    if (window.AndroidBridge) { toast('Update the app to save files', true); return; }
    const blob = new Blob([text], { type: type || 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // ── Modal forms ───────────────────────────────────────────────
  let modalSubmit = null;
  function field(f) {
    const id = `mf-${f.name}`;
    const v = f.value == null ? '' : f.value;
    const attrs = `id="${id}" name="${f.name}"${f.required ? ' required' : ''}${f.attrs ? ' ' + f.attrs : ''}`;
    let input;
    if (f.type === 'select') input = `<select ${attrs}>${f.options.map(([ov, ol]) => opt(ov, ol, v)).join('')}</select>`;
    else if (f.type === 'list') input = listSelect(f.list, attrs, v, f.blank);
    else if (f.type === 'textarea') input = `<textarea ${attrs}>${esc(v)}</textarea>`;
    else if (f.type === 'checkbox') return `<label class="check ${f.span ? 'span' : ''}"><input type="checkbox" ${attrs}${v ? ' checked' : ''}> ${esc(f.label)}${f.hint ? ` <span class="hint">${esc(f.hint)}</span>` : ''}</label>`;
    else input = `<input type="${f.type || 'text'}" ${attrs} value="${esc(v)}"${f.type === 'number' ? ` step="${f.step || 'any'}" min="${f.min != null ? f.min : 0}"` : ''}${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ''}>`;
    return `<label class="f ${f.span ? 'span' : ''}" for="${id}">${esc(f.label)}${input}${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ''}</label>`;
  }
  /** Open a form in the modal; onSubmit(values) may throw to show an error. */
  function openForm({ title, fields, html, submitLabel, onSubmit, danger, ro }) {
    if (readOnly() && !ro && submitLabel !== false) { submitLabel = false; html = `<p class="ro-note">View only: this login cannot change data.</p>${html || ''}`; }
    $('#modal-title').textContent = title;
    $('#modal-body').innerHTML = (html || '') + (fields ? `<div class="grid">${fields.map(field).join('')}</div>` : '');
    $('#modal-err').textContent = '';
    $('#modal-foot').innerHTML = `<button type="button" class="btn" data-close>Cancel</button>${submitLabel !== false ? `<button type="submit" class="btn primary${danger ? ' danger' : ''}">${esc(submitLabel || 'Save')}</button>` : ''}`;
    modalSubmit = () => {
      const values = {};
      (fields || []).forEach((f) => {
        const el = $(`#mf-${f.name}`);
        if (!el) return;
        values[f.name] = f.type === 'checkbox' ? el.checked : f.type === 'number' ? (el.value === '' ? '' : Number(el.value)) : el.value.trim();
        if (f.required && values[f.name] === '') throw new Error(`${f.label} is required`);
      });
      return onSubmit ? onSubmit(values) : undefined;
    };
    modal.showModal();
    const first = $('input:not([type=checkbox]), select, textarea', $('#modal-body'));
    if (first) setTimeout(() => first.focus(), 30);
  }
  // Sign-in details shown once after creating a login or resetting a password.
  function showCreds(a, pass, title) {
    openForm({ title, submitLabel: false, html: `<p style="margin-top:0">Give these sign-in details to <b>${esc(a.name)}</b>. The password is not shown again.</p>
      <div class="creds"><div><small>User ID</small><b>${esc(a.username)}</b></div><div><small>Password</small><b>${esc(pass)}</b></div></div>` });
  }
  function confirmBox(title, message, okLabel) {
    return new Promise((resolve) => {
      openForm({ title, html: `<p>${esc(message)}</p>`, submitLabel: okLabel || 'Delete', danger: true, onSubmit: () => resolve(true) });
      modal.addEventListener('close', () => resolve(false), { once: true });
    });
  }
  $('#modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const r = await modalSubmit();
      modal.close();
      render();
      if (typeof r === 'string') toast(r);
    } catch (err) { $('#modal-err').textContent = err.message; }
  });
  modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) modal.close(); });

  // ── Screens ───────────────────────────────────────────────────
  const SCREENS = {};
  const AFTER = {};

  SCREENS.dashboard = () => {
    const d = admin.dashboard(range());
    const s = d.sales; const p = d.patients; const t = d.team; const st = d.stock;
    const months = admin.financialReport(null).monthly.slice(-6);
    const max = Math.max(1, ...months.map((m) => Math.max(m.revenue, m.expenses)));
    const ap = d.appointments; const td = d.today;
    const empty = !S().sales.length && !S().team.length && !S().appointments.length;
    const H = (ic, cls, title) => `<h2><span class="ic ${cls}">${svg(ic)}</span>${title}</h2>`;
    const all = admin.dashboard(null);
    const money = (x) => [['Revenue', x.sales.revenue, ''], ['Product expenses', x.productExpenses, 'gold'], ['All expenses (counted)', x.sales.expenses, 'gold'], ['Net profit', x.sales.profit, x.sales.profit >= 0 ? 'good' : 'bad']];
    return `<div class="toolbar">${periodBar()}<span class="grow"></span>${exportBtns('dashboard')}</div>
      <section class="hero dash-hero">
        <div class="dh-top"><div><small>${(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; })()}, ${esc(me.name.split(' ')[0])}</small><b class="dh-big">${inr(s.revenue)}</b><small>Revenue · ${esc(periodLabel())}</small></div>
          <div class="dh-spark">${(() => { const days = Array.from({ length: 7 }, (_, i) => shiftDay(admin.today(), i - 6)); const v = days.map((x) => S().sales.filter((y) => y.date === x).reduce((a, y) => a + y.amount, 0)); const m = Math.max(1, ...v); return `${v.map((x, i) => `<i style="height:${8 + (x / m) * 92}%" title="${fdate(days[i])}: ${inr(x)}"></i>`).join('')}<small>Last 7 days</small>`; })()}</div></div>
        <div class="dh-quick">${[['sell', 'New sale', '<path d="M12 5v14M5 12h14"/>'], ['leads', 'Leads', ICON_LEADS], ['appointments', 'OPD', ICON_CAL], ['expenses', 'Expense', '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'], ['reports', 'Reports', '<path d="M5 3h14v18H5zM9 8h6M9 12h6M9 16h3"/>']].filter(([k]) => can(k)).map(([k, l, ic]) => `<button type="button" data-go="${k}">${svg(ic)}<span>${l}</span></button>`).join('')}</div>
        <div class="hero-row">
          <div class="hk"><small>Today's OPD</small><b>${num(td.total - td.cancelled)}</b><small>${td.completed} done · ${td.booked} waiting</small></div>
          <div class="hk"><small>Revenue</small><b>${inr(s.revenue)}</b></div>
          <div class="hk"><small>Net profit</small><b>${inr(s.profit)}</b></div>
          <div class="hk"><small>Renewals due</small><b>${num(d.renewalsDue)}</b></div>
        </div>
      </section>
      ${st.order.length && can('inventory') ? `<button type="button" class="order-banner" data-go="today">${svg('<path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>')}<span><b>Order required</b>${st.order.map((o) => `${esc(o.item.name)} (${num(o.stock)})`).join(' · ')}</span>${svg('<path d="M9 5l7 7-7 7"/>')}</button>` : ''}
      ${reminderBanner(d.content)}
      ${(() => { const al = myAlerts().filter((x) => !['Founder', 'Notes'].includes(x.area)); return al.length ? `<button type="button" class="alert-strip ${al.some((x) => x.level === 'bad') ? 'bad' : ''}" data-act="alerts">${svg('<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>')}<span><b>${plural(al.length, 'alert')}</b>${al.slice(0, 2).map((x) => esc(x.text)).join(' · ')}</span>${svg('<path d="M9 5l7 7-7 7"/>')}</button>` : ''; })()}
      ${empty ? `<div class="card"><h2>Welcome</h2><p>Start in three steps: <button class="link" data-go="team">add your team</button>, <button class="link" data-go="products">set product prices</button>, then <button class="link" data-go="purchases">add stock</button>. Appointments and sales then update revenue, stock and incentives automatically.</p></div>` : ''}
      ${waCard()}
      ${deskCard()}
      ${can('sales') || can('sell') ? `<section class="card">${H('<path d="M4 19h16M7 16V9M12 16V5M17 16v-4"/>', 'teal', "Today's sales")}<span class="sp"></span>
        ${table(['Patient', 'Product', '>Amount', 'Reference'], d.todaySales.map((x) => `<tr><td>${esc(x.patientName)}</td><td>${typeBadge(x.type)} ${esc(x.product)}</td><td class="r"><b>${inr(x.amount)}</b></td><td><b>${splitText(x)}</b></td></tr>`),
          d.todaySales.length ? `<td colspan="2">Total · ${plural(d.todaySales.length, 'sale')}</td><td class="r">${inr(d.todaySales.reduce((a, x) => a + x.amount, 0))}</td><td></td>` : '')}</section>` : ''}
      ${can('expenses') ? `<section class="card money-card">${H('<path d="M12 3v18M17 7H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6"/>', 'good', 'Profit & expenses')}
        <div class="money-rows">${money(d).map(([l, v, c], i) => `<div class="money-row ${c}"><span>${l}</span><b>${inr(v)}</b><small>All time ${inr(money(all)[i][1])}</small></div>`).join('')}</div>
        <p class="hint" style="margin:8px 0 0">Product = purchase expenses. Leave an expense out of totals with the Count switches in <button class="link" data-go="expenses">Expenses</button>.</p></section>` : ''}
      <div class="cards">
        <section class="card">${H('<path d="M4 19h16M7 16V9M12 16V5M17 16v-4"/>', '', 'Sales summary')}<div class="kpis">
          ${kpi('Total orders', num(s.orders))}
          ${kpi('Total revenue', inr(s.revenue))}
          ${kpi('Total expenses', inr(s.expenses), '', 'gold')}
          ${kpi('Net profit', inr(s.profit), 'Revenue − Expenses', s.profit >= 0 ? 'good' : 'bad')}
          ${d.byType.filter((x) => groupOn(x.type) && (x.items || x.count)).map((x, i) => kpi(x.type === 'service' ? 'Services & packages' : `${x.label} sales`, inr(x.amount), plural(x.count, 'sale'), ['teal', '', 'violet', 'gold', 'good'][i % 5])).join('')}
          ${kpi('Consultation fees', inr(s.consultation), `${ap.total - ap.cancelled} appointments`, 'teal')}
        </div></section>
        <section class="card">${H(ICON_CAL, 'violet', 'OPD appointments')}<div class="kpis">
          ${kpi('Appointments', num(ap.total))}
          ${kpi('Clinic visits', num(ap.clinic), '', 'teal')}
          ${kpi('Online', num(ap.online), '', 'violet')}
          ${kpi('Completed', num(ap.completed), '', 'good')}
          ${kpi('Fees collected', inr(ap.fees), '', 'good')}
          ${kpi('Unpaid', num(ap.unpaid), '', ap.unpaid ? 'warn' : '')}
          ${ap.byClinic.length > 1 ? ap.byClinic.map((c) => kpi(c.name, num(c.count), `${inr(c.fees)} fees`, 'teal')).join('') : ''}
        </div></section>
        <section class="card">${H('<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/>', 'teal', 'Patient summary')}<div class="kpis">
          ${kpi('Total patients', num(p.total), 'All time')}
          ${kpi('New patients', num(p.new), '', 'teal')}
          ${kpi('Renewal patients', num(p.renewal), '', 'violet')}
          ${kpi('Active patients', num(p.active), `Last ${set().activeDays} days`, 'good')}
        </div>
        ${d.renewalsDue && can('renewals') ? `<p style="margin:12px 0 0"><button class="btn sm gold" data-go="renewals">${d.renewalsDue} renewal alert${d.renewalsDue > 1 ? 's' : ''} (${set().renewalDays[0]}+ days) →</button></p>` : ''}</section>
        ${can('leads') ? `<section class="card">${H(ICON_LEADS, 'gold', 'Leads')}<div class="kpis">
          ${kpi('New leads', num(d.leads.total))}
          ${kpi('Open leads', num(d.leads.open), '', 'violet')}
          ${kpi('Converted', num(d.leads.won), `${d.leads.conversion}% conversion`, 'good')}
          ${kpi('Follow-ups due', num(d.leads.dueToday + d.leads.overdue), d.leads.overdue ? `${d.leads.overdue} overdue` : 'today', d.leads.overdue ? 'bad' : 'gold')}
        </div></section>` : ''}
        ${can('team') ? `<section class="card">${H('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>', 'gold', 'Team summary')}<div class="kpis">
          ${kpi('Team members', num(t.members), 'Active')}
          ${kpi('Total incentives', inr(t.incentives), '', 'gold')}
          ${kpi('Total salary', inr(t.salary), 'Per month')}
          ${kpi('Top performer', t.top ? t.top.name : '—', t.top ? `${inr(t.top.totalSales)} sales` : '', 'good')}
        </div></section>` : ''}
        ${can('expenses') && d.expenseSummary.count ? `<section class="card">${H('<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>', 'gold', 'Expenses')}<div class="kpis">
          ${kpi('Total expenses', inr(d.expenseSummary.total), plural(d.expenseSummary.count, 'entry', 'entries'), 'gold')}
          ${d.expenseSummary.byCategory.slice(0, 5).map((x) => kpi(x.name, inr(x.amount), plural(x.count, 'entry', 'entries'))).join('')}
        </div>${d.expenseSummary.byName.length ? `<div class="stock-chips" style="margin-top:10px">${d.expenseSummary.byName.slice(0, 8).map((x) => `<span class="chip"><b>${inr(x.amount)}</b>${esc(x.name)}</span>`).join('')}</div>` : ''}</section>` : ''}
        ${can('content') && S().content.length ? `<section class="card">${H('<rect x="3" y="5" width="14" height="14" rx="2"/><path d="M17 10l4-2v8l-4-2"/>', 'violet', 'Content & posts')}<div class="kpis">
          ${kpi('Total videos', num(d.content.total))}
          ${kpi('Edited', num(d.content.edited), '', 'teal')}
          ${kpi('Posted', num(d.content.posted), '', 'good')}
          ${kpi('Remaining to post', num(d.content.remaining), `${d.content.scheduled} scheduled`, d.content.remaining ? 'gold' : '')}
        </div></section>` : ''}
        <section class="card">${H('<rect x="4" y="4" width="16" height="6" rx="1"/><rect x="4" y="14" width="16" height="6" rx="1"/>', '', 'Stock summary')}
        <div class="stock-chips">${st.available.length ? st.available.map((x) => `<span class="chip ${x.item.orderAt != null && x.stock < x.item.orderAt ? 'bad' : 'ok'}"><b>${num(x.stock)}</b>${esc(x.item.name)}</span>`).join('') : '<span class="hint">No stock available yet</span>'}${st.services.map((i) => `<span class="chip"><b>∞</b>${esc(i.name)}</span>`).join('')}</div>
        <div class="kpis">
          ${d.stockByKind.filter((k) => k.items).map((k) => kpi(`${k.name} stock`, num(k.stock), plural(k.items, 'item'))).join('')}
          ${kpi('Low stock alerts', set().stockAlerts === false ? 'Off' : num(st.low.length), '', st.low.length ? 'bad' : 'good')}
        </div>
        ${st.order.length ? `<div class="alerts" style="margin-top:12px">${st.order.map((l) => `<div class="alert bad"><b>${esc(l.item.name)}</b><span class="badge bad">Order required · ${num(l.stock)} left</span></div>`).join('')}</div>` : ''}
        ${(() => { const lowOnly = st.low.filter((l) => !st.order.some((o) => o.item.id === l.item.id)); st.lowOnly = lowOnly; return ''; })()}
        ${st.lowOnly.length ? `<div class="alerts" style="margin-top:12px">${st.lowOnly.slice(0, 4).map((l) => `<div class="alert"><b>${esc(l.item.name)}</b><span class="badge bad">${num(l.stock)} left</span></div>`).join('')}${st.lowOnly.length > 4 ? `<button class="link" data-go="inventory">See all ${st.lowOnly.length} low items →</button>` : ''}</div>` : ''}</section>
      </div>
      <section class="card">${H('<path d="M4 19h16M7 16V9M12 16V5M17 16v-4"/>', 'teal', 'Revenue vs expenses by month')}
        ${months.length ? `<div class="legend"><span><i style="background:var(--accent)"></i>Revenue</span><span><i style="background:var(--warn)"></i>Expenses</span></div><div class="bars">
          ${months.map((m) => `<div class="bar-row"><span>${fdate(m.month)}</span><div class="bar-track">
            <div class="bar rev" style="width:${(m.revenue / max) * 100}%" title="Revenue ${inr(m.revenue)}"></div>
            <div class="bar exp" style="width:${(m.expenses / max) * 100}%" title="Expenses ${inr(m.expenses)}"></div></div>
            <b class="num" style="text-align:right;color:${m.profit >= 0 ? 'var(--ok)' : 'var(--danger)'}">${inr(m.profit)}</b></div>`).join('')}
        </div>` : '<p class="empty">Monthly figures appear after the first sale or expense.</p>'}
      </section>`;
  };

  // WhatsApp in one tap: today's follow-ups, OPD reminders and renewals due, each with a ready message.
  // Dashboard: this month's targets and the open tasks of this login.
  function deskCard() {
    if (!can('manage')) return '';
    const tp = admin.targetProgress(admin.today().slice(0, 7));
    const mine = (S().tasks || []).filter((t) => !t.done && (!t.assignedTo || t.assignedTo === me.id)).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
    const goals = [['Revenue', inr(tp.revenue), tp.revenueGoal, tp.revenuePct], ['New leads', num(tp.leads), tp.leadsGoal, tp.leadsPct], ['New patients', num(tp.patients), tp.patientsGoal, tp.patientsGoal ? Math.round((tp.patients / tp.patientsGoal) * 100) : 0]].filter((g) => g[2]);
    if (!goals.length && !mine.length) return '';
    return `<section class="card desk-card"><h2><span class="ic good">${svg('<path d="M12 20V10M18 20V4M6 20v-4"/>')}</span>Targets & tasks<span class="sp"></span><button class="btn sm" data-go="manage">Team Desk</button></h2>
      ${goals.length ? `<div class="target-grid">${goals.map(([l, v, , pct]) => `<div class="target"><small>${l}</small><b>${v}</b><span>${pct}% of target</span><div class="meter ${pct >= 100 ? 'good' : ''}"><i style="width:${Math.min(100, pct)}%"></i></div></div>`).join('')}</div>` : ''}
      ${mine.length ? `<div class="task-list" style="margin-top:${goals.length ? 12 : 0}px">${mine.slice(0, 5).map((t) => `<div class="task ${t.priority}"><button type="button" class="tick" data-act="task-done" data-id="${t.id}" aria-label="Mark done"></button><div><b>${esc(t.title)}</b><small>${t.due ? `due ${fdate(t.due)}` : 'no due date'}${t.due && t.due < admin.today() ? ' · <span class="bad-t">overdue</span>' : ''}</small></div></div>`).join('')}</div>` : ''}</section>`;
  }
  // WhatsApp today: which messages show, how many and their wording are set from the card's ⚙ button.
  const WA_KINDS = {
    followup: ['Follow-ups', 'warn', 'Namaste {name}, this is {clinic}. Just following up on your enquiry{about}. When is a good time to talk?'],
    newlead: ['New leads (welcome)', 'teal', 'Namaste {name}, thank you for contacting {clinic}! I am {me}. How can we help you{about}?'],
    opd: ['OPD reminders', 'info', 'Namaste {name}, a reminder of your {visit} at {place} today{time}.{link}'],
    unpaid: ['Unpaid OPD fees', 'bad', 'Namaste {name}, thank you for visiting {clinic}. Your consultation fee of {fee} is pending. You can pay at the clinic or by UPI.'],
    renewal: ['Renewals due', 'gold', 'Namaste {name}, it is time to renew your {product} at {clinic}. Reply here to book.'],
    winback: ['Inactive patients', 'violet', 'Namaste {name}, we miss you at {clinic}! It has been a while since your last visit. Shall we plan your next session?'],
  };
  let waTab = ''; let waShowAll = false;
  const waSet = () => ({ kinds: { followup: true, newlead: true, opd: true, unpaid: true, renewal: true, winback: false }, max: 8, days: 45, tpl: {}, ...(set().waCard || {}) });
  const fillWa = (k, v) => (waSet().tpl[k] || WA_KINDS[k][2]).replace(/\{(\w+)\}/g, (_, x) => (v[x] != null ? v[x] : ''));
  function waRows() {
    const d = admin.today(); const w = waSet(); const rows = []; const on = (k) => w.kinds[k] !== false && (k !== 'winback' || w.kinds.winback);
    const base = { clinic: set().clinic, me: me.name.split(' ')[0] };
    if (can('leads')) {
      const ld = admin.leadDay(d, myLeadFilter());
      if (on('followup')) ld.dueToday.concat(ld.overdue).forEach((l) => rows.push({ k: 'followup', lead: l.id, who: l.name, what: `Follow-up${l.followTime ? ` ${time12(l.followTime)}` : ''}${l.followUp < d ? ' (overdue)' : ''}`, mobile: l.mobile, msg: fillWa('followup', { ...base, name: l.name, about: l.interest ? ` about ${l.interest}` : '' }), cls: l.followUp < d ? 'bad' : 'warn' }));
      if (on('newlead')) ld.newLeads.filter((l) => !(l.history || []).some((h) => ['call', 'whatsapp'].includes(h.type))).forEach((l) => rows.push({ k: 'newlead', lead: l.id, who: l.name, what: `New lead${l.source ? ` · ${l.source}` : ''}`, mobile: l.mobile, msg: fillWa('newlead', { ...base, name: l.name, about: l.interest ? ` with ${l.interest}` : '' }), cls: 'teal' }));
    }
    if (can('appointments')) {
      const ap = admin.appointmentsIn({ from: d, to: d });
      if (on('opd')) ap.filter((a) => a.status === 'booked').forEach((a) => rows.push({ k: 'opd', who: a.patientName, what: `OPD ${a.time ? time12(a.time) : 'today'}${a.clinicName && set().clinics.length > 1 ? ` · ${a.clinicName}` : ''}`, mobile: a.mobile, msg: fillWa('opd', { ...base, name: a.patientName, visit: a.mode === 'online' ? 'online consultation' : 'visit', place: a.clinicName || set().clinic, time: a.time ? ` at ${time12(a.time)}` : '', link: a.link ? ` Join: ${a.link}` : '' }), cls: 'info' }));
      if (on('unpaid')) admin.appointmentsIn({ from: shiftDay(d, -7), to: d }).filter((a) => a.status === 'completed' && !a.paid && Number(a.fee)).forEach((a) => rows.push({ k: 'unpaid', who: a.patientName, what: `Fee ${inr(a.fee)} pending · ${fdate(a.date)}`, mobile: a.mobile, msg: fillWa('unpaid', { ...base, name: a.patientName, fee: inr(a.fee) }), cls: 'bad' }));
    }
    if (can('renewals') && on('renewal')) admin.renewals().filter((r) => r.stage && !r.done).forEach((r) => rows.push({ k: 'renewal', who: r.name, what: `Renewal · ${r.product}`, mobile: r.mobile, msg: fillWa('renewal', { ...base, name: r.name, product: r.product }), cls: 'gold' }));
    if (can('patients') && on('winback')) {
      const cut = shiftDay(d, -(Number(w.days) || 45));
      S().patients.forEach((p) => { const last = admin.patientSales(p.id).at(-1); if (last && last.date < cut) rows.push({ k: 'winback', who: p.name, what: `Last visit ${fdate(last.date)}`, mobile: p.mobile, msg: fillWa('winback', { ...base, name: p.name }), cls: 'violet' }); });
    }
    return rows.filter((r) => r.mobile);
  }
  function waCard() {
    const w = waSet(); const all = waRows();
    const kinds = Object.keys(WA_KINDS).filter((k) => all.some((r) => r.k === k));
    const list = all.filter((r) => !waTab || r.k === waTab); const max = waShowAll ? Infinity : Math.max(3, Number(w.max) || 8);
    return `<section class="card wa-card"><h2><span class="ic wa">${svg('<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/><path d="M9 9.5c.3 1.8 1.7 3.3 3.5 3.9l1-1 2 .8v1.3c-2.8.4-6.6-2.3-7.4-5.6h1.3z"/>')}</span>WhatsApp today<span class="sp"></span><span class="badge ok">${all.length}</span>${readOnly() ? '' : `<button type="button" class="btn xs" data-act="wa-setup" aria-label="WhatsApp options">⚙ Options</button>`}</h2>
      ${kinds.length > 1 ? `<div class="scroll-x"><div class="seg sm wa-tabs"><button type="button" data-watab="" class="${!waTab ? 'on' : ''}">All ${all.length}</button>${kinds.map((k) => `<button type="button" data-watab="${k}" class="${waTab === k ? 'on' : ''}"><i class="wa-dot ${WA_KINDS[k][1]}"></i>${WA_KINDS[k][0]} ${all.filter((r) => r.k === k).length}</button>`).join('')}</div></div>` : ''}
      ${list.length ? `<div class="wa-list">${list.slice(0, max).map((r) => `<a class="wa-row" href="${esc(waLink(r.mobile, r.msg))}" target="_blank" rel="noopener"${r.lead ? ` data-walead="${r.lead}"` : ''}><span class="wa-dot ${r.cls}"></span><span><b>${esc(r.who)}</b><small>${esc(r.what)}</small></span><span class="wa-go">WhatsApp</span></a>`).join('')}</div>${list.length > max ? `<p class="hint" style="margin:8px 0 0">${list.length - max} more · <button type="button" class="link" data-act="wa-all">Show all</button></p>` : ''}`
        : '<p class="hint" style="margin:0">Nothing to send right now. Choose what shows here with ⚙ Options.</p>'}</section>`;
  }
  function waSetup() {
    const w = waSet();
    openForm({ title: 'WhatsApp today · options',
      html: `<p class="hint" style="margin-top:0">Choose what appears on the dashboard card and edit each message. Words in braces are filled in for you: {name} {clinic} {me} {time} {place} {product} {fee} {about} {visit} {link}.</p>`,
      fields: [
        ...Object.entries(WA_KINDS).map(([k, [l]]) => ({ name: `on-${k}`, label: `Show ${l}`, type: 'checkbox', value: k === 'winback' ? !!w.kinds.winback : w.kinds[k] !== false })),
        { name: 'max', label: 'Rows shown before "Show all"', type: 'number', value: w.max },
        { name: 'days', label: 'Inactive after (days, for inactive patients)', type: 'number', value: w.days },
        ...Object.entries(WA_KINDS).map(([k, [l, , def]]) => ({ name: `tpl-${k}`, label: `${l} message`, type: 'textarea', value: w.tpl[k] || def, span: true })),
      ],
      onSubmit: (v) => {
        const kinds = {}; const tpl = {};
        Object.entries(WA_KINDS).forEach(([k, [, , def]]) => { kinds[k] = !!v[`on-${k}`]; const t = String(v[`tpl-${k}`] || '').trim(); if (t && t !== def) tpl[k] = t; });
        admin.updateSettings({ waCard: { kinds, tpl, max: Math.max(3, Number(v.max) || 8), days: Math.max(7, Number(v.days) || 45) } });
        return 'WhatsApp options saved';
      } });
  }

  // Dashboard boxes open the screen behind the number (tap "Leads" → Leads, "Expenses" → Expenses…).
  const BOX_RULES = [[/renewals due|renewal alert/, 'renewals'], [/patient/, 'patients'], [/renewal/, 'renewals'], [/follow-up|lead|convert/, 'leads'],
    [/opd|appointment|clinic visit|online|consultation|fees collected|unpaid|completed|waiting/, 'appointments'], [/incentive/, 'incentives'], [/salary/, 'salary'],
    [/team|performer|member/, 'team'], [/stock|order required/, 'inventory'], [/video|post|edited|content/, 'content'], [/ad spend|campaign|cost per lead/, 'marketing'],
    [/target|task/, 'manage'], [/expense/, 'expenses'], [/profit|revenue|sale|order|service|package|amount|product/, 'sales']];
  const BOX_SCREENS = ['dashboard', 'today', 'reports'];
  function linkBoxes() {
    if (!BOX_SCREENS.includes(screen)) return;
    $$('#view .kpi, #view .hk, #view .money-row, #view .target').forEach((el) => {
      if (el.closest('[data-go], button, a') || el.dataset.go) return;
      const label = ((el.querySelector('small, span') || {}).textContent || '').toLowerCase();
      const sec = el.closest('section'); const head = ((sec && sec.querySelector('h2')) || {}).textContent || '';
      const rule = BOX_RULES.find(([re]) => re.test(label)) || BOX_RULES.find(([re]) => re.test(head.toLowerCase()));
      if (!rule || !can(rule[1]) || rule[1] === screen) return;
      el.dataset.go = rule[1]; el.classList.add('linked'); el.setAttribute('role', 'button'); el.tabIndex = 0;
    });
  }
  // Every summary box and card can be shown or hidden per screen (Customize); the choice is saved for everyone.
  const cardKey = (el) => (el.classList.contains('hero') ? 'Highlights' : ((el.querySelector('h2') || {}).textContent || '').replace(/\d+$/, '').trim());
  const boxKey = (el) => ((el.querySelector('small') || {}).textContent || '').trim();
  const hiddenOn = (scr) => { const h = (set().hide || {})[scr]; return h || (scr === 'dashboard' ? (set().dashHide || []) : []); };
  const CUSTOM_SCREENS = ['dashboard', 'founder', 'today', 'leads', 'appointments', 'content', 'marketing', 'manage', 'expenses', 'sales', 'patients', 'renewals', 'inventory', 'reports', 'incentives', 'doctors'];
  const canCustomize = () => !readOnly() && ['super', 'admin', 'manager'].includes(role);
  function applyHidden() {
    if (!CUSTOM_SCREENS.includes(screen)) return;
    const hide = hiddenOn(screen);
    $$('#view .hero, #view section.card, #view > .card, #view .kpi').forEach((el) => {
      const key = el.classList.contains('kpi') ? `box:${boxKey(el)}` : cardKey(el);
      if (key && hide.includes(key)) el.hidden = true;
    });
    const tb = $('#view .toolbar');
    if (tb && !$('[data-act="customize"]', tb) && canCustomize()) {
      tb.insertAdjacentHTML('beforeend', `<button type="button" class="btn sm ghost" data-act="customize" title="Choose which cards and boxes show on this screen">${svg('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>')}Show / hide</button>`);
    }
  }
  function customizeForm() {
    const hide = hiddenOn(screen);
    const groups = [];
    $$('#view .hero, #view section.card, #view > .card').forEach((el) => {
      const key = cardKey(el);
      if (!key) return;
      const boxes = el.classList.contains('hero') ? [] : $$('.kpi', el).map((k) => `box:${boxKey(k)}`).filter((k) => k !== 'box:');
      if (!groups.some((g) => g.key === key)) groups.push({ key, boxes });
    });
    const loose = $$('#view > .kpis .kpi').map((k) => `box:${boxKey(k)}`);
    if (loose.length) groups.unshift({ key: 'Summary boxes', boxes: loose, noCard: true });
    let n = 0; const all = [];
    const box = (k, label, sub) => { all.push(k); n += 1; return `<label class="check ${sub ? 'sub' : ''}"><input type="checkbox" data-hk="${n - 1}" ${hide.includes(k) ? '' : 'checked'}> ${esc(label)}</label>`; };
    openForm({
      title: `Customize ${TITLES[screen] || (NAV.find((x) => x[0] === screen) || [, screen])[1]}`,
      html: `<p class="hint" style="margin-top:0">Tick what shows on this screen. Unticked cards and boxes are hidden for everyone; their data stays.</p>
        <div class="cust-list">${groups.map((g) => `<div class="cust-group">${g.noCard ? `<b>${esc(g.key)}</b>` : box(g.key, g.key)}${g.boxes.map((b) => box(b, b.slice(4), true)).join('')}</div>`).join('')}</div>`,
      onSubmit: () => {
        const off = all.filter((k, i) => !$(`[data-hk="${i}"]`).checked);
        admin.updateSettings({ hide: { ...(set().hide || {}), [screen]: off }, ...(screen === 'dashboard' ? { dashHide: [] } : {}) });
        return 'Screen updated';
      },
    });
  }

  // ── Alerts bell: every alert in the app (stock, leads, renewals, OPD, posts, tasks, ads, founder limit) ──
  const ALERT_AREAS = { Stock: 'inventory', Leads: 'leads', Renewals: 'renewals', OPD: 'appointments', Content: 'content', Tasks: 'manage', Ads: 'marketing', Founder: 'founder', Targets: 'manage', Notes: 'founder' };
  const myAlerts = () => { try { return admin.alerts().filter((a) => can(a.go || ALERT_AREAS[a.area])); } catch (_) { return []; } };
  function updateBell() {
    const b = $('#bell-btn'); if (!b) return;
    const list = myAlerts(); const n = $('#bell-n');
    n.hidden = !list.length; n.textContent = list.length > 9 ? '9+' : String(list.length);
    b.classList.toggle('hot', list.some((x) => x.level === 'bad'));
  }
  const alertRows = (list) => (list.length ? `<div class="alert-list">${list.map((a) => `<button type="button" class="alert-row ${a.level}" data-go="${a.go}"><span class="al-dot"></span><span><small>${esc(a.area)}</small><b>${esc(a.text)}</b></span>${svg('<path d="M9 5l7 7-7 7"/>')}</button>`).join('')}</div>`
    : `<div class="all-clear">${svg('<path d="M5 12l5 5 9-10"/>')}<b>All clear</b><small>No alerts right now.</small></div>`);
  function alertsModal() {
    const list = myAlerts();
    openForm({ title: `Alerts${list.length ? ` · ${list.length}` : ''}`, submitLabel: false, ro: true, html: alertRows(list) });
  }

  // ── Founder Hub: founder profile, common vs founder expenses, alerts, discussions and key numbers ──
  let noteF = ''; let fdSel = ''; let noteQ = '';
  const NOTE_TAGS = { discussion: 'Discussion', decision: 'Decision', important: 'Important', idea: 'Idea', meeting: 'Meeting' };
  const NOTE_MODES = { 'In person': '🤝', Call: '📞', WhatsApp: '💬', 'Video call': '🎥', Meeting: '🗓️', Email: '✉️' };
  const fName = (id) => (admin.founder(id) || {}).name || '';
  const initialsOf = (n) => String(n || 'F').split(/\s+/).map((x) => x[0]).join('').slice(0, 2).toUpperCase();
  const pctChange = (a, b) => (b ? Math.round(((a - b) / Math.abs(b)) * 100) : 0);
  const trend = (a, b, goodUp = true) => { if (!b) return ''; const p = pctChange(a, b); const up = p >= 0; return `<em class="trend ${up === goodUp ? 'up' : 'down'}">${up ? '▲' : '▼'} ${Math.abs(p)}%</em>`; };
  SUBS.founder = () => `${admin.founders().length ? plural(admin.founders().length, 'founder') : 'Founders'} · ${periodLabel()}`;
  SCREENS.founder = () => {
    const r = range(); const today = admin.today();
    const fin = admin.financialReport(r); const d = admin.dashboard(r); const sm = admin.expenseSummary(r);
    const fsAll = admin.founderStats(r, { all: true }); const fs = fsAll.filter((f) => !f.disabled); const offF = fsAll.filter((f) => f.disabled); const sel = fsAll.find((f) => f.id === fdSel) || null;
    const month = today.slice(0, 7); const prevM = (() => { const x = new Date(`${month}-01T00:00:00`); x.setMonth(x.getMonth() - 1); return A.isoDate(x).slice(0, 7); })();
    const mFin = admin.financialReport({ from: `${month}-01`, to: `${month}-31` }); const pFin = admin.financialReport({ from: `${prevM}-01`, to: `${prevM}-31` });
    const al = myAlerts();
    const months = Array.from({ length: 6 }, (_, i) => { const dt = new Date(); dt.setDate(1); dt.setMonth(dt.getMonth() - 5 + i); return A.isoDate(dt).slice(0, 7); });
    const mrow = months.map((m) => { const ex = S().expenses.filter((e) => (e.date || '').startsWith(m) && admin.counted(e)); return { m, c: ex.filter((e) => scopeOf(e) !== 'founder').reduce((a, e) => a + e.amount, 0), f: ex.filter((e) => scopeOf(e) === 'founder' && (!sel || e.founderId === sel.id)).reduce((a, e) => a + e.amount, 0) }; });
    const mx = Math.max(1, ...mrow.map((x) => x.c + x.f));
    const fx = S().expenses.filter((e) => inR(e.date, r) && scopeOf(e) === 'founder' && (!sel || e.founderId === sel.id)).sort((a, b) => (a.date < b.date ? 1 : -1));
    const cap = (S().capital || []).filter((c) => !sel || c.founderId === sel.id).sort((a, b) => (a.date < b.date ? 1 : -1));
    const notes = (S().notes || []).filter((n) => (!noteF ? !n.done : noteF === 'done' ? n.done : n.tag === noteF && !n.done) && (!sel || !(n.with || []).length || (n.with || []).includes(sel.id))
      && (!noteQ || `${n.title} ${n.text} ${n.outcome} ${n.nextStep}`.toLowerCase().includes(noteQ.toLowerCase())))
      .sort((a, b) => (b.pinned - a.pinned) || `${b.date || ''}${b.time || ''}`.localeCompare(`${a.date || ''}${a.time || ''}`) || (b.at - a.at));
    const ad = admin.adReport(r);
    const pay = {}; S().sales.filter((x) => inR(x.date, r)).forEach((x) => { const k = x.payMethod || 'Not set'; pay[k] = (pay[k] || 0) + x.amount; });
    S().appointments.filter((a) => inR(a.date, r) && a.paid && a.status !== 'cancelled').forEach((a) => { const k = a.payMethod || 'Not set'; pay[k] = (pay[k] || 0) + (Number(a.fee) || 0); });
    const payRows = Object.entries(pay).sort((a, b) => b[1] - a[1]); const payMax = Math.max(1, ...payRows.map((x) => x[1]));
    const prod = {}; S().sales.filter((x) => inR(x.date, r)).forEach((x) => { prod[x.product] = prod[x.product] || { n: 0, amt: 0 }; prod[x.product].n += x.qty || 1; prod[x.product].amt += x.amount; });
    const topProd = Object.entries(prod).sort((a, b) => b[1].amt - a[1].amt).slice(0, 5);
    const team = admin.teamReport(r).filter((x) => x.totalSales).slice(0, 3);
    const renewVal = admin.renewals().filter((x) => x.stage && !x.done).reduce((a, x) => { const it = S().sales.filter((y) => y.patientId === x.patientId).slice(-1)[0]; return a + (it ? it.amount : 0); }, 0);
    const tp = admin.targetProgress(month);
    const fCard = (f) => `<button type="button" class="f-card ${fdSel === f.id ? 'on' : ''} ${f.disabled ? 'off' : ''}" data-fdsel="${f.id}"><span class="fh-av sm" ${f.color ? `style="background:${esc(f.color)}"` : ''}>${esc(initialsOf(f.name))}</span><span class="f-main"><b>${esc(f.name)}${f.disabled ? ' <span class="badge">Disabled</span>' : ''}</b><small>${esc(f.title || 'Founder')} · ${f.share}% share${f.city ? ` · ${esc(f.city)}` : ''}</small>
      <span class="f-nums"><i>Spent <b>${inr(f.spent)}</b></i><i>Capital <b>${inr(f.net)}</b></i></span>${f.budget ? `<span class="meter lux ${f.limitPct > 100 ? 'bad' : f.limitPct > 80 ? 'warn' : ''}"><i style="width:${Math.min(100, f.limitPct)}%"></i></span><small>${inr(f.monthSpent)} of ${inr(f.budget)} this month</small>` : '<small>No monthly limit</small>'}</span></button>`;
    const heroName = sel ? sel.name : fs.length === 1 ? fs[0].name : fs.length ? 'All founders' : 'Founder Hub';
    return `<div class="toolbar">${periodBar()}<span class="grow"></span>${exportBtns('founder')}</div>
      <section class="hero founder-hero">
        <div class="fh-top"><div class="fh-av">${fs.length > 1 && !sel ? `${fs.length}` : esc(initialsOf(sel ? sel.name : (fs[0] || {}).name))}</div><div class="fh-id"><small>${sel ? esc(sel.title || 'Founder') : 'Founder Hub'}</small><b>${esc(heroName)}</b><span>${sel ? esc([sel.mobile, sel.email].filter(Boolean).join(' · ') || set().clinic) : `${esc(set().clinic)} · ${esc(periodLabel())}`}</span></div>
          ${readOnly() ? '' : `<span class="fh-btns"><button type="button" class="btn sm glass" data-act="${sel ? 'founder-edit' : 'founder-add'}" ${sel ? `data-id="${sel.id}"` : ''}>${sel ? 'Edit profile' : '+ Founder'}</button>${sel ? `<button type="button" class="btn sm glass" data-act="founder-toggle" data-id="${sel.id}">${sel.disabled ? 'Enable' : 'Disable'}</button>` : ''}</span>`}</div>
        ${sel && (sel.joined || sel.role || sel.about) ? `<p class="fh-about">${esc([sel.role, sel.joined ? `Since ${fdate(sel.joined)}` : '', sel.about].filter(Boolean).join(' · '))}</p>` : ''}${sel && sel.disabled ? '<p class="fh-about"><b>Disabled:</b> kept for records, left out of new expenses, alerts and profit share.</p>' : ''}
        <div class="hero-row">
          <div class="hk"><small>Revenue</small><b>${inr(fin.revenue)}</b><small>${esc(periodLabel())}</small></div>
          <div class="hk"><small>Net profit</small><b>${inr(fin.profit)}</b><small>${sel ? `${sel.name.split(' ')[0]}'s ${sel.share}%: ${inr(sel.profitShare)}` : 'after all counted expenses'}</small></div>
          <div class="hk"><small>${sel ? `${esc(sel.name.split(' ')[0])}'s spending` : 'Founder expenses'}</small><b>${inr(sel ? sel.spent : sm.founderAll)}</b><small>${sel && sel.budget ? `${sel.limitPct}% of monthly limit` : `${plural(fx.length, 'entry', 'entries')}`}</small></div>
          <div class="hk"><small>Common expenses</small><b>${inr(sm.common)}</b><small>clinic running costs</small></div>
        </div>
      </section>
      <section class="card"><h2><span class="ic gold">${svg('<path d="M3 7l4 4 5-7 5 7 4-4-2 12H5z"/>')}</span>Founders<span class="sp"></span>${readOnly() ? '' : '<button class="btn sm primary" data-act="founder-add">+ Add founder</button>'}</h2>
        ${fs.length ? `<div class="f-cards"><button type="button" class="f-card all ${!fdSel ? 'on' : ''}" data-fdsel=""><span class="fh-av sm">${fs.length}</span><span class="f-main"><b>All founders</b><small>${fs.map((f) => `${esc(f.name.split(' ')[0])} ${f.share}%`).join(' · ')}</small><span class="f-nums"><i>Spent <b>${inr(fs.reduce((a, f) => a + f.spent, 0))}</b></i><i>Capital <b>${inr(fs.reduce((a, f) => a + f.net, 0))}</b></i></span></span></button>${fs.map(fCard).join('')}${offF.map(fCard).join('')}</div>`
          : '<p class="hint" style="margin:0">Add each founder or partner with their profit share and a monthly spending limit. Founder expenses, capital and discussions are then kept per person.</p>'}</section>
      <section class="card"><h2><span class="ic ${al.some((x) => x.level === 'bad') ? 'bad' : 'gold'}">${svg('<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>')}</span>Alerts<span class="sp"></span><span class="badge ${al.length ? 'warn' : 'ok'}">${al.length}</span></h2>${alertRows(al.slice(0, 12))}</section>
      <section class="card discuss-card"><h2><span class="ic violet">${svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>')}</span>Discussions<span class="sp"></span><button class="btn sm" data-act="export" data-what="discussions" data-fmt="pdf">${svg('<path d="M6 3h9l4 4v14H6zM14 3v5h5"/>')}PDF</button>${readOnly() ? '' : '<button class="btn sm primary" data-act="note-add">+ Discussion</button>'}</h2>
        ${readOnly() ? '' : `<div class="quick-note"><textarea id="qn-text" rows="2" placeholder="Write a quick discussion point… (saved with today's date and time)"></textarea><div class="qn-row"><select id="qn-mode" aria-label="Mode">${Object.keys(NOTE_MODES).map((m) => opt(m, `${NOTE_MODES[m]} ${m}`, 'In person')).join('')}</select><select id="qn-tag" aria-label="Type">${Object.entries(NOTE_TAGS).map(([k, l]) => opt(k, l, 'discussion')).join('')}</select><button type="button" class="btn primary sm" data-act="note-quick">Save</button></div></div>`}
        <div class="row-tools"><div class="seg sm scroll-x">${[['', 'Open'], ...Object.entries(NOTE_TAGS), ['done', 'Done']].map(([k, l]) => `<button type="button" data-notef="${k}" class="${noteF === k ? 'on' : ''}">${l}</button>`).join('')}</div><input type="search" data-noteq placeholder="Search discussions" value="${esc(noteQ)}"></div>
        ${notes.length ? `<ol class="d-timeline">${capList(notes, 'notes').map((n) => `<li class="note ${n.tag} ${n.pinned ? 'pin' : ''} ${n.done ? 'done' : ''}"><span class="d-dot">${NOTE_MODES[n.mode] || '💬'}</span><div class="d-body">
          <div class="note-top"><b class="d-when">${fdate(n.date || A.isoDate(new Date(n.at)))}${n.time ? ` · ${time12(n.time)}` : ''}</b><span class="badge ${n.tag === 'important' ? 'bad' : n.tag === 'decision' ? 'ok' : n.tag === 'idea' ? 'violet' : n.tag === 'meeting' ? 'gold' : 'info'}">${NOTE_TAGS[n.tag] || 'Note'}</span>${n.mode ? `<span class="badge">${esc(n.mode)}</span>` : ''}${n.pinned ? '<span class="pin-ic">📌</span>' : ''}</div>
          ${n.title ? `<b class="d-title">${esc(n.title)}</b>` : ''}${n.text ? `<p>${esc(n.text).replace(/\n/g, '<br>')}</p>` : ''}
          ${n.outcome ? `<div class="d-out"><small>Outcome / decision</small>${esc(n.outcome)}</div>` : ''}${n.nextStep ? `<div class="d-out next"><small>Next step${n.due ? ` · by ${fdate(n.due)}` : ''}</small>${esc(n.nextStep)}</div>` : ''}
          <small class="d-meta">${(n.with || []).length ? `With ${esc((n.with || []).map((x) => fName(x) || x).join(', '))} · ` : ''}${n.place ? `${esc(n.place)} · ` : ''}${n.mins ? `${n.mins} min · ` : ''}Saved ${esc(ftime(n.updated || n.at))}${n.by ? ` by ${esc(n.by)}` : ''}</small>
          ${readOnly() ? '' : `<div class="acts"><button class="btn xs" data-act="note-pin" data-id="${n.id}">${n.pinned ? 'Unpin' : 'Pin'}</button><button class="btn xs" data-act="note-done" data-id="${n.id}">${n.done ? 'Reopen' : 'Done'}</button><button class="btn xs" data-act="note-edit" data-id="${n.id}">Edit</button>${canDelete() ? `<button class="btn xs danger" data-act="note-del" data-id="${n.id}">✕</button>` : ''}</div>`}</div></li>`).join('')}</ol>${moreBtn('notes', notes.length)}`
          : '<p class="hint" style="margin:0">Every discussion is saved with its date, time and mode (in person, call, WhatsApp, video…). Add who was there, the outcome and the next step, then export them all as a PDF.</p>'}</section>
      <section class="card"><h2><span class="ic teal">${svg('<path d="M4 19h16M7 16V9M12 16V5M17 16v-4"/>')}</span>This month vs last month</h2>
        <div class="kpis">${kpi('Revenue', inr(mFin.revenue), `${fdate(prevM)}: ${inr(pFin.revenue)}`, 'teal').replace('</b>', `</b>${trend(mFin.revenue, pFin.revenue)}`)}${kpi('Expenses', inr(mFin.expenses), `${fdate(prevM)}: ${inr(pFin.expenses)}`, 'gold').replace('</b>', `</b>${trend(mFin.expenses, pFin.expenses, false)}`)}${kpi('Profit', inr(mFin.profit), `${fdate(prevM)}: ${inr(pFin.profit)}`, mFin.profit >= 0 ? 'good' : 'bad').replace('</b>', `</b>${trend(mFin.profit, pFin.profit)}`)}${kpi('Target', tp.revenueGoal ? `${tp.revenuePct}%` : '–', tp.revenueGoal ? `of ${inr(tp.revenueGoal)}` : 'Set in Team Desk', 'violet')}</div></section>
      <div class="cards">
        <section class="card"><h2><span class="ic violet">${svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>')}</span>${sel ? `${esc(sel.name.split(' ')[0])}'s expenses` : 'Founder expenses'}<span class="sp"></span>${readOnly() ? '' : '<button class="btn sm primary" data-act="add-expense-founder">+ Add</button>'}</h2>
          ${fx.length ? `<div class="lux-list">${fx.slice(0, 8).map((e) => `<div class="lux-row"><span><b>${esc(e.name || e.category)}</b><small>${fdate(e.date)}${!sel && fName(e.founderId) ? ` · ${esc(fName(e.founderId))}` : ''}${e.note ? ` · ${esc(e.note)}` : ''}</small></span><b>${inr(e.amount)}</b></div>`).join('')}</div>${fx.length > 8 ? `<button class="link" data-act="exp-founder-all">See all ${fx.length}</button>` : ''}` : '<p class="hint" style="margin:0">No founder expenses in this period.</p>'}</section>
        <section class="card"><h2><span class="ic gold">${svg('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 15h2"/>')}</span>Capital in / out<span class="sp"></span>${readOnly() || !fs.length ? '' : '<button class="btn sm primary" data-act="capital-add">+ Entry</button>'}</h2>
          <div class="kpis">${kpi('Invested', inr(cap.filter((c) => c.type === 'invest').reduce((a, c) => a + c.amount, 0)), '', 'good')}${kpi('Withdrawn', inr(cap.filter((c) => c.type === 'withdraw').reduce((a, c) => a + c.amount, 0)), '', 'gold')}</div>
          ${cap.length ? `<div class="lux-list" style="margin-top:10px">${cap.slice(0, 6).map((c) => `<div class="lux-row"><span><b>${c.type === 'invest' ? 'Invested' : 'Withdrawn'}${!sel ? ` · ${esc(fName(c.founderId))}` : ''}</b><small>${fdate(c.date)}${c.note ? ` · ${esc(c.note)}` : ''}</small></span><b class="${c.type === 'invest' ? 'good-t' : ''}">${c.type === 'invest' ? '+' : '−'}${inr(c.amount)}</b>${canDelete() ? `<button class="btn xs ghost" data-act="capital-del" data-id="${c.id}" aria-label="Delete">✕</button>` : ''}</div>`).join('')}</div>` : '<p class="hint" style="margin:10px 0 0">Record money each founder puts in or takes out.</p>'}</section>
      </div>
      <div class="cards">
        <section class="card"><h2><span class="ic teal">${svg('<path d="M4 19h16M7 16V9M12 16V5M17 16v-4"/>')}</span>Common vs founder · 6 months</h2>
          <div class="split-bars">${mrow.map((x) => `<div class="sb"><div class="sb-col"><i class="c" style="height:${(x.c / mx) * 100}%"></i><i class="f" style="height:${(x.f / mx) * 100}%"></i></div><small>${fdate(x.m).split(' ')[0]}</small></div>`).join('')}</div>
          <div class="legend"><span><i class="c"></i>Common</span><span><i class="f"></i>Founder</span></div></section>
        <section class="card"><h2><span class="ic good">${svg('<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>')}</span>Money received by mode</h2>
          ${payRows.length ? `<div class="src-list">${payRows.map(([k, v]) => `<div class="src-row"><b>${esc(k)}</b><div class="src-bar"><i style="width:${(v / payMax) * 100}%"></i></div><span><b>${inr(v)}</b></span></div>`).join('')}</div>` : '<p class="hint" style="margin:0">Sales and OPD fees by payment mode show here.</p>'}</section>
      </div>
      <div class="cards">
        <section class="card"><h2><span class="ic violet">${svg('<path d="M4 8l8-4 8 4-8 4zM4 8v8l8 4 8-4V8"/>')}</span>Top products</h2>
          ${topProd.length ? `<div class="lux-list">${topProd.map(([k, v], i) => `<div class="lux-row"><span><b><i class="rank">${i + 1}</i>${esc(k)}</b><small>${num(v.n)} sold</small></span><b>${inr(v.amt)}</b></div>`).join('')}</div>` : '<p class="hint" style="margin:0">No sales in this period.</p>'}</section>
        <section class="card"><h2><span class="ic gold">${svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/>')}</span>Top team</h2>
          ${team.length ? `<div class="lux-list">${team.map((x, i) => `<div class="lux-row"><span><b><i class="rank r${i + 1}">${i + 1}</i>${esc(x.name)}</b><small>${plural(x.orders, 'sale')} · incentive ${inr(x.incentive)}</small></span><b>${inr(x.totalSales)}</b></div>`).join('')}</div>` : '<p class="hint" style="margin:0">Team sales show here.</p>'}</section>
      </div>
      <section class="card"><h2><span class="ic">${svg('<path d="M12 2l3 7h7l-5.5 4.5 2 7.5-6.5-4.5L5.5 21l2-7.5L2 9h7z"/>')}</span>Important numbers</h2><div class="kpis">
        ${kpi('Total patients', num(d.patients.total), `${num(d.patients.active)} active`, 'teal')}${kpi('New / renewal', `${d.patients.new} / ${d.patients.renewal}`, periodLabel())}
        ${kpi('Leads', num(d.leads.total), `${d.leads.conversion}% converted`, 'gold')}${kpi('Ad spend', inr(ad.spend), ad.cpl ? `${inr(ad.cpl)} per lead` : 'no ad spend', 'violet')}
        ${kpi('OPD appointments', num(d.appointments.total - d.appointments.cancelled), `${inr(d.sales.consultation)} fees`, 'teal')}${kpi('Renewals due', num(d.renewalsDue), renewVal ? `≈ ${inr(renewVal)} to collect` : '', 'gold')}
        ${kpi('Team incentives', inr(d.team.incentives), d.team.top ? `Top: ${d.team.top.name}` : '', 'violet')}${kpi('Low stock', num(d.stock.low.length), `${d.stock.order.length} order required`, d.stock.order.length ? 'bad' : '')}
      </div></section>`;
  };
  function founderForm(f) {
    openForm({
      title: f ? `Edit ${f.name}` : 'Add founder',
      fields: [
        { name: 'name', label: 'Founder name', value: f ? f.name : '', required: true },
        { name: 'title', label: 'Title', value: f ? f.title : 'Founder', placeholder: 'Co-founder & CEO' },
        { name: 'mobile', label: 'Mobile', type: 'tel', value: f ? f.mobile : '' },
        { name: 'email', label: 'Email', type: 'email', value: f ? f.email : '' },
        { name: 'share', label: 'Profit share (%)', type: 'number', value: f ? f.share : (admin.founders().length ? '' : 100) },
        { name: 'budget', label: 'Monthly spending limit (₹, 0 = none)', type: 'number', value: f ? f.budget || '' : '' },
        { name: 'role', label: 'Looks after', value: f ? f.role || '' : '', placeholder: 'Operations, marketing, medical…' },
        { name: 'joined', label: 'Founder since', type: 'date', value: f ? f.joined || '' : '' },
        { name: 'city', label: 'City', value: f ? f.city || '' : '' },
        { name: 'pan', label: 'PAN (optional)', value: f ? f.pan || '' : '' },
        { name: 'bank', label: 'Bank / UPI for payouts (optional)', value: f ? f.bank || '' : '' },
        { name: 'color', label: 'Profile colour', type: 'select', value: f ? f.color || '' : '', options: [['', 'Gold (default)'], ['#015b53', 'Teal'], ['#1f2a2b', 'Charcoal'], ['#6c5bd4', 'Violet'], ['#b8892a', 'Bronze'], ['#c2185b', 'Rose'], ['#1565c0', 'Sapphire']] },
        { name: 'active', label: 'Active (untick to disable this founder)', type: 'checkbox', value: f ? !f.disabled : true },
        { name: 'about', label: 'About / notes', type: 'textarea', value: f ? f.about : '', span: true },
      ],
      html: f && canDelete() ? `<p style="margin:0"><button type="button" class="btn sm danger" data-act="founder-del" data-id="${f.id}">Remove founder</button></p>` : '',
      onSubmit: (v) => { const { active, ...rest } = v; const x = admin.saveFounder({ ...(f ? { id: f.id } : {}), ...rest, disabled: !active }); const tot = admin.founders().reduce((a, y) => a + (Number(y.share) || 0), 0); return tot > 100 ? `Saved ${x.name}. Profit shares add up to ${tot}%` : `Saved ${x.name}`; },
    });
  }
  function capitalForm() {
    const fs = admin.founders();
    openForm({
      title: 'Founder capital',
      fields: [
        { name: 'founderId', label: 'Founder', type: 'select', value: fdSel || (fs[0] || {}).id, options: fs.map((f) => [f.id, f.name]) },
        { name: 'type', label: 'Type', type: 'select', value: 'invest', options: [['invest', 'Invested (money in)'], ['withdraw', 'Withdrawn / drawing (money out)']] },
        { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
        { name: 'date', label: 'Date', type: 'date', value: admin.today() },
        { name: 'note', label: 'Note', span: true },
      ],
      onSubmit: (v) => { admin.saveCapital(v); return 'Capital entry saved'; },
    });
  }
  function noteForm(n) {
    const fs = admin.founders(); const now = new Date();
    const v = n || { tag: 'discussion', mode: 'In person', date: admin.today(), time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, with: fdSel ? [fdSel] : fs.map((f) => f.id) };
    openForm({
      title: n ? 'Edit discussion' : 'New discussion',
      html: fs.length ? `<div class="f span">With<div class="tag-pick">${fs.map((f) => `<label class="tag-opt"><input type="checkbox" data-nwith value="${f.id}" ${(v.with || []).includes(f.id) ? 'checked' : ''}><span>${esc(f.name)}</span></label>`).join('')}</div></div>` : '',
      fields: [
        { name: 'date', label: 'Date', type: 'date', value: v.date || admin.today() },
        { name: 'time', label: 'Time', type: 'time', value: v.time || '' },
        { name: 'mode', label: 'Mode', type: 'select', value: v.mode || 'In person', options: Object.keys(NOTE_MODES).map((m) => [m, `${NOTE_MODES[m]} ${m}`]) },
        { name: 'tag', label: 'Type', type: 'select', value: v.tag || 'discussion', options: Object.entries(NOTE_TAGS) },
        { name: 'title', label: 'Topic', value: v.title || '', span: true, placeholder: 'Second clinic in Andheri?' },
        { name: 'text', label: 'What was discussed', type: 'textarea', value: v.text || '', span: true },
        { name: 'outcome', label: 'Outcome / decision', type: 'textarea', value: v.outcome || '', span: true },
        { name: 'nextStep', label: 'Next step', value: v.nextStep || '', span: true },
        { name: 'due', label: 'Next step by (alert)', type: 'date', value: v.due || '' },
        { name: 'mins', label: 'Duration (minutes)', type: 'number', value: v.mins || '' },
        { name: 'place', label: 'Place / others present', value: v.place || '', span: true },
        { name: 'pinned', label: 'Pin to top', type: 'checkbox', value: !!v.pinned, span: true },
      ],
      onSubmit: (x) => { admin.saveNote({ ...(n ? { id: n.id } : {}), ...x, with: $$('[data-nwith]:checked').map((c) => c.value) }); return 'Discussion saved'; },
    });
  }

  // ── Marketing Hub: lead sources, campaigns (spend → leads → patients), ideas bank, hashtags, posting plan ──
  const TREND_IDEAS = [
    ['Reel', '30-day GLP-1 journey: week by week', 'Show real progress, energy and appetite changes'],
    ['Reel', 'What I eat in a day: high-protein Indian thali', 'Protein first, then fibre'],
    ['Short', 'Myth vs fact: Mounjaro and muscle loss', 'Myth: you lose only muscle…'],
    ['Carousel', '5 side effects and how we manage them', 'Nausea? Do this first'],
    ['Reel', 'Patient story: before → after (with consent)', 'She lost 9 kg in 3 months without crash dieting'],
    ['Live', 'Doctor Q&A: is GLP-1 right for me?', 'Ask anything this Sunday 7 pm'],
    ['Short', 'Protein hacks under ₹50', 'Three swaps that add 20 g protein'],
    ['Reel', 'Grocery haul for weight loss', 'What goes in my cart and why'],
    ['Story', 'Poll: your biggest weight-loss struggle?', 'Cravings / time / motivation'],
    ['Reel', 'Day in the clinic: first consultation', 'What happens in your first 15 minutes'],
    ['Carousel', 'GLP-1 Success Support packages explained', '1 week to 3 months, what you get'],
    ['Short', 'Trending audio: “Expectation vs reality” weight-loss edit', 'Use the week\'s trending sound'],
  ];
  const HASHTAGS = [
    ['Weight loss', '#weightloss #weightlossjourney #fatloss #healthyindia #theprimefit'],
    ['GLP-1', '#glp1 #mounjaro #wegovy #ozempic #medicalweightloss #glp1journey'],
    ['Diet & protein', '#highprotein #indiandiet #proteinrich #healthyeating #dietplan'],
    ['Local', '#mumbaifitness #indiafitness #weightlossindia #doctorapproved'],
  ];
  const IDEA_STATUS = { idea: 'Idea', planned: 'Planned', shot: 'Shot', posted: 'Posted' };
  SUBS.marketing = () => `Leads, campaigns and content · ${periodLabel()}`;
  SCREENS.marketing = () => {
    const r = range();
    const src = admin.leadSources(r);
    const ls = admin.leadStats(r);
    const adSpend = admin.expenseSummary(r).byCategory.filter((x) => /^(ads|marketing)$/i.test(x.name)).reduce((a, x) => a + x.amount, 0);
    const camps = (S().campaigns || []).map((c) => ({ c, x: admin.campaignStats(c) }));
    const campSpend = camps.filter(({ c }) => !r || (c.start <= (r.to || '9999') && (c.end || '9999') >= (r.from || ''))).reduce((a, { c }) => a + c.spent, 0);
    const spend = Math.max(adSpend, campSpend);
    const ig = ((S().social || {}).instagram) || {}; const yt = ((S().social || {}).youtube) || {};
    const cst = admin.contentStats(r);
    const maxL = Math.max(1, ...src.map((x) => x.leads));
    const ideas = (S().ideas || []).slice().sort((a, b) => (a.status === 'posted') - (b.status === 'posted') || b.created - a.created);
    const week = Array.from({ length: 7 }, (_, i) => shiftDay(admin.today(), i));
    const sched = S().content.filter((c) => c.status === 'scheduled' && c.scheduledDate >= week[0] && c.scheduledDate <= week[6]);
    return `<div class="toolbar">${periodBar()}<span class="grow"></span>${exportBtns('marketing')}</div>
      <section class="hero mk-hero"><div><small>Marketing · ${esc(periodLabel())}</small></div>
        <div class="hero-row">
          <div class="hk"><small>Leads</small><b>${num(ls.total)}</b><small>${ls.conversion}% converted</small></div>
          <div class="hk"><small>Ad spend</small><b>${inr(spend)}</b><small>${ls.total ? `${inr(Math.round(spend / ls.total))} per lead` : 'no leads yet'}</small></div>
          <div class="hk"><small>Videos posted</small><b>${num(cst.posted)}</b><small>${cst.remaining} waiting</small></div>
          <div class="hk"><small>Followers</small><b>${ig.followers != null ? num(ig.followers) : '–'}</b><small>${yt.subscribers != null ? `${num(yt.subscribers)} YouTube` : 'Instagram'}</small></div>
        </div></section>
      ${adsCard(r)}
      <section class="card"><h2><span class="ic gold">${svg(ICON_LEADS)}</span>Lead sources</h2>
        ${src.length ? `<div class="src-list">${src.map((x) => `<div class="src-row"><b>${esc(x.source)}</b><div class="src-bar"><i style="width:${(x.leads / maxL) * 100}%"></i></div><span>${plural(x.leads, 'lead')} · ${num(x.won)} won · <b>${x.conversion}%</b></span></div>`).join('')}</div>` : '<p class="hint" style="margin:0">Lead sources show here once leads come in. Pick the source on each lead.</p>'}</section>
      <section class="card"><h2><span class="ic violet">${svg('<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/>')}</span>Campaigns<span class="sp"></span><button class="btn sm primary" data-act="camp-add">+ Campaign</button></h2>
        ${camps.length ? `<div class="camp-list">${camps.map(({ c, x }) => `<div class="camp"><div class="camp-top"><b>${esc(c.name)}</b><span class="badge info">${esc(c.platform || 'Any')}</span><span class="sp"></span><span class="acts"><button class="btn xs" data-act="camp-edit" data-id="${c.id}">Edit</button>${canDelete() ? `<button class="btn xs danger" data-act="camp-del" data-id="${c.id}">Delete</button>` : ''}</span></div>
          <small class="hint">${fdate(c.start)} → ${c.end ? fdate(c.end) : 'running'}${c.goal ? ` · ${esc(c.goal)}` : ''}</small>
          <div class="camp-kpis"><span><b>${inr(c.spent)}</b>spent of ${inr(c.budget)}</span><span><b>${num(x.leads)}</b>leads</span><span><b>${x.leads ? inr(x.cpl) : '–'}</b>per lead</span><span><b>${num(x.won)}</b>converted</span><span><b>${inr(x.revenue)}</b>revenue</span><span class="${x.roi >= 0 ? 'good' : 'bad'}"><b>${c.spent ? `${x.roi}%` : '–'}</b>ROI</span></div>
          ${c.budget ? `<div class="meter"><i style="width:${Math.min(100, (c.spent / c.budget) * 100)}%"></i></div>` : ''}</div>`).join('')}</div>`
          : '<p class="hint" style="margin:0">Add an ad campaign with its platform, dates and spend. Leads from that source in those dates are counted, with cost per lead and ROI.</p>'}</section>
      <section class="card"><h2><span class="ic teal">${svg('<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>')}</span>Content ideas<span class="sp"></span><button class="btn sm" data-act="idea-trends">Trending ideas</button><button class="btn sm primary" data-act="idea-add">+ Idea</button></h2>
        ${ideas.length ? `<div class="idea-list">${ideas.map((i) => `<div class="idea ${i.status}"><span class="badge ${i.status === 'posted' ? 'ok' : i.status === 'shot' ? 'teal' : i.status === 'planned' ? 'violet' : ''}">${esc(i.format || 'Reel')}</span><div><b>${esc(i.title)}</b>${i.hook ? `<small>Hook: ${esc(i.hook)}</small>` : ''}</div>
          <span class="acts"><select data-idea-status="${i.id}" aria-label="Status">${Object.entries(IDEA_STATUS).map(([k, l]) => opt(k, l, i.status)).join('')}</select><button class="btn xs" data-act="idea-content" data-id="${i.id}" title="Send to the editor list">To editor</button><button class="btn xs" data-act="idea-edit" data-id="${i.id}">Edit</button>${canDelete() ? `<button class="btn xs danger" data-act="idea-del" data-id="${i.id}">✕</button>` : ''}</span></div>`).join('')}</div>`
          : '<p class="hint" style="margin:0">Keep reel, short and post ideas here. Tap <b>Trending ideas</b> for ready ideas for a GLP-1 and weight-loss clinic.</p>'}</section>
      <div class="cards">
        <section class="card"><h2><span class="ic">${svg(ICON_CAL)}</span>Posting plan · next 7 days</h2>
          <div class="week-plan">${week.map((d) => { const list = sched.filter((c) => c.scheduledDate === d); const dt = new Date(`${d}T00:00:00`); return `<div class="wp-day ${list.length ? 'has' : ''}"><small>${DAYS[dt.getDay()]}</small><b>${dt.getDate()}</b>${list.map((c) => `<i title="${esc(c.title)}">${esc(c.platform || 'Post')}</i>`).join('')}</div>`; }).join('')}</div>
          <p class="hint" style="margin:10px 0 0">Good times for Indian audiences: 7–9 am, 1–2 pm and 7–10 pm. Post reels 4–5 times a week and stories daily.</p></section>
        <section class="card"><h2><span class="ic violet">#</span>Hashtag sets</h2>
          <div class="tag-list">${HASHTAGS.map(([n, t], i) => `<div class="tag-set"><b>${esc(n)}</b><small>${esc(t)}</small><button type="button" class="btn xs" data-copy-tags="${i}">Copy</button></div>`).join('')}</div></section>
      </div>
      ${socialCard()}`;
  };
  function adsCard(r) {
    const a = admin.adReport(r);
    return `<section class="card ads-card"><h2><span class="ic violet">${svg('<path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 6-6"/>')}</span>Ads report<span class="sp"></span>${readOnly() ? '' : '<button class="btn sm primary" data-act="ad-spend">+ Ad spend</button>'}</h2>
      <div class="kpis">${kpi('Ad spend', inr(a.spend), periodLabel(), 'violet')}${kpi('Leads from ads', num(a.paidLeads), `${num(a.leads)} leads in all`, 'gold')}${kpi('Cost per lead', a.cpl ? inr(a.cpl) : '–', '', 'teal')}${kpi('Converted', num(a.won), a.revenue ? `${inr(a.revenue)} revenue` : '', 'good')}</div>
      ${a.rows.length ? table(['Platform', '>Spend', '>Leads', '>Cost / lead', '>Converted', '>Revenue', '>ROI'], a.rows.map((x) => `<tr><td><b>${esc(x.platform)}</b>${x.organic ? ' <span class="badge ok">Organic</span>' : ''}${x.hasManual ? ' <span class="badge info">Manual leads</span>' : ''}</td><td class="r">${x.spend ? inr(x.spend) : '–'}</td><td class="r">${num(x.leads || x.manualLeads)}${x.hasManual && x.leads ? `<span class="sub">${num(x.manualLeads)} entered</span>` : ''}</td><td class="r">${x.cpl ? inr(x.cpl) : '–'}</td><td class="r">${num(x.won)}</td><td class="r">${x.revenue ? inr(x.revenue) : '–'}</td><td class="r ${x.roi >= 0 ? 'good-t' : 'bad-t'}">${x.spend ? `${x.roi}%` : '–'}</td></tr>`))
        : '<p class="hint" style="margin:12px 0 0">Add ad spend (Expenses → category Ads, name = platform) and pick the lead source on each lead. Spend, leads, cost per lead and ROI then fill in here. You can also type the leads count by hand.</p>'}</section>`;
  }
  function adSpendForm() {
    openForm({
      title: 'Add ad spend',
      fields: [
        { name: 'name', label: 'Platform', type: 'select', value: 'Instagram', options: set().lists.leadSources.map((x) => [x, x]) },
        { name: 'amount', label: 'Amount spent (₹)', type: 'number', required: true },
        { name: 'date', label: 'Date', type: 'date', value: admin.today() },
        { name: 'adLeads', label: 'Leads received (optional)', type: 'number', hint: 'Blank = counted from the Leads list by source' },
        { name: 'note', label: 'Campaign / note', span: true },
      ],
      onSubmit: (v) => { admin.saveExpense({ ...v, category: 'Ads', scope: 'common' }); return 'Ad spend saved'; },
    });
  }
  function campaignForm(c) {
    openForm({
      title: c ? `Edit ${c.name}` : 'New campaign',
      fields: [
        { name: 'name', label: 'Campaign name', required: true, value: c ? c.name : '', placeholder: 'GLP-1 October offer', span: true },
        { name: 'platform', label: 'Lead source / platform', type: 'select', value: c ? c.platform : 'Instagram', options: set().lists.leadSources.map((x) => [x, x]) },
        { name: 'goal', label: 'Goal', value: c ? c.goal : '', placeholder: 'Leads, bookings, followers…' },
        { name: 'start', label: 'Start date', type: 'date', value: c ? c.start : admin.today() },
        { name: 'end', label: 'End date (blank = running)', type: 'date', value: c ? c.end : '' },
        { name: 'budget', label: 'Budget (₹)', type: 'number', value: c ? c.budget : '' },
        { name: 'spent', label: 'Spent so far (₹)', type: 'number', value: c ? c.spent : '' },
        { name: 'notes', label: 'Notes', value: c ? c.notes : '', span: true },
      ],
      onSubmit: (v) => { admin.saveCampaign({ ...(c ? { id: c.id } : {}), ...v }); return 'Campaign saved'; },
    });
  }
  function ideaForm(i) {
    openForm({
      title: i ? 'Edit idea' : 'New content idea',
      fields: [
        { name: 'title', label: 'Idea', required: true, value: i ? i.title : '', span: true, placeholder: 'What I eat in a day on GLP-1' },
        { name: 'format', label: 'Format', type: 'select', value: i ? i.format : 'Reel', options: ['Reel', 'Short', 'Post', 'Carousel', 'Story', 'Live', 'YouTube video'].map((x) => [x, x]) },
        { name: 'status', label: 'Status', type: 'select', value: i ? i.status : 'idea', options: Object.entries(IDEA_STATUS) },
        { name: 'hook', label: 'Hook / first line', value: i ? i.hook : '', span: true },
        { name: 'tags', label: 'Hashtags', value: i ? i.tags : '', span: true },
      ],
      onSubmit: (v) => { admin.saveIdea({ ...(i ? { id: i.id } : {}), ...v }); return 'Idea saved'; },
    });
  }
  function trendForm() {
    openForm({
      title: 'Trending ideas', submitLabel: 'Add selected',
      html: `<p class="hint" style="margin-top:0">Ideas that work for GLP-1 and weight-loss clinics. Tick the ones to add to your ideas bank.</p><div class="cust-list">${TREND_IDEAS.map(([f, t, h], k) => `<label class="check trend"><input type="checkbox" data-trend="${k}"> <span><b>${esc(t)}</b><small>${esc(f)} · ${esc(h)}</small></span></label>`).join('')}</div>`,
      onSubmit: () => { const pick = TREND_IDEAS.filter((_, k) => $(`[data-trend="${k}"]`).checked); pick.forEach(([format, title, hook]) => admin.saveIdea({ title, format, hook })); return pick.length ? `${plural(pick.length, 'idea')} added` : 'Nothing selected'; },
    });
  }

  // ── Team Desk: tasks, attendance and monthly targets ──
  let deskDay = '';
  let taskF = 'open';
  const MARKS = [['P', 'Present'], ['H', 'Half'], ['A', 'Absent'], ['L', 'Leave'], ['O', 'Off']];
  SUBS.manage = () => `Tasks, attendance and targets · ${me.name}`;
  SCREENS.manage = () => {
    const d = deskDay || admin.today();
    const month = d.slice(0, 7);
    const tasks = (S().tasks || []).filter((t) => (taskF === 'mine' ? t.assignedTo === me.id && !t.done : taskF === 'done' ? t.done : !t.done)).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
    const att = (S().attendance || {})[d] || {};
    const tp = admin.targetProgress(month);
    const bar = (pct, cls) => `<div class="meter ${cls || ''}"><i style="width:${Math.min(100, pct)}%"></i></div>`;
    const accName = (id) => (S().accounts.find((a) => a.id === id) || {}).name || 'Anyone';
    const team = S().team.filter((m) => !m.disabled);
    const sum = admin.attendanceMonth(month);
    return `<div class="toolbar"><input type="date" data-deskday value="${esc(d)}" aria-label="Day" style="max-width:190px"><span class="grow"></span>${exportBtns('manage')}</div>
      <section class="card"><h2><span class="ic good">${svg('<path d="M12 20V10M18 20V4M6 20v-4"/>')}</span>Targets · ${esc(fdate(month))}<span class="sp"></span>${readOnly() ? '' : '<button class="btn sm" data-act="target-edit">Set targets</button>'}</h2>
        <div class="target-grid">
          <div class="target"><small>Revenue</small><b>${inr(tp.revenue)}</b><span>${tp.revenueGoal ? `of ${inr(tp.revenueGoal)} · ${tp.revenuePct}%` : 'No target set'}</span>${bar(tp.revenuePct, tp.revenuePct >= 100 ? 'good' : '')}</div>
          <div class="target"><small>New leads</small><b>${num(tp.leads)}</b><span>${tp.leadsGoal ? `of ${num(tp.leadsGoal)} · ${tp.leadsPct}%` : 'No target set'}</span>${bar(tp.leadsPct, tp.leadsPct >= 100 ? 'good' : '')}</div>
          <div class="target"><small>New patients</small><b>${num(tp.patients)}</b><span>${tp.patientsGoal ? `of ${num(tp.patientsGoal)}` : 'No target set'}</span>${bar(tp.patientsGoal ? (tp.patients / tp.patientsGoal) * 100 : 0)}</div>
        </div>
        ${tp.team.some((x) => x.goal) ? `<h3 class="sub-h">Team targets</h3><div class="fu-list">${tp.team.filter((x) => x.goal).map((x) => `<div class="fu-row"><span class="fu-name"><b>${esc(x.name)}</b><small>${inr(x.sales)} of ${inr(x.goal)}</small></span><span style="flex:1.2">${bar(x.pct, x.pct >= 100 ? 'good' : '')}</span><b>${x.pct}%</b></div>`).join('')}</div>` : ''}</section>
      <section class="card"><h2><span class="ic violet">${svg('<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>')}</span>Tasks<span class="sp"></span><span class="seg sm">${[['open', 'Open'], ['mine', 'Mine'], ['done', 'Done']].map(([k, l]) => `<button type="button" data-taskf="${k}" class="${taskF === k ? 'on' : ''}">${l}</button>`).join('')}</span>${readOnly() ? '' : '<button class="btn sm primary" data-act="task-add">+ Task</button>'}</h2>
        ${tasks.length ? `<div class="task-list">${tasks.map((t) => `<div class="task ${t.done ? 'done' : ''} ${t.priority}"><button type="button" class="tick" data-act="task-done" data-id="${t.id}" aria-label="${t.done ? 'Reopen' : 'Mark done'}">${t.done ? svg('<path d="M5 12l5 5 9-10"/>') : ''}</button>
          <div><b>${esc(t.title)}</b><small>${esc(accName(t.assignedTo))}${t.due ? ` · due ${fdate(t.due)}` : ''}${!t.done && t.due && t.due < admin.today() ? ' · <span class="bad-t">overdue</span>' : ''}${t.priority === 'high' ? ' · high priority' : ''}</small></div>
          <span class="acts"><button class="btn xs" data-act="task-edit" data-id="${t.id}">Edit</button>${canDelete() ? `<button class="btn xs danger" data-act="task-del" data-id="${t.id}">✕</button>` : ''}</span></div>`).join('')}</div>` : `<p class="hint" style="margin:0">${taskF === 'done' ? 'No finished tasks yet.' : 'No open tasks. Add one and assign it to a login.'}</p>`}</section>
      <section class="card"><h2><span class="ic teal">${svg(ICON_CAL)}</span>Attendance · ${d === admin.today() ? 'Today' : fdate(d)}</h2>
        ${team.length ? `<div class="att-list">${team.map((m) => `<div class="att-row"><b>${esc(m.name)}</b><span class="att-marks">${MARKS.map(([k, l]) => `<button type="button" class="${att[m.id] === k ? `on m${k}` : ''}" data-att="${m.id}" data-mark="${k}" ${readOnly() ? 'disabled' : ''}>${l}</button>`).join('')}</span></div>`).join('')}</div>
          <h3 class="sub-h">${esc(fdate(month))} so far</h3>${table(['Team member', '>Present', '>Half', '>Absent', '>Leave', '>Paid days'], sum.map((x) => `<tr><td>${esc(x.name)}</td><td class="r">${x.present}</td><td class="r">${x.half}</td><td class="r">${x.absent}</td><td class="r">${x.leave}</td><td class="r"><b>${x.days}</b></td></tr>`))}
          <p class="hint" style="margin:8px 0 0">Paid days fill the working days of staff paid per day on the Salary screen.</p>` : '<p class="hint" style="margin:0">Add your team first.</p>'}</section>`;
  };
  function taskForm(t) {
    openForm({
      title: t ? 'Edit task' : 'New task',
      fields: [
        { name: 'title', label: 'Task', required: true, value: t ? t.title : '', span: true, placeholder: 'Call back all overdue leads' },
        { name: 'assignedTo', label: 'Assign to', type: 'select', value: t ? t.assignedTo : '', options: [['', 'Anyone'], ...S().accounts.filter((a) => !a.disabled).map((a) => [a.id, a.name])] },
        { name: 'due', label: 'Due date', type: 'date', value: t ? t.due : admin.today() },
        { name: 'priority', label: 'Priority', type: 'select', value: t ? t.priority : 'normal', options: [['normal', 'Normal'], ['high', 'High'], ['low', 'Low']] },
        { name: 'notes', label: 'Notes', value: t ? t.notes : '', span: true },
      ],
      onSubmit: (v) => { admin.saveTask({ ...(t ? { id: t.id } : {}), ...v }); return 'Task saved'; },
    });
  }
  function targetForm() {
    const month = (deskDay || admin.today()).slice(0, 7);
    const cur = (S().targets || {})[month] || { members: {} };
    const team = S().team.filter((m) => !m.disabled);
    openForm({
      title: `Targets · ${fdate(month)}`,
      fields: [
        { name: 'revenue', label: 'Revenue target (₹)', type: 'number', value: cur.revenue || '' },
        { name: 'leads', label: 'New leads target', type: 'number', value: cur.leads || '' },
        { name: 'patients', label: 'New patients target', type: 'number', value: cur.patients || '' },
        ...team.map((m) => ({ name: `m_${m.id}`, label: `${m.name} · sales target (₹)`, type: 'number', value: (cur.members || {})[m.id] || '' })),
      ],
      onSubmit: (v) => {
        admin.setTarget(month, { revenue: Number(v.revenue) || 0, leads: Number(v.leads) || 0, patients: Number(v.patients) || 0, members: Object.fromEntries(team.map((m) => [m.id, Number(v[`m_${m.id}`]) || 0])) });
        return 'Targets saved';
      },
    });
  }

  // ── Home: Diet charts | Clinic admin, half the screen each ──
  SUBS.home = () => `${me.name} · ${A.ROLES[role]}`;
  SCREENS.home = () => {
    const h = new Date().getHours();
    const hi = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    let charts = 0; let patients = 0;
    try { charts = (JSON.parse(localStorage.getItem('primefit.charts.v1') || '[]') || []).length; patients = (JSON.parse(localStorage.getItem('primefit.patients.v1') || '[]') || []).length; } catch (_) { /* ignore */ }
    const d = can('dashboard') ? admin.dashboard({ from: admin.today(), to: admin.today() }) : null;
    return `<div class="home-split">
      <p class="home-hi">${hi}, <b>${esc(me.name)}</b><span>Choose where to go</span></p>
      <a class="half half-diet" href="../index.html" data-diet>
        <span class="half-ic">${svg('<path d="M12 21c-5 0-8-3.5-8-8 0-3 2-5 4.5-5 1.5 0 2.5.7 3.5.7s2-.7 3.5-.7C18 8 20 10 20 13c0 4.5-3 8-8 8z"/><path d="M12 8.7c0-2.5 1.2-4.2 3.5-5"/>')}</span>
        <b>Diet Charts</b><small>Diet charts, recipes and patient follow-ups in 10 languages</small>
        <span class="half-stats">${charts ? `<i>${num(charts)} charts</i>` : ''}${patients ? `<i>${num(patients)} patients</i>` : ''}<i>10 languages</i></span>
        <span class="half-go">Open diet charts ${svg('<path d="M5 12h14M13 6l6 6-6 6"/>')}</span></a>
      <button type="button" class="half half-admin" data-go="${adminHome()}">
        <span class="half-ic">${svg('<path d="M4 21V7l8-4 8 4v14"/><path d="M10 21v-5h4v5M12 8v5M9.5 10.5h5"/>')}</span>
        <b>Clinic Admin</b><small>OPD, sales, stock, team, expenses, content and reports</small>
        <span class="half-stats">${d ? `<i>Today ${inr(d.sales.revenue)}</i><i>${num(d.appointments.total - d.appointments.cancelled)} OPD</i>` : ''}${can('content') ? `<i>${num(admin.contentStats(null, null, myEditor()).remaining)} videos to post</i>` : ''}</span>
        <span class="half-go">Open admin ${svg('<path d="M5 12h14M13 6l6 6-6 6"/>')}</span></button>
    </div>`;
  };

  // Scheduled-post reminders (today and overdue) on Dashboard and Today.
  const reminderBanner = (c) => {
    if (!can('content') || !(c.dueToday.length + c.overdue.length)) return '';
    const list = [...c.overdue, ...c.dueToday];
    return `<button type="button" class="order-banner remind" data-go="content">${svg('<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>')}<span><b>Post reminder${list.length > 1 ? 's' : ''}: ${list.length} video${list.length > 1 ? 's' : ''} to post${c.overdue.length ? ` (${c.overdue.length} overdue)` : ' today'}</b>${list.slice(0, 4).map((x) => `${esc(x.title)}${x.platform ? ` · ${esc(x.platform)}` : ''}${x.scheduledTime ? ` · ${time12(x.scheduledTime)}` : ''}`).join(' · ')}</span>${svg('<path d="M9 5l7 7-7 7"/>')}</button>`;
  };

  // ── Doctors: profiles that appointments are booked with ──
  SUBS.doctors = () => `${S().doctors.filter((x) => !x.disabled).length} active doctors`;
  SCREENS.doctors = () => {
    const today = admin.today();
    const cards = S().doctors.map((x) => {
      const appts = S().appointments.filter((a) => a.doctorId === x.id && a.status !== 'cancelled');
      const todayN = appts.filter((a) => a.date === today).length;
      return `<div class="doc-card ${x.disabled ? 'off' : ''}"><div class="doc-av">${esc((x.name.replace(/^dr\.?\s*/i, '')[0] || 'D').toUpperCase())}</div>
        <div class="doc-main"><b>${esc(x.name)}</b><small>${esc([x.speciality, x.qualification].filter(Boolean).join(' · ') || 'Doctor')}</small>
          <div class="meta">${x.days ? `<span class="badge">${esc(x.days)}</span>` : ''}${x.timing ? `<span class="badge">${esc(x.timing)}</span>` : ''}${x.fee != null ? `<span class="badge teal">Fee ${inr(x.fee)}</span>` : ''}${x.disabled ? '<span class="badge">Disabled</span>' : ''}</div></div>
        <div class="doc-side"><b>${num(todayN)}</b><small>today · ${num(appts.length)} total</small>
          <span class="acts"><button class="btn xs" data-act="edit-doctor" data-id="${x.id}">Edit</button>${canDelete() ? ` <button class="btn xs danger" data-act="del-doctor" data-id="${x.id}">Delete</button>` : ''}</span></div></div>`;
    }).join('');
    return `<div class="toolbar"><span class="grow"></span>${exportBtns('doctors')}<button class="btn primary" data-act="add-doctor">${svg('<path d="M12 5v14M5 12h14"/>')}Add doctor</button></div>
      <div class="doc-list">${cards || `<div class="card empty">No doctor profiles yet.<br><br><button class="btn primary" data-act="add-doctor">Add a doctor</button></div>`}</div>
      <p class="hint">Pick a doctor when booking an OPD appointment. A doctor's fee (if set) fills the consultation fee.</p>`;
  };
  function doctorForm(x) {
    openForm({
      title: x ? `Edit ${x.name}` : 'Add doctor profile',
      fields: [
        { name: 'name', label: 'Doctor name', required: true, value: x ? x.name : '', placeholder: 'Dr. Name' },
        { name: 'speciality', label: 'Speciality', type: 'list', list: 'specialities', value: x ? x.speciality : '', blank: 'Choose…' },
        { name: 'qualification', label: 'Qualification', value: x ? x.qualification : '', placeholder: 'MBBS, MD' },
        { name: 'mobile', label: 'Mobile', type: 'tel', value: x ? x.mobile : '' },
        { name: 'fee', label: 'Consultation fee (₹)', type: 'number', value: x && x.fee != null ? x.fee : '', hint: `Blank = clinic fee ${inr(set().consultFee)}` },
        { name: 'days', label: 'Available days', value: x ? x.days : '', placeholder: 'Mon–Sat' },
        { name: 'timing', label: 'Timing', value: x ? x.timing : '', placeholder: '10 AM – 2 PM' },
        { name: 'disabled', label: 'Disabled (hide from new appointments)', type: 'checkbox', value: x ? x.disabled : false, span: true },
        { name: 'notes', label: 'Notes', value: x ? x.notes : '', span: true },
      ],
      onSubmit: (v) => { admin.saveDoctor({ ...(x ? { id: x.id } : {}), ...v }); return 'Doctor saved'; },
    });
  }

  // ── Content & posts: videos edited, posted, remaining, and scheduled-post reminders ──
  const contentF = { status: '', editor: '', platform: '' };
  const CONTENT_CLS = { idea: 'warn', edited: 'info', scheduled: 'violet', posted: 'ok' };
  const contentBadge = (st) => `<span class="badge ${CONTENT_CLS[st]}">${A.CONTENT_STATUS[st]}</span>`;
  const myEditor = () => (role === 'editor' || (ownOnly() && me.editorId) ? (me.editorId || '__none') : '');
  const filteredContent = () => [...S().content].filter((c) => (!myEditor() || c.editorId === myEditor()) && (!contentF.status || c.status === contentF.status) && (!contentF.editor || c.editor === contentF.editor)
    && (!contentF.platform || c.platform === contentF.platform) && (inR(c.date || '', range()) || inR(c.postedDate || '', range()) || inR(c.scheduledDate || '', range()) || inR(c.receivedDate || '', range())))
    .sort((a, b) => ((a.scheduledDate || a.date || '') < (b.scheduledDate || b.date || '') ? 1 : -1));
  SUBS.content = () => `Videos · ${periodLabel()}`;
  SCREENS.content = () => {
    const st = admin.contentStats(range(), null, myEditor());
    const list = filteredContent();
    const editors = [...new Set(S().content.map((c) => c.editor).filter(Boolean))];
    const isEd = role === 'editor';
    const edCards = (isEd ? S().editors.filter((x) => x.id === me.editorId) : S().editors).map((x) => {
      const mine = S().content.filter((c) => c.editorId === x.id);
      const acc = S().accounts.find((a) => a.editorId === x.id);
      return `<div class="doc-card ${x.disabled ? 'off' : ''}"><div class="doc-av ed">${esc((x.name[0] || 'E').toUpperCase())}</div>
        <div class="doc-main"><b>${esc(x.name)}</b><small>${esc(x.mobile || 'Video editor')}</small>
          <div class="meta"><span class="badge teal">${inr(admin.videoFee(x))} / video</span>${acc ? `<span class="badge violet">Login: ${esc(acc.username)}</span>` : ''}${x.disabled ? '<span class="badge">Disabled</span>' : ''}</div></div>
        <div class="doc-side"><b>${num(mine.filter((c) => c.status !== 'idea').length)}</b><small>received · ${num(mine.filter((c) => c.status === 'posted').length)} posted</small><small>Fees ${inr(mine.reduce((a, c) => a + (Number(c.cost) || 0), 0))}</small>
          ${isEd ? '' : `<span class="acts"><button class="btn xs" data-act="edit-editor" data-id="${x.id}">Edit</button>${role === 'super' && !acc ? ` <button class="btn xs" data-act="editor-login" data-id="${x.id}">Give login</button>` : ''}${canDelete() ? ` <button class="btn xs danger" data-act="del-editor" data-id="${x.id}">Delete</button>` : ''}</span>`}</div></div>`;
    }).join('');
    const row = (c) => `<tr><td><b>${esc(c.title)}</b><span class="sub">${esc([c.platform, c.editor && `Editor: ${c.editor}`, c.receivedDate && `Received ${fdate(c.receivedDate)}`].filter(Boolean).join(' · '))}</span></td>
      <td>${contentBadge(c.status)}</td>
      <td>${c.status === 'posted' ? `Posted ${fdate(c.postedDate)}` : c.scheduledDate ? `${fdate(c.scheduledDate)}${c.scheduledTime ? ` ${time12(c.scheduledTime)}` : ''}${c.status === 'scheduled' && c.scheduledDate < admin.today() ? ' <span class="badge bad">Overdue</span>' : ''}` : '—'}</td>
      <td class="r">${c.cost ? inr(c.cost) : '–'}</td>
      <td class="acts">${c.status === 'idea' ? `<button class="btn xs" data-act="content-received" data-id="${c.id}">✓ Received</button> ` : ''}${c.status !== 'posted' && c.status !== 'idea' ? `<button class="btn xs success" data-act="content-posted" data-id="${c.id}">✓ Posted</button> ` : ''}<button class="btn xs" data-act="edit-content" data-id="${c.id}">Edit</button>${canDelete() ? ` <button class="btn xs danger" data-act="del-content" data-id="${c.id}">Delete</button>` : ''}</td></tr>`;
    return `<div class="toolbar">${periodBar()}<span class="grow"></span>${exportBtns('content')}</div>
      ${reminderBanner(st)}
      <div class="kpis" style="margin-bottom:14px">${kpi('Total videos', num(st.total))}${kpi('With editor', num(st.toEdit), '', 'gold')}${kpi('Received from editor', num(st.edited), '', 'teal')}${kpi('Total posted', num(st.posted), '', 'good')}${kpi('Remaining to post', num(st.remaining), `${st.scheduled} scheduled`, st.remaining ? 'violet' : '')}${kpi('Editor fees', inr(st.fees), `${inr(set().videoFee != null ? set().videoFee : 150)} per video default`)}</div>
      ${isEd ? '' : socialCard()}
      <div class="card"><h2><span class="ic violet">${svg('<rect x="3" y="5" width="14" height="14" rx="2"/><path d="M17 10l4-2v8l-4-2"/>')}</span>${isEd ? 'My profile' : 'Editor profiles'}<span class="sp"></span>${isEd ? '' : '<button class="btn sm primary" data-act="add-editor">+ Add editor</button>'}</h2>
        ${edCards ? `<div class="doc-list">${edCards}</div>` : `<p class="hint" style="margin:0">${isEd ? 'Your login is not linked to an editor profile yet. Ask the Super Admin.' : 'Add your video editors here, with their fee per video. Give an editor a login to let them update their own videos.'}</p>`}</div>
      <div class="filters"><div class="row">
        <select data-cfilter="status" aria-label="Status">${opt('', 'All statuses', contentF.status)}${Object.entries(A.CONTENT_STATUS).map(([k, l]) => opt(k, l, contentF.status)).join('')}</select>
        <select data-cfilter="editor" aria-label="Editor">${opt('', 'All editors', contentF.editor)}${editors.map((x) => opt(x, x, contentF.editor)).join('')}</select>
        <select data-cfilter="platform" aria-label="Platform">${opt('', 'All platforms', contentF.platform)}${set().lists.platforms.map((x) => opt(x, x, contentF.platform)).join('')}</select>
        <button class="btn primary" data-act="add-content">+ Add video</button></div></div>
      ${st.upcoming.length ? `<div class="card"><h2><span class="ic violet">${svg(ICON_CAL)}</span>Scheduled posts</h2><div class="alerts">${st.upcoming.map((c) => `<div class="alert"><b>${esc(c.title)}</b><span class="badge violet">${fdate(c.scheduledDate)}${c.scheduledTime ? ` · ${time12(c.scheduledTime)}` : ''}${c.platform ? ` · ${esc(c.platform)}` : ''}</span></div>`).join('')}</div></div>` : ''}
      <div class="card">${table(['Video', 'Status', 'Schedule / posted', '>Editor fee', ''], list.map(row))}</div>
      ${st.byEditor.length ? `<div class="card"><h2>By editor</h2>${table(['Editor', '>Received', '>Posted', '>Fees'], st.byEditor.map((x) => `<tr><td>${esc(x.name)}</td><td class="r">${num(x.edited)}</td><td class="r">${num(x.posted)}</td><td class="r">${inr(x.cost)}</td></tr>`))}</div>` : ''}`;
  };
  // YouTube and Instagram counts, fetched through the Google Sheet script (or typed in by hand).
  const handleOf = (url, fallback) => String(url || '').replace(/\/+$/, '').split('/').pop().replace(/^@/, '') || fallback;
  function socialCard() {
    const so = S().social || {}; const yt = so.youtube || {}; const ig = so.instagram || {}; const st = set();
    const n = (v) => (v == null || v === '' ? '–' : num(v));
    const stat = (label, v) => `<div class="so-stat"><b>${n(v)}</b><small>${label}</small></div>`;
    const ytUrl = st.youtube || 'https://www.youtube.com/@ThePrimeFit';
    const igUrl = st.instagram || 'https://www.instagram.com/theprimefit_';
    return `<div class="card social"><h2><span class="ic bad">${svg('<rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="M10 9.2v5.6l4.8-2.8z"/>')}</span>Social media<span class="sp"></span>
        <button class="btn sm" data-act="social-edit">Edit counts</button><button class="btn sm primary" data-act="social-fetch">Fetch now</button></h2>
      <div class="so-grid">
        <div class="so-box yt"><a href="${esc(ytUrl)}" target="_blank" rel="noopener" class="so-head"><b>YouTube</b><small>@${esc(handleOf(ytUrl, 'ThePrimeFit'))}</small></a>
          <div class="so-stats">${stat('Total videos', yt.videos)}${stat('Shorts', yt.shorts)}${stat('Long videos', yt.long)}${stat('Subscribers', yt.subscribers)}</div>
          ${yt.error ? `<p class="hint">${esc(yt.error)}</p>` : ''}</div>
        <div class="so-box ig"><a href="${esc(igUrl)}" target="_blank" rel="noopener" class="so-head"><b>Instagram</b><small>@${esc(handleOf(igUrl, 'theprimefit_'))}</small></a>
          <div class="so-stats">${stat('Posts', ig.posts)}${stat('Reels', ig.reels)}${stat('Followers', ig.followers)}</div>
          ${ig.error ? `<p class="hint">${esc(ig.error)}</p>` : ''}</div>
      </div>
      <p class="hint" style="margin:8px 0 0">${so.fetchedAt ? `Updated ${new Date(so.fetchedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}. ` : ''}${connected() ? 'Fetch now reads the counts through your Google Sheet script (add YT_API_KEY and, for Instagram, IG_TOKEN + IG_USER_ID in its Script properties).' : 'Connect the Google Sheet in Settings to fetch counts automatically, or type them with Edit counts.'}</p></div>`;
  }
  async function socialFetch() {
    if (!connected()) { toast('Connect the Google Sheet in Settings first, or use Edit counts', true); return; }
    toast('Fetching counts…');
    try {
      const url = set().sheetsUrl;
      const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}action=social&secret=${encodeURIComponent(set().sheetsSecret)}`);
      const out = await res.json().catch(() => null);
      if (!out || !out.ok) throw new Error((out && out.error) || 'The Google Sheet script did not answer. Paste the new Code.gs and deploy a new version.');
      // An older Code.gs answers with its health check instead of counts.
      if (!out.youtube && !out.instagram) throw new Error('Your Google Sheet still runs the old Code.gs. Paste the new Code.gs, run testSocial once, then Deploy → Manage deployments → New version.');
      out.youtube = out.youtube || {}; out.instagram = out.instagram || {};
      admin.setSocial({ youtube: out.youtube || {}, instagram: out.instagram || {}, fetchedAt: out.fetchedAt });
      render();
      toast(out.youtube.error || out.instagram.error ? 'Fetched (some counts need set-up)' : 'Counts updated');
    } catch (err) { toast(err.message, true); }
  }
  function socialForm() {
    const so = S().social || {}; const yt = so.youtube || {}; const ig = so.instagram || {};
    const f = (name, label, value) => ({ name, label, type: 'number', value: value == null ? '' : value });
    openForm({
      title: 'Social media counts',
      fields: [f('ytVideos', 'YouTube total videos', yt.videos), f('ytShorts', 'YouTube Shorts', yt.shorts), f('ytLong', 'YouTube long videos', yt.long), f('ytSubs', 'YouTube subscribers', yt.subscribers),
        f('igPosts', 'Instagram posts', ig.posts), f('igReels', 'Instagram reels', ig.reels), f('igFollowers', 'Instagram followers', ig.followers)],
      onSubmit: (v) => {
        const g = (x) => (x === '' ? null : x);
        admin.setSocial({ youtube: { videos: g(v.ytVideos), shorts: g(v.ytShorts), long: g(v.ytLong), subscribers: g(v.ytSubs), error: '' }, instagram: { posts: g(v.igPosts), reels: g(v.igReels), followers: g(v.igFollowers), error: '' } });
        return 'Counts saved';
      },
    });
  }
  function editorForm(x) {
    openForm({
      title: x ? `Edit ${x.name}` : 'Add video editor',
      fields: [
        { name: 'name', label: 'Editor name', required: true, value: x ? x.name : '' },
        { name: 'mobile', label: 'Mobile', type: 'tel', value: x ? x.mobile : '' },
        { name: 'fee', label: 'Fee per video (₹)', type: 'number', value: x && x.fee != null ? x.fee : '', hint: `Blank = default ${inr(set().videoFee != null ? set().videoFee : 150)}` },
        { name: 'disabled', label: 'Disabled', type: 'checkbox', value: x ? x.disabled : false },
        { name: 'notes', label: 'Notes', value: x ? x.notes : '', span: true },
      ],
      onSubmit: (v) => { admin.saveEditor({ ...(x ? { id: x.id } : {}), ...v }); return 'Editor saved'; },
    });
  }
  function contentForm(c) {
    openForm({
      title: c ? 'Edit video' : 'Add video',
      fields: [
        { name: 'title', label: 'Video title', required: true, value: c ? c.title : '', span: true, placeholder: 'Patient transformation reel' },
        { name: 'status', label: 'Status', type: 'select', value: c ? c.status : 'idea', options: Object.entries(A.CONTENT_STATUS) },
        { name: 'platform', label: 'Platform', type: 'list', list: 'platforms', value: c ? c.platform : 'Instagram', blank: 'Choose…' },
        { name: 'editorId', label: 'Editor (profile)', type: 'select', value: c ? c.editorId || '' : (role === 'editor' ? me.editorId || '' : ''), options: [['', c && c.editor && !c.editorId ? `${c.editor} (no profile)` : 'No editor'], ...S().editors.filter((x) => !x.disabled || (c && c.editorId === x.id)).filter((x) => role !== 'editor' || x.id === me.editorId).map((x) => [x.id, `${x.name} · ${inr(admin.videoFee(x))}/video`])] },
        { name: 'cost', label: 'Editor fee for this video (₹)', type: 'number', value: c && c.cost ? c.cost : '', hint: 'Blank = the editor\'s fee per video when received. Booked as an "Editing" expense' },
        { name: 'date', label: 'Given to editor on', type: 'date', value: c ? c.date : admin.today() },
        { name: 'receivedDate', label: 'Received from editor on', type: 'date', value: c ? c.receivedDate || '' : '' },
        { name: 'scheduledDate', label: 'Post on (reminder)', type: 'date', value: c ? c.scheduledDate : '' },
        { name: 'scheduledTime', label: 'Post time', type: 'time', value: c ? c.scheduledTime : '' },
        { name: 'postedDate', label: 'Posted on', type: 'date', value: c ? c.postedDate : '' },
        { name: 'link', label: 'Post link', value: c ? c.link : '', span: true },
        { name: 'notes', label: 'Notes', value: c ? c.notes : '', span: true },
      ],
      onSubmit: (v) => {
        let status = v.postedDate ? 'posted' : v.status === 'posted' || v.status === 'idea' ? v.status : v.scheduledDate ? 'scheduled' : v.status;
        if (status === 'idea' && v.receivedDate) status = v.scheduledDate ? 'scheduled' : 'edited';
        admin.saveContent({ ...(c ? { id: c.id } : {}), ...v, status });
        return 'Video saved';
      },
    });
  }

  // ── Today summary: sales, purchases, OPD, stock available / not available, order required ──
  let todayDate = '';
  SUBS.today = () => `${fdate(todayDate || admin.today())}${(todayDate || admin.today()) === admin.today() ? ' · Today' : ''}`;
  const shiftDay = (d, n) => { const [y, m, dd] = d.split('-').map(Number); return A.isoDate(new Date(y, m - 1, dd + n)); };
  SCREENS.today = () => {
    const d = todayDate || admin.today();
    const x = admin.daySummary(d);
    const tLeads = [...x.leadList, ...x.followUps.filter((l) => !x.leadList.includes(l))];
    const imgBtn = `<button type="button" class="btn sm" data-act="export" data-what="today" data-fmt="jpeg">${svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>')}Image</button>`;
    const stockRow = (y) => `<tr><td>${esc(y.item.name)}</td><td>${esc(y.item.category)}</td><td class="r"><b>${num(y.stock)}</b> <span class="hint">${esc(y.item.unit)}</span></td><td>${y.item.orderAt != null && y.stock < y.item.orderAt ? '<span class="badge bad">Order required</span>' : y.stock > 0 ? '<span class="badge ok">Available</span>' : '<span class="badge">Not available</span>'}</td></tr>`;
    return `<div class="toolbar"><div class="day-nav"><button type="button" class="btn sm" data-day="-1" aria-label="Previous day">‹</button><input type="date" data-todaydate value="${esc(d)}" aria-label="Date"><button type="button" class="btn sm" data-day="1" aria-label="Next day">›</button>${d !== admin.today() ? '<button type="button" class="btn sm" data-day="0">Today</button>' : ''}</div>
        <span class="grow"></span><span class="btn-group"><button type="button" class="btn sm primary" data-act="today-export">${svg('<path d="M4 6h16M7 12h10M10 18h4"/>')}Export with filters</button><button type="button" class="btn sm" data-act="export" data-what="today" data-fmt="pdf">${svg('<path d="M6 3h9l4 4v14H6zM14 3v5h5"/>')}PDF</button>${imgBtn}</span></div>
      <section class="hero"><div><small>${esc(set().clinic)} · ${fdate(d)}</small></div><div class="hero-row">
        <div class="hk"><small>Sales</small><b>${inr(x.salesTotal)}</b><small>${plural(x.sales.length, 'sale')}</small></div>
        <div class="hk"><small>Purchases</small><b>${inr(x.purchaseTotal)}</b><small>${plural(x.purchases.length, 'invoice')}</small></div>
        <div class="hk"><small>OPD</small><b>${num(x.appt.total - x.appt.cancelled)}</b><small>fees ${inr(x.appt.fees)}</small></div>
        <div class="hk"><small>Expenses</small><b>${inr(x.expenseTotal)}</b><small>${plural(x.leads, 'new lead')}</small></div>
      </div></section>
      ${reminderBanner(x.content)}
      ${x.order.length ? `<section class="card order-card"><h2><span class="ic bad">${svg('<path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>')}</span>Order required</h2>
        <div class="alerts">${x.order.map((o) => `<div class="alert bad"><b>${esc(o.item.name)}</b><span class="badge bad">${num(o.stock)} left · below ${o.item.orderAt}</span></div>`).join('')}</div></section>` : ''}
      <div class="cards">
        <section class="card"><h2><span class="ic">${svg('<path d="M4 19h16M7 16V9M12 16V5M17 16v-4"/>')}</span>Sales<span class="sp"></span><span class="badge">${inr(x.salesTotal)}</span></h2>
          ${table(['Patient', 'Product', '>Qty', '>Amount', 'Reference'], x.sales.map((s) => `<tr><td>${esc(s.patientName)}</td><td>${typeBadge(s.type)} ${esc(s.product)}</td><td class="r">${s.qty}</td><td class="r"><b>${inr(s.amount)}</b></td><td><b>${splitText(s)}</b></td></tr>`))}</section>
        <section class="card"><h2><span class="ic gold">${svg('<path d="M6 3h9l4 4v14H6zM14 3v5h5"/>')}</span>Purchases<span class="sp"></span><span class="badge">${inr(x.purchaseTotal)}</span></h2>
          ${table(['Vendor', 'Stock in', '>Total'], x.purchases.map((p) => `<tr><td>${esc(p.vendor || 'Vendor')}<span class="sub">${esc(p.invoiceNo)}</span></td><td>${p.lines.map((l) => `${esc(l.name)} +${num(l.qty)}`).join('<br>')}</td><td class="r">${inr(p.total)}</td></tr>`))}</section>
      </div>
      <div class="cards">
        <section class="card"><h2><span class="ic violet">${svg(ICON_CAL)}</span>OPD appointments<span class="sp"></span><span class="badge">${num(x.appointments.length)}</span></h2>
          ${table(['Time', 'Patient', 'Doctor', 'Status', '>Fee'], x.appointments.map((a) => `<tr><td>${time12(a.time)}</td><td>${esc(a.patientName)}${a.service ? `<span class="sub">${esc(a.service)}</span>` : ''}</td><td>${esc(admin.doctorName(a))}</td><td>${statusBadge(a.status)}</td><td class="r">${inr(a.fee)} ${payBadge(a)}</td></tr>`))}</section>
        <section class="card"><h2><span class="ic gold">${svg('<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>')}</span>Expenses<span class="sp"></span><span class="badge">${inr(x.expenseTotal)}</span></h2>
          ${table(['Category', 'Name', '~Note', '>Amount'], x.expenses.map((e) => `<tr><td>${esc(e.category)}</td><td>${esc(e.name || '')}</td><td>${esc(e.note || '')}</td><td class="r">${inr(e.amount)}</td></tr>`))}</section>
      </div>
      <div class="cards">
        <section class="card"><h2><span class="ic gold">${svg(ICON_LEADS)}</span>Leads & follow-ups<span class="sp"></span><span class="badge">${num(x.leadList.length)} new · ${num(x.followUps.length)} follow-up</span></h2>
          ${table(['Name', 'Mobile', 'Source', 'Status'], capList(tLeads, 'tleads').map((l) => `<tr><td>${esc(l.name)}${x.followUps.includes(l) ? ' <span class="badge gold">Follow-up</span>' : ''}</td><td>${esc(l.mobile)}</td><td>${esc(l.source || '')}</td><td>${esc(l.status)}</td></tr>`))}${moreBtn('tleads', tLeads.length)}</section>
        <section class="card"><h2><span class="ic">${svg('<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/>')}</span>Renewals due<span class="sp"></span><span class="badge">${num(x.renewals.length)}</span></h2>
          ${table(['Patient', 'Product', '>Days', 'Reference'], x.renewals.slice(0, 30).map((rr) => `<tr><td>${esc(rr.name)}<span class="sub">${esc(rr.mobile)}</span></td><td>${esc(rr.product)}</td><td class="r">${num(rr.days)}</td><td><b>${esc(rr.ref)}</b></td></tr>`))}</section>
      </div>
      ${x.posted.length || x.content.dueToday.length ? `<section class="card"><h2><span class="ic violet">${svg('<rect x="3" y="5" width="14" height="14" rx="2"/><path d="M17 10l4-2v8l-4-2"/>')}</span>Content today</h2>
        ${table(['Video', 'Platform', 'Status'], [...x.posted, ...x.content.dueToday].map((c) => `<tr><td>${esc(c.title)}</td><td>${esc(c.platform || '')}</td><td>${contentBadge(c.status)}</td></tr>`))}</section>` : ''}
      <div class="cards">
        <section class="card"><h2><span class="ic teal">${svg('<path d="M20 6L9 17l-5-5"/>')}</span>Stock available<span class="sp"></span><span class="badge ok">${x.available.length}</span></h2>
          ${table(['Item', '~Category', '>Stock', 'Status'], x.available.map(stockRow))}</section>
        <section class="card"><h2><span class="ic bad">${svg('<path d="M18 6L6 18M6 6l12 12"/>')}</span>Stock not available<span class="sp"></span><span class="badge bad">${x.notAvailable.length}</span></h2>
          ${table(['Item', '~Category', '>Stock', 'Status'], x.notAvailable.map(stockRow))}</section>
      </div>`;
  };

  // ── Lead management (CRM) ─────────────────────────────────────
  const leadF = { tab: 'open', q: '', status: '', source: '', priority: '', owner: '', tag: '' };
  let leadView = 'list'; let leadSelMode = false; const leadSel = new Set();
  const tagsOf = (l) => String(l.tags || '').split(',').map((x) => x.trim()).filter(Boolean);
  const scoreCls = (n) => (n >= 70 ? 'good' : n >= 40 ? 'gold' : 'cold');
  // WhatsApp message templates for leads (editable in Settings → Messages).
  const WA_DEFAULTS = {
    intro: 'Namaste {name}, this is {clinic}. Thank you for your enquiry{about}. When is a good time to talk?',
    price: 'Namaste {name}, our GLP-1 Success Support packages start at ₹1,499 (1 week) and include a doctor consultation, a personalised diet plan and WhatsApp support. Shall I book your consultation?',
    followup: 'Namaste {name}, just following up from {clinic}{about}. Would you like to book your consultation this week?',
    appt: 'Namaste {name}, your consultation at {clinic} is booked. Reply here if you need to change the time.',
  };
  const WA_LABELS = { intro: 'Intro', price: 'Price & packages', followup: 'Follow-up', appt: 'Appointment' };
  const waText = (k, l) => ((set().waTemplates || {})[k] || WA_DEFAULTS[k]).replace(/\{name\}/g, l.name).replace(/\{clinic\}/g, set().clinic).replace(/\{about\}/g, l.interest ? ` about ${l.interest}` : '');
  const PRIO_CLS = { hot: 'bad', warm: 'gold', cold: 'info' };
  // Front Desk sees their own leads and unassigned ones; Admin and Manager see everyone's.
  // "Own data only" logins (and Front Desk for leads) see only their own records.
  const ownOnly = () => !!(me && me.ownOnly && role !== 'super');
  const myMember = () => (me && me.memberId) || '__none';
  function myLeadFilter() {
    if (ownOnly()) return (l) => l.assignedTo === me.id || l.createdBy === me.name;
    if (role !== 'desk') return null;
    return (l) => !l.assignedTo || l.assignedTo === me.id || l.createdBy === me.name;
  }
  const accountName = (id) => (admin.account(id) || {}).name || '';
  // The stage after this one in the pipeline (none for closed leads or the last open stage).
  function nextStage(l) {
    if (admin.isClosedLead(l)) return '';
    const list = set().lists.leadStatuses.filter((x) => !['Not interested', 'Lost'].includes(x));
    const i = list.indexOf(l.status);
    return i >= 0 && i < list.length - 1 ? list[i + 1] : '';
  }
  // After tapping Call: one tap records how it went and sets the next follow-up.
  const CALL_OUTCOMES = [
    ['interested', '😊 Interested', 'Interested', 1], ['callback', '⏰ Call back tomorrow', 'Follow-up', 1], ['noreach', '📵 Not reachable', '', 1],
    ['booked', '📅 Booked appointment', 'Appointment booked', null], ['no', '🙅 Not interested', 'Not interested', null]];
  function callOutcome(id) {
    const l = admin.lead(id); if (!l || readOnly()) return;
    openForm({ title: `How did the call go? · ${l.name}`, submitLabel: false, html: `<div class="call-outs">${CALL_OUTCOMES.map(([k, label]) => `<button type="button" class="call-out ${k}" data-act="call-out" data-id="${l.id}" data-o="${k}">${label}</button>`).join('')}</div>
      <label class="f">Note (optional)<input id="co-note" placeholder="What did they say?"></label>
      <label class="f">Next follow-up<input type="date" id="co-date" value="${shiftDay(admin.today(), 1)}"></label>` });
  }
  function filteredLeads() {
    const d = admin.today();
    const mine = myLeadFilter();
    const q = leadF.q.toLowerCase();
    return S().leads.filter((l) => (!mine || mine(l))
      && (leadF.tab === 'all' || (leadF.tab === 'open' && !admin.isClosedLead(l)) || (leadF.tab === 'due' && !admin.isClosedLead(l) && l.followUp === d)
        || (leadF.tab === 'overdue' && !admin.isClosedLead(l) && l.followUp && l.followUp < d) || (leadF.tab === 'won' && ['Converted', 'Appointment booked'].includes(l.status))
        || (leadF.tab === 'lost' && ['Not interested', 'Lost'].includes(l.status))
        || (leadF.tab === 'hot' && l.priority === 'hot' && !admin.isClosedLead(l)) || (leadF.tab === 'unassigned' && !l.assignedTo && !admin.isClosedLead(l))
        || (leadF.tab === 'nofu' && !l.followUp && !admin.isClosedLead(l)) || (leadF.tab === 'week' && l.date >= shiftDay(d, -6)))
      && (!leadF.tag || tagsOf(l).includes(leadF.tag))
      && (!leadF.status || l.status === leadF.status) && (!leadF.source || l.source === leadF.source)
      && (!leadF.priority || l.priority === leadF.priority) && (!leadF.owner || l.assignedTo === leadF.owner || (leadF.owner === '__none' && !l.assignedTo))
      && (!q || `${l.name} ${l.mobile} ${l.city || ''} ${l.interest || ''} ${l.notes || ''}`.toLowerCase().includes(q)))
      .sort((a, b) => (a.followUp || '9999').localeCompare(b.followUp || '9999') || b.created - a.created);
  }
  SUBS.leads = () => (role === 'desk' ? `${me.name} · my leads` : 'All leads');
  SCREENS.leads = () => {
    const d = admin.today();
    const mine = myLeadFilter();
    const st = admin.leadStats(null, mine);
    const list = filteredLeads();
    const base = S().leads.filter((l) => !mine || mine(l));
    const tabs = [['open', 'Open'], ['due', `Due today (${st.dueToday})`], ['overdue', `Overdue (${st.overdue})`], ['hot', 'Hot'], ['unassigned', 'Not assigned'], ['nofu', 'No follow-up'], ['week', 'This week'], ['won', 'Converted'], ['lost', 'Lost'], ['all', 'All']];
    const pipeline = set().lists.leadStatuses.map((x) => [x, base.filter((l) => l.status === x).length]);
    const people = S().accounts.filter((a) => !a.disabled);
    const card = (l) => {
      const due = l.followUp && !admin.isClosedLead(l) ? (l.followUp < d ? 'bad' : l.followUp === d ? 'warn' : 'info') : '';
      const wa = waLink(l.mobile, `Namaste ${l.name}, this is ${set().clinic}.`);
      const sc = admin.leadScore(l);
      return `<div class="lead ${leadSel.has(l.id) ? 'sel' : ''}" data-act="${leadSelMode ? 'lead-pick' : 'lead'}" data-id="${l.id}" role="button" tabindex="0">
        <div class="lead-top">${leadSelMode ? `<span class="pick-box ${leadSel.has(l.id) ? 'on' : ''}"></span>` : ''}<span class="prio ${PRIO_CLS[l.priority] || ''}" title="${esc(A.LEAD_PRIORITIES[l.priority] || '')}"></span><b>${esc(l.name)}</b><span class="score ${scoreCls(sc)}" title="Lead score">${sc}</span><span class="badge ${['Converted', 'Appointment booked'].includes(l.status) ? 'ok' : ['Lost', 'Not interested'].includes(l.status) ? 'bad' : 'info'}">${esc(l.status)}</span></div>
        <div class="lead-meta">${l.interest ? `<span>${esc(l.interest)}</span>` : ''}${l.source ? `<span>${esc(l.source)}</span>` : ''}${l.city ? `<span>${esc(l.city)}</span>` : ''}${l.assignedTo ? `<span>👤 ${esc(accountName(l.assignedTo))}</span>` : ''}${tagsOf(l).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        <div class="lead-foot">${l.followUp ? `<span class="badge ${due}">Follow-up ${fdate(l.followUp)}${l.followTime ? ` ${time12(l.followTime)}` : ''}</span>` : '<span class="hint">No follow-up set</span>'}
          <span class="lead-acts"><a class="btn xs" href="tel:${esc(l.mobile)}" data-callout="${l.id}">📞 Call</a>${wa ? `<a class="btn xs" href="${esc(wa)}" target="_blank" rel="noopener" data-walead="${l.id}">WhatsApp</a>` : ''}${nextStage(l) && !readOnly() ? `<button type="button" class="btn xs" data-act="lead-next" data-id="${l.id}" title="Move to the next stage">→ ${esc(nextStage(l))}</button>` : ''}${readOnly() ? '' : `<button type="button" class="btn xs" data-act="lead-remind" data-id="${l.id}" title="Remind me" aria-label="Remind me">⏰</button>`}<button type="button" class="btn xs primary" data-act="lead-note" data-id="${l.id}">Update</button></span></div></div>`;
    };
    const srcs = set().lists.leadSources;
    const quickAdd = readOnly() ? '' : `<section class="card quick-lead"><h2><span class="ic teal">${svg('<path d="M12 5v14M5 12h14"/>')}</span>Quick add<span class="sp"></span><small class="hint">Name and mobile are enough</small></h2>
      <div class="ql-row"><input id="ql-name" placeholder="Name" autocomplete="off"><input id="ql-mobile" type="tel" inputmode="tel" placeholder="Mobile" autocomplete="off">
        <select id="ql-source" aria-label="Source">${opt('', 'Source…', '')}${srcs.map((x) => opt(x, x, '')).join('')}</select>
        <div class="seg sm" id="ql-prio">${Object.entries(A.LEAD_PRIORITIES).map(([k, v]) => `<button type="button" data-qlprio="${k}" class="${k === 'warm' ? 'on' : ''}">${esc(v)}</button>`).join('')}</div>
        <button type="button" class="btn primary" data-act="lead-quick">Add lead</button></div></section>`;
    const board = () => `<div class="board scroll-x">${set().lists.leadStatuses.map((x) => { const col = list.filter((l) => l.status === x); return `<div class="board-col"><h4>${esc(x)}<span>${col.length}</span></h4>${col.slice(0, 60).map((l) => `<button type="button" class="board-card" data-act="lead" data-id="${l.id}"><span class="prio ${PRIO_CLS[l.priority] || ''}"></span><b>${esc(l.name)}</b><small>${esc([l.interest, l.followUp ? `⏰ ${fdate(l.followUp)}` : ''].filter(Boolean).join(' · '))}</small></button>`).join('') || '<p class="hint">—</p>'}</div>`; }).join('')}</div>`;
    const bulk = leadSelMode ? `<div class="bulk-bar"><b>${leadSel.size} selected</b><button type="button" class="btn xs" data-act="lead-pick-all">Select all ${list.length}</button><span class="grow"></span>
      ${readOnly() ? '' : `<select id="bk-status" aria-label="Status">${opt('', 'Set stage…', '')}${set().lists.leadStatuses.map((x) => opt(x, x, '')).join('')}</select>
      <select id="bk-owner" aria-label="Assign">${opt('', 'Assign to…', '')}${opt('__none', 'Not assigned', '')}${people.map((a) => opt(a.id, a.name, '')).join('')}</select>
      <select id="bk-tag" aria-label="Tag">${opt('', 'Add tag…', '')}${(set().leadTags || []).map((x) => opt(x, x, '')).join('')}</select>
      <input type="date" id="bk-follow" aria-label="Follow-up">
      <button type="button" class="btn xs primary" data-act="lead-bulk">Apply</button>${canDelete() ? '<button type="button" class="btn xs danger" data-act="lead-bulk-del">Delete</button>' : ''}`}</div>` : '';
    return `<div class="toolbar"><div class="scroll-x"><div class="seg">${tabs.map(([k, l]) => `<button type="button" data-leadtab="${k}" class="${leadF.tab === k ? 'on' : ''}">${l}</button>`).join('')}</div></div></div>
      <div class="toolbar"><div class="seg sm">${[['list', 'List'], ['board', 'Board']].map(([k, l]) => `<button type="button" data-leadview="${k}" class="${leadView === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <button type="button" class="btn sm ${leadSelMode ? 'primary' : ''}" data-act="lead-select">${leadSelMode ? 'Done selecting' : 'Select'}</button>
        <span class="grow"></span>${exportBtns('leads')}${readOnly() ? '' : '<button class="btn sm" data-act="lead-import">Import</button>'}<button class="btn primary" data-act="new-lead">${svg('<path d="M12 5v14M5 12h14"/>')}New lead</button></div>
      <div class="kpis" style="margin-bottom:14px">${kpi('Open leads', num(st.open))}${kpi('New today', num(st.newToday), '', 'teal')}${kpi('Due today', num(st.dueToday), '', 'gold')}${kpi('Overdue', num(st.overdue), '', st.overdue ? 'bad' : '')}${kpi('Hot leads', num(st.hot), '', 'bad')}${kpi('Conversion', `${st.conversion}%`, `${st.won} of ${st.total}`, 'good')}</div>
      ${reminderCard(mine)}
      ${quickAdd}
      ${leadSummaryCard(mine)}
      ${tapCard(mine)}
      <div class="pipeline scroll-x">${pipeline.map(([x, n]) => `<button type="button" class="pipe ${leadF.status === x ? 'on' : ''}" data-leadstatus="${esc(x)}"><b>${n}</b><span>${esc(x)}</span></button>`).join('')}</div>
      <div class="filters"><div class="row">
        <input type="search" data-lfilter="q" placeholder="Search name, mobile, city, interest" value="${esc(leadF.q)}">
        <select data-lfilter="source" aria-label="Source">${opt('', 'All sources', leadF.source)}${set().lists.leadSources.map((x) => opt(x, x, leadF.source)).join('')}</select>
        <select data-lfilter="priority" aria-label="Priority">${opt('', 'Any priority', leadF.priority)}${Object.entries(A.LEAD_PRIORITIES).map(([k, v]) => opt(k, v, leadF.priority)).join('')}</select>
        ${role !== 'desk' ? `<select data-lfilter="owner" aria-label="Assigned to">${opt('', 'Everyone', leadF.owner)}${opt('__none', 'Not assigned', leadF.owner)}${people.map((a) => opt(a.id, a.name, leadF.owner)).join('')}</select>` : ''}
        ${(set().leadTags || []).length ? `<select data-lfilter="tag" aria-label="Tag">${opt('', 'Any tag', leadF.tag)}${set().leadTags.map((x) => opt(x, x, leadF.tag)).join('')}</select>` : ''}
      </div></div>
      ${bulk}
      ${leadView === 'board' ? board() : `<div class="lead-list">${capList(list, 'leads').map(card).join('') || `<div class="card empty">${svg(ICON_LEADS)}No leads here.<br><br><button class="btn primary" data-act="new-lead">Add a lead</button></div>`}</div>${moreBtn('leads', list.length)}`}`;
  };
  // Lead day summary: responses, status changes and the next follow-ups, for any day.
  let leadSumDay = '';
  function leadSummaryCard(mine) {
    const today = admin.today();
    const d = leadSumDay || today;
    const x = admin.leadDay(d, mine);
    const fu = (l) => `<div class="fu-row"><span class="fu-when ${l.followUp < today ? 'bad' : l.followUp === today ? 'warn' : ''}">${l.followUp === today ? 'Today' : fdate(l.followUp)}${l.followTime ? `<small>${time12(l.followTime)}</small>` : ''}</span>
      <button type="button" class="fu-name" data-act="lead" data-id="${l.id}"><b>${esc(l.name)}</b><small>${esc([l.status, l.interest].filter(Boolean).join(' · '))}</small></button>
      <span class="fu-acts"><a class="btn xs" href="tel:${esc(l.mobile)}" data-callout="${l.id}">Call</a>${waLink(l.mobile, `Namaste ${l.name}, this is ${set().clinic}.`) ? `<a class="btn xs" href="${esc(waLink(l.mobile, `Namaste ${l.name}, this is ${set().clinic}.`))}" target="_blank" rel="noopener" data-walead="${l.id}">WhatsApp</a>` : ''}</span></div>`;
    const next = [...x.overdue, ...x.dueToday, ...x.upcoming].slice(0, 8);
    return `<section class="card lead-sum"><h2><span class="ic gold">${svg(ICON_TODAY)}</span>Daily summary<span class="sp"></span>
        <span class="day-nav"><button type="button" class="btn xs" data-leadsum="-1" aria-label="Previous day">‹</button><b>${d === today ? 'Today' : fdate(d)}</b><button type="button" class="btn xs" data-leadsum="1" aria-label="Next day" ${d >= today ? 'disabled' : ''}>›</button></span></h2>
      <div class="kpis">${kpi('New leads', num(x.newLeads.length), '', 'teal')}${kpi('Responses', num(x.responses.length), `${x.calls} calls · ${x.whatsapp} WhatsApp · ${x.notes} notes`)}${kpi('Leads contacted', num(x.contacted), '', 'violet')}${kpi('Converted', num(x.converted), '', 'good')}${kpi('Follow-ups due', num(x.dueToday.length), '', 'gold')}${kpi('Overdue', num(x.overdue.length), '', x.overdue.length ? 'bad' : '')}${kpi('Next 7 days', num(x.upcoming.length), `${x.noFollowUp} with no follow-up`)}</div>
      <div class="status-chips">${Object.entries(x.byStatus).filter(([, n]) => n).map(([k, n]) => `<span class="chip"><b>${n}</b>${esc(k)}</span>`).join('')}</div>
      ${x.statusChanges.length ? `<p class="hint" style="margin:8px 0 0">Status changes: ${x.statusChanges.slice(0, 6).map((h) => `<b>${esc(h.lead.name)}</b> ${esc(h.text)}`).join(' · ')}</p>` : ''}
      ${next.length ? `<h3 class="sub-h">Next follow-ups</h3><div class="fu-list">${next.map(fu).join('')}</div>` : '<p class="hint" style="margin:10px 0 0">No follow-ups planned. Set one from a lead with “Note / follow-up”.</p>'}</section>`;
  }
  // Calls & WhatsApp taps per team member (each lead, button and person counts once within the gap set in Settings).
  let tapRange = 'today';
  const TAP_RANGES = { today: 'Today', week: '7 days', month: 'This month', all: 'All time' };
  function tapRangeOf(k) {
    const d = admin.today();
    return k === 'today' ? { from: d, to: d } : k === 'week' ? { from: shiftDay(d, -6), to: d } : k === 'month' ? { from: `${d.slice(0, 8)}01`, to: d } : null;
  }
  function tapCard(mine) {
    const rows = admin.clickStats(tapRangeOf(tapRange), mine);
    const tot = rows.reduce((a, r) => ({ calls: a.calls + r.calls, wa: a.wa + r.whatsapp }), { calls: 0, wa: 0 });
    const top = Math.max(1, ...rows.map((r) => r.total));
    return `<section class="card tap-card"><h2><span class="ic teal">${svg('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>')}</span>Calls & WhatsApp by team<span class="sp"></span>
      <div class="seg sm">${Object.entries(TAP_RANGES).map(([k, l]) => `<button type="button" data-taprange="${k}" class="${tapRange === k ? 'on' : ''}">${l}</button>`).join('')}</div></h2>
      <div class="tap-tot"><span><b>${num(tot.calls)}</b> calls</span><span><b>${num(tot.wa)}</b> WhatsApp</span><span><b>${num(rows.length)}</b> team member${rows.length === 1 ? '' : 's'}</span></div>
      ${rows.length ? `<div class="tap-list">${rows.map((r) => `<div class="tap-row"><span class="tap-av">${esc(r.name.trim().charAt(0).toUpperCase())}</span>
        <span class="tap-name"><b>${esc(r.name)}</b><small>${plural(r.leads, 'lead')} · last ${esc(ftime(r.last))}${r.ignored ? ` · ${r.ignored} repeat tap${r.ignored > 1 ? 's' : ''} not counted` : ''}</small><i class="tap-bar"><i style="width:${Math.round((r.total / top) * 100)}%"></i></i></span>
        <span class="tap-n call"><b>${num(r.calls)}</b><small>Calls</small></span><span class="tap-n wa"><b>${num(r.whatsapp)}</b><small>WhatsApp</small></span></div>`).join('')}</div>`
        : `<p class="hint" style="margin:6px 0 0">No calls or WhatsApp taps ${tapRange === 'all' ? 'yet' : `for ${TAP_RANGES[tapRange].toLowerCase()}`}. Taps on a lead's Call or WhatsApp button are counted here.</p>`}
      <p class="hint" style="margin:8px 0 0">Repeat taps on the same lead and button by the same person within ${Number(set().clickGapMins) || 15} minutes count once.</p></section>`;
  }
  // Follow-up reminders: quick "remind me" times on any lead, and a reminders list with snooze and done.
  const hm = (dt) => `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
  const isoOf = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  function remindPresets() {
    const now = new Date(); const at = (mins) => new Date(now.getTime() + mins * 60000);
    const day = (n, h) => { const x = new Date(now); x.setDate(x.getDate() + n); x.setHours(h, 0, 0, 0); return x; };
    const list = [['30m', 'In 30 min', at(30)], ['1h', 'In 1 hour', at(60)], ['3h', 'In 3 hours', at(180)]];
    if (now.getHours() < 17) list.push(['eve', 'This evening 6 PM', day(0, 18)]);
    list.push(['tm', 'Tomorrow 10 AM', day(1, 10)], ['tm5', 'Tomorrow 5 PM', day(1, 17)], ['2d', 'In 2 days', day(2, 10)], ['wk', 'Next week', day(7, 10)]);
    return list;
  }
  function remindForm(id) {
    const l = admin.lead(id); if (!l) return;
    const ps = remindPresets();
    openForm({
      title: `Remind me · ${l.name}`, submitLabel: 'Set reminder',
      html: `<div class="remind-grid" id="rm-box">${ps.map(([k, label, dt]) => `<button type="button" class="remind-opt" data-rm="${k}" data-d="${isoOf(dt)}" data-t="${hm(dt)}"><b>${label}</b><small>${isoOf(dt) === admin.today() ? 'Today' : fdate(isoOf(dt))} · ${time12(hm(dt))}</small></button>`).join('')}</div>
        <div class="grid two"><label class="f">Date<input type="date" id="rm-date" value="${esc(l.followUp || shiftDay(admin.today(), 1))}"></label><label class="f">Time<input type="time" id="rm-time" value="${esc(l.followTime || '10:00')}"></label>
        <label class="f span">What to do (optional)<input id="rm-note" placeholder="Call back about the 3 month plan"></label></div>
        <p class="hint" style="margin:0">You get an alert ${Number(set().remindMins) || 10} minutes before, and the lead shows in Follow-up reminders.</p>`,
      onSubmit: () => {
        const d = $('#rm-date').value; const t = $('#rm-time').value;
        if (!d) throw new Error('Choose a date');
        const note = $('#rm-note').value.trim();
        admin.addLeadActivity(l.id, { type: 'note', text: note ? `Reminder: ${note}` : '', followUp: d, followTime: t });
        return `Reminder set · ${l.name} · ${d === admin.today() ? 'today' : fdate(d)}${t ? ` ${time12(t)}` : ''}`;
      },
    });
    $('#rm-box').addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (!b) return; $$('[data-rm]', $('#rm-box')).forEach((x) => x.classList.toggle('on', x === b)); $('#rm-date').value = b.dataset.d; $('#rm-time').value = b.dataset.t; });
  }
  function reminderCard(mine) {
    const x = admin.leadDay(admin.today(), mine);
    const nowT = hm(new Date());
    const due = [...x.overdue, ...x.dueToday];
    const soon = x.upcoming.slice(0, 3);
    const when = (l) => { const late = l.followUp < admin.today() || (l.followUp === admin.today() && l.followTime && l.followTime < nowT); return `<span class="fu-when ${late ? 'bad' : 'warn'}">${l.followUp === admin.today() ? 'Today' : fdate(l.followUp)}${l.followTime ? `<small>${time12(l.followTime)}</small>` : ''}</span>`; };
    const row = (l) => { const wa = waLink(l.mobile, fillWa('followup', { clinic: set().clinic, name: l.name, about: l.interest ? ` about ${l.interest}` : '' })); return `<div class="fu-row">${when(l)}<button type="button" class="fu-name" data-act="lead" data-id="${l.id}"><b>${esc(l.name)}</b><small>${esc([l.status, l.interest, l.assignedTo ? accountName(l.assignedTo) : ''].filter(Boolean).join(' · '))}</small></button>
      <span class="fu-acts"><a class="btn xs" href="tel:${esc(l.mobile)}" data-callout="${l.id}">Call</a>${wa ? `<a class="btn xs" href="${esc(wa)}" target="_blank" rel="noopener" data-walead="${l.id}">WhatsApp</a>` : ''}${readOnly() ? '' : `<button type="button" class="btn xs" data-act="lead-snooze" data-id="${l.id}" title="Remind again in 1 hour">+1 h</button><button type="button" class="btn xs" data-act="lead-remind" data-id="${l.id}">⏰</button><button type="button" class="btn xs success" data-act="lead-fu-done" data-id="${l.id}" title="Follow-up done">✓</button>`}</span></div>`; };
    const perm = window.Notification && Notification.permission === 'default' && !window.AndroidBridge;
    return `<section class="card remind-card ${due.length ? 'has' : ''}"><h2><span class="ic gold">${svg('<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>')}</span>Follow-up reminders${due.length ? ` <span class="badge ${x.overdue.length ? 'bad' : 'warn'}">${due.length}</span>` : ''}<span class="sp"></span>${perm ? '<button type="button" class="btn xs" data-act="notif-on">Turn on alerts</button>' : ''}</h2>
      ${due.length ? `<div class="fu-list">${capList(due, 'remind').map(row).join('')}</div>${moreBtn('remind', due.length)}` : '<p class="hint" style="margin:0">No follow-ups due. Tap ⏰ on any lead to set a reminder.</p>'}
      ${soon.length ? `<h3 class="sub-h">Coming up</h3><div class="fu-list">${soon.map(row).join('')}</div>` : ''}</section>`;
  }
  function leadForm(l) {
    const v = l || { priority: 'warm', status: 'New', assignedTo: role === 'desk' || role === 'marketing' ? me.id : '', followUp: shiftDay(admin.today(), Number(set().followUpDays) || 0) };
    const tg = tagsOf(v);
    const people = S().accounts.filter((a) => !a.disabled || a.id === v.assignedTo);
    openForm({
      title: l ? `Edit lead · ${l.name}` : 'New lead',
      submitLabel: l ? 'Save lead' : 'Add lead',
      html: `<div class="grid">
        <label class="f">Name<input id="ld-name" value="${esc(v.name || '')}" autocomplete="off"></label>
        <label class="f">Mobile<input id="ld-mobile" type="tel" inputmode="tel" value="${esc(v.mobile || '')}"></label>
        <label class="f">Alternate mobile<input id="ld-alt" type="tel" inputmode="tel" value="${esc(v.altMobile || '')}"></label>
        <label class="f">City / area<input id="ld-city" value="${esc(v.city || '')}"></label>
        <label class="f">Age<input id="ld-age" type="number" min="0" value="${esc(v.age || '')}"></label>
        <label class="f">Gender<select id="ld-gender">${['', 'Female', 'Male', 'Other'].map((g) => opt(g, g || 'Select', v.gender)).join('')}</select></label>
        <label class="f">Source${listSelect('leadSources', 'id="ld-source"', v.source, 'Select source')}</label>
        <label class="f">Interested in${listSelect('services', 'id="ld-interest"', v.interest, 'Select service')}</label>
        <label class="f">Priority<select id="ld-prio">${Object.entries(A.LEAD_PRIORITIES).map(([k, x]) => opt(k, x, v.priority)).join('')}</select></label>
        <label class="f">Status${listSelect('leadStatuses', 'id="ld-status"', v.status)}</label>
        <label class="f">Assigned to<select id="ld-owner">${opt('', 'Not assigned', v.assignedTo)}${people.map((a) => opt(a.id, `${a.name} · ${A.ROLES[a.role]}`, v.assignedTo)).join('')}</select></label>
        <label class="f">Next follow-up<input id="ld-follow" type="date" value="${esc(v.followUp || '')}"></label>
        <label class="f">Follow-up time<input id="ld-ftime" type="time" value="${esc(v.followTime || '')}"></label>
        <label class="f">Current weight (kg)<input id="ld-weight" type="number" min="0" step="any" value="${esc(v.weight || '')}"></label>
        <label class="f">Target weight (kg)<input id="ld-target" type="number" min="0" step="any" value="${esc(v.targetWeight || '')}"></label>
        <label class="f">Height (cm)<input id="ld-height" type="number" min="0" step="any" value="${esc(v.height || '')}"></label>
        <label class="f">Budget (₹)<input id="ld-budget" type="number" min="0" value="${esc(v.budget || '')}"></label>
        <label class="f">Email<input id="ld-email" type="email" value="${esc(v.email || '')}"></label>
        <label class="f span">Notes<textarea id="ld-notes" rows="2" placeholder="Health goals, concerns, what they asked…">${esc(v.notes || '')}</textarea></label>
        <div class="f span">Tags<div class="tag-pick">${[...new Set([...(set().leadTags || []), ...tg])].map((t) => `<label class="tag-opt"><input type="checkbox" data-ldtag value="${esc(t)}" ${tg.includes(t) ? 'checked' : ''}><span>${esc(t)}</span></label>`).join('')}</div></div>
        <label class="f span">Reason lost (if lost / not interested)<input id="ld-lost" value="${esc(v.lostReason || '')}" placeholder="Price, distance, not ready…"></label></div>`,
      onSubmit: () => {
        const val = (id) => ($(`#${id}`).value || '').trim();
        const saved = admin.saveLead({
          id: l ? l.id : undefined, name: val('ld-name'), mobile: val('ld-mobile'), altMobile: val('ld-alt'), city: val('ld-city'), age: val('ld-age'), gender: val('ld-gender'),
          source: val('ld-source'), interest: val('ld-interest'), priority: val('ld-prio'), status: val('ld-status'), assignedTo: val('ld-owner'),
          followUp: val('ld-follow'), followTime: val('ld-ftime'), weight: val('ld-weight'), targetWeight: val('ld-target'), height: val('ld-height'),
          budget: val('ld-budget'), email: val('ld-email'), notes: val('ld-notes'), lostReason: val('ld-lost'), tags: $$('[data-ldtag]:checked').map((x) => x.value).join(', '),
        });
        return l ? 'Lead saved' : `Lead added: ${saved.name}`;
      },
    });
  }
  const H_ICON = { created: '✚', call: '📞', whatsapp: '💬', note: '📝', visit: '🏥', status: '➜', followup: '⏰' };
  function leadDetail(id, focusNote) {
    const l = admin.lead(id);
    if (!l) return;
    const wa = waLink(l.mobile, `Namaste ${l.name}, this is ${set().clinic}.`);
    const bmi = l.weight && l.height ? (Number(l.weight) / ((Number(l.height) / 100) ** 2)).toFixed(1) : '';
    const row = (k, v) => (v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : '');
    openForm({
      title: l.name, submitLabel: 'Save update',
      html: `<div class="meta" style="display:flex;gap:6px;flex-wrap:wrap"><span class="badge ${PRIO_CLS[l.priority]}">${esc(A.LEAD_PRIORITIES[l.priority] || '')}</span><span class="badge info">${esc(l.status)}</span>${l.source ? `<span class="badge">${esc(l.source)}</span>` : ''}</div>
        <div class="quick"><a class="btn" href="tel:${esc(l.mobile)}" data-callout="${l.id}">📞 Call</a>${wa ? `<a class="btn" href="${esc(wa)}" target="_blank" rel="noopener" data-walead="${l.id}">💬 WhatsApp</a>` : ''}${readOnly() ? '' : `<button type="button" class="btn" data-act="lead-remind" data-id="${l.id}">⏰ Remind me</button>`}${can('appointments') && !l.apptId ? `<button type="button" class="btn success" data-act="lead-book" data-id="${l.id}">Book appointment</button>` : ''}${l.status !== 'Converted' ? `<button type="button" class="btn" data-act="lead-convert" data-id="${l.id}">Mark converted</button>` : ''}<button type="button" class="btn" data-act="lead-edit" data-id="${l.id}">Edit</button>${canDelete() ? `<button type="button" class="btn danger" data-act="lead-del" data-id="${l.id}">Delete</button>` : ''}</div>
        <div class="wa-tpl"><small>WhatsApp message</small>${Object.keys(WA_DEFAULTS).map((k) => (waLink(l.mobile, waText(k, l)) ? `<a class="chip-btn" href="${esc(waLink(l.mobile, waText(k, l)))}" target="_blank" rel="noopener">${WA_LABELS[k]}</a>` : '')).join('')}</div>
        <div class="lead-score-row"><span class="score big ${scoreCls(admin.leadScore(l))}">${admin.leadScore(l)}</span><span><b>Lead score</b><small>From priority, contacts, follow-up, budget and booking</small></span>${tagsOf(l).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        <b style="font-size:13px">Move to stage</b>
        <div class="status-chips">${set().lists.leadStatuses.map((x) => `<button type="button" class="chip-btn ${l.status === x ? 'on' : ''}" data-act="lead-status" data-id="${l.id}" data-status="${esc(x)}">${esc(x)}</button>`).join('')}</div>
        <div class="note-box">
          <div class="grid"><label class="f">Update type<select id="la-type">${[['call', '📞 Call'], ['whatsapp', '💬 WhatsApp'], ['note', '📝 Note'], ['visit', '🏥 Visit']].map(([k, x]) => opt(k, x, 'call')).join('')}</select></label>
          <label class="f">Next follow-up<input id="la-follow" type="date" value="${esc(l.followUp || '')}"></label>
          <label class="f">Time<input id="la-ftime" type="time" value="${esc(l.followTime || '')}"></label>
          <label class="f span">What happened?<textarea id="la-text" rows="2" placeholder="e.g. Called, interested in Mounjaro, asked for price. Call back Monday."></textarea></label></div></div>
        <dl class="detail-list">${row('Mobile', `<a href="tel:${esc(l.mobile)}">${esc(l.mobile)}</a>${l.altMobile ? ` · ${esc(l.altMobile)}` : ''}`)}${row('Interested in', esc(l.interest))}${row('City', esc(l.city))}
          ${row('Age / gender', [l.age, l.gender].filter(Boolean).map(esc).join(' · '))}${row('Weight → target', l.weight ? `${esc(l.weight)} kg → ${esc(l.targetWeight || '?')} kg${bmi ? ` · BMI ${bmi}` : ''}` : '')}
          ${row('Budget', l.budget ? inr(l.budget) : '')}${row('Reason lost', esc(l.lostReason || ''))}${row('Assigned to', esc(accountName(l.assignedTo)))}${row('Added', `${fdate(l.date)}${l.createdBy ? ` by ${esc(l.createdBy)}` : ''}`)}${row('Notes', esc(l.notes))}</dl>
        <b style="font-size:13px">History</b>
        <ol class="timeline">${[...(l.history || [])].reverse().map((h) => `<li><span class="t-ic">${H_ICON[h.type] || '•'}</span><div><b>${esc(h.text)}</b><small>${ftime(h.at)}${h.by ? ` · ${esc(h.by)}` : ''}</small></div></li>`).join('')}</ol>`,
      onSubmit: () => {
        const text = $('#la-text').value.trim();
        const follow = $('#la-follow').value; const ft = $('#la-ftime').value;
        const changedFollow = follow !== (l.followUp || '') || ft !== (l.followTime || '');
        if (!text && !changedFollow) throw new Error('Write what happened or change the follow-up date');
        admin.addLeadActivity(l.id, { type: $('#la-type').value, text, ...(changedFollow ? { followUp: follow, followTime: ft } : {}) });
        return 'Lead updated';
      },
    });
    if (focusNote) setTimeout(() => { const t = $('#la-text'); if (t) t.focus(); }, 80);
  }

  // ── Activity log: every change, who made it and when ─────────
  const actF = { by: '', q: '' };
  function filteredLog() {
    const r = range();
    const q = actF.q.toLowerCase();
    return S().log.filter((x) => {
      const day = A.isoDate(new Date(x.at));
      return inR(day, r) && (!actF.by || x.by === actF.by) && (!q || `${x.action} ${x.detail}`.toLowerCase().includes(q));
    }).slice().reverse();
  }
  SUBS.activity = () => periodLabel();
  SCREENS.activity = () => {
    const list = filteredLog();
    const people = [...new Set(S().log.map((x) => x.by))];
    const per = {};
    list.forEach((x) => {
      const p = per[x.by] || (per[x.by] = { total: 0, leads: 0, updates: 0, appts: 0, sales: 0 });
      p.total++;
      if (x.action === 'Lead added') p.leads++;
      if (x.action === 'Lead activity' || x.action === 'Lead status') p.updates++;
      if (x.action === 'Appointment booked') p.appts++;
      if (x.action === 'Sale added') p.sales++;
    });
    return `<div class="toolbar">${periodBar()}<span class="grow"></span>${exportBtns('activity')}</div>
      <div class="filters"><div class="row"><input type="search" data-actfilter="q" placeholder="Search actions and details" value="${esc(actF.q)}">
        <select data-actfilter="by" aria-label="Person">${opt('', 'Everyone', actF.by)}${people.map((p) => opt(p, p, actF.by)).join('')}</select></div></div>
      <section class="card"><h2><span class="ic violet">${svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>')}</span>By person</h2>
        ${table(['Person', '>Changes', '>Leads added', '>Lead updates', '>Appointments', '>Sales'], Object.entries(per).map(([n, p]) => `<tr><td><b>${esc(n)}</b></td><td class="r">${p.total}</td><td class="r">${p.leads}</td><td class="r">${p.updates}</td><td class="r">${p.appts}</td><td class="r">${p.sales}</td></tr>`))}</section>
      <section class="card"><h2><span class="ic">${svg('<path d="M3 12h4l3-8 4 16 3-8h4"/>')}</span>All changes<span class="sp"></span><span class="badge">${list.length}</span></h2>
        <ol class="timeline big">${capList(list, 'activity').map((x) => `<li><span class="t-ic">${esc(x.by.charAt(0).toUpperCase())}</span><div><b>${esc(x.action)}</b>${x.detail ? `<span>${esc(x.detail)}</span>` : ''}<small>${ftime(x.at)} · ${esc(x.by)}</small></div></li>`).join('') || '<li class="empty">No changes in this period.</li>'}</ol>
        ${moreBtn('activity', list.length)}</section>`;
  };

  // ── What's new: app versions and credits ──────────────────────
  const CHANGELOG = [
    ['4.1', 'Back button always returns to the admin dashboard (never the Home page) and leaves the app from there; icons on every menu section; logo and app icon back in the original charcoal and teal colours.'],
    ['4.0', 'Company profile & payments in Settings (legal name, address, GSTIN, doctor, UPI, bank, terms, medico-legal note) used on every PDF and the diet charts; patient sales slips (several sales on one slip, A5, A4 or 80 mm receipt, invoice or payment receipt, amount in words, payment details); new letterhead and footer on all PDFs; Today export with period, sections and filters; Call and WhatsApp taps counted per team member with repeat taps ignored; follow-up reminders with remind-me times, snooze and done; redesigned dashboard boxes and menu icons; transparent logo and new app icon; lighter animations. Diet: Add food, Add recipe and My foods moved into Foods & Recipes, more tappable patients, charts, recipes and foods, premium chart and recipe PDFs with medico-legal note.'],
    ['3.9', 'Every dashboard box opens its screen; founders kept to the Founder Hub; WhatsApp today with tabs and options (which messages, how many, inactive patients, your own wording); menu in colour-coded sections that fold away; Settings as tiles with a Google Sheet connection status; saved PDFs and images open automatically; six multi-colour themes (Aurora, Peacock, Sunrise, Galaxy, Tropical, Maharaja); more luxury dashboard. Diet: all 11,018 recipes in Recipes with search and filters, clickable home boxes, multi-colour themes. Data Explorer removed.'],
    ['3.8', 'Founders can be edited, disabled and enabled again (data kept) with more profile details; Data Explorer for every data sheet with search, column filters, sort, group-by, column picker, saved views and PDF / Excel export; Super Admin branding & menu (rename or switch off menu items, app name, brand and gold colours, serif or modern headings, spacing, corners, animations); much faster on big data (lists show 50 at a time, quicker search); luxury serif headings. Diet charts: 9,070 foods and 11,018 recipes with full method and nutrition, a Foods & Recipes library with filters and exports, and protein powder shakes in diet charts.'],
    ['3.7', 'Several founder profiles (profit share, monthly limit, capital in / out, profit share per founder); Founder Hub discussions saved with date, time and mode (in person, call, WhatsApp, video…), who was there, outcome and next step, with a quick note box, search and a PDF of all discussions; more Founder Hub numbers (this month vs last, money by payment mode, top products and team); easier leads: quick add, one-tap call outcome after each call, next-stage button; scrolling fixed on Settings and every screen; more luxury styling.'],
    ['3.6', 'Founder Hub (founder profile, founder vs common expenses, monthly limit, all alerts, discussions & notes, key numbers); expenses split into Common and Founder; alerts bell on every screen; Ads report (spend, leads from sources or typed in, cost per lead, ROI); leads board view, bulk select, paste import, tags, lead score, WhatsApp templates, lost reason, auto-assign; Settings in tabs with lead, reminder, auto sign-out and message options; quick Admin / Super Admin login buttons; 7 more themes; no zoom or sideways scroll; luxury cards and new dashboard; Follow us handles on every PDF and image.'],
    ['3.5', 'Patient invoices (PDF and WhatsApp) with invoice numbers and GST; Marketing login role; Marketing Hub with lead sources, campaigns with cost per lead and ROI, content ideas with trending ideas, a 7-day posting plan and hashtag sets; Team Desk with tasks, attendance (fills paid days) and monthly targets; OPD clinic picker; product names in What you sell; a Settings card to choose what shows on each dashboard; step-by-step recipe PDFs; smoother lists and animations.'],
    ['3.4', 'Five themes with light / dark mode and a new card look; menu search and quick actions; your own product types (add or delete) and no starter injections, protein or diet plans; multiple OPD clinics; Customize on every summary screen to show or hide any card or box; WhatsApp today card; lead daily summary and follow-up reminders; social counts without API keys.'],
    ['3.3', 'Services and GLP-1 Success Support packages (1 week to 3 months) come first; injections, protein and diet support can be switched off in Settings; View only role; OPD slip PDF from any appointment; YouTube and Instagram counts in Content; profit card with founder, product and all-time figures; dashboard cards can be hidden; salary per month or per working day and incentive as fixed ₹ or % of the sale.'],
    ['3.0', 'Leads CRM for the front desk with follow-ups, history and conversion to OPD appointments; personal logins for every team member plus a new Admin role; editable role permissions; Today Summary with order-required alerts and PDF / A4 image export; injection kit auto-deducted from stock (travel bag, ice gel, swabs, needles); personal incentive rates and pay mode per team member; stock alerts on/off; patient edit and delete; "+ Add new" options everywhere; services for appointments; month-wise view; report filters; activity log of every change; full redesign with animations.'],
    ['2.0', 'Logins for Super Admin, Manager and Front Desk; OPD appointments (₹1000, clinic visit or online); PDF and Excel export on every screen; renewal alert at 75 days; new design; auto refresh; Android back button fix; AI scanner removed.'],
    ['1.1', 'All data stored in The Prime Fit Google Sheet and shared across devices, with conflict handling and offline use.'],
    ['1.0', 'First release: dashboard, team, sales entry, products, protein and diet support sales, inventory, purchases, incentives, salary, expenses, renewals, reports and Google Sheets tabs.'],
  ];
  SCREENS.about = () => `<section class="hero about-hero"><img src="../img/icon-192.png" alt="" width="64" height="64"><div><b style="font-size:22px">The Prime Fit Admin ${APP_VERSION}</b><small>${esc(set().clinic)}</small></div></section>
    <section class="card"><h2><span class="ic">${svg('<path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>')}</span>What's new</h2>
      <ol class="timeline big">${CHANGELOG.map(([v, t]) => `<li><span class="t-ic">${v}</span><div><b>Version ${v}</b><span>${esc(t)}</span></div></li>`).join('')}</ol></section>
    <section class="card credit-card"><h2><span class="ic gold">${svg('<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/>')}</span>Credits</h2>
      <p style="margin:0"><b>Developer: Aamir Sk</b><br>The Prime Fit Digital Marketing Team</p>
      <p class="hint">The Prime Fit · www.theprimefit.in</p></section>`;

  // OPD appointments
  let apptView = 'day';
  let apptDay = '';
  const apptF = { status: '', mode: '', pay: '', q: '', service: '' };
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const addDays = (iso, n) => { const [y, m, d] = iso.split('-').map(Number); return A.isoDate(new Date(y, m - 1, d + n)); };
  const time12 = (t) => { if (!t) return '—'; const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
  const statusBadge = (s) => `<span class="badge ${{ booked: 'info', completed: 'ok', cancelled: 'bad', noshow: 'warn' }[s]}">${A.APPT_STATUS[s]}</span>`;
  const modeBadge = (m) => `<span class="badge ${m === 'online' ? 'violet' : 'teal'}">${m === 'online' ? 'Online' : 'Clinic'}</span>`;
  const payBadge = (a) => (a.status === 'cancelled' ? '' : a.paid ? `<span class="badge ok">Paid${a.payMethod ? ` · ${esc(a.payMethod)}` : ''}</span>` : '<span class="badge warn">Unpaid</span>');
  function filteredAppts() {
    const r = apptView === 'day' ? { from: apptDay, to: apptDay } : range();
    const q = apptF.q.toLowerCase();
    return admin.appointmentsIn(r).filter((a) => (!apptF.status || a.status === apptF.status) && (!apptF.mode || a.mode === apptF.mode) && (!apptF.service || a.service === apptF.service)
      && (!apptF.doctor || a.doctorId === apptF.doctor) && (!apptF.clinic || a.clinicId === apptF.clinic)
      && (!apptF.pay || (apptF.pay === 'paid' ? a.paid : !a.paid && a.status !== 'cancelled'))
      && (!q || `${a.patientName} ${a.mobile} ${a.notes}`.toLowerCase().includes(q)));
  }
  SUBS.appointments = () => `Consultation fee ${inr(set().consultFee)} · Clinic visit or online`;
  SCREENS.appointments = () => {
    const today = admin.today();
    if (!apptDay) apptDay = today;
    const list = filteredAppts();
    const st = admin.appointmentStats(apptView === 'day' ? { from: apptDay, to: apptDay } : range());
    const counts = {};
    admin.appointmentsIn({ from: addDays(today, -3), to: addDays(today, 13) }).forEach((a) => { if (a.status !== 'cancelled') counts[a.date] = (counts[a.date] || 0) + 1; });
    const strip = Array.from({ length: 17 }, (_, i) => addDays(today, i - 3)).map((d) => {
      const dt = new Date(`${d}T00:00:00`);
      return `<button type="button" data-apptday="${d}" class="${d === apptDay ? 'on' : ''}"><small>${d === today ? 'Today' : DAYS[dt.getDay()]}</small><b>${dt.getDate()}</b><i>${counts[d] ? counts[d] : ''}</i></button>`;
    }).join('');
    const filters = `<div class="filters"><div class="row">
      <input type="search" data-afilter="q" placeholder="Search patient or mobile" value="${esc(apptF.q)}">
      <select data-afilter="status" aria-label="Status">${opt('', 'All statuses', apptF.status)}${Object.entries(A.APPT_STATUS).map(([k, l]) => opt(k, l, apptF.status)).join('')}</select>
      <select data-afilter="mode" aria-label="Mode">${opt('', 'Clinic & online', apptF.mode)}${Object.entries(A.APPT_MODES).map(([k, l]) => opt(k, l, apptF.mode)).join('')}</select>
      <select data-afilter="service" aria-label="Service">${opt('', 'All services', apptF.service)}${set().lists.services.map((x) => opt(x, x, apptF.service)).join('')}</select>
      ${S().doctors.length ? `<select data-afilter="doctor" aria-label="Doctor">${opt('', 'All doctors', apptF.doctor || '')}${S().doctors.map((x) => opt(x.id, x.name, apptF.doctor || '')).join('')}</select>` : ''}
      ${(set().clinics || []).length > 1 ? `<select data-afilter="clinic" aria-label="Clinic">${opt('', 'All clinics', apptF.clinic || '')}${set().clinics.map((c) => opt(c.id, c.name, apptF.clinic || '')).join('')}</select>` : ''}
      <select data-afilter="pay" aria-label="Payment">${opt('', 'Paid & unpaid', apptF.pay)}${opt('paid', 'Paid', apptF.pay)}${opt('unpaid', 'Unpaid', apptF.pay)}</select>
    </div></div>`;
    const cards = list.map((a) => `<div class="appt st-${a.status}" data-act="appt" data-id="${a.id}" role="button" tabindex="0">
        <div class="appt-time"><b>${time12(a.time).replace(/ (AM|PM)/, '')}</b><small>${a.time ? (Number(a.time.slice(0, 2)) < 12 ? 'AM' : 'PM') : 'Any time'}</small></div>
        <div class="appt-main"><b>${esc(a.patientName)}</b>${a.service || admin.doctorName(a) ? `<small class="svc">${esc([admin.doctorName(a), a.service].filter(Boolean).join(' · '))}</small>` : ''}<div class="meta">${modeBadge(a.mode)}${a.clinicName && (set().clinics || []).length > 1 ? `<span class="badge teal">${esc(a.clinicName)}</span>` : ''}${statusBadge(a.status)}${apptView === 'list' ? `<span class="badge">${fdate(a.date)}</span>` : ''}</div></div>
        <div class="appt-side"><b>${inr(a.fee)}</b>${payBadge(a)}</div></div>`).join('');
    return `<div class="toolbar"><div class="seg">${[['day', 'Day view'], ['list', 'All appointments']].map(([k, l]) => `<button type="button" data-apptview="${k}" class="${apptView === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <span class="grow"></span>${exportBtns('appointments')}<button class="btn primary" data-act="new-appt">${svg('<path d="M12 5v14M5 12h14"/>')}New appointment</button></div>
      <div class="clinic-pick" role="group" aria-label="Clinic"><small>Clinic</small>${activeClinics().length > 1 ? `<button type="button" data-clinicpick="" class="${!apptF.clinic ? 'on' : ''}">All clinics</button>` : ''}${activeClinics().map((c) => `<button type="button" data-clinicpick="${c.id}" class="${apptF.clinic === c.id || activeClinics().length === 1 ? 'on' : ''}">${svg('<path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>')}${esc(c.name)}${((st.byClinic || []).find((x) => x.id === c.id) || {}).count ? `<i>${(st.byClinic.find((x) => x.id === c.id)).count}</i>` : ''}</button>`).join('')}${readOnly() ? '' : '<button type="button" class="add" data-act="clinic-add">+ Clinic</button>'}</div>
      ${apptView === 'day' ? `<div class="date-strip">${strip}</div><div class="toolbar"><input type="date" data-apptdate value="${esc(apptDay)}" aria-label="Pick a date" style="max-width:190px"><b>${apptDay === today ? 'Today · ' : ''}${fdate(apptDay)}</b></div>`
        : `<div class="toolbar">${periodBar()}</div>`}
      <div class="kpis" style="margin-bottom:14px">${kpi('Appointments', num(st.total - st.cancelled))}${kpi('Clinic', num(st.clinic), '', 'teal')}${kpi('Online', num(st.online), '', 'violet')}${kpi('Waiting', num(st.booked), '', 'gold')}${kpi('Fees collected', inr(st.fees), `${st.unpaid} unpaid`, 'good')}</div>
      ${filters}
      <div class="appt-list">${cards || `<div class="card empty">${svg(ICON_CAL)}No appointments${apptView === 'day' ? ' on this day' : ' for this selection'}.<br><br><button class="btn primary" data-act="new-appt">Book an appointment</button></div>`}</div>
      ${clinicsCard()}`;
  };
  const activeClinics = () => (set().clinics || []).filter((c) => !c.disabled);
  let apptClinic = '';
  // Themes (per device, shared with the diet charts through localStorage).
  const THEMES = [['teal', 'Prime Teal', '#015b53', '#1fa38c'], ['midnight', 'Midnight', '#1e3a8a', '#3b82f6'], ['royal', 'Royal', '#5b21b6', '#c9a227'], ['emerald', 'Emerald', '#047857', '#10b981'], ['charcoal', 'Charcoal Gold', '#2c2e2f', '#c9a227'], ['onyx', 'Onyx Gold', '#0b0b0c', '#d4af37'], ['rose', 'Rose Gold', '#9f1239', '#e8a598'], ['sapphire', 'Sapphire', '#0f2a5f', '#60a5fa'], ['ocean', 'Ocean', '#0e7490', '#22d3ee'], ['plum', 'Plum', '#6b2147', '#d18fb5'], ['sunset', 'Sunset', '#c2410c', '#f59e0b'], ['forest', 'Forest', '#14532d', '#84cc16'], ['aurora', 'Aurora', '#0f766e', '#7c3aed', '#db2777'], ['peacock', 'Peacock', '#0b4f6c', '#1d4ed8', '#d4af37'], ['sunrise', 'Sunrise', '#be123c', '#f97316', '#f59e0b'], ['galaxy', 'Galaxy', '#312e81', '#9333ea', '#06b6d4'], ['tropical', 'Tropical', '#047857', '#0891b2', '#84cc16'], ['maharaja', 'Maharaja', '#7f1d1d', '#d4af37', '#065f46']];
  const curTheme = () => document.documentElement.dataset.theme || 'teal';
  const curMode = () => document.documentElement.dataset.mode || 'auto';
  const themeHtml = () => `<div class="theme-swatches">${THEMES.map(([k, l, a, b, c]) => `<button type="button" data-theme-pick="${k}" class="${curTheme() === k ? 'on' : ''}"><i style="background:linear-gradient(135deg, ${a}, ${b}${c ? ` 55%, ${c}` : ''})"></i>${l}${c ? '<small class="multi">Multi-colour</small>' : ''}</button>`).join('')}</div>
    <div class="seg" style="margin-top:12px">${[['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => `<button type="button" data-mode-pick="${k}" class="${curMode() === k ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  function setTheme(theme, mode) {
    const d = document.documentElement;
    if (theme) { d.dataset.theme = theme; try { localStorage.setItem('primefit.theme', theme); } catch (_) { /* ignore */ } }
    if (mode) { d.dataset.mode = mode; try { localStorage.setItem('primefit.mode', mode); } catch (_) { /* ignore */ } }
    const meta = document.querySelector('meta[name=theme-color]'); const t = THEMES.find((x) => x[0] === d.dataset.theme);
    if (meta && t) meta.content = t[2];
    $$('[data-theme-pick]').forEach((b) => b.classList.toggle('on', b.dataset.themePick === d.dataset.theme));
    $$('[data-mode-pick]').forEach((b) => b.classList.toggle('on', b.dataset.modePick === d.dataset.mode));
  }
  function clinicForm(c) {
    openForm({
      title: c ? `Edit ${c.name}` : 'Add clinic',
      fields: [
        { name: 'name', label: 'Clinic name', required: true, value: c ? c.name : '', placeholder: 'The Prime Fit · Andheri' },
        { name: 'phone', label: 'Phone', type: 'tel', value: c ? c.phone : '' },
        { name: 'address', label: 'Address', value: c ? c.address : '', span: true },
        { name: 'timings', label: 'OPD timings', value: c ? c.timings || '' : '', placeholder: 'Mon–Sat 10 am – 7 pm', span: true },
        ...(c ? [{ name: 'disabled', label: 'Closed (hide from new bookings)', type: 'checkbox', value: !!c.disabled, span: true }] : []),
      ],
      onSubmit: (v) => { admin.saveClinic({ ...(c ? { id: c.id } : {}), ...v }); return c ? 'Clinic saved' : 'Clinic added'; },
    });
  }
  function clinicsCard() {
    const list = set().clinics || [];
    return `<div class="card"><h2><span class="ic teal">${svg('<path d="M3 21h18M5 21V8l7-5 7 5v13M10 21v-5h4v5M12 8v4M10 10h4"/>')}</span>OPD clinics<span class="sp"></span>${readOnly() ? '' : '<button class="btn sm primary" data-act="clinic-add">+ Add clinic</button>'}</h2>
      <div class="doc-list">${list.map((c) => { const n = S().appointments.filter((a) => a.clinicId === c.id && a.status !== 'cancelled').length; return `<div class="doc-card ${c.disabled ? 'off' : ''}"><div class="doc-av">${svg('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>')}</div>
        <div class="doc-main"><b>${esc(c.name)}</b><small>${esc([c.address, c.phone, c.timings].filter(Boolean).join(' · ') || 'Add the address and phone')}</small></div>
        <div class="doc-side"><b>${num(n)}</b><small>visits</small><span class="acts"><button class="btn xs" data-act="clinic-edit" data-id="${c.id}">Edit</button>${canDelete() && list.length > 1 ? ` <button class="btn xs danger" data-act="clinic-del" data-id="${c.id}">Delete</button>` : ''}</span></div></div>`; }).join('')}</div></div>`;
  }
  function apptForm(a, pre) {
    const v = a || { mode: 'clinic', fee: set().consultFee, date: apptDay || admin.today(), time: '', paid: false, ...(pre || {}) };
    const patients = S().patients.map((p) => `<option value="${esc(p.name)}">${esc(p.mobile || '')}</option>`).join('');
    openForm({
      title: a ? 'Edit appointment' : 'New OPD appointment',
      submitLabel: a ? 'Save changes' : 'Book appointment',
      html: `<div class="grid">
        <label class="f">Patient name<input id="ap-name" list="ap-patients" value="${esc(v.patientName || '')}" autocomplete="off"></label>
        <datalist id="ap-patients">${patients}</datalist>
        <label class="f">Mobile<input id="ap-mobile" type="tel" inputmode="tel" value="${esc(v.mobile || '')}"></label>
        <label class="f">Date<input id="ap-date" type="date" value="${esc(v.date)}"></label>
        <label class="f">Time<input id="ap-time" type="time" value="${esc(v.time)}"></label>
        <label class="f">Doctor<select id="ap-doctor">${opt('', S().doctors.length ? 'No doctor selected' : 'No doctors yet', v.doctorId || '')}${S().doctors.filter((x) => !x.disabled || x.id === v.doctorId).map((x) => opt(x.id, `${x.name}${x.speciality ? ` · ${x.speciality}` : ''}`, v.doctorId || '')).join('')}<option value="__newdoc__">+ Add doctor…</option></select></label>
        <label class="f">Treatment / service (optional)${listSelect('services', 'id="ap-service"', v.service, 'No service selected')}</label></div>
        <div class="mode-pick">
          <label><input type="radio" name="ap-mode" value="clinic" ${v.mode === 'clinic' ? 'checked' : ''}><span class="mi">${svg('<path d="M3 21h18M5 21V8l7-5 7 5v13M10 21v-5h4v5M12 8v4M10 10h4"/>')}</span>Clinic visit</label>
          <label><input type="radio" name="ap-mode" value="online" ${v.mode === 'online' ? 'checked' : ''}><span class="mi">${svg('<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>')}</span>Online</label>
        </div>
        <div class="grid">
        <label class="f">Consultation fee (₹)<input id="ap-fee" type="number" min="0" value="${esc(v.fee)}"></label>
        <label class="f" id="ap-clinic-wrap" ${v.mode === 'clinic' && activeClinics().length ? '' : 'hidden'}>Clinic<select id="ap-clinic">${activeClinics().map((c) => opt(c.id, c.name, v.clinicId || apptF.clinic || apptClinic || activeClinics()[0].id)).join('')}</select></label>
        <label class="f" id="ap-link-wrap" ${v.mode === 'online' ? '' : 'hidden'}>Online meeting link<input id="ap-link" value="${esc(v.link || '')}" placeholder="Google Meet / Zoom / WhatsApp video"></label>
        <label class="check span"><input type="checkbox" id="ap-paid" ${v.paid ? 'checked' : ''}> Fee paid</label>
        <label class="f" id="ap-method-wrap" ${v.paid ? '' : 'hidden'}>Payment method${listSelect('payMethods', 'id="ap-method"', v.payMethod || 'Cash')}</label>
        <label class="f span">Notes<textarea id="ap-notes" rows="2" placeholder="Complaint, reference, follow-up…">${esc(v.notes || '')}</textarea></label></div>`,
      onSubmit: () => {
        const mode = ($('input[name=ap-mode]:checked') || {}).value;
        const input = {
          id: a ? a.id : undefined, patientName: $('#ap-name').value, mobile: $('#ap-mobile').value, date: $('#ap-date').value, time: $('#ap-time').value,
          mode, clinicId: $('#ap-clinic') ? $('#ap-clinic').value : '', fee: $('#ap-fee').value, link: $('#ap-link').value, notes: $('#ap-notes').value, paid: $('#ap-paid').checked, service: $('#ap-service').value,
          doctorId: $('#ap-doctor').value === '__newdoc__' ? '' : $('#ap-doctor').value,
          payMethod: $('#ap-paid').checked ? $('#ap-method').value : '', by: a ? a.by : me.name,
        };
        // Booked from a lead: the lead is converted and linked to the appointment.
        const saved = pre && pre.leadId ? admin.convertLead(pre.leadId, input).appointment : admin.saveAppointment(input);
        apptDay = saved.date;
        return a ? 'Appointment updated' : `Booked: ${saved.patientName}, ${fdate(saved.date)} ${time12(saved.time)}`;
      },
    });
    const body = $('#modal-body');
    body.addEventListener('change', (e) => {
      if (e.target.name === 'ap-mode') { $('#ap-link-wrap').hidden = e.target.value !== 'online'; $('#ap-clinic-wrap').hidden = e.target.value !== 'clinic' || !activeClinics().length; }
      if (e.target.id === 'ap-paid') $('#ap-method-wrap').hidden = !e.target.checked;
      if (e.target.id === 'ap-doctor') {
        if (e.target.value === '__newdoc__') {
          // Quick add: name (and fee) only; the full profile can be filled in under Doctors.
          const name = (window.prompt('New doctor name') || '').trim();
          if (name) {
            try { const dr = admin.saveDoctor({ name }); e.target.insertBefore(new Option(dr.name, dr.id), e.target.querySelector('option[value="__newdoc__"]')); e.target.value = dr.id; } catch (err) { toast(err.message, true); e.target.value = ''; }
          } else e.target.value = '';
        }
        const dr = admin.doctor(e.target.value);
        if (dr && dr.fee != null) $('#ap-fee').value = dr.fee;
      }
      if (e.target.id === 'ap-name' && !$('#ap-mobile').value) {
        const p = S().patients.find((x) => x.name.toLowerCase() === e.target.value.trim().toLowerCase());
        if (p) $('#ap-mobile').value = p.mobile || '';
      }
    });
  }
  function waLink(mobile, text) {
    const ph = String(mobile || '').replace(/\D/g, '');
    if (!ph) return '';
    return `https://wa.me/${ph.length === 10 ? '91' + ph : ph}?text=${encodeURIComponent(text)}`;
  }
  // OPD slip PDF for one appointment; the token is its place in that day's list.
  function opdSlip(id) {
    const a = admin.appointment(id);
    if (!a) return;
    const st = set();
    const day = S().appointments.filter((x) => x.date === a.date && x.status !== 'cancelled').sort((x, y) => (x.time || '99').localeCompare(y.time || '99') || x.created - y.created);
    const p = (S().patients || []).find((x) => x.id === a.patientId) || {};
    try {
      const name = X.opdSlip({
        clinic: a.clinicName && (st.clinics || []).length > 1 ? `${st.clinic} · ${a.clinicName}` : st.clinic,
        address: (admin.clinic(a.clinicId) || {}).address || '', phone: (admin.clinic(a.clinicId) || {}).phone || st.phone, website: st.website, instagram: st.instagram ? '@' + String(st.instagram).replace(/\/+$/, '').split('/').pop() : '',
        token: String(day.findIndex((x) => x.id === a.id) + 1 || '-'), date: fdate(a.date), time: a.time ? time12(a.time) : '', slipNo: a.id.slice(-6).toUpperCase(),
        patient: a.patientName, mobile: a.mobile, age: p.age || '', gender: p.gender || '', patientId: (a.patientId || '').slice(-6).toUpperCase(),
        doctor: admin.doctorName(a), mode: A.APPT_MODES[a.mode], service: a.service, fee: inr(a.fee), payment: a.paid ? `Paid${a.payMethod ? ` · ${a.payMethod}` : ''}` : 'Not paid',
        notes: a.notes, filename: `OPD-slip-${String(a.patientName || 'patient').replace(/[^\w]+/g, '-')}-${a.date}`,
      });
      toast(`Saved ${name}`);
    } catch (err) { toast(err.message, true); }
  }
  function apptDetail(id) {
    const a = admin.appointment(id);
    if (!a) return;
    const msg = `Namaste ${a.patientName}, your ${a.mode === 'online' ? 'online consultation' : 'clinic visit'} with ${admin.doctorName(a) ? `${admin.doctorName(a)}, ` : ''}${set().clinic} is on ${fdate(a.date)}${a.time ? ` at ${time12(a.time)}` : ''}. Consultation fee ${inr(a.fee)}.${a.link ? ` Join: ${a.link}` : ''}`;
    const wa = waLink(a.mobile, msg);
    const hist = S().appointments.filter((x) => x.patientId === a.patientId && x.id !== a.id).length;
    const b = (act, label, cls) => `<button type="button" class="btn ${cls || ''}" data-act="${act}" data-id="${a.id}">${label}</button>`;
    openForm({
      title: a.patientName, submitLabel: false,
      html: `<div class="meta" style="display:flex;gap:6px;flex-wrap:wrap">${modeBadge(a.mode)}${statusBadge(a.status)}${payBadge(a)}</div>
        <dl class="detail-list">
          <div><dt>Date & time</dt><dd>${fdate(a.date)} · ${time12(a.time)}</dd></div>
          ${a.clinicName ? `<div><dt>Clinic</dt><dd>${esc(a.clinicName)}</dd></div>` : ''}
          <div><dt>Mobile</dt><dd>${a.mobile ? `<a href="tel:${esc(a.mobile)}">${esc(a.mobile)}</a>` : '—'}</dd></div>
          ${admin.doctorName(a) ? `<div><dt>Doctor</dt><dd>${esc(admin.doctorName(a))}</dd></div>` : ''}
          ${a.service ? `<div><dt>Treatment / service</dt><dd>${esc(a.service)}</dd></div>` : ''}
          <div><dt>Consultation fee</dt><dd>${inr(a.fee)}</dd></div>
          ${a.link ? `<div><dt>Meeting link</dt><dd><a href="${esc(a.link)}" target="_blank" rel="noopener">${esc(a.link)}</a></dd></div>` : ''}
          ${a.notes ? `<div><dt>Notes</dt><dd>${esc(a.notes)}</dd></div>` : ''}
          <div><dt>Earlier appointments</dt><dd>${hist}</dd></div>
        </dl>
        <div class="quick">
          ${a.status !== 'completed' ? b('appt-complete', '✓ Completed', 'success') : ''}
          ${!a.paid && a.status !== 'cancelled' ? b('appt-pay', '₹ Mark paid', 'primary') : ''}
          ${a.status === 'booked' ? b('appt-noshow', 'No-show') : ''}
          ${a.status !== 'cancelled' ? b('appt-cancel', 'Cancel', 'danger') : b('appt-restore', 'Restore booking')}
          ${wa ? `<a class="btn" href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
          ${b('opd-slip', 'OPD slip (PDF)')}
          ${b('appt-edit', 'Edit')}
          ${canDelete() ? b('appt-del', 'Delete', 'danger') : ''}
        </div>`,
    });
  }

  // New / edit sale
  let saleType = 'service';
  SCREENS.sell = () => {
    const e = params.edit ? S().sales.find((x) => x.id === params.edit) : null;
    const pre = e || params.prefill || {};
    if (e) saleType = e.type;
    else if (pre.type) saleType = pre.type;
    else if (!saleTypes().some(([k]) => k === saleType)) saleType = (saleTypes()[0] || ['service'])[0];
    const t = saleType;
    if (!activeMembers().length) return `<div class="card"><h2>Add your team first</h2><p>Every sale needs a reference team member for incentives.</p><button class="btn primary" data-act="add-member">Add team member</button></div>`;
    const products = t === 'diet'
      ? set().dietPlans.filter((p) => !p.disabled || p.id === pre.planId).map((p) => [p.id, `${p.name}${p.price ? ` · ${inr(p.price)}` : ''}`])
      : admin.itemsOf(t, true).filter((i) => !i.disabled || i.id === pre.itemId).map((i) => [i.id, `${i.name} · ${i.track === false ? 'no stock limit' : `stock ${admin.stockOf(i.id)}`}${i.price ? ` · ${inr(i.price)}` : ''}`]);
    const patients = S().patients.map((p) => `<option value="${esc(p.name)}">${esc(p.mobile || '')}</option>`).join('');
    return `<form class="card form-card" id="sale-form" autocomplete="off">
      ${e ? `<h2>Edit ${saleLabel(t).toLowerCase()} sale</h2>` : `<div class="seg">${saleTypes().map(([k, l]) => `<button type="button" data-saletype="${k}" class="${t === k ? 'on' : ''}">${l} Sale</button>`).join('')}</div>`}
      <div class="grid">
        <label class="f">Patient name<input name="patientName" list="patient-list" required value="${esc(pre.patientName || '')}"></label>
        <datalist id="patient-list">${patients}</datalist>
        <label class="f">Mobile number<input name="mobile" type="tel" inputmode="tel" value="${esc(pre.mobile || '')}"></label>
        ${t !== 'diet' ? `<label class="f">New / Renewal<select name="patientType">${opt('new', 'New', pre.patientType || 'new')}${opt('renewal', 'Renewal', pre.patientType)}</select></label>` : ''}
        <label class="f">${t === 'diet' ? 'Plan' : t === 'protein' ? 'Protein type' : t === 'service' ? 'Service / package' : 'Product'}<select name="${t === 'diet' ? 'planId' : 'itemId'}" required>${opt('', 'Choose…', '')}${products.map(([v, l]) => opt(v, l, t === 'diet' ? pre.planId : pre.itemId)).join('')}</select></label>
        ${t !== 'diet' ? `<label class="f">Quantity<input name="qty" type="number" min="1" step="1" value="${esc(pre.qty || 1)}"></label>` : ''}
        <label class="f">Sale amount (₹)<input name="amount" type="number" min="0" step="any" required value="${esc(pre.amount != null ? pre.amount : '')}"></label>
        <label class="f">${t === 'injection' ? 'Purchase date' : 'Date'}<input name="date" type="date" required value="${esc(pre.date || admin.today())}"></label>
      </div>
      <div class="split-row">
        <label class="f">Reference team<select name="refId" required>${memberOptions(pre.refId, 'Choose…')}</select></label>
        <label class="f">Shared reference (optional)<select name="sharedId">${memberOptions(pre.sharedId, 'None — 100% to reference')}</select></label>
        <label class="f">Shared %<input name="sharePct" type="number" min="0" max="100" step="1" value="${esc(pre.sharedId ? pre.sharePct : 50)}"><span class="hint">50 = 50-50</span></label>
      </div>
      <div class="grid">
        ${t !== 'protein' ? `<label class="f">Assigned dietitian (optional)<select name="dietitianId">${memberOptions(pre.dietitianId, 'None')}</select></label>` : ''}
        <label class="f">Payment method${listSelect('payMethods', 'name="payMethod"', pre.payMethod || 'UPI', 'Not paid yet')}</label>
        <label class="f span">Notes<textarea name="notes" rows="2">${esc(pre.notes || '')}</textarea></label>
      </div>
      <div class="summary" id="sale-summary"></div>
      <small class="err" id="sale-err"></small>
      <div class="actions">${e ? '<button type="button" class="btn" data-go="sales">Cancel</button>' : ''}<button class="btn primary" type="submit">${e ? 'Save changes' : 'Save sale'}</button></div>
    </form>`;
  };
  function saleValues() {
    const f = $('#sale-form');
    const v = Object.fromEntries(new FormData(f).entries());
    v.type = saleType;
    if (params.edit) v.id = params.edit;
    return v;
  }
  function updateSaleSummary(changed) {
    const f = $('#sale-form');
    if (!f) return;
    const v = saleValues();
    // Auto-fill the amount from the product price, and New/Renewal from the patient's history.
    if (changed && ['itemId', 'planId', 'qty'].includes(changed.name) && !f.amount.dataset.touched) {
      const price = saleType === 'diet' ? (set().dietPlans.find((p) => p.id === v.planId) || {}).price : (admin.item(v.itemId) || {}).price;
      if (price) f.amount.value = price * (saleType === 'diet' ? 1 : Number(v.qty) || 1);
    }
    if (changed && changed.name === 'amount') f.amount.dataset.touched = '1';
    if (changed && ['patientName', 'mobile'].includes(changed.name) && f.patientType && !f.patientType.dataset.touched && !params.edit) {
      const digits = (s) => String(s || '').replace(/\D/g, '').slice(-10);
      const p = S().patients.find((x) => (digits(v.mobile) && digits(x.mobile) === digits(v.mobile)) || (x.name.toLowerCase() === v.patientName.trim().toLowerCase() && !digits(v.mobile)));
      if (changed.name === 'patientName' && p && !v.mobile) f.mobile.value = p.mobile || '';
      f.patientType.value = p && admin.patientSales(p.id).length ? 'renewal' : 'new';
    }
    if (changed && changed.name === 'patientType') f.patientType.dataset.touched = '1';
    f.sharePct.disabled = !v.sharedId;
    const parts = [];
    if (v.itemId) {
      const it = admin.item(v.itemId);
      const e = params.edit && S().sales.find((x) => x.id === params.edit);
      const stock = admin.stockOf(v.itemId) + (e && e.itemId === v.itemId ? e.qty : 0);
      const qty = Number(v.qty) || 1;
      if (it.track === false) parts.push(it.days ? `Package: <b>${it.days} days</b>` : 'No stock limit');
      else parts.push(`Stock: <b class="${stock < qty ? 'err' : ''}">${stock} → ${stock - qty}</b> ${esc(it.unit)}`);
    }
    if (v.refId && (v.itemId || v.planId)) {
      const splits = admin.previewSplits({ type: saleType, itemId: v.itemId, planId: v.planId, qty: v.qty, refId: v.refId, sharedId: v.sharedId, sharePct: v.sharedId ? v.sharePct : '' });
      const total = splits.reduce((a, x) => a + x.amount, 0);
      const split = splits.map((x) => {
        const m = admin.member(x.memberId);
        return `${esc(m.name)} <b>${m.incentiveOn === false ? '₹0 (incentive off)' : inr(x.amount)}</b>`;
      });
      parts.push(`Incentive ${inr(total)}: ${split.join(' · ')}`);
    }
    if (saleType === 'injection' && v.itemId && set().kitOn !== false && set().kit.length) {
      const qty = Number(v.qty) || 1;
      parts.push(`Kit out: ${set().kit.filter((k) => admin.item(k.itemId)).map((k) => `${esc(admin.item(k.itemId).name)} −${k.qty * qty}`).join(', ')}`);
    }
    if (v.amount !== '') parts.push(`Revenue: <b>${inr(v.amount)}</b>`);
    $('#sale-summary').innerHTML = parts.join('<span>·</span>') || 'Choose a product and reference to see stock and incentive.';
  }
  AFTER.sell = () => {
    const f = $('#sale-form');
    if (!f) return;
    f.addEventListener('input', (e) => updateSaleSummary(e.target));
    f.addEventListener('change', (e) => updateSaleSummary(e.target));
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const editing = !!params.edit;
        const sale = admin.saveSale(saleValues());
        const bits = [`${sale.product} · ${inr(sale.amount)}`];
        if (sale.itemId) bits.push(`stock −${sale.qty}`);
        bits.push(`incentive ${inr(sale.incentive)}`);
        toast(`${editing ? 'Updated' : 'Saved'}: ${bits.join(', ')}`);
        if (editing) go('sales'); else { params = {}; render(); setTimeout(() => saleDone(sale), 60); }
      } catch (err) { $('#sale-err').textContent = err.message; }
    });
    updateSaleSummary();
  };

  // After a sale: invoice PDF and WhatsApp in one tap.
  function saleDone(sale) {
    const wa = waLink(sale.mobile, invoiceText(sale.id));
    openForm({
      title: 'Sale saved', submitLabel: false,
      html: `<div class="done-mark">${svg('<path d="M5 12l5 5 9-10"/>')}</div><p style="text-align:center;margin:6px 0 14px"><b>${esc(sale.patientName)}</b> · ${esc(sale.product)} · <b>${inr(sale.amount)}</b><br><span class="hint">Invoice ${esc(admin.invoiceFor(sale.id).no)}</span></p>
        <div class="quick" style="justify-content:center"><button type="button" class="btn primary" data-act="slip" data-id="${sale.id}">Sales slip</button><button type="button" class="btn" data-act="invoice" data-id="${sale.id}">Invoice</button>${wa ? `<a class="btn" href="${esc(wa)}" target="_blank" rel="noopener">Send on WhatsApp</a>` : ''}<button type="button" class="btn" data-close>New sale</button></div>`,
    });
  }
  function invoiceText(id) {
    const v = admin.invoiceFor(id);
    return `Namaste ${v.patient}, thank you for choosing ${set().clinic}.\nInvoice ${v.no} · ${fdate(v.date)}\n${v.lines.map((l) => `${l.name} × ${l.qty} = ${inr(l.amount)}`).join('\n')}\nTotal ${inr(v.total)}${v.payMethod ? ` · Paid by ${v.payMethod}` : ''}\n${set().phone || ''}`;
  }
  // Sales slip for a patient: pick the sales to include, the kind and size of slip, and what to print.
  let slipPrefs = null;
  function slipDialog(saleId, patientId, kind) {
    const st = set();
    const x = saleId ? S().sales.find((s) => s.id === saleId) : null;
    const pid = patientId || (x && x.patientId);
    const mine = S().sales.filter((s) => (pid ? s.patientId === pid : x && s.mobile === x.mobile && s.patientName === x.patientName)).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.created - a.created)).slice(0, 40);
    if (!mine.length) { toast('No sales for this patient yet', true); return; }
    const pick = x ? new Set([x.id]) : new Set(mine.filter((s) => s.date === mine[0].date).map((s) => s.id));
    const pr = slipPrefs || { kind: kind || 'slip', format: st.slipFormat || 'a5', pay: true, terms: true, disclaimer: true, words: true };
    if (kind) pr.kind = kind;
    const seg = (k, list, cur) => `<div class="seg sm" data-slipseg="${k}">${list.map(([v, l]) => `<button type="button" data-v="${v}" class="${cur === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    openForm({
      title: `Sales slip · ${mine[0].patientName}`, submitLabel: 'Make PDF', ro: true,
      html: `<div id="slip-box"><div class="slip-pick">${mine.map((s) => `<label class="slip-row"><input type="checkbox" data-slipsale="${s.id}" ${pick.has(s.id) ? 'checked' : ''}><span><b>${esc(s.product)}</b><small>${fdate(s.date)}${s.qty > 1 ? ` · × ${s.qty}` : ''} · ${s.payMethod ? esc(s.payMethod) : '<span class="bad-t">Not paid</span>'}</small></span><b class="r">${inr(s.amount)}</b></label>`).join('')}</div>
        <p class="hint" id="slip-total" style="margin:6px 0 10px"></p>
        <div class="slip-opts"><div class="f">Document${seg('kind', [['slip', 'Sales slip'], ['invoice', 'Invoice'], ['receipt', 'Payment receipt']], pr.kind)}</div>
        <div class="f">Size${seg('format', [['a5', 'A5'], ['a4', 'A4'], ['thermal', '80 mm']], pr.format)}</div></div>
        <div class="slip-checks">${[['pay', 'Payment details (UPI, bank)'], ['words', 'Amount in words'], ['terms', 'Terms'], ['disclaimer', 'Medico-legal note']].map(([k, l]) => `<label class="check"><input type="checkbox" data-slipopt="${k}" ${pr[k] !== false ? 'checked' : ''}> ${l}</label>`).join('')}</div>
        ${!(st.upi || st.accountNo) ? '<p class="hint" style="margin:6px 0 0">Add your UPI ID or bank account in Settings → Company profile & payments to print payment details.</p>' : ''}</div>`,
      onSubmit: () => {
        const ids = $$('[data-slipsale]:checked', $('#modal-body')).map((i) => i.dataset.slipsale);
        if (!ids.length) throw new Error('Tick at least one sale');
        const get = (k) => ($(`[data-slipseg="${k}"] button.on`, $('#modal-body')) || {}).dataset.v;
        const opts = { kind: get('kind') || 'slip', format: get('format') || 'a5' };
        $$('[data-slipopt]', $('#modal-body')).forEach((i) => { opts[i.dataset.slipopt] = i.checked; });
        slipPrefs = opts;
        const v = admin.slipFor(ids.reverse());
        const title = { slip: 'SALES SLIP', invoice: 'INVOICE', receipt: 'PAYMENT RECEIPT' }[opts.kind];
        const name = X.slip({ ...v, title, dateText: v.from !== v.date ? `${fdate(v.from)} to ${fdate(v.date)}` : fdate(v.date), note: st.invoiceNote || '',
          filename: `${title.replace(/ /g, '-').toLowerCase().replace(/(^|-)\w/g, (m) => m.toUpperCase())}-${v.nos[0]}-${String(v.patient || '').replace(/[^\w]+/g, '-')}` }, opts);
        return `Saved ${name}`;
      },
    });
    const sumUp = () => { const ids = new Set($$('[data-slipsale]:checked', $('#modal-body')).map((i) => i.dataset.slipsale)); const t = mine.filter((s) => ids.has(s.id)); $('#slip-total').innerHTML = t.length ? `<b>${t.length} sale${t.length > 1 ? 's' : ''}</b> · total <b>${inr(t.reduce((a, s) => a + s.amount, 0))}</b>` : 'Tick the sales to put on the slip'; };
    $('#slip-box').addEventListener('change', sumUp);
    $('#slip-box').addEventListener('click', (e) => { const b = e.target.closest('[data-slipseg] button'); if (!b) return; $$('button', b.parentElement).forEach((x) => x.classList.toggle('on', x === b)); });
    sumUp();
  }
  function invoicePdf(id) { slipDialog(id, null, 'invoice'); }
  function sampleSlip() {
    const st = set();
    try {
      toast(`Saved ${X.slip({ title: 'SALES SLIP', no: `${st.invoicePrefix || 'TPF'}-SAMPLE`, date: admin.today(), dateText: fdate(admin.today()), patient: 'Sample Patient', mobile: '98765 43210', by: me ? me.name : '',
        lines: [{ name: 'Diet Support · 3 Month', detail: 'Personal diet chart, weekly follow-ups', qty: 1, rate: 5000, amount: 5000 }, { name: 'Protein Sachets', qty: 2, rate: 100, amount: 200 }],
        total: 5200, gst: Number(st.invoiceGst) || 0, taxable: (Number(st.invoiceGst) ? Math.round((5200 / (1 + st.invoiceGst / 100)) * 100) / 100 : 5200), tax: (Number(st.invoiceGst) ? Math.round((5200 - 5200 / (1 + st.invoiceGst / 100)) * 100) / 100 : 0),
        payMethod: 'UPI', note: st.invoiceNote || '', filename: 'Sample-sales-slip' }, { format: st.slipFormat || 'a5' })}`);
    } catch (err) { toast(err.message, true); }
  }

  // Sales list
  let salesFilter = { type: '', q: '', member: '', pt: '' };
  const inR = (date, r) => !r || ((!r.from || date >= r.from) && (!r.to || date <= r.to));
  const filteredSales = () => S().sales.filter((s) => (!ownOnly() || s.splits.some((x) => x.memberId === myMember())) && (!salesFilter.type || s.type === salesFilter.type)
    && inR(s.date, range())
    && (!salesFilter.member || s.splits.some((x) => x.memberId === salesFilter.member))
    && (!salesFilter.pt || s.patientType === salesFilter.pt)
    && (!salesFilter.q || `${s.patientName} ${s.mobile} ${s.product} ${s.splits.map((x) => x.name).join(' ')}`.toLowerCase().includes(salesFilter.q.toLowerCase())))
    .sort((a, b) => (a.date === b.date ? b.created - a.created : a.date < b.date ? 1 : -1));
  SUBS.sales = () => periodLabel();
  SCREENS.sales = () => {
    const list = filteredSales();
    const rows = capList(list, 'sales').map((s) => `<tr><td>${esc(s.patientName)}<span class="sub">${fdate(s.date)}${s.mobile ? ` · ${esc(s.mobile)}` : ''}</span></td>
      <td>${typeBadge(s.type)} ${s.patientType === 'renewal' ? '<span class="badge">Renewal</span>' : '<span class="badge ok">New</span>'}</td>
      <td>${esc(s.product)}${s.qty > 1 ? ` × ${s.qty}` : ''}</td>
      <td class="r"><b>${inr(s.amount)}</b></td><td data-hm>${splitText(s)}</td><td class="r">${inr(s.incentive)}</td>
      <td class="acts"><button class="btn xs" data-act="slip" data-id="${s.id}">Slip</button> <button class="btn xs" data-act="invoice" data-id="${s.id}">Invoice</button> <button class="btn xs" data-act="edit-sale" data-id="${s.id}">Edit</button> <button class="btn xs danger" data-act="del-sale" data-id="${s.id}">Delete</button></td></tr>`);
    return `<div class="toolbar">${periodBar()}<span class="grow"></span>${exportBtns('sales')}</div>
      <div class="filters"><div class="row"><input type="search" placeholder="Search patient, mobile, product" data-filter="q" value="${esc(salesFilter.q)}">
        <select data-filter="type" aria-label="Sale type">${opt('', 'All sale types', salesFilter.type)}${Object.entries(A.SALE_TYPES).map(([k, l]) => opt(k, l, salesFilter.type)).join('')}</select>
        <select data-filter="pt" aria-label="New or renewal">${opt('', 'New & renewal', salesFilter.pt)}${opt('new', 'New patients', salesFilter.pt)}${opt('renewal', 'Renewals', salesFilter.pt)}</select>
        <select data-filter="member" aria-label="Team member">${opt('', 'All team members', salesFilter.member)}${S().team.map((m) => opt(m.id, m.name, salesFilter.member)).join('')}</select></div></div>
      <div class="kpis" style="margin-bottom:14px">${kpi('Sales', num(list.length))}${kpi('Amount', inr(list.reduce((a, s) => a + s.amount, 0)), '', 'good')}${kpi('Incentives', inr(list.reduce((a, s) => a + s.incentive, 0)), '', 'gold')}</div>
      <div class="card">${table(['Patient', 'Type', 'Product', '>Amount', '~Reference', '>Incentive', ''], rows)}${moreBtn('sales', list.length)}</div>`;
  };

  // Patients
  let patientQ = '';
  let patientStatus = '';
  function patientRows() {
    const activeFrom = A.isoDate(new Date(Date.now() - set().activeDays * 86400000));
    const apMap = new Map(); S().appointments.forEach((a) => { if (!a.patientId) return; const l = apMap.get(a.patientId); if (l) l.push(a); else apMap.set(a.patientId, [a]); });
    return S().patients.map((p) => {
      const sales = admin.patientSales(p.id);
      const appts = apMap.get(p.id) || [];
      const last = sales[sales.length - 1];
      const lastAny = [last && last.date, ...appts.map((a) => a.date)].filter(Boolean).sort().pop() || '';
      return { p, sales, appts, last, lastAny, active: !!lastAny && lastAny >= activeFrom, spent: sales.reduce((a, s) => a + s.amount, 0) + appts.reduce((a, x) => a + admin.feeEarned(x), 0) };
    }).filter((x) => (!patientQ || `${x.p.name} ${x.p.mobile}`.toLowerCase().includes(patientQ.toLowerCase()))
      && (!patientStatus || (patientStatus === 'active' ? x.active : !x.active)))
      .sort((a, b) => b.lastAny.localeCompare(a.lastAny));
  }
  SCREENS.patients = () => {
    const list = patientRows();
    const rows = capList(list, 'patients').map((x) => `<tr><td><button class="link" data-act="patient" data-id="${x.p.id}">${esc(x.p.name)}</button><span class="sub">${esc(x.p.mobile)}</span></td>
          <td class="r">${x.sales.length + x.appts.length}</td><td class="r">${inr(x.spent)}</td>
          <td>${x.lastAny ? fdate(x.lastAny) : '—'}<span class="sub">${x.last ? esc(x.last.product) : x.appts.length ? 'OPD consultation' : ''}</span></td>
          <td>${x.active ? '<span class="badge ok">Active</span>' : '<span class="badge">Inactive</span>'}</td>
          <td class="acts">${can('sell') ? `<button class="btn xs" data-act="sell-to" data-id="${x.p.id}">New sale</button>` : ''} <button class="btn xs" data-act="patient-edit" data-id="${x.p.id}">Edit</button>${canDelete() ? ` <button class="btn xs danger" data-act="patient-del" data-id="${x.p.id}">Delete</button>` : ''}</td></tr>`);
    return `<div class="filters"><div class="row"><input type="search" placeholder="Search name or mobile" data-filter="patient" value="${esc(patientQ)}">
        <select data-filter="pstatus" aria-label="Status">${opt('', 'All patients', patientStatus)}${opt('active', 'Active', patientStatus)}${opt('inactive', 'Inactive', patientStatus)}</select>
        ${exportBtns('patients')}</div></div>
      <div class="card">${table(['Patient', '>Visits', '>Total spent', 'Last visit', 'Status', ''], rows)}${moreBtn('patients', list.length)}</div>`;
  };

  // Renewals
  let renewalFilter = 'due';
  const stageLabel = (r) => { const [d1, d2] = set().renewalDays; return r.stage === d2 ? `${d2}+ days · overdue` : r.stage === d1 ? `${d1}-day alert` : `Due in ${r.dueIn} d`; };
  function renewalList() {
    const [d1, d2] = set().renewalDays;
    return admin.renewals().filter((r) => (renewalFilter === 'due' ? r.stage && !r.done
      : renewalFilter === 'd90' ? r.stage === d2 : renewalFilter === 'd60' ? r.stage === d1
        : renewalFilter === 'soon' ? !r.stage && r.dueIn <= 10 : renewalFilter === 'done' ? r.done : true));
  }
  SUBS.renewals = () => `Alert ${set().renewalDays[0]} days after the last injection`;
  SCREENS.renewals = () => {
    const [d1, d2] = set().renewalDays;
    const all = admin.renewals();
    const list = renewalList();
    const wa = (r) => {
      const link = waLink(r.mobile, `Namaste ${r.name}, this is ${set().clinic}. Your last ${r.product} was on ${fdate(r.lastDate)}. Shall we arrange your renewal?`);
      return link ? `<a class="btn xs" href="tel:${esc(r.mobile)}">Call</a> <a class="btn xs" href="${esc(link)}" target="_blank" rel="noopener">WhatsApp</a>` : '';
    };
    const rows = capList(list, 'renewals').map((r) => `<tr class="${r.done ? 'off' : ''}"><td>${esc(r.name)}<span class="sub">${esc(r.mobile)}</span></td>
      <td>${esc(r.product)}</td><td>${fdate(r.lastDate)}<span class="sub">${r.days} days ago</span></td>
      <td><span class="badge ${r.stage === d2 ? 'bad' : r.stage ? 'warn' : ''}">${stageLabel(r)}</span>${r.done ? ' <span class="badge ok">Contacted</span>' : ''}</td>
      <td data-hm>${esc(r.ref)}</td>
      <td class="acts">${wa(r)} ${r.stage ? `<button class="btn xs" data-act="renewal-done" data-id="${r.saleId}" data-stage="${r.stage}" data-done="${r.done ? '' : '1'}">${r.done ? 'Undo' : 'Contacted'}</button>` : ''} ${can('sell') ? `<button class="btn xs primary" data-act="sell-to" data-id="${r.patientId}" data-renew="1">Renew</button>` : ''}</td></tr>`);
    const count = (f) => all.filter(f).length;
    const segs = [['due', `Due (${count((r) => r.stage && !r.done)})`], ['d60', `${d1}-day`], ['d90', `${d2}+ days`], ['soon', 'Next 10 days'], ['done', 'Contacted'], ['all', 'All']];
    return `<div class="toolbar"><div class="scroll-x"><div class="seg">${segs.map(([k, l]) => `<button type="button" data-renewal="${k}" class="${renewalFilter === k ? 'on' : ''}">${l}</button>`).join('')}</div></div><span class="grow"></span>${exportBtns('renewals')}</div>
      <div class="card"><p class="hint" style="margin-top:0">An alert appears ${d1} days after a patient's last injection; after ${d2} days it shows as overdue. A new sale clears it.</p>
      ${table(['Patient', 'Product', 'Last purchase', 'Reminder', '~Reference team', ''], rows)}${moreBtn('renewals', list.length)}</div>`;
  };

  // Products
  SCREENS.products = () => {
    const inc = set().incentive;
    const itemRows = (kind) => admin.itemsOf(kind, true).map((i) => `<tr class="${i.disabled ? 'off' : ''}"><td>${esc(i.name)}</td>
      <td class="r">${i.price ? inr(i.price) : '<span class="badge warn">Set price</span>'}</td>
      <td class="r">${inr(i.incentive != null ? i.incentive : inc[kind])}${i.incentive == null ? '<span class="sub">default</span>' : ''}</td>
      <td class="r">${i.track === false ? '∞' : num(admin.stockOf(i.id))}</td><td>${i.disabled ? '<span class="badge">Disabled</span>' : '<span class="badge ok">Active</span>'}${admin.kitOf(i).length && set().kitOn !== false ? ` <span class="badge info" title="${esc(kitText(i))}">Kit</span>` : ''}</td>
      <td class="acts">${moveBtns(i.id)} <button class="btn sm" data-act="edit-product" data-id="${i.id}">Edit</button> <button class="btn sm" data-act="item-kit" data-id="${i.id}">Kit</button> <button class="btn sm" data-act="toggle-item" data-id="${i.id}">${i.disabled ? 'Enable' : 'Disable'}</button>${canDelete() ? ` <button class="btn sm danger" data-act="del-item-ask" data-id="${i.id}">Delete</button>` : ''}</td></tr>`);
    const planRows = set().dietPlans.map((p) => `<tr class="${p.disabled ? 'off' : ''}"><td>${esc(p.name)}</td>
      <td class="r">${p.price ? inr(p.price) : '<span class="badge warn">Set price</span>'}</td><td class="r">${inr(p.incentive)}</td><td></td>
      <td>${p.disabled ? '<span class="badge">Disabled</span>' : '<span class="badge ok">Active</span>'}</td>
      <td class="acts"><span class="move"><button class="btn xs" data-act="plan-up" data-id="${p.id}" aria-label="Move up">▲</button><button class="btn xs" data-act="plan-down" data-id="${p.id}" aria-label="Move down">▼</button></span> <button class="btn sm" data-act="edit-plan" data-id="${p.id}">Edit</button> <button class="btn sm" data-act="toggle-plan" data-id="${p.id}">${p.disabled ? 'Enable' : 'Disable'}</button>${canDelete() ? ` <button class="btn sm danger" data-act="del-plan" data-id="${p.id}">Delete</button>` : ''}</td></tr>`);
    const head = ['Product', '>Price', '>Incentive', '>Stock', 'Status', ''];
    const svcRows = admin.itemsOf('service', true).map((i) => `<tr class="${i.disabled ? 'off' : ''}"><td><b>${esc(i.name)}</b><span class="sub">${esc([i.days ? `${i.days} days` : '', i.includes ? 'Includes: ' + i.includes : ''].filter(Boolean).join(' · '))}</span></td>
      <td class="r"><b>${inr(i.price)}</b>${i.mrp ? `<span class="sub"><s>${inr(i.mrp)}</s> · save ${Math.round((1 - i.price / i.mrp) * 100)}%</span>` : ''}</td>
      <td class="r">${i.incentiveType === 'percent' ? `${num(i.incentive || 0)}%` : inr(i.incentive != null ? i.incentive : inc.service || 0)}</td><td class="r">∞</td>
      <td>${i.disabled ? '<span class="badge">Disabled</span>' : '<span class="badge ok">Active</span>'}</td>
      <td class="acts">${moveBtns(i.id)} <button class="btn sm" data-act="edit-product" data-id="${i.id}">Edit</button> <button class="btn sm" data-act="toggle-item" data-id="${i.id}">${i.disabled ? 'Enable' : 'Disable'}</button>${canDelete() ? ` <button class="btn sm danger" data-act="del-item-ask" data-id="${i.id}">Delete</button>` : ''}</td></tr>`);
    const off = Object.keys(A.SALE_TYPES).filter((k) => !groupOn(k)).map((k) => A.SALE_TYPES[k]);
    const types = admin.kinds();
    const typeChips = `<div class="type-list">${types.map((k, i) => `<div class="type-chip ${k.sell ? 'sell' : ''}"><b>${esc(k.name)}</b><small>${k.sell ? 'Sold' : 'Stock only'} · ${num(admin.itemsOf(k.id, true).length)} items</small>
      <span class="acts">${i ? `<button class="btn xs" data-act="kind-up" data-id="${k.id}" aria-label="Move up">▲</button>` : ''}<button class="btn xs" data-act="kind-edit" data-id="${k.id}">Edit</button>${k.id !== 'service' && canDelete() ? `<button class="btn xs danger" data-act="kind-del" data-id="${k.id}">Delete</button>` : ''}</span></div>`).join('')}</div>`;
    const kindCards = types.filter((k) => k.id !== 'service' && k.id !== 'other' && groupOn(k.id)).map((k) => `<div class="card"><h2><span class="ic violet">${svg('<path d="M4 8l8-4 8 4-8 4zM4 8v8l8 4 8-4V8M12 12v8"/>')}</span>${esc(k.name)}<span class="sp"></span><button class="btn sm" data-act="add-product" data-kind="${k.id}">+ Add ${esc(k.name.toLowerCase())}</button></h2>${admin.itemsOf(k.id, true).length ? table(head, itemRows(k.id)) : `<p class="hint" style="margin:0">No ${esc(k.name.toLowerCase())} yet. Add your first one.</p>`}</div>`).join('');
    return `<div class="toolbar"><span class="grow"></span>${exportBtns('products')}</div>
      ${off.length ? `<p class="hint">Switched off (not sold now): <b>${esc(off.join(', '))}</b>. Turn them on again in <button class="link" data-go="settings">Settings → What you sell</button>.</p>` : ''}
      ${groupOn('service') ? `<div class="card"><h2><span class="ic teal">${svg('<path d="M12 2l3 6 6 .9-4.5 4.3 1 6.3L12 16.6 6.5 19.5l1-6.3L3 8.9 9 8z"/>')}</span>Services & packages<span class="sp"></span><button class="btn sm primary" data-act="add-product" data-kind="service">+ Add service</button></h2>${table(['Service / package', '>Offer price', '>Incentive', '>Stock', 'Status', ''], svcRows)}</div>` : ''}
      ${kindCards}
      ${groupOn('diet') ? `<div class="card"><h2><span class="ic gold">${svg('<path d="M7 3v8a3 3 0 0 0 6 0V3M10 3v18M17 3c-2 2-2 6 0 8v10"/>')}</span>Diet support plans<span class="sp"></span><button class="btn sm" data-act="edit-plan">+ Add plan</button></h2>${set().dietPlans.length ? table(['Plan', '>Price', '>Incentive', '', 'Status', ''], planRows) : '<p class="hint" style="margin:0">No diet support plans yet. Add your own plans with their price and incentive.</p>'}</div>` : ''}
      <div class="card"><h2><span class="ic">${svg('<path d="M4 6h16M4 12h16M4 18h10"/>')}</span>Product types<span class="sp"></span><button class="btn sm primary" data-act="kind-add">+ Add type</button></h2>
        <p class="hint" style="margin:0 0 10px">Make your own types (Injection, Protein, Supplements, Equipment…). Sold types get their own sale tab, products card and dashboard box. Stock-only types are supplies.</p>${typeChips}</div>
      <p class="hint">Injection incentive is per pen; other products per sale. Leave a product's incentive blank to use the default from <button class="link" data-go="incentives">Incentives</button>. Changes apply to new sales only.</p>`;
  };
  const moveBtns = (id) => `<span class="move"><button class="btn xs" data-act="item-up" data-id="${id}" aria-label="Move up" title="Move up">▲</button><button class="btn xs" data-act="item-down" data-id="${id}" aria-label="Move down" title="Move down">▼</button></span>`;
  const kitText = (it) => admin.kitOf(it).filter((k) => admin.item(k.itemId)).map((k) => `${admin.item(k.itemId).name} ${k.qty}`).join(', ');
  function productForm(it, kind) {
    const k = it ? it.kind : kind;
    openForm({
      title: it ? `Edit ${it.name}` : `Add ${(A.KINDS[k] || 'product').toLowerCase()}${k === 'service' ? '' : ' product'}`,
      fields: k === 'service' ? [
        { name: 'name', label: 'Service / package name', required: true, value: it ? it.name : '', span: true, placeholder: 'GLP-1 Success Support · 1 Month' },
        { name: 'price', label: 'Offer price (₹)', type: 'number', value: it ? it.price : '' },
        { name: 'mrp', label: 'Regular price (₹)', type: 'number', value: it && it.mrp != null ? it.mrp : '', hint: 'Shown struck through' },
        { name: 'days', label: 'Length (days)', type: 'number', value: it && it.days != null ? it.days : '', hint: 'Renewal reminder 3 days before it ends' },
        { name: 'incentiveType', label: 'Incentive type', type: 'select', value: it ? it.incentiveType || 'fixed' : 'fixed', options: [['fixed', 'Fixed ₹ per sale'], ['percent', '% of sale amount']] },
        { name: 'incentive', label: 'Incentive (₹ or %)', type: 'number', value: it && it.incentive != null ? it.incentive : '', hint: `Blank = default ${inr(set().incentive.service || 0)}` },
        { name: 'includes', label: "What's included", value: it ? it.includes || '' : '', span: true, placeholder: 'Consultation · Diet guidance · WhatsApp support' },
        { name: 'track', label: 'Count stock (leave off for services)', type: 'checkbox', value: it ? it.track !== false : false, span: true },
      ] : [
        ...(k === 'injection' ? [{ name: 'brand', label: 'Brand', value: it ? it.brand : '', placeholder: 'Mounjaro' }] : []),
        { name: 'name', label: 'Name', required: true, value: it ? it.name : '', placeholder: k === 'injection' ? 'Mounjaro 7.5mg' : 'Whey protein' },
        { name: 'price', label: 'Sale price (₹)', type: 'number', value: it ? it.price : '' },
        { name: 'incentive', label: 'Incentive (₹)', type: 'number', value: it && it.incentive != null ? it.incentive : '', hint: `Blank = default ${inr((set().incentive || {})[k] || 0)}` },
        { name: 'unit', label: 'Unit', value: it ? it.unit : k === 'injection' ? 'pen' : 'sachet' },
        { name: 'lowAt', label: 'Low stock alert at', type: 'number', value: it ? it.lowAt : 2 },
        { name: 'track', label: 'Count stock (off = service / no stock limit)', type: 'checkbox', value: it ? it.track !== false : true, span: true },
      ],
      onSubmit: (v) => { admin.saveItem({ ...(it || { kind: k, category: (S().categories.find((c) => c.kind === k) || { name: k === 'service' ? 'Services' : A.KINDS[k] || 'Other' }).name }), ...v }); return 'Product saved'; },
    });
  }
  function kindForm(k) {
    openForm({
      title: k ? `Edit ${k.name}` : 'Add product type',
      fields: [
        { name: 'name', label: 'Type name', required: true, value: k ? k.name : '', placeholder: 'Injection, Protein, Supplements…', span: true },
        ...(k && k.id === 'other' ? [] : [{ name: 'sell', label: 'Sold to patients (own sale tab and dashboard box)', type: 'checkbox', value: k ? k.sell : true, span: true }]),
        ...(k ? [] : [{ name: 'incentive', label: 'Default incentive (₹ per sale)', type: 'number', value: 0 }]),
      ],
      onSubmit: (v) => { admin.saveKind({ ...(k ? { id: k.id } : {}), ...v }); return k ? 'Type saved' : `${v.name} added. Add its products below.`; },
    });
  }
  function planForm(p) {
    openForm({
      title: p ? `Edit ${p.name} plan` : 'Add diet support plan',
      fields: [
        { name: 'name', label: 'Plan name', required: true, value: p ? p.name : '', placeholder: '6 Month' },
        { name: 'price', label: 'Price (₹)', type: 'number', value: p ? p.price : '' },
        { name: 'incentive', label: 'Incentive (₹)', type: 'number', value: p ? p.incentive : 1000 },
      ],
      onSubmit: (v) => { admin.saveDietPlan({ ...(p || {}), ...v }); return 'Plan saved'; },
    });
  }

  // Inventory
  const invF = { cat: '', status: '' };
  function inventoryRows() {
    return admin.stockReport(range()).filter((r) => (!invF.cat || r.category === invF.cat)
      && (!invF.status || (invF.status === 'low' ? !r.disabled && r.current <= r.lowAt : invF.status === 'ok' ? !r.disabled && r.current > r.lowAt : r.disabled)));
  }
  SUBS.inventory = () => `Stock movement · ${periodLabel()}`;
  SCREENS.inventory = () => {
    const rep = inventoryRows();
    const cats = S().categories.map((c) => c.name);
    rep.forEach((r) => { if (!cats.includes(r.category)) cats.push(r.category); });
    const sections = cats.filter((c) => !invF.cat || c === invF.cat).map((c) => {
      const rows = rep.filter((r) => r.category === c);
      const canEdit = role === 'super' || role === 'admin' || role === 'manager';
      const catTools = canEdit && S().categories.some((x) => x.name === c) ? `<span class="cat-tools"><button class="btn xs" data-act="cat-up" data-name="${esc(c)}" title="Move category up" aria-label="Move category up">▲</button><button class="btn xs" data-act="cat-down" data-name="${esc(c)}" title="Move category down" aria-label="Move category down">▼</button><button class="btn xs" data-act="add-item" data-cat="${esc(c)}">+ Item</button><button class="btn xs" data-act="cat-rename" data-name="${esc(c)}">Rename</button><button class="btn xs danger" data-act="cat-del" data-name="${esc(c)}">Delete</button></span>` : '';
      if (!rows.length) return invF.status ? '' : `<tr class="group"><td colspan="9"><span class="cat-name">${esc(c)} <span class="hint">— no items</span></span>${catTools}</td></tr>`;
      return `<tr class="group"><td colspan="9"><span class="cat-name">${esc(c)}</span>${catTools}</td></tr>` + rows.map((r) => `<tr class="${r.disabled ? 'off' : ''}"><td>${esc(r.name)}${!r.track ? ' <span class="badge teal">Service</span>' : ''}</td>
        <td class="r">${r.track ? `<b>${num(r.current)}</b> <span class="hint">${esc(r.unit)}</span>` : '<b>∞</b> <span class="hint">no limit</span>'}</td>
        <td class="r">${num(r.opening)}</td><td class="r">${num(r.purchased)}</td><td class="r">${num(r.sold)}</td><td class="r">${r.used ? num(r.used) : '–'}</td><td class="r">${r.adjusted ? (r.adjusted > 0 ? '+' : '') + num(r.adjusted) : '–'}</td>
        <td>${r.disabled ? '<span class="badge">Disabled</span>' : !r.track ? '<span class="badge teal">Unlimited</span>' : r.orderAt != null && r.current < r.orderAt ? '<span class="badge bad">Order required</span>' : r.alertOff || set().stockAlerts === false ? '<span class="badge">Alert off</span>' : r.current <= r.lowAt ? '<span class="badge bad">Low</span>' : '<span class="badge ok">OK</span>'}</td>
        <td class="acts">${moveBtns(r.itemId)} ${r.track ? `<button class="btn xs" data-act="adjust" data-id="${r.itemId}">± Stock</button> <button class="btn xs ${r.alertOff ? '' : 'on'}" data-act="toggle-alert" data-id="${r.itemId}" title="Low-stock alert on/off">${r.alertOff ? '🔕' : '🔔'}</button> ` : ''}<button class="btn xs" data-act="item-kit" data-id="${r.itemId}" title="Items used with each one">Kit</button> <button class="btn xs" data-act="edit-item" data-id="${r.itemId}">Edit</button>${canDelete() ? ` <button class="btn xs danger" data-act="del-item-ask" data-id="${r.itemId}" aria-label="Delete">✕</button>` : ''}</td></tr>`).join('');
    });
    return `<div class="toolbar">${periodBar()}<span class="grow"></span>${exportBtns('inventory')}</div>
      <div class="filters"><div class="row">
        <select data-filter="invcat" aria-label="Category">${opt('', 'All categories', invF.cat)}${cats.map((c) => opt(c, c, invF.cat)).join('')}</select>
        <select data-filter="invstatus" aria-label="Status">${opt('', 'All items', invF.status)}${opt('low', 'Low stock only', invF.status)}${opt('ok', 'In stock', invF.status)}${opt('disabled', 'Disabled', invF.status)}</select>
        <button class="btn primary sm" data-act="add-item">+ Item</button><button class="btn sm" data-act="add-category">+ Category</button><button class="btn sm" data-go="purchase-new">+ Purchase</button>${role === 'super' || role === 'admin' ? '<button class="btn sm gold" data-act="kit">Injection kit</button>' : ''}</div></div>
      ${set().stockAlerts === false ? '<div class="alert" style="margin-bottom:12px"><b>Low-stock alerts are switched off</b><button class="btn xs" data-act="alerts-on">Turn on</button></div>' : ''}
      <div class="card"><div class="tbl-wrap"><table><thead><tr><th>Item</th><th class="r">Available</th><th class="r" data-hm="1">Opening</th><th class="r">Purchased</th><th class="r">Sold</th><th class="r" data-hm="1">Kit used</th><th class="r" data-hm="1">Adjusted</th><th>Status</th><th></th></tr></thead>
      <tbody>${sections.join('') || `<tr><td colspan="9" class="empty">No items for this selection.</td></tr>`}</tbody></table></div>
      <p class="hint">Opening = stock at the start of ${esc(periodLabel())}. Sales take stock out, each product also takes its own kit (Kit), and injections without one take the injection kit (${set().kitOn === false ? 'off' : esc(set().kit.filter((k) => admin.item(k.itemId)).map((k) => `${admin.item(k.itemId).name} ${k.qty}`).join(', '))}); purchases add stock; use ± Stock for counts, damage or samples. ▲▼ change the order, 🔔 switches an item's low-stock alert. Services have no stock limit.</p></div>`;
  };
  function itemForm(it, cat) {
    const cats = S().categories;
    openForm({
      title: it ? `Edit ${it.name}` : 'Add inventory item',
      fields: [
        { name: 'name', label: 'Item name', required: true, value: it ? it.name : cat || '' },
        { name: 'category', label: 'Category', type: 'list', list: '__categories', value: it ? it.category : cat || cats[2].name },
        { name: 'unit', label: 'Unit', value: it ? it.unit : 'pcs' },
        { name: 'opening', label: 'Opening stock', type: 'number', value: it ? it.opening : 0, hint: 'Stock you had before using this app' },
        { name: 'lowAt', label: 'Low stock alert at', type: 'number', value: it ? it.lowAt : 10 },
        { name: 'orderAt', label: '"Order required" below', type: 'number', value: it && it.orderAt != null ? it.orderAt : '', hint: 'Blank = never. Protein and Mounjaro 10/15mg start at 2.' },
        { name: 'track', label: 'Count stock (off = service / no stock limit, no opening stock)', type: 'checkbox', value: it ? it.track !== false : true, span: true },
        { name: 'alertOff', label: 'Low-stock alert off for this item', type: 'checkbox', value: it ? it.alertOff : false, span: true },
      ],
      html: it ? '<p class="hint" style="margin:0">Set prices and incentives for sellable products under Products.</p>' : '',
      onSubmit: (v) => {
        const c = cats.find((x) => x.name === v.category);
        admin.saveItem({ ...(it || {}), ...v, kind: c ? c.kind : 'other' });
        return 'Item saved';
      },
    });
    if (it && canDelete()) {
      $('#modal-foot').insertAdjacentHTML('afterbegin', `<button type="button" class="btn danger" data-act="del-item-ask" data-id="${it.id}" style="margin-right:auto">Delete</button>`);
    }
  }

  // Purchases
  let draft = null; // purchase being entered
  let purchaseQ = '';
  const gstDefault = () => (set().defaultGst != null ? set().defaultGst : 12);
  const newDraft = () => ({ vendor: '', invoiceNo: '', date: admin.today(), gstOff: false, lines: [{ itemId: '', qty: 1, rate: '', gst: gstDefault(), batch: '', expiry: '' }] });
  const draftLineTotal = (l) => admin.lineTotal(draft && draft.gstOff ? { ...l, gst: 0 } : l);
  const filteredPurchases = () => [...S().purchases].sort((a, b) => (a.date < b.date ? 1 : -1)).filter((p) => inR(p.date, range())
    && (!purchaseQ || `${p.vendor} ${p.invoiceNo} ${p.lines.map((l) => l.name).join(' ')}`.toLowerCase().includes(purchaseQ.toLowerCase())));
  SCREENS.purchases = () => {
    const list = filteredPurchases();
    const rows = list.map((p) => `<tr><td>${esc(p.vendor || 'Vendor')}<span class="sub">${fdate(p.date)}${p.invoiceNo ? ` · ${esc(p.invoiceNo)}` : ''}</span></td>
      <td>${p.lines.map((l) => `${esc(l.name)} <b>+${num(l.qty)}</b>`).join('<br>')}</td><td class="r"><b>${inr(p.total)}</b></td>
      <td class="acts"><button class="btn xs" data-act="edit-purchase" data-id="${p.id}">Edit</button> <button class="btn xs danger" data-act="del-purchase" data-id="${p.id}">Delete</button></td></tr>`);
    return `<div class="toolbar">${periodBar()}<span class="grow"></span>${exportBtns('purchases')}</div>
      <div class="filters"><div class="row"><input type="search" placeholder="Search vendor, invoice or product" data-filter="purchase" value="${esc(purchaseQ)}">
        <button class="btn primary" data-act="new-purchase">${svg('<path d="M12 5v14M5 12h14"/>')}New purchase</button></div></div>
      <div class="kpis" style="margin-bottom:14px">${kpi('Invoices', num(list.length))}${kpi('Purchase value', inr(list.reduce((a, p) => a + p.total, 0)), 'incl. GST', 'gold')}${kpi('Units in', num(list.reduce((a, p) => a + p.lines.reduce((b, l) => b + l.qty, 0), 0)), '', 'teal')}</div>
      <div class="card">${table(['Vendor / invoice', 'Stock added', '>Total', ''], rows)}</div>`;
  };
  SCREENS['purchase-new'] = () => {
    if (!draft) draft = newDraft();
    const items = S().items.filter((i) => !i.disabled || draft.lines.some((l) => l.itemId === i.id));
    const lineHtml = draft.lines.map((l, i) => `<div class="line">
      <label class="f">Product<select data-line="${i}" data-k="itemId">${opt('', 'Choose…', l.itemId)}${S().categories.map((c) => {
        const its = items.filter((x) => x.category === c.name);
        return its.length ? `<optgroup label="${esc(c.name)}">${its.map((x) => opt(x.id, x.name, l.itemId)).join('')}</optgroup>` : '';
      }).join('')}</select></label>
      <label class="f">Batch<input data-line="${i}" data-k="batch" value="${esc(l.batch)}"></label>
      <label class="f">Qty<input type="number" min="0" step="1" data-line="${i}" data-k="qty" value="${esc(l.qty)}"></label>
      <label class="f">Expiry<input data-line="${i}" data-k="expiry" value="${esc(l.expiry)}" placeholder="2027-06"></label>
      <label class="f">Rate (₹)<input type="number" min="0" step="any" data-line="${i}" data-k="rate" value="${esc(l.rate)}"></label>
      ${draft.gstOff ? '' : `<label class="f">GST % (type any)<input type="number" min="0" max="100" step="any" data-line="${i}" data-k="gst" value="${esc(l.gst)}" list="gst-rates"></label>`}
      <label class="f">Total<input disabled data-total="${i}" value="${inr(draftLineTotal(l))}"></label>
      <button type="button" class="icon-btn" data-act="del-line" data-i="${i}" aria-label="Remove line">✕</button></div>`).join('');
    return `<form class="card form-card" id="purchase-form" autocomplete="off">
      <h2>${draft.id ? 'Edit purchase' : 'Invoice details'}</h2>
      <div class="grid">
        <label class="f">Vendor name<input data-k="vendor" value="${esc(draft.vendor)}" list="vendor-list"></label>
        <datalist id="vendor-list">${[...new Set(S().purchases.map((p) => p.vendor))].map((v) => `<option value="${esc(v)}">`).join('')}</datalist>
        <label class="f">Invoice number<input data-k="invoiceNo" value="${esc(draft.invoiceNo)}"></label>
        <label class="f">Invoice date<input type="date" data-k="date" value="${esc(draft.date)}"></label>
      </div>
      <datalist id="gst-rates">${[0, 5, 12, 18, 28].map((g) => `<option value="${g}">`).join('')}</datalist>
      <label class="check"><input type="checkbox" id="gst-on" ${draft.gstOff ? '' : 'checked'}> GST on this invoice <span class="hint">(turn off for bills without GST; GST % is typed per line)</span></label>
      <div class="lines">${lineHtml}</div>
      <div><button type="button" class="btn sm" data-act="add-line">+ Add line</button></div>
      <div class="summary" id="purchase-total"></div>
      <small class="err" id="purchase-err"></small>
      <div class="actions"><button type="button" class="btn" data-act="cancel-purchase">Cancel</button><button class="btn primary" type="submit">${draft.id ? 'Save changes' : 'Add to stock'}</button></div>
    </form>`;
  };
  function purchaseTotal() {
    const total = draft.lines.reduce((a, l) => a + draftLineTotal(l), 0);
    const qty = draft.lines.reduce((a, l) => a + (l.itemId ? Number(l.qty) || 0 : 0), 0);
    const el = $('#purchase-total');
    if (el) el.innerHTML = `Stock in: <b>+${num(qty)}</b><span>·</span>Invoice total${draft.gstOff ? ' (no GST)' : ' (incl. GST)'}: <b>${inr(total)}</b>${set().purchaseExpense ? '<span>·</span>Booked as a purchase expense' : ''}`;
  }
  AFTER['purchase-new'] = () => {
    const form = $('#purchase-form');
    form.addEventListener('input', (e) => {
      const t = e.target;
      if (t.dataset.line != null) {
        draft.lines[t.dataset.line][t.dataset.k] = t.value;
        const tot = $(`[data-total="${t.dataset.line}"]`);
        if (tot) tot.value = inr(draftLineTotal(draft.lines[t.dataset.line]));
      } else if (t.dataset.k) draft[t.dataset.k] = t.value;
      purchaseTotal();
    });
    $('#gst-on').addEventListener('change', (e) => { draft.gstOff = !e.target.checked; render(); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      try { finishPurchase(); } catch (err) { $('#purchase-err').textContent = err.message; }
    });
    purchaseTotal();
  };
  function finishPurchase() {
    const p = admin.savePurchase({ ...draft, lines: draft.lines.map((l) => ({ ...l })) });
    toast(`Stock added: ${p.lines.map((l) => `${l.name} +${l.qty}`).join(', ')}`);
    draft = null;
    go('purchases');
  }

  // Team
  let teamStatus = '';
  SCREENS.team = () => {
    const PAY = { both: 'Salary + Incentive', salary: 'Salary only', incentive: 'Incentive only' };
    const rows = S().team.filter((m) => !teamStatus || (teamStatus === 'active' ? !m.disabled : m.disabled)).map((m) => {
      const acc = S().accounts.find((a) => a.memberId === m.id);
      return `<tr class="${m.disabled ? 'off' : ''}"><td>${esc(m.name)}<span class="sub">${esc(m.designation || '')}${m.mobile ? ` · ${esc(m.mobile)}` : ''}</span></td>
      <td class="r">${inr(m.salary)}</td>
      <td>${m.incentiveOn === false || m.incentiveType === 'none' ? '<span class="badge">No incentive</span>' : m.incentiveType === 'percent' ? `<span class="badge ok">${num(m.incPercent || 0)}% of sale</span>` : `<span class="badge ok">${groupOn('service') ? `Service ${inr(admin.rateFor(m, 'service'))} · ` : ''}Inj ${inr(admin.rateFor(m, 'injection'))} · Protein ${inr(admin.rateFor(m, 'protein'))}</span>`}<span class="sub">${esc((A.SALARY_TYPES || {})[m.salaryType || 'monthly'] || '')}</span></td>
      <td><span class="badge info">${PAY[m.payMode || 'both']}</span></td>
      <td>${acc ? `<span class="badge violet">${esc(A.ROLES[acc.role])} login</span>` : '<span class="hint">No login</span>'}</td>
      <td>${m.disabled ? '<span class="badge">Disabled</span>' : '<span class="badge ok">Active</span>'}</td>
      <td class="acts"><button class="btn xs" data-act="edit-member" data-id="${m.id}">Edit</button> <button class="btn xs" data-act="member-login" data-id="${m.id}">${acc ? 'Login' : '+ Login'}</button> <button class="btn xs" data-act="toggle-member" data-id="${m.id}">${m.disabled ? 'Enable' : 'Disable'}</button>${canDelete() ? ` <button class="btn xs danger" data-act="del-member" data-id="${m.id}">Delete</button>` : ''}</td></tr>`;
    });
    return `<div class="toolbar"><select data-filter="teamstatus" aria-label="Status" style="max-width:200px">${opt('', 'All members', teamStatus)}${opt('active', 'Active', teamStatus)}${opt('disabled', 'Disabled', teamStatus)}</select>
        <span class="grow"></span>${exportBtns('team')}<button class="btn primary" data-act="add-member">+ Add member</button></div>
      <div class="card">${table(['Name', '>Salary', 'Incentive per sale', 'Pay counts', '~Login', 'Status', ''], rows)}
      <p class="hint">Each person can have their own incentive rates (blank = the clinic defaults under Incentives) and their own login. “Pay counts” decides what goes into their monthly pay. Disabled members keep their history.</p></div>`;
  };
  function memberForm(m) {
    openForm({
      title: m ? `Edit ${m.name}` : 'Add team member',
      fields: [
        { name: 'name', label: 'Name', required: true, value: m ? m.name : '' },
        { name: 'designation', label: 'Designation', type: 'list', list: 'designations', blank: 'Select', value: m ? m.designation : '' },
        { name: 'mobile', label: 'Mobile', type: 'tel', value: m ? m.mobile : '' },
        { name: 'salaryType', label: 'Salary type', type: 'select', value: m ? m.salaryType || 'monthly' : 'monthly', options: Object.entries(A.SALARY_TYPES) },
        { name: 'salary', label: 'Salary (₹ per month, or per day for "per working day")', type: 'number', value: m ? m.salary : '' },
        { name: 'joiningDate', label: 'Joining date', type: 'date', value: m ? m.joiningDate : admin.today() },
        { name: 'incentiveType', label: 'Incentive type', type: 'select', value: m ? m.incentiveType || (m.incentiveOn === false ? 'none' : 'product') : 'product', options: Object.entries(A.INCENTIVE_TYPES) },
        { name: 'incPercent', label: 'Incentive % of sale amount', type: 'number', value: m && m.incPercent != null ? m.incPercent : '', hint: 'Used when the type is "% of sale amount"' },
        { name: 'incService', label: 'Incentive per service / package (₹)', type: 'number', value: m && m.incService != null ? m.incService : '', placeholder: String(set().incentive.service || 0), hint: `Blank = the package's own or default ${inr(set().incentive.service || 0)}` },
        ...(A.KINDS.injection ? [{ name: 'incInjection', label: 'Incentive per injection (₹)', type: 'number', value: m && m.incInjection != null ? m.incInjection : '', placeholder: String(set().incentive.injection || 0), hint: `Blank = default ${inr(set().incentive.injection || 0)}` }] : []),
        ...(A.KINDS.protein ? [{ name: 'incProtein', label: 'Incentive per protein sale (₹)', type: 'number', value: m && m.incProtein != null ? m.incProtein : '', placeholder: String(set().incentive.protein || 0), hint: `Blank = default ${inr(set().incentive.protein || 0)}` }] : []),
        { name: 'payMode', label: 'Monthly pay counts', type: 'select', value: m ? m.payMode || 'both' : 'both', options: [['both', 'Salary + Incentive'], ['salary', 'Salary only'], ['incentive', 'Incentive only']] },
      ],
      onSubmit: (v) => { admin.saveMember({ ...(m ? { id: m.id } : {}), ...v }); return m ? 'Team member updated' : 'Team member added'; },
    });
  }

  // Incentives
  let ledgerMember = '';
  SCREENS.incentives = () => {
    const inc = set().incentive;
    if (ownOnly()) ledgerMember = myMember();
    const ledger = admin.incentiveLedger(range()).filter((l) => !ledgerMember || l.memberId === ledgerMember);
    const totals = {};
    ledger.forEach((l) => { totals[l.name] = (totals[l.name] || 0) + l.amount; });
    return `<form class="card form-card" id="inc-form"><h2>Incentive amounts</h2>
      <div class="grid">
        ${soldKinds().map((k) => `<label class="f">${esc(k.id === 'service' ? 'Service / package' : k.name)} (per ${k.id === 'injection' ? 'pen' : 'sale'}, ₹)<input type="number" min="0" name="inc-${k.id}" value="${esc(inc[k.id] || 0)}"></label>`).join('')}
        ${set().dietPlans.map((p) => `<label class="f">Diet support ${esc(p.name)} (₹)<input type="number" min="0" name="plan-${p.id}" value="${esc(p.incentive)}"></label>`).join('')}
      </div>
      <p class="hint" style="margin:0">Single reference gets 100%. With a shared reference the incentive is split 50-50 or by the custom % on the sale, automatically. Per-product overrides are under <button type="button" class="link" data-go="products">Products</button>. New amounts apply to new sales.</p>
      <div class="actions"><button class="btn primary" type="submit">Save incentives</button></div></form>
      <div class="toolbar">${periodBar()}<select data-filter="ledger" aria-label="Team member">${opt('', 'All team', ledgerMember)}${S().team.map((m) => opt(m.id, m.name, ledgerMember)).join('')}</select><span class="grow"></span>${exportBtns('incentives')}</div>
      <div class="card"><h2>Incentive ledger</h2>
      ${Object.keys(totals).length ? `<div class="kpis" style="margin-bottom:12px">${Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([n, v]) => kpi(n, inr(v))).join('')}</div>` : ''}
      ${table(['Date', 'Team member', 'Sale', 'Patient', '>Share', '>Incentive'], ledger.map((l) => `<tr><td>${fdate(l.date)}</td><td>${esc(l.name)}</td><td>${typeBadge(l.type)} ${esc(l.product)}</td><td>${esc(l.patient)}</td><td class="r">${l.pct}%</td><td class="r">${inr(l.amount)}</td></tr>`),
        `<td colspan="5">Total</td><td class="r">${inr(ledger.reduce((a, l) => a + l.amount, 0))}</td>`)}</div>`;
  };
  AFTER.incentives = () => {
    $('#inc-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = Object.fromEntries(new FormData(e.target).entries());
      set().dietPlans.forEach((p) => { p.incentive = Number(v[`plan-${p.id}`]) || 0; });
      admin.updateSettings({ incentive: { ...set().incentive, ...Object.fromEntries(soldKinds().map((k) => [k.id, Number(v[`inc-${k.id}`]) || 0])) } });
      toast('Incentives saved');
      render();
    });
  };

  // Salary
  let salaryMonth = '';
  SCREENS.salary = () => {
    const month = salaryMonth || admin.today().slice(0, 7);
    const rows = admin.salarySheet(month);
    const posted = admin.salaryPosted(month);
    const t = (k) => rows.reduce((a, r) => a + r[k], 0);
    return `<div class="toolbar"><label class="f" style="flex-direction:row;align-items:center;gap:8px">Month <input type="month" data-filter="salary" value="${esc(month)}"></label>
      <span class="grow"></span>${exportBtns('salary')}
      <button class="btn primary" data-act="post-salary" data-month="${month}">${posted ? 'Re-book as expenses' : 'Book as expenses'}</button></div>
      <div class="card">${posted ? '<p><span class="badge ok">Booked</span> Salary and incentive for this month are in Expenses.</p>' : ''}
      ${table(['Employee', '~Pay counts', '>Salary', '>Incentive', '>Total pay'], rows.map((r) => `<tr><td>${esc(r.name)}<span class="sub">${esc(r.designation || '')}</span></td><td><span class="badge info">${{ both: 'Salary + Incentive', salary: 'Salary only', incentive: 'Incentive only' }[r.mode]}</span></td><td class="r">${inr(r.salary)}${r.salaryType === 'daily' ? `<span class="sub"><input type="number" min="0" max="31" class="days-in" data-workdays="${r.memberId}" value="${esc(r.days || '')}" aria-label="Working days"> days × ${inr(r.rate)}</span>` : r.salaryType === 'none' ? '<span class="sub">No salary</span>' : ''}</td><td class="r">${inr(r.incentive)}</td><td class="r"><b>${inr(r.total)}</b></td></tr>`),
        `<td>Total</td><td></td><td class="r">${inr(t('salary'))}</td><td class="r">${inr(t('incentive'))}</td><td class="r">${inr(t('total'))}</td>`)}
      <p class="hint">Incentive = the member's share of every sale in ${fdate(month)}. “Book as expenses” adds Salary and Incentive entries, so the dashboard profit includes them.</p></div>`;
  };

  AFTER.salary = () => {
    $$('[data-workdays]').forEach((el) => el.addEventListener('change', () => {
      admin.setWorkDays(salaryMonth || admin.today().slice(0, 7), el.dataset.workdays, el.value);
      render();
    }));
  };

  // Expenses
  let expenseCat = ''; let expenseName = ''; let expScope = '';
  const scopeOf = (e) => e.scope || (e.category === 'Founder' ? 'founder' : 'common');
  const filteredExpenses = () => S().expenses.filter((e) => inR(e.date, range()) && (!expScope || scopeOf(e) === expScope) && (!expenseCat || e.category === expenseCat) && (!expenseName || e.name === expenseName))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  SUBS.expenses = () => periodLabel();
  SCREENS.expenses = () => {
    const list = filteredExpenses();
    const fin = admin.financialReport(range());
    const sm = admin.expenseSummary(range());
    const names = [...new Set([...set().lists.expenseNames, ...S().expenses.map((e) => e.name).filter(Boolean)])];
    // Each category / name can be switched off so it is not counted in totals and profit.
    const mini = (title, rows, key) => `<section class="card"><h2>${title}</h2>${table(['Name', '>Entries', '>Total', ...(key ? ['Count'] : [])], rows.map((x) => `<tr class="${key && (key === 'cat' ? expenseCat : expenseName) === x.name ? 'sel' : ''} ${x.counted === false ? 'off' : ''}"><td>${key ? `<button class="link" data-act="exp-pick" data-key="${key}" data-name="${esc(x.name)}">${esc(x.name)}</button>` : esc(x.name)}</td><td class="r">${num(x.count)}</td><td class="r"><b>${inr(x.amount)}</b></td>${key ? `<td><button type="button" class="switch ${x.counted !== false ? 'on' : ''}" data-act="exp-count" data-on="${x.counted !== false ? 1 : 0}" data-kind="${key === 'cat' ? 'category' : 'name'}" data-name="${esc(x.name)}" aria-pressed="${x.counted !== false}" title="Count in totals and profit"><i></i></button></td>` : ''}</tr>`),
      rows.length ? `<td>Counted total</td><td class="r">${num(rows.filter((x) => x.counted !== false).reduce((a, x) => a + x.count, 0))}</td><td class="r">${inr(rows.filter((x) => x.counted !== false).reduce((a, x) => a + x.amount, 0))}</td>${key ? '<td></td>' : ''}` : '')}</section>`;
    const fx = S().expenses.filter((e) => inR(e.date, range()) && scopeOf(e) === 'founder');
    const fby = {}; fx.forEach((e) => { const k = e.name || e.category; fby[k] = fby[k] || { name: k, amount: 0, count: 0 }; fby[k].amount += e.amount; fby[k].count += 1; });
    const founders = Object.values(fby).sort((a, b) => b.amount - a.amount);
    const scopeTabs = `<div class="seg scope-seg">${[['', 'All expenses'], ['common', 'Common'], ['founder', 'Founder']].map(([k, l]) => `<button type="button" data-expscope="${k}" class="${expScope === k ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    return `<div class="toolbar">${periodBar()}<span class="grow"></span>${exportBtns('expenses')}</div>
      <div class="toolbar">${scopeTabs}<span class="grow"></span><button class="btn primary" data-act="add-expense">+ Add expense</button></div>
      <div class="kpis" style="margin-bottom:14px">${kpi('Revenue', inr(fin.revenue))}${kpi('Common expenses', inr(sm.common), 'Clinic running costs', 'teal')}${kpi('Founder expenses', inr(sm.founder), admin.founders().map((f) => f.name.split(' ')[0]).join(', ') || 'Founder', 'violet')}${kpi('Expenses counted', inr(fin.expenses), sm.notCounted ? `${inr(sm.notCounted)} not counted` : plural(sm.count, 'entry', 'entries'), 'gold')}${kpi('Profit', inr(fin.profit), 'Revenue − Expenses', fin.profit >= 0 ? 'good' : 'bad')}
        ${['Ads', 'Editing'].map((c) => { const x = sm.byCategory.find((y) => y.name === c); return kpi(`${c} expenses`, inr(x ? x.amount : 0), x ? plural(x.count, 'entry', 'entries') : '', 'gold'); }).join('')}</div>
      <div class="filters"><div class="row"><select data-filter="expense" aria-label="Category">${opt('', 'All categories', expenseCat)}${set().lists.expenseCategories.map((c) => opt(c, `${c}${fin.byCategory[c] ? ` · ${inr(fin.byCategory[c])}` : ''}`, expenseCat)).join('')}</select>
        <select data-filter="expensename" aria-label="Name">${opt('', 'All names', expenseName)}${names.map((c) => opt(c, c, expenseName)).join('')}</select>
</div></div>
      ${founders.length && expScope !== 'common' ? `<section class="card founder-card"><h2><span class="ic gold">${svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>')}</span>Founder expenses<span class="sp"></span><span class="badge">${inr(founders.reduce((a, x) => a + x.amount, 0))}</span></h2>
        <div class="founder-row">${founders.map((x) => `<div class="kpi violet"><small>${esc(x.name)}</small><b>${inr(x.amount)}</b><span>${plural(x.count, 'entry', 'entries')}</span></div>`).join('')}</div></section>` : ''}
      <p class="hint">Use the <b>Count</b> switches to leave a category or name (for example a marketing payment) out of the expense total and profit. The entries stay in the list.</p>
      <div class="cards">${mini('By category', sm.byCategory, 'cat')}${mini('By name (founder, ad platform, editor…)', sm.byName, 'name')}</div>
      ${sm.byBoth.length ? `<div class="cards">${mini('Category × name', sm.byBoth)}</div>` : ''}
      <div class="card">${table(['Category', 'Name', '~Note', 'Date', '>Amount', ''], capList(list, 'expenses').map((e) => `<tr><td>${scopeOf(e) === 'founder' ? `<span class="badge violet">${esc(fName(e.founderId) || 'Founder')}</span> ` : ''}${esc(e.category)} ${e.auto ? '<span class="badge info">Auto</span>' : ''}</td><td>${esc(e.name || '')}${admin.counted(e) ? '' : ' <span class="badge">Not counted</span>'}</td><td>${esc(e.note)}</td><td>${fdate(e.date)}</td><td class="r"><b>${inr(e.amount)}</b></td>
        <td class="acts">${e.auto ? '' : `<button class="btn xs" data-act="edit-expense" data-id="${e.id}">Edit</button> `}<button class="btn xs danger" data-act="del-expense" data-id="${e.id}">Delete</button></td></tr>`),
        `<td colspan="4">Total · ${list.length} entries</td><td class="r">${inr(list.reduce((a, e) => a + e.amount, 0))}</td><td></td>`)}${moreBtn('expenses', list.length)}</div>`;
  };
  function expenseForm(e) {
    openForm({
      title: e ? 'Edit expense' : 'Add expense',
      fields: [
        { name: 'scope', label: 'Expense type', type: 'select', value: e ? scopeOf(e) : expScope || 'common', options: [['common', 'Common (clinic) expense'], ['founder', 'Founder expense']] },
        ...(admin.founders().length ? [{ name: 'founderId', label: 'Founder (for founder expenses)', type: 'select', value: e ? e.founderId || '' : fdSel || admin.founders()[0].id, options: admin.founders().map((f) => [f.id, f.name]) }] : []),
        { name: 'category', label: 'Category', type: 'list', list: 'expenseCategories', value: e ? e.category : expenseCat || (expScope === 'founder' ? 'Founder' : 'Rent') },
        { name: 'name', label: 'Name (founder, ad platform, editor…)', type: 'list', list: 'expenseNames', value: e ? e.name || '' : expenseName, blank: 'No name' },
        { name: 'amount', label: 'Amount (₹)', type: 'number', required: true, value: e ? e.amount : '' },
        { name: 'payMethod', label: 'Paid by', type: 'list', list: 'payMethods', value: e ? e.payMethod || '' : '', blank: '—' },
        { name: 'date', label: 'Date', type: 'date', value: e ? e.date : admin.today() },
        { name: 'note', label: 'Note', value: e ? e.note : '', span: true },
        { name: 'adLeads', label: 'Leads from this ad (optional, manual)', type: 'number', value: e && e.adLeads != null ? e.adLeads : '', hint: 'For Ads: leave blank to count leads from the Leads list' },
        { name: 'noCount', label: "Don't count this entry in totals and profit", type: 'checkbox', value: e ? !!e.noCount : false, span: true },
      ],
      onSubmit: (v) => { admin.saveExpense({ ...(e ? { id: e.id } : {}), ...v }); return 'Expense saved'; },
    });
  }

  // ── Report sections (shared by the Reports screen, PDF and Excel) ─────────────
  // A section is { title, head, rows, foot, money: [col], right: [col] }. Rows hold raw values:
  // numbers stay numbers in Excel; PDF and screen format money columns as ₹.
  function sec(title, head, rows, opts) {
    const o = opts || {};
    const right = []; const money = o.money || [];
    const h = head.map((x, i) => { if (x.startsWith('>')) { right.push(i); return x.slice(1); } return x; });
    const foot = o.total ? h.map((_, i) => (i === 0 ? `Total (${rows.length})` : o.total.includes(i) ? rows.reduce((a, r) => a + (Number(r[i]) || 0), 0) : '')) : o.foot;
    return { title, head: h, rows, foot, money, right, note: o.note };
  }
  const R = {
    appointments: (list) => sec('OPD Appointments', ['Date', 'Time', 'Patient', 'Mobile', 'Doctor', 'Mode', 'Status', 'Payment', '>Fee'],
      list.map((a) => [a.date, time12(a.time), a.patientName, a.mobile, admin.doctorName(a), A.APPT_MODES[a.mode], A.APPT_STATUS[a.status], a.status === 'cancelled' ? '—' : a.paid ? `Paid ${a.payMethod || ''}`.trim() : 'Unpaid', a.fee]), { money: [8], total: [8] }),
    doctors: () => sec('Doctor Profiles', ['Doctor', 'Speciality', 'Qualification', 'Mobile', '>Fee', 'Days', 'Timing', '>Appointments', 'Status'],
      S().doctors.map((x) => [x.name, x.speciality || '', x.qualification || '', x.mobile || '', x.fee != null ? x.fee : set().consultFee, x.days || '', x.timing || '', S().appointments.filter((a) => a.doctorId === x.id && a.status !== 'cancelled' && inR(a.date, range())).length, x.disabled ? 'Disabled' : 'Active']), { money: [4] }),
    content: (list) => sec('Videos & Posts', ['Added', 'Video', 'Platform', 'Editor', 'Status', 'Scheduled', 'Posted', '>Edit Cost', 'Link'],
      list.map((c) => [c.date || '', c.title, c.platform || '', c.editor || '', A.CONTENT_STATUS[c.status], c.scheduledDate ? `${fdate(c.scheduledDate)}${c.scheduledTime ? ` ${time12(c.scheduledTime)}` : ''}` : '', c.postedDate || '', Number(c.cost) || 0, c.link || '']), { money: [7], total: [7] }),
    contentEditors: (st) => sec('Videos by Editor', ['Editor', '>Edited', '>Posted', '>Editing Cost'], st.byEditor.map((x) => [x.name, x.edited, x.posted, x.cost]), { money: [3], total: [1, 2, 3] }),
    expenseGroups: (sum) => [
      sec('Expenses by Category', ['Category', '>Entries', '>Amount'], sum.byCategory.map((x) => [x.name, x.count, x.amount]), { money: [2], total: [1, 2] }),
      ...(sum.byName.length ? [sec('Expenses by Name', ['Name', '>Entries', '>Amount'], sum.byName.map((x) => [x.name, x.count, x.amount]), { money: [2], total: [1, 2] })] : []),
    ],
    sales: (list) => sec('Sales', ['Date', 'Patient', 'Mobile', 'Type', 'New/Renewal', 'Product', '>Qty', '>Amount', 'Reference', '>Incentive'],
      list.map((s) => [s.date, s.patientName, s.mobile, saleLabel(s.type), s.patientType === 'new' ? 'New' : 'Renewal', s.product, s.qty, s.amount, s.splits.map((x) => `${x.name}${s.splits.length > 1 ? ` ${x.pct}%` : ''}`).join(' + '), s.incentive]), { money: [7, 9], total: [7, 9] }),
    patients: (list) => sec('Patients', ['Patient', 'Mobile', '>Visits', '>Total Spent', 'Last Visit', 'Status'],
      list.map((x) => [x.p.name, x.p.mobile, x.sales.length + x.appts.length, x.spent, x.lastAny, x.active ? 'Active' : 'Inactive']), { money: [3], total: [2, 3] }),
    renewals: (list) => sec('Renewals', ['Patient', 'Mobile', 'Product', 'Last Purchase', '>Days', 'Reminder', 'Reference Team', 'Contacted'],
      list.map((r) => [r.name, r.mobile, r.product, r.lastDate, r.days, stageLabel(r), r.ref, r.done ? 'Yes' : 'No'])),
    products: () => [
      ...admin.kinds().map((k) => sec(k.id === 'service' ? 'Services & Packages' : k.name, ['Product', '>Price', '>Incentive', '>Stock', 'Status'], admin.itemsOf(k.id, true).map((i) => [i.name, i.price, i.incentive != null ? i.incentive : (set().incentive || {})[k.id] || 0, i.track === false ? 'No limit' : admin.stockOf(i.id), i.disabled ? 'Disabled' : 'Active']), { money: [1, 2] })),
      sec('Diet Support Plans', ['Plan', '>Price', '>Incentive', 'Status'], set().dietPlans.map((p) => [p.name, p.price, p.incentive, p.disabled ? 'Disabled' : 'Active']), { money: [1, 2] }),
    ],
    inventory: (rows) => sec('Inventory', ['Category', 'Item', '>Available', '>Opening', '>Purchased', '>Sold', '>Kit Used', '>Adjusted', 'Status'],
      rows.map((r) => [r.category, r.name, r.current, r.opening, r.purchased, r.sold, r.used, r.adjusted, r.disabled ? 'Disabled' : r.orderAt != null && r.current < r.orderAt ? 'ORDER REQUIRED' : r.current <= r.lowAt && !r.alertOff ? 'LOW' : 'OK'])),
    leads: (list) => sec('Leads', ['Date', 'Name', 'Mobile', 'Source', 'Interested In', 'Priority', 'Status', 'Assigned To', 'Next Follow-up', 'Last Update'],
      list.map((l) => { const h = [...(l.history || [])].reverse().find((x) => ['note', 'call', 'whatsapp', 'visit'].includes(x.type)); return [l.date, l.name, l.mobile, l.source || '', l.interest || '', A.LEAD_PRIORITIES[l.priority] || '', l.status, accountName(l.assignedTo), l.followUp || '', h ? h.text : '']; })),
    leadOwners: (list) => {
      const by = {};
      list.forEach((l) => { const k = accountName(l.assignedTo) || 'Not assigned'; const o = by[k] || (by[k] = [0, 0, 0, 0]); o[0]++; if (!admin.isClosedLead(l)) o[1]++; if (['Converted', 'Appointment booked'].includes(l.status)) o[2]++; if (l.followUp && l.followUp < admin.today() && !admin.isClosedLead(l)) o[3]++; });
      return sec('Leads by Team Member', ['Person', '>Leads', '>Open', '>Converted', '>Overdue Follow-ups'], Object.entries(by).map(([k, v]) => [k, ...v]), { total: [1, 2, 3, 4] });
    },
    activity: (list) => sec('Activity Log', ['Date & Time', 'By', 'Action', 'Details'], list.map((x) => [ftime(x.at), x.by, x.action, x.detail])),
    daySales: (x) => sec('Sales', ['Patient', 'Mobile', 'Type', 'Product', '>Qty', '>Amount', 'Reference'], x.sales.map((s) => [s.patientName, s.mobile, saleLabel(s.type), s.product, s.qty, s.amount, s.splits.map((y) => `${y.name}${s.splits.length > 1 ? ` ${y.pct}%` : ''}`).join(' + ')]), { money: [5], total: [4, 5] }),
    dayAppts: (x) => sec('OPD Appointments', ['Time', 'Patient', 'Mobile', 'Doctor', 'Service', 'Status', 'Payment', '>Fee'], x.appointments.map((a) => [time12(a.time), a.patientName, a.mobile, admin.doctorName(a), a.service || '', A.APPT_STATUS[a.status], a.status === 'cancelled' ? '—' : a.paid ? `Paid ${a.payMethod || ''}`.trim() : 'Unpaid', a.fee]), { money: [7], total: [7] }),
    dayExpenses: (x) => sec('Expenses', ['Category', 'Name', 'Paid By', 'Note', '>Amount'], x.expenses.map((e) => [e.category, e.name || '', e.payMethod || '', e.note || '', e.amount]), { money: [4], total: [4] }),
    dayLeads: (x) => sec('Leads & Follow-ups', ['Name', 'Mobile', 'Source', 'Interested In', 'Status', 'Assigned To', 'Type'], [...x.leadList, ...x.followUps.filter((l) => !x.leadList.includes(l))].map((l) => [l.name, l.mobile, l.source || '', l.interest || '', l.status, accountName(l.assignedTo), x.leadList.includes(l) ? 'New lead' : 'Follow-up'])),
    dayRenewals: (x) => sec('Renewals Due', ['Patient', 'Mobile', 'Product', 'Last Purchase', '>Days', 'Reminder', 'Reference'], x.renewals.map((r) => [r.name, r.mobile, r.product, r.lastDate, r.days, stageLabel(r), r.ref])),
    dayContent: (x) => sec('Content Today', ['Video', 'Platform', 'Editor', 'Status'], [...x.posted, ...x.content.dueToday, ...x.content.overdue].map((c) => [c.title, c.platform || '', c.editor || '', c.status === 'scheduled' && c.scheduledDate < x.date ? 'OVERDUE' : A.CONTENT_STATUS[c.status]])),
    dayPurchases: (x) => sec('Purchases', ['Vendor', 'Invoice', 'Product', '>Qty', '>Total'], x.purchases.flatMap((p) => p.lines.map((l) => [p.vendor, p.invoiceNo, l.name, l.qty, l.total])), { money: [4], total: [3, 4] }),
    dayStock: (title, list) => sec(title, ['Item', 'Category', '>Stock', 'Status'], list.map((y) => [y.item.name, y.item.category, y.stock, y.item.orderAt != null && y.stock < y.item.orderAt ? 'ORDER REQUIRED' : y.stock > 0 ? 'Available' : 'Not available'])),
    purchases: (list) => sec('Purchases', ['Date', 'Vendor', 'Invoice', 'Product', '>Qty', 'Batch', 'Expiry', '>Rate', '>GST %', '>Total'],
      list.flatMap((p) => p.lines.map((l) => [p.date, p.vendor, p.invoiceNo, l.name, l.qty, l.batch, l.expiry, l.rate, l.gst, l.total])), { money: [7, 9], total: [4, 9] }),
    team: () => sec('Team', ['Name', 'Designation', 'Mobile', '>Salary', 'Incentive', 'Joining Date', 'Status'],
      S().team.filter((m) => !teamStatus || (teamStatus === 'active' ? !m.disabled : m.disabled)).map((m) => [m.name, m.designation || '', m.mobile || '', m.salary, m.incentiveOn === false ? 'Off' : 'On', m.joiningDate || '', m.disabled ? 'Disabled' : 'Active']), { money: [3], total: [3] }),
    incentives: (ledger) => sec('Incentive Ledger', ['Date', 'Team Member', 'Sale', 'Product', 'Patient', '>Share %', '>Incentive'],
      ledger.map((l) => [l.date, l.name, saleLabel(l.type), l.product, l.patient, l.pct, l.amount]), { money: [6], total: [6] }),
    salary: (month) => sec(`Salary ${fdate(month)}`, ['Employee', 'Designation', 'Pay Counts', '>Salary', '>Incentive', '>Total Pay'],
      admin.salarySheet(month).map((r) => [r.name, r.designation || '', { both: 'Salary + Incentive', salary: 'Salary only', incentive: 'Incentive only' }[r.mode], r.salary, r.incentive, r.total]), { money: [3, 4, 5], total: [3, 4, 5] }),
    expenses: (list) => sec('Expenses', ['Date', 'Category', 'Name', 'Paid By', 'Note', '>Amount'], list.map((e) => [e.date, e.category, e.name || '', e.payMethod || '', e.note || '', e.amount]), { money: [5], total: [5] }),
    teamReport: (r) => {
      const rows = admin.teamReport(r);
      const types = Object.keys(A.SALE_TYPES).filter((t) => rows.some((x) => (x.typeSales || {})[t]));
      const n = types.length;
      return sec('Team Performance', ['Team Member', '>Total Sales', '>Orders', '>New Patients', '>Renewals', ...types.map((t) => `>${A.SALE_TYPES[t]}`), '>Incentive'],
        rows.map((x) => [x.name, x.totalSales, x.orders, x.newPatients, x.renewals, ...types.map((t) => (x.typeSales || {})[t] || 0), x.incentive]),
        { money: [1, ...types.map((_, i) => 5 + i), 5 + n], total: [1, 2, 3, 4, ...types.map((_, i) => 5 + i), 5 + n] });
    },
    financial: (r) => {
      const f = admin.financialReport(r);
      return [
        sec('Revenue by Source', ['Source', '>Amount'], [...Object.entries(A.SALE_TYPES).map(([k, l]) => [`${l} sales`, f.revenueByType[k]]), ['OPD consultation fees', f.revenueByType.consultation]], { money: [1], total: [1] }),
        sec('Expenses by Category', ['Category', '>Amount'], Object.entries(f.byCategory).map(([k, v]) => [k, v]), { money: [1], total: [1] }),
        sec('Profit & Loss by Month', ['Month', '>Revenue', '>Expenses', '>Profit'], f.monthly.map((m) => [fdate(m.month), m.revenue, m.expenses, m.profit]), { money: [1, 2, 3], total: [1, 2, 3] }),
      ];
    },
  };
  const fmtCell = (s, i, v) => (s.money.includes(i) && v !== '' && v != null && !Number.isNaN(Number(v)) ? inr(v)
    : typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? fdate(v) : typeof v === 'number' ? num(v) : (v == null ? '' : v));
  const renderSec = (s) => `<div class="card"><h2>${esc(s.title)}<span class="sp"></span><span class="badge">${s.rows.length}</span></h2>${table(s.head.map((h, i) => (s.right.includes(i) ? `>${h}` : h)),
    s.rows.map((r) => `<tr>${r.map((v, i) => `<td class="${s.right.includes(i) ? 'r' : ''}">${esc(fmtCell(s, i, v))}</td>`).join('')}</tr>`),
    s.foot ? s.foot.map((v, i) => `<td class="${s.right.includes(i) ? 'r' : ''}">${esc(fmtCell(s, i, v))}</td>`).join('') : '')}</div>`;
  const dashKpis = (r) => {
    const d = admin.dashboard(r);
    return [['Total orders', num(d.sales.orders)], ['Total revenue', inr(d.sales.revenue)], ['Total expenses', inr(d.sales.expenses)], ['Net profit', inr(d.sales.profit)],
      ...(d.byType || []).filter((t) => t.amount || t.count).map((t) => [`${t.label} sales`, inr(t.amount)]), ['Consultation fees', inr(d.sales.consultation)],
      ['Appointments', num(d.appointments.total - d.appointments.cancelled)], ['Clinic / Online', `${d.appointments.clinic} / ${d.appointments.online}`],
      ['Total patients', num(d.patients.total)], ['New / Renewal', `${d.patients.new} / ${d.patients.renewal}`], ['Active patients', num(d.patients.active)],
      ['Team members', num(d.team.members)], ['Total incentives', inr(d.team.incentives)], ['Top performer', d.team.top ? d.team.top.name : '—'],
      ...(d.stockByKind || []).map((k) => [`${k.name} stock`, num(k.stock)]), ['Low stock alerts', num(d.stock.low.length)], ['Renewals due', num(d.renewalsDue)],
      ['New leads', num(d.leads.total)], ['Leads converted', `${d.leads.won} (${d.leads.conversion}%)`], ['Order required', num(d.stock.order.length)]];
  };
  const stamp = () => admin.today();
  const discussionSec = (list) => sec('Discussions', ['Date & Time', 'Mode', 'Type', 'Topic', 'What was discussed', 'With', 'Outcome / Decision', 'Next Step', 'Status'],
    list.map((n) => [`${n.date ? fdate(n.date) : fdate(A.isoDate(new Date(n.at)))}${n.time ? ` ${time12(n.time)}` : ''}`, n.mode || '', NOTE_TAGS[n.tag] || '', n.title || '', n.text || '', (n.with || []).map((x) => fName(x) || x).join(', ') + (n.place ? `${(n.with || []).length ? ' · ' : ''}${n.place}` : ''), n.outcome || '', `${n.nextStep || ''}${n.due ? ` (by ${fdate(n.due)})` : ''}`, n.done ? 'Done' : 'Open']));
  const EXPORTS = {
    dashboard: () => { const t = admin.daySummary(stamp()); return { title: 'Dashboard', subtitle: periodLabel(), kpis: dashKpis(range()),
      sections: [{ ...R.daySales(t), title: `Today's Sales (${fdate(t.date)})` }, ...R.financial(range()), ...R.expenseGroups(admin.expenseSummary(range())).slice(1),
        { ...R.inventory(admin.stockReport(null).filter((x) => !x.disabled && x.track !== false && x.current <= x.lowAt)), title: 'Low Stock Alerts' }] }; },
    doctors: () => ({ title: 'Doctor Profiles', subtitle: `Appointments in ${periodLabel()}`, sections: [R.doctors()] }),
    content: () => { const st = admin.contentStats(range()); return { title: 'Content & Posts', subtitle: periodLabel(),
      kpis: [['Total videos', num(st.total)], ['To edit', num(st.toEdit)], ['Total edited', num(st.edited)], ['Total posted', num(st.posted)], ['Remaining to post', num(st.remaining)], ['Scheduled', num(st.scheduled)]],
      sections: [R.content(filteredContent()), R.contentEditors(st)] }; },
    appointments: () => { const r = apptView === 'day' ? { from: apptDay, to: apptDay } : range(); const st = admin.appointmentStats(r); return { title: 'OPD Appointments', subtitle: apptView === 'day' ? fdate(apptDay) : periodLabel(), kpis: [['Appointments', num(st.total - st.cancelled)], ['Clinic visits', num(st.clinic)], ['Online', num(st.online)], ['Completed', num(st.completed)], ['Fees collected', inr(st.fees)], ['Unpaid', num(st.unpaid)], ['Cancelled', num(st.cancelled)], ['No-show', num(st.noshow)]], sections: [R.appointments(filteredAppts())] }; },
    sales: () => ({ title: 'Sales', subtitle: periodLabel(), sections: [R.sales(filteredSales())] }),
    patients: () => ({ title: 'Patients', subtitle: `As of ${fdate(stamp())}`, sections: [R.patients(patientRows())] }),
    renewals: () => ({ title: 'Renewal Alerts', subtitle: `Alert after ${set().renewalDays[0]} days · ${fdate(stamp())}`, sections: [R.renewals(renewalList())] }),
    products: () => ({ title: 'Products & Prices', subtitle: fdate(stamp()), sections: R.products() }),
    inventory: () => ({ title: 'Inventory', subtitle: periodLabel(), sections: [R.inventory(inventoryRows())] }),
    purchases: () => ({ title: 'Purchases', subtitle: periodLabel(), sections: [R.purchases(filteredPurchases())] }),
    team: () => ({ title: 'Team', subtitle: fdate(stamp()), sections: [R.team()] }),
    incentives: () => ({ title: 'Incentives', subtitle: periodLabel(), sections: [R.incentives(admin.incentiveLedger(range()).filter((l) => !ledgerMember || l.memberId === ledgerMember))] }),
    salary: () => { const m = salaryMonth || stamp().slice(0, 7); return { title: 'Salary', subtitle: fdate(m), sections: [R.salary(m)] }; },
    expenses: () => { const list = filteredExpenses(); const g = (c) => list.filter((e) => e.category === c).reduce((a, e) => a + e.amount, 0);
      return { title: 'Expenses', subtitle: periodLabel(), kpis: [['Total expenses', inr(list.reduce((a, e) => a + e.amount, 0))], ['Entries', num(list.length)], ['Founder', inr(g('Founder'))], ['Ads', inr(g('Ads'))], ['Editing', inr(g('Editing'))]],
        sections: [R.expenses(list), ...R.expenseGroups(admin.expenseSummary(range()))] }; },
    report: () => REPORTS[reportTab].build(),
    today: () => { const o = pendingToday ? todayXp(pendingToday) : todayXp({ period: 'day', type: '', member: '', pay: '', secs: {} }); pendingToday = null; return todayReport(o); },
    leads: () => { const list = filteredLeads(); return { title: 'Leads', subtitle: role === 'desk' ? `${me.name} · ${fdate(stamp())}` : fdate(stamp()), sections: [R.leads(list), ...(role !== 'desk' ? [R.leadOwners(list)] : []), tapSec(tapRangeOf(tapRange), myLeadFilter())] }; },
    activity: () => ({ title: 'Activity Log', subtitle: periodLabel(), sections: [R.activity(filteredLog())] }),
    founder: () => {
      const r = range(); const sm = admin.expenseSummary(r); const fin = admin.financialReport(r); const f = (fdSel && admin.founder(fdSel)) || {};
      const fx = S().expenses.filter((e) => inR(e.date, r) && scopeOf(e) === 'founder');
      return { title: `Founder Hub${f.name ? ` · ${f.name}` : ''}`, subtitle: periodLabel(),
        kpis: [['Revenue', inr(fin.revenue)], ['Net profit', inr(fin.profit)], ['Common expenses', inr(sm.common)], ['Founder expenses', inr(sm.founderAll)]],
        sections: [
          sec('Founder Expenses', ['Date', 'Category', 'Name', 'Note', '>Amount'], fx.map((e) => [e.date, e.category, e.name || '', e.note || '', e.amount]), { money: [4], total: [4] }),
          sec('Alerts', ['Area', 'Alert'], myAlerts().map((a) => [a.area, a.text])),
          sec('Founders', ['Founder', 'Title', '>Share %', '>Spent', '>Monthly Limit', '>Invested', '>Withdrawn', '>Net Capital', '>Profit Share'], admin.founderStats(r).map((x) => [x.name, x.title, x.share, x.spent, x.budget, x.invested, x.withdrawn, x.net, x.profitShare]), { money: [3, 4, 5, 6, 7, 8] }),
          discussionSec(S().notes || []),
        ] };
    },
    discussions: () => { const list = [...(S().notes || [])].filter((n) => !fdSel || !(n.with || []).length || (n.with || []).includes(fdSel)).sort((a, b) => `${b.date || ''}${b.time || ''}`.localeCompare(`${a.date || ''}${a.time || ''}`));
      return { title: `Founder Discussions${fdSel ? ` · ${fName(fdSel)}` : ''}`, subtitle: `${plural(list.length, 'discussion')} · ${admin.founders().map((f) => f.name).join(', ') || set().clinic}`,
        kpis: [['Discussions', num(list.length)], ['Decisions', num(list.filter((n) => n.tag === 'decision').length)], ['Open', num(list.filter((n) => !n.done).length)], ['Next steps due', num(list.filter((n) => !n.done && n.due).length)]],
        sections: [discussionSec(list)] }; },
    marketing: () => {
      const r = range(); const ls = admin.leadStats(r);
      return { title: 'Marketing', subtitle: periodLabel(), kpis: [['Leads', num(ls.total)], ['Converted', `${ls.won || 0} (${ls.conversion}%)`], ['Campaigns', num((S().campaigns || []).length)], ['Ideas', num((S().ideas || []).length)]],
        sections: [
          sec('Lead Sources', ['Source', '>Leads', '>Converted', '>Conversion %'], admin.leadSources(r).map((x) => [x.source, x.leads, x.won, x.conversion]), { total: [1, 2] }),
          sec('Campaigns', ['Campaign', 'Platform', 'Start', 'End', '>Budget', '>Spent', '>Leads', '>Cost/Lead', '>Converted', '>Revenue', '>ROI %'],
            (S().campaigns || []).map((c) => { const x = admin.campaignStats(c); return [c.name, c.platform, c.start, c.end || 'Running', c.budget, c.spent, x.leads, x.cpl, x.won, x.revenue, x.roi]; }), { money: [4, 5, 7, 9], total: [4, 5, 6, 8, 9] }),
          sec('Content Ideas', ['Idea', 'Format', 'Hook', 'Status', 'Hashtags'], (S().ideas || []).map((i) => [i.title, i.format || '', i.hook || '', IDEA_STATUS[i.status] || i.status, i.tags || ''])),
        ] };
    },
    manage: () => {
      const d = deskDay || stamp(); const month = d.slice(0, 7); const tp = admin.targetProgress(month);
      const accName = (id) => (S().accounts.find((a) => a.id === id) || {}).name || 'Anyone';
      return { title: 'Team Desk', subtitle: fdate(month), kpis: [['Revenue', `${inr(tp.revenue)}${tp.revenueGoal ? ` / ${inr(tp.revenueGoal)}` : ''}`], ['New leads', `${num(tp.leads)}${tp.leadsGoal ? ` / ${num(tp.leadsGoal)}` : ''}`], ['New patients', `${num(tp.patients)}${tp.patientsGoal ? ` / ${num(tp.patientsGoal)}` : ''}`], ['Open tasks', num((S().tasks || []).filter((t) => !t.done).length)]],
        sections: [
          sec('Team Targets', ['Team member', '>Sales', '>Target', '>Achieved %'], tp.team.map((x) => [x.name, x.sales, x.goal, x.pct]), { money: [1, 2], total: [1, 2] }),
          sec('Tasks', ['Task', 'Assigned To', 'Due', 'Priority', 'Status'], (S().tasks || []).map((t) => [t.title, accName(t.assignedTo), t.due || '', t.priority || 'normal', t.done ? 'Done' : t.due && t.due < stamp() ? 'Overdue' : 'Open'])),
          sec(`Attendance ${fdate(month)}`, ['Team member', '>Present', '>Half Day', '>Absent', '>Leave', '>Week Off', '>Paid Days'], admin.attendanceMonth(month).map((x) => [x.name, x.present, x.half, x.absent, x.leave, x.off, x.days]), { total: [1, 2, 3, 4, 5, 6] }),
        ] };
    },
    all: () => {
      const r = range();
      const secs = [...R.financial(r), R.teamReport(r), R.appointments(admin.appointmentsIn(r)), R.sales(S().sales.filter((s) => inR(s.date, r)).sort((a, b) => (a.date < b.date ? -1 : 1))),
        R.inventory(admin.stockReport(r)), R.purchases([...S().purchases].filter((p) => inR(p.date, r))), R.expenses(S().expenses.filter((e) => inR(e.date, r))), ...R.expenseGroups(admin.expenseSummary(r)).slice(1),
        R.content(S().content.filter((c) => inR(c.date || '', r) || inR(c.postedDate || '', r))), R.doctors(),
        R.renewals(admin.renewals().filter((x) => x.stage)), R.leads(S().leads.filter((l) => inR(l.date, r))), R.leadOwners(S().leads.filter((l) => inR(l.date, r))), R.salary((r && r.to ? r.to : stamp()).slice(0, 7))];
      // Salary and team figures only for logins that may open them.
      return { title: 'All Reports', subtitle: periodLabel(), kpis: dashKpis(r), sections: secs.filter((s) => (can('salary') || !s.title.startsWith('Salary')) && (can('team') || s.title !== 'Team Performance')) };
    },
  };
  // Report filters (each tab shows the ones that apply).
  const repF = { member: '', type: '', mode: '', status: '', service: '', category: '', cat: '', source: '', owner: '' };
  const repSales = () => S().sales.filter((x) => inR(x.date, range()) && (!repF.type || x.type === repF.type) && (!repF.member || x.splits.some((y) => y.memberId === repF.member))).sort((a, b) => (a.date < b.date ? 1 : -1));
  const repAppts = () => admin.appointmentsIn(range()).filter((a) => (!repF.mode || a.mode === repF.mode) && (!repF.status || a.status === repF.status) && (!repF.service || a.service === repF.service));
  const repLeads = () => S().leads.filter((l) => inR(l.date, range()) && (!repF.source || l.source === repF.source) && (!repF.owner || l.assignedTo === repF.owner) && (!repF.status || l.status === repF.status));
  const REPORTS = {
    overview: { label: 'Overview', build: () => ({ title: 'Business Overview', subtitle: periodLabel(), kpis: dashKpis(range()), sections: R.financial(range()) }) },
    today: { label: 'Today', build: () => EXPORTS.today() },
    appointments: { label: 'OPD', filters: ['mode', 'apptStatus', 'service'], build: () => ({ title: 'OPD Appointments Report', subtitle: periodLabel(), sections: [R.appointments(repAppts())] }) },
    leads: { label: 'Leads', need: 'leads', filters: ['source', 'leadStatus', 'owner'], build: () => ({ title: 'Leads Report', subtitle: periodLabel(), sections: [R.leads(repLeads()), R.leadOwners(repLeads())] }) },
    sales: { label: 'Sales', filters: ['type', 'member'], build: () => ({ title: 'Sales Report', subtitle: periodLabel(), sections: [R.sales(repSales())] }) },
    team: { label: 'Team wise', need: 'team', filters: ['member'], build: () => ({ title: 'Team Report', subtitle: periodLabel(), sections: [{ ...R.teamReport(range()), rows: R.teamReport(range()).rows.filter((r) => !repF.member || r[0] === (admin.member(repF.member) || {}).name) }] }) },
    financial: { label: 'Financial', build: () => ({ title: 'Financial Report', subtitle: periodLabel(), sections: R.financial(range()) }) },
    stock: { label: 'Stock', filters: ['cat'], build: () => ({ title: 'Stock Report', subtitle: periodLabel(), sections: [R.inventory(admin.stockReport(range()).filter((x) => !repF.cat || x.category === repF.cat))] }) },
    purchases: { label: 'Purchases', build: () => ({ title: 'Purchase Report', subtitle: periodLabel(), sections: [R.purchases([...S().purchases].filter((p) => inR(p.date, range())))] }) },
    expenses: { label: 'Expenses', filters: ['category'], build: () => { const l = S().expenses.filter((e) => inR(e.date, range()) && (!repF.category || e.category === repF.category)); return { title: 'Expense Report', subtitle: periodLabel(), sections: [...R.expenseGroups(admin.expenseSummary(range())), R.expenses(l)] }; } },
    content: { label: 'Content', need: 'content', build: () => EXPORTS.content() },
    doctors: { label: 'Doctors', need: 'doctors', build: () => EXPORTS.doctors() },
    renewals: { label: 'Renewals', build: () => ({ title: 'Renewal Report', subtitle: `Alert after ${set().renewalDays[0]} days`, sections: [R.renewals(admin.renewals())] }) },
    ads: { label: 'Ads', need: 'marketing', build: () => { const a = admin.adReport(range()); return { title: 'Ads Report', subtitle: periodLabel(), kpis: [['Ad spend', inr(a.spend)], ['Leads from ads', num(a.paidLeads)], ['Cost per lead', inr(a.cpl)], ['Converted', num(a.won)]],
      sections: [sec('Ads by Platform', ['Platform', '>Spend', '>Leads (app)', '>Leads (manual)', '>Cost/Lead', '>Converted', '>Revenue', '>ROI %'], a.rows.map((x) => [x.platform, x.spend, x.leads, x.hasManual ? x.manualLeads : '', x.cpl, x.won, x.revenue, x.spend ? x.roi : '']), { money: [1, 4, 6], total: [1, 2, 5, 6] })] }; } },
    activity: { label: 'Activity', need: 'activity', build: () => ({ title: 'Activity Log', subtitle: periodLabel(), sections: [R.activity(filteredLog())] }) },
  };
  function reportFilters(list) {
    const sel = (k, all, options) => `<select data-rfilter="${k}">${opt('', all, repF[k])}${options.map(([v, l]) => opt(v, l, repF[k])).join('')}</select>`;
    const F = {
      member: () => sel('member', 'All team members', S().team.map((m) => [m.id, m.name])),
      type: () => sel('type', 'All sale types', Object.entries(A.SALE_TYPES)),
      mode: () => sel('mode', 'Clinic & online', Object.entries(A.APPT_MODES)),
      apptStatus: () => sel('status', 'All statuses', Object.entries(A.APPT_STATUS)),
      service: () => sel('service', 'All services', set().lists.services.map((x) => [x, x])),
      cat: () => sel('cat', 'All categories', S().categories.map((c) => [c.name, c.name])),
      category: () => sel('category', 'All categories', set().lists.expenseCategories.map((x) => [x, x])),
      source: () => sel('source', 'All sources', set().lists.leadSources.map((x) => [x, x])),
      leadStatus: () => sel('status', 'All stages', set().lists.leadStatuses.map((x) => [x, x])),
      owner: () => sel('owner', 'Everyone', S().accounts.map((a) => [a.id, a.name])),
    };
    return (list || []).length ? `<div class="filters"><div class="row">${list.map((k) => F[k]()).join('')}<button type="button" class="btn sm ghost" data-act="rfilter-clear">Clear filters</button></div></div>` : '';
  }
  const tapSec = (r, mine) => sec(`Calls & WhatsApp by Team (${r ? (r.from === r.to ? fdate(r.from) : `${fdate(r.from)} to ${fdate(r.to)}`) : 'all time'})`, ['Team member', '>Calls', '>WhatsApp', '>Total', '>Leads reached', '>Repeat taps not counted', 'Last tap'],
    admin.clickStats(r, mine).map((x) => [x.name, x.calls, x.whatsapp, x.total, x.leads, x.ignored, ftime(x.last)]), { total: [1, 2, 3] });
  const clinicLine = () => [set().clinic || 'The Prime Fit', set().phone].filter(Boolean).join(' · ');
  // Today summary export: pick the period, the sections and filters (sale type, team member, payment).
  const TODAY_SECS = [['kpis', 'Summary boxes'], ['order', 'Order required'], ['sales', 'Sales'], ['opd', 'OPD appointments'], ['expenses', 'Expenses'], ['purchases', 'Purchases'],
    ['leads', 'Leads & follow-ups'], ['taps', 'Calls & WhatsApp by team'], ['renewals', 'Renewals due'], ['content', 'Videos & posts'], ['stock', 'Stock available'], ['nostock', 'Stock not available']];
  let pendingToday = null;
  function todayXp(o) {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('primefit.todayXp') || '{}') || {}; } catch (_) { saved = {}; }
    const d = todayDate || stamp();
    return { period: 'day', type: '', member: '', pay: '', secs: Object.fromEntries(TODAY_SECS.map(([k]) => [k, true])), ...saved, ...(o || {}), day: d };
  }
  function todayPeriod(o) {
    const d = o.day || stamp();
    if (o.period === 'week') return { from: shiftDay(d, -6), to: d };
    if (o.period === 'month') return { from: `${d.slice(0, 8)}01`, to: d };
    if (o.period === 'custom' && o.from && o.to) return { from: o.from <= o.to ? o.from : o.to, to: o.from <= o.to ? o.to : o.from };
    return { from: d, to: d };
  }
  function todayReport(o) {
    const r = todayPeriod(o); const one = r.from === r.to; const on = (k) => o.secs[k] !== false;
    const x = admin.daySummary(r.to);
    const saleOk = (s2) => (!o.type || s2.type === o.type) && (!o.member || s2.splits.some((y) => y.memberId === o.member)) && (!o.pay || (o.pay === 'paid' ? !!s2.payMethod : !s2.payMethod));
    const sales = S().sales.filter((s2) => inR(s2.date, r) && saleOk(s2));
    const appts = admin.appointmentsIn(r).filter((a) => !o.pay || (o.pay === 'paid' ? a.paid : !a.paid && a.status !== 'cancelled'));
    const exps = S().expenses.filter((e) => inR(e.date, r) && !e.deleted);
    const purch = S().purchases.filter((p2) => inR(p2.date, r));
    const leads = S().leads.filter((l) => inR(l.date, r));
    const fees = appts.filter((a) => a.paid && a.status !== 'cancelled').reduce((a, b) => a + (Number(b.fee) || 0), 0);
    const taps = admin.clickStats(r);
    const filt = [o.type ? saleLabel(o.type) : '', o.member ? (admin.member(o.member) || {}).name : '', o.pay ? (o.pay === 'paid' ? 'Paid only' : 'Unpaid only') : ''].filter(Boolean).join(' · ');
    const kp = [['Sales', inr(sales.reduce((a, b) => a + b.amount, 0))], ['Sales count', num(sales.length)], ['Purchases', inr(purch.reduce((a, b) => a + (Number(b.total) || 0), 0))], ['Expenses', inr(admin.expenseSummary(r).total)],
      ['OPD appointments', num(appts.filter((a) => a.status !== 'cancelled').length)], ['OPD fees', inr(fees)], ['New leads', num(leads.length)], ['Calls / WhatsApp', `${num(taps.reduce((a, b) => a + b.calls, 0))} / ${num(taps.reduce((a, b) => a + b.whatsapp, 0))}`],
      ['Renewals due', num(x.renewals.length)], ['Items available', num(x.available.length)], ['Not available', num(x.notAvailable.length)], ['Order required', num(x.order.length)]];
    const xs = { ...x, sales, appointments: appts, expenses: exps, purchases: purch };
    const secs = [];
    if (on('order') && x.order.length) secs.push(R.dayStock('ORDER REQUIRED', x.order));
    if (on('sales')) secs.push(one ? R.daySales(xs) : R.sales(sales));
    if (on('opd')) secs.push(one ? R.dayAppts(xs) : R.appointments(appts));
    if (on('expenses') && exps.length) secs.push(one ? R.dayExpenses(xs) : R.expenses(exps));
    if (on('purchases') && purch.length) secs.push(one ? R.dayPurchases(xs) : R.purchases(purch));
    if (on('leads')) secs.push(one ? R.dayLeads(x) : R.leads(leads));
    if (on('taps') && taps.length) secs.push(tapSec(r));
    if (on('renewals') && x.renewals.length) secs.push(R.dayRenewals(x));
    if (on('content') && (x.posted.length || x.content.dueToday.length || x.content.overdue.length)) secs.push(R.dayContent(x));
    if (on('stock')) secs.push(R.dayStock('Stock Available', x.available));
    if (on('nostock') && x.notAvailable.length) secs.push(R.dayStock('Stock Not Available', x.notAvailable));
    return { title: one ? 'Today Summary' : 'Daily Summary', subtitle: `${one ? fdate(r.to) : `${fdate(r.from)} to ${fdate(r.to)}`}${filt ? ` · ${filt}` : ''}`, kpis: on('kpis') ? kp : [], alertKpis: on('kpis') ? [10, 11] : [], sections: secs.length ? secs : [sec('Nothing selected', ['Note'], [['Tick at least one section to export']])] };
  }
  function todayExportForm() {
    const o = todayXp();
    const seg = (k, list, cur) => `<div class="seg sm" data-txseg="${k}">${list.map(([v, l]) => `<button type="button" data-v="${v}" class="${(cur || '') === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    openForm({
      title: 'Export summary', submitLabel: 'Export', ro: true,
      html: `<div id="tx-box"><div class="f">Period${seg('period', [['day', fdate(o.day)], ['week', 'Last 7 days'], ['month', 'This month'], ['custom', 'Custom']], o.period)}</div>
        <div class="grid two tx-custom" ${o.period === 'custom' ? '' : 'hidden'}><label class="f">From<input type="date" id="tx-from" value="${esc(o.from || shiftDay(o.day, -6))}"></label><label class="f">To<input type="date" id="tx-to" value="${esc(o.to || o.day)}"></label></div>
        <h3 class="ui-h">What to include <button type="button" class="link" data-txall="1">All</button> · <button type="button" class="link" data-txall="0">None</button></h3>
        <div class="tx-secs">${TODAY_SECS.map(([k, l]) => `<label class="check"><input type="checkbox" data-txsec="${k}" ${o.secs[k] !== false ? 'checked' : ''}> ${l}</label>`).join('')}</div>
        <h3 class="ui-h">Filters</h3>
        <div class="grid three"><label class="f">Sale type<select id="tx-type">${opt('', 'All types', o.type)}${saleTypes().map(([k, l]) => opt(k, l, o.type)).join('')}</select></label>
          <label class="f">Team member<select id="tx-member">${memberOptions(o.member, 'Everyone')}</select></label>
          <label class="f">Payment<select id="tx-pay">${[['', 'Paid and unpaid'], ['paid', 'Paid only'], ['unpaid', 'Unpaid only']].map(([k, l]) => opt(k, l, o.pay)).join('')}</select></label></div>
        <div class="f" style="margin-top:8px">Format${seg('fmt', [['pdf', 'PDF'], ['xlsx', 'Excel'], ['jpeg', 'Image']], o.fmt || 'pdf')}</div></div>`,
      onSubmit: () => {
        const box = $('#tx-box'); const g = (k) => ($(`[data-txseg="${k}"] button.on`, box) || {}).dataset.v || '';
        const n = { period: g('period') || 'day', fmt: g('fmt') || 'pdf', from: $('#tx-from').value, to: $('#tx-to').value, type: $('#tx-type').value, member: $('#tx-member').value, pay: $('#tx-pay').value,
          secs: Object.fromEntries($$('[data-txsec]', box).map((i) => [i.dataset.txsec, i.checked])) };
        try { localStorage.setItem('primefit.todayXp', JSON.stringify(n)); } catch (_) { /* ignore */ }
        pendingToday = n; runExport('today', n.fmt);
      },
    });
    const box = $('#tx-box');
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-txseg] button');
      if (b) { $$('button', b.parentElement).forEach((x) => x.classList.toggle('on', x === b)); if (b.parentElement.dataset.txseg === 'period') $('.tx-custom', box).hidden = b.dataset.v !== 'custom'; }
      const a = e.target.closest('[data-txall]');
      if (a) $$('[data-txsec]', box).forEach((i) => { i.checked = a.dataset.txall === '1'; });
    });
  }
  function runExport(what, fmt) {
    const rep = EXPORTS[what]();
    rep.filename = `ThePrimeFit-${rep.title.replace(/[^A-Za-z0-9]+/g, '-')}-${stamp()}`;
    rep.by = me ? me.name : '';
    try {
      const pretty = () => ({ ...rep, sections: rep.sections.map((s) => ({ ...s, rows: s.rows.map((r) => r.map((v, i) => fmtCell(s, i, v))), foot: s.foot && s.foot.map((v, i) => fmtCell(s, i, v)) })) });
      if (fmt === 'pdf') toast(`Saved ${X.pdf(pretty(), clinicLine())}`);
      else if (fmt === 'jpeg') toast(`Saved ${X.jpeg(pretty(), clinicLine())}`);
      else toast(`Saved ${X.xlsx(rep)}`);
    } catch (err) { toast(`Export failed: ${err.message}`, true); }
  }

  // Reports
  let reportTab = 'overview';
  SUBS.reports = () => periodLabel();
  SCREENS.reports = () => {
    const tabs = Object.entries(REPORTS).filter(([, v]) => !v.need || can(v.need));
    if (!REPORTS[reportTab] || (REPORTS[reportTab].need && !can(REPORTS[reportTab].need))) reportTab = 'overview';
    const rep = REPORTS[reportTab].build();
    return `<div class="toolbar"><div class="scroll-x"><div class="seg">${tabs.map(([k, v]) => `<button type="button" data-report="${k}" class="${reportTab === k ? 'on' : ''}">${v.label}</button>`).join('')}</div></div></div>
      <div class="toolbar">${reportTab === 'today' ? '' : periodBar()}<span class="grow"></span>${exportBtns('report')}${reportTab === 'today' ? '<button type="button" class="btn sm" data-act="export" data-what="today" data-fmt="jpeg">JPEG</button>' : ''}</div>
      ${reportFilters(REPORTS[reportTab].filters)}
      <div class="card" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b style="flex:1;min-width:180px">All reports in one file</b><span class="hint">Every report for ${esc(periodLabel())}</span>
        <button class="btn primary sm" data-act="export" data-what="all" data-fmt="pdf">Download all · PDF</button><button class="btn success sm" data-act="export" data-what="all" data-fmt="xlsx">Download all · Excel</button></div>
      ${rep.kpis ? `<div class="kpis" style="margin-bottom:16px">${rep.kpis.map(([l, v]) => kpi(l, v)).join('')}</div>` : ''}
      ${rep.sections.map(renderSec).join('')}`;
  };

  // Settings: Super Admin sees everything; other roles only if granted, and without logins/roles.
  const LIST_LABELS = { expenseCategories: 'Expense categories', expenseNames: 'Expense names (founders, ad platforms, editors…)', platforms: 'Content platforms', specialities: 'Doctor specialities', services: 'Treatments / services', leadSources: 'Lead sources', leadStatuses: 'Lead stages', payMethods: 'Payment methods', designations: 'Designations' };
  const PERM_ROLES = ['admin', 'manager', 'desk', 'editor', 'marketing', 'viewer'];
  const PERM_SCREENS = [['diet', 'Diet charts (and the Home page)'], ...NAV.filter((n) => !['settings', 'about', 'home'].includes(n[0])).map((n) => [n[0], n[1]])];
  SCREENS.settings = () => {
    const st = set();
    const last = Number(storage.getItem(SYNC_KEY)) || 0;
    const isSuper = role === 'super';
    const accRows = S().accounts.map((a) => `<tr class="${a.disabled ? 'off' : ''}"><td><b>${esc(a.name)}</b><span class="sub">${a.memberId && admin.member(a.memberId) ? `Team: ${esc(admin.member(a.memberId).name)}` : ''}</span></td>
      <td><span class="badge ${a.role === 'super' ? 'gold' : a.role === 'admin' ? 'violet' : a.role === 'manager' ? 'teal' : 'info'}">${A.ROLES[a.role]}</span></td>
      <td><code class="pin">${esc(a.username || '')}</code>${a.ownOnly ? ' <span class="badge">Own data</span>' : ''}</td>
      <td>${a.hash ? '<span class="badge ok">Set</span>' : '<span class="badge warn">Not set</span>'}</td>
      <td class="acts"><button class="btn xs" data-act="set-pin" data-id="${a.id}">${a.hash ? 'Change password' : 'Set password'}</button>${a.id !== me.id ? ` <button class="btn xs" data-act="random-pin" data-id="${a.id}">Reset password</button>` : ''} <button class="btn xs" data-act="edit-login" data-id="${a.id}">Edit</button>${a.id !== me.id ? ` <button class="btn xs danger" data-act="del-login" data-id="${a.id}">Delete</button>` : ''}</td></tr>`);
    const perms = st.perms;
    const permTable = `<div class="tbl-wrap"><table class="perm"><thead><tr><th>Screen</th>${PERM_ROLES.map((r) => `<th class="c">${A.ROLES[r]}</th>`).join('')}</tr></thead><tbody>
      ${PERM_SCREENS.map(([id, label]) => `<tr><td>${esc(label)}</td>${PERM_ROLES.map((r) => `<td class="c"><input type="checkbox" data-perm="${r}" value="${id}" ${perms[r].screens.includes(id) ? 'checked' : ''} aria-label="${esc(label)} for ${A.ROLES[r]}"></td>`).join('')}</tr>`).join('')}
      <tr><td><b>Settings</b></td>${PERM_ROLES.map((r) => `<td class="c"><input type="checkbox" data-perm="${r}" value="settings" ${perms[r].screens.includes('settings') ? 'checked' : ''}></td>`).join('')}</tr>
      <tr><td><b>Can delete records</b></td>${PERM_ROLES.map((r) => `<td class="c"><input type="checkbox" data-permdel="${r}" ${perms[r].del ? 'checked' : ''}></td>`).join('')}</tr>
      <tr><td><b>View only</b> <small class="muted">(no adding, editing or deleting)</small></td>${PERM_ROLES.map((r) => `<td class="c"><input type="checkbox" data-permview="${r}" ${perms[r].view ? 'checked' : ''}></td>`).join('')}</tr></tbody></table></div>`;
    const chips = (list) => `<div class="opt-chips">${st.lists[list].map((x) => `<span class="opt-chip">${esc(x)}<button type="button" data-act="list-rename" data-list="${list}" data-name="${esc(x)}" aria-label="Rename">✎</button><button type="button" data-act="list-del" data-list="${list}" data-name="${esc(x)}" aria-label="Remove">✕</button></span>`).join('')}
      <span class="opt-add"><input placeholder="Add new" data-listadd="${list}"><button type="button" class="btn xs primary" data-act="list-add" data-list="${list}">Add</button></span></div>`;
    const catChips = `<div class="opt-chips">${S().categories.map((c) => `<span class="opt-chip">${esc(c.name)}<small>${A.KINDS[c.kind]}</small><button type="button" data-act="cat-rename" data-name="${esc(c.name)}" aria-label="Rename">✎</button><button type="button" data-act="cat-del" data-name="${esc(c.name)}" aria-label="Delete">✕</button></span>`).join('')}<button type="button" class="btn xs primary" data-act="add-category">+ Category</button></div>`;
    const STABS = [['general', 'Clinic & fees', 'Fees, alerts, stock, sign-out', '<path d="M3 21h18M5 21V8l7-5 7 5v13"/>'],
      ['profile', 'Company profile & payments', 'Name, contact, GSTIN, bank, UPI, slip wording', '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>'],
      ['selling', 'Selling & stock', 'Incentives, GST, invoices, stock alerts', '<path d="M4 8l8-4 8 4-8 4zM4 8v8l8 4 8-4V8"/>'],
      ['leads', 'Leads & WhatsApp', 'Follow-ups, tags, reminders, messages', ICON_LEADS],
      ['team', 'Logins & roles', 'Users, passwords, who sees what', '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'],
      ['look', 'Look & branding', 'Themes, dashboards, menu, fonts', '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z"/>'],
      ['data', 'Data & Google Sheet', 'Sync, backup and export', '<path d="M4 4h16v16H4zM4 10h16M10 4v16"/>']];
    return `${sheetStatusCard()}
    <div class="set-tiles" role="tablist">${STABS.map(([k, l, d, ic], i) => `<button type="button" role="tab" data-stabgo="${k}" class="set-tile c${i % 6} ${settingsTab === k ? 'on' : ''}"><span class="st-ic">${svg(ic)}</span><span class="st-t"><b>${l}</b><small>${d}</small></span></button>`).join('')}</div>
    ${role === 'super' ? brandingCard() : ''}
    <div class="card" data-stab="look"><h2><span class="ic">${svg('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z"/>')}</span>Theme</h2>${themeHtml()}<p class="hint" style="margin:10px 0 0">Applies on this phone to the clinic admin and the diet charts.</p></div>
    ${canCustomize() ? `<div class="card" data-stab="look"><h2><span class="ic violet">${svg('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>')}</span>What shows on dashboards</h2>
      <p class="hint" style="margin-top:0">Pick a screen, then tick the cards and boxes to show. Hidden ones keep their data. You can also tap <b>Show / hide</b> at the top of any of these screens.</p>
      <div class="opt-chips">${CUSTOM_SCREENS.filter((x) => can(x)).map((x) => `<button type="button" class="btn sm" data-act="customize-on" data-screen="${x}">${esc(TITLES[x] || (NAV.find((n) => n[0] === x) || [, x])[1])}${(hiddenOn(x) || []).length ? ` <span class="badge warn">${hiddenOn(x).length} hidden</span>` : ''}</button>`).join('')}</div></div>` : ''}
    <form class="card form-card" id="settings-form" autocomplete="off" data-stab="general profile selling leads data">
      <div data-stab="general"><h2><span class="ic">${svg('<path d="M3 21h18M5 21V8l7-5 7 5v13"/>')}</span>Clinic</h2>
      <div class="grid">
        <label class="f">OPD consultation fee (₹)<input type="number" min="0" name="consultFee" value="${esc(st.consultFee)}"></label>
        <label class="f">Default GST % on purchases<input type="number" min="0" max="100" step="any" name="defaultGst" value="${esc(st.defaultGst != null ? st.defaultGst : 12)}"></label>
        <label class="f">Editor fee per video (₹)<input type="number" min="0" name="videoFee" value="${esc(st.videoFee != null ? st.videoFee : 150)}"></label>
        <label class="f">Renewal alert after (days)<input type="number" min="1" name="r1" value="${esc(st.renewalDays[0])}"></label>
        <label class="f">Overdue after (days)<input type="number" min="1" name="r2" value="${esc(st.renewalDays[1])}"></label>
        <label class="f">Active patient = visited within (days)<input type="number" min="1" name="activeDays" value="${esc(st.activeDays)}"></label>
      </div>
      <label class="check"><input type="checkbox" name="purchaseExpense" ${st.purchaseExpense ? 'checked' : ''}> Book every purchase invoice as an expense</label>
      <label class="check"><input type="checkbox" name="stockAlerts" ${st.stockAlerts !== false ? 'checked' : ''}> Low-stock alerts on (each item can also be switched off in Inventory)</label>
      <label class="check"><input type="checkbox" name="kitOn" ${st.kitOn !== false ? 'checked' : ''}> Take the injection kit out of stock with every injection sold <button type="button" class="link" data-act="kit">Edit kit</button></label>
      <div class="grid two" style="margin-top:8px">
        <label class="f">Founders<span class="founder-mini">${esc(admin.founders().map((f) => `${f.name} (${f.share}%)`).join(', ') || 'Not set')}</span><button type="button" class="btn sm" data-go="founder">Manage founders</button></label>
        <label class="f">Sign out when idle (minutes, 0 = never)<input type="number" min="0" name="autoLockMins" value="${esc(st.autoLockMins || 0)}"></label>
      </div></div>
      <div data-stab="selling"><h2 style="margin-top:6px"><span class="ic gold">${svg('<path d="M4 8l8-4 8 4-8 4zM4 8v8l8 4 8-4V8M12 12v8"/>')}</span>What you sell</h2>
      <p class="hint" style="margin:0">Switch off what the clinic does not offer right now. It is hidden from New Sale, Products and the dashboard; past sales stay.</p>
      <div class="sell-list">${Object.entries(A.SALE_TYPES).map(([k, l]) => { const items = k === 'diet' ? st.dietPlans.map((p) => p.name) : admin.itemsOf(k, true).filter((i) => !i.disabled).map((i) => i.name); return `<div class="sell-row"><label class="check"><input type="checkbox" name="grp-${k}" ${groupOn(k) ? 'checked' : ''}> <b>${esc(l)}</b></label>
        <small>${items.length ? esc(items.slice(0, 4).join(' · ')) + (items.length > 4 ? ` +${items.length - 4} more` : '') : 'No products yet'}</small>
        <button type="button" class="btn xs" ${k === 'diet' ? 'data-act="edit-plan"' : `data-act="add-product" data-kind="${k}"`}>+ Add ${k === 'diet' ? 'plan' : 'product'}</button></div>`; }).join('')}</div>
      <p style="margin:6px 0 0"><button type="button" class="btn sm" data-act="kind-add">+ Add a new type</button> <button type="button" class="link" data-go="products">Open Products</button></p>
      <h2 style="margin-top:6px"><span class="ic violet">${svg('<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/>')}</span>Patient slips & invoices</h2>
      <div class="grid">
        <label class="f">Slip / invoice number prefix<input name="invoicePrefix" value="${esc(st.invoicePrefix || 'TPF')}" maxlength="8"></label>
        <label class="f">GST % included in prices<input type="number" min="0" max="28" step="any" name="invoiceGst" value="${esc(st.invoiceGst || 0)}"><span class="hint">0 = no GST line on the slip</span></label>
        <label class="f">Default slip size<select name="slipFormat">${[['a5', 'A5 slip'], ['a4', 'A4 invoice'], ['thermal', '80 mm receipt printer']].map(([k, l]) => opt(k, l, st.slipFormat || 'a5')).join('')}</select></label>
        <label class="f span">Thank-you note on slips<input name="invoiceNote" value="${esc(st.invoiceNote || '')}"></label>
      </div>
      <p class="hint" style="margin:0">Company name, GSTIN, bank and UPI details come from <button type="button" class="link" data-stabgo="profile">Company profile & payments</button>.</p>
      </div>
      <div data-stab="leads"><h2><span class="ic gold">${svg(ICON_LEADS)}</span>Leads & reminders</h2>
      <div class="grid two">
        <label class="f">New lead follow-up after (days)<input type="number" min="0" name="followUpDays" value="${esc(st.followUpDays != null ? st.followUpDays : 2)}"></label>
        <label class="f">Follow-up alert before (minutes)<input type="number" min="1" name="remindMins" value="${esc(st.remindMins || 10)}"></label>
        <label class="f">Count repeat Call / WhatsApp taps once within (minutes)<input type="number" min="1" max="1440" name="clickGapMins" value="${esc(st.clickGapMins || 15)}"></label>
        <label class="f span">Lead tags (comma separated)<input name="leadTags" value="${esc((st.leadTags || []).join(', '))}"></label>
      </div>
      <label class="check"><input type="checkbox" name="autoAssign" ${st.autoAssign ? 'checked' : ''}> Share new leads automatically between Front Desk and Marketing logins (fewest open leads first)</label>
      <h2 style="margin-top:6px"><span class="ic wa">${svg('<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/>')}</span>WhatsApp messages</h2>
      <p class="hint" style="margin:0">Used on every lead. <code>{name}</code>, <code>{clinic}</code> and <code>{about}</code> are filled in. Leave blank for the default.</p>
      <div class="grid">${Object.keys(WA_DEFAULTS).map((k) => `<label class="f span">${WA_LABELS[k]}<textarea name="wa-${k}" rows="2" placeholder="${esc(WA_DEFAULTS[k])}">${esc((st.waTemplates || {})[k] || '')}</textarea></label>`).join('')}</div></div>
      <div data-stab="profile"><h2><span class="ic teal">${svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>')}</span>Company profile</h2>
      <p class="hint" style="margin:0 0 6px">Shown on every slip, invoice, OPD slip, report PDF and the diet charts. Change it here and everything updates automatically.</p>
      <div class="grid two">
        <label class="f">Brand name<input name="clinic" value="${esc(st.clinic)}" placeholder="The Prime Fit"></label>
        <label class="f">Registered / legal name<input name="legalName" value="${esc(st.legalName || '')}" placeholder="The Prime Fit Wellness Pvt. Ltd."></label>
        <label class="f">Tagline<input name="tagline" value="${esc(st.tagline || '')}" placeholder="Transform Today, Thrive Tomorrow"></label>
        <label class="f">Phone<input name="phone" type="tel" value="${esc(st.phone || '')}" placeholder="+91 92051 36303"></label>
        <label class="f">WhatsApp number<input name="whatsapp" type="tel" value="${esc(st.whatsapp || '')}" placeholder="Same as phone"></label>
        <label class="f">Email<input name="email" type="email" value="${esc(st.email || '')}" placeholder="care@theprimefit.in"></label>
        <label class="f">Website<input name="website" value="${esc(st.website || '')}" placeholder="www.theprimefit.in"></label>
        <label class="f">GSTIN<input name="gstin" value="${esc(st.gstin || '')}" placeholder="27ABCDE1234F1Z5"></label>
        <label class="f span">Address<textarea name="address" rows="2" placeholder="Shop no., street, area, city, PIN">${esc(st.address || '')}</textarea></label>
        <label class="f">Registration / licence no.<input name="regNo" value="${esc(st.regNo || '')}"></label>
        <label class="f">Doctor / dietitian name<input name="doctor" value="${esc(st.doctor || '')}" placeholder="Dr. …"></label>
        <label class="f">Qualification<input name="qualification" value="${esc(st.qualification || '')}" placeholder="MBBS, MD · Clinical Nutrition"></label>
        <label class="f">Instagram link<input name="instagram" value="${esc(st.instagram || '')}"></label>
        <label class="f">YouTube link<input name="youtube" value="${esc(st.youtube || '')}"></label>
        <label class="f">Facebook link<input name="facebook" value="${esc(st.facebook || '')}"></label>
      </div>
      <h2 style="margin-top:6px"><span class="ic gold">${svg('<rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20M6 15h3"/>')}</span>Payment details (printed on slips)</h2>
      <div class="grid two">
        <label class="f">UPI ID<input name="upi" value="${esc(st.upi || '')}" placeholder="theprimefit@upi"></label>
        <label class="f">Payee name<input name="payee" value="${esc(st.payee || '')}" placeholder="Name on the account"></label>
        <label class="f">Bank name<input name="bankName" value="${esc(st.bankName || '')}"></label>
        <label class="f">Account number<input name="accountNo" value="${esc(st.accountNo || '')}" inputmode="numeric"></label>
        <label class="f">IFSC<input name="ifsc" value="${esc(st.ifsc || '')}" placeholder="HDFC0001234"></label>
        <label class="f">Branch<input name="branch" value="${esc(st.branch || '')}"></label>
      </div>
      <h2 style="margin-top:6px"><span class="ic violet">${svg('<path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6z"/>')}</span>Terms & medico-legal note</h2>
      <div class="grid">
        <label class="f span">Terms on slips<textarea name="terms" rows="2" placeholder="${esc(X.TERMS)}">${esc(st.terms || '')}</textarea><span class="hint">Leave blank to use the wording shown.</span></label>
        <label class="f span">Medico-legal note on patient slips and diet charts<textarea name="disclaimer" rows="3" placeholder="${esc(X.PATIENT_NOTE)}">${esc(st.disclaimer || '')}</textarea><span class="hint">Leave blank to use the wording shown.</span></label>
      </div>
      <div class="actions" style="justify-content:flex-start"><button type="button" class="btn sm" data-act="slip-sample">${svg('<path d="M6 3h9l4 4v14H6zM14 3v5h5"/>')}Preview a sample slip</button></div>
      </div>
      <div data-stab="data"><h2 style="margin-top:6px"><span class="ic teal">${svg('<path d="M4 4h16v16H4zM4 10h16M10 4v16"/>')}</span>Google Sheet (data storage)</h2>
      <p class="hint" style="margin:0">All data is stored in ${SHEET_LINK ? `<a href="${SHEET_LINK}" target="_blank" rel="noopener">The Prime Fit Google Sheet</a>` : 'The Prime Fit Google Sheet'} and refreshes automatically on every device. Set-up once: open the sheet → Extensions → Apps Script → paste <a href="google-apps-script/Code.gs" target="_blank" rel="noopener">Code.gs</a> → run <b>setup</b> → Deploy → Web app (Execute as: Me, Who has access: Anyone) → paste the URL and the secret here.</p>
      <div class="grid two">
        <label class="f">Web app URL<input name="sheetsUrl" value="${esc(st.sheetsUrl)}" placeholder="https://script.google.com/macros/s/…/exec"></label>
        <label class="f">Secret<input type="password" name="sheetsSecret" value="${esc(st.sheetsSecret)}"><span class="hint">Shown in the Apps Script log after running setup.</span></label>
      </div>
      <p class="hint" style="margin:0" id="last-sync">${connected() ? (last ? `Connected · last saved ${new Date(last).toLocaleString('en-IN')}` : 'Connected') : 'Not connected: data is only on this device'}</p>
      ${connected() ? `<div class="actions" style="justify-content:flex-start"><button type="button" class="btn sm" data-act="sheet-load">${svg('<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/>')}Load from Google Sheet</button><button type="button" class="btn sm" data-act="sheet-send">${svg('<path d="M12 19V5M5 12l7-7 7 7"/>')}Send this device's data to the sheet</button></div>
      <p class="hint" style="margin:0">Use your current sheet (keep its URL) or a new one (paste the new URL and secret, then Save settings). The sheet's tabs are rewritten on every save.</p>` : ''}
      </div>
      <div class="actions sticky-save"><button class="btn primary" type="submit">Save settings</button></div>
    </form>
    ${isSuper ? `<div class="card" data-stab="team"><h2><span class="ic gold">${svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>')}</span>Logins<span class="sp"></span><button class="btn sm primary" data-act="add-login">+ Add login</button></h2>
      <div class="quick" style="margin:0 0 10px">${[['super', 'Super Admin'], ['admin', 'Admin'], ['manager', 'Manager'], ['marketing', 'Marketing'], ['desk', 'Front Desk']].map(([k, l]) => `<button type="button" class="btn sm" data-act="add-login-role" data-role="${k}">+ ${l}</button>`).join('')}</div>
      <p class="hint" style="margin-top:0">Give every person their own login: a user ID and a password. Nobody sees the list of logins on the sign-in screen. Passwords are stored only in coded form; if someone forgets theirs, use <b>Reset password</b>. Logins work on every device through the Google Sheet.</p>
      ${table(['Login', 'Role', 'User ID', 'Password', ''], accRows)}</div>
    <form class="card" id="perm-form" data-stab="team"><h2><span class="ic violet">${svg('<path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6z"/>')}</span>Roles & permissions</h2>
      <p class="hint" style="margin-top:0">Choose what Admin, Manager and Front Desk can open. Super Admin always has everything.</p>
      ${permTable}<div class="actions" style="margin-top:12px"><button type="button" class="btn ghost" data-act="perm-reset">Reset to default</button><button class="btn primary" type="submit">Save permissions</button></div></form>` : ''}
    <div class="card" data-stab="selling leads"><h2><span class="ic teal">${svg('<path d="M4 6h16M4 12h16M4 18h10"/>')}</span>Choice lists</h2>
      <p class="hint" style="margin-top:0">Every drop-down with “+ Add new…” uses these lists. Rename (✎) updates existing records; built-in expense categories can't be removed.</p>
      ${Object.keys(LIST_LABELS).map((k) => `<div class="list-block"><b>${LIST_LABELS[k]}</b>${chips(k)}</div>`).join('')}
      <div class="list-block"><b>Inventory categories</b>${catChips}</div></div>
    <div class="card" data-stab="data"><h2><span class="ic violet">${svg('<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>')}</span>Backup & export</h2><p class="hint" style="margin-top:0">${connected() ? 'Data is saved to the Google Sheet and kept on this device for offline use.' : 'All data is stored on this device.'} Download everything as PDF or Excel from Reports.</p>
      <div class="actions" style="justify-content:flex-start"><button class="btn" data-act="export-backup">Export backup file</button>
      <label class="btn">Import backup<input type="file" id="import-file" accept="application/json,.json" hidden></label>
      <button class="btn" data-go="reports">All reports (PDF / Excel)</button>
      ${isSuper ? '<button class="btn danger" data-act="reset">Erase all data</button>' : ''}</div></div>
    <p class="credit-line">${esc(CREDIT)} · The Prime Fit Admin ${APP_VERSION}</p>`;
  };
  let settingsTab = 'general';
  function brandingCard() {
    const u = ui(); const labels = u.labels || {}; const off = u.off || [];
    const rows = NAV.filter((n) => !['home', 'settings', 'about'].includes(n[0])).map(([id, label]) => `<div class="ui-row"><label class="check"><input type="checkbox" data-uion="${id}" ${off.includes(id) ? '' : 'checked'}></label><input data-uilabel="${id}" value="${esc(labels[id] || '')}" placeholder="${esc(label)}" aria-label="Menu name for ${esc(label)}"></div>`).join('');
    const pick = (k, list, cur) => `<div class="seg sm">${list.map(([v, l]) => `<button type="button" data-uiset="${k}" data-v="${v}" class="${(cur || '') === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    return `<div class="card" data-stab="look"><h2><span class="ic gold">${svg('<path d="M3 7l4 4 5-7 5 7 4-4-2 12H5z"/>')}</span>Branding & menu<span class="sp"></span><span class="badge gold">Super Admin</span></h2>
      <div class="ui-grid"><label class="f">App name in the menu<input id="ui-brand" value="${esc(u.brand || '')}" placeholder="The Prime Fit"></label>
        <label class="f">Brand colour<span class="ui-color"><input type="color" id="ui-accent" value="${esc(u.accent || '#015b53')}"><button type="button" class="btn xs" data-uiset="accent" data-v="">Theme default</button></span></label>
        <label class="f">Gold accent<span class="ui-color"><input type="color" id="ui-gold" value="${esc(u.gold || '#d99a1e')}"><button type="button" class="btn xs" data-uiset="gold" data-v="">Default</button></span></label></div>
      <div class="ui-grid"><div class="f">Headings${pick('font', [['', 'Luxury serif'], ['modern', 'Modern sans']], u.font)}</div>
        <div class="f">Spacing${pick('density', [['', 'Comfortable'], ['compact', 'Compact']], u.density)}</div>
        <div class="f">Corners${pick('radius', [['', 'Soft'], ['10', 'Sharp'], ['26', 'Round']], u.radius)}</div>
        <div class="f">Animations${pick('noAnim', [['', 'On'], ['1', 'Off (fastest)']], u.noAnim ? '1' : '')}</div></div>
      <h3 class="ui-h">Menu items</h3><p class="hint" style="margin-top:0">Untick to switch a screen off for everyone except Super Admin. Type a new name to rename it in the menu and header.</p>
      <div class="ui-rows">${rows}</div>
      <div class="xp-acts" style="margin-top:12px"><button type="button" class="btn primary sm" data-act="ui-save">Save branding & menu</button><button type="button" class="btn sm" data-act="ui-reset">Reset to default</button></div></div>`;
  }
  function showSettingsTab() {
    $$('#view [data-stab]').forEach((el) => { el.hidden = !el.dataset.stab.split(' ').includes(settingsTab); });
    $$('#view [data-stabgo]').forEach((b) => b.classList.toggle('on', b.dataset.stabgo === settingsTab));
  }
  AFTER.settings = () => {
    showSettingsTab();
    $('#settings-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const r1 = Number(f.r1.value) || 75; const r2 = Number(f.r2.value) || 90;
      const before = `${set().sheetsUrl}|${set().sheetsSecret}`;
      admin.updateSettings({
        clinic: f.clinic.value.trim() || 'The Prime Fit', consultFee: Number(f.consultFee.value) || 0, renewalDays: [Math.min(r1, r2), Math.max(r1, r2)], activeDays: Number(f.activeDays.value) || 90,
        purchaseExpense: f.purchaseExpense.checked, stockAlerts: f.stockAlerts.checked, kitOn: f.kitOn.checked,
        groups: Object.fromEntries(Object.keys(A.SALE_TYPES).map((k) => [k, f[`grp-${k}`].checked])),
        ...Object.fromEntries(['phone', 'website', 'instagram', 'youtube', 'facebook', 'legalName', 'tagline', 'whatsapp', 'email', 'address', 'regNo', 'doctor', 'qualification', 'upi', 'payee', 'bankName', 'accountNo', 'branch', 'terms', 'disclaimer'].map((k) => [k, f[k].value.trim()])),
        ifsc: f.ifsc.value.trim().toUpperCase(), slipFormat: f.slipFormat.value,
        invoicePrefix: (f.invoicePrefix.value.trim() || 'TPF').replace(/[^\w-]/g, ''), gstin: f.gstin.value.trim().toUpperCase(), invoiceGst: Number(f.invoiceGst.value) || 0, invoiceNote: f.invoiceNote.value.trim(),
        defaultGst: f.defaultGst.value === '' ? 12 : Number(f.defaultGst.value), videoFee: f.videoFee.value === '' ? 150 : Number(f.videoFee.value),
        sheetsUrl: f.sheetsUrl.value.trim(), sheetsSecret: f.sheetsSecret.value.trim(),
        followUpDays: Math.max(0, Number(f.followUpDays.value) || 0), remindMins: Math.max(1, Number(f.remindMins.value) || 10), clickGapMins: Math.min(1440, Math.max(1, Number(f.clickGapMins.value) || 15)), autoAssign: f.autoAssign.checked, autoLockMins: Math.max(0, Number(f.autoLockMins.value) || 0),
        leadTags: [...new Set(f.leadTags.value.split(',').map((x) => x.trim()).filter(Boolean))],
        waTemplates: Object.fromEntries(Object.keys(WA_DEFAULTS).map((k) => [k, f[`wa-${k}`].value.trim()]).filter(([, v]) => v)),
      });
      toast('Settings saved');
      // New or changed sheet: treat it as a fresh connection and load its data straight away.
      const changed = before !== `${set().sheetsUrl}|${set().sheetsSecret}`;
      if (changed) setBase(0);
      render();
      if (connected() && changed) pull(true);
    });
    const pf = $('#perm-form');
    if (pf) {
      pf.addEventListener('submit', (e) => {
        e.preventDefault();
        const perms = {};
        PERM_ROLES.forEach((r) => {
          perms[r] = { screens: $$(`input[data-perm="${r}"]:checked`, pf).map((x) => x.value), del: $(`input[data-permdel="${r}"]`, pf).checked, view: $(`input[data-permview="${r}"]`, pf).checked };
        });
        admin.updateSettings({ perms });
        toast('Permissions saved');
        render();
      });
    }
    $('#import-file').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        if (!(await confirmBox('Import backup', 'This replaces all data with the backup. Continue?', 'Import'))) return;
        admin.importBackup(text);
        toast('Backup imported');
        render();
      } catch (err) { toast(err.message, true); }
    });
  };
  function itemKitForm(it) {
    const own = it.kit && it.kit.length ? it.kit : [];
    const usesDefault = !own.length && it.kind === 'injection';
    const others = admin.liveItems().filter((i) => i.id !== it.id && !i.disabled && i.track !== false && i.kind === 'other');
    openForm({
      title: `Kit for ${it.name}`,
      html: `<p class="hint" style="margin:0">Each ${esc(it.unit || 'unit')} of ${esc(it.name)} sold also takes these items out of stock. Set 0 to leave an item out.${usesDefault ? ' Now using the clinic injection kit; saving here gives this product its own kit.' : ''}</p>
        <div class="grid">${others.map((i) => { const k = (own.length ? own : usesDefault ? set().kit : []).find((x) => x.itemId === i.id); return `<label class="f">${esc(i.name)}<input type="number" min="0" step="1" data-ikit="${i.id}" value="${k ? k.qty : 0}"></label>`; }).join('') || '<p class="hint">Add "Other" inventory items (needles, swabs, bags…) first.</p>'}</div>`,
      onSubmit: () => { admin.setItemKit(it.id, $$('[data-ikit]').map((x) => ({ itemId: x.dataset.ikit, qty: Number(x.value) || 0 }))); return 'Kit saved'; },
    });
  }
  function kitForm() {
    const kit = set().kit;
    const others = admin.liveItems().filter((i) => i.kind === 'other' && !i.disabled && i.track !== false);
    openForm({
      title: 'Injection kit (per pen)',
      html: `<p class="hint" style="margin:0">Every injection pen sold also takes these items out of stock. Set 0 to leave an item out.</p>
        <div class="grid">${others.map((i) => { const k = kit.find((x) => x.itemId === i.id); return `<label class="f">${esc(i.name)}<input type="number" min="0" step="1" data-kit="${i.id}" value="${k ? k.qty : 0}"></label>`; }).join('')}</div>
        <label class="check"><input type="checkbox" id="kit-on" ${set().kitOn !== false ? 'checked' : ''}> Take the kit out automatically</label>`,
      onSubmit: () => {
        admin.setKit($$('[data-kit]').map((x) => ({ itemId: x.dataset.kit, qty: Number(x.value) || 0 })));
        admin.updateSettings({ kitOn: $('#kit-on').checked });
        return 'Injection kit saved';
      },
    });
  }
  const PASS_RULE = (p) => { if (String(p || '').length < 4) throw new Error('Password must be at least 4 characters'); };
  function loginForm(a, memberId, preset) {
    const m = memberId ? admin.member(memberId) : null;
    const v = a || { name: m ? m.name : '', role: 'desk', memberId: memberId || '', ...(preset || {}) };
    const random = randomPass();
    openForm({
      title: a ? `Edit login · ${a.name}` : 'Add login',
      fields: [
        { name: 'name', label: 'Full name', required: true, value: v.name },
        { name: 'username', label: 'User ID (for sign-in)', value: v.username || '', placeholder: 'Made from the name if blank', attrs: 'autocapitalize="none" autocomplete="off" spellcheck="false"' },
        { name: 'role', label: 'Role', type: 'select', value: v.role, options: Object.entries(A.ROLES).map(([k, x]) => [k, x]) },
        { name: 'memberId', label: 'Team member (optional)', type: 'select', value: v.memberId || '', options: [['', 'Not linked'], ...S().team.map((t) => [t.id, t.name])] },
        { name: 'editorId', label: 'Video editor profile (optional)', type: 'select', value: v.editorId || '', options: [['', 'Not linked'], ...S().editors.map((t) => [t.id, t.name])] },
        { name: 'ownOnly', label: 'Show only their own data (sales, leads, incentives, videos)', type: 'checkbox', value: !!v.ownOnly, span: true },
        ...(a ? [{ name: 'disabled', label: 'Login disabled', type: 'checkbox', value: !!a.disabled, span: true }] : [{ name: 'pin', label: 'Password', value: random, hint: 'A random password is filled in; you can change it', attrs: 'autocomplete="off" autocapitalize="none"' }]),
      ],
      onSubmit: async (x) => {
        if (!a) PASS_RULE(x.pin);
        const saved = admin.saveAccount({ ...(a ? { id: a.id } : {}), name: x.name, username: x.username, role: x.role, memberId: x.memberId, editorId: x.editorId, ownOnly: !!x.ownOnly, disabled: !!x.disabled });
        if (!a) await savePin(saved.id, x.pin);
        if (!a) setTimeout(() => showCreds(saved, x.pin, 'Login created'), 80);
        return a ? 'Login saved' : `Login added: ${saved.name} (${saved.username})`;
      },
    });
  }

  // ── Google Sheet data store ───────────────────────────────────
  // The Google Sheet holds the shared copy of all data; this device keeps a working copy so the
  // app still opens and records sales offline. Changes are saved to the sheet a moment after
  // they are made, and the latest data is loaded whenever the app is opened or brought back.
  const connected = () => !!(set().sheetsUrl && set().sheetsSecret);
  const getBase = () => Number(storage.getItem(BASE_KEY)) || 0;
  const setBase = (v) => storage.setItem(BASE_KEY, String(v || 0));
  // "Unsaved" = the shared data differs from what was last saved to / loaded from the sheet.
  // Device-only settings (PIN, keys, URL) are not shared, so changing them never counts.
  const hashOf = (text) => { let h = 5381; for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0; return `${text.length}:${h.toString(16)}`; };
  const dataHash = (a) => hashOf(JSON.stringify(a.exportState()));
  const EMPTY_HASH = dataHash(A.createAdmin(A.memoryStorage()));
  const isDirty = () => dataHash(admin) !== (storage.getItem(DIRTY_KEY) || EMPTY_HASH);
  const setDirty = (on) => { if (!on) storage.setItem(DIRTY_KEY, dataHash(admin)); };
  const device = () => (/Android/i.test(navigator.userAgent) ? 'Android' : /iPhone|iPad/i.test(navigator.userAgent) ? 'iPhone/iPad' : 'Computer');
  let saveTimer = null;
  let busy = false;
  let lastPull = 0;
  // Saving and loading happen quietly in the background; only the refresh icon spins.
  let sheetMsg = '';
  function syncState(text) {
    const b = $('#refresh-btn'); if (b) { b.classList.toggle('spin', /…/.test(text || '')); b.classList.toggle('sync-warn', /Offline|Not saved/.test(text || '')); }
    sheetMsg = text || '';
    const c = $('#sheet-status'); if (c) c.outerHTML = sheetStatusCard();
  }
  // Google Sheet connection, shown at the top of Settings: connected / saving / offline / not connected.
  function sheetStatusCard() {
    const last = Number(storage.getItem(SYNC_KEY)) || 0;
    const on = connected();
    const st = !on ? ['off', 'Google Sheet not connected', 'Data is kept only on this phone. Connect it in Data & Google Sheet.']
      : /…/.test(sheetMsg) ? ['busy', 'Google Sheet · syncing…', sheetMsg]
        : /Offline/.test(sheetMsg) ? ['warn', 'Google Sheet · offline', `${sheetMsg}. It retries automatically.`]
          : /Not saved/.test(sheetMsg) ? ['warn', 'Google Sheet · changes waiting', 'Saving in a moment…']
            : ['ok', 'Google Sheet connected', last ? `Last saved ${ftime(last)}` : 'Connected'];
    return `<div class="sheet-status ${st[0]}" id="sheet-status"><span class="ss-dot"></span><span class="ss-t"><b>${st[1]}</b><small>${esc(st[2])}</small></span>
      ${on ? `<button type="button" class="btn xs" data-act="sheet-check">Sync now</button>` : `<button type="button" class="btn xs primary" data-stabgo="data">Connect</button>`}</div>`;
  }
  function showSheetState() { syncState(''); }
  async function call(method, payload) {
    const url = set().sheetsUrl;
    const res = method === 'GET'
      ? await fetch(`${url}${url.includes('?') ? '&' : '?'}action=load&secret=${encodeURIComponent(set().sheetsSecret)}`)
      : await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
    const out = await res.json().catch(() => null);
    if (!out) throw new Error(`Google Sheet replied ${res.status}. Check the web app URL and that it is deployed for "Anyone".`);
    if (!out.ok && !out.conflict) throw new Error(out.error || 'Google Sheet refused the request');
    return out;
  }
  function applyRemote(out) {
    admin.loadState(out.state);
    setBase(out.updated);
    setDirty(false);
    // Signed-in login removed or disabled on another device: back to sign-in.
    const acc = me && admin.account(me.id);
    if (!role || !acc || !acc.hash || acc.disabled) { if (role) lock(); else if (!$('#lock').hidden) showLock(); return; }
    me = acc; role = acc.role;
    const editing = modal.open || screen === 'sell' || screen === 'purchase-new' || (document.activeElement && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName));
    if (!editing && !$('#shell').hidden) { const y = window.scrollY; render(); window.scrollTo(0, y); }
  }
  function choose(title, message, keepLabel, useLabel) {
    return new Promise((resolve) => {
      $('#modal-title').textContent = title;
      $('#modal-body').innerHTML = `<p style="margin:0">${esc(message)}</p>`;
      $('#modal-err').textContent = '';
      $('#modal-foot').innerHTML = `<button type="button" class="btn" data-choice="use">${esc(useLabel)}</button><button type="button" class="btn primary" data-choice="keep">${esc(keepLabel)}</button>`;
      const onClick = (e) => {
        const c = e.target.closest('[data-choice]');
        if (!c) return;
        modal.removeEventListener('click', onClick);
        modal.close();
        resolve(c.dataset.choice);
      };
      modal.addEventListener('click', onClick);
      modal.addEventListener('close', () => { modal.removeEventListener('click', onClick); resolve('use'); }, { once: true });
      modal.showModal();
    });
  }
  async function resolveConflict(out) {
    const who = out.by ? ` on ${out.by}` : '';
    const when = out.updated ? new Date(out.updated).toLocaleString('en-IN') : '';
    const pick = await choose('Data changed on another device',
      `The Google Sheet was updated${who} (${when}) while this device had changes that were not saved yet. Which data should be kept? The other version is replaced.`,
      "Keep this device's data", 'Use Google Sheet data');
    if (pick === 'keep') return push(true);
    const remote = await call('GET');
    if (remote.state) applyRemote(remote);
    toast('Loaded the latest data from the Google Sheet');
    return null;
  }
  /** Save this device's data to the sheet. force = overwrite even if another device saved since. */
  async function push(force) {
    if (!connected()) return;
    clearTimeout(saveTimer);
    busy = true;
    syncState('Saving…');
    try {
      const out = await call('POST', { action: 'save', secret: set().sheetsSecret, state: admin.exportState(), sheets: admin.sheetsData(), base: getBase(), by: device(), force: !!force });
      if (out.conflict) { busy = false; await resolveConflict(out); return; }
      setBase(out.updated);
      setDirty(false);
      storage.setItem(SYNC_KEY, String(Date.now()));
      showSheetState();
      const ls = $('#last-sync'); if (ls) ls.textContent = `Connected · last saved ${new Date().toLocaleString('en-IN')}`;
    } catch (err) {
      syncState('Offline: saved on this device');
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => push(), 60000); // retry
      throw err;
    } finally { busy = false; }
  }
  /** Load the latest data from the sheet (or upload this device's data if the sheet is still empty). */
  async function pull(manual) {
    if (!connected() || busy) return;
    clearTimeout(saveTimer);
    lastPull = Date.now();
    busy = true;
    syncState('Loading from Google Sheet…');
    let out;
    try { out = await call('GET'); } catch (err) {
      busy = false;
      syncState('Offline: using data on this device');
      if (manual) toast(err.message, true);
      return;
    }
    busy = false;
    try {
      if (!out.state) { await push(true); if (manual) toast('This device\'s data was saved to the empty Google Sheet'); return; }
      if (out.updated === getBase()) {
        if (isDirty()) await push();
        showSheetState();
        if (manual) toast('Up to date with the Google Sheet');
        return;
      }
      if (isDirty() && getBase()) { await resolveConflict(out); return; }
      if (isDirty() && !getBase()) {
        // First connection of a device that already has data, to a sheet that has data too.
        const pick = await choose('Google Sheet already has data',
          'This device and the Google Sheet both have data. Which should be kept? The other is replaced.',
          "Keep this device's data", 'Use Google Sheet data');
        if (pick === 'keep') { await push(true); return; }
      }
      applyRemote(out);
      showSheetState();
      if (manual) toast('Loaded the latest data from the Google Sheet');
    } catch (err) { if (manual) toast(err.message, true); }
  }
  admin.onChange((source) => {
    if (source === 'remote' || !connected() || !isDirty()) return;
    syncState('Not saved to Google Sheet yet');
    clearTimeout(saveTimer);
    const later = () => { saveTimer = setTimeout(() => (busy || modal.open ? later() : push().catch(() => {})), 1500); };
    later();
  });

  // Auto refresh: load the latest data every 30 s while the app is open, when it comes back
  // to the front, and on pull-down / the refresh button.
  const canAutoRefresh = () => role && connected() && !busy && !modal.open && document.visibilityState === 'visible' && $('#lock').hidden;
  setInterval(() => { if (canAutoRefresh() && Date.now() - lastPull > AUTO_REFRESH_MS - 1000) pull(); }, 5000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && $('#lock').hidden && Date.now() - lastPull > 10000) pull();
  });
  window.addEventListener('online', () => { if (isDirty()) push().catch(() => {}); else pull(); });
  async function refreshNow() {
    if (!connected()) { render(); toast('Refreshed'); return; }
    if (busy) return;
    if (isDirty()) { try { await push(); } catch (_) { /* offline */ } }
    await pull(false);
    render();
    toast('Data refreshed');
  }
  (function pullToRefresh() {
    let startY = null; let dy = 0;
    const ptr = $('#ptr');
    view.addEventListener('touchstart', (e) => { startY = window.scrollY <= 0 && !modal.open ? e.touches[0].clientY : null; dy = 0; }, { passive: true });
    view.addEventListener('touchmove', (e) => {
      if (startY == null) return;
      dy = e.touches[0].clientY - startY;
      if (dy > 10) { ptr.classList.add('show'); ptr.style.transform = `translateY(${Math.min(dy, 90) - 50}px) rotate(${dy * 3}deg)`; }
    }, { passive: true });
    view.addEventListener('touchend', async () => {
      if (startY == null) return;
      startY = null;
      if (dy > 80) { ptr.classList.add('go'); await refreshNow(); }
      ptr.classList.remove('show', 'go'); ptr.style.transform = '';
    });
  }());

  // ── Actions ───────────────────────────────────────────────────
  const setAppt = (id, patch, msg) => { admin.updateAppointment(id, patch); modal.close(); render(); toast(msg); };
  const randomPass = () => { const c = 'abcdefghjkmnpqrstuvwxyz23456789'; let o = ''; const r = new Uint32Array(8); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(r) : r.forEach((_, i) => { r[i] = Math.random() * 1e9; }); r.forEach((x) => { o += c[x % c.length]; }); return o; };
  const ACTIONS = {
    refresh: () => refreshNow(),
    export: (d) => runExport(d.what, d.fmt),
    'user-menu': () => {
      openForm({
        title: me.name, submitLabel: false,
        html: `<dl class="detail-list"><div><dt>Login</dt><dd>${esc(A.ROLES[role])} · ${esc(me.username || "")}</dd></div><div><dt>Data</dt><dd>${connected() ? 'Google Sheet · auto refresh' : 'This device only'}</dd></div><div><dt>App</dt><dd>The Prime Fit Admin ${APP_VERSION}</dd></div></dl>
          <div class="quick"><button type="button" class="btn" data-act="refresh">Refresh data</button><button type="button" class="btn" data-act="my-pin">Change my password</button><button type="button" class="btn" data-act="theme">Theme</button><button type="button" class="btn" data-go="about">What's new</button><button type="button" class="btn danger" data-act="lock">Log out</button></div>
          <p class="credit-line">${esc(CREDIT)}</p>`,
      });
    },
    'my-pin': () => pinForm(me.id, true),
    theme: () => openForm({ title: 'Theme', submitLabel: false, html: themeHtml() }),
    'set-pin': (d) => pinForm(d.id, d.id === me.id),
    'random-pin': async (d) => {
      const a = admin.account(d.id);
      if (!(await confirmBox('Reset password', `Reset the password of ${a.name} (${a.username})? Their old password stops working and a new one is shown once.`, 'Reset password'))) return;
      const pass = randomPass();
      await savePin(a.id, pass);
      render();
      setTimeout(() => showCreds(a, pass, 'Password reset'), 80);
    },
    'add-login': () => loginForm(null),
    'edit-login': (d) => loginForm(admin.account(d.id)),
    'del-login': async (d) => {
      const a = admin.account(d.id);
      if (await confirmBox('Delete login', `Delete the login “${a.name}”? Their records stay; they can no longer sign in.`)) {
        try { admin.deleteAccount(a.id); render(); toast('Login deleted'); } catch (err) { toast(err.message, true); }
      }
    },
    'member-login': (d) => {
      const acc = S().accounts.find((a) => a.memberId === d.id);
      if (role !== 'super') { toast('Only the Super Admin manages logins', true); return; }
      if (acc) loginForm(acc); else loginForm(null, d.id);
    },
    'sheet-load': async () => { setBase(0); await pull(true); render(); },
    'sheet-send': async () => {
      if (!await confirmBox('Send data to Google Sheet', "Replace the Google Sheet's data with this device's data?")) return;
      try { await push(true); toast('Saved this device\'s data to the Google Sheet'); } catch (err) { toast(err.message, true); }
      render();
    },
    'perm-reset': () => { admin.updateSettings({ perms: JSON.parse(JSON.stringify(A.DEFAULT_PERMS)) }); render(); toast('Permissions reset'); },
    'list-add': (d) => {
      const inp = $(`[data-listadd="${d.list}"]`);
      try { admin.addListItem(d.list, inp.value); render(); toast('Option added'); } catch (err) { toast(err.message, true); }
    },
    'list-del': async (d) => {
      if (!(await confirmBox('Remove option', `Remove “${d.name}”? Records that use it keep it.`, 'Remove'))) return;
      try { admin.removeListItem(d.list, d.name); render(); } catch (err) { toast(err.message, true); }
    },
    'list-rename': (d) => openForm({
      title: 'Rename option', fields: [{ name: 'name', label: 'New name', required: true, value: d.name }],
      onSubmit: (v) => { admin.renameListItem(d.list, d.name, v.name); return 'Option renamed'; },
    }),
    'cat-rename': (d) => openForm({
      title: 'Rename category', fields: [{ name: 'name', label: 'New name', required: true, value: d.name }],
      onSubmit: (v) => { admin.renameCategory(d.name, v.name); return 'Category renamed'; },
    }),
    'cat-del': async (d) => {
      if (!(await confirmBox('Delete category', `Delete the category “${d.name}”?`))) return;
      try { admin.deleteCategory(d.name); render(); } catch (err) { toast(err.message, true); }
    },
    kit: () => kitForm(),
    'toggle-alert': (d) => { const it = admin.item(d.id); admin.saveItem({ ...it, alertOff: !it.alertOff }); render(); toast(`${it.name}: alert ${it.alertOff ? 'on' : 'off'}`); },
    'alerts-on': () => { admin.updateSettings({ stockAlerts: true }); render(); },
    'rfilter-clear': () => { Object.keys(repF).forEach((k) => { repF[k] = ''; }); render(); },
    'patient-edit': (d) => {
      const p = S().patients.find((x) => x.id === d.id);
      modal.close();
      openForm({
        title: `Edit patient · ${p.name}`,
        fields: [{ name: 'name', label: 'Name', required: true, value: p.name }, { name: 'mobile', label: 'Mobile', type: 'tel', value: p.mobile },
          { name: 'age', label: 'Age', type: 'number', value: p.age || '' }, { name: 'gender', label: 'Gender', type: 'select', value: p.gender || '', options: [['', 'Select'], ['Female', 'Female'], ['Male', 'Male'], ['Other', 'Other']] },
          { name: 'city', label: 'City', value: p.city || '' }, { name: 'notes', label: 'Notes', value: p.notes || '', span: true }],
        onSubmit: (v) => { admin.updatePatient(p.id, v); return 'Patient saved'; },
      });
    },
    'patient-del': async (d) => {
      const p = S().patients.find((x) => x.id === d.id);
      const sales = S().sales.filter((x) => x.patientId === p.id).length;
      const appts = S().appointments.filter((x) => x.patientId === p.id).length;
      const extra = sales || appts ? ` Their ${sales} sales (stock goes back) and ${appts} appointments are deleted too.` : '';
      if (await confirmBox('Delete patient', `Delete ${p.name}?${extra} This can't be undone.`)) { admin.deletePatient(p.id, true); modal.close(); render(); toast('Patient deleted'); }
    },
    'new-lead': () => leadForm(null),
    lead: (d) => leadDetail(d.id),
    'lead-note': (d) => leadDetail(d.id, true),
    'lead-edit': (d) => { modal.close(); leadForm(admin.lead(d.id)); },
    'lead-del': async (d) => {
      const l = admin.lead(d.id);
      if (await confirmBox('Delete lead', `Delete the lead ${l.name}?`)) { admin.deleteLead(l.id); render(); toast('Lead deleted'); }
    },
    'lead-status': (d) => { admin.setLeadStatus(d.id, d.status); leadDetail(d.id); render(); toast(`Moved to ${d.status}`); },
    'lead-book': (d) => {
      const l = admin.lead(d.id);
      modal.close();
      apptForm(null, { patientName: l.name, mobile: l.mobile, service: l.interest || '', leadId: l.id, date: l.followUp && l.followUp >= admin.today() ? l.followUp : admin.today() });
    },
    'lead-convert': (d) => { admin.convertLead(d.id); modal.close(); render(); toast('Lead converted to patient'); },
    'new-appt': () => apptForm(null),
    appt: (d) => apptDetail(d.id),
    'appt-edit': (d) => apptForm(admin.appointment(d.id)),
    'appt-complete': (d) => { const a = admin.appointment(d.id); setAppt(d.id, { status: 'completed' }, `${a.patientName}: completed${a.paid ? '' : ' · fee still unpaid'}`); },
    'appt-pay': (d) => {
      const a = admin.appointment(d.id);
      openForm({
        title: `Fee received · ${a.patientName}`, submitLabel: `Mark ${inr(a.fee)} paid`,
        fields: [{ name: 'fee', label: 'Amount (₹)', type: 'number', value: a.fee }, { name: 'method', label: 'Payment method', type: 'list', list: 'payMethods', value: 'Cash' }],
        onSubmit: (v) => { admin.updateAppointment(a.id, { paid: true, fee: Number(v.fee) || 0, payMethod: v.method }); return `Payment recorded: ${inr(v.fee)} ${v.method}`; },
      });
    },
    'appt-noshow': (d) => setAppt(d.id, { status: 'noshow' }, 'Marked as no-show'),
    'appt-cancel': (d) => setAppt(d.id, { status: 'cancelled' }, 'Appointment cancelled'),
    'appt-restore': (d) => setAppt(d.id, { status: 'booked' }, 'Appointment restored'),
    'appt-del': async (d) => {
      const a = admin.appointment(d.id);
      if (await confirmBox('Delete appointment', `Delete ${a.patientName}'s appointment on ${fdate(a.date)}?`)) { admin.deleteAppointment(d.id); render(); toast('Appointment deleted'); }
    },
    'add-member': () => memberForm(null),
    'edit-member': (d) => memberForm(admin.member(d.id)),
    'toggle-member': (d) => { const m = admin.member(d.id); admin.setMemberDisabled(d.id, !m.disabled); render(); toast(m.disabled ? `${m.name} disabled` : `${m.name} enabled`); },
    'del-member': async (d) => {
      const m = admin.member(d.id);
      if (await confirmBox('Delete team member', `Delete ${m.name}? Their past sales and incentives stay in reports under their name. To keep them selectable later, Disable instead.`)) { admin.deleteMember(d.id); render(); toast('Deleted'); }
    },
    'edit-sale': (d) => go('sell', { edit: d.id }),
    'del-sale': async (d) => {
      const s = S().sales.find((x) => x.id === d.id);
      if (await confirmBox('Delete sale', `Delete ${s.product} for ${s.patientName} (${inr(s.amount)})? Stock goes back and the incentive is removed.`)) { admin.deleteSale(d.id); render(); toast('Sale deleted'); }
    },
    'sell-to': (d) => {
      const p = S().patients.find((x) => x.id === d.id);
      const last = admin.patientSales(p.id).filter((s) => saleTypes().some(([k]) => k === s.type)).at(-1);
      saleType = last ? last.type : (saleTypes()[0] || ['service'])[0];
      go('sell', { prefill: { type: saleType, patientName: p.name, mobile: p.mobile, patientType: last ? 'renewal' : 'new', itemId: last && d.renew ? last.itemId : '', refId: last ? last.refId : '', sharedId: last ? last.sharedId : '', sharePct: last ? last.sharePct : 50, dietitianId: last ? last.dietitianId : '' } });
    },
    patient: (d) => {
      const p = S().patients.find((x) => x.id === d.id);
      const sales = admin.patientSales(p.id).reverse();
      const appts = S().appointments.filter((a) => a.patientId === p.id).sort((a, b) => (a.date < b.date ? 1 : -1));
      openForm({
        title: p.name, submitLabel: false,
        html: `<p style="margin:0">${esc(p.mobile || 'No mobile')} · ${sales.length} sales · ${appts.length} appointments</p>
          ${sales.length ? `<b>Sales</b>${table(['Date', 'Product', '>Amount', '~Reference'], sales.map((s) => `<tr><td>${fdate(s.date)}</td><td>${typeBadge(s.type)} ${esc(s.product)}</td><td class="r">${inr(s.amount)}</td><td>${splitText(s)}</td></tr>`))}` : ''}
          ${appts.length ? `<b>OPD appointments</b>${table(['Date', 'Mode', 'Status', '>Fee'], appts.map((a) => `<tr><td>${fdate(a.date)} ${esc(time12(a.time))}</td><td>${modeBadge(a.mode)}</td><td>${statusBadge(a.status)}</td><td class="r">${inr(a.fee)}</td></tr>`))}` : ''}
          <div class="quick">${sales.length ? `<button type="button" class="btn" data-act="slip-patient" data-id="${p.id}">Sales slip</button>` : ''}${can('appointments') ? `<button type="button" class="btn" data-act="appt-for" data-id="${p.id}">Book appointment</button>` : ''}${can('sell') ? `<button type="button" class="btn primary" data-act="sell-to" data-id="${p.id}">New sale</button>` : ''}</div>`,
      });
      labelTables($('#modal-body'));
    },
    'appt-for': (d) => { const p = S().patients.find((x) => x.id === d.id); modal.close(); if (screen !== 'appointments') go('appointments'); apptForm(null, { patientName: p.name, mobile: p.mobile }); },
    'renewal-done': (d) => { admin.markRenewal(d.id, Number(d.stage), !!d.done); render(); },
    'add-product': (d) => productForm(null, d.kind),
    'kind-add': () => kindForm(null),
    'kind-edit': (d) => kindForm(admin.kinds().find((k) => k.id === d.id)),
    'kind-up': (d) => { admin.moveKind(d.id, -1); render(); },
    'kind-del': async (d) => {
      const k = admin.kinds().find((x) => x.id === d.id);
      if (!(await confirmBox('Delete type', `Delete the type “${k.name}”? Past sales keep their type name.`))) return;
      try { admin.deleteKind(d.id); render(); toast('Type deleted'); } catch (err) { toast(err.message, true); }
    },
    'edit-product': (d) => productForm(admin.item(d.id)),
    'toggle-item': (d) => { const it = admin.item(d.id); admin.saveItem({ ...it, disabled: !it.disabled }); render(); },
    'edit-plan': (d) => planForm(d.id ? set().dietPlans.find((p) => p.id === d.id) : null),
    'plan-up': (d) => { admin.moveDietPlan(d.id, -1); render(); },
    'plan-down': (d) => { admin.moveDietPlan(d.id, 1); render(); },
    'del-plan': async (d) => { const p = set().dietPlans.find((x) => x.id === d.id); if (p && await confirmBox('Delete plan', `Delete the ${p.name} plan? Past sales keep their name.`)) { admin.deleteDietPlan(d.id); render(); toast('Plan deleted'); } },
    'toggle-plan': (d) => { const p = set().dietPlans.find((x) => x.id === d.id); admin.saveDietPlan({ ...p, disabled: !p.disabled }); render(); },
    'add-item': (d) => itemForm(null, d.cat),
    'edit-item': (d) => itemForm(admin.item(d.id)),
    'del-item': (d) => { try { admin.deleteItem(d.id); modal.close(); render(); toast('Item deleted'); } catch (err) { $('#modal-err').textContent = err.message; } },
    'add-category': () => openForm({
      title: 'Add inventory category',
      fields: [{ name: 'name', label: 'Category name', required: true, placeholder: 'Glucometer strips' },
        { name: 'kind', label: 'Type', type: 'select', value: 'other', options: Object.entries(A.KINDS).map(([k, l]) => [k, k === 'other' ? 'Other inventory' : `${l} (sellable)`]) }],
      onSubmit: (v) => { admin.addCategory(v.name, v.kind); return 'Category added'; },
    }),
    adjust: (d) => {
      const it = admin.item(d.id);
      openForm({
        title: `Adjust stock · ${it.name}`,
        html: `<p style="margin:0">Available now: <b>${num(admin.stockOf(it.id))} ${esc(it.unit)}</b></p>`,
        fields: [{ name: 'qty', label: 'Change (+ add, − remove)', type: 'number', min: -100000, step: 1, required: true, placeholder: '+10 or -2' },
          { name: 'date', label: 'Date', type: 'date', value: admin.today() },
          { name: 'note', label: 'Reason', placeholder: 'Stock count, damaged, sample…', span: true }],
        onSubmit: (v) => { admin.adjustStock(it.id, v.qty, v.note, v.date); return 'Stock updated'; },
      });
    },
    'new-purchase': () => { draft = newDraft(); go('purchase-new'); },
    'edit-purchase': (d) => {
      const p = S().purchases.find((x) => x.id === d.id);
      draft = JSON.parse(JSON.stringify(p));
      go('purchase-new');
    },
    'del-purchase': async (d) => {
      const p = S().purchases.find((x) => x.id === d.id);
      if (await confirmBox('Delete purchase', `Delete invoice ${p.invoiceNo || ''} from ${p.vendor || 'vendor'}? Its stock (${p.lines.map((l) => `${l.name} ${l.qty}`).join(', ')}) and expense are removed.`)) { admin.deletePurchase(d.id); render(); toast('Purchase deleted'); }
    },
    'add-line': () => { draft.lines.push({ itemId: '', qty: 1, rate: '', gst: gstDefault(), batch: '', expiry: '' }); render(); },
    'del-line': (d) => { draft.lines.splice(Number(d.i), 1); if (!draft.lines.length) draft.lines = newDraft().lines; render(); },
    'cancel-purchase': () => { draft = null; go('purchases'); },
    'add-expense': () => expenseForm(null),
    customize: () => customizeForm(),
    'exp-count': (d) => { const on = d.on !== '1'; admin.setExpenseCounted(d.kind, d.name, on); render(); toast(`${d.name}: ${on ? 'counted' : 'not counted'} in totals`); },
    'exp-pick': (d) => { if (d.key === 'cat') expenseCat = expenseCat === d.name ? '' : d.name; else expenseName = expenseName === d.name ? '' : d.name; render(); },
    'add-doctor': () => doctorForm(null),
    'edit-doctor': (d) => doctorForm(admin.doctor(d.id)),
    'del-doctor': async (d) => { const x = admin.doctor(d.id); if (x && await confirmBox('Delete doctor', `Delete ${x.name}? Their appointments keep the name.`)) { admin.deleteDoctor(d.id); render(); toast('Doctor deleted'); } },
    'add-content': () => contentForm(null),
    'edit-content': (d) => contentForm(admin.contentItem(d.id)),
    'content-posted': (d) => { const c = admin.contentItem(d.id); admin.saveContent({ ...c, status: 'posted', postedDate: admin.today() }); render(); toast(`Posted: ${c.title}`); },
    'add-editor': () => editorForm(null),
    'edit-editor': (d) => editorForm(admin.editor(d.id)),
    'del-editor': async (d) => { const x = admin.editor(d.id); if (x && await confirmBox('Delete editor', `Delete ${x.name}? Their videos keep the name.`)) { admin.deleteEditor(d.id); render(); } },
    'editor-login': (d) => { const x = admin.editor(d.id); loginForm(null, '', { name: x.name, role: 'editor', editorId: x.id }); },
    'content-received': (d) => { const c = admin.contentItem(d.id); admin.saveContent({ ...c, status: c.scheduledDate ? 'scheduled' : 'edited', receivedDate: admin.today(), cost: c.cost || '' }); render(); toast('Marked received from editor'); },
    'del-content': async (d) => { const c = admin.contentItem(d.id); if (c && await confirmBox('Delete video', `Delete “${c.title}”?`)) { admin.deleteContent(d.id); render(); } },
    'item-up': (d) => { admin.moveItem(d.id, -1); render(); },
    'item-down': (d) => { admin.moveItem(d.id, 1); render(); },
    'cat-up': (d) => { admin.moveCategory(d.name, -1); render(); },
    'cat-down': (d) => { admin.moveCategory(d.name, 1); render(); },
    'item-kit': (d) => itemKitForm(admin.item(d.id)),
    'del-item-ask': async (d) => {
      const it = admin.item(d.id);
      if (!it) return;
      const hist = S().moves.some((m) => m.itemId === it.id);
      if (!(await confirmBox('Delete item', `Delete ${it.name}?${hist ? ' Its past sales and purchases stay in reports; it disappears from stock, dashboard and new sales.' : ''}`))) return;
      admin.deleteItem(it.id); render(); toast('Item deleted');
    },
    'edit-expense': (d) => expenseForm(S().expenses.find((e) => e.id === d.id)),
    'del-expense': async (d) => {
      const e = S().expenses.find((x) => x.id === d.id);
      const note = e.auto ? ' This entry was added automatically; it comes back if you re-book salary or re-save the invoice.' : '';
      if (await confirmBox('Delete expense', `Delete ${e.category} ${inr(e.amount)}?${note}`)) { admin.deleteExpense(d.id); render(); }
    },
    'post-salary': (d) => { const r = admin.postSalary(d.month); render(); toast(`Booked: salary ${inr(r.salary)}, incentive ${inr(r.incentive)}`); },
    'export-backup': () => download(`primefit-admin-backup-${admin.today()}.json`, admin.exportBackup(), 'application/json'),
    reset: () => openForm({
      title: 'Erase all data', danger: true, submitLabel: 'Erase everything',
      html: '<p style="margin:0">This deletes every appointment, sale, patient, team member, purchase and expense (and from the Google Sheet on the next save). Logins stay. Export a backup first.</p>',
      fields: [{ name: 'confirm', label: 'Type ERASE to confirm', required: true }],
      onSubmit: (v) => { if (v.confirm !== 'ERASE') throw new Error('Type ERASE in capitals'); admin.resetAll(); return 'All data erased'; },
    }),
    'opd-slip': (d) => opdSlip(d.id),
    'camp-add': () => campaignForm(null),
    'camp-edit': (d) => campaignForm((S().campaigns || []).find((x) => x.id === d.id)),
    'camp-del': async (d) => { if (await confirmBox('Delete campaign', 'Delete this campaign? Leads stay.')) { admin.deleteCampaign(d.id); render(); } },
    'idea-add': () => ideaForm(null),
    'idea-trends': () => trendForm(),
    'idea-edit': (d) => ideaForm((S().ideas || []).find((x) => x.id === d.id)),
    'idea-del': (d) => { admin.deleteIdea(d.id); render(); },
    'idea-content': (d) => { const i = (S().ideas || []).find((x) => x.id === d.id); admin.saveContent({ title: i.title, platform: /youtube|short/i.test(i.format) ? 'YouTube' : 'Instagram', status: 'idea', notes: [i.hook, i.tags].filter(Boolean).join(' · ') }); admin.saveIdea({ id: i.id, status: 'planned' }); render(); toast('Added to Content & Posts'); },
    'task-add': () => taskForm(null),
    'task-edit': (d) => taskForm((S().tasks || []).find((x) => x.id === d.id)),
    'task-done': (d) => { const t = (S().tasks || []).find((x) => x.id === d.id); if (!t) return; const was = t.done; admin.setTaskDone(d.id, !was); render(); toast(was ? 'Task reopened' : 'Task done'); },
    'task-del': (d) => { admin.deleteTask(d.id); render(); },
    'target-edit': () => targetForm(),
    invoice: (d) => invoicePdf(d.id),
    slip: (d) => slipDialog(d.id),
    'today-export': () => todayExportForm(),
    'slip-patient': (d) => { modal.close(); setTimeout(() => slipDialog(null, d.id), 30); },
    'slip-sample': () => sampleSlip(),
    'clinic-add': () => clinicForm(null),
    alerts: () => alertsModal(),
    'add-login-role': (d) => loginForm(null, null, { role: d.role }),
    'lead-quick': () => {
      const name = $('#ql-name').value.trim(); const mobile = $('#ql-mobile').value.trim();
      const pr = $('#ql-prio button.on');
      try {
        const l = admin.saveLead({ name, mobile, source: $('#ql-source').value, priority: pr ? pr.dataset.qlprio : 'warm', assignedTo: role === 'desk' || role === 'marketing' ? me.id : '', followUp: shiftDay(admin.today(), Number(set().followUpDays) || 0) });
        render(); toast(`${l.name} added`); const n = $('#ql-name'); if (n) n.focus();
      } catch (err) { toast(err.message, true); }
    },
    'lead-next': (d) => { const l = admin.lead(d.id); const nx = l && nextStage(l); if (!nx) return; admin.setLeadStatus(d.id, nx); render(); toast(`${l.name} moved to ${nx}`); },
    'call-out': (d) => {
      const o = CALL_OUTCOMES.find((x) => x[0] === d.o); const l = admin.lead(d.id); if (!o || !l) return;
      const note = ($('#co-note') || {}).value || ''; const next = ($('#co-date') || {}).value || '';
      const text = [`Call: ${o[1].replace(/^\S+\s/, '')}`, note.trim()].filter(Boolean).join(' · ');
      admin.addLeadActivity(l.id, { type: 'call', text, followUp: o[3] ? next : '', followTime: '' });
      if (o[2] && l.status !== o[2]) admin.setLeadStatus(l.id, o[2]);
      modal.close(); render(); toast(`Saved · ${l.name}`);
      if (d.o === 'booked' && can('appointments') && !l.apptId) ACTIONS['lead-book']({ id: l.id });
    },
    'lead-remind': (d) => { if (modal.open) modal.close(); setTimeout(() => remindForm(d.id), 30); },
    'lead-snooze': (d) => { const l = admin.lead(d.id); if (!l) return; const t = new Date(Date.now() + 3600000); admin.addLeadActivity(l.id, { type: 'note', text: '', followUp: isoOf(t), followTime: hm(t) }); render(); toast(`${l.name}: reminder at ${time12(hm(t))}`); },
    'lead-fu-done': (d) => { const l = admin.lead(d.id); if (!l) return; admin.addLeadActivity(l.id, { type: 'note', text: 'Follow-up done', followUp: '', followTime: '' }); render(); toast(`${l.name}: follow-up done`); },
    'notif-on': () => { try { Notification.requestPermission().then(() => render()); } catch (_) { /* ignore */ } },
    'wa-setup': () => waSetup(),
    'sheet-check': () => pull(true),
    'wa-all': () => { waShowAll = true; render(); },
    'ui-save': () => {
      const labels = {}; $$('[data-uilabel]').forEach((i) => { if (i.value.trim()) labels[i.dataset.uilabel] = i.value.trim(); });
      const off = $$('[data-uion]').filter((c) => !c.checked).map((c) => c.dataset.uion);
      const u = { ...ui(), labels, off, brand: $('#ui-brand').value.trim() };
      const acc = $('#ui-accent').value; const gold = $('#ui-gold').value;
      if (acc && acc !== '#015b53') u.accent = acc; if (gold && gold !== '#d99a1e') u.gold = gold;
      admin.updateSettings({ ui: u }); render(); toast('Branding & menu saved');
    },
    'ui-reset': async () => { if (!(await confirmBox('Reset branding & menu?', 'Menu names, switched-off screens, colours and fonts go back to the defaults.', 'Reset'))) return; admin.updateSettings({ ui: {} }); render(); toast('Back to default'); },
    'show-more': (d) => { showN[d.k] = (showN[d.k] || PAGE) + PAGE * 2; render(); },
    'lead-select': () => { leadSelMode = !leadSelMode; leadSel.clear(); render(); },
    'lead-pick': (d) => { if (leadSel.has(d.id)) leadSel.delete(d.id); else leadSel.add(d.id); render(); },
    'lead-pick-all': () => { filteredLeads().forEach((l) => leadSel.add(l.id)); render(); },
    'lead-bulk': () => {
      const patch = {}; const st = $('#bk-status').value; const ow = $('#bk-owner').value; const tg = $('#bk-tag').value; const fu = $('#bk-follow').value;
      if (st) patch.status = st; if (ow) patch.assignedTo = ow === '__none' ? '' : ow; if (tg) patch.tag = tg; if (fu) patch.followUp = fu;
      if (!Object.keys(patch).length) { toast('Pick a stage, person, tag or date', true); return; }
      try { const n = admin.bulkLeads([...leadSel], patch); leadSel.clear(); leadSelMode = false; render(); toast(`${plural(n, 'lead')} updated`); } catch (err) { toast(err.message, true); }
    },
    'lead-bulk-del': async () => { if (!leadSel.size) { toast('Select leads first', true); return; } if (await confirmBox('Delete leads', `Delete ${plural(leadSel.size, 'lead')}? This cannot be undone.`)) { const n = admin.bulkLeads([...leadSel], { remove: true }); leadSel.clear(); leadSelMode = false; render(); toast(`${plural(n, 'lead')} deleted`); } },
    'lead-import': () => openForm({
      title: 'Import leads', submitLabel: 'Import',
      html: '<p class="hint" style="margin-top:0">Paste one lead per line: <b>name, mobile, source, interest</b> (source and interest are optional). Copy straight from Excel or Google Sheets. Numbers already in Leads are skipped.</p><textarea id="imp-text" rows="8" placeholder="Priya Sharma, 9876543210, Instagram, GLP-1&#10;Rahul, 9811111111"></textarea>',
      fields: [{ name: 'source', label: 'Default source', type: 'select', value: '', options: [['', 'None'], ...set().lists.leadSources.map((x) => [x, x])] }, { name: 'assignedTo', label: 'Assign to', type: 'select', value: '', options: [['', 'Not assigned'], ...S().accounts.filter((a) => !a.disabled).map((a) => [a.id, a.name])] }],
      onSubmit: (v) => { const r = admin.importLeads($('#imp-text').value, { ...(v.source ? { source: v.source } : {}), ...(v.assignedTo ? { assignedTo: v.assignedTo } : {}), followUp: admin.today() }); if (!r.added && r.skipped) throw new Error(`Nothing imported: ${r.skipped} line${r.skipped > 1 ? 's were' : ' was'} duplicate or missing a mobile`); return `${plural(r.added, 'lead')} imported${r.skipped ? `, ${r.skipped} skipped` : ''}`; },
    }),
    'ad-spend': () => adSpendForm(),
    'founder-toggle': (d) => { const f = admin.founder(d.id); if (!f) return; admin.setFounderActive(f.id, !!f.disabled); render(); toast(`${f.name} ${f.disabled ? 'disabled' : 'enabled'}`); },
    'founder-edit': (d) => founderForm(admin.founder(d.id || fdSel) || admin.founders()[0] || null),
    'founder-add': () => founderForm(null),
    'founder-del': async (d) => { const f = admin.founder(d.id); if (f && await confirmBox('Remove founder', `Remove ${f.name}? Their past expenses and capital stay in the records.`, 'Remove')) { admin.deleteFounder(d.id); if (fdSel === d.id) fdSel = ''; render(); toast('Founder removed'); } },
    'capital-add': () => capitalForm(),
    'capital-del': async (d) => { if (await confirmBox('Delete entry', 'Delete this capital entry?')) { admin.deleteCapital(d.id); render(); } },
    'note-quick': () => { const t = $('#qn-text').value.trim(); if (!t) { toast('Write the discussion point first', true); return; } const now = new Date(); const [first, ...rest] = t.split('\n'); admin.saveNote({ title: first.slice(0, 70), text: first.length > 70 ? t : rest.join('\n').trim(), mode: $('#qn-mode').value, tag: $('#qn-tag').value, date: admin.today(), time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, with: fdSel ? [fdSel] : [] }); render(); toast('Discussion saved'); },
    'add-expense-founder': () => { const k = expScope; expScope = 'founder'; expenseForm(null); expScope = k; },
    'exp-founder-all': () => { expScope = 'founder'; go('expenses'); },
    'note-add': () => noteForm(null),
    'note-edit': (d) => noteForm((S().notes || []).find((x) => x.id === d.id)),
    'note-pin': (d) => { const n = (S().notes || []).find((x) => x.id === d.id); if (n) { admin.saveNote({ id: n.id, pinned: !n.pinned }); render(); } },
    'note-done': (d) => { const n = (S().notes || []).find((x) => x.id === d.id); if (n) { admin.saveNote({ id: n.id, done: !n.done }); render(); toast(n.done ? 'Marked done' : 'Reopened'); } },
    'note-del': async (d) => { if (await confirmBox('Delete note', 'Delete this note?')) { admin.deleteNote(d.id); render(); } },
    'customize-on': (d) => { go(d.screen); setTimeout(customizeForm, 80); },
    'theme-more': () => openForm({ title: 'Theme', submitLabel: false, ro: true, html: themeHtml() }),
    'clinic-edit': (d) => clinicForm(admin.clinic(d.id)),
    'clinic-del': async (d) => {
      const c = admin.clinic(d.id);
      if (!(await confirmBox('Delete clinic', `Delete “${c.name}”? Past appointments keep the clinic name.`))) return;
      try { admin.deleteClinic(d.id); render(); toast('Clinic deleted'); } catch (err) { toast(err.message, true); }
    },
    'social-fetch': () => socialFetch(),
    'social-edit': () => socialForm(),
    lock: () => lock(),
  };

  // Actions a view-only login may still use: they open, filter or export, never change data.
  const RO_ACTIONS = ['today-export', 'slip', 'slip-patient', 'slip-sample', 'show-more', 'wa-all', 'sheet-check', 'lead-select', 'lead-pick', 'lead-pick-all', 'alerts', 'exp-founder-all', 'refresh', 'export', 'user-menu', 'my-pin', 'theme', 'invoice', 'lead', 'appt', 'patient', 'toggle-alert', 'alerts-on', 'rfilter-clear', 'exp-pick', 'opd-slip', 'lock'];
  (function roStyle() {
    const st = document.createElement('style');
    st.textContent = `${Object.keys(ACTIONS).filter((k) => !RO_ACTIONS.includes(k)).map((k) => `body.ro [data-act="${k}"]`).join(',')},body.ro [data-go="sell"],body.ro [data-go="purchase-new"],body.ro #view form button[type=submit],body.ro .switch,body.ro .days-in{display:none!important}`;
    document.head.appendChild(st);
  }());
  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (!readOnly() || f.id === 'modal-form' || f.id === 'lk-form') return;
    e.preventDefault(); e.stopImmediatePropagation(); toast('View only: this login cannot change data', true);
  }, true);
  document.addEventListener('click', (e) => {
    if (!$('#lock').hidden) return;
    if (e.target.closest('.addnew')) return;
    const goEl = e.target.closest('[data-go]');
    if (goEl) { e.preventDefault(); if (modal.open) modal.close(); if (goEl.dataset.go === 'purchase-new' && !draft) draft = newDraft(); go(goEl.dataset.go); return; }
    const co = e.target.closest('a[data-callout]');
    if (co) { const id = co.dataset.callout; if (modal.open) modal.close(); setTimeout(() => callOutcome(id), 900); return; }
    const act = e.target.closest('[data-act]');
    const innerLink = e.target.closest('a[href]');
    if (innerLink && act && innerLink !== act && act.contains(innerLink)) return;
    if (act && readOnly() && ACTIONS[act.dataset.act] && !RO_ACTIONS.includes(act.dataset.act)) { e.preventDefault(); toast('View only: this login cannot change data', true); return; }
    if (act && ACTIONS[act.dataset.act] && !(act.tagName === 'A' && act.getAttribute('href'))) { e.preventDefault(); ACTIONS[act.dataset.act](act.dataset); return; }
    if (e.target.closest('a[href]')) return;
    const p = e.target.closest('[data-period]');
    if (p) { period.name = p.dataset.period; render(); return; }
    const st = e.target.closest('[data-saletype]');
    if (st) { saleType = st.dataset.saletype; params = {}; render(); return; }
    const rn = e.target.closest('[data-renewal]');
    if (rn) { renewalFilter = rn.dataset.renewal; render(); return; }
    const rp = e.target.closest('[data-report]');
    if (rp) { reportTab = rp.dataset.report; render(); return; }
    const av = e.target.closest('[data-apptview]');
    if (av) { apptView = av.dataset.apptview; render(); return; }
    const ad = e.target.closest('[data-apptday]');
    if (ad) { apptDay = ad.dataset.apptday; render(); return; }
    const att = e.target.closest('[data-att]');
    if (att) { if (readOnly()) return; const cur = ((S().attendance || {})[deskDay || admin.today()] || {})[att.dataset.att]; admin.setAttendance(deskDay || admin.today(), att.dataset.att, cur === att.dataset.mark ? '' : att.dataset.mark); render(); return; }
    const sg = e.target.closest('[data-stabgo]');
    if (sg) { settingsTab = sg.dataset.stabgo; showSettingsTab(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const ng = e.target.closest('[data-navgroup]');
    if (ng) { const sec = ng.parentElement; sec.classList.toggle('open'); const next = $$('#nav [data-navgroup]').filter((b) => !b.parentElement.classList.contains('open')).map((b) => b.dataset.navgroup); try { localStorage.setItem('primefit.navClosed', JSON.stringify(next)); } catch (_) { /* ignore */ } return; }
    const wt = e.target.closest('[data-watab]');
    if (wt) { waTab = wt.dataset.watab; render(); return; }
    const us = e.target.closest('[data-uiset]');
    if (us) { const k = us.dataset.uiset; const v = us.dataset.v; admin.updateSettings({ ui: { ...ui(), [k]: k === 'noAnim' ? !!v : v } }); render(); return; }
    const qp = e.target.closest('[data-qlprio]');
    if (qp) { $$('#ql-prio button').forEach((b) => b.classList.toggle('on', b === qp)); return; }
    const lv = e.target.closest('[data-leadview]');
    if (lv) { leadView = lv.dataset.leadview; render(); return; }
    const fsl = e.target.closest('[data-fdsel]');
    if (fsl) { fdSel = fsl.dataset.fdsel; render(); return; }
    const nf = e.target.closest('[data-notef]');
    if (nf) { noteF = nf.dataset.notef; render(); return; }
    const es = e.target.closest('[data-expscope]');
    if (es) { expScope = es.dataset.expscope; render(); return; }
    const cp = e.target.closest('[data-clinicpick]');
    if (cp) { apptF.clinic = cp.dataset.clinicpick; apptClinic = cp.dataset.clinicpick; render(); return; }
    const tf = e.target.closest('[data-taskf]');
    if (tf) { taskF = tf.dataset.taskf; render(); return; }
    const ct = e.target.closest('[data-copy-tags]');
    if (ct) { const t = HASHTAGS[Number(ct.dataset.copyTags)][1]; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Hashtags copied')).catch(() => toast(t)); return; }
    const tp = e.target.closest('[data-theme-pick], [data-mode-pick]');
    if (tp) { setTheme(tp.dataset.themePick, tp.dataset.modePick); return; }
    const lsd = e.target.closest('[data-leadsum]');
    if (lsd) { leadSumDay = shiftDay(leadSumDay || admin.today(), Number(lsd.dataset.leadsum)); if (leadSumDay > admin.today()) leadSumDay = admin.today(); render(); return; }
    const lt = e.target.closest('[data-leadtab]');
    if (lt) { leadF.tab = lt.dataset.leadtab; render(); return; }
    const tr = e.target.closest('[data-taprange]');
    if (tr) { tapRange = tr.dataset.taprange; render(); return; }
    const ls = e.target.closest('[data-leadstatus]');
    if (ls) { leadF.status = leadF.status === ls.dataset.leadstatus ? '' : ls.dataset.leadstatus; leadF.tab = 'all'; render(); return; }
    const dn = e.target.closest('[data-day]');
    if (dn) { const n = Number(dn.dataset.day); todayDate = n ? shiftDay(todayDate || admin.today(), n) : admin.today(); render(); }
  });
  // Every Call / WhatsApp tap on a lead is counted for the person signed in (repeat taps within the gap count once).
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-callout], a[data-walead]');
    if (!a || !me || readOnly()) return;
    try { admin.logLeadClick(a.dataset.callout || a.dataset.walead, a.dataset.callout ? 'call' : 'whatsapp'); } catch (_) { /* never block the call */ }
  }, true);
  // Links inside cards (Call / WhatsApp) must not open the card.
  view.addEventListener('click', (e) => { const a = e.target.closest('.lead a, .appt a'); if (!a) return; e.stopPropagation(); if (a.dataset.callout) setTimeout(() => callOutcome(a.dataset.callout), 900); }, true);
  view.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    if (e.target.matches('.appt')) apptDetail(e.target.dataset.id);
    if (e.target.matches('.lead')) leadDetail(e.target.dataset.id);
  });
  view.addEventListener('change', (e) => {
    const t = e.target;
    if (t.value === '__new__') return;
    if (t.dataset.pdate) { period[t.dataset.pdate] = t.value; render(); return; }
    if (t.matches('[data-apptdate]')) { apptDay = t.value || admin.today(); render(); return; }
    if (t.matches('[data-todaydate]')) { todayDate = t.value || admin.today(); render(); return; }
    if (t.matches('[data-deskday]')) { deskDay = t.value || admin.today(); render(); return; }
    if (t.matches('select[data-idea-status]')) { try { admin.saveIdea({ id: t.dataset.ideaStatus, status: t.value }); } catch (err) { toast(err.message, true); } render(); return; }
    if (t.dataset.afilter && t.tagName === 'SELECT') { apptF[t.dataset.afilter] = t.value; render(); return; }
    if (t.dataset.lfilter && t.tagName === 'SELECT') { leadF[t.dataset.lfilter] = t.value; render(); return; }
    if (t.dataset.actfilter && t.tagName === 'SELECT') { actF[t.dataset.actfilter] = t.value; render(); return; }
    if (t.dataset.rfilter) { repF[t.dataset.rfilter] = t.value; render(); return; }
    if (t.dataset.cfilter) { contentF[t.dataset.cfilter] = t.value; render(); return; }
    const f = t.dataset.filter;
    if (!f) return;
    const setters = {
      type: (v) => { salesFilter.type = v; }, member: (v) => { salesFilter.member = v; }, pt: (v) => { salesFilter.pt = v; },
      ledger: (v) => { ledgerMember = v; }, salary: (v) => { salaryMonth = v; }, expense: (v) => { expenseCat = v; }, expensename: (v) => { expenseName = v; },
      pstatus: (v) => { patientStatus = v; }, invcat: (v) => { invF.cat = v; }, invstatus: (v) => { invF.status = v; }, teamstatus: (v) => { teamStatus = v; },
    };
    if (!setters[f]) return;
    setters[f](t.value);
    render();
  });
  // Search boxes filter as you type and keep the cursor in place.
  let searchTimer = 0;
  view.addEventListener('input', (e) => {
    const t = e.target;
    let key = t.dataset.filter || null; let sel = `[data-filter="${key}"]`;
    if (t.dataset.afilter === 'q') { key = 'aq'; sel = '[data-afilter="q"]'; }
    if (t.dataset.lfilter === 'q') { key = 'lq'; sel = '[data-lfilter="q"]'; }
    if (t.dataset.actfilter === 'q') { key = 'xq'; sel = '[data-actfilter="q"]'; }
    if ('noteq' in t.dataset) { key = 'nq'; sel = '[data-noteq]'; }
    const setters = { nq: (v) => { noteQ = v; }, q: (v) => { salesFilter.q = v; }, patient: (v) => { patientQ = v; }, purchase: (v) => { purchaseQ = v; }, aq: (v) => { apptF.q = v; }, lq: (v) => { leadF.q = v; }, xq: (v) => { actF.q = v; } };
    if (!setters[key]) return;
    setters[key](t.value);
    // Wait for a short pause in typing, then filter once (no lag on long lists).
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const cur = $(sel); const pos = cur ? cur.selectionStart : null;
      showN = {}; render();
      const again = $(sel);
      if (again && pos != null) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (_) { /* search inputs */ } }
    }, 180);
  });
  $('#menu-btn').addEventListener('click', () => openMenu(true));
  $('#nav-q').addEventListener('input', () => renderNav());
  $('#nav-q').addEventListener('keydown', (e) => { if (e.key === 'Enter') { const b = $('#nav button[data-go]'); if (b) b.click(); } });
  $('#side-quick').addEventListener('click', () => { if (window.matchMedia('(max-width: 900px)').matches) openMenu(false); });
  $('#scrim').addEventListener('click', () => openMenu(false));

  // ── Login: every person signs in with their own name and PIN ──
  async function hashPin(pin, salt) {
    const text = `${salt}:${pin}`;
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 5381; for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
    return 'djb' + h.toString(16);
  }
  async function savePin(id, pin) {
    const salt = Math.random().toString(36).slice(2, 12);
    admin.setAccountPin(id, await hashPin(pin, salt), salt, pin.length, pin);
  }
  function pinForm(id, needOld) {
    const u = admin.account(id);
    openForm({
      ro: true,
      title: `${u.hash ? 'Change' : 'Set'} password · ${u.name}`,
      fields: [
        ...(needOld && u.hash ? [{ name: 'old', label: 'Current password', type: 'password', required: true, attrs: 'autocomplete="current-password"' }] : []),
        { name: 'pin', label: 'New password (at least 4 characters)', type: 'password', required: true, attrs: 'autocomplete="new-password"' },
        { name: 'pin2', label: 'Repeat new password', type: 'password', required: true, attrs: 'autocomplete="new-password"' },
      ],
      onSubmit: async (v) => {
        if (needOld && u.hash && (await hashPin(v.old, u.salt)) !== u.hash) throw new Error('Current password is wrong');
        PASS_RULE(v.pin);
        if (v.pin !== v.pin2) throw new Error('The two passwords do not match');
        await savePin(u.id, v.pin);
        return `Password saved for ${u.name}`;
      },
    });
  }

  let lockMode = 'login'; // login | setup | connect
  const lastUser = () => { try { return localStorage.getItem('primefit.admin.lastUser') || ''; } catch (_) { return ''; } };
  const passField = (id, label, ac) => `<label class="f" style="text-align:left">${label}<span class="pass-wrap"><input id="${id}" type="password" autocomplete="${ac}" autocapitalize="none" spellcheck="false"><button type="button" class="pass-eye" data-lock="eye" data-for="${id}" aria-label="Show password">${svg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>')}</button></span></label>`;
  function lockHtml() {
    if (!S().accounts.some((a) => a.role === 'super' && a.hash) && lockMode === 'login') lockMode = 'setup';
    if (lockMode === 'setup') {
      return `<h1>Welcome to The Prime Fit</h1><p>First time on this device? Create the Super Admin login, or connect to The Prime Fit Google Sheet to use the logins already set up there.</p>
        <label class="f" style="text-align:left">Super Admin user ID<input id="lk-user" value="superadmin" autocapitalize="none" autocomplete="username" spellcheck="false"></label>
        ${passField('lk-pin', 'Password (at least 4 characters)', 'new-password')}
        ${passField('lk-pin2', 'Repeat password', 'new-password')}
        <button class="btn primary" data-lock="create">Create Super Admin</button>
        <div class="lock-links"><button class="link" data-lock="connect-mode">Connect Google Sheet instead</button></div>
        <small class="err" id="lk-err"></small>`;
    }
    if (lockMode === 'connect') {
      return `<h1>Connect Google Sheet</h1><p>Paste the web app URL and secret from the Apps Script set-up. Data and logins load from the sheet.</p>
        <label class="f" style="text-align:left">Web app URL<input id="lk-url" value="${esc(set().sheetsUrl)}" placeholder="https://script.google.com/macros/s/…/exec"></label>
        <label class="f" style="text-align:left">Secret<input id="lk-secret" type="password" value="${esc(set().sheetsSecret)}"></label>
        <button class="btn primary" data-lock="connect">Connect & load data</button>
        <div class="lock-links"><button class="link" data-lock="back">Back</button></div>
        <small class="err" id="lk-err"></small>`;
    }
    return `<h1>Sign in</h1><p>Enter your user ID and password</p>
      <form id="lk-form" class="lk-form" autocomplete="on">
        <label class="f" style="text-align:left">User ID<span class="pass-wrap"><input id="lk-user" value="${esc(lastUser())}" autocapitalize="none" autocomplete="username" spellcheck="false" placeholder="e.g. superadmin"></span></label>
        ${passField('lk-pass', 'Password', 'current-password')}
        <button class="btn primary lk-go" type="submit">Sign in</button>
      </form>
      <small class="err" id="lk-err"></small>
      <p class="lk-help">Forgot your password? Ask the Super Admin to reset it.</p>
      <div class="lock-links">${!connected() ? '<button class="link" data-lock="connect-mode">Connect Google Sheet</button>' : ''}</div>`;
  }
  function showLock() {
    role = null; me = null;
    $('#shell').hidden = true; $('#lock').hidden = false;
    if (modal.open) modal.close();
    $('#lock-body').innerHTML = lockHtml();
    const first = $('#lock-body input');
    if (first) setTimeout(() => first.focus(), 60);
  }
  let fails = 0; let waitUntil = 0;
  async function tryLogin() {
    const err = $('#lk-err');
    if (Date.now() < waitUntil) { err.textContent = `Too many tries. Wait ${Math.ceil((waitUntil - Date.now()) / 1000)} s.`; return; }
    const user = $('#lk-user').value.trim(); const pass = $('#lk-pass').value;
    if (!user || !pass) { err.textContent = 'Enter your user ID and password'; return; }
    const u = admin.accountByUsername(user);
    if (u && u.hash && !u.disabled && (await hashPin(pass, u.salt)) === u.hash) {
      fails = 0;
      try { localStorage.setItem('primefit.admin.lastUser', u.username); } catch (_) { /* ignore */ }
      enter(u.id);
      return;
    }
    fails += 1;
    if (fails >= 5) { waitUntil = Date.now() + 30000; fails = 0; }
    $('#lk-pass').value = '';
    const card = $('#lk-form'); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    err.textContent = u && u.disabled ? 'This login is disabled' : 'Wrong user ID or password';
  }
  function enter(id) {
    const acc = admin.account(id);
    if (!acc || acc.disabled) { showLock(); return; }
    me = acc; role = acc.role;
    admin.setActor(acc.name);
    try { sessionStorage.setItem(ROLE_KEY, id); localStorage.setItem('primefit.admin.lastLogin', id); if (can('diet')) sessionStorage.setItem('primefit.diet', '1'); else sessionStorage.removeItem('primefit.diet'); } catch (_) { /* ignore */ }
    $('#lock').hidden = true; $('#shell').hidden = false;
    screen = /^#admin/.test(location.hash) ? adminHome() : home();
    changedScreen = true;
    try { history.replaceState({ screen }, ''); } catch (_) { /* ignore */ }
    render();
    pull();
    setTimeout(remindFollowUps, 1200);
  }
  // Follow-up reminders: once a day after sign-in a list of today's and overdue follow-ups, and an alert
  // 10 minutes before each follow-up time while the app is open.
  const remindKey = () => `primefit.remind.${me ? me.id : ''}.${admin.today()}`;
  function remindFollowUps() {
    if (!me || !can('leads') || !$('#lock').hidden) return;
    const x = admin.leadDay(admin.today(), myLeadFilter());
    const due = [...x.overdue, ...x.dueToday];
    let seen = {};
    try { seen = JSON.parse(localStorage.getItem(remindKey()) || '{}'); } catch (_) { seen = {}; }
    const keep = () => { try { localStorage.setItem(remindKey(), JSON.stringify(seen)); } catch (_) { /* ignore */ } };
    if (!seen.list && due.length && !modal.open) {
      seen.list = 1; keep();
      openForm({
        title: `Follow-up reminders · ${due.length}`, submitLabel: false,
        html: `<p class="hint" style="margin-top:0">${x.overdue.length ? `<b>${x.overdue.length} overdue</b> · ` : ''}${x.dueToday.length} due today. Tap a name to open the lead.</p>
          <div class="fu-list">${due.slice(0, 12).map((l) => `<div class="fu-row"><span class="fu-when ${l.followUp < admin.today() ? 'bad' : 'warn'}">${l.followUp < admin.today() ? fdate(l.followUp) : 'Today'}${l.followTime ? `<small>${time12(l.followTime)}</small>` : ''}</span><button type="button" class="fu-name" data-act="lead" data-id="${l.id}"><b>${esc(l.name)}</b><small>${esc(l.status)}</small></button><span class="fu-acts"><a class="btn xs" href="tel:${esc(l.mobile)}" data-callout="${l.id}">Call</a></span></div>`).join('')}</div>
          <div class="quick"><button type="button" class="btn primary" data-go="leads">Open leads</button></div>`,
      });
    }
    const now = new Date(); const hhmm = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const soon = hhmm(new Date(now.getTime() + (Number(set().remindMins) || 10) * 60000)); const nowT = hhmm(now);
    x.dueToday.filter((l) => l.followTime && l.followTime >= nowT && l.followTime <= soon && !seen[l.id]).forEach((l) => {
      seen[l.id] = 1; keep();
      toast(`Follow-up at ${time12(l.followTime)}: ${l.name} (${l.mobile})`);
      try { if (navigator.vibrate) navigator.vibrate([120, 80, 120]); } catch (_) { /* ignore */ }
      try { if (window.Notification && Notification.permission === 'granted') new Notification('Follow-up reminder', { body: `${time12(l.followTime)} · ${l.name} · ${l.mobile}`, icon: '../img/icon-192.png' }); } catch (_) { /* ignore */ }
    });
  }
  setInterval(remindFollowUps, 60000);
  // Auto sign-out after the idle minutes set in Settings (0 = never).
  let lastTouch = Date.now();
  ['pointerdown', 'keydown', 'scroll'].forEach((ev) => document.addEventListener(ev, () => { lastTouch = Date.now(); }, { passive: true, capture: true }));
  setInterval(() => { const m = Number(set().autoLockMins) || 0; if (m && me && $('#lock').hidden && Date.now() - lastTouch > m * 60000) { lock(); toast('Signed out after inactivity'); } }, 30000);
  function lock() {
    try { sessionStorage.removeItem(ROLE_KEY); sessionStorage.removeItem('primefit.diet'); } catch (_) { /* ignore */ }
    admin.setActor('');
    showLock();
  }
  $('#lock').addEventListener('submit', (e) => { if (e.target.id === 'lk-form') { e.preventDefault(); tryLogin(); } });
  $('#lock').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-lock]');
    if (!b) return;
    const a = b.dataset.lock;
    if (a === 'eye') { const i = $(`#${b.dataset.for}`); i.type = i.type === 'password' ? 'text' : 'password'; b.classList.toggle('on', i.type === 'text'); return; }
    if (a === 'connect-mode') { lockMode = 'connect'; showLock(); return; }
    if (a === 'back') { lockMode = 'login'; showLock(); return; }
    if (a === 'create') {
      const pin = $('#lk-pin').value;
      if (pin.length < 4) { $('#lk-err').textContent = 'Use at least 4 characters'; return; }
      if (pin !== $('#lk-pin2').value) { $('#lk-err').textContent = 'The two passwords do not match'; return; }
      const sup = S().accounts.find((x) => x.role === 'super');
      try { admin.saveAccount({ ...sup, username: $('#lk-user').value.trim() || 'superadmin', disabled: false }); } catch (err) { $('#lk-err').textContent = err.message; return; }
      await savePin(sup.id, pin);
      try { localStorage.setItem('primefit.admin.lastUser', admin.account(sup.id).username); } catch (_) { /* ignore */ }
      lockMode = 'login';
      enter(sup.id);
      toast(`Welcome! Your user ID is ${admin.account(sup.id).username}. Add logins for your team in Settings → Logins.`);
      return;
    }
    if (a === 'connect') {
      const url = $('#lk-url').value.trim(); const secret = $('#lk-secret').value.trim();
      if (!/^https:\/\//.test(url) || !secret) { $('#lk-err').textContent = 'Enter the web app URL and the secret'; return; }
      admin.updateSettings({ sheetsUrl: url, sheetsSecret: secret });
      b.disabled = true; b.textContent = 'Connecting…';
      try {
        const out = await call('GET');
        if (out.state) { admin.loadState(out.state); setBase(out.updated); setDirty(false); }
        lockMode = 'login';
        showLock();
        toast(out.state ? 'Connected. Sign in with your user ID and password.' : 'Connected. The sheet is empty: create the Super Admin login.');
      } catch (err) {
        $('#lk-err').textContent = err.message;
        b.disabled = false; b.textContent = 'Connect & load data';
      }
    }
  });
  let idle = Date.now();
  ['click', 'keydown', 'touchstart'].forEach((ev) => document.addEventListener(ev, () => { idle = Date.now(); }, { passive: true }));
  setInterval(() => { if (role && Date.now() - idle > IDLE_LOCK_MS) lock(); }, 30000);

  // Android back button: the app asks the page first (see MainActivity).
  window.hdvBack = () => {
    if (modal.open) { modal.close(); return true; }
    if ($('#side').classList.contains('open')) { openMenu(false); return true; }
    // Back always returns to the admin dashboard (never the Home page); on the dashboard it leaves the app.
    if (role && screen !== adminHome()) { go(adminHome()); return true; }
    return false;
  };

  $('.side-credit').textContent = CREDIT;
  let saved = null;
  try { saved = sessionStorage.getItem(ROLE_KEY); } catch (_) { saved = null; }
  const savedAcc = saved && admin.account(saved);
  if (savedAcc && savedAcc.hash && !savedAcc.disabled) enter(saved); else showLock();
})();
