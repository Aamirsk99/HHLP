"""Volume 4 (extra) - vegetable-pair sabzis, grills, fish fries, egg bhurjis, seafood with vegetables and more staples."""
import core
from fam_sabzi import sabzi
from fam_dal import dal, rasam, kadhi
from fam_sides import soup
from fam_porridge import upma, porridge
from fam_breads import mixed, bhakri
from fam_rice import khichdi, pulao
from fam_nonveg import grilled, fishfry, fishcurry, egg_misc, FM, TM

core.VOLUME = 4

V = [('Gobi', 'cauliflower 220 florets'), ('Gajar', 'carrot 180 diced'), ('Beans', 'beans 180 chopped'), ('Matar', 'peas 150'), ('Shimla Mirch', 'capsicum 180 diced'),
     ('Patta Gobhi', 'cabbage 220 shredded'), ('Corn', 'corn 180'), ('Mushroom', 'mushroom 200 sliced'), ('Baby Corn', 'babycorn 150 sliced'), ('Broccoli', 'broccoli 200 florets'),
     ('Paneer', 'paneer 150 cubed'), ('Tofu', 'tofu 180 cubed'), ('Lauki', 'lauki 250 cubed'), ('Kaddu', 'pumpkin 250 cubed')]
for i in range(len(V)):
    for j in range(i + 1, len(V)):
        (a, av), (b, bv) = V[i], V[j]
        if {a, b} == {'Paneer', 'Tofu'} or ({a, b} & {'Lauki', 'Kaddu'} and {a, b} & {'Paneer', 'Tofu', 'Mushroom', 'Baby Corn', 'Broccoli'}):
            continue
        unc = bool({a, b} & {'Mushroom', 'Baby Corn', 'Broccoli', 'Paneer', 'Tofu', 'Corn', 'Shimla Mirch'})
        sabzi(f'{a} {b} Sabzi', f'{av}; {bv}', f'{a} and {b} cooked together with cumin, ginger and light spices.', style='jeera' if not unc else 'onion',
              mins=8 if unc else 12, uncovered=unc)

for fn, fish in [('Fish', 'fish 500 slices'), ('Pomfret', 'pomfret 500 whole, cleaned'), ('Mackerel', 'mackerel 500 whole, cleaned'), ('Prawn', 'prawn 400')]:
    for mn, m in [('Rava', FM + '; rava 40'), ('Pepper', 'peppercorn 5 crushed; garlic 8; ginger 5; haldi 0.5; lemon 15; curryleaf 2; salt'),
                  ('Green Masala', 'coriander 30; mint 10; gchilli 6; garlic 8; ginger 5; lemon 15; ricefl 10; salt'),
                  ('Red Masala', 'redchilli 5; garlic 8; ginger 5; tamarind 10; haldi 0.5; ricefl 15; salt'), ('Garlic', 'garlic 20; chilli 2; haldi 0.3; lemon 10; pepper 1; salt'),
                  ('Lemon Pepper', 'lemon 20; peppercorn 4 crushed; garlic 8; salt'), ('Tandoori', 'hungcurd 60; tandoori 4; ginger 5; garlic 8; lemon 10; salt')]:
        fishfry(f'{fn} {mn} Fry', f'{fn} coated in a {mn.lower()} masala and pan-fried until crisp.', fish, m)
