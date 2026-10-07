"""Health benefits, dietary guidelines and ingredient tips, worked out from each recipe's ingredients."""
from catalog import CAT
from core import grams_per_serving, keys, diet

B = {
    'besan': ('Plant protein', 'besan (gram flour) gives good vegetarian protein and fibre that keep you full for longer.'),
    'sattu': ('Cooling protein', 'sattu is roasted gram flour, rich in protein and fibre, and a traditional summer energiser.'),
    'oats': ('Beta-glucan fibre', 'oats contain soluble fibre (beta-glucan) that helps lower LDL cholesterol.'),
    'ragi': ('Calcium-rich millet', 'ragi is one of the richest plant sources of calcium and is naturally gluten-free.'),
    'jowar': ('Gluten-free millet', 'jowar is a fibre-rich, gluten-free whole grain with a gentle effect on blood sugar.'),
    'bajra': ('Iron & magnesium', 'bajra provides iron, magnesium and fibre, and keeps you warm and full in winter.'),
    'makki': ('Whole grain', 'makki (maize) flour is a gluten-free whole grain with fibre and carotenoids.'),
    'quinoa': ('Complete protein', 'quinoa contains all nine essential amino acids and is gluten-free.'),
    'foxtail': ('Low-GI millet', 'foxtail millet is rich in fibre and protein and releases energy slowly.'),
    'kodo': ('Millet goodness', 'kodo millet is high in fibre and polyphenols and is easy to digest.'),
    'sama': ('Light millet', 'barnyard millet is light, high in fibre and a popular fasting grain.'),
    'kutki': ('Millet minerals', 'little millet supplies iron, fibre and B vitamins.'),
    'dalia': ('Whole-wheat fibre', 'dalia (broken wheat) is a whole grain that digests slowly and keeps hunger away.'),
    'brice': ('Whole grain', 'brown rice keeps its bran layer, giving more fibre and minerals than white rice.'),
    'rrice': ('Whole grain', 'red rice is rich in fibre and antioxidants (anthocyanins).'),
    'atta': ('Whole-wheat energy', 'whole-wheat atta gives complex carbohydrates, fibre and B vitamins.'),
    'mgatta': ('Multigrain fibre', 'multigrain atta adds the fibre and minerals of several grains.'),
    'poha': ('Light & iron-fortified', 'poha is light on the stomach and a source of easily digested energy.'),
    'rava': ('Quick energy', 'rava gives quick energy; vegetables added to it raise the fibre.'),
    'rajgira': ('Amaranth protein', 'rajgira (amaranth) is gluten-free and high in protein, calcium and iron.'),
    'kuttu': ('Buckwheat goodness', 'kuttu (buckwheat) is gluten-free and rich in magnesium and fibre.'),
    'makhana': ('Low-fat crunch', 'makhana is low in fat and a good source of magnesium and potassium.'),
    'moong': ('Easy-to-digest protein', 'moong dal is one of the lightest dals and a good source of plant protein.'),
    'gmoong': ('Protein & fibre', 'whole green moong gives protein, fibre and folate.'),
    'sprouts': ('Sprouted nutrition', 'sprouting raises vitamin C and makes moong easier to digest.'),
    'mixsprouts': ('Sprouted nutrition', 'mixed sprouts are rich in protein, fibre, vitamin C and enzymes.'),
    'masoor': ('Iron & protein', 'masoor dal cooks quickly and is rich in protein, iron and folate.'),
    'toor': ('Everyday protein', 'toor dal provides protein, fibre and folate.'),
    'chanadal': ('Low-GI dal', 'chana dal has a low glycaemic index and plenty of protein and fibre.'),
    'urad': ('Protein & minerals', 'urad dal supplies protein, iron and magnesium.'),
    'wurad': ('Protein & minerals', 'whole urad supplies protein, iron, magnesium and fibre.'),
    'rajma': ('Fibre-rich beans', 'rajma is rich in protein, fibre, iron and folate.'),
    'chickpea': ('Protein & fibre', 'chickpeas give protein and fibre that keep blood sugar steady.'),
    'kalachana': ('Iron-rich legume', 'kala chana is rich in iron, fibre and protein.'),
    'lobia': ('Folate & fibre', 'lobia (black-eyed beans) is rich in folate, fibre and protein.'),
    'moth': ('Sprout-friendly legume', 'moth beans (matki) are rich in protein and sprout easily.'),
    'kulthi': ('Traditional legume', 'horse gram is high in protein, iron and fibre.'),
    'whitepeas': ('Plant protein', 'dried peas give protein and a lot of fibre.'),
    'drygreenpeas': ('Plant protein', 'dried green peas give protein and a lot of fibre.'),
    'roastchana': ('Protein snack', 'roasted chana is a crunchy, high-protein, high-fibre snack.'),
    'soya': ('Highest plant protein', 'soya chunks contain about 50% protein, more than any other vegetarian food.'),
    'soyagran': ('Highest plant protein', 'soya granules contain about 50% protein and cook in minutes.'),
    'tofu': ('Soy protein', 'tofu gives complete plant protein and calcium with little saturated fat.'),
    'paneer': ('Protein & calcium', 'paneer provides good-quality protein and calcium.'),
    'lfpaneer': ('Lean protein', 'low-fat paneer gives protein and calcium with less fat.'),
    'curd': ('Probiotic', 'curd provides probiotics for gut health, plus protein and calcium.'),
    'hungcurd': ('Protein-rich curd', 'hung curd is thick, creamy and higher in protein than regular curd.'),
    'milk': ('Calcium', 'milk supplies calcium, protein and vitamin B12.'),
    'egg': ('Complete protein', 'eggs give complete protein, vitamin B12, vitamin D and choline.'),
    'eggwhite': ('Lean protein', 'egg whites are almost pure protein with no fat.'),
    'chicken': ('Lean protein', 'skinless chicken is a lean, complete protein for muscle repair.'),
    'chickencut': ('Lean protein', 'skinless chicken provides complete protein, niacin and vitamin B6.'),
    'chickenmince': ('Lean protein', 'chicken mince is a versatile, quick-cooking source of complete protein.'),
    'mutton': ('Iron & B12', 'mutton supplies well-absorbed iron, zinc and vitamin B12.'),
    'muttonmince': ('Iron & B12', 'mutton keema supplies well-absorbed iron, zinc and vitamin B12.'),
    'fish': ('Omega-3 & protein', 'fish gives lean protein and omega-3 fats that support the heart and brain.'),
    'pomfret': ('Lean fish protein', 'pomfret is a lean fish rich in protein, vitamin D and B12.'),
    'mackerel': ('Omega-3 rich', 'mackerel is one of the richest sources of heart-healthy omega-3 fats.'),
    'prawn': ('Lean seafood protein', 'prawns are high in protein, selenium and vitamin B12 and low in fat.'),
    'crab': ('Seafood minerals', 'crab is rich in protein, zinc, copper and selenium.'),
    'spinach': ('Iron & folate', 'spinach adds folate, iron, vitamin A and vitamin K.'),
    'methi': ('Blood-sugar friendly', 'methi leaves are rich in fibre and iron and are traditionally used for blood-sugar control.'),
    'sarson': ('Leafy greens', 'mustard greens are rich in vitamins A, C and K.'),
    'bathua': ('Winter greens', 'bathua leaves add iron, calcium and fibre.'),
    'amaranth': ('Calcium greens', 'amaranth leaves are rich in calcium, iron and vitamin C.'),
    'moringaleaf': ('Superfood greens', 'moringa leaves are rich in protein, calcium, iron and vitamin A.'),
    'dill': ('Digestive herb', 'dill (suva) leaves aid digestion and add antioxidants.'),
    'gongura': ('Vitamin C & iron', 'gongura leaves are tangy and rich in vitamin C and iron.'),
    'colleaf': ('Fibre-rich leaves', 'colocasia leaves add fibre, vitamin A and calcium.'),
    'avocado': ('Heart-friendly fats', 'avocado is rich in monounsaturated fats, fibre and potassium.'),
    'broccoli': ('Antioxidants', 'broccoli is rich in vitamin C, vitamin K and sulforaphane.'),
    'cauliflower': ('Low-calorie veggie', 'cauliflower is low in calories and gives vitamin C and fibre.'),
    'cabbage': ('Gut-friendly fibre', 'cabbage is low in calories and rich in vitamin C and fibre.'),
    'carrot': ('Vitamin A', 'carrots are rich in beta-carotene for eye and skin health.'),
    'beet': ('Natural nitrates', 'beetroot provides folate and nitrates that support healthy blood flow.'),
    'tomato': ('Lycopene', 'tomatoes give lycopene and vitamin C, antioxidants that protect cells.'),
    'peas': ('Plant protein', 'green peas add protein, fibre and vitamin K.'),
    'beans': ('Fibre & vitamins', 'French beans are low in calories and rich in fibre and vitamin C.'),
    'bhindi': ('Soluble fibre', 'bhindi (okra) is rich in soluble fibre that slows sugar absorption.'),
    'brinjal': ('Low-calorie fibre', 'brinjal is low in calories and rich in fibre and antioxidants.'),
    'lauki': ('Light & hydrating', 'lauki is about 92% water, very light, cooling and easy to digest.'),
    'tori': ('Light & hydrating', 'ridge gourd is low in calories, hydrating and gentle on the stomach.'),
    'tinda': ('Light vegetable', 'tinda is low in calories and easy to digest.'),
    'parwal': ('Digestive vegetable', 'parwal is low in calories and rich in fibre and vitamins A and C.'),
    'karela': ('Blood-sugar support', 'karela contains compounds traditionally used to help manage blood sugar.'),
    'kundru': ('Low-calorie veggie', 'kundru (ivy gourd) is low in calories and rich in fibre.'),
    'pumpkin': ('Beta-carotene', 'pumpkin is rich in beta-carotene and fibre and low in calories.'),
    'ashgourd': ('Cooling vegetable', 'ash gourd is very low in calories, cooling and hydrating.'),
    'snakegourd': ('Light vegetable', 'snake gourd is low in calories and hydrating.'),
    'drumstick': ('Minerals', 'drumsticks add vitamin C, calcium and fibre.'),
    'mushroom': ('Vitamin D & B', 'mushrooms add B vitamins, selenium and a meaty texture with few calories.'),
    'sweetpotato': ('Beta-carotene', 'sweet potato is rich in beta-carotene and fibre.'),
    'potato': ('Energy & potassium', 'potatoes give energy, vitamin C and potassium; boiled with skin they keep more fibre.'),
    'rawbanana': ('Resistant starch', 'raw banana contains resistant starch that feeds healthy gut bacteria.'),
    'jackfruit': ('Fibre-rich', 'raw jackfruit is high in fibre and a good meat substitute.'),
    'arbi': ('Fibre & potassium', 'arbi gives fibre, potassium and slow-release energy.'),
    'suran': ('Fibre-rich tuber', 'suran (yam) is high in fibre and gives steady energy.'),
    'corn': ('Fibre & antioxidants', 'sweet corn adds fibre plus lutein and zeaxanthin for eye health.'),
    'capsicum': ('Vitamin C', 'capsicum is rich in vitamin C and antioxidants.'),
    'redcapsicum': ('Vitamin C', 'bell peppers are among the richest vegetable sources of vitamin C.'),
    'cucumber': ('Hydrating', 'cucumber is hydrating and very low in calories.'),
    'mooli': ('Digestive', 'mooli (radish) is low in calories and aids digestion.'),
    'lotusstem': ('Fibre & minerals', 'lotus stem is rich in fibre, potassium and vitamin C.'),
    'onion': ('Prebiotic', 'onions add prebiotic fibre and antioxidants (quercetin).'),
    'garlic': ('Heart support', 'garlic contains allicin, which supports heart health.'),
    'ginger': ('Digestive aid', 'ginger aids digestion and reduces nausea and bloating.'),
    'haldi': ('Anti-inflammatory', 'turmeric contains curcumin, a natural anti-inflammatory compound.'),
    'ajwain': ('Eases bloating', 'ajwain (carom) traditionally helps relieve gas and bloating.'),
    'curryleaf': ('Antioxidants', 'curry leaves add antioxidants, iron and aroma.'),
    'mint': ('Cooling & digestive', 'mint is cooling and soothes digestion.'),
    'coconut': ('Quick energy fats', 'coconut adds fibre and medium-chain fats (use in moderation).'),
    'coconutwater': ('Natural electrolytes', 'tender coconut water replaces potassium and fluids naturally.'),
    'peanut': ('Healthy fats & protein', 'peanuts give protein, healthy fats, vitamin E and niacin.'),
    'almond': ('Vitamin E', 'almonds provide vitamin E, magnesium and heart-healthy fats.'),
    'walnut': ('Omega-3', 'walnuts are the richest nut source of plant omega-3 fats.'),
    'cashew': ('Minerals', 'cashews add magnesium, zinc and copper.'),
    'pistachio': ('Antioxidants', 'pistachios give protein, fibre and lutein.'),
    'flax': ('Plant omega-3', 'flaxseeds give omega-3 fats (ALA) and lignans.'),
    'chia': ('Omega-3 & fibre', 'chia seeds are rich in fibre and plant omega-3 fats.'),
    'sesame': ('Calcium-rich seeds', 'sesame seeds are rich in calcium, iron and healthy fats.'),
    'pumpkinseed': ('Zinc & magnesium', 'pumpkin seeds are rich in zinc, magnesium and protein.'),
    'dates': ('Natural sweetness', 'dates sweeten naturally and add fibre, iron and potassium.'),
    'dfig': ('Fibre & calcium', 'dried figs add fibre, calcium and natural sweetness.'),
    'raisin': ('Natural sweetness', 'raisins add iron and natural sweetness.'),
    'amla': ('Vitamin C powerhouse', 'amla is one of the richest natural sources of vitamin C.'),
    'lemon': ('Vitamin C', 'lemon juice adds vitamin C, which improves iron absorption from plant foods.'),
    'banana': ('Potassium & energy', 'banana gives potassium and quick natural energy.'),
    'apple': ('Pectin fibre', 'apples give pectin, a soluble fibre good for the gut and cholesterol.'),
    'papaya': ('Digestive enzymes', 'papaya contains papain, which aids digestion, plus vitamins A and C.'),
    'mango': ('Vitamins A & C', 'mango is rich in vitamins A and C.'),
    'rawmango': ('Vitamin C', 'raw mango is rich in vitamin C and cooling in summer.'),
    'pomegranate': ('Antioxidants', 'pomegranate is rich in polyphenol antioxidants.'),
    'pineapple': ('Bromelain', 'pineapple contains bromelain, an enzyme that aids protein digestion.'),
    'orange': ('Vitamin C', 'oranges are rich in vitamin C and flavonoids.'),
    'guava': ('Vitamin C & fibre', 'guava has more vitamin C than an orange and lots of fibre.'),
    'watermelon': ('Hydration', 'watermelon is over 90% water and gives lycopene.'),
    'muskmelon': ('Hydration', 'muskmelon is hydrating and rich in vitamin A.'),
    'strawberry': ('Vitamin C', 'strawberries are rich in vitamin C and antioxidants.'),
    'kiwi': ('Vitamin C', 'kiwi is rich in vitamin C and fibre.'),
    'chikoo': ('Energy & fibre', 'chikoo gives fibre and natural energy.'),
    'pear': ('Fibre', 'pears are rich in fibre.'),
    'grapes': ('Antioxidants', 'grapes contain resveratrol and other antioxidants.'),
    'bael': ('Digestive fruit', 'bael fruit is traditionally used to soothe the stomach and cool the body.'),
    'kokum': ('Cooling', 'kokum is cooling and traditionally aids digestion.'),
    'tamarind': ('Tangy minerals', 'tamarind adds tanginess along with magnesium and antioxidants.'),
    'jaggery': ('Unrefined sweetener', 'jaggery is less refined than sugar but is still sugar; use sparingly.'),
    'sabudana': ('Quick energy', 'sabudana gives quick, easily digested energy, useful while fasting.'),
    'saunf': ('Digestive', 'saunf (fennel) aids digestion and freshens breath.'),
    'jeera': ('Digestive spice', 'cumin aids digestion and adds iron.'),
    'methiseed': ('Blood-sugar support', 'methi seeds contain soluble fibre that helps slow sugar absorption.'),
    'peppercorn': ('Better absorption', 'black pepper helps the body absorb curcumin from turmeric.'),
    'cinnamon': ('Blood-sugar support', 'cinnamon may help improve insulin sensitivity.'),
    'cocoa': ('Flavanols', 'unsweetened cocoa is rich in flavanol antioxidants and magnesium.'),
    'soymilk': ('Plant protein', 'soy milk gives plant protein and is dairy-free.'),
    'zucchini': ('Low-calorie veggie', 'zucchini is low in calories and rich in vitamin C and potassium.'),
    'babycorn': ('Low-calorie crunch', 'baby corn is low in calories and adds fibre.'),
    'springonion': ('Vitamin K & C', 'spring onions add vitamins K and C and a fresh flavour.'),
    'lettuce': ('Hydrating greens', 'lettuce is hydrating and adds vitamins A and K.'),
    'turnip': ('Low-calorie root', 'turnip is low in calories and rich in vitamin C.'),
    'gwar': ('Fibre-rich beans', 'cluster beans are high in fibre and help blood-sugar control.'),
    'sem': ('Fibre & protein', 'flat beans add fibre, protein and folate.'),
    'whey': ('Fast protein', 'whey protein is quickly absorbed and supports muscle repair.'),
}

