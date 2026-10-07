"""Snacks & starters: dhokla, muthia, cutlets & tikkis, tikkas, sundal, roasted snacks, chaat, air-fried pakoras."""
from core import recipe
from util import names, allnames

C = 'Snacks & Starters'
SNACK_SERVE = ['green chutney or hung curd dip, and a cup of tea or buttermilk.', '<b>Best time:</b> evening snack or a starter.']


def steamed(name, batter, desc, temper='oil 8; mustard 3; sesame 3; curryleaf 1.5; gchilli 3 slit; hing; water 40; lemon 5', leaven='eno 5', rest=15, mins=15,
            sub='Dhokla', serves=4, prep_txt='', tags=()):
    g = [('For the Batter', f'{batter}; salt' + (f'; {leaven}' if leaven else '')), ('For the Tempering', temper), ('To Garnish', 'coriander 8; coconut 10')]
    steps = [
        f'Make the batter: {prep_txt or f"Mix the {allnames(batter)} and salt with enough water to make a smooth, thick, pourable batter."}',
    ] + ([f'Rest: Cover and rest the batter for {rest} minutes.'] if rest else []) + [
        'Prepare the steamer: Boil water in a steamer or large pot with a stand. Grease a 7-inch tin or plate with oil.',
        f'Add the leavening: Just before steaming, add the {names(leaven)} with 1 tsp water and stir gently in one direction until frothy.' if leaven else
        'Stir: Stir the batter gently once.',
        f'Steam: Pour into the greased tin immediately and steam on medium-high flame for {mins} minutes, until a toothpick inserted in the centre comes out clean.',
        'Cool & cut: Rest for 5 minutes, then cut into squares or diamonds.',
        'Temper: Heat oil, crackle the mustard seeds and sesame, add curry leaves, green chillies and hing. Add water and lemon juice and pour evenly over the pieces.',
        'Garnish & serve: Sprinkle with coriander and coconut and serve.',
    ]
    recipe(name, C, desc, serves, 10 + rest, mins, g, steps,
           tips=['Do not open the steamer for the first 10 minutes; the batter can collapse.', 'Pour the tempering water slowly so the pieces stay soft and moist.'],
           serve=SNACK_SERVE, store='keeps in the fridge for 1 day; best at room temperature.', sub=sub, tags=('kids',) + tuple(tags))


steamed('Khaman Dhokla', 'besan 150; curd 60; ginger 8 grated; gchilli 3; haldi 0.5; sugar 6; lemon 10', 'Soft, spongy steamed gram flour cakes from Gujarat, light and high in protein.')
steamed('Rava Dhokla', 'rava 170; curd 200; ginger 5; gchilli 3; carrot 40 grated', 'Instant semolina and curd dhokla, soft and mildly tangy.', rest=20)
steamed('Moong Dal Dhokla', 'moong 150 soaked 4 hours and ground; ginger 8; gchilli 3; haldi 0.3', 'Protein-rich steamed moong dal cakes, ideal for diabetics.',
        prep_txt='Grind the soaked moong dal with ginger and chilli to a smooth, thick batter.')
steamed('Oats Dhokla', 'oats 90 powdered; rava 50; curd 150; carrot 40 grated; gchilli 3; ginger 5', 'Fibre-rich steamed oats dhokla.', rest=15)
steamed('Khatta Dhokla', 'rice 150; urad 50; curd 60; ginger 8; gchilli 3', 'White, tangy Gujarati dhokla from a fermented rice and urad batter.', leaven='soda 0.3',
        prep_txt='Soak rice and urad dal for 6 hours, grind coarsely with curd and ferment overnight. Add ginger, chilli and salt.', rest=0, mins=15)
steamed('Palak Dhokla', 'besan 140; spinach 80 blanched, puréed; curd 60; ginger 5; gchilli 3', 'Green khaman dhokla with spinach purée.')
steamed('Vegetable Rava Dhokla', 'rava 170; curd 200; carrot 40 grated; peas 30; capsicum 30 chopped; ginger 5', 'Instant semolina dhokla loaded with vegetables.', rest=20)
steamed('Quinoa Dhokla', 'quinoa 120 soaked and ground; besan 40; curd 100; ginger 5; gchilli 3', 'Protein-rich dhokla from ground quinoa and besan.')
steamed('Millet Dhokla', 'foxtail 120 soaked and ground; curd 100; ginger 5; gchilli 3', 'Light dhokla made from foxtail millet batter.')
steamed('Sandwich Dhokla', 'rava 170; curd 200; ginger 5; gchilli 3', 'Two-layered rava dhokla with green chutney in the middle.', rest=20,
        prep_txt='Make the rava batter and divide it in two. Steam the first layer for 7 minutes, spread green chutney over it, pour the second half and steam 10 minutes more.')
