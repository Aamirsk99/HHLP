"""Volume 4 - dals, legumes, sabzis, curries, non-veg and rice: new tempering styles, gravies and combinations."""
import core
import fam_sabzi
import fam_gravy
from fam_dal import dal, sambar, rasam
from fam_legume import legume
from fam_sabzi import sabzi
from fam_gravy import curry, BASE
from fam_nonveg import chicken, mutton, fishcurry, egg_curry, omelette
from fam_rice import pulao, flavoured, khichdi, biryani, fried_rice, MAR

core.VOLUME = 4

# ---- New sabzi styles
fam_sabzi.STY.update({
    'kadai': ('oil 10; dhaniaseed 3 crushed; redchilli 2 crushed; jeera 1; onion 60 petals; capsicum 60 diced', 'haldi 0.3; kasuri 1; garam 0.5; salt', 'coriander 6',
              'Dry-roast and crush the coriander seeds and red chillies. Heat oil, add cumin and the crushed spices, then the onion petals and capsicum, and toss for 2 minutes.'),
    'pepper': ('coconutoil 8; mustard 2; curryleaf 2; onion 50 sliced; peppercorn 3 crushed', 'haldi 0.3; salt', 'curryleaf 1',
               'Heat coconut oil, crackle mustard seeds, add curry leaves, sliced onion and crushed black pepper and sauté until the onion softens.'),
    'kari': ('oil 8; mustard 3; urad_t 4; curryleaf 1.5; hing', 'haldi 0.3; sambar 4; salt', 'coriander 4',
             'Heat oil, crackle mustard seeds, add urad dal, curry leaves and hing; add sambar powder for a Tamil kari flavour.'),
    'sukhi': ('oil 10; jeera 1.5; hing; saunf 1', 'haldi 0.5; dhania 2; chilli 1; salt', 'amchur 2; coriander 6',
              'Heat oil, add cumin, fennel and hing; this Rajasthani tempering keeps the sabzi dry and tangy.'),
})
FMT = {'kadai': 'Kadai {v} (Dry)', 'pepper': '{v} Pepper Fry', 'kari': '{v} Kari (Tamil Style)', 'sukhi': 'Rajasthani {v} Sabzi'}
DESC = {'kadai': '{v} tossed with crushed kadai spices, onion and capsicum.', 'pepper': 'South Indian {v} fried with black pepper and curry leaves.',
        'kari': 'Tamil-style {v} kari with sambar powder and curry leaves.', 'sukhi': 'Dry, tangy Rajasthani-style {v} with fennel and amchur.'}
VEG = [('Gobi', 'cauliflower 400 florets', 12), ('Beans', 'beans 400 chopped', 12), ('Gajar', 'carrot 400 diced', 10), ('Lauki', 'lauki 500 cubed', 12),
       ('Tinda', 'tinda 400 quartered', 15), ('Parwal', 'parwal 400 halved', 15), ('Kundru', 'kundru 400 sliced', 15), ('Bhindi', 'bhindi 400 chopped', 15),
       ('Baingan', 'brinjal 400 cubed', 12), ('Kaddu', 'pumpkin 500 cubed', 12), ('Shakarkandi', 'sweetpotato 450 cubed', 12), ('Arbi', 'arbi 400 boiled, sliced', 8),
       ('Suran', 'suran 400 boiled, cubed', 10), ('Kachcha Kela', 'rawbanana 350 cubed', 12), ('Kathal', 'jackfruit 400 cubed, boiled', 15),
       ('Mushroom', 'mushroom 400 sliced', 6), ('Baby Corn', 'babycorn 300 sliced', 6), ('Broccoli', 'broccoli 400 florets', 6), ('Zucchini', 'zucchini 450 diced', 6),
       ('Patta Gobhi', 'cabbage 450 shredded', 8), ('Mooli', 'mooli 400 diced', 12), ('Gwar', 'gwar 350 chopped', 15), ('Sem', 'sem 350 chopped', 15),
       ('Karela', 'karela 350 sliced', 15), ('Matar', 'peas 400', 8), ('Corn', 'corn 400', 6), ('Tofu', 'tofu 300 cubed', 5), ('Paneer', 'paneer 250 cubed', 5),
       ('Aloo', 'potato 450 cubed', 12), ('Soya', 'soya 90 boiled, squeezed; onion 60', 8)]
