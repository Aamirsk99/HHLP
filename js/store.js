/*
 * Saved patients and diet charts (localStorage), compact plan packing, backups,
 * and the chart data hidden inside printed PDFs so a previous chart can be read
 * back to make next week's chart. No DOM access: works in the browser and in Node.
 */
(function (root) {
  const KEYS = { patients: 'primefit.patients.v1', charts: 'primefit.charts.v1', foods: 'primefit.customFoods', recipes: 'primefit.customRecipes' };
  const MARK = 'TPF1';

  function createStore(storage, P, DB) {
    // Built-in foods come first in DB.FOODS; the dietitian's own foods are appended (syncFoods).
    if (DB.BUILTIN == null) DB.BUILTIN = DB.FOODS.length;
    let byName = {};
    const indexFoods = () => { byName = {}; DB.FOODS.forEach((f) => { byName[f.name] = f; }); };
    indexFoods();

    const read = (k) => { try { return JSON.parse(storage.getItem(k) || '[]') || []; } catch (_) { return []; } };
    const write = (k, v) => {
      try { storage.setItem(k, JSON.stringify(v)); return true; } catch (_) { return false; }
    };
    const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    // ── Plan packing ─────────────────────────────────────────────
    // Items of the dietitian's own foods have ids after the built-in foods.
    const userFoodOf = (i) => !i.custom && i.fid != null && i.fid >= DB.BUILTIN;
    // The dietitian's own foods carry their nutrition, so charts survive the food being edited away or deleted.
    const packItem = (i) => {
      if (userFoodOf(i)) return { c: i.name, q: i.qty, u: i.unit, k: i.per.kcal, p: i.per.p, pq: i.per.qty, cc: i.per.c, ff: i.per.f, uf: 1 };
      return i.custom || i.fid == null
        ? { c: i.name, q: i.qty, u: i.unit, k: i.per.kcal, p: i.per.p, pq: i.per.qty, ...(i.per.c ? { cc: i.per.c } : {}), ...(i.per.f ? { ff: i.per.f } : {}) }
        : [i.name, i.qty];
    };

    function unpackItem(x) {
      if (Array.isArray(x)) {
        const f = byName[x[0]];
        return f ? P.makeItem(f, x[1]) : P.customItem(x[0], x[1], 'serving', 0, 0);
      }
      if (x.uf && byName[x.c] && byName[x.c].user) return P.makeItem(byName[x.c], x.q);
      const it = P.customItem(x.c, x.q, x.u, x.k, x.p);
      if (x.cc) it.per.c = x.cc;
      if (x.ff) it.per.f = x.ff;
      if (x.pq) it.per.qty = x.pq;
      if (x.pq || x.cc || x.ff) P.setItemQty(it, x.q);
      return it;
    }

    function packPlan(plan) {
      return plan.days.map((d) => ({
        n: d.day,
        m: d.meals.map((e) => [e.slot, e.time, e.target, e.targetP, e.locked ? 1 : 0, e.meal ? e.meal.items.map(packItem) : null]),
      }));
    }

    function unpackPlan(days, profile) {
      const plan = {
        targets: P.computeTargets(profile),
        days: days.map((d) => P.refreshDay({
          day: d.n,
          meals: d.m.map(([slot, time, target, targetP, locked, items]) => {
            const meal = items ? P.recalcMeal({ name: '', items: items.map(unpackItem) }) : null;
            if (meal) meal.name = meal.items.map((i) => i.name).join(' + ');
            return { slot, label: P.SLOTS[slot].label, time, target, targetP, locked: !!locked, meal };
          }),
        })),
      };
      plan.combos = P.countCombinations(DB, profile);
      return plan;
    }

    // ── Patients ─────────────────────────────────────────────────
    const PATIENT_FIELDS = ['name', 'patientId', 'phone', 'age', 'sex', 'heightCm', 'weightKg', 'notes'];
    const listPatients = () => read(KEYS.patients).sort((a, b) => b.updated - a.updated);
    const getPatient = (id) => read(KEYS.patients).find((p) => p.id === id) || null;

    /** Save (or update) the patient of a profile; returns the patient id. Generic charts return null. */
    function upsertPatient(profile) {
      if (!profile.name) return null;
      const all = read(KEYS.patients);
      const low = (s) => String(s || '').trim().toLowerCase();
      let p = all.find((x) => x.id === profile.patientRef)
        || (profile.patientId && all.find((x) => low(x.patientId) === low(profile.patientId)))
        || all.find((x) => low(x.name) === low(profile.name) && low(x.phone) === low(profile.phone));
      const now = Date.now();
      if (!p) { p = { id: uid('p'), created: now }; all.push(p); }
      PATIENT_FIELDS.forEach((k) => { p[k] = profile[k]; });
      p.updated = now;
      write(KEYS.patients, all);
      return p.id;
    }

    function deletePatient(id, withCharts) {
      write(KEYS.patients, read(KEYS.patients).filter((p) => p.id !== id));
      const charts = read(KEYS.charts);
      write(KEYS.charts, withCharts ? charts.filter((c) => c.patientRef !== id) : charts.map((c) => (c.patientRef === id ? { ...c, patientRef: null } : c)));
    }

    // ── Charts ───────────────────────────────────────────────────
    const listCharts = (patientRef) => read(KEYS.charts)
      .filter((c) => patientRef === undefined || c.patientRef === patientRef)
      .sort((a, b) => b.updated - a.updated);
    const getChart = (id) => read(KEYS.charts).find((c) => c.id === id) || null;

    /** Save a chart ({id?, profile, plan, week, parent}); returns the stored record (without the full plan). */
    function saveChart(rec) {
      const all = read(KEYS.charts);
      const now = Date.now();
      const patientRef = upsertPatient(rec.profile);
      if (patientRef) rec.profile.patientRef = patientRef;
      let c = rec.id && all.find((x) => x.id === rec.id);
      if (!c) { c = { id: rec.id || uid('c'), created: now }; all.push(c); }
      Object.assign(c, {
        patientRef, name: rec.profile.name || '', plan: rec.profile.plan, week: rec.week || 1, parent: rec.parent || null,
        kcal: rec.plan.targets.calories, protein: rec.plan.targets.protein, days: rec.plan.days.length,
        profile: rec.profile, data: packPlan(rec.plan), updated: now,
      });
      if (!write(KEYS.charts, all)) return null;
      return c;
    }

    function loadChart(id) {
      const c = getChart(id);
      if (!c) return null;
      return { id: c.id, week: c.week || 1, parent: c.parent, profile: c.profile, plan: unpackPlan(c.data, c.profile) };
    }

    const deleteChart = (id) => write(KEYS.charts, read(KEYS.charts).filter((c) => c.id !== id));

    // ── The dietitian's own foods ────────────────────────────────
    const DIETS = ['vegan', 'veg', 'egg', 'nonveg'];
    const readObj = (k) => { try { const v = JSON.parse(storage.getItem(k) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (_) { return {}; } };
    const listCustomFoods = () => read(KEYS.foods).sort((a, b) => a.name.localeCompare(b.name));
    const getCustomFood = (id) => read(KEYS.foods).find((f) => f.id === id) || null;
    const meatsOf = (name) => {
      const n = name.toLowerCase();
      const m = [];
      if (/fish|prawn|shrimp|salmon|tuna|crab|maach|meen|seafood/.test(n)) m.push('fish');
      if (/mutton|lamb|goat|keema/.test(n)) m.push('mutton');
      if (/chicken|murg/.test(n) || !m.length) m.push('chicken');
      return m;
    };

    /** A clean food record (throws with a message the user can read). */
    function cleanFood(rec) {
      const name = String(rec.name || '').trim().replace(/\s+/g, ' ');
      if (!name) throw new Error('Enter the food name.');
      const roles = [...new Set((rec.roles || []).filter((r) => typeof r === 'string' && r && r !== 'ingredient'))];
      if (!roles.length) throw new Error('Choose at least one meal it can be used for.');
      const n = (v) => Math.max(0, Math.round((Number(v) || 0) * 10) / 10);
      const qty = Number(rec.qty) > 0 ? Number(rec.qty) : 1;
      const diet = DIETS.includes(rec.diet) ? rec.diet : 'veg';
      return {
        name, hi: String(rec.hi || '').trim(), roles, diet, region: rec.region || 'IN', qty, unit: String(rec.unit || 'serving').trim() || 'serving',
        kcal: Math.round(n(rec.kcal)), p: n(rec.p), c: n(rec.c), f: n(rec.f),
        allergens: [...new Set(rec.allergens || [])], flags: [...new Set(rec.flags || [])],
        meats: diet === 'nonveg' ? (rec.meats && rec.meats.length ? rec.meats : meatsOf(name)) : undefined,
      };
    }

    /** Save (add or update) one of the dietitian's foods; returns the saved record. */
    function saveCustomFood(rec) {
      const clean = cleanFood(rec);
      const all = read(KEYS.foods);
      const low = clean.name.toLowerCase();
      const builtin = DB.FOODS.slice(0, DB.BUILTIN).some((f) => f.name.toLowerCase() === low);
      if (builtin || all.some((f) => f.id !== rec.id && f.name.toLowerCase() === low)) throw new Error(`"${clean.name}" is already in the food library — use another name.`);
      const now = Date.now();
      let f = rec.id && all.find((x) => x.id === rec.id);
      if (f && f.name !== clean.name) { // keep its recipe with it
        const recipes = readObj(KEYS.recipes);
        if (recipes[f.name] && !recipes[clean.name]) { recipes[clean.name] = recipes[f.name]; delete recipes[f.name]; write(KEYS.recipes, recipes); }
      }
      if (!f) { f = { id: uid('f'), created: now }; all.push(f); }
      Object.assign(f, clean, { updated: now });
      if (!write(KEYS.foods, all)) throw new Error('Storage is full — export a backup and delete old charts.');
      syncFoods();
      return f;
    }

    function deleteCustomFood(id) {
      const all = read(KEYS.foods);
      const f = all.find((x) => x.id === id);
      write(KEYS.foods, all.filter((x) => x.id !== id));
      if (f) deleteRecipe(f.name);
      syncFoods();
    }

    /** Put the dietitian's foods into DB.FOODS (after the built-in foods) so every screen and the planner use them. */
    function syncFoods() {
      DB.FOODS.length = DB.BUILTIN;
      read(KEYS.foods).forEach((rec) => { // storage order, so adding a food never moves the others
        if (!rec || !rec.name || !Array.isArray(rec.roles)) return;
        DB.FOODS.push({ ...rec, id: DB.FOODS.length, user: rec.id, allergens: [...(rec.allergens || [])], flags: [...(rec.flags || [])], roles: [...rec.roles] });
      });
      indexFoods();
      return DB.FOODS.slice(DB.BUILTIN);
    }

    // ── Step-by-step recipes written by the dietitian (by food name) ──
    const listRecipes = () => readObj(KEYS.recipes);
    const getRecipe = (name) => listRecipes()[name] || null;
    function saveRecipe(name, r) {
      if (!name) throw new Error('Choose the food this recipe is for.');
      const txt = (s) => String(s == null ? '' : s).trim();
      const ing = (r.ing || []).map((x) => ({ name: txt(x.name), qty: txt(x.qty) })).filter((x) => x.name);
      const steps = (r.steps || []).map(txt).filter(Boolean);
      if (!steps.length) throw new Error('Add at least one method step.');
      const rec = { ing, steps, prep: txt(r.prep), cook: txt(r.cook), serves: Number(r.serves) > 0 ? Number(r.serves) : 1, tips: txt(r.tips), updated: Date.now() };
      const all = listRecipes();
      all[name] = rec;
      if (!write(KEYS.recipes, all)) throw new Error('Storage is full — export a backup and delete old charts.');
      return rec;
    }
    function deleteRecipe(name) {
      const all = listRecipes();
      if (!all[name]) return false;
      delete all[name];
      write(KEYS.recipes, all);
      return true;
    }

    // ── Backup ───────────────────────────────────────────────────
    function exportAll() {
      return JSON.stringify({
        app: 'The Prime Fit', v: 6, exported: new Date().toISOString(), patients: read(KEYS.patients), charts: read(KEYS.charts),
        customFoods: read(KEYS.foods), customRecipes: listRecipes(),
      });
    }

    /** Merge a backup into the saved data; returns counts added. */
    function importAll(json) {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      if (!data || !Array.isArray(data.patients) || !Array.isArray(data.charts)) throw new Error('Not a Prime Fit backup file.');
      const merge = (key, list) => {
        const all = read(key);
        const ids = new Set(all.map((x) => x.id));
        const add = list.filter((x) => x && x.id && !ids.has(x.id));
        write(key, all.concat(add));
        return add.length;
      };
      const out = { patients: merge(KEYS.patients, data.patients), charts: merge(KEYS.charts, data.charts) };
      if (Array.isArray(data.customFoods) && data.customFoods.length) {
        const all = read(KEYS.foods);
        const names = new Set([...all.map((f) => f.name.toLowerCase()), ...DB.FOODS.slice(0, DB.BUILTIN).map((f) => f.name.toLowerCase())]);
        const add = data.customFoods.filter((f) => f && f.id && f.name && Array.isArray(f.roles) && !names.has(String(f.name).toLowerCase()));
        if (add.length) { write(KEYS.foods, all.concat(add)); syncFoods(); out.foods = add.length; }
      }
      if (data.customRecipes && typeof data.customRecipes === 'object') {
        const all = listRecipes();
        let n = 0;
        Object.entries(data.customRecipes).forEach(([k, r]) => { if (!all[k] && r && Array.isArray(r.steps)) { all[k] = r; n++; } });
        if (n) { write(KEYS.recipes, all); out.recipes = n; }
      }
      return out;
    }

    // ── Data hidden in the PDF ───────────────────────────────────
    /** Compact chart data for the PDF: food ids (with the database size, to detect changes). */
    function pdfPayload(profile, plan, week) {
      const days = plan.days.map((d) => [d.day, d.meals.map((e) => [e.slot, e.meal ? e.meal.items.map((i) => {
        if (userFoodOf(i)) return ['c', i.name, i.qty, i.unit, i.per.kcal, i.per.p, i.per.qty, i.per.c, i.per.f, 1];
        return i.custom || i.fid == null ? ['c', i.name, i.qty, i.unit, i.per.kcal, i.per.p] : [i.fid, i.qty];
      }) : []])]);
      const json = JSON.stringify({ v: 5, n: DB.BUILTIN, w: week || 1, p: profile, d: days });
      return MARK + '[' + b64encode(json) + ']' + MARK;
    }

    /**
     * Read a previous chart from PDF text. Returns
     *   { exact: true, profile, plan, week }                 when the hidden data is found, or
     *   { exact: false, foods: [names], name }               from the food names printed on it.
     */
    function readPdfText(text, I) {
      const compact = text.replace(/\s+/g, '');
      const m = compact.match(new RegExp(MARK + '\\[([A-Za-z0-9+/=]+)\\]' + MARK));
      if (m) {
        try {
          const data = JSON.parse(b64decode(m[1]));
          if (data.v === 5 && data.p && Array.isArray(data.d)) {
            const sameDb = data.n === DB.BUILTIN;
            const days = data.d.map(([day, meals]) => ({
              n: day,
              m: meals.map(([slot, items]) => {
                const s = P.SLOTS[slot] || P.SLOTS.lunch;
                return [slot, (data.p.times && data.p.times[slot]) || s.time, 0, 0, 0, items.map((x) => {
                  if (x[0] === 'c') return { c: x[1], q: x[2], u: x[3], k: x[4], p: x[5], pq: x[6], cc: x[7], ff: x[8], uf: x[9] };
                  const f = sameDb && x[0] < DB.BUILTIN ? DB.FOODS[x[0]] : null;
                  return f ? [f.name, x[1]] : null;
                }).filter(Boolean)];
              }),
            }));
            const plan = unpackPlan(days, data.p);
            // Restore slot targets from the profile.
            const slots = P.slotTargets(plan.targets.calories, data.p.meals || 5, data.p.earlyDrink !== false);
            plan.days.forEach((d) => d.meals.forEach((e) => {
              const s = slots.find((x) => x.slot === e.slot);
              if (s) { e.target = Math.round(s.kcal); e.targetP = Math.round(plan.targets.protein * s.share); }
            }));
            if (sameDb || plan.days.some((d) => d.meals.some((e) => e.meal && e.meal.items.length))) {
              return { exact: true, profile: data.p, plan, week: data.w || 1 };
            }
          }
        } catch (_) { /* fall back to food names */ }
      }
      return { exact: false, foods: findFoodNames(text, I) };
    }

    /** Dishes whose name (English or any chart language) appears in the text. */
    function findFoodNames(text, I) {
      const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ');
      let hay = norm(text);
      const cands = [];
      DB.FOODS.forEach((f) => {
        if (f.ingKey) return;
        const names = new Set([f.name]);
        if (I) I.CODES.forEach((l) => names.add(I.foodName(l, f.name)));
        names.forEach((n) => { if (n && n.length >= 3) cands.push([norm(n), f.name]); });
      });
      cands.sort((a, b) => b[0].length - a[0].length); // "Dal tadka" before "Dal"
      const found = new Set();
      cands.forEach(([n, name]) => {
        if (hay.includes(n)) {
          found.add(name);
          hay = hay.split(n).join(' · ');
        }
      });
      return [...found];
    }

    return {
      KEYS, packPlan, unpackPlan, listPatients, getPatient, upsertPatient, deletePatient,
      listCharts, getChart, saveChart, loadChart, deleteChart, exportAll, importAll, pdfPayload, readPdfText, findFoodNames,
      listCustomFoods, getCustomFood, saveCustomFood, deleteCustomFood, syncFoods, listRecipes, getRecipe, saveRecipe, deleteRecipe,
    };
  }

  function b64encode(str) {
    if (typeof Buffer !== 'undefined' && typeof btoa === 'undefined') return Buffer.from(str, 'utf8').toString('base64');
    return btoa(unescape(encodeURIComponent(str)));
  }
  function b64decode(b64) {
    if (typeof Buffer !== 'undefined' && typeof atob === 'undefined') return Buffer.from(b64, 'base64').toString('utf8');
    return decodeURIComponent(escape(atob(b64)));
  }

  /** In-memory storage with the localStorage interface (tests, private mode). */
  function memoryStorage() {
    const m = new Map();
    return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
  }

  const api = { createStore, memoryStorage, MARK };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.STORE = api;
})(typeof window !== 'undefined' ? window : globalThis);
