import { sendText, sendInteractiveButtons, markAsRead } from './whatsapp.js';
import { askAI } from './ai.js';

// In-memory session store (resets on cold start — fine for stateless flows)
const sessions = new Map();

function getSession(from) {
  if (!sessions.has(from)) {
    sessions.set(from, { state: 'idle', lastProduct: null, data: {} });
  }
  return sessions.get(from);
}

const GREETINGS = ['hi', 'hello', 'hey', 'hola', 'start', 'menu', 'help', 'hai', 'hii'];

export async function handleMessage(message, client) {
  const { phoneNumberId, accessToken } = client;
  const from = message.from;
  const msgId = message.id;

  // Mark as read
  markAsRead(phoneNumberId, accessToken, msgId);

  // Extract text
  let text = '';
  if (message.type === 'text') {
    text = message.text.body.trim();
  } else if (message.type === 'interactive') {
    if (message.interactive.type === 'button_reply') {
      text = message.interactive.button_reply.id;
    } else if (message.interactive.type === 'list_reply') {
      text = message.interactive.list_reply.id;
    }
  } else {
    await sendText(phoneNumberId, accessToken, from,
      `Thanks for your message! I can help you best with text messages. Please type your query or say "hi" to see the menu.`);
    return;
  }

  const lower = text.toLowerCase();
  const session = getSession(from);

  // Handle booking flow
  if (session.state === 'booking_name') {
    session.data.name = text;
    session.state = 'booking_location';
    await sendText(phoneNumberId, accessToken, from, `Thanks ${text}! 📍 Please share your *location/city*:`);
    return;
  }
  if (session.state === 'booking_location') {
    session.data.location = text;
    session.state = 'booking_date';
    await sendText(phoneNumberId, accessToken, from, `Got it! 📅 When would you prefer the installation? (e.g., "Next Monday", "15 April")`);
    return;
  }
  if (session.state === 'booking_date') {
    session.data.date = text;
    session.state = 'idle';

    const productInfo = session.data.product ? ` for *${session.data.product}*` : '';
    const summary = `✅ *Booking Request Received!*\n\n` +
      `Name: ${session.data.name}\n` +
      `Location: ${session.data.location}\n` +
      `Preferred Date: ${session.data.date}${productInfo}\n\n` +
      `Our team will contact you shortly. You can also call us at +${client.ownerPhone}`;

    await sendText(phoneNumberId, accessToken, from, summary);

    // Notify business owner
    if (client.ownerPhone) {
      const ownerMsg = `🔔 *New Booking Request*\n\n` +
        `From: ${from}\n` +
        `Name: ${session.data.name}\n` +
        `Location: ${session.data.location}\n` +
        `Date: ${session.data.date}${productInfo}`;
      await sendText(phoneNumberId, accessToken, client.ownerPhone, ownerMsg);
    }

    session.data = {};
    return;
  }

  // Reset on greeting
  if (GREETINGS.includes(lower)) {
    session.state = 'idle';
    session.lastProduct = null;
    await sendGreeting(phoneNumberId, accessToken, from, client);
    return;
  }

  // Main menu options
  if (lower === '1' || lower === 'products' || lower === 'browse' || lower === 'btn_products') {
    await sendCategories(phoneNumberId, accessToken, from, client);
    return;
  }

  if (lower === '2' || lower === 'book' || lower === 'install' || lower === 'installation' || lower === 'btn_book') {
    session.state = 'booking_name';
    session.data = {};
    await sendText(phoneNumberId, accessToken, from, `Great! Let's book an installation. 📝\n\nPlease share your *full name*:`);
    return;
  }

  if (lower === '3' || lower === 'talk' || lower === 'contact' || lower === 'support' || lower === 'btn_contact') {
    await sendText(phoneNumberId, accessToken, from,
      `📞 *Contact ${client.businessName}*\n\n` +
      `Phone: +${client.ownerPhone}\n` +
      `WhatsApp: wa.me/${client.ownerPhone}\n` +
      (client.websiteUrl ? `Website: ${client.websiteUrl}\n` : '') +
      `\nOur team is available Mon-Sat, 9AM-7PM.`);
    return;
  }

  // Order / enquire about last viewed product
  if ((lower === 'order' || lower === 'enquire' || lower === 'buy' || lower === 'btn_order') && session.lastProduct) {
    session.state = 'booking_name';
    session.data = { product: session.lastProduct };
    await sendText(phoneNumberId, accessToken, from,
      `Great choice! Let's get your order for *${session.lastProduct}* started. 📝\n\nPlease share your *full name*:`);
    return;
  }

  // Check if it's a category number (for category browsing)
  const catIndex = parseInt(lower) - 1;
  if (!isNaN(catIndex) && catIndex >= 0 && catIndex < client.products.length && session.state === 'idle') {
    // Could be a category selection if they were browsing
    await sendCategoryProducts(phoneNumberId, accessToken, from, client, catIndex);
    return;
  }

  // Search for product by name
  const product = findProduct(lower, client.products);
  if (product) {
    session.lastProduct = product.name;
    await sendProductDetails(phoneNumberId, accessToken, from, product, client);
    return;
  }

  // Search for category by name
  const category = findCategory(lower, client.products);
  if (category) {
    const catIdx = client.products.indexOf(category);
    await sendCategoryProducts(phoneNumberId, accessToken, from, client, catIdx);
    return;
  }

  // Try AI for complex queries
  const aiReply = await askAI(text, client);
  if (aiReply) {
    await sendText(phoneNumberId, accessToken, from, aiReply);
    return;
  }

  // Fallback
  await sendText(phoneNumberId, accessToken, from,
    `I'm not sure I understood that. Here's what I can help with:\n\n` +
    `1️⃣ *Products* - Browse our catalog\n` +
    `2️⃣ *Book* - Schedule an installation\n` +
    `3️⃣ *Contact* - Talk to our team\n\n` +
    `Or just ask any question about Yale smart locks!`);
}

