-- Phase 8 & 9: Realtime Publication
-- Enables Supabase Realtime for orders and order_items to power the KDS and Customer tracking.

-- Check if publication exists, if not create it (Supabase creates supabase_realtime by default)
-- Add tables to publication safely
BEGIN;

DO $$ 
BEGIN
    -- Add orders if not already in publication
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE orders;
    END IF;

    -- Add order_items if not already in publication
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'order_items'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
    END IF;
END $$;

COMMIT;
