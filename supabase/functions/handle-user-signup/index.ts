import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { EmailService } from "../_shared/email.service.ts"

serve(async (req) => {
  const { record } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { id, email, raw_user_meta_data } = record
  const fullName = raw_user_meta_data?.full_name || email.split('@')[0]
  const role = raw_user_meta_data?.role === 'creator' ? 'creator_pending' : 'user'

  // 1. Create Profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: id,
      full_name: fullName,
      username: email.split('@')[0] + Math.floor(Math.random() * 1000),
      role: role
    })

  if (profileError) {
    console.error('Error creating profile:', profileError)
    // We continue even if profile creation fails for notifications, or handle accordingly
  }

  // 2. Send Welcome Email
  try {
    await EmailService.sendWelcomeEmail(email, fullName);
  } catch (e) {
    console.error('Failed to send welcome email:', e);
  }

  // 3. Alert Admin if creator_pending
  if (role === 'creator_pending') {
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/admin-notifications`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          type: 'new_creator', 
          title: 'New Creator Application',
          message: `User ${email} has applied to be a creator.`,
          data: { email, id } 
        })
      })
    } catch (e) {
      console.error('Failed to notify admin:', e)
    }
  }

  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
})
