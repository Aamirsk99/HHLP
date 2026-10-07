"""Volume 3 - dals, legumes, sabzis, curries, non-veg and rice: new combinations."""
import core
from fam_dal import dal, sambar, rasam, kadhi
from fam_legume import legume
from fam_sabzi import sabzi
from fam_gravy import curry
from fam_nonveg import chicken, mutton, fishcurry, egg_curry, CG, CG_TXT, MG, MG_TXT
from fam_rice import pulao, flavoured, khichdi, biryani, MAR

core.VOLUME = 3

# ---- Dal x greens / vegetables
DALS = [('Moong', 'moong 150', 'jeera'), ('Masoor', 'masoor 150', 'garlic'), ('Toor', 'toor 150', 'south'), ('Chana', 'chanadal 150', 'onion'),
        ('Moong Masoor', 'moong 75; masoor 75', 'jeera'), ('Panchmel', 'toor 30; chanadal 30; moong 30; masoor 30; urad 30', 'onion')]
GREENS = [('Palak', 'spinach 150 chopped'), ('Methi', 'methi 60 chopped'), ('Bathua', 'bathua 100 chopped'), ('Suva', 'dill 30 chopped'),
          ('Chaulai', 'amaranth 120 chopped'), ('Moringa Leaf', 'moringaleaf 40'), ('Sarson', 'sarson 120 chopped')]
VEGD = [('Lauki', 'lauki 200 cubed'), ('Tomato', 'tomato 150 chopped'), ('Drumstick', 'drumstick 120 cut in pieces'), ('Pumpkin', 'pumpkin 200 cubed'),
        ('Raw Mango', 'rawmango 100 cubed'), ('Tori', 'tori 200 cubed'), ('Carrot Beans', 'carrot 80; beans 80')]
for dn, ds, tk in DALS:
    for gn, g in GREENS:
        dal(f'{gn} {dn} Dal', ds, f'{dn} dal cooked with {gn.lower()} leaves, rich in iron and folate.', tadka=tk, finish=g,
            add_txt=f'Add the {gn.lower()} leaves to the cooked dal and simmer for 4–5 minutes.', soak=60 if 'chana' in ds and 'toor' not in ds else 30)
    for vn, v in VEGD:
        dal(f'{vn} {dn} Dal', ds, f'{dn} dal cooked with {vn.lower()}.', tadka=tk, add=v, soak=60 if 'chana' in ds and 'toor' not in ds else 30)

# ---- Sambar & rasam
for vn, veg in [('Avarakkai (Flat Beans)', 'sem 200; onion 60; tomato 60'), ('Brinjal Onion', 'brinjal 150; shallot 80; tomato 60'),
                ('Raw Mango', 'rawmango 120; onion 60; tomato 40'), ('Drumstick Mango', 'drumstick 100; rawmango 80; onion 60'),
                ('Mixed Greens', 'spinach 80; amaranth 80; onion 60; tomato 60'), ('Cabbage', 'cabbage 200; onion 60; tomato 60'),
                ('Beetroot', 'beet 150; onion 60; tomato 60'), ('Cluster Beans', 'gwar 180; onion 60; tomato 60'), ('Kovakkai (Ivy Gourd)', 'kundru 200; onion 60; tomato 60'),
                ('Pumpkin Brinjal', 'pumpkin 120; brinjal 100; onion 60; tomato 60')]:
    sambar(f'{vn} Sambar', veg, f'South Indian sambar with {vn.lower()}.')
