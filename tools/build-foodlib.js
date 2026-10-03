#!/usr/bin/env node
/*
 * Builds js/foodlib.js — the world & Indian food list shown in the Foods & Recipes library.
 *
 * Sources (real data only, nothing invented):
 *   - TempoLife food database (tempo-food-db, data/tempolife-foods.json): 7,795 foods per 100 g.
 *     License CC-BY-4.0: "Food nutrition data from TempoLife (tempolife.app), CC-BY-4.0."
 *     Rows with source "usda_sr_legacy" come from USDA FoodData Central SR Legacy (public domain).
 *   - Indian Food Composition Tables 2017 (@ifct2017/compositions, index.csv): 528+ foods per 100 g (MIT).
 *
 * Usage:
 *   node tools/build-foodlib.js <tempolife-foods.json> <ifct index.csv> [out=js/foodlib.js]
 *   (or set TEMPO_JSON / IFCT_CSV)
 *
 * Output row (one line per food, fields joined by "|"):
 *   name | category index | diet (0 vegan, 1 veg, 2 egg, 3 nonveg) | source index | kcal | protein | carbs | fat | fibre | sugar | salt | alias
 * All numbers per 100 g; empty = not known.
 */
const fs = require('fs');
const path = require('path');

const ATTRIBUTION = 'Food nutrition data from TempoLife (tempolife.app), CC-BY-4.0. USDA FoodData Central SR Legacy (public domain). Indian Food Composition Tables 2017, NIN-ICMR (IFCT 2017, @ifct2017/compositions, MIT).';
const DIETS = ['vegan', 'veg', 'egg', 'nonveg'];
const SOURCES = [
  { key: 'usda', label: 'USDA (via TempoLife)' },
  { key: 'tempo', label: 'TempoLife' },
  { key: 'ifct', label: 'IFCT 2017 (India)' },
];

// Unified English categories. `plant` categories default to vegan, the others to vegetarian.
const CATEGORIES = [
  ['Grains, millets & pasta', true], ['Breads & bakery', false], ['Breakfast cereals', false], ['Pulses & legumes', true],
  ['Vegetables', true], ['Leafy greens', true], ['Roots & tubers', true], ['Fruits & berries', true], ['Nuts & seeds', true],
  ['Dairy', false], ['Eggs', false], ['Meat & poultry', false], ['Fish & seafood', false], ['Fats & oils', true],
  ['Desserts & sweets', false], ['Beverages', true], ['Snacks', false], ['Soups', false], ['Sauces & condiments', false],
  ['Spices & herbs', true], ['Ready meals', false], ['Salads', false], ['Estonian dishes', false], ['Other', false],
];
const CAT_INDEX = Object.fromEntries(CATEGORIES.map(([c], i) => [c, i]));

const TEMPO_CATS = {
  'Liha ja linnuliha': 'Meat & poultry', 'Köögivili': 'Vegetables', 'Leivad ja pagarittooted': 'Breads & bakery',
  'Valmistoidud': 'Ready meals', 'Puuviljad ja marjad': 'Fruits & berries', 'Magustoidud ja küpsetised': 'Desserts & sweets',
  'Joogid': 'Beverages', 'Piimatooted': 'Dairy', 'Kaunviljad': 'Pulses & legumes', 'Kala ja mereannid': 'Fish & seafood',
  'Rasvad ja õlid': 'Fats & oils', 'Hommikusöögid': 'Breakfast cereals', 'Teravili ja pasta': 'Grains, millets & pasta',
  'Pähklid ja seemned': 'Nuts & seeds', 'Supid': 'Soups', 'Snäkid ja suupisted': 'Snacks', 'Kartulid ja mugulad': 'Roots & tubers',
  'Kastmed ja maitsed': 'Sauces & condiments', 'Eesti toidud': 'Estonian dishes', 'Vürtsid ja maitseained': 'Spices & herbs',
  'Munad': 'Eggs', 'Salatid': 'Salads',
};
const IFCT_GROUPS = {
  'Cereals and Millets': 'Grains, millets & pasta', 'Grain Legumes': 'Pulses & legumes', 'Green Leafy Vegetables': 'Leafy greens',
  'Other Vegetables': 'Vegetables', 'Fruits': 'Fruits & berries', 'Roots and Tubers': 'Roots & tubers',
  'Condiments and Spices': 'Spices & herbs', 'Nuts and Oil Seeds': 'Nuts & seeds', 'Sugars': 'Desserts & sweets',
  'Mushrooms': 'Vegetables', 'Miscellaneous Foods': 'Other', 'Milk and Milk Products': 'Dairy', 'Egg and Egg Products': 'Eggs',
  'Poultry': 'Meat & poultry', 'Animal Meat': 'Meat & poultry', 'Marine Fish': 'Fish & seafood', 'Marine Shellfish': 'Fish & seafood',
  'Marine Mollusks': 'Fish & seafood', 'Fresh Water Fish and Shellfish': 'Fish & seafood', 'Edible Oils and Fats': 'Fats & oils',
};

