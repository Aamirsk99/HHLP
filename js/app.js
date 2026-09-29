/* DOM wiring for Hindivine Diet. */
(function () {
  const P = window.Planner;
  const DB = window.FOODDB;
  const BRAND = {
    company: 'Hindivine Healthcare Private Limited',
    website: 'www.hindivine.com',
    logo: 'img/logo.jpg',
  };
  const PATIENT_KEY = 'hindivine.patient.v2';
  const DIETITIAN_KEY = 'hindivine.dietitian';
  const DIETITIAN_FIELDS = ['dietitian', 'qualification', 'dietitianPhone'];
  const ALLERGIES = { gluten: 'Gluten', dairy: 'Dairy / lactose', nuts: 'Nuts & peanuts', soy: 'Soy', egg: 'Egg', fish: 'Fish / seafood' };
  const KCAL_PRESETS = [1000, 1200, 1400, 1500, 1600, 1800, 2000, 2200, 2500];
  const PROTEIN_PRESETS = [40, 50, 60, 70, 80, 100, 120, 150];

  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const form = $('#profile-form');
  const result = $('#result');
  const sheet = $('#print-sheet');
  const errorEl = $('#form-error');
  const editor = $('#editor');

  let profile = null;
  let plan = null;
  let activeDay = 0;
  let edit = null; // { di, mi, meal }

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (n) => Number(n).toLocaleString('en-IN');

  const ICON = {
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M14 6l4 4"/></svg>',
    swap: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h13l-3-3M20 17H7l3 3"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    unlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 14h6M9 17h4"/></svg>',
    csv: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M4 15h16M10 4v16"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/></svg>',
    minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 11v6M14 11v6M7 7l1 13h8l1-13M9 7V4h6v3"/></svg>',
    anon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6M3 3l18 18"/></svg>',
  };

  // ── Builder controls ─────────────────────────────────────────────
  function options(entries, selected) {
    return Object.entries(entries)
      .map(([k, v]) => `<option value="${k}"${k === selected ? ' selected' : ''}>${esc(typeof v === 'string' ? v : v.label)}</option>`)
      .join('');
  }
  $('#plan').innerHTML = options(P.PLANS, 'weight_loss');
  $('#activity').innerHTML = options(P.ACTIVITY, 'light');
  $('#travel').innerHTML = options(P.TRAVEL, 'mixed');
  $('#diet-seg').innerHTML = Object.entries(P.DIETS).map(([k, v]) => `<button type="button" data-value="${k}" aria-pressed="${k === 'veg'}">${esc(v)}</button>`).join('');

  const chip = (value, label, pressed) => `<button type="button" class="chip" data-value="${esc(value)}" aria-pressed="${!!pressed}">${esc(label)}</button>`;
  $('#kcal-chips').innerHTML = chip('', 'Auto', true) + KCAL_PRESETS.map((k) => chip(k, `${num(k)}`)).join('');
  $('#protein-chips').innerHTML = chip('', 'Auto', true) + PROTEIN_PRESETS.map((g) => chip(g, `${g} g`)).join('');
  $('#condition-chips').innerHTML = Object.entries(P.CONDITIONS).map(([k, v]) => chip(k, v)).join('');
  $('#region-chips').innerHTML = Object.entries(P.REGIONS).map(([k, v]) => chip(k, v.label)).join('');
  $('#exclude-chips').innerHTML = Object.entries(P.EXCLUDES).map(([k, v]) => chip(k, `No ${v.label.toLowerCase()}`)).join('');
  $('#allergy-chips').innerHTML = Object.entries(ALLERGIES).map(([k, v]) => chip(k, v)).join('');
  $('#times').innerHTML = Object.entries(P.SLOTS).map(([k, s]) => `<label>${esc(s.label)}<input type="time" name="time_${k}" value="${s.time}"></label>`).join('');

  function setSeg(name, value) {
    const seg = $(`.seg[data-name="${name}"]`);
    if (!seg) return;
    $$('button', seg).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === value)));
    form.elements[name].value = value;
    if (name === 'chartType') $$('.travel-only').forEach((el) => { el.hidden = value !== 'travel'; });
  }
  $$('.seg').forEach((seg) => seg.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) setSeg(seg.dataset.name, b.dataset.value);
  }));

  function setSingleChip(name, value) {
    const box = $(`[data-single="${name}"]`);
    $$('.chip', box).forEach((c) => c.setAttribute('aria-pressed', String(String(c.dataset.value) === String(value || ''))));
  }
  $$('[data-single]').forEach((box) => {
    const input = form.elements[box.dataset.single];
    box.addEventListener('click', (e) => {
      const c = e.target.closest('.chip');
      if (!c) return;
      input.value = c.dataset.value;
      setSingleChip(box.dataset.single, c.dataset.value);
    });
    input.addEventListener('input', () => setSingleChip(box.dataset.single, input.value));
  });
  $$('[data-multi]').forEach((box) => box.addEventListener('click', (e) => {
    const c = e.target.closest('.chip');
    if (c) c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'));
  }));
  const multi = (name) => $$(`[data-multi="${name}"] .chip[aria-pressed="true"]`).map((c) => c.dataset.value);
  const setMulti = (name, values) => $$(`[data-multi="${name}"] .chip`).forEach((c) => c.setAttribute('aria-pressed', String((values || []).includes(c.dataset.value))));

  function fmtDate(iso, opts) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return isNaN(d) ? iso : d.toLocaleDateString('en-IN', opts || { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function isoDate(d) {
    const z = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  }
  function setDefaultDates() {
    const today = new Date();
    form.elements.date.value = isoDate(today);
    form.elements.startDate.value = isoDate(today);
    form.elements.reviewDate.value = isoDate(new Date(today.getTime() + 7 * 864e5));
  }

  function readForm() {
    const fd = new FormData(form);
    const text = (k) => (fd.get(k) || '').trim();
    const times = {};
    Object.keys(P.SLOTS).forEach((k) => { times[k] = fd.get('time_' + k) || P.SLOTS[k].time; });
    const chartType = fd.get('chartType');
    return {
      name: text('name'),
      patientId: text('patientId'),
      phone: text('phone'),
      age: Number(fd.get('age')),
      sex: fd.get('sex'),
      heightCm: Number(fd.get('heightCm')),
      weightKg: Number(fd.get('weightKg')),
      date: fd.get('date'),
      startDate: fd.get('startDate') || fd.get('date'),
      reviewDate: fd.get('reviewDate'),
      notes: text('notes'),
      chartType,
      travel: chartType === 'travel' ? fd.get('travel') : '',
      plan: fd.get('plan'),
      weightGoal: fd.get('weightGoal'),
      activity: fd.get('activity'),
      kcalTarget: Number(fd.get('kcalTarget')) || 0,
      proteinTarget: Number(fd.get('proteinTarget')) || 0,
      conditions: multi('conditions'),
      diet: fd.get('diet'),
      regions: multi('regions'),
      excludes: multi('excludes'),
      dislikes: text('dislikes').split(',').map((s) => s.trim()).filter(Boolean),
      allergies: multi('allergies'),
      preferWl: fd.get('preferWl') === 'on',
      meals: Number(fd.get('meals')),
      earlyDrink: fd.get('earlyDrink') === 'on',
      times,
      dietitian: text('dietitian'),
      qualification: text('qualification'),
      dietitianPhone: text('dietitianPhone'),
    };
  }

  function writeForm(p) {
    Object.entries(p).forEach(([key, val]) => {
      if (['conditions', 'regions', 'excludes', 'allergies'].includes(key)) return setMulti(key, val);
      if (key === 'times') return Object.entries(val || {}).forEach(([k, t]) => { if (form.elements['time_' + k]) form.elements['time_' + k].value = t; });
      if (key === 'sex' || key === 'diet' || key === 'chartType') return setSeg(key, val);
      const el = form.elements[key];
      if (!el || !el.type) return;
      if (el.type === 'checkbox') el.checked = !!val;
      else el.value = Array.isArray(val) ? val.join(', ') : (val || (val === 0 ? '' : val));
    });
    if (p.travel) form.elements.travel.value = p.travel;
    setSingleChip('kcalTarget', p.kcalTarget || '');
    setSingleChip('proteinTarget', p.proteinTarget || '');
  }

  function validate(p) {
    if (!(p.age >= 14 && p.age <= 90)) return 'Age must be between 14 and 90.';
    if (!(p.heightCm >= 120 && p.heightCm <= 230)) return 'Height must be between 120 and 230 cm.';
    if (!(p.weightKg >= 30 && p.weightKg <= 250)) return 'Weight must be between 30 and 250 kg.';
    if (P.PLANS[p.plan].femaleOnly && p.sex !== 'female') return `${P.PLANS[p.plan].label} is only for female patients.`;
    return '';
  }

  // ── Helpers for display ──────────────────────────────────────────
  function restrictions() {
    const r = P.resolveProfile(profile);
    return [
      ...r.conditions.map((c) => P.CONDITIONS[c]),
      ...profile.allergies.map((a) => `${ALLERGIES[a]}-free`),
    ];
  }
  function exclusionText() {
    return [...profile.excludes.map((k) => `No ${P.EXCLUDES[k].label.toLowerCase()}`), ...profile.dislikes.map((d) => `No ${d}`)].join(', ');
  }
  function cuisineText() {
    const list = profile.regions.length ? profile.regions.map((r) => P.REGIONS[r].label) : ['All Indian'];
    return list.join(', ');
  }
  function macroPct(t) {
    const kp = t.protein * 4, kc = t.carbs * 4, kf = t.fat * 9, tot = kp + kc + kf || 1;
    return { p: Math.round((kp / tot) * 100), c: Math.round((kc / tot) * 100), f: Math.round((kf / tot) * 100) };
  }
  function chartTitle() {
    return profile.travel ? '7-Day Travel Diet Chart' : '7-Day Diet Chart';
  }
  function time12(t) {
    const [h, m] = String(t).split(':').map(Number);
    if (isNaN(h)) return t;
    return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  }
  function guidelines(t) {
    const list = P.tips(profile, t);
    const avgProtein = Math.round(plan.days.reduce((s, d) => s + d.totals.p, 0) / plan.days.length);
    if (avgProtein && avgProtein < t.protein * 0.85) {
      list.push(`These meals average ${avgProtein} g protein a day against a ${t.protein} g target. Add an extra serving of paneer, curd, dal, sprouts, soya, eggs or lean meat as the diet allows.`);
    }
    return list;
  }
  const showWl = () => plan.targets.goal === 'lose' || profile.preferWl;

  // ── Result view ─────────────────────────────────────────────────
  function stat(label, value, sub, accent) {
    return `<div class="tile${accent ? ' accent' : ''}"><span class="tile-label">${label}</span><span class="tile-value">${value}</span>${sub ? `<span class="tile-sub">${sub}</span>` : ''}</div>`;
  }

  function mealCard(entry, di, mi) {
    const m = entry.meal;
    const empty = !m || !m.items.length;
    const diff = m ? m.kcal - entry.target : 0;
    return `<article class="meal-card${entry.locked ? ' locked' : ''}">
      <header>
        <span class="time">${esc(time12(entry.time))}</span>
        <h4>${esc(entry.label)}</h4>
        <span class="target">target ${entry.target} kcal</span>
      </header>
      ${empty ? `<button type="button" class="empty-meal" data-edit="${di}:${mi}">${ICON.plus} Add foods</button>` : `
      <ul class="food-items">${m.items.map((i) => `<li><span>${esc(i.name)}</span><b>${esc(i.text)}</b></li>`).join('')}</ul>`}
      <footer>
        <div class="nutri">
          <span class="kcal">${m ? m.kcal : 0} kcal</span>
          <span class="pill ${Math.abs(diff) > entry.target * 0.2 ? 'warn' : ''}">${diff >= 0 ? '+' : ''}${diff}</span>
          <span class="mac">P ${m ? m.p : 0} · C ${m ? m.c : 0} · F ${m ? m.f : 0}</span>
        </div>
        <div class="acts">
          <button type="button" class="icon-btn" data-edit="${di}:${mi}" title="Edit foods" aria-label="Edit ${esc(entry.label)}">${ICON.edit}</button>
          <button type="button" class="icon-btn" data-swap="${di}:${mi}" title="Swap for another option" aria-label="Swap ${esc(entry.label)}">${ICON.swap}</button>
          <button type="button" class="icon-btn${entry.locked ? ' on' : ''}" data-lock="${di}:${mi}" title="${entry.locked ? 'Unlock' : 'Lock (keep on New plan)'}" aria-label="Lock ${esc(entry.label)}" aria-pressed="${entry.locked}">${entry.locked ? ICON.lock : ICON.unlock}</button>
        </div>
      </footer>
    </article>`;
  }

  function render() {
    const t = plan.targets;
    const pct = macroPct(t);
    const r = restrictions();
    const d = plan.days[activeDay];

    result.innerHTML = `
      <div class="summary">
        <div class="summary-main">
          <span class="eyebrow">${esc(chartTitle())}${profile.travel ? ' · ' + esc(P.TRAVEL[profile.travel]) : ''}</span>
          <h2>${profile.name ? esc(profile.name) : 'Generic diet chart'}</h2>
          <p>${esc(P.PLANS[profile.plan].label)} · ${esc(P.DIETS[profile.diet])} · ${esc(cuisineText())}</p>
          ${r.length ? `<div class="tags">${r.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
        </div>
        <div class="summary-kcal">
          <b>${num(t.calories)}</b><span>kcal / day${t.customKcal ? ' · custom' : ''}</span>
          <b class="sm">${t.protein} g</b><span>protein${t.customProtein ? ' · custom' : ''}</span>
        </div>
      </div>

      <div class="toolbar">
        <button type="button" class="btn primary" id="pdf-named">${ICON.pdf} PDF with name</button>
        <button type="button" class="btn" id="pdf-anon">${ICON.anon} PDF without name</button>
        <button type="button" class="btn" id="csv">${ICON.csv} CSV</button>
        <button type="button" class="btn" id="regen">${ICON.refresh} New plan</button>
        <label class="date-change">Start date <input type="date" id="plan-start" value="${esc(profile.startDate)}"></label>
      </div>

      <div class="tiles">
        ${stat('BMI', t.bmi, `${t.bmiCategory} · ideal ${t.idealWeight[0]}–${t.idealWeight[1]} kg`)}
        ${stat('Maintenance', `${num(t.tdee)}`, `BMR ${num(t.bmr)} kcal`)}
        ${stat('Carbs · Fat', `${t.carbs} · ${t.fat} g`, `${pct.c}% · ${pct.f}% energy`)}
        ${stat('Water', `${t.waterL} L`, `Fibre ${t.fibre} g+`)}
      </div>
      <div class="macro-bar" role="img" aria-label="Protein ${pct.p}%, carbs ${pct.c}%, fat ${pct.f}%">
        <span class="seg-p" style="width:${pct.p}%"></span><span class="seg-c" style="width:${pct.c}%"></span><span class="seg-f" style="width:${pct.f}%"></span>
      </div>
      <p class="combo-note">${num(plan.combos.total)} meal combinations match this profile · ${num(DB.FOODS.length)} foods in library</p>
      ${t.warnings.length ? `<div class="alert">${t.warnings.map(esc).join('<br>')}</div>` : ''}

      <div class="days" role="tablist">
        ${plan.days.map((day, i) => `<button type="button" role="tab" data-day="${i}" aria-selected="${i === activeDay}">
          <span>${day.day.slice(0, 3)}</span><b>${fmtDate(day.date, { day: 'numeric' })}</b><small>${fmtDate(day.date, { month: 'short' })}</small>
        </button>`).join('')}
      </div>

      <div class="day-head">
        <h3>Day ${activeDay + 1} · ${d.day}, ${fmtDate(d.date, { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
        <div class="day-total"><b>${d.totals.kcal}</b> / ${t.calories} kcal · P ${d.totals.p} g · C ${d.totals.c} g · F ${d.totals.f} g</div>
      </div>
      <div class="meal-list">${d.meals.map((e, mi) => mealCard(e, activeDay, mi)).join('')}</div>

      <div class="notes-grid">
        <div class="panel soft">
          <h3>Guidelines</h3>
          <ul>${guidelines(t).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
        ${showWl() ? `<div class="panel soft">
          <h3>Smart weight-loss foods</h3>
          <div class="tags light">${P.weightLossPicks(DB.FOODS, profile, 14).map((n) => `<span>${esc(n)}</span>`).join('')}</div>
        </div>` : ''}
      </div>`;
  }

  // ── A4 print sheet ───────────────────────────────────────────────
  function renderPrint(mode) {
    const named = mode === 'named';
    const t = plan.targets;
    const pct = macroPct(t);
    const r = restrictions();
    const cell = (label, value) => `<th>${label}</th><td>${value ? esc(value) : '&nbsp;'}</td>`;
    const excl = exclusionText();

    const footer = [BRAND.company, BRAND.website, profile.dietitianPhone].filter(Boolean).join('  ·  ');
    let pageStyle = document.getElementById('ps-page-style');
    if (!pageStyle) {
      pageStyle = document.createElement('style');
      pageStyle.id = 'ps-page-style';
      document.head.appendChild(pageStyle);
    }
    pageStyle.textContent = `@page { @bottom-left { content: ${JSON.stringify(footer)}; font: 7.5pt system-ui, sans-serif; color: #7d6f66; }
      @bottom-right { content: "Page " counter(page) " of " counter(pages); font: 7.5pt system-ui, sans-serif; color: #7d6f66; } }`;

    const personal = named ? `
      <table class="ps-grid">
        <tr>${cell('Patient name', profile.name)}${cell('Age / Sex', `${profile.age} y / ${profile.sex === 'male' ? 'Male' : 'Female'}`)}${cell('Chart date', fmtDate(profile.date))}</tr>
        <tr>${cell('Patient ID', profile.patientId)}${cell('Mobile', profile.phone)}${cell('Next review', fmtDate(profile.reviewDate))}</tr>
        <tr>${cell('Height', `${profile.heightCm} cm`)}${cell('Weight', `${profile.weightKg} kg`)}${cell('BMI', `${t.bmi} (${t.bmiCategory})`)}</tr>
        <tr>${cell('Food type', P.DIETS[profile.diet])}${cell('Ideal weight', `${t.idealWeight[0]}–${t.idealWeight[1]} kg`)}${cell('Goal', P.GOALS[t.goal].label)}</tr>
        <tr><th>Conditions / allergies</th><td colspan="5">${r.length ? esc(r.join(', ')) : 'None reported'}</td></tr>
        ${excl ? `<tr><th>Excluded foods</th><td colspan="5">${esc(excl)}</td></tr>` : ''}
        ${profile.notes ? `<tr><th>Medical notes</th><td colspan="5">${esc(profile.notes)}</td></tr>` : ''}
      </table>` : `
      <table class="ps-grid">
        <tr>${cell('Diet plan', P.PLANS[profile.plan].label)}${cell('Food type', P.DIETS[profile.diet])}${cell('Chart date', fmtDate(profile.date))}</tr>
        <tr>${cell('Cuisine', cuisineText())}${cell('Goal', P.GOALS[t.goal].label)}${cell('Valid from', fmtDate(plan.days[0].date))}</tr>
        ${r.length || excl ? `<tr><th>Suitable for</th><td colspan="5">${esc([...r, excl].filter(Boolean).join(', '))}</td></tr>` : ''}
      </table>`;

    sheet.innerHTML = `
      <header class="ps-head">
        <img src="${BRAND.logo}" alt="${esc(BRAND.company)}">
        <div class="ps-title">
          <h1>${esc(chartTitle())}</h1>
          <div class="ps-plan">${esc(P.PLANS[profile.plan].label)}${profile.travel ? ' · ' + esc(P.TRAVEL[profile.travel]) : ''}</div>
          <div class="ps-web">${esc(BRAND.website)}</div>
        </div>
      </header>
      ${personal}
      <div class="ps-targets">
        <div><b>${num(t.calories)}</b> kcal/day</div>
        <div><b>${t.protein} g</b> protein (${pct.p}%)</div>
        <div><b>${t.carbs} g</b> carbs (${pct.c}%)</div>
        <div><b>${t.fat} g</b> fat (${pct.f}%)</div>
        <div><b>${t.waterL} L</b> water</div>
        <div><b>${t.fibre} g+</b> fibre</div>
      </div>

      ${plan.days.map((d, di) => `
        <table class="ps-day">
          <caption>Day ${di + 1} · ${d.day}, ${fmtDate(d.date)}</caption>
          <thead><tr><th class="c-time">Time</th><th class="c-meal">Meal</th><th>Menu &amp; quantity</th><th class="c-kcal">kcal</th></tr></thead>
          <tbody>
            ${d.meals.map((e) => `<tr>
              <td class="c-time">${esc(time12(e.time))}</td>
              <td class="c-meal">${esc(e.label)}</td>
              <td>${e.meal && e.meal.items.length ? e.meal.items.map((i) => `${esc(i.name)} – <b>${esc(i.text)}</b>`).join('; ') : '&nbsp;'}</td>
              <td class="c-kcal">${e.meal && e.meal.items.length ? e.meal.kcal : ''}</td>
            </tr>`).join('')}
          </tbody>
          <tfoot><tr><td colspan="3">Total · Protein ${d.totals.p} g · Carbs ${d.totals.c} g · Fat ${d.totals.f} g</td><td class="c-kcal">${d.totals.kcal}</td></tr></tfoot>
        </table>`).join('')}

      <div class="ps-notes">
        <div>
          <h3>Guidelines</h3>
          <ul>${guidelines(t).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
        <div>
          <h3>Foods to limit / avoid</h3>
          <ul>${P.avoidList(profile).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          ${showWl() ? `<h3 class="mt">Smart weight-loss foods</h3><p class="ps-wl">${P.weightLossPicks(DB.FOODS, profile, 12).map(esc).join(' · ')}</p>` : ''}
        </div>
      </div>

      <div class="ps-end">
        <div>${profile.dietitian ? `Prepared by <b>${esc(profile.dietitian)}</b>${profile.qualification ? ', ' + esc(profile.qualification) : ''} · ` : ''}${esc(BRAND.company)}</div>
        <div class="ps-disclaimer">Computer-generated diet chart — no signature required. Quantities are cooked portions (1 katori ≈ 150 ml, 1 cup ≈ 200 ml); nutrition values are approximate. Follow your doctor's advice for medicines and medical conditions.</div>
      </div>`;
  }

  // Native bridges: Android (AndroidBridge) and the iOS app (WKWebView message handlers).
  function iosHandler(name) {
    const h = window.webkit && window.webkit.messageHandlers;
    return h && h[name] ? h[name] : null;
  }

  function fileTitle(mode) {
    const slug = (s) => s.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const who = mode === 'named' && profile.name ? slug(profile.name) : 'Generic';
    return ['Hindivine', profile.travel ? 'Travel-Diet-Chart' : 'Diet-Chart', who, plan.days[0].date].join('_');
  }

  function printChart(mode) {
    renderPrint(mode);
    const title = fileTitle(mode);
    if (window.AndroidBridge) {
      window.AndroidBridge.print(title);
      return;
    }
    if (iosHandler('hindivinePrint')) {
      iosHandler('hindivinePrint').postMessage(title);
      return;
    }
    const prev = document.title;
    document.title = title; // default PDF file name
    window.addEventListener('afterprint', () => { document.title = prev; }, { once: true });
    window.print();
  }

  function toCsv() {
    const rows = [['Day', 'Date', 'Time', 'Meal', 'Items', 'kcal', 'Protein (g)', 'Carbs (g)', 'Fat (g)']];
    plan.days.forEach((d) => d.meals.forEach((e) => {
      const m = e.meal;
      rows.push([d.day, d.date, time12(e.time), e.label, m ? m.items.map((i) => `${i.name} (${i.text})`).join('; ') : '', m ? m.kcal : '', m ? m.p : '', m ? m.c : '', m ? m.f : '']);
    }));
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const fileName = fileTitle('named') + '.csv';
    if (iosHandler('hindivineSave')) {
      iosHandler('hindivineSave').postMessage({ name: fileName, content: '﻿' + csv });
      return;
    }
    if (window.AndroidBridge) {
      window.AndroidBridge.saveFile(fileName, 'text/csv', '﻿' + csv);
      return;
    }
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ── Meal editor ─────────────────────────────────────────────────
  const editorFilters = { fit: true, wl: false, hp: false, indian: false, world: false, travel: false };
  const EDITOR_FILTER_LABELS = { fit: 'Fits profile', wl: 'Weight loss', hp: 'High protein', indian: 'Indian', world: 'Worldwide', travel: 'Travel' };
  $('#editor-filters').innerHTML = Object.entries(EDITOR_FILTER_LABELS).map(([k, v]) => chip(k, v, editorFilters[k])).join('');

  function openEditor(di, mi) {
    const entry = plan.days[di].meals[mi];
    edit = { di, mi, meal: JSON.parse(JSON.stringify(entry.meal || { items: [] })) };
    $('#editor-title').textContent = `${entry.label} · ${plan.days[di].day}`;
    $('#editor-sub').textContent = `${time12(entry.time)} · target ${entry.target} kcal, ${entry.targetP} g protein`;
    $('#apply-days').innerHTML = plan.days.map((d, i) => (i === di ? '' : chip(i, `${d.day.slice(0, 3)} ${fmtDate(d.date, { day: 'numeric', month: 'short' })}`))).join('') + chip('all', 'All days');
    $('#editor-q').value = '';
    renderEditor();
    renderEditorResults();
    if (editor.showModal) editor.showModal(); else editor.setAttribute('open', '');
    setTimeout(() => $('#editor-q').focus({ preventScroll: true }), 50);
  }

  function closeEditor() {
    edit = null;
    if (editor.close) editor.close(); else editor.removeAttribute('open');
  }

  function renderEditor() {
    const m = P.recalcMeal(edit.meal);
    const entry = plan.days[edit.di].meals[edit.mi];
    $('#editor-items').innerHTML = m.items.length ? m.items.map((i, idx) => `
      <div class="ed-item">
        <div class="ed-name"><b>${esc(i.name)}</b><small>${i.kcal} kcal · P ${i.p} g</small></div>
        <div class="stepper">
          <button type="button" class="icon-btn" data-dec="${idx}" aria-label="Less">${ICON.minus}</button>
          <span>${esc(i.text)}</span>
          <button type="button" class="icon-btn" data-inc="${idx}" aria-label="More">${ICON.plus}</button>
        </div>
        <button type="button" class="icon-btn danger" data-del="${idx}" aria-label="Remove ${esc(i.name)}">${ICON.trash}</button>
      </div>`).join('') : '<p class="muted">No foods yet — search below to add.</p>';
    const diff = m.kcal - entry.target;
    $('#editor-totals').innerHTML = `<b>${m.kcal} kcal</b> <span class="pill ${Math.abs(diff) > entry.target * 0.2 ? 'warn' : ''}">${diff >= 0 ? '+' : ''}${diff}</span> · Protein ${m.p} g · Carbs ${m.c} g · Fat ${m.f} g`;
  }

  function renderEditorResults() {
    const q = $('#editor-q').value;
    const list = P.searchFoods(DB.FOODS, q, {
      profile: editorFilters.fit ? profile : null,
      wl: editorFilters.wl, hp: editorFilters.hp, indian: editorFilters.indian, world: editorFilters.world, travel: editorFilters.travel,
    });
    $('#editor-results').innerHTML = list.slice(0, 60).map((f) => `
      <button type="button" class="res" data-add="${f.id}">
        <span><b>${esc(f.name)}</b><small>${esc(P.formatQty(f.qty))} ${esc(f.unit)} · ${f.kcal} kcal · P ${f.p} g${f.flags.includes('wl') ? ' · <i class="badge wl">WL</i>' : ''}${P.isHighProtein(f) ? ' <i class="badge hp">HP</i>' : ''}</small></span>
        <span class="add">${ICON.plus}</span>
      </button>`).join('') + (list.length > 60 ? `<p class="muted">${list.length - 60} more — refine your search.</p>` : '') + (list.length ? '' : '<p class="muted">No matching foods. Try another word or add a custom food.</p>');
  }

  editor.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || !edit) return;
    if (b.hasAttribute('data-close')) return closeEditor();
    const items = edit.meal.items;
    if (b.dataset.inc || b.dataset.dec) {
      const idx = Number(b.dataset.inc || b.dataset.dec);
      const it = items[idx];
      const step = P.unitStep(it.unit);
      P.setItemQty(it, Math.max(step, it.qty + (b.dataset.inc ? step : -step)));
      return renderEditor();
    }
    if (b.dataset.del) { items.splice(Number(b.dataset.del), 1); return renderEditor(); }
    if (b.dataset.add) { items.push(P.makeItem(DB.FOODS[Number(b.dataset.add)])); return renderEditor(); }
    if (b.closest('#editor-filters')) {
      const k = b.dataset.value;
      editorFilters[k] = !editorFilters[k];
      if (k === 'indian' && editorFilters.indian) editorFilters.world = false;
      if (k === 'world' && editorFilters.world) editorFilters.indian = false;
      $$('#editor-filters .chip').forEach((c) => c.setAttribute('aria-pressed', String(!!editorFilters[c.dataset.value])));
      return renderEditorResults();
    }
    if (b.closest('#apply-days')) {
      if (b.dataset.value === 'all') {
        const on = b.getAttribute('aria-pressed') !== 'true';
        $$('#apply-days .chip').forEach((c) => c.setAttribute('aria-pressed', String(on)));
      } else b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
      return;
    }
    if (b.id === 'cf-add') {
      const name = $('#cf-name').value.trim();
      if (!name) return $('#cf-name').focus();
      const qtyText = $('#cf-qty').value.trim() || '1 serving';
      const m = qtyText.match(/^([\d.]+)\s*(.*)$/);
      items.push(P.customItem(name, m ? m[1] : 1, m ? m[2] || 'serving' : qtyText, $('#cf-kcal').value, $('#cf-protein').value));
      ['#cf-name', '#cf-qty', '#cf-kcal', '#cf-protein'].forEach((s) => { $(s).value = ''; });
      return renderEditor();
    }
    if (b.id === 'editor-save') {
      const { di, mi } = edit;
      const entry = plan.days[di].meals[mi];
      entry.meal = P.recalcMeal(edit.meal);
      entry.meal.name = entry.meal.items.map((i) => i.name).join(' + ');
      entry.locked = true;
      P.refreshDay(plan.days[di]);
      const days = $$('#apply-days .chip[aria-pressed="true"]').map((c) => c.dataset.value).filter((v) => v !== 'all').map(Number);
      if (days.length) P.copyMeal(plan, di, mi, days);
      closeEditor();
      savePlan();
      render();
    }
  });
  $('#editor-q').addEventListener('input', renderEditorResults);
  editor.addEventListener('cancel', () => { edit = null; });

  // ── Food library ─────────────────────────────────────────────────
  const libFilters = { wl: 'Weight loss', hp: 'High protein', indian: 'Indian', world: 'Worldwide', travel: 'Travel', vegan: 'Vegan', veg: 'Vegetarian', egg: 'Egg', nonveg: 'Non-veg' };
  const libState = {};
  $('#lib-filters').innerHTML = Object.entries(libFilters).map(([k, v]) => chip(k, v)).join('');
  const REGION_LABEL = { IN: 'Pan-Indian', ...Object.fromEntries(Object.entries(P.REGIONS).map(([k, v]) => [k, v.label])) };

  function renderLibrary() {
    const q = $('#lib-search').value;
    const dietSel = ['vegan', 'veg', 'egg', 'nonveg'].filter((d) => libState[d]);
    let list = P.searchFoods(DB.FOODS, q, { wl: libState.wl, hp: libState.hp, indian: libState.indian, world: libState.world, travel: libState.travel });
    if (dietSel.length) list = list.filter((f) => dietSel.includes(f.diet));
    const shown = list.slice(0, 240);
    $('#lib-count').textContent = `${num(list.length)} of ${num(DB.FOODS.length)} foods${list.length > shown.length ? ` · showing first ${shown.length}` : ''}`;
    $('#lib-list').innerHTML = shown.map((f) => `
      <div class="food-card">
        <div class="fc-top"><i class="diet-dot ${f.diet}" title="${esc(P.DIETS[f.diet] || f.diet)}"></i><b>${esc(f.name)}</b></div>
        <small>${esc(REGION_LABEL[f.region] || f.region)} · ${esc(P.formatQty(f.qty))} ${esc(f.unit)}</small>
        <div class="fc-nutri"><span><b>${f.kcal}</b> kcal</span><span>P ${f.p}</span><span>C ${f.c}</span><span>F ${f.f}</span></div>
        <div class="fc-badges">${f.flags.includes('wl') ? '<i class="badge wl">Weight loss</i>' : ''}${P.isHighProtein(f) ? '<i class="badge hp">High protein</i>' : ''}${f.flags.includes('tr') ? '<i class="badge tr">Travel</i>' : ''}${f.flags.includes('hgi') ? '<i class="badge warn">High GI</i>' : ''}</div>
      </div>`).join('');
  }
  $('#lib-search').addEventListener('input', renderLibrary);
  $('#lib-filters').addEventListener('click', (e) => {
    const c = e.target.closest('.chip');
    if (!c) return;
    libState[c.dataset.value] = !libState[c.dataset.value];
    c.setAttribute('aria-pressed', String(libState[c.dataset.value]));
    renderLibrary();
  });

  $$('.nav-btn').forEach((b) => b.addEventListener('click', () => {
    $$('.nav-btn').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    $('#view-builder').hidden = b.dataset.view !== 'builder';
    $('#view-library').hidden = b.dataset.view !== 'library';
    if (b.dataset.view === 'library') renderLibrary();
  }));

  // ── Persistence & events ─────────────────────────────────────────
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* storage unavailable */ }
  }
  function load(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; }
  }
  function savePlan() { save(PATIENT_KEY, { profile, plan, activeDay }); }

  function start(blank) {
    const p = readForm();
    const err = validate(p);
    errorEl.hidden = !err;
    errorEl.textContent = err;
    if (err) return;
    profile = p;
    const dietitian = {};
    DIETITIAN_FIELDS.forEach((k) => { dietitian[k] = p[k]; });
    save(DIETITIAN_KEY, dietitian);
    activeDay = 0;
    plan = P.generatePlan(DB, profile, Math.floor(Math.random() * 1e9), { blank });
    savePlan();
    render();
    if (window.matchMedia('(max-width: 980px)').matches) result.scrollIntoView({ behavior: 'smooth' });
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); start(false); });
  $('#manual-start').addEventListener('click', () => start(true));

  result.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const pair = (v) => v.split(':').map(Number);
    if (b.dataset.day) {
      activeDay = Number(b.dataset.day);
      render();
    } else if (b.dataset.edit) {
      openEditor(...pair(b.dataset.edit));
    } else if (b.dataset.swap) {
      const [di, mi] = pair(b.dataset.swap);
      if (P.swapMeal(DB, profile, plan, di, mi)) { savePlan(); render(); }
    } else if (b.dataset.lock) {
      const [di, mi] = pair(b.dataset.lock);
      const entry = plan.days[di].meals[mi];
      entry.locked = !entry.locked;
      savePlan();
      render();
    } else if (b.id === 'regen') {
      plan = P.generatePlan(DB, profile, Math.floor(Math.random() * 1e9), { previous: plan });
      savePlan();
      render();
    } else if (b.id === 'csv') {
      toCsv();
    } else if (b.id === 'pdf-named') {
      printChart('named');
    } else if (b.id === 'pdf-anon') {
      printChart('anon');
    }
  });

  result.addEventListener('change', (e) => {
    if (e.target.id !== 'plan-start' || !e.target.value) return;
    profile.startDate = e.target.value;
    form.elements.startDate.value = e.target.value;
    P.planDays(profile.startDate).forEach(({ date, day }, i) => { plan.days[i].date = date; plan.days[i].day = day; });
    savePlan();
    render();
  });

  function heroStats() {
    const all = P.countCombinations(DB, { age: 30, sex: 'female', heightCm: 160, weightKg: 60, activity: 'light', plan: 'balanced', diet: 'nonveg', cuisine: 'mix', meals: 6, earlyDrink: true });
    $('#hero-stats').innerHTML = `
      <div><b>${num(DB.FOODS.length)}</b><span>foods</span></div>
      <div><b>${num(all.total)}</b><span>meal combinations</span></div>
      <div><b>${Object.keys(P.PLANS).length + 1}</b><span>diet types</span></div>`;
  }

  // Restore
  setDefaultDates();
  const savedDietitian = load(DIETITIAN_KEY);
  if (savedDietitian) writeForm(savedDietitian);
  const saved = load(PATIENT_KEY);
  if (saved && saved.profile && saved.plan && P.PLANS[saved.profile.plan]) {
    writeForm(saved.profile);
    profile = saved.profile;
    plan = saved.plan;
    activeDay = Math.min(saved.activeDay || 0, 6);
    render();
  }
  heroStats();

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is optional */ });
  }
})();