for pn, main, cat_mins in [('Chicken', 'chicken 500 cubed', 15), ('Fish', 'fish 500 cubed', 10), ('Prawn', 'prawn 450', 8), ('Mutton', 'mutton 500 boneless cubes', 25),
                           ('Paneer', None, 0)]:
    if not main:
        continue
    for mn, m in [('Hariyali', 'hungcurd 100; coriander 30; mint 15; spinach 30; gchilli 6; ginger 8; garlic 10; lemon 15; salt'),
                  ('Achari', 'hungcurd 100; saunf 2; kalonji 1; methiseed 0.5; mustardoil 10; chilli 2; haldi 0.5; ginger 8; garlic 10; lemon 10; salt'),
                  ('Malai', 'hungcurd 100; cashew 12 ground; ginger 8; garlic 10; pepper 1; elaichipowder 0.3; lemon 10; salt'),
                  ('Pudina', 'hungcurd 100; mint 25; coriander 15; gchilli 6; ginger 8; garlic 10; lemon 15; salt'),
                  ('Lemon Pepper', 'hungcurd 80; lemon 20; peppercorn 4 crushed; garlic 10; salt'), ('Garlic', 'hungcurd 100; garlic 25; chilli 2; garam 1; lemon 15; oil 8; salt'),
                  ('Kalimirch', 'hungcurd 100; peppercorn 5 crushed; cashew 10; ginger 8; garlic 10; salt'), ('Tandoori', TM)]:
        grilled(f'{mn} {pn} Tikka', f'{pn} in a {mn.lower()} marinade, grilled until charred at the edges.', main, m, mins=cat_mins)

BH = 'Sauté: Heat oil and sauté the onion until soft. Add green chilli and the vegetables and cook for 2–3 minutes.'
for bn, add in [('Palak', 'spinach 60 chopped'), ('Mushroom', 'mushroom 80 chopped'), ('Capsicum', 'capsicum 60 chopped'), ('Corn', 'corn 60'),
                ('Paneer', 'paneer 50 crumbled'), ('Methi', 'methi 30 chopped'), ('Matar', 'peas 50'), ('Tomato Coriander', 'tomato 70 chopped; coriander 8'),
                ('Sprouts', 'sprouts 60'), ('Broccoli', 'broccoli 60 finely chopped')]:
    egg_misc(f'{bn} Egg Bhurji', f'Soft Indian scrambled eggs with {bn.lower()}, ready in 10 minutes.',
             f'egg 200; onion 40 chopped; {add}; gchilli 3; haldi 0.2; chilli 0.5; pavbhaji 1; coriander 4; salt; oil 6',
             [BH, 'Spice: Add turmeric, chilli powder, pav bhaji masala and salt.', 'Scramble: Pour in the beaten eggs and stir gently on low flame until just set.',
              'Serve: Add coriander and serve hot with roti or toast.'])

MAL = ('coconutoil 12; mustard 2; curryleaf 2; shallot 60; ginger 8; garlic 8; tomato 80; coconut 80 ground; chilli 2; haldi 0.5; kokum 9; water 300; salt',
       'Sauté shallots, ginger, garlic and curry leaves in coconut oil, add tomato and spices, then the coconut paste and kokum.')
for pn, main, sim in [('Prawn', 'prawn 400', 5), ('Fish', 'fish 450 thick pieces', 8)]:
    for vn, v in [('Drumstick', 'drumstick 150 cut in pieces'), ('Raw Mango', 'rawmango 120 sliced'), ('Brinjal', 'brinjal 200 cubed'), ('Pumpkin', 'pumpkin 200 cubed'),
                  ('Radish', 'mooli 200 sliced'), ('Raw Banana', 'rawbanana 150 cubed'), ('Ash Gourd', 'ashgourd 200 cubed'), ('Bhindi', 'bhindi 150 sautéed')]:
        fishcurry(f'{pn} {vn} Curry', f'Coastal {pn.lower()} curry cooked with {vn.lower()} in coconut and kokum.', MAL[0] + f'; {v}', MAL[1] + f' Add the {vn.lower()} and cook until tender.',
                  main=main, simmer=sim)

for dn, ds, tk in [('Toor Moong', 'toor 75; moong 75', 'jeera'), ('Masoor Chana', 'masoor 75; chanadal 75', 'onion')]:
    for vn, v in [('Palak', 'spinach 150 chopped'), ('Methi', 'methi 60 chopped'), ('Lauki', 'lauki 200 cubed'), ('Tomato', 'tomato 150 chopped'), ('Drumstick', 'drumstick 120'),
                  ('Pumpkin', 'pumpkin 200 cubed'), ('Raw Mango', 'rawmango 100 cubed'), ('Gajar', 'carrot 120 diced'), ('Baingan', 'brinjal 150 cubed'), ('Bathua', 'bathua 100 chopped'),
                  ('Chaulai', 'amaranth 120 chopped'), ('Moringa Leaf', 'moringaleaf 40'), ('Tori', 'tori 200 cubed'), ('Patta Gobhi', 'cabbage 150 shredded')]:
        dal(f'{vn} {dn} Dal', ds, f'{dn} dal cooked with {vn.lower()}.', tadka=tk, add=v, soak=60 if 'chana' in ds else 30)

