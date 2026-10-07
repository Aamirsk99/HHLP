"""Rice dishes: pulao, flavoured rice, khichdi, biryani, fried rice."""
from core import recipe
from util import names, allnames

C = 'Rice, Khichdi & Biryani'
RICE_SERVE = ['raita, a green salad and papad (roasted).', '<b>Best time:</b> lunch or dinner.']


def pulao(name, grain, add, desc, whole='bayleaf 0.2; cinnamon 1; clove 0.2; cardamom 0.4; jeera 2', fat='ghee 8; oil 5', water=None, onion=True,
          add_txt='', finish='coriander 6; mint 3', serves=3, sub='Pulao', soak=20, cook_txt=''):
    g_ = sum(float(x.split()[1]) for x in grain.split(';'))
    water = water or int(g_ * 2)
    g = [('Ingredients', f'{grain}; water {water}; salt' + (f'; {add}' if add else '')),
         ('For the Tempering', f'{fat}; {whole}' + ('; onion 80 sliced; ginger 5; garlic 6; gchilli 3' if onion else '')), ('To Finish', finish)]
    steps = [
        f'Rinse & soak: Wash the {names(grain)} 3–4 times until the water runs clear and soak for {soak} minutes. Drain.' if soak else
        f'Rinse: Rinse the {names(grain)} well and drain.',
        'Temper: Heat ghee and oil in a heavy pot or cooker. Add the whole spices and fry for 30 seconds until fragrant.' +
        (' Add the onion and sauté until light golden, then ginger, garlic and green chilli.' if onion else ''),
        f'Add the vegetables: {add_txt or f"Add the {names(add)} and sauté for 2–3 minutes."}' if add else 'Toast: Stir for 1 minute.',
        f'Add the {names(grain)}: Add the drained grain and stir gently for 1–2 minutes to coat it with ghee.',
        f'Add water: Add {water} ml hot water and salt; taste the water, it should be slightly salty.',
        ('Cook', cook_txt) if cook_txt else
        'Cook: Cover and cook on the lowest flame for 12–15 minutes (or 1 whistle in a pressure cooker) until the water is absorbed and the grains are tender.',
        'Rest & fluff: Rest covered for 5–10 minutes, then fluff gently with a fork. Garnish and serve.',
    ]
    recipe(name, C, desc, serves, 10 + soak, 25, g, steps,
           tips=['Rest the rice for 5 minutes after cooking; the grains firm up and stay separate.',
                 'Use a heavy-bottomed pot and the lowest flame so the bottom does not burn.'],
           serve=RICE_SERVE, store='keeps in the fridge for 1 day. Reheat with a sprinkle of water.', sub=sub)


pulao('Jeera Rice', 'basmati 200', '', 'Fragrant basmati rice tempered with cumin and ghee, the perfect partner for dal.', whole='jeera 3; bayleaf 0.2', onion=False, finish='coriander 6')
pulao('Vegetable Pulao', 'basmati 200', 'carrot 60 diced; beans 50 chopped; peas 60; potato 60 cubed; cauliflower 50', 'Mildly spiced basmati rice cooked with mixed vegetables and whole spices.')
pulao('Matar Pulao', 'basmati 200', 'peas 150', 'Basmati rice with sweet green peas, simple and aromatic.')
pulao('Brown Rice Vegetable Pulao', 'brice 200', 'carrot 60; beans 50; peas 60; capsicum 50', 'A fibre-rich pulao made with brown rice and vegetables.', soak=60, water=520,
      cook_txt='Pressure-cook for 3 whistles on medium flame, or simmer covered for 35–40 minutes until tender.')
pulao('Quinoa Pulao', 'quinoa 180', 'carrot 60; beans 50; peas 60; capsicum 50', 'A protein-rich pulao made with quinoa and vegetables.', soak=0, water=360,
      cook_txt='Cover and cook on low flame for 15 minutes until the quinoa is fluffy and the little white tails appear.')
