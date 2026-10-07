"""Egg, chicken, mutton, fish and seafood."""
from core import recipe
from util import names, allnames

NV_SERVE = ['phulka, jeera rice or brown rice, with a salad and curd.', '<b>Best time:</b> lunch or dinner.']

# ---------------- Eggs ----------------
CE = 'Egg Dishes'


def omelette(name, add, desc, eggs='egg 150', serves=1, fat='oil 5', sub='Omelette'):
    g = [('Ingredients', f'{eggs}; {add}; haldi 0.2; pepper 0.5; salt; {fat}')]
    steps = [
        f'Chop: Finely chop the {names(add)}.',
        'Beat: Beat the eggs with turmeric, pepper and salt until frothy (about 30 seconds).',
        'Combine: Stir the chopped ingredients into the beaten eggs.',
        'Heat the pan: Heat a non-stick pan on medium flame and brush with oil.',
        'Cook: Pour in the egg mixture and swirl to spread. Cook on medium-low flame for 2 minutes until the bottom is set and lightly golden.',
        'Flip or fold: Flip carefully (or fold in half) and cook for 1 minute more until fully set.',
        'Serve: Serve hot with whole-wheat toast or a roti.',
    ]
    recipe(name, CE, desc, serves, 5, 5, g, steps, tips=['Cook on medium-low heat so the omelette sets evenly without browning too much.',
                                                        'Add 1 tbsp milk or water to the eggs for a fluffier omelette.'],
           serve=['whole-wheat toast, multigrain roti or a salad.', '<b>Best time:</b> breakfast or a quick dinner.'],
           store='best eaten immediately.', sub=sub)


O = 'onion 30; tomato 30; gchilli 3; coriander 4'
omelette('Masala Omelette', O, 'The Indian-style omelette with onion, tomato, green chilli and coriander.')
omelette('Vegetable Omelette', 'onion 25; tomato 25; capsicum 25; carrot 20 grated; spinach 15; coriander 4', 'A colourful omelette packed with vegetables.')
omelette('Egg White Omelette', 'onion 30; capsicum 25; spinach 20; coriander 4', 'A light, high-protein, almost fat-free omelette made with egg whites.', eggs='eggwhite 132')
omelette('Spinach Omelette', 'spinach 50; onion 25; garlic 2', 'A fluffy omelette with wilted spinach.')
omelette('Mushroom Omelette', 'mushroom 50 sliced, sautéed; onion 25; pepper 0.5', 'A savoury omelette with sautéed mushrooms.')
omelette('Paneer Omelette', 'paneer 40 crumbled; onion 25; capsicum 20; coriander 4', 'An extra-protein omelette with crumbled paneer.')
omelette('Oats Omelette', 'oats 20; onion 25; tomato 25; gchilli 3', 'An omelette with oats for added fibre and fullness.')
omelette('Cheese Omelette (Lighter)', 'cheese 14; onion 25; capsicum 20', 'A light cheese omelette with vegetables.')


def egg_curry(name, desc, gravy, gravy_txt, serves=3, eggs='egg 300 hard-boiled, peeled', sub='Egg Curry'):
    g = [('Eggs', eggs), ('For the Gravy', gravy), ('To Finish', 'coriander 6')]
    steps = [
        'Boil the eggs: Boil the eggs for 10 minutes, cool in cold water and peel. Make shallow slits on each so the masala soaks in.',
        'Roast the eggs: Toss the eggs in ½ tsp oil with a pinch of turmeric and chilli for 2 minutes until lightly golden. Set aside.',
        f'Make the gravy: {gravy_txt}',
        'Simmer: Add water to the consistency you like, add salt and simmer for 5 minutes.',
        'Add the eggs: Add the eggs and simmer for 4–5 minutes so they absorb the flavours.',
        'Serve: Garnish with coriander and serve hot.',
    ]
    recipe(name, CE, desc, serves, 15, 25, g, steps, tips=['Slit the boiled eggs so the gravy flavours them all the way through.'],
           serve=NV_SERVE, store='keeps in the fridge for 1 day.', sub=sub)


EG = 'oil 12; jeera 1; onion 150 chopped; ginger 8; garlic 10; tomato 180 puréed; haldi 0.5; chilli 1.5; dhania 3; garam 1; water 200; salt'
EG_TXT = 'Heat oil, crackle cumin and sauté the onion until golden. Add ginger and garlic, then the tomato purée and spices, and cook until the oil separates.'
egg_curry('Egg Curry (Anda Curry)', 'Boiled eggs in a homestyle spicy onion-tomato gravy.', EG, EG_TXT)
egg_curry('Kerala Egg Roast', 'Eggs in a thick, peppery onion masala with curry leaves, Kerala style.',
          'coconutoil 12; mustard 2; curryleaf 1.5; onion 250 thinly sliced; ginger 10; garlic 10; tomato 100; haldi 0.5; chilli 2; pepper 1.5; garam 1; salt; water 60',
          'Heat coconut oil, crackle mustard seeds and add curry leaves. Sauté the onions for 12–15 minutes until deep golden and jammy. Add ginger, garlic, tomato and spices and cook until thick.')
egg_curry('Egg Masala (Dry)', 'Eggs coated in a thick, spicy dry masala.', EG.replace('water 200', 'water 40'), EG_TXT)
egg_curry('Egg Korma', 'Boiled eggs in a mild, creamy cashew-curd gravy.',
          'oil 10; cardamom 0.4; clove 0.2; onion 120 boiled, puréed; ginger 8; garlic 8; cashew 15 ground; curd 100; garam 1; salt; water 150',
          'Heat oil with whole spices, add ginger-garlic, then the onion purée and cashew paste and cook for 5 minutes. Lower the flame and stir in whisked curd.')
egg_curry('Egg Coconut Curry (Mutta Curry)', 'Eggs in a mildly spiced coconut milk gravy, South Indian style.',
          'coconutoil 12; mustard 2; curryleaf 1.5; onion 120 sliced; ginger 8; garlic 8; tomato 100; haldi 0.5; chilli 1.5; dhania 3; garam 1; coconutmilk 240; salt',
          'Heat coconut oil, crackle mustard seeds, add curry leaves and onion and sauté until soft. Add ginger, garlic, tomato and spices, cook until soft, then add coconut milk.')
egg_curry('Egg Palak Curry', 'Boiled eggs in a garlicky spinach gravy.',
          'oil 10; jeera 1; onion 100; ginger 8; garlic 10; tomato 80; spinach 250 blanched, puréed; garam 1; salt; water 80',
          'Sauté onion until golden, add ginger, garlic and tomato, then the spinach purée and garam masala, and simmer 3 minutes.')