// ── Diet inference (best effort, from the category and the name) ──────────
const NONVEG = /\b(chicken|beef|pork|lamb|mutton|veal|turkey|duck|goose|ham|hams|bacon|sausages?|salami|pepperoni|frankfurters?|hot ?dogs?|meat|meats|meatballs?|meatloaf|fish|salmon|tuna|cod|herring|sprats?|anchov\w*|sardines?|mackerel|trout|shrimps?|prawns?|crabs?|lobsters?|oysters?|clams?|mussels?|scallops?|squid|octopus|caviar|roe|gelatin|gelatine|lard|tallow|liver|livers|venison|elk|bison|rabbit|goat|blood|pate|pâté|chorizo|prosciutto|jerky|bologna|liverwurst|pastrami|corned|giblets?|tripe|pollock|tilapia|catfish|halibut|haddock|carp|eel|pike|perch|whitefish|surimi|steak|ribs|brisket|pheasant|quail|ostrich|bratwurst|kielbasa|knackwurst|mortadella|pastirma|kebab|gyro|pemmican|worcestershire|kidneys)\b/;
const EGG = /\b(eggs?|omelet\w*|mayonnaise|mayo|meringues?|custard|eggnog|egg-?noodles?|french toast)\b/;
const EGGY_BAKES = /\b(cake|cakes|cookies?|muffins?|pancakes?|waffles?|brownies?|doughnuts?|donuts?|croissants?|pastr(y|ies)|eclairs?|cream puffs?|sponge|macaroons?|tiramisu|mousse|souffl\w*|cheesecake|pound cake|crepes?|popovers?|danish|strudel|madeleines?|biscotti|ladyfingers?|brioche|challah)\b/;
const DAIRY = /\b(milk|cheese|cheeses|butter|cream|creamer|yogh?urt|whey|casein|ghee|kefir|curd|curds|paneer|honey|ice cream|chocolate|lactose|buttermilk|quark|ricotta|mozzarella|cheddar|parmesan|feta|brie|camembert|gouda|khoa|khoya|rabri|lassi|malted|caramel|toffee|fudge|nougat)\b/;
const PLANT_MILK = /\b(coconut|soy|soya|almond|rice|oat|cashew|hemp|peanut|nut|apple|cocoa|shea|plant)[ -](milk|butter|cream|drink|beverage)s?\b|\bbutternut\b|\bbutterhead\b|\bbutter beans?\b|\bbutterbur\b|\bmilkfish\b|\bcream of tartar\b|\bmilk thistle\b|\bmilkweed\b|\bdairy[- ]free\b|\bnon-?dairy\b/g;

// Words that look like meat or egg but are not (custard apple, oyster mushroom, coconut meat, goat cheese …).
const NOT_ANIMAL = /custard[- ]apples?|blood oranges?|oyster mushrooms?|mushrooms?,? oyster|chicken mushrooms?|chicken of the woods|vegetable oyster|scallop squash|squash,? summer,? scallop|coconut,? meat|coconut meat|grated meat|relish,? hot dog|hot dog relish|without (added )?eggs?|egg-?less|egg-?free/g;

