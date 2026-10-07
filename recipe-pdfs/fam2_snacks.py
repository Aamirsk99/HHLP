"""Volume 2 - snacks & starters."""
import core
from fam_snacks import steamed, muthia, tikki, tikka, sundal, roasted, chaat, airfried, TS

core.VOLUME = 2

for name, mix, desc, kw in [
    ('Spinach Corn Tikki', f'spinach 120 blanched, chopped; corn 100 crushed; potato 120 boiled; {TS}', 'Green tikkis with spinach and corn.', {'binder': 'oats 25 powdered'}),
    ('Broccoli Tikki', f'broccoli 150 finely grated; potato 120 boiled; paneer 40; {TS}', 'Crisp broccoli and potato tikkis.', {'binder': 'oats 25 powdered'}),
    ('Carrot Tikki', f'carrot 180 grated; potato 120 boiled; {TS}', 'Sweet carrot tikkis.', {'binder': 'besan 20'}),
    ('Mixed Dal Tikki', f'moong 60 soaked; chanadal 60 soaked; onion 40; {TS}', 'Crisp tikkis from coarsely ground mixed dals.', {'binder': 'ricefl 15'}),
    ('Lobia Tikki', f'lobia 100 soaked, boiled, mashed; onion 40; {TS}', 'Black-eyed bean patties.', {'binder': 'besan 20'}),
    ('Kala Chana Tikki', f'kalachana 100 soaked, boiled, mashed; onion 40; {TS}', 'Iron-rich black chickpea patties.', {'binder': 'besan 20'}),
    ('Sprouts Tikki', f'sprouts 150 steamed, mashed; potato 100 boiled; {TS}', 'Patties of moong sprouts and potato.', {'binder': 'oats 20 powdered'}),
    ('Paneer Corn Tikki', f'paneer 120 grated; corn 80 crushed; potato 80 boiled; {TS}', 'Paneer and corn patties.', {'binder': 'cornflour 8'}),
    ('Oats Paneer Tikki', f'oats 60 powdered; paneer 120 grated; carrot 40 grated; {TS}', 'High-protein oats and paneer patties.', {}),
    ('Matar Tikki', f'peas 200 boiled, mashed; potato 100 boiled; {TS}', 'Green pea patties with ginger and chilli.', {'binder': 'besan 15'}),
    ('Mushroom Tikki', f'mushroom 250 finely chopped, cooked dry; potato 120 boiled; {TS}', 'Mushroom and potato patties.', {'binder': 'oats 25 powdered'}),
    ('Raw Banana Tikki', f'rawbanana 250 boiled, mashed; {TS}', 'Raw banana patties with spices.', {'binder': 'rajgira 20'}),
    ('Arbi Tikki', f'arbi 250 boiled, mashed; {TS}; ajwain 1', 'Colocasia patties with ajwain.', {'binder': 'ricefl 20'}),
    ('Suran Tikki', f'suran 250 boiled, mashed; {TS}', 'Elephant yam patties, crisp outside.', {'binder': 'ricefl 20'}),
    ('Pumpkin Tikki', f'pumpkin 250 grated, cooked dry; potato 100 boiled; {TS}', 'Pumpkin and potato patties.', {'binder': 'besan 20'}),
    ('Quinoa Beetroot Tikki', f'quinoa 70 cooked; beet 100 grated; potato 80 boiled; {TS}', 'Pink quinoa and beetroot patties.', {'binder': 'besan 15'}),
    ('Millet Vegetable Tikki', f'foxtail 70 cooked; potato 100 boiled; carrot 40; peas 30; {TS}', 'Foxtail millet and vegetable patties.', {'binder': 'besan 20'}),
    ('Soya Paneer Tikki', f'soyagran 50 soaked, squeezed; paneer 80 grated; potato 80 boiled; {TS}', 'Very high-protein soya and paneer patties.', {'binder': 'besan 15'}),
    ('Prawn Cutlet', 'prawn 250 minced; potato 120 boiled; onion 40; ginger 5; garlic 6; gchilli 3; pepper 1; coriander 6; salt', 'Coastal prawn cutlets.', {'binder': 'oats 25 powdered'}),
    ('Mutton Cutlet', 'muttonmince 250; potato 120 boiled; onion 40; ginger 5; garlic 6; garam 1; coriander 6; salt', 'Spiced mutton mince cutlets.',
     {'binder': 'oats 25 powdered', 'prep_txt': 'Cook the mutton mince with ginger, garlic and spices until dry and tender; cool.'}),
    ('Chicken Spinach Cutlet', 'chickenmince 250; spinach 80 blanched, chopped; potato 80 boiled; garlic 6; garam 1; salt', 'Chicken and spinach cutlets.',
     {'binder': 'oats 20 powdered', 'prep_txt': 'Cook the chicken mince until dry and fully cooked; cool.'}),
    ('Jackfruit Cutlet', f'jackfruit 250 boiled, mashed; potato 80 boiled; {TS}', 'Raw jackfruit cutlets with a meaty texture.', {'binder': 'oats 25 powdered'}),
    ('Chicken Tikki with Oats', 'chickenmince 300; oats 40 powdered; onion 40; ginger 5; garlic 6; mint 4; garam 1; salt', 'Juicy chicken and oats patties.',
     {'prep_txt': 'Mix the raw chicken mince with all ingredients; it cooks through in the pan.'}),
    ('Fish Tikki (Bengali Macher Chop, Pan-roasted)', 'fish 250 steamed, flaked; potato 150 boiled; onion 40; ginger 5; gchilli 3; garam 1; salt', 'Bengali fish chops, pan-roasted.',
     {'binder': 'oats 20 powdered'}),
    ('Dahi Kebab (Pan-roasted)', 'hungcurd 200; paneer 60; besan 30 roasted; onion 30; gchilli 3; coriander 6; garam 0.5; salt', 'Creamy hung-curd kebabs, pan-roasted.', {}),
]:
    tikki(name, mix, desc, **kw)

