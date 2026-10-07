"""Poha, upma, sabudana, savoury and sweet porridges."""
from core import recipe
from util import names

C = 'Poha, Upma & Porridge'
TEMPER = 'oil 10; mustard 3; jeera 1.25; curryleaf 1.5; gchilli 3 chopped; hing'


def poha(name, base, veg, desc, extra='peanut 15', finish='lemon 10; coriander 8 chopped', serves=2, spice='haldi 0.75; sugar 2; salt',
         veg_txt='', sub='Poha'):
    g = [('Ingredients', f'{base}; {veg}; {extra}; {spice}'), ('For the Tempering', TEMPER), ('To Finish', finish)]
    steps = [
        f'Rinse the poha: Put the {names(base)} in a sieve and rinse under running water for 15–20 seconds, tossing gently. Drain and rest for 5 minutes to soften. Do not soak.',
        'Season the poha: Sprinkle the turmeric, salt and sugar over the poha and fluff gently with a fork so they coat evenly.',
        f'Roast the crunch: Heat the oil in a kadhai and roast the {names(extra)} on low flame until crunchy. Remove and keep aside.' if extra else
        'Heat the oil: Heat the oil in a kadhai on medium flame.',
        'Temper: In the same oil, crackle the mustard seeds and cumin, then add curry leaves, green chilli and hing.',
        f'Cook the vegetables: {veg_txt or f"Add the {names(veg)} and sauté on medium flame until the onion is soft and translucent and the vegetables are just tender (3–5 minutes)."}',
        'Add the poha: Add the seasoned poha and mix gently. Cover and cook on low flame for 2–3 minutes so it steams through.',
        f'Finish: Switch off the flame and add the {names(finish)}' + (' and the roasted crunch' if extra else '') + '. Toss gently and serve hot.',
    ]
    recipe(name, C, desc, serves, 10, 12, g, steps,
           tips=['Use thick poha; thin poha turns mushy.', 'Add lemon juice only after switching off the flame, or it turns bitter.'],
           serve=['a cup of masala tea or buttermilk, and a fruit.', '<b>Best time:</b> breakfast or evening snack.'],
           store='best eaten fresh; it dries out when reheated.', sub=sub, tags=('kids',))


V = 'onion 80 finely chopped'
poha('Kanda Poha', 'poha 120', V, 'Maharashtra’s much-loved breakfast: soft flattened rice with onions, peanuts, curry leaves and lemon.')
poha('Vegetable Poha', 'poha 120', 'onion 60 chopped; carrot 40 finely chopped; peas 40; capsicum 40 chopped', 'Poha loaded with carrot, peas and capsicum for extra fibre and colour.')
poha('Indori Poha', 'poha 120', 'onion 40 finely chopped', 'Indore-style steamed poha topped with onion, pomegranate and a sprinkle of jeeravan masala.',
     finish='lemon 10; coriander 8; pomegranate 30; onion 30 raw, finely chopped; chaat 1', extra='peanut 10; saunf 1')
poha('Batata Poha', 'poha 120', 'onion 60 chopped; potato 100 diced small', 'Poha with tender cubes of potato, a hearty Maharashtrian breakfast.',
     veg_txt='Add the onion and diced potato, cover and cook on low flame for 6–7 minutes until the potato is tender.')
poha('Red Poha with Vegetables', 'rpoha 120', 'onion 60 chopped; carrot 40 chopped; beans 40 chopped; peas 30', 'A fibre-rich poha made with red rice flakes and vegetables.')
poha('Sprouts Poha', 'poha 100', 'onion 60 chopped; sprouts 80 steamed', 'Poha with steamed moong sprouts for extra protein and vitamin C.')
poha('Soya Poha', 'poha 100', 'onion 60 chopped; soyagran 30 soaked and squeezed; peas 30', 'High-protein poha with soya granules and peas.')
poha('Oats Poha', 'oats 80; poha 40', 'onion 60 chopped; carrot 40 chopped; peas 30', 'A fibre-rich mix of oats and poha, cooked the classic way.')
poha('Paneer Poha', 'poha 110', 'onion 60 chopped; capsicum 40 chopped; paneer 60 cubed', 'Poha with soft paneer cubes for a protein boost.')
poha('Dadpe Poha', 'poha 120 thin', 'onion 60 very finely chopped; tomato 40 finely chopped', 'A no-cook Maharashtrian poha tossed with coconut, onion and a hot tempering.',
     extra='coconut 30', finish='lemon 10; coriander 8', veg_txt='Mix the raw onion and tomato into the poha with the coconut and pour the hot tempering over it; do not cook.')