steamed('Steamed Handvo', 'rice 80; toor 30; chanadal 30; urad 20; curd 80; lauki 150 grated; carrot 50 grated; ginger 8; gchilli 3; sesame 5', 'Gujarati savoury vegetable cake made from a fermented rice-lentil batter.',
        leaven='eno 5', prep_txt='Soak the rice and dals for 5 hours, grind coarsely with curd and ferment 6–8 hours. Mix in the vegetables, ginger and chilli.', mins=35, sub='Handvo')
steamed('Besan Corn Dhokla', 'besan 130; corn 80 crushed; curd 60; ginger 5; gchilli 3; haldi 0.3', 'Khaman dhokla with crushed sweet corn, loved by children.')


def muthia(name, mix, desc, sub='Muthia'):
    g = [('For the Muthia', f'{mix}; ginger 5 grated; gchilli 3; haldi 0.5; chilli 1; sesame 5; lemon 10; sugar 3; salt; soda 0.3; oil 5'),
         ('For the Tempering', 'oil 8; mustard 3; sesame 5; curryleaf 1.5; hing')]
    steps = [
        f'Make the dough: Mix the {allnames(mix)} with ginger, chilli, spices, sesame, lemon juice, sugar, salt, soda and oil. Knead into a soft dough without water (or just a few drops).',
        'Shape: Grease your palms and shape into 4–5 cylindrical rolls about 1 inch thick.',
        'Steam: Steam the rolls on a greased plate for 20–25 minutes, until a knife comes out clean.',
        'Cool & slice: Cool for 10 minutes and slice into ½-inch rounds.',
        'Temper: Heat oil, crackle mustard and sesame, add curry leaves and hing, then the muthia slices.',
        'Crisp: Toss on medium flame for 4–5 minutes until lightly crisp.',
        'Serve: Garnish with coriander and serve with green chutney and tea.',
    ]
    recipe(name, C, desc, 4, 15, 30, g, steps,
           tips=['Do not add water; the vegetables release enough moisture.', 'Steamed muthia keep in the fridge for 2 days; temper just before serving.'],
           serve=SNACK_SERVE, store='steamed rolls keep in the fridge for 2 days.', sub=sub)


muthia('Methi Muthia (Steamed)', 'atta 80; besan 40; rava 20; methi 100 chopped', 'Gujarati steamed fenugreek dumplings, lightly tempered.')
muthia('Lauki Muthia', 'atta 80; besan 40; rava 20; lauki 200 grated', 'Soft steamed bottle gourd dumplings.')
muthia('Palak Muthia', 'atta 80; besan 40; rava 20; spinach 120 chopped', 'Spinach muthia, steamed and tempered.')
muthia('Cabbage Muthia', 'atta 80; besan 40; rava 20; cabbage 180 grated', 'Steamed cabbage muthia, crunchy outside after tempering.')
muthia('Oats Methi Muthia', 'oats 80 powdered; besan 40; methi 80 chopped', 'Fibre-rich steamed muthia with oats and fenugreek.')
muthia('Jowar Lauki Muthia', 'jowar 100; besan 30; lauki 180 grated', 'Gluten-free steamed muthia with jowar and lauki.')


def roll_steamed(name, desc, batter, steps_txt, sub):
    g = [('Ingredients', batter), ('For the Tempering', 'oil 8; mustard 3; sesame 5; curryleaf 1; hing'), ('To Garnish', 'coconut 15; coriander 6')]
    recipe(name, C, desc, 4, 20, 25, g, steps_txt + ['Temper: Heat oil, crackle mustard and sesame, add curry leaves and hing and pour over.',
                                                    'Garnish & serve: Sprinkle coconut and coriander and serve at room temperature.'],
           tips=['Keep all the components ready before you start; the process moves quickly.'], serve=SNACK_SERVE,
           store='keeps in the fridge for 1 day.', sub=sub, level='Medium')


