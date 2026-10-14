"""Export the data behind the three web tools as JSON for the developer handover.

    python3 handover_export.py OUT_DIR HINAMES.json

Writes foods.json, recipes.json and diet-chart-generator-data.json. Everything comes from the same functions that build
the web pages (foodlist.py, webdata.py, build.py), so ids and values match what the tools show. HINAMES.json holds the
Hindi names exactly as the pages display them (produced by running the pages' own translation code in a browser).
Nothing here changes how the tools work.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import build as B
import dietplan as D
import foodlist as FL
import meals as M
import webdata as W
from catalog import CAT
from core import all_items, diet, dry_grams, keys as rkeys, quantity, LIQUIDS

DIET = {'Vegan': 'vegan', 'Vegetarian': 'vegetarian', 'Egg': 'eggetarian', 'Non-veg': 'non_veg'}
DIET_KEY = {'vegan': 'vegan', 'veg': 'vegetarian', 'egg': 'eggetarian', 'nonveg': 'non_veg'}
CODE_DIET = ['vegan', 'vegetarian', 'eggetarian', 'non_veg']
NUT = [('Energy (kcal)', 'kcal'), ('Protein (g)', 'protein_g'), ('Carbs (g)', 'carbs_g'), ('Fat (g)', 'fat_g'), ('Fibre (g)', 'fibre_g'),
       ('Sugar (g)', 'sugar_g'), ('Sat. fat (g)', 'sat_fat_g'), ('Cholesterol (mg)', 'cholesterol_mg'), ('Calcium (mg)', 'calcium_mg'),
       ('Iron (mg)', 'iron_mg'), ('Sodium (mg)', 'sodium_mg'), ('Potassium (mg)', 'potassium_mg'), ('Vitamin C (mg)', 'vitamin_c_mg')]


def ingredient_ids():
    """Catalogue key -> food id (IN-nnn), numbered exactly as foodlist.ingredient_rows() numbers them."""
    out = {}
    for i, (k, c) in enumerate(sorted(CAT.items(), key=lambda kv: kv[1]['name'].lower()), 1):
        if k in ('water', 'ice'):
            continue
        out[k] = f'IN-{i:03d}'
    return out


def foods(hi):
    ids = ingredient_ids()
    key_of = {v: k for k, v in ids.items()}
    gen_diet = {}
    for r in FL.ifct_rows() + FL.ingredient_rows():
        gen_diet[r['ID']] = CODE_DIET[W.diet_code(r)]
    out = []
    for r in FL.all_rows():
        fid = r['ID']
        typ = 'raw_food' if fid.startswith('IF-') else 'ingredient' if fid.startswith('IN-') else 'dish'
        cat, _, sub = r['Category'].partition(' · ')
        x = {'id': fid, 'type': typ, 'source': r['Source'], 'name_en': r['Food'], 'name_hi': hi['foods'].get(fid),
             'name_hi_roman': r['Hindi / local name'] or None, 'local_names': r.get('_local') or None,
             'category': cat, 'subcategory': sub or None, 'diet': DIET[r['Diet']]}
        if typ != 'dish':
            x['diet_in_generator'] = gen_diet.get(fid)
            x['basis'] = {'amount': 100, 'unit': 'g'}
        else:
            x['basis'] = {'amount': 1, 'unit': 'serving'}
        if typ == 'ingredient':
            k = key_of[fid]
            x['ingredient_key'] = k
            liquid = CAT[k]['cat'] == 'drink' or k in ('milk', 'water', 'coconutwater')
            x['household_measures'] = [{'unit': u, 'grams': g, 'unit_of_weight': 'ml' if liquid else 'g'} for u, g in CAT[k]['units'] if u != 'g']
        elif typ == 'dish':
            x['household_measures'] = [{'unit': 'serving', 'text': r['Household measure']}]
        else:
            x['household_measures'] = []
        x['nutrition'] = {out_k: r.get(in_k) for in_k, out_k in NUT}
        if typ == 'dish':
            x['recipe_id'] = r['Recipe no.']
            x['best_for'] = [m.strip() for m in r['Best for'].split(',') if m.strip()]
        out.append(x)
    return out


def recipes(hi):
    ids = ingredient_ids()
    rs = B.ordered(True)
    data = W.data()
    in_planner = {a[0]: a for a in data['recs']}
    focus_keys = [f[0] for f in data['focus']]
    pools, tex = data['pools'], data['tex']
    group_keys = [g[0] for g in data['groups']]
    n_food_groups = len(W.GROUP_KEYS)
    out = []
    for r in rs:
        n = r['nut']
        groups = []
        for title, items in r['groups']:
            its = []
            for k, g, note in items:
                counted = dry_grams(k, g, note) if g else None
                it = {'food_id': ids.get(k), 'ingredient_key': k, 'name': CAT[k]['name'],
                      'amount': g, 'unit': ('ml' if k in LIQUIDS else 'g') if g is not None else None,
                      'quantity_text': quantity(k, g, note), 'note': note or None,
                      'grams_used_for_nutrition': round(counted, 2) if counted is not None else 0}
                if counted is not None and abs(counted - g) > 1e-9:
                    it['cooked_to_raw_factor'] = round(counted / g, 2)
                its.append(it)
            groups.append({'title': title, 'items': its})
        gb = W.group_bits(r)
        contains = [group_keys[i] for i in range(n_food_groups) if gb & (1 << i)]
        regions = [group_keys[i] for i in range(n_food_groups, len(group_keys)) if gb & (1 << i)]
        d = DIET_KEY[diet(r)]
        x = {'id': r['no'], 'code': f'#{r["no"]:04d}', 'food_id': f'HR-{r["no"]:04d}',
             'name_en': r['name'], 'name_hi': hi['recipes'].get(str(r['no'])),
             'category': r['cat'], 'subcategory': r['sub'] or None, 'meal_times': r['meals'], 'diet': d,
             'contains_food_groups': contains, 'jain_friendly': d in ('vegan', 'vegetarian') and 'jain' not in contains,
             'regions': regions, 'servings': r['serves'], 'prep_min': r['prep'], 'cook_min': r['cook'],
             'total_min': r['prep'] + r['cook'], 'difficulty': r['level'], 'description': r['desc'],
             'ingredient_groups': groups,
             'steps': [{'title': h, 'text': t} for h, t in r['steps']],
             'tips': r['tips'], 'serving_ideas': [re.sub(r'<[^>]+>', '', s) for s in r['serve']], 'storage': r['store'] or None,
             'nutrition_per_serving': {'kcal': round(n['kcal']), 'protein_g': round(n['p'], 1), 'carbs_g': round(n['c'], 1),
                                       'fat_g': round(n['f'], 1), 'fibre_g': round(n['fib'], 1)},
             'nutrition_per_serving_exact': {'kcal': round(n['kcal'], 4), 'protein_g': round(n['p'], 4), 'carbs_g': round(n['c'], 4),
                                             'fat_g': round(n['f'], 4), 'fibre_g': round(n['fib'], 4)},
             'image': None}
        a = in_planner.get(r['no'])
        if a:
            x['generator'] = {'auto_planner': True,
                              'pools': [p for i, p in enumerate(pools) if a[8] & (1 << i)],
                              'suitable_for_diet_types': [f for i, f in enumerate(focus_keys) if a[9] & (1 << i)],
                              'texture_tags': [t for i, t in enumerate(tex) if a[11] & (1 << i)]}
        else:
            x['generator'] = {'auto_planner': False, 'pools': [], 'suitable_for_diet_types': [], 'texture_tags': []}
        out.append(x)
    return out


def generator_data(html_path):
    """The DATA object embedded in diet-chart-generator.html, exactly as the page has it."""
    html = open(html_path, encoding='utf-8').read()
    start = html.index('const DATA = ') + len('const DATA = ')
    end = html.index(';\nconst CAN_PRINT')
    return json.loads(html[start:end])


def main():
    out_dir, hi_path = sys.argv[1], sys.argv[2]
    hi = json.load(open(hi_path, encoding='utf-8'))
    fs = foods(hi)
    rc = recipes(hi)
    common = {'generated_from': 'Hindivine diet tools, branch claude/sharp-keller-2b9t4u',
              'units': 'kcal; grams (g) for macros and fibre; mg for minerals and vitamin C. Carbs are available carbohydrate '
                       '(fibre is listed separately), as in IFCT 2017.'}
    meta_f = dict(common, count=len(fs), counts={t: sum(f['type'] == t for f in fs) for t in ('raw_food', 'ingredient', 'dish')},
                  notes=['raw_food: IFCT 2017 (National Institute of Nutrition, ICMR), per 100 g edible portion.',
                         'ingredient: Hindivine cooking-ingredient list (values from IFCT 2017 / USDA), per 100 g; recipes link to these.',
                         'dish: one Hindivine recipe, per serving; full details in recipes.json (recipe_id).',
                         'name_hi is the Hindi name exactly as the tools display it (dictionary translation, not reviewed by a native speaker).',
                         'diet is as the Food Finder shows it; the Food Finder does not mark plain plant foods as vegan. '
                         'diet_in_generator is the diet the Diet Chart Generator uses when this food is added to a chart.',
                         'There is no Jain field for foods; Jain is handled for recipes only (see recipes.json and the spec).',
                         'Fields that are null have no value in the source data.'])
    meta_r = dict(common, count=len(rc),
                  nutrition_method='For each ingredient with an amount: grams_used_for_nutrition x (per-100 g value of its food_id) / 100, '
                                   'summed over all ingredients, then divided by servings. grams_used_for_nutrition equals amount, except for '
                                   'grains and dals listed as cooked, which are converted to raw weight with cooked_to_raw_factor. Ingredients '
                                   'without an amount (salt to taste, water as needed) count as 0. nutrition_per_serving is rounded the '
                                   'way the tools show it (kcal whole, others 1 decimal); nutrition_per_serving_exact is unrounded.',
                  notes=['amount is for the whole recipe, not per serving.',
                         'food_id links to foods.json (type ingredient). Water and ice have no food_id (0 kcal, not in the food list).',
                         'name_hi is the Hindi dish name exactly as the tools display it (word-by-word dictionary translation).',
                         'jain_friendly is derived: vegan or vegetarian and no onion, garlic or root vegetables (the generator\'s "Jain" food group).',
                         'generator shows how the Diet Chart Generator uses the recipe: auto_planner false means it is offered only in Add food / Swap.',
                         'There are no recipe images.'])
    with open(os.path.join(out_dir, 'foods.json'), 'w', encoding='utf-8') as fh:
        json.dump({'meta': meta_f, 'foods': fs}, fh, ensure_ascii=False, indent=1)
    with open(os.path.join(out_dir, 'recipes.json'), 'w', encoding='utf-8') as fh:
        json.dump({'meta': meta_r, 'recipes': rc}, fh, ensure_ascii=False, indent=1)
    gd = generator_data(os.path.join(out_dir, 'diet-chart-generator.html'))
    assert gd == json.loads(json.dumps(W.data())), 'embedded generator data differs from the source'
    with open(os.path.join(out_dir, 'diet-chart-generator-data.json'), 'w', encoding='utf-8') as fh:
        json.dump(gd, fh, ensure_ascii=False, separators=(',', ':'))
    print(len(fs), 'foods,', len(rc), 'recipes')


if __name__ == '__main__':
    main()
