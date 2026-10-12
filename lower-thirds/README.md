# Lower Thirds – Hindivine Healthcare / Dr. Rajat Goel

Animated lower-third name titles on a **chroma-key green (#00FF00)** background,
for educational videos. Drop a clip on the track above your footage, then apply
a green-screen / chroma key effect to remove the green.

| Lower third | Video 16:9 (1920×1080) | Reel 9:16 (1080×1920) |
|---|---|---|
| Hindivine Healthcare | `videos/video/hindivine_healthcare_video_1920x1080.mp4` | `videos/reel/hindivine_healthcare_reel_1080x1920.mp4` |
| Dr. Rajat Goel | `videos/video/dr_rajat_goel_video_1920x1080.mp4` | `videos/reel/dr_rajat_goel_reel_1080x1920.mp4` |
| Dr. Rajat Goel + Hindivine Healthcare | `videos/video/dr_rajat_goel_hindivine_video_1920x1080.mp4` | `videos/reel/dr_rajat_goel_hindivine_reel_1080x1920.mp4` |
| ⭐ **Premium MEDICAL DISCLAIMER** – split card with icons (26 s, newest design) | `videos/video/medical_disclaimer_premium_video_1920x1080.mp4` | `videos/reel/medical_disclaimer_premium_reel_1080x1920.mp4` |
| Luxury medico-legal MEDICAL DISCLAIMER card (26 s) | `videos/video/medical_disclaimer_luxury_video_1920x1080.mp4` | `videos/reel/medical_disclaimer_luxury_reel_1080x1920.mp4` |
| Full medical **DISCLAIMER** (multi-line, 14 s) | `videos/video/medical_disclaimer_video_1920x1080.mp4` | `videos/reel/medical_disclaimer_reel_1080x1920.mp4` |
| "For Educational Purposes Only" disclaimer | `videos/video/educational_disclaimer_video_1920x1080.mp4` | `videos/reel/educational_disclaimer_reel_1080x1920.mp4` |

Still frames of each are in `previews/`.

## Animation (7 s, 30 fps)

- 0.0–0.5 s – logo badge pops in
- 0.25–1.5 s – blue accent, name panel and subtitle panel wipe in, text slides up
- 1.7–2.6 s – light shine sweeps across the name
- hold until 5.6 s, then everything wipes out by 6.5 s

Reel versions sit higher (bottom at y=1500) so they stay clear of the
Instagram / YouTube Shorts caption and button area.

## Premium medical disclaimer (newest design)

`premium_disclaimer.py` renders a split card: a navy brand panel (logo, gold
serif "MEDICAL DISCLAIMER") and an ivory panel with six icon points. They are
Educational Only, No Doctor–Patient Relationship, No Promotion, Consult a
Professional, Do Not Self-Medicate and In an Emergency. The landscape version
uses two columns; the reel stacks the header above a single column. Edit
`POINTS`, `LIABILITY`, `TAGLINE` and `BRAND` at the top of the script. Icons are
from Font Awesome Free (`fonts/fa-solid-900.ttf`, SIL OFL / CC BY 4.0).

## Luxury medical disclaimer

`luxury_disclaimer.py` renders a navy card with gold trim, a Playfair Display
serif heading and gold diamond bullets. The points reveal one by one, then a
gold shine sweeps across the card. Edit `TITLE`, `POINTS`, `LIABILITY` and
`FOOTER` at the top of the script, then run `python3 lower-thirds/luxury_disclaimer.py`.
Playfair Display is included in `fonts/` (SIL Open Font License).

The wording is a general template. Have it reviewed by your legal or medical
adviser before publishing.

## Using the green screen

- **CapCut (mobile/desktop):** Overlay → add clip → Remove BG → Chroma key → pick the green, Intensity ~ 10–20.
- **Premiere Pro:** Effects → Ultra Key → eyedropper on the green.
- **DaVinci Resolve:** Fusion/Color → 3D Keyer, or Edit → Effects → "Chroma Keyer".
- **Final Cut Pro:** Keying → Keyer.

## Changing text

Edit `LOWER_THIRDS` at the top of `make_lower_thirds.py` (title, subtitle or
`None`, and an optional duration in seconds). Long subtitles are wrapped onto
several lines automatically. Then run:

```
python3 lower-thirds/make_lower_thirds.py
```

Requires Python 3 with Pillow, `ffmpeg`, and the Inter font.
