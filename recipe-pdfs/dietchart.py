"""Hindivine 7-day weight-loss diet charts: one branded A4 PDF per plan.

    python3 dietchart.py LOGO OUT_DIR [--only N,N] [--limit N]
"""
import csv
import os
import sys
from concurrent.futures import ProcessPoolExecutor

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.platypus.flowables import HRFlowable

import dietplan as D
from core import frac
from render import (deco, HEADER_H, CW, H, NAVY, GOLD, GOLD_L, CREAM, WHITE, INK, TAUPE, TERRA, EMERALD, ROSE, MINT, HAIR,
                    ZEBRA, body, small, h2, cell, label, boxhead, warnhead, esc, spaced, rule, card, bullets, chips, tile_row,
                    our_services)

SERIES = 'W E I G H T   L O S S   D I E T   C H A R T'
cellb = ParagraphStyle('dcb', parent=cell, fontName='Lato-Bold', textColor=NAVY)
cellr = ParagraphStyle('dcr', parent=cell, alignment=TA_RIGHT)
cellrb = ParagraphStyle('dcrb', parent=cellr, fontName='Lato-Bold', textColor=NAVY)
hcell = ParagraphStyle('dhc', parent=cell, fontName='Lato-Bold', fontSize=7.2, leading=9.5, textColor=colors.HexColor('#BFE3F5'))
hcellr = ParagraphStyle('dhcr', parent=hcell, alignment=TA_RIGHT)
dayst = ParagraphStyle('dday', fontName='DMSerif', fontSize=13.5, leading=16, textColor=WHITE)
gc = ParagraphStyle('dgc', parent=cell, fontSize=8.4, leading=10.5)
gcb = ParagraphStyle('dgcb', parent=gc, fontName='Lato-Bold', textColor=NAVY)
gcr = ParagraphStyle('dgcr', parent=gc, alignment=TA_RIGHT)
tcell = ParagraphStyle('dtc', parent=cell, fontSize=8.6)
note = ParagraphStyle('dnote', parent=cell, fontSize=8.2, leading=10.5, textColor=TAUPE)

