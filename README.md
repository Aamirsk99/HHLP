# Hindivine Diet

**Hindivine Healthcare Private Limited** · www.hindivine.com

Hindivine Diet builds a personalised **7-day Indian diet chart** and prints it as a branded **A4 PDF**. It runs as a web page or as an Android app, works offline, and keeps all data on the device.

## Features

- **Screen-by-screen app:** Home → 1 Patient → 2 Diet plan & targets → 3 Food preferences → 4 Schedule & language → 5 Dietitian & create → Chart. It also has a Food library screen, and the back button works on phones.
- **Food library:** 671 Indian regional and worldwide foods, each with nutrition and a Hindi name.
  - Meals are built from matching foods, giving 44 lakh+ (4.4 million+) meal combinations. The chart shows how many match each patient.
  - Search in English or Hindi, and filter by category, cuisine, food type, maximum calories, weight-loss, high-protein or travel foods. Sort by name, calories or protein.
- **Chart in 10 languages:** English, हिन्दी, मराठी, ગુજરાતી, বাংলা, ਪੰਜਾਬੀ, தமிழ், తెలుగు, ಕನ್ನಡ, മലയാളം.
  - All labels, days, meals, units, guidelines and foods-to-avoid are translated.
  - Food names use the Hindi name directly (Hindi, Marathi) or converted to the language's script, with local words such as dal → ડાળ / పప్పు and rice → ভাত / சாதம்.
- **Days by name only:** no dates. Choose the day the chart starts on.
- **Food preferences:**
  - Type foods the patient **likes** (they appear more often) and foods to **avoid**, with suggestions from the library.
  - Quick exclusion chips (no rice, no wheat, no dairy, no paneer, no potato, no onion/garlic…), allergies, food type (veg, Jain, egg, non-veg, vegan) and cuisine.
- **Targets:** calorie-wise (presets or any value) and protein-wise (presets or any grams) plans. Weight-loss foods are preferred for weight-loss plans.
- **Diet types:**
  - Weight loss, weight gain, balanced, and high-protein.
  - Diabetic, PCOS, thyroid, BP, heart, fatty liver and kidney.
  - Pregnancy and lactation.
  - **Travel** diet (train, flight, road, hotel).
- **Manual control:** build a chart from scratch, edit any meal, add your own foods, copy meals to other days, lock and swap meals, and set meal timings.
- **A4 PDF, always exactly 2 pages:**
  - **With name:** patient details.
  - **Without name:** generic.
  - **Layout:** page 1 has the header, patient details, targets and days 1–4; page 2 has days 5–7, guidelines, foods to avoid and weight-loss foods.
  - **Fitting:** text scales automatically to fit.
  - **Signature:** none needed ("Prepared by" and a computer-generated note).
- **CSV export** in English and the chart language.

## Apps

| Platform | How |
| --- | --- |
| **Android** | Install [`dist/HindivineDiet.apk`](dist/HindivineDiet.apk) (Android 7.0+). |
| **iPhone / iPad** | **Now:** host this folder on HTTPS (e.g. hindivine.com/diet) and open it in Safari, then *Share → Add to Home Screen*. It installs as an offline app (`manifest.webmanifest`, `sw.js`). **App Store:** the Xcode project is in `ios-app/`, see below. |
| **Web** | Open `index.html`, or run `npm start`. |

### Building the iOS app (needs a Mac)

```sh
cd ios-app
npm install
npm run sync      # copies the web app into the Xcode project
npm run open      # opens Xcode
```

In Xcode, choose your Apple Developer team under *Signing & Capabilities*, then *Product → Archive* to upload to App Store Connect or TestFlight. The native `MainViewController` (in `AppDelegate.swift`) connects **PDF** to the iOS print sheet (share → Save to Files) and **CSV** to the share sheet.

## Rebuilding the Android app

```sh
VERSION_CODE=4 VERSION_NAME=3.1 ./android/build.sh    # needs Java 11+, curl, zip/unzip
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
| `js/fooddb.js` | Food library (671 foods) with nutrition, roles, regions, allergens and flags. Add foods here. |
| `js/foodnames.js` | Hindi name for every food (used for search and translated charts) |
| `js/i18n.js` | Chart translations for 10 languages and script conversion |
| `js/planner.js` | Diet plans, targets, filtering, portioning, weekly plan, guidelines |
| `js/app.js` | Screen-by-screen app, chart view, meal editor, food library, 2-page A4 sheet, PDF/CSV export |
| `manifest.webmanifest`, `sw.js` | Installable offline web app (iPhone / Android) |
| `ios-app/` | Capacitor iOS project (Xcode) |
| `img/` | Hindivine logo and icons |
| `android/` | Android WebView wrapper and build script |
| `dist/HindivineDiet.apk` | Built Android app |
| `tests/` | Unit tests for the planner |

## Disclaimer

Nutrition values are approximate. This tool supports, and does not replace, the judgement of a doctor or registered dietitian.
