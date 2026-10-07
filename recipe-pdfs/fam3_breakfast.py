"""Volume 3 - breakfast, breads, poha, upma and porridge: new flour x vegetable combinations."""
import core
from fam_breakfast import flour_chila, dal_chila, fermented_dosa, instant_idli, fermented_idli, uttapam, appe, POTATO, POTATO_TXT
from fam_breads import stuffed, mixed, bhakri, ST
from fam_porridge import poha, upma, porridge

core.VOLUME = 3

# ---- Chila: flour base x vegetable
FLOURS = [  # name prefix, batter flours, water, rest, extra note
    ('Besan', 'besan 100', 180, 10), ('Oats', 'oats 60 powdered; besan 40', 180, 15), ('Ragi', 'ragi 70; besan 30', 200, 10),
    ('Jowar', 'jowar 70; besan 30', 190, 10), ('Bajra', 'bajra 70; besan 30', 190, 10), ('Multigrain', 'mgatta 50; besan 50', 190, 10),
    ('Rava', 'rava 80; curd 60', 120, 15), ('Quinoa', 'quinoa 60 soaked and ground; besan 40', 120, 10),
]
VEGS = [  # display, batter add, chopped veg
    ('Palak', 'spinach 50 finely chopped', 'onion 40 finely chopped; gchilli 3 finely chopped'),
    ('Methi', 'methi 30 finely chopped', 'onion 40 finely chopped; gchilli 3 finely chopped'),
    ('Carrot', 'carrot 60 grated', 'onion 40 finely chopped; gchilli 3 finely chopped'),
    ('Beetroot', 'beet 50 grated', 'onion 40 finely chopped; gchilli 3 finely chopped'),
    ('Cabbage', 'cabbage 60 finely shredded', 'onion 30 finely chopped; gchilli 3 finely chopped'),
    ('Corn', 'corn 50 crushed', 'onion 30 finely chopped; capsicum 30 finely chopped; gchilli 3'),
    ('Peas', 'peas 50 crushed', 'onion 40 finely chopped; gchilli 3 finely chopped'),
    ('Mushroom', 'mushroom 60 finely chopped', 'onion 40 finely chopped; gchilli 3 finely chopped'),
    ('Capsicum', 'capsicum 60 finely chopped', 'onion 40 finely chopped; gchilli 3 finely chopped'),
    ('Lauki', 'lauki 80 grated, squeezed', 'onion 30 finely chopped; gchilli 3 finely chopped'),
    ('Tomato Onion', '', 'onion 60 finely chopped; tomato 70 deseeded, chopped; gchilli 3'),
    ('Mixed Vegetable', '', 'onion 30; tomato 30; carrot 30 grated; capsicum 30; cabbage 30; gchilli 3'),
    ('Spring Onion', 'springonion 40 chopped', 'tomato 40 chopped; gchilli 3 finely chopped'),
    ('Broccoli', 'broccoli 50 finely grated', 'onion 40 finely chopped; gchilli 3'),
    ('Paneer', '', 'onion 40 finely chopped; gchilli 3; coriander 4'),
]
for fname, flour, water, rest in FLOURS:
    for vname, vadd, chopped in VEGS:
        batter = flour + (f'; {vadd}' if vadd else '')
        kw = {}
        if vname == 'Paneer':
            kw = dict(filling='paneer 80 crumbled; capsicum 20 finely chopped; chaat 1; coriander 4',
                      fill_txt='Crumble the paneer and mix with capsicum, chaat masala and coriander.')
        name = f'{vname} {fname} Chila' if vname != 'Paneer' else f'Paneer Stuffed {fname} Chila'
        desc = (f'A wholesome {fname.lower()} chila with {vname.lower()}, quick to make and full of fibre.' if vname != 'Paneer'
                else f'A {fname.lower()} chila folded over spiced paneer, a high-protein breakfast.')
        if fname == 'Besan' and vname in ('Palak', 'Methi', 'Carrot', 'Beetroot', 'Cabbage', 'Capsicum', 'Mushroom', 'Broccoli', 'Tomato Onion', 'Mixed Vegetable', 'Spring Onion'):
            name = f'{vname} Besan Chila' if vname not in ('Tomato Onion', 'Mixed Vegetable') else name
        flour_chila(name, batter, chopped, desc, water=water, rest=rest, **kw)

