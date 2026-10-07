"""Dals, sambar, rasam and kadhi."""
from core import recipe
from util import names, allnames

C = 'Dals, Sambar & Kadhi'
DAL_SERVE = ['phulka, jeera rice or brown rice, with a salad.', '<b>Best time:</b> lunch or dinner.']
DAL_STORE = 'keeps in the fridge for 2 days. Dal thickens when cold; add hot water while reheating.'

TADKA = {
    'jeera': ('ghee 8; jeera 2; hing; redchilli 2; garlic 8 chopped',
              'Heat ghee in a small pan, crackle the cumin, add garlic and fry until light golden, then add the dry red chilli and hing.'),
    'onion': ('oil 10; jeera 2; hing; onion 80 finely chopped; tomato 100 chopped; ginger 5; garlic 8; gchilli 3; chilli 1; garam 0.5',
              'Heat oil, crackle the cumin and hing, add onion and sauté until golden. Add ginger, garlic and green chilli, then tomato, chilli powder and garam masala, and cook until the tomato turns soft and oil separates.'),
    'south': ('oil 8; mustard 3; jeera 1; redchilli 2; curryleaf 1.5; hing; garlic 4',
              'Heat oil, crackle mustard seeds and cumin, then add dry red chillies, curry leaves, crushed garlic and hing.'),
    'bengali': ('mustardoil 10; panchphoron 2; bayleaf 0.2; redchilli 2; ginger 5 grated; hing',
                'Heat mustard oil until it smokes lightly, lower the flame and add panch phoron, bay leaf, dry red chilli, ginger and hing.'),
    'gujarati': ('ghee 8; mustard 2; jeera 1; methiseed 1; clove 0.2; cinnamon 1; curryleaf 1; redchilli 1; hing',
                 'Heat ghee, crackle mustard, cumin and methi seeds, then add cloves, cinnamon, curry leaves, dry red chilli and hing.'),
    'garlic': ('ghee 8; jeera 1.5; garlic 16 sliced; redchilli 2; chilli 1; hing',
               'Heat ghee, crackle cumin, add plenty of sliced garlic and fry until golden and crisp; switch off and add chilli powder and hing.'),
}


def dal(name, dals, desc, water=700, add='', add_txt='', tadka='jeera', sour='', finish='coriander 8', serves=4, soak=30, sub='Dal',
        cook_txt='', tips=(), haldi=True):
    tk, tk_txt = TADKA[tadka]
    g = [('For the Dal', f'{dals}; water {water}' + ('; haldi 1' if haldi else '') + '; salt' + (f'; {add}' if add else '') + (f'; {sour}' if sour else '')),
         ('For the Tadka', tk), ('To Finish', finish)]
    steps = [
        f'Wash & soak: Wash the {names(dals)} 3–4 times until the water runs clear and soak for {soak} minutes.' if 0 < soak < 120 else
        f'Wash & soak: Wash the {names(dals)} 3\u20134 times and soak overnight (or for at least {soak // 60} hours).' if soak else
        f'Wash: Wash the {names(dals)} 3–4 times until the water runs clear.',
        ('Pressure-cook', cook_txt) if cook_txt else (f'Pressure-cook: Cook the dal with the water, turmeric and salt' + (f' and the {allnames(add)}' if add else '') +
                     ' for 3–4 whistles on medium flame, until completely soft. Let the pressure release naturally.'),
        'Mash: Open the cooker and whisk the dal lightly until creamy. Add hot water to get the consistency you like and simmer for 3–4 minutes.',
    ]
    if add_txt:
        steps.append(f'Add the vegetables: {add_txt}')
    if sour:
        steps.append(f'Add tang: Stir in the {names(sour)} and simmer for 2 minutes.')
    steps += [
        f'Prepare the tadka: {tk_txt}',
        'Temper the dal: Pour the sizzling tadka over the dal and cover immediately for 1 minute to trap the aroma.',
        'Serve: Garnish with coriander and serve hot.',
    ]
    recipe(name, C, desc, serves, 10 + (0 if soak <= 30 else 0), 25, g, steps,
           tips=list(tips) + ['Soaking dal makes it cook faster and easier to digest.',
                              'Add the tadka just before serving for the best aroma.'],
           serve=DAL_SERVE, store=DAL_STORE, sub=sub, tags=('soft',))


