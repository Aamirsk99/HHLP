"""Breakfast: chilas, dosas, idlis, uttapams, appe."""
from core import recipe
from util import names, cap

CAT_ = 'Breakfast'

CHILA_TIPS = ['Rest the batter for 10 minutes; it makes the chila softer and easier to flip.',
              'Keep the flame medium-low so the centre cooks before the outside browns.',
              'If the chila breaks, the batter is too thin (add 1 tbsp flour) or the pan is not hot enough.']
CHILA_SERVE = ['mint-coriander chutney, plain curd or raita, and a cucumber-tomato salad.',
               '<b>Best time:</b> breakfast, or an early evening meal.']
CHILA_STORE = 'best eaten fresh. Plain batter (without vegetables) keeps in the fridge in an airtight box for up to 12 hours.'


def flour_chila(name, batter, veg, desc, water=180, spice='haldi 0.75; ajwain 0.6; chilli 0.6; salt',
                filling=None, fill_txt='', note='', serves=2, prep=10, cook=15, tags=(), extra_tips=(), rest=10,
                sub='Chila'):
    groups = [('For the Chila Batter', f'{batter}; {veg}; ginger 5 grated; coriander 8 chopped; {spice}; water {water}; oil 10')]
    if filling:
        groups.append(('For the Filling', filling))
    steps = [
        f'Prepare the vegetables: Finely chop the {names(veg)} and grate the ginger. Small, even pieces keep the chila thin and help it cook evenly.',
        f'Make the batter: In a mixing bowl, combine the {names(batter)} with turmeric, ajwain, chilli powder and salt. '
        f'Add water a little at a time and whisk to a smooth, lump-free batter that flows like dosa batter.{note}',
        f'Add vegetables & rest: Fold in the chopped vegetables, ginger and coriander. Rest the batter for {rest} minutes so it thickens slightly and the chila turns soft.',
    ]
    if filling:
        steps.append(f'Prepare the filling: {fill_txt}')
    steps += [
        'Heat the pan: Heat a non-stick or well-seasoned iron tawa on medium flame and brush it with ¼ tsp oil. A few drops of water should sizzle when the pan is ready.',
        'Spread the chila: Pour one ladle of batter in the centre and spread it gently in circles into a 6–7 inch round. Drizzle a few drops of oil around the edges.',
        'Cook the first side: Cook on medium-low flame for 2–3 minutes, until the top looks set and the edges lift easily and turn golden.',
        'Flip & cook: Flip with a flat spatula and cook the other side for 1–2 minutes, pressing lightly, until golden spots appear.',
    ]
    if filling:
        steps.append('Fill & fold: Spread 2 tbsp of the filling over one half of the chila, fold it over and press lightly. Repeat with the remaining batter.')
    steps.append('Serve: Serve hot with mint-coriander chutney or curd. Make the remaining chilas the same way, adding only a few drops of oil each time.')
    recipe(name, CAT_, desc, serves, prep, cook, groups, steps, tips=list(extra_tips) + CHILA_TIPS[:2],
           serve=CHILA_SERVE, store=CHILA_STORE, sub=sub, tags=('kids',) + tuple(tags))


VEG1 = 'onion 50 finely chopped; tomato 50 deseeded, chopped; gchilli 3 finely chopped'

flour_chila('Besan Chila', 'besan 100', VEG1,
            'The classic North Indian savoury gram flour pancake: crisp at the edges, soft inside and ready in 20 minutes.')
flour_chila('Paneer Stuffed Besan Chila', 'besan 100', VEG1,
            'Golden besan chilas folded over a spiced paneer filling, a high-protein vegetarian breakfast.',
            filling='paneer 80 crumbled; capsicum 30 finely chopped; chaat 1; coriander 4 chopped',
            fill_txt='Crumble the paneer and mix it with the capsicum, chaat masala and coriander.')
flour_chila('Palak Besan Chila', 'besan 100; spinach 60 finely chopped', 'onion 40 finely chopped; gchilli 3 finely chopped',
            'Besan chila loaded with fresh spinach for extra iron, folate and a lovely green colour.')
flour_chila('Methi Besan Chila', 'besan 100; methi 40 finely chopped', 'onion 40 finely chopped; gchilli 3 finely chopped',
            'A slightly bitter, aromatic besan chila made with fresh fenugreek leaves, a winter favourite.')
flour_chila('Tomato Onion Besan Chila', 'besan 100', 'onion 70 finely chopped; tomato 80 deseeded, chopped; gchilli 3 finely chopped',
            'A juicy, tangy chila with extra tomato and onion, ideal for a quick breakfast or tiffin.')
flour_chila('Oats Chila', 'oats 60 powdered; besan 40', VEG1 + '; carrot 30 grated',
            'A fibre-rich chila made with powdered oats and a little besan to bind, light yet filling.',
            note=' Rest oats batter for 15 minutes so the oats soften.', rest=15)
flour_chila('Ragi Chila', 'ragi 70; besan 30', VEG1,
            'A calcium-rich finger millet chila with an earthy flavour and a soft texture.', water=200)
flour_chila('Jowar Chila', 'jowar 70; besan 30', VEG1 + '; carrot 30 grated',
            'A gluten-free sorghum chila that keeps you full for hours.', water=190)
flour_chila('Bajra Chila', 'bajra 70; besan 30', VEG1 + '; methi 15 finely chopped',
            'A warming pearl millet chila with methi, perfect on winter mornings.', water=190)
flour_chila('Rava Chila', 'rava 80; curd 60', VEG1 + '; capsicum 30 finely chopped',
            'An instant semolina and curd chila, soft and fluffy with crunchy vegetables.', water=120,
            note=' Rest the rava batter for 15 minutes so the semolina swells.', rest=15)
flour_chila('Multigrain Chila', 'mgatta 50; besan 50', VEG1 + '; carrot 30 grated',
            'A wholesome chila made from multigrain atta and besan, packed with fibre.', water=190)
