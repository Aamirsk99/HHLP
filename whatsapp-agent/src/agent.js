// The AI agent: writes the WhatsApp reply and scores the lead in one Claude call.
const fs = require('node:fs');
const path = require('node:path');
const Anthropic = require('@anthropic-ai/sdk');

const PROFILE_PATH = path.join(__dirname, '..', 'business-profile.md');

const STAGES = ['new', 'engaged', 'interested', 'booked', 'converted', 'lost', 'not_relevant'];
const SENTIMENTS = ['positive', 'neutral', 'negative'];
const QUALITIES = ['hot', 'warm', 'cold', 'junk'];

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['reply', 'send_reply', 'sentiment', 'quality', 'score', 'stage', 'name', 'interest', 'city',
    'summary', 'needs_human', 'handoff_reason', 'followup_in_hours'],
  properties: {
    reply: { type: 'string', description: 'The WhatsApp message to send. Empty if send_reply is false.' },
    send_reply: { type: 'boolean', description: 'False when no reply is needed (e.g. lead just said "ok 👍" to a closing message).' },
    sentiment: { type: 'string', enum: SENTIMENTS },
    quality: { type: 'string', enum: QUALITIES },
    score: { type: 'integer', description: 'Lead score 0-100: how likely this lead is to buy.' },
    stage: { type: 'string', enum: STAGES },
    name: { type: 'string', description: "Lead's name if they shared it, else empty." },
    interest: { type: 'string', description: 'Short phrase: what they want, e.g. "PCOS diet plan". Empty if unknown.' },
    city: { type: 'string', description: 'City if mentioned, else empty.' },
    summary: { type: 'string', description: '1-3 sentences summarising the whole conversation and lead status for the sales team.' },
    needs_human: { type: 'boolean', description: 'True if a human must take over.' },
    handoff_reason: { type: 'string', description: 'Why a human is needed, else empty.' },
    followup_in_hours: { type: 'integer', description: 'Hours until a follow-up should be sent if the lead goes quiet. 0 = no follow-up.' },
  },
};

const INSTRUCTIONS = `You are the WhatsApp assistant for the business described in the profile below. You chat with leads (potential customers) who messaged us or whom we are following up with. You have two jobs on every turn:

1. Write the next WhatsApp message to the lead.
2. Assess the lead for our CRM.

## Writing the message
- Sound like a friendly, professional team member on WhatsApp: short (usually 1-4 lines), warm, no long paragraphs, at most one or two emojis.
- Reply in the lead's language and script (English, Hindi, Hinglish, Marathi, etc.), matching how they write.
- Move the conversation toward the next step: understand their goal, collect the details listed in the profile, share the relevant plan, then help them book or pay.
- Ask one or two questions at a time, never a long form.
- Answer only from the business profile. If something isn't there (a price, a timing, a discount), say the team will confirm shortly and set needs_human to true. Never invent prices, offers, links or results.
- Don't diagnose or prescribe. For medical questions, give general guidance at most and say the dietitian will review their case.
- If they ask for a human, are angry, report a complaint or refund, mention an emergency, or the request is outside the profile, write a short holding reply and set needs_human to true.
- If they ask to stop or not be contacted, apologise briefly, confirm they won't be messaged again, set stage to "lost" and followup_in_hours to 0.
- Never say you are an AI unless they directly ask; if they ask, say honestly that you are the business's automated assistant and a team member is available.
- Set send_reply to false only when a reply would be pointless (e.g. the lead just said "ok" or "thanks" to a closing message).

## Assessing the lead
- sentiment: the lead's current attitude toward us (positive / neutral / negative).
- quality: hot = clear need plus intent to buy soon (asks price, how to pay or start, shares details); warm = interested but undecided; cold = low engagement, just browsing, or "later"; junk = spam, wrong number, job seekers, vendors, or not a possible customer.
- score: 0-100 purchase likelihood, consistent with quality (hot 70-100, warm 40-69, cold 10-39, junk 0-9).
- stage: new (no real exchange yet), engaged (talking), interested (wants a plan or price), booked (agreed to start or book), converted (paid or started), lost (declined or opted out), not_relevant (junk).
- followup_in_hours: if the lead might go quiet, when a gentle follow-up should be sent: 2-6 for hot, 24 for warm, 48-72 for cold, 0 for converted, lost, not_relevant, or when we are waiting on our team.
- summary: written for the sales team. Include the need, key details shared, objections, and next step.

Base everything on the whole conversation, not just the last message.`;

