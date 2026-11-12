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
    ideal: 'The weight range that gives a normal BMI for this height.',
    fat: 'The share of body weight that is fat. The normal range depends on age and sex.',
    fatMass: 'Weight of body fat: weight × body fat %.',
    lean: 'Everything except fat: muscle, bone, water and organs.',
    water: 'The share of body weight that is water. It changes with meals, exercise and time of day.',
    muscle: 'The share of body weight that is muscle.',
    bone: 'Estimated weight of bone mineral.',
    visceral: 'Fat around the organs in the abdomen. Lower is better.',
    bmr: 'Basal Metabolic Rate: energy the body uses at complete rest in one day.',
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

  function status(value, range) {
    if (value < range[0]) return ['Low', 'low'];
    if (value > range[1]) return ['High', 'high'];
    return ['Normal', 'ok'];
  }

  /**
   * @param reading { weightKg, fatPct, waterPct, musclePct, boneKg, bmrKcal, ... } from the scale or typed in
   * @param person  { age, sex ('male' | 'female' | 'other' | ''), heightCm }
   * @returns rows: { key, label, value, unit, range, status, level, calculated }
   */
  function buildRows(reading, person) {
    const rows = [];
    const w = num(reading.weightKg);
    const h = num(person.heightCm);
    const age = num(person.age);
    const sex = person.sex === 'male' || person.sex === 'female' ? person.sex : '';
    // bar: { min, max, cuts, labels } draws the coloured range bar; num is the value's position on it.
    const add = (key, label, value, unit, range, st, calculated, bar) => rows.push({
      key, label, value, unit, range: range || '', status: st ? st[0] : '', level: st ? st[1] : '', calculated: !!calculated,
      bar: bar || null, info: INFO[key] || '',
    });
    const band = (r, below, above) => ({ min: r[0] - below, max: r[1] + above, cuts: [r[0], r[1]], labels: ['Low', 'Normal', 'High'] });

    if (w != null) add('weight', 'Weight', r1(w), 'kg');
    if (w != null && h) {
      const bmi = r1(w / Math.pow(h / 100, 2));
      add('bmi', 'BMI', bmi, 'kg/m²', '18.5 – 22.9', bmiStatus(bmi), true,
        { min: 14, max: 32, cuts: [18.5, 23, 25], labels: ['Underweight', 'Normal', 'Overweight', 'Obese'] });
      const m2 = Math.pow(h / 100, 2);
      add('ideal', 'Ideal weight', r1(18.5 * m2) + ' – ' + r1(22.9 * m2), 'kg', '', null, true);
    }
    const fat = num(reading.fatPct);
    if (fat != null) {
      const fr = fatRange(sex || 'female', age);
      add('fat', 'Body fat', r1(fat), '%', sex ? fr[0] + ' – ' + fr[1] : '', sex ? status(fat, fr) : null, false, sex ? band(fr, 8, 12) : null);
      if (w != null) {
        add('fatMass', 'Fat mass', r1(w * fat / 100), 'kg', '', null, true);
        add('lean', 'Lean body mass', r1(w * (1 - fat / 100)), 'kg', '', null, true);
      }
    }
    const water = num(reading.waterPct) != null ? num(reading.waterPct)
      : (num(reading.waterKg) != null && w ? r1(num(reading.waterKg) / w * 100) : null);
    if (water != null) {
      const wr = waterRange(sex || 'female');
      add('water', 'Body water', r1(water), '%', sex ? wr[0] + ' – ' + wr[1] : '', sex ? status(water, wr) : null, false, sex ? band(wr, 12, 12) : null);
    }
    const muscle = num(reading.musclePct) != null ? num(reading.musclePct)
      : (num(reading.muscleKg) != null && w ? r1(num(reading.muscleKg) / w * 100) : null);
    if (muscle != null) {
      const mr = muscleRange(sex || 'female');
      add('muscle', 'Muscle', r1(muscle), '%', sex ? mr[0] + ' – ' + mr[1] : '', sex ? status(muscle, mr) : null, false, sex ? band(mr, 12, 12) : null);
    }
    const bone = num(reading.boneKg);
    if (bone != null) add('bone', 'Bone mass', r1(bone), 'kg');
    const visceral = num(reading.visceral);
    if (visceral != null) add('visceral', 'Visceral fat', r1(visceral), '', '1 – 9', status(visceral, [1, 9]), false,
      { min: 1, max: 20, cuts: [9.5, 14.5], labels: ['Normal', 'High', 'Very high'] });
    let bmr = num(reading.bmrKcal);
    let bmrCalc = false;
    if (bmr == null && w != null && h && age && sex) {
      bmr = Math.round(10 * w + 6.25 * h - 5 * age + (sex === 'male' ? 5 : -161)); // Mifflin-St Jeor
      bmrCalc = true;
    }
    if (bmr != null) add('bmr', 'BMR', Math.round(bmr), 'kcal/day', '', null, bmrCalc);
    return rows;
  }

  const api = { buildRows, heightToCm, bmiStatus, fatRange };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ScaleMetrics = api;
})(typeof self !== 'undefined' ? self : this);
