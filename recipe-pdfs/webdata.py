"""Build diet-generator/index.html: the Hindivine Auto Diet Chart page with recipe data and plan rules embedded.

    python3 webdata.py            # writes ../diet-generator/index.html (with a Print / Save as PDF button)
    python3 webdata.py --no-print OUT.html   # same page without the print button
"""
import base64
import json
import os
import sys

import build as B
import dietchart as C
import dietplan as D
import render as R

HERE = os.path.dirname(os.path.abspath(__file__))
POOLS = ['early', 'breakfast', 'mid', 'main', 'sabzi', 'roti', 'rice', 'onepot', 'salad', 'soup', 'evening', 'bedtime', 'eggbf', 'nvmain']
DIETC = {'vegan': 0, 'veg': 1, 'egg': 2, 'nonveg': 3}


from catalog import CAT
from core import keys as rkeys, grams_per_serving

# Food groups for "prefer" and "avoid" (bit order matters: the web page reads GROUPS by index)
ROOTS = {'onion', 'garlic', 'springonion', 'shallot', 'potato', 'carrot', 'beet', 'mooli', 'sweetpotato', 'arbi', 'suran', 'turnip',
         'ginger', 'lotusstem', 'rawbanana'}
GROUP_KEYS = [
    ('onion', 'Onion & garlic', lambda k, c: k in ('onion', 'garlic', 'springonion', 'shallot')),
    ('jain', 'Jain (no onion, garlic, root veg)', lambda k, c: k in ROOTS),
    ('dairy', 'Dairy', lambda k, c: 'dairy' in c['tags']),
    ('gluten', 'Gluten (wheat)', lambda k, c: 'gluten' in c['tags']),
    ('soy', 'Soy & tofu', lambda k, c: 'soy' in c['tags'] or k in ('soya', 'soyagran', 'tofu', 'soymilk')),
    ('peanut', 'Peanuts', lambda k, c: 'peanut' in c['tags']),
    ('nuts', 'Tree nuts', lambda k, c: 'nuts' in c['tags']),
    ('egg', 'Egg', lambda k, c: 'egg' in c['tags']),
    ('chicken', 'Chicken', lambda k, c: 'chicken' in c['tags']),
    ('fish', 'Fish & seafood', lambda k, c: c['tags'] & {'fish', 'shellfish'}),
    ('mutton', 'Mutton', lambda k, c: 'mutton' in c['tags']),
    ('potato', 'Potato', lambda k, c: k in ('potato', 'sweetpotato')),
    ('brinjal', 'Brinjal', lambda k, c: k == 'brinjal'),
    ('mushroom', 'Mushroom', lambda k, c: k == 'mushroom'),
    ('paneer', 'Paneer', lambda k, c: k in ('paneer', 'lfpaneer')),
    ('coconut', 'Coconut', lambda k, c: k in ('coconut', 'coconutmilk', 'coconutoil')),
    ('rice', 'Rice & poha', lambda k, c: k in ('rice', 'basmati', 'brice', 'rrice', 'idlirice', 'ricefl', 'poha', 'rpoha', 'puffrice')),
    ('millets', 'Millets', lambda k, c: k in ('ragi', 'jowar', 'bajra', 'foxtail', 'kodo', 'sama', 'kutki', 'makki', 'rajgira', 'kuttu', 'quinoa')),
    ('oats', 'Oats', lambda k, c: k == 'oats'),
    ('pulses', 'Dals, beans & sprouts', lambda k, c: c['cat'] == 'pulse'),
    ('greens', 'Leafy greens', lambda k, c: c['cat'] == 'leafy'),
]
REGIONS = [
    ('south', 'South Indian', 'dosa idli uttapam appam sambar rasam upma pongal poriyal kootu avial thoran kozhukattai paniyaram adai pesarattu '
                              'puttu bisibele chettinad kerala mangalorean udupi andhra tamil karnataka chutney kuzhambu mor neer'),
    ('north', 'North Indian', 'paratha chole rajma makhani punjabi amritsari kashmiri lucknowi awadhi tadka sarson makki kadhi bhurji tikka '
                              'kulcha missi dal-makhani pindi'),
    ('west', 'Gujarati & Maharashtrian', 'thepla dhokla handvo khakhra undhiyu gujarati rajasthani sangri khichu muthia dhokli gatte '
                                         'thalipeeth misal usal zunka pithla bhakri kolhapuri maharashtrian varan amti'),
    ('east', 'Bengali & Odia', 'bengali odia assamese macher shukto chorchori posto dalma ghanta kosha bihari litti sattu'),
]
VRAT_OK_GRAINS = {'sama', 'kuttu', 'rajgira', 'singhara', 'sabudana', 'makhana'}
# texture / meal-role bits for liquid, semi-liquid and soft diets
TEX = ['liquid', 'semi', 'soft', 'porridge', 'khichdi', 'sdal', 'raita', 'ldrink', 'lsoup', 'lthin', 'vrat', 'nosugar', 'lowfat']


