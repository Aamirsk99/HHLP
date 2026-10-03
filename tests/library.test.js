const test = require('node:test');
const assert = require('node:assert/strict');
const ING = require('../js/ingredients.js');
const DB = require('../js/fooddb.js');
const P = require('../js/planner.js');
const B = require('../tools/build-foodlib.js');
const FL = require('../js/foodlib.js');
const G = require('../js/recipegen.js');
const LIB = require('../js/library.js');

const base = {
  age: 30, sex: 'female', heightCm: 165, weightKg: 70, activity: 'light', goal: 'lose',
  diet: 'veg', cuisine: 'in', meals: 5, earlyDrink: true, allergies: [], conditions: [], dislikes: [],
  startDay: 'Monday',
};

// ── Food list build ───────────────────────────────────────────────
test('food list build: diet inference from category and name', () => {
  assert.equal(B.inferDiet('Chicken, breast, roasted', 'Meat & poultry'), 'nonveg');
  assert.equal(B.inferDiet('Soup, chicken noodle', 'Soups'), 'nonveg');
  assert.equal(B.inferDiet('Beans, kidney, canned', 'Pulses & legumes'), 'vegan');
  assert.equal(B.inferDiet('Eggplant, raw', 'Vegetables'), 'vegan');
  assert.equal(B.inferDiet('Noodles, egg, cooked', 'Grains, millets & pasta'), 'egg');
  assert.equal(B.inferDiet('Cheese, cheddar', 'Dairy'), 'veg');
  assert.equal(B.inferDiet('Coconut milk drink', 'Dairy'), 'vegan');
  assert.equal(B.inferDiet('Peanut butter, smooth', 'Nuts & seeds'), 'vegan');
  assert.equal(B.inferDiet('Custard apple', 'Fruits & berries'), 'vegan');
  assert.equal(B.inferDiet('Mushrooms, oyster, raw', 'Vegetables'), 'vegan');
  assert.equal(B.inferDiet('Cake, pound', 'Desserts & sweets'), 'egg');
  assert.equal(B.inferDiet('Bread, white', 'Breads & bakery'), 'veg');
});

test('food list build: IFCT csv (kJ → kcal, Hindi alias), TempoLife json, de-duplication', () => {
  const csv = [
    '"Food Code; code","Food Name; name","Local Name; lang","Food Group; grup","Tags; tags","Energy; enerc","Total Fat; fatce","Carbohydrate; choavldf","Protein; protcnt","Dietary Fiber; fibtg"',
    '"A003","Bajra","H. Bajra; Tam. Kambu","Cereals and Millets","veg","1456","5.43","61.78","10.96","11.49"',
    '"O001","Chicken, poultry, leg","H. Murgi","Poultry","nonveg","500","4","0","19","0"',
    '"E001","Egg, hen, whole, raw","H. Anda","Egg and Egg Products","eggetarian nonveg","560","10","0","13","0"',
  ].join('\n');
  const ifct = B.fromIfct(csv);
  assert.equal(ifct.length, 3);
  assert.equal(ifct[0].name, 'Bajra');
  assert.equal(Math.round(ifct[0].kcal), 348); // 1456 kJ / 4.184
  assert.equal(ifct[0].alias, 'Bajra');
  assert.equal(ifct[0].diet, 'vegan');
  assert.equal(ifct[1].diet, 'nonveg');
  assert.equal(ifct[2].diet, 'egg');
  const tempo = B.fromTempo([
    { name: 'Lentils, raw', category: 'Kaunviljad', kcal_per_100g: 352, protein_g: 24.6, carbs_g: 63.4, fat_g: 1.1, fiber_g: 10.7, source: 'usda_sr_legacy' },
    { name: 'Lentils, raw', category: 'Kaunviljad', kcal_per_100g: 352, protein_g: 24.6, carbs_g: 63.4, fat_g: 1.1, fiber_g: 10.7, source: 'usda_sr_legacy' },
    { name: 'Lentils, raw', category: 'Kaunviljad', kcal_per_100g: 116, protein_g: 9, carbs_g: 20, fat_g: 0.4, fiber_g: 8, source: 'usda_sr_legacy' },
    { name: 'Broken row', category: 'Kaunviljad', kcal_per_100g: null, protein_g: 1, carbs_g: 1, fat_g: 1 },
  ]);
  assert.equal(tempo.length, 3); // the row without energy is dropped
  const merged = B.merge([tempo]);
  assert.deepEqual(merged.map((x) => x.name), ['Lentils, raw', 'Lentils, raw (entry 2)']);
  // encode → parse round trip as the app reads it
  const rows = B.encode(merged);
  const parsed = LIB.parseFoodLib({ rows, cats: B.CATEGORIES.map(([c]) => c), diets: B.DIETS, sources: B.SOURCES });
  assert.equal(parsed[0].name, 'Lentils, raw');
  assert.equal(parsed[0].cat, 'Pulses & legumes');
  assert.equal(parsed[0].src, 'usda');
  assert.equal(parsed[0].kcal, 352);
  assert.equal(parsed[0].p, 24.6);
  assert.equal(parsed[0].fib, 10.7);
  assert.equal(parsed[0].salt, null);
});

