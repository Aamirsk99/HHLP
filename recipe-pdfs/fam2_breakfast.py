"""Volume 2 - breakfast: more chilas, dosas, idlis, uttapams and appe."""
import core
from fam_breakfast import flour_chila, dal_chila, fermented_dosa, instant_dosa, soaked_dosa, fermented_idli, instant_idli, uttapam, appe, VEG1, POTATO, POTATO_TXT

core.VOLUME = 2

# Flour chilas
flour_chila('Methi Oats Chila', 'oats 60 powdered; besan 40; methi 30 finely chopped', 'onion 40 finely chopped; gchilli 3 finely chopped',
            'An oats and besan chila with fresh methi, high in fibre and gentle on blood sugar.', rest=15)
flour_chila('Paneer Palak Besan Chila', 'besan 100; spinach 50 finely chopped', 'onion 40 finely chopped; gchilli 3 finely chopped',
            'A spinach besan chila folded over spiced paneer, rich in protein, calcium and iron.',
            filling='paneer 80 crumbled; chaat 1; coriander 4', fill_txt='Crumble the paneer and mix with chaat masala and coriander.')
flour_chila('Jowar Palak Chila', 'jowar 70; besan 30; spinach 50 finely chopped', 'onion 40 finely chopped; gchilli 3 finely chopped',
            'A gluten-free sorghum chila with spinach.', water=190)
flour_chila('Ragi Spinach Chila', 'ragi 70; besan 30; spinach 50 finely chopped', 'onion 40 finely chopped; gchilli 3 finely chopped',
            'A calcium- and iron-rich ragi chila with fresh spinach.', water=200)
flour_chila('Corn Oats Chila', 'oats 60 powdered; besan 40; corn 50 crushed', 'onion 40 finely chopped; capsicum 30 finely chopped; gchilli 3',
            'A soft oats chila with sweet corn and capsicum, loved by children.', rest=15)
flour_chila('Tomato Oats Chila', 'oats 60 powdered; besan 40', 'onion 40 finely chopped; tomato 80 finely chopped; gchilli 3',
            'A tangy tomato and oats chila.', rest=15)
flour_chila('Paneer Rava Chila', 'rava 80; curd 60', VEG1, 'Instant semolina chila filled with spiced paneer.', water=120, rest=15,
            note=' Rest the rava batter for 15 minutes so the semolina swells.',
            filling='paneer 80 crumbled; capsicum 20 finely chopped; chaat 1; coriander 4', fill_txt='Mix the crumbled paneer with capsicum, chaat masala and coriander.')
flour_chila('Mushroom Besan Chila', 'besan 100', 'onion 40 finely chopped; mushroom 70 finely chopped; gchilli 3',
            'A savoury besan chila with finely chopped mushrooms.')
flour_chila('Capsicum Besan Chila', 'besan 100', 'onion 40 finely chopped; capsicum 70 finely chopped; gchilli 3',
            'A crunchy besan chila with plenty of capsicum, rich in vitamin C.')
flour_chila('Zucchini Besan Chila', 'besan 90; zucchini 100 grated, squeezed', 'onion 30 finely chopped; gchilli 3 finely chopped',
            'Grated zucchini makes this besan chila light and moist.', water=130)
flour_chila('Broccoli Besan Chila', 'besan 100; broccoli 60 finely grated', 'onion 40 finely chopped; gchilli 3 finely chopped',
            'Besan chila with finely grated broccoli, an easy way to add greens to breakfast.')
flour_chila('Cauliflower Besan Chila', 'besan 100; cauliflower 70 finely grated', 'onion 30 finely chopped; gchilli 3 finely chopped',
            'Besan chila with grated cauliflower, light and fibre-rich.')
flour_chila('Mixed Millet Chila', 'jowar 35; bajra 35; ragi 30', VEG1, 'A chila made with three millet flours for a broad range of minerals.', water=200)
flour_chila('Sweet Potato Besan Chila', 'besan 90; sweetpotato 70 grated', 'onion 30 finely chopped; gchilli 3 finely chopped',
            'Besan chila with grated sweet potato, mildly sweet and rich in beta-carotene.')
flour_chila('Spring Onion Besan Chila', 'besan 100; springonion 50 finely chopped', 'gchilli 3 finely chopped; tomato 40 chopped',
            'A fragrant besan chila with spring onions.')
flour_chila('Dill (Suva) Besan Chila', 'besan 100; dill 20 chopped', 'onion 40 finely chopped; gchilli 3 finely chopped',
            'Besan chila with fresh dill leaves, aromatic and good for digestion.')
