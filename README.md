# Hindivine Diet

**Hindivine Healthcare Private Limited** · www.hindivine.com

Hindivine Diet builds personalised **1–7 day Indian and worldwide diet charts** with a **recipe for every dish**, and prints them as branded **A4 PDFs**. It runs as a web page, an Android app or an iOS app, works offline, and keeps all data on the device.

## Features

- **Dashboard and menu:**
  - The dashboard shows patients, saved charts, recipes and foods, quick actions (New chart, Next week, Upload PDF, Patients, Saved charts, Recipes, Food library, Settings), the last chart and recent charts.
  - A side menu and a bottom tab bar reach every screen.
- **Step-by-step chart wizard:** 1 Patient → 2 Diet plan & targets → 3 Food preferences → 4 Days & language → 5 Dietitian & create.
  - **Patient data is optional:** age, sex, height and weight can be left blank; standard targets are used instead.
  - **Days:** 1 to 7 days, by day name (no dates).
  - **Two languages:** a second chart language can be added.
  - **Water:** set the daily water target, or leave it on auto.
- **Recipes:** all 671 dishes have a recipe (ingredients in grams, method, nutrition), built from 238 ingredients.
  - Each dish's **kcal, protein, carbs and fat are calculated from its ingredients** (IFCT 2017 / USDA values).
  - Recipes scale by servings and print on A4. Tap a dish in a chart to see its recipe, and add recipes to the chart PDF as extra A4 pages.
- **Foods:** 865 searchable foods: the 671 dishes plus 194 ingredients per 100 g. All have icons and Hindi names.
  - Meals are combined from them, giving 44 lakh+ (4.4 million+) combinations.
- **Diet types:**
  - Weight loss and gain, balanced, and high protein.
  - Medical: diabetic, PCOS, thyroid, BP, heart, fatty liver, kidney.
  - Pregnancy and lactation, and travel diets.
- **Food type:** veg, Jain, egg, non-veg or vegan.
  - **Diet combinations:** Veg + Egg, Egg + Non-veg, Veg + Chicken, Veg + Fish, Egg + Chicken, Egg + Fish, Chicken + Fish. Only the chosen animal foods appear.
- **Health conditions:** with any condition, the chart never includes foods from its own "avoid" list. Recipes are checked for sugar, maida, jaggery/honey (diabetes/PCOS), papad and soy sauce (BP/kidney), butter and cream (cholesterol), and fried or sweet dishes.
- **Preferences:** calorie-wise and protein-wise targets, liked foods and foods to avoid (typed), quick exclusions, allergies and cuisines.
- **Manual control:** edit any meal (including ingredients), add your own foods, copy meals to other days, lock and swap meals.
- **Patients & saved charts:**
  - Every chart is saved automatically, with its patient.
  - Each patient page shows the chart history (Week 1, 2, 3…).
  - Any chart can be opened, edited, reprinted or deleted.
- **Next week:** one tap makes next week's chart with the same patient and settings but **fully changed foods**. About 95–100% of the main foods change.
- **Upload previous PDF:** choose last week's PDF to read it back.
  - **Charts made with Hindivine Diet** carry hidden chart data, so they are read exactly (patient, targets, every meal). You can then edit the chart or generate next week.
  - **Other PDFs:** the foods in them are found by name, in any of the 10 languages, and avoided in the new chart.
- **A4 PDF:**
  - **Pages:** 1 page for short charts (1–3 days, when they fit), otherwise 2 pages. Text scales automatically to fit.
  - **Versions:** with or without the patient name.
  - **Extras:** meal icons, optional recipe pages, and a "Download the Hindivine Patient App from Play Store or App Store" band on the last page.
  - **Signature:** none needed.
- **Languages:** English, हिन्दी, मराठी, ગુજરાતી, বাংলা, ਪੰਜਾਬੀ, தமிழ், తెలుగు, ಕನ್ನಡ, മലയാളം. Any two can be combined.
- **Backup:** export or import all patients and charts as a file (Settings). CSV export is also available.

## Hindivine Admin app (`admin/`)

A separate, **admin-only** app for running the clinic. **Android:** install [`dist/HindivineAdmin.apk`](dist/HindivineAdmin.apk) (Android 7.0+; installs next to Hindivine Diet). **Web / iPhone:** open `admin/index.html`, or host the folder and *Add to Home Screen*. It asks for an admin PIN on first launch and locks after 15 minutes idle. Data is stored in the Hindivine Google Sheet (see below) and kept on each device for offline use.