roll_steamed('Khandvi', 'Silky, melt-in-the-mouth Gujarati gram flour rolls, high in protein.', 'besan 100; curd 200; water 200; haldi 0.3; ginger 5; gchilli 3; salt',
             ['Mix the batter: Whisk besan, curd, water, turmeric, ginger-chilli paste and salt until completely smooth.',
              'Cook: Cook on medium-low flame, stirring continuously, for 8–10 minutes until very thick and glossy.',
              'Test: Spread a little on a greased plate; if it sets and peels off in 1 minute, it is ready.',
              'Spread: Quickly spread thin layers on greased steel plates or the back of a thali with a spatula.',
              'Roll: Cool for 5 minutes, cut into 2-inch-wide strips and roll each strip tightly.'], 'Khandvi')
roll_steamed('Patra (Steamed Colocasia Rolls)', 'Gujarati colocasia leaf rolls with a sweet-sour besan paste, steamed and tempered.',
             'colleaf 60; besan 100; tamarind 15; jaggery 15; chilli 2; haldi 0.5; dhania 2; salt; water 100',
             ['Prepare the leaves: Wash the leaves, remove the thick veins and pat dry.',
              'Make the paste: Mix besan with tamarind, jaggery, spices and water into a thick paste.',
              'Layer: Place a leaf vein-side up, spread paste thinly, place another leaf over it and repeat for 3–4 layers.',
              'Roll: Fold in the sides and roll tightly into a log.',
              'Steam: Steam for 25 minutes. Cool and slice into rounds.'], 'Patra')
roll_steamed('Kothimbir Vadi (Steamed & Pan-crisped)', 'Maharashtrian coriander-besan squares, steamed and then crisped with very little oil.',
             'coriander 100 chopped; besan 100; ricefl 15; sesame 5; gchilli 3; ginger 5; haldi 0.5; chilli 1; salt; water 60',
             ['Mix: Mix all the ingredients into a thick dough-like batter.',
              'Steam: Spread in a greased tin and steam for 20 minutes.',
              'Cut: Cool completely and cut into squares.',
              'Pan-crisp: Shallow-fry or air-fry the squares with a few drops of oil until crisp on both sides.'], 'Vadi')


def tikki(name, mix, desc, binder='', cook='pan', prep_txt='', serves=4, sub='Cutlet / Tikki', tags=()):
    g = [('For the Mixture', mix + (f'; {binder}' if binder else '')), ('For Cooking', 'oil 15')]
    steps = [
        f'Prepare: {prep_txt or f"Boil, steam or chop the {names(mix)} as listed and let them cool."}',
        f'Mix: Combine everything in a bowl and mash well. The mixture should hold its shape when pressed; add a little more {names(binder) or "flour"} if it is too soft.',
        'Shape: Grease your palms and shape into 8 round, flat tikkis about ½ inch thick.',
        'Chill: Refrigerate for 15 minutes so they hold firm while cooking.',
        ('Pan-roast: Heat a non-stick tawa, brush with oil and cook the tikkis on medium flame for 3–4 minutes per side until golden and crisp.' if cook == 'pan' else
         'Air-fry: Brush with oil and air-fry at 190°C for 12–14 minutes, turning halfway, until golden. Or bake at 200°C for 20 minutes.'),
        'Serve: Serve hot with green chutney or hung curd dip.',
    ]
    recipe(name, C, desc, serves, 20, 20, g, steps,
           tips=['Chilling the tikkis before cooking stops them from breaking.', 'Use a non-stick pan and a light brush of oil; there is no need to deep-fry.'],
           serve=SNACK_SERVE + ['Stuff in a whole-wheat wrap with salad for a quick meal.'], store='uncooked tikkis keep in the fridge for 1 day or can be frozen for 1 month.', sub=sub,
           tags=('kids',) + tuple(tags))


TS = 'gchilli 3; ginger 5; coriander 8; garam 1; amchur 1; chaat 1; salt'
tikki('Vegetable Cutlet', f'potato 200 boiled; carrot 60 grated; beans 50 finely chopped; peas 50 boiled; {TS}', 'Crisp-outside, soft-inside vegetable cutlets, pan-roasted with little oil.',
      binder='oats 30 powdered')