function inferDiet(name, category) {
  const n = ' ' + String(name).toLowerCase().replace(NOT_ANIMAL, ' plant ').replace(/\bgoat(?=,? (milk|cheese))|((milk|cheese),? )goat\b/g, '$1').replace(/[(),;]/g, ' ') + ' ';
  if (category === 'Meat & poultry' || category === 'Fish & seafood') return 'nonveg';
  if (/\bmeatless\b|\bvegetarian\b|\bvegan\b|\bveggie\b/.test(n) && !/\b(egg|cheese|milk)\b/.test(n)) {
    return /\bvegan\b/.test(n) ? 'vegan' : 'veg';
  }
  if (NONVEG.test(n.replace(/\bkidney beans?\b/g, '').replace(/\bfish sauce\b/g, ' fish '))) return 'nonveg';
  if (category === 'Eggs' || EGG.test(n.replace(/\beggplants?\b/g, ''))) return 'egg';
  if ((category === 'Desserts & sweets' || category === 'Breads & bakery') && EGGY_BAKES.test(n)) return 'egg';
  const plain = n.replace(PLANT_MILK, ' ');
  if (DAIRY.test(plain)) return 'veg';
  if (category === 'Dairy') return plain !== n ? 'vegan' : 'veg'; // plant milks listed with dairy
  const plant = (CATEGORIES[CAT_INDEX[category]] || [])[1];
  return plant ? 'vegan' : 'veg';
}

// ── Small CSV reader (quoted fields, commas and newlines inside quotes) ────
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch !== '\r') field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const num = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const r1 = (v) => (v == null ? '' : String(Math.round(v * 10) / 10));
const r2 = (v) => (v == null ? '' : String(Math.round(v * 100) / 100));
const clean = (s) => String(s || '').replace(/[|\n\r\t]+/g, ' / ').replace(/\s+/g, ' ').trim();

/** USDA-style "Cheese, cheddar" names keep their wording; only the first letter is capitalised. */
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

function fromTempo(list) {
  const out = [];
  list.forEach((x) => {
    const kcal = num(x.kcal_per_100g), p = num(x.protein_g), c = num(x.carbs_g), f = num(x.fat_g);
    if (kcal == null || p == null || c == null || f == null || !x.name) return;
    const cat = TEMPO_CATS[x.category] || 'Other';
    const name = cap(clean(x.name));
    out.push({
      name, cat, diet: inferDiet(name, cat), src: x.source === 'usda_sr_legacy' ? 'usda' : 'tempo',
      kcal, p, c, f, fib: num(x.fiber_g), sugar: num(x.sugar_g), salt: num(x.salt_g), alias: clean(x.brand || ''),
    });
  });
  return out;
}

function fromIfct(text) {
  const rows = parseCsv(text);
  const head = rows[0].map((h) => h.split('; ').pop().trim());
  const col = (k) => head.indexOf(k);
  const C = { code: col('code'), name: col('name'), lang: col('lang'), grup: col('grup'), tags: col('tags'), enerc: col('enerc'), p: col('protcnt'), f: col('fatce'), c: col('choavldf'), fib: col('fibtg'), sugar: col('fsugar') };
  ['code', 'name', 'grup', 'enerc', 'p', 'f', 'c'].forEach((k) => { if (C[k] < 0) throw new Error('IFCT column missing: ' + k); });
  const out = [];
  rows.slice(1).forEach((r) => {
    if (r.length < head.length / 2) return;
    const kj = num(r[C.enerc]);
    const p = num(r[C.p]), c = num(r[C.c]), f = num(r[C.f]);
    if (kj == null || p == null || c == null || f == null || !r[C.name]) return;
    const cat = IFCT_GROUPS[r[C.grup]] || 'Other';
    const name = cap(clean(r[C.name]));
    const tags = String(r[C.tags] || '');
    let diet = inferDiet(name, cat);
    if (cat === 'Eggs') diet = 'egg';
    else if (/\bnonveg\b/.test(tags)) diet = 'nonveg';
    // Hindi local name ("H. Ramdana") helps search in India.
    const hindi = (String(r[C.lang] || '').split(';').map((s) => s.trim()).find((s) => /^H\.\s/.test(s)) || '').replace(/^H\.\s*/, '');
    out.push({
      name, cat, diet, src: 'ifct', kcal: kj / 4.184, p, c, f,
      fib: C.fib >= 0 ? num(r[C.fib]) : null, sugar: C.sugar >= 0 ? num(r[C.sugar]) : null, salt: null, alias: clean(hindi),
    });
  });
  return out;
}

