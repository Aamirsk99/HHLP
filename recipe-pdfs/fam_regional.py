"""Sandwiches & wraps, and regional specialities written out individually."""
from core import recipe
from util import names, allnames

# ---------------- Sandwiches & wraps ----------------
CW = 'Sandwiches & Wraps'


def sandwich(name, filling, desc, bread='bread 120', spread='mint 5 as green chutney; hungcurd 20', toast=True, serves=2, prep_txt='', sub='Sandwich'):
    g = [('Bread & Spread', f'{bread}; {spread}'), ('For the Filling', filling)]
    steps = [
        f'Prepare the filling: {prep_txt or f"Slice or mix the {names(filling)} as listed and season lightly with salt and pepper."}',
        'Spread: Spread green chutney on one slice and hung curd on the other.',
        'Assemble: Layer the filling evenly on one slice and cover with the second.',
        ('Toast: Toast in a sandwich maker or on a tawa with a light brush of oil for 2–3 minutes per side until golden.' if toast else
         'Press: Press gently and cut diagonally.'),
        'Serve: Cut and serve with a salad or a glass of buttermilk.',
    ]
    recipe(name, CW, desc, serves, 10, 6 if toast else 0, g, steps,
           tips=['Use whole-wheat or multigrain bread for more fibre.', 'Hung curd and chutney replace butter and mayonnaise for a lighter sandwich.'],
           serve=['a fresh salad, soup or buttermilk.', '<b>Best time:</b> breakfast, tiffin or a light dinner.'],
           store='best eaten fresh; pack the filling separately for tiffin.', sub=sub, tags=('kids',))


sandwich('Vegetable Grilled Sandwich', 'cucumber 60 sliced; tomato 60 sliced; onion 30 sliced; capsicum 30 sliced; potato 80 boiled, sliced; chaat 1; salt', 'The Mumbai street-style grilled veg sandwich, made lighter.')
sandwich('Paneer Bhurji Sandwich', 'paneer 100 crumbled; onion 30; capsicum 30; tomato 30; haldi 0.2; pavbhaji 1; salt', 'Toasted sandwich with spiced paneer bhurji, rich in protein.',
         prep_txt='Sauté the onion, capsicum and tomato with spices for 2 minutes and add the crumbled paneer.')
sandwich('Sprouts Sandwich', 'sprouts 100 steamed; onion 30; tomato 30; chaat 1; lemon 5; salt', 'A protein-rich sandwich filled with spiced steamed sprouts.')
sandwich('Chicken Tikka Sandwich', 'chicken 120 grilled tikka, shredded; onion 30; lettuce 20; tomato 30', 'A high-protein sandwich with grilled chicken tikka.')
sandwich('Besan Toast', 'besan 50; onion 30; tomato 30; capsicum 20; coriander 4; haldi 0.2; chilli 0.3; salt; water 60', 'Bread slices coated in a spiced besan batter and toasted until crisp.',
         spread='oil 5', prep_txt='Whisk besan with water, vegetables and spices into a thick batter. Dip one side of each slice and cook batter-side down on a greased tawa until golden, then flip.')
sandwich('Bombay Masala Toast (Lighter)', 'potato 150 boiled, spiced; onion 30; tomato 30; cucumber 40; capsicum 30', 'Mumbai’s masala toast with spiced potato and vegetables.')
sandwich('Corn Spinach Sandwich', 'corn 80; spinach 60 sautéed; cheese 14; pepper 0.5; salt', 'A creamy corn and spinach toasted sandwich.')
sandwich('Hummus Veggie Sandwich', 'chickpea 60 as hummus; cucumber 60; tomato 40; lettuce 20; carrot 30 grated', 'A cold sandwich with hummus and crunchy vegetables.', toast=False, spread='lemon 5')
sandwich('Egg Bhurji Sandwich', 'egg 100 scrambled; onion 30; tomato 30; coriander 4; pepper 0.3; salt', 'Toasted sandwich with spiced scrambled eggs.')
sandwich('Tofu Tikka Sandwich', 'tofu 120 grilled tikka; onion 30; capsicum 30; lettuce 20', 'A vegan, protein-rich grilled sandwich.')
sandwich('Cucumber Mint Sandwich (Cold)', 'cucumber 120 thinly sliced; hungcurd 40; mint 4; pepper 0.3; salt', 'A cooling, light tea-time sandwich.', toast=False)
sandwich('Palak Paneer Sandwich', 'paneer 80 grated; spinach 60 sautéed; garlic 2; pepper 0.3; salt', 'Toasted sandwich with spinach and paneer.')


def wrap(name, filling, desc, prep_txt, serves=2, sub='Wrap / Kathi Roll'):
    g = [('For the Rotis', 'atta 120; salt; water 75; oil 5'), ('For the Filling', filling), ('To Assemble', 'onion 40 sliced; mint 5 as green chutney; lemon 5; chaat 1; lettuce 30')]
    steps = [
        'Make the rotis: Knead a soft atta dough, rest 15 minutes and roll into 4 thin rotis. Cook lightly on a tawa.',
        f'Prepare the filling: {prep_txt}',
        'Assemble: Spread green chutney on a warm roti, add lettuce, a portion of the filling and sliced onion.',
        'Season: Sprinkle chaat masala and a squeeze of lemon.',
        'Roll: Roll up tightly and wrap the bottom half in butter paper or foil.',
        'Serve: Serve immediately, or pack for lunch.',
    ]
    recipe(name, CW, desc, serves, 20, 20, g, steps, tips=['Warm the rotis just before rolling so they do not crack.'],
           serve=['a salad or a glass of buttermilk.', '<b>Best time:</b> lunch, tiffin or a quick dinner.'], store='best eaten within 4 hours.', sub=sub, tags=('kids',))


wrap('Paneer Kathi Roll', 'paneer 200 strips; capsicum 60 strips; onion 50; tandoori 3; hungcurd 30; oil 5; salt', 'Whole-wheat roti rolled around spicy tandoori paneer and onions.',
     'Toss the paneer with hung curd, tandoori masala and salt and pan-sear with capsicum and onion until lightly charred.')
wrap('Chicken Kathi Roll', 'chicken 250 strips; onion 50; capsicum 50; tandoori 3; hungcurd 30; oil 5; salt', 'Kolkata-style chicken roll on whole-wheat roti.',
     'Marinate the chicken in curd and tandoori masala for 20 minutes and pan-sear until cooked and charred.')
wrap('Soya Keema Wrap', 'soyagran 70 soaked, squeezed; onion 50; tomato 60; peas 40; garam 1; chilli 0.5; oil 5; salt', 'A high-protein wrap with spicy soya keema.',
     'Sauté onion, tomato and peas, add the soya granules and spices and cook until dry.')
