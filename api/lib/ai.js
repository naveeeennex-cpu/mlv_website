import { GoogleGenerativeAI } from '@google/generative-ai';
import { getConfig } from './config.js';

const MODEL_FALLBACK_CHAIN = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

const MODEL_TIMEOUT_MS = 8000;

let geminiClients = null;

// Collect every configured Gemini key, in priority order:
//   GEMINI_API_KEY (primary), GEMINI_API_KEY_2..5 (backups),
//   and/or GEMINI_API_KEYS as a comma-separated list.
function getGeminiKeys() {
  const keys = [];
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
  for (let i = 2; i <= 5; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`];
    if (k) keys.push(k);
  }
  if (process.env.GEMINI_API_KEYS) {
    for (const k of process.env.GEMINI_API_KEYS.split(',')) keys.push(k);
  }
  return [...new Set(keys.map(k => k.trim()).filter(Boolean))];
}

function getGeminiClients() {
  if (geminiClients) return geminiClients;
  const keys = getGeminiKeys();
  if (!keys.length) console.warn('No GEMINI_API_KEY(s) set — AI features disabled');
  geminiClients = keys.map(k => new GoogleGenerativeAI(k));
  return geminiClients;
}

function hasGemini() {
  return getGeminiClients().length > 0;
}

// Errors where failing over to the next key/model is worth a retry: rate
// limit, quota, overload, timeout, or an auth/permission problem on this key.
function isRetryableGeminiError(err) {
  if (err.name === 'AbortError') return true;
  const m = err.message || '';
  return ['429', '503', 'quota', 'rate', 'RESOURCE_EXHAUSTED', 'UNAVAILABLE',
    'overloaded', 'high demand', 'API key', 'API_KEY', 'permission', '403']
    .some(s => m.includes(s));
}

// Tries every (key × model) combination until one responds. The prompt — and
// therefore the full conversation context — is identical across keys, so a
// failover never loses Priya's memory.
async function generateWithFallback(content, generationConfig = null) {
  const clients = getGeminiClients();
  if (!clients.length) throw new Error('No Gemini API key configured');

  let lastErr = null;
  for (let k = 0; k < clients.length; k++) {
    for (const modelName of MODEL_FALLBACK_CHAIN) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
      try {
        const model = clients[k].getGenerativeModel(
          { model: modelName, ...(generationConfig ? { generationConfig } : {}) },
          { fetchOptions: { signal: controller.signal } },
        );
        const result = await model.generateContent(content);
        clearTimeout(timer);
        return result.response.text();
      } catch (err) {
        clearTimeout(timer);
        lastErr = err;
        if (isRetryableGeminiError(err)) {
          console.warn(`Gemini key #${k + 1} · ${modelName} failed (${err.name === 'AbortError' ? 'timeout' : (err.message || '').slice(0, 120)}); trying next`);
          continue;
        }
        throw err;
      }
    }
  }
  throw new Error(`All Gemini keys/models exhausted${lastErr ? `: ${lastErr.message}` : ''}`);
}

// Tolerant JSON parse for model output — handles stray code fences or prose
// around the object, so a slightly-off response doesn't drop the whole turn.
function parseJsonLoose(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/i, '').trim();
  try { return JSON.parse(cleaned); } catch { /* fall through to extraction */ }
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch { /* give up */ } }
  return null;
}

