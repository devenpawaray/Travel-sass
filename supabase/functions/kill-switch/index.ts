import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-tenant-id",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { tenant_id, reason } = await req.json();

    // 1. Lock all Inventory
    await supabase
      .from("inventory_master")
      .update({ status: "locked" })
      .eq("tenant_id", tenant_id);

    // 2. Lock all Quotes
    await supabase
      .from("quotes")
      .update({ status: "locked" })
      .eq("tenant_id", tenant_id);

    // 3. Emit System-wide Event
    await supabase.from("events").insert({
      tenant_id,
      event_type: "KILL_SWITCH_TRIGGERED",
      payload: { reason, timestamp: new Date().toISOString() }
    });

    return new Response(JSON.stringify({ success: true, status: "SYSTEM_FROZEN" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
