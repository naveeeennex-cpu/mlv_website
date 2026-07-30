import { sendText, sendInteractiveList, sendInteractiveButtons, sendImageUrl } from './whatsapp.js';
import {
  BUDGET_BANDS,
  findProductByMessage, getProductById, isCompatible, searchCompatible,
} from './catalog.js';
import { saveLead } from './leads.js';

// ── outbound helpers (each also logs via the caller-provided `log`) ───────────

function makeSender(client, to, log) {
  const { phoneNumberId, accessToken } = client;
  return {
    async text(body) {
      await sendText(phoneNumberId, accessToken, to, body);
      await log('bot', body);
    },
    // options: [{ id, title, description? }]
    async list({ header, body, buttonText = 'Choose', options }) {
      const rows = options.slice(0, 10).map(o => ({
        id: o.id,
        title: String(o.title).slice(0, 24),
        description: o.description ? String(o.description).slice(0, 72) : undefined,
      }));
      await sendInteractiveList(phoneNumberId, accessToken, to, {
        header, body, buttonText, sections: [{ title: header?.slice(0, 24) || 'Options', rows }],
      });
      await log('bot', `${body}\n${options.map(o => `- ${o.title}`).join('\n')}`);
    },
    // buttons: [{ id, title }]  (max 3)  — the preferred, most tappable format.
    async buttons({ body, buttons, imageUrl }) {
      await sendInteractiveButtons(phoneNumberId, accessToken, to, {
        body, buttons: buttons.slice(0, 3), imageUrl,
      });
      await log('bot', `${body}\n${buttons.map(b => `[${b.title}]`).join(' ')}`);
    },
  };
}

// ── copy & options (easy to edit) ─────────────────────────────────────────────

const WELCOME =
  `Welcome to *MLV Enterprises*, an Authorised Yale Dealer.\n\n` +
  `We supply the right lock for your door, install it for you, and give full ` +
  `after-sales support — with free delivery.`;

// Door type → which door_material values to search. Budget asked only when budget:true.
const DOOR_TYPES = [
  { id: 'dt:wooden', title: 'Wooden Door',      label: 'Wooden Door',       materials: ['Wooden Door'],              budget: true },
  { id: 'dt:metal',  title: 'Metal / uPVC Door', label: 'Metal / uPVC Door', materials: ['Metal Door', 'uPVC Door'], budget: false },
  { id: 'dt:glass',  title: 'Glass Door',        label: 'Glass Door',        materials: ['Glass Door'],              budget: false },
];
const DOOR_STYLES = [
  { id: 'st:single',  title: 'Single Door',  value: 'Single Door' },
  { id: 'st:double',  title: 'Double Door',  value: 'Double Door' },
  { id: 'st:sliding', title: 'Sliding Door', value: 'Sliding Door' },
];
const LOCATIONS = [
  { id: 'lo:main',    title: 'Main Door', value: 'Main Door' },
  { id: 'lo:bedroom', title: 'Bedroom',   value: 'Bedroom' },
  { id: 'lo:other',   title: 'Other',     value: 'Other' },
];

const doorTypeButtons = DOOR_TYPES.map(d => ({ id: d.id, title: d.title }));
const doorStyleButtons = DOOR_STYLES.map(d => ({ id: d.id, title: d.title }));
const locationButtons = LOCATIONS.map(l => ({ id: l.id, title: l.title }));
const budgetButtons = BUDGET_BANDS.map(b => ({ id: b.id, title: b.label }));

const priceLabel = (p) => `₹${Number(p.price).toLocaleString('en-IN')}`;

// Compact product card (image sent as the card header separately).
function productCard(p, bot) {
  const lines = [`*Yale ${p.name}*`, '', `Price: ${priceLabel(p)}`, ''];
  for (const f of (p.features || []).slice(0, 4)) lines.push(`- ${f}`);
  const suitable = [bot.doorType, bot.location && bot.location !== 'Other' ? bot.location : ''].filter(Boolean).join(', ');
  if (suitable) lines.push('', `Suitable for: ${suitable}`);
  return lines.join('\n').slice(0, 1024);
}

