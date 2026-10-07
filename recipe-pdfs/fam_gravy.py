"""Paneer, tofu, mushroom and vegetable curries in different gravies."""
from core import recipe
from util import names

C = 'Paneer & Vegetable Curries'

BASE = {
    'masala': ('oil 12; jeera 1.5; bayleaf 0.2; onion 150 finely chopped; ginger 8; garlic 10; gchilli 3; tomato 200 puréed; haldi 0.75; chilli 1.5; dhania 3; garam 1; water 200; salt',
               'Heat oil, add cumin and bay leaf. Sauté the onion until golden brown (8 minutes). Add ginger, garlic and green chilli for 1 minute, then the tomato purée and powdered spices. Cook until thick and the oil separates.'),
    'makhani': ('butter 8; oil 5; cinnamon 1; cardamom 0.4; clove 0.2; ginger 8; garlic 10; tomato 300 chopped; cashew 15 soaked; chilli 2; kasuri 1; honey 5; milk 60; water 150; salt',
                'Heat oil and butter, add the whole spices, ginger and garlic. Add tomatoes and soaked cashews and cook for 10 minutes until soft. Cool, blend to a very smooth purée and strain. Return to the pan with chilli powder and simmer for 5 minutes, then add milk and kasuri methi.'),
    'palak': ('oil 10; jeera 1.5; onion 100 finely chopped; ginger 8; garlic 10; gchilli 3; tomato 80 chopped; spinach 300 blanched, puréed; garam 1; dhania 2; water 100; salt; cream 15',
              'Blanch the spinach for 2 minutes, plunge into cold water and blend to a purée. Heat oil, crackle cumin, sauté onion until golden, add ginger, garlic, chilli and tomato and cook until soft. Add the spinach purée and spices and simmer 3 minutes.'),
    'kadai': ('oil 12; dhaniaseed 4; redchilli 3; jeera 1; onion 100 chopped; ginger 8; garlic 10; tomato 200 chopped; capsicum 120 diced; onion 60 petals; haldi 0.5; chilli 1; kasuri 1; salt; water 80',
              'Dry-roast coriander seeds and red chillies and crush them coarsely (kadai masala). Heat oil, sauté the chopped onion until golden, add ginger, garlic and tomato and cook until soft. Add the kadai masala and spices. Toss the capsicum and onion petals in separately on high heat for 2 minutes, keeping them crunchy.'),
    'korma': ('oil 10; cardamom 0.6; clove 0.2; bayleaf 0.2; onion 120 sliced; ginger 8; garlic 8; cashew 15; poppy 6; curd 100 whisked; gchilli 3; garam 1; water 200; salt',
              'Boil the sliced onion with cashews and poppy seeds for 5 minutes and blend to a smooth white paste. Heat oil, add the whole spices, ginger and garlic, then the onion paste, and cook for 5 minutes. Lower the flame, stir in the whisked curd and cook, stirring, until it thickens.'),
    'coconut': ('coconutoil 12; mustard 3; curryleaf 1.5; onion 100 sliced; ginger 8; garlic 8; gchilli 3; tomato 100 chopped; haldi 0.5; chilli 1; dhania 3; garam 1; coconutmilk 240; salt',
                'Heat coconut oil, crackle the mustard seeds and add curry leaves. Sauté onion, ginger, garlic and chilli until soft. Add tomato and the powdered spices and cook until pulpy. Stir in the coconut milk.'),
    'stew': ('coconutoil 10; cinnamon 1; cardamom 0.4; clove 0.2; peppercorn 1.5; curryleaf 1.5; onion 100 sliced; ginger 10 julienned; gchilli 6 slit; coconutmilk 360; salt',
             'Heat coconut oil, add the whole spices and curry leaves, then onion, ginger and green chillies, and sauté until soft but not brown. Add half the coconut milk and simmer.'),
    'kolhapuri': ('oil 12; onion 120 chopped; ginger 8; garlic 10; tomato 150 chopped; coconut 30 dry, roasted; sesame 5; dhaniaseed 4; redchilli 4; peppercorn 1; clove 0.2; cinnamon 1; haldi 0.5; chilli 1; water 200; salt',
                  'Dry-roast the coconut, sesame, coriander seeds, red chillies and whole spices until aromatic; grind to a paste. Heat oil, sauté onion until golden, add ginger-garlic and tomato and cook until soft. Add the ground masala and cook for 5 minutes.'),
    'methi_malai': ('oil 10; jeera 1; onion 100 boiled and puréed; cashew 15; ginger 8; garlic 8; gchilli 3; methi 80 chopped; milk 150; garam 0.5; sugar 3; salt',
                    'Boil the onion and cashews for 5 minutes and blend to a smooth paste. Heat oil, crackle cumin, add ginger, garlic and chilli, then the methi, and sauté for 3 minutes. Add the onion-cashew paste and cook for 4 minutes, then stir in the milk.'),
    'dopyaza': ('oil 12; jeera 1; onion 120 finely chopped; onion 120 thick petals; ginger 8; garlic 10; tomato 150 chopped; haldi 0.5; chilli 1.5; dhania 2; garam 1; kasuri 1; salt; water 80',
                'Heat oil and sauté the onion petals for 2 minutes; remove. In the same pan, crackle cumin, sauté chopped onion until golden, add ginger, garlic, tomato and spices and cook until thick.'),
    'tikka': ('oil 10; jeera 1; onion 120 chopped; ginger 8; garlic 10; tomato 200 puréed; cashew 10; chilli 1.5; dhania 2; garam 1; kasuri 1; hungcurd 60; tandoori 4; water 150; salt',
              'Marinate the main ingredient in hung curd, tandoori masala and salt for 30 minutes and grill or pan-sear it until charred at the edges. For the gravy, sauté onion until golden, add ginger, garlic, tomato purée, cashews and spices and cook until thick; blend smooth if you like.'),
    'achari': ('mustardoil 12; saunf 2; kalonji 0.5; methiseed 0.5; mustard 1; onion 100 chopped; ginger 8; garlic 8; tomato 150 puréed; curd 60 whisked; haldi 0.5; chilli 1.5; amchur 2; salt; water 100',
               'Heat mustard oil until it smokes lightly, lower the flame and add the pickle spices (fennel, kalonji, methi, mustard). Sauté the onion until golden, add ginger, garlic and tomato and cook until thick. Lower the flame and stir in the whisked curd.'),
    'chettinad': ('oil 12; fennel 0 ; onion 120 chopped; tomato 150 chopped; ginger 8; garlic 10; curryleaf 1.5; coconut 25; dhaniaseed 4; redchilli 4; peppercorn 2; saunf 2; poppy 3; cinnamon 1; clove 0.2; star 0; haldi 0.5; water 200; salt',
                  'Dry-roast the coconut, coriander seeds, red chillies, pepper, fennel, poppy seeds and whole spices and grind to a paste. Heat oil, add curry leaves and onion and sauté until golden. Add ginger, garlic and tomato and cook until soft, then the ground masala, and cook for 5 minutes.'),
}
BASE['chettinad'] = (BASE['chettinad'][0].replace('fennel 0 ; ', '').replace('star 0; ', ''), BASE['chettinad'][1])