for name, main, desc, kw in [
    ('Paneer Hariyali Tikka', 'paneer 250 cubed', 'Paneer tikka in a green mint-coriander marinade.', {'extra': 'capsicum 80; onion 80; coriander 20; mint 10'}),
    ('Paneer Pudina Tikka', 'paneer 250 cubed', 'Mint-marinated paneer tikka.', {'extra': 'mint 20; capsicum 80; onion 60'}),
    ('Mushroom Malai Tikka', 'mushroom 300 whole', 'Creamy, mild mushroom tikka.', {'extra': 'cashew 12 ground; capsicum 60'}),
    ('Achari Tofu Tikka', 'tofu 280 cubed', 'Tofu tikka with pickle spices.', {'extra': 'saunf 2; kalonji 1; capsicum 80'}),
    ('Broccoli Malai Tikka', 'broccoli 350 florets, blanched', 'Broccoli in a creamy tikka marinade.', {'extra': 'cashew 12 ground; onion 60'}),
    ('Sweet Potato Tikka', 'sweetpotato 350 cubed, par-boiled', 'Charred sweet potato tikka.', {'extra': 'onion 80'}),
    ('Pineapple Paneer Tikka', 'paneer 200 cubed; pineapple 120 cubed', 'Paneer and pineapple tikka, sweet and smoky.', {'extra': 'capsicum 80; onion 60'}),
    ('Tandoori Mixed Vegetables', 'cauliflower 150; capsicum 100; onion 80; mushroom 100; babycorn 80', 'Assorted vegetables in a tandoori marinade.', {'extra': 'tomato 60'}),
    ('Achari Soya Tikka', 'soya 100 boiled, squeezed', 'Soya chunks tikka with pickle spices.', {'extra': 'saunf 2; kalonji 1; capsicum 80; onion 80'}),
    ('Tandoori Mushroom Capsicum', 'mushroom 250; capsicum 150', 'Mushrooms and capsicum, tandoori style.', {'extra': 'onion 80'}),
]:
    tikka(name, main, desc, **kw)