tikki('Oats Vegetable Tikki', f'oats 80 powdered; potato 120 boiled; carrot 50 grated; peas 40; {TS}', 'Fibre-rich oats and vegetable tikkis.')
tikki('Soya Cutlet', f'soyagran 80 soaked, squeezed; potato 150 boiled; onion 40; {TS}', 'High-protein soya granule cutlets.', binder='besan 20')
tikki('Beetroot Cutlet', f'beet 150 grated, squeezed; potato 150 boiled; {TS}', 'Bright, sweet beetroot cutlets.', binder='oats 30 powdered')
tikki('Paneer Cutlet', f'paneer 150 grated; potato 100 boiled; capsicum 30; {TS}', 'Soft paneer cutlets with a crisp crust.', binder='oats 20 powdered')
tikki('Hara Bhara Kabab', f'spinach 150 blanched, chopped; peas 120 boiled; potato 120 boiled; paneer 50; {TS}', 'Green kebabs of spinach, peas and potato, a party favourite.', binder='besan 25 roasted')
tikki('Rajma Tikki', f'rajma 120 soaked, boiled, mashed; potato 80 boiled; onion 40; {TS}', 'Protein-rich kidney bean patties.', binder='oats 20 powdered')
tikki('Chana Tikki', f'chickpea 120 soaked, boiled, mashed; onion 40; {TS}', 'Chickpea patties, crisp and high in protein.', binder='besan 20')
tikki('Aloo Tikki (Pan-roasted)', f'potato 350 boiled; peas 40; {TS}', 'The classic street-style potato tikki, pan-roasted instead of fried.', binder='cornflour 10')
tikki('Sweet Potato Tikki', f'sweetpotato 300 boiled; {TS}', 'Mildly sweet, crisp sweet potato tikkis.', binder='rajgira 30')
tikki('Poha Cutlet', f'poha 80 rinsed; potato 150 boiled; carrot 40 grated; {TS}', 'Crisp cutlets made with poha and potato.')
tikki('Moong Dal Tikki', f'moong 120 soaked 3 hours, coarsely ground; onion 40; {TS}', 'Crisp moong dal patties, high in protein.', binder='ricefl 15')
tikki('Sabudana Vada (Air-fried)', 'sabudana 120 soaked; potato 150 boiled; peanut 40 roasted, crushed; gchilli 3; jeera 1; lemon 5; salt', 'Maharashtrian sago patties air-fried instead of deep-fried.',
      cook='air', tags=('fast',))
tikki('Corn Tikki', f'corn 150 coarsely crushed; potato 120 boiled; capsicum 30; {TS}', 'Sweet corn and potato tikkis.', binder='besan 20')
tikki('Quinoa Tikki', f'quinoa 80 cooked; potato 100 boiled; carrot 40 grated; {TS}', 'Protein-rich quinoa patties.', binder='besan 20')
tikki('Mushroom Galouti Kabab', 'mushroom 300 finely chopped, cooked dry; roastchana 40 powdered; onion 40 fried; ginger 5; garlic 6; garam 1; cardamom 0.4; salt',
      'Soft, melt-in-the-mouth mushroom kebabs inspired by the Lucknowi galouti.', binder='')
tikki('Dal Tikki (Leftover Dal)', f'chanadal 120 cooked thick; onion 40; {TS}', 'Tikkis made from thick cooked chana dal, a clever use of leftovers.', binder='besan 25')
tikki('Lauki Tikki', f'lauki 250 grated, squeezed; besan 50; onion 30; {TS}', 'Light bottle gourd patties.', binder='ricefl 15')
tikki('Fish Cutlet', 'fish 300 steamed, flaked; potato 120 boiled; onion 50; ginger 5; gchilli 3; garam 1; pepper 1; coriander 8; salt', 'Kerala-style fish cutlets, pan-roasted.',
      binder='oats 30 powdered')
tikki('Chicken Cutlet', 'chickenmince 300; potato 100 boiled; onion 50; ginger 5; garlic 6; gchilli 3; garam 1; coriander 8; salt', 'Juicy chicken mince cutlets.', binder='oats 30 powdered',
      prep_txt='Cook the chicken mince with ginger, garlic and spices until dry and fully cooked; cool.')
tikki('Chicken Shami Kabab', 'chickenmince 300; chanadal 60 soaked; onion 40; ginger 5; garlic 6; redchilli 2; garam 1; mint 4; egg 50; salt', 'Chicken and chana dal shami kebabs, soft and spiced.',
      prep_txt='Pressure-cook the chicken with chana dal, ginger, garlic and whole spices with ½ cup water for 2 whistles; dry it out completely, then grind coarsely.')
