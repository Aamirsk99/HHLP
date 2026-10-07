"""Meal-Time Index: one branded PDF listing every recipe under each meal time it suits."""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

import meals as M
from core import diet
from render import deco, LOGO_H, CW, W, H, BLUE, SKY, TAUPE, LIGHT, INK, esc

DIET = {'vegan': 'Vegan', 'veg': 'Veg', 'egg': 'Egg', 'nonveg': 'Non-veg'}
title = ParagraphStyle('t', fontName='Helvetica-Bold', fontSize=26, leading=30, textColor=BLUE)
h1 = ParagraphStyle('h1', fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=BLUE, spaceAfter=4)
body = ParagraphStyle('b', fontName='Helvetica', fontSize=10, leading=14, textColor=INK)
small = ParagraphStyle('s', parent=body, fontSize=8.5, leading=11, textColor=TAUPE)
cell = ParagraphStyle('c', parent=body, fontSize=8, leading=10)
cellb = ParagraphStyle('cb', parent=cell, fontName='Helvetica-Bold', textColor=colors.white)

ABOUT = {
    'Early Morning': 'Detox waters, herbal teas and shots to start the day on an empty stomach.',
    'Breakfast': 'Chilas, dosas, idlis, parathas, poha, upma, porridges, eggs and smoothies.',
    'Mid-Morning': 'Light fruit chaats, juices, coolers, sundal and roasted snacks between breakfast and lunch.',
    'Lunch': 'Dals, curries, sabzis, rice, rotis and salads for the main meal of the day.',
    'Evening Snacks': 'Tikkis, dhoklas, tikkas, chaats, air-fried snacks, soups and tea-time bites.',
    'Dinner': 'Lighter dals, curries, khichdis, soups, dosas and grills for the evening meal.',
    'Bedtime': 'Warm milk drinks that help you wind down.',
    'Desserts & Sweets': 'Kheers, halwas, ladoos, chikkis and puddings with less sugar.',
    'Accompaniments': 'Chutneys, dips, podis and raitas to serve alongside meals.',
    'Vrat / Fasting': 'Recipes made with vrat ingredients (sabudana, rajgira, kuttu, singhara, sama, makhana) and no onion or garlic. Use sendha namak.',
}


def build(rs, path, logo):
    doc = BaseDocTemplate(path, pagesize=A4, pageCompression=1, title='Hindivine Recipes - Meal-Time Index',
                          author='Hindivine Healthcare Private Limited', creator='www.hindivine.com')
    frame = Frame(16 * mm, 20 * mm, CW, H - 40 * mm - LOGO_H, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id='p', frames=[frame], onPage=deco(logo))])
    groups = {m: [r for r in rs if m in r['meals']] for m in M.MEALS + M.EXTRA}

    s = [Paragraph('Meal-Time Index', title), Spacer(1, 4),
         Paragraph(f'All {len(rs):,} Hindivine healthy Indian recipes, arranged by the time of day they suit best. '
                   'Each recipe PDF sits in the folder of its <b>main</b> meal time (the first one listed); many recipes also suit other meal times and are listed under each of them here.', body),
         Spacer(1, 10)]
    data = [[Paragraph('<b>Meal time</b>', cellb), Paragraph('<b>Recipes</b>', cellb), Paragraph('<b>Folder</b>', cellb), Paragraph('<b>What you will find</b>', cellb)]]
    for i, m in enumerate(M.MEALS + M.EXTRA):
        folder = f'{M.MEALS.index(m) + 1:02d}-{m}' if m in M.MEALS else '(listed only)'
        data.append([Paragraph(f'<b>{esc(m)}</b>', cell), Paragraph(str(len(groups[m])), cell), Paragraph(esc(folder), cell), Paragraph(esc(ABOUT[m]), cell)])
    t = Table(data, colWidths=[CW * 0.2, CW * 0.1, CW * 0.2, CW * 0.5], repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), BLUE), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                           ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT]), ('LINEBELOW', (0, 0), (-1, -1), 0.3, colors.HexColor('#D6E6F2')),
                           ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4)]))
    s += [t, Spacer(1, 8), Paragraph('Use the recipe number (No.) to find the PDF: file names start with the number.', small)]

    for m in M.MEALS + M.EXTRA:
        s.append(PageBreak())
        s.append(Paragraph(f'{esc(m)} — {len(groups[m])} recipes', h1))
        s.append(Paragraph(esc(ABOUT[m]), small))
        s.append(Spacer(1, 6))
        data = [[Paragraph(x, cellb) for x in ('<b>No.</b>', '<b>Recipe</b>', '<b>Category</b>', '<b>Diet</b>', '<b>kcal</b>', '<b>Protein</b>', '<b>Also good for</b>')]]
        for r in sorted(groups[m], key=lambda r: (r['cat'], r['name'].lower())):
            also = [x for x in r['meals'] if x != m]
            data.append([Paragraph(str(r['no']), cell), Paragraph(esc(r['name']), cell), Paragraph(esc(r['cat']), cell),
                         Paragraph(DIET[diet(r)], cell), Paragraph(f'{r["nut"]["kcal"]:.0f}', cell), Paragraph(f'{r["nut"]["p"]:.0f} g', cell), Paragraph(esc(', '.join(also)), cell)])
        t = Table(data, colWidths=[CW * 0.07, CW * 0.34, CW * 0.19, CW * 0.08, CW * 0.06, CW * 0.08, CW * 0.18], repeatRows=1)
        t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), SKY), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                               ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT]),
                               ('TOPPADDING', (0, 0), (-1, -1), 2), ('BOTTOMPADDING', (0, 0), (-1, -1), 2), ('LEFTPADDING', (0, 0), (-1, -1), 4)]))
        s.append(t)
    doc.build(s)
