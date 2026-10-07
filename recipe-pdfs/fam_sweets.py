"""Healthy sweets and drinks."""
from core import recipe
from util import names, allnames, produce

CS = 'Healthy Sweets'
SW_SERVE = ['enjoy a small portion after a meal, or with a cup of tea.', 'Keep sweets to a small bowl or 1–2 pieces.']


def kheer(name, base, desc, liquid='milk 750', sweet='jaggery 40', flav='elaichipowder 1; saffron', nuts='almond 10; pistachio 8', prep_txt='', mins=25, serves=4,
          sub='Kheer / Payasam', tags=()):
    g = [('Ingredients', f'{base}; {liquid}; {sweet}; {flav}'), ('To Garnish', nuts)]
    steps = [
        f'Prepare: {prep_txt or f"Wash or roast the {names(base)} as listed."}',
        f'Boil the {names(liquid)}: Bring the {names(liquid)} to a boil in a heavy-bottomed pan, stirring so it does not stick.',
        f'Cook: Add the {names(base)} and simmer on low flame for {mins} minutes, stirring often and scraping the sides, until soft and creamy.',
        'Flavour: Add the cardamom and saffron and simmer for 2 more minutes.',
        f'Sweeten: Switch off the flame and let it cool for 5 minutes, then stir in the {names(sweet) or "sweetener"}. Adding jaggery off the heat keeps the milk from curdling.',
        f'Serve: Garnish with the {names(nuts)} and serve warm or chilled.',
    ]
    recipe(name, CS, desc, serves, 10, mins + 10, g, steps,
           tips=['Use a heavy-bottomed pan and stir often so the milk does not burn.', 'Kheer thickens as it cools; add a little warm milk to loosen it.'],
           serve=SW_SERVE, store='keeps in the fridge for 2 days.', sub=sub, tags=tags)


kheer('Rice Kheer (Less Sugar)', 'rice 50 washed, soaked 20 minutes', 'Creamy rice pudding with cardamom and saffron, sweetened lightly with jaggery.')
kheer('Oats Kheer', 'oats 50 lightly roasted', 'A fibre-rich kheer made with roasted oats, ready in 15 minutes.', mins=10, sweet='dates 40 chopped')
kheer('Makhana Kheer', 'makhana 40 roasted, crushed', 'Creamy fox-nut kheer, light and low in fat, popular during fasts.', mins=15, tags=('fast',))
kheer('Sabudana Kheer', 'sabudana 50 soaked 2 hours', 'Soft sago pearls in creamy cardamom milk, a fasting favourite.', mins=15, tags=('fast',))
kheer('Seviyan Kheer', 'semiya 50 roasted in ghee 5', 'Vermicelli kheer with nuts and cardamom, a festive classic.', mins=10)
kheer('Millet Kheer', 'foxtail 50 washed', 'A wholesome kheer made with foxtail millet.', mins=30)
kheer('Quinoa Kheer', 'quinoa 50 rinsed', 'A protein-rich kheer made with quinoa.', mins=25)
kheer('Lauki Kheer', 'lauki 250 grated', 'A light, cooling bottle gourd kheer.', mins=20)
kheer('Gajar Kheer', 'carrot 200 grated', 'Carrot kheer, naturally sweet and rich in vitamin A.', mins=20, sweet='jaggery 30')
kheer('Apple Kheer', 'apple 200 grated, cooked 3 minutes', 'Kheer made with grated apple stirred into thickened milk, sweetened only with dates.',
      sweet='dates 32 chopped', mins=20, prep_txt='Peel and grate the apple and cook it for 3 minutes; cool. Reduce the milk first and add the apple only after it cools slightly, so the milk does not split.')
kheer('Dalia Kheer', 'dalia 50 roasted in ghee 5', 'Broken wheat kheer, rich in fibre.', mins=25)
kheer('Phirni (Lighter)', 'rice 40 soaked, ground coarse', 'Smooth Punjabi ground-rice pudding set in bowls, flavoured with rose and cardamom.',
      flav='elaichipowder 1; saffron; rosewater 5', mins=15)
kheer('Moong Dal Payasam', 'moong 60 roasted, cooked soft', 'South Indian moong dal payasam with jaggery and coconut milk.', liquid='coconutmilk 400; milk 200', sweet='jaggery 50',
      flav='elaichipowder 1; dryginger 0.5', nuts='cashew 10; coconut 10', mins=10)
