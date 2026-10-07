"""Volume 4 - salads, raitas, soups, chutneys, snacks, sweets, drinks, sandwiches & wraps, and meat-with-vegetable curries."""
import core
from fam_sides import salad, raita, soup, chutney, LD
from fam_snacks import tikki, tikka, sundal, chaat, airfried, steamed, roasted, TS
from fam_sweets import kheer, halwa, ladoo, drink
from fam_regional import sandwich, wrap
from fam_nonveg import chicken, mutton, CG, CG_TXT, MG, MG_TXT

core.VOLUME = 4

# ---- Meat with vegetables (traditional pairings)
for vn, v in [('Shalgam', 'turnip 300 cubed'), ('Lauki', 'lauki 300 cubed'), ('Arbi', 'arbi 250 boiled, peeled'), ('Gobi', 'cauliflower 250 florets'),
              ('Matar', 'peas 200'), ('Kaddu', 'pumpkin 300 cubed'), ('Tinda', 'tinda 300 quartered'), ('Bhindi', 'bhindi 250 sautéed'),
              ('Chana Dal', 'chanadal 100 soaked'), ('Kathal', 'jackfruit 250 boiled')]:
    mutton(f'Gosht {vn}', f'Homestyle mutton slow-cooked with {vn.lower()}, a classic North Indian pairing.', MG + f'; {v}', MG_TXT + f' Add the {vn.lower()} for the last 15 minutes.')
    chicken(f'Chicken {vn} Curry', f'Chicken curry cooked with {vn.lower()}.', CG + f'; {v}', CG_TXT)

# ---- Salads
PB = [('Chickpea', 'chickpea 100 boiled', 'Soak chickpeas overnight and pressure-cook until soft; cool.'), ('Rajma', 'rajma 100 boiled', 'Soak rajma overnight and cook until fully soft; cool.'),
      ('Paneer', 'paneer 120 cubed', ''), ('Tofu', 'tofu 150 cubed, seared', 'Pan-sear the tofu until golden.'), ('Moong Sprouts', 'sprouts 150', ''),
      ('Quinoa', 'quinoa 70', 'Cook quinoa in 1 cup water for 15 minutes; cool.'), ('Egg', 'egg 150 hard-boiled', 'Hard-boil the eggs; peel and chop.'),
      ('Chicken', 'chicken 200 grilled, shredded', 'Grill the chicken with salt and pepper; shred.'), ('Kala Chana', 'kalachana 100 boiled', 'Soak kala chana overnight and pressure-cook; cool.'),
      ('Lobia', 'lobia 100 boiled', 'Soak lobia 6 hours and pressure-cook for 3 whistles; cool.')]
VS = [('Cucumber Mint', 'cucumber 150; mint 6; onion 30', 'lemon 15; blacksalt; jeerapowder 0.5'), ('Carrot Cabbage', 'carrot 80 grated; cabbage 80 shredded; coriander 6', LD),
      ('Tomato Onion', 'tomato 100; onion 50; coriander 8; gchilli 3', LD), ('Lettuce Capsicum', 'lettuce 60; capsicum 60; redcapsicum 40', 'lemon 10; oliveoil 5; pepper 0.5; salt'),
      ('Mango', 'mango 100 diced; onion 30; mint 4', 'lemon 10; chilli 0.3; salt'), ('Corn Capsicum', 'corn 80; capsicum 60; onion 30; coriander 6', LD),
      ('Beetroot Carrot', 'beet 80 grated; carrot 80 grated; mint 4', LD)]
for pn, base, cooked in PB:
    for vn, veg, dress in VS:
        salad(f'{pn} {vn} Salad', f'{base}; {veg}', dress, f'A filling {pn.lower()} salad with {vn.lower()}.', **({'cooked': cooked} if cooked else {}))

for rn, add in [('Carrot Beetroot Raita', 'carrot 60 grated; beet 50 grated, steamed'), ('Cucumber Pomegranate Raita', 'cucumber 100; pomegranate 40'),
                ('Spinach Garlic Raita', 'spinach 80 blanched; garlic 3'), ('Bottle Gourd Mint Raita', 'lauki 120 grated, cooked; mint 4'),
                ('Tomato Cucumber Raita', 'tomato 60; cucumber 80'), ('Apple Pomegranate Raita', 'apple 80; pomegranate 40'), ('Corn Capsicum Raita', 'corn 60; capsicum 40'),
                ('Mushroom Raita', 'mushroom 100 sautéed'), ('Peas Raita', 'peas 80 boiled'), ('Ash Gourd Raita', 'ashgourd 120 grated, cooked')]:
    raita(rn, add, f'A cooling raita with {rn.replace(" Raita", "").lower()}.')