flour_chila('Bathua Besan Chila', 'besan 100; bathua 40 finely chopped', 'onion 40 finely chopped; gchilli 3 finely chopped',
            'A winter besan chila with bathua greens.')
flour_chila('Peas Besan Chila', 'besan 100; peas 50 coarsely crushed', 'onion 40 finely chopped; gchilli 3 finely chopped',
            'Besan chila with crushed green peas for extra protein.')
flour_chila('Soya Besan Chila', 'besan 70; soyagran 25 soaked, squeezed', VEG1, 'A very high-protein chila with soya granules in the batter.')
flour_chila('Oats Beetroot Chila', 'oats 60 powdered; besan 40; beet 50 grated', 'onion 40 finely chopped; gchilli 3',
            'A pink oats chila with beetroot.', rest=15)
flour_chila('Singhara Chila', 'singhara 80; potato 60 boiled, mashed', 'gchilli 3 finely chopped; coriander 6 chopped',
            'A water-chestnut flour chila for fasting days.', spice='jeerapowder 1; pepper 0.5; salt', water=150, tags=('fast',))
flour_chila('Moong Sprouts Besan Chila', 'besan 90; sprouts 60 roughly chopped', 'onion 40 finely chopped; gchilli 3 finely chopped',
            'A crunchy besan chila with chopped sprouts.')

# Soaked dal chilas
dal_chila('Masoor Palak Chila', 'masoor 120; spinach 50', 'onion 40 finely chopped; coriander 6 chopped', 'A green red-lentil chila with spinach.', soak='2 hours')
dal_chila('Moong Methi Chila', 'moong 120', 'methi 30 finely chopped; onion 30 finely chopped', 'Moong dal chila with fresh fenugreek leaves.')
dal_chila('Moong Beetroot Chila', 'moong 120; beet 50', 'onion 30 finely chopped; coriander 6', 'A pink moong dal chila with beetroot blended into the batter.')
dal_chila('Moong Carrot Chila', 'moong 120', 'carrot 60 grated; onion 30 finely chopped; coriander 6', 'Moong dal chila with grated carrot.')
dal_chila('Chana Masoor Chila', 'chanadal 60; masoor 60', 'onion 40 finely chopped; coriander 6', 'A crisp chila from chana and masoor dal.')
dal_chila('Green Moong Palak Chila', 'gmoong 120; spinach 50', 'onion 40 finely chopped; coriander 6', 'Whole green moong chila with spinach, rich in fibre and iron.',
          soak='6–8 hours')
dal_chila('Moong Corn Chila', 'moong 120', 'corn 50; capsicum 30 finely chopped; coriander 6', 'Moong dal chila with sweet corn and capsicum.')
dal_chila('Moong Oats Chila', 'moong 90; oats 30', 'onion 40 finely chopped; coriander 6', 'Moong dal and oats chila, rich in protein and soluble fibre.')
dal_chila('Mixed Dal Paneer Chila', 'moong 50; masoor 40; chanadal 30', 'coriander 6', 'A three-dal chila stuffed with spiced paneer.',
          filling='paneer 80 grated; onion 30 finely chopped; chaat 1; coriander 4', fill_txt='Mix the grated paneer with onion, chaat masala and coriander.')
dal_chila('Masoor Paneer Chila', 'masoor 120', 'coriander 6', 'Red lentil chila filled with paneer.', soak='2 hours',
          filling='paneer 80 grated; capsicum 20 finely chopped; chaat 1', fill_txt='Mix the paneer with capsicum and chaat masala.')
dal_chila('Urad Masoor Chila', 'masoor 80; urad 40', 'onion 40 finely chopped; coriander 6', 'A soft, slightly spongy chila from masoor and urad dal.')

# Fermented dosas
fermented_dosa('Tomato Dosa', 'idlirice 200', 'A tangy orange dosa with tomato purée in the batter.', batter_add='tomato 150 puréed; redchilli 2',
               add_txt='Blend tomatoes and red chillies to a smooth purée and stir into the fermented batter.')
fermented_dosa('Palak Paneer Dosa', 'idlirice 200', 'Green spinach dosa filled with spiced paneer.', batter_add='spinach 100 blanched',
               add_txt='Blend the blanched spinach to a purée and mix into the batter.',
               filling='paneer 160 crumbled; onion 60; tomato 60; haldi 0.3; pavbhaji 2; oil 6; salt; coriander 6',
               fill_txt='Sauté onion and tomato with spices, add the paneer and toss for 1 minute.')
fermented_dosa('Beetroot Masala Dosa', 'idlirice 200', 'Pink beetroot dosa with potato masala.', batter_add='beet 100 grated',
               add_txt='Blend the beetroot to a purée and stir into the batter.', filling=POTATO, fill_txt=POTATO_TXT)
