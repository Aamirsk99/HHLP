/*
 * Turns a scale reading plus the patient's age, sex and height into the rows shown
 * in the app and on the report. Values the scale did not send are left out, except
 * BMI and BMR, which are calculated from weight, height, age and sex.
 * No DOM access: works in the browser and in Node.
 */
(function (root) {
  const r1 = (n) => Math.round(n * 10) / 10;
  const num = (v) => { const n = Number(v); return v === '' || v == null || !isFinite(n) ? null : n; };

  /** Height typed as cm ("170"), or feet and inches ("5.7", "5'7", "5 ft 7"). */
  function heightToCm(text) {
    const t = String(text == null ? '' : text).trim().toLowerCase();
    if (!t) return null;
    const ft = t.match(/^(\d)\s*(?:'|ft|feet|\.)\s*(\d{1,2})?\s*(?:"|in|inch|inches)?$/);
    if (ft) return Math.round((Number(ft[1]) * 12 + Number(ft[2] || 0)) * 2.54);
    const n = parseFloat(t);
    if (!isFinite(n) || n <= 0) return null;
    return n < 9 ? Math.round(n * 30.48) : Math.round(n);
  }

  const INFO = {
    weight: 'Body weight measured by the machine.',
    bmi: 'Body Mass Index: weight divided by height squared. The ranges shown are the Asian-Indian cut-offs.',
    fat: 'The share of body weight that is fat. The normal range depends on age and sex.',
    water: 'The share of body weight that is water. It changes with meals, exercise and time of day.',
    skeletal: 'Muscle attached to the bones, the muscle that grows with exercise.',
    bonePct: 'Bone mineral as a share of body weight.',
    bone: 'Weight of the minerals in the body, mostly in bone.',
    protein: 'Protein as a share of body weight. Low protein usually goes with low muscle.',
    muscle: 'All muscle and soft lean tissue: lean mass without the minerals.',
    visceral: 'Fat around the organs in the abdomen. Lower is better; 10 or more is high. Shown only when measured or typed in.',
    subcut: 'Fat stored under the skin, about nine tenths of all body fat.',
    lean: 'Everything except fat: muscle, bone, water and organs.',
    bodyAge: 'How the body compares with the average person: older when body fat and BMI are above the standard.',
    score: 'One number for overall body composition. It falls as BMI and body fat move away from the standard range.',
    type: 'Body type from BMI and body fat together.',
    bmr: 'Basal Metabolic Rate: energy the body uses at complete rest in one day.',
    amr: 'Active Metabolic Rate: energy used in a day with light activity (BMR × 1.3).',
    heart: 'Heart rate measured by the machine while standing on it.',
    impedance: 'Electrical resistance of the body measured through the feet. Body fat and water are worked out from it.',
    standard: 'The weight that gives a BMI of 22 for this height.',
    weightControl: 'Weight to lose (−) or gain (+) to reach the standard weight.',
    fatControl: 'Fat to lose (−) or gain (+) to reach the standard weight with a standard body fat.',
    muscleControl: 'Muscle to gain (+) or lose (−) alongside the fat change.',
  };

  function bmiStatus(bmi) {
    // Asian-Indian cut-offs.
    if (bmi < 18.5) return ['Underweight', 'low'];
    if (bmi < 23) return ['Normal', 'ok'];
    if (bmi < 25) return ['Overweight', 'high'];
    return ['Obese', 'vhigh'];
  }

  function fatRange(sex, age) {
    const a = age || 30;
    if (sex === 'male') return a < 40 ? [11, 22] : a < 60 ? [12, 23] : [14, 25];
    return a < 40 ? [21, 33] : a < 60 ? [22, 34] : [23, 36];
  }
  const waterRange = (sex) => (sex === 'male' ? [50, 65] : [45, 60]);
  const muscleRange = (sex) => (sex === 'male' ? [40, 60] : [30, 50]);

  /** Fat % and water % from foot-to-foot impedance (ohms). Null when inputs are missing or implausible. */
  function estimateFromImpedance(w, h, sex, ohm) {
    if (!w || !h || !sex || !ohm || ohm < 150 || ohm > 1500) return null;
    const idx = h * h / ohm;
    const ffm = sex === 'male' ? -10.68 + 0.65 * idx + 0.26 * w + 0.02 * ohm : -9.53 + 0.69 * idx + 0.17 * w + 0.02 * ohm;
    const tbw = sex === 'male' ? 1.2 + 0.45 * idx + 0.18 * w : 3.75 + 0.45 * idx + 0.11 * w;
    const fatPct = (w - ffm) / w * 100;
    const waterPct = tbw / w * 100;
    if (!(fatPct >= 3 && fatPct <= 65) || !(waterPct >= 25 && waterPct <= 80)) return null;
    return { fatPct: r1(fatPct), waterPct: r1(waterPct) };
  }

  function status(value, range) {
    if (value < range[0]) return ['Low', 'low'];
    if (value > range[1]) return ['High', 'high'];
    return ['Standard', 'ok'];
  }
  /** For values where more is better (muscle, protein). */
  function statusUp(value, range) {
    if (value < range[0]) return ['Low', 'low'];
    if (value > range[1]) return ['Excellent', 'ok'];
    return ['Standard', 'ok'];
  }

  function somatotype(bmi, fat, fr) {
    const fatLevel = fat < fr[0] ? 0 : fat > fr[1] ? 2 : 1;
    if (bmi < 18.5) return fatLevel === 2 ? 'Thin, high fat' : 'Lean';
    if (bmi < 23) return fatLevel === 0 ? 'Lean muscular' : fatLevel === 1 ? 'Standard' : 'Hidden obesity';
    if (bmi < 25) return fatLevel === 0 ? 'Muscular' : fatLevel === 1 ? 'Slightly overweight' : 'Overweight';
    return fatLevel === 0 ? 'Very muscular' : fatLevel === 1 ? 'Overweight' : 'Obesity';
  }

  /**
   * @param reading { weightKg, fatPct, waterPct, musclePct, boneKg | bonePct, bmrKcal, impedance, ... } from the scale or typed in
   * @param person  { age, sex ('male' | 'female' | 'other' | ''), heightCm }
   * @returns rows: { key, group ('comp' | 'manage'), label, value, unit, range, status, level, calculated, estimated, bar, info }
   *
   * What comes from where:
   *   weight, impedance, heart rate — always the machine.
   *   fat, water, muscle, bone, BMR — the machine when it sends them; otherwise calculated.
   *   everything else — calculated by the app from those values plus height, age and sex.
   */
  function buildRows(reading, person) {
    const rows = [];
    const w = num(reading.weightKg);
    const h = num(person.heightCm);
    const age = num(person.age);
    const sex = person.sex === 'male' || person.sex === 'female' ? person.sex : '';
    let group = 'comp';
    // bar: { min, max, cuts, labels } draws the coloured range bar.
    const add = (key, label, value, unit, range, st, calculated, bar) => rows.push({
      key, group, label, value, unit, range: range || '', status: st ? st[0] : '', level: st ? st[1] : '', calculated: !!calculated,
      bar: bar || null, info: INFO[key] || '',
    });
    const band = (r, below, above, labels) => ({ min: r[0] - below, max: r[1] + above, cuts: [r[0], r[1]], labels: labels || ['Low', 'Standard', 'High'] });
    const UP = ['Low', 'Standard', 'Excellent'];
    const text = (r) => r[0] + ' – ' + r[1];
    if (w == null) return rows;

    add('weight', 'Weight', r1(w), 'kg');
    const m2 = h ? Math.pow(h / 100, 2) : null;
    const bmi = m2 ? r1(w / m2) : null;
    if (bmi != null) {
      add('bmi', 'BMI', bmi, 'kg/m²', '18.5 – 22.9', bmiStatus(bmi), true,
        { min: 14, max: 32, cuts: [18.5, 23, 25], labels: ['Underweight', 'Normal', 'Overweight', 'Obese'] });
    }

    // Scales that send only weight + impedance: estimate fat and water with the published
    // BIA equations of Sun et al. (Am J Clin Nutr 2003). Marked as estimated everywhere.
    const est = num(reading.fatPct) == null ? estimateFromImpedance(w, h, sex, num(reading.impedance)) : null;
    const fat = est ? est.fatPct : num(reading.fatPct);
    const fr = fatRange(sex || 'female', age);
    const fatMass = fat != null ? w * fat / 100 : null;
    const lean = fat != null ? w - fatMass : null;
    const pct = (kg) => r1(kg / w * 100);

    if (fat != null) {
      add('fat', est ? 'Body fat (estimated)' : 'Body fat', r1(fat), '%', sex ? text(fr) : '', sex ? status(fat, fr) : null, false, sex ? band(fr, 8, 12) : null);

      // Lean mass is water + protein + minerals in near-constant shares (73.6 %, 20.3 %, 6.1 %).
      const ownWater = num(reading.waterPct) != null ? num(reading.waterPct) : (num(reading.waterKg) != null ? pct(num(reading.waterKg)) : null);
      const water = est ? est.waterPct : ownWater != null ? ownWater : pct(lean * 0.736);
      const wr = waterRange(sex || 'female');
      add('water', est ? 'Body water (estimated)' : 'Body water', r1(water), '%', sex ? text(wr) : '', sex ? status(water, wr) : null, !est && ownWater == null, sex ? band(wr, 12, 12) : null);

      const mineralKg = num(reading.boneKg) != null ? num(reading.boneKg) : num(reading.bonePct) != null ? num(reading.bonePct) * w / 100 : null;
      const mineral = mineralKg != null ? mineralKg : lean * 0.061;
      const sk = sex === 'male' ? [33, 39] : [24, 31];
      const ownMuscle = num(reading.musclePct) != null ? num(reading.musclePct) : (num(reading.muscleKg) != null ? pct(num(reading.muscleKg)) : null);
      // A machine value under 62 % is skeletal muscle; above that it is total muscle.
      const ownSkeletal = num(reading.skeletalPct) != null ? num(reading.skeletalPct) : ownMuscle != null && ownMuscle < 62 ? ownMuscle : null;
      const skeletal = ownSkeletal != null ? ownSkeletal : pct(lean * (sex === 'male' ? 0.48 : 0.43));
      add('skeletal', 'Skeletal muscle', r1(skeletal), '%', sex ? text(sk) : '', sex ? statusUp(skeletal, sk) : null, ownSkeletal == null, sex ? band(sk, 10, 10, UP) : null);
      add('bonePct', 'Bone', pct(mineral), '%', '', null, mineralKg == null);
      add('bone', 'Inorganic salt', r1(mineral), 'kg', '', null, mineralKg == null);
      const pr = sex === 'male' ? [16, 20] : [14, 18];
      const protein = num(reading.proteinPct) != null ? num(reading.proteinPct) : pct(lean * 0.203);
      add('protein', 'Protein', r1(protein), '%', text(pr), statusUp(protein, pr), num(reading.proteinPct) == null, band(pr, 6, 6, UP));
      const ownTotal = ownMuscle != null && ownMuscle >= 62 ? ownMuscle : null;
      const muscle = ownTotal != null ? ownTotal : pct(lean - mineral);
      const mr = sex === 'male' ? [67, 80] : [60, 72];
      add('muscle', 'Muscle', r1(muscle), '%', sex ? text(mr) : '', sex ? statusUp(muscle, mr) : null, ownTotal == null, sex ? band(mr, 12, 12, UP) : null);
    }

    const ownVisceral = num(reading.visceral);
    const visceral = ownVisceral; // only when measured or typed in: there is no reliable way to calculate it
    if (visceral != null) {
      add('visceral', 'Visceral fat index', r1(visceral), '', '1 – 9', status(visceral, [1, 9]), ownVisceral == null,
        { min: 1, max: 20, cuts: [9.5, 14.5], labels: ['Standard', 'High', 'Very high'] });
    }
    if (fat != null) {
      add('subcut', 'Subcutaneous fat', num(reading.subcutKg) != null ? r1(num(reading.subcutKg)) : r1(fatMass * 0.9), 'kg', '', null, num(reading.subcutKg) == null);
      add('lean', 'Lean body mass', r1(lean), 'kg', '', null, true);
      if (bmi != null && age && sex) {
        const mid = (fr[0] + fr[1]) / 2;
        const ownAge = num(reading.bodyAge);
        const bodyAge = ownAge != null ? Math.round(ownAge) : Math.round(Math.max(age - 10, Math.min(age + 10, age + 0.5 * (fat - mid) + 0.6 * (bmi - 21.7))));
        add('bodyAge', 'Body age', ownAge != null ? bodyAge : Math.max(18, bodyAge), 'years', '', bodyAge <= age ? ['Good', 'ok'] : null, ownAge == null);
        const penalty = 3 * Math.max(0, bmi - 23, 18.5 - bmi) + 2 * Math.max(0, fat - fr[1], fr[0] - fat);
        const ownScore = num(reading.bodyScore);
        const score = ownScore != null ? Math.round(ownScore) : Math.round(Math.max(30, 100 - penalty));
        add('score', 'Body score', score, '/ 100', '', score >= 90 ? ['Excellent', 'ok'] : score >= 75 ? ['Standard', 'ok'] : score >= 60 ? ['Low', 'high'] : ['Poor', 'vhigh'], ownScore == null);
        add('type', 'Somatotype', somatotype(bmi, fat, fr), '', '', null, true);
      }
    }

    let bmr = num(reading.bmrKcal);
    let bmrCalc = false;
    if (bmr == null && h && age && sex) {
      bmr = Math.round(10 * w + 6.25 * h - 5 * age + (sex === 'male' ? 5 : -161)); // Mifflin-St Jeor
      bmrCalc = true;
    }
    if (bmr != null) {
      add('bmr', 'BMR', Math.round(bmr), 'kcal', '', null, bmrCalc);
      add('amr', 'AMR', num(reading.amrKcal) != null ? Math.round(num(reading.amrKcal)) : Math.round(bmr * 1.3), 'kcal', '', null, num(reading.amrKcal) == null);
    }
    const hr = num(reading.heartRate);
    if (hr != null) add('heart', 'Heart rate', Math.round(hr), 'bpm', '60 – 100', status(hr, [60, 100]));
    const imp = num(reading.impedance);
    if (imp != null) add('impedance', 'Impedance', Math.round(imp), 'Ω');

    // ── Weight management ──
    group = 'manage';
    if (m2) {
      const standard = 22 * m2;
      const signed = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(r1(n)).toFixed(1);
      add('standard', 'Standard weight', r1(standard), 'kg', '', null, true);
      add('weightControl', 'Weight control', signed(standard - w), 'kg', '', null, true);
      if (fat != null && sex) {
        const fatControl = standard * (fr[0] + fr[1]) / 200 - fatMass;
        add('fatControl', 'Fat control', signed(fatControl), 'kg', '', null, true);
        add('muscleControl', 'Muscle control', signed((standard - w) - fatControl), 'kg', '', null, true);
      }
    }
    if (est) rows.forEach((r) => { if ((r.calculated || r.key === 'fat' || r.key === 'water') && r.key !== 'weight' && r.key !== 'bmi' && r.key !== 'impedance' && r.key !== 'heart' && r.key !== 'standard' && r.key !== 'weightControl' && r.key !== 'bmr' && r.key !== 'amr' && r.key !== 'visceral' && r.key !== 'standard') r.estimated = true; });
    return rows;
  }

  const api = { buildRows, heightToCm, bmiStatus, fatRange, estimateFromImpedance };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ScaleMetrics = api;
})(typeof self !== 'undefined' ? self : this);