def curry(name, main, desc, base='masala', add_txt='', simmer=8, finish='coriander 6', serves=3, sub='Curry', tips=(), prep=''):
    bk, btxt = BASE[base]
    g = [('Main Ingredients', main), ('For the Gravy', bk)]
    if finish:
        g.append(('To Finish', finish))
    steps = [
        f'Prepare: {prep or f"Wash and cut the {names(main)} into bite-sized pieces."}',
        f'Make the gravy: {btxt}',
        'Adjust: Add water as needed for a medium-thick gravy, add salt and bring to a gentle boil.',
        f'Add the main ingredients: {add_txt or f"Add the {names(main)} and stir gently to coat with the gravy."}',
        f'Simmer: Cover and simmer on low flame for {simmer} minutes until everything is cooked and the flavours blend.',
        f'Finish & serve: Add the {names(finish) or "garnish"}' + ' and serve hot.' if finish else 'Serve: Serve hot.',
    ]
    recipe(name, C, desc, serves, 15, 25 + simmer, g, steps,
           tips=list(tips) + ['Cook the masala until oil separates; this removes the raw taste and gives a rich gravy with less fat.',
                              'Add paneer or soft vegetables at the end so they stay soft and hold their shape.'],
           serve=['phulka, multigrain roti, jeera rice or brown rice.', '<b>Best time:</b> lunch or dinner.'],
           store='keeps in the fridge for 2 days. Reheat gently, adding a splash of water.', sub=sub, level='Medium')


