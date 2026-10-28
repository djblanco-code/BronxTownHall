import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Terms of Use — The Bronx App" },
      { name: "description", content: "The Bronx App terms of use for residents, contributors, and listed organizations." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { t } = useI18n();
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/" className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline">
          <ArrowLeft className="h-4 w-4" /> {t("terms.home")}
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t("terms.title")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("terms.updated")}</p>

        <div className="space-y-6 leading-relaxed text-foreground">
          <p>{t("terms.intro")}</p>

          <section>
            <h2 className="text-2xl font-bold mb-2">{t("terms.accuracyTitle")}</h2>
            <p>{t("terms.accuracy")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-2">{t("terms.submissionsTitle")}</h2>
            <p>{t("terms.submissions")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-2">{t("terms.listingsTitle")}</h2>
            <p>{t("terms.listings")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-2">{t("terms.useTitle")}</h2>
            <ul className="list-disc ps-6 space-y-1">
              <li>{t("terms.use1")}</li>
              <li>{t("terms.use2")}</li>
              <li>{t("terms.use3")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-2">{t("terms.warrantyTitle")}</h2>
            <p>{t("terms.warranty")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-2">{t("terms.contactTitle")}</h2>
            <p>
              {t("terms.contactPre")}{" "}
              <a href="mailto:hello@thebronxapp.org" className="text-primary underline">hello@thebronxapp.org</a>{" "}
              {t("terms.contactPost")}
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
