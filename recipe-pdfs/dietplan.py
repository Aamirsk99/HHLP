"""Seven-day weight-loss meal plans built from the Hindivine recipe series.

Each plan is defined by a focus (general, high-protein, diabetes, PCOS, thyroid, heart, GLP-1), a daily calorie
target, a diet type and a weekly variation. Meals are real Hindivine recipes (by recipe number); portions are given
in recipe servings, rounded to quarters, and scaled so each day lands close to the calorie target."""
import random
import re

from catalog import CAT
from core import diet, grams_per_serving

FOCUS = {
    'general': 'General Weight Loss',
    'protein': 'High-Protein Weight Loss',
    'diabetes': 'Diabetes-Friendly Weight Loss',
    'pcos': 'PCOS Weight Loss',
    'thyroid': 'Thyroid-Friendly Weight Loss',
    'heart': 'Heart-Healthy Weight Loss',
    'glp1': 'GLP-1 Support Weight Loss',
}
KCALS = [1200, 1300, 1400, 1500, 1600, 1800]
PROTEINS = list(range(50, 191, 5))   # protein diet charts: 50-190 g a day in 5 g steps
OPTIONS = 5                          # menus per protein level and diet


def protein_kcal(p):
    """Calories for a protein-target chart: protein share rises from 17% (50 g) to 28% (190 g) of energy."""
    share = 0.17 + (p - 50) / 140 * 0.11
    return max(1200, int(round(p * 4 / share / 50)) * 50)


# Protein add-ons used to reach a protein target: (name, kcal, protein g, diets, slots), values per portion shown.
# Roasted chana 369 kcal/22.5 g per 100 g (IFCT); dry soya chunks 345/52; firm tofu 144/17.3; unsweetened soy milk 33/3.3
# per 100 ml; pea or whey protein ~120 kcal/24 g per 30 g scoop (typical label); non-fat Greek yogurt 59/10.2; skimmed milk
# 34/3.4; egg white 52/10.9; whole egg 155/12.6; cooked chicken breast 165/31; cooked fish fillet 128/26 (USDA).
ALL = ('vegan', 'veg', 'egg', 'nonveg')
ADDONS = [
    ('Pea protein, 1 scoop (30 g) in water', 120, 24.0, ('vegan',), ('mid', 'evening')),
    ('Whey protein, 1 scoop (30 g) in water or skimmed milk', 120, 24.0, ('veg', 'egg', 'nonveg'), ('mid', 'evening')),
    ('Grilled chicken breast, 100 g cooked', 165, 31.0, ('nonveg',), ('lunch', 'dinner')),
    ('Grilled fish fillet, 100 g cooked', 128, 26.0, ('nonveg',), ('dinner', 'lunch')),
    ('Boiled egg whites, 4', 69, 14.4, ('egg', 'nonveg'), ('breakfast', 'evening')),
    ('Low-fat hung curd / Greek yogurt, 150 g', 89, 15.3, ('veg', 'egg', 'nonveg'), ('lunch', 'evening')),
    ('Soya chunks, 25 g dry (boiled, added to sabzi or pulao)', 86, 13.0, ALL, ('lunch', 'dinner')),
    ('Firm tofu, 100 g (grilled or in curry)', 144, 17.3, ALL, ('dinner', 'lunch')),
    ('Boiled whole eggs, 2', 155, 12.6, ('egg', 'nonveg'), ('breakfast',)),
    ('Unsweetened soy milk, 250 ml', 83, 8.3, ALL, ('breakfast', 'bedtime')),
    ('Skimmed milk, 250 ml', 85, 8.5, ('veg', 'egg', 'nonveg'), ('bedtime', 'breakfast')),
    ('Roasted chana, 30 g', 111, 6.8, ALL, ('evening', 'mid')),
]
DIETS = {'veg': 'Vegetarian', 'vegan': 'Vegan', 'egg': 'Eggetarian', 'nonveg': 'Non-Vegetarian'}
WEEKS = 30
DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

# slot: (time, label, share of the day's calories)
SLOTS = [('early', '6:30 AM', 'Early Morning', 0.02), ('breakfast', '8:30 AM', 'Breakfast', 0.24),
         ('mid', '11:00 AM', 'Mid-Morning', 0.08), ('lunch', '1:30 PM', 'Lunch', 0.30),
         ('evening', '4:30 PM', 'Evening Snack', 0.10), ('dinner', '7:30 PM', 'Dinner', 0.22),
         ('bedtime', '9:30 PM', 'Bedtime', 0.04)]