SV = [('Carrot', 'carrot 250'), ('Tomato', 'tomato 300'), ('Pumpkin', 'pumpkin 300'), ('Spinach', 'spinach 200'), ('Broccoli', 'broccoli 250'), ('Beetroot', 'beet 200'),
      ('Mushroom', 'mushroom 250'), ('Cauliflower', 'cauliflower 250'), ('Lauki', 'lauki 300'), ('Sweet Potato', 'sweetpotato 250')]
for (a, av), (b, bv) in [(SV[i], SV[j]) for i in range(len(SV)) for j in range(i + 1, len(SV))]:
    soup(f'{a} {b} Soup', f'{av}; {bv}', f'A smooth, warming {a.lower()} and {b.lower()} soup thickened without cream.')
for dn, d in [('Moong', 'moong 50'), ('Masoor', 'masoor 50'), ('Toor', 'toor 50')]:
    for vn, v in [('Spinach', 'spinach 120'), ('Carrot', 'carrot 150'), ('Pumpkin', 'pumpkin 200'), ('Lauki', 'lauki 200'), ('Tomato', 'tomato 200')]:
        soup(f'{vn} {dn} Dal Soup', f'{d}; {v}', f'A protein-rich {dn.lower()} dal soup with {vn.lower()}.', pc=True, spice='jeera 1; pepper 1; haldi 0.3; salt')

for cn, items, kw in [('Coconut Peanut Chutney', 'coconut 60; peanut 40 roasted; gchilli 6; salt; water 60', {'temper': 'oil 4; mustard 2; curryleaf 1'}),
                      ('Mint Coconut Chutney', 'mint 25; coconut 60; gchilli 3; lemon 10; salt; water 50', {}),
                      ('Tomato Peanut Chutney', 'tomato 200; peanut 40 roasted; redchilli 3; garlic 3; salt; oil 4', {'cooked': 'Sauté tomatoes and chillies until soft.'}),
                      ('Onion Garlic Chutney', 'onion 150; garlic 15; redchilli 4; tamarind 5; salt; oil 6', {'cooked': 'Sauté onion, garlic and chillies until golden.'}),
                      ('Beetroot Mint Chutney', 'beet 100 steamed; mint 15; lemon 10; gchilli 3; salt', {}),
                      ('Carrot Ginger Chutney', 'carrot 150; ginger 15; redchilli 3; tamarind 5; salt; oil 5', {'cooked': 'Sauté carrot and ginger for 5 minutes.'}),
                      ('Coriander Sesame Chutney', 'coriander 50; sesame 20 roasted; gchilli 3; lemon 10; salt; water 40', {}),
                      ('Capsicum Peanut Chutney', 'capsicum 150; peanut 40 roasted; redchilli 3; tamarind 5; salt; oil 5', {'cooked': 'Sauté the capsicum until soft.'}),
                      ('Garlic Sesame Podi', 'sesame 60; garlic 15; redchilli 6; urad 20; salt', {'cooked': 'Dry-roast sesame, dal and chillies; roast garlic.', 'store': 'keeps in an airtight jar for 3 weeks.'}),
                      ('Peanut Flax Podi', 'peanut 60; flax 40; redchilli 5; garlic 6; salt', {'cooked': 'Dry-roast peanuts and flax separately.', 'store': 'keeps in an airtight jar for 3 weeks.'}),
                      ('Avocado Coriander Dip', 'avocado 150; coriander 15; lemon 15; gchilli 3; garlic 2; salt', {'sub': 'Dip'}),
                      ('Beetroot Curd Dip', 'hungcurd 150; beet 80 roasted, grated; garlic 2; jeerapowder 0.5; salt', {'sub': 'Dip'}),
                      ('Spinach Curd Dip', 'hungcurd 150; spinach 80 blanched; garlic 2; pepper 0.5; salt', {'sub': 'Dip'}),
                      ('Roasted Capsicum Dip', 'redcapsicum 200 roasted; garlic 4; oliveoil 5; chilliflakes 0.5; salt', {'sub': 'Dip', 'cooked': 'Roast the peppers until charred; peel.'})]:
    chutney(cn, items, f'A fresh homemade {cn.lower()}.', **kw)

