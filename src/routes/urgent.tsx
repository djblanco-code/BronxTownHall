import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { HOTLINES } from "@/lib/resources-extra";
import { Phone, MessageSquare, ArrowLeft, Home, ShieldAlert, type LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

export const Route = createFileRoute("/urgent")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Urgent Help — The Bronx App" },
      {
        name: "description",
        content:
          "Crisis hotlines, text lines, and emergency shelter for Bronx residents. Free, confidential, 24/7.",
      },
    ],
  }),
  component: UrgentPage,
});

const ICONS: Record<string, LucideIcon> = {
  hotline: Phone,
  text: MessageSquare,
  shelter: Home,
  emergency: ShieldAlert,
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
      <div className="mx-auto max-w-3xl px-4 py-6">
        <button
          onClick={() => nav({ to: "/" })}
          className="no-min-h mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t("urgent.home")}
        </button>
        <h1 className="text-3xl font-bold text-destructive sm:text-4xl">{t("urgent.title")}</h1>
        <p className="mt-1 text-foreground sm:text-lg">{t("urgent.subtitle")}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <a
            href="tel:911"
            className="no-min-h flex min-h-14 items-center justify-center gap-2 rounded-md bg-destructive px-3 text-lg font-bold text-destructive-foreground hover:bg-destructive/90"
          >
            <Phone className="h-5 w-5 shrink-0" aria-hidden="true" /> {t("urgent.call911")}
          </a>
          <a
            href="tel:988"
            className="no-min-h flex min-h-14 items-center justify-center gap-2 rounded-md bg-destructive px-3 text-lg font-bold text-destructive-foreground hover:bg-destructive/90"
          >
            <Phone className="h-5 w-5 shrink-0" aria-hidden="true" /> {t("urgent.call988")}
          </a>
        </div>

        {groups.map((g) => {
          const items = HOTLINES.filter((h) => g.types.includes(h.type));
          if (!items.length) return null;
          return (
            <section key={g.key} aria-labelledby={`urgent-${g.key}`} className="mt-8">
              <h2
                id={`urgent-${g.key}`}
                className="border-t-[3px] border-destructive pt-2 text-lg font-bold text-destructive sm:text-2xl"
              >
                {g.label}
              </h2>
              <ul className="divide-y divide-border border-b border-border">
                {items.map((h) => {
                  const Icon = ICONS[h.type] ?? Phone;
                  const href =
                    h.type === "text"
                      ? `sms:${h.number}${h.textBody ? `?&body=${encodeURIComponent(h.textBody)}` : ""}`
                      : `tel:${h.number.replace(/[^0-9+]/g, "")}`;
                  return (
                    <li key={h.id} className="py-4">
                      <div className="flex items-start gap-3">
                        <Icon
                          className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="label-caps text-destructive">
                            {AVAILABILITY_KEYS[h.available]
                              ? t(AVAILABILITY_KEYS[h.available])
                              : h.available}
                          </p>
                          <p className="font-bold text-foreground">{t(`urgent.${h.id}.name`)}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {t(`urgent.${h.id}.desc`)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={href}
                        className="no-min-h mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-destructive px-5 py-2 text-center font-bold sm:w-auto text-destructive-foreground hover:bg-destructive/90"
                      >
                        {h.type === "text" ? (
                          <>
                            <MessageSquare className="h-5 w-5 shrink-0" aria-hidden="true" />{" "}
                            {t("urgent.textCta", { word: h.textBody ?? "", number: h.number })}
                          </>
                        ) : (
                          <>
                            <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />{" "}
                            {t("urgent.callCta", { number: h.number })}
                          </>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <p className="mt-8 text-center text-xs text-muted-foreground">{t("urgent.footnote")}</p>
        <Link
          to="/"
          className="no-min-h mt-2 flex min-h-11 items-center justify-center text-sm font-bold text-primary underline underline-offset-4"
        >
          {t("urgent.backHome")}
        </Link>
      </div>
    </AppShell>
  );
}
