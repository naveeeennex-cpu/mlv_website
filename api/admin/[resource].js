import bcrypt from 'bcryptjs';
import { signToken, requireAuth, cors } from '../lib/auth.js';
import { getDb } from '../lib/db.js';
import { getClientByPhoneId, getAllClients } from '../lib/clients.js';
import { invalidateConfig } from '../lib/config.js';
import { runFollowUp } from '../lib/followup.js';
import { sendText, sendImageUrl } from '../lib/whatsapp.js';

const GRAPH_API = 'https://graph.facebook.com/v22.0';
const DELAY_MS = 500;
const BUCKET = 'mlv-media';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function sendWA(phoneNumberId, accessToken, to, payload) {
  try {
    const res = await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, ...payload }),
    });
    return { ok: res.ok, data: await res.json() };
  } catch { return { ok: false, data: {} }; }
}

function buildMsgPayload(message, buttons) {
  if (buttons?.length > 0) {
    return {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: message },
        action: {
          buttons: buttons.slice(0, 3).map((b, i) => ({
            type: 'reply', reply: { id: `btn_${i}`, title: b.slice(0, 20) },
          })),
        },
      },
    };
  }
  return { type: 'text', text: { body: message } };
}

// ── handlers ────────────────────────────────────────────────────────────────

async function handleLogin(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const db = getDb();
  const { rows } = await db.query('SELECT * FROM admin_users WHERE username = $1', [username]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken({ id: user.id, username: user.username });
  return res.status(200).json({ token, username: user.username });
}

async function handleProducts(req, res) {
  const db = getDb();
  if (req.method === 'GET') {
    const { category, search } = req.query;
    let query = `SELECT p.*, pc.name AS category_name FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id WHERE p.is_active = true`;
    const params = [];
    if (category) { params.push(category); query += ` AND p.category_id = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (p.name ILIKE $${params.length} OR p.code ILIKE $${params.length})`; }
    query += ' ORDER BY pc.sort_order, p.name';
    const { rows } = await db.query(query, params);
    return res.status(200).json(rows);
  }
  if (req.method === 'POST') {
    const { id, category_id, name, code, price, mrp, description, features, specs, finishes, image, bundle_includes, door_material, door_configuration } = req.body;
    if (!id || !name || !price) return res.status(400).json({ error: 'id, name, price required' });
    const { rows } = await db.query(`
      INSERT INTO products (id,category_id,name,code,price,mrp,description,features,specs,finishes,image,bundle_includes,door_material,door_configuration)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [id, category_id, name, code || '', price,
       mrp || `₹${Number(price).toLocaleString('en-IN')}`,
       description || '', JSON.stringify(features || []),
       JSON.stringify(specs || {}), JSON.stringify(finishes || []),
       image || '', bundle_includes || null,
       JSON.stringify(door_material || []), JSON.stringify(door_configuration || [])]);
    return res.status(201).json(rows[0]);
  }
  if (req.method === 'PUT') {
    const { id, price, mrp, name, code, description, features, specs, finishes, image, bundle_includes, category_id, in_stock, door_material, door_configuration } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });
    const fields = []; const params = [];
    const set = (col, val) => { params.push(val); fields.push(`${col} = $${params.length}`); };
    if (price !== undefined) set('price', price);
    if (mrp !== undefined) set('mrp', mrp); // struck-through MRP, edited independently of price
    if (in_stock !== undefined) set('in_stock', !!in_stock);
    if (name !== undefined) set('name', name);
    if (code !== undefined) set('code', code);
    if (description !== undefined) set('description', description);
    if (features !== undefined) set('features', JSON.stringify(features));
    if (specs !== undefined) set('specs', JSON.stringify(specs));
    if (finishes !== undefined) set('finishes', JSON.stringify(finishes));
    if (image !== undefined) set('image', image);
    if (bundle_includes !== undefined) set('bundle_includes', bundle_includes);
    if (category_id !== undefined) set('category_id', category_id);
    if (door_material !== undefined) set('door_material', JSON.stringify(door_material));
    if (door_configuration !== undefined) set('door_configuration', JSON.stringify(door_configuration));
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    params.push(id);
    const { rows } = await db.query(`UPDATE products SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`, params);
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    return res.status(200).json(rows[0]);
  }
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id required' });
    await db.query('UPDATE products SET is_active = false WHERE id = $1', [id]);
    return res.status(200).json({ success: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleConfig(req, res) {
  const db = getDb();
  if (req.method === 'GET') {
    const { key } = req.query;
    if (key) {
      const { rows } = await db.query('SELECT * FROM admin_config WHERE key = $1', [key]);
      if (!rows[0]) return res.status(404).json({ error: 'Key not found' });
      return res.status(200).json(rows[0]);
    }
    const { rows } = await db.query('SELECT * FROM admin_config ORDER BY key');
    return res.status(200).json(rows);
  }
  if (req.method === 'PUT') {
    const { key, value } = req.body || {};
    if (!key || value === undefined) return res.status(400).json({ error: 'key and value required' });
    const { rows } = await db.query(`
      INSERT INTO admin_config (key,value) VALUES ($1,$2)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW() RETURNING *`, [key, value]);
    invalidateConfig(key);
    return res.status(200).json(rows[0]);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

function slugify(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function handleCategories(req, res) {
  const db = getDb();

  if (req.method === 'GET') {
    const { rows } = await db.query('SELECT * FROM product_categories ORDER BY sort_order, name');
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { id, name, description, parent_id, sort_order } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    const catId = slugify(id || name);
    if (!catId) return res.status(400).json({ error: 'Invalid category id' });
    const { rows } = await db.query(`
      INSERT INTO product_categories (id, name, description, parent_id, sort_order)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
        parent_id = EXCLUDED.parent_id, sort_order = EXCLUDED.sort_order
      RETURNING *`,
      [catId, name, description || '', parent_id || null, Number(sort_order) || 0]);
    return res.status(201).json(rows[0]);
  }

  if (req.method === 'PUT') {
    const { id, name, description, parent_id, sort_order } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });
    if (parent_id && parent_id === id) return res.status(400).json({ error: 'A category cannot be its own parent' });
    const fields = []; const params = [];
    const set = (col, val) => { params.push(val); fields.push(`${col} = $${params.length}`); };
    if (name !== undefined) set('name', name);
    if (description !== undefined) set('description', description);
    if (parent_id !== undefined) set('parent_id', parent_id || null);
    if (sort_order !== undefined) set('sort_order', Number(sort_order) || 0);
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    params.push(id);
    const { rows } = await db.query(`UPDATE product_categories SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`, params);
    if (!rows[0]) return res.status(404).json({ error: 'Category not found' });
    return res.status(200).json(rows[0]);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id required' });
    const { rows: kids } = await db.query('SELECT 1 FROM product_categories WHERE parent_id = $1 LIMIT 1', [id]);
    if (kids.length) return res.status(409).json({ error: 'This category has sub-categories — delete or move them first' });
    const { rows: prods } = await db.query('SELECT 1 FROM products WHERE category_id = $1 AND is_active = true LIMIT 1', [id]);
    if (prods.length) return res.status(409).json({ error: 'This category still has products — move them first' });
    await db.query('DELETE FROM product_categories WHERE id = $1', [id]);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleCustomers(req, res) {
  const db = getDb();
  if (req.method === 'GET') {
    const { filter, search } = req.query;
    let query = 'SELECT * FROM customers';
    const params = []; const where = [];
    if (filter === 'booked') where.push('booked = true');
    if (filter === 'not_booked') where.push('booked = false');
    if (search) { params.push(`%${search}%`); where.push(`(phone ILIKE $${params.length} OR name ILIKE $${params.length})`); }
    if (where.length) query += ' WHERE ' + where.join(' AND ');
    query += ' ORDER BY last_seen DESC';
    const { rows } = await db.query(query, params);
    return res.status(200).json(rows);
  }
  if (req.method === 'PATCH') {
    const { phone, notes } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone required' });
    const { rows } = await db.query('UPDATE customers SET notes = $1 WHERE phone = $2 RETURNING *', [notes, phone]);
    return res.status(200).json(rows[0] || {});
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleSendMessage(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { phone, message, buttons } = req.body || {};
  if (!phone || !message) return res.status(400).json({ error: 'phone and message required' });
  const client = getClientByPhoneId(process.env.MLV_PHONE_ID || '1054951294370438');
  if (!client) return res.status(500).json({ error: 'Client config not found' });
  const result = await sendWA(client.phoneNumberId, client.accessToken, phone, buildMsgPayload(message, buttons));
  return res.status(result.ok ? 200 : 502).json(result.data);
}

async function handleBroadcast(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { message, buttons, filter = 'all' } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });
  const db = getDb();
  const client = getClientByPhoneId(process.env.MLV_PHONE_ID || '1054951294370438');
  if (!client) return res.status(500).json({ error: 'Client config not found' });

  let query = 'SELECT phone, name FROM customers';
  if (filter === 'booked') query += ' WHERE booked = true';
  if (filter === 'not_booked') query += ' WHERE booked = false';
  const { rows: customers } = await db.query(query);
  if (!customers.length) return res.status(200).json({ sent: 0, failed: 0, total: 0 });

  let sent = 0, failed = 0;
  for (const c of customers) {
    const text = message.replace(/\{name\}/gi, c.name || 'there');
    const { ok } = await sendWA(client.phoneNumberId, client.accessToken, c.phone, buildMsgPayload(text, buttons));
    if (ok) sent++; else failed++;
    await sleep(DELAY_MS);
  }

  await db.query('INSERT INTO broadcast_log (message, buttons, recipient_count, filter) VALUES ($1,$2,$3,$4)',
    [message, buttons ? JSON.stringify(buttons) : null, sent, filter]);
  return res.status(200).json({ sent, failed, total: customers.length });
}

async function handleCronConfig(req, res) {
  const db = getDb();
  if (req.method === 'GET') {
    const { rows: config } = await db.query(
      "SELECT key,value FROM admin_config WHERE key IN ('cron_enabled','followup_message','cron_last_run','cron_last_count')");
    const { rows: log } = await db.query('SELECT * FROM broadcast_log ORDER BY sent_at DESC LIMIT 10');
    return res.status(200).json({ settings: Object.fromEntries(config.map(r => [r.key, r.value])), log });
  }
  if (req.method === 'PUT') {
    const { key, value } = req.body || {};
    const allowed = ['cron_enabled', 'followup_message'];
    if (!key || !allowed.includes(key)) return res.status(400).json({ error: 'Invalid key' });
    await db.query(`INSERT INTO admin_config (key,value) VALUES ($1,$2)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`, [key, value]);
    invalidateConfig(key);
    return res.status(200).json({ ok: true });
  }
  if (req.method === 'POST') {
    const { action } = req.body || {};
    if (action !== 'trigger') return res.status(400).json({ error: 'action must be trigger' });
    try {
      const data = await runFollowUp();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleMessages(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { phone, limit = '100', offset = '0' } = req.query;
  if (!phone) return res.status(400).json({ error: 'phone is required' });
  const db = getDb();
  const { rows } = await db.query(
    'SELECT id,role,message,created_at FROM messages WHERE phone=$1 ORDER BY created_at ASC LIMIT $2 OFFSET $3',
    [phone, parseInt(limit), parseInt(offset)]);
  return res.status(200).json(rows);
}

async function handleAnnouncements(req, res) {
  const db = getDb();
  await db.query(`CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY, message TEXT NOT NULL, image_url TEXT,
    filter_type TEXT NOT NULL DEFAULT 'all', recipient_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0, sent_at TIMESTAMPTZ DEFAULT NOW())`);

  if (req.method === 'GET') {
    const { rows } = await db.query('SELECT * FROM announcements ORDER BY sent_at DESC LIMIT 20');
    return res.status(200).json(rows);
  }
  if (req.method === 'POST') {
    const { message, imageUrl, filterType = 'all', phones = [] } = req.body || {};
    if (!message?.trim()) return res.status(400).json({ error: 'message is required' });

    let recipients = [];
    if (filterType === 'custom') {
      if (!phones.length) return res.status(400).json({ error: 'No recipients selected' });
      recipients = phones.map(p => ({ phone: p, name: null }));
      try {
        const ph = phones.map((_, i) => `$${i + 1}`).join(',');
        const { rows } = await db.query(`SELECT phone, session_data->>'name' AS name FROM sessions WHERE phone IN (${ph})`, phones);
        const nm = Object.fromEntries(rows.map(r => [r.phone, r.name]));
        recipients = recipients.map(r => ({ ...r, name: nm[r.phone] || null }));
      } catch {}
    } else {
      const where = filterType === 'booked'
        ? "WHERE (session_data->>'bookedAppointment')::boolean IS TRUE"
        : filterType === 'not_booked'
          ? "WHERE (session_data->>'bookedAppointment')::boolean IS NOT TRUE AND (session_data->>'hasInteracted')::boolean IS TRUE"
          : "WHERE (session_data->>'hasInteracted')::boolean IS TRUE";
      const { rows } = await db.query(`SELECT phone, session_data->>'name' AS name FROM sessions ${where}`);
      recipients = rows.map(r => ({ phone: r.phone, name: r.name }));
    }

    if (!recipients.length) return res.status(200).json({ sent: 0, failed: 0, total: 0 });
    const client = getAllClients()[0];
    if (!client) return res.status(500).json({ error: 'No WhatsApp client configured' });

    let sent = 0, failed = 0;
    for (const { phone, name } of recipients) {
      const text = message.replace(/\{name\}/gi, name || 'there');
      try {
        const result = imageUrl?.trim()
          ? await sendImageUrl(client.phoneNumberId, client.accessToken, phone, imageUrl.trim(), text)
          : await sendText(client.phoneNumberId, client.accessToken, phone, text);
        if (result.ok) sent++; else failed++;
      } catch { failed++; }
    }

    await db.query('INSERT INTO announcements (message,image_url,filter_type,recipient_count,failed_count) VALUES ($1,$2,$3,$4,$5)',
      [message.trim(), imageUrl?.trim() || null, filterType, sent, failed]).catch(() => {});
    return res.status(200).json({ sent, failed, total: recipients.length });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleUpload(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { base64, filename, folder = 'general' } = req.body || {};
  if (!base64 || !filename) return res.status(400).json({ error: 'base64 and filename are required' });

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars required' });

  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  const mimeMatch = base64.match(/^data:([^;]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const buffer = Buffer.from(base64Data, 'base64');
  if (buffer.length > 4 * 1024 * 1024) return res.status(400).json({ error: 'File too large — max 4MB' });

  // Ensure bucket exists
  await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });

  const ext = filename.split('.').pop().toLowerCase() || 'jpg';
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${folder}/${Date.now()}_${safeName}`;

  const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${supabaseKey}`, 'Content-Type': mimeType, 'x-upsert': 'true' },
    body: buffer,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    return res.status(500).json({ error: 'Upload failed', detail: err });
  }
  return res.status(200).json({ url: `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}` });
}

// ── router ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { resource } = req.query;

  // Login is public
  if (resource === 'login') return handleLogin(req, res);

  // All other routes require auth
  const user = requireAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    switch (resource) {
      case 'products':     return await handleProducts(req, res);
      case 'config':       return await handleConfig(req, res);
      case 'categories':   return await handleCategories(req, res);
      case 'customers':    return await handleCustomers(req, res);
      case 'send-message': return await handleSendMessage(req, res);
      case 'broadcast':    return await handleBroadcast(req, res);
      case 'cron-config':  return await handleCronConfig(req, res);
      case 'messages':     return await handleMessages(req, res);
      case 'announcements':return await handleAnnouncements(req, res);
      case 'upload':       return await handleUpload(req, res);
      default:             return res.status(404).json({ error: `Unknown resource: ${resource}` });
    }
  } catch (err) {
    console.error(`Admin handler error [${resource}]:`, err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
