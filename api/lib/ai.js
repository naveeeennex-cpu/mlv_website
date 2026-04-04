import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

function getGenAI() {
  if (!genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

function buildProductContext(products) {
  const lines = [];
  for (const cat of products) {
    lines.push(`\n## ${cat.name}`);
    for (const p of cat.products) {
      const features = p.features.join(', ');
      const specs = Object.entries(p.specs || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      lines.push(`- ${p.name} (${p.mrp}) | ${features} | ${specs} | Finishes: ${(p.finishes || []).join(', ')}`);
    }
  }
  return lines.join('\n');
}

/**
 * Parse structured AI response.
 * Expected formats:
 *   SERVICE_SUMMARY: <short summary>\nSERVICE_MESSAGE: <user-facing message>
 *   BOOKING: <product name>
 *   NULL
 *   <regular text reply>
 */
function parseAIResponse(text) {
  if (!text) return null;
  const trimmed = text.trim();

  if (trimmed === 'NULL' || trimmed === 'null') return null;

  if (trimmed.includes('SERVICE_SUMMARY:') && trimmed.includes('SERVICE_MESSAGE:')) {
    const summaryMatch = trimmed.match(/SERVICE_SUMMARY:\s*(.+?)(?=\nSERVICE_MESSAGE:)/s);
    const messageMatch = trimmed.match(/SERVICE_MESSAGE:\s*(.+)/s);
    return {
      type: 'service',
      summary: summaryMatch ? summaryMatch[1].trim() : 'Product issue reported',
      message: messageMatch ? messageMatch[1].trim() : trimmed,
    };
  }

  if (trimmed.startsWith('BOOKING:')) {
    return {
      type: 'booking',
      product: trimmed.replace('BOOKING:', '').trim(),
    };
  }

  return { type: 'text', message: trimmed };
}

export async function askAI(query, client) {
  const ai = getGenAI();
  if (!ai) return null;

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const productContext = buildProductContext(client.products);

    const prompt = `You are a helpful WhatsApp sales and support assistant for ${client.businessName}. You help customers find Yale products AND handle service/complaint queries.

PRODUCT CATALOG:
${productContext}

RULES:
- Answer in a friendly, concise WhatsApp-friendly format (short paragraphs, use emojis sparingly)
- Always include product name, price, and key features in recommendations
- If asked about a product not in the catalog, say you don't carry it
- If the query is not about products or service (greeting, random chat), return ONLY the word NULL
- Keep responses under 300 words
- Contact: ${client.ownerPhone ? `+${client.ownerPhone}` : 'our team'}

RESPONSE FORMATS (use exactly one):

1. BOOKING — If the user says "okay", "I need", "yes", "interested", "I want", "book", "order" and it's about ordering a product:
BOOKING:<product name>

2. SERVICE — If the user reports a problem (broken lock, not working, battery issue, service needed):
SERVICE_SUMMARY: <one-line issue summary for records, e.g. "Lock cylinder removed - door unsecured">
SERVICE_MESSAGE: <friendly message to customer explaining what you see, troubleshooting tips, and reassurance that a technician will help>

3. PRODUCT QUERY — For product questions, just reply normally with recommendations. Always end with: _Reply *order* to book, or ask me anything else!_

CUSTOMER QUERY: "${query}"

Reply:`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    return parseAIResponse(raw);
  } catch (err) {
    console.error('Gemini AI error:', err.message);
    return null;
  }
}

export async function analyzeImage(imageBuffer, mimeType, caption, client) {
  const ai = getGenAI();
  if (!ai) return null;

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType,
      },
    };

    const prompt = `You are a WhatsApp support assistant for ${client.businessName}, a Yale smart lock dealer.

A customer sent this image${caption ? ` with the message: "${caption}"` : ''}.

Analyze the image and respond in ONE of these formats:

1. If it shows a DAMAGED/BROKEN lock, error, or any product issue:
SERVICE_SUMMARY: <one-line issue summary for records, e.g. "Lock cylinder damaged - mechanism exposed">
SERVICE_MESSAGE: <friendly message to customer: identify the problem, give brief troubleshooting if possible, reassure that a technician can help fix it>

2. If it shows a YALE PRODUCT and they want info:
<just reply normally identifying the product and sharing details>

3. If it shows a DOOR/SPACE where they want to install a lock:
<suggest suitable Yale products based on what you see>

4. For anything else:
<describe what you see and ask how you can help>

Keep response under 200 words, WhatsApp-friendly format.`;

    const result = await model.generateContent([prompt, imagePart]);
    const raw = result.response.text();
    return parseAIResponse(raw);
  } catch (err) {
    console.error('Gemini image analysis error:', err.message);
    return null;
  }
}
