/* DOM wiring for the diet chart generator. */
(function () {
  const P = window.Planner;
  const form = document.getElementById('profile-form');
  const result = document.getElementById('result');
  const errorEl = document.getElementById('form-error');
  const STORE_KEY = 'dietChart.profile';

  let profile = null;
  let plan = null;
  let activeDay = 0;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function fillSelect(id, entries, selected) {
    document.getElementById(id).innerHTML = Object.entries(entries)
      .map(([k, v]) => `<option value="${k}"${k === selected ? ' selected' : ''}>${esc(v.label)}</option>`)
      .join('');
  }
  fillSelect('activity', P.ACTIVITY, 'light');
  fillSelect('goal', P.GOALS, 'lose');

  function readForm() {
    const fd = new FormData(form);
    return {
      clinic: (fd.get('clinic') || '').trim(),
      name: (fd.get('name') || '').trim(),
      age: Number(fd.get('age')),
      sex: fd.get('sex'),
      heightCm: Number(fd.get('heightCm')),
      weightKg: Number(fd.get('weightKg')),
      activity: fd.get('activity'),
      goal: fd.get('goal'),
      diet: fd.get('diet'),
      cuisine: fd.get('cuisine'),
      meals: Number(fd.get('meals')),
      earlyDrink: fd.get('earlyDrink') === 'on',
      dislikes: (fd.get('dislikes') || '').split(',').map((s) => s.trim()).filter(Boolean),
      allergies: fd.getAll('allergies'),
      conditions: fd.getAll('conditions'),
    };
  }

  function writeForm(p) {
    Object.entries(p).forEach(([key, val]) => {
      if (Array.isArray(val) && key !== 'dislikes') {
        form.querySelectorAll(`[name="${key}"]`).forEach((el) => { el.checked = val.includes(el.value); });
      } else {
        const el = form.elements[key];
        if (!el) return;
        if (el.type === 'checkbox') el.checked = !!val;
        else el.value = Array.isArray(val) ? val.join(', ') : val;
      }
    });
  }

  function validate(p) {
    if (!(p.age >= 14 && p.age <= 90)) return 'Age must be between 14 and 90.';
    if (!(p.heightCm >= 120 && p.heightCm <= 230)) return 'Height must be between 120 and 230 cm.';
    if (!(p.weightKg >= 30 && p.weightKg <= 250)) return 'Weight must be between 30 and 250 kg.';
    return '';
  }

  function stat(label, value, sub) {
    return `<div class="stat"><span class="stat-label">${label}</span><span class="stat-value">${value}</span>${sub ? `<span class="stat-sub">${sub}</span>` : ''}</div>`;
  }

  function macroBar(t) {
    const kp = t.protein * 4, kc = t.carbs * 4, kf = t.fat * 9, tot = kp + kc + kf;
    const pct = (x) => Math.round((x / tot) * 100);
    return `
      <div class="macro-bar" role="img" aria-label="Protein ${pct(kp)}%, carbs ${pct(kc)}%, fat ${pct(kf)}%">
        <span class="seg protein" style="width:${pct(kp)}%"></span>
        <span class="seg carbs" style="width:${pct(kc)}%"></span>
        <span class="seg fat" style="width:${pct(kf)}%"></span>
      </div>
      <ul class="legend">
        <li><i class="dot protein"></i>Protein ${t.protein} g · ${pct(kp)}%</li>
        <li><i class="dot carbs"></i>Carbs ${t.carbs} g · ${pct(kc)}%</li>
        <li><i class="dot fat"></i>Fat ${t.fat} g · ${pct(kf)}%</li>
      </ul>`;
  }

  function mealRow(entry, di, mi) {
    const m = entry.meal;
    if (!m) {
      return `<li class="meal missing"><div class="meal-time"><strong>${entry.label}</strong><span>${entry.time}</span></div>
        <div class="meal-body"><em>No option fits these restrictions — please plan this meal with a dietitian.</em></div></li>`;
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
        <button type="button" class="btn small ghost no-print" data-swap="${di}:${mi}" title="Swap for another option">Swap</button>
      </div>
    </li>`;
  }

  function dayPanel(d, di) {
    return `<div class="day-panel${di === activeDay ? ' active' : ''}" id="day-${di}" role="tabpanel" aria-labelledby="tab-${di}">
      <h3 class="day-title">${d.day}</h3>
      <ol class="meals">${d.meals.map((e, mi) => mealRow(e, di, mi)).join('')}</ol>
      <div class="day-total">Day total: <strong>${d.totals.kcal} kcal</strong> (target ${plan.targets.calories}) · Protein ${d.totals.p} g · Carbs ${d.totals.c} g · Fat ${d.totals.f} g</div>
    </div>`;
  }

  function guidelines(t) {
    const list = P.tips(profile, t);
    const avgProtein = Math.round(plan.days.reduce((s, d) => s + d.totals.p, 0) / plan.days.length);
    if (avgProtein < t.protein * 0.85) {
      list.push(`These meals average ${avgProtein} g protein a day against a ${t.protein} g target. Close the gap with an extra serving of paneer, curd, dal, sprouts, soya, eggs or lean meat as the diet allows.`);
    }
    return list;
  }

  function render() {
    const t = plan.targets;
    const today = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    const dietLabel = form.elements.diet.selectedOptions[0].text;
    const restrictions = [
      ...profile.allergies.map((a) => form.querySelector(`[name="allergies"][value="${a}"]`).parentElement.textContent.trim() + '-free'),
      ...profile.conditions.map((c) => form.querySelector(`[name="conditions"][value="${c}"]`).parentElement.textContent.trim()),
    ];

    result.innerHTML = `
      <div class="card chart">
        <div class="chart-head">
          <div>
            ${profile.clinic ? `<div class="clinic">${esc(profile.clinic)}</div>` : ''}
            <h2>${profile.name ? esc(profile.name) + '’s ' : ''}7-Day Diet Chart</h2>
            <p class="meta">${profile.age} y · ${profile.sex === 'male' ? 'Male' : 'Female'} · ${profile.heightCm} cm · ${profile.weightKg} kg ·
              ${esc(P.GOALS[profile.goal].label)} · ${esc(dietLabel)}${restrictions.length ? ' · ' + esc(restrictions.join(', ')) : ''} · ${today}</p>
          </div>
          <div class="actions no-print">
            <button type="button" class="btn" id="regen">New plan</button>
            <button type="button" class="btn" id="csv">Download CSV</button>
            <button type="button" class="btn primary" id="print">Print / PDF</button>
          </div>
        </div>

        <div class="stats">
          ${stat('Daily target', `${t.calories} kcal`, `Maintenance ${t.tdee} kcal`)}
          ${stat('BMI', t.bmi, t.bmiCategory)}
          ${stat('BMR', `${t.bmr} kcal`, 'At rest')}
          ${stat('Water', `${t.waterL} L`, `Fibre ${t.fibre} g+`)}
        </div>
        ${macroBar(t)}

        <div class="tabs no-print" role="tablist">
          ${plan.days.map((d, i) => `<button type="button" role="tab" id="tab-${i}" aria-controls="day-${i}" aria-selected="${i === activeDay}" data-day="${i}">${d.day.slice(0, 3)}</button>`).join('')}
        </div>
        ${plan.days.map(dayPanel).join('')}

        <div class="tips">
          <h3>Guidelines</h3>
          <ul>${guidelines(t).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
      </div>`;
  }

  function generate(seed) {
    plan = P.generatePlan(window.MEALS, profile, seed);
    plan.seed = seed;
    render();
  }

  function toCsv() {
    const rows = [['Day', 'Time', 'Meal', 'Dish', 'Items', 'kcal', 'Protein (g)', 'Carbs (g)', 'Fat (g)']];
    plan.days.forEach((d) => d.meals.forEach((e) => {
      const m = e.meal;
      rows.push([d.day, e.time, e.label, m ? m.name : '', m ? m.items.map((i) => `${i.name} (${i.text})`).join('; ') : '', m ? m.kcal : '', m ? m.p : '', m ? m.c : '', m ? m.f : '']);
    }));
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const fileName = `diet-chart${profile.name ? '-' + profile.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''}.csv`;
    if (window.AndroidBridge) {
      window.AndroidBridge.saveFile(fileName, 'text/csv', '\ufeff' + csv);
      return;
    }
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const p = readForm();
    const err = validate(p);
    errorEl.hidden = !err;
    errorEl.textContent = err;
    if (err) return;
    profile = p;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (_) { /* storage unavailable */ }
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
      if (window.AndroidBridge) window.AndroidBridge.print(profile.name ? `Diet Chart - ${profile.name}` : 'Diet Chart');
      else window.print();
    }
  });

  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved) writeForm(saved);
  } catch (_) { /* ignore bad or unavailable storage */ }
})();
