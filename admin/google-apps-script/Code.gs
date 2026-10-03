/**
 * The Prime Fit Admin ↔ Google Sheets: the sheet is the app's data store.
 *
 * Every save from the app writes:
 *   - the complete app data (JSON) into the hidden sheet "_AppData", which the app loads back
 *     on every device, so all admins share one set of data;
 *   - the 23 readable sheets (Dashboard, Appointments, Leads, Patients, … Renewals, Activity Log), rebuilt from that data.
 *
 * Set-up (once):
 * 1. Upload ThePrimeFit_Sheets.xlsx to Google Drive and open it as a Google Sheet (File → Save as Google Sheets),
 *    then Extensions → Apps Script, paste this file, Save.
 * 2. Run `setup` once and allow access. It creates the sheets and logs a secret (View → Logs).
 * 3. Deploy → New deployment → Web app: Execute as "Me", Who has access "Anyone".
 * 4. In the admin app: Settings → Google Sheet → paste the web app URL and the secret → Save.
 *    The URL must be the Web app URL (https://script.google.com/macros/s/…/exec), not the editor or sheet link.
 * After pasting a newer Code.gs: Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy.
 * Otherwise Google keeps running the old code. The URL stays the same.
 *
 * Edit data in the app, not in the sheets: each save rewrites the 27 sheets.
 *
 * Social media counts (Content & Posts → "Fetch now" in the app):
 *   After pasting this file, run `testSocial` once (it asks to allow internet access), then
 *   Deploy → Manage deployments → Edit → Version: New version → Deploy. The URL stays the same.
 *   Without any keys the script reads the public YouTube channel page (total videos, subscribers) and
 *   the public Instagram profile (posts, reels, followers). For exact counts add, under
 *   Project Settings → Script properties:
 *   - YT_API_KEY: a YouTube Data API v3 key (Google Cloud console → APIs & Services → Credentials).
 *     YT_HANDLE defaults to ThePrimeFit. Gives videos, Shorts, long videos, subscribers and views.
 *   - IG_TOKEN and IG_USER_ID: an Instagram Graph API token for the business account
 *     (Meta for Developers). Gives posts, reels and followers. Without them the script tries the
 *     public profile of IG_USERNAME (default theprimefit_), which Instagram may refuse.
 */
// Leave empty when this script is opened from the sheet (Extensions → Apps Script); or paste a sheet ID.
const SHEET_ID = '';
const SHEETS = ['Dashboard', 'Appointments', 'Leads', 'Patients', 'Service Sales', 'Injection Sales', 'Protein Sales', 'Other Sales', 'Diet Support', 'Purchases',
  'Inventory', 'Team', 'Incentives', 'Salary', 'Expenses', 'Renewals', 'Doctors', 'Editors', 'Content', 'Campaigns', 'Ads Report', 'Tasks', 'Attendance', 'Founders', 'Founder Notes', 'Slips', 'Activity Log'];
const DATA_SHEET = '_AppData';
const CHUNK = 40000; // a cell holds up to 50,000 characters
const NAVY = '#015b53'; // The Prime Fit teal (sheet headers)

function book() {
  if (SHEET_ID) return SpreadsheetApp.openById(SHEET_ID);
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  // A script made at script.google.com (not from the sheet) has no sheet of its own: make one once.
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('BOOK_ID');
  if (id) return SpreadsheetApp.openById(id);
  const ss = SpreadsheetApp.create('The Prime Fit Data');
  props.setProperty('BOOK_ID', ss.getId());
  Logger.log('Created the sheet "The Prime Fit Data": ' + ss.getUrl());
  return ss;
}

function setup() {
  const ss = book();
  SHEETS.forEach((name, i) => { if (!ss.getSheetByName(name)) ss.insertSheet(name, i); });
  dataSheet(ss);
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
    sh.protect().setDescription('The Prime Fit Admin app data: do not edit').setWarningOnly(true);
  }
  return sh;
}

/** null when the secret matches, else the reason to show in the app. */
function secretError(given) {
  const secret = PropertiesService.getScriptProperties().getProperty('SECRET');
  if (!secret) return 'Setup was not run. In Apps Script choose the setup function, press Run and Allow, then copy the secret from the log.';
  if (String(given || '').trim() !== secret) return 'Wrong secret. In Apps Script run setup again and copy the secret shown in the log.';
  return null;
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
  try {
    const p = (e && e.parameter) || {};
    if (p.action !== 'load' && p.action !== 'social') {
      return json({ ok: true, app: 'primefit-admin-sheets', version: 10, setup: !!PropertiesService.getScriptProperties().getProperty('SECRET'), sheets: SHEETS });
    }
    const bad = secretError(p.secret);
    if (bad) return json({ ok: false, error: bad });
    if (p.action === 'social') return json(socialStats());
    const d = readData(book());
    return json({ ok: true, updated: d.updated, by: d.by, state: d.state });
  } catch (err) {
    return json({ ok: false, error: 'Google Sheet script error: ' + err.message });
  }
}

/**
 * POST {action:'save', secret, state, sheets, base, by}. `base` is the version the app last loaded;
 * if another device saved since then the save is refused (conflict) so no one's work is overwritten.
 */
