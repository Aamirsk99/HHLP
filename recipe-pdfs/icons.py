"""Food icons for recipes, drawn from the Noto Color Emoji font and cached as small JPEGs in icons/."""
import os

from PIL import Image, ImageDraw, ImageFont

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
    ('orange', '\U0001F34A'), ('grape', '\U0001F347'), ('ladoo', '\U0001F361'), ('chikki', '\U0001F36C'), ('barfi', '\U0001F36C'),
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
    ('tikka', '\U0001F362'), ('kebab', '\U0001F362'), ('kabab', '\U0001F362'), ('seekh', '\U0001F362'),
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


def icon_path(ch):
    """Path to a 96 px JPEG of the emoji on white, created on first use."""
    global _font
    os.makedirs(DIR, exist_ok=True)
    path = os.path.join(DIR, '-'.join(f'{ord(c):x}' for c in ch) + '.jpg')
    if not os.path.exists(path):
        if _font is None:
            _font = ImageFont.truetype(FONT, 109)
        im = Image.new('RGB', (160, 160), 'white')
        ImageDraw.Draw(im).text((12, 16), ch, font=_font, embedded_color=True)
        bbox = Image.eval(im.convert('L'), lambda p: 255 - p).point(lambda p: 255 if p > 8 else 0).getbbox()
        if bbox:
            im = im.crop(bbox)
        side = max(im.size)
        sq = Image.new('RGB', (side + 8, side + 8), 'white')
        sq.paste(im, ((side + 8 - im.size[0]) // 2, (side + 8 - im.size[1]) // 2))
        sq.thumbnail((96, 96))
        sq.save(path, quality=80, optimize=True)
    return path


def icon_for(r):
    return icon_path(icon_char(r))


if __name__ == '__main__':
    # Pre-build every icon so worker processes never race to create the same file.
    for ch in set(CATEGORY.values()) | {c for _, c in KEYWORDS}:
        icon_path(ch)
    print(len(os.listdir(DIR)), 'icons in', DIR)
