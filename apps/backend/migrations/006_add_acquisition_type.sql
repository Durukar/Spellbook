DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'acquisition_type_enum') THEN
        CREATE TYPE acquisition_type_enum AS ENUM ('purchase', 'accumulated', 'gift', 'trade');
    END IF;
END$$;

ALTER TABLE stock_items
    ADD COLUMN IF NOT EXISTS acquisition_type acquisition_type_enum NOT NULL DEFAULT 'purchase';
