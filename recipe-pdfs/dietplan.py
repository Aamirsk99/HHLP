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

    def pool(self, name, focus, pdiet):
        key = (name, focus, pdiet)
        if key not in self._cache:
            out = [r for r in self.pools[name] if allowed_diet(pdiet, self.feats[r['no']]['diet']) and focus_ok(focus, r, self.feats[r['no']])]
            if focus in ('protein', 'glp1', 'pcos') and name in ('breakfast', 'main', 'evening', 'mid', 'sabzi'):
                out.sort(key=lambda r: -self.feats[r['no']]['pdens'])
                out = out[:max(12, int(len(out) * (0.4 if focus != 'pcos' else 0.6)))]
            out.sort(key=lambda r: r['no'])
            self._cache[key] = out
        return self._cache[key]

    def pick(self, rnd, name, focus, pdiet, used):
        p = self.pool(name, focus, pdiet)
        if not p:
            return None
        fresh = [r for r in p if r['no'] not in used]
        r = rnd.choice(fresh or p)
        used.add(r['no'])
        return r

    def day(self, rnd, focus, pdiet, kcal, di, used):
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
                                 items=[dict(r=None, name=nm, kcal1=kc, p1=pr, mult=1, fixed=True)]))
                continue
            items = []
            for pname, _ in comps:
                r = self.pick(rnd, pname, focus, pdiet, used)
                if r is None and pname in ('nvmain', 'eggbf'):
                    r = self.pick(rnd, 'main' if pname == 'nvmain' else 'breakfast', focus, pdiet, used)
                if r is None and pname == 'onepot':
                    r = self.pick(rnd, 'rice', focus, pdiet, used)
                if r is None:
                    if slot in PLAIN:
                        nm, kc, pr = PLAIN[slot]
                        items.append(dict(r=None, name=nm, kcal1=kc, p1=pr, mult=1, fixed=True))
                    continue
                f = self.feats[r['no']]
                items.append(dict(r=r, name=r['name'], kcal1=f['kcal'], p1=f['p'], c1=f['c'], f1=f['f'], fib1=f['fib'],
                                  mult=1, fixed=slot in ('early', 'bedtime')))
            plan.append(dict(slot=slot, time=time, label=label, share=share, items=items))
        self.fit(plan, kcal, focus)
        return plan

    def fit(self, plan, kcal, focus):
        """Scale portions (quarter servings, 0.5-2) so each slot, then the day, is close to target."""
        hi = 1.5 if focus == 'glp1' else 2.0
        for s in plan:
            tgt = kcal * s['share']
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


def plans(rs):
    """Yield every plan: dict(no, focus, kcal, diet, week, days)."""
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