def egg_misc(name, desc, ings, steps, serves=2, sub='Egg', prep=10, cook=10):
    recipe(name, CE, desc, serves, prep, cook, ings, steps, tips=['Cook eggs gently; high heat makes them rubbery.'],
           serve=['whole-wheat toast, roti or a salad.', '<b>Best time:</b> breakfast or a light meal.'], store='best eaten fresh.', sub=sub)


egg_misc('Egg Bhurji', 'Soft Indian scrambled eggs with onion, tomato and spices, ready in 10 minutes.',
         'egg 200; onion 50 chopped; tomato 50 chopped; gchilli 3; haldi 0.2; chilli 0.5; pavbhaji 1; coriander 4; salt; oil 6',
         ['Sauté: Heat oil and sauté the onion until soft. Add green chilli and tomato and cook for 2 minutes.',
          'Spice: Add turmeric, chilli powder, pav bhaji masala and salt.',
          'Scramble: Pour in the beaten eggs and stir gently on low flame until just set and creamy.',
          'Serve: Add coriander and serve hot.'])
egg_misc('Parsi Akuri', 'Creamy, mildly spiced Parsi scrambled eggs with ginger and coriander.',
         'egg 200; onion 50 chopped; tomato 40 chopped; ginger 5; gchilli 3; haldi 0.2; jeerapowder 0.5; milk 30; coriander 6; salt; butter 5',
         ['Sauté: Melt the butter and sauté onion, ginger and green chilli until soft.', 'Tomato: Add tomato and spices and cook 2 minutes.',
          'Eggs: Whisk the eggs with milk, pour in and stir on the lowest flame until soft and creamy, slightly runny.', 'Serve: Garnish with coriander and serve at once.'])
egg_misc('Boiled Egg Chaat', 'Boiled eggs tossed with onion, tomato, lemon and chaat masala, a protein-rich snack.',
         'egg 200 hard-boiled; onion 40; tomato 40; coriander 4; lemon 5; chaat 1; pepper 0.3; salt',
         ['Boil: Boil the eggs for 10 minutes, cool and peel.', 'Chop: Chop the eggs, onion and tomato.', 'Toss: Toss everything with lemon juice, chaat masala, pepper and salt.',
          'Serve: Serve immediately.'], cook=10)
egg_misc('Egg Chila', 'A thin, crisp besan-and-egg pancake folded with vegetables.',
         'egg 100; besan 30; onion 30; tomato 30; gchilli 3; coriander 4; haldi 0.2; salt; water 40; oil 5',
         ['Batter: Whisk besan with water until smooth, then whisk in the eggs, vegetables and spices.', 'Cook: Pour a ladle on a hot greased tawa and spread thin.',
          'Flip: Cook 2 minutes, flip and cook 1 minute.', 'Serve: Serve hot with chutney.'])
egg_misc('Egg Sandwich (Multigrain)', 'A high-protein sandwich with spiced egg filling on multigrain bread.',
         'bread 120; egg 150 hard-boiled; hungcurd 40; onion 20; pepper 0.5; coriander 4; lettuce 20; tomato 40; salt',
         ['Filling: Chop the boiled eggs and mix with hung curd, onion, pepper, coriander and salt.', 'Assemble: Spread on bread slices and add lettuce and tomato.',
          'Toast: Toast lightly on a tawa or grill if you like.', 'Serve: Cut in half and serve.'])
egg_misc('Poached Eggs on Toast with Spinach', 'Poached eggs on whole-wheat toast over garlicky wilted spinach.',
         'egg 100; bread 60; spinach 80; garlic 3; vinegar 5; pepper 0.5; salt; oil 3',
         ['Spinach: Sauté garlic in oil, add spinach and salt and wilt for 1 minute.', 'Poach: Simmer water with vinegar, swirl, crack in an egg and cook 3 minutes. Lift out with a slotted spoon.',
          'Toast: Toast the bread.', 'Serve: Top the toast with spinach and the poached eggs; season with pepper.'], serves=1)
egg_misc('Egg Kheema (Anda Kheema)', 'Grated boiled eggs cooked like keema with onion, peas and spices.',
         'egg 250 hard-boiled, grated; onion 80; tomato 80; peas 60; ginger 5; garlic 6; garam 1; chilli 1; haldi 0.3; coriander 6; salt; oil 8',
         ['Masala: Sauté onion, ginger and garlic, then add tomato, peas and spices and cook until soft.', 'Eggs: Add the grated eggs and toss for 2 minutes.',
          'Serve: Garnish with coriander and serve with roti.'], serves=3, cook=15)
egg_misc('Egg Fried Rice Bowl (Quick)', 'A one-bowl egg and vegetable rice made with leftover rice.',
         'rice 100 cooked and cooled; egg 100; carrot 30; peas 30; springonion 15; soysauce 5; pepper 0.5; oil 6; salt',
         ['Scramble: Scramble the eggs in oil and push aside.', 'Vegetables: Add the vegetables and stir-fry 2 minutes.',
          'Rice: Add the rice, soy sauce and pepper and toss on high heat.', 'Serve: Top with spring onion.'], serves=1)
egg_misc('Egg Roll (Whole-wheat Kathi)', 'Kolkata-style egg roll made on a whole-wheat roti.',
         'atta 100; egg 100; onion 40 sliced; cucumber 40; lemon 5; chaat 0.5; gchilli 3; salt; oil 6',
         ['Roti: Roll the atta dough into 2 thin rotis and cook lightly on a tawa.', 'Egg layer: Pour a beaten egg on the tawa and immediately place the roti over it; flip once the egg sets.',
          'Fill: Add onion, cucumber, chilli, lemon and chaat masala.', 'Roll & serve: Roll tightly and wrap in paper.'])
egg_misc('Egg Muffins (Baked)', 'Baked egg cups with vegetables, a make-ahead high-protein breakfast.',
         'egg 300; spinach 40; capsicum 40; onion 30; tomato 30; cheese 14; pepper 0.5; salt; oil 3',
         ['Prep: Grease a muffin tray and preheat the oven to 180°C.', 'Mix: Whisk the eggs with chopped vegetables, cheese and seasoning.',
          'Bake: Pour into the cups and bake for 18–20 minutes until set.', 'Serve: Cool slightly and lift out.'], serves=3, cook=20)
