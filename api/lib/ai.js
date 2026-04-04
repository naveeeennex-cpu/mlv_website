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
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const productContext = buildProductContext(client.products);

    const prompt = `You are a helpful WhatsApp sales assistant for ${client.businessName}. You help customers find the right Yale products.

PRODUCT CATALOG:
${productContext}

RULES:
- Answer in a friendly, concise WhatsApp-friendly format (short paragraphs, use emojis sparingly)
- Always include product name, price, and key features in recommendations
- If asked about a product not in the catalog, say you don't carry it
- If the query is not about products (greeting, random chat), return null
- Keep responses under 300 words
- For booking/installation queries, ask them to reply with their Name, Location, and preferred date
- Always end with a helpful follow-up question or CTA
- Contact: ${client.ownerPhone ? `+${client.ownerPhone}` : 'our team'}

CUSTOMER QUERY: "${query}"

Reply:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text || null;
  } catch (err) {
    console.error('Gemini AI error:', err.message);
    return null;
  }
}
