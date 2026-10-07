"""Dry sabzis, poriyals, thorans and stuffed vegetables."""
from core import recipe
from util import names

C = 'Dry Sabzi'
SP = 'haldi 0.75; dhania 2; chilli 1; salt'
STY = {
    'jeera': ('oil 10; jeera 2; hing; gchilli 3 chopped; ginger 5 grated', SP, 'amchur 1; garam 0.5; coriander 6',
              'Heat oil in a kadhai, crackle the cumin, then add hing, green chilli and ginger and sauté for 30 seconds.'),
    'onion': ('oil 10; jeera 1.5; onion 80 sliced; ginger 5; garlic 6; gchilli 3', SP, 'garam 0.5; coriander 6',
              'Heat oil, crackle the cumin, add the onion and sauté until light golden. Add ginger, garlic and green chilli and cook for 1 minute.'),
    'tomato': ('oil 10; jeera 1.5; onion 70 chopped; ginger 5; garlic 6; gchilli 3; tomato 100 chopped', SP, 'garam 0.5; coriander 6',
               'Heat oil, crackle the cumin and sauté the onion until golden. Add ginger, garlic and green chilli, then the tomato, and cook until soft and pulpy.'),
    'poriyal': ('coconutoil 8; mustard 3; urad_t 4; redchilli 2; curryleaf 1.5; hing', 'haldi 0.3; salt', 'coconut 25 grated',
                'Heat coconut oil, crackle the mustard seeds, then add urad dal and fry until golden. Add dry red chillies, curry leaves and hing.'),
    'thoran': ('coconutoil 8; mustard 3; redchilli 2; curryleaf 1.5; shallot 20 crushed', 'coconut 40 grated; jeera 1; garlic 4; gchilli 3; haldi 0.3; salt', '',
               'Heat coconut oil, crackle the mustard seeds, then add dry red chillies, curry leaves and crushed shallots and sauté for 1 minute. Coarsely crush the coconut with cumin, garlic, green chilli and turmeric (do not make a paste).'),
    'bengali': ('mustardoil 10; kalonji 1; gchilli 3 slit', 'haldi 0.75; jeerapowder 1; chilli 0.5; sugar 2; salt', 'coriander 4',
                'Heat mustard oil until it smokes lightly, lower the flame and add kalonji and slit green chillies.'),
    'achari': ('mustardoil 10; saunf 1.5; kalonji 0.5; methiseed 0.5; mustard 1; hing; gchilli 3', SP, 'amchur 1.5; coriander 6',
               'Heat mustard oil until it smokes lightly, lower the flame and add fennel, kalonji, methi and mustard seeds (the pickle spices), then hing and green chilli.'),
    'garlic': ('oil 10; jeera 1.5; garlic 15 chopped; redchilli 2', 'haldi 0.5; chilli 1; salt', 'coriander 6',
               'Heat oil, crackle the cumin, add plenty of chopped garlic and dry red chilli and fry until the garlic is light golden.'),
}


def sabzi(name, veg, desc, style='jeera', mins=10, prep='', finish=None, uncovered=False, serves=3, sub='Sabzi', tips=(), extra_sp=''):
    tk, sp, fin, txt = STY[style]
    if finish is not None:
        fin = finish
    if extra_sp:
        sp = sp + '; ' + extra_sp
    g = [('Ingredients', f'{veg}'), ('For the Tempering & Masala', f'{tk}; {sp}')]
    if fin:
        g.append(('To Finish', fin))
    steps = [
        f'Prepare the vegetables: {prep or f"Wash, peel if needed and cut the {names(veg)} into even, bite-sized pieces so they cook evenly."}',
        f'Temper: {txt}',
        'Add the spices: Lower the flame and add the ' + ('crushed coconut mixture' if style == 'thoran' else 'turmeric and powdered spices') + ' with 1 tbsp water so they do not burn. Stir for 30 seconds.',
        f'Add the vegetables: Add the {names(veg)} and salt and toss well to coat with the masala.',
        (f'Cook uncovered: Cook on medium flame for {mins} minutes, stirring gently now and then, until tender and lightly browned. Do not cover.' if uncovered else
         f'Cook covered: Cover and cook on low flame for {mins} minutes, stirring every few minutes. Sprinkle a little water only if it starts to stick.'),
        f'Finish: Uncover, raise the flame for 1 minute to dry any moisture' + (f', then add the {names(fin) if names(fin) else "spices"}' if fin else '') + ' and mix gently.',
        'Serve: Serve hot with phulka, paratha or dal-rice.',
    ]
    recipe(name, C, desc, serves, 10, mins + 8, g, steps,
           tips=list(tips) + ['Cut vegetables to the same size so they cook evenly.',
                              'Cook on low heat with the lid on; the vegetables steam in their own moisture and need very little oil.'],
           serve=['phulka, paratha or bhakri, with dal and curd.', '<b>Best time:</b> lunch or dinner; also great in tiffin boxes.'],
           store='keeps in the fridge for 1–2 days.', sub=sub)


