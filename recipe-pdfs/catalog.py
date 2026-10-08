"""
Ingredient catalog: nutrition per 100 g (raw / as purchased), household units and tags.
Values are rounded approximations from IFCT 2017 and USDA FoodData Central.

K(key, name, kcal, protein, carbs, fat, fibre, units, category, tags)
  units  "cup:90,tbsp:7"  grams per household unit ("g" = show grams only, "ml" = show millilitres)
  tags   diet / allergen: dairy egg chicken mutton fish shellfish gluten nuts peanut soy sesame mustard
         flags: K (potassium-rich)  VK (vitamin K-rich)  SUG (added sugar)  NSUG (natural sugar)
                SF (saturated fat)  NA (high sodium)  PUR (purine-rich)  RAW (eaten raw / sprouted)
"""
CAT = {}


def K(key, name, kcal, p, c, f, fib, units, cat, tags=''):
    us = []
    for u in units.split(','):
        if ':' in u:
            lab, g = u.split(':')
            us.append((lab, float(g)))
        else:
            us.append((u, 1.0))
    CAT[key] = dict(key=key, name=name, kcal=kcal, p=p, c=c, f=f, fib=fib, units=us, cat=cat,
                    tags=set(tags.split()))


# Grains, flours, breads
K('atta', 'Whole-wheat flour (atta)', 341, 12.1, 69.4, 1.7, 11.2, 'cup:120,tbsp:8', 'grain', 'gluten')
K('mgatta', 'Multigrain atta', 350, 12.5, 66, 3, 12, 'cup:120,tbsp:8', 'grain', 'gluten')
K('rice', 'Rice (raw)', 356, 7, 78, 0.5, 1.3, 'cup:190,tbsp:12', 'grain')
K('basmati', 'Basmati rice', 356, 7.5, 78, 0.6, 1.3, 'cup:190', 'grain')
K('brice', 'Brown rice', 360, 7.5, 76, 2.7, 3.5, 'cup:190', 'grain')
K('rrice', 'Red / matta rice', 350, 7.5, 76, 2, 4, 'cup:190', 'grain')
K('idlirice', 'Idli (parboiled) rice', 350, 7, 78, 0.6, 1.5, 'cup:200', 'grain')
K('poha', 'Poha (thick flattened rice)', 346, 6.6, 77, 1.2, 2, 'cup:75', 'grain')
K('rpoha', 'Red poha', 346, 7, 75, 1.5, 3, 'cup:75', 'grain')
K('rava', 'Rava / suji (semolina)', 348, 10.4, 72, 0.8, 3.9, 'cup:170,tbsp:11', 'grain', 'gluten')
K('dalia', 'Dalia (broken wheat)', 342, 11.8, 69, 1.5, 12.5, 'cup:160', 'grain', 'gluten')
K('oats', 'Rolled oats', 389, 13, 67, 7, 10, 'cup:90,tbsp:6', 'grain')
K('ragi', 'Ragi (finger millet) flour', 328, 7.3, 72, 1.3, 11, 'cup:110,tbsp:8', 'grain')
K('jowar', 'Jowar (sorghum) flour', 349, 10.4, 72.6, 1.9, 9.7, 'cup:120', 'grain')
K('bajra', 'Bajra (pearl millet) flour', 361, 11.6, 67, 5, 11.5, 'cup:120', 'grain')
K('makki', 'Makki (maize) flour', 362, 9, 73, 3.8, 7, 'cup:120', 'grain')
K('besan', 'Besan (gram flour)', 387, 22, 58, 6.7, 10.8, 'cup:90,tbsp:7', 'pulse')
K('quinoa', 'Quinoa', 368, 14, 64, 6, 7, 'cup:170', 'grain')
K('foxtail', 'Foxtail millet', 351, 12.3, 60, 4.3, 8, 'cup:190', 'grain')
K('kodo', 'Kodo millet', 353, 8.3, 66, 1.4, 9, 'cup:190', 'grain')
K('sama', 'Barnyard millet (sama)', 342, 6.2, 65, 2.2, 10, 'cup:190', 'grain')
K('kutki', 'Little millet (kutki)', 341, 7.7, 67, 4.7, 7.6, 'cup:190', 'grain')
K('sabudana', 'Sabudana (sago)', 351, 0.2, 87, 0.2, 0.9, 'cup:150', 'grain')
K('semiya', 'Whole-wheat vermicelli (semiya)', 350, 10, 75, 1, 3, 'cup:80', 'grain', 'gluten')
K('ricefl', 'Rice flour', 366, 6, 80, 1.4, 2.4, 'cup:130,tbsp:9', 'grain')
K('kuttu', 'Kuttu (buckwheat) flour', 343, 13, 71, 3.4, 10, 'cup:120', 'grain')
K('rajgira', 'Rajgira (amaranth) flour', 371, 13.6, 65, 7, 6.7, 'cup:120', 'grain')
K('singhara', 'Singhara (water chestnut) flour', 350, 5, 80, 0.5, 4, 'cup:120', 'grain')
K('bread', 'Whole-wheat bread', 250, 12, 43, 3.5, 6, 'slice:30', 'grain', 'gluten NA')
K('sattu', 'Sattu (roasted gram flour)', 406, 22, 64, 5.6, 18, 'cup:100,tbsp:10', 'pulse')
K('puffrice', 'Murmura (puffed rice)', 402, 6.3, 90, 0.5, 1.7, 'cup:15', 'grain')
K('makhana', 'Makhana (fox nuts)', 347, 9.7, 77, 0.1, 14.5, 'cup:20', 'grain')
K('cornflour', 'Cornflour', 381, 0.3, 91, 0.1, 0.9, 'tbsp:8,tsp:3', 'grain')
K('noodles', 'Whole-wheat noodles', 350, 12, 72, 2, 6, 'g', 'grain', 'gluten')
K('corn', 'Sweet corn kernels', 86, 3.3, 19, 1.4, 2.7, 'cup:150,tbsp:10', 'grain')

