// All settings come from environment variables (see .env.example).
const fs = require('node:fs');
const path = require('node:path');

// Load .env if present (no dependency needed).
const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const env = process.env;
const num = (v, d) => (v === undefined || v === '' ? d : Number(v));

module.exports = {
  port: num(env.PORT, 3000),
  dbPath: env.DB_PATH || path.join(__dirname, '..', 'data', 'leads.db'),

  // WhatsApp Cloud API (Meta). Leave WHATSAPP_TOKEN empty for dry-run mode (messages are logged, not sent).
  whatsapp: {
    token: env.WHATSAPP_TOKEN || '',
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID || '',
    verifyToken: env.WHATSAPP_VERIFY_TOKEN || 'hindivine-verify',
    appSecret: env.WHATSAPP_APP_SECRET || '',
    apiVersion: env.WHATSAPP_API_VERSION || 'v21.0',
    // Approved template used for follow-ups after the 24-hour customer-service window closes.
    followupTemplate: env.WHATSAPP_FOLLOWUP_TEMPLATE || '',
    templateLang: env.WHATSAPP_TEMPLATE_LANG || 'en',
  },

  agent: {
    model: env.AGENT_MODEL || 'claude-opus-5-5',
    effort: env.AGENT_EFFORT || 'low',
    historyLimit: num(env.AGENT_HISTORY_LIMIT, 40),
  },

  followup: {
    enabled: env.FOLLOWUP_ENABLED !== 'false',
    maxCount: num(env.FOLLOWUP_MAX, 3),
    checkEveryMs: num(env.FOLLOWUP_CHECK_SECONDS, 60) * 1000,
    // Quiet hours in the business time zone: no follow-ups are sent between these hours.
    timeZone: env.BUSINESS_TZ || 'Asia/Kolkata',
    quietStart: num(env.QUIET_START_HOUR, 21),
    quietEnd: num(env.QUIET_END_HOUR, 9),
  },

  dashboard: {
    user: env.DASHBOARD_USER || 'admin',
    password: env.DASHBOARD_PASSWORD || '',
  },
};