test('generated food list (js/foodlib.js) is real, complete and well formed', () => {
  const rows = FL.rows.split('\n');
  assert.equal(rows.length, FL.count);
  assert.ok(FL.count >= 8000, `only ${FL.count} foods`);
  assert.match(FL.attribution, /TempoLife \(tempolife\.app\), CC-BY-4\.0/);
  const foods = LIB.parseFoodLib(FL);
  const names = new Set();
  let plausible = 0;
  const src = {};
  for (const f of foods) {
    assert.ok(!names.has(f.name.toLowerCase()), `duplicate ${f.name}`);
    names.add(f.name.toLowerCase());
    assert.ok(['vegan', 'veg', 'egg', 'nonveg'].includes(f.diet), f.name);
    assert.ok(FL.cats.includes(f.cat), f.name);
    for (const k of ['kcal', 'p', 'c', 'f']) assert.ok(Number.isFinite(f[k]) && f[k] >= 0, `${f.name} ${k}`);
    assert.ok(f.p <= 100 && f.c <= 100 && f.f <= 100, f.name);
    const macro = f.p * 4 + f.c * 4 + f.f * 9;
    if (f.kcal < 40 || Math.abs(macro - f.kcal) / f.kcal < 0.3) plausible++;
    src[f.src] = (src[f.src] || 0) + 1;
  }
  assert.ok(plausible / foods.length > 0.95, `only ${plausible} of ${foods.length} plausible`);
  assert.ok(src.ifct >= 500 && src.usda >= 6000 && src.tempo >= 300, JSON.stringify(src));
});

