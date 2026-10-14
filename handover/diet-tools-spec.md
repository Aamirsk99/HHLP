# Hindivine Diet Tools: Developer Specification

This document describes the three tools exactly as they work today, so they can be rebuilt in the clinic system
(Laravel API, React admin, Flutter apps). Where a behaviour is a limitation or is unfinished, it says so. Nothing in the
handover files was changed for the export.

## 1. What is in the handover

| File | What it is |
|---|---|
| `recipes.html` | **Recipe Book**: browse and read all 5,165 recipes. |
| `foods.html` | **Food Finder**: the food database (5,958 entries) with a meal calculator and recipe view. |
| `diet-chart-generator.html` | **Diet Chart Maker**: builds a printable diet chart from the recipes. |
| `foods.json` | Every entry in the food database (5,958). |
| `recipes.json` | Every recipe (5,165) with ingredients linked to `foods.json`. |
| `diet-chart-generator-data.json` | The data object embedded in `diet-chart-generator.html` (recipe flags, add-ons, slots, groups, texts), byte-for-byte as the page uses it. |
| `sample-diet-chart.json` | A sample generator input and its full output, captured from the real page (also in section 6.6). |
| `sample-diet-chart.pdf` | The same sample chart, printed through the browser's print engine (what "Print / Save as PDF" gives). It shows the current print bug: the last nutrition columns are cut off (section 6.4). |
| `diet-tools-spec.md` | This document. |

The JSON files were exported with `python3 recipe-pdfs/handover_export.py OUT_DIR HINAMES.json`, which reuses the same
functions that build the pages. They were checked against the data inside the HTML files: every food and recipe
matches what the tools show, and every ingredient link resolves.

The three HTML files are three separate apps, not one app with tabs. They share the same look, the same translation
engine and the same underlying data.

SHA-256 of the HTML files (they are byte-identical to the current builds on branch `claude/sharp-keller-2b9t4u`):

```
fa4af92763e96d1a652a38ac94deac82b47a88a8afda51b1c6fa20e262a9aae8  recipes.html
22e0e3bd51888cb14d1c99a5da8d1ac6b9b06e871b3d392cc6a533783d6c449c  foods.html
234aeeef2829b0cd75e66bd67d123b6746cb1a34acbaa773f7b3a8d7b625812b  diet-chart-generator.html
```

## 2. Runtime, dependencies and privacy

**Self-contained.** Each HTML file holds all of its HTML, CSS, JavaScript, data and the logo (as a data URI). Open it in a
browser by double-clicking; no server is needed. Sizes: recipes 6.6 MB, foods 7.1 MB, generator 4.1 MB (mostly embedded
data and translations).

**No JavaScript libraries.** There are no `<script src>` tags and no frameworks; the code is plain JavaScript.

**External resources: fonts only.** Each page loads web fonts from Google Fonts:

| Loaded | URL |
|---|---|
| Recipe Book and Food Finder, on load | `https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Lato:wght@400;700;900&display=swap` |
| Generator, on load | `https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Lato:ital,wght@0,400;0,700;0,900;1,400&display=swap` |
| Only when a language needing it is chosen | `https://fonts.googleapis.com/css2?family=<Font>:wght@400;700&display=swap` with `<Font>` one of: Noto Sans Devanagari (Hindi, Marathi), Noto Sans Bengali (Bengali, Assamese), Noto Sans Telugu, Noto Sans Tamil, Noto Sans Gujarati, Noto Sans Kannada, Noto Sans Malayalam, Noto Sans Oriya (Odia), Noto Sans Gurmukhi (Punjabi), Noto Naskh Arabic (Urdu, Arabic), Noto Sans (Russian), Noto Sans SC (Chinese), Noto Sans JP (Japanese) |

Google Fonts URLs cannot be pinned to an exact version: Google serves its current build of each font. If you need fixed
versions, self-host the fonts. Lato and DM Serif Display are in the repo at `recipe-pdfs/fonts/` (SIL Open Font
License); the Noto fonts are also OFL. Without internet the pages still work and fall back to system fonts.

**No AI, no APIs, no login, no keys, no paid services.** Nothing in any page calls an AI model or any external API.
There is no `fetch`, `XMLHttpRequest`, WebSocket or beacon in any file. The only network requests are the font files above.

**Browser features used**

| Feature | Where | What |
|---|---|---|
| `localStorage` key `hv-diet2` | Generator | All generator settings (section 6.1), including the "Prepared for" name, saved in that browser on that device. |
| `localStorage` key `hv-ff-lang`, `hv-meal` | Food Finder | Chosen languages; the "My Meal" list. |
| `localStorage` key `hv-rb-lang` | Recipe Book | Chosen languages. |
| `navigator.clipboard.writeText` | All | "Copy chart / meal / recipe as text" buttons. |
| `window.print()` | Generator | "Print / Save as PDF". |
| URL hash `#r<number>` | Recipe Book | Opens a recipe directly, e.g. `recipes.html#r2`. |