flour_chila('Quinoa Chila', 'quinoa 60 soaked 2 hours and ground; besan 40', VEG1,
            'A protein-packed chila made with ground quinoa and besan, naturally gluten-free.', water=120,
            note=' Grind the soaked quinoa to a smooth paste before mixing.')
flour_chila('Beetroot Besan Chila', 'besan 100; beet 60 grated', 'onion 40 finely chopped; gchilli 3 finely chopped',
            'A vibrant pink chila with grated beetroot, rich in folate and natural nitrates.')
flour_chila('Carrot Besan Chila', 'besan 100; carrot 70 grated', 'onion 40 finely chopped; gchilli 3 finely chopped',
            'Sweet grated carrots make this besan chila soft, colourful and rich in vitamin A.')
flour_chila('Sweet Corn Besan Chila', 'besan 100; corn 60 boiled', 'onion 40 finely chopped; capsicum 30 finely chopped; gchilli 3 finely chopped',
            'Besan chila studded with juicy sweet corn and capsicum, a hit with children.')
flour_chila('Mixed Vegetable Chila', 'besan 90', 'onion 40 finely chopped; tomato 40 chopped; carrot 30 grated; capsicum 30 finely chopped; cabbage 30 shredded; gchilli 3 finely chopped',
            'A colourful chila with five vegetables, an easy way to add more veggies to breakfast.')
flour_chila('Lauki Besan Chila', 'besan 90; lauki 100 grated, squeezed', 'onion 30 finely chopped; gchilli 3 finely chopped',
            'Grated bottle gourd keeps this besan chila extra soft, light and hydrating.', water=120)
flour_chila('Cabbage Besan Chila', 'besan 100; cabbage 80 finely shredded', 'onion 30 finely chopped; gchilli 3 finely chopped',
            'Finely shredded cabbage gives this chila a lovely crunch and extra fibre.')
flour_chila('Moringa Leaf Besan Chila', 'besan 100; moringaleaf 25', 'onion 40 finely chopped; gchilli 3 finely chopped',
            'Besan chila with moringa (drumstick) leaves, one of the most nutrient-dense greens.')
flour_chila('Rajgira Chila', 'rajgira 80; potato 60 boiled, mashed', 'gchilli 3 finely chopped; coriander 6 chopped',
            'A gluten-free amaranth flour chila bound with potato, suitable for fasting days.',
            spice='jeerapowder 1; pepper 0.5; salt', water=150, tags=('fast',))
flour_chila('Kuttu Chila', 'kuttu 80; potato 60 boiled, mashed', 'gchilli 3 finely chopped; coriander 6 chopped',
            'A buckwheat flour chila for vrat days, earthy, filling and gluten-free.',
            spice='jeerapowder 1; pepper 0.5; salt', water=150, tags=('fast',))
flour_chila('Egg Besan Chila', 'besan 80; egg 100 beaten', VEG1,
            'A fluffy hybrid of omelette and chila, made with besan and eggs for complete protein.', water=90)
flour_chila('Sattu Chila', 'sattu 60; besan 40', VEG1,
            'A Bihari-style protein-rich chila made with roasted gram flour (sattu).', water=190)
flour_chila('Avocado Chila', 'besan 100; avocado 75 mashed', VEG1,
            'A protein-rich gram flour pancake folded with creamy avocado and fresh vegetables, with healthy fats and plenty of fibre.',
            filling='avocado 75 diced; lemon 5; jeerapowder 0.5; pepper 0.3; chaat 0.5; hungcurd 30',
            fill_txt='Dice the avocado and mix it with the lemon juice, roasted cumin, black pepper, chaat masala and hung curd. The lemon juice keeps it from browning.',
            water=170, extra_tips=['Use a ripe avocado that yields slightly to gentle pressure; avocado batter is softer, so do not spread it too thin.'])
flour_chila('Spinach Oats Chila', 'oats 60 powdered; besan 40; spinach 50 finely chopped', 'onion 40 finely chopped; gchilli 3 finely chopped',
            'Oats and besan chila with spinach, high in fibre and iron.', rest=15)
flour_chila('Paneer Oats Chila', 'oats 60 powdered; besan 40', VEG1,
            'Oats chila filled with spiced paneer for a protein-rich start.', rest=15,
            filling='paneer 80 crumbled; onion 20 finely chopped; chaat 1; coriander 4 chopped',
            fill_txt='Mix the crumbled paneer with onion, chaat masala and coriander.')
flour_chila('Tofu Stuffed Besan Chila', 'besan 100', VEG1,
            'A vegan, protein-packed chila folded over spiced crumbled tofu.',
            filling='tofu 100 crumbled; capsicum 30 finely chopped; haldi 0.3; chaat 1; coriander 4 chopped',
            fill_txt='Crumble the tofu, sauté it for 2 minutes with turmeric and capsicum, then add chaat masala and coriander.')


def dal_chila(name, dal, extra, desc, soak='4 hours', water=60, filling=None, fill_txt='', sub='Chila', serves=2):
    groups = [('For the Chila Batter', f'{dal}; ginger 8; gchilli 6; jeera 1.25; hing; salt; water {water}; {extra}; oil 10')]
    if filling:
        groups.append(('For the Filling', filling))
    steps = [
        f'Soak: Wash the {names(dal)} 2–3 times and soak in plenty of water for {soak}. Drain well.' if soak else 'Rinse: Rinse the sprouts well in a colander and drain.',
        'Grind the batter: Grind the soaked dal with ginger, green chillies and cumin, adding water little by little, to a smooth, thick batter. It should coat the back of a spoon.',
        f'Season: Add hing and salt and mix in the {names(extra)}. The batter does not need fermentation and can be used right away.',
    ]
    if filling:
        steps.append(f'Prepare the filling: {fill_txt}')
    steps += [
        'Heat the pan: Heat a non-stick or iron tawa on medium flame and grease it lightly with oil.',
        'Spread the chila: Pour a ladle of batter and spread it quickly into a thin round. Drizzle a few drops of oil around the edges.',
        'Cook: Cook on medium flame for 2–3 minutes until the base is golden and crisp, then flip and cook the other side for 1 minute.',
    ]
    if filling:
        steps.append('Fill & fold: Place 2 tbsp of filling on one half, fold and press lightly.')
    steps.append('Serve: Serve hot with green chutney or tomato chutney. Repeat with the remaining batter.')
    recipe(name, CAT_, desc, serves, 15, 15, groups, steps,
           tips=['Do not add too much water while grinding; a thick batter gives crisp chilas.',
                 'Soaking can be done overnight for a quicker morning.'],
           serve=CHILA_SERVE, store='Batter keeps in the fridge for up to 24 hours; stir and adjust with a little water before use.',
           sub=sub, tags=('kids',))


