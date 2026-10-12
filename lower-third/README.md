# Hindivine Healthcare — Lower Third

Contact strip for videos and live streams: logo, phone (+91 88899 95465),
website (www.hindivine.com) and social icons (Facebook, Instagram, YouTube,
X, LinkedIn, WhatsApp) with the handle.

| File | Use |
|------|-----|
| `hindivine-lower-third-transparent.png` | 1920×1080 PNG with transparent background — drop on top of any video track |
| `hindivine-lower-third-greenscreen.png` | Same on chroma-key green, for editors without alpha support |
| `index.html` | Animated version (slides in, holds 8 s, slides out, repeats) |

## Animated overlay (OBS / vMix / Streamlabs)

Add a **Browser Source**, tick *Local file*, pick `lower-third/index.html`,
size 1920×1080. Optional query options:

- `?loop=0` — animate in once and stay on screen
- `?bg=green` — green background (for screen-recording into an editor)
- `?handle=@yourhandle` — change the social handle
- `?phone=...` / `?web=...` — change the contact text

Re-export PNGs after editing by opening `index.html?static=1` and
screenshotting at 1920×1080.