P = 'paneer 200 cubed'
PADD = 'Add the paneer cubes and stir gently. Simmer only for 3–4 minutes so the paneer stays soft.'
curry('Palak Paneer', P, 'Soft paneer cubes in a smooth, garlicky spinach gravy, rich in protein, calcium and iron.', base='palak', add_txt=PADD, simmer=3)
curry('Matar Paneer', P + '; peas 150', 'Paneer and green peas in a homestyle onion-tomato gravy.', add_txt='Add the peas and simmer 5 minutes, then the paneer.', simmer=5)
curry('Paneer Butter Masala (Lighter)', P, 'A lighter home version of the restaurant favourite, with very little butter and no heavy cream.', base='makhani', add_txt=PADD, simmer=4,
      finish='kasuri 1; cream 15')
curry('Kadai Paneer', P, 'Paneer and crunchy capsicum in a spicy, freshly ground kadai masala.', base='kadai', add_txt=PADD, simmer=3)
curry('Shahi Paneer (Lighter)', P, 'Paneer in a mild, creamy white gravy of onion, cashew and curd.', base='korma', add_txt=PADD, simmer=4, finish='saffron; coriander 4')
curry('Paneer Tikka Masala', P + '; capsicum 80 diced; onion 60 petals', 'Grilled paneer tikka in a smoky, spiced tomato gravy.', base='tikka',
      add_txt='Add the grilled paneer, capsicum and onion to the gravy.', simmer=4)
curry('Paneer Do Pyaza', P, 'Paneer with plenty of onions, cooked two ways.', base='dopyaza', add_txt='Add the paneer and the sautéed onion petals.', simmer=3)
curry('Methi Malai Paneer (Lighter)', P, 'Paneer in a mildly sweet, creamy fenugreek gravy made with milk instead of cream.', base='methi_malai', add_txt=PADD, simmer=3)
curry('Achari Paneer', P, 'Paneer in a tangy gravy flavoured with pickle spices.', base='achari', add_txt=PADD, simmer=4)
curry('Paneer Kolhapuri', P + '; capsicum 60 diced', 'Fiery Kolhapuri-style paneer in a roasted coconut-chilli masala.', base='kolhapuri', add_txt=PADD, simmer=4)
curry('Paneer Korma', P + '; peas 60; carrot 60 diced', 'Paneer and vegetables in a fragrant white korma gravy.', base='korma', simmer=6)
curry('Paneer Coconut Curry', P + '; capsicum 60 diced', 'Paneer simmered in a mildly spiced coconut milk curry.', base='coconut', add_txt=PADD, simmer=4)
curry('Palak Tofu', 'tofu 250 cubed, pressed', 'A vegan palak paneer made with tofu, high in protein and iron.', base='palak', add_txt='Add the tofu and simmer gently for 4 minutes.', simmer=4,
      finish='coriander 4')