def tex_bits(r, f):
    sub, cat, nm = r['sub'], r['cat'], r['name'].lower()
    ldrink = cat == 'Drinks & Smoothies'
    lsoup = cat == 'Soups'
    lthin = sub in ('Rasam', 'Kadhi')
    liquid = ldrink or lsoup or lthin
    porridge = sub == 'Porridge'
    khichdi = cat == 'Rice, Khichdi & Biryani' and sub == 'Khichdi'
    sdal = cat == 'Dals, Sambar & Kadhi'
    raita = cat == 'Salads & Raita' and 'raita' in nm
    semi = liquid or porridge or khichdi or sdal or raita
    soft = semi or 'soft' in r['tags']
    ks = rkeys(r)
    vrat = not any(k in ('onion', 'garlic', 'springonion', 'shallot', 'hing') or (CAT[k]['cat'] in ('grain', 'pulse') and k not in VRAT_OK_GRAINS)
                   or k in ('besan', 'sattu', 'roastchana') for k in ks)
    nosugar = f['sugar'] < 1
    lowfat = f['f'] <= 12 and f['satfat'] <= 4 and not f['fried']
    vals = dict(liquid=liquid, semi=semi, soft=soft, porridge=porridge, khichdi=khichdi, sdal=sdal, raita=raita, ldrink=ldrink,
                lsoup=lsoup, lthin=lthin, vrat=vrat, nosugar=nosugar, lowfat=lowfat)
    return sum(1 << i for i, t in enumerate(TEX) if vals[t])


def group_bits(r):
    ks = rkeys(r)
    bits = 0
    for i, (_, _, fn) in enumerate(GROUP_KEYS):
        if any(fn(k, CAT[k]) for k in ks):
            bits |= 1 << i
    nm = r['name'].lower()
    for j, (_, _, words) in enumerate(REGIONS):
        if any(w in nm for w in words.split()):
            bits |= 1 << (len(GROUP_KEYS) + j)
    return bits


def data():
    rs = B.ordered(True)
    feats, pools = D._pools(rs)
    ingr = sorted(CAT)
    iidx = {k: i for i, k in enumerate(ingr)}
    member = {}
    for i, name in enumerate(POOLS):
        for r in pools[name]:
            member[r['no']] = member.get(r['no'], 0) | (1 << i)
    recs = []
    for r in rs:
        if r['no'] not in member and not ('soft' in r['tags'] or r['cat'] in ('Drinks & Smoothies', 'Soups', 'Dals, Sambar & Kadhi')):
            continue
        f = feats[r['no']]
        fmask = sum(1 << i for i, fo in enumerate(D.FOCUS) if D.focus_ok(fo, r, f))
        recs.append([r['no'], r['name'], round(f['kcal'], 1), round(f['p'], 1), round(f['c'], 1), round(f['f'], 1), round(f['fib'], 1),
                     DIETC[f['diet']], member.get(r['no'], 0), fmask, r['cat'], tex_bits(r, f), group_bits(r),
                     [iidx[k] for k in sorted(rkeys(r)) if k not in ('salt', 'water', 'oil')]])
    return dict(
        recs=recs, pools=POOLS, focus=list(D.FOCUS.items()), diets=list(D.DIETS.items()), kcals=D.KCALS,
        slots=[list(s) for s in D.SLOTS], bedtime=[list(b) for b in D.BEDTIME], addons=[list(a) for a in D.ADDONS],
        plain={k: list(v) for k, v in D.PLAIN.items()},
        info={k: list(v) for k, v in C.FOCUS_INFO.items()},
        services=[list(s) for s in R.SERVICES], glp1=R.GLP1, tex=TEX,
        groups=[[k, n] for k, n, _ in GROUP_KEYS] + [[k, n] for k, n, _ in REGIONS],
        ingr=[CAT[k]['name'] for k in ingr])


def load_i18n():
    """Translations from i18n/<code>.json (see i18n/README.md); languages listed in i18n/languages.json order."""
    d = os.path.join(HERE, 'i18n')
    out = {}
    if not os.path.exists(os.path.join(d, 'languages.json')):
        return out
    for code, meta in json.load(open(os.path.join(d, 'languages.json'), encoding='utf-8')).items():
        p = os.path.join(d, code + '.json')
        if os.path.exists(p):
            data = json.load(open(p, encoding='utf-8'))
            out[code] = dict(meta, t=data.get('t', {}), w=data.get('w', {}))
    return out


def main():
    noprint = '--no-print' in sys.argv
    args = [a for a in sys.argv[1:] if a != '--no-print']
    out = args[0] if args else os.path.join(HERE, '..', 'diet-generator', 'index.html')
    tpl = open(os.path.join(HERE, 'web_template.html'), encoding='utf-8').read()
    logo = base64.b64encode(open(os.path.join(HERE, 'logo-small.jpg'), 'rb').read()).decode()
    html = (tpl.replace('/*__DATA__*/null', json.dumps(data(), separators=(',', ':')))
            .replace('__LOGO__', 'data:image/jpeg;base64,' + logo)
            .replace('/*__CANPRINT__*/true', 'false' if noprint else 'true')
            .replace('/*__I18N__*/{}', json.dumps(load_i18n(), ensure_ascii=False, separators=(',', ':'))))
    if not noprint:  # standalone file for a website or dashboard: a complete HTML document
        title_end = html.index('</title>') + len('</title>')
        html = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
                '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
                + html[:title_end] + html[title_end:html.index('</style>') + 8] + '\n</head>\n<body>\n'
                + html[html.index('</style>') + 8:] + '\n</body>\n</html>\n')
    with open(out, 'w', encoding='utf-8') as fh:
        fh.write(html)
    print(out, len(html) // 1024, 'KB')


if __name__ == '__main__':
    main()
