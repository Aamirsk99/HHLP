# Hindivine WhatsApp Lead Agent

An AI agent on your WhatsApp Business number that:

- **Replies to every lead** within seconds, in the lead's own language (English, Hindi, Hinglish, Marathi and others). It answers from your [`business-profile.md`](business-profile.md), collects the lead's details and moves them toward booking.
- **Sends follow-ups** when a lead goes quiet: a personalised AI message inside WhatsApp's 24-hour window, then your approved template. It sends at most 3 follow-ups, and none during quiet hours (9 pm–9 am IST).
- **Saves every lead in a database** with the full chat and an AI assessment, updated after each message:
  - **Quality:** hot / warm / cold / junk, plus a **score from 0 to 100**.
  - **Sentiment:** positive / neutral / negative.
  - **Stage:** new → engaged → interested → booked → converted, or lost / not relevant.
  - **Details:** name, interest (e.g. "PCOS diet plan"), city, and a summary for your sales team.
- **Hands over to a human** when needed: refunds, complaints, a request for a person, prices not in your profile, or medical questions. The lead is flagged **needs human**, the bot pauses for that lead, and a short holding reply is sent.
- **Dashboard** at `http://your-server:3000`:
  - Search and filter leads.
  - Read each chat.
  - Reply as a team member.
  - Pause or resume the bot per lead.
  - Edit the quality or stage.
  - Add leads from other sources.
  - **Export everything to CSV/Excel**, chats included.

## Setup

Needs **Node.js 22.13+** and a public HTTPS URL (any VPS, Render, Railway, or `ngrok http 3000` for testing).

```sh
cd whatsapp-agent
npm install
cp .env.example .env      # then fill it in
npm start
```

1. **Claude API key:** create one at console.anthropic.com and put it in `ANTHROPIC_API_KEY`.
2. **WhatsApp Cloud API** (developers.facebook.com → create a *Business* app → add *WhatsApp*):
   - Copy the **Phone number ID** and a **permanent access token** (from a System User in Business Settings) into `.env`.
   - Under *WhatsApp → Configuration → Webhook*:
     - Set the callback URL to `https://your-domain/webhook`.
     - Set the verify token to the value of `WHATSAPP_VERIFY_TOKEN`.
     - Subscribe to the **messages** field.
   - Copy the **App secret** into `WHATSAPP_APP_SECRET`, so fake webhooks are rejected.
3. **Follow-up template:** in WhatsApp Manager, create and get approved a *Utility* or *Marketing* template, e.g. `lead_followup`:
   > Hi {{1}}, just checking in on your diet plan enquiry with Hindivine. Would you like us to share the details? Reply here anytime 🙂

   Put its name in `WHATSAPP_FOLLOWUP_TEMPLATE`.
4. **Edit [`business-profile.md`](business-profile.md)** with your real plans, prices, links and timings. The agent never invents prices; anything missing goes to a human.
5. Set `DASHBOARD_PASSWORD` and open the dashboard.

Without `WHATSAPP_TOKEN` the agent runs in **dry-run** mode: replies are printed in the console instead of being sent.

## How it works

| Step | What happens |
| --- | --- |
| Lead sends a message | Meta calls `/webhook`. The message is stored, and the lead is created if new. Click-to-WhatsApp ad leads keep the ad name as their source. |
| ~4 seconds later | Several quick messages get one combined answer. Claude reads the whole chat plus your business profile and returns the reply and the assessment as one JSON object. |
| Reply sent | The lead record is updated: quality, score, sentiment, stage, summary, and the next follow-up time (hot: 2–6 h, warm: 24 h, cold: 48–72 h). |
| Lead goes quiet | Every minute the follow-up scheduler checks for due leads. Inside 24 h it sends an AI message; after that, the template. A reply from the lead resets the sequence. |
| Needs a human | The lead is flagged in the dashboard and the bot stops replying to them. Click **Mark handled** or **Turn bot on** to resume. |

## Files

| Path | Purpose |
| --- | --- |
| `business-profile.md` | What the agent knows about your business (edit this) |
| `src/agent.js` | Claude prompt, reply + lead-scoring schema |
| `src/service.js` | Incoming messages, replies, follow-ups, human handoff |
| `src/whatsapp.js` | WhatsApp Cloud API sending, webhook parsing and signature check |
| `src/db.js` | SQLite database: `leads` and `messages` tables (`data/leads.db`) |
| `src/server.js` | Webhook, dashboard and JSON API |
| `public/index.html` | Dashboard |

**API:** `GET /api/leads?q=&quality=&sentiment=&stage=&needs_human=1`, `GET /api/leads/:id`, `POST /api/leads`, `PATCH /api/leads/:id`, `POST /api/leads/:id/send`, `POST /api/leads/:id/template`, `POST /api/leads/:id/reply`, `GET /api/leads.csv`, `GET /api/stats`.

## Test

```sh
npm test    # uses a fake WhatsApp and a fake AI; nothing is sent
```

## Notes

- WhatsApp rules: you can only send free-form messages within 24 hours of the lead's last message; after that only approved templates. Only message people who contacted you or agreed to be contacted. If a lead asks to stop, the agent marks them **lost** and sends no more follow-ups.
- **Back up `data/leads.db`.** It holds all leads and chats, and it is git-ignored.
- **Cost:** one Claude call per lead reply or AI follow-up. With `AGENT_EFFORT=low` this is fast and inexpensive; raise it to `medium` for more careful replies.