egg_misc('Shakshuka Indian Style', 'Eggs poached in a spiced tomato-pepper sauce, Indian masala style.',
         'egg 200; onion 80; capsicum 60; tomato 300 chopped; garlic 8; jeera 1; chilli 1; garam 0.5; coriander 6; salt; oil 8',
         ['Sauce: Sauté onion, garlic and capsicum, add tomatoes and spices and simmer 10 minutes until thick.', 'Eggs: Make wells and crack the eggs into them.',
          'Cook: Cover and cook on low for 6–8 minutes until the whites set.', 'Serve: Garnish with coriander; serve with toast or roti.'], cook=20)

# ---------------- Chicken ----------------
CC = 'Chicken'
CMAR = 'curd 100; ginger 10; garlic 12; haldi 0.5; chilli 2; lemon 10; salt'


def chicken(name, desc, gravy, gravy_txt, main='chickencut 600', mar=CMAR, serves=4, finish='coriander 8', sub='Chicken Curry', simmer=20, mar_txt='', tips=()):
    g = [('Chicken & Marinade', f'{main}; {mar}'), ('For the Gravy', gravy), ('To Finish', finish)]
    steps = [
        f'Marinate: {mar_txt or "Wash and drain the chicken. Mix with the marinade ingredients and refrigerate for at least 30 minutes (overnight is best)."}',
        f'Make the masala: {gravy_txt}',
        'Add the chicken: Add the marinated chicken and cook on high flame for 4–5 minutes, stirring, until it changes colour and is coated in masala.',
        f'Simmer: Add water as needed, cover and simmer on low flame for {simmer} minutes, stirring occasionally, until the chicken is tender and cooked through.',
        'Check: The chicken is done when the juices run clear and there is no pink near the bone.',
        f'Finish & serve: Add the {names(finish) or "garnish"} and serve hot.',
    ]
    recipe(name, CC, desc, serves, 40, 20 + simmer, g, steps,
           tips=list(tips) + ['Use skinless chicken to cut saturated fat.', 'Simmer gently; boiling hard makes chicken tough.'],
           serve=NV_SERVE, store='keeps in the fridge for 2 days; freezes for 1 month.', sub=sub, level='Medium')


CG = 'oil 15; jeera 1.5; bayleaf 0.2; cinnamon 1; cardamom 0.4; clove 0.2; onion 200 finely chopped; ginger 8; garlic 10; gchilli 3; tomato 200 puréed; dhania 4; chilli 1.5; garam 2; water 250; salt'
CG_TXT = 'Heat oil, add the whole spices and fry for 30 seconds. Add the onion and sauté for 10–12 minutes until deep golden. Add ginger, garlic and chilli, then the tomato purée and powdered spices, and cook until the oil separates.'
chicken('Homestyle Chicken Curry', 'A comforting, everyday chicken curry in a rich onion-tomato gravy.', CG, CG_TXT)
chicken('Butter Chicken (Lighter)', 'A lighter home version of the iconic murgh makhani, with grilled chicken and very little butter and cream.',
        'butter 10; oil 5; ginger 8; garlic 10; tomato 400; cashew 20 soaked; chilli 2; kasuri 2; honey 7; garam 1; cream 30; water 150; salt',
        'Cook tomatoes, cashews, ginger and garlic in butter and oil for 10 minutes; blend smooth and strain. Simmer the sauce with chilli powder, garam masala and honey for 8 minutes.',
        main='chicken 500', mar=CMAR + '; tandoori 4', simmer=8, finish='kasuri 1; cream 15; coriander 4',
        mar_txt='Marinate the boneless chicken for 1 hour, then grill or pan-sear until charred and just cooked.')
chicken('Chicken Tikka Masala', 'Charred chicken tikka in a smoky, spiced tomato-onion gravy.',
        'oil 10; jeera 1; onion 150 chopped; ginger 8; garlic 10; tomato 250 puréed; capsicum 80 diced; chilli 2; dhania 3; garam 1; kasuri 1; water 150; salt',
        'Sauté onion until golden, add ginger-garlic, tomato purée and spices and cook until thick. Add the capsicum for 2 minutes.',
        main='chicken 500', mar=CMAR + '; tandoori 4; mustardoil 5', simmer=8, mar_txt='Marinate the chicken for 1 hour, then grill, air-fry or pan-sear until charred.')
chicken('Kadai Chicken', 'Chicken and capsicum in a freshly ground, spicy kadai masala.',
        'oil 15; dhaniaseed 5; redchilli 4; onion 150 chopped; ginger 8; garlic 10; tomato 200 chopped; capsicum 120 diced; kasuri 1; garam 1; salt; water 100',
        'Dry-roast coriander seeds and red chillies and crush coarsely. Sauté onion until golden, add ginger-garlic and tomatoes and cook until soft, then add the kadai masala.')
chicken('Chicken Korma (Lighter)', 'Chicken in a mild, aromatic gravy of onion, curd and cashew.',
        'oil 12; cardamom 0.6; clove 0.2; cinnamon 1; onion 200 sliced, browned and ground; cashew 15 ground; curd 120; garam 1; saffron; water 200; salt',
        'Fry the whole spices in oil, add the browned-onion paste and cashew paste and cook for 5 minutes. Stir in the whisked curd on low flame.')
chicken('Chicken Chettinad', 'Fiery, peppery chicken curry from Tamil Nadu with roasted spices and coconut.',
        'oil 15; curryleaf 2; onion 150 chopped; ginger 8; garlic 10; tomato 150; coconut 30; dhaniaseed 5; redchilli 5; peppercorn 3; saunf 2; poppy 3; cinnamon 1; clove 0.2; stoneflower 1; haldi 0.5; water 250; salt',
        'Dry-roast coconut, coriander seeds, red chillies, pepper, fennel, poppy seeds and whole spices and grind to a paste. Sauté curry leaves and onion until golden, add ginger-garlic and tomato, then the ground masala, and cook 5 minutes.')
chicken('Pepper Chicken (Dry)', 'South Indian dry chicken with lots of crushed black pepper and curry leaves.',
        'oil 15; curryleaf 2; onion 150 sliced; ginger 8; garlic 10; peppercorn 6 crushed; saunf 1.5; dhania 3; garam 1; salt; water 60',
        'Sauté curry leaves and onion until golden, add ginger-garlic and the spices.', simmer=15, finish='peppercorn 2 crushed; coriander 6')
chicken('Saag Chicken (Palak Chicken)', 'Chicken simmered in a garlicky spinach gravy, high in protein and iron.',
        'oil 12; jeera 1; onion 120; ginger 8; garlic 12; gchilli 3; tomato 100; spinach 300 blanched, puréed; garam 1; dhania 2; water 100; salt',
        'Sauté onion until golden, add ginger, garlic, chilli and tomato and cook until soft. Add the spinach purée and spices.')
