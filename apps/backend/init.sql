CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  instagram VARCHAR(100),
  city VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scryfall_id VARCHAR(255) NOT NULL,
  card_name VARCHAR(255) NOT NULL,
  set_name VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  condition VARCHAR(3) NOT NULL CHECK (condition IN ('NM', 'SP', 'MP', 'HP', 'DMG')),
  quantity INTEGER NOT NULL DEFAULT 1,
  is_foil BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT stock_items_scryfall_condition_foil_unique UNIQUE (scryfall_id, condition, is_foil)
);
