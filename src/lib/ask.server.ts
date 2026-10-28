import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { aiConfig } from "./ai.server";

/** One model call; streams internally, returns final text only. */
export async function askModel(system: string, user: string): Promise<string> {
  const { apiKey, baseURL, model } = aiConfig();
  if (!apiKey) throw new Error("AI not configured");
  const provider = createOpenAI({ baseURL, apiKey });
  const result = streamText({
    model: provider.chat(model),
    system,
    prompt: user,
  });
  return await result.text;
}

export function parseJson<T>(text: string): T | null {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]) as T; } catch { return null; }
}

/** Strip anything that could identify the asker before logging. */
export function redact(q: string): string {
  return q
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[number]")
    .replace(/\b\d{6,}\b/g, "[number]")
    .slice(0, 300);
}