OK = {'kadai': None, 'pepper': None, 'kari': {'Gobi', 'Beans', 'Gajar', 'Kaddu', 'Shakarkandi', 'Arbi', 'Suran', 'Kachcha Kela', 'Baingan', 'Bhindi', 'Kundru', 'Patta Gobhi',
                                              'Mooli', 'Karela', 'Aloo', 'Sem', 'Gwar', 'Lauki'},
      'sukhi': {'Gobi', 'Beans', 'Gajar', 'Tinda', 'Parwal', 'Kundru', 'Bhindi', 'Baingan', 'Kaddu', 'Arbi', 'Kathal', 'Gwar', 'Sem', 'Karela', 'Aloo', 'Matar', 'Patta Gobhi', 'Mooli'}}
for vn, spec, mins in VEG:
    for st in ('kadai', 'pepper', 'kari', 'sukhi'):
        if OK[st] is not None and vn not in OK[st]:
            continue
        unc = vn in ('Bhindi', 'Mushroom', 'Baby Corn', 'Broccoli', 'Zucchini', 'Tofu', 'Paneer', 'Corn', 'Karela', 'Kundru', 'Soya')
        sabzi(FMT[st].format(v=vn), spec, DESC[st].format(v=vn), style=st, mins=mins, uncovered=unc or st in ('kadai', 'pepper'))

# ---- New gravies
BASE.update({
    'handi': ('oil 12; jeera 1; bayleaf 0.2; cardamom 0.4; onion 150 finely chopped; ginger 8; garlic 10; tomato 180 puréed; curd 80 whisked; chilli 1.5; dhania 3; garam 1; kasuri 1; water 180; salt',
              'Heat oil with cumin, bay leaf and cardamom. Sauté the onion until golden, add ginger and garlic, then tomato purée and spices, and cook until thick. Lower the flame and stir in the whisked curd.'),
    'lababdar': ('oil 10; butter 5; onion 150 finely chopped; ginger 8; garlic 10; tomato 250 puréed; cashew 15 soaked, ground; chilli 1.5; garam 1; kasuri 1; cream 15; water 150; salt',
                 'Sauté onion in oil and butter until golden, add ginger-garlic, then tomato purée, cashew paste and spices, and cook until rich and thick. Finish with a little cream.'),
    'jalfrezi': ('oil 12; jeera 1; onion 120 petals; capsicum 120 strips; redcapsicum 60 strips; tomato 120 chopped; ginger 8; garlic 8; chilli 1.5; dhania 2; garam 1; vinegar 8; salt; water 60',
                 'Heat oil, crackle cumin, add ginger, garlic and the onion petals and peppers and stir-fry on high heat for 3 minutes. Add tomato, spices and vinegar and toss until just saucy.'),
    'salan': ('oil 12; jeera 1; curryleaf 1.5; onion 60; peanut 30 roasted; sesame 15; coconut 20; tamarind 15; jaggery 5; chilli 1; haldi 0.3; ginger 5; garlic 6; water 300; salt',
              'Roast the peanuts, sesame and coconut and grind with onion into a smooth paste. Heat oil, add cumin, curry leaves and ginger-garlic, then the paste, spices, tamarind, jaggery and water, and simmer until thick.'),
    'rezala': ('oil 12; cardamom 0.6; clove 0.2; cinnamon 1; bayleaf 0.2; onion 120 paste; ginger 8; garlic 8; cashew 15; poppy 6; curd 150 whisked; gchilli 6; garam 1; water 150; salt',
               'Fry the whole spices, add onion paste and ginger-garlic, then the cashew-poppy paste. Lower the flame and stir in the whisked curd and green chillies.'),
    'vindaloo': ('oil 12; onion 120; garlic 15; ginger 8; kashmirichilli 8; jeera 2; peppercorn 2; clove 0.2; cinnamon 1; vinegar 25; jaggery 5; haldi 0.5; water 150; salt',
                 'Grind the soaked chillies, garlic, ginger and spices with vinegar. Sauté the onion until golden, add the paste and cook for 5 minutes until fragrant.'),
    'kurma': ('coconutoil 12; saunf 1; cinnamon 1; clove 0.2; onion 120; ginger 8; garlic 8; tomato 100; coconut 50; cashew 10; dhania 3; chilli 1; garam 1; water 220; salt',
              'Fry fennel and whole spices, sauté onion, ginger-garlic and tomato, add the spices and a smooth paste of coconut and cashew, and simmer.'),
    'xacuti': ('oil 12; onion 150; coconut 50 roasted; poppy 4; dhaniaseed 4; redchilli 5; peppercorn 2; jeera 1; saunf 1; cinnamon 1; clove 0.2; nutmeg; tamarind 5; water 250; salt',
               'Dry-roast the coconut and all the spices and grind to a paste. Sauté the onion until golden, add the paste and tamarind and cook for 5 minutes.'),
    'mughlai': ('oil 12; cardamom 0.6; clove 0.2; cinnamon 1; onion 150 browned, ground; almond 15 ground; curd 120 whisked; saffron; garam 1; water 150; salt',
                'Fry the whole spices, add the browned-onion and almond pastes, then the whisked curd and saffron, and simmer gently.'),
    'kalimirch': ('oil 12; onion 120 paste; ginger 8; garlic 8; peppercorn 5 crushed; curd 120 whisked; cashew 12; garam 1; water 120; salt',
                  'Sauté the onion paste and ginger-garlic, add the crushed pepper and cashew paste, then the whisked curd, and simmer.'),
})
BN = {'handi': '{m} Handi', 'lababdar': '{m} Lababdar', 'jalfrezi': '{m} Jalfrezi', 'salan': '{m} Salan', 'rezala': '{m} Rezala', 'vindaloo': '{m} Vindaloo',
      'kurma': '{m} Kurma', 'xacuti': '{m} Xacuti', 'mughlai': 'Mughlai {m}', 'kalimirch': 'Kali Mirch {m}'}
