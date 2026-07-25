import pg from 'pg';
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import { createHash } from 'crypto';

const { Client } = pg;

// Read the connection string from the environment — never hardcode credentials.
// Run with:  $env:DATABASE_URL="postgresql://..."; npm run seed
const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error('DATABASE_URL is not set. Example:\n  $env:DATABASE_URL="postgresql://user:pass@host:6543/postgres"; npm run seed');
  process.exit(1);
}

// Load products by transforming the ES module source
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsSrc = readFileSync(path.join(__dirname, '../src/data/products.js'), 'utf8');

// Extract PRODUCT_CATEGORIES via dynamic import trick — write a temp CJS shim
import { PRODUCT_CATEGORIES } from '../src/data/products.js';

const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

async function seed() {
  await client.connect();
  console.log('Connected to Supabase');

  // Insert default admin user (password: Mlv@admin2026)
  // Simple SHA256 — we'll swap to bcrypt in API layer; seed just needs a placeholder
  const pwHash = createHash('sha256').update('Mlv@admin2026').digest('hex');
  await client.query(`
    INSERT INTO admin_users (username, password_hash)
    VALUES ('mlvadmin', $1)
    ON CONFLICT (username) DO NOTHING
  `, [pwHash]);
  console.log('Admin user seeded');

  // Insert default AI prompt
  const defaultPrompt = `You are an AI assistant for MLV Enterprises, an authorized Yale smart lock dealer in Chennai, India.
Your job is to help customers discover the right Yale smart lock or security product for their needs.
- Be friendly, concise, and helpful in Tamil-English (Tanglish) or English based on customer preference.
- Recommend products based on budget, door type, and security needs.
- Guide customers through booking a demo or service appointment.
- Always mention warranty, installation support, and after-sales service as MLV strengths.
- When asked about price, give the MRP and mention that special offers may apply.`;

  await client.query(`
    INSERT INTO admin_config (key, value)
    VALUES ('ai_prompt', $1)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `, [defaultPrompt]);
  console.log('Default AI prompt seeded');

  // Seed categories and products
  let catOrder = 0;
  let productCount = 0;

  for (const category of PRODUCT_CATEGORIES) {
    await client.query(`
      INSERT INTO product_categories (id, name, description, sort_order)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
    `, [category.id, category.name, category.description || '', catOrder++]);

    for (const p of category.products) {
      await client.query(`
        INSERT INTO products (id, category_id, name, code, price, mrp, description, features, specs, finishes, image, bundle_includes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          code = EXCLUDED.code,
          price = EXCLUDED.price,
          mrp = EXCLUDED.mrp,
          description = EXCLUDED.description,
          features = EXCLUDED.features,
          specs = EXCLUDED.specs,
          finishes = EXCLUDED.finishes,
          image = EXCLUDED.image,
          bundle_includes = EXCLUDED.bundle_includes
      `, [
        p.id,
        category.id,
        p.name,
        p.code || '',
        p.price,
        p.mrp || `₹${p.price.toLocaleString('en-IN')}`,
        p.description || '',
        JSON.stringify(p.features || []),
        JSON.stringify(p.specs || {}),
        JSON.stringify(p.finishes || []),
        p.image || '',
        p.bundleIncludes || null,
      ]);
      productCount++;
    }
    console.log(`  ✓ ${category.name} — ${category.products.length} products`);
  }

  console.log(`\nDone! Seeded ${productCount} products across ${catOrder} categories.`);
  await client.end();
}

seed().catch(e => { console.error(e); process.exit(1); });
