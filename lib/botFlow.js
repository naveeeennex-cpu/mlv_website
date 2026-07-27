import { sendText, sendInteractiveList, sendInteractiveButtons, sendImageUrl } from './whatsapp.js';
import {
  DOOR_MATERIALS, DOOR_CONFIGS, DOOR_LOCATIONS, BUDGET_BANDS, OTHER_CATEGORIES,
  findProductByMessage, getProductById, isCompatible, searchCompatible, categoryProducts,
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
    // options: [{ id, title, description? }]  (title auto-trimmed to WhatsApp limits)
    async list({ header, body, buttonText = 'Choose', options }) {
      const rows = options.slice(0, 10).map(o => ({
        id: o.id,
        title: String(o.title).slice(0, 24),
        description: o.description ? String(o.description).slice(0, 72) : undefined,
      }));
      await sendInteractiveList(phoneNumberId, accessToken, to, {
        header, body, buttonText, sections: [{ title: header?.slice(0, 24) || 'Options', rows }],
      });
      await log('bot', `${body}\n${options.map(o => `• ${o.title}`).join('\n')}`);
    },
    // buttons: [{ id, title }]  (max 3)
    async buttons({ body, buttons, imageUrl }) {
      await sendInteractiveButtons(phoneNumberId, accessToken, to, {
        body, buttons: buttons.slice(0, 3), imageUrl,
      });
      await log('bot', `${body}\n${buttons.map(b => `[${b.title}]`).join(' ')}`);
    },
    async image(url, caption) {
      if (url) await sendImageUrl(phoneNumberId, accessToken, to, url, caption);
      if (caption) await log('bot', caption);
    },
  };
}

// ── option builders ───────────────────────────────────────────────────────────

const materialOptions = (includeOther) => [
  ...DOOR_MATERIALS.map(m => ({ id: `mat:${m}`, title: m })),
  ...(includeOther ? [{ id: 'other:menu', title: 'Other Products' }] : []),
];
const configOptions = DOOR_CONFIGS.map(c => ({ id: `cfg:${c}`, title: c }));
const locationOptions = DOOR_LOCATIONS.map(l => ({ id: `loc:${l}`, title: l }));
const budgetOptions = BUDGET_BANDS.map(b => ({ id: b.id, title: b.label }));
const otherCategoryOptions = OTHER_CATEGORIES.map(g => ({ id: `cat:${g.key}`, title: g.label }));

// Build a WhatsApp-friendly product detail caption (image sent separately).
function productDetailText(p) {
  const lines = [`*${p.name}*`];
  if (p.mrp || p.price) lines.push(p.mrp || `₹${Number(p.price).toLocaleString('en-IN')}`);
  if (p.description) lines.push('', p.description);
  if (p.features?.length) lines.push('', '*Features*', ...p.features.slice(0, 8).map(f => `• ${f}`));
  const specEntries = Object.entries(p.specs || {}).filter(([, v]) => v);
  if (specEntries.length) lines.push('', '*Specifications*', ...specEntries.slice(0, 8).map(([k, v]) => `• ${k}: ${v}`));
  if (p.applications) lines.push('', '*Applications*', p.applications);
  if (p.advantages) lines.push('', '*Advantages*', p.advantages);
  return lines.join('\n').slice(0, 1024);
}

// ── session state helpers ──────────────────────────────────────────────────────

function freshBot() {
  return { flow: null, step: 'start', productId: null, productName: null,
    doorMaterial: null, doorConfiguration: null, doorLocation: null, budget: null, candidates: [] };
}

function parseReply(input) {
  // Interactive replies carry the encoded id; plain text carries a label.
  const id = input.replyId || '';
  const text = (input.text || '').trim();
  return { id, text };
}

// ── main entry ──────────────────────────────────────────────────────────────