// Fuller details for the "View Details" action.
function productDetailText(p) {
  const lines = [`*Yale ${p.name}*`, `Price: ${priceLabel(p)}`];
  if (p.description) lines.push('', p.description);
  if (p.features?.length) lines.push('', '*Features*', ...p.features.slice(0, 8).map(f => `- ${f}`));
  const specs = Object.entries(p.specs || {}).filter(([, v]) => v);
  if (specs.length) lines.push('', '*Specifications*', ...specs.slice(0, 8).map(([k, v]) => `- ${k}: ${v}`));
  if (p.applications) lines.push('', '*Applications*', p.applications);
  if (p.advantages) lines.push('', '*Advantages*', p.advantages);
  return lines.join('\n').slice(0, 1024);
}

// ── session ────────────────────────────────────────────────────────────────────

function freshBot() {
  return {
    flow: null, step: 'start', productId: null, productName: null,
    doorType: null, materials: null, doorStyle: null, location: null,
    budget: null, needBudget: false, candidates: [], selectedId: null, selectedName: null,
  };
}

function parseReply(input) {
  return { id: input.replyId || '', text: (input.text || '').trim() };
}

const isGreeting = (t) => /^\s*(hi+|hii+|hai+|h[ae]l+o|hlo+|hey+|hey there|start|menu|restart|good\s(morning|afternoon|evening))\b/i.test(t);

// ── entry ──────────────────────────────────────────────────────────────────────

export async function runBotFlow(input, client, session, from, log) {
  const s = makeSender(client, from, log);
  if (!session.bot) session.bot = freshBot();
  const { id, text } = parseReply(input);

  // Typing a greeting mid-flow (not while answering an interactive prompt) restarts.
  if (isGreeting(text) && !id && session.bot.step !== 'start') session.bot = freshBot();
  const bot = session.bot;

  if (bot.step === 'start') {
    const product = await findProductByMessage(text);
    if (product) {
      bot.flow = 'website';
      bot.productId = product.id;
      bot.productName = product.name;
      await s.text(
        `Welcome to *MLV Enterprises*, an Authorised Yale Dealer.\n\n` +
        `You are enquiring about *${product.name}*. Let us check if it is suitable for your door.`
      );
      return askDoorType(s, bot);
    }
    bot.flow = 'meta';
    await s.text(WELCOME);
    return askDoorType(s, bot);
  }

  switch (bot.step) {
    case 'ask_door_type':     return onDoorType(s, bot, id, text);
    case 'ask_door_style':    return onDoorStyle(s, bot, id, text);
    case 'ask_location':      return onLocation(s, bot, client, from, id, text);
    case 'ask_location_text': return onLocationText(s, bot, client, from, text);
    case 'ask_budget':        return onBudget(s, bot, client, from, id, text);
    case 'await_selection':   return onSelection(s, bot, id, text);
    case 'await_action':      return onAction(s, bot, client, from, id, text);
    case 'done':              return restart(s, session);
    default:                  return restart(s, session);
  }
}

// ── steps ───────────────────────────────────────────────────────────────────────

async function askDoorType(s, bot) {
  bot.step = 'ask_door_type';
  await s.buttons({ body: 'Please select your door type:', buttons: doorTypeButtons });
}

async function onDoorType(s, bot, id, text) {
  const dt = DOOR_TYPES.find(d => d.id === id) || DOOR_TYPES.find(d => text && d.label.toLowerCase() === text.toLowerCase());
  if (!dt) return nudge(s, () => askDoorType(s, bot));
  bot.doorType = dt.label;
  bot.materials = dt.materials;
  bot.needBudget = dt.budget;
  return askDoorStyle(s, bot);
}

async function askDoorStyle(s, bot) {
  bot.step = 'ask_door_style';
  await s.buttons({ body: 'Please select your door style:', buttons: doorStyleButtons });
}