# ---- Dal chila: dal x vegetable
DALS = [('Moong', 'moong 120', '4 hours'), ('Masoor', 'masoor 120', '2 hours'), ('Green Moong', 'gmoong 120', '6–8 hours'),
        ('Chana Dal', 'chanadal 120', '5 hours'), ('Mixed Dal', 'moong 40; masoor 40; chanadal 40', '4 hours')]
DV = [('Palak', 'spinach 50', 'onion 30 finely chopped; coriander 6'), ('Methi', '', 'methi 30 chopped; onion 30 finely chopped'),
      ('Carrot', '', 'carrot 60 grated; onion 30 finely chopped'), ('Beetroot', 'beet 50', 'onion 30 finely chopped; coriander 6'),
      ('Cabbage', '', 'cabbage 60 shredded; onion 30 finely chopped'), ('Corn', '', 'corn 50; capsicum 30 finely chopped'),
      ('Spring Onion', '', 'springonion 40 chopped; coriander 6'), ('Lauki', '', 'lauki 80 grated, squeezed; coriander 6')]
for dn, dspec, soak in DALS:
    for vn, vadd, extra in DV:
        dal_chila(f'{vn} {dn} Chila', dspec + (f'; {vadd}' if vadd else ''), extra,
                  f'A protein-rich {dn.lower()} chila with {vn.lower()}, no fermentation needed.', soak=soak)

# ---- Dosa: grain x style
GRAINS = [('Brown Rice', 'brice 200'), ('Red Rice', 'rrice 200'), ('Foxtail Millet', 'foxtail 200'), ('Kodo Millet', 'kodo 200'),
          ('Little Millet', 'kutki 200'), ('Barnyard Millet', 'sama 200'), ('Multigrain', 'idlirice 100; foxtail 50; kutki 50')]
for gname, grain in GRAINS:
    fermented_dosa(f'{gname} Podi Dosa', grain, f'A {gname.lower()} dosa sprinkled with spicy idli podi.', topping='podi 30; sesameoil 10',
                   top_txt='Sprinkle podi over the dosa and drizzle a few drops of sesame oil.')
    fermented_dosa(f'{gname} Onion Dosa', grain, f'A crisp {gname.lower()} dosa topped with onions.', topping='onion 120 finely chopped; gchilli 6; coriander 8',
                   top_txt='Sprinkle the onion mixture over the dosa and press lightly.')
    fermented_dosa(f'{gname} Palak Dosa', grain, f'A green {gname.lower()} dosa with spinach purée.', batter_add='spinach 100 blanched',
                   add_txt='Blend the spinach and stir it into the batter.')
    fermented_dosa(f'{gname} Paneer Dosa', grain, f'A {gname.lower()} dosa filled with spiced paneer.',
                   filling='paneer 160 crumbled; onion 60; tomato 60; haldi 0.3; pavbhaji 2; oil 6; salt; coriander 6',
                   fill_txt='Sauté onion and tomato with spices and toss in the paneer.')
    fermented_dosa(f'{gname} Masala Dosa', grain, f'A {gname.lower()} dosa with potato masala.', filling=POTATO, fill_txt=POTATO_TXT)
    fermented_dosa(f'{gname} Mushroom Dosa', grain, f'A {gname.lower()} dosa with a peppery mushroom filling.',
                   filling='mushroom 200 sliced; onion 80; garlic 8; pepper 1; oil 8; salt; coriander 6',
                   fill_txt='Sauté garlic, onion and mushrooms on high heat until dry; season with pepper.')

# ---- Idli
for gname, grain in GRAINS + [('Ragi', 'idlirice 140; ragi 140'), ('Jowar', 'idlirice 140; jowar 140')]:
    fermented_idli(f'{gname} Vegetable Idli', grain, f'Soft {gname.lower()} idlis studded with vegetables.',
                   add='carrot 50 grated; peas 40; beans 30 finely chopped; coriander 6', add_txt='Fold the vegetables into the batter.')
    fermented_idli(f'{gname} Palak Idli', grain, f'Green {gname.lower()} idlis with spinach.', add='spinach 100 blanched, puréed',
                   add_txt='Fold the spinach purée into the batter.')