wrap('Rajma Wrap', 'rajma 100 boiled, mashed; onion 40; tomato 40; capsicum 30; jeerapowder 1; chilli 0.5; salt', 'A fibre-rich wrap with spiced mashed rajma.',
     'Cook the mashed rajma with onion, tomato and spices until thick.')
wrap('Veg Frankie', 'potato 150 boiled; carrot 40; cabbage 40; peas 40; chaat 1; garam 0.5; salt; oil 5', 'Mumbai frankie with a spiced potato and vegetable filling.',
     'Mash the potato with the vegetables and spices and shape into long patties; pan-roast until golden.')
wrap('Egg Roll Wrap', 'egg 150; onion 40; gchilli 3; pepper 0.3; salt; oil 5', 'Roti layered with egg and rolled with onion and chutney.',
     'Beat the eggs with salt and pepper, pour on the tawa and place a roti on top; flip once set.')
wrap('Chana Tikki Wrap', 'chickpea 120 boiled, mashed; onion 40; besan 15; garam 1; salt; oil 6', 'Wrap with crisp chickpea tikkis and salad.',
     'Mash the chickpeas with onion, besan and spices, shape into tikkis and pan-roast until crisp.')
wrap('Fish Tikka Wrap', 'fish 250 fillets, cubed; hungcurd 30; tandoori 3; lemon 5; oil 5; salt', 'Wrap with grilled fish tikka and mint chutney.',
     'Marinate the fish in curd and tandoori masala for 15 minutes and grill or pan-sear for 3 minutes per side.')
wrap('Tofu Bhurji Wrap', 'tofu 200 crumbled; onion 40; tomato 40; capsicum 30; haldi 0.3; pavbhaji 1; oil 5; salt', 'A vegan wrap with spicy tofu scramble.',
     'Sauté the vegetables, add tofu and spices and cook for 4 minutes.')
wrap('Mushroom Tikka Wrap', 'mushroom 250; capsicum 50; onion 50; hungcurd 30; tandoori 3; oil 5; salt', 'Wrap with charred tandoori mushrooms.',
     'Marinate the mushrooms and grill or pan-sear until charred.')

# ---------------- Regional specials ----------------
CR = 'Regional Specials'


def special(name, region, desc, ings, steps, serves=4, prep=20, cook=30, level='Medium', tips=(), serve=None, store='keeps in the fridge for 1–2 days.', tags=()):
    recipe(name, CR, desc, serves, prep, cook, ings, steps, tips=list(tips), level=level,
           serve=serve or ['the accompaniments mentioned in the method, with a fresh salad.', '<b>Best time:</b> lunch or dinner.'], store=store, sub=region, tags=tags)


special('Litti Chokha', 'Bihar', 'Bihar’s famous baked whole-wheat balls stuffed with spiced sattu, served with smoky roasted brinjal-tomato chokha.',
        [('For the Litti Dough', 'atta 250; ajwain 1; ghee 10; salt; water 150'),
         ('For the Sattu Filling', 'sattu 150; onion 50; garlic 8; ginger 5; gchilli 6; coriander 8; lemon 15; kalonji 1; ajwain 1; mustardoil 10; salt'),
         ('For the Chokha', 'brinjal 300; tomato 200; potato 150 boiled; onion 40; garlic 6; gchilli 3; mustardoil 5; coriander 6; salt')],
        ['Dough: Knead atta with ajwain, ghee, salt and water into a firm dough. Rest 20 minutes.',
         'Filling: Mix sattu with all the filling ingredients; sprinkle a little water so it holds together.',
         'Stuff: Flatten dough balls, fill with 2 tbsp sattu mixture, seal and roll into balls.',
         'Bake: Bake at 200°C for 25–30 minutes, turning once, until golden and cracked (or cook in an appe pan or on coals).',
         'Roast the vegetables: Roast the brinjal and tomatoes directly on the flame until charred and soft; peel.',
         'Chokha: Mash brinjal, tomato and potato with onion, garlic, chilli, mustard oil, coriander and salt.',
         'Serve: Dip the hot littis lightly in ghee (optional) and serve with chokha.'], cook=40)
special('Dal Baati (Baked)', 'Rajasthan', 'Rajasthani baked wheat dumplings with panchmel dal, made with less ghee.',
        [('For the Baati', 'atta 200; rava 30; ajwain 1; ghee 20; curd 30; soda 0.5; salt; water 80'),
         ('For the Dal', 'toor 40; chanadal 40; moong 30; masoor 30; urad 20; haldi 1; salt; water 800'),
         ('For the Tadka', 'ghee 10; jeera 2; hing; onion 80; tomato 100; ginger 5; garlic 8; chilli 1.5; garam 1')],
        ['Dough: Mix atta, rava, ajwain, ghee, curd, soda and salt; knead a stiff dough.', 'Shape: Make 8 balls and press a dent in the centre of each.',
         'Bake: Bake at 200°C for 30–35 minutes, turning, until golden and hard on the outside.',
         'Dal: Pressure-cook the soaked dals with turmeric and salt for 4 whistles; mash.',
         'Tadka: Heat ghee, add cumin, hing, onion, ginger-garlic, tomato and spices; cook until thick and add to the dal.',
         'Serve: Crack the baatis, drizzle 1 tsp ghee and serve with the dal.'], cook=45, level='Medium')
special('Pithla Bhakri', 'Maharashtra', 'A rustic Maharashtrian meal of spiced besan curry (pithla) with jowar bhakri.',
        [('For the Pithla', 'besan 80; water 400; oil 10; mustard 2; jeera 1; hing; garlic 8; gchilli 6; onion 60; haldi 0.5; coriander 8; salt'),
         ('For the Bhakri', 'jowar 200; salt; water 160')],
        ['Batter: Whisk besan with water and salt until lump-free.', 'Temper: Heat oil, crackle mustard and cumin, add hing, garlic, chillies and onion and sauté.',
         'Cook: Add turmeric and the besan mixture and stir continuously for 6–8 minutes until thick and glossy.', 'Garnish: Add coriander.',
         'Bhakri: Knead jowar with hot water, pat into rounds and cook on a tawa, sprinkling water on top; flip and puff.',
         'Serve: Serve pithla hot with bhakri, raw onion and a green chilli thecha.'], serves=3)
special('Zunka', 'Maharashtra', 'A dry, crumbly Maharashtrian besan and onion stir-fry.',
        'besan 100; onion 200 chopped; garlic 8; gchilli 6; mustard 2; jeera 1; hing; haldi 0.5; chilli 1; oil 15; coriander 8; salt; water 60',
        ['Roast the besan: Dry-roast besan for 3 minutes.', 'Temper: Heat oil, crackle mustard and cumin, add garlic, chillies and plenty of onions; sauté until soft.',
         'Add besan: Add turmeric, chilli and the roasted besan and stir well.', 'Steam: Sprinkle water, cover and cook on low for 5 minutes, stirring, until crumbly and cooked.',
         'Serve: Garnish with coriander; serve with bhakri.'], serves=3)
