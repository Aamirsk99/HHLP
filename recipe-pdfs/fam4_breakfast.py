"""Volume 4 - breakfast, breads, poha, upma and porridge: further flour, grain and vegetable combinations."""
import core
from fam_breakfast import flour_chila, dal_chila, fermented_dosa, fermented_idli, instant_idli, uttapam, appe, instant_dosa
from fam_breads import stuffed, mixed, bhakri, plain_roti, ST
from fam_porridge import poha, upma, porridge

core.VOLUME = 4

V1 = 'onion 40 finely chopped; gchilli 3 finely chopped'
VEGS = [('Palak', 'spinach 50 finely chopped', V1), ('Methi', 'methi 30 finely chopped', V1), ('Carrot', 'carrot 60 grated', V1),
        ('Beetroot', 'beet 50 grated', V1), ('Cabbage', 'cabbage 60 finely shredded', V1), ('Corn', 'corn 50 crushed', 'onion 30; capsicum 30 finely chopped; gchilli 3'),
        ('Peas', 'peas 50 crushed', V1), ('Mushroom', 'mushroom 60 finely chopped', V1), ('Capsicum', 'capsicum 60 finely chopped', V1),
        ('Lauki', 'lauki 80 grated, squeezed', V1), ('Tomato Onion', '', 'onion 60 finely chopped; tomato 70 chopped; gchilli 3'),
        ('Mixed Vegetable', '', 'onion 30; tomato 30; carrot 30 grated; capsicum 30; cabbage 30; gchilli 3'), ('Spring Onion', 'springonion 40 chopped', 'tomato 40 chopped; gchilli 3'),
        ('Broccoli', 'broccoli 50 finely grated', V1)]
NEWV = [('Zucchini', 'zucchini 80 grated, squeezed', V1), ('Dill', 'dill 20 chopped', V1), ('Bathua', 'bathua 40 chopped', V1),
        ('Chaulai', 'amaranth 40 chopped', V1), ('Moringa Leaf', 'moringaleaf 25', V1), ('Sweet Potato', 'sweetpotato 60 grated', V1),
        ('Pumpkin', 'pumpkin 70 grated', V1), ('Mooli', 'mooli 70 grated, squeezed', 'gchilli 3 finely chopped; coriander 6')]
OLDF = [('Besan', 'besan 100', 180, 10), ('Oats', 'oats 60 powdered; besan 40', 180, 15), ('Ragi', 'ragi 70; besan 30', 200, 10),
        ('Jowar', 'jowar 70; besan 30', 190, 10), ('Bajra', 'bajra 70; besan 30', 190, 10), ('Multigrain', 'mgatta 50; besan 50', 190, 10),
        ('Rava', 'rava 80; curd 60', 120, 15), ('Quinoa', 'quinoa 60 soaked and ground; besan 40', 120, 10)]
NEWF = [('Sattu', 'sattu 60; besan 40', 190, 10), ('Makki', 'makki 60; besan 40', 190, 10), ('Rice Flour', 'ricefl 60; besan 40', 200, 10),
        ('Rajgira', 'rajgira 60; besan 40', 180, 10), ('Kuttu', 'kuttu 60; besan 40', 180, 10), ('Dalia', 'dalia 60 finely ground; besan 40', 160, 15)]


def chila(fname, flour, water, rest, vname, vadd, chopped):
    flour_chila(f'{vname} {fname} Chila', flour + (f'; {vadd}' if vadd else ''), chopped,
                f'A wholesome {fname.lower()} chila with {vname.lower()}, quick to make and rich in fibre.', water=water, rest=rest)


for f in OLDF:
    for v in NEWV:
        chila(*f, *v)
for f in NEWF:
    for v in VEGS + NEWV:
        chila(*f, *v)

DALS = [('Moong', 'moong 120', '4 hours'), ('Masoor', 'masoor 120', '2 hours'), ('Green Moong', 'gmoong 120', '6–8 hours'),
        ('Chana Dal', 'chanadal 120', '5 hours'), ('Mixed Dal', 'moong 40; masoor 40; chanadal 40', '4 hours'), ('Urad Moong', 'moong 80; urad 40', '4 hours')]
