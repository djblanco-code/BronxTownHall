import { createFileRoute } from "@tanstack/react-router";

const CATEGORIES = [
  "food",
  "health",
  "legal",
  "jobs",
  "events",
  "government",
  "childcare",
  "youth",
  "housing",
  "education",
  "money",
  "nature",
  "art",
] as const;

/** Parse a natural-language help request into structured needs (OpenAI-compatible model, see lib/ai.server.ts). */
export const Route = createFileRoute("/api/help")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { aiConfig } = await import("@/lib/ai.server");
        const { apiKey, baseURL, model } = aiConfig();
        const json = (b: unknown, status = 200) =>
          new Response(JSON.stringify(b), {
            status,
            headers: { "content-type": "application/json" },
          });

        if (!apiKey) return json({ error: "AI not configured" }, 503);

        const { clientIp, rateLimited } = await import("@/lib/rate-limit.server");
        if (
          await rateLimited(
            "help",
            clientIp((h) => request.headers.get(h)),
            20,
            10 * 60,
          )
        ) {
          return json({ error: "Too many requests. Please wait a few minutes." }, 429);
        }

        let body: { text?: string; lang?: string };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, 400);
        }
        const text = (body.text ?? "").trim().slice(0, 600);
        if (!text) return json({ error: "text is required" }, 400);

        const res = await fetch(`${baseURL}/chat/completions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content:
                  "You are an intake worker for a Bronx, NYC community resource app. A resident describes their situation in their own words. " +
                  "Return the single most pressing need category, up to 4 related need categories in priority order, short plain-language signals about their situation " +
                  "(e.g. 'has two kids', 'recently laid off'), whether this is urgent/crisis, and one warm, non-judgmental sentence (max 25 words) restating what they need. " +
                  "Never give medical, legal, or financial advice. Categories must come from the allowed list.",
              },
              { role: "user", content: text },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "need_parse",
                strict: true,
                schema: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    primaryNeed: { type: "string", enum: [...CATEGORIES] },
                    relatedNeeds: {
                      type: "array",
                      items: { type: "string", enum: [...CATEGORIES] },
                    },
                    signals: { type: "array", items: { type: "string" } },
                    urgent: { type: "boolean" },
                    summary: { type: "string" },
                  },
                  required: ["primaryNeed", "relatedNeeds", "signals", "urgent", "summary"],
                },
              },
            },
          }),
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          return json(
            { error: "ai_failed", status: res.status, detail: detail.slice(0, 300) },
            res.status === 429 || res.status === 402 ? res.status : 502,
          );
        }

        const data = (await res.json().catch(() => null)) as {
          choices?: { message?: { content?: string } }[];
        } | null;
        const content = data?.choices?.[0]?.message?.content;
        if (!content) return json({ error: "empty_response" }, 502);
        try {
          const parsed = JSON.parse(content);
          return json({ ...parsed, source: "ai" });
        } catch {
          return json({ error: "unparseable" }, 502);
        }
      },
    },
  },
});
