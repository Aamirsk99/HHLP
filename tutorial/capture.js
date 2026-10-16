// Step 1 of the tutorial build: drive the app in a phone-sized browser and
// screenshot every shot in chapters.js. Writes build/shots/*.png + build/shots.json.
// Usage: node tutorial/capture.js [appUrl]   (serve the repo first, e.g. npx http-server -p 8765)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const chapters = require('./chapters');

const URL = process.argv[2] || 'http://localhost:8765/index.html';
const OUT = path.join(__dirname, 'build');
const SHOTS = path.join(OUT, 'shots');
const VIEW = { width: 400, height: 800 };

async function seedChart(p, f) {
  await p.evaluate(() => { location.hash = 'home'; });
  await p.waitForTimeout(300);
  await p.click('.hero-cta');
  await p.fill('[name=name]', f.name);
  await p.fill('[name=age]', f.age);
  await p.fill('[name=weightKg]', f.weight);
  await p.fill('[name=heightCm]', f.height);
  await p.click(`.seg[data-name=sex] [data-value="${f.sex}"]`);
  await p.evaluate(() => { location.hash = 's2'; });
  await p.selectOption('#plan', f.plan);
  await p.evaluate(() => { location.hash = 's5'; });
  await p.waitForTimeout(300);
  await p.click('#generate');
  await p.waitForTimeout(500);
  if (f.nextWeek) { await p.click('#next-week'); await p.waitForTimeout(500); }
}

async function makePdf(p) {
  const pdf = path.join(OUT, 'chart.pdf');
  await p.evaluate(() => { window.print = () => {}; });
  await p.click('#pdf-named');
  await p.waitForTimeout(500);
  await p.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });
  execFileSync('pdftoppm', ['-r', '120', '-png', pdf, path.join(OUT, 'pdfpage')]);
  return pdf;
}

(async () => {
  fs.rmSync(SHOTS, { recursive: true, force: true });
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.error('page error:', e.message));
  await p.goto(URL);
  await p.waitForTimeout(800);

  // Sample data so the dashboard, patients and charts screens are not empty.
  await seedChart(p, { name: 'Rahul Verma', age: '35', weight: '84', height: '175', sex: 'male', plan: 'balanced', nextWeek: true });
  await seedChart(p, { name: 'Anita Gupta', age: '29', weight: '61', height: '160', sex: 'female', plan: 'pcos' });
  await p.evaluate(() => { const t = document.querySelector('#toast'); if (t) t.classList.remove('show'); });

  const state = { pdfPath: null };
  const manifest = [];
  for (const [ci, ch] of chapters.entries()) {
    for (const [si, shot] of ch.shots.entries()) {
      if (shot.view && !state.pdfPath) state.pdfPath = await makePdf(p);
      await shot.act(p, state);
      await p.waitForTimeout(250);
      if (!shot.keepToast) await p.evaluate(() => { const t = document.querySelector('#toast'); if (t) t.classList.remove('show'); });
      await p.waitForTimeout(250);
      const file = `${String(ci + 1).padStart(2, '0')}_${ch.id}_${si + 1}.png`;
      let box = null;
      let image;
      if (shot.view) {
        const n = shot.view === 'pdf1' ? 1 : 2;
        const pages = fs.readdirSync(OUT).filter((f) => f.startsWith('pdfpage')).sort();
        image = path.join(OUT, pages[Math.min(n, pages.length) - 1]);
        fs.copyFileSync(image, path.join(SHOTS, file));
      } else {
        await p.screenshot({ path: path.join(SHOTS, file) });
        if (shot.hl) {
          box = await p.evaluate((sel) => {
            const el = [...document.querySelectorAll(sel)].find((e) => e.getClientRects().length);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            const x = Math.max(r.left, 0), y = Math.max(r.top, 0);
            const w = Math.min(r.right, innerWidth) - x, h = Math.min(r.bottom, innerHeight) - y;
            return w > 0 && h > 0 ? { x, y, w, h, vw: innerWidth, vh: innerHeight } : null;
          }, shot.hl);
          if (!box) console.warn(`no highlight for ${file}: ${shot.hl}`);
        }
      }
      manifest.push({ chapter: ci + 1, id: ch.id, title: ch.title, en: ch.en, shot: si + 1, file, view: shot.view || null, box, say: shot.say });
      console.log('captured', file);
    }
  }
  fs.writeFileSync(path.join(OUT, 'shots.json'), JSON.stringify(manifest, null, 2));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