BD = {'handi': 'slow-cooked handi-style with curd and whole spices', 'lababdar': 'in a rich, tangy onion-tomato-cashew lababdar gravy',
      'jalfrezi': 'stir-fried jalfrezi-style with peppers, tomato and a touch of vinegar', 'salan': 'in a tangy Hyderabadi peanut-sesame-coconut salan',
      'rezala': 'in a fragrant Bengali white rezala gravy of curd and poppy seeds', 'vindaloo': 'in a tangy Goan chilli-garlic-vinegar vindaloo masala (made lighter)',
      'kurma': 'in a South Indian coconut-fennel kurma', 'xacuti': 'in a Goan xacuti of roasted coconut and warm spices',
      'mughlai': 'in a royal Mughlai almond-curd gravy', 'kalimirch': 'in a creamy black pepper gravy'}
MAINS = [
    ('Paneer', 'paneer 200 cubed', 4, 'handi lababdar jalfrezi salan rezala vindaloo kurma xacuti mughlai kalimirch'),
    ('Tofu', 'tofu 250 cubed', 4, 'handi lababdar jalfrezi kurma xacuti kalimirch'),
    ('Mushroom', 'mushroom 300 halved', 7, 'handi lababdar jalfrezi rezala vindaloo kurma xacuti mughlai kalimirch'),
    ('Soya', 'soya 100 boiled, squeezed', 8, 'handi lababdar jalfrezi kurma vindaloo'),
    ('Mixed Vegetable', 'carrot 80; beans 80; peas 80; cauliflower 100; potato 80', 12, 'handi jalfrezi rezala vindaloo kurma xacuti mughlai'),
    ('Aloo', 'potato 350 cubed', 12, 'handi salan vindaloo xacuti'),
    ('Gobi', 'cauliflower 400 florets', 10, 'handi jalfrezi kurma'),
    ('Chana', 'chickpea 150 soaked, boiled', 8, 'handi kurma xacuti'),
    ('Baingan', 'brinjal 400 small, slit', 12, 'salan handi'),
    ('Mirchi', 'gchilli 150 large, mild, slit', 8, 'salan'),
    ('Shimla Mirch', 'capsicum 300 diced', 6, 'salan handi'),
    ('Baby Corn', 'babycorn 300 sliced', 6, 'jalfrezi handi lababdar'),
    ('Kathal', 'jackfruit 400 cubed, boiled', 12, 'handi xacuti vindaloo'),
    ('Paneer Matar', 'paneer 150 cubed; peas 120', 5, 'handi lababdar'),
    ('Mushroom Matar', 'mushroom 200; peas 120', 7, 'handi lababdar'),
    ('Rajma', 'rajma 150 soaked, boiled', 10, 'handi'),
    ('Lobia', 'lobia 150 soaked, boiled', 10, 'handi kurma'),
]
for mn, spec, sim, bases in MAINS:
    for b in bases.split():
        curry(BN[b].format(m=mn), spec, f'{mn} {BD[b]}.', base=b, simmer=sim)
