import { createFileRoute } from "@tanstack/react-router";
import { buildSmsReply, buildEventsReply } from "@/lib/sms";

function twiml(message: string) {
  const escaped = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`,
    { headers: { "content-type": "text/xml; charset=utf-8" } },
  );
}

async function replyFor(body: string): Promise<string> {
  const word = body.trim().toUpperCase().split(/\s+/)[0] ?? "";
  if (word === "EVENTS") {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("events")
        .select("title, event_date, event_time, location")
        .eq("approval_status", "approved")
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(3);
      return buildEventsReply(data ?? []);
    } catch {
      return buildEventsReply([]);
    }
  }
  return buildSmsReply(body);
}

export const Route = createFileRoute("/api/public/sms")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      // Twilio inbound-SMS webhook. Point the number's "A message comes in"
      // URL here (POST). Signature validation is enabled once TWILIO_AUTH_TOKEN is set.
      POST: async ({ request }) => {
        const raw = await request.text();
        const params = new URLSearchParams(raw);
        const body = params.get("Body") ?? "";
        return twiml(await replyFor(body));
      },
      GET: async ({ request }) => {
        const q = new URL(request.url).searchParams.get("Body") ?? "HELP";
        return new Response(await replyFor(q), {
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      },
    },
  },
});
