import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const { type, title, message, data: payload } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Find Admins
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')

  if (admins && admins.length > 0) {
    // 2. Insert notifications for each admin
    const notifications = admins.map(admin => ({
      user_id: admin.id,
      type,
      title,
      message,
      data: payload
    }))

    const { error } = await supabase
      .from('notifications')
      .insert(notifications)

    if (error) console.error('Error inserting notifications:', error)
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 })
})