async function onDoorStyle(s, bot, id, text) {
  const st = DOOR_STYLES.find(d => d.id === id) || DOOR_STYLES.find(d => text && d.value.toLowerCase() === text.toLowerCase());
  if (!st) return nudge(s, () => askDoorStyle(s, bot));
  bot.doorStyle = st.value;
  return askLocation(s, bot);
}

async function askLocation(s, bot) {
  bot.step = 'ask_location';
  await s.buttons({ body: 'Where will the lock be installed?', buttons: locationButtons });
}

async function onLocation(s, bot, client, from, id, text) {
  const lo = LOCATIONS.find(l => l.id === id) || LOCATIONS.find(l => text && l.value.toLowerCase() === text.toLowerCase());
  if (!lo) return nudge(s, () => askLocation(s, bot));
  if (lo.value === 'Other') {
    bot.step = 'ask_location_text';
    await s.text('Please tell us where you want to install the lock.\n(Type your answer, for example: Office, Shop, Balcony)');
    return;
  }
  bot.location = lo.value;
  return afterLocation(s, bot, client, from);
}

async function onLocationText(s, bot, client, from, text) {
  bot.location = text || 'Other';
  return afterLocation(s, bot, client, from);
}

async function afterLocation(s, bot, client, from) {
  if (bot.flow === 'website') return validateWebsite(s, bot, client, from);
  if (bot.needBudget) return askBudget(s, bot);   // Wooden → many products → ask budget
  return recommend(s, bot, client, from);         // Metal/uPVC/Glass → few → show directly
}

async function askBudget(s, bot) {
  bot.step = 'ask_budget';
  await s.buttons({ body: 'What is your budget for the lock?', buttons: budgetButtons });
}

async function onBudget(s, bot, client, from, id, text) {
  const b = BUDGET_BANDS.find(x => x.id === id) || BUDGET_BANDS.find(x => text && x.label.toLowerCase() === text.toLowerCase());
  if (!b) return nudge(s, () => askBudget(s, bot));
  bot.budget = { min: b.min, max: b.max, label: b.label };
  return recommend(s, bot, client, from);
}

// ── recommendations ──────────────────────────────────────────────────────────────

async function validateWebsite(s, bot, client, from) {
  const product = await getProductById(bot.productId);
  if (product && isCompatible(product, bot.materials, bot.doorStyle)) {
    await saveLead(client, leadFields(bot, from, 'website', product.id, product.name));
    bot.booked = true;
    await s.text(
      `Great! This lock is suitable for your door.\n\n` +
      `Your enquiry is registered. Our team will contact you soon with the price, free installation and availability.`
    );
    bot.step = 'done';
    return;
  }
  const supports = product?.doorMaterial || [];
  await s.text(
    `Sorry, *${bot.productName}* is not suitable for your door.\n\n` +
    `It is made for: ${supports.join(', ') || 'a different door type'}.\n\n` +
    `Here are the right locks for you:`
  );
  if (bot.needBudget) return askBudget(s, bot);
  return recommend(s, bot, client, from);
}

async function recommend(s, bot, client, from) {
  const products = await searchCompatible(bot.materials, bot.doorStyle, bot.budget, 3);
  bot.candidates = products.map(p => p.id);

  if (!products.length) {
    // Don't guess — hand off to a human.
    await saveLead(client, leadFields(bot, from, bot.flow, null, null, 'Needs Expert'));
    bot.booked = true;
    bot.step = 'await_action';
    await s.buttons({
      body: `We could not find an exact match for your selection.\n\nOur lock expert will help you choose the best option.`,
      buttons: [{ id: 'talk:expert', title: 'Talk to Expert' }],
    });
    return;
  }

  bot.step = 'await_selection';
  await s.list({
    header: 'Best Matches',
    body: `Here are the best locks for your ${bot.doorType}. Tap one to see the details.`,
    buttonText: 'View products',
    options: products.map(p => ({ id: `prod:${p.id}`, title: p.name, description: priceLabel(p) })),
  });
}

