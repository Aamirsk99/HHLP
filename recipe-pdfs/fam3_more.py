"""Volume 3 - salads, raitas, soups, chutneys, snacks, sweets, drinks and wraps: new combinations."""
import core
from fam_sides import salad, raita, soup, chutney, LD
from fam_snacks import tikki, tikka, sundal, chaat, airfried, steamed, TS
from fam_sweets import kheer, halwa, ladoo, drink
from fam_regional import sandwich, wrap

core.VOLUME = 3

# ---- Salads: protein base x vegetables
PB = [('Chickpea', 'chickpea 100 boiled', 'Soak the chickpeas overnight and pressure-cook until soft; cool.'),
      ('Rajma', 'rajma 100 boiled', 'Soak the rajma overnight and pressure-cook until fully soft; cool.'),
      ('Paneer', 'paneer 120 cubed', ''), ('Tofu', 'tofu 150 cubed, seared', 'Pan-sear the tofu until golden.'),
      ('Moong Sprouts', 'sprouts 150', ''), ('Quinoa', 'quinoa 70', 'Cook the quinoa in 1 cup water for 15 minutes; cool.'),
      ('Egg', 'egg 150 hard-boiled', 'Hard-boil the eggs for 10 minutes; peel and chop.'), ('Chicken', 'chicken 200 grilled, shredded', 'Grill the chicken with salt and pepper; shred.')]
VS = [('Cucumber Tomato', 'cucumber 120; tomato 80; onion 30; coriander 6', LD), ('Corn Capsicum', 'corn 80; capsicum 60; onion 30; coriander 6', LD),
      ('Beetroot Carrot', 'beet 80 grated; carrot 80 grated; mint 4', LD), ('Pomegranate Mint', 'pomegranate 60; cucumber 100; mint 6', 'lemon 15; blacksalt; jeerapowder 0.5'),
      ('Spinach Apple', 'spinach 50 baby leaves; apple 100; walnut 10', 'lemon 10; oliveoil 5; honey 5; pepper 0.3; salt')]
for pn, base, cooked in PB:
    for vn, veg, dress in VS:
        salad(f'{pn} {vn} Salad', f'{base}; {veg}', dress, f'A filling {pn.lower()} salad with {vn.lower()}.', **({'cooked': cooked} if cooked else {}))

for rn, add in [('Beetroot Mint Raita', 'beet 80 grated, steamed; mint 3'), ('Cabbage Raita', 'cabbage 80 finely shredded'), ('Broccoli Raita', 'broccoli 80 blanched, chopped'),
                ('Kakdi Pudina Pyaz Raita', 'cucumber 100; mint 4; onion 30'), ('Papaya Raita', 'papaya 120 chopped'), ('Guava Raita', 'guava 100 chopped'),
                ('Sweet Potato Raita', 'sweetpotato 120 boiled, cubed'), ('Dill Raita', 'dill 15 chopped; cucumber 60'), ('Spring Onion Raita', 'springonion 40 chopped'),
                ('Quinoa Raita', 'quinoa 40 cooked; cucumber 60'), ('Chickpea Raita', 'chickpea 60 boiled; onion 30'), ('Moong Dal Pakodi-free Sprout Raita', 'sprouts 80; carrot 40')]:
    raita(rn.replace('Moong Dal Pakodi-free ', ''), add, f'A cooling raita with {rn.replace(" Raita", "").replace("Moong Dal Pakodi-free ", "").lower()}.')

