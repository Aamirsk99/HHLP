#!/usr/bin/env python3
"""Luxury animated medico-legal disclaimer card on chroma-key green.

Navy card with gold trim, Playfair Display heading and point-by-point reveal.
Renders a 16:9 video (1920x1080) and a 9:16 reel (1080x1920) version.

Usage:  python3 lower-thirds/luxury_disclaimer.py   (needs Pillow + ffmpeg)
"""
import os, subprocess
from PIL import Image, ImageDraw, ImageFont

from make_lower_thirds import (HERE, ROOT, OUT, GREEN, WHITE, SS, FPS,
                               brand_icon, clamp, ease_out, ease_in, back_out)

F_SERIF = os.path.join(HERE, "fonts", "PlayfairDisplay.ttf")
F_BODY = "/usr/share/fonts/opentype/inter/Inter-Medium.otf"
F_BODY_I = "/usr/share/fonts/opentype/inter/Inter-Italic.otf"
F_FOOT = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"

NAVY_DARK = (5, 22, 42)
NAVY = (12, 52, 92)
GOLD_LIGHT = (247, 223, 140)
GOLD = (212, 175, 55)
GOLD_DARK = (160, 120, 30)
SOFT_WHITE = (236, 241, 247)
MUTED = (178, 196, 216)

DURATION = 26.0

TITLE = "MEDICAL DISCLAIMER"
POINTS = [
    "This video is for general educational and awareness purposes only and "
    "does not constitute medical advice.",
    "Watching this content does not create a doctor–patient relationship.",
    "In this video, we are not promoting/selling any products or treatments.",
    "It is not a substitute for diagnosis or treatment by a qualified, "
    "registered medical practitioner.",
    "Do not start, stop or change any medicine, diet or therapy without "
    "consulting your doctor.",
    "Every patient is different and results may vary. In an emergency, call "
    "112 / 108 or visit the nearest hospital immediately.",
]
LIABILITY = ("Hindivine Healthcare Pvt. Ltd. and Dr. Rajat Goel accept no liability "
             "for any action taken solely on the basis of this content.")
FOOTER = "HINDIVINE HEALTHCARE PVT. LTD.   •   DR. RAJAT GOEL"

FORMATS = {
    # card width, centre y, title size, body size, small size, padding, badge
    "video": dict(W=1920, H=1080, cw=1560, cy=556, title=50, body=29, small=22,
                  pad=88, badge=128),
    "reel": dict(W=1080, H=1920, cw=980, cy=880, title=50, body=33, small=25,
                 pad=64, badge=150),
}


# ---------- drawing helpers (all drawn at SS x then downscaled) ----------
def font(path, size, weight=None):
    f = ImageFont.truetype(path, int(size * SS))
    if weight:
        f.set_variation_by_axes([weight])
    return f