# Pulses, legumes, soy
K('urad', 'Urad dal (split, skinless)', 341, 25, 59, 1.6, 11, 'cup:200,tbsp:12', 'pulse', 'PUR')
K('wurad', 'Whole urad (black gram)', 341, 25, 59, 1.6, 18, 'cup:190', 'pulse', 'PUR')
K('moong', 'Moong dal (yellow)', 348, 24, 59, 1.2, 8, 'cup:200,tbsp:12', 'pulse')
K('gmoong', 'Whole green moong', 334, 23.9, 56.7, 1.3, 16, 'cup:190', 'pulse')
K('masoor', 'Masoor dal (red lentils)', 343, 25, 59, 1, 11, 'cup:200,tbsp:12', 'pulse')
K('wmasoor', 'Whole masoor (brown lentils)', 343, 25, 59, 1, 15, 'cup:190', 'pulse')
K('toor', 'Toor / arhar dal', 343, 22, 63, 1.5, 15, 'cup:200,tbsp:12', 'pulse')
K('chanadal', 'Chana dal', 360, 20.8, 60, 5.6, 12, 'cup:200,tbsp:12', 'pulse')
K('rajma', 'Rajma (kidney beans)', 333, 23, 60, 0.8, 25, 'cup:185', 'pulse', 'PUR')
K('chickpea', 'Kabuli chana (chickpeas)', 364, 19, 61, 6, 17, 'cup:200', 'pulse')
K('kalachana', 'Kala chana (black chickpeas)', 360, 17, 61, 5, 22, 'cup:200', 'pulse')
K('lobia', 'Lobia (black-eyed beans)', 336, 23.5, 60, 1.3, 10.6, 'cup:170', 'pulse')
K('moth', 'Moth beans (matki)', 330, 23.6, 56, 1.1, 9, 'cup:190', 'pulse')
K('kulthi', 'Kulthi (horse gram)', 321, 22, 57, 0.5, 5.3, 'cup:190', 'pulse')
K('whitepeas', 'Dried white peas (vatana)', 341, 20, 60, 1.2, 18, 'cup:190', 'pulse')
K('drygreenpeas', 'Dried green peas', 341, 22, 60, 1.2, 20, 'cup:190', 'pulse')
K('rajmabeans', 'Double beans (lima)', 338, 21, 63, 0.7, 19, 'cup:180', 'pulse')
K('sprouts', 'Moong sprouts', 30, 3, 6, 0.2, 1.8, 'cup:100', 'pulse', 'RAW')
K('mixsprouts', 'Mixed sprouts', 70, 6, 12, 0.5, 3, 'cup:100', 'pulse', 'RAW')
K('roastchana', 'Roasted chana (bhuna chana)', 369, 22.5, 58, 5.2, 18, 'cup:100,tbsp:10', 'pulse')
K('soya', 'Soya chunks', 345, 52, 33, 0.5, 13, 'cup:50', 'pulse', 'soy')
K('soyagran', 'Soya granules', 345, 52, 33, 0.5, 13, 'cup:90', 'pulse', 'soy')
K('tofu', 'Tofu (firm)', 76, 8, 1.9, 4.8, 0.3, 'g', 'pulse', 'soy')
K('soymilk', 'Soy milk (unsweetened)', 54, 3.3, 6, 1.8, 0.6, 'cup:240', 'drink', 'soy')

