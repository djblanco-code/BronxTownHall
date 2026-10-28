import type { Category } from "./data";

/**
 * "How to Apply" is a direct next-step contact — an application URL or a phone
 * line that takes an application — kept separate from the listing's general
 * website and main phone number.
 */
export type ActionLink = { kind: "url" | "phone"; href: string; display: string };

/** Categories where an application/enrollment step is commonly the real next action. */
export const ACTION_LINK_CATEGORIES: Category[] = ["money", "health", "government"];

export function expectsActionLink(category: string): boolean {
  return (ACTION_LINK_CATEGORIES as string[]).includes(category);
}

const PHONE_RE = /^[\d\s().+-]{7,22}$/;

export function parseActionLink(raw?: string | null): ActionLink | null {
  const v = (raw ?? "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return { kind: "url", href: v, display: v.replace(/^https?:\/\//i, "") };
  if (/^tel:/i.test(v)) {
    const digits = v.slice(4).trim();
    return { kind: "phone", href: `tel:${digits.replace(/[^\d+]/g, "")}`, display: digits };
  }
  if (PHONE_RE.test(v) && (v.match(/\d/g) ?? []).length >= 7) {
    return { kind: "phone", href: `tel:${v.replace(/[^\d+]/g, "")}`, display: v.trim() };
  }
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(v)) return { kind: "url", href: `https://${v}`, display: v };
  return null;
}

/** Admin-side check used during verification; never blocks publication. */
export function actionLinkFlag(category: string, howToApply?: string | null): string | null {
  if (!expectsActionLink(category)) return null;
  return parseActionLink(howToApply) ? null : "No direct action link — consider adding one";
}