// ── Recipe generator ──────────────────────────────────────────────
test('10,000+ generated recipes with unique names, full steps and times', () => {
  const list = G.all();
  assert.ok(list.length >= 10000, `only ${list.length}`);
  assert.equal(new Set(list.map((r) => r.name)).size, list.length);
  const appNames = new Set(DB.FOODS.map((f) => f.name));
  for (const r of list) {
    assert.ok(!appNames.has(r.name), `clashes with a chart food: ${r.name}`);
    assert.ok(r.ing.length >= (r.fam === 'shake' ? 1 : 2), r.name);
    assert.ok(r.prep > 0 && r.cook >= 0 && r.prep + r.cook <= 300, r.name);
    assert.ok(r.serving && r.cat && r.meal.length, r.name);
  }
  // Steps on a sample (all of them is slow-ish): measure → … → serve line with the computed kcal.
  for (let i = 0; i < list.length; i += 97) {
    const r = list[i];
    const steps = G.fullSteps(r);
    assert.ok(steps.length >= 5, r.name);
    assert.match(steps[0], /^Measure everything first/);
    assert.ok(steps[steps.length - 1].includes(`${r.kcal} kcal`), r.name);
    assert.ok(steps.every((s) => typeof s === 'string' && s.length > 10 && !/undefined|NaN|\{/.test(s)), r.name);
    const two = G.fullSteps(r, 2);
    assert.match(two[0], /for 2 servings/);
  }
});

test('generated recipe nutrition, diet and allergens are calculated from the ingredients', () => {
  const list = G.all();
  const animal = (k) => ING[k].tags.some((t) => ['chicken', 'mutton', 'fish'].includes(t));
  for (const r of list) {
    let kcal = 0, p = 0, c = 0, f = 0;
    for (const [k, g] of r.ing) {
      const x = ING[k];
      assert.ok(x, `unknown ingredient ${k} in ${r.name}`);
      kcal += (x.kcal * g) / 100; p += (x.p * g) / 100; c += (x.c * g) / 100; f += (x.f * g) / 100;
    }
    assert.equal(r.kcal, Math.round(kcal), r.name);
    assert.equal(r.p, Math.round(p * 10) / 10, r.name);
    assert.equal(r.c, Math.round(c * 10) / 10, r.name);
    assert.equal(r.f, Math.round(f * 10) / 10, r.name);
    const keys = r.ing.map(([k]) => k);
    if (r.diet === 'vegan') assert.ok(keys.every((k) => !ING[k].tags.includes('dairy') && !ING[k].tags.includes('egg') && !animal(k) && k !== 'honey'), r.name);
    if (keys.some(animal)) assert.equal(r.diet, 'nonveg', r.name);
    if (keys.some((k) => ING[k].tags.includes('dairy'))) assert.ok(r.allergens.includes('dairy'), r.name);
    if (keys.some((k) => ING[k].tags.includes('gluten'))) assert.ok(r.allergens.includes('gluten'), r.name);
    if (r.pp) assert.ok(G.POWDER_KEYS.includes(r.pp) && keys.includes(r.pp), r.name);
  }
  const bowl = G.find('Paneer & spinach brown rice bowl');
  assert.ok(bowl && bowl.diet === 'veg' && bowl.p > 15);
  const shake = G.find('Pea protein shake with water');
  assert.ok(shake && shake.diet === 'vegan' && shake.pp === 'plantp' && shake.p > 20);
});

test('recipe list is deterministic', () => {
  delete require.cache[require.resolve('../js/recipegen.js')];
  const again = require('../js/recipegen.js').all();
  const first = G.all();
  assert.equal(again.length, first.length);
  assert.deepEqual(again.slice(0, 50).map((r) => r.name), first.slice(0, 50).map((r) => r.name));
  assert.equal(again[again.length - 1].name, first[first.length - 1].name);
});

// ── Protein powder in the diet ────────────────────────────────────
test('protein powders: typical label values per scoop and shake foods', () => {
  for (const k of ['wheyiso', 'wheyconc', 'plantp', 'soyiso', 'casein']) {
    const x = ING[k];
    assert.ok(x && x.p >= 70 && x.kcal >= 330 && x.kcal <= 410, k);
  }
  for (const [key, pw] of Object.entries(P.PROTEIN_POWDERS)) {
    const f = DB.FOODS.find((x) => x.name === pw.food);
    assert.ok(f, `missing food for ${key}`);
    assert.deepEqual(f.roles, ['shake']);
    assert.equal(f.unit, 'scoop');
    assert.ok(f.p >= 20 && f.p <= 30 && f.kcal >= 90 && f.kcal <= 140, `${f.name}: ${f.kcal} kcal ${f.p} g`);
  }
  assert.equal(DB.FOODS.find((x) => x.name === 'Whey isolate shake (in water)').diet, 'veg');
  assert.equal(DB.FOODS.find((x) => x.name === 'Pea protein shake (in water)').diet, 'vegan');
});

const shakeItems = (plan) => plan.days.flatMap((d) => d.meals.filter((m) => m.meal).flatMap((m) => m.meal.items.map((i) => ({ slot: m.slot, i }))))
  .filter(({ i }) => /shake/i.test(i.name));

test('protein shake option: in the chosen meal every day, on target, no other shakes', () => {
  const p = { ...base, shakeOn: true, shakePowder: 'whey_iso', shakeScoops: 1.5, shakeWith: 'milk', shakeSlot: 'evening' };
  const plan = P.generatePlan(DB, p, 7);
  assert.equal(plan.shake.slot, 'evening');
  assert.equal(plan.shake.note, '');
  for (const d of plan.days) {
    const ev = d.meals.find((m) => m.slot === 'evening');
    const names = ev.meal.items.map((i) => i.name);
    assert.ok(names.includes('Whey isolate shake (in water)'), d.day);
    assert.ok(names.includes('Toned milk'), d.day);
    assert.equal(ev.meal.items.find((i) => i.name === 'Whey isolate shake (in water)').qty, 1.5);
    assert.ok(Math.abs(d.totals.kcal - plan.targets.calories) / plan.targets.calories < 0.15, `${d.day}: ${d.totals.kcal} vs ${plan.targets.calories}`);
  }
  assert.ok(shakeItems(plan).every(({ slot }) => slot === 'evening'), 'a random protein shake was added elsewhere');
  // Swapping the meal keeps the shake.
  const ei = plan.days[0].meals.findIndex((m) => m.slot === 'evening');
  P.swapMeal(DB, p, plan, 0, ei, P.rng(3));
  assert.ok(plan.days[0].meals[ei].meal.items.some((i) => i.name === 'Whey isolate shake (in water)'));
  // Off: no shake foods at all.
  const off = P.generatePlan(DB, { ...base }, 7);
  assert.equal(off.shake, null);
  assert.ok(off.days.every((d) => d.meals.every((m) => !m.meal || m.meal.items.every((i) => !/isolate shake|concentrate shake|casein protein shake|pea protein shake/i.test(i.name)))));
});

test('protein shake respects vegan diet, milk and soy allergy, and missing meals', () => {
  const vegan = P.generatePlan(DB, { ...base, diet: 'vegan', shakeOn: true, shakePowder: 'whey', shakeWith: 'milk', shakeSlot: 'auto' }, 3);
  assert.equal(vegan.shake.powder, 'pea');
  assert.equal(vegan.shake.with, 'soymilk');
  assert.match(vegan.shake.note, /Pea/);
  const all = shakeItems(vegan).map(({ i }) => i.name);
  assert.ok(all.length && all.every((n) => !/whey|casein/i.test(n)));
  assert.ok(vegan.days.every((d) => d.meals.every((m) => !m.meal || m.meal.items.every((i) => i.name !== 'Toned milk'))));

  const allergic = P.planShake(DB, { ...base, allergies: ['dairy', 'soy'], shakeOn: true, shakePowder: 'casein', shakeWith: 'milk', shakeSlot: 'bedtime' }, ['early', 'breakfast', 'midmorning', 'lunch', 'evening', 'dinner']);
  assert.equal(allergic.powder, 'pea');
  assert.equal(allergic.with, 'almond');
  assert.equal(allergic.slot, 'midmorning'); // bedtime is not in a 5-meal chart
  assert.match(allergic.note, /Bedtime is not in this chart/);

  const three = P.generatePlan(DB, { ...base, meals: 3, shakeOn: true, shakePowder: 'soy', shakeWith: 'water' }, 9);
  assert.equal(three.shake.slot, 'breakfast');
  assert.ok(three.days.every((d) => d.meals.find((m) => m.slot === 'breakfast').meal.items.some((i) => i.name === 'Soy protein isolate shake (in water)')));
});

// ── Library search & filters ──────────────────────────────────────
test('library: combined list, filters, sorting and speed', () => {
  const items = LIB.prepare([...LIB.fromDb(DB, P), ...LIB.parseFoodLib(FL), ...LIB.fromGen(G.all(), ING)]);
  assert.ok(items.filter((x) => x.k === 'f').length >= 8000);
  assert.ok(items.filter((x) => x.recipe).length >= 10000);
  const t = Date.now();
  const vegan = LIB.query(items, { diet: 'vegan', hp: true, q: 'tofu' });
  const elapsed = Date.now() - t;
  assert.ok(vegan.length > 50);
  assert.ok(vegan.every((x) => x.diet === 'vegan' && LIB.isHighProtein(x) && x.txt.includes('tofu')));
  assert.ok(elapsed < 250, `query took ${elapsed} ms`);
  const veg = LIB.query(items, { diet: 'veg' });
  assert.ok(veg.every((x) => x.diet === 'vegan' || x.diet === 'veg'));
  const nonveg = LIB.query(items, { diet: 'nonveg' });
  assert.ok(nonveg.length && nonveg.every((x) => x.diet === 'nonveg'));
  const pp = LIB.query(items, { type: 'r', pp: true, sort: 'ppk' });
  assert.ok(pp.length > 1000 && pp.every((x) => x.recipe && x.pp));
  for (let i = 1; i < pp.length; i++) assert.ok(pp[i - 1].ppk >= pp[i].ppk);
  const lc = LIB.query(items, { lc: true, kmax: 300, sort: 'kcal' });
  assert.ok(lc.every((x) => x.c * 4 <= x.kcal * 0.26 && x.kcal <= 300));
  const quick = LIB.query(items, { time: 15, meal: 'breakfast' });
  assert.ok(quick.length && quick.every((x) => x.time > 0 && x.time <= 15 && x.meal.includes('breakfast')));
  const noDairy = LIB.query(items, { no: ['dairy'], q: 'paneer' });
  assert.ok(noDairy.every((x) => !x.allergens.includes('dairy')));
  const indian = LIB.query(items, { region: 'india', src: 'ifct' });
  assert.ok(indian.length >= 500);
  const best = LIB.query(items, { q: 'dal' });
  assert.ok(best[0].nl.startsWith('dal'), best[0].name);
});