special('Undhiyu (Lighter)', 'Gujarat', 'Gujarat’s winter mixed-vegetable casserole with steamed methi muthia, made with less oil.',
        [('Vegetables', 'sem 150; potato 150; sweetpotato 150; brinjal 150 small; rawbanana 100; suran 100'),
         ('For the Green Masala', 'coconut 50; coriander 40; peanut 25; sesame 10; ginger 8; garlic 8; gchilli 6; jaggery 10; lemon 15; dhania 3; garam 1; salt'),
         ('For the Muthia', 'besan 50; atta 30; methi 60; ginger 5; gchilli 3; salt'), ('For Cooking', 'oil 25; ajwain 1; hing; water 200')],
        ['Masala: Grind or mix the green masala ingredients.', 'Stuff: Slit the small brinjals and potatoes and stuff with some masala; toss the rest with the other vegetables.',
         'Muthia: Make a stiff dough of the muthia ingredients, shape small dumplings and steam for 12 minutes.',
         'Layer: Heat oil with ajwain and hing in a heavy pot, layer the hard vegetables at the bottom and softer ones on top. Add water.',
         'Cook: Cover and cook on low flame for 30–35 minutes until tender, without stirring; shake the pot occasionally.',
         'Finish: Add the muthia for the last 5 minutes and serve with puri or roti.'], cook=45, serves=5, level='Medium')
special('Sev Tameta (Lighter)', 'Gujarat', 'Tangy-sweet Kathiawadi tomato curry, topped with a little sev.',
        'tomato 400 chopped; oil 10; mustard 2; jeera 1; hing; garlic 6; chilli 1.5; haldi 0.5; dhania 2; jaggery 8; besan 20 as roasted sev or roasted besan crumbs; coriander 6; salt; water 120',
        ['Temper: Heat oil, crackle mustard and cumin, add hing and garlic.', 'Tomatoes: Add tomatoes, spices, jaggery and salt and cook until mushy.',
         'Simmer: Add water and simmer for 5 minutes.', 'Serve: Top with a small handful of sev just before serving with roti.'], serves=3)
special('Ringan no Olo', 'Gujarat', 'Gujarati smoky roasted brinjal mash with spring onions and garlic.',
        'brinjal 500 large; springonion 80; garlic 10; tomato 80; gchilli 3; oil 10; jeera 1; chilli 1; haldi 0.3; coriander 6; salt',
        ['Roast: Roast the brinjal over an open flame until charred and soft; peel and mash.', 'Temper: Heat oil, add cumin, garlic and spring onions and sauté.',
         'Cook: Add tomato and spices, then the mashed brinjal, and cook for 6–8 minutes.', 'Serve: Garnish and serve with bajra rotla.'], serves=3)
special('Baingan Bharta', 'Punjab', 'Smoky fire-roasted brinjal mashed with onion, tomato and spices.',
        'brinjal 500 large; onion 100; tomato 150; garlic 10; ginger 5; gchilli 3; oil 10; jeera 1; chilli 1; dhania 2; garam 0.5; coriander 8; salt',
        ['Roast: Brush the brinjal with oil and roast directly on the flame, turning, until completely charred and soft (12–15 minutes).',
         'Peel & mash: Cool, peel off the skin and mash the flesh.', 'Masala: Heat oil, add cumin, onion, ginger, garlic and chilli and sauté until golden. Add tomatoes and spices and cook until soft.',
         'Combine: Add the mashed brinjal and cook for 5 minutes.', 'Serve: Garnish with coriander; serve with roti.'], serves=3)
special('Sarson ka Saag', 'Punjab', 'Punjab’s slow-cooked mustard greens with spinach and bathua, traditionally eaten with makki di roti.',
        [('Greens', 'sarson 500; spinach 200; bathua 100; makki 20; gchilli 6; ginger 10; garlic 10; salt; water 200'),
         ('For the Tadka', 'ghee 10; onion 80; garlic 6; tomato 60; chilli 1')],
        ['Cook the greens: Pressure-cook the chopped greens with chillies, ginger, garlic, salt and water for 4–5 whistles.',
         'Mash: Mash coarsely with a wooden masher, add the makki atta and simmer on low for 15 minutes, stirring.',
         'Tadka: Heat ghee, sauté onion and garlic until golden, add tomato and chilli powder and cook. Pour over the saag.',
         'Serve: Serve hot with makki di roti and a small piece of white butter or jaggery.'], cook=45)
special('Kashmiri Dum Aloo (Lighter)', 'Kashmir', 'Baby potatoes in a red, curd-based Kashmiri gravy with fennel and dry ginger.',
        'potato 400 baby, boiled, peeled; curd 200; mustardoil 15; chilli 3; sounthpowder 3; dryginger 2; cardamom 0.4; clove 0.2; cinnamon 1; hing; garam 1; salt; water 200',
        ['Prick & roast: Prick the boiled potatoes and pan-roast in 1 tsp oil until golden.', 'Temper: Heat mustard oil until it smokes, cool slightly, add whole spices and hing.',
         'Chilli: Add Kashmiri chilli mixed in water and cook 1 minute.', 'Curd: Whisk curd with fennel and dry ginger powder, add on low flame, stirring.',
         'Simmer: Add the potatoes and water and simmer covered for 15 minutes.', 'Serve: Sprinkle garam masala and serve with rice.'])
special('Haak Saag', 'Kashmir', 'Simple Kashmiri collard greens cooked with mustard oil, hing and dry chillies.',
        'sarson 500 (or collard greens); mustardoil 10; hing; redchilli 3; garlic 4; salt; water 300',
        ['Wash: Wash the greens well and keep the leaves whole.', 'Temper: Heat mustard oil until it smokes, cool slightly and add hing, dry red chillies and garlic.',
         'Cook: Add the greens, salt and water, cover and cook for 15–20 minutes until tender.', 'Serve: Serve with rice.'], serves=3)
special('Nadru Yakhni', 'Kashmir', 'Lotus stem in a mild, fennel-scented Kashmiri curd gravy.',
        'lotusstem 300 sliced, boiled; curd 300; oil 10; cardamom 0.4; clove 0.2; bayleaf 0.2; sounthpowder 3; dryginger 2; mint 3 dried; salt; water 150',
        ['Boil: Boil the lotus stem slices for 10 minutes.', 'Temper: Heat oil with whole spices.',
         'Curd: Whisk curd with fennel and dry ginger and add slowly, stirring constantly, until it boils.', 'Simmer: Add the lotus stem and simmer 10 minutes.',
         'Serve: Sprinkle dried mint and serve with rice.'], serves=3)
