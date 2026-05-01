import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    const body = await req.json();

    const { data, error } = await supabase.from("events").insert({
      tenant_id: body.tenant_id,
      type: body.type,
      payload: body.payload
    }).select().single();

    if (error) throw error;

    // Trigger dispatcher asynchronously (don't wait for it to finish for the frontend)
    // In a local environment, we call the local function URL
    const dispatcherUrl = Deno.env.get("DISPATCHER_URL") || `${new URL(req.url).origin}/event-dispatcher`;
    
    fetch(dispatcherUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: data.id })
    }).catch(err => console.error("[CreateEvent] Dispatcher trigger failed:", err));

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
