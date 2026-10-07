"""Volume 2 - egg, chicken, mutton, fish & seafood."""
import core
from fam_nonveg import omelette, egg_curry, chicken, grilled, mutton, fishcurry, fishfry, CG, CG_TXT, CMAR, MG, MG_TXT, TM, FM, EG, EG_TXT

core.VOLUME = 2

# Omelettes
omelette('Methi Omelette', 'methi 25 chopped; onion 25; gchilli 3', 'An omelette with fresh fenugreek leaves.')
omelette('Broccoli Omelette', 'broccoli 40 finely chopped; onion 25; garlic 2', 'A fluffy omelette with broccoli.')
omelette('Corn Capsicum Omelette', 'corn 30; capsicum 25; onion 20', 'An omelette with sweet corn and capsicum.')
omelette('Sprouts Omelette', 'sprouts 40; onion 25; tomato 25; coriander 4', 'A high-protein omelette with moong sprouts.')
omelette('Egg White Spinach Mushroom Omelette', 'spinach 30; mushroom 40; onion 20', 'A lean egg-white omelette with spinach and mushrooms.', eggs='eggwhite 132')
omelette('Chicken Omelette', 'chicken 50 cooked, shredded; onion 25; capsicum 20', 'A filling omelette with shredded chicken.')
omelette('Herb Omelette', 'coriander 6; mint 3; springonion 15; gchilli 3', 'A fresh herb omelette with coriander, mint and spring onion.')
omelette('Tomato Onion Egg White Omelette', 'onion 30; tomato 40; gchilli 3; coriander 4', 'A light egg-white masala omelette.', eggs='eggwhite 132')
omelette('Paneer Spinach Omelette', 'paneer 30 crumbled; spinach 30; onion 20', 'An omelette with paneer and spinach.')

# Egg curries
egg_curry('Egg Kolhapuri', 'Boiled eggs in a fiery Kolhapuri masala.',
          'oil 12; onion 120; ginger 8; garlic 10; tomato 120; coconut 25 roasted; sesame 5; dhaniaseed 3; redchilli 4; peppercorn 1; haldi 0.5; water 200; salt',
          'Roast and grind the coconut, sesame and spices. Sauté onion, ginger and garlic, add tomato and the masala and cook until thick.')
egg_curry('Chettinad Egg Curry', 'Eggs in a peppery Chettinad gravy.',
          'oil 12; curryleaf 1.5; onion 120; ginger 8; garlic 10; tomato 120; coconut 20; dhaniaseed 3; redchilli 4; peppercorn 2; saunf 1.5; haldi 0.5; water 200; salt',
          'Roast and grind the coconut and spices. Sauté curry leaves and onion, add ginger-garlic and tomato, then the masala.')
egg_curry('Egg Makhani (Lighter)', 'Boiled eggs in a silky tomato-cashew gravy.',
          'butter 8; oil 4; ginger 8; garlic 8; tomato 300; cashew 15; chilli 1.5; kasuri 1; honey 5; milk 60; water 120; salt',
          'Cook tomatoes, cashews, ginger and garlic for 10 minutes; blend smooth. Simmer with chilli powder and kasuri methi, then add milk.')
egg_curry('Kadai Egg Masala', 'Eggs with capsicum in a spicy kadai masala.',
          'oil 12; dhaniaseed 4; redchilli 3; onion 120; ginger 8; garlic 8; tomato 150; capsicum 100; kasuri 1; garam 1; water 100; salt',
          'Crush roasted coriander seeds and chillies. Sauté onion, ginger, garlic and tomato, add the kadai masala and capsicum.')
egg_curry('Egg Do Pyaza', 'Eggs with onions cooked two ways.',
          'oil 12; jeera 1; onion 120 chopped; onion 120 petals; ginger 8; garlic 8; tomato 120; chilli 1.5; garam 1; water 120; salt',
          'Sauté the onion petals and set aside. Cook the chopped onion until golden, add ginger-garlic, tomato and spices, then the petals.')
