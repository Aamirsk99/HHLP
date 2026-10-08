"""Hindivine personal 7-day GLP-1 programme diet plan - one branded PDF for one person.

Targets are calculated from the person's details: BMI, maintenance calories (Mifflin-St Jeor x activity), a ~650 kcal
deficit (never below 1,200 kcal for women or 1,500 kcal for men) and protein of about 1.3 g per kg of adjusted body
weight. The standard sample menu (detox drink every morning, protein shake twice a day, simple breakfasts, office-friendly
lunches, soup or salad dinners) is scaled to the calorie target. Nutrition comes from the Hindivine ingredient catalogue
(IFCT 2017 / USDA); whey protein, bone broth and plain infusions use typical label values.

    python3 personal_plan.py --name "Full Name" --age 35 --sex F --height 163 --weight 96 --diet nonveg --out plan.pdf
    options: --diet veg|egg|nonveg   --activity sedentary|light|moderate   --kcal N   --protein N   --date "8 October 2026"
"""
import argparse
import datetime
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.platypus.flowables import HRFlowable

from catalog import CAT
from render import (deco, HEADER_H, CW, H, NAVY, GOLD, GOLD_L, CREAM, WHITE, TERRA, EMERALD, ROSE, MINT, HAIR, ZEBRA,
                    body, small, h2, cell, label, boxhead, warnhead, esc, spaced, rule, card, bullets, chips, tile_row, our_services)

# ---------------- person (set by configure) ----------------
NAME, AGE, SEX, HT, WT, DIET, DATE = '', 0, 'Female', 0, 0, 'nonveg', ''
BMI = BMR = TDEE = IBW = ADJ = 0.0
KCAL_T = PROT_T = 0
ACTIVITY = {'sedentary': 1.2, 'light': 1.375, 'moderate': 1.55}
DIET_LABEL = {'veg': 'VEGETARIAN', 'egg': 'EGGETARIAN', 'nonveg': 'NON-VEGETARIAN'}
BF_TEXT = {'nonveg': 'Protein-rich and simple: chilla with paneer, eggs, poha with peanuts or tandoori chicken.',
           'egg': 'Protein-rich and simple: chilla with paneer, eggs, poha with peanuts or sprouts chaat.',
           'veg': 'Protein-rich and simple: chilla with paneer, paneer sandwich or bhurji, poha with peanuts or sprouts chaat.'}
LUNCH_TEXT = {
    'nonveg': 'Choose: dal + sabzi + phulka thali, chicken or paneer tikka with phulka, rajma or chole with a small rice portion, '
              'khichdi with curd, egg curry with phulka, or a grilled chicken salad bowl.',
    'egg': 'Choose: dal + sabzi + phulka thali, paneer tikka with phulka, rajma or chole with a small rice portion, khichdi with curd, '
           'egg curry or egg bhurji with phulka, or a paneer salad bowl.',
    'veg': 'Choose: dal + sabzi + phulka thali, paneer tikka with phulka, rajma or chole with a small rice portion, khichdi with curd, '
           'soya chunk curry with phulka, or a paneer or sprouts salad bowl.'}
PROT_FOODS = {'nonveg': 'dal, chicken, paneer, egg', 'egg': 'dal, paneer, egg', 'veg': 'dal, paneer, soya, curd'}
SWAP_TEXT = {'nonveg': '2 eggs, 100 g chicken, 100 g paneer or 150 g hung curd', 'egg': '2 eggs, 100 g paneer or 150 g hung curd',
             'veg': '100 g paneer, 150 g hung curd or 25 g soya chunks'}


def configure(name, age, sex, height, weight, diet='nonveg', activity='sedentary', kcal=None, protein=None, date=None):
    """Set the person's details and work out the targets."""
    global NAME, AGE, SEX, HT, WT, DIET, DATE, BMI, BMR, TDEE, IBW, ADJ, KCAL_T, PROT_T
    NAME, AGE, HT, WT, DIET = name, age, height, weight, diet
    male = sex.upper().startswith('M')
    SEX = 'Male' if male else 'Female'
    DATE = date or datetime.date.today().strftime('%-d %B %Y')
    BMI = WT / (HT / 100) ** 2
    BMR = 10 * WT + 6.25 * HT - 5 * AGE + (5 if male else -161)       # Mifflin-St Jeor
    TDEE = BMR * ACTIVITY[activity]
    IBW = (50 if male else 45.5) + 0.9 * (HT - 152.4)                   # Devine ideal body weight
    ADJ = IBW + 0.4 * (WT - IBW) if WT > IBW else WT                    # adjusted body weight
    KCAL_T = kcal or max(1500 if male else 1200, int(round((TDEE - 650) / 50)) * 50)
    PROT_T = protein or int(round(1.3 * ADJ / 5)) * 5


