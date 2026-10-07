"""Salads, raitas, soups, chutneys and dips."""
from core import recipe
from util import names, allnames, produce

# ---------------- Salads ----------------
CS = 'Salads & Raita'


def salad(name, base, dressing, desc, prep_txt='', serves=2, sub='Salad', cooked='', tags=()):
    g = [('For the Salad', base), ('For the Dressing', dressing)]
    steps = []
    if cooked:
        steps.append(f'Cook: {cooked}')
    steps += [
        f'Prepare: {prep_txt or f"Wash all the produce well. Chop the {names(base)} into small, even pieces."}',
        f'Make the dressing: In a small bowl, whisk together the {allnames(dressing)} until well combined.',
        'Combine: Put the salad ingredients in a large bowl, pour the dressing over and toss gently with two spoons.',
        'Rest: Let the salad sit for 5 minutes so the flavours mingle (not longer, or the vegetables release water).',
        'Serve: Serve immediately, or keep the dressing separate until serving if packing for later.',
    ]
    recipe(name, CS, desc, serves, 15, 0 if not cooked else 10, g, steps,
           tips=['Add salt and dressing just before eating so the salad stays crunchy.',
                 'Chill the vegetables beforehand for a refreshing salad.'],
           serve=['as a starter before lunch or dinner, or as a light meal on its own.', 'Eat salad first in a meal; it helps you eat less and steadies blood sugar.'],
           store='best eaten fresh. Chopped vegetables (undressed) keep in the fridge for 1 day.', sub=sub, tags=tags)


LD = 'lemon 15; chaat 2; jeerapowder 1; pepper 0.5; salt; oliveoil 5'
salad('Kachumber Salad', 'cucumber 150; tomato 120; onion 80; gchilli 3; coriander 8', 'lemon 15; chaat 1.5; jeerapowder 1; salt',
      'The classic Indian chopped salad of cucumber, tomato and onion with lemon and spices.')
salad('Moong Sprouts Salad', 'sprouts 200; onion 50; tomato 60; cucumber 60; coriander 8; gchilli 3', LD,
      'A crunchy, protein-rich salad of moong sprouts and fresh vegetables.')
salad('Mixed Sprouts Salad', 'mixsprouts 200; onion 50; tomato 60; carrot 40; pomegranate 30; coriander 8', LD,
      'A colourful salad of mixed sprouts with pomegranate, high in protein and fibre.')
salad('Chana Chaat', 'chickpea 120 boiled; onion 60; tomato 60; cucumber 60; coriander 8; gchilli 3', 'lemon 15; chaat 2; jeerapowder 1; chilli 0.5; salt',
      'A tangy chickpea salad, a protein-packed street-style snack.', cooked='Soak the chickpeas overnight and pressure-cook for 5 whistles until soft; cool.')
salad('Kala Chana Salad', 'kalachana 120 boiled; onion 60; tomato 60; cucumber 60; coriander 8', LD,
      'Black chickpea salad, rich in iron and fibre.', cooked='Soak the kala chana overnight and pressure-cook for 5–6 whistles; cool.')
salad('Kosambari (Moong Dal Salad)', 'moong 80 soaked 2 hours; cucumber 100; carrot 60 grated; coconut 20; coriander 8; gchilli 3',
      'lemon 15; salt; oil 3; mustard 2; curryleaf 1; hing', 'Karnataka’s festive salad of soaked moong dal, cucumber and coconut, light and cooling.')
salad('Rajma Salad', 'rajma 100 boiled; onion 50; tomato 60; capsicum 60; corn 50; coriander 8', LD,
      'A hearty kidney bean salad with corn and capsicum.', cooked='Soak the rajma overnight and pressure-cook until fully soft; cool and drain.')
salad('Corn Chaat', 'corn 250 boiled; onion 50; tomato 60; capsicum 40; coriander 8', 'lemon 15; chaat 2; chilli 0.5; salt; butter 5',
      'Warm sweet corn tossed with lemon, chaat masala and vegetables.', cooked='Boil or steam the corn kernels for 5 minutes and drain.')
