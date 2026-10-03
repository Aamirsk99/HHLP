// Core logic: incoming messages → AI reply + lead scoring, and scheduled follow-ups.
const { sqlTime } = require('./db');

const HOUR = 3600 * 1000;

function createService({ db, wa, agent, config, replyDelayMs = 4000, log = console }) {
  const timers = new Map(); // leadId → debounce timer
  const running = new Map(); // leadId → promise (one AI turn per lead at a time)

  function applyAssessment(lead, a) {
    return db.updateLead(lead.id, {
      sentiment: a.sentiment,
      quality: a.quality,
      score: a.score,
      stage: a.stage,
      name: a.name || lead.name || null,
      interest: a.interest || lead.interest,
      city: a.city || lead.city,
      summary: a.summary || lead.summary,
      needs_human: a.needs_human ? 1 : lead.needs_human,
      handoff_reason: a.needs_human ? a.handoff_reason : lead.handoff_reason,
      next_followup_at: a.followup_in_hours > 0 && !a.needs_human
        ? sqlTime(new Date(Date.now() + a.followup_in_hours * HOUR)) : null,
    });
  }

  async function send(lead, text, author) {
    try {
      const r = await wa.sendText(lead.phone, text);
      db.addMessage(lead.id, { direction: 'out', author, body: text, waMessageId: r.id, status: r.status });
      return true;
    } catch (err) {
      log.error(`Send to ${lead.phone} failed: ${err.message}`);
      db.addMessage(lead.id, { direction: 'out', author, body: text, status: 'failed' });
      return false;
    }
  }

  // One AI turn for a lead: read the whole chat, reply, update the lead record.
  async function respond(leadId) {
    const lead = db.getLead(leadId);
    if (!lead || !lead.bot_enabled || lead.needs_human) return null;
    const history = db.messages(leadId, config.agent.historyLimit);
    const a = await agent(lead, history, 'reply');
    const updated = applyAssessment(lead, a);
    if (a.send_reply) await send(updated, a.reply, 'bot');
    return a;
  }

  function queueRespond(leadId) {
    clearTimeout(timers.get(leadId));
    // Wait a few seconds so several quick messages get one combined reply.
    timers.set(leadId, setTimeout(() => {
      timers.delete(leadId);
      const prev = running.get(leadId) || Promise.resolve();
      const next = prev.then(() => respond(leadId)).catch((err) => {
        log.error(`Agent failed for lead ${leadId}: ${err.message}`);
      }).finally(() => { if (running.get(leadId) === next) running.delete(leadId); });
      running.set(leadId, next);
    }, replyDelayMs));
  }

  function handleInbound({ from, name, id, text, referral }) {
    const lead = db.upsertLead(from, { name, source: referral ? `ad: ${referral}` : 'whatsapp' });
    if (!db.addMessage(lead.id, { direction: 'in', author: 'lead', body: text, waMessageId: id })) return lead; // duplicate
    // The lead replied: reset the follow-up sequence.
    db.updateLead(lead.id, { followup_count: 0, next_followup_at: null, stage: lead.stage === 'lost' ? 'engaged' : lead.stage });
    if (id) wa.markRead(id);
    queueRespond(lead.id);
    return lead;
  }

  function handleWebhook(parsed) {
    for (const s of parsed.statuses) db.setMessageStatus(s.id, s.status);
    for (const m of parsed.messages) handleInbound(m);
  }

  function inQuietHours(now = new Date()) {
    const { timeZone, quietStart, quietEnd } = config.followup;
    const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone }).format(now));
    return quietStart > quietEnd ? hour >= quietStart || hour < quietEnd : hour >= quietStart && hour < quietEnd;
  }

  async function followUp(lead) {
    const lastIn = lead.last_inbound_at ? new Date(lead.last_inbound_at.replace(' ', 'T') + 'Z') : null;
    const windowOpen = lastIn && Date.now() - lastIn.getTime() < 23.5 * HOUR;
    const count = lead.followup_count + 1;

    if (windowOpen) {
      // Inside WhatsApp's 24-hour window: a free-form, personalised follow-up.
      const a = await agent(lead, db.messages(lead.id, config.agent.historyLimit), 'followup');
      applyAssessment(lead, a);
      if (!a.send_reply) return db.updateLead(lead.id, { next_followup_at: null });
      await send(lead, a.reply, 'followup');
      return db.updateLead(lead.id, {
        followup_count: count,
        next_followup_at: sqlTime(new Date(Date.now() + Math.max(a.followup_in_hours, 24) * HOUR)),
      });
    }

    // Window closed: WhatsApp only allows an approved template.
    const { followupTemplate, templateLang } = config.whatsapp;
    if (!followupTemplate) {
      log.warn(`Lead ${lead.phone}: 24h window closed and no WHATSAPP_FOLLOWUP_TEMPLATE set; follow-up skipped.`);
      return db.updateLead(lead.id, { next_followup_at: null });
    }
    try {
      const r = await wa.sendTemplate(lead.phone, followupTemplate, templateLang, [lead.name || 'there']);
      db.addMessage(lead.id, { direction: 'out', author: 'followup', body: `[template: ${followupTemplate}]`, waMessageId: r.id, status: r.status });
    } catch (err) {
      log.error(`Template follow-up to ${lead.phone} failed: ${err.message}`);
    }
    return db.updateLead(lead.id, {
      followup_count: count,
      next_followup_at: sqlTime(new Date(Date.now() + 48 * HOUR * count)),
    });
  }

  async function runFollowups(now = new Date()) {
    if (!config.followup.enabled || inQuietHours(now)) return 0;
    const due = db.dueFollowups(sqlTime(now), config.followup.maxCount);
    for (const lead of due) {
      if (running.has(lead.id) || timers.has(lead.id)) continue;
      try { await followUp(lead); } catch (err) { log.error(`Follow-up failed for ${lead.phone}: ${err.message}`); }
    }
    return due.length;
  }

  // A team member writes from the dashboard.
  async function sendManual(leadId, text) {
    const lead = db.getLead(leadId);
    if (!lead) throw new Error('Lead not found');
    return send(lead, text, 'human');
  }

  // Start a conversation with a lead from another source (form, call, ad sheet) using an approved template.
  async function sendTemplateToLead(leadId, template, params) {
    const lead = db.getLead(leadId);
    const r = await wa.sendTemplate(lead.phone, template, config.whatsapp.templateLang, params);
    db.addMessage(lead.id, { direction: 'out', author: 'human', body: `[template: ${template}]`, waMessageId: r.id, status: r.status });
    return r;
  }

  // Wait for every pending AI turn (used by tests and on shutdown).
  async function idle() {
    while (timers.size || running.size) {
      await Promise.all([...running.values()]);
      if (timers.size) await new Promise((r) => setTimeout(r, replyDelayMs + 5));
    }
  }

  return { handleWebhook, handleInbound, respond, runFollowups, inQuietHours, sendManual, sendTemplateToLead, idle };
}

module.exports = { createService };