# ---------------- foods ----------------
FIXED = {  # name: (kcal, protein, carbs, fat, fibre) for items not in the catalogue
    'whey': (120, 24, 3, 1.5, 0),        # 1 scoop (30 g) whey protein isolate/concentrate, typical label
    'broth': (50, 9, 1, 1.5, 0),         # 300 ml chicken/mutton bone broth, home-made, fat skimmed (approx.)
    'infusion': (5, 0.2, 1, 0, 0.5),     # seeds steeped in water: only the infusion is drunk
    'chutney': (10, 0.5, 1.5, 0.2, 0.8), # 2 tbsp mint-coriander chutney, no sugar
}


def calc(spec):
    """spec: list of (catalogue key or FIXED key, grams or count) -> kcal, protein, carbs, fat, fibre."""
    t = [0.0] * 5
    for k, g in spec:
        if k in FIXED:
            v = FIXED[k]
            for i in range(5):
                t[i] += v[i] * g
        else:
            c = CAT[k]
            for i, f in enumerate(('kcal', 'p', 'c', 'f', 'fib')):
                t[i] += c[f] * g / 100
    return t


VEG = 'cucumber'
SALAD = [('cucumber', 80), ('tomato', 50), ('onion', 20), ('carrot', 30), ('lemon', 5)]
PHULKA1 = [('atta', 25)]   # one phulka without ghee

DETOX = [
    ('Jeera water: 1 tsp cumin seeds boiled in 1 glass water, sipped warm', '1 glass', [('infusion', 1)]),
    ('Methi water: 1 tsp fenugreek seeds soaked overnight, drink the water', '1 glass', [('infusion', 1)]),
    ('Warm lemon-ginger water (no honey, no sugar)', '1 glass', [('lemon', 15), ('ginger', 3)]),
    ('Cinnamon water: 1 small stick simmered in water', '1 glass', [('infusion', 1)]),
    ('Amla-ginger shot: 1 amla + a little ginger blended with water', '100 ml', [('amla', 30), ('ginger', 4)]),
    ('Ajwain water: ½ tsp carom seeds boiled in water', '1 glass', [('infusion', 1)]),
    ('Ash gourd (petha) juice with lemon, fresh, no sugar', '150 ml', [('ashgourd', 150), ('lemon', 5)]),
]
BREAKFAST = [
    ('Besan chilla stuffed with grated paneer, onion, tomato and capsicum + mint chutney', '2 small chillas (45 g besan, 40 g paneer)',
     [('besan', 45), ('paneer', 40), ('onion', 20), ('tomato', 20), ('capsicum', 15), ('oil', 4), ('chutney', 1)]),
    ('Bread omelette: 2-egg vegetable omelette with whole-wheat bread', '2 eggs + 2 slices',
     [('egg', 100), ('bread', 60), ('onion', 15), ('tomato', 15), ('capsicum', 10), ('oil', 3)]),
    ('Poha with peanuts and peas + a bowl of curd', '1 plate (45 g dry poha) + ½ cup curd',
     [('poha', 45), ('peanut', 10), ('peas', 25), ('onion', 30), ('oil', 4), ('lemon', 5), ('curd', 100)]),
    ('Tandoori chicken (grilled or air-fried) with onion-cucumber salad and mint chutney + 1 toast', '100 g boneless chicken + 1 slice',
     [('chicken', 100), ('hungcurd', 20), ('oil', 3), ('cucumber', 50), ('onion', 30), ('chutney', 1), ('bread', 30)]),
    ('Moong dal chilla with grated paneer + mint chutney', '2 small chillas (45 g dal, 30 g paneer)',
     [('moong', 45), ('paneer', 30), ('onion', 15), ('tomato', 15), ('oil', 4), ('chutney', 1)]),
    ('Egg bhurji with onion and tomato + 2 whole-wheat toasts', '2 eggs + 2 slices',
     [('egg', 100), ('onion', 25), ('tomato', 25), ('oil', 4), ('bread', 60)]),
    ('Idli with sambar + coconut-free mint chutney', '3 small idlis + 1 katori sambar',
     [('idlirice', 45), ('urad', 15), ('toor', 15), ('lauki', 30), ('tomato', 30), ('oil', 2), ('chutney', 1)]),
]
FRUIT = [('Guava', '1 medium', [('guava', 100)]), ('Apple', '1 small', [('apple', 120)]), ('Papaya', '1 cup', [('papaya', 145)]),
         ('Orange', '1 medium', [('orange', 140)]), ('Guava', '1 medium', [('guava', 100)]), ('Papaya', '1 cup', [('papaya', 145)]),
         ('Apple', '1 small', [('apple', 120)])]
