#!/usr/bin/env python3
"""Premium medico-legal disclaimer card on chroma-key green (split layout).

Navy brand panel (logo, serif title) + ivory panel with six icon points.
Renders a 16:9 video (1920x1080) and a 9:16 reel (1080x1920) version.

Usage:  python3 lower-thirds/premium_disclaimer.py   (needs Pillow + ffmpeg)
"""
import os, subprocess
from PIL import Image, ImageDraw, ImageFont

from make_lower_thirds import HERE, ROOT, OUT, GREEN, WHITE, SS, FPS, clamp, ease_out, ease_in, back_out
from luxury_disclaimer import (font, down, gold_fill, spaced_text, paragraph, divider, badge,
                               shine, with_alpha, F_SERIF, NAVY, NAVY_DARK, GOLD, GOLD_LIGHT, MUTED)

F_ICON = os.path.join(HERE, "fonts", "fa-solid-900.ttf")
F_BOLD = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
F_SEMI = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
F_REG = "/usr/share/fonts/opentype/inter/Inter-Regular.otf"
F_ITAL = "/usr/share/fonts/opentype/inter/Inter-Italic.otf"

IVORY = (251, 248, 241)
IVORY_DARK = (241, 234, 220)
INK = (12, 40, 72)
SLATE = (74, 88, 108)
RED = (198, 40, 40)
ROYAL = (22, 78, 140)

DURATION = 26.0

# (icon code point, heading, detail, emphasis colour or None)
POINTS = [
    (0xf518, "Educational Only",
     "General health awareness content. It is not medical advice.", None),
    (0xf0f0, "No Doctor–Patient Relationship",
     "Watching this video does not create a doctor–patient relationship.", None),
    (0xf05e, "No Promotion / Selling",
     "In this video, we are not promoting/selling any products or treatments.", None),
    (0xf0f1, "Consult a Professional",
     "Not a substitute for diagnosis or treatment by a registered medical practitioner.", None),
    (0xf484, "Do Not Self-Medicate",
     "Never start, stop or change any medicine, diet or therapy without your doctor.", None),
    (0xf0f9, "In an Emergency",
     "Call 112 / 108 or visit the nearest hospital immediately.", RED),
]
LIABILITY = ("Individual results may vary. Hindivine Healthcare Pvt. Ltd. and Dr. Rajat Goel "
             "accept no liability for any action taken solely on the basis of this content.")
TAGLINE = "For educational purposes only"
BRAND = ["HINDIVINE HEALTHCARE PVT. LTD.", "DR. RAJAT GOEL"]

FORMATS = {
    "video": dict(W=1920, H=1080, cw=1700, cy=545, side=500, layout="split", cols=2,
                  icon=66, head=25, body=21, small=18, title=52, pad=54, badge=124),
    "reel": dict(W=1080, H=1920, cw=980, cy=860, side=0, layout="stack", cols=1,
                 icon=74, head=31, body=26, small=21, title=52, pad=56, badge=128),
}


# ---------- pieces ----------
def solid_text(text, path, size, color, tracking=0, weight=None):
    if tracking or weight:
        im = spaced_text(text, font(path, size, weight), tracking, fill=color)
        return im
    f = font(path, size)
    l, t, r, b = f.getbbox(text)
    im = Image.new("RGBA", (r - l + 4, b + 4), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((-l, 0), text, font=f, fill=color)
    return down(im.crop(im.getbbox()))

def icon_disc(code, d, emphasis=None):
    s = d * SS
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    ring = Image.new("L", (s, s), 0)
    ImageDraw.Draw(ring).ellipse((0, 0, s - 1, s - 1), fill=255)
    im.alpha_composite(gold_fill(ring))
    inner = int(s * 0.06)
    disc = Image.new("L", (s, s), 0)
    ImageDraw.Draw(disc).ellipse((inner, inner, s - 1 - inner, s - 1 - inner), fill=255)
    c1, c2 = (emphasis, tuple(int(v * 0.7) for v in emphasis)) if emphasis else (ROYAL, NAVY_DARK)
    grad = Image.composite(Image.new("RGBA", (s, s), c1 + (255,)), Image.new("RGBA", (s, s), c2 + (255,)),
                           Image.linear_gradient("L").transpose(Image.FLIP_TOP_BOTTOM).resize((s, s)))
    im.paste(grad, (0, 0), disc)
    f = ImageFont.truetype(F_ICON, int(s * 0.42))
    l, t, r, b = f.getbbox(chr(code))
    ImageDraw.Draw(im).text(((s - (r - l)) / 2 - l, (s - (b - t)) / 2 - t), chr(code), font=f, fill=WHITE)
    return down(im)

def pattern_panel(w, h, vertical_grad=True):
    """Navy gradient with faint concentric rings and medical crosses."""
    W, H = w * SS, h * SS
    g = Image.linear_gradient("L").resize((W, H))
    if not vertical_grad:
        g = g.rotate(90, expand=True).resize((W, H))
    im = Image.composite(Image.new("RGBA", (W, H), NAVY + (255,)),
                         Image.new("RGBA", (W, H), NAVY_DARK + (255,)), g)
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    cx, cy = int(W * 0.95), int(H * 0.98)
    for i in range(1, 14):
        r = int(i * 70 * SS)
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(255, 255, 255, 11), width=2 * SS)
    for (px, py) in [(0.12, 0.1), (0.85, 0.22), (0.2, 0.78), (0.7, 0.62)]:
        x, y, a, t = int(W * px), int(H * py), int(24 * SS), int(8 * SS)
        d.rectangle((x - t, y - a, x + t, y + a), fill=(255, 255, 255, 9))
        d.rectangle((x - a, y - t, x + a, y + t), fill=(255, 255, 255, 9))
    im.alpha_composite(ov)
    return down(im)

