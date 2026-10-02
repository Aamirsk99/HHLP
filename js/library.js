/*
 * Foods & Recipes library: one searchable list of every food (the diet-chart foods, IFCT 2017 Indian
 * foods and the TempoLife / USDA world foods) and every recipe (the diet-chart dishes plus the
 * 10,000+ generated recipes), with filters, sorting, pages of 40 rows, PDF / Excel export, recipe
 * PDFs and "add to chart".
 *
 * The big data files (js/foodlib.js, js/recipegen.js) are injected the first time the screen
 * opens, so they never slow down app start. Pure helpers (parse, filter, sort) are exported for tests.
 */
(function (root) {
  const PAGE = 40;
  const PDF_MAX = 600;
  const DIET_RANK = { vegan: 0, veg: 1, egg: 2, nonveg: 3 };
  const DIET_LABEL = { vegan: 'Vegan', veg: 'Veg', egg: 'Egg', nonveg: 'Non-veg' };
  const INDIAN = new Set(['IN', 'N', 'S', 'W', 'E']);
  const REGION_NAMES = { IN: 'Pan-Indian', N: 'North Indian', S: 'South Indian', W: 'West Indian', E: 'East Indian', CON: 'Continental', MED: 'Mediterranean', ASIA: 'Asian', MEX: 'Mexican', WORLD: 'World' };
  const SRC = { app: 'Prime Fit foods', gen: 'Prime Fit recipes', mine: 'My foods', ifct: 'IFCT 2017 (India)', usda: 'USDA (via TempoLife)', tempo: 'TempoLife' };
  const MEALS = { breakfast: 'Breakfast', midmorning: 'Mid-morning', lunch: 'Lunch', evening: 'Evening snack', dinner: 'Dinner', bedtime: 'Bedtime', drinks: 'Drinks & shakes' };
  const ROLE_MEALS = {
    bf: ['breakfast'], wbf: ['breakfast'], bfside: ['breakfast'], snack: ['midmorning', 'evening'], fruit: ['midmorning', 'evening'], soup: ['evening', 'dinner'],
    grain: ['lunch', 'dinner'], dal: ['lunch', 'dinner'], protein: ['lunch', 'dinner'], sabzi: ['lunch', 'dinner'], side: ['lunch', 'dinner'], wprotein: ['lunch', 'dinner'],
    wcarb: ['lunch', 'dinner'], wveg: ['lunch', 'dinner'], wmain: ['lunch', 'dinner'], tmain: ['lunch', 'dinner'], drink: ['drinks'], early: ['drinks'], earlyadd: ['breakfast'],
    bed: ['bedtime', 'drinks'], shake: ['drinks', 'midmorning', 'evening'],
  };
  const ING_CATS = { grain: 'Grains, millets & pasta', pulse: 'Pulses & legumes', dairy: 'Dairy', egg: 'Eggs', meat: 'Meat & poultry', fish: 'Fish & seafood', veg: 'Vegetables', leafy: 'Leafy greens', fruit: 'Fruits & berries', nut: 'Nuts & seeds', fat: 'Fats & oils', sweet: 'Desserts & sweets', spice: 'Spices & herbs', drink: 'Beverages', other: 'Other' };
  const POWDER_WORDS = /\b(whey|casein|protein (powder|isolate|shake|supplement)|soy protein isolate|pea protein)\b/;

  // Allergen hints for foods that only have a name (world foods): best effort, label says so.
  const PLANT_MILK = /\b(coconut|soy|soya|almond|rice|oat|cashew|peanut|nut|apple|cocoa)[ -](milk|butter|cream|drink|beverage)s?\b|\bbutternut\b|\bbutter beans?\b/g;
  const HINTS = {
    dairy: (n, cat) => cat === 'Dairy' || /\b(milk|cheese|butter|cream|yogh?urt|whey|casein|ghee|kefir|curd|paneer|lassi|khoa|ice cream|custard|buttermilk)\b/.test(n.replace(PLANT_MILK, '')),
    gluten: (n) => /\b(wheat|bread|breads|pasta|spaghetti|macaroni|noodles?|barley|rye|semolina|couscous|bulgur|crackers?|biscuits?|cookies?|cakes?|flour|seitan|atta|maida|rava|suji|muffins?|bagels?|croissants?|pretzels?|pizza|tortilla|pastry|doughnuts?|waffles?|pancakes?|malt|spelt|farro)\b/.test(n) && !/\b(buckwheat|rice flour|gluten[- ]free|corn tortilla|rice noodles?)\b/.test(n),
    nuts: (n) => /\b(almonds?|cashews?|walnuts?|pecans?|pistachios?|hazelnuts?|peanuts?|macadamia|brazil ?nuts?|nuts|nut|praline|marzipan|nutella|groundnut)\b/.test(n) && !/\b(coconut|nutmeg|butternut|doughnut|donut|chestnut)\b/.test(n),
    soy: (n) => /\b(soy|soya|soybeans?|tofu|tempeh|edamame|miso|natto)\b/.test(n),
    egg: (n, cat, diet) => diet === 'egg' || cat === 'Eggs',
    fish: (n, cat) => cat === 'Fish & seafood' || /\b(fish|salmon|tuna|cod|shrimps?|prawns?|crabs?|lobster|anchov\w*|sardines?|oysters?|clams?|mussels?|squid)\b/.test(n),
  };

  /** Foods from the generated file: rows "name|cat|diet|src|kcal|p|c|f|fib|sugar|salt|alias". */
  function parseFoodLib(D) {
    const out = [];
    const nums = (v) => (v === '' || v == null ? null : Number(v));
    const lines = D.rows.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const x = lines[i].split('|');
      const cat = D.cats[Number(x[1])];
      const diet = D.diets[Number(x[2])];
      const src = D.sources[Number(x[3])].key;
      const name = x[0];
      const low = name.toLowerCase();
      const allergens = Object.keys(HINTS).filter((a) => HINTS[a](low, cat, diet));
      out.push({
        k: 'f', id: 'l' + i, name, alias: x[11] || '', cat, diet, src, region: src === 'ifct' ? 'IN' : 'WORLD',
        kcal: Number(x[4]), p: Number(x[5]), c: Number(x[6]), f: Number(x[7]), fib: nums(x[8]), sugar: nums(x[9]), salt: nums(x[10]),
        basis: '100 g', meal: [], time: 0, allergens, pp: POWDER_WORDS.test(low), recipe: false,
      });
    }
    return out;
  }

  /** The diet-chart foods (DB.FOODS): dishes per serving, ingredients per 100 g. */
  function fromDb(DB, P) {
    const catOf = (f) => {
      if (f.ingKey) return ING_CATS[f.cat] || 'Other';
      const hit = Object.entries(P.CATEGORIES).find(([k, c]) => k !== 'ingredients' && f.roles.some((r) => c.roles.includes(r)));
      return hit ? hit[1].label : 'Other';
    };
    return DB.FOODS.map((f) => ({
      k: 'f', id: 'a' + f.id, fid: f.id, name: f.name, alias: f.hi || '', cat: catOf(f), diet: f.diet, src: f.user ? 'mine' : 'app', region: f.region || 'IN',
      kcal: f.kcal, p: f.p, c: f.c, f: f.f, fib: null, sugar: null, salt: null,
      basis: `${P.formatQty(f.qty)} ${f.unit}`, meal: [...new Set(f.roles.flatMap((r) => ROLE_MEALS[r] || []))], time: 0,
      allergens: f.allergens || [], pp: !!((f.recipe && f.recipe.ing.some(([k]) => /^(whey|wheyiso|wheyconc|plantp|soyiso|casein)$/.test(k))) || POWDER_WORDS.test(f.name.toLowerCase())),
      recipe: !f.ingKey && !!f.recipe, wl: (f.flags || []).includes('wl'),
    }));
  }

  /** Generated recipes (recipegen.js). */
  function fromGen(list, ING) {
    return list.map((r) => ({
      k: 'r', id: r.id, gen: r, name: r.name, alias: r.ing.map(([k]) => ING[k].hi).join(' '), cat: r.cat, diet: r.diet, src: 'gen', region: r.region,
      kcal: r.kcal, p: r.p, c: r.c, f: r.f, fib: null, sugar: null, salt: null, basis: r.serving, meal: r.meal, time: r.prep + r.cook,
      allergens: r.allergens, pp: !!r.pp, recipe: true, ingText: r.ing.map(([k]) => ING[k].name).join(' '),
    }));
  }

  function prepare(items) {
    items.forEach((x) => {
      x.nl = x.name.toLowerCase();
      x.txt = (x.nl + ' ' + x.alias + ' ' + (x.ingText || '') + ' ' + x.cat).toLowerCase();
      x.ppk = x.kcal > 0 ? Math.round((x.p / x.kcal) * 1000) / 10 : 0; // g protein per 100 kcal
    });
    return items;
  }

  const isHighProtein = (x) => x.p * 4 >= x.kcal * 0.25 && x.p >= 6;
  const isLowCarb = (x) => x.kcal > 0 && x.c * 4 <= x.kcal * 0.26;

  /** Filter + sort. `s` = state from the screen (all optional). */
  function query(items, s) {
    const words = String(s.q || '').toLowerCase().split(/\s+/).filter(Boolean);
    const minK = Number(s.kmin) || 0, maxK = Number(s.kmax) || 0, maxT = Number(s.time) || 0;
    const no = s.no || [];
    const out = [];
    for (let i = 0; i < items.length; i++) {
      const x = items[i];
      if (s.type === 'f' && x.k !== 'f') continue;
      if (s.type === 'r' && !x.recipe) continue;
      if (s.diet) {
        if (s.diet === 'nonveg' ? x.diet !== 'nonveg' : DIET_RANK[x.diet] > DIET_RANK[s.diet]) continue;
      }
      if (s.cat && x.cat !== s.cat) continue;
      if (s.meal && !x.meal.includes(s.meal)) continue;
      if (minK && x.kcal < minK) continue;
      if (maxK && x.kcal > maxK) continue;
      if (s.hp && !isHighProtein(x)) continue;
      if (s.lc && !isLowCarb(x)) continue;
      if (s.hf && !(x.fib != null && x.fib >= 6)) continue;
      if (s.ls && !(x.sugar != null && x.sugar <= 5)) continue;
      if (s.lowsalt && !(x.salt != null && x.salt <= 0.3)) continue;
      if (s.pp && !x.pp) continue;
      if (s.src && x.src !== s.src) continue;
      if (s.region) {
        if (s.region === 'india' ? !INDIAN.has(x.region) : s.region === 'world' ? INDIAN.has(x.region) : x.region !== s.region) continue;
      }
      if (maxT && !(x.time > 0 && x.time <= maxT)) continue;
      if (no.length && no.some((a) => x.allergens.includes(a))) continue;
      if (words.length) {
        let ok = true;
        for (let w = 0; w < words.length; w++) if (x.txt.indexOf(words[w]) < 0) { ok = false; break; }
        if (!ok) continue;
      }
      out.push(x);
    }
    const by = {
      protein: (a, b) => b.p - a.p,
      ppk: (a, b) => b.ppk - a.ppk,
      kcal: (a, b) => a.kcal - b.kcal,
      kcaldesc: (a, b) => b.kcal - a.kcal,
      name: (a, b) => (a.nl < b.nl ? -1 : a.nl > b.nl ? 1 : 0),
      time: (a, b) => (a.time || 1e9) - (b.time || 1e9),
    }[s.sort];
    if (by) out.sort(by);
    else if (!words.length) return featured(out);
    else if (words.length) {
      // Best match: name starts with the first word, then whole word in the name, then the rest; shorter names first.
      const w0 = words[0];
      const re = new RegExp('(^|[^a-z])' + w0.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const rank = (x) => (x.nl.startsWith(w0) ? 0 : re.test(x.nl) ? 1 : x.nl.indexOf(w0) >= 0 ? 2 : 3) * 1000 + Math.min(x.nl.length, 999);
      out.forEach((x) => { x._r = rank(x); });
      out.sort((a, b) => a._r - b._r);
    }
    return out;
  }

  /**
   * Default order without a search or sort: a varied feed — recipes first, one from each
   * category in turn (best protein per kcal first), then the foods the same way.
   */
  function featured(list) {
    const rr = (items) => {
      const groups = new Map();
      items.forEach((x) => { if (!groups.has(x.cat)) groups.set(x.cat, []); groups.get(x.cat).push(x); });
      // Generated recipe families lead (bowls, wraps, curries …), then the diet-chart dishes.
      const gs = [...groups.values()].sort((a, b) => (a[0].src === 'gen' ? 0 : 1) - (b[0].src === 'gen' ? 0 : 1)).map((g) => g.sort((a, b) => b.ppk - a.ppk));
      const out = [];
      for (let i = 0; out.length < items.length; i++) gs.forEach((g) => { if (i < g.length) out.push(g[i]); });
      return out;
    };
    return [...rr(list.filter((x) => x.recipe)), ...rr(list.filter((x) => !x.recipe))];
  }

  // ───────────────────────────────────────────────────────────────────
  // Screen (browser only)
  function init(ctx) {
    const { $, $$, esc, num, toast, P, DB, IC } = ctx;
    const state = { type: '', q: '', diet: '', cat: '', meal: '', kmin: '', kmax: '', hp: false, lc: false, hf: false, ls: false, lowsalt: false, pp: false, src: '', region: '', time: '', sort: '', no: [], page: 0 };
    try { const saved = JSON.parse(localStorage.getItem('primefit.lib.state') || 'null'); if (saved && typeof saved === 'object') Object.assign(state, saved, { q: '', page: 0 }); } catch (_) { /* private mode */ }
    let ITEMS = null;
    let LIB = null;
    let result = [];
    let loading = null;
    let view = null; // item in the detail dialog
    let viewServes = 1;
    let viewGrams = 100;
    const dlg = $('#lxdialog');

    function counts() {
      if (!ITEMS) return null;
      const foods = ITEMS.filter((x) => x.k === 'f').length;
      const recipes = ITEMS.filter((x) => x.recipe).length;
      return { foods, recipes };
    }

    function load() {
      if (ITEMS) return Promise.resolve(ITEMS);
      if (loading) return loading;
      const need = [];
      if (!root.FOODLIB_DATA) need.push(ctx.loadScript('js/foodlib.js'));
      if (!root.RECIPEGEN) need.push(ctx.loadScript('js/recipegen.js'));
      loading = Promise.all(need).then(() => new Promise((res) => setTimeout(res, 16))).then(() => {
        LIB = parseFoodLib(root.FOODLIB_DATA);
        rebuild();
        return ITEMS;
      }).catch((e) => { loading = null; throw e; });
      return loading;
    }
    /** (Re)combine: diet-chart foods (they change when the dietitian adds foods) + world foods + recipes. */
    function rebuild() {
      ITEMS = prepare([...fromDb(DB, P), ...LIB, ...fromGen(root.RECIPEGEN.all(), ctx.ING)]);
      buildCategoryOptions();
    }

    function buildCategoryOptions() {
      const groups = [['Diet-chart foods', ITEMS.filter((x) => x.src === 'app' || x.src === 'mine')], ['Food groups (world & Indian)', ITEMS.filter((x) => x.src === 'ifct' || x.src === 'usda' || x.src === 'tempo')], ['Recipe types', ITEMS.filter((x) => x.src === 'gen')]];
      const seen = new Set();
      $('#lx-cat').innerHTML = '<option value="">All categories</option>' + groups.map(([label, list]) => {
        const cats = [...new Set(list.map((x) => x.cat))].filter((c) => !seen.has(c)).sort();
        cats.forEach((c) => seen.add(c));
        return `<optgroup label="${esc(label)}">${cats.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}</optgroup>`;
      }).join('');
      $('#lx-cat').value = state.cat;
      if ($('#lx-cat').value !== state.cat) state.cat = '';
    }

    // ── Controls ──
    const QUICK = [['hp', 'High protein'], ['lc', 'Low carb'], ['pp', 'Protein powder'], ['veg', 'Veg'], ['vegan', 'Vegan'], ['quick', '≤ 20 min']];
    const NO = { dairy: 'No dairy', gluten: 'No gluten', nuts: 'No nuts', soy: 'No soy', egg: 'No egg', fish: 'No fish' };
    const TOGGLES = [['hp', 'High protein'], ['lc', 'Low carb'], ['hf', 'High fibre (≥ 6 g)'], ['ls', 'Low sugar (≤ 5 g)'], ['lowsalt', 'Low salt (≤ 0.3 g)'], ['pp', 'Protein powder']];
    const chip = (attr, v, label, on) => `<button type="button" class="chip" ${attr}="${esc(v)}" aria-pressed="${!!on}">${esc(label)}</button>`;
    $('#lx-meal').innerHTML = '<option value="">Any meal</option>' + Object.entries(MEALS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
    $('#lx-src').innerHTML = '<option value="">All sources</option>' + Object.entries(SRC).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
    $('#lx-region').innerHTML = '<option value="">Any cuisine</option><option value="india">Indian (all)</option>' + ['N', 'S', 'W', 'E', 'IN'].map((k) => `<option value="${k}">${esc(REGION_NAMES[k])}</option>`).join('') + '<option value="world">World (all)</option>' + ['CON', 'MED', 'ASIA', 'MEX'].map((k) => `<option value="${k}">${esc(REGION_NAMES[k])}</option>`).join('');

    function syncControls() {
      $('#lx-q').value = state.q;
      $$('#lx-type button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.type === state.type)));
      $$('#lx-diet .chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.diet === state.diet)));
      ['cat', 'meal', 'kmin', 'kmax', 'src', 'region', 'time', 'sort'].forEach((k) => { const el = $('#lx-' + k); if (el) el.value = state[k]; });
      $('#lx-toggles').innerHTML = TOGGLES.map(([k, v]) => chip('data-tog', k, v, state[k])).join('');
      $('#lx-no').innerHTML = Object.entries(NO).map(([k, v]) => chip('data-no', k, v, state.no.includes(k))).join('');
      $('#lx-quick').innerHTML = QUICK.map(([k, v]) => chip('data-quick', k, v, quickOn(k))).join('');
      const n = activeCount();
      $('#lx-fcount').textContent = n ? String(n) : '';
      $('#lx-fcount').hidden = !n;
      $('#lx-reset').hidden = !n;
    }
    const quickOn = (k) => (k === 'veg' ? state.diet === 'veg' : k === 'vegan' ? state.diet === 'vegan' : k === 'quick' ? state.time === '20' : !!state[k]);
    function activeCount() {
      return ['diet', 'cat', 'meal', 'kmin', 'kmax', 'src', 'region', 'time'].filter((k) => state[k]).length + TOGGLES.filter(([k]) => state[k]).length + state.no.length;
    }
    function persist() {
      try { const { q, page, ...rest } = state; localStorage.setItem('primefit.lib.state', JSON.stringify(rest)); } catch (_) { /* ignore */ }
    }

    function run(keepPage) {
      if (!ITEMS) return;
      const t0 = performance.now();
      result = query(ITEMS, state);
      if (!keepPage) state.page = 0;
      ctx.libTiming = performance.now() - t0;
      persist();
      syncControls();
      renderList();
    }

    function headline() {
      const c = counts();
      if (!c) return;
      $('#lx-headline').innerHTML = `<b>${num(c.foods)}</b> foods · <b>${num(c.recipes)}</b> recipes`;
      $('#lx-sub').textContent = 'Indian & world foods per 100 g · recipes with full method, nutrition from ingredients';
    }

    function macroBar(x) {
      const p = x.p * 4, c = x.c * 4, f = x.f * 9, t = p + c + f || 1;
      return `<span class="lx-macro" aria-hidden="true"><i class="mp" style="width:${(p / t) * 100}%"></i><i class="mc" style="width:${(c / t) * 100}%"></i><i class="mf" style="width:${(f / t) * 100}%"></i></span>`;
    }
    const iconOf = (x) => IC.foodIcon(x.fid != null ? DB.FOODS[x.fid] : { name: x.name, roles: [] });

    function renderList() {
      const total = result.length;
      const pages = Math.max(1, Math.ceil(total / PAGE));
      state.page = Math.min(state.page, pages - 1);
      const from = state.page * PAGE;
      const rows = result.slice(from, from + PAGE);
      $('#lx-count').innerHTML = total ? `<b>${num(total)}</b> result${total === 1 ? '' : 's'}${pages > 1 ? ` · ${num(from + 1)}–${num(from + rows.length)}` : ''}` : 'No results';
      $('#lx-list').innerHTML = rows.length ? rows.map((x, i) => `
        <button type="button" class="lx-row" data-i="${from + i}">
          <span class="lx-ico">${iconOf(x)}</span>
          <span class="lx-main">
            <b>${esc(x.name)}</b>
            <small>${esc(x.cat)} · ${esc(SRC[x.src])}${x.time ? ` · ${x.time} min` : ''}</small>
            ${macroBar(x)}
            <span class="lx-tags"><i class="diet-dot ${x.diet}" title="${esc(DIET_LABEL[x.diet])}"></i><em>${esc(DIET_LABEL[x.diet])}</em>${isHighProtein(x) ? '<em class="hp">High protein</em>' : ''}${x.pp ? '<em class="pp">Protein powder</em>' : ''}${x.recipe ? '<em class="rc">Recipe</em>' : ''}</span>
          </span>
          <span class="lx-kcal"><b>${Math.round(x.kcal)}</b><small>kcal</small><small class="lx-p">P ${x.p} g</small><small class="lx-basis">per ${esc(x.basis)}</small></span>
        </button>`).join('') : `<div class="empty lx-empty"><b>Nothing matches.</b><br>Try fewer words or clear some filters.${activeCount() ? '<br><button type="button" class="btn" data-lx-reset>Clear filters</button>' : ''}</div>`;
      $('#lx-pager').innerHTML = pages > 1 ? `
        <button type="button" class="btn ghost" data-page="0"${state.page === 0 ? ' disabled' : ''} aria-label="First page">«</button>
        <button type="button" class="btn ghost" data-page="${state.page - 1}"${state.page === 0 ? ' disabled' : ''}>‹ Prev</button>
        <span>Page <b>${state.page + 1}</b> of ${num(pages)}</span>
        <button type="button" class="btn ghost" data-page="${state.page + 1}"${state.page >= pages - 1 ? ' disabled' : ''}>Next ›</button>
        <button type="button" class="btn ghost" data-page="${pages - 1}"${state.page >= pages - 1 ? ' disabled' : ''} aria-label="Last page">»</button>` : '';
    }

    function render() {
      ctx.setTitle && ctx.setTitle();
      if (ITEMS) { headline(); run(true); return; }
      $('#lx-list').innerHTML = Array.from({ length: 6 }, () => '<div class="lx-row lx-skel"><span class="lx-ico"></span><span class="lx-main"><b></b><small></small></span></div>').join('');
      $('#lx-count').textContent = 'Loading 20,000+ foods & recipes…';
      syncControls();
      load().then(() => { headline(); run(true); }).catch(() => { $('#lx-count').textContent = 'Could not load the library — please reopen the app.'; });
    }

    // ── Events ──
    const debounced = ctx.debounce(() => { state.q = $('#lx-q').value; run(); }, 150);
    $('#lx-q').addEventListener('input', debounced);
    $('#lx-q').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } });
    $('#lx-type').addEventListener('click', (e) => { const b = e.target.closest('[data-type]'); if (!b) return; state.type = b.dataset.type; run(); });
    $('#lx-filter-btn').addEventListener('click', () => {
      const panel = $('#lx-filters');
      panel.hidden = !panel.hidden;
      $('#lx-filter-btn').setAttribute('aria-expanded', String(!panel.hidden));
    });
    ['cat', 'meal', 'kmin', 'kmax', 'src', 'region', 'time', 'sort'].forEach((k) => $('#lx-' + k).addEventListener('change', (e) => { state[k] = e.target.value; run(); }));
    $('#lx-diet').addEventListener('click', (e) => { const b = e.target.closest('[data-diet]'); if (!b) return; state.diet = b.dataset.diet; run(); });
    document.querySelector('[data-screen="explore"]').addEventListener('click', (e) => {
      const t = e.target.closest('[data-tog],[data-no],[data-quick],[data-page],[data-lx-reset],.lx-row,#lx-reset');
      if (!t) return;
      if (t.dataset.tog) { state[t.dataset.tog] = !state[t.dataset.tog]; return run(); }
      if (t.dataset.no) { const a = t.dataset.no; state.no = state.no.includes(a) ? state.no.filter((x) => x !== a) : [...state.no, a]; return run(); }
      if (t.dataset.quick) {
        const k = t.dataset.quick;
        if (k === 'veg' || k === 'vegan') state.diet = state.diet === k ? '' : k;
        else if (k === 'quick') state.time = state.time === '20' ? '' : '20';
        else state[k] = !state[k];
        return run();
      }
      if (t.dataset.page != null) { state.page = Number(t.dataset.page); renderList(); $('#lx-status').scrollIntoView({ block: 'start', behavior: 'smooth' }); return; }
      if (t.hasAttribute('data-lx-reset') || t.id === 'lx-reset') { Object.assign(state, { diet: '', cat: '', meal: '', kmin: '', kmax: '', hp: false, lc: false, hf: false, ls: false, lowsalt: false, pp: false, src: '', region: '', time: '', no: [] }); return run(); }
      if (t.classList.contains('lx-row') && t.dataset.i != null) openItem(result[Number(t.dataset.i)]);
    });
    $('#lx-pdf').addEventListener('click', () => exportPdf());
    $('#lx-xls').addEventListener('click', () => exportCsv());

    // ── Detail dialog ──
    const r1 = (v) => Math.round(v * 10) / 10;
    function dishFor(x) {
      if (x.fid != null) return DB.FOODS[x.fid];
      if (x.gen) return ctx.genDish(x.gen);
      return null;
    }
    function openItem(x) {
      if (!x) return;
      view = x; viewServes = 1; viewGrams = 100;
      renderItem();
      ctx.openDialog(dlg);
    }
    function nutriGrid(x, k) {
      const cell = (v, label, unit) => `<div><b>${v == null ? '—' : unit ? r1(v * k) : Math.round(v * k)}${v == null ? '' : unit}</b><small>${label}</small></div>`;
      return `<div class="rd-nutri lx-nutri">${cell(x.kcal, 'kcal', '')}${cell(x.p, 'protein', ' g')}${cell(x.c, 'carbs', ' g')}${cell(x.f, 'fat', ' g')}${x.k === 'f' && (x.fib != null || x.sugar != null) ? cell(x.fib, 'fibre', ' g') + cell(x.sugar, 'sugar', ' g') + cell(x.salt, 'salt', ' g') : ''}</div>`;
    }
    function addBlock(x) {
      const plan = ctx.getPlan();
      if (!plan) return '<p class="muted lx-add-note">Open or create a diet chart to add this to a meal.</p>';
      const have = plan.days[0].meals.map((m) => m.slot);
      const pick = (x.meal || []).find((m) => have.includes(m)) || (x.meal || []).includes('drinks') && have.find((m) => m === 'midmorning' || m === 'evening') || (have.includes('lunch') ? 'lunch' : have[0]);
      const slots = plan.days[0].meals.map((m) => `<option value="${m.slot}"${m.slot === pick ? ' selected' : ''}>${esc(m.label)}</option>`).join('');
      const days = '<option value="all">All days</option>' + plan.days.map((d, i) => `<option value="${i}">${esc(d.day)}</option>`).join('');
      return `<div class="lx-add card-inset"><b>Add to the current chart</b><div class="row"><label>Day<select id="lx-add-day">${days}</select></label><label>Meal<select id="lx-add-slot">${slots}</select></label></div><button type="button" class="btn primary" data-lx-add>＋ Add ${x.k === 'f' && x.basis === '100 g' ? `${viewGrams} g` : viewServes > 1 ? `${viewServes} servings` : '1 serving'}</button></div>`;
    }
    function renderItem() {
      const x = view;
      const dish = dishFor(x);
      const per100 = x.k === 'f' && x.basis === '100 g';
      const k = per100 ? viewGrams / 100 : viewServes;
      $('#lx-d-title').textContent = `${iconOf(x)} ${x.name}`;
      $('#lx-d-sub').textContent = [x.cat, SRC[x.src], x.region && REGION_NAMES[x.region], x.alias && x.src !== 'gen' ? x.alias : ''].filter(Boolean).join(' · ');
      const badges = `<div class="lx-badges"><span class="lx-b ${x.diet}"><i class="diet-dot ${x.diet}"></i>${esc(DIET_LABEL[x.diet])}</span>${isHighProtein(x) ? '<span class="lx-b hp">High protein</span>' : ''}${isLowCarb(x) ? '<span class="lx-b lc">Low carb</span>' : ''}${x.pp ? '<span class="lx-b pp">Protein powder</span>' : ''}<span class="lx-b">${x.ppk} g protein / 100 kcal</span>${x.allergens.length ? `<span class="lx-b warn">Contains: ${esc(x.allergens.join(', '))}</span>` : ''}</div>`;
      const qty = per100
        ? `<div class="serv"><span>Amount</span><div class="chips small" id="lx-grams">${[25, 50, 100, 150, 200, 250].map((g) => `<button type="button" class="chip" data-grams="${g}" aria-pressed="${g === viewGrams}">${g} g</button>`).join('')}</div></div>`
        : `<div class="serv"><span>Servings <small>(1 = ${esc(x.basis)})</small></span><div class="stepper"><button type="button" class="icon-btn" data-serves="-1" aria-label="Fewer">−</button><span>${viewServes}</span><button type="button" class="icon-btn" data-serves="1" aria-label="More">+</button></div></div>`;
      const hasRecipe = dish && (x.recipe || dish.recipe);
      let body = badges + qty;
      if (hasRecipe) body += ctx.recipeBody(dish, viewServes); // its own nutrition grid, scaled
      else body += nutriGrid(x, k);
      if (!hasRecipe && per100) body += `<p class="muted lx-note">Values per 100 g from ${esc(SRC[x.src])}${x.src !== 'ifct' && x.src !== 'app' ? '; diet type and allergens are inferred from the name — check the label' : ''}.</p>`;
      if (x.pp) body += '<p class="muted lx-note">Protein powder values are typical label values for unflavoured powder — brands differ, check the pack.</p>';
      body += addBlock(x);
      $('#lx-d-body').innerHTML = body;
      $('#lx-d-foot').innerHTML = `<button type="button" class="btn ghost" data-close>Close</button>${dish && (x.recipe || dish.recipe) ? `<button type="button" class="btn primary" data-lx-print>${ctx.ICON.print} Recipe PDF</button>` : ''}`;
    }
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) return ctx.closeDialog(dlg);
      const b = e.target.closest('button');
      if (!b || !view) return;
      if (b.hasAttribute('data-close')) return ctx.closeDialog(dlg);
      if (b.dataset.grams) { viewGrams = Number(b.dataset.grams); return renderItem(); }
      if (b.dataset.serves) { viewServes = Math.min(12, Math.max(1, viewServes + Number(b.dataset.serves))); return renderItem(); }
      if (b.hasAttribute('data-lx-print')) { ctx.closeDialog(dlg); return ctx.printDish(dishFor(view), viewServes); }
      if (b.hasAttribute('data-lx-add')) {
        const x = view;
        const day = $('#lx-add-day').value;
        const slot = $('#lx-add-slot').value;
        const per100 = x.k === 'f' && x.basis === '100 g';
        const item = x.fid != null
          ? { fid: x.fid, qty: per100 ? viewGrams : DB.FOODS[x.fid].qty * viewServes }
          : per100
            ? { name: x.name, qty: viewGrams, unit: 'g', per: 100, kcal: x.kcal, p: x.p, c: x.c, f: x.f }
            : { name: x.name, qty: viewServes, unit: 'serving', per: 1, kcal: x.kcal, p: x.p, c: x.c, f: x.f };
        const ok = ctx.addToChart(item, day === 'all' ? null : Number(day), slot);
        if (ok) { ctx.closeDialog(dlg); toast(`${x.name} added to ${day === 'all' ? 'every day' : ctx.getPlan().days[Number(day)].day} · ${ctx.getPlan().days[0].meals.find((m) => m.slot === slot).label}.`); }
      }
    });

    // ── Exports ──
    function filterSummary() {
      const parts = [];
      if (state.q) parts.push(`“${state.q}”`);
      if (state.type) parts.push(state.type === 'f' ? 'Foods' : 'Recipes');
      if (state.diet) parts.push(DIET_LABEL[state.diet]);
      if (state.cat) parts.push(state.cat);
      if (state.meal) parts.push(MEALS[state.meal]);
      if (state.kmin || state.kmax) parts.push(`${state.kmin || 0}–${state.kmax || '∞'} kcal`);
      TOGGLES.forEach(([k, v]) => { if (state[k]) parts.push(v); });
      if (state.src) parts.push(SRC[state.src]);
      if (state.region) parts.push(state.region === 'india' ? 'Indian' : state.region === 'world' ? 'World' : REGION_NAMES[state.region]);
      if (state.time) parts.push(`≤ ${state.time} min`);
      state.no.forEach((a) => parts.push(NO[a]));
      return parts.join(' · ') || 'All foods & recipes';
    }
    function exportCsv() {
      if (!result.length) return toast('Nothing to export — change the filters.');
      const ING = ctx.ING;
      const rows = [['Type', 'Name', 'Category', 'Diet', 'Source', 'Cuisine', 'Per', 'kcal', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Fibre (g)', 'Sugar (g)', 'Salt (g)', 'Protein per 100 kcal', 'Prep + cook (min)', 'Allergens', 'Protein powder', 'Ingredients (1 serving)']];
      result.forEach((x) => rows.push([
        x.recipe ? 'Recipe' : 'Food', x.name, x.cat, DIET_LABEL[x.diet], SRC[x.src], REGION_NAMES[x.region] || '', x.basis, Math.round(x.kcal), x.p, x.c, x.f,
        x.fib == null ? '' : x.fib, x.sugar == null ? '' : x.sugar, x.salt == null ? '' : x.salt, x.ppk, x.time || '', x.allergens.join(', '), x.pp ? 'Yes' : '',
        x.gen ? x.gen.ing.map(([key, g]) => `${ING[key].name} ${g} ${ING[key].cat === 'drink' || /milk|water|juice/i.test(ING[key].name) ? 'ml' : 'g'}`).join('; ') : '',
      ]));
      rows.push([], ['Filters', filterSummary()], ['Credits', root.FOODLIB_DATA ? root.FOODLIB_DATA.attribution : ''], ['Recipes', 'The Prime Fit — kcal, protein, carbs and fat calculated from the ingredients. Protein powders: typical label values.']);
      const csv = '﻿' + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
      ctx.saveFile(`ThePrimeFit_Library_${new Date().toISOString().slice(0, 10)}_${result.length}.csv`, 'text/csv', csv);
      toast(`Excel file (CSV) with ${num(result.length)} rows saved.`);
    }
    function exportPdf() {
      if (!result.length) return toast('Nothing to export — change the filters.');
      const list = result.slice(0, PDF_MAX);
      const per = 30;
      const pages = [];
      for (let i = 0; i < list.length; i += per) pages.push(list.slice(i, i + per));
      const head = `<header class="ps-head sm"><img src="img/logo.jpg" alt="The Prime Fit"><div class="ps-title"><h1>Foods &amp; Recipes<small>${esc(filterSummary())}</small></h1><div class="ps-web">${num(result.length)} result${result.length === 1 ? '' : 's'}${result.length > list.length ? ` · first ${list.length} shown (export Excel for all)` : ''}</div></div></header>`;
      const table = (rows, start) => `<table class="lx-pt"><thead><tr><th>#</th><th>Name</th><th>Category</th><th>Diet</th><th>Per</th><th>kcal</th><th>Protein</th><th>Carbs</th><th>Fat</th><th>P/100 kcal</th></tr></thead><tbody>${rows.map((x, i) => `<tr><td>${start + i + 1}</td><td><b>${esc(x.name)}</b><small>${esc(SRC[x.src])}${x.time ? ` · ${x.time} min` : ''}</small></td><td>${esc(x.cat)}</td><td>${esc(DIET_LABEL[x.diet])}</td><td>${esc(x.basis)}</td><td>${Math.round(x.kcal)}</td><td>${x.p} g</td><td>${x.c} g</td><td>${x.f} g</td><td>${x.ppk}</td></tr>`).join('')}</tbody></table>`;
      const credit = `<p class="lx-pcredit">${esc(root.FOODLIB_DATA ? root.FOODLIB_DATA.attribution : '')} Recipes: The Prime Fit — nutrition calculated from ingredients. Protein powders: typical label values.</p>`;
      ctx.printPages(pages.map((rows, pi) => (pi === 0 ? head : '') + table(rows, pi * per) + (pi === pages.length - 1 ? credit : '')), `ThePrimeFit_Library_${list.length}`);
    }

    return {
      render,
      /** Foods changed (dietitian added / edited a food): rebuild the combined list next time. */
      foodsChanged() { if (ITEMS && LIB) { rebuild(); if (ctx.isCurrent()) run(true); } },
      load,
      counts,
      state,
      result: () => result,
    };
  }

  // ───────────────────────────────────────────────────────────────────
  // Recipes screen (diet app): every recipe — the diet-chart dishes plus the generated ones.

  /**
   * Sizes of the big lazy-loaded files, so the dashboard can show the full counts without
   * loading them at start (tests/library.test.js checks these match js/recipegen.js and js/foodlib.js).
   */
  const TOTALS = { genRecipes: 10342, libFoods: 8196 };

  /** Generated recipes in a varied order: one of each recipe type in turn (bowl, wrap, curry …). */
  function interleave(list) {
    const groups = new Map();
    list.forEach((x) => { if (!groups.has(x.cat)) groups.set(x.cat, []); groups.get(x.cat).push(x); });
    const gs = [...groups.values()];
    const out = [];
    for (let i = 0; out.length < list.length; i++) gs.forEach((g) => { if (i < g.length) out.push(g[i]); });
    return out;
  }

  /** A generated recipe as a Recipes-screen row. */
  function genRecipeItem(r, ING) {
    const ingTxt = r.ing.map(([k]) => (ING[k] ? ING[k].name + ' ' + ING[k].hi : '')).join(' ');
    return {
      r, name: r.name, nl: r.name.toLowerCase(), diet: r.diet, kcal: r.kcal, p: r.p, cat: r.cat, cats: ['g:' + r.cat], meal: r.meal,
      time: r.prep + r.cook, n: r.ing.length, gen: true, txt: (r.name + ' ' + r.cat + ' ' + ingTxt).toLowerCase(),
    };
  }

  /**
   * Filter + rank the Recipes screen. `s`: q, diet (veg = veg + vegan; vegan / egg / nonveg exact),
   * meal, cat ('c:<planner category>' or 'g:<recipe type>'), hp, quick (≤ 20 min), own, mine.
   * Without a search the list keeps its given order.
   */
  function recipeQuery(items, s) {
    const words = String(s.q || '').toLowerCase().split(/\s+/).filter(Boolean);
    const out = [];
    for (let i = 0; i < items.length; i++) {
      const x = items[i];
      if (s.diet && (s.diet === 'veg' ? x.diet !== 'veg' && x.diet !== 'vegan' : x.diet !== s.diet)) continue;
      if (s.meal && !x.meal.includes(s.meal)) continue;
      if (s.cat && !x.cats.includes(s.cat)) continue;
      if (s.hp && !isHighProtein(x)) continue;
      if (s.quick && !(x.time > 0 && x.time <= 20)) continue;
      if (s.own && !x.own) continue;
      if (s.mine && !x.mine) continue;
      if (words.length) {
        let ok = true;
        for (let w = 0; w < words.length; w++) if (x.txt.indexOf(words[w]) < 0) { ok = false; break; }
        if (!ok) continue;
      }
      out.push(x);
    }
    if (words.length) {
      const w0 = words[0];
      const re = new RegExp('(^|[^a-z])' + w0.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const rank = (x) => (x.own ? 0 : 1) + (x.nl.startsWith(w0) ? 0 : re.test(x.nl) ? 1 : x.nl.indexOf(w0) >= 0 ? 2 : 3) * 10 + (x.gen ? 1 : 0) * 2;
      out.forEach((x) => { x._r = rank(x) * 1000 + Math.min(x.nl.length, 999); });
      out.sort((a, b) => a._r - b._r);
    }
    return out;
  }

  const api = { init, parseFoodLib, fromDb, fromGen, prepare, query, isHighProtein, isLowCarb, PAGE, TOTALS, MEALS, ROLE_MEALS, interleave, genRecipeItem, recipeQuery };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LIBRARY = api;
})(typeof window !== 'undefined' ? window : globalThis);