egg_curry('Dimer Dalna (Bengali Egg Curry)', 'Bengali egg and potato curry.',
          'mustardoil 12; bayleaf 0.2; jeera 1; onion 100; ginger 8; tomato 100; potato 200 cubed; haldi 0.5; chilli 1.5; jeerapowder 2; garam 1; sugar 2; water 250; salt',
          'Fry potatoes lightly in mustard oil. Temper bay leaf and cumin, sauté onion and ginger, add tomato and spices, then potatoes and water; cook until soft.')
egg_curry('Goan Egg Curry', 'Eggs in a Goan coconut-chilli curry.',
          'oil 10; onion 80; coconut 80; redchilli 5; dhaniaseed 3; jeera 1; haldi 0.5; garlic 6; tamarind 10; water 250; salt',
          'Grind coconut with chillies and spices. Sauté onion, add the paste, tamarind and water and simmer 8 minutes.')
egg_curry('Anda Tamatar Curry', 'Eggs in a tangy tomato curry.',
          'oil 10; jeera 1; onion 80; tomato 300 chopped; ginger 5; garlic 6; chilli 1.5; dhania 2; garam 1; water 150; salt', EG_TXT)
egg_curry('Methi Egg Curry', 'Eggs in a methi-tomato gravy.', EG + '; methi 60 chopped', EG_TXT + ' Add the methi and cook 3 minutes.')
egg_curry('Egg Palak Korma', 'Eggs in a mild spinach-cashew gravy.',
          'oil 10; onion 100; ginger 8; garlic 8; spinach 200 blanched, puréed; cashew 12 ground; curd 60; garam 1; salt; water 80',
          'Sauté onion, ginger and garlic, add the spinach purée and cashew paste, then whisked curd on low flame.')