sabzi('Aloo Jeera', 'potato 400 boiled, peeled and cubed', 'Simple, comforting potatoes tossed with cumin, green chilli and coriander.', mins=5, uncovered=True,
      prep='Boil the potatoes until just tender, cool, peel and cut into cubes.')
sabzi('Aloo Gobi', 'cauliflower 300 florets; potato 200 cubed', 'The classic North Indian dry curry of cauliflower and potatoes.', style='tomato', mins=15)
sabzi('Gobi Matar', 'cauliflower 350 florets; peas 120', 'Cauliflower and green peas cooked with ginger and spices.', mins=12)
sabzi('Bhindi Masala (Dry)', 'bhindi 400 cut in 1-inch pieces', 'Crisp-tender okra tossed with onion and spices.', style='onion', mins=15, uncovered=True)
sabzi('Kurkuri Bhindi (Air-fried)', 'bhindi 350 slit lengthwise; besan 20; ricefl 10', 'Crispy spiced okra made in an air fryer with just a teaspoon of oil.', mins=12, uncovered=True,
      prep='Slit the okra into thin strips, toss with besan, rice flour and spices, and air-fry at 180°C for 12–14 minutes, shaking halfway. Then temper and toss as below.')
sabzi('Achari Bhindi', 'bhindi 400 cut in 1-inch pieces', 'Okra cooked with tangy pickle spices.', style='achari', mins=15, uncovered=True)
sabzi('Lauki Sabzi', 'lauki 500 cubed', 'Light, soft bottle gourd cooked with tomato and mild spices.', style='tomato', mins=12)
sabzi('Tori Sabzi', 'tori 500 peeled, cubed', 'Ridge gourd cooked with onion and tomato, light and hydrating.', style='tomato', mins=10)
sabzi('Tinda Masala', 'tinda 400 peeled, quartered', 'Round gourd cooked in a light tomato masala.', style='tomato', mins=15)
sabzi('Parwal Sabzi', 'parwal 400 scraped and halved', 'Pointed gourd cooked with onion and spices.', style='onion', mins=15)
sabzi('Karela Sabzi', 'karela 350 thinly sliced; onion 100 sliced', 'Bitter gourd stir-fried with onion; the onion balances the bitterness.', style='jeera', mins=15, uncovered=True,
      prep='Scrape the karela, slice thinly, rub with salt and rest 15 minutes, then squeeze out the bitter juice.', extra_sp='jaggery 5')
sabzi('Kundru Fry', 'kundru 400 sliced lengthwise', 'Ivy gourd stir-fried until crisp-tender with spices.', mins=15, uncovered=True)
sabzi('Cabbage Matar', 'cabbage 400 shredded; peas 100', 'Shredded cabbage and peas with cumin and ginger, quick and light.', mins=10)
sabzi('Beans Aloo', 'beans 300 chopped; potato 150 cubed', 'French beans and potato cooked with cumin and spices.', mins=15)
sabzi('Gajar Matar', 'carrot 300 diced; peas 150', 'A winter favourite of sweet carrots and green peas.', mins=12)
sabzi('Mixed Vegetable Sabzi', 'carrot 100 diced; beans 100 chopped; cauliflower 100; peas 80; capsicum 80; potato 100 cubed', 'A colourful dry curry of six vegetables.', style='tomato', mins=15)
sabzi('Shimla Mirch Aloo', 'capsicum 300 diced; potato 200 cubed', 'Capsicum and potato with cumin and spices.', mins=12)
sabzi('Besan Shimla Mirch', 'capsicum 400 diced; besan 30 dry-roasted', 'Maharashtrian-style capsicum coated with roasted besan, protein-rich.', mins=8,
      prep='Dice the capsicum. Dry-roast the besan in a pan until aromatic and keep aside; sprinkle it over the capsicum in the last 3 minutes.')