DV = [('Zucchini', '', 'zucchini 70 grated, squeezed; coriander 6'), ('Dill', '', 'dill 20 chopped; onion 30'), ('Bathua', '', 'bathua 40 chopped; onion 30'),
      ('Moringa Leaf', '', 'moringaleaf 25; onion 30'), ('Pumpkin', '', 'pumpkin 70 grated; coriander 6'), ('Mooli', '', 'mooli 70 grated, squeezed; coriander 6'),
      ('Peas', '', 'peas 50 crushed; onion 30'), ('Mushroom', '', 'mushroom 60 finely chopped; onion 30'), ('Capsicum', '', 'capsicum 60 finely chopped; onion 30'),
      ('Tomato Onion', '', 'onion 50 finely chopped; tomato 60 chopped; coriander 6')]
for dn, ds, soak in DALS:
    for vn, vadd, extra in DV:
        dal_chila(f'{vn} {dn} Chila', ds, extra, f'A protein-rich {dn.lower()} chila with {vn.lower()}, no fermentation needed.', soak=soak)

GRAINS = [('Classic', 'idlirice 200'), ('Brown Rice', 'brice 200'), ('Red Rice', 'rrice 200'), ('Foxtail Millet', 'foxtail 200'), ('Kodo Millet', 'kodo 200'),
          ('Little Millet', 'kutki 200'), ('Barnyard Millet', 'sama 200'), ('Multigrain', 'idlirice 100; foxtail 50; kutki 50')]
