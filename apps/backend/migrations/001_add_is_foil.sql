ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS is_foil BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE stock_items DROP CONSTRAINT IF EXISTS stock_items_scryfall_condition_unique;

ALTER TABLE stock_items
  ADD CONSTRAINT stock_items_scryfall_condition_foil_unique
  UNIQUE (scryfall_id, condition, is_foil);