TIPS = {
    'bhindi': 'Wash and wipe the bhindi completely dry before cutting; moisture makes it slimy.',
    'karela': 'Rub chopped karela with salt, rest 15 minutes and squeeze out the juice to cut the bitterness.',
    'rajma': 'Soak rajma for 8–10 hours and boil it until fully soft; undercooked kidney beans can upset the stomach.',
    'chickpea': 'Soak chickpeas overnight; a tea bag in the pressure cooker gives a darker colour without soda.',
    'kalachana': 'Soak kala chana overnight and keep the cooking water for the gravy; it is full of nutrients.',
    'arbi': 'Oil your hands before peeling arbi to avoid itching, and cook it fully.',
    'suran': 'Wear gloves to peel suran and cook it with a little tamarind or lemon to avoid throat itching.',
    'brinjal': 'Soak cut brinjal in salted water to stop it browning.',
    'spinach': 'Blanch spinach for only 1–2 minutes and plunge into cold water to keep its bright green colour.',
    'methi': 'Sprinkle a little salt on chopped methi, rest 10 minutes and squeeze to reduce bitterness.',
    'paneer': 'Soak paneer in warm water for 10 minutes before cooking to keep it soft.',
    'tofu': 'Press tofu between kitchen towels under a weight for 15 minutes so it absorbs the masala.',
    'soya': 'Boil soya chunks for 5 minutes, rinse and squeeze them well; this removes the raw smell.',
    'soyagran': 'Soak soya granules in hot water for 10 minutes and squeeze out the water before cooking.',
    'chicken': 'Marinate the chicken for at least 30 minutes (overnight is best) for tender, flavourful meat.',
    'chickencut': 'Marinate the chicken for at least 30 minutes (overnight is best) for tender, flavourful meat.',
    'mutton': 'Marinate mutton in curd for 2 hours or overnight, and pressure-cook until it is fork-tender.',
    'fish': 'Do not over-stir fish curry; swirl the pan instead so the pieces stay whole.',
    'prawn': 'Prawns cook in 3–4 minutes; overcooking makes them rubbery.',
    'mushroom': 'Clean mushrooms with a damp cloth instead of soaking them, so they do not turn soggy.',
    'avocado': 'Use a ripe avocado that yields slightly to gentle pressure; add lemon juice to stop browning.',
    'egg': 'Cook eggs on medium-low heat; high heat makes them rubbery.',
    'sabudana': 'Soak sabudana just until each pearl is soft but separate; drain very well.',
    'rava': 'Dry-roast the rava until aromatic before adding liquid; it prevents lumps and stickiness.',
    'poha': 'Rinse poha in a sieve and drain at once; soaking it makes it mushy.',
    'urad': 'Soak urad dal and rice separately and grind the urad until light and fluffy for soft results.',
    'sprouts': 'Steam sprouts for 3–5 minutes if you prefer them easier to digest and safer.',
    'mixsprouts': 'Steam sprouts for 3–5 minutes if you prefer them easier to digest and safer.',
    'oats': 'Lightly roast oats before using them; it removes the raw taste.',
    'ragi': 'Mix ragi flour with cold water first to avoid lumps.',
    'quinoa': 'Rinse quinoa well under running water to remove its bitter coating (saponins).',
    'beet': 'Wear gloves while grating beetroot to avoid staining your hands.',
    'lauki': 'Taste a small piece of raw lauki; never use one that tastes bitter.',
    'jackfruit': 'Oil your knife and hands before cutting raw jackfruit to stop the sap sticking.',
    'kulthi': 'Soak kulthi overnight and pressure-cook well; it takes longer than other dals.',
    'gmoong': 'Soak whole moong for 4–6 hours; it cooks faster and is easier to digest.',
    'lotusstem': 'Wash lotus stem slices well under running water to remove any mud in the holes.',
    'rawbanana': 'Put peeled raw banana in water immediately so it does not darken.',
    'colleaf': 'Always cook colocasia leaves well with tamarind or lemon; raw leaves cause throat itching.',
}