# Chicken curries
CH = [
    ('Chicken Masala (Dhaba Style)', 'A rustic, spicy dhaba-style chicken masala.', CG + '; kasuri 1', CG_TXT),
    ('Chicken Rogan Josh', 'Kashmiri-style chicken in a red, aromatic curd gravy.',
     'oil 15; bayleaf 0.2; cardamom 0.4; blackcardamom 1; clove 0.2; cinnamon 1; hing; chilli 4; sounthpowder 3; dryginger 2; garam 1; curd 150; salt',
     'Heat oil with whole spices and hing, add Kashmiri chilli paste, fennel and dry ginger, then whisked curd a little at a time.'),
    ('Chicken Rezala (Lighter)', 'Bengali white chicken curry with curd, cashew and poppy seeds.',
     'oil 12; cardamom 0.6; clove 0.2; cinnamon 1; bayleaf 0.2; onion 120 paste; ginger 8; garlic 8; cashew 15; poppy 6; curd 150; gchilli 6; garam 1; water 150; salt',
     'Fry whole spices, add onion paste and ginger-garlic, then the cashew-poppy paste and whisked curd with green chillies.'),
    ('Chicken Handi', 'Chicken slow-cooked in a handi with curd and spices.', CG + '; curd 80', CG_TXT + ' Stir in the whisked curd.'),
    ('Chicken Jalfrezi', 'A tangy stir-fried chicken curry with peppers and tomato.',
     'oil 12; jeera 1; onion 120 petals; capsicum 150 strips; tomato 150; ginger 8; garlic 8; chilli 1.5; dhania 2; garam 1; vinegar 8; salt; water 60',
     'Sauté onion, ginger and garlic, add tomato and spices, then the peppers on high heat.'),
    ('Chicken Vindaloo (Lighter)', 'Goan chicken in a tangy chilli-vinegar-garlic masala.',
     'oil 12; onion 120; garlic 15; ginger 8; kashmirichilli 8; jeera 2; peppercorn 2; clove 0.2; cinnamon 1; vinegar 25; jaggery 5; haldi 0.5; water 150; salt',
     'Grind the chillies, garlic, ginger and spices with vinegar. Sauté onion, add the paste and cook 5 minutes.'),
    ('Chicken Methi Malai (Lighter)', 'Chicken in a mild, creamy fenugreek gravy made with milk.',
     'oil 10; jeera 1; onion 100 boiled, puréed; cashew 15; ginger 8; garlic 8; gchilli 3; methi 80 chopped; milk 150; garam 0.5; salt',
     'Sauté ginger, garlic and chilli, add methi, then the onion-cashew paste, then milk.'),
    ('Chicken Lababdar (Lighter)', 'Chicken in a rich onion-tomato-cashew gravy.',
     'oil 12; onion 150; tomato 250 puréed; cashew 15; ginger 8; garlic 10; chilli 1.5; kasuri 1; garam 1; cream 20; water 120; salt',
     'Sauté onion until golden, add ginger-garlic, tomato purée, cashew paste and spices and cook until thick.'),
    ('Kali Mirch Chicken', 'Chicken in a creamy black pepper gravy.',
     'oil 12; onion 120 paste; ginger 8; garlic 8; peppercorn 5 crushed; curd 120; cashew 12; garam 1; water 120; salt',
     'Sauté onion paste and ginger-garlic, add pepper and cashew paste, then whisked curd.'),
    ('Mughlai Chicken (Lighter)', 'A royal chicken curry with almonds and curd.',
     'oil 12; cardamom 0.6; clove 0.2; cinnamon 1; onion 150 browned, ground; almond 15 ground; curd 120; saffron; garam 1; water 150; salt',
     'Fry whole spices, add browned-onion paste and almond paste, then whisked curd and saffron.'),
    ('Chicken Kurma (South Indian)', 'Chicken in a coconut-fennel kurma.',
     'coconutoil 12; saunf 1; cinnamon 1; clove 0.2; onion 120; ginger 8; garlic 8; tomato 100; coconut 50 ground with cashew; cashew 10; dhania 3; chilli 1; garam 1; water 200; salt',
     'Fry fennel and whole spices, sauté onion, ginger-garlic and tomato, add spices and the coconut-cashew paste.'),
    ('Andhra Chicken Curry', 'Spicy Andhra-style chicken curry.',
     'oil 15; curryleaf 1.5; onion 150; ginger 8; garlic 10; gchilli 6; tomato 100; chilli 3; dhania 3; garam 1.5; poppy 4; water 200; salt',
     'Sauté curry leaves, onion and chillies until golden, add ginger-garlic, tomato and spices, then poppy seed paste.'),
    ('Nadan Kerala Chicken Curry', 'Kerala home-style chicken curry with coconut oil and curry leaves.',
     'coconutoil 15; curryleaf 2; shallot 80; onion 80; ginger 10; garlic 10; gchilli 6; tomato 100; chilli 2; dhania 3; garam 1; coconutmilk 200; salt',
     'Sauté shallots, onion, ginger, garlic and curry leaves in coconut oil, add tomato and spices, then coconut milk.'),
    ('Chicken Varutharacha Curry', 'Kerala chicken curry with roasted coconut paste.',
     'coconutoil 12; curryleaf 2; onion 120; ginger 8; garlic 8; tomato 100; coconut 60 roasted dark brown; dhaniaseed 4; redchilli 4; saunf 1; haldi 0.5; water 250; salt',
     'Roast the coconut and spices until dark brown and grind. Sauté onion, ginger, garlic and tomato, add the paste.'),
    ('Chicken Capsicum Masala', 'Chicken and capsicum in a homestyle masala.', CG + '; capsicum 150', CG_TXT + ' Add the capsicum for the last 5 minutes.'),
    ('Chicken Mushroom Curry', 'Chicken and mushrooms in an onion-tomato gravy.', CG + '; mushroom 200', CG_TXT),
    ('Chicken Matar', 'Chicken with green peas.', CG + '; peas 150', CG_TXT),
    ('Chicken Aloo Curry', 'Chicken and potato curry, a homestyle one-pot meal.', CG + '; potato 250 cubed', CG_TXT),
    ('Chicken Palak Korma', 'Chicken in a creamy spinach-cashew gravy.',
     'oil 10; onion 120; ginger 8; garlic 10; spinach 250 puréed; cashew 15; curd 80; garam 1; water 100; salt', 'Sauté onion and ginger-garlic, add spinach purée and cashew paste, then whisked curd.'),
    ('Chicken Kolhapuri Rassa', 'A thin, fiery Kolhapuri chicken curry (tambda rassa).',
     'oil 15; onion 150; ginger 8; garlic 10; coconut 40 roasted; sesame 6; redchilli 8; dhaniaseed 4; peppercorn 2; clove 0.2; cinnamon 1; water 450; salt',
     'Roast and grind the coconut, sesame and spices. Sauté onion, ginger and garlic, add the paste and plenty of water.'),
    ('Chicken Bhuna Masala', 'Chicken slow-roasted in a thick, dark masala.', CG.replace('water 250', 'water 80'), CG_TXT + ' Keep stirring until the masala darkens.'),
]
for name, desc, gravy, txt in CH:
    chicken(name, desc, gravy, txt)