LUNCH = [
    ('Dal tadka + mixed veg sabzi + 2 phulka + salad', '1 katori dal, 1 katori sabzi, 2 phulka',
     [('toor', 30), ('oil', 5), ('tomato', 20), ('onion', 10), ('atta', 50), ('cauliflower', 50), ('beans', 40), ('carrot', 30), ('oil', 5)] + SALAD),
    ('Chicken tikka (5 pieces) + 1 phulka + salad + mint chutney', '120 g chicken, 1 phulka',
     [('chicken', 120), ('hungcurd', 20), ('oil', 5), ('chutney', 1)] + PHULKA1 + SALAD),
    ('Rajma chawal bowl: rajma + a small portion of rice + salad + curd', '1 katori rajma, ½ cup rice, ½ cup curd',
     [('rajma', 35), ('oil', 5), ('onion', 20), ('tomato', 20), ('rice', 35), ('curd', 100)] + SALAD),
    ('Paneer tikka (dry, grilled) + 1 phulka + salad', '80 g paneer, 1 phulka',
     [('paneer', 80), ('capsicum', 30), ('onion', 30), ('hungcurd', 20), ('oil', 5)] + PHULKA1 + SALAD),
    ('Home-style chicken curry (ask for less oil) + 1 phulka + salad', '1 katori curry (4 pieces), 1 phulka',
     [('chickencut', 120), ('oil', 8), ('onion', 30), ('tomato', 30)] + PHULKA1 + SALAD),
    ('Moong dal khichdi + curd + salad', '1 bowl khichdi, ½ cup curd',
     [('rice', 30), ('moong', 30), ('ghee', 5), ('curd', 100)] + SALAD),
    ('Egg curry (2 eggs) + 1 phulka + salad', '2 eggs in gravy, 1 phulka',
     [('egg', 100), ('oil', 6), ('onion', 35), ('tomato', 35)] + PHULKA1 + SALAD),
]
DINNER = [
    ('Tomato soup (no cream, no cornflour) with roasted makhana', '1 large bowl (300 ml) + 1 cup makhana',
     [('tomato', 250), ('onion', 20), ('oil', 3), ('makhana', 20), ('hungcurd', 30)]),
    ('Moong dal with grated paneer and sautéed vegetables', '1 bowl dal + 30 g paneer',
     [('moong', 30), ('paneer', 30), ('spinach', 30), ('carrot', 30), ('beans', 30), ('oil', 3)]),
    ('Chicken clear soup with vegetables', '1 large bowl (300 ml), 80 g chicken',
     [('chicken', 80), ('carrot', 40), ('cabbage', 40), ('beans', 30), ('oil', 2)]),
    ('Bone broth with sautéed vegetables + 1 boiled egg', '300 ml broth, 1 bowl vegetables, 1 egg',
     [('broth', 1), ('mushroom', 50), ('beans', 50), ('capsicum', 50), ('oil', 3), ('egg', 50)]),
    ('Lauki (ghiya) soup + grilled paneer cubes', '1 large bowl (300 ml) + 40 g paneer',
     [('lauki', 250), ('moong', 15), ('oil', 3), ('paneer', 40)]),
    ('Boiled rajma with vegetables, lemon and curd', '1 bowl rajma salad + ¾ cup curd',
     [('rajma', 30), ('onion', 25), ('tomato', 30), ('cucumber', 30), ('capsicum', 15), ('lemon', 5), ('curd', 150)]),
    ('Chickpea salad with cucumber, tomato, onion and lemon + curd', '1 bowl salad + ½ cup curd',
     [('chickpea', 35), ('cucumber', 60), ('tomato', 40), ('onion', 20), ('lemon', 10), ('oil', 3), ('curd', 100)]),
]
# Swaps for vegetarian and eggetarian plans: (meal list, day index) -> {'egg': item, 'veg': item}
PANEER_BHURJI = ('Paneer bhurji with onion and tomato + 2 whole-wheat toasts', '60 g paneer + 2 slices',
                 [('paneer', 60), ('onion', 25), ('tomato', 25), ('oil', 3), ('bread', 60)])
SPROUTS = ('Moong sprouts chaat with hung curd dip + 1 whole-wheat toast', '1 bowl sprouts + ½ cup hung curd + 1 slice',
           [('sprouts', 150), ('onion', 20), ('tomato', 30), ('lemon', 5), ('hungcurd', 100), ('bread', 30)])
