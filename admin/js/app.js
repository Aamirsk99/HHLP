/* Hindivine Admin — screens: dashboard, OPD appointments, sales entry, patients, renewals,
 * products, inventory, purchases, team, incentives, salary, expenses, reports (PDF / Excel)
 * and settings (logins, Google Sheet data storage, backup). Three logins: Super Admin,
 * Manager and Front Desk (appointments only). */
(function () {
  const A = window.ADMIN;
  const X = window.EXPORT;
  const ROLE_KEY = 'hindivine.admin.role';
  const AUTO_REFRESH_MS = 30000;
  const SYNC_KEY = 'hindivine.admin.lastSync';
  const BASE_KEY = 'hindivine.admin.sheetVersion'; // version of the Google Sheet data this device last had
  const DIRTY_KEY = 'hindivine.admin.savedHash'; // fingerprint of the data last saved to / loaded from the sheet
  const SHEET_LINK = 'https://docs.google.com/spreadsheets/d/1_aKPoHJaJfQ6awuoG7ihufQzOBhw8I84yipErlWO1_Y/edit';
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
  const NAV = [
    ['dashboard', 'Dashboard', '<path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-4H4zM14 4v4h6V4z"/>', 'Overview'],
    ['appointments', 'OPD Appointments', ICON_CAL],
    ['sell', 'New Sale', '<path d="M12 5v14M5 12h14"/>', 'Sales'],
    ['sales', 'Sales', '<path d="M4 19h16M7 16V9M12 16V5M17 16v-4"/>'],
    ['patients', 'Patients', '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M16 11a3 3 0 1 0 0-6M21 20c0-2.6-1.5-4.8-4-5.6"/>'],
    ['renewals', 'Renewals', '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/>'],
    ['products', 'Products', '<path d="M4 8l8-4 8 4-8 4zM4 8v8l8 4 8-4V8M12 12v8"/>', 'Stock'],
    ['inventory', 'Inventory', '<rect x="4" y="4" width="16" height="6" rx="1"/><rect x="4" y="14" width="16" height="6" rx="1"/><path d="M9 7h6M9 17h6"/>'],
    ['purchases', 'Purchases', '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/>'],
    ['team', 'Team', '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>', 'Team & money'],
    ['incentives', 'Incentives', '<path d="M12 3v18M17 7H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6"/>'],
    ['salary', 'Salary', '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>'],
    ['expenses', 'Expenses', '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'],
    ['reports', 'Reports', '<path d="M5 3h14v18H5zM9 8h6M9 12h6M9 16h3"/>', 'Reports'],
    ['settings', 'Settings', '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'],
  ];
  // What each login can open. Front Desk works only with OPD appointments.
  const ALL = NAV.map((n) => n[0]).concat('purchase-new');
  const ACCESS = {
    super: ALL,
    manager: ['dashboard', 'appointments', 'sell', 'sales', 'patients', 'renewals', 'products', 'inventory', 'purchases', 'purchase-new', 'expenses', 'reports'],
    desk: ['appointments'],
  };
  const HOME = { super: 'dashboard', manager: 'dashboard', desk: 'appointments' };
  const TABS = { super: ['dashboard', 'appointments', 'sell', 'renewals', 'menu'], manager: ['dashboard', 'appointments', 'sell', 'renewals', 'menu'], desk: [] };
  const TITLES = { 'purchase-new': 'Purchase Entry' };
  let role = null;
  let screen = 'dashboard';
  let params = {};
  let period = { name: 'month', from: '', to: '' };
  const can = (id) => !!role && ACCESS[role].includes(id);

  function go(id, p, fromHistory) {
    if (id === 'menu') { openMenu(true); return; }
    if (!can(id)) id = HOME[role] || 'appointments';
    const changed = id !== screen;
    screen = id; params = p || {};
    openMenu(false);
    if (!fromHistory && changed) { try { history.pushState({ screen: id }, ''); } catch (_) { /* file:// may refuse */ } }
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
    const target = e.state && e.state.screen ? e.state.screen : HOME[role];
    go(target, {}, true);
  });

  function renderNav() {
    const due = can('renewals') ? admin.renewals().filter((r) => r.stage && !r.done).length : 0;
    const lowN = can('inventory') ? admin.lowStock().length : 0;
    const todayN = admin.appointmentsIn({ from: admin.today(), to: admin.today() }).filter((a) => a.status === 'booked').length;
    const badge = (id) => (id === 'renewals' && due ? `<span class="badge warn">${due}</span>`
      : id === 'inventory' && lowN ? `<span class="badge bad">${lowN}</span>`
        : id === 'appointments' && todayN ? `<span class="badge info">${todayN}</span>` : '');
    $('#nav').innerHTML = NAV.filter((n) => can(n[0])).map(([id, label, icon, group]) => `${group && role !== 'desk' ? `<div class="nav-group">${group}</div>` : ''}<button type="button" data-go="${id}" class="${screen === id || (id === 'purchases' && screen === 'purchase-new') ? 'on' : ''}">${svg(icon)}<span>${label}</span>${badge(id)}</button>`).join('');
    const tabs = TABS[role] || [];
    $('#tabs').hidden = !tabs.length;
    $('#tabs').innerHTML = tabs.map((id) => {
      if (id === 'sell') return `<button type="button" data-go="sell" class="fab" aria-label="New sale">${svg('<path d="M12 5v14M5 12h14"/>')}</button>`;
      const n = NAV.find((x) => x[0] === id);
      const [label, icon] = n ? [id === 'appointments' ? 'OPD' : n[1], n[2]] : ['Menu', '<path d="M4 7h16M4 12h16M4 17h16"/>'];
      return `<button type="button" data-go="${id}" class="${screen === id ? 'on' : ''}">${svg(icon)}${label}</button>`;
    }).join('');
    const u = S().users[role] || {};
    $('#side-sub').textContent = `${u.name || A.ROLES[role]} · ${set().clinic || ''}`;
    $('#user-initial').textContent = (u.name || A.ROLES[role] || '?').trim().charAt(0).toUpperCase();
    $('#menu-btn').hidden = role === 'desk';
  }

  function render() {
    if (!role) return;
    const f = SCREENS[screen] || SCREENS[HOME[role]];
    const nav = NAV.find((n) => n[0] === screen);
    $('#title').textContent = TITLES[screen] || (screen === 'sell' && params.edit ? 'Edit Sale' : nav ? nav[1] : '');
    $('#top-sub').textContent = SUBS[screen] ? SUBS[screen]() : (S().users[role] || {}).name || '';
    view.innerHTML = f();
    labelTables(view);
    renderNav();
    if (AFTER[screen]) AFTER[screen]();
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

  // ── Period filter ─────────────────────────────────────────────
  const PERIODS = [['today', 'Today'], ['month', 'This month'], ['lastMonth', 'Last month'], ['year', 'This year'], ['all', 'All time'], ['custom', 'Custom']];
  function range() {
    if (period.name === 'custom') return { from: period.from || null, to: period.to || null };
    return A.rangeFor(period.name, admin.today());
  }
  const periodBar = () => `<div class="scroll-x"><div class="seg">${PERIODS.map(([k, l]) => `<button type="button" data-period="${k}" class="${period.name === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
    ${period.name === 'custom' ? `<input type="date" data-pdate="from" value="${esc(period.from)}" aria-label="From"><input type="date" data-pdate="to" value="${esc(period.to)}" aria-label="To">` : ''}`;
  const periodLabel = () => {
    const r = range();
    if (!r) return 'All time';
    return r.from === r.to ? fdate(r.from) : `${fdate(r.from) || '…'} – ${fdate(r.to) || '…'}`;
  };

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
  const exportBtns = (key) => `<span class="btn-group"><button type="button" class="btn sm" data-act="export" data-what="${key}" data-fmt="pdf">${svg('<path d="M6 3h9l4 4v14H6zM14 3v5h5"/><path d="M9 14h6M9 17h4"/>')}PDF</button><button type="button" class="btn sm" data-act="export" data-what="${key}" data-fmt="xlsx">${svg('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8l8 8M16 8l-8 8"/>')}Excel</button></span>`;
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
      ${empty ? `<div class="card"><h2>Welcome</h2><p>Start in three steps: <button class="link" data-go="team">add your team</button>, <button class="link" data-go="products">set product prices</button>, then <button class="link" data-go="purchases">add stock</button>. Appointments and sales then update revenue, stock and incentives automatically.</p></div>` : ''}
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
        ${role === 'super' ? `<section class="card">${H('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>', 'gold', 'Team summary')}<div class="kpis">
          ${kpi('Team members', num(t.members), 'Active')}
          ${kpi('Total incentives', inr(t.incentives), '', 'gold')}
          ${kpi('Total salary', inr(t.salary), 'Per month')}
          ${kpi('Top performer', t.top ? t.top.name : '—', t.top ? `${inr(t.top.totalSales)} sales` : '', 'good')}
        </div></section>` : ''}
        <section class="card">${H('<rect x="4" y="4" width="16" height="6" rx="1"/><rect x="4" y="14" width="16" height="6" rx="1"/>', '', 'Stock summary')}<div class="kpis">
          ${kpi('Injection stock', num(st.injection), 'pens')}
          ${kpi('Protein stock', num(st.protein), '', 'teal')}
          ${kpi('Low stock alerts', num(st.low.length), '', st.low.length ? 'bad' : 'good')}
          ${kpi('Needles', num(st.needles))}
          ${kpi('Swabs', num(st.swabs))}
          ${kpi('Syringes', num(st.syringes))}
        </div>
        ${st.low.length ? `<div class="alerts" style="margin-top:12px">${st.low.slice(0, 4).map((l) => `<div class="alert"><b>${esc(l.item.name)}</b><span class="badge bad">${num(l.stock)} left</span></div>`).join('')}${st.low.length > 4 ? `<button class="link" data-go="inventory">See all ${st.low.length} low items →</button>` : ''}</div>` : ''}</section>
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

  // OPD appointments
  let apptView = 'day';
  let apptDay = '';
  const apptF = { status: '', mode: '', pay: '', q: '' };
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const addDays = (iso, n) => { const [y, m, d] = iso.split('-').map(Number); return A.isoDate(new Date(y, m - 1, d + n)); };
  const time12 = (t) => { if (!t) return '—'; const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
  const statusBadge = (s) => `<span class="badge ${{ booked: 'info', completed: 'ok', cancelled: 'bad', noshow: 'warn' }[s]}">${A.APPT_STATUS[s]}</span>`;
  const modeBadge = (m) => `<span class="badge ${m === 'online' ? 'violet' : 'teal'}">${m === 'online' ? 'Online' : 'Clinic'}</span>`;
  const payBadge = (a) => (a.status === 'cancelled' ? '' : a.paid ? `<span class="badge ok">Paid${a.payMethod ? ` · ${esc(a.payMethod)}` : ''}</span>` : '<span class="badge warn">Unpaid</span>');
  function filteredAppts() {
    const r = apptView === 'day' ? { from: apptDay, to: apptDay } : range();
    const q = apptF.q.toLowerCase();
    return admin.appointmentsIn(r).filter((a) => (!apptF.status || a.status === apptF.status) && (!apptF.mode || a.mode === apptF.mode)
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
      <select data-afilter="pay" aria-label="Payment">${opt('', 'Paid & unpaid', apptF.pay)}${opt('paid', 'Paid', apptF.pay)}${opt('unpaid', 'Unpaid', apptF.pay)}</select>
    </div></div>`;
    const cards = list.map((a) => `<div class="appt st-${a.status}" data-act="appt" data-id="${a.id}" role="button" tabindex="0">
        <div class="appt-time"><b>${time12(a.time).replace(/ (AM|PM)/, '')}</b><small>${a.time ? (Number(a.time.slice(0, 2)) < 12 ? 'AM' : 'PM') : 'Any time'}</small></div>
        <div class="appt-main"><b>${esc(a.patientName)}</b><div class="meta">${modeBadge(a.mode)}${statusBadge(a.status)}${apptView === 'list' ? `<span class="badge">${fdate(a.date)}</span>` : ''}</div></div>
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
        <label class="f">Time<input id="ap-time" type="time" value="${esc(v.time)}"></label></div>
        <div class="mode-pick">
          <label><input type="radio" name="ap-mode" value="clinic" ${v.mode === 'clinic' ? 'checked' : ''}><span class="mi">${svg('<path d="M3 21h18M5 21V8l7-5 7 5v13M10 21v-5h4v5M12 8v4M10 10h4"/>')}</span>Clinic visit</label>
          <label><input type="radio" name="ap-mode" value="online" ${v.mode === 'online' ? 'checked' : ''}><span class="mi">${svg('<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>')}</span>Online</label>
        </div>
        <div class="grid">
        <label class="f">Consultation fee (₹)<input id="ap-fee" type="number" min="0" value="${esc(v.fee)}"></label>
        <label class="f" id="ap-link-wrap" ${v.mode === 'online' ? '' : 'hidden'}>Online meeting link<input id="ap-link" value="${esc(v.link || '')}" placeholder="Google Meet / Zoom / WhatsApp video"></label>
        <label class="check span"><input type="checkbox" id="ap-paid" ${v.paid ? 'checked' : ''}> Fee paid</label>
        <label class="f" id="ap-method-wrap" ${v.paid ? '' : 'hidden'}>Payment method<select id="ap-method">${A.PAY_METHODS.map((m) => opt(m, m, v.payMethod || 'Cash')).join('')}</select></label>
        <label class="f span">Notes<textarea id="ap-notes" rows="2" placeholder="Complaint, reference, follow-up…">${esc(v.notes || '')}</textarea></label></div>`,
      onSubmit: () => {
        const mode = ($('input[name=ap-mode]:checked') || {}).value;
        const saved = admin.saveAppointment({
          id: a ? a.id : undefined, patientName: $('#ap-name').value, mobile: $('#ap-mobile').value, date: $('#ap-date').value, time: $('#ap-time').value,
          mode, fee: $('#ap-fee').value, link: $('#ap-link').value, notes: $('#ap-notes').value, paid: $('#ap-paid').checked,
          payMethod: $('#ap-paid').checked ? $('#ap-method').value : '', by: a ? a.by : role,
        });
        apptDay = saved.date;
        return a ? 'Appointment updated' : `Booked: ${saved.patientName}, ${fdate(saved.date)} ${time12(saved.time)}`;
      },
    });
    const body = $('#modal-body');
    body.addEventListener('change', (e) => {
      if (e.target.name === 'ap-mode') $('#ap-link-wrap').hidden = e.target.value !== 'online';
      if (e.target.id === 'ap-paid') $('#ap-method-wrap').hidden = !e.target.checked;
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
    const msg = `Namaste ${a.patientName}, your ${a.mode === 'online' ? 'online consultation' : 'clinic visit'} with ${set().clinic} is on ${fdate(a.date)}${a.time ? ` at ${time12(a.time)}` : ''}. Consultation fee ${inr(a.fee)}.${a.link ? ` Join: ${a.link}` : ''}`;
    const wa = waLink(a.mobile, msg);
    const hist = S().appointments.filter((x) => x.patientId === a.patientId && x.id !== a.id).length;
    const b = (act, label, cls) => `<button type="button" class="btn ${cls || ''}" data-act="${act}" data-id="${a.id}">${label}</button>`;
    openForm({
      title: a.patientName, submitLabel: false,
      html: `<div class="meta" style="display:flex;gap:6px;flex-wrap:wrap">${modeBadge(a.mode)}${statusBadge(a.status)}${payBadge(a)}</div>
        <dl class="detail-list">
          <div><dt>Date & time</dt><dd>${fdate(a.date)} · ${time12(a.time)}</dd></div>
          <div><dt>Mobile</dt><dd>${a.mobile ? `<a href="tel:${esc(a.mobile)}">${esc(a.mobile)}</a>` : '—'}</dd></div>
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
          ${role !== 'desk' ? b('appt-del', 'Delete', 'danger') : ''}
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
      : admin.itemsOf(t, true).filter((i) => !i.disabled || i.id === pre.itemId).map((i) => [i.id, `${i.name} · stock ${admin.stockOf(i.id)}${i.price ? ` · ${inr(i.price)}` : ''}`]);
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
      const total = admin.incentiveFor({ type: saleType, itemId: v.itemId, planId: v.planId, qty: v.qty });
      const refs = [{ memberId: v.refId, pct: 100 }];
      if (v.sharedId && v.sharedId !== v.refId) { const pct = Math.min(100, Math.max(0, Number(v.sharePct) || 0)); refs[0].pct = 100 - pct; refs.push({ memberId: v.sharedId, pct }); }
      const split = A.splitIncentive(total, refs).map((x) => {
        const m = admin.member(x.memberId);
        return `${esc(m.name)} <b>${m.incentiveOn === false ? '₹0 (incentive off)' : inr(x.amount)}</b>`;
      });
      parts.push(`Incentive ${inr(total)}: ${split.join(' · ')}`);
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
          <td class="acts">${can('sell') ? `<button class="btn xs" data-act="sell-to" data-id="${x.p.id}">New sale</button>` : ''}</td></tr>`);
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
      <td class="r">${num(admin.stockOf(i.id))}</td><td>${i.disabled ? '<span class="badge">Disabled</span>' : '<span class="badge ok">Active</span>'}</td>
      <td class="acts"><button class="btn sm" data-act="edit-product" data-id="${i.id}">Edit</button> <button class="btn sm" data-act="toggle-item" data-id="${i.id}">${i.disabled ? 'Enable' : 'Disable'}</button></td></tr>`);
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
      if (!rows.length) return invF.status ? '' : `<tr class="group"><td colspan="8">${esc(c)} <span class="hint">— no items</span> <button class="link" data-act="add-item" data-cat="${esc(c)}">+ Add item</button></td></tr>`;
      return `<tr class="group"><td colspan="8">${esc(c)}</td></tr>` + rows.map((r) => `<tr class="${r.disabled ? 'off' : ''}"><td>${esc(r.name)}</td>
        <td class="r">${num(r.opening)}</td><td class="r">${num(r.purchased)}</td><td class="r">${num(r.sold)}</td><td class="r">${r.adjusted ? (r.adjusted > 0 ? '+' : '') + num(r.adjusted) : '–'}</td>
        <td class="r"><b>${num(r.current)}</b> <span class="hint">${esc(r.unit)}</span></td>
        <td>${r.disabled ? '<span class="badge">Disabled</span>' : r.current <= r.lowAt ? '<span class="badge bad">Low</span>' : '<span class="badge ok">OK</span>'}</td>
        <td class="acts"><button class="btn xs" data-act="adjust" data-id="${r.itemId}">± Stock</button> <button class="btn xs" data-act="edit-item" data-id="${r.itemId}">Edit</button></td></tr>`).join('');
    });
    return `<div class="toolbar">${periodBar()}<span class="grow"></span>${exportBtns('inventory')}</div>
      <div class="filters"><div class="row">
        <select data-filter="invcat" aria-label="Category">${opt('', 'All categories', invF.cat)}${cats.map((c) => opt(c, c, invF.cat)).join('')}</select>
        <select data-filter="invstatus" aria-label="Status">${opt('', 'All items', invF.status)}${opt('low', 'Low stock only', invF.status)}${opt('ok', 'In stock', invF.status)}${opt('disabled', 'Disabled', invF.status)}</select>
        <button class="btn primary sm" data-act="add-item">+ Item</button><button class="btn sm" data-act="add-category">+ Category</button><button class="btn sm" data-go="purchase-new">+ Purchase</button></div></div>
      <div class="card"><div class="tbl-wrap"><table><thead><tr><th>Item</th><th class="r">Opening</th><th class="r">Purchased</th><th class="r">Sold</th><th class="r" data-hm="1">Adjusted</th><th class="r">Available</th><th>Status</th><th></th></tr></thead>
      <tbody>${sections.join('') || `<tr><td colspan="8" class="empty">No items for this selection.</td></tr>`}</tbody></table></div>
      <p class="hint">Opening = stock at the start of ${esc(periodLabel())}. Sales take stock out and purchases add it automatically; use ± Stock for counts, damage or samples.</p></div>`;
  };
  function itemForm(it, cat) {
    const cats = S().categories;
    openForm({
      title: it ? `Edit ${it.name}` : 'Add inventory item',
      fields: [
        { name: 'name', label: 'Item name', required: true, value: it ? it.name : cat || '' },
        { name: 'category', label: 'Category', type: 'select', value: it ? it.category : cat || cats[2].name, options: cats.map((c) => [c.name, `${c.name} (${A.KINDS[c.kind]})`]) },
        { name: 'unit', label: 'Unit', value: it ? it.unit : 'pcs' },
        { name: 'opening', label: 'Opening stock', type: 'number', value: it ? it.opening : 0, hint: 'Stock you had before using this app' },
        { name: 'lowAt', label: 'Low stock alert at', type: 'number', value: it ? it.lowAt : 10 },
      ],
      html: it ? '<p class="hint" style="margin:0">Set prices and incentives for sellable products under Products.</p>' : '',
      onSubmit: (v) => {
        const c = cats.find((x) => x.name === v.category);
        admin.saveItem({ ...(it || {}), ...v, kind: c ? c.kind : 'other' });
        return 'Item saved';
      },
    });
    if (it && !S().moves.some((m) => m.itemId === it.id)) {
      $('#modal-foot').insertAdjacentHTML('afterbegin', `<button type="button" class="btn danger" data-act="del-item" data-id="${it.id}" style="margin-right:auto">Delete</button>`);
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
    const rows = S().team.filter((m) => !teamStatus || (teamStatus === 'active' ? !m.disabled : m.disabled)).map((m) => `<tr class="${m.disabled ? 'off' : ''}"><td>${esc(m.name)}<span class="sub">${esc(m.designation || '')}</span></td>
      <td>${m.mobile ? `<a href="tel:${esc(m.mobile)}">${esc(m.mobile)}</a>` : ''}</td><td class="r">${inr(m.salary)}</td>
      <td>${m.incentiveOn === false ? '<span class="badge">Off</span>' : '<span class="badge ok">On</span>'}</td>
      <td>${fdate(m.joiningDate)}</td><td>${m.disabled ? '<span class="badge">Disabled</span>' : '<span class="badge ok">Active</span>'}</td>
      <td class="acts"><button class="btn xs" data-act="edit-member" data-id="${m.id}">Edit</button> <button class="btn xs" data-act="toggle-member" data-id="${m.id}">${m.disabled ? 'Enable' : 'Disable'}</button> <button class="btn xs danger" data-act="del-member" data-id="${m.id}">Delete</button></td></tr>`);
    return `<div class="toolbar"><select data-filter="teamstatus" aria-label="Status" style="max-width:200px">${opt('', 'All members', teamStatus)}${opt('active', 'Active', teamStatus)}${opt('disabled', 'Disabled', teamStatus)}</select>
        <span class="grow"></span>${exportBtns('team')}<button class="btn primary" data-act="add-member">+ Add member</button></div>
      <div class="card">${table(['Name', '~Mobile', '>Salary', 'Incentive', '~Joining date', 'Status', ''], rows)}
      <p class="hint">Disabled members keep their history but can't be chosen for new sales. With incentive status Off, their share of a sale's incentive is ₹0.</p></div>`;
  };
  function memberForm(m) {
    openForm({
      title: m ? `Edit ${m.name}` : 'Add team member',
      fields: [
        { name: 'name', label: 'Name', required: true, value: m ? m.name : '' },
        { name: 'designation', label: 'Designation', value: m ? m.designation : '', placeholder: 'Dietitian, Counsellor…' },
        { name: 'mobile', label: 'Mobile', type: 'tel', value: m ? m.mobile : '' },
        { name: 'salary', label: 'Monthly salary (₹)', type: 'number', value: m ? m.salary : '' },
        { name: 'joiningDate', label: 'Joining date', type: 'date', value: m ? m.joiningDate : admin.today() },
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
      ${table(['Employee', '>Salary', '>Incentive', '>Salary + Incentive'], rows.map((r) => `<tr><td>${esc(r.name)}<span class="sub">${esc(r.designation || '')}</span></td><td class="r">${inr(r.salary)}</td><td class="r">${inr(r.incentive)}</td><td class="r"><b>${inr(r.total)}</b></td></tr>`),
        `<td>Total</td><td class="r">${inr(t('salary'))}</td><td class="r">${inr(t('incentive'))}</td><td class="r">${inr(t('total'))}</td>`)}
      <p class="hint">Incentive = the member's share of every sale in ${fdate(month)}. “Book as expenses” adds Salary and Incentive entries, so the dashboard profit includes them.</p></div>`;
  };

  // Expenses
  let expenseCat = '';
  const filteredExpenses = () => S().expenses.filter((e) => inR(e.date, range()) && (!expenseCat || e.category === expenseCat))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  SUBS.expenses = () => periodLabel();
  SCREENS.expenses = () => {
    const list = filteredExpenses();
    const fin = admin.financialReport(range());
    return `<div class="toolbar">${periodBar()}<span class="grow"></span>${exportBtns('expenses')}</div>
      <div class="kpis" style="margin-bottom:14px">${kpi('Revenue', inr(fin.revenue))}${kpi('Expenses', inr(fin.expenses), '', 'gold')}${kpi('Profit', inr(fin.profit), 'Revenue − Expenses', fin.profit >= 0 ? 'good' : 'bad')}</div>
      <div class="filters"><div class="row"><select data-filter="expense" aria-label="Category">${opt('', 'All categories', expenseCat)}${A.EXPENSE_CATEGORIES.map((c) => opt(c, `${c}${fin.byCategory[c] ? ` · ${inr(fin.byCategory[c])}` : ''}`, expenseCat)).join('')}</select>
        <button class="btn primary" data-act="add-expense">+ Add expense</button></div></div>
      <div class="card">${table(['Category', '~Note', 'Date', '>Amount', ''], list.map((e) => `<tr><td>${esc(e.category)} ${e.auto ? '<span class="badge info">Auto</span>' : ''}</td><td>${esc(e.note)}</td><td>${fdate(e.date)}</td><td class="r"><b>${inr(e.amount)}</b></td>
        <td class="acts">${e.auto ? '' : `<button class="btn xs" data-act="edit-expense" data-id="${e.id}">Edit</button> `}<button class="btn xs danger" data-act="del-expense" data-id="${e.id}">Delete</button></td></tr>`),
        `<td colspan="3">Total · ${list.length} entries</td><td class="r">${inr(list.reduce((a, e) => a + e.amount, 0))}</td><td></td>`)}</div>`;
  };
  function expenseForm(e) {
    openForm({
      title: e ? 'Edit expense' : 'Add expense',
      fields: [
        { name: 'category', label: 'Category', type: 'select', value: e ? e.category : 'Rent', options: A.EXPENSE_CATEGORIES.map((c) => [c, c]) },
        { name: 'amount', label: 'Amount (₹)', type: 'number', required: true, value: e ? e.amount : '' },
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
    appointments: (list) => sec('OPD Appointments', ['Date', 'Time', 'Patient', 'Mobile', 'Mode', 'Status', 'Payment', '>Fee'],
      list.map((a) => [a.date, time12(a.time), a.patientName, a.mobile, A.APPT_MODES[a.mode], A.APPT_STATUS[a.status], a.status === 'cancelled' ? '—' : a.paid ? `Paid ${a.payMethod || ''}`.trim() : 'Unpaid', a.fee]), { money: [7], total: [7] }),
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
    inventory: (rows) => sec('Inventory', ['Category', 'Item', '>Opening', '>Purchased', '>Sold', '>Adjusted', '>Available', 'Status'],
      rows.map((r) => [r.category, r.name, r.opening, r.purchased, r.sold, r.adjusted, r.current, r.disabled ? 'Disabled' : r.current <= r.lowAt ? 'LOW' : 'OK'])),
    purchases: (list) => sec('Purchases', ['Date', 'Vendor', 'Invoice', 'Product', '>Qty', 'Batch', 'Expiry', '>Rate', '>GST %', '>Total'],
      list.flatMap((p) => p.lines.map((l) => [p.date, p.vendor, p.invoiceNo, l.name, l.qty, l.batch, l.expiry, l.rate, l.gst, l.total])), { money: [7, 9], total: [4, 9] }),
    team: () => sec('Team', ['Name', 'Designation', 'Mobile', '>Salary', 'Incentive', 'Joining Date', 'Status'],
      S().team.filter((m) => !teamStatus || (teamStatus === 'active' ? !m.disabled : m.disabled)).map((m) => [m.name, m.designation || '', m.mobile || '', m.salary, m.incentiveOn === false ? 'Off' : 'On', m.joiningDate || '', m.disabled ? 'Disabled' : 'Active']), { money: [3], total: [3] }),
    incentives: (ledger) => sec('Incentive Ledger', ['Date', 'Team Member', 'Sale', 'Product', 'Patient', '>Share %', '>Incentive'],
      ledger.map((l) => [l.date, l.name, A.SALE_TYPES[l.type], l.product, l.patient, l.pct, l.amount]), { money: [6], total: [6] }),
    salary: (month) => sec(`Salary ${fdate(month)}`, ['Employee', 'Designation', '>Salary', '>Incentive', '>Salary + Incentive'],
      admin.salarySheet(month).map((r) => [r.name, r.designation || '', r.salary, r.incentive, r.total]), { money: [2, 3, 4], total: [2, 3, 4] }),
    expenses: (list) => sec('Expenses', ['Date', 'Category', 'Note', '>Amount'], list.map((e) => [e.date, e.category, e.note || '', e.amount]), { money: [3], total: [3] }),
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
      ['Injection stock', num(d.stock.injection)], ['Protein stock', num(d.stock.protein)], ['Low stock alerts', num(d.stock.low.length)], ['Renewals due', num(d.renewalsDue)]];
  };
  const stamp = () => admin.today();
  const EXPORTS = {
    dashboard: () => ({ title: 'Dashboard', subtitle: periodLabel(), kpis: dashKpis(range()),
      sections: [...R.financial(range()), { ...R.inventory(admin.stockReport(null).filter((x) => !x.disabled && x.current <= x.lowAt)), title: 'Low Stock Alerts' }] }),
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
    expenses: () => ({ title: 'Expenses', subtitle: periodLabel(), sections: [R.expenses(filteredExpenses())] }),
    report: () => REPORTS[reportTab].build(),
    all: () => {
      const r = range();
      const secs = [...R.financial(r), R.teamReport(r), R.appointments(admin.appointmentsIn(r)), R.sales(S().sales.filter((s) => inR(s.date, r)).sort((a, b) => (a.date < b.date ? -1 : 1))),
        R.inventory(admin.stockReport(r)), R.purchases([...S().purchases].filter((p) => inR(p.date, r))), R.expenses(S().expenses.filter((e) => inR(e.date, r))),
        R.renewals(admin.renewals().filter((x) => x.stage)), R.salary((r && r.to ? r.to : stamp()).slice(0, 7))];
      // Managers get everything except salary and team incentives.
      return { title: 'All Reports', subtitle: periodLabel(), kpis: dashKpis(r), sections: role === 'super' ? secs : secs.filter((s) => !s.title.startsWith('Salary') && s.title !== 'Team Performance') };
    },
  };
  const REPORTS = {
    overview: { label: 'Overview', build: () => ({ title: 'Business Overview', subtitle: periodLabel(), kpis: dashKpis(range()), sections: R.financial(range()) }) },
    appointments: { label: 'OPD', build: () => ({ title: 'OPD Appointments Report', subtitle: periodLabel(), sections: [R.appointments(admin.appointmentsIn(range()))] }) },
    sales: { label: 'Sales', build: () => ({ title: 'Sales Report', subtitle: periodLabel(), sections: [R.sales(S().sales.filter((s) => inR(s.date, range())).sort((a, b) => (a.date < b.date ? 1 : -1)))] }) },
    team: { label: 'Team wise', only: 'super', build: () => ({ title: 'Team Report', subtitle: periodLabel(), sections: [R.teamReport(range())] }) },
    financial: { label: 'Financial', build: () => ({ title: 'Financial Report', subtitle: periodLabel(), sections: R.financial(range()) }) },
    stock: { label: 'Stock', build: () => ({ title: 'Stock Report', subtitle: periodLabel(), sections: [R.inventory(admin.stockReport(range()))] }) },
    purchases: { label: 'Purchases', build: () => ({ title: 'Purchase Report', subtitle: periodLabel(), sections: [R.purchases([...S().purchases].filter((p) => inR(p.date, range())))] }) },
    expenses: { label: 'Expenses', build: () => ({ title: 'Expense Report', subtitle: periodLabel(), sections: [R.expenses(S().expenses.filter((e) => inR(e.date, range())))] }) },
    renewals: { label: 'Renewals', build: () => ({ title: 'Renewal Report', subtitle: `Alert after ${set().renewalDays[0]} days`, sections: [R.renewals(admin.renewals())] }) },
  };
  function runExport(what, fmt) {
    const rep = EXPORTS[what]();
    rep.filename = `Hindivine-${rep.title.replace(/[^A-Za-z0-9]+/g, '-')}-${stamp()}`;
    try {
      if (fmt === 'pdf') {
        const pretty = { ...rep, sections: rep.sections.map((s) => ({ ...s, rows: s.rows.map((r) => r.map((v, i) => fmtCell(s, i, v))), foot: s.foot && s.foot.map((v, i) => fmtCell(s, i, v)) })) };
        toast(`Saved ${X.pdf(pretty, set().clinic)}`);
      } else toast(`Saved ${X.xlsx(rep)}`);
    } catch (err) { toast(`Export failed: ${err.message}`, true); }
  }

  // Reports
  let reportTab = 'overview';
  SUBS.reports = () => periodLabel();
  SCREENS.reports = () => {
    const tabs = Object.entries(REPORTS).filter(([, v]) => !v.only || v.only === role);
    if (!REPORTS[reportTab] || (REPORTS[reportTab].only && REPORTS[reportTab].only !== role)) reportTab = 'overview';
    const rep = REPORTS[reportTab].build();
    return `<div class="toolbar"><div class="scroll-x"><div class="seg">${tabs.map(([k, v]) => `<button type="button" data-report="${k}" class="${reportTab === k ? 'on' : ''}">${v.label}</button>`).join('')}</div></div></div>
      <div class="toolbar">${periodBar()}<span class="grow"></span>${exportBtns('report')}</div>
      <div class="card" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b style="flex:1;min-width:180px">All reports in one file</b><span class="hint">Every report for ${esc(periodLabel())}</span>
        <button class="btn primary sm" data-act="export" data-what="all" data-fmt="pdf">Download all · PDF</button><button class="btn success sm" data-act="export" data-what="all" data-fmt="xlsx">Download all · Excel</button></div>
      ${rep.kpis ? `<div class="kpis" style="margin-bottom:16px">${rep.kpis.map(([l, v]) => kpi(l, v)).join('')}</div>` : ''}
      ${rep.sections.map(renderSec).join('')}`;
  };

  // Settings (Super Admin only)
  SCREENS.settings = () => {
    const st = set();
    const last = Number(storage.getItem(SYNC_KEY)) || 0;
    const users = S().users;
    return `<form class="card form-card" id="settings-form" autocomplete="off">
      <h2><span class="ic">${svg('<path d="M3 21h18M5 21V8l7-5 7 5v13"/>')}</span>Clinic</h2>
      <div class="grid">
        <label class="f">Clinic name<input name="clinic" value="${esc(st.clinic)}"></label>
        <label class="f">OPD consultation fee (₹)<input type="number" min="0" name="consultFee" value="${esc(st.consultFee)}"></label>
        <label class="f">Renewal alert after (days)<input type="number" min="1" name="r1" value="${esc(st.renewalDays[0])}"></label>
        <label class="f">Overdue after (days)<input type="number" min="1" name="r2" value="${esc(st.renewalDays[1])}"></label>
        <label class="f">Active patient = visited within (days)<input type="number" min="1" name="activeDays" value="${esc(st.activeDays)}"></label>
      </div>
      <label class="check"><input type="checkbox" name="purchaseExpense" ${st.purchaseExpense ? 'checked' : ''}> Book every purchase invoice as an expense (Injection / Protein Purchase)</label>
      <h2 style="margin-top:6px"><span class="ic teal">${svg('<path d="M4 4h16v16H4zM4 10h16M10 4v16"/>')}</span>Google Sheet (data storage)</h2>
      <p class="hint" style="margin:0">All data is stored in <a href="${SHEET_LINK}" target="_blank" rel="noopener">the Hindivine Google Sheet</a> and refreshes automatically on every device. Set-up once: open the sheet → Extensions → Apps Script → paste <a href="google-apps-script/Code.gs" target="_blank" rel="noopener">Code.gs</a> → run <b>setup</b> → Deploy → Web app (Execute as: Me, Who has access: Anyone) → paste the URL and the secret here.</p>
      <div class="grid two">
        <label class="f">Web app URL<input name="sheetsUrl" value="${esc(st.sheetsUrl)}" placeholder="https://script.google.com/macros/s/…/exec"></label>
        <label class="f">Secret<input type="password" name="sheetsSecret" value="${esc(st.sheetsSecret)}"><span class="hint">Shown in the Apps Script log after running setup.</span></label>
      </div>
      <p class="hint" style="margin:0" id="last-sync">${connected() ? (last ? `Connected · last saved ${new Date(last).toLocaleString('en-IN')}` : 'Connected') : 'Not connected: data is only on this device'}</p>
      <div class="actions"><button class="btn primary" type="submit">Save settings</button></div>
    </form>
    <div class="card"><h2><span class="ic gold">${svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>')}</span>Logins</h2>
      <p class="hint" style="margin-top:0">Three logins, each with its own PIN. PINs are shared through the Google Sheet, so they work on every device. Front Desk sees OPD appointments only; Manager sees everything except team, salary, incentives and settings.</p>
      ${table(['Login', 'Access', 'PIN', ''], Object.entries(A.ROLES).map(([k]) => `<tr><td><b>${esc(users[k].name)}</b><span class="sub">${esc(A.ROLES[k])}</span></td>
        <td>${k === 'super' ? 'Everything' : k === 'manager' ? 'All except team, salary, incentives, settings' : 'OPD appointments only'}</td>
        <td>${users[k].hash ? '<span class="badge ok">Set</span>' : '<span class="badge warn">Not set</span>'}</td>
        <td class="acts"><button class="btn xs" data-act="set-pin" data-role="${k}">${users[k].hash ? 'Change PIN' : 'Set PIN'}</button> <button class="btn xs" data-act="rename-login" data-role="${k}">Rename</button>${k !== 'super' && users[k].hash ? ` <button class="btn xs danger" data-act="clear-pin" data-role="${k}">Remove</button>` : ''}</td></tr>`))}
      <p class="hint">The app logs out after 15 minutes without use.</p></div>
    <div class="card"><h2><span class="ic violet">${svg('<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>')}</span>Backup & export</h2><p class="hint" style="margin-top:0">${connected() ? 'Data is saved to the Google Sheet and kept on this device for offline use.' : 'All data is stored on this device.'} Download everything as PDF or Excel from Reports.</p>
      <div class="actions" style="justify-content:flex-start"><button class="btn" data-act="export-backup">Export backup file</button>
      <label class="btn">Import backup<input type="file" id="import-file" accept="application/json,.json" hidden></label>
      <button class="btn" data-go="reports">All reports (PDF / Excel)</button>
      <button class="btn danger" data-act="reset">Erase all data</button></div></div>`;
  };
  AFTER.settings = () => {
    $('#settings-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const r1 = Number(f.r1.value) || 75; const r2 = Number(f.r2.value) || 90;
      const wasConnected = connected();
      admin.updateSettings({
        clinic: f.clinic.value.trim(), consultFee: Number(f.consultFee.value) || 0, renewalDays: [Math.min(r1, r2), Math.max(r1, r2)], activeDays: Number(f.activeDays.value) || 90,
        purchaseExpense: f.purchaseExpense.checked, sheetsUrl: f.sheetsUrl.value.trim(), sheetsSecret: f.sheetsSecret.value.trim(),
      });
      toast('Settings saved');
      render();
      if (connected() && !wasConnected) pull(true);
    });
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
    if (!role || !S().users[role] || !S().users[role].hash) { if (!$('#lock').hidden) showLock(); return; }
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
  const ACTIONS = {
    refresh: () => refreshNow(),
    export: (d) => runExport(d.what, d.fmt),
    'user-menu': () => {
      const u = S().users[role];
      openForm({
        title: u.name, submitLabel: false,
        html: `<dl class="detail-list"><div><dt>Login</dt><dd>${esc(A.ROLES[role])}</dd></div><div><dt>Data</dt><dd>${connected() ? 'Google Sheet · auto refresh' : 'This device only'}</dd></div></dl>
          <div class="quick"><button type="button" class="btn" data-act="refresh">Refresh data</button><button type="button" class="btn" data-act="my-pin">Change my PIN</button><button type="button" class="btn danger" data-act="lock">Log out</button></div>`,
      });
    },
    'my-pin': () => pinForm(role, true),
    'set-pin': (d) => pinForm(d.role, d.role === role),
    'clear-pin': async (d) => {
      if (await confirmBox('Remove login', `Remove the PIN for ${S().users[d.role].name}? That login can't be used until a new PIN is set.`, 'Remove')) { admin.setUserPin(d.role, '', ''); render(); }
    },
    'rename-login': (d) => openForm({
      title: `Rename ${A.ROLES[d.role]} login`,
      fields: [{ name: 'name', label: 'Display name', required: true, value: S().users[d.role].name }],
      onSubmit: (v) => { admin.setUserName(d.role, v.name); return 'Login renamed'; },
    }),
    'new-appt': () => apptForm(null),
    appt: (d) => apptDetail(d.id),
    'appt-edit': (d) => apptForm(admin.appointment(d.id)),
    'appt-complete': (d) => { const a = admin.appointment(d.id); setAppt(d.id, { status: 'completed' }, `${a.patientName}: completed${a.paid ? '' : ' · fee still unpaid'}`); },
    'appt-pay': (d) => {
      const a = admin.appointment(d.id);
      openForm({
        title: `Fee received · ${a.patientName}`, submitLabel: `Mark ${inr(a.fee)} paid`,
        fields: [{ name: 'fee', label: 'Amount (₹)', type: 'number', value: a.fee }, { name: 'method', label: 'Payment method', type: 'select', value: 'Cash', options: A.PAY_METHODS.map((m) => [m, m]) }],
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
    'edit-expense': (d) => expenseForm(S().expenses.find((e) => e.id === d.id)),
    'del-expense': async (d) => {
      const e = S().expenses.find((x) => x.id === d.id);
      const note = e.auto ? ' This entry was added automatically; it comes back if you re-book salary or re-save the invoice.' : '';
      if (await confirmBox('Delete expense', `Delete ${e.category} ${inr(e.amount)}?${note}`)) { admin.deleteExpense(d.id); render(); }
    },
    'post-salary': (d) => { const r = admin.postSalary(d.month); render(); toast(`Booked: salary ${inr(r.salary)}, incentive ${inr(r.incentive)}`); },
    'export-backup': () => download(`hindivine-admin-backup-${admin.today()}.json`, admin.exportBackup(), 'application/json'),
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
    const goEl = e.target.closest('[data-go]');
    if (goEl) { e.preventDefault(); if (modal.open) modal.close(); if (goEl.dataset.go === 'purchase-new' && !draft) draft = newDraft(); go(goEl.dataset.go); return; }
    const act = e.target.closest('[data-act]');
    if (act && ACTIONS[act.dataset.act]) { e.preventDefault(); ACTIONS[act.dataset.act](act.dataset); return; }
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
    if (ad) { apptDay = ad.dataset.apptday; render(); }
  });
  view.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('.appt')) apptDetail(e.target.dataset.id); });
  view.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.pdate) { period[t.dataset.pdate] = t.value; render(); return; }
    if (t.matches('[data-apptdate]')) { apptDay = t.value || admin.today(); render(); return; }
    if (t.dataset.afilter && t.tagName === 'SELECT') { apptF[t.dataset.afilter] = t.value; render(); return; }
    const f = t.dataset.filter;
    if (!f) return;
    const setters = {
      type: (v) => { salesFilter.type = v; }, member: (v) => { salesFilter.member = v; }, pt: (v) => { salesFilter.pt = v; },
      ledger: (v) => { ledgerMember = v; }, salary: (v) => { salaryMonth = v; }, expense: (v) => { expenseCat = v; },
      pstatus: (v) => { patientStatus = v; }, invcat: (v) => { invF.cat = v; }, invstatus: (v) => { invF.status = v; }, teamstatus: (v) => { teamStatus = v; },
    };
    if (!setters[f]) return;
    setters[f](t.value);
    render();
  });
  // Search boxes filter as you type and keep the cursor in place.
  view.addEventListener('input', (e) => {
    const t = e.target;
    const key = t.dataset.filter || (t.dataset.afilter === 'q' ? 'aq' : null);
    const setters = { q: (v) => { salesFilter.q = v; }, patient: (v) => { patientQ = v; }, purchase: (v) => { purchaseQ = v; }, aq: (v) => { apptF.q = v; } };
    if (!setters[key]) return;
    setters[key](t.value);
    const sel = key === 'aq' ? '[data-afilter="q"]' : `[data-filter="${key}"]`;
    const pos = t.selectionStart;
    render();
    const again = $(sel);
    if (again) { again.focus(); again.setSelectionRange(pos, pos); }
  });
  $('#menu-btn').addEventListener('click', () => openMenu(true));
  $('#scrim').addEventListener('click', () => openMenu(false));

  // ── Login: Super Admin, Manager, Front Desk ───────────────────
  async function hashPin(pin, salt) {
    const text = `${salt}:${pin}`;
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 5381; for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
    return 'djb' + h.toString(16);
  }
  async function savePin(r, pin) {
    const salt = Math.random().toString(36).slice(2, 12);
    admin.setUserPin(r, await hashPin(pin, salt), salt, pin.length);
  }
  function pinForm(r, needOld) {
    const u = S().users[r];
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
        await savePin(r, v.pin);
        return `PIN saved for ${u.name}`;
      },
    });
  }

  const ROLE_ICONS = {
    super: '<path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z"/>',
    manager: '<rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>',
    desk: ICON_CAL,
  };
  let lockRole = null;
  let lockPin = '';
  let lockMode = 'login'; // login | setup | connect
  function lockHtml() {
    const users = S().users;
    if (!users.super.hash && lockMode === 'login') lockMode = 'setup';
    if (lockMode === 'setup') {
      return `<h1>Welcome to Hindivine Admin</h1><p>First time on this device? Create the Super Admin PIN, or connect to the Hindivine Google Sheet to use the logins already set up there.</p>
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
    if (!lockRole || !users[lockRole].hash) lockRole = Object.keys(A.ROLES).find((k) => users[k].hash);
    return `<h1>Sign in</h1><p>Choose your login and enter your PIN</p>
      <div class="roles">${Object.keys(A.ROLES).map((k) => `<button type="button" class="role ${lockRole === k ? 'on' : ''}" data-lock="role" data-role="${k}" ${users[k].hash ? '' : 'disabled'}>
        <span class="ri">${svg(ROLE_ICONS[k])}</span><b>${esc(users[k].name)}</b><small>${users[k].hash ? (k === 'desk' ? 'Appointments' : k === 'manager' ? 'Operations' : 'Full access') : 'PIN not set'}</small></button>`).join('')}</div>
      <div class="dots" id="lk-dots">${Array.from({ length: (users[lockRole] || {}).len || 6 }, (_, i) => i).map((i) => `<i class="${i < lockPin.length ? 'on' : ''}"></i>`).join('')}</div>
      <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button type="button" data-key="${n}">${n}</button>`).join('')}
        <button type="button" class="k-del" data-key="del" aria-label="Delete">⌫</button><button type="button" data-key="0">0</button><button type="button" class="k-ok" data-key="ok">Sign in</button></div>
      <small class="err" id="lk-err"></small>
      ${!connected() ? '<div class="lock-links"><button class="link" data-lock="connect-mode">Connect Google Sheet</button></div>' : ''}`;
  }
  function showLock() {
    role = null;
    lockPin = '';
    $('#shell').hidden = true; $('#lock').hidden = false;
    if (modal.open) modal.close();
    $('#lock-body').innerHTML = lockHtml();
    const first = $('#lock-body input');
    if (first) setTimeout(() => first.focus(), 60);
  }
  function refreshDots() { $$('#lk-dots i').forEach((d, i) => d.classList.toggle('on', i < lockPin.length)); }
  async function tryLogin() {
    const u = S().users[lockRole];
    if (!u || !u.hash || lockPin.length < 4) return;
    if ((await hashPin(lockPin, u.salt)) === u.hash) { enter(lockRole); return; }
    lockPin = '';
    refreshDots();
    const dots = $('#lk-dots'); dots.classList.remove('shake'); void dots.offsetWidth; dots.classList.add('shake');
    $('#lk-err').textContent = 'Wrong PIN';
  }
  function enter(r) {
    role = r;
    try { sessionStorage.setItem(ROLE_KEY, r); } catch (_) { /* ignore */ }
    $('#lock').hidden = true; $('#shell').hidden = false;
    screen = HOME[r];
    try { history.replaceState({ screen }, ''); } catch (_) { /* ignore */ }
    render();
    pull();
  }
  function lock() {
    try { sessionStorage.removeItem(ROLE_KEY); } catch (_) { /* ignore */ }
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
    if (a === 'role') { lockRole = b.dataset.role; lockPin = ''; $('#lock-body').innerHTML = lockHtml(); return; }
    if (a === 'connect-mode') { lockMode = 'connect'; showLock(); return; }
    if (a === 'back') { lockMode = 'login'; showLock(); return; }
    if (a === 'create') {
      const pin = $('#lk-pin').value.trim();
      if (!/^\d{4,6}$/.test(pin)) { $('#lk-err').textContent = 'Use 4 to 6 digits'; return; }
      if (pin !== $('#lk-pin2').value.trim()) { $('#lk-err').textContent = 'The two PINs do not match'; return; }
      await savePin('super', pin);
      lockMode = 'login';
      enter('super');
      toast('Welcome! Set the Manager and Front Desk PINs in Settings → Logins.');
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
  // Check the PIN as soon as it has as many digits as the saved one (older PINs: from 4 digits on).
  async function autoCheck() {
    const u = S().users[lockRole];
    if (!u || !u.hash || lockPin.length < 4) return;
    if (u.len) { if (lockPin.length === u.len) tryLogin(); return; }
    if ((await hashPin(lockPin, u.salt)) === u.hash) enter(lockRole);
    else if (lockPin.length === 6) tryLogin();
  }
  let idle = Date.now();
  ['click', 'keydown', 'touchstart'].forEach((ev) => document.addEventListener(ev, () => { idle = Date.now(); }, { passive: true }));
  setInterval(() => { if (role && Date.now() - idle > IDLE_LOCK_MS) lock(); }, 30000);

  // Android back button: the app asks the page first (see MainActivity).
  window.hdvBack = () => {
    if (modal.open) { modal.close(); return true; }
    if ($('#side').classList.contains('open')) { openMenu(false); return true; }
    if (role && screen !== HOME[role]) { go(HOME[role]); return true; }
    return false;
  };

  let saved = null;
  try { saved = sessionStorage.getItem(ROLE_KEY); } catch (_) { saved = null; }
  if (saved && S().users[saved] && S().users[saved].hash) enter(saved); else showLock();
})();