kheer('Ragi Kheer', 'ragi 40 mixed with cold milk', 'A calcium-rich ragi kheer with jaggery and cardamom.', mins=10, sweet='jaggery 35')
kheer('Sweet Potato Kheer', 'sweetpotato 200 boiled, mashed', 'Creamy kheer with mashed sweet potato, naturally sweet.', mins=10, sweet='jaggery 20')
kheer('Chia Kheer', 'chia 30', 'A no-cook style kheer with chia seeds soaked in cardamom milk.', liquid='milk 500', sweet='dates 32 chopped', mins=5)
kheer('Paal Payasam (Kerala Rice Payasam)', 'rrice 50', 'Kerala-style slow-cooked rice and milk payasam.', mins=40, sweet='jaggery 40')
kheer('Badam Kheer', 'almond 40 soaked, peeled, ground', 'Rich almond kheer with saffron.', mins=10, sweet='jaggery 30')


def halwa(name, base, desc, liquid='milk 360', sweet='jaggery 40', fat='ghee 15', flav='elaichipowder 1', nuts='almond 10; cashew 8', mins=25, prep_txt='', roast=False, serves=4, sub='Halwa'):
    g = [('Ingredients', f'{base}; {liquid}; {sweet}; {fat}; {flav}'), ('To Garnish', nuts)]
    steps = [
        f'Prepare: {prep_txt or f"Prepare the {names(base)} as listed."}',
        (f'Roast: Heat the ghee and roast the {names(base)} on low flame, stirring constantly, until golden and aromatic.' if roast else
         f'Sauté: Heat the ghee in a heavy kadhai and sauté the {names(base)} for 5 minutes.'),
        f'Add the liquid: Add the {names(liquid) or "water"} (it will splutter, so pour carefully) and stir continuously.',
        f'Cook: Cook on medium-low flame for {mins} minutes, stirring often, until the liquid is absorbed and the halwa thickens.',
        f'Sweeten: Add the {names(sweet)} and cardamom and cook for 3–4 minutes until the halwa leaves the sides of the pan.',
        f'Serve: Garnish with the {names(nuts)} and serve warm.',
    ]
    recipe(name, CS, desc, serves, 15, mins + 10, g, steps,
           tips=['Halwa needs patient stirring on low heat; do not rush it.', 'This lighter version uses less ghee and jaggery instead of sugar.'],
           serve=SW_SERVE, store='keeps in the fridge for 3 days; warm before serving.', sub=sub)


halwa('Gajar ka Halwa (Lighter)', 'carrot 500 grated', 'The winter favourite: grated carrots slow-cooked in milk, with less ghee and jaggery instead of sugar.', liquid='milk 500', mins=35)
halwa('Lauki Halwa', 'lauki 500 grated, squeezed', 'A light, delicately sweet bottle gourd halwa.', liquid='milk 360', mins=30)
halwa('Suji Halwa (Sheera)', 'rava 100', 'Classic semolina halwa made with less ghee.', liquid='milk 240; water 120', mins=6, roast=True)
halwa('Atta Halwa', 'atta 100', 'Gurudwara-style whole-wheat halwa made with jaggery.', liquid='water 360', mins=6, roast=True, fat='ghee 25')
halwa('Moong Dal Halwa (Lighter)', 'moong 100 soaked, coarsely ground', 'Rich Rajasthani moong dal halwa with half the usual ghee.', liquid='milk 300', fat='ghee 30', mins=20, roast=True)
halwa('Beetroot Halwa', 'beet 400 grated', 'A jewel-red beetroot halwa, rich in folate.', mins=30)
halwa('Sweet Potato Halwa', 'sweetpotato 400 boiled, mashed', 'A naturally sweet halwa of mashed sweet potato.', liquid='milk 200', sweet='jaggery 25', mins=10)
halwa('Oats Halwa', 'oats 100', 'A quick, fibre-rich halwa made with roasted oats.', liquid='milk 360', mins=8, roast=True)
halwa('Ragi Halwa', 'ragi 100', 'A calcium-rich finger millet halwa with jaggery.', liquid='water 300; milk 100', mins=10, roast=True)
halwa('Badam Halwa (Lighter)', 'almond 120 soaked, peeled, ground', 'Almond halwa made with less ghee and jaggery.', liquid='milk 200', mins=15)
halwa('Papaya Halwa', 'papaya 400 ripe, mashed', 'A quick halwa of ripe papaya, naturally sweet.', liquid='milk 120', sweet='jaggery 20', mins=12)
halwa('Kaddu Halwa', 'pumpkin 500 grated', 'Red pumpkin halwa, light and rich in beta-carotene.', mins=25)