dal('Moong Dal Tadka', 'moong 150', 'Light, creamy yellow moong dal tempered with cumin, garlic and red chilli, the most comforting everyday dal.')
dal('Masoor Dal', 'masoor 150', 'Quick-cooking red lentil dal with an onion-tomato tadka, rich in protein and iron.', tadka='onion')
dal('Toor Dal Tadka', 'toor 150', 'Everyday arhar dal tempered with ghee, cumin and garlic.', tadka='jeera', soak=30)
dal('Dal Fry', 'toor 120; moong 30', 'Restaurant-style dal fry with a rich onion-tomato masala.', tadka='onion')
dal('Chana Dal', 'chanadal 150', 'Nutty, thick chana dal with an onion-tomato tadka, low in glycaemic index.', tadka='onion', soak=60)
dal('Lauki Chana Dal', 'chanadal 120', 'Chana dal cooked with bottle gourd, light and wholesome.', tadka='onion', soak=60, add='lauki 200 cubed')
dal('Palak Dal', 'toor 120; moong 30', 'Toor and moong dal cooked with fresh spinach, rich in iron and folate.', tadka='garlic',
    add_txt='Add the chopped spinach to the cooked dal and simmer for 3–4 minutes until wilted but still green.', finish='spinach 150 chopped')
dal('Methi Dal', 'toor 150', 'Toor dal with fresh fenugreek leaves, slightly bitter and very aromatic.', tadka='garlic',
    add_txt='Add the chopped methi to the cooked dal and simmer for 5 minutes.', finish='methi 60 chopped')
dal('Tomato Dal (Tomato Pappu)', 'toor 150', 'Andhra-style tangy tomato dal, comforting with rice.', tadka='south', add='tomato 200 chopped; gchilli 6; tamarind 5')
dal('Mango Dal (Mamidikaya Pappu)', 'toor 150', 'Tangy Andhra dal cooked with raw mango, a summer favourite.', tadka='south', add='rawmango 100 peeled, cubed; gchilli 6')
dal('Gongura Pappu', 'toor 150', 'Andhra dal cooked with tangy gongura (sorrel) leaves.', tadka='south', add='gongura 60; gchilli 6')
dal('Dal Palak Moong', 'moong 150', 'Yellow moong dal with spinach and a garlicky tadka, light and iron-rich.', tadka='garlic', finish='spinach 120 chopped',
    add_txt='Stir the spinach into the cooked dal and simmer for 3 minutes.')
dal('Moong Masoor Dal', 'moong 80; masoor 80', 'A creamy blend of moong and masoor dal, quick to make and easy to digest.', tadka='jeera')
dal('Panchmel Dal', 'toor 40; chanadal 40; moong 30; masoor 30; urad 30', 'Rajasthani five-lentil dal, rich in protein and full of flavour.', tadka='onion', soak=60)
dal('Gujarati Dal', 'toor 150', 'Sweet, tangy and spicy Gujarati toor dal with kokum and peanuts.', tadka='gujarati',
    sour='kokum 9; jaggery 15; lemon 10', add='peanut 15; tomato 60 chopped; ginger 5; gchilli 3')
dal('Maharashtrian Amti', 'toor 150', 'Tangy, mildly sweet Maharashtrian dal with goda masala and kokum.', tadka='south',
    sour='kokum 6; jaggery 10', add='goda 5', finish='coriander 8; coconut 15')
dal('Cholar Dal', 'chanadal 150', 'Bengali chana dal with coconut, raisins and whole spices, served on festive days.', tadka='bengali', soak=60,
    finish='coconut 20 small pieces; raisin 9; coriander 6', add='sugar 5')
dal('Masoor Dal Bengali Style', 'masoor 150', 'Simple Bengali musur dal with panch phoron and mustard oil.', tadka='bengali')
dal('Dal Makhani (Lighter)', 'wurad 120; rajma 30', 'A lighter home version of the Punjabi classic: slow-cooked black urad and rajma with very little butter and cream.',
    tadka='onion', soak=480, water=900, finish='butter 10; cream 30; kasuri 1',
    cook_txt='Pressure-cook the soaked urad and rajma with water, turmeric and salt for 8–10 whistles until very soft; mash some of the dal against the side of the pan.',
    tips=['Simmer dal makhani for 20–30 minutes after adding the masala; slow cooking gives the creaminess, not cream.'])
