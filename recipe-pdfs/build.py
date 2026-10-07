"""Build every recipe as an individual Hindivine-branded PDF and pack them into a zip.

    python3 build.py LOGO.png OUT_DIR [--only N] [--vol 1|2]
"""
import csv
import os
import re
import sys
import zipfile
from concurrent.futures import ProcessPoolExecutor

import core
import importlib
import glob as _glob

# Volume 1 modules first, then volume 2 (each module registers its recipes on import).
_here = os.path.dirname(os.path.abspath(__file__))
for pat in ('fam_*.py', 'fam2_*.py'):
    for f in sorted(_glob.glob(os.path.join(_here, pat))):
        importlib.import_module(os.path.basename(f)[:-3])

import render
from core import diet

ORDER = ['Breakfast', 'Breads & Parathas', 'Poha, Upma & Porridge', 'Dals, Sambar & Kadhi', 'Legume Curries',
         'Dry Sabzi', 'Paneer & Vegetable Curries', 'Rice, Khichdi & Biryani', 'Salads & Raita', 'Soups',
         'Chutneys & Dips', 'Snacks & Starters', 'Egg Dishes', 'Chicken', 'Mutton', 'Fish & Seafood',
         'Healthy Sweets', 'Drinks & Smoothies', 'Sandwiches & Wraps', 'Regional Specials']


def slug(s):
    return re.sub(r'[^A-Za-z0-9]+', '-', s).strip('-')


def ordered():
    rs = sorted(core.RECIPES, key=lambda r: (r['vol'], ORDER.index(r['cat']), r['name'].lower()))
    for i, r in enumerate(rs, 1):
        r['no'] = i
        r['folder'] = f'{ORDER.index(r["cat"]) + 1:02d}-{slug(r["cat"])}'
        r['file'] = f'{i:04d}-{slug(r["name"])}.pdf'
    return rs


def _one(args):
    r, out, logo = args
    path = os.path.join(out, r['folder'], r['file'])
    render.build(r, path, logo, number=r['no'])
    return path


def main():
    logo, out = sys.argv[1], sys.argv[2]
    only = None
    if '--only' in sys.argv:
        only = sys.argv[sys.argv.index('--only') + 1].split(',')
    rs = ordered()
    if '--vol' in sys.argv:
        v = int(sys.argv[sys.argv.index('--vol') + 1])
        rs = [r for r in rs if r['vol'] == v]
    if only:
        rs = [r for r in rs if r['name'] in only or str(r['no']) in only]
    for r in rs:
        os.makedirs(os.path.join(out, r['folder']), exist_ok=True)
    with ProcessPoolExecutor() as ex:
        for i, _ in enumerate(ex.map(_one, [(r, out, logo) for r in rs], chunksize=8), 1):
            if i % 100 == 0:
                print(i, 'done', flush=True)
    if only:
        return
    with open(os.path.join(out, 'Recipe-Index.csv'), 'w', newline='') as fh:
        w = csv.writer(fh)
        w.writerow(['No', 'Recipe', 'Category', 'Type', 'Diet', 'Serves', 'Total time (min)', 'kcal/serving',
                    'Protein g', 'Carbs g', 'Fibre g', 'Fat g', 'File'])
        for r in rs:
            n = r['nut']
            w.writerow([r['no'], r['name'], r['cat'], r['sub'], diet(r), r['serves'], r['prep'] + r['cook'],
                        round(n['kcal']), round(n['p']), round(n['c']), round(n['fib']), round(n['f']),
                        f'{r["folder"]}/{r["file"]}'])
    print('total', len(rs), '| skipped duplicate names:', len(core.SKIPPED))


if __name__ == '__main__':
    main()
