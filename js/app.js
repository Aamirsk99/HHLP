/* Hindivine Diet — screen-by-screen app. */
(function () {
  const P = window.Planner;
  const DB = window.FOODDB;
  const I = window.I18N;
  const BRAND = { company: 'Hindivine Healthcare Private Limited', website: 'www.hindivine.com', logo: 'img/logo.jpg' };
  const STORE_KEY = 'hindivine.chart.v3';
  const DIETITIAN_KEY = 'hindivine.dietitian';
  const DIETITIAN_FIELDS = ['dietitian', 'qualification', 'dietitianPhone'];
  const ALLERGIES = { gluten: 'Gluten', dairy: 'Dairy / lactose', nuts: 'Nuts & peanuts', soy: 'Soy', egg: 'Egg', fish: 'Fish / seafood' };
  const KCAL_PRESETS = [1000, 1200, 1400, 1500, 1600, 1800, 2000, 2200, 2500];
  const PROTEIN_PRESETS = [40, 50, 60, 70, 80, 100, 120, 150];
  const STEPS = ['s1', 's2', 's3', 's4', 's5'];
  const SCREENS = ['home', ...STEPS, 'chart', 'library'];

  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const form = $('#profile-form');
  const result = $('#result');
  const sheet = $('#print-sheet');
  const editor = $('#editor');

  let profile = null;
  let plan = null;
  let activeDay = 0;
  let edit = null;
  let current = 'home';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (n) => Number(n).toLocaleString('en-IN');
  const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const ICON = {
    edit: svg('<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M14 6l4 4"/>'),
    swap: svg('<path d="M4 7h13l-3-3M20 17H7l3 3"/>'),
    lock: svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    unlock: svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>'),
    minus: svg('<path d="M6 12h12"/>'),
    plus: svg('<path d="M12 6v12M6 12h12"/>'),
    trash: svg('<path d="M5 7h14M10 11v6M14 11v6M7 7l1 13h8l1-13M9 7V4h6v3"/>'),
  };
  const chip = (value, label, pressed) => `<button type="button" class="chip" data-value="${esc(value)}" aria-pressed="${!!pressed}">${esc(label)}</button>`;
  const options = (entries, selected) => Object.entries(entries)
    .map(([k, v]) => `<option value="${esc(k)}"${k === selected ? ' selected' : ''}>${esc(typeof v === 'string' ? v : v.label || v.name)}</option>`).join('');

  // ── Build controls ───────────────────────────────────────────────
  $('#plan').innerHTML = options(P.PLANS, 'weight_loss');
  $('#activity').innerHTML = options(P.ACTIVITY, 'light');
  $('#travel').innerHTML = options(P.TRAVEL, 'mixed');
  $('#chart-lang').innerHTML = options(I.LANGS, 'en');
  $('#start-day').innerHTML = P.DAY_NAMES.map((d) => `<option value="${d}">${d}</option>`).join('');
  $('#diet-seg').innerHTML = Object.entries(P.DIETS).map(([k, v]) => `<button type="button" data-value="${k}" aria-pressed="${k === 'veg'}">${esc(v)}</button>`).join('');
  $('#kcal-chips').innerHTML = chip('', 'Auto', true) + KCAL_PRESETS.map((k) => chip(k, num(k))).join('');
  $('#protein-chips').innerHTML = chip('', 'Auto', true) + PROTEIN_PRESETS.map((g) => chip(g, `${g} g`)).join('');
  $('#condition-chips').innerHTML = Object.entries(P.CONDITIONS).map(([k, v]) => chip(k, v)).join('');
  $('#region-chips').innerHTML = Object.entries(P.REGIONS).map(([k, v]) => chip(k, v.label)).join('');
  $('#exclude-chips').innerHTML = Object.entries(P.EXCLUDES).map(([k, v]) => chip(k, `No ${v.label.toLowerCase()}`)).join('');
  $('#allergy-chips').innerHTML = Object.entries(ALLERGIES).map(([k, v]) => chip(k, v)).join('');
  $('#times').innerHTML = Object.entries(P.SLOTS).map(([k, s]) => `<label>${esc(s.label)}<input type="time" name="time_${k}" value="${s.time}"></label>`).join('');
  $('#food-suggest').innerHTML = DB.FOODS.map((f) => `<option value="${esc(f.name)}">${esc(f.hi)}</option>`).join('');

  const REGION_LABEL = { IN: 'Pan-Indian', ...Object.fromEntries(Object.entries(P.REGIONS).map(([k, v]) => [k, v.label])) };
  const CAT_OPTIONS = '<option value="">All categories</option>' + Object.entries(P.CATEGORIES).map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`).join('');
  $('#lib-category').innerHTML = CAT_OPTIONS;
  $('#editor-category').innerHTML = CAT_OPTIONS;
  $('#lib-region').innerHTML = '<option value="">All cuisines</option>' + Object.entries(REGION_LABEL).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
  $('#lib-diet').innerHTML = '<option value="">All</option><option value="vegan">Vegan</option><option value="veg">Vegetarian</option><option value="egg">Egg</option><option value="nonveg">Non-veg</option>';

  function setSeg(name, value) {
    const seg = $(`.seg[data-name="${name}"]`);
    if (!seg || value == null) return;
    $$('button', seg).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === value)));
    form.elements[name].value = value;
    if (name === 'chartType') $$('.travel-only').forEach((el) => { el.hidden = value !== 'travel'; });
  }
  $$('.seg').forEach((seg) => seg.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) { setSeg(seg.dataset.name, b.dataset.value); onFormChange(); }
  }));

  function setSingleChip(name, value) {
    $$(`[data-single="${name}"] .chip`).forEach((c) => c.setAttribute('aria-pressed', String(String(c.dataset.value) === String(value || ''))));
  }
  $$('[data-single]').forEach((box) => {
    const input = form.elements[box.dataset.single];
    box.addEventListener('click', (e) => {
      const c = e.target.closest('.chip');
      if (!c) return;
      input.value = c.dataset.value;
      setSingleChip(box.dataset.single, c.dataset.value);
      onFormChange();
    });
    input.addEventListener('input', () => setSingleChip(box.dataset.single, input.value));
  });
  $$('[data-multi]').forEach((box) => box.addEventListener('click', (e) => {
    const c = e.target.closest('.chip');
    if (c) { c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true')); onFormChange(); }
  }));
  const multi = (name) => $$(`[data-multi="${name}"] .chip[aria-pressed="true"]`).map((c) => c.dataset.value);
  const setMulti = (name, values) => $$(`[data-multi="${name}"] .chip`).forEach((c) => c.setAttribute('aria-pressed', String((values || []).includes(c.dataset.value))));

  // Tag inputs (foods the patient likes / avoids)
  const tagState = { likes: [], dislikes: [] };
  function renderTags(name) {
    const box = $(`[data-tags="${name}"] .tags-box`);
    box.innerHTML = tagState[name].map((t, i) => `<span class="tag">${esc(t)}<button type="button" data-remove="${i}" aria-label="Remove ${esc(t)}">✕</button></span>`).join('');
  }
  function addTag(name, text) {
    text.split(',').map((s) => s.trim()).filter(Boolean).forEach((t) => {
      if (!tagState[name].some((x) => x.toLowerCase() === t.toLowerCase())) tagState[name].push(t);
    });
    renderTags(name);
  }
  $$('.tag-input').forEach((wrap) => {
    const name = wrap.dataset.tags;
    const input = $('input', wrap);
    input.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
        e.preventDefault();
        addTag(name, input.value);
        input.value = '';
      }
    });
    input.addEventListener('change', () => { if (input.value.trim()) { addTag(name, input.value); input.value = ''; } });
    wrap.addEventListener('click', (e) => {
      const b = e.target.closest('[data-remove]');
      if (b) { tagState[name].splice(Number(b.dataset.remove), 1); renderTags(name); } else input.focus();
    });
  });

  // ── Form ⇄ profile ──────────────────────────────────────────────
  function readForm() {
    const fd = new FormData(form);
    const text = (k) => (fd.get(k) || '').trim();
    const times = {};
    Object.keys(P.SLOTS).forEach((k) => { times[k] = fd.get('time_' + k) || P.SLOTS[k].time; });
    const chartType = fd.get('chartType');
    return {
      name: text('name'), patientId: text('patientId'), phone: text('phone'),
      age: Number(fd.get('age')), sex: fd.get('sex'), heightCm: Number(fd.get('heightCm')), weightKg: Number(fd.get('weightKg')),
      notes: text('notes'),
      chartType, travel: chartType === 'travel' ? fd.get('travel') : '',
      plan: fd.get('plan'), weightGoal: fd.get('weightGoal'), activity: fd.get('activity'),
      kcalTarget: Number(fd.get('kcalTarget')) || 0, proteinTarget: Number(fd.get('proteinTarget')) || 0,
      conditions: multi('conditions'),
      diet: fd.get('diet'), regions: multi('regions'), excludes: multi('excludes'), allergies: multi('allergies'),
      likes: [...tagState.likes], dislikes: [...tagState.dislikes],
      preferWl: fd.get('preferWl') === 'on',
      chartLang: fd.get('chartLang') || 'en', startDay: fd.get('startDay') || 'Monday',
      meals: Number(fd.get('meals')), earlyDrink: fd.get('earlyDrink') === 'on', times,
      dietitian: text('dietitian'), qualification: text('qualification'), dietitianPhone: text('dietitianPhone'),
    };
  }

  function writeForm(p) {
    Object.entries(p).forEach(([key, val]) => {
      if (['conditions', 'regions', 'excludes', 'allergies'].includes(key)) return setMulti(key, val);
      if (key === 'likes' || key === 'dislikes') { tagState[key] = [...(val || [])]; return renderTags(key); }
      if (key === 'times') return Object.entries(val || {}).forEach(([k, t]) => { if (form.elements['time_' + k]) form.elements['time_' + k].value = t; });
      if (key === 'sex' || key === 'diet' || key === 'chartType') return setSeg(key, val);
      const el = form.elements[key];
      if (!el || !el.type) return;
      if (el.type === 'checkbox') el.checked = !!val;
      else el.value = val === 0 ? '' : (val == null ? '' : val);
    });
    if (p.travel) form.elements.travel.value = p.travel;
    setSingleChip('kcalTarget', p.kcalTarget || '');
    setSingleChip('proteinTarget', p.proteinTarget || '');
  }

  function validate(p, step) {
    if (!step || step === 's1') {
      if (!(p.age >= 14 && p.age <= 90)) return 'Age must be between 14 and 90.';
      if (!(p.heightCm >= 120 && p.heightCm <= 230)) return 'Height must be between 120 and 230 cm.';
      if (!(p.weightKg >= 30 && p.weightKg <= 250)) return 'Weight must be between 30 and 250 kg.';
    }
    if (!step || step === 's2') {
      if (P.PLANS[p.plan].femaleOnly && p.sex !== 'female') return `${P.PLANS[p.plan].label} is only for female patients.`;
    }
    return '';
  }

  function onFormChange() {
    const p = readForm();
    if (current === 's1') liveBmi(p);
    if (current === 's2') liveTargets(p);
  }
  form.addEventListener('input', onFormChange);
  form.addEventListener('submit', (e) => e.preventDefault());

  function liveBmi(p) {
    const box = $('#bmi-live');
    if (!(p.heightCm > 0 && p.weightKg > 0 && p.age > 0)) { box.textContent = ''; return; }
    const t = P.computeTargets({ ...p, plan: 'balanced' });
    box.innerHTML = `<b>BMI ${t.bmi}</b> · ${t.bmiCategory} · ideal ${t.idealWeight[0]}–${t.idealWeight[1]} kg`;
  }
  function liveTargets(p) {
    if (validate(p, 's1')) return;
    const t = P.computeTargets(p);
    $('#target-live').innerHTML = `This chart: <b>${num(t.calories)} kcal</b> · <b>${t.protein} g protein</b> · ${esc(P.GOALS[t.goal].label)}${t.warnings.length ? `<br><span class="warn-text">${t.warnings.map(esc).join('<br>')}</span>` : ''}`;
  }

  function review() {
    const p = readForm();
    const t = P.computeTargets(p);
    const row = (k, v) => (v ? `<div><span>${k}</span><b>${esc(v)}</b></div>` : '');
    const likes = p.likes.join(', ');
    const avoid = [...p.excludes.map((k) => 'No ' + P.EXCLUDES[k].label.toLowerCase()), ...p.dislikes].join(', ');
    $('#review').innerHTML = `<h3>Review</h3><div class="review-grid">
      ${row('Patient', p.name || 'Generic chart')}
      ${row('Diet', P.PLANS[p.plan].label + (p.travel ? ' · ' + P.TRAVEL[p.travel] : ''))}
      ${row('Target', `${num(t.calories)} kcal · ${t.protein} g protein`)}
      ${row('Food type', P.DIETS[p.diet])}
      ${row('Likes', likes)}
      ${row('Avoid', avoid)}
      ${row('Language', I.LANGS[p.chartLang].name)}
      ${row('Days', `${p.startDay} → ${P.planDays(p.startDay)[6].day}`)}
    </div>`;
  }

  // ── Router ───────────────────────────────────────────────────────
  function show(name) {
    if (!SCREENS.includes(name)) name = 'home';
    if (name === 'chart' && !plan) name = 'home';
    current = name;
    $$('.screen').forEach((s) => { s.hidden = s.dataset.screen !== name; });
    const sec = $(`.screen[data-screen="${name}"]`);
    const stepIdx = STEPS.indexOf(name);
    $('#back').hidden = name === 'home';
    $('#appbar-logo').hidden = name !== 'home';
    $('#appbar-text').hidden = name === 'home';
    $('#screen-title').textContent = sec.dataset.title || '';
    $('#screen-sub').textContent = stepIdx >= 0 ? `Step ${stepIdx + 1} of ${STEPS.length}` : (name === 'chart' && profile ? (profile.name || 'Generic chart') : '');
    $('#progress').hidden = stepIdx < 0;
    $('#progress-bar').style.width = `${((stepIdx + 1) / STEPS.length) * 100}%`;
    $('#step-bar').hidden = stepIdx < 0 || name === 's5';
    $('#create-bar').hidden = name !== 's5';
    $('#chart-bar').hidden = name !== 'chart';
    $('#go-library').hidden = name === 'library';
    $('#step-back').textContent = stepIdx === 0 ? 'Home' : 'Back';
    document.body.dataset.screen = name;
    if (name === 's1') liveBmi(readForm());
    if (name === 's2') liveTargets(readForm());
    if (name === 's5') review();
    if (name === 'library') renderLibrary();
    if (name === 'chart') render();
    if (name === 'home') renderHome();
    window.scrollTo(0, 0);
  }

  function go(name) {
    if (location.hash.slice(1) === name) show(name);
    else location.hash = name;
  }
  window.addEventListener('hashchange', () => show(location.hash.slice(1)));

  $('#back').addEventListener('click', () => (history.length > 1 ? history.back() : go('home')));
  $('#go-library').addEventListener('click', () => go('library'));
  $$('[data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));
  $('#step-next').addEventListener('click', () => {
    const err = validate(readForm(), current);
    if (err) return toast(err);
    go(STEPS[STEPS.indexOf(current) + 1]);
  });
  $('#step-back').addEventListener('click', () => go(STEPS.indexOf(current) === 0 ? 'home' : STEPS[STEPS.indexOf(current) - 1]));

  function toast(msg) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast no-print'; t.setAttribute('role', 'alert'); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  function renderHome() {
    const all = P.countCombinations(DB, { age: 30, sex: 'female', heightCm: 160, weightKg: 60, activity: 'light', plan: 'balanced', diet: 'nonveg', cuisine: 'mix', meals: 6, earlyDrink: true });
    $('#home-stats').innerHTML = `
      <div><b>${num(DB.FOODS.length)}</b><span>foods</span></div>
      <div><b>${num(all.total)}</b><span>meal combos</span></div>
      <div><b>${I.CODES.length}</b><span>languages</span></div>`;
    $('#continue-chart').hidden = !plan;
    if (plan) $('#continue-sub').textContent = `${profile.name || 'Generic chart'} · ${P.PLANS[profile.plan].label}`;
  }
  $('#continue-chart').addEventListener('click', () => go('chart'));

  // ── Chart helpers (chart language) ──────────────────────────────
  const L = () => (profile && profile.chartLang) || 'en';
  const itemName = (item, lang) => I.foodName(lang, item.name, item.custom);
  const itemQty = (item, lang) => I.unitText(lang, item.text, item.unit, item.qty);
  function time12(t) {
    const [h, m] = String(t).split(':').map(Number);
    if (isNaN(h)) return t;
    return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  }
  function macroPct(t) {
    const kp = t.protein * 4, kc = t.carbs * 4, kf = t.fat * 9, tot = kp + kc + kf || 1;
    return { p: Math.round((kp / tot) * 100), c: Math.round((kc / tot) * 100), f: Math.round((kf / tot) * 100) };
  }
  function tipList(t) {
    const list = P.tips(profile, t);
    const avg = Math.round(plan.days.reduce((s, d) => s + d.totals.p, 0) / plan.days.length);
    if (avg && avg < t.protein * 0.85) list.push({ k: 'proteinGap', v: { avg, target: t.protein } });
    return list;
  }
  function restrictionText(lang) {
    const r = P.resolveProfile(profile);
    return [...r.conditions.map((c) => I.label(lang, 'conditions', c)), ...profile.allergies.map((a) => I.label(lang, 'allergy', a))];
  }
  function exclusionText(lang) {
    return [...profile.excludes.map((k) => I.label(lang, 'excl', k)), ...profile.dislikes].join(', ');
  }
  function cuisineText(lang) {
    return profile.regions.length ? profile.regions.map((r) => I.label(lang, 'regions', r)).join(', ') : I.label(lang, 'regions', 'ALL');
  }
  const showWl = () => plan.targets.goal === 'lose' || profile.preferWl;

  // ── Chart screen ─────────────────────────────────────────────────
  function mealCard(entry, di, mi) {
    const m = entry.meal;
    const lang = L();
    const empty = !m || !m.items.length;
    const diff = m ? m.kcal - entry.target : 0;
    return `<article class="meal-card${entry.locked ? ' locked' : ''}">
      <header>
        <span class="time">${esc(time12(entry.time))}</span>
        <h4>${esc(entry.label)}${lang !== 'en' ? ` <small>${esc(I.label(lang, 'slots', entry.slot))}</small>` : ''}</h4>
        <span class="target">${entry.target} kcal</span>
      </header>
      ${empty ? `<button type="button" class="empty-meal" data-edit="${di}:${mi}">${ICON.plus} Add foods</button>` : `
      <ul class="food-items">${m.items.map((i) => `<li><span>${esc(itemName(i, lang))}${lang !== 'en' && !i.custom ? `<small>${esc(i.name)}</small>` : ''}</span><b>${esc(itemQty(i, lang))}</b></li>`).join('')}</ul>`}
      <footer>
        <div class="nutri">
          <span class="kcal">${m ? m.kcal : 0} kcal</span>
          <span class="pill ${Math.abs(diff) > entry.target * 0.2 ? 'warn' : ''}">${diff >= 0 ? '+' : ''}${diff}</span>
          <span class="mac">P ${m ? m.p : 0} · C ${m ? m.c : 0} · F ${m ? m.f : 0}</span>
        </div>
        <div class="acts">
          <button type="button" class="icon-btn" data-edit="${di}:${mi}" title="Choose foods" aria-label="Edit ${esc(entry.label)}">${ICON.edit}</button>
          <button type="button" class="icon-btn" data-swap="${di}:${mi}" title="Swap for another option" aria-label="Swap ${esc(entry.label)}">${ICON.swap}</button>
          <button type="button" class="icon-btn${entry.locked ? ' on' : ''}" data-lock="${di}:${mi}" title="${entry.locked ? 'Unlock' : 'Lock (keep on New plan)'}" aria-pressed="${entry.locked}" aria-label="Lock ${esc(entry.label)}">${entry.locked ? ICON.lock : ICON.unlock}</button>
        </div>
      </footer>
    </article>`;
  }

  function render() {
    if (!plan) return;
    const t = plan.targets;
    const pct = macroPct(t);
    const d = plan.days[activeDay];
    const conds = restrictionText('en');

    result.innerHTML = `
      <div class="summary">
        <div class="summary-main">
          <span class="eyebrow">${profile.travel ? '7-Day Travel Diet Chart · ' + esc(P.TRAVEL[profile.travel]) : '7-Day Diet Chart'}</span>
          <h2>${profile.name ? esc(profile.name) : 'Generic diet chart'}</h2>
          <p>${esc(P.PLANS[profile.plan].label)} · ${esc(P.DIETS[profile.diet])}</p>
          ${conds.length ? `<div class="tags">${conds.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
        </div>
        <div class="summary-kcal">
          <b>${num(t.calories)}</b><span>kcal / day${t.customKcal ? ' · custom' : ''}</span>
          <b class="sm">${t.protein} g</b><span>protein${t.customProtein ? ' · custom' : ''}</span>
        </div>
      </div>

      <div class="chart-controls card">
        <label>Chart language<select id="chart-lang-quick">${options(I.LANGS, L())}</select></label>
        <label>Starts on<select id="start-day-quick">${P.DAY_NAMES.map((n) => `<option${n === profile.startDay ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
      </div>

      <div class="tiles">
        <div class="tile"><span class="tile-label">BMI</span><span class="tile-value">${t.bmi}</span><span class="tile-sub">${t.bmiCategory} · ideal ${t.idealWeight[0]}–${t.idealWeight[1]} kg</span></div>
        <div class="tile"><span class="tile-label">Carbs · Fat</span><span class="tile-value">${t.carbs} · ${t.fat} g</span><span class="tile-sub">${pct.c}% · ${pct.f}% energy</span></div>
        <div class="tile"><span class="tile-label">Water</span><span class="tile-value">${t.waterL} L</span><span class="tile-sub">Fibre ${t.fibre} g+</span></div>
        <div class="tile"><span class="tile-label">Options</span><span class="tile-value">${num(plan.combos.total)}</span><span class="tile-sub">meal combinations</span></div>
      </div>
      <div class="macro-bar" role="img" aria-label="Protein ${pct.p}%, carbs ${pct.c}%, fat ${pct.f}%"><span class="seg-p" style="width:${pct.p}%"></span><span class="seg-c" style="width:${pct.c}%"></span><span class="seg-f" style="width:${pct.f}%"></span></div>
      ${t.warnings.length ? `<div class="alert">${t.warnings.map(esc).join('<br>')}</div>` : ''}

      <div class="days" role="tablist">
        ${plan.days.map((day, i) => `<button type="button" role="tab" data-day="${i}" aria-selected="${i === activeDay}"><small>Day ${i + 1}</small><b>${day.day.slice(0, 3)}</b></button>`).join('')}
      </div>
      <div class="day-head">
        <h3>Day ${activeDay + 1} · ${d.day}${L() !== 'en' ? ` <small>${esc(I.dayName(L(), d.day))}</small>` : ''}</h3>
        <div class="day-total"><b>${d.totals.kcal}</b> / ${t.calories} kcal · P ${d.totals.p} g</div>
      </div>
      <div class="meal-list">${d.meals.map((e, mi) => mealCard(e, activeDay, mi)).join('')}</div>

      <div class="card soft">
        <h3>Guidelines</h3>
        <ul>${tipList(t).map((x) => `<li>${esc(I.tipText('en', x))}</li>`).join('')}</ul>
      </div>
      ${showWl() ? `<div class="card soft"><h3>Smart weight-loss foods</h3><div class="tags light">${P.weightLossPicks(DB.FOODS, profile, 14).map((f) => `<span>${esc(f.name)}</span>`).join('')}</div></div>` : ''}`;
  }

  result.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const pair = (v) => v.split(':').map(Number);
    if (b.dataset.day) { activeDay = Number(b.dataset.day); savePlan(); render(); }
    else if (b.dataset.edit) openEditor(...pair(b.dataset.edit));
    else if (b.dataset.swap) {
      const [di, mi] = pair(b.dataset.swap);
      if (P.swapMeal(DB, profile, plan, di, mi)) { savePlan(); render(); }
    } else if (b.dataset.lock) {
      const [di, mi] = pair(b.dataset.lock);
      plan.days[di].meals[mi].locked = !plan.days[di].meals[mi].locked;
      savePlan();
      render();
    }
  });
  result.addEventListener('change', (e) => {
    if (e.target.id === 'chart-lang-quick') {
      profile.chartLang = e.target.value;
      form.elements.chartLang.value = e.target.value;
    } else if (e.target.id === 'start-day-quick') {
      profile.startDay = e.target.value;
      form.elements.startDay.value = e.target.value;
      P.planDays(profile.startDay).forEach(({ day }, i) => { plan.days[i].day = day; });
    } else return;
    savePlan();
    render();
  });

  $('#regen').addEventListener('click', () => {
    plan = P.generatePlan(DB, profile, Math.floor(Math.random() * 1e9), { previous: plan });
    savePlan();
    render();
    toast('New plan created — locked meals were kept.');
  });
  $('#csv').addEventListener('click', toCsv);
  $('#pdf-named').addEventListener('click', () => printChart('named'));
  $('#pdf-anon').addEventListener('click', () => printChart('anon'));

  function start(blank) {
    const p = readForm();
    const err = validate(p);
    if (err) { $('#form-error').hidden = false; $('#form-error').textContent = err; return; }
    $('#form-error').hidden = true;
    profile = p;
    const dietitian = {};
    DIETITIAN_FIELDS.forEach((k) => { dietitian[k] = p[k]; });
    save(DIETITIAN_KEY, dietitian);
    activeDay = 0;
    plan = P.generatePlan(DB, profile, Math.floor(Math.random() * 1e9), { blank });
    savePlan();
    go('chart');
  }
  $('#generate').addEventListener('click', () => start(false));
  $('#manual-start').addEventListener('click', () => start(true));

  // ── Meal editor ──────────────────────────────────────────────────
  const editorFilters = { fit: true, wl: false, hp: false, indian: false, world: false, travel: false };
  const EDITOR_FILTER_LABELS = { fit: 'Fits patient', wl: 'Weight loss', hp: 'High protein', indian: 'Indian', world: 'Worldwide', travel: 'Travel' };
  $('#editor-filters').innerHTML = Object.entries(EDITOR_FILTER_LABELS).map(([k, v]) => chip(k, v, editorFilters[k])).join('');

  function openEditor(di, mi) {
    const entry = plan.days[di].meals[mi];
    edit = { di, mi, meal: JSON.parse(JSON.stringify(entry.meal || { items: [] })) };
    $('#editor-title').textContent = `${entry.label} · ${plan.days[di].day}`;
    $('#editor-sub').textContent = `${time12(entry.time)} · target ${entry.target} kcal, ${entry.targetP} g protein`;
    $('#apply-days').innerHTML = plan.days.map((d, i) => (i === di ? '' : chip(i, d.day.slice(0, 3)))).join('') + chip('all', 'All days');
    $('#editor-q').value = '';
    renderEditor();
    renderEditorResults();
    if (editor.showModal) editor.showModal(); else editor.setAttribute('open', '');
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
    const list = P.searchFoods(DB.FOODS, $('#editor-q').value, {
      profile: editorFilters.fit ? profile : null,
      wl: editorFilters.wl, hp: editorFilters.hp, indian: editorFilters.indian, world: editorFilters.world, travel: editorFilters.travel,
      category: $('#editor-category').value, sort: $('#editor-sort').value,
    });
    $('#editor-results').innerHTML = list.slice(0, 60).map((f) => `
      <button type="button" class="res" data-add="${f.id}">
        <span><b>${esc(f.name)}</b><small>${esc(f.hi)} · ${esc(P.formatQty(f.qty))} ${esc(f.unit)} · ${f.kcal} kcal · P ${f.p} g${f.flags.includes('wl') ? ' <i class="badge wl">WL</i>' : ''}${P.isHighProtein(f) ? ' <i class="badge hp">HP</i>' : ''}</small></span>
        <span class="add">${ICON.plus}</span>
      </button>`).join('') + (list.length > 60 ? `<p class="muted">${list.length - 60} more — refine your search.</p>` : '') + (list.length ? '' : '<p class="muted">No matching foods. Try another word, or add it below as your own food.</p>');
  }
  editor.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || !edit) return;
    if (b.hasAttribute('data-close')) return closeEditor();
    const items = edit.meal.items;
    if (b.dataset.inc || b.dataset.dec) {
      const it = items[Number(b.dataset.inc || b.dataset.dec)];
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
  $('#editor-category').addEventListener('change', renderEditorResults);
  $('#editor-sort').addEventListener('change', renderEditorResults);
  editor.addEventListener('cancel', () => { edit = null; });

  // ── Food library ─────────────────────────────────────────────────
  const libFilters = { wl: 'Weight loss', hp: 'High protein', travel: 'Travel' };
  const libState = {};
  $('#lib-filters').innerHTML = Object.entries(libFilters).map(([k, v]) => chip(k, v)).join('');
  function renderLibrary() {
    const list = P.searchFoods(DB.FOODS, $('#lib-search').value, {
      wl: libState.wl, hp: libState.hp, travel: libState.travel,
      category: $('#lib-category').value, region: $('#lib-region').value, dietExact: $('#lib-diet').value,
      maxKcal: Number($('#lib-kcal').value) || 0, sort: $('#lib-sort').value,
    });
    const shown = list.slice(0, 240);
    $('#lib-count').textContent = `${num(list.length)} of ${num(DB.FOODS.length)} foods${list.length > shown.length ? ` · showing first ${shown.length}` : ''}`;
    $('#lib-list').innerHTML = shown.map((f) => `
      <div class="food-card">
        <div class="fc-top"><i class="diet-dot ${f.diet}" title="${esc(P.DIETS[f.diet] || f.diet)}"></i><div><b>${esc(f.name)}</b><small class="hi">${esc(f.hi)}</small></div></div>
        <small>${esc(REGION_LABEL[f.region] || f.region)} · ${esc(P.formatQty(f.qty))} ${esc(f.unit)}</small>
        <div class="fc-nutri"><span><b>${f.kcal}</b> kcal</span><span>P ${f.p}</span><span>C ${f.c}</span><span>F ${f.f}</span></div>
        <div class="fc-badges">${f.flags.includes('wl') ? '<i class="badge wl">Weight loss</i>' : ''}${P.isHighProtein(f) ? '<i class="badge hp">High protein</i>' : ''}${f.flags.includes('tr') ? '<i class="badge tr">Travel</i>' : ''}${f.flags.includes('hgi') ? '<i class="badge warn">High GI</i>' : ''}</div>
      </div>`).join('');
  }
  $('#lib-search').addEventListener('input', renderLibrary);
  ['#lib-category', '#lib-region', '#lib-diet', '#lib-kcal', '#lib-sort'].forEach((s) => $(s).addEventListener('change', renderLibrary));
  $('#lib-filters').addEventListener('click', (e) => {
    const c = e.target.closest('.chip');
    if (!c) return;
    libState[c.dataset.value] = !libState[c.dataset.value];
    c.setAttribute('aria-pressed', String(libState[c.dataset.value]));
    renderLibrary();
  });

  // ── A4 print sheet: exactly 2 pages ─────────────────────────────
  function buildSheet(mode, split, tipLimit, wl) {
    const lang = L();
    const T = (k) => I.t(lang, k);
    const named = mode === 'named';
    const t = plan.targets;
    const pct = macroPct(t);
    const r = restrictionText(lang);
    const excl = exclusionText(lang);
    const cell = (label, value) => `<th>${esc(label)}</th><td>${value ? esc(value) : '&nbsp;'}</td>`;
    const planLabel = I.label(lang, 'plans', profile.plan) + (profile.travel ? ' · ' + I.label(lang, 'travel', profile.travel) : '');
    const likes = profile.likes.join(', ');

    const info = named ? `
      <table class="ps-grid">
        <tr>${cell(T('name'), profile.name)}${cell(T('ageSex'), `${profile.age} ${T('years')} / ${T(profile.sex === 'male' ? 'male' : 'female')}`)}${cell(T('pid'), profile.patientId)}</tr>
        <tr>${cell(T('height'), `${profile.heightCm} cm`)}${cell(T('weight'), `${profile.weightKg} kg`)}${cell(T('bmi'), `${t.bmi} (${I.label(lang, 'bmi', t.bmiCategory)})`)}</tr>
        <tr>${cell(T('foodType'), I.label(lang, 'diets', profile.diet))}${cell(T('ideal'), `${t.idealWeight[0]}–${t.idealWeight[1]} kg`)}${cell(T('mobile'), profile.phone)}</tr>
        <tr><th>${esc(T('conditions'))}</th><td colspan="5">${r.length ? esc(r.join(', ')) : esc(T('none'))}</td></tr>
        ${excl ? `<tr><th>${esc(T('excluded'))}</th><td colspan="5">${esc(excl)}</td></tr>` : ''}
        ${likes ? `<tr><th>${esc(T('likes'))}</th><td colspan="5">${esc(likes)}</td></tr>` : ''}
        ${profile.notes ? `<tr><th>${esc(T('notes'))}</th><td colspan="5">${esc(profile.notes)}</td></tr>` : ''}
      </table>` : `
      <table class="ps-grid">
        <tr>${cell(T('plan'), planLabel)}${cell(T('foodType'), I.label(lang, 'diets', profile.diet))}${cell(T('goal'), I.label(lang, 'goals', t.goal))}</tr>
        <tr><th>${esc(T('cuisine'))}</th><td colspan="5">${esc(cuisineText(lang))}</td></tr>
        ${r.length || excl ? `<tr><th>${esc(T('suitable'))}</th><td colspan="5">${esc([...r, excl].filter(Boolean).join(', '))}</td></tr>` : ''}
      </table>`;

    const dayTable = (d, di) => `
      <table class="ps-day">
        <caption>${esc(T('day'))} ${di + 1} · ${esc(I.dayName(lang, d.day))}</caption>
        <tbody>
          ${d.meals.map((e) => `<tr>
            <th class="c-meal">${esc(I.label(lang, 'slots', e.slot))}<small>${esc(time12(e.time))}</small></th>
            <td>${e.meal && e.meal.items.length ? e.meal.items.map((i) => `${esc(itemName(i, lang))} <b>${esc(itemQty(i, lang))}</b>`).join(' · ') : '&nbsp;'}</td>
            <td class="c-kcal">${e.meal && e.meal.items.length ? e.meal.kcal : ''}</td>
          </tr>`).join('')}
        </tbody>
        <tfoot><tr><td colspan="2">${esc(T('total'))} · ${esc(T('protein'))} ${d.totals.p} g · ${esc(T('carbs'))} ${d.totals.c} g · ${esc(T('fat'))} ${d.totals.f} g</td><td class="c-kcal">${d.totals.kcal}</td></tr></tfoot>
      </table>`;

    const tips = tipList(t).slice(0, tipLimit);
    const picks = wl ? P.weightLossPicks(DB.FOODS, profile, 10).map((f) => I.foodName(lang, f.name)) : [];

    sheet.innerHTML = `
      <div class="ps-page"><div class="ps-inner">
        <header class="ps-head">
          <img src="${BRAND.logo}" alt="${esc(BRAND.company)}">
          <div class="ps-title">
            <h1>${esc(T(profile.travel ? 'titleTravel' : 'title'))}</h1>
            <div class="ps-plan">${esc(planLabel)}</div>
            <div class="ps-web">${esc(BRAND.website)}</div>
          </div>
        </header>
        ${info}
        <div class="ps-targets">
          <div><b>${num(t.calories)}</b>${esc(T('kcalDay'))}</div>
          <div><b>${t.protein} g</b>${esc(T('protein'))} ${pct.p}%</div>
          <div><b>${t.carbs} g</b>${esc(T('carbs'))} ${pct.c}%</div>
          <div><b>${t.fat} g</b>${esc(T('fat'))} ${pct.f}%</div>
          <div><b>${t.waterL} L</b>${esc(T('water'))}</div>
          <div><b>${t.fibre} g+</b>${esc(T('fibre'))}</div>
        </div>
        ${plan.days.slice(0, split).map((d, i) => dayTable(d, i)).join('')}
      </div></div>
      <div class="ps-page"><div class="ps-inner">
        ${plan.days.slice(split).map((d, i) => dayTable(d, i + split)).join('')}
        <div class="ps-notes">
          <div>
            <h3>${esc(T('guidelines'))}</h3>
            <ul>${tips.map((x) => `<li>${esc(I.tipText(lang, x))}</li>`).join('')}</ul>
          </div>
          <div>
            <h3>${esc(T('avoid'))}</h3>
            <ul>${P.avoidList(profile).map((x) => `<li>${esc(I.avoidText(lang, x))}</li>`).join('')}</ul>
            ${picks.length ? `<h3 class="mt">${esc(T('wl'))}</h3><p class="ps-wl">${picks.map(esc).join(' · ')}</p>` : ''}
          </div>
        </div>
        <div class="ps-end">
          <div>${profile.dietitian ? `${esc(T('preparedBy'))}: <b>${esc(profile.dietitian)}</b>${profile.qualification ? ', ' + esc(profile.qualification) : ''} · ` : ''}${esc(BRAND.company)}</div>
          <div class="ps-disclaimer">${esc(T('computer'))} ${esc(T('portions'))}</div>
        </div>
      </div></div>`;
  }

  /** Fit each page into one A4 sheet by scaling type down; drop optional notes last. */
  function fitPages() {
    let ok = true;
    $$('.ps-page', sheet).forEach((page) => {
      const inner = $('.ps-inner', page);
      let s = 1;
      page.style.setProperty('--s', s);
      while (inner.scrollHeight > page.clientHeight + 1 && s > 0.66) {
        s = Math.round((s - 0.03) * 100) / 100;
        page.style.setProperty('--s', s);
      }
      if (inner.scrollHeight > page.clientHeight + 1) ok = false;
    });
    return ok;
  }

  function renderPrint(mode) {
    const lang = L();
    const footer = [BRAND.company, BRAND.website, profile.dietitianPhone].filter(Boolean).join('  ·  ');
    let pageStyle = document.getElementById('ps-page-style');
    if (!pageStyle) {
      pageStyle = document.createElement('style');
      pageStyle.id = 'ps-page-style';
      document.head.appendChild(pageStyle);
    }
    pageStyle.textContent = `@page { @bottom-left { content: ${JSON.stringify(footer)}; font: 7pt system-ui, sans-serif; color: #7d6f66; }
      @bottom-right { content: ${JSON.stringify(I.t(lang, 'page') + ' ')} counter(page) " / 2"; font: 7pt system-ui, sans-serif; color: #7d6f66; } }`;

    sheet.classList.add('measuring');
    const allTips = tipList(plan.targets).length;
    let done = false;
    for (const split of [4, 3]) {
      for (let tipLimit = allTips; tipLimit >= 3 && !done; tipLimit--) {
        for (const wl of showWl() ? [true, false] : [false]) {
          buildSheet(mode, split, tipLimit, wl);
          if (fitPages()) { done = true; break; }
        }
      }
      if (done) break;
    }
    sheet.classList.remove('measuring');
  }

  function fileTitle(mode) {
    const slug = (s) => s.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const who = mode === 'named' && profile.name ? slug(profile.name) : 'Generic';
    return ['Hindivine', profile.travel ? 'Travel-Diet-Chart' : 'Diet-Chart', who, L().toUpperCase()].join('_');
  }

  function iosHandler(name) {
    const h = window.webkit && window.webkit.messageHandlers;
    return h && h[name] ? h[name] : null;
  }

  function printChart(mode) {
    renderPrint(mode);
    const title = fileTitle(mode);
    if (window.AndroidBridge) return window.AndroidBridge.print(title);
    if (iosHandler('hindivinePrint')) return iosHandler('hindivinePrint').postMessage(title);
    const prev = document.title;
    document.title = title; // default PDF file name
    window.addEventListener('afterprint', () => { document.title = prev; }, { once: true });
    window.print();
  }

  function toCsv() {
    const lang = L();
    const rows = [['Day', 'Time', 'Meal', 'Items', `Items (${I.LANGS[lang].name})`, 'kcal', 'Protein (g)', 'Carbs (g)', 'Fat (g)']];
    plan.days.forEach((d) => d.meals.forEach((e) => {
      const m = e.meal;
      rows.push([d.day, time12(e.time), e.label,
        m ? m.items.map((i) => `${i.name} (${i.text})`).join('; ') : '',
        m ? m.items.map((i) => `${itemName(i, lang)} (${itemQty(i, lang)})`).join('; ') : '',
        m ? m.kcal : '', m ? m.p : '', m ? m.c : '', m ? m.f : '']);
    }));
    const csv = '﻿' + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const fileName = fileTitle('named') + '.csv';
    if (iosHandler('hindivineSave')) return iosHandler('hindivineSave').postMessage({ name: fileName, content: csv });
    if (window.AndroidBridge) return window.AndroidBridge.saveFile(fileName, 'text/csv', csv);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ── Persistence & start ──────────────────────────────────────────
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* storage unavailable */ }
  }
  function load(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; }
  }
  function savePlan() { save(STORE_KEY, { profile, plan, activeDay }); }

  const savedDietitian = load(DIETITIAN_KEY);
  if (savedDietitian) writeForm(savedDietitian);
  const saved = load(STORE_KEY);
  if (saved && saved.profile && saved.plan && P.PLANS[saved.profile.plan]) {
    profile = saved.profile;
    plan = saved.plan;
    activeDay = Math.min(saved.activeDay || 0, 6);
    writeForm(profile);
  }
  show(location.hash.slice(1) || 'home');

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is optional */ });
  }
})();
