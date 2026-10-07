"""Volume 2 - sandwiches & wraps, and regional specialities."""
import core
from fam_regional import sandwich, wrap, special

core.VOLUME = 2

for name, filling, desc, kw in [
    ('Chana Masala Sandwich', 'chickpea 100 boiled, mashed; onion 30; tomato 30; chaat 1; coriander 4; salt', 'Toasted sandwich with spiced chickpea filling.', {}),
    ('Beetroot Paneer Sandwich', 'beet 60 grated; paneer 80 grated; pepper 0.3; salt', 'A pink, protein-rich sandwich.', {}),
    ('Mushroom Pepper Sandwich', 'mushroom 120 sautéed; onion 30; pepper 1; cheese 14; salt', 'Toasted sandwich with peppery mushrooms.', {}),
    ('Avocado Egg Sandwich', 'avocado 75 mashed; egg 100 boiled, sliced; lemon 5; pepper 0.3; salt', 'Avocado and egg on multigrain bread.', {'toast': False, 'spread': 'lemon 5'}),
    ('Avocado Tomato Toast', 'avocado 100 mashed; tomato 60 sliced; lemon 5; chilliflakes 0.5; salt', 'Smashed avocado on toast with tomato.', {'toast': False, 'spread': 'lemon 5'}),
    ('Paneer Tikka Sandwich', 'paneer 100 grilled tikka; onion 30; capsicum 30', 'Grilled paneer tikka sandwich.', {}),
    ('Soya Keema Sandwich', 'soyagran 40 soaked, squeezed; onion 30; tomato 30; garam 0.5; salt', 'A high-protein soya keema sandwich.', {}),
    ('Coleslaw Sandwich (Hung Curd)', 'cabbage 60 shredded; carrot 40 grated; hungcurd 50; pepper 0.5; salt', 'Creamy coleslaw sandwich with hung curd instead of mayonnaise.', {'toast': False}),
    ('Peanut Banana Toast', 'peanut 25 ground to butter; banana 100 sliced; cinnamon 0.3', 'Homemade peanut butter and banana on toast.', {'toast': False, 'spread': 'honey 5'}),
    ('Egg Spinach Sandwich', 'egg 100 scrambled; spinach 40 sautéed; pepper 0.3; salt', 'A toasted egg and spinach sandwich.', {}),
    ('Chicken Keema Sandwich', 'chickenmince 120 cooked dry; onion 30; coriander 4; garam 0.5; salt', 'Toasted sandwich with spiced chicken keema.', {}),
    ('Tofu Spinach Sandwich', 'tofu 100 crumbled; spinach 40; garlic 2; pepper 0.3; salt', 'A vegan toasted sandwich.', {}),
    ('Sweet Corn Paneer Sandwich', 'corn 60; paneer 60 grated; capsicum 20; pepper 0.3; salt', 'A creamy corn and paneer sandwich.', {}),
    ('Rajma Sandwich', 'rajma 80 boiled, mashed; onion 30; tomato 30; jeerapowder 0.5; salt', 'Toasted sandwich with spiced mashed rajma.', {}),
]:
    sandwich(name, filling, desc, **kw)

