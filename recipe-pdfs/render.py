"""Render one recipe as a Hindivine-branded A4 PDF.

Design: white page in the Hindivine logo palette (deep blue, logo blue, sky-blue accents, taupe), serif headings,
coral calorie and teal protein cards, a timing card, blue ingredient tables and numbered steps."""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.platypus import (Image, BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether)
from reportlab.platypus.flowables import HRFlowable
from reportlab.pdfbase.pdfmetrics import stringWidth

from catalog import CAT
from core import quantity, diet
import guidelines as G

# Palette - built from the Hindivine logo colours (blue #0F6FB0, sky #29A8E0, taupe #7F7068)
NAVY = colors.HexColor('#0B3B66')        # deep Hindivine blue: headings, table headers, footer
BLUE = colors.HexColor('#0F6FB0')        # logo blue
GOLD = colors.HexColor('#29A8E0')        # accent: logo sky blue (rules, step numbers, bullets)
GOLD_L = colors.HexColor('#D6E7F3')      # hairlines and card borders
IVORY = colors.white                     # page
CREAM = colors.HexColor('#F2F7FB')       # soft blue-grey cards
WHITE = colors.white
INK = colors.HexColor('#24303B')
TAUPE = colors.HexColor('#7F7068')       # logo taupe: secondary text
TERRA = colors.HexColor('#D9573A')       # calories, cautions
EMERALD = colors.HexColor('#0E8A78')     # protein, recommendations
ROSE = colors.HexColor('#FDF0EB')
MINT = colors.HexColor('#E6F5F2')
HAIR = colors.HexColor('#E3ECF3')
# kept for index_pdf.py
SKY = NAVY
LIGHT = CREAM

W, H = A4
CW = W - 32 * mm
LOGO_W = 58 * mm
LOGO_H = LOGO_W * (594 / 1697)
HEADER_H = LOGO_H + 14 * mm
DIET_CHIP = {'vegan': ('#2E7D32', '#E8F5E9'), 'veg': ('#2E7D32', '#E8F5E9'), 'egg': ('#9A6A00', '#FBF0D6'), 'nonveg': ('#A33A1F', '#F9E3DB')}

body = ParagraphStyle('b', fontName='Helvetica', fontSize=9.8, leading=14.2, textColor=INK)
small = ParagraphStyle('s', parent=body, fontSize=8.2, leading=11.5, textColor=TAUPE)
title = ParagraphStyle('t', fontName='Times-Bold', fontSize=29, leading=32, textColor=NAVY)
kicker = ParagraphStyle('k', fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=BLUE)
sub = ParagraphStyle('st', fontName='Times-Italic', fontSize=12.5, leading=17, textColor=TAUPE)
h2 = ParagraphStyle('h2', fontName='Times-Bold', fontSize=17, leading=20, textColor=NAVY, spaceBefore=12, spaceAfter=0, keepWithNext=1)
cell = ParagraphStyle('c', parent=body, fontSize=9.3, leading=12.5)
qty = ParagraphStyle('q', parent=cell, fontName='Helvetica-Bold', textColor=NAVY, alignment=TA_RIGHT)
cellw = ParagraphStyle('cw', parent=cell, textColor=WHITE, fontName='Helvetica-Bold', fontSize=9)
stephead = ParagraphStyle('sh', parent=body, fontName='Helvetica-Bold', textColor=NAVY, fontSize=10.3)
boxhead = ParagraphStyle('bh', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=EMERALD)
warnhead = ParagraphStyle('wh', parent=boxhead, textColor=TERRA)
num = ParagraphStyle('n', fontName='Helvetica-Bold', fontSize=11.5, leading=14, textColor=WHITE, alignment=TA_CENTER)
bul = ParagraphStyle('bl', parent=body, leftIndent=12, bulletIndent=0, spaceAfter=2.5, bulletColor=GOLD, bulletFontSize=11)
end = ParagraphStyle('end', fontName='Times-Italic', fontSize=12.5, leading=16, textColor=NAVY, alignment=TA_CENTER)
label = ParagraphStyle('lab', fontName='Helvetica-Bold', fontSize=6.8, leading=9, textColor=TAUPE, alignment=TA_CENTER)