curry('Tofu Butter Masala', 'tofu 250 cubed, pressed', 'Tofu in a silky tomato-cashew gravy, a vegan take on butter masala.', base='makhani', simmer=4)
curry('Tofu Matar', 'tofu 250 cubed; peas 150', 'Tofu and green peas in a homestyle masala.', simmer=6)
curry('Kadai Tofu', 'tofu 250 cubed', 'Tofu and capsicum in a spicy kadai masala.', base='kadai', simmer=4)
curry('Mushroom Masala', 'mushroom 300 quartered', 'Mushrooms in a spicy onion-tomato gravy.', simmer=8)
curry('Matar Mushroom', 'mushroom 250 quartered; peas 150', 'Mushrooms and green peas in a homestyle gravy, a dhaba favourite.', simmer=8)
curry('Kadai Mushroom', 'mushroom 300 halved', 'Mushrooms and capsicum in a freshly ground kadai masala.', base='kadai', simmer=6)
curry('Mushroom Palak', 'mushroom 250 sliced', 'Mushrooms simmered in a spinach gravy.', base='palak', simmer=6)
curry('Mushroom Do Pyaza', 'mushroom 300 halved', 'Mushrooms cooked with plenty of onions.', base='dopyaza', simmer=6)
curry('Chettinad Mushroom', 'mushroom 300 halved', 'Mushrooms in a fiery, peppery Chettinad masala.', base='chettinad', simmer=8)
curry('Mixed Vegetable Curry', 'carrot 100 diced; beans 80; peas 80; cauliflower 100; potato 100 cubed', 'A homestyle curry of mixed vegetables.', simmer=12)
curry('Veg Kolhapuri', 'carrot 100 diced; beans 80; peas 80; cauliflower 100; capsicum 80', 'Spicy Maharashtrian vegetable curry in a roasted coconut masala.', base='kolhapuri', simmer=12)
curry('Navratan Korma (Lighter)', 'carrot 80; beans 80; peas 80; cauliflower 80; potato 80; paneer 60; pineapple 60; cashew 10; raisin 9',
      'A mild, festive nine-jewel korma of vegetables, paneer and fruit in a cashew-curd gravy.', base='korma', simmer=10)
curry('Veg Kadai', 'carrot 80; beans 80; cauliflower 100; capsicum 80; babycorn 60', 'Mixed vegetables in a spicy kadai masala.', base='kadai', simmer=10)
curry('Veg Jalfrezi', 'carrot 80 julienned; beans 80; capsicum 100 strips; onion 80 petals; paneer 60 strips; tomato 60', 'A tangy, semi-dry stir-fried vegetable curry.', base='kadai', simmer=5,
      finish='vinegar 5; coriander 6')
curry('Kerala Vegetable Stew', 'potato 150 cubed; carrot 100; beans 80; peas 60', 'Mild, fragrant Kerala stew of vegetables in coconut milk, perfect with appam.', base='stew', simmer=12,
      add_txt='Add the vegetables and cook covered until tender, then add the remaining coconut milk and heat without boiling.', finish='curryleaf 1')
curry('Vegetable Kurma (South Indian)', 'carrot 100; beans 80; peas 80; potato 100; cauliflower 80', 'South Indian vegetable kurma in a coconut-fennel gravy.', base='coconut', simmer=12)
curry('Dum Aloo (Lighter)', 'potato 400 baby potatoes, boiled and peeled', 'Baby potatoes slow-cooked in a curd-based Kashmiri-style gravy.', base='achari', simmer=12,
      prep='Boil the baby potatoes until just tender, peel and prick them all over with a fork.')
curry('Aloo Matar', 'potato 250 cubed; peas 150', 'Potatoes and peas in a thin, homestyle tomato gravy.', simmer=12)
curry('Aloo Tamatar', 'potato 350 cubed', 'A thin, tangy potato-tomato curry, the classic partner for puri and paratha.', simmer=12)
curry('Baingan Masala', 'brinjal 400 cubed', 'Brinjal cubes in a spicy onion-tomato gravy.', simmer=12)
curry('Bhindi Masala Gravy', 'bhindi 350 sautéed', 'Lightly crisp okra in a tangy tomato gravy.', simmer=5, prep='Wipe the okra dry, cut into 1-inch pieces and sauté in 1 tsp oil until no longer slimy.')
curry('Gobi Masala', 'cauliflower 400 florets', 'Cauliflower in a spicy, tangy gravy.', simmer=10)
curry('Lauki Kofta Curry (Appe-pan Koftas)', 'lauki 300 grated, squeezed; besan 50; gchilli 3; ginger 5; salt', 'Soft bottle gourd koftas made in an appe pan with little oil, simmered in a tomato gravy.',
      simmer=3, prep='Mix the squeezed lauki with besan, chilli, ginger and salt; shape into balls and cook in a greased appe pan for 10 minutes, turning until golden all over.',
      add_txt='Add the koftas just before serving so they stay soft but do not break.')