# Grills
grilled('Lemon Coriander Chicken Tikka', 'Chicken tikka with lemon, coriander and green chilli.', 'chicken 500 cubed',
        'hungcurd 100; coriander 30; lemon 20; gchilli 6; ginger 10; garlic 12; pepper 1; salt', mins=15)
grilled('Pudina Chicken Tikka', 'Mint-marinated chicken tikka.', 'chicken 500 cubed',
        'hungcurd 100; mint 25; coriander 15; gchilli 6; ginger 10; garlic 12; garam 1; lemon 15; salt', mins=15)
grilled('Achari Chicken Tikka', 'Chicken tikka with pickle spices.', 'chicken 500 cubed',
        'hungcurd 100; saunf 2; kalonji 1; methiseed 0.5; mustardoil 10; chilli 2; haldi 0.5; ginger 10; garlic 12; lemon 10; salt', mins=15)
grilled('Garlic Chicken Tikka', 'Chicken tikka with plenty of garlic.', 'chicken 500 cubed', 'hungcurd 100; garlic 25; chilli 2; garam 1; lemon 15; oil 8; salt', mins=15)
grilled('Tangdi Kebab', 'Tandoori chicken drumsticks, grilled until charred.', 'chickencut 600 drumsticks', TM, mins=25)
grilled('Pudina Fish Tikka', 'Fish tikka in a mint marinade.', 'fish 500 cubed', 'hungcurd 80; mint 25; coriander 15; gchilli 6; ginger 8; garlic 10; lemon 15; ajwain 1; salt', mins=10)
grilled('Achari Fish Tikka', 'Fish tikka with pickle spices.', 'fish 500 cubed',
        'hungcurd 80; saunf 2; kalonji 1; mustardoil 10; chilli 2; haldi 0.5; ginger 8; garlic 10; lemon 10; salt', mins=10)
grilled('Hariyali Fish Tikka', 'Fish tikka in a green herb marinade.', 'fish 500 cubed',
        'hungcurd 80; coriander 30; mint 15; spinach 30; gchilli 6; ginger 8; garlic 10; lemon 15; salt', mins=10)