for base, bname in [('oats 90 powdered; rava 60', 'Oats'), ('ragi 90; rava 80', 'Ragi'), ('dalia 120 ground; rava 40', 'Dalia'), ('jowar 100; rava 60', 'Jowar')]:
    for add, aname in [('beet 80 grated, puréed', 'Beetroot'), ('carrot 80 grated', 'Carrot'), ('corn 80 crushed', 'Corn'), ('methi 40 finely chopped', 'Methi'), ('peas 80', 'Peas')]:
        instant_idli(f'{aname} {bname} Idli', base, f'Instant {bname.lower()} idlis with {aname.lower()}.', add=add)

# ---- Uttapam
TOPS = [('Onion Tomato', 'onion 80; tomato 80; gchilli 6; coriander 8'), ('Carrot Peas', 'carrot 80 grated; peas 60; coriander 8'),
        ('Paneer Capsicum', 'paneer 100 grated; capsicum 60; coriander 8'), ('Mixed Vegetable', 'onion 50; tomato 50; carrot 50; capsicum 50; coriander 8')]
for gname, grain in GRAINS:
    for tn, top in TOPS:
        uttapam(f'{gname} {tn} Uttapam', grain, top, f'A thick {gname.lower()} uttapam topped with {tn.lower()}.')

# ---- Appe
for base, bn in [('rava 120; curd 120', 'Rava'), ('oats 80 powdered; rava 40; curd 120', 'Oats'), ('ragi 80; rava 40; curd 120', 'Ragi'),
                 ('moong 150 soaked 3 hours, ground', 'Moong Dal')]:
    for add, an in [('carrot 50 grated; onion 40; gchilli 3; coriander 6; eno 3', 'Carrot'), ('cabbage 60 shredded; onion 40; gchilli 3; eno 3', 'Cabbage'),
                    ('spinach 60 finely chopped; onion 40; gchilli 3; eno 3', 'Palak'), ('corn 70; capsicum 30; gchilli 3; eno 3', 'Corn Capsicum')]:
        appe(f'{an} {bn} Appe', base, add, f'Crisp {bn.lower()} appe with {an.lower()}, cooked with very little oil.')

# ---- Stuffed parathas on different flours
PF = [('Multigrain', 'mgatta 160'), ('Jowar', 'jowar 80; atta 80'), ('Ragi', 'ragi 60; atta 100'), ('Bajra', 'bajra 70; atta 90'), ('Oats', 'oats 50 powdered; atta 110')]
STF = [('Aloo', f'potato 250 boiled, peeled and mashed; onion 30 finely chopped; {ST}', 'Mash the potatoes smoothly and mix in the onion and spices.'),
       ('Paneer', f'paneer 150 grated; onion 30 finely chopped; {ST}', 'Mix the grated paneer with onion and spices.'),
       ('Gobi', f'cauliflower 250 finely grated; ginger 5 grated; {ST}', 'Salt the grated cauliflower, rest 10 minutes and squeeze dry; mix with spices.'),
       ('Mooli', f'mooli 300 grated; {ST}; ajwain 1', 'Squeeze the grated mooli very well and mix with the spices.'),
       ('Dal', 'chanadal 100 boiled until just soft, drained; gchilli 3; ginger 5; coriander 6; jeera 1; amchur 1; haldi 0.5; salt', 'Mash the drained chana dal and dry it in a pan for 2 minutes; add spices.'),
       ('Matar', 'peas 200 boiled and coarsely mashed; ginger 5; gchilli 3; coriander 6; jeera 1; amchur 1; garam 0.5; oil 5; salt', 'Sauté the mashed peas with ginger and spices until dry.'),
       ('Sprouts', 'sprouts 150 steamed, coarsely mashed; onion 30; gchilli 3; coriander 6; jeerapowder 1; amchur 1; salt', 'Mash the steamed sprouts with onion and spices.')]
for fn, flour in PF:
    for sn, stuffing, ptxt in STF:
        stuffed(f'{fn} {sn} Paratha', stuffing, f'{sn} paratha made with {fn.lower()} flour for extra fibre and minerals.', ptxt, flour=flour)