FRIED = re.compile(r'\b(pakora|pakoda|bhaji|bhajji|bhajia|puri|poori|bhatura|samosa|kachori|fritter|vada|wada|bonda|chakli|mathri)s?\b', re.I)
NOT_FRIED = re.compile(r'baked|air[- ]?fried|appe|paniyaram|steamed|sprouts|dahi vada|no-fry', re.I)
REFINED = {'rice', 'basmati', 'idlirice', 'semiya', 'noodles', 'sabudana', 'cornflour', 'bread', 'rava', 'puffrice', 'ricefl'}
SOY = {'soya', 'soyagran', 'tofu', 'soymilk'}
# Bedtime: simple items (name, kcal, protein, diets allowed, focuses excluded) - toned milk 58 kcal/3.1 g protein per 100 ml,
# double-toned 45/3.1, unsweetened soy milk 33/3.3, unsweetened almond milk 15/0.4, almond 1 = 7 kcal, walnut half = 16 kcal
BEDTIME = [('Warm toned milk with a pinch of turmeric, no sugar (150 ml)', 87, 4.7, ('veg', 'egg', 'nonveg'), ('heart',)),
           ('Warm double-toned milk with a pinch of cinnamon, no sugar (150 ml)', 68, 4.7, ('veg', 'egg', 'nonveg'), ()),
           ('Warm unsweetened soy milk with cardamom (150 ml)', 50, 5.0, ('vegan', 'veg', 'egg', 'nonveg'), ('thyroid',)),
           ('Warm unsweetened almond milk with turmeric (150 ml)', 23, 0.6, ('vegan', 'veg', 'egg', 'nonveg'), ()),
           ('4 soaked almonds and 1 walnut half', 45, 1.5, ('vegan', 'veg', 'egg', 'nonveg'), ()),
           ('Chamomile or tulsi tea, no sugar (1 cup)', 3, 0.0, ('vegan', 'veg', 'egg', 'nonveg'), ())]
PLAIN = {  # simple items used when a slot has no suitable recipe
    'early': ('Warm water with lemon (no sugar)', 6, 0.1),
    'bedtime': ('Chamomile or tulsi tea (no sugar)', 3, 0.1),
}


# Carbs (available), fat and fibre in grams for add-ons and simple items, for the portion in the name (same values as the
# Diet Chart Maker): toned milk 4.7 g carbs / 3 g fat per 100 ml, double-toned 4.7 / 1.5, unsweetened soy milk 1.6 / 1.6,
# almond milk 0.3 / 1.1; soya chunks dry 21 / 0.5 / 13 per 100 g; roasted chana 58 / 5.2 / 18; others from labels / USDA.
MAC = {'Pea protein': (1, 2, 0.5), 'Whey protein': (3, 1.5, 0), 'Grilled chicken': (0, 3.6, 0), 'Grilled fish': (0, 2.7, 0),
       'Boiled egg whites': (0.7, 0.2, 0), 'Low-fat hung curd': (5.4, 0.6, 0), 'Soya chunks': (5.3, 0.1, 3.3), 'Firm tofu': (2.8, 8.7, 0.3),
       'Boiled whole eggs': (1.1, 10.6, 0), 'Unsweetened soy milk, 250': (4, 4, 1.5), 'Skimmed milk': (12.5, 0.3, 0),
       'Roasted chana': (17.4, 1.6, 5.4), 'Warm toned milk': (7.1, 4.5, 0), 'Warm double-toned milk': (7.1, 2.3, 0),
       'Warm unsweetened soy milk': (2.4, 2.4, 0.9), 'Warm unsweetened almond milk': (0.5, 1.7, 0.3), '4 soaked almonds': (1.4, 3.9, 0.8),
       'Chamomile or tulsi': (0.6, 0, 0), 'Warm water with lemon': (1.5, 0, 0)}


def simple(name, kcal, p, **extra):
    c, f, fib = next((v for k, v in MAC.items() if name.startswith(k)), (0, 0, 0))
    return dict(r=None, name=name, kcal1=kcal, p1=p, c1=c, f1=f, fib1=fib, mult=1, fixed=True, **extra)


