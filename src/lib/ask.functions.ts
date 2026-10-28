import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { RESOURCES, type Category } from "@/lib/data";
import { bronxToResource } from "@/lib/bronx-to-resource";

const CATS = [
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
  "business",
  "shopping",
  "services",
  "urgent",
];

export type AskMatch = {
  id: string;
  name: string;
  category: Category;
  address: string;
  phone: string;
  hours: string;
  status: string;
  lastVerified: string | null;
};
export type AskResult =
  | { kind: "out_of_scope" }
  | { kind: "no_match"; category: Category | null }
  | { kind: "matches"; category: Category | null; matches: AskMatch[] }
  | { kind: "error"; message: string };

export const askQuestion = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({ question: z.string().trim().min(2).max(400), lang: z.string().max(5).optional() })
      .parse(d),
  )
  .handler(async ({ data }): Promise<AskResult> => {
    const { askModel, parseJson, redact } = await import("./ask.server");
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const { supabase } = await import("@/integrations/supabase/client");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { clientIp, rateLimited } = await import("./rate-limit.server");
    if (await rateLimited("ask", clientIp(getRequestHeader), 20, 10 * 60))
      return {
        kind: "error",
        message: "You've asked a lot of questions quickly. Please wait a few minutes.",
      };

    const log = async (outcome: string, category: string | null, count: number) => {
      await supabaseAdmin.from("ask_questions").insert({
        question: redact(data.question),
        category,
        outcome,
        match_count: count,
        lang: data.lang ?? null,
      });
    };

    try {
      // Step 1 — understand the question. The model returns search terms only, never answers.
      const parsed = parseJson<{ in_scope: boolean; category: string | null; keywords: string[] }>(
        await askModel(
          "You turn a resident's question into search terms for a Bronx, NYC resource directory. Do NOT answer the question. " +
            `Return JSON only: {"in_scope": boolean, "category": one of ${JSON.stringify(CATS)} or null, "keywords": string[]}. ` +
            "in_scope is false for chit-chat or anything not about finding Bronx services, programs, businesses or events. " +
            "keywords: 2-6 short lowercase words/phrases likely to appear in a listing (service type, neighborhood, street, day like 'sunday'). Include singular forms. category must be exactly one of the listed ids.",
          data.question,
        ),
      );
      if (!parsed)
        return { kind: "error", message: "Sorry, something went wrong. Please try again." };
      if (!parsed.in_scope) {
        await log("out_of_scope", null, 0);
        return { kind: "out_of_scope" };
      }
      const category = (
        CATS.includes(parsed.category ?? "") ? parsed.category : null
      ) as Category | null;
      const kws = (parsed.keywords ?? [])
        .map((k) =>
          String(k)
            .toLowerCase()
            .replace(/[^a-z0-9 '-]/g, "")
            .trim(),
        )
        .filter((k) => k.length > 2)
        .slice(0, 6);

      // Step 2 — retrieve candidates from OUR data only (keyword search over listings).
      type Cand = AskMatch & { text: string };
      const cands: Cand[] = [];
      const STOP = new Set([
        "bronx",
        "nyc",
        "new",
        "york",
        "free",
        "help",
        "near",
        "the",
        "and",
        "for",
        "with",
        "where",
        "open",
        "services",
        "service",
        "program",
        "programs",
      ]);
      const words = [
        ...new Set(kws.flatMap((k) => k.split(/\s+/)).filter((w) => w.length > 2 && !STOP.has(w))),
      ];
      const score = (hay: string) => words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0);
      const { data: rows } = await supabase
        .from("bronx_resources")
        .select("*")
        .eq("active", true)
        .is("merged_into", null)
        .limit(2000);
      const scored: (Cand & { s: number })[] = [];
      for (const row of rows ?? []) {
        const r = bronxToResource(row as never);
        const hay =
          `${r.name.en} ${r.description.en} ${r.address} ${r.hours.en} ${r.subcategory ?? ""} ${row.resource_category} ${row.neighborhood ?? ""}`.toLowerCase();
        const s = score(hay) + (r.category === category ? 2 : 0);
        if (s > 0)
          scored.push({
            id: r.id,
            name: r.name.en,
            category: r.category,
            address: r.address,
            phone: r.phone,
            hours: r.hours.en,
            status: r.__imported.status,
            lastVerified: r.__imported.lastVerified,
            text: r.description.en,
            s,
          });
      }
      const { data: meta } = await supabase
        .from("resources")
        .select("id,verification_status,last_verified");
      const mm = new Map((meta ?? []).map((m) => [m.id, m]));
      for (const r of RESOURCES) {
        const hay =
          `${r.name.en} ${r.description.en} ${r.address} ${r.hours.en} ${r.subcategory ?? ""} ${(r.keywords ?? []).join(" ")}`.toLowerCase();
        const s = score(hay) + (r.category === category ? 2 : 0);
        if (s <= 0) continue;
        const m = mm.get(r.id);
        scored.push({
          id: r.id,
          name: r.name.en,
          category: r.category,
          address: r.address,
          phone: r.phone,
          hours: r.hours.en,
          status: m?.verification_status ?? "needs_verification",
          lastVerified: m?.last_verified ?? null,
          text: r.description.en,
          s,
        });
      }
      scored.sort((x, y) => y.s - x.s);
      cands.push(...scored);
      // Prefer the inferred category, keep the pool small.
      const pool = cands.slice(0, 40);
      if (!pool.length) {
        await log("no_match", category, 0);
        return { kind: "no_match", category };
      }

      // Step 3 — the model may only pick IDs from the pool. Everything shown comes from the database row.
      const list = pool
        .map(
          (c, i) =>
            `[${i}] ${c.name} | ${c.category} | ${c.address} | hours: ${c.hours} | ${c.text.slice(0, 220)}`,
        )
        .join("\n");
      const pick = parseJson<{ picks: number[] }>(
        await askModel(
          "You filter a list of Bronx directory listings. Use ONLY the text in the list; no outside knowledge. " +
            'Return JSON only: {"picks": number[]} with up to 5 indexes of listings whose text clearly supports the resident\'s request ' +
            "Hard requirements (service type; a specific day/time such as Sunday must appear in the hours text) must be supported by the listing text. " +
            "A place/neighborhood the resident mentions is a preference: rank listings whose address or neighborhood text mentions it first, but still include other Bronx listings of the right service type. " +
            'If none clearly match the service type, return {"picks": []}.',
          `Question: ${data.question}\n\nListings:\n${list}`,
        ),
      );
      const idx = [
        ...new Set(
          (pick?.picks ?? []).filter((n) => Number.isInteger(n) && n >= 0 && n < pool.length),
        ),
      ].slice(0, 5);
      const matches = idx.map((i) => {
        const { text: _t, ...m } = pool[i];
        return m;
      });
      await log(matches.length ? "answered" : "no_match", category, matches.length);
      return matches.length
        ? { kind: "matches", category, matches }
        : { kind: "no_match", category };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (/402|credit/i.test(msg))
        return {
          kind: "error",
          message:
            "Ask a Question is temporarily unavailable. Please use search or browse categories.",
        };
      console.error("askQuestion", e);
      return {
        kind: "error",
        message: "Sorry, something went wrong. Please try again or browse categories.",
      };
    }
  });
