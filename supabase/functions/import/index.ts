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
    const { tenant_id, raw_payload, source_type } = await req.json();

    // 1. Store in raw_imports
    const { data: rawImport, error: importError } = await supabase
      .from("raw_imports")
      .insert({
        tenant_id,
        raw_payload,
        source_type,
        status: "pending",
        parsed_json: { ...raw_payload, _processed: true }, // Simulate parsing
        confidence_score: 0.98
      })
      .select()
      .single();

    if (importError) throw importError;

    // 2. Emit Event
    await supabase.from("events").insert({
      tenant_id,
      event_type: "RAW_IMPORT_CREATED",
      payload: rawImport
    });

    // 3. Add to Approvals Queue
    await supabase.from("approvals_queue").insert({
      tenant_id,
      raw_import_id: rawImport.id,
      status: "pending"
    });

    return new Response(JSON.stringify({ success: true, id: rawImport.id }), {
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