def ivory_panel(w, h):
    g = Image.linear_gradient("L").resize((w, h))
    return Image.composite(Image.new("RGBA", (w, h), IVORY_DARK + (255,)),
                           Image.new("RGBA", (w, h), IVORY + (255,)), g)

def gold_line(length, thick, vertical=False):
    W, H = (thick, length) if vertical else (length, thick)
    m = Image.new("L", (W, H))
    n = length
    vals = [int(255 * min(1, i / (n * 0.2), (n - i) / (n * 0.2))) for i in range(n)]
    if vertical:
        col = Image.new("L", (1, n)); col.putdata(vals)
        return gold_fill(col.resize((W, H)))
    row = Image.new("L", (n, 1)); row.putdata(vals)
    return gold_fill(row.resize((W, H)))


# ---------- layout ----------
def build(c):
    L = {"c": c}
    cw, pad, split = c["cw"], c["pad"], c["layout"] == "split"
    side = c["side"]
    body_w = cw - side if split else cw
    col_gap = int(pad * 0.75)
    col_w = (body_w - 2 * pad - col_gap * (c["cols"] - 1)) // c["cols"]
    text_w = col_w - c["icon"] - int(c["icon"] * 0.32)

    # title block
    L["badge"] = badge(c["badge"])
    t1 = solid_text("MEDICAL", F_SERIF, c["title"], WHITE, tracking=5, weight=700)
    t2 = spaced_text("DISCLAIMER", font(F_SERIF, c["title"], 800), 5)
    L["t1"], L["t2"] = t1, t2
    L["div"] = divider(int((side if split else cw) * 0.62), 0.9)
    L["tag"] = solid_text(TAGLINE.upper(), F_SEMI, c["small"], MUTED, tracking=3)
    if c["layout"] == "split":
        L["brand"] = [spaced_text(b, font(F_SEMI, c["small"] * 0.92), 3) for b in BRAND]
    else:
        L["brand"] = [solid_text(b, F_BOLD, c["small"] * 0.92, (150, 112, 28), tracking=3) for b in BRAND]
    L["label"] = solid_text("PLEASE READ CAREFULLY", F_BOLD, c["small"], (176, 136, 40), tracking=4)

    L["items"] = []
    for code, head, detail, emph in POINTS:
        L["items"].append(dict(
            icon=icon_disc(code, c["icon"], emph),
            head=solid_text(head, F_BOLD, c["head"], emph or INK),
            body=paragraph(detail, F_REG, c["body"], SLATE, text_w, leading=1.38)))
    L["liab"] = paragraph(LIABILITY, F_ITAL, c["small"], SLATE, body_w - 2 * pad, leading=1.4)

    # ----- positions inside the ivory body -----
    y = pad
    L["label_y"] = y; y += L["label"].height + int(pad * 0.7)
    rows = [L["items"][i:i + c["cols"]] for i in range(0, len(POINTS), c["cols"])]
    pos = []
    for row in rows:
        rh = 0
        for ci, it in enumerate(row):
            hh = int(c["head"] * 0.95) + int(c["body"] * 0.45) + it["body"].height
            pos.append((pad + ci * (col_w + col_gap), y))
            rh = max(rh, hh, c["icon"])
        y += rh + int(pad * 0.62)
    L["item_pos"] = pos
    y += int(pad * 0.05)
    L["rule_y"] = y; y += int(pad * 0.45)
    L["liab_y"] = y; y += L["liab"].height
    if not split:
        y += int(pad * 0.7)
        L["brand_y"] = y
        y += sum(b.height for b in L["brand"]) + int(c["small"] * 0.6)
    y += pad
    body_h = y

    # ----- title panel -----
    if split:
        ch = max(body_h, 640)
        hw, hh = side, ch
        off = (ch - body_h) // 2
        L["label_y"] += off; L["rule_y"] += off; L["liab_y"] += off
        L["item_pos"] = [(x, y + off) for x, y in L["item_pos"]]
    else:
        hh = int(c["badge"] * 0.62) + c["badge"] // 2 + t1.height + int(pad * 0.3) + t2.height \
            + int(pad * 0.5) + L["div"].height + int(pad * 0.35) + L["tag"].height + int(pad * 0.8)
        hw, ch = cw, hh + body_h
    L["hw"], L["hh"], L["ch"], L["body_w"], L["body_h"] = hw, hh, ch, body_w, body_h

    # ----- static card -----
    k = SS
    card = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    head_img = pattern_panel(hw, hh, vertical_grad=not split)
    card.paste(head_img, (0, 0))
    bx, by = (side, 0) if split else (0, hh)
    card.paste(ivory_panel(body_w, ch - by), (bx, by))
    # gold separator
    if split:
        card.alpha_composite(gold_line(ch, 3, vertical=True), (side - 1, 0))
    else:
        card.alpha_composite(gold_line(cw, 3), (0, hh - 1))
    # rounded mask + gold frame
    r = 30
    m = Image.new("L", (cw * SS, ch * SS), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, cw * SS - 1, ch * SS - 1), r * SS, fill=255)
    m = m.resize((cw, ch), Image.LANCZOS)
    card.putalpha(Image.composite(card.getchannel("A"), Image.new("L", card.size, 0), m))
    fm = Image.new("L", (cw * SS, ch * SS), 0)
    ImageDraw.Draw(fm).rounded_rectangle((0, 0, cw * SS - 1, ch * SS - 1), r * SS, outline=255, width=4 * SS)
    card.alpha_composite(down(gold_fill(fm)))
    # thin rule above the liability line
    rule = gold_line(body_w - 2 * pad, 2)
    card.alpha_composite(rule, (bx + pad, by + L["rule_y"]))
    L["card"], L["bx"], L["by"] = card, bx, by
    L["shine"] = shine(int(hw * 0.5) if split else int(cw * 0.35), hh)
    return L


