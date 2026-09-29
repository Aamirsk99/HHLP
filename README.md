# Hindivine Diet

**Hindivine Healthcare Private Limited** · www.hindivine.com

Hindivine Diet builds a personalised **7-day Indian diet chart** and prints it as a branded **A4 PDF**. It runs as a web page or as an Android app, works offline, and keeps all data on the device.

## Features

- **Food library.** 475 foods, each with its own nutrition per serving:
  - Indian regional food: North, South, Gujarati & Marathi, Bengali & East.
  - Worldwide food: Continental, Mediterranean, Asian and Mexican.
  - Travel meals.

  The planner combines foods into regionally matched meals (grain + dal + sabzi + side, protein + carb + veg bowls, classic pairings), which gives **8 lakh+ (800,000+) meal combinations**. The exact number for each patient's filters is shown on the chart.
- **Weight-loss foods.** Weight-loss friendly foods are tagged, preferred automatically for weight-loss plans, and listed on the chart as "Smart weight-loss foods".
- **Target-led plans:**
  - **Calories:** pick a preset (1000–2500) or type any value, or leave it on auto (Mifflin–St Jeor).
  - **Protein:** pick a preset (40–150 g) or type any value; meals are chosen to meet it.
- **Diet types:**
  - Weight loss, weight gain, balanced, and high-protein.
  - Diabetic, PCOS, thyroid, high BP, heart, fatty liver and kidney.
  - Pregnancy and lactation.
  - Extra conditions can be added on top of any plan.
- **Food preferences.** Vegetarian, Jain, eggetarian, non-veg and vegan, plus cuisine chips.
- **Food exclusions.** Chips for no rice, no wheat, no dairy, no paneer, no potato, no onion/garlic, no sweets, no fried food and more, plus free text and allergies.
- **Travel diet charts.** Train, flight, road trip, hotel or mixed, using travel-friendly foods and travel tips, with all the same options.
- **Manual control:**
  - **Build manually** starts an empty chart.
  - **Edit** any meal on any day: search the food library, add or remove foods, change quantities, or add custom foods.
  - **Copy** a meal to other days.
  - **Lock** a meal so **New plan** keeps it.
  - **Swap** a meal for another option.
  - **Change meal timings.**
- **Dates.** Chart date, start date (Day 1) and review date. Days show real dates, and the start date can be changed after the chart is made.
- **A4 PDF, two options:**
  - **With name:** full patient details.
  - **Without name:** a generic chart with no personal details.

  Both include day-wise tables, guidelines, foods to avoid, a "Prepared by" line and page numbers. They are computer-generated, so no signature is needed.
- **CSV export**, and the last chart is remembered on the device.

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
| `js/fooddb.js` | Food library (475 foods) with nutrition, roles, regions, allergens and flags. Add foods here. |
| `js/planner.js` | Diet plans, targets, filtering, portioning, weekly plan, guidelines |
| `js/app.js` | Builder, chart view, meal editor, food library, A4 sheet, PDF/CSV export |
| `manifest.webmanifest`, `sw.js` | Installable offline web app (iPhone / Android) |
| `ios-app/` | Capacitor iOS project (Xcode) |
| `img/` | Hindivine logo and icons |
| `android/` | Android WebView wrapper and build script |
| `dist/HindivineDiet.apk` | Built Android app |
| `tests/` | Unit tests for the planner |

## Disclaimer

Nutrition values are approximate. This tool supports, and does not replace, the judgement of a doctor or registered dietitian.
