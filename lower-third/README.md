# Hindivine Healthcare — Lower Third

Contact strip for videos and live streams: logo, phones (+91 88899 95465,
+91 99589 00473), website (www.hindivine.com), email (info@hindivine.com)
and social icons (Facebook, Instagram, YouTube, X, LinkedIn, WhatsApp) with
the handle.

## Green-screen videos (1080p, 30 fps, H.264 MP4)

| File | Size | Length |
|------|------|--------|
| `hindivine-lower-third-16x9-15s-greenscreen.mp4` | 1920×1080 (YouTube, landscape) | 15 s |
| `hindivine-lower-third-16x9-10s-greenscreen.mp4` | 1920×1080 | 10 s |
| `hindivine-lower-third-reels-9x16-15s-greenscreen.mp4` | 1080×1920 (Reels, Shorts, Stories) | 15 s |
| `hindivine-lower-third-reels-9x16-10s-greenscreen.mp4` | 1080×1920 | 10 s |

Animation: accent bar grows → logo wipes in with a zoom → info panel wipes in
→ each contact line rises in turn → social icons pop one by one → handle types
on. While on screen a light runs through the bar, a shine sweeps the panel,
the phone icons ring and the social icons wave. It wipes out 1 s before the
end (e.g. at 14–14.5 s in the 15 s video), leaving pure green.

Put the video on the track above your footage and key out the green
(#00B140) with Chroma Key / Ultra Key in Premiere, CapCut, Filmora,
DaVinci, etc. The Reels layout sits clear of the app's caption area and
side buttons.

## Still images

`hindivine-lower-third-{16x9|reels-9x16}-transparent.png` (transparent
background) and `-greenscreen.png` versions. `preview-*.png` show the design
on a dark background.

## Animated overlay (OBS / vMix / Streamlabs)

Add a **Browser Source**, tick *Local file*, pick `lower-third/index.html`,
size 1920×1080 (or 1080×1920 with `?format=reel`). Query options:

- `?format=reel` — vertical 9:16 layout
- `?hold=15000` — time on screen before it wipes out (ms, default 8000)
- `?loop=0` — animate in once and stay on screen
- `?bg=green` — green background
- `?handle=@yourhandle` — change the social handle
- `?phone=...` / `?phone2=...` / `?web=...` / `?email=...` — change the contact text
