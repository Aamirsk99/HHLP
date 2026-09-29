const test = require('node:test');
const assert = require('node:assert/strict');
const DB = require('../js/fooddb.js');
const P = require('../js/planner.js');

const base = {
  age: 30, sex: 'female', heightCm: 165, weightKg: 70, activity: 'light', goal: 'lose',
  diet: 'veg', cuisine: 'in', meals: 5, earlyDrink: true, allergies: [], conditions: [], dislikes: [],
  startDate: '2026-09-29',
};
const textOf = (item) => item.name.toLowerCase();
const allItems = (plan) => plan.days.flatMap((d) => d.meals.flatMap((m) => (m.meal ? m.meal.items : [])));

test('food database is well formed', () => {
  assert.ok(DB.FOODS.length >= 450, `only ${DB.FOODS.length} foods`);
  const names = new Set();
  for (const f of DB.FOODS) {
    assert.ok(!names.has(f.name), `duplicate ${f.name}`);
    names.add(f.name);
    assert.ok(['vegan', 'veg', 'egg', 'nonveg'].includes(f.diet), f.name);
    assert.ok(f.kcal >= 0 && f.p >= 0 && f.c >= 0 && f.f >= 0, f.name);
    // Energy from macros should be in the same ballpark as the stated kcal.
    const macroKcal = f.p * 4 + f.c * 4 + f.f * 9;
    if (f.kcal >= 60) assert.ok(Math.abs(macroKcal - f.kcal) / f.kcal < 0.35, `${f.name}: ${macroKcal} vs ${f.kcal}`);
  }
  for (const [, list] of DB.PRESETS) for (const n of list) assert.ok(names.has(n), `preset food missing: ${n}`);
});

test('more than 50,000 meal combinations', () => {
  const c = P.countCombinations(DB, { ...base, diet: 'nonveg', cuisine: 'mix', meals: 6 });
  assert.ok(c.total > 50000, String(c.total));
});

test('Mifflin–St Jeor BMR and deficit', () => {
  const t = P.computeTargets(base);
  assert.equal(t.bmr, 1420);
  assert.equal(t.calories, 1450);
  assert.equal(t.bmi, 25.7);
  assert.equal(t.bmiCategory, 'Obese');
});

test('custom calorie and protein targets override the calculation', () => {
  const t = P.computeTargets({ ...base, kcalTarget: 1600, proteinTarget: 110 });
  assert.equal(t.calories, 1600);
  assert.equal(t.protein, 110);
  const kcal = t.protein * 4 + t.carbs * 4 + t.fat * 9;
  assert.ok(Math.abs(kcal - 1600) < 15);
  const low = P.computeTargets({ ...base, kcalTarget: 900 });
  assert.ok(low.warnings.length > 0);
  const capped = P.computeTargets({ ...base, kcalTarget: 1200, proteinTarget: 200 });
  assert.equal(capped.protein, 120);
});

test('diet plans resolve goal and conditions', () => {
  const heavy = { ...base, weightKg: 75 };
  const lean = { ...base, weightKg: 55 };
  assert.equal(P.resolveProfile({ ...heavy, plan: 'diabetic' }).goal, 'lose');
  assert.equal(P.resolveProfile({ ...lean, plan: 'diabetic' }).goal, 'maintain');
  assert.deepEqual(P.resolveProfile({ ...lean, plan: 'diabetic' }).conditions, ['diabetes']);
  assert.equal(P.resolveProfile({ ...heavy, plan: 'pregnancy', weightGoal: 'lose' }).goal, 'pregnancy');
  assert.equal(P.resolveProfile({ ...lean, plan: 'kidney', weightGoal: 'gain' }).goal, 'maintain');
});

test('plans hit calorie targets and are deterministic', () => {
  const a = P.generatePlan(DB, base, 42);
  const b = P.generatePlan(DB, base, 42);
  assert.deepEqual(a.days, b.days);
  assert.equal(a.days.length, 7);
  for (const d of a.days) {
    const diff = Math.abs(d.totals.kcal - a.targets.calories) / a.targets.calories;
    assert.ok(diff < 0.15, `${d.day}: ${d.totals.kcal} vs ${a.targets.calories}`);
  }
});

test('protein target steers meal choice', () => {
  const normal = P.generatePlan(DB, { ...base, diet: 'nonveg' }, 5);
  const high = P.generatePlan(DB, { ...base, diet: 'nonveg', proteinTarget: 120 }, 5);
  const avg = (pl) => pl.days.reduce((s, d) => s + d.totals.p, 0) / 7;
  assert.ok(avg(high) > avg(normal), `${avg(high)} <= ${avg(normal)}`);
  assert.ok(avg(high) >= 100, `high-protein plan averages ${avg(high)} g`);
});

test('days follow the start date', () => {
  const plan = P.generatePlan(DB, { ...base, startDate: '2026-10-02' }, 1);
  assert.equal(plan.days[0].date, '2026-10-02');
  assert.equal(plan.days[0].day, 'Friday');
  assert.equal(plan.days[6].date, '2026-10-08');
});