export async function runBotFlow(input, client, session, from, log) {
  const s = makeSender(client, from, log);
  if (!session.bot) session.bot = freshBot();
  const b = session.bot;
  const { id, text } = parseReply(input);

  // Global reset triggers.
  if (/^(hi|hello|hey|start|menu|restart)\b/i.test(text) && b.step !== 'start') {
    // Only reset if they're not mid interactive answer (interactive replies have ids).
    if (!id) session.bot = freshBot();
  }
  const bot = session.bot;

  // Fresh conversation → detect entry point.
  if (bot.step === 'start') {
    const product = await findProductByMessage(text);
    if (product) {
      bot.flow = 'website';
      bot.productId = product.id;
      bot.productName = product.name;
      await s.text(
        `Thank you for contacting MLV Enterprises.\n\n` +
        `Before we proceed, let's make sure *${product.name}* is compatible with your door.`
      );
      return askMaterial(s, bot, false);
    }
    bot.flow = 'meta';
    await s.text(`Thank you for contacting MLV Enterprises.\n\nPlease choose what you're looking for.`);
    return askMaterial(s, bot, true);
  }

  // Route by current step. Interactive id wins; fall back to matching text to a label.
  switch (bot.step) {
    case 'ask_material':     return onMaterial(s, bot, id, text);
    case 'ask_configuration':return onConfig(s, bot, id, text);
    case 'ask_location':     return onLocation(s, bot, client, from, id, text);
    case 'ask_budget':       return onBudget(s, bot, id, text);
    case 'await_selection':  return onSelection(s, bot, id, text);
    case 'await_action':     return onAction(s, bot, client, from, id, text);
    case 'await_category':   return onCategory(s, bot, id, text);
    case 'done':             return restart(s, session);
    default:                 return restart(s, session);
  }
}

// ── steps ─────────────────────────────────────────────────────────────────────

async function askMaterial(s, bot, includeOther) {
  bot.step = 'ask_material';
  bot._includeOther = includeOther;
  await s.list({
    header: 'Door Type',
    body: 'What type of door do you have?',
    buttonText: 'Select door type',
    options: materialOptions(includeOther),
  });
}

async function onMaterial(s, bot, id, text) {
  if (id === 'other:menu' || /other products/i.test(text)) {
    return askCategory(s, bot);
  }
  const val = pick(id, 'mat:', DOOR_MATERIALS, text);
  if (!val) return nudge(s, () => askMaterial(s, bot, bot._includeOther));
  bot.doorMaterial = val;
  return askConfig(s, bot);
}

async function askConfig(s, bot) {
  bot.step = 'ask_configuration';
  await s.list({
    header: 'Door Configuration',
    body: 'What is your door configuration?',
    buttonText: 'Select configuration',
    options: configOptions,
  });
}

async function onConfig(s, bot, id, text) {
  const val = pick(id, 'cfg:', DOOR_CONFIGS, text);
  if (!val) return nudge(s, () => askConfig(s, bot));
  bot.doorConfiguration = val;
  return askLocation(s, bot);
}

async function askLocation(s, bot) {
  bot.step = 'ask_location';
  await s.list({
    header: 'Installation',
    body: 'Where will this lock be installed?',
    buttonText: 'Select location',
    options: locationOptions,
  });
}

async function onLocation(s, bot, client, from, id, text) {
  const val = pick(id, 'loc:', DOOR_LOCATIONS, text);
  if (!val) return nudge(s, () => askLocation(s, bot));
  bot.doorLocation = val;

  if (bot.flow === 'website') {
    // Validate the already-chosen product.
    const product = await getProductById(bot.productId);
    if (product && isCompatible(product, bot.doorMaterial, bot.doorConfiguration)) {
      await saveLead(client, {
        leadSource: 'website', phone: from, productId: product.id, productName: product.name,
        doorMaterial: bot.doorMaterial, doorConfiguration: bot.doorConfiguration, doorLocation: bot.doorLocation,
      });
      bot.booked = true;
      await s.text(
        `✅ Great!\n\nThis product is compatible with your door.\n\n` +
        `Your enquiry has been successfully registered.\n\n` +
        `Our MLV Enterprises team will contact you shortly with pricing, installation guidance and availability.`
      );
      bot.step = 'done';
      return;
    }
    // Incompatible → explain, then ask budget before showing alternatives.
    const supports = (product?.doorMaterial || []);
    const supportLine = supports.length ? supports.map(m => `• ${m}`).join('\n') : '• a different door type';
    await s.text(
      `❌ Sorry.\n\nThe selected product is not suitable for your door.\n\n` +
      `This product is designed for:\n${supportLine}\n\nLet's help you find the correct product.`
    );
    return askBudget(s, bot);
  }

  // Meta flow → ask budget, then search.
  return askBudget(s, bot);
}

async function askBudget(s, bot) {
  bot.step = 'ask_budget';
  await s.list({
    header: 'Budget',
    body: 'What is your budget range?',
    buttonText: 'Select budget',
    options: budgetOptions,
  });
}

async function onBudget(s, bot, id, text) {
  const band = BUDGET_BANDS.find(b => b.id === id)
    || BUDGET_BANDS.find(b => text && b.label.toLowerCase() === text.toLowerCase().trim());
  if (!band) return nudge(s, () => askBudget(s, bot));
  bot.budget = { min: band.min, max: band.max, label: band.label };
  return showMatches(s, bot, await searchCompatible(bot.doorMaterial, bot.doorConfiguration, bot.budget));
}

