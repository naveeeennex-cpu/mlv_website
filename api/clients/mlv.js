// MLV Enterprises - Yale Smart Lock Experts
// Product data imported from the frontend catalog

import { PRODUCT_CATEGORIES } from '../../src/data/products.js';

export const mlvConfig = {
  phoneNumberId: process.env.MLV_PHONE_ID || '1054951294370438',
  accessToken: process.env.MLV_WA_TOKEN,
  businessName: 'MLV Enterprises',
  ownerPhone: '919176186062',
  websiteUrl: 'https://mlv-website.vercel.app',
  products: PRODUCT_CATEGORIES,
};
