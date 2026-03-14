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
  price_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  condition VARCHAR(3) NOT NULL CHECK (condition IN ('NM', 'SP', 'MP', 'HP', 'DMG')),
  quantity INTEGER NOT NULL DEFAULT 1,
  is_foil BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT stock_items_scryfall_condition_foil_unique UNIQUE (scryfall_id, condition, is_foil)
);

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES buyers(id) ON DELETE SET NULL,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('pix', 'dinheiro', 'fiado', 'cartao', 'troca')),
  notes TEXT,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  stock_item_id UUID REFERENCES stock_items(id) ON DELETE SET NULL,
  card_name VARCHAR(255) NOT NULL,
  set_name VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  condition VARCHAR(3) NOT NULL,
  is_foil BOOLEAN NOT NULL DEFAULT false,
  quantity INTEGER NOT NULL DEFAULT 1,
  purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
