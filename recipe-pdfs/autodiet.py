"""Generate one Hindivine 7-day diet chart PDF on demand.

    python3 autodiet.py --protein 120 --diet veg                       # protein-target chart (calories set automatically)
    python3 autodiet.py --kcal 1500 --diet nonveg --focus diabetes     # weight-loss chart
    options: --diet veg|vegan|egg|nonveg   --focus general|protein|diabetes|pcos|thyroid|heart|glp1
             --kcal N (optional with --protein)   --seed TEXT (another menu)   --out FILE.pdf   --logo FILE
"""
import argparse
import os

import build as B
import dietchart as C
import dietplan as D


def main():
    ap = argparse.ArgumentParser(description='Generate one Hindivine 7-day diet chart PDF.')
    ap.add_argument('--protein', type=int, help='protein target in g a day (e.g. 50-190)')
    ap.add_argument('--kcal', type=int, help='calories a day (default: 1500, or set from --protein)')
    ap.add_argument('--diet', default='veg', choices=list(D.DIETS))
    ap.add_argument('--focus', default='general', choices=list(D.FOCUS))
    ap.add_argument('--seed', default='1', help='change this to get a different menu with the same settings')
    ap.add_argument('--out', help='output PDF path')
    ap.add_argument('--logo', default=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logo-small.jpg'))
    a = ap.parse_args()
    kcal = a.kcal or (D.protein_kcal(a.protein) if a.protein else 1500)
    focus = 'general' if a.protein else a.focus
    pl = D.Planner(B.ordered(True))
    p = D.make(pl, focus, kcal, a.diet, f'auto-{focus}-{kcal}-{a.diet}-{a.protein}-{a.seed}', a.protein)
    p['week'] = p['option'] = a.seed
    out = a.out or C.fname(p).replace(f'Option-{a.seed}', f'Menu-{a.seed}')
    C.build(p, out, a.logo)
    tots = [D.totals(d) for d in p['days']]
    print(f'{out}: avg {sum(t["kcal"] for t in tots) / 7:.0f} kcal, {sum(t["p"] for t in tots) / 7:.0f} g protein a day')


if __name__ == '__main__':
    main()