# Dairy
K('paneer', 'Paneer', 265, 18.3, 1.2, 20.8, 0, 'g', 'dairy', 'dairy SF')
K('lfpaneer', 'Low-fat paneer', 180, 22, 4, 8, 0, 'g', 'dairy', 'dairy')
K('curd', 'Curd (dahi)', 60, 3.1, 4.4, 3.3, 0, 'cup:245,tbsp:15', 'dairy', 'dairy')
K('hungcurd', 'Hung curd', 98, 9, 4, 5, 0, 'cup:220,tbsp:15', 'dairy', 'dairy')
K('milk', 'Toned milk', 58, 3.1, 4.7, 3, 0, 'cup:240,tbsp:15', 'dairy', 'dairy')
K('cream', 'Fresh cream (low-fat)', 195, 2.5, 4, 19, 0, 'tbsp:15', 'dairy', 'dairy SF')
K('ghee', 'Ghee', 900, 0, 0, 100, 0, 'tbsp:14,tsp:5', 'fat', 'dairy SF')
K('butter', 'Butter', 717, 0.9, 0.1, 81, 0, 'tsp:5', 'fat', 'dairy SF NA')
K('cheese', 'Cheese (grated)', 350, 25, 2, 27, 0, 'tbsp:7', 'dairy', 'dairy SF NA')

# Eggs, meat, fish
K('egg', 'Eggs', 143, 12.6, 0.7, 9.5, 0, 'nos:50', 'egg', 'egg')
K('eggwhite', 'Egg whites', 52, 10.9, 0.7, 0.2, 0, 'nos:33', 'egg', 'egg')
K('chicken', 'Chicken (boneless, skinless)', 120, 23, 0, 2.6, 0, 'g', 'meat', 'chicken')
K('chickencut', 'Chicken (curry cut, skinless)', 145, 20, 0, 7, 0, 'g', 'meat', 'chicken')
K('chickenmince', 'Chicken mince (keema)', 143, 17.4, 0, 8, 0, 'g', 'meat', 'chicken')
K('mutton', 'Mutton (lean goat meat)', 122, 20.5, 0, 4.5, 0, 'g', 'meat', 'mutton SF PUR')
K('muttonmince', 'Mutton mince (keema)', 200, 18, 0, 14, 0, 'g', 'meat', 'mutton SF PUR')
K('fish', 'Fish fillets (rohu / basa / pomfret)', 105, 18, 0, 3.5, 0, 'g', 'fish', 'fish')
K('pomfret', 'Pomfret', 96, 18.8, 0, 2.5, 0, 'g', 'fish', 'fish')
K('mackerel', 'Mackerel (bangda)', 205, 18.6, 0, 13.9, 0, 'g', 'fish', 'fish PUR')
K('prawn', 'Prawns (cleaned)', 85, 18, 1, 1, 0, 'g', 'fish', 'shellfish PUR')
K('crab', 'Crab', 87, 18, 0, 1.1, 0, 'g', 'fish', 'shellfish PUR')

