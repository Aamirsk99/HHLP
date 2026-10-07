"""Volume 2 - breads & parathas, poha, upma and porridges."""
import core
from fam_breads import stuffed, mixed, bhakri, plain_roti, ST
from fam_porridge import poha, upma, porridge

core.VOLUME = 2

# Stuffed parathas
stuffed('Aloo Methi Paratha', f'potato 220 boiled, mashed; methi 40 finely chopped; {ST}', 'Potato and fresh fenugreek stuffed paratha.',
        'Mash the potatoes and mix with the chopped methi, chilli, coriander and spices.')
stuffed('Aloo Pyaz Paratha', f'potato 200 boiled, mashed; onion 80 finely chopped; {ST}', 'Paratha stuffed with spiced potato and onion, a dhaba classic.',
        'Mash the potatoes and mix in the onion and spices just before stuffing.')
stuffed('Paneer Palak Paratha', 'paneer 120 grated; spinach 80 blanched, chopped, squeezed; gchilli 3; jeerapowder 1; garam 0.5; salt',
        'Paratha stuffed with paneer and spinach.', 'Squeeze the blanched spinach completely dry and mix with the paneer and spices.')
stuffed('Gobi Paneer Paratha', f'cauliflower 150 grated, squeezed; paneer 80 grated; {ST}', 'Paratha stuffed with cauliflower and paneer.',
        'Squeeze the grated cauliflower dry and mix with paneer and spices.')
stuffed('Aloo Gobi Paratha', f'potato 150 boiled, mashed; cauliflower 120 grated, squeezed; {ST}', 'A paratha stuffed with spiced potato and cauliflower.',
        'Mix the mashed potato with the squeezed cauliflower and spices.')
stuffed('Sprouts Paratha', 'sprouts 150 steamed, coarsely mashed; onion 30; gchilli 3; coriander 6; jeerapowder 1; amchur 1; salt',
        'A protein-rich paratha stuffed with spiced moong sprouts.', 'Steam the sprouts for 5 minutes, mash coarsely and mix with onion and spices.')
stuffed('Chana Paratha', 'chickpea 100 soaked, boiled, mashed; onion 30; gchilli 3; coriander 6; chole 2; amchur 1; salt',
        'Paratha stuffed with spiced mashed chickpeas.', 'Mash the drained chickpeas and mix with onion and spices.')
stuffed('Masoor Dal Paratha', 'masoor 90 cooked thick; gchilli 3; ginger 5; coriander 6; jeera 1; amchur 1; salt',
        'Paratha stuffed with spiced cooked masoor dal.', 'Cook masoor dal with little water until thick and dry; mash and mix with spices.')
stuffed('Moong Dal Paratha', 'moong 90 soaked, cooked until just soft; gchilli 3; ginger 5; coriander 6; jeera 1; amchur 1; salt',
        'A light paratha stuffed with spiced moong dal.', 'Cook the soaked moong until just soft and dry; mash and mix with the spices.')
stuffed('Corn Paratha', f'corn 150 coarsely crushed; potato 80 boiled; {ST}', 'Paratha stuffed with sweet corn and potato.',
        'Mix the crushed corn with mashed potato and spices.')
stuffed('Pumpkin Paratha', f'pumpkin 220 grated, cooked dry; {ST}', 'A soft paratha stuffed with spiced pumpkin.',
        'Cook the grated pumpkin in a dry pan until all moisture evaporates; cool and mix with spices.')
stuffed('Matar Paneer Paratha', 'peas 120 boiled, mashed; paneer 80 grated; gchilli 3; ginger 5; coriander 6; garam 0.5; salt',
        'Paratha stuffed with green peas and paneer.', 'Mix the mashed peas and paneer with the spices.')
stuffed('Paneer Capsicum Paratha', 'paneer 130 grated; capsicum 60 finely chopped; gchilli 3; jeerapowder 1; chaat 1; salt',
        'Paratha stuffed with paneer and crunchy capsicum.', 'Mix the paneer with capsicum and spices.')
stuffed('Palak Corn Paratha', 'spinach 100 blanched, chopped, squeezed; corn 100 crushed; paneer 40; gchilli 3; garam 0.5; salt',
        'Paratha stuffed with spinach, corn and a little paneer.', 'Squeeze the spinach dry and mix with the corn, paneer and spices.')
