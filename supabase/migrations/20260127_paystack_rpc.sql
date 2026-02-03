-- =====================================================
-- PAYMENT SUCCESS HANDLER RPC
-- Created: 2026-01-27
-- =====================================================

CREATE OR REPLACE FUNCTION handle_payment_success(
    p_order_id UUID,
    p_reference TEXT
)
RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
    v_total DECIMAL(10,2);
BEGIN
    -- 1. Update order status
    UPDATE orders
    SET 
        payment_status = 'paid',
        status = 'processing',
        payment_reference = p_reference,
        updated_at = NOW()
    WHERE id = p_order_id
    RETURNING user_id, total INTO v_user_id, v_total;

    -- 2. Update creator balances Based on order items
    UPDATE profiles
    SET 
        pending_balance = pending_balance + oi.creator_earnings,
        updated_at = NOW()
    FROM order_items oi
    WHERE oi.order_id = p_order_id
    AND profiles.id = oi.creator_id;

    -- 3. Create notification for the customer
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
        v_user_id,
        'order',
        'PAYMENT VERIFIED',
        'Your payment for order #' || (SELECT order_number FROM orders WHERE id = p_order_id) || ' has been confirmed. Processing mission...',
        jsonb_build_object('order_id', p_order_id)
    );

    -- 4. Create notifications for the creators
    INSERT INTO notifications (user_id, type, title, message, data)
    SELECT 
        creator_id,
        'order',
        'NEW DEPLOYMENT DETECTED',
        'An asset from your arsenal has been commissioned in order #' || (SELECT order_number FROM orders WHERE id = p_order_id),
        jsonb_build_object('order_id', p_order_id)
    FROM order_items
    WHERE order_id = p_order_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