EX = [('Zucchini', 'zucchini 300'), ('Cabbage', 'cabbage 250'), ('Green Peas', 'peas 250'), ('Sweet Corn', 'corn 250'), ('Red Pepper', 'redcapsicum 250 roasted')]
SV = [('Carrot', 'carrot 200'), ('Tomato', 'tomato 250'), ('Pumpkin', 'pumpkin 250'), ('Spinach', 'spinach 150'), ('Broccoli', 'broccoli 200'), ('Beetroot', 'beet 150'),
      ('Mushroom', 'mushroom 200'), ('Cauliflower', 'cauliflower 200'), ('Lauki', 'lauki 250'), ('Sweet Potato', 'sweetpotato 200')]
for a, av in EX:
    for b, bv in SV + [x for x in EX if x[0] > a]:
        soup(f'{a} {b} Soup', f'{av}; {bv}', f'A smooth, warming {a.lower()} and {b.lower()} soup thickened without cream.')

for gn, grain, water, roast, cook in [('Foxtail Millet', 'foxtail 120', 420, False, 20), ('Kodo Millet', 'kodo 120', 420, False, 20), ('Little Millet', 'kutki 120', 420, False, 20),
                                      ('Quinoa', 'quinoa 120', 360, False, 18), ('Oats', 'oats 120', 180, True, 12), ('Dalia', 'dalia 120', 480, True, 20)]:
    for vn, veg in [('Tomato Peas', 'onion 60 chopped; tomato 100; peas 40'), ('Beetroot', 'onion 60 chopped; beet 80 grated'),
                    ('Carrot Beans', 'onion 60 chopped; carrot 60; beans 50'), ('Cabbage Peas', 'onion 60 chopped; cabbage 80; peas 40')]:
        upma(f'{vn} {gn} Upma', grain, veg, f'{gn} upma with {vn.lower()}.', water=water, roast=roast, cook=cook)
for gn, grain, cook in [('Oats', 'oats 60', 6), ('Foxtail Millet', 'foxtail 50', 20), ('Quinoa', 'quinoa 50 rinsed', 18), ('Dalia', 'dalia 50', 15), ('Little Millet', 'kutki 50', 20)]:
    for fn, top, sweet in [('Pear Cinnamon', 'pear 100; walnut 8', 'cinnamon 0.5; dates 16'), ('Strawberry', 'strawberry 80; almond 6', 'honey 7'), ('Papaya', 'papaya 100; pumpkinseed 6', 'dates 16')]:
        porridge(f'{fn} {gn} Porridge', grain, 'milk 300; water 100', f'Creamy {gn.lower()} porridge topped with {fn.lower()}.', sweet=sweet, top=top, cook=cook)

for fn, flour, liq in [('Jowar', 'jowar 100; atta 60', 'water 60'), ('Ragi', 'ragi 80; atta 80', 'water 60'), ('Multigrain', 'mgatta 140; besan 20', 'water 50'),
                       ('Bajra', 'bajra 80; atta 60; besan 20', 'water 60'), ('Oats', 'oats 60 powdered; atta 80; besan 20', 'water 50')]:
    for gn, green in [('Dill', 'dill 30 chopped'), ('Bathua', 'bathua 60 chopped'), ('Palak', 'spinach 80 chopped'), ('Lauki', 'lauki 120 grated'), ('Methi', 'methi 50 chopped')]:
        mixed(f'{gn} {fn} Thepla', flour, f'{green}; curd 30; haldi 0.3; chilli 1; ajwain 1; sesame 5', f'Soft {fn.lower()} theplas with {gn.lower()}.',
              f'Chop or grate the {gn.lower()}.', sub='Thepla', liquid=liq)