async function sendGreeting(phoneNumberId, accessToken, to, client) {
  const greeting = `👋 *Welcome to ${client.businessName}!*\n` +
    `Your trusted Yale Smart Lock experts.\n\n` +
    `How can I help you today?\n\n` +
    `1️⃣ Browse Products\n` +
    `2️⃣ Book Installation\n` +
    `3️⃣ Talk to Us\n\n` +
    `_Or just type your question about any Yale product!_`;

  await sendInteractiveButtons(phoneNumberId, accessToken, to, {
    body: greeting,
    buttons: [
      { id: 'btn_products', title: 'Browse Products' },
      { id: 'btn_book', title: 'Book Installation' },
      { id: 'btn_contact', title: 'Contact Us' },
    ],
  });
}

async function sendCategories(phoneNumberId, accessToken, to, client) {
  let msg = `📦 *Product Categories*\n\n`;
  client.products.forEach((cat, i) => {
    msg += `${i + 1}. ${cat.name} (${cat.products.length})\n`;
  });
  msg += `\n_Reply with a number to browse, or type a product name to search._`;
  await sendText(phoneNumberId, accessToken, to, msg);
}

async function sendCategoryProducts(phoneNumberId, accessToken, to, client, catIndex) {
  const category = client.products[catIndex];
  if (!category) return;

  let msg = `📋 *${category.name}*\n${category.description}\n\n`;

  // Show up to 10 products
  const products = category.products.slice(0, 10);
  products.forEach((p, i) => {
    msg += `${i + 1}. *${p.name}* — ${p.mrp}\n`;
  });

  if (category.products.length > 10) {
    msg += `\n_...and ${category.products.length - 10} more_\n`;
  }

  msg += `\n_Type a product name to see full details._`;
  await sendText(phoneNumberId, accessToken, to, msg);
}

async function sendProductDetails(phoneNumberId, accessToken, to, product, client) {
  let msg = `🔐 *${product.name}*\n`;
  if (product.code && product.code !== product.name) {
    msg += `Model: ${product.code}\n`;
  }
  msg += `💰 *Price: ${product.mrp}*\n\n`;

  if (product.features.length > 0) {
    msg += `✨ *Features:*\n`;
    product.features.forEach(f => { msg += `• ${f}\n`; });
    msg += `\n`;
  }

  if (product.specs) {
    msg += `📐 *Specs:*\n`;
    for (const [key, val] of Object.entries(product.specs)) {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
      msg += `• ${label}: ${val}\n`;
    }
    msg += `\n`;
  }

  if (product.finishes && product.finishes.length > 0) {
    msg += `🎨 Finishes: ${product.finishes.join(', ')}\n`;
  }

  if (product.bundleIncludes) {
    msg += `📦 Includes: ${product.bundleIncludes}\n`;
  }

  msg += `\n_Reply *order* to enquire or *menu* to go back._`;

  await sendInteractiveButtons(phoneNumberId, accessToken, to, {
    body: msg,
    buttons: [
      { id: 'btn_order', title: 'Order / Enquire' },
      { id: 'btn_products', title: 'More Products' },
      { id: 'btn_contact', title: 'Contact Us' },
    ],
  });
}

function findProduct(query, categories) {
  const q = query.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  for (const cat of categories) {
    for (const p of cat.products) {
      const name = p.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
      const code = (p.code || '').toLowerCase().replace(/[^a-z0-9\s]/g, '');
      if (name === q || code === q) return p;
      if (q.length >= 4 && (name.includes(q) || code.includes(q))) return p;
      if (q.length >= 4 && q.includes(name)) return p;
    }
  }
  return null;
}

function findCategory(query, categories) {
  const q = query.toLowerCase();
  for (const cat of categories) {
    const catName = cat.name.toLowerCase();
    if (catName.includes(q) || q.includes(catName)) return cat;
    // Match keywords like "locks", "safes", "camera"
    const words = q.split(/\s+/);
    for (const word of words) {
      if (word.length >= 4 && catName.includes(word)) return cat;
    }
  }
  return null;
}
