# Hindivine recipe PDFs

Generates 1,038 individual Hindivine-branded A4 recipe PDFs (step-by-step method, nutrition per serving, health benefits, dietary guidelines, tips, serving & storage), in 20 category folders, plus a `Recipe-Index.csv`.

```
python3 build.py logo.jpg OUT_DIR            # all recipes
python3 build.py logo.jpg OUT_DIR --only "Masala Dosa,Rajma Masala"
```

- `catalog.py` – ingredient table: nutrition per 100 g (IFCT 2017 / USDA, rounded), household units, allergen and health flags.
- `fam_*.py` – recipe families (breakfast, breads, dals, sabzi, curries, rice, sides, snacks, non-veg, sweets & drinks, regional).
- `guidelines.py` – benefits, "recommended for" and "use with caution" rules worked out from each recipe's ingredients.
- `render.py` – the PDF layout (logo header, www.hindivine.com footer, no phone or email).

Volumes: `fam_*.py` (1-1038), `fam2_*.py` (1039-2046), `fam3_*.py` (2047-3138); build one with `--vol 1|2|3`.
`logo-small.jpg` (420 px) keeps each PDF around 23 KB; the full set of 3,138, organised by meal time, is in `downloads/Hindivine-3138-Recipes-by-Meal-Time.zip`.

`--by-meal` sorts PDFs into meal-time folders (Early Morning, Breakfast, Mid-Morning, Lunch, Evening Snacks, Dinner, Bedtime,
Desserts & Sweets, Accompaniments) using the rules in `meals.py`, prints a "Best for" line on each recipe and adds
`Meal-Time-Index.pdf` (`index_pdf.py`), which lists every recipe under every meal time it suits, including Vrat / Fasting.

Needs `reportlab` (and Pillow for the logo).

Every recipe PDF shows a food icon beside the title (`icons.py`, drawn from the Noto Color Emoji font and cached in `icons/`)
and a page-1 strip with calories and protein per serving in large figures, plus carbs, fibre and fat.
