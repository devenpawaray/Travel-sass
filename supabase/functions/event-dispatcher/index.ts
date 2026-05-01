import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    const { event_id } = await req.json();

    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("*")
      .eq("id", event_id)
      .single();

    if (fetchError || !event) throw new Error("Event not found");

    console.log(`[Dispatcher] Processing event: ${event.type} (${event_id})`);

    switch (event.type) {
      case "SERVICE_PAUSED":
        await handleServicePaused(event);
        break;
      case "PRICE_UPDATED":
        await handlePriceUpdate(event);
        break;
      case "PAYMENT_RECEIVED":
        await handlePayment(event);
        break;
      case "KILL_SWITCH":
        await handleKillSwitch(event);
        break;
      case "IMPORT_CREATED":
        await handleImportCreated(event);
        break;
      default:
        console.log(`[Dispatcher] No handler for event type: ${event.type}`);
    }

    // Update event status to processed
    await supabase.from("events").update({ status: "processed" }).eq("id", event_id);

    return new Response(JSON.stringify({ status: "success" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

async function handleServicePaused(event: any) {
  const { tenant_id, service_id } = event.payload;
  await supabase.from("system_state").update({ state: "inactive" }).eq("service_id", service_id);
  await supabase.from("events").insert({
    tenant_id,
    type: "PACKAGE_INVALIDATED",
    payload: { service_id }
  });
  await supabase.from("alerts").insert({
    tenant_id,
    severity: "red",
    type: "service",
    message: "Service paused and packages invalidated"
  });
}

async function handlePriceUpdate(event: any) {
  const { tenant_id, service_id, new_price } = event.payload;
  const { data: state } = await supabase.from("system_state").select("*").eq("service_id", service_id).single();
  if (new_price < (state?.data?.min_allowed_price || 0)) {
    await supabase.from("alerts").insert({
      tenant_id,
      severity: "red",
      type: "pricing",
      message: "Margin violation detected"
    });
  }
  await supabase.from("system_state").update({
    state: "price_updated",
    data: { ...state?.data, price: new_price }
  }).eq("service_id", service_id);
}

async function handlePayment(event: any) {
  const { booking_id } = event.payload;
  await supabase.from("bookings").update({ state: "payment_verified" }).eq("id", booking_id);
  await supabase.from("audit_logs").insert({
    tenant_id: event.tenant_id,
    action: "PAYMENT_VERIFIED",
    entity_type: "booking",
    entity_id: booking_id,
    after: { state: "payment_verified" }
  });
}

async function handleKillSwitch(event: any) {
  const { tenant_id } = event.payload;
  await supabase.from("system_state").update({ state: "paused" }).eq("tenant_id", tenant_id);
  await supabase.from("alerts").insert({
    tenant_id,
    severity: "critical",
    type: "system",
    message: "Kill switch activated"
  });
}

async function handleImportCreated(event: any) {
  const { tenant_id, raw_data, source_type } = event.payload;
  // Move to approvals queue
  await supabase.from("approvals").insert({
    tenant_id,
    source_type,
    raw_data,
    ai_data: raw_data, // In a real app, AI would transform this
    confidence: 0.95,
    status: "pending"
  });
}