def down(im):
    return im.resize((max(1, im.width // SS), max(1, im.height // SS)), Image.LANCZOS)

def gold_fill(mask):
    """Paint a vertical gold gradient through an L mask."""
    w, h = mask.size
    grad = Image.new("RGB", (1, 3))
    grad.putpixel((0, 0), GOLD_LIGHT); grad.putpixel((0, 1), GOLD); grad.putpixel((0, 2), GOLD_DARK)
    grad = grad.resize((w, h), Image.BILINEAR).convert("RGBA")
    grad.putalpha(mask)
    return grad

def spaced_text(text, f, tracking, fill=None):
    """Text with letter spacing; returns RGBA (gold gradient when fill is None)."""
    widths = [f.getlength(c) for c in text]
    w = int(sum(widths) + tracking * SS * (len(text) - 1)) + 4
    asc, desc = f.getmetrics()
    mask = Image.new("L", (w, asc + desc), 0)
    d = ImageDraw.Draw(mask); x = 0
    for c, cw in zip(text, widths):
        d.text((x, 0), c, font=f, fill=255); x += cw + tracking * SS
    mask = mask.crop(mask.getbbox())
    if fill is None:
        return down(gold_fill(mask))
    im = Image.new("RGBA", mask.size, fill + (0,)); im.putalpha(mask)
    return down(im)

def wrap(text, f, max_w):
    lines, line = [], ""
    for word in text.split():
        trial = f"{line} {word}".strip()
        if line and f.getlength(trial) > max_w * SS:
            lines.append(line); line = word
        else:
            line = trial
    return lines + [line]

def paragraph(text, path, size, color, max_w, leading=1.42):
    f = font(path, size)
    lines = wrap(text, f, max_w)
    lh = int(f.size * leading)
    asc, desc = f.getmetrics()
    w = int(max(f.getlength(l) for l in lines)) + 4
    im = Image.new("RGBA", (w, lh * (len(lines) - 1) + asc + desc), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for i, l in enumerate(lines):
        d.text((0, i * lh), l, font=f, fill=color)
    return down(im)

def diamond(size, fill=None):
    s = size * SS
    m = Image.new("L", (s, s), 0)
    ImageDraw.Draw(m).polygon([(s / 2, 0), (s, s / 2), (s / 2, s), (0, s / 2)], fill=255)
    return down(gold_fill(m))

def divider(width, k):
    """Gold hairline with a diamond ornament in the centre."""
    h = int(22 * k)
    m = Image.new("L", (width * SS, h * SS), 0)
    d = ImageDraw.Draw(m)
    cy, cx = h * SS // 2, width * SS // 2
    t = max(2, int(2 * k * SS))
    gap = int(22 * k * SS)
    d.rectangle((0, cy - t // 2, cx - gap, cy + t // 2), fill=255)
    d.rectangle((cx + gap, cy - t // 2, width * SS, cy + t // 2), fill=255)
    r = int(9 * k * SS)
    d.polygon([(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)], fill=255)
    # fade the line ends
    W = m.width
    row = Image.new("L", (W, 1))
    row.putdata([int(255 * min(1, x / (W * 0.25), (W - x) / (W * 0.25))) for x in range(W)])
    ramp = row.resize(m.size)
    m = Image.composite(m, Image.new("L", m.size, 0), ramp)
    return down(gold_fill(m))

def card_background(w, h, k):
    r = int(30 * k)
    big = Image.new("RGBA", (w * SS, h * SS), (0, 0, 0, 0))
    # soft diagonal navy gradient (dark top-left -> lighter bottom-right)
    n = max(big.size)
    diag = Image.linear_gradient("L").resize((n * 2, n * 2)).rotate(-35, resample=Image.BICUBIC)
    diag = diag.crop((n - big.width // 2, n - big.height // 2,
                      n - big.width // 2 + big.width, n - big.height // 2 + big.height))
    base = Image.composite(Image.new("RGBA", big.size, NAVY + (255,)),
                           Image.new("RGBA", big.size, NAVY_DARK + (255,)), diag)
    mask = Image.new("L", big.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, big.width - 1, big.height - 1), r * SS, fill=255)
    big.paste(base, (0, 0), mask)
    # outer gold edge + inner hairline
    gm = Image.new("L", big.size, 0)
    d = ImageDraw.Draw(gm)
    t1, inset, t2 = int(3 * k * SS), int(14 * k * SS), max(2, int(1.5 * k * SS))
    d.rounded_rectangle((0, 0, big.width - 1, big.height - 1), r * SS, outline=255, width=t1)
    d.rounded_rectangle((inset, inset, big.width - 1 - inset, big.height - 1 - inset),
                        (r - 10) * SS, outline=180, width=t2)
    big.alpha_composite(gold_fill(gm))
    return down(big)

def badge(d):
    s = d * SS
    big = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    ring = Image.new("L", (s, s), 0)
    ImageDraw.Draw(ring).ellipse((0, 0, s - 1, s - 1), fill=255)
    big.alpha_composite(gold_fill(ring))
    inner = int(s * 0.055)
    ImageDraw.Draw(big).ellipse((inner, inner, s - 1 - inner, s - 1 - inner), fill=WHITE)
    icon = brand_icon()
    isz = int(s * 0.66)
    ic = icon.resize((int(isz * icon.width / icon.height), isz), Image.LANCZOS)
    big.alpha_composite(ic, ((s - ic.width) // 2 + int(0.02 * s), (s - ic.height) // 2))
    return down(big)

def shine(w, h):
    g = Image.linear_gradient("L").rotate(90, expand=True).resize((w, 1))
    a = g.point(lambda v: int(55 * max(0, 1 - abs(v - 128) / 128) ** 2))
    im = Image.new("RGBA", (w, 1), (255, 240, 200, 0)); im.putalpha(a)
    return im.resize((w, h))

def with_alpha(im, a):
    if a >= 1:
        return im
    im = im.copy(); im.putalpha(im.getchannel("A").point(lambda v: int(v * a)))
    return im


# ---------- layout ----------
def build(cfg):
    k = cfg["cw"] / 1560 if cfg["W"] > cfg["H"] else 1.0
    cw, pad = cfg["cw"], cfg["pad"]
    L = {"k": k}
    L["title"] = spaced_text(TITLE, font(F_SERIF, cfg["title"], 800), 6)
    L["div"] = divider(int(cw * 0.56), max(k, 0.9))
    bullet = int(cfg["body"] * 0.46)
    L["bullet"] = diamond(bullet)
    indent = bullet + int(cfg["body"] * 0.8)
    text_w = cw - 2 * pad - indent
    L["points"] = [paragraph(p, F_BODY, cfg["body"], SOFT_WHITE, text_w) for p in POINTS]
    L["liab"] = paragraph(LIABILITY, F_BODY_I, cfg["small"], MUTED, cw - 2 * pad)
    L["foot_div"] = divider(int(cw * 0.36), max(k, 0.9) * 0.8)
    L["foot"] = spaced_text(FOOTER, font(F_FOOT, cfg["small"] * 0.9), 3)
    L["badge"] = badge(cfg["badge"])

    # vertical positions inside the card
    y = cfg["badge"] // 2 + int(28 * k)          # badge overlaps the top edge
    pos = {"title": y}; y += L["title"].height + int(22 * k)
    pos["div"] = y; y += L["div"].height + int(34 * k)
    pos["points"] = []
    gap = int(cfg["body"] * 0.72)
    for p in L["points"]:
        pos["points"].append(y); y += p.height + gap
    y += int(8 * k)
    pos["liab"] = y; y += L["liab"].height + int(30 * k)
    pos["foot_div"] = y; y += L["foot_div"].height + int(14 * k)
    pos["foot"] = y; y += L["foot"].height + int(52 * k)
    L["pos"], L["indent"], L["ch"] = pos, indent, y
    L["card"] = card_background(cw, y, k)
    L["shine"] = shine(int(cw * 0.35), y)
    return L


def frame(t, L, cfg):
    W, H, cw, pad, D = cfg["W"], cfg["H"], cfg["cw"], cfg["pad"], DURATION
    ch, pos, k = L["ch"], L["pos"], L["k"]
    canvas = Image.new("RGBA", (W, H), GREEN + (255,))
    x0, y0 = (W - cw) // 2, cfg["cy"] - ch // 2

    out = ease_in((t - (D - 1.1)) / 0.8)           # collapse at the end
    unfold = ease_out(t / 0.8) * (1 - out)
    if unfold <= 0.005:
        return canvas.convert("RGB")

    card = L["card"].copy()

    def put(im, x, y, start, dur=0.6, rise=18):
        p = ease_out((t - start) / dur)
        fade = 1 - ease_in((t - (D - 1.5)) / 0.5)
        a = p * fade
        if a > 0.01:
            card.alpha_composite(with_alpha(im, a), (int(x), int(y + (1 - p) * rise * k)))

    put(L["title"], (cw - L["title"].width) // 2, pos["title"], 0.7)
    # divider grows from the centre
    gp = ease_out((t - 1.0) / 0.7) * (1 - ease_in((t - (D - 1.5)) / 0.5))
    if gp > 0.01:
        dv = L["div"]; w = max(1, int(dv.width * gp))
        crop = dv.crop(((dv.width - w) // 2, 0, (dv.width + w) // 2, dv.height))
        card.alpha_composite(crop, ((cw - w) // 2, pos["div"]))
    for i, (p, y) in enumerate(zip(L["points"], pos["points"])):
        st = 1.5 + i * 0.75
        by = y + (int(p.height / max(1, round(p.height / (cfg["body"] * 1.42)))) - L["bullet"].height) // 2
        put(L["bullet"], pad, by + 2 * k, st, 0.5, rise=0)
        put(p, pad + L["indent"], y, st + 0.1, 0.7, rise=0)
    tail = 1.5 + len(L["points"]) * 0.75 + 0.2
    put(L["liab"], pad, pos["liab"], tail)
    put(L["foot_div"], (cw - L["foot_div"].width) // 2, pos["foot_div"], tail + 0.3, rise=0)
    put(L["foot"], (cw - L["foot"].width) // 2, pos["foot"], tail + 0.45)

    # slow gold shine across the card after everything has appeared
    for sh_start in (tail + 1.2, D - 6.0):
        sh = (t - sh_start) / 1.6
        if 0 < sh < 1:
            s = L["shine"]
            layer = Image.new("RGBA", card.size, (0, 0, 0, 0))
            layer.paste(s, (int(-s.width + sh * (cw + s.width)), 0), s)
            layer.putalpha(Image.composite(layer.getchannel("A"), Image.new("L", card.size, 0),
                                           card.getchannel("A")))
            card.alpha_composite(layer)

    # unfold vertically from the centre
    vis = max(1, int(ch * unfold))
    top = (ch - vis) // 2
    canvas.alpha_composite(card.crop((0, top, cw, top + vis)), (x0, y0 + top))

    # badge pops in on the top edge
    pb = back_out((t - 0.35) / 0.55) * (1 - ease_in((t - (D - 1.25)) / 0.45))
    if pb > 0.01:
        d = max(1, int(L["badge"].width * pb))
        b = L["badge"].resize((d, d), Image.LANCZOS)
        canvas.alpha_composite(b, (W // 2 - d // 2, y0 - d // 2 + int(6 * k)))
    return canvas.convert("RGB")


def render(fmt, cfg):
    L = build(cfg)
    W, H = cfg["W"], cfg["H"]
    path = os.path.join(OUT, fmt, f"medical_disclaimer_luxury_{fmt}_{W}x{H}.mp4")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    ff = subprocess.Popen([
        "ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
        "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", path], stdin=subprocess.PIPE)
    for i in range(int(FPS * DURATION)):
        f = frame(i / FPS, L, cfg)
        ff.stdin.write(f.tobytes())
        if i == int(12 * FPS):
            os.makedirs(os.path.join(HERE, "previews"), exist_ok=True)
            f.save(os.path.join(HERE, "previews", f"medical_disclaimer_luxury_{fmt}.png"))
    ff.stdin.close(); ff.wait()
    print("wrote", os.path.relpath(path, ROOT), "card height", L["ch"])


if __name__ == "__main__":
    for fmt, cfg in FORMATS.items():
        render(fmt, cfg)
