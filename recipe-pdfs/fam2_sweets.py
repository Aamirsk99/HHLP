"""Volume 2 - healthy sweets and drinks."""
import core
from fam_sweets import kheer, halwa, ladoo, set_sweet, drink

core.VOLUME = 2

kheer('Beetroot Kheer', 'beet 200 grated', 'A pink kheer with grated beetroot.', mins=20, sweet='jaggery 30')
kheer('Pumpkin Kheer', 'pumpkin 250 grated', 'A mildly sweet pumpkin kheer.', mins=20, sweet='jaggery 30')
kheer('Sweet Corn Kheer', 'corn 200 coarsely crushed', 'Creamy kheer with crushed sweet corn.', mins=15, sweet='jaggery 30')
kheer('Kodo Millet Kheer', 'kodo 50 washed', 'Kheer made with kodo millet.', mins=30)
kheer('Little Millet Kheer', 'kutki 50 washed', 'Kheer made with little millet.', mins=30)
kheer('Sama Kheer (Vrat)', 'sama 50 washed', 'Barnyard millet kheer for fasting days.', mins=25, tags=('fast',))
kheer('Ragi Semiya Kheer', 'semiya 50 roasted; ragi 15', 'Vermicelli kheer with a little ragi.', mins=10)
kheer('Coconut Rice Payasam', 'rice 50 washed', 'Rice payasam with coconut milk and jaggery.', liquid='coconutmilk 400; milk 300', sweet='jaggery 45', nuts='cashew 10; coconut 10', mins=30)
kheer('Gur ki Kheer', 'rice 50 washed', 'Rice kheer sweetened with jaggery, a winter favourite.', sweet='jaggery 45', mins=30)
kheer('Paneer Kheer', 'paneer 100 grated', 'A rich kheer with grated paneer.', mins=10, sweet='jaggery 30')
kheer('Makhana Dates Kheer', 'makhana 40 roasted, crushed', 'Makhana kheer sweetened only with dates.', sweet='dates 40 chopped', mins=15)
kheer('Lauki Dates Kheer', 'lauki 250 grated', 'Bottle gourd kheer sweetened with dates.', sweet='dates 40 chopped', mins=20)
kheer('Mango Sabudana Kheer', 'sabudana 40 soaked', 'Sago kheer with fresh mango.', sweet='mango 150 pulp', mins=12)
kheer('Pistachio Kheer', 'rice 40 washed; pistachio 25 ground', 'A pistachio-flavoured rice kheer.', mins=30)
kheer('Quinoa Coconut Payasam', 'quinoa 50 rinsed', 'Quinoa payasam with coconut milk and jaggery.', liquid='coconutmilk 300; milk 300', sweet='jaggery 40', mins=25)

halwa('Dalia Halwa', 'dalia 100', 'Broken wheat halwa with jaggery.', liquid='milk 300; water 150', mins=15, roast=True)
halwa('Besan Halwa (Lighter)', 'besan 100', 'Besan halwa made with less ghee.', liquid='milk 300', fat='ghee 25', mins=6, roast=True)
halwa('Apple Halwa', 'apple 400 grated', 'A quick apple halwa with cinnamon.', liquid='milk 120', sweet='jaggery 15', flav='cinnamon 1', mins=12)
halwa('Dates Halwa', 'dates 200 chopped', 'A rich halwa made only with dates.', liquid='milk 240', sweet='raisin 15', mins=12)
halwa('Ash Gourd Halwa (Kashi Halwa)', 'ashgourd 500 grated, squeezed', 'Karnataka ash gourd halwa.', liquid='milk 120', mins=25)
halwa('Sooji Coconut Halwa', 'rava 80; coconut 40', 'Semolina halwa with coconut.', liquid='milk 240; water 120', mins=6, roast=True)
halwa('Rajgira Sheera', 'rajgira 100', 'Amaranth flour sheera for fasting.', liquid='milk 300', mins=6, roast=True)
halwa('Kuttu Halwa', 'kuttu 100', 'Buckwheat flour halwa for vrat.', liquid='milk 200; water 100', mins=6, roast=True)
halwa('Singhara Halwa', 'singhara 100', 'Water chestnut flour halwa.', liquid='milk 200; water 100', mins=6, roast=True)
halwa('Banana Halwa', 'banana 300 mashed', 'A quick halwa of ripe bananas.', liquid='milk 100', sweet='jaggery 15', mins=10)
halwa('Carrot Dates Halwa', 'carrot 500 grated', 'Gajar halwa sweetened with dates.', liquid='milk 500', sweet='dates 60 chopped', mins=35)