tikki('Mutton Shami Kabab', 'muttonmince 300; chanadal 60 soaked; onion 40; ginger 5; garlic 6; redchilli 2; garam 1; mint 4; egg 50; salt', 'The classic Mughlai mutton shami kebab, pan-roasted.',
      prep_txt='Pressure-cook the mutton with chana dal and spices for 5 whistles; dry it out completely and grind.')
tikki('Egg Cutlet', 'egg 200 hard-boiled, grated; potato 150 boiled; onion 40; gchilli 3; pepper 1; coriander 6; salt', 'Boiled egg and potato cutlets.', binder='oats 20 powdered')
tikki('Tofu Tikki', f'tofu 200 crumbled; potato 100 boiled; {TS}', 'Vegan high-protein tofu patties.', binder='oats 20 powdered')


def tikka(name, main, desc, extra='capsicum 100 squares; onion 100 petals', serves=3, sub='Tikka / Grill', mins=12):
    g = [('Main', f'{main}; {extra}'), ('For the Marinade', 'hungcurd 120; besan 10 roasted; ginger 8; garlic 8; chilli 2; haldi 0.5; garam 1; tandoori 4; kasuri 1; lemon 10; mustardoil 10; salt'),
         ('To Serve', 'onion 50 rings; lemon 10; chaat 1')]
    steps = [
        f'Prepare: Cut the {names(main)}, capsicum and onion into even 1½-inch pieces.',
        'Make the marinade: Whisk hung curd with roasted besan, ginger-garlic, spices, lemon juice, mustard oil and salt into a thick paste.',
        'Marinate: Coat everything well and refrigerate for at least 30 minutes (up to 4 hours).',
        'Skewer: Thread onto skewers (soak wooden ones in water for 20 minutes first), alternating with capsicum and onion.',
        f'Grill: Grill in an oven, air fryer or on a grill pan at 200°C for {mins}–{mins + 3} minutes, turning once, until charred at the edges. Brush with a few drops of oil halfway.',
        'Serve: Sprinkle chaat masala and lemon juice and serve hot with onion rings and mint chutney.',
    ]
    recipe(name, C, desc, serves, 40, mins + 3, g, steps,
           tips=['Use thick hung curd so the marinade clings and does not drip.', 'Roasted besan in the marinade helps it stick and adds a smoky flavour.'],
           serve=['mint chutney and an onion-cucumber salad.', '<b>Best time:</b> starter or a high-protein snack.'],
           store='marinated pieces keep in the fridge for 1 day; grill just before serving.', sub=sub, level='Medium')


tikka('Paneer Tikka', 'paneer 250 cubed', 'Smoky, charred cubes of spiced paneer with peppers and onion, made in the oven or air fryer.')
tikka('Tofu Tikka', 'tofu 280 cubed, pressed', 'A vegan-friendly protein starter of spiced, grilled tofu.')
tikka('Mushroom Tikka', 'mushroom 300 whole', 'Juicy grilled mushrooms in a tandoori marinade.')
tikka('Gobhi Tikka', 'cauliflower 400 large florets, blanched', 'Tandoori cauliflower florets, charred and crisp.')
tikka('Soya Tikka', 'soya 100 boiled, squeezed', 'High-protein grilled soya chunks in a tandoori marinade.', extra='capsicum 80; onion 80')
tikka('Malai Paneer Tikka (Lighter)', 'paneer 250 cubed', 'Creamy, mildly spiced paneer tikka with a cashew-curd marinade.', extra='cashew 15 ground; capsicum 60')
tikka('Achari Paneer Tikka', 'paneer 250 cubed', 'Paneer tikka in a tangy pickle-spice marinade.', extra='saunf 2; kalonji 1; methiseed 0.5; capsicum 80')
tikka('Tandoori Aloo', 'potato 400 baby potatoes, par-boiled', 'Baby potatoes in a tandoori marinade, grilled until crisp.', extra='onion 80')
tikka('Tandoori Broccoli', 'broccoli 350 florets, blanched', 'Charred broccoli florets in a creamy tandoori marinade.', extra='onion 60')
tikka('Tandoori Baby Corn', 'babycorn 250', 'Grilled tandoori baby corn with peppers.')