salad('Paneer Tikka Salad', 'paneer 150 cubed; capsicum 80; onion 60; tomato 60; lettuce 50', 'hungcurd 30; tandoori 3; lemon 10; salt',
      'Grilled tandoori paneer cubes tossed with crunchy vegetables.', cooked='Toss the paneer in half the dressing and grill or pan-sear until lightly charred.')
salad('Chicken Salad', 'chicken 200 boiled or grilled, shredded; lettuce 60; cucumber 80; tomato 60; onion 40; corn 40', 'hungcurd 40; lemon 10; pepper 1; mint 3; salt',
      'A high-protein salad of grilled chicken and fresh vegetables in a mint-curd dressing.', cooked='Grill or boil the chicken with salt and pepper and shred it.')
salad('Egg Salad', 'egg 200 hard-boiled, chopped; onion 40; cucumber 80; tomato 60; coriander 6', 'hungcurd 40; pepper 1; lemon 5; salt',
      'Chopped boiled eggs with vegetables in a light curd dressing.', cooked='Hard-boil the eggs for 10 minutes, cool in cold water and peel.')
salad('Quinoa Salad', 'quinoa 80; cucumber 80; tomato 60; capsicum 60; onion 40; chickpea 60 boiled; mint 6', 'lemon 20; oliveoil 8; pepper 1; salt',
      'A protein-rich quinoa salad with vegetables and chickpeas.', cooked='Rinse the quinoa and cook in 1 cup water for 15 minutes; fluff and cool.')
salad('Beetroot Carrot Salad', 'beet 120 grated; carrot 120 grated; peanut 15 roasted; coriander 6', 'lemon 15; salt; pepper 0.5',
      'A sweet, crunchy salad of grated beetroot and carrot.')
salad('Cabbage Carrot Slaw (Indian Style)', 'cabbage 150 shredded; carrot 100 grated; capsicum 60; onion 40', 'hungcurd 50; lemon 10; pepper 1; mustard 1; salt',
      'A creamy, light coleslaw made with hung curd instead of mayonnaise.')
salad('Cucumber Peanut Salad (Khamang Kakdi)', 'cucumber 300 finely chopped; peanut 25 roasted, crushed; coconut 15; coriander 6; gchilli 3', 'lemon 10; sugar 2; salt; oil 3; jeera 1',
      'Maharashtrian cucumber salad with crushed peanuts and coconut.')
salad('Fruit Chaat', 'apple 100; papaya 100; banana 80; pomegranate 40; guava 80; orange 80', 'lemon 10; chaat 2; blacksalt; jeerapowder 0.5',
      'A tangy, spiced mixed fruit salad, full of vitamins and fibre.')
salad('Watermelon Paneer Salad', 'watermelon 300; paneer 60 crumbled; cucumber 100; mint 4', 'lemon 10; pepper 0.5; blacksalt',
      'A cooling summer salad of watermelon, cucumber and paneer.')
salad('Sprouts and Pomegranate Salad', 'sprouts 150; pomegranate 60; onion 40; cucumber 60; mint 4', LD, 'Moong sprouts with jewel-like pomegranate seeds.')
salad('Lobia Salad', 'lobia 100 boiled; onion 50; tomato 60; capsicum 50; coriander 8', LD, 'A protein-packed black-eyed bean salad.',
      cooked='Soak the lobia for 6 hours and pressure-cook for 3 whistles; cool.')
salad('Peanut Chaat', 'peanut 100 boiled; onion 50; tomato 60; cucumber 50; coriander 8', 'lemon 15; chaat 2; chilli 0.5; salt', 'Boiled peanuts tossed with vegetables and spices.',
      cooked='Pressure-cook the raw peanuts with salt for 3 whistles; drain.')
salad('Tofu Salad', 'tofu 200 cubed; lettuce 60; cucumber 80; capsicum 60; springonion 20', 'lemon 10; soysauce 5; sesame 5; pepper 0.5', 'A vegan high-protein salad with seared tofu.',
      cooked='Pan-sear the tofu cubes in a non-stick pan until golden on all sides.')