grilled('Malai Prawns (Grilled)', 'Prawns in a mild cashew-curd marinade, grilled.', 'prawn 450 large', 'hungcurd 100; cashew 12 ground; ginger 8; garlic 10; pepper 1; elaichipowder 0.3; lemon 10; salt', mins=8)
grilled('Hariyali Prawns', 'Prawns in a green herb marinade, grilled.', 'prawn 450 large', 'hungcurd 80; coriander 30; mint 15; gchilli 6; garlic 10; lemon 15; salt', mins=8)
grilled('Mutton Boti Kebab', 'Tender mutton pieces marinated and grilled.', 'mutton 500 boneless cubes', TM + '; papaya 30 raw, grated', mins=25)
grilled('Chicken Malai Seekh Kebab', 'Mild, creamy chicken seekh kebabs.', 'chickenmince 500; onion 50 finely chopped',
        'cashew 15 ground; cheese 14; ginger 10; garlic 12; gchilli 6; coriander 10; elaichipowder 0.5; pepper 1; salt', mins=14)

# Mutton
MU = [
    ('Mutton Rara', 'Punjabi mutton curry cooked with mutton keema in the gravy.', MG + '; muttonmince 150', MG_TXT + ' Add the mince and cook 10 minutes.'),
    ('Mutton Rezala (Lighter)', 'Bengali white mutton curry with curd and cashew.',
     'oil 12; cardamom 0.6; clove 0.2; cinnamon 1; onion 120 paste; ginger 8; garlic 8; cashew 15; poppy 6; curd 150; gchilli 6; garam 1; salt',
     'Fry whole spices, add onion paste and ginger-garlic, then the cashew-poppy paste and curd.'),
    ('Mutton Handi', 'Mutton slow-cooked in a handi with curd and spices.', MG + '; curd 100', MG_TXT + ' Stir in the whisked curd.'),
    ('Tambda Rassa (Kolhapuri Mutton)', 'Kolhapur’s fiery red mutton curry.',
     'oil 15; onion 150; ginger 8; garlic 10; coconut 40 roasted; sesame 6; redchilli 8; dhaniaseed 4; peppercorn 2; clove 0.2; cinnamon 1; salt',
     'Roast and grind the coconut, sesame and spices. Sauté onion, ginger and garlic, add the masala.'),
    ('Kerala Mutton Varutharacha', 'Kerala mutton curry with roasted coconut.',
     'coconutoil 12; curryleaf 2; onion 120; ginger 8; garlic 8; tomato 100; coconut 60 roasted; dhaniaseed 4; redchilli 4; saunf 1; haldi 0.5; salt',
     'Roast coconut and spices until dark brown and grind. Sauté onion, ginger, garlic and tomato, add the paste.'),
    ('Andhra Mutton Curry', 'Spicy Andhra-style mutton curry.',
     'oil 15; curryleaf 1.5; onion 150; ginger 8; garlic 10; gchilli 6; tomato 100; chilli 3; dhania 3; garam 1.5; poppy 4; salt',
     'Sauté curry leaves, onion and chillies, add ginger-garlic, tomato and spices, then poppy paste.'),
    ('Keema Aloo', 'Mutton mince with potatoes.', 'oil 12; jeera 1; onion 150; ginger 8; garlic 10; tomato 150; potato 200 cubed; chilli 1.5; dhania 3; garam 1.5; salt', MG_TXT),
    ('Keema Palak', 'Mutton mince with spinach.', 'oil 12; jeera 1; onion 150; ginger 8; garlic 10; tomato 120; spinach 250 chopped; chilli 1.5; dhania 3; garam 1.5; salt',
     MG_TXT + ' Add the spinach in the last 10 minutes.'),
    ('Mutton Vindaloo (Lighter)', 'Goan mutton in a tangy chilli-vinegar masala.',
     'oil 12; onion 120; garlic 15; ginger 8; kashmirichilli 8; jeera 2; peppercorn 2; clove 0.2; cinnamon 1; vinegar 25; jaggery 5; salt',
     'Grind chillies, garlic, ginger and spices with vinegar. Sauté onion and add the paste.'),
    ('Achari Mutton', 'Mutton in a tangy pickle-spice gravy.',
     'mustardoil 15; saunf 2; kalonji 1; methiseed 0.5; mustard 1; onion 150; ginger 8; garlic 10; tomato 120; curd 100; chilli 2; amchur 2; salt',
     'Heat mustard oil, add pickle spices, sauté onion until golden, add ginger-garlic, tomato and spices, then curd.'),
    ('Methi Mutton', 'Mutton curry with fresh fenugreek.', MG + '; methi 100 chopped', MG_TXT + ' Add the methi for the last 10 minutes.'),
    ('Mutton Coconut Curry', 'Mutton in a South Indian coconut curry.',
     'coconutoil 12; mustard 2; curryleaf 1.5; onion 150; ginger 8; garlic 10; tomato 100; chilli 2; dhania 3; garam 1; coconutmilk 300; salt',
     'Temper mustard and curry leaves, sauté onion, ginger, garlic and tomato, add spices, then coconut milk.'),
    ('Aloo Gosht', 'Mutton and potato curry, a classic home dish.', MG + '; potato 250 cubed', MG_TXT),
    ('Kadai Mutton', 'Mutton with capsicum in a kadai masala.',
     'oil 15; dhaniaseed 5; redchilli 4; onion 150; ginger 8; garlic 10; tomato 200; capsicum 120; kasuri 1; garam 1; salt',
     'Crush roasted coriander seeds and chillies. Sauté onion, ginger-garlic and tomato, add the masala.'),
    ('Dhaba Mutton Masala', 'Rustic, spicy dhaba-style mutton.', MG + '; kasuri 1', MG_TXT),
    ('Mutton Palak Korma', 'Mutton in a spinach-cashew gravy.',
     'oil 12; onion 120; ginger 8; garlic 10; spinach 250 puréed; cashew 15; curd 100; garam 1; salt', 'Sauté onion and ginger-garlic, add spinach purée and cashew paste, then curd.'),
]
for name, desc, gravy, txt in MU:
    mutton(name, desc, gravy, txt, **({'main': 'muttonmince 500', 'mar': 'haldi 0.5; salt', 'whistles': '3'} if name.startswith('Keema') else {}))

