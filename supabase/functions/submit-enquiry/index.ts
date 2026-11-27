import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://www.davoniumtech.com",
  "https://davoniumtech.com",
]);
const cors = (origin: string) => ({
  "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://www.davoniumtech.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});
const json = (origin: string, status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
const sha256 = async (text: string) => {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
};
const bounded = (v: unknown, max: number) => typeof v === "string" ? v.trim().slice(0, max) : "";
const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json(origin, 405, { error: "Method not allowed" });
  if (!allowedOrigins.has(origin)) return json(origin, 403, { error: "Origin not allowed" });
  if (!supabaseUrl || !serviceKey) return json(origin, 503, { error: "Service is not configured" });

  let input: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 16000) return json(origin, 413, { error: "Request too large" });
    input = JSON.parse(raw);
  } catch {
    return json(origin, 400, { error: "Invalid JSON" });
  }
  // Honeypot field. Quietly acknowledge bots without saving.
  if (bounded(input.company_website_check, 100)) return json(origin, 200, { ok: true });
  const name = bounded(input.contact_name, 100);
  const email = bounded(input.email, 254).toLowerCase();
  const phone = bounded(input.phone, 32);
  const company = bounded(input.company_name, 160);
  const website = bounded(input.website, 255);
  const message = bounded(input.message, 5000);
  const service = bounded(input.service_interest, 120);
  const consent = input.privacy_consent === true;
  const preferred = ["email", "whatsapp", "phone"].includes(String(input.preferred_contact)) ? String(input.preferred_contact) : "email";
  if (name.length < 2 || !emailOk(email) || message.length < 5 || !service || !consent) {
    return json(origin, 400, { error: "Please check the required fields and consent checkbox." });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip") ?? "unknown";
  const ipHash = await sha256(ip + "|" + (Deno.env.get("RATE_LIMIT_HASH_SALT") ?? supabaseUrl));
  const { data: allowed, error: rateError } = await admin.rpc("consume_enquiry_rate_limit", { p_ip_hash: ipHash });
  if (rateError) {
    console.error("Rate limit service error:", rateError.message);
    return json(origin, 503, { error: "Please try again shortly." });
  }
  if (!allowed) return json(origin, 429, { error: "Too many enquiries from this connection. Please try again later." });

  const lead = {
    contact_name: name, email, phone: phone || null, company_name: company || null,
    website: website || null, country: bounded(input.country, 100) || "Nigeria",
    industry: bounded(input.industry, 100) || null, service_interest: service,
    package_interest: bounded(input.package_interest, 100) || null,
    budget_band: bounded(input.budget_band, 80) || null, preferred_contact: preferred,
    message, privacy_consent: true, privacy_consent_at: new Date().toISOString(),
    marketing_opt_in: input.marketing_opt_in === true,
    marketing_opt_in_at: input.marketing_opt_in === true ? new Date().toISOString() : null,
    source_path: bounded(input.source_path, 512) || null,
    referrer: bounded(input.referrer, 512) || null,
    utm_source: bounded(input.utm_source, 160) || null,
    utm_medium: bounded(input.utm_medium, 160) || null,
    utm_campaign: bounded(input.utm_campaign, 160) || null,
  };
  const { data, error } = await admin.from("leads").insert(lead).select("id").single();
  if (error) {
    console.error("Lead insert failed:", error.message);
    return json(origin, 500, { error: "We could not save your enquiry. Please try WhatsApp or email." });
  }
  const activity = await admin.from("lead_activities").insert({
    lead_id: data.id,
    event_type: "created",
    note: "Website enquiry received",
    metadata: { source: "website" },
  });
  if (activity.error) {
    console.error("Lead activity insert failed:", activity.error.message);
  }

  const notification = await admin.from("notifications").insert({
    kind: "new_lead",
    title: "New website enquiry",
    body: name + " — " + service,
    lead_id: data.id,
  });
  if (notification.error) {
    console.error("In-app notification insert failed:", notification.error.message);
  }

  // Email notification is optional until a verified sender is configured.
  // A lead remains saved even if this secondary delivery step fails.
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const ownerEmail = Deno.env.get("OWNER_NOTIFICATION_EMAIL");
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
  let emailNotificationAccepted = false;
  if (resendKey && ownerEmail && fromEmail) {
    try {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": "Bearer " + resendKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromEmail,
          to: [ownerEmail],
          subject: "New Davonium website enquiry",
          text: "Name: " + name + "\\nEmail: " + email + "\\nService: " + service + "\\n\\n" + message,
        }),
      });
      emailNotificationAccepted = emailResponse.ok;
      if (!emailResponse.ok) {
        console.error("Owner email provider rejected notification:", emailResponse.status);
      }
    } catch (e) {
      console.error("Owner email notification failed:", e instanceof Error ? e.message : String(e));
    }
  }

  return json(origin, 201, {
    ok: true,
    reference: data.id,
    activityRecorded: !activity.error,
    inAppNotificationCreated: !notification.error,
    emailNotificationAccepted,
  });
});
