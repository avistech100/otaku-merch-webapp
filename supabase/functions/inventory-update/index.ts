import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const { order_id } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Get order items
  const { data: items } = await supabase
    .from('order_items')
    .select('variant_id, product_id, quantity, title')
    .eq('order_id', order_id)

  if (items) {
    for (const item of items) {
      // Update product items_sold
      const { data: product } = await supabase
        .from('products')
        .select('items_sold, title')
        .eq('id', item.product_id)
        .single()
      
      if (product) {
        await supabase
          .from('products')
          .update({ items_sold: (product.items_sold || 0) + item.quantity })
          .eq('id', item.product_id)
      }

      // Update variant quantity if exists
      if (item.variant_id) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('quantity, title')
          .eq('id', item.variant_id)
          .single()
        
        if (variant) {
          const newQty = Math.max(0, variant.quantity - item.quantity)
          await supabase
            .from('product_variants')
            .update({ quantity: newQty })
            .eq('id', item.variant_id)

          // 2. Alert Admin if low stock
          if (newQty <= 5) {
            await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/admin-notifications`, {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                type: 'low_stock', 
                title: 'Low Stock Alert',
                message: `Product ${product?.title} (${variant.title}) is low on stock: ${newQty} left.`,
                data: { product_id: item.product_id, variant_id: item.variant_id, quantity: newQty } 
              })
            })
          }
        }
      }
    }
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 })
})