def sundal(name, pulse, desc, cook_txt, serves=3):
    g = [('Ingredients', f'{pulse}; salt'), ('For the Tempering', 'coconutoil 8; mustard 3; urad_t 4; redchilli 2; curryleaf 1.5; hing; gchilli 3; ginger 5'),
         ('To Finish', 'coconut 30; lemon 10; coriander 6')]
    steps = [
        f'Cook: {cook_txt}',
        'Drain: Drain well; keep the water for soups or dal.',
        'Temper: Heat coconut oil, crackle mustard seeds, add urad dal, dry red chillies, curry leaves, hing, green chilli and ginger.',
        f'Toss: Add the cooked {names(pulse)} and salt and toss for 2 minutes.',
        'Finish: Switch off, add the grated coconut, lemon juice and coriander and mix.',
        'Serve: Serve warm as an evening snack.',
    ]
    recipe(name, C, desc, serves, 10, 15, g, steps,
           tips=['Cook the legumes until soft but still whole; mushy legumes make a sticky sundal.'],
           serve=['a cup of tea or buttermilk.', '<b>Best time:</b> evening snack; a traditional Navratri offering.'],
           store='keeps in the fridge for 1 day.', sub='Sundal', tags=('kids',))


sundal('Chickpea Sundal', 'chickpea 200', 'Tamil-style chickpeas tossed with coconut and curry leaves, a protein-rich snack.', 'Soak overnight and pressure-cook for 4–5 whistles.')
sundal('Peanut Sundal', 'peanut 150 raw', 'Boiled peanuts tempered with coconut and curry leaves.', 'Pressure-cook the raw peanuts with salt for 3–4 whistles.')
sundal('Corn Sundal', 'corn 300', 'Sweet corn tossed with coconut and curry leaves.', 'Boil or steam the corn for 5 minutes.')
sundal('Green Moong Sundal', 'gmoong 180', 'Whole moong tempered South Indian style.', 'Soak 4 hours and pressure-cook for 2 whistles until just soft.')
sundal('Kala Chana Sundal', 'kalachana 200', 'Black chickpea sundal, rich in iron.', 'Soak overnight and pressure-cook for 5–6 whistles.')
sundal('Rajma Sundal', 'rajma 180', 'Kidney bean sundal with coconut.', 'Soak overnight and pressure-cook for 6 whistles until fully soft.')
sundal('Lobia Sundal', 'lobia 180', 'Black-eyed bean sundal.', 'Soak 6 hours and pressure-cook for 3 whistles.')
sundal('Sweet Corn and Peas Sundal', 'corn 180; peas 120', 'A colourful sundal of corn and peas.', 'Steam the corn and peas for 6 minutes.')


def roasted(name, base, desc, spice, mins=10, serves=3, sub='Roasted Snack', fat='ghee 8', tags=()):
    g = [('Ingredients', f'{base}; {fat}; {spice}')]
    steps = [
        f'Prepare: Measure out the {names(base)}.',
        f'Roast: Heat the {names(fat) or "ghee"} in a wide pan on low flame. Add the {names(base)} and roast, stirring often, for {mins} minutes until crisp and crunchy.',
        'Test: Cool one piece for a few seconds and bite; it should break with a crunch.',
        f'Season: Switch off the flame and sprinkle the {allnames(spice)}. Toss well.',
        'Cool & store: Cool completely before storing in an airtight jar.',
    ]
    recipe(name, C, desc, serves, 5, mins, g, steps,
           tips=['Roast on low heat; high heat browns the outside while the inside stays chewy.', 'Store only after cooling completely, or it turns soggy.'],
           serve=['a cup of tea, green tea or buttermilk.', 'A perfect office or travel snack.'],
           store='keeps crisp in an airtight jar for 1–2 weeks.', sub=sub, tags=('kids',) + tuple(tags))


