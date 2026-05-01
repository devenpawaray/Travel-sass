import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    // 1. Load Org Config
    const { data: config } = await supabase
      .from('org_config')
      .select('*')
      .eq('tenant_id', record.tenant_id)
      .single()

    // 2. Rule Engine Logic
    // Example: If kill switch is active, block processing
    if (config?.kill_switch_active && record.type !== 'KILL_SWITCH_TRIGGERED') {
      return new Response(JSON.stringify({ status: 'blocked', reason: 'Kill switch active' }))
    }

    // 3. State Transition Handling
    // (Actual transition logic would go here)

    // 4. Audit Log Creation
    await supabase.from('audit_logs').insert({
      tenant_id: record.tenant_id,
      action: record.type,
      entity_type: 'event',
      entity_id: record.id,
      after: record.payload
    })

    // 5. Update event as processed
    await supabase.from('events').update({ processed: true }).eq('id', record.id)

    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