sundal('Matki Sundal', 'moth 180', 'Moth bean sundal with coconut.', 'Soak 6 hours and pressure-cook for 1–2 whistles.')
sundal('Kollu Sundal', 'kulthi 160', 'Horse gram sundal, rich in iron.', 'Soak overnight and pressure-cook for 6 whistles.')
sundal('Double Beans Sundal', 'rajmabeans 180', 'Lima bean sundal.', 'Soak overnight and pressure-cook for 4 whistles.')
sundal('Mixed Sprouts Sundal', 'mixsprouts 250', 'Mixed sprouts tempered South Indian style.', 'Steam the sprouts for 6 minutes.')
sundal('Pattani Sundal (White Peas)', 'whitepeas 180', 'White peas sundal, a Navratri favourite.', 'Soak overnight and pressure-cook for 5 whistles.')
sundal('Chana Dal Sundal', 'chanadal 150', 'Chana dal sundal.', 'Soak 2 hours and cook until just soft, not mushy.')
sundal('Peanut Corn Sundal', 'peanut 80 raw; corn 150', 'Peanuts and sweet corn sundal.', 'Pressure-cook peanuts for 3 whistles; steam the corn.')

roasted('Garlic Makhana', 'makhana 60', 'Makhana roasted with garlic and pepper.', 'garlic 3 powdered; pepper 0.5; salt')
roasted('Tandoori Makhana', 'makhana 60', 'Makhana with tandoori spices.', 'tandoori 2; chaat 0.5; salt')
roasted('Chaat Masala Makhana', 'makhana 60', 'Tangy chaat masala makhana.', 'chaat 2; amchur 0.5; blacksalt')
roasted('Roasted Moong Dal Namkeen', 'moong 100 soaked 4 hours, drained and dried', 'Crunchy roasted moong dal, a lighter version of fried namkeen.',
        'haldi 0.3; chilli 0.5; chaat 1; salt', mins=20, fat='oil 6')
roasted('Masala Roasted Almonds', 'almond 120', 'Almonds roasted with a light spice coating.', 'chilli 0.5; chaat 1; salt', mins=8, fat='oil 2')
roasted('Masala Roasted Cashews', 'cashew 100', 'Cashews dry-roasted with pepper and salt.', 'pepper 1; salt', mins=8, fat='ghee 3')
roasted('Roasted Pumpkin Seeds', 'pumpkinseed 100', 'Crunchy roasted pumpkin seeds.', 'chilli 0.3; salt', mins=6, fat='oil 2')
roasted('Roasted Sunflower Seed Mix', 'sunseed 60; pumpkinseed 40; melonseed 20', 'A roasted seed trail mix.', 'chaat 0.5; salt', mins=6, fat='oil 2')
roasted('Roasted Chana Peanut Mix', 'roastchana 70; peanut 50; curryleaf 1', 'A protein-rich crunchy mix.', 'haldi 0.3; chilli 0.5; salt', mins=6, fat='oil 4')
roasted('Puffed Rice Peanut Mix (Kurmura)', 'puffrice 50; peanut 30; roastchana 20; curryleaf 1', 'A light murmura and peanut mix.', 'haldi 0.3; salt', mins=6, fat='oil 5')

