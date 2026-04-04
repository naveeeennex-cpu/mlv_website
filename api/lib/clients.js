// Multi-tenant client registry
// Add new clients here — the webhook routes messages based on phone_number_id

import { mlvConfig } from '../clients/mlv.js';

const clients = [
  mlvConfig,
  // Add more clients here:
  // import { client2Config } from '../clients/client2.js';
  // client2Config,
];

export function getClientByPhoneId(phoneNumberId) {
  return clients.find(c => c.phoneNumberId === phoneNumberId) || null;
}

export function getAllClients() {
  return clients;
}