special('Avial', 'Kerala', 'Kerala’s mixed vegetables in a coconut-curd sauce with coconut oil and curry leaves.',
        'carrot 80; beans 80; rawbanana 80; drumstick 60; ashgourd 100; suran 80; coconut 80; jeera 1; gchilli 6; curd 100; haldi 0.5; coconutoil 10; curryleaf 2; salt; water 120',
        ['Cut: Cut all vegetables into 2-inch batons.', 'Cook: Cook the vegetables with turmeric, salt and water until just tender.',
         'Grind: Coarsely grind coconut, cumin and green chillies.', 'Combine: Add the paste and simmer 3 minutes, then switch off and stir in the whisked curd.',
         'Finish: Drizzle coconut oil and add curry leaves; cover for 5 minutes and serve.'])
special('Olan', 'Kerala', 'A delicate Kerala dish of ash gourd and lobia in coconut milk.',
        'ashgourd 300; lobia 50 soaked, cooked; gchilli 6; coconutmilk 300; coconutoil 8; curryleaf 2; salt; water 120',
        ['Cook: Cook the ash gourd with green chillies, salt and water until soft.', 'Add beans: Add the cooked lobia.',
         'Coconut milk: Add coconut milk and heat without boiling.', 'Finish: Drizzle coconut oil and add curry leaves.'], serves=3)
special('Kootu', 'Tamil Nadu', 'A Tamil lentil-vegetable stew with coconut and cumin.',
        'moong 60; chanadal 20; snakegourd 200; carrot 60; coconut 40; jeera 2; redchilli 2; haldi 0.5; coconutoil 8; mustard 2; curryleaf 1.5; salt; water 400',
        ['Cook the dals: Pressure-cook the moong and chana dal with turmeric for 3 whistles.', 'Cook the vegetables: Cook the vegetables with salt and water until soft.',
         'Grind: Grind coconut with cumin and red chillies.', 'Combine: Add the dal and paste and simmer 5 minutes.',
         'Temper: Temper with mustard seeds and curry leaves in coconut oil.'])
special('Erissery', 'Kerala', 'Kerala pumpkin and lobia curry with roasted coconut.',
        'pumpkin 300; lobia 60 soaked, cooked; coconut 60; jeera 1; gchilli 3; haldi 0.5; pepper 1; coconutoil 10; mustard 2; curryleaf 1.5; salt; water 200',
        ['Cook: Cook the pumpkin with turmeric, pepper and salt until soft; add the lobia.', 'Grind: Grind half the coconut with cumin and chilli and add.',
         'Roast: Roast the remaining coconut in coconut oil with mustard seeds and curry leaves until golden.', 'Finish: Pour over the curry and serve.'])
special('Puttu with Kadala Curry', 'Kerala', 'Steamed cylinders of rice flour and coconut, served with black chickpea curry.',
        [('For the Puttu', 'ricefl 200 roasted; coconut 80; salt; water 120'),
         ('For the Kadala Curry', 'kalachana 150 soaked, cooked; coconutoil 10; onion 100; tomato 80; ginger 5; garlic 6; coconut 40 roasted, ground; dhania 3; chilli 1; garam 1; curryleaf 1.5; salt')],
        ['Moisten: Sprinkle salted water over the rice flour and rub until it feels like wet sand.', 'Layer: Layer coconut and flour alternately in a puttu maker.',
         'Steam: Steam for 8–10 minutes until steam comes out of the top.',
         'Curry: Sauté onion, ginger, garlic and tomato in coconut oil, add spices, roasted coconut paste and the cooked chana with water; simmer 10 minutes.',
         'Serve: Push out the puttu and serve hot with the curry.'])
special('Appam with Vegetable Stew', 'Kerala', 'Lacy fermented rice hoppers with a mild coconut vegetable stew.',
        [('For the Appam', 'rice 200 soaked; coconut 60; rice 20 cooked; sugar 5; salt; water 200'),
         ('For the Stew', 'potato 150; carrot 80; beans 60; peas 50; onion 80; ginger 8; gchilli 6; coconutmilk 400; coconutoil 10; cinnamon 1; clove 0.2; cardamom 0.4; curryleaf 1.5; salt')],
        ['Batter: Grind soaked rice, coconut and cooked rice into a smooth batter. Add sugar and ferment overnight. Add salt.',
         'Appam: Pour a ladle into a hot appachatti, swirl to coat the sides, cover and cook 2 minutes until the centre is spongy.',
         'Stew: Sauté whole spices, onion, ginger and chillies in coconut oil, add vegetables and thin coconut milk and cook until soft.',
         'Finish: Add thick coconut milk and curry leaves and heat without boiling.', 'Serve: Serve appams hot with the stew.'], level='Medium')
special('Idiyappam', 'Kerala / Tamil Nadu', 'Soft steamed rice string hoppers, light and easy to digest.',
        'ricefl 200 roasted; water 280; coconutoil 5; salt; coconut 30',
        ['Dough: Boil water with salt and oil, pour over the rice flour and mix into a soft dough.', 'Press: Press through an idiyappam maker onto greased idli plates.',
         'Steam: Sprinkle a little coconut and steam for 8–10 minutes.', 'Serve: Serve with vegetable stew, kurma or coconut milk.'], tags=('soft',))
special('Ragi Mudde', 'Karnataka', 'Karnataka’s nutritious finger millet balls, swallowed with sambar or saaru.',
        'ragi 150; water 400; ghee 5; salt',
        ['Boil: Boil water with salt and ghee.', 'Add ragi: Add 2 tbsp ragi and stir, then add the rest in a mound without stirring.',
         'Steam: Cover and cook on low for 3–4 minutes.', 'Mix: Stir vigorously with a wooden stick until smooth and lump-free.',
         'Shape: Wet your hands and shape into balls. Serve hot with sambar or bassaru.'], serves=3)
special('Gongura Chicken (Lighter)', 'Andhra Pradesh', 'Tangy Andhra chicken curry with sorrel leaves.',
        'chickencut 500; gongura 100; onion 150; ginger 8; garlic 10; gchilli 6; chilli 2; dhania 3; garam 1; haldi 0.5; oil 15; salt; water 200',
        ['Gongura: Sauté the gongura leaves in 1 tsp oil until mushy; mash.', 'Masala: Sauté onion, ginger-garlic and chilli, add spices.',
         'Chicken: Add the chicken and cook for 10 minutes.', 'Simmer: Add the gongura and water and simmer until the chicken is tender.'])