fermented_dosa('Millet Masala Dosa', 'foxtail 200', 'Crisp foxtail millet dosa with potato masala.', filling=POTATO, fill_txt=POTATO_TXT)
fermented_dosa('Brown Rice Masala Dosa', 'brice 200', 'Brown rice dosa with potato masala.', filling=POTATO, fill_txt=POTATO_TXT)
fermented_dosa('Kodo Millet Onion Dosa', 'kodo 200', 'Kodo millet dosa topped with onions.', topping='onion 120 finely chopped; gchilli 6; coriander 8',
               top_txt='Sprinkle the onion, chilli and coriander over the dosa and press lightly.')
fermented_dosa('Egg Masala Dosa', 'idlirice 200', 'Egg-topped dosa with a potato masala filling.', topping='egg 200 beaten; pepper 1',
               top_txt='Spread 2 tbsp beaten egg over the dosa and cook until set.', filling=POTATO, fill_txt=POTATO_TXT)
fermented_dosa('Sprouts Masala Dosa', 'idlirice 200', 'Dosa filled with a spicy sprouts usal.',
               filling='mixsprouts 250 steamed; onion 80; tomato 80; haldi 0.3; chilli 1; garam 1; oil 8; salt; coriander 6',
               fill_txt='Sauté onion and tomato with spices, add the steamed sprouts and cook 3 minutes.')
fermented_dosa('Gobi Masala Dosa', 'idlirice 200', 'Dosa filled with spiced cauliflower.',
               filling='cauliflower 300 finely chopped; onion 80; tomato 60; haldi 0.5; chilli 1; garam 1; oil 8; salt; coriander 6',
               fill_txt='Sauté onion, add cauliflower, tomato and spices, cover and cook until tender and dry.')
fermented_dosa('Soya Keema Dosa', 'idlirice 200', 'Dosa filled with spicy soya keema, very high in protein.',
               filling='soyagran 80 soaked, squeezed; onion 80; tomato 80; peas 50; garam 1; chilli 1; oil 8; salt; coriander 6',
               fill_txt='Sauté onion and tomato, add soya granules, peas and spices and cook until dry.')
fermented_dosa('Mixed Vegetable Masala Dosa', 'idlirice 200', 'Dosa filled with a potato-vegetable masala.',
               filling='potato 200 boiled; carrot 60; peas 60; beans 50; onion 80; haldi 0.5; mustard 2; curryleaf 1.5; oil 8; salt',
               fill_txt='Temper mustard and curry leaves, sauté onion and vegetables until tender, add potato and turmeric and mash lightly.')
fermented_dosa('Coriander Dosa', 'idlirice 200', 'A green dosa with fresh coriander and chilli blended into the batter.', batter_add='coriander 40; gchilli 3',
               add_txt='Grind coriander and chilli to a paste and mix into the batter.')
fermented_dosa('Moringa Leaf Dosa', 'idlirice 200', 'A nutrient-dense dosa with moringa leaves in the batter.', batter_add='moringaleaf 30',
               add_txt='Chop the moringa leaves finely and stir them into the batter.')
fermented_dosa('Pumpkin Dosa', 'idlirice 200', 'A soft orange dosa with pumpkin purée.', batter_add='pumpkin 150 steamed',
               add_txt='Blend the steamed pumpkin and mix into the batter.')
fermented_dosa('Little Millet Masala Dosa', 'kutki 200', 'Little millet dosa with potato masala.', filling=POTATO, fill_txt=POTATO_TXT)
fermented_dosa('Barnyard Millet Masala Dosa', 'sama 200', 'Barnyard millet dosa with potato masala.', filling=POTATO, fill_txt=POTATO_TXT)
fermented_dosa('Red Rice Onion Dosa', 'rrice 200', 'Red rice dosa topped with onions.', topping='onion 120 finely chopped; gchilli 6; coriander 8',
               top_txt='Sprinkle the onion mixture over the dosa and press lightly.')
fermented_dosa('Carrot Onion Dosa', 'idlirice 200', 'Dosa topped with grated carrot and onion.', topping='carrot 100 grated; onion 80 finely chopped; coriander 8',
               top_txt='Sprinkle the carrot-onion mixture over the dosa and press lightly.')
fermented_dosa('Paneer Onion Podi Dosa', 'idlirice 200', 'Podi dosa topped with grated paneer and onion.', topping='podi 24; paneer 100 grated; onion 60 finely chopped; sesameoil 8',
               top_txt='Sprinkle podi, paneer and onion over the dosa and drizzle a few drops of sesame oil.')