# ---- Theplas and mixed parathas on more flours
for fn, flour, liq in [('Multigrain', 'mgatta 140; besan 20', 'water 50'), ('Oats', 'oats 60 powdered; atta 80; besan 20', 'water 50'),
                       ('Bajra', 'bajra 80; atta 60; besan 20', 'water 60')]:
    for gn, green in [('Palak', 'spinach 80 chopped'), ('Dill', 'dill 30 chopped'), ('Bathua', 'bathua 60 chopped'), ('Coriander', 'coriander 30 chopped')]:
        mixed(f'{gn} {fn} Thepla', flour, f'{green}; curd 30; haldi 0.3; chilli 1; ajwain 1; sesame 5', f'Soft {fn.lower()} theplas with {gn.lower()}.',
              f'Chop the {gn.lower()} finely.', sub='Thepla', liquid=liq)

# ---- Bhakri variations
for fn, flour in [('Jowar', 'jowar 160'), ('Bajra', 'bajra 160'), ('Ragi', 'ragi 140'), ('Makki', 'makki 160')]:
    for an, add in [('Palak', 'spinach 60 puréed'), ('Carrot', 'carrot 50 grated; coriander 6'), ('Lauki', 'lauki 80 grated, squeezed'), ('Til', 'sesame 10')]:
        bhakri(f'{an} {fn} Roti', flour, f'{fn} roti with {an.lower()} kneaded into the dough.', add=add)

# ---- Poha & upma combinations
for vn, veg in [('Carrot Beans', 'onion 50 chopped; carrot 50; beans 40'), ('Capsicum', 'onion 50 chopped; capsicum 80'),
                ('Broccoli', 'onion 50 chopped; broccoli 80 small florets'), ('Paneer Peas', 'onion 50 chopped; paneer 60; peas 40'),
                ('Moong Sprouts', 'onion 50 chopped; sprouts 80'), ('Pomegranate Peanut', 'onion 50 chopped')]:
    for pn, base in [('Red Poha', 'rpoha 120'), ('Oats', 'oats 80; poha 40')]:
        poha(f'{vn} {pn}', base, veg, f'{pn} cooked the kanda poha way with {vn.lower()}.',
             finish='lemon 10; coriander 8' + ('; pomegranate 30' if 'Pomegranate' in vn else ''))
VU = 'onion 60 chopped; carrot 40 chopped; beans 30 chopped; peas 30'
for gn, grain, water, roast, cook in [('Foxtail Millet', 'foxtail 120', 420, False, 20), ('Kodo Millet', 'kodo 120', 420, False, 20), ('Little Millet', 'kutki 120', 420, False, 20),
                                      ('Quinoa', 'quinoa 120', 360, False, 18), ('Oats', 'oats 120', 180, True, 12), ('Dalia', 'dalia 120', 480, True, 20)]:
    for vn, veg in [('Mushroom', 'onion 60 chopped; mushroom 100'), ('Palak', 'onion 60 chopped; spinach 80'), ('Corn Capsicum', 'onion 60 chopped; corn 60; capsicum 40'),
                    ('Sprouts', 'onion 60 chopped; sprouts 80'), ('Paneer', VU + '; paneer 60 crumbled')]:
        upma(f'{vn} {gn} Upma', grain, veg, f'{gn} upma with {vn.lower()}.', water=water, roast=roast, cook=cook)

# ---- Porridges
for gn, grain, cook in [('Foxtail Millet', 'foxtail 50', 20), ('Little Millet', 'kutki 50', 20), ('Barnyard Millet', 'sama 50', 18), ('Rolled Oats', 'oats 60', 6)]:
    for fn, top, sweet in [('Apple Cinnamon', 'apple 80; walnut 8', 'cinnamon 0.5; dates 16'), ('Banana Walnut', 'banana 80; walnut 8', 'dates 16'),
                           ('Mango', 'mango 100; almond 6', 'cardamom 0.2'), ('Pomegranate', 'pomegranate 40; pistachio 6', 'jaggery 10')]:
        porridge(f'{fn} {gn} Porridge', grain, 'milk 300; water 120', f'Creamy {gn.lower()} porridge topped with {fn.lower()}.', sweet=sweet, top=top, cook=cook)