special('Assamese Masor Tenga', 'Assam', 'A light, tangy Assamese fish curry with tomato and lemon.',
        'fish 500; tomato 250; mustardoil 12; methiseed 0.5; gchilli 3; haldi 0.5; lemon 20; coriander 8; salt; water 400',
        ['Sear: Rub fish with turmeric and salt and sear lightly in mustard oil.', 'Temper: Add methi seeds and green chilli to the oil.',
         'Tomatoes: Add tomatoes and cook until mushy.', 'Simmer: Add water, bring to a boil and add the fish; simmer 6 minutes.',
         'Finish: Add lemon juice and coriander.'])
special('Bengali Shukto', 'West Bengal', 'A mildly bitter Bengali mixed vegetable stew with milk, eaten at the start of a meal.',
        'karela 60; rawbanana 80; sweetpotato 80; brinjal 80; drumstick 60; potato 80; mustardoil 10; panchphoron 2; ginger 8; kasundi 15; milk 100; ghee 5; sugar 3; salt; water 200',
        ['Prep: Cut vegetables into batons.', 'Fry karela: Lightly fry the karela and set aside.', 'Temper: Add panch phoron to the oil, then the vegetables, and sauté.',
         'Cook: Add ginger and mustard pastes and water and cook until tender.', 'Finish: Add karela, milk, sugar and ghee and simmer 2 minutes.'])
special('Chorchori', 'West Bengal', 'Bengali mixed vegetable stir-fry with panch phoron.',
        'pumpkin 150; potato 100; brinjal 100; rawbanana 75; spinach 100; mustardoil 10; panchphoron 2; gchilli 3; haldi 0.5; sugar 2; salt; water 60',
        ['Prep: Cut vegetables into small batons.', 'Temper: Heat mustard oil and add panch phoron and chilli.', 'Cook: Add the vegetables, turmeric and salt; cover and cook 12 minutes.',
         'Finish: Add the spinach and sugar and cook until dry.'], serves=3)
special('Dhokar Dalna (Steamed Lentil Cakes)', 'West Bengal', 'Bengali chana dal cakes, steamed instead of fried, in a ginger-cumin gravy.',
        [('For the Dhoka', 'chanadal 150 soaked, ground; ginger 5; gchilli 3; hing; salt'),
         ('For the Gravy', 'mustardoil 10; jeera 1; bayleaf 0.2; tomato 120; ginger 8; jeerapowder 2; chilli 1; haldi 0.5; garam 1; ghee 5; salt; water 300')],
        ['Dhoka: Cook the ground dal with ginger, chilli, hing and salt for 5 minutes until thick; spread on a plate, steam 10 minutes and cut into diamonds.',
         'Gravy: Temper cumin and bay leaf in mustard oil, add tomato, ginger and spices and cook until thick; add water.',
         'Simmer: Add the dhoka and simmer 3 minutes.', 'Finish: Add ghee and garam masala.'])
special('Begun Pora (Smoked Brinjal Mash)', 'West Bengal', 'Smoky roasted brinjal mash with mustard oil, onion and chilli.',
        'brinjal 400 large; onion 60; gchilli 3; mustardoil 10; coriander 6; salt',
        ['Roast: Roast the brinjal on the flame until charred.', 'Mash: Peel and mash.', 'Season: Mix with onion, chilli, mustard oil, coriander and salt.',
         'Serve: Serve with rice and dal.'], serves=3)
special('Thukpa (Vegetable)', 'Sikkim / Ladakh', 'A Himalayan noodle soup with vegetables, ginger and garlic.',
        'noodles 150; carrot 60; cabbage 80; beans 50; springonion 30; tomato 60; garlic 8; ginger 8; soysauce 8; chilli 1; oil 8; salt; water 1000',
        ['Sauté: Sauté garlic, ginger and onion whites in oil.', 'Vegetables: Add vegetables and tomato and sauté 2 minutes.',
         'Broth: Add water, soy sauce, chilli and salt and simmer 8 minutes.', 'Noodles: Add the noodles and cook until done.',
         'Serve: Garnish with spring onion.'])
special('Chicken Thukpa', 'Sikkim / Ladakh', 'Himalayan chicken noodle soup, warming and protein-rich.',
        'noodles 150; chicken 250 sliced; carrot 60; cabbage 80; springonion 30; tomato 60; garlic 8; ginger 8; soysauce 8; chilli 1; oil 8; salt; water 1000',
        ['Sauté: Sauté garlic and ginger in oil, add chicken and cook 4 minutes.', 'Broth: Add vegetables, water, soy sauce and salt; simmer 10 minutes.',
         'Noodles: Add noodles and cook until done.', 'Serve: Garnish with spring onion.'])
special('Steamed Vegetable Momos (Whole-wheat)', 'Himalayan', 'Steamed dumplings with a whole-wheat wrapper and a crunchy vegetable filling.',
        [('For the Wrapper', 'atta 150; salt; water 85'), ('For the Filling', 'cabbage 150; carrot 80; onion 60; springonion 20; garlic 8; ginger 5; soysauce 5; pepper 1; oil 5; salt')],
        ['Dough: Knead a smooth, firm dough; rest 20 minutes.', 'Filling: Finely chop and lightly sauté the vegetables with garlic and ginger; season.',
         'Shape: Roll thin discs, fill and pleat into momos.', 'Steam: Steam for 10–12 minutes.', 'Serve: Serve with tomato-garlic chutney.'], serves=3)
special('Chicken Momos (Steamed)', 'Himalayan', 'Juicy steamed chicken dumplings with a whole-wheat wrapper.',
        [('For the Wrapper', 'atta 150; salt; water 85'), ('For the Filling', 'chickenmince 250; onion 60; springonion 20; garlic 8; ginger 5; soysauce 5; pepper 1; salt')],
        ['Dough: Knead a firm dough; rest 20 minutes.', 'Filling: Mix the chicken mince with all filling ingredients.', 'Shape: Roll thin discs, fill and pleat.',
         'Steam: Steam for 12–15 minutes until the filling is cooked through.', 'Serve: Serve with spicy tomato chutney.'], serves=3)
special('Paneer Momos (Steamed)', 'Himalayan', 'Steamed dumplings with a paneer and vegetable filling.',
        [('For the Wrapper', 'atta 150; salt; water 85'), ('For the Filling', 'paneer 150 crumbled; cabbage 60; onion 40; springonion 20; garlic 6; ginger 5; pepper 1; salt')],
        ['Dough: Knead a firm dough and rest.', 'Filling: Mix the filling ingredients.', 'Shape: Roll, fill and pleat.', 'Steam: Steam for 10 minutes.',
         'Serve: Serve hot with chutney.'], serves=3)