poha('Corn Poha', 'poha 110', 'onion 60 chopped; corn 70 boiled; capsicum 30 chopped', 'Poha with sweet corn and capsicum, a hit with children.')
poha('Beetroot Poha', 'poha 110', 'onion 60 chopped; beet 60 grated', 'Pink poha with grated beetroot, rich in folate.')
poha('Kanda Poha with Moong Sprouts and Pomegranate', 'poha 100', 'onion 60 chopped; sprouts 60 steamed', 'Kanda poha topped with sprouts and pomegranate, a power breakfast.',
     finish='lemon 10; coriander 8; pomegranate 30')
poha('Lemon Poha', 'poha 120', 'onion 40 chopped; ginger 5 chopped', 'A tangy South Indian-style poha with chana dal, ginger and lots of lemon.',
     extra='peanut 15; chana_t 4', finish='lemon 15; coriander 8', spice='haldi 0.75; salt')
poha('Chicken Poha', 'poha 100', 'onion 60 chopped; chicken 100 boiled, shredded', 'Poha with shredded chicken, a filling high-protein breakfast.')
poha('Egg Poha', 'poha 100', 'onion 60 chopped; egg 100 scrambled', 'Poha tossed with soft scrambled eggs.',
     veg_txt='Sauté the onion until soft, push it aside, pour in the beaten eggs and scramble them until just set.')


def upma(name, grain, veg, desc, water=480, roast=True, serves=2, extra='cashew 8; chana_t 4; urad_t 4', finish='lemon 5; coriander 6; ghee 5',
         sub='Upma', cook=15, tags=()):
    g = [('Ingredients', f'{grain}; {veg}; salt; water {water}'),
         ('For the Tempering', f'oil 10; mustard 3; {extra}; curryleaf 1.5; gchilli 3 slit; ginger 5 chopped; hing'),
         ('To Finish', finish)]
    steps = [
        f'Roast the grain: Dry-roast the {names(grain)} on low flame for 4–5 minutes, stirring, until aromatic and lightly golden. Transfer to a plate.' if roast else
        f'Rinse: Rinse the {names(grain)} and drain well.',
        'Temper: Heat oil in a kadhai. Crackle the mustard seeds, then add the dals and cashews and fry until golden. Add curry leaves, green chilli, ginger and hing.',
        f'Cook the vegetables: Add the {names(veg)} and sauté for 3–4 minutes until slightly soft.',
        f'Boil the water: Add {water} ml water and salt and bring to a rolling boil.',
        f'Add the grain: Lower the flame and add the {names(grain)} in a thin stream with one hand while stirring continuously with the other, so no lumps form.',
        f'Cook covered: Cover and cook on the lowest flame for {"3–4" if "rava" in grain or "semiya" in grain else "12–15"} minutes until the water is absorbed and the grain is soft.',
        'Finish: Add the ghee, lemon juice and coriander, fluff gently and serve hot.',
    ]
    recipe(name, C, desc, serves, 10, cook, g, steps,
           tips=['Roasting the grain well keeps the upma fluffy and non-sticky.',
                 'For a softer upma, add ¼ cup more water.'],
           serve=['coconut chutney, a cup of filter coffee or buttermilk.', '<b>Best time:</b> breakfast or a light dinner.'],
           store='best eaten fresh. Sprinkle a little water and reheat leftovers covered.', sub=sub, tags=('soft',) + tuple(tags))