salad('Green Salad Bowl', 'lettuce 80; cucumber 120; capsicum 60; carrot 60; tomato 60; onion 40', 'lemon 15; oliveoil 5; pepper 0.5; oregano 0.5; salt', 'A simple everyday green salad.')
salad('Sweet Potato Chaat Salad', 'sweetpotato 250 boiled, cubed; onion 40; pomegranate 30; coriander 6', 'lemon 15; chaat 2; jeerapowder 1; salt', 'Warm sweet potato chaat with lemon and spices.',
      cooked='Boil or roast the sweet potato until just tender; peel and cube.')
salad('Moong Dal Sprout Chaat with Curd', 'sprouts 150; curd 100; onion 40; tomato 40; coriander 6; pomegranate 20', 'chaat 1.5; jeerapowder 1; chilli 0.3; salt', 'Sprouts topped with whisked curd and spices.')
salad('Carrot Kosambari', 'carrot 200 grated; moong 30 soaked; coconut 15; coriander 6', 'lemon 10; salt; oil 3; mustard 2; curryleaf 1', 'A Karnataka-style grated carrot salad.')
salad('Rainbow Vegetable Salad', 'redcapsicum 80; capsicum 60; carrot 60; cabbage 60; corn 50; cucumber 80', 'lemon 15; honey 5; oliveoil 5; pepper 0.5; salt', 'A colourful, crunchy salad of six vegetables.')


def raita(name, add, desc, prep_txt='', spice='jeerapowder 1; chilli 0.3; salt', serves=3, temper=''):
    g = [('Ingredients', f'curd 300; {add}; {spice}')]
    if temper:
        g.append(('For the Tempering (optional)', temper))
    steps = [
        f'Prepare: {prep_txt or f"Wash and finely chop or grate the {names(add)}."}',
        'Whisk the curd: Whisk the chilled curd until smooth. Add a few tablespoons of water or milk if it is very thick.',
        f'Combine: Fold in the {names(add)}.',
        'Season: Add roasted cumin powder, chilli powder and salt and mix.',
    ]
    if temper:
        steps.append('Temper: Heat oil, crackle the seeds and pour the tempering over the raita.')
    steps.append('Chill & serve: Refrigerate for 15 minutes and serve cold.')
    recipe(name, CS, desc, serves, 10, 0, g, steps,
           tips=['Add salt just before serving to keep the raita from turning watery.', 'Use fresh, set curd for a thick raita.'],
           serve=['pulao, biryani, paratha or khichdi.', 'Raita adds probiotics and protein to any meal.'],
           store='keeps in the fridge for 1 day.', sub='Raita', tags=('soft',))


raita('Cucumber Raita', 'cucumber 150 grated, lightly squeezed; mint 3', 'Cooling cucumber and mint raita, the perfect side for biryani and parathas.')
raita('Onion Tomato Raita', 'onion 60 finely chopped; tomato 60 finely chopped; coriander 6', 'A classic raita with onion, tomato and coriander.')
raita('Lauki Raita', 'lauki 150 grated, boiled 3 minutes, cooled', 'A light raita with cooked bottle gourd, gentle on the stomach.')
raita('Beetroot Raita', 'beet 100 grated, steamed', 'A bright pink raita with steamed beetroot.')
raita('Pineapple Raita', 'pineapple 120 finely chopped', 'Sweet and tangy pineapple raita.', spice='blacksalt; chilli 0.2; jeerapowder 0.5')
raita('Palak Raita', 'spinach 80 blanched, chopped; garlic 2 grated', 'A garlicky spinach raita rich in iron and calcium.')
raita('Mint Raita (Pudina Raita)', 'mint 15 ground; coriander 8 ground; gchilli 3', 'A refreshing green mint-coriander raita.')
raita('Carrot Raita', 'carrot 100 grated', 'Raita with sweet grated carrot and a mustard-seed tempering.', temper='oil 3; mustard 2; curryleaf 1')
raita('Fruit Raita', 'apple 60; banana 50; pomegranate 30; grapes 40', 'A mildly sweet raita with mixed fruit.', spice='elaichipowder 0.3; blacksalt')
raita('Pomegranate Raita', 'pomegranate 80; mint 3', 'A jewel-like raita with pomegranate seeds.')
raita('Mixed Vegetable Raita', 'cucumber 60; onion 40; tomato 40; carrot 40; coriander 6', 'A crunchy raita with mixed vegetables.')
raita('Pachadi (Cucumber Coconut)', 'cucumber 150; coconut 25 ground with chilli and mustard', 'Kerala-style cucumber pachadi with a coconut-mustard paste.',
      temper='coconutoil 3; mustard 2; redchilli 1; curryleaf 1')