ALT = {
    ('B', 1): {'veg': ('Paneer sandwich: grated paneer, onion and capsicum in whole-wheat bread', '60 g paneer + 2 slices',
                       [('paneer', 60), ('onion', 15), ('capsicum', 15), ('bread', 60), ('oil', 2)])},
    ('B', 3): {'egg': SPROUTS, 'veg': SPROUTS},
    ('B', 5): {'veg': PANEER_BHURJI},
    ('L', 1): {'egg': ('Chole (less oil) + 1 phulka + salad + curd', '1 katori chole, 1 phulka, ½ cup curd',
                       [('chickpea', 35), ('oil', 5), ('onion', 25), ('tomato', 25), ('curd', 100), ('atta', 25)] + SALAD)},
    ('L', 4): {'egg': ('Palak paneer (less oil) + 1 phulka + salad', '1 katori palak paneer (60 g paneer), 1 phulka',
                       [('spinach', 120), ('paneer', 60), ('oil', 5), ('onion', 25), ('tomato', 25), ('atta', 25)] + SALAD)},
    ('L', 6): {'veg': ('Soya chunk curry + 1 phulka + salad', '1 katori curry (25 g dry soya chunks), 1 phulka',
                       [('soya', 25), ('oil', 5), ('onion', 30), ('tomato', 30), ('atta', 25)] + SALAD)},
    ('D', 2): {'egg': ('Paneer and vegetable clear soup', '1 large bowl (300 ml), 50 g paneer',
                       [('paneer', 50), ('carrot', 40), ('cabbage', 40), ('beans', 30), ('oil', 2)])},
    ('D', 3): {'egg': ('Mixed dal soup with sautéed vegetables + 1 boiled egg', '1 bowl dal soup, 1 bowl vegetables, 1 egg',
                       [('masoor', 25), ('mushroom', 50), ('beans', 50), ('capsicum', 50), ('oil', 3), ('egg', 50)]),
               'veg': ('Mixed dal soup with sautéed vegetables + hung curd', '1 bowl dal soup, 1 bowl vegetables, ½ cup hung curd',
                       [('masoor', 25), ('mushroom', 50), ('beans', 50), ('capsicum', 50), ('oil', 3), ('hungcurd', 80)])},
}


def choose(meal, d, item, diet):
    alt = ALT.get((meal, d), {})
    if diet == 'nonveg':
        return item
    if diet == 'egg':
        return alt.get('egg', item)
    return alt.get('veg', alt.get('egg', item))


SHAKE = ('Protein shake (whey in water)', '1 scoop (30 g)', [('whey', 1)])
TEA = ('Green tea or tea, no sugar', '1 cup', [('milk', 50)])

DAYS = []


def scaled(spec, f):
    return [(k, g * f if k not in ('infusion', 'chutney', 'broth', 'whey') else g) for k, g in spec]


def make_days():
    """Build the 7 days for DIET, scaling breakfast, lunch and dinner portions (quarter steps) towards KCAL_T."""
    def day_rows(d, f):
            b, l, n = choose('B', d, BREAKFAST[d], DIET), choose('L', d, LUNCH[d], DIET), choose('D', d, DINNER[d], DIET)
            tag = '' if f == 1 else f' (portion ×{f:g})'
            rows = [('7:00 AM', 'Detox Drink', *DETOX[d]), ('8:30 AM', 'Breakfast', b[0], b[1] + tag, scaled(b[2], f)),
                    ('11:00 AM', 'Protein 1', SHAKE[0] + f' + {FRUIT[d][0].lower()}', f'{SHAKE[1]} + {FRUIT[d][1]}', SHAKE[2] + FRUIT[d][2]),
                    ('1:30 PM', 'Lunch', l[0], l[1] + tag, scaled(l[2], f)),
                    ('4:30 PM', 'Protein 2', SHAKE[0] + ' + ' + TEA[0].lower(), SHAKE[1] + ' + ' + TEA[1], SHAKE[2] + TEA[2]),
                    ('7:30 PM', 'Dinner', n[0], n[1] + tag, scaled(n[2], f))]
            return [(t, m, w, q, calc(spec)) for t, m, w, q, spec in rows]
    days = []
    for d in range(7):   # each day: the portion size (0.7 to 2.2 times standard, 0.05 steps) closest to the target
        options = [day_rows(d, round(x * 0.05, 2)) for x in range(14, 45)]
        days.append(min(options, key=lambda rows: abs(sum(r[4][0] for r in rows) - KCAL_T)))
    DAYS[:] = days


def tot(day):
    return [sum(r[4][i] for r in day) for i in range(5)]