def ladoo(name, mix, desc, prep_txt, bind_txt='Shape: While still warm, take a spoonful and press firmly between your palms into a round ladoo.', count=12, sub='Ladoo / Barfi', tags=()):
    g = [('Ingredients', mix)]
    steps = [
        f'Prepare: {prep_txt}',
        f'Combine: In a large bowl, mix the {allnames(mix)} together well.',
        bind_txt,
        'Set: Place on a plate and let them firm up for 30 minutes.',
        'Store: Store in an airtight box.',
    ]
    recipe(name, CS, desc, count, 15, 15, g, steps,
           tips=['If the mixture does not bind, add 1–2 tsp warm ghee or a little more date paste.', 'Make them small; one ladoo is a satisfying portion.'],
           serve=['one ladoo with a glass of milk, or as a pre-workout snack.', 'Great for children’s tiffin and for travel.'],
           store='keeps in an airtight box for 1–2 weeks (ladoos with fresh coconut: 5 days in the fridge).', sub=sub, tags=('kids',) + tuple(tags))


ladoo('Dates and Nuts Ladoo', 'dates 200 seedless; almond 40; cashew 30; walnut 30; pistachio 20; ghee 5; elaichipowder 1',
      'No-sugar energy balls of dates and nuts, rich in fibre, iron and healthy fats.', 'Chop the nuts and dry-roast them for 3 minutes. Blend the dates to a coarse paste.')
ladoo('Ragi Ladoo', 'ragi 120; jaggery 80 grated; ghee 30; peanut 30 roasted, crushed; elaichipowder 1', 'Calcium-rich finger millet ladoos with jaggery and peanuts.',
      'Roast the ragi flour in ghee on low flame for 10 minutes until aromatic. Cool slightly.')
ladoo('Besan Ladoo (Less Sugar)', 'besan 150; ghee 50; jaggery 70 powdered; elaichipowder 1; almond 15 chopped', 'Classic besan ladoos with less ghee and jaggery instead of sugar.',
      'Roast the besan in ghee on low flame for 15–18 minutes, stirring constantly, until golden and nutty. Cool until warm.')
ladoo('Til Gud Ladoo', 'sesame 150; jaggery 120; peanut 40 roasted, crushed; ghee 5; elaichipowder 1', 'Sesame and jaggery ladoos, a Makar Sankranti tradition, rich in calcium.',
      'Dry-roast the sesame until it pops. Melt the jaggery with 1 tbsp water and cook to a soft-ball stage (a drop in water forms a soft ball).',
      bind_txt='Shape: Mix quickly and shape with greased palms while still warm; the mixture sets as it cools.')
ladoo('Oats Ladoo', 'oats 120 roasted, powdered; dates 120 seedless; almond 30; ghee 10; elaichipowder 1', 'Fibre-rich oats and dates ladoos with no added sugar.',
      'Roast the oats until golden and powder coarsely. Blend the dates to a paste.')
ladoo('Dry Fruit Ladoo', 'dfig 100; dates 100; almond 40; cashew 30; pistachio 20; raisin 20; poppy 6; ghee 5', 'Sugar-free ladoos of figs, dates and mixed nuts.',
      'Soak the figs in warm water for 30 minutes and blend with the dates. Chop and roast the nuts.')
ladoo('Coconut Ladoo (Jaggery)', 'coconut 200 grated; jaggery 100; milk 60; elaichipowder 1; cashew 10', 'Soft coconut ladoos sweetened with jaggery.',
      'Cook the coconut with milk and jaggery on low flame for 10–12 minutes until it comes together.')
ladoo('Flaxseed Ladoo', 'flax 100 roasted, powdered; atta 50 roasted; jaggery 80; ghee 20; almond 20', 'Omega-3-rich flaxseed ladoos, a great winter snack.',
      'Roast the flaxseeds and grind. Roast the atta in ghee until golden.')
ladoo('Makhana Ladoo', 'makhana 60 roasted, powdered; dates 150; almond 30; ghee 10; elaichipowder 1', 'Light fox-nut and date ladoos.',
      'Roast the makhana in ghee until crisp and grind coarsely. Blend the dates.')
ladoo('Peanut Protein Ladoo', 'peanut 150 roasted; roastchana 50; dates 150; elaichipowder 1', 'High-protein ladoos of peanuts, roasted chana and dates.',
      'Grind the peanuts and roasted chana coarsely. Blend the dates.')