pulao('Millet Pulao', 'foxtail 200', 'carrot 60; beans 50; peas 60', 'A low-GI pulao made with foxtail millet.', soak=30, water=440)
pulao('Kodo Millet Pulao', 'kodo 200', 'carrot 60; beans 50; peas 60', 'A fibre-rich pulao made with kodo millet.', soak=30, water=440)
pulao('Paneer Pulao', 'basmati 200', 'paneer 120 cubed; peas 80', 'Basmati rice with soft paneer cubes and peas.', add_txt='Add the peas and sauté 2 minutes; fold in lightly roasted paneer cubes after the rice is cooked.')
pulao('Soya Pulao', 'basmati 180', 'soya 50 boiled, squeezed; peas 60; carrot 50', 'High-protein pulao with soya chunks and vegetables.')
pulao('Mushroom Pulao', 'basmati 200', 'mushroom 200 sliced', 'Basmati rice with sautéed mushrooms and whole spices.')
pulao('Corn Pulao', 'basmati 200', 'corn 150; capsicum 60', 'A mildly sweet pulao with sweet corn and capsicum.')
pulao('Chana Pulao', 'basmati 180', 'chickpea 80 soaked and boiled', 'Basmati rice cooked with chickpeas, a complete one-pot meal.')
pulao('Rajma Pulao', 'basmati 180', 'rajma 80 soaked and boiled; tomato 80 chopped', 'Rice and rajma cooked together with spices, a one-pot rajma chawal.')
pulao('Palak Pulao', 'basmati 200', 'spinach 200 blanched, puréed; peas 60', 'Green pulao with spinach purée and peas, rich in iron.', add_txt='Add the peas and spinach purée and cook for 2 minutes.', water=320)
pulao('Beetroot Pulao', 'basmati 200', 'beet 120 grated; peas 50', 'A pink pulao with grated beetroot.')
pulao('Kashmiri Pulao (Lighter)', 'basmati 200', 'apple 60 diced; pomegranate 30; almond 10; cashew 8; raisin 9; saffron; milk 60', 'A mildly sweet Kashmiri pulao with fruit and nuts and very little ghee.',
      add_txt='Soak the saffron in warm milk. Lightly roast the nuts and raisins in the ghee and set aside; add the milk with the water and fold in the fruit and nuts at the end.', onion=False)
pulao('Mint Pulao (Pudina Pulao)', 'basmati 200', 'mint 30 ground with ginger and chilli; peas 60', 'Aromatic basmati rice cooked with fresh mint paste.')
pulao('Methi Pulao', 'basmati 200', 'methi 80 chopped; peas 60', 'Basmati rice with fresh fenugreek leaves and peas.')
pulao('Coriander Rice', 'basmati 200', 'coriander 40 ground with chilli and garlic; peas 50', 'Bright green rice cooked with fresh coriander paste.')
pulao('Tomato Pulao', 'basmati 200', 'tomato 200 puréed; peas 50', 'A tangy tomato pulao, a lunch-box favourite.', water=300)
pulao('Tahari', 'basmati 200', 'potato 150 cubed; peas 80; cauliflower 80; haldi 1; chilli 1; garam 1', 'A yellow, spiced vegetable rice from Uttar Pradesh.')
pulao('Chicken Yakhni Pulao', 'basmati 200', 'chickencut 300; curd 60; saunf 2; dhaniaseed 3', 'A fragrant pulao where rice is cooked in a light chicken stock (yakhni).',
      add_txt='Simmer the chicken with fennel and coriander seeds (tied in a cloth) in 3 cups water for 25 minutes to make the yakhni. Strain and use the stock in place of water; add the chicken with the curd.')
pulao('Egg Pulao', 'basmati 200', 'egg 200 hard-boiled, halved; peas 60', 'Spiced pulao topped with roasted boiled eggs.', add_txt='Add the peas and sauté. Roast the boiled egg halves in a little masala separately and arrange on top.')
pulao('Prawn Pulao', 'basmati 200', 'prawn 200 cleaned; haldi 0.5; chilli 1', 'Coastal-style pulao with prawns.', add_txt='Add the prawns with turmeric and chilli and sauté for 2 minutes.')
pulao('Mutton Yakhni Pulao', 'basmati 200', 'mutton 300; curd 60; saunf 2; dhaniaseed 3', 'Kashmiri-Awadhi pulao of rice cooked in a fragrant mutton stock.',
      add_txt='Pressure-cook the mutton with fennel and coriander seeds in 3 cups water for 5 whistles to make the yakhni. Strain and use the stock; add the mutton with the curd.')