L = [
    ('Dates Coconut Ladoo', 'dates 200; coconut 60; almond 20; elaichipowder 1', 'Sugar-free dates and coconut ladoos.', 'Blend the dates; roast the coconut lightly.', {}),
    ('Chia Dates Ladoo', 'dates 200; chia 30; almond 30; walnut 20', 'Dates ladoos with chia seeds.', 'Blend dates; chop nuts.', {}),
    ('Pumpkin Seed Energy Balls', 'pumpkinseed 60; dates 150; oats 40 roasted; cocoa 5', 'Energy balls with pumpkin seeds and oats.', 'Roast seeds and oats; blend the dates.', {}),
    ('Sesame Dates Ladoo', 'sesame 100 roasted; dates 150; elaichipowder 1', 'Sesame ladoos bound with dates instead of jaggery.', 'Roast sesame; blend dates.', {}),
    ('Peanut Jaggery Ladoo', 'peanut 150 roasted; jaggery 100; elaichipowder 1', 'Peanut and jaggery ladoos.', 'Roast and crush peanuts coarsely.', {}),
    ('Roasted Chana Ladoo', 'roastchana 150; jaggery 90; ghee 20; elaichipowder 1', 'High-protein roasted chana ladoos.', 'Grind the roasted chana to a powder.', {}),
    ('Moong Dal Ladoo (Lighter)', 'moong 150 roasted, powdered; ghee 40; jaggery 80; elaichipowder 1', 'Moong dal ladoos with less ghee.', 'Roast moong dal until golden and grind.', {}),
    ('Rava Coconut Ladoo', 'rava 120; coconut 60; ghee 25; jaggery 80; milk 40; elaichipowder 1', 'Soft rava-coconut ladoos.', 'Roast rava in ghee with coconut.', {}),
    ('Atta Ladoo (Lighter)', 'atta 150; ghee 40; jaggery 80; almond 20; elaichipowder 1', 'Whole-wheat ladoos with less ghee.', 'Roast the atta in ghee until golden.', {}),
    ('Quinoa Ladoo', 'quinoa 80 roasted, powdered; dates 120; almond 20; ghee 10', 'Quinoa and date ladoos.', 'Roast quinoa and powder it; blend dates.', {}),
    ('Ragi Dates Ladoo', 'ragi 100 roasted; dates 150; peanut 30; ghee 10', 'Sugar-free ragi ladoos.', 'Roast ragi in ghee; blend dates.', {}),
    ('Jowar Ladoo', 'jowar 120 roasted; jaggery 80; ghee 30; sesame 10', 'Jowar flour ladoos with jaggery.', 'Roast jowar flour in ghee.', {}),
    ('Bajra Ladoo', 'bajra 120 roasted; jaggery 80; ghee 30; dryginger 1', 'Warming bajra ladoos for winter.', 'Roast bajra flour in ghee.', {}),
    ('Methi Ladoo (Lighter)', 'methiseed 30 powdered; atta 100; ghee 40; jaggery 100; almond 20; dryginger 2', 'Traditional winter methi ladoos with less ghee.',
     'Soak methi powder in milk overnight; roast atta in ghee.', {}),
    ('Coconut Almond Ladoo', 'coconut 120; almond 40 ground; dates 80; elaichipowder 1', 'Coconut and almond ladoos.', 'Roast coconut; blend dates.', {}),
    ('Fig Walnut Barfi', 'dfig 150 soaked; walnut 60; dates 50; ghee 5', 'Sugar-free fig and walnut barfi.', 'Blend figs and dates; chop walnuts.',
     {'bind_txt': 'Shape: Roll into a log, chill 1 hour and slice.'}),
    ('Peanut Barfi (Jaggery)', 'peanut 150 roasted, ground; jaggery 100; ghee 10', 'Peanut barfi with jaggery.', 'Melt jaggery to a soft-ball stage.',
     {'bind_txt': 'Set: Press into a greased tray and cut while warm.'}),
    ('Coconut Barfi (Jaggery)', 'coconut 200; jaggery 100; milk 80; elaichipowder 1', 'Coconut barfi with jaggery.', 'Cook coconut with jaggery and milk until thick.',
     {'bind_txt': 'Set: Press into a greased tray and cut into squares.'}),
    ('Besan Barfi (Lighter)', 'besan 150; ghee 50; jaggery 80; milk 40; elaichipowder 1', 'Besan barfi with less ghee.', 'Roast besan in ghee until nutty.',
     {'bind_txt': 'Set: Press into a greased tray and cut into squares.'}),
    ('Almond Chikki', 'almond 150 chopped; jaggery 120; ghee 5', 'Crunchy almond and jaggery chikki.', 'Melt jaggery to the hard-crack stage.',
     {'bind_txt': 'Spread: Mix quickly, roll flat and cut into pieces.'}),
    ('Mixed Seed Chikki', 'pumpkinseed 50; sunseed 50; sesame 30; flax 20; jaggery 120; ghee 5', 'A mineral-rich mixed seed chikki.', 'Roast the seeds; melt jaggery to hard-crack.',
     {'bind_txt': 'Spread: Mix quickly, roll flat and cut.'}),
    ('Rajgira Chikki', 'rajgira 80 popped; jaggery 100; ghee 5', 'Puffed amaranth chikki, light and crunchy.', 'Melt the jaggery to the hard-crack stage.',
     {'bind_txt': 'Spread: Mix with the popped amaranth, roll flat and cut.', 'tags': ('fast',)}),
    ('Murmura Ladoo', 'puffrice 60; jaggery 100; peanut 30', 'Puffed rice and jaggery ladoos.', 'Melt the jaggery to a soft-ball stage.', {}),
    ('Cashew Dates Roll', 'dates 200; cashew 60; pistachio 20; ghee 5', 'Sugar-free date roll with cashews.', 'Cook date paste in ghee for 3 minutes.',
     {'bind_txt': 'Shape: Roll into a log, chill and slice.'}),
    ('Oats Peanut Energy Bar', 'oats 120 roasted; peanut 60; dates 120; honey 20; sesame 10', 'Homemade oats and peanut bars.', 'Roast oats, peanuts and sesame; warm dates with honey.',
     {'bind_txt': 'Set: Press firmly into a lined tray, chill and cut into bars.'}),
]
for name, mix, desc, prep, kw in L:
    ladoo(name, mix.replace('; ghee 0', ''), desc, prep, **kw)

