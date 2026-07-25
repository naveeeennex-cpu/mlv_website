import { getDb } from './lib/db.js';

const CORS = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
};

export default async function handler(req, res) {
  CORS(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const db = getDb();
  const { id } = req.query;

  // Single product by id
  if (id) {
    const { rows } = await db.query(`
      SELECT p.*, pc.id AS cat_id, pc.name AS category_name, pc.parent_id
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE p.id = $1 AND p.is_active = true
    `, [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(normalize(rows[0]));
  }

  // Full hierarchy: groups -> sub-categories -> products
  const { rows: cats } = await db.query('SELECT * FROM product_categories ORDER BY sort_order, name');
  const { rows: prods } = await db.query('SELECT * FROM products WHERE is_active = true ORDER BY name');

  const catById = Object.fromEntries(cats.map(c => [c.id, c]));
  const productsByCat = {};
  for (const p of prods) {
    if (!productsByCat[p.category_id]) productsByCat[p.category_id] = [];
    productsByCat[p.category_id].push(normalize(p));
  }

  const buildSub = (c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    products: productsByCat[c.id] || [],
  });

  const result = [];

  // Top-level groups (parent_id null) with their non-empty sub-categories.
  const groups = cats.filter(c => !c.parent_id);
  for (const g of groups) {
    const subs = cats.filter(c => c.parent_id === g.id).map(buildSub).filter(s => s.products.length);
    // A group that also holds products directly shows them as a sub named after itself.
    const direct = productsByCat[g.id] || [];
    if (direct.length) subs.unshift({ id: g.id, name: g.name, description: g.description, products: direct });
    // Include the group even when empty so the UI can show a "coming soon" state.
    result.push({ id: g.id, name: g.name, description: g.description, subcategories: subs });
  }

  // Orphan sub-categories (parent missing) become their own group, if they have products.
  for (const c of cats) {
    if (c.parent_id && !catById[c.parent_id]) {
      const sub = buildSub(c);
      if (sub.products.length) {
        result.push({ id: c.id, name: c.name, description: c.description, subcategories: [sub] });
      }
    }
  }

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(result);
}

function normalize(p) {
  return {
    id: p.id,
    name: p.name,
    code: p.code,
    price: p.price,
    mrp: p.mrp || `₹${Number(p.price).toLocaleString('en-IN')}`,
    description: p.description,
    features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]'),
    specs: typeof p.specs === 'object' && p.specs !== null ? p.specs : JSON.parse(p.specs || '{}'),
    finishes: Array.isArray(p.finishes) ? p.finishes : JSON.parse(p.finishes || '[]'),
    doorMaterial: Array.isArray(p.door_material) ? p.door_material : JSON.parse(p.door_material || '[]'),
    doorConfiguration: Array.isArray(p.door_configuration) ? p.door_configuration : JSON.parse(p.door_configuration || '[]'),
    image: p.image,
    bundleIncludes: p.bundle_includes || null,
    inStock: p.in_stock !== false,
    category_id: p.category_id || p.cat_id,
    category_name: p.category_name,
    parent_id: p.parent_id,
  };
}