def flavoured(name, add, desc, steps_mid, rice='rice 200', temper='oil 10; mustard 3; urad_t 4; chana_t 4; redchilli 2; curryleaf 1.5; hing; peanut 15', finish='coriander 6', serves=3, sub='Flavoured Rice', extra_tips=()):
    g = [('For the Rice', f'{rice}; water 450; salt'), ('For the Seasoning', f'{temper}; {add}'), ('To Finish', finish)]
    steps = [
        f'Cook the rice: Wash and cook the {names(rice)} with water and salt until each grain is soft but separate. Spread on a plate to cool completely.',
        f'Temper: Heat the oil and crackle the mustard seeds, then add the {allnames(temper)} and fry until the dals and nuts turn golden.',
    ] + steps_mid + [
        'Mix: Add the cooled rice and gently fold everything together without mashing the grains.',
        'Rest & serve: Rest for 10 minutes so the flavours soak in. Garnish and serve warm or at room temperature.',
    ]
    recipe(name, C, desc, serves, 10, 25, g, steps,
           tips=list(extra_tips) + ['Use cooled, day-old or fully cooled rice so the grains stay separate.'],
           serve=['curd or raita, a poriyal and roasted papad.', '<b>Best time:</b> lunch and lunch boxes; ideal for travel.'],
           store='keeps for 6–8 hours at room temperature (great for travel) or 1 day in the fridge.', sub=sub)


flavoured('Lemon Rice', 'haldi 1; gchilli 3; ginger 5; lemon 30', 'Tangy, turmeric-yellow South Indian rice with peanuts and curry leaves.',
          ['Season: Add ginger, green chilli and turmeric and stir for 30 seconds. Switch off and add the lemon juice.'])
flavoured('Tamarind Rice (Puliyogare)', 'tamarind 40; jaggery 8; puliyogare 15; sesame 5', 'Karnataka and Tamil temple-style tangy tamarind rice.',
          ['Make the paste: Add tamarind extract, jaggery, puliyogare powder and salt and simmer until it thickens to a paste and oil separates (8–10 minutes).'],
          extra_tips=['Puliyogare paste keeps for 2 weeks in the fridge.'])
flavoured('Tomato Rice', 'onion 80 sliced; tomato 250 chopped; haldi 0.5; chilli 1.5; garam 1; ginger 5; garlic 6', 'Tangy, spicy South Indian tomato rice, a lunch-box favourite.',
          ['Cook the masala: Sauté onion until golden, add ginger-garlic, tomatoes and spices and cook until mushy and thick.'])
flavoured('Coconut Rice', 'coconut 80 grated; cashew 10; gchilli 3; ginger 5', 'Mild, fragrant rice with fresh coconut, cashews and curry leaves.',
          ['Toast the coconut: Add cashews, ginger and green chilli, then the coconut, and sauté on low flame for 2 minutes until fragrant (not brown).'])
flavoured('Curd Rice', 'curd 300; milk 60; ginger 5; gchilli 3; pomegranate 30; carrot 30 grated; cucumber 50 grated', 'Cooling South Indian curd rice, soothing for the stomach.',
          ['Mash: Mash the cooled rice lightly and mix with curd, milk and salt.', 'Add the extras: Stir in the grated carrot and cucumber and pour the tempering over the rice.'],
          temper='oil 8; mustard 3; urad_t 4; redchilli 1; curryleaf 1.5; hing', finish='coriander 6')
flavoured('Vangi Bath', 'brinjal 250 cubed; onion 60 sliced; vangibath 15; tamarind 10; jaggery 5', 'Karnataka spiced brinjal rice.',
          ['Cook the brinjal: Sauté onion, add brinjal and cook covered until tender. Add vangi bath powder, tamarind and jaggery and cook 3 minutes.'])
flavoured('Mango Rice (Mavinakayi Chitranna)', 'rawmango 120 grated; haldi 0.5; gchilli 3; ginger 5', 'Tangy raw mango rice, a summer special from Karnataka.',
          ['Cook the mango: Add the grated raw mango, turmeric, ginger and chilli and sauté for 3–4 minutes.'])
