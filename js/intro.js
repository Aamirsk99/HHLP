/* The Prime Fit launch animation: plays once each time the app opens (diet charts and clinic admin share it). */
(function () {
  'use strict';
  try { if (sessionStorage.getItem('primefit.intro')) return; sessionStorage.setItem('primefit.intro', '1'); } catch (_) { return; }
  const src = (document.currentScript && document.currentScript.src) || '';
  const root = src.replace(/js\/intro\.js.*$/, '');
  const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = `
#tpf-intro { position: fixed; inset: 0; z-index: 2147483000; display: grid; place-items: center; pointer-events: none; overflow: hidden;
  background: radial-gradient(120% 80% at 50% 38%, #11654b 0%, #083626 52%, #031b12 100%); color: #fff; transition: opacity .5s ease, transform .6s cubic-bezier(.2,.7,.2,1); }
#tpf-intro.out { opacity: 0; transform: scale(1.06); }
#tpf-intro .ti-glow { position: absolute; width: 520px; height: 520px; border-radius: 50%; background: radial-gradient(circle, rgba(241,215,122,.22), transparent 62%); animation: ti-breathe 2.4s ease-in-out both; }
#tpf-intro .ti-c { position: relative; display: grid; justify-items: center; gap: 14px; text-align: center; }
#tpf-intro .ti-medal { position: relative; width: 150px; height: 150px; display: grid; place-items: center; animation: ti-pop .9s cubic-bezier(.2,.8,.2,1.15) both; }
#tpf-intro .ti-medal i { position: absolute; inset: 15px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fffdf6, #f4ecd8 70%, #e8dcbc); box-shadow: 0 18px 40px -12px rgba(0,0,0,.6), inset 0 0 0 1px rgba(212,175,55,.6); overflow: hidden; }
#tpf-intro .ti-medal i::after { content: ""; position: absolute; inset: -40%; background: linear-gradient(115deg, transparent 42%, rgba(255,255,255,.85) 50%, transparent 58%); transform: translateX(-120%); animation: ti-shine 1.1s .95s ease-in-out both; }
#tpf-intro .ti-medal img { position: relative; width: 84px; height: 84px; border-radius: 22px; z-index: 1; }
#tpf-intro svg { position: absolute; inset: 0; width: 150px; height: 150px; transform: rotate(-90deg); }
#tpf-intro svg circle { fill: none; stroke: url(#ti-gold); stroke-width: 3; stroke-linecap: round; stroke-dasharray: 440; stroke-dashoffset: 440; animation: ti-ring 1.2s .15s cubic-bezier(.6,.1,.2,1) forwards; }
#tpf-intro b { font: 700 31px/1.1 "Prime Serif", Georgia, "Times New Roman", serif; letter-spacing: .06em; animation: ti-word .9s .55s cubic-bezier(.2,.7,.2,1) both; text-shadow: 0 6px 22px rgba(0,0,0,.45); }
#tpf-intro .ti-line { width: 120px; height: 2px; border-radius: 2px; background: linear-gradient(90deg, transparent, #f1d77a, #d4af37, transparent); transform: scaleX(0); animation: ti-line .8s .95s ease-out forwards; }
#tpf-intro small { font: 600 10.5px/1.4 system-ui, sans-serif; letter-spacing: .2em; max-width: 92vw; text-transform: uppercase; color: #f1d77a; opacity: 0; animation: ti-fade .8s 1.15s ease forwards; }
#tpf-intro .ti-dot { position: absolute; bottom: -10px; width: 4px; height: 4px; border-radius: 50%; background: #f1d77a; box-shadow: 0 0 8px #d4af37; opacity: 0; animation: ti-rise 2.6s linear both; }
@keyframes ti-pop { from { opacity: 0; transform: scale(.7); filter: blur(8px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes ti-ring { to { stroke-dashoffset: 0; } }
@keyframes ti-shine { to { transform: translateX(120%); } }
@keyframes ti-word { from { opacity: 0; letter-spacing: .4em; transform: translateY(10px); } to { opacity: 1; letter-spacing: .06em; transform: none; } }
@keyframes ti-line { to { transform: scaleX(1); } }
@keyframes ti-fade { to { opacity: 1; } }
@keyframes ti-breathe { from { opacity: 0; transform: scale(.6); } 60% { opacity: 1; } to { opacity: .8; transform: scale(1.1); } }
@keyframes ti-rise { 0% { opacity: 0; transform: translateY(0); } 15% { opacity: .9; } 100% { opacity: 0; transform: translateY(-70vh); } }
@media (prefers-reduced-motion: reduce) { #tpf-intro * { animation-duration: .01s !important; animation-delay: 0s !important; } }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const el = document.createElement('div'); el.id = 'tpf-intro'; el.setAttribute('aria-hidden', 'true');
  let dots = '';
  for (let i = 0; i < 14; i++) dots += `<span class="ti-dot" style="left:${5 + Math.round(Math.random() * 90)}%;animation-delay:${(Math.random() * 1.2).toFixed(2)}s;animation-duration:${(2 + Math.random() * 1.2).toFixed(2)}s"></span>`;
  el.innerHTML = `<div class="ti-glow"></div>${dots}<div class="ti-c"><div class="ti-medal"><svg viewBox="0 0 150 150"><defs><linearGradient id="ti-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e39a"/><stop offset=".5" stop-color="#d4af37"/><stop offset="1" stop-color="#9c7a1e"/></linearGradient></defs><circle cx="75" cy="75" r="70"/></svg><i></i><img src="${root}img/icon-192.png" alt=""></div><b>The Prime Fit</b><div class="ti-line"></div><small>Transform today · thrive tomorrow</small></div>`;
  const add = () => { (document.body || document.documentElement).appendChild(el); };
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
  const hold = still ? 700 : 2300;
  setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); st.remove(); }, 650); }, hold);
}());
