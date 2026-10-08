# Hindivine recipe PDFs

Generates 1,038 individual Hindivine-branded A4 recipe PDFs (step-by-step method, nutrition per serving, health benefits, dietary guidelines, tips, serving & storage), in 20 category folders, plus a `Recipe-Index.csv`.

```
python3 build.py logo.jpg OUT_DIR            # all recipes
python3 build.py logo.jpg OUT_DIR --only "Masala Dosa,Rajma Masala"
```

- `catalog.py` – ingredient table: nutrition per 100 g (IFCT 2017 / USDA, rounded), household units, allergen and health flags.
- `fam_*.py` – recipe families (breakfast, breads, dals, sabzi, curries, rice, sides, snacks, non-veg, sweets & drinks, regional).
- `guidelines.py` – benefits, "recommended for" and "use with caution" rules worked out from each recipe's ingredients.
- `render.py` – the PDF layout (logo header; footer with www.hindivine.com and app@hindivine.com; no phone number).

Volumes: `fam_*.py` (1-1038), `fam2_*.py` (1039-2046), `fam3_*.py` (2047-3138), `fam4_*.py` (3139-5165); build one with `--vol 1|2|3|4`.
Each PDF is around 90 KB (embedded fonts plus `logo-small.jpg`). The full set of 5,165, organised by meal time, is in six zips
under `downloads/` (each under GitHub's 100 MB file limit): Breakfast Part 1 and Part 2, Lunch Part 1 and Part 2, Dinner, and
Snacks / Early Morning / Mid-Morning / Bedtime / Desserts / Accompaniments. Every zip also holds `Meal-Time-Index.pdf` and `Recipe-Index.csv`.

`--by-meal` sorts PDFs into meal-time folders (Early Morning, Breakfast, Mid-Morning, Lunch, Evening Snacks, Dinner, Bedtime,
Desserts & Sweets, Accompaniments) using the rules in `meals.py`, prints a "Best for" line on each recipe and adds
`Meal-Time-Index.pdf` (`index_pdf.py`), which lists every recipe under every meal time it suits, including Vrat / Fasting.

Needs `reportlab` (and Pillow for the logo).

Fonts: Lato (body) and DM Serif Display (headings), both under the SIL Open Font License (`fonts/OFL-*.txt`); hinting is
stripped to keep the embedded subsets small.

Design: white page in the Hindivine logo palette (deep blue #0B3B66, logo blue #0F6FB0, sky-blue #29A8E0 accents,
taupe #7F7068), serif headings, rounded cards and tables, a page-1 strip with calories (coral) and protein (teal) per serving plus carbs, fibre and
fat, a timing card, blue ingredient tables and numbered sections. Page 1 opens with a deep-blue hero card (name, badges,
meal times, description, recipe number). Every recipe ends with an "Our Services" page: GLP-1 Weight Loss Injections,
Bariatric Surgery, Laparoscopic Surgeries, Anorectal Surgery, Laser Surgery, Allurion Gastric Balloon and Robotic Surgery
(Dr Rajat Goel, Bariatric Surgeon), then the "Download the Hindivine App" band (Google Play / App Store) and app@hindivine.com.

Data checks: cooked rice, millets, quinoa and dal are converted to dry weight before nutrition is calculated (`core.dry_grams`),
and counted items (cloves, eggs, inches of ginger) are rounded to whole or half units. No icons or images apart from the logo.

## Weight-loss diet charts

`dietchart.py` (layout) and `dietplan.py` (meal planner) build 5,040 seven-day weight-loss diet charts in the same branding:
7 focus types (General, High-Protein, Diabetes-Friendly, PCOS, Thyroid-Friendly, Heart-Healthy, GLP-1 Support) ×
6 calorie levels (1200-1800 kcal) × 4 diets (Vegetarian, Vegan, Eggetarian, Non-Vegetarian) × 30 weekly variations.

    python3 dietchart.py logo-small.jpg OUT_DIR [--only 1,2,3]

Every meal is a Hindivine recipe, shown with its recipe number; portions are in recipe servings (quarter steps) and are
scaled so each day lands close to its calorie target (weekly averages within about 2%). Each focus type filters recipes
(for example no added sugar, refined grains or large fruit portions for diabetes and PCOS; low saturated fat and salt for
heart health; low fat and smaller portions for GLP-1). The PDFs have a week-at-a-glance page, a table for each day,
focus-specific guidelines, and the Our Services page. Download: `downloads/diet-charts/` (one zip per focus type plus
`Diet-Chart-Index.csv`).

## Protein diet charts (50-190 g)

`python3 dietchart.py logo-small.jpg OUT_DIR --protein` builds 580 seven-day charts: protein targets from 50 g to 190 g a
day in 5 g steps × 4 diets × 5 menu options. Calories are set from the protein target (protein supplies 17% of energy at
50 g, rising to 28% at 190 g: 1,200 kcal at 50 g, about 1,900 kcal at 100 g, 2,700 kcal at 190 g). Recipes are chosen by
protein density, and simple protein add-ons (egg whites, hung curd, tofu, soya chunks, chicken, fish, whey or pea protein)
top each day up to at least 97% of the target. Charts show Day 1-7 only: no plan numbers, week numbers or weekday names.
Download: `downloads/protein-diet-charts/`.

## Auto diet chart generator

- **Web page:** `diet-generator/index.html` (built by `python3 webdata.py` from `web_template.html`). It is one self-contained
  page with all recipe data embedded: choose Weight loss (calories + health focus) or Protein target (50-190 g), the diet and
  an optional name, and it builds a branded 7-day chart instantly; "New menu" gives another menu with the same settings,
  "Print / Save as PDF" prints it, and "Copy chart as text" copies it for WhatsApp or email. It can be hosted on
  www.hindivine.com as a static file.
- **Command line:** `python3 autodiet.py --protein 120 --diet veg` or
  `python3 autodiet.py --kcal 1500 --diet nonveg --focus diabetes --seed 2 --out chart.pdf` writes one PDF.