dal_chila('Moong Dal Chila', 'moong 120', 'onion 40 finely chopped; coriander 8 chopped',
          'Soft, protein-rich chila made from soaked yellow moong dal, light on the stomach and quick to cook.')
dal_chila('Paneer Stuffed Moong Dal Chila', 'moong 120', 'coriander 8 chopped',
          'The restaurant-style moong dal chila filled with spiced paneer, a high-protein breakfast.',
          filling='paneer 80 grated; onion 30 finely chopped; capsicum 20 finely chopped; chaat 1; coriander 4',
          fill_txt='Mix the grated paneer with onion, capsicum, chaat masala and coriander.')
dal_chila('Green Moong Chila', 'gmoong 120', 'onion 40 finely chopped; coriander 8 chopped',
          'A fibre-rich chila made from whole green moong with its skin, also called pesarattu in Andhra.', soak='6–8 hours')
dal_chila('Masoor Dal Chila', 'masoor 120', 'onion 40 finely chopped; tomato 40 chopped; coriander 8 chopped',
          'A quick red lentil chila, rich in protein and iron, that needs only 2 hours of soaking.', soak='2 hours')
dal_chila('Mixed Dal Chila', 'moong 40; masoor 40; chanadal 40', 'onion 40 finely chopped; carrot 30 grated; coriander 8 chopped',
          'A chila made from three dals for a broader mix of protein, fibre and minerals.')
dal_chila('Chana Dal Chila', 'chanadal 120', 'onion 40 finely chopped; coriander 8 chopped',
          'A nutty, crisp chila made with soaked chana dal, which has a low glycaemic index.', soak='5 hours')
dal_chila('Moong Sprouts Chila', 'sprouts 150', 'onion 40 finely chopped; coriander 8 chopped',
          'A light chila made from moong sprouts, rich in vitamin C, fibre and protein.', soak=None, water=40)
dal_chila('Palak Moong Dal Chila', 'moong 120; spinach 60', 'onion 30 finely chopped; coriander 6 chopped',
          'Moong dal chila blended with spinach, a bright green, iron-rich breakfast.')
dal_chila('Moong Dal Chila with Vegetables', 'moong 120', 'onion 30 finely chopped; carrot 30 grated; capsicum 30 finely chopped; cabbage 30 shredded; coriander 6 chopped',
          'Moong dal chila loaded with crunchy vegetables for extra fibre and colour.')
dal_chila('Urad Moong Chila', 'moong 80; urad 40', 'onion 40 finely chopped; coriander 8 chopped',
          'A soft, slightly spongy chila made with moong and urad dal for more protein.')

# ---------------- Dosa ----------------
DOSA_SERVE = ['coconut chutney and sambar.', '<b>Best time:</b> breakfast or dinner.']
DOSA_STORE = 'fermented batter keeps in the fridge for 3–4 days. Cooked dosas are best eaten fresh.'


def fermented_dosa(name, grains, desc, dal='urad 50', extra='methiseed 2', filling=None, fill_txt='',
                   topping=None, top_txt='', serves=4, sub='Dosa', batter_add=None, add_txt='', fat='oil 15'):
    groups = [('For the Batter', f'{grains}; {dal}; {extra}; salt; water 300')]
    if batter_add:
        groups[0] = ('For the Batter', f'{grains}; {dal}; {extra}; {batter_add}; salt; water 300')
    if filling:
        groups.append(('For the Filling', filling))
    if topping:
        groups.append(('For the Topping', topping))
    groups.append(('For Cooking', fat))
    steps = [
        f'Soak: Wash the {names(grains)} and soak for 5–6 hours. Separately wash and soak the {names(dal)} with the methi seeds for 4–5 hours.',
        'Grind: Grind the urad dal with ice-cold water until light, fluffy and doubled in volume. Grind the soaked grain to a smooth paste. Mix both with clean hands.',
        'Ferment: Add salt, cover and keep in a warm place for 8–12 hours (overnight) until the batter rises and smells mildly sour.',
    ]
    if batter_add:
        steps.append(f'Flavour the batter: {add_txt}')
    if filling:
        steps.append(f'Prepare the filling: {fill_txt}')
    steps += [
        'Heat the tawa: Heat a cast-iron or non-stick tawa on medium-high flame. Sprinkle water; it should sizzle and evaporate. Wipe with an oiled cloth or half an onion.',
        'Spread the dosa: Pour a ladle of batter in the centre and spread it in quick outward circles into a thin round.',
    ]
    if topping:
        steps.append(f'Add the topping: {top_txt}')
    steps += [
        'Crisp it up: Drizzle ½ tsp oil or ghee over the dosa and cook on medium flame for 1–2 minutes until the base turns golden and crisp.',
    ]
    if filling:
        steps.append('Fill & fold: Place 2–3 tbsp of filling in the centre, fold the dosa over and lift onto a plate.')
    else:
        steps.append('Fold & serve: Fold the dosa in half or roll it up and serve immediately.')
    steps.append('Repeat: Wipe the tawa with a damp cloth between dosas to cool it slightly so the batter spreads evenly.')
    recipe(name, CAT_, desc, serves, 20, 20, groups, steps,
           tips=['In cold weather, ferment the batter in a switched-off oven with the light on.',
                 'Use non-iodised salt for better fermentation.'],
           serve=DOSA_SERVE, store=DOSA_STORE, sub=sub, level='Medium')


