import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { AdInquiryForm } from "@/components/AdInquiryForm";
import { Megaphone, LayoutPanelTop, Shield, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

export const Route = createFileRoute("/advertise")({
  staticData: { sitemap: true },
  component: AdvertisePage,
  head: () => ({
    meta: [
      { title: "Advertise with The Bronx App — Sponsored Placements" },
      {
        name: "description",
        content:
          "Reach Bronx residents with a clearly-labeled homepage banner or sponsored listing card. Contextual only — no user data, no tracking. Tell us what you need and we'll follow up.",
      },
      { property: "og:title", content: "Advertise with The Bronx App" },
      {
        property: "og:description",
        content:
          "Modest, clearly-labeled sponsored placements for Bronx businesses and organizations. No surveillance advertising.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function AdvertisePage() {
  const { t } = useI18n();
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-primary" aria-hidden /> {t("advertise.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("advertise.intro")}</p>
        </header>

        <section className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border-2 border-border bg-card p-5">
            <LayoutPanelTop className="h-6 w-6 text-primary" aria-hidden />
            <h2 className="font-bold mt-2">{t("advertise.bannerTitle")}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t("advertise.bannerBody")}</p>
          </div>
          <div className="rounded-2xl border-2 border-border bg-card p-5">
            <Megaphone className="h-6 w-6 text-primary" aria-hidden />
            <h2 className="font-bold mt-2">{t("advertise.cardTitle")}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t("advertise.cardBody")}</p>
          </div>
        </section>

        <section className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5">
          <h2 className="font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" aria-hidden /> {t("advertise.neverTitle")}
          </h2>
          <ul className="mt-2 text-sm text-muted-foreground space-y-1.5 list-disc ps-5">
            <li>{t("advertise.never1")}</li>
            <li>{t("advertise.never2")}</li>
            <li>{t("advertise.never3")}</li>
            <li>{t("advertise.never4")}</li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            {t("advertise.readPrivacyPre")}{" "}
            <Link to="/privacy" className="font-semibold text-primary hover:underline">{t("advertise.readPrivacyLink")}</Link>
          </p>
        </section>

        <section>
          <p className="text-sm text-muted-foreground mb-3">{t("advertise.ratesNote")}</p>
          <AdInquiryForm />
        </section>
      </div>
    </AppShell>
  );
}