# ---- Snacks
BASES = [('Aloo', 'potato 180 boiled'), ('Oats', 'oats 70 powdered; potato 80 boiled'), ('Paneer', 'paneer 120 grated; potato 60 boiled'),
         ('Sweet Potato', 'sweetpotato 180 boiled'), ('Quinoa', 'quinoa 70 cooked; potato 80 boiled'), ('Soya', 'soyagran 50 soaked, squeezed; potato 100 boiled')]
VT = [('Spinach', 'spinach 80 blanched, chopped'), ('Beetroot', 'beet 80 grated, squeezed'), ('Carrot', 'carrot 80 grated'), ('Corn', 'corn 70 crushed'),
      ('Peas', 'peas 70 mashed'), ('Broccoli', 'broccoli 80 grated'), ('Cabbage', 'cabbage 80 grated, squeezed'), ('Mushroom', 'mushroom 100 chopped, cooked dry')]
for bn, b in BASES:
    for vn, v in VT:
        tikki(f'{vn} {bn} Tikki', f'{b}; {v}; {TS}', f'Pan-roasted {bn.lower()} and {vn.lower()} tikkis, crisp outside and soft inside.', binder='besan 20')
MAR = [('Hariyali', 'coriander 20; mint 10; spinach 20'), ('Achari', 'saunf 2; kalonji 1; methiseed 0.5'), ('Malai', 'cashew 12 ground'),
       ('Pudina', 'mint 20'), ('Lemon Pepper', 'lemon 10; peppercorn 2 crushed'), ('Kalimirch', 'peppercorn 3 crushed; cashew 8')]
for mn, main in [('Paneer', 'paneer 250 cubed'), ('Tofu', 'tofu 280 cubed'), ('Mushroom', 'mushroom 300'), ('Gobi', 'cauliflower 350 florets, blanched'),
                 ('Soya', 'soya 100 boiled, squeezed'), ('Baby Corn', 'babycorn 250'), ('Broccoli', 'broccoli 350 florets, blanched')]:
    for an, a in MAR:
        tikka(f'{an} {mn} Tikka', main, f'{mn} tikka in a {an.lower()} marinade, grilled until charred.', extra=f'{a}; capsicum 60; onion 60')
for cn, base in [('Moong Sprouts Pomegranate Chaat', 'sprouts 120; pomegranate 40'), ('Chana Corn Chaat', 'chickpea 100 boiled; corn 80'),
                 ('Rajma Corn Chaat', 'rajma 100 boiled; corn 80'), ('Paneer Sprouts Chaat', 'paneer 80; sprouts 100'), ('Black Chana Pomegranate Chaat', 'kalachana 100 boiled; pomegranate 40'),
                 ('Quinoa Sprouts Chaat', 'quinoa 60 cooked; sprouts 80'), ('Peanut Corn Chaat', 'peanut 60 boiled; corn 80'), ('Lobia Sprouts Chaat', 'lobia 80 boiled; sprouts 80'),
                 ('Makhana Corn Chaat', 'makhana 25 roasted; corn 80'), ('Sweet Potato Chickpea Chaat', 'sweetpotato 150 roasted; chickpea 80 boiled'),
                 ('Fruit Sprouts Chaat', 'sprouts 100; apple 80; papaya 80'), ('Cucumber Sprouts Chaat', 'cucumber 150; sprouts 100')]:
    chaat(cn, base, f'A tangy, protein-rich {cn.lower()}.')
for dn, batter in [('Carrot Besan Dhokla', 'besan 140; carrot 60 grated; curd 60; ginger 5; gchilli 3'), ('Corn Palak Dhokla', 'rava 150; curd 180; corn 60; spinach 40 puréed'),
                   ('Jowar Methi Dhokla', 'jowar 100; rava 50; curd 150; methi 30'), ('Bajra Dhokla', 'bajra 100; rava 50; curd 150; ginger 5'),
                   ('Moong Methi Dhokla', 'moong 150 soaked, ground; methi 30; ginger 5'), ('Oats Carrot Dhokla', 'oats 90 powdered; rava 50; curd 150; carrot 60 grated'),
                   ('Beetroot Besan Dhokla', 'besan 140; beet 60 grated; curd 60; ginger 5'), ('Quinoa Palak Dhokla', 'quinoa 120 ground; spinach 50 puréed; curd 100')]:
    steamed(dn, batter, f'Soft, steamed {dn.lower()}, light and high in protein.')
