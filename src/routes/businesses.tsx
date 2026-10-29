import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { useEffect, useMemo, useState } from "react";
import { getBusinesses, isLiveBusiness } from "@/lib/business";
import { useBusinessSync } from "@/lib/use-business-sync";
import { loadDirectory } from "@/lib/bronx-resources";
import { bronxToResource } from "@/lib/bronx-to-resource";
import { CATEGORIES, type Category } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";
import { VerifiedPill } from "@/components/VerifiedPill";
import { CallAheadNote } from "@/components/AvailabilityBadge";
import type { VerificationStatus } from "@/lib/verification";
import {
  ArrowLeft,
  Search,
  MapPin,
  Phone,
  BadgeCheck,
  Briefcase,
  Rocket,
  Megaphone,
} from "lucide-react";

export const Route = createFileRoute("/businesses")({
  staticData: { sitemap: false },
  // Out of the first version (docs/product-scope.md); hidden, not deleted.
  beforeLoad: () => {
    throw redirect({ to: "/search" });
  },
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
      { title: "Bronx Businesses — The Bronx App" },
      {
        name: "description",
        content:
          "Browse and support local Bronx businesses. Food, retail, health, and services across the borough.",
      },
      { property: "og:title", content: "Bronx Businesses Directory" },
      {
        property: "og:description",
        content: "Find and support local Bronx businesses by category and neighborhood.",
      },
    ],
  }),
  component: BusinessesPage,
});

type DirectoryItem = {
  id: string;
  name: string;
  category: Category;
  neighborhood: string;
  address: string;
  description: string;
  phone?: string;
  emoji: string;
  verified: boolean;
  claimed: boolean;
  storefrontPhoto?: string;
  videoCount?: number;
  status: VerificationStatus;
  lastVerified: string | null;
};

const CAT_META = (c: Category) => CATEGORIES.find((x) => x.id === c);

function guessNeighborhood(address: string): string {
  const parts = address.split(",");
  if (parts.length >= 2) return parts[parts.length - 2].trim();
  return "Bronx";
}

/** Businesses owners registered through the app (kept until they sync up). */
function registeredItems(): DirectoryItem[] {
  return getBusinesses()
    .filter(isLiveBusiness)
    .map((b) => {
      const cat = (
        CAT_META(b.category as Category) ? (b.category as Category) : "services"
      ) as Category;
      return {
        id: b.id,
        name: b.name,
        category: cat,
        neighborhood: guessNeighborhood(b.address),
        address: b.address,
        description: b.description || "",
        phone: b.phone,
        emoji: CAT_META(cat)?.emoji ?? "🏪",
        verified: b.verified,
        claimed: true,
        storefrontPhoto: b.storefrontPhoto,
        videoCount: (b.videos ?? []).length,
        status: (b.verified ? "verified_by_bronx_app" : "needs_verification") as VerificationStatus,
        lastVerified: null,
      };
    });
}