def esc(s):
    return s.replace('&', '&amp;').replace('<b>', '\x01').replace('</b>', '\x02').replace('<', '&lt;') \
        .replace('>', '&gt;').replace('\x01', '<b>').replace('\x02', '</b>')


def spaced(s):
    """Letter-spaced small caps look for labels."""
    return '&nbsp;'.join(s.upper())


def deco(logo):
    def fn(c, doc):
        c.saveState()
        c.setFillColor(IVORY); c.rect(0, 0, W, H, stroke=0, fill=1)
        # header band
        c.setFillColor(WHITE); c.rect(0, H - HEADER_H, W, HEADER_H, stroke=0, fill=1)
        c.drawImage(logo, 16 * mm, H - 7 * mm - LOGO_H, LOGO_W, LOGO_H, mask='auto')
        c.setFont('Helvetica-Bold', 7.5); c.setFillColor(BLUE)
        c.drawRightString(W - 16 * mm, H - 15.5 * mm, 'H E A L T H Y   R E C I P E   S E R I E S')
        c.setFont('Times-Italic', 10.5); c.setFillColor(NAVY)
        c.drawRightString(W - 16 * mm, H - 21.5 * mm, 'Nutrition  ·  Wellness  ·  Care')
        c.setStrokeColor(GOLD); c.setLineWidth(1.4)
        c.line(0, H - HEADER_H, W, H - HEADER_H)
        c.setLineWidth(0.4)
        c.line(0, H - HEADER_H - 1.6 * mm, W, H - HEADER_H - 1.6 * mm)
        # footer
        c.setFillColor(NAVY); c.rect(0, 0, W, 13 * mm, stroke=0, fill=1)
        c.setStrokeColor(GOLD); c.setLineWidth(1.2); c.line(0, 13 * mm, W, 13 * mm)
        c.setFillColor(WHITE); c.setFont('Helvetica-Bold', 9.5)
        c.drawString(16 * mm, 5 * mm, 'www.hindivine.com')
        c.linkURL('https://www.hindivine.com', (16 * mm, 3 * mm, 60 * mm, 10 * mm), relative=0)
        c.setFillColor(colors.HexColor('#BFE3F5')); c.setFont('Times-Italic', 9.5)
        c.drawCentredString(W / 2, 5 * mm, 'Hindivine Healthcare Private Limited')
        c.setFillColor(WHITE); c.setFont('Helvetica', 8.5)
        c.drawRightString(W - 16 * mm, 5 * mm, f'Page {doc.page}')
        c.restoreState()
    return fn


def section(t):
    return Paragraph(t, h2)


def rule(width=26 * mm):
    return HRFlowable(width=width, thickness=1.6, color=GOLD, hAlign='LEFT', spaceBefore=3, spaceAfter=7)


def card(flows, bg, border, head=None, hstyle=None):
    content = ([Paragraph(head, hstyle), Spacer(1, 4)] if head else []) + flows
    t = Table([[content]], colWidths=[CW])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), bg), ('LINEBEFORE', (0, 0), (0, -1), 3.5, border),
                           ('LEFTPADDING', (0, 0), (-1, -1), 12), ('RIGHTPADDING', (0, 0), (-1, -1), 12),
                           ('TOPPADDING', (0, 0), (-1, -1), 9), ('BOTTOMPADDING', (0, 0), (-1, -1), 9)]))
    return t


def bullets(items):
    return [Paragraph(esc(i), bul, bulletText='•') for i in items]


def chip(text, fg, bg):
    t = Table([[Paragraph(f'<font color="{fg}"><b>{text}</b></font>', ParagraphStyle('ch', fontName='Helvetica-Bold', fontSize=7.6, leading=9, alignment=TA_CENTER))]])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(bg)), ('ROUNDEDCORNERS', [6, 6, 6, 6]),
                           ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 7),
                           ('TOPPADDING', (0, 0), (-1, -1), 2.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 3)]))
    return t


