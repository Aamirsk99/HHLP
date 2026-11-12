/* Hindivine Scale: screens, Bluetooth flow, saved readings and the A4 report. */
(function () {
  const P = window.ScaleProtocol;
  const M = window.ScaleMetrics;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const DEFAULT_TESTS = ['CBC', 'LFT', 'KFT', 'RBS', 'HbA1c', 'Vitamin B12', 'Vitamin D3', 'Thyroid Profile', 'Iron Study',
    'Lipid Profile', 'Serum Amylase', 'Serum Lipase', 'Ultrasound Whole Abdomen', 'Retina Examination for Retinopathy'];
  const KEYS = { readings: 'hindivine.scale.readings.v1', tests: 'hindivine.scale.tests.v1', device: 'hindivine.scale.device.v1', opts: 'hindivine.scale.opts.v1' };

  const load = (k, fallback) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fallback : v; } catch (_) { return fallback; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (_) { return false; } };

  // ── State ────────────────────────────────────────────────────
  const form = $('patient');
  let sex = '';
  let reading = null;      // values from the machine or typed in
  let measuredAt = null;
  let savedId = null;
  let tests = load(KEYS.tests, null) || DEFAULT_TESTS.map((name) => ({ name, on: true }));
  const opts = load(KEYS.opts, { hideUnticked: false });

  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const niceDate = (iso) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : ''; };

  function patient() {
    const heightText = form.height.value.trim();
    return {
      date: form.date.value, name: form.name.value.trim(), age: form.age.value.trim(),
      heightText, heightCm: M.heightToCm(heightText), sex,
    };
  }

  function toast(text) {
    const t = $('toast');
    t.textContent = text;
    t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { t.hidden = true; }, 3200);
  }

  // ── Screens ──────────────────────────────────────────────────
  const TABS = ['dash', 'history', 'device', 'patient'];
  let current = 'dash';
  function show(screen) {
    current = screen;
    document.querySelectorAll('.screen').forEach((s) => { s.hidden = s.dataset.screen !== screen; });
    const tab = TABS.includes(screen) ? screen : 'dash';
    document.querySelectorAll('#tabs button').forEach((b) => {
      if (b.dataset.tab === tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (screen === 'a4') renderPreview();
    if (screen === 'history') renderHistory();
    if (screen === 'detail') renderDetail();
    window.scrollTo(0, 0);
  }
  $('tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(b.dataset.tab); });
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-back]'); if (b) show(b.dataset.back); });
  window.onAndroidBack = () => {
    if ($('manual-dialog').open) { $('manual-dialog').close(); return true; }
    if (current === 'dash') return false;
    show(current === 'a4' ? 'detail' : 'dash');
    return true;
  };
  $('who').addEventListener('click', () => show('patient'));
  $('more').addEventListener('click', () => show('detail'));
  $('open-a4').addEventListener('click', () => show('a4'));

  // ── Patient form ─────────────────────────────────────────────
  function setSex(value) {
    sex = value;
    document.querySelectorAll('#sex button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === value)));
  }
  function renderWho() {
    const p = patient();
    const bits = [p.age ? p.age + ' y' : '', p.sex ? { male: 'Male', female: 'Female', other: 'Others' }[p.sex] : '', p.heightCm ? p.heightCm + ' cm' : ''].filter(Boolean);
    $('who-name').textContent = p.name || 'Add patient';
    $('who-sub').textContent = bits.length ? bits.join(' · ') : 'Tap to enter details';
    $('avatar').textContent = p.name ? p.name[0].toUpperCase() : '+';
  }
  $('sex').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; setSex(b.dataset.value === sex ? '' : b.dataset.value); renderAll(); });
  form.addEventListener('input', () => {
    const p = patient();
    $('height-hint').textContent = p.heightText && !p.heightCm ? 'Height not understood. Type cm (170) or feet.inches (5.7).'
      : p.heightCm && !/^\d{3}$/.test(p.heightText) ? 'Height: ' + p.heightCm + ' cm' : '';
    renderAll();
  });

  // ── Body data ────────────────────────────────────────────────
  const ICONS = {
    weight: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 8.500h6M12 8.500v3"/></svg>',
    bmi: '<svg viewBox="0 0 24 24"><circle cx="12" cy="6" r="2.500"/><path d="M8 21l1-9h6l1 9M7 13l2-3.500h6l2 3.500"/></svg>',
    fat: '<svg viewBox="0 0 24 24"><path d="M12 3.500c3.500 4.200 5.500 7 5.500 10a5.500 5.500 0 0 1-11 0c0-3 2-5.800 5.500-10z"/></svg>',
  };
  let openTile = '';
  let openItem = '';
  function rows() { return reading ? M.buildRows(reading, patient()) : []; }
  const byKey = (list) => { const o = {}; list.forEach((r) => { o[r.key] = r; }); return o; };
  const whenText = () => (measuredAt ? new Date(measuredAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '');

  /** Coloured range bar with a marker at the value. */
  function barHtml(r) {
    if (!r.bar) return '';
    const b = r.bar;
    const v = Number(r.value);
    const edges = [b.min].concat(b.cuts, [b.max]);
    const pos = Math.max(2, Math.min(98, (v - b.min) / (b.max - b.min) * 100));
    const tones = b.labels.length === 4 ? ['low', 'ok', 'high', 'vhigh'] : b.labels[0] === 'Normal' ? ['ok', 'high', 'vhigh'] : ['low', 'ok', 'high'];
    return `<div class="range">
      <div class="range-mark" style="left:${pos}%"><span>${esc(r.value)}</span></div>
      <div class="range-bar">${b.labels.map((l, i) => `<i class="${tones[i]}" style="flex:${edges[i + 1] - edges[i]}"></i>`).join('')}</div>
      <div class="range-cuts">${b.labels.map((l, i) => `<span style="flex:${edges[i + 1] - edges[i]}">${esc(l)}${i < b.cuts.length ? `<em>${b.cuts[i]}</em>` : ''}</span>`).join('')}</div>
    </div>`;
  }

  function renderDash() {
    const list = rows();
    const k = byKey(list);
    const val = (key) => (k[key] ? k[key].value : '- -');
    $('sum-weight').textContent = val('weight');
    $('sum-bmi').textContent = val('bmi');
    $('sum-fat').textContent = val('fat');
    $('when').textContent = reading ? (reading.sample ? 'SAMPLE — not a real reading' : whenText() + (reading.source ? ' · ' + reading.source : '') + (k.fat && k.fat.estimated ? ' · fat estimated' : '')) : 'No reading yet';
    if (!connected) $('dial-kg').textContent = k.weight ? Number(k.weight.value).toFixed(1) : '- -';
    const tiles = [['weight', 'Weight', 'kg'], ['bmi', 'BMI', ''], ['fat', 'Body Fat', '%']];
    $('tiles').innerHTML = tiles.map(([key, label, unit]) => {
      const r = k[key];
      const status = key === 'weight' && k.bmi ? k.bmi : r;
      return `<button type="button" class="tile${openTile === key ? ' open' : ''}" data-key="${key}" ${r ? '' : 'disabled'}>
        <span class="tile-icon">${ICONS[key]}</span>
        <b>${r ? esc(r.value) : '- -'}</b>
        <small>${label}${unit ? ' (' + unit + ')' : ''}${r && r.estimated ? ' est.' : ''}</small>
        <span class="tag ${status && status.level ? esc(status.level) : 'none'}">${status && status.status ? esc(status.status) : '—'}</span>
      </button>`;
    }).join('');
    const sel = openTile === 'weight' ? k.bmi : k[openTile];
    $('tile-range').hidden = !(sel && sel.bar);
    $('tile-range').innerHTML = sel && sel.bar ? `<p><b>${esc(sel.label)}</b> ${esc(sel.value)} ${esc(sel.unit)}${sel.range ? ' · normal ' + esc(sel.range) : ''}</p>${barHtml(sel)}<p class="hint">${esc(sel.info)}</p>` : '';
    $('more').disabled = $('print').disabled = !list.length;
  }
  $('tiles').addEventListener('click', (e) => {
    const t = e.target.closest('.tile');
    if (!t || t.disabled) return;
    openTile = openTile === t.dataset.key ? '' : t.dataset.key;
    renderDash();
  });

  function renderDetail() {
    const list = rows();
    const k = byKey(list);
    const p = patient();
    const val = (key) => (k[key] ? k[key].value : '- -');
    $('detail-who').textContent = p.name || 'Patient';
    $('d-weight').textContent = val('weight');
    $('d-bmi').textContent = val('bmi');
    $('d-fat').textContent = k.fat ? k.fat.value + '%' : '- -';
    $('d-age').textContent = val('bodyAge');
    $('d-score').textContent = val('score');
    $('d-type').textContent = val('type');
    $('d-arc').style.strokeDashoffset = String(327 * (1 - (k.score ? Number(k.score.value) : 0) / 100));
    const manage = list.filter((r) => r.group === 'manage');
    $('manage-title').hidden = $('manage').hidden = !manage.length;
    $('manage').innerHTML = manage.map((r) => `<div class="plain-row"><span>${esc(r.label)}</span><b>${esc(r.value)}${esc(r.unit)}</b></div>`).join('');
    $('d-when').textContent = whenText();
    $('items').innerHTML = list.filter((r) => r.group === 'comp').map((r) => `
      <div class="item${openItem === r.key ? ' open' : ''}">
        <button type="button" class="item-head" data-key="${esc(r.key)}" aria-expanded="${openItem === r.key}">
          <span class="item-name">${esc(r.label)}${r.calculated && !r.estimated ? '<i>*</i>' : ''}</span>
          <span class="item-value"><b>${esc(r.value)}</b> ${esc(r.unit)}</span>
          <span class="tag ${r.level ? esc(r.level) : 'none'}">${esc(r.status || '—')}</span>
          <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
        </button>
        ${openItem === r.key ? `<div class="item-body">${barHtml(r)}<p>${esc(r.info)}${r.range ? ' Normal range: ' + esc(r.range) + ' ' + esc(r.unit) + '.' : ''}</p></div>` : ''}
      </div>`).join('');
    $('detail-note').textContent = !reading ? '' : (!list.some((r) => r.key === 'fat') ? 'Weight only: the machine sent no body-fat values. ' : '') + (list.some((r) => r.estimated) ? 'Estimated values are worked out by the app from the impedance the machine measured. ' : '') + "* calculated by the app from the machine's values, height, age and sex. For reference only, not a medical diagnosis.";
  }
  $('items').addEventListener('click', (e) => {
    const h = e.target.closest('.item-head');
    if (!h) return;
    openItem = openItem === h.dataset.key ? '' : h.dataset.key;
    renderDetail();
  });

  function renderAll() {
    renderWho();
    renderDash();
    if (current === 'detail') renderDetail();
  }

  function setReading(data, at) {
    reading = Object.assign({}, data);
    measuredAt = at || Date.now();
    savedId = null;
    renderAll();
  }

  // ── Bluetooth ────────────────────────────────────────────────
  const user = { get age() { return patient().age; }, get heightCm() { return patient().heightCm; }, get sex() { return patient().sex; } };
  let session = P.createSession(user);
  let kinds = [];
  let connected = false;
  let gotResult = false;
  let found = {};
  let bound = null;        // the device entry being connected or listened to
  let weightOnlyTimer = null;
  const logLines = [];

  function log(line) {
    const t = new Date();
    logLines.push(String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0') + ':' + String(t.getSeconds()).padStart(2, '0') + ' ' + line);
    if (logLines.length > 400) logLines.shift();
    $('log').textContent = logLines.join('\n');
  }

  /** state: '' | 'busy' | 'on' | 'warn' — drives the dial, the chip and the Device screen. */
  function setStatus(text, label, state) {
    $('bt-status').textContent = text;
    $('dial-note').textContent = text;
    if (label == null) return;
    $('dial-status').textContent = label;
    $('dev-chip-text').textContent = label;
    $('dev-chip').className = 'chip ' + (state || '');
    $('dial').className = 'dial ' + (state || '');
    $('ripple').className = 'ripple ' + (state === 'busy' ? 'on' : '');
  }

  function renderDevices() {
    const list = Object.keys(found).map((id) => found[id]).sort((a, b) => (b.likely - a.likely) || (b.rssi - a.rssi));
    $('devices').hidden = !list.length;
    $('devices').innerHTML = list.map((d) => {
      const bars = d.rssi > -60 ? 4 : d.rssi > -72 ? 3 : d.rssi > -84 ? 2 : 1;
      return `<div class="device">
        <span class="dv-name"><b>${esc(d.name)}</b><small>${esc(d.id)}${d.info ? ' · Body scale ' + esc(d.info.model) : d.likely ? ' · Body scale' : ''}</small></span>
        <span class="rssi" aria-label="Signal ${bars} of 4">${[1, 2, 3, 4].map((n) => `<i class="${n <= bars ? 'on' : ''}"></i>`).join('')}</span>
        <button type="button" class="bind" data-id="${esc(d.id)}">Bind</button>
      </div>`;
    }).join('');
  }

  $('devices').addEventListener('click', (e) => {
    const b = e.target.closest('.bind');
    if (!b) return;
    store(KEYS.device, b.dataset.id);
    Ble.stopScan();
    $('devices').hidden = true;
    bound = found[b.dataset.id];
    setStatus('Connecting to ' + bound.name + '…', 'Connecting', 'busy');
    if (bound.info && bound.info.proto === 'v30') log('this model uses the encrypted protocol (v30), which the app cannot read yet');
    if (bound.info && bound.info.broadcast) Ble.watch(bound.id); // broadcast-only scale: listen, never connect
    else Ble.connect(bound.id);
  });

  function startSearch() {
    const p = patient();
    if (!p.age || !p.heightCm || !p.sex || p.sex === 'other') toast('Tip: enter age, height and sex (male/female) in Patient first. The machine needs them for body fat.');
    found = {};
    bound = null;
    renderDevices();
    setStatus(Ble.mode === 'web' ? 'Choose your machine in the list that opens.' : 'Searching… step on the machine to wake it up.', 'Searching', 'busy');
    Ble.scan();
  }
  $('connect').addEventListener('click', startSearch);
  $('disconnect').addEventListener('click', () => Ble.disconnect());
  const openDevice = () => { if (connected) { show('device'); return; } show('device'); startSearch(); };
  $('dial').addEventListener('click', openDevice);
  $('dev-chip').addEventListener('click', openDevice);

  function handle(res) {
    res.events.forEach((ev) => {
      if (ev.type === 'weight') {
        $('dial-kg').textContent = ev.kg.toFixed(1);
        setStatus(ev.stable ? 'Weight locked. Stay still, measuring body fat…' : 'Measuring…', 'Measuring', 'busy');
        if (current === 'device') show('dash');
      } else if (ev.type === 'result') {
        gotResult = true;
        clearTimeout(weightOnlyTimer);
        setReading(ev.data);
        save(true);
        setStatus('Reading received. You can step off.', 'Connected', 'on');
        toast('Reading received');
        if (current === 'device') show('dash');
      } else if (ev.type === 'error') {
        setStatus(ev.message, 'Connected', 'warn');
      }
    });
  }

  function onConnected(name) {
    connected = true;
    gotResult = false;
    session = P.createSession(user, bound && bound.info);
    $('connect').hidden = true;
    $('disconnect').hidden = false;
    $('devices').hidden = true;
    $('dial-kg').textContent = '0.0';
    return name;
  }

  Ble.on((e) => {
    if (e.type === 'device') {
      const info = P.parseAdvert(e.adv, e.name);
      if (!e.name && !info) return;
      if (connected && bound && bound.id === e.id && info && info.broadcast) {
        // A broadcast-only scale: every advertisement carries the weight.
        const key = P.toHex(e.adv);
        if (key !== bound.lastAdv) { bound.lastAdv = key; log('adv ' + key); }
        handle(session.feedAdvert(info));
        clearTimeout(weightOnlyTimer);
        if (session.stableWithoutResult()) {
          weightOnlyTimer = setTimeout(() => {
            const partial = session.partial();
            if (!partial || !connected) return;
            session.latch();
            handle({ events: [{ type: 'result', data: partial }] });
          }, 5000);
        }
        return;
      }
      if (connected) return;
      const likely = info ? 2 : /senssun|fat|scale|body|weigh|bf|health|ics|qn-|yunmai|mi_?scale|icomon|lefu|chipsea|moving|^xs-|^if_?b/i.test(e.name) ? 1 : 0;
      const isNew = !found[e.id];
      found[e.id] = { id: e.id, name: e.name || 'Body scale', rssi: e.rssi, likely, info };
      if (isNew) {
        log('found ' + (e.name || '(no name)') + ' [' + e.id + '] rssi ' + e.rssi + (e.adv.length ? ' adv ' + P.toHex(e.adv) : '')
          + (info ? ' → model ' + info.model + ' ' + info.proto : ''));
        renderDevices();
        if (load(KEYS.device, '') === e.id) $('devices').querySelector('[data-id="' + e.id + '"]').click(); // the machine bound last time
      }
      return;
    }
    if (e.type === 'services') {
      kinds = P.pickKinds(e.services.map((s) => s.uuid));
      log('services ' + e.services.map((s) => P.short(s.uuid) + '(' + s.chars.map(P.short).join(',') + ')').join(' '));
      log(kinds.length ? 'protocol ' + kinds.join(', ') : 'no known scale protocol on this device');
      return;
    }
    if (e.type === 'notify') {
      log('rx ' + P.short(e.char) + ' ' + P.toHex(e.bytes));
      const res = session.feed(e.char, e.bytes);
      const kind = P.short(e.char) === 'ffb2' && kinds.includes('senssunB') ? 'senssunB' : 'senssun';
      res.writes.forEach((w) => { log('tx ' + P.toHex(w)); Ble.write(P.SERVICES[kind].service, P.SERVICES[kind].write, w); });
      handle(res);
      return;
    }
    // state
    log('state ' + e.state + (e.message ? ' ' + e.message : ''));
    if (e.state === 'scanning') setStatus('Searching… step on the machine to wake it up.', 'Searching', 'busy');
    else if (e.state === 'scan-ended') {
      if (!connected) setStatus(Object.keys(found).length ? 'Choose your machine from the list and tap Bind.' : 'No machine found. Step on it to wake it up, keep it near the phone, and search again.', 'Unconnected', '');
    } else if (e.state === 'connecting') setStatus('Connecting…', 'Connecting', 'busy');
    else if (e.state === 'watching') {
      onConnected();
      setStatus('Ready. Stand on the machine barefoot and stay still.', 'Connected', 'on');
      if (current === 'device') show('dash');
    } else if (e.state === 'connected') {
      onConnected();
      if (kinds.includes('senssun')) session.start().forEach((w) => { log('tx ' + P.toHex(w)); Ble.write('fff0', 'fff2', w); });
      setStatus(kinds.length ? 'Connected' + (e.message ? ' to ' + e.message : '') + '. Stand on the machine barefoot and stay still.'
        : 'Connected, but this machine uses a protocol the app does not know yet. Stand on it, then send the log below to support.', 'Connected', 'on');
      if (kinds.length && current === 'device') show('dash');
    } else if (e.state === 'disconnected') {
      const partial = !gotResult && session.partial();
      connected = false;
      clearTimeout(weightOnlyTimer);
      if (partial) { setReading(partial); save(true); toast('Weight received'); }
      $('connect').hidden = false;
      $('disconnect').hidden = true;
      setStatus(gotResult || partial ? 'Reading received. Machine disconnected.' : 'Machine disconnected. Tap the circle to connect.', 'Unconnected', '');
      renderDash();
    } else if (e.state === 'error') {
      setStatus(e.message || 'Bluetooth error.', 'Unconnected', 'warn');
    }
  });

  // ── Manual entry and sample ──────────────────────────────────
  const manualForm = $('manual-form');
  const MANUAL_FIELDS = ['weightKg', 'fatPct', 'waterPct', 'musclePct', 'boneKg', 'visceral', 'bmrKcal'];
  $('manual').addEventListener('click', () => {
    MANUAL_FIELDS.forEach((k) => { manualForm[k].value = reading && reading[k] != null ? reading[k] : ''; });
    $('manual-dialog').showModal();
  });
  $('manual-dialog').addEventListener('close', () => {
    if ($('manual-dialog').returnValue !== 'ok') return;
    const data = { source: 'Entered manually' };
    MANUAL_FIELDS.forEach((k) => { if (manualForm[k].value !== '') data[k] = Number(manualForm[k].value); });
    if (data.weightKg == null) { toast('Enter the weight'); return; }
    setReading(data);
    show('dash');
  });

  $('demo').addEventListener('click', () => {
    if (!form.name.value) form.name.value = 'Sample Patient';
    if (!form.age.value) form.age.value = 42;
    if (!form.height.value) form.height.value = '168';
    if (!sex) setSex('male');
    setReading({ source: 'SAMPLE (not a real reading)', sample: true, weightKg: 74.6, fatPct: 24.8, waterPct: 52.1, musclePct: 38.4, boneKg: 2.9, bmrKcal: 1582 });
    show('dash');
  });

  $('copy-log').addEventListener('click', () => {
    const text = logLines.join('\n');
    const done = () => toast('Log copied');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => toast('Could not copy. Select the text and copy it.'));
    else { const r = document.createRange(); r.selectNodeContents($('log')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); try { document.execCommand('copy'); done(); } catch (_) { toast('Select the text and copy it.'); } }
  });
  $('clear-log').addEventListener('click', () => { logLines.length = 0; $('log').textContent = 'Nothing yet.'; });

  // ── Tests advised ────────────────────────────────────────────
  function renderTests() {
    $('tests').innerHTML = tests.map((t, i) => `
      <label class="test"><input type="checkbox" data-i="${i}" ${t.on ? 'checked' : ''}><span>${esc(t.name)}</span>
        ${DEFAULT_TESTS.includes(t.name) ? '' : `<button type="button" class="x" data-del="${i}" aria-label="Remove ${esc(t.name)}">×</button>`}</label>`).join('');
    $('hide-unticked').checked = !!opts.hideUnticked;
  }
  $('tests').addEventListener('change', (e) => {
    const i = e.target.dataset.i;
    if (i == null) return;
    tests[i].on = e.target.checked;
    store(KEYS.tests, tests);
  });
  $('tests').addEventListener('click', (e) => {
    const del = e.target.dataset.del;
    if (del == null) return;
    e.preventDefault();
    tests.splice(Number(del), 1);
    store(KEYS.tests, tests);
    renderTests();
  });
  function addTest() {
    const name = $('new-test').value.trim();
    if (!name) return;
    if (!tests.some((t) => t.name.toLowerCase() === name.toLowerCase())) tests.push({ name, on: true });
    $('new-test').value = '';
    store(KEYS.tests, tests);
    renderTests();
  }
  $('add-test').addEventListener('click', addTest);
  $('new-test').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addTest(); } });
  $('hide-unticked').addEventListener('change', (e) => { opts.hideUnticked = e.target.checked; store(KEYS.opts, opts); });

  // ── A4 report: left = patient + tests + app, middle = body data, right = blank ──
  const TICK = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect width="16" height="16" rx="3.5" fill="#22A65B"/><path d="M4.2 8.3l2.5 2.5 5-5.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const BOX = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x=".75" y=".75" width="14.5" height="14.5" rx="3" fill="#fff" stroke="#8a96a8" stroke-width="1.5"/></svg>';

  function sheetHtml() {
    const p = patient();
    const list = rows();
    const sexBox = (value, label) => `<span class="sx">${p.sex === value ? TICK : BOX} ${label}</span>`;
    const shown = tests.filter((t) => t.on || !opts.hideUnticked);
    const weight = list.find((r) => r.key === 'weight');
    const rest = list.filter((r) => r.key !== 'weight' && r.key !== 'impedance');
    const when = measuredAt ? new Date(measuredAt) : null;
    const height = p.heightCm ? p.heightCm + ' cm' : p.heightText;

    const line = (r) => `
            <li>
              <span class="dl-label">${esc(r.label.replace(' (estimated)', ''))}${r.estimated ? '~' : r.calculated ? '*' : ''}${r.range ? `<small>Normal ${esc(r.range)}</small>` : ''}</span>
              <span class="dl-value${r.key === 'type' ? ' words' : ''}"><b>${esc(r.value)}</b> ${esc(r.unit)}${r.status ? `<em class="${esc(r.level)}">${esc(r.status)}</em>` : ''}</span>
            </li>`;

    const left = `
      <div class="strip">
        <div class="strip-body">
          <h3>Patient Details</h3>
          <p class="line"><span>Date:</span><u>${esc(niceDate(p.date))}</u></p>
          <p class="line"><span>Name:</span><u>${esc(p.name)}</u></p>
          <p class="line two"><span>Age:</span><u class="short">${esc(p.age)}</u><span>Height (cm/ft):</span><u>${esc(height)}</u></p>
          <p class="sexes"><span>Sex:</span>${sexBox('male', 'Male')}${sexBox('female', 'Female')}${sexBox('other', 'Others')}</p>
          <h3>Tests Advised</h3>
          <ul class="tests-list">${shown.map((t) => `<li>${t.on ? TICK : BOX}<span>${esc(t.name)}</span></li>`).join('')}</ul>
        </div>
        <div class="strip-app">
          <h3>Download Our App</h3>
          <div class="app-id"><img src="img/icon-192.png" alt=""><div><b>Hindivine Patient</b><small>The official app for Hindivine Healthcare patients.</small></div></div>
          <div class="badge"><small>GET IT ON</small><b>Google Play Store</b></div>
          <div class="badge"><small>DOWNLOAD ON THE</small><b>App Store</b></div>
        </div>
      </div>`;

    const mid = `
      <div class="strip">
        <div class="strip-body">
          <img class="mid-logo" src="img/logo.jpg" alt="Hindivine Healthcare Private Limited">
          <h3>Body Composition</h3>
          ${reading && reading.sample ? '<p class="sample">SAMPLE — not a real reading</p>' : ''}
          ${weight ? `<div class="big"><b>${esc(weight.value)}</b><span>kg</span><small>Weight</small></div>` : '<p class="empty">No reading taken.</p>'}
          <ul class="data-list">${rest.filter((r) => r.group === 'comp').map(line).join('')}</ul>
          ${rest.some((r) => r.group === 'manage') ? `<h3>Weight Management</h3><ul class="data-list">${rest.filter((r) => r.group === 'manage').map(line).join('')}</ul>` : ''}
          ${list.length ? `<p class="notes">${when ? 'Measured ' + esc(when.toLocaleString()) + '.<br>' : ''}${esc(reading.source && !reading.sample ? reading.source + '. ' : '')}* Calculated by the app from the machine's values, height, age and sex. ${list.some((r) => r.estimated) ? '~ Estimated by the app from the impedance the machine measured. ' : ''}Based on bio-electrical impedance analysis, for reference only; not a medical diagnosis.</p>` : ''}
        </div>
      </div>`;

    return `<div class="a4"><div class="col">${left}</div><div class="col">${mid}</div><div class="col blank"></div></div>`;
  }

  function renderPreview() {
    const page = $('preview-page');
    page.innerHTML = sheetHtml();
    const scale = $('preview').clientWidth / page.offsetWidth;
    page.style.transform = 'scale(' + scale + ')';
    $('preview').style.height = Math.ceil(page.offsetHeight * scale) + 'px';
  }
  window.addEventListener('resize', () => { if (current === 'a4') renderPreview(); });

  function print() {
    $('sheet').innerHTML = sheetHtml();
    const p = patient();
    const title = 'Hindivine-Body-Report' + (p.name ? '-' + p.name.replace(/[^\w]+/g, '-') : '') + '-' + (p.date || today());
    if (window.AndroidBridge && window.AndroidBridge.print) { window.AndroidBridge.print(title); return; }
    const old = document.title;
    document.title = title;
    window.print();
    document.title = old;
  }
  $('print').addEventListener('click', () => { save(true); print(); });
  $('print2').addEventListener('click', print);
  $('print3').addEventListener('click', () => { save(true); print(); });

  // ── Saved readings ───────────────────────────────────────────
  function save(quiet) {
    if (!reading || reading.sample) { if (!quiet) toast(reading ? 'Sample readings are not saved' : 'No reading to save'); return; }
    const all = load(KEYS.readings, []);
    const p = patient();
    const rec = { id: savedId || 'r' + Date.now().toString(36), at: measuredAt, patient: { date: p.date, name: p.name, age: p.age, height: p.heightText, sex: p.sex }, reading };
    const i = all.findIndex((r) => r.id === rec.id);
    if (i >= 0) all[i] = rec; else all.unshift(rec);
    savedId = rec.id;
    if (!store(KEYS.readings, all.slice(0, 2000))) { toast('Could not save: storage is full'); return; }
    if (!quiet) toast('Saved');
  }

  /** Weight trend of the current patient (or of every reading when no name is entered). */
  function trendHtml(list) {
    const pts = list.filter((r) => r.reading && r.reading.weightKg != null).slice(0, 30).reverse();
    if (pts.length < 2) return '<p class="hint">The trend appears after two saved readings.</p>';
    const ws = pts.map((r) => Number(r.reading.weightKg));
    const lo = Math.min.apply(null, ws), hi = Math.max.apply(null, ws);
    const pad = Math.max(0.5, (hi - lo) * 0.2);
    const W = 320, H = 150, L = 34, R = 12, T = 14, B = 24;
    const x = (i) => L + (W - L - R) * i / (pts.length - 1);
    const y = (w) => T + (H - T - B) * (1 - (w - (lo - pad)) / ((hi + pad) - (lo - pad)));
    const line = ws.map((w, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(w).toFixed(1)).join(' ');
    const d = (r) => { const t = new Date(r.at); return t.getDate() + '/' + (t.getMonth() + 1); };
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Weight trend from ${ws[0]} to ${ws[ws.length - 1]} kg">
      <path class="grid" d="M${L} ${y(hi)}H${W - R}M${L} ${y(lo)}H${W - R}"/>
      <text x="${L - 5}" y="${y(hi) + 4}" text-anchor="end">${hi.toFixed(1)}</text>
      <text x="${L - 5}" y="${y(lo) + 4}" text-anchor="end">${lo.toFixed(1)}</text>
      <path class="area" d="${line} L${x(pts.length - 1)} ${H - B} L${x(0)} ${H - B} Z"/>
      <path class="line" d="${line}"/>
      ${ws.map((w, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(w).toFixed(1)}" r="${i === ws.length - 1 ? 4.5 : 3}"/>`).join('')}
      <text x="${x(0)}" y="${H - 6}" text-anchor="start">${d(pts[0])}</text>
      <text x="${x(pts.length - 1)}" y="${H - 6}" text-anchor="end">${d(pts[pts.length - 1])}</text>
    </svg>
    <p class="trend-now"><b>${ws[ws.length - 1].toFixed(1)} kg</b> latest · ${(ws[ws.length - 1] - ws[0] >= 0 ? '+' : '') + (ws[ws.length - 1] - ws[0]).toFixed(1)} kg over ${pts.length} readings</p>`;
  }

  function renderHistory() {
    const q = $('search').value.trim().toLowerCase();
    const every = load(KEYS.readings, []);
    const name = patient().name.toLowerCase();
    $('trend-who').textContent = name ? patient().name : 'All readings';
    $('trend').innerHTML = trendHtml(name ? every.filter((r) => (r.patient.name || '').toLowerCase() === name) : every);
    const all = every.filter((r) => !q || (r.patient.name || '').toLowerCase().includes(q));
    $('history').innerHTML = all.length ? all.map((r) => `
      <div class="hist">
        <button type="button" class="hist-open" data-open="${esc(r.id)}">
          <b>${esc(r.patient.name || 'No name')}</b>
          <small>${esc(new Date(r.at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }))}</small>
          <span>${esc(r.reading.weightKg)} kg${r.reading.fatPct != null ? ' · fat ' + esc(r.reading.fatPct) + '%' : ''}</span>
        </button>
        <button type="button" class="x" data-del="${esc(r.id)}" aria-label="Delete reading">×</button>
      </div>`).join('') : '<p class="hint">No saved readings' + (q ? ' for this name.' : ' yet.') + '</p>';
  }
  $('search').addEventListener('input', renderHistory);
  $('history').addEventListener('click', (e) => {
    const del = e.target.closest('[data-del]');
    if (del) {
      if (!confirm('Delete this reading?')) return;
      store(KEYS.readings, load(KEYS.readings, []).filter((r) => r.id !== del.dataset.del));
      renderHistory();
      return;
    }
    const open = e.target.closest('[data-open]');
    if (!open) return;
    const r = load(KEYS.readings, []).find((x) => x.id === open.dataset.open);
    if (!r) return;
    form.date.value = r.patient.date || '';
    form.name.value = r.patient.name || '';
    form.age.value = r.patient.age || '';
    form.height.value = r.patient.height || '';
    setSex(r.patient.sex || '');
    setReading(r.reading, r.at);
    savedId = r.id;
    show('dash');
  });

  $('new').addEventListener('click', () => {
    form.reset();
    form.date.value = today();
    setSex('');
    reading = null; measuredAt = null; savedId = null;
    openTile = ''; openItem = '';
    session.reset();
    $('height-hint').textContent = '';
    renderAll();
    show('patient');
  });

  // ── Start ────────────────────────────────────────────────────
  form.date.value = today();
  renderTests();
  renderAll();
  if (Ble.mode === 'none') setStatus('Bluetooth is not available in this browser. Install the Android app or use Chrome. You can still enter values manually (Device tab).', 'No Bluetooth', 'warn');
})();