for an, main, kw in [('Air-fried Okra Kurkure', 'bhindi 300 thin strips', {'coat': 'besan 30; ricefl 10; chilli 1; amchur 1; salt'}),
                     ('Air-fried Beetroot Chips', 'beet 250 thin slices', {'coat': 'oil 4; salt; pepper 0.3', 'mins': 14}),
                     ('Air-fried Carrot Fries', 'carrot 300 batons', {'coat': 'cornflour 8; chilli 0.5; salt'}), ('Air-fried Paneer Pakora (Besan)', 'paneer 200 slices', {}),
                     ('Air-fried Aloo Methi Pakora', 'potato 150 thin slices; methi 60', {}), ('Air-fried Spinach Onion Pakora', 'spinach 60; onion 120 sliced', {}),
                     ('Air-fried Fish Amritsari Bites', 'fish 300 cubes', {'coat': 'besan 30; ricefl 10; ajwain 1; chilli 1; lemon 10; salt; water 30'}),
                     ('Air-fried Chicken Seekh Bites', 'chickenmince 300', {'coat': 'onion 30; ginger 5; garlic 5; garam 1; besan 15; salt'}),
                     ('Air-fried Cabbage Pakora', 'cabbage 200 shredded; onion 60', {}), ('Air-fried Corn Spinach Pakora', 'corn 120; spinach 50', {})]:
    airfried(an, main, f'{an} with very little oil.', **kw)
for rn, base, spice in [('Turmeric Pepper Makhana', 'makhana 60', 'haldi 0.5; pepper 1; salt'), ('Mint Chaat Makhana', 'makhana 60', 'mint 2 dried; chaat 1; salt'),
                        ('Jeera Makhana', 'makhana 60', 'jeerapowder 1; salt'), ('Masala Roasted Peanuts with Curry Leaves', 'peanut 120; curryleaf 2', 'chilli 0.5; salt'),
                        ('Chilli Garlic Roasted Chana', 'roastchana 100', 'chilli 0.5; garlic 2; salt'), ('Roasted Soya Nuts', 'soya 60 boiled, dried', 'chaat 1; chilli 0.5; salt')]:
    roasted(rn, base, f'A light, crunchy {rn.lower()} snack.', spice, mins=10, fat='ghee 4')

# ---- Sweets
for kn, base, kw in [('Rice Dates Kheer', 'rice 50 soaked', {'sweet': 'dates 40 chopped', 'mins': 30}), ('Makhana Mango Kheer', 'makhana 40 roasted', {'sweet': 'mango 120 pulp', 'mins': 12}),
                     ('Kodo Dates Kheer', 'kodo 50', {'sweet': 'dates 40 chopped', 'mins': 30}), ('Little Millet Jaggery Kheer', 'kutki 50', {'mins': 30}),
                     ('Sabudana Dates Kheer', 'sabudana 45 soaked', {'sweet': 'dates 40 chopped', 'mins': 12}), ('Seviyan Dates Kheer', 'semiya 50 roasted', {'sweet': 'dates 40 chopped', 'mins': 10}),
                     ('Lauki Coconut Kheer', 'lauki 250 grated', {'liquid': 'milk 400; coconutmilk 200', 'mins': 20}), ('Carrot Dates Kheer', 'carrot 200 grated', {'sweet': 'dates 40', 'mins': 20}),
                     ('Beetroot Dates Kheer', 'beet 180 grated', {'sweet': 'dates 40', 'mins': 20}), ('Pumpkin Coconut Kheer', 'pumpkin 250 grated', {'liquid': 'milk 400; coconutmilk 200', 'mins': 20}),
                     ('Saffron Pistachio Phirni', 'rice 40 soaked, ground', {'flav': 'saffron; elaichipowder 0.5', 'nuts': 'pistachio 15', 'mins': 15}),
                     ('Rose Phirni', 'rice 40 soaked, ground', {'flav': 'rosewater 5; elaichipowder 0.5', 'mins': 15})]:
    kheer(kn, base, f'A creamy {kn.lower()}, lightly sweetened.', **kw)
for hn, base, kw in [('Sweet Potato Dates Halwa', 'sweetpotato 400 boiled, mashed', {'sweet': 'dates 50', 'liquid': 'milk 150', 'mins': 10}),
                     ('Pumpkin Dates Halwa', 'pumpkin 500 grated', {'sweet': 'dates 60', 'mins': 25}), ('Ash Gourd Dates Halwa', 'ashgourd 500 grated, squeezed', {'sweet': 'dates 60', 'mins': 25}),
                     ('Dalia Dates Halwa', 'dalia 100', {'sweet': 'dates 60', 'roast': True, 'mins': 15, 'liquid': 'milk 300; water 150'}),
                     ('Sooji Dates Halwa', 'rava 100', {'sweet': 'dates 60', 'roast': True, 'mins': 6, 'liquid': 'milk 240; water 120'}),
                     ('Besan Dates Halwa', 'besan 100', {'sweet': 'dates 60', 'roast': True, 'mins': 6, 'fat': 'ghee 25'})]:
    halwa(hn, base, f'A {hn.lower()} sweetened with dates instead of sugar.', **kw)
