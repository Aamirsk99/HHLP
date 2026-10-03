// HTTP server: WhatsApp webhook, lead dashboard and JSON API.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');
const { open } = require('./db');
const whatsapp = require('./whatsapp');
const { createAgent } = require('./agent');
const { createService } = require('./service');

const DASHBOARD = path.join(__dirname, '..', 'public', 'index.html');
const CSV_COLUMNS = ['id', 'phone', 'name', 'source', 'stage', 'quality', 'score', 'sentiment', 'interest', 'city',
  'summary', 'notes', 'needs_human', 'handoff_reason', 'bot_enabled', 'followup_count', 'next_followup_at',
  'last_inbound_at', 'last_outbound_at', 'created_at', 'message_count', 'chat'];

const normalisePhone = (p) => String(p || '').replace(/\D/g, '');

function csvCell(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function readBody(req, limit = 1e6) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('Body too large')); req.destroy(); } else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function createApp({ db, wa, service, config: cfg }) {
  const json = (res, code, data) => {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  };

  function authorised(req) {
    if (!cfg.dashboard.password) return true;
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Basic' || !token) return false;
    const [user, ...rest] = Buffer.from(token, 'base64').toString().split(':');
    return user === cfg.dashboard.user && rest.join(':') === cfg.dashboard.password;
  }

  return async function handler(req, res) {
    const url = new URL(req.url, 'http://localhost');
    const p = url.pathname;
    try {
      // --- WhatsApp webhook (Meta calls these; no dashboard login) ---
      if (p === '/webhook' && req.method === 'GET') {
        const ok = url.searchParams.get('hub.mode') === 'subscribe'
          && url.searchParams.get('hub.verify_token') === cfg.whatsapp.verifyToken;
        res.writeHead(ok ? 200 : 403);
        return res.end(ok ? url.searchParams.get('hub.challenge') : 'Forbidden');
      }
      if (p === '/webhook' && req.method === 'POST') {
        const raw = await readBody(req);
        if (!whatsapp.verifySignature(raw, req.headers['x-hub-signature-256'], cfg.whatsapp.appSecret)) {
          res.writeHead(401);
          return res.end('Bad signature');
        }
        res.writeHead(200);
        res.end('OK'); // acknowledge fast; Meta retries slow webhooks
        service.handleWebhook(whatsapp.parseWebhook(JSON.parse(raw.toString() || '{}')));
        return;
      }
      if (p === '/health') return json(res, 200, { ok: true, dryRun: wa.dryRun });

      // --- Dashboard and API (login if DASHBOARD_PASSWORD is set) ---
      if (!authorised(req)) {
        res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Leads"' });
        return res.end('Login required');
      }
      if (p === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(fs.readFileSync(DASHBOARD));
      }
      if (p === '/api/stats') return json(res, 200, { ...db.stats(), dryRun: wa.dryRun });

      if (p === '/api/leads' && req.method === 'GET') {
        const f = Object.fromEntries(url.searchParams);
        return json(res, 200, db.listLeads({ ...f, needsHuman: f.needs_human === '1' }));
      }
      if (p === '/api/leads' && req.method === 'POST') {
        const b = JSON.parse((await readBody(req)).toString() || '{}');
        const phone = normalisePhone(b.phone);
        if (phone.length < 8) return json(res, 400, { error: 'Enter the phone number with country code, e.g. 919876543210' });
        const lead = db.upsertLead(phone, { name: b.name, source: b.source || 'manual' });
        return json(res, 201, db.updateLead(lead.id, { interest: b.interest, notes: b.notes, city: b.city }));
      }
      if (p === '/api/leads.csv') {
        const rows = db.listLeads(Object.fromEntries(url.searchParams)).map((l) => ({
          ...l,
          chat: db.messages(l.id).map((m) => `${m.created_at} ${m.direction === 'in' ? 'Lead' : 'Us'}: ${m.body}`).join('\n'),
        }));
        const csv = [CSV_COLUMNS.join(','), ...rows.map((r) => CSV_COLUMNS.map((c) => csvCell(r[c])).join(','))].join('\r\n');
        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
        });
        return res.end('﻿' + csv); // BOM so Excel shows Hindi correctly
      }

      const m = p.match(/^\/api\/leads\/(\d+)(?:\/(send|template|reply))?$/);
      if (m) {
        const id = Number(m[1]);
        const lead = db.getLead(id);
        if (!lead) return json(res, 404, { error: 'Lead not found' });
        const action = m[2];
        if (!action && req.method === 'GET') return json(res, 200, { lead, messages: db.messages(id) });
        if (!action && req.method === 'PATCH') {
          const b = JSON.parse((await readBody(req)).toString() || '{}');
          if (b.needs_human === 0 || b.needs_human === false) b.handoff_reason = null;
          for (const k of ['bot_enabled', 'needs_human']) if (k in b) b[k] = b[k] ? 1 : 0;
          return json(res, 200, db.updateLead(id, b));
        }
        if (!action && req.method === 'DELETE') { db.deleteLead(id); return json(res, 200, { ok: true }); }
        if (action === 'send' && req.method === 'POST') {
          const b = JSON.parse((await readBody(req)).toString() || '{}');
          if (!b.text || !b.text.trim()) return json(res, 400, { error: 'Message is empty' });
          const ok = await service.sendManual(id, b.text.trim());
          return json(res, ok ? 200 : 502, ok ? { ok } : { error: 'WhatsApp did not accept the message (outside the 24-hour window? use a template).' });
        }
        if (action === 'template' && req.method === 'POST') {
          const b = JSON.parse((await readBody(req)).toString() || '{}');
          const template = b.template || cfg.whatsapp.followupTemplate;
          if (!template) return json(res, 400, { error: 'No template name given' });
          await service.sendTemplateToLead(id, template, b.params || [lead.name || 'there']);
          return json(res, 200, { ok: true });
        }
        if (action === 'reply' && req.method === 'POST') {
          // Ask the AI to answer now (e.g. after turning the bot back on).
          return json(res, 200, await service.respond(id));
        }
      }
      json(res, 404, { error: 'Not found' });
    } catch (err) {
      console.error(err);
      if (!res.headersSent) json(res, 500, { error: err.message });
    }
  };
}

function main() {
  const db = open(config.dbPath);
  const wa = whatsapp.createClient(config.whatsapp);
  const agent = createAgent(config.agent);
  const service = createService({ db, wa, agent, config });
  const server = http.createServer(createApp({ db, wa, service, config }));
  server.listen(config.port, () => {
    console.log(`WhatsApp lead agent on http://localhost:${config.port}  (webhook: /webhook)`);
    if (wa.dryRun) console.log('Dry-run mode: WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID not set, replies are only logged.');
    if (!config.dashboard.password) console.log('Warning: DASHBOARD_PASSWORD is not set, the dashboard is open to anyone who can reach it.');
  });
  setInterval(() => service.runFollowups().catch((e) => console.error(e)), config.followup.checkEveryMs);
  const stop = async () => { server.close(); await service.idle(); db.close(); process.exit(0); };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

if (require.main === module) main();

module.exports = { createApp, csvCell, normalisePhone };
