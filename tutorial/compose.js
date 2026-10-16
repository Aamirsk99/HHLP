// Step 2 of the tutorial build: turn each screenshot into a 1920×1080 video frame
// (chapter title + Hindi caption on the left, phone screen with the highlight on the right).
// Reads build/shots.json, writes build/frames/*.png.
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');

const OUT = path.join(__dirname, 'build');
const FRAMES = path.join(OUT, 'frames');
const shots = JSON.parse(fs.readFileSync(path.join(OUT, 'shots.json'), 'utf8'));
const total = Math.max(...shots.map((s) => s.chapter));
const url = (f) => pathToFileURL(f).href;
const logo = url(path.join(__dirname, '..', 'img', 'logo.jpg'));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const CSS = `
* { box-sizing: border-box; margin: 0; }
body { width: 1920px; height: 1080px; overflow: hidden; font-family: 'Noto Sans Devanagari', 'Noto Sans', sans-serif;
  background: linear-gradient(120deg, #0a3d6b 0%, #0f5c9c 55%, #1677c6 100%); color: #fff; position: relative; }
.glow { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .35; }
.left { position: absolute; left: 90px; top: 70px; width: 1000px; bottom: 70px; display: flex; flex-direction: column; }
.brand { display: flex; align-items: center; gap: 18px; }
.brand img { height: 64px; background: #fff; border-radius: 14px; padding: 8px 16px; }
.brand span { font-size: 26px; opacity: .85; font-weight: 600; }
.badge { margin-top: 56px; align-self: flex-start; background: #ffb547; color: #3a2400; font-weight: 800; font-size: 30px; padding: 6px 24px; border-radius: 40px; }
h1 { margin-top: 22px; font-size: 68px; line-height: 1.25; font-weight: 800; }
.en { margin-top: 6px; font-size: 30px; opacity: .75; font-weight: 500; letter-spacing: .5px; }
.say { margin-top: 44px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.22); border-radius: 28px; padding: 34px 40px;
  font-size: 40px; line-height: 1.65; font-weight: 500; }
.bar { margin-top: auto; height: 10px; background: rgba(255,255,255,.2); border-radius: 10px; overflow: hidden; }
.bar i { display: block; height: 100%; background: #ffb547; border-radius: 10px; }
.step { margin-top: 12px; font-size: 24px; opacity: .8; }
.phone { position: absolute; right: 150px; top: 50%; transform: translateY(-50%); width: 500px; height: 980px; background: #0c0f14;
  border-radius: 64px; padding: 18px; box-shadow: 0 40px 90px rgba(0,0,0,.45), inset 0 0 0 3px #2a3140; }
.screen { position: relative; width: 464px; height: 944px; border-radius: 48px; overflow: hidden; background: #fff; }
.screen img { position: absolute; left: 0; top: 16px; width: 464px; height: 928px; }
.notch { position: absolute; left: 50%; top: 10px; transform: translateX(-50%); width: 120px; height: 22px; background: #0c0f14; border-radius: 12px; z-index: 3; }
.ring { position: absolute; border: 5px solid #ff8a00; border-radius: 16px; box-shadow: 0 0 0 9999px rgba(10,20,40,.28), 0 0 24px 6px rgba(255,138,0,.75); z-index: 2; }
.tapme { position: absolute; font-size: 64px; z-index: 4; filter: drop-shadow(0 4px 8px rgba(0,0,0,.4)); }
.paper { position: absolute; right: 120px; top: 50%; transform: translateY(-50%); width: 700px; background: #fff; border-radius: 8px;
  box-shadow: 0 40px 90px rgba(0,0,0,.45); padding: 0; overflow: hidden; }
.paper img { display: block; width: 100%; }
.paper.tall { height: 990px; } .paper.tall img { height: 990px; width: auto; margin: 0 auto; }`;

function frameHtml(s) {
  const img = url(path.join(OUT, 'shots', s.file));
  let right;
  if (s.view) {
    right = `<div class="paper tall"><img src="${img}"></div>`;
  } else {
    let ring = '';
    if (s.box) {
      const k = 464 / s.box.vw;
      const pad = 6;
      const x = s.box.x * k - pad, y = s.box.y * k + 16 - pad, w = s.box.w * k + pad * 2, h = s.box.h * k + pad * 2;
      const fx = Math.min(x + w - 30, 400), fy = Math.min(y + h - 20, 870);
      ring = `<div class="ring" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></div><div class="tapme" style="left:${fx}px;top:${fy}px">👆</div>`;
    }
    right = `<div class="phone"><div class="screen"><div class="notch"></div><img src="${img}">${ring}</div></div>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
    <div class="glow" style="width:700px;height:700px;left:-200px;top:-250px;background:#5fb4ff"></div>
    <div class="glow" style="width:600px;height:600px;right:-150px;bottom:-200px;background:#ffb547"></div>
    <div class="left">
      <div class="brand"><img src="${logo}"><span>हिन्दिवाइन डाइट · ऐप कैसे इस्तेमाल करें</span></div>
      <div class="badge">भाग ${s.chapter} / ${total}</div>
      <h1>${esc(s.title)}</h1>
      <div class="en">${esc(s.en)}</div>
      <div class="say">${esc(s.say)}</div>
      <div class="bar"><i style="width:${(s.chapter / total) * 100}%"></i></div>
      <div class="step">www.hindivine.com</div>
    </div>
    ${right}
  </body></html>`;
}

(async () => {
  fs.rmSync(FRAMES, { recursive: true, force: true });
  fs.mkdirSync(FRAMES, { recursive: true });
  const browser = await chromium.launch();
  const p = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const tmp = path.join(OUT, 'frame.html');
  for (const s of shots) {
    fs.writeFileSync(tmp, frameHtml(s));
    await p.goto(url(tmp));
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(FRAMES, s.file) });
    // Shrink the caption if a long line would overflow the left column.
    const over = await p.evaluate(() => document.querySelector('.say').getBoundingClientRect().bottom > 960);
    if (over) {
      await p.addStyleTag({ content: '.say{font-size:34px;line-height:1.55;padding:28px 34px}' });
      await p.screenshot({ path: path.join(FRAMES, s.file) });
    }
    console.log('frame', s.file);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