for ln, mix, prep in [('Pistachio Dates Ladoo', 'pistachio 60; dates 180; coconut 20', 'Chop the pistachios; blend the dates.'),
                      ('Cashew Coconut Ladoo', 'cashew 80; coconut 60; dates 120', 'Roast cashews and coconut; blend dates.'),
                      ('Ragi Peanut Ladoo', 'ragi 100 roasted; peanut 60 roasted; jaggery 80; ghee 15', 'Roast ragi in ghee; crush peanuts.'),
                      ('Oats Sesame Ladoo', 'oats 100 roasted; sesame 40 roasted; jaggery 90', 'Roast oats and sesame; melt jaggery.'),
                      ('Chia Coconut Ladoo', 'chia 30; coconut 80; dates 150', 'Roast coconut; blend dates.'),
                      ('Pumpkin Seed Dates Ladoo', 'pumpkinseed 60 roasted; dates 160; oats 30 roasted', 'Roast seeds and oats; blend dates.'),
                      ('Sunflower Seed Ladoo', 'sunseed 70 roasted; dates 150; coconut 20', 'Roast the seeds; blend dates.'),
                      ('Roasted Chana Dates Ladoo', 'roastchana 100; dates 150; elaichipowder 1', 'Powder the roasted chana; blend dates.'),
                      ('Quinoa Dates Ladoo', 'quinoa 80 roasted, powdered; dates 160; almond 20', 'Roast quinoa; blend dates.'),
                      ('Flax Almond Ladoo', 'flax 60 roasted; almond 60; dates 150', 'Roast flax and almonds; blend dates.')]:
    ladoo(ln, mix, f'Wholesome {ln.lower()}s with no refined sugar.', prep)

FR = [('Banana', 'banana 100'), ('Mango', 'mango 150'), ('Papaya', 'papaya 150'), ('Apple', 'apple 150'), ('Strawberry', 'strawberry 150'), ('Chikoo', 'chikoo 120'),
      ('Pear', 'pear 150'), ('Guava', 'guava 120'), ('Pineapple', 'pineapple 150'), ('Kiwi', 'kiwi 120'), ('Avocado', 'avocado 100'), ('Muskmelon', 'muskmelon 180')]
BB = [('Oats', 'oats 20; milk 250'), ('Chia', 'chia 8; milk 250'), ('Curd', 'curd 200; water 60'), ('Soy Milk', 'soymilk 250'), ('Ragi', 'ragi 15 cooked; milk 250'),
      ('Coconut Water', 'coconutwater 250'), ('Dates Milk', 'dates 16; milk 250'), ('Almond', 'almond 15 soaked; milk 250'), ('Flaxseed', 'flax 7; milk 250')]
for fn, f in FR:
    for bn, b in BB:
        drink(f'{fn} {bn} Smoothie', f'{f}; {b}', f'A creamy {fn.lower()} smoothie with {bn.lower()}, no added sugar.')
for (a, av), (b, bv) in [(('Carrot', 'carrot 150'), ('Orange', 'orange 200')), (('Beetroot', 'beet 100'), ('Apple', 'apple 150')), (('Cucumber', 'cucumber 200'), ('Pineapple', 'pineapple 150')),
                         (('Spinach', 'spinach 50'), ('Pear', 'pear 150')), (('Amla', 'amla 60'), ('Apple', 'apple 150')), (('Watermelon', 'watermelon 300'), ('Mint', 'mint 6')),
                         (('Guava', 'guava 150'), ('Orange', 'orange 150')), (('Pomegranate', 'pomegranate 200'), ('Beetroot', 'beet 60')),
                         (('Muskmelon', 'muskmelon 300'), ('Mint', 'mint 5')), (('Lauki', 'lauki 250'), ('Cucumber', 'cucumber 100')), (('Tomato', 'tomato 250'), ('Carrot', 'carrot 100')),
                         (('Kiwi', 'kiwi 150'), ('Apple', 'apple 100'))]:
    drink(f'{a} {b} Cooler', f'{av}; {bv}; lemon 5; water 120; blacksalt', f'A fresh, chilled {a.lower()} and {b.lower()} drink.')