chicken('Kerala Chicken Stew', 'Mild, fragrant chicken and vegetables simmered in coconut milk, Kerala style.',
        'coconutoil 12; cinnamon 1; cardamom 0.4; clove 0.2; peppercorn 2; curryleaf 1.5; onion 120 sliced; ginger 10; gchilli 6; potato 150 cubed; carrot 80; coconutmilk 400; salt',
        'Fry the whole spices and curry leaves, add onion, ginger and green chillies and sauté until soft. Add potato, carrot and half the coconut milk.',
        mar='pepper 1; salt', simmer=20, finish='curryleaf 1', mar_txt='Season the chicken with salt and pepper.')
chicken('Chicken Do Pyaza', 'Chicken with onions added twice: cooked into the gravy and tossed in as petals.',
        'oil 15; jeera 1; onion 150 chopped; onion 150 petals; ginger 8; garlic 10; tomato 150; chilli 1.5; dhania 3; garam 1; water 150; salt',
        'Sauté onion petals for 2 minutes and keep aside. Sauté chopped onion until golden, add ginger-garlic, tomato and spices and cook until thick; add the petals with the chicken.')
chicken('Methi Chicken', 'Chicken curry with fresh fenugreek leaves, aromatic and slightly bitter.', CG + '; methi 80 chopped', CG_TXT + ' Add the methi and cook for 3 minutes.')
chicken('Achari Chicken', 'Chicken in a tangy gravy flavoured with pickling spices.',
        'mustardoil 15; saunf 2; kalonji 1; methiseed 0.5; mustard 1; onion 150; ginger 8; garlic 10; tomato 150; curd 80; chilli 1.5; amchur 2; haldi 0.5; water 150; salt',
        'Heat mustard oil until it smokes, lower the flame and add the pickle spices. Sauté the onion until golden, add ginger-garlic and tomato, then the spices. Stir in the whisked curd on low flame.')
chicken('Chicken Sukka (Mangalorean)', 'A dry Mangalorean chicken with roasted coconut and spices.',
        'coconutoil 12; onion 120; garlic 10; coconut 60 roasted; dhaniaseed 4; redchilli 5; peppercorn 2; jeera 1; methiseed 0.5; tamarind 5; haldi 0.5; salt; water 80',
        'Roast the spices and grind with the roasted coconut. Sauté onion and garlic, add the masala and tamarind and cook for 5 minutes.', simmer=18)
chicken('Hyderabadi Chicken Curry', 'Tangy, spicy Hyderabadi-style chicken with curd and mint.', CG + '; mint 15; curd 60', CG_TXT + ' Add mint and whisked curd.')
chicken('Chicken Xacuti (Lighter)', 'Goan chicken curry with roasted coconut and a complex spice blend.',
        'oil 12; onion 150; coconut 50 roasted; poppy 4; dhaniaseed 4; redchilli 5; peppercorn 2; jeera 1; saunf 1; cinnamon 1; clove 0.2; stoneflower 1; nutmeg; tamarind 5; water 250; salt',
        'Dry-roast the coconut and all the spices and grind to a paste. Sauté onion until golden, add the paste and cook 5 minutes.')
chicken('Chicken Cafreal', 'Goan green chicken marinated in coriander, mint and spices, then pan-roasted.',
        'oil 12; onion 100 sliced; lemon 10; water 80; salt', 'Sauté the onion until golden.', main='chickencut 600',
        mar='coriander 50; mint 15; gchilli 9; ginger 10; garlic 15; jeera 1; peppercorn 2; cinnamon 1; clove 0.2; vinegar 15; haldi 0.5; salt',
        mar_txt='Grind all the marinade ingredients to a smooth green paste, coat the chicken and marinate for at least 2 hours.', simmer=20)
chicken('Chicken Kolhapuri', 'Fiery Kolhapuri chicken with a roasted coconut-sesame masala.',
        'oil 15; onion 150; ginger 8; garlic 10; tomato 120; coconut 40 roasted; sesame 6; dhaniaseed 4; redchilli 6; peppercorn 2; clove 0.2; cinnamon 1; haldi 0.5; water 250; salt',
        'Roast and grind the coconut, sesame and spices. Sauté onion until golden, add ginger-garlic and tomato, then the ground masala.')
chicken('Lemon Pepper Chicken', 'Light, zesty pan-cooked chicken with lemon and crushed pepper.',
        'oliveoil 10; garlic 12 chopped; onion 80 sliced; peppercorn 4 crushed; lemon 20; oregano 0.5; salt; water 60',
        'Sauté garlic and onion in oil until soft, then add pepper and oregano.', main='chicken 500', mar='lemon 15; pepper 1; garlic 6; salt', simmer=10,
        finish='lemon 10; coriander 6')
chicken('Chilli Chicken (Lighter)', 'Indo-Chinese chilli chicken, pan-seared instead of deep-fried.',
        'oil 12; garlic 15; ginger 8; gchilli 9 slit; onion 100 petals; capsicum 120 squares; soysauce 15; vinegar 10; chilli 3; cornflour 8; springonion 30; water 80',
        'Pan-sear the coated chicken until golden. Stir-fry garlic, ginger and chillies on high heat, add onion and capsicum, then the sauces and cornflour slurry.',
        main='chicken 500', mar='soysauce 5; pepper 1; cornflour 10; egg 50; salt', simmer=3, finish='springonion 15')
chicken('Chicken Keema Matar', 'Spiced chicken mince with green peas, quick and protein-packed.',
        'oil 12; jeera 1; bayleaf 0.2; onion 150; ginger 8; garlic 10; tomato 150; peas 150; chilli 1.5; dhania 3; garam 1; water 100; salt', CG_TXT,
        main='chickenmince 500', mar='haldi 0.5; salt', simmer=12, mar_txt='Keep the chicken mince ready; no marinating is needed.')
chicken('Chicken Ghee Roast (Lighter)', 'Mangalorean ghee roast made with half the ghee: tangy, spicy and aromatic.',
        'ghee 15; redchilli 8 roasted; dhaniaseed 4; jeera 1; peppercorn 2; methiseed 0.5; garlic 10; tamarind 10; jaggery 5; curryleaf 1.5; salt',
        'Roast the spices and red chillies and grind with garlic and tamarind into a thick paste. Cook the paste in ghee until it darkens and smells nutty.', simmer=15)