FOCUS_INFO = {
    'general': ('Balanced Indian meals for steady, sustainable fat loss.',
                ['Adults who want to lose weight steadily with home-style Indian food.',
                 'Anyone starting a healthier routine without special medical needs.'],
                ['Fill half your plate with vegetables or salad, a quarter with dal, paneer, egg or other protein and a quarter with roti or rice.',
                 'Cook with 3-4 teaspoons of oil in total per person per day; measure it rather than pouring.',
                 'Walk 30-45 minutes a day and add 2-3 days of strength exercise a week.',
                 'Sleep 7-8 hours; poor sleep raises hunger hormones.'],
                ['Sugary drinks, packaged juices, sweets and bakery items.', 'Deep-fried snacks (pakora, samosa, puri) and namkeen.',
                 'Eating late at night or straight from the packet.']),
    'protein': ('More protein at every meal to protect muscle and keep you full while losing fat.',
                ['People who exercise or do strength training while losing weight.', 'Anyone who feels hungry on regular diet plans.'],
                ['Eat the protein part of each meal (dal, paneer, egg, chicken, sprouts, curd) first.',
                 'Spread protein across the day rather than in one big meal.',
                 'Do strength training 2-4 times a week to make the most of the extra protein.',
                 'Drink 2.5-3 litres of water a day.'],
                ['People with kidney disease should not follow a high-protein plan without their doctor\'s advice.',
                 'Protein bars and shakes with added sugar.', 'Processed meats (sausages, salami).']),
    'diabetes': ('Low-GI, high-fibre meals with no added sugar to support weight loss and blood-sugar control.',
                 ['Adults with type 2 diabetes or prediabetes who need to lose weight.', 'People with high fasting sugar or HbA1c.'],
                 ['Eat at regular times and do not skip meals, especially if you take insulin or sugar-lowering tablets.',
                  'Eat salad and vegetables first, then protein, then roti or rice.',
                  'Prefer whole grains and millets (jowar, bajra, ragi, brown rice) over white rice and maida.',
                  'Check your blood sugar as your doctor advises and walk 10-15 minutes after meals.'],
                 ['Sugar, jaggery, honey, sweets, fruit juices and sweetened drinks.', 'White rice, maida, bread and potato in large amounts.',
                  'Mangoes, grapes, chikoo and bananas in large portions; prefer guava, apple, orange or papaya.']),
    'pcos': ('Protein-forward, low-GI meals to support weight loss, insulin sensitivity and cycle health.',
             ['Women with PCOS / PCOD who want to lose weight.', 'Women with insulin resistance, irregular periods or acne linked to PCOS.'],
             ['Pair every carbohydrate with protein and fibre to keep insulin steady.',
              'Include seeds (flax, pumpkin, sesame) and nuts in small amounts for healthy fats.',
              'Combine walking with 2-3 days of strength training each week.',
              'Keep regular sleep and meal times; manage stress with yoga or breathing exercises.'],
             ['Sugar, sweets, bakery items and sweetened drinks.', 'Refined grains (white rice, maida) and fried snacks.',
              'Skipping breakfast and long gaps followed by large meals.']),
    'thyroid': ('Balanced, iodine-aware meals for weight loss with hypothyroidism.',
                ['Adults with hypothyroidism who are on treatment and want to lose weight.'],
                ['Take your thyroid tablet with plain water on an empty stomach, 30-60 minutes before breakfast and tea or coffee.',
                 'Keep calcium and iron supplements at least 4 hours away from the thyroid tablet.',
                 'Use iodised salt; include selenium and zinc sources such as eggs, fish, seeds and nuts if your diet allows.',
                 'Cabbage, cauliflower and broccoli are fine when cooked.'],
                ['Large amounts of soy (soya chunks, tofu, soy milk), especially close to your tablet.',
                 'Highly processed and fried foods.', 'Changing your tablet dose without your doctor.']),
    'heart': ('Low saturated fat, low salt, high fibre meals for weight loss and heart health.',
              ['Adults with high cholesterol, high blood pressure or a family history of heart disease.'],
              ['Keep salt under 5 g a day (about 1 teaspoon in total), including cooking salt.',
               'Use mustard, groundnut, rice bran or olive oil; limit ghee, butter and coconut oil.',
               'Eat oats, dals, beans and vegetables daily for soluble fibre.',
               'Walk at least 150 minutes a week; follow your doctor\'s advice on exercise.'],
              ['Pickles, papad, namkeen, packaged soups and sauces (high salt).',
               'Red meat, full-fat cream, butter and fried foods.', 'Smoking and alcohol.']),
    'glp1': ('Small, protein-first meals that suit GLP-1 weight-loss injections and help limit side effects.',
             ['People on GLP-1 weight-loss injections prescribed by their doctor.', 'Anyone with a small appetite who needs nutrient-dense meals.'],
             ['Eat slowly and stop at the first sign of fullness; it is fine to leave part of a portion.',
              'Eat the protein part of each meal first to protect muscle while you lose weight.',
              'Sip 2.5-3 litres of fluids through the day, between meals rather than with them.',
              'Contact your doctor if you have persistent vomiting, severe stomach pain or cannot keep fluids down.'],
             ['Greasy, fried and very spicy food, which can worsen nausea.', 'Large meals and lying down soon after eating.',
              'Fizzy drinks and alcohol.']),
}


def portion(m):
    t = frac(m) if m != int(m) else str(int(m))
    return f'{t} serving' + ('' if m <= 1 else 's')


