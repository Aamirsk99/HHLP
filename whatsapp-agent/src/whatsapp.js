// WhatsApp Cloud API (Meta): send messages, verify and parse webhooks.
const crypto = require('node:crypto');

function createClient({ token, phoneNumberId, apiVersion }) {
  const dryRun = !token || !phoneNumberId;

  async function post(payload) {
    if (dryRun) {
      console.log('[dry-run] WhatsApp →', JSON.stringify(payload));
      return { id: null, status: 'dry-run' };
    }
    const res = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', ...payload }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(`WhatsApp API ${res.status}: ${data.error?.message || 'unknown error'}`);
      err.code = data.error?.code;
      throw err;
    }
    return { id: data.messages?.[0]?.id || null, status: 'sent' };
  }

  return {
    dryRun,
    sendText: (to, body) => post({ to, type: 'text', text: { body, preview_url: true } }),
    // Business-initiated messages outside the 24-hour window must use an approved template.
    sendTemplate: (to, name, lang, params = []) => post({
      to,
      type: 'template',
      template: {
        name,
        language: { code: lang },
        components: params.length
          ? [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text: String(text) })) }]
          : undefined,
      },
    }),
    markRead: (messageId) => (dryRun ? null : post({ status: 'read', message_id: messageId }).catch(() => null)),
  };
}

function verifySignature(rawBody, signatureHeader, appSecret) {
  if (!appSecret) return true; // not configured: accept (set WHATSAPP_APP_SECRET in production)
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Turns any incoming message type into text we can store and show the AI.
function messageText(m) {
  switch (m.type) {
    case 'text': return m.text?.body || '';
    case 'button': return m.button?.text || '';
    case 'interactive':
      return m.interactive?.button_reply?.title || m.interactive?.list_reply?.title || '[interactive reply]';
    case 'image': return `[photo]${m.image?.caption ? ' ' + m.image.caption : ''}`;
    case 'video': return `[video]${m.video?.caption ? ' ' + m.video.caption : ''}`;
    case 'document': return `[document: ${m.document?.filename || 'file'}]${m.document?.caption ? ' ' + m.document.caption : ''}`;
    case 'audio': return '[voice note]';
    case 'sticker': return '[sticker]';
    case 'location': return `[location: ${m.location?.name || ''} ${m.location?.address || ''} (${m.location?.latitude}, ${m.location?.longitude})]`.replace(/\s+/g, ' ');
    case 'contacts': return '[shared a contact]';
    case 'reaction': return m.reaction?.emoji ? `[reacted ${m.reaction.emoji}]` : '[removed reaction]';
    default: return `[${m.type || 'unsupported'} message]`;
  }
}

// Returns { messages: [{from, name, id, text, timestamp, referral}], statuses: [{id, status}] }
function parseWebhook(body) {
  const out = { messages: [], statuses: [] };
  for (const entry of body?.entry || []) {
    for (const change of entry.changes || []) {
      const v = change.value || {};
      const names = Object.fromEntries((v.contacts || []).map((c) => [c.wa_id, c.profile?.name]));
      for (const m of v.messages || []) {
        if (m.type === 'reaction') continue; // reactions don't need a reply
        out.messages.push({
          from: m.from,
          name: names[m.from] || null,
          id: m.id,
          text: messageText(m),
          timestamp: m.timestamp,
          // Click-to-WhatsApp ads carry the ad details here.
          referral: m.referral ? (m.referral.headline || m.referral.source_url || 'ad') : null,
        });
      }
      for (const s of v.statuses || []) out.statuses.push({ id: s.id, status: s.status });
    }
  }
  return out;
}

module.exports = { createClient, verifySignature, parseWebhook, messageText };
