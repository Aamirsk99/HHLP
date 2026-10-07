"""Food icons for recipes: Microsoft Fluent 3D emoji (MIT licence, icons/fluent3d/) set in a gold-ringed medallion,
cached as small JPEGs in icons/. Falls back to the Noto Color Emoji font if a 3D image is missing."""
import os

from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
DIR = os.path.join(HERE, 'icons')
FONT = '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf'

CATEGORY = {
    'Breakfast': '\U0001F95E', 'Breads & Parathas': '\U0001FAD3', 'Poha, Upma & Porridge': '\U0001F963', 'Dals, Sambar & Kadhi': '\U0001F372',
    'Legume Curries': '\U0001FAD8', 'Dry Sabzi': '\U0001F966', 'Paneer & Vegetable Curries': '\U0001F35B', 'Rice, Khichdi & Biryani': '\U0001F35A',
    'Salads & Raita': '\U0001F957', 'Soups': '\U0001F35C', 'Chutneys & Dips': '\U0001F33F', 'Snacks & Starters': '\U0001F95F',
    'Egg Dishes': '\U0001F373', 'Chicken': '\U0001F357', 'Mutton': '\U0001F356', 'Fish & Seafood': '\U0001F41F',
    'Healthy Sweets': '\U0001F36E', 'Drinks & Smoothies': '\U0001F964', 'Sandwiches & Wraps': '\U0001F96A', 'Regional Specials': '\U0001F371',
}
# (keyword in name, icon) checked in order before the category icon
KEYWORDS = [
    ('prawn', '\U0001F990'), ('crab', '\U0001F980'), ('egg', '\U0001F95A'), ('omelette', '\U0001F373'),
    ('tea', '\U0001F375'), ('kadha', '\U0001F375'), ('kahwa', '\U0001F375'), ('coffee', '☕'), ('chai', '☕'),
    ('milk', '\U0001F95B'), ('doodh', '\U0001F95B'), ('lassi', '\U0001F95B'), ('chaas', '\U0001F95B'),
    ('juice', '\U0001F9C3'), ('water', '\U0001F4A7'), ('lemonade', '\U0001F34B'), ('nimbu', '\U0001F34B'),
    ('mango', '\U0001F96D'), ('banana', '\U0001F34C'), ('apple', '\U0001F34E'), ('strawberry', '\U0001F353'), ('watermelon', '\U0001F349'),
    ('pineapple', '\U0001F34D'), ('coconut', '\U0001F965'), ('avocado', '\U0001F951'), ('kiwi', '\U0001F95D'), ('pear', '\U0001F350'),
    ('orange', '\U0001F34A'), ('grape', '\U0001F347'), ('ladoo', '\U0001F9C6'), ('energy', '\U0001F9C6'), ('chikki', '\U0001F36C'), ('barfi', '\U0001F36C'),
    ('cookie', '\U0001F36A'), ('cake', '\U0001F370'), ('bread', '\U0001F35E'), ('kulfi', '\U0001F366'), ('frozen', '\U0001F366'),
    ('granita', '\U0001F367'), ('kheer', '\U0001F36E'), ('payasam', '\U0001F36E'), ('halwa', '\U0001F36F'),
    ('biryani', '\U0001F958'), ('pulao', '\U0001F35A'), ('khichdi', '\U0001F35A'), ('fried rice', '\U0001F35A'),
    ('dosa', '\U0001FAD3'), ('uttapam', '\U0001FAD3'), ('idli', '\U0001F35A'), ('momo', '\U0001F95F'), ('thukpa', '\U0001F35C'),
    ('corn', '\U0001F33D'), ('mushroom', '\U0001F344'), ('carrot', '\U0001F955'), ('broccoli', '\U0001F966'), ('tomato', '\U0001F345'),
    ('potato', '\U0001F954'), ('aloo', '\U0001F954'), ('sweet potato', '\U0001F360'), ('shakarkandi', '\U0001F360'), ('brinjal', '\U0001F346'),
    ('baingan', '\U0001F346'), ('cucumber', '\U0001F952'), ('capsicum', '\U0001FAD1'), ('shimla', '\U0001FAD1'), ('palak', '\U0001F96C'),
    ('spinach', '\U0001F96C'), ('methi', '\U0001F96C'), ('peanut', '\U0001F95C'), ('chickpea', '\U0001FAD8'), ('rajma', '\U0001FAD8'),
    ('chole', '\U0001FAD8'), ('salad', '\U0001F957'), ('wrap', '\U0001F32F'), ('roll', '\U0001F32F'), ('frankie', '\U0001F32F'),
    ('toast', '\U0001F35E'), ('sandwich', '\U0001F96A'), ('soup', '\U0001F35C'), ('shorba', '\U0001F35C'), ('rasam', '\U0001F35C'),
]
DRINK_ONLY = {'tea', 'kadha', 'kahwa', 'coffee', 'chai', 'milk', 'doodh', 'lassi', 'chaas', 'juice', 'water', 'lemonade', 'nimbu'}


def icon_char(r):
    n = r['name'].lower()
    for kw, ch in KEYWORDS:
        if kw in n:
            if kw in DRINK_ONLY and r['cat'] not in ('Drinks & Smoothies', 'Regional Specials', 'Healthy Sweets'):
                continue
            if kw == 'egg' and r['cat'] in ('Healthy Sweets', 'Drinks & Smoothies'):
                continue
            return ch
    return CATEGORY[r['cat']]


_font = None


IVORY = (251, 248, 242)
GOLD = (184, 145, 58)


def _source(ch):
    src = os.path.join(DIR, 'fluent3d', f'{ord(ch[0]):x}.png')
    if os.path.exists(src):
        return Image.open(src).convert('RGBA')
    global _font
    if _font is None:
        _font = ImageFont.truetype(FONT, 109)
    im = Image.new('RGBA', (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((12, 16), ch, font=_font, embedded_color=True)
    return im.crop(im.getbbox())


def icon_path(ch):
    """Path to a 200 px JPEG medallion (ivory, white disc, gold ring, soft shadow, 3D icon), created on first use."""
    os.makedirs(DIR, exist_ok=True)
    path = os.path.join(DIR, '-'.join(f'{ord(c):x}' for c in ch) + '.jpg')
    if not os.path.exists(path):
        S = 400  # draw at 2x, then downscale for smooth edges
        base = Image.new('RGB', (S, S), IVORY)
        shadow = Image.new('L', (S, S), 0)
        ImageDraw.Draw(shadow).ellipse((34, 44, S - 26, S - 16), fill=70)
        shadow = shadow.filter(ImageFilter.GaussianBlur(14))
        base.paste(Image.new('RGB', (S, S), (214, 202, 180)), (0, 0), shadow)
        d = ImageDraw.Draw(base)
        d.ellipse((24, 24, S - 24, S - 24), fill=(255, 255, 255), outline=GOLD, width=7)
        d.ellipse((40, 40, S - 40, S - 40), outline=(233, 220, 192), width=3)
        icon = _source(ch)
        icon.thumbnail((236, 236), Image.LANCZOS)
        base.paste(icon, ((S - icon.size[0]) // 2, (S - icon.size[1]) // 2), icon)
        base = base.resize((200, 200), Image.LANCZOS)
        base.save(path, quality=82, optimize=True)
    return path


def icon_for(r):
    return icon_path(icon_char(r))


if __name__ == '__main__':
    # Pre-build every icon so worker processes never race to create the same file.
    for ch in set(CATEGORY.values()) | {c for _, c in KEYWORDS}:
        icon_path(ch)
    print(len([f for f in os.listdir(DIR) if f.endswith('.jpg')]), 'icons in', DIR)
