"""Breads & parathas: stuffed parathas, mixed-dough parathas, theplas, rotis and bhakris."""
from core import recipe
from util import names

C = 'Breads & Parathas'
SERVE = ['plain curd or raita, a little white butter (optional) and pickle or green chutney.', '<b>Best time:</b> breakfast or lunch.']


def stuffed(name, stuffing, desc, prep_txt, flour='atta 160', fat='ghee 10', serves=2, extra_tips=(), dough_add='', tags=()):
    g = [('For the Dough', f'{flour}; salt; water 100; oil 5' + (f'; {dough_add}' if dough_add else '')),
         ('For the Stuffing', stuffing), ('For Cooking', fat)]
    steps = [
        f'Knead the dough: Mix the {names(flour)} with salt and oil. Add water little by little and knead into a soft, smooth dough. Cover and rest for 20 minutes.',
        f'Prepare the stuffing: {prep_txt}',
        'Divide: Divide the dough and the stuffing into 4 equal portions each. The stuffing should be dry; moisture makes parathas tear.',
        'Stuff: Roll a dough ball into a 4-inch disc, place a portion of stuffing in the centre, gather the edges, pinch to seal and flatten gently.',
        'Roll: Dust with flour and roll gently into a 6–7 inch paratha, applying even pressure so the stuffing does not break through.',
        'Cook the first side: Place on a hot tawa over medium flame. Cook for 1 minute until small bubbles appear, then flip.',
        'Roast: Brush the cooked side with ½ tsp ghee or oil, flip again and press the edges with a spatula. Cook both sides until golden-brown spots appear.',
        'Serve: Serve hot with curd. Make the remaining parathas the same way.',
    ]
    recipe(name, C, desc, serves, 25, 20, g, steps,
           tips=list(extra_tips) + ['Seal the stuffing well and roll with light pressure to avoid tearing.',
                                    'Use only ½ tsp ghee per side; dry-roasting first keeps the paratha light.'],
           serve=SERVE, store='best eaten hot. Cooked parathas keep in a tiffin for 5–6 hours; the stuffing keeps in the fridge for 1 day.',
           sub='Stuffed Paratha', tags=tags)


ST = 'gchilli 3 finely chopped; coriander 6 chopped; amchur 1; jeerapowder 1; chilli 0.5; salt'
stuffed('Aloo Paratha', f'potato 250 boiled, peeled and mashed; onion 30 finely chopped; {ST}; garam 0.5',
        'The beloved Punjabi breakfast: whole-wheat flatbread stuffed with spiced mashed potato.',
        'Mash the boiled potatoes until smooth, with no lumps. Mix in onion, green chilli, coriander, amchur, roasted cumin, chilli powder, garam masala and salt.')
stuffed('Gobi Paratha', f'cauliflower 250 finely grated; ginger 5 grated; {ST}',
        'Whole-wheat paratha stuffed with spiced grated cauliflower, a winter classic.',
        'Grate the cauliflower finely, sprinkle salt, rest 10 minutes and squeeze out all the water with your hands. Mix with ginger, green chilli, coriander and the spices.',
        extra_tips=['Squeeze the grated cauliflower well; wet stuffing is the main reason gobi parathas tear.'])
stuffed('Mooli Paratha', f'mooli 300 grated; {ST}; ajwain 1',
        'Parathas stuffed with grated radish and ajwain, light, peppery and good for digestion.',
        'Grate the mooli, add a pinch of salt, rest 10 minutes and squeeze out the juice (use the juice to knead the dough). Mix the mooli with the chillies, coriander, ajwain and spices.')
stuffed('Paneer Paratha', f'paneer 150 grated; onion 30 finely chopped; {ST}',
        'Soft whole-wheat parathas stuffed with spiced grated paneer, a protein-rich breakfast.',
        'Grate the paneer and mix it with onion, green chilli, coriander and the spices. Mash lightly so it holds together.')
stuffed('Dal Paratha', 'chanadal 100 boiled until just soft, drained; gchilli 3; ginger 5; coriander 6; jeera 1; amchur 1; haldi 0.5; salt',
        'A protein-rich paratha stuffed with spiced mashed chana dal, a great way to use leftover dal.',
        'Drain the cooked chana dal completely, mash it coarsely and cook it in a dry pan for 2 minutes to remove moisture. Mix in ginger, chilli, coriander and the spices.')