special('Goan Vegetable Xacuti', 'Goa', 'Goan mixed vegetable curry with roasted coconut and xacuti spices.',
        'potato 150; carrot 80; beans 80; peas 60; cauliflower 100; onion 100; coconut 60 roasted; poppy 4; dhaniaseed 4; redchilli 5; peppercorn 2; cinnamon 1; clove 0.2; nutmeg; oil 12; tamarind 5; salt; water 300',
        ['Roast & grind: Roast coconut and spices and grind to a paste.', 'Sauté: Sauté onion until golden, add the paste and cook 5 minutes.',
         'Vegetables: Add the vegetables, tamarind and water; simmer until tender.', 'Serve: Serve with rice or pav.'])
special('Rajasthani Gatte ki Sabzi (Steamed Gatte)', 'Rajasthan', 'Steamed besan dumplings in a tangy curd gravy.',
        [('For the Gatte', 'besan 120; curd 20; ajwain 1; chilli 1; haldi 0.3; oil 5; salt'),
         ('For the Gravy', 'curd 200; oil 10; jeera 1; hing; onion 60; ginger 5; garlic 6; chilli 1.5; dhania 2; haldi 0.5; garam 1; salt; water 250')],
        ['Gatte: Knead the besan with the other ingredients into a stiff dough, roll into thin logs and boil for 12 minutes; cool and slice.',
         'Gravy: Temper cumin and hing, sauté onion, ginger and garlic, add spices and whisked curd on low flame.',
         'Simmer: Add the gatte and water and simmer 8 minutes.', 'Serve: Serve with roti or rice.'])
special('Rajasthani Gwar Phali Sabzi', 'Rajasthan', 'A tangy, spicy Rajasthani dry sabzi made with cluster beans and amchur.',
        'gwar 300; oil 10; jeera 1; hing; redchilli 2; chilli 1; dhania 2; amchur 2; haldi 0.3; salt',
        ['Boil: Boil the cluster beans for 5 minutes and drain.', 'Temper: Heat oil, add cumin, hing and red chillies.', 'Cook: Add the beans and spices and stir-fry for 8 minutes.',
         'Serve: Serve with bajra roti.'], serves=3)
special('Chilka Roti with Tomato Chutney', 'Jharkhand', 'Thin rice and chana dal pancakes from Jharkhand.',
        'rice 120 soaked; chanadal 60 soaked; gchilli 3; ginger 5; salt; oil 8',
        ['Grind: Grind rice and dal with chilli and ginger into a smooth batter.', 'Cook: Spread thin on a hot greased tawa and cook covered for 2 minutes.',
         'Flip: Flip and cook briefly.', 'Serve: Serve with tomato chutney.'], serves=3)
special('Dal Pitha', 'Bihar / Jharkhand', 'Steamed rice-flour dumplings stuffed with spiced chana dal.',
        [('For the Dough', 'ricefl 200; water 240; salt'), ('For the Filling', 'chanadal 100 soaked, ground; ginger 5; gchilli 3; garlic 4; jeera 1; hing; salt')],
        ['Dough: Knead rice flour with hot water into a smooth dough.', 'Filling: Mix the ground dal with spices.', 'Shape: Flatten dough balls, fill and fold into half-moons.',
         'Steam: Steam for 15 minutes or boil in water for 12 minutes.', 'Serve: Serve with chutney.'])
special('Bafauri (Steamed Chana Dal Dumplings)', 'Chhattisgarh', 'Oil-free steamed chana dal dumplings from Chhattisgarh.',
        'chanadal 150 soaked, coarsely ground; onion 40; ginger 5; gchilli 3; coriander 6; ajwain 1; salt; oil 5; mustard 2',
        ['Grind: Grind the dal coarsely without water.', 'Mix: Mix with onion, ginger, chilli, coriander, ajwain and salt.', 'Steam: Shape small balls and steam for 15 minutes.',
         'Temper: Toss in a little oil with mustard seeds.', 'Serve: Serve with green chutney.'], serves=3)
special('Mangalorean Neer Dosa with Coconut Chutney', 'Karnataka', 'Lace-thin rice crêpes from Mangalore with coconut chutney.',
        'rice 200 soaked; coconut 40; salt; water 500; oil 5',
        ['Grind: Grind soaked rice with coconut into a very thin batter.', 'Cook: Pour onto a hot tawa from the edges inward; cover and cook 1 minute.',
         'Fold: Fold into triangles without flipping.', 'Serve: Serve with coconut chutney.'], serves=3)
special('Sweet Potato Puzhukku (Kerala Style)', 'Kerala', 'Kerala-style mashed sweet potato with crushed coconut, chilli and shallots.',
        'sweetpotato 400 (or tapioca); coconut 40; gchilli 3; shallot 30; haldi 0.3; curryleaf 1.5; coconutoil 8; mustard 2; salt',
        ['Boil: Boil the sweet potato with turmeric and salt until soft; drain and mash.', 'Grind: Crush coconut with chilli and shallots.',
         'Temper: Temper mustard and curry leaves in coconut oil and add the mash and coconut.', 'Serve: Serve with Kerala fish curry or kadala curry.'])
special('Pongal Gotsu', 'Tamil Nadu', 'Brinjal gotsu, a tangy brinjal curry served with ven pongal.',
        'brinjal 250; onion 60; tomato 80; tamarind 10; sambar 6; moong 20 cooked; oil 8; mustard 2; curryleaf 1; salt; water 250',
        ['Cook: Sauté onion, tomato and brinjal until soft.', 'Spice: Add tamarind, sambar powder and water and simmer 10 minutes.',
         'Thicken: Add the cooked moong dal and mash lightly.', 'Temper & serve: Temper with mustard and curry leaves and serve with pongal.'], serves=3)
special('Chettinad Vegetable Kuzhambu', 'Tamil Nadu', 'Tangy tamarind gravy with vegetables and a roasted spice paste.',
        'drumstick 80; brinjal 100; shallot 60; tamarind 20; coconut 20; dhaniaseed 4; redchilli 4; peppercorn 1; jeera 1; oil 10; mustard 2; curryleaf 1.5; jaggery 3; salt; water 400',
        ['Roast & grind: Roast and grind the coconut and spices.', 'Sauté: Sauté shallots and vegetables in oil.', 'Simmer: Add tamarind, the paste and water and simmer 15 minutes.',
         'Temper & serve: Temper and serve with rice.'])