for name, filling, desc, prep in [
    ('Paneer Bhurji Wrap', 'paneer 180 crumbled; onion 40; tomato 40; capsicum 30; haldi 0.2; pavbhaji 1; oil 5; salt', 'Wrap with spicy paneer bhurji.', 'Sauté the vegetables, add paneer and spices and cook 2 minutes.'),
    ('Chicken Seekh Wrap', 'chickenmince 250; onion 40; ginger 5; garlic 6; garam 1; coriander 6; salt; oil 5', 'Wrap with grilled chicken seekh kebabs.', 'Shape the spiced mince into logs and grill or pan-cook until done.'),
    ('Egg Bhurji Wrap', 'egg 150; onion 40; tomato 30; gchilli 3; pepper 0.3; salt; oil 5', 'Wrap with soft egg bhurji.', 'Scramble the eggs with onion, tomato and spices.'),
    ('Baked Chana Patty Wrap', 'chickpea 120 soaked, ground; onion 30; coriander 8; garlic 4; jeerapowder 1; salt; oil 6', 'Wrap with baked chickpea patties and hummus.',
     'Shape the ground chickpea mixture into small patties and bake or pan-roast until crisp.'),
    ('Mutton Seekh Wrap', 'muttonmince 250; onion 40; ginger 5; garlic 6; garam 1; mint 4; salt; oil 5', 'Wrap with grilled mutton seekh kebabs.', 'Shape the spiced mince into logs and grill until cooked through.'),
    ('Prawn Tikka Wrap', 'prawn 220; hungcurd 30; tandoori 3; lemon 5; oil 5; salt', 'Wrap with grilled prawn tikka.', 'Marinate prawns and grill 3–4 minutes.'),
    ('Sprouts Wrap', 'sprouts 150 steamed; onion 40; tomato 40; chaat 1; lemon 5; salt', 'A light wrap with spiced sprouts.', 'Toss the steamed sprouts with vegetables and chaat masala.'),
    ('Aloo Tikki Wrap', 'potato 250 boiled; peas 40; garam 1; amchur 1; salt; oil 6', 'Wrap with pan-roasted aloo tikkis.', 'Shape spiced potato into tikkis and pan-roast until crisp.'),
    ('Paneer Achari Wrap', 'paneer 200 cubed; capsicum 60; onion 40; saunf 1; kalonji 0.5; hungcurd 30; amchur 1; oil 5; salt', 'Wrap with tangy achari paneer.',
     'Toss paneer with hung curd and pickle spices and pan-sear with the vegetables.'),
    ('Chicken Shawarma-style Wrap (Lighter)', 'chicken 250 strips; hungcurd 40; garlic 6; jeerapowder 1; chilli 1; lemon 10; oil 5; salt', 'Shawarma-style chicken wrap with garlic curd sauce.',
     'Marinate chicken in curd and spices and pan-sear until cooked; make a garlic-curd sauce for the wrap.'),
    ('Soya Tikka Wrap', 'soya 80 boiled, squeezed; hungcurd 30; tandoori 3; onion 40; oil 5; salt', 'Wrap with tandoori soya chunks.', 'Marinate the soya chunks and pan-sear until charred.'),
]:
    wrap(name, filling, desc, prep)

S = special
S('Dal Bati Churma (Lighter)', 'Rajasthan', 'Baked wheat batis with dal and a lightly sweetened churma.',
  [('For the Bati', 'atta 200; rava 30; ajwain 1; ghee 20; curd 30; salt; water 80'), ('For the Dal', 'toor 60; moong 40; chanadal 40; haldi 1; salt; water 700'),
   ('For the Churma', 'atta 80 baked bati, crumbled; jaggery 40; ghee 10; elaichipowder 1; almond 10'), ('For the Tadka', 'ghee 8; jeera 2; hing; onion 60; tomato 80; chilli 1')],
  ['Bati: Knead a stiff dough, shape balls and bake at 200°C for 30 minutes.', 'Dal: Pressure-cook the dals with turmeric and salt; temper with ghee, cumin, onion and tomato.',
   'Churma: Crumble two batis, mix with jaggery, a little ghee, cardamom and almonds.', 'Serve: Serve the batis cracked open with dal and a small portion of churma.'], cook=45)
S('Rajasthani Kadhi Pakoda (Steamed)', 'Rajasthan', 'Spicy Rajasthani kadhi with steamed besan pakodas.',
  [('For the Pakodas', 'besan 60; onion 30; ajwain 0.5; chilli 0.5; salt; soda'), ('For the Kadhi', 'curd 300; besan 35; haldi 0.5; chilli 1; salt; water 500; ghee 8; jeera 1; methiseed 0.5; redchilli 2; hing')],
  ['Pakodas: Make a thick batter and steam spoonfuls in an appe mould for 10 minutes.', 'Kadhi: Whisk curd, besan, spices and water; boil, stirring, then simmer 20 minutes.',
   'Combine: Add the pakodas for the last 5 minutes.', 'Temper: Temper with ghee, cumin, methi, red chilli and hing.'])