**Data in the files.** There is no patient data in any file. The "Prepared for" field is empty by default; whatever a
user types is kept only in that browser's `localStorage`. In the clinic system this must move to the patient record on
the server. The files do contain the clinic's own branding text: "Dr Rajat Goel · Bariatric Surgeon", `app@hindivine.com`
and `www.hindivine.com` (on the generator's "Our Services" page and in the translation tables of all three files). The
sample files use the made-up name "Sample Patient".

## 3. How the three tools connect

```
                 Ingredient catalogue (253 items incl. water and ice; per 100 g; values from IFCT 2017 / USDA)
                                 │  recipe nutrition = sum of its ingredients
                                 ▼
 IFCT 2017 raw foods      Recipes (5,165, per serving)
 (542, per 100 g)                │
        │                        ├──► Recipe Book (all recipes)
        │                        │
        ├────────────────────────┼──► Food Finder = IFCT foods + 251 ingredients + 5,165 dishes
        │                        │
        │                        └──► Diet Chart Generator
        │                               • auto-planner picks only recipes (4,659 of them are in planner pools)
        │                                 plus a few fixed items written into the generator (protein add-ons,
        │                                 bedtime drinks, clear-liquid feeds, fall-back items)
        └──────────────────────────────► • "Add food" / "Swap" search all 5,165 recipes and 769 per-100 g foods
                                           (IFCT + ingredients with energy above 0)
```

- **A recipe's nutrition comes from its ingredients.** Each recipe ingredient links to an entry in the ingredient catalogue
  (`foods.json` type `ingredient`, id `IN-nnn`); the recipe's per-serving values are calculated from those entries
  (section 5.3). The IFCT raw foods (`IF-…`) are not linked to recipes.
- **The generator picks recipes, not raw foods**, when it builds a chart. Raw foods and ingredients are only offered when
  the dietitian adds or swaps an item by hand.
- **Nothing is read at run time.** All data is embedded when the HTML is built from the Python sources in `recipe-pdfs/`
  (`catalog.py` ingredient values, `fam*.py` recipes, `foodlist.py`, `recipebook.py`, `webdata.py`, `i18n/`). Changing
  data means editing the Python sources and rebuilding (`python3 webdata.py`, `python3 recipebook.py`,
  `python3 foodlist.py OUT_DIR`). In the clinic system these should become database tables edited from the admin.
- **Translations** for all three tools come from the same files (`recipe-pdfs/i18n/<code>.json`), 20 languages.

## 4. Food database (Food Finder, `foods.html`, `foods.json`)

### 4.1 What a user can do

- **Search** by words (all words must match) in the English name, Hindi/local names and id, and also in the name as
  shown in the chosen language(s).
- **Filter** by source (IFCT 2017, Hindivine ingredient list, Hindivine recipe series), category, and diet:
  "Vegetarian" shows vegan and vegetarian, "Egg" shows everything except non-veg, "Vegan" and "Non-veg" are exact.
- **Sort** by name A-Z, most protein per 100 kcal, most protein, lowest calories, highest calories, most fibre.
  Shows 100 rows, then "Show more" adds 200.
- **My Meal**: add any food with "+ Add"; enter grams (per-100 g foods, default 100) or servings (dishes, default 1,
  step 0.25). Totals of kcal, protein, carbs, fat and fibre update live. "Copy meal as text", "Clear meal". Saved in the browser.
- **Open a recipe**: clicking a dish name opens its recipe (nutrition, ingredients, method).
- **Language** and **second language** menus (20 languages).
- **Add / edit / delete foods: not available.** The food list is read-only in the tool.

### 4.2 Fields (`foods.json` → `foods[]`)

| Field | Type | Rules / values |
|---|---|---|
| `id` | string | `IF-<IFCT code>` raw food, `IN-nnn` ingredient, `HR-nnnn` dish (recipe number). Unique. |
| `type` | string | `raw_food` (542), `ingredient` (251), `dish` (5,165). |
| `source` | string | `IFCT 2017 (NIN, ICMR)`, `Hindivine ingredient list`, `Hindivine recipe series`. |
| `name_en` | string | Required. |
| `name_hi` | string | Hindi name exactly as the tools display it (dictionary translation; dishes are translated word by word). Present for all 5,958. |
| `name_hi_roman` | string or null | IFCT's romanised Hindi name, e.g. "Aam (paka)". Raw foods only. |
| `local_names` | string or null | IFCT's full list of regional names. Raw foods only. |
| `category`, `subcategory` | string, string or null | IFCT food group; ingredient category; recipe category and sub-category. |
| `diet` | string | `vegan`, `vegetarian`, `eggetarian`, `non_veg`, as the Food Finder shows it. Raw foods and ingredients are only ever `vegetarian`, `eggetarian` or `non_veg` (the Food Finder does not mark plain plant foods as vegan); dishes use all four. |
| `diet_in_generator` | string | Raw foods and ingredients only: the diet the generator uses when adding this food to a chart. Here plant foods are `vegan`, and milk products, ghee, butter and honey are `vegetarian`. |
| `basis` | object | `{amount: 100, unit: "g"}` for raw foods and ingredients, `{amount: 1, unit: "serving"}` for dishes. All nutrition is for this amount. |
| `household_measures` | array | Ingredients: `{unit, grams, unit_of_weight}` e.g. `{cup, 190, g}`. Dishes: `{unit: "serving", text}`. Raw foods: empty (IFCT has none). There is no "katori" measure anywhere in the data. |
| `nutrition` | object | `kcal`, `protein_g`, `carbs_g`, `fat_g`, `fibre_g`, `sugar_g`, `sat_fat_g`, `cholesterol_mg`, `calcium_mg`, `iron_mg`, `sodium_mg`, `potassium_mg`, `vitamin_c_mg`. Numbers or null. Only IFCT raw foods have the extra nutrients; ingredients and dishes have the first five. |
| `ingredient_key` | string | Ingredients only: the internal key recipes use. |
| `recipe_id`, `best_for` | int, string[] | Dishes only: the recipe number and its meal times. |

Rules: carbs are **available carbohydrate** (fibre is separate), as in IFCT 2017. IFCT energy is converted from kJ
(kJ ÷ 4.184, rounded to whole kcal). Other IFCT values: macros, sugar and saturated fat to 1 decimal (g); iron to 1
decimal (mg); cholesterol, calcium, sodium, potassium and vitamin C to whole mg. Ingredient values
come from IFCT 2017 or USDA and are kept per 100 g raw (dry grains and dals are per 100 g dry). There is no Jain field
for foods (section 5.2 explains how Jain works for recipes).

## 5. Recipes (Recipe Book, `recipes.html`, `recipes.json`)

### 5.1 What a user can do

- **Meal-time tabs**: All, Early Morning, Breakfast, Mid-Morning, Lunch, Evening Snacks, Dinner, Bedtime, Desserts &
  Sweets, Accompaniments, Vrat / Fasting, each with its count.
- **Search** (all words must match) in the dish name, sub-category, category and ingredient names, and in the name as
  shown in the chosen language(s).
- **Filter** by category and diet (same rules as the Food Finder). **Sort** by name, most protein per 100 kcal, most
  protein, lowest calories, most fibre, quickest (prep + cook). 60 cards, then "Show more" adds 120. "Random recipe".
- **Recipe view**: description, serves, prep, cook, difficulty, diet, kcal/protein/carbs/fat/fibre per serving, meal
  times, ingredients with quantities, method, tips, serving ideas, storage. Previous / Next through the current list;
  "Copy recipe" copies it as text; Esc or the back button returns to the list.
- **Languages**: dish names, ingredients, quantities and headings are translated. Description, method steps, tips,
  serving ideas and storage stay in English.
- **Add / edit / delete recipes: not available.** Recipes are read-only in the tool.

### 5.2 Fields (`recipes.json` → `recipes[]`)

| Field | Type | Rules / values |
|---|---|---|
| `id` | int | Recipe number, 1-5165, unique and stable. `code` is the printed form `#0001`; `food_id` is `HR-0001` in `foods.json`. |
| `name_en`, `name_hi` | string | Unique English name; Hindi as displayed by the tools. |
| `category`, `subcategory` | string, string or null | 20 categories, e.g. "Breakfast" / "Chila". |
| `meal_times` | string[] | From: Early Morning, Breakfast, Mid-Morning, Lunch, Evening Snacks, Dinner, Bedtime, Desserts & Sweets, Accompaniments, Vrat / Fasting. The first is the main meal time. Set by rules in `recipe-pdfs/meals.py` (category plus name keywords). |
| `diet` | string | Derived from ingredients: `non_veg` if any chicken, mutton, fish or shellfish; else `eggetarian` if any egg; else `vegetarian` if any dairy or honey; else `vegan`. |
| `contains_food_groups` | string[] | Generator food groups present (section 6.3 lists them). `jain` means it contains onion, garlic or a root vegetable. |
| `jain_friendly` | bool | Derived for convenience: vegan or vegetarian, and no `jain` group. The tools themselves have no Jain flag; the generator handles Jain as "avoid the Jain group". |
| `regions` | string[] | `south`, `north`, `west`, `east`, from name keywords. |
| `servings`, `prep_min`, `cook_min`, `total_min` | int | `total_min` = prep + cook. |
| `difficulty` | string | `Easy` or `Medium`. |
| `description` | string | One or two sentences. |
| `ingredient_groups[]` | array | `{title, items[]}`; the title is "Ingredients" when there is one group. |
| `items[].food_id` | string or null | Links to `foods.json` (type `ingredient`). Null only for water and ice, which are not in the food list and have 0 kcal. |
| `items[].ingredient_key`, `name` | string | Internal key and English name. |
| `items[].amount`, `unit` | number or null, string | Amount for the **whole recipe**, in `g` (or `ml` for water, milk, soy milk, coconut milk, coconut water). Null for "to taste" / "as needed". |
| `items[].quantity_text` | string | Household quantity as shown, e.g. "1 cup (100 g)", "¼ tsp", "1 small (50 g)". |
| `items[].note` | string or null | Preparation note, e.g. "finely chopped", "cooked". |
| `items[].grams_used_for_nutrition` | number | Grams counted in the nutrition (raw weight). `cooked_to_raw_factor` is present when a cooked amount was converted. |
| `steps[]` | array | `{title, text}`, in order. |
| `tips`, `serving_ideas` | string[] | May be empty. |
| `storage` | string or null | |
| `nutrition_per_serving` | object | `kcal` (whole number), `protein_g`, `carbs_g`, `fat_g`, `fibre_g` (1 decimal): exactly what the tools show. |
| `nutrition_per_serving_exact` | object | Same, unrounded (4 decimals). |
| `image` | null | There are no recipe images. |
| `generator` | object | How the generator uses it: `auto_planner` (false = only offered in Add food / Swap), `pools`, `suitable_for_diet_types`, `texture_tags` (section 6.3). |

### 5.3 How recipe nutrition is calculated

```
for each ingredient with an amount:
    raw_g = amount × cooked_to_raw_factor   (factor = 1 unless the note says cooked and the food is a grain or dal)
    add raw_g / 100 × (kcal, protein, carbs, fat, fibre per 100 g of its food_id)
per serving = total ÷ servings
```

Ingredients without an amount ("salt to taste", "water as needed") count as 0. Water counts as 0. Cooked-to-raw
factors: rice, brown rice, red rice, basmati 0.36; foxtail, kodo, kutki, sama millet 0.33; quinoa 0.37; chana dal and
toor dal 0.4 (only for notes "cooked", "cooked thick", "cooked dal", "cooked and cooled"; toor with the note "cooked"
alone is not converted). The calculation is done once when the data is built; recomputing from the JSON files gives the
same values (checked for all 5,165 recipes, largest difference 0.00005).

**Worked example: #2034 Ragi Kali, serves 3**

| Ingredient | Amount | Counted (g) | kcal | Protein | Carbs | Fat | Fibre |
|---|---|---|---|---|---|---|---|
| Ragi flour (IN, 328 / 7.3 / 61 / 1.3 / 11 per 100 g) | 150 g | 150 | 492.0 | 10.95 | 91.50 | 1.95 | 16.50 |
| Rice (raw), note "cooked" (356 / 7 / 78 / 0.5 / 1.3) | 30 g | 30 × 0.36 = 10.8 | 38.45 | 0.76 | 8.42 | 0.05 | 0.14 |
| Water | 450 ml | 0 | 0 | 0 | 0 | 0 | 0 |
| Salt | to taste | 0 | 0 | 0 | 0 | 0 | 0 |
| Ghee (900 / 0 / 0 / 100 / 0) | 5 g | 5 | 45.0 | 0 | 0 | 5.00 | 0 |
| **Total ÷ 3 servings** | | | **191.8** | **3.9** | **33.3** | **2.3** | **5.5** |

Shown as 192 kcal, 3.9 g protein, 33.3 g carbs, 2.3 g fat, 5.5 g fibre per serving.

## 6. Diet Chart Generator (`diet-chart-generator.html`)

### 6.1 Inputs

All inputs are optional in the sense that each has a default; the chart is rebuilt on every change.

| Field (internal name) | Type | Allowed values | Default | Notes |
|---|---|---|---|---|
| Language (`lang`) | select | `en` + `hi bn mr te ta gu kn ml or pa ur as ar fr es de pt ru zh ja` | `en` | Whole page and chart. |
| Second language on the chart (`lang2`) | select | none, `en`, or any of the 20 | none | Shows a second line / second text in the chart. |
| Type of diet (`type`) | select | Weight loss: `general` General Weight Loss, `protein` High-Protein, `diabetes` Diabetes-Friendly, `pcos` PCOS, `thyroid` Thyroid-Friendly, `heart` Heart-Healthy, `glp1` GLP-1 Support. Medical and procedure: `liquid` Liquid Diet, `semi` Semi-Liquid Diet, `bariatric` Bariatric Surgery Diet, `allurion` Allurion Balloon Diet | `general` | Choosing `liquid` sets kcal 900 and protein 60; `semi` sets 1000 and 60. |
| Plan by (`goal`) | buttons | `kcal` Calories, `protein` Protein, `both` | `kcal` | Hidden for liquid / semi (always `both`); ignored for bariatric / allurion (targets come from the stage). |
| Calories a day (`kcal`) | slider | 600-3000, step 50 | 1400 | Hidden when Plan by = Protein and for bariatric / allurion. |
| Protein a day (`protein`) | slider | 40-190 g, step 5 | 100 | Shown for Protein and Both, and for liquid / semi. |
| Days since the procedure on Day 1 (`procDay`) | number | 1-120 | 1 | Bariatric / allurion only. |
| Diet (`diet`) | buttons | `veg` Vegetarian, `vegan` Vegan, `egg` Eggetarian, `nonveg` Non-Vegetarian | `veg` | |
| Start date (`start`) | date | any date or empty | empty | Only used to print dates on the chart. |
| Number of days (`days`) | number | 1-30 | 7 | Invalid input becomes 7. |
| Meals a day (`meals`) | select | 2, 3, 4, 5, 6, 7, 8 | 7 | Disabled for liquid / semi / procedure diets (their own pattern). |
| Lunch combination (`lunch`) | select | `mix` Mixed through the week, `roti` Dal or curry + roti + salad, `rice` Dal or curry + rice + salad, `sabzi` Dal or curry + sabzi + roti, `onepot` Khichdi or one-pot + raita / salad | `mix` | |
| Dinner combination (`dinner`) | select | `mix`, `soup` Soup + curry + roti, `roti` Curry or sabzi + roti, `onepot` Khichdi or one-pot + salad, `light` Soup + curry + salad (no grain) | `mix` | |
| Day-wise preferences (`dayPrefs[7]`) | 7 selects | `''` As selected, `veg` Vegetarian day, `egg` Eggetarian day, `nonveg` Non-veg day, `vrat` Fasting (vrat) day, `light` Light day (15% fewer kcal) | all `''` | Day *n* uses entry (n−1) mod 7, so the pattern repeats weekly. |
| Foods to prefer (`prefer`) | multi-select chips | the 25 group keys in 6.3 | none | A group cannot be both preferred and avoided. |
| Other foods to prefer (`preferText`) | text | comma-separated words, each 2+ letters | empty | |
| Foods to avoid (`avoid`) | multi-select chips | the 25 group keys | none | Use for allergies and intolerances (dairy, gluten, soy, peanuts, tree nuts, egg, fish…) and for Jain (`jain`). |
| Other foods to avoid (`avoidText`) | text | comma-separated words | empty | Matched in English only. |
| Prepared for (`who`) | text | up to 40 characters | empty | Printed on the chart. |
| (hidden) `seed` | int | starts at 1 | 1 | +1 on "New menu". |
| (hidden) `offset` | int | days already shown | 0 | Increased by "Next N days". |

There are **no** fields for age, sex, height, weight, activity, medical history, medicines or allergies as such.
Medical conditions are covered only by choosing the diet type; allergies only through "Foods to avoid".

### 6.2 Calculations

**No BMR, TDEE or water calculation exists in the generator.** The calorie target is entered directly by the dietitian.
Carbohydrate and fat are not targeted: they are whatever the chosen dishes contain. Water is fixed advice text
("Drink 2.5-3 litres of water a day unless your doctor has limited fluids", or "Sip water between meals" for liquid,
semi-liquid and procedure diets; the procedure stage texts mention 1.5-2 litres).

The repo does contain a reference implementation of body-based targets, used by the separate personal-plan PDF script
`recipe-pdfs/personal_plan.py` (not by any of the three web tools):

```
BMI   = weight_kg / (height_m)^2
BMR   = 10 × weight_kg + 6.25 × height_cm − 5 × age + (5 if male else −161)        (Mifflin-St Jeor)
TDEE  = BMR × activity      activity: sedentary 1.2, light 1.375, moderate 1.55
IBW   = (50 if male else 45.5) + 0.9 × (height_cm − 152.4)                         (Devine)
ABW   = IBW + 0.4 × (weight − IBW) if weight > IBW else weight                    (adjusted body weight)
kcal target    = max(1500 if male else 1200, round((TDEE − 650) / 50) × 50)
protein target = round(1.3 × ABW / 5) × 5  g
```
Example (made-up): woman, 40 y, 160 cm, 80 kg, sedentary → BMI 31.3; BMR 1,439; TDEE 1,727; kcal target
max(1200, round(21.5) × 50) = 1,200; IBW 52.3; ABW 63.4; protein 80 g.

**What the generator does calculate**

1. **Targets**
   - Plan by Calories: kcal = slider value; no protein target.
   - Plan by Protein: protein = slider value, and calories come from it:
     `share = 0.17 + (protein − 50) / 140 × 0.11;  kcal = max(1200, round(protein × 4 / share / 50) × 50)`
     (protein supplies 17% of energy at 50 g, rising to 28% at 190 g). Example: 120 g → share 0.225 → 120 × 4 / 0.225 =
     2,133 → **2,150 kcal**. 50 g → 1,200; 190 g → 2,700.
   - Both: kcal and protein = the two sliders.
   - **40% cap**: if protein × 4 > 40% of kcal, protein is lowered to `floor(kcal × 0.4 / 4 / 5) × 5` and a warning is
     shown. Example: 1,200 kcal with 150 g → capped to 120 g.
   - Light day: `kcal = round(kcal × 0.85 / 10) × 10` (regular diets only). Example: 1,500 → 1,280.
   - Bariatric / Allurion: kcal and protein come from the stage for that day: stage day = procDay + chart day − 1.

     | Diet | Days | Stage | kcal | Protein |
     |---|---|---|---|---|
     | Bariatric | 1-2 | Clear liquids | fluids only | – |
     | | 3-14 | Full liquids | 600 | 60 g |
     | | 15-28 | Semi-liquid (pureed) | 800 | 60 g |
     | | 29-56 | Soft foods | 900 | 65 g |
     | | 57+ | Regular small meals | 1,100 | 70 g |
     | Allurion | 1-3 | Full liquids | 800 | 60 g |
     | | 4-7 | Semi-liquid | 900 | 60 g |
     | | 8-14 | Soft foods | 1,000 | 65 g |
     | | 15+ | Regular small meals | 1,200 | 70 g |

2. **Meal-time shares of the day's calories** (regular diets):

   | Meals | Slots (time, share) |
   |---|---|
   | 2 | Lunch 12:30 PM 0.55 · Dinner 7:30 PM 0.45 |
   | 3 | Breakfast 8:30 AM 0.30 · Lunch 1:30 PM 0.40 · Dinner 7:30 PM 0.30 |
   | 4 | Breakfast 8:30 0.25 · Lunch 1:30 0.35 · Evening Snack 4:30 PM 0.12 · Dinner 7:30 0.28 |
   | 5 | Breakfast 8:30 0.25 · Mid-Morning 11:00 0.10 · Lunch 1:30 0.30 · Evening Snack 4:30 0.10 · Dinner 7:30 0.25 |
   | 6 | Early Morning 6:30 0.02 · Breakfast 8:30 0.23 · Mid-Morning 11:00 0.10 · Lunch 1:30 0.30 · Evening Snack 4:30 0.10 · Dinner 7:30 0.25 |
   | 7 | Early Morning 6:30 0.02 · Breakfast 8:30 0.24 · Mid-Morning 11:00 0.08 · Lunch 1:30 0.30 · Evening Snack 4:30 0.10 · Dinner 7:30 0.22 · Bedtime 9:30 0.04 |
   | 8 | Early Morning 6:30 0.02 · Breakfast 8:30 0.20 · Mid-Morning 11:00 0.08 · Lunch 1:30 0.27 · Afternoon Snack 3:30 0.08 · Evening Snack 5:30 0.08 · Dinner 8:00 0.23 · Bedtime 9:30 0.04 |
   | Procedure (soft / regular stages) | Breakfast 8:00 0.22 · Mid-Morning 10:30 0.14 · Lunch 1:00 0.26 · Evening 4:00 0.14 · Dinner 7:00 0.24 |
   | Liquid | 8 feeds, 1/8 each: 7:00 Early Morning drink, 9:00 Breakfast drink, 11:00 soup, 1:00 PM thin dal/rasam/kadhi, 3:00 drink, 5:00 soup, 7:00 thin dal, 9:00 drink |
   | Semi-liquid | 7:00 drink 0.08 · 8:30 porridge 0.20 · 11:00 drink 0.10 · 1:00 dal + khichdi 0.24 · 4:00 raita or soup 0.10 · 7:00 soup + dal or khichdi 0.22 · 9:00 drink 0.06 |

3. **Portions (the "fit")**. Every recipe item is in recipe servings, in quarters (¼, ½, ¾, 1, 1¼…).
   - Limits: regular diets 0.5 to `2 + max(0, (kcal − 1800) / 1800)` servings, rounded down to a quarter;
     GLP-1 1.5 max; liquid, semi-liquid and procedure diets 0.25 to 1.5.
   - Fixed items are not scaled: the early-morning drink (1 serving), bedtime item, protein add-ons, clear feeds.
   - Add-on calories are taken out first: `scale = max(0.4, (kcal − add-on kcal) / kcal)` (1 if no add-ons).
   - Each meal: `m = kcal × share × scale / (sum of 1-serving kcal of its scalable dishes)`; every dish in the meal gets
     `round(m × 4) / 4`, clamped to the limits.
   - Then, up to 60 times: if the day total is more than 2.5% from target, move one dish by ±¼ serving, choosing the
     dish whose ¼ serving brings the total closest to target; stop when within 2.5% or no move helps.
4. **Protein top-up** (when there is a protein target): up to 16 times, while protein < 97% of target:
   - Candidates are the add-ons allowed for the day's diet (each at most twice a day), sorted by protein per kcal.
     Only those with at least 70% of the best ratio (80% if the day is under 1,200 kcal) are kept, top 4.
   - If more than 12 g is still needed, rotate through them by (day index + round) mod n; otherwise take the one whose
     protein is closest to what is still needed.
   - Put it in its usual meal if the day has that meal, otherwise in the meal (not early morning) with the fewest add-ons.
     Liquid, semi-liquid and soft days use only the add-ons allowed for that texture and always the meal with the fewest.
   - Refit portions (step 3).

   Add-ons (per portion in the name): Pea protein 30 g scoop 120 kcal 24 g (vegan) · Whey protein 30 g scoop 120 / 24
   (veg, egg, non-veg) · Grilled chicken breast 100 g 165 / 31 · Grilled fish 100 g 128 / 26 · 4 boiled egg whites 69 /
   14.4 · Low-fat hung curd 150 g 89 / 15.3 · Low-fat lassi (150 g hung curd) 89 / 15.3 · Soya chunks 25 g dry 86 / 13 ·
   Firm tofu 100 g 144 / 17.3 · 2 boiled whole eggs 155 / 12.6 · Unsweetened soy milk 250 ml 83 / 8.3 · Skimmed milk
   250 ml 85 / 8.5 · Roasted chana 30 g 111 / 6.8. Their carbs, fat and fibre are fixed values in the code; all of these
   are in `diet-chart-generator-data.json` (`addons`) apart from the lassi, which is defined only in the page script.
5. **Totals and status**: day totals are the sums of (per-serving value × servings). A day is **On target** when kcal
   is within ±5% of the day's target and protein is at least 95% of the protein target; otherwise it shows "check" with
   the totals. Clear-liquid days show "Fluids day".
6. **Rounding on screen**: kcal in rows and all totals are whole numbers; protein, carbs, fat and fibre in rows have 1
   decimal; the summary tiles show the average per day as whole numbers.

**Worked example** (the sample in 6.6, Day 1: Diabetes-Friendly, 1,500 kcal, 80 g protein, vegetarian, 5 meals):

| Meal | Share | Target | Dishes (kcal per serving) | Sum | m | First portion |
|---|---|---|---|---|---|---|
| Breakfast | 0.25 | 375 | Beetroot Quinoa Chila 257.1 | 257.1 | 1.46 | 1½ |
| Mid-Morning | 0.10 | 150 | Pear Ragi Smoothie 139.8 | 139.8 | 1.07 | 1 |
| Lunch | 0.30 | 450 | Bengali Rajma 226.3, Makki di Roti 325.6, Quinoa Cucumber Tomato Salad 181.0 | 732.9 | 0.61 | ½ each |
| Evening Snack | 0.10 | 150 | Spinach Cauliflower Soup 74.4 | 74.4 | 2.02 | 2 |
| Dinner | 0.25 | 375 | Quinoa Vegetable Soup 113.9, Bhindi Masala (Dry) 94.7, Moringa Foxtail Roti 288.1 | 496.7 | 0.75 | ¾ each |

- First total 1,413 kcal is 5.8% under 1,500, so the adjustment loop adds ¼ serving of Makki di Roti (+81.4) → 1,494.6 kcal,
  within 2.5%. Protein is 54.1 g, below 97% of 80 g.
- Protein band: 80 × 4 / 1,500 = 21.3% of energy → band "mid" (no narrowing of the dish pools).
- Top-up round 1: 25.9 g still needed (> 12), so the first candidate is used: Whey protein (24 g, 120 kcal) into
  Mid-Morning; portions refit. Round 2: under 12 g needed, so the add-on closest to the remaining need is used: Soya
  chunks (13 g) into Lunch; portions refit.
- Final Day 1: 1,536 kcal, 85.9 g protein → On target (within ±5% and ≥ 95%). These steps were re-run inside the
  shipped page and give exactly the chart it produced.

### 6.3 Rules: how meals and items are chosen

**Recipe flags** (precomputed per recipe, in `diet-chart-generator-data.json` → `recs`, and in `recipes.json` → `generator`):

- **Pools** (which meal role a recipe can fill):
  - `early`: tagged Early Morning.
  - `breakfast`: main meal time Breakfast; not a drink, chutney or sweet.
  - `mid`: Mid-Morning tag, ≤ 220 kcal.
  - `main`: dal / legume curry / paneer & vegetable curry / chicken / fish / mutton / egg dish, eaten at lunch or dinner.
  - `sabzi`: Dry Sabzi.
  - `roti`: Roti, Bhakri / Millet Roti, Paratha, Thepla.
  - `rice`: Pulao, Khichdi, Flavoured Rice.
  - `onepot`: Khichdi, Biryani.
  - `salad`: Salads & Raita.
  - `soup`: Soups.
  - `evening`: Evening Snacks tag in snack, soup, salad, sandwich, drink or poha/upma categories, ≤ 260 kcal.
  - `bedtime`: Bedtime tag.
  - `eggbf`: egg dishes for breakfast.
  - `nvmain`: chicken, fish, mutton.
- **Suitable for diet type**:
  - **All types** exclude fried dishes (pakora, puri, samosa, vada… unless baked / air-fried / steamed), Healthy Sweets,
    dishes with ≥ 4 g added sugar per serving, dishes under 15 kcal, and juices. General allows juices only if they
    have under 40 g fruit.
  - **Diabetes, PCOS** additionally exclude: any added sugar (≥ 1 g), ≥ 40 g sweet fruit, ≥ 20 g refined grains (white
    rice, rava, bread, noodles, sabudana…), ≥ 50 g potato, and any juice.
  - **Heart** additionally excludes: saturated fat > 3 g, salty ingredients (butter, cheese, soy sauce, bread), fat > 12 g, and
    mutton.
  - **GLP-1** (also used for bariatric and allurion) additionally excludes: fat > 12 g and saturated fat > 4 g.
  - **Thyroid** additionally excludes: ≥ 15 g soy.
  - **High-Protein, PCOS, GLP-1** (and bariatric / allurion, which use the GLP-1 rules): the breakfast, main, evening,
    mid and sabzi pools are cut to the most protein-dense 40% (PCOS 60%), at least 12 dishes. Liquid and semi-liquid
    diets use the General rules.
- **Texture tags**: `liquid`, `semi`, `soft`, `porridge`, `khichdi`, `sdal` (dals), `raita`, `ldrink` (drinks), `lsoup`
  (soups), `lthin` (rasam, kadhi), `vrat` (no onion, garlic, hing, besan, sattu, or grains and pulses other than sama,
  kuttu, rajgira, singhara, sabudana, makhana), `nosugar` (< 1 g added sugar), `lowfat` (fat ≤ 12 g, saturated fat
  ≤ 4 g, not fried).
- **Food groups** (for prefer / avoid; matched on ingredients unless noted):
  - `onion` Onion & garlic
  - `jain` (onion, garlic, shallot, spring onion, potato, carrot, beetroot, radish, sweet potato, arbi, suran, turnip,
    ginger, lotus stem, raw banana)
  - `dairy`, `gluten` (wheat), `soy` Soy & tofu, `peanut`, `nuts` Tree nuts, `egg`, `chicken`, `fish` Fish & seafood,
    `mutton`
  - `potato`, `brinjal`, `mushroom`, `paneer`, `coconut`, `rice` Rice & poha, `millets`, `oats`
  - `pulses` Dals, beans & sprouts, `greens` Leafy greens
  - Regions, matched on dish-name keywords: `south` South Indian, `north` North Indian, `west` Gujarati & Maharashtrian,
    `east` Bengali & Odia.

**Building one day** (regular texture):

1. **Diet for the day**: the chosen diet, changed by the day preference:
   - `veg` and `egg` lower it to vegetarian or eggetarian (vegan stays vegan).
   - `nonveg` raises it to non-veg.
   - `vrat` makes it vegetarian (vegan stays vegan) and uses only `vrat`-tagged dishes.
   - `light` lowers the calories by 15%.
2. **Day rotation** (day index *d* counted from 0 in this chart):
   - On eggetarian and non-veg diets, days with d mod 7 ∈ {1, 3, 6} are egg days (egg breakfast). On non-veg diets,
     days with d mod 7 ∈ {0, 2, 4, 5} are meat/fish days. A `nonveg` / `egg` day preference forces that day type.
   - Lunch "mix" rotates roti → rice → sabzi by d mod 3.
   - Dinner "mix" is soup for d mod 3 ∈ {0, 1} and one-pot for 2.
   - The dinner main is `sabzi` on even days and `main` on odd days. On meat/fish days, lunch on even days and dinner
     on odd days use `nvmain`.
3. **Components per meal**:

   | Meal | Components |
   |---|---|
   | Early Morning | 1 `early` dish, fixed at 1 serving. |
   | Breakfast | `eggbf` on egg days, else `breakfast`. |
   | Mid-Morning, Afternoon | `mid`. |
   | Lunch | roti: main + roti + salad · rice: main + rice + salad · sabzi: main + sabzi + roti · one-pot: onepot + salad. |
   | Evening | `evening`. |
   | Dinner | soup: soup + main + roti · roti: main + roti · one-pot: onepot + salad · light: soup + main (a curry, never dry sabzi) + salad. |
   | Bedtime | one fixed drink, rotating by day number. The list is filtered by diet and diet type: toned milk is not for Heart, soy milk is not for Thyroid, and no cow's milk options if Dairy is avoided. |

4. **Picking a dish** for a component:
   - Start from the pool and keep dishes that are allowed for the day's diet, suitable for the diet type, `nosugar` for
     liquid / semi / procedure diets, `lowfat` for procedure diets, `vrat` on fasting days, and contain no avoided group
     or avoided word. Avoided words are checked in the dish name and its ingredient names, English only.
   - With a protein target, narrow the pool by protein density (protein × 4 / kcal) using the **band**
     `ratio = protein × 4 / kcal`. For non-veg diets, subtract 0.05 at lunch and dinner and 0.02 elsewhere.

     | Band | Ratio | Pool kept (sorted by protein density, densest first) |
     |---|---|---|
     | vlow | < 18% | the less protein-dense 40% |
     | low | 18-20% | the less dense 60% |
     | mid | 20-22% | all |
     | high | 22-25% | the densest 50% |
     | max | ≥ 25% | the densest 30% |

     Each band always keeps at least 8 dishes. Early, bedtime and drink pools are never narrowed.
   - Prefer dishes not yet used anywhere in this chart (or in the days shown before "Next N days").
   - If preferences are set and some candidates match a preferred group or word, choose among those 80% of the time.
   - Choose at random with a **seeded random generator**: the same settings always give the same chart.
     Seed text: `type-goal-kcal-protein-diet-seed-offset-procDay`.
   - Fall-backs: if no `nvmain`, use `main`; if no `eggbf`, use `breakfast`; if no `onepot`, use `rice`. On a vrat day,
     an empty breakfast / lunch / dinner uses a vrat breakfast dish, and if still empty, "Fruit bowl: papaya, apple or
     guava (150 g) with roasted makhana (15 g)" (130 kcal). An empty early morning or bedtime slot uses "Warm water with
     lemon" or "Chamomile or tulsi tea".
5. Fit portions (6.2 step 3), then top up protein (step 4).

**Texture diets**:
- **Liquid**: 8 feeds from drinks, soups and thin dals.
- **Semi-liquid**: the pattern in 6.2.
- **Soft** (procedure stage): breakfast alternates porridge and breakfast dishes; mid-morning is a drink; lunch is dal +
  (khichdi or a main) + raita; evening is soup; dinner is soup + (khichdi or dal). Dishes must be soft-tagged (or
  semi-tagged if no soft dish fits).
- **Clear liquids**: a fixed list of 8 feeds (lemon water, strained soup, coconut water, dal water, electrolyte water,
  jeera or chamomile water) with no recipes.
- Chart notes on dishes: "blend smooth" on liquid days and "mash or blend" on semi-liquid days.

**Buttons that change the menu**:
- **Next N days** continues the day numbers and excludes every dish used so far.
- **New menu** changes the seed for the same days.
- **Back to Day 1** resets the offset.
- Any change of a setting rebuilds the chart from Day 1. Changing the language or the "Prepared for" name only redraws
  the current chart.

**What the dietitian can change by hand ("Edit menu")**:
- **− / +** changes a portion by ¼ (minimum ¼). Totals and status update; other portions are not refitted.
- **Swap** shows up to 12 dishes of the same category, allowed for the diet and not in an avoided group (avoided
  *words* are not checked here), sorted by closeness to the current item's kcal. The new dish gets the portion with the
  same calories (in quarters, max 3 servings). A per-100 g food swaps for foods of similar kcal (max 500 g).
- **×** removes an item.
- **+ Add food** per meal offers:
  - 12 suggestions for that meal's pool (not already in that day).
  - A search over all recipes (up to 15) and per-100 g foods (up to 10), in English or the chosen language.
  - "Add your own item": name and kcal required; amount text, protein, carbs, fat and fibre optional (default 0).
- **Undo my changes** rebuilds the generated menu.
- Hand edits are **not saved**: they are lost on reload or when any setting other than language or name changes.

### 6.4 Output

The chart is an A4-styled page:

1. **Header**: logo and series: WEIGHT LOSS / PROTEIN / THERAPEUTIC / BARIATRIC / ALLURION BALLOON DIET CHART.
2. **Title block**:
   - Diet type name (or "<protein> g Protein Diet" / "General Weight Loss").
   - Chips: protein, kcal, diet, days.
   - A one-line description and "Best for" text.
   - A side figure: the calorie or protein target, or "Day N after the procedure".
3. "Prepared for <name> · From <date> to <date>" when set.
4. **Five tiles**: average kcal, protein, carbs, fibre and fat per day.
5. **Target check** line.
6. **How to use this chart** box: preferred foods used, foods left out, water advice.
7. **Diet stages** table (procedure diets only).
8. **Your days at a glance**: breakfast, lunch, dinner, kcal and protein per day.
9. **One table per day**:
   - Header: day number, date, tags (stage, fasting day, light day, diet day) and the day's kcal and protein with
     On target / check.
   - Columns: Time, Meal, What to eat (recipe name with its #number; protein add-ons marked +), Portion, kcal, Protein,
     Carbs, Fat, Fibre.
   - A Day total row with the day's target.
10. **Guidelines for this plan**: Do / Limit or avoid, by diet type.
11. A **question section**: "Is 1,400 kcal right for me?" or "Is 80 g of protein right for me?", with general guidance.
12. **Disclaimer**.
13. **Our Services** page:
    - Dr Rajat Goel, Bariatric Surgeon.
    - GLP-1 weight-loss injections.
    - Service list.
    - App download band (text only, no links).
14. **Footer**: www.hindivine.com · app@hindivine.com · Hindivine Healthcare Private Limited.

**Print / download / share**:
- **Print / Save as PDF** calls the browser's print dialog. Print CSS sets A4, 10 mm margins, hides the controls, starts
  every other day on a new page, and keeps colours. The PDF is made by the browser; the page does not create files itself.
- **Known print bug (current version):** each day table has a minimum width of 760 px, but an A4 page with 10 mm
  margins leaves about 644 px for it, so the **Carbs, Fat and Fibre columns are cut off on paper and in the saved PDF**
  (see `sample-diet-chart.pdf`). On screen all columns show. Fix: allow the table to shrink in print, e.g.
  `@media print { .daytbl { min-width: 0 } }` with slightly smaller print text. It was left unfixed so that this handover is
  exactly the current version.
- **Copy chart as text** copies a plain-text version (title, targets, one line per meal) for WhatsApp or email.
- There is no direct share, email, WhatsApp API, server save or patient history.

### 6.5 Languages

20 languages: Hindi, Bengali, Marathi, Telugu, Tamil, Gujarati, Kannada, Malayalam, Odia, Punjabi, Urdu, Assamese,
Arabic, French, Spanish, German, Portuguese, Russian, Chinese, Japanese.
- **UI text**: looked up whole-string from `i18n/<code>.json` → `t`, with `{0}` number placeholders.
- **Food names**: looked up from `f`.
- **Dish names**: translated word by word from `w`, for the 12 Indian languages only. Other languages keep dish names
  in English.
- **Script direction**: Urdu and Arabic switch the page to right-to-left.
- **Second language**: shows each item in both languages.
- **Quality**: translations are machine-made and have not been reviewed by native speakers.

### 6.6 Sample input and full output

Captured by setting these inputs in the shipped `diet-chart-generator.html` and reading the chart it produced (same
data as `sample-diet-chart.json`; the printed version is `sample-diet-chart.pdf`). "Sample Patient" is a made-up name.
`per_unit` is per recipe serving (or per the portion named in the item for add-ons); `multiplier` is the number of
servings; `amount` is per_unit × multiplier.

**Input**

```json
{
  "type": "diabetes",
  "goal": "both",
  "kcal": 1500,
  "protein": 80,
  "diet": "veg",
  "start": "2026-11-02",
  "days": 2,
  "procDay": 1,
  "meals": 5,
  "lunch": "mix",
  "dinner": "mix",
  "dayPrefs": ["", "light", "", "", "", "", ""],
  "prefer": ["millets"],
  "avoid": ["mushroom"],
  "preferText": "",
  "avoidText": "karela",
  "who": "Sample Patient",
  "seed": 1,
  "offset": 0,
  "lang": "en",
  "lang2": ""
}
```

**Output**

```json
{
  "header": {
    "series": "PROTEIN DIET CHART",
    "title": "Diabetes-Friendly Weight Loss",
    "chips": ["80 G PROTEIN / DAY", "1,500 KCAL / DAY", "VEGETARIAN", "2 DAYS"],
    "lead": "Low-GI, high-fibre meals with no added sugar to support weight loss and blood-sugar control.",
    "best_for": "Adults with type 2 diabetes or prediabetes who need to lose weight. People with high fasting sugar or HbA1c.",
    "prepared_line": "Prepared for Sample Patient · From 2 Nov 2026 to 3 Nov 2026"
  },
  "summary": {
    "averages_per_day": {"kcal": 1398, "protein_g": 84, "carbs_g": 165, "fibre_g": 38, "fat_g": 37},
    "target_check": "Target check: all 2 days are within 5% of the calorie target and meet the protein target."
  },
  "how_to_use": [
    "Each dish is a Hindivine recipe; the number after it (for example #0123) is its number in the Hindivine Healthy Recipe Series.",
    "\"1 serving\" means one serving as described in that recipe; calories and protein are given for the portion shown.",
    "Items marked + are simple protein add-ons that top up the day's protein.",
    "Preferred foods used where possible: Millets",
    "Foods left out: Mushroom, karela",
    "Drink 2.5-3 litres of water a day unless your doctor has limited fluids."
  ],
  "days": [
    {
      "day": 1,
      "date": "2 Nov 2026",
      "diet_for_day": "veg",
      "day_preference": null,
      "target": {"kcal": 1500, "protein_g": 80},
      "texture": "regular",
      "meals": [
        {
          "slot": "breakfast",
          "time": "8:30 AM",
          "label": "Breakfast",
          "kcal_share": 0.25,
          "items": [
            {
              "type": "recipe",
              "name": "Beetroot Quinoa Chila",
              "recipe_id": 2068,
              "recipe_code": "#2068",
              "per_unit": {"kcal": 257.1, "protein_g": 9.5, "carbs_g": 34.9, "fat_g": 8.4, "fibre_g": 5.7},
              "unit": "1 recipe serving",
              "multiplier": 1.25,
              "portion_text": "1¼ servings",
              "amount": {"kcal": 321, "protein_g": 11.9, "carbs_g": 43.6, "fat_g": 10.5, "fibre_g": 7.1}
            }
          ]
        },
        {
          "slot": "mid",
          "time": "11:00 AM",
          "label": "Mid-Morning",
          "kcal_share": 0.1,
          "items": [
            {
              "type": "recipe",
              "name": "Pear Ragi Smoothie",
              "recipe_id": 5128,
              "recipe_code": "#5128",
              "per_unit": {"kcal": 139.8, "protein_g": 4.7, "carbs_g": 19.4, "fat_g": 3.9, "fibre_g": 3.2},
              "unit": "1 recipe serving",
              "multiplier": 1,
              "portion_text": "1 serving",
              "amount": {"kcal": 140, "protein_g": 4.7, "carbs_g": 19.4, "fat_g": 3.9, "fibre_g": 3.2}
            },
            {
              "type": "protein_add_on",
              "name": "Whey protein, 1 scoop (30 g) in water or skimmed milk",
              "recipe_id": null,
              "recipe_code": null,
              "per_unit": {"kcal": 120, "protein_g": 24, "carbs_g": 3, "fat_g": 1.5, "fibre_g": 0},
              "unit": "portion named in the item",
              "multiplier": 1,
              "portion_text": "as listed",
              "amount": {"kcal": 120, "protein_g": 24, "carbs_g": 3, "fat_g": 1.5, "fibre_g": 0}
            }
          ]
        },
        {
          "slot": "lunch",
          "time": "1:30 PM",
          "label": "Lunch",
          "kcal_share": 0.3,
          "items": [
            {
              "type": "recipe",
              "name": "Bengali Rajma",
              "recipe_id": 1296,
              "recipe_code": "#1296",
              "per_unit": {"kcal": 226.3, "protein_g": 12.5, "carbs_g": 21.5, "fat_g": 4.6, "fibre_g": 14.4},
              "unit": "1 recipe serving",
              "multiplier": 0.5,
              "portion_text": "½ serving",
              "amount": {"kcal": 113, "protein_g": 6.3, "carbs_g": 10.8, "fat_g": 2.3, "fibre_g": 7.2}
            },
            {
              "type": "recipe",
              "name": "Makki di Roti",
              "recipe_id": 148,
              "recipe_code": "#0148",
              "per_unit": {"kcal": 325.6, "protein_g": 7.2, "carbs_g": 58.4, "fat_g": 7, "fibre_g": 5.6},
              "unit": "1 recipe serving",
              "multiplier": 0.5,
              "portion_text": "½ serving",
              "amount": {"kcal": 163, "protein_g": 3.6, "carbs_g": 29.2, "fat_g": 3.5, "fibre_g": 2.8}
            },
            {
              "type": "recipe",
              "name": "Quinoa Cucumber Tomato Salad",
              "recipe_id": 2918,
              "recipe_code": "#2918",
              "per_unit": {"kcal": 181, "protein_g": 6.2, "carbs_g": 27.9, "fat_g": 5, "fibre_g": 4.1},
              "unit": "1 recipe serving",
              "multiplier": 0.5,
              "portion_text": "½ serving",
              "amount": {"kcal": 91, "protein_g": 3.1, "carbs_g": 14, "fat_g": 2.5, "fibre_g": 2.1}
            },
            {
              "type": "protein_add_on",
              "name": "Soya chunks, 25 g dry (boiled, added to sabzi or pulao)",
              "recipe_id": null,
              "recipe_code": null,
              "per_unit": {"kcal": 86, "protein_g": 13, "carbs_g": 5.3, "fat_g": 0.1, "fibre_g": 3.3},
              "unit": "portion named in the item",
              "multiplier": 1,
              "portion_text": "as listed",
              "amount": {"kcal": 86, "protein_g": 13, "carbs_g": 5.3, "fat_g": 0.1, "fibre_g": 3.3}
            }
          ]
        },
        {
          "slot": "evening",
          "time": "4:30 PM",
          "label": "Evening Snack",
          "kcal_share": 0.1,
          "items": [
            {
              "type": "recipe",
              "name": "Spinach Cauliflower Soup",
              "recipe_id": 4675,
              "recipe_code": "#4675",
              "per_unit": {"kcal": 74.4, "protein_g": 4, "carbs_g": 6.3, "fat_g": 3.2, "fibre_g": 3.7},
              "unit": "1 recipe serving",
              "multiplier": 1.75,
              "portion_text": "1¾ servings",
              "amount": {"kcal": 130, "protein_g": 7, "carbs_g": 11, "fat_g": 5.6, "fibre_g": 6.5}
            }
          ]
        },
        {
          "slot": "dinner",
          "time": "7:30 PM",
          "label": "Dinner",
          "kcal_share": 0.25,
          "items": [
            {
              "type": "recipe",
              "name": "Quinoa Vegetable Soup",
              "recipe_id": 1627,
              "recipe_code": "#1627",
              "per_unit": {"kcal": 113.9, "protein_g": 3.7, "carbs_g": 15.1, "fat_g": 3.7, "fibre_g": 3.3},
              "unit": "1 recipe serving",
              "multiplier": 0.75,
              "portion_text": "¾ serving",
              "amount": {"kcal": 85, "protein_g": 2.8, "carbs_g": 11.3, "fat_g": 2.8, "fibre_g": 2.5}
            },
            {
              "type": "recipe",
              "name": "Bhindi Masala (Dry)",
              "recipe_id": 361,
              "recipe_code": "#0361",
              "per_unit": {"kcal": 94.7, "protein_g": 3.3, "carbs_g": 9.2, "fat_g": 3.9, "fibre_g": 5.5},
              "unit": "1 recipe serving",
              "multiplier": 0.75,
              "portion_text": "¾ serving",
              "amount": {"kcal": 71, "protein_g": 2.5, "carbs_g": 6.9, "fat_g": 2.9, "fibre_g": 4.1}
            },
            {
              "type": "recipe",
              "name": "Moringa Foxtail Roti",
              "recipe_id": 3664,
              "recipe_code": "#3664",
              "per_unit": {"kcal": 288.1, "protein_g": 9.5, "carbs_g": 42.6, "fat_g": 7.2, "fibre_g": 5.8},
              "unit": "1 recipe serving",
              "multiplier": 0.75,
              "portion_text": "¾ serving",
              "amount": {"kcal": 216, "protein_g": 7.1, "carbs_g": 32, "fat_g": 5.4, "fibre_g": 4.4}
            }
          ]
        }
      ],
      "totals": {"kcal": 1536, "protein_g": 86, "carbs_g": 186, "fat_g": 41, "fibre_g": 43},
      "status": {"code": "ok", "text": "On target"}
    },
    {
      "day": 2,
      "date": "3 Nov 2026",
      "diet_for_day": "veg",
      "day_preference": "light",
      "target": {"kcal": 1280, "protein_g": 80},
      "texture": "regular",
      "meals": [
        {
          "slot": "breakfast",
          "time": "8:30 AM",
          "label": "Breakfast",
          "kcal_share": 0.25,
          "items": [
            {
              "type": "recipe",
              "name": "Foxtail Millet Idli",
              "recipe_id": 28,
              "recipe_code": "#0028",
              "per_unit": {"kcal": 317.6, "protein_g": 13.1, "carbs_g": 50.5, "fat_g": 4.6, "fibre_g": 7.8},
              "unit": "1 recipe serving",
              "multiplier": 0.75,
              "portion_text": "¾ serving",
              "amount": {"kcal": 238, "protein_g": 9.8, "carbs_g": 37.9, "fat_g": 3.5, "fibre_g": 5.9}
            }
          ]
        },
        {
          "slot": "mid",
          "time": "11:00 AM",
          "label": "Mid-Morning",
          "kcal_share": 0.1,
          "items": [
            {
              "type": "recipe",
              "name": "Guava Ragi Smoothie",
              "recipe_id": 5085,
              "recipe_code": "#5085",
              "per_unit": {"kcal": 137.9, "protein_g": 6, "carbs_g": 15.8, "fat_g": 4.4, "fibre_g": 4.1},
              "unit": "1 recipe serving",
              "multiplier": 0.75,
              "portion_text": "¾ serving",
              "amount": {"kcal": 103, "protein_g": 4.5, "carbs_g": 11.9, "fat_g": 3.3, "fibre_g": 3.1}
            }
          ]
        },
        {
          "slot": "lunch",
          "time": "1:30 PM",
          "label": "Lunch",
          "kcal_share": 0.3,
          "items": [
            {
              "type": "recipe",
              "name": "Moringa Leaf Toor Dal",
              "recipe_id": 2471,
              "recipe_code": "#2471",
              "per_unit": {"kcal": 161.1, "protein_g": 9.6, "carbs_g": 19.5, "fat_g": 3.1, "fibre_g": 6.2},
              "unit": "1 recipe serving",
              "multiplier": 0.5,
              "portion_text": "½ serving",
              "amount": {"kcal": 81, "protein_g": 4.8, "carbs_g": 9.8, "fat_g": 1.6, "fibre_g": 3.1}
            },
            {
              "type": "recipe",
              "name": "Quinoa Lobia Pulao",
              "recipe_id": 4486,
              "recipe_code": "#4486",
              "per_unit": {"kcal": 368.9, "protein_g": 15.3, "carbs_g": 54.9, "fat_g": 8.5, "fibre_g": 8.1},
              "unit": "1 recipe serving",
              "multiplier": 0.5,
              "portion_text": "½ serving",
              "amount": {"kcal": 184, "protein_g": 7.7, "carbs_g": 27.5, "fat_g": 4.3, "fibre_g": 4.1}
            },
            {
              "type": "recipe",
              "name": "Tofu Salad",
              "recipe_id": 591,
              "recipe_code": "#0591",
              "per_unit": {"kcal": 113, "protein_g": 9.8, "carbs_g": 6, "fat_g": 6.3, "fibre_g": 2.1},
              "unit": "1 recipe serving",
              "multiplier": 0.5,
              "portion_text": "½ serving",
              "amount": {"kcal": 57, "protein_g": 4.9, "carbs_g": 3, "fat_g": 3.2, "fibre_g": 1.1}
            },
            {
              "type": "protein_add_on",
              "name": "Low-fat hung curd / Greek yogurt, 150 g",
              "recipe_id": null,
              "recipe_code": null,
              "per_unit": {"kcal": 89, "protein_g": 15.3, "carbs_g": 5.4, "fat_g": 0.6, "fibre_g": 0},
              "unit": "portion named in the item",
              "multiplier": 1,
              "portion_text": "as listed",
              "amount": {"kcal": 89, "protein_g": 15.3, "carbs_g": 5.4, "fat_g": 0.6, "fibre_g": 0}
            },
            {
              "type": "protein_add_on",
              "name": "Soya chunks, 25 g dry (boiled, added to sabzi or pulao)",
              "recipe_id": null,
              "recipe_code": null,
              "per_unit": {"kcal": 86, "protein_g": 13, "carbs_g": 5.3, "fat_g": 0.1, "fibre_g": 3.3},
              "unit": "portion named in the item",
              "multiplier": 1,
              "portion_text": "as listed",
              "amount": {"kcal": 86, "protein_g": 13, "carbs_g": 5.3, "fat_g": 0.1, "fibre_g": 3.3}
            }
          ]
        },
        {
          "slot": "evening",
          "time": "4:30 PM",
          "label": "Evening Snack",
          "kcal_share": 0.1,
          "items": [
            {
              "type": "recipe",
              "name": "Pudina Baby Corn Tikka",
              "recipe_id": 4814,
              "recipe_code": "#4814",
              "per_unit": {"kcal": 142.5, "protein_g": 7.5, "carbs_g": 11.8, "fat_g": 6.2, "fibre_g": 4.9},
              "unit": "1 recipe serving",
              "multiplier": 0.75,
              "portion_text": "¾ serving",
              "amount": {"kcal": 107, "protein_g": 5.6, "carbs_g": 8.9, "fat_g": 4.7, "fibre_g": 3.7}
            }
          ]
        },
        {
          "slot": "dinner",
          "time": "7:30 PM",
          "label": "Dinner",
          "kcal_share": 0.25,
          "items": [
            {
              "type": "recipe",
              "name": "Spinach Broccoli Soup",
              "recipe_id": 4674,
              "recipe_code": "#4674",
              "per_unit": {"kcal": 81.9, "protein_g": 4.8, "carbs_g": 7.1, "fat_g": 3.3, "fibre_g": 4.2},
              "unit": "1 recipe serving",
              "multiplier": 0.5,
              "portion_text": "½ serving",
              "amount": {"kcal": 41, "protein_g": 2.4, "carbs_g": 3.6, "fat_g": 1.7, "fibre_g": 2.1}
            },
            {
              "type": "recipe",
              "name": "Soya Coconut Curry",
              "recipe_id": 2737,
              "recipe_code": "#2737",
              "per_unit": {"kcal": 243.7, "protein_g": 19.3, "carbs_g": 18.1, "fat_g": 10.5, "fibre_g": 6.3},
              "unit": "1 recipe serving",
              "multiplier": 0.5,
              "portion_text": "½ serving",
              "amount": {"kcal": 122, "protein_g": 9.7, "carbs_g": 9.1, "fat_g": 5.3, "fibre_g": 3.2}
            },
            {
              "type": "recipe",
              "name": "Methi Rajgira Roti",
              "recipe_id": 3662,
              "recipe_code": "#3662",
              "per_unit": {"kcal": 303.1, "protein_g": 10.2, "carbs_g": 41, "fat_g": 9, "fibre_g": 5.4},
              "unit": "1 recipe serving",
              "multiplier": 0.5,
              "portion_text": "½ serving",
              "amount": {"kcal": 152, "protein_g": 5.1, "carbs_g": 20.5, "fat_g": 4.5, "fibre_g": 2.7}
            }
          ]
        }
      ],
      "totals": {"kcal": 1259, "protein_g": 83, "carbs_g": 143, "fat_g": 32, "fibre_g": 32},
      "status": {"code": "ok", "text": "On target"}
    }
  ],
  "guidelines": {
    "do": [
      "Eat at regular times and do not skip meals, especially if you take insulin or sugar-lowering tablets.",
      "Eat salad and vegetables first, then protein, then roti or rice.",
      "Prefer whole grains and millets (jowar, bajra, ragi, brown rice) over white rice and maida.",
      "Check your blood sugar as your doctor advises and walk 10-15 minutes after meals."
    ],
    "limit_or_avoid": [
      "Sugar, jaggery, honey, sweets, fruit juices and sweetened drinks.",
      "White rice, maida, bread and potato in large amounts.",
      "Mangoes, grapes, chikoo and bananas in large portions; prefer guava, apple, orange or papaya."
    ]
  },
  "question": {
    "heading": "Is 80 g of protein right for me?",
    "text": "A common guide is about 1.0 g of protein per kg of body weight for less active adults, 1.2-1.6 g/kg for active adults and people losing weight, and 1.6-2.0 g/kg for regular strength training. So 80 g a day roughly suits a body weight of about 80 kg if you are less active, 50-67 kg if you are active, or 40-50 kg with regular strength training. Seek advice first if you have kidney or liver disease, or are pregnant or breastfeeding."
  },
  "disclaimer": "Disclaimer: This diet chart is general wellness information and not a substitute for personalised medical or nutrition advice. Calorie and protein values are estimates from standard ingredient data (IFCT 2017 / USDA). People with medical conditions, on medication, or recovering from surgery or a procedure should follow the plan given by their doctor or dietitian.",
  "fixed_pages": ["Our Services (clinic branding, GLP-1 programme, services list, app download band)", "footer: www.hindivine.com · app@hindivine.com"],
  "copy_as_text": "HINDIVINE · Diabetes-Friendly Weight Loss\n1,500 kcal, 80 g protein · Vegetarian · Sample Patient\n\nDay 1 (2 Nov 2026): 1,536 kcal, 86 g protein\n8:30 AM Breakfast: Beetroot Quinoa Chila #2068 (1¼ servings)\n11:00 AM Mid-Morning: Pear Ragi Smoothie #5128 (1 serving) + Whey protein, 1 scoop (30 g) in water or skimmed milk\n1:30 PM Lunch: Bengali Rajma #1296 (½ serving) + Makki di Roti #0148 (½ serving) + Quinoa Cucumber Tomato Salad #2918 (½ serving) + Soya chunks, 25 g dry (boiled, added to sabzi or pulao)\n4:30 PM Evening Snack: Spinach Cauliflower Soup #4675 (1¾ servings)\n7:30 PM Dinner: Quinoa Vegetable Soup #1627 (¾ serving) + Bhindi Masala (Dry) #0361 (¾ serving) + Moringa Foxtail Roti #3664 (¾ serving)\n\nDay 2 (3 Nov 2026): 1,259 kcal, 83 g protein\n8:30 AM Breakfast: Foxtail Millet Idli #0028 (¾ serving)\n11:00 AM Mid-Morning: Guava Ragi Smoothie #5085 (¾ serving)\n1:30 PM Lunch: Moringa Leaf Toor Dal #2471 (½ serving) + Quinoa Lobia Pulao #4486 (½ serving) + Tofu Salad #0591 (½ serving) + Low-fat hung curd / Greek yogurt, 150 g + Soya chunks, 25 g dry (boiled, added to sabzi or pulao)\n4:30 PM Evening Snack: Pudina Baby Corn Tikka #4814 (¾ serving)\n7:30 PM Dinner: Spinach Broccoli Soup #4674 (½ serving) + Soya Coconut Curry #2737 (½ serving) + Methi Rajgira Roti #3662 (½ serving)\n\nwww.hindivine.com · app@hindivine.com"
}
```

## 7. Known limitations and unfinished parts

0. **Bug: printed / PDF day tables lose the Carbs, Fat and Fibre columns** (section 6.4). Fix before relying on printed charts.
1. **No patient profile in the generator.** No age, sex, height, weight, activity, BMR/TDEE or water calculation; the
   dietitian sets calories and protein directly. Body-based formulas exist only in `personal_plan.py` (section 6.2).
2. **Only calories and protein are targeted.** Carbs, fat, fibre, sugar, sodium and GI are not targeted or limited
   numerically. Diet-type rules (section 6.3) are the only medical filters.
3. **Allergies** are handled only through "Foods to avoid" groups and free-text words.
   - Free-text words are matched in English, by substring, in dish and ingredient names ("nut" also matches "nutmeg").
   - Swap suggestions ignore avoided words.
   - **Jain** is an avoid group, not a diet type.
4. **No add / edit / delete** for foods or recipes; data is fixed when the HTML is built from the Python sources.
5. **Hand edits to a chart are not saved** (lost on reload or a settings change), and the generator keeps one chart at
   a time in the browser. Settings,
   including the patient name, are saved in `localStorage` on that device.
6. **Food diet labels**: the Food Finder never marks raw foods or ingredients as vegan (`diet`), while the generator
   does (`diet_in_generator`).
7. **No recipe images.** No "katori" or plate measures; ingredient household units are cup, tbsp, tsp, piece,
   medium, pinch, inch, slice, clove, sprig, stalk.
8. **Nutrition values are estimates.**
   - Recipe values count the listed oil fully and ignore water.
   - Cooked-to-raw factors are averages.
   - Several IFCT nutrients are missing (null) for some foods.
   - Ingredients and dishes have only kcal, protein, carbs, fat and fibre.
9. **Translations** are machine-made, not reviewed. Method steps, tips, descriptions, serving ideas and storage are
   English only.
10. **Fonts** come from Google Fonts without version pinning; self-host them for fixed versions or fully offline use.
11. **Day preferences repeat weekly** (7 settings, applied to day 1-7, 8-14…). There is one fixed time per meal; times
    are not editable.
12. **Off-target days are possible** for unusual combinations (very low calories with high protein, few allowed
    dishes). They are flagged "check" rather than corrected.
13. **Two versions of the planner exist.** The PDF batch generators in `recipe-pdfs/dietplan.py` (Python) follow the
    same design but with slightly different settings:
    - ±3% fitting tolerance instead of 2.5%.
    - Minimum portion 0.5 for all diets.
    - Up to 14 add-on rounds instead of 16.
    - No 70% add-on filter.

    The web tool's JavaScript is the reference for the clinic system.
14. **Print** depends on the browser: the page relies on the browser's "Save as PDF", and output can vary slightly
    between browsers.
