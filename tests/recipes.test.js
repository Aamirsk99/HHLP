// Recipes screen (all recipes) and the dashboard counts.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ING = require('../js/ingredients.js');
const DB = require('../js/fooddb.js');
const FL = require('../js/foodlib.js');
const G = require('../js/recipegen.js');
const LIB = require('../js/library.js');

test('dashboard totals match the lazy-loaded data files', () => {
  assert.equal(LIB.TOTALS.genRecipes, G.all().length, 'update LIBRARY.TOTALS.genRecipes in js/library.js');
  assert.equal(LIB.TOTALS.libFoods, FL.count, 'update LIBRARY.TOTALS.libFoods in js/library.js');
  assert.equal(FL.rows.split('\n').length, FL.count);
  // What the dashboard shows on a fresh install = what the Foods & Recipes library counts.
  const dishes = DB.FOODS.filter((f) => !f.ingKey && f.recipe).length;
  const items = LIB.prepare([...LIB.fromDb(DB, require('../js/planner.js')), ...LIB.parseFoodLib(FL), ...LIB.fromGen(G.all(), ING)]);
  assert.equal(dishes + LIB.TOTALS.genRecipes, items.filter((x) => x.recipe).length);
  assert.equal(DB.FOODS.length + LIB.TOTALS.libFoods, items.filter((x) => x.k === 'f').length);
});

const gen = LIB.interleave(G.all().map((r) => LIB.genRecipeItem(r, ING)));

test('recipes screen: generated recipes interleaved by type, none lost', () => {
  assert.equal(gen.length, G.all().length);
  assert.equal(new Set(gen.map((x) => x.r.id)).size, gen.length);
  // The first screen shows many recipe types, not 40 bowls.
  assert.ok(new Set(gen.slice(0, 40).map((x) => x.cat)).size >= 10);
});

test('recipes screen: search and quick filters', () => {
  const all = LIB.recipeQuery(gen, {});
  assert.equal(all.length, gen.length);
  const paneer = LIB.recipeQuery(gen, { q: 'paneer bowl' });
  assert.ok(paneer.length > 0);
  assert.ok(paneer.every((x) => x.txt.includes('paneer') && x.txt.includes('bowl')));
  assert.ok(paneer[0].nl.startsWith('paneer'), 'names starting with the word come first');
  // Hindi ingredient names are searchable.
  assert.ok(LIB.recipeQuery(gen, { q: 'पनीर' }).length > 0);
  const veg = LIB.recipeQuery(gen, { diet: 'veg' });
  assert.ok(veg.length > 0 && veg.every((x) => x.diet === 'veg' || x.diet === 'vegan'));
  assert.ok(veg.some((x) => x.diet === 'vegan'), 'Veg includes vegan recipes');
  for (const d of ['egg', 'nonveg', 'vegan']) {
    const l = LIB.recipeQuery(gen, { diet: d });
    assert.ok(l.length > 0 && l.every((x) => x.diet === d), d);
  }
  const hp = LIB.recipeQuery(gen, { hp: true, meal: 'breakfast' });
  assert.ok(hp.length > 0 && hp.every((x) => LIB.isHighProtein(x) && x.meal.includes('breakfast')));
  const quick = LIB.recipeQuery(gen, { quick: true });
  assert.ok(quick.length > 0 && quick.every((x) => x.time > 0 && x.time <= 20));
  const shakes = LIB.recipeQuery(gen, { cat: 'g:Protein shakes' });
  assert.ok(shakes.length > 0 && shakes.every((x) => x.cat === 'Protein shakes'));
  assert.equal(LIB.recipeQuery(gen, { q: 'zzzqqq' }).length, 0);
});

test('recipes screen: own recipes rank first in a search', () => {
  const own = { ...gen[5], own: true, cats: gen[5].cats };
  const res = LIB.recipeQuery([...gen, own], { q: own.name.split(' ')[0].toLowerCase() });
  assert.equal(res[0], own);
  assert.deepEqual(LIB.recipeQuery([...gen, own], { own: true }), [own]);
});

test('themes: the six multi-colour themes exist in the picker, the head script and the CSS', () => {
  const root = path.join(__dirname, '..');
  const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8');
  for (const t of ['aurora', 'peacock', 'sunrise', 'galaxy', 'tropical', 'maharaja']) {
    assert.match(app, new RegExp(`\\b${t}: \\['[A-Z][a-z]+', '#[0-9A-F]{6}', '#[0-9A-F]{6}', '#[0-9A-F]{6}'\\]`), t);
    assert.match(html, new RegExp(`\\|${t}[|)]`), t);
    assert.match(css, new RegExp(`:root\\[data-theme="${t}"\\] \\{ --m1: #`), t);
  }
});
