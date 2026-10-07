"""Render one recipe as a Hindivine-branded A4 PDF (same layout as the Avocado Chila recipe)."""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether)

from catalog import CAT
from core import quantity, diet
import guidelines as G

BLUE = colors.HexColor('#0F6FB0')
SKY = colors.HexColor('#29A8E0')
TAUPE = colors.HexColor('#7F7068')
GREEN = colors.HexColor('#5E8C31')
LIGHT = colors.HexColor('#EEF6FC')
LEAF = colors.HexColor('#F1F7EA')
INK = colors.HexColor('#2E2E2E')
RED = colors.HexColor('#B5462F')
ROSE = colors.HexColor('#FBEFEC')
W, H = A4
CW = W - 32 * mm
LOGO_W = 62 * mm
LOGO_H = LOGO_W * (594 / 1697)
DIET_COL = {'vegan': '#2E8B3E', 'veg': '#2E8B3E', 'egg': '#C98A00', 'nonveg': '#B5462F'}

body = ParagraphStyle('b', fontName='Helvetica', fontSize=10, leading=14.5, textColor=INK)
small = ParagraphStyle('s', parent=body, fontSize=8.5, leading=12, textColor=TAUPE)
title = ParagraphStyle('t', fontName='Helvetica-Bold', fontSize=26, leading=30, textColor=BLUE)
kicker = ParagraphStyle('k', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=SKY)
sub = ParagraphStyle('st', parent=body, fontSize=11.5, leading=16, textColor=TAUPE)
h2 = ParagraphStyle('h2', fontName='Helvetica-Bold', fontSize=14, leading=18, textColor=BLUE, spaceBefore=10, spaceAfter=6, keepWithNext=1)
cell = ParagraphStyle('c', parent=body, fontSize=9.5, leading=13)
cellw = ParagraphStyle('cw', parent=cell, textColor=colors.white, fontName='Helvetica-Bold')
stephead = ParagraphStyle('sh', parent=body, fontName='Helvetica-Bold', textColor=BLUE, fontSize=10.5)
warnhead = ParagraphStyle('wh', parent=stephead, textColor=RED)
num = ParagraphStyle('n', fontName='Helvetica-Bold', fontSize=12, leading=14, textColor=colors.white, alignment=TA_CENTER)
bul = ParagraphStyle('bl', parent=body, leftIndent=11, bulletIndent=0, spaceAfter=2)
end = ParagraphStyle('end', parent=body, alignment=TA_CENTER, fontSize=11)


def esc(s):
    return s.replace('&', '&amp;').replace('<b>', '\x01').replace('</b>', '\x02').replace('<', '&lt;') \
        .replace('>', '&gt;').replace('\x01', '<b>').replace('\x02', '</b>')


def deco(logo):
    def fn(c, doc):
        c.saveState()
        c.drawImage(logo, 16 * mm, H - 12 * mm - LOGO_H, LOGO_W, LOGO_H, mask='auto')
        c.setFont('Helvetica-Bold', 9); c.setFillColor(BLUE)
        c.drawRightString(W - 16 * mm, H - 18 * mm, 'HEALTHY RECIPE SERIES')
        c.setFont('Helvetica', 8.5); c.setFillColor(TAUPE)
        c.drawRightString(W - 16 * mm, H - 23 * mm, 'Nutrition  |  Wellness  |  Care')
        c.setStrokeColor(SKY); c.setLineWidth(2)
        c.line(16 * mm, H - 15 * mm - LOGO_H, W - 16 * mm, H - 15 * mm - LOGO_H)
        c.setFillColor(BLUE); c.rect(0, 0, W, 13 * mm, stroke=0, fill=1)
        c.setFillColor(SKY); c.rect(0, 13 * mm, W, 1.2 * mm, stroke=0, fill=1)
        c.setFillColor(colors.white); c.setFont('Helvetica-Bold', 10)
        c.drawString(16 * mm, 5 * mm, 'www.hindivine.com')
        c.linkURL('https://www.hindivine.com', (16 * mm, 3 * mm, 60 * mm, 10 * mm), relative=0)
        c.setFont('Helvetica', 8.5)
        c.drawCentredString(W / 2, 5 * mm, 'Hindivine Healthcare Private Limited')
        c.drawRightString(W - 16 * mm, 5 * mm, f'Page {doc.page}')
        c.restoreState()
    return fn