for rn, base, kw in [('Tomato Coriander Rasam', 'coriander 25', {}), ('Pepper Garlic Rasam', 'garlic 16; peppercorn 2', {}),
                     ('Lemon Coriander Rasam', 'coriander 20', {'sour': 'tomato 80; lemon 20', 'dals': 'moong 40'}), ('Thakkali Milagu Rasam', 'peppercorn 3', {'sour': 'tamarind 5; tomato 250'}),
                     ('Pomegranate Rasam', 'pomegranate 100', {'sour': 'tomato 80', 'dals': 'moong 30'}), ('Moringa Leaf Rasam', 'moringaleaf 30', {'dals': 'toor 40'}),
                     ('Tulsi Rasam', 'herbal 2', {'dals': 'moong 30'}), ('Drumstick Leaf Pepper Rasam', 'moringaleaf 20; peppercorn 2', {}),
                     ('Ginger Lemon Rasam', 'ginger 20', {'sour': 'tomato 80; lemon 20', 'dals': 'moong 30'}), ('Beetroot Tomato Rasam', 'beet 100', {})]:
    rasam(rn, base, f'A light, peppery {rn.lower()}.', **kw)
for kn, veg in [('Pakoda-free Methi Palak Kadhi', 'methi 30; spinach 60'), ('Sweet Potato Kadhi', 'sweetpotato 150 cubed'), ('Carrot Kadhi', 'carrot 150 cubed'),
                ('Gwar Kadhi', 'gwar 120'), ('Bhindi Lauki Kadhi', 'bhindi 80 sautéed; lauki 100'), ('Corn Kadhi', 'corn 120')]:
    kadhi(kn.replace('Pakoda-free ', ''), f'Curd-besan kadhi with {kn.replace("Pakoda-free ", "").replace(" Kadhi", "").lower()}.', veg=veg)

# ---- Legumes: pulse x vegetable add-ins
PUL = [('Chole', 'chickpea 180', 8, '5–6'), ('Rajma', 'rajma 180', 8, '6'), ('Kala Chana', 'kalachana 180', 8, '5–6'), ('Lobia', 'lobia 160', 6, '3'),
       ('Green Moong', 'gmoong 160', 6, '3'), ('Soya', 'soya 90', 0, '')]
ADD = [('Palak', 'spinach 200 chopped', 'Add the spinach and cook 3 minutes.'), ('Methi', 'methi 80 chopped', 'Add the methi and cook 4 minutes.'),
       ('Aloo', 'potato 200 cubed', 'Add the potatoes and cook covered 8 minutes.'), ('Shimla Mirch', 'capsicum 150 diced', 'Add the capsicum and cook 4 minutes.'),
       ('Baingan', 'brinjal 200 cubed', 'Add the brinjal and cook covered 8 minutes.'), ('Kaddu', 'pumpkin 200 cubed', 'Add the pumpkin and cook covered 8 minutes.'),
       ('Mushroom', 'mushroom 200 quartered', 'Add the mushrooms and cook 5 minutes.')]
for pn, ps, soak, wh in PUL:
    for an, a, at in ADD:
        kw = dict(add=a, add_txt=at)
        if soak:
            kw.update(soak=soak, whistles=wh)
        else:
            kw.update(soak=0, cook_txt='Boil the soya chunks for 5 minutes, rinse and squeeze dry.', simmer=10)
        legume(f'{pn} {an}', ps, f'{pn} cooked with {an.lower()} in a homestyle masala.', **kw)