POTATO = 'potato 300 boiled, peeled and cubed; onion 100 sliced; gchilli 6 slit; curryleaf 3; mustard 3; urad_t 4; haldi 1; ginger 8 chopped; oil 10; salt; coriander 8 chopped'
POTATO_TXT = 'Heat oil, crackle mustard seeds and urad dal, add curry leaves, ginger, green chillies and onion and sauté until soft. Add turmeric, the potatoes, salt and 3 tbsp water, mash lightly and mix in coriander.'

fermented_dosa('Plain Dosa', 'idlirice 200', 'Crisp, golden South Indian crêpes made from a naturally fermented rice and urad dal batter.')
fermented_dosa('Masala Dosa', 'idlirice 200', 'Crisp dosa folded around a mildly spiced potato-onion filling, South India’s favourite breakfast.',
               filling=POTATO, fill_txt=POTATO_TXT)
fermented_dosa('Onion Dosa', 'idlirice 200', 'A crisp dosa topped with finely chopped onions, green chillies and coriander.',
               topping='onion 120 finely chopped; gchilli 6 finely chopped; coriander 8 chopped',
               top_txt='Immediately sprinkle the onion, green chilli and coriander over the dosa and press lightly with the spatula.')
fermented_dosa('Mysore Masala Dosa', 'idlirice 200', 'Dosa spread with a spicy red garlic chutney and filled with potato masala, a Karnataka speciality.',
               filling=POTATO + '; redchilli 4; garlic 12; chanadal 10', fill_txt=POTATO_TXT + ' For the red chutney, grind the dry red chillies, garlic and roasted chana dal with a little water and salt; spread 1 tsp on each dosa before filling.')
fermented_dosa('Brown Rice Dosa', 'brice 200', 'A fibre-rich dosa made with brown rice instead of white, nutty and crisp.')
fermented_dosa('Red Rice Dosa', 'rrice 200', 'An earthy Kerala-style dosa made with red matta rice, rich in fibre and antioxidants.')
fermented_dosa('Foxtail Millet Dosa', 'foxtail 200', 'A crisp, low-GI dosa made with foxtail millet in place of rice.')
fermented_dosa('Kodo Millet Dosa', 'kodo 200', 'A wholesome kodo millet dosa that is high in fibre and easy to digest.')
fermented_dosa('Little Millet Dosa', 'kutki 200', 'A light little millet (kutki) dosa, rich in iron and fibre.')
fermented_dosa('Barnyard Millet Dosa', 'sama 200', 'A crisp barnyard millet dosa, light and high in fibre.')
fermented_dosa('Bajra Dosa', 'idlirice 100; bajra 100', 'A Tamil Nadu-style kambu (pearl millet) dosa, warming and rich in iron.')
fermented_dosa('Multigrain Dosa', 'idlirice 100; foxtail 50; kutki 50', 'A dosa from rice and two millets, giving more fibre and minerals.',
               dal='urad 40; chanadal 20; moong 20')
fermented_dosa('Set Dosa', 'idlirice 200', 'Soft, spongy, thick dosas served in a set of three, made with poha in the batter.',
               extra='methiseed 2; poha 40', sub='Dosa')
fermented_dosa('Spinach Dosa', 'idlirice 200', 'A bright green dosa with spinach blended into the batter for iron and folate.',
               batter_add='spinach 100 blanched', add_txt='Blanch the spinach for 1 minute, blend it to a smooth purée and mix it into the fermented batter.')
fermented_dosa('Beetroot Dosa', 'idlirice 200', 'A pink, crisp dosa with beetroot purée in the batter, loved by children.',
               batter_add='beet 120 grated', add_txt='Blend the grated beetroot to a smooth purée with 2 tbsp water and stir it into the fermented batter.')
fermented_dosa('Carrot Dosa', 'idlirice 200', 'A soft, orange-tinted dosa with carrot blended into the batter.',
               batter_add='carrot 120 grated', add_txt='Blend the carrot to a fine purée and mix it into the fermented batter.')
fermented_dosa('Egg Dosa', 'idlirice 200', 'A street-style dosa with a beaten egg spread on top, crisp outside and protein-rich.',
               topping='egg 200 beaten; onion 60 finely chopped; pepper 1; coriander 6 chopped',
               top_txt='Pour 2–3 tbsp beaten egg (mixed with onion, pepper and coriander) over the dosa and spread with the back of a spoon. Cook until the egg sets, then flip briefly.')
fermented_dosa('Paneer Dosa', 'idlirice 200', 'Crisp dosa filled with a spicy paneer bhurji, a protein-rich twist on masala dosa.',
               filling='paneer 160 crumbled; onion 80 chopped; tomato 80 chopped; capsicum 50 chopped; gchilli 3; haldi 0.5; pavbhaji 2; oil 8; salt; coriander 6',
               fill_txt='Sauté onion and capsicum in oil, add tomato, turmeric and pav bhaji masala and cook until soft. Add the crumbled paneer, salt and coriander and mix for 1 minute.')
fermented_dosa('Ghee Roast Dosa', 'idlirice 200', 'A paper-thin, extra-crisp dosa roasted with a little ghee, a restaurant classic made at home.',
               fat='ghee 15')
fermented_dosa('Podi Dosa', 'idlirice 200', 'A spicy dosa sprinkled with idli podi (gun powder) and a little sesame oil.',
               topping='podi 30; sesameoil 10', top_txt='Sprinkle 1 tbsp idli podi evenly over the dosa and drizzle a few drops of sesame oil.')
fermented_dosa('Cheese Corn Dosa', 'idlirice 200', 'A kids’ favourite dosa topped with sweet corn, capsicum and a little cheese.',
               topping='corn 80 boiled; capsicum 50 finely chopped; cheese 28', top_txt='Sprinkle corn, capsicum and a little grated cheese over the dosa and cover for 30 seconds to melt.')