# ---------------- layout ----------------
SERIES = 'P E R S O N A L   D I E T   P L A N'
cellb = ParagraphStyle('vcb', parent=cell, fontName='Lato-Bold', textColor=NAVY, fontSize=8.7, leading=10.8)
dcell = ParagraphStyle('vdc', parent=cell, fontSize=8.7, leading=10.8)
dcellr = ParagraphStyle('vdr', parent=dcell, alignment=TA_RIGHT)
dnote = ParagraphStyle('vdn', parent=dcell, fontSize=7.8, leading=9.8, textColor=colors.HexColor('#7F7068'))
hcell = ParagraphStyle('vhc', parent=cell, fontName='Lato-Bold', fontSize=6.6, leading=9.5, textColor=colors.HexColor('#BFE3F5'))
hcellr = ParagraphStyle('vhr', parent=hcell, alignment=TA_RIGHT)
dayst = ParagraphStyle('vday', fontName='DMSerif', fontSize=13.5, leading=16, textColor=WHITE)


def tstyle(n, extra=()):
    st = [('BACKGROUND', (0, 0), (-1, 0), NAVY), ('LINEBELOW', (0, 0), (-1, 0), 1.4, GOLD), ('BACKGROUND', (0, 1), (-1, -1), WHITE),
          ('LINEBELOW', (0, 1), (-1, -1), 0.4, HAIR), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
          ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
          ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 7),
          ('BOX', (0, 0), (-1, -1), 0.6, GOLD_L), ('ROUNDEDCORNERS', [8, 8, 8, 8])]
    st += [('BACKGROUND', (0, r), (-1, r), ZEBRA) for r in range(2, n, 2)]
    return TableStyle(st + list(extra))


def day_table(i, day):
    t = tot(day)
    rows = [[Paragraph(f'Day {i + 1}', dayst), '', '', Paragraph(f'<font name="Lato-Bold" size="8.5" color="#BFE3F5">{t[0]:.0f} kcal  ·  {t[1]:.0f} g protein</font>',
                                                                ParagraphStyle('vt', parent=dcellr)), '', '', '', '', ''],
            [Paragraph(x, hcell if k < 3 else hcellr) for k, x in enumerate(['TIME', 'MEAL', 'WHAT TO EAT', 'QUANTITY', 'KCAL', 'PROTEIN', 'CARBS', 'FAT', 'FIBRE'])]]
    num = ParagraphStyle('vnum', parent=dcellr, fontSize=8.2)
    for tm, meal, what, qty, v in day:
        rows.append([Paragraph(tm.replace(' ', '&nbsp;'), dcell), Paragraph(meal, cellb), Paragraph(esc(what), dcell), Paragraph(esc(qty), dnote),
                     Paragraph(f'{v[0]:.0f}', num), Paragraph(f'{v[1]:.1f} g', num), Paragraph(f'{v[2]:.1f} g', num), Paragraph(f'{v[3]:.1f} g', num),
                     Paragraph(f'{v[4]:.1f} g', num)])
    rows.append(['', Paragraph('Day total', cellb), '', '', Paragraph(f'<b>{t[0]:.0f}</b>', num), Paragraph(f'<b>{t[1]:.0f} g</b>', num),
                 Paragraph(f'<b>{t[2]:.0f} g</b>', num), Paragraph(f'<b>{t[3]:.0f} g</b>', num), Paragraph(f'<b>{t[4]:.0f} g</b>', num)])
    n = len(rows)
    tb = Table(rows, colWidths=[CW * 0.1, CW * 0.11, CW * 0.28, CW * 0.15, CW * 0.07, CW * 0.08, CW * 0.07, CW * 0.07, CW * 0.07])
    st = [('SPAN', (0, 0), (2, 0)), ('SPAN', (3, 0), (8, 0)), ('BACKGROUND', (0, 0), (-1, 1), NAVY),
          ('LINEBELOW', (0, 1), (-1, 1), 1.4, GOLD), ('BACKGROUND', (0, 2), (-1, -2), WHITE), ('BACKGROUND', (0, n - 1), (-1, n - 1), CREAM),
          ('LINEBELOW', (0, 2), (-1, -2), 0.4, HAIR), ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
          ('TOPPADDING', (0, 0), (-1, -1), 2.8), ('BOTTOMPADDING', (0, 0), (-1, -1), 2.8), ('TOPPADDING', (0, 0), (-1, 0), 7),
          ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4),
          ('BOX', (0, 0), (-1, -1), 0.6, GOLD_L), ('ROUNDEDCORNERS', [8, 8, 8, 8])]
    st += [('BACKGROUND', (0, r), (-1, r), ZEBRA) for r in range(3, n - 1, 2)]
    tb.setStyle(TableStyle(st))
    return tb


def section(no, title):
    return [Paragraph(f'<font name="Lato-Bold" size="9" color="#29A8E0">{no:02d}</font>&nbsp;&nbsp;&nbsp;{esc(title)}', h2), rule()]