# ---- Sabzi: vegetable x style
VEG = [  # name, spec, minutes, okay styles
    ('Gobi', 'cauliflower 400 florets', 12, 'jeera onion tomato garlic achari bengali poriyal thoran'),
    ('Beans', 'beans 400 chopped', 12, 'jeera onion garlic achari bengali'),
    ('Gajar', 'carrot 400 diced', 10, 'jeera garlic achari bengali'),
    ('Lauki', 'lauki 500 cubed', 12, 'jeera onion garlic bengali achari'),
    ('Tori', 'tori 500 cubed', 10, 'jeera onion garlic bengali achari thoran'),
    ('Tinda', 'tinda 400 quartered', 15, 'jeera onion garlic bengali'),
    ('Parwal', 'parwal 400 halved', 15, 'garlic achari tomato'),
    ('Kundru', 'kundru 400 sliced', 15, 'jeera onion garlic tomato bengali'),
    ('Bhindi', 'bhindi 400 chopped', 15, 'jeera garlic bengali'),
    ('Baingan', 'brinjal 400 cubed', 12, 'jeera onion garlic bengali poriyal'),
    ('Kaddu', 'pumpkin 500 cubed', 12, 'onion garlic achari'),
    ('Shakarkandi', 'sweetpotato 450 cubed', 12, 'onion garlic achari bengali'),
    ('Arbi', 'arbi 400 boiled, sliced', 8, 'onion garlic achari'),
    ('Suran', 'suran 400 boiled, cubed', 10, 'onion garlic achari tomato'),
    ('Kachcha Kela', 'rawbanana 350 cubed', 12, 'jeera onion garlic achari bengali'),
    ('Kathal', 'jackfruit 400 cubed, boiled', 15, 'jeera onion garlic achari'),
    ('Mushroom', 'mushroom 400 sliced', 6, 'jeera onion achari bengali'),
    ('Baby Corn', 'babycorn 300 sliced', 6, 'jeera garlic achari tomato poriyal'),
    ('Broccoli', 'broccoli 400 florets', 6, 'jeera onion achari bengali tomato'),
    ('Zucchini', 'zucchini 450 diced', 6, 'jeera onion achari bengali'),
    ('Shimla Mirch', 'capsicum 400 diced', 6, 'jeera garlic achari bengali tomato'),
    ('Patta Gobhi', 'cabbage 450 shredded', 8, 'jeera garlic achari tomato onion'),
    ('Mooli', 'mooli 400 diced', 12, 'jeera onion garlic achari tomato thoran'),
    ('Shalgam', 'turnip 450 diced', 15, 'jeera garlic achari bengali'),
    ('Gwar', 'gwar 350 chopped', 15, 'jeera onion achari tomato bengali'),
    ('Sem', 'sem 350 chopped', 15, 'jeera onion garlic achari tomato bengali'),
    ('Karela', 'karela 350 sliced', 15, 'jeera onion garlic tomato bengali'),
    ('Drumstick', 'drumstick 300 cut in pieces', 15, 'garlic poriyal bengali'),
    ('Matar', 'peas 400', 8, 'jeera onion garlic achari'),
    ('Corn', 'corn 400', 6, 'jeera onion garlic achari tomato bengali'),
    ('Tofu', 'tofu 300 cubed', 5, 'jeera achari tomato'),
    ('Paneer', 'paneer 250 cubed', 5, 'jeera garlic achari tomato'),
]
NAMEFMT = {'jeera': 'Jeera {v}', 'onion': '{v} Pyaz Sabzi', 'tomato': '{v} Tamatar Sabzi', 'garlic': 'Lahsuni {v}', 'achari': 'Achari {v}',
           'bengali': '{v} Kalonji Sabzi', 'poriyal': '{v} Poriyal', 'thoran': '{v} Thoran'}
for vn, spec, mins, styles in VEG:
    for st in styles.split():
        unc = vn in ('Bhindi', 'Mushroom', 'Baby Corn', 'Broccoli', 'Zucchini', 'Shimla Mirch', 'Tofu', 'Paneer', 'Corn', 'Karela', 'Kundru')
        nm = NAMEFMT[st].format(v=vn)
        desc = {'jeera': f'{vn} tossed with cumin, ginger and green chilli, simple and light.', 'onion': f'{vn} cooked with plenty of onion and spices.',
                'tomato': f'{vn} cooked in a light, tangy tomato masala.', 'garlic': f'{vn} cooked with a bold garlic tempering.',
                'achari': f'{vn} cooked with tangy pickle spices and mustard oil.', 'bengali': f'{vn} with kalonji and mustard oil, Bengali home style.',
                'poriyal': f'Tamil-style {vn.lower()} stir-fry with coconut.', 'thoran': f'Kerala-style {vn.lower()} with crushed coconut.'}[st]
        sabzi(nm, spec, desc, style=st, mins=mins, uncovered=unc, sub={'poriyal': 'Poriyal', 'thoran': 'Thoran'}.get(st, 'Sabzi'))