# Vegetables
K('onion', 'Onion', 40, 1.1, 9.3, 0.1, 1.7, 'medium:100', 'veg')
K('shallot', 'Shallots (small onions)', 72, 2.5, 16.8, 0.1, 3.2, 'nos:10', 'veg')
K('tomato', 'Tomato', 18, 0.9, 3.9, 0.2, 1.2, 'medium:100', 'veg', 'K')
K('potato', 'Potato', 77, 2, 17, 0.1, 2.2, 'medium:150', 'veg', 'K')
K('sweetpotato', 'Sweet potato', 86, 1.6, 20, 0.1, 3, 'medium:150', 'veg', 'K')
K('carrot', 'Carrot', 41, 0.9, 9.6, 0.2, 2.8, 'medium:80', 'veg')
K('beet', 'Beetroot', 43, 1.6, 9.6, 0.2, 2.8, 'medium:120', 'veg', 'K')
K('capsicum', 'Capsicum', 20, 0.9, 4.6, 0.2, 1.7, 'medium:120', 'veg')
K('redcapsicum', 'Red / yellow bell pepper', 31, 1, 6, 0.3, 2.1, 'medium:120', 'veg')
K('cabbage', 'Cabbage', 25, 1.3, 5.8, 0.1, 2.5, 'cup:90', 'veg', 'VK')
K('cauliflower', 'Cauliflower', 25, 1.9, 5, 0.3, 2, 'cup:100', 'veg')
K('broccoli', 'Broccoli', 34, 2.8, 6.6, 0.4, 2.6, 'cup:90', 'veg', 'VK')
K('peas', 'Green peas', 81, 5.4, 14.5, 0.4, 5.1, 'cup:145,tbsp:9', 'veg')
K('beans', 'French beans', 31, 1.8, 7, 0.2, 2.7, 'cup:110', 'veg')
K('bhindi', 'Bhindi (okra)', 33, 1.9, 7.5, 0.2, 3.2, 'g', 'veg')
K('brinjal', 'Brinjal (baingan)', 25, 1, 6, 0.2, 3, 'g', 'veg')
K('lauki', 'Lauki (bottle gourd)', 15, 0.6, 3.4, 0.1, 0.5, 'cup:120', 'veg')
K('tori', 'Tori (ridge gourd)', 20, 1.2, 4.4, 0.2, 1.1, 'cup:120', 'veg')
K('tinda', 'Tinda (round gourd)', 21, 1.4, 3.4, 0.2, 1, 'g', 'veg')
K('parwal', 'Parwal (pointed gourd)', 20, 2, 2.2, 0.3, 3, 'g', 'veg')
K('karela', 'Karela (bitter gourd)', 17, 1, 3.7, 0.2, 2.8, 'g', 'veg')
K('kundru', 'Kundru (ivy gourd)', 18, 1.2, 3.1, 0.1, 1.6, 'g', 'veg')
K('arbi', 'Arbi (colocasia root)', 112, 1.5, 26, 0.2, 4, 'g', 'veg', 'K')
K('suran', 'Suran (elephant yam)', 118, 1.5, 28, 0.2, 4, 'g', 'veg', 'K')
K('pumpkin', 'Pumpkin (kaddu)', 26, 1, 6.5, 0.1, 0.5, 'cup:120', 'veg')
K('ashgourd', 'Ash gourd (petha)', 13, 0.4, 3, 0.2, 2.9, 'cup:120', 'veg')
K('snakegourd', 'Snake gourd', 18, 0.5, 3.3, 0.3, 0.6, 'cup:120', 'veg')
K('drumstick', 'Drumsticks (moringa pods)', 37, 2.1, 8.5, 0.2, 3.2, 'nos:40', 'veg')
K('rawbanana', 'Raw banana (plantain)', 122, 1.3, 32, 0.4, 2.3, 'nos:150', 'veg', 'K')
K('jackfruit', 'Raw jackfruit', 51, 2.6, 9.4, 0.3, 2.8, 'g', 'veg')
K('mushroom', 'Mushrooms', 22, 3.1, 3.3, 0.3, 1, 'cup:70', 'veg', 'PUR')
K('babycorn', 'Baby corn', 26, 2, 5, 0.2, 2.6, 'g', 'veg')
K('zucchini', 'Zucchini', 17, 1.2, 3.1, 0.3, 1, 'medium:200', 'veg')
K('cucumber', 'Cucumber', 15, 0.7, 3.6, 0.1, 0.5, 'medium:200', 'veg')
K('mooli', 'Mooli (radish)', 16, 0.7, 3.4, 0.1, 1.6, 'medium:150', 'veg')
K('turnip', 'Shalgam (turnip)', 28, 0.9, 6.4, 0.1, 1.8, 'medium:120', 'veg')
K('gwar', 'Gwar phali (cluster beans)', 35, 3.2, 6, 0.4, 3.2, 'g', 'veg')
K('sem', 'Sem (flat beans)', 40, 3, 7, 0.3, 4, 'g', 'veg')
K('springonion', 'Spring onion', 32, 1.8, 7.3, 0.2, 2.6, 'cup:50', 'veg')
K('lotusstem', 'Lotus stem (kamal kakdi)', 74, 2.6, 17, 0.1, 4.9, 'g', 'veg', 'K')
K('lettuce', 'Lettuce', 15, 1.4, 2.9, 0.2, 1.3, 'cup:50', 'veg', 'VK')
K('garlic', 'Garlic', 149, 6.4, 33, 0.5, 2.1, 'clove:4', 'aro')
K('ginger', 'Ginger', 80, 1.8, 18, 0.8, 2, 'inch:8', 'aro')
K('gchilli', 'Green chilli', 40, 2, 9, 0.2, 1.5, 'nos:3', 'aro')
K('curryleaf', 'Curry leaves', 108, 6, 18, 1, 6.4, 'sprig:1.5', 'aro')
K('coriander', 'Fresh coriander leaves', 23, 2.1, 3.7, 0.5, 2.8, 'cup:16,tbsp:4', 'aro')
K('mint', 'Mint leaves', 44, 3.8, 8, 0.7, 6.8, 'cup:20,tbsp:3', 'aro')
K('spinach', 'Spinach (palak)', 23, 2.9, 3.6, 0.4, 2.2, 'cup:30', 'leafy', 'VK K')
K('methi', 'Fresh methi (fenugreek) leaves', 49, 4.4, 6, 0.9, 4.9, 'cup:25', 'leafy', 'VK')
K('sarson', 'Sarson (mustard greens)', 27, 2.9, 4.7, 0.4, 3.2, 'cup:50', 'leafy', 'VK')
K('bathua', 'Bathua leaves', 43, 3.7, 7, 0.4, 2.1, 'cup:30', 'leafy', 'VK')
K('amaranth', 'Chaulai (amaranth) leaves', 23, 2.5, 4, 0.3, 2.2, 'cup:30', 'leafy', 'VK K')
K('dill', 'Suva (dill) leaves', 43, 3.5, 7, 1.1, 2.1, 'cup:20', 'leafy')
K('gongura', 'Gongura (sorrel) leaves', 40, 1.7, 7, 1.1, 2.5, 'cup:30', 'leafy')
K('colleaf', 'Arbi (colocasia) leaves', 56, 3.9, 6.8, 1.5, 2, 'nos:10', 'leafy', 'VK')
K('moringaleaf', 'Moringa (drumstick) leaves', 64, 9.4, 8.3, 1.4, 2, 'cup:20', 'leafy', 'VK')

