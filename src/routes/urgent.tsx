import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { HOTLINES } from "@/lib/resources-extra";
import { Phone, MessageSquare, ArrowLeft, AlertTriangle, Home, ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

export const Route = createFileRoute("/urgent")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Urgent Help — The Bronx App" },
      { name: "description", content: "Crisis hotlines, text lines, and emergency shelter for Bronx residents. Free, confidential, 24/7." },
    ],
  }),
  component: UrgentPage,
});

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  hotline: Phone, text: MessageSquare, shelter: Home, emergency: ShieldAlert,
};

const AVAILABILITY_KEYS: Record<string, string> = {
  "24/7": "urgent.avail247",
  "Mon-Fri, hours vary (or call 311)": "urgent.availMoia",
  "M-F 9am-6pm": "urgent.availHunger",
};

function UrgentPage() {
  const nav = useNavigate();
  const { t } = useI18n();
  const groups: { key: string; label: string; types: string[] }[] = [
    { key: "hotline", label: t("urgent.groupHotline"), types: ["hotline"] },
    { key: "text", label: t("urgent.groupText"), types: ["text"] },
    { key: "shelter", label: t("urgent.groupShelter"), types: ["shelter"] },
    { key: "emergency", label: t("urgent.groupEmergency"), types: ["emergency"] },
  ];

  return (
    <AppShell>
      <div className="bg-destructive text-destructive-foreground">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button onClick={() => nav({ to: "/" })} className="no-min-h inline-flex items-center gap-1.5 text-sm font-medium mb-3 hover:underline">
            <ArrowLeft className="h-4 w-4" /> {t("urgent.home")}
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 grid place-items-center">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{t("urgent.title")}</h1>
              <p className="text-sm sm:text-base mt-0.5">{t("urgent.subtitle")}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <a href="tel:911" className="no-min-h flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-destructive font-bold shadow min-h-[56px]">
              <Phone className="h-5 w-5" /> {t("urgent.call911")}
            </a>
            <a href="tel:988" className="no-min-h flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-destructive font-bold shadow min-h-[56px]">
              <Phone className="h-5 w-5" /> {t("urgent.call988")}
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {groups.map((g) => {
          const items = HOTLINES.filter((h) => g.types.includes(h.type));
          if (!items.length) return null;
          return (
            <section key={g.key}>
              <h2 className="text-lg font-bold mb-3">{g.label}</h2>
              <ul className="space-y-3">
                {items.map((h) => {
                  const Icon = ICONS[h.type] ?? Phone;
                  const href = h.type === "text" ? `sms:${h.number}${h.textBody ? `?&body=${encodeURIComponent(h.textBody)}` : ""}`
                    : `tel:${h.number.replace(/[^0-9+]/g, "")}`;
                  return (
                    <li key={h.id} className="rounded-2xl border-2 border-destructive/30 bg-card p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-11 w-11 rounded-xl grid place-items-center bg-destructive/15 text-destructive shrink-0">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-foreground">{t(`urgent.${h.id}.name`)}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{t(`urgent.${h.id}.desc`)}</p>
                          <p className="text-xs uppercase tracking-wide text-destructive font-semibold mt-1">{AVAILABILITY_KEYS[h.available] ? t(AVAILABILITY_KEYS[h.available]) : h.available}</p>
                        </div>
                      </div>
                      <a href={href} className="no-min-h mt-3 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive text-destructive-foreground font-bold min-h-[48px]">
                        {h.type === "text" ? <><MessageSquare className="h-5 w-5" /> {t("urgent.textCta", { word: h.textBody ?? "", number: h.number })}</> : <><Phone className="h-5 w-5" /> {t("urgent.callCta", { number: h.number })}</>}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <p className="text-xs text-muted-foreground text-center pt-2">
          {t("urgent.footnote")}
        </p>
        <Link to="/" className="no-min-h block text-center text-sm text-primary hover:underline">{t("urgent.backHome")}</Link>
      </div>
    </AppShell>
  );
}