def bmi_text():
    if BMI >= 30:
        return 'Obesity (above 30 by WHO and above 25 by Asian-Indian cut-offs).'
    if BMI >= 25:
        return 'Obesity by Asian-Indian cut-offs (25 and above); overweight by WHO.'
    if BMI >= 23:
        return 'Overweight by Asian-Indian cut-offs (23-24.9).'
    return 'Within the healthy range for Indian adults.'


def build(path, logo):
    make_days()
    doc = BaseDocTemplate(path, pagesize=A4, pageCompression=1, title=f'Diet Plan - {NAME} - Hindivine GLP-1 Programme',
                          author='Hindivine Healthcare Private Limited', subject='Personal diet plan', creator='www.hindivine.com')
    frame = Frame(16 * mm, 19 * mm, CW, H - HEADER_H - 7 * mm - 19 * mm, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id='p', frames=[frame], onPage=deco(logo, SERIES))])
    totals = [tot(d) for d in DAYS]
    avg = [sum(t[i] for t in totals) / 7 for i in range(5)]

    hk = ParagraphStyle('hk', fontName='Lato-Bold', fontSize=7.8, leading=10, textColor=colors.HexColor('#8FD3F4'))
    ht = ParagraphStyle('ht', fontName='DMSerif', fontSize=27, leading=30, textColor=WHITE)
    hd = ParagraphStyle('hd', fontName='DMSerif-Italic', fontSize=12, leading=16.5, textColor=colors.HexColor('#D6E7F3'))
    head = [Paragraph(spaced('Personal diet plan') + '&nbsp;&nbsp;·&nbsp;&nbsp;' + spaced('GLP-1 programme'), hk), Spacer(1, 5),
            Paragraph(NAME, ht), HRFlowable(width=24 * mm, thickness=1.6, color=GOLD, hAlign='LEFT', spaceBefore=6, spaceAfter=8),
            chips([(f'{AGE} Y · {SEX.upper()}', '#0B3B66', '#E4F1FA'), (f'{HT} CM', '#0B3B66', '#E4F1FA'), (f'{WT} KG', '#0B3B66', '#E4F1FA'),
                   (f'BMI {BMI:.1f}', '#A33A1F', '#F9E3DB'), (DIET_LABEL[DIET], '#2E7D32', '#E8F5E9')]),
            Spacer(1, 8),
            Paragraph('Simple Indian meals with a detox drink every morning, protein twice a day, office-friendly lunches and '
                      'light soup or salad dinners, set for steady weight loss alongside GLP-1 treatment.', hd), Spacer(1, 6),
            Paragraph(f'<font name="Lato-Bold" size="7.5" color="#8FD3F4">{spaced("Date")}</font>&nbsp;&nbsp;&nbsp;{DATE}',
                      ParagraphStyle('dt', parent=body, fontSize=9, textColor=WHITE))]
    side = [Paragraph(spaced('Target'), ParagraphStyle('pn', fontName='Lato-Bold', fontSize=7, leading=9, textColor=colors.HexColor('#8FD3F4'), alignment=TA_CENTER)),
            Spacer(1, 4), Paragraph(f'{KCAL_T:,}', ParagraphStyle('pnn', fontName='DMSerif', fontSize=30, leading=32, textColor=WHITE, alignment=TA_CENTER)),
            Spacer(1, 3), Paragraph(spaced('kcal a day'), ParagraphStyle('ph', fontName='Lato-Bold', fontSize=6.5, leading=8, textColor=colors.HexColor('#8FD3F4'), alignment=TA_CENTER))]
    hero = Table([[head, side]], colWidths=[CW - 34 * mm, 34 * mm])
    hero.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), NAVY), ('ROUNDEDCORNERS', [10, 10, 10, 10]), ('VALIGN', (0, 0), (0, 0), 'TOP'),
                              ('VALIGN', (1, 0), (1, 0), 'MIDDLE'), ('LINEBEFORE', (1, 0), (1, 0), 0.8, colors.HexColor('#2C6A9C')),
                              ('LEFTPADDING', (0, 0), (0, 0), 16), ('RIGHTPADDING', (0, 0), (0, 0), 14),
                              ('TOPPADDING', (0, 0), (-1, -1), 15), ('BOTTOMPADDING', (0, 0), (-1, -1), 16)]))

    def big(v, u, lab, col):
        return [Paragraph(f'<font name="DMSerif" size="22" color="{col}">{v}</font><font size="9" color="{col}"> {u}</font>',
                          ParagraphStyle('bv', fontName='Lato', alignment=TA_CENTER, leading=24)), Spacer(1, 2),
                Paragraph(f'<font color="{col}">{spaced(lab)}</font>', label)]

    def sm(v, u, lab):
        return [Paragraph(f'<font name="DMSerif" size="16" color="#0B3B66">{v}</font><font size="8" color="#0B3B66"> {u}</font>',
                          ParagraphStyle('sv', fontName='Lato', alignment=TA_CENTER, leading=18)), Spacer(1, 2), Paragraph(spaced(lab), label)]
    strip = tile_row([big(f'{avg[0]:.0f}', 'kcal', 'Avg calories / day', '#D9573A'), big(f'{avg[1]:.0f}', 'g', 'Avg protein / day', '#0E8A78'),
                      sm(f'{avg[4]:.0f}', 'g', 'Fibre'), sm('2.5-3', 'L', 'Water'), sm('6', '', 'Meals a day')],
                     [CW * 0.26, CW * 0.26, CW * 0.16, CW * 0.16, CW * 0.16],
                     [('BACKGROUND', (0, 0), (0, 0), ROSE), ('BACKGROUND', (1, 0), (1, 0), MINT), ('BACKGROUND', (2, 0), (-1, 0), WHITE),
                      ('LINEABOVE', (0, 0), (0, 0), 2.2, TERRA), ('LINEABOVE', (1, 0), (1, 0), 2.2, EMERALD), ('LINEABOVE', (2, 0), (-1, 0), 2.2, GOLD),
                      ('LINEAFTER', (0, 0), (-2, 0), 3, WHITE)])

    lo, hi = 18.5 * (HT / 100) ** 2, 22.9 * (HT / 100) ** 2
    nums = [['MEASURE', 'VALUE', 'WHAT IT MEANS'],
            ['Body mass index (BMI)', f'{BMI:.1f} kg/m²', bmi_text()],
            ['Healthy weight range', f'{lo:.0f}-{hi:.0f} kg', 'BMI 18.5-22.9, the range advised for Indian adults.'],
            ['Estimated maintenance calories', f'about {TDEE:,.0f} kcal', 'Mifflin-St Jeor equation adjusted for daily activity.'],
            ['Plan calories', f'{KCAL_T:,} kcal (±100)', f'About {TDEE - KCAL_T:,.0f} kcal below maintenance; expected loss 0.5-1 kg a week with GLP-1 treatment.'],
            ['Protein target', f'{PROT_T} g a day', f'About 1.3 g per kg of adjusted body weight ({ADJ:.0f} kg) to protect muscle while losing weight.'],
            ['First goal', f'{WT * 0.9:.0f}-{WT * 0.95:.0f} kg', '5-10% weight loss in 3-6 months, which improves blood sugar, blood pressure and joint pain.']]
    nt = Table([[Paragraph(x, hcell) for x in nums[0]]] + [[Paragraph(f'<b>{esc(a)}</b>', ParagraphStyle('x', parent=dcell, textColor=NAVY)),
                                                           Paragraph(esc(b), dcell), Paragraph(esc(c), dnote)] for a, b, c in nums[1:]],
               colWidths=[CW * 0.3, CW * 0.2, CW * 0.5])
    nt.setStyle(tstyle(len(nums)))

    routine = [['TIME', 'WHAT', 'WHY'],
               ['7:00 AM', 'Detox drink (a different one each day)', 'Hydration first thing; no sugar or honey.'],
               ['8:30 AM', 'Breakfast', BF_TEXT[DIET]],
               ['11:00 AM', 'Protein 1: protein shake + 1 fruit', 'First protein dose; fruit adds fibre.'],
               ['1:30 PM', 'Lunch (office delivery)', 'A normal home-style meal: protein + 1-2 phulka or a little rice + salad.'],
               ['4:30 PM', 'Protein 2: protein shake + tea', 'Second protein dose; keeps evening hunger low.'],
               ['7:30 PM', 'Dinner: soup or salad', 'Light and early, at least 2-3 hours before bed.']]
    rt = Table([[Paragraph(x, hcell) for x in routine[0]]] + [[Paragraph(a, dcell), Paragraph(f'<b>{esc(b)}</b>', ParagraphStyle('y', parent=dcell, textColor=NAVY)),
                                                              Paragraph(esc(c), dnote)] for a, b, c in routine[1:]],
               colWidths=[CW * 0.13, CW * 0.37, CW * 0.5])
    rt.setStyle(tstyle(len(routine)))

    s = [hero, Spacer(1, 10), strip, Spacer(1, 6)]
    s.append(KeepTogether(section(1, 'Your Numbers') + [nt]))
    s.append(Spacer(1, 4))
    s.append(KeepTogether(section(2, 'Your Daily Routine') + [rt]))
    s.append(Spacer(1, 4))
    s.append(KeepTogether(section(3, 'Your 7-Day Meal Plan') + [Paragraph(
        'Calories and protein are for the quantity shown. A katori is a 150 ml bowl; a phulka is a thin roti made from 25 g atta, with no ghee. '
        'The same 7 days can be repeated; swap any meal for another from the same column on a different day.', small), Spacer(1, 8), day_table(0, DAYS[0])]))
    for i in range(1, 7):
        s += [Spacer(1, 8), KeepTogether([day_table(i, DAYS[i])])]

    s.append(Spacer(1, 4))
    s.append(KeepTogether(section(4, 'Ordering Lunch at the Office') + [card(bullets([
        LUNCH_TEXT[DIET],
        'Ask for: less oil, no butter or ghee on top, phulka instead of naan or paratha, salad and raita on the side.',
        f'Eat in this order: salad, then the protein ({PROT_FOODS[DIET]}), then roti or rice. Stop at the first sign of fullness.',
        'Skip: naan, kulcha, puri, biryani, fried starters, creamy gravies (makhani, malai, korma) and sweetened drinks.']),
        CREAM, GOLD_L, spaced('Easy to order, easy on the plan'), ParagraphStyle('bhn', parent=boxhead, textColor=NAVY))]))
    s.append(Spacer(1, 8))
    s.append(KeepTogether(section(5, 'Guidelines for the GLP-1 Programme') + [card(bullets([
        f'Take both protein shakes every day; if you miss one, add {SWAP_TEXT[DIET]} to a meal instead.',
        'Eat slowly, take small bites and stop when you feel comfortably full; it is fine to leave part of a portion.',
        'Sip 2.5-3 litres of water through the day, between meals rather than with them.',
        'Eat fruit, salad and vegetables daily and keep up the water to prevent constipation, a common side effect.',
        'Walk 30-45 minutes a day and do strength exercise 2-3 times a week to keep muscle.',
        'Weigh yourself once a week, on the same day and time, and note your waist size every 2 weeks.']), MINT, EMERALD, spaced('Do'), boxhead)]))
    s.append(Spacer(1, 8))
    s.append(card(bullets([
        'Sugar, sweets, bakery items, fruit juices and sweetened or fizzy drinks.',
        'Fried, greasy and very spicy food, which can worsen nausea on GLP-1 treatment.',
        'Large meals, eating late at night and lying down soon after eating.',
        'Alcohol. Call your doctor if you have persistent vomiting, severe stomach pain or cannot keep fluids down.']),
        ROSE, TERRA, spaced('Limit or avoid'), warnhead))
    s.append(Spacer(1, 10))
    s.append(HRFlowable(width='100%', thickness=0.5, color=GOLD_L, spaceAfter=6))
    s.append(Paragraph('<b>Note:</b> This plan is prepared for the person named above as part of the Hindivine GLP-1 programme. Calorie and protein '
                       'values are estimates from standard ingredient data (IFCT 2017 / USDA) and typical product labels; restaurant food varies. '
                       'Review the plan with your doctor or dietitian at each follow-up, and follow their advice on your medicine dose.', small))
    s += our_services()
    doc.build(s)
    return totals


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description='Hindivine personal GLP-1 programme diet plan (PDF).')
    ap.add_argument('--name', required=True)
    ap.add_argument('--age', type=int, required=True)
    ap.add_argument('--sex', required=True, help='F or M')
    ap.add_argument('--height', type=float, required=True, help='cm')
    ap.add_argument('--weight', type=float, required=True, help='kg')
    ap.add_argument('--diet', default='nonveg', choices=['veg', 'egg', 'nonveg'])
    ap.add_argument('--activity', default='sedentary', choices=list(ACTIVITY))
    ap.add_argument('--kcal', type=int, help='override the calorie target')
    ap.add_argument('--protein', type=int, help='override the protein target (g)')
    ap.add_argument('--date', help='date printed on the plan (default today)')
    ap.add_argument('--out', help='output PDF (default: Name-GLP-1-Diet-Plan.pdf)')
    ap.add_argument('--logo', default='logo-small.jpg')
    a = ap.parse_args()
    configure(a.name, a.age, a.sex, a.height, a.weight, a.diet, a.activity, a.kcal, a.protein, a.date)
    out = a.out or a.name.replace(' ', '-') + '-GLP-1-Diet-Plan.pdf'
    totals = build(out, a.logo)
    print(f'{out}: BMI {BMI:.1f}, target {KCAL_T} kcal and {PROT_T} g protein a day')
    for i, t in enumerate(totals):
        print(f'  Day {i + 1}: {t[0]:.0f} kcal, {t[1]:.0f} g protein, {t[4]:.0f} g fibre')
