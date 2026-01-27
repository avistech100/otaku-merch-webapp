import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Verify if user is admin
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing token' }), { status: 401, headers: corsHeaders })
  }

  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  
  if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: corsHeaders })
  }

  const url = new URL(req.url)
  // Extract path and handle routes
  const pathParts = url.pathname.split('/').filter(Boolean)
  const baseIndex = pathParts.indexOf('admin-api')
  const path = baseIndex !== -1 ? '/' + pathParts.slice(baseIndex + 1).join('/') : '/'
  const method = req.method

  try {
    // ROUTER
    if (path === '/pending-creators' && method === 'GET') {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'creator_pending')
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (path === '/pending-products' && method === 'GET') {
      const { data } = await supabase.from('products').select('*, profiles(full_name)').eq('status', 'pending')
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (path.startsWith('/approve-creator/') && method === 'POST') {
      const userId = path.split('/').pop()
      await supabase.from('profiles').update({ role: 'creator' }).eq('id', userId)
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders })
    }

    if (path.startsWith('/reject-creator/') && method === 'POST') {
      const userId = path.split('/').pop()
      await supabase.from('profiles').update({ role: 'user' }).eq('id', userId)
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders })
    }

    if (path.startsWith('/approve-product/') && method === 'POST') {
      const productId = path.split('/').pop()
      await supabase.from('products').update({ status: 'approved' }).eq('id', productId)
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders })
    }

    if (path.startsWith('/reject-product/') && method === 'POST') {
        const productId = path.split('/').pop()
        const { reason } = await req.json()
        await supabase.from('products').update({ status: 'rejected', metadata: { rejection_reason: reason } }).eq('id', productId)
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders })
    }

    if (path === '/analytics' && method === 'GET') {
        const { data: orders } = await supabase.from('orders').select('total, created_at').eq('payment_status', 'paid')
        const totalRevenue = orders?.reduce((acc: number, curr: any) => acc + curr.total, 0) || 0
        const totalSales = orders?.length || 0
        return new Response(JSON.stringify({ totalRevenue, totalSales }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (path === '/orders' && method === 'GET') {
        const { data } = await supabase.from('orders').select('*, profiles(full_name)').order('created_at', { ascending: false })
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Not Found', path, method }), { status: 404, headers: corsHeaders })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})