ladoo('Sattu Ladoo', 'sattu 150; jaggery 80 powdered; ghee 30; almond 20; elaichipowder 1', 'Protein-rich roasted gram flour ladoos.',
      'Warm the sattu in ghee on low flame for 4–5 minutes. Cool until warm.')
ladoo('Peanut Chikki', 'peanut 200 roasted, skinned; jaggery 150; ghee 5', 'Crunchy peanut and jaggery brittle, an iron-rich traditional snack.',
      'Melt the jaggery with ghee and cook to the hard-crack stage (a drop in water snaps).',
      bind_txt='Spread: Mix in the peanuts quickly, spread on a greased plate, roll flat and cut into squares while warm.')
ladoo('Sesame Chikki', 'sesame 150; jaggery 120; ghee 5', 'Crisp sesame and jaggery brittle, rich in calcium.',
      'Roast the sesame. Melt the jaggery with ghee to the hard-crack stage.', bind_txt='Spread: Mix quickly, roll flat on a greased surface and cut into squares.')
ladoo('Dry Fruit Barfi (No Sugar)', 'dates 200; dfig 80; almond 40; cashew 40; pistachio 20; ghee 5', 'A sugar-free barfi of dates, figs and nuts, sliced into bars.',
      'Blend the dates and soaked figs. Cook the paste in ghee for 4 minutes and add the chopped nuts.',
      bind_txt='Shape: Roll into a log, wrap in foil and refrigerate for 1 hour, then slice.')
ladoo('Atta Panjiri (Lighter)', 'atta 150; ghee 40; jaggery 80 powdered; almond 30; makhana 20; melonseed 15; dryginger 2; elaichipowder 1',
      'Punjabi winter panjiri made with less ghee and jaggery instead of sugar.', 'Roast the atta in ghee until golden. Roast the nuts and makhana separately.',
      bind_txt='Mix: Mix everything while warm; panjiri is served loose (not shaped).')
ladoo('Alsi Pinni (Flaxseed)', 'flax 80; atta 80; ghee 30; jaggery 80; almond 20', 'Punjabi flaxseed pinni, a winter energy sweet.', 'Roast the flaxseed and grind. Roast the atta in ghee.')
ladoo('Ragi Date Barfi', 'ragi 100 roasted; dates 150; almond 20; ghee 10', 'Sugar-free ragi and date barfi squares.', 'Roast the ragi in ghee. Blend the dates.',
      bind_txt='Set: Press into a greased tray, set for 1 hour and cut into squares.')


def set_sweet(name, items, desc, steps, serves=4, sub='Dessert', store='keeps in the fridge for 2 days.'):
    recipe(name, CS, desc, serves, 15, 10, items, steps, tips=['Chill well before serving.'], serve=SW_SERVE, store=store, sub=sub)


set_sweet('Shrikhand (Lighter)', 'hungcurd 400; jaggery 30 powdered; elaichipowder 1; saffron; pistachio 10',
          'Creamy Maharashtrian hung-curd dessert with saffron and cardamom, lightly sweetened.',
          ['Hang the curd: Tie curd in a muslin cloth and hang for 4–6 hours to drain all the whey.', 'Whisk: Whisk the hung curd until smooth.',
           'Flavour: Add powdered jaggery, cardamom and saffron soaked in 1 tsp warm milk.', 'Chill & serve: Chill for 1 hour and garnish with pistachios.'])
set_sweet('Amrakhand (Mango Shrikhand)', 'hungcurd 400; mango 150; elaichipowder 0.5; pistachio 10', 'Mango shrikhand sweetened only with ripe mango.',
          ['Hang the curd: Drain curd in muslin for 4–6 hours.', 'Blend: Whisk the hung curd with mango pulp and cardamom until smooth.', 'Chill & serve: Chill for 1 hour and garnish.'])
set_sweet('Mishti Doi (Lighter)', 'milk 750; curd 30 as starter; jaggery 50', 'Bengali sweet set curd with caramelised jaggery notes.',
          ['Reduce: Simmer the milk until reduced by one-third. Cool until lukewarm.', 'Sweeten: Stir in the jaggery (cool the milk slightly first).',
           'Set: Mix in the curd starter, pour into earthen or glass bowls and keep in a warm place for 8 hours.', 'Chill & serve: Refrigerate for 2 hours.'])
