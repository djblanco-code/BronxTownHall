// Weekly event-sourcing pipeline: reads configured public event pages,
// extracts candidate events, and queues them for admin review. Never publishes.
const GATEWAY = "https://connector-gateway.lovable.dev/firecrawl/v2";
const UA = "TheBronxAppBot";
const PAUSE_MS = 3000;

type Admin = typeof import("@/integrations/supabase/client.server").supabaseAdmin;

export type SourceResult = { name: string; status: string; message: string; added: number; skippedNoDate: number; duplicates: number };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const normTitle = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Returns true when robots.txt allows path for "*" (or our UA). Missing robots.txt = allowed. */
async function robotsAllows(url: string): Promise<{ ok: boolean; reason?: string }> {
  const u = new URL(url);
  try {
    const res = await fetch(`${u.origin}/robots.txt`, { headers: { "User-Agent": UA } });
    if (!res.ok) return { ok: true };
    const lines = (await res.text()).split(/\r?\n/).map((l) => l.replace(/#.*/, "").trim());
    // Group consecutive User-agent lines; rules apply to the whole group.
    let group: string[] = [];
    let inRules = false;
    const disallow: string[] = [];
    const allow: string[] = [];
    const applies = () => group.some((g) => g === "*" || g.toLowerCase() === UA.toLowerCase());
    for (const line of lines) {
      const [k, ...rest] = line.split(":");
      const key = k?.toLowerCase().trim();
      const val = rest.join(":").trim();
      if (key === "user-agent") {
        if (inRules) { group = []; inRules = false; }
        group.push(val);
      } else if (key === "disallow" || key === "allow") {
        inRules = true;
        if (applies() && val) (key === "disallow" ? disallow : allow).push(val);
      }
    }
    const path = u.pathname + u.search;
    const longest = (arr: string[]) => Math.max(-1, ...arr.filter((p) => path.startsWith(p.replace(/\*.*$/, ""))).map((p) => p.length));
    if (longest(disallow) > longest(allow)) return { ok: false, reason: "Blocked by the site's robots.txt" };
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

const schema = {
  type: "object",
  properties: {
    events: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          date: { type: "string", description: "Exact date as YYYY-MM-DD. Empty string if the page does not state a specific date." },
          time: { type: "string" },
          location: { type: "string" },
          description: { type: "string", description: "One or two sentences" },
          url: { type: "string" },
        },
        required: ["title", "date"],
      },
    },
  },
};

async function scrape(url: string) {
  const LOVABLE_API_KEY = process.env["LOVABLE_API_KEY"];
  const FIRECRAWL_API_KEY = process.env["FIRECRAWL_API_KEY"];
  if (!LOVABLE_API_KEY || !FIRECRAWL_API_KEY) throw new Error("Scraping service is not connected");
  const res = await fetch(`${GATEWAY}/scrape`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}`, "X-Connection-Api-Key": FIRECRAWL_API_KEY },
    body: JSON.stringify({
      url,
      onlyMainContent: true,
      waitFor: 2000,
      formats: [{ type: "json", schema, prompt: "List every upcoming event on this page. Only use dates explicitly shown; never guess a date or year." }],
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Scrape failed [${res.status}]: ${text.slice(0, 200)}`);
  const body = JSON.parse(text);
  const json = body.json ?? body.data?.json;
  return (json?.events ?? []) as Array<Record<string, string | undefined>>;
}

// NYPL's calendar covers all boroughs; keep only Bronx branches.
const NYPL_BRONX = ["allerton","baychester","belmont","bronx library center","castle hill","city island","clason","eastchester","edenwald","francis martin","grand concourse","high bridge","highbridge","hunt","jerome park","kingsbridge","melrose","morris park","morrisania","mosholu","mott haven","parkchester","pelham bay","pelham parkway","van nest","riverdale","sedgwick","soundview","spuyten duyvil","throg","tremont","van cortlandt","wakefield","west farms","westchester square","woodlawn","woodstock"];
const isBronxNypl = (loc?: string) => !!loc && NYPL_BRONX.some((b) => loc.toLowerCase().includes(b));

const isCleanDate = (d?: string) => !!d && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));

export async function runEventScrape(admin: Admin): Promise<SourceResult[]> {
  const { data: sources } = await admin.from("event_sources").select("*").eq("active", true);
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await admin
    .from("bronx_resources")
    .select("organization_name,resource_name,event_date")
    .eq("resource_category", "community_events");
  const liveKeys = new Set((existing ?? []).map((e) => `${normTitle(e.resource_name || e.organization_name)}|${e.event_date}`));

  const results: SourceResult[] = [];
  for (const [i, src] of (sources ?? []).entries()) {
    if (i > 0) await sleep(PAUSE_MS);
    const r: SourceResult = { name: src.name, status: "ok", message: "", added: 0, skippedNoDate: 0, duplicates: 0 };
    const robots = await robotsAllows(src.url);
    if (!robots.ok) {
      r.status = "blocked";
      r.message = robots.reason!;
    } else {
      try {
        const events = await scrape(src.url);
        for (const ev of events) {
          const title = (ev.title ?? "").trim();
          if (!title) continue;
          if (!isCleanDate(ev.date)) { r.skippedNoDate++; continue; }
          if (ev.date! < today) continue;
          if (src.url.includes("nypl.org") && !isBronxNypl(ev.location)) continue;
          const key = `${normTitle(title)}|${ev.date}|${normTitle(ev.location ?? "")}`;
          const isLiveDup = liveKeys.has(`${normTitle(title)}|${ev.date}`);
          const { error } = await admin.from("scraped_events").insert({
            source_id: src.id,
            title: title.slice(0, 200),
            event_date: ev.date!,
            event_time: ev.time?.slice(0, 60) || null,
            location: ev.location?.slice(0, 200) || null,
            description: ev.description?.slice(0, 1000) || null,
            event_url: ev.url?.startsWith("http") ? ev.url : src.url,
            dedupe_key: key,
            possible_duplicate: isLiveDup,
            duplicate_note: isLiveDup ? "An event with this name and date is already live" : null,
          });
          if (error) { if (error.code === "23505") r.duplicates++; continue; }
          if (isLiveDup) r.duplicates++;
          r.added++;
        }
        r.message = `${events.length} found, ${r.added} queued, ${r.skippedNoDate} skipped (no clear date), ${r.duplicates} duplicates`;
        if (events.length === 0) { r.status = "empty"; r.message = "Page read, but no events could be extracted"; }
      } catch (e) {
        r.status = "error";
        r.message = (e as Error).message.slice(0, 300);
      }
    }
    await admin.from("event_sources").update({ last_checked_at: new Date().toISOString(), last_status: r.status, last_message: r.message }).eq("id", src.id);
    results.push(r);
  }
  return results;
}