dal('Dal Tadka with Lauki', 'toor 120; moong 30', 'Mixed dal cooked with bottle gourd, a light dinner dal.', add='lauki 200 cubed')
dal('Khatti Dal', 'toor 150', 'Hyderabadi sour dal with tamarind, garlic and curry leaves.', tadka='south', sour='tamarind 15', add='tomato 80 chopped; gchilli 6')
dal('Dalma', 'toor 120', 'Odisha’s dal cooked with vegetables, light, wholesome and temple-style.', tadka='jeera',
    add='pumpkin 100 cubed; rawbanana 75 cubed; brinjal 80 cubed; papaya 60 raw, cubed; ginger 5', finish='coconut 15; coriander 6')
dal('Sprouted Moong Dal', 'gmoong 150 sprouted', 'A wholesome dal made from sprouted green moong, rich in protein and vitamin C.', tadka='onion', soak=0)
dal('Whole Masoor Dal', 'wmasoor 150', 'Hearty brown lentil curry with an onion-tomato masala.', tadka='onion', soak=120)
dal('Green Moong Dal (Sabut Moong)', 'gmoong 150', 'Whole green moong cooked with onion, tomato and spices, high in fibre.', tadka='onion', soak=240)
dal('Kulthi Dal', 'kulthi 140', 'Horse gram dal, a traditional winter dal rich in iron, protein and fibre.', tadka='onion', soak=480, water=900,
    cook_txt='Pressure-cook the soaked horse gram with water, turmeric and salt for 6–8 whistles until soft.')
dal('Dal Dhokli (Lighter)', 'toor 120', 'Gujarati one-pot meal of sweet-sour dal with spiced whole-wheat dumplings.', tadka='gujarati',
    sour='kokum 6; jaggery 15; lemon 10', add='atta 100 as dhokli dough with haldi, ajwain and salt; peanut 15',
    cook_txt='Pressure-cook the toor dal with water, turmeric, salt and peanuts for 3\u20134 whistles until soft. Meanwhile knead the atta with turmeric, ajwain, salt and water into a stiff dough.',
    add_txt='Roll the atta dough thin, cut into diamonds and drop them into the boiling dal one by one. Simmer for 10–12 minutes until cooked.')
dal('Moong Dal with Drumsticks', 'moong 150', 'Moong dal simmered with drumsticks, a South Indian home favourite.', tadka='south', add='drumstick 120 cut into 3-inch pieces')
dal('Chana Dal with Coconut', 'chanadal 150', 'Thick chana dal finished with fresh coconut and curry leaves.', tadka='south', soak=60, finish='coconut 30; coriander 6')
dal('Lemon Dal', 'toor 120; moong 30', 'A simple, tangy dal finished with lemon juice, high in vitamin C.', tadka='south', finish='lemon 20; coriander 8')
dal('Dal with Amaranth Leaves', 'toor 150', 'Toor dal with chaulai (amaranth) leaves, rich in calcium and iron.', tadka='garlic',
    add_txt='Add the chopped amaranth leaves to the cooked dal and simmer for 5 minutes.', finish='amaranth 120 chopped')
dal('Moringa Leaves Dal', 'toor 150', 'Toor dal with moringa (drumstick) leaves, a highly nutritious South Indian dal.', tadka='south',
    add_txt='Add the moringa leaves to the dal and simmer for 5 minutes.', finish='moringaleaf 40')
dal('Urad Chana Dal (Maa Chole di Dal)', 'wurad 100; chanadal 50', 'Punjabi dal of whole urad and chana dal, rich and protein-packed.', tadka='onion', soak=360, water=900)


def sambar(name, veg, desc, dals='toor 120', sour='tamarind 20', extra='', serves=4, veg_txt=''):
    g = [('For the Dal', f'{dals}; water 600; haldi 1'),
         ('For the Sambar', f'{veg}; {sour}; sambar 10; jaggery 5; salt; water 300' + (f'; {extra}' if extra else '')),
         ('For the Tadka', 'oil 10; mustard 3; methiseed 1; redchilli 2; curryleaf 1.5; hing'), ('To Finish', 'coriander 8')]
    steps = [
        f'Cook the dal: Wash the {names(dals)} and pressure-cook with water and turmeric for 3–4 whistles until soft. Mash well.',
        'Soak the tamarind: Soak the tamarind in ½ cup warm water for 10 minutes and squeeze out the pulp.' if 'tamarind' in sour else 'Prepare the tang: Keep the souring agent ready.',
        f'Cook the vegetables: {veg_txt or f"In a pot, boil the {names(veg)} with 1¼ cups water and salt for 7–8 minutes until tender but not mushy."}',
    ] + ([f'Roast & grind the masala: Dry-roast the {names(extra)} and spices on low flame until golden and aromatic, then grind to a smooth paste with a little water. Add it along with the sambar powder in the next step.'] if extra else []) + [
        'Add tamarind & spices: Add the tamarind extract, sambar powder and jaggery and simmer for 5 minutes until the raw smell of tamarind goes.',
        'Add the dal: Add the mashed dal, adjust the consistency with hot water and simmer for 5 minutes.',
        'Temper: Heat oil, crackle mustard and methi seeds, add dry red chillies, curry leaves and hing, and pour over the sambar.',
        'Serve: Garnish with coriander and serve hot.',
    ]
    recipe(name, C, desc, serves, 15, 30, g, steps,
           tips=['Simmer the sambar after adding dal; boiling hard makes it lose its aroma.',
                 'Freshly ground sambar powder makes a big difference to flavour.'],
           serve=['steamed rice, idli, dosa or vada.', '<b>Best time:</b> breakfast, lunch or dinner.'],
           store=DAL_STORE, sub='Sambar', tags=('soft',))


