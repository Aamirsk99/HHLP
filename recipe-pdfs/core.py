"""Recipe model: compact ingredient strings, household quantities and nutrition per serving."""
from catalog import CAT

RECIPES = []
NAMES = set()
VOLUME = 1      # volume 2 modules (fam2_*.py) set this to 2
SKIPPED = []    # later-volume names that already exist in an earlier volume
KEYS = set()    # word-set keys of every recipe name, to catch near-duplicates

SYN = {'palak': 'spinach', 'methi': 'fenugreek', 'gobi': 'cauliflower', 'gobhi': 'cauliflower', 'phool': 'cauliflower',
       'matar': 'peas', 'mutter': 'peas', 'aloo': 'potato', 'bataka': 'potato', 'batata': 'potato', 'pyaz': 'onion', 'kanda': 'onion',
       'tamatar': 'tomato', 'gajar': 'carrot', 'baingan': 'brinjal', 'vangi': 'brinjal', 'begun': 'brinjal', 'bhindi': 'okra',
       'kaddu': 'pumpkin', 'lauki': 'bottlegourd', 'dudhi': 'bottlegourd', 'mooli': 'radish', 'mullangi': 'radish', 'shimla': 'capsicum',
       'mirch': 'capsicum', 'makai': 'corn', 'makki': 'corn', 'chana': 'chickpea', 'chole': 'chickpea', 'kabuli': 'chickpea',
       'dahi': 'curd', 'yogurt': 'curd', 'nachni': 'ragi', 'kambu': 'bajra', 'murgh': 'chicken', 'anda': 'egg', 'machhi': 'fish',
       'macher': 'fish', 'meen': 'fish', 'jhinga': 'prawn', 'prawns': 'prawn', 'chingri': 'prawn', 'eggs': 'egg', 'beetroot': 'beet',
       'sprouted': 'sprouts', 'til': 'sesame', 'suva': 'dill', 'pudina': 'mint', 'dhaniya': 'coriander', 'kothimbir': 'coriander',
       'sooji': 'rava', 'suji': 'rava', 'semolina': 'rava', 'vegetables': 'vegetable', 'veg': 'vegetable', 'mixed': 'vegetable',
       'chilla': 'chila', 'cheela': 'chila', 'pakoda': 'pakora', 'raitha': 'raita', 'kheema': 'keema', 'mushrooms': 'mushroom'}
STOP = {'with', 'and', 'the', 'style', 'lighter', 'a', 'of', 'in', 'dry', 'stuffed', 'homestyle', 'curry', 'sabzi', 'indian',
        'no', 'sugar', 'less', 'easy', 'quick', 'healthy', 'fresh', 'south', 'north'}


def name_key(name):
    import re
    ws = re.findall(r'[a-z]+', name.lower())
    return frozenset(SYN.get(w, w) for w in ws if w not in STOP)

LIQUIDS = {'water', 'milk', 'coconutmilk', 'soymilk', 'coconutwater'}
SMALL_UNITS = {'tsp', 'pinch', 'nos', 'sprig', 'clove', 'inch', 'stalk', 'slice'}
FRACS = [(0, ''), (0.25, '¼'), (1 / 3, '1/3'), (0.5, '½'), (2 / 3, '2/3'), (0.75, '¾'), (1, '')]


def frac(x):
    whole = int(x)
    rest = x - whole
    best = min(FRACS, key=lambda f: abs(f[0] - rest))
    if best[0] == 1:
        whole, sym = whole + 1, ''
    else:
        sym = best[1]
    if whole == 0 and not sym:
        return '¼'
    if whole and sym and '/' in sym:
        return f'{whole} {sym}'
    return (str(whole) if whole else '') + sym


def plural(label, n_txt):
    if label in ('cup', 'slice', 'clove', 'sprig', 'stalk') and n_txt not in ('1',) and not n_txt.startswith(('¼', '½', '¾', '1/3', '2/3')):
        return label + 's'
    return label