for sn, veg, kw in [('Carrot Lentil Soup', 'carrot 200; masoor 50', {'pc': True}), ('Broccoli Lentil Soup', 'broccoli 200; moong 40', {'pc': True}),
                    ('Spinach Moong Soup', 'spinach 150; moong 50', {'pc': True}), ('Pumpkin Carrot Soup', 'pumpkin 250; carrot 120', {}),
                    ('Beetroot Tomato Soup', 'beet 150; tomato 250', {}), ('Mushroom Barley-free Oats Soup', 'mushroom 200; oats 25', {}),
                    ('Cauliflower Broccoli Soup', 'cauliflower 200; broccoli 150; milk 100', {}), ('Lauki Tomato Soup', 'lauki 300; tomato 150', {}),
                    ('Sweet Potato Carrot Soup', 'sweetpotato 200; carrot 150', {}), ('Corn Mushroom Soup', 'corn 150; mushroom 150', {}),
                    ('Spinach Tomato Soup', 'spinach 150; tomato 250', {}), ('Rajma Vegetable Soup', 'rajma 60 soaked; carrot 50; tomato 100', {'pc': True, 'blend': False}),
                    ('Chicken Vegetable Soup', 'chicken 150 shredded; carrot 50; beans 40; peas 40', {'blend': False, 'mins': 10}),
                    ('Chicken Pepper Soup', 'chickencut 250; onion 50; garlic 8', {'blend': False, 'pc': True, 'spice': 'pepper 2; jeera 1; haldi 0.3; salt'}),
                    ('Fish Tomato Soup', 'fish 200; tomato 200', {'blend': False, 'mins': 10}), ('Egg Spinach Soup', 'egg 100 beaten; spinach 100', {'blend': False, 'mins': 6}),
                    ('Tofu Spinach Soup', 'tofu 120; spinach 100; ginger 5', {'blend': False, 'mins': 6}), ('Paneer Tomato Soup', 'tomato 400; paneer 60 cubed', {}),
                    ('Moong Dal Tomato Soup', 'moong 60; tomato 200', {'pc': True}), ('Mixed Vegetable Millet Soup', 'kutki 40; carrot 50; beans 40; peas 40', {'blend': False, 'mins': 18})]:
    soup(sn.replace('Barley-free ', ''), veg, f'A warming, wholesome {sn.replace("Barley-free ", "").lower()}.', **kw)

for cn, items, kw in [('Tomato Mint Chutney', 'tomato 200; mint 20; gchilli 3; garlic 3; salt; oil 4', {'cooked': 'Sauté tomatoes until soft.'}),
                      ('Carrot Coconut Chutney', 'carrot 120; coconut 50; gchilli 3; salt', {'cooked': 'Sauté the carrot for 4 minutes.'}),
                      ('Beetroot Coconut Chutney', 'beet 100 steamed; coconut 50; gchilli 3; salt', {}),
                      ('Peanut Tomato Chutney', 'peanut 50 roasted; tomato 150; redchilli 3; garlic 3; salt; oil 4', {'cooked': 'Sauté tomatoes and chillies.'}),
                      ('Coriander Mint Coconut Chutney', 'coriander 40; mint 15; coconut 50; gchilli 3; lemon 10; salt', {}),
                      ('Sesame Coconut Chutney', 'sesame 30 roasted; coconut 60; redchilli 3; tamarind 5; salt', {}),
                      ('Flax Coconut Chutney Powder', 'flax 50; coconut 50 dry; redchilli 4; garlic 4; salt', {'cooked': 'Dry-roast flax and coconut separately.', 'store': 'keeps in an airtight jar for 2 weeks.'}),
                      ('Garlic Peanut Chutney', 'peanut 80 roasted; garlic 15; chilli 2; lemon 10; salt', {}),
                      ('Onion Coconut Chutney', 'onion 100; coconut 60; redchilli 3; tamarind 5; salt; oil 4', {'cooked': 'Sauté the onion until soft.'}),
                      ('Mint Curd Dip with Garlic', 'hungcurd 200; mint 10; garlic 4; jeerapowder 0.5; salt', {'sub': 'Dip'}),
                      ('Spinach Hummus', 'chickpea 100 boiled; spinach 80 blanched; sesame 15; garlic 4; lemon 20; oliveoil 8; salt; water 30', {'sub': 'Dip', 'cooked': 'Pressure-cook soaked chickpeas until very soft.'}),
                      ('Carrot Hummus', 'chickpea 100 boiled; carrot 100 roasted; sesame 15; garlic 4; lemon 20; oliveoil 8; salt; water 30', {'sub': 'Dip', 'cooked': 'Pressure-cook chickpeas; roast carrot.'})]:
    chutney(cn, items, f'A fresh homemade {cn.lower()}.', **kw)

