const test = require('node:test');
const assert = require('node:assert/strict');
const DB = require('../js/fooddb.js');
const I = require('../js/i18n.js');
I.setHindiNames(require('../js/foodnames.js'));
const P = require('../js/planner.js');
const S = require('../js/store.js');

const base = { age: 32, sex: 'female', heightCm: 160, weightKg: 70, activity: 'light', plan: 'balanced', diet: 'veg', meals: 5, earlyDrink: true };
const allItems = (plan) => plan.days.flatMap((d) => d.meals.flatMap((m) => (m.meal ? m.meal.items : [])));

test('custom foods are planned, packed, backed up and read back from the PDF', () => {
  const builtin = DB.FOODS.length;
  const storage = S.memoryStorage();
  const store = S.createStore(storage, P, DB);
  assert.throws(() => store.saveCustomFood({ name: 'Rajma', roles: ['dal'] }), /already/);
  assert.throws(() => store.saveCustomFood({ name: 'Thing', roles: [] }), /meal/);
  const food = store.saveCustomFood({ name: 'Ragi millet upma bowl', roles: ['bf'], diet: 'vegan', region: 'IN', qty: 1, unit: 'bowl', kcal: 210, p: 7, c: 34, f: 5, flags: ['wl'] });
  assert.equal(DB.FOODS.length, builtin + 1);
  assert.ok(DB.FOODS[builtin].user === food.id);
  assert.equal(storage.getItem('primefit.customFoods').includes('Ragi millet upma'), true);

  const profile = { ...base, likes: ['ragi millet upma'] };
  const plan = P.generatePlan(DB, profile, 7);
  assert.ok(allItems(plan).some((i) => i.name === food.name), 'planner uses the custom food');
  assert.ok(P.searchFoods(DB.FOODS, 'ragi millet upma', { own: true }).length === 1);

  // Saved chart round-trip, even after the food is deleted.
  const rec = store.saveChart({ profile: { ...profile, name: 'Meena' }, plan, week: 1 });
  const totals = plan.days.map((d) => d.totals.kcal);
  assert.deepEqual(store.loadChart(rec.id).plan.days.map((d) => d.totals.kcal), totals);

  // PDF read-back.
  const payload = store.pdfPayload(profile, plan, 1);
  const r = store.readPdfText('x ' + payload.replace(/(.{60})/g, '$1\n ') + ' y', I);
  assert.equal(r.exact, true);
  assert.deepEqual(r.plan.days.map((d) => d.totals.kcal), totals);
  assert.ok(allItems(r.plan).some((i) => i.name === food.name && !i.custom));

  // Recipe, backup and import into another device.
  store.saveRecipe(food.name, { ing: [{ name: 'Ragi', qty: '40 g' }], steps: ['Roast', 'Cook', 'Serve'], prep: '5 min', serves: 1 });
  assert.equal(store.getRecipe(food.name).steps.length, 3);
  const backup = store.exportAll();
  store.deleteCustomFood(food.id);
  assert.equal(DB.FOODS.length, builtin);
  assert.equal(store.getRecipe(food.name), null);
  const back = store.loadChart(rec.id);
  assert.deepEqual(back.plan.days.map((d) => d.totals.kcal), totals, 'deleted food keeps its nutrition in saved charts');

  const other = S.createStore(S.memoryStorage(), P, DB);
  const counts = other.importAll(backup);
  assert.equal(counts.foods, 1);
  assert.equal(counts.recipes, 1);
  assert.equal(DB.FOODS.length, builtin + 1);
  other.deleteCustomFood(other.listCustomFoods()[0].id);
  assert.equal(DB.FOODS.length, builtin);
});