def quantity(key, g, note=''):
    """Household quantity text, e.g. '1 cup (90 g)' or '½ tsp'."""
    it = CAT[key]
    if key == 'salt' or key == 'blacksalt':
        return 'to taste'
    if g is None:
        return note or 'as needed'
    if key == 'ice':
        return 'as needed'
    units = sorted(it['units'], key=lambda u: -u[1])
    if units[0][0] == 'g':
        return f'{g:g} ml' if key in LIQUIDS else f'{round(g):g} g'
    chosen = units[-1]
    for lab, ug in units:
        need = 0.25 if lab == 'cup' else (0.5 if lab in ('medium', 'nos') else 1)
        if g / ug >= need - 1e-9:
            chosen = (lab, ug)
            break
    lab, ug = chosen
    if lab == 'cup' and g / ug > 4 and key not in LIQUIDS:
        return f'{round(g):g} g'
    COUNT = ('nos', 'sprig', 'clove', 'slice', 'stalk', 'medium', 'inch')
    if lab in COUNT and g / ug >= 1.75:
        n = str(int(g / ug + 0.5))
    elif lab in COUNT and lab != 'medium':
        n = frac(round(g / ug * 2) / 2 or 0.5)
    else:
        n = frac(g / ug)
    if lab == 'medium' and g / ug < 1.75:
        x = g / ug
        size = 'small' if x < 0.8 else 'medium' if x < 1.25 else 'large' if x < 1.6 else None
        if size:
            return f'1 {size} ({round(g):g} g)'
    if lab == 'nos':
        if g >= 40:  # larger produce: show the weight too, e.g. '½ (100 g)'
            return f'{n} ({round(g):g} g)'
        txt = n
    else:
        txt = f'{n} {plural(lab, n)}'
    if key in LIQUIDS:
        return f'{txt} ({round(g):g} ml)' if lab != 'tbsp' else txt
    if lab in SMALL_UNITS or lab in ('tbsp',) and g < 20:
        return txt
    return f'{txt} ({round(g):g} g)'


def parse_list(s):
    out = []
    for part in s.split(';'):
        part = part.strip()
        if not part:
            continue
        bits = part.split(' ', 2)
        key = bits[0]
        if key not in CAT:
            raise KeyError(f'Unknown ingredient "{key}" in "{part}"')
        g, note = None, ''
        if len(bits) > 1:
            try:
                g = float(bits[1])
                note = bits[2] if len(bits) > 2 else ''
            except ValueError:
                note = ' '.join(bits[1:])
        out.append((key, g, note))
    return out


def recipe(name, cat, desc, serves, prep, cook, ings, steps, tips=(), serve=(), store='', level='Easy',
           sub='', tags=()):
    key = name_key(name)
    if VOLUME >= 3 and key in KEYS:
        SKIPPED.append(name)
        return None
    if name in NAMES:
        if VOLUME > 1:
            SKIPPED.append(name)
            return None
        raise ValueError('Duplicate recipe: ' + name)
    NAMES.add(name)
    KEYS.add(key)
    if isinstance(ings, str):
        ings = [('Ingredients', ings)]
    groups = [(t, parse_list(s)) for t, s in ings]
    st = []
    for s in steps:
        if isinstance(s, tuple):
            st.append(s)
        else:
            h, t = s.split(': ', 1)
            st.append((h, t))
    r = dict(name=name, cat=cat, desc=desc, serves=serves, prep=prep, cook=cook, groups=groups, steps=st,
             tips=list(tips), serve=list(serve), store=store, level=level, sub=sub, tags=set(tags), vol=VOLUME)
    r['nut'] = nutrition(r)
    RECIPES.append(r)
    return r


def all_items(r):
    for _, items in r['groups']:
        for it in items:
            yield it


# Cooked weights of grains and dals: nutrition is stored per 100 g dry, so convert with typical cooked yields
# (rice and millets about 2.8x their dry weight, quinoa 2.7x, thick-cooked dal 2.5x).
COOKED_NOTES = {'cooked', 'cooked thick', 'cooked dal', 'cooked and cooled'}
COOKED_FACTOR = {'rice': 0.36, 'brice': 0.36, 'rrice': 0.36, 'basmati': 0.36, 'foxtail': 0.33, 'kodo': 0.33, 'kutki': 0.33, 'sama': 0.33,
                 'quinoa': 0.37, 'chanadal': 0.4, 'toor': 0.4}


def dry_grams(key, g, note):
    if note and note.strip().lower() in COOKED_NOTES and key in COOKED_FACTOR and not (key == 'toor' and note.strip() == 'cooked'):
        return g * COOKED_FACTOR[key]
    return g


def nutrition(r):
    tot = dict(kcal=0, p=0, c=0, f=0, fib=0)
    for key, g, note in all_items(r):
        if not g:
            continue
        x = CAT[key]
        g = dry_grams(key, g, note)
        for k in tot:
            tot[k] += x[k] * g / 100
    return {k: v / r['serves'] for k, v in tot.items()}


def grams_per_serving(r):
    out = {}
    for key, g, note in all_items(r):
        if g:
            out[key] = out.get(key, 0) + dry_grams(key, g, note) / r['serves']
    return out


def keys(r):
    return {k for k, _, _ in all_items(r)}


def diet(r):
    tags = set()
    for k in keys(r):
        tags |= CAT[k]['tags']
    if tags & {'chicken', 'mutton', 'fish', 'shellfish'}:
        return 'nonveg'
    if 'egg' in tags:
        return 'egg'
    if 'dairy' in tags or 'honey' in keys(r):
        return 'veg'
    return 'vegan'


def name_of(key, lower=True):
    n = CAT[key]['name']
    return n.lower() if lower else n