set_sweet('Fruit Custard (No Sugar)', 'milk 500; cornflour 15; dates 32 blended; banana 80; apple 80; pomegranate 40; grapes 50', 'Creamy custard sweetened with dates and full of fresh fruit.',
          ['Thicken: Mix cornflour with ¼ cup cold milk. Boil the remaining milk, stir in the slurry and cook 3 minutes until thick.',
           'Sweeten: Cool slightly and stir in the date paste.', 'Chill: Chill for 2 hours.', 'Serve: Fold in the chopped fruit just before serving.'])
set_sweet('Mango Kulfi (No Sugar)', 'milk 750; mango 200; dates 32; almond 15; pistachio 10; elaichipowder 1', 'Creamy mango kulfi sweetened with mango and dates.',
          ['Reduce: Simmer the milk for 30 minutes until reduced by half. Cool.', 'Blend: Blend with mango pulp, dates and cardamom.',
           'Freeze: Add chopped nuts, pour into moulds and freeze for 8 hours.', 'Serve: Dip the moulds in warm water for a few seconds to unmould.'], store='keeps in the freezer for 2 weeks.')
set_sweet('Kesar Pista Kulfi (No Sugar)', 'milk 750; dates 40; pistachio 20; almond 15; saffron; elaichipowder 1', 'Rich-tasting kesar-pista kulfi made with reduced milk and dates.',
          ['Reduce: Simmer the milk until reduced by half.', 'Flavour: Blend in the dates, saffron and cardamom.', 'Freeze: Add the nuts, pour into moulds and freeze overnight.',
           'Serve: Unmould and slice.'], store='keeps in the freezer for 2 weeks.')
set_sweet('Ukadiche Modak (Steamed)', 'ricefl 150; water 200; ghee 5; coconut 120; jaggery 80; elaichipowder 1; poppy 3',
          'Maharashtrian steamed rice-flour dumplings with a coconut-jaggery filling, made for Ganesh Chaturthi.',
          ['Filling: Cook the coconut with jaggery for 8 minutes until sticky; add cardamom and poppy seeds.',
           'Dough: Boil water with ghee and a pinch of salt, add the rice flour, stir, cover and rest 5 minutes. Knead until smooth.',
           'Shape: Flatten a ball, pleat the edges around 1 tsp filling and pinch into a modak.', 'Steam: Steam for 12 minutes and serve with a drop of ghee.'], serves=6)
set_sweet('Puran Poli (Lighter)', 'chanadal 150; jaggery 120; elaichipowder 1; nutmeg; atta 150; ghee 15; water 100',
          'Maharashtrian sweet flatbread stuffed with chana dal and jaggery, made with less ghee.',
          ['Puran: Pressure-cook the chana dal until soft, drain, and cook with jaggery until thick. Add cardamom and nutmeg and mash smooth.',
           'Dough: Knead a soft atta dough and rest 30 minutes.', 'Stuff & roll: Stuff a ball of puran into the dough and roll gently.',
           'Cook: Cook on a tawa with a few drops of ghee until golden spots appear.'], serves=6)
set_sweet('Sweet Pongal (Sakkarai Pongal)', 'rice 100; moong 40 roasted; jaggery 100; ghee 15; cashew 10; raisin 10; elaichipowder 1; milk 200; water 400',
          'Temple-style rice and moong dal pongal with jaggery, made with less ghee.',
          ['Cook: Pressure-cook rice and dal with milk and water for 4 whistles; mash.', 'Jaggery: Melt jaggery in a little water, strain and add.',
           'Simmer: Simmer 5 minutes, stirring.', 'Finish: Fry cashews and raisins in ghee and add with cardamom.'])
set_sweet('Banana Oat Cookies (Sugar-free)', 'banana 200 ripe; oats 120; raisin 20; cinnamon 1; walnut 20', 'Two-ingredient-base soft cookies with banana and oats, no sugar.',
          ['Mix: Mash the bananas and mix with oats, cinnamon, raisins and walnuts.', 'Shape: Drop spoonfuls on a lined tray and flatten.',
           'Bake: Bake at 180°C for 15–18 minutes until golden.', 'Cool: Cool on the tray before lifting.'], serves=6, store='keeps in an airtight box for 3 days.')
set_sweet('Ragi Chocolate Cake (Lighter)', 'ragi 80; atta 60; cocoa 20; curd 120; jaggery 80; oil 40; milk 120; soda 2; elaichipowder 0.5', 'A soft chocolate cake made with ragi and whole wheat, sweetened with jaggery.',
          ['Mix wet: Whisk curd, jaggery, oil and milk.', 'Mix dry: Sift ragi, atta, cocoa and baking soda.', 'Combine: Fold together without over-mixing.',
           'Bake: Bake at 180°C for 30–35 minutes until a skewer comes out clean.'], serves=8, store='keeps for 3 days in an airtight box.')