for name, items, desc, steps, kw in [
    ('Fruit Shrikhand', 'hungcurd 400; mango 60; pomegranate 30; banana 60; jaggery 20; elaichipowder 0.5', 'Shrikhand with mixed fruit.',
     ['Hang the curd: Drain curd in muslin for 4–6 hours.', 'Whisk: Whisk with jaggery and cardamom.', 'Fold: Fold in the chopped fruit.', 'Chill & serve: Chill for 1 hour.'], {}),
    ('Strawberry Yogurt', 'hungcurd 300; strawberry 150; honey 10', 'Thick strawberry yogurt with no added sugar besides honey.',
     ['Purée: Blend half the strawberries.', 'Mix: Whisk into hung curd with honey.', 'Top: Add the chopped strawberries.', 'Chill & serve: Chill for 30 minutes.'], {}),
    ('Banana Yogurt Pudding', 'hungcurd 300; banana 150; dates 16; cinnamon 0.5', 'A creamy banana and yogurt pudding.',
     ['Blend: Blend banana, dates and half the curd.', 'Fold: Fold into the remaining curd.', 'Chill: Chill for 1 hour.', 'Serve: Dust with cinnamon.'], {}),
    ('Sweet Kozhukattai', 'ricefl 150; water 200; coconut 120; jaggery 80; elaichipowder 1; ghee 5', 'Tamil steamed rice dumplings with coconut-jaggery filling.',
     ['Filling: Cook coconut with jaggery until sticky; add cardamom.', 'Dough: Make a soft dough with hot water and rice flour.', 'Shape: Fill and seal into dumplings.',
      'Steam: Steam for 10–12 minutes.'], {'serves': 6}),
    ('Mango Phirni', 'rice 40 soaked, ground; milk 600; mango 150; elaichipowder 0.5; pistachio 10', 'Ground-rice pudding with mango, no sugar.',
     ['Cook: Simmer milk with ground rice, stirring, until thick (15 minutes).', 'Cool: Cool completely.', 'Mango: Stir in the mango pulp.', 'Set: Pour into bowls and chill.'], {}),
    ('Sitaphal Kulfi', 'milk 750; custardapple 200; dates 30; almond 15', 'Creamy kulfi with custard apple pulp and dates.',
     ['Reduce: Simmer the milk until reduced by half; cool.', 'Blend: Blend with the custard apple pulp and dates.', 'Freeze: Pour into moulds and freeze overnight.', 'Serve: Unmould and serve.'],
     {'store': 'keeps in the freezer for 2 weeks.'}),
    ('Chikoo Kulfi', 'milk 750; chikoo 200; dates 20; almond 15', 'Chikoo kulfi sweetened with fruit and dates.',
     ['Reduce: Simmer milk until reduced by half; cool.', 'Blend: Blend with chikoo and dates.', 'Freeze: Freeze in moulds overnight.', 'Serve: Unmould and serve.'],
     {'store': 'keeps in the freezer for 2 weeks.'}),
    ('Mango Frozen Yogurt', 'hungcurd 300; mango 250; honey 15', 'A creamy mango frozen yogurt.',
     ['Blend: Blend curd, mango and honey until smooth.', 'Freeze: Freeze for 4 hours, stirring every hour.', 'Soften: Rest 5 minutes before scooping.', 'Serve: Serve in bowls.'],
     {'store': 'keeps in the freezer for 2 weeks.'}),
    ('Dates Chocolate Fudge', 'dates 200; cocoa 20; almond 40; coconut 20', 'No-sugar chocolate fudge from dates.',
     ['Blend: Blend dates with cocoa to a sticky dough.', 'Add nuts: Mix in chopped almonds.', 'Set: Press into a tray, top with coconut and chill.', 'Cut: Cut into squares.'],
     {'serves': 8, 'store': 'keeps in the fridge for 2 weeks.'}),
    ('Oats Jaggery Cookies', 'oats 120; atta 60; jaggery 60; oil 30; milk 30; soda 1; elaichipowder 0.5', 'Crisp oats cookies with jaggery.',
     ['Mix: Mix the dry ingredients; add oil and milk to form a dough.', 'Shape: Shape small flat cookies.', 'Bake: Bake at 180°C for 15 minutes.', 'Cool: Cool on a rack.'],
     {'serves': 8, 'store': 'keeps in an airtight box for 1 week.'}),
    ('Ragi Cookies', 'ragi 100; atta 50; jaggery 60; ghee 30; milk 30; soda 1', 'Crunchy ragi cookies with jaggery.',
     ['Mix: Mix the flours and jaggery; add ghee and milk.', 'Shape: Shape into small cookies.', 'Bake: Bake at 180°C for 15–18 minutes.', 'Cool: Cool completely.'],
     {'serves': 8, 'store': 'keeps in an airtight box for 1 week.'}),
    ('Atta Jaggery Cake', 'atta 150; jaggery 100; curd 120; oil 50; milk 100; soda 2; elaichipowder 1; walnut 20', 'A soft whole-wheat cake with jaggery.',
     ['Wet: Whisk curd, jaggery, oil and milk.', 'Dry: Sift atta with soda.', 'Combine: Fold together with walnuts.', 'Bake: Bake at 180°C for 30–35 minutes.'],
     {'serves': 8, 'store': 'keeps for 3 days in an airtight box.'}),
    ('Banana Bread (Atta)', 'atta 150; banana 250 ripe; jaggery 50; oil 40; curd 60; soda 2; cinnamon 1; walnut 25', 'Moist whole-wheat banana bread.',
     ['Mash: Mash the bananas with jaggery, oil and curd.', 'Combine: Fold in atta, soda and cinnamon.', 'Add nuts: Fold in walnuts.', 'Bake: Bake at 180°C for 40 minutes.'],
     {'serves': 8, 'store': 'keeps for 3 days.'}),
    ('Carrot Cake (Atta)', 'atta 150; carrot 150 grated; jaggery 80; oil 50; curd 100; soda 2; cinnamon 1; walnut 25', 'A wholesome whole-wheat carrot cake.',
     ['Wet: Whisk curd, jaggery and oil.', 'Combine: Fold in atta, soda, cinnamon and carrot.', 'Add nuts: Fold in walnuts.', 'Bake: Bake at 180°C for 35–40 minutes.'],
     {'serves': 8, 'store': 'keeps for 3 days in the fridge.'}),
    ('Baked Cinnamon Apples', 'apple 450; cinnamon 2; raisin 18; walnut 20; honey 14', 'Warm baked apples with cinnamon and walnuts.',
     ['Core: Core the apples.', 'Fill: Fill with raisins, walnuts and cinnamon.', 'Bake: Bake at 180°C for 25 minutes.', 'Serve: Drizzle honey and serve warm.'], {'serves': 3}),
    ('Mango Coconut Chia Pudding', 'chia 36; coconutmilk 300; mango 150; honey 7', 'Chia pudding in coconut milk with mango.',
     ['Soak: Stir chia into coconut milk with honey; rest 10 minutes and stir.', 'Set: Refrigerate 4 hours.', 'Layer: Layer with mango.', 'Serve: Serve chilled.'], {'serves': 3}),
    ('Chocolate Chia Pudding', 'chia 36; milk 360; cocoa 10; dates 24', 'A no-sugar chocolate chia pudding.',
     ['Blend: Blend milk, cocoa and dates.', 'Soak: Stir in chia and rest 10 minutes; stir again.', 'Set: Refrigerate 4 hours.', 'Serve: Serve chilled.'], {'serves': 3}),
    ('Watermelon Mint Granita', 'watermelon 500; mint 5; lemon 10', 'A refreshing frozen watermelon granita.',
     ['Blend: Blend watermelon with mint and lemon.', 'Freeze: Freeze in a tray.', 'Scrape: Scrape with a fork every 45 minutes for 3 hours.', 'Serve: Serve in chilled glasses.'],
     {'store': 'keeps in the freezer for 1 week.'}),
    ('Steamed Rice Dates Modak', 'ricefl 150; water 200; ghee 5; dates 100; coconut 60; elaichipowder 1', 'Steamed modak with a date-coconut filling, no jaggery.',
     ['Filling: Cook chopped dates with coconut for 4 minutes.', 'Dough: Make a soft rice flour dough with hot water.', 'Shape: Pleat around the filling.', 'Steam: Steam 12 minutes.'], {'serves': 6}),
    ('Ragi Malt Pudding', 'ragi 40; milk 400; jaggery 20; elaichipowder 0.5; almond 10', 'A set ragi pudding.',
     ['Cook: Cook ragi in milk, stirring, until thick.', 'Sweeten: Add jaggery off the heat.', 'Set: Pour into bowls and chill.', 'Serve: Garnish with almonds.'], {}),
]:
    set_sweet(name, items, desc, steps, **kw)

