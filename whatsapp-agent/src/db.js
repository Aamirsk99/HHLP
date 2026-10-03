// Lead database (SQLite, built into Node 22.13+).
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS leads (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  phone            TEXT NOT NULL UNIQUE,
  name             TEXT,
  source           TEXT DEFAULT 'whatsapp',
  stage            TEXT DEFAULT 'new',        -- new | engaged | interested | booked | converted | lost | not_relevant
  sentiment        TEXT DEFAULT 'neutral',    -- positive | neutral | negative
  quality          TEXT DEFAULT 'unknown',    -- hot | warm | cold | junk | unknown
  score            INTEGER DEFAULT 0,         -- 0-100 lead score
  interest         TEXT,                      -- what the lead wants (e.g. "weight loss diet chart")
  city             TEXT,
  summary          TEXT,                      -- one-paragraph summary of the conversation
  notes            TEXT,                      -- your own notes
  bot_enabled      INTEGER DEFAULT 1,         -- 0 = a human has taken over
  needs_human      INTEGER DEFAULT 0,
  handoff_reason   TEXT,
  followup_count   INTEGER DEFAULT 0,
  next_followup_at TEXT,
  last_inbound_at  TEXT,
  last_outbound_at TEXT,
  created_at       TEXT DEFAULT (datetime('now')),
  updated_at       TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS messages (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id       INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  direction     TEXT NOT NULL,                -- in | out
  author        TEXT DEFAULT 'lead',          -- lead | bot | human | followup
  body          TEXT NOT NULL,
  wa_message_id TEXT UNIQUE,
  status        TEXT,                         -- sent | delivered | read | failed | dry-run
  created_at    TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_messages_lead ON messages(lead_id, id);
CREATE INDEX IF NOT EXISTS idx_leads_followup ON leads(next_followup_at);
`;

const UPDATABLE = new Set([
  'name', 'source', 'stage', 'sentiment', 'quality', 'score', 'interest', 'city', 'summary', 'notes',
  'bot_enabled', 'needs_human', 'handoff_reason', 'followup_count', 'next_followup_at',
  'last_inbound_at', 'last_outbound_at',
]);

// SQLite datetime('now') format, so string comparison works.
const sqlTime = (d = new Date()) => d.toISOString().replace('T', ' ').slice(0, 19);

function open(dbPath) {
  if (dbPath !== ':memory:') fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);

  const api = {
    raw: db,
    sqlTime,

    getLead: (id) => db.prepare('SELECT * FROM leads WHERE id = ?').get(id),
    getLeadByPhone: (phone) => db.prepare('SELECT * FROM leads WHERE phone = ?').get(phone),

    upsertLead(phone, fields = {}) {
      let lead = api.getLeadByPhone(phone);
      if (!lead) {
        db.prepare('INSERT INTO leads (phone, name, source) VALUES (?, ?, ?)').run(
          phone, fields.name || null, fields.source || 'whatsapp');
        lead = api.getLeadByPhone(phone);
      } else if (fields.name && !lead.name) {
        lead = api.updateLead(lead.id, { name: fields.name });
      }
      return lead;
    },

    updateLead(id, fields) {
      const keys = Object.keys(fields).filter((k) => UPDATABLE.has(k) && fields[k] !== undefined);
      if (keys.length) {
        const sets = keys.map((k) => `${k} = ?`).join(', ');
        db.prepare(`UPDATE leads SET ${sets}, updated_at = datetime('now') WHERE id = ?`)
          .run(...keys.map((k) => fields[k]), id);
      }
      return api.getLead(id);
    },

    deleteLead: (id) => db.prepare('DELETE FROM leads WHERE id = ?').run(id),

    // Returns false when this WhatsApp message id was already stored (webhook retries).
    addMessage(leadId, { direction, author, body, waMessageId = null, status = null }) {
      const r = db.prepare(
        'INSERT OR IGNORE INTO messages (lead_id, direction, author, body, wa_message_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      ).run(leadId, direction, author, body, waMessageId, status);
      if (!r.changes) return false;
      const now = sqlTime();
      api.updateLead(leadId, direction === 'in' ? { last_inbound_at: now } : { last_outbound_at: now });
      return true;
    },

    setMessageStatus: (waMessageId, status) =>
      db.prepare('UPDATE messages SET status = ? WHERE wa_message_id = ?').run(status, waMessageId),

    messages: (leadId, limit = 500) =>
      db.prepare('SELECT * FROM (SELECT * FROM messages WHERE lead_id = ? ORDER BY id DESC LIMIT ?) ORDER BY id')
        .all(leadId, limit),

    listLeads({ q, quality, sentiment, stage, needsHuman } = {}) {
      const where = [];
      const args = [];
      if (q) {
        where.push('(phone LIKE ? OR name LIKE ? OR interest LIKE ? OR summary LIKE ? OR city LIKE ?)');
        args.push(...Array(5).fill(`%${q}%`));
      }
      if (quality) { where.push('quality = ?'); args.push(quality); }
      if (sentiment) { where.push('sentiment = ?'); args.push(sentiment); }
      if (stage) { where.push('stage = ?'); args.push(stage); }
      if (needsHuman) where.push('needs_human = 1');
      const sql = `SELECT l.*, (SELECT COUNT(*) FROM messages m WHERE m.lead_id = l.id) AS message_count,
        (SELECT body FROM messages m WHERE m.lead_id = l.id ORDER BY id DESC LIMIT 1) AS last_message
        FROM leads l ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY COALESCE(l.last_inbound_at, l.created_at) DESC`;
      return db.prepare(sql).all(...args);
    },

    stats() {
      const count = (col) => Object.fromEntries(
        db.prepare(`SELECT ${col} AS k, COUNT(*) AS n FROM leads GROUP BY ${col}`).all().map((r) => [r.k, r.n]));
      return {
        total: db.prepare('SELECT COUNT(*) AS n FROM leads').get().n,
        messages: db.prepare('SELECT COUNT(*) AS n FROM messages').get().n,
        needsHuman: db.prepare('SELECT COUNT(*) AS n FROM leads WHERE needs_human = 1').get().n,
        avgScore: Math.round(db.prepare('SELECT AVG(score) AS a FROM leads').get().a || 0),
        quality: count('quality'),
        sentiment: count('sentiment'),
        stage: count('stage'),
      };
    },

    dueFollowups(now = sqlTime(), maxCount = 3) {
      return db.prepare(`SELECT * FROM leads WHERE next_followup_at IS NOT NULL AND next_followup_at <= ?
        AND bot_enabled = 1 AND needs_human = 0 AND followup_count < ?
        AND stage NOT IN ('converted', 'lost', 'not_relevant') ORDER BY next_followup_at`).all(now, maxCount);
    },

    close: () => db.close(),
  };
  return api;
}

module.exports = { open, sqlTime };