# ---- Snacks
for tn, mix, kw in [('Beetroot Paneer Tikki', f'beet 120 grated, squeezed; paneer 100 grated; {TS}', {'binder': 'oats 20 powdered'}),
                    ('Carrot Oats Tikki', f'carrot 150 grated; oats 60 powdered; potato 80 boiled; {TS}', {}),
                    ('Spinach Paneer Tikki', f'spinach 120 blanched, chopped; paneer 100 grated; {TS}', {'binder': 'besan 20'}),
                    ('Methi Moong Tikki', f'moong 120 soaked, ground; methi 40 chopped; {TS}', {'binder': 'ricefl 15'}),
                    ('Cabbage Oats Tikki', f'cabbage 150 grated, squeezed; oats 60 powdered; potato 60 boiled; {TS}', {}),
                    ('Mushroom Soya Tikki', f'mushroom 150 chopped, cooked dry; soyagran 40 soaked, squeezed; potato 80 boiled; {TS}', {}),
                    ('Chana Spinach Tikki', f'chickpea 100 soaked, boiled, mashed; spinach 80 blanched; {TS}', {'binder': 'besan 20'}),
                    ('Rajma Beetroot Tikki', f'rajma 100 soaked, boiled, mashed; beet 60 grated; {TS}', {'binder': 'oats 20 powdered'}),
                    ('Quinoa Spinach Tikki', f'quinoa 70 cooked; spinach 80 blanched; potato 80 boiled; {TS}', {'binder': 'besan 15'}),
                    ('Sweet Potato Corn Tikki', f'sweetpotato 200 boiled; corn 80 crushed; {TS}', {'binder': 'rajgira 20'}),
                    ('Lobia Spinach Tikki', f'lobia 100 soaked, boiled, mashed; spinach 80 blanched; {TS}', {'binder': 'besan 20'}),
                    ('Tofu Spinach Tikki', f'tofu 180 crumbled; spinach 80 blanched; {TS}', {'binder': 'oats 20 powdered'}),
                    ('Egg Spinach Cutlet', 'egg 150 hard-boiled, grated; spinach 80 blanched; potato 100 boiled; pepper 0.5; salt', {'binder': 'oats 20 powdered'}),
                    ('Fish Spinach Cutlet', 'fish 250 steamed, flaked; spinach 60 blanched; potato 100 boiled; ginger 5; pepper 1; salt', {'binder': 'oats 20 powdered'})]:
    tikki(tn, mix, f'Pan-roasted {tn.lower()}s, crisp outside and soft inside.', **kw)
for tn, main, extra in [('Paneer Malai Tikka', 'paneer 250 cubed', 'cashew 12 ground; capsicum 60'), ('Tofu Hariyali Tikka', 'tofu 280 cubed', 'coriander 20; mint 10; capsicum 60'),
                        ('Mushroom Hariyali Tikka', 'mushroom 300', 'coriander 20; mint 10; onion 60'), ('Gobi Malai Tikka', 'cauliflower 350 florets, blanched', 'cashew 12 ground; onion 60'),
                        ('Achari Mushroom Tikka', 'mushroom 300', 'saunf 2; kalonji 1; capsicum 60'), ('Paneer Tikka with Pineapple and Peppers', 'paneer 200; pineapple 100', 'capsicum 80; redcapsicum 60')]:
    tikka(tn, main, f'{tn}, grilled in an oven, air fryer or grill pan.', extra=extra)