special('Bisi Bele Bath with Millets', 'Karnataka', 'A millet version of Karnataka’s spicy lentil-rice-vegetable dish.',
        'foxtail 120; toor 80; carrot 60; beans 50; peas 50; shallot 40; tamarind 15; bisibele 20; jaggery 5; ghee 10; cashew 8; curryleaf 1; salt; water 900',
        ['Cook: Pressure-cook millet and dal with water for 4 whistles.', 'Vegetables: Cook the vegetables with tamarind, bisi bele bath powder and jaggery.',
         'Combine: Mix in the millet-dal and simmer 5 minutes.', 'Temper: Top with cashews and curry leaves fried in ghee.'])
special('Hyderabadi Mirchi ka Salan (Lighter)', 'Telangana', 'Long chillies in a tangy peanut-sesame-coconut gravy, served with biryani.',
        'gchilli 150 large, mild; peanut 30; sesame 15; coconut 20; tamarind 15; onion 60; ginger 5; garlic 6; jeera 1; chilli 1; haldi 0.3; jaggery 5; oil 12; curryleaf 1; salt; water 300',
        ['Roast & grind: Roast peanuts, sesame and coconut and grind with onion into a paste.', 'Sear: Slit the chillies and sear them lightly in oil.',
         'Gravy: Temper cumin and curry leaves, add ginger-garlic and the paste and cook 5 minutes.', 'Simmer: Add tamarind, jaggery, water and the chillies; simmer 10 minutes.'])
special('Bagara Baingan (Lighter)', 'Telangana', 'Small brinjals in a rich peanut-sesame-tamarind gravy.',
        'brinjal 400 small; peanut 30; sesame 15; coconut 20; tamarind 15; onion 60; ginger 5; garlic 6; jeera 1; chilli 1.5; haldi 0.3; jaggery 5; oil 12; curryleaf 1; salt; water 300',
        ['Roast & grind: Roast peanuts, sesame and coconut and grind with onion.', 'Sear: Slit the brinjals and pan-roast in oil until lightly browned.',
         'Gravy: Temper cumin and curry leaves, add ginger-garlic and the paste.', 'Simmer: Add tamarind, jaggery, water and the brinjals; simmer 12 minutes.'])
special('Sindhi Kadhi', 'Sindh', 'A tangy, vegetable-packed Sindhi besan curry made without curd.',
        'besan 50; oil 12; jeera 1; methiseed 0.5; hing; gchilli 3; ginger 5; drumstick 80; potato 100; bhindi 80; beans 60; gwar 50; tomato 150 puréed; tamarind 15; haldi 0.5; chilli 1; curryleaf 1.5; salt; water 900',
        ['Roast the besan: Heat oil, add cumin, methi seeds and hing, then the besan; roast on low flame for 6–8 minutes until golden and fragrant.',
         'Add water: Slowly whisk in the water so no lumps form, then add the tomato purée, turmeric, chilli and salt.',
         'Vegetables: Add the drumstick, potato, beans and gwar and simmer for 15 minutes; add the okra for the last 5 minutes.',
         'Tang: Stir in the tamarind extract and curry leaves and simmer for 3 minutes.', 'Serve: Serve with steamed rice.'])
special('Dalma with Red Rice', 'Odisha', 'Dalma (dal with vegetables) served over red rice, a wholesome Odia meal.',
        'toor 100; rrice 150; pumpkin 100; rawbanana 75; brinjal 80; potato 80; ginger 5; jeera 1; redchilli 2; ghee 8; haldi 0.5; coconut 15; salt; water 1000',
        ['Rice: Cook the red rice.', 'Dalma: Pressure-cook the dal and vegetables with turmeric and salt for 3 whistles.', 'Tadka: Temper ghee with cumin, red chillies and ginger.',
         'Serve: Pour the tadka over the dalma, sprinkle coconut and serve over red rice.'])
special('Maharashtrian Bharli Vangi', 'Maharashtra', 'Small brinjals stuffed with a peanut-coconut-goda masala.',
        'brinjal 400 small; peanut 30; coconut 30; sesame 10; goda 6; chilli 1; haldi 0.3; jaggery 5; tamarind 10; oil 12; mustard 2; salt; water 150',
        ['Masala: Roast and coarsely grind peanuts, coconut and sesame; mix with goda masala, chilli, jaggery, tamarind and salt.',
         'Stuff: Slit the brinjals and stuff with masala.', 'Cook: Temper mustard in oil, add the brinjals and remaining masala with water.',
         'Simmer: Cover and cook 15 minutes until tender.'])
special('Misal Pav (Lighter)', 'Maharashtra', 'Spicy sprouted moth curry topped with onion and a little farsan, served with whole-wheat pav.',
        'moth 150 sprouted; onion 100; tomato 100; coconut 20 roasted; ginger 8; garlic 8; goda 6; chilli 2; haldi 0.5; oil 15; bread 120 whole-wheat pav; lemon 10; coriander 8; salt; water 600',
        ['Cook: Pressure-cook the sprouts for 1–2 whistles.', 'Masala: Sauté onion, ginger, garlic, roasted coconut and tomato; grind to a paste.',
         'Curry: Cook the paste with spices and water into a thin, spicy rassa; add the sprouts.', 'Serve: Top with onion, coriander and lemon; serve with pav.'])
special('Baked Vada Pav', 'Maharashtra', 'A healthier take on vada pav with a baked potato patty in a whole-wheat bun.',
        'potato 300 boiled; garlic 6; ginger 5; gchilli 3; mustard 2; curryleaf 1; haldi 0.3; besan 20; bread 180 whole-wheat buns; oil 8; mint 5 as green chutney; coconut 20 as dry garlic chutney; salt',
        ['Filling: Temper mustard and curry leaves, add garlic, ginger, chilli and turmeric and mix with mashed potato.',
         'Shape: Shape into patties and dust with besan.', 'Bake: Bake or air-fry at 200°C for 15 minutes.',
         'Assemble: Spread chutneys in the bun and add the patty.'])
special('Pav Bhaji (Lighter)', 'Maharashtra', 'Mumbai’s spiced vegetable mash with very little butter, served with whole-wheat pav.',
        'potato 200; cauliflower 150; peas 100; capsicum 100; carrot 80; tomato 250; onion 100; garlic 8; ginger 5; pavbhaji 10; chilli 1; butter 10; oil 5; lemon 10; coriander 8; bread 240 whole-wheat pav; salt',
        ['Boil: Pressure-cook the potato, cauliflower, peas and carrot until soft; mash.', 'Masala: Sauté onion, ginger-garlic, capsicum and tomato in oil until mushy.',
         'Combine: Add pav bhaji masala, chilli and the mash with a little water; mash and simmer 10 minutes.', 'Finish: Add butter, lemon and coriander.',
         'Serve: Toast the pav lightly and serve with onion and lemon.'])