for gn, g in GRAINS:
    pre = '' if gn == 'Classic' else gn + ' '
    fermented_dosa(f'{pre}Tomato Dosa', g, f'A tangy {gn.lower()} dosa with tomato purée in the batter.', batter_add='tomato 150 puréed; redchilli 2',
                   add_txt='Blend tomatoes with red chillies and stir into the batter.')
    fermented_dosa(f'{pre}Beetroot Dosa', g, f'A pink {gn.lower()} dosa with beetroot in the batter.', batter_add='beet 120 grated', add_txt='Blend the beetroot and stir into the batter.')
    fermented_dosa(f'{pre}Carrot Topped Dosa', g, f'A {gn.lower()} dosa topped with grated carrot and coriander.', topping='carrot 120 grated; coriander 8; gchilli 3',
                   top_txt='Sprinkle the carrot mixture over the dosa and press lightly.')
    fermented_dosa(f'{pre}Cheese Corn Dosa', g, f'A {gn.lower()} dosa topped with corn, capsicum and a little cheese.', topping='corn 80; capsicum 50; cheese 28',
                   top_txt='Sprinkle the toppings and cover for 30 seconds to melt the cheese.')
    fermented_dosa(f'{pre}Egg Dosa', g, f'A {gn.lower()} dosa with beaten egg spread on top.', topping='egg 200 beaten; onion 60; pepper 1; coriander 6',
                   top_txt='Spread 2–3 tbsp of the egg mixture on the dosa and cook until set.')
    fermented_dosa(f'{pre}Sprouts Dosa (Filled)', g, f'A {gn.lower()} dosa filled with spicy sprouts.',
                   filling='mixsprouts 250 steamed; onion 80; tomato 80; haldi 0.3; chilli 1; garam 1; oil 8; salt; coriander 6',
                   fill_txt='Sauté onion and tomato with spices, add the sprouts and cook 3 minutes.')
    fermented_dosa(f'{pre}Gobi Dosa', g, f'A {gn.lower()} dosa filled with spiced cauliflower.',
                   filling='cauliflower 300 finely chopped; onion 80; tomato 60; haldi 0.5; chilli 1; garam 1; oil 8; salt; coriander 6',
                   fill_txt='Sauté onion, add cauliflower, tomato and spices and cook covered until tender and dry.')
    fermented_dosa(f'{pre}Soya Keema Dosa', g, f'A {gn.lower()} dosa filled with spicy soya keema.',
                   filling='soyagran 80 soaked, squeezed; onion 80; tomato 80; peas 50; garam 1; chilli 1; oil 8; salt; coriander 6',
                   fill_txt='Sauté onion and tomato, add soya and peas with spices and cook until dry.')
    fermented_dosa(f'{pre}Coriander Dosa', g, f'A green {gn.lower()} dosa with coriander in the batter.', batter_add='coriander 40; gchilli 3',
                   add_txt='Grind the coriander and chilli and mix into the batter.')
    fermented_dosa(f'{pre}Moringa Dosa', g, f'A {gn.lower()} dosa with moringa leaves in the batter.', batter_add='moringaleaf 30', add_txt='Stir the chopped moringa leaves into the batter.')
    fermented_idli(f'{gn} Beetroot Idli' if gn != 'Classic' else 'Beetroot Rice Idli', g.replace('200', '280'), f'Pink {gn.lower()} idlis with beetroot.',
                   add='beet 80 puréed', add_txt='Fold the beetroot purée into the batter.')
    fermented_idli(f'{gn} Carrot Idli' if gn != 'Classic' else 'Carrot Idli', g.replace('200', '280'), f'{gn} idlis with grated carrot.', add='carrot 80 finely grated',
                   add_txt='Fold the carrot into the batter.')
    fermented_idli(f'{gn} Corn Idli' if gn != 'Classic' else 'Sweet Corn Idli', g.replace('200', '280'), f'{gn} idlis with crushed corn.', add='corn 100 crushed',
                   add_txt='Fold the corn into the batter.')
    fermented_idli(f'{gn} Methi Idli' if gn != 'Classic' else 'Fresh Methi Idli', g.replace('200', '280'), f'{gn} idlis with fresh methi.', add='methi 40 chopped',
                   add_txt='Fold the methi into the batter.')
    for tn, top in [('Beetroot Onion', 'beet 80 grated; onion 60; coriander 8'), ('Cabbage Carrot', 'cabbage 80 shredded; carrot 50; gchilli 6'),
                    ('Mushroom Onion', 'mushroom 120; onion 60; capsicum 30'), ('Sprouts Tomato', 'sprouts 100; tomato 60; coriander 8'),
                    ('Spinach Onion', 'spinach 80 chopped; onion 60; gchilli 6'), ('Sweet Corn', 'corn 120; capsicum 40; coriander 8')]:
        uttapam(f'{pre}{tn} Uttapam', g, top, f'A thick {gn.lower()} uttapam topped with {tn.lower()}.')

for base, bn in [('rava 120; curd 120', 'Rava'), ('oats 80 powdered; rava 40; curd 120', 'Oats'), ('ragi 80; rava 40; curd 120', 'Ragi'),
                 ('moong 150 soaked 3 hours, ground', 'Moong Dal'), ('jowar 100; rava 30; curd 120', 'Jowar')]:
    for add, an in [('beet 60 grated; onion 40; gchilli 3; eno 3', 'Beetroot'), ('methi 40 chopped; onion 40; gchilli 3; eno 3', 'Methi'),
                    ('peas 60; carrot 40 grated; gchilli 3; eno 3', 'Peas Carrot'), ('paneer 80 grated; onion 40; coriander 6; eno 3', 'Paneer'),
                    ('mushroom 70 chopped; onion 40; gchilli 3; eno 3', 'Mushroom')]:
        appe(f'{an} {bn} Appe', base, add, f'Crisp {bn.lower()} appe with {an.lower()}, cooked with very little oil.')

for flour, fn in [('rava 85; ricefl 65; atta 30', 'Rava'), ('oats 90 powdered; rava 40; ricefl 40', 'Oats'), ('ragi 120; ricefl 30; rava 30', 'Ragi'),
                  ('jowar 120; ricefl 30; rava 30', 'Jowar')]:
    for xn, extra in [('Methi', 'methi 30 chopped; onion 40; gchilli 3; jeera 1.25'), ('Carrot', 'carrot 60 grated; onion 40; gchilli 3; jeera 1.25'),
                      ('Spinach', 'spinach 50 chopped; onion 40; gchilli 3; jeera 1.25'), ('Tomato', 'tomato 80 chopped; onion 40; gchilli 3; jeera 1.25')]:
        instant_dosa(f'{xn} {fn} Dosa', flour, f'An instant, crisp {fn.lower()} dosa with {xn.lower()}.', curd='curd 30', extra=extra + '; coriander 6')

