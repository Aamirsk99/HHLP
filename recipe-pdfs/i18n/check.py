"""Validate a translation file:  python3 i18n/check.py CODE   (run from recipe-pdfs)"""
import json, re, sys, os, unicodedata, collections
D = os.path.dirname(os.path.abspath(__file__))
code = sys.argv[1]
langs = json.load(open(os.path.join(D, 'languages.json'), encoding='utf-8'))
en = json.load(open(os.path.join(D, 'strings-en.json'), encoding='utf-8'))
dw = json.load(open(os.path.join(D, 'dish-words.json'), encoding='utf-8'))
tr = json.load(open(os.path.join(D, code + '.json'), encoding='utf-8'))
problems = []
t = tr.get('t', {})
for k in en:
    if k not in t or not str(t[k]).strip():
        problems.append(f'missing t: {k!r}')
        continue
    ph_en = sorted(re.findall(r'\{\d+\}', k)); ph_tr = sorted(re.findall(r'\{\d+\}', t[k]))
    if ph_en != ph_tr:
        problems.append(f'placeholders differ: {k!r} -> {t[k]!r}')
extra = [k for k in t if k not in en]
if extra:
    problems.append(f'{len(extra)} extra keys in t (remove them): {extra[:5]}')
if langs[code].get('indic'):
    w = tr.get('w', {})
    for k in dw['words'] + dw['phrases']:
        if k not in w or not str(w[k]).strip():
            problems.append(f'missing w: {k!r}')
SCRIPT = {'hi': 'DEVANAGARI', 'mr': 'DEVANAGARI', 'bn': 'BENGALI', 'as': 'BENGALI', 'te': 'TELUGU', 'ta': 'TAMIL', 'gu': 'GUJARATI',
          'kn': 'KANNADA', 'ml': 'MALAYALAM', 'or': 'ORIYA', 'pa': 'GURMUKHI', 'ur': 'ARABIC', 'ar': 'ARABIC', 'ru': 'CYRILLIC'}
if code in SCRIPT:
    for part, vals in (('t', t.values()), ('w', tr.get('w', {}).values())):
        cnt = collections.Counter(unicodedata.name(ch, '?').split()[0] for v in vals for ch in str(v)
                                  if ord(ch) > 0x2FF and unicodedata.category(ch).startswith('L'))
        if cnt and cnt.most_common(1)[0][0] != SCRIPT[code]:
            problems.append(f'"{part}" is mostly in {cnt.most_common(1)[0][0]} script, expected {SCRIPT[code]}')
print(f'{code}: {len(t)} strings, {len(tr.get("w", {}))} words, {len(problems)} problems')
for p in problems[:40]:
    print('  ', p)
sys.exit(1 if problems else 0)