VU = 'onion 60 chopped; carrot 40 chopped; beans 30 chopped; peas 30'
upma('Rava Upma', 'rava 120', 'onion 60 chopped; tomato 40 chopped', 'Soft, fluffy semolina upma with curry leaves and cashews, ready in 20 minutes.', water=420)
upma('Vegetable Upma', 'rava 110', VU, 'Rava upma loaded with carrots, beans and peas, a balanced South Indian breakfast.', water=420)
upma('Oats Upma', 'oats 120', VU, 'A fibre-rich upma made with rolled oats and vegetables.', water=180, cook=12)
upma('Dalia Upma', 'dalia 120', VU, 'A savoury broken wheat upma with vegetables, slow-digesting and filling.', water=480, cook=20)
upma('Semiya Upma', 'semiya 120', VU, 'Light vermicelli upma with vegetables, a quick South Indian breakfast.', water=300)
upma('Foxtail Millet Upma', 'foxtail 120', VU, 'A low-GI upma made with foxtail millet and vegetables.', water=420, roast=False, cook=20)
upma('Kodo Millet Upma', 'kodo 120', VU, 'A wholesome kodo millet upma, high in fibre.', water=420, roast=False, cook=20)
upma('Little Millet Upma', 'kutki 120', VU, 'A light little millet upma, rich in iron.', water=420, roast=False, cook=20)
upma('Barnyard Millet Upma', 'sama 120', 'potato 80 diced; peanut 15', 'Sama (barnyard millet) upma with potato and peanuts, suitable for fasting.',
     water=400, roast=False, cook=15, extra='jeera 1', tags=('fast',))
upma('Quinoa Upma', 'quinoa 120', VU, 'A protein-rich upma made with quinoa and vegetables.', water=360, roast=False, cook=18)
upma('Bread Upma', 'bread 150 cubed', 'onion 60 chopped; tomato 60 chopped; capsicum 30 chopped', 'A quick upma made with whole-wheat bread cubes, tomato and onion.',
     water=40, roast=False, cook=10)
upma('Poha Upma', 'poha 120 coarsely powdered', VU, 'A light upma made with coarsely ground poha, cooks in 10 minutes.', water=240, roast=True, cook=10)
upma('Ragi Rava Upma', 'ragi 50; rava 70', VU, 'A calcium-rich upma made with ragi and semolina.', water=400)
upma('Broken Rice Upma (Arisi Upma)', 'rice 120 coarsely ground', 'onion 50 chopped; coconut 20', 'A Tamil Nadu-style rice rava upma with coconut, comforting and soft.', water=480, cook=20)
upma('Masala Oats', 'oats 100', 'onion 60 chopped; tomato 60 chopped; carrot 40 chopped; peas 30; capsicum 30', 'Savoury masala oats with vegetables, a quick high-fibre breakfast.',
     water=300, extra='haldi 0.5; chilli 0.5; garam 0.5', finish='lemon 5; coriander 6', cook=10)
upma('Paneer Rava Upma', 'rava 110', 'onion 60 chopped; capsicum 40 chopped; paneer 80 crumbled', 'Rava upma topped with crumbled paneer for extra protein.', water=420)
upma('Soya Vegetable Upma', 'rava 100', 'onion 60 chopped; soyagran 30 soaked and squeezed; carrot 40 chopped; peas 30', 'Rava upma with soya granules for a high-protein breakfast.', water=420)


def khichdi_sabudana(name, desc, extra='', fast=True):
    g = [('Ingredients', f'sabudana 150 soaked; peanut 40 roasted, coarsely crushed; potato 120 boiled, cubed; {extra}sugar 3; salt; lemon 10; coriander 8'),
         ('For the Tempering', 'ghee 10; jeera 2; gchilli 6 chopped; curryleaf 1.5')]
    steps = [
        'Soak the sabudana: Rinse the sabudana 2–3 times until the water runs clear. Soak in just enough water to cover it (about ¾ cup) for 5–6 hours or overnight.',
        'Check: Press a pearl between your fingers; it should mash easily with no hard centre. Drain any extra water completely.',
        'Mix: Mix the sabudana with the crushed peanuts, salt and sugar so every pearl is coated and stays separate.',
        'Temper: Heat ghee in a kadhai, crackle the cumin, then add green chillies and curry leaves.',
        'Add potatoes: Add the boiled potato cubes and sauté for 2 minutes.',
        'Cook: Add the sabudana mixture and cook on low flame, stirring gently, for 5–7 minutes until the pearls turn translucent.',
        'Finish: Switch off the flame, add lemon juice and coriander and serve warm.',
    ]
    recipe(name, C, desc, 2, 10, 15, g, steps,
           tips=['Overcooking makes sabudana sticky; switch off as soon as the pearls turn translucent.',
                 'Roasted peanut powder keeps the pearls separate.'],
           serve=['a bowl of curd or a glass of buttermilk.', '<b>Best time:</b> breakfast or vrat meals.'],
           store='best eaten fresh; it becomes chewy when cold.', sub='Sabudana', tags=('fast',) if fast else ())


