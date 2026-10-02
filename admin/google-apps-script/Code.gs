/**
 * Hindivine Admin ↔ Google Sheets: the sheet is the app's data store.
 *
 * Every save from the app writes:
 *   - the complete app data (JSON) into the hidden sheet "_AppData", which the app loads back
 *     on every device, so all admins share one set of data;
 *   - the 15 readable sheets (Dashboard, Appointments, Leads, Patients, … Renewals, Activity Log), rebuilt from that data.
 *
 * Set-up (once):
 * 1. Open the Hindivine Google Sheet → Extensions → Apps Script, paste this file, Save.
 * 2. Run `setup` once and allow access. It creates the sheets and logs a secret (View → Logs).
 * 3. Deploy → New deployment → Web app: Execute as "Me", Who has access "Anyone".
 * 4. In the admin app: Settings → Google Sheet → paste the web app URL and the secret → Save.
 *
 * Edit data in the app, not in the sheets: each save rewrites the 15 sheets.
 *
 * Which spreadsheet holds the data:
 *  - By default the current Hindivine sheet (SHEET_ID below, or the sheet this script is attached to).
 *  - Run `useNewSpreadsheet` to create a brand-new spreadsheet, copy all app data into it and use it from now on
 *    (its link is in the log). Run `useCurrentSheet` to go back. Missing tabs are always created automatically.
 *  The app's Settings → Google Sheet shows which spreadsheet is in use.
 */
const SHEET_ID = '1_aKPoHJaJfQ6awuoG7ihufQzOBhw8I84yipErlWO1_Y';
const SHEETS = ['Dashboard', 'Appointments', 'Leads', 'Patients', 'Injection Sales', 'Protein Sales', 'Diet Support', 'Purchases',
  'Inventory', 'Team', 'Incentives', 'Salary', 'Expenses', 'Renewals', 'Activity Log'];
const DATA_SHEET = '_AppData';
const CHUNK = 40000; // a cell holds up to 50,000 characters
const NAVY = '#0a2f55';

function book() {
  const id = PropertiesService.getScriptProperties().getProperty('DATA_SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  let active = null;
  try { active = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) { active = null; }
  return active || SpreadsheetApp.openById(SHEET_ID);
}

function ensureTabs(ss) {
  SHEETS.forEach((name, i) => { if (!ss.getSheetByName(name)) ss.insertSheet(name, Math.min(i, ss.getSheets().length)); });
  dataSheet(ss);
}

/** Create a new spreadsheet, copy all app data into it and store everything there from now on. */
function useNewSpreadsheet() {
  const from = book();
  const d = readData(from);
  const ss = SpreadsheetApp.create('Hindivine Admin Data ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'));
  ensureTabs(ss);
  const blank = ss.getSheetByName('Sheet1');
  if (blank && ss.getSheets().length > 1) ss.deleteSheet(blank);
  if (d.state) writeData(ss, d.state, 'Moved from ' + from.getName());
  PropertiesService.getScriptProperties().setProperty('DATA_SHEET_ID', ss.getId());
  Logger.log('Now using the new spreadsheet: ' + ss.getUrl() + '. The 15 readable tabs fill in on the next save from the app.');
  return ss.getUrl();
}

/** Go back to the current Hindivine sheet (SHEET_ID / the sheet this script is attached to). */
function useCurrentSheet() {
  PropertiesService.getScriptProperties().deleteProperty('DATA_SHEET_ID');
  const ss = book();
  ensureTabs(ss);
  Logger.log('Now using: ' + ss.getUrl());
  return ss.getUrl();
}

function setup() {
  const ss = book();
  ensureTabs(ss);
  const blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty('SECRET');
  if (!secret) {
    secret = Utilities.getUuid().replace(/-/g, '').slice(0, 16);
    props.setProperty('SECRET', secret);
  }
  Logger.log('Secret for the admin app: ' + secret);
  return secret;
}

function dataSheet(ss) {
  let sh = ss.getSheetByName(DATA_SHEET);
  if (!sh) {
    sh = ss.insertSheet(DATA_SHEET);
    sh.getRange('A1').setValue('{"updated":0}');
    sh.hideSheet();
    sh.protect().setDescription('Hindivine Admin app data: do not edit').setWarningOnly(true);
  }
  return sh;
}

function checkSecret(given) {
  const secret = PropertiesService.getScriptProperties().getProperty('SECRET');
  return !!secret && given === secret;
}

function readData(ss) {
  const sh = dataSheet(ss);
  const meta = JSON.parse(sh.getRange('A1').getValue() || '{"updated":0}');
  if (!meta.chunks) return { updated: meta.updated || 0, state: null };
  const parts = sh.getRange(2, 1, meta.chunks, 1).getValues().map((r) => r[0]).join('');
  return { updated: meta.updated, by: meta.by || '', state: JSON.parse(parts) };
}

function writeData(ss, state, by) {
  const sh = dataSheet(ss);
  const text = JSON.stringify(state);
  const parts = [];
  for (let i = 0; i < text.length; i += CHUNK) parts.push([text.slice(i, i + CHUNK)]);
  sh.getRange('A2:A').clearContent();
  if (parts.length) sh.getRange(2, 1, parts.length, 1).setNumberFormat('@').setValues(parts);
  const meta = { updated: Date.now(), chunks: parts.length, by: by || '' };
  sh.getRange('A1').setValue(JSON.stringify(meta));
  return meta.updated;
}

function writeSheets(ss, sheets) {
  const written = {};
  SHEETS.forEach((name, i) => {
    const rows = (sheets || {})[name];
    if (!rows) return;
    const sh = ss.getSheetByName(name) || ss.insertSheet(name, i);
    sh.clearContents();
    if (!rows.length) return;
    const width = Math.max.apply(null, rows.map((r) => r.length));
    const data = rows.map((r) => { const x = r.slice(); while (x.length < width) x.push(''); return x; });
    sh.getRange(1, 1, data.length, width).setValues(data);
    sh.getRange(1, 1, 1, width).setFontWeight('bold').setBackground(NAVY).setFontColor('#ffffff');
    sh.setFrozenRows(1);
    written[name] = data.length - 1;
  });
  return written;
}

/** GET ?action=load&secret=… → the app data; GET without action → health check. */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action !== 'load') return json({ ok: true, app: 'hindivine-admin-sheets', sheets: SHEETS });
  if (!checkSecret(p.secret)) return json({ ok: false, error: 'Wrong secret. Run setup and copy the secret again.' });
  const ss = book();
  const d = readData(ss);
  return json({ ok: true, updated: d.updated, by: d.by, state: d.state, sheetName: ss.getName(), sheetUrl: ss.getUrl() });
}

/**
 * POST {action:'save', secret, state, sheets, base, by}. `base` is the version the app last loaded;
 * if another device saved since then the save is refused (conflict) so no one's work is overwritten.
 */
function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'Bad JSON' }); }
  if (!checkSecret(body.secret)) return json({ ok: false, error: 'Wrong secret. Run setup and copy the secret again.' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = book();
    let updated = null;
    if (body.action === 'save') {
      const current = JSON.parse(dataSheet(ss).getRange('A1').getValue() || '{"updated":0}');
      if (current.updated && !body.force && body.base !== current.updated) {
        return json({ ok: false, conflict: true, updated: current.updated, by: current.by || '' });
      }
      updated = writeData(ss, body.state, body.by);
    }
    const written = writeSheets(ss, body.sheets);
    SpreadsheetApp.flush();
    return json({ ok: true, updated: updated, written: written });
  } finally {
    lock.releaseLock();
  }
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