def day_table(di, day):
    t = D.totals(day)
    rows = [[Paragraph(f'Day {di + 1}  <font name="Lato-Bold" size="8.5" color="#8FD3F4">&nbsp;&nbsp;{spaced(D.DAYS[di])}</font>', dayst),
             '', Paragraph(f'<font name="Lato-Bold" size="8.5" color="#BFE3F5">{t["kcal"]:.0f} kcal  ·  {t["p"]:.0f} g protein</font>',
                           ParagraphStyle('dt', parent=cellr, textColor=WHITE)), '', '', ''],
            [Paragraph('TIME', hcell), Paragraph('MEAL', hcell), Paragraph('WHAT TO EAT', hcell),
             Paragraph('PORTION', hcellr), Paragraph('KCAL', hcellr), Paragraph('PROTEIN', hcellr)]]
    for s in day:
        what, por = [], []
        for i in s['items']:
            if i['r'] is not None:
                what.append(f'{esc(i["name"])} <font color="#7F7068" size="7.5">#{i["r"]["no"]:04d}</font>')
                por.append(portion(i['mult']))
            else:
                what.append(esc(i['name']))
                por.append('1')
        kc = sum(i['kcal1'] * i['mult'] for i in s['items'])
        pr = sum(i['p1'] * i['mult'] for i in s['items'])
        rows.append([Paragraph(s['time'].replace(' ', '&nbsp;'), tcell), Paragraph(s['label'], cellb), Paragraph('<br/>'.join(what), cell),
                     Paragraph('<br/>'.join(por), cellr), Paragraph(f'{kc:.0f}', cellr), Paragraph(f'{pr:.0f} g', cellr)])
    rows.append(['', Paragraph('Day total', cellb), Paragraph(f'Carbs {t["c"]:.0f} g  ·  Fat {t["f"]:.0f} g  ·  Fibre {t["fib"]:.0f} g', note), '',
                 Paragraph(f'{t["kcal"]:.0f}', cellrb), Paragraph(f'{t["p"]:.0f} g', cellrb)])
    tb = Table(rows, colWidths=[CW * 0.10, CW * 0.15, CW * 0.42, CW * 0.14, CW * 0.08, CW * 0.11])
    n = len(rows)
    st = [('SPAN', (0, 0), (2, 0)), ('SPAN', (3, 0), (5, 0)), ('SPAN', (2, n - 1), (3, n - 1)),
          ('BACKGROUND', (0, 0), (-1, 1), NAVY), ('LINEBELOW', (0, 1), (-1, 1), 1.4, GOLD),
          ('BACKGROUND', (0, 2), (-1, -2), WHITE), ('BACKGROUND', (0, n - 1), (-1, n - 1), CREAM),
          ('LINEABOVE', (0, n - 1), (-1, n - 1), 0.8, GOLD_L), ('LINEBELOW', (0, 2), (-1, -2), 0.4, HAIR),
          ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('VALIGN', (0, 2), (-1, -2), 'TOP'),
          ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
          ('TOPPADDING', (0, 0), (-1, 0), 7), ('BOTTOMPADDING', (0, 0), (-1, 0), 2),
          ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
          ('BOX', (0, 0), (-1, -1), 0.6, GOLD_L), ('ROUNDEDCORNERS', [8, 8, 8, 8])]
    for r in range(3, n - 1, 2):
        st.append(('BACKGROUND', (0, r), (-1, r), ZEBRA))
    tb.setStyle(TableStyle(st))
    return tb