function buildProductContext(products) {
  const lines = [];
  for (const cat of products) {
    lines.push(`\n## ${cat.name}`);
    for (const p of cat.products) {
      const features = p.features.join(' | ');
      const specs = Object.entries(p.specs || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      const finishes = (p.finishes || []).join(', ');
      // Quote our actual selling price — `mrp` is now the struck-through sticker price.
      const priceDisplay = `₹${Number(p.price).toLocaleString('en-IN')}`;
      lines.push(`- ${p.name} (Code: ${p.code || 'N/A'}) | Price: ${priceDisplay} | Features: ${features} | Specs: ${specs}${finishes ? ` | Finishes: ${finishes}` : ''}`);
    }
  }
  return lines.join('\n');
}

// Persona used when the admin hasn't set an `ai_prompt` in the DB.
const FALLBACK_PROMPT = `You are Priya, a sales executive at {businessName}, a Yale smart lock dealer in Chennai. You're chatting with a potential customer on WhatsApp.

WHO YOU ARE:
You are a real person — a sales executive named Priya. You are NOT a bot. Never say you're an AI or a chatbot. If someone asks "are you a bot?" or "are you human?", say something like "Haha I get that a lot! I'm Priya, very much human 😄 Now tell me what you need!"

HOW YOU TALK:
- MAX 2 sentences for normal replies. Only go longer when explaining a specific product someone asked about.
- Never use bullet points or numbered lists — you're a person texting, not a menu or a form.
- Casual but professional — like a smart friend who knows locks.
- Use emojis naturally, sparingly — one per message max.
- Ask ONE question at a time. Match their energy — short if they're short, detailed if they're curious.
- Never say "How can I assist you today?", "Certainly!", "Of course!", or any robotic filler.
- ONLY mention price when they ask. Never volunteer it.

SALES APPROACH — think like a real salesperson:
- First understand their situation: "Is this for your home or office?", "What kind of door is it?", "Who'll be using it?"
- Use their answers to recommend exactly ONE product that fits — with genuine reasoning, not a list.
- Explain features the human way: not "biometric fingerprint recognition" but "it reads your fingerprint in about a second — works even when your hands are wet."
- Build trust first, then gently push toward a home visit: "Honestly the easiest thing is I send our guy over — he'll show you how it works, takes 45 mins. Want me to set that up?"

PRICE RULES — CRITICAL:
- NEVER mention price first. Build value first, always.
- Only tell the price if they directly ask ("how much", "price", "cost", "rate", "kitna", "evlo", "enna rate").
- Use ONLY the exact price from the product catalog — never guess.
- The FIRST time you share a price, do NOT bundle a discount with it. Share it warmly and stop. Let them react.

DISCOUNT RULES:
{discount_instructions}
- Only bring up a discount AFTER the customer has heard the full price and pushed back on it.
- Pushback signals: "too expensive", "costly", "any discount", "can you reduce", "is that final", "kam karo", "konjam kammi pannunga".
- Make it feel like a personal favour: "Let me see what I can do... I can knock off 5% for you".

LANGUAGE — VERY IMPORTANT:
- Detect the language/script of the customer's message and reply in the SAME language.
- Tamil script → reply in Tamil | Hindi/Devanagari → reply in Hindi
- Tanglish (Tamil in English letters) → reply in Tanglish | Hinglish → reply in Hinglish
- Pure English → English | Mixed Tamil+English → Tanglish
- Always mirror the customer — never switch language on your own.`;

function discountInstructionsFor(stage, pct1, pct2, pct3) {
  return [
    `- Stage 0 (current): NO discount offered yet. When they FIRST ask the price, just share it — no discount in that message. Only offer ${pct1}% off AFTER they push back.`,
    `- Stage 1 (current): ${pct1}% already offered. If still hesitant or they ask for more, offer ${pct2}% now.`,
    `- Stage 2 (current): ${pct2}% already offered. If still hesitant, offer ${pct3}% as the absolute maximum.`,
    `- Stage 3 (current): ${pct3}% already offered. No more discounts — focus on installation ease, warranty, brand reliability.`,
  ][stage] || '';
}

/**
 * The single "brain" of the bot. One Gemini call per customer message.
 * Priya drives the whole conversation — discovery, recommendation, pricing,
 * booking/service detail collection, and (for door locks) the door-thickness
 * → measure → photo escalation. Returns a structured object, or null if AI
 * is unavailable.
 *
 * @param {string} userMessage  the customer's latest message
 * @param {object} client       client config (businessName, products, ...)
 * @param {object} session      persisted session (history, data, flags)
 * @param {object} opts         { isDoorLock: boolean }
 */
export async function chatAgent(userMessage, client, session = {}, opts = {}) {
  if (!hasGemini()) return null;

  const { isDoorLock = false } = opts;
  const discountStage = session.discountStage || 0;
  const lastProduct = session.lastProduct || null;
  const history = session.conversationHistory || [];
  const data = session.data || {};
  const websiteUrl = client.websiteUrl || 'www.mlventerprises.in';

  try {
    const productContext = buildProductContext(client.products);
    const dbPrompt = await getConfig('ai_prompt', FALLBACK_PROMPT);

    const [pct1, pct2, pct3] = await Promise.all([
      getConfig('discount_pct_1', '5'),
      getConfig('discount_pct_2', '8'),
      getConfig('discount_pct_3', '10'),
    ]);

    const persona = dbPrompt
      .replace('{businessName}', client.businessName)
      .replace('{discount_instructions}', discountInstructionsFor(discountStage, pct1, pct2, pct3));

    const photoBlock = isDoorLock
      ? `DOOR PHOTO — for this product (it's a door lock):
- ONLY after you already have their name, phone, location AND preferred date, ask them to send a PHOTO of their door (show the edge/side if they can) so the team can confirm the right fit. Set "askingForPhoto": true on that turn.
- Ask for the photo whether or not they told you the door thickness. If they happen to mention the thickness, note it in doorThickness too — but the photo is what you're asking for.
- If they SEND the photo: thank them warmly — e.g. "Thanks for sharing! 😊 Our team will review it and get back to you shortly." — then set "readyToFinalize": true.
- If they say they CAN'T or don't want to share a photo: that's totally fine — reassure them ("No problem at all!"), then set "readyToFinalize": true anyway.
- Ask only ONCE — never nag. Finalize on either a photo OR a clear no.`
      : `This product is NOT a door lock — do NOT ask for door thickness or a door photo.`;

    const prompt = `${persona}

IMPORTANT — OUTPUT MODE:
Ignore any earlier instruction about replying with prefixes like DISCOUNT:/BOOKING:/SERVICE_ or plain text. For THIS task you must reply with ONLY the single JSON object described at the very bottom. Put your message to the customer in the "reply" field and the discount stage in "discountStage".

PRODUCT KNOWLEDGE (use this to answer accurately — never invent prices/specs):
${productContext}

CONVERSATION HISTORY (this is your memory — read every line before replying):
${history.length > 0
    ? history.map(m => `${m.role === 'user' ? 'Customer' : 'Priya'}: ${m.text}`).join('\n')
    : '(new conversation — no history yet)'}

WHAT YOU ALREADY KNOW (NEVER re-ask these — build on them):
${JSON.stringify({
      name: data.name || null,
      phone: data.phone || null,
      location: data.location || null,
      date: data.date || null,
      doorThickness: data.doorThickness || null,
      doorPhotoReceived: !!data.hasDoorPhoto,
    })}

CONTEXT:
- Last product discussed: ${lastProduct || 'none yet'}
- Discount stage: ${discountStage}/3
- Appointment status: ${session.bookedAppointment
        ? 'ALREADY BOOKED ✅ — pure after-sales now. Never push to book/schedule again; answer questions about timing, install, warranty, care.'
        : 'Not booked yet'}

DISCOUNT GUIDANCE (current stage ${discountStage}/3):
${discountInstructionsFor(discountStage, pct1, pct2, pct3)}

BEFORE YOU RECOMMEND ANYTHING:
- ALWAYS understand what the customer actually needs FIRST. Ask about their situation — home or office? what kind of door (wooden/metal/glass/sliding)? who'll be using it? any budget in mind? — then recommend ONE specific product that fits.
- Don't fire off a product on the very first message. Ask, listen, then suggest. Only skip the questions if they already told you exactly what they want.

SHOWING MORE PRODUCTS:
- You can't show a catalogue, list or menu in this chat. If the customer wants to browse the full range or "see more products / other models", point them to the website and keep helping in chat. Share it naturally, e.g. "You can see our full range here: ${websiteUrl} 😊 — but tell me what you're after and I'll point you straight to the right one."

WHEN THE CUSTOMER WANTS TO BUY / BOOK A HOME VISIT:
- Collect, ONE at a time, conversationally (not like a form): name, phone, location/area, preferred date & time.
- Extract whatever they give — they may share several at once. A phone needs 10+ digits.
- Keep dates as they say them ("this Saturday", "tomorrow morning").
- Never overwrite info already collected unless they're correcting themselves.
${photoBlock}
- Once everything needed is collected, give a short natural recap and ask them to confirm.
- When they clearly confirm ("yes", "correct", "go ahead"), set "readyToFinalize": true and make "reply" a warm closing line (our team will call to confirm — no upfront payment).

IF IT'S A COMPLAINT / REPAIR REQUEST:
- Set "intent": "service" and put a one-line problem summary in "issue".
- Collect name, phone, location, preferred date the same natural way (NO door thickness for service).
- Set "readyToFinalize": true once collected and confirmed.

FOLLOW-UP TIMING:
- If the customer says they'll decide later or to check back later ("I'll let you know in two weeks", "call me next month", "give me a few days", "after Diwali", "next week"), set "followUpDays" to the number of days from now until then — two weeks = 14, a month = 30, a week = 7, "couple of days" = 2, tomorrow = 1. Otherwise set it to null.
- Still reply warmly and naturally; just also fill in followUpDays.

CUSTOMER MESSAGE: "${userMessage}"

Return ONLY this JSON object, no markdown, no extra text:
{
  "reply": "<your message to the customer — short, human, in their language>",
  "intent": "chat" | "booking" | "service",
  "product": "<exact product name they want, or null>",
  "issue": "<one-line issue for service, or null>",
  "data": { "name": "<or null>", "phone": "<or null>", "location": "<or null>", "date": "<or null>", "doorThickness": "<or null>" },
  "askingForPhoto": <boolean>,
  "readyToFinalize": <boolean>,
  "discountStage": <number 0-3>,
  "followUpDays": <integer days from now until they want to be contacted, or null>
}`;

    // Force strict JSON output so a stray quote/newline in the reply can't break the parser.
    const raw = await generateWithFallback(prompt, { responseMimeType: 'application/json' });
    const parsed = parseJsonLoose(raw);
    if (!parsed || typeof parsed.reply !== 'string') return null;

    const clean = (v) => (v && v !== 'null' ? v : null);
    return {
      reply: parsed.reply,
      intent: ['booking', 'service'].includes(parsed.intent) ? parsed.intent : 'chat',
      product: clean(parsed.product),
      issue: clean(parsed.issue),
      data: {
        name: clean(parsed.data?.name),
        phone: clean(parsed.data?.phone),
        location: clean(parsed.data?.location),
        date: clean(parsed.data?.date),
        doorThickness: clean(parsed.data?.doorThickness),
      },
      askingForPhoto: !!parsed.askingForPhoto,
      readyToFinalize: !!parsed.readyToFinalize,
      discountStage: Number.isInteger(parsed.discountStage) ? parsed.discountStage : discountStage,
      followUpDays: Number.isInteger(parsed.followUpDays) && parsed.followUpDays > 0 ? parsed.followUpDays : null,
    };
  } catch (err) {
    console.error('chatAgent error:', err.message);
    return null;
  }
}

/**
 * Writes a natural, AI-generated re-engagement message for a lead who went
 * quiet. No templates. Returns the message text, or null if AI is unavailable.
 */
export async function composeFollowUp(session, client) {
  if (!hasGemini()) return null;

  const name = session.name || session.data?.name || null;
  const lastProduct = session.lastProduct || null;
  const history = session.conversationHistory || [];

  try {
    const dbPrompt = await getConfig('ai_prompt', FALLBACK_PROMPT);
    const persona = dbPrompt
      .replace('{businessName}', client.businessName)
      .replace('{discount_instructions}', '');

    const prompt = `${persona}

TASK: A customer you chatted with on WhatsApp went quiet about a day ago and never booked. Send ONE short, warm, genuinely human follow-up to gently re-engage them — like a real salesperson checking back in. Low pressure, never a templated "Hi {name}, just following up!" feel.
${name ? `Their name is ${name}.` : ''}${lastProduct ? ` They were looking at: ${lastProduct}.` : ''}

Recent conversation:
${history.length > 0 ? history.map(m => `${m.role === 'user' ? 'Customer' : 'Priya'}: ${m.text}`).join('\n') : '(little history)'}

Reply with ONLY the message text — max 2 sentences, in the language the customer was using.`;

    const raw = await generateWithFallback(prompt);
    const text = raw.trim();
    return text || null;
  } catch (err) {
    console.error('composeFollowUp error:', err.message);
    return null;
  }
}

/**
 * Vision: looks at a customer photo and replies naturally. Detects damaged
 * locks (→ service) vs. product/door questions. Returns { type, summary?, message }.
 */
export async function analyzeImage(imageBuffer, mimeType, caption, client) {
  if (!hasGemini()) return null;

  try {
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType,
      },
    };

    const prompt = `You are Priya, WhatsApp sales executive for ${client.businessName}, a Yale smart lock dealer in Chennai. You are a real human, never a bot.

A customer sent this image${caption ? ` with the message: "${caption}"` : ''}.

Look at it and respond naturally — like a knowledgeable friend, not a technical report. Keep it short and WhatsApp-friendly.

Use ONE of these formats:

1. If it shows a DAMAGED/broken lock, an error display, or any product issue:
SERVICE_SUMMARY: <one-line issue summary, e.g. "Lock cylinder damaged — mechanism exposed">
SERVICE_MESSAGE: <friendly reply: say what you see in plain words, reassure them you'll get a technician to sort it, and ask for their name so you can raise the request>

2. If it shows a YALE PRODUCT they want info on:
<identify it naturally and share what it's good for>

3. If it shows a DOOR or space where they want a lock:
<look at the door and suggest 1-2 suitable Yale products>

4. For anything else:
<describe what you see and ask how you can help>

LANGUAGE: If the caption is in Tamil, Hindi, Tanglish or Hinglish, reply in that language. Default to English if no caption.

Keep under 150 words.`;

    const raw = await generateWithFallback([prompt, imagePart]);
    const trimmed = (raw || '').trim();
    if (!trimmed) return null;

    if (trimmed.includes('SERVICE_SUMMARY:') && trimmed.includes('SERVICE_MESSAGE:')) {
      const summaryMatch = trimmed.match(/SERVICE_SUMMARY:\s*(.+?)(?=\nSERVICE_MESSAGE:)/s);
      const messageMatch = trimmed.match(/SERVICE_MESSAGE:\s*(.+)/s);
      return {
        type: 'service',
        summary: summaryMatch ? summaryMatch[1].trim() : 'Product issue reported',
        message: messageMatch ? messageMatch[1].trim() : trimmed,
      };
    }
    return { type: 'text', message: trimmed };
  } catch (err) {
    console.error('Gemini image analysis error:', err.message);
    return null;
  }
}