BD = {'masala': 'in a homestyle onion-tomato masala, everyday comfort food',
      'makhani': 'in a silky tomato-cashew makhani gravy, made lighter with very little butter',
      'palak': 'in a smooth, garlicky spinach gravy, rich in iron and folate',
      'kadai': 'with crunchy capsicum in a freshly ground, spicy kadai masala',
      'korma': 'in a mild, fragrant korma of onion, cashew and curd',
      'coconut': 'in a South Indian coconut milk curry with curry leaves',
      'stew': 'in a mild Kerala-style coconut stew with ginger and whole spices',
      'kolhapuri': 'in a fiery Kolhapuri masala of roasted coconut, sesame and red chillies',
      'methi_malai': 'in a mildly sweet, creamy fenugreek gravy made with milk instead of cream',
      'dopyaza': 'with plenty of onions, added twice for sweetness and crunch',
      'tikka': 'grilled tikka-style and simmered in a smoky, spiced tomato gravy',
      'achari': 'in a tangy gravy flavoured with pickle spices and mustard oil',
      'chettinad': 'in a peppery Chettinad masala of roasted spices and coconut'}


def bdesc(m, b):
    return f'{m} {BD[b]}.'


# ---- Curries: main x base
BN = {'masala': '{m} Masala', 'makhani': '{m} Makhani', 'palak': 'Palak {m}', 'kadai': 'Kadai {m}', 'korma': '{m} Korma', 'coconut': '{m} Coconut Curry',
      'stew': '{m} Stew', 'kolhapuri': '{m} Kolhapuri', 'methi_malai': 'Methi Malai {m}', 'dopyaza': '{m} Do Pyaza', 'tikka': '{m} Tikka Masala',
      'achari': 'Achari {m} Curry', 'chettinad': '{m} Chettinad'}
MAINS = [
    ('Paneer', 'paneer 200 cubed', 4, 'masala makhani palak kadai korma coconut stew kolhapuri methi_malai dopyaza tikka achari chettinad'),
    ('Tofu', 'tofu 250 cubed', 4, 'masala makhani palak kadai korma coconut stew kolhapuri methi_malai dopyaza tikka achari chettinad'),
    ('Mushroom', 'mushroom 300 halved', 7, 'masala makhani palak kadai korma coconut stew kolhapuri methi_malai dopyaza tikka achari chettinad'),
    ('Soya', 'soya 100 boiled, squeezed', 8, 'masala makhani palak kadai korma coconut kolhapuri methi_malai dopyaza achari chettinad'),
    ('Mixed Vegetable', 'carrot 80; beans 80; peas 80; cauliflower 100; potato 80', 12, 'masala makhani palak kadai korma coconut stew kolhapuri methi_malai dopyaza tikka achari chettinad'),
    ('Aloo', 'potato 350 cubed', 12, 'masala palak kadai korma coconut kolhapuri dopyaza achari chettinad'),
    ('Matar Paneer', 'paneer 150 cubed; peas 120', 5, 'makhani korma kadai coconut methi_malai'),
    ('Mushroom Matar', 'mushroom 200; peas 120', 7, 'makhani korma kadai coconut methi_malai palak'),
    ('Aloo Matar', 'potato 250 cubed; peas 120', 10, 'korma coconut palak kadai'),
    ('Gobi Matar', 'cauliflower 300; peas 100', 10, 'masala korma coconut kadai'),
    ('Corn', 'corn 300', 6, 'makhani palak coconut kolhapuri'),
    ('Baby Corn', 'babycorn 300 sliced', 6, 'palak korma coconut kolhapuri chettinad'),
    ('Chana', 'chickpea 150 soaked, boiled', 8, 'makhani coconut kolhapuri chettinad achari'),
    ('Rajma', 'rajma 150 soaked, boiled', 10, 'palak coconut kolhapuri'),
    ('Kathal', 'jackfruit 400 cubed, boiled', 12, 'masala coconut chettinad achari'),
    ('Kaddu', 'pumpkin 450 cubed', 10, 'coconut achari'),
    ('Lauki', 'lauki 450 cubed', 12, 'kolhapuri chettinad palak'),
    ('Baingan', 'brinjal 400 cubed', 12, 'masala chettinad'),
    ('Gobi', 'cauliflower 400 florets', 10, 'masala makhani kolhapuri achari methi_malai'),
    ('Sweet Potato', 'sweetpotato 350 cubed', 12, 'korma kolhapuri'),
    ('Paneer Capsicum', 'paneer 150 cubed; capsicum 120', 5, 'kadai makhani'),
]
for mn, spec, sim, bases in MAINS:
    for b in bases.split():
        nm = BN[b].format(m=mn)
        curry(nm, spec, bdesc(mn, b),
              base=b, simmer=sim)