S('Panchmel Sabzi (Rajasthani Mixed Vegetables)', 'Rajasthan', 'Five-vegetable Rajasthani dry curry.',
  'gwar 100; beans 100; carrot 80; potato 100; capsicum 80; oil 12; jeera 1; hing; chilli 1; dhania 2; amchur 2; haldi 0.3; salt',
  ['Prep: Cut all vegetables evenly.', 'Temper: Heat oil with cumin and hing.', 'Cook: Add vegetables and spices; cover and cook 15 minutes.', 'Finish: Add amchur and serve with roti.'], serves=3)
S('Kolhapuri Misal (Lighter)', 'Maharashtra', 'Extra-spicy Kolhapuri sprouts misal with a thin red rassa.',
  'mixsprouts 200; onion 100; tomato 100; coconut 30 roasted; garlic 8; ginger 8; redchilli 6; goda 6; oil 15; lemon 10; coriander 8; bread 120 whole-wheat pav; salt; water 700',
  ['Cook: Pressure-cook sprouts for 1 whistle.', 'Masala: Roast and grind coconut, onion, garlic, ginger and chillies.', 'Rassa: Cook the masala with water into a thin red curry.',
   'Serve: Pour over sprouts, top with onion and coriander, and serve with pav.'])
S('Varan Bhaat', 'Maharashtra', 'Simple Maharashtrian toor dal with rice and ghee, a comforting festival meal.',
  'toor 120; rice 150; haldi 1; hing; jaggery 5; ghee 10; lemon 10; salt; water 900',
  ['Cook: Pressure-cook the toor dal with turmeric and hing until very soft.', 'Varan: Mash smooth with salt and a little jaggery.', 'Rice: Cook the rice.',
   'Serve: Serve rice topped with varan, ghee and a squeeze of lemon.'], tags=('soft',))
S('Matki Bhel', 'Maharashtra', 'A crunchy sprouted moth bean bhel.',
  'mixsprouts 150 steamed; puffrice 20; onion 40; tomato 40; coriander 6; lemon 10; chaat 1; salt',
  ['Steam: Steam the sprouts for 4 minutes.', 'Chop: Chop the vegetables.', 'Toss: Toss everything with lemon and chaat masala.', 'Serve: Serve immediately.'], serves=2, cook=5, level='Easy')
S('Bharleli Shimla Mirchi (Besan Stuffed)', 'Maharashtra', 'Capsicums stuffed with spiced besan and peanuts.',
  'capsicum 400 small; besan 50 roasted; peanut 25 crushed; sesame 5; goda 4; chilli 1; jaggery 4; oil 10; salt',
  ['Stuffing: Mix roasted besan, peanuts, sesame, spices and jaggery.', 'Stuff: Slit capsicums and stuff.', 'Cook: Cook covered on low for 15 minutes, turning.', 'Serve: Serve with chapati.'], serves=3)
S('Khichu', 'Gujarat', 'Soft, steamed rice flour dough snack with cumin and chilli.',
  'ricefl 150; water 400; jeera 2; gchilli 3; ajwain 0.5; soda 0.3; oil 8; salt',
  ['Boil: Boil water with cumin, chilli, ajwain and salt.', 'Cook: Add rice flour and stir vigorously for 5 minutes.', 'Steam: Steam for 10 minutes.',
   'Serve: Serve hot drizzled with a little oil and sprinkled with chilli.'], serves=3, cook=20, level='Easy')
S('Gujarati Kadhi Khichdi Thali', 'Gujarat', 'Moong khichdi with sweet-sour Gujarati kadhi.',
  [('For the Khichdi', 'rice 100; moong 80; haldi 0.5; ghee 8; salt; water 700'), ('For the Kadhi', 'curd 300; besan 25; jaggery 12; ginger 5; ghee 6; mustard 2; clove 0.2; curryleaf 1; salt; water 400')],
  ['Khichdi: Pressure-cook rice and moong with turmeric and salt.', 'Kadhi: Whisk curd, besan and water and simmer with ginger and jaggery.',
   'Temper: Temper the kadhi with ghee, mustard, cloves and curry leaves.', 'Serve: Serve together with ghee.'])