roasted('Masala Makhana', 'makhana 60', 'Crunchy roasted fox nuts with spices, a light, low-fat snack.', 'haldi 0.3; chilli 0.5; chaat 1; salt')
roasted('Pudina Makhana', 'makhana 60', 'Roasted makhana with dried mint and black salt.', 'mint 2 dried, powdered; blacksalt; pepper 0.5')
roasted('Peri Peri Makhana', 'makhana 60', 'Makhana tossed in a smoky, spicy peri-peri style spice mix.', 'chilli 1; oregano 0.5; garlic 2 powder; amchur 0.5; salt')
roasted('Makhana Chivda', 'makhana 50; peanut 20; almond 10; curryleaf 1', 'A crunchy mix of makhana, peanuts and almonds.', 'haldi 0.3; chilli 0.3; salt; sugar 2')
roasted('Roasted Chana Masala', 'roastchana 100', 'Roasted chana tossed with lemon and spices, high in protein.', 'chaat 1; chilli 0.5; lemon 5; salt', mins=3, fat='oil 3')
roasted('Poha Chivda (Roasted)', 'poha 100 thin; peanut 25; roastchana 20; curryleaf 1.5; gchilli 3', 'A light roasted thin-poha chivda, made with very little oil.', 'haldi 0.5; sugar 3; salt', mins=12, fat='oil 10')
roasted('Oats Chivda', 'oats 100; peanut 25; almond 10; curryleaf 1.5', 'A crunchy, fibre-rich chivda of roasted oats and nuts.', 'haldi 0.3; chilli 0.5; chaat 1; salt', mins=12, fat='oil 8')
roasted('Masala Peanuts (Roasted)', 'peanut 120', 'Dry-roasted peanuts with a light spice coating.', 'chilli 0.5; chaat 1; salt', mins=10, fat='oil 3')
roasted('Spiced Roasted Seeds Mix', 'pumpkinseed 30; sunseed 30; flax 15; sesame 10', 'A mineral-rich roasted seed mix to sprinkle or snack on.', 'chaat 0.5; salt', mins=5, fat='oil 2')
roasted('Murmura Chivda', 'puffrice 60; peanut 25; roastchana 20; curryleaf 1.5', 'Light puffed rice chivda.', 'haldi 0.3; chilli 0.3; salt', mins=6, fat='oil 6')
roasted('Roasted Almond Mix', 'almond 60; walnut 30; pumpkinseed 20', 'Lightly spiced roasted nuts and seeds.', 'pepper 0.5; salt', mins=8, fat='oil 2')
roasted('Ragi Crackers (Baked)', 'ragi 80; atta 40; sesame 5; ajwain 1', 'Crisp baked ragi crackers, a healthy alternative to biscuits.', 'salt; chilli 0.5', mins=18, fat='oil 10')


def chaat(name, base, desc, toppings='onion 40; tomato 40; coriander 6; gchilli 3', dress='lemon 10; chaat 2; jeerapowder 1; chilli 0.5; salt', chutneys='', serves=2, sub='Chaat'):
    g = [('Base', base), ('Toppings', toppings), ('Dressing', dress + (f'; {chutneys}' if chutneys else ''))]
    steps = [
        f'Prepare the base: Keep the {names(base)} ready (cooked and cooled where needed).',
        f'Chop the toppings: Finely chop the {names(toppings)}.',
        'Mix: In a bowl, combine the base and toppings.',
        'Dress: Add lemon juice, chaat masala, roasted cumin, chilli powder and salt' + (' and drizzle the chutneys' if chutneys else '') + '. Toss well.',
        'Serve: Serve immediately so it stays crunchy.',
    ]
    recipe(name, C, desc, serves, 15, 0, g, steps, tips=['Mix chaat just before eating; it turns soggy if it waits.'],
           serve=['enjoy on its own as an evening snack.', 'Use chutneys sparingly; they add sugar and salt.'], store='best eaten immediately.', sub=sub)


chaat('Sprouts Bhel', 'sprouts 120; puffrice 20; roastchana 15; peanut 10', 'A protein-rich bhel with sprouts, puffed rice and roasted chana.',
      chutneys='mint 5 as green chutney; tamarind 5')
chaat('Murmura Bhel (Light)', 'puffrice 40; roastchana 15; peanut 15', 'Light, crunchy Mumbai-style puffed rice bhel with fresh vegetables.',
      toppings='onion 40; tomato 40; cucumber 40; rawmango 20; coriander 6', chutneys='tamarind 5; dates 8')