khichdi_sabudana('Sabudana Khichdi', 'The classic Maharashtrian fasting dish: soft sago pearls with peanuts, potato and green chilli.')
khichdi_sabudana('Sabudana Khichdi with Sweet Potato', 'Sabudana khichdi made with sweet potato instead of regular potato, for extra fibre and beta-carotene.',
                 extra='sweetpotato 100 boiled, cubed; ')


def porridge(name, grain, liquid, desc, add='', sweet='jaggery 10', top='', cook=12, serves=2, savoury=False, roast=True, sub='Porridge', tags=()):
    g = [('Ingredients', f'{grain}; {liquid}' + (f'; {add}' if add else '') + (f'; {sweet}' if sweet else '') + ('; salt' if savoury else ''))]
    if top:
        g.append(('For the Topping', top))
    lname = names(liquid) or 'water'
    if cook == 0:
        steps = [
            f'Mix: In a jar or bowl, stir the {names(grain)} into the {lname}' + (f' with the {names(sweet)}' if sweet else '') + ' until well combined.',
            'Rest briefly: Leave for 10 minutes and stir again so the seeds or oats do not clump.',
            'Refrigerate: Cover and refrigerate for at least 4 hours or overnight until thick and creamy.',
            'Loosen: In the morning, stir well and add a splash of milk if it is too thick.',
            'Serve: Serve chilled' + (f', topped with the {names(top)}.' if top else '.'),
        ]
    elif savoury:
        steps = [
            f'Roast: Dry-roast the {names(grain)} on low flame for 3 minutes until aromatic.' if roast else f'Rinse: Rinse the {names(grain)} well.',
            f'Cook: Add the {lname} and salt and bring to a boil, stirring.',
            f'Simmer: Cook on low flame for {cook} minutes, stirring often, until soft and creamy.' + (f' Add the {names(add)} halfway through.' if add else ''),
            'Adjust: Add a little hot water if it becomes too thick.',
            'Serve: Serve hot' + (' with the topping.' if top else '.'),
        ]
    else:
        steps = [
            f'Roast: Dry-roast the {names(grain)} on low flame for 3–4 minutes, stirring, until aromatic.' if roast else
            f'Mix: Whisk the {names(grain)} with ½ cup of cold {lname} until there are no lumps.',
            f'Cook: Add the remaining {lname} and bring to a gentle boil, stirring continuously so it does not stick.',
            f'Simmer: Lower the flame and cook for {cook} minutes, stirring often, until thick and creamy.' + (f' Add the {names(add)} in the last 2 minutes.' if add else ''),
            'Sweeten: Switch off the flame and stir in the ' + (names(sweet) or 'flavouring') + '. Adding jaggery off the heat stops milk from curdling.' if sweet else
            'Rest: Switch off the flame and rest for 2 minutes; it thickens further.',
            'Serve: Pour into bowls' + (f' and top with the {names(top)}.' if top else '.'),
        ]
    recipe(name, C, desc, serves, 5, cook, g, steps,
           tips=['Stir often and keep the flame low so the porridge does not catch at the bottom.',
                 'Porridge thickens as it cools; loosen it with a little warm milk or water.'],
           serve=['a handful of nuts or seeds and a fruit.', '<b>Best time:</b> breakfast.'],
           store='best eaten fresh; keeps in the fridge for 1 day. Reheat with a splash of milk or water.', sub=sub, tags=('soft',) + tuple(tags))


