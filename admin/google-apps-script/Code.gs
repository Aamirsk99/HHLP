/**
 * Hindivine Admin → Google Sheets.
 *
 * 1. Create a Google Sheet, open Extensions → Apps Script, paste this file.
 * 2. Run `setup` once (allow access). It creates the 12 sheets and logs a secret.
 * 3. Deploy → New deployment → Web app: Execute as "Me", Who has access "Anyone".
 * 4. In the admin app (Settings → Google Sheets) paste the web app URL and the secret.
 *
 * Every sync rewrites all 12 sheets from the app's data, so the app stays the source of truth.
 */
const SHEETS = ['Dashboard', 'Patients', 'Injection Sales', 'Protein Sales', 'Diet Support', 'Purchases',
  'Inventory', 'Team', 'Incentives', 'Salary', 'Expenses', 'Renewals'];
const NAVY = '#0a2f55';

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  SHEETS.forEach((name, i) => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name, i);
  });
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

function doGet() {
  return json({ ok: true, app: 'hindivine-admin-sheets', sheets: SHEETS });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'Bad JSON' }); }
  const secret = PropertiesService.getScriptProperties().getProperty('SECRET');
  if (!secret || body.secret !== secret) return json({ ok: false, error: 'Wrong secret. Run setup and copy the secret again.' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const written = {};
    SHEETS.forEach((name, i) => {
      const rows = (body.sheets || {})[name];
      if (!rows) return;
      let sh = ss.getSheetByName(name) || ss.insertSheet(name, i);
      sh.clearContents();
      if (!rows.length) return;
      const width = Math.max.apply(null, rows.map((r) => r.length));
      const data = rows.map((r) => { const x = r.slice(); while (x.length < width) x.push(''); return x; });
      sh.getRange(1, 1, data.length, width).setValues(data);
      sh.getRange(1, 1, 1, width).setFontWeight('bold').setBackground(NAVY).setFontColor('#ffffff');
      sh.setFrozenRows(1);
      written[name] = data.length - 1;
    });
    ss.getSheetByName('Dashboard').activate();
    return json({ ok: true, written: written });
  } finally {
    lock.releaseLock();
  }
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
