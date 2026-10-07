"""Volume 2 - pulao, flavoured rice, khichdi, biryani and fried rice."""
import core
from fam_rice import pulao, flavoured, khichdi, biryani, fried_rice, MAR

core.VOLUME = 2

BR = 'Pressure-cook for 3 whistles on medium flame, or simmer covered for 35–40 minutes until tender.'
for name, grain, add, desc, kw in [
    ('Carrot Pulao', 'basmati 200', 'carrot 150 grated; peas 50', 'Basmati rice with grated carrot.', {}),
    ('Capsicum Pulao', 'basmati 200', 'capsicum 150 diced; redcapsicum 60', 'Pulao with colourful capsicum.', {}),
    ('Cauliflower Pulao', 'basmati 200', 'cauliflower 200 small florets; peas 50', 'Pulao with cauliflower and peas.', {}),
    ('Cabbage Peas Pulao', 'basmati 200', 'cabbage 150 shredded; peas 60', 'Pulao with cabbage and peas.', {}),
    ('Lobia Pulao', 'basmati 180', 'lobia 70 soaked, boiled; tomato 60', 'Basmati rice cooked with black-eyed beans.', {}),
    ('Moong Sprouts Pulao', 'basmati 180', 'sprouts 150', 'Pulao with moong sprouts for protein.', {}),
    ('Kala Chana Pulao', 'basmati 180', 'kalachana 80 soaked, boiled', 'Pulao with black chickpeas.', {}),
    ('Tofu Pulao', 'basmati 200', 'tofu 150 cubed; peas 60', 'Pulao with tofu for vegan protein.', {}),
    ('Spinach Corn Pulao', 'basmati 200', 'spinach 150 puréed; corn 80', 'Green pulao with spinach and corn.', {'water': 320}),
    ('Brown Rice Peas Pulao', 'brice 200', 'peas 150', 'Brown rice pulao with peas.', {'soak': 60, 'water': 520, 'cook_txt': BR}),
    ('Brown Rice Mushroom Pulao', 'brice 200', 'mushroom 200 sliced', 'Brown rice pulao with mushrooms.', {'soak': 60, 'water': 520, 'cook_txt': BR}),
    ('Little Millet Pulao', 'kutki 200', 'carrot 60; beans 50; peas 60', 'Pulao made with little millet.', {'soak': 30, 'water': 440}),
    ('Barnyard Millet Pulao', 'sama 200', 'carrot 60; beans 50; peas 60', 'Pulao made with barnyard millet.', {'soak': 30, 'water': 440}),
    ('Chicken Pulao', 'basmati 200', 'chicken 250 cubed; curd 60', 'A one-pot chicken pulao with whole spices.', {'add_txt': 'Add the chicken and curd and cook for 6 minutes before adding the rice.'}),
    ('Keema Pulao', 'basmati 200', 'muttonmince 200; peas 60', 'Pulao with spiced mutton keema and peas.', {'add_txt': 'Add the keema and cook for 10 minutes until browned and cooked.'}),
    ('Fish Pulao', 'basmati 200', 'fish 250 cubed; haldi 0.5; chilli 1', 'Coastal pulao with gently spiced fish.', {'add_txt': 'Sear the spiced fish separately and fold it in after the rice is cooked.'}),
    ('Navratan Pulao', 'basmati 200', 'carrot 50; beans 40; peas 40; corn 40; paneer 50; pineapple 40; cashew 8; almond 8; raisin 9', 'A festive nine-jewel pulao.', {}),
    ('Masoor Pulao', 'basmati 180', 'wmasoor 70 soaked; tomato 60', 'Pulao with whole masoor.', {}),
    ('Green Moong Pulao', 'basmati 180', 'gmoong 70 soaked 4 hours', 'Pulao with whole green moong.', {}),
    ('Mixed Sprouts Pulao', 'basmati 180', 'mixsprouts 150', 'Pulao with mixed sprouts.', {}),
    ('Jackfruit Pulao', 'basmati 200', 'jackfruit 250 cubed, boiled', 'Pulao with raw jackfruit.', {}),
    ('Broccoli Pulao', 'basmati 200', 'broccoli 200 small florets', 'Pulao with broccoli.', {}),
]:
    pulao(name, grain, add, desc, **kw)