ALLERGEN_NAMES = [('gluten', 'gluten (wheat)'), ('dairy', 'dairy'), ('egg', 'egg'), ('fish', 'fish'),
                  ('shellfish', 'shellfish'), ('peanut', 'peanuts'), ('nuts', 'tree nuts'), ('soy', 'soy'),
                  ('sesame', 'sesame')]

DIET_LABEL = {'vegan': 'Vegan', 'veg': 'Vegetarian', 'egg': 'Contains Egg', 'nonveg': 'Non-Vegetarian'}


def _names(ks, gps=None):
    ks = list(ks)
    if gps:
        ks.sort(key=lambda k: -gps.get(k, 0))
    ns = []
    for k in ks:
        n = CAT[k]['name'].split(' (')[0].lower()
        if n not in ns:
            ns.append(n)
    if len(ns) > 1:
        return ', '.join(ns[:-1]) + ' and ' + ns[-1]
    return ns[0] if ns else ''


def allergens(r):
    tags = set()
    for k in keys(r):
        tags |= CAT[k]['tags']
    if 'hing' in keys(r):
        tags.add('hing')
    return [lab for t, lab in ALLERGEN_NAMES if t in tags]


def benefits(r):
    gps = grams_per_serving(r)
    n = r['nut']
    out = []
    seen = set()
    order = sorted(gps, key=lambda k: -gps[k] * (3 if CAT[k]['cat'] in ('pulse', 'meat', 'fish', 'egg', 'dairy', 'leafy') else 1))
    for k in order:
        if k in B and B[k][0] not in seen and (gps[k] >= 3 or CAT[k]['cat'] == 'spice' and gps[k] >= 0.5):
            seen.add(B[k][0])
            t, s = B[k]
            out.append((t, s[0].upper() + s[1:]))
        if len(out) >= 4:
            break
    if n['p'] >= 15:
        out.append(('Protein-rich', f'about {n["p"]:.0f} g protein per serving supports muscle health and keeps you full.'))
    if n['fib'] >= 6:
        out.append(('High fibre', f'about {n["fib"]:.0f} g fibre per serving supports digestion and steadier blood sugar.'))
    if n['kcal'] < 200 and r['cat'] not in ('Chutneys & Dips',):
        out.append(('Light', f'only about {n["kcal"]:.0f} kcal per serving.'))
    return [(t, s[0].upper() + s[1:]) for t, s in out[:6]]


