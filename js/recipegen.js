/*
 * Recipe generator: 10,000+ real home-style dishes composed from the ingredient table.
 *
 * Each family is a real dish (bowl, wrap, curry, chilla, smoothie, protein shake, oats, khichdi …)
 * and its variants swap the protein, vegetable, grain, liquid or topping in ways that make
 * culinary sense. Every recipe gets ingredient grams for one serving, kcal / protein / carbs / fat
 * calculated from those ingredients (ingredients.js — never typed by hand), diet type and
 * allergens derived from the ingredients, prep and cook time, and a full numbered method.
 *
 * The list is deterministic (same order and names every time) and is only built when the
 * Foods & Recipes library needs it: RECIPEGEN.all() builds once and caches.
 */
(function (root) {
  const node = typeof module !== 'undefined' && module.exports;
  const ING = node ? require('./ingredients.js') : root.INGREDIENTS;
  const RC = node ? require('./recipes.js') : root.RECIPES;

  const POWDER_KEYS = ['whey', 'wheyiso', 'wheyconc', 'plantp', 'soyiso', 'casein'];
  const lc = (s) => s.toLowerCase();

  // ── Proteins ────────────────────────────────────────────────────────
  // prep: before cooking · sear: cooked on its own (bowls, wraps, stir-fries) · simmer: added to a gravy.
  const PR = {
    paneer: { n: 'Paneer', ing: [['paneer', 80]], p: 3, t: 4, prep: 'Cut the paneer into 2 cm cubes.', sear: 'Sear the paneer cubes in half the oil for 2 minutes, turning, until lightly golden; keep aside.', simmer: 'Add the paneer cubes and simmer 3 minutes only, so they stay soft.' },
    tofu: { n: 'Tofu', ing: [['tofu', 100]], p: 10, t: 6, prep: 'Press the tofu between kitchen towels for 10 minutes, then cut into cubes.', sear: 'Pan-sear the tofu cubes in half the oil for 5–6 minutes, turning, until crisp on all sides; keep aside.', simmer: 'Add the seared tofu and simmer 3–4 minutes so it soaks up the masala.' },
    chicken: { n: 'Chicken', ing: [['chicken', 100]], p: 10, t: 15, prep: 'Cut the chicken breast into bite-size pieces and rub with salt, pepper and a little lemon juice.', sear: 'Cook the chicken in half the oil on medium-high heat for 7–8 minutes, turning, until no longer pink inside; keep aside.', simmer: 'Add the chicken, cover and cook 15–18 minutes on low heat until tender and cooked through.' },
    egg: { n: 'Egg', ing: [['egg', 100]], p: 2, t: 10, prep: 'Boil 2 eggs for 9 minutes, cool in cold water, peel and halve.', sear: 'Keep the halved boiled eggs ready (or make a thin 2-egg omelette in half the oil and slice it into strips).', simmer: 'Make small slits in the boiled eggs, slip them into the gravy and simmer 3 minutes.' },
    soya: { n: 'Soya chunk', ing: [['soya', 35]], p: 12, t: 8, prep: 'Soak the soya chunks in hot salted water for 10 minutes, then squeeze out all the water.', sear: 'Sauté the squeezed soya chunks in half the oil with a pinch of chilli and salt for 4 minutes; keep aside.', simmer: 'Add the squeezed soya chunks with ½ cup water and simmer 6–8 minutes.' },
    chickpea: { n: 'Chickpea', ing: [['chickpea', 120]], p: 3, t: 5, prep: 'Rinse and drain the boiled chickpeas (home-cooked or canned).', sear: 'Toss the chickpeas in half the oil with cumin and chilli flakes for 3 minutes until they start to crisp; keep aside.', simmer: 'Add the chickpeas with ½ cup water and simmer 8 minutes, mashing a few to thicken the gravy.' },
    rajma: { n: 'Rajma', ing: [['bbeans', 120]], p: 3, t: 5, prep: 'Rinse and drain the boiled rajma (home-cooked after an overnight soak, or canned).', sear: 'Warm the rajma in half the oil with cumin, salt and a pinch of chilli for 3 minutes; keep aside.', simmer: 'Add the rajma with ½ cup water and simmer 10 minutes until the gravy thickens.' },
    sprouts: { n: 'Moong sprout', ing: [['sprouts', 80]], p: 3, t: 5, prep: 'Rinse the moong sprouts and steam them for 5 minutes so they stay crunchy.', sear: 'Toss the steamed sprouts with a pinch of salt, pepper and chaat masala; keep aside.', simmer: 'Add the steamed sprouts and simmer 5 minutes.' },
    tempeh: { n: 'Tempeh', ing: [['tempeh', 80]], p: 5, t: 8, prep: 'Slice the tempeh and steam it for 5 minutes to soften the taste.', sear: 'Pan-fry the tempeh slices in half the oil for 3 minutes per side until golden; keep aside.', simmer: 'Add the tempeh and simmer 5 minutes.' },
    fish: { n: 'Fish', sea: true, ing: [['fish', 110]], p: 12, t: 10, prep: 'Clean the fish, pat it dry and rub with salt, turmeric and lemon juice; rest 10 minutes.', sear: 'Pan-sear the fish in half the oil for 3 minutes per side until it flakes easily; keep aside.', simmer: 'Slide in the fish pieces, cover and simmer 8–10 minutes without stirring (shake the pan gently).' },
    prawn: { n: 'Prawn', sea: true, ing: [['prawn', 100]], p: 10, t: 5, prep: 'Peel and devein the prawns; rub with salt and turmeric.', sear: 'Sauté the prawns in half the oil for 3–4 minutes until pink and curled; keep aside.', simmer: 'Add the prawns and simmer 4–5 minutes — do not overcook or they turn rubbery.' },
    chaap: { n: 'Soya chaap', ing: [['chaap', 100]], p: 5, t: 8, prep: 'Cut the soya chaap into 3 cm pieces.', sear: 'Roast the chaap pieces in half the oil for 5 minutes until browned on all sides; keep aside.', simmer: 'Add the chaap pieces and simmer 6 minutes.' },
    edamame: { n: 'Edamame', ing: [['edamame', 80]], p: 2, t: 5, prep: 'Boil the shelled edamame for 4 minutes and drain.', sear: 'Toss the edamame in a few drops of the oil with salt and pepper; keep aside.', simmer: 'Add the boiled edamame and simmer 3 minutes.' },
    eggw: { n: 'Egg white', ing: [['eggw', 130]], p: 3, t: 4, prep: 'Separate 4 egg whites and whisk them with salt and pepper.', sear: 'Cook the egg whites in a non-stick pan with a few drops of the oil, folding gently, until just set; cut into strips.', simmer: 'Pour the whisked whites into the simmering masala in a thin stream and stir once they set (2 minutes).' },
    keema: { n: 'Chicken keema', ing: [['ckeema', 100]], p: 3, t: 15, prep: 'Keep the chicken mince ready and add a pinch of salt and turmeric.', sear: 'Cook the chicken mince in half the oil, breaking it up, for 8–10 minutes until cooked through; keep aside.', simmer: 'Add the chicken mince and cook, stirring, 12–15 minutes until done and dry.' },
    salmon: { n: 'Salmon', sea: true, ing: [['salmon', 100]], p: 5, t: 10, prep: 'Pat the salmon dry and season with salt, pepper and lemon zest.', sear: 'Pan-sear the salmon skin-side down for 4 minutes, turn and cook 2–3 minutes more; flake into large pieces.', simmer: 'Add the salmon pieces and simmer gently 6 minutes.' },
    mutton: { n: 'Mutton', meat: true, ing: [['mutton', 110], ['curd', 20]], p: 35, t: 45, prep: 'Wash the mutton and marinate with the curd, ginger-garlic and salt for 30 minutes.', sear: 'Pressure-cook the marinated mutton with ½ cup water for 5 whistles until tender.', simmer: 'Add the marinated mutton and pressure-cook 4–5 whistles (or simmer covered 50 minutes) until tender.' },
  };
  const P_BOWL = ['paneer', 'tofu', 'chicken', 'egg', 'soya', 'chickpea', 'rajma', 'sprouts', 'tempeh', 'fish', 'prawn', 'chaap', 'edamame', 'eggw', 'keema', 'salmon'];

  // ── Vegetables ──────────────────────────────────────────────────────
  const VG = {
    spinach: { n: 'Spinach', ing: [['spinach', 60]], cook: 'Add the spinach and stir just until it wilts (1 minute).' },
    mushroom: { n: 'Mushroom', ing: [['mushroom', 70]], cook: 'Add the sliced mushrooms and sauté 4 minutes until their water dries up.' },
    capsicum: { n: 'Bell pepper', ing: [['capsicum', 70]], cook: 'Add the capsicum strips and sauté 2–3 minutes so they stay crunchy.' },
    broccoli: { n: 'Broccoli', ing: [['broccoli', 80]], cook: 'Add the broccoli florets with 2 tbsp water, cover and steam 3 minutes until bright green.' },
    peas: { n: 'Green pea', ing: [['peas', 50]], cook: 'Add the peas and cook covered 3–4 minutes.' },
    mixveg: { n: 'Mixed veg', ing: [['mixveg', 80]], cook: 'Add the chopped mixed vegetables, sprinkle water, cover and cook 5–6 minutes until just tender.' },
    corn: { n: 'Corn-pepper', ing: [['corn', 40], ['capsicum', 30]], cook: 'Add the corn and capsicum and sauté 3 minutes.' },
    zucchini: { n: 'Zucchini', ing: [['zucchini', 80]], cook: 'Add the zucchini half-moons and sauté 3 minutes until just soft.' },
    carrotbeans: { n: 'Carrot & bean', ing: [['carrot', 40], ['beans', 40]], cook: 'Add the carrot and beans with 2 tbsp water, cover and cook 5 minutes.' },
    cabbage: { n: 'Cabbage', ing: [['cabbage', 60], ['carrot', 20]], cook: 'Add the shredded cabbage and carrot and stir-fry 3–4 minutes.' },
    kale: { n: 'Kale', ing: [['kale', 45]], cook: 'Add the shredded kale and toss 2 minutes until it softens.' },
    pumpkin: { n: 'Pumpkin', ing: [['pumpkin', 80]], cook: 'Add the pumpkin cubes, cover and cook 7–8 minutes until soft but holding shape.' },
    babycorn: { n: 'Baby corn', ing: [['babycorn', 60]], cook: 'Add the sliced baby corn and stir-fry 3 minutes.' },
    bokchoy: { n: 'Bok choy', ing: [['bokchoy', 70]], cook: 'Add the bok choy and toss 2 minutes until the leaves wilt and stems stay crisp.' },
    cauli: { n: 'Cauliflower', ing: [['cauli', 80]], cook: 'Add the small cauliflower florets, sprinkle water, cover and cook 6–7 minutes.' },
    methi: { n: 'Methi', ing: [['methi', 35]], cook: 'Add the chopped methi leaves and cook 3 minutes until the bitterness mellows.' },
    lauki: { n: 'Lauki', ing: [['lauki', 70]], cook: 'Add the lauki cubes, cover and cook 6–8 minutes until soft.' },
    tomato: { n: 'Tomato', ing: [['tomato', 60]], cook: 'Add the chopped tomato and cook 4 minutes until soft.' },
    carrot: { n: 'Carrot', ing: [['carrot', 50]], cook: 'Add the grated carrot and sauté 2 minutes.' },
    onion: { n: 'Onion–tomato', ing: [['onion', 30], ['tomato', 30]], cook: 'Add the onion and tomato and sauté 3 minutes.' },
    drumstick: { n: 'Drumstick', ing: [['drumstick', 50]], cook: 'Add the drumstick pieces and cook covered 8 minutes until tender.' },
  };

  // ── Grains (raw weight for one serving) ─────────────────────────────
  const GR = {
    brice: { n: 'brown rice', ing: [['brice', 45]], t: 35, cook: 'Rinse the brown rice, soak 20 minutes and cook in 2½ parts water for 30–35 minutes until soft; fluff with a fork.' },
    quinoa: { n: 'quinoa', ing: [['quinoa', 45]], t: 15, cook: 'Rinse the quinoa well and simmer in 2 parts water for 15 minutes; rest 5 minutes covered and fluff.' },
    foxtail: { n: 'foxtail millet', ing: [['foxtail', 45]], t: 20, cook: 'Rinse the foxtail millet, soak 20 minutes and cook in 2½ parts water for 15–18 minutes until fluffy.' },
    rrice: { n: 'red rice', ing: [['rrice', 45]], t: 35, cook: 'Rinse the red rice, soak 30 minutes and cook in 3 parts water for 30–35 minutes; drain any extra water.' },
    couscous: { n: 'couscous', ing: [['couscous', 45]], t: 5, cook: 'Pour 1¼ parts boiling salted water over the couscous, cover 5 minutes and fluff with a fork.' },
    bulgur: { n: 'bulgur', ing: [['bulgur', 45]], t: 12, cook: 'Simmer the bulgur in 2 parts water for 12 minutes until tender; drain and fluff.' },
    barley: { n: 'barley', ing: [['barley', 45]], t: 35, cook: 'Rinse the pearl barley and simmer in 3 parts water for 30–35 minutes until chewy-soft; drain.' },
    kodo: { n: 'kodo millet', ing: [['kodo', 45]], t: 20, cook: 'Rinse the kodo millet, soak 20 minutes and cook in 2½ parts water for 15–18 minutes.' },
    dalia: { n: 'dalia', ing: [['dalia', 45]], t: 15, cook: 'Dry-roast the dalia 2 minutes, then cook in 2½ parts water for 12–15 minutes until soft and separate.' },
    kutki: { n: 'little millet', ing: [['kutki', 45]], t: 18, cook: 'Rinse the little millet (kutki), soak 20 minutes and cook in 2½ parts water for 15 minutes.' },
    rice: { n: 'steamed rice', ing: [['rice', 50]], t: 15, cook: 'Rinse the rice 2–3 times and cook in 2 parts water for 12–15 minutes until done.' },
  };

  // ── Building blocks ─────────────────────────────────────────────────
  const join = (l) => (l.length > 1 ? l.slice(0, -1).join(', ') + ' and ' + l[l.length - 1] : l[0] || '');
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  function mergeIng(list) {
    const m = new Map();
    list.forEach(([k, g]) => {
      if (!ING[k]) throw new Error('Unknown ingredient: ' + k);
      m.set(k, Math.round(((m.get(k) || 0) + g) * 10) / 10);
    });
    return [...m.entries()];
  }

  let LIST = null;
  let byName = null;

  function build() {
    const out = [];
    const names = new Set();
    function add(r) {
      // Names stay unique, and never repeat a diet-chart dish (that one keeps its own recipe).
      if (names.has(r.name) || RC.RECIPES[r.name]) return;
      names.add(r.name);
      const ing = mergeIng(r.ing);
      const n = RC.analyse(ing, ING);
      const pp = ing.map(([k]) => k).find((k) => POWDER_KEYS.includes(k)) || '';
      out.push({
        id: 'g' + out.length, gen: true, name: r.name, fam: r.fam, cat: FAMILIES[r.fam].cat, meal: r.meal || FAMILIES[r.fam].meal,
        region: r.region || FAMILIES[r.fam].region, ing, serving: r.serving || FAMILIES[r.fam].serving,
        prep: Math.round(r.prep), cook: Math.round(r.cook), kcal: n.kcal, p: n.p, c: n.c, f: n.f,
        diet: n.diet, allergens: n.allergens, meats: n.meats, pp, method: r.method, tip: r.tip || FAMILIES[r.fam].tip,
      });
    }
    Object.keys(FAMILIES).forEach((k) => FAMILIES[k].gen(add, k));
    return out;
  }

  // ── Dish families ───────────────────────────────────────────────────
  const FAMILIES = {
    bowl: {
      cat: 'Power bowls', meal: ['lunch', 'dinner'], region: 'CON', serving: '1 bowl',
      tip: 'Pack the grains at the bottom and the vegetables on top so the bowl stays fresh for a lunch box.',
      gen(add, fam) {
        const veg = ['spinach', 'mushroom', 'capsicum', 'broccoli', 'peas', 'mixveg', 'corn', 'zucchini', 'carrotbeans', 'cabbage', 'kale', 'pumpkin'];
        const grains = ['brice', 'quinoa', 'foxtail', 'rrice', 'couscous', 'bulgur', 'barley', 'kodo', 'dalia', 'kutki'];
        P_BOWL.forEach((pk) => veg.forEach((vk) => grains.forEach((gk) => {
          const P = PR[pk], V = VG[vk], G = GR[gk];
          add({
            fam, name: `${P.n} & ${lc(V.n)} ${G.n} bowl`,
            ing: [...G.ing, ...P.ing, ...V.ing, ['onion', 20], ['cucumber', 40], ['lemon', 8], ['oil', 6], ['spice', 2], ['coriander', 5]],
            prep: 10 + P.p, cook: Math.max(G.t, P.t + 6),
            method: () => [G.cook, P.prep, P.sear, `In the same pan, sauté the onion in the rest of the oil for 1 minute. ${V.cook}`, 'Season the vegetables with salt, pepper and the mixed spices, then squeeze over half the lemon juice.', `Spoon the ${G.n} into a bowl, top with the ${lc(P.n)} and the vegetables, add the sliced cucumber, the rest of the lemon and the coriander.`],
          });
        })));
      },
    },

    wrap: {
      cat: 'Wraps & rolls', meal: ['lunch', 'dinner', 'evening'], region: 'IN', serving: '1 wrap',
      tip: 'Wrap tightly in butter paper or foil for travel; it stays good for 3–4 hours.',
      gen(add, fam) {
        const veg = ['spinach', 'mushroom', 'capsicum', 'mixveg', 'corn', 'carrotbeans', 'cabbage', 'zucchini'];
        const wraps = [
          { n: 'whole-wheat roti', ing: [['atta', 45]], t: 8, how: 'Knead the whole-wheat flour with water and a pinch of salt into a soft dough; rest 10 minutes, roll one large thin roti and cook on a hot tawa on both sides.' },
          { n: 'multigrain roti', ing: [['mgatta', 45]], t: 8, how: 'Knead the multigrain flour with water and a pinch of salt into a soft dough; rest 10 minutes, roll one large thin roti and cook on a hot tawa on both sides.' },
          { n: 'tortilla', ing: [['wtortilla', 60]], t: 1, how: 'Warm the whole-wheat tortilla on a dry pan for 20 seconds per side so it is soft and pliable.' },
          { n: 'pita', ing: [['pita', 60]], t: 1, how: 'Warm the whole-wheat pita on a dry pan for 30 seconds per side and open the pocket with a knife.' },
          { n: 'ragi roti', ing: [['atta', 25], ['ragi', 20]], t: 8, how: 'Mix the ragi and whole-wheat flour with warm water into a soft dough; roll one thin roti between two sheets and cook on a hot tawa on both sides.' },
        ];
        const spreads = [
          { n: 'mint yogurt', ing: [['curd', 30], ['mint', 5]], how: 'Whisk the curd with the chopped mint, a pinch of salt and roasted cumin.' },
          { n: 'hummus', ing: [['hummus', 30]], how: 'Stir the hummus with a few drops of lemon juice so it spreads easily.' },
        ];
        P_BOWL.filter((k) => k !== 'salmon').forEach((pk) => veg.forEach((vk) => wraps.forEach((w) => spreads.forEach((s) => {
          const P = PR[pk], V = VG[vk];
          add({
            fam, name: `${P.n} & ${lc(V.n)} ${w.n} wrap with ${s.n}`,
            ing: [...w.ing, ...P.ing, ...V.ing, ...s.ing, ['onion', 20], ['lemon', 5], ['oil', 5], ['spice', 1.5]],
            prep: 10 + P.p, cook: w.t + P.t + 5,
            method: () => [w.how, P.prep, P.sear, `In the same pan, add the rest of the oil. ${V.cook} Season with salt, pepper and the spices.`, s.how, `Spread the ${s.n} over the ${w.n}, add the ${lc(P.n)}, the vegetables, sliced onion and a squeeze of lemon; roll up tightly (or fill the pocket).`],
          });
        }))));
      },
    },

    salad: {
      cat: 'Salads', meal: ['lunch', 'dinner', 'evening'], region: 'CON', serving: '1 large bowl',
      tip: 'Keep the dressing separate until you eat so the salad stays crunchy.',
      gen(add, fam) {
        const bases = [
          { n: 'cucumber-tomato', ing: [['cucumber', 80], ['tomato', 60], ['onion', 20]] },
          { n: 'garden greens', ing: [['greens', 60], ['cucumber', 50], ['tomato', 30]] },
          { n: 'beetroot-carrot', ing: [['beet', 50], ['carrot', 50], ['cucumber', 40]] },
          { n: 'crunchy slaw', ing: [['cabbage', 60], ['carrot', 40], ['capsicum', 20]] },
          { n: 'corn & pepper', ing: [['corn', 40], ['capsicum', 50], ['tomato', 30]] },
          { n: 'kale & apple', ing: [['kale', 40], ['apple', 50], ['cucumber', 40]] },
        ];
        const dress = [
          { n: 'lemon-herb', ing: [['lemon', 10], ['olive', 6]], how: 'Whisk the lemon juice, olive oil, salt, pepper and dried herbs for the dressing.' },
          { n: 'yogurt-mint', ing: [['curd', 40], ['mint', 5], ['olive', 2]], how: 'Whisk the curd with chopped mint, salt, roasted cumin and the olive oil for the dressing.' },
          { n: 'peanut', ing: [['pbutter', 10], ['lemon', 6], ['soysauce', 3]], how: 'Whisk the peanut butter with the lemon juice, soy sauce and 1 tbsp warm water until smooth.' },
          { n: 'tahini', ing: [['sesame', 8], ['lemon', 8], ['olive', 2]], how: 'Whisk the tahini with the lemon juice, olive oil, a pinch of garlic and 1 tbsp water until creamy.' },
          { n: 'chilli-lime', ing: [['lemon', 10], ['chilli', 3], ['olive', 5]], how: 'Whisk the lime/lemon juice, finely chopped green chilli, olive oil and salt.' },
        ];
        P_BOWL.forEach((pk) => bases.forEach((b) => dress.forEach((d) => {
          const P = PR[pk];
          add({
            fam, name: `${P.n} ${b.n} salad with ${d.n} dressing`,
            ing: [...b.ing, ...P.ing, ...d.ing, ['oil', 3]],
            prep: 12 + P.p, cook: P.t,
            method: () => [P.prep, P.sear.replace('half the oil', 'the oil'), `Chop the ${b.n} vegetables into bite-size pieces and chill them while the protein cools.`, d.how, `Toss the vegetables and the ${lc(P.n)} with the dressing just before eating.`],
          });
        })));
      },
    },

    curry: {
      cat: 'Curries & gravies', meal: ['lunch', 'dinner'], region: 'IN', serving: '1 katori curry + side',
      tip: 'The gravy keeps 2 days in the fridge; reheat gently and add a splash of water.',
      gen(add, fam) {
        const prots = ['paneer', 'tofu', 'chicken', 'egg', 'soya', 'chickpea', 'rajma', 'fish', 'prawn', 'chaap', 'mutton', 'keema'];
        const S = [
          { k: 'masala', name: (p) => `${p} masala curry`, ing: [['onion', 50], ['tomato', 80], ['ginger', 4], ['garlic', 4], ['oil', 7], ['spice', 3]], how: 'Add the ginger-garlic and the chopped tomatoes with turmeric, chilli, coriander powder and salt; cook until the oil separates (6–8 minutes).' },
          { k: 'palak', name: (p) => `Palak ${lc(p)}`, ing: [['spinach', 100], ['onion', 30], ['tomato', 30], ['garlic', 4], ['oil', 6], ['spice', 2]], how: 'Blanch the spinach 2 minutes, cool in cold water and blend smooth; add the tomato and garlic to the pan, cook 3 minutes, then stir in the spinach purée and simmer 4 minutes.' },
          { k: 'kadhai', name: (p) => `Kadhai ${lc(p)}`, ing: [['capsicum', 60], ['onion', 40], ['tomato', 60], ['ginger', 4], ['oil', 7], ['spice', 3]], how: 'Add the ginger, chopped tomato and freshly crushed coriander seeds and chillies; cook 5 minutes, then add the capsicum squares and cook 2 minutes more.' },
          { k: 'coconut', region: 'S', name: (p) => `Kerala ${lc(p)} coconut curry`, ing: [['coconutmilk', 40], ['onion', 40], ['tomato', 30], ['ginger', 4], ['oil', 5], ['spice', 2]], how: 'Add curry leaves, the ginger, chopped tomato, turmeric and pepper; cook 4 minutes, then pour in the coconut milk with ¼ cup water and bring to a gentle simmer (do not boil hard).' },
          { k: 'korma', name: (p) => `${p} korma (light)`, ing: [['curd', 50], ['cashew', 8], ['onion', 50], ['ginger', 4], ['oil', 6], ['spice', 2]], how: 'Blend the cashews with the curd until smooth; lower the heat, stir in the cashew-curd with the ginger and garam masala and cook 5 minutes, stirring so it does not split.' },
          { k: 'butter', name: (p) => `Butter ${lc(p)} (light)`, ing: [['tomatopuree', 90], ['butter', 5], ['cream', 10], ['cashew', 5], ['onion', 30], ['oil', 4], ['spice', 2]], how: 'Add the tomato purée, soaked cashews (blended) and kashmiri chilli; cook 8 minutes, then stir in the butter, the cream and crushed kasuri methi.' },
          { k: 'dopyaza', name: (p) => `${p} do pyaza`, ing: [['onion', 90], ['tomato', 40], ['ginger', 4], ['oil', 7], ['spice', 2]], how: 'Keep half the onion as large petals; add the chopped tomato and spices to the browned onion and cook 5 minutes, then add the onion petals and cook 2 minutes so they stay crunchy.' },
          { k: 'methi', name: (p) => `Methi ${lc(p)}`, ing: [['methi', 50], ['onion', 40], ['tomato', 50], ['garlic', 4], ['oil', 6], ['spice', 2]], how: 'Add the garlic, tomato and spices and cook 5 minutes; stir in the chopped methi leaves and cook 4 minutes more.' },
          { k: 'matar', name: (p) => `Matar ${lc(p)}`, ing: [['peas', 60], ['onion', 40], ['tomato', 60], ['ginger', 4], ['oil', 6], ['spice', 2]], how: 'Add the ginger, tomato and spices and cook until thick (6 minutes), then add the peas with ½ cup water and simmer 5 minutes.' },
          { k: 'chettinad', region: 'S', name: (p) => `${p} Chettinad`, ing: [['coconut', 15], ['onion', 50], ['tomato', 50], ['oil', 7], ['spice', 4]], how: 'Dry-roast the coconut with pepper, fennel, cumin and red chillies, grind to a paste; add it to the pan with the tomato and cook 6 minutes.' },
          { k: 'mushroom', name: (p) => `Mushroom ${lc(p)} masala`, ing: [['mushroom', 70], ['onion', 40], ['tomato', 50], ['garlic', 4], ['oil', 6], ['spice', 2]], how: 'Add the garlic, tomato and spices and cook 4 minutes, then the sliced mushrooms; cook until their water dries (5 minutes).' },
        ];
        const sides = [
          { n: '2 phulkas', ing: [['atta', 60]], t: 10, how: 'Knead the atta into a soft dough, rest 10 minutes and make 2 phulkas on a hot tawa (puff over the flame).' },
          { n: 'brown rice', ing: [['brice', 45]], t: 35, how: GR.brice.cook },
          { n: '2 jowar rotis', ing: [['jowar', 60]], t: 12, how: 'Knead the jowar flour with warm water, pat 2 thin rotis by hand and cook on a hot tawa, pressing the edges.' },
          { n: 'quinoa', ing: [['quinoa', 45]], t: 15, how: GR.quinoa.cook },
          { n: 'red rice', ing: [['rrice', 45]], t: 35, how: GR.rrice.cook },
          { n: '2 bajra rotis', ing: [['bajra', 60]], t: 12, how: 'Knead the bajra flour with warm water just before cooking, pat 2 rotis by hand and cook on a hot tawa until spotted.' },
          { n: 'steamed rice', ing: [['rice', 50]], t: 15, how: GR.rice.cook },
          { n: 'kodo millet', ing: [['kodo', 45]], t: 20, how: GR.kodo.cook },
        ];
        const skip = { matar: ['chickpea', 'rajma'], palak: ['rajma'], korma: ['rajma'], butter: ['rajma'], chettinad: ['chaap'], mushroom: ['mutton'] };
        prots.forEach((pk) => S.forEach((s) => {
          if ((skip[s.k] || []).includes(pk)) return;
          sides.forEach((sd) => {
            const P = PR[pk];
            add({
              fam, name: `${s.name(P.n)} with ${sd.n}`, region: s.region,
              ing: [...P.ing, ...s.ing, ...sd.ing],
              prep: 12 + P.p, cook: Math.max(sd.t, 15 + P.t),
              method: () => [P.prep, 'Heat the oil, add cumin seeds and a bay leaf, then the chopped onion; sauté until golden (6–8 minutes).', s.how, P.simmer, sd.how, `Garnish with coriander and serve hot with the ${sd.n.replace(/^\d /, '')}.`],
            });
          });
        }));
      },
    },

    chilla: {
      cat: 'Chillas & pancakes', meal: ['breakfast', 'dinner'], region: 'IN', serving: '2 chillas',
      tip: 'Rest the batter 10 minutes and use a well-heated non-stick tawa so the chilla turns without breaking.',
      gen(add, fam) {
        const batters = [
          { n: 'Besan', ing: [['besan', 45]], how: 'Whisk the besan with about ½ cup water, salt, ajwain and turmeric into a smooth, flowing batter.' },
          { n: 'Moong dal', ing: [['moong', 45]], t: 240, how: 'Soak the moong dal 4 hours, drain and grind with ginger, green chilli and a little water into a smooth batter.' },
          { n: 'Oats', ing: [['oats', 40], ['besan', 10]], how: 'Powder the oats, mix with the besan, salt and ½ cup water and rest 10 minutes.' },
          { n: 'Ragi', ing: [['ragi', 35], ['besan', 10]], how: 'Mix the ragi flour and besan with salt, cumin and water into a thin batter.' },
          { n: 'Mixed dal', ing: [['moong', 25], ['masoor', 20]], t: 240, how: 'Soak the moong and masoor dal 4 hours, drain and grind with ginger and a little water into a smooth batter.' },
          { n: 'Rava', ing: [['rava', 40], ['curd', 30]], how: 'Mix the rava with the curd, salt and water into a thick batter and rest 15 minutes.' },
          { n: 'Quinoa', ing: [['quinoa', 40], ['moong', 10]], t: 180, how: 'Soak the quinoa and moong 3 hours, drain and grind with ginger and chilli into a batter.' },
        ];
        const fill = [
          { n: 'paneer', ing: [['paneer', 40]] }, { n: 'tofu', ing: [['tofu', 50]] }, { n: 'spinach', ing: [['spinach', 40]] },
          { n: 'onion-tomato', ing: [['onion', 30], ['tomato', 30]] }, { n: 'mixed veg', ing: [['mixveg', 60]] }, { n: 'carrot', ing: [['carrot', 40]] },
          { n: 'methi', ing: [['methi', 30]] }, { n: 'cabbage', ing: [['cabbage', 40]] }, { n: 'mushroom', ing: [['mushroom', 40]] },
          { n: 'sprouts', ing: [['sprouts', 40]] }, { n: 'corn & capsicum', ing: [['corn', 20], ['capsicum', 25]] },
        ];
        const sides = [
          { n: '', ing: [] },
          { n: ' with curd', ing: [['curd', 100]], how: 'Serve with the bowl of fresh curd.' },
          { n: ' with green chutney', ing: [['mint', 10], ['coriander', 10], ['lemon', 5]], how: 'Grind the mint, coriander, lemon juice, a green chilli and salt into a chutney and serve alongside.' },
        ];
        const cookIt = (fillN) => [`Stir the chopped or grated ${fillN} into the batter (crumble paneer or tofu over the top instead, if using).`, 'Heat a non-stick tawa, pour a ladle of batter and spread thin; drizzle half the oil around the edges.', 'Cook on medium heat 2 minutes until the base is golden, flip and cook 1–2 minutes more. Make the second chilla the same way.'];
        batters.forEach((b) => fill.forEach((fl) => sides.forEach((sd) => add({
          fam, name: `${b.n} chilla with ${fl.n}${sd.n}`, ing: [...b.ing, ...fl.ing, ...sd.ing, ['oil', 5], ['spice', 1]],
          prep: b.t ? 15 : 10, cook: 12,
          method: () => [b.how, ...cookIt(fl.n), ...(sd.how ? [sd.how] : [])],
        }))));
        // Protein chillas: a scoop of unflavoured protein powder whisked into the batter.
        const powders = [['wheyiso', 'whey isolate', 15], ['wheyconc', 'whey', 16], ['plantp', 'pea protein', 16], ['soyiso', 'soy protein', 15]];
        batters.slice(0, 3).forEach((b) => powders.forEach(([pk, pn, g]) => fill.slice(0, 6).forEach((fl) => add({
          fam, name: `Protein ${lc(b.n)} chilla (${pn}) with ${fl.n}`, ing: [...b.ing, [pk, g], ...fl.ing, ['oil', 5], ['spice', 1]],
          prep: b.t ? 15 : 10, cook: 12, meal: ['breakfast', 'dinner', 'midmorning'],
          method: () => [b.how, `Whisk in ½ scoop of unflavoured ${pn} powder until there are no lumps (add 2–3 tbsp more water if the batter thickens).`, ...cookIt(fl.n)],
        }))));
      },
    },

    smoothie: {
      cat: 'Smoothies', meal: ['breakfast', 'midmorning', 'evening'], region: 'CON', serving: '1 glass (300 ml)',
      tip: 'Use frozen fruit instead of ice for a thicker smoothie without watering it down.',
      gen(add, fam) {
        const fruits = [['Banana', [['banana', 100]]], ['Mango', [['mango', 100]]], ['Strawberry', [['strawberry', 100]]], ['Mixed berry', [['berries', 90]]], ['Papaya', [['papaya', 130]]],
          ['Apple-cinnamon', [['apple', 100], ['spice', 0.5]]], ['Chikoo', [['chikoo', 80]]], ['Pineapple', [['pineapple', 100]]], ['Kiwi', [['kiwi', 100]]], ['Peach', [['peach', 110]]],
          ['Pear', [['pear', 110]]], ['Blueberry', [['blueberry', 75]]], ['Date-banana', [['dates', 20], ['banana', 60]]], ['Avocado-banana', [['avocado', 50], ['banana', 50]]]];
        const bases = [['toned milk', [['milk', 200]]], ['skimmed milk', [['skim', 200]]], ['yogurt', [['curd', 150]]], ['soy milk', [['soymilk', 200]]], ['almond milk', [['almondmilk', 200]]], ['oat milk', [['oatmilk', 200]]], ['coconut water', [['coconutwater', 200]]]];
        const adds = [['', []], [' with oats', [['oats', 20]]], [' with chia', [['chia', 8]]], [' with peanut butter', [['pbutter', 12]]], [' with whey isolate', [['wheyiso', 30]]], [' with pea protein', [['plantp', 33]]], [' with flaxseed', [['flax', 8]]]];
        fruits.forEach(([fn, fi]) => bases.forEach(([bn, bi]) => adds.forEach(([an, ai]) => {
          if (bn === 'coconut water' && /peanut|whey/.test(an)) return;
          const pp = /whey|pea protein/.test(an);
          add({
            fam, name: `${fn} ${bn} ${pp ? 'protein ' : ''}smoothie${an}`, ing: [...fi, ...bi, ...ai],
            prep: an.includes('oats') ? 8 : 5, cook: 0, meal: pp ? ['breakfast', 'midmorning', 'evening'] : undefined,
            method: () => [`Peel and chop the fruit (${lc(fn)}); use it frozen for a thick, cold smoothie.`, `Pour the ${bn} into the blender first, then add the fruit${ai.length ? ` and the ${an.replace(' with ', '')}` : ''}.`, 'Blend on high for 45–60 seconds until completely smooth; add a few ice cubes or a splash of water if it is too thick.', 'Pour into a tall glass and drink straight away — no sugar or honey needed.'],
          });
        })));
      },
    },

    shake: {
      cat: 'Protein shakes', meal: ['midmorning', 'evening', 'breakfast'], region: 'CON', serving: '1 shaker (300 ml)',
      tip: 'Protein values are typical label values for unflavoured powder — check your brand and use its own scoop.',
      gen(add, fam) {
        const powders = [['Whey isolate', 'wheyiso', 30], ['Whey concentrate', 'wheyconc', 33], ['Pea protein', 'plantp', 33], ['Soy protein isolate', 'soyiso', 30], ['Casein', 'casein', 34]];
        const liquids = [['water', []], ['toned milk', [['milk', 250]]], ['skimmed milk', [['skim', 250]]], ['soy milk', [['soymilk', 250]]], ['almond milk', [['almondmilk', 250]]], ['oat milk', [['oatmilk', 250]]]];
        const flav = [['', []], [' & banana', [['banana', 80]]], [' & berries', [['berries', 60]]], [' & mango', [['mango', 80]]], [' & cold coffee', [['coffee', 60]]],
          [' & peanut butter', [['pbutter', 12]]], [' & oats', [['oats', 20]]], [' & dates', [['dates', 15]]], [' & apple-cinnamon', [['apple', 80], ['spice', 0.5]]]];
        powders.forEach(([pn, pk, g]) => liquids.forEach(([ln, li]) => flav.forEach(([fn, fi]) => add({
          fam, name: `${pn} shake with ${ln}${fn}`, ing: [[pk, g], ...li, ...fi], prep: fi.length ? 5 : 2, cook: 0,
          meal: pk === 'casein' ? ['bedtime', 'evening'] : undefined,
          method: () => [`Pour 250 ml of ${ln === 'water' ? 'cold water' : `chilled ${ln}`} into a shaker or blender first (liquid first stops the powder sticking).`,
            `Add 1 level scoop (${g} g) of ${lc(pn)} powder${fi.length ? ` and the ${fn.replace(' & ', '')}` : ''}.`,
            fi.length ? 'Blend 30–40 seconds until smooth and frothy.' : 'Close the lid and shake hard for 20–30 seconds until smooth.',
            pk === 'casein' ? 'Drink within 30 minutes — casein digests slowly, so it suits bedtime or a long gap between meals.' : 'Drink within 30 minutes — ideally within an hour after exercise, or with the meal it is planned for.'],
        }))));
      },
    },

    oats: {
      cat: 'Oats & porridge', meal: ['breakfast'], region: 'CON', serving: '1 bowl',
      tip: 'Soak rolled oats for 10 minutes before cooking for a creamier porridge with less milk.',
      gen(add, fam) {
        const fruit = [['banana', [['banana', 60]]], ['apple', [['apple', 80]]], ['berries', [['berries', 60]]], ['strawberries', [['strawberry', 70]]], ['mango', [['mango', 70]]],
          ['papaya', [['papaya', 80]]], ['pear', [['pear', 80]]], ['dates', [['dates', 15]]], ['raisins', [['raisin', 10]]], ['pomegranate', [['pomegranate', 50]]]];
        const tops = [['almonds', [['almond', 8]]], ['walnuts', [['walnut', 8]]], ['chia', [['chia', 6]]], ['flaxseed', [['flax', 6]]], ['pumpkin seeds', [['pumpkinseed', 8]]], ['peanut butter', [['pbutter', 10]]]];
        const liquids = [['toned milk', [['milk', 200]]], ['skimmed milk', [['skim', 200]]], ['soy milk', [['soymilk', 200]]], ['almond milk', [['almondmilk', 200]]], ['oat milk', [['oatmilk', 200]]]];
        liquids.forEach(([ln, li]) => fruit.forEach(([fn, fi]) => tops.forEach(([tn, ti]) => add({
          fam, name: `Oats porridge in ${ln} with ${fn} & ${tn}`, ing: [['oats', 40], ...li, ...fi, ...ti], prep: 5, cook: 8,
          method: () => [`Bring the ${ln} with ½ cup water to a gentle boil in a small pan.`, 'Stir in the rolled oats and a pinch of cinnamon; cook on low heat for 5–6 minutes, stirring, until creamy.', `Take off the heat, top with the ${fn} and the ${tn}.`, 'Rest 1 minute and eat warm — no sugar needed; the fruit sweetens it.'],
        }))));
        const powders = [['whey isolate', 'wheyiso', 30], ['whey', 'wheyconc', 33], ['pea protein', 'plantp', 33], ['soy protein', 'soyiso', 30], ['casein', 'casein', 34]];
        const pl = [['water', []], ['toned milk', [['milk', 150]]], ['almond milk', [['almondmilk', 150]]]];
        powders.forEach(([pn, pk, g]) => pl.forEach(([ln, li]) => fruit.forEach(([fn, fi]) => add({
          fam, name: `Protein oats (${pn}) in ${ln} with ${fn}`, ing: [['oats', 40], [pk, g], ...li, ...fi], prep: 5, cook: 7, meal: ['breakfast', 'midmorning'],
          method: () => [`Cook the oats in the ${ln === 'water' ? '1 cup water' : `${ln} with ¼ cup water`} on low heat for 5 minutes until creamy.`, 'Take the pan off the heat and cool 1 minute (protein powder turns lumpy in boiling liquid).', `Whisk 1 scoop (${g} g) of ${pn} powder with 2 tbsp water into a paste and stir it into the oats.`, `Top with the ${fn} and eat warm.`],
        }))));
        const ob = [['curd', [['curd', 100]]], ['Greek yogurt', [['greek', 100]]], ['toned milk', [['milk', 150]]]];
        ob.forEach(([bn, bi]) => fruit.forEach(([fn, fi]) => tops.slice(0, 4).forEach(([tn, ti]) => add({
          fam, name: `Overnight oats (${bn}) with ${fn} & ${tn}`, ing: [['oats', 40], ...bi, ...fi, ...ti], prep: 5, cook: 0,
          method: () => [`In a jar, mix the oats with the ${bn} and 3–4 tbsp water or milk until everything is wet.`, `Stir in the ${tn}, close the lid and refrigerate overnight (at least 6 hours).`, `In the morning stir well and top with the ${fn}.`, 'Eat cold, or warm 1 minute if you prefer.'],
        }))));
        const mveg = ['mixveg', 'spinach', 'carrotbeans', 'peas', 'corn', 'mushroom', 'cabbage', 'tomato'];
        const madd = [['', []], [' & egg', [['egg', 50]]], [' & paneer', [['paneer', 30]]], [' & sprouts', [['sprouts', 40]]], [' & tofu', [['tofu', 50]]]];
        mveg.forEach((vk) => madd.forEach(([an, ai]) => add({
          fam, name: `Masala oats with ${lc(VG[vk].n)}${an}`, ing: [['oats', 40], ...VG[vk].ing, ...ai, ['onion', 25], ['tomato', 25], ['oil', 4], ['spice', 1.5]], prep: 8, cook: 10, meal: ['breakfast', 'dinner'],
          method: () => ['Heat the oil, splutter mustard seeds and cumin, then sauté the onion 2 minutes.', `${VG[vk].cook} Add the tomato, turmeric, chilli and salt.`, ...(ai.length ? [an.includes('egg') ? 'Push the vegetables aside, scramble the egg in the pan and mix in.' : `Add the ${an.replace(' & ', '')} and toss 1 minute.`] : []), 'Add the oats with 1½ cups water and cook 3–4 minutes, stirring, until thick; finish with coriander and lemon.'],
        })));
      },
    },

    stirfry: {
      cat: 'Stir-fries & noodles', meal: ['lunch', 'dinner'], region: 'ASIA', serving: '1 plate',
      tip: 'Have every ingredient cut before the wok gets hot — a stir-fry cooks in minutes.',
      gen(add, fam) {
        const prots = ['paneer', 'tofu', 'chicken', 'egg', 'soya', 'tempeh', 'fish', 'prawn', 'chaap', 'edamame', 'salmon', 'keema'];
        const veg = ['broccoli', 'bokchoy', 'capsicum', 'mushroom', 'babycorn', 'zucchini', 'cabbage', 'carrotbeans'];
        const carbs = [
          { n: 'brown rice', ing: [['brice', 45]], t: 35, how: GR.brice.cook },
          { n: 'rice noodles', ing: [['ricenoodle', 45]], t: 6, how: 'Soak the rice noodles in hot water for 6–8 minutes until soft; drain and toss with a few drops of the oil.' },
          { n: 'soba noodles', ing: [['soba', 45]], t: 6, how: 'Boil the soba noodles 4–5 minutes, then rinse under cold water and drain.' },
          { n: 'brown rice noodles', ing: [['brnoodle', 45]], t: 8, how: 'Boil the brown rice noodles 6–7 minutes, rinse and drain.' },
          { n: 'quinoa', ing: [['quinoa', 45]], t: 15, how: GR.quinoa.cook },
          { n: 'wheat noodles', ing: [['wheatnoodle', 45]], t: 6, how: 'Boil the wheat noodles 4–5 minutes until just done; rinse and drain.' },
        ];
        prots.forEach((pk) => veg.forEach((vk) => carbs.forEach((cb) => {
          const P = PR[pk], V = VG[vk];
          add({
            fam, name: `${P.n} & ${lc(V.n)} stir-fry with ${cb.n}`, ing: [...cb.ing, ...P.ing, ...V.ing, ['garlic', 5], ['ginger', 5], ['onion', 20], ['soysauce', 8], ['oil', 7]],
            prep: 10 + P.p, cook: Math.max(cb.t, P.t + 6),
            method: () => [cb.how, P.prep, `Heat a wok until smoking, add half the oil and stir-fry the ${lc(P.n)} until cooked (${P.t} minutes); keep aside.`, `Add the rest of the oil, the garlic, ginger and spring onion; stir 30 seconds. ${V.cook}`, `Return the ${lc(P.n)}, add the soy sauce, pepper and 2 tbsp water; toss on high heat for 1 minute.`, `Toss in the ${cb.n} (or serve the stir-fry over it) and finish with sesame or spring onion greens.`],
          });
        })));
      },
    },

    sandwich: {
      cat: 'Sandwiches & toast', meal: ['breakfast', 'evening', 'dinner'], region: 'CON', serving: '1 sandwich (2 slices)',
      tip: 'Toast the bread lightly before filling so it does not go soggy in a lunch box.',
      gen(add, fam) {
        const fills = [['Paneer', [['paneer', 50]], 'Crumble the paneer and mix with pepper, salt and chopped coriander.'], ['Tofu', [['tofu', 70]], 'Crumble the tofu and sauté 2 minutes with turmeric, pepper and salt.'],
          ['Chicken', [['chicken', 70]], 'Poach the chicken breast 12 minutes, cool and shred.'], ['Egg', [['egg', 100]], 'Boil 2 eggs for 9 minutes, peel and chop.'], ['Chickpea', [['chickpea', 80]], 'Mash the boiled chickpeas roughly with lemon, salt and cumin.'],
          ['Sprout', [['sprouts', 60]], 'Steam the sprouts 4 minutes and season with chaat masala.'], ['Tuna', [['tuna', 60]], 'Drain the tuna and flake it with lemon and pepper.'], ['Egg white', [['eggw', 100]], 'Scramble the egg whites with pepper until just set.'],
          ['Cottage cheese', [['cottage', 60]], 'Mix the cottage cheese with pepper and herbs.'], ['Hummus & veggie', [['hummus', 40]], 'Stir the hummus with a few drops of lemon.']];
        const veg = [['spinach', [['spinach', 30]]], ['cucumber-tomato', [['cucumber', 40], ['tomato', 30]]], ['bell pepper', [['capsicum', 40]]], ['corn', [['corn', 30]]], ['mushroom', [['mushroom', 40]]], ['coleslaw', [['cabbage', 40], ['carrot', 20], ['curd', 15]]]];
        const breads = [['whole-wheat bread', 'wwbread'], ['multigrain bread', 'mgbread'], ['sourdough', 'sourdough']];
        fills.forEach(([fn, fi, fh]) => veg.forEach(([vn, vi]) => breads.forEach(([bn, bk]) => add({
          fam, name: `${fn} & ${vn} sandwich on ${bn}`, ing: [[bk, 60], ...fi, ...vi, ['olive', 3], ['lemon', 3]], prep: 8, cook: fn === 'Chicken' ? 15 : 6,
          method: () => [fh, `Slice the ${vn} vegetables thin; toss with a pinch of salt and pepper.`, `Brush the ${bn} slices with the olive oil and toast lightly.`, `Layer the filling and the ${vn} between the slices, press and grill 2–3 minutes until golden.`],
        }))));
      },
    },

    khichdi: {
      cat: 'Khichdi & one-pot', meal: ['lunch', 'dinner'], region: 'IN', serving: '1 bowl (1½ cups)',
      tip: 'Khichdi thickens as it cools — loosen with hot water before serving.',
      gen(add, fam) {
        const grains = [['Rice', 'rice'], ['Brown rice', 'brice'], ['Dalia', 'dalia'], ['Foxtail millet', 'foxtail'], ['Kodo millet', 'kodo'], ['Samak (barnyard millet)', 'sama'], ['Quinoa', 'quinoa'], ['Oats', 'oats']];
        const dals = [['moong', 'moong'], ['masoor', 'masoor'], ['toor', 'toor'], ['green moong', 'wmoong']];
        const veg = ['lauki', 'spinach', 'mixveg', 'peas', 'carrotbeans', 'pumpkin', 'methi', 'tomato'];
        const fats = [['ghee', 'ghee'], ['oil', 'oil']];
        grains.forEach(([gn, gk]) => dals.forEach(([dn, dk]) => veg.forEach((vk) => fats.forEach(([fn, fk]) => add({
          fam, name: `${gn}–${dn} khichdi with ${lc(VG[vk].n)} (${fn} tadka)`, ing: [[gk, 30], [dk, 30], ...VG[vk].ing, ['onion', 20], ['tomato', 20], [fk, 5], ['spice', 1.5]],
          prep: 20, cook: gk === 'brice' ? 30 : 20,
          method: () => [`Wash the ${lc(gn)} and ${dn} dal together and soak 20 minutes.`, `Heat the ${fn} in a pressure cooker, add cumin, hing and the onion; sauté 2 minutes.`, `${VG[vk].cook} Add the tomato, turmeric and salt.`, 'Add the drained grain and dal with 4 parts water; pressure-cook 3–4 whistles (5–6 for brown rice) and let the pressure drop on its own.', 'Mash lightly, adjust the water for a soft consistency and serve hot with lemon.'],
        })))));
      },
    },

    upma: {
      cat: 'Upma & poha', meal: ['breakfast', 'evening'], region: 'IN', serving: '1 plate',
      tip: 'Roast the grain well first — it keeps upma fluffy and stops it turning sticky.',
      gen(add, fam) {
        const grains = [['Rava', 'rava', 'Dry-roast the rava on low heat 4–5 minutes until aromatic.'], ['Dalia', 'dalia', 'Dry-roast the dalia 3 minutes, then soak it in hot water for 10 minutes.'], ['Oats', 'oats', 'Dry-roast the oats 2 minutes until crisp.'],
          ['Quinoa', 'quinoa', 'Rinse the quinoa well and drain.'], ['Foxtail millet', 'foxtail', 'Rinse and soak the foxtail millet 20 minutes; drain.'], ['Vermicelli', 'semiya', 'Dry-roast the vermicelli until light golden.']];
        const veg = ['mixveg', 'peas', 'carrotbeans', 'tomato', 'capsicum', 'corn', 'spinach', 'cabbage'];
        const adds = [['', []], [' & peanuts', [['peanut', 10]]], [' & sprouts', [['sprouts', 40]]], [' & paneer', [['paneer', 40]]], [' & tofu', [['tofu', 50]]]];
        grains.forEach(([gn, gk, gh]) => veg.forEach((vk) => adds.forEach(([an, ai]) => add({
          fam, name: `${gn} upma with ${lc(VG[vk].n)}${an}`, ing: [[gk, 40], ...VG[vk].ing, ...ai, ['onion', 25], ['oil', 5], ['spice', 1]],
          prep: 8, cook: gk === 'quinoa' || gk === 'foxtail' ? 18 : 12,
          method: () => [gh, 'Heat the oil, splutter mustard seeds, urad dal and curry leaves; add the onion and green chilli and sauté 2 minutes.', `${VG[vk].cook}${ai.length ? ` Add the ${an.replace(' & ', '')}.` : ''}`, `Pour in ${gk === 'semiya' || gk === 'oats' ? '1¼' : '2'} cups hot water with salt and bring to a boil.`, `Stir in the ${lc(gn)} slowly, cover and cook on low heat until the water is absorbed (${gk === 'quinoa' || gk === 'foxtail' ? '15' : '4–5'} minutes); finish with lemon and coriander.`],
        }))));
        const padd = [['', []], [' & peanuts', [['peanut', 10]]], [' & sprouts', [['sprouts', 40]]], [' & paneer', [['paneer', 40]]], [' & tofu', [['tofu', 50]]], [' & soya', [['soya', 15]]]];
        veg.forEach((vk) => padd.forEach(([an, ai]) => add({
          fam, name: `Poha with ${lc(VG[vk].n)}${an}`, ing: [['poha', 45], ...VG[vk].ing, ...ai, ['onion', 25], ['oil', 5], ['lemon', 5], ['spice', 1]], prep: 8, cook: 8,
          method: () => ['Rinse the thick poha in a sieve, drain and rest 5 minutes to soften.', 'Heat the oil, splutter mustard seeds and curry leaves, add the onion and green chilli; sauté 2 minutes.', `${VG[vk].cook}${ai.length ? ` Add the ${an.replace(' & ', '')}${an.includes('soya') ? ' (soaked and squeezed)' : ''}.` : ''}`, 'Add the poha, turmeric and salt; mix gently, cover and steam 2 minutes on low heat. Finish with lemon and coriander.'],
        })));
      },
    },

    dosa: {
      cat: 'Dosa & uttapam', meal: ['breakfast', 'dinner'], region: 'S', serving: '2 uttapams',
      tip: 'Sprinkle the topping on as soon as the batter is spread so it sticks while cooking.',
      gen(add, fam) {
        const batters = [['Rice–urad', [['rice', 40], ['urad', 15]], 'Soak the rice and urad dal 5 hours, grind and ferment overnight.'], ['Ragi', [['ragi', 30], ['urad', 15]], 'Soak and grind the urad dal, mix with the ragi flour and ferment 8 hours.'],
          ['Oats', [['oats', 35], ['rava', 10], ['curd', 30]], 'Powder the oats, mix with the rava, curd, salt and water; rest 15 minutes.'], ['Green moong', [['wmoong', 45]], 'Soak the green moong 6 hours and grind with ginger and chilli (no fermenting needed).'],
          ['Multigrain', [['rice', 20], ['urad', 10], ['jowar', 15]], 'Soak and grind the rice and urad, stir in the jowar flour and ferment overnight.'], ['Rava', [['rava', 40], ['curd', 40]], 'Mix the rava with the curd, salt and water; rest 20 minutes.']];
        const tops = [['onion-tomato', [['onion', 30], ['tomato', 30]]], ['mixed veg', [['mixveg', 50]]], ['paneer', [['paneer', 40]]], ['carrot', [['carrot', 40]]], ['cabbage', [['cabbage', 40]]], ['corn & capsicum', [['corn', 20], ['capsicum', 25]]], ['spinach', [['spinach', 40]]], ['methi', [['methi', 25]]], ['mushroom', [['mushroom', 40]]], ['tofu', [['tofu', 50]]]];
        batters.forEach(([bn, bi, bh]) => tops.forEach(([tn, ti]) => add({
          fam, name: `${bn} uttapam with ${tn}`, ing: [...bi, ...ti, ['oil', 5], ['coriander', 5]], prep: 15, cook: 12,
          method: () => [bh, `Finely chop the ${tn} with coriander and a green chilli.`, 'Heat a tawa, pour a ladle of batter and spread into a thick round; scatter half the topping over it and press lightly.', 'Drizzle half the oil around the edge, cover and cook 2–3 minutes; flip and cook 1 minute more. Make the second the same way.'],
        })));
      },
    },

    soup: {
      cat: 'Soups', meal: ['dinner', 'evening'], region: 'CON', serving: '1 large bowl',
      tip: 'Make a big batch — the soup keeps 2 days refrigerated; add the greens fresh when reheating.',
      gen(add, fam) {
        const prots = ['paneer', 'tofu', 'chicken', 'egg', 'soya', 'chickpea', 'rajma', 'fish', 'prawn', 'sprouts', 'eggw', 'edamame'];
        const veg = ['spinach', 'mushroom', 'broccoli', 'mixveg', 'carrotbeans', 'cabbage', 'pumpkin', 'zucchini', 'corn', 'tomato'];
        prots.forEach((pk) => veg.forEach((vk) => {
          const P = PR[pk], V = VG[vk];
          add({
            fam, name: `${P.n} & ${lc(V.n)} soup`, ing: [...P.ing, ...V.ing, ['onion', 20], ['garlic', 4], ['ginger', 3], ['oil', 4], ['lemon', 4]], prep: 10 + P.p, cook: 12 + Math.min(P.t, 15),
            method: () => [P.prep, 'Heat the oil, sauté the garlic, ginger and onion for 2 minutes.', `${V.cook} Pour in 2 cups water with salt and pepper and bring to a boil.`, pk === 'egg' ? 'Lower the heat and drizzle in the beaten eggs in a thin stream, stirring gently, for egg-drop ribbons.' : P.simmer.replace(/gravy|masala/g, 'soup'), 'Simmer 5 minutes more; finish with the lemon juice, pepper and spring onion or coriander.'],
          });
        }));
        const dals = [['Moong', 'moong'], ['Masoor', 'masoor'], ['Toor', 'toor'], ['Green moong', 'wmoong']];
        dals.forEach(([dn, dk]) => ['spinach', 'pumpkin', 'carrot', 'tomato', 'mixveg', 'lauki', 'drumstick', 'methi'].forEach((vk) => add({
          fam, name: `${dn} dal & ${lc(VG[vk].n)} soup`, ing: [[dk, 30], ...VG[vk].ing, ['onion', 20], ['garlic', 4], ['oil', 4], ['lemon', 4], ['spice', 1]], prep: 10, cook: 20, region: 'IN',
          method: () => [`Wash the ${lc(dn)} dal and pressure-cook with 3 cups water, turmeric and salt (3 whistles).`, `Heat the oil, sauté the garlic and onion, then: ${lc(VG[vk].cook)}`, 'Add the cooked dal, blend half of it for body and simmer 5 minutes.', 'Finish with lemon juice, pepper and roasted cumin; serve hot.'],
        })));
      },
    },

    curdbowl: {
      cat: 'Curd & yogurt bowls', meal: ['breakfast', 'midmorning', 'evening'], region: 'CON', serving: '1 bowl',
      tip: 'Hang the curd in a muslin cloth for 30 minutes for a thicker, higher-protein bowl.',
      gen(add, fam) {
        const bases = [['Curd', 'curd'], ['Low-fat curd', 'lfcurd'], ['Greek yogurt', 'greek']];
        const fruit = [['banana', [['banana', 60]]], ['apple', [['apple', 80]]], ['berries', [['berries', 60]]], ['strawberries', [['strawberry', 70]]], ['mango', [['mango', 70]]], ['papaya', [['papaya', 80]]], ['pomegranate', [['pomegranate', 50]]], ['kiwi', [['kiwi', 70]]], ['pear', [['pear', 80]]], ['dates', [['dates', 15]]]];
        const crunch = [['muesli', [['muesli', 20]]], ['chia', [['chia', 6]]], ['flaxseed', [['flax', 6]]], ['almonds', [['almond', 8]]], ['walnuts', [['walnut', 8]]], ['pumpkin seeds', [['pumpkinseed', 8]]]];
        const powders = [['', []], [' + whey isolate', [['wheyiso', 15]]], [' + casein', [['casein', 17]]], [' + pea protein', [['plantp', 16]]]];
        bases.forEach(([bn, bk]) => fruit.forEach(([fn, fi]) => crunch.forEach(([cn, ci]) => powders.forEach(([pn, pi]) => add({
          fam, name: `${pi.length ? 'Protein ' + lc(bn) : bn} bowl with ${fn} & ${cn}${pn}`, ing: [[bk, 150], ...fi, ...ci, ...pi], prep: 5, cook: 0,
          method: () => [`Whisk the ${lc(bn)} until smooth and creamy.`, ...(pi.length ? [`Whisk in ½ scoop of unflavoured ${pn.replace(' + ', '')} powder until no lumps remain (add a spoon of water if it gets too thick).`] : []), `Spoon into a bowl and top with the chopped ${fn}.`, `Sprinkle the ${cn} on top just before eating so it stays crunchy.`],
        })))));
      },
    },

    pulao: {
      cat: 'Pulao & rice', meal: ['lunch', 'dinner'], region: 'IN', serving: '1 plate (1½ cups)',
      tip: 'Soak the rice 20 minutes and do not stir after the water goes in, for separate grains.',
      gen(add, fam) {
        const prots = ['paneer', 'tofu', 'chicken', 'egg', 'soya', 'chickpea', 'rajma', 'prawn', 'chaap', 'sprouts'];
        const veg = ['peas', 'mixveg', 'carrotbeans', 'mushroom', 'capsicum', 'corn'];
        const rice = [['rice', 'rice', 15], ['brown rice', 'brice', 30], ['quinoa', 'quinoa', 15]];
        prots.forEach((pk) => veg.forEach((vk) => rice.forEach(([rn, rk, rt]) => {
          const P = PR[pk], V = VG[vk];
          add({
            fam, name: `${P.n} & ${lc(V.n)} ${rn === 'rice' ? '' : rn + ' '}pulao`, ing: [[rk, 50], ...P.ing, ...V.ing, ['onion', 30], ['oil', 6], ['spice', 1.5], ['curd', 0]].filter(([, g]) => g > 0),
            prep: 20 + P.p, cook: rt + 5,
            method: () => [`Wash the ${rn} and soak 20 minutes; drain.`, P.prep, 'Heat the oil, add whole spices (bay leaf, cloves, cinnamon, cumin) and the sliced onion; sauté until golden.', `${P.sear.replace('half the oil', 'the pan').replace('; keep aside', '')} ${V.cook}`, `Add the ${rn}, salt and ${rk === 'brice' ? '2½' : '2'} parts hot water; cover and cook on low heat ${rt} minutes (or 2 whistles in a cooker).`, 'Rest 5 minutes covered, fluff with a fork and serve with raita or salad.'],
          });
        })));
      },
    },

    tikka: {
      cat: 'Tikka & grills', meal: ['lunch', 'dinner', 'evening'], region: 'IN', serving: '1 plate',
      tip: 'Marinate longer (up to overnight in the fridge) for deeper flavour — not more oil.',
      gen(add, fam) {
        const prots = [['Paneer', [['paneer', 100]], 12], ['Tofu', [['tofu', 120]], 15], ['Chicken', [['chicken', 120]], 20], ['Fish', [['fish', 120]], 12], ['Prawn', [['prawn', 110]], 8], ['Soya chaap', [['chaap', 110]], 15], ['Mushroom', [['mushroom', 150]], 10]];
        const mar = [['Tandoori', [['curd', 30], ['spice', 3], ['lemon', 5]], 'curd, ginger-garlic, kashmiri chilli, tandoori masala, lemon and salt'], ['Hariyali', [['curd', 30], ['mint', 10], ['coriander', 10], ['spinach', 20]], 'curd blended with mint, coriander, spinach, green chilli and salt'],
          ['Malai', [['curd', 30], ['cream', 10], ['cashew', 5]], 'curd, cream, cashew paste, white pepper, cardamom and salt'], ['Achari', [['curd', 30], ['spice', 3], ['oil', 2]], 'curd with fennel, mustard, nigella, fenugreek and chilli (pickle spices) and salt'], ['Lemon-pepper', [['lemon', 10], ['olive', 5], ['garlic', 4]], 'lemon juice, olive oil, crushed garlic, black pepper and salt']];
        const sides = [['salad', [['cucumber', 60], ['onion', 30], ['tomato', 40]], 'a kachumber salad of cucumber, onion and tomato'], ['mint raita', [['curd', 100], ['cucumber', 40], ['mint', 5]], 'mint-cucumber raita'], ['quinoa', [['quinoa', 40]], 'quinoa (cooked 15 minutes in 2 parts water)'], ['1 phulka', [['atta', 30]], 'a hot phulka']];
        prots.forEach(([pn, pi, pt]) => mar.forEach(([mn, mi, mh]) => sides.forEach(([sn, si, sh]) => add({
          fam, name: `${mn} ${lc(pn)} tikka with ${sn}`, ing: [...pi, ...mi, ...si, ['onion', 20], ['capsicum', 30], ['oil', 4]], prep: 40, cook: pt,
          method: () => [`Cut the ${lc(pn)} into large chunks with the onion and capsicum.`, `Marinate in ${mh} for at least 30 minutes.`, 'Thread onto skewers (soak wooden ones 20 minutes) and brush with the oil.', `Grill, air-fry or bake at 220 °C for ${pt}–${pt + 4} minutes, turning once, until charred at the edges${pn === 'Chicken' || pn === 'Fish' || pn === 'Prawn' ? ' and cooked through' : ''}.`, `Serve hot with lemon wedges and ${sh}.`],
        }))));
      },
    },

    pasta: {
      cat: 'Pasta', meal: ['lunch', 'dinner'], region: 'MED', serving: '1 plate',
      tip: 'Keep a cup of the pasta water — a splash makes any sauce silky without extra oil or cream.',
      gen(add, fam) {
        const prots = ['paneer', 'tofu', 'chicken', 'egg', 'soya', 'chickpea', 'rajma', 'prawn', 'tuna', 'salmon', 'edamame', 'keema'];
        const veg = ['spinach', 'mushroom', 'capsicum', 'broccoli', 'zucchini', 'corn', 'peas', 'kale'];
        const sauces = [['tomato-basil', [['tomatopuree', 100], ['garlic', 5], ['olive', 6]], 'Add the garlic and the tomato purée with dried basil, oregano, chilli flakes and salt; simmer 6 minutes into a thick sauce.'],
          ['garlic & olive oil', [['garlic', 8], ['olive', 8], ['chilli', 2]], 'Add the sliced garlic and chilli to the olive oil on low heat until just golden (do not brown).'],
          ['creamy yogurt', [['greek', 60], ['garlic', 4], ['olive', 4]], 'Take the pan off the heat and stir in the Greek yogurt whisked with garlic, pepper and 3 tbsp pasta water (off the heat so it does not split).'],
          ['spinach-almond pesto', [['spinach', 40], ['almond', 8], ['olive', 7], ['garlic', 3]], 'Blend the spinach, almonds, garlic, olive oil, lemon and salt into a pesto and toss it through the pasta off the heat.']];
        const tuna = { n: 'Tuna', sea: true, ing: [['tuna', 80]], p: 2, t: 2, prep: 'Drain the tuna and flake it.', sear: 'Warm the flaked tuna in the pan for 1 minute.' };
        prots.forEach((pk) => veg.forEach((vk) => sauces.forEach(([sn, si, sh]) => {
          const P = PR[pk] || tuna, V = VG[vk];
          if (vk === 'spinach' && sn.startsWith('spinach')) return;
          add({
            fam, name: `${P.n} & ${lc(V.n)} whole-wheat pasta in ${sn} sauce`, ing: [['pasta', 60], ...P.ing, ...V.ing, ...si, ['onion', 15]], prep: 10 + P.p, cook: 15 + Math.min(P.t, 10),
            method: () => ['Boil the whole-wheat pasta in well-salted water until al dente (8–10 minutes); keep ½ cup of the pasta water and drain.', P.prep, P.sear.replace('half the oil', 'a little of the olive oil'), `Sauté the onion in the pan. ${V.cook}`, sh, `Toss the pasta, the ${lc(P.n)} and the vegetables together, loosen with pasta water and finish with black pepper.`],
          });
        })));
      },
    },

    bhurji: {
      cat: 'Bhurji & scrambles', meal: ['breakfast', 'dinner'], region: 'IN', serving: '1 plate',
      tip: 'Take the pan off the heat while it still looks slightly wet — it keeps cooking and stays soft.',
      gen(add, fam) {
        const bases = [['Egg', [['egg', 100]], 'Beat 2 eggs with salt and pepper.'], ['Paneer', [['paneer', 90]], 'Crumble the paneer by hand.'], ['Tofu', [['tofu', 120]], 'Crumble the pressed tofu by hand.'], ['Egg white', [['eggw', 130]], 'Whisk 4 egg whites with salt and pepper.']];
        const veg = ['spinach', 'mushroom', 'capsicum', 'peas', 'corn', 'tomato', 'onion', 'methi'];
        const sides = [['2 multigrain toasts', [['mgbread', 60]]], ['1 phulka', [['atta', 30]]], ['2 phulkas', [['atta', 60]]], ['', []]];
        bases.forEach(([bn, bi, bh]) => veg.forEach((vk) => sides.forEach(([sn, si]) => add({
          fam, name: `${bn} bhurji with ${lc(VG[vk].n)}${sn ? ` & ${sn}` : ''}`, ing: [...bi, ...VG[vk].ing, ...si, ['onion', 20], ['oil', 5], ['spice', 1]], prep: 8, cook: 10,
          method: () => [bh, 'Heat the oil, add cumin and the chopped onion and green chilli; sauté 2 minutes.', `${VG[vk].cook} Add turmeric, chilli and salt.`, `Add the ${lc(bn)} and stir on medium heat for 2–3 minutes until just set and soft.`, sn ? `Finish with coriander and serve with ${sn}${sn.includes('toast') ? ' (toasted)' : ' (made fresh on the tawa)'}.` : 'Finish with coriander and black pepper.'],
        }))));
      },
    },

    paratha: {
      cat: 'Parathas', meal: ['breakfast', 'lunch', 'dinner'], region: 'N', serving: '2 parathas',
      tip: 'Keep the filling dry (squeeze out water) so the paratha rolls without tearing.',
      gen(add, fam) {
        const fills = [['Aloo', [['potato', 70]], 'Boil, peel and mash the potato with salt, chilli and coriander.'], ['Gobi', [['cauli', 70]], 'Grate the cauliflower, salt it for 10 minutes and squeeze out the water.'], ['Mooli', [['radish', 70]], 'Grate the radish, salt it for 10 minutes and squeeze dry.'],
          ['Paneer', [['paneer', 60]], 'Crumble the paneer with chilli, ajwain and coriander.'], ['Tofu', [['tofu', 70]], 'Crumble the pressed tofu with chilli and coriander.'], ['Soya keema', [['soya', 25]], 'Soak the soya chunks 10 minutes, squeeze and mince them finely.'],
          ['Methi', [['methi', 35]], 'Chop the methi leaves finely (they are kneaded into the dough).'], ['Palak', [['spinach', 50]], 'Blanch and purée the spinach (it is kneaded into the dough).'], ['Sattu', [['sattu', 30], ['onion', 15]], 'Mix the sattu with chopped onion, lemon, ajwain, chilli and salt.'],
          ['Moong dal', [['moong', 25]], 'Soak the moong dal 2 hours, drain and coarsely grind with chilli.'], ['Matar', [['peas', 50]], 'Coarsely mash the boiled peas with ginger and chilli.'], ['Mixed veg', [['mixveg', 60]], 'Grate or finely chop the vegetables and squeeze out excess water.'],
          ['Egg', [['egg', 50]], 'Beat the egg with salt and chopped onion (poured into the paratha as it cooks).'], ['Chicken keema', [['ckeema', 50]], 'Cook the chicken mince with onion and spices until dry, then cool.']];
        const flours = [['', [['atta', 60]]], ['multigrain ', [['mgatta', 60]]], ['besan-atta ', [['atta', 45], ['besan', 15]]], ['ragi-atta ', [['atta', 40], ['ragi', 20]]]];
        const sides = [['', []], [' with curd', [['curd', 100]]], [' with raita', [['curd', 80], ['cucumber', 40]]]];
        fills.forEach(([fn, fi, fh]) => flours.forEach(([ln, li]) => sides.forEach(([sn, si]) => add({
          fam, name: `${fn} ${ln}paratha${sn}`, ing: [...li, ...fi, ...si, ['oil', 6], ['spice', 1]], prep: 20, cook: 12,
          method: () => [`Knead the ${ln || 'whole-wheat '}flour with water and salt into a soft dough; rest 15 minutes.`, fh, 'Divide the dough into 2 balls, roll each into a small disc, place the filling in the centre, seal and roll gently into a paratha.', 'Cook on a hot tawa 1 minute per side, then brush with half the oil and press until golden spots appear on both sides. Make the second the same way.', ...(si.length ? [sn.includes('raita') ? 'Whisk the curd with grated cucumber, roasted cumin and salt for the raita and serve alongside.' : 'Serve hot with the fresh curd.'] : [])],
        }))));
      },
    },

    dal: {
      cat: 'Dal', meal: ['lunch', 'dinner'], region: 'IN', serving: '1 katori (150 ml)',
      tip: 'Add the tadka just before serving — it keeps the aroma fresh.',
      gen(add, fam) {
        const dals = [['Moong dal', [['moong', 40]]], ['Masoor dal', [['masoor', 40]]], ['Toor dal', [['toor', 40]]], ['Chana dal', [['chanadal', 40]]], ['Green moong dal', [['wmoong', 40]]], ['Mixed dal', [['moong', 15], ['masoor', 15], ['toor', 10]]]];
        const veg = [['palak', 'spinach'], ['lauki', 'lauki'], ['methi', 'methi'], ['tomato', 'tomato'], ['drumstick', 'drumstick'], ['pumpkin', 'pumpkin'], ['mixed veg', 'mixveg'], ['tadka', null]];
        const fats = [['ghee', 'ghee'], ['oil', 'oil']];
        dals.forEach(([dn, di]) => veg.forEach(([vn, vk]) => fats.forEach(([fn, fk]) => add({
          fam, name: vn === 'tadka' ? `${dn} tadka (${fn})` : `${dn} ${vn} (${fn} tadka)`, ing: [...di, ...(vk ? VG[vk].ing : []), ['onion', 20], ['tomato', 20], ['garlic', 3], [fk, 5], ['spice', 1.5]], prep: 10, cook: 25,
          method: () => [`Wash the ${lc(dn)} and pressure-cook with 2½ cups water, turmeric and salt (3 whistles; 5 for chana dal).`, ...(vk ? [`${VG[vk].cook.replace('Add the', 'Cook the')} (with a splash of water in a pan, or add it to the cooker with the dal).`] : []), `Heat the ${fn}, crackle cumin, hing and dried red chilli; add the garlic, onion and tomato and cook until soft.`, 'Pour the tadka over the cooked dal, simmer 5 minutes and garnish with coriander.'],
        }))));
      },
    },

    omelette: {
      cat: 'Omelettes', meal: ['breakfast', 'dinner'], region: 'CON', serving: '1 omelette',
      tip: 'Cook on medium-low heat with a lid for a fluffy omelette that does not brown too much.',
      gen(add, fam) {
        const eggs = [['2-egg', [['egg', 100]], 'Beat 2 eggs with salt and pepper until frothy.'], ['Egg-white', [['eggw', 130]], 'Whisk 4 egg whites with salt and pepper.'], ['1 egg + 2 white', [['egg', 50], ['eggw', 65]], 'Beat 1 egg with 2 egg whites, salt and pepper.']];
        const veg = ['spinach', 'mushroom', 'capsicum', 'tomato', 'onion', 'corn', 'methi', 'broccoli', 'zucchini', 'kale'];
        const sides = [['', []], [' with 2 multigrain toasts', [['mgbread', 60]]], [' with 1 phulka', [['atta', 30]]]];
        eggs.forEach(([en, ei, eh]) => veg.forEach((vk) => sides.forEach(([sn, si]) => add({
          fam, name: `${en} ${lc(VG[vk].n)} omelette${sn}`, ing: [...ei, ...VG[vk].ing, ...si, ['oil', 4], ['coriander', 3]], prep: 5, cook: 6,
          method: () => [eh, `Heat half the oil in a non-stick pan. ${VG[vk].cook}`, 'Spread the vegetables evenly, pour the eggs over them and tilt the pan to cover.', 'Cover and cook on medium-low heat for 2 minutes until the top is just set; fold in half.', `Slide onto a plate and sprinkle with coriander${sn ? ` — serve${sn}` : ''}.`],
        }))));
      },
    },

    burrito: {
      cat: 'Burrito bowls & tacos', meal: ['lunch', 'dinner'], region: 'MEX', serving: '1 bowl',
      tip: 'Mash a few of the beans into the salsa for a creamier bowl without cheese.',
      gen(add, fam) {
        const prots = ['chicken', 'paneer', 'tofu', 'egg', 'soya', 'chickpea', 'fish', 'prawn', 'tempeh', 'keema', 'chaap', 'edamame'];
        const bases = [['brown rice', [['brice', 40]], GR.brice.cook], ['quinoa', [['quinoa', 40]], GR.quinoa.cook], ['lettuce', [['greens', 70]], 'Wash and shred the lettuce; keep it chilled.']];
        const tops = [['yogurt', [['curd', 50]]], ['cheese', [['cheese', 15]]], ['avocado', [['avocado', 40]]]];
        prots.forEach((pk) => bases.forEach(([bn, bi, bh]) => tops.forEach(([tn, ti]) => {
          const P = PR[pk];
          add({
            fam, name: `${P.n} burrito bowl on ${bn} with ${tn}`, ing: [...bi, ...P.ing, ['bbeans', 60], ['corn', 30], ['tomato', 50], ['onion', 20], ['capsicum', 30], ['lemon', 6], ['oil', 5], ['spice', 2], ...ti], prep: 15 + P.p, cook: Math.max(bn === 'lettuce' ? 0 : 15, P.t + 5),
            method: () => [bh, P.prep, `${P.sear} Season it with cumin, paprika and oregano.`, 'Warm the beans and corn with a pinch of cumin and salt.', 'Make a quick salsa: chop the tomato, onion and capsicum and mix with the lime/lemon juice, chilli and coriander.', `Layer the ${bn}, beans and corn, the ${lc(P.n)} and the salsa; top with the ${tn}.`],
          });
        })));
        const tortillas = [['corn tortilla', 'ctortilla', 50], ['whole-wheat tortilla', 'wtortilla', 50]];
        prots.forEach((pk) => tortillas.forEach(([tn, tk, tg]) => ['cabbage', 'capsicum', 'corn'].forEach((vk) => {
          const P = PR[pk], V = VG[vk];
          add({
            fam, name: `${P.n} tacos (${tn}) with ${lc(V.n)} slaw`, ing: [[tk, tg], ...P.ing, ...V.ing, ['tomato', 30], ['onion', 15], ['lemon', 5], ['curd', 20], ['oil', 4], ['spice', 1.5]], prep: 12 + P.p, cook: P.t + 4,
            method: () => [P.prep, `${P.sear} Season with cumin, chilli and a squeeze of lime.`, `Toss the ${lc(V.n)} with the tomato, onion, lemon juice and salt for a quick slaw.`, `Warm the ${tn}s on a dry pan 20 seconds per side.`, `Fill with the ${lc(P.n)}, the slaw and a spoon of curd; fold and serve.`],
          });
        })));
      },
    },

    sprouts: {
      cat: 'Sprouts & chaat', meal: ['midmorning', 'evening', 'breakfast'], region: 'IN', serving: '1 bowl',
      tip: 'Sprout at home: soak overnight, drain and keep covered 24 hours in a warm place.',
      gen(add, fam) {
        const bases = [['Moong sprouts', [['sprouts', 80]]], ['Mixed sprouts', [['msprouts', 80]]], ['Kala chana', [['kalachana', 35]]], ['Chickpea', [['chickpea', 100]]]];
        const adds = [['pomegranate', [['pomegranate', 40]]], ['corn', [['corn', 40]]], ['paneer', [['paneer', 40]]], ['boiled egg', [['egg', 50]]], ['roasted peanuts', [['peanut', 10]]], ['cucumber-tomato', [['cucumber', 50], ['tomato', 40]]], ['raw mango', [['rawmango', 30]]], ['apple', [['apple', 60]]]];
        const dress = [['lemon-chaat masala', [['lemon', 8]]], ['curd & tamarind', [['curd', 40], ['tamarind', 5]]]];
        bases.forEach(([bn, bi]) => adds.forEach(([an, ai]) => dress.forEach(([dn, di]) => add({
          fam, name: `${bn} chaat with ${an} (${dn})`, ing: [...bi, ...ai, ...di, ['onion', 20], ['coriander', 5]], prep: 10, cook: bn === 'Kala chana' ? 25 : 5,
          method: () => [bn === 'Kala chana' ? 'Soak the kala chana overnight and pressure-cook with salt for 5 whistles; drain and cool.' : `Steam the ${lc(bn)} for 4–5 minutes so they stay crunchy; cool.`, `Chop the onion, coriander and the ${an}.`, dn.startsWith('curd') ? 'Whisk the curd with salt and roasted cumin; loosen the tamarind with a little water.' : 'Mix the lemon juice with chaat masala, roasted cumin and salt.', 'Toss everything together and eat straight away so it stays crunchy.'],
        }))));
      },
    },
  };

  // ── Steps: measure → wash → method → finish → serve ─────────────────
  const unitOf = (x) => (x.cat === 'drink' || /milk|water|juice/i.test(x.name) ? 'ml' : 'g');
  const nameOf = (x) => x.name.replace(/\s*\(.*?\)/g, '').toLowerCase();
  function fullSteps(r, serves) {
    const k = serves || 1;
    const items = r.ing.filter(([, g]) => g > 0).map(([key, g]) => ({ x: ING[key], g: Math.round(g * k * 10) / 10 }));
    const out = [`Measure everything first${k > 1 ? ` (for ${k} servings)` : ''}: ${join(items.map(({ x, g }) => `${nameOf(x)} ${g} ${unitOf(x)}`))}.`];
    const fresh = items.filter(({ x }) => ['veg', 'leafy', 'fruit'].includes(x.cat) && x.key !== 'lemon').map(({ x }) => nameOf(x));
    if (fresh.length) out.push(`Wash ${join(fresh)} under running water, then peel and chop as the dish needs.`);
    r.method().filter(Boolean).forEach((s) => out.push(s));
    if (r.tip) out.push(r.tip);
    out.push(`Serve ${r.serving}${k > 1 ? ` × ${k}` : ''} per person — about ${r.kcal} kcal and ${r.p} g protein in each serving.`);
    return out;
  }

  function all() {
    if (!LIST) LIST = build();
    return LIST;
  }
  function find(name) {
    if (!byName) { byName = new Map(); all().forEach((r) => byName.set(r.name, r)); }
    return byName.get(name) || null;
  }
  const categories = () => [...new Set(Object.values(FAMILIES).map((f) => f.cat))];

  const api = { all, find, fullSteps, categories, POWDER_KEYS, FAMILIES };
  if (node) module.exports = api;
  else root.RECIPEGEN = api;
})(typeof window !== 'undefined' ? window : globalThis);
