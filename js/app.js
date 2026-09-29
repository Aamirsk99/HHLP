/* DOM wiring for Hindivine Diet. */
(function () {
  const P = window.Planner;
  const BRAND = {
    app: 'Hindivine Diet',
    company: 'Hindivine Healthcare Private Limited',
    website: 'www.hindivine.com',
    logo: 'img/logo.jpg',
  };
  const form = document.getElementById('profile-form');
  const result = document.getElementById('result');
  const sheet = document.getElementById('print-sheet');
  const errorEl = document.getElementById('form-error');
  const PATIENT_KEY = 'hindivine.patient';
  const DIETITIAN_KEY = 'hindivine.dietitian';
  const DIETITIAN_FIELDS = ['dietitian', 'qualification', 'dietitianPhone'];

  let profile = null;
  let plan = null;
  let activeDay = 0;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function options(entries, selected) {
    return Object.entries(entries)
      .map(([k, v]) => `<option value="${k}"${k === selected ? ' selected' : ''}>${esc(typeof v === 'string' ? v : v.label)}</option>`)
      .join('');
  }
  document.getElementById('plan').innerHTML = options(P.PLANS, 'weight_loss');
  document.getElementById('activity').innerHTML = options(P.ACTIVITY, 'light');
  document.getElementById('diet').innerHTML = options(P.DIETS, 'veg');
  document.getElementById('conditions').innerHTML = Object.entries(P.CONDITIONS)
    .map(([k, v]) => `<label class="check"><input type="checkbox" name="conditions" value="${k}"> ${esc(v)}</label>`)
    .join('');

  function isoDate(d) {
    const z = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  }
  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return isNaN(d) ? iso : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function setDefaultDates() {
    const today = new Date();
    form.elements.date.value = isoDate(today);
    form.elements.reviewDate.value = isoDate(new Date(today.getTime() + 7 * 864e5));
  }

  function readForm() {
    const fd = new FormData(form);
    const text = (k) => (fd.get(k) || '').trim();
    return {
      name: text('name'),
      patientId: text('patientId'),
      phone: text('phone'),
      age: Number(fd.get('age')),
      sex: fd.get('sex'),
      heightCm: Number(fd.get('heightCm')),
      weightKg: Number(fd.get('weightKg')),
      date: fd.get('date'),
      reviewDate: fd.get('reviewDate'),
      notes: text('notes'),
      plan: fd.get('plan'),
      weightGoal: fd.get('weightGoal'),
      activity: fd.get('activity'),
      conditions: fd.getAll('conditions'),
      diet: fd.get('diet'),
      cuisine: fd.get('cuisine'),
      meals: Number(fd.get('meals')),
      earlyDrink: fd.get('earlyDrink') === 'on',
      dislikes: text('dislikes').split(',').map((s) => s.trim()).filter(Boolean),
      allergies: fd.getAll('allergies'),
      dietitian: text('dietitian'),
      qualification: text('qualification'),
      dietitianPhone: text('dietitianPhone'),
    };
  }

  function writeForm(p) {
    Object.entries(p).forEach(([key, val]) => {
      if (Array.isArray(val) && key !== 'dislikes') {
        form.querySelectorAll(`[name="${key}"]`).forEach((el) => { el.checked = val.includes(el.value); });
        return;
      }
      const el = form.elements[key];
      if (!el || !el.type) return;
      if (el.type === 'checkbox') el.checked = !!val;
      else el.value = Array.isArray(val) ? val.join(', ') : val;
    });
  }

  function validate(p) {
    if (!p.name) return 'Please enter the patient name.';
    if (!(p.age >= 14 && p.age <= 90)) return 'Age must be between 14 and 90.';
    if (!(p.heightCm >= 120 && p.heightCm <= 230)) return 'Height must be between 120 and 230 cm.';
    if (!(p.weightKg >= 30 && p.weightKg <= 250)) return 'Weight must be between 30 and 250 kg.';
    if (P.PLANS[p.plan].femaleOnly && p.sex !== 'female') return `${P.PLANS[p.plan].label} is only for female patients.`;
    return '';
  }

  function restrictions() {
    const r = P.resolveProfile(profile);
    const allergyNames = profile.allergies.map((a) => form.querySelector(`[name="allergies"][value="${a}"]`).parentElement.textContent.trim() + '-free');
    return [...r.conditions.map((c) => P.CONDITIONS[c]), ...allergyNames];
  }

  function macroPct(t) {
    const kp = t.protein * 4, kc = t.carbs * 4, kf = t.fat * 9, tot = kp + kc + kf;
    return { p: Math.round((kp / tot) * 100), c: Math.round((kc / tot) * 100), f: Math.round((kf / tot) * 100) };
  }

  function guidelines(t) {
    const list = P.tips(profile, t);
    const avgProtein = Math.round(plan.days.reduce((s, d) => s + d.totals.p, 0) / plan.days.length);
    if (avgProtein < t.protein * 0.85) {
      list.push(`These meals average ${avgProtein} g protein a day against a ${t.protein} g target. Add an extra serving of paneer, curd, dal, sprouts, soya, eggs or lean meat as the diet allows.`);
    }
    return list;
  }

  // ── Screen view ──────────────────────────────────────────────────
  function stat(label, value, sub) {
    return `<div class="stat"><span class="stat-label">${label}</span><span class="stat-value">${value}</span>${sub ? `<span class="stat-sub">${sub}</span>` : ''}</div>`;
  }

  function mealRow(entry, di, mi) {
    const m = entry.meal;
    if (!m) {
      return `<li class="meal missing"><div class="meal-time"><strong>${entry.label}</strong><span>${entry.time}</span></div>
        <div class="meal-body"><em>No option fits these restrictions — please plan this meal manually.</em></div></li>`;
    }
    return `<li class="meal">
      <div class="meal-time"><strong>${entry.label}</strong><span>${entry.time}</span></div>
      <div class="meal-body">
        <div class="meal-name">${esc(m.name)}</div>
        <ul class="items">${m.items.map((i) => `<li>${esc(i.name)} <span class="qty">${esc(i.text)}</span></li>`).join('')}</ul>
      </div>
      <div class="meal-nutri">
        <span class="kcal">${m.kcal} kcal</span>
        <span class="mac">P ${m.p} · C ${m.c} · F ${m.f}</span>
        <button type="button" class="btn small ghost" data-swap="${di}:${mi}" title="Swap for another option">Swap</button>
      </div>
    </li>`;
  }

  function render() {
    const t = plan.targets;
    const pct = macroPct(t);
    const r = restrictions();

    result.innerHTML = `
      <div class="card chart">
        <div class="chart-head">
          <div>
            <h2>${esc(profile.name)} — 7-Day Diet Chart</h2>
            <p class="meta">${esc(P.PLANS[profile.plan].label)} · ${esc(P.DIETS[profile.diet])} · ${profile.age} y ${profile.sex === 'male' ? 'M' : 'F'} · ${profile.heightCm} cm · ${profile.weightKg} kg${r.length ? ' · ' + esc(r.join(', ')) : ''}</p>
          </div>
          <div class="actions">
            <button type="button" class="btn" id="regen">New plan</button>
            <button type="button" class="btn" id="csv">CSV</button>
            <button type="button" class="btn primary" id="print">Download A4 PDF</button>
          </div>
        </div>

        <div class="stats">
          ${stat('Daily target', `${t.calories} kcal`, `${esc(P.GOALS[t.goal].label)} · maint. ${t.tdee}`)}
          ${stat('BMI', t.bmi, `${t.bmiCategory} · ideal ${t.idealWeight[0]}–${t.idealWeight[1]} kg`)}
          ${stat('Protein', `${t.protein} g`, `Carbs ${t.carbs} g · Fat ${t.fat} g`)}
          ${stat('Water', `${t.waterL} L`, `Fibre ${t.fibre} g+`)}
        </div>
        <div class="macro-bar" role="img" aria-label="Protein ${pct.p}%, carbs ${pct.c}%, fat ${pct.f}%">
          <span class="seg protein" style="width:${pct.p}%"></span><span class="seg carbs" style="width:${pct.c}%"></span><span class="seg fat" style="width:${pct.f}%"></span>
        </div>
        <ul class="legend">
          <li><i class="dot protein"></i>Protein ${pct.p}%</li><li><i class="dot carbs"></i>Carbs ${pct.c}%</li><li><i class="dot fat"></i>Fat ${pct.f}%</li>
        </ul>

        <div class="tabs" role="tablist">
          ${plan.days.map((d, i) => `<button type="button" role="tab" id="tab-${i}" aria-controls="day-${i}" aria-selected="${i === activeDay}" data-day="${i}">${d.day.slice(0, 3)}</button>`).join('')}
        </div>
        ${plan.days.map((d, di) => `<div class="day-panel${di === activeDay ? ' active' : ''}" id="day-${di}" role="tabpanel" aria-labelledby="tab-${di}">
          <ol class="meals">${d.meals.map((e, mi) => mealRow(e, di, mi)).join('')}</ol>
          <div class="day-total">Day total: <strong>${d.totals.kcal} kcal</strong> (target ${t.calories}) · Protein ${d.totals.p} g · Carbs ${d.totals.c} g · Fat ${d.totals.f} g</div>
        </div>`).join('')}

        <div class="tips">
          <h3>Guidelines</h3>
          <ul>${guidelines(t).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
      </div>`;
    renderPrint();
  }

  // ── A4 print sheet ───────────────────────────────────────────────
  function renderPrint() {
    const t = plan.targets;
    const pct = macroPct(t);
    const r = restrictions();
    const cell = (label, value) => `<th>${label}</th><td>${value ? esc(value) : '&nbsp;'}</td>`;
    // Page footer lives in the @page margin so it repeats on every sheet without overlapping content.
    const footer = [BRAND.company, BRAND.website, profile.dietitianPhone].filter(Boolean).join('  ·  ');
    let pageStyle = document.getElementById('ps-page-style');
    if (!pageStyle) {
      pageStyle = document.createElement('style');
      pageStyle.id = 'ps-page-style';
      document.head.appendChild(pageStyle);
    }
    pageStyle.textContent = `@page { @bottom-left { content: ${JSON.stringify(footer)}; font: 7.5pt system-ui, sans-serif; color: #7d6f66; }
      @bottom-right { content: "Page " counter(page) " of " counter(pages); font: 7.5pt system-ui, sans-serif; color: #7d6f66; } }`;

    sheet.innerHTML = `
      <header class="ps-head">
        <img src="${BRAND.logo}" alt="${esc(BRAND.company)}">
        <div class="ps-title">
          <h1>7-Day Diet Chart</h1>
          <div class="ps-plan">${esc(P.PLANS[profile.plan].label)}</div>
          <div class="ps-web">${esc(BRAND.website)}</div>
        </div>
      </header>

      <table class="ps-grid">
        <tr>${cell('Patient name', profile.name)}${cell('Age / Sex', `${profile.age} y / ${profile.sex === 'male' ? 'Male' : 'Female'}`)}${cell('Date', fmtDate(profile.date))}</tr>
        <tr>${cell('Patient ID', profile.patientId)}${cell('Mobile', profile.phone)}${cell('Next review', fmtDate(profile.reviewDate))}</tr>
        <tr>${cell('Height', `${profile.heightCm} cm`)}${cell('Weight', `${profile.weightKg} kg`)}${cell('BMI', `${t.bmi} (${t.bmiCategory})`)}</tr>
        <tr>${cell('Food type', P.DIETS[profile.diet])}${cell('Ideal weight', `${t.idealWeight[0]}–${t.idealWeight[1]} kg`)}${cell('Goal', P.GOALS[t.goal].label)}</tr>
        <tr><th>Conditions / allergies</th><td colspan="5">${r.length ? esc(r.join(', ')) : 'None reported'}</td></tr>
        ${profile.notes ? `<tr><th>Medical notes</th><td colspan="5">${esc(profile.notes)}</td></tr>` : ''}
      </table>

      <div class="ps-targets">
        <div><b>${t.calories}</b> kcal/day</div>
        <div><b>${t.protein} g</b> protein (${pct.p}%)</div>
        <div><b>${t.carbs} g</b> carbs (${pct.c}%)</div>
        <div><b>${t.fat} g</b> fat (${pct.f}%)</div>
        <div><b>${t.waterL} L</b> water</div>
        <div><b>${t.fibre} g+</b> fibre</div>
      </div>

      ${plan.days.map((d, di) => `
        <table class="ps-day">
          <caption>Day ${di + 1} · ${d.day}</caption>
          <thead><tr><th class="c-time">Time</th><th class="c-meal">Meal</th><th>Menu &amp; quantity</th><th class="c-kcal">kcal</th></tr></thead>
          <tbody>
            ${d.meals.map((e) => `<tr>
              <td class="c-time">${e.time}</td>
              <td class="c-meal">${e.label}</td>
              <td>${e.meal ? e.meal.items.map((i) => `${esc(i.name)} – <b>${esc(i.text)}</b>`).join('; ') : '<i>Plan with dietitian</i>'}</td>
              <td class="c-kcal">${e.meal ? e.meal.kcal : ''}</td>
            </tr>`).join('')}
          </tbody>
          <tfoot><tr><td colspan="3">Total · Protein ${d.totals.p} g · Carbs ${d.totals.c} g · Fat ${d.totals.f} g</td><td class="c-kcal">${d.totals.kcal}</td></tr></tfoot>
        </table>`).join('')}

      <div class="ps-notes">
        <div>
          <h3>Guidelines</h3>
          <ul>${guidelines(t).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
        <div>
          <h3>Foods to limit / avoid</h3>
          <ul>${P.avoidList(profile).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
      </div>

      <div class="ps-sign">
        <div class="ps-disclaimer">Quantities are cooked portions (1 katori ≈ 150 ml, 1 cup ≈ 200 ml). Nutrition values are approximate. Follow your doctor's advice for medicines and medical conditions.</div>
        <div class="ps-signature">
          <div class="line"></div>
          <div><b>${esc(profile.dietitian) || 'Dietitian'}</b></div>
          ${profile.qualification ? `<div>${esc(profile.qualification)}</div>` : ''}
          <div>${esc(BRAND.company)}</div>
        </div>
      </div>`;
  }

  function pdfTitle() {
    const slug = (s) => s.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return ['Hindivine-Diet-Chart', slug(profile.name), profile.date].filter(Boolean).join('_');
  }

  function printChart() {
    const title = pdfTitle();
    if (window.AndroidBridge) {
      window.AndroidBridge.print(title);
      return;
    }
    const prev = document.title;
    document.title = title; // becomes the default PDF file name
    window.addEventListener('afterprint', () => { document.title = prev; }, { once: true });
    window.print();
  }

  function toCsv() {
    const rows = [['Day', 'Time', 'Meal', 'Dish', 'Items', 'kcal', 'Protein (g)', 'Carbs (g)', 'Fat (g)']];
    plan.days.forEach((d) => d.meals.forEach((e) => {
      const m = e.meal;
      rows.push([d.day, e.time, e.label, m ? m.name : '', m ? m.items.map((i) => `${i.name} (${i.text})`).join('; ') : '', m ? m.kcal : '', m ? m.p : '', m ? m.c : '', m ? m.f : '']);
    }));
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const fileName = pdfTitle() + '.csv';
    if (window.AndroidBridge) {
      window.AndroidBridge.saveFile(fileName, 'text/csv', '﻿' + csv);
      return;
    }
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function generate(seed) {
    plan = P.generatePlan(window.MEALS, profile, seed);
    render();
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* storage unavailable */ }
  }
  function load(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const p = readForm();
    const err = validate(p);
    errorEl.hidden = !err;
    errorEl.textContent = err;
    if (err) return;
    profile = p;
    const dietitian = {};
    DIETITIAN_FIELDS.forEach((k) => { dietitian[k] = p[k]; });
    save(DIETITIAN_KEY, dietitian);
    save(PATIENT_KEY, p);
    activeDay = 0;
    generate(Math.floor(Math.random() * 1e9));
    if (window.matchMedia('(max-width: 900px)').matches) result.scrollIntoView({ behavior: 'smooth' });
  });

  result.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.day) {
      activeDay = Number(btn.dataset.day);
      result.querySelectorAll('[role="tab"]').forEach((t) => t.setAttribute('aria-selected', t === btn));
      result.querySelectorAll('.day-panel').forEach((p, i) => p.classList.toggle('active', i === activeDay));
    } else if (btn.dataset.swap) {
      const [di, mi] = btn.dataset.swap.split(':').map(Number);
      if (P.swapMeal(window.MEALS, profile, plan, di, mi)) render();
      else btn.textContent = 'No alternative';
    } else if (btn.id === 'regen') {
      generate(Math.floor(Math.random() * 1e9));
    } else if (btn.id === 'csv') {
      toCsv();
    } else if (btn.id === 'print') {
      printChart();
    }
  });

  const savedPatient = load(PATIENT_KEY);
  if (savedPatient && P.PLANS[savedPatient.plan]) writeForm(savedPatient);
  const savedDietitian = load(DIETITIAN_KEY);
  if (savedDietitian) writeForm(savedDietitian);
  setDefaultDates();
})();
