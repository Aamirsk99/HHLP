"""Meal-time tags for every recipe: the first tag is the folder the PDF goes in, the rest are also listed on the PDF and in the index."""

MEALS = ['Early Morning', 'Breakfast', 'Mid-Morning', 'Lunch', 'Evening Snacks', 'Dinner', 'Bedtime', 'Desserts & Sweets', 'Accompaniments']
EXTRA = ['Vrat / Fasting']  # listed on PDFs and in the index, never a folder

EARLY = ('water', 'kadha', 'shot', 'detox', 'tulsi tea', 'green tea', 'cinnamon tea', 'lemongrass', 'ginger lemon', 'turmeric ginger tea', 'moringa leaf tea',
         'karela juice', 'ash gourd juice', 'lauki juice', 'amla', 'jeera water', 'methi seed')
BEDTIME = ('haldi doodh', 'turmeric milk', 'masala milk', 'kesar milk', 'badam milk', 'hot cocoa', 'golden milk')
EVENING_DRINK = ('chai', 'coffee', 'kahwa')
REG_BREAKFAST = ('puttu', 'appam', 'idiyappam', 'neer dosa', 'chilka', 'dhuska', 'pitha', 'bafauri', 'sarva pindi', 'khichu', 'thalipeeth', 'chila', 'koki',
                 'sali par eedu', 'parsi akuri')
REG_SNACK = ('momo', 'thukpa', 'kachori', 'vada pav', 'misal', 'bhel', 'pav bhaji', 'kulcha', 'siddu')
REG_DINNER = ('khichdi', 'khichuri', 'varan bhaat', 'dalma', 'kafuli', 'haak', 'sai bhaji', 'soup', 'pithla', 'zunka', 'ragi mudde', 'ragi kali', 'bassaru',
              'charu', 'santula', 'eromba', 'stew', 'ishtu')