for fn, flour in [('Jowar', 'jowar 160'), ('Bajra', 'bajra 160'), ('Ragi', 'ragi 140'), ('Makki', 'makki 160'), ('Kodo', 'kodo 140'), ('Foxtail', 'foxtail 140')]:
    for an, add in [('Methi Palak', 'methi 20 chopped; spinach 30 chopped'), ('Spring Onion', 'springonion 40 chopped'), ('Dill', 'dill 20 chopped'), ('Moringa', 'moringaleaf 20')]:
        bhakri(f'{an} {fn} Roti', flour, f'{fn} roti with {an.lower()} kneaded into the dough.', add=add)

for rn, base, kw in [('Tomato Mint Rasam', 'mint 10', {}), ('Pepper Cumin Rasam', 'peppercorn 2; jeera 2', {}), ('Garlic Tomato Rasam with Moong', 'garlic 12', {'dals': 'moong 40'}),
                     ('Carrot Rasam', 'carrot 100 grated', {'dals': 'toor 40'}), ('Pumpkin Rasam', 'pumpkin 120', {'dals': 'moong 30'}),
                     ('Spinach Pepper Rasam', 'spinach 60; peppercorn 1', {'dals': 'toor 40'}), ('Ginger Garlic Rasam', 'ginger 15; garlic 10', {}),
                     ('Coriander Lemon Moong Rasam', 'coriander 20', {'sour': 'tomato 80; lemon 20', 'dals': 'moong 40'})]:
    rasam(rn, base, f'A light, peppery {rn.lower()}.', **kw)
for kn, veg in [('Drumstick Lauki Kadhi', 'drumstick 80; lauki 100'), ('Palak Methi Kadhi', 'spinach 60; methi 30'), ('Mixed Greens Kadhi', 'spinach 50; methi 20; bathua 40'),
                ('Pumpkin Bhindi Kadhi', 'pumpkin 100; bhindi 60 sautéed'), ('Cucumber Kadhi', 'cucumber 150'), ('Raw Banana Kadhi', 'rawbanana 100 cubed')]:
    kadhi(kn, f'Curd-besan kadhi with {kn.replace(" Kadhi", "").lower()}.', veg=veg)
for gn, grain in [('Rice', 'rice 100'), ('Foxtail', 'foxtail 100'), ('Kodo', 'kodo 100'), ('Little Millet', 'kutki 100'), ('Brown Rice', 'brice 100'), ('Quinoa', 'quinoa 100')]:
    for dn, d in [('Masoor Palak', 'masoor 80; spinach 80'), ('Toor Vegetable', 'toor 80; carrot 50; peas 50'), ('Chana Dal Lauki', 'chanadal 70; lauki 150')]:
        khichdi(f'{gn} {dn} Khichdi' if gn != 'Rice' else f'{dn} Khichdi', f'{grain}; {d}', f'A one-pot khichdi of {gn.lower()} with {dn.lower()}.')
for an, a in [('Methi', 'methi 80 chopped; peas 50'), ('Capsicum', 'capsicum 150 diced'), ('Gobi', 'cauliflower 200 small florets'), ('Matar', 'peas 150'),
              ('Mushroom', 'mushroom 200 sliced'), ('Paneer', 'paneer 120 cubed; peas 60'), ('Corn', 'corn 150; capsicum 50'), ('Palak', 'spinach 150 puréed; peas 50'),
              ('Soya', 'soya 50 boiled, squeezed; peas 60'), ('Chana', 'chickpea 80 soaked, boiled'), ('Rajma', 'rajma 80 soaked, boiled'), ('Vegetable', 'carrot 60; beans 50; peas 60; cauliflower 50')]:
    pulao(f'Red Rice {an} Pulao', 'rrice 200', a, f'Kerala red rice pulao with {an.lower()}, rich in fibre.', soak=60, water=520,
          cook_txt='Pressure-cook for 3 whistles, or simmer covered for 35–40 minutes until tender.')