for b in BN:
    g, txt = BASE[b]
    chicken(BN[b].format(m='Chicken'), f'Chicken {BD[b]}.', g, txt)
    mutton(BN[b].format(m='Mutton'), f'Mutton {BD[b]}.', g, txt)
    egg_curry(BN[b].format(m='Egg'), f'Boiled eggs {BD[b]}.', g, txt)
    for pn, main, sim in [('Fish', 'fish 500 thick pieces', 8), ('Prawn', 'prawn 450', 4), ('Pomfret', 'pomfret 500 cut', 8)]:
        if b in ('handi', 'rezala', 'mughlai') and pn == 'Pomfret':
            continue
        fishcurry(BN[b].format(m=pn), f'{pn} {BD[b]}.', g, txt, main=main, simmer=sim)

for on, add in [('Tomato Coriander', 'tomato 40; coriander 6; gchilli 3'), ('Zucchini', 'zucchini 40 grated; onion 20'), ('Capsicum Onion', 'capsicum 30; onion 30'),
                ('Spring Onion', 'springonion 30; gchilli 3'), ('Peas Carrot', 'peas 25; carrot 25 grated'), ('Mushroom Spinach', 'mushroom 35; spinach 20'),
                ('Paneer Tomato', 'paneer 30 crumbled; tomato 30'), ('Masala Oats', 'oats 15; onion 25; tomato 25; gchilli 3')]:
    omelette(f'{on} Omelette', add, f'A fluffy omelette with {on.lower()}.')
    omelette(f'{on} Egg White Omelette', add, f'A light, high-protein egg-white omelette with {on.lower()}.', eggs='eggwhite 132')

# ---- Dals x new vegetables
DALS = [('Moong', 'moong 150', 'jeera'), ('Masoor', 'masoor 150', 'garlic'), ('Toor', 'toor 150', 'south'), ('Chana', 'chanadal 150', 'onion'),
        ('Moong Masoor', 'moong 75; masoor 75', 'jeera'), ('Panchmel', 'toor 30; chanadal 30; moong 30; masoor 30; urad 30', 'onion')]
VD = [('Baingan', 'brinjal 150 cubed'), ('Bhindi', 'bhindi 120 sautéed'), ('Gajar', 'carrot 120 diced'), ('Patta Gobhi', 'cabbage 150 shredded'),
      ('Shimla Mirch', 'capsicum 120 diced'), ('Shakarkandi', 'sweetpotato 150 cubed'), ('Kachcha Papita', 'papaya 150 raw, cubed'), ('Petha', 'ashgourd 200 cubed'),
      ('Chichinda', 'snakegourd 200 cubed'), ('Zucchini', 'zucchini 200 cubed'), ('Gobi', 'cauliflower 150 small florets'), ('Palak Tamatar', 'spinach 100; tomato 100')]
for dn, ds, tk in DALS:
    for vn, v in VD:
        dal(f'{vn} {dn} Dal', ds, f'{dn} dal cooked with {vn.lower()}.', tadka=tk, add=v, soak=60 if ds.startswith('chanadal') else 30)
for vn, veg in [('Capsicum Onion', 'capsicum 150; onion 80; tomato 60'), ('Lauki Drumstick', 'lauki 150; drumstick 80; onion 60; tomato 60'),
                ('Carrot Drumstick', 'carrot 100; drumstick 80; onion 60; tomato 60'), ('Mixed Millet', 'drumstick 80; carrot 60; onion 60; tomato 60'),
                ('Sweet Potato Onion', 'sweetpotato 150; shallot 60; tomato 60'), ('Cauliflower', 'cauliflower 200; onion 60; tomato 60')]:
    sambar(f'{vn} Sambar', veg, f'South Indian sambar with {vn.lower()}.')