def section(t):
    return Paragraph(t, h2)


def box(flows, bg, border):
    t = Table([[flows]], colWidths=[CW])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), bg), ('LINEBEFORE', (0, 0), (0, -1), 3, border),
                           ('LEFTPADDING', (0, 0), (-1, -1), 10), ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                           ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8)]))
    return t


def bullets(items):
    return [Paragraph(esc(i), bul, bulletText='•') for i in items]


def stat_table(head, vals, hc, bc):
    n = len(head)
    t = Table([head, vals], colWidths=[CW / n] * n)
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), hc), ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                           ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, 0), 8.5),
                           ('BACKGROUND', (0, 1), (-1, 1), bc), ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
                           ('FONTSIZE', (0, 1), (-1, 1), 11), ('TEXTCOLOR', (0, 1), (-1, 1), INK),
                           ('ALIGN', (0, 0), (-1, -1), 'CENTER'), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                           ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                           ('LINEAFTER', (0, 0), (-2, -1), 0.8, colors.white)]))
    return t


def ing_table(head, items):
    data = [[Paragraph(esc(head), cellw), '']]
    for k, g, note in items:
        show = note and g is not None and note.lower() not in CAT[k]['name'].lower()
        nm = CAT[k]['name'] + (f', {note}' if show else '')
        data.append([Paragraph(esc(nm), cell), Paragraph(esc(quantity(k, g, note)), cell)])
    t = Table(data, colWidths=[CW * 0.62, CW * 0.38])
    st = [('BACKGROUND', (0, 0), (-1, 0), SKY), ('SPAN', (0, 0), (-1, 0)),
          ('LINEBELOW', (0, 1), (-1, -1), 0.4, colors.HexColor('#D6E6F2')),
          ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
          ('LEFTPADDING', (0, 0), (-1, -1), 8)]
    for r in range(2, len(data), 2):
        st.append(('BACKGROUND', (0, r), (-1, r), LIGHT))
    t.setStyle(TableStyle(st))
    return t


def fmt_time(m):
    if m >= 60:
        h, mm_ = divmod(m, 60)
        return f'{h} hr {mm_} min' if mm_ else f'{h} hr'
    return f'{m} min'


