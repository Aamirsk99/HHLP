"""Hindivine Recipe Book: one self-contained HTML page with all recipes.

    python3 recipebook.py OUT.html [--artifact]

Browse and search every recipe by meal time, category and diet, and open the full recipe (nutrition per serving,
ingredients, method, tips, serving ideas, storage) in any of the 20 languages, with an optional second language.
--artifact writes the page without the <html>/<head>/<body> wrapper (for hosts that add their own).
"""
import base64, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)


def data():
    import build as B
    import meals as M
    from core import diet, quantity
    from catalog import CAT
    txt, idx = [], {}

    def t(x):
        x = x or ''
        if x not in idx:
            idx[x] = len(txt)
            txt.append(x)
        return idx[x]
    cats, meal_names = [], M.MEALS + M.EXTRA
    out = []
    for r in B.ordered(True):
        if r['cat'] not in cats:
            cats.append(r['cat'])
        n = r['nut']
        groups = []
        for gh, items in r['groups']:
            lines = []
            for k, g, note in items:
                show = note and g is not None and note.lower() not in CAT[k]['name'].lower()
                lines.append([t(CAT[k]['name']), quantity(k, g, note), t(note) if show else -1])
            groups.append([t(gh), lines])
        serve = [re.sub(r'<[^>]+>', '', s) for s in r['serve']]
        out.append([r['no'], r['name'], cats.index(r['cat']), r['sub'] or '', [meal_names.index(m) for m in r['meals']],
                    {'vegan': 0, 'veg': 1, 'egg': 2, 'nonveg': 3}[diet(r)], r['serves'], r['prep'], r['cook'], r['level'],
                    [round(n['kcal']), round(n['p'], 1), round(n['c'], 1), round(n['f'], 1), round(n['fib'], 1)],
                    t(r['desc']), groups, [[t(hd), t(tx)] for hd, tx in r['steps']],
                    [t(x) for x in r['tips']], [t(x) for x in serve], t(r['store'])])
    return {'cats': cats, 'meals': meal_names, 'diets': ['Vegan', 'Vegetarian', 'Egg', 'Non-veg'], 'recipes': out, 'txt': txt}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    out = args[0] if args else os.path.join(HERE, '..', 'downloads', 'Hindivine-Recipe-Book.html')
    import webdata
    tpl = open(os.path.join(HERE, 'recipebook_template.html'), encoding='utf-8').read()
    logo = base64.b64encode(open(os.path.join(HERE, 'logo-small.jpg'), 'rb').read()).decode()
    html = (tpl.replace('/*__DATA__*/null', json.dumps(data(), ensure_ascii=False, separators=(',', ':')))
            .replace('__LOGO__', 'data:image/jpeg;base64,' + logo)
            .replace('/*__I18N__*/{}', json.dumps(webdata.load_i18n(), ensure_ascii=False, separators=(',', ':'))))
    if '--artifact' not in sys.argv:
        t = html.index('</title>') + len('</title>')
        e = html.index('</style>') + 8
        html = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
                '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
                + html[:t] + html[t:e] + '\n</head>\n<body>\n' + html[e:] + '\n</body>\n</html>\n')
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as fh:
        fh.write(html)
    print(out, f'{os.path.getsize(out) / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