stuffed('Kala Chana Paratha', 'kalachana 100 soaked, boiled, mashed; onion 30; gchilli 3; coriander 6; amchur 1; jeerapowder 1; salt',
        'An iron-rich paratha stuffed with mashed black chickpeas.', 'Mash the drained kala chana and mix with onion and spices.')
stuffed('Chicken Tikka Paratha', 'chicken 180 grilled tikka, finely shredded; onion 30; coriander 6; chaat 1; salt',
        'Paratha stuffed with shredded chicken tikka.', 'Shred the grilled chicken tikka finely and mix with onion, coriander and chaat masala.')
stuffed('Egg Bhurji Paratha', 'egg 150 scrambled dry; onion 30; gchilli 3; coriander 6; pepper 0.5; salt',
        'Paratha stuffed with dry spiced egg bhurji.', 'Scramble the eggs with onion and spices until completely dry; cool.')
stuffed('Mooli Paneer Paratha', f'mooli 200 grated, squeezed; paneer 60 grated; {ST}', 'Radish and paneer stuffed paratha.',
        'Squeeze the grated mooli very well and mix with paneer and spices.')
stuffed('Sweet Corn Cheese Paratha', 'corn 120 crushed; cheese 28; capsicum 30; pepper 0.5; salt', 'A kids’ favourite paratha with corn and a little cheese.',
        'Mix the crushed corn with cheese, capsicum and pepper.', tags=('kids',))
stuffed('Lobia Paratha', 'lobia 90 soaked, boiled, mashed; onion 30; gchilli 3; coriander 6; amchur 1; salt', 'Paratha stuffed with spiced black-eyed beans.',
        'Mash the drained lobia and mix with onion and spices.')

# Mixed-dough parathas and theplas
mixed('Bathua Paratha', 'atta 160', 'bathua 80 finely chopped; ajwain 1; chilli 0.5', 'Soft paratha with bathua greens kneaded into the dough.', 'Chop the bathua finely.')
mixed('Suva (Dill) Paratha', 'atta 160', 'dill 30 chopped; ajwain 1; haldi 0.3', 'Paratha with fresh dill leaves.', 'Chop the dill finely.')
mixed('Spring Onion Paratha', 'atta 160', 'springonion 60 finely chopped; jeera 1; chilli 0.5', 'Layered paratha with spring onions.', 'Chop the spring onions finely.', roll='layered')
mixed('Cabbage Thepla', 'atta 140; besan 20', 'cabbage 100 finely grated; curd 30; haldi 0.5; chilli 1; ajwain 1; sesame 5', 'Soft theplas with grated cabbage.',
      'Grate the cabbage finely.', sub='Thepla', liquid='water 30')
mixed('Mooli Thepla', 'atta 140; besan 20', 'mooli 120 grated; curd 30; haldi 0.5; chilli 1; ajwain 1; sesame 5', 'Gujarati radish theplas.',
      'Grate the mooli; use its juice to knead.', sub='Thepla', liquid='water 10')
mixed('Jowar Thepla', 'jowar 100; atta 60', 'methi 40 chopped; curd 40; haldi 0.5; chilli 1; ajwain 1; sesame 5', 'Theplas made with jowar and atta.',
      'Chop the methi.', sub='Thepla', liquid='water 50')
mixed('Ragi Thepla', 'ragi 80; atta 80', 'methi 40 chopped; curd 40; haldi 0.5; chilli 1; ajwain 1; sesame 5', 'Calcium-rich theplas with ragi.', 'Chop the methi.', sub='Thepla', liquid='water 50')
mixed('Oats Methi Paratha', 'oats 60 powdered; atta 100', 'methi 50 chopped; ajwain 1; chilli 0.5', 'Oats and wheat paratha with methi.', 'Powder the oats and chop the methi.')
mixed('Sweet Potato Thepla', 'atta 140', 'sweetpotato 120 boiled, mashed; haldi 0.3; chilli 0.5; ajwain 1; sesame 5', 'Soft theplas with mashed sweet potato.',
      'Mash the sweet potato smoothly.', sub='Thepla', liquid='water 30')