flavoured('Sesame Rice (Ellu Sadam)', 'sesame 30 roasted, powdered with redchilli and urad; haldi 0.3', 'Nutty Tamil sesame rice, rich in calcium.',
          ['Add the sesame: Switch off the flame and stir in the roasted sesame powder.'])
flavoured('Peanut Rice', 'peanut 50 roasted, powdered; dhaniaseed 3; redchilli 2', 'Rice tossed with a spicy roasted peanut powder.',
          ['Add the peanut masala: Stir in the peanut powder and coriander seed powder off the flame.'])
flavoured('Pepper Jeera Rice', 'peppercorn 3 crushed; jeera 2; ghee 5', 'Comforting rice with ghee, pepper and cumin, gentle on the stomach.',
          ['Season: Add crushed pepper and cumin and fry for 30 seconds.'])
flavoured('Capsicum Rice', 'capsicum 200 diced; onion 60; vangibath 10', 'Spiced capsicum rice, a quick lunch-box dish.',
          ['Cook the capsicum: Sauté onion and capsicum until just soft and add the spice powder.'])
flavoured('Brown Rice Lemon Rice', 'haldi 1; gchilli 3; ginger 5; lemon 30', 'Lemon rice made with brown rice for more fibre.',
          ['Season: Add ginger, chilli and turmeric, switch off and add lemon juice.'], rice='brice 200')
flavoured('Millet Lemon Rice', 'haldi 1; gchilli 3; ginger 5; lemon 30', 'Tangy lemon-flavoured foxtail millet, a low-GI rice alternative.',
          ['Season: Add ginger, chilli and turmeric, switch off and add lemon juice.'], rice='foxtail 200')
flavoured('Millet Curd Rice', 'curd 300; milk 60; ginger 5; gchilli 3; cucumber 50 grated', 'Cooling curd rice made with little millet.',
          ['Mash: Mash the cooled millet lightly and mix with curd, milk and salt.'], rice='kutki 200', temper='oil 8; mustard 3; urad_t 4; curryleaf 1.5; hing')
flavoured('Bisi Bele Bath', 'toor 80 cooked; carrot 60; beans 50; peas 50; shallot 50; tamarind 15; bisibele 20; jaggery 5; ghee 10', 'Karnataka’s hot, spicy rice-lentil-vegetable one-pot meal.',
          ['Cook the vegetables: Cook the vegetables with tamarind water, bisi bele bath powder and jaggery until tender.', 'Add dal: Add the cooked dal and simmer for 5 minutes.'])


def khichdi(name, grains, desc, veg='', water=None, fat='ghee 10', temper='jeera 2; hing; ginger 5; gchilli 3', serves=3, sub='Khichdi', tags=(), whistles='3–4'):
    total = sum(float(x.split()[1]) for x in grains.split(';'))
    water = water or int(total * 4)
    g = [('Ingredients', f'{grains}; water {water}; haldi 1; salt' + (f'; {veg}' if veg else '')), ('For the Tadka', f'{fat}; {temper}')]
    steps = [
        f'Wash & soak: Wash the {names(grains)} together until the water runs clear and soak for 20 minutes.',
        'Temper: Heat ghee in a pressure cooker, crackle the cumin, add hing, ginger and green chilli.',
        f'Add vegetables: Add the {names(veg)} and sauté for 2 minutes.' if veg else 'Toast: Add the drained grains and stir for 1 minute.',
        f'Add grains & water: Add the drained grains, turmeric, salt and {water} ml water. Stir well.',
        f'Pressure-cook: Cook for {whistles} whistles on medium flame. Let the pressure release naturally.',
        'Adjust: Open, mash lightly and add hot water if you like a softer, porridge-like consistency.',
        'Serve: Serve hot with a spoon of ghee, curd and roasted papad.',
    ]
    recipe(name, C, desc, serves, 25, 25, g, steps,
           tips=['A softer, mushier khichdi is easier to digest when you are unwell.', 'Add a little extra ghee on top just before serving for aroma.'],
           serve=['curd, kadhi or raita, roasted papad and a pickle (in moderation).', '<b>Best time:</b> dinner; ideal when unwell.'],
           store='best eaten fresh; keeps in the fridge for 1 day.', sub=sub, tags=('soft',) + tuple(tags))