let cachedProfile = null;
function businessProfile() {
  if (cachedProfile === null) cachedProfile = fs.existsSync(PROFILE_PATH) ? fs.readFileSync(PROFILE_PATH, 'utf8') : '';
  return cachedProfile;
}

const WHO = { lead: 'Lead', bot: 'Us (assistant)', human: 'Us (team member)', followup: 'Us (follow-up)' };

function transcript(messages) {
  if (!messages.length) return '(no messages yet)';
  return messages.map((m) => `[${m.created_at}] ${WHO[m.author] || (m.direction === 'in' ? 'Lead' : 'Us')}: ${m.body}`).join('\n');
}

function buildPrompt(lead, messages, mode) {
  const known = {
    phone: lead.phone, name: lead.name, source: lead.source, stage: lead.stage, quality: lead.quality,
    score: lead.score, interest: lead.interest, city: lead.city, followups_sent: lead.followup_count,
    previous_summary: lead.summary,
  };
  const task = mode === 'followup'
    ? `The lead has not replied since our last message. Write follow-up #${lead.followup_count + 1}: short, friendly, refers to what they were interested in, gives one easy reason or question to reply. Don't repeat earlier messages or pressure them. If following up would be inappropriate (they declined, opted out, or are junk), set send_reply to false.`
    : 'Reply to the lead\'s latest message(s).';
  return `Current time (UTC): ${new Date().toISOString()}

<lead_record>
${JSON.stringify(known, null, 2)}
</lead_record>

<conversation>
${transcript(messages)}
</conversation>

Task: ${task}`;
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(n) || 0)));

function normalise(out) {
  return {
    reply: String(out.reply || '').trim(),
    send_reply: Boolean(out.send_reply) && String(out.reply || '').trim() !== '',
    sentiment: SENTIMENTS.includes(out.sentiment) ? out.sentiment : 'neutral',
    quality: QUALITIES.includes(out.quality) ? out.quality : 'cold',
    score: clamp(out.score, 0, 100),
    stage: STAGES.includes(out.stage) ? out.stage : 'engaged',
    name: String(out.name || '').trim(),
    interest: String(out.interest || '').trim(),
    city: String(out.city || '').trim(),
    summary: String(out.summary || '').trim(),
    needs_human: Boolean(out.needs_human),
    handoff_reason: String(out.handoff_reason || '').trim(),
    followup_in_hours: clamp(out.followup_in_hours, 0, 24 * 14),
  };
}

function createAgent({ model, effort, client = new Anthropic() } = {}) {
  return async function run(lead, messages, mode = 'reply') {
    const response = await client.beta.messages.create({
      model,
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort, format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
      system: [
        { type: 'text', text: `${INSTRUCTIONS}\n\n<business_profile>\n${businessProfile()}\n</business_profile>`, cache_control: { type: 'ephemeral' } },
      ],
      messages: [{ role: 'user', content: buildPrompt(lead, messages, mode) }],
    });

    if (response.stop_reason === 'refusal') {
      return normalise({ ...lead, send_reply: false, needs_human: true, handoff_reason: 'The AI declined to answer this conversation; please reply manually.' });
    }
    const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    try {
      return normalise(JSON.parse(text));
    } catch {
      return normalise({ ...lead, send_reply: false, needs_human: true, handoff_reason: `AI response could not be read (stop: ${response.stop_reason}).` });
    }
  };
}

module.exports = { createAgent, buildPrompt, normalise, OUTPUT_SCHEMA, STAGES, SENTIMENTS, QUALITIES };