def features(r):
    gps = grams_per_serving(r)
    n = r['nut']
    f = dict(kcal=n['kcal'], p=n['p'], c=n['c'], f=n['f'], fib=n['fib'], diet=diet(r))
    f['sugar'] = sum(g for k, g in gps.items() if 'SUG' in CAT[k]['tags'])
    f['fruit_sugar'] = sum(g for k, g in gps.items() if 'NSUG' in CAT[k]['tags'])
    f['satfat'] = sum(CAT[k]['f'] * g / 100 for k, g in gps.items() if 'SF' in CAT[k]['tags'])
    f['salty'] = any('NA' in CAT[k]['tags'] for k in gps if k not in ('eno', 'soda'))
    f['refined'] = sum(g for k, g in gps.items() if k in REFINED)
    f['soy'] = sum(g for k, g in gps.items() if k in SOY)
    f['potato'] = gps.get('potato', 0)
    f['fruit'] = sum(g for k, g in gps.items() if CAT[k]['cat'] == 'fruit' and k not in ('lemon', 'amla', 'rawmango', 'avocado'))
    f['fried'] = bool(FRIED.search(r['name'])) and not NOT_FRIED.search(r['name'])
    f['pdens'] = n['p'] * 4 / max(n['kcal'], 1)
    f['mutton'] = any(k in ('mutton', 'muttonmince') for k in gps)
    return f


def allowed_diet(plan_diet, d):
    return {'vegan': d == 'vegan', 'veg': d in ('vegan', 'veg'), 'egg': d in ('vegan', 'veg', 'egg'),
            'nonveg': True}[plan_diet]


def focus_ok(focus, r, f):
    if f['fried'] or r['cat'] == 'Healthy Sweets':
        return False
    if f['sugar'] >= 4 or f['kcal'] < 15:
        return False
    if 'juice' in r['name'].lower() and (focus != 'general' or f['fruit'] >= 40):
        return False
    if focus in ('diabetes', 'pcos'):
        if f['sugar'] >= 1 or f['fruit_sugar'] >= 40 or f['refined'] >= 20 or f['potato'] >= 50 or 'juice' in r['name'].lower():
            return False
    if focus == 'heart':
        if f['satfat'] > 3 or f['salty'] or f['f'] > 12 or f['mutton']:
            return False
    if focus == 'glp1':
        if f['f'] > 12 or f['satfat'] > 4:
            return False
    if focus == 'thyroid':
        if f['soy'] >= 15:
            return False
    return True


def _pools(rs):
    feats = {r['no']: features(r) for r in rs}
    pools = {
        'early': [r for r in rs if 'Early Morning' in r['meals']],
        'breakfast': [r for r in rs if r['meals'][0] == 'Breakfast' and r['cat'] not in ('Drinks & Smoothies', 'Chutneys & Dips', 'Healthy Sweets')],
        'mid': [r for r in rs if 'Mid-Morning' in r['meals'] and feats[r['no']]['kcal'] <= 220],
        'main': [r for r in rs if r['cat'] in ('Dals, Sambar & Kadhi', 'Legume Curries', 'Paneer & Vegetable Curries', 'Chicken', 'Fish & Seafood', 'Mutton', 'Egg Dishes')
                 and ('Lunch' in r['meals'] or 'Dinner' in r['meals'])],
        'sabzi': [r for r in rs if r['cat'] == 'Dry Sabzi'],
        'roti': [r for r in rs if r['cat'] == 'Breads & Parathas' and r['sub'] in ('Roti', 'Bhakri / Millet Roti', 'Paratha', 'Thepla')],
        'rice': [r for r in rs if r['cat'] == 'Rice, Khichdi & Biryani' and r['sub'] in ('Pulao', 'Khichdi', 'Flavoured Rice')],
        'onepot': [r for r in rs if r['cat'] == 'Rice, Khichdi & Biryani' and r['sub'] in ('Khichdi', 'Biryani')],
        'salad': [r for r in rs if r['cat'] == 'Salads & Raita'],
        'soup': [r for r in rs if r['cat'] == 'Soups'],
        'evening': [r for r in rs if 'Evening Snacks' in r['meals'] and r['cat'] in ('Snacks & Starters', 'Soups', 'Salads & Raita', 'Sandwiches & Wraps', 'Drinks & Smoothies', 'Poha, Upma & Porridge')
                    and feats[r['no']]['kcal'] <= 260],
        'bedtime': [r for r in rs if 'Bedtime' in r['meals']],
        'eggbf': [r for r in rs if r['cat'] == 'Egg Dishes' and 'Breakfast' in r['meals']],
        'nvmain': [r for r in rs if r['cat'] in ('Chicken', 'Fish & Seafood', 'Mutton')],
    }
    return feats, pools


