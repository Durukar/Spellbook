ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS carrier VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS shipping_status VARCHAR(30) NOT NULL DEFAULT 'pending_shipment',
  ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE NULL,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE NULL;

CREATE TABLE IF NOT EXISTS shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  event_code VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NULL,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_shipment_event UNIQUE (sale_id, event_code, occurred_at)
);

CREATE INDEX IF NOT EXISTS idx_shipment_events_sale_id ON shipment_events (sale_id);
