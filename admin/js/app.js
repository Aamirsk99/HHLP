/* The Prime Fit Admin — dashboard, today summary, OPD appointments, lead management (CRM), sales,
 * patients, renewals, products, inventory, purchases, team, incentives, salary, expenses,
 * reports (PDF / Excel / A4 image), activity log and settings. Logins: Super Admin, Admin,
 * Manager, Front Desk, plus a personal login for any team member.
 * Developed by Aamir Sk · The Prime Fit Digital Marketing Team. */
(function () {
  const A = window.ADMIN;
  const X = window.EXPORT;
  const APP_VERSION = '3.1';
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
  const inr = (n) => { const v = Math.round(Number(n) || 0); return (v < 0 ? '−₹' : '₹') + Math.abs(v).toLocaleString('en-IN'); };
  const plural = (n, one, many) => `${num(n)} ${n === 1 ? one : many || one + 's'}`;
  const num = (n) => (Number(n) || 0).toLocaleString('en-IN');
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fdate = (d) => { if (!d) return ''; const [y, m, dd] = d.split('-'); return dd ? `${Number(dd)} ${MONTHS[m - 1]} ${y}` : `${MONTHS[m - 1]} ${y}`; };
  const ftime = (ms) => new Date(ms).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
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
  const NAV = [
    ['dashboard', 'Dashboard', '<path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-4H4zM14 4v4h6V4z"/>', 'Overview'],
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
    ['incentives', 'Incentives', '<path d="M12 3v18M17 7H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6"/>'],
    ['salary', 'Salary', '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>'],
    ['expenses', 'Expenses', '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'],
    ['content', 'Content & Posts', '<rect x="3" y="5" width="14" height="14" rx="2"/><path d="M17 10l4-2v8l-4-2M8 9l4 3-4 3z"/>', 'Marketing'],
    ['reports', 'Reports', '<path d="M5 3h14v18H5zM9 8h6M9 12h6M9 16h3"/>', 'Reports'],
    ['activity', 'Activity Log', '<path d="M3 12h4l3-8 4 16 3-8h4"/>'],
    ['settings', 'Settings', '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>', 'Admin'],
    ['about', "What's new", '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>'],
  ];
  // Access: Super Admin opens everything; Admin, Manager and Front Desk follow Settings → Roles.
  const ALL = NAV.map((n) => n[0]).concat('purchase-new');
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
    return list.concat('about');
  }
  const can = (id) => !!role && allowed(role).includes(id);
  const canDelete = () => role === 'super' || !!((set().perms || {})[role] || {}).del;
  const home = () => ['dashboard', 'today', 'appointments', 'leads'].find(can) || 'about';
  let changedScreen = true;

  function go(id, p, fromHistory) {
    if (id === 'menu') { openMenu(true); return; }
    if (!can(id)) id = home();
    changedScreen = id !== screen;
    screen = id; params = p || {};
    openMenu(false);
    if (!fromHistory && changedScreen) { try { history.pushState({ screen: id }, ''); } catch (_) { /* file:// may refuse */ } }
    render();
    window.scrollTo(0, 0);
  }
  function openMenu(on) {
    $('#side').classList.toggle('open', on);
    $('#scrim').hidden = !on;
  }
  // Back button (Android and browser): close a dialog or the menu first, then go to the previous screen.
  window.addEventListener('popstate', (e) => {
    if (modal.open) { modal.close(); try { history.pushState({ screen }, ''); } catch (_) { /* ignore */ } return; }
    if ($('#side').classList.contains('open')) { openMenu(false); try { history.pushState({ screen }, ''); } catch (_) { /* ignore */ } return; }
    if (!role) return;
    go(e.state && e.state.screen ? e.state.screen : home(), {}, true);
  });

  // Bottom menu: 1 Dashboard · 2 Today summary · 3 Sale · 4 OPD · 5 Inventory (only what the login may open).
  const TAB_ORDER = ['dashboard', 'today', 'sell', 'appointments', 'inventory'];
  const DESK_TABS = ['appointments', 'leads', 'today'];
  function renderNav() {
    const due = can('renewals') ? admin.renewals().filter((r) => r.stage && !r.done).length : 0;
    const lowN = can('inventory') ? admin.lowStock().length + admin.orderRequired().length : 0;
    const todayN = admin.appointmentsIn({ from: admin.today(), to: admin.today() }).filter((a) => a.status === 'booked').length;
    const leadsDue = can('leads') ? admin.leadStats(null, myLeadFilter()).dueToday + admin.leadStats(null, myLeadFilter()).overdue : 0;
    const badge = (id) => (id === 'renewals' && due ? `<span class="badge warn">${due}</span>`
      : id === 'inventory' && lowN ? `<span class="badge bad">${lowN}</span>`
        : id === 'appointments' && todayN ? `<span class="badge info">${todayN}</span>`
          : id === 'leads' && leadsDue ? `<span class="badge warn">${leadsDue}</span>` : '');
    const items = NAV.filter((n) => can(n[0]));
    $('#nav').innerHTML = items.map(([id, label, icon, group]) => `${group ? `<div class="nav-group">${group}</div>` : ''}<button type="button" data-go="${id}" class="${screen === id || (id === 'purchases' && screen === 'purchase-new') ? 'on' : ''}">${svg(icon)}<span>${label}</span>${badge(id)}</button>`).join('');
    const tabs = (can('dashboard') ? TAB_ORDER : DESK_TABS).filter(can);
    $('#tabs').hidden = tabs.length < 2;
    const tabLabel = { dashboard: 'Dashboard', today: 'Today', appointments: 'OPD', inventory: 'Inventory', leads: 'Leads' };
    $('#tabs').innerHTML = tabs.map((id) => {
      if (id === 'sell') return `<button type="button" data-go="sell" class="fab" aria-label="New sale">${svg('<path d="M12 5v14M5 12h14"/>')}<span>Sale</span></button>`;
      const n = NAV.find((x) => x[0] === id);
      return `<button type="button" data-go="${id}" class="${screen === id ? 'on' : ''}">${svg(n[2])}<span>${tabLabel[id] || n[1]}</span>${badge(id).replace('badge', 'badge dot')}</button>`;
    }).join('');
    $('#side-sub').textContent = `${me.name} · ${A.ROLES[role]}`;
    $('#user-initial').textContent = me.name.trim().charAt(0).toUpperCase();
  }

  function render() {
    if (!role) return;
    const f = SCREENS[screen] || SCREENS[home()];
    const nav = NAV.find((n) => n[0] === screen);
    $('#title').textContent = TITLES[screen] || (screen === 'sell' && params.edit ? 'Edit Sale' : nav ? nav[1] : '');
    $('#top-sub').textContent = SUBS[screen] ? SUBS[screen]() : `${me.name} · ${A.ROLES[role]}`;
    view.innerHTML = f();
    view.classList.toggle('enter', changedScreen);
    labelTables(view);
    renderNav();
    if (AFTER[screen]) AFTER[screen]();
    if (changedScreen) countUp(view);
    changedScreen = false;
  }
  // Numbers in the summary boxes count up when a screen opens.
  function countUp(root) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    $$('.kpi b, .hk b', root).forEach((el) => {
      const text = el.textContent;
      const m = text.match(/^(−?₹?)([\d,]+)$/);
      if (!m) return;
      const target = Number(m[2].replace(/,/g, ''));
      if (!target || target > 1e9) return;
      const t0 = performance.now(); const dur = 650;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 3);
        el.textContent = m[1] + Math.round(target * e).toLocaleString('en-IN');
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
  const typeBadge = (t) => `<span class="badge ${t === 'injection' ? 'info' : t === 'protein' ? 'ok' : 'warn'}">${A.SALE_TYPES[t]}</span>`;
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
  function openForm({ title, fields, html, submitLabel, onSubmit, danger }) {
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
    return `<div class="toolbar">${periodBar()}<span class="grow"></span>${exportBtns('dashboard')}</div>
      <section class="hero">
        <div><small>${esc(set().clinic)} · ${esc(periodLabel())}</small></div>
        <div class="hero-row">
          <div class="hk"><small>Today's OPD</small><b>${num(td.total - td.cancelled)}</b><small>${td.completed} done · ${td.booked} waiting</small></div>
          <div class="hk"><small>Revenue</small><b>${inr(s.revenue)}</b></div>
          <div class="hk"><small>Net profit</small><b>${inr(s.profit)}</b></div>
          <div class="hk"><small>Renewals due</small><b>${num(d.renewalsDue)}</b></div>
        </div>
      </section>
      ${st.order.length && can('inventory') ? `<button type="button" class="order-banner" data-go="today">${svg('<path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>')}<span><b>Order required</b>${st.order.map((o) => `${esc(o.item.name)} (${num(o.stock)})`).join(' · ')}</span>${svg('<path d="M9 5l7 7-7 7"/>')}</button>` : ''}
      ${reminderBanner(d.content)}
      ${empty ? `<div class="card"><h2>Welcome</h2><p>Start in three steps: <button class="link" data-go="team">add your team</button>, <button class="link" data-go="products">set product prices</button>, then <button class="link" data-go="purchases">add stock</button>. Appointments and sales then update revenue, stock and incentives automatically.</p></div>` : ''}
      ${can('sales') || can('sell') ? `<section class="card">${H('<path d="M4 19h16M7 16V9M12 16V5M17 16v-4"/>', 'teal', "Today's sales")}<span class="sp"></span>
        ${table(['Patient', 'Product', '>Amount', 'Reference'], d.todaySales.map((x) => `<tr><td>${esc(x.patientName)}</td><td>${typeBadge(x.type)} ${esc(x.product)}</td><td class="r"><b>${inr(x.amount)}</b></td><td><b>${splitText(x)}</b></td></tr>`),
          d.todaySales.length ? `<td colspan="2">Total · ${plural(d.todaySales.length, 'sale')}</td><td class="r">${inr(d.todaySales.reduce((a, x) => a + x.amount, 0))}</td><td></td>` : '')}</section>` : ''}
      <div class="cards">
        <section class="card">${H('<path d="M4 19h16M7 16V9M12 16V5M17 16v-4"/>', '', 'Sales summary')}<div class="kpis">
          ${kpi('Total orders', num(s.orders))}
          ${kpi('Total revenue', inr(s.revenue))}
          ${kpi('Total expenses', inr(s.expenses), '', 'gold')}
          ${kpi('Net profit', inr(s.profit), 'Revenue − Expenses', s.profit >= 0 ? 'good' : 'bad')}
          ${kpi('Injection sales', inr(s.injection), plural(s.injectionCount, 'order'))}
          ${kpi('Protein sales', inr(s.protein), plural(s.proteinCount, 'order'), 'teal')}
          ${kpi('Diet support', inr(s.diet), plural(s.dietCount, 'plan'), 'violet')}
          ${kpi('Consultation fees', inr(s.consultation), `${ap.total - ap.cancelled} appointments`, 'teal')}
        </div></section>
        <section class="card">${H(ICON_CAL, 'violet', 'OPD appointments')}<div class="kpis">
          ${kpi('Appointments', num(ap.total))}
          ${kpi('Clinic visits', num(ap.clinic), '', 'teal')}
          ${kpi('Online', num(ap.online), '', 'violet')}
          ${kpi('Completed', num(ap.completed), '', 'good')}
          ${kpi('Fees collected', inr(ap.fees), '', 'good')}
          ${kpi('Unpaid', num(ap.unpaid), '', ap.unpaid ? 'warn' : '')}
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
          ${kpi('Injection stock', num(st.injection), 'pens')}
          ${kpi('Protein stock', num(st.protein), '', 'teal')}
          ${kpi('Low stock alerts', set().stockAlerts === false ? 'Off' : num(st.low.length), '', st.low.length ? 'bad' : 'good')}
          ${kpi('Needles', num(st.needles))}
          ${kpi('Swabs', num(st.swabs))}
          ${kpi('Syringes', num(st.syringes))}
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
  const filteredContent = () => [...S().content].filter((c) => (!contentF.status || c.status === contentF.status) && (!contentF.editor || c.editor === contentF.editor)
    && (!contentF.platform || c.platform === contentF.platform) && (inR(c.date || '', range()) || inR(c.postedDate || '', range()) || inR(c.scheduledDate || '', range())))
    .sort((a, b) => ((a.scheduledDate || a.date || '') < (b.scheduledDate || b.date || '') ? 1 : -1));
  SUBS.content = () => `Videos · ${periodLabel()}`;
  SCREENS.content = () => {
    const st = admin.contentStats(range());
    const list = filteredContent();
    const editors = [...new Set(S().content.map((c) => c.editor).filter(Boolean))];
    const row = (c) => `<tr><td><b>${esc(c.title)}</b><span class="sub">${esc([c.platform, c.editor && `Editor: ${c.editor}`].filter(Boolean).join(' · '))}</span></td>
      <td>${contentBadge(c.status)}</td>
      <td>${c.status === 'posted' ? `Posted ${fdate(c.postedDate)}` : c.scheduledDate ? `${fdate(c.scheduledDate)}${c.scheduledTime ? ` ${time12(c.scheduledTime)}` : ''}${c.status === 'scheduled' && c.scheduledDate < admin.today() ? ' <span class="badge bad">Overdue</span>' : ''}` : '—'}</td>
      <td class="r">${c.cost ? inr(c.cost) : '–'}</td>
      <td class="acts">${c.status !== 'posted' ? `<button class="btn xs success" data-act="content-posted" data-id="${c.id}">✓ Posted</button> ` : ''}<button class="btn xs" data-act="edit-content" data-id="${c.id}">Edit</button>${canDelete() ? ` <button class="btn xs danger" data-act="del-content" data-id="${c.id}">Delete</button>` : ''}</td></tr>`;
    return `<div class="toolbar">${periodBar()}<span class="grow"></span>${exportBtns('content')}</div>
      ${reminderBanner(st)}
      <div class="kpis" style="margin-bottom:14px">${kpi('Total videos', num(st.total))}${kpi('To edit', num(st.toEdit), '', 'gold')}${kpi('Total edited', num(st.edited), '', 'teal')}${kpi('Total posted', num(st.posted), '', 'good')}${kpi('Remaining to post', num(st.remaining), `${st.scheduled} scheduled`, st.remaining ? 'violet' : '')}</div>
      <div class="filters"><div class="row">
        <select data-cfilter="status" aria-label="Status">${opt('', 'All statuses', contentF.status)}${Object.entries(A.CONTENT_STATUS).map(([k, l]) => opt(k, l, contentF.status)).join('')}</select>
        <select data-cfilter="editor" aria-label="Editor">${opt('', 'All editors', contentF.editor)}${editors.map((x) => opt(x, x, contentF.editor)).join('')}</select>
        <select data-cfilter="platform" aria-label="Platform">${opt('', 'All platforms', contentF.platform)}${set().lists.platforms.map((x) => opt(x, x, contentF.platform)).join('')}</select>
        <button class="btn primary" data-act="add-content">+ Add video</button></div></div>
      ${st.upcoming.length ? `<div class="card"><h2><span class="ic violet">${svg(ICON_CAL)}</span>Scheduled posts</h2><div class="alerts">${st.upcoming.map((c) => `<div class="alert"><b>${esc(c.title)}</b><span class="badge violet">${fdate(c.scheduledDate)}${c.scheduledTime ? ` · ${time12(c.scheduledTime)}` : ''}${c.platform ? ` · ${esc(c.platform)}` : ''}</span></div>`).join('')}</div></div>` : ''}
      <div class="card">${table(['Video', 'Status', 'Schedule / posted', '>Edit cost', ''], list.map(row))}</div>
      ${st.byEditor.length ? `<div class="card"><h2>By editor</h2>${table(['Editor', '>Edited', '>Posted', '>Editing cost'], st.byEditor.map((x) => `<tr><td>${esc(x.name)}</td><td class="r">${num(x.edited)}</td><td class="r">${num(x.posted)}</td><td class="r">${inr(x.cost)}</td></tr>`))}</div>` : ''}`;
  };
  function contentForm(c) {
    openForm({
      title: c ? 'Edit video' : 'Add video',
      fields: [
        { name: 'title', label: 'Video title', required: true, value: c ? c.title : '', span: true, placeholder: 'Patient transformation reel' },
        { name: 'status', label: 'Status', type: 'select', value: c ? c.status : 'idea', options: Object.entries(A.CONTENT_STATUS) },
        { name: 'platform', label: 'Platform', type: 'list', list: 'platforms', value: c ? c.platform : 'Instagram', blank: 'Choose…' },
        { name: 'editor', label: 'Editor', value: c ? c.editor : '', placeholder: 'Who edited it' },
        { name: 'cost', label: 'Editing cost (₹)', type: 'number', value: c ? c.cost || '' : '', hint: 'Booked as an "Editing" expense' },
        { name: 'date', label: 'Added on', type: 'date', value: c ? c.date : admin.today() },
        { name: 'scheduledDate', label: 'Post on (reminder)', type: 'date', value: c ? c.scheduledDate : '' },
        { name: 'scheduledTime', label: 'Post time', type: 'time', value: c ? c.scheduledTime : '' },
        { name: 'postedDate', label: 'Posted on', type: 'date', value: c ? c.postedDate : '' },
        { name: 'link', label: 'Post link', value: c ? c.link : '', span: true },
        { name: 'notes', label: 'Notes', value: c ? c.notes : '', span: true },
      ],
      onSubmit: (v) => {
        const status = v.postedDate ? 'posted' : v.status === 'posted' || v.status === 'idea' ? v.status : v.scheduledDate ? 'scheduled' : v.status;
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
    const imgBtn = `<button type="button" class="btn sm" data-act="export" data-what="today" data-fmt="jpeg">${svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>')}Image</button>`;
    const stockRow = (y) => `<tr><td>${esc(y.item.name)}</td><td>${esc(y.item.category)}</td><td class="r"><b>${num(y.stock)}</b> <span class="hint">${esc(y.item.unit)}</span></td><td>${y.item.orderAt != null && y.stock < y.item.orderAt ? '<span class="badge bad">Order required</span>' : y.stock > 0 ? '<span class="badge ok">Available</span>' : '<span class="badge">Not available</span>'}</td></tr>`;
    return `<div class="toolbar"><div class="day-nav"><button type="button" class="btn sm" data-day="-1" aria-label="Previous day">‹</button><input type="date" data-todaydate value="${esc(d)}" aria-label="Date"><button type="button" class="btn sm" data-day="1" aria-label="Next day">›</button>${d !== admin.today() ? '<button type="button" class="btn sm" data-day="0">Today</button>' : ''}</div>
        <span class="grow"></span><span class="btn-group"><button type="button" class="btn sm" data-act="export" data-what="today" data-fmt="pdf">${svg('<path d="M6 3h9l4 4v14H6zM14 3v5h5"/>')}PDF</button>${imgBtn}</span></div>
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
          ${table(['Name', 'Mobile', 'Source', 'Status'], [...x.leadList, ...x.followUps.filter((l) => !x.leadList.includes(l))].map((l) => `<tr><td>${esc(l.name)}${x.followUps.includes(l) ? ' <span class="badge gold">Follow-up</span>' : ''}</td><td>${esc(l.mobile)}</td><td>${esc(l.source || '')}</td><td>${esc(l.status)}</td></tr>`))}</section>
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
  const leadF = { tab: 'open', q: '', status: '', source: '', priority: '', owner: '' };
  const PRIO_CLS = { hot: 'bad', warm: 'gold', cold: 'info' };
  // Front Desk sees their own leads and unassigned ones; Admin and Manager see everyone's.
  function myLeadFilter() {
    if (role !== 'desk') return null;
    return (l) => !l.assignedTo || l.assignedTo === me.id || l.createdBy === me.name;
  }
  const accountName = (id) => (admin.account(id) || {}).name || '';
  function filteredLeads() {
    const d = admin.today();
    const mine = myLeadFilter();
    const q = leadF.q.toLowerCase();
    return S().leads.filter((l) => (!mine || mine(l))
      && (leadF.tab === 'all' || (leadF.tab === 'open' && !admin.isClosedLead(l)) || (leadF.tab === 'due' && !admin.isClosedLead(l) && l.followUp === d)
        || (leadF.tab === 'overdue' && !admin.isClosedLead(l) && l.followUp && l.followUp < d) || (leadF.tab === 'won' && ['Converted', 'Appointment booked'].includes(l.status))
        || (leadF.tab === 'lost' && ['Not interested', 'Lost'].includes(l.status)))
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
    const tabs = [['open', 'Open'], ['due', `Due today (${st.dueToday})`], ['overdue', `Overdue (${st.overdue})`], ['won', 'Converted'], ['lost', 'Lost'], ['all', 'All']];
    const pipeline = set().lists.leadStatuses.map((x) => [x, base.filter((l) => l.status === x).length]);
    const people = S().accounts.filter((a) => !a.disabled);
    const card = (l) => {
      const due = l.followUp && !admin.isClosedLead(l) ? (l.followUp < d ? 'bad' : l.followUp === d ? 'warn' : 'info') : '';
      const wa = waLink(l.mobile, `Namaste ${l.name}, this is ${set().clinic}.`);
      return `<div class="lead" data-act="lead" data-id="${l.id}" role="button" tabindex="0">
        <div class="lead-top"><span class="prio ${PRIO_CLS[l.priority] || ''}" title="${esc(A.LEAD_PRIORITIES[l.priority] || '')}"></span><b>${esc(l.name)}</b><span class="badge ${['Converted', 'Appointment booked'].includes(l.status) ? 'ok' : ['Lost', 'Not interested'].includes(l.status) ? 'bad' : 'info'}">${esc(l.status)}</span></div>
        <div class="lead-meta">${l.interest ? `<span>${esc(l.interest)}</span>` : ''}${l.source ? `<span>${esc(l.source)}</span>` : ''}${l.city ? `<span>${esc(l.city)}</span>` : ''}${l.assignedTo ? `<span>👤 ${esc(accountName(l.assignedTo))}</span>` : ''}</div>
        <div class="lead-foot">${l.followUp ? `<span class="badge ${due}">Follow-up ${fdate(l.followUp)}${l.followTime ? ` ${time12(l.followTime)}` : ''}</span>` : '<span class="hint">No follow-up set</span>'}
          <span class="lead-acts"><a class="btn xs" href="tel:${esc(l.mobile)}">Call</a>${wa ? `<a class="btn xs" href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a>` : ''}<button type="button" class="btn xs primary" data-act="lead-note" data-id="${l.id}">Update</button></span></div></div>`;
    };
    return `<div class="toolbar"><div class="scroll-x"><div class="seg">${tabs.map(([k, l]) => `<button type="button" data-leadtab="${k}" class="${leadF.tab === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
        <span class="grow"></span>${exportBtns('leads')}<button class="btn primary" data-act="new-lead">${svg('<path d="M12 5v14M5 12h14"/>')}New lead</button></div>
      <div class="kpis" style="margin-bottom:14px">${kpi('Open leads', num(st.open))}${kpi('New today', num(st.newToday), '', 'teal')}${kpi('Due today', num(st.dueToday), '', 'gold')}${kpi('Overdue', num(st.overdue), '', st.overdue ? 'bad' : '')}${kpi('Hot leads', num(st.hot), '', 'bad')}${kpi('Conversion', `${st.conversion}%`, `${st.won} of ${st.total}`, 'good')}</div>
      <div class="pipeline scroll-x">${pipeline.map(([x, n]) => `<button type="button" class="pipe ${leadF.status === x ? 'on' : ''}" data-leadstatus="${esc(x)}"><b>${n}</b><span>${esc(x)}</span></button>`).join('')}</div>
      <div class="filters"><div class="row">
        <input type="search" data-lfilter="q" placeholder="Search name, mobile, city, interest" value="${esc(leadF.q)}">
        <select data-lfilter="source" aria-label="Source">${opt('', 'All sources', leadF.source)}${set().lists.leadSources.map((x) => opt(x, x, leadF.source)).join('')}</select>
        <select data-lfilter="priority" aria-label="Priority">${opt('', 'Any priority', leadF.priority)}${Object.entries(A.LEAD_PRIORITIES).map(([k, v]) => opt(k, v, leadF.priority)).join('')}</select>
        ${role !== 'desk' ? `<select data-lfilter="owner" aria-label="Assigned to">${opt('', 'Everyone', leadF.owner)}${opt('__none', 'Not assigned', leadF.owner)}${people.map((a) => opt(a.id, a.name, leadF.owner)).join('')}</select>` : ''}
      </div></div>
      <div class="lead-list">${list.map(card).join('') || `<div class="card empty">${svg(ICON_LEADS)}No leads here.<br><br><button class="btn primary" data-act="new-lead">Add a lead</button></div>`}</div>`;
  };
  function leadForm(l) {
    const v = l || { priority: 'warm', status: 'New', assignedTo: role === 'desk' ? me.id : '', followUp: admin.today() };
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
        <label class="f span">Notes<textarea id="ld-notes" rows="2" placeholder="Health goals, concerns, what they asked…">${esc(v.notes || '')}</textarea></label></div>`,
      onSubmit: () => {
        const val = (id) => ($(`#${id}`).value || '').trim();
        const saved = admin.saveLead({
          id: l ? l.id : undefined, name: val('ld-name'), mobile: val('ld-mobile'), altMobile: val('ld-alt'), city: val('ld-city'), age: val('ld-age'), gender: val('ld-gender'),
          source: val('ld-source'), interest: val('ld-interest'), priority: val('ld-prio'), status: val('ld-status'), assignedTo: val('ld-owner'),
          followUp: val('ld-follow'), followTime: val('ld-ftime'), weight: val('ld-weight'), targetWeight: val('ld-target'), height: val('ld-height'),
          budget: val('ld-budget'), email: val('ld-email'), notes: val('ld-notes'),
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
        <div class="quick"><a class="btn" href="tel:${esc(l.mobile)}">📞 Call</a>${wa ? `<a class="btn" href="${esc(wa)}" target="_blank" rel="noopener">💬 WhatsApp</a>` : ''}${can('appointments') && !l.apptId ? `<button type="button" class="btn success" data-act="lead-book" data-id="${l.id}">Book appointment</button>` : ''}${l.status !== 'Converted' ? `<button type="button" class="btn" data-act="lead-convert" data-id="${l.id}">Mark converted</button>` : ''}<button type="button" class="btn" data-act="lead-edit" data-id="${l.id}">Edit</button>${canDelete() ? `<button type="button" class="btn danger" data-act="lead-del" data-id="${l.id}">Delete</button>` : ''}</div>
        <b style="font-size:13px">Move to stage</b>
        <div class="status-chips">${set().lists.leadStatuses.map((x) => `<button type="button" class="chip-btn ${l.status === x ? 'on' : ''}" data-act="lead-status" data-id="${l.id}" data-status="${esc(x)}">${esc(x)}</button>`).join('')}</div>
        <div class="note-box">
          <div class="grid"><label class="f">Update type<select id="la-type">${[['call', '📞 Call'], ['whatsapp', '💬 WhatsApp'], ['note', '📝 Note'], ['visit', '🏥 Visit']].map(([k, x]) => opt(k, x, 'call')).join('')}</select></label>
          <label class="f">Next follow-up<input id="la-follow" type="date" value="${esc(l.followUp || '')}"></label>
          <label class="f">Time<input id="la-ftime" type="time" value="${esc(l.followTime || '')}"></label>
          <label class="f span">What happened?<textarea id="la-text" rows="2" placeholder="e.g. Called, interested in Mounjaro, asked for price. Call back Monday."></textarea></label></div></div>
        <dl class="detail-list">${row('Mobile', `<a href="tel:${esc(l.mobile)}">${esc(l.mobile)}</a>${l.altMobile ? ` · ${esc(l.altMobile)}` : ''}`)}${row('Interested in', esc(l.interest))}${row('City', esc(l.city))}
          ${row('Age / gender', [l.age, l.gender].filter(Boolean).map(esc).join(' · '))}${row('Weight → target', l.weight ? `${esc(l.weight)} kg → ${esc(l.targetWeight || '?')} kg${bmi ? ` · BMI ${bmi}` : ''}` : '')}
          ${row('Budget', l.budget ? inr(l.budget) : '')}${row('Assigned to', esc(accountName(l.assignedTo)))}${row('Added', `${fdate(l.date)}${l.createdBy ? ` by ${esc(l.createdBy)}` : ''}`)}${row('Notes', esc(l.notes))}</dl>
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
        <ol class="timeline big">${list.slice(0, 400).map((x) => `<li><span class="t-ic">${esc(x.by.charAt(0).toUpperCase())}</span><div><b>${esc(x.action)}</b>${x.detail ? `<span>${esc(x.detail)}</span>` : ''}<small>${ftime(x.at)} · ${esc(x.by)}</small></div></li>`).join('') || '<li class="empty">No changes in this period.</li>'}</ol>
        ${list.length > 400 ? `<p class="hint">Showing the latest 400 of ${list.length}. Export to see all.</p>` : ''}</section>`;
  };

  // ── What's new: app versions and credits ──────────────────────
  const CHANGELOG = [
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
      && (!apptF.doctor || a.doctorId === apptF.doctor)
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
      <select data-afilter="pay" aria-label="Payment">${opt('', 'Paid & unpaid', apptF.pay)}${opt('paid', 'Paid', apptF.pay)}${opt('unpaid', 'Unpaid', apptF.pay)}</select>
    </div></div>`;
    const cards = list.map((a) => `<div class="appt st-${a.status}" data-act="appt" data-id="${a.id}" role="button" tabindex="0">
        <div class="appt-time"><b>${time12(a.time).replace(/ (AM|PM)/, '')}</b><small>${a.time ? (Number(a.time.slice(0, 2)) < 12 ? 'AM' : 'PM') : 'Any time'}</small></div>
        <div class="appt-main"><b>${esc(a.patientName)}</b>${a.service || admin.doctorName(a) ? `<small class="svc">${esc([admin.doctorName(a), a.service].filter(Boolean).join(' · '))}</small>` : ''}<div class="meta">${modeBadge(a.mode)}${statusBadge(a.status)}${apptView === 'list' ? `<span class="badge">${fdate(a.date)}</span>` : ''}</div></div>
        <div class="appt-side"><b>${inr(a.fee)}</b>${payBadge(a)}</div></div>`).join('');
    return `<div class="toolbar"><div class="seg">${[['day', 'Day view'], ['list', 'All appointments']].map(([k, l]) => `<button type="button" data-apptview="${k}" class="${apptView === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <span class="grow"></span>${exportBtns('appointments')}<button class="btn primary" data-act="new-appt">${svg('<path d="M12 5v14M5 12h14"/>')}New appointment</button></div>
      ${apptView === 'day' ? `<div class="date-strip">${strip}</div><div class="toolbar"><input type="date" data-apptdate value="${esc(apptDay)}" aria-label="Pick a date" style="max-width:190px"><b>${apptDay === today ? 'Today · ' : ''}${fdate(apptDay)}</b></div>`
        : `<div class="toolbar">${periodBar()}</div>`}
      <div class="kpis" style="margin-bottom:14px">${kpi('Appointments', num(st.total - st.cancelled))}${kpi('Clinic', num(st.clinic), '', 'teal')}${kpi('Online', num(st.online), '', 'violet')}${kpi('Waiting', num(st.booked), '', 'gold')}${kpi('Fees collected', inr(st.fees), `${st.unpaid} unpaid`, 'good')}</div>
      ${filters}
      <div class="appt-list">${cards || `<div class="card empty">${svg(ICON_CAL)}No appointments${apptView === 'day' ? ' on this day' : ' for this selection'}.<br><br><button class="btn primary" data-act="new-appt">Book an appointment</button></div>`}</div>`;
  };
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
        <label class="f" id="ap-link-wrap" ${v.mode === 'online' ? '' : 'hidden'}>Online meeting link<input id="ap-link" value="${esc(v.link || '')}" placeholder="Google Meet / Zoom / WhatsApp video"></label>
        <label class="check span"><input type="checkbox" id="ap-paid" ${v.paid ? 'checked' : ''}> Fee paid</label>
        <label class="f" id="ap-method-wrap" ${v.paid ? '' : 'hidden'}>Payment method${listSelect('payMethods', 'id="ap-method"', v.payMethod || 'Cash')}</label>
        <label class="f span">Notes<textarea id="ap-notes" rows="2" placeholder="Complaint, reference, follow-up…">${esc(v.notes || '')}</textarea></label></div>`,
      onSubmit: () => {
        const mode = ($('input[name=ap-mode]:checked') || {}).value;
        const input = {
          id: a ? a.id : undefined, patientName: $('#ap-name').value, mobile: $('#ap-mobile').value, date: $('#ap-date').value, time: $('#ap-time').value,
          mode, fee: $('#ap-fee').value, link: $('#ap-link').value, notes: $('#ap-notes').value, paid: $('#ap-paid').checked, service: $('#ap-service').value,
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
      if (e.target.name === 'ap-mode') $('#ap-link-wrap').hidden = e.target.value !== 'online';
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
          ${b('appt-edit', 'Edit')}
          ${canDelete() ? b('appt-del', 'Delete', 'danger') : ''}
        </div>`,
    });
  }

  // New / edit sale
  let saleType = 'injection';
  SCREENS.sell = () => {
    const e = params.edit ? S().sales.find((x) => x.id === params.edit) : null;
    const pre = e || params.prefill || {};
    if (e) saleType = e.type;
    else if (pre.type) saleType = pre.type;
    const t = saleType;
    if (!activeMembers().length) return `<div class="card"><h2>Add your team first</h2><p>Every sale needs a reference team member for incentives.</p><button class="btn primary" data-act="add-member">Add team member</button></div>`;
    const products = t === 'diet'
      ? set().dietPlans.filter((p) => !p.disabled || p.id === pre.planId).map((p) => [p.id, `${p.name}${p.price ? ` · ${inr(p.price)}` : ''}`])
      : admin.itemsOf(t, true).filter((i) => !i.disabled || i.id === pre.itemId).map((i) => [i.id, `${i.name} · ${i.track === false ? 'no stock limit' : `stock ${admin.stockOf(i.id)}`}${i.price ? ` · ${inr(i.price)}` : ''}`]);
    const patients = S().patients.map((p) => `<option value="${esc(p.name)}">${esc(p.mobile || '')}</option>`).join('');
    return `<form class="card form-card" id="sale-form" autocomplete="off">
      ${e ? `<h2>Edit ${A.SALE_TYPES[t].toLowerCase()} sale</h2>` : `<div class="seg">${Object.entries(A.SALE_TYPES).map(([k, l]) => `<button type="button" data-saletype="${k}" class="${t === k ? 'on' : ''}">${l} Sale</button>`).join('')}</div>`}
      <div class="grid">
        <label class="f">Patient name<input name="patientName" list="patient-list" required value="${esc(pre.patientName || '')}"></label>
        <datalist id="patient-list">${patients}</datalist>
        <label class="f">Mobile number<input name="mobile" type="tel" inputmode="tel" value="${esc(pre.mobile || '')}"></label>
        ${t !== 'diet' ? `<label class="f">New / Renewal<select name="patientType">${opt('new', 'New', pre.patientType || 'new')}${opt('renewal', 'Renewal', pre.patientType)}</select></label>` : ''}
        <label class="f">${t === 'diet' ? 'Plan' : t === 'protein' ? 'Protein type' : 'Product'}<select name="${t === 'diet' ? 'planId' : 'itemId'}" required>${opt('', 'Choose…', '')}${products.map(([v, l]) => opt(v, l, t === 'diet' ? pre.planId : pre.itemId)).join('')}</select></label>
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
      parts.push(`Stock: <b class="${stock < qty ? 'err' : ''}">${stock} → ${stock - qty}</b> ${esc(it.unit)}`);
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
        if (editing) go('sales'); else { params = {}; render(); }
      } catch (err) { $('#sale-err').textContent = err.message; }
    });
    updateSaleSummary();
  };

  // Sales list
  let salesFilter = { type: '', q: '', member: '', pt: '' };
  const inR = (date, r) => !r || ((!r.from || date >= r.from) && (!r.to || date <= r.to));
  const filteredSales = () => S().sales.filter((s) => (!salesFilter.type || s.type === salesFilter.type)
    && inR(s.date, range())
    && (!salesFilter.member || s.splits.some((x) => x.memberId === salesFilter.member))
    && (!salesFilter.pt || s.patientType === salesFilter.pt)
    && (!salesFilter.q || `${s.patientName} ${s.mobile} ${s.product} ${s.splits.map((x) => x.name).join(' ')}`.toLowerCase().includes(salesFilter.q.toLowerCase())))
    .sort((a, b) => (a.date === b.date ? b.created - a.created : a.date < b.date ? 1 : -1));
  SUBS.sales = () => periodLabel();
  SCREENS.sales = () => {
    const list = filteredSales();
    const rows = list.map((s) => `<tr><td>${esc(s.patientName)}<span class="sub">${fdate(s.date)}${s.mobile ? ` · ${esc(s.mobile)}` : ''}</span></td>
      <td>${typeBadge(s.type)} ${s.patientType === 'renewal' ? '<span class="badge">Renewal</span>' : '<span class="badge ok">New</span>'}</td>
      <td>${esc(s.product)}${s.qty > 1 ? ` × ${s.qty}` : ''}</td>
      <td class="r"><b>${inr(s.amount)}</b></td><td data-hm>${splitText(s)}</td><td class="r">${inr(s.incentive)}</td>
      <td class="acts"><button class="btn xs" data-act="edit-sale" data-id="${s.id}">Edit</button> <button class="btn xs danger" data-act="del-sale" data-id="${s.id}">Delete</button></td></tr>`);
    return `<div class="toolbar">${periodBar()}<span class="grow"></span>${exportBtns('sales')}</div>
      <div class="filters"><div class="row"><input type="search" placeholder="Search patient, mobile, product" data-filter="q" value="${esc(salesFilter.q)}">
        <select data-filter="type" aria-label="Sale type">${opt('', 'All sale types', salesFilter.type)}${Object.entries(A.SALE_TYPES).map(([k, l]) => opt(k, l, salesFilter.type)).join('')}</select>
        <select data-filter="pt" aria-label="New or renewal">${opt('', 'New & renewal', salesFilter.pt)}${opt('new', 'New patients', salesFilter.pt)}${opt('renewal', 'Renewals', salesFilter.pt)}</select>
        <select data-filter="member" aria-label="Team member">${opt('', 'All team members', salesFilter.member)}${S().team.map((m) => opt(m.id, m.name, salesFilter.member)).join('')}</select></div></div>
      <div class="kpis" style="margin-bottom:14px">${kpi('Sales', num(list.length))}${kpi('Amount', inr(list.reduce((a, s) => a + s.amount, 0)), '', 'good')}${kpi('Incentives', inr(list.reduce((a, s) => a + s.incentive, 0)), '', 'gold')}</div>
      <div class="card">${table(['Patient', 'Type', 'Product', '>Amount', '~Reference', '>Incentive', ''], rows)}</div>`;
  };

  // Patients
  let patientQ = '';
  let patientStatus = '';
  function patientRows() {
    const activeFrom = A.isoDate(new Date(Date.now() - set().activeDays * 86400000));
    return S().patients.map((p) => {
      const sales = admin.patientSales(p.id);
      const appts = S().appointments.filter((a) => a.patientId === p.id);
      const last = sales[sales.length - 1];
      const lastAny = [last && last.date, ...appts.map((a) => a.date)].filter(Boolean).sort().pop() || '';
      return { p, sales, appts, last, lastAny, active: !!lastAny && lastAny >= activeFrom, spent: sales.reduce((a, s) => a + s.amount, 0) + appts.reduce((a, x) => a + admin.feeEarned(x), 0) };
    }).filter((x) => (!patientQ || `${x.p.name} ${x.p.mobile}`.toLowerCase().includes(patientQ.toLowerCase()))
      && (!patientStatus || (patientStatus === 'active' ? x.active : !x.active)))
      .sort((a, b) => b.lastAny.localeCompare(a.lastAny));
  }
  SCREENS.patients = () => {
    const list = patientRows();
    const rows = list.map((x) => `<tr><td><button class="link" data-act="patient" data-id="${x.p.id}">${esc(x.p.name)}</button><span class="sub">${esc(x.p.mobile)}</span></td>
          <td class="r">${x.sales.length + x.appts.length}</td><td class="r">${inr(x.spent)}</td>
          <td>${x.lastAny ? fdate(x.lastAny) : '—'}<span class="sub">${x.last ? esc(x.last.product) : x.appts.length ? 'OPD consultation' : ''}</span></td>
          <td>${x.active ? '<span class="badge ok">Active</span>' : '<span class="badge">Inactive</span>'}</td>
          <td class="acts">${can('sell') ? `<button class="btn xs" data-act="sell-to" data-id="${x.p.id}">New sale</button>` : ''} <button class="btn xs" data-act="patient-edit" data-id="${x.p.id}">Edit</button>${canDelete() ? ` <button class="btn xs danger" data-act="patient-del" data-id="${x.p.id}">Delete</button>` : ''}</td></tr>`);
    return `<div class="filters"><div class="row"><input type="search" placeholder="Search name or mobile" data-filter="patient" value="${esc(patientQ)}">
        <select data-filter="pstatus" aria-label="Status">${opt('', 'All patients', patientStatus)}${opt('active', 'Active', patientStatus)}${opt('inactive', 'Inactive', patientStatus)}</select>
        ${exportBtns('patients')}</div></div>
      <div class="card">${table(['Patient', '>Visits', '>Total spent', 'Last visit', 'Status', ''], rows)}</div>`;
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
    const rows = list.map((r) => `<tr class="${r.done ? 'off' : ''}"><td>${esc(r.name)}<span class="sub">${esc(r.mobile)}</span></td>
      <td>${esc(r.product)}</td><td>${fdate(r.lastDate)}<span class="sub">${r.days} days ago</span></td>
      <td><span class="badge ${r.stage === d2 ? 'bad' : r.stage ? 'warn' : ''}">${stageLabel(r)}</span>${r.done ? ' <span class="badge ok">Contacted</span>' : ''}</td>
      <td data-hm>${esc(r.ref)}</td>
      <td class="acts">${wa(r)} ${r.stage ? `<button class="btn xs" data-act="renewal-done" data-id="${r.saleId}" data-stage="${r.stage}" data-done="${r.done ? '' : '1'}">${r.done ? 'Undo' : 'Contacted'}</button>` : ''} ${can('sell') ? `<button class="btn xs primary" data-act="sell-to" data-id="${r.patientId}" data-renew="1">Renew</button>` : ''}</td></tr>`);
    const count = (f) => all.filter(f).length;
    const segs = [['due', `Due (${count((r) => r.stage && !r.done)})`], ['d60', `${d1}-day`], ['d90', `${d2}+ days`], ['soon', 'Next 10 days'], ['done', 'Contacted'], ['all', 'All']];
    return `<div class="toolbar"><div class="scroll-x"><div class="seg">${segs.map(([k, l]) => `<button type="button" data-renewal="${k}" class="${renewalFilter === k ? 'on' : ''}">${l}</button>`).join('')}</div></div><span class="grow"></span>${exportBtns('renewals')}</div>
      <div class="card"><p class="hint" style="margin-top:0">An alert appears ${d1} days after a patient's last injection; after ${d2} days it shows as overdue. A new sale clears it.</p>
      ${table(['Patient', 'Product', 'Last purchase', 'Reminder', '~Reference team', ''], rows)}</div>`;
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
      <td class="acts"><button class="btn sm" data-act="edit-plan" data-id="${p.id}">Edit</button> <button class="btn sm" data-act="toggle-plan" data-id="${p.id}">${p.disabled ? 'Enable' : 'Disable'}</button></td></tr>`);
    const head = ['Product', '>Price', '>Incentive', '>Stock', 'Status', ''];
    return `<div class="toolbar"><span class="grow"></span>${exportBtns('products')}</div>
      <div class="card"><h2>Injections<span class="sp"></span><button class="btn sm" data-act="add-product" data-kind="injection">+ Add injection</button></h2>${table(head, itemRows('injection'))}</div>
      <div class="card"><h2>Protein<span class="sp"></span><button class="btn sm" data-act="add-product" data-kind="protein">+ Add protein type</button></h2>${table(head, itemRows('protein'))}</div>
      <div class="card"><h2>Diet support plans<span class="sp"></span><button class="btn sm" data-act="edit-plan">+ Add plan</button></h2>${table(['Plan', '>Price', '>Incentive', '', 'Status', ''], planRows)}</div>
      <p class="hint">Injection incentive is per pen; protein incentive is per sale. Leave a product's incentive blank to use the default from <button class="link" data-go="incentives">Incentives</button>. Changes apply to new sales only.</p>`;
  };
  const moveBtns = (id) => `<span class="move"><button class="btn xs" data-act="item-up" data-id="${id}" aria-label="Move up" title="Move up">▲</button><button class="btn xs" data-act="item-down" data-id="${id}" aria-label="Move down" title="Move down">▼</button></span>`;
  const kitText = (it) => admin.kitOf(it).filter((k) => admin.item(k.itemId)).map((k) => `${admin.item(k.itemId).name} ${k.qty}`).join(', ');
  function productForm(it, kind) {
    const k = it ? it.kind : kind;
    openForm({
      title: it ? `Edit ${it.name}` : `Add ${A.KINDS[k].toLowerCase()} product`,
      fields: [
        ...(k === 'injection' ? [{ name: 'brand', label: 'Brand', value: it ? it.brand : '', placeholder: 'Mounjaro' }] : []),
        { name: 'name', label: 'Name', required: true, value: it ? it.name : '', placeholder: k === 'injection' ? 'Mounjaro 7.5mg' : 'Whey protein' },
        { name: 'price', label: 'Sale price (₹)', type: 'number', value: it ? it.price : '' },
        { name: 'incentive', label: 'Incentive (₹)', type: 'number', value: it && it.incentive != null ? it.incentive : '', hint: `Blank = default ${inr(set().incentive[k])}` },
        { name: 'unit', label: 'Unit', value: it ? it.unit : k === 'injection' ? 'pen' : 'sachet' },
        { name: 'lowAt', label: 'Low stock alert at', type: 'number', value: it ? it.lowAt : 2 },
        { name: 'track', label: 'Count stock (off = service / no stock limit)', type: 'checkbox', value: it ? it.track !== false : true, span: true },
      ],
      onSubmit: (v) => { admin.saveItem({ ...(it || { kind: k, category: k === 'injection' ? 'Injection' : 'Protein' }), ...v }); return 'Product saved'; },
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
  const newDraft = () => ({ vendor: '', invoiceNo: '', date: admin.today(), lines: [{ itemId: '', qty: 1, rate: '', gst: 12, batch: '', expiry: '' }] });
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
      <label class="f">GST %<input type="number" min="0" step="any" data-line="${i}" data-k="gst" value="${esc(l.gst)}"></label>
      <label class="f">Total<input disabled data-total="${i}" value="${inr(admin.lineTotal(l))}"></label>
      <button type="button" class="icon-btn" data-act="del-line" data-i="${i}" aria-label="Remove line">✕</button></div>`).join('');
    return `<form class="card form-card" id="purchase-form" autocomplete="off">
      <h2>${draft.id ? 'Edit purchase' : 'Invoice details'}</h2>
      <div class="grid">
        <label class="f">Vendor name<input data-k="vendor" value="${esc(draft.vendor)}" list="vendor-list"></label>
        <datalist id="vendor-list">${[...new Set(S().purchases.map((p) => p.vendor))].map((v) => `<option value="${esc(v)}">`).join('')}</datalist>
        <label class="f">Invoice number<input data-k="invoiceNo" value="${esc(draft.invoiceNo)}"></label>
        <label class="f">Invoice date<input type="date" data-k="date" value="${esc(draft.date)}"></label>
      </div>
      <div class="lines">${lineHtml}</div>
      <div><button type="button" class="btn sm" data-act="add-line">+ Add line</button></div>
      <div class="summary" id="purchase-total"></div>
      <small class="err" id="purchase-err"></small>
      <div class="actions"><button type="button" class="btn" data-act="cancel-purchase">Cancel</button><button class="btn primary" type="submit">${draft.id ? 'Save changes' : 'Add to stock'}</button></div>
    </form>`;
  };
  function purchaseTotal() {
    const total = draft.lines.reduce((a, l) => a + admin.lineTotal(l), 0);
    const qty = draft.lines.reduce((a, l) => a + (l.itemId ? Number(l.qty) || 0 : 0), 0);
    const el = $('#purchase-total');
    if (el) el.innerHTML = `Stock in: <b>+${num(qty)}</b><span>·</span>Invoice total (incl. GST): <b>${inr(total)}</b>${set().purchaseExpense ? '<span>·</span>Booked as a purchase expense' : ''}`;
  }
  AFTER['purchase-new'] = () => {
    const form = $('#purchase-form');
    form.addEventListener('input', (e) => {
      const t = e.target;
      if (t.dataset.line != null) {
        draft.lines[t.dataset.line][t.dataset.k] = t.value;
        const tot = $(`[data-total="${t.dataset.line}"]`);
        if (tot) tot.value = inr(admin.lineTotal(draft.lines[t.dataset.line]));
      } else if (t.dataset.k) draft[t.dataset.k] = t.value;
      purchaseTotal();
    });
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
      <td>${m.incentiveOn === false ? '<span class="badge">Off</span>' : `<span class="badge ok">Inj ${inr(admin.rateFor(m, 'injection'))} · Protein ${inr(admin.rateFor(m, 'protein'))}</span>`}</td>
      <td><span class="badge info">${PAY[m.payMode || 'both']}</span></td>
      <td>${acc ? `<span class="badge violet">${esc(A.ROLES[acc.role])} login</span>` : '<span class="hint">No login</span>'}</td>
      <td>${m.disabled ? '<span class="badge">Disabled</span>' : '<span class="badge ok">Active</span>'}</td>
      <td class="acts"><button class="btn xs" data-act="edit-member" data-id="${m.id}">Edit</button> <button class="btn xs" data-act="member-login" data-id="${m.id}">${acc ? 'Login' : '+ Login'}</button> <button class="btn xs" data-act="toggle-member" data-id="${m.id}">${m.disabled ? 'Enable' : 'Disable'}</button>${canDelete() ? ` <button class="btn xs danger" data-act="del-member" data-id="${m.id}">Delete</button>` : ''}</td></tr>`;
    });
    return `<div class="toolbar"><select data-filter="teamstatus" aria-label="Status" style="max-width:200px">${opt('', 'All members', teamStatus)}${opt('active', 'Active', teamStatus)}${opt('disabled', 'Disabled', teamStatus)}</select>
        <span class="grow"></span>${exportBtns('team')}<button class="btn primary" data-act="add-member">+ Add member</button></div>
      <div class="card">${table(['Name', '>Salary', 'Incentive per sale', 'Pay counts', '~Login', 'Status', ''], rows)}
      <p class="hint">Each person can have their own incentive rates (blank = clinic default ${inr(set().incentive.injection)} per injection, ${inr(set().incentive.protein)} per protein sale) and their own login. “Pay counts” decides what goes into their monthly pay. Disabled members keep their history.</p></div>`;
  };
  function memberForm(m) {
    openForm({
      title: m ? `Edit ${m.name}` : 'Add team member',
      fields: [
        { name: 'name', label: 'Name', required: true, value: m ? m.name : '' },
        { name: 'designation', label: 'Designation', type: 'list', list: 'designations', blank: 'Select', value: m ? m.designation : '' },
        { name: 'mobile', label: 'Mobile', type: 'tel', value: m ? m.mobile : '' },
        { name: 'salary', label: 'Monthly salary (₹)', type: 'number', value: m ? m.salary : '' },
        { name: 'joiningDate', label: 'Joining date', type: 'date', value: m ? m.joiningDate : admin.today() },
        { name: 'incInjection', label: 'Incentive per injection (₹)', type: 'number', value: m && m.incInjection != null ? m.incInjection : '', placeholder: String(set().incentive.injection), hint: `Blank = default ${inr(set().incentive.injection)}` },
        { name: 'incProtein', label: 'Incentive per protein sale (₹)', type: 'number', value: m && m.incProtein != null ? m.incProtein : '', placeholder: String(set().incentive.protein), hint: `Blank = default ${inr(set().incentive.protein)}` },
        { name: 'payMode', label: 'Monthly pay counts', type: 'select', value: m ? m.payMode || 'both' : 'both', options: [['both', 'Salary + Incentive'], ['salary', 'Salary only'], ['incentive', 'Incentive only']] },
        { name: 'incentiveOn', label: 'Incentive status: On', type: 'checkbox', value: m ? m.incentiveOn !== false : true, span: true },
      ],
      onSubmit: (v) => { admin.saveMember({ ...(m ? { id: m.id } : {}), ...v }); return m ? 'Team member updated' : 'Team member added'; },
    });
  }

  // Incentives
  let ledgerMember = '';
  SCREENS.incentives = () => {
    const inc = set().incentive;
    const ledger = admin.incentiveLedger(range()).filter((l) => !ledgerMember || l.memberId === ledgerMember);
    const totals = {};
    ledger.forEach((l) => { totals[l.name] = (totals[l.name] || 0) + l.amount; });
    return `<form class="card form-card" id="inc-form"><h2>Incentive amounts</h2>
      <div class="grid">
        <label class="f">Injection (per pen, ₹)<input type="number" min="0" name="injection" value="${esc(inc.injection)}"></label>
        <label class="f">Protein (per sale, ₹)<input type="number" min="0" name="protein" value="${esc(inc.protein)}"></label>
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
      admin.updateSettings({ incentive: { injection: Number(v.injection) || 0, protein: Number(v.protein) || 0 } });
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
      ${table(['Employee', '~Pay counts', '>Salary', '>Incentive', '>Total pay'], rows.map((r) => `<tr><td>${esc(r.name)}<span class="sub">${esc(r.designation || '')}</span></td><td><span class="badge info">${{ both: 'Salary + Incentive', salary: 'Salary only', incentive: 'Incentive only' }[r.mode]}</span></td><td class="r">${inr(r.salary)}</td><td class="r">${inr(r.incentive)}</td><td class="r"><b>${inr(r.total)}</b></td></tr>`),
        `<td>Total</td><td></td><td class="r">${inr(t('salary'))}</td><td class="r">${inr(t('incentive'))}</td><td class="r">${inr(t('total'))}</td>`)}
      <p class="hint">Incentive = the member's share of every sale in ${fdate(month)}. “Book as expenses” adds Salary and Incentive entries, so the dashboard profit includes them.</p></div>`;
  };

  // Expenses
  let expenseCat = ''; let expenseName = '';
  const filteredExpenses = () => S().expenses.filter((e) => inR(e.date, range()) && (!expenseCat || e.category === expenseCat) && (!expenseName || e.name === expenseName))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  SUBS.expenses = () => periodLabel();
  SCREENS.expenses = () => {
    const list = filteredExpenses();
    const fin = admin.financialReport(range());
    const sm = admin.expenseSummary(range());
    const names = [...new Set([...set().lists.expenseNames, ...S().expenses.map((e) => e.name).filter(Boolean)])];
    const mini = (title, rows, key) => `<section class="card"><h2>${title}</h2>${table(['Name', '>Entries', '>Total'], rows.map((x) => `<tr class="${key && (key === 'cat' ? expenseCat : expenseName) === x.name ? 'sel' : ''}"><td>${key ? `<button class="link" data-act="exp-pick" data-key="${key}" data-name="${esc(x.name)}">${esc(x.name)}</button>` : esc(x.name)}</td><td class="r">${num(x.count)}</td><td class="r"><b>${inr(x.amount)}</b></td></tr>`),
      rows.length ? `<td>Total</td><td class="r">${num(rows.reduce((a, x) => a + x.count, 0))}</td><td class="r">${inr(rows.reduce((a, x) => a + x.amount, 0))}</td>` : '')}</section>`;
    return `<div class="toolbar">${periodBar()}<span class="grow"></span>${exportBtns('expenses')}</div>
      <div class="kpis" style="margin-bottom:14px">${kpi('Revenue', inr(fin.revenue))}${kpi('Expenses', inr(fin.expenses), plural(sm.count, 'entry', 'entries'), 'gold')}${kpi('Profit', inr(fin.profit), 'Revenue − Expenses', fin.profit >= 0 ? 'good' : 'bad')}
        ${['Founder', 'Ads', 'Editing'].map((c) => { const x = sm.byCategory.find((y) => y.name === c); return kpi(`${c} expenses`, inr(x ? x.amount : 0), x ? plural(x.count, 'entry', 'entries') : '', 'violet'); }).join('')}</div>
      <div class="filters"><div class="row"><select data-filter="expense" aria-label="Category">${opt('', 'All categories', expenseCat)}${set().lists.expenseCategories.map((c) => opt(c, `${c}${fin.byCategory[c] ? ` · ${inr(fin.byCategory[c])}` : ''}`, expenseCat)).join('')}</select>
        <select data-filter="expensename" aria-label="Name">${opt('', 'All names', expenseName)}${names.map((c) => opt(c, c, expenseName)).join('')}</select>
        <button class="btn primary" data-act="add-expense">+ Add expense</button></div></div>
      <div class="cards">${mini('By category', sm.byCategory, 'cat')}${mini('By name (founder, ad platform, editor…)', sm.byName, 'name')}</div>
      ${sm.byBoth.length ? `<div class="cards">${mini('Category × name', sm.byBoth)}</div>` : ''}
      <div class="card">${table(['Category', 'Name', '~Note', 'Date', '>Amount', ''], list.map((e) => `<tr><td>${esc(e.category)} ${e.auto ? '<span class="badge info">Auto</span>' : ''}</td><td>${esc(e.name || '')}</td><td>${esc(e.note)}</td><td>${fdate(e.date)}</td><td class="r"><b>${inr(e.amount)}</b></td>
        <td class="acts">${e.auto ? '' : `<button class="btn xs" data-act="edit-expense" data-id="${e.id}">Edit</button> `}<button class="btn xs danger" data-act="del-expense" data-id="${e.id}">Delete</button></td></tr>`),
        `<td colspan="4">Total · ${list.length} entries</td><td class="r">${inr(list.reduce((a, e) => a + e.amount, 0))}</td><td></td>`)}</div>`;
  };
  function expenseForm(e) {
    openForm({
      title: e ? 'Edit expense' : 'Add expense',
      fields: [
        { name: 'category', label: 'Category', type: 'list', list: 'expenseCategories', value: e ? e.category : expenseCat || 'Rent' },
        { name: 'name', label: 'Name (founder, ad platform, editor…)', type: 'list', list: 'expenseNames', value: e ? e.name || '' : expenseName, blank: 'No name' },
        { name: 'amount', label: 'Amount (₹)', type: 'number', required: true, value: e ? e.amount : '' },
        { name: 'payMethod', label: 'Paid by', type: 'list', list: 'payMethods', value: e ? e.payMethod || '' : '', blank: '—' },
        { name: 'date', label: 'Date', type: 'date', value: e ? e.date : admin.today() },
        { name: 'note', label: 'Note', value: e ? e.note : '', span: true },
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
      list.map((s) => [s.date, s.patientName, s.mobile, A.SALE_TYPES[s.type], s.patientType === 'new' ? 'New' : 'Renewal', s.product, s.qty, s.amount, s.splits.map((x) => `${x.name}${s.splits.length > 1 ? ` ${x.pct}%` : ''}`).join(' + '), s.incentive]), { money: [7, 9], total: [7, 9] }),
    patients: (list) => sec('Patients', ['Patient', 'Mobile', '>Visits', '>Total Spent', 'Last Visit', 'Status'],
      list.map((x) => [x.p.name, x.p.mobile, x.sales.length + x.appts.length, x.spent, x.lastAny, x.active ? 'Active' : 'Inactive']), { money: [3], total: [2, 3] }),
    renewals: (list) => sec('Renewals', ['Patient', 'Mobile', 'Product', 'Last Purchase', '>Days', 'Reminder', 'Reference Team', 'Contacted'],
      list.map((r) => [r.name, r.mobile, r.product, r.lastDate, r.days, stageLabel(r), r.ref, r.done ? 'Yes' : 'No'])),
    products: () => [
      sec('Injections', ['Product', '>Price', '>Incentive', '>Stock', 'Status'], admin.itemsOf('injection', true).map((i) => [i.name, i.price, i.incentive != null ? i.incentive : set().incentive.injection, admin.stockOf(i.id), i.disabled ? 'Disabled' : 'Active']), { money: [1, 2] }),
      sec('Protein', ['Product', '>Price', '>Incentive', '>Stock', 'Status'], admin.itemsOf('protein', true).map((i) => [i.name, i.price, i.incentive != null ? i.incentive : set().incentive.protein, admin.stockOf(i.id), i.disabled ? 'Disabled' : 'Active']), { money: [1, 2] }),
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
    daySales: (x) => sec('Sales', ['Patient', 'Mobile', 'Type', 'Product', '>Qty', '>Amount', 'Reference'], x.sales.map((s) => [s.patientName, s.mobile, A.SALE_TYPES[s.type], s.product, s.qty, s.amount, s.splits.map((y) => `${y.name}${s.splits.length > 1 ? ` ${y.pct}%` : ''}`).join(' + ')]), { money: [5], total: [4, 5] }),
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
      ledger.map((l) => [l.date, l.name, A.SALE_TYPES[l.type], l.product, l.patient, l.pct, l.amount]), { money: [6], total: [6] }),
    salary: (month) => sec(`Salary ${fdate(month)}`, ['Employee', 'Designation', 'Pay Counts', '>Salary', '>Incentive', '>Total Pay'],
      admin.salarySheet(month).map((r) => [r.name, r.designation || '', { both: 'Salary + Incentive', salary: 'Salary only', incentive: 'Incentive only' }[r.mode], r.salary, r.incentive, r.total]), { money: [3, 4, 5], total: [3, 4, 5] }),
    expenses: (list) => sec('Expenses', ['Date', 'Category', 'Name', 'Paid By', 'Note', '>Amount'], list.map((e) => [e.date, e.category, e.name || '', e.payMethod || '', e.note || '', e.amount]), { money: [5], total: [5] }),
    teamReport: (r) => sec('Team Performance', ['Team Member', '>Total Sales', '>Orders', '>New Patients', '>Renewals', '>Injection', '>Protein', '>Diet Support', '>Incentive'],
      admin.teamReport(r).map((x) => [x.name, x.totalSales, x.orders, x.newPatients, x.renewals, x.injectionSales, x.proteinSales, x.dietSales, x.incentive]), { money: [1, 5, 6, 7, 8], total: [1, 2, 3, 4, 5, 6, 7, 8] }),
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
      ['Injection sales', inr(d.sales.injection)], ['Protein sales', inr(d.sales.protein)], ['Diet support', inr(d.sales.diet)], ['Consultation fees', inr(d.sales.consultation)],
      ['Appointments', num(d.appointments.total - d.appointments.cancelled)], ['Clinic / Online', `${d.appointments.clinic} / ${d.appointments.online}`],
      ['Total patients', num(d.patients.total)], ['New / Renewal', `${d.patients.new} / ${d.patients.renewal}`], ['Active patients', num(d.patients.active)],
      ['Team members', num(d.team.members)], ['Total incentives', inr(d.team.incentives)], ['Top performer', d.team.top ? d.team.top.name : '—'],
      ['Injection stock', num(d.stock.injection)], ['Protein stock', num(d.stock.protein)], ['Low stock alerts', num(d.stock.low.length)], ['Renewals due', num(d.renewalsDue)],
      ['New leads', num(d.leads.total)], ['Leads converted', `${d.leads.won} (${d.leads.conversion}%)`], ['Order required', num(d.stock.order.length)]];
  };
  const stamp = () => admin.today();
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
    today: () => {
      const d = todayDate || stamp(); const x = admin.daySummary(d);
      const kp = [['Sales', inr(x.salesTotal)], ['Purchases', inr(x.purchaseTotal)], ['OPD appointments', num(x.appt.total - x.appt.cancelled)], ['OPD fees', inr(x.appt.fees)],
        ['Expenses', inr(x.expenseTotal)], ['New leads', num(x.leads)], ['Follow-ups', num(x.followUps.length)], ['Renewals due', num(x.renewals.length)],
        ['Videos posted', num(x.posted.length)], ['Posts due', num(x.content.dueToday.length + x.content.overdue.length)], ['Items available', num(x.available.length)], ['Not available', num(x.notAvailable.length)]];
      const has = (sec) => sec.rows.length;
      return { title: 'Today Summary', subtitle: fdate(d), kpis: kp, alertKpis: [11], sections: [
        ...(x.order.length ? [R.dayStock('ORDER REQUIRED', x.order)] : []), R.daySales(x), R.dayAppts(x), ...[R.dayExpenses(x), R.dayPurchases(x), R.dayLeads(x), R.dayRenewals(x), R.dayContent(x)].filter(has),
        R.dayStock('Stock Available', x.available), ...(x.notAvailable.length ? [R.dayStock('Stock Not Available', x.notAvailable)] : [])] };
    },
    leads: () => { const list = filteredLeads(); return { title: 'Leads', subtitle: role === 'desk' ? `${me.name} · ${fdate(stamp())}` : fdate(stamp()), sections: [R.leads(list), ...(role !== 'desk' ? [R.leadOwners(list)] : [])] }; },
    activity: () => ({ title: 'Activity Log', subtitle: periodLabel(), sections: [R.activity(filteredLog())] }),
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
  function runExport(what, fmt) {
    const rep = EXPORTS[what]();
    rep.filename = `ThePrimeFit-${rep.title.replace(/[^A-Za-z0-9]+/g, '-')}-${stamp()}`;
    try {
      const pretty = () => ({ ...rep, sections: rep.sections.map((s) => ({ ...s, rows: s.rows.map((r) => r.map((v, i) => fmtCell(s, i, v))), foot: s.foot && s.foot.map((v, i) => fmtCell(s, i, v)) })) });
      if (fmt === 'pdf') toast(`Saved ${X.pdf(pretty(), set().clinic)}`);
      else if (fmt === 'jpeg') toast(`Saved ${X.jpeg(pretty(), set().clinic)}`);
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
  const PERM_SCREENS = NAV.filter((n) => !['settings', 'about'].includes(n[0])).map((n) => [n[0], n[1]]);
  SCREENS.settings = () => {
    const st = set();
    const last = Number(storage.getItem(SYNC_KEY)) || 0;
    const isSuper = role === 'super';
    const accRows = S().accounts.map((a) => `<tr class="${a.disabled ? 'off' : ''}"><td><b>${esc(a.name)}</b><span class="sub">${a.memberId && admin.member(a.memberId) ? `Team: ${esc(admin.member(a.memberId).name)}` : ''}</span></td>
      <td><span class="badge ${a.role === 'super' ? 'gold' : a.role === 'admin' ? 'violet' : a.role === 'manager' ? 'teal' : 'info'}">${A.ROLES[a.role]}</span></td>
      <td>${a.hash ? (a.pin ? `<code class="pin">${esc(a.pin)}</code>` : '<span class="badge ok">Set</span>') : '<span class="badge warn">Not set</span>'}</td>
      <td class="acts"><button class="btn xs" data-act="set-pin" data-id="${a.id}">${a.hash ? 'Change PIN' : 'Set PIN'}</button>${a.role !== 'super' ? ` <button class="btn xs" data-act="random-pin" data-id="${a.id}">Random PIN</button>` : ''} <button class="btn xs" data-act="edit-login" data-id="${a.id}">Edit</button>${a.id !== me.id ? ` <button class="btn xs danger" data-act="del-login" data-id="${a.id}">Delete</button>` : ''}</td></tr>`);
    const perms = st.perms;
    const permTable = `<div class="tbl-wrap"><table class="perm"><thead><tr><th>Screen</th>${['admin', 'manager', 'desk'].map((r) => `<th class="c">${A.ROLES[r]}</th>`).join('')}</tr></thead><tbody>
      ${PERM_SCREENS.map(([id, label]) => `<tr><td>${esc(label)}</td>${['admin', 'manager', 'desk'].map((r) => `<td class="c"><input type="checkbox" data-perm="${r}" value="${id}" ${perms[r].screens.includes(id) ? 'checked' : ''} aria-label="${esc(label)} for ${A.ROLES[r]}"></td>`).join('')}</tr>`).join('')}
      <tr><td><b>Settings</b></td>${['admin', 'manager', 'desk'].map((r) => `<td class="c"><input type="checkbox" data-perm="${r}" value="settings" ${perms[r].screens.includes('settings') ? 'checked' : ''}></td>`).join('')}</tr>
      <tr><td><b>Can delete records</b></td>${['admin', 'manager', 'desk'].map((r) => `<td class="c"><input type="checkbox" data-permdel="${r}" ${perms[r].del ? 'checked' : ''}></td>`).join('')}</tr></tbody></table></div>`;
    const chips = (list) => `<div class="opt-chips">${st.lists[list].map((x) => `<span class="opt-chip">${esc(x)}<button type="button" data-act="list-rename" data-list="${list}" data-name="${esc(x)}" aria-label="Rename">✎</button><button type="button" data-act="list-del" data-list="${list}" data-name="${esc(x)}" aria-label="Remove">✕</button></span>`).join('')}
      <span class="opt-add"><input placeholder="Add new" data-listadd="${list}"><button type="button" class="btn xs primary" data-act="list-add" data-list="${list}">Add</button></span></div>`;
    const catChips = `<div class="opt-chips">${S().categories.map((c) => `<span class="opt-chip">${esc(c.name)}<small>${A.KINDS[c.kind]}</small><button type="button" data-act="cat-rename" data-name="${esc(c.name)}" aria-label="Rename">✎</button><button type="button" data-act="cat-del" data-name="${esc(c.name)}" aria-label="Delete">✕</button></span>`).join('')}<button type="button" class="btn xs primary" data-act="add-category">+ Category</button></div>`;
    return `<form class="card form-card" id="settings-form" autocomplete="off">
      <h2><span class="ic">${svg('<path d="M3 21h18M5 21V8l7-5 7 5v13"/>')}</span>Clinic</h2>
      <div class="grid">
        <label class="f">Clinic name<input name="clinic" value="${esc(st.clinic)}"></label>
        <label class="f">OPD consultation fee (₹)<input type="number" min="0" name="consultFee" value="${esc(st.consultFee)}"></label>
        <label class="f">Default injection incentive (₹)<input type="number" min="0" name="incInj" value="${esc(st.incentive.injection)}"></label>
        <label class="f">Default protein incentive (₹)<input type="number" min="0" name="incPro" value="${esc(st.incentive.protein)}"></label>
        <label class="f">Renewal alert after (days)<input type="number" min="1" name="r1" value="${esc(st.renewalDays[0])}"></label>
        <label class="f">Overdue after (days)<input type="number" min="1" name="r2" value="${esc(st.renewalDays[1])}"></label>
        <label class="f">Active patient = visited within (days)<input type="number" min="1" name="activeDays" value="${esc(st.activeDays)}"></label>
      </div>
      <label class="check"><input type="checkbox" name="purchaseExpense" ${st.purchaseExpense ? 'checked' : ''}> Book every purchase invoice as an expense</label>
      <label class="check"><input type="checkbox" name="stockAlerts" ${st.stockAlerts !== false ? 'checked' : ''}> Low-stock alerts on (each item can also be switched off in Inventory)</label>
      <label class="check"><input type="checkbox" name="kitOn" ${st.kitOn !== false ? 'checked' : ''}> Take the injection kit out of stock with every injection sold <button type="button" class="link" data-act="kit">Edit kit</button></label>
      <h2 style="margin-top:6px"><span class="ic teal">${svg('<path d="M4 4h16v16H4zM4 10h16M10 4v16"/>')}</span>Google Sheet (data storage)</h2>
      <p class="hint" style="margin:0">All data is stored in ${SHEET_LINK ? `<a href="${SHEET_LINK}" target="_blank" rel="noopener">The Prime Fit Google Sheet</a>` : 'The Prime Fit Google Sheet'} and refreshes automatically on every device. Set-up once: open the sheet → Extensions → Apps Script → paste <a href="google-apps-script/Code.gs" target="_blank" rel="noopener">Code.gs</a> → run <b>setup</b> → Deploy → Web app (Execute as: Me, Who has access: Anyone) → paste the URL and the secret here.</p>
      <div class="grid two">
        <label class="f">Web app URL<input name="sheetsUrl" value="${esc(st.sheetsUrl)}" placeholder="https://script.google.com/macros/s/…/exec"></label>
        <label class="f">Secret<input type="password" name="sheetsSecret" value="${esc(st.sheetsSecret)}"><span class="hint">Shown in the Apps Script log after running setup.</span></label>
      </div>
      <p class="hint" style="margin:0" id="last-sync">${connected() ? (last ? `Connected · last saved ${new Date(last).toLocaleString('en-IN')}` : 'Connected') : 'Not connected: data is only on this device'}</p>
      ${connected() ? `<div class="actions" style="justify-content:flex-start"><button type="button" class="btn sm" data-act="sheet-load">${svg('<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/>')}Load from Google Sheet</button><button type="button" class="btn sm" data-act="sheet-send">${svg('<path d="M12 19V5M5 12l7-7 7 7"/>')}Send this device's data to the sheet</button></div>
      <p class="hint" style="margin:0">Use your current sheet (keep its URL) or a new one (paste the new URL and secret, then Save settings). The sheet's tabs are rewritten on every save.</p>` : ''}
      <div class="actions"><button class="btn primary" type="submit">Save settings</button></div>
    </form>
    ${isSuper ? `<div class="card"><h2><span class="ic gold">${svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>')}</span>Logins<span class="sp"></span><button class="btn sm primary" data-act="add-login">+ Add login</button></h2>
      <p class="hint" style="margin-top:0">Give every person their own login (name + PIN). Staff PINs are shown here so you can check or reset them; the Super Admin PIN is never shown. PINs work on every device through the Google Sheet.</p>
      ${table(['Login', 'Role', 'PIN', ''], accRows)}</div>
    <form class="card" id="perm-form"><h2><span class="ic violet">${svg('<path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6z"/>')}</span>Roles & permissions</h2>
      <p class="hint" style="margin-top:0">Choose what Admin, Manager and Front Desk can open. Super Admin always has everything.</p>
      ${permTable}<div class="actions" style="margin-top:12px"><button type="button" class="btn ghost" data-act="perm-reset">Reset to default</button><button class="btn primary" type="submit">Save permissions</button></div></form>` : ''}
    <div class="card"><h2><span class="ic teal">${svg('<path d="M4 6h16M4 12h16M4 18h10"/>')}</span>Choice lists</h2>
      <p class="hint" style="margin-top:0">Every drop-down with “+ Add new…” uses these lists. Rename (✎) updates existing records; built-in expense categories can't be removed.</p>
      ${Object.keys(LIST_LABELS).map((k) => `<div class="list-block"><b>${LIST_LABELS[k]}</b>${chips(k)}</div>`).join('')}
      <div class="list-block"><b>Inventory categories</b>${catChips}</div></div>
    <div class="card"><h2><span class="ic violet">${svg('<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>')}</span>Backup & export</h2><p class="hint" style="margin-top:0">${connected() ? 'Data is saved to the Google Sheet and kept on this device for offline use.' : 'All data is stored on this device.'} Download everything as PDF or Excel from Reports.</p>
      <div class="actions" style="justify-content:flex-start"><button class="btn" data-act="export-backup">Export backup file</button>
      <label class="btn">Import backup<input type="file" id="import-file" accept="application/json,.json" hidden></label>
      <button class="btn" data-go="reports">All reports (PDF / Excel)</button>
      ${isSuper ? '<button class="btn danger" data-act="reset">Erase all data</button>' : ''}</div></div>
    <p class="credit-line">${esc(CREDIT)} · The Prime Fit Admin ${APP_VERSION}</p>`;
  };
  AFTER.settings = () => {
    $('#settings-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const r1 = Number(f.r1.value) || 75; const r2 = Number(f.r2.value) || 90;
      const before = `${set().sheetsUrl}|${set().sheetsSecret}`;
      admin.updateSettings({
        clinic: f.clinic.value.trim(), consultFee: Number(f.consultFee.value) || 0, renewalDays: [Math.min(r1, r2), Math.max(r1, r2)], activeDays: Number(f.activeDays.value) || 90,
        incentive: { injection: Number(f.incInj.value) || 0, protein: Number(f.incPro.value) || 0 },
        purchaseExpense: f.purchaseExpense.checked, stockAlerts: f.stockAlerts.checked, kitOn: f.kitOn.checked,
        sheetsUrl: f.sheetsUrl.value.trim(), sheetsSecret: f.sheetsSecret.value.trim(),
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
        ['admin', 'manager', 'desk'].forEach((r) => {
          perms[r] = { screens: $$(`input[data-perm="${r}"]:checked`, pf).map((x) => x.value), del: $(`input[data-permdel="${r}"]`, pf).checked };
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
  function loginForm(a, memberId) {
    const m = memberId ? admin.member(memberId) : null;
    const v = a || { name: m ? m.name : '', role: 'desk', memberId: memberId || '' };
    const random = String(Math.floor(100000 + Math.random() * 900000));
    openForm({
      title: a ? `Edit login · ${a.name}` : 'Add login',
      fields: [
        { name: 'name', label: 'Login name', required: true, value: v.name },
        { name: 'role', label: 'Role', type: 'select', value: v.role, options: Object.entries(A.ROLES).map(([k, x]) => [k, x]) },
        { name: 'memberId', label: 'Team member (optional)', type: 'select', value: v.memberId || '', options: [['', 'Not linked'], ...S().team.map((t) => [t.id, t.name])] },
        ...(a ? [{ name: 'disabled', label: 'Login disabled', type: 'checkbox', value: !!a.disabled, span: true }] : [{ name: 'pin', label: 'PIN (4–6 digits)', value: random, hint: 'A random 6-digit PIN is filled in; you can change it', attrs: 'inputmode="numeric" maxlength="6" autocomplete="off"' }]),
      ],
      onSubmit: async (x) => {
        if (!a && !/^\d{4,6}$/.test(x.pin)) throw new Error('PIN must be 4 to 6 digits');
        const saved = admin.saveAccount({ ...(a ? { id: a.id } : {}), name: x.name, role: x.role, memberId: x.memberId, disabled: !!x.disabled });
        if (!a) await savePin(saved.id, x.pin);
        return a ? 'Login saved' : `Login added: ${saved.name} · PIN ${saved.role === 'super' ? 'saved' : x.pin}`;
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
  function syncState(text) { const b = $('#refresh-btn'); if (b) b.classList.toggle('spin', /…/.test(text || '')); }
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
  const randomPin = () => String(Math.floor(100000 + Math.random() * 900000));
  const ACTIONS = {
    refresh: () => refreshNow(),
    export: (d) => runExport(d.what, d.fmt),
    'user-menu': () => {
      openForm({
        title: me.name, submitLabel: false,
        html: `<dl class="detail-list"><div><dt>Login</dt><dd>${esc(A.ROLES[role])}</dd></div><div><dt>Data</dt><dd>${connected() ? 'Google Sheet · auto refresh' : 'This device only'}</dd></div><div><dt>App</dt><dd>Hindivine Admin ${APP_VERSION}</dd></div></dl>
          <div class="quick"><button type="button" class="btn" data-act="refresh">Refresh data</button><button type="button" class="btn" data-act="my-pin">Change my PIN</button><button type="button" class="btn" data-go="about">What's new</button><button type="button" class="btn danger" data-act="lock">Log out</button></div>
          <p class="credit-line">${esc(CREDIT)}</p>`,
      });
    },
    'my-pin': () => pinForm(me.id, true),
    'set-pin': (d) => pinForm(d.id, d.id === me.id),
    'random-pin': async (d) => {
      const a = admin.account(d.id);
      const pin = randomPin();
      if (!(await confirmBox('New random PIN', `Give ${a.name} the new PIN ${pin}? Their old PIN stops working.`, 'Set PIN'))) return;
      await savePin(a.id, pin);
      render();
      toast(`${a.name}: new PIN ${pin}`);
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
      const last = admin.patientSales(p.id).filter((s) => s.type === 'injection').at(-1);
      saleType = 'injection';
      go('sell', { prefill: { type: 'injection', patientName: p.name, mobile: p.mobile, patientType: last ? 'renewal' : 'new', itemId: last && d.renew ? last.itemId : '', refId: last ? last.refId : '', sharedId: last ? last.sharedId : '', sharePct: last ? last.sharePct : 50, dietitianId: last ? last.dietitianId : '' } });
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
          <div class="quick">${can('appointments') ? `<button type="button" class="btn" data-act="appt-for" data-id="${p.id}">Book appointment</button>` : ''}${can('sell') ? `<button type="button" class="btn primary" data-act="sell-to" data-id="${p.id}">New sale</button>` : ''}</div>`,
      });
      labelTables($('#modal-body'));
    },
    'appt-for': (d) => { const p = S().patients.find((x) => x.id === d.id); modal.close(); if (screen !== 'appointments') go('appointments'); apptForm(null, { patientName: p.name, mobile: p.mobile }); },
    'renewal-done': (d) => { admin.markRenewal(d.id, Number(d.stage), !!d.done); render(); },
    'add-product': (d) => productForm(null, d.kind),
    'edit-product': (d) => productForm(admin.item(d.id)),
    'toggle-item': (d) => { const it = admin.item(d.id); admin.saveItem({ ...it, disabled: !it.disabled }); render(); },
    'edit-plan': (d) => planForm(d.id ? set().dietPlans.find((p) => p.id === d.id) : null),
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
    'add-line': () => { draft.lines.push({ itemId: '', qty: 1, rate: '', gst: 12, batch: '', expiry: '' }); render(); },
    'del-line': (d) => { draft.lines.splice(Number(d.i), 1); if (!draft.lines.length) draft.lines = newDraft().lines; render(); },
    'cancel-purchase': () => { draft = null; go('purchases'); },
    'add-expense': () => expenseForm(null),
    'exp-pick': (d) => { if (d.key === 'cat') expenseCat = expenseCat === d.name ? '' : d.name; else expenseName = expenseName === d.name ? '' : d.name; render(); },
    'add-doctor': () => doctorForm(null),
    'edit-doctor': (d) => doctorForm(admin.doctor(d.id)),
    'del-doctor': async (d) => { const x = admin.doctor(d.id); if (x && await confirmBox('Delete doctor', `Delete ${x.name}? Their appointments keep the name.`)) { admin.deleteDoctor(d.id); render(); toast('Doctor deleted'); } },
    'add-content': () => contentForm(null),
    'edit-content': (d) => contentForm(admin.contentItem(d.id)),
    'content-posted': (d) => { const c = admin.contentItem(d.id); admin.saveContent({ ...c, status: 'posted', postedDate: admin.today() }); render(); toast(`Posted: ${c.title}`); },
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
    lock: () => lock(),
  };

  document.addEventListener('click', (e) => {
    if (!$('#lock').hidden) return;
    if (e.target.closest('.addnew')) return;
    const goEl = e.target.closest('[data-go]');
    if (goEl) { e.preventDefault(); if (modal.open) modal.close(); if (goEl.dataset.go === 'purchase-new' && !draft) draft = newDraft(); go(goEl.dataset.go); return; }
    const act = e.target.closest('[data-act]');
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
    const lt = e.target.closest('[data-leadtab]');
    if (lt) { leadF.tab = lt.dataset.leadtab; render(); return; }
    const ls = e.target.closest('[data-leadstatus]');
    if (ls) { leadF.status = leadF.status === ls.dataset.leadstatus ? '' : ls.dataset.leadstatus; leadF.tab = 'all'; render(); return; }
    const dn = e.target.closest('[data-day]');
    if (dn) { const n = Number(dn.dataset.day); todayDate = n ? shiftDay(todayDate || admin.today(), n) : admin.today(); render(); }
  });
  // Links inside cards (Call / WhatsApp) must not open the card.
  view.addEventListener('click', (e) => { if (e.target.closest('.lead a, .appt a')) e.stopPropagation(); }, true);
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
  view.addEventListener('input', (e) => {
    const t = e.target;
    let key = t.dataset.filter || null; let sel = `[data-filter="${key}"]`;
    if (t.dataset.afilter === 'q') { key = 'aq'; sel = '[data-afilter="q"]'; }
    if (t.dataset.lfilter === 'q') { key = 'lq'; sel = '[data-lfilter="q"]'; }
    if (t.dataset.actfilter === 'q') { key = 'xq'; sel = '[data-actfilter="q"]'; }
    const setters = { q: (v) => { salesFilter.q = v; }, patient: (v) => { patientQ = v; }, purchase: (v) => { purchaseQ = v; }, aq: (v) => { apptF.q = v; }, lq: (v) => { leadF.q = v; }, xq: (v) => { actF.q = v; } };
    if (!setters[key]) return;
    setters[key](t.value);
    const pos = t.selectionStart;
    render();
    const again = $(sel);
    if (again) { again.focus(); again.setSelectionRange(pos, pos); }
  });
  $('#menu-btn').addEventListener('click', () => openMenu(true));
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
      title: `${u.hash ? 'Change' : 'Set'} PIN · ${u.name}`,
      fields: [
        ...(needOld && u.hash ? [{ name: 'old', label: 'Current PIN', type: 'password', required: true, attrs: 'inputmode="numeric" autocomplete="off"' }] : []),
        { name: 'pin', label: 'New PIN (4–6 digits)', type: 'password', required: true, attrs: 'inputmode="numeric" maxlength="6" autocomplete="off"' },
        { name: 'pin2', label: 'Repeat new PIN', type: 'password', required: true, attrs: 'inputmode="numeric" maxlength="6" autocomplete="off"' },
      ],
      onSubmit: async (v) => {
        if (needOld && u.hash && (await hashPin(v.old, u.salt)) !== u.hash) throw new Error('Current PIN is wrong');
        if (!/^\d{4,6}$/.test(v.pin)) throw new Error('PIN must be 4 to 6 digits');
        if (v.pin !== v.pin2) throw new Error('The two PINs do not match');
        await savePin(u.id, v.pin);
        return `PIN saved for ${u.name}`;
      },
    });
  }

  const ROLE_ICONS = {
    super: '<path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z"/>',
    admin: '<path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6z"/>',
    manager: '<rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>',
    desk: ICON_CAL,
  };
  let lockId = null;
  let lockPin = '';
  let lockMode = 'login'; // login | setup | connect
  const loginAccounts = () => S().accounts.filter((a) => a.hash && !a.disabled);
  function lockHtml() {
    if (!S().accounts.some((a) => a.role === 'super' && a.hash) && lockMode === 'login') lockMode = 'setup';
    if (lockMode === 'setup') {
      return `<h1>Welcome to The Prime Fit Admin</h1><p>First time on this device? Create the Super Admin PIN, or connect to The Prime Fit Google Sheet to use the logins already set up there.</p>
        <label class="f" style="text-align:left">Super Admin PIN (4–6 digits)<input class="pin-input" id="lk-pin" type="password" inputmode="numeric" maxlength="6" autocomplete="off"></label>
        <label class="f" style="text-align:left">Repeat PIN<input class="pin-input" id="lk-pin2" type="password" inputmode="numeric" maxlength="6" autocomplete="off"></label>
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
    const list = loginAccounts();
    if (!lockId || !list.some((a) => a.id === lockId)) {
      let last = null; try { last = localStorage.getItem('primefit.admin.lastLogin'); } catch (_) { last = null; }
      lockId = (list.find((a) => a.id === last) || list[0] || {}).id;
    }
    const acc = admin.account(lockId) || {};
    return `<h1>Sign in</h1><p>Choose your name and enter your PIN</p>
      <div class="roles ${list.length > 4 ? 'many' : ''}">${list.map((a) => `<button type="button" class="role r-${a.role} ${lockId === a.id ? 'on' : ''}" data-lock="role" data-id="${a.id}">
        <span class="ri">${svg(ROLE_ICONS[a.role])}</span><b>${esc(a.name)}</b><small>${A.ROLES[a.role]}</small></button>`).join('')}</div>
      <div class="dots" id="lk-dots">${Array.from({ length: acc.len || 6 }, (_, i) => `<i class="${i < lockPin.length ? 'on' : ''}"></i>`).join('')}</div>
      <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button type="button" data-key="${n}">${n}</button>`).join('')}
        <button type="button" class="k-del" data-key="del" aria-label="Delete">⌫</button><button type="button" data-key="0">0</button><button type="button" class="k-ok" data-key="ok">Sign in</button></div>
      <small class="err" id="lk-err"></small>
      <div class="lock-links">${!connected() ? '<button class="link" data-lock="connect-mode">Connect Google Sheet</button>' : ''}<a class="link" href="../index.html">Open diet charts</a></div>`;
  }
  function showLock() {
    role = null; me = null;
    lockPin = '';
    $('#shell').hidden = true; $('#lock').hidden = false;
    if (modal.open) modal.close();
    $('#lock-body').innerHTML = lockHtml();
    const first = $('#lock-body input');
    if (first) setTimeout(() => first.focus(), 60);
  }
  function refreshDots() { $$('#lk-dots i').forEach((d, i) => d.classList.toggle('on', i < lockPin.length)); }
  async function tryLogin() {
    const u = admin.account(lockId);
    if (!u || !u.hash || lockPin.length < 4) return;
    if ((await hashPin(lockPin, u.salt)) === u.hash) { enter(u.id); return; }
    lockPin = '';
    refreshDots();
    const dots = $('#lk-dots'); dots.classList.remove('shake'); void dots.offsetWidth; dots.classList.add('shake');
    $('#lk-err').textContent = 'Wrong PIN';
  }
  // Check the PIN as soon as it has as many digits as the saved one (older PINs: from 4 digits on).
  async function autoCheck() {
    const u = admin.account(lockId);
    if (!u || !u.hash || lockPin.length < 4) return;
    if (u.len) { if (lockPin.length === u.len) tryLogin(); return; }
    if ((await hashPin(lockPin, u.salt)) === u.hash) enter(u.id);
    else if (lockPin.length === 6) tryLogin();
  }
  function enter(id) {
    const acc = admin.account(id);
    if (!acc || acc.disabled) { showLock(); return; }
    me = acc; role = acc.role;
    admin.setActor(acc.name);
    try { sessionStorage.setItem(ROLE_KEY, id); localStorage.setItem('primefit.admin.lastLogin', id); } catch (_) { /* ignore */ }
    $('#lock').hidden = true; $('#shell').hidden = false;
    screen = home();
    changedScreen = true;
    try { history.replaceState({ screen }, ''); } catch (_) { /* ignore */ }
    render();
    pull();
  }
  function lock() {
    try { sessionStorage.removeItem(ROLE_KEY); } catch (_) { /* ignore */ }
    admin.setActor('');
    showLock();
  }
  $('#lock').addEventListener('click', async (e) => {
    const key = e.target.closest('[data-key]');
    if (key) {
      const k = key.dataset.key;
      $('#lk-err').textContent = '';
      if (k === 'del') lockPin = lockPin.slice(0, -1);
      else if (k === 'ok') { await tryLogin(); return; } else if (lockPin.length < 6) lockPin += k;
      refreshDots();
      autoCheck();
      return;
    }
    const b = e.target.closest('[data-lock]');
    if (!b) return;
    const a = b.dataset.lock;
    if (a === 'role') { lockId = b.dataset.id; lockPin = ''; $('#lock-body').innerHTML = lockHtml(); return; }
    if (a === 'connect-mode') { lockMode = 'connect'; showLock(); return; }
    if (a === 'back') { lockMode = 'login'; showLock(); return; }
    if (a === 'create') {
      const pin = $('#lk-pin').value.trim();
      if (!/^\d{4,6}$/.test(pin)) { $('#lk-err').textContent = 'Use 4 to 6 digits'; return; }
      if (pin !== $('#lk-pin2').value.trim()) { $('#lk-err').textContent = 'The two PINs do not match'; return; }
      const sup = S().accounts.find((x) => x.role === 'super');
      await savePin(sup.id, pin);
      lockMode = 'login';
      enter(sup.id);
      toast('Welcome! Add logins for your team in Settings → Logins.');
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
        toast(out.state ? 'Connected. Sign in with your login.' : 'Connected. The sheet is empty: create the Super Admin PIN.');
      } catch (err) {
        $('#lk-err').textContent = err.message;
        b.disabled = false; b.textContent = 'Connect & load data';
      }
    }
  });
  document.addEventListener('keydown', (e) => {
    if ($('#lock').hidden || lockMode !== 'login' || e.target.tagName === 'INPUT') return;
    if (/^\d$/.test(e.key) && lockPin.length < 6) { lockPin += e.key; refreshDots(); autoCheck(); }
    else if (e.key === 'Backspace') { lockPin = lockPin.slice(0, -1); refreshDots(); } else if (e.key === 'Enter') tryLogin();
  });
  let idle = Date.now();
  ['click', 'keydown', 'touchstart'].forEach((ev) => document.addEventListener(ev, () => { idle = Date.now(); }, { passive: true }));
  setInterval(() => { if (role && Date.now() - idle > IDLE_LOCK_MS) lock(); }, 30000);

  // Android back button: the app asks the page first (see MainActivity).
  window.hdvBack = () => {
    if (modal.open) { modal.close(); return true; }
    if ($('#side').classList.contains('open')) { openMenu(false); return true; }
    if (role && screen !== home()) { go(home()); return true; }
    return false;
  };

  $('.side-credit').textContent = CREDIT;
  let saved = null;
  try { saved = sessionStorage.getItem(ROLE_KEY); } catch (_) { saved = null; }
  const savedAcc = saved && admin.account(saved);
  if (savedAcc && savedAcc.hash && !savedAcc.disabled) enter(saved); else showLock();
})();