stuffed('Sattu Paratha', 'sattu 100; onion 40 finely chopped; garlic 8 minced; gchilli 3; coriander 6; ajwain 1; kalonji 1; lemon 10; mustardoil 5; salt',
        'A Bihari favourite: whole-wheat paratha stuffed with roasted gram flour, onion, garlic and mustard oil.',
        'Mix the sattu with onion, garlic, green chilli, coriander, ajwain, kalonji, lemon juice, mustard oil and salt. Sprinkle 1–2 tbsp water so it holds together when pressed.')
stuffed('Cabbage Paratha', f'cabbage 200 finely grated; {ST}',
        'Paratha stuffed with spiced grated cabbage, crunchy, light and fibre-rich.',
        'Grate the cabbage, add salt, rest 10 minutes and squeeze out the water. Mix with chillies, coriander and spices.')
stuffed('Carrot Paratha', f'carrot 200 grated; paneer 50 grated; {ST}',
        'Sweet, colourful parathas stuffed with grated carrot and a little paneer.',
        'Squeeze the grated carrot lightly and mix with the paneer, chillies, coriander and spices.')
stuffed('Broccoli Paratha', f'broccoli 180 finely grated; paneer 50 grated; {ST}',
        'Parathas stuffed with grated broccoli and paneer, an easy way to get children to eat greens.',
        'Grate the broccoli florets finely and mix with paneer, green chilli, coriander and the spices.')
stuffed('Soya Keema Paratha', 'soyagran 60 soaked and squeezed; onion 40 finely chopped; gchilli 3; ginger 5; coriander 6; garam 1; amchur 1; salt; oil 5',
        'Paratha stuffed with spiced soya granules, a very high-protein vegetarian breakfast.',
        'Soak the soya granules in hot water for 10 minutes and squeeze dry. Sauté with onion, ginger and chilli in oil for 3 minutes, add the spices and coriander and cool completely.')
stuffed('Mixed Vegetable Paratha', 'potato 120 boiled, mashed; carrot 50 grated; cabbage 50 grated; peas 40 boiled, mashed; gchilli 3; coriander 6; garam 1; amchur 1; salt',
        'Paratha stuffed with potato, carrot, cabbage and peas, a whole meal in one flatbread.',
        'Squeeze the grated vegetables, then mix with mashed potato, peas, chilli, coriander and the spices.')
stuffed('Matar Paratha', 'peas 200 boiled and coarsely mashed; ginger 5; gchilli 3; coriander 6; jeera 1; amchur 1; garam 0.5; oil 5; salt',
        'Paratha stuffed with spiced green peas, a seasonal winter favourite.',
        'Heat oil, crackle cumin, add ginger, chilli and the mashed peas and cook for 3–4 minutes until dry. Add the spices and coriander and cool.')
stuffed('Onion Paratha', f'onion 200 finely chopped; {ST}; ajwain 1',
        'Crisp paratha stuffed with spiced raw onion, quick and full of flavour.',
        'Mix the onion with salt only at the very end, just before stuffing, so it does not release water. Add chilli, coriander and spices.')
stuffed('Lauki Paratha', f'lauki 250 grated; {ST}',
        'A soft, light paratha stuffed with grated bottle gourd.',
        'Squeeze the grated lauki very well and mix with chillies, coriander and spices.')
stuffed('Egg Paratha', 'egg 200; onion 40 finely chopped; gchilli 3; coriander 6; pepper 0.5; salt',
        'A street-style paratha with beaten egg cooked inside, crisp and protein-packed.',
        'Beat the eggs with onion, chilli, coriander, pepper and salt. Roll each paratha into a 7-inch disc, cook one side for 30 seconds, flip, and pour 3 tbsp egg mixture over it; fold the edges over and cook both sides until the egg is set.')
stuffed('Chicken Keema Paratha', 'chickenmince 200; onion 60 finely chopped; ginger 5; garlic 8; gchilli 3; garam 1; chilli 1; coriander 6; oil 5; salt',
        'Paratha stuffed with spiced dry chicken keema, a filling high-protein meal.',
        'Cook the chicken mince with onion, ginger, garlic and spices in oil for 12–15 minutes until fully cooked and completely dry. Add coriander and cool before stuffing.')