# Fish & seafood curries
FC = [
    ('Malabar Fish Curry', 'Malabar fish curry with coconut and kudampuli.',
     'coconutoil 12; mustard 2; curryleaf 2; shallot 60; ginger 8; garlic 8; tomato 80; coconut 80 ground; chilli 2; haldi 0.5; kokum 9; water 250; salt',
     'Sauté shallots, ginger, garlic and curry leaves, add tomato and spices, then the coconut paste and kokum.', {}),
    ('Chettinad Fish Curry', 'Fish in a peppery Chettinad tamarind gravy.',
     'oil 12; curryleaf 2; shallot 60; tomato 100; tamarind 15; coconut 20; dhaniaseed 3; redchilli 4; peppercorn 2; saunf 1; haldi 0.5; water 300; salt',
     'Roast and grind coconut and spices. Sauté shallots and tomato, add tamarind and the paste.', {}),
    ('Mangalorean Fish Gassi', 'Mangalorean fish curry with roasted coconut and tamarind.',
     'oil 10; onion 80; coconut 80; redchilli 6; dhaniaseed 3; jeera 1; methiseed 0.3; garlic 6; tamarind 15; haldi 0.5; water 300; salt',
     'Roast and grind coconut with spices. Sauté onion, add the paste, tamarind and water.', {}),
    ('Prawn Moilee', 'Prawns in a mild Kerala coconut stew.',
     'coconutoil 12; mustard 2; curryleaf 2; onion 100; ginger 10; garlic 8; gchilli 6; tomato 80; haldi 0.5; pepper 1; coconutmilk 360; salt',
     'Sauté onion, ginger, garlic and chillies, add turmeric, pepper and tomato, then coconut milk.', {'main': 'prawn 450', 'simmer': 4}),
    ('Prawn Pulusu', 'Andhra tangy tamarind prawn curry.',
     'oil 12; mustard 2; methiseed 0.5; curryleaf 2; onion 120; tomato 100; tamarind 20; chilli 3; dhania 3; haldi 0.5; jaggery 3; water 250; salt',
     'Temper mustard, methi and curry leaves, sauté onion and tomato, add spices and tamarind and simmer.', {'main': 'prawn 450', 'simmer': 4}),
    ('Prawn Chettinad', 'Prawns in a fiery Chettinad masala.',
     'oil 12; curryleaf 2; onion 120; tomato 120; ginger 8; garlic 8; coconut 20; dhaniaseed 3; redchilli 4; peppercorn 2; saunf 1.5; haldi 0.5; water 120; salt',
     'Roast and grind coconut and spices. Sauté onion, ginger, garlic and tomato, add the paste.', {'main': 'prawn 450', 'simmer': 4}),
    ('Kerala Prawn Curry', 'Prawns in a tangy Kerala red curry.',
     'coconutoil 12; mustard 2; curryleaf 2; shallot 60; ginger 8; garlic 8; chilli 3; haldi 0.5; kokum 9; coconutmilk 150; water 150; salt',
     'Sauté shallots, ginger, garlic and curry leaves, add spices and kokum, then coconut milk.', {'main': 'prawn 450', 'simmer': 4}),
    ('Goan Prawn Curry', 'Goan prawn curry with coconut and kokum.',
     'oil 10; onion 80; coconut 80; redchilli 6; dhaniaseed 3; jeera 1; haldi 0.5; garlic 6; kokum 9; water 250; salt',
     'Grind coconut with chillies and spices. Sauté onion, add the paste, kokum and water.', {'main': 'prawn 450', 'simmer': 4}),
    ('Kerala Mackerel Curry', 'Mackerel in a red Kerala curry with kudampuli.',
     'coconutoil 12; mustard 2; methiseed 0.5; curryleaf 2; shallot 60; ginger 8; garlic 8; chilli 3; haldi 0.5; kokum 9; water 300; salt',
     'Temper mustard and methi, sauté shallots, ginger, garlic and curry leaves, add spices and kokum.', {'main': 'mackerel 500 cleaned, cut'}),
    ('Goan Pomfret Curry', 'Pomfret in a Goan coconut curry.',
     'oil 10; onion 80; coconut 80; redchilli 6; dhaniaseed 3; jeera 1; haldi 0.5; garlic 6; tamarind 15; water 250; salt',
     'Grind coconut with chillies and spices. Sauté onion, add the paste, tamarind and water.', {'main': 'pomfret 500 cut'}),
    ('Pomfret Masala Curry', 'Pomfret in an onion-tomato masala.',
     'oil 12; jeera 1; onion 150; ginger 8; garlic 10; tomato 150; chilli 1.5; dhania 3; garam 1; water 250; salt',
     'Sauté onion until golden, add ginger-garlic, tomato and spices.', {'main': 'pomfret 500 cut'}),
    ('Doi Maach (Bengali Curd Fish)', 'Bengali fish in a curd gravy.',
     'mustardoil 12; bayleaf 0.2; cardamom 0.4; clove 0.2; cinnamon 1; onion 100 paste; ginger 8; curd 150; haldi 0.5; chilli 1; sugar 3; water 150; salt',
     'Heat oil with whole spices, add onion paste and ginger, then whisked curd and spices on low flame.', {}),
    ('Fish Malai Curry', 'Fish in a mild coconut milk curry.',
     'mustardoil 10; bayleaf 0.2; cinnamon 1; cardamom 0.4; onion 100 paste; ginger 8; haldi 0.5; chilli 1; coconutmilk 300; sugar 2; salt',
     'Heat oil with whole spices, add onion paste and ginger, then spices and coconut milk.', {}),
    ('Fish Do Pyaza', 'Fish with onions cooked two ways.',
     'oil 12; jeera 1; onion 120 chopped; onion 120 petals; ginger 8; garlic 8; tomato 120; chilli 1.5; garam 1; water 150; salt',
     'Sauté onion petals and set aside. Cook chopped onion until golden, add ginger-garlic, tomato and spices.', {}),
    ('Fish Palak Curry', 'Fish in a spinach gravy.',
     'oil 10; jeera 1; onion 100; ginger 8; garlic 10; tomato 80; spinach 250 puréed; garam 1; water 120; salt',
     'Sauté onion, ginger and garlic, add tomato, then spinach purée and spices.', {}),
    ('Bihari Fish Curry (Mustard Tomato)', 'Bihari fish curry with mustard and tomato.',
     'mustardoil 12; kalonji 1; onion 100; garlic 8; tomato 150; kasundi 15; haldi 0.5; chilli 1.5; water 250; salt',
     'Heat mustard oil, add kalonji, sauté onion and garlic, add tomato, mustard paste and spices.', {}),
    ('Crab Masala Dry', 'A spicy, dry coastal crab masala.',
     'oil 12; onion 150; tomato 100; ginger 8; garlic 10; chilli 2; dhania 3; garam 1; peppercorn 2; curryleaf 2; water 80; salt',
     'Sauté onion, ginger, garlic and curry leaves, add tomato and spices and cook until thick.', {'main': 'crab 800 cleaned', 'simmer': 15}),
    ('Prawn Do Pyaza', 'Prawns with onions cooked two ways.',
     'oil 12; jeera 1; onion 120 chopped; onion 120 petals; ginger 8; garlic 8; tomato 120; chilli 1.5; garam 1; water 80; salt',
     'Sauté onion petals; cook chopped onion until golden, add ginger-garlic, tomato and spices.', {'main': 'prawn 450', 'simmer': 4}),
]
for name, desc, gravy, txt, kw in FC:
    fishcurry(name, desc, gravy, txt, **kw)