# Fruits
K('avocado', 'Ripe avocado', 160, 2, 8.5, 14.7, 6.7, 'nos:150', 'fruit', 'K VK')
K('banana', 'Banana', 89, 1.1, 22.8, 0.3, 2.6, 'nos:100', 'fruit', 'K NSUG')
K('apple', 'Apple', 52, 0.3, 13.8, 0.2, 2.4, 'nos:150', 'fruit')
K('mango', 'Ripe mango pulp', 60, 0.8, 15, 0.4, 1.6, 'cup:200', 'fruit', 'NSUG')
K('rawmango', 'Raw mango', 60, 0.8, 15, 0.4, 1.6, 'nos:150', 'fruit')
K('papaya', 'Papaya', 43, 0.5, 10.8, 0.3, 1.7, 'cup:145', 'fruit')
K('pineapple', 'Pineapple', 50, 0.5, 13, 0.1, 1.4, 'cup:165', 'fruit')
K('pomegranate', 'Pomegranate seeds', 83, 1.7, 18.7, 1.2, 4, 'cup:170,tbsp:10', 'fruit')
K('orange', 'Orange', 47, 0.9, 11.8, 0.1, 2.4, 'nos:140', 'fruit')
K('watermelon', 'Watermelon', 30, 0.6, 7.6, 0.2, 0.4, 'cup:150', 'fruit')
K('muskmelon', 'Muskmelon', 34, 0.8, 8, 0.2, 0.9, 'cup:160', 'fruit')
K('grapes', 'Grapes', 69, 0.7, 18, 0.2, 0.9, 'cup:150', 'fruit', 'NSUG')
K('strawberry', 'Strawberries', 32, 0.7, 7.7, 0.3, 2, 'cup:150', 'fruit')
K('guava', 'Guava', 68, 2.6, 14.3, 1, 5.4, 'nos:100', 'fruit')
K('chikoo', 'Chikoo (sapota)', 83, 0.4, 20, 1.1, 5.3, 'nos:100', 'fruit', 'NSUG')
K('kiwi', 'Kiwi', 61, 1.1, 14.7, 0.5, 3, 'nos:75', 'fruit', 'K')
K('pear', 'Pear', 57, 0.4, 15, 0.1, 3.1, 'nos:150', 'fruit')
K('custardapple', 'Custard apple (sitaphal) pulp', 94, 2.1, 23.6, 0.3, 4.4, 'cup:250', 'fruit', 'NSUG K')
K('amla', 'Amla (Indian gooseberry)', 58, 0.5, 13.7, 0.1, 3.4, 'nos:30', 'fruit')
K('bael', 'Bael fruit pulp', 137, 1.8, 31.8, 0.3, 2.9, 'cup:150', 'fruit')
K('coconutwater', 'Tender coconut water', 19, 0.7, 3.7, 0.2, 1.1, 'cup:240', 'drink', 'K')
K('lemon', 'Lemon juice', 22, 0.4, 6.9, 0.2, 0.3, 'tbsp:15,tsp:5', 'aro')
K('tamarind', 'Tamarind pulp', 239, 2.8, 62.5, 0.6, 5.1, 'tbsp:15,tsp:5', 'aro')
K('kokum', 'Kokum (dried)', 60, 0.5, 14, 0.5, 2, 'nos:3', 'aro')

