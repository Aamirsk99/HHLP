# Diet Chart Generator

A static web app that builds a personalised **7-day diet chart** from a client's details. It has no build step and no backend, and all data stays in the browser.

## Features

- **Targets.** BMR (Mifflin–St Jeor), maintenance calories, a goal-based calorie target (weight loss, maintain, weight gain, muscle gain), protein/carb/fat split, BMI, water and fibre.
- **Preferences.** Vegetarian, eggetarian, non-vegetarian or vegan. Indian, global or mixed cuisine. 3–6 meals a day, with an optional early-morning drink. A free-text list of foods to avoid.
- **Allergies.** Gluten, dairy, nuts and peanuts, soy, egg and fish.
- **Health conditions.** Diabetes and PCOS drop high-glycaemic meals and lower carbs. High BP and kidney disease drop high-sodium meals, and kidney disease also caps protein. Thyroid and cholesterol add guidance. Each condition adds its own guideline.
- **Portions.** Every meal is scaled to its slot's calorie share. Quantities are rounded to kitchen measures (½ katori, 1½ pcs, 10 g and so on).
- **Variety.** Meals rotate through the week and the same meal is never repeated on consecutive days. You can **swap** any single meal or make a whole **new plan**.
- **Output.** Print or save as PDF (the full week, without the form), or download a CSV. The last-used profile is remembered in the browser.

## Run

Open `index.html` in a browser, or serve the folder:

```sh
npm start            # or: python3 -m http.server
```

## Android app (APK)

A ready-to-install APK is in [`dist/DietChart.apk`](dist/DietChart.apk). Copy it to an Android phone (Android 7.0 or newer), open it, and allow *Install unknown apps* when asked.

The app is a full-screen WebView that runs the same web app offline from its bundled assets. Inside the app, **Print / PDF** opens Android's print dialog, where you can choose *Save as PDF*. **Download CSV** opens the system *Save to* picker.

To rebuild after changing the web app:

```sh
./android/build.sh          # needs Java 11+, curl, zip/unzip
```

The script doesn't use the Android SDK or Gradle. It downloads `aapt2` (bundled in apktool), `dx`, `apksig` and the Android API jar from Maven Central into `android/.tools/`, then compiles, dexes and signs the app. Set `VERSION_CODE` and `VERSION_NAME` to bump the version.

**Signing key:** the first build creates `android/release.p12` (password `dietchart`; override with `KEYSTORE` and `STOREPASS`). It's git-ignored. Keep a copy, because Android only installs an update over an existing install when both are signed with the same key.

## Test

```sh
npm test             # Node 18+, no dependencies
```

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Form and result layout |
| `css/styles.css` | Styles, dark mode, print layout |
| `js/foods.js` | Meal library with nutrition, allergens and flags. Add meals here. |
| `js/planner.js` | Pure planning logic: targets, filtering, portioning, weekly plan |
| `js/app.js` | DOM wiring, rendering, CSV export |
| `tests/` | Unit tests for the planner |
| `android/` | Android WebView wrapper (manifest, resources, `MainActivity`, build script) |
| `dist/DietChart.apk` | Built Android app |

## Disclaimer

Nutrition values are approximate. This tool gives general guidance and does not replace a doctor or registered dietitian, especially for pregnancy, children or medical conditions.