fermented_dosa('Mushroom Masala Dosa', 'idlirice 200', 'Crisp dosa filled with a peppery mushroom and onion masala.',
               filling='mushroom 200 sliced; onion 80 sliced; tomato 60 chopped; garlic 8; pepper 1; garam 1; oil 8; salt; coriander 6',
               fill_txt='Sauté garlic and onion in oil, add mushrooms and cook on high flame until their water dries. Add tomato, pepper, garam masala and salt and cook 2 minutes.')
fermented_dosa('Kheema Dosa', 'idlirice 200', 'A Chennai street-style dosa filled with spiced chicken keema.',
               filling='chickenmince 250; onion 80 chopped; tomato 80 chopped; ginger 8; garlic 8; chickenmasala 3; haldi 0.5; oil 10; salt; coriander 6',
               fill_txt='Sauté onion, ginger and garlic in oil, add tomato and masalas, then the chicken mince. Cook, breaking it up, for 10–12 minutes until fully cooked and dry.')


def instant_dosa(name, flours, desc, extra='onion 40 finely chopped; gchilli 3 finely chopped; curryleaf 1.5; jeera 1.25; coriander 6', water=360,
                 rest=20, serves=3, sub='Instant Dosa', curd=None, thin=True):
    base = f'{flours}; {extra}' + (f'; {curd}' if curd else '') + f'; salt; water {water}; oil 12'
    steps = [
        f'Mix the flours: In a large bowl, combine the {names(flours)}' + (' and curd' if curd else '') + ' with salt.',
        'Make a thin batter: Add water gradually, whisking constantly, to make a thin, flowing batter without lumps' + (' — much thinner than regular dosa batter.' if thin else '.'),
        f'Add flavourings & rest: Stir in the {names(extra)}. Rest for {rest} minutes; the flour absorbs water, so thin it again before cooking.',
        'Heat the tawa: Heat a cast-iron or non-stick tawa on medium-high flame and grease it lightly.',
        'Pour the dosa: Stir the batter from the bottom and pour it from a height, starting at the edges and filling the gaps. Do not spread it with the ladle.' if thin else
        'Spread the dosa: Pour a ladle of batter and spread it gently into a round.',
        'Cook: Drizzle ½ tsp oil and cook on medium flame for 3–4 minutes until the dosa turns golden and crisp and leaves the pan easily.',
        'Serve: Fold and serve immediately; instant dosas lose their crispness as they cool. Stir the batter before each dosa.',
    ]
    recipe(name, CAT_, desc, serves, 10, 20, base, steps,
           tips=['These dosas are cooked on one side only; flipping is not needed.',
                 'If the dosa sticks, the pan is not hot enough or needs a little more oil.'],
           serve=DOSA_SERVE, store='best made fresh. Leftover batter keeps in the fridge for 1 day.', sub=sub)


instant_dosa('Rava Dosa', 'rava 85; ricefl 65; atta 30', 'A lacy, crisp, instant semolina dosa that needs no grinding or fermenting.', curd='curd 30')
instant_dosa('Onion Rava Dosa', 'rava 85; ricefl 65; atta 30', 'Instant rava dosa with plenty of onion and green chilli, crisp and aromatic.',
             extra='onion 100 finely chopped; gchilli 6 finely chopped; ginger 5; curryleaf 1.5; peppercorn 1.5 crushed; jeera 1.25; coriander 8', curd='curd 30')
instant_dosa('Oats Dosa', 'oats 90 powdered; rava 40; ricefl 40', 'An instant, fibre-rich dosa made with powdered oats.', curd='curd 60')
instant_dosa('Ragi Dosa', 'ragi 120; ricefl 30; rava 30', 'An instant, crisp, calcium-rich finger millet dosa.', curd='curd 30')
instant_dosa('Wheat Dosa', 'atta 150; ricefl 30', 'A quick North-meets-South dosa made from whole-wheat flour, ready in 15 minutes.', thin=False, rest=10)
instant_dosa('Jowar Dosa', 'jowar 120; ricefl 30; rava 30', 'An instant gluten-free sorghum dosa, crisp at the edges and soft inside.', curd='curd 30')
instant_dosa('Bajra Rava Dosa', 'bajra 100; rava 50; ricefl 30', 'A crisp, warming dosa made with pearl millet flour and semolina.', curd='curd 30')
instant_dosa('Neer Dosa', 'ricefl 180', 'Delicate, soft, lace-thin Mangalorean rice dosas, traditionally served with coconut chutney or curry.',
             extra='coconut 30 grated', water=480, rest=10)
instant_dosa('Besan Dosa', 'besan 120; ricefl 30', 'A quick, protein-rich dosa from gram flour, crisp and savoury.', thin=False)
instant_dosa('Quinoa Rava Dosa', 'quinoa 80 powdered; rava 50; ricefl 40', 'An instant dosa with powdered quinoa for extra protein.', curd='curd 30')


def soaked_dosa(name, soak_items, desc, extra='ginger 8; gchilli 6; redchilli 2; jeera 1.25; hing; curryleaf 1.5', topping='', water=200,
                hours='4–6 hours', serves=3, sub='Dosa', tips=()):
    groups = [('For the Batter', f'{soak_items}; {extra}; salt; water {water}')]
    if topping:
        groups.append(('For the Topping', topping))
    groups.append(('For Cooking', 'oil 15'))
    steps = [
        f'Soak: Wash the {names(soak_items)} well and soak together for {hours}.',
        f'Grind: Drain and grind with the {names(extra) or "spices"} and spices to a slightly coarse, thick batter, adding water as needed.',
        'Season: Add salt and mix well. This batter needs no fermentation.',
        'Heat the tawa: Heat a cast-iron or non-stick tawa on medium flame and grease it lightly.',
        'Spread: Pour a ladle of batter and spread into a medium-thick round.' + (' Sprinkle the topping over it and press lightly.' if topping else ''),
        'Cook: Drizzle oil around the edges and cook for 2–3 minutes until golden, then flip and cook for 1–2 minutes more.',
        'Serve: Serve hot. Repeat with the remaining batter.',
    ]
    recipe(name, CAT_, desc, serves, 15, 20, groups, steps, tips=list(tips) + ['Grind the batter slightly coarse for a crisp texture.'],
           serve=['coconut chutney, avial or a little jaggery and butter (traditional).', '<b>Best time:</b> breakfast or dinner.'],
           store='batter keeps in the fridge for up to 2 days.', sub=sub)