raita('Bhindi Raita (Crisp Okra)', 'bhindi 120 thinly sliced, pan-roasted until crisp', 'Raita topped with crisp pan-roasted okra.')
raita('Potato Raita', 'potato 120 boiled, cubed; coriander 6', 'A comforting raita with boiled potato and roasted cumin.')
raita('Sprouts Raita', 'sprouts 100 steamed; onion 30; coriander 6', 'A high-protein raita with steamed moong sprouts.')
raita('Corn Raita', 'corn 100 boiled; capsicum 30; coriander 6', 'A sweet corn raita, popular with children.')
raita('Methi Raita', 'methi 40 sautéed', 'A slightly bitter, aromatic raita with sautéed fenugreek leaves.', temper='oil 3; jeera 1')

# ---------------- Soups ----------------
CSOUP = 'Soups'


def soup(name, veg, desc, blend=True, base='oil 8; garlic 8 chopped; ginger 5; onion 60 chopped', water=720, spice='pepper 1; salt', finish='coriander 4; lemon 5',
         mins=15, pc=False, serves=3, sub='Soup', tags=()):
    g = [('Ingredients', f'{veg}; water {water}; {spice}'), ('For Sautéing', base)]
    if finish:
        g.append(('To Finish', finish))
    steps = [
        f'Prepare: Wash and roughly chop the {produce(veg)}.' if produce(veg) else f'Prepare: Rinse the {names(veg)}.',
        f'Sauté: Heat oil in a pot and sauté the {allnames(base)} for 2–3 minutes until soft and fragrant.',
        f'Add vegetables: Add the {names(veg)} and sauté for 2 minutes.',
        (f'Pressure-cook: Add the water and salt and pressure-cook for 2–3 whistles until everything is very soft.' if pc else
         f'Simmer: Add the water and salt, bring to a boil and simmer covered for {mins} minutes until soft.'),
    ]
    if 'cornflour' in spice:
        steps.append('Thicken: Mix the cornflour with 3 tbsp cold water and stir it into the simmering soup. Cook for 1\u20132 minutes until slightly thick.')
    if blend:
        steps += ['Blend: Cool slightly and blend until smooth. Strain if you like a silky soup.',
                  'Reheat: Return to the pot, adjust the thickness with hot water and bring to a gentle boil.']
    steps += [
        'Season: Add pepper and check the salt.',
        'Serve: Pour into bowls' + (f', garnish with the {names(finish)}' if finish else '') + ' and serve hot.',
    ]
    recipe(name, CSOUP, desc, serves, 10, mins + 10, g, steps,
           tips=['Thicken soups with a little blended potato, oats or dal instead of cornflour or cream.',
                 'Add lemon juice only after switching off the heat.'],
           serve=['a slice of whole-wheat toast or a small salad.', '<b>Best time:</b> as a starter or a light dinner.'],
           store='keeps in the fridge for 2 days; can be frozen for 1 month (without cream).', sub=sub, tags=('soft',) + tuple(tags))


