const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const http = require('node:http');
const { open, sqlTime } = require('../src/db');
const { verifySignature, parseWebhook } = require('../src/whatsapp');
const { createAgent, normalise, buildPrompt } = require('../src/agent');
const { createService } = require('../src/service');
const { createApp, csvCell } = require('../src/server');

const quiet = { log() {}, warn() {}, error() {} };
const config = {
  agent: { historyLimit: 40 },
  whatsapp: { verifyToken: 'vt', appSecret: '', followupTemplate: '', templateLang: 'en' },
  followup: { enabled: true, maxCount: 3, timeZone: 'Asia/Kolkata', quietStart: 21, quietEnd: 9 },
  dashboard: { user: 'admin', password: '' },
};

function fakeWa() {
  const sent = [];
  return {
    sent, dryRun: false,
    sendText: async (to, body) => { sent.push({ to, body }); return { id: 'wamid.out' + sent.length, status: 'sent' }; },
    sendTemplate: async (to, name, lang, params) => { sent.push({ to, template: name, params }); return { id: 'wamid.t' + sent.length, status: 'sent' }; },
    markRead: () => null,
  };
}

const assessment = (over = {}) => normalise({
  reply: 'Hi! What is your goal?', send_reply: true, sentiment: 'positive', quality: 'warm', score: 55,
  stage: 'engaged', name: 'Priya', interest: 'weight loss diet', city: 'Pune', summary: 'Wants to lose weight.',
  needs_human: false, handoff_reason: '', followup_in_hours: 24, ...over,
});

function setup(agentImpl) {
  const db = open(':memory:');
  const wa = fakeWa();
  const calls = [];
  const agent = async (lead, history, mode) => { calls.push({ lead, history, mode }); return agentImpl(lead, history, mode); };
  const service = createService({ db, wa, agent, config, replyDelayMs: 5, log: quiet });
  return { db, wa, service, calls };
}

const webhook = (from, id, text, name = 'Priya') => ({
  entry: [{ changes: [{ value: {
    contacts: [{ wa_id: from, profile: { name } }],
    messages: [{ from, id, type: 'text', text: { body: text }, timestamp: '1700000000' }],
  } }] }],
});

test('webhook signature verification', () => {
  const body = Buffer.from('{"a":1}');
  const sig = 'sha256=' + crypto.createHmac('sha256', 'secret').update(body).digest('hex');
  assert.equal(verifySignature(body, sig, 'secret'), true);
  assert.equal(verifySignature(body, sig, 'other'), false);
  assert.equal(verifySignature(body, undefined, 'secret'), false);
  assert.equal(verifySignature(body, undefined, ''), true);
});

test('parses text, media, buttons and delivery statuses', () => {
  const p = parseWebhook({ entry: [{ changes: [{ value: {
    contacts: [{ wa_id: '91999', profile: { name: 'Ravi' } }],
    messages: [
      { from: '91999', id: 'a', type: 'image', image: { caption: 'my report' } },
      { from: '91999', id: 'b', type: 'interactive', interactive: { button_reply: { title: 'Yes, call me' } } },
      { from: '91999', id: 'c', type: 'audio' },
      { from: '91999', id: 'd', type: 'reaction', reaction: { emoji: '👍' } },
    ],
    statuses: [{ id: 'x', status: 'read' }],
  } }] }] });
  assert.deepEqual(p.messages.map((m) => m.text), ['[photo] my report', 'Yes, call me', '[voice note]']);
  assert.equal(p.messages[0].name, 'Ravi');
  assert.deepEqual(p.statuses, [{ id: 'x', status: 'read' }]);
});

test('normalise clamps and validates the AI output', () => {
  const a = normalise({ reply: ' hi ', send_reply: true, sentiment: 'angry', quality: 'super', score: 250, stage: 'x', followup_in_hours: -5 });
  assert.equal(a.reply, 'hi');
  assert.equal(a.sentiment, 'neutral');
  assert.equal(a.quality, 'cold');
  assert.equal(a.score, 100);
  assert.equal(a.stage, 'engaged');
  assert.equal(a.followup_in_hours, 0);
  assert.equal(normalise({ reply: '', send_reply: true }).send_reply, false);
});

