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
    const { import_id, reviewer_id } = await req.json();

    // 1. Update Import Status
    const { data: importRecord, error: importError } = await supabase
      .from("raw_imports")
      .update({ status: "approved" })
      .eq("id", import_id)
      .select()
      .single();

    if (importError) throw importError;

    // 2. Update Approvals Queue
    await supabase.from("approvals_queue")
      .update({ status: "approved", reviewer_id })
      .eq("raw_import_id", import_id);

    // 3. Move to Inventory Master
    const { data: inventory, error: invError } = await supabase
      .from("inventory_master")
      .insert({
        tenant_id: importRecord.tenant_id,
        service_type: importRecord.source_type,
        base_price: importRecord.parsed_json.price || 0,
        currency: importRecord.parsed_json.currency || 'USD',
        status: "active"
      })
      .select()
      .single();

    if (invError) throw invError;

    // 4. Emit Event
    await supabase.from("events").insert({
      tenant_id: importRecord.tenant_id,
      event_type: "IMPORT_APPROVED",
      payload: { import_id, inventory_id: inventory.id }
    });

    return new Response(JSON.stringify({ success: true, inventory_id: inventory.id }), {
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
