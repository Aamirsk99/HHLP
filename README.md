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

## Hindivine Admin app (`admin/`) — version 3.0

A separate app for running the clinic. **Android:** install [`dist/HindivineAdmin.apk`](dist/HindivineAdmin.apk) (Android 7.0+; installs next to Hindivine Diet). **Web / iPhone:** open `admin/index.html`, or host the folder and *Add to Home Screen*.

**Logins.** Every person signs in with their own name and PIN (4–6 digits, a random 6-digit PIN is suggested). PINs are shared through the Google Sheet, so they work on every device. The Super Admin adds, edits, disables and deletes logins, and can see and reset staff PINs (the Super Admin PIN is never shown).

| Role | Default access (editable in Settings → Roles & permissions) |
| --- | --- |
| **Super Admin** | Everything, always |
| **Admin** | Everything except Settings; can delete records |
| **Manager** | Dashboard, Today, OPD, Leads, sales, patients, renewals, products, inventory, purchases, expenses, reports, activity log |
| **Front Desk** | OPD appointments and Leads (their own leads and unassigned ones) |

The app logs out after 15 minutes without use. On Android, back goes to the previous screen and exits only with a second press on the home screen. Bottom menu: **Dashboard · Today · Sale · OPD · Inventory**.

| Area | What it does |
| --- | --- |
| **Dashboard** | Today's OPD, revenue, profit and renewals; *Order required* banner; sales, OPD, patients, leads, team and stock summaries (available stock first); revenue vs expenses by month. Periods: today, this month (updates automatically), any chosen month, last month, year, all time or custom dates. |
| **Today Summary** | Sales, purchases, OPD, expenses, stock available and not available for any day. **Protein and Mounjaro 10mg / 15mg below 2 show “Order required”** (the limit is editable per item). Export as A4 **PDF** or A4 **JPEG** image. |
| **OPD Appointments** | Clinic visit or online, fee ₹1000 (editable), optional **treatment / service**, day view and filtered list, complete / paid / no-show / cancel, WhatsApp confirmation. |
| **Leads (CRM)** | Name, mobiles, age, gender, city, source, interest, priority (hot / warm / cold), stage, assigned person, follow-up date and time, weight / target / height (BMI), budget, notes. Pipeline by stage, due-today and overdue follow-ups, call / WhatsApp, update history (who and when), book an OPD appointment from the lead (converts it), conversion rate, leads per person. |
| **Sales** | Injection, protein and diet support. Incentive uses each person's own rate (default ₹1000 per injection, ₹500 per protein sale), split single / 50-50 / custom %. Every injection pen also takes its **kit** out of stock: travel bag 1, ice gel 1, alcohol swabs 16, needles 2 (editable, can be switched off). |
| **Patients** | Search, active / inactive, visits and spend; edit or delete a patient (with their sales and appointments). |
| **Stock** | Products, inventory with kit usage, per-item low-stock alert on/off (or all alerts off), “order required” limits, purchases, custom categories. |
| **Team & money** | Per-person incentive rates and **pay counts** (salary + incentive, salary only or incentive only), personal logins, salary sheet, incentives, expenses. |
| **Reports** | Overview, Today, OPD, Leads, Sales, Team, Financial, Stock, Purchases, Expenses, Renewals, Activity, each with its own filters; PDF / Excel for every report, or all reports in one file. |
| **Activity log** | Every change with who made it and when, per-person summary, export. **What's new** lists all versions. |
| **Choice lists** | Expense categories, services, lead sources and stages, payment methods, designations and inventory categories: “+ Add new…” in any drop-down, rename or remove in Settings. |

Developed by **Aamir Sk · Hindivine Digital Marketing Team**.

**Google Sheet data storage:** all data is stored in the [Hindivine Google Sheet](https://docs.google.com/spreadsheets/d/1_aKPoHJaJfQ6awuoG7ihufQzOBhw8I84yipErlWO1_Y/edit). Set-up once: open the sheet → Extensions → Apps Script → paste [`admin/google-apps-script/Code.gs`](admin/google-apps-script/Code.gs) → run `setup` (creates Dashboard, Appointments, Leads, Patients, Injection Sales, Protein Sales, Diet Support, Purchases, Inventory, Team, Incentives, Salary, Expenses, Renewals, Activity Log, plus a hidden `_AppData` sheet, and logs a secret) → Deploy → Web app (Execute as *Me*, access *Anyone*) → paste the URL and secret on the sign-in screen (*Connect Google Sheet*) or in Settings. The app saves each change within seconds without showing it, refreshes the data every 30 seconds and on pull-down or the refresh button, works offline, and asks which version to keep if two devices changed data at the same time. Enter data in the app, not in the sheet: every save rewrites the tabs.

**Excel / Google Sheets workbook:** [`admin/Hindivine_Admin_Sheets.xlsx`](admin/Hindivine_Admin_Sheets.xlsx) has the same 13 sheets plus Settings, with formulas, so it also works on its own: appointments (₹1000 fee, clinic visit/online), sales, purchases, expenses, patients and team; stock, incentives, salary + incentive, renewals (75/90 days) and the dashboard calculate themselves. Keep it separate from the Google Sheet the app stores its data in, because the app rewrites those tabs.

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
APP=admin VERSION_CODE=4 VERSION_NAME=3.0 ./android/build.sh   # Hindivine Admin → dist/HindivineAdmin.apk
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
| `admin/` | Hindivine Admin app: `js/core.js` (data and rules), `js/app.js` (screens), `js/export.js` (PDF / Excel), `vendor/` (jsPDF, AutoTable, SheetJS), `google-apps-script/Code.gs` (Sheets) |
| `tests/` | Unit tests (planner, recipes, storage, PDF read-back, admin app) |

## Disclaimer

Nutrition values are approximate. This tool supports, and does not replace, the judgement of a doctor or registered dietitian.
