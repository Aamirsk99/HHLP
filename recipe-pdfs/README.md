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