special('Matar Kulcha (Lighter)', 'Delhi', 'Delhi street-style spicy white peas with whole-wheat kulcha.',
        'whitepeas 150 soaked, cooked; onion 60; tomato 60; gchilli 3; ginger 5; lemon 15; chaat 2; jeerapowder 1; tamarind 5; atta 200 as kulcha dough with curd; curd 50; coriander 8; salt',
        ['Matar: Mix the cooked peas with onion, tomato, chilli, ginger, lemon, tamarind and spices.', 'Kulcha: Knead atta with curd, rest 1 hour and roll into kulchas; cook on a tawa.',
         'Serve: Serve the matar with hot kulcha.'])
special('Egg Appam', 'Kerala', 'Appam with an egg cooked in the centre, served with stew.',
        'rice 150 soaked; coconut 50; egg 200; pepper 0.5; salt; water 150',
        ['Batter: Grind and ferment the appam batter.', 'Appam: Swirl batter in an appachatti.', 'Egg: Crack an egg into the centre, season and cover until set.',
         'Serve: Serve with stew or curry.'], serves=4)
special('Manipuri Eromba', 'Manipur', 'A mashed vegetable and chilli dish from Manipur, simple and light.',
        'potato 150; beans 100; pumpkin 100; redchilli 4; garlic 4; coriander 6; springonion 20; salt; water 300',
        ['Boil: Boil the vegetables until soft.', 'Roast: Roast the dry chillies.', 'Mash: Mash the vegetables with chillies, garlic and salt.',
         'Serve: Garnish with coriander and spring onion.'], serves=3)
special('Kashmiri Kahwa', 'Kashmir', 'Fragrant green tea with saffron, cardamom, cinnamon and almonds.',
        'water 500; greentea 3; saffron; cardamom 0.8; cinnamon 1.5; almond 10 slivered; honey 7',
        ['Boil: Boil water with cardamom and cinnamon for 3 minutes.', 'Steep: Add green tea and saffron and steep 2 minutes off the heat.',
         'Strain: Strain into cups.', 'Serve: Add almonds and honey.'], serves=2, prep=5, cook=6, level='Easy',
        serve=['a few almonds or a light snack.', '<b>Best time:</b> after meals, especially in winter.'], store='best consumed fresh.')
special('Goan Prawn Balchão (Lighter)', 'Goa', 'Tangy, spicy Goan prawn pickle-curry made with less oil.',
        'prawn 400; onion 100; tomato 100; redchilli 6; garlic 10; ginger 5; jeera 1; clove 0.2; cinnamon 1; vinegar 30; jaggery 8; oil 12; salt',
        ['Paste: Grind chillies, garlic, ginger, cumin and spices with vinegar.', 'Sauté: Sauté onion until golden, add tomatoes, then the paste.',
         'Prawns: Add prawns, jaggery and salt and cook 5 minutes.', 'Rest & serve: Rest for an hour for the flavours to develop.'])
special('Kolkata Chicken Stew', 'West Bengal', 'Light Kolkata-style chicken and vegetable stew with butter and pepper.',
        'chickencut 400; potato 150; carrot 100; papaya 80 raw; beans 80; onion 80; ginger 8; garlic 6; peppercorn 2; bayleaf 0.2; cinnamon 1; butter 8; milk 100; salt; water 700',
        ['Cook: Pressure-cook chicken and vegetables with ginger, garlic, whole spices and water for 2 whistles.', 'Finish: Add milk, butter and pepper and simmer 3 minutes.',
         'Serve: Serve with bread or rice.'], tags=('soft',))
special('Parsi Dhansak (Lighter)', 'Parsi', 'Parsi lentil-vegetable-chicken stew, served with brown rice.',
        'toor 80; masoor 40; moong 40; chickencut 400; pumpkin 150; brinjal 100; tomato 100; methi 30; onion 100; ginger 8; garlic 8; garam 2; dhania 3; chilli 1.5; haldi 0.5; tamarind 10; jaggery 5; oil 12; salt; water 1000',
        ['Cook dals: Pressure-cook dals and vegetables until soft; blend smooth.', 'Chicken: Sauté onion, ginger-garlic and spices, add chicken and cook 8 minutes.',
         'Combine: Add the dal purée, tamarind and jaggery and simmer until the chicken is tender.', 'Serve: Serve with brown rice and kachumber.'])
special('Lucknowi Tehri', 'Uttar Pradesh', 'A one-pot spiced vegetable rice from Lucknow.',
        'basmati 200; potato 120; cauliflower 100; peas 80; carrot 60; onion 80; tomato 80; curd 60; ginger 5; garlic 6; haldi 1; chilli 1; garam 1; ghee 10; jeera 1; bayleaf 0.2; salt; water 400',
        ['Soak: Soak the rice 20 minutes.', 'Masala: Temper whole spices in ghee, sauté onion, tomato, curd and spices.', 'Vegetables: Add vegetables and sauté.',
         'Rice: Add rice and water; cook covered until done.'], serves=4)
special('Himachali Madra', 'Himachal Pradesh', 'Chickpeas simmered in a spiced curd gravy, a Himachali dham classic.',
        'chickpea 180 soaked, cooked; curd 250; ghee 10; jeera 1; cinnamon 1; clove 0.2; cardamom 0.4; bayleaf 0.2; dhania 3; haldi 0.5; garam 1; salt; water 200',
        ['Temper: Heat ghee with whole spices.', 'Curd: Whisk curd with spices and add on low flame, stirring until it boils.',
         'Simmer: Add the chickpeas and simmer 15 minutes until thick.', 'Serve: Serve with rice.'])
special('Uttarakhand Kafuli', 'Uttarakhand', 'A thick, green curry of spinach and fenugreek from the hills.',
        'spinach 300; methi 100; ricefl 20; ghee 8; jeera 1; garlic 6; gchilli 3; haldi 0.3; salt; water 200',
        ['Cook: Blanch the greens and grind coarsely.', 'Temper: Temper cumin, garlic and chilli in ghee.', 'Simmer: Add the greens, water and rice-flour slurry; simmer 10 minutes.',
         'Serve: Serve with rice or mandua roti.'], serves=3)
special('Bhatt ki Churkani', 'Uttarakhand', 'A hearty black soybean curry from Kumaon.',
        'soya 0; ricefl 20; ghee 8; jeera 1; garlic 6; tomato 80; chilli 1; haldi 0.5; salt; water 400; wurad 120 (or black soybeans) soaked'.replace('soya 0; ', ''),
        ['Roast: Dry-roast the soaked, drained beans until they crackle.', 'Temper: Temper cumin and garlic in ghee, add tomato and spices.',
         'Simmer: Add the beans, water and rice-flour slurry and pressure-cook for 5 whistles.', 'Serve: Serve with rice.'])