def chips(items):
    widths = [stringWidth(t, 'Helvetica-Bold', 7.6) + 20 for t, _, _ in items]
    row = Table([[chip(t, fg, bg) for t, fg, bg in items]], colWidths=widths, hAlign='LEFT')
    row.setStyle(TableStyle([('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
                             ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 0)]))
    return row


def tile_row(cells, widths, styles):
    t = Table([cells], colWidths=widths)
    t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('TOPPADDING', (0, 0), (-1, -1), 7), ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
                           ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4)] + styles))
    return t


def nutri_strip(n):
    """Calories and protein in large serif figures on page 1, with carbs, fibre and fat beside them."""
    def big(v, u, lab, col):
        return [Paragraph(f'<font name="Times-Bold" size="25" color="{col}">{v}</font><font size="9.5" color="{col}"> {u}</font>',
                          ParagraphStyle('bv', alignment=TA_CENTER, leading=26)), Spacer(1, 2),
                Paragraph(f'<font color="{col}">{spaced(lab)}</font>', label)]

    def sm(v, lab):
        return [Paragraph(f'<font name="Times-Bold" size="17" color="#0B3B66">{v}</font><font size="8.5" color="#0B3B66"> g</font>',
                          ParagraphStyle('sv', alignment=TA_CENTER, leading=19)), Spacer(1, 2), Paragraph(spaced(lab), label)]
    cells = [big(f'{n["kcal"]:.0f}', 'kcal', 'Calories', '#D9573A'), big(f'{n["p"]:.0f}', 'g', 'Protein', '#0E8A78'),
             sm(f'{n["c"]:.0f}', 'Carbs'), sm(f'{n["fib"]:.0f}', 'Fibre'), sm(f'{n["f"]:.0f}', 'Fat')]
    w = [CW * 0.26, CW * 0.26, CW * 0.16, CW * 0.16, CW * 0.16]
    return tile_row(cells, w, [('BACKGROUND', (0, 0), (0, 0), ROSE), ('BACKGROUND', (1, 0), (1, 0), MINT), ('BACKGROUND', (2, 0), (-1, 0), WHITE),
                               ('LINEABOVE', (0, 0), (0, 0), 2.2, TERRA), ('LINEABOVE', (1, 0), (1, 0), 2.2, EMERALD), ('LINEABOVE', (2, 0), (-1, 0), 2.2, GOLD),
                               ('LINEAFTER', (0, 0), (-2, 0), 3, IVORY)])


def time_strip(items):
    cells = [[Paragraph(spaced(k), label), Spacer(1, 3), Paragraph(f'<font name="Helvetica-Bold" size="11" color="#0B3B66">{v}</font>',
                                                                    ParagraphStyle('tv', alignment=TA_CENTER, leading=13))] for k, v in items]
    w = [CW / len(items)] * len(items)
    return tile_row(cells, w, [('BACKGROUND', (0, 0), (-1, -1), CREAM), ('LINEAFTER', (0, 0), (-2, 0), 0.6, GOLD_L),
                               ('BOX', (0, 0), (-1, -1), 0.6, GOLD_L)])


