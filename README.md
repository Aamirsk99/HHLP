# Hindivine Diet

**Hindivine Healthcare Private Limited** · www.hindivine.com

Hindivine Diet builds a personalised **7-day Indian diet chart** and prints it as a branded **A4 PDF**. It runs as a web page or as an Android app, works offline, and keeps all data on the device.

## Features

- **Patient details.** Name, patient ID, mobile, age, sex, height, weight, chart date, next review date and medical notes.
- **Dietitian details.** Name, qualification and contact number, printed in the signature block. They are remembered for the next patient.
- **All types of diet:**
  - Weight loss, weight gain, balanced, and high-protein / muscle gain.
  - Diabetic, PCOS/PCOD, thyroid, high BP (DASH, low salt), heart-healthy / cholesterol, fatty liver, and kidney (renal).
  - Pregnancy (2nd–3rd trimester) and lactation.
  - Extra conditions can be ticked on top of any plan, for example a diabetic diet plus thyroid.
- **Food types.** Vegetarian, Jain (no onion, garlic or root vegetables), eggetarian, non-vegetarian and vegan. Allergies (gluten, dairy, nuts, soy, egg, fish) and a free-text list of foods to avoid are also respected.
- **Indian food.** About 190 dishes from North Indian, South Indian, Gujarati, Maharashtrian, Punjabi, Bengali and Kerala cooking. Each has approximate nutrition and flags for high GI, sodium, potassium and saturated fat, which the medical diets use to filter meals.
- **Targets.** Calories (Mifflin–St Jeor), protein, carbs, fat, water and fibre, plus BMI and ideal weight using the Asian-Indian cut-offs (normal 18.5–22.9).
- **The 7-day plan.** 3–6 meals a day with times and kitchen measures (katori, cup, pcs, g). Meals rotate so none repeats on consecutive days. Any meal can be swapped, or the whole week regenerated.
- **A4 PDF.** The branded chart has the logo, a patient details table, daily targets, day-wise tables, guidelines, foods to avoid, and the dietitian's signature. Every page has a footer and page numbers. The file is named `Hindivine-Diet-Chart_<Name>_<date>.pdf`.
- **CSV export** of the whole week.

## Using it

- **Web:** open `index.html`, or run `npm start`. Press **Download A4 PDF** and choose **Save as PDF** in the print dialog.
- **Android:** install [`dist/HindivineDiet.apk`](dist/HindivineDiet.apk) on Android 7.0 or newer. **Download A4 PDF** opens Android's print screen; choose **Save as PDF**.

## Rebuilding the Android app

```sh
VERSION_CODE=3 VERSION_NAME=2.1 ./android/build.sh    # needs Java 11+, curl, zip/unzip
```

The script doesn't use the Android SDK or Gradle. It downloads `aapt2` (bundled in apktool), `dx`, `apksig` and the Android API jar from Maven Central into `android/.tools/`, then compiles, dexes and signs the app.

**Signing key:** the build signs with `android/release.p12` (password `dietchart`; override with `KEYSTORE` and `STOREPASS`), and creates it if it's missing. It's git-ignored. Keep a copy, because Android only installs an update over an existing install when both are signed with the same key.

## Test

```sh
npm test             # Node 18+, no dependencies
```

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Form, results and the A4 print sheet container |
| `css/styles.css` | Brand styles, dark mode, A4 print layout |
| `js/foods.js` | Indian meal library with nutrition, allergens and flags. Add dishes here. |
| `js/planner.js` | Diet plans, targets, filtering, portioning, weekly plan, guidelines |
| `js/app.js` | Form handling, screen view, A4 sheet, PDF/CSV export |
| `img/` | Hindivine logo and icons |
| `android/` | Android WebView wrapper and build script |
| `dist/HindivineDiet.apk` | Built Android app |
| `tests/` | Unit tests for the planner |

## Disclaimer

Nutrition values are approximate. This tool supports, and does not replace, the judgement of a doctor or registered dietitian.