test('prompt contains the transcript and lead record', () => {
  const p = buildPrompt({ phone: '91999', name: 'Priya', followup_count: 1 },
    [{ direction: 'in', author: 'lead', body: 'PCOS diet chahiye', created_at: '2026-10-01 10:00:00' }], 'followup');
  assert.match(p, /Lead: PCOS diet chahiye/);
  assert.match(p, /follow-up #2/);
});

test('agent sends a structured-output request and parses the JSON', async () => {
  let req;
  const client = { beta: { messages: { create: async (r) => { req = r; return {
    stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(assessment()) }],
  }; } } } };
  const run = createAgent({ model: 'claude-opus-5-5', effort: 'low', client });
  const out = await run({ phone: '1', followup_count: 0 }, [], 'reply');
  assert.equal(out.quality, 'warm');
  assert.equal(req.output_config.format.type, 'json_schema');
  assert.equal(req.fallbacks, 'default');
  assert.match(req.system[0].text, /business_profile/);

  const refusing = createAgent({ model: 'm', effort: 'low', client: { beta: { messages: { create: async () => ({ stop_reason: 'refusal', content: [] }) } } } });
  const r = await refusing({ phone: '1', followup_count: 0, quality: 'hot', score: 80 }, [], 'reply');
  assert.equal(r.send_reply, false);
  assert.equal(r.needs_human, true);
  assert.equal(r.quality, 'hot');
});

test('incoming message: AI replies, lead is scored and chat is stored', async () => {
  const { db, wa, service, calls } = setup(() => assessment());
  service.handleWebhook(parseWebhook(webhook('919876543210', 'wamid.1', 'Hi, I want a diet plan')));
  service.handleWebhook(parseWebhook(webhook('919876543210', 'wamid.2', 'for weight loss')));
  service.handleWebhook(parseWebhook(webhook('919876543210', 'wamid.2', 'for weight loss'))); // Meta retry
  await service.idle();

  assert.equal(calls.length, 1, 'quick messages are answered together');
  assert.equal(calls[0].history.length, 2);
  assert.deepEqual(wa.sent, [{ to: '919876543210', body: 'Hi! What is your goal?' }]);

  const lead = db.getLeadByPhone('919876543210');
  assert.equal(lead.name, 'Priya');
  assert.equal(lead.quality, 'warm');
  assert.equal(lead.sentiment, 'positive');
  assert.equal(lead.score, 55);
  assert.equal(lead.interest, 'weight loss diet');
  assert.ok(lead.next_followup_at > sqlTime());
  const msgs = db.messages(lead.id);
  assert.deepEqual(msgs.map((m) => [m.direction, m.author]), [['in', 'lead'], ['in', 'lead'], ['out', 'bot']]);
});

test('handoff to a human pauses the bot for that lead', async () => {
  const { db, wa, service, calls } = setup(() => assessment({ reply: 'Our team will call you shortly.', needs_human: true, handoff_reason: 'Asked about refund' }));
  service.handleInbound({ from: '911', id: 'm1', text: 'I want a refund' });
  await service.idle();
  const lead = db.getLeadByPhone('911');
  assert.equal(lead.needs_human, 1);
  assert.equal(lead.next_followup_at, null);
  assert.equal(wa.sent.length, 1);
  service.handleInbound({ from: '911', id: 'm2', text: 'hello??' });
  await service.idle();
  assert.equal(calls.length, 1, 'no AI reply while a human is needed');
});