sabzi('Baingan Aloo', 'brinjal 300 cubed; potato 200 cubed', 'Brinjal and potato cooked together in a light masala.', style='tomato', mins=15)
sabzi('Methi Aloo', 'methi 150 chopped; potato 300 cubed', 'Potatoes cooked with fresh fenugreek leaves, a winter classic.', mins=12)
sabzi('Palak Aloo (Dry)', 'spinach 300 chopped; potato 250 cubed', 'Potatoes cooked with spinach and garlic.', style='garlic', mins=12)
sabzi('Arbi Masala (Dry)', 'arbi 400 boiled, peeled and sliced', 'Colocasia roots pan-roasted with ajwain and spices.', style='jeera', mins=12, uncovered=True,
      extra_sp='ajwain 1', prep='Boil arbi until tender, peel, cool and slice into rounds.')
sabzi('Suran Fry', 'suran 400 boiled, cubed; tamarind 5', 'Elephant yam pan-roasted with spices until crisp.', style='jeera', mins=12, uncovered=True,
      prep='Peel the yam (with gloves), cube it and boil with a little tamarind and salt until just tender.')
sabzi('Kaddu ki Sabzi', 'pumpkin 500 cubed', 'Sweet-sour pumpkin cooked with fenugreek seeds and amchur.', style='jeera', mins=12, extra_sp='methiseed 1; jaggery 5')
sabzi('Mooli ki Sabzi', 'mooli 400 diced; spinach 100 radish greens or spinach, chopped', 'Radish cooked with its greens, light and digestive.', mins=12, extra_sp='ajwain 1')
sabzi('Shalgam Sabzi', 'turnip 450 diced', 'Turnips cooked with onion and tomato, a winter sabzi from Punjab and Kashmir.', style='tomato', mins=15)
sabzi('Gwar Phali Sabzi', 'gwar 350 chopped', 'Cluster beans cooked with ajwain and garlic, fibre-rich.', style='garlic', mins=15, extra_sp='ajwain 1')
sabzi('Sem ki Sabzi', 'sem 350 chopped; potato 100 cubed', 'Flat beans and potato cooked in a homestyle masala.', mins=15)
sabzi('Drumstick Masala', 'drumstick 300 cut in 3-inch pieces', 'Drumsticks cooked in a spicy tomato masala.', style='tomato', mins=15)
sabzi('Raw Banana Fry', 'rawbanana 300 sliced', 'Crisp, spiced raw banana slices, a South Indian favourite.', style='poriyal', mins=12, uncovered=True, finish='',
      extra_sp='chilli 1; sambar 2')