soup('Tomato Soup', 'tomato 500; carrot 60; beet 30', 'A smooth, tangy tomato soup with carrot and a hint of beetroot for colour, no cream needed.', finish='coriander 4', spice='pepper 1; sugar 3; salt')
soup('Palak Soup', 'spinach 250; potato 60; milk 120', 'A silky spinach soup thickened with potato, rich in iron.', mins=8, finish='lemon 5')
soup('Mixed Vegetable Soup', 'carrot 60 diced; beans 50; cabbage 60; peas 40; corn 40; capsicum 40', 'A clear, chunky mixed vegetable soup, light and filling.', blend=False, mins=10)
soup('Sweet Corn Vegetable Soup', 'corn 200; carrot 50 diced; beans 40; cabbage 40; springonion 20', 'Indo-Chinese sweet corn soup, thickened lightly and full of vegetables.', blend=False,
     spice='pepper 1.5; soysauce 5; cornflour 8; salt', mins=10)
soup('Lentil Soup (Dal Shorba)', 'moong 60; masoor 40; tomato 100; carrot 50', 'A protein-rich lentil soup spiced with cumin and pepper.', pc=True, spice='jeera 1; pepper 1; haldi 0.5; salt')
soup('Moong Dal Soup', 'moong 80; tomato 80; spinach 60', 'A light, nourishing moong dal soup, ideal when unwell.', pc=True, spice='jeera 1; pepper 1; haldi 0.5; salt')
soup('Mushroom Soup', 'mushroom 300; milk 150; oats 15', 'A creamy mushroom soup thickened with oats and milk instead of cream.', spice='pepper 1.5; oregano 0.5; salt')
soup('Pumpkin Soup', 'pumpkin 450; carrot 60', 'A naturally sweet, velvety pumpkin soup.', spice='pepper 1; jeerapowder 0.5; salt')
soup('Carrot Ginger Soup', 'carrot 400; ginger 10', 'A bright, warming carrot soup with fresh ginger.')
soup('Beetroot Soup', 'beet 300; carrot 80; tomato 100', 'A vivid beetroot soup, rich in folate and nitrates.', spice='pepper 1; jeerapowder 0.5; salt')
soup('Lauki Soup', 'lauki 400; tomato 60', 'A very light, cooling bottle gourd soup, great for weight loss.', spice='jeerapowder 1; pepper 1; salt')
soup('Broccoli Soup', 'broccoli 300; potato 60; milk 120', 'A creamy broccoli soup made with milk and a little potato.')
soup('Drumstick Soup', 'drumstick 250; tomato 80; moong 20', 'A traditional South Indian drumstick soup, rich in minerals.', pc=True, spice='pepper 1.5; jeera 1; salt')
soup('Lemon Coriander Soup', 'carrot 40 finely diced; cabbage 40; beans 30; coriander 20; springonion 20', 'A clear, zesty soup with lots of coriander and lemon, rich in vitamin C.',
     blend=False, finish='lemon 20; coriander 8', mins=8, spice='pepper 1; cornflour 5; salt')
soup('Manchow Soup (Lighter)', 'cabbage 60; carrot 50; beans 40; capsicum 40; mushroom 40; springonion 20', 'Spicy, garlicky Indo-Chinese soup without the fried noodles.',
     blend=False, spice='soysauce 8; vinegar 5; pepper 1.5; cornflour 8; salt', mins=8)
soup('Hot and Sour Vegetable Soup', 'cabbage 60; carrot 50; mushroom 50; capsicum 40; tofu 60', 'A tangy, peppery Indo-Chinese soup with tofu.',
     blend=False, spice='soysauce 8; vinegar 8; pepper 2; chilliflakes 1; cornflour 8; salt', mins=8)
soup('Cabbage Soup', 'cabbage 300; tomato 100; carrot 60; capsicum 50', 'A light, filling cabbage and tomato soup for weight loss.', blend=False, mins=12)
soup('Tomato Tulsi Soup', 'tomato 500; carrot 50', 'Tomato soup with fresh tulsi (holy basil) leaves.', spice='herbal 1; pepper 1; salt', finish='coriander 4')
soup('Mulligatawny Soup', 'masoor 60; carrot 60; apple 60; coconutmilk 120', 'An Anglo-Indian spiced lentil soup with apple and coconut milk.', pc=True,
     spice='haldi 0.5; jeerapowder 1; dhania 1; pepper 1; salt')