# ---- Non-veg: protein x gravy
from fam_gravy import BASE
NV = [('Chicken', chicken, 'chickencut 600'), ('Mutton', mutton, 'mutton 600')]
for pn, fn, main in NV:
    for b in ['makhani', 'palak', 'kadai', 'korma', 'coconut', 'stew', 'kolhapuri', 'methi_malai', 'dopyaza', 'tikka', 'achari', 'chettinad']:
        g, txt = BASE[b]
        fn(BN[b].format(m=pn), bdesc(pn, b), g, txt, main=main)
ALLB = ['makhani', 'palak', 'kadai', 'korma', 'coconut', 'stew', 'kolhapuri', 'dopyaza', 'tikka', 'achari', 'chettinad', 'masala']
for pn, main, sim, bases in [('Fish', 'fish 500 thick pieces', 8, ALLB), ('Prawn', 'prawn 450', 4, ALLB), ('Pomfret', 'pomfret 500 cut', 8, ALLB),
                             ('Mackerel', 'mackerel 500 cut', 8, ['coconut', 'kolhapuri', 'chettinad', 'masala', 'achari'])]:
    for b in bases:
        g, txt = BASE[b]
        fishcurry(BN[b].format(m=pn), bdesc(pn, b), g, txt, main=main, simmer=sim)
for b in ['makhani', 'palak', 'kadai', 'korma', 'coconut', 'stew', 'kolhapuri', 'methi_malai', 'dopyaza', 'tikka', 'achari', 'chettinad', 'masala']:
    g, txt = BASE[b]
    egg_curry(BN[b].format(m='Egg'), bdesc('Boiled eggs', b), g, txt)
for kn, extra in [('Keema Methi', 'methi 100 chopped'), ('Keema Capsicum', 'capsicum 150 diced'), ('Keema Gobi', 'cauliflower 200 small florets'), ('Keema Lauki', 'lauki 200 cubed')]:
    chicken(f'Chicken {kn}', f'Chicken mince cooked with {extra.split()[0]}.', CG.replace('water 250', 'water 100') + f'; {extra}', CG_TXT,
            main='chickenmince 500', mar='haldi 0.5; salt', simmer=12, mar_txt='Keep the chicken mince ready; no marinating is needed.')
    mutton(f'Mutton {kn}', f'Mutton mince cooked with {extra.split()[0]}.', MG + f'; {extra}', MG_TXT, main='muttonmince 500', mar='haldi 0.5; salt', whistles='3')

# ---- Rice: grain x add-in pulao
GR = [('Basmati', 'basmati 200', {}), ('Brown Rice', 'brice 200', {'soak': 60, 'water': 520, 'cook_txt': 'Pressure-cook for 3 whistles, or simmer covered for 35–40 minutes.'}),
      ('Foxtail Millet', 'foxtail 200', {'soak': 30, 'water': 440}), ('Kodo Millet', 'kodo 200', {'soak': 30, 'water': 440}),
      ('Little Millet', 'kutki 200', {'soak': 30, 'water': 440}), ('Barnyard Millet', 'sama 200', {'soak': 30, 'water': 440}),
      ('Quinoa', 'quinoa 180', {'soak': 0, 'water': 360, 'cook_txt': 'Cover and cook on low flame for 15 minutes until fluffy.'})]