def ing_table(head, items):
    data = [[Paragraph(esc(head).upper(), cellw), '']]
    for k, g, note in items:
        show = note and g is not None and note.lower() not in CAT[k]['name'].lower()
        data.append([Paragraph(esc(CAT[k]['name']) + (f'<font color="#7F7068">, {esc(note)}</font>' if show else ''), cell),
                     Paragraph(esc(quantity(k, g, note)), qty)])
    t = Table(data, colWidths=[CW * 0.64, CW * 0.36])
    st = [('BACKGROUND', (0, 0), (-1, 0), NAVY), ('SPAN', (0, 0), (-1, 0)), ('LINEBELOW', (0, 0), (-1, 0), 1.4, GOLD),
          ('LINEBELOW', (0, 1), (-1, -1), 0.4, HAIR), ('BACKGROUND', (0, 1), (-1, -1), WHITE),
          ('TOPPADDING', (0, 0), (-1, -1), 4.2), ('BOTTOMPADDING', (0, 0), (-1, -1), 4.2),
          ('LEFTPADDING', (0, 0), (-1, -1), 9), ('RIGHTPADDING', (0, 0), (-1, -1), 9), ('BOX', (0, 0), (-1, -1), 0.5, HAIR)]
    for r in range(2, len(data), 2):
        st.append(('BACKGROUND', (0, r), (-1, r), IVORY))
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
    frame = Frame(16 * mm, 19 * mm, CW, H - HEADER_H - 7 * mm - 19 * mm, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id='p', frames=[frame], onPage=deco(logo))])
    d = diet(r)
    s = []
    kick = r['cat'] + (f'  ·  {r["sub"]}' if r['sub'] else '')
    if number:
        kick = f'Recipe {number}  ·  ' + kick
    head = [Paragraph(esc(kick).upper().replace(' ', '&nbsp;&nbsp;'), kicker), Spacer(1, 4), Paragraph(esc(r['name']), title),
            HRFlowable(width=22 * mm, thickness=1.6, color=GOLD, hAlign='LEFT', spaceBefore=5, spaceAfter=7)]
    fg, bg = DIET_CHIP[d]
    items = [(G.DIET_LABEL[d].upper(), fg, bg)]
    al = G.allergens(r)
    if 'gluten (wheat)' not in al:
        items.append(('GLUTEN-FREE', '#0B3B66', '#E4F1FA'))
    if r['nut']['p'] >= 15:
        items.append(('HIGH PROTEIN', '#0B3B66', '#E6F5F2'))
    if r['nut']['fib'] >= 6:
        items.append(('HIGH FIBRE', '#0B3B66', '#E6F5F2'))
    head.append(chips(items))
    if r.get('meals'):
        head.append(Spacer(1, 6))
        head.append(Paragraph('<font name="Helvetica-Bold" size="7.5" color="#0F6FB0">' + spaced('Best for') + '</font>&nbsp;&nbsp;&nbsp;'
                              '<font name="Helvetica-Bold" color="#0B3B66">' + esc('  ·  '.join(r['meals'])) + '</font>',
                              ParagraphStyle('bf', parent=body, fontSize=9.3)))
    ht = Table([[head]], colWidths=[CW])
    ht.setStyle(TableStyle([('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                            ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 0)]))
    s.append(ht)
    s.append(Spacer(1, 7))
    s.append(Paragraph(esc(r['desc']), sub))
    s.append(Spacer(1, 10))
    s.append(nutri_strip(r['nut']))
    s.append(Spacer(1, 6))
    sv = r['serves']
    s.append(time_strip([('Prep', fmt_time(r['prep'])), ('Cook', fmt_time(r['cook'])), ('Total', fmt_time(r['prep'] + r['cook'])),
                         ('Serves', r.get('serves_txt') or str(sv)), ('Level', r['level'])]))

    s.append(section('Ingredients'))
    s.append(rule())
    for i, (gh, items) in enumerate(r['groups']):
        if gh == 'Ingredients':
            gh = f'Ingredients (serves {sv})'
        tbl = ing_table(gh, items)
        s.append(tbl if i == 0 else KeepTogether([tbl]))
        s.append(Spacer(1, 8))

    s.append(section('Step-by-Step Method'))
    s.append(rule())
    for i, (hd, tx) in enumerate(r['steps'], 1):
        n = Table([[Paragraph(str(i), num)]], colWidths=[9 * mm], rowHeights=[9 * mm])
        n.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), NAVY), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                               ('ROUNDEDCORNERS', [12.7, 12.7, 12.7, 12.7]), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                               ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 1.5)]))
        row = Table([[n, [Paragraph(esc(hd), stephead), Spacer(1, 2), Paragraph(esc(tx), body)]]],
                    colWidths=[13 * mm, CW - 13 * mm])
        row.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0),
                                 ('BOTTOMPADDING', (0, 0), (-1, -1), 8), ('TOPPADDING', (0, 0), (-1, -1), 4),
                                 ('LINEBELOW', (1, 0), (1, 0), 0.5, HAIR)]))
        s.append(KeepTogether([row]))

    n = r['nut']
    s.append(KeepTogether([
        section('Nutrition per Serving'), rule(),
        tile_row([[Paragraph(spaced(k), label), Spacer(1, 3), Paragraph(f'<font name="Helvetica-Bold" size="11" color="#0B3B66">{v}</font>',
                                                                         ParagraphStyle('nv', alignment=TA_CENTER, leading=13))]
                  for k, v in [('Energy', f'~{n["kcal"]:.0f} kcal'), ('Protein', f'~{n["p"]:.0f} g'), ('Carbohydrate', f'~{n["c"]:.0f} g'),
                               ('Fibre', f'~{n["fib"]:.0f} g'), ('Fat', f'~{n["f"]:.0f} g')]],
                 [CW / 5] * 5, [('BACKGROUND', (0, 0), (-1, -1), WHITE), ('BOX', (0, 0), (-1, -1), 0.6, GOLD_L),
                                ('LINEAFTER', (0, 0), (-2, 0), 0.6, GOLD_L), ('LINEABOVE', (0, 0), (-1, 0), 2, EMERALD)]),
        Spacer(1, 5),
        Paragraph('Values are estimates calculated from standard ingredient data (IFCT 2017 / USDA) for one serving; '
                  'they vary with ingredient brands, sizes and the exact amount of oil used.', small)]))

    ben = G.benefits(r)
    if ben:
        s.append(section('Health Benefits'))
        s.append(rule())
        s += bullets([f'<b>{t}:</b> {x}' for t, x in ben])

    s.append(section('Dietary Guidelines'))
    s.append(rule())
    s.append(card(bullets(G.recommended(r)), MINT, EMERALD, spaced('Recommended for'), boxhead))
    s.append(Spacer(1, 8))
    s.append(card(bullets(G.cautions(r)), ROSE, TERRA, spaced('Use with caution  ·  consult your dietitian'), warnhead))

    tips = list(r['tips']) + [t for t in G.ingredient_tips(r) if t not in r['tips']]
    if tips:
        s.append(section('Cooking Tips'))
        s.append(rule())
        s += bullets(tips[:6])
    sv_items = []
    if r['serve']:
        sv_items.append('<b>Serve with:</b> ' + r['serve'][0])
        sv_items += r['serve'][1:]
    if r['store']:
        sv_items.append('<b>Storage:</b> ' + r['store'])
    if sv_items:
        s.append(section('Serving & Storage'))
        s.append(rule())
        s += bullets(sv_items)

    s.append(Spacer(1, 14))
    s.append(HRFlowable(width='100%', thickness=0.5, color=GOLD_L, spaceAfter=6))
    s.append(Paragraph('<b>Disclaimer:</b> This recipe is for general wellness information only and is not a substitute '
                       'for personalised medical or nutrition advice. People with medical conditions should follow the '
                       'diet plan given by their doctor or dietitian.', small))
    s.append(Spacer(1, 10))
    s.append(Paragraph("Eat well. Live well. &nbsp;<font name='Helvetica' size='9.5' color='#7F7068'>Discover more healthy recipes at </font>"
                       "<a href='https://www.hindivine.com' color='#0F6FB0'><font name='Helvetica-Bold' size='9.5'>www.hindivine.com</font></a>", end))

    # Keep every section heading (and its gold rule) on the same page as the first block under it.
    out = []
    i = 0
    while i < len(s):
        f = s[i]
        if isinstance(f, Paragraph) and f.style.name == 'h2' and i + 1 < len(s):
            grp = [f]
            j = i + 1
            if isinstance(s[j], HRFlowable):
                grp.append(s[j]); j += 1
            if j < len(s):
                nxt = s[j]
                grp += nxt._content if isinstance(nxt, KeepTogether) else [nxt]
                j += 1
            out.append(KeepTogether(grp))
            i = j
            continue
        out.append(f)
        i += 1
    doc.build(out)