chicken('Rara Chicken', 'Punjabi chicken curry cooked with chicken keema in the gravy, rich and protein-packed.', CG + '; chickenmince 150', CG_TXT + ' Add the mince and cook 8 minutes.')
chicken('Chicken Curry with Vegetables', 'A balanced one-pot chicken curry with potatoes, carrots and beans.', CG + '; potato 150; carrot 80; beans 80', CG_TXT)
chicken('Coconut Chicken Curry', 'Chicken in a mildly spiced coconut milk gravy.',
        'coconutoil 12; mustard 2; curryleaf 1.5; onion 150; ginger 8; garlic 10; tomato 120; haldi 0.5; chilli 1.5; dhania 3; garam 1; coconutmilk 300; salt',
        'Crackle mustard seeds, add curry leaves and onion and sauté until golden. Add ginger, garlic, tomato and spices, then the coconut milk.')
chicken('Bengali Chicken Kosha', 'Slow-cooked Bengali chicken with a deep, caramelised onion masala.',
        'mustardoil 15; bayleaf 0.2; cinnamon 1; cardamom 0.4; clove 0.2; onion 200; ginger 10; garlic 10; tomato 100; curd 80; haldi 0.5; chilli 2; jeerapowder 2; garam 1; sugar 3; salt',
        'Heat mustard oil, add whole spices and sugar, then the onions, and cook slowly until dark brown. Add ginger, garlic, tomato and curd, and keep stirring (kosha) until the masala is thick and glossy.', simmer=25)


def grilled(name, desc, main, mar, serves=3, mins=18, sub='Tandoori / Grill'):
    g = [('Main', main), ('For the Marinade', mar), ('To Serve', 'onion 60 rings; lemon 10; chaat 1; mint 4')]
    steps = [
        f'Prepare: Clean the {names(main)}, pat dry and make deep slits so the marinade penetrates.',
        'First marinade: Rub with lemon juice, salt and chilli and rest for 15 minutes.',
        'Second marinade: Mix the remaining marinade ingredients into a thick paste, coat well and refrigerate for at least 2 hours (overnight is best).',
        'Preheat: Preheat the oven or air fryer to 200°C.',
        f'Grill: Grill for {mins}–{mins + 5} minutes, turning once and brushing with a few drops of oil, until charred at the edges and cooked through.',
        'Rest & serve: Rest for 3 minutes, sprinkle chaat masala and lemon and serve with onion rings and mint chutney.',
    ]
    recipe(name, CC if 'chicken' in main else ('Fish & Seafood' if ('fish' in main or 'prawn' in main or 'pomfret' in main) else 'Mutton'), desc, serves, 30, mins + 5, g, steps,
           tips=['Hung curd marinade keeps the meat juicy without frying.', 'Check doneness at the thickest part; there should be no pink.'],
           serve=['mint chutney, onion rings and a green salad.', '<b>Best time:</b> a high-protein starter or dinner.'],
           store='marinated meat keeps in the fridge for 1 day; cooked tikka keeps 1 day.', sub=sub, level='Medium')


TM = 'hungcurd 120; ginger 10; garlic 12; chilli 3; tandoori 5; garam 1; kasuri 1; lemon 15; mustardoil 10; salt'
grilled('Tandoori Chicken', 'The iconic smoky, charred tandoori chicken, made in an oven or air fryer.', 'chickencut 700 leg and breast pieces', TM, mins=25)
grilled('Chicken Tikka', 'Juicy boneless chicken tikka, grilled with peppers and onion.', 'chicken 500 cubed; capsicum 100; onion 100', TM, mins=15)
grilled('Malai Chicken Tikka (Lighter)', 'Mild, creamy chicken tikka with cashew, curd and cardamom.', 'chicken 500 cubed',
        'hungcurd 120; cashew 15 ground; cheese 14; ginger 10; garlic 12; gchilli 3; elaichipowder 0.5; pepper 1; lemon 10; salt', mins=15)
grilled('Hariyali Chicken Tikka', 'Chicken tikka in a vibrant mint-coriander-spinach marinade.', 'chicken 500 cubed',
        'hungcurd 100; coriander 40; mint 20; spinach 40; gchilli 6; ginger 10; garlic 12; garam 1; lemon 15; salt', mins=15)
grilled('Chicken Seekh Kebab', 'Spiced chicken mince kebabs grilled on skewers.', 'chickenmince 500; onion 60 finely chopped',
        'ginger 10; garlic 12; gchilli 6; coriander 15; mint 8; garam 2; jeerapowder 1; chilli 1; egg 50; besan 15 roasted; salt', mins=14)
grilled('Reshmi Kebab (Lighter)', 'Silky, mild chicken kebabs with a cashew-curd marinade.', 'chicken 500 cubed',
        'hungcurd 100; cashew 15 ground; ginger 10; garlic 12; gchilli 3; pepper 1; elaichipowder 0.5; lemon 10; salt', mins=14)
grilled('Afghani Chicken (Lighter)', 'Creamy, pepper-flavoured Afghani-style grilled chicken.', 'chickencut 600',
        'hungcurd 120; cashew 15; pepper 2; ginger 10; garlic 12; gchilli 3; lemon 10; salt', mins=22)
grilled('Chicken 65 (Air-fried)', 'The spicy South Indian chicken starter, air-fried instead of deep-fried.', 'chicken 450 boneless pieces',
        'curd 50; ginger 8; garlic 10; chilli 3; ricefl 15; cornflour 10; curryleaf 2; pepper 1; lemon 10; salt', mins=14)
grilled('Tandoori Fish', 'Fish fillets in a spicy tandoori marinade, grilled until flaky.', 'fish 500 thick fillets', TM.replace('tandoori 5', 'tandoori 4; ajwain 1'), mins=12)
grilled('Amritsari Fish (Air-fried)', 'Punjabi ajwain-spiced fish, air-fried instead of deep-fried.', 'fish 500 fillets',
        'besan 40; ricefl 10; ajwain 2; ginger 8; garlic 10; chilli 2; lemon 15; chaat 1; salt; water 40', mins=12)
grilled('Tandoori Prawns', 'Juicy prawns in a smoky tandoori marinade.', 'prawn 450 large', TM, mins=8)
grilled('Mutton Seekh Kebab', 'Spiced mutton mince kebabs grilled on skewers.', 'muttonmince 500; onion 60 finely chopped',
        'ginger 10; garlic 12; gchilli 6; coriander 15; mint 8; garam 2; jeerapowder 1; chilli 1; besan 15 roasted; salt', mins=16)
grilled('Tandoori Pomfret', 'Whole pomfret in a tandoori marinade, grilled until crisp at the edges.', 'pomfret 600 whole, cleaned', TM, mins=16)

# ---------------- Mutton ----------------
CM = 'Mutton'