S('Bajra Rotla with Lasaniya Bataka', 'Gujarat', 'Kathiawadi bajra rotla with garlicky potatoes.',
  [('For the Rotla', 'bajra 200; salt; water 160'), ('For the Potatoes', 'potato 300 baby, boiled; garlic 15; chilli 2; jaggery 3; lemon 10; oil 10; salt')],
  ['Rotla: Pat bajra dough into thick rounds and cook on a tawa.', 'Garlic masala: Grind garlic with chilli and salt.',
   'Potatoes: Sauté the masala in oil, add potatoes, jaggery and water and cook until thick.', 'Serve: Serve with lemon.'])
S('Rasawala Muthia Nu Shaak', 'Gujarat', 'Steamed methi muthia in a thin tomato curry.',
  'atta 80; besan 40; methi 80; tomato 200; oil 10; mustard 2; hing; haldi 0.5; chilli 1; jaggery 5; salt; water 400',
  ['Muthia: Make and steam methi muthia; slice.', 'Curry: Temper mustard and hing, add tomato and spices and water.', 'Simmer: Add muthia and simmer 8 minutes.', 'Serve: Serve with rice.'])
S('Sambar Sadam', 'Tamil Nadu', 'Rice and dal cooked together with sambar spices.',
  'rice 150; toor 80; drumstick 80; carrot 60; shallot 40; tomato 80; tamarind 15; sambar 10; ghee 10; mustard 2; curryleaf 1; salt; water 900',
  ['Cook: Pressure-cook rice, dal and vegetables together.', 'Spice: Add tamarind and sambar powder and simmer.', 'Temper: Temper mustard and curry leaves in ghee.', 'Serve: Serve hot.'])
S('Thakkali Kuzhambu (Tomato Gravy)', 'Tamil Nadu', 'Tangy tomato gravy for rice.',
  'tomato 300; shallot 60; tamarind 10; sambar 6; coconut 20; oil 10; mustard 2; curryleaf 1; salt; water 300',
  ['Sauté: Sauté shallots and tomatoes until mushy.', 'Spice: Add tamarind, sambar powder and ground coconut.', 'Simmer: Simmer 12 minutes.', 'Temper & serve: Temper and serve with rice.'])
S('Ragi Kali', 'Tamil Nadu', 'Soft ragi balls (kali) served with sambar or kuzhambu.',
  'ragi 150; rice 30 cooked; water 450; salt; ghee 5',
  ['Boil: Boil water with salt and the cooked rice.', 'Add ragi: Add ragi flour and stir vigorously.', 'Steam: Cover and cook on low 5 minutes.', 'Shape: Shape into balls with wet hands.'], serves=3)
S('Karnataka Bassaru', 'Karnataka', 'A thin lentil and greens broth, served with ragi mudde.',
  'toor 80; spinach 150; tomato 80; shallot 40; coconut 20; dhaniaseed 3; redchilli 3; jeera 1; tamarind 5; oil 8; mustard 2; salt; water 800',
  ['Cook: Pressure-cook dal and greens; strain the broth (bassaru) and keep the solids for palya.', 'Masala: Grind coconut with roasted spices.',
   'Simmer: Boil the broth with the masala and tamarind.', 'Temper & serve: Temper and serve with ragi mudde.'])
S('Udupi Huli', 'Karnataka', 'Udupi-style vegetable sambar with coconut.',
  'toor 100; ashgourd 150; drumstick 80; coconut 40; dhaniaseed 3; redchilli 4; methiseed 0.3; tamarind 10; jaggery 5; oil 8; mustard 2; curryleaf 1; salt; water 700',
  ['Cook: Cook the dal and vegetables.', 'Masala: Roast and grind spices with coconut.', 'Simmer: Combine with tamarind and jaggery and simmer.', 'Temper & serve: Temper and serve.'])
