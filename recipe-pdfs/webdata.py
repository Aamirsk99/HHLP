"""Build diet-generator/index.html: the Hindivine Auto Diet Chart page with recipe data and plan rules embedded.

    python3 webdata.py            # writes ../diet-generator/index.html (with a Print / Save as PDF button)
    python3 webdata.py --no-print OUT.html   # same page without the print button
"""
import base64
import json
import os
import sys

import build as B
import dietchart as C
import dietplan as D
import render as R

HERE = os.path.dirname(os.path.abspath(__file__))
POOLS = ['early', 'breakfast', 'mid', 'main', 'sabzi', 'roti', 'rice', 'onepot', 'salad', 'soup', 'evening', 'bedtime', 'eggbf', 'nvmain']
DIETC = {'vegan': 0, 'veg': 1, 'egg': 2, 'nonveg': 3}


def data():
    rs = B.ordered(True)
    feats, pools = D._pools(rs)
    member = {}
    for i, name in enumerate(POOLS):
        for r in pools[name]:
            member[r['no']] = member.get(r['no'], 0) | (1 << i)
    recs = []
    for r in rs:
        if r['no'] not in member:
            continue
        f = feats[r['no']]
        fmask = sum(1 << i for i, fo in enumerate(D.FOCUS) if D.focus_ok(fo, r, f))
        recs.append([r['no'], r['name'], round(f['kcal'], 1), round(f['p'], 1), round(f['c'], 1), round(f['f'], 1), round(f['fib'], 1),
                     DIETC[f['diet']], member[r['no']], fmask, r['cat']])
    return dict(
        recs=recs, pools=POOLS, focus=list(D.FOCUS.items()), diets=list(D.DIETS.items()), kcals=D.KCALS,
        slots=[list(s) for s in D.SLOTS], bedtime=[list(b) for b in D.BEDTIME], addons=[list(a) for a in D.ADDONS],
        plain={k: list(v) for k, v in D.PLAIN.items()},
        info={k: list(v) for k, v in C.FOCUS_INFO.items()},
        services=[list(s) for s in R.SERVICES], glp1=R.GLP1)


def main():
    noprint = '--no-print' in sys.argv
    args = [a for a in sys.argv[1:] if a != '--no-print']
    out = args[0] if args else os.path.join(HERE, '..', 'diet-generator', 'index.html')
    tpl = open(os.path.join(HERE, 'web_template.html'), encoding='utf-8').read()
    logo = base64.b64encode(open(os.path.join(HERE, 'logo-small.jpg'), 'rb').read()).decode()
    html = (tpl.replace('/*__DATA__*/null', json.dumps(data(), separators=(',', ':')))
            .replace('__LOGO__', 'data:image/jpeg;base64,' + logo)
            .replace('/*__CANPRINT__*/true', 'false' if noprint else 'true'))
    with open(out, 'w', encoding='utf-8') as fh:
        fh.write(html)
    print(out, len(html) // 1024, 'KB')


if __name__ == '__main__':
    main()
