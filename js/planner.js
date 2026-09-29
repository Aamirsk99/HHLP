/*
 * Diet planning logic: energy targets, macro split, and weekly meal selection.
 * Pure functions with no DOM access, so they run in the browser and under Node tests.
 */
(function (root) {
  const ACTIVITY = {
    sedentary: { factor: 1.2, label: 'Sedentary (desk job, little exercise)' },
    light: { factor: 1.375, label: 'Lightly active (1–3 days/week)' },
    moderate: { factor: 1.55, label: 'Moderately active (3–5 days/week)' },
    active: { factor: 1.725, label: 'Very active (6–7 days/week)' },
    athlete: { factor: 1.9, label: 'Athlete / physical job' },
  };

  const GOALS = {
    lose: { delta: -500, proteinPerKg: 1.4, label: 'Weight loss' },
    maintain: { delta: 0, proteinPerKg: 1.0, label: 'Maintain weight' },
    gain: { delta: 350, proteinPerKg: 1.2, label: 'Weight gain' },
    muscle: { delta: 250, proteinPerKg: 1.8, label: 'Muscle gain' },
    pregnancy: { delta: 350, proteinPerKg: 1.2, label: 'Pregnancy' },
    lactation: { delta: 500, proteinPerKg: 1.3, label: 'Lactation' },
  };

  /*
   * Diet plan types. `goal: 'auto'` means weight loss when BMI is 23 or more
   * (Asian-Indian overweight cut-off), otherwise maintenance.
   */
  const PLANS = {
    weight_loss: { label: 'Weight loss diet', goal: 'lose' },
    weight_gain: { label: 'Weight gain diet', goal: 'gain' },
    balanced: { label: 'Balanced / healthy diet', goal: 'maintain' },
    high_protein: { label: 'High-protein / muscle gain diet', goal: 'muscle' },
    diabetic: { label: 'Diabetic diet', goal: 'auto', condition: 'diabetes' },
    pcos: { label: 'PCOS / PCOD diet', goal: 'auto', condition: 'pcos' },
    thyroid: { label: 'Thyroid diet', goal: 'auto', condition: 'thyroid' },
    bp: { label: 'High BP (DASH, low-salt) diet', goal: 'auto', condition: 'hypertension' },
    heart: { label: 'Heart-healthy / cholesterol diet', goal: 'auto', condition: 'cholesterol' },
    fatty_liver: { label: 'Fatty liver diet', goal: 'auto', condition: 'fattyliver' },
    kidney: { label: 'Kidney (renal) diet', goal: 'maintain', condition: 'kidney' },
    pregnancy: { label: 'Pregnancy diet (2nd–3rd trimester)', goal: 'pregnancy', femaleOnly: true },
    lactation: { label: 'Lactation (breastfeeding) diet', goal: 'lactation', femaleOnly: true },
  };

  const CONDITIONS = {
    diabetes: 'Diabetes',
    hypertension: 'High BP',
    pcos: 'PCOS / PCOD',
    thyroid: 'Thyroid',
    cholesterol: 'High cholesterol',
    fattyliver: 'Fatty liver',
    kidney: 'Kidney disease',
  };

  const SLOTS = {
    early: { label: 'Early morning', time: '6:30 AM', scalable: false },
    breakfast: { label: 'Breakfast', time: '8:00 AM', scalable: true },
    midmorning: { label: 'Mid-morning', time: '11:00 AM', scalable: true },
    lunch: { label: 'Lunch', time: '1:30 PM', scalable: true },
    evening: { label: 'Evening snack', time: '5:00 PM', scalable: true },
    dinner: { label: 'Dinner', time: '8:00 PM', scalable: true },
    bedtime: { label: 'Bedtime', time: '10:00 PM', scalable: false },
  };

  // Share of daily calories per slot, by number of main meals/snacks.
  const SPLITS = {
    3: { breakfast: 0.30, lunch: 0.40, dinner: 0.30 },
    4: { breakfast: 0.25, lunch: 0.35, evening: 0.12, dinner: 0.28 },
    5: { breakfast: 0.22, midmorning: 0.10, lunch: 0.33, evening: 0.10, dinner: 0.25 },
    6: { breakfast: 0.22, midmorning: 0.10, lunch: 0.30, evening: 0.10, dinner: 0.23, bedtime: 0.05 },
  };
  const EARLY_SHARE = 0.03;

  const DIET_RANK = { vegan: 0, veg: 1, jain: 1, egg: 2, nonveg: 3 };
  const DIETS = { veg: 'Vegetarian', jain: 'Jain', egg: 'Eggetarian', nonveg: 'Non-vegetarian', vegan: 'Vegan' };
  // Jain diets exclude onion, garlic and root vegetables.
  const JAIN_AVOID = ['potato', 'aloo', 'onion', 'garlic', 'ginger', 'carrot', 'beetroot', 'radish', 'mooli', 'sweet potato', 'arbi', 'yam', 'mushroom', 'sabudana'];
  const PREGNANCY_AVOID = ['papaya'];
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const UNIT_STEP = { pc: 0.5, slice: 0.5, g: 10, ml: 25, cup: 0.25, katori: 0.25, bowl: 0.25, glass: 0.25, tbsp: 0.5, tsp: 0.5 };
  const UNIT_PLURAL = { pc: 'pcs', slice: 'slices', cup: 'cups', katori: 'katoris', bowl: 'bowls', glass: 'glasses' };

  function round(x, step) { return Math.round(x / step) * step; }

  /** BMI category using Asian-Indian cut-offs (Consensus guidelines for India). */
  function bmiCategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 23) return 'Normal';
    if (bmi < 25) return 'Overweight';
    return 'Obese';
  }

  function bmiOf(p) {
    const hM = p.heightCm / 100;
    return p.weightKg / (hM * hM);
  }

  /**
   * Fill in `goal` and `conditions` from the chosen diet plan and weight goal.
   * Accepts older profiles that set `goal` directly.
   */
  function resolveProfile(p) {
    const plan = PLANS[p.plan];
    const conditions = [...new Set([...(p.conditions || []), ...(plan && plan.condition ? [plan.condition] : [])])];
    let goal = p.goal;
    if (plan) {
      goal = plan.goal;
      const fixed = goal === 'pregnancy' || goal === 'lactation';
      if (!fixed && p.weightGoal && p.weightGoal !== 'plan') goal = p.weightGoal;
      if (goal === 'auto') goal = bmiOf(p) >= 23 ? 'lose' : 'maintain';
    }
    if (!GOALS[goal]) goal = 'maintain';
    if (conditions.includes('kidney') && (goal === 'muscle' || goal === 'gain')) goal = 'maintain';
    return { ...p, goal, conditions };
  }

  /** Energy, macro and hydration targets for a profile. */
  function computeTargets(input) {
    const p = resolveProfile(input);
    const hM = p.heightCm / 100;
    const bmi = bmiOf(p);
    const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === 'male' ? 5 : -161);
    const tdee = bmr * ACTIVITY[p.activity].factor;
    const goal = GOALS[p.goal];

    const floor = p.sex === 'male' ? 1500 : 1200;
    let calories = Math.max(floor, round(tdee + goal.delta, 50));
    // Do not recommend a surplus/deficit that flips the goal direction.
    if (p.goal === 'lose') calories = Math.min(calories, round(tdee, 50));

    // Protein is based on an adjusted weight (BMI 25) for people with obesity.
    const refWeight = bmi > 30 ? 25 * hM * hM : p.weightKg;
    const conditions = p.conditions;
    const kidney = conditions.includes('kidney');
    let protein = refWeight * (kidney ? 0.8 : goal.proteinPerKg);
    protein = Math.min(protein, (calories * 0.35) / 4);

    const lowCarb = conditions.some((c) => c === 'diabetes' || c === 'pcos' || c === 'fattyliver');
    const lowFat = conditions.some((c) => c === 'cholesterol' || c === 'fattyliver');
    const fatPct = lowFat ? 0.25 : lowCarb ? 0.32 : 0.28;
    const fat = (calories * fatPct) / 9;
    const carbs = Math.max(0, (calories - protein * 4 - fat * 9) / 4);

    let waterL = round((p.weightKg * 35) / 1000, 0.25);
    if (p.activity === 'active' || p.activity === 'athlete') waterL += 0.5;
    if (p.goal === 'pregnancy') waterL += 0.25;
    if (p.goal === 'lactation') waterL += 0.75;
    waterL = Math.min(Math.max(waterL, 2), 4.5);

    return {
      goal: p.goal,
      bmi: Math.round(bmi * 10) / 10,
      bmiCategory: bmiCategory(bmi),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calories,
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      fibre: Math.round((calories / 1000) * 14),
      waterL,
      idealWeight: [Math.round(18.5 * hM * hM), Math.round(22.9 * hM * hM)],
    };
  }

  /** Calorie target per meal slot, in serving order. */
  function slotTargets(calories, meals, earlyDrink) {
    const split = SPLITS[meals];
    const scale = earlyDrink ? 1 - EARLY_SHARE : 1;
    const out = [];
    if (earlyDrink) out.push({ slot: 'early', kcal: calories * EARLY_SHARE });
    Object.keys(SLOTS).forEach((slot) => {
      if (split[slot]) out.push({ slot, kcal: calories * split[slot] * scale });
    });
    return out;
  }

  /** Meal options that respect diet, allergies, medical conditions and dislikes. */
  function eligibleMeals(meals, input, slot) {
    const p = resolveProfile(input);
    const rank = DIET_RANK[p.diet];
    const allergies = p.allergies || [];
    const c = p.conditions;
    const avoidFlags = [];
    if (c.some((x) => x === 'diabetes' || x === 'pcos' || x === 'fattyliver')) avoidFlags.push('hgi');
    if (c.some((x) => x === 'hypertension' || x === 'kidney')) avoidFlags.push('hna');
    if (c.includes('kidney')) avoidFlags.push('hk');
    if (c.some((x) => x === 'cholesterol' || x === 'fattyliver')) avoidFlags.push('fried', 'hsf');
    const words = (p.dislikes || []).map((d) => d.toLowerCase()).filter(Boolean);
    if (p.diet === 'jain') words.push(...JAIN_AVOID);
    if (p.goal === 'pregnancy') words.push(...PREGNANCY_AVOID);

    const base = meals.filter((m) => {
      if (m.slot !== slot) return false;
      if (DIET_RANK[m.diet] > rank) return false;
      if (m.allergens.some((a) => allergies.includes(a))) return false;
      if (m.flags.some((f) => avoidFlags.includes(f))) return false;
      const text = (m.name + ' ' + m.items.map((i) => i[0]).join(' ')).toLowerCase();
      if (words.some((d) => text.includes(d))) return false;
      return true;
    });

    if (p.cuisine === 'in' || p.cuisine === 'gl') {
      const preferred = base.filter((m) => m.cuisine === p.cuisine);
      if (preferred.length >= 2) return preferred;
    }
    return base;
  }

  function formatQty(q) {
    const whole = Math.floor(q);
    const frac = Math.round((q - whole) * 100) / 100;
    const map = { 0.25: '¼', 0.5: '½', 0.75: '¾' };
    if (!frac) return String(whole);
    if (map[frac]) return (whole ? whole : '') + map[frac];
    return String(Math.round(q * 10) / 10);
  }

  function formatUnit(unit, qty) {
    if (unit === 'g' || unit === 'ml') return unit;
    return qty > 1 && UNIT_PLURAL[unit] ? UNIT_PLURAL[unit] : unit;
  }

  /** Scale a meal option to a calorie target; portions are rounded to kitchen-friendly amounts. */
  function portion(meal, targetKcal, scalable) {
    let factor = 1;
    if (scalable) factor = Math.min(2.5, Math.max(0.5, round(targetKcal / meal.kcal, 0.25)));
    const items = meal.items.map(([name, qty, unit, fixed]) => {
      const step = UNIT_STEP[unit] || 0.25;
      const q = fixed ? qty : Math.max(step, round(qty * factor, step));
      return { name, qty: q, unit, text: formatQty(q) + ' ' + formatUnit(unit, q) };
    });
    return {
      id: meal.id,
      name: meal.name,
      factor,
      items,
      kcal: Math.round(meal.kcal * factor),
      p: Math.round(meal.p * factor),
      c: Math.round(meal.c * factor),
      f: Math.round(meal.f * factor),
    };
  }

  /** Small deterministic PRNG so a seed reproduces the same plan. */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Pick an option, favouring the least-used and avoiding yesterday's choice. */
  function pick(options, used, avoidId, rand) {
    const pool = options.length > 1 ? options.filter((m) => m.id !== avoidId) : options;
    const minUse = Math.min(...pool.map((m) => used[m.id] || 0));
    const fresh = pool.filter((m) => (used[m.id] || 0) === minUse);
    return fresh[Math.floor(rand() * fresh.length)];
  }

  function sumDay(meals) {
    return meals.reduce(
      (t, m) => (m.meal ? { kcal: t.kcal + m.meal.kcal, p: t.p + m.meal.p, c: t.c + m.meal.c, f: t.f + m.meal.f } : t),
      { kcal: 0, p: 0, c: 0, f: 0 }
    );
  }

  /** Build a 7-day plan. Returns { targets, days: [{ day, meals: [{slot, label, time, target, meal}], totals }] }. */
  function generatePlan(library, profile, seed) {
    const targets = computeTargets(profile);
    const rand = rng(seed);
    const slots = slotTargets(targets.calories, profile.meals, profile.earlyDrink);
    const options = {};
    const used = {};
    const last = {};
    slots.forEach(({ slot }) => { options[slot] = eligibleMeals(library, profile, slot); });

    const days = DAYS.map((day) => {
      const meals = slots.map(({ slot, kcal }) => {
        const info = SLOTS[slot];
        const opts = options[slot];
        let meal = null;
        if (opts.length) {
          const chosen = pick(opts, used, last[slot], rand);
          used[chosen.id] = (used[chosen.id] || 0) + 1;
          last[slot] = chosen.id;
          meal = portion(chosen, kcal, info.scalable);
        }
        return { slot, label: info.label, time: info.time, target: Math.round(kcal), meal };
      });
      return { day, meals, totals: sumDay(meals) };
    });

    return { targets, days, options };
  }

  /** Replace one meal in a plan with a different eligible option. */
  function swapMeal(library, profile, plan, dayIndex, mealIndex, rand) {
    const entry = plan.days[dayIndex].meals[mealIndex];
    const opts = eligibleMeals(library, profile, entry.slot);
    if (opts.length < 2) return false;
    const others = opts.filter((m) => !entry.meal || m.id !== entry.meal.id);
    const chosen = others[Math.floor((rand || Math.random)() * others.length)];
    entry.meal = portion(chosen, entry.target, SLOTS[entry.slot].scalable);
    plan.days[dayIndex].totals = sumDay(plan.days[dayIndex].meals);
    return true;
  }

  function tips(input, targets) {
    const profile = resolveProfile(input);
    const c = profile.conditions;
    const t = [
      `Drink about ${targets.waterL} L of water through the day.`,
      'Fill half your plate with vegetables or salad at lunch and dinner.',
      'Cook with 3–4 tsp of oil per person per day; prefer mustard, groundnut or rice-bran oil.',
    ];
    if (profile.diet === 'jain') t.push('Jain: prepare all dishes without onion, garlic, ginger and root vegetables; finish dinner before sunset if you follow chauvihar.');
    if (profile.goal === 'lose') t.push('Weight loss: finish dinner 2–3 hours before bed, walk 30–45 minutes daily and aim for 7–8 hours of sleep.');
    if (profile.goal === 'gain' || profile.goal === 'muscle') t.push('Do not skip snacks; add strength training 3–4 times a week.');
    if (profile.goal === 'pregnancy') t.push('Pregnancy: continue iron, folic acid and calcium supplements as prescribed. Avoid raw papaya, unpasteurised milk, alcohol and excess caffeine.');
    if (profile.goal === 'lactation') t.push('Lactation: drink a glass of water or milk at every feed; include methi, jeera, ajwain and dals.');
    if (c.includes('diabetes')) t.push('Diabetes: choose whole grains and pair carbs with protein; avoid sugar, jaggery, juices and sweets. Monitor blood glucose as advised.');
    if (c.includes('hypertension')) t.push('High BP: keep salt under 5 g (1 tsp) a day; avoid pickles, papad, namkeen and packaged foods.');
    if (c.includes('pcos')) t.push('PCOS: favour low-GI foods, regular meal times and daily activity; limit sugar and refined flour (maida).');
    if (c.includes('thyroid')) t.push('Thyroid: take medication on an empty stomach and keep a 30–60 min gap before breakfast or tea. Eat cabbage, cauliflower and soy cooked, not raw.');
    if (c.includes('cholesterol')) t.push('Cholesterol: limit fried foods, ghee, butter and red meat; add oats, flaxseed and nuts.');
    if (c.includes('fattyliver')) t.push('Fatty liver: avoid alcohol, sugar, maida and fried food; lose 7–10% of body weight gradually.');
    if (c.includes('kidney')) t.push('Kidney disease: protein, salt and potassium are limited in this plan. Leach vegetables before cooking. Fluid needs vary — follow your nephrologist.');
    if (targets.bmi >= 23 && profile.goal !== 'lose' && profile.goal !== 'pregnancy' && profile.goal !== 'lactation') t.push('BMI is above the healthy range for Indians (18.5–22.9); consider a weight-loss goal.');
    if (targets.bmi < 18.5 && profile.goal === 'lose') t.push('BMI is below the healthy range; weight loss is not recommended.');
    return t;
  }

  /** Foods to limit or avoid, printed on the chart. */
  function avoidList(input) {
    const p = resolveProfile(input);
    const c = p.conditions;
    const list = ['Sugar, sweets & mithai', 'Fried snacks (samosa, pakoda, bhujia)', 'Maida, bakery & packaged foods', 'Soft drinks & packaged juices'];
    if (c.includes('diabetes') || c.includes('pcos')) list.push('White rice in excess, potato, jaggery, honey', 'Mango, chikoo, grapes, banana in excess');
    if (c.includes('hypertension') || c.includes('kidney')) list.push('Pickles, papad, sauces, extra salt');
    if (c.includes('kidney')) list.push('Coconut water, banana, orange, tomato-heavy dishes');
    if (c.includes('cholesterol') || c.includes('fattyliver')) list.push('Ghee, butter, cream, red meat, egg yolk in excess');
    if (c.includes('fattyliver')) list.push('Alcohol in any amount');
    if (p.goal === 'pregnancy') list.push('Raw papaya, raw sprouts, unpasteurised milk, alcohol');
    return list;
  }

  const api = {
    ACTIVITY, GOALS, PLANS, CONDITIONS, SLOTS, SPLITS, DAYS, DIETS,
    resolveProfile, computeTargets, slotTargets, eligibleMeals, portion, generatePlan, swapMeal, tips, avoidList, formatQty, rng,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Planner = api;
})(typeof window !== 'undefined' ? window : globalThis);
