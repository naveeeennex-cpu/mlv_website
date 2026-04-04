import { getClientByPhoneId } from './lib/clients.js';
import { handleMessage } from './lib/handler.js';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'mlv_whatsapp_bot_2026';

export default async function handler(req, res) {
  // GET — Meta webhook verification
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified');
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // POST — Incoming messages
  if (req.method === 'POST') {
    const body = req.body;

    if (body.object !== 'whatsapp_business_account') {
      return res.status(400).send('Not a WhatsApp event');
    }

    // Process each entry
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue;

        const value = change.value;
        const phoneNumberId = value.metadata?.phone_number_id;

        if (!phoneNumberId) continue;

        // Multi-tenant: find client by phone number ID
        const client = getClientByPhoneId(phoneNumberId);
        if (!client) {
          console.warn(`No client configured for phone_number_id: ${phoneNumberId}`);
          continue;
        }

        // Process each message
        for (const message of value.messages || []) {
          try {
            await handleMessage(message, client);
          } catch (err) {
            console.error('Error handling message:', err);
          }
        }
      }
    }

    return res.status(200).send('OK');
  }

  return res.status(405).send('Method not allowed');
}