soaked_dosa('Adai', 'rice 100; toor 40; chanadal 40; urad 20; moong 20', 'A thick, crisp, protein-rich Tamil dosa made from rice and four dals, no fermentation needed.',
            topping='onion 60 finely chopped; coriander 6')
soaked_dosa('Pesarattu', 'gmoong 180; rice 20', 'Andhra’s green moong dosa, high in protein and fibre, traditionally served with ginger chutney.',
            extra='ginger 10; gchilli 6; jeera 1.25', topping='onion 60 finely chopped; ginger 5 finely chopped; coriander 6', hours='6–8 hours')
soaked_dosa('Moong Dal Dosa', 'moong 160; rice 20', 'A light, crisp dosa made from yellow moong dal, very easy to digest.',
            extra='ginger 8; gchilli 6; jeera 1.25; hing', hours='3–4 hours')
soaked_dosa('Chana Dal Dosa', 'chanadal 120; rice 60', 'A nutty, protein-rich dosa from soaked chana dal and rice.')
soaked_dosa('Horse Gram Dosa', 'kulthi 100; rice 100', 'A traditional Karnataka dosa made with horse gram (kulthi), high in iron and protein.',
            hours='8 hours', tips=['Soak horse gram overnight; it is a hard legume.'])
soaked_dosa('Sprouts Dosa', 'mixsprouts 150; rice 60', 'A healthy dosa from mixed sprouts and rice, rich in vitamin C and protein.', hours='2 hours (rice only)')
soaked_dosa('Ragi Adai', 'ragi 120; toor 30; chanadal 30', 'A rustic adai made with ragi flour and soaked dals, rich in calcium.',
            topping='onion 60 finely chopped; coriander 6', hours='3 hours (dals only; mix in ragi after grinding)')

# ---------------- Idli ----------------
IDLI_SERVE = ['sambar and coconut or tomato chutney.', '<b>Best time:</b> breakfast; also great for tiffin boxes.']


def fermented_idli(name, grains, desc, dal='urad 70', extra='methiseed 2', add=None, add_txt='', serves=4, sub='Idli'):
    s = f'{grains}; {dal}; {extra}' + (f'; {add}' if add else '') + '; salt; water 250; oil 5'
    steps = [
        f'Soak: Wash and soak the {names(grains)} for 5–6 hours. Separately soak the {names(dal)} with methi seeds for 4 hours.',
        'Grind the dal: Grind the urad dal with ice-cold water, a little at a time, to a light, fluffy, smooth batter.',
        'Grind the grain: Grind the soaked grain to a slightly coarse, semolina-like batter. Mix both batters well with your hand.',
        'Ferment: Add salt, cover and leave in a warm place for 8–12 hours until it doubles and smells pleasantly sour.',
    ]
    if add:
        steps.append(f'Add flavour: {add_txt}')
    steps += [
        'Prepare the steamer: Boil 2 cups water in an idli steamer or pressure cooker (without the whistle). Grease the idli moulds lightly.',
        'Fill the moulds: Gently stir the batter without knocking out the air and pour into the moulds until three-quarters full.',
        'Steam: Steam on medium-high flame for 10–12 minutes. A toothpick inserted in the centre should come out clean.',
        'Rest & demould: Rest for 2 minutes, then scoop out the idlis with a wet spoon and serve hot.',
    ]
    recipe(name, CAT_, desc, serves, 20, 15, s, steps,
           tips=['Use a 4:1 ratio of idli rice to urad dal for soft idlis.', 'Do not over-stir fermented batter; it loses the air that makes idlis fluffy.'],
           serve=IDLI_SERVE, store='batter keeps in the fridge for 3–4 days; steamed idlis keep for 1 day and can be re-steamed.',
           sub=sub, tags=('soft', 'kids'), level='Medium')


fermented_idli('Soft Idli', 'idlirice 280', 'Pillowy-soft steamed rice and urad dal cakes, the lightest South Indian breakfast.')
fermented_idli('Brown Rice Idli', 'brice 280', 'Soft idlis made with brown rice for extra fibre and minerals.')
fermented_idli('Foxtail Millet Idli', 'foxtail 280', 'Soft, fluffy idlis made with foxtail millet, a low-GI alternative to rice.')
fermented_idli('Kodo Millet Idli', 'kodo 280', 'Light and spongy kodo millet idlis, rich in fibre.')
fermented_idli('Little Millet Idli', 'kutki 280', 'Soft little millet idlis, rich in iron and gentle on the stomach.')
fermented_idli('Barnyard Millet Idli', 'sama 280', 'Fluffy barnyard millet idlis, light and high in fibre.')
fermented_idli('Ragi Idli', 'idlirice 140; ragi 140', 'Soft, brown idlis made with ragi flour stirred into the batter, rich in calcium.',
               add=None)
fermented_idli('Red Rice Idli', 'rrice 280', 'Soft Kerala-style idlis from red matta rice, rich in antioxidants.')
fermented_idli('Moong Dal Idli', 'idlirice 140; moong 140', 'Protein-rich idlis made with moong dal and rice, soft and light.', dal='urad 40')
fermented_idli('Palak Idli', 'idlirice 280', 'Green, iron-rich idlis with spinach purée in the batter.',
               add='spinach 100 blanched, puréed', add_txt='Blend the blanched spinach to a smooth purée and gently fold it into the fermented batter.')