for sn, p, txt in [('Black Chana Corn Sundal', 'kalachana 120; corn 100', 'Pressure-cook soaked chana; steam the corn.'),
                   ('Rajma Corn Sundal', 'rajma 120; corn 100', 'Pressure-cook soaked rajma until soft; steam corn.'),
                   ('Green Moong Peanut Sundal', 'gmoong 120; peanut 40', 'Cook soaked moong for 2 whistles and peanuts for 3.'),
                   ('Mango Chickpea Sundal', 'chickpea 160; rawmango 40 grated', 'Pressure-cook soaked chickpeas; grate the raw mango.')]:
    sundal(sn, p, f'{sn}, tempered with coconut and curry leaves.', txt)
for cn, base, kw in [('Moong Sprouts Corn Chaat', 'sprouts 120; corn 80', {}), ('Paneer Corn Chaat', 'paneer 100 cubed; corn 100', {}),
                     ('Chickpea Pomegranate Chaat', 'chickpea 120 boiled', {'toppings': 'onion 30; pomegranate 40; coriander 6'}),
                     ('Kala Chana Corn Chaat', 'kalachana 100 boiled; corn 80', {}), ('Quinoa Chaat', 'quinoa 70 cooked; chickpea 60 boiled', {}),
                     ('Sweet Potato Sprouts Chaat', 'sweetpotato 150 roasted; sprouts 80', {}), ('Lobia Corn Chaat', 'lobia 100 boiled; corn 80', {}),
                     ('Apple Sprouts Chaat', 'sprouts 100; apple 100', {}), ('Makhana Peanut Chaat', 'makhana 30 roasted; peanut 25', {})]:
    chaat(cn, base, f'A tangy, protein-rich {cn.lower()}.', **kw)
for an, main, kw in [('Air-fried Baby Corn Pakora', 'babycorn 250 halved', {}), ('Air-fried Spinach Corn Pakora', 'spinach 60; corn 120', {}),
                     ('Air-fried Sweet Potato Pakora', 'sweetpotato 250 thin slices', {}), ('Air-fried Paneer Tikka Bites', 'paneer 220 cubes', {'coat': 'hungcurd 40; besan 15; tandoori 3; salt'}),
                     ('Air-fried Masala Chickpeas', 'chickpea 180 boiled, dried', {'coat': 'chilli 1; chaat 1; oil 5; salt', 'mins': 15}),
                     ('Air-fried Kale-style Spinach Chips', 'spinach 100 whole leaves', {'coat': 'oil 3; chaat 0.5; salt', 'mins': 6}),
                     ('Air-fried Lauki Pakora', 'lauki 250 grated, squeezed; onion 40', {}), ('Air-fried Broccoli Bites', 'broccoli 250 florets', {}),
                     ('Air-fried Egg Pakora', 'egg 200 hard-boiled, halved', {}), ('Air-fried Chicken Tikka Bites', 'chicken 300 cubes', {'coat': 'hungcurd 40; tandoori 4; garlic 4; salt'})]:
    airfried(an.replace('Kale-style ', ''), main, f'{an.replace("Kale-style ", "")} with very little oil.', **kw)
for dn, batter, kw in [('Palak Rava Dhokla', 'rava 170; curd 200; spinach 60 puréed; ginger 5', {'rest': 20}), ('Oats Palak Dhokla', 'oats 90 powdered; rava 50; curd 150; spinach 60 puréed', {}),
                       ('Methi Rava Dhokla', 'rava 170; curd 200; methi 40 chopped; ginger 5', {'rest': 20}), ('Moong Palak Dhokla', 'moong 150 soaked, ground; spinach 60 puréed; ginger 5', {}),
                       ('Quinoa Oats Dhokla', 'quinoa 80 ground; oats 60 powdered; curd 120; ginger 5', {}), ('Ragi Oats Dhokla', 'ragi 80; oats 60 powdered; curd 150; ginger 5', {})]:
    steamed(dn, batter, f'Soft, steamed {dn.lower()}, light and high in protein.', **kw)

