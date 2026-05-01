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
    const { import_id, reviewer_id, notes } = await req.json();

    // 1. Update Import Status
    await supabase.from("raw_imports")
      .update({ status: "rejected" })
      .eq("id", import_id);

    // 2. Update Approvals Queue
    await supabase.from("approvals_queue")
      .update({ status: "rejected", reviewer_id, notes })
      .eq("raw_import_id", import_id);

    // 3. Emit Event
    const { data: importRecord } = await supabase.from("raw_imports").select("tenant_id").eq("id", import_id).single();

    await supabase.from("events").insert({
      tenant_id: importRecord.tenant_id,
      event_type: "IMPORT_REJECTED",
      payload: { import_id, reviewer_id, notes }
    });

    return new Response(JSON.stringify({ success: true }), {
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