fermented_idli('Carrot Beetroot Idli', 'idlirice 280', 'Colourful idlis with grated carrot and beetroot, a fun tiffin for children.',
               add='carrot 60 finely grated; beet 40 finely grated', add_txt='Fold the finely grated carrot and beetroot into the batter just before steaming.')
fermented_idli('Kanchipuram Idli', 'idlirice 280', 'Temple-style spiced idlis with pepper, cumin, ginger and cashews.',
               add='peppercorn 2 crushed; jeera 2; ginger 8 grated; cashew 10; curryleaf 1.5; ghee 10; dryginger 1',
               add_txt='Heat ghee, fry cashews, crushed pepper, cumin, ginger and curry leaves for 1 minute and stir into the batter with dry ginger powder.')
fermented_idli('Quinoa Idli', 'idlirice 140; quinoa 140', 'Soft idlis with quinoa for extra protein.')
fermented_idli('Poha Idli', 'idlirice 200; poha 80', 'Extra-soft idlis with poha soaked and ground into the batter.')


def instant_idli(name, base, desc, curd='curd 245', add='', extra='mustard 3; urad_t 4; chana_t 4; curryleaf 1.5; gchilli 3 chopped; ginger 5 grated; cashew 6',
                 roast=True, serves=3, sub='Instant Idli'):
    s = [('For the Batter', f'{base}; {curd}; salt; eno 5; water 60' + (f'; {add}' if add else '')),
         ('For the Tempering', f'oil 8; {extra}')]
    steps = [
        f'Roast: Dry-roast the {names(base)} on low flame for 3–4 minutes until aromatic. Cool.' if roast else
        f'Prepare: Measure out the {names(base)}.',
        'Temper: Heat oil, crackle mustard seeds, add urad dal, chana dal, cashews, curry leaves, green chilli and ginger and fry until golden. Add this to the roasted base.',
        'Mix the batter: Add curd, salt and enough water to make a thick, idli-like batter.' + (f' Stir in the {names(add)}.' if add else ''),
        'Rest: Cover and rest for 15–20 minutes so the grains soften and swell.',
        'Prepare the steamer: Boil water in the steamer and grease the idli moulds.',
        'Add fruit salt: Just before steaming, add the Eno with 1 tsp water and stir gently in one direction; the batter will turn frothy.',
        'Steam: Fill the moulds immediately and steam for 10–12 minutes until a toothpick comes out clean.',
        'Serve: Rest 2 minutes, demould and serve hot.',
    ]
    recipe(name, CAT_, desc, serves, 25, 12, s, steps,
           tips=['Steam immediately after adding Eno; the bubbles fade if the batter waits.',
                 'Use fresh, slightly sour curd for the best taste.'],
           serve=IDLI_SERVE, store='best eaten the same day; re-steam leftovers for 3 minutes.', sub=sub, tags=('soft', 'kids'))


instant_idli('Rava Idli', 'rava 170', 'Soft, instant semolina idlis studded with cashews and curry leaves, ready in 30 minutes.')
instant_idli('Vegetable Rava Idli', 'rava 170', 'Instant rava idlis loaded with grated carrot, peas and coriander.',
             add='carrot 50 grated; peas 40; coriander 6 chopped')
instant_idli('Oats Idli', 'oats 90 powdered; rava 60', 'Instant, fibre-rich idlis made with powdered oats and semolina.',
             add='carrot 40 grated; coriander 6 chopped')
instant_idli('Ragi Rava Idli', 'ragi 90; rava 80', 'Instant ragi and semolina idlis, soft and rich in calcium.')
instant_idli('Dalia Idli', 'dalia 120 finely ground; rava 40', 'Soft instant idlis made with broken wheat for extra fibre.',
             add='carrot 40 grated; peas 30')
instant_idli('Moong Dal Instant Idli', 'moong 150 soaked 3 hours and ground', 'Protein-rich instant idlis from ground moong dal, no rice needed.',
             curd='curd 60', roast=False)
instant_idli('Jowar Idli', 'jowar 100; rava 60', 'Soft instant idlis with sorghum flour, gluten-light and fibre-rich.')
instant_idli('Beetroot Rava Idli', 'rava 170', 'Pretty pink instant idlis with beetroot purée.', add='beet 80 grated, puréed')
instant_idli('Spinach Oats Idli', 'oats 90 powdered; rava 60', 'Instant green idlis with oats and spinach, high in fibre and iron.',
             add='spinach 60 blanched, puréed')
instant_idli('Corn Rava Idli', 'rava 170', 'Instant rava idlis with crushed sweet corn, soft and slightly sweet.', add='corn 80 coarsely crushed')

# ---------------- Uttapam ----------------


def uttapam(name, base, topping, desc, instant=False, serves=3, sub='Uttapam'):
    if instant:
        g = [('For the Batter', f'{base}; curd 120; salt; water 120'), ('For the Topping', topping), ('For Cooking', 'oil 15')]
        first = [f'Make the batter: Mix the {names(base)} with curd, salt and water to a thick batter. Rest for 20 minutes.']
    else:
        g = [('For the Batter (fermented)', f'{base}; urad 50; methiseed 2; salt; water 250'), ('For the Topping', topping), ('For Cooking', 'oil 15')]
        first = [f'Prepare the batter: Soak the {names(base)} for 5 hours and the urad dal with methi seeds for 4 hours. Grind separately, mix, add salt and ferment overnight.',
                 'Thicken: Uttapam batter should be thicker than dosa batter; do not thin it.']
    steps = first + [
        f'Chop the topping: Finely chop the {names(topping)} and mix them together.',
        'Heat the tawa: Heat a tawa on medium flame and grease it lightly.',
        'Spread: Pour a ladle of batter and spread it gently into a thick 5–6 inch round.',
        'Add the topping: Sprinkle 2 tbsp of the topping evenly and press it in gently with the back of the ladle.',
        'Cook covered: Drizzle oil around the edges, cover and cook on medium-low flame for 3 minutes until the base is golden.',
        'Flip: Flip and cook the topping side for 1–2 minutes until lightly browned.',
        'Serve: Serve hot with chutney and sambar.',
    ]
    recipe(name, CAT_, desc, serves, 15 if instant else 20, 20, g, steps,
           tips=['Cooking covered on low heat makes the uttapam soft and fully cooked inside.',
                 'Press the topping into the batter so it does not fall off when flipped.'],
           serve=['coconut chutney, tomato chutney and sambar.', '<b>Best time:</b> breakfast or a light dinner.'],
           store='best eaten fresh.', sub=sub, tags=('kids',))