sabzi('Kathal ki Sabzi (Dry)', 'jackfruit 400 cubed, boiled', 'Raw jackfruit cooked in a spicy masala, a meaty vegetarian dish.', style='tomato', mins=15)
sabzi('Mushroom Matar (Dry)', 'mushroom 300 sliced; peas 120', 'Mushrooms and green peas in a quick masala.', style='onion', mins=8, uncovered=True)
sabzi('Baby Corn Capsicum', 'babycorn 250 sliced; capsicum 150 diced; onion 60 diced', 'Crunchy baby corn and capsicum stir-fry with Indian spices.', mins=8, uncovered=True)
sabzi('Broccoli Stir-fry Indian Style', 'broccoli 400 florets', 'Broccoli tossed with garlic, cumin and a little chilli.', style='garlic', mins=6, uncovered=True)
sabzi('Zucchini Sabzi', 'zucchini 400 diced', 'Quick zucchini cooked with cumin and tomato.', style='tomato', mins=7)
sabzi('Sweet Potato Chaat Sabzi', 'sweetpotato 400 boiled, cubed', 'Sweet potato tossed with cumin, chaat masala and lemon.', mins=5, uncovered=True, finish='chaat 2; lemon 10; coriander 6')
sabzi('Aloo Methi Matar', 'potato 200 cubed; methi 100 chopped; peas 100', 'Potato, fenugreek and peas, a colourful winter sabzi.', mins=12)
sabzi('Chaulai Saag', 'amaranth 400 chopped', 'Amaranth leaves cooked with garlic, rich in calcium and iron.', style='garlic', mins=8)
sabzi('Bathua Aloo', 'bathua 300 chopped; potato 200 cubed', 'Bathua greens with potato, a winter classic.', style='garlic', mins=10)
sabzi('Lotus Stem Sabzi (Kamal Kakdi)', 'lotusstem 350 sliced, boiled', 'Crunchy lotus stem cooked with onion and tomato.', style='tomato', mins=10)
sabzi('Cabbage Poriyal', 'cabbage 400 finely shredded', 'South Indian stir-fried cabbage with coconut and mustard seeds.', style='poriyal', mins=8)
sabzi('Beans Poriyal', 'beans 400 finely chopped', 'French beans stir-fried with coconut and urad dal.', style='poriyal', mins=10)
sabzi('Carrot Poriyal', 'carrot 400 finely chopped', 'Sweet carrots stir-fried with coconut, Tamil style.', style='poriyal', mins=8)
sabzi('Beetroot Poriyal', 'beet 400 finely chopped', 'Beetroot stir-fried with coconut and curry leaves.', style='poriyal', mins=12)
sabzi('Snake Gourd Poriyal', 'snakegourd 450 chopped', 'Snake gourd with moong dal and coconut, light and hydrating.', style='poriyal', mins=10, extra_sp='moong 20 soaked')
sabzi('Chow Chow Poriyal (Ash Gourd)', 'ashgourd 450 cubed', 'A light ash gourd stir-fry with coconut.', style='poriyal', mins=10)
sabzi('Okra Poriyal', 'bhindi 400 chopped', 'Bhindi stir-fried South Indian style with coconut.', style='poriyal', mins=15, uncovered=True)
sabzi('Cabbage Thoran', 'cabbage 400 finely shredded', 'Kerala-style cabbage stir-fry with crushed coconut and garlic.', style='thoran', mins=8)
sabzi('Beans Thoran', 'beans 400 finely chopped', 'Kerala-style beans with crushed coconut.', style='thoran', mins=10)
sabzi('Beetroot Thoran', 'beet 400 finely chopped', 'Bright Kerala-style beetroot thoran.', style='thoran', mins=12)
sabzi('Carrot Beans Thoran', 'carrot 200 finely chopped; beans 200 finely chopped', 'A colourful Kerala thoran with carrots and beans.', style='thoran', mins=10)
sabzi('Spinach Thoran', 'spinach 400 chopped', 'Kerala-style spinach with coconut, rich in iron.', style='thoran', mins=6)
sabzi('Raw Papaya Thoran', 'papaya 400 raw, grated', 'Grated raw papaya cooked with coconut, light and digestive.', style='thoran', mins=10)
sabzi('Aloo Posto', 'potato 400 cubed; poppy 30 soaked, ground', 'Bengali potatoes in a creamy poppy seed paste.', style='bengali', mins=12,
      prep='Cube the potatoes. Soak the poppy seeds in warm water for 30 minutes and grind to a smooth paste with a green chilli.')
sabzi('Bengali Aloo Potol', 'parwal 300 halved; potato 150 cubed', 'Pointed gourd and potato, Bengali style.', style='bengali', mins=15)
sabzi('Begun Bhaja (Pan-roasted)', 'brinjal 400 round slices', 'Bengali brinjal slices pan-roasted with turmeric and chilli.', style='bengali', mins=10, uncovered=True,
      prep='Slice the brinjal into ½-inch rounds and rub with turmeric, chilli powder and salt. Pan-roast in a little oil for 4–5 minutes per side.')