for name, add, desc, mid, kw in [
    ('Mint Rice', 'mint 30 ground; gchilli 3; ginger 5', 'Fragrant mint-flavoured rice.', ['Season: Add the mint paste and sauté for 2 minutes.'], {}),
    ('Ginger Rice', 'ginger 25 grated; gchilli 3; lemon 10', 'A zingy ginger-lemon rice.', ['Season: Add the ginger and chilli and sauté 1 minute; add lemon off the heat.'], {}),
    ('Garlic Rice', 'garlic 25 chopped; pepper 1', 'Rice tossed with golden garlic.', ['Season: Fry the garlic until golden and add pepper.'], {}),
    ('Coriander Lemon Rice', 'coriander 40 ground; lemon 25; haldi 0.3', 'Green rice with coriander and lemon.', ['Season: Add the coriander paste and turmeric; add lemon off the heat.'], {}),
    ('Carrot Rice', 'carrot 150 grated; vangibath 8', 'Spiced carrot rice, a lunch-box favourite.', ['Cook the carrot: Sauté the carrot until soft and add the spice powder.'], {}),
    ('Beetroot Rice', 'beet 150 grated; vangibath 8', 'Pink spiced beetroot rice.', ['Cook the beetroot: Sauté the beetroot until soft and add the spice powder.'], {}),
    ('Cabbage Rice', 'cabbage 150 shredded; pepper 1', 'Rice with stir-fried cabbage.', ['Cook the cabbage: Sauté until just tender.'], {}),
    ('Methi Rice', 'methi 80 chopped; onion 50', 'Rice with fresh methi leaves.', ['Cook the methi: Sauté onion and methi for 3 minutes.'], {}),
    ('Raw Mango Peanut Rice', 'rawmango 100 grated; haldi 0.3; gchilli 3', 'Tangy raw mango rice with extra peanuts.', ['Cook the mango: Sauté the mango for 3 minutes.'], {}),
    ('Sesame Brown Rice', 'sesame 30 roasted, powdered; redchilli 2', 'Brown rice with roasted sesame powder.', ['Add the sesame: Stir in the sesame powder off the heat.'], {'rice': 'brice 200'}),
    ('Coconut Millet Rice', 'coconut 70; cashew 10; gchilli 3', 'Foxtail millet tossed with coconut.', ['Toast the coconut: Sauté the coconut for 2 minutes.'], {'rice': 'foxtail 200'}),
    ('Tamarind Millet Rice', 'tamarind 40; jaggery 8; puliyogare 15', 'Tangy tamarind-flavoured millet.', ['Make the paste: Simmer tamarind, jaggery and puliyogare powder until thick.'], {'rice': 'kutki 200'}),
    ('Tomato Millet Rice', 'onion 80; tomato 250; chilli 1.5; garam 1', 'Spicy tomato millet rice.', ['Cook the masala: Sauté onion and tomato with spices until thick.'], {'rice': 'foxtail 200'}),
    ('Curry Leaf Rice (Karuveppilai Sadam)', 'curryleaf 8 roasted, ground with urad and chilli; pepper 1', 'Rice with a roasted curry-leaf powder.', ['Add the powder: Stir in the curry leaf powder off the heat.'], {}),
    ('Pudina Sadam', 'mint 30; coriander 15; gchilli 3; onion 60', 'Tamil-style mint rice.', ['Cook: Sauté onion, then the ground mint-coriander paste, for 3 minutes.'], {}),
    ('Capsicum Peanut Rice', 'capsicum 150; peanut 30 roasted; vangibath 8', 'Rice with capsicum and peanuts.', ['Cook the capsicum: Sauté the capsicum and add the spice powder.'], {}),
]:
    flavoured(name, add, desc, mid, **kw)

for name, grains, desc, kw in [
    ('Moong Masoor Khichdi', 'rice 100; moong 50; masoor 50', 'Khichdi with two dals.', {}),
    ('Chana Dal Khichdi', 'rice 100; chanadal 80', 'Khichdi with chana dal.', {'veg': 'tomato 60; carrot 50', 'whistles': '4–5'}),
    ('Methi Khichdi', 'rice 100; moong 100', 'Moong dal khichdi with methi.', {'veg': 'methi 60 chopped'}),
    ('Lauki Khichdi', 'rice 100; moong 100', 'Light khichdi with bottle gourd.', {'veg': 'lauki 200'}),
    ('Barnyard Moong Khichdi', 'sama 100; moong 80', 'Barnyard millet and moong khichdi.', {'veg': 'carrot 50; peas 50'}),
    ('Kodo Millet Khichdi', 'kodo 100; moong 80', 'Kodo millet and moong khichdi.', {'veg': 'carrot 50; peas 50; beans 40'}),
    ('Little Millet Khichdi', 'kutki 100; moong 80', 'Little millet khichdi.', {'veg': 'carrot 50; peas 50'}),
    ('Brown Rice Khichdi', 'brice 100; moong 100', 'Brown rice and moong khichdi.', {'veg': 'carrot 50; peas 50', 'whistles': '5'}),
    ('Masala Khichdi', 'rice 100; toor 80', 'Spicy masala khichdi with vegetables.', {'veg': 'onion 60; tomato 60; potato 60; peas 50', 'temper': 'jeera 2; hing; ginger 5; gchilli 3; chilli 1; garam 1'}),
    ('Tomato Khichdi', 'rice 100; moong 80', 'Tangy tomato khichdi.', {'veg': 'tomato 150; onion 50'}),
    ('Pumpkin Khichdi', 'rice 100; moong 80', 'Khichdi with sweet pumpkin.', {'veg': 'pumpkin 200'}),
    ('Spinach Masoor Khichdi', 'rice 100; masoor 80', 'Masoor khichdi with spinach.', {'veg': 'spinach 120; tomato 60'}),
]:
    khichdi(name, grains, desc, **kw)