/**
 * Merge and de-duplicate: identical rows (same name and nutrition) are dropped; the same
 * name with different values (different USDA entries whose names were shortened) is kept
 * as "name (entry 2)" so no real food is lost.
 */
function merge(lists) {
  const seen = new Map();
  const out = [];
  lists.flat().forEach((x) => {
    const low = x.name.toLowerCase();
    const sig = [r1(x.kcal), r1(x.p), r1(x.c), r1(x.f)].join('/');
    const prev = seen.get(low);
    if (prev) {
      if (prev.sigs.has(sig)) return;
      prev.sigs.add(sig);
      prev.n++;
      x = { ...x, name: `${x.name} (entry ${prev.n})` };
    } else seen.set(low, { sigs: new Set([sig]), n: 1 });
    out.push(x);
  });
  return out;
}

function encode(foods) {
  const srcIndex = Object.fromEntries(SOURCES.map((s, i) => [s.key, i]));
  return foods.map((x) => [
    x.name, CAT_INDEX[x.cat], DIETS.indexOf(x.diet), srcIndex[x.src],
    Math.round(x.kcal), r1(x.p), r1(x.c), r1(x.f), r1(x.fib), r1(x.sugar), r2(x.salt), x.alias || '',
  ].join('|').replace(/\|+$/, '')).join('\n');
}

function build(tempoList, ifctText) {
  const foods = merge([fromIfct(ifctText), fromTempo(tempoList)]);
  return { foods, rows: encode(foods) };
}

function fileText(foods, rows) {
  const counts = {};
  foods.forEach((x) => { counts[x.src] = (counts[x.src] || 0) + 1; });
  return `/*
 * GENERATED by tools/build-foodlib.js — do not edit by hand.
 * ${foods.length} real foods, nutrition per 100 g (${SOURCES.map((s) => `${counts[s.key] || 0} ${s.label}`).join(', ')}).
 * ${ATTRIBUTION}
 * Loaded on demand by the Foods & Recipes library (not at app start).
 */
(function (root) {
  var D = {
    v: 1,
    count: ${foods.length},
    attribution: ${JSON.stringify(ATTRIBUTION)},
    diets: ${JSON.stringify(DIETS)},
    cats: ${JSON.stringify(CATEGORIES.map(([c]) => c))},
    sources: ${JSON.stringify(SOURCES)},
    rows: ${JSON.stringify(rows)}
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
  else root.FOODLIB_DATA = D;
})(typeof window !== 'undefined' ? window : globalThis);
`;
}

if (require.main === module) {
  const tempoPath = process.argv[2] || process.env.TEMPO_JSON;
  const ifctPath = process.argv[3] || process.env.IFCT_CSV;
  const outPath = process.argv[4] || path.join(__dirname, '..', 'js', 'foodlib.js');
  if (!tempoPath || !ifctPath) {
    console.error('Usage: node tools/build-foodlib.js <tempolife-foods.json> <ifct2017 index.csv> [out.js]');
    process.exit(1);
  }
  const { foods, rows } = build(JSON.parse(fs.readFileSync(tempoPath, 'utf8')), fs.readFileSync(ifctPath, 'utf8'));
  fs.writeFileSync(outPath, fileText(foods, rows));
  const by = {};
  foods.forEach((x) => { by[x.diet] = (by[x.diet] || 0) + 1; });
  console.log(`Wrote ${outPath}: ${foods.length} foods, ${(fs.statSync(outPath).size / 1024).toFixed(0)} KB`, by);
}

module.exports = { inferDiet, parseCsv, fromTempo, fromIfct, merge, encode, build, fileText, CATEGORIES, DIETS, SOURCES, ATTRIBUTION };