# ---- Sweets
for kn, base, kw in [('Foxtail Millet Kheer', 'foxtail 50 washed', {'mins': 30}), ('Quinoa Dates Kheer', 'quinoa 50 rinsed', {'sweet': 'dates 40 chopped', 'mins': 25}),
                     ('Oats Dates Kheer', 'oats 50 roasted', {'sweet': 'dates 40 chopped', 'mins': 10}), ('Ragi Dates Kheer', 'ragi 35', {'sweet': 'dates 40 chopped', 'mins': 10}),
                     ('Carrot Coconut Kheer', 'carrot 200 grated', {'liquid': 'milk 400; coconutmilk 200', 'mins': 20}),
                     ('Sweet Potato Coconut Payasam', 'sweetpotato 200 boiled, mashed', {'liquid': 'coconutmilk 300; milk 300', 'mins': 10}),
                     ('Banana Coconut Payasam', 'banana 200 ripe, mashed', {'liquid': 'coconutmilk 300; milk 200', 'sweet': 'jaggery 20', 'mins': 6}),
                     ('Apple Oats Kheer', 'oats 40 roasted; apple 120 grated, cooked', {'sweet': 'dates 30', 'mins': 10}),
                     ('Dalia Dates Kheer', 'dalia 50 roasted', {'sweet': 'dates 40 chopped', 'mins': 25}), ('Brown Rice Kheer', 'brice 50 soaked', {'mins': 40})]:
    kheer(kn, base, f'A creamy {kn.lower()}, lightly sweetened.', **kw)
for hn, base, kw in [('Oats Dates Halwa', 'oats 100', {'sweet': 'dates 60 chopped', 'roast': True, 'mins': 8}), ('Ragi Dates Halwa', 'ragi 100', {'sweet': 'dates 60 chopped', 'roast': True, 'mins': 10, 'liquid': 'water 300; milk 100'}),
                     ('Carrot Beetroot Halwa', 'carrot 300 grated; beet 200 grated', {'mins': 30}), ('Lauki Dates Halwa', 'lauki 500 grated, squeezed', {'sweet': 'dates 60 chopped', 'mins': 25}),
                     ('Quinoa Halwa', 'quinoa 100 rinsed', {'mins': 20}), ('Moong Dal Dates Halwa', 'moong 100 soaked, ground', {'sweet': 'dates 70 chopped', 'roast': True, 'mins': 20})]:
    halwa(hn, base, f'A lighter {hn.lower()} made with less ghee.', **kw)
for ln, mix, prep in [('Flax Ragi Ladoo', 'flax 60 roasted, powdered; ragi 80 roasted; jaggery 80; ghee 20', 'Roast the flax and ragi separately.'),
                      ('Oats Peanut Ladoo', 'oats 100 roasted; peanut 60 roasted; dates 120', 'Roast the oats and peanuts; blend the dates.'),
                      ('Sesame Flax Ladoo', 'sesame 60 roasted; flax 50 roasted; jaggery 100', 'Roast the seeds; melt jaggery to soft-ball stage.'),
                      ('Makhana Peanut Ladoo', 'makhana 50 roasted, powdered; peanut 60 roasted; dates 120', 'Roast and powder; blend dates.'),
                      ('Coconut Dates Oats Ladoo', 'coconut 60; oats 60 roasted; dates 150', 'Roast oats and coconut; blend dates.'),
                      ('Almond Dates Ladoo', 'almond 80; dates 180; elaichipowder 1', 'Roast and chop the almonds; blend dates.'),
                      ('Walnut Fig Ladoo', 'walnut 70; dfig 120 soaked; dates 60', 'Blend figs and dates; chop walnuts.'),
                      ('Quinoa Peanut Chikki', 'quinoa 60 popped; peanut 80 roasted; jaggery 120; ghee 5', 'Pop the quinoa in a dry pan; melt jaggery to hard-crack.')]:
    ladoo(ln, mix, f'Wholesome {ln.lower()}s with no refined sugar.', prep)