soup('Chicken Clear Soup', 'chickencut 250; carrot 50; beans 40; cabbage 40; springonion 20', 'A light, nourishing chicken broth with vegetables, ideal when recovering.',
     blend=False, pc=True, spice='pepper 1.5; salt', finish='lemon 5; coriander 4')
soup('Chicken Sweet Corn Soup', 'chicken 150 shredded; corn 150; egg 50 beaten', 'Classic chicken sweet corn soup with egg ribbons.', blend=False,
     spice='pepper 1.5; soysauce 5; cornflour 8; salt', mins=10)
soup('Chicken Shorba', 'chickencut 300; tomato 80; onion 50', 'An Indian spiced chicken soup with ginger, garlic and whole spices.', blend=False, pc=True,
     spice='jeera 1; pepper 1.5; cinnamon 1; clove 0.2; bayleaf 0.2; haldi 0.3; salt')
soup('Mutton Bone Soup (Yakhni Shorba)', 'mutton 300 bone-in pieces; onion 60; tomato 60', 'A slow-cooked mutton bone broth with whole spices.', blend=False, pc=True,
     spice='pepper 1.5; cinnamon 1; clove 0.2; haldi 0.3; salt', mins=40)
soup('Fish Soup', 'fish 250; tomato 80; ginger 8', 'A light, peppery fish soup with ginger and lemon.', blend=False, spice='pepper 1.5; haldi 0.3; salt', mins=10)
soup('Egg Drop Soup', 'egg 100 beaten; springonion 20; carrot 30', 'A quick, protein-rich soup with silky egg ribbons.', blend=False, spice='pepper 1; soysauce 5; cornflour 6; salt', mins=5)
soup('Oats Vegetable Soup', 'oats 30; carrot 50; beans 40; peas 40; tomato 60', 'A filling soup thickened with oats, rich in soluble fibre.', blend=False, mins=10)
soup('Moringa Leaf Soup', 'moringaleaf 40; moong 30; tomato 60', 'A nutrient-dense soup with drumstick leaves.', pc=True, spice='pepper 1; jeera 1; salt')
soup('Rasam-style Tomato Pepper Soup', 'tomato 400; tamarind 5', 'A clear, peppery tomato soup inspired by rasam.', blend=False, spice='pepper 2; jeera 1; haldi 0.3; salt', mins=10)
soup('Sweet Potato Soup', 'sweetpotato 300; carrot 60', 'A creamy, naturally sweet soup with sweet potato and cumin.', spice='jeerapowder 1; pepper 1; salt')
soup('Kulthi (Horse Gram) Soup', 'kulthi 60; tomato 80', 'A warming horse gram soup, traditionally used in winter.', pc=True, blend=False, spice='pepper 1.5; jeera 1; garlic 4; salt')
soup('Cauliflower Soup', 'cauliflower 350; potato 50; milk 100', 'A creamy cauliflower soup without cream.')
soup('Bottle Gourd Moong Soup', 'lauki 250; moong 40', 'A light soup of lauki and moong dal, easy to digest.', pc=True)

# ---------------- Chutneys ----------------
CCH = 'Chutneys & Dips'


def chutney(name, items, desc, temper='', cooked='', serves=6, sub='Chutney', store='keeps in the fridge for 2–3 days.'):
    g = [('Ingredients', items)]
    if temper:
        g.append(('For the Tempering', temper))
    steps = []
    if cooked:
        steps.append(f'Cook: {cooked}')
        steps.append('Cool: Let the mixture cool completely before grinding.')
    else:
        steps.append(f'Prepare: Wash and roughly chop the {produce(items)}.' if produce(items) else f'Prepare: Measure out the {names(items)}.')
    steps += [
        f'Grind: Put everything in a mixer jar and grind to a smooth (or slightly coarse) paste, adding water a spoon at a time.',
        'Taste: Check the salt, sourness and heat and adjust.',
    ]
    if temper:
        steps.append('Temper: Heat oil, crackle the mustard seeds, add the remaining tempering ingredients and pour over the chutney.')
    steps.append('Serve: Transfer to a bowl and serve fresh.')
    recipe(name, CCH, desc, serves, 10, 0 if not cooked else 10, g, steps,
           tips=['Grind with a little ice-cold water to keep green chutneys bright.', 'A squeeze of lemon helps green chutneys keep their colour.'],
           serve=['dosa, idli, chila, paratha, sandwiches or as a dip for snacks.', 'Use 1–2 tbsp per serving.'],
           store=store, sub=sub)