for tn, items in [('Cinnamon Ginger Tea', 'water 480; cinnamon 2; ginger 8; honey 7'), ('Saunf Mint Tea', 'water 480; saunf 4; mint 4'), ('Ajwain Ginger Water', 'water 480; ajwain 2; ginger 5'),
                  ('Jeera Dhaniya Saunf Water', 'water 500; jeera 2; dhaniaseed 2; saunf 2'), ('Lemongrass Tulsi Tea', 'water 480; lemongrass 10; herbal 1'),
                  ('Turmeric Cinnamon Milk', 'milk 400; haldi 1.5; cinnamon 0.5; jaggery 8'), ('Nutmeg Saffron Milk', 'milk 400; nutmeg; saffron; almond 8; jaggery 8'),
                  ('Cardamom Ginger Milk', 'milk 400; elaichipowder 0.5; dryginger 0.5; jaggery 8'), ('Masala Buttermilk with Ginger and Curry Leaves', 'curd 200; water 300; ginger 5; curryleaf 1; blacksalt'),
                  ('Kokum Mint Cooler', 'kokum 12 soaked; mint 5; jaggery 15; water 500')]:
    drink(tn, items, f'A soothing {tn.lower()}.', method='hot' if any(w in tn for w in ('Tea', 'Water', 'Milk')) else 'mix')

for sn, fil in [('Paneer Bhurji Multigrain Sandwich', 'paneer 100 crumbled; onion 30; tomato 30; haldi 0.2; salt'), ('Egg Avocado Sandwich', 'egg 100 boiled; avocado 60; lemon 5; salt'),
                ('Chicken Tikka Avocado Sandwich', 'chicken 100 grilled tikka; avocado 50; lettuce 20'), ('Sprouts Cucumber Sandwich', 'sprouts 80; cucumber 50; chaat 1; salt'),
                ('Hummus Beetroot Sandwich', 'chickpea 60 as hummus; beet 50 grated; lettuce 20'), ('Tofu Spinach Corn Sandwich', 'tofu 80; spinach 40; corn 40; salt'),
                ('Mushroom Corn Sandwich', 'mushroom 100 sautéed; corn 40; pepper 0.5; salt'), ('Paneer Tikka Spinach Sandwich', 'paneer 100 grilled tikka; spinach 30'),
                ('Aloo Matar Sandwich', 'potato 120 boiled; peas 40; chaat 1; salt'), ('Rajma Avocado Sandwich', 'rajma 60 mashed; avocado 50; lemon 5; salt'),
                ('Egg Bhurji Spinach Sandwich', 'egg 100 scrambled; spinach 30; pepper 0.3; salt'), ('Chicken Keema Spinach Sandwich', 'chickenmince 100 cooked; spinach 30; salt')]:
    sandwich(sn, fil, f'A wholesome {sn.lower()}.')
for wn, fil, prep in [('Paneer Corn Wrap', 'paneer 150; corn 60; capsicum 40; oil 5; salt', 'Sauté paneer, corn and capsicum with spices.'),
                      ('Chickpea Spinach Wrap', 'chickpea 120 boiled; spinach 60; onion 30; chaat 1; salt', 'Toss chickpeas with spinach and spices.'),
                      ('Egg Paneer Wrap', 'egg 100; paneer 60; onion 30; pepper 0.3; salt; oil 5', 'Scramble eggs with paneer and onion.'),
                      ('Chicken Hariyali Wrap', 'chicken 220; coriander 20; mint 10; hungcurd 30; oil 5; salt', 'Marinate chicken in green chutney and pan-sear.'),
                      ('Soya Corn Wrap', 'soyagran 60 soaked; corn 60; onion 30; garam 1; salt; oil 5', 'Cook soya granules with corn and spices.'),
                      ('Tofu Corn Wrap', 'tofu 180; corn 60; capsicum 40; oil 5; salt', 'Sauté tofu with corn and capsicum.'),
                      ('Fish Hariyali Wrap', 'fish 220; coriander 20; mint 10; lemon 10; oil 5; salt', 'Marinate fish in green chutney and pan-sear.'),
                      ('Mixed Sprouts Wrap', 'mixsprouts 150 steamed; onion 30; tomato 30; chaat 1; salt', 'Toss sprouts with vegetables and chaat masala.')]:
    wrap(wn, fil, f'A whole-wheat {wn.lower()} for lunch or tiffin.', prep)
