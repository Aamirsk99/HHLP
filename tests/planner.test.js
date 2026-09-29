const test = require('node:test');
const assert = require('node:assert/strict');
const MEALS = require('../js/foods.js');
const P = require('../js/planner.js');

const base = {
  age: 30, sex: 'female', heightCm: 165, weightKg: 70, activity: 'light', goal: 'lose',
  diet: 'veg', cuisine: 'in', meals: 5, earlyDrink: true, allergies: [], conditions: [], dislikes: [],
};

test('Mifflin–St Jeor BMR and deficit', () => {
  const t = P.computeTargets(base);
  // 10*70 + 6.25*165 - 5*30 - 161 = 1420.25
  assert.equal(t.bmr, 1420);
  assert.equal(t.tdee, Math.round(1420.25 * 1.375));
  assert.equal(t.calories, 1450); // round50(1952.8 - 500)
  assert.equal(t.bmi, 25.7);
  assert.equal(t.bmiCategory, 'Overweight');
});

test('calorie floor applies, but never above maintenance when losing', () => {
  // TDEE ≈ 1562, so a 500 kcal deficit would go below the 1200 floor.
  const floored = P.computeTargets({ ...base, weightKg: 55, heightCm: 155, age: 50, activity: 'light' });
  assert.equal(floored.calories, 1200);
  // TDEE ≈ 1100 is already below the floor: stay at maintenance rather than add a surplus.
  const small = P.computeTargets({ ...base, weightKg: 45, heightCm: 150, age: 60, activity: 'sedentary' });
  assert.equal(small.calories, 1100);
});

test('macros add up to the calorie target', () => {
  for (const goal of Object.keys(P.GOALS)) {
    const t = P.computeTargets({ ...base, goal });
    const kcal = t.protein * 4 + t.carbs * 4 + t.fat * 9;
    assert.ok(Math.abs(kcal - t.calories) < 15, `${goal}: ${kcal} vs ${t.calories}`);
  }
});

test('slot shares sum to the daily target', () => {
  for (const meals of [3, 4, 5, 6]) {
    for (const earlyDrink of [true, false]) {
      const sum = P.slotTargets(2000, meals, earlyDrink).reduce((s, x) => s + x.kcal, 0);
      assert.ok(Math.abs(sum - 2000) < 0.01, `${meals}/${earlyDrink}: ${sum}`);
    }
  }
});

test('filters respect diet, allergies, conditions and dislikes', () => {
  const p = { ...base, diet: 'vegan', allergies: ['gluten', 'nuts'], conditions: ['diabetes'], dislikes: ['rajma'], cuisine: 'mix' };
  for (const slot of Object.keys(P.SLOTS)) {
    for (const m of P.eligibleMeals(MEALS, p, slot)) {
      assert.equal(m.diet, 'vegan');
      assert.ok(!m.allergens.includes('gluten') && !m.allergens.includes('nuts'), m.name);
      assert.ok(!m.flags.includes('hgi'), m.name);
      assert.ok(!/rajma/i.test(m.name + m.items.map((i) => i[0]).join(' ')), m.name);
    }
  }
});

test('every slot has options for each diet type', () => {
  for (const diet of ['vegan', 'veg', 'egg', 'nonveg']) {
    for (const slot of Object.keys(P.SLOTS)) {
      assert.ok(P.eligibleMeals(MEALS, { ...base, diet, cuisine: 'mix' }, slot).length > 0, `${diet}/${slot}`);
    }
  }
});

test('weekly plan is deterministic, varied and near target', () => {
  const a = P.generatePlan(MEALS, base, 42);
  const b = P.generatePlan(MEALS, base, 42);
  assert.deepEqual(a.days, b.days);
  assert.equal(a.days.length, 7);
  for (let i = 1; i < 7; i++) {
    const lunchToday = a.days[i].meals.find((m) => m.slot === 'lunch').meal.id;
    const lunchYesterday = a.days[i - 1].meals.find((m) => m.slot === 'lunch').meal.id;
    assert.notEqual(lunchToday, lunchYesterday);
  }
  for (const d of a.days) {
    const diff = Math.abs(d.totals.kcal - a.targets.calories) / a.targets.calories;
    assert.ok(diff < 0.15, `${d.day}: ${d.totals.kcal} vs ${a.targets.calories}`);
  }
});

test('portions round to kitchen-friendly quantities', () => {
  const poha = MEALS.find((m) => m.name === 'Vegetable poha');
  const big = P.portion(poha, 450, true);
  assert.equal(big.factor, 1.5);
  assert.equal(big.items[0].text, '2¼ cups');
  assert.equal(big.items[2].text, '1 pc'); // fixed item not scaled
  assert.equal(P.formatQty(0.5), '½');
});

test('swapMeal replaces with a different option', () => {
  const plan = P.generatePlan(MEALS, base, 7);
  const before = plan.days[0].meals[1].meal.id;
  assert.ok(P.swapMeal(MEALS, base, plan, 0, 1, () => 0));
  assert.notEqual(plan.days[0].meals[1].meal.id, before);
});