uttapam('Onion Uttapam', 'idlirice 200', 'onion 120; gchilli 6; coriander 8', 'A thick, soft South Indian pancake topped with caramelised onions and chillies.')
uttapam('Tomato Onion Uttapam', 'idlirice 200', 'onion 80; tomato 100; gchilli 6; coriander 8', 'Thick uttapam topped with juicy tomatoes and onions.')
uttapam('Mixed Vegetable Uttapam', 'idlirice 200', 'onion 60; tomato 60; carrot 50; capsicum 50; coriander 8', 'Soft uttapam topped with a colourful mix of vegetables.')
uttapam('Millet Uttapam', 'foxtail 200', 'onion 80; carrot 50; coriander 8; gchilli 6', 'A fibre-rich uttapam made with foxtail millet batter.')
uttapam('Oats Uttapam', 'oats 90 powdered; rava 60', 'onion 60; tomato 60; capsicum 40; coriander 8', 'An instant oats and semolina uttapam with vegetables.', instant=True)
uttapam('Rava Uttapam', 'rava 170', 'onion 60; tomato 60; capsicum 40; gchilli 6; coriander 8', 'An instant semolina uttapam, soft and ready in 30 minutes.', instant=True)
uttapam('Ragi Uttapam', 'ragi 120; rava 50', 'onion 80; carrot 40; coriander 8; gchilli 6', 'An instant calcium-rich ragi uttapam with vegetables.', instant=True)
uttapam('Paneer Uttapam', 'idlirice 200', 'paneer 120 grated; onion 60; capsicum 50; coriander 8', 'Uttapam topped with grated paneer and vegetables for extra protein.')
uttapam('Corn Capsicum Uttapam', 'idlirice 200', 'corn 100; capsicum 60; onion 50; coriander 8', 'A kid-friendly uttapam with sweet corn and capsicum.')
uttapam('Spinach Uttapam', 'idlirice 200', 'spinach 80 finely chopped; onion 60; gchilli 6', 'Uttapam topped with fresh spinach and onion.')
uttapam('Moong Dal Uttapam', 'moong 150 soaked 3 hours and ground; rava 30', 'onion 60; tomato 60; coriander 8; gchilli 6', 'A protein-rich instant uttapam made from moong dal batter.', instant=True)

# ---------------- Appe / Paniyaram ----------------


def appe(name, base, add, desc, sweet=False, sub='Appe / Paniyaram'):
    s = [('For the Batter', f'{base}; {add}; salt; water 60'), ('For Cooking', 'oil 10')]
    steps = [
        f'Prepare the batter: Take the {names(base)} in a bowl; it should be thick, like idli batter.',
        f'Add the flavourings: Mix in the {names(add)} and salt.',
        'Heat the appe pan: Heat a paniyaram (appe) pan on medium flame and add a few drops of oil to each cavity.',
        'Fill: Pour batter into each cavity until three-quarters full.',
        'Cook covered: Cover and cook on medium-low flame for 3–4 minutes until the base turns golden.',
        'Turn: Turn each appe with a skewer or spoon handle, add a drop of oil and cook the other side for 2–3 minutes.',
        'Serve: Serve hot with coconut or tomato chutney.' if not sweet else 'Serve: Serve warm as a snack.',
    ]
    recipe(name, CAT_, desc, 3, 10, 20, s, steps,
           tips=['Keep the flame medium-low so the appe cooks through without burning.',
                 'Leftover idli or dosa batter is perfect for appe.'],
           serve=['coconut chutney or tomato chutney.', 'Great for tiffin boxes and evening snacks.'],
           store='best eaten fresh; keeps in a tiffin for 4–5 hours.', sub=sub, tags=('kids',))


appe('Vegetable Appe', 'idlirice 150 as fermented idli batter; urad 40', 'onion 60 chopped; carrot 40 grated; capsicum 30 chopped; gchilli 3; coriander 6; mustard 2; curryleaf 1',
     'Crisp outside, soft inside South Indian dumplings made from idli batter and vegetables, using very little oil.')
appe('Rava Appe', 'rava 120; curd 120', 'onion 50 chopped; carrot 40 grated; gchilli 3; coriander 6; eno 3',
     'Instant semolina appe, golden and fluffy, ready in 20 minutes.')
appe('Oats Appe', 'oats 80 powdered; rava 40; curd 120', 'onion 50 chopped; carrot 40 grated; gchilli 3; coriander 6; eno 3',
     'Fibre-rich instant appe with oats, crisp and light.')
appe('Ragi Appe', 'ragi 80; rava 40; curd 120', 'onion 50 chopped; coriander 6; gchilli 3; eno 3',
     'Instant ragi appe, soft, nutty and rich in calcium.')
appe('Moong Dal Appe', 'moong 150 soaked 3 hours and ground', 'onion 50 chopped; carrot 40 grated; ginger 5; gchilli 3; coriander 6; eno 3',
     'Protein-rich appe made from soaked moong dal batter.')
appe('Millet Paniyaram', 'foxtail 150 soaked and ground with urad', 'onion 60 chopped; gchilli 3; curryleaf 1; coriander 6; mustard 2',
     'Kuzhi paniyaram made from fermented foxtail millet batter, crisp and light.')
appe('Sweet Ragi Paniyaram', 'ragi 100; atta 30', 'jaggery 40; banana 100 mashed; elaichipowder 1; coconut 20',
     'Soft, mildly sweet paniyaram with ragi, banana and jaggery, a wholesome snack.', sweet=True)
