import type { Lang } from "@/lib/i18n";
import type { Bundle } from "./types";

/**
 * Key-based translation registry.
 *
 * Every file in ./messages exports a single `Bundle` (one dictionary per
 * language). The file name becomes the namespace, so `messages/about.ts`
 * exposes its keys as `about.title`, `about.mission`, etc.
 *
 * Add a namespace by dropping a new file in ./messages — no wiring needed.
 */
const modules = import.meta.glob("./messages/*.ts", { eager: true }) as Record<
  string,
  Record<string, unknown>
>;

const LANG_CODES: Lang[] = ["en", "es", "fr", "bn", "ar"];

function buildMessages(): Record<Lang, Record<string, string>> {
  const out = Object.fromEntries(LANG_CODES.map((l) => [l, {}])) as Record<
    Lang,
    Record<string, string>
  >;
  for (const [path, mod] of Object.entries(modules)) {
    const ns = path.replace("./messages/", "").replace(/\.ts$/, "");
    const bundle = Object.values(mod).find(
      (v) => v && typeof v === "object" && "en" in (v as object),
    ) as Bundle | undefined;
    if (!bundle) continue;
    for (const lang of LANG_CODES) {
      const dict = bundle[lang] ?? {};
      for (const [k, v] of Object.entries(dict)) out[lang][`${ns}.${k}`] = v;
    }
  }
  return out;
}

export const MESSAGES = buildMessages();

/** Resolve a namespaced key, falling back to English, then the key itself. */
export function translate(
  lang: Lang,
  key: string,
  vars?: Record<string, string | number>,
): string | undefined {
  const raw = MESSAGES[lang]?.[key] ?? MESSAGES.en?.[key];
  if (raw === undefined) return undefined;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (m, name) =>
    name in vars ? String(vars[name]) : m,
  );
}
