import type { Lang } from "@/lib/i18n";

/** A namespace bundle: same key set for every supported language. */
export type Bundle = Record<Lang, Record<string, string>>;

export type { Lang };
