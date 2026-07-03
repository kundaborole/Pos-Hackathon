-- Phase 9: Secure QR Bootstrap and Order RPC

-- 1. Ensure only one active session per table to prevent concurrent scans from creating multiple overlapping sessions
CREATE UNIQUE INDEX IF NOT EXISTS idx_table_sessions_single_active ON table_sessions (table_id) WHERE status = 'active';

-- 2. Bootstrap Table Session RPC
-- Securely handles scanning a static physical QR code and returns an active table session public_token.
-- It creates one if it doesn't exist, or returns the existing active one safely.

DROP FUNCTION IF EXISTS bootstrap_table_session(TEXT);
CREATE OR REPLACE FUNCTION bootstrap_table_session(p_qr_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_table RECORD;
    v_restaurant RECORD;
    v_session_token UUID;
BEGIN
    -- 1. Validate the physical QR token
    SELECT * INTO v_table FROM restaurant_tables WHERE qr_token = p_qr_token AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'invalid_qr_token', 'message', 'Invalid or inactive table QR token');
    END IF;

    -- 2. Validate the restaurant is open
    SELECT * INTO v_restaurant FROM restaurants WHERE id = v_table.restaurant_id;
    
    -- In a real app, we'd check v_restaurant.is_open or business hours here.
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'restaurant_closed', 'message', 'Restaurant is not available');
    END IF;

    -- 3. Safely find or create an active table session
    -- We use a CTE with INSERT ON CONFLICT DO NOTHING, and if nothing was inserted, we SELECT the existing active one.
    
    -- Attempt to insert a new session
    INSERT INTO table_sessions (restaurant_id, table_id, status)
    VALUES (v_table.restaurant_id, v_table.id, 'active')
    ON CONFLICT (table_id) WHERE status = 'active'
    DO NOTHING
    RETURNING public_token INTO v_session_token;

    -- If no row was inserted (v_session_token is null), it means an active session already existed due to the unique index.
    IF v_session_token IS NULL THEN
        SELECT public_token INTO v_session_token FROM table_sessions WHERE table_id = v_table.id AND status = 'active';
    END IF;

    -- 4. Return secure context (No sensitive IDs exposed to the frontend unnecessarily, just the session token and names)
    RETURN jsonb_build_object(
        'success', true,
        'public_token', v_session_token,
        'restaurant_name', v_restaurant.name,
        'table_number', v_table.table_number
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'message', 'Failed to bootstrap table session');
END;
$$;


-- 3. Secure QR Order Creation RPC
-- Similar to create_pos_order but validates the table_session public_token instead of an authenticated staff user.