fishfry('Pomfret Rava Fry', 'Pomfret coated in spiced semolina and pan-fried.', 'pomfret 500 whole, cleaned', FM + '; rava 40')
fishfry('Mackerel Rava Fry', 'Mackerel in a spicy rava crust.', 'mackerel 500 whole, cleaned', FM + '; rava 40')
fishfry('Pepper Fish Fry', 'Fish with a crushed pepper masala.', 'fish 500 slices', 'peppercorn 5 crushed; garlic 8; ginger 5; haldi 0.5; lemon 15; curryleaf 2; salt')
fishfry('Garlic Prawn Fry', 'Prawns pan-fried with garlic and chilli.', 'prawn 400', 'garlic 20; chilli 2; haldi 0.3; lemon 10; pepper 1; salt')
fishfry('Chettinad Fish Fry', 'Fish with a Chettinad spice coating.', 'fish 500 slices', FM + '; peppercorn 2; saunf 1')
fishfry('Goan Recheado Fish (Lighter)', 'Fish with a Goan red recheado masala, pan-fried.', 'pomfret 500 whole, slit',
        'kashmirichilli 6; garlic 10; ginger 5; jeera 1; peppercorn 1; clove 0.1; vinegar 20; jaggery 3; salt')
fishfry('Andhra Fish Fry', 'Spicy Andhra-style fish fry.', 'fish 500 slices', FM + '; chilli 1; garam 1')
fishfry('Mangalorean Fish Fry', 'Fish coated in a red Mangalorean masala.', 'fish 500 slices', 'redchilli 5; garlic 8; ginger 5; tamarind 10; haldi 0.5; ricefl 15; salt')
fishfry('Prawn Pepper Fry', 'Prawns tossed with black pepper and curry leaves.', 'prawn 400', 'peppercorn 4 crushed; garlic 8; ginger 5; curryleaf 2; haldi 0.3; lemon 10; salt')
fishfry('Tawa Pomfret Masala', 'Pomfret with a thick green masala, tawa-cooked.', 'pomfret 500 whole, slit', 'coriander 30; mint 10; gchilli 6; garlic 8; ginger 5; lemon 15; ricefl 10; salt')
