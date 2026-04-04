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

BOOKING DETECTION:
- If the user says "okay", "I need", "yes", "interested", "I want", "book", "order", "go ahead", "proceed" and it's clearly about ordering a product → return ONLY: BOOKING:<product name>

SERVICE/COMPLAINT DETECTION:
- If the user reports a problem, complaint, broken lock, not working, battery issue, service needed → return ONLY: SERVICE:<brief AI analysis of the issue and what might be wrong, plus reassurance>
- Examples: "my lock is not working", "fingerprint sensor broken", "lock jammed", "battery dead", "beeping sound"

PRODUCT QUERIES:
- For product questions, recommend the best matching products with details
- Always end with: _Reply *order* to book, or ask me anything else!_

CUSTOMER QUERY: "${query}"

Reply:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text) return null;

    if (text.trim() === 'NULL' || text.trim() === 'null') return null;

    return text;
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

Analyze the image and respond appropriately:

1. If it shows a DAMAGED/BROKEN lock, error on a lock screen, or any product issue:
   - Identify what the problem might be
   - Give brief troubleshooting advice if possible
   - Return: SERVICE:<your analysis of the issue, what seems wrong, and reassurance that a technician can help>

2. If it shows a YALE PRODUCT and they seem to want info:
   - Identify the product if possible
   - Share relevant details from the catalog

3. If it shows a DOOR or SPACE where they want to install a lock:
   - Suggest suitable products based on what you see

4. For anything else, describe what you see and ask how you can help.

Keep response under 200 words, WhatsApp-friendly format.`;

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();
    return text || null;
  } catch (err) {
    console.error('Gemini image analysis error:', err.message);
    return null;
  }
}
