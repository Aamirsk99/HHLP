"""Volume 2 - dals, sambar, rasam, kadhi and legume curries."""
import core
from fam_dal import dal, sambar, rasam, kadhi
from fam_legume import legume

core.VOLUME = 2

dal('Masoor Palak Dal', 'masoor 150', 'Red lentils cooked with spinach and a garlicky tadka.', tadka='garlic', finish='spinach 150 chopped',
    add_txt='Stir the spinach into the cooked dal and simmer for 3 minutes.')
dal('Moong Methi Dal', 'moong 150', 'Yellow moong dal with fresh fenugreek leaves.', tadka='jeera', finish='methi 50 chopped',
    add_txt='Add the methi and simmer for 4 minutes.')
dal('Toor Drumstick Dal', 'toor 150', 'Toor dal cooked with drumsticks, South Indian home style.', tadka='south', add='drumstick 120 cut in 3-inch pieces')
dal('Chana Dal Palak', 'chanadal 150', 'Chana dal with spinach in an onion-tomato tadka.', tadka='onion', soak=60, finish='spinach 150 chopped',
    add_txt='Add the spinach and simmer 4 minutes.')
dal('Lahsuni Masoor Dal', 'masoor 150', 'Red lentil dal with a bold garlic tadka.', tadka='garlic')
dal('Bengali Bhaja Moong Dal', 'moong 150 dry-roasted', 'Bengali roasted moong dal with ginger and peas.', tadka='bengali', add='peas 60')
dal('Tomato Moong Dal', 'moong 150', 'Moong dal cooked with plenty of tomato.', tadka='south', add='tomato 150 chopped')
dal('Toor Lauki Dal', 'toor 150', 'Toor dal with bottle gourd, light and soothing.', tadka='jeera', add='lauki 200 cubed')
dal('Chana Dal Pumpkin', 'chanadal 150', 'Chana dal with sweet pumpkin.', tadka='onion', soak=60, add='pumpkin 200 cubed')
dal('Masoor Lauki Dal', 'masoor 150', 'Red lentils with bottle gourd.', tadka='jeera', add='lauki 200 cubed')
dal('Bathua Dal', 'toor 150', 'Toor dal with winter bathua greens.', tadka='garlic', finish='bathua 100 chopped', add_txt='Add the bathua and simmer 5 minutes.')
dal('Suva Dal (Dill Dal)', 'moong 150', 'Moong dal with fresh dill leaves.', tadka='jeera', finish='dill 30 chopped', add_txt='Add the dill and simmer 3 minutes.')
dal('Kerala Parippu Curry', 'moong 150', 'Kerala moong dal with coconut, served with ghee and rice at a sadya.', tadka='south', finish='coconut 40 ground with jeera; coriander 4',
    add_txt='Grind the coconut with cumin and green chilli, add to the dal and simmer 3 minutes.')
dal('Dhaba Dal Tadka', 'toor 100; chanadal 50', 'Smoky dhaba-style dal tadka with a double tempering.', tadka='onion', soak=30)
dal('Moong Masoor Palak Dal', 'moong 80; masoor 70', 'Mixed dal with spinach.', tadka='garlic', finish='spinach 120 chopped', add_txt='Add the spinach and simmer 3 minutes.')
dal('Mixed Dal with Vegetables', 'toor 50; moong 50; masoor 50', 'Three dals cooked with mixed vegetables.', tadka='jeera', add='carrot 60; beans 50; lauki 80; tomato 60')
dal('Dhuli Urad Dal', 'urad 150', 'Dry-style Punjabi white urad dal with ginger and onion tadka.', tadka='onion', soak=60)
dal('Kashmiri Moong Dal', 'moong 150', 'Kashmiri-style moong dal with fennel and dry ginger.', tadka='jeera', add='sounthpowder 2; dryginger 1')
dal('Moong Raw Banana Dal', 'moong 150', 'Moong dal with raw banana, a Bengali-style home dal.', tadka='bengali', add='rawbanana 100 cubed')
dal('Toor Spinach Dal (Keerai Paruppu)', 'toor 150', 'Tamil spinach dal mashed with garlic and cumin.', tadka='south', add='spinach 150 chopped')
dal('Chana Dal Fry', 'chanadal 150', 'Restaurant-style chana dal fry.', tadka='onion', soak=60)
dal('Masoor Tomato Dal', 'masoor 150', 'Quick red lentils with tomato.', tadka='jeera', add='tomato 150 chopped')
dal('Moong Dal with Moringa Leaves', 'moong 150', 'Moong dal with moringa leaves, a highly nutritious dal.', tadka='south', finish='moringaleaf 40',
    add_txt='Add the moringa leaves and simmer 5 minutes.')
