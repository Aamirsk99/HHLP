"""Legume curries: rajma, chole, kala chana, lobia, usal, soya and more."""
from core import recipe
from util import names

C = 'Legume Curries'

MASALA = {
    'punjabi': ('oil 15; jeera 2; bayleaf 0.2; onion 150 finely chopped; ginger 10 grated; garlic 12 grated; gchilli 3; tomato 200 puréed; haldi 1; chilli 2; dhania 4; garam 2',
                'Heat oil, add cumin and bay leaf. Add onion and sauté on medium flame for 8–10 minutes until deep golden. Add ginger, garlic and green chilli and cook 1 minute. Add the tomato purée and powdered spices and cook until the masala thickens and oil separates (6–8 minutes).'),
    'maharashtrian': ('oil 15; mustard 3; jeera 1; hing; curryleaf 1.5; onion 120 finely chopped; ginger 8; garlic 8; tomato 120 chopped; haldi 1; chilli 2; goda 5; coconut 20 grated, dry-roasted; jaggery 5',
                      'Heat oil, crackle mustard and cumin, add hing and curry leaves. Sauté the onion until golden, add ginger-garlic, then tomato, turmeric, chilli powder and goda masala. Grind the roasted coconut with a little water and add it; cook for 3 minutes.'),
    'south': ('coconutoil 15; mustard 3; curryleaf 1.5; onion 120 sliced; ginger 8; garlic 8; tomato 120 chopped; haldi 1; chilli 1.5; dhania 4; garam 1; coconut 40 ground to paste',
              'Heat coconut oil, crackle mustard seeds and add curry leaves. Sauté onion until golden, add ginger-garlic, tomato and the powdered spices, and cook until soft. Stir in the coconut paste and cook for 3 minutes.'),
    'bengali': ('mustardoil 15; jeera 1.5; bayleaf 0.2; redchilli 2; onion 100 chopped; ginger 10 grated; tomato 120 chopped; haldi 1; chilli 1.5; jeerapowder 2; dhania 3; garam 1',
                'Heat mustard oil until it smokes lightly, then lower the flame. Add cumin, bay leaf and dry red chilli, then onion, and sauté until golden. Add ginger, tomato and the powdered spices and cook until the oil separates.'),
}


def legume(name, pulse, desc, style='punjabi', soak=8, whistles='5–6', water=700, add='', add_txt='', finish='coriander 8; lemon 5', serves=4,
           cook_txt='', dry=False, sub='Curry', tips=(), simmer=15):
    mk, mtxt = MASALA[style]
    g = [('For Cooking the Legumes', f'{pulse}; water {water}; salt'), ('For the Masala', mk + (f'; {add}' if add else '')), ('To Finish', finish)]
    steps = [
        (f'Soak: Wash the {names(pulse)} well and soak in plenty of water for {soak} hour{"s" if soak > 1 else ""}' + (' or overnight.' if soak >= 6 else '.') if soak else
         f'Prepare: Rinse the {names(pulse)} and drain.'),
        ('Pressure-cook', cook_txt) if cook_txt else
        f'Pressure-cook: Drain, add fresh water and salt and pressure-cook for {whistles} whistles until soft enough to mash between your fingers. Keep the cooking water.',
        f'Make the masala: {mtxt}',
    ]
    if add_txt:
        steps.append(f'Add the vegetables: {add_txt}')
    steps += [
        f'Combine: Add the cooked {names(pulse)} with ' + ('just a splash of the cooking water.' if dry else 'enough cooking water to make a gravy. Mash a few pieces against the side of the pan to thicken it.'),
        f'Simmer: Cover and simmer on low flame for {simmer} minutes so the {names(pulse)} absorb the masala.' + (' Cook uncovered until dry and coated.' if dry else ''),
        f'Finish: Add the {names(finish)}, check the salt and serve hot.',
    ]
    recipe(name, C, desc, serves, 15, 40, g, steps,
           tips=list(tips) + ['Brown the onions slowly; this gives the gravy its depth without cream.',
                              'Use the legume cooking water in the gravy; it holds flavour and nutrients.'],
           serve=['steamed rice, jeera rice, phulka or bhakri, with onion-cucumber salad.', '<b>Best time:</b> lunch.'],
           store='keeps in the fridge for 2–3 days and tastes even better the next day. Freezes well for a month.',
           sub=sub)


legume('Rajma Masala', 'rajma 200', 'North India’s favourite red kidney bean curry in a thick onion-tomato gravy, perfect with rice.', simmer=20,
       tips=['Rajma must be fully soft; undercooked kidney beans can upset the stomach.'])
legume('Chole (Chana Masala)', 'chickpea 200', 'Punjabi-style chickpeas in a tangy, spicy onion-tomato gravy.', add='chole 5; amchur 2; tea 2.5 in a muslin pouch for colour',
       tips=['Pressure-cook the chickpeas with a tea bag for the classic dark colour.'])
legume('Kala Chana Curry', 'kalachana 200', 'Black chickpeas in a spicy gravy, rich in iron and fibre.')
legume('Kala Chana Sukha', 'kalachana 200', 'A dry, tangy black chickpea stir-fry, perfect as a side or snack.', dry=True, add='amchur 2', simmer=10)
legume('Lobia Masala', 'lobia 200', 'Black-eyed beans in a homestyle onion-tomato gravy, rich in folate.', soak=6, whistles='3–4')
legume('Lobia Palak', 'lobia 180', 'Black-eyed beans cooked with spinach, a nourishing one-pot curry.', soak=6, whistles='3–4', add='spinach 200 chopped',
       add_txt='Add the chopped spinach and cook for 3 minutes until wilted.')