porridge('Ragi Porridge (Ragi Malt)', 'ragi 40', 'milk 300', 'A smooth, creamy finger millet porridge, rich in calcium and iron.', roast=False, top='almond 8 chopped', sweet='jaggery 10; elaichipowder 0.5', tags=('kids',))
porridge('Savoury Ragi Kanji', 'ragi 40', 'water 300; curd 100', 'A cooling savoury ragi porridge with buttermilk, a summer staple in Karnataka.', savoury=True, roast=False,
         add='onion 20 finely chopped; jeerapowder 0.5', sweet='')
porridge('Oats Porridge with Fruits', 'oats 60', 'milk 300', 'Creamy oats cooked in milk and topped with fresh fruit and nuts.', cook=6,
         top='banana 50 sliced; apple 50 chopped; almond 8; chia 6', sweet='cinnamon 0.5')
porridge('Dalia Porridge (Sweet)', 'dalia 60', 'milk 300; water 150', 'Broken wheat cooked in milk, sweetened lightly with jaggery and cardamom.', cook=15,
         sweet='jaggery 15; elaichipowder 0.5', top='almond 8; raisin 8', tags=('kids',))
porridge('Savoury Vegetable Dalia', 'dalia 80', 'water 480', 'Savoury broken wheat porridge with vegetables, light and filling.', savoury=True, cook=18,
         add='onion 40 chopped; carrot 40 chopped; peas 30; beans 30; jeera 1; haldi 0.5; ghee 5', sweet='')
porridge('Moong Dal Dalia Khichdi', 'dalia 60; moong 40', 'water 600', 'A one-pot porridge of broken wheat and moong dal, gentle and protein-rich.', savoury=True, cook=20,
         add='carrot 40 chopped; peas 30; jeera 1; haldi 0.5; ghee 5', sweet='')
porridge('Millet Porridge with Dates', 'foxtail 50', 'milk 300; water 150', 'Foxtail millet slow-cooked in milk and sweetened with dates.', cook=20,
         sweet='dates 16 chopped; elaichipowder 0.5', roast=True)
porridge('Quinoa Porridge', 'quinoa 50 rinsed', 'milk 250; water 120', 'A protein-rich breakfast porridge with quinoa, cinnamon and berries.', cook=18,
         sweet='cinnamon 0.5; honey 7', top='strawberry 50; almond 8')
porridge('Overnight Oats', 'oats 60', 'milk 200; curd 60', 'No-cook oats soaked overnight in milk and curd with chia and fruit, ready when you wake up.',
         sweet='chia 8; honey 7', top='banana 50; walnut 8; pomegranate 20', cook=0, roast=False)
porridge('Sattu Porridge', 'sattu 40', 'milk 300', 'A quick high-protein porridge made with roasted gram flour.', roast=False, cook=5, sweet='jaggery 10; elaichipowder 0.5')
porridge('Rice Kanji', 'rice 50', 'water 600', 'A soothing rice gruel with a pinch of cumin and salt, ideal when unwell.', savoury=True, roast=False, cook=25,
         add='jeera 1; ginger 3 grated', sweet='')
porridge('Oats Masala Porridge', 'oats 60', 'water 300', 'A quick savoury oats porridge with tomato and spices.', savoury=True, cook=6,
         add='onion 30 chopped; tomato 50 chopped; haldi 0.3; jeera 1; oil 5; coriander 4', sweet='')
porridge('Apple Cinnamon Oats', 'oats 60', 'milk 250; water 60', 'Warm oats cooked with apple and cinnamon, naturally sweet with no sugar.', cook=8,
         add='apple 100 grated', sweet='cinnamon 0.75', top='walnut 8')
porridge('Banana Ragi Porridge for Kids', 'ragi 30', 'milk 250', 'A smooth ragi and banana porridge, naturally sweetened, ideal for toddlers and children.', roast=False,
         add='banana 60 mashed', sweet='', cook=8, tags=('kids',))
porridge('Chia Pudding', 'chia 24', 'milk 240', 'A no-cook chia seed pudding with mango, rich in fibre and omega-3.', sweet='honey 7; elaichipowder 0.3', top='mango 80; almond 6', roast=False, cook=0)
porridge('Wheat and Oats Porridge with Dates', 'dalia 30; oats 30', 'milk 300', 'A warm porridge of broken wheat and oats, sweetened lightly with dates.', sweet='dates 16 chopped', cook=15)