# ---- Legumes x add-ins
PUL = [('Chole', 'chickpea 180', 8, '5–6'), ('Rajma', 'rajma 180', 8, '6'), ('Kala Chana', 'kalachana 180', 8, '5–6'), ('Lobia', 'lobia 160', 6, '3'),
       ('Green Moong', 'gmoong 160', 6, '3'), ('Matki', 'moth 160', 6, '2'), ('Kulthi', 'kulthi 160', 8, '6–8'), ('Double Beans', 'rajmabeans 160', 8, '4'),
       ('Safed Vatana', 'whitepeas 180', 8, '5'), ('Hare Vatana', 'drygreenpeas 180', 8, '5')]
ADD = [('Lauki', 'lauki 250 cubed', 'Add the lauki and cook covered 8 minutes.'), ('Gajar Matar', 'carrot 100 diced; peas 80', 'Add the carrot and peas and cook 6 minutes.'),
       ('Gobi', 'cauliflower 200 florets', 'Add the cauliflower and cook covered 8 minutes.'), ('Corn', 'corn 150', 'Add the corn and cook 4 minutes.'),
       ('Shakarkandi', 'sweetpotato 200 cubed', 'Add the sweet potato and cook covered 8 minutes.'), ('Kachcha Kela', 'rawbanana 150 cubed', 'Add the raw banana and cook covered 8 minutes.'),
       ('Palak', 'spinach 200 chopped', 'Add the spinach and cook 3 minutes.'), ('Aloo', 'potato 200 cubed', 'Add the potatoes and cook covered 8 minutes.'),
       ('Methi', 'methi 80 chopped', 'Add the methi and cook 4 minutes.'), ('Baingan', 'brinjal 200 cubed', 'Add the brinjal and cook covered 8 minutes.')]
for pn, ps, soak, wh in PUL:
    for an, a, at in ADD:
        legume(f'{pn} {an}', ps, f'{pn} cooked with {an.lower()} in a homestyle masala.', add=a, add_txt=at, soak=soak, whistles=wh)

# ---- Rice
GR = [('Basmati', 'basmati 200', {}), ('Brown Rice', 'brice 200', {'soak': 60, 'water': 520, 'cook_txt': 'Pressure-cook for 3 whistles, or simmer covered for 35–40 minutes.'}),
      ('Foxtail Millet', 'foxtail 200', {'soak': 30, 'water': 440}), ('Kodo Millet', 'kodo 200', {'soak': 30, 'water': 440}),
      ('Little Millet', 'kutki 200', {'soak': 30, 'water': 440}), ('Barnyard Millet', 'sama 200', {'soak': 30, 'water': 440}),
      ('Quinoa', 'quinoa 180', {'soak': 0, 'water': 360, 'cook_txt': 'Cover and cook on low flame for 15 minutes until fluffy.'})]
AD = [('Methi', 'methi 80 chopped; peas 50'), ('Capsicum', 'capsicum 150 diced'), ('Gobi', 'cauliflower 200 small florets'), ('Broccoli', 'broccoli 200 small florets'),
      ('Tofu', 'tofu 150 cubed; peas 50'), ('Lobia', 'lobia 80 soaked, boiled'), ('Kala Chana', 'kalachana 80 soaked, boiled'), ('Green Moong', 'gmoong 80 soaked'),
      ('Mixed Sprouts', 'mixsprouts 150'), ('Mushroom Matar', 'mushroom 120; peas 80'), ('Patta Gobhi', 'cabbage 150 shredded; peas 50'), ('Corn Matar', 'corn 100; peas 80')]
for gn, grain, kw in GR:
    for an, a in AD:
        pulao(f'{gn} {an} Pulao', grain, a, f'{gn} pulao with {an.lower()} and whole spices.', **kw)