# Nuts, seeds, dried fruit
K('peanut', 'Peanuts', 567, 25.8, 16, 49, 8.5, 'cup:140,tbsp:9', 'nut', 'peanut')
K('almond', 'Almonds', 579, 21, 21.6, 49.9, 12.5, 'tbsp:9,nos:1.2', 'nut', 'nuts')
K('cashew', 'Cashews', 553, 18, 30, 44, 3.3, 'tbsp:9,nos:1.5', 'nut', 'nuts')
K('walnut', 'Walnuts', 654, 15, 14, 65, 6.7, 'tbsp:8,nos:2', 'nut', 'nuts')
K('pistachio', 'Pistachios', 560, 20, 28, 45, 10, 'tbsp:8,nos:0.7', 'nut', 'nuts')
K('raisin', 'Raisins', 299, 3.1, 79, 0.5, 3.7, 'tbsp:9', 'nut', 'NSUG')
K('dates', 'Dates (seedless)', 282, 2.5, 75, 0.4, 8, 'nos:8', 'nut', 'NSUG K')
K('dfig', 'Dried figs (anjeer)', 249, 3.3, 64, 0.9, 9.8, 'nos:10', 'nut', 'NSUG')
K('sesame', 'Sesame seeds (til)', 573, 17.7, 23, 49.7, 11.8, 'tbsp:9,tsp:3', 'nut', 'sesame')
K('flax', 'Flaxseeds', 534, 18.3, 29, 42, 27, 'tbsp:7', 'nut')
K('chia', 'Chia seeds', 486, 17, 42, 31, 34, 'tbsp:12,tsp:4', 'nut')
K('pumpkinseed', 'Pumpkin seeds', 559, 30, 10.7, 49, 6, 'tbsp:9', 'nut')
K('sunseed', 'Sunflower seeds', 584, 20.8, 20, 51, 8.6, 'tbsp:9', 'nut')
K('coconut', 'Fresh grated coconut', 354, 3.3, 15, 33, 9, 'cup:80,tbsp:6', 'nut', 'SF')
K('coconutmilk', 'Thin coconut milk', 70, 0.6, 2, 7, 0, 'cup:240,tbsp:15', 'nut', 'SF')
K('poppy', 'Poppy seeds (khus khus)', 525, 18, 28, 42, 19.5, 'tsp:3', 'nut')
K('melonseed', 'Melon seeds (magaz)', 557, 28, 15, 47, 4, 'tbsp:9', 'nut')

# Fats, sweeteners, condiments
K('oil', 'Oil (mustard / groundnut / rice bran)', 884, 0, 0, 100, 0, 'tbsp:14,tsp:5', 'fat')
K('mustardoil', 'Mustard oil', 884, 0, 0, 100, 0, 'tbsp:14,tsp:5', 'fat')
K('coconutoil', 'Coconut oil', 892, 0, 0, 100, 0, 'tbsp:14,tsp:5', 'fat', 'SF')
K('oliveoil', 'Olive oil', 884, 0, 0, 100, 0, 'tbsp:14,tsp:5', 'fat')
K('sesameoil', 'Sesame (gingelly) oil', 884, 0, 0, 100, 0, 'tbsp:14,tsp:5', 'fat', 'sesame')
K('jaggery', 'Jaggery (gur)', 383, 0.4, 98, 0.1, 0, 'tbsp:15,tsp:5', 'sweet', 'SUG')
K('sugar', 'Sugar', 387, 0, 100, 0, 0, 'tbsp:12,tsp:4', 'sweet', 'SUG')
K('honey', 'Honey', 304, 0.3, 82, 0, 0.2, 'tbsp:21,tsp:7', 'sweet', 'SUG')
K('soysauce', 'Low-sodium soy sauce', 53, 8, 5, 0.6, 0.8, 'tsp:6', 'cond', 'soy gluten NA')
K('vinegar', 'Vinegar', 18, 0, 0.9, 0, 0, 'tsp:5,tbsp:15', 'cond')
K('cocoa', 'Cocoa powder (unsweetened)', 228, 19.6, 58, 13.7, 37, 'tbsp:5', 'cond')
K('eno', 'Fruit salt (Eno)', 0, 0, 0, 0, 0, 'tsp:5', 'cond', 'NA')
K('soda', 'Baking soda', 0, 0, 0, 0, 0, 'pinch:0.3', 'cond', 'NA')
K('rosewater', 'Rose water', 0, 0, 0, 0, 0, 'tsp:5', 'cond')
K('tea', 'Tea leaves', 0, 0, 0, 0, 0, 'tsp:2.5', 'cond')
K('coffee', 'Instant / filter coffee', 0, 0, 0, 0, 0, 'tsp:2', 'cond')
K('water', 'Water', 0, 0, 0, 0, 0, 'cup:240', 'cond')
K('salt', 'Salt', 0, 0, 0, 0, 0, 'tsp:5', 'cond')
K('blacksalt', 'Black salt (kala namak)', 0, 0, 0, 0, 0, 'tsp:5', 'cond')
K('ice', 'Ice cubes', 0, 0, 0, 0, 0, 'g', 'cond')