dal('Rajasthani Chana Dal with Lauki', 'chanadal 120', 'Rajasthani dal of chana dal and lauki with ghee and spices.', tadka='onion', soak=60, add='lauki 200')

sambar('Tomato Sambar', 'tomato 250; onion 80', 'A tangy, quick sambar with tomatoes.', sour='tamarind 10')
sambar('Brinjal Drumstick Sambar', 'brinjal 120; drumstick 100; onion 60; tomato 60', 'Sambar with brinjal and drumsticks.')
sambar('Carrot Sambar', 'carrot 200; onion 60; tomato 60', 'A mildly sweet carrot sambar.')
sambar('Beans Sambar', 'beans 200; onion 60; tomato 60', 'Sambar with French beans.')
sambar('Raw Banana Sambar', 'rawbanana 150; onion 60; tomato 60', 'Sambar with raw banana.')
sambar('Snake Gourd Sambar', 'snakegourd 250; onion 60; tomato 60', 'A light snake gourd sambar.')
sambar('Ridge Gourd Sambar', 'tori 250; onion 60; tomato 60', 'Sambar with ridge gourd.')
sambar('Udupi Capsicum Sambar', 'capsicum 200; onion 60; tomato 60', 'Udupi-style capsicum sambar with coconut.', extra='coconut 30; dhaniaseed 3')
sambar('Cucumber Sambar (Mangalore)', 'cucumber 250; tomato 60', 'Mangalorean cucumber sambar with coconut.', extra='coconut 30; dhaniaseed 3')
sambar('Methi Sambar', 'methi 80; onion 60; tomato 80', 'Sambar with fresh fenugreek leaves.')
sambar('Masoor Dal Sambar', 'drumstick 80; carrot 60; onion 60; tomato 60', 'A quick sambar made with masoor dal.', dals='masoor 120')
sambar('Moringa Leaf Sambar', 'moringaleaf 40; onion 60; tomato 80', 'Sambar with moringa leaves.')
sambar('Sweet Potato Sambar', 'sweetpotato 200; onion 60; tomato 60', 'A mildly sweet sambar with sweet potato.')
sambar('Chow Chow Carrot Sambar', 'ashgourd 150; carrot 100; onion 60; tomato 60', 'A light sambar with ash gourd and carrot.')

rasam('Orange Rasam', 'orange 150 juice', 'A fruity, tangy rasam with fresh orange juice.', sour='tomato 100', dals='moong 30')
rasam('Puli Rasam (Tamarind Rasam)', '', 'A simple tamarind rasam without dal.', sour='tamarind 20; tomato 60')
rasam('Coriander Rasam', 'coriander 30', 'Rasam with plenty of fresh coriander.', dals='toor 40')
rasam('Curry Leaf Rasam', 'curryleaf 6', 'A fragrant curry leaf rasam.', dals='moong 30')
rasam('Beetroot Rasam', 'beet 120 grated', 'A colourful beetroot rasam.', dals='toor 40')
rasam('Moong Dal Rasam', '', 'A light moong dal rasam.', dals='moong 50')
rasam('Spinach Rasam', 'spinach 80 chopped', 'Rasam with spinach.', dals='toor 40')
rasam('Kokum Rasam', 'kokum 9', 'A tangy kokum rasam.', sour='tomato 100')
rasam('Raw Mango Rasam', 'rawmango 100', 'A summer rasam with raw mango.', sour='tomato 80', dals='toor 40')
rasam('Tomato Dal Rasam with Garlic', 'garlic 12', 'A hearty tomato rasam with dal and garlic.', dals='toor 50')

kadhi('Lauki Kadhi', 'Kadhi with soft bottle gourd.', veg='lauki 200 cubed')
kadhi('Drumstick Kadhi', 'Kadhi with drumsticks.', veg='drumstick 120')
kadhi('Mixed Vegetable Kadhi', 'Kadhi with carrot, beans and potato.', veg='carrot 60; beans 60; potato 80')
kadhi('Oats Kadhi', 'Kadhi thickened with powdered oats instead of besan.', besan='oats 40 powdered')
kadhi('Raw Mango Kadhi', 'Tangy kadhi with raw mango, a summer special.', veg='rawmango 80 cubed', sweet='jaggery 10')
kadhi('Tomato Kadhi', 'A tangy kadhi with tomato.', veg='tomato 150 chopped')
kadhi('Spinach Moong Pakodi Kadhi', 'Kadhi with spinach and steamed moong pakodis.', veg='spinach 80 chopped',
      dumplings='moong 80 soaked and ground; ginger 5; gchilli 3; salt; soda', simmer=20)

