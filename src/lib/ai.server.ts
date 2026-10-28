/**
 * Settings for the AI features (Ask a question, need intake, text-to-speech).
 * Any OpenAI-compatible API works: OpenAI by default, or another provider via
 * OPENAI_BASE_URL. Without OPENAI_API_KEY the features turn themselves off and
 * listening falls back to the browser's built-in voice.
 */
export function aiConfig() {
  return {
    apiKey: process.env.OPENAI_API_KEY || undefined,
    baseURL: (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, ""),
    /** Must support JSON-schema structured output. */
    model: process.env.AI_MODEL || "gpt-4.1-mini",
    /** Must support the `instructions` field of /audio/speech. */
    ttsModel: process.env.AI_TTS_MODEL || "gpt-4o-mini-tts",
  };
}