sambar('Mixed Vegetable Sambar', 'drumstick 80; carrot 60; brinjal 60; pumpkin 80; onion 60; tomato 80', 'A tangy South Indian lentil and vegetable stew, the soul of every South Indian meal.')
sambar('Drumstick Sambar', 'drumstick 160; onion 60; tomato 80', 'Sambar with tender drumsticks, the most loved sambar in Tamil homes.')
sambar('Radish Sambar (Mullangi Sambar)', 'mooli 200 sliced; onion 60; tomato 60', 'A peppery sambar made with white radish.')
sambar('Small Onion Sambar (Vengaya Sambar)', 'shallot 150 peeled; tomato 80', 'Tamil Nadu’s famous sambar with whole small onions sautéed in sesame oil.',
       veg_txt='Sauté the shallots in 1 tsp oil for 4 minutes until lightly golden, then add tomato, 1¼ cups water and salt and cook for 5 minutes.')
sambar('Pumpkin Sambar', 'pumpkin 250 cubed; onion 60; tomato 60', 'A mildly sweet and tangy sambar with yellow pumpkin.')
sambar('Brinjal Sambar', 'brinjal 200 cubed; onion 60; tomato 60', 'Sambar made with tender brinjals, perfect with rice.')
sambar('Bhindi Sambar', 'bhindi 180 cut in 1-inch pieces, sautéed; onion 60; tomato 60', 'Sambar with lightly sautéed okra.',
       veg_txt='Sauté the okra in 1 tsp oil for 4 minutes to remove the sliminess, then add onion, tomato, 1¼ cups water and salt and cook for 5 minutes.')
sambar('Lauki Sambar', 'lauki 250 cubed; onion 60; tomato 60', 'A light bottle gourd sambar, easy on the stomach.')
sambar('Carrot Beans Sambar', 'carrot 120; beans 120; onion 60; tomato 60', 'Sambar with carrots and French beans.')
sambar('Tiffin Sambar (Moong Dal)', 'onion 80; tomato 100; carrot 50', 'A light hotel-style moong dal sambar for idli and dosa.', dals='moong 100; toor 30')
sambar('Arachuvitta Sambar', 'drumstick 80; brinjal 80; shallot 60; tomato 60', 'Sambar with a freshly roasted and ground coconut-spice paste.',
       extra='coconut 30; dhaniaseed 4; chana_t 4; methiseed 0.5')
sambar('Ash Gourd Sambar', 'ashgourd 250 cubed; onion 60; tomato 60', 'A cooling, light sambar with ash gourd.')
sambar('Spinach Sambar (Keerai Sambar)', 'spinach 150 chopped; onion 60; tomato 80', 'Sambar with fresh spinach, rich in iron.')
sambar('Kerala Sambar', 'drumstick 60; pumpkin 60; rawbanana 60; brinjal 60; beans 40; shallot 40; tomato 60', 'Kerala sadya-style sambar with roasted coconut and many vegetables.',
       extra='coconut 30; dhaniaseed 4')