set_sweet('Date Walnut Bites', 'dates 150; walnut 80; cocoa 10; coconut 15', 'Fudgy, no-bake date and walnut bites with cocoa.',
          ['Blend: Blend dates and walnuts to a sticky dough with cocoa.', 'Shape: Roll into small balls.', 'Coat: Roll in coconut.', 'Chill: Chill for 30 minutes.'],
          serves=6, store='keeps in the fridge for 2 weeks.')
set_sweet('Mango Chia Pudding', 'chia 36; milk 360; mango 150; honey 7', 'A layered pudding of chia seeds and fresh mango.',
          ['Soak: Stir chia seeds into the milk with honey; rest 10 minutes and stir again.', 'Set: Refrigerate for 4 hours.',
           'Layer: Layer with mango purée in glasses.', 'Serve: Serve chilled.'], serves=3)
set_sweet('Yogurt Parfait with Fruits', 'hungcurd 300; banana 80; strawberry 100; pomegranate 40; oats 30 roasted; honey 10', 'Layers of hung curd, fruit and toasted oats.',
          ['Toast: Toast the oats until golden.', 'Sweeten: Whisk hung curd with honey.', 'Layer: Layer curd, fruit and oats in glasses.', 'Serve: Serve immediately.'], serves=3)

# ---------------- Drinks ----------------
CD = 'Drinks & Smoothies'
DR_SERVE = ['serve fresh, as a mid-morning or evening drink.', 'Drink fresh for the most nutrients.']


def drink(name, items, desc, method='blend', serves=2, sub='Drink', extra_steps=(), tips=(), tags=()):
    g = [('Ingredients', items)]
    if method == 'blend':
        steps = [f'Prepare: Wash, peel and chop the {produce(items)} as needed.' if produce(items) else 'Prepare: Measure out all the ingredients.',
                 'Blend: Put everything in a blender and blend until completely smooth.',
                 'Adjust: Add a little more water, milk or ice for the consistency you like, and taste for sweetness.',
                 'Serve: Pour into glasses and serve immediately.']
    elif method == 'mix':
        steps = [f'Prepare: Measure out the {allnames(items)}.',
                 'Mix: Whisk or stir everything together in a jug until well combined (or shake in a bottle).',
                 'Chill: Add ice or chill for 15 minutes.',
                 'Serve: Stir again and serve cold.']
    else:  # hot
        steps = [f'Boil: Bring the water (or milk) to a boil in a saucepan.',
                 f'Infuse: Add the {allnames(items)} and simmer on low flame for 4–5 minutes to extract the flavour.',
                 'Strain: Strain into cups.',
                 'Serve: Sip warm.']
    steps = list(extra_steps) + steps
    recipe(name, CD, desc, serves, 5, 0 if method != 'hot' else 6, g, steps,
           tips=list(tips) + (['Drink smoothies fresh; they lose vitamins and separate as they stand.'] if method == 'blend' else
                              ['Keep added sugar to a minimum; let fruit, spices and herbs provide the flavour.']),
           serve=DR_SERVE, store='best consumed fresh.', sub=sub, tags=tags)


drink('Masala Chaas', 'curd 200; water 300; ginger 3; gchilli 2; coriander 4; jeerapowder 1; blacksalt; curryleaf 1', 'Spiced buttermilk, the best cooling and digestive drink of Indian summers.', method='blend')
drink('Mint Chaas', 'curd 200; water 300; mint 8; jeerapowder 1; blacksalt', 'Refreshing mint buttermilk.', method='blend')
drink('Salted Lassi', 'curd 300; water 100; jeerapowder 1; blacksalt; mint 3', 'Thick, savoury Punjabi lassi with roasted cumin.', method='blend')
drink('Sweet Lassi (Less Sugar)', 'curd 300; water 60; jaggery 15; elaichipowder 0.5; saffron', 'Creamy sweet lassi lightly sweetened with jaggery.', method='blend')
drink('Mango Lassi (No Sugar)', 'curd 250; mango 150; elaichipowder 0.3; ice 50', 'Creamy mango lassi sweetened only with ripe mango.', method='blend')
drink('Banana Smoothie', 'banana 150; milk 300; oats 20; cinnamon 0.5; dates 16', 'A filling banana-oat smoothie, sweetened with dates.', method='blend')
drink('Spinach Apple Green Smoothie', 'spinach 50; apple 150; banana 80; lemon 5; water 200; ginger 3', 'A bright green smoothie with spinach and fruit.', method='blend')
drink('Papaya Smoothie', 'papaya 250; curd 150; lemon 5; ice 50', 'A digestive papaya and curd smoothie.', method='blend')
drink('Strawberry Banana Smoothie', 'strawberry 150; banana 100; curd 150; honey 7', 'A pink smoothie rich in vitamin C.', method='blend')
drink('Chikoo Shake (No Sugar)', 'chikoo 200; milk 300; almond 8', 'Naturally sweet sapota milkshake.', method='blend')
drink('Dates Almond Milkshake', 'dates 40; almond 15; milk 360; elaichipowder 0.3', 'A naturally sweet energy shake with dates and almonds.', method='blend',
      extra_steps=['Soak: Soak the dates and almonds in warm water for 30 minutes; peel the almonds.'])