S('Andhra Pappu Charu', 'Andhra Pradesh', 'Thin tangy Andhra dal soup with tamarind.',
  'toor 80; tomato 100; tamarind 15; onion 40; gchilli 3; jaggery 3; oil 8; mustard 2; curryleaf 1; redchilli 2; salt; water 700',
  ['Cook: Pressure-cook the dal.', 'Charu: Boil tamarind water with tomato, onion and chillies, then add the dal.', 'Simmer: Simmer 10 minutes.', 'Temper & serve: Temper and serve with rice.'])
S('Ulava Charu (Horse Gram Soup)', 'Andhra Pradesh', 'Thick, tangy horse gram soup.',
  'kulthi 100; tamarind 15; onion 40; garlic 6; jeera 1; redchilli 3; oil 8; salt; water 900',
  ['Cook: Pressure-cook horse gram for 8 whistles; strain and keep the water.', 'Simmer: Boil the water with tamarind and spices until thick.',
   'Temper: Temper with garlic, cumin and red chilli.', 'Serve: Serve with rice.'])
S('Telangana Sarva Pindi', 'Telangana', 'A crisp, spicy rice-flour pancake with peanuts and chana dal.',
  'ricefl 150; chanadal 20 soaked; peanut 20; sesame 5; onion 40; gchilli 3; curryleaf 1; oil 12; salt; water 120',
  ['Dough: Mix all ingredients into a soft dough.', 'Pat: Pat thinly into a greased pan and poke holes.', 'Cook: Drizzle oil, cover and cook on low for 12 minutes.', 'Serve: Serve hot.'], serves=3)
S('Assamese Khar', 'Assam', 'A traditional Assamese dish of raw papaya and lentils with an alkaline flavour.',
  'papaya 200 raw; moong 60; mustardoil 8; panchphoron 1; gchilli 3; soda 0.5; salt; water 400',
  ['Cook: Cook papaya and dal with a pinch of soda and salt until soft.', 'Temper: Temper panch phoron in mustard oil.', 'Combine: Add the cooked mix and simmer 3 minutes.', 'Serve: Serve with rice.'])
S('Assamese Aloo Pitika', 'Assam', 'Mashed potato with mustard oil, onion and chilli.',
  'potato 300 boiled; onion 40; gchilli 3; coriander 6; mustardoil 8; salt',
  ['Mash: Mash the potatoes.', 'Mix: Mix in onion, chilli and coriander.', 'Season: Add raw mustard oil and salt.', 'Serve: Serve with rice and dal.'], serves=3, cook=15, level='Easy')
S('Odia Santula', 'Odisha', 'Lightly tempered Odia mixed vegetables, very low in oil.',
  'pumpkin 100; potato 100; papaya 80 raw; brinjal 80; tomato 60; milk 60; mustardoil 5; panchphoron 1; gchilli 3; haldi 0.3; salt; water 200',
  ['Cook: Boil the vegetables with turmeric and salt until soft.', 'Temper: Temper panch phoron and chilli in mustard oil.', 'Combine: Add vegetables and milk; simmer 2 minutes.', 'Serve: Serve with rice.'])
S('Odia Dahi Baigana', 'Odisha', 'Pan-roasted brinjal in a tempered curd sauce.',
  'brinjal 300; curd 250; oil 8; mustard 2; jeera 1; curryleaf 1; redchilli 2; haldi 0.3; salt',
  ['Brinjal: Pan-roast brinjal slices with turmeric and salt.', 'Curd: Whisk curd with salt.', 'Temper: Temper mustard, cumin, curry leaves and chilli; pour over curd.',
   'Serve: Add the brinjal just before serving.'], serves=3)
S('Bengali Moong Dal Khichuri with Labra', 'West Bengal', 'A festive Bengali meal of khichuri and mixed vegetables.',
  'rice 100; moong 100 roasted; cauliflower 100; potato 80; peas 50; pumpkin 100; ghee 10; jeera 1; bayleaf 0.2; ginger 8; haldi 0.5; panchphoron 1; mustardoil 5; salt; water 900',
  ['Khichuri: Cook rice and roasted moong with ginger, turmeric and vegetables.', 'Labra: Cook pumpkin and potato with panch phoron in mustard oil.',
   'Temper: Temper the khichuri with ghee, cumin and bay leaf.', 'Serve: Serve together.'])