test('filters: diet, allergies, conditions, exclusions, dislikes', () => {
  const p = { ...base, diet: 'vegan', allergies: ['nuts'], conditions: ['diabetes'], excludes: ['rice', 'wheat'], dislikes: ['rajma'] };
  const plan = P.generatePlan(DB, p, 9);
  for (const it of allItems(plan)) {
    const f = DB.FOODS[it.fid];
    assert.equal(f.diet, 'vegan', f.name);
    assert.ok(!f.allergens.includes('nuts') && !f.allergens.includes('gluten'), f.name);
    assert.ok(!f.flags.includes('hgi'), f.name);
    assert.ok(!/rice|rajma|idli|dosa/.test(textOf(f)), f.name);
  }
});

test('Jain, pregnancy and kidney rules', () => {
  const jain = P.generatePlan(DB, { ...base, diet: 'jain', cuisine: 'mix' }, 3);
  for (const it of allItems(jain)) assert.ok(!/potato|aloo|onion|garlic|ginger|carrot|mushroom/.test(textOf(it)), it.name);
  const preg = P.generatePlan(DB, { ...base, plan: 'pregnancy' }, 3);
  assert.ok(preg.targets.calories > preg.targets.tdee);
  for (const it of allItems(preg)) assert.ok(!/papaya|sushi/.test(textOf(it)), it.name);
  const kid = P.generatePlan(DB, { ...base, plan: 'kidney', cuisine: 'mix' }, 3);
  for (const it of allItems(kid)) {
    const f = DB.FOODS[it.fid];
    assert.ok(!f.flags.includes('hk') && !f.flags.includes('hna'), f.name);
  }
});

test('travel charts use travel-friendly foods', () => {
  const plan = P.generatePlan(DB, { ...base, travel: 'train', diet: 'nonveg' }, 4);
  for (const d of plan.days) for (const m of d.meals) assert.ok(m.meal && m.meal.items.length, `${d.day} ${m.slot}`);
  for (const it of allItems(plan)) {
    const f = DB.FOODS[it.fid];
    const ok = f.flags.includes('tr') || f.roles.some((r) => ['early', 'bed', 'side', 'bfside'].includes(r));
    assert.ok(ok, f.name);
  }
});

test('worldwide cuisine uses worldwide dishes for main meals', () => {
  const plan = P.generatePlan(DB, { ...base, regions: ['MED', 'ASIA'], diet: 'nonveg' }, 8);
  for (const d of plan.days) {
    const lunch = d.meals.find((m) => m.slot === 'lunch');
    const mains = lunch.meal.items.map((i) => DB.FOODS[i.fid]).filter((f) => f.roles.some((r) => ['grain', 'dal', 'protein', 'sabzi'].includes(r)) && !f.roles.some((r) => r.startsWith('w')));
    assert.equal(mains.length, 0, `${d.day}: ${lunch.meal.items.map((i) => i.name)}`);
  }
});

test('every plan and food type fills all meals', () => {
  for (const plan of Object.keys(P.PLANS)) {
    for (const diet of Object.keys(P.DIETS)) {
      const week = P.generatePlan(DB, { ...base, plan, diet, meals: 6 }, 3);
      for (const d of week.days) for (const e of d.meals) assert.ok(e.meal && e.meal.items.length, `${plan}/${diet}/${d.day}/${e.slot}`);
    }
  }
});

test('manual editing: quantities, custom foods, copy, lock and blank charts', () => {
  const plan = P.generatePlan(DB, base, 11);
  const entry = plan.days[0].meals[1];
  const item = entry.meal.items[0];
  const before = item.kcal;
  P.setItemQty(item, item.qty * 2);
  assert.ok(Math.abs(item.kcal - before * 2) <= 1);
  entry.meal.items.push(P.customItem('Homemade ladoo', 1, 'pc', 150, 3));
  P.recalcMeal(entry.meal);
  entry.locked = true;
  P.copyMeal(plan, 0, 1, [1, 2]);
  assert.deepEqual(plan.days[1].meals[1].meal, entry.meal);
  assert.ok(plan.days[2].meals[1].locked);

  const again = P.generatePlan(DB, base, 99, { previous: plan });
  assert.deepEqual(again.days[0].meals[1].meal, entry.meal);

  const blank = P.generatePlan(DB, base, 1, { blank: true });
  assert.equal(blank.days[0].totals.kcal, 0);
  assert.equal(blank.days[3].meals[2].meal.items.length, 0);
});

test('swap and search', () => {
  const plan = P.generatePlan(DB, base, 7);
  const before = plan.days[0].meals[3].meal.items.map((i) => i.fid).join();
  assert.ok(P.swapMeal(DB, base, plan, 0, 3, P.rng(2)));
  assert.notEqual(plan.days[0].meals[3].meal.items.map((i) => i.fid).join(), before);
  const dosa = P.searchFoods(DB.FOODS, 'dosa');
  assert.ok(dosa.length >= 5);
  const wl = P.searchFoods(DB.FOODS, '', { wl: true, world: true });
  assert.ok(wl.length > 10 && wl.every((f) => f.flags.includes('wl')));
});

test('portions round to kitchen-friendly quantities', () => {
  const poha = DB.FOODS.find((f) => f.name === 'Vegetable poha');
  const meal = P.composeMeal([poha], 300, true);
  assert.equal(meal.factor, 1.5);
  assert.equal(meal.items[0].text, '1½ cups');
  assert.equal(P.formatQty(0.75), '¾');
});