def rasam(name, base, desc, sour='tamarind 10; tomato 150', dals='', extra='', serves=4, sub='Rasam'):
    g = [('Ingredients', f'{sour}; rasampowder 5; garlic 8 crushed; peppercorn 2 crushed; jeera 2 crushed; curryleaf 1.5; haldi 0.5; jaggery 3; salt; water 750'
                         + (f'; {base}' if base else '') + (f'; {dals}' if dals else '') + (f'; {extra}' if extra else '')),
         ('For the Tadka', 'ghee 8; mustard 3; redchilli 2; curryleaf 1; hing'), ('To Finish', 'coriander 10')]
    steps = [
        ('Cook the dal: Pressure-cook the ' + names(dals) + ' with 2 cups water for 3 whistles and mash; keep the dal water.') if dals else
        'Prepare the base: Soak the tamarind in warm water for 10 minutes and extract the juice.',
        f'Crush the spices: Coarsely crush the pepper, cumin and garlic in a mortar.',
        'Boil the base: In a pot, add the tamarind water, crushed tomatoes, turmeric, salt, jaggery, curry leaves, the crushed spices and rasam powder' +
        (f' along with the {allnames(base)}' if base else '') + '. Boil for 7–8 minutes until the raw smell goes.',
        'Add water' + (' & dal' if dals else '') + ': Add the remaining water' + (' and the dal' if dals else '') + '. Heat until it turns frothy on top, then switch off. Do not boil it hard after this.',
        'Temper: Heat ghee, crackle mustard seeds, add dry red chillies, curry leaves and hing and pour over the rasam.',
        'Serve: Add coriander, cover for 5 minutes, and serve hot with rice or as a soup.',
    ]
    recipe(name, C, desc, serves, 10, 20, g, steps,
           tips=['Switch off rasam as soon as it froths up; over-boiling makes it bitter.',
                 'Rasam tastes better after resting covered for 10 minutes.'],
           serve=['steamed rice with a little ghee, or sip it hot like a soup.', '<b>Best time:</b> lunch or dinner; very soothing during colds.'],
           store='keeps in the fridge for 2 days.', sub=sub, tags=('soft',))


rasam('Tomato Rasam', '', 'A thin, tangy, peppery South Indian soup with tomatoes and tamarind, soothing and digestive.')
rasam('Pepper Rasam (Milagu Rasam)', '', 'A strongly peppery rasam, a traditional home remedy for colds.', extra='peppercorn 3')
rasam('Lemon Rasam', '', 'A light, tangy rasam made with lemon juice and moong dal, rich in vitamin C.', sour='tomato 100; lemon 20', dals='moong 40')
rasam('Garlic Rasam (Poondu Rasam)', 'garlic 24', 'A garlic-forward rasam that aids digestion.')
rasam('Pineapple Rasam', 'pineapple 120 chopped', 'A sweet-tangy rasam with pineapple, a wedding-feast favourite.', dals='toor 40')
rasam('Dal Rasam (Paruppu Rasam)', '', 'Rasam with cooked toor dal for extra body and protein.', dals='toor 50')
rasam('Mysore Rasam', 'coconut 20', 'A rich Karnataka rasam with freshly ground coconut and spices.', dals='toor 50', extra='dhaniaseed 4; chana_t 4')
rasam('Horse Gram Rasam (Kollu Rasam)', '', 'A warming rasam made with horse gram water, traditionally used in winter.', dals='kulthi 50')
rasam('Ginger Rasam', 'ginger 20', 'A ginger-rich rasam that soothes the stomach.', dals='moong 30')
rasam('Drumstick Rasam', 'drumstick 120', 'A light rasam flavoured with drumsticks.', dals='toor 40')
rasam('Mint Coriander Rasam', 'mint 15; coriander 15', 'A refreshing herby rasam with mint and coriander.', dals='moong 30')
rasam('Jeera Rasam', '', 'A cumin-forward rasam that aids digestion.', extra='jeera 3')
rasam('Amla Rasam', 'amla 60 grated', 'A tangy rasam with gooseberries, very rich in vitamin C.', sour='tomato 100', dals='moong 40')