def mutton(name, desc, gravy, gravy_txt, main='mutton 600', mar=CMAR, serves=4, finish='coriander 8', sub='Mutton Curry', whistles='5–6'):
    g = [('Mutton & Marinade', f'{main}; {mar}'), ('For the Gravy', gravy), ('To Finish', finish)]
    steps = [
        'Marinate: Wash the mutton, drain well and mix with the marinade. Refrigerate for at least 2 hours or overnight.',
        f'Make the masala: {gravy_txt}',
        'Bhuno: Add the marinated mutton and cook on high flame, stirring often, for 8–10 minutes until it is well coated and the masala starts to stick.',
        f'Pressure-cook: Add 1½ cups hot water and pressure-cook for {whistles} whistles on medium flame (or simmer covered for 1½ hours) until the mutton is tender.',
        'Reduce: Open the cooker and simmer uncovered to the consistency you like.',
        f'Finish & serve: Skim off any surface fat, add the {names(finish) or "garnish"} and serve hot.',
    ]
    recipe(name, CM, desc, serves, 40, 60, g, steps,
           tips=['Choose lean cuts and trim visible fat to lower saturated fat.', 'Skim the fat that rises after cooking; it makes a big difference.'],
           serve=NV_SERVE, store='keeps in the fridge for 2 days; tastes better the next day. Freezes for 1 month.', sub=sub, level='Medium')


MG = 'oil 15; bayleaf 0.2; cinnamon 1; cardamom 0.4; blackcardamom 1; clove 0.2; onion 200 sliced; ginger 10; garlic 12; tomato 150 puréed; chilli 2; dhania 4; garam 2; salt'
MG_TXT = 'Heat oil, add the whole spices, then the onions, and sauté until deep golden (12–15 minutes). Add ginger and garlic, then the tomato purée and powdered spices, and cook until the oil separates.'
mutton('Mutton Curry (Homestyle)', 'Tender mutton slow-cooked in a rich onion-tomato gravy, a Sunday lunch classic.', MG, MG_TXT)
mutton('Rogan Josh (Lighter)', 'Kashmiri lamb curry with deep red colour from Kashmiri chillies and fennel, made with less oil.',
       'oil 15; bayleaf 0.2; cardamom 0.4; blackcardamom 1; clove 0.2; cinnamon 1; hing; chilli 4; sounthpowder 3; dryginger 2; garam 1; curd 150; salt',
       'Heat oil, add whole spices and hing. Add the mutton and sear, then add Kashmiri chilli paste, fennel and dry ginger powder, followed by whisked curd a little at a time.')
mutton('Keema Matar', 'Mutton mince with green peas in a spiced masala, quick and full of flavour.',
       'oil 12; jeera 1; bayleaf 0.2; onion 150 chopped; ginger 8; garlic 10; tomato 150; peas 150; chilli 1.5; dhania 3; garam 1.5; salt', MG_TXT,
       main='muttonmince 500', mar='haldi 0.5; salt', whistles='3')
mutton('Mutton Stew (Kerala)', 'Mild Kerala mutton stew with potatoes in coconut milk, perfect with appam.',
       'coconutoil 12; cinnamon 1; cardamom 0.4; clove 0.2; peppercorn 2; curryleaf 1.5; onion 120 sliced; ginger 10; gchilli 6; potato 200; carrot 80; coconutmilk 400; salt',
       'Fry the whole spices, curry leaves, onion, ginger and chillies until soft. Add the mutton, vegetables and thin coconut milk.', mar='pepper 1; salt')
mutton('Saag Gosht', 'Mutton slow-cooked with spinach and mustard greens.', MG + '; spinach 250 puréed; sarson 100 puréed', MG_TXT + ' Add the greens purée in the last 15 minutes.')
mutton('Mutton Korma (Lighter)', 'A royal Mughlai korma made with browned onion paste and curd, with less fat.',
       'oil 15; cardamom 0.6; clove 0.2; cinnamon 1; bayleaf 0.2; onion 200 browned, ground; cashew 15; curd 150; garam 1; saffron; kewra 0; salt'.replace('; kewra 0', ''),
       'Fry the whole spices, add the browned-onion paste and cashew paste and cook 5 minutes. Stir in the whisked curd on low flame.')
mutton('Laal Maas (Lighter)', 'Rajasthani fiery red mutton curry with Mathania chillies, made with less ghee.',
       'ghee 10; oil 5; clove 0.2; cardamom 0.4; bayleaf 0.2; onion 150; garlic 15; kashmirichilli 8 soaked, ground; dhania 4; curd 150; salt',
       'Heat ghee and oil, add whole spices and onion and cook until golden. Add garlic and the chilli paste and cook 3 minutes, then the whisked curd.')
mutton('Mutton Sukka', 'Dry Mangalorean mutton with roasted coconut and spices.',
       'coconutoil 12; onion 120; garlic 10; coconut 60 roasted; dhaniaseed 4; redchilli 5; peppercorn 2; jeera 1; methiseed 0.5; tamarind 5; haldi 0.5; salt',
       'Roast the spices and grind with the coconut. Sauté onion and garlic, add the masala and tamarind and cook 5 minutes.')
mutton('Mutton Pepper Fry', 'South Indian dry mutton with crushed black pepper and curry leaves.',
       'oil 15; curryleaf 2; onion 150 sliced; ginger 8; garlic 10; peppercorn 6 crushed; saunf 1.5; dhania 3; garam 1; salt',
       'Sauté curry leaves and onion until golden, add ginger-garlic and the spices.', finish='peppercorn 2; coriander 6')
mutton('Bhuna Gosht', 'Mutton slow-roasted in its own juices with a thick, dark masala.', MG, MG_TXT + ' Keep stirring (bhuno) until the masala darkens and clings to the meat.')
mutton('Mutton Dalcha', 'Hyderabadi mutton cooked with chana dal and bottle gourd, a protein-packed one-pot curry.', MG + '; chanadal 100 soaked; lauki 200; tamarind 10',
       MG_TXT + ' Cook the chana dal separately until soft and add it with the lauki and tamarind.')
mutton('Mutton Do Pyaza', 'Mutton with onions cooked two ways.', MG + '; onion 150 petals', MG_TXT + ' Add sautéed onion petals at the end.')
mutton('Kosha Mangsho (Lighter)', 'Bengali slow-cooked mutton with a dark, glossy onion masala.',
       'mustardoil 15; bayleaf 0.2; cinnamon 1; cardamom 0.4; clove 0.2; sugar 3; onion 250; ginger 10; garlic 10; curd 100; haldi 0.5; chilli 2; jeerapowder 2; garam 1; potato 150; salt',
       'Heat mustard oil, add whole spices and sugar, then the onions, and cook slowly until dark brown. Add ginger, garlic and curd and stir constantly (kosha) until glossy.')