def build(r, path, logo, number=None):
    doc = BaseDocTemplate(path, pagesize=A4, pageCompression=1, title=f'{r["name"]} - Hindivine Recipe',
                          author='Hindivine Healthcare Private Limited', subject='Healthy Indian recipe',
                          creator='www.hindivine.com')
    frame = Frame(16 * mm, 20 * mm, CW, H - 40 * mm - LOGO_H, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id='p', frames=[frame], onPage=deco(logo))])
    d = diet(r)
    s = []
    kick = r['cat'].upper() + (f'  ·  {r["sub"].upper()}' if r['sub'] else '')
    if number:
        kick = f'RECIPE {number}  ·  ' + kick
    s.append(Paragraph(esc(kick), kicker))
    s.append(Spacer(1, 3))
    s.append(Paragraph(esc(r['name']), title))
    s.append(Spacer(1, 4))
    badges = [f'<font color="{DIET_COL[d]}"><b>• {G.DIET_LABEL[d]}</b></font>']
    al = G.allergens(r)
    if 'gluten (wheat)' not in al:
        badges.append('<font color="#0F6FB0"><b>Gluten-free</b></font>')
    if r['nut']['p'] >= 15:
        badges.append('<font color="#0F6FB0"><b>High protein</b></font>')
    if r['nut']['fib'] >= 6:
        badges.append('<font color="#0F6FB0"><b>High fibre</b></font>')
    s.append(Paragraph('&nbsp;&nbsp;|&nbsp;&nbsp;'.join(badges), ParagraphStyle('bd', parent=body, fontSize=9.5)))
    s.append(Spacer(1, 5))
    s.append(Paragraph(esc(r['desc']), sub))
    s.append(Spacer(1, 10))
    sv = r['serves']
    s.append(stat_table(['Prep Time', 'Cook Time', 'Total Time', 'Servings', 'Difficulty'],
                        [fmt_time(r['prep']), fmt_time(r['cook']), fmt_time(r['prep'] + r['cook']),
                         r.get('serves_txt') or str(sv), r['level']], BLUE, LIGHT))

    s.append(section('Ingredients'))
    for i, (head, items) in enumerate(r['groups']):
        if head == 'Ingredients':
            head = f'Ingredients (serves {sv})'
        tbl = ing_table(head, items)
        s.append(tbl if i == 0 else KeepTogether([tbl]))
        s.append(Spacer(1, 8))

    s.append(section('Step-by-Step Method'))
    for i, (hd, tx) in enumerate(r['steps'], 1):
        n = Table([[Paragraph(str(i), num)]], colWidths=[9.5 * mm], rowHeights=[9 * mm])
        n.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), BLUE if i % 2 else SKY),
                               ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('ROUNDEDCORNERS', [4, 4, 4, 4]),
                               ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 2)]))
        row = Table([[n, [Paragraph(esc(hd), stephead), Spacer(1, 2), Paragraph(esc(tx), body)]]],
                    colWidths=[13 * mm, CW - 13 * mm])
        row.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0),
                                 ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
                                 ('LINEBELOW', (1, 0), (1, 0), 0.4, colors.HexColor('#E2E2E2'))]))
        s.append(KeepTogether([row]))

    n = r['nut']
    s.append(KeepTogether([
        section('Approximate Nutrition (per serving)'),
        stat_table(['Energy', 'Protein', 'Carbohydrate', 'Dietary Fibre', 'Fat'],
                   [f'~{n["kcal"]:.0f} kcal', f'~{n["p"]:.0f} g', f'~{n["c"]:.0f} g', f'~{n["fib"]:.0f} g',
                    f'~{n["f"]:.0f} g'], GREEN, LEAF),
        Spacer(1, 4),
        Paragraph('Values are estimates calculated from standard ingredient data (IFCT 2017 / USDA) for one serving; '
                  'they vary with ingredient brands, sizes and the exact amount of oil used.', small)]))

    ben = G.benefits(r)
    if ben:
        s.append(section('Health Benefits'))
        s += bullets([f'<b>{t}:</b> {x}' for t, x in ben])

    s.append(section('Dietary Guidelines'))
    s.append(box([Paragraph('<b>Recommended for</b>', stephead), Spacer(1, 3)] + bullets(G.recommended(r)), LIGHT, BLUE))
    s.append(Spacer(1, 8))
    s.append(box([Paragraph('<b>Use with caution / consult your dietitian</b>', warnhead), Spacer(1, 3)] +
                 bullets(G.cautions(r)), ROSE, RED))

    tips = list(r['tips']) + [t for t in G.ingredient_tips(r) if t not in r['tips']]
    if tips:
        s.append(section('Cooking Tips'))
        s += bullets(tips[:6])
    sv_items = []
    if r['serve']:
        sv_items.append('<b>Serve with:</b> ' + r['serve'][0])
        sv_items += r['serve'][1:]
    if r['store']:
        sv_items.append('<b>Storage:</b> ' + r['store'])
    if sv_items:
        s.append(section('Serving & Storage'))
        s += bullets(sv_items)

    s.append(Spacer(1, 12))
    s.append(Paragraph('<b>Disclaimer:</b> This recipe is for general wellness information only and is not a substitute '
                       'for personalised medical or nutrition advice. People with medical conditions should follow the '
                       'diet plan given by their doctor or dietitian.', small))
    s.append(Spacer(1, 8))
    s.append(Paragraph("<font color='#0F6FB0'><b>Eat well. Live well.</b></font> &nbsp;&mdash;&nbsp; "
                       "<font color='#7F7068'>Discover more healthy recipes at </font>"
                       "<a href='https://www.hindivine.com' color='#29A8E0'><b>www.hindivine.com</b></a>", end))
    # Keep every section heading on the same page as the first block under it.
    out = []
    i = 0
    while i < len(s):
        f = s[i]
        if isinstance(f, Paragraph) and f.style.name == 'h2' and i + 1 < len(s):
            nxt = s[i + 1]
            out.append(KeepTogether([f] + (nxt._content if isinstance(nxt, KeepTogether) else [nxt])))
            i += 2
            continue
        out.append(f)
        i += 1
    doc.build(out)