def kadhi(name, desc, veg='', veg_txt='', curd='curd 300', besan='besan 40', tadka='oil 8; jeera 1.5; methiseed 1; mustard 2; redchilli 2; curryleaf 1.5; hing',
          extra='ginger 5 grated; gchilli 3; haldi 0.5; chilli 0.5; salt; water 500', sweet='', sub='Kadhi', simmer=15, dumplings='', gentle=False):
    g = [('For the Kadhi', f'{curd}; {besan}; {extra}' + (f'; {sweet}' if sweet else '') + (f'; {veg}' if veg else '')),
         ('For the Tadka', tadka), ('To Finish', 'coriander 6')]
    if dumplings:
        g.insert(1, ('For the Steamed Pakodis', dumplings))
    steps = [
        f'Whisk: Whisk the curd with the {names(besan)}, turmeric, chilli powder and salt until completely smooth. Add the water and whisk again.',
        'Start cooking: Pour into a heavy pot and bring to a boil on medium flame, stirring continuously so the curd does not split.',
        f'Simmer: Once it boils, lower the flame and simmer for {simmer} minutes, stirring occasionally, until it thickens slightly and the raw besan smell goes.',
    ] if not gentle else [
        f'Grind the paste: Grind the {names(besan)} with the ginger, green chilli and a little water to a smooth paste, then whisk it into the curd.',
        'Heat gently: Warm on low flame, stirring all the time, just until it turns frothy and steaming. Do not let it boil, or the curd will split.',
    ]
    if dumplings:
        steps.append('Make the pakodis: Mix the pakodi ingredients into a thick batter, steam spoonfuls in an idli or appe mould for 10 minutes, and add them to the kadhi in the last 5 minutes.')
    if veg:
        steps.append(f'Add the vegetables: {veg_txt or f"Add the {names(veg)} and simmer until tender."}')
    if sweet:
        steps.append(f'Balance: Stir in the {names(sweet)}.')
    steps += [
        'Temper: Heat oil or ghee, crackle cumin, methi and mustard seeds, add dry red chillies, curry leaves and hing and pour over the kadhi.',
        'Serve: Garnish with coriander and serve hot.',
    ]
    recipe(name, C, desc, 4, 10, 25, g, steps,
           tips=['Use slightly sour curd for the best flavour.', 'Keep stirring until the kadhi comes to a boil to stop it from curdling.'],
           serve=['steamed rice, jeera rice or khichdi.', '<b>Best time:</b> lunch.'],
           store='keeps in the fridge for 2 days.', sub=sub, tags=('soft',))


kadhi('Punjabi Kadhi with Steamed Pakodis', 'Tangy Punjabi curd-besan curry with soft steamed besan pakodis instead of fried ones.',
      dumplings='besan 60; onion 40 finely chopped; ajwain 0.5; chilli 0.5; salt; soda', simmer=25)
kadhi('Gujarati Kadhi', 'Thin, sweet-tangy Gujarati kadhi with ginger, curry leaves and cloves.', besan='besan 25', sweet='jaggery 15',
      tadka='ghee 8; jeera 1.5; mustard 2; clove 0.2; cinnamon 1; curryleaf 1.5; redchilli 2; hing')
kadhi('Palak Kadhi', 'Kadhi with fresh spinach, tangy and iron-rich.', veg='spinach 120 chopped', veg_txt='Add the spinach and simmer for 4 minutes.')
kadhi('Bhindi Kadhi', 'Kadhi with sautéed okra, a Rajasthani favourite.', veg='bhindi 150 sautéed',
      veg_txt='Sauté the okra in 1 tsp oil until lightly crisp and add it to the kadhi for the last 4 minutes.')
kadhi('Mor Kuzhambu', 'Tamil curd curry with a ground coconut-ginger paste and ash gourd.', besan='besan 10; coconut 40; chana_t 4; dhaniaseed 2',
      veg='ashgourd 200 cubed, boiled', tadka='coconutoil 8; mustard 2; redchilli 2; curryleaf 1.5; hing',
      veg_txt='Add the boiled ash gourd and warm through for 2 minutes.', gentle=True)
kadhi('Majjige Huli', 'Karnataka buttermilk curry with coconut and vegetables.', besan='besan 10; coconut 40; jeera 2',
      veg='lauki 150 cubed, boiled', tadka='coconutoil 8; mustard 2; redchilli 2; curryleaf 1.5; hing', gentle=True,
      veg_txt='Add the boiled lauki and warm through for 2 minutes.')
kadhi('Rajasthani Kadhi', 'A thin, spicy Rajasthani kadhi with no pakodas, light and tangy.', besan='besan 30',
      tadka='ghee 8; jeera 1.5; methiseed 1; redchilli 3; clove 0.2; hing; chilli 1')
kadhi('Moong Dal Pakodi Kadhi', 'Kadhi with soft steamed moong dal pakodis, higher in protein.',
      dumplings='moong 80 soaked and ground; ginger 5; gchilli 3; salt; soda', simmer=20)
kadhi('Methi Kadhi', 'A fragrant kadhi with fresh fenugreek leaves.', veg='methi 50 chopped', veg_txt='Add the methi and simmer 5 minutes.')
kadhi('Dahi Kadhi with Pumpkin', 'A mildly sweet-tangy kadhi with yellow pumpkin.', veg='pumpkin 200 cubed')