test('follow-ups: AI message inside 24h, template after, stop at max', async () => {
  const { db, wa, service } = setup((lead, h, mode) => assessment({ reply: mode === 'followup' ? 'Just checking in 🙂' : 'Hello', followup_in_hours: 24 }));
  const noon = new Date('2026-10-03T06:30:00Z'); // 12:00 IST

  const lead = db.upsertLead('912');
  db.addMessage(lead.id, { direction: 'in', author: 'lead', body: 'price?' });
  db.updateLead(lead.id, { next_followup_at: '2020-01-01 00:00:00' });
  assert.equal(await service.runFollowups(noon), 1);
  assert.equal(wa.sent.at(-1).body, 'Just checking in 🙂');
  assert.equal(db.getLead(lead.id).followup_count, 1);

  // Window closed and no template configured: skip.
  db.updateLead(lead.id, { last_inbound_at: '2020-01-01 00:00:00', next_followup_at: '2020-01-01 00:00:00' });
  await service.runFollowups(noon);
  assert.equal(wa.sent.length, 1);
  assert.equal(db.getLead(lead.id).next_followup_at, null);

  // With a template configured.
  config.whatsapp.followupTemplate = 'lead_followup';
  try {
    db.updateLead(lead.id, { next_followup_at: '2020-01-01 00:00:00' });
    await service.runFollowups(noon);
    assert.equal(wa.sent.at(-1).template, 'lead_followup');
    assert.equal(db.getLead(lead.id).followup_count, 2);

    // Quiet hours (23:00 IST): nothing is sent.
    db.updateLead(lead.id, { next_followup_at: '2020-01-01 00:00:00' });
    assert.equal(await service.runFollowups(new Date('2026-10-03T17:30:00Z')), 0);

    // Lead replies: sequence resets.
    service.handleInbound({ from: '912', id: 'r1', text: 'ok tell me' });
    await service.idle();
    assert.equal(db.getLead(lead.id).followup_count, 0);

    // Max reached: no more follow-ups.
    db.updateLead(lead.id, { followup_count: 3, next_followup_at: '2020-01-01 00:00:00' });
    assert.equal(await service.runFollowups(noon), 0);
  } finally {
    config.whatsapp.followupTemplate = '';
  }
});

test('HTTP: webhook verify, lead API, CSV export', async () => {
  const { db, wa, service } = setup(() => assessment());
  const server = http.createServer(createApp({ db, wa, service, config }));
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  try {
    let res = await fetch(`${base}/webhook?hub.mode=subscribe&hub.verify_token=vt&hub.challenge=42`);
    assert.equal(await res.text(), '42');
    res = await fetch(`${base}/webhook?hub.mode=subscribe&hub.verify_token=bad&hub.challenge=42`);
    assert.equal(res.status, 403);

    res = await fetch(`${base}/webhook`, { method: 'POST', body: JSON.stringify(webhook('913', 'w1', 'Namaste, "PCOS" diet')) });
    assert.equal(res.status, 200);
    await service.idle();

    res = await fetch(`${base}/api/leads`, { method: 'POST', body: JSON.stringify({ phone: '+91 98765-00000', name: 'Amit', source: 'Instagram' }) });
    assert.equal(res.status, 201);

    const leads = await (await fetch(`${base}/api/leads?quality=warm`)).json();
    assert.deepEqual(leads.map((l) => l.phone), ['913']);
    const { lead, messages } = await (await fetch(`${base}/api/leads/${leads[0].id}`)).json();
    assert.equal(lead.name, 'Priya');
    assert.equal(messages.length, 2);

    res = await fetch(`${base}/api/leads/${lead.id}`, { method: 'PATCH', body: JSON.stringify({ bot_enabled: false, stage: 'converted' }) });
    assert.equal((await res.json()).bot_enabled, 0);

    const stats = await (await fetch(`${base}/api/stats`)).json();
    assert.equal(stats.total, 2);
    assert.equal(stats.stage.converted, 1);

    const bytes = Buffer.from(await (await fetch(`${base}/api/leads.csv`)).arrayBuffer());
    assert.deepEqual([...bytes.subarray(0, 3)], [0xef, 0xbb, 0xbf], 'BOM for Excel');
    const csv = bytes.toString('utf8');
    assert.match(csv, /id,phone,name/);
    assert.match(csv, /""PCOS"" diet/);
    assert.match(csv, /919876500000/);
  } finally {
    server.close();
  }
});

test('dashboard login when a password is set', async () => {
  const { db, wa, service } = setup(() => assessment());
  const cfg = { ...config, dashboard: { user: 'admin', password: 'pw' } };
  const server = http.createServer(createApp({ db, wa, service, config: cfg }));
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  try {
    assert.equal((await fetch(`${base}/api/leads`)).status, 401);
    const auth = { Authorization: 'Basic ' + Buffer.from('admin:pw').toString('base64') };
    assert.equal((await fetch(`${base}/api/leads`, { headers: auth })).status, 200);
    assert.equal((await fetch(`${base}/health`)).status, 200);
  } finally {
    server.close();
  }
});

test('csv cells are escaped', () => {
  assert.equal(csvCell('a,b'), '"a,b"');
  assert.equal(csvCell(null), '');
});