class Planner:
    def __init__(self, rs):
        self.rs = rs
        self.feats, self.pools = _pools(rs)
        self._cache = {}

    def pool(self, name, focus, pdiet, band=None):
        key = (name, focus, pdiet, band)
        if key not in self._cache:
            out = [r for r in self.pools[name] if allowed_diet(pdiet, self.feats[r['no']]['diet']) and focus_ok(focus, r, self.feats[r['no']])]
            if focus in ('protein', 'glp1', 'pcos') and name in ('breakfast', 'main', 'evening', 'mid', 'sabzi'):
                out.sort(key=lambda r: -self.feats[r['no']]['pdens'])
                out = out[:max(12, int(len(out) * (0.4 if focus != 'pcos' else 0.6)))]
            if band and name in ('breakfast', 'main', 'evening', 'mid', 'sabzi', 'salad', 'soup', 'rice', 'onepot', 'roti', 'eggbf', 'nvmain'):
                out.sort(key=lambda r: -self.feats[r['no']]['pdens'])
                n = len(out)
                lo, hi = {'vlow': (0.6, 1.0), 'low': (0.4, 1.0), 'mid': (0.0, 1.0), 'high': (0.0, 0.5), 'max': (0.0, 0.3)}[band]
                out = out[int(n * lo):max(int(n * hi), int(n * lo) + 8)] or out
            out.sort(key=lambda r: r['no'])
            self._cache[key] = out
        return self._cache[key]

    def pick(self, rnd, name, focus, pdiet, used, band=None):
        p = self.pool(name, focus, pdiet, band)
        if not p:
            return None
        fresh = [r for r in p if r['no'] not in used]
        r = rnd.choice(fresh or p)
        used.add(r['no'])
        return r

    def day(self, rnd, focus, pdiet, kcal, di, used, protein=None):
        """One day: list of (slot, [component dicts])."""
        nv_day = pdiet == 'nonveg' and di in (0, 2, 4, 5)
        egg_day = pdiet in ('egg', 'nonveg') and di in (1, 3, 6)
        plan = []
        for slot, time, label, share in SLOTS:
            comps = []
            if slot == 'early':
                comps = [('early', 1)]
            elif slot == 'breakfast':
                comps = [('eggbf' if egg_day else 'breakfast', 1)]
            elif slot == 'mid':
                comps = [('mid', 1)]
            elif slot == 'lunch':
                style = di % 3
                main = 'nvmain' if nv_day and di % 2 == 0 else 'main'
                if style == 0:
                    comps = [(main, 1), ('roti', 1), ('salad', 1)]
                elif style == 1:
                    comps = [(main, 1), ('rice', 1), ('salad', 1)]
                else:
                    comps = [(main, 1), ('sabzi', 1), ('roti', 1)]
            elif slot == 'evening':
                comps = [('evening', 1)]
            elif slot == 'dinner':
                main = 'nvmain' if nv_day and di % 2 == 1 else ('main' if di % 2 else 'sabzi')
                comps = [('soup', 1), (main, 1), ('roti', 1)] if di % 3 != 2 else [('onepot', 1), ('salad', 1)]
            elif slot == 'bedtime':
                opts = [b for b in BEDTIME if pdiet in b[3] and focus not in b[4]]
                nm, kc, pr = opts[di % len(opts)][:3]
                plan.append(dict(slot=slot, time=time, label=label, share=share,
                                 items=[simple(nm, kc, pr)]))
                continue
            items = []
            for pname, _ in comps:
                band = None
                if protein:
                    ratio = protein * 4 / kcal
                    band = 'vlow' if ratio < 0.18 else 'low' if ratio < 0.20 else 'mid' if ratio < 0.22 else 'high' if ratio < 0.25 else 'max'
                    if pdiet == 'nonveg':  # meat and fish dishes are protein-dense already
                        ratio -= 0.05 if slot in ('lunch', 'dinner') else 0.02
                        band = 'vlow' if ratio < 0.18 else 'low' if ratio < 0.20 else 'mid' if ratio < 0.22 else 'high' if ratio < 0.25 else 'max'
                r = self.pick(rnd, pname, focus, pdiet, used, band)
                if r is None and pname in ('nvmain', 'eggbf'):
                    r = self.pick(rnd, 'main' if pname == 'nvmain' else 'breakfast', focus, pdiet, used)
                if r is None and pname == 'onepot':
                    r = self.pick(rnd, 'rice', focus, pdiet, used)
                if r is None:
                    if slot in PLAIN:
                        nm, kc, pr = PLAIN[slot]
                        items.append(simple(nm, kc, pr))
                    continue
                f = self.feats[r['no']]
                items.append(dict(r=r, name=r['name'], kcal1=f['kcal'], p1=f['p'], c1=f['c'], f1=f['f'], fib1=f['fib'],
                                  mult=1, fixed=slot in ('early', 'bedtime')))
            plan.append(dict(slot=slot, time=time, label=label, share=share, items=items))
        self.fit(plan, kcal, focus)
        if protein:
            self.reach_protein(plan, kcal, focus, pdiet, protein, di)
        return plan

    def reach_protein(self, plan, kcal, focus, pdiet, target, di):
        """Add protein add-ons (each at most twice a day) until the day reaches the protein target, refitting portions."""
        opts = [a for a in ADDONS if pdiet in a[3]]
        opts.sort(key=lambda a: -a[2] / a[1])
        count = {}
        slots = {s['slot']: s for s in plan}
        for k in range(14):
            p = totals(plan)['p']
            if p >= target * 0.97:
                break
            need = target - p
            # rotate the order a little by day so menus differ, prefer an add-on close to what is still needed
            cand = [a for a in opts if count.get(a[0], 0) < 2]
            if not cand:
                break
            cand = cand[:4]
            a = cand[(di + k) % len(cand)] if need > 12 else min(cand, key=lambda a: abs(a[2] - need))
            count[a[0]] = count.get(a[0], 0) + 1
            slot = a[4][(count[a[0]] - 1) % len(a[4])]
            slots[slot]['items'].append(simple(a[0], a[1], a[2], addon=True))
            self.fit(plan, kcal, focus)

    def fit(self, plan, kcal, focus):
        """Scale portions (quarter servings, 0.5-2, more for high-calorie days) so each slot, then the day, is close to target."""
        hi = 1.5 if focus == 'glp1' else 2.0 + max(0, (kcal - 1800) / 1800)
        hi = int(hi * 4) / 4  # portions stay in quarter servings
        fixed = sum(i['kcal1'] * i['mult'] for s in plan for i in s['items'] if i['fixed'] and s['slot'] not in ('early', 'bedtime'))
        scale = max(0.5, (kcal - fixed) / kcal) if fixed else 1
        for s in plan:
            tgt = kcal * s['share'] * scale
            items = [i for i in s['items'] if not i['fixed']]
            if not items:
                continue
            base = sum(i['kcal1'] for i in items)
            m = tgt / base if base else 1
            for i in items:
                i['mult'] = min(hi, max(0.5, round(m * 4) / 4))
        adj = [i for s in plan for i in s['items'] if not i['fixed']]
        for _ in range(40):
            tot = sum(i['kcal1'] * i['mult'] for s in plan for i in s['items'])
            diff = kcal - tot
            if abs(diff) <= kcal * 0.03:
                break
            step = 0.25 if diff > 0 else -0.25
            cands = [i for i in adj if 0.5 <= i['mult'] + step <= hi]
            if not cands:
                break
            best = min(cands, key=lambda i: abs(diff - i['kcal1'] * step))
            if abs(diff - best['kcal1'] * step) >= abs(diff):
                break
            best['mult'] += step