khichdi('Moong Dal Khichdi', 'rice 100; moong 100', 'The ultimate Indian comfort food: rice and moong dal cooked soft with ghee and cumin, easy to digest.')
khichdi('Vegetable Khichdi', 'rice 100; moong 80', 'Rice and moong dal khichdi with mixed vegetables for a complete meal.', veg='carrot 60; peas 60; beans 50; potato 60; tomato 60')
khichdi('Masoor Dal Khichdi', 'rice 100; masoor 100', 'Quick khichdi with red lentils and vegetables.', veg='onion 60; tomato 60; carrot 50')
khichdi('Dalia Khichdi', 'dalia 100; moong 80', 'Broken wheat and moong dal khichdi, high in fibre.', veg='carrot 60; peas 60; beans 50')
khichdi('Millet Khichdi', 'foxtail 100; moong 80', 'A low-GI khichdi made with foxtail millet and moong dal.', veg='carrot 60; peas 60; beans 50')
khichdi('Oats Khichdi', 'oats 100; moong 80', 'A quick, fibre-rich khichdi made with oats and moong dal.', veg='carrot 60; peas 60; tomato 60', whistles='2')
khichdi('Quinoa Khichdi', 'quinoa 100; moong 80', 'Protein-rich khichdi made with quinoa and moong dal.', veg='carrot 60; peas 60; beans 50')
khichdi('Bajra Khichdi', 'bajra 100 whole, soaked overnight; moong 80', 'Rajasthani winter khichdi of whole pearl millet and moong dal.', whistles='6–7')
khichdi('Sama Vrat Khichdi', 'sama 120; peanut 20', 'A light fasting khichdi made with barnyard millet and peanuts.', veg='potato 80', temper='jeera 2; ginger 5; gchilli 3', tags=('fast',))
khichdi('Palak Khichdi', 'rice 100; moong 100', 'Moong dal khichdi with spinach, rich in iron and folate.', veg='spinach 150 chopped; tomato 60')
khichdi('Toor Dal Khichdi', 'rice 100; toor 100', 'Homestyle toor dal khichdi with vegetables.', veg='onion 60; tomato 60; carrot 50')
khichdi('Bengali Bhoger Khichuri', 'rice 100; moong 100 dry-roasted', 'Bengali festive khichdi with roasted moong dal and vegetables.',
        veg='cauliflower 100; potato 80; peas 60; tomato 60', temper='jeera 1; bayleaf 0.2; cinnamon 1; cardamom 0.4; ginger 8; gchilli 3', water=900)
khichdi('Ven Pongal', 'rice 100; moong 50 dry-roasted', 'Tamil Nadu’s peppery rice and moong dal pongal with ghee, cashews and curry leaves.',
        temper='jeera 2; peppercorn 3 crushed; ginger 8; curryleaf 1.5; cashew 10; hing', water=700)
khichdi('Millet Pongal', 'foxtail 100; moong 50 dry-roasted', 'Peppery pongal made with foxtail millet.', temper='jeera 2; peppercorn 3 crushed; ginger 8; curryleaf 1.5; cashew 10; hing')
khichdi('Gujarati Vaghareli Khichdi', 'rice 100; toor 80', 'Gujarati tempered khichdi with vegetables and whole spices.',
        veg='potato 60; onion 60; peas 50; tomato 60', temper='mustard 2; jeera 1; clove 0.2; cinnamon 1; curryleaf 1; hing')
khichdi('Sprouts Khichdi', 'rice 100; sprouts 120', 'Khichdi with moong sprouts for extra protein and vitamin C.', veg='tomato 60; carrot 50', whistles='2')