# Spices (small amounts)
for key, name, unit in [
    ('jeera', 'Cumin seeds (jeera)', 'tsp:2.5'), ('mustard', 'Mustard seeds (rai)', 'tsp:3'),
    ('hing', 'Hing (asafoetida)', 'pinch:0.2'), ('haldi', 'Turmeric powder', 'tsp:3'),
    ('chilli', 'Kashmiri red chilli powder', 'tsp:2.5'), ('dhania', 'Coriander powder', 'tsp:2'),
    ('garam', 'Garam masala', 'tsp:2'), ('amchur', 'Amchur (dry mango powder)', 'tsp:2.5'),
    ('chaat', 'Chaat masala', 'tsp:3'), ('ajwain', 'Ajwain (carom seeds)', 'tsp:2.5'),
    ('saunf', 'Saunf (fennel seeds)', 'tsp:2'), ('methiseed', 'Methi (fenugreek) seeds', 'tsp:3.7'),
    ('kasuri', 'Kasuri methi (dried fenugreek)', 'tbsp:1'), ('pepper', 'Black pepper powder', 'tsp:2.3'),
    ('peppercorn', 'Black peppercorns', 'tsp:3'), ('cinnamon', 'Cinnamon stick', 'inch:1.5'),
    ('cardamom', 'Green cardamom', 'nos:0.2'), ('elaichipowder', 'Cardamom powder', 'tsp:2'),
    ('clove', 'Cloves', 'nos:0.1'), ('bayleaf', 'Bay leaf (tej patta)', 'nos:0.2'),
    ('redchilli', 'Dry red chillies', 'nos:1'), ('sambar', 'Sambar powder', 'tsp:2.5'),
    ('rasampowder', 'Rasam powder', 'tsp:2.5'), ('jeerapowder', 'Roasted cumin powder', 'tsp:2'),
    ('kalonji', 'Kalonji (nigella seeds)', 'tsp:2.5'), ('panchphoron', 'Panch phoron', 'tsp:2.5'),
    ('saffron', 'Saffron strands', 'pinch:0.05'), ('nutmeg', 'Nutmeg powder', 'pinch:0.3'),
    ('chilliflakes', 'Chilli flakes', 'tsp:1.5'), ('oregano', 'Dried oregano / mixed herbs', 'tsp:1'),
    ('kasundi', 'Mustard paste', 'tbsp:15'), ('pavbhaji', 'Pav bhaji masala', 'tsp:2.5'),
    ('chole', 'Chole masala', 'tsp:2.5'), ('chickenmasala', 'Chicken / meat masala', 'tsp:2.5'),
    ('kitchenking', 'Kitchen king masala', 'tsp:2.5'), ('tandoori', 'Tandoori masala', 'tsp:2.5'),
    ('fishmasala', 'Fish masala', 'tsp:2.5'), ('podi', 'Idli podi (gun powder)', 'tbsp:8'),
    ('stoneflower', 'Star anise', 'nos:0.5'), ('mace', 'Javitri (mace)', 'pinch:0.3'),
    ('dryginger', 'Dry ginger powder (saunth)', 'tsp:2'), ('urad_t', 'Urad dal (for tempering)', 'tsp:4'),
    ('chana_t', 'Chana dal (for tempering)', 'tsp:4'), ('goda', 'Goda masala', 'tsp:2.5'),
    ('vangibath', 'Vangi bath powder', 'tbsp:7'), ('bisibele', 'Bisi bele bath powder', 'tbsp:7'),
    ('puliyogare', 'Puliyogare powder', 'tbsp:7'), ('ragda', 'Ragda / chaat spice mix', 'tsp:2.5'),
    ('kokumagal', 'Kokum agal (extract)', 'tbsp:15'), ('herbal', 'Tulsi / herbal tea leaves', 'tsp:1'),
    ('greentea', 'Green tea leaves', 'tsp:1.5'), ('lemongrass', 'Lemongrass', 'stalk:5'),
    ('dhaniaseed', 'Coriander seeds', 'tsp:2'), ('blackcardamom', 'Black cardamom', 'nos:1'),
    ('kashmirichilli', 'Kashmiri dry red chillies', 'nos:1'), ('sounthpowder', 'Fennel powder', 'tsp:2'),
]:
    K(key, name, 300, 12, 50, 10, 25, unit, 'spice', '')
CAT['hing']['kcal'] = 0


# ---------------------------------------------------------------------------------------------------------------
# Data consistency (checked October 2026)
# 1. Carbohydrate is "available carbohydrate" everywhere (the IFCT 2017 method): fibre is listed separately and not
#    included in carbs. These entries were taken from USDA "total carbohydrate" (which includes fibre), so fibre is
#    subtracted. Energy (kcal) is unchanged - it comes straight from the source tables.
TOTAL_CARB_KEYS = ['rrice', 'ragi', 'kuttu', 'rajgira', 'bread', 'makhana', 'noodles', 'urad', 'wurad', 'masoor', 'wmasoor', 'toor',
                   'chanadal', 'chickpea', 'lobia', 'rajmabeans', 'mixsprouts', 'onion', 'shallot', 'tomato', 'sweetpotato', 'carrot',
                   'beet', 'capsicum', 'cabbage', 'cauliflower', 'broccoli', 'peas', 'beans', 'bhindi', 'brinjal', 'lauki', 'tori',
                   'karela', 'suran', 'drumstick', 'rawbanana', 'babycorn', 'zucchini', 'mooli', 'turnip', 'gwar', 'springonion',
                   'lotusstem', 'lettuce', 'garlic', 'ginger', 'gchilli', 'coriander', 'mint', 'spinach', 'sarson', 'bathua',
                   'amaranth', 'dill', 'gongura', 'avocado', 'banana', 'apple', 'mango', 'rawmango', 'papaya', 'pineapple',
                   'pomegranate', 'orange', 'muskmelon', 'grapes', 'strawberry', 'guava', 'chikoo', 'kiwi', 'pear', 'custardapple',
                   'tamarind', 'kokum', 'peanut', 'almond', 'cashew', 'walnut', 'pistachio', 'raisin', 'dates', 'dfig', 'sesame',
                   'flax', 'chia', 'pumpkinseed', 'sunseed', 'coconut', 'poppy', 'melonseed', 'soysauce',
                   'rajma', 'corn', 'sem', 'methi', 'moringaleaf', 'sprouts', 'mushroom']
