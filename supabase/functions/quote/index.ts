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
    const { inventory_id, tenant_id } = await req.json();

    // 1. Fetch Inventory & Config
    const { data: inventory, error: invError } = await supabase
      .from("inventory_master")
      .select("*, partners(*)")
      .eq("id", inventory_id)
      .single();

    if (invError) throw invError;

    const { data: config } = await supabase
      .from("system_config")
      .select("*")
      .eq("tenant_id", tenant_id)
      .single();

    const minMargin = config?.commission_rules?.min_margin || 10;

    // 2. Pricing Logic (Rules Engine)
    const marginPercent = 0.15; // 15%
    const price = Number(inventory.base_price) * (1 + marginPercent);
    const profitMargin = price - Number(inventory.base_price);

    if (profitMargin < minMargin) {
      return new Response(JSON.stringify({ error: "Margin too low for system rules" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // 3. Create Quote
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        tenant_id,
        inventory_id,
        price,
        profit_margin: profitMargin,
        status: "created"
      })
      .select()
      .single();

    if (quoteError) throw quoteError;

    // 4. Emit Event
    await supabase.from("events").insert({
      tenant_id,
      event_type: "QUOTE_CREATED",
      payload: quote
    });

    return new Response(JSON.stringify(quote), {
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