def biryani(name, main, marinade, desc, rice='basmati 300', serves=4, marinate_txt='', cook_main_txt='', mins=20, sub='Biryani'):
    g = [('For the Rice', f'{rice}; water 2000; salt; bayleaf 0.2; cardamom 0.4; clove 0.2; cinnamon 1'),
         ('Main & Marinade', f'{main}; {marinade}'),
         ('For Layering', 'onion 200 thinly sliced; ghee 15; oil 10; mint 15; coriander 15; saffron; milk 30; garam 2')]
    steps = [
        f'Soak the rice: Wash the {names(rice)} gently 3–4 times and soak for 30 minutes.',
        f'Marinate: {marinate_txt or f"Mix the {names(main)} with the marinade ingredients and rest for at least 30 minutes."}',
        'Caramelise the onions: Heat oil and half the ghee in a heavy pot and fry the sliced onions on medium flame, stirring, until deep golden (12–15 minutes). Remove half for layering.',
        f'Cook the base: {cook_main_txt or f"Add the marinated {names(main)} to the remaining onions and cook on medium flame until almost done and the masala is thick."}',
        'Par-boil the rice: Boil the water with salt and whole spices. Add the drained rice and cook for 5–6 minutes until 70% done (the grain should still have a bite). Drain.',
        'Layer: Spread the rice over the base. Top with fried onions, mint, coriander, garam masala, saffron soaked in warm milk and the remaining ghee.',
        f'Dum: Cover tightly (seal with foil or dough) and cook on the lowest flame for {mins} minutes, or place the pot on a hot tawa.',
        'Rest & serve: Rest for 10 minutes, then gently mix from the side and serve with raita.',
    ]
    recipe(name, C, desc, serves, 45, 50, g, steps,
           tips=['Par-boil the rice only 70%; it finishes cooking on dum.', 'Use a heavy pot or place it on a tawa so the bottom layer does not burn.'],
           serve=['onion-cucumber raita and a fresh salad.', '<b>Best time:</b> lunch or festive meals.'],
           store='keeps in the fridge for 1–2 days; sprinkle water and reheat covered.', sub=sub, level='Medium')


MAR = 'curd 120; ginger 10; garlic 12; chilli 3; haldi 1; garam 2; lemon 10; salt'
biryani('Vegetable Biryani', 'carrot 100; beans 80; peas 80; cauliflower 100; potato 100; paneer 80', MAR, 'Fragrant layered basmati rice with spiced vegetables, made on dum with less oil.')
biryani('Paneer Biryani', 'paneer 250 cubed; capsicum 80', MAR, 'Layered biryani with spiced paneer, rich in protein.', mins=15)
biryani('Mushroom Biryani', 'mushroom 350 halved', MAR, 'Layered biryani with spiced mushrooms.', mins=15)
biryani('Soya Biryani', 'soya 100 boiled, squeezed; peas 80', MAR, 'High-protein biryani with soya chunks.', mins=15)
biryani('Chicken Biryani', 'chickencut 600', MAR + '; chickenmasala 3', 'Classic dum-cooked chicken biryani with saffron, mint and caramelised onions.',
       marinate_txt='Marinate the chicken in curd, ginger-garlic, spices and lemon for at least 1 hour (overnight is best).', mins=25)
biryani('Hyderabadi Chicken Dum Biryani', 'chickencut 600', MAR + '; gchilli 6; mint 10; chickenmasala 3', 'Kachchi-style Hyderabadi biryani with chicken and rice cooked together on dum.',
       marinate_txt='Marinate the raw chicken overnight. Place it at the bottom of the pot raw (kachchi style); it cooks with the rice on dum.',
       cook_main_txt='Spread the marinated raw chicken in the pot; it will cook on dum with the rice.', mins=40)
biryani('Mutton Biryani', 'mutton 600', MAR + '; chickenmasala 3', 'Rich, aromatic mutton biryani slow-cooked on dum.',
       marinate_txt='Marinate the mutton for 2 hours or overnight.',
       cook_main_txt='Pressure-cook the marinated mutton with the onions for 5–6 whistles until tender, then reduce until thick.', mins=25)
biryani('Egg Biryani', 'egg 300 hard-boiled', MAR, 'Biryani with spiced boiled eggs, quick and protein-rich.',
       marinate_txt='Prick the boiled eggs and coat with the marinade.', cook_main_txt='Cook the marinade with the onions until thick, add the eggs and toss.', mins=15)