for _k in TOTAL_CARB_KEYS:
    CAT[_k]['c'] = round(max(0.0, CAT[_k]['c'] - CAT[_k]['fib']), 1)

# 2. Spices: real values per 100 g instead of one generic placeholder. (kcal, protein, available carbs, fat, fibre)
#    IFCT 2017 (G0xx codes) where it lists the spice, otherwise USDA FoodData Central (SR Legacy).
_SPICE = {
    'jeera': (304, 13.9, 22.6, 16.6, 30.4), 'jeerapowder': (304, 13.9, 22.6, 16.6, 30.4),          # IFCT G025 cumin
    'haldi': (281, 7.7, 49.2, 5.0, 21.4),                                                            # G033 turmeric
    'chilli': (237, 12.7, 29.5, 6.4, 31.2), 'redchilli': (237, 12.7, 29.5, 6.4, 31.2),               # G022 red chillies
    'kashmirichilli': (237, 12.7, 29.5, 6.4, 31.2), 'chilliflakes': (237, 12.7, 29.5, 6.4, 31.2),
    'dhania': (269, 10.7, 13.0, 17.5, 44.8), 'dhaniaseed': (269, 10.7, 13.0, 17.5, 44.8),             # G024 coriander seed
    'ajwain': (357, 15.9, 24.5, 21.1, 20.6),                                                         # G029 omum
    'methiseed': (235, 25.4, 10.6, 5.7, 47.6),                                                       # G026 fenugreek seed
    'pepper': (217, 10.1, 36.2, 2.7, 33.2), 'peppercorn': (217, 10.1, 36.2, 2.7, 33.2),              # G031 black pepper
    'cardamom': (255, 8.1, 47.8, 2.6, 23.1), 'elaichipowder': (255, 8.1, 47.8, 2.6, 23.1),           # G020
    'blackcardamom': (271, 6.7, 52.5, 2.8, 23.5),                                                    # G021
    'clove': (187, 5.9, 18.7, 8.4, 34.5), 'mace': (356, 6.2, 26.5, 24.4, 20.3),                      # G023, G027
    'nutmeg': (464, 6.3, 27.6, 36.5, 12.0),                                                          # G028
    'mustard': (508, 26.1, 16.1, 36.2, 12.2), 'saunf': (345, 15.8, 12.5, 14.9, 39.8),                # USDA mustard seed, fennel
    'kalonji': (345, 16.0, 30.0, 22.0, 10.5),                                                        # USDA-style nigella seed
    'cinnamon': (247, 4.0, 27.5, 1.2, 53.1), 'bayleaf': (313, 7.6, 48.7, 8.4, 26.3),                 # USDA
    'saffron': (310, 11.4, 61.5, 5.9, 3.9), 'dryginger': (335, 9.0, 57.5, 4.2, 14.1),                # USDA
    'sounthpowder': (335, 9.0, 57.5, 4.2, 14.1), 'oregano': (265, 9.0, 26.3, 4.3, 42.5),             # USDA
    'kasuri': (323, 23.0, 25.0, 6.4, 24.6),                                                          # dried fenugreek leaves
    'amchur': (319, 2.8, 70.0, 1.9, 7.5),                                                            # dried mango powder
    'greentea': (0, 0, 0, 0, 0), 'herbal': (0, 0, 0, 0, 0),                                          # steeped, leaves not eaten
}
# spice blends (garam masala, sambar powder, chaat masala, ...) and remaining dry spices: one consistent mixed-spice value
_BLEND = (346, 12.0, 35.0, 12.0, 25.0)
for _k, _c in CAT.items():
    if _c['cat'] == 'spice' and (_c['kcal'], _c['p'], _c['c'], _c['f'], _c['fib']) == (300, 12, 50, 10, 25):
        _c['kcal'], _c['p'], _c['c'], _c['f'], _c['fib'] = _SPICE.get(_k, _BLEND)
for _k, _v in _SPICE.items():
    if _k in CAT:
        CAT[_k]['kcal'], CAT[_k]['p'], CAT[_k]['c'], CAT[_k]['f'], CAT[_k]['fib'] = _v
# cocoa powder (USDA, unsweetened): available carbs = total 57.9 - fibre 37
if 'cocoa' in CAT:
    CAT['cocoa']['c'] = 20.9