def totals(day):
    t = dict(kcal=0, p=0, c=0, f=0, fib=0)
    for s in day:
        for i in s['items']:
            t['kcal'] += i['kcal1'] * i['mult']
            t['p'] += i['p1'] * i['mult']
            for k in ('c', 'f', 'fib'):
                t[k] += i.get(k + '1', 0) * i['mult']
    return t


def make(pl, focus, kcal, d, seed, protein=None):
    """One 7-day plan for the given settings; the same seed always gives the same plan."""
    rnd = random.Random(seed)
    used = set()
    days = [pl.day(rnd, focus, d, kcal, di, used, protein) for di in range(7)]
    return dict(focus=focus, kcal=kcal, diet=d, protein=protein, days=days)


def protein_plans(rs):
    """Yield every protein-target plan: 50-190 g x 4 diets x OPTIONS menus."""
    pl = Planner(rs)
    for p in PROTEINS:
        for d in DIETS:
            for opt in range(1, OPTIONS + 1):
                plan = make(pl, 'general', protein_kcal(p), d, f'protein-{p}-{d}-{opt}', p)
                plan['option'] = opt
                yield plan


def plans(rs):
    """Yield every weight-loss plan: dict(no, focus, kcal, diet, week, days)."""
    pl = Planner(rs)
    no = 0
    for focus in FOCUS:
        for kcal in KCALS:
            for d in DIETS:
                for wk in range(1, WEEKS + 1):
                    no += 1
                    rnd = random.Random(f'{focus}-{kcal}-{d}-{wk}')
                    used = set()
                    days = [pl.day(rnd, focus, d, kcal, di, used) for di in range(7)]
                    yield dict(no=no, focus=focus, kcal=kcal, diet=d, week=wk, days=days)