mixed('Pumpkin Thepla', 'atta 140; besan 20', 'pumpkin 150 grated; haldi 0.3; chilli 1; ajwain 1; sesame 5', 'Theplas with grated pumpkin.', 'Grate the pumpkin.',
      sub='Thepla', liquid='water 20')
mixed('Kothimbir (Coriander) Paratha', 'atta 160', 'coriander 40 chopped; gchilli 3; jeera 1', 'Paratha with lots of fresh coriander.', 'Chop the coriander.', roll='layered')
mixed('Garlic Paratha', 'atta 160', 'garlic 15 finely chopped; coriander 8; chilliflakes 1', 'Layered paratha with garlic and coriander.', 'Finely chop the garlic.', roll='layered')
mixed('Til (Sesame) Paratha', 'atta 160', 'sesame 15; ajwain 1', 'Crisp layered paratha with sesame seeds.', 'Lightly roast the sesame.', roll='layered')
mixed('Makki Methi Paratha', 'makki 100; atta 60', 'methi 50 chopped; gchilli 3; ajwain 1', 'Maize and wheat paratha with methi.', 'Chop the methi.', liquid='water 100')
mixed('Amaranth Leaves Paratha', 'atta 160', 'amaranth 80 chopped; ajwain 1; chilli 0.5', 'Paratha with chaulai leaves.', 'Chop the leaves finely.')
mixed('Moringa Leaf Paratha', 'atta 160', 'moringaleaf 30; ajwain 1; chilli 0.5', 'Paratha with moringa leaves kneaded into the dough.', 'Pick and chop the moringa leaves.')
mixed('Paneer Dough Paratha', 'atta 150', 'paneer 80 grated; ajwain 1; chilli 0.5', 'Soft paratha with grated paneer kneaded into the dough.', 'Grate the paneer finely.', liquid='water 60')
mixed('Dal Thepla (Leftover Dal)', 'atta 150; besan 20', 'toor 40 cooked dal; haldi 0.3; chilli 1; ajwain 1; sesame 5', 'Theplas kneaded with leftover dal, a smart use of leftovers.',
      'Use about ½ cup thick cooked dal.', sub='Thepla', liquid='water 30')
mixed('Mint Coriander Thepla', 'atta 140; besan 20', 'mint 15; coriander 20; curd 30; haldi 0.3; chilli 1; ajwain 1', 'Fresh herby theplas.', 'Chop the herbs.',
      sub='Thepla', liquid='water 50')
mixed('Bajra Palak Roti', 'bajra 120; atta 40', 'spinach 80 puréed; ajwain 1', 'Bajra and wheat roti with spinach.', 'Blend the blanched spinach.', sub='Roti', liquid='water 40')

bhakri('Bajra Methi Roti', 'bajra 160', 'Bajra roti with fresh methi, a winter favourite.', add='methi 40 chopped')
bhakri('Bajra Lahsun Roti', 'bajra 160', 'Bajra roti with garlic and green chilli.', add='garlic 10 chopped; gchilli 3')
bhakri('Makki Methi Roti', 'makki 160', 'Maize roti with fresh methi.', add='methi 40 chopped')
bhakri('Kodo Methi Roti', 'kodo 140', 'Kodo millet roti with methi.', add='methi 30 chopped')
bhakri('Little Millet Roti', 'kutki 140', 'A soft little millet roti.')
bhakri('Barnyard Millet Roti', 'sama 140', 'A light barnyard millet roti.')
bhakri('Jowar Onion Roti', 'jowar 160', 'Jowar roti with onion and coriander.', add='onion 50 finely chopped; coriander 6; gchilli 3')
bhakri('Ragi Carrot Roti', 'ragi 140', 'Ragi roti with grated carrot.', add='carrot 50 grated; onion 30; coriander 6')
bhakri('Akki Rotti with Methi', 'ricefl 140', 'Rice flour rotti with fresh methi.', add='methi 30 chopped; onion 40; gchilli 3; jeera 1')
bhakri('Jowar Bajra Bhakri', 'jowar 80; bajra 80', 'A two-millet bhakri.')
plain_roti('Jowar Wheat Phulka', 'atta 100; jowar 50', 'Soft phulkas with jowar added to atta.')
plain_roti('Bajra Wheat Roti', 'atta 100; bajra 50', 'Soft rotis with bajra added to atta.')
plain_roti('Quinoa Roti', 'atta 110; quinoa 40 powdered', 'Roti with quinoa flour for extra protein.')
plain_roti('Sattu Roti', 'atta 110; sattu 40', 'Roti with sattu kneaded in for protein.')
plain_roti('Ragi Jowar Wheat Roti', 'atta 80; ragi 35; jowar 35', 'A three-flour everyday roti.')