S('Bihari Chana Ghugni', 'Bihar', 'Black chickpeas sautéed with onion, garlic and mustard oil.',
  'kalachana 200 soaked, boiled; onion 100; garlic 8; gchilli 3; mustardoil 10; jeera 1; haldi 0.5; chilli 1; salt',
  ['Temper: Heat mustard oil with cumin.', 'Sauté: Add onion, garlic and chilli.', 'Toss: Add chickpeas and spices; cook 8 minutes.', 'Serve: Serve with lemon.'])
S('Sattu Kachori (Baked)', 'Bihar', 'Whole-wheat kachoris stuffed with spicy sattu, baked not fried.',
  [('For the Dough', 'atta 200; ajwain 1; oil 10; salt; water 110'), ('For the Filling', 'sattu 100; onion 30; garlic 6; gchilli 3; lemon 10; kalonji 1; mustardoil 8; salt')],
  ['Dough: Knead a firm dough.', 'Filling: Mix the filling.', 'Shape: Stuff and flatten into kachoris.', 'Bake: Bake at 200°C for 20 minutes.'])
S('Jharkhandi Dhuska (Pan-cooked)', 'Jharkhand', 'Rice and chana dal pancakes, pan-cooked instead of fried.',
  'rice 120 soaked; chanadal 60 soaked; gchilli 3; ginger 5; jeera 1; salt; oil 10',
  ['Grind: Grind rice and dal to a thick batter.', 'Season: Add spices and rest 30 minutes.', 'Cook: Pan-cook small thick pancakes until golden.', 'Serve: Serve with ghugni.'], serves=3)
S('Chhattisgarhi Chila with Tomato Chutney', 'Chhattisgarh', 'Thin rice flour chila served with a tomato chutney.',
  'ricefl 150; water 250; onion 40; gchilli 3; salt; oil 8; tomato 150; garlic 4; redchilli 2',
  ['Batter: Mix rice flour, water, onion, chilli and salt.', 'Cook: Spread thin on a hot tawa and cook both sides.', 'Chutney: Roast tomato and chilli and crush with garlic and salt.',
   'Serve: Serve the chilas with chutney.'], serves=3)
S('Kashmiri Rajma', 'Kashmir', 'Small Kashmiri rajma cooked with fennel and dry ginger.',
  'rajma 200 soaked; mustardoil 12; hing; clove 0.2; cinnamon 1; chilli 2; sounthpowder 3; dryginger 2; tomato 100; salt; water 800',
  ['Cook: Pressure-cook rajma until soft.', 'Temper: Heat mustard oil with hing and whole spices.', 'Spice: Add tomato and spices.', 'Simmer: Add rajma and simmer 20 minutes.'])
S('Kashmiri Chaman (Paneer)', 'Kashmir', 'Paneer in a fennel-scented Kashmiri turmeric gravy.',
  'paneer 250; milk 200; mustardoil 10; clove 0.2; cardamom 0.4; sounthpowder 3; dryginger 2; haldi 1; salt; water 100',
  ['Sear: Pan-sear paneer lightly.', 'Gravy: Heat oil with whole spices, add milk, water and spices.', 'Simmer: Add paneer and simmer 8 minutes.', 'Serve: Serve with rice.'])
S('Himachali Siddu (Steamed)', 'Himachal Pradesh', 'Steamed whole-wheat buns stuffed with a walnut-poppy filling.',
  [('For the Dough', 'atta 200; curd 30; soda 1; salt; water 100'), ('For the Filling', 'walnut 40; poppy 10; onion 30; gchilli 3; coriander 6; salt')],
  ['Dough: Knead and rest 1 hour.', 'Filling: Coarsely grind walnuts and poppy seeds with the other filling ingredients.', 'Shape: Stuff and shape into oval buns.',
   'Steam: Steam 20 minutes; serve with ghee and chutney.'])