def glance(p, tots):
    def main_of(day, slot):
        for sl in day:
            if sl['slot'] == slot:
                rs = [i for i in sl['items'] if i['r'] is not None]
                if slot != 'breakfast' and len(rs) > 1 and rs[0]['r']['cat'] == 'Soups':
                    rs = rs[1:]
                return esc(rs[0]['name']) if rs else ''
        return ''
    rows = [[Paragraph(x, hcell if k < 4 else hcellr) for k, x in enumerate(['DAY', 'BREAKFAST', 'LUNCH', 'DINNER', 'KCAL', 'PROTEIN'])]]
    for di, day in enumerate(p['days']):
        rows.append([Paragraph(f'<b>{D.DAYS[di][:3]}</b>', gcb), Paragraph(main_of(day, 'breakfast'), gc), Paragraph(main_of(day, 'lunch'), gc),
                     Paragraph(main_of(day, 'dinner'), gc), Paragraph(f'{tots[di]["kcal"]:.0f}', gcr), Paragraph(f'{tots[di]["p"]:.0f} g', gcr)])
    tb = Table(rows, colWidths=[CW * 0.08, CW * 0.27, CW * 0.27, CW * 0.2, CW * 0.08, CW * 0.1])
    st = [('BACKGROUND', (0, 0), (-1, 0), NAVY), ('LINEBELOW', (0, 0), (-1, 0), 1.4, GOLD), ('BACKGROUND', (0, 1), (-1, -1), WHITE),
          ('LINEBELOW', (0, 1), (-1, -2), 0.4, HAIR), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
          ('TOPPADDING', (0, 0), (-1, -1), 2.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
          ('TOPPADDING', (0, 0), (-1, 0), 5), ('BOTTOMPADDING', (0, 0), (-1, 0), 5),
          ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
          ('BOX', (0, 0), (-1, -1), 0.6, GOLD_L), ('ROUNDEDCORNERS', [8, 8, 8, 8])]
    for r in range(2, len(rows), 2):
        st.append(('BACKGROUND', (0, r), (-1, r), ZEBRA))
    tb.setStyle(TableStyle(st))
    return tb


def title_of(p):
    return f'{p["kcal"]} kcal {D.DIETS[p["diet"]]} {D.FOCUS[p["focus"]]}'


def build(p, path, logo):
    doc = BaseDocTemplate(path, pagesize=A4, pageCompression=1, title=f'{title_of(p)} - Week {p["week"]} - Hindivine Diet Chart',
                          author='Hindivine Healthcare Private Limited', subject='7-day weight-loss diet chart', creator='www.hindivine.com')
    frame = Frame(16 * mm, 19 * mm, CW, H - HEADER_H - 7 * mm - 19 * mm, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id='p', frames=[frame], onPage=deco(logo, SERIES))])
    lead, who, dos, donts = FOCUS_INFO[p['focus']]
    tots = [D.totals(d) for d in p['days']]
    avg = {k: sum(t[k] for t in tots) / 7 for k in tots[0]}

    hk = ParagraphStyle('hk', fontName='Lato-Bold', fontSize=7.8, leading=10, textColor=colors.HexColor('#8FD3F4'))
    ht = ParagraphStyle('ht', fontName='DMSerif', fontSize=26, leading=29, textColor=WHITE)
    hd = ParagraphStyle('hd', fontName='DMSerif-Italic', fontSize=12, leading=16.5, textColor=colors.HexColor('#D6E7F3'))
    head = [Paragraph(spaced('7-Day Diet Chart') + '&nbsp;&nbsp;·&nbsp;&nbsp;' + spaced(f'Week {p["week"]}'), hk), Spacer(1, 5),
            Paragraph(esc(D.FOCUS[p['focus']]), ht),
            HRFlowable(width=24 * mm, thickness=1.6, color=GOLD, hAlign='LEFT', spaceBefore=6, spaceAfter=8),
            chips([(f'{p["kcal"]} KCAL / DAY', '#0B3B66', '#E4F1FA'), (D.DIETS[p['diet']].upper(), '#2E7D32', '#E8F5E9'),
                   ('7 DAYS', '#0B3B66', '#E6F5F2')]),
            Spacer(1, 8), Paragraph(esc(lead), hd), Spacer(1, 7),
            Paragraph('<font name="Lato-Bold" size="7.5" color="#8FD3F4">' + spaced('Best for') + '</font>&nbsp;&nbsp;&nbsp;'
                      + esc(' '.join(who)), ParagraphStyle('bf', parent=body, fontSize=8.8, leading=12, textColor=WHITE))]
    numcol = [Paragraph(spaced('Plan'), ParagraphStyle('pn', fontName='Lato-Bold', fontSize=7, leading=9, textColor=colors.HexColor('#8FD3F4'), alignment=TA_CENTER)),
              Spacer(1, 4),
              Paragraph(f'{p["no"]}', ParagraphStyle('pnn', fontName='DMSerif', fontSize=30 if p['no'] < 1000 else 25, leading=32, textColor=WHITE, alignment=TA_CENTER)),
              Spacer(1, 6),
              Paragraph(spaced('Hindivine'), ParagraphStyle('ph', fontName='Lato-Bold', fontSize=6.5, leading=8, textColor=colors.HexColor('#8FD3F4'), alignment=TA_CENTER))]
    hero = Table([[head, numcol]], colWidths=[CW - 34 * mm, 34 * mm])
    hero.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), NAVY), ('ROUNDEDCORNERS', [10, 10, 10, 10]),
                              ('VALIGN', (0, 0), (0, 0), 'TOP'), ('VALIGN', (1, 0), (1, 0), 'MIDDLE'),
                              ('LINEBEFORE', (1, 0), (1, 0), 0.8, colors.HexColor('#2C6A9C')),
                              ('LEFTPADDING', (0, 0), (0, 0), 16), ('RIGHTPADDING', (0, 0), (0, 0), 14),
                              ('TOPPADDING', (0, 0), (-1, -1), 15), ('BOTTOMPADDING', (0, 0), (-1, -1), 16)]))

    def big(v, u, lab, col):
        return [Paragraph(f'<font name="DMSerif" size="23" color="{col}">{v}</font><font size="9" color="{col}"> {u}</font>',
                          ParagraphStyle('bv', fontName='Lato', alignment=TA_CENTER, leading=24)), Spacer(1, 2),
                Paragraph(f'<font color="{col}">{spaced(lab)}</font>', label)]

    def sm(v, lab):
        return [Paragraph(f'<font name="DMSerif" size="16" color="#0B3B66">{v}</font><font size="8" color="#0B3B66"> g</font>',
                          ParagraphStyle('sv', fontName='Lato', alignment=TA_CENTER, leading=18)), Spacer(1, 2), Paragraph(spaced(lab), label)]
    strip = tile_row([big(f'{avg["kcal"]:.0f}', 'kcal', 'Avg calories / day', '#D9573A'), big(f'{avg["p"]:.0f}', 'g', 'Avg protein / day', '#0E8A78'),
                      sm(f'{avg["c"]:.0f}', 'Carbs'), sm(f'{avg["fib"]:.0f}', 'Fibre'), sm(f'{avg["f"]:.0f}', 'Fat')],
                     [CW * 0.26, CW * 0.26, CW * 0.16, CW * 0.16, CW * 0.16],
                     [('BACKGROUND', (0, 0), (0, 0), ROSE), ('BACKGROUND', (1, 0), (1, 0), MINT), ('BACKGROUND', (2, 0), (-1, 0), WHITE),
                      ('LINEABOVE', (0, 0), (0, 0), 2.2, TERRA), ('LINEABOVE', (1, 0), (1, 0), 2.2, EMERALD), ('LINEABOVE', (2, 0), (-1, 0), 2.2, GOLD),
                      ('LINEAFTER', (0, 0), (-2, 0), 3, WHITE)])

    s = [hero, Spacer(1, 10), strip, Spacer(1, 12)]
    s.append(card(bullets([
        'Each meal is a Hindivine recipe; the number after it (for example #0123) is the recipe number in the Hindivine Healthy Recipe Series.',
        '"1 serving" means one serving as described in that recipe. Portions are set so each day comes close to '
        f'{p["kcal"]} kcal; calories and protein are per portion shown.',
        'Drink 2.5-3 litres of water a day unless your doctor has limited fluids. Tea or coffee: up to 2 cups a day, with no sugar.',
        'Weigh yourself once a week at the same time. A healthy rate of loss is about 0.5-1 kg a week.']),
        CREAM, GOLD_L, spaced('How to use this chart'), ParagraphStyle('bhn', parent=boxhead, textColor=NAVY)))

    s.append(Spacer(1, 10))
    s.append(KeepTogether([Paragraph(f'<font name="Lato-Bold" size="9" color="#29A8E0">01</font>&nbsp;&nbsp;&nbsp;Your Week at a Glance', h2), rule(),
                           glance(p, tots)]))
    for di, day in enumerate(p['days']):
        s.append(Spacer(1, 10))
        s.append(KeepTogether([day_table(di, day)]))

    s.append(Spacer(1, 4))
    grp = [Paragraph(f'<font name="Lato-Bold" size="9" color="#29A8E0">02</font>&nbsp;&nbsp;&nbsp;Guidelines for this Plan', h2), rule(),
           card(bullets(dos), MINT, EMERALD, spaced('Do'), boxhead)]
    s.append(KeepTogether(grp))
    s.append(Spacer(1, 8))
    s.append(card(bullets(donts), ROSE, TERRA, spaced('Limit or avoid'), warnhead))
    s.append(Spacer(1, 8))
    lvl = ('This calorie level is usually suited to women or smaller, less active adults.' if p['kcal'] <= 1400 else
           'This calorie level is usually suited to men or more active adults.')
    s.append(KeepTogether([Paragraph(f'<font name="Lato-Bold" size="9" color="#29A8E0">03</font>&nbsp;&nbsp;&nbsp;Is {p["kcal"]} kcal right for me?', h2), rule(),
                           Paragraph(esc(lvl) + ' Your dietitian can adjust it to your age, weight, height, activity and medical history. '
                                     'Do not go below 1,200 kcal a day without medical supervision, and seek advice before starting if you are '
                                     'pregnant, breastfeeding, under 18, or have a medical condition.', body),
                           Spacer(1, 10), HRFlowable(width='100%', thickness=0.5, color=GOLD_L, spaceAfter=6),
                           Paragraph('<b>Disclaimer:</b> This diet chart is general wellness information and not a substitute for personalised medical '
                       'or nutrition advice. Calorie and protein values are estimates from standard ingredient data (IFCT 2017 / USDA). '
                       'People with medical conditions or on medication should follow the plan given by their doctor or dietitian.', small)]))
    s += our_services()
    doc.build(s)