# ---- Drinks: smoothie combos
FR = [('Banana', 'banana 100'), ('Mango', 'mango 150'), ('Papaya', 'papaya 150'), ('Apple', 'apple 150'), ('Strawberry', 'strawberry 150'), ('Chikoo', 'chikoo 120')]
BASES = [('Oats', 'oats 20; milk 250'), ('Chia', 'chia 8; milk 250'), ('Curd', 'curd 200; water 60'), ('Soy Milk', 'soymilk 250'), ('Ragi', 'ragi 15 cooked; milk 250')]
for fn, f in FR:
    for bn, b in BASES:
        drink(f'{fn} {bn} Smoothie', f'{f}; {b}', f'A creamy {fn.lower()} smoothie with {bn.lower()}, no added sugar.')
for jn, items in [('Carrot Beetroot Juice', 'carrot 150; beet 100; lemon 5; water 150'), ('Apple Cucumber Juice', 'apple 150; cucumber 150; mint 4'),
                  ('Pineapple Cucumber Juice', 'pineapple 200; cucumber 120; mint 4'), ('Watermelon Lemon Juice', 'watermelon 400; lemon 10'),
                  ('Spinach Apple Juice', 'spinach 50; apple 150; lemon 5; water 150'), ('Amla Carrot Juice', 'amla 60; carrot 150; water 150'),
                  ('Lauki Mint Lemon Juice', 'lauki 250; mint 6; lemon 10'), ('Orange Carrot Ginger Juice', 'orange 250; carrot 120; ginger 5')]:
    drink(jn, items, f'A fresh, chilled {jn.lower()}.')

# ---- Sandwiches & wraps
for sn, fil in [('Paneer Corn Spinach Sandwich', 'paneer 60 grated; corn 50; spinach 40 sautéed; pepper 0.3; salt'), ('Sprouts Paneer Sandwich', 'sprouts 80; paneer 50 grated; chaat 1; salt'),
                ('Chickpea Salad Sandwich', 'chickpea 80 boiled, mashed; cucumber 40; onion 20; lemon 5; salt'), ('Egg Mayo-free Sandwich', 'egg 100 boiled, chopped; hungcurd 40; pepper 0.5; salt'),
                ('Chicken Spinach Sandwich', 'chicken 100 grilled, shredded; spinach 40 sautéed; pepper 0.5; salt'), ('Mushroom Spinach Sandwich', 'mushroom 100 sautéed; spinach 40; garlic 2; salt'),
                ('Tofu Tikka Corn Sandwich', 'tofu 100 grilled tikka; corn 40; onion 20'), ('Beetroot Hummus Sandwich', 'chickpea 60 as hummus; beet 50 grated; cucumber 40; salt')]:
    sandwich(sn.replace('Mayo-free ', ''), fil, f'A wholesome {sn.replace("Mayo-free ", "").lower()} on multigrain bread.')
for wn, fil, prep in [('Paneer Spinach Wrap', 'paneer 180 cubed; spinach 80; onion 40; garam 0.5; oil 5; salt', 'Sauté the paneer, spinach and onion with spices.'),
                      ('Chicken Tikka Salad Wrap', 'chicken 220 grilled tikka; cucumber 60; lettuce 30; hungcurd 30; salt', 'Grill the chicken tikka and slice.'),
                      ('Rajma Corn Wrap', 'rajma 100 boiled, mashed; corn 60; onion 30; jeerapowder 1; salt', 'Cook the mashed rajma with corn and spices.'),
                      ('Egg Spinach Wrap', 'egg 150; spinach 60; onion 30; pepper 0.3; salt; oil 5', 'Scramble the eggs with spinach and onion.'),
                      ('Sprouts Paneer Wrap', 'sprouts 120 steamed; paneer 80 crumbled; onion 30; chaat 1; salt', 'Toss the steamed sprouts and paneer with chaat masala.'),
                      ('Mushroom Paneer Wrap', 'mushroom 150; paneer 100; capsicum 40; oil 5; salt', 'Sauté mushrooms, paneer and capsicum with spices.')]:
    wrap(wn, fil, f'A whole-wheat {wn.lower()} for lunch or tiffin.', prep)