sabzi('Labra (Bengali Mixed Vegetables)', 'pumpkin 150; potato 100; brinjal 100; rawbanana 75; spinach 100; mooli 80', 'A Bengali mixed vegetable dish with panch phoron, served during Durga Puja.', style='bengali', mins=15,
      extra_sp='panchphoron 2')
sabzi('Cauliflower Bengali Style (Phulkopir Dalna Dry)', 'cauliflower 400 florets; potato 100; peas 60', 'Bengali cauliflower with ginger and garam masala.', style='bengali', mins=15, finish='garam 1; ghee 5; coriander 4')
sabzi('Aloo Bhujia Sabzi', 'potato 450 thin strips', 'Thin potato strips cooked with cumin until lightly crisp.', mins=12, uncovered=True)
sabzi('Turai Chana Dal', 'tori 400 cubed; chanadal 50 soaked 1 hour', 'Ridge gourd cooked with chana dal for added protein.', style='tomato', mins=15)
sabzi('Lauki Chana Dal Sabzi', 'lauki 400 cubed; chanadal 60 soaked 1 hour', 'Bottle gourd and chana dal, a light protein-rich sabzi.', style='tomato', mins=15)
sabzi('Kachche Kele ki Sabzi', 'rawbanana 300 cubed', 'Raw banana cubes in a North Indian masala.', style='tomato', mins=12)
sabzi('Aloo Shimla Mirch Tamatar', 'potato 200 cubed; capsicum 200 diced; tomato 100 chopped', 'Potato, capsicum and tomato, an everyday Punjabi sabzi.', style='onion', mins=12)
sabzi('Mixed Greens Saag (Dry)', 'spinach 200; methi 100; bathua 100; sarson 100', 'A quick dry saag of mixed winter greens with garlic.', style='garlic', mins=10)
sabzi('Corn Palak (Dry)', 'corn 200; spinach 250 chopped', 'Sweet corn and spinach with garlic, colourful and nutritious.', style='garlic', mins=8)
sabzi('Soya Chunks Dry', 'soya 80 boiled, squeezed; onion 80 sliced; capsicum 80 diced', 'Spicy dry soya chunks, a high-protein side dish.', style='tomato', mins=8, uncovered=True)
sabzi('Tofu Bhurji', 'tofu 300 crumbled; onion 80 chopped; tomato 80 chopped; capsicum 50 chopped', 'A vegan scramble of tofu with onion, tomato and spices.', mins=5, uncovered=True,
      extra_sp='pavbhaji 1')
sabzi('Paneer Bhurji', 'paneer 250 crumbled; onion 80 chopped; tomato 80 chopped; capsicum 50 chopped', 'Soft scrambled paneer with onion, tomato and spices, ready in 15 minutes.', mins=4, uncovered=True,
      extra_sp='pavbhaji 1')
sabzi('Mushroom Pepper Fry', 'mushroom 400 halved; onion 80 sliced', 'Mushrooms tossed with crushed black pepper and curry leaves.', style='poriyal', mins=8, uncovered=True,
      extra_sp='peppercorn 3 crushed', finish='curryleaf 1.5; coriander 6')
sabzi('Yam Pepper Fry', 'suran 400 boiled, cubed', 'Elephant yam pan-fried with pepper and curry leaves.', style='poriyal', mins=10, uncovered=True, extra_sp='peppercorn 3 crushed', finish='curryleaf 1.5')
sabzi('Ivy Gourd Poriyal', 'kundru 400 thinly sliced', 'Kovakkai poriyal with coconut, a Tamil favourite.', style='poriyal', mins=15, uncovered=True)
sabzi('Cauliflower Peas Poriyal', 'cauliflower 300; peas 100', 'Cauliflower and peas stir-fried with coconut.', style='poriyal', mins=10)
sabzi('Methi Mushroom (Dry)', 'mushroom 300 sliced; methi 80 chopped', 'Mushrooms with fresh fenugreek, earthy and aromatic.', style='onion', mins=8, uncovered=True)
sabzi('Cabbage Carrot Stir-fry', 'cabbage 300 shredded; carrot 100 julienned; capsicum 80 sliced', 'A quick, crunchy Indian-style stir-fry.', mins=6, uncovered=True)