function BusinessesPage() {
  useBusinessSync();
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "All">("All");
  const [master, setMaster] = useState<DirectoryItem[]>([]);

  // The Bronx Businesses page is a FILTERED VIEW of the same unified listings
  // database the category pages use — business-type listings, all categories.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await loadDirectory();
      if (cancelled) return;
      const items = rows
        .filter((r) => r.listing_type === "business")
        .map((r) => {
          const res = bronxToResource(r);
          return {
            id: res.id,
            name: res.name.en,
            category: res.category,
            neighborhood: r.neighborhood || guessNeighborhood(r.address ?? ""),
            address: res.address,
            description: res.description.en,
            phone: r.phone ?? undefined,
            emoji: CAT_META(res.category)?.emoji ?? "🏪",
            verified: res.__imported.status === "verified_by_bronx_app",
            claimed: false,
            status: res.__imported.status,
            lastVerified: res.__imported.lastVerified,
          } satisfies DirectoryItem;
        });
      setMaster(items);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const all = useMemo(() => {
    const map = new Map<string, DirectoryItem>();
    for (const b of master) map.set(b.name.toLowerCase(), b);
    for (const b of registeredItems()) map.set(b.name.toLowerCase(), b);
    return Array.from(map.values());
  }, [master]);

  const cats = useMemo(() => {
    const present = Array.from(new Set(all.map((b) => b.category)));
    return present.sort((a, b) => (CAT_META(a)?.id ?? "").localeCompare(CAT_META(b)?.id ?? ""));
  }, [all]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return all.filter((b) => {
      if (cat !== "All" && b.category !== cat) return false;
      if (!query) return true;
      return (
        b.name.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query) ||
        b.neighborhood.toLowerCase().includes(query) ||
        b.address.toLowerCase().includes(query)
      );
    });
  }, [all, q, cat]);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <Link
          to="/"
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        {/* Hero */}
        <section className="rounded-3xl bg-gradient-to-br from-accent to-primary text-primary-fill-foreground p-6 sm:p-8 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 grid place-items-center shrink-0">
              <Briefcase className="h-7 w-7" aria-hidden />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl">Bronx Businesses</h1>
              <p className="mt-1 text-sm sm:text-base opacity-95 max-w-2xl">
                Find and support local Bronx businesses — from Arthur Avenue to Morrisania. Every
                listing here also appears in its main category.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-5 relative">
            <Search
              className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary"
              aria-hidden
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search businesses, neighborhoods…"
              className="w-full ps-12 pe-4 py-3 rounded-2xl border-2 border-white/40 bg-white text-foreground focus:outline-none focus:border-white shadow-sm min-h-[52px]"
              aria-label="Search businesses"
            />
          </div>
        </section>

        {/* Filter chips — the site-wide categories, not a separate taxonomy */}
        <div role="tablist" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {(["All", ...cats] as (Category | "All")[]).map((c) => {
            const active = cat === c;
            const label =
              c === "All" ? "All" : `${CAT_META(c)?.emoji ?? ""} ${t(CAT_META(c)?.labelKey ?? c)}`;
            return (
              <button
                key={c}
                role="tab"
                aria-selected={active}
                onClick={() => setCat(c)}
                className={`no-min-h text-sm px-3 py-2 rounded-full border-2 transition ${
                  active
                    ? "border-primary bg-primary-fill text-primary-fill-foreground"
                    : "border-border bg-card hover:border-primary"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Owner CTAs */}
        <section className="grid sm:grid-cols-2 gap-3">
          <Link
            to="/business-register"
            className="no-min-h rounded-2xl border-2 border-border bg-card p-4 flex items-center gap-3 hover:border-primary transition"
          >
            <div className="h-12 w-12 rounded-xl bg-primary/10 grid place-items-center text-primary">
              <BadgeCheck className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="font-bold">Own a business? Claim your listing</p>
              <p className="text-xs text-muted-foreground">
                Add hours, photos, jobs, and events. Free tier available.
              </p>
            </div>
          </Link>
          <Link
            to="/roadmap"
            className="no-min-h rounded-2xl border-2 border-border bg-card p-4 flex items-center gap-3 hover:border-accent transition"
          >
            <div className="h-12 w-12 rounded-xl bg-accent/10 grid place-items-center text-accent">
              <Rocket className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="font-bold">
                Starting a business?{" "}
                <span className="text-[10px] font-bold text-warning">(SOON)</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Entrepreneur Hub is on the roadmap — see what's coming.
              </p>
            </div>
          </Link>
        </section>

        {/* Directory */}
        <section aria-label="Business directory">
          <p className="text-sm text-muted-foreground mb-3">
            {filtered.length} {filtered.length === 1 ? "business" : "businesses"}
          </p>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No businesses match your search.{" "}
              <Link to="/business-register" className="text-primary font-semibold hover:underline">
                Know one? Add it →
              </Link>
            </div>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-3">
              {filtered.map((b) => (
                <li
                  key={b.id}
                  className="rounded-2xl border-2 border-border bg-card overflow-hidden flex flex-col"
                >
                  {b.storefrontPhoto && (
                    <div className="relative w-full aspect-[16/9] bg-secondary">
                      <img
                        src={b.storefrontPhoto}
                        alt={`${b.name} storefront`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute top-2 start-2 text-[10px] font-bold uppercase tracking-wide bg-black/70 text-white px-2 py-0.5 rounded">
                        📸 Storefront
                      </span>
                      {b.videoCount ? (
                        <span className="absolute top-2 end-2 text-[10px] font-bold bg-black/70 text-white px-2 py-0.5 rounded inline-flex items-center gap-1">
                          ▶ {b.videoCount}
                        </span>
                      ) : null}
                    </div>
                  )}
                  <div className="p-4 flex flex-col">
                    <div className="flex items-start gap-3">
                      <div
                        className="h-12 w-12 rounded-xl bg-secondary grid place-items-center text-2xl shrink-0"
                        aria-hidden
                      >
                        {b.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold truncate">{b.name}</h3>
                          <VerifiedPill
                            status={b.status}
                            lastVerified={b.lastVerified}
                            category={b.category}
                            compact
                          />
                          {!b.storefrontPhoto && b.videoCount ? (
                            <span className="text-[10px] font-bold bg-foreground/85 text-background px-1.5 py-0.5 rounded">
                              ▶ {b.videoCount} video{b.videoCount === 1 ? "" : "s"}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <Link
                            to="/category/$cat"
                            params={{ cat: b.category }}
                            className="hover:underline"
                          >
                            {t(CAT_META(b.category)?.labelKey ?? b.category)}
                          </Link>{" "}
                          · {b.neighborhood}
                        </p>
                      </div>
                    </div>
                    {b.description && <p className="text-sm mt-2 line-clamp-2">{b.description}</p>}
                    <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" aria-hidden /> {b.address}
                    </p>
                    <CallAheadNote className="mt-1.5" />
                    {b.phone && (
                      <a
                        href={`tel:${b.phone.replace(/[^0-9+]/g, "")}`}
                        data-call-now
                        className="no-min-h mt-3 inline-flex items-center gap-1.5 self-start px-3 py-2 rounded-full bg-primary-fill text-primary-fill-foreground text-sm font-semibold min-h-[44px]"
                      >
                        <Phone className="h-4 w-4" aria-hidden /> {b.phone}
                      </a>
                    )}
                    {!b.claimed && (
                      <p className="mt-3 text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Megaphone className="h-3.5 w-3.5" aria-hidden />
                        Is this your business?{" "}
                        <Link
                          to="/business-register"
                          className="text-primary font-semibold hover:underline ms-1"
                        >
                          Claim it
                        </Link>
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