drink('Peanut Butter Banana Protein Shake', 'banana 100; peanut 25 roasted; milk 300; oats 20; cocoa 5', 'A high-protein shake with peanuts, banana and oats.', method='blend')
drink('Sattu Sharbat', 'sattu 40; water 400; lemon 10; jeerapowder 1; blacksalt; mint 4; onion 15 finely chopped', 'Bihar’s cooling, protein-rich roasted gram drink.', method='mix')
drink('Sweet Sattu Drink', 'sattu 40; water 400; jaggery 15; elaichipowder 0.3', 'A sweet version of the sattu drink with jaggery.', method='mix')
drink('Nimbu Pani (No Sugar)', 'lemon 30; water 500; blacksalt; jeerapowder 0.5; mint 3', 'Fresh lemonade with black salt and cumin, without sugar.', method='mix')
drink('Jaljeera', 'water 500; jeerapowder 3; mint 8; lemon 15; tamarind 5; blacksalt; dryginger 0.5', 'Tangy, spicy cumin-mint cooler, a great digestive.', method='blend')
drink('Aam Panna (Less Sugar)', 'rawmango 200 boiled, pulped; jaggery 25; jeerapowder 1; blacksalt; mint 4; water 500', 'Cooling raw mango drink that protects against summer heat.', method='blend',
      extra_steps=['Cook: Boil or roast the raw mangoes until soft, cool, peel and scoop out the pulp.'])
drink('Kokum Sharbat (Less Sugar)', 'kokum 15 soaked; jaggery 20; jeerapowder 1; blacksalt; water 500', 'Konkan kokum cooler, tangy and cooling.', method='mix',
      extra_steps=['Extract: Soak the kokum in 1 cup warm water for 1 hour and squeeze out the juice.'])
drink('Sol Kadhi', 'coconutmilk 300; kokum 12 soaked; garlic 2; gchilli 2; coriander 4; salt', 'Konkani pink coconut-kokum drink, a digestive served after meals.', method='mix')
drink('Bael Sharbat', 'bael 200; water 400; jaggery 15; blacksalt', 'Wood apple cooler, traditionally used to soothe the stomach in summer.', method='blend')
drink('Panakam', 'jaggery 40; water 500; dryginger 1; elaichipowder 0.5; peppercorn 0.5; lemon 10', 'South Indian jaggery and dry ginger drink, made for Ram Navami.', method='mix')
drink('Tender Coconut Water with Lemon and Mint', 'coconutwater 480; lemon 10; mint 3', 'Natural electrolytes from tender coconut water with a hint of lime and mint.', method='mix')
drink('Watermelon Mint Cooler', 'watermelon 400; mint 5; lemon 10; blacksalt', 'A hydrating watermelon juice with mint.', method='blend')
drink('Cucumber Mint Detox Water', 'cucumber 100 sliced; lemon 15; mint 5; water 1000', 'Lightly flavoured infused water for better hydration.', method='mix', serves=4)
drink('Fresh Vegetable Juice (ABC)', 'apple 150; beet 100; carrot 150; ginger 5; lemon 5; water 150', 'Apple-beetroot-carrot juice, rich in vitamins A and C and nitrates.', method='blend')
drink('Amla Ginger Shot', 'amla 60; ginger 10; water 100; blacksalt', 'A tangy, immunity-boosting shot of amla and ginger.', method='blend', serves=2)
drink('Thandai (Less Sugar)', 'milk 600; almond 20; melonseed 10; saunf 5; peppercorn 1; poppy 5; elaichipowder 1; rosewater 5; jaggery 25', 'Holi’s cooling spiced milk with nuts and seeds, lightly sweetened.',
      method='blend', extra_steps=['Soak & grind: Soak the nuts, seeds and spices in warm water for 2 hours and grind to a fine paste.'])
