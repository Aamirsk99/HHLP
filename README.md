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

## Disclaimer

Nutrition values are approximate. This tool gives general guidance and does not replace a doctor or registered dietitian, especially for pregnancy, children or medical conditions.
