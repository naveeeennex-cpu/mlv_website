import { getDb } from './db.js';

// Allowed values (single source of truth for the bot's buttons & matching).
export const DOOR_MATERIALS = ['Wooden Door', 'Metal Door', 'uPVC Door', 'Glass Door'];
export const DOOR_CONFIGS = ['Single Door', 'Double Door', 'Sliding Door', 'Others'];
export const DOOR_LOCATIONS = ['Main Door', 'Master Bedroom', 'Bedroom', 'Balcony', 'Others'];

// Meta "Other Products" categories → the product_categories ids they map to.
export const OTHER_CATEGORIES = [
  { key: 'safe',       label: 'Safe Lock',            categories: ['standard-safes', 'smart-safes', 'stellar-safes', 'elite-safes', 'fire-safes', 'high-security-safes', 'maximum-security-safes', 'classic-biometric-safes', 'cosmos-safes'] },
  { key: 'wardrobe',   label: 'Wardrobe Lock',        categories: ['digital-wardrobe-locks'] },
  { key: 'vdp',        label: 'Video Door Phone',     categories: ['video-door-phone'] },
  { key: 'vdb',        label: 'Video Door Bell',      categories: ['smart-video-doorbell'] },
  { key: 'automation', label: 'Automation Lock',      categories: ['smart-door-locks', 'door-control-devices'] },
];

// jsonb array helper — pg returns jsonb already parsed.
function arr(v) {
  if (Array.isArray(v)) return v;
  if (v == null) return [];
  try { return JSON.parse(v); } catch { return []; }
}

// Normalize a DB row into the shape the bot renders.
export function shapeProduct(p) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    code: p.code,
    price: p.price,
    mrp: p.mrp,
    description: p.description,
    image: p.image,
    features: arr(p.features),
    specs: (p.specs && typeof p.specs === 'object') ? p.specs : {},
    applications: p.applications || null,
    advantages: p.advantages || null,
    doorMaterial: arr(p.door_material),
    doorConfiguration: arr(p.door_configuration),
    categoryId: p.category_id,
  };
}

// Longest active-product-name match inside an inbound message.
// Website sends: "Hi, I'm interested in Yale <name> (<price>). ..."
export async function findProductByMessage(text) {
  if (!text) return null;
  const hay = text.toLowerCase();
  const db = getDb();
  const { rows } = await db.query(
    'SELECT * FROM products WHERE is_active = true ORDER BY length(name) DESC'
  );
  let best = null;
  for (const p of rows) {
    const n = (p.name || '').toLowerCase().trim();
    const code = (p.code || '').toLowerCase().trim();
    if (n && hay.includes(n)) { if (!best || n.length > best._len) best = { ...p, _len: n.length }; }
    else if (code && code !== n && hay.includes(code)) { if (!best || code.length > best._len) best = { ...p, _len: code.length }; }
  }
  return best ? shapeProduct(best) : null;
}

export async function getProductById(id) {
  const db = getDb();
  const { rows } = await db.query('SELECT * FROM products WHERE id = $1 AND is_active = true', [id]);
  return rows[0] ? shapeProduct(rows[0]) : null;
}

// Compatibility = door_material contains the chosen material AND
// door_configuration contains the chosen configuration. Location is NOT checked.
// "Others" configuration is treated as no configuration constraint.
export function isCompatible(product, material, config) {
  if (!product) return false;
  const matOk = product.doorMaterial.length === 0 ? false : product.doorMaterial.includes(material);
  const cfgOk = (!config || config === 'Others')
    ? true
    : (product.doorConfiguration.length > 0 && product.doorConfiguration.includes(config));
  return matOk && cfgOk;
}

// Find lock products that match the chosen material (+ configuration when specified).
export async function searchCompatible(material, config, limit = 8) {
  const db = getDb();
  const params = [JSON.stringify([material])];
  let sql = `SELECT * FROM products
    WHERE is_active = true AND in_stock IS NOT FALSE
      AND door_material @> $1::jsonb`;
  if (config && config !== 'Others') {
    params.push(JSON.stringify([config]));
    sql += ` AND door_configuration @> $${params.length}::jsonb`;
  }
  sql += ` ORDER BY price ASC LIMIT ${Number(limit)}`;
  const { rows } = await db.query(sql, params);
  return rows.map(shapeProduct);
}

// Products for a Meta "Other Products" category group.
export async function categoryProducts(groupKey, limit = 8) {
  const group = OTHER_CATEGORIES.find(g => g.key === groupKey);
  if (!group) return [];
  const db = getDb();
  const { rows } = await db.query(
    `SELECT * FROM products
     WHERE is_active = true AND in_stock IS NOT FALSE AND category_id = ANY($1)
     ORDER BY price ASC LIMIT ${Number(limit)}`,
    [group.categories]
  );
  return rows.map(shapeProduct);
}