S('Garhwali Kafuli with Mandua Roti', 'Uttarakhand', 'Green leafy curry served with finger millet roti.',
  [('For the Kafuli', 'spinach 250; methi 80; ricefl 15; ghee 8; jeera 1; garlic 6; gchilli 3; salt; water 200'), ('For the Roti', 'ragi 150; salt; water 130')],
  ['Kafuli: Blanch and grind the greens; cook with tempering and rice-flour slurry.', 'Roti: Knead ragi with hot water and pat into rotis.',
   'Cook: Cook the rotis on a tawa.', 'Serve: Serve together.'])
S('Punjabi Kadhi Chawal', 'Punjab', 'Punjabi kadhi with steamed pakodas, served over rice.',
  [('For the Kadhi', 'curd 300; besan 40; haldi 0.5; chilli 0.5; salt; water 500; ghee 8; jeera 1; methiseed 0.5; redchilli 2'), ('For the Pakodas', 'besan 60; onion 40; ajwain 0.5; salt'),
   ('For the Rice', 'basmati 150; water 300')],
  ['Kadhi: Whisk and simmer the kadhi 25 minutes.', 'Pakodas: Steam spoonfuls of batter 10 minutes and add.', 'Rice: Cook the rice.', 'Temper & serve: Temper and serve over rice.'])
S('Amritsari Chole Kulche (Lighter)', 'Punjab', 'Spicy Amritsari chole with whole-wheat kulche.',
  'chickpea 180 soaked; onion 100; tomato 150; ginger 8; garlic 8; chole 5; amchur 2; tea 2.5; oil 12; atta 200; curd 50; salt; water 700',
  ['Chole: Pressure-cook chickpeas with tea and cook in onion-tomato masala.', 'Kulche: Knead atta with curd, rest and roll; cook on a tawa.', 'Simmer: Simmer chole 15 minutes.',
   'Serve: Serve with onion and lemon.'])
S('Goan Moong Gathi', 'Goa', 'Sprouted moong in a Goan coconut curry.',
  'gmoong 150 sprouted; coconut 60; redchilli 4; dhaniaseed 2; onion 60; kokum 6; oil 8; salt; water 400',
  ['Cook: Cook the sprouted moong until just soft.', 'Masala: Grind coconut with roasted spices.', 'Simmer: Combine with onion, kokum and water.', 'Serve: Serve with rice.'])
S('Goan Chicken Cafreal Rice Bowl', 'Goa', 'Green cafreal chicken served over brown rice with salad.',
  'chicken 300; coriander 40; mint 10; gchilli 6; garlic 10; ginger 8; vinegar 10; brice 150; cucumber 80; oil 8; salt; water 400',
  ['Marinate: Grind herbs, chillies, garlic, ginger and vinegar; marinate the chicken 1 hour.', 'Cook: Pan-roast until cooked.', 'Rice: Cook the brown rice.',
   'Serve: Serve chicken over rice with cucumber.'])
S('Kerala Pulissery', 'Kerala', 'Kerala curd curry with ripe mango or cucumber.',
  'cucumber 200; curd 250; coconut 50; gchilli 3; jeera 1; haldi 0.3; coconutoil 8; mustard 2; methiseed 0.3; curryleaf 1; redchilli 2; salt',
  ['Cook: Cook cucumber with turmeric and salt.', 'Paste: Grind coconut, chilli and cumin; add and simmer.', 'Curd: Add whisked curd and warm gently.', 'Temper & serve: Temper and serve.'])
S('Kerala Ishtu with Appam (Vegetable)', 'Kerala', 'Fragrant vegetable stew for Easter mornings.',
  'potato 150; carrot 80; beans 60; peas 50; onion 80; ginger 8; gchilli 6; coconutmilk 400; coconutoil 10; cinnamon 1; clove 0.2; cardamom 0.4; curryleaf 1; salt',
  ['Sauté: Sauté whole spices, onion, ginger and chillies in coconut oil.', 'Cook: Add vegetables and thin coconut milk; cook until soft.', 'Finish: Add thick coconut milk; do not boil.',
   'Serve: Serve with appam.'])