def frame(t, L):
    c = L["c"]; W, H, cw, D = c["W"], c["H"], c["cw"], DURATION
    split, pad = c["layout"] == "split", c["pad"]
    ch, hw, hh, bx, by = L["ch"], L["hw"], L["hh"], L["bx"], L["by"]
    canvas = Image.new("RGBA", (W, H), GREEN + (255,))
    x0, y0 = (W - cw) // 2, c["cy"] - ch // 2

    reveal = ease_out(t / 0.9) * (1 - ease_in((t - (D - 0.9)) / 0.75))
    if reveal <= 0.005:
        return canvas.convert("RGB")
    fade_out = 1 - ease_in((t - (D - 1.5)) / 0.55)
    card = L["card"].copy()

    def put(im, x, y, start, dur=0.6, dx=0, dy=14):
        p = ease_out((t - start) / dur)
        a = p * fade_out
        if a > 0.01:
            card.alpha_composite(with_alpha(im, a), (int(x + (1 - p) * dx), int(y + (1 - p) * dy)))

    # ----- title panel content -----
    if split:
        gh = L["t1"].height + int(pad * 0.25) + L["t2"].height + int(pad * 0.45) + L["div"].height \
            + int(pad * 0.35) + L["tag"].height
        top = int(c["badge"] * 1.0) + int(pad * 0.9)
        gy = top + max(0, (ch - top - 150 - gh) // 2)
        bcx, bcy = hw // 2, int(pad * 0.75) + c["badge"] // 2
    else:
        bcx, bcy = cw // 2, int(c["badge"] * 0.12) + c["badge"] // 2
        gy = bcy + c["badge"] // 2 + int(pad * 0.45)
    cx = hw // 2
    put(L["t1"], cx - L["t1"].width // 2, gy, 0.75)
    gy += L["t1"].height + int(pad * 0.25)
    put(L["t2"], cx - L["t2"].width // 2, gy, 0.95)
    gy += L["t2"].height + int(pad * 0.45)
    gp = ease_out((t - 1.25) / 0.7) * fade_out
    if gp > 0.01:
        dv = L["div"]; w = max(1, int(dv.width * gp))
        card.alpha_composite(dv.crop(((dv.width - w) // 2, 0, (dv.width + w) // 2, dv.height)),
                             (cx - w // 2, gy))
    gy += L["div"].height + int(pad * 0.35)
    put(L["tag"], cx - L["tag"].width // 2, gy, 1.45)
    if split:
        yb = ch - pad - sum(b.height for b in L["brand"]) - int(c["small"] * 0.6)
        for i, b in enumerate(L["brand"]):
            put(b, cx - b.width // 2, yb, 1.6 + 0.1 * i, dy=0)
            yb += b.height + int(c["small"] * 0.6)

    # ----- body content -----
    put(L["label"], bx + pad, by + L["label_y"], 1.5, dy=0, dx=-16)
    for i, (it, (ix, iy)) in enumerate(zip(L["items"], L["item_pos"])):
        st = 1.8 + i * 0.55
        pb = back_out((t - st) / 0.5) * fade_out
        if pb > 0.02:
            d = max(1, int(it["icon"].width * pb))
            ic = it["icon"].resize((d, d), Image.LANCZOS)
            cxx, cyy = bx + ix + it["icon"].width // 2, by + iy + it["icon"].width // 2
            card.alpha_composite(ic, (cxx - d // 2, cyy - d // 2))
        tx = bx + ix + it["icon"].width + int(it["icon"].width * 0.32)
        hy = by + iy + max(0, (it["icon"].width - it["head"].height) // 2 - int(c["head"] * 0.55))
        put(it["head"], tx, hy, st + 0.12, dx=22, dy=0)
        put(it["body"], tx, hy + int(c["head"] * 0.95) + int(c["body"] * 0.45), st + 0.22, dx=22, dy=0)
    tail = 1.8 + len(L["items"]) * 0.55 + 0.3
    put(L["liab"], bx + pad, by + L["liab_y"], tail)
    if not split:
        yb = by + L["brand_y"]
        for i, b in enumerate(L["brand"]):
            put(b, cw // 2 - b.width // 2, yb, tail + 0.2 + 0.1 * i, dy=0)
            yb += b.height + int(c["small"] * 0.6)

    # gold shine across the title panel
    for s0 in (2.2, D - 7.0):
        sh = (t - s0) / 1.5
        if 0 < sh < 1:
            s = L["shine"]
            layer = Image.new("RGBA", card.size, (0, 0, 0, 0))
            layer.paste(s, (int(-s.width + sh * (hw + s.width)), 0), s)
            clip = Image.new("L", card.size, 0); clip.paste(255, (0, 0, hw, hh))
            clip = Image.composite(clip, Image.new("L", card.size, 0), card.getchannel("A"))
            layer.putalpha(Image.composite(layer.getchannel("A"), Image.new("L", card.size, 0), clip))
            card.alpha_composite(layer)

    # reveal: wipe from the left (video) or from the top (reel)
    if split:
        vis = max(1, int(cw * reveal))
        canvas.alpha_composite(card.crop((0, 0, vis, ch)), (x0, y0))
    else:
        vis = max(1, int(ch * reveal))
        canvas.alpha_composite(card.crop((0, 0, cw, vis)), (x0, y0))

    # logo badge pops in
    pb = back_out((t - 0.45) / 0.55) * (1 - ease_in((t - (D - 1.3)) / 0.45))
    if pb > 0.01:
        d = max(1, int(L["badge"].width * pb))
        b = L["badge"].resize((d, d), Image.LANCZOS)
        canvas.alpha_composite(b, (x0 + bcx - d // 2, y0 + bcy - d // 2))
    return canvas.convert("RGB")


def render(fmt, c):
    L = build(c)
    W, H = c["W"], c["H"]
    path = os.path.join(OUT, fmt, f"medical_disclaimer_premium_{fmt}_{W}x{H}.mp4")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    ff = subprocess.Popen([
        "ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
        "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", path], stdin=subprocess.PIPE)
    for i in range(int(FPS * DURATION)):
        f = frame(i / FPS, L)
        ff.stdin.write(f.tobytes())
        if i == int(12 * FPS):
            os.makedirs(os.path.join(HERE, "previews"), exist_ok=True)
            f.save(os.path.join(HERE, "previews", f"medical_disclaimer_premium_{fmt}.png"))
    ff.stdin.close(); ff.wait()
    print("wrote", os.path.relpath(path, ROOT), "card", c["cw"], "x", L["ch"])


if __name__ == "__main__":
    for fmt, c in FORMATS.items():
        render(fmt, c)
