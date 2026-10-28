import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/tts/speak")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { aiConfig } = await import("@/lib/ai.server");
        const { apiKey, baseURL, ttsModel } = aiConfig();
        if (!apiKey) {
          // The player falls back to the browser's built-in voice.
          return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
        let body: {
          text?: string;
          voice?: string;
          speed?: number;
          style?: string;
          format?: "mp3" | "opus" | "aac" | "flac" | "wav";
        };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const text = (body.text ?? "").trim();
        if (!text) {
          return new Response(JSON.stringify({ error: "text is required" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        if (text.length > 4000) {
          return new Response(JSON.stringify({ error: "text too long (max 4000 chars)" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const ALLOWED_VOICES = new Set([
          "alloy",
          "ash",
          "ballad",
          "coral",
          "echo",
          "sage",
          "shimmer",
          "verse",
          "marin",
          "cedar",
        ]);
        const voice = ALLOWED_VOICES.has(body.voice ?? "") ? body.voice! : "alloy";
        const speed = Math.min(Math.max(Number(body.speed) || 1, 0.5), 2);
        const format = body.format ?? "mp3";

        // Style → natural instructions to humanize the voice.
        const STYLE_INSTRUCTIONS: Record<string, string> = {
          calm: "Speak in a warm, calm, friendly tone. Use natural pauses between sections, especially after section labels like 'Address', 'Phone', and 'Hours'. Pronounce phone numbers clearly digit by digit. Read addresses naturally, like a helpful neighbor giving directions.",
          empathetic:
            "Speak in a warm, empathetic, reassuring tone — this is sensitive crisis information. Slow slightly. Pause meaningfully between sections. Pronounce phone numbers clearly digit by digit so the listener can write them down.",
          cheerful:
            "Speak in an upbeat, friendly, encouraging tone. Use natural rhythm and pauses between sections. Sound like a community organizer sharing good news.",
          directions:
            "Speak like a helpful neighbor giving walking directions — clear, calm, and unhurried. Pause briefly between landmarks. Read street names naturally.",
        };
        const instructions = STYLE_INSTRUCTIONS[body.style ?? "calm"] ?? STYLE_INSTRUCTIONS.calm;

        const upstream = await fetch(`${baseURL}/audio/speech`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: ttsModel,
            input: text,
            voice,
            speed,
            instructions,
            response_format: format,
          }),
        });

        if (!upstream.ok) {
          const errText = await upstream.text().catch(() => "");
          return new Response(
            JSON.stringify({
              error: `TTS failed: ${upstream.status}`,
              detail: errText.slice(0, 500),
            }),
            { status: upstream.status, headers: { "content-type": "application/json" } },
          );
        }

        const mime =
          format === "mp3"
            ? "audio/mpeg"
            : format === "opus"
              ? "audio/ogg"
              : format === "aac"
                ? "audio/aac"
                : format === "flac"
                  ? "audio/flac"
                  : "audio/wav";

        return new Response(upstream.body, {
          headers: {
            "content-type": mime,
            "cache-control": "private, max-age=300",
          },
        });
      },
    },
  },
});