for name, base, desc, kw in [
    ('Moong Chaat', 'gmoong 120 boiled', 'Boiled green moong tossed with vegetables and spices.', {}),
    ('Kala Chana Chaat', 'kalachana 120 boiled', 'Black chickpea chaat with lemon.', {}),
    ('Lobia Chaat', 'lobia 120 boiled', 'Black-eyed bean chaat.', {}),
    ('Corn Peanut Chaat', 'corn 150 boiled; peanut 25 roasted', 'Sweet corn and peanut chaat.', {}),
    ('Dahi Aloo Chaat', 'potato 200 boiled, cubed; curd 120 whisked', 'Potato chaat with whisked curd.', {'chutneys': 'tamarind 5; mint 5'}),
    ('Sweet Potato Chana Chaat', 'sweetpotato 150 roasted; chickpea 80 boiled', 'Sweet potato and chickpea chaat.', {}),
    ('Fruit Paneer Chaat', 'paneer 100 cubed; apple 80; pomegranate 30; guava 80', 'Fruit and paneer chaat.', {'toppings': 'mint 4'}),
    ('Rajma Chaat', 'rajma 120 boiled', 'Kidney bean chaat with onion and lemon.', {}),
    ('Tofu Chaat', 'tofu 180 cubed, seared', 'Seared tofu tossed with vegetables and chaat masala.', {}),
    ('Beetroot Chaat', 'beet 200 boiled, cubed; peanut 15', 'Beetroot chaat with lemon and spices.', {}),
    ('Cucumber Chaat', 'cucumber 300 diced; peanut 15 crushed', 'A cooling cucumber chaat.', {'toppings': 'onion 30; coriander 6; mint 3'}),
    ('Guava Chaat', 'guava 300 diced', 'Guava with chilli, black salt and lemon.', {'toppings': 'coriander 4', 'dress': 'lemon 5; chaat 1.5; chilli 0.5; blacksalt'}),
    ('Poha Chivda Bhel', 'poha 40 thin, roasted; peanut 15; roastchana 15', 'A light bhel with roasted poha.', {'chutneys': 'tamarind 5; mint 5'}),
    ('Masala Corn Cup', 'corn 200 boiled', 'Street-style buttered corn with lemon and spices, made lighter.', {'toppings': 'coriander 4', 'dress': 'lemon 10; chaat 1.5; chilli 0.5; butter 5; salt'}),
]:
    chaat(name, base, desc, **kw)

for name, main, desc, kw in [
    ('Air-fried Okra Fries', 'bhindi 300 slit lengthwise', 'Crisp okra fries with besan and spices.', {'coat': 'besan 30; ricefl 10; chilli 1; amchur 1; salt'}),
    ('Air-fried Mushroom Pakora', 'mushroom 250 halved', 'Crisp mushroom pakoras.', {}),
    ('Air-fried Cauliflower Pakora', 'cauliflower 300 florets', 'Crisp cauliflower pakoras.', {}),
    ('Air-fried Paneer Popcorn', 'paneer 200 small cubes', 'Bite-size crisp paneer popcorn.', {'coat': 'cornflour 15; ricefl 10; chilli 1; garlic 3; pepper 0.5; salt; water 30'}),
    ('Air-fried Chicken Popcorn', 'chicken 300 small cubes', 'Crisp, spicy chicken popcorn.', {'coat': 'curd 30; ricefl 20; cornflour 10; chilli 1.5; garlic 5; ginger 5; salt'}),
    ('Air-fried Fish Fingers', 'fish 300 fingers', 'Crisp fish fingers with a spiced coating.', {'coat': 'besan 30; ricefl 15; ajwain 1; chilli 1; lemon 10; garlic 4; salt; water 30'}),
    ('Air-fried Prawn Pakora', 'prawn 250', 'Crisp prawn pakoras.', {'mins': 8}),
    ('Air-fried Brinjal Fries', 'brinjal 300 batons', 'Crisp brinjal fries.', {'coat': 'ricefl 20; besan 15; chilli 1; haldi 0.3; salt; water 30'}),
    ('Air-fried Raw Banana Fries', 'rawbanana 300 batons', 'Crisp raw banana fries.', {'coat': 'ricefl 15; chilli 1; pepper 0.5; salt', 'mins': 15}),
    ('Air-fried Zucchini Fries', 'zucchini 350 batons', 'Light zucchini fries with a besan coating.', {'coat': 'besan 30; ricefl 10; oregano 0.5; chilli 0.5; salt; water 25'}),
    ('Air-fried Tofu Bites', 'tofu 250 cubes, pressed', 'Crisp, spicy tofu bites.', {'coat': 'cornflour 15; chilli 1; garlic 3; soysauce 5; salt'}),
    ('Air-fried Soya Nuggets', 'soya 80 boiled, squeezed', 'Crisp soya chunk nuggets.', {'coat': 'curd 30; besan 20; chilli 1; garam 1; salt'}),
    ('Air-fried Methi Pakora', 'methi 100 chopped; onion 60 sliced', 'Methi pakoras made in the air fryer.', {}),
    ('Air-fried Mirchi Pakora', 'gchilli 150 large, mild, slit, deseeded', 'Large chillies in besan batter, air-fried.', {}),
    ('Air-fried Moong Dal Pakodi', 'moong 150 soaked, coarsely ground; onion 40', 'Moong dal pakodis made in the air fryer.', {'coat': 'ginger 5; gchilli 3; coriander 6; hing; salt'}),
]:
    airfried(name, main, desc, **kw)