# ---- More sweets, chutneys and raitas
from fam_sweets import kheer, ladoo
from fam_sides import chutney, raita
for gn, g, mins in [('Rice', 'rice 50 soaked', 30), ('Foxtail', 'foxtail 50', 30), ('Kodo', 'kodo 50', 30), ('Little Millet', 'kutki 50', 30), ('Sama', 'sama 50', 25),
                    ('Quinoa', 'quinoa 50 rinsed', 25), ('Oats', 'oats 50 roasted', 10), ('Dalia', 'dalia 50 roasted', 25)]:
    for fn, kw in [('Saffron Pistachio', {'flav': 'saffron; elaichipowder 0.5', 'nuts': 'pistachio 15'}),
                   ('Coconut Jaggery', {'liquid': 'milk 450; coconutmilk 250', 'nuts': 'cashew 10; coconut 10'}),
                   ('Rose Almond', {'flav': 'rosewater 5; elaichipowder 0.5', 'nuts': 'almond 15'}),
                   ('Cardamom Dates', {'sweet': 'dates 40 chopped', 'nuts': 'almond 10; pistachio 6'})]:
        kheer(f'{fn} {gn} Kheer', g, f'A creamy {gn.lower()} kheer with {fn.lower()}.', mins=mins, **kw)
for nn, nut in [('Almond', 'almond 70'), ('Cashew', 'cashew 70'), ('Walnut', 'walnut 70'), ('Pistachio', 'pistachio 60'), ('Peanut', 'peanut 80 roasted')]:
    for bn, binder in [('Fig', 'dfig 140 soaked; dates 40'), ('Date Coconut', 'dates 150; coconut 30')]:
        ladoo(f'{nn} {bn} Ladoo', f'{nut}; {binder}; elaichipowder 1', f'Sugar-free {nn.lower()} ladoos bound with {bn.lower()}.', f'Roast and chop the {nn.lower()}; blend the {bn.lower()}.')
for cn, items in [('Mint Peanut Coconut Chutney', 'mint 20; peanut 30 roasted; coconut 40; gchilli 3; lemon 10; salt; water 40'),
                  ('Coriander Garlic Chutney', 'coriander 50; garlic 6; gchilli 3; lemon 10; salt; water 30'), ('Coriander Coconut Ginger Chutney', 'coriander 40; coconut 50; ginger 10; gchilli 3; salt; water 40'),
                  ('Spinach Peanut Chutney', 'spinach 100 blanched; peanut 30 roasted; gchilli 3; lemon 10; salt'), ('Methi Coconut Chutney', 'methi 40 sautéed; coconut 60; gchilli 3; tamarind 5; salt'),
                  ('Raw Mango Coconut Chutney', 'rawmango 80; coconut 60; gchilli 3; salt'), ('Amla Mint Chutney', 'amla 100 deseeded; mint 20; gchilli 3; salt'),
                  ('Tomato Coconut Chutney (Red)', 'tomato 150; coconut 50; redchilli 4; salt; oil 4')]:
    chutney(cn, items, f'A fresh homemade {cn.lower()}.')
for rn, add in [('Cucumber Carrot Mint Raita', 'cucumber 80; carrot 50; mint 4'), ('Onion Cucumber Raita', 'onion 50; cucumber 80'), ('Beetroot Cucumber Raita', 'beet 60 steamed; cucumber 60'),
                ('Spinach Mint Raita', 'spinach 60 blanched; mint 4'), ('Corn Cucumber Raita', 'corn 60; cucumber 60'), ('Papaya Mint Raita', 'papaya 100; mint 4'),
                ('Banana Pomegranate Raita', 'banana 60; pomegranate 30'), ('Carrot Peanut Raita', 'carrot 80 grated; peanut 15 crushed')]:
    raita(rn, add, f'A cooling {rn.lower()}.')