# Instant dosas
instant_dosa('Oats Onion Dosa', 'oats 90 powdered; rava 40; ricefl 40', 'Instant oats dosa with plenty of onion.', curd='curd 60',
             extra='onion 100 finely chopped; gchilli 6; curryleaf 1.5; jeera 1.25; coriander 8')
instant_dosa('Instant Ragi Oats Dosa', 'ragi 80; oats 60 powdered; ricefl 30', 'A crisp instant dosa with ragi and oats.', curd='curd 30')
instant_dosa('Instant Multigrain Dosa', 'jowar 50; bajra 40; ragi 40; ricefl 40', 'An instant dosa from four flours.', curd='curd 30')
instant_dosa('Instant Rice Flour Dosa', 'ricefl 160; rava 20', 'A quick, crisp rice flour dosa.', curd='curd 30')
instant_dosa('Coconut Rava Dosa', 'rava 85; ricefl 65; atta 30', 'Instant rava dosa with fresh coconut.', curd='curd 30',
             extra='coconut 30; onion 40; gchilli 3; curryleaf 1.5; jeera 1.25; coriander 6')
instant_dosa('Millet Rava Dosa', 'kutki 120 powdered; rava 40; ricefl 30', 'Instant little millet rava dosa.', curd='curd 30')
instant_dosa('Moong Dal Instant Dosa', 'moong 150 soaked 2 hours, ground', 'A protein-rich instant dosa from ground moong dal.', thin=False, water=120)
instant_dosa('Kuttu Dosa', 'kuttu 120; sama 40 powdered', 'A buckwheat dosa for fasting days.', extra='gchilli 3; jeera 1.25; coriander 6', thin=False)

# Soaked (no-ferment) dosas
soaked_dosa('Masoor Dal Dosa', 'masoor 160; rice 20', 'A quick red lentil dosa, rich in protein.', hours='2 hours')
soaked_dosa('Moong Masoor Dosa', 'moong 80; masoor 80; rice 20', 'A protein-packed dosa from moong and masoor dal.', hours='3 hours')
soaked_dosa('Millet Adai', 'foxtail 100; toor 40; chanadal 40; urad 20', 'Protein-rich adai made with foxtail millet.', topping='onion 60 finely chopped; coriander 6')
soaked_dosa('Quinoa Adai', 'quinoa 100; toor 40; chanadal 40; moong 20', 'An adai made with quinoa and mixed dals.', topping='onion 60 finely chopped; coriander 6')
soaked_dosa('Chana Moong Dosa', 'chanadal 80; moong 80; rice 20', 'A crisp dosa from chana and moong dal.')
soaked_dosa('Green Moong Spinach Pesarattu', 'gmoong 160; rice 20; spinach 60', 'Pesarattu with spinach blended in.', extra='ginger 10; gchilli 6; jeera 1.25',
            topping='onion 50 finely chopped', hours='6–8 hours')

# Idlis
fermented_idli('Multigrain Idli', 'idlirice 140; foxtail 70; kutki 70', 'Soft idlis from rice and two millets.')
fermented_idli('Bajra Idli', 'idlirice 140; bajra 140', 'Soft idlis with pearl millet flour stirred into the batter.')
fermented_idli('Jowar Idli (Fermented)', 'idlirice 140; jowar 140', 'Fermented idlis with jowar flour.')
fermented_idli('Beetroot Idli', 'idlirice 280', 'Pink fermented idlis with beetroot purée.', add='beet 80 puréed', add_txt='Fold the beetroot purée into the batter.')
fermented_idli('Methi Idli', 'idlirice 280', 'Idlis with fresh methi leaves.', add='methi 40 finely chopped', add_txt='Fold the chopped methi into the batter.')
fermented_idli('Corn Idli', 'idlirice 280', 'Idlis with crushed sweet corn.', add='corn 100 crushed', add_txt='Fold the crushed corn into the batter.')
fermented_idli('Vegetable Idli', 'idlirice 280', 'Idlis studded with carrot, peas and beans.', add='carrot 50 grated; peas 40; beans 30 finely chopped; coriander 6',
               add_txt='Fold the vegetables and coriander into the batter.')