# Poha
poha('Peanut Poha', 'poha 120', 'onion 60 chopped', 'Poha with extra roasted peanuts.', extra='peanut 30')
poha('Mushroom Poha', 'poha 110', 'onion 60 chopped; mushroom 100 chopped', 'Poha with sautéed mushrooms.')
poha('Tofu Poha', 'poha 100', 'onion 60 chopped; tofu 100 crumbled; peas 30', 'High-protein poha with tofu.')
poha('Matar Poha', 'poha 120', 'onion 50 chopped; peas 100', 'Poha with green peas.')
poha('Cabbage Poha', 'poha 110', 'onion 50 chopped; cabbage 80 shredded', 'Poha with shredded cabbage.')
poha('Palak Poha', 'poha 110', 'onion 50 chopped; spinach 80 chopped', 'Poha with spinach.')
poha('Tomato Poha', 'poha 120', 'onion 50 chopped; tomato 100 chopped', 'Tangy poha with tomatoes.')
poha('Coconut Poha', 'poha 120', 'onion 40 chopped', 'South Indian poha finished with fresh coconut.', finish='lemon 10; coriander 8; coconut 30')
poha('Methi Poha', 'poha 110', 'onion 50 chopped; methi 40 chopped', 'Poha with fresh methi.')
poha('Quinoa Poha', 'quinoa 60 cooked; poha 60', 'onion 50 chopped; carrot 40; peas 30', 'Poha mixed with quinoa for extra protein.')

# Upma
VU = 'onion 60 chopped; carrot 40 chopped; beans 30 chopped; peas 30'
upma('Tomato Rava Upma', 'rava 120', 'onion 60 chopped; tomato 120 chopped', 'Tangy rava upma with plenty of tomato.', water=420)
upma('Lemon Rava Upma', 'rava 120', 'onion 60 chopped; ginger 5', 'Rava upma with lemon and ginger.', water=420, finish='lemon 15; coriander 6; ghee 5')
upma('Sprouts Upma', 'rava 100', 'onion 60 chopped; sprouts 80', 'Rava upma with moong sprouts for protein.', water=420)
upma('Mushroom Upma', 'rava 110', 'onion 60 chopped; mushroom 100 chopped', 'Rava upma with mushrooms.', water=420)
upma('Corn Rava Upma', 'rava 110', 'onion 60 chopped; corn 80; capsicum 30', 'Rava upma with sweet corn.', water=420)
upma('Methi Rava Upma', 'rava 110', 'onion 60 chopped; methi 40 chopped', 'Rava upma with fresh methi.', water=420)
upma('Palak Upma', 'rava 110', 'onion 60 chopped; spinach 80 chopped', 'Rava upma with spinach.', water=420)
upma('Foxtail Tomato Upma', 'foxtail 120', 'onion 60 chopped; tomato 100 chopped', 'Foxtail millet upma with tomato.', water=420, roast=False, cook=20)
upma('Quinoa Tomato Upma', 'quinoa 120', 'onion 60 chopped; tomato 100 chopped; peas 30', 'Quinoa upma with tomato.', water=360, roast=False, cook=18)
upma('Rice Rava Vegetable Upma', 'rice 120 coarsely ground', VU, 'Broken rice upma with vegetables.', water=480, cook=20)
upma('Kerala Avil Upma', 'poha 120 coarsely powdered', 'onion 50 chopped; coconut 20', 'Kerala-style beaten rice upma with coconut.', water=240, cook=10)
upma('Dalia Tomato Upma', 'dalia 120', 'onion 60 chopped; tomato 100 chopped; peas 30', 'Broken wheat upma with tomato.', water=480, cook=20)
upma('Paneer Vegetable Semiya Upma', 'semiya 110', VU + '; paneer 60 crumbled', 'Vermicelli upma with vegetables and paneer.', water=300)