stuffed('Mutton Keema Paratha', 'muttonmince 200; onion 60 finely chopped; ginger 5; garlic 8; gchilli 3; garam 1; chilli 1; coriander 6; oil 5; salt',
        'The Mughlai classic: paratha stuffed with spiced dry mutton keema.',
        'Pressure-cook or pan-cook the mutton mince with onion, ginger, garlic and spices for 20 minutes until tender and completely dry. Add coriander and cool.')
stuffed('Beetroot Paratha', 'beet 150 grated; potato 80 boiled, mashed; gchilli 3; coriander 6; jeerapowder 1; amchur 1; salt',
        'Bright pink parathas with beetroot and potato, rich in folate.',
        'Squeeze the beetroot, mix with potato, chilli, coriander and the spices.')
stuffed('Paneer Methi Paratha', 'paneer 120 grated; methi 40 finely chopped; gchilli 3; jeerapowder 1; salt',
        'Paratha stuffed with paneer and fresh methi, aromatic and protein-rich.',
        'Mix the grated paneer with methi, chilli, roasted cumin and salt.')
stuffed('Sweet Potato Paratha', 'sweetpotato 220 boiled, mashed; gchilli 3; coriander 6; jeerapowder 1; amchur 1; salt',
        'A soft, mildly sweet paratha stuffed with spiced sweet potato.',
        'Peel and mash the boiled sweet potato and mix with chilli, coriander and spices.')
stuffed('Tofu Paratha', 'tofu 180 crumbled; onion 30 finely chopped; gchilli 3; coriander 6; jeerapowder 1; amchur 1; haldi 0.3; salt',
        'A vegan, high-protein paratha stuffed with spiced crumbled tofu.',
        'Press the tofu dry, crumble it and mix with onion, chilli, coriander and spices.', fat='oil 10')
stuffed('Rajma Paratha', 'rajma 80 soaked, boiled until very soft, mashed; onion 30 finely chopped; gchilli 3; coriander 6; garam 1; amchur 1; salt',
        'Paratha stuffed with spiced mashed rajma, a fibre-rich way to use leftover beans.',
        'Mash the drained rajma and cook it in a dry pan for 2 minutes. Mix with onion, chilli, coriander and spices.')
stuffed('Mushroom Paratha', 'mushroom 200 finely chopped; onion 40 chopped; garlic 8; gchilli 3; pepper 0.5; coriander 6; oil 5; salt',
        'Paratha stuffed with garlicky sautéed mushrooms.',
        'Sauté garlic and onion in oil, add the mushrooms and cook on high heat until all the water dries up. Season and cool.')
stuffed('Jowar Methi Stuffed Paratha', 'potato 150 boiled, mashed; methi 30 chopped; gchilli 3; jeerapowder 1; salt',
        'A gluten-friendly paratha made with jowar and atta, stuffed with potato and methi.',
        'Mix the mashed potato with methi, chilli, cumin and salt.', flour='jowar 80; atta 80')


def mixed(name, flour, add, desc, prep_txt, fat='oil 10', serves=2, sub='Paratha', liquid='water 90', tips=(), roll='paratha'):
    g = [('For the Dough', f'{flour}; {add}; salt; {liquid}'), ('For Cooking', fat)]
    steps = [
        f'Prepare the add-ins: {prep_txt}',
        f'Make the dough: In a bowl, combine the {names(flour)} with the {names(add) or "spices"}, spices and salt. Add {"water" if "water" in liquid else names(liquid)} gradually and knead into a soft dough. Rest for 15 minutes.',
        'Divide: Divide the dough into 6 equal balls.',
        'Roll: Dust a ball with flour and roll it into a thin 6-inch round.' if roll != 'layered' else
        'Roll & layer: Roll a ball into a thin circle, brush with a few drops of oil, sprinkle flour, pleat it like a fan, coil into a spiral and roll again into a 6-inch paratha.',
        'Cook: Place on a hot tawa on medium flame. Flip when small bubbles appear and cook the other side for 30 seconds.',
        'Roast: Apply a few drops of oil, flip and press gently with a spatula. Cook until both sides have golden-brown spots.',
        'Serve: Keep warm in a cloth-lined box and serve with curd, chutney or a sabzi.',
    ]
    recipe(name, C, desc, serves, 20, 20, g, steps, tips=list(tips) + ['Rest the dough so it rolls thin without shrinking back.'],
           serve=SERVE, store='keeps in an airtight box for 1 day at room temperature (theplas up to 3 days) and is ideal for travel.',
           sub=sub)