mutton('Mutton Keema with Methi', 'Mutton mince cooked with fresh fenugreek leaves.',
       'oil 12; jeera 1; onion 150; ginger 8; garlic 10; tomato 150; methi 100 chopped; chilli 1.5; dhania 3; garam 1.5; salt', MG_TXT + ' Add the methi in the last 10 minutes.',
       main='muttonmince 500', mar='haldi 0.5; salt', whistles='3')
mutton('Nihari (Lighter)', 'Slow-cooked Mughlai mutton stew with a fragrant nihari spice blend and less fat.',
       'oil 15; onion 150; ginger 10; garlic 12; atta 15 roasted; saunf 2; dryginger 2; peppercorn 2; blackcardamom 1; cinnamon 1; clove 0.2; mace; nutmeg; chilli 2; salt',
       'Brown the onions in oil, add ginger-garlic and the ground nihari spices. Thicken at the end with roasted atta mixed in water.', whistles='8–10',
       finish='ginger 8 julienned; lemon 10; coriander 8; gchilli 3')
mutton('Mutton Chettinad', 'Mutton in a fiery, peppery roasted Chettinad masala.',
       'oil 15; curryleaf 2; onion 150; ginger 8; garlic 10; tomato 150; coconut 30; dhaniaseed 5; redchilli 5; peppercorn 3; saunf 2; poppy 3; cinnamon 1; clove 0.2; stoneflower 1; haldi 0.5; salt',
       'Roast and grind the coconut and spices. Sauté curry leaves and onion, add ginger-garlic and tomato, then the ground masala.')

# ---------------- Fish & Seafood ----------------
CF = 'Fish & Seafood'


def fishcurry(name, desc, gravy, gravy_txt, main='fish 500 thick pieces', serves=4, finish='coriander 6', sub='Fish Curry', simmer=8):
    g = [('Fish', f'{main}; haldi 0.5; chilli 1; salt'), ('For the Curry', gravy), ('To Finish', finish)]
    steps = [
        f'Clean & season: Wash the {names(main)} well, pat dry and rub with turmeric, chilli and salt. Rest for 15 minutes.',
        'Sear (optional): Lightly sear the pieces in a non-stick pan with a few drops of oil for 1 minute per side; this helps them hold their shape.',
        f'Make the curry: {gravy_txt}',
        'Boil: Add water as needed, check the salt and bring to a gentle boil.',
        f'Add the fish: Slide in the pieces in a single layer. Simmer for {simmer} minutes without stirring; swirl the pan gently instead.',
        'Rest & serve: Switch off, cover and rest for 10 minutes so the flavours develop. Serve hot.',
    ]
    recipe(name, CF, desc, serves, 20, 25, g, steps,
           tips=['Do not stir after adding the fish; swirl the pan so the pieces stay whole.', 'Fish cooks fast; it is done when it flakes easily.'],
           serve=['steamed rice or red rice, with a vegetable side.', '<b>Best time:</b> lunch.'],
           store='keeps in the fridge for 1 day. Reheat gently.', sub=sub, level='Medium')


fishcurry('Kerala Fish Curry (Meen Curry)', 'Tangy, red Kerala fish curry with kokum (kudampuli) and coconut oil.',
          'coconutoil 12; mustard 2; methiseed 0.5; curryleaf 2; shallot 60; ginger 10; garlic 10; gchilli 6; chilli 3; dhania 2; haldi 0.5; kokum 9; water 300; salt',
          'Heat coconut oil, crackle mustard and methi seeds, add curry leaves, shallots, ginger, garlic and green chillies and sauté until soft. Add the powdered spices with a little water, then the soaked kokum.')
fishcurry('Goan Fish Curry', 'Goan coconut fish curry with red chillies and tamarind.',
          'oil 10; onion 80; coconut 80; redchilli 6; dhaniaseed 3; jeera 1; peppercorn 1; haldi 0.5; garlic 8; ginger 5; tamarind 15; gchilli 3; water 300; salt',
          'Grind coconut with red chillies, spices, garlic and ginger to a smooth paste. Sauté onion in oil, add the paste and tamarind and simmer for 8 minutes.')
fishcurry('Bengali Macher Jhol', 'A light Bengali fish stew with potatoes and panch phoron.',
          'mustardoil 12; panchphoron 2; bayleaf 0.2; gchilli 6; potato 150 sliced; tomato 80; ginger 8; haldi 0.5; jeerapowder 2; chilli 1; water 400; salt',
          'Heat mustard oil, add panch phoron, bay leaf and chillies, then the potatoes, and fry 3 minutes. Add tomato, ginger and spices, then water, and cook until the potatoes are soft.')
fishcurry('Shorshe Mach (Mustard Fish)', 'Bengali fish in a pungent mustard and green chilli sauce.',
          'mustardoil 15; kalonji 1; gchilli 6; kasundi 30; poppy 5; haldi 0.5; water 200; salt',
          'Soak and grind mustard seeds with poppy seeds and green chillies to a paste. Heat mustard oil, add kalonji and slit chillies, then the paste with water and turmeric.')
fishcurry('Fish Moilee', 'A mild, creamy Kerala fish stew in coconut milk with ginger and curry leaves.',
          'coconutoil 12; mustard 2; curryleaf 2; onion 100 sliced; ginger 10; garlic 8; gchilli 6; tomato 80; haldi 0.5; pepper 1; coconutmilk 360; salt',
          'Sauté onion, ginger, garlic and green chillies in coconut oil until soft. Add turmeric, pepper and tomato, then the thin coconut milk.')
fishcurry('Andhra Fish Pulusu', 'Tangy, spicy Andhra tamarind fish curry.',
          'oil 12; mustard 2; methiseed 0.5; curryleaf 2; onion 120; tomato 100; tamarind 25; chilli 3; dhania 3; haldi 0.5; jaggery 3; water 300; salt',
          'Temper mustard and methi seeds and curry leaves, sauté onion and tomato, add the spices and tamarind extract and simmer 10 minutes.')
fishcurry('Rohu Kalia (Lighter)', 'Bengali festive fish curry with onion, curd and whole spices.',
          'mustardoil 12; bayleaf 0.2; cinnamon 1; cardamom 0.4; clove 0.2; onion 120 paste; ginger 8; curd 80; haldi 0.5; chilli 1.5; jeerapowder 2; garam 1; water 200; salt',
          'Heat mustard oil with whole spices, add onion paste and ginger and cook until golden. Add whisked curd and spices.')