# Porridges
porridge('Savoury Moong Dal Porridge', 'moong 50', 'water 400', 'A soupy moong dal porridge with cumin, very easy to digest.', savoury=True, roast=False, cook=20,
         add='jeera 1; ginger 3; haldi 0.3; ghee 5', sweet='')
porridge('Ragi Oats Porridge', 'ragi 25; oats 30', 'milk 300', 'Ragi and oats cooked in milk.', roast=False, sweet='jaggery 10', top='almond 8')
porridge('Jowar Porridge', 'jowar 40', 'milk 300; water 100', 'A sweet jowar flour porridge.', roast=True, sweet='jaggery 12; elaichipowder 0.5')
porridge('Bajra Raab', 'bajra 30', 'water 300', 'Gujarati warming bajra porridge with jaggery, ajwain and dry ginger.', roast=True, add='ajwain 0.5; dryginger 0.5; ghee 5',
         sweet='jaggery 15', cook=8)
porridge('Sabudana Porridge', 'sabudana 40 soaked', 'milk 300', 'Soft sago pearls in cardamom milk.', roast=False, sweet='jaggery 12; elaichipowder 0.5', tags=('fast',))
porridge('Oats Banana Porridge', 'oats 60', 'milk 300', 'Oats cooked with banana, naturally sweet.', add='banana 80 mashed', sweet='cinnamon 0.5', cook=6)
porridge('Oats Dates Porridge', 'oats 60', 'milk 300', 'Oats sweetened with dates.', sweet='dates 24 chopped', cook=6, top='walnut 8')
porridge('Sooji Kanji', 'rava 30', 'milk 300', 'A light semolina porridge, soothing when unwell.', sweet='jaggery 10; elaichipowder 0.5', cook=6)
porridge('Kodo Millet Porridge', 'kodo 50', 'milk 300; water 150', 'Kodo millet porridge with dates.', sweet='dates 16 chopped', cook=20)
porridge('Savoury Quinoa Porridge', 'quinoa 60', 'water 360', 'Savoury quinoa porridge with vegetables.', savoury=True, roast=False, cook=18,
         add='carrot 40; peas 30; jeera 1; pepper 0.5; ghee 5', sweet='')
porridge('Chocolate Oats Porridge', 'oats 60', 'milk 300', 'Oats with cocoa and banana, no sugar.', add='cocoa 5; banana 60', sweet='dates 16', cook=6, tags=('kids',))
porridge('Mango Overnight Oats', 'oats 60', 'milk 180; curd 60', 'Overnight oats with mango.', sweet='chia 6; honey 5', top='mango 100; almond 6', cook=0, roast=False)
porridge('Strawberry Overnight Oats', 'oats 60', 'milk 180; curd 60', 'Overnight oats with strawberries.', sweet='chia 6; honey 5', top='strawberry 100; walnut 6', cook=0, roast=False)
porridge('Peanut Overnight Oats', 'oats 60', 'milk 200', 'Overnight oats with crushed peanuts and banana.', sweet='chia 6; honey 5', top='peanut 15; banana 60', cook=0, roast=False)
porridge('Ragi Chocolate Porridge', 'ragi 30', 'milk 300', 'A chocolate ragi porridge for children.', roast=False, add='cocoa 5', sweet='dates 16', cook=8, tags=('kids',))
porridge('Apple Chia Pudding', 'chia 24', 'milk 240', 'Chia pudding topped with cinnamon apple.', sweet='honey 7; cinnamon 0.5', top='apple 100; walnut 6', roast=False, cook=0)
porridge('Coconut Rice Kanji', 'rice 50', 'water 500; coconutmilk 100', 'Kerala-style rice kanji with coconut milk.', savoury=True, roast=False, cook=25, add='jeera 1', sweet='')
porridge('Dalia Nut Porridge', 'dalia 40', 'milk 350', 'Broken wheat porridge with jaggery and nuts.', sweet='jaggery 12; elaichipowder 0.5', top='almond 8; pistachio 4', cook=15)
