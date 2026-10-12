#!/usr/bin/env python3
"""Animated lower thirds on chroma-key green for Hindivine Healthcare videos.

Renders each lower third in two sizes:
  * video : 1920x1080 (16:9, YouTube / landscape)
  * reel  : 1080x1920 (9:16, Instagram Reels / Shorts)

Usage:  python3 lower-thirds/make_lower_thirds.py   (needs Pillow + ffmpeg)
Edit the LOWER_THIRDS list below to change names or subtitles.
"""
import os, subprocess, math
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, "videos")

GREEN = (0, 255, 0)            # standard chroma key green
NAVY = (10, 47, 85)            # brand #0a2f55
BLUE = (14, 111, 181)          # brand #0e6fb5
SKY = (41, 168, 224)           # brand #29a8e0
WHITE = (255, 255, 255)

FPS, DURATION = 30, 7.0
SS = 2                         # supersampling for smooth edges
F_TITLE = "/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf"
F_SUB = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"

LOWER_THIRDS = [
    # (file name, title, subtitle or None[, duration in seconds])
    ("hindivine_healthcare", "HINDIVINE HEALTHCARE", "Private Limited"),
    ("dr_rajat_goel", "Dr. Rajat Goel", None),
    ("dr_rajat_goel_hindivine", "Dr. Rajat Goel", "Hindivine Healthcare Pvt. Ltd."),
    ("educational_disclaimer", "For Educational Purposes Only",
     "Consult your doctor before making health changes"),
    ("medical_disclaimer", "DISCLAIMER",
     "This video is for educational and informational purposes only and does not "
     "replace professional medical advice, diagnosis, or treatment. In this video, we "
     "are not promoting any products or treatments. Always consult a qualified "
     "healthcare professional for individual medical guidance.", 17.0),
]

FORMATS = {
    # name: (width, height, left margin, bottom of graphic, max scale)
    "video": (1920, 1080, 120, 960, 1.0),
    "reel": (1080, 1920, 60, 1500, 0.95),
}


# ---------- easing / timing ----------
def clamp(x): return max(0.0, min(1.0, x))
def ease_out(x): return 1 - (1 - clamp(x)) ** 3
def ease_in(x): return clamp(x) ** 3
def back_out(x):
    x = clamp(x); c = 1.9
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

def prog(t, a, b, oa, ob, fn_in=ease_out):
    """In-animation between a..b, out-animation between oa..ob."""
    p_in = fn_in((t - a) / (b - a))
    p_out = ease_in((t - oa) / (ob - oa))
    return p_in * (1 - p_out)


# ---------- static layers ----------
def brand_icon():
    logo = Image.open(os.path.join(ROOT, "img", "logo.jpg")).convert("RGB")
    icon = logo.crop((0, 0, 285, 308))
    # blank out the start of the "HINDIVINE" wordmark next to the figure
    ImageDraw.Draw(icon).rectangle((226, 86, 285, 308), fill=WHITE)
    # white -> transparent so the figure sits on our own badge
    px = icon.convert("RGBA")
    data = [(r, g, b, 0 if r > 235 and g > 235 and b > 235 else 255)
            for r, g, b, _ in px.convert("RGBA").getdata()]
    px.putdata(data)
    return px

def rounded(w, h, r, fill):
    im = Image.new("RGBA", (w * SS, h * SS), (0, 0, 0, 0))
    ImageDraw.Draw(im).rounded_rectangle((0, 0, w * SS - 1, h * SS - 1), r * SS, fill=fill)
    return im.resize((w, h), Image.LANCZOS)