legume('Chole Palak', 'chickpea 180', 'Chickpeas simmered with spinach purée, rich in protein, iron and folate.', add='spinach 250 blanched, puréed',
       add_txt='Add the spinach purée and cook for 3 minutes.')
legume('Rajma with Spinach', 'rajma 180', 'Rajma cooked with spinach for extra iron and fibre.', add='spinach 200 chopped', add_txt='Add the spinach and cook for 3 minutes.')
legume('Matki Usal', 'moth 200 sprouted', 'Maharashtrian sprouted moth bean curry with goda masala and coconut.', style='maharashtrian', soak=0, whistles='2',
       cook_txt='Pressure-cook the sprouted moth beans with water and salt for 1–2 whistles only; they should be soft but hold their shape.')
legume('Moong Usal', 'gmoong 200 sprouted', 'Sprouted green moong in a light Maharashtrian masala.', style='maharashtrian', soak=0,
       cook_txt='Pressure-cook the sprouted moong with water and salt for 1 whistle only.')
legume('Ragda (White Peas Curry)', 'whitepeas 200', 'Mumbai-style white peas curry, served on its own or with patties.', add='ragda 3; tamarind 10', whistles='5–6')
legume('Ghugni', 'drygreenpeas 200', 'Bengali and Odia street-style dried yellow/green peas curry with ginger and tamarind.', style='bengali', add='tamarind 10; potato 100 cubed',
       finish='coriander 8; onion 30 raw, finely chopped; jeerapowder 1')
legume('Kala Chana Ghugni', 'kalachana 200', 'Bengali black chickpea ghugni with coconut bits and ginger.', style='bengali', finish='coconut 20 small pieces; coriander 8')
legume('Kerala Kadala Curry', 'kalachana 200', 'Black chickpeas in a roasted coconut gravy, traditionally served with puttu or appam.', style='south')
legume('Chickpea Coconut Curry', 'chickpea 200', 'South Indian-style chickpeas simmered in a coconut-spice gravy.', style='south')
legume('Green Moong Curry', 'gmoong 180', 'Whole green moong in a homestyle onion-tomato gravy, high in protein and fibre.', soak=6, whistles='3')
legume('Double Beans Curry', 'rajmabeans 180', 'Lima (double) beans in a mildly spiced coconut gravy.', style='south')
legume('Kulthi Usal', 'kulthi 180', 'Horse gram curry in a Maharashtrian masala, warming and rich in iron.', style='maharashtrian', whistles='6–8')
legume('Matar Usal (Dried Green Peas)', 'drygreenpeas 200', 'Dried green peas in a spicy Maharashtrian masala.', style='maharashtrian')
legume('Soya Chunks Curry', 'soya 100', 'Soya chunks in a rich onion-tomato gravy, the highest-protein vegetarian curry.', soak=0,
       cook_txt='Boil the soya chunks in plenty of salted water for 5 minutes. Drain, rinse in cold water and squeeze out all the water.', simmer=10)
legume('Soya Matar', 'soya 80', 'Soya chunks and green peas in a homestyle masala, protein-packed.', soak=0, add='peas 120',
       cook_txt='Boil the soya chunks for 5 minutes, rinse and squeeze dry.', add_txt='Add the green peas and cook for 4 minutes.', simmer=10)
legume('Soya Keema Matar', 'soyagran 100', 'A vegetarian keema of soya granules and peas, quick and high in protein.', soak=0, dry=True, add='peas 120',
       cook_txt='Soak the soya granules in hot water for 10 minutes and squeeze dry.', add_txt='Add the peas and cook for 4 minutes.', simmer=8)
legume('Chana Dal Curry with Lauki', 'chanadal 150', 'Thick chana dal curry with bottle gourd in an onion-tomato masala.', soak=1, whistles='3', add='lauki 200 cubed',
       add_txt='Add the lauki and cook covered for 6 minutes.')
legume('Mixed Sprouts Curry', 'mixsprouts 250', 'A light curry of mixed sprouts, high in protein and vitamin C.', soak=0, style='maharashtrian',
       cook_txt='Steam or pressure-cook the sprouts for 1 whistle until just soft.')
legume('Rajma Curry South Indian Style', 'rajma 180', 'Kidney beans in a coconut-curry leaf gravy, a Karnataka home favourite.', style='south', simmer=15)
legume('Pindi Chole (Dry)', 'chickpea 200', 'Dark, dry, tangy Rawalpindi-style chickpeas without onion gravy.', dry=True, add='chole 6; amchur 3; tea 2.5 in a pouch for colour',
       finish='ginger 10 julienned; gchilli 3 slit; lemon 10; coriander 6')
legume('Chana Masala with Sweet Potato', 'chickpea 180', 'Chickpeas and sweet potato in a spiced tomato gravy.', add='sweetpotato 200 cubed', add_txt='Add the sweet potato cubes and cook covered for 8 minutes.')
legume('Moth Bean Misal', 'moth 180 sprouted', 'Spicy Maharashtrian sprouted moth curry (misal), served with onion, lemon and a little farsan.', style='maharashtrian', soak=0,
       cook_txt='Pressure-cook the sprouts with water and salt for 1–2 whistles.', add='chilli 2',
       finish='onion 60 finely chopped; tomato 50 finely chopped; lemon 10; coriander 8')
legume('Lobia Curry Goan Style', 'lobia 180', 'Goan black-eyed bean curry with coconut, perfect with rice.', style='south', soak=6, whistles='3')
legume('Jammu Rajma', 'rajma 180', 'Small Jammu rajma slow-cooked with whole spices, a Sunday lunch classic.', add='saunf 1; dryginger 1; cinnamon 1.5; clove 0.2', simmer=25)