chutney('Mint Coriander Chutney', 'coriander 60; mint 30; gchilli 6; ginger 5; lemon 15; jeerapowder 1; salt; water 30',
        'The all-purpose green chutney, fresh, tangy and full of flavour.')
chutney('Coconut Chutney', 'coconut 100; roastchana 20; gchilli 6; ginger 5; salt; water 80', 'South Indian coconut chutney with roasted chana and a mustard tempering.',
        temper='oil 5; mustard 2; urad_t 3; redchilli 1; curryleaf 1')
chutney('Tomato Chutney', 'tomato 300; onion 60; garlic 8; redchilli 4; tamarind 3; salt; oil 8', 'A tangy, spicy tomato chutney for dosa and idli.',
        cooked='Heat oil, sauté onion, garlic and red chillies, then add tomatoes and tamarind and cook until soft.', temper='oil 3; mustard 2; curryleaf 1')
chutney('Peanut Chutney', 'peanut 100 roasted, skinned; gchilli 6; garlic 4; tamarind 5; salt; water 80', 'A creamy, nutty chutney rich in protein and healthy fats.',
        temper='oil 4; mustard 2; curryleaf 1; redchilli 1')
chutney('Onion Tomato Chutney', 'onion 150; tomato 150; redchilli 4; garlic 6; tamarind 3; salt; oil 8', 'A sweet-spicy red chutney for dosas.',
        cooked='Sauté onion and red chillies in oil until golden, add garlic and tomatoes and cook until soft.')
chutney('Coconut Coriander Chutney', 'coconut 80; coriander 30; gchilli 6; ginger 5; lemon 10; salt; water 60', 'A green coconut chutney with coriander.')
chutney('Garlic Chutney (Lahsun)', 'garlic 60; redchilli 8; jeera 2; lemon 15; salt', 'A fiery Rajasthani garlic chutney; a little goes a long way.')
chutney('Curry Leaf Chutney', 'curryleaf 15; urad_t 8; chana_t 8; redchilli 3; tamarind 5; coconut 30; salt; oil 5', 'An aromatic chutney of curry leaves, rich in antioxidants.',
        cooked='Roast the dals, chillies and curry leaves in oil until crisp.')
chutney('Flaxseed Chutney Powder', 'flax 70; sesame 20; garlic 8; redchilli 4; jeera 2; salt', 'A dry chutney powder of roasted flaxseeds, rich in omega-3.',
        cooked='Dry-roast the flaxseeds and sesame until they crackle, then the chillies and cumin.', store='keeps in an airtight jar for 3 weeks.')
chutney('Ginger Chutney (Allam Pachadi)', 'ginger 60; tamarind 15; jaggery 15; redchilli 4; urad_t 4; salt; oil 8', 'Andhra-style sweet, sour and spicy ginger chutney, served with pesarattu.',
        cooked='Sauté the ginger, chillies and urad dal in oil for 4 minutes.')
chutney('Sesame Chutney', 'sesame 60; redchilli 4; tamarind 5; garlic 4; salt; water 60', 'A nutty, calcium-rich sesame chutney.', cooked='Dry-roast the sesame seeds until golden.')
chutney('Hung Curd Mint Dip', 'hungcurd 200; mint 10; coriander 8; garlic 3; jeerapowder 1; salt', 'A thick, creamy mint dip, a healthy alternative to mayonnaise.', sub='Dip')
chutney('Beetroot Chutney', 'beet 150 roasted; coconut 30; redchilli 3; tamarind 5; garlic 4; salt', 'A pink, mildly sweet beetroot chutney.',
        cooked='Roast or steam the beetroot until tender.', temper='oil 3; mustard 2; curryleaf 1')