biryani('Fish Biryani', 'fish 500 thick pieces', MAR + '; fishmasala 3', 'Coastal-style fish biryani with gently spiced fish pieces.',
       cook_main_txt='Pan-sear the marinated fish for 2 minutes per side, then add to the onion masala gently.', mins=15)
biryani('Prawn Biryani', 'prawn 450', MAR, 'Fragrant biryani with spiced prawns.', cook_main_txt='Cook the prawns in the onion masala for 3 minutes only.', mins=15)
biryani('Millet Vegetable Biryani', 'carrot 100; beans 80; peas 80; cauliflower 100', MAR, 'A low-GI biryani made with foxtail millet instead of rice.', rice='foxtail 250')
biryani('Brown Rice Chicken Biryani', 'chickencut 500', MAR, 'Chicken biryani made with brown rice for extra fibre.', rice='brice 280',
       marinate_txt='Marinate the chicken for at least 1 hour.', mins=25)
biryani('Kathal Biryani', 'jackfruit 400 cubed, boiled', MAR, 'Raw jackfruit biryani, a meaty vegetarian favourite.', mins=15)


def fried_rice(name, add, desc, rice='basmati 200', serves=3):
    g = [('Ingredients', f'{rice}; water 400; salt'), ('For the Stir-fry', f'oil 12; garlic 12 finely chopped; ginger 5; springonion 50; carrot 60 finely diced; beans 50 finely chopped; capsicum 50; cabbage 50 shredded; {add}; soysauce 10; vinegar 5; pepper 1.5')]
    steps = [
        f'Cook the rice: Cook the {names(rice)} until just done, spread on a plate and cool completely (day-old rice is ideal).',
        'Heat the wok: Heat oil in a wok on the highest flame until it just starts to smoke.',
        'Aromatics: Add garlic, ginger and the white part of the spring onions and stir-fry for 30 seconds.',
        f'Stir-fry: Add the vegetables and {names(add)} and toss on high heat for 2–3 minutes; they should stay crunchy.',
        'Add rice: Add the cold rice, soy sauce, vinegar, pepper and a little salt. Toss on high heat for 2 minutes, breaking up any lumps.',
        'Finish: Add the spring onion greens, toss once and serve immediately.',
    ]
    recipe(name, C, desc, serves, 15, 15, g, steps, tips=['Use cold rice and a very hot wok so the rice does not turn mushy.', 'Low-sodium soy sauce keeps the salt in check.'],
           serve=['a bowl of clear soup or a light Indo-Chinese gravy.', '<b>Best time:</b> lunch or dinner.'],
           store='best eaten fresh; keeps in the fridge for 1 day.', sub='Fried Rice')


fried_rice('Vegetable Fried Rice', 'corn 40', 'Indo-Chinese style vegetable fried rice with less oil and low-sodium soy sauce.')
fried_rice('Egg Fried Rice', 'egg 150 scrambled', 'Fried rice tossed with soft scrambled eggs and vegetables.')
fried_rice('Chicken Fried Rice', 'chicken 200 diced, cooked', 'Fried rice with tender chicken pieces.')
fried_rice('Paneer Fried Rice', 'paneer 120 diced', 'Fried rice with paneer cubes for extra protein.')
fried_rice('Brown Rice Fried Rice', 'corn 40; peas 40', 'Vegetable fried rice made with brown rice.', rice='brice 200')
fried_rice('Millet Fried Rice', 'peas 40', 'Fried rice made with foxtail millet, a low-GI choice.', rice='foxtail 200')
fried_rice('Schezwan Fried Rice (Lighter)', 'chilliflakes 3; tomato 40 puréed', 'Spicy schezwan-style fried rice made with homemade chilli-garlic paste.')
fried_rice('Mushroom Fried Rice', 'mushroom 150 sliced', 'Fried rice with sautéed mushrooms.')
fried_rice('Prawn Fried Rice', 'prawn 180', 'Fried rice with juicy prawns.')
fried_rice('Tofu Fried Rice', 'tofu 150 diced', 'Vegan, high-protein fried rice with tofu.')
fried_rice('Cauliflower Fried Rice (Low-carb)', 'cauliflower 300 grated (rice); egg 100 scrambled', 'A low-carb fried rice where grated cauliflower replaces most of the rice.', rice='basmati 60')