biryani('Tofu Biryani', 'tofu 300 cubed; peas 60', MAR, 'Vegan-friendly biryani with spiced tofu.', mins=15)
biryani('Chana Biryani', 'chickpea 150 soaked, boiled; potato 100', MAR, 'Biryani with chickpeas and potato.', mins=15)
biryani('Rajma Biryani', 'rajma 150 soaked, boiled', MAR, 'Biryani with kidney beans.', mins=15)
biryani('Mutton Keema Biryani', 'muttonmince 400; peas 80', MAR, 'Biryani layered with spiced mutton keema.', cook_main_txt='Cook the keema with the onions and marinade for 15 minutes until done.', mins=20)
biryani('Kolkata Chicken Biryani (Lighter)', 'chickencut 500; potato 200 halved; egg 100 boiled', MAR, 'Kolkata-style biryani with potato and egg.',
        marinate_txt='Marinate the chicken for 1 hour; par-boil the potatoes with turmeric.', mins=25)
biryani('Malabar Chicken Biryani', 'chickencut 600; tomato 100', MAR + '; saunf 1', 'Kerala Malabar biryani with fennel and fried onions.',
        marinate_txt='Marinate the chicken for 1 hour.', mins=25)
biryani('Chicken Tikka Biryani', 'chicken 500 cubed', MAR + '; tandoori 4', 'Biryani layered with grilled chicken tikka.',
        marinate_txt='Marinate the chicken and grill or pan-sear until charred.', cook_main_txt='Toss the grilled tikka in the onion masala for 3 minutes.', mins=20)
biryani('Brown Rice Vegetable Biryani', 'carrot 100; beans 80; peas 80; cauliflower 100; paneer 80', MAR, 'Vegetable biryani with brown rice.', rice='brice 280', mins=25)
biryani('Quinoa Vegetable Biryani', 'carrot 100; beans 80; peas 80; cauliflower 100', MAR, 'A protein-rich biryani made with quinoa.', rice='quinoa 250', mins=15)
biryani('Mixed Sprouts Biryani', 'mixsprouts 250; potato 100', MAR, 'Biryani with mixed sprouts.', mins=15)
biryani('Egg Brown Rice Biryani', 'egg 300 hard-boiled', MAR, 'Egg biryani made with brown rice.', rice='brice 280',
        marinate_txt='Prick the eggs and coat with marinade.', cook_main_txt='Cook the marinade with onions until thick and toss in the eggs.', mins=25)
biryani('Prawn Dum Biryani (Coastal)', 'prawn 450; coconutmilk 100', MAR, 'Coastal prawn biryani with a touch of coconut milk.',
        cook_main_txt='Cook the prawns in the onion masala with coconut milk for 3 minutes.', mins=15)

fried_rice('Corn Capsicum Fried Rice', 'corn 80; redcapsicum 40', 'Fried rice with sweet corn and peppers.')
fried_rice('Burnt Garlic Fried Rice', 'garlic 15 browned', 'Fried rice with deep-golden garlic.')
fried_rice('Chilli Garlic Fried Rice', 'garlic 10; chilliflakes 2', 'Spicy chilli garlic fried rice.')
fried_rice('Quinoa Fried Rice', 'peas 40; corn 40', 'Fried "rice" made with quinoa.', rice='quinoa 180')
fried_rice('Soya Fried Rice', 'soya 50 boiled, squeezed, chopped', 'Fried rice with soya chunks.')
fried_rice('Broccoli Fried Rice', 'broccoli 120 small florets', 'Fried rice with broccoli.')
fried_rice('Chicken Schezwan Fried Rice (Lighter)', 'chicken 180 diced, cooked; chilliflakes 3; tomato 40 puréed', 'Spicy schezwan fried rice with chicken.')
fried_rice('Fish Fried Rice', 'fish 180 cubed, seared', 'Fried rice with seared fish.')
fried_rice('Paneer Schezwan Fried Rice (Lighter)', 'paneer 120 diced; chilliflakes 3; tomato 40 puréed', 'Spicy schezwan fried rice with paneer.')
fried_rice('Kodo Millet Fried Rice', 'peas 40; corn 40', 'Fried rice made with kodo millet.', rice='kodo 200')