# Legume curries in new styles
legume('Bengali Rajma', 'rajma 200', 'Rajma cooked with Bengali spices and mustard oil.', style='bengali', simmer=20)
legume('Chana Masala Maharashtrian', 'chickpea 200', 'Chickpeas in a Maharashtrian goda masala and coconut gravy.', style='maharashtrian')
legume('Bengali Chhola', 'chickpea 200', 'Bengali-style chickpeas with coconut bits.', style='bengali', finish='coconut 20 small pieces; coriander 8')
legume('Kala Chana Masala Punjabi', 'kalachana 200', 'Punjabi black chickpeas in a spicy tomato masala.', add='amchur 2')
legume('Kala Chana Usal', 'kalachana 200', 'Maharashtrian black chickpea usal.', style='maharashtrian')
legume('Lobia Maharashtrian (Chawli Usal)', 'lobia 180', 'Black-eyed beans in a Maharashtrian masala.', style='maharashtrian', soak=6, whistles='3')
legume('Bengali Lobia', 'lobia 180', 'Black-eyed beans with Bengali spices.', style='bengali', soak=6, whistles='3')
legume('Green Moong Coconut Curry', 'gmoong 180', 'Whole moong in a coconut gravy.', style='south', soak=6, whistles='3')
legume('Vatana Usal', 'whitepeas 200', 'Maharashtrian white peas usal.', style='maharashtrian')
legume('Bengali Matar Ghugni', 'whitepeas 200', 'Bengali white peas ghugni with ginger.', style='bengali', add='potato 100')
legume('Soya Chunks Coconut Curry', 'soya 100', 'Soya chunks in a South Indian coconut gravy.', style='south', soak=0,
       cook_txt='Boil the soya chunks for 5 minutes, rinse and squeeze dry.', simmer=10)
legume('Soya Chunks Usal', 'soya 100', 'Soya chunks in a Maharashtrian masala.', style='maharashtrian', soak=0,
       cook_txt='Boil the soya chunks for 5 minutes, rinse and squeeze dry.', simmer=10)
legume('Moth Dal Curry (Punjabi)', 'moth 180', 'Moth beans in a Punjabi masala.', soak=6, whistles='3')
legume('Kollu Kuzhambu (Horse Gram Curry)', 'kulthi 180', 'Horse gram in a South Indian coconut gravy.', style='south', whistles='6–8')
legume('Pavta Usal (Double Beans)', 'rajmabeans 180', 'Maharashtrian double beans usal.', style='maharashtrian')
legume('Double Beans Masala', 'rajmabeans 180', 'Lima beans in a Punjabi masala.')
legume('Dried Green Peas Masala', 'drygreenpeas 200', 'Dried green peas in a Punjabi masala.')
legume('Mixed Sprouts Masala', 'mixsprouts 250', 'Mixed sprouts in a Punjabi masala.', soak=0, cook_txt='Steam the sprouts for 1 whistle until just soft.')
legume('Mixed Sprouts Coconut Curry', 'mixsprouts 250', 'Mixed sprouts in a coconut gravy.', style='south', soak=0, cook_txt='Steam the sprouts for 1 whistle.')
legume('Chole Aloo', 'chickpea 180', 'Chickpeas and potatoes in chole masala.', add='potato 200 cubed; chole 4', add_txt='Add the potatoes and cook covered for 8 minutes.')
legume('Rajma Aloo', 'rajma 180', 'Rajma with potatoes.', add='potato 200 cubed', add_txt='Add the potatoes and cook covered for 8 minutes.', simmer=20)
legume('Kala Chana Aloo', 'kalachana 180', 'Black chickpeas with potatoes.', add='potato 200 cubed', add_txt='Add the potatoes and cook covered for 8 minutes.')
legume('Lobia Aloo', 'lobia 160', 'Black-eyed beans with potatoes.', soak=6, whistles='3', add='potato 200 cubed', add_txt='Add the potatoes and cook 8 minutes.')
legume('Soya Aloo', 'soya 80', 'Soya chunks and potatoes in a homestyle masala.', soak=0, cook_txt='Boil the soya chunks 5 minutes, rinse and squeeze.',
       add='potato 200 cubed', add_txt='Add the potatoes and cook 8 minutes.', simmer=10)
legume('Chana Methi', 'chickpea 180', 'Chickpeas with fresh methi leaves.', add='methi 80 chopped', add_txt='Add the methi and cook 4 minutes.')
legume('Chana Lauki', 'chickpea 160', 'Chickpeas with bottle gourd.', add='lauki 250 cubed', add_txt='Add the lauki and cook covered 8 minutes.')
