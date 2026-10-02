/* The Prime Fit — dashboard, step-by-step chart wizard, patients, saved charts, recipes. */
(function () {
  const P = window.Planner;
  const DB = window.FOODDB;
  const I = window.I18N;
  const RC = window.RECIPES;
  const ING = window.INGREDIENTS;
  const IC = window.ICONS;
  const BRAND = { company: 'The Prime Fit', website: 'www.theprimefit.in', phone: '+91 92051 36303', logo: 'img/logo.jpg' };
  const CURRENT_KEY = 'primefit.chart.v5';
  const LEGACY_KEY = 'primefit.chart.v3';
  const DIETITIAN_KEY = 'primefit.dietitian';
  const DIETITIAN_FIELDS = ['dietitian', 'qualification', 'dietitianPhone'];
  const ALLERGIES = { gluten: 'Gluten', dairy: 'Dairy / lactose', nuts: 'Nuts & peanuts', soy: 'Soy', egg: 'Egg', fish: 'Fish / seafood' };
  const KCAL_PRESETS = [1000, 1200, 1400, 1500, 1600, 1800, 2000, 2200, 2500];
  const PROTEIN_PRESETS = [40, 50, 60, 70, 80, 100, 120, 150];
  const WATER_PRESETS = [2, 2.5, 3, 3.5, 4];
  const STEPS = ['s1', 's2', 's3', 's4', 's5'];
  const TOP = ['home', 'patients', 'charts', 'recipes', 'library', 'explore', 'upload', 'settings'];
  const SCREENS = [...TOP, ...STEPS, 'chart', 'patient', 'recipe'];

  let storage;
  try { storage = window.localStorage; storage.getItem('x'); } catch (_) { storage = window.STORE.memoryStorage(); }
  const store = window.STORE.createStore(storage, P, DB);
  store.syncFoods(); // the dietitian's own foods join the food database

  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const form = $('#profile-form');
  const result = $('#result');
  const sheet = $('#print-sheet');
  const editor = $('#editor');
  const rdialog = $('#rdialog');
  const actionSheet = $('#sheet');

  let profile = null;
  let plan = null;
  let meta = { id: null, week: 1, parent: null };
  let activeDay = 0;
  let edit = null;
  let current = 'home';
  let pendingAvoid = null; // food names from an uploaded (non-Prime Fit) chart
  let viewPatient = null;
  let viewRecipe = null;
  let servings = 1;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (n) => Number(n).toLocaleString('en-IN');
  /** Run fn once typing pauses (search boxes that re-render long lists). */
  const debounce = (fn, ms) => { let t = null; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms || 140); }; };
  const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  // Line icons in the brand colors (replace emoji in menus, tiles and tabs).
  const UI = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    charts: '<rect x="5" y="3.5" width="14" height="17.5" rx="2"/><path d="M9 3.5h6v3H9zM8.5 11h7M8.5 14.5h7M8.5 18h4"/>',
    upload: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
    recipes: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 7c0-1.5 1-1.5 1-3M12 7c0-1.5 1-1.5 1-3M16 7c0-1.5 1-1.5 1-3"/>',
    foods: '<path d="M12 21c-5 0-8-3.5-8-8 0-3 2-5 4.5-5 1.5 0 2.5.7 3.5.7s2-.7 3.5-.7C18 8 20 10 20 13c0 4.5-3 8-8 8z"/><path d="M12 8.7c0-2.5 1.2-4.2 3.5-5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    clinic: '<path d="M4 21V7l8-4 8 4v14"/><path d="M10 21v-5h4v5M12 8v5M9.5 10.5h5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17M8 14h3M8 17h6"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2z"/><path d="M4 20a2 2 0 0 0 2 2h13v-4M8 7h7"/>',
    printer: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20.5 20.5l-4.8-4.8M8.5 11h5M11 8.5v5"/>',
  };
  const ui = (k) => svg(UI[k]);
  const ICON = {
    edit: svg('<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M14 6l4 4"/>'),
    swap: svg('<path d="M4 7h13l-3-3M20 17H7l3 3"/>'),
    lock: svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    unlock: svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>'),
    minus: svg('<path d="M6 12h12"/>'),
    plus: svg('<path d="M12 6v12M6 12h12"/>'),
    trash: svg('<path d="M5 7h14M10 11v6M14 11v6M7 7l1 13h8l1-13M9 7V4h6v3"/>'),
    chev: svg('<path d="M9 5l7 7-7 7"/>'),
    print: svg('<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>'),
    book: svg('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 7h6"/>'),
  };
  const chip = (value, label, pressed) => `<button type="button" class="chip" data-value="${esc(value)}" aria-pressed="${!!pressed}">${esc(label)}</button>`;
  const options = (entries, selected) => Object.entries(entries)
    .map(([k, v]) => `<option value="${esc(k)}"${k === selected ? ' selected' : ''}>${esc(typeof v === 'string' ? v : v.label || v.name)}</option>`).join('');
  const dateText = (ms) => new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const foodById = (id) => (id == null ? null : DB.FOODS[id]);
  // Dishes with a recipe: built-in recipes plus the dietitian's own (refreshed when foods or recipes change).
  let dishByName = {};
  let DISHES = [];
  let ownRecipes = {};
  function refreshFoods() {
    ownRecipes = store.listRecipes();
    dishByName = {};
    DB.FOODS.forEach((f) => { if (!f.ingKey && (f.recipe || ownRecipes[f.name])) dishByName[f.name] = f; });
    DISHES = DB.FOODS.filter((f) => dishByName[f.name] === f);
    // Local names typed for the dietitian's foods are used on non-English charts.
    if (window.FOOD_HI) DB.FOODS.slice(DB.BUILTIN).forEach((f) => { if (f.hi && !window.FOOD_HI[f.name]) window.FOOD_HI[f.name] = f.hi; });
    const sug = $('#food-suggest');
    if (sug) sug.innerHTML = DB.FOODS.filter((f) => !f.ingKey).map((f) => `<option value="${esc(f.name)}">${esc(f.hi)}</option>`).join('');
    const mine = DB.FOODS.length - DB.BUILTIN;
    $$('.my-foods-count').forEach((el) => { el.textContent = mine; el.hidden = !mine; });
    if ($('#my-foods-count')) $('#my-foods-count').textContent = mine;
  }
  const myFoods = () => DB.FOODS.slice(DB.BUILTIN);
  // Generated library recipes (recipegen.js) opened or printed from the Foods & Recipes library.
  const extraDish = {};
  const dishOf = (name) => dishByName[name] || extraDish[name] || null;
  /** A food-like record for a generated recipe, so the recipe view and A4 recipe pages can show it. */
  function genDish(r) {
    if (!extraDish[r.name]) {
      const m = String(r.serving).match(/^(\d+(?:\.\d+)?)\s+(.*)$/);
      extraDish[r.name] = { id: null, name: r.name, hi: '', qty: m ? Number(m[1]) : 1, unit: m ? m[2] : r.serving, kcal: r.kcal, p: r.p, c: r.c, f: r.f, diet: r.diet, region: r.region, roles: [], allergens: r.allergens, flags: [], gen: r };
    }
    return extraDish[r.name];
  }
  const iconOf = (item) => IC.foodIcon(foodById(item.fid) || { name: item.name, roles: [] });

  // ── Build controls ───────────────────────────────────────────────
  $('#plan').innerHTML = options(P.PLANS, 'weight_loss');
  $('#activity').innerHTML = options(P.ACTIVITY, 'light');
  $('#travel').innerHTML = options(P.TRAVEL, 'mixed');
  $('#chart-lang').innerHTML = options(I.LANGS, 'en');
  $('#chart-lang2').innerHTML = '<option value="">None</option>' + options(I.LANGS, '');
  $('#start-day').innerHTML = P.DAY_NAMES.map((d) => `<option value="${d}">${d}</option>`).join('');
  $('#diet-seg').innerHTML = Object.entries(P.DIETS).map(([k, v]) => `<button type="button" data-value="${k}" aria-pressed="${k === 'veg'}">${esc(v)}</button>`).join('');
  $('#kcal-chips').innerHTML = chip('', 'Auto', true) + KCAL_PRESETS.map((k) => chip(k, num(k))).join('');
  $('#protein-chips').innerHTML = chip('', 'Auto', true) + PROTEIN_PRESETS.map((g) => chip(g, `${g} g`)).join('');
  $('#water-chips').innerHTML = chip('', 'Auto', true) + WATER_PRESETS.map((l) => chip(l, `${l} L`)).join('');
  $('#mix-chips').innerHTML = chip('', 'None', true) + Object.entries(P.MIXES).map(([k, v]) => chip(k, v.label)).join('');
  $('#shake-powder').innerHTML = options(P.PROTEIN_POWDERS, 'whey_iso');
  $('#shake-with').innerHTML = options(P.SHAKE_WITH, 'water');
  $('#shake-slot').innerHTML = options(P.SHAKE_SLOTS, 'auto');
  $('#days-chips').innerHTML = [1, 2, 3, 4, 5, 6, 7].map((n) => chip(n, n === 1 ? '1 day' : `${n} days`, n === 7)).join('');
  $('#condition-chips').innerHTML = Object.entries(P.CONDITIONS).map(([k, v]) => chip(k, v)).join('');
  $('#region-chips').innerHTML = Object.entries(P.REGIONS).map(([k, v]) => chip(k, v.label)).join('');
  $('#exclude-chips').innerHTML = Object.entries(P.EXCLUDES).map(([k, v]) => chip(k, `No ${v.label.toLowerCase()}`)).join('');
  $('#allergy-chips').innerHTML = Object.entries(ALLERGIES).map(([k, v]) => chip(k, v)).join('');
  $('#times').innerHTML = Object.entries(P.SLOTS).map(([k, s]) => `<label>${IC.slotIcon(k)} ${esc(s.label)}<input type="time" name="time_${k}" value="${s.time}"></label>`).join('');
  refreshFoods();

  const REGION_LABEL = { IN: 'Pan-Indian', ...Object.fromEntries(Object.entries(P.REGIONS).map(([k, v]) => [k, v.label])) };
  const CAT_OPTIONS = '<option value="">All categories</option>' + Object.entries(P.CATEGORIES).map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`).join('');
  const DIET_OPTIONS = '<option value="">All</option><option value="vegan">Vegan</option><option value="veg">Vegetarian</option><option value="egg">Egg</option><option value="nonveg">Non-veg</option>';
  $('#lib-category').innerHTML = CAT_OPTIONS;
  $('#editor-category').innerHTML = CAT_OPTIONS;
  $('#rc-category').innerHTML = CAT_OPTIONS.replace(/<option value="ingredients">[^<]*<\/option>/, '');
  $('#lib-region').innerHTML = '<option value="">All cuisines</option>' + Object.entries(REGION_LABEL).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
  $('#lib-diet').innerHTML = DIET_OPTIONS;
  $('#rc-diet').innerHTML = DIET_OPTIONS;

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
    $$(`[data-single="${name}"] .chip`).forEach((c) => c.setAttribute('aria-pressed', String(String(c.dataset.value) === String(value == null ? '' : value))));
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
  const PATIENT_KEYS = ['name', 'patientId', 'phone', 'age', 'sex', 'heightCm', 'weightKg', 'notes'];

  function readForm() {
    const fd = new FormData(form);
    const text = (k) => (fd.get(k) || '').trim();
    const times = {};
    Object.keys(P.SLOTS).forEach((k) => { times[k] = fd.get('time_' + k) || P.SLOTS[k].time; });
    const chartType = fd.get('chartType');
    const mixKey = fd.get('mixKey') || '';
    const lang = fd.get('chartLang') || 'en';
    const lang2 = fd.get('chartLang2') || '';
    return {
      patientRef: text('patientRef') || null,
      name: text('name'), patientId: text('patientId'), phone: text('phone'),
      age: Number(fd.get('age')) || 0, sex: fd.get('sex') || '', heightCm: Number(fd.get('heightCm')) || 0, weightKg: Number(fd.get('weightKg')) || 0,
      notes: text('notes'),
      chartType, travel: chartType === 'travel' ? fd.get('travel') : '',
      plan: fd.get('plan'), weightGoal: fd.get('weightGoal'), activity: fd.get('activity'),
      kcalTarget: Number(fd.get('kcalTarget')) || 0, proteinTarget: Number(fd.get('proteinTarget')) || 0, waterL: Number(fd.get('waterL')) || 0,
      conditions: multi('conditions'),
      diet: fd.get('diet'), mixKey, mix: mixKey && P.MIXES[mixKey] ? [...P.MIXES[mixKey].mix] : [],
      regions: multi('regions'), excludes: multi('excludes'), allergies: multi('allergies'),
      likes: [...tagState.likes], dislikes: [...tagState.dislikes],
      preferWl: fd.get('preferWl') === 'on',
      shakeOn: fd.get('shakeOn') === 'on', shakePowder: fd.get('shakePowder') || 'whey_iso', shakeScoops: Number(fd.get('shakeScoops')) || 1,
      shakeWith: fd.get('shakeWith') || 'water', shakeSlot: fd.get('shakeSlot') || 'auto',
      days: Number(fd.get('days')) || 7,
      chartLang: lang, chartLang2: lang2 === lang ? '' : lang2, startDay: fd.get('startDay') || 'Monday',
      meals: Number(fd.get('meals')), earlyDrink: fd.get('earlyDrink') === 'on', times,
      dietitian: text('dietitian'), qualification: text('qualification'), dietitianPhone: text('dietitianPhone'),
      recipes: [],
    };
  }

  function writeForm(p) {
    Object.entries(p).forEach(([key, val]) => {
      if (['conditions', 'regions', 'excludes', 'allergies'].includes(key)) return setMulti(key, val);
      if (key === 'likes' || key === 'dislikes') { tagState[key] = [...(val || [])]; return renderTags(key); }
      if (key === 'times') return Object.entries(val || {}).forEach(([k, t]) => { if (form.elements['time_' + k]) form.elements['time_' + k].value = t; });
      if (key === 'sex' || key === 'diet' || key === 'chartType') return setSeg(key, val || '');
      const el = form.elements[key];
      if (!el || !el.type) return;
      if (el.type === 'checkbox') el.checked = !!val;
      else el.value = val === 0 ? '' : (val == null ? '' : val);
    });
    if (p.travel) form.elements.travel.value = p.travel;
    setSingleChip('kcalTarget', p.kcalTarget || '');
    setSingleChip('proteinTarget', p.proteinTarget || '');
    setSingleChip('waterL', p.waterL || '');
    setSingleChip('mixKey', p.mixKey || '');
    setSingleChip('days', p.days || 7);
    if (!p.days) form.elements.days.value = 7;
    $('#shake-opts').hidden = !form.elements.shakeOn.checked;
  }

  // ── Protein shake option (step 3) ───────────────────────────────
  const shakeSlotsOf = (p) => [...(p.earlyDrink ? ['early'] : []), ...Object.keys(P.SPLITS[p.meals] || P.SPLITS[5])];
  function shakeText(p, sh) {
    const s = sh || P.planShake(DB, p, shakeSlotsOf(p));
    if (!s || !s.powder) return 'Not suitable for this patient';
    const scoops = s.scoops === 1 ? '1 scoop' : `${P.formatQty(s.scoops)} scoops`;
    return `${P.PROTEIN_POWDERS[s.powder].label} · ${scoops} in ${P.SHAKE_WITH[s.with].label.toLowerCase()} · ${(P.SLOTS[s.slot] || {}).label || s.slot}`;
  }
  function syncShake() {
    const p = readForm();
    $('#shake-opts').hidden = !p.shakeOn;
    if (!p.shakeOn) return;
    const sh = P.planShake(DB, p, shakeSlotsOf(p));
    const food = sh && sh.powder ? DB.FOODS.find((f) => f.name === P.PROTEIN_POWDERS[sh.powder].food) : null;
    $('#shake-note').innerHTML = (food ? `<b>${esc(shakeText(p, sh))}</b><br>1 scoop (${P.PROTEIN_POWDERS[sh.powder].scoopG} g) ≈ ${food.kcal} kcal · ${food.p} g protein — typical label values; check the brand.` : '')
      + (sh && sh.note ? `<br><span class="warn-text">${esc(sh.note)}</span>` : '')
      + '<br>The shake\'s calories come out of its meal; veg / vegan diets and milk or soy allergy are respected.';
  }


  function clearPatientFields() {
    PATIENT_KEYS.forEach((k) => { if (k !== 'sex' && form.elements[k]) form.elements[k].value = ''; });
    setSeg('sex', 'female');
    form.elements.patientRef.value = '';
  }

  function validate(p, step) {
    if (!step || step === 's1') {
      if (p.age && !(p.age >= 14 && p.age <= 90)) return 'Age must be between 14 and 90 (or leave it blank).';
      if (p.heightCm && !(p.heightCm >= 120 && p.heightCm <= 230)) return 'Height must be between 120 and 230 cm (or leave it blank).';
      if (p.weightKg && !(p.weightKg >= 30 && p.weightKg <= 250)) return 'Weight must be between 30 and 250 kg (or leave it blank).';
    }
    if (!step || step === 's2') {
      if (P.PLANS[p.plan].femaleOnly && p.sex === 'male') return `${P.PLANS[p.plan].label} is only for female patients.`;
    }
    return '';
  }

  function onFormChange() {
    const p = readForm();
    if (current === 's1') liveBmi(p);
    if (current === 's2') liveTargets(p);
    if (current === 's3') syncShake();
  }
  form.addEventListener('input', onFormChange);
  form.addEventListener('submit', (e) => e.preventDefault());

  function liveBmi(p) {
    const box = $('#bmi-live');
    if (!(p.heightCm > 0 && p.weightKg > 0)) { box.textContent = ''; return; }
    const t = P.computeTargets({ ...p, plan: 'balanced' });
    box.innerHTML = `<b>BMI ${t.bmi}</b> · ${t.bmiCategory} · ideal ${t.idealWeight[0]}–${t.idealWeight[1]} kg`;
  }
  function liveTargets(p) {
    if (validate(p, 's1')) return;
    const t = P.computeTargets(p);
    $('#target-live').innerHTML = `This chart: <b>${num(t.calories)} kcal</b> · <b>${t.protein} g protein</b> · <b>${t.waterL} L water</b> · ${esc(P.GOALS[t.goal].label)}${t.estimated && !t.customKcal ? '<br><span class="muted">Standard targets — add weight, height &amp; age for a personal calculation.</span>' : ''}${t.warnings.length ? `<br><span class="warn-text">${t.warnings.map(esc).join('<br>')}</span>` : ''}`;
  }

  function dietText(p, lang) {
    const l = lang || 'en';
    if (p.mixKey && P.MIXES[p.mixKey]) {
      if (l === 'en') return P.MIXES[p.mixKey].label;
      return p.mixKey.split('_').map((k) => (k === 'nonveg' ? I.label(l, 'diets', 'nonveg') : I.label(l, 'mix', k))).join(' + ');
    }
    return l === 'en' ? P.DIETS[p.diet] : I.label(l, 'diets', p.diet);
  }

  function review() {
    const p = readForm();
    const t = P.computeTargets(p);
    const row = (k, v) => (v ? `<div><span>${k}</span><b>${esc(v)}</b></div>` : '');
    const likes = p.likes.join(', ');
    const avoid = [...p.excludes.map((k) => 'No ' + P.EXCLUDES[k].label.toLowerCase()), ...p.dislikes].join(', ');
    const days = P.planDays(p.startDay, p.days);
    $('#review').innerHTML = `<h3>Review</h3><div class="review-grid">
      ${row('Patient', p.name || 'Generic chart')}
      ${row('Diet', P.PLANS[p.plan].label + (p.travel ? ' · ' + P.TRAVEL[p.travel] : ''))}
      ${row('Target', `${num(t.calories)} kcal · ${t.protein} g protein · ${t.waterL} L water`)}
      ${row('Food type', dietText(p))}
      ${row('Likes', likes)}
      ${p.shakeOn ? row('Protein shake', shakeText(p)) : ''}
      ${row('Avoid', avoid)}
      ${row('Language', I.LANGS[p.chartLang].name + (p.chartLang2 ? ' + ' + I.LANGS[p.chartLang2].name : ''))}
      ${row('Days', days.length === 1 ? `1 day · ${days[0].day}` : `${days.length} days · ${days[0].day} → ${days[days.length - 1].day}`)}
      ${pendingAvoid ? row('Next week', `${pendingAvoid.length} foods from the uploaded chart will be changed`) : ''}
    </div>`;
  }

  // ── Router ───────────────────────────────────────────────────────
  const TITLES = { home: 'Dashboard' };
  function show(name) {
    if (!SCREENS.includes(name)) name = 'home';
    if (name === 'chart' && !plan) name = 'home';
    if (name === 'patient' && !viewPatient) name = 'patients';
    if (name === 'recipe' && !viewRecipe) name = 'recipes';
    current = name;
    closeDrawer();
    $$('.screen').forEach((s) => { s.hidden = s.dataset.screen !== name; });
    const sec = $(`.screen[data-screen="${name}"]`);
    const stepIdx = STEPS.indexOf(name);
    const top = TOP.includes(name);
    $('#back').hidden = top;
    $('#menu').hidden = !top;
    $('#appbar-logo').hidden = name !== 'home';
    $('#appbar-text').hidden = name === 'home';
    $('#screen-title').textContent = TITLES[name] || sec.dataset.title || '';
    let sub = '';
    if (stepIdx >= 0) sub = `Step ${stepIdx + 1} of ${STEPS.length}`;
    else if (name === 'chart' && profile) sub = `${profile.name || 'Generic chart'} · Week ${meta.week || 1}`;
    $('#screen-sub').textContent = sub;
    $('#progress').hidden = stepIdx < 0;
    $('#progress-bar').style.width = `${((stepIdx + 1) / STEPS.length) * 100}%`;
    $('#step-bar').hidden = stepIdx < 0 || name === 's5';
    $('#create-bar').hidden = name !== 's5';
    $('#chart-bar').hidden = name !== 'chart';
    $('#tab-bar').hidden = !top;
    $('#go-library').hidden = name === 'explore';
    $('#step-back').textContent = stepIdx === 0 ? 'Home' : 'Back';
    document.body.dataset.screen = name;
    animateIn(sec);
    renderTabs();
    if (name === 's1') { renderPatientPick(); liveBmi(readForm()); }
    if (name === 's2') liveTargets(readForm());
    if (name === 's3') syncShake();
    if (name === 's5') review();
    if (name === 'library') renderLibrary();
    if (name === 'explore') lib.render();
    if (name === 'chart') render();
    if (name === 'home') renderHome();
    if (name === 'patients') renderPatients();
    if (name === 'patient') renderPatient();
    if (name === 'charts') renderCharts();
    if (name === 'recipes') renderRecipes();
    if (name === 'recipe') renderRecipe();
    if (name === 'settings') renderSettings();
    window.scrollTo(0, 0);
  }

  /** Cards of a screen (or list) rise in one after another; CSS animates transform/opacity only. */
  function animateIn(el) {
    if (!el) return;
    el.classList.add('entering');
    clearTimeout(el.enterTimer);
    el.enterTimer = setTimeout(() => el.classList.remove('entering'), 800);
  }

  function go(name) {
    if (name === 'admin') { location.href = 'admin/index.html#admin'; return; } // clinic admin: its own page with its own login
    if (location.hash.slice(1) === name) show(name);
    else location.hash = name;
  }
  window.addEventListener('hashchange', () => show(location.hash.slice(1)));

  $('#back').addEventListener('click', () => (history.length > 1 ? history.back() : go('home')));
  $('#go-library').addEventListener('click', () => go('explore'));
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (!b) return;
    if (b.dataset.go === 's1') newChart();
    else go(b.dataset.go);
  });
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
    toast.timer = setTimeout(() => t.classList.remove('show'), 3600);
  }

  // ── Menu ─────────────────────────────────────────────────────────
  const NAV_GROUPS = [
    ['Diet charts', [['home', 'home', 'Dashboard'], ['s1', 'plus', 'New diet chart'], ['charts', 'charts', 'Saved charts'], ['upload', 'upload', 'Upload previous chart']]],
    ['Patients', [['patients', 'users', 'Patients']]],
    ['Kitchen', [['explore', 'search', 'Foods & recipes library'], ['recipes', 'recipes', 'Recipes'], ['library', 'foods', 'Diet-chart foods']]],
    ['App', [['settings', 'settings', 'Settings & theme'], ['admin', 'clinic', 'Clinic admin']]],
  ];
  // Which menu entry is highlighted for screens that are not in the menu.
  const NAV_OF = { s1: 's1', s2: 's1', s3: 's1', s4: 's1', s5: 's1', chart: 'charts', patient: 'patients', recipe: 'recipes' };
  $('#drawer-quick').innerHTML = [['s1', 'plus', 'New chart'], ['act:addfood', 'foods', 'Add food'], ['act:addrecipe', 'recipes', 'Add recipe']]
    .map(([k, icon, label]) => `<button type="button" ${k.startsWith('act:') ? `data-act="${k.slice(4)}"` : `data-go="${k}"`}><span>${ui(icon)}</span><b>${esc(label)}</b></button>`).join('');
  $('#drawer-nav').innerHTML = NAV_GROUPS.map(([title, items]) => `<div class="nav-group"><small class="nav-title">${esc(title)}</small>${items.map(([k, icon, label]) => `<button type="button" data-go="${k}" data-nav="${k}"><span class="nav-ico">${ui(icon)}</span><span class="nav-label">${esc(label)}</span>${k === 'library' ? `<i class="nav-count my-foods-count" title="My foods"${myFoods().length ? '' : ' hidden'}>${myFoods().length}</i>` : ''}${k === 'admin' ? `<span class="nav-ext">${ICON.chev}</span>` : ''}</button>`).join('')}</div>`).join('');
  const TABS = [['home', 'home', 'Home'], ['patients', 'users', 'Patients'], ['s1', 'plus', 'New'], ['charts', 'charts', 'Charts'], ['recipes', 'recipes', 'Recipes']];
  function renderTabs() {
    const nav = NAV_OF[current] || current;
    $('#tab-bar').innerHTML = TABS.map(([k, icon, label]) => `<button type="button" class="tab${k === 's1' ? ' tab-new' : ''}" data-go="${k}" aria-current="${k === nav}"><span>${ui(icon)}</span><small>${label}</small></button>`).join('');
    $$('#drawer-nav button').forEach((b) => b.setAttribute('aria-current', String(b.dataset.nav === nav)));
  }
  let drawerTimer = null;
  function openDrawer() {
    clearTimeout(drawerTimer);
    $('#drawer').hidden = false; $('#scrim').hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('drawer-open')));
  }
  function closeDrawer() {
    if (!document.body.classList.contains('drawer-open')) { $('#drawer').hidden = true; $('#scrim').hidden = true; return; }
    document.body.classList.remove('drawer-open');
    clearTimeout(drawerTimer);
    drawerTimer = setTimeout(() => { $('#drawer').hidden = true; $('#scrim').hidden = true; }, 240);
  }
  $('#menu').addEventListener('click', openDrawer);
  $('#scrim').addEventListener('click', closeDrawer);
  $('#drawer-close').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) closeDrawer(); });
  // Actions that open a form instead of a screen (menu, dashboard, library, recipes).
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    closeDrawer();
    if (b.dataset.act === 'addfood') openFoodForm(null);
    else if (b.dataset.act === 'addrecipe') openRecipeChooser();
    else if (b.dataset.act === 'myfoods') { libState.own = true; go('library'); }
  });

  // ── Dashboard ────────────────────────────────────────────────────
  const QUICK = [
    ['s1', 'plus', 'New chart', 'Step by step', 'q-blue'],
    ['nextweek', 'calendar', 'Next week', 'Full food change', 'q-green'],
    ['upload', 'upload', 'Upload PDF', 'Read last chart', 'q-orange'],
    ['patients', 'users', 'Patients', 'History & follow-up', 'q-purple'],
    ['charts', 'charts', 'Saved charts', 'Edit or reprint', 'q-teal'],
    ['recipes', 'recipes', 'Recipes', `${DISHES.length} dishes`, 'q-red'],
    ['explore', 'search', 'Library', '9,000+ foods · 10k recipes', 'q-purple'],
    ['act:addfood', 'plus', 'Add food', 'Your own foods', 'q-green'],
    ['act:addrecipe', 'book', 'Add recipe', 'Step by step', 'q-orange'],
    ['act:myfoods', 'foods', 'My foods', 'Edit or delete', 'q-teal'],
    ['settings', 'settings', 'Settings', 'Theme & backup', 'q-grey'],
    ['admin', 'clinic', 'Clinic admin', 'Sales · OPD · Leads', 'q-brand'],
  ];
  $('#quick-grid').innerHTML = QUICK.map(([k, icon, label, sub, cls]) => `<button type="button" class="quick ${cls}" ${k === 'nextweek' ? 'id="quick-next"' : k.startsWith('act:') ? `data-act="${k.slice(4)}"` : `data-go="${k}"`}><span class="q-ico">${ui(icon)}</span><b>${esc(label)}</b><small>${esc(sub)}</small></button>`).join('');
  $('#quick-next').addEventListener('click', () => {
    if (plan) return nextWeek();
    toast('Open a saved chart (or upload last week\'s PDF) to make next week\'s chart.');
    go('charts');
  });

  function chartRow(c, opts) {
    const o = opts || {};
    const pl = P.PLANS[c.plan];
    return `<div class="row-card" data-chart="${esc(c.id)}">
      <span class="rc-avatar">${esc((c.name || 'G').trim().charAt(0).toUpperCase())}</span>
      <button type="button" class="rc-main" data-open-chart="${esc(c.id)}">
        <b>${esc(c.name || 'Generic chart')}${o.hideWeek ? '' : ` <i class="wk">Week ${c.week || 1}</i>`}</b>
        <small>${esc(pl ? pl.label : c.plan)} · ${num(c.kcal)} kcal · ${c.protein} g protein · ${c.days || 7} ${c.days === 1 ? 'day' : 'days'}</small>
        <small class="date">${o.hideWeek ? `Week ${c.week || 1} · ` : ''}${dateText(c.updated)}</small>
      </button>
      <div class="rc-acts">
        <button type="button" class="chip mini" data-next-chart="${esc(c.id)}" title="Make next week's chart">Next week</button>
        <button type="button" class="icon-btn danger" data-del-chart="${esc(c.id)}" aria-label="Delete chart">${ICON.trash}</button>
      </div>
    </div>`;
  }

  function renderHome() {
    const dt = load(DIETITIAN_KEY) || {};
    const h = new Date().getHours();
    $('#dash-greet').textContent = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    $('#dash-name').textContent = dt.dietitian || 'The Prime Fit';
    const patients = store.listPatients();
    const charts = store.listCharts();
    $('#kpis').innerHTML = [
      ['users', num(patients.length), 'Patients'], ['charts', num(charts.length), 'Charts'],
      ['recipes', num(DISHES.length), 'Recipes'], ['foods', num(DB.FOODS.length), 'Foods'],
    ].map(([i, v, l]) => `<div class="kpi"><span>${ui(i)}</span><b>${v}</b><small>${l}</small></div>`).join('');
    $('#continue-chart').hidden = !plan;
    if (plan) {
      $('#continue-title').textContent = profile.name || 'Generic chart';
      $('#continue-sub').textContent = `${P.PLANS[profile.plan].label} · Week ${meta.week || 1} · ${num(plan.targets.calories)} kcal`;
    }
    $('#recent-charts').innerHTML = charts.length ? charts.slice(0, 5).map((c) => chartRow(c)).join('') : '<div class="empty">No saved charts yet. Tap <b>New chart</b> to create the first one — every chart is saved automatically.</div>';
  }
  $('#continue-chart').addEventListener('click', () => go('chart'));

  // Chart rows (dashboard, charts list, patient page)
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-open-chart],[data-next-chart],[data-del-chart]');
    if (!b) return;
    if (b.dataset.openChart) openSavedChart(b.dataset.openChart);
    else if (b.dataset.nextChart) {
      const c = store.loadChart(b.dataset.nextChart);
      if (!c) return toast('Chart not found.');
      setCurrent(c);
      nextWeek();
    } else if (b.dataset.delChart) {
      if (!confirm('Delete this saved chart?')) return;
      store.deleteChart(b.dataset.delChart);
      if (meta.id === b.dataset.delChart) meta.id = null;
      show(current);
      toast('Chart deleted.');
    }
  });

  /** Profiles from old versions, backups or other PDFs may miss fields: fill them so nothing crashes. */
  function fixProfile(p) {
    const q = p || {};
    ['conditions', 'regions', 'excludes', 'allergies', 'likes', 'dislikes', 'recipes', 'mix'].forEach((k) => { if (!Array.isArray(q[k])) q[k] = []; });
    if (!q.times || typeof q.times !== 'object') q.times = {};
    if (!P.PLANS[q.plan]) q.plan = 'balanced';
    if (!I.LANGS[q.chartLang]) q.chartLang = 'en';
    if (q.chartLang2 && !I.LANGS[q.chartLang2]) q.chartLang2 = '';
    if (!P.DAY_NAMES.includes(q.startDay)) q.startDay = 'Monday';
    if (!P.ACTIVITY[q.activity]) q.activity = 'light';
    return q;
  }

  function setCurrent(c) {
    profile = fixProfile(c.profile);
    plan = c.plan;
    meta = { id: c.id, week: c.week || 1, parent: c.parent || null };
    activeDay = 0;
    if (!profile.recipes) profile.recipes = [];
    writeForm(profile);
  }
  function openSavedChart(id) {
    const c = store.loadChart(id);
    if (!c) return toast('Chart not found.');
    setCurrent(c);
    saveCurrent();
    go('chart');
  }

  // ── Patients ─────────────────────────────────────────────────────
  function renderPatientPick() {
    const list = store.listPatients();
    $('#patient-pick-card').hidden = !list.length;
    const sel = form.elements.patientRef.value;
    $('#patient-pick').innerHTML = '<option value="">— New patient —</option>' + list.map((p) => `<option value="${esc(p.id)}"${p.id === sel ? ' selected' : ''}>${esc(p.name)}${p.patientId ? ' · ' + esc(p.patientId) : ''}${p.phone ? ' · ' + esc(p.phone) : ''}</option>`).join('');
  }
  $('#patient-pick').addEventListener('change', (e) => {
    const p = store.getPatient(e.target.value);
    if (!p) { clearPatientFields(); return liveBmi(readForm()); }
    const last = store.listCharts(p.id)[0];
    if (last) writeForm({ ...last.profile, recipes: [] });
    const fields = {};
    PATIENT_KEYS.forEach((k) => { fields[k] = p[k]; });
    writeForm(fields);
    form.elements.patientRef.value = p.id;
    liveBmi(readForm());
    toast(last ? 'Patient and last chart preferences filled in.' : 'Patient details filled in.');
  });

  function renderPatients() {
    const q = $('#pt-search').value.trim().toLowerCase();
    const list = store.listPatients().filter((p) => !q || [p.name, p.patientId, p.phone].join(' ').toLowerCase().includes(q));
    const counts = {};
    store.listCharts().forEach((c) => { if (c.patientRef) counts[c.patientRef] = (counts[c.patientRef] || 0) + 1; });
    $('#pt-list').innerHTML = list.length ? list.map((p) => `
      <button type="button" class="row-card as-btn" data-patient="${esc(p.id)}">
        <span class="rc-avatar">${esc(p.name.charAt(0).toUpperCase())}</span>
        <span class="rc-main">
          <b>${esc(p.name)}</b>
          <small>${[p.age ? `${p.age} y` : '', p.sex ? (p.sex === 'male' ? 'Male' : 'Female') : '', p.weightKg ? `${p.weightKg} kg` : '', p.patientId, p.phone].filter(Boolean).map(esc).join(' · ') || 'No details'}</small>
          <small class="date">${counts[p.id] || 0} chart${counts[p.id] === 1 ? '' : 's'} · updated ${dateText(p.updated)}</small>
        </span>
        ${ICON.chev}
      </button>`).join('') : `<div class="empty">${q ? 'No patient matches your search.' : 'No patients yet. Patients are saved automatically when you create a chart with a patient name.'}</div>`;
  }
  $('#pt-search').addEventListener('input', debounce(() => renderPatients(), 140));
  $('#pt-list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-patient]');
    if (b) { viewPatient = b.dataset.patient; go('patient'); }
  });

  function renderPatient() {
    const p = store.getPatient(viewPatient);
    if (!p) { $('#pt-detail').innerHTML = '<div class="empty">Patient not found.</div>'; return; }
    $('#screen-title').textContent = p.name;
    const charts = store.listCharts(p.id);
    const bmi = p.heightCm && p.weightKg ? P.computeTargets({ ...p, plan: 'balanced' }) : null;
    const facts = [['Age', p.age ? `${p.age} years` : '—'], ['Sex', p.sex ? (p.sex === 'male' ? 'Male' : 'Female') : '—'], ['Height', p.heightCm ? `${p.heightCm} cm` : '—'], ['Weight', p.weightKg ? `${p.weightKg} kg` : '—'], ['BMI', bmi ? `${bmi.bmi} · ${bmi.bmiCategory}` : '—'], ['Mobile', p.phone || '—']];
    $('#pt-detail').innerHTML = `
      <div class="pt-hero">
        <span class="rc-avatar lg">${esc(p.name.charAt(0).toUpperCase())}</span>
        <div><h2>${esc(p.name)}</h2><p>${p.patientId ? 'ID ' + esc(p.patientId) + ' · ' : ''}${charts.length} saved chart${charts.length === 1 ? '' : 's'}</p></div>
      </div>
      <div class="fact-grid">${facts.map(([k, v]) => `<div><small>${k}</small><b>${esc(v)}</b></div>`).join('')}</div>
      ${p.notes ? `<div class="card soft"><b>Notes:</b> ${esc(p.notes)}</div>` : ''}
      <div class="btn-row">
        <button type="button" class="btn primary" id="pt-new">${ICON.plus} New chart</button>
        ${charts.length ? `<button type="button" class="btn" data-next-chart="${esc(charts[0].id)}">🗓️ Next week (Week ${(charts[0].week || 1) + 1})</button>` : ''}
      </div>
      <h2 class="sec-title">Diet chart history</h2>
      <div class="list">${charts.length ? charts.map((c) => chartRow(c, { hideWeek: false })).join('') : '<div class="empty">No charts yet.</div>'}</div>
      <button type="button" class="btn danger-btn" id="pt-delete">Delete patient</button>`;
    $('#pt-new').addEventListener('click', () => {
      newChart();
      const last = charts[0];
      if (last) writeForm({ ...last.profile, recipes: [] });
      const fields = {};
      PATIENT_KEYS.forEach((k) => { fields[k] = p[k]; });
      writeForm(fields);
      form.elements.patientRef.value = p.id;
    });
    $('#pt-delete').addEventListener('click', () => {
      if (!confirm(`Delete ${p.name}? Their ${charts.length} saved chart(s) will be deleted too.`)) return;
      store.deletePatient(p.id, true);
      toast('Patient deleted.');
      go('patients');
    });
  }

  function renderCharts() {
    const q = $('#ch-search').value.trim().toLowerCase();
    const list = store.listCharts().filter((c) => !q || [c.name || 'generic', P.PLANS[c.plan] ? P.PLANS[c.plan].label : ''].join(' ').toLowerCase().includes(q));
    $('#ch-list').innerHTML = list.length ? list.map((c) => chartRow(c)).join('') : `<div class="empty">${q ? 'No chart matches your search.' : 'No saved charts yet.'}</div>`;
  }
  $('#ch-search').addEventListener('input', debounce(() => renderCharts(), 140));

  // ── Chart helpers (chart language) ──────────────────────────────
  const L = () => (profile && profile.chartLang) || 'en';
  const L2 = () => (profile && profile.chartLang2 && profile.chartLang2 !== L() ? profile.chartLang2 : '');
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
  const chartTitleKey = () => (profile.travel ? 'titleTravel' : 'title');
  const titleFor = (lang) => I.t(lang, chartTitleKey()).replace('7', String(plan.days.length));

  // ── Chart screen ─────────────────────────────────────────────────
  function mealCard(entry, di, mi) {
    const m = entry.meal;
    const lang = L();
    const lang2 = L2();
    const empty = !m || !m.items.length;
    const diff = m ? m.kcal - entry.target : 0;
    const sub = [lang !== 'en' ? I.label(lang, 'slots', entry.slot) : '', lang2 && lang2 !== 'en' ? I.label(lang2, 'slots', entry.slot) : ''].filter(Boolean).join(' · ');
    return `<article class="meal-card${entry.locked ? ' locked' : ''}">
      <header>
        <span class="slot-ico">${IC.slotIcon(entry.slot)}</span>
        <div class="mc-title"><h4>${esc(entry.label)}${sub ? ` <small>${esc(sub)}</small>` : ''}</h4><span class="time">${esc(time12(entry.time))}</span></div>
        <span class="target">${entry.target} kcal</span>
      </header>
      ${empty ? `<button type="button" class="empty-meal" data-edit="${di}:${mi}">${ICON.plus} Add foods</button>` : `
      <ul class="food-items">${m.items.map((i) => {
        const dish = !i.custom && dishByName[i.name];
        const alt = [lang !== 'en' && !i.custom ? itemName(i, lang) : '', lang2 && !i.custom ? itemName(i, lang2) : ''].filter((x) => x && x !== i.name);
        return `<li><span class="fi-ico">${iconOf(i)}</span><span class="fi-name">${dish ? `<button type="button" class="link-food" data-recipe="${esc(i.name)}">${esc(lang === 'en' ? i.name : itemName(i, lang))}</button>` : esc(lang === 'en' ? i.name : itemName(i, lang))}${alt.length ? `<small>${esc([lang !== 'en' ? i.name : '', ...alt.filter((x) => x !== itemName(i, lang))].filter(Boolean).join(' · '))}</small>` : ''}</span><b>${esc(itemQty(i, lang))}</b><em>${i.kcal}</em></li>`;
      }).join('')}</ul>`}
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
    if (activeDay >= plan.days.length) activeDay = 0;
    const t = plan.targets;
    const pct = macroPct(t);
    const d = plan.days[activeDay];
    const conds = restrictionText('en');
    const n = plan.days.length;
    const recipes = profile.recipes || [];

    result.innerHTML = `
      <div class="summary">
        <div class="summary-main">
          <span class="eyebrow">${n}-Day ${profile.travel ? 'Travel Diet Chart · ' + esc(P.TRAVEL[profile.travel]) : 'Diet Chart'} · Week ${meta.week || 1}</span>
          <h2>${profile.name ? esc(profile.name) : 'Generic diet chart'}</h2>
          <p>${esc(P.PLANS[profile.plan].label)} · ${esc(dietText(profile))}</p>
          ${conds.length ? `<div class="tags">${conds.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
        </div>
        <div class="summary-kcal">
          <b>${num(t.calories)}</b><span>kcal / day${t.customKcal ? ' · custom' : ''}</span>
          <b class="sm">${t.protein} g</b><span>protein${t.customProtein ? ' · custom' : ''}</span>
        </div>
      </div>

      <div class="chart-controls card">
        <label>Language<select id="chart-lang-quick">${options(I.LANGS, L())}</select></label>
        <label>2nd language<select id="chart-lang2-quick"><option value="">None</option>${options(I.LANGS, L2())}</select></label>
        <label>Starts on<select id="start-day-quick">${P.DAY_NAMES.map((x) => `<option${x === profile.startDay ? ' selected' : ''}>${x}</option>`).join('')}</select></label>
        <label>Water / day<select id="water-quick">${['', 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((w) => `<option value="${w}"${String(w) === String(profile.waterL || '') ? ' selected' : ''}>${w ? w + ' L' : `Auto (${P.computeTargets({ ...profile, waterL: 0 }).waterL} L)`}</option>`).join('')}</select></label>
      </div>

      <div class="tiles">
        <div class="tile"><span class="tile-label">BMI</span><span class="tile-value">${t.bmi || '—'}</span><span class="tile-sub">${t.bmi ? `${t.bmiCategory} · ideal ${t.idealWeight[0]}–${t.idealWeight[1]} kg` : 'Height/weight not given'}</span></div>
        <div class="tile"><span class="tile-label">Carbs · Fat</span><span class="tile-value">${t.carbs} · ${t.fat} g</span><span class="tile-sub">${pct.c}% · ${pct.f}% energy</span></div>
        <div class="tile"><span class="tile-label">💧 Water</span><span class="tile-value">${t.waterL} L</span><span class="tile-sub">${t.customWater ? 'Custom' : 'Auto'} · fibre ${t.fibre} g+</span></div>
        <div class="tile"><span class="tile-label">Options</span><span class="tile-value">${num(plan.combos.total)}</span><span class="tile-sub">meal combinations</span></div>
      </div>
      <div class="macro-bar" role="img" aria-label="Protein ${pct.p}%, carbs ${pct.c}%, fat ${pct.f}%"><span class="seg-p" style="width:${pct.p}%"></span><span class="seg-c" style="width:${pct.c}%"></span><span class="seg-f" style="width:${pct.f}%"></span></div>
      ${t.warnings.length ? `<div class="alert">${t.warnings.map(esc).join('<br>')}</div>` : ''}

      ${n > 1 ? `<div class="days" role="tablist" style="grid-template-columns:repeat(${n}, minmax(0, 1fr))">
        ${plan.days.map((day, i) => `<button type="button" role="tab" data-day="${i}" aria-selected="${i === activeDay}"><small>Day ${i + 1}</small><b>${day.day.slice(0, 3)}</b></button>`).join('')}
      </div>` : '<div class="spacer"></div>'}
      <div class="day-head">
        <h3>Day ${activeDay + 1} · ${d.day}${L() !== 'en' ? ` <small>${esc(I.dayName(L(), d.day))}</small>` : ''}</h3>
        <div class="day-total"><b>${d.totals.kcal}</b> / ${t.calories} kcal · P ${d.totals.p} g</div>
      </div>
      <div class="meal-list">${d.meals.map((e, mi) => mealCard(e, activeDay, mi)).join('')}</div>

      <div class="card recipe-strip">
        <div class="sec-row"><h3>📖 Recipes in the PDF</h3><button type="button" class="link-btn" id="pick-recipes">${recipes.length ? 'Change' : 'Add recipes'}</button></div>
        ${recipes.length ? `<div class="tags light">${recipes.map((r) => `<span>${IC.foodIcon(dishByName[r])} ${esc(r)}</span>`).join('')}</div><p class="muted">${recipes.length} recipe${recipes.length === 1 ? '' : 's'} will be printed on A4 pages after the chart.</p>` : '<p class="muted">Add recipes of this chart\'s dishes — they print on A4 pages after the diet chart.</p>'}
      </div>
      <div class="card soft">
        <h3>Guidelines</h3>
        <ul>${tipList(t).map((x) => `<li>${esc(I.tipText('en', x))}</li>`).join('')}</ul>
      </div>
      ${showWl() ? `<div class="card soft"><h3>Smart weight-loss foods</h3><div class="tags light">${P.weightLossPicks(DB.FOODS, profile, 14).map((f) => `<span>${IC.foodIcon(f)} ${esc(f.name)}</span>`).join('')}</div></div>` : ''}`;
  }

  result.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const pair = (v) => v.split(':').map(Number);
    if (b.dataset.day) { activeDay = Number(b.dataset.day); saveCurrent(); render(); animateIn($('.meal-list', result)); }
    else if (b.dataset.edit) openEditor(...pair(b.dataset.edit));
    else if (b.dataset.recipe) openRecipeDialog(b.dataset.recipe);
    else if (b.id === 'pick-recipes') openRecipePicker();
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
    const id = e.target.id;
    if (id === 'chart-lang-quick') {
      profile.chartLang = e.target.value;
      if (profile.chartLang2 === profile.chartLang) profile.chartLang2 = '';
    } else if (id === 'chart-lang2-quick') {
      profile.chartLang2 = e.target.value === profile.chartLang ? '' : e.target.value;
    } else if (id === 'start-day-quick') {
      profile.startDay = e.target.value;
      P.planDays(profile.startDay, plan.days.length).forEach(({ day }, i) => { plan.days[i].day = day; });
    } else if (id === 'water-quick') {
      profile.waterL = Number(e.target.value) || 0;
      plan.targets = P.computeTargets(profile);
    } else return;
    writeForm({ chartLang: profile.chartLang, chartLang2: profile.chartLang2 || '', startDay: profile.startDay, waterL: profile.waterL || 0 });
    savePlan();
    render();
  });

  $('#regen').addEventListener('click', () => {
    plan = P.generatePlan(DB, profile, Math.floor(Math.random() * 1e9), { previous: plan });
    savePlan();
    render();
    toast('New plan created — locked meals were kept.');
  });
  $('#pdf-named').addEventListener('click', () => printChart('named'));
  $('#pdf-anon').addEventListener('click', () => printChart('anon'));
  $('#next-week').addEventListener('click', () => nextWeek());
  $('#more').addEventListener('click', () => openSheet([
    ['recipes', 'book', 'Add recipes to the PDF', 'Printed on A4 pages after the chart'],
    ['recipes-print', 'printer', 'Print recipes only (A4)', 'Every dish in this chart, or the ones you added'],
    ['csv', 'table', 'Export CSV', 'Open in Excel / Google Sheets'],
    ['copy', 'copy', 'Save as a copy', 'Keep this version and edit a new one'],
    ['patient', 'user', 'Patient history', 'All charts of this patient'],
  ]));

  function openSheet(items) {
    $('#sheet-body').innerHTML = items.map(([k, icon, label, sub]) => `<button type="button" class="sheet-item" data-sheet="${k}"><span class="sheet-ico">${ui(icon)}</span><span><b>${esc(label)}</b><small>${esc(sub)}</small></span></button>`).join('') + '<button type="button" class="btn ghost sheet-cancel" data-close>Cancel</button>';
    if (actionSheet.showModal) actionSheet.showModal(); else actionSheet.setAttribute('open', '');
  }
  const closeDialog = (d) => { if (d.close) d.close(); else d.removeAttribute('open'); };
  actionSheet.addEventListener('click', (e) => {
    if (e.target === actionSheet) return closeDialog(actionSheet);
    const b = e.target.closest('button');
    if (!b) return;
    closeDialog(actionSheet);
    const k = b.dataset.sheet;
    if (k === 'recipes') openRecipePicker();
    else if (k === 'recipes-print') printRecipes(profile.recipes && profile.recipes.length ? profile.recipes : chartDishes());
    else if (k === 'csv') toCsv();
    else if (k === 'copy') {
      meta = { id: null, week: meta.week, parent: meta.id };
      persistNewChart();
      toast('Saved as a new copy — you are now editing the copy.');
      render();
    } else if (k === 'patient') {
      if (!profile.patientRef) return toast('This is a generic chart (no patient name).');
      viewPatient = profile.patientRef;
      go('patient');
    }
  });

  /** Next week's chart: same patient and settings, every main food changed. */
  function nextWeek() {
    if (!plan) return;
    const prev = plan;
    const p = { ...profile, recipes: [] };
    const np = P.generatePlan(DB, p, Math.floor(Math.random() * 1e9), { avoidPrevious: prev });
    const same = Math.round(P.overlap(np, prev, DB) * 100);
    profile = p;
    plan = np;
    meta = { id: null, week: (meta.week || 1) + 1, parent: meta.id };
    activeDay = 0;
    persistNewChart();
    go('chart');
    render();
    toast(`Week ${meta.week} created — ${100 - same}% of foods changed from the previous week.`);
  }

  function chartDishes() {
    const seen = new Set();
    plan.days.forEach((d) => d.meals.forEach((e) => e.meal && e.meal.items.forEach((i) => { if (!i.custom && dishByName[i.name]) seen.add(i.name); })));
    return [...seen];
  }

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
    const opts = { blank };
    if (pendingAvoid && !blank) opts.avoidPrevious = pendingAvoid;
    plan = P.generatePlan(DB, profile, Math.floor(Math.random() * 1e9), opts);
    meta = { id: null, week: pendingAvoid ? 2 : 1, parent: null };
    if (!pendingAvoid && p.patientRef) {
      const last = store.listCharts(p.patientRef)[0];
      if (last) meta.week = (last.week || 1) + 1;
    }
    pendingAvoid = null;
    persistNewChart();
    go('chart');
    if (plan.shake && plan.shake.note) toast(plan.shake.note);
  }
  $('#generate').addEventListener('click', () => start(false));
  $('#manual-start').addEventListener('click', () => start(true));

  /** Start the wizard for a new chart (dietitian and preferences kept, patient cleared). */
  function newChart() {
    clearPatientFields();
    pendingAvoid = null;
    go('s1');
  }

  // ── Meal editor ──────────────────────────────────────────────────
  const editorFilters = { fit: true, wl: false, hp: false, indian: false, world: false, travel: false };
  const EDITOR_FILTER_LABELS = { fit: 'Fits patient', wl: 'Weight loss', hp: 'High protein', indian: 'Indian', world: 'Worldwide', travel: 'Travel' };
  $('#editor-filters').innerHTML = Object.entries(EDITOR_FILTER_LABELS).map(([k, v]) => chip(k, v, editorFilters[k])).join('');

  function openEditor(di, mi) {
    const entry = plan.days[di].meals[mi];
    edit = { di, mi, meal: JSON.parse(JSON.stringify(entry.meal || { items: [] })) };
    $('#editor-title').textContent = `${IC.slotIcon(entry.slot)} ${entry.label} · ${plan.days[di].day}`;
    $('#editor-sub').textContent = `${time12(entry.time)} · target ${entry.target} kcal, ${entry.targetP} g protein`;
    $('#apply-days').innerHTML = plan.days.length > 1 ? plan.days.map((d, i) => (i === di ? '' : chip(i, d.day.slice(0, 3)))).join('') + chip('all', 'All days') : '';
    $('.apply-days').hidden = plan.days.length < 2;
    $('#editor-q').value = '';
    renderEditor();
    renderEditorResults();
    if (editor.showModal) editor.showModal(); else editor.setAttribute('open', '');
  }
  function closeEditor() {
    edit = null;
    closeDialog(editor);
  }
  function renderEditor() {
    const m = P.recalcMeal(edit.meal);
    const entry = plan.days[edit.di].meals[edit.mi];
    $('#editor-items').innerHTML = m.items.length ? m.items.map((i, idx) => `
      <div class="ed-item">
        <div class="ed-name"><b><span class="fi-ico">${iconOf(i)}</span> ${esc(i.name)}</b><small>${i.kcal} kcal · P ${i.p} g · C ${i.c} g · F ${i.f} g</small></div>
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
  function badges(f) {
    return `${f.user ? ' <i class="badge mine">Mine</i>' : ''}${f.flags.includes('wl') ? ' <i class="badge wl">WL</i>' : ''}${P.isHighProtein(f) ? ' <i class="badge hp">HP</i>' : ''}${f.ingKey ? ' <i class="badge ing">Ingredient</i>' : ''}`;
  }
  function renderEditorResults() {
    const list = P.searchFoods(DB.FOODS, $('#editor-q').value, {
      profile: editorFilters.fit ? profile : null,
      wl: editorFilters.wl, hp: editorFilters.hp, indian: editorFilters.indian, world: editorFilters.world, travel: editorFilters.travel,
      category: $('#editor-category').value, sort: $('#editor-sort').value,
    });
    $('#editor-results').innerHTML = list.slice(0, 60).map((f) => `
      <button type="button" class="res" data-add="${f.id}">
        <span class="res-ico">${IC.foodIcon(f)}</span>
        <span class="res-text"><b>${esc(f.name)}</b><small>${esc(f.hi)} · ${esc(P.formatQty(f.qty))} ${esc(f.unit)} · ${f.kcal} kcal · P ${f.p} g${badges(f)}</small></span>
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
      const qty = m ? Number(m[1]) || 1 : 1;
      const unit = m ? m[2] || 'serving' : qtyText;
      const val = (sel) => Number($(sel).value) || 0;
      if ($('#cf-keep').checked) {
        // Saved as one of the dietitian's foods: usable in every chart, the planner and search.
        const entry = plan.days[edit.di].meals[edit.mi];
        try {
          const rec = store.saveCustomFood({ name, roles: SLOT_ROLES[entry.slot] || ['snack'], diet: dietOf(profile), region: 'IN', qty, unit, kcal: val('#cf-kcal'), p: val('#cf-protein'), c: val('#cf-carbs'), f: val('#cf-fat') });
          foodsChanged(true);
          items.push(P.makeItem(DB.FOODS.find((f) => f.user === rec.id)));
          toast(`${rec.name} saved to your food library.`);
        } catch (err) { return toast(err.message); }
      } else {
        const it = P.customItem(name, qty, unit, val('#cf-kcal'), val('#cf-protein'));
        it.per.c = val('#cf-carbs'); it.per.f = val('#cf-fat');
        items.push(P.setItemQty(it, it.qty));
      }
      ['#cf-name', '#cf-qty', '#cf-kcal', '#cf-protein', '#cf-carbs', '#cf-fat'].forEach((s) => { $(s).value = ''; });
      $('#cf-keep').checked = false;
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
  $('#editor-q').addEventListener('input', debounce(() => renderEditorResults(), 140));
  $('#editor-category').addEventListener('change', renderEditorResults);
  $('#editor-sort').addEventListener('change', renderEditorResults);
  editor.addEventListener('cancel', () => { edit = null; });

  // ── Food library ─────────────────────────────────────────────────
  const libFilters = { own: 'My foods', wl: 'Weight loss', hp: 'High protein', travel: 'Travel' };
  const libState = {};
  $('#lib-filters').innerHTML = Object.entries(libFilters).map(([k, v]) => chip(k, v)).join('');
  function renderLibrary() {
    $$('#lib-filters .chip').forEach((c) => c.setAttribute('aria-pressed', String(!!libState[c.dataset.value])));
    $('#lib-my-foods').setAttribute('aria-pressed', String(!!libState.own));
    const list = P.searchFoods(DB.FOODS, $('#lib-search').value, {
      own: libState.own, wl: libState.wl, hp: libState.hp, travel: libState.travel,
      category: $('#lib-category').value, region: $('#lib-region').value, dietExact: $('#lib-diet').value,
      maxKcal: Number($('#lib-kcal').value) || 0, sort: $('#lib-sort').value,
    });
    // The dietitian's own foods first (unless sorted).
    if (!$('#lib-sort').value) list.sort((a, b) => (b.user ? 1 : 0) - (a.user ? 1 : 0));
    const shown = list.slice(0, 240);
    const mine = myFoods().length;
    const ings = DB.FOODS.filter((f) => f.ingKey).length;
    $('#lib-count').textContent = `${num(list.length)} of ${num(DB.FOODS.length)} foods (${num(DISHES.length)} dishes with recipes · ${num(ings)} ingredients${mine ? ` · ${mine} of your own` : ''})${list.length > shown.length ? ` · showing first ${shown.length}` : ''}`;
    $('#lib-list').innerHTML = (libState.own && !mine ? `<div class="empty">You have not added any foods yet. Tap <b>Add food</b> to add your own dish, drink or item — it can then be used in every chart.</div>` : '') + shown.map((f) => `
      <div class="food-card${f.user ? ' mine' : ''}">
        <div class="fc-top"><span class="fc-ico">${IC.foodIcon(f)}</span><div><b>${esc(f.name)}</b><small class="hi">${esc(f.hi)}</small></div><i class="diet-dot ${f.diet}" title="${esc(P.DIETS[f.diet] || f.diet)}"></i></div>
        <small>${f.ingKey ? 'Ingredient · per ' : esc(REGION_LABEL[f.region] || f.region) + ' · '}${esc(P.formatQty(f.qty))} ${esc(f.unit)}${f.user ? ' · ' + esc(rolesText(f.roles)) : ''}</small>
        <div class="fc-nutri"><span><b>${f.kcal}</b> kcal</span><span>P ${f.p}</span><span>C ${f.c}</span><span>F ${f.f}</span></div>
        <div class="fc-badges">${f.user ? '<i class="badge mine">My food</i>' : ''}${f.flags.includes('wl') ? '<i class="badge wl">Weight loss</i>' : ''}${P.isHighProtein(f) ? '<i class="badge hp">High protein</i>' : ''}${f.flags.includes('tr') ? '<i class="badge tr">Travel</i>' : ''}${f.flags.includes('hgi') ? '<i class="badge warn">High GI</i>' : ''}${dishByName[f.name] === f ? `<button type="button" class="badge rcp" data-open-recipe="${esc(f.name)}">📖 Recipe</button>` : f.ingKey ? '' : `<button type="button" class="badge rcp add" data-edit-recipe="${esc(f.name)}">+ Add recipe</button>`}</div>
        ${f.user ? `<div class="fc-acts"><button type="button" class="chip mini" data-edit-food="${esc(f.user)}">${ICON.edit} Edit</button><button type="button" class="icon-btn danger" data-del-food="${esc(f.user)}" aria-label="Delete ${esc(f.name)}">${ICON.trash}</button></div>` : ''}
      </div>`).join('');
  }
  $('#lib-search').addEventListener('input', debounce(() => renderLibrary(), 140));
  ['#lib-category', '#lib-region', '#lib-diet', '#lib-kcal', '#lib-sort'].forEach((s) => $(s).addEventListener('change', renderLibrary));
  $('#lib-filters').addEventListener('click', (e) => {
    const c = e.target.closest('.chip');
    if (!c) return;
    libState[c.dataset.value] = !libState[c.dataset.value];
    renderLibrary();
  });
  $('#lib-add-food').addEventListener('click', () => openFoodForm(null));
  $('#lib-my-foods').addEventListener('click', () => { libState.own = !libState.own; renderLibrary(); });
  $('#lib-list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-edit-food],[data-del-food]');
    if (!b) return;
    if (b.dataset.editFood) return openFoodForm(store.getCustomFood(b.dataset.editFood));
    deleteFood(b.dataset.delFood);
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-open-recipe]');
    if (b) { viewRecipe = b.dataset.openRecipe; servings = 1; go('recipe'); return; }
    const r = e.target.closest('[data-edit-recipe]');
    if (r) openRecipeForm(r.dataset.editRecipe);
  });

  // ── Recipes ──────────────────────────────────────────────────────
  const ingName = (lang, x) => (lang === 'en' ? x.name : I.translit(x.hi, I.LANGS[lang].script));
  const gText = (x, g) => `${g} ${x.cat === 'drink' || /milk|water|juice/i.test(x.name) ? 'ml' : 'g'}`;
  /** "40 g" × 2 → "80 g" (only a leading number is scaled). */
  const scaleText = (q, k) => (k === 1 ? q : String(q).replace(/^(\d+(?:\.\d+)?)/, (n) => String(Math.round(Number(n) * k * 100) / 100)));

  /**
   * One recipe for display and print: the dietitian's own recipe when there is one,
   * otherwise the built-in recipe (ingredients in grams + method steps).
   */
  function recipeData(f, serves) {
    const k = serves || 1;
    const own = ownRecipes[f.name];
    const n = { kcal: f.kcal, p: f.p, c: f.c, f: f.f };
    if (own) {
      return {
        f, own: true, n, prep: own.prep, cook: own.cook, serves: own.serves || 1, tips: own.tips,
        ing: own.ing.map((x) => ({ name: x.name, qty: scaleText(x.qty, k) })), steps: own.steps.slice(),
      };
    }
    if (f.gen) {
      const g = f.gen;
      return {
        f, own: false, n, prep: `${g.prep} min`, cook: g.cook ? `${g.cook} min` : '',
        ing: g.ing.filter(([, x]) => x > 0).map(([key, x]) => ({ x: ING[key], name: ING[key].name, hi: ING[key].hi, qty: gText(ING[key], Math.round(x * k * 10) / 10) })),
        steps: window.RECIPEGEN.fullSteps(g, k),
      };
    }
    if (!f.recipe) return { f, own: false, n, ing: [], steps: [] };
    return {
      f, own: false, n,
      ing: f.recipe.ing.map(([key, g]) => ({ x: ING[key], name: ING[key].name, hi: ING[key].hi, qty: gText(ING[key], Math.round(g * k)) })),
      // Full how-to: measure → wash & chop → method → finish → serve.
      steps: RC.fullSteps(f.recipe, ING, { text: `${P.formatQty(f.qty)} ${f.unit}`, kcal: Math.round(f.kcal), p: f.p }, k),
    };
  }
  /** "First", "Then", …, "Finally" for step i of n, in the chart language. */
  const connective = (lang, i, n) => I.t(lang, i === 0 ? 'first' : i === n - 1 && n > 1 ? 'finally' : 'then');
  const ingCount = (f) => (ownRecipes[f.name] ? ownRecipes[f.name].ing.length : f.recipe ? f.recipe.ing.length : 0);

  const rcState = {};
  $('#rc-filters').innerHTML = chip('own', 'My recipes') + chip('mine', 'My foods');
  $('#rc-filters').addEventListener('click', (e) => {
    const c = e.target.closest('.chip');
    if (!c) return;
    rcState[c.dataset.value] = !rcState[c.dataset.value];
    c.setAttribute('aria-pressed', String(rcState[c.dataset.value]));
    renderRecipes();
  });
  $('#rc-add').addEventListener('click', () => openRecipeChooser());
  $('#rc-add-food').addEventListener('click', () => openFoodForm(null, { thenRecipe: true }));

  function renderRecipes() {
    let list = P.searchFoods(DISHES, $('#rc-search').value, { category: $('#rc-category').value, dietExact: $('#rc-diet').value });
    if (rcState.own) list = list.filter((f) => ownRecipes[f.name]);
    if (rcState.mine) list = list.filter((f) => f.user);
    if (!$('#rc-search').value.trim()) list.sort((a, b) => (ownRecipes[b.name] ? 1 : 0) - (ownRecipes[a.name] ? 1 : 0));
    const shown = list.slice(0, 200);
    const nOwn = Object.keys(ownRecipes).length;
    $('#rc-count').textContent = `${num(list.length)} of ${num(DISHES.length)} recipes${nOwn ? ` · ${nOwn} written by you` : ''}${list.length > shown.length ? ` · showing first ${shown.length}` : ''}`;
    $('#rc-list').innerHTML = shown.length ? shown.map((f) => `
      <button type="button" class="recipe-card${ownRecipes[f.name] ? ' mine' : ''}" data-open-recipe="${esc(f.name)}">
        <span class="rcard-ico">${IC.foodIcon(f)}</span>
        <span class="rcard-text"><b>${esc(f.name)}</b><small>${esc(f.hi)}${ownRecipes[f.name] ? `${f.hi ? ' · ' : ''}<i class="badge mine">Your recipe</i>` : ''}</small>
          <span class="rcard-meta"><i class="diet-dot ${f.diet}"></i>${f.kcal} kcal · P ${f.p} g · ${ingCount(f)} ingredient${ingCount(f) === 1 ? '' : 's'}</span></span>
      </button>`).join('') : `<div class="empty">${rcState.own || rcState.mine ? 'No recipes of your own yet. Tap <b>Add recipe</b> to write one step by step.' : 'No recipe matches your search.'}</div>`;
  }
  $('#rc-search').addEventListener('input', debounce(() => renderRecipes(), 140));
  ['#rc-category', '#rc-diet'].forEach((s) => $(s).addEventListener('change', renderRecipes));

  function recipeBody(f, serves) {
    const r = recipeData(f, serves);
    const k = serves || 1;
    const facts = [
      ['Serving', `${P.formatQty(f.qty * k)} ${f.unit}${k > 1 ? ` · ${k} servings` : ''}`],
      ...(r.prep ? [['Prep', r.prep]] : []),
      ...(r.cook ? [['Cook', r.cook]] : []),
      ...(r.own && r.serves > 1 ? [['Recipe makes', `${r.serves * k} servings`]] : []),
      ['Food type', P.DIETS[f.diet] || f.diet],
    ];
    const steps = r.steps;
    return `
      <div class="rd-nutri">
        <div><b>${Math.round(r.n.kcal * k)}</b><small>kcal</small></div>
        <div><b>${Math.round(r.n.p * k * 10) / 10} g</b><small>protein</small></div>
        <div><b>${Math.round(r.n.c * k)} g</b><small>carbs</small></div>
        <div><b>${Math.round(r.n.f * k * 10) / 10} g</b><small>fat</small></div>
      </div>
      <div class="rd-facts">${facts.map(([a, b]) => `<span><small>${esc(a)}</small><b>${esc(b)}</b></span>`).join('')}</div>
      <h3 class="rd-h">Ingredients <small>${r.ing.length}</small></h3>
      ${r.ing.length ? `<ul class="ing-list">${r.ing.map((x) => `<li><span>${x.x ? IC.foodIcon({ name: x.x.name, cat: x.x.cat, roles: [] }) + ' ' : '• '}${esc(x.name)}${x.hi ? ` <small>${esc(x.hi)}</small>` : ''}</span><b>${esc(x.qty)}</b></li>`).join('')}</ul>` : '<p class="muted">No ingredients listed.</p>'}
      <h3 class="rd-h">Method — step by step <small>${steps.length} steps</small></h3>
      <ol class="steps">${steps.map((s, i) => `<li><span class="step-no" aria-hidden="true">${i + 1}</span><div><small>${esc(I.t('en', 'step'))} ${i + 1} · ${esc(connective('en', i, steps.length))}</small><p>${esc(s)}</p></div></li>`).join('')}</ol>
      ${r.tips ? `<div class="rd-tip"><b>Tips</b><p>${esc(r.tips)}</p></div>` : ''}`;
  }

  function renderRecipe() {
    const f = dishByName[viewRecipe];
    if (!f) { $('#rc-detail').innerHTML = '<div class="empty">Recipe not found.</div>'; return; }
    $('#screen-title').textContent = f.name;
    const inChart = plan && (profile.recipes || []).includes(f.name);
    const own = !!ownRecipes[f.name];
    $('#rc-detail').innerHTML = `
      <div class="rd-hero"><span class="rd-ico">${IC.foodIcon(f)}</span><div><h2>${esc(f.name)}</h2><p>${esc([f.hi, REGION_LABEL[f.region] || ''].filter(Boolean).join(' · '))}</p>${own ? '<i class="badge mine">Your recipe</i>' : ''}${f.user ? ' <i class="badge mine">My food</i>' : ''}</div></div>
      <div class="card">
        <div class="serv"><span>Servings</span>
          <div class="stepper"><button type="button" class="icon-btn" id="sv-dec" aria-label="Fewer servings">${ICON.minus}</button><span>${servings}</span><button type="button" class="icon-btn" id="sv-inc" aria-label="More servings">${ICON.plus}</button></div>
        </div>
        ${recipeBody(f, servings)}
      </div>
      <div class="btn-row">
        <button type="button" class="btn primary" id="rd-print">${ICON.print} Print A4</button>
        ${plan ? `<button type="button" class="btn" id="rd-add">${inChart ? '✓ In chart PDF' : '📖 Add to chart PDF'}</button>` : ''}
        <button type="button" class="btn" data-edit-recipe="${esc(f.name)}">${ICON.edit} ${own ? 'Edit recipe' : 'Write my own version'}</button>
        ${own ? `<button type="button" class="btn ghost" id="rd-reset">${f.recipe ? 'Use original recipe' : 'Delete recipe'}</button>` : ''}
      </div>`;
    $('#sv-dec').addEventListener('click', () => { servings = Math.max(1, servings - 1); renderRecipe(); });
    $('#sv-inc').addEventListener('click', () => { servings = Math.min(12, servings + 1); renderRecipe(); });
    $('#rd-print').addEventListener('click', () => printRecipes([f.name], servings));
    if ($('#rd-add')) $('#rd-add').addEventListener('click', () => { toggleChartRecipe(f.name); renderRecipe(); });
    if ($('#rd-reset')) $('#rd-reset').addEventListener('click', () => {
      if (!confirm(f.recipe ? `Go back to the original recipe of ${f.name}?` : `Delete your recipe of ${f.name}?`)) return;
      store.deleteRecipe(f.name);
      foodsChanged();
      toast(f.recipe ? 'Original recipe restored.' : 'Recipe deleted.');
      if (!dishByName[f.name]) go('recipes');
    });
  }

  function toggleChartRecipe(name, on) {
    const list = profile.recipes || (profile.recipes = []);
    const has = list.includes(name);
    const want = on == null ? !has : on;
    if (want && !has) list.push(name);
    if (!want && has) list.splice(list.indexOf(name), 1);
    savePlan();
    toast(want ? `${name}: recipe added to the chart PDF.` : `${name}: recipe removed from the chart PDF.`);
  }

  function openRecipeDialog(name) {
    const f = dishByName[name];
    if (!f) return;
    $('#rd-title').textContent = `${IC.foodIcon(f)} ${f.name}`;
    $('#rd-sub').textContent = `${f.hi ? f.hi + ' · ' : ''}recipe for 1 serving${ownRecipes[name] ? ' · your recipe' : ''}`;
    $('#rd-body').innerHTML = recipeBody(f, 1);
    const inChart = (profile.recipes || []).includes(name);
    $('#rd-foot').innerHTML = `<button type="button" class="btn ghost" data-close>Close</button><button type="button" class="btn" data-rd-edit="${esc(name)}">${ICON.edit} Edit</button><button type="button" class="btn" data-rd-print="${esc(name)}">${ICON.print} Print A4</button><button type="button" class="btn primary" data-rd-toggle="${esc(name)}">${inChart ? 'Remove from PDF' : 'Add to chart PDF'}</button>`;
    if (rdialog.showModal) rdialog.showModal(); else rdialog.setAttribute('open', '');
  }

  function openRecipePicker() {
    const dishes = chartDishes();
    const chosen = new Set(profile.recipes || []);
    $('#rd-title').textContent = '📖 Recipes in the chart PDF';
    $('#rd-sub').textContent = 'Chosen recipes print on A4 pages after the diet chart.';
    const extra = [...chosen].filter((n) => !dishes.includes(n));
    $('#rd-body').innerHTML = `
      <div class="btn-row"><button type="button" class="chip" data-pick-all>Select all (${dishes.length})</button><button type="button" class="chip" data-pick-none>Clear</button></div>
      <div class="pick-list">${[...dishes, ...extra].map((n) => `<label class="pick"><input type="checkbox" value="${esc(n)}"${chosen.has(n) ? ' checked' : ''}><span>${IC.foodIcon(dishByName[n])} ${esc(n)}</span><small>${dishByName[n] ? dishByName[n].kcal + ' kcal' : ''}</small></label>`).join('')}</div>
      <p class="muted">Any other recipe can be added from the Recipes screen.</p>`;
    $('#rd-foot').innerHTML = '<button type="button" class="btn ghost" data-close>Cancel</button><button type="button" class="btn primary" data-pick-save>Save</button>';
    if (rdialog.showModal) rdialog.showModal(); else rdialog.setAttribute('open', '');
  }

  rdialog.addEventListener('click', (e) => {
    if (e.target === rdialog) return closeDialog(rdialog);
    const b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-close')) return closeDialog(rdialog);
    if (b.dataset.rdPrint) { closeDialog(rdialog); return printRecipes([b.dataset.rdPrint], 1); }
    if (b.dataset.rdEdit) { closeDialog(rdialog); return openRecipeForm(b.dataset.rdEdit); }
    if (b.dataset.rdToggle) { toggleChartRecipe(b.dataset.rdToggle); closeDialog(rdialog); return render(); }
    if (b.hasAttribute('data-pick-all') || b.hasAttribute('data-pick-none')) {
      $$('#rd-body input[type=checkbox]').forEach((c) => { c.checked = b.hasAttribute('data-pick-all'); });
      return;
    }
    if (b.hasAttribute('data-pick-save')) {
      profile.recipes = $$('#rd-body input[type=checkbox]:checked').map((c) => c.value);
      savePlan();
      closeDialog(rdialog);
      render();
      toast(profile.recipes.length ? `${profile.recipes.length} recipes will print after the chart.` : 'No recipes in the PDF.');
    }
  });

  // ── My foods & step-by-step recipes (forms) ─────────────────────
  const fdialog = $('#fdialog');
  // Planner roles, shown as the meals a food can be used in.
  const ROLE_GROUPS = [
    ['Early morning', [['early', 'Morning drink'], ['earlyadd', 'Nuts / seeds add-on']]],
    ['Breakfast', [['bf', 'Breakfast dish'], ['bfside', 'Breakfast side'], ['wbf', 'World breakfast']]],
    ['Mid-morning & evening snack', [['snack', 'Snack'], ['fruit', 'Fruit'], ['drink', 'Drink'], ['soup', 'Soup']]],
    ['Lunch & dinner', [['grain', 'Roti / rice'], ['dal', 'Dal / curry'], ['protein', 'Protein dish'], ['sabzi', 'Sabzi'], ['side', 'Salad / raita / curd'], ['wmain', 'Complete meal']]],
    ['Worldwide bowl (lunch & dinner)', [['wprotein', 'Bowl protein'], ['wcarb', 'Bowl carb'], ['wveg', 'Bowl vegetables']]],
    ['Bedtime & travel', [['bed', 'Bedtime drink'], ['tmain', 'Travel meal']]],
  ];
  const ROLE_LABEL = Object.fromEntries(ROLE_GROUPS.flatMap(([, list]) => list));
  const rolesText = (roles) => roles.map((r) => ROLE_LABEL[r] || r).join(', ');
  // Meal slot → role for a food typed into a meal and kept in the library.
  const SLOT_ROLES = { early: ['early'], breakfast: ['bf'], midmorning: ['snack'], lunch: ['wmain'], evening: ['snack'], dinner: ['wmain'], bedtime: ['bed'] };
  const dietOf = (p) => { const d = p ? P.dietOf(p).diet : 'veg'; return d === 'jain' ? 'veg' : d; };
  const FOOD_FLAGS = {
    wl: 'Weight-loss friendly', tr: 'Travel friendly', fx: 'Fixed portion (not scaled)', op: 'One-pot meal (with a side only)',
    hgi: 'High glycaemic', sweet: 'Sweet', fried: 'Fried', hsf: 'High saturated fat', hna: 'High salt', hk: 'High potassium', caf: 'Has caffeine',
  };
  const UNITS = ['serving', 'pc', 'bowl', 'katori', 'cup', 'glass', 'plate', 'slice', 'tbsp', 'tsp', 'scoop', 'g', 'ml'];
  const DIET_SHORT = { vegan: 'Vegan', veg: 'Veg', egg: 'Egg', nonveg: 'Non-veg' };

  function openDialog(d) { if (!d.open) { if (d.showModal) d.showModal(); else d.setAttribute('open', ''); } d.querySelector('.editor-body').scrollTop = 0; }

  function foodsChanged() {
    refreshFoods();
    if (plan) {
      try { plan = store.unpackPlan(store.packPlan(plan), profile); } catch (_) { /* keep the plan as it is */ }
      saveCurrent();
    }
    lib.foodsChanged();
    if (current === 'library') renderLibrary();
    else if (current === 'recipes') renderRecipes();
    else if (current === 'recipe') renderRecipe();
    else if (current === 'chart') render();
    else if (current === 'home') renderHome();
    else if (current === 'settings') renderSettings();
  }

  function deleteFood(id) {
    const f = store.getCustomFood(id);
    if (!f || !confirm(`Delete ${f.name} from your foods? Saved charts keep it as a typed item.`)) return false;
    store.deleteCustomFood(id);
    foodsChanged();
    toast(`${f.name} deleted.`);
    return true;
  }

  /** Add (rec = null) or edit one of the dietitian's foods. */
  function openFoodForm(rec, opts) {
    const o = opts || {};
    const r = rec || { roles: [], diet: 'veg', region: 'IN', qty: 1, unit: 'serving', allergens: [], flags: [] };
    const pressed = (list, k) => (list || []).includes(k);
    fdialog.dataset.kind = 'food';
    fdialog.dataset.id = rec ? rec.id : '';
    fdialog.dataset.then = o.thenRecipe ? '1' : '';
    $('#fd-title').textContent = rec ? `Edit ${rec.name}` : 'Add a food';
    $('#fd-sub').textContent = 'Your own dish, drink or item — the planner, search and every chart can use it.';
    $('#fd-body').innerHTML = `
      <div class="form-plate">
        <label>Food name<input id="ff-name" type="text" value="${esc(r.name || '')}" placeholder="e.g. Ragi dosa with peanut chutney" autocomplete="off"></label>
        <label>Local name <small>(Hindi or any language, optional — printed on non-English charts)</small><input id="ff-hi" type="text" value="${esc(r.hi || '')}" placeholder="e.g. रागी डोसा" autocomplete="off"></label>
      </div>
      <div class="form-plate">
        <span class="field-label">Use it for <small>— the meals the planner may put it in</small></span>
        ${ROLE_GROUPS.map(([title, list]) => `<div class="role-group"><small>${esc(title)}</small><div class="chips small" data-ff="roles">${list.map(([k, l]) => chip(k, l, pressed(r.roles, k))).join('')}</div></div>`).join('')}
      </div>
      <div class="form-plate">
        <span class="field-label">Food type</span>
        <div class="seg" id="ff-diet">${Object.entries(DIET_SHORT).map(([k, l]) => `<button type="button" data-value="${k}" aria-pressed="${r.diet === k}"><i class="diet-dot ${k}"></i> ${l}</button>`).join('')}</div>
        <label class="mt">Cuisine<select id="ff-region">${Object.entries(REGION_LABEL).map(([k, v]) => `<option value="${k}"${k === r.region ? ' selected' : ''}>${esc(v)}</option>`).join('')}</select></label>
      </div>
      <div class="form-plate">
        <span class="field-label">One serving</span>
        <div class="row">
          <label>Quantity<input id="ff-qty" type="number" min="0.25" step="0.25" value="${esc(r.qty)}" inputmode="decimal"></label>
          <label>Unit<select id="ff-unit">${[...new Set([...UNITS, r.unit])].map((u) => `<option${u === r.unit ? ' selected' : ''}>${esc(u)}</option>`).join('')}</select></label>
        </div>
        <div class="row four">
          <label>kcal<input id="ff-kcal" type="number" min="0" value="${r.kcal != null ? esc(r.kcal) : ''}" inputmode="decimal"></label>
          <label>Protein g<input id="ff-p" type="number" min="0" step="0.1" value="${r.p != null ? esc(r.p) : ''}" inputmode="decimal"></label>
          <label>Carbs g<input id="ff-c" type="number" min="0" step="0.1" value="${r.c != null ? esc(r.c) : ''}" inputmode="decimal"></label>
          <label>Fat g<input id="ff-f" type="number" min="0" step="0.1" value="${r.f != null ? esc(r.f) : ''}" inputmode="decimal"></label>
        </div>
        <div class="ff-check" id="ff-check"></div>
      </div>
      <div class="form-plate">
        <span class="field-label">Allergens</span>
        <div class="chips small" data-ff="allergens">${Object.entries(ALLERGIES).map(([k, v]) => chip(k, v, pressed(r.allergens, k))).join('')}</div>
        <span class="field-label mt">Flags</span>
        <div class="chips small" data-ff="flags">${Object.entries(FOOD_FLAGS).map(([k, v]) => chip(k, v, pressed(r.flags, k))).join('')}</div>
      </div>
      <p class="error" id="ff-error" hidden></p>`;
    $('#fd-foot').innerHTML = `${rec ? `<button type="button" class="btn ghost danger-text" data-ff-delete>${ICON.trash} Delete</button>` : ''}<span class="foot-gap"></span>
      <button type="button" class="btn ghost" data-close>Cancel</button>
      <button type="button" class="btn${o.thenRecipe ? ' primary' : ''}" data-ff-save="recipe">Save &amp; write recipe</button>
      ${o.thenRecipe ? '' : '<button type="button" class="btn primary" data-ff-save="food">Save food</button>'}`;
    foodCheck();
    openDialog(fdialog);
    setTimeout(() => { if (!rec) $('#ff-name').focus(); }, 60);
  }

  function readFoodForm() {
    const on = (k) => $$(`#fd-body [data-ff="${k}"] .chip[aria-pressed="true"]`).map((c) => c.dataset.value);
    const dietBtn = $('#ff-diet button[aria-pressed="true"]');
    return {
      id: fdialog.dataset.id || undefined,
      name: $('#ff-name').value, hi: $('#ff-hi').value, roles: on('roles'), diet: dietBtn ? dietBtn.dataset.value : 'veg',
      region: $('#ff-region').value, qty: $('#ff-qty').value, unit: $('#ff-unit').value,
      kcal: $('#ff-kcal').value, p: $('#ff-p').value, c: $('#ff-c').value, f: $('#ff-f').value,
      allergens: on('allergens'), flags: on('flags'),
    };
  }
  /** Live check: kcal against protein, carbs and fat (4/4/9). */
  function foodCheck() {
    const box = $('#ff-check');
    if (!box) return;
    const v = (id) => Number($(id).value) || 0;
    const fromMacros = Math.round(v('#ff-p') * 4 + v('#ff-c') * 4 + v('#ff-f') * 9);
    const kcal = v('#ff-kcal');
    if (!fromMacros && !kcal) { box.innerHTML = '<span class="muted">Enter kcal and the macros of one serving (from a label or a nutrition table).</span>'; return; }
    const off = kcal && fromMacros && Math.abs(fromMacros - kcal) > Math.max(25, kcal * 0.2);
    box.innerHTML = `Protein, carbs &amp; fat give <b>${fromMacros} kcal</b>${kcal ? ` · you entered <b>${kcal} kcal</b>` : ''}${off ? ' — <span class="warn-text">please check the numbers</span>' : ''}${!kcal && fromMacros ? ` <button type="button" class="link-btn" data-ff-use="${fromMacros}">Use ${fromMacros} kcal</button>` : ''}`;
  }

  /** "Add recipe": pick any food (or make a new one), then write its recipe. */
  function openRecipeChooser() {
    fdialog.dataset.kind = 'chooser';
    $('#fd-title').textContent = 'Add a recipe';
    $('#fd-sub').textContent = 'Choose the food, then write the ingredients and method step by step.';
    $('#fd-body').innerHTML = `
      <button type="button" class="new-food-btn" data-rch-new><span>${ui('plus')}</span><span><b>New food + recipe</b><small>A dish that is not in the library yet</small></span>${ICON.chev}</button>
      <input type="search" id="rch-q" placeholder="Search foods — e.g. poha, dal, paneer" aria-label="Search foods" autocomplete="off">
      <div class="editor-results tall" id="rch-list"></div>`;
    $('#fd-foot').innerHTML = '<button type="button" class="btn ghost" data-close>Cancel</button>';
    renderChooser();
    openDialog(fdialog);
  }
  const renderChooserSoon = debounce(() => { if ($('#rch-q')) renderChooser(); }, 120);
  function renderChooser() {
    const q = $('#rch-q').value;
    const list = P.searchFoods(DB.FOODS, q, {}).filter((f) => !f.ingKey);
    if (!q.trim()) list.sort((a, b) => (b.user ? 1 : 0) - (a.user ? 1 : 0));
    $('#rch-list').innerHTML = list.slice(0, 50).map((f) => `
      <button type="button" class="res" data-rch="${esc(f.name)}">
        <span class="res-ico">${IC.foodIcon(f)}</span>
        <span class="res-text"><b>${esc(f.name)}</b><small>${esc(f.hi)}${f.hi ? ' · ' : ''}${f.kcal} kcal${ownRecipes[f.name] ? ' <i class="badge mine">Your recipe</i>' : f.recipe ? ' <i class="badge hp">Has recipe</i>' : ' <i class="badge warn">No recipe yet</i>'}${f.user ? ' <i class="badge mine">My food</i>' : ''}</small></span>
        <span class="add">${ICON.edit}</span>
      </button>`).join('') || '<p class="muted">No food matches — create it as a new food.</p>';
  }

  // Recipe being written: { name, ing: [{name, qty}], steps: [text], prep, cook, serves, tips }
  let rform = null;
  function openRecipeForm(name) {
    const f = DB.FOODS.find((x) => x.name === name && !x.ingKey);
    if (!f) return toast('Food not found.');
    const own = store.getRecipe(name);
    if (own) rform = { name, ing: own.ing.map((x) => ({ ...x })), steps: own.steps.slice(), prep: own.prep, cook: own.cook, serves: own.serves, tips: own.tips };
    else if (f.recipe) { // start from the built-in recipe
      const d = recipeData(f, 1);
      rform = { name, ing: d.ing.map((x) => ({ name: x.name, qty: x.qty })), steps: d.steps.slice(), prep: '', cook: '', serves: 1, tips: '' };
    } else rform = { name, ing: [{ name: '', qty: '' }, { name: '', qty: '' }], steps: ['', '', ''], prep: '', cook: '', serves: 1, tips: '' };
    fdialog.dataset.kind = 'recipe';
    $('#fd-title').textContent = `${IC.foodIcon(f)} ${own ? 'Edit recipe' : 'Write recipe'} · ${f.name}`;
    $('#fd-sub').textContent = f.recipe && !own ? 'Starts from the built-in recipe — change anything; your version is used on screen and in the PDF.' : `${P.formatQty(f.qty)} ${f.unit} per serving · ${f.kcal} kcal`;
    $('#fd-foot').innerHTML = `${own ? `<button type="button" class="btn ghost danger-text" data-rf-reset>${f.recipe ? 'Use original' : `${ICON.trash} Delete`}</button>` : ''}<span class="foot-gap"></span>
      <button type="button" class="btn ghost" data-close>Cancel</button>
      <button type="button" class="btn primary" data-rf-save>Save recipe</button>`;
    renderRecipeForm();
    openDialog(fdialog);
  }
  function renderRecipeForm() {
    const r = rform;
    $('#fd-body').innerHTML = `
      <div class="form-plate">
        <div class="row three">
          <label>Prep time<input id="rf-prep" type="text" value="${esc(r.prep)}" placeholder="e.g. 10 min"></label>
          <label>Cook time<input id="rf-cook" type="text" value="${esc(r.cook)}" placeholder="e.g. 20 min"></label>
          <label>Servings<input id="rf-serves" type="number" min="1" max="50" value="${esc(r.serves || 1)}" inputmode="numeric"></label>
        </div>
      </div>
      <div class="form-plate">
        <div class="sec-row"><span class="field-label">Ingredients <small>${r.ing.length}</small></span><button type="button" class="link-btn" data-rf-add-ing>+ Add ingredient</button></div>
        <div class="ing-edit">${r.ing.map((x, i) => `
          <div class="ing-row">
            <input type="text" data-ing-name="${i}" value="${esc(x.name)}" placeholder="Ingredient, e.g. Ragi flour" aria-label="Ingredient ${i + 1}">
            <input type="text" data-ing-qty="${i}" value="${esc(x.qty)}" placeholder="Qty, e.g. 40 g" aria-label="Quantity ${i + 1}">
            <button type="button" class="icon-btn danger" data-rm-ing="${i}" aria-label="Remove ingredient ${i + 1}">${ICON.trash}</button>
          </div>`).join('')}</div>
      </div>
      <div class="form-plate">
        <div class="sec-row"><span class="field-label">Method — step by step <small>${r.steps.length} steps</small></span><button type="button" class="link-btn" data-rf-add-step>+ Add step</button></div>
        <ol class="step-edit">${r.steps.map((s, i) => `
          <li class="step-row">
            <span class="step-no" aria-hidden="true">${i + 1}</span>
            <textarea data-rstep="${i}" rows="2" placeholder="Step ${i + 1}: what to do, how long, how you know it is ready" aria-label="Step ${i + 1}">${esc(s)}</textarea>
            <div class="step-acts">
              <button type="button" class="icon-btn" data-step-up="${i}" aria-label="Move step ${i + 1} up"${i === 0 ? ' disabled' : ''}>${svg('<path d="M12 19V5M6 11l6-6 6 6"/>')}</button>
              <button type="button" class="icon-btn" data-step-down="${i}" aria-label="Move step ${i + 1} down"${i === r.steps.length - 1 ? ' disabled' : ''}>${svg('<path d="M12 5v14M6 13l6 6 6-6"/>')}</button>
              <button type="button" class="icon-btn danger" data-rm-step="${i}" aria-label="Remove step ${i + 1}">${ICON.trash}</button>
            </div>
          </li>`).join('')}</ol>
        <button type="button" class="btn ghost wide dashed" data-rf-add-step>${ICON.plus} Add step ${r.steps.length + 1}</button>
      </div>
      <div class="form-plate">
        <label>Tips <small>(optional — swaps, storage, what to serve with)</small><textarea id="rf-tips" rows="2" placeholder="e.g. Use a non-stick tawa so it needs less oil.">${esc(r.tips)}</textarea></label>
      </div>
      <p class="error" id="rf-error" hidden></p>`;
  }
  function readRecipeForm() {
    if (!rform || !$('#rf-prep')) return;
    rform.prep = $('#rf-prep').value; rform.cook = $('#rf-cook').value; rform.serves = Number($('#rf-serves').value) || 1; rform.tips = $('#rf-tips').value;
    rform.ing = rform.ing.map((x, i) => ({ name: $(`[data-ing-name="${i}"]`).value, qty: $(`[data-ing-qty="${i}"]`).value }));
    rform.steps = rform.steps.map((s, i) => $(`[data-rstep="${i}"]`).value);
  }

  fdialog.addEventListener('input', (e) => {
    if (e.target.id === 'rch-q') renderChooserSoon();
    else if (fdialog.dataset.kind === 'food' && /^ff-(kcal|p|c|f)$/.test(e.target.id)) foodCheck();
  });
  fdialog.addEventListener('click', (e) => {
    if (e.target === fdialog) return closeDialog(fdialog);
    const b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-close')) return closeDialog(fdialog);
    const kind = fdialog.dataset.kind;
    if (kind === 'chooser') {
      if (b.hasAttribute('data-rch-new')) return openFoodForm(null, { thenRecipe: true });
      if (b.dataset.rch) return openRecipeForm(b.dataset.rch);
      return;
    }
    if (kind === 'food') {
      if (b.closest('[data-ff]') && b.classList.contains('chip')) { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); return; }
      if (b.closest('#ff-diet')) { $$('#ff-diet button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); return; }
      if (b.dataset.ffUse) { $('#ff-kcal').value = b.dataset.ffUse; return foodCheck(); }
      if (b.hasAttribute('data-ff-delete')) { if (deleteFood(fdialog.dataset.id)) closeDialog(fdialog); return; }
      if (b.dataset.ffSave) {
        try {
          const rec = store.saveCustomFood(readFoodForm());
          foodsChanged();
          if (b.dataset.ffSave === 'recipe') return openRecipeForm(rec.name);
          closeDialog(fdialog);
          toast(`${rec.name} saved — it can now be used in every chart.`);
        } catch (err) {
          $('#ff-error').hidden = false;
          $('#ff-error').textContent = err.message;
          $('#ff-error').scrollIntoView({ block: 'nearest' });
        }
      }
      return;
    }
    if (kind === 'recipe' && rform) {
      readRecipeForm();
      const at = (k) => Number(b.dataset[k]);
      if (b.hasAttribute('data-rf-add-ing')) { rform.ing.push({ name: '', qty: '' }); renderRecipeForm(); return $(`[data-ing-name="${rform.ing.length - 1}"]`).focus(); }
      if (b.dataset.rmIng) { rform.ing.splice(at('rmIng'), 1); return renderRecipeForm(); }
      if (b.hasAttribute('data-rf-add-step')) { rform.steps.push(''); renderRecipeForm(); return $(`[data-rstep="${rform.steps.length - 1}"]`).focus(); }
      if (b.dataset.rmStep) { rform.steps.splice(at('rmStep'), 1); return renderRecipeForm(); }
      if (b.dataset.stepUp || b.dataset.stepDown) {
        const i = b.dataset.stepUp ? at('stepUp') : at('stepDown');
        const j = b.dataset.stepUp ? i - 1 : i + 1;
        if (j < 0 || j >= rform.steps.length) return;
        [rform.steps[i], rform.steps[j]] = [rform.steps[j], rform.steps[i]];
        renderRecipeForm();
        const moved = $(`[data-rstep="${j}"]`);
        moved.closest('.step-row').classList.add('moved');
        return moved.focus();
      }
      if (b.hasAttribute('data-rf-reset')) {
        const f = dishByName[rform.name];
        if (!confirm(f && f.recipe ? 'Go back to the original recipe?' : 'Delete this recipe?')) return;
        store.deleteRecipe(rform.name);
        closeDialog(fdialog);
        foodsChanged();
        return toast(f && f.recipe ? 'Original recipe restored.' : 'Recipe deleted.');
      }
      if (b.hasAttribute('data-rf-save')) {
        try {
          store.saveRecipe(rform.name, rform);
          const name = rform.name;
          closeDialog(fdialog);
          foodsChanged();
          toast(`Recipe saved: ${name}.`);
          if (current !== 'chart') { viewRecipe = name; servings = 1; if (current === 'recipe') renderRecipe(); else go('recipe'); }
        } catch (err) {
          $('#rf-error').hidden = false;
          $('#rf-error').textContent = err.message;
          $('#rf-error').scrollIntoView({ block: 'nearest' });
        }
      }
    }
  });
  fdialog.addEventListener('close', () => { if (fdialog.dataset.kind === 'recipe') rform = null; });

  // ── Upload previous chart (PDF) ─────────────────────────────────
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Could not load ' + src));
      document.head.appendChild(s);
    });
  }
  let pdfjsReady = null;
  function pdfjs() {
    if (!pdfjsReady) {
      // The worker script runs on the main thread (works from file:// in the Android and iOS apps).
      pdfjsReady = loadScript('vendor/pdfjs/pdf.worker.min.js').then(() => loadScript('vendor/pdfjs/pdf.min.js')).then(() => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdfjs/pdf.worker.min.js';
        return window.pdfjsLib;
      });
    }
    return pdfjsReady;
  }
  async function pdfText(buf) {
    const lib = await pdfjs();
    const doc = await lib.getDocument({ data: new Uint8Array(buf), isEvalSupported: false }).promise;
    const parts = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const tc = await page.getTextContent();
      parts.push(tc.items.map((it) => it.str + (it.hasEOL ? '\n' : '')).join(' '));
    }
    return parts.join('\n');
  }

  let uploaded = null;
  $('#pdf-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const out = $('#upload-result');
    out.innerHTML = '<div class="card"><div class="spinner"></div> Reading PDF…</div>';
    try {
      const text = await pdfText(await file.arrayBuffer());
      uploaded = store.readPdfText(text, I);
      renderUpload(file.name);
    } catch (err) {
      out.innerHTML = `<div class="alert">Could not read this PDF (${esc(err.message || err)}). Choose a diet chart PDF.</div>`;
    }
  });

  function renderUpload(fileName) {
    const out = $('#upload-result');
    const u = uploaded;
    if (u.exact) {
      const p = u.profile;
      const kcal = u.plan.targets.calories;
      out.innerHTML = `
        <div class="card ok-card">
          <div class="ok-head"><span>✅</span><div><b>The Prime Fit chart read exactly</b><small>${esc(fileName)}</small></div></div>
          <div class="review-grid">
            <div><span>Patient</span><b>${esc(p.name || 'Generic chart')}</b></div>
            <div><span>Diet</span><b>${esc(P.PLANS[p.plan] ? P.PLANS[p.plan].label : p.plan)} · ${esc(dietText(p))}</b></div>
            <div><span>Target</span><b>${num(kcal)} kcal · ${u.plan.targets.protein} g protein</b></div>
            <div><span>Week</span><b>Week ${u.week} · ${u.plan.days.length} days</b></div>
          </div>
        </div>
        <div class="btn-col">
          <button type="button" class="btn primary" id="up-next">🗓️ Generate next week (Week ${u.week + 1}) — all foods changed</button>
          <button type="button" class="btn" id="up-open">✏️ Open this chart to edit or reprint</button>
        </div>`;
      $('#up-next').addEventListener('click', () => {
        setCurrent({ id: null, week: u.week, parent: null, profile: { ...u.profile }, plan: u.plan });
        nextWeek();
      });
      $('#up-open').addEventListener('click', () => {
        setCurrent({ id: null, week: u.week, parent: null, profile: { ...u.profile }, plan: u.plan });
        persistNewChart();
        go('chart');
      });
    } else if (u.foods.length) {
      out.innerHTML = `
        <div class="card">
          <div class="ok-head"><span>🔎</span><div><b>${u.foods.length} foods found in this chart</b><small>${esc(fileName)} — not made with The Prime Fit, so patient details are not included.</small></div></div>
          <div class="tags light">${u.foods.map((n) => `<span>${IC.foodIcon(dishByName[n])} ${esc(n)}</span>`).join('')}</div>
        </div>
        <button type="button" class="btn primary wide" id="up-wizard">🗓️ Create next week's chart without these foods</button>`;
      $('#up-wizard').addEventListener('click', () => {
        newChart();
        pendingAvoid = u.foods;
        toast('Fill in the patient details — the foods of the uploaded chart will be changed.');
      });
    } else {
      out.innerHTML = '<div class="alert">No diet chart foods were found in this PDF. If it is a scanned image, type the foods into "Foods to avoid" in a new chart instead.</div>';
    }
  }

  // ── Settings & backup ────────────────────────────────────────────
  function renderSettings() {
    const dt = load(DIETITIAN_KEY) || {};
    $('#set-dietitian').value = dt.dietitian || '';
    $('#set-qualification').value = dt.qualification || '';
    $('#set-phone').value = dt.dietitianPhone || '';
    // Counting every combination is slow-ish: only redo it when the food list changes.
    const sig = DB.FOODS.length + ':' + (storage.getItem(store.KEYS.foods) || '');
    if (!renderSettings.combos || renderSettings.n !== sig) {
      renderSettings.combos = P.countCombinations(DB, { plan: 'balanced', diet: 'nonveg', cuisine: 'mix', meals: 6, earlyDrink: true });
      renderSettings.n = sig;
    }
    const combos = renderSettings.combos;
    $('#about').innerHTML = `<div class="review-grid">
      <div><span>Dishes with recipes</span><b>${num(DISHES.length)}</b></div>
      <div><span>Ingredients (searchable)</span><b>${num(DB.FOODS.length - DISHES.length)}</b></div>
      <div><span>Meal combinations</span><b>${num(combos.total)}</b></div>
      <div><span>Chart languages</span><b>${I.CODES.length}</b></div>
      <div><span>Saved patients · charts</span><b>${store.listPatients().length} · ${store.listCharts().length}</b></div>
      <div><span>My foods · my recipes</span><b>${myFoods().length} · ${Object.keys(ownRecipes).length}</b></div>
      <div><span>Foods &amp; Recipes library</span><b>${lib.counts() ? `${num(lib.counts().foods)} foods · ${num(lib.counts().recipes)} recipes` : '9,000+ foods · 10,000+ recipes'}</b></div>
      <div><span>Version</span><b>6.1</b></div>
    </div>
    <p class="muted credits">Food nutrition data from TempoLife (tempolife.app), CC-BY-4.0. USDA FoodData Central SR Legacy (public domain). Indian Food Composition Tables 2017 (NIN-ICMR; ifct2017 package, MIT). Recipe nutrition is calculated from ingredients; protein powders use typical label values.</p>`;
    renderTheme();
  }

  // ── Theme (shared with the clinic admin through localStorage) ────
  const THEMES = {
    teal: ['Prime teal', '#015B53', '#1FA38C'],
    midnight: ['Midnight', '#1E3A8A', '#3B82F6'],
    royal: ['Royal', '#5B21B6', '#C9A227'],
    emerald: ['Emerald', '#047857', '#10B981'],
    charcoal: ['Charcoal', '#2C2E2F', '#C9A227'],
    onyx: ['Onyx & gold', '#0B0B0C', '#D4AF37'],
    rose: ['Rose gold', '#9F1239', '#E8A598'],
    ocean: ['Ocean', '#0E7490', '#22D3EE'],
    sunset: ['Sunset', '#C2410C', '#F59E0B'],
    plum: ['Plum', '#6B2147', '#D18FB5'],
    sapphire: ['Sapphire', '#0F2A5F', '#60A5FA'],
    forest: ['Forest', '#14532D', '#84CC16'],
  };
  const root = document.documentElement;
  $('#theme-swatches').innerHTML = Object.entries(THEMES).map(([k, [label, a, b]]) => `<button type="button" class="swatch" data-theme-pick="${k}" role="radio" aria-label="${esc(label)}"><span class="sw" style="background:linear-gradient(135deg, ${a} 0 55%, ${b} 55% 100%)"></span><small>${esc(label)}</small></button>`).join('');
  function themeColor() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', root.dataset.scheme === 'dark' ? '#0b1213' : (THEMES[root.dataset.theme] || THEMES.teal)[1]);
  }
  function renderTheme() {
    $$('#theme-swatches .swatch').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.themePick === (root.dataset.theme || 'teal'))));
    $$('#mode-seg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === (root.dataset.mode || 'auto'))));
  }
  function setTheme(key, value) {
    try { storage.setItem(key === 'theme' ? 'primefit.theme' : 'primefit.mode', value); } catch (_) { /* not saved */ }
    root.classList.add('theme-anim');
    root.dataset[key] = value;
    if (window.primefitApplyTheme) window.primefitApplyTheme();
    themeColor();
    renderTheme();
    clearTimeout(setTheme.timer);
    setTheme.timer = setTimeout(() => root.classList.remove('theme-anim'), 450);
  }
  $('#theme-swatches').addEventListener('click', (e) => { const b = e.target.closest('[data-theme-pick]'); if (b) setTheme('theme', b.dataset.themePick); });
  $('#mode-seg').addEventListener('click', (e) => { const b = e.target.closest('[data-mode]'); if (b) setTheme('mode', b.dataset.mode); });
  // Another tab (e.g. the clinic admin) changed the theme.
  window.addEventListener('storage', (e) => {
    if (e.key === 'primefit.theme' && e.newValue && THEMES[e.newValue]) root.dataset.theme = e.newValue;
    else if (e.key === 'primefit.mode' && /^(auto|light|dark)$/.test(e.newValue || '')) { root.dataset.mode = e.newValue; if (window.primefitApplyTheme) window.primefitApplyTheme(); } else return;
    themeColor();
    renderTheme();
  });
  themeColor();
  $('#set-save').addEventListener('click', () => {
    const dt = { dietitian: $('#set-dietitian').value.trim(), qualification: $('#set-qualification').value.trim(), dietitianPhone: $('#set-phone').value.trim() };
    save(DIETITIAN_KEY, dt);
    writeForm(dt);
    toast('Dietitian details saved.');
  });
  $('#backup-export').addEventListener('click', () => saveFile(`ThePrimeFit-Backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json', store.exportAll()));
  $('#backup-import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const r = store.importAll(await file.text());
      if (r.foods || r.recipes) foodsChanged();
      toast(`Imported ${r.patients} patients and ${r.charts} charts${r.foods ? `, ${r.foods} foods` : ''}${r.recipes ? `, ${r.recipes} recipes` : ''}.`);
      renderSettings();
    } catch (err) {
      toast(err.message || 'Not a valid backup file.');
    }
  });
  $('#wipe').addEventListener('click', () => {
    if (!confirm('Delete ALL saved patients and charts from this device? Export a backup first if you need them.')) return;
    storage.removeItem(store.KEYS.patients);
    storage.removeItem(store.KEYS.charts);
    meta.id = null;
    renderSettings();
    toast('All patients and charts deleted.');
  });

  // ── A4 print: diet chart (1–2 pages) + optional recipe pages ────
  const both = (k) => { const a = I.t(L(), k); const b = L2() ? I.t(L2(), k) : ''; return b && b !== a ? `${a} / ${b}` : a; };

  function chartPages(mode, split, tipLimit, wl, compact) {
    const lang = L();
    const lang2 = L2();
    const T = (k) => I.t(lang, k);
    const named = mode === 'named';
    const t = plan.targets;
    const pct = macroPct(t);
    const r = restrictionText(lang);
    const excl = exclusionText(lang);
    const dash = '—';
    const cell = (label, value) => `<th>${esc(label)}</th><td>${value ? esc(value) : '&nbsp;'}</td>`;
    const planLabel = I.label(lang, 'plans', profile.plan) + (profile.travel ? ' · ' + I.label(lang, 'travel', profile.travel) : '');
    const likes = profile.likes.join(', ');
    const sexText = profile.sex ? T(profile.sex === 'male' ? 'male' : 'female') : dash;

    const info = named ? `
      <table class="ps-grid">
        <tr>${cell(T('name'), profile.name)}${cell(T('ageSex'), `${profile.age ? profile.age + ' ' + T('years') : dash} / ${sexText}`)}${cell(T('pid'), profile.patientId)}</tr>
        <tr>${cell(T('height'), profile.heightCm ? `${profile.heightCm} cm` : dash)}${cell(T('weight'), profile.weightKg ? `${profile.weightKg} kg` : dash)}${cell(T('bmi'), t.bmi ? `${t.bmi} (${I.label(lang, 'bmi', t.bmiCategory)})` : dash)}</tr>
        <tr>${cell(T('foodType'), dietText(profile, lang))}${cell(T('ideal'), t.idealWeight ? `${t.idealWeight[0]}–${t.idealWeight[1]} kg` : dash)}${cell(T('mobile'), profile.phone)}</tr>
        <tr><th>${esc(T('conditions'))}</th><td colspan="5">${r.length ? esc(r.join(', ')) : esc(T('none'))}</td></tr>
        ${excl ? `<tr><th>${esc(T('excluded'))}</th><td colspan="5">${esc(excl)}</td></tr>` : ''}
        ${likes ? `<tr><th>${esc(T('likes'))}</th><td colspan="5">${esc(likes)}</td></tr>` : ''}
        ${profile.notes ? `<tr><th>${esc(T('notes'))}</th><td colspan="5">${esc(profile.notes)}</td></tr>` : ''}
      </table>` : `
      <table class="ps-grid">
        <tr>${cell(T('plan'), planLabel)}${cell(T('foodType'), dietText(profile, lang))}${cell(T('goal'), I.label(lang, 'goals', t.goal))}</tr>
        <tr><th>${esc(T('cuisine'))}</th><td colspan="5">${esc(cuisineText(lang))}</td></tr>
        ${r.length || excl ? `<tr><th>${esc(T('suitable'))}</th><td colspan="5">${esc([...r, excl].filter(Boolean).join(', '))}</td></tr>` : ''}
      </table>`;

    const foodCell = (i) => {
      const a = itemName(i, lang);
      const b = lang2 && !i.custom ? itemName(i, lang2) : '';
      return `${esc(a)}${b && b !== a ? ` <i class="l2">(${esc(b)})</i>` : ''} <b>${esc(itemQty(i, lang))}</b>`;
    };
    const dayTable = (d, di) => `
      <table class="ps-day">
        <caption>${esc(T('day'))} ${di + 1} · ${esc(I.dayName(lang, d.day))}${lang2 ? ` / ${esc(I.dayName(lang2, d.day))}` : ''}</caption>
        <tbody>
          ${d.meals.map((e) => `<tr>
            <th class="c-meal"><span class="ps-ico">${IC.slotIcon(e.slot)}</span>${esc(I.label(lang, 'slots', e.slot))}${lang2 && !compact ? `<i class="l2">${esc(I.label(lang2, 'slots', e.slot))}</i>` : ''}<small>${esc(time12(e.time))}${lang2 && compact ? ' · ' + esc(I.label(lang2, 'slots', e.slot)) : ''}</small></th>
            <td>${e.meal && e.meal.items.length ? e.meal.items.map(foodCell).join(' · ') : '&nbsp;'}</td>
            <td class="c-kcal">${e.meal && e.meal.items.length ? e.meal.kcal : ''}</td>
          </tr>`).join('')}
        </tbody>
        <tfoot><tr><td colspan="2">${esc(T('total'))} · ${esc(T('protein'))} ${d.totals.p} g · ${esc(T('carbs'))} ${d.totals.c} g · ${esc(T('fat'))} ${d.totals.f} g</td><td class="c-kcal">${d.totals.kcal}</td></tr></tfoot>
      </table>`;

    const tips = tipList(t).slice(0, tipLimit);
    const picks = wl ? P.weightLossPicks(DB.FOODS, profile, 10).map((f) => I.foodName(lang, f.name)) : [];
    const two = (fn, x) => { const a = fn(lang, x); const b = lang2 && !compact ? fn(lang2, x) : ''; return `${esc(a)}${b && b !== a ? `<i class="l2 blk">${esc(b)}</i>` : ''}`; };

    const head = `
      <header class="ps-head">
        <img src="${BRAND.logo}" alt="${esc(BRAND.company)}">
        <div class="ps-title">
          <h1>${esc(titleFor(lang))}${lang2 ? `<small>${esc(titleFor(lang2))}</small>` : ''}</h1>
          <div class="ps-plan">${esc(planLabel)}${(meta.week || 1) > 1 ? ` · ${esc(T('week'))} ${meta.week}` : ''}</div>
          <div class="ps-web">${esc(BRAND.website)} · ${esc(BRAND.phone)}</div>
        </div>
      </header>
      ${info}
      <div class="ps-targets">
        <div><b>${num(t.calories)}</b>${esc(T('kcalDay'))}</div>
        <div><b>${t.protein} g</b>${esc(T('protein'))} ${pct.p}%</div>
        <div><b>${t.carbs} g</b>${esc(T('carbs'))} ${pct.c}%</div>
        <div><b>${t.fat} g</b>${esc(T('fat'))} ${pct.f}%</div>
        <div><b>💧 ${t.waterL} L</b>${esc(T('water'))}</div>
        <div><b>${t.fibre} g+</b>${esc(T('fibre'))}</div>
      </div>`;
    const notes = `
      <div class="ps-notes">
        <div>
          <h3>${esc(both('guidelines'))}</h3>
          <ul>${tips.map((x) => `<li>${two(I.tipText, x)}</li>`).join('')}</ul>
        </div>
        <div>
          <h3>${esc(both('avoid'))}</h3>
          <ul>${P.avoidList(profile).map((x) => `<li>${two(I.avoidText, x)}</li>`).join('')}</ul>
          ${picks.length ? `<h3 class="mt">${esc(T('wl'))}</h3><p class="ps-wl">${picks.map(esc).join(' · ')}</p>` : ''}
        </div>
      </div>
      <div class="ps-end">
        <div>${profile.dietitian ? `${esc(T('preparedBy'))}: <b>${esc(profile.dietitian)}</b>${profile.qualification ? ', ' + esc(profile.qualification) : ''} · ` : ''}${esc(BRAND.company)}</div>
        <div class="ps-disclaimer">${esc(T('computer'))} ${esc(T('portions'))}</div>
      </div>
      ${promo(lang, lang2)}
      <div class="ps-data" aria-hidden="true"><div>${esc(store.pdfPayload(named ? profile : { ...profile, name: '', patientId: '', phone: '', notes: '', patientRef: null }, plan, meta.week))}</div></div>`;

    const days = plan.days;
    if (split >= days.length) return [`${head}${days.map((d, i) => dayTable(d, i)).join('')}${notes}`];
    return [
      `${head}${days.slice(0, split).map((d, i) => dayTable(d, i)).join('')}`,
      `${days.slice(split).map((d, i) => dayTable(d, i + split)).join('')}${notes}`,
    ];
  }

  /**
   * Social handles for every PDF: live values from the clinic admin's settings
   * (localStorage 'primefit.admin.v1' → settings.instagram / youtube are full URLs), else the defaults.
   */
  function social() {
    let st = {};
    try { st = (JSON.parse(storage.getItem('primefit.admin.v1') || '{}') || {}).settings || {}; } catch (_) { st = {}; }
    const handle = (url, def) => {
      const h = String(url || '').trim().replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop().replace(/^@/, '');
      return h && !/\.(com|in)$/i.test(h) ? '@' + h : def;
    };
    const web = String(st.website || BRAND.website).trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '') || BRAND.website;
    return { ig: handle(st.instagram, '@theprimefit_'), yt: handle(st.youtube, '@ThePrimeFit'), web, phone: String(st.phone || '').trim() || BRAND.phone };
  }
  const SOC_ICON = {
    ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="psig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#f9a23b"/><stop offset=".5" stop-color="#e1306c"/><stop offset="1" stop-color="#833ab4"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="6" fill="url(#psig)"/><circle cx="12" cy="12" r="4.3" fill="none" stroke="#fff" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.3" fill="#fff"/></svg>',
    yt: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1.5" y="4.5" width="21" height="15" rx="4.5" fill="#ff0000"/><path d="M10 8.8v6.4l5.6-3.2z" fill="#fff"/></svg>',
    web: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#015b53"/><path d="M2.5 12h19M12 2.2c2.8 2.7 4.2 6 4.2 9.8s-1.4 7.1-4.2 9.8M12 2.2C9.2 4.9 7.8 8.2 7.8 12s1.4 7.1 4.2 9.8" fill="none" stroke="#fff" stroke-width="1.4"/></svg>',
    ph: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#1fa38c"/><path d="M8.6 6.8l1.6-.4 1.2 2.7-1.1 1c.6 1.4 1.6 2.4 3 3l1-1.1 2.7 1.2-.4 1.6c-.2.6-.8 1-1.4.9-4-.5-7.1-3.6-7.6-7.6-.1-.6.3-1.2 1-1.3z" fill="#fff"/></svg>',
  };
  /** The "Follow us" strip at the end of every printed chart and recipe set. */
  function promo(lang, lang2) {
    const so = social();
    const f1 = I.t(lang, 'followUs');
    const f2 = lang2 ? I.t(lang2, 'followUs') : '';
    const a = I.t(lang, 'appPromo');
    const item = (k, text) => `<span class="ps-soc ps-soc-${k}">${SOC_ICON[k]}<b>${esc(text)}</b></span>`;
    return `<div class="ps-promo">
      <div class="ps-follow"><b>${esc(f1)}</b>${f2 && f2 !== f1 ? `<small>${esc(f2)}</small>` : ''}<small>${esc(a)}</small></div>
      <div class="ps-socials">${item('ig', so.ig)}${item('yt', so.yt)}${item('web', so.web)}${item('ph', so.phone)}</div>
    </div>`;
  }

  /**
   * A printed recipe: ingredients as a list, the method as numbered step boxes, then tips.
   * `part` prints a slice of a long method: { from, to } (step indexes); parts after the
   * first repeat only the title and continue the numbering.
   */
  function recipeCard(name, serves, big, part) {
    const f = dishOf(name);
    if (!f) return '';
    const lang = L() || 'en';
    const lang2 = L2();
    const r = recipeData(f, serves);
    const k = serves || 1;
    const nm = (l) => (l === 'en' ? f.name : I.foodName(l, f.name));
    const alt = [lang !== 'en' ? f.name : '', lang2 ? nm(lang2) : ''].filter((x) => x && x !== nm(lang));
    const from = part ? part.from : 0;
    const to = part ? part.to : r.steps.length;
    const first = from === 0;
    const last = to >= r.steps.length;
    const steps = `<ol class="rcp-steps">${r.steps.slice(from, to).map((st, i) => `<li><b class="rcp-n">${from + i + 1}</b><span><em class="rcp-c">${esc(connective(lang, from + i, r.steps.length))}</em>${esc(st)}</span></li>`).join('')}</ol>`;
    const tips = last && r.tips ? `<div class="rcp-tip"><b>${esc(I.t(lang, 'tips'))}</b><span>${esc(r.tips)}</span></div>` : '';
    const method = `<h3>${esc(I.t(lang, 'method'))}${first ? ` <small>${r.steps.length} ${esc(I.t(lang, 'steps'))}</small>` : ` <small>${esc(I.t(lang, 'continued'))}</small>`}</h3>${steps}${tips}`;
    if (!first) {
      return `<article class="rcp cont${big ? ' big' : ''}"><h2><span class="ps-ico">${IC.foodIcon(f)}</span>${esc(nm(lang))}</h2><div class="rcp-method">${method}</div></article>`;
    }
    const facts = [
      `<span>${esc(P.formatQty(f.qty * k))} ${esc(f.unit)}${k > 1 ? ` (${k} × 1)` : ''}</span>`,
      `<span><b>${Math.round(f.kcal * k)}</b> kcal</span>`,
      `<span>${esc(I.t(lang, 'protein'))} <b>${Math.round(f.p * k * 10) / 10} g</b></span>`,
      `<span>${esc(I.t(lang, 'carbs'))} ${Math.round(f.c * k)} g</span>`,
      `<span>${esc(I.t(lang, 'fat'))} ${Math.round(f.f * k * 10) / 10} g</span>`,
      r.prep ? `<span>⏱ ${esc(I.t(lang, 'prepTime'))} <b>${esc(r.prep)}</b></span>` : '',
      r.cook ? `<span>🔥 ${esc(I.t(lang, 'cookTime'))} <b>${esc(r.cook)}</b></span>` : '',
      r.own && r.serves > 1 ? `<span>🍽 ${esc(I.t(lang, 'serves'))} <b>${r.serves * k}</b></span>` : '',
    ].filter(Boolean).join('');
    const ing = r.ing.length ? `<ul>${r.ing.map((x) => (x.x
      ? `<li><span>${esc(ingName(lang, x.x))}${lang !== 'en' ? ` <i class="l2">${esc(x.x.name)}</i>` : ''}</span><b>${esc(x.qty)}</b></li>`
      : `<li><span>${esc(x.name)}</span><b>${esc(x.qty)}</b></li>`)).join('')}</ul>` : '<p class="rcp-none">—</p>';
    return `<article class="rcp${big ? ' big' : ''}${last ? '' : ' split'}">
      <h2><span class="ps-ico">${IC.foodIcon(f)}</span>${esc(nm(lang))}${alt.length ? `<small>${esc(alt.join(' · '))}</small>` : ''}</h2>
      <div class="rcp-meta">${facts}</div>
      <div class="rcp-body">
        <div class="rcp-ing"><h3>${esc(I.t(lang, 'ingredients'))} <small>${r.ing.length}</small></h3>${ing}</div>
        <div class="rcp-method">${method}</div>
      </div>
    </article>`;
  }

  const pageHtml = (inner, cls) => `<div class="ps-page${cls ? ' ' + cls : ''}"><div class="ps-inner">${inner}</div></div>`;
  const recipeHead = (lang) => `<header class="ps-head sm"><img src="${BRAND.logo}" alt="${esc(BRAND.company)}"><div class="ps-title"><h1>${esc(I.t(lang, 'recipes'))}${L2() ? `<small>${esc(I.t(L2(), 'recipes'))}</small>` : ''}</h1><div class="ps-web">${esc(BRAND.website)}</div></div></header>`;

  /** Fit each page into one A4 sheet by scaling type down. */
  function fitPages(minScale) {
    let ok = true;
    $$('.ps-page', sheet).forEach((page) => {
      const inner = $('.ps-inner', page);
      let s = 1;
      page.style.setProperty('--s', s);
      while (inner.scrollHeight > page.clientHeight + 1 && s > minScale) {
        s = Math.round((s - 0.03) * 100) / 100;
        page.style.setProperty('--s', s);
      }
      if (inner.scrollHeight > page.clientHeight + 1) ok = false;
    });
    return ok;
  }

  /**
   * Recipe pages: as many recipe cards per A4 page as fit. Heights are measured in one
   * pass (fast even for 50+ recipes); a recipe taller than a page continues its method
   * on the next page, split between steps, never inside one.
   */
  function layoutRecipes(names, serves, big) {
    const lang = L();
    const list = names.filter((n) => dishOf(n));
    if (!list.length) return [];
    const head = recipeHead(lang);
    const tail = promo(lang, L2());
    const measure = (blocks) => {
      sheet.innerHTML = pageHtml(head + blocks.join('') + tail, 'rp');
      const page = $('.ps-page', sheet);
      page.style.setProperty('--s', 1);
      const inner = $('.ps-inner', page);
      const kids = Array.from(inner.children);
      const tops = kids.map((el) => el.offsetTop);
      const hs = kids.map((el, i) => (i < kids.length - 1 ? tops[i + 1] - tops[i] : inner.scrollHeight - tops[i]));
      const pad = parseFloat(getComputedStyle(inner).paddingBottom) || 0;
      return { cap: page.clientHeight - pad - 2, head: hs[0], cards: hs.slice(1, -1), tail: hs[hs.length - 1] };
    };
    let blocks = list.map((n) => ({ html: recipeCard(n, serves, big) }));
    let m = measure(blocks.map((b) => b.html));
    // Split recipes that do not fit on a page by themselves.
    const room = m.cap - m.head;
    if (m.cards.some((h) => h > room)) {
      const out = [];
      blocks.forEach((b, i) => {
        if (m.cards[i] <= room) { out.push(b); return; }
        const name = list[i];
        const total = recipeData(dishOf(name), serves).steps.length;
        let from = 0;
        while (from < total) {
          let to = total;
          // Largest slice of steps that fits (at least one step per part).
          while (to > from + 1) {
            const h = measure([recipeCard(name, serves, big, { from, to })]).cards[0];
            if (h <= room) break;
            to--;
          }
          out.push({ html: recipeCard(name, serves, big, { from, to }) });
          from = to;
        }
      });
      blocks = out;
      m = measure(blocks.map((b) => b.html));
    }
    // Greedy packing by measured height.
    const pages = [];
    let cur = [];
    let used = m.head;
    blocks.forEach((b, i) => {
      if (cur.length && used + m.cards[i] > m.cap) { pages.push(cur); cur = []; used = m.head; }
      cur.push(b.html);
      used += m.cards[i];
    });
    if (cur.length) pages.push(cur);
    // The promo goes on the last page when it fits, otherwise on a page of its own is wasteful: drop it.
    const lastFits = used + m.tail <= m.cap;
    return pages.map((p, i) => head + p.join('') + (i === pages.length - 1 && lastFits ? tail : ''));
  }

  function setPageStyle(total) {
    const so = social();
    const footer = [BRAND.company, `Instagram ${so.ig}`, `YouTube ${so.yt}`, so.web, (profile && profile.dietitianPhone) || so.phone].filter(Boolean).join('  ·  ');
    let st = document.getElementById('ps-page-style');
    if (!st) { st = document.createElement('style'); st.id = 'ps-page-style'; document.head.appendChild(st); }
    st.textContent = `@page { @bottom-left { content: ${JSON.stringify(footer)}; font: 7pt system-ui, sans-serif; color: #2c2e2f; }
      @bottom-right { content: ${JSON.stringify(I.t(L(), 'page') + ' ')} counter(page) " / ${total}"; font: 7pt system-ui, sans-serif; color: #2c2e2f; } }`;
  }

  function renderPrint(mode) {
    sheet.classList.add('measuring');
    const n = plan.days.length;
    const allTips = tipList(plan.targets).length;
    const splits = [...new Set([...(n <= 3 ? [n] : []), Math.ceil(n / 2), Math.floor(n / 2) || 1, n])].filter((x) => x >= 1);
    const minScale = L2() ? 0.6 : 0.66;
    let pages = null;
    let best = null; // closest layout, if none fits
    outer: for (const compact of L2() ? [false, true] : [false]) {
      for (const split of splits) {
        for (let tipLimit = allTips; tipLimit >= 3; tipLimit--) {
          for (const wl of showWl() ? [true, false] : [false]) {
            const list = chartPages(mode, split, tipLimit, wl, compact);
            sheet.innerHTML = list.map((h) => pageHtml(h)).join('');
            if (fitPages(compact ? minScale : 0.66)) { pages = list; break outer; }
            const over = $$('.ps-page', sheet).reduce((m, pg) => Math.max(m, $('.ps-inner', pg).scrollHeight - pg.clientHeight), 0);
            if (!best || over < best.over) best = { over, list };
          }
        }
      }
    }
    if (!pages) pages = best.list;
    const recipes = (profile.recipes || []).filter((r) => dishByName[r]);
    const rpages = layoutRecipes(recipes, 1, false);
    sheet.innerHTML = pages.map((h) => pageHtml(h)).join('') + rpages.map((h) => pageHtml(h, 'rp')).join('');
    fitPages(minScale);
    sheet.classList.remove('measuring');
    setPageStyle(pages.length + rpages.length);
  }

  function renderRecipePrint(names, serves) {
    sheet.classList.add('measuring');
    const big = names.length === 1;
    const pages = layoutRecipes(names, serves, big);
    sheet.innerHTML = pages.map((h) => pageHtml(h, 'rp')).join('');
    fitPages(0.7);
    sheet.classList.remove('measuring');
    setPageStyle(pages.length);
  }

  function fileTitle(mode) {
    const slug = (s) => s.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const who = mode === 'named' && profile.name ? slug(profile.name) : 'Generic';
    return ['ThePrimeFit', profile.travel ? 'Travel-Diet-Chart' : 'Diet-Chart', who, `Week${meta.week || 1}`, L().toUpperCase()].join('_');
  }

  function iosHandler(name) {
    const h = window.webkit && window.webkit.messageHandlers;
    return h && h[name] ? h[name] : null;
  }

  function doPrint(title) {
    if (window.AndroidBridge) return window.AndroidBridge.print(title);
    if (iosHandler('primefitPrint')) return iosHandler('primefitPrint').postMessage(title);
    const prev = document.title;
    document.title = title; // default PDF file name
    window.addEventListener('afterprint', () => { document.title = prev; }, { once: true });
    window.print();
  }

  function printChart(mode) {
    renderPrint(mode);
    doPrint(fileTitle(mode));
  }

  function printRecipes(names, serves) {
    if (!names.length) return toast('No recipes to print.');
    const saved = profile;
    if (!profile) profile = { chartLang: 'en', chartLang2: '' };
    renderRecipePrint(names, serves || 1);
    const slug = names.length === 1 ? names[0].replace(/[^A-Za-z0-9]+/g, '-') : `${names.length}-Recipes`;
    profile = saved;
    doPrint(`ThePrimeFit_Recipe_${slug}`);
  }

  function saveFile(fileName, mime, content) {
    if (iosHandler('primefitSave')) return iosHandler('primefitSave').postMessage({ name: fileName, content });
    if (window.AndroidBridge) return window.AndroidBridge.saveFile(fileName, mime, content);
    const blob = new Blob([content], { type: mime + ';charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
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
    const so = social();
    rows.push([], ['Follow us', `Instagram ${so.ig}`, `YouTube ${so.yt}`, so.web, so.phone]);
    const csv = '﻿' + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    saveFile(fileTitle('named') + '.csv', 'text/csv', csv);
  }

  // ── Foods & Recipes library (js/library.js; its data loads on first open) ──
  /** Add a library food or recipe to a meal of the current chart (one day or every day). */
  function addToChart(item, di, slot) {
    if (!plan) { toast('Open or create a diet chart first.'); return false; }
    const days = di == null ? plan.days.map((_, i) => i) : [di];
    let n = 0;
    days.forEach((d) => {
      const entry = plan.days[d].meals.find((m) => m.slot === slot);
      if (!entry) return;
      let it;
      if (item.fid != null) it = P.makeItem(DB.FOODS[item.fid], item.qty);
      else {
        it = P.customItem(item.name, item.per, item.unit, item.kcal, item.p);
        it.per.c = item.c; it.per.f = item.f;
        P.setItemQty(it, item.qty);
      }
      const meal = entry.meal || { name: '', items: [] };
      meal.items.push(it);
      meal.name = meal.items.map((i) => i.name).join(' + ');
      entry.meal = P.recalcMeal(meal);
      entry.locked = true;
      P.refreshDay(plan.days[d]);
      n++;
    });
    if (!n) { toast('That meal is not in this chart.'); return false; }
    savePlan();
    return true;
  }
  /** Print ready-made A4 pages (the library list). */
  function printPages(pages, title) {
    sheet.classList.add('measuring');
    sheet.innerHTML = pages.map((h) => pageHtml(h, 'lx-page')).join('');
    fitPages(0.55);
    sheet.classList.remove('measuring');
    setPageStyle(pages.length);
    doPrint(title);
  }
  const lib = window.LIBRARY.init({
    $, $$, esc, num, toast, debounce, P, DB, IC, ING, ICON, loadScript, saveFile, openDialog, closeDialog, recipeBody, genDish, addToChart, printPages,
    getPlan: () => plan,
    isCurrent: () => current === 'explore',
    printDish: (f, serves) => { if (f) printRecipes([f.name], serves || 1); },
  });

  // ── Persistence & start ──────────────────────────────────────────
  function save(key, value) {
    try { storage.setItem(key, JSON.stringify(value)); } catch (_) { /* storage full or unavailable */ }
  }
  function load(key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); } catch (_) { return null; }
  }
  function saveCurrent() {
    save(CURRENT_KEY, { profile, meta, activeDay, data: plan ? store.packPlan(plan) : null });
  }
  /** Save the current chart (and its patient) to the saved charts list. */
  function savePlan() {
    if (plan) {
      const rec = store.saveChart({ id: meta.id, profile, plan, week: meta.week, parent: meta.parent });
      if (rec) meta.id = rec.id;
      else toast('Storage is full — export a backup and delete old charts.');
    }
    saveCurrent();
  }
  function persistNewChart() {
    meta.id = null;
    savePlan();
  }

  const savedDietitian = load(DIETITIAN_KEY);
  if (savedDietitian) writeForm(savedDietitian);
  const saved = load(CURRENT_KEY);
  try {
    if (saved && saved.profile && saved.data && P.PLANS[saved.profile.plan]) {
      profile = fixProfile(saved.profile);
      plan = store.unpackPlan(saved.data, profile);
      meta = saved.meta || meta;
      activeDay = Math.min(saved.activeDay || 0, plan.days.length - 1);
      if (!profile.recipes) profile.recipes = [];
      writeForm(profile);
    } else {
      const old = load(LEGACY_KEY); // chart from version 4
      if (old && old.profile && old.plan && P.PLANS[old.profile.plan]) {
        profile = { ...old.profile, recipes: [] };
        plan = old.plan;
        writeForm(profile);
        persistNewChart();
      }
    }
  } catch (_) { plan = null; profile = null; }
  show(location.hash.slice(1) || 'home');

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is optional */ });
  }
})();