S('Mangalorean Kori Gassi (Chicken Curry)', 'Karnataka', 'Mangalorean chicken curry with roasted coconut, served with crisp rice wafers or rice.',
  'chickencut 500; coconut 80; redchilli 6; dhaniaseed 4; jeera 1; peppercorn 1; garlic 8; tamarind 10; onion 100; oil 12; salt; water 400',
  ['Masala: Roast and grind coconut with spices.', 'Cook: Sauté onion, add chicken and masala.', 'Simmer: Add water and tamarind; simmer until tender.', 'Serve: Serve with rice.'])
S('Bengali Chingri Bhapa (Steamed Prawns)', 'West Bengal', 'Prawns steamed in a mustard-coconut paste.',
  'prawn 400; kasundi 30; coconut 40; gchilli 6; curd 40; mustardoil 10; haldi 0.3; salt',
  ['Paste: Grind mustard paste, coconut, chillies and curd.', 'Coat: Coat prawns with the paste, turmeric, salt and mustard oil.', 'Steam: Steam in a covered bowl for 12 minutes.',
   'Serve: Serve with rice.'])
S('Parsi Sali Par Eedu (Lighter)', 'Parsi', 'Eggs baked over spiced potato straws, made with baked potatoes instead of fried.',
  'egg 200; potato 300 thin strips; onion 40; gchilli 3; coriander 6; oil 10; salt; pepper 0.5',
  ['Potatoes: Toss potato strips with oil and bake until crisp.', 'Layer: Spread in a pan with onion and chilli.', 'Eggs: Crack eggs on top.', 'Cook: Cover and cook until set.'])
S('Sindhi Sai Bhaji', 'Sindh', 'Sindhi spinach and chana dal stew with vegetables.',
  'spinach 300; chanadal 60; tomato 120; onion 60; carrot 60; brinjal 60; garlic 6; ginger 5; dhania 2; haldi 0.5; oil 10; salt; water 400',
  ['Cook: Pressure-cook everything for 3 whistles.', 'Mash: Mash coarsely.', 'Temper: Temper garlic in oil.', 'Serve: Serve with rice.'])
S('Sindhi Koki', 'Sindh', 'Crisp, spiced Sindhi onion flatbread.',
  'atta 200; onion 60; gchilli 3; coriander 6; jeera 1; pomegranate 0'.replace('; pomegranate 0', '') + '; ghee 15; salt; water 80',
  ['Dough: Knead a stiff dough with onion and spices.', 'Roll: Roll thick.', 'Cook: Cook slowly on a tawa with a little ghee until crisp.', 'Serve: Serve with curd.'])
S('Naga-style Vegetable Stew', 'Nagaland', 'A simple North-East vegetable stew with ginger and chilli.',
  'potato 150; beans 100; cabbage 100; carrot 80; ginger 10; garlic 6; redchilli 3; salt; water 600',
  ['Boil: Boil the vegetables with ginger, garlic and chilli.', 'Simmer: Simmer until soft.', 'Season: Season with salt.', 'Serve: Serve with rice.'])
S('Jadoh (Khasi Chicken Rice)', 'Meghalaya', 'Khasi-style rice cooked with chicken, ginger and black pepper.',
  'rrice 200; chickencut 300; onion 60; ginger 10; garlic 8; peppercorn 2; haldi 0.5; oil 8; salt; water 500',
  ['Sauté: Sauté onion, ginger and garlic.', 'Chicken: Add chicken and spices and cook 8 minutes.', 'Rice: Add rice and water.', 'Cook: Cook covered until done.'])
S('Sikkimese Greens and Tomato Soup', 'Sikkim', 'A tangy Himalayan greens and tomato soup.',
  'spinach 150; sarson 100; tomato 100; onion 40; garlic 4; gchilli 3; oil 5; salt; water 600',
  ['Sauté: Sauté onion, garlic and chilli.', 'Simmer: Add greens, tomato and water; simmer 10 minutes.', 'Season: Season with salt.', 'Serve: Serve hot.'])