steamed('Methi Dhokla', 'besan 140; methi 40 chopped; curd 60; ginger 5; gchilli 3; haldi 0.3', 'Khaman dhokla with fresh methi.')
steamed('Beetroot Rava Dhokla', 'rava 170; curd 200; beet 60 grated; ginger 5', 'Pink instant rava dhokla.', rest=20)
steamed('Carrot Rava Dhokla', 'rava 170; curd 200; carrot 60 grated; ginger 5', 'Instant rava dhokla with carrot.', rest=20)
steamed('Oats Moong Dhokla', 'oats 70 powdered; moong 80 soaked and ground; curd 60; ginger 5; gchilli 3', 'High-protein oats and moong dhokla.')
steamed('Ragi Dhokla', 'ragi 100; rava 60; curd 150; ginger 5; gchilli 3', 'Calcium-rich ragi dhokla.', rest=15)
steamed('Jowar Dhokla', 'jowar 100; rava 50; curd 150; ginger 5; gchilli 3', 'Gluten-light jowar dhokla.', rest=15)
steamed('Masoor Dal Dhokla', 'masoor 150 soaked 2 hours and ground; ginger 5; gchilli 3; haldi 0.3', 'Protein-rich red lentil dhokla.',
        prep_txt='Grind the soaked masoor dal with ginger and chilli to a thick batter.')
steamed('Mixed Dal Dhokla', 'moong 60; chanadal 50; urad 30; ginger 8; gchilli 3', 'Dhokla from three soaked dals.',
        prep_txt='Soak the dals for 4 hours, grind coarsely and rest for 2 hours.')
steamed('Sprouts Dhokla', 'sprouts 150 ground; besan 40; curd 60; ginger 5; gchilli 3', 'Dhokla with ground moong sprouts.')
steamed('Corn Dhokla', 'rava 120; corn 120 crushed; curd 150; ginger 5; gchilli 3', 'Instant rava dhokla with sweet corn.', rest=20)

muthia('Methi Bajra Muthia', 'bajra 80; besan 40; atta 20; methi 100 chopped', 'Bajra and methi steamed muthia.')
muthia('Ragi Methi Muthia', 'ragi 70; besan 40; rava 20; methi 100 chopped', 'Ragi and methi steamed muthia.')
muthia('Carrot Muthia', 'atta 80; besan 40; rava 20; carrot 180 grated', 'Steamed carrot muthia.')
muthia('Lauki Oats Muthia', 'oats 70 powdered; besan 40; rava 20; lauki 180 grated', 'Oats and bottle gourd muthia.')
muthia('Mixed Vegetable Muthia', 'atta 80; besan 40; rava 20; cabbage 60; carrot 60; methi 40', 'Steamed muthia with mixed vegetables.')
muthia('Spinach Jowar Muthia', 'jowar 90; besan 40; spinach 120 chopped', 'Gluten-free spinach jowar muthia.')
