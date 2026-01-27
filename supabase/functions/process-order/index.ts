import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { EmailService } from "../_shared/email.service.ts"

serve(async (req) => {
  const payload = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  if (payload.event === 'charge.success') {
    const { reference, metadata, amount, customer } = payload.data
    const order_number = metadata?.order_number
    
    // Update Order
    const { data: order, error } = await supabase
      .from('orders')
      .update({ 
        payment_status: 'paid', 
        status: 'processing',
        paystack_reference: reference 
      })
      .eq('order_number', order_number)
      .select()
      .single()

    if (order) {
      // 1. Send Order Confirmation Email
      try {
          await EmailService.sendOrderConfirmation(customer.email, order);
      } catch (e) {
          console.error('Failed to send order confirmation:', e);
      }

      // 2. Update Inventory
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/inventory-update`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order_id: order.id })
      })
      
      // 3. Notify Admin
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/admin-notifications`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          type: 'new_order', 
          title: 'New Paid Order',
          message: `Order ${order_number} has been paid. Amount: $${amount/100}`,
          data: { order_number, amount: amount/100 } 
        })
      })
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