def wrapped_text_layer(text, font_path, size, color, max_w):
    """Left-aligned multi-line text wrapped to max_w pixels."""
    font = ImageFont.truetype(font_path, size * SS)
    lines, line = [], ""
    for word in text.split():
        trial = f"{line} {word}".strip()
        if line and font.getlength(trial) > max_w * SS:
            lines.append(line); line = word
        else:
            line = trial
    lines.append(line)
    lh = int(font.size * 1.4)
    w = int(max(font.getlength(ln) for ln in lines)) + 4 * SS
    im = Image.new("RGBA", (w, lh * len(lines) + font.size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for i, ln in enumerate(lines):
        d.text((0, i * lh), ln, font=font, fill=color)
    im = im.crop(im.getbbox())
    return im.resize((max(1, im.width // SS), max(1, im.height // SS)), Image.LANCZOS)

def text_layer(text, font_path, size, color, spacing=0):
    font = ImageFont.truetype(font_path, size * SS)
    l, t, r, b = font.getbbox(text)
    w, h = r - l + spacing * SS * len(text), font.size
    im = Image.new("RGBA", (w + 4 * SS, int(h * 1.25)), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    x = -l
    if spacing:
        for ch in text:
            d.text((x, 0), ch, font=font, fill=color)
            x += font.getlength(ch) + spacing * SS
    else:
        d.text((x, 0), text, font=font, fill=color)
    im = im.crop(im.getbbox())
    return im.resize((max(1, im.width // SS), max(1, im.height // SS)), Image.LANCZOS)

def badge(d, icon):
    big = Image.new("RGBA", (d * SS, d * SS), (0, 0, 0, 0))
    dr = ImageDraw.Draw(big)
    dr.ellipse((0, 0, d * SS - 1, d * SS - 1), fill=SKY)
    ring = int(d * 0.06) * SS
    dr.ellipse((ring, ring, d * SS - 1 - ring, d * SS - 1 - ring), fill=WHITE)
    isz = int(d * 0.68) * SS
    ic = icon.resize((int(isz * icon.width / icon.height), isz), Image.LANCZOS)
    big.alpha_composite(ic, ((d * SS - ic.width) // 2 + int(0.02 * d * SS), (d * SS - ic.height) // 2))
    return big.resize((d, d), Image.LANCZOS)

def shine(w, h):
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = im.load()
    for x in range(w):
        a = int(70 * math.exp(-((x - w / 2) / (w / 6)) ** 2))
        for y in range(h):
            px[x, y] = (255, 255, 255, a)
    return im


def build(title, sub, scale, icon, wrap_w=None):
    s = lambda v: max(1, int(round(v * scale)))
    L = {}
    L["badge_d"] = s(170)
    L["title"] = text_layer(title, F_TITLE, s(58), WHITE, spacing=1 if title.isupper() else 0)
    L["main"] = rounded(L["title"].width + s(80), s(100), s(14), NAVY + (255,))
    L["accent"] = rounded(s(12), s(100), s(6), SKY + (255,))
    if sub:
        if wrap_w:
            L["sub"] = wrapped_text_layer(sub, F_SUB, s(32), NAVY, wrap_w)
            sub_h = L["sub"].height + s(44)
        else:
            L["sub"] = text_layer(sub, F_SUB, s(32), BLUE)
            sub_h = s(58)
        L["subp"] = rounded(L["sub"].width + s(60), sub_h, s(10), WHITE + (255,))
    L["badge"] = badge(L["badge_d"], icon)
    L["shine"] = shine(s(160), s(100))
    return L


def panel_with_text(panel, text, tx, ty, dy, alpha=1.0):
    im = panel.copy()
    tl = text
    if alpha < 1:
        tl = text.copy(); tl.putalpha(tl.getchannel("A").point(lambda a: int(a * alpha)))
    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    layer.paste(tl, (tx, ty + dy), tl)
    im.alpha_composite(layer)
    # clip to panel shape
    im.putalpha(Image.composite(im.getchannel("A"), Image.new("L", im.size, 0), panel.getchannel("A")))
    return im


def wipe(im, p):
    w = int(im.width * clamp(p))
    if w <= 0:
        return None
    return im.crop((0, 0, w, im.height))


def frame(t, L, W, H, x0, bottom, scale, has_sub, duration):
    s = lambda v: int(round(v * scale))
    canvas = Image.new("RGBA", (W, H), GREEN + (255,))
    bd = L["badge_d"]
    main_h, sub_h = L["main"].height, (L["subp"].height if has_sub else 0)
    gap = s(8)
    block_h = main_h + (gap + sub_h if has_sub else 0)
    top = bottom - max(bd, block_h)
    bcy = top + max(bd, block_h) // 2
    main_y = bcy - block_h // 2
    if block_h > bd:                # tall card: badge sits beside the title
        bcy = main_y + bd // 2
    px = x0 + bd + s(4)           # accent strip x; panels follow it

    OA, OB = duration - 1.4, duration - 0.7   # out timing

    # accent strip
    pa = prog(t, 0.25, 0.6, OA + 0.25, OB + 0.1)
    if pa > 0:
        acc = L["accent"]
        ah = int(acc.height * pa)
        if ah > 0:
            canvas.alpha_composite(acc.crop((0, 0, acc.width, ah)), (px, main_y))

    # main panel + title
    pm = prog(t, 0.4, 1.0, OA + 0.15, OB)
    if pm > 0:
        pt = prog(t, 0.7, 1.2, OA, OA + 0.4)
        dy = int((1 - pt) * main_h * 0.9)
        title = L["title"]
        tx, ty = s(40), (main_h - title.height) // 2
        p = panel_with_text(L["main"], title, tx, ty, dy, alpha=pt)
        # light sweep across the panel
        sh = (t - 1.7) / 0.9
        if 0 < sh < 1:
            sl = Image.new("RGBA", p.size, (0, 0, 0, 0))
            sx = int(-L["shine"].width + sh * (p.width + L["shine"].width))
            sl.paste(L["shine"], (sx, 0), L["shine"])
            sl.putalpha(Image.composite(sl.getchannel("A"), Image.new("L", p.size, 0), p.getchannel("A")))
            p.alpha_composite(sl)
        pw = wipe(p, pm)
        if pw:
            canvas.alpha_composite(pw, (px + s(20), main_y))

    # subtitle panel
    if has_sub:
        ps = prog(t, 0.8, 1.35, OA, OB - 0.15)
        if ps > 0:
            pst = prog(t, 1.05, 1.5, OA - 0.1, OA + 0.3)
            sub = L["sub"]
            p = panel_with_text(L["subp"], sub, s(30), (sub_h - sub.height) // 2, int((1 - pst) * sub_h), alpha=pst)
            pw = wipe(p, ps)
            if pw:
                canvas.alpha_composite(pw, (px + s(20), main_y + main_h + gap))

    # badge pop (drawn last, on top)
    pb_in = back_out((t - 0.0) / 0.55)
    pb_out = ease_in((t - (OB - 0.2)) / 0.45)
    pb = pb_in * (1 - pb_out)
    if pb > 0.01:
        d = max(1, int(bd * pb))
        b = L["badge"].resize((d, d), Image.LANCZOS)
        cx, cy = x0 + bd // 2, bcy
        canvas.alpha_composite(b, (cx - d // 2, cy - d // 2))

    return canvas.convert("RGB")


def layout_width(L, has_sub, scale):
    bd = L["badge_d"]
    w = max(L["main"].width, L["subp"].width if has_sub else 0)
    return bd + int(24 * scale) + w


def render(name, title, sub, icon, fmt, preview_dir, duration=DURATION):
    W, H, x0, bottom, max_scale = FORMATS[fmt]
    scale = max_scale
    avail = W - 2 * x0
    L = build(title, sub, scale, icon)
    wrap_w = None
    if sub and layout_width(L, True, scale) > avail:
        # long subtitle: wrap it into lines instead of shrinking everything
        wrap_w = min(avail - L["badge_d"] - int(84 * scale), int(1100 * scale))
        L = build(title, sub, scale, icon, wrap_w)
    if layout_width(L, bool(sub), scale) > avail:
        scale *= avail / layout_width(L, bool(sub), scale)
        L = build(title, sub, scale, icon, wrap_w and int(wrap_w * scale / max_scale))
    path = os.path.join(OUT, fmt, f"{name}_{fmt}_{W}x{H}.mp4")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    ff = subprocess.Popen([
        "ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
        "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", path], stdin=subprocess.PIPE)
    n = int(FPS * duration)
    for i in range(n):
        f = frame(i / FPS, L, W, H, x0, bottom, scale, bool(sub), duration)
        ff.stdin.write(f.tobytes())
        if preview_dir and i == int(3.0 * FPS):
            os.makedirs(preview_dir, exist_ok=True)
            f.save(os.path.join(preview_dir, f"{name}_{fmt}.png"))
    ff.stdin.close(); ff.wait()
    print("wrote", os.path.relpath(path, ROOT))


if __name__ == "__main__":
    icon = brand_icon()
    for name, title, sub, *dur in LOWER_THIRDS:
        for fmt in FORMATS:
            render(name, title, sub, icon, fmt, os.path.join(HERE, "previews"), *dur)