function doPost(e) {
  try {
    let body;
    try { body = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'Bad JSON' }); }
    const bad = secretError(body.secret);
    if (bad) return json({ ok: false, error: bad });
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) return json({ ok: false, error: 'The Google Sheet is busy saving another device. Try again in a moment.' });
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
  } catch (err) {
    return json({ ok: false, error: 'Google Sheet script error: ' + err.message });
  }
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// ── Social media counts ─────────────────────────────────────────
/** Run this once from the Apps Script editor (Run → testSocial) to allow internet access, then Deploy → Manage deployments → Edit → New version. */
function testSocial() {
  Logger.log(JSON.stringify(socialStats(), null, 2));
}
function socialStats() {
  const props = PropertiesService.getScriptProperties();
  const out = { ok: true, youtube: {}, instagram: {}, fetchedAt: Date.now() };
  try { out.youtube = youtubeStats(props); } catch (err) { out.youtube = { error: String(err.message || err) }; }
  try { out.instagram = instagramStats(props); } catch (err) { out.instagram = { error: String(err.message || err) }; }
  return out;
}

function getJson(url, headers) {
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: headers || {} });
  if (res.getResponseCode() >= 300) throw new Error('HTTP ' + res.getResponseCode() + ' from ' + url.split('?')[0]);
  return JSON.parse(res.getContentText());
}

function youtubeStats(props) {
  const key = props.getProperty('YT_API_KEY');
  const handle = (props.getProperty('YT_HANDLE') || 'ThePrimeFit').replace(/^@/, '');
  if (!key) return youtubePublic(handle);
  const base = 'https://www.googleapis.com/youtube/v3/';
  const ch = getJson(base + 'channels?part=statistics&forHandle=@' + encodeURIComponent(handle) + '&key=' + key);
  const c = (ch.items || [])[0];
  if (!c) return { error: 'YouTube channel @' + handle + ' not found' };
  // Uploads split by type: UUSH… = Shorts, UULF… = long videos (playlist id = channel id with a new prefix).
  const count = (prefix) => {
    try { return getJson(base + 'playlistItems?part=id&maxResults=1&playlistId=' + prefix + c.id.slice(2) + '&key=' + key).pageInfo.totalResults; } catch (e) { return null; }
  };
  return {
    videos: Number(c.statistics.videoCount) || 0, shorts: count('UUSH'), long: count('UULF'),
    subscribers: Number(c.statistics.subscriberCount) || 0, views: Number(c.statistics.viewCount) || 0, handle: handle,
  };
}

// No API key: read the counts shown on the public channel page.
function youtubePublic(handle) {
  const res = UrlFetchApp.fetch('https://www.youtube.com/@' + encodeURIComponent(handle) + '/videos?hl=en&gl=IN',
    { muteHttpExceptions: true, followRedirects: true, headers: { 'Accept-Language': 'en-US,en;q=0.9', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' } });
  if (res.getResponseCode() !== 200) return { error: 'YouTube page not reachable (' + res.getResponseCode() + '); add YT_API_KEY in Script properties', handle: handle };
  const html = res.getContentText();
  const pick = (re) => { const m = html.match(re); return m ? parseCount(m[1]) : null; };
  const videos = pick(/"videosCountText":\{"runs":\[\{"text":"([\d.,]+[KMB]?)"/) || pick(/"content":"([\d.,]+[KMB]?) videos"/) || pick(/([\d.,]+[KMB]?) videos"/);
  const subscribers = pick(/"subscriberCountText":\{[^}]*?"simpleText":"([\d.,]+[KMB]?) subscribers"/) || pick(/"content":"([\d.,]+[KMB]?) subscribers"/) || pick(/([\d.,]+[KMB]?) subscribers"/);
  if (videos == null && subscribers == null) return { error: 'YouTube changed its page; add YT_API_KEY in Script properties for exact counts', handle: handle };
  return { videos: videos, shorts: null, long: null, subscribers: subscribers, handle: handle, source: 'public page (add YT_API_KEY for Shorts / long videos)' };
}

// "1.2K" → 1200, "3,456" → 3456
function parseCount(t) {
  const m = String(t).replace(/,/g, '').match(/^([\d.]+)([KMB]?)$/i);
  if (!m) return null;
  return Math.round(Number(m[1]) * ({ '': 1, K: 1e3, M: 1e6, B: 1e9 })[m[2].toUpperCase()]);
}

function instagramStats(props) {
  const token = props.getProperty('IG_TOKEN');
  const id = props.getProperty('IG_USER_ID');
  if (token && id) {
    const g = 'https://graph.facebook.com/v19.0/';
    const me = getJson(g + id + '?fields=username,media_count,followers_count&access_token=' + token);
    let reels = 0; let url = g + id + '/media?fields=media_product_type&limit=100&access_token=' + token; let pages = 0;
    while (url && pages < 30) {
      const page = getJson(url);
      (page.data || []).forEach((m) => { if (m.media_product_type === 'REELS') reels += 1; });
      url = page.paging && page.paging.next; pages += 1;
    }
    return { posts: me.media_count, reels: reels, followers: me.followers_count, username: me.username };
  }
  const user = props.getProperty('IG_USERNAME') || 'theprimefit_';
  const res = UrlFetchApp.fetch('https://www.instagram.com/api/v1/users/web_profile_info/?username=' + user,
    { muteHttpExceptions: true, headers: { 'x-ig-app-id': '936619743392459', 'User-Agent': 'Mozilla/5.0' } });
  if (res.getResponseCode() !== 200) return { error: 'Instagram refused the public lookup; add IG_TOKEN and IG_USER_ID in Script properties' };
  const u = JSON.parse(res.getContentText()).data.user;
  return { posts: u.edge_owner_to_timeline_media.count, reels: u.edge_felix_video_timeline ? u.edge_felix_video_timeline.count : null, followers: u.edge_followed_by.count, username: user };
}