fermented_idli('Oats Fermented Idli', 'idlirice 180; oats 100', 'Idlis with oats ground into the batter.')
instant_idli('Poha Rava Idli', 'rava 110; poha 60 powdered', 'Soft instant idlis with poha and rava.')
instant_idli('Quinoa Rava Idli', 'quinoa 80 powdered; rava 90', 'Instant idlis with powdered quinoa.')
instant_idli('Semiya Idli', 'semiya 100 roasted; rava 60', 'Instant idlis made with roasted vermicelli.')
instant_idli('Millet Rava Idli', 'kutki 100 powdered; rava 60', 'Instant idlis from little millet rava.')
instant_idli('Palak Rava Idli', 'rava 170', 'Green instant rava idlis with spinach.', add='spinach 80 blanched, puréed')
instant_idli('Carrot Rava Idli', 'rava 170', 'Instant rava idlis with grated carrot.', add='carrot 80 grated')
instant_idli('Methi Rava Idli', 'rava 170', 'Instant rava idlis with fresh methi.', add='methi 40 finely chopped')
instant_idli('Peas Rava Idli', 'rava 170', 'Instant rava idlis with green peas.', add='peas 80')

# Uttapams
uttapam('Carrot Coriander Uttapam', 'idlirice 200', 'carrot 100; coriander 10; gchilli 6', 'Uttapam topped with grated carrot and coriander.')
uttapam('Capsicum Onion Uttapam', 'idlirice 200', 'capsicum 80; onion 80; gchilli 6; coriander 8', 'Uttapam topped with capsicum and onion.')
uttapam('Beetroot Uttapam', 'idlirice 200', 'beet 80 grated; onion 60; coriander 8', 'Uttapam topped with grated beetroot.')
uttapam('Podi Onion Uttapam', 'idlirice 200', 'onion 100; podi 24; coriander 8', 'Onion uttapam sprinkled with spicy podi.')
uttapam('Mushroom Uttapam', 'idlirice 200', 'mushroom 120; onion 60; capsicum 40', 'Uttapam topped with mushrooms.')
uttapam('Cabbage Uttapam', 'idlirice 200', 'cabbage 100 finely shredded; onion 60; gchilli 6', 'Uttapam topped with shredded cabbage.')
uttapam('Tomato Uttapam', 'idlirice 200', 'tomato 150; gchilli 6; coriander 8', 'Uttapam topped with juicy tomatoes.')
uttapam('Oats Vegetable Uttapam', 'oats 100 powdered; rava 50', 'onion 60; carrot 50; capsicum 40; coriander 8', 'Instant oats uttapam with vegetables.', instant=True)
uttapam('Sprouts Uttapam', 'idlirice 200', 'sprouts 100; onion 60; coriander 8; gchilli 6', 'Uttapam topped with moong sprouts.')
uttapam('Kodo Millet Uttapam', 'kodo 200', 'onion 80; tomato 60; coriander 8', 'Kodo millet uttapam with onion and tomato.')
uttapam('Jowar Uttapam', 'jowar 120; rava 50', 'onion 80; tomato 60; coriander 8; gchilli 6', 'An instant jowar uttapam.', instant=True)
uttapam('Little Millet Uttapam', 'kutki 200', 'onion 80; carrot 50; coriander 8', 'Little millet uttapam with vegetables.')

# Appe
appe('Palak Appe', 'rava 120; curd 120', 'spinach 60 finely chopped; onion 40; gchilli 3; eno 3', 'Instant green appe with spinach.')
appe('Beetroot Appe', 'rava 120; curd 120', 'beet 60 grated; onion 40; gchilli 3; eno 3', 'Pink rava appe with beetroot.')
appe('Corn Appe', 'rava 120; curd 120', 'corn 80; capsicum 30; gchilli 3; eno 3', 'Instant rava appe with sweet corn.')
appe('Paneer Appe', 'rava 100; curd 120', 'paneer 80 grated; onion 40; coriander 6; eno 3', 'Rava appe with paneer for extra protein.')
appe('Methi Appe', 'besan 80; rava 40; curd 100', 'methi 40 chopped; onion 40; gchilli 3; eno 3', 'Besan-rava appe with fresh methi.')
appe('Quinoa Appe', 'quinoa 100 soaked and ground; rava 30', 'onion 40; carrot 40 grated; gchilli 3; eno 3', 'Protein-rich quinoa appe.')
appe('Jowar Appe', 'jowar 100; rava 30; curd 120', 'onion 40; carrot 40 grated; coriander 6; eno 3', 'Gluten-light jowar appe.')
appe('Sweet Banana Appe', 'atta 80; rava 30', 'banana 150 mashed; jaggery 30; elaichipowder 1; coconut 15', 'Soft, sweet banana appe, a kids’ favourite.', sweet=True)
appe('Sweet Rava Coconut Appe', 'rava 100; curd 60', 'coconut 40; jaggery 40; elaichipowder 1; eno 3', 'Mildly sweet rava-coconut appe.', sweet=True)
