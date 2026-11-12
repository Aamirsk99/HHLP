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

  // ── Tabs ─────────────────────────────────────────────────────
  function show(tab) {
    document.querySelectorAll('.screen').forEach((s) => { s.hidden = s.dataset.screen !== tab; });
    document.querySelectorAll('#tabs button').forEach((b) => {
      if (b.dataset.tab === tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (tab === 'report') renderPreview();
    if (tab === 'history') renderHistory();
    window.scrollTo(0, 0);
  }
  $('tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(b.dataset.tab); });
  window.onAndroidBack = () => {
    if ($('manual-dialog').open) { $('manual-dialog').close(); return true; }
    if (!document.querySelector('[data-screen="measure"]').hidden) return false;
    show('measure');
    return true;
  };

  // ── Patient form ─────────────────────────────────────────────
  function setSex(value) {
    sex = value;
    document.querySelectorAll('#sex button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === value)));
  }
  $('sex').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; setSex(b.dataset.value === sex ? '' : b.dataset.value); renderRows(); });
  form.addEventListener('input', () => {
    const p = patient();
    $('height-hint').textContent = p.heightText && !p.heightCm ? 'Height not understood. Type cm (170) or feet.inches (5.7).'
      : p.heightCm && !/^\d{3}$/.test(p.heightText) ? 'Height: ' + p.heightCm + ' cm' : '';
    renderRows();
  });

  // ── Body data ────────────────────────────────────────────────
  function rows() { return reading ? M.buildRows(reading, patient()) : []; }

  function renderRows() {
    const list = rows();
    $('rows').innerHTML = list.map((r) => `
      <div class="data-row">
        <span class="dr-label">${esc(r.label)}${r.calculated ? '<i title="Calculated">*</i>' : ''}</span>
        <span class="dr-value"><b>${esc(r.value)}</b> ${esc(r.unit)}</span>
        <span class="dr-status ${esc(r.level)}">${esc(r.status)}</span>
      </div>`).join('');
    const has = list.length > 0;
    $('print').disabled = $('save').disabled = !has;
    if (!has) {
      $('result-meta').textContent = 'No reading yet. Connect the machine and stand on it barefoot.';
    } else {
      const when = measuredAt ? new Date(measuredAt).toLocaleString() : '';
      const only = reading.fatPct == null ? ' Weight only: the machine sent no body-fat values.' : '';
      $('result-meta').textContent = (reading.source || 'Reading') + (when ? ' · ' + when : '') + '.' + only + ' * calculated from weight, height, age and sex.';
    }
  }

  function setReading(data, at) {
    reading = Object.assign({}, data);
    measuredAt = at || Date.now();
    savedId = null;
    renderRows();
  }

  // ── Bluetooth ────────────────────────────────────────────────
  const user = { get age() { return patient().age; }, get heightCm() { return patient().heightCm; }, get sex() { return patient().sex; } };
  let session = P.createSession(user);
  let kinds = [];
  let connected = false;
  let gotResult = false;
  let found = {};
  const logLines = [];

  function log(line) {
    const t = new Date();
    logLines.push(String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0') + ':' + String(t.getSeconds()).padStart(2, '0') + ' ' + line);
    if (logLines.length > 400) logLines.shift();
    $('log').textContent = logLines.join('\n');
  }

  function setStatus(text, pill, tone) {
    $('bt-status').textContent = text;
    if (pill) { $('bt-pill').textContent = pill; $('bt-pill').className = 'pill ' + (tone || ''); }
  }

  function renderDevices() {
    const list = Object.keys(found).map((id) => found[id]).sort((a, b) => (b.likely - a.likely) || (b.rssi - a.rssi));
    $('devices').hidden = !list.length;
    $('devices').innerHTML = list.map((d) => `
      <button type="button" class="device" data-id="${esc(d.id)}">
        <span><b>${esc(d.name)}</b><small>${d.likely ? 'Body scale' : 'Bluetooth device'}</small></span>
        <span class="dv-go">Connect</span>
      </button>`).join('');
  }

  $('devices').addEventListener('click', (e) => {
    const b = e.target.closest('.device');
    if (!b) return;
    store(KEYS.device, b.dataset.id);
    Ble.stopScan();
    $('devices').hidden = true;
    setStatus('Connecting to ' + found[b.dataset.id].name + '…', 'Connecting', 'busy');
    Ble.connect(b.dataset.id);
  });

  $('connect').addEventListener('click', () => {
    const p = patient();
    if (!p.age || !p.heightCm || !p.sex || p.sex === 'other') toast('Tip: fill age, height and sex (male/female) first. The machine needs them for body fat.');
    found = {};
    renderDevices();
    setStatus(Ble.mode === 'web' ? 'Choose your machine in the list that opens.' : 'Searching for machines… step on the machine to wake it up.', 'Searching', 'busy');
    Ble.scan();
  });
  $('disconnect').addEventListener('click', () => Ble.disconnect());

  Ble.on((e) => {
    if (e.type === 'device') {
      const likely = /senssun|fat|scale|body|weigh|bf|health|ics|qn-|yunmai|mi_?scale|icomon|lefu|chipsea/i.test(e.name) ? 1 : 0;
      const isNew = !found[e.id];
      found[e.id] = { id: e.id, name: e.name, rssi: e.rssi, likely };
      if (isNew) {
        log('found ' + e.name + ' [' + e.id + '] rssi ' + e.rssi);
        renderDevices();
        if (load(KEYS.device, '') === e.id) $('devices').querySelector('[data-id="' + e.id + '"]').click(); // the machine used last time
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
      const kind = P.short(e.char) === 'ffb2' ? 'senssunB' : 'senssunA';
      res.writes.forEach((w) => { log('tx ' + P.toHex(w)); Ble.write(P.SERVICES[kind].service, P.SERVICES[kind].write, w); });
      res.events.forEach((ev) => {
        if (ev.type === 'weight') {
          $('live').hidden = false;
          $('live-kg').textContent = ev.kg.toFixed(1);
          $('live-note').textContent = ev.stable ? 'Weight locked. Stay still, measuring body fat…' : 'Measuring…';
        } else if (ev.type === 'result') {
          gotResult = true;
          setReading(ev.data);
          $('live-note').textContent = 'Done';
          setStatus('Reading received. You can step off.', 'Done', 'ok');
          toast('Reading received');
        } else if (ev.type === 'error') {
          setStatus(ev.message, 'Try again', 'warn');
        }
      });
      return;
    }
    // state
    log('state ' + e.state + (e.message ? ' ' + e.message : ''));
    if (e.state === 'scanning') setStatus('Searching for machines… step on the machine to wake it up.', 'Searching', 'busy');
    else if (e.state === 'scan-ended') {
      if (!connected) setStatus(Object.keys(found).length ? 'Choose your machine from the list.' : 'No machine found. Step on it to wake it up, keep it near the phone, and tap Connect machine again.', 'Not connected', '');
    } else if (e.state === 'connecting') setStatus('Connecting…', 'Connecting', 'busy');
    else if (e.state === 'connected') {
      connected = true;
      gotResult = false;
      session = P.createSession(user);
      $('connect').hidden = true;
      $('disconnect').hidden = false;
      $('devices').hidden = true;
      const senssun = kinds.filter((k) => k.indexOf('senssun') === 0);
      senssun.forEach((k) => session.start(k).forEach((w) => { log('tx ' + P.toHex(w)); Ble.write(P.SERVICES[k].service, P.SERVICES[k].write, w); }));
      setStatus(kinds.length ? 'Connected' + (e.message ? ' to ' + e.message : '') + '. Stand on the machine barefoot and stay still.'
        : 'Connected, but this machine uses a protocol the app does not know yet. Stand on it, then send the log from Help to support.', 'Connected', 'ok');
    } else if (e.state === 'disconnected') {
      const partial = !gotResult && session.partial();
      if (partial) { setReading(partial); toast('Weight received'); }
      connected = false;
      $('connect').hidden = false;
      $('disconnect').hidden = true;
      $('live').hidden = true;
      setStatus(gotResult || partial ? 'Reading received. Machine disconnected.' : 'Machine disconnected. Tap Connect machine to measure.', 'Not connected', '');
    } else if (e.state === 'error') {
      setStatus(e.message || 'Bluetooth error.', 'Not connected', 'warn');
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
  });

  $('demo').addEventListener('click', () => {
    if (!form.name.value) form.name.value = 'Sample Patient';
    if (!form.age.value) form.age.value = 42;
    if (!form.height.value) form.height.value = '168';
    if (!sex) setSex('male');
    setReading({ source: 'SAMPLE (not a real reading)', sample: true, weightKg: 74.6, fatPct: 24.8, waterPct: 52.1, musclePct: 38.4, boneKg: 2.9, bmrKcal: 1582 });
    show('measure');
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
    renderPreview();
  });
  $('tests').addEventListener('click', (e) => {
    const del = e.target.dataset.del;
    if (del == null) return;
    e.preventDefault();
    tests.splice(Number(del), 1);
    store(KEYS.tests, tests);
    renderTests();
    renderPreview();
  });
  function addTest() {
    const name = $('new-test').value.trim();
    if (!name) return;
    if (!tests.some((t) => t.name.toLowerCase() === name.toLowerCase())) tests.push({ name, on: true });
    $('new-test').value = '';
    store(KEYS.tests, tests);
    renderTests();
    renderPreview();
  }
  $('add-test').addEventListener('click', addTest);
  $('new-test').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addTest(); } });
  $('hide-unticked').addEventListener('change', (e) => { opts.hideUnticked = e.target.checked; store(KEYS.opts, opts); renderPreview(); });

  // ── A4 report: left = patient + tests + app, middle = body data, right = blank ──
  const TICK = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect width="16" height="16" rx="3.5" fill="#22A65B"/><path d="M4.2 8.3l2.5 2.5 5-5.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const BOX = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x=".75" y=".75" width="14.5" height="14.5" rx="3" fill="#fff" stroke="#8a96a8" stroke-width="1.5"/></svg>';

  function sheetHtml() {
    const p = patient();
    const list = rows();
    const sexBox = (value, label) => `<span class="sx">${p.sex === value ? TICK : BOX} ${label}</span>`;
    const shown = tests.filter((t) => t.on || !opts.hideUnticked);
    const weight = list.find((r) => r.key === 'weight');
    const rest = list.filter((r) => r.key !== 'weight');
    const when = measuredAt ? new Date(measuredAt) : null;
    const height = p.heightCm ? p.heightCm + ' cm' : p.heightText;

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
          <ul class="data-list">${rest.map((r) => `
            <li>
              <span class="dl-label">${esc(r.label)}${r.calculated ? '*' : ''}${r.range ? `<small>Normal ${esc(r.range)}</small>` : ''}</span>
              <span class="dl-value"><b>${esc(r.value)}</b> ${esc(r.unit)}${r.status ? `<em class="${esc(r.level)}">${esc(r.status)}</em>` : ''}</span>
            </li>`).join('')}</ul>
          ${list.length ? `<p class="notes">${when ? 'Measured ' + esc(when.toLocaleString()) + '.<br>' : ''}${esc(reading.source && !reading.sample ? reading.source + '. ' : '')}* Calculated from weight, height, age and sex. Body-composition values are estimates from a bio-impedance scale and are not a diagnosis.</p>` : ''}
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
  window.addEventListener('resize', () => { if (!document.querySelector('[data-screen="report"]').hidden) renderPreview(); });

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
  $('save').addEventListener('click', () => save(false));

  function renderHistory() {
    const q = $('search').value.trim().toLowerCase();
    const all = load(KEYS.readings, []).filter((r) => !q || (r.patient.name || '').toLowerCase().includes(q));
    $('history').innerHTML = all.length ? all.map((r) => `
      <div class="hist">
        <button type="button" class="hist-open" data-open="${esc(r.id)}">
          <b>${esc(r.patient.name || 'No name')}</b>
          <small>${esc(new Date(r.at).toLocaleString())}</small>
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
    show('measure');
  });

  $('new').addEventListener('click', () => {
    form.reset();
    form.date.value = today();
    setSex('');
    reading = null; measuredAt = null; savedId = null;
    session.reset();
    $('live').hidden = true;
    $('height-hint').textContent = '';
    renderRows();
    window.scrollTo(0, 0);
  });

  // ── Start ────────────────────────────────────────────────────
  form.date.value = today();
  renderTests();
  renderRows();
  if (Ble.mode === 'none') setStatus('Bluetooth is not available in this browser. Install the Android app or use Chrome. You can still enter values manually.', 'No Bluetooth', 'warn');
})();
