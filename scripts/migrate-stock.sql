-- ============================================================================
-- MLV Enterprises — out-of-stock support
-- Run once in Supabase → SQL Editor. Safe to re-run.
-- Adds a stock flag to products (defaults to in-stock).
-- ============================================================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN NOT NULL DEFAULT true;