# ---- Parathas
PF = [('Atta', 'atta 160'), ('Multigrain', 'mgatta 160'), ('Jowar', 'jowar 80; atta 80'), ('Ragi', 'ragi 60; atta 100'), ('Bajra', 'bajra 70; atta 90'),
      ('Oats', 'oats 50 powdered; atta 110')]
STF = [('Paneer Methi', 'paneer 120 grated; methi 40 finely chopped; gchilli 3; jeerapowder 1; salt', 'Mix the paneer with methi and spices.'),
       ('Broccoli', f'broccoli 180 finely grated; paneer 40 grated; {ST}', 'Mix the grated broccoli with paneer and spices.'),
       ('Carrot', f'carrot 200 grated; paneer 40 grated; {ST}', 'Squeeze the carrot lightly and mix with paneer and spices.'),
       ('Cabbage', f'cabbage 200 grated; {ST}', 'Salt the cabbage, rest 10 minutes, squeeze dry and add the spices.'),
       ('Beetroot', f'beet 150 grated; potato 80 boiled, mashed; {ST}', 'Squeeze the beetroot and mix with potato and spices.'),
       ('Sweet Potato', f'sweetpotato 220 boiled, mashed; {ST}', 'Mash the sweet potato and mix in the spices.'),
       ('Soya Keema', 'soyagran 60 soaked, squeezed; onion 40; gchilli 3; ginger 5; coriander 6; garam 1; amchur 1; salt; oil 5', 'Sauté the soya with onion and spices; cool.'),
       ('Rajma', f'rajma 80 soaked, boiled, mashed; onion 30; {ST}', 'Mash the drained rajma and dry it in a pan; add spices.'),
       ('Mushroom', 'mushroom 200 finely chopped; onion 40; garlic 8; gchilli 3; pepper 0.5; coriander 6; oil 5; salt', 'Sauté the mushrooms until dry; cool.'),
       ('Corn', f'corn 150 coarsely crushed; potato 80 boiled; {ST}', 'Mix the corn with potato and spices.'),
       ('Pumpkin', f'pumpkin 220 grated, cooked dry; {ST}', 'Cook the pumpkin until dry; cool and add spices.'),
       ('Chana', 'chickpea 100 soaked, boiled, mashed; onion 30; gchilli 3; coriander 6; chole 2; amchur 1; salt', 'Mash the chickpeas and mix with onion and spices.'),
       ('Kala Chana', 'kalachana 100 soaked, boiled, mashed; onion 30; gchilli 3; coriander 6; amchur 1; salt', 'Mash the kala chana with onion and spices.'),
       ('Egg', 'egg 150 scrambled dry; onion 30; gchilli 3; coriander 6; pepper 0.5; salt', 'Scramble the eggs dry with onion and spices; cool.'),
       ('Tofu', f'tofu 180 crumbled; onion 30; {ST}', 'Press and crumble the tofu and mix with spices.')]
for fn, flour in PF:
    for sn, stuffing, ptxt in STF:
        nm = f'{sn} Paratha' if fn == 'Atta' else f'{fn} {sn} Paratha'
        stuffed(nm, stuffing, f'{sn} paratha made with {fn.lower()} dough, a filling breakfast.', ptxt, flour=flour)