curry('Methi Matar Malai (Lighter)', 'peas 200', 'Green peas in a mild, creamy fenugreek gravy made with milk.', base='methi_malai', simmer=5)
curry('Malai Kofta (Lighter, Baked Koftas)', 'paneer 120 grated; potato 120 boiled, mashed; cornflour 8; cashew 8 chopped; raisin 9; salt',
      'Paneer-potato koftas baked instead of fried, in a mild cashew-tomato gravy.', base='makhani', simmer=2,
      prep='Mix paneer, potato, cornflour and salt; stuff each ball with a few cashew bits and raisins. Bake at 200°C for 15 minutes or cook in an appe pan until golden.',
      add_txt='Place the koftas in a serving bowl and pour the hot gravy over them just before serving.')
curry('Chana Paneer Masala', 'paneer 120 cubed; chickpea 120 boiled', 'Chickpeas and paneer in a punchy chole masala, double protein.', simmer=8, finish='chole 3; coriander 6')
curry('Kathal Masala Curry', 'jackfruit 400 cubed, boiled', 'Raw jackfruit in a rich, meat-style masala gravy.', simmer=12)
curry('Veg Chettinad', 'carrot 100; beans 80; potato 100; peas 80; cauliflower 80', 'Mixed vegetables in a peppery Chettinad masala.', base='chettinad', simmer=12)
curry('Sweet Corn Palak', 'corn 200', 'Sweet corn in a creamy spinach gravy.', base='palak', simmer=5)
curry('Capsicum Besan Curry', 'capsicum 300 diced; besan 30 roasted', 'Capsicum in a besan-thickened tangy gravy, a Rajasthani-style curry.', simmer=6)
curry('Arbi Curry', 'arbi 350 boiled, peeled, sliced', 'Colocasia slices in a tangy ajwain-tomato gravy.', simmer=10)
curry('Lotus Stem Curry (Nadru Masala)', 'lotusstem 300 sliced, boiled', 'Lotus stem in a Kashmiri-style onion-tomato gravy.', simmer=10)
curry('Mushroom Matar Korma', 'mushroom 300 halved; peas 80', 'Mushrooms and peas in a mild white korma gravy.', base='korma', simmer=6)
curry('Paneer Stew', P + '; carrot 80; beans 60', 'Paneer and vegetables in a mild Kerala-style coconut stew.', base='stew', simmer=6)
curry('Pumpkin Coconut Curry', 'pumpkin 400 cubed', 'Sweet pumpkin simmered in a mildly spiced coconut gravy.', base='coconut', simmer=10)
curry('Raw Banana Curry', 'rawbanana 300 cubed', 'Raw banana cubes in a tangy coconut-tomato curry.', base='coconut', simmer=12)
curry('Soya Chunks Korma', 'soya 80 boiled, squeezed; peas 80', 'Soya chunks in a mild korma gravy, high in protein.', base='korma', simmer=8)
curry('Mushroom Butter Masala (Lighter)', 'mushroom 300 quartered', 'Mushrooms in a silky tomato-cashew gravy.', base='makhani', simmer=6)
curry('Achari Aloo Baingan', 'potato 200 cubed; brinjal 200 cubed', 'Potato and brinjal in a tangy pickle-spiced gravy.', base='achari', simmer=12)
curry('Bhindi Do Pyaza', 'bhindi 300 sautéed', 'Okra cooked with plenty of onions.', base='dopyaza', simmer=4, prep='Wipe the okra dry, cut in 1-inch pieces and sauté in 1 tsp oil until no longer slimy.')
curry('Paneer Bhurji Masala (Gravy)', 'paneer 200 crumbled; peas 60', 'Crumbled paneer in a spicy onion-tomato gravy.', simmer=4)