AD = [('Matar', 'peas 150'), ('Mushroom', 'mushroom 200 sliced'), ('Paneer', 'paneer 120 cubed; peas 60'), ('Corn', 'corn 150; capsicum 50'),
      ('Palak', 'spinach 150 puréed; peas 50'), ('Soya', 'soya 50 boiled, squeezed; peas 60'), ('Chana', 'chickpea 80 soaked, boiled'),
      ('Rajma', 'rajma 80 soaked, boiled'), ('Sprouts', 'sprouts 150'), ('Beetroot', 'beet 120 grated'), ('Gajar', 'carrot 150 grated'),
      ('Vegetable', 'carrot 60; beans 50; peas 60; cauliflower 50')]
for gn, grain, kw in GR:
    for an, a in AD:
        k = dict(kw)
        if an == 'Palak':
            k['water'] = int(k.get('water', 400) * 0.8)
        pulao(f'{gn} {an} Pulao', grain, a, f'{gn} pulao with {an.lower()} and whole spices.', **k)
FL = [('Lemon', 'haldi 1; gchilli 3; ginger 5; lemon 30', ['Season: Add ginger, chilli and turmeric; switch off and add the lemon juice.']),
      ('Tomato', 'onion 80; tomato 250; chilli 1.5; garam 1', ['Cook the masala: Sauté onion and tomato with spices until thick.']),
      ('Coconut', 'coconut 70; cashew 10; gchilli 3', ['Toast the coconut: Sauté the coconut for 2 minutes until fragrant.']),
      ('Tamarind', 'tamarind 40; jaggery 8; puliyogare 15', ['Make the paste: Simmer tamarind, jaggery and puliyogare powder until thick.']),
      ('Curd', 'curd 300; milk 60; ginger 5; gchilli 3; cucumber 50', ['Mash: Mix the cooled grain with curd, milk and salt.'])]
for gn, grain in [('Brown Rice', 'brice 200'), ('Red Rice', 'rrice 200'), ('Foxtail Millet', 'foxtail 200'), ('Kodo Millet', 'kodo 200'),
                  ('Little Millet', 'kutki 200'), ('Barnyard Millet', 'sama 200'), ('Quinoa', 'quinoa 180')]:
    for fn, add, mid in FL:
        flavoured(f'{fn} {gn}', add, f'{gn} flavoured South Indian {fn.lower()}-rice style.', mid, rice=grain)
for gn, grain in [('Foxtail', 'foxtail 100'), ('Kodo', 'kodo 100'), ('Little Millet', 'kutki 100'), ('Barnyard', 'sama 100'), ('Brown Rice', 'brice 100'), ('Quinoa', 'quinoa 100')]:
    for dn, d in [('Masoor', 'masoor 80'), ('Toor', 'toor 80'), ('Green Moong', 'gmoong 80')]:
        khichdi(f'{gn} {dn} Khichdi', f'{grain}; {d}', f'A one-pot khichdi of {gn.lower()} and {dn.lower()} dal.', veg='carrot 50; peas 50; tomato 50')
for bn, main in [('Soya Chunks', 'soya 100 boiled, squeezed; potato 100'), ('Lobia', 'lobia 150 soaked, boiled'), ('Kala Chana', 'kalachana 150 soaked, boiled'),
                 ('Corn Paneer', 'corn 150; paneer 120'), ('Mixed Vegetable Millet', 'carrot 100; beans 80; peas 80')]:
    biryani(f'{bn} Biryani', main, MAR, f'Fragrant layered biryani with {bn.lower()}.', mins=15, **({'rice': 'kutki 250'} if 'Millet' in bn else {}))