FL = [('Coriander', 'coriander 40 ground; gchilli 3; lemon 10', ['Season: Add the coriander paste and sauté 2 minutes.']),
      ('Mint', 'mint 30 ground; gchilli 3; ginger 5', ['Season: Add the mint paste and sauté 2 minutes.']),
      ('Ginger', 'ginger 25 grated; gchilli 3; lemon 10', ['Season: Add ginger and chilli; add lemon off the heat.']),
      ('Garlic', 'garlic 25 chopped; pepper 1', ['Season: Fry the garlic until golden and add pepper.']),
      ('Carrot', 'carrot 150 grated; vangibath 8', ['Cook the carrot: Sauté the carrot until soft and add the spice powder.']),
      ('Beetroot', 'beet 150 grated; vangibath 8', ['Cook the beetroot: Sauté until soft and add the spice powder.']),
      ('Methi', 'methi 80 chopped; onion 50', ['Cook the methi: Sauté onion and methi for 3 minutes.']),
      ('Capsicum', 'capsicum 150; vangibath 8', ['Cook the capsicum: Sauté and add the spice powder.']),
      ('Sesame', 'sesame 30 roasted, powdered; redchilli 2', ['Add the sesame: Stir in the sesame powder off the heat.']),
      ('Peanut', 'peanut 50 roasted, powdered; dhaniaseed 3', ['Add the peanut masala: Stir in off the heat.']),
      ('Raw Mango', 'rawmango 120 grated; haldi 0.5; gchilli 3', ['Cook the mango: Sauté the grated mango for 3 minutes.'])]
for gn, grain in [('Brown Rice', 'brice 200'), ('Red Rice', 'rrice 200'), ('Foxtail Millet', 'foxtail 200'), ('Kodo Millet', 'kodo 200'),
                  ('Little Millet', 'kutki 200'), ('Barnyard Millet', 'sama 200'), ('Quinoa', 'quinoa 180')]:
    for fn, add, mid in FL:
        flavoured(f'{fn} {gn}', add, f'{gn} tossed South Indian style with {fn.lower()}.', mid, rice=grain)
for gn, grain in [('Basmati', 'basmati 300'), ('Brown Rice', 'brice 280'), ('Foxtail Millet', 'foxtail 250'), ('Little Millet', 'kutki 250'), ('Quinoa', 'quinoa 250')]:
    for mn, main in [('Vegetable', 'carrot 100; beans 80; peas 80; cauliflower 100'), ('Paneer', 'paneer 250 cubed; capsicum 80'), ('Soya', 'soya 100 boiled, squeezed; peas 80'),
                     ('Mushroom', 'mushroom 350 halved'), ('Chana', 'chickpea 150 soaked, boiled'), ('Egg', 'egg 300 hard-boiled'), ('Chicken', 'chicken 450 cubed'),
                     ('Prawn', 'prawn 450'), ('Fish', 'fish 450 cubed')]:
        nm = f'{mn} Biryani' if gn == 'Basmati' else f'{gn} {mn} Biryani'
        biryani(nm, main, MAR, f'Fragrant layered {gn.lower()} biryani with {mn.lower()}.', rice=grain, mins=15 if mn not in ('Chicken',) else 20)
for gn, grain in [('Brown Rice', 'brice 200'), ('Foxtail Millet', 'foxtail 200'), ('Little Millet', 'kutki 200'), ('Quinoa', 'quinoa 180'), ('Basmati', 'basmati 200')]:
    for an, add in [('Egg', 'egg 150 scrambled'), ('Paneer', 'paneer 120 diced'), ('Chicken', 'chicken 180 diced, cooked'), ('Mushroom', 'mushroom 150 sliced'),
                    ('Tofu', 'tofu 150 diced'), ('Corn', 'corn 80; redcapsicum 40')]:
        fried_rice(f'{gn} {an} Fried Rice' if gn != 'Basmati' else f'{an} Fried Rice', add, f'Fried {gn.lower()} with {an.lower()} and crunchy vegetables.', rice=grain)
for gn, grain in [('Rice', 'rice 100'), ('Foxtail', 'foxtail 100'), ('Kodo', 'kodo 100'), ('Little Millet', 'kutki 100'), ('Brown Rice', 'brice 100'), ('Quinoa', 'quinoa 100'), ('Dalia', 'dalia 100')]:
    for vn, veg in [('Palak', 'spinach 120; tomato 50'), ('Lauki', 'lauki 200'), ('Methi', 'methi 60'), ('Mixed Vegetable', 'carrot 50; peas 50; beans 40; tomato 50')]:
        khichdi(f'{vn} {gn} Moong Khichdi' if gn != 'Rice' else f'{vn} Moong Khichdi', f'{grain}; moong 80', f'A soft one-pot khichdi of {gn.lower()} and moong dal with {vn.lower()}.', veg=veg)