DROP FUNCTION IF EXISTS create_qr_order(JSONB);
CREATE OR REPLACE FUNCTION create_qr_order(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_session_token UUID;
    v_session RECORD;
    v_restaurant_prefix TEXT;
    v_idempotency_key TEXT;
    
    v_existing_order_id UUID;
    v_existing_order_num TEXT;

    v_special_instructions TEXT;
    
    v_subtotal NUMERIC(10,2) := 0.00;
    v_tax_amount NUMERIC(10,2) := 0.00;
    v_service_charge NUMERIC(10,2) := 0.00;
    v_discount_amount NUMERIC(10,2) := 0.00;
    v_total NUMERIC(10,2) := 0.00;
    
    v_order_id UUID;
    v_order_number TEXT;
    v_date_str TEXT;
    v_counter INTEGER;
    
    item JSONB;
    v_product RECORD;
    v_item_subtotal NUMERIC(10,2);
    v_item_total NUMERIC(10,2);
    v_item_tax NUMERIC(10,2);
    v_item_id UUID;
    v_qty INTEGER;
    
    v_variant JSONB;
    v_variant_record RECORD;
    
    v_addon JSONB;
    v_addon_record RECORD;

    v_kitchen_status kitchen_status := 'pending';
    v_needs_kitchen BOOLEAN := false;
BEGIN
    -- 1. Extract and Validate Session Token
    v_session_token := (payload->>'public_token')::UUID;
    IF v_session_token IS NULL THEN
        RETURN jsonb_build_object('error', 'unauthorized', 'message', 'Missing session token');
    END IF;

    SELECT * INTO v_session FROM table_sessions WHERE public_token = v_session_token AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'invalid_session', 'message', 'Session is expired, closed, or invalid');
    END IF;

    -- Look up restaurant details (currency, tax, prefix)
    SELECT order_prefix INTO v_restaurant_prefix FROM restaurants WHERE id = v_session.restaurant_id;

    -- 2. Idempotency Check
    v_idempotency_key := payload->>'idempotency_key';
    IF v_idempotency_key IS NOT NULL THEN
        SELECT id, order_number INTO v_existing_order_id, v_existing_order_num 
        FROM orders 
        WHERE restaurant_id = v_session.restaurant_id AND idempotency_key = v_idempotency_key;
        
        IF FOUND THEN
            RETURN jsonb_build_object(
                'success', true, 
                'order_id', v_existing_order_id, 
                'order_number', v_existing_order_num,
                'message', 'Idempotent request matched existing order'
            );
        END IF;
    END IF;

    -- 3. Extract safe payload details
    v_special_instructions := payload->>'special_instructions';

    -- 4. Safe Order Number Generation (concurrency-safe via row lock)
    v_date_str := to_char(NOW() AT TIME ZONE 'UTC', 'YYMMDD');
    
    INSERT INTO restaurant_order_counters (restaurant_id, date_str, counter)
    VALUES (v_session.restaurant_id, v_date_str, 1)
    ON CONFLICT (restaurant_id) DO UPDATE 
    SET date_str = EXCLUDED.date_str,
        counter = CASE WHEN restaurant_order_counters.date_str = EXCLUDED.date_str THEN restaurant_order_counters.counter + 1 ELSE 1 END
    RETURNING counter INTO v_counter;

    v_order_number := COALESCE(v_restaurant_prefix, 'ORD') || '-' || v_date_str || '-' || lpad(v_counter::TEXT, 4, '0');

    -- 5. Insert Draft Order (Source = qr)
    INSERT INTO orders (
        restaurant_id, order_number, table_id, created_by,
        source, order_type, order_status, kitchen_status, payment_status,
        subtotal, tax_amount, service_charge, discount_amount, total_amount,
        special_instructions, idempotency_key
    ) VALUES (
        v_session.restaurant_id, v_order_number, v_session.table_id, NULL, -- created_by is NULL for QR
        'qr', 'dine_in', 'draft', 'pending', 'unpaid',
        0, 0, 0, 0, 0,
        v_special_instructions, v_idempotency_key
    ) RETURNING id INTO v_order_id;

    -- 6. Process Items (Iterate JSON array)
    FOR item IN SELECT * FROM jsonb_array_elements(payload->'items')
    LOOP
        v_qty := (item->>'quantity')::INTEGER;
        IF v_qty IS NULL OR v_qty <= 0 THEN
            RAISE EXCEPTION 'invalid_quantity';
        END IF;

        -- Load authoritative product
        SELECT * INTO v_product FROM products 
        WHERE id = (item->>'product_id')::UUID 
        AND restaurant_id = v_session.restaurant_id;

        IF NOT FOUND OR NOT v_product.is_available THEN
            RAISE EXCEPTION 'product_unavailable';
        END IF;

        IF v_product.send_to_kitchen THEN
            v_needs_kitchen := true;
        END IF;

        v_item_subtotal := v_product.base_price;

        -- Process Variants
        IF item->'variants' IS NOT NULL THEN
            FOR v_variant IN SELECT * FROM jsonb_array_elements(item->'variants')
            LOOP
                SELECT vv.name AS value_name, vv.price_delta, pv.name AS variant_name
                INTO v_variant_record
                FROM product_variant_values vv
                JOIN product_variants pv ON pv.id = vv.variant_id
                WHERE vv.id = (v_variant->>'value_id')::UUID 
                AND pv.product_id = v_product.id;

                IF NOT FOUND THEN
                    RAISE EXCEPTION 'invalid_variant';
                END IF;

                v_item_subtotal := v_item_subtotal + v_variant_record.price_delta;
            END LOOP;
        END IF;

        -- Process Addons
        IF item->'addons' IS NOT NULL THEN
            FOR v_addon IN SELECT * FROM jsonb_array_elements(item->'addons')
            LOOP
                SELECT name, price INTO v_addon_record
                FROM product_addons
                WHERE id = (v_addon->>'addon_id')::UUID
                AND product_id = v_product.id
                AND is_available = true;

                IF NOT FOUND THEN
                    RAISE EXCEPTION 'invalid_addon';
                END IF;

                v_item_subtotal := v_item_subtotal + v_addon_record.price;
            END LOOP;
        END IF;

        -- Calculations
        v_item_total := v_item_subtotal * v_qty;
        v_item_tax := 0;
        IF v_product.tax_rate IS NOT NULL AND v_product.tax_rate > 0 THEN
            v_item_tax := v_item_total * (v_product.tax_rate / 100);
        END IF;

        v_subtotal := v_subtotal + v_item_total;
        v_tax_amount := v_tax_amount + v_item_tax;

        -- Insert Order Item
        INSERT INTO order_items (
            order_id, product_id, product_name_snapshot, quantity,
            unit_price, tax_amount, total_price, kitchen_status, special_instructions
        ) VALUES (
            v_order_id, v_product.id, v_product.name, v_qty,
            v_item_subtotal, v_item_tax, v_item_total + v_item_tax, 
            CASE WHEN v_product.send_to_kitchen THEN 'pending'::kitchen_status ELSE 'completed'::kitchen_status END,
            item->>'special_instructions'
        ) RETURNING id INTO v_item_id;

        -- Insert variant snapshots
        IF item->'variants' IS NOT NULL THEN
            FOR v_variant IN SELECT * FROM jsonb_array_elements(item->'variants')
            LOOP
                SELECT vv.name AS value_name, vv.price_delta, pv.name AS variant_name
                INTO v_variant_record
                FROM product_variant_values vv
                JOIN product_variants pv ON pv.id = vv.variant_id
                WHERE vv.id = (v_variant->>'value_id')::UUID;

                INSERT INTO order_item_variants (order_item_id, variant_name_snapshot, value_name_snapshot, price_delta)
                VALUES (v_item_id, v_variant_record.variant_name, v_variant_record.value_name, v_variant_record.price_delta);
            END LOOP;
        END IF;

        -- Insert addon snapshots
        IF item->'addons' IS NOT NULL THEN
            FOR v_addon IN SELECT * FROM jsonb_array_elements(item->'addons')
            LOOP
                SELECT name, price INTO v_addon_record FROM product_addons WHERE id = (v_addon->>'addon_id')::UUID;

                INSERT INTO order_item_addons (order_item_id, addon_name_snapshot, price)
                VALUES (v_item_id, v_addon_record.name, v_addon_record.price);
            END LOOP;
        END IF;
    END LOOP;

    -- 7. Finalize Order Totals
    v_total := v_subtotal + v_tax_amount + v_service_charge - v_discount_amount;
    
    IF v_needs_kitchen THEN
        v_kitchen_status := 'pending';
    ELSE
        v_kitchen_status := 'completed';
    END IF;

    -- Update order to confirmed (Customer orders go straight to confirmed)
    UPDATE orders 
    SET subtotal = v_subtotal,
        tax_amount = v_tax_amount,
        service_charge = v_service_charge,
        discount_amount = v_discount_amount,
        total_amount = v_total,
        order_status = 'confirmed',
        kitchen_status = v_kitchen_status
    WHERE id = v_order_id;

    -- 8. Table Status Update
    UPDATE restaurant_tables 
    SET status = CASE WHEN v_needs_kitchen THEN 'preparing'::table_status ELSE 'occupied'::table_status END
    WHERE id = v_session.table_id;

    -- Return success payload
    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM, 'message', 'Failed to create QR order');
END;
$$;
