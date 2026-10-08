# Translations for the Diet Chart Maker

The Diet Chart Maker (`web_template.html`) is written in English. When a language is chosen, every piece of text on the
page and in the chart is looked up in that language's file, and dish names are translated word by word.

- `languages.json` – the languages offered, their display names, the Google font used for the script, and `rtl` for
  right-to-left scripts (Urdu, Arabic). `indic: true` means dish names are translated into that script; for the other
  languages dish names stay in English, as on Indian restaurant menus abroad.
- `strings-en.json` – every English string the page can show. `{0}`, `{1}` stand for numbers.
- `dish-words.json` – every word used in the 5,165 dish names, plus two-word food names kept together (Little Millet…).
- `<code>.json` – `{"t": {English: translation}, "w": {dish word: translation}}`.
- `check.py` – `python3 i18n/check.py hi` checks a file: every string present, the same number placeholders.

To fix a translation, edit the language file, run `check.py`, then `python3 webdata.py` to rebuild
`diet-generator/index.html`.

To add a language, add it to `languages.json`, create `<code>.json` with every string from `strings-en.json`, check it,
and rebuild.

If the page gains new text, collect the strings again (the session that built this used a headless-browser crawl of every
diet type and option), add the new ones to `strings-en.json` and to each language file.