| Area | What it does |
| --- | --- |
| **Dashboard** | Sales (orders, revenue, expenses, net profit, injection / protein / diet support sales), patients (total, new, renewal, active), team (members, incentives, salary, top performer), stock (injection, protein, needles, swabs, syringes, low-stock alerts), revenue vs expenses by month. Filter by today, month, last month, year, all time or custom dates. |
| **New Sale** | Injection, protein and diet support sales: patient, mobile, new/renewal (auto from history), product, qty, amount (auto from price), date, reference, optional shared reference (50-50 or custom %), optional dietitian, notes. Saving takes the stock out, splits the incentive and books the revenue. |
| **Products** | Mounjaro 2.5/5/10/15 mg, Wegovy 0.25/1/2.4 mg, Ozempic 0.25/1 mg, protein types and 1/3-month diet plans. Change price, incentive or disable; add more. |
| **Inventory** | Opening, purchased, sold, adjusted and available stock per item; needles, swabs, syringes, protein sachets, ice gel packs, travel bags, plus unlimited custom categories. |
| **Purchases** | **AI invoice scanner:** upload a photo or PDF; Claude reads vendor, invoice no./date, products, qty, batch, expiry, rate and GST, matches each line to a product and adds the stock (e.g. *Mounjaro 15mg Qty 2 → stock +2*). When every line matches, it saves with no manual entry; otherwise you review first. Duplicate invoices are refused. Purchases can also be booked as expenses. |
| **Incentives** | Injection ₹1000 per pen, protein ₹500 per sale, diet support 1 month ₹1000 / 3 months ₹2000 — all editable, plus per-product overrides. Ledger per team member. |
| **Team, Salary** | Add / edit / disable / delete members (name, designation, mobile, salary, incentive status, joining date). Monthly salary + incentive per employee; book both as expenses in one tap. |
| **Expenses** | Salary, Incentive, Rent, Electricity, Courier, Marketing, Protein / Injection Purchase, Miscellaneous. Profit = Revenue − Expenses. |
| **Renewals** | 60-day and 90-day reminders from each patient's last injection (patient, product, last purchase, reference team), with Call / WhatsApp and one-tap renewal sale. |
| **Reports** | Team-wise, financial and stock reports for any period, with CSV export. |

**Excel / Google Sheets workbook:** [`admin/Hindivine_Admin_Sheets.xlsx`](admin/Hindivine_Admin_Sheets.xlsx) has the same 12 sheets plus a Settings sheet, with formulas, so it also works on its own: type sales, purchases, expenses, patients and team; stock, incentives (single / 50-50 / custom split), salary + incentive, renewals (60/90 days) and the dashboard calculate themselves. Upload it to Google Drive to use it as a Google Sheet. Keep it separate from the Google Sheet the app stores its data in, because the app rewrites those tabs.

**AI scanner set-up:** Settings → paste a Claude API key (console.anthropic.com). The key stays on the device and is left out of backups. Scans use `claude-opus-5-5` (or Sonnet 5.5) with structured JSON output.

**Google Sheet data storage:** all data is stored in the [Hindivine Google Sheet](https://docs.google.com/spreadsheets/d/1_aKPoHJaJfQ6awuoG7ihufQzOBhw8I84yipErlWO1_Y/edit), so every admin phone and computer shares it. Set-up once: open the sheet → Extensions → Apps Script → paste [`admin/google-apps-script/Code.gs`](admin/google-apps-script/Code.gs) → run `setup` (creates Dashboard, Patients, Injection Sales, Protein Sales, Diet Support, Purchases, Inventory, Team, Incentives, Salary, Expenses, Renewals, plus a hidden `_AppData` sheet, and logs a secret) → Deploy → Web app (Execute as *Me*, access *Anyone*) → in the app, Settings → Google Sheet → paste the URL and secret. The app loads the latest data when opened, saves each change within seconds, keeps working offline, and asks which version to keep if two devices changed data at the same time. Enter data in the app, not in the sheet: every save rewrites the 12 tabs.

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

In Xcode, choose your Apple Developer team under *Signing & Capabilities*, then *Product → Archive* to upload to App Store Connect or TestFlight. The native `MainViewController` (in `AppDelegate.swift`) connects **PDF** to the iOS print sheet (PDF upload uses the standard iOS file picker) (share → Save to Files) and **CSV** to the share sheet.

## Rebuilding the Android app

```sh
VERSION_CODE=5 VERSION_NAME=5.0 ./android/build.sh    # needs Java 11+, curl, zip/unzip
APP=admin VERSION_CODE=1 VERSION_NAME=1.0 ./android/build.sh   # Hindivine Admin → dist/HindivineAdmin.apk
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
| `js/fooddb.js` | Dishes (671) with roles, regions, allergens and flags; nutrition is recalculated from recipes |
| `js/ingredients.js` | 238 ingredients with nutrition per 100 g and Hindi names |
| `js/recipes.js` | Recipe (ingredients in grams + method) for every dish, nutrition calculation |
| `js/icons.js` | Food and meal icons |
| `js/store.js` | Saved patients and charts, backup, and chart data inside PDFs |
| `vendor/pdfjs/` | PDF.js 3.11 (Apache-2.0), to read uploaded charts |
| `js/foodnames.js` | Hindi name for every food (used for search and translated charts) |
| `js/i18n.js` | Chart translations for 10 languages and script conversion |
| `js/planner.js` | Diet plans, targets, filtering, portioning, weekly plan, guidelines |
| `js/app.js` | Dashboard, wizard, chart view, meal editor, patients, recipes, upload, A4 PDF and CSV export |
| `manifest.webmanifest`, `sw.js` | Installable offline web app (iPhone / Android) |
| `ios-app/` | Capacitor iOS project (Xcode) |
| `img/` | Hindivine logo and icons |
| `android/` | Android WebView wrapper and build script |
| `dist/HindivineDiet.apk`, `dist/HindivineAdmin.apk` | Built Android apps |
| `admin/` | Hindivine Admin app: `js/core.js` (data and rules), `js/app.js` (screens), `js/invoice.js` (AI invoice scanner), `google-apps-script/Code.gs` (Sheets) |
| `tests/` | Unit tests (planner, recipes, storage, PDF read-back, admin app) |

## Disclaimer

Nutrition values are approximate. This tool supports, and does not replace, the judgement of a doctor or registered dietitian.