chaat('Corn Bhel', 'corn 150 boiled; puffrice 20', 'Sweet corn bhel with lemon and chaat masala.')
chaat('Makhana Bhel', 'makhana 30 roasted; peanut 15', 'Roasted makhana tossed with vegetables and chutney.', chutneys='mint 5 as green chutney')
chaat('Aloo Chana Chaat', 'potato 150 boiled, cubed; chickpea 80 boiled', 'Tangy potato and chickpea chaat.', chutneys='tamarind 5; mint 5')
chaat('Dahi Sprouts Chaat', 'sprouts 120; curd 120 whisked', 'Moong sprouts topped with curd, chutney and spices.', chutneys='tamarind 5; mint 5')
chaat('Fruit and Sprouts Chaat', 'sprouts 100; apple 80; pomegranate 30; cucumber 60', 'A sweet-tangy chaat of fruits and sprouts.')
chaat('Ragda Chaat (Lighter)', 'whitepeas 80 cooked as ragda; potato 80 boiled', 'Mumbai ragda chaat without the fried patties.', chutneys='tamarind 5; mint 5')
chaat('Paneer Chaat', 'paneer 150 cubed, lightly roasted', 'Roasted paneer cubes tossed with vegetables and chaat masala.')
chaat('Shakarkandi Chaat', 'sweetpotato 250 roasted, cubed', 'Delhi-style roasted sweet potato chaat with lemon and spices.', toppings='coriander 6', dress='lemon 15; chaat 2; blacksalt')


def airfried(name, main, desc, coat='besan 60; ricefl 15; ajwain 1; haldi 0.3; chilli 1; salt; water 50', serves=3, sub='Air-fried Snack', mins=12):
    g = [('Main', main), ('For the Coating', coat), ('For Cooking', 'oil 8')]
    steps = [
        f'Prepare: Wash, dry and slice the {names(main)} as listed.',
        f'Coat: Mix the coating ingredients into a thick batter (or dry rub) and toss the {names(main)} so every piece is coated.',
        'Preheat: Preheat the air fryer to 190°C for 3 minutes and brush the basket with oil.',
        'Arrange: Place the pieces in a single layer without overlapping. Spray or brush lightly with oil.',
        f'Air-fry: Cook for {mins}–{mins + 3} minutes, shaking or turning halfway, until golden and crisp.',
        'Serve: Serve hot with green chutney.',
    ]
    recipe(name, C, desc, serves, 15, mins + 3, g, steps,
           tips=['Do not overcrowd the basket; crispness needs hot air around every piece.',
                 'No air fryer? Bake at 210°C for 18–20 minutes, turning once.'],
           serve=SNACK_SERVE, store='best eaten hot and fresh.', sub=sub, tags=('kids',))


airfried('Onion Pakora (Air-fried)', 'onion 250 thinly sliced; gchilli 3; coriander 6', 'Crisp onion pakoras made in an air fryer with 90% less oil.')
airfried('Palak Pakora (Air-fried)', 'spinach 100 whole leaves', 'Crisp spinach leaf fritters made in the air fryer.')
airfried('Paneer Pakora (Air-fried)', 'paneer 200 thick slices', 'Paneer slices in a spiced besan coating, air-fried until crisp.')
airfried('Mixed Vegetable Pakora (Air-fried)', 'onion 100; potato 80 thin slices; cauliflower 80 small florets; capsicum 60', 'Assorted vegetable pakoras, air-fried.')
airfried('Air-fried Masala Fries', 'potato 350 cut into fries', 'Crispy potato fries with Indian spices, made with a teaspoon of oil.', coat='cornflour 10; chilli 1; chaat 1; salt', mins=18)
airfried('Air-fried Sweet Potato Fries', 'sweetpotato 350 cut into fries', 'Sweet potato fries with peri-peri spices.', coat='cornflour 8; chilli 1; oregano 0.5; salt', mins=16)
airfried('Air-fried Arbi Fries', 'arbi 350 boiled, sliced', 'Crisp colocasia slices with ajwain and chilli.', coat='ricefl 15; ajwain 1; chilli 1; amchur 1; salt')
airfried('Mushroom Pepper Bites (Air-fried)', 'mushroom 250 whole', 'Crisp, peppery mushroom bites.', coat='besan 30; ricefl 15; pepper 2; garlic 4; salt; water 40')
airfried('Gobi 65 (Air-fried)', 'cauliflower 350 florets', 'Spicy, crisp cauliflower in a red masala coating, air-fried.', coat='ricefl 20; cornflour 10; curd 30; ginger 5; garlic 5; chilli 2; curryleaf 1; salt')
airfried('Corn Pakora (Air-fried)', 'corn 200 coarsely crushed; onion 50', 'Crunchy sweet corn pakoras.', coat='besan 50; ricefl 15; gchilli 3; salt; water 30')
