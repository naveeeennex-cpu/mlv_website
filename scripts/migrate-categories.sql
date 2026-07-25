-- ============================================================================
-- MLV Enterprises — category hierarchy migration
-- Run this ONCE in Supabase → SQL Editor.
-- Safe to re-run (idempotent). Does NOT touch product names / prices / MRPs.
--
-- Model: product_categories.parent_id
--   parent_id IS NULL  -> top-level group  (Smart Products, Digital Safes, ...)
--   parent_id IS SET   -> sub-category     (Smart Door Locks, Fire Safes, ...)
--   products.category_id always points at a sub-category (a leaf).
-- ============================================================================

-- 1. Hierarchy column ---------------------------------------------------------
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS parent_id TEXT;

-- 2. Top-level groups ---------------------------------------------------------
INSERT INTO product_categories (id, name, description, sort_order, parent_id) VALUES
  ('grp-smart-products',  'Smart Products',  'Smart locks, doorbells, cameras and accessories', 0, NULL),
  ('grp-digital-safes',   'Digital Safes',   'Digital and biometric safes',                     1, NULL),
  ('grp-smart-automation','Smart Automation','Smart home automation (coming soon)',             2, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, parent_id = NULL;

-- 3. Existing Smart-Products categories -> under the Smart Products group ------
UPDATE product_categories SET parent_id = 'grp-smart-products'
 WHERE id IN ('smart-door-locks','digital-door-locks','digital-wardrobe-locks',
              'smart-lock-accessories','smart-video-doorbell',
              'smart-surveillance-camera','video-door-phone');

-- 4. Safe sub-categories under the Digital Safes group ------------------------
INSERT INTO product_categories (id, name, description, sort_order, parent_id) VALUES
  ('fire-safes',             'Fire Safes',              'Fire rated digital safes',        0, 'grp-digital-safes'),
  ('maximum-security-safes', 'Maximum Security Safes',  'Top-tier maximum security safes', 1, 'grp-digital-safes'),
  ('high-security-safes',    'High Security Safes',     'High security home/office safes',  2, 'grp-digital-safes'),
  ('cosmos-safes',           'Cosmos Safes',            'Cosmos series safes',             3, 'grp-digital-safes'),
  ('stellar-safes',          'Stellar Safes',           'Stellar series biometric safes',  4, 'grp-digital-safes'),
  ('elite-safes',            'Elite Safes',             'Heavy duty / elite safes',        5, 'grp-digital-safes'),
  ('classic-biometric-safes','Classic Biometric Safes', 'Classic biometric series',        6, 'grp-digital-safes'),
  ('standard-safes',         'Standard Safes',          'Standard PIN code and guest safes',7, 'grp-digital-safes')
ON CONFLICT (id) DO NOTHING;

-- 5. Existing Smart Safes category -> under the Digital Safes group ------------
UPDATE product_categories SET parent_id = 'grp-digital-safes', sort_order = 8
 WHERE id = 'smart-safes';

-- 6. Re-tag the safe products (all currently sitting in 'digital-safes') -------
--    Order matters: specific matches first, then a catch-all to Standard.
UPDATE products SET category_id = 'fire-safes'              WHERE category_id = 'digital-safes' AND name ILIKE '%fire%';
UPDATE products SET category_id = 'maximum-security-safes'  WHERE category_id = 'digital-safes' AND name ILIKE '%maximum%';
UPDATE products SET category_id = 'high-security-safes'     WHERE category_id = 'digital-safes' AND name ILIKE '%high security%';
UPDATE products SET category_id = 'cosmos-safes'            WHERE category_id = 'digital-safes' AND name ILIKE '%cosmos%';
UPDATE products SET category_id = 'stellar-safes'           WHERE category_id = 'digital-safes' AND name ILIKE '%stellar%';
UPDATE products SET category_id = 'elite-safes'             WHERE category_id = 'digital-safes' AND (name ILIKE '%heavy duty%' OR name ILIKE '%elite%');
UPDATE products SET category_id = 'classic-biometric-safes' WHERE category_id = 'digital-safes' AND name ILIKE '%classic%';
UPDATE products SET category_id = 'standard-safes'          WHERE category_id = 'digital-safes';

-- 7. Old 'digital-safes' leaf is now empty -> remove it -----------------------
DELETE FROM product_categories WHERE id = 'digital-safes';

-- Done. Verify:
--   SELECT c.id, c.name, c.parent_id, COUNT(p.id) AS products
--   FROM product_categories c LEFT JOIN products p ON p.category_id = c.id
--   GROUP BY c.id, c.name, c.parent_id ORDER BY c.parent_id NULLS FIRST, c.sort_order;
