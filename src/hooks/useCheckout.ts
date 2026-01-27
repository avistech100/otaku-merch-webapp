import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/useCartStore';
// @ts-ignore
import PaystackPop from '@paystack/inline-js';

export const useCheckout = () => {
  const [loading, setLoading] = useState(false);
  const { items, getSubtotal, clearCart } = useCartStore();

  const initiatePaystack = async (shippingInfo: any) => {
    setLoading(true);
    try {
      const orderNumber = `ORD-${Date.now()}`;
      const total = getSubtotal() + 15;

      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          total,
          shipping_address: shippingInfo,
          payment_status: 'pending',
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert Items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        price: item.price,
        quantity: item.quantity,
        metadata: { size: item.selectedSize }
      }));

      await supabase.from('order_items').insert(orderItems);

      // 3. Launch Paystack
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: shippingInfo.email,
        amount: Math.round(total * 100 * 1600), // Standardized to NGN for test
        onSuccess: async (transaction: any) => {
          await supabase.rpc('handle_payment_success', {
            p_order_id: order.id,
            p_reference: transaction.reference
          });
          clearCart();
          window.location.href = '/order-confirmation?status=success';
        },
        onCancel: () => {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(false);
    }
  };

  return { initiatePaystack, loading };
};