def fname(p):
    return f'{p["no"]:04d}-{p["kcal"]}-kcal-{D.DIETS[p["diet"]]}-{D.FOCUS[p["focus"]].replace(" ", "-")}-Week-{p["week"]:02d}.pdf'


FOLDER = {f: f'{i + 1:02d}-{name.replace(" ", "-")}' for i, (f, name) in enumerate(D.FOCUS.items())}


def _one(args):
    p, out, logo = args
    path = os.path.join(out, FOLDER[p['focus']], f'{p["kcal"]}-kcal', fname(p))
    build(p, path, logo)
    return path


def main():
    logo, out = sys.argv[1], sys.argv[2]
    import build as B
    rs = B.ordered(True)
    ps = list(D.plans(rs))
    if '--only' in sys.argv:
        want = {int(x) for x in sys.argv[sys.argv.index('--only') + 1].split(',')}
        ps = [p for p in ps if p['no'] in want]
    for p in ps:
        os.makedirs(os.path.join(out, FOLDER[p['focus']], f'{p["kcal"]}-kcal'), exist_ok=True)
    with ProcessPoolExecutor() as ex:
        for i, _ in enumerate(ex.map(_one, [(p, out, logo) for p in ps], chunksize=8), 1):
            if i % 250 == 0:
                print(i, 'done', flush=True)
    if '--only' in sys.argv:
        return
    with open(os.path.join(out, 'Diet-Chart-Index.csv'), 'w', newline='') as fh:
        w = csv.writer(fh)
        w.writerow(['Plan', 'Focus', 'kcal/day', 'Diet', 'Week', 'Avg kcal', 'Avg protein g', 'File'])
        for p in ps:
            tots = [D.totals(d) for d in p['days']]
            w.writerow([p['no'], D.FOCUS[p['focus']], p['kcal'], D.DIETS[p['diet']], p['week'],
                        round(sum(t['kcal'] for t in tots) / 7), round(sum(t['p'] for t in tots) / 7),
                        f'{FOLDER[p["focus"]]}/{p["kcal"]}-kcal/{fname(p)}'])
    print('total', len(ps))


if __name__ == '__main__':
    main()