for fn, flour, liq in [('Atta', 'atta 140; besan 20', 'water 50'), ('Jowar', 'jowar 100; atta 60', 'water 60'), ('Ragi', 'ragi 80; atta 80', 'water 60'),
                       ('Multigrain', 'mgatta 140; besan 20', 'water 50')]:
    for gn, green in [('Methi Palak', 'methi 40 chopped; spinach 40 chopped'), ('Carrot Coriander', 'carrot 80 grated; coriander 15'),
                      ('Moringa', 'moringaleaf 25'), ('Chaulai', 'amaranth 60 chopped'), ('Cabbage', 'cabbage 80 grated')]:
        nm = f'{gn} Thepla' if fn == 'Atta' else f'{gn} {fn} Thepla'
        mixed(nm, flour, f'{green}; curd 30; haldi 0.3; chilli 1; ajwain 1; sesame 5', f'Soft {fn.lower()} theplas with {gn.lower()}, great for travel.',
              f'Chop or grate the {gn.lower()}.', sub='Thepla', liquid=liq)

for fn, flour in [('Kodo', 'kodo 140'), ('Foxtail', 'foxtail 140'), ('Little Millet', 'kutki 140'), ('Barnyard', 'sama 140'), ('Rajgira', 'rajgira 140')]:
    for an, add in [('Methi', 'methi 30 chopped'), ('Palak', 'spinach 60 puréed'), ('Onion', 'onion 50 finely chopped; coriander 6; gchilli 3'), ('Carrot', 'carrot 50 grated; coriander 6')]:
        bhakri(f'{an} {fn} Roti', flour, f'{fn} roti with {an.lower()} kneaded into the dough.', add=add)

# ---- Poha, upma, porridge
for vn, veg in [('Sweet Corn Capsicum', 'onion 50 chopped; corn 60; capsicum 40'), ('Methi Peas', 'onion 50 chopped; methi 30; peas 40'),
                ('Tofu Vegetable', 'onion 50 chopped; tofu 80 crumbled; carrot 40'), ('Spinach Corn', 'onion 50 chopped; spinach 60; corn 40'),
                ('Mushroom Peas', 'onion 50 chopped; mushroom 80; peas 40')]:
    for pn, base in [('Poha', 'poha 120'), ('Red Poha', 'rpoha 120'), ('Oats Poha', 'oats 80; poha 40')]:
        poha(f'{vn} {pn}', base, veg, f'{pn} cooked the kanda poha way with {vn.lower()}.')
VU = 'onion 60 chopped; carrot 40 chopped; beans 30 chopped; peas 30'
for gn, grain, water, roast, cook in [('Rava', 'rava 120', 420, True, 15), ('Barnyard Millet', 'sama 120', 400, False, 15), ('Semiya', 'semiya 120', 300, True, 12),
                                      ('Broken Rice', 'rice 120 coarsely ground', 480, True, 20)]:
    for vn, veg in [('Mushroom', 'onion 60 chopped; mushroom 100'), ('Palak', 'onion 60 chopped; spinach 80'), ('Corn Capsicum', 'onion 60 chopped; corn 60; capsicum 40'),
                    ('Sprouts', 'onion 60 chopped; sprouts 80'), ('Tomato Peas', 'onion 60 chopped; tomato 100; peas 40'), ('Beetroot', 'onion 60 chopped; beet 80 grated')]:
        upma(f'{vn} {gn} Upma', grain, veg, f'{gn} upma with {vn.lower()}.', water=water, roast=roast, cook=cook)
for gn, grain, cook in [('Kodo Millet', 'kodo 50', 20), ('Quinoa', 'quinoa 50 rinsed', 18), ('Dalia', 'dalia 50', 15), ('Ragi', 'ragi 30', 8)]:
    for fn, top, sweet in [('Apple Cinnamon', 'apple 80; walnut 8', 'cinnamon 0.5; dates 16'), ('Banana Walnut', 'banana 80; walnut 8', 'dates 16'),
                           ('Mango', 'mango 100; almond 6', 'elaichipowder 0.3'), ('Pomegranate', 'pomegranate 40; pistachio 6', 'jaggery 10'),
                           ('Chikoo', 'chikoo 80; almond 6', 'elaichipowder 0.3')]:
        porridge(f'{fn} {gn} Porridge', grain, 'milk 300; water 100', f'Creamy {gn.lower()} porridge topped with {fn.lower()}.', sweet=sweet, top=top, cook=cook,
                 roast=gn != 'Ragi')