mixed('Methi Thepla', 'atta 140; besan 20', 'methi 60 finely chopped; curd 40; haldi 0.5; chilli 1; ajwain 1; sesame 5; ginger 5 grated; gchilli 3 finely chopped',
      'Soft, spiced Gujarati flatbreads with fresh methi, the perfect travel food.',
      'Wash, dry and finely chop the methi leaves.', sub='Thepla', liquid='water 50', tips=['Theplas stay soft for 2–3 days, making them ideal for journeys.'])
mixed('Lauki Thepla', 'atta 140; besan 20', 'lauki 150 grated; curd 30; haldi 0.5; chilli 1; ajwain 1; sesame 5; ginger 5 grated',
      'Soft Gujarati theplas made with grated bottle gourd, light and moist.',
      'Grate the lauki; do not squeeze it. Its water is used to knead the dough.', sub='Thepla', liquid='water 10')
mixed('Palak Thepla', 'atta 140; besan 20', 'spinach 100 blanched, puréed; curd 30; haldi 0.3; chilli 1; ajwain 1; sesame 5; ginger 5',
      'Green, iron-rich theplas made with spinach purée.', 'Blanch spinach for 1 minute and blend to a smooth purée.', sub='Thepla', liquid='water 10')
mixed('Bajra Methi Thepla', 'bajra 100; atta 60', 'methi 50 finely chopped; curd 40; haldi 0.5; chilli 1; ajwain 1; sesame 5; ginger 5; gchilli 3',
      'A warming winter thepla with bajra flour and fresh fenugreek.', 'Finely chop the methi leaves.', sub='Thepla', liquid='water 60')
mixed('Methi Paratha', 'atta 160', 'methi 60 finely chopped; ajwain 1; chilli 0.5; haldi 0.3', 'Layered whole-wheat paratha with fresh fenugreek leaves.',
      'Chop the methi, sprinkle salt, rest 10 minutes and squeeze lightly.', roll='layered')
mixed('Palak Paratha', 'atta 160', 'spinach 120 blanched, puréed; gchilli 3; ginger 5; jeera 1; ajwain 0.5', 'Bright green, soft parathas with spinach purée kneaded into the dough.',
      'Blanch the spinach with chilli and ginger for 1 minute and blend to a smooth purée.', liquid='water 10')
mixed('Pudina Paratha', 'atta 160', 'mint 20 dried and crushed; jeera 1; chaat 1; chilli 0.5', 'Layered, flaky whole-wheat paratha flavoured with mint.',
      'Dry the mint leaves on a hot tawa and crush them to a coarse powder; keep half to sprinkle while layering.', roll='layered')
mixed('Ajwain Paratha', 'atta 160', 'ajwain 2; kalonji 1', 'Flaky layered paratha with carom seeds, light and good for digestion.', 'Lightly crush the ajwain between your palms to release its aroma.', roll='layered')
mixed('Multigrain Paratha', 'mgatta 160', 'flax 10 powdered; sesame 5; ajwain 1', 'A fibre-rich layered paratha from multigrain atta and flaxseed.', 'Powder the flaxseeds.', roll='layered')
mixed('Missi Roti', 'besan 80; atta 80', 'onion 40 finely chopped; gchilli 3; coriander 6; ajwain 1; kasuri 1; haldi 0.3; chilli 0.5', 'Rajasthani-Punjabi roti made with besan and atta, protein-rich and full of flavour.',
      'Finely chop the onion, chilli and coriander.', sub='Roti')
mixed('Oats Roti', 'oats 80 powdered; atta 80', 'jeera 1', 'Soft roti made with powdered oats and whole wheat, rich in soluble fibre.', 'Powder the oats finely in a mixer.', sub='Roti', fat='ghee 5')
mixed('Beetroot Paratha (Dough)', 'atta 160', 'beet 100 puréed; jeera 1; ajwain 0.5', 'Naturally pink parathas with beetroot purée in the dough, a fun lunch-box bread.',
      'Boil or steam the beetroot for 5 minutes and blend to a purée.', liquid='water 20')