async function onSelection(s, bot, id, text) {
  let pid = id.startsWith('prod:') ? id.slice(5) : null;
  if (!pid) {
    for (const cid of bot.candidates) {
      const p = await getProductById(cid);
      if (p && text && p.name.toLowerCase().includes(text.toLowerCase())) { pid = cid; break; }
    }
  }
  if (!pid || !bot.candidates.includes(pid)) return nudge(s, () => reshowCandidates(s, bot));
  const product = await getProductById(pid);
  bot.selectedId = pid;
  bot.selectedName = product.name;
  bot.step = 'await_action';
  await s.buttons({
    body: productCard(product, bot),
    imageUrl: product.image,
    buttons: [
      { id: 'buy:now', title: 'Buy Now' },
      { id: 'view:details', title: 'View Details' },
      { id: 'talk:expert', title: 'Talk to Expert' },
    ],
  });
}

async function onAction(s, bot, client, from, id, text) {
  if (id === 'buy:now' || /buy/i.test(text)) {
    await saveLead(client, leadFields(bot, from, bot.flow, bot.selectedId, bot.selectedName));
    bot.booked = true;
    bot.step = 'done';
    await s.text(
      `Thank you. Your enquiry for *${bot.selectedName}* is registered.\n\n` +
      `Our team will contact you soon to confirm the price, delivery and free installation.`
    );
    return;
  }
  if (id === 'view:details' || /detail/i.test(text)) {
    const p = await getProductById(bot.selectedId);
    await s.buttons({
      body: productDetailText(p),
      imageUrl: p.image,
      buttons: [
        { id: 'buy:now', title: 'Buy Now' },
        { id: 'talk:expert', title: 'Talk to Expert' },
      ],
    });
    return; // stay in await_action
  }
  if (id === 'talk:expert' || /expert|talk|call/i.test(text)) {
    await saveLead(client, leadFields(bot, from, bot.flow, bot.selectedId, bot.selectedName, 'Needs Expert'));
    bot.booked = true;
    bot.step = 'done';
    await s.text(
      `Sure. Our lock expert will contact you soon to help you choose the right lock.\n\n` +
      `Thank you for choosing MLV Enterprises.`
    );
    return;
  }
  return nudge(s, async () => {
    const p = await getProductById(bot.selectedId);
    await s.buttons({
      body: productCard(p, bot),
      imageUrl: p.image,
      buttons: [
        { id: 'buy:now', title: 'Buy Now' },
        { id: 'view:details', title: 'View Details' },
        { id: 'talk:expert', title: 'Talk to Expert' },
      ],
    });
  });
}

// ── helpers ─────────────────────────────────────────────────────────────────────

async function reshowCandidates(s, bot) {
  const prods = [];
  for (const cid of bot.candidates) { const p = await getProductById(cid); if (p) prods.push(p); }
  if (!prods.length) return askDoorType(s, bot);
  bot.step = 'await_selection';
  await s.list({
    header: 'Best Matches',
    body: 'Tap a product to see the details.',
    buttonText: 'View products',
    options: prods.map(p => ({ id: `prod:${p.id}`, title: p.name, description: priceLabel(p) })),
  });
}

function leadFields(bot, from, source, productId, productName, status) {
  return {
    leadSource: source === 'meta' ? 'meta' : 'website',
    phone: from,
    productId, productName,
    doorMaterial: bot.doorType,          // stored as the customer-facing door type
    doorConfiguration: bot.doorStyle,
    doorLocation: bot.location,
    budget: bot.budget?.label || null,
    status: status || 'New Lead',
  };
}

async function nudge(s, resend) {
  await s.text('Please tap one of the options below.');
  return resend();
}

async function restart(s, session) {
  session.bot = freshBot();
  await s.text(WELCOME);
  return askDoorType(s, session.bot);
}
