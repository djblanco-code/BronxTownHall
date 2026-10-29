import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { PagePhoto } from "@/features/photos";
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
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-6">
        <PagePhoto slug={"fordham-road"} />
        <header>
          <h1 className="text-3xl text-foreground sm:text-4xl">{t("advertise.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("advertise.intro")}</p>
        </header>

        <section className="grid gap-x-6 sm:grid-cols-2">
          <div className="flex items-start gap-3 py-3">
            <LayoutPanelTop className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0">
              <h3 className="font-bold">{t("advertise.bannerTitle")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("advertise.bannerBody")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 py-3">
            <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0">
              <h3 className="font-bold">{t("advertise.cardTitle")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("advertise.cardBody")}</p>
            </div>
          </div>
        </section>

        <section className="pt-2">
          <h2 className="flex items-center gap-2 text-lg font-bold sm:text-2xl">
            <Shield className="h-5 w-5 shrink-0 text-primary" aria-hidden />{" "}
            {t("advertise.neverTitle")}
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
            <Link to="/privacy" className="font-semibold text-primary hover:underline">
              {t("advertise.readPrivacyLink")}
            </Link>
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