mixed('Carrot Coriander Paratha', 'atta 160', 'carrot 100 finely grated; coriander 10 chopped; jeera 1; chilli 0.5', 'Soft paratha with grated carrot and coriander kneaded into the dough.', 'Finely grate the carrot.', liquid='water 50')
mixed('Masala Paratha (Lachha)', 'atta 160', 'chilli 1; amchur 1; jeerapowder 1; chaat 1', 'Flaky, layered paratha sprinkled with a tangy spice mix between the layers.',
      'Mix the dry spices to sprinkle between the layers.', roll='layered')
mixed('Kuttu Paratha', 'kuttu 120', 'potato 100 boiled, mashed; jeerapowder 1', 'A gluten-free buckwheat and potato paratha for fasting days.',
      'Mash the potato; it binds the gluten-free flour.', liquid='water 30', fat='ghee 10')
mixed('Rajgira Paratha', 'rajgira 120', 'potato 100 boiled, mashed; gchilli 3; jeerapowder 1', 'A soft amaranth flour paratha bound with potato, ideal for vrat.',
      'Mash the potato smoothly.', liquid='water 30', fat='ghee 10')
mixed('Singhara Roti', 'singhara 120', 'potato 100 boiled, mashed; jeerapowder 1', 'Water chestnut flour roti for fasting, gluten-free and light.', 'Mash the potato smoothly.', liquid='water 30', sub='Roti', fat='ghee 8')
mixed('Besan Masala Roti', 'besan 120; atta 40', 'onion 40 finely chopped; methi 20 chopped; ajwain 1; haldi 0.3; chilli 0.5', 'Rustic besan roti with onion and methi, high in protein.',
      'Finely chop the onion and methi.', sub='Roti')
mixed('Soya Atta Roti', 'atta 130; soyagran 30 finely powdered', 'jeera 1', 'Soft roti with soya flour blended into atta, adding protein to every meal.', 'Powder the soya granules finely.', sub='Roti', fat='ghee 5')
mixed('Ragi Atta Roti', 'ragi 70; atta 90', 'jeera 1', 'A soft everyday roti made with ragi and wheat flour, rich in calcium.', 'Sift the two flours together.', sub='Roti', fat='ghee 5')
mixed('Jowar Methi Roti', 'jowar 120; atta 30', 'methi 40 chopped; gchilli 3; ajwain 1', 'A soft jowar roti with fresh methi, low-GI and fibre-rich.', 'Chop the methi finely.', sub='Roti', liquid='water 100')


def bhakri(name, flour, desc, hot_water=True, add='', serves=2, sub='Bhakri / Millet Roti', fat='ghee 8', extra=()):
    g = [('Ingredients', f'{flour}; salt; water 130' + (f'; {add}' if add else '') + f'; {fat}')]
    steps = [
        f'Mix: Take the {names(flour)}' + (f' with the {names(add)}' if add else '') + ' and salt in a wide plate.',
        'Make the dough: Add ' + ('hot water' if hot_water else 'warm water') + ' little by little and mix with a spoon, then knead with the heel of your palm for 3–4 minutes into a smooth, crack-free dough. Millet dough has no gluten, so knead only one portion at a time.',
        'Shape: Take a lemon-sized ball and pat it between your palms, or roll it between two sheets of butter paper, into a 6-inch round.',
        'Cook the first side: Place on a hot tawa on medium flame. Spread a little water over the top with your fingers to prevent cracks.',
        'Flip: When the bottom has light spots (about 1 minute), flip and cook the other side for 1 minute.',
        'Puff: Roast directly on the flame with tongs, or press with a cloth on the tawa, until it puffs and both sides are cooked.',
        'Serve: Apply a little ghee and serve hot.',
    ]
    recipe(name, C, desc, serves, 10, 20, g, steps, tips=list(extra) + ['Knead each portion just before rolling; millet dough dries out quickly.',
                                                                 'Patting with wet hands is easier than rolling for beginners.'],
           serve=['dal, sabzi, pithla or a garlic chutney, plus a little white butter or jaggery (traditional).', '<b>Best time:</b> lunch or dinner.'],
           store='best eaten hot; it hardens as it cools.', sub=sub)