fishcurry('Fish Curry (North Indian Style)', 'Fish in a homestyle onion-tomato gravy.',
          'oil 12; jeera 1; onion 150; ginger 8; garlic 10; tomato 150 puréed; chilli 1.5; dhania 3; garam 1; water 300; salt',
          'Sauté onion until golden, add ginger-garlic, tomato purée and spices and cook until the oil separates.')
fishcurry('Mackerel Curry (Bangda Curry)', 'Coastal Konkani mackerel curry with coconut and kokum.',
          'oil 10; onion 60; coconut 80; redchilli 6; dhaniaseed 3; haldi 0.5; kokum 9; water 300; salt',
          'Grind coconut with red chillies, coriander seeds and turmeric. Sauté onion, add the paste, water and kokum and simmer.', main='mackerel 500 cleaned, cut')
fishcurry('Prawn Curry (Coconut)', 'Prawns in a mildly spiced coconut curry, Konkan style.',
          'oil 10; onion 80; coconut 80; redchilli 5; dhaniaseed 3; haldi 0.5; garlic 6; tamarind 10; water 250; salt',
          'Grind coconut with chillies, coriander seeds, garlic and turmeric. Sauté onion, add the paste, tamarind and water and simmer 5 minutes.', main='prawn 450', simmer=4)
fishcurry('Prawn Malai Curry (Lighter)', 'Bengali chingri malai curry with coconut milk and whole spices.',
          'mustardoil 10; bayleaf 0.2; cinnamon 1; cardamom 0.4; clove 0.2; onion 100 paste; ginger 8; haldi 0.5; chilli 1; coconutmilk 300; sugar 3; salt',
          'Heat oil with the whole spices, add onion paste and ginger and cook until golden. Add spices and coconut milk.', main='prawn 450', simmer=4)
fishcurry('Prawn Masala', 'Spicy prawns in a thick onion-tomato masala.',
          'oil 12; jeera 1; onion 150; ginger 8; garlic 10; tomato 150; chilli 2; dhania 3; garam 1; water 80; salt',
          'Sauté onion until golden, add ginger-garlic, tomato and spices and cook until thick.', main='prawn 450', simmer=4)
fishcurry('Crab Curry', 'Spicy coastal crab curry with coconut and pepper.',
          'oil 12; onion 120; tomato 100; coconut 60; redchilli 5; dhaniaseed 3; peppercorn 2; saunf 1; garlic 8; ginger 5; haldi 0.5; water 300; salt',
          'Roast and grind the coconut and spices. Sauté onion and tomato, add the paste and water.', main='crab 800 cleaned', simmer=15)
fishcurry('Fish Tikka Masala', 'Grilled fish tikka in a spiced tomato gravy.',
          'oil 10; onion 120; ginger 8; garlic 10; tomato 200 puréed; cashew 10; chilli 1.5; dhania 2; garam 1; kasuri 1; water 150; salt',
          'Sauté onion until golden, add ginger-garlic, tomato purée, cashews and spices and cook until thick.', simmer=4)


def fishfry(name, desc, main, masala, serves=3, sub='Fish Fry'):
    g = [('Fish', main), ('For the Masala', masala), ('For Cooking', 'oil 15')]
    steps = [
        f'Clean: Wash the {names(main)}, pat completely dry and make shallow slits.',
        'Make the masala: Mix the masala ingredients into a thick paste with lemon juice (no water).',
        'Coat: Rub the paste all over the fish, into the slits, and rest for 20–30 minutes.',
        'Heat the pan: Heat a non-stick or cast-iron tawa on medium flame and brush with oil.',
        'Shallow-fry: Place the fish and cook for 3–4 minutes per side, drizzling a little oil around, until crisp and cooked through.',
        'Serve: Serve hot with onion rings and lemon wedges.',
    ]
    recipe(name, CF, desc, serves, 30, 10, g, steps,
           tips=['Pat the fish completely dry; moisture stops it from crisping.', 'Flip only once to keep the pieces whole.'],
           serve=['onion rings, lemon wedges and rice with dal or rasam.', '<b>Best time:</b> lunch.'], store='best eaten fresh.', sub=sub)


FM = 'ginger 5; garlic 8; chilli 3; haldi 0.5; dhania 2; lemon 15; ricefl 15; salt'
fishfry('Tawa Fish Fry', 'Spicy, crisp fish slices shallow-fried on a tawa, coastal style.', 'fish 500 thick slices', FM)
fishfry('Surmai Rava Fry', 'Konkani king fish coated in spiced semolina and pan-fried until crisp.', 'fish 500 surmai or any firm fish', FM + '; rava 40')
fishfry('Pomfret Fry', 'Whole pomfret with a spicy masala, pan-fried until crisp.', 'pomfret 500 whole, cleaned', FM)
fishfry('Kerala Fish Fry (Meen Varuthathu)', 'Kerala-style fish fry with a red masala and curry leaves.', 'fish 500 slices', FM + '; pepper 1; curryleaf 2')
fishfry('Mackerel Fry (Bangda Fry)', 'Spicy pan-fried mackerel, rich in omega-3 fats.', 'mackerel 500 whole, cleaned', FM)
fishfry('Prawn Rava Fry', 'Crisp semolina-coated prawns, pan-fried.', 'prawn 400 large', FM + '; rava 40')
fishfry('Lemon Garlic Fish', 'Light pan-seared fish with lemon, garlic and herbs.', 'fish 500 fillets', 'garlic 12; lemon 20; pepper 1.5; oregano 1; salt')
egg_misc('Mutta Pulusu (Egg Drop Curry)', 'Andhra-style tangy tamarind curry with eggs poached directly in the gravy.',
         'egg 200; oil 10; mustard 2; curryleaf 1.5; onion 120 sliced; tomato 100 chopped; tamarind 15; haldi 0.5; chilli 2; dhania 2; jaggery 3; salt; water 250; coriander 6',
         ['Temper: Heat oil, crackle mustard seeds and add curry leaves and onion. Sauté until soft.',
          'Gravy: Add tomato, turmeric, chilli and coriander powder, then the tamarind extract, jaggery, salt and water. Simmer for 10 minutes until slightly thick.',
          'Poach the eggs: Gently crack the eggs one by one into the simmering gravy, spacing them apart.',
          'Cook: Cover and cook on low flame for 8 minutes without stirring, until the eggs are fully set.',
          'Serve: Garnish with coriander and serve with hot rice.'], serves=2, cook=20)
