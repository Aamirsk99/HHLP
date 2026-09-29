/*
 * Meal library for the diet chart generator.
 *
 * Each meal option is a complete, ready-to-serve plate for one meal slot.
 * Nutrition values are approximate, per base serving (as listed in `items`),
 * and are scaled up or down by the planner to hit each slot's calorie target.
 *
 * Fields
 *   slot       early | breakfast | midmorning | lunch | evening | dinner | bedtime
 *   diet       vegan | veg | egg | nonveg   (the least restrictive diet that allows it)
 *   cuisine    in (Indian) | gl (global)
 *   n          [kcal, protein g, carbs g, fat g]
 *   items      [name, quantity, unit, fixed?]  fixed items are not scaled
 *   allergens  gluten, dairy, nuts, soy, egg, fish
 *   flags      hgi (high glycaemic load), hna (high sodium)
 */
(function (root) {
  function M(slot, diet, cuisine, name, n, items, allergens, flags) {
    return {
      slot, diet, cuisine, name,
      kcal: n[0], p: n[1], c: n[2], f: n[3],
      items,
      allergens: allergens ? allergens.split(' ') : [],
      flags: flags ? flags.split(' ') : [],
    };
  }

  const MEALS = [
    // ── Early morning ───────────────────────────────────────────────
    M('early', 'vegan', 'in', 'Lemon water & soaked almonds', [45, 1.5, 2, 3.5],
      [['Warm lemon water', 1, 'glass', true], ['Soaked almonds', 5, 'pc', true]], 'nuts'),
    M('early', 'vegan', 'in', 'Methi water & walnuts', [60, 1.5, 2, 5],
      [['Soaked methi (fenugreek) seed water', 1, 'glass', true], ['Walnut halves', 2, 'pc', true]], 'nuts'),
    M('early', 'vegan', 'gl', 'Green tea & chia', [35, 1, 2, 2],
      [['Green tea (no sugar)', 1, 'cup', true], ['Soaked chia seeds', 1, 'tsp', true]]),
    M('early', 'vegan', 'in', 'Jeera water & pumpkin seeds', [40, 2, 2, 3],
      [['Warm jeera (cumin) water', 1, 'glass', true], ['Pumpkin seeds', 1, 'tsp', true]]),

    // ── Breakfast ───────────────────────────────────────────────────
    M('breakfast', 'vegan', 'in', 'Vegetable poha', [300, 7, 50, 8],
      [['Vegetable poha', 1.5, 'cup'], ['Roasted peanuts', 1, 'tbsp'], ['Lemon wedge', 1, 'pc', true]], 'nuts'),
    M('breakfast', 'vegan', 'in', 'Moong dal chilla', [280, 16, 36, 8],
      [['Moong dal chilla', 2, 'pc'], ['Mint–coriander chutney', 2, 'tbsp', true]]),
    M('breakfast', 'vegan', 'in', 'Vegetable upma', [290, 8, 45, 9],
      [['Vegetable rava upma', 1.5, 'cup'], ['Coconut chutney', 1, 'tbsp', true]], 'gluten'),
    M('breakfast', 'vegan', 'in', 'Idli sambar', [330, 11, 58, 6],
      [['Idli', 3, 'pc'], ['Sambar', 1, 'katori'], ['Coconut chutney', 2, 'tbsp', true]], '', 'hgi'),
    M('breakfast', 'veg', 'in', 'Besan chilla with curd', [300, 15, 30, 12],
      [['Besan (gram flour) chilla', 2, 'pc'], ['Curd', 0.5, 'katori']], 'dairy'),
    M('breakfast', 'veg', 'in', 'Paneer paratha with curd', [380, 17, 42, 16],
      [['Paneer-stuffed multigrain paratha', 1, 'pc'], ['Curd', 0.5, 'katori']], 'gluten dairy'),
    M('breakfast', 'vegan', 'in', 'Ragi dosa with sambar', [300, 9, 52, 6],
      [['Ragi dosa', 2, 'pc'], ['Sambar', 1, 'katori']]),
    M('breakfast', 'veg', 'in', 'Dalia porridge', [300, 11, 48, 7],
      [['Broken-wheat dalia cooked in milk', 1.5, 'cup'], ['Chopped nuts', 1, 'tsp', true]], 'gluten dairy nuts'),
    M('breakfast', 'vegan', 'in', 'Sprouts chaat & toast', [280, 15, 44, 4],
      [['Moong sprouts chaat', 1.5, 'cup'], ['Multigrain toast', 1, 'slice']], 'gluten'),
    M('breakfast', 'egg', 'in', 'Masala omelette & toast', [360, 20, 30, 17],
      [['Masala omelette (2 eggs)', 1, 'pc'], ['Multigrain toast', 2, 'slice']], 'egg gluten'),
    M('breakfast', 'egg', 'in', 'Egg bhurji & phulka', [300, 16, 18, 17],
      [['Egg bhurji (2 eggs)', 1, 'katori'], ['Phulka', 1, 'pc']], 'egg gluten'),
    M('breakfast', 'veg', 'gl', 'Overnight oats', [320, 13, 46, 9],
      [['Overnight oats with milk & chia', 1, 'cup'], ['Berries or chopped fruit', 0.5, 'cup']], 'dairy'),
    M('breakfast', 'veg', 'gl', 'Greek yogurt parfait', [280, 18, 34, 8],
      [['Greek yogurt', 150, 'g'], ['Chopped fruit', 0.5, 'cup'], ['Mixed seeds', 1, 'tbsp']], 'dairy'),
    M('breakfast', 'vegan', 'gl', 'Peanut butter banana toast', [340, 12, 46, 13],
      [['Whole-wheat toast', 2, 'slice'], ['Peanut butter', 1, 'tbsp'], ['Banana', 0.5, 'pc']], 'gluten nuts'),
    M('breakfast', 'vegan', 'gl', 'Tofu scramble & toast', [300, 20, 22, 14],
      [['Tofu scramble with vegetables', 1, 'cup'], ['Multigrain toast', 1, 'slice']], 'soy gluten'),
    M('breakfast', 'egg', 'gl', 'Avocado toast with egg', [350, 15, 32, 18],
      [['Multigrain toast', 2, 'slice'], ['Mashed avocado', 0.5, 'pc'], ['Boiled egg', 1, 'pc']], 'egg gluten'),
    M('breakfast', 'vegan', 'gl', 'Soy smoothie bowl', [300, 12, 48, 7],
      [['Soy milk, banana & oats smoothie', 1, 'bowl'], ['Mixed seeds', 1, 'tsp', true]], 'soy'),

    // ── Mid-morning ─────────────────────────────────────────────────
    M('midmorning', 'vegan', 'in', 'Seasonal fruit', [90, 1, 22, 0],
      [['Seasonal fruit (apple / guava / orange)', 1, 'bowl']]),
    M('midmorning', 'veg', 'in', 'Chaas & roasted chana', [110, 6, 12, 3],
      [['Chaas (buttermilk)', 1, 'glass'], ['Roasted chana', 2, 'tbsp']], 'dairy'),
    M('midmorning', 'vegan', 'in', 'Coconut water & almonds', [80, 2, 9, 4],
      [['Tender coconut water', 1, 'glass'], ['Almonds', 5, 'pc']], 'nuts'),
    M('midmorning', 'vegan', 'gl', 'Apple with peanut butter', [190, 4, 26, 8],
      [['Apple', 1, 'pc'], ['Peanut butter', 1, 'tbsp']], 'nuts'),
    M('midmorning', 'vegan', 'in', 'Roasted makhana', [100, 3, 18, 1],
      [['Roasted makhana (fox nuts)', 1, 'cup']]),
    M('midmorning', 'vegan', 'in', 'Papaya & pumpkin seeds', [110, 4, 16, 4],
      [['Papaya', 1, 'bowl'], ['Pumpkin seeds', 1, 'tbsp']]),
    M('midmorning', 'veg', 'gl', 'Greek yogurt cup', [100, 10, 6, 3],
      [['Plain Greek yogurt', 100, 'g']], 'dairy'),
    M('midmorning', 'egg', 'gl', 'Boiled egg & cucumber', [85, 6.5, 3, 5],
      [['Boiled egg', 1, 'pc'], ['Cucumber slices', 1, 'cup', true]], 'egg'),

    // ── Lunch ───────────────────────────────────────────────────────
    M('lunch', 'veg', 'in', 'Dal, sabzi & phulka thali', [520, 20, 75, 14],
      [['Phulka', 2, 'pc'], ['Dal', 1, 'katori'], ['Mixed vegetable sabzi', 1, 'katori'], ['Curd', 0.5, 'katori'], ['Green salad', 1, 'bowl', true]], 'gluten dairy'),
    M('lunch', 'vegan', 'in', 'Rajma with brown rice', [480, 17, 82, 8],
      [['Brown rice', 1, 'cup'], ['Rajma', 1, 'katori'], ['Green salad', 1, 'bowl', true]]),
    M('lunch', 'veg', 'in', 'Chana masala with jowar roti', [510, 19, 78, 12],
      [['Jowar roti', 2, 'pc'], ['Chana masala', 1, 'katori'], ['Cucumber raita', 0.5, 'katori']], 'dairy'),
    M('lunch', 'veg', 'in', 'Veg pulao with dal & raita', [500, 17, 80, 12],
      [['Vegetable pulao', 1, 'cup'], ['Dal', 1, 'katori'], ['Raita', 0.5, 'katori']], 'dairy', 'hgi'),
    M('lunch', 'veg', 'in', 'Quinoa khichdi', [450, 17, 66, 12],
      [['Vegetable quinoa khichdi', 1.5, 'cup'], ['Curd', 0.5, 'katori']], 'dairy'),
    M('lunch', 'vegan', 'in', 'Moong dal khichdi', [440, 16, 70, 9],
      [['Moong dal khichdi', 1.5, 'cup'], ['Green salad', 1, 'bowl', true]]),
    M('lunch', 'veg', 'in', 'Palak paneer & phulka', [540, 24, 48, 27],
      [['Palak paneer', 1, 'katori'], ['Phulka', 2, 'pc'], ['Green salad', 1, 'bowl', true]], 'dairy gluten'),
    M('lunch', 'veg', 'in', 'Sambar rice & poriyal', [490, 15, 82, 10],
      [['Steamed rice', 1, 'cup'], ['Sambar', 1, 'katori'], ['Beans poriyal', 1, 'katori'], ['Chaas (buttermilk)', 1, 'glass']], 'dairy', 'hgi'),
    M('lunch', 'nonveg', 'in', 'Chicken curry & phulka', [520, 36, 44, 20],
      [['Chicken curry (100 g chicken)', 1, 'katori'], ['Phulka', 2, 'pc'], ['Green salad', 1, 'bowl', true]], 'gluten'),
    M('lunch', 'nonveg', 'in', 'Fish curry & rice', [500, 32, 54, 15],
      [['Fish curry (120 g fish)', 1, 'katori'], ['Steamed rice', 1, 'cup'], ['Green salad', 1, 'bowl', true]], 'fish', 'hgi'),
    M('lunch', 'nonveg', 'gl', 'Grilled chicken quinoa bowl', [480, 38, 45, 15],
      [['Grilled chicken breast', 100, 'g'], ['Cooked quinoa', 1, 'cup'], ['Roasted vegetables', 1, 'cup']]),
    M('lunch', 'egg', 'in', 'Egg curry & phulka', [480, 22, 44, 22],
      [['Egg curry (2 eggs)', 1, 'katori'], ['Phulka', 2, 'pc'], ['Green salad', 1, 'bowl', true]], 'egg gluten'),
    M('lunch', 'vegan', 'gl', 'Chickpea buddha bowl', [500, 19, 66, 18],
      [['Roasted chickpeas & vegetables', 1.5, 'cup'], ['Brown rice', 0.5, 'cup'], ['Hummus', 2, 'tbsp']]),
    M('lunch', 'vegan', 'gl', 'Tofu stir-fry & brown rice', [480, 24, 58, 16],
      [['Tofu & vegetable stir-fry', 1.5, 'cup'], ['Brown rice', 1, 'cup']], 'soy', 'hna'),
    M('lunch', 'veg', 'gl', 'Whole-wheat veg pasta', [520, 24, 66, 17],
      [['Whole-wheat pasta with vegetables & paneer', 1.5, 'cup']], 'gluten dairy'),
    M('lunch', 'vegan', 'in', 'Soya chunk curry & phulka', [480, 30, 54, 14],
      [['Soya chunk curry', 1, 'katori'], ['Phulka', 2, 'pc'], ['Green salad', 1, 'bowl', true]], 'soy gluten'),

    // ── Evening snack ───────────────────────────────────────────────
    M('evening', 'veg', 'in', 'Masala tea & khakhra', [150, 5, 22, 4],
      [['Masala tea (less sugar)', 1, 'cup', true], ['Multigrain khakhra', 2, 'pc']], 'dairy gluten'),
    M('evening', 'vegan', 'in', 'Sprouts salad', [130, 9, 20, 1],
      [['Mixed sprouts salad', 1, 'cup']]),
    M('evening', 'vegan', 'in', 'Roasted chana & green tea', [120, 6, 18, 2],
      [['Roasted chana', 30, 'g'], ['Green tea', 1, 'cup', true]]),
    M('evening', 'vegan', 'in', 'Vegetable soup', [90, 3, 14, 2],
      [['Clear vegetable soup', 1, 'bowl']]),
    M('evening', 'veg', 'in', 'Paneer tikka', [200, 14, 6, 13],
      [['Paneer tikka', 80, 'g'], ['Mint chutney', 1, 'tbsp', true]], 'dairy'),
    M('evening', 'vegan', 'gl', 'Hummus & veggie sticks', [140, 5, 14, 7],
      [['Hummus', 2, 'tbsp'], ['Carrot & cucumber sticks', 1, 'cup', true]]),
    M('evening', 'vegan', 'in', 'Sprouts bhel', [150, 6, 26, 3],
      [['Sprouts bhel (no sev)', 1, 'cup']]),
    M('evening', 'nonveg', 'in', 'Chicken tikka', [180, 26, 4, 7],
      [['Chicken tikka', 100, 'g'], ['Onion & lemon salad', 1, 'bowl', true]]),
    M('evening', 'egg', 'gl', 'Boiled eggs', [150, 12, 1, 10],
      [['Boiled eggs with pepper', 2, 'pc']], 'egg'),
    M('evening', 'vegan', 'gl', 'Trail mix', [140, 4, 10, 10],
      [['Trail mix (nuts & seeds)', 25, 'g']], 'nuts'),

    // ── Dinner ──────────────────────────────────────────────────────
    M('dinner', 'vegan', 'in', 'Lauki sabzi, dal & phulka', [420, 16, 62, 11],
      [['Phulka', 2, 'pc'], ['Lauki (bottle gourd) sabzi', 1, 'katori'], ['Moong dal', 1, 'katori']], 'gluten'),
    M('dinner', 'veg', 'in', 'Grilled paneer & veggies', [420, 24, 26, 24],
      [['Grilled paneer', 100, 'g'], ['Sautéed vegetables', 1, 'cup'], ['Phulka', 1, 'pc']], 'dairy gluten'),
    M('dinner', 'veg', 'in', 'Vegetable dalia khichdi', [380, 14, 60, 9],
      [['Vegetable dalia khichdi', 1.5, 'cup'], ['Curd', 0.5, 'katori']], 'gluten dairy'),
    M('dinner', 'vegan', 'in', 'Millet roti & mixed dal', [430, 17, 66, 10],
      [['Bajra / jowar roti', 2, 'pc'], ['Mixed dal', 1, 'katori'], ['Green salad', 1, 'bowl', true]]),
    M('dinner', 'vegan', 'in', 'Tofu bhurji & phulka', [400, 22, 40, 17],
      [['Tofu bhurji', 1, 'katori'], ['Phulka', 2, 'pc']], 'soy gluten'),
    M('dinner', 'vegan', 'in', 'Soup & moong chilla', [360, 17, 48, 10],
      [['Mixed vegetable soup', 1, 'bowl'], ['Moong dal chilla', 2, 'pc']]),
    M('dinner', 'nonveg', 'gl', 'Grilled fish & brown rice', [430, 36, 34, 15],
      [['Grilled fish', 150, 'g'], ['Sautéed vegetables', 1, 'cup'], ['Brown rice', 0.5, 'cup']], 'fish'),
    M('dinner', 'nonveg', 'in', 'Chicken vegetable stew', [420, 32, 36, 15],
      [['Chicken & vegetable stew (100 g chicken)', 1, 'bowl'], ['Multigrain roti', 1, 'pc']], 'gluten'),
    M('dinner', 'egg', 'in', 'Veg omelette & soup', [380, 20, 30, 18],
      [['Vegetable omelette (2 eggs)', 1, 'pc'], ['Phulka', 1, 'pc'], ['Clear soup', 1, 'bowl']], 'egg gluten'),
    M('dinner', 'vegan', 'in', 'Palak dal & brown rice', [400, 17, 62, 9],
      [['Palak dal', 1, 'katori'], ['Brown rice', 0.5, 'cup'], ['Green salad', 1, 'bowl', true]]),
    M('dinner', 'vegan', 'gl', 'Lentil soup & quinoa salad', [410, 19, 60, 11],
      [['Lentil soup', 1, 'bowl'], ['Quinoa vegetable salad', 1, 'cup']]),
    M('dinner', 'veg', 'gl', 'Stuffed bell peppers', [420, 22, 44, 17],
      [['Bell peppers stuffed with paneer & quinoa', 2, 'pc']], 'dairy'),

    // ── Bedtime ─────────────────────────────────────────────────────
    M('bedtime', 'veg', 'in', 'Haldi doodh', [110, 8, 12, 3],
      [['Low-fat turmeric milk (no sugar)', 1, 'cup', true]], 'dairy'),
    M('bedtime', 'vegan', 'gl', 'Warm soy milk', [100, 7, 8, 4],
      [['Warm soy milk with cinnamon', 1, 'cup', true]], 'soy'),
    M('bedtime', 'vegan', 'gl', 'Chamomile tea & walnuts', [55, 1, 1, 5],
      [['Chamomile tea', 1, 'cup', true], ['Walnut halves', 2, 'pc', true]], 'nuts'),
  ];

  MEALS.forEach((m, i) => { m.id = i; });

  if (typeof module !== 'undefined' && module.exports) module.exports = MEALS;
  else root.MEALS = MEALS;
})(typeof window !== 'undefined' ? window : globalThis);
