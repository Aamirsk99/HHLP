/* Hindivine Admin — screens: dashboard, sales entry, patients, renewals, products,
 * inventory, purchases (AI invoice scanner), team, incentives, salary, expenses,
 * reports and settings (PIN, Claude API key, Google Sheet data storage, backup). */
(function () {
  const A = window.ADMIN;
  const INV = window.INVOICE;
  const SYNC_KEY = 'hindivine.admin.lastSync';
  const BASE_KEY = 'hindivine.admin.sheetVersion'; // version of the Google Sheet data this device last had
  const DIRTY_KEY = 'hindivine.admin.savedHash'; // fingerprint of the data last saved to / loaded from the sheet
  const SHEET_LINK = 'https://docs.google.com/spreadsheets/d/1_aKPoHJaJfQ6awuoG7ihufQzOBhw8I84yipErlWO1_Y/edit';
  const UNLOCK_KEY = 'hindivine.admin.unlocked';
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
  const NAV = [
    ['dashboard', 'Dashboard', '<path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-4H4zM14 4v4h6V4z"/>'],
    ['sell', 'New Sale', '<path d="M12 5v14M5 12h14"/>'],
    ['sales', 'Sales', '<path d="M4 19h16M7 16V9M12 16V5M17 16v-4"/>'],
    ['patients', 'Patients', '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M16 11a3 3 0 1 0 0-6M21 20c0-2.6-1.5-4.8-4-5.6"/>'],
    ['renewals', 'Renewals', '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/>'],
    ['products', 'Products', '<path d="M4 8l8-4 8 4-8 4zM4 8v8l8 4 8-4V8M12 12v8"/>'],
    ['inventory', 'Inventory', '<rect x="4" y="4" width="16" height="6" rx="1"/><rect x="4" y="14" width="16" height="6" rx="1"/><path d="M9 7h6M9 17h6"/>'],
    ['purchases', 'Purchases', '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/>'],
    ['team', 'Team', '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>'],
    ['incentives', 'Incentives', '<path d="M12 3v18M17 7H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6"/>'],
    ['salary', 'Salary', '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>'],
    ['expenses', 'Expenses', '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'],
    ['reports', 'Reports', '<path d="M5 3h14v18H5zM9 8h6M9 12h6M9 16h3"/>'],
    ['settings', 'Settings', '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'],
  ];
  const TABS = ['dashboard', 'sell', 'inventory', 'renewals', 'menu'];
  const TITLES = { 'purchase-new': 'Purchase Entry' };
  let screen = 'dashboard';
  let params = {};
  let period = { name: 'month', from: '', to: '' };

  function go(id, p) {
    if (id === 'menu') { openMenu(true); return; }
    screen = id; params = p || {};
    openMenu(false);
    render();
    window.scrollTo(0, 0);
  }
  function openMenu(on) {
    $('#side').classList.toggle('open', on);
    $('#scrim').hidden = !on;
  }

  function renderNav() {
    const due = admin.renewals().filter((r) => r.stage && !r.done).length;
    const lowN = admin.lowStock().length;
    const badge = (id) => (id === 'renewals' && due ? `<span class="badge warn">${due}</span>`
      : id === 'inventory' && lowN ? `<span class="badge bad">${lowN}</span>` : '');
    $('#nav').innerHTML = NAV.map(([id, label, icon]) => `<button type="button" data-go="${id}" class="${screen === id || (id === 'purchases' && screen === 'purchase-new') ? 'on' : ''}">${svg(icon)}<span>${label}</span>${badge(id)}</button>`).join('');
    $('#tabs').innerHTML = TABS.map((id) => {
      const n = NAV.find((x) => x[0] === id);
      const [label, icon] = n ? [n[1] === 'New Sale' ? 'Sale' : n[1], n[2]] : ['Menu', '<path d="M4 7h16M4 12h16M4 17h16"/>'];
      return `<button type="button" data-go="${id}" class="${screen === id ? 'on' : ''}">${svg(icon)}${label}</button>`;
    }).join('');
    $('#side-sub').textContent = set().clinic || 'Admin only';
  }

  function render() {
    const f = SCREENS[screen] || SCREENS.dashboard;
    const nav = NAV.find((n) => n[0] === screen);
    $('#title').textContent = TITLES[screen] || (screen === 'sell' && params.edit ? 'Edit Sale' : nav ? nav[1] : '');
    view.innerHTML = f();
    renderNav();
    if (AFTER[screen]) AFTER[screen]();
  }

  // ── Period filter ─────────────────────────────────────────────
  const PERIODS = [['today', 'Today'], ['month', 'This month'], ['lastMonth', 'Last month'], ['year', 'This year'], ['all', 'All time'], ['custom', 'Custom']];
  function range() {
    if (period.name === 'custom') return { from: period.from || null, to: period.to || null };
    return A.rangeFor(period.name, admin.today());
  }
  const periodBar = () => `<div class="seg">${PERIODS.map(([k, l]) => `<button type="button" data-period="${k}" class="${period.name === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    ${period.name === 'custom' ? `<input type="date" data-pdate="from" value="${esc(period.from)}" aria-label="From"><input type="date" data-pdate="to" value="${esc(period.to)}" aria-label="To">` : ''}`;
  const periodLabel = () => {
    const r = range();
    if (!r) return 'All time';
    return r.from === r.to ? fdate(r.from) : `${fdate(r.from) || '…'} – ${fdate(r.to) || '…'}`;
  };

  // ── Helpers for markup ────────────────────────────────────────
  const kpi = (label, value, sub, cls) => `<div class="kpi ${cls || ''}"><small>${esc(label)}</small><b title="${esc(value)}">${esc(value)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>`;
  const table = (head, rows, foot) => `<div class="tbl-wrap"><table><thead><tr>${head.map((h) => (h.startsWith('>') ? `<th class="r">${h.slice(1)}</th>` : `<th>${h}</th>`)).join('')}</tr></thead>
    <tbody>${rows.join('') || `<tr><td colspan="${head.length}" class="empty">Nothing here yet.</td></tr>`}</tbody>${foot ? `<tfoot><tr>${foot}</tr></tfoot>` : ''}</table></div>`;
  const activeMembers = () => S().team.filter((m) => !m.disabled);
  const memberOptions = (sel, blank) => (blank != null ? opt('', blank, sel) : '') + activeMembers().map((m) => opt(m.id, m.name + (m.designation ? ` · ${m.designation}` : ''), sel)).join('')
    + (sel && !activeMembers().some((m) => m.id === sel) && admin.member(sel) ? opt(sel, admin.member(sel).name + ' (disabled)', sel) : '');
  const typeBadge = (t) => `<span class="badge ${t === 'injection' ? 'info' : t === 'protein' ? 'ok' : 'warn'}">${A.SALE_TYPES[t]}</span>`;
  const splitText = (s) => s.splits.map((x) => `${esc(x.name)}${s.splits.length > 1 ? ` ${x.pct}%` : ''}`).join(' + ');

  function csv(rows) {
    return '﻿' + rows.map((r) => r.map((c) => {
      const v = String(c == null ? '' : c);
      return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(',')).join('\n');
  }
  function download(name, text, type) {
    // The Android app has no blob downloads; its bridge opens the system "Save as" screen.
    if (window.AndroidBridge && window.AndroidBridge.saveFile) { window.AndroidBridge.saveFile(name, (type || 'text/csv').split(';')[0], text); return; }
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
    const empty = !S().sales.length && !S().team.length;
    return `<div class="toolbar">${periodBar()}</div>
      ${empty ? `<div class="card"><h2>Welcome</h2><p>Start in three steps: <button class="link" data-go="team">add your team</button>, <button class="link" data-go="products">set product prices</button>, then <button class="link" data-go="purchases">add stock from an invoice</button>. Sales then update stock, incentives and revenue automatically.</p></div>` : ''}
      <div class="cards">
        <section class="card"><h2>Sales summary <span class="sp"></span><span class="badge">${esc(periodLabel())}</span></h2><div class="kpis">
          ${kpi('Total orders', num(s.orders))}
          ${kpi('Total revenue', inr(s.revenue))}
          ${kpi('Total expenses', inr(s.expenses))}
          ${kpi('Net profit', inr(s.profit), 'Revenue − Expenses', s.profit >= 0 ? 'good' : 'bad')}
          ${kpi('Injection sales', inr(s.injection), plural(s.injectionCount, 'order'))}
          ${kpi('Protein sales', inr(s.protein), plural(s.proteinCount, 'order'))}
          ${kpi('Diet support sales', inr(s.diet), plural(s.dietCount, 'plan'))}
        </div></section>
        <section class="card"><h2>Patient summary</h2><div class="kpis">
          ${kpi('Total patients', num(p.total), 'All time')}
          ${kpi('New patients', num(p.new))}
          ${kpi('Renewal patients', num(p.renewal))}
          ${kpi('Active patients', num(p.active), `Bought in last ${set().activeDays} days`)}
        </div>
        ${d.renewalsDue ? `<p><button class="btn sm" data-go="renewals">${d.renewalsDue} renewal reminder${d.renewalsDue > 1 ? 's' : ''} due →</button></p>` : ''}</section>
        <section class="card"><h2>Team summary</h2><div class="kpis">
          ${kpi('Team members', num(t.members), 'Active')}
          ${kpi('Total incentives', inr(t.incentives))}
          ${kpi('Total salary', inr(t.salary), 'Per month')}
          ${kpi('Top performer', t.top ? t.top.name : '—', t.top ? `${inr(t.top.totalSales)} sales` : '')}
        </div></section>
        <section class="card"><h2>Stock summary</h2><div class="kpis">
          ${kpi('Injection stock', num(st.injection), 'pens')}
          ${kpi('Protein stock', num(st.protein))}
          ${kpi('Low stock alerts', num(st.low.length), '', st.low.length ? 'bad' : 'good')}
          ${kpi('Needles', num(st.needles))}
          ${kpi('Swabs', num(st.swabs))}
          ${kpi('Syringes', num(st.syringes))}
        </div>
        ${st.low.length ? `<div class="alerts" style="margin-top:12px">${st.low.slice(0, 8).map((l) => `<div class="alert"><b>${esc(l.item.name)}</b><span class="badge bad">${num(l.stock)} left</span></div>`).join('')}${st.low.length > 8 ? `<button class="link" data-go="inventory">+${st.low.length - 8} more</button>` : ''}</div>` : ''}</section>
      </div>
      <section class="card" style="margin-top:16px"><h2>Revenue vs expenses by month</h2>
        ${months.length ? `<div class="legend"><span><i style="background:var(--accent)"></i>Revenue</span><span><i style="background:var(--warn)"></i>Expenses</span></div><div class="bars">
          ${months.map((m) => `<div class="bar-row"><span>${fdate(m.month)}</span><div class="bar-track">
            <div class="bar rev" style="width:${(m.revenue / max) * 100}%" title="Revenue ${inr(m.revenue)}"></div>
            <div class="bar exp" style="width:${(m.expenses / max) * 100}%" title="Expenses ${inr(m.expenses)}"></div></div>
            <b class="num" style="text-align:right;color:${m.profit >= 0 ? 'var(--ok)' : 'var(--danger)'}">${inr(m.profit)}</b></div>`).join('')}
        </div>` : '<p class="empty">Monthly figures appear after the first sale or expense.</p>'}
      </section>`;
  };

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
  let salesFilter = { type: '', q: '' };
  const filteredSales = () => S().sales.filter((s) => (!salesFilter.type || s.type === salesFilter.type)
    && (!range() || (!range().from || s.date >= range().from) && (!range().to || s.date <= range().to))
    && (!salesFilter.q || `${s.patientName} ${s.mobile} ${s.product} ${s.splits.map((x) => x.name).join(' ')}`.toLowerCase().includes(salesFilter.q.toLowerCase())))
    .sort((a, b) => (a.date === b.date ? b.created - a.created : a.date < b.date ? 1 : -1));
  SCREENS.sales = () => {
    const list = filteredSales();
    const rows = list.map((s) => `<tr><td>${fdate(s.date)}</td>
      <td>${esc(s.patientName)}<span class="sub">${esc(s.mobile)}</span></td>
      <td>${typeBadge(s.type)} ${s.patientType === 'renewal' ? '<span class="badge">Renewal</span>' : '<span class="badge ok">New</span>'}</td>
      <td>${esc(s.product)}${s.qty > 1 ? ` × ${s.qty}` : ''}</td>
      <td class="r">${inr(s.amount)}</td><td>${splitText(s)}</td><td class="r">${inr(s.incentive)}</td>
      <td class="acts"><button class="btn sm" data-act="edit-sale" data-id="${s.id}">Edit</button> <button class="btn sm danger" data-act="del-sale" data-id="${s.id}">Delete</button></td></tr>`);
    return `<div class="toolbar">${periodBar()}</div>
      <div class="toolbar"><select data-filter="type" aria-label="Sale type">${opt('', 'All sales', salesFilter.type)}${Object.entries(A.SALE_TYPES).map(([k, l]) => opt(k, l, salesFilter.type)).join('')}</select>
        <input class="grow" type="search" placeholder="Search patient, mobile, product, team" data-filter="q" value="${esc(salesFilter.q)}">
        <button class="btn" data-act="export-sales">Export CSV</button></div>
      <div class="card">${table(['Date', 'Patient', 'Type', 'Product', '>Amount', 'Reference', '>Incentive', ''], rows,
        `<td colspan="4">${list.length} sales</td><td class="r">${inr(list.reduce((a, s) => a + s.amount, 0))}</td><td></td><td class="r">${inr(list.reduce((a, s) => a + s.incentive, 0))}</td><td></td>`)}</div>`;
  };

  // Patients
  let patientQ = '';
  SCREENS.patients = () => {
    const activeFrom = A.isoDate(new Date(Date.now() - set().activeDays * 86400000));
    const rows = S().patients.map((p) => ({ p, sales: admin.patientSales(p.id) }))
      .filter(({ p }) => !patientQ || `${p.name} ${p.mobile}`.toLowerCase().includes(patientQ.toLowerCase()))
      .sort((a, b) => ((b.sales.at(-1) || {}).date || '').localeCompare((a.sales.at(-1) || {}).date || ''))
      .map(({ p, sales }) => {
        const last = sales[sales.length - 1];
        return `<tr><td><button class="link" data-act="patient" data-id="${p.id}">${esc(p.name)}</button><span class="sub">${esc(p.mobile)}</span></td>
          <td class="r">${sales.length}</td><td class="r">${inr(sales.reduce((a, s) => a + s.amount, 0))}</td>
          <td>${last ? fdate(last.date) : ''}<span class="sub">${last ? esc(last.product) : ''}</span></td>
          <td>${last && last.date >= activeFrom ? '<span class="badge ok">Active</span>' : '<span class="badge">Inactive</span>'}</td>
          <td class="acts"><button class="btn sm" data-act="sell-to" data-id="${p.id}">New sale</button></td></tr>`;
      });
    return `<div class="toolbar"><input class="grow" type="search" placeholder="Search name or mobile" data-filter="patient" value="${esc(patientQ)}"></div>
      <div class="card">${table(['Patient', '>Orders', '>Total spent', 'Last purchase', 'Status', ''], rows)}</div>`;
  };

  // Renewals
  let renewalFilter = 'due';
  SCREENS.renewals = () => {
    const [d1, d2] = set().renewalDays;
    const all = admin.renewals();
    const list = all.filter((r) => (renewalFilter === 'due' ? r.stage && !r.done
      : renewalFilter === 'd90' ? r.stage === d2 : renewalFilter === 'd60' ? r.stage === d1
        : renewalFilter === 'soon' ? !r.stage && r.dueIn <= 10 : true));
    const wa = (r) => {
      const ph = String(r.mobile || '').replace(/\D/g, '');
      if (!ph) return '';
      const full = ph.length === 10 ? '91' + ph : ph;
      const msg = encodeURIComponent(`Namaste ${r.name}, this is ${set().clinic}. Your last ${r.product} was on ${fdate(r.lastDate)}. Shall we arrange your renewal?`);
      return `<a class="btn sm" href="tel:${esc(r.mobile)}">Call</a> <a class="btn sm" href="https://wa.me/${full}?text=${msg}" target="_blank" rel="noopener">WhatsApp</a>`;
    };
    const rows = list.map((r) => `<tr class="${r.done ? 'off' : ''}"><td>${esc(r.name)}<span class="sub">${esc(r.mobile)}</span></td>
      <td>${esc(r.product)}</td><td>${fdate(r.lastDate)}<span class="sub">${r.days} days ago</span></td>
      <td>${r.stage ? `<span class="badge ${r.stage === d2 ? 'bad' : 'warn'}">${r.stage} Day</span>` : `<span class="badge">Due in ${r.dueIn} d</span>`}${r.done ? ' <span class="badge ok">Contacted</span>' : ''}</td>
      <td>${esc(r.ref)}</td>
      <td class="acts">${wa(r)} ${r.stage ? `<button class="btn sm" data-act="renewal-done" data-id="${r.saleId}" data-stage="${r.stage}" data-done="${r.done ? '' : '1'}">${r.done ? 'Undo' : 'Contacted'}</button>` : ''} <button class="btn sm primary" data-act="sell-to" data-id="${r.patientId}" data-renew="1">Renew</button></td></tr>`);
    const count = (f) => all.filter(f).length;
    const segs = [['due', `Due (${count((r) => r.stage && !r.done)})`], ['d60', `${d1} Day`], ['d90', `${d2} Day`], ['soon', 'Next 10 days'], ['all', 'All']];
    return `<div class="toolbar"><div class="seg">${segs.map(([k, l]) => `<button type="button" data-renewal="${k}" class="${renewalFilter === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      <div class="card"><p class="hint" style="margin-top:0">Reminders use each patient's last injection purchase: ${d1}-day and ${d2}-day alerts. A new sale clears them.</p>
      ${table(['Patient', 'Product', 'Last purchase', 'Reminder', 'Reference team', ''], rows)}</div>`;
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
    return `<div class="card"><h2>Injections<span class="sp"></span><button class="btn sm" data-act="add-product" data-kind="injection">+ Add injection</button></h2>${table(head, itemRows('injection'))}</div>
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
  SCREENS.inventory = () => {
    const rep = admin.stockReport(range());
    const cats = S().categories.map((c) => c.name);
    rep.forEach((r) => { if (!cats.includes(r.category)) cats.push(r.category); });
    const sections = cats.map((c) => {
      const rows = rep.filter((r) => r.category === c);
      if (!rows.length) return `<tr><td colspan="8"><b>${esc(c)}</b> <span class="hint">— no items</span> <button class="link" data-act="add-item" data-cat="${esc(c)}">+ Add item</button></td></tr>`;
      return `<tr><td colspan="8" style="background:var(--surface-2)"><b>${esc(c)}</b></td></tr>` + rows.map((r) => `<tr class="${r.disabled ? 'off' : ''}"><td>${esc(r.name)}</td>
        <td class="r">${num(r.opening)}</td><td class="r">${num(r.purchased)}</td><td class="r">${num(r.sold)}</td><td class="r">${r.adjusted ? (r.adjusted > 0 ? '+' : '') + num(r.adjusted) : ''}</td>
        <td class="r"><b>${num(r.current)}</b> <span class="hint">${esc(r.unit)}</span></td>
        <td>${r.disabled ? '<span class="badge">Disabled</span>' : r.current <= r.lowAt ? '<span class="badge bad">Low</span>' : '<span class="badge ok">OK</span>'}</td>
        <td class="acts"><button class="btn sm" data-act="adjust" data-id="${r.itemId}">± Stock</button> <button class="btn sm" data-act="edit-item" data-id="${r.itemId}">Edit</button></td></tr>`).join('');
    });
    return `<div class="toolbar">${periodBar()}</div>
      <div class="toolbar"><button class="btn primary" data-act="add-item">+ Add item</button><button class="btn" data-act="add-category">+ Add category</button>
        <button class="btn" data-go="purchase-new">Add stock from invoice</button><span class="grow"></span><button class="btn" data-act="export-stock">Export CSV</button></div>
      <div class="card"><div class="tbl-wrap"><table><thead><tr><th>Item</th><th class="r">Opening</th><th class="r">Purchased</th><th class="r">Sold</th><th class="r">Adjusted</th><th class="r">Available</th><th>Status</th><th></th></tr></thead>
      <tbody>${sections.join('')}</tbody></table></div>
      <p class="hint">Opening = stock at the start of ${esc(periodLabel())}. Sales take stock out and invoices add it automatically; use ± Stock for counts, damage or samples.</p></div>`;
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
  let draft = null; // purchase being entered or reviewed after a scan
  let scanning = false;
  const newDraft = () => ({ vendor: '', invoiceNo: '', date: admin.today(), lines: [{ itemId: '', qty: 1, rate: '', gst: 12, batch: '', expiry: '' }], scanned: false, warnings: [] });
  SCREENS.purchases = () => {
    const list = [...S().purchases].sort((a, b) => (a.date < b.date ? 1 : -1)).filter((p) => !range() || ((!range().from || p.date >= range().from) && (!range().to || p.date <= range().to)));
    const rows = list.map((p) => `<tr><td>${fdate(p.date)}</td><td>${esc(p.vendor)}<span class="sub">${esc(p.invoiceNo)}</span></td>
      <td>${p.lines.map((l) => `${esc(l.name)} <b>+${num(l.qty)}</b>`).join('<br>')}</td><td class="r">${inr(p.total)}</td>
      <td>${p.scanned ? '<span class="badge info">AI scan</span>' : '<span class="badge">Manual</span>'}</td>
      <td class="acts"><button class="btn sm" data-act="edit-purchase" data-id="${p.id}">Edit</button> <button class="btn sm danger" data-act="del-purchase" data-id="${p.id}">Delete</button></td></tr>`);
    return `<div class="toolbar"><button class="btn primary" data-act="new-purchase" data-scan="1">Scan invoice (AI)</button><button class="btn" data-act="new-purchase">Manual entry</button></div>
      <div class="toolbar">${periodBar()}</div>
      <div class="card">${table(['Date', 'Vendor / invoice', 'Stock added', '>Total', 'Entry', ''], rows,
        `<td colspan="3">${list.length} invoices</td><td class="r">${inr(list.reduce((a, p) => a + p.total, 0))}</td><td colspan="2"></td>`)}</div>`;
  };
  SCREENS['purchase-new'] = () => {
    if (!draft) draft = newDraft();
    const items = S().items.filter((i) => !i.disabled || draft.lines.some((l) => l.itemId === i.id));
    const noKey = !set().apiKey;
    const lineHtml = draft.lines.map((l, i) => `<div class="line ${l.invoiceName && !l.itemId ? 'nomatch' : ''}">
      ${l.invoiceName ? `<div class="inv">On invoice: <b>${esc(l.invoiceName)}</b>${l.itemId ? '' : ' — <span style="color:var(--warn)">choose the matching product</span>'}</div>` : ''}
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
    return `<div class="card">
      <h2>AI invoice scanner</h2>
      ${noKey ? `<p class="alert">Add your Claude API key in <button class="link" data-go="settings">Settings</button> to scan invoices automatically. You can still enter invoices by hand below.</p>` : ''}
      <label class="drop" id="drop" ${noKey ? 'hidden' : ''}>
        ${scanning ? '<div class="spinner"></div><b>Reading invoice…</b><span>Vendor, invoice no., date, products, qty, batch, expiry, rate and GST</span>'
          : `${svg('<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 12h8"/>')}<b>Upload or photograph an invoice</b><span>JPG, PNG or PDF. ${set().autoSaveScan ? 'When every line matches a product, stock is added straight away.' : 'You review the lines before stock is added.'}</span>`}
        <input type="file" id="scan-file" accept="image/*,application/pdf" hidden ${scanning ? 'disabled' : ''}>
      </label>
      ${draft.warnings.length ? `<div class="alerts" style="margin-top:12px">${draft.warnings.map((w) => `<div class="alert"><b>${esc(w)}</b></div>`).join('')}</div>` : ''}
    </div>
    <form class="card form-card" id="purchase-form" autocomplete="off">
      <h2>${draft.id ? 'Edit purchase' : draft.scanned ? 'Check the scanned invoice' : 'Invoice details'}</h2>
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
        if (t.dataset.k === 'itemId') t.closest('.line').classList.toggle('nomatch', !t.value && !!draft.lines[t.dataset.line].invoiceName);
      } else if (t.dataset.k) draft[t.dataset.k] = t.value;
      purchaseTotal();
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      try { finishPurchase(); } catch (err) { $('#purchase-err').textContent = err.message; }
    });
    const drop = $('#drop');
    const file = $('#scan-file');
    if (file) file.addEventListener('change', () => { if (file.files[0]) scan(file.files[0]); });
    if (drop) {
      drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
      drop.addEventListener('dragleave', () => drop.classList.remove('over'));
      drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); if (e.dataTransfer.files[0]) scan(e.dataTransfer.files[0]); });
    }
    purchaseTotal();
    if (params.scan && drop && !drop.hidden && !scanning) { params.scan = false; file.click(); }
  };
  function finishPurchase() {
    const p = admin.savePurchase({ ...draft, lines: draft.lines.map((l) => ({ ...l })) });
    toast(`Stock added: ${p.lines.map((l) => `${l.name} +${l.qty}`).join(', ')}`);
    draft = null;
    go('purchases');
  }
  async function scan(file) {
    scanning = true; render();
    try {
      const products = S().items.filter((i) => !i.disabled).map((i) => i.name);
      const r = await INV.scanInvoice(file, { apiKey: set().apiKey, model: set().aiModel, products });
      const byName = (n) => S().items.find((i) => !i.disabled && i.name === n);
      const lines = (r.lines || []).map((l) => {
        const it = byName(l.matched_product) || admin.matchItem(l.product_name);
        return {
          itemId: it ? it.id : '', invoiceName: l.product_name, qty: l.quantity || 0, batch: l.batch || '', expiry: l.expiry || '',
          rate: l.purchase_rate || '', gst: l.gst_percent || 0,
        };
      });
      const date = /^\d{4}-\d{2}-\d{2}$/.test(r.invoice_date) ? r.invoice_date : admin.today();
      draft = { vendor: r.vendor_name || '', invoiceNo: r.invoice_number || '', date, lines: lines.length ? lines : newDraft().lines, scanned: true, warnings: [] };
      const unmatched = lines.filter((l) => !l.itemId);
      if (!lines.length) draft.warnings.push('No product lines were found. Try a sharper, well-lit photo, or enter the lines below.');
      if (unmatched.length) draft.warnings.push(`${unmatched.length} line(s) did not match a product: choose it below, or add the product under Inventory first.`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(r.invoice_date)) draft.warnings.push('Invoice date not found: today is used. Check it.');
      const dup = admin.findDuplicatePurchase(draft);
      if (dup) draft.warnings.push(`This invoice (${dup.invoiceNo}) was already saved on ${fdate(dup.date)}. Saving again would add the stock twice.`);
      scanning = false;
      if (set().autoSaveScan && lines.length && !unmatched.length && !dup && lines.every((l) => Number(l.qty) > 0)) { finishPurchase(); return; }
      render();
      toast('Invoice read. Check the lines and tap “Add to stock”.');
    } catch (err) {
      scanning = false; render();
      toast(err.message, true);
    }
  }

  // Team
  SCREENS.team = () => {
    const rows = S().team.map((m) => `<tr class="${m.disabled ? 'off' : ''}"><td>${esc(m.name)}<span class="sub">${esc(m.designation || '')}</span></td>
      <td>${m.mobile ? `<a href="tel:${esc(m.mobile)}">${esc(m.mobile)}</a>` : ''}</td><td class="r">${inr(m.salary)}</td>
      <td>${m.incentiveOn === false ? '<span class="badge">Off</span>' : '<span class="badge ok">On</span>'}</td>
      <td>${fdate(m.joiningDate)}</td><td>${m.disabled ? '<span class="badge">Disabled</span>' : '<span class="badge ok">Active</span>'}</td>
      <td class="acts"><button class="btn sm" data-act="edit-member" data-id="${m.id}">Edit</button> <button class="btn sm" data-act="toggle-member" data-id="${m.id}">${m.disabled ? 'Enable' : 'Disable'}</button> <button class="btn sm danger" data-act="del-member" data-id="${m.id}">Delete</button></td></tr>`);
    return `<div class="toolbar"><button class="btn primary" data-act="add-member">+ Add team member</button></div>
      <div class="card">${table(['Name', 'Mobile', '>Salary', 'Incentive', 'Joining date', 'Status', ''], rows)}
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
      <div class="toolbar">${periodBar()}<select data-filter="ledger" aria-label="Team member">${opt('', 'All team', ledgerMember)}${S().team.map((m) => opt(m.id, m.name, ledgerMember)).join('')}</select></div>
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
      <span class="grow"></span><button class="btn" data-act="export-salary" data-month="${month}">Export CSV</button>
      <button class="btn primary" data-act="post-salary" data-month="${month}">${posted ? 'Re-book as expenses' : 'Book as expenses'}</button></div>
      <div class="card">${posted ? '<p><span class="badge ok">Booked</span> Salary and incentive for this month are in Expenses.</p>' : ''}
      ${table(['Employee', '>Salary', '>Incentive', '>Salary + Incentive'], rows.map((r) => `<tr><td>${esc(r.name)}<span class="sub">${esc(r.designation || '')}</span></td><td class="r">${inr(r.salary)}</td><td class="r">${inr(r.incentive)}</td><td class="r"><b>${inr(r.total)}</b></td></tr>`),
        `<td>Total</td><td class="r">${inr(t('salary'))}</td><td class="r">${inr(t('incentive'))}</td><td class="r">${inr(t('total'))}</td>`)}
      <p class="hint">Incentive = the member's share of every sale in ${fdate(month)}. “Book as expenses” adds Salary and Incentive entries, so the dashboard profit includes them.</p></div>`;
  };

  // Expenses
  let expenseCat = '';
  SCREENS.expenses = () => {
    const r = range();
    const list = S().expenses.filter((e) => (!r || ((!r.from || e.date >= r.from) && (!r.to || e.date <= r.to))) && (!expenseCat || e.category === expenseCat))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    const fin = admin.financialReport(r);
    return `<div class="toolbar">${periodBar()}</div>
      <div class="card"><div class="kpis">${kpi('Revenue', inr(fin.revenue))}${kpi('Expenses', inr(fin.expenses))}${kpi('Profit', inr(fin.profit), 'Revenue − Expenses', fin.profit >= 0 ? 'good' : 'bad')}
        ${Object.entries(fin.byCategory).filter(([, v]) => v).map(([k, v]) => kpi(k, inr(v))).join('')}</div></div>
      <div class="toolbar"><button class="btn primary" data-act="add-expense">+ Add expense</button>
        <select data-filter="expense" aria-label="Category">${opt('', 'All categories', expenseCat)}${A.EXPENSE_CATEGORIES.map((c) => opt(c, c, expenseCat)).join('')}</select></div>
      <div class="card">${table(['Date', 'Category', 'Note', '>Amount', ''], list.map((e) => `<tr><td>${fdate(e.date)}</td><td>${esc(e.category)} ${e.auto ? '<span class="badge info">Auto</span>' : ''}</td><td>${esc(e.note)}</td><td class="r">${inr(e.amount)}</td>
        <td class="acts">${e.auto ? '' : `<button class="btn sm" data-act="edit-expense" data-id="${e.id}">Edit</button> `}<button class="btn sm danger" data-act="del-expense" data-id="${e.id}">Delete</button></td></tr>`),
        `<td colspan="3">Total</td><td class="r">${inr(list.reduce((a, e) => a + e.amount, 0))}</td><td></td>`)}</div>`;
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

  // Reports
  let reportTab = 'team';
  function reportRows() {
    const r = range();
    if (reportTab === 'team') {
      const rows = admin.teamReport(r);
      return [['Team member', 'Total Sales', 'Orders', 'New Patients', 'Renewals', 'Injection Sales', 'Protein Sales', 'Diet Support Sales', 'Incentive'],
        ...rows.map((x) => [x.name, x.totalSales, x.orders, x.newPatients, x.renewals, x.injectionSales, x.proteinSales, x.dietSales, x.incentive])];
    }
    if (reportTab === 'financial') {
      const f = admin.financialReport(r);
      return [['Item', 'Amount'], ['Injection revenue', f.revenueByType.injection], ['Protein revenue', f.revenueByType.protein], ['Diet support revenue', f.revenueByType.diet],
        ['Total revenue', f.revenue], ...Object.entries(f.byCategory).map(([k, v]) => [`Expense: ${k}`, v]), ['Total expenses', f.expenses], ['Profit', f.profit]];
    }
    return [['Category', 'Item', 'Opening', 'Purchased', 'Sold', 'Adjusted', 'Current Stock'],
      ...admin.stockReport(r).map((x) => [x.category, x.name, x.opening, x.purchased, x.sold, x.adjusted, x.current])];
  }
  SCREENS.reports = () => {
    const r = range();
    let body;
    if (reportTab === 'team') {
      const rows = admin.teamReport(r);
      body = table(['Team member', '>Total sales', '>New patients', '>Renewals', '>Injection', '>Protein', '>Diet support', '>Incentive'],
        rows.map((x) => `<tr class="${x.disabled ? 'off' : ''}"><td>${esc(x.name)}<span class="sub">${x.orders} orders</span></td><td class="r"><b>${inr(x.totalSales)}</b></td><td class="r">${x.newPatients}</td><td class="r">${x.renewals}</td>
          <td class="r">${inr(x.injectionSales)}</td><td class="r">${inr(x.proteinSales)}</td><td class="r">${inr(x.dietSales)}</td><td class="r">${inr(x.incentive)}</td></tr>`));
      body += '<p class="hint">Shared sales count for each reference by their share %.</p>';
    } else if (reportTab === 'financial') {
      const f = admin.financialReport(r);
      body = `<div class="kpis">${kpi('Revenue', inr(f.revenue))}${kpi('Expenses', inr(f.expenses))}${kpi('Profit', inr(f.profit), '', f.profit >= 0 ? 'good' : 'bad')}</div>
        <div class="cards" style="margin-top:14px"><div>${table(['Revenue', '>Amount'], Object.entries(f.revenueByType).map(([k, v]) => `<tr><td>${A.SALE_TYPES[k]}</td><td class="r">${inr(v)}</td></tr>`), `<td>Total</td><td class="r">${inr(f.revenue)}</td>`)}</div>
        <div>${table(['Expense', '>Amount'], Object.entries(f.byCategory).map(([k, v]) => `<tr><td>${esc(k)}</td><td class="r">${inr(v)}</td></tr>`), `<td>Total</td><td class="r">${inr(f.expenses)}</td>`)}</div></div>
        <h2 style="margin:18px 0 8px;font-size:16px">By month</h2>${table(['Month', '>Revenue', '>Expenses', '>Profit'], f.monthly.map((m) => `<tr><td>${fdate(m.month)}</td><td class="r">${inr(m.revenue)}</td><td class="r">${inr(m.expenses)}</td><td class="r">${inr(m.profit)}</td></tr>`))}`;
    } else {
      body = table(['Item', '>Opening', '>Purchased', '>Sold', '>Current stock'], admin.stockReport(r).filter((x) => !x.disabled || x.purchased || x.sold)
        .map((x) => `<tr><td>${esc(x.name)}<span class="sub">${esc(x.category)}</span></td><td class="r">${num(x.opening)}</td><td class="r">${num(x.purchased)}</td><td class="r">${num(x.sold)}</td><td class="r"><b>${num(x.current)}</b></td></tr>`));
    }
    return `<div class="toolbar"><div class="seg">${[['team', 'Team wise'], ['financial', 'Financial'], ['stock', 'Stock']].map(([k, l]) => `<button type="button" data-report="${k}" class="${reportTab === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      <span class="grow"></span><button class="btn" data-act="export-report">Export CSV</button></div>
      <div class="toolbar">${periodBar()}</div><div class="card"><h2>${esc(periodLabel())}</h2>${body}</div>`;
  };

  // Settings
  SCREENS.settings = () => {
    const st = set();
    const last = Number(storage.getItem(SYNC_KEY)) || 0;
    return `<form class="card form-card" id="settings-form" autocomplete="off">
      <h2>Clinic</h2>
      <div class="grid">
        <label class="f">Clinic name<input name="clinic" value="${esc(st.clinic)}"></label>
        <label class="f">1st renewal reminder (days)<input type="number" min="1" name="r1" value="${esc(st.renewalDays[0])}"></label>
        <label class="f">2nd renewal reminder (days)<input type="number" min="1" name="r2" value="${esc(st.renewalDays[1])}"></label>
        <label class="f">Active patient = bought within (days)<input type="number" min="1" name="activeDays" value="${esc(st.activeDays)}"></label>
      </div>
      <label class="check"><input type="checkbox" name="purchaseExpense" ${st.purchaseExpense ? 'checked' : ''}> Book every purchase invoice as an expense (Injection / Protein Purchase)</label>

      <h2 style="margin-top:8px">AI invoice scanner</h2>
      <div class="grid two">
        <label class="f">Claude API key<input type="password" name="apiKey" value="${esc(st.apiKey)}" placeholder="sk-ant-…"><span class="hint">From console.anthropic.com. Stored only on this device, never in backups.</span></label>
        <label class="f">Model<select name="aiModel">${opt('claude-opus-5-5', 'Claude Opus 5.5 (most accurate)', st.aiModel)}${opt('claude-sonnet-5-5', 'Claude Sonnet 5.5 (faster, lower cost)', st.aiModel)}</select></label>
      </div>
      <label class="check"><input type="checkbox" name="autoSaveScan" ${st.autoSaveScan ? 'checked' : ''}> Add stock automatically when every invoice line matches a product (no review)</label>

      <h2 style="margin-top:8px">Google Sheet (data storage)</h2>
      <p class="hint" style="margin:0">All data is stored in <a href="${SHEET_LINK}" target="_blank" rel="noopener">the Hindivine Google Sheet</a>, so every admin phone and computer shares it. The sheet also shows 12 readable tabs: ${A.SHEETS.join(', ')}. Set-up once: open the sheet → Extensions → Apps Script → paste <a href="google-apps-script/Code.gs" target="_blank" rel="noopener">Code.gs</a> → run <b>setup</b> → Deploy → Web app (Execute as: Me, Who has access: Anyone) → paste the URL and the secret here.</p>
      <div class="grid two">
        <label class="f">Web app URL<input name="sheetsUrl" value="${esc(st.sheetsUrl)}" placeholder="https://script.google.com/macros/s/…/exec"></label>
        <label class="f">Secret<input type="password" name="sheetsSecret" value="${esc(st.sheetsSecret)}"><span class="hint">Shown in the Apps Script log after running setup.</span></label>
      </div>
      <div class="actions" style="justify-content:flex-start"><button type="button" class="btn" data-act="sync">Load latest now</button><span class="hint" id="last-sync">${connected() ? (last ? `Last saved ${new Date(last).toLocaleString('en-IN')}` : 'Connected, not saved yet') : 'Not connected: data is only on this device'}</span></div>
      <div class="actions"><button class="btn primary" type="submit">Save settings</button></div>
    </form>
    <div class="card"><h2>Security</h2><p>The app opens with your admin PIN and locks after 15 minutes without use.</p>
      <button class="btn" data-act="change-pin">Change PIN</button> <button class="btn" data-act="lock">Lock now</button></div>
    <div class="card"><h2>Backup</h2><p>${connected() ? 'Data is saved to the Google Sheet and kept on this device for offline use.' : 'All data is stored on this device.'} Export a backup file now and then as an extra copy.</p>
      <div class="actions" style="justify-content:flex-start"><button class="btn" data-act="export-backup">Export backup</button>
      <label class="btn">Import backup<input type="file" id="import-file" accept="application/json,.json" hidden></label>
      <button class="btn danger" data-act="reset">Erase all data</button></div></div>`;
  };
  AFTER.settings = () => {
    $('#settings-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const r1 = Number(f.r1.value) || 60; const r2 = Number(f.r2.value) || 90;
      admin.updateSettings({
        clinic: f.clinic.value.trim(), renewalDays: [Math.min(r1, r2), Math.max(r1, r2)], activeDays: Number(f.activeDays.value) || 90,
        purchaseExpense: f.purchaseExpense.checked, apiKey: f.apiKey.value.trim(), aiModel: f.aiModel.value, autoSaveScan: f.autoSaveScan.checked,
        sheetsUrl: f.sheetsUrl.value.trim(), sheetsSecret: f.sheetsSecret.value.trim(),
      });
      const wasConnected = connected() && storage.getItem(SYNC_KEY);
      toast('Settings saved');
      render();
      if (connected() && !wasConnected) pull(true);
    });
    $('#import-file').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        if (!(await confirmBox('Import backup', 'This replaces all data on this device with the backup. Continue?', 'Import'))) return;
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
  function syncState(text) { const el = $('#sync-state'); if (el) { el.hidden = !text; el.textContent = text || ''; } }
  function showSheetState() {
    if (!connected()) return syncState('');
    syncState(isDirty() ? 'Not saved to Google Sheet yet' : 'Saved to Google Sheet ✓');
  }
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
    const editing = modal.open || screen === 'sell' || screen === 'purchase-new';
    if (!editing && !$('#shell').hidden) render();
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
      const ls = $('#last-sync'); if (ls) ls.textContent = `Last saved ${new Date().toLocaleString('en-IN')}`;
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
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && $('#lock').hidden && Date.now() - lastPull > 20000) pull();
  });
  window.addEventListener('online', () => { if (isDirty()) push().catch(() => {}); });

  // ── Actions ───────────────────────────────────────────────────
  const ACTIONS = {
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
      go('sell', { prefill: { type: 'injection', patientName: p.name, mobile: p.mobile, patientType: 'renewal', itemId: last && d.renew ? last.itemId : '', refId: last ? last.refId : '', sharedId: last ? last.sharedId : '', sharePct: last ? last.sharePct : 50, dietitianId: last ? last.dietitianId : '' } });
    },
    patient: (d) => {
      const p = S().patients.find((x) => x.id === d.id);
      const sales = admin.patientSales(p.id).reverse();
      openForm({
        title: p.name, submitLabel: false,
        html: `<p style="margin:0">${esc(p.mobile || 'No mobile')} · ${sales.length} orders · ${inr(sales.reduce((a, s) => a + s.amount, 0))}</p>
          ${table(['Date', 'Product', '>Amount', 'Reference'], sales.map((s) => `<tr><td>${fdate(s.date)}</td><td>${typeBadge(s.type)} ${esc(s.product)}</td><td class="r">${inr(s.amount)}</td><td>${splitText(s)}</td></tr>`))}`,
      });
    },
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
    'new-purchase': (d) => { draft = newDraft(); go('purchase-new', { scan: !!d.scan }); },
    'edit-purchase': (d) => {
      const p = S().purchases.find((x) => x.id === d.id);
      draft = { ...JSON.parse(JSON.stringify(p)), warnings: [] };
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
    'export-salary': (d) => download(`salary-${d.month}.csv`, csv([['Employee', 'Designation', 'Salary', 'Incentive', 'Salary + Incentive'], ...admin.salarySheet(d.month).map((r) => [r.name, r.designation, r.salary, r.incentive, r.total])])),
    'export-sales': () => download('sales.csv', csv([['Date', 'Type', 'Patient', 'Mobile', 'New/Renewal', 'Product', 'Qty', 'Amount', 'Reference', 'Incentive', 'Notes'],
      ...filteredSales().map((s) => [s.date, A.SALE_TYPES[s.type], s.patientName, s.mobile, s.patientType, s.product, s.qty, s.amount, s.splits.map((x) => `${x.name} ${x.pct}%`).join(' / '), s.incentive, s.notes])])),
    'export-stock': () => { reportTab = 'stock'; download('stock.csv', csv(reportRows())); },
    'export-report': () => download(`${reportTab}-report.csv`, csv(reportRows())),
    'export-backup': () => download(`hindivine-admin-backup-${admin.today()}.json`, admin.exportBackup(), 'application/json'),
    reset: () => openForm({
      title: 'Erase all data', danger: true, submitLabel: 'Erase everything',
      html: '<p style="margin:0">This deletes every sale, patient, team member, purchase and expense on this device. Export a backup first.</p>',
      fields: [{ name: 'confirm', label: 'Type ERASE to confirm', required: true }],
      onSubmit: (v) => { if (v.confirm !== 'ERASE') throw new Error('Type ERASE in capitals'); const keep = { pinHash: set().pinHash, pinSalt: set().pinSalt }; admin.resetAll(); admin.updateSettings(keep); return 'All data erased'; },
    }),
    sync: async () => { if (!connected()) { toast('Add the web app URL and secret, then Save settings.', true); return; } await pull(true); },
    lock: () => lock(),
    'change-pin': () => openForm({
      title: 'Change PIN',
      fields: [{ name: 'old', label: 'Current PIN', type: 'password', required: true, attrs: 'inputmode="numeric"' },
        { name: 'pin', label: 'New PIN (4–8 digits)', type: 'password', required: true, attrs: 'inputmode="numeric"' }],
      onSubmit: async (v) => {
        if ((await hashPin(v.old, set().pinSalt)) !== set().pinHash) throw new Error('Current PIN is wrong');
        if (!/^\d{4,8}$/.test(v.pin)) throw new Error('New PIN must be 4–8 digits');
        await savePin(v.pin);
        return 'PIN changed';
      },
    }),
  };

  document.addEventListener('click', (e) => {
    const goEl = e.target.closest('[data-go]');
    if (goEl) { e.preventDefault(); if (goEl.dataset.go === 'purchase-new' && !draft) draft = newDraft(); go(goEl.dataset.go); return; }
    const act = e.target.closest('[data-act]');
    if (act && ACTIONS[act.dataset.act]) { e.preventDefault(); ACTIONS[act.dataset.act](act.dataset); return; }
    const p = e.target.closest('[data-period]');
    if (p) { period.name = p.dataset.period; render(); return; }
    const st = e.target.closest('[data-saletype]');
    if (st) { saleType = st.dataset.saletype; params = {}; render(); return; }
    const rn = e.target.closest('[data-renewal]');
    if (rn) { renewalFilter = rn.dataset.renewal; render(); return; }
    const rp = e.target.closest('[data-report]');
    if (rp) { reportTab = rp.dataset.report; render(); }
  });
  view.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.pdate) { period[t.dataset.pdate] = t.value; render(); return; }
    const f = t.dataset.filter;
    if (!f) return;
    if (f === 'type') salesFilter.type = t.value;
    else if (f === 'ledger') ledgerMember = t.value;
    else if (f === 'salary') salaryMonth = t.value;
    else if (f === 'expense') expenseCat = t.value;
    else return;
    render();
  });
  view.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.filter !== 'q' && t.dataset.filter !== 'patient') return;
    if (t.dataset.filter === 'q') salesFilter.q = t.value; else patientQ = t.value;
    const pos = t.selectionStart;
    render();
    const again = $(`[data-filter="${t.dataset.filter}"]`);
    again.focus(); again.setSelectionRange(pos, pos);
  });
  $('#menu-btn').addEventListener('click', () => openMenu(true));
  $('#scrim').addEventListener('click', () => openMenu(false));

  // ── PIN lock ──────────────────────────────────────────────────
  async function hashPin(pin, salt) {
    const text = `${salt}:${pin}`;
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 5381; for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
    return 'djb' + h.toString(16);
  }
  async function savePin(pin) {
    const salt = Math.random().toString(36).slice(2, 12);
    admin.updateSettings({ pinSalt: salt, pinHash: await hashPin(pin, salt) });
  }
  function lock() {
    try { sessionStorage.removeItem(UNLOCK_KEY); } catch (_) { /* ignore */ }
    modal.open && modal.close();
    showLock();
  }
  function showLock() {
    const setup = !set().pinHash;
    $('#shell').hidden = true; $('#lock').hidden = false;
    $('#lock-pin').value = ''; $('#lock-pin2').value = ''; $('#lock-err').textContent = '';
    $('#lock-pin2').hidden = !setup;
    $('#lock-msg').textContent = setup ? 'Create an admin PIN (4–8 digits). Only admins with this PIN can open the app.' : 'Enter your admin PIN';
    $('#lock-btn').textContent = setup ? 'Create PIN' : 'Unlock';
    setTimeout(() => $('#lock-pin').focus(), 50);
  }
  function unlock() {
    try { sessionStorage.setItem(UNLOCK_KEY, '1'); } catch (_) { /* ignore */ }
    $('#lock').hidden = true; $('#shell').hidden = false;
    render();
    showSheetState();
    pull();
  }
  $('#lock-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pin = $('#lock-pin').value.trim();
    if (!set().pinHash) {
      if (!/^\d{4,8}$/.test(pin)) { $('#lock-err').textContent = 'Use 4 to 8 digits'; return; }
      if (pin !== $('#lock-pin2').value.trim()) { $('#lock-err').textContent = 'The two PINs do not match'; return; }
      await savePin(pin);
      unlock();
      return;
    }
    if ((await hashPin(pin, set().pinSalt)) === set().pinHash) unlock();
    else { $('#lock-err').textContent = 'Wrong PIN'; $('#lock-pin').value = ''; }
  });
  let idle = Date.now();
  ['click', 'keydown', 'touchstart'].forEach((ev) => document.addEventListener(ev, () => { idle = Date.now(); }, { passive: true }));
  setInterval(() => { if ($('#lock').hidden && set().pinHash && Date.now() - idle > IDLE_LOCK_MS) lock(); }, 30000);

  let unlocked = false;
  try { unlocked = sessionStorage.getItem(UNLOCK_KEY) === '1'; } catch (_) { unlocked = false; }
  if (unlocked && set().pinHash) unlock(); else showLock();
})();