async function showMatches(s, bot, products) {
  bot.candidates = products.map(p => p.id);
  if (!products.length) {
    await s.text(
      `We couldn't find a matching product for a *${bot.doorMaterial}*` +
      `${bot.doorConfiguration && bot.doorConfiguration !== 'Others' ? ` / ${bot.doorConfiguration}` : ''}` +
      `${bot.budget ? ` in the ${bot.budget.label} range` : ''} right now.\n\n` +
      `Our team will reach out with the best options — please share your requirement and we'll assist you.`
    );
    bot.step = 'done';
    return;
  }
  bot.step = 'await_selection';
  await s.list({
    header: 'Recommended',
    body: 'Here are products that fit your door. Tap one to see details.',
    buttonText: 'View products',
    options: products.map(p => ({
      id: `prod:${p.id}`,
      title: p.name,
      description: p.mrp || (p.price ? `₹${Number(p.price).toLocaleString('en-IN')}` : undefined),
    })),
  });
}

async function onSelection(s, bot, id, text) {
  let pid = id.startsWith('prod:') ? id.slice(5) : null;
  if (!pid) {
    // Match typed text to a candidate name.
    for (const cid of bot.candidates) {
      const p = await getProductById(cid);
      if (p && text && p.name.toLowerCase().includes(text.toLowerCase())) { pid = cid; break; }
    }
  }
  if (!pid || !bot.candidates.includes(pid)) {
    return nudge(s, async () => {
      const prods = [];
      for (const cid of bot.candidates) { const p = await getProductById(cid); if (p) prods.push(p); }
      return showMatches(s, bot, prods);
    });
  }
  const product = await getProductById(pid);
  bot.selectedId = pid;
  bot.selectedName = product.name;
  bot.step = 'await_action';
  await s.image(product.image, undefined);
  await s.buttons({
    body: productDetailText(product),
    buttons: [
      { id: 'book:now', title: 'Book Now' },
      { id: 'more:products', title: 'Try Other Products' },
    ],
  });
}

async function onAction(s, bot, client, from, id, text) {
  if (id === 'book:now' || /book/i.test(text)) {
    await saveLead(client, {
      leadSource: bot.flow === 'meta' ? 'meta' : 'website',
      phone: from,
      productId: bot.selectedId,
      productName: bot.selectedName,
      doorMaterial: bot.doorMaterial,
      doorConfiguration: bot.doorConfiguration,
      doorLocation: bot.doorLocation,
    });
    bot.booked = true;
    await s.text(`Thank you for choosing MLV Enterprises.\n\nOur team will contact you shortly.`);
    bot.step = 'done';
    return;
  }
  if (id === 'more:products' || /other|more/i.test(text)) {
    const prods = [];
    for (const cid of bot.candidates) { const p = await getProductById(cid); if (p) prods.push(p); }
    return showMatches(s, bot, prods);
  }
  return nudge(s, async () => {
    const product = await getProductById(bot.selectedId);
    await s.buttons({
      body: productDetailText(product),
      buttons: [{ id: 'book:now', title: 'Book Now' }, { id: 'more:products', title: 'Try Other Products' }],
    });
  });
}

async function askCategory(s, bot) {
  bot.step = 'await_category';
  await s.list({
    header: 'Other Products',
    body: 'Please choose a category.',
    buttonText: 'Select category',
    options: otherCategoryOptions,
  });
}

async function onCategory(s, bot, id, text) {
  let key = id.startsWith('cat:') ? id.slice(4) : null;
  if (!key) {
    const g = OTHER_CATEGORIES.find(g => text && g.label.toLowerCase().includes(text.toLowerCase()));
    key = g?.key || null;
  }
  if (!key) return nudge(s, () => askCategory(s, bot));
  bot.doorMaterial = null;
  bot.doorConfiguration = null;
  return showMatches(s, bot, await categoryProducts(key));
}

// ── utilities ───────────────────────────────────────────────────────────────

// Resolve a chosen value from an interactive id (`prefix:Value`) or typed label.
function pick(id, prefix, allowed, text) {
  if (id && id.startsWith(prefix)) {
    const v = id.slice(prefix.length);
    if (allowed.includes(v)) return v;
  }
  if (text) {
    const hit = allowed.find(a => a.toLowerCase() === text.toLowerCase().trim());
    if (hit) return hit;
  }
  return null;
}

async function nudge(s, resend) {
  await s.text('Please tap one of the options below 👇');
  return resend();
}

async function restart(s, session) {
  session.bot = freshBot();
  await s.text(`Thank you for contacting MLV Enterprises.\n\nPlease choose what you're looking for.`);
  return askMaterial(s, session.bot, true);
}