bhakri('Jowar Bhakri', 'jowar 160', 'Maharashtrian sorghum flatbread, gluten-free, high in fibre and very filling.')
bhakri('Bajra Roti', 'bajra 160', 'Rustic pearl millet flatbread from Rajasthan and Gujarat, rich in iron and warming in winter.', extra=['Bajra is warming; it is best eaten in the cooler months.'])
bhakri('Ragi Roti', 'ragi 140', 'Karnataka-style finger millet roti, an excellent source of calcium.', add='onion 40 finely chopped; gchilli 3; coriander 6; curryleaf 1')
bhakri('Makki di Roti', 'makki 160', 'The Punjabi maize flour flatbread, traditionally paired with sarson ka saag.', extra=['Traditionally eaten with sarson ka saag and a little white butter.'])
bhakri('Akki Rotti', 'ricefl 140', 'Karnataka’s rice flour flatbread with onion, dill and coconut.', add='onion 50 finely chopped; dill 15 chopped; carrot 30 grated; coconut 15; gchilli 3; jeera 1')
bhakri('Thalipeeth', 'jowar 50; bajra 30; besan 30; ricefl 20; atta 20', 'Maharashtra’s multigrain spiced flatbread made from bhajani flour, high in protein and fibre.',
       add='onion 50 finely chopped; coriander 8; ajwain 1; haldi 0.5; chilli 1; sesame 5', hot_water=False, fat='oil 10', sub='Thalipeeth')
bhakri('Rajgira Roti', 'rajgira 140', 'Soft amaranth roti, gluten-free and high in protein and calcium.', add='potato 60 boiled, mashed')
bhakri('Kodo Millet Roti', 'kodo 140', 'A soft roti made from kodo millet flour, high in fibre.')
bhakri('Foxtail Millet Roti', 'foxtail 140', 'A light, nutty foxtail millet roti with a low glycaemic index.')
bhakri('Jowar Palak Roti', 'jowar 140', 'Jowar bhakri kneaded with spinach purée for iron and colour.', add='spinach 60 puréed')
bhakri('Multi-millet Roti', 'jowar 50; bajra 50; ragi 50', 'A roti made from three millets for a broad range of minerals and fibre.')


def plain_roti(name, flour, desc, fat='ghee 5', sub='Roti', extra=''):
    g = [('Ingredients', f'{flour}; salt; water 100' + (f'; {extra}' if extra else '') + (f'; {fat}' if fat else ''))]
    steps = [
        f'Knead: Mix the {names(flour)} with a pinch of salt. Add water little by little and knead into a soft, smooth dough.',
        'Rest: Cover and rest for 20–30 minutes; rested dough makes softer rotis.',
        'Divide & roll: Divide into 6 balls. Dust with flour and roll each into a thin, even 6-inch circle.',
        'Cook: Place on a hot tawa. Flip when small bubbles appear (about 20 seconds).',
        'Cook the other side: Cook until light brown spots form (about 40 seconds).',
        'Puff: Place the roti directly on a medium flame with tongs; it will puff up fully. Flip once.',
        'Serve: Apply a little ghee if you like, and keep in a cloth-lined box.',
    ]
    recipe(name, C, desc, 2, 10, 15, g, steps, tips=['Roll evenly; thick and thin patches stop the roti from puffing.',
                                                    'Knead the dough 10 minutes for the softest rotis.'],
           serve=['any dal, sabzi or curry.', '<b>Best time:</b> lunch and dinner.'],
           store='keeps soft in a cloth-lined box for 6–8 hours.', sub=sub)


plain_roti('Phulka (Whole-wheat Roti)', 'atta 150', 'Soft, puffed whole-wheat rotis made without oil, the healthiest everyday Indian bread.', fat=None)
plain_roti('Multigrain Roti', 'mgatta 150', 'Soft rotis from multigrain atta, more fibre and minerals than plain wheat.')
plain_roti('Flaxseed Roti', 'atta 135; flax 15 powdered', 'Everyday rotis with flaxseed powder for plant omega-3 and fibre.')
plain_roti('Tandoori Roti (Tawa)', 'atta 150', 'Restaurant-style tandoori roti made at home on a tawa, with curd in the dough.', extra='curd 30; ajwain 0.5')
plain_roti('Bran Roti', 'atta 140; oats 20 bran or powdered', 'High-fibre roti with added oat bran.')
plain_roti('Chana Atta Roti', 'atta 110; besan 40', 'Soft roti with gram flour added for more protein.')
plain_roti('Ragi Wheat Phulka', 'atta 100; ragi 50', 'Soft, puffed rotis with ragi flour for calcium.')