chutney('Carrot Chutney', 'carrot 200; roastchana 15; redchilli 3; tamarind 5; garlic 4; salt; oil 5', 'A colourful, slightly sweet carrot chutney.',
        cooked='Sauté the carrot with chillies and garlic in oil for 5 minutes.')
chutney('Raw Mango Chutney', 'rawmango 150 peeled; mint 15; coriander 15; gchilli 6; jeerapowder 1; jaggery 10; salt', 'A tangy summer chutney with raw mango and mint.')
chutney('Amla Chutney', 'amla 150 deseeded; coriander 20; gchilli 6; ginger 5; salt', 'A tangy amla chutney packed with vitamin C.')
chutney('Coriander Peanut Chutney', 'coriander 60; peanut 30 roasted; gchilli 6; lemon 10; salt; water 40', 'A thick green chutney with peanuts, perfect for sandwiches.')
chutney('Idli Podi (Gun Powder)', 'urad 50; chanadal 50; sesame 20; redchilli 12; hing; salt', 'A spicy lentil powder, eaten with idli and dosa mixed with a little oil.',
        cooked='Dry-roast the dals until golden, then the sesame and chillies, separately.', store='keeps in an airtight jar for 1 month.')
chutney('Tamarind Date Chutney (Lighter)', 'tamarind 40; dates 80; jeerapowder 1; dryginger 1; chilli 1; blacksalt; water 200', 'Sweet-sour chaat chutney sweetened only with dates, no sugar.',
        cooked='Simmer the tamarind and dates in water for 10 minutes until soft.', store='keeps in the fridge for 2 weeks.')
chutney('Roasted Tomato Garlic Dip', 'tomato 300 roasted; garlic 10 roasted; redchilli 2; oliveoil 5; salt', 'A smoky dip of fire-roasted tomatoes and garlic.', sub='Dip',
        cooked='Roast the tomatoes and garlic directly over the flame or in the oven until charred; peel.')
chutney('Hummus (Chickpea Dip)', 'chickpea 100 boiled; sesame 15 as tahini; garlic 4; lemon 20; oliveoil 10; jeerapowder 1; salt; water 40', 'A creamy chickpea and sesame dip, high in protein.',
        sub='Dip', cooked='Soak the chickpeas overnight and pressure-cook until very soft.')
chutney('Palak Hummus', 'chickpea 100 boiled; spinach 60 blanched; sesame 15; garlic 4; lemon 20; oliveoil 8; salt; water 30', 'Green hummus with spinach, rich in iron.', sub='Dip',
        cooked='Pressure-cook the soaked chickpeas until very soft.')
chutney('Curd Chutney (Dahi Chutney)', 'curd 200; mint 15; coriander 15; gchilli 3; jeerapowder 1; salt', 'A cooling curd and herb chutney for kebabs and tikkas.')
chutney('Pudina Imli Chutney', 'mint 40; tamarind 15; jaggery 10; jeerapowder 1; blacksalt; water 40', 'A tangy mint-tamarind chutney for chaat.')
chutney('Kara Chutney', 'onion 120; tomato 100; redchilli 6; garlic 6; tamarind 5; salt; oil 8', 'A spicy red Tamil chutney for idli and dosa.',
        cooked='Sauté onion, chillies and garlic until soft, add tomatoes and cook until mushy.')
chutney('Coconut Garlic Chutney (Dry)', 'coconut 100 dry; garlic 15; redchilli 8; salt', 'A dry Maharashtrian coconut-garlic chutney for vada pav and bhakri.',
        cooked='Dry-roast the coconut until golden; roast the chillies and garlic separately.', store='keeps in an airtight jar in the fridge for 2 weeks.')