def recommended(r):
    n = r['nut']
    ks = keys(r)
    gps = grams_per_serving(r)
    tags = set()
    for k in ks:
        tags |= CAT[k]['tags']
    sugar = sum(g for k, g in gps.items() if 'SUG' in CAT[k]['tags'] or 'NSUG' in CAT[k]['tags'])
    satfat = sum(CAT[k]['f'] * g / 100 for k, g in gps.items() if 'SF' in CAT[k]['tags'])
    out = []
    if n['kcal'] <= 300 and n['f'] <= 12 and sugar < 5:
        out.append(f'Weight management — light at about {n["kcal"]:.0f} kcal per serving.')
    if n['p'] >= 12:
        out.append('High-protein diets — helps active adults, growing children and vegetarians meet protein needs.')
    if sugar < 5 and n['c'] <= 45 and n['fib'] >= 3.5:
        out.append('Diabetes — fibre-rich with no added sugar; eat with a protein side and keep to one serving.')
    if satfat <= 4 and not (tags & {'NA'}) and n['f'] <= 15:
        out.append('Heart health — low in saturated fat; keep added salt low.')
    if 'gluten' not in tags:
        out.append('Gluten-free diets (use gluten-free hing and check packaged flours).' if 'hing' in ks
                   else 'Gluten-free diets (check that packaged ingredients are certified gluten-free).')
    if diet(r) == 'vegan':
        out.append('Vegan and dairy-free diets.')
    if 'soft' in r['tags']:
        out.append('Elderly people and those recovering from illness — soft and easy to digest.')
    if 'kids' in r['tags']:
        out.append('Children’s tiffin and after-school snacks.')
    if 'fast' in r['tags']:
        out.append('Vrat / fasting days (use sendha namak instead of regular salt).')
    if not out:
        out.append('General healthy eating as part of a balanced meal.')
    return out[:5]