D = [
    ('Pineapple Lassi', 'curd 250; pineapple 150; honey 7; ice 50', 'blend'), ('Strawberry Lassi', 'curd 250; strawberry 150; honey 7', 'blend'),
    ('Chikoo Lassi', 'curd 250; chikoo 120; elaichipowder 0.3', 'blend'), ('Rose Lassi', 'curd 300; rosewater 5; jaggery 12', 'blend'),
    ('Mint Lassi', 'curd 300; mint 8; jeerapowder 0.5; blacksalt', 'blend'), ('Ginger Chaas', 'curd 200; water 300; ginger 8; blacksalt; jeerapowder 0.5', 'blend'),
    ('Beetroot Smoothie', 'beet 100; apple 120; curd 150; lemon 5', 'blend'), ('Carrot Ginger Smoothie', 'carrot 150; orange 150; ginger 5; water 100', 'blend'),
    ('Mango Oats Smoothie', 'mango 150; oats 20; milk 250', 'blend'), ('Papaya Banana Smoothie', 'papaya 150; banana 80; milk 200', 'blend'),
    ('Apple Oats Smoothie', 'apple 150; oats 20; milk 250; cinnamon 0.5', 'blend'), ('Guava Smoothie', 'guava 150; banana 80; curd 150', 'blend'),
    ('Kiwi Smoothie', 'kiwi 150; banana 80; curd 150; honey 5', 'blend'), ('Pear Smoothie', 'pear 150; oats 15; milk 250; cinnamon 0.3', 'blend'),
    ('Avocado Smoothie', 'avocado 100; banana 80; milk 250; honey 7', 'blend'), ('Avocado Spinach Smoothie', 'avocado 80; spinach 40; apple 120; water 200; lemon 5', 'blend'),
    ('Dates Banana Shake', 'dates 32; banana 100; milk 300', 'blend'), ('Anjeer Milkshake', 'dfig 40 soaked; milk 300; almond 8', 'blend'),
    ('Ragi Banana Smoothie', 'ragi 15 cooked; banana 100; milk 250', 'blend'), ('Sattu Banana Smoothie', 'sattu 25; banana 100; milk 250', 'blend'),
    ('Mango Chia Smoothie', 'mango 150; chia 8; curd 150', 'blend'), ('Pomegranate Juice', 'pomegranate 300; lemon 5; water 100', 'blend'),
    ('Orange Ginger Juice', 'orange 400 segments; ginger 5', 'blend'), ('Cucumber Mint Juice', 'cucumber 300; mint 6; lemon 10; blacksalt', 'blend'),
    ('Beetroot Amla Juice', 'beet 100; amla 60; water 250; blacksalt', 'blend'), ('Ash Gourd Juice', 'ashgourd 300; lemon 5; water 100', 'blend'),
    ('Lauki Juice', 'lauki 300; mint 5; lemon 5; water 100', 'blend'), ('Karela Juice', 'karela 100; lemon 10; amla 30; water 200; blacksalt', 'blend'),
    ('Spinach Cucumber Juice', 'spinach 60; cucumber 200; lemon 10; ginger 3; water 100', 'blend'), ('Tulsi Tea', 'water 480; herbal 2; ginger 5; honey 7', 'hot'),
    ('Saunf Water', 'water 500; saunf 6', 'hot'), ('Ajwain Water', 'water 500; ajwain 3', 'hot'), ('Dhaniya Water', 'water 500; dhaniaseed 6', 'hot'),
    ('Turmeric Ginger Tea', 'water 480; haldi 2; ginger 10; pepper 0.3; lemon 10; honey 7', 'hot'),
    ('Masala Milk', 'milk 400; elaichipowder 0.5; nutmeg; saffron; almond 10; pistachio 6; jaggery 10', 'hot'), ('Kesar Milk', 'milk 400; saffron; elaichipowder 0.5; jaggery 8', 'hot'),
    ('Hot Cocoa (No Sugar)', 'milk 400; cocoa 10; dates 16; cinnamon 0.3', 'blend'), ('Cold Coffee (Less Sugar)', 'milk 360; coffee 4; jaggery 10; ice 80', 'blend'),
    ('Jaggery Lemonade', 'lemon 30; jaggery 20; water 500; blacksalt', 'mix'), ('Mint Lemonade', 'lemon 30; mint 8; water 500; honey 10; ice 60', 'blend'),
    ('Kokum Lemonade', 'kokum 12 soaked; lemon 10; jaggery 15; water 500', 'mix'), ('Coconut Water Smoothie', 'coconutwater 300; banana 80; coconut 20', 'blend'),
    ('Pineapple Ginger Juice', 'pineapple 300; ginger 5; water 100', 'blend'), ('Apple Carrot Juice', 'apple 150; carrot 150; lemon 5; water 100', 'blend'),
    ('Moong Sprouts Smoothie (Savoury)', 'sprouts 80; curd 200; cucumber 80; mint 4; blacksalt', 'blend'),
]
DESC = {'Pineapple Lassi': 'A tangy-sweet pineapple lassi, lightly sweetened with honey.', 'Strawberry Lassi': 'A pink strawberry lassi rich in vitamin C.', 'Chikoo Lassi': 'A naturally sweet sapota lassi.', 'Rose Lassi': 'A fragrant rose lassi sweetened with a little jaggery.', 'Mint Lassi': 'A cooling savoury mint lassi.', 'Ginger Chaas': 'Spiced buttermilk with fresh ginger, great for digestion.', 'Beetroot Smoothie': 'A vibrant beetroot, apple and curd smoothie.', 'Carrot Ginger Smoothie': 'Carrot and orange smoothie with a ginger kick.', 'Mango Oats Smoothie': 'A filling mango smoothie with oats.', 'Papaya Banana Smoothie': 'A digestive papaya and banana smoothie.', 'Apple Oats Smoothie': 'Apple and oats smoothie with cinnamon.', 'Guava Smoothie': 'A vitamin C-rich guava smoothie.', 'Kiwi Smoothie': 'A tangy kiwi and banana smoothie.', 'Pear Smoothie': 'Pear and oats smoothie with cinnamon.', 'Avocado Smoothie': 'A creamy avocado and banana smoothie with healthy fats.', 'Avocado Spinach Smoothie': 'A green smoothie with avocado, spinach and apple.', 'Dates Banana Shake': 'A naturally sweet date and banana shake.', 'Anjeer Milkshake': 'A fig and almond milkshake with no added sugar.', 'Ragi Banana Smoothie': 'A calcium-rich ragi and banana smoothie.', 'Sattu Banana Smoothie': 'A high-protein sattu and banana smoothie.', 'Mango Chia Smoothie': 'Mango smoothie with chia seeds.', 'Pomegranate Juice': 'Fresh pomegranate juice, rich in antioxidants.', 'Orange Ginger Juice': 'Fresh orange juice with ginger.', 'Cucumber Mint Juice': 'A hydrating cucumber and mint cooler.', 'Beetroot Amla Juice': 'A tangy beetroot and amla juice.', 'Ash Gourd Juice': 'A cooling ash gourd juice, traditionally taken in the morning.', 'Lauki Juice': 'Light bottle gourd juice with mint and lemon.', 'Karela Juice': 'Bitter gourd juice with amla and lemon, traditionally used for blood sugar.', 'Spinach Cucumber Juice': 'A green juice of spinach and cucumber.', 'Tulsi Tea': 'Holy basil tea with ginger, soothing for colds.', 'Saunf Water': 'Fennel seed water, a traditional digestive.', 'Ajwain Water': 'Carom seed water that eases gas and bloating.', 'Dhaniya Water': 'Coriander seed water, cooling and digestive.', 'Turmeric Ginger Tea': 'An anti-inflammatory turmeric and ginger tea.', 'Masala Milk': 'Warm milk with saffron, nutmeg and nuts.', 'Kesar Milk': 'Warm saffron milk, lightly sweetened.', 'Hot Cocoa (No Sugar)': 'Warm cocoa milk sweetened with dates.', 'Cold Coffee (Less Sugar)': 'Chilled coffee with less sugar.', 'Jaggery Lemonade': 'Old-fashioned lemonade sweetened with jaggery.', 'Mint Lemonade': 'A refreshing mint lemonade.', 'Kokum Lemonade': 'Kokum and lemon cooler.', 'Coconut Water Smoothie': 'Tender coconut water blended with banana.', 'Pineapple Ginger Juice': 'Pineapple juice with ginger.', 'Apple Carrot Juice': 'A sweet apple and carrot juice.', 'Moong Sprouts Smoothie (Savoury)': 'A savoury high-protein smoothie of sprouts and curd.'}
for name, items, method in D:
    drink(name, items, DESC[name], method=method)