drink('Haldi Doodh (Turmeric Milk)', 'milk 400; haldi 2; pepper 0.3; dryginger 0.5; cinnamon 0.5; jaggery 8', 'Warm golden milk with turmeric, pepper and ginger, soothing at bedtime.', method='hot')
drink('Masala Chai (Less Sugar)', 'water 240; milk 200; tea 5; ginger 5 crushed; cardamom 0.4; clove 0.1; sugar 6', 'Indian spiced milk tea with ginger and cardamom, with half the usual sugar.', method='hot')
drink('Ginger Lemon Honey Tea', 'water 480; ginger 10; lemon 15; honey 14; herbal 1', 'A warming, soothing tea for sore throats and colds.', method='hot')
drink('Kadha (Herbal Decoction)', 'water 500; herbal 2; ginger 10; peppercorn 1.5; clove 0.2; cinnamon 1; haldi 1; jaggery 8', 'Traditional Indian herbal decoction of tulsi, ginger and spices.', method='hot')
drink('Cinnamon Tea', 'water 480; cinnamon 3; lemon 5', 'Caffeine-free cinnamon tea that may help with blood-sugar control.', method='hot')
drink('Jeera Water', 'water 500; jeera 5', 'Cumin seed water, a traditional digestive drink.', method='hot')
drink('Methi Seed Water', 'water 300; methiseed 5 soaked overnight', 'Soaked fenugreek seed water, traditionally taken in the morning for blood-sugar support.', method='mix', serves=1)
drink('Green Tea with Mint', 'water 400; greentea 2; mint 3; lemon 5', 'Antioxidant-rich green tea with fresh mint.', method='hot')
drink('Badam Milk (Less Sugar)', 'milk 400; almond 25 soaked, peeled, ground; saffron; elaichipowder 0.5; jaggery 10', 'Warm almond milk with saffron and cardamom.', method='hot')
drink('South Indian Filter Coffee (Less Sugar)', 'milk 200; coffee 8; water 60; sugar 4', 'Strong, frothy filter coffee with half the usual sugar.', method='hot')
drink('Rose Milk (No Sugar)', 'milk 400; rosewater 5; dates 16; ice 50', 'Chilled rose-flavoured milk sweetened with dates.', method='blend')
drink('Moringa Leaf Tea', 'water 400; moringaleaf 6 dried; lemon 5; honey 7', 'A mild herbal tea of dried moringa leaves.', method='hot')
drink('Lemongrass Ginger Tea', 'water 480; lemongrass 10; ginger 8; honey 7', 'A fragrant, caffeine-free herbal tea.', method='hot')
drink('Ragi Malt Drink (Savoury)', 'ragi 20; water 300; curd 100; blacksalt; jeerapowder 0.5', 'A savoury, cooling ragi drink with buttermilk.', method='mix',
      extra_steps=['Cook: Mix ragi with ½ cup water and cook for 5 minutes, stirring, until thick; cool.'])
drink('Sabja Lemonade', 'chia 10 (or sabja) soaked; lemon 20; water 500; mint 3; honey 10', 'Cooling lemonade with soaked basil (sabja) or chia seeds.', method='mix')
drink('Pineapple Mint Cooler', 'pineapple 250; mint 5; lemon 5; water 200', 'A tangy pineapple drink with mint.', method='blend')
drink('Orange Carrot Juice', 'orange 300 segments; carrot 150; ginger 3', 'A vitamin-rich orange and carrot juice.', method='blend')
drink('Guava Juice', 'guava 250; lemon 5; blacksalt; water 200', 'A vitamin C-rich pink guava juice.', method='blend')
drink('Muskmelon Smoothie', 'muskmelon 300; curd 100; mint 3', 'A light summer smoothie of muskmelon and curd.', method='blend')
drink('Coffee Protein Shake', 'milk 300; coffee 3; banana 100; peanut 15; cocoa 5', 'A morning coffee shake with banana and peanuts.', method='blend')
drink('Soy Milk Smoothie', 'soymilk 300; banana 100; strawberry 80; flax 7', 'A dairy-free, protein-rich smoothie.', method='blend')