def stuffed_veg(name, veg, desc, prep_txt, stuffing='besan 30 dry-roasted; dhania 4; jeerapowder 2; chilli 2; haldi 1; amchur 3; saunf 2 crushed; salt; oil 5', mins=15, serves=3):
    g = [('Vegetables', veg), ('For the Stuffing Masala', stuffing), ('For Cooking', 'oil 10; jeera 1; hing')]
    steps = [
        f'Prepare the vegetables: {prep_txt}',
        f'Make the stuffing: Mix the {names(stuffing)} with all the powdered spices and salt. Sprinkle a few drops of water if needed so it just holds together.',
        'Stuff: Fill each slit vegetable with the masala, pressing it in firmly. Keep any leftover masala.',
        'Temper: Heat oil in a wide pan, crackle the cumin and add hing.',
        'Arrange: Place the stuffed vegetables in a single layer and sprinkle over the leftover masala.',
        f'Cook covered: Cover and cook on low flame for {mins} minutes, turning gently every 4–5 minutes, until tender and evenly browned.',
        'Serve: Serve hot with phulka or as a side with dal-rice.',
    ]
    recipe(name, C, desc, serves, 20, mins + 5, g, steps,
           tips=['Cook on low heat so the vegetable cooks through before the masala burns.', 'Turn gently with tongs so the stuffing stays in.'],
           serve=['phulka, paratha or dal-rice.', '<b>Best time:</b> lunch or dinner.'], store='keeps in the fridge for 1 day.', sub='Stuffed Vegetable')


stuffed_veg('Bharwa Bhindi', 'bhindi 350', 'Okra stuffed with a tangy besan-spice masala and cooked until tender.', 'Wash and wipe the okra completely dry, trim the ends and make a slit along each one.', mins=15)
stuffed_veg('Bharwa Karela', 'karela 350', 'Bitter gourd stuffed with spiced besan and onion, tamed of its bitterness.', 'Scrape the karela, slit lengthwise, remove seeds, rub with salt and rest 30 minutes; rinse and squeeze.',
            stuffing='besan 30 dry-roasted; onion 80 finely chopped; dhania 4; saunf 2; chilli 2; haldi 1; amchur 3; jaggery 5; salt; oil 5', mins=20)
stuffed_veg('Bharwa Baingan', 'brinjal 400 small', 'Small brinjals stuffed with a peanut-sesame-coconut masala.', 'Make a cross slit in each small brinjal, keeping the stem intact. Soak in salted water.',
            stuffing='peanut 30 roasted, ground; sesame 10; coconut 20; dhania 4; chilli 2; haldi 1; jaggery 5; tamarind 5; salt', mins=18)
stuffed_veg('Bharwa Tinda', 'tinda 400', 'Round gourds stuffed with a spicy masala and slow-cooked.', 'Peel the tinda, make a cross cut halfway down each and scoop out a little flesh.', mins=20)
stuffed_veg('Bharwa Parwal', 'parwal 400', 'Pointed gourds stuffed with spiced besan.', 'Scrape the parwal, slit lengthwise and scoop out the large seeds.', mins=18)
stuffed_veg('Bharwa Shimla Mirch', 'capsicum 400 small', 'Capsicums stuffed with spiced potato and paneer.', 'Cut the tops off the capsicums and remove the seeds.',
            stuffing='potato 200 boiled, mashed; paneer 60 crumbled; jeerapowder 2; chilli 1; amchur 2; garam 1; coriander 6; salt', mins=15)
stuffed_veg('Bharwa Tamatar', 'tomato 400 large firm', 'Firm tomatoes stuffed with spiced paneer and peas, then baked or pan-cooked.', 'Slice off the tops and scoop out the pulp (use it in a curry).',
            stuffing='paneer 120 crumbled; peas 60 boiled; jeerapowder 1; garam 1; chilli 1; coriander 6; salt', mins=10)
stuffed_veg('Bharwa Mirch (Stuffed Green Chillies)', 'gchilli 120 large, mild', 'Large mild chillies stuffed with a tangy besan masala, a Rajasthani side dish.', 'Slit the large chillies lengthwise and remove the seeds.', mins=10)