def meals(r):
    n = r['name'].lower()
    c = r['cat']
    sub = (r['sub'] or '').lower()
    has = lambda *ws: any(w in n for w in ws)
    out = []

    if c == 'Breakfast':
        out = ['Breakfast']
        if has('dosa', 'uttapam', 'idli', 'adai', 'pesarattu'):
            out.append('Dinner')
        if has('appe', 'paniyaram'):
            out.append('Evening Snacks')
    elif c == 'Breads & Parathas':
        if sub in ('stuffed paratha', 'thepla', 'thalipeeth') or has('paratha', 'thepla'):
            out = ['Breakfast', 'Lunch', 'Dinner']
        else:
            out = ['Lunch', 'Dinner']
    elif c == 'Poha, Upma & Porridge':
        out = ['Breakfast']
        if has('sabudana'):
            out = ['Breakfast', 'Evening Snacks']
        elif has('kanji', 'khichdi', 'savoury', 'dalia khichdi'):
            out = ['Dinner', 'Breakfast']
        elif has('upma', 'poha'):
            out.append('Dinner')
        else:
            out.append('Evening Snacks')
    elif c == 'Dals, Sambar & Kadhi':
        if sub == 'rasam' or has('moong', 'masoor', 'parippu'):
            out = ['Dinner', 'Lunch']
        else:
            out = ['Lunch', 'Dinner']
        if sub == 'sambar':
            out.append('Breakfast')
    elif c == 'Legume Curries':
        out = ['Lunch', 'Dinner']
    elif c == 'Dry Sabzi':
        out = ['Lunch', 'Dinner']
        if has('bhurji'):
            out = ['Breakfast', 'Dinner']
    elif c == 'Paneer & Vegetable Curries':
        out = ['Dinner', 'Lunch']
    elif c == 'Rice, Khichdi & Biryani':
        if sub == 'khichdi' or has('khichdi', 'pongal', 'khichuri'):
            out = ['Dinner', 'Lunch']
            if has('pongal'):
                out = ['Breakfast', 'Dinner']
        elif sub == 'fried rice':
            out = ['Dinner', 'Lunch']
        else:
            out = ['Lunch', 'Dinner']
    elif c == 'Salads & Raita':
        if sub == 'raita':
            out = ['Accompaniments', 'Lunch', 'Dinner']
        else:
            out = ['Lunch', 'Dinner', 'Evening Snacks']
            if has('fruit'):
                out = ['Mid-Morning', 'Evening Snacks']
    elif c == 'Soups':
        out = ['Dinner', 'Evening Snacks']
    elif c == 'Chutneys & Dips':
        out = ['Accompaniments', 'Breakfast', 'Evening Snacks']
    elif c == 'Snacks & Starters':
        out = ['Evening Snacks']
        if sub in ('dhokla', 'muthia', 'handvo', 'khandvi', 'patra', 'vadi'):
            out.append('Breakfast')
        if sub in ('tikka / grill',) or has('kabab', 'kebab'):
            out.append('Dinner')
        if sub in ('sundal', 'roasted snack', 'chaat'):
            out.append('Mid-Morning')
    elif c == 'Egg Dishes':
        if sub in ('egg curry',) or has('curry', 'masala', 'kheema', 'kurma', 'korma', 'pulusu', 'dalna', 'makhani', 'stew', 'kolhapuri', 'chettinad', 'do pyaza', 'palak'):
            out = ['Dinner', 'Lunch']
        else:
            out = ['Breakfast', 'Dinner']
    elif c in ('Chicken', 'Mutton', 'Fish & Seafood'):
        if sub in ('tandoori / grill',) or has('kebab', 'kabab', 'tikka', 'tandoori', '65'):
            out = ['Dinner', 'Evening Snacks']
            if has('masala') and not has('tandoori'):
                out = ['Dinner', 'Lunch']
        elif sub == 'fish fry':
            out = ['Lunch', 'Dinner']
        elif has('keema', 'stew'):
            out = ['Dinner', 'Lunch']
        else:
            out = ['Lunch', 'Dinner']
    elif c == 'Healthy Sweets':
        out = ['Desserts & Sweets']
        if sub in ('ladoo / barfi',) or has('ladoo', 'chikki', 'barfi', 'cookies', 'energy', 'bar', 'bites', 'roll', 'fudge'):
            out.append('Evening Snacks')
        if has('pudding', 'parfait', 'yogurt', 'shrikhand'):
            out.append('Breakfast')
    elif c == 'Drinks & Smoothies':
        import re
        words = set(re.findall(r'[a-z]+', n))
        if has('smoothie', 'shake', 'milkshake'):
            out = ['Breakfast', 'Mid-Morning']
        elif has('cold coffee', 'coconut water', 'watermelon'):
            out = ['Mid-Morning', 'Evening Snacks']
        elif has(*BEDTIME) or ('milk' in words and not has('rose', 'cold', 'soy')):
            out = ['Bedtime']
        elif 'water' in words or has(*[e for e in EARLY if e != 'water']):
            out = ['Early Morning']
        elif has(*EVENING_DRINK):
            out = ['Early Morning', 'Evening Snacks']
        elif has('chaas', 'buttermilk', 'sol kadhi', 'mor'):
            out = ['Lunch', 'Mid-Morning']
        else:
            out = ['Mid-Morning', 'Evening Snacks']
    elif c == 'Sandwiches & Wraps':
        if sub.startswith('wrap') or has('wrap', 'roll', 'frankie'):
            out = ['Lunch', 'Dinner', 'Evening Snacks']
        else:
            out = ['Breakfast', 'Evening Snacks']
    elif c == 'Regional Specials':
        if has(*REG_BREAKFAST):
            out = ['Breakfast', 'Dinner']
        elif has(*REG_SNACK):
            out = ['Evening Snacks', 'Dinner']
        elif has('kahwa'):
            out = ['Evening Snacks']
        elif has(*REG_DINNER):
            out = ['Dinner', 'Lunch']
        else:
            out = ['Lunch', 'Dinner']
    if not out:
        out = ['Lunch']
    from core import keys
    vrat_base = has('rajgira', 'kuttu', 'singhara', 'sama ', 'sama-', 'sabudana', 'makhana', 'barnyard', 'vrat')
    if 'fast' in r.get('tags', set()) or (vrat_base and not (keys(r) & {'onion', 'garlic', 'shallot', 'springonion'})
                                          and r['cat'] not in ('Chicken', 'Mutton', 'Fish & Seafood', 'Egg Dishes')):
        out.append('Vrat / Fasting')
    seen = []
    for m in out:
        if m not in seen:
            seen.append(m)
    return seen