def cautions(r):
    n = r['nut']
    ks = keys(r)
    gps = grams_per_serving(r)
    tags = set()
    for k in ks:
        tags |= CAT[k]['tags']
    out = []
    kk = [k for k, g in gps.items() if 'K' in CAT[k]['tags'] and (g >= 40 or k in ('avocado', 'dates', 'coconutwater'))]
    pulses = [k for k, g in gps.items() if CAT[k]['cat'] == 'pulse' and g >= 30 and k not in ('sprouts',)]
    if kk:
        out.append(f'<b>Kidney disease:</b> {_names(kk, gps)} {"are" if len(kk) > 1 or _names(kk).endswith("s") else "is"} '
                   f'high in potassium — follow your prescribed potassium limit.')
    elif n['p'] >= 20 or pulses:
        out.append('<b>Kidney disease:</b> protein and phosphorus add up — keep to the portion your dietitian advises.')
    sw = [k for k, g in gps.items() if ('SUG' in CAT[k]['tags'] or 'NSUG' in CAT[k]['tags']) and g >= 3]
    if sw:
        out.append(f'<b>Diabetes:</b> contains {_names(sw, gps)} — have a small portion, '
                   f'or reduce the sweetener and use cinnamon, cardamom or fruit for flavour.')
    elif n['c'] >= 55:
        out.append(f'<b>Diabetes:</b> about {n["c"]:.0f} g carbohydrate per serving — pair with dal, curd or salad and watch the portion.')
    satfat = sum(CAT[k]['f'] * g / 100 for k, g in gps.items() if 'SF' in CAT[k]['tags'])
    if n['f'] >= 20 or satfat >= 6:
        src = [k for k, g in gps.items() if 'SF' in CAT[k]['tags'] and g >= 2] or ['oil']
        out.append(f'<b>Cholesterol / weight loss:</b> about {n["f"]:.0f} g fat per serving — reduce the {_names(src, gps)} or the portion.')
    na = [k for k in ks if 'NA' in CAT[k]['tags'] and k not in ('eno', 'soda')]
    if na or r['cat'] in ('Chutneys & Dips',) or 'salty' in r['tags']:
        out.append('<b>High blood pressure:</b> ' + (f'{_names(na)} add{"s" if len(na) == 1 else ""} sodium — ' if na else '')
                   + 'keep added salt to a minimum.')
    vk = [k for k, g in gps.items() if 'VK' in CAT[k]['tags'] and g >= 30]
    if vk:
        out.append(f'<b>Blood thinners (e.g. warfarin):</b> {_names(vk, gps)} '
                   f'{"are" if len(vk) > 1 else "is"} rich in vitamin K — keep your intake consistent from week to week.')
    pur = [k for k, g in gps.items() if 'PUR' in CAT[k]['tags'] and g >= 40]
    if pur:
        out.append(f'<b>Gout / high uric acid:</b> {_names(pur, gps)} '
                   f'{"are" if len(pur) > 1 or _names(pur).endswith("s") else "is"} high in purines — limit the portion.')
    gas = [k for k, g in gps.items() if k in ('rajma', 'chickpea', 'kalachana', 'lobia', 'wurad', 'whitepeas', 'drygreenpeas', 'urad', 'rajmabeans', 'kulthi', 'moth') and g >= 30]
    if gas:
        out.append('<b>Gas / bloating:</b> soak the pulses well, cook them fully and use hing, ajwain or ginger.')
    if any('RAW' in CAT[k]['tags'] for k in ks):
        out.append('<b>Pregnancy and low immunity:</b> steam the sprouts for 3–5 minutes instead of eating them raw.')
    if 'egg' in tags:
        out.append('<b>Pregnancy, young children and the elderly:</b> make sure eggs are fully cooked.')
    if tags & {'chicken', 'mutton'}:
        out.append('<b>Food safety:</b> cook meat until no pink remains and the juices run clear.')
    if tags & {'fish', 'shellfish'}:
        out.append('<b>Pregnancy:</b> choose fresh, low-mercury fish and cook seafood thoroughly.')
    hot = gps.get('chilli', 0) + gps.get('gchilli', 0) + gps.get('redchilli', 0) * 2 + gps.get('peppercorn', 0) + gps.get('pepper', 0)
    if hot >= 4:
        out.append('<b>Acidity / IBS:</b> this dish is spicy — reduce the chillies and pepper if needed.')
    al = allergens(r)
    if al:
        out.append(f'<b>Allergies:</b> contains {", ".join(al[:-1]) + " and " + al[-1] if len(al) > 1 else al[0]}.')
    if not out:
        out.append('No special cautions for most people — keep portions in line with your diet plan.')
    return out[:7]


def ingredient_tips(r):
    out = []
    for k, _, _ in sorted(((k, g, n) for k, g, n in _items(r)), key=lambda x: -(x[1] or 0)):
        if k in TIPS and TIPS[k] not in out:
            out.append(TIPS[k])
    return out[:2]


def _items(r):
    for _, items in r['groups']:
        yield from items
