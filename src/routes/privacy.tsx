import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { ArrowLeft } from "lucide-react";
import { DataControls } from "@/components/DataControls";
import { useI18n } from "@/lib/i18n-context";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Privacy Policy — The Bronx App" },
      {
        name: "description",
        content: "How The Bronx App handles your personal information, location, and data.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = useI18n();
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Link
          to="/"
          className="no-min-h mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t("privacy.home")}
        </Link>
        <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
          {t("privacy.title")}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">{t("privacy.updated")}</p>

        <div className="space-y-6 leading-relaxed text-foreground">
          <p>{t("privacy.intro")}</p>

          <section className="rounded-md border border-border p-4">
            <h2 className="mb-2 text-xl font-bold sm:text-2xl">{t("privacy.protectTitle")}</h2>
            <p>{t("privacy.protect")}</p>
          </section>

          <section>
            <h2 className="mb-2 pt-2 text-xl font-bold sm:text-2xl">{t("privacy.collectTitle")}</h2>
            <p className="mb-4">{t("privacy.collectIntro")}</p>

            <h3 className="mb-2 text-lg font-bold">{t("privacy.noAccountTitle")}</h3>
            <ul className="list-disc ps-6 space-y-1 mb-4">
              <li>
                <strong>{t("privacy.noAccount1Label")}</strong> — {t("privacy.noAccount1")}
              </li>
              <li>
                <strong>{t("privacy.noAccount2Label")}</strong> — {t("privacy.noAccount2")}
              </li>
              <li>
                <strong>{t("privacy.noAccount3Label")}</strong> — {t("privacy.noAccount3")}
              </li>
              <li>
                <strong>{t("privacy.noAccount4Label")}</strong> — {t("privacy.noAccount4")}
              </li>
            </ul>

            <h3 className="mb-2 text-lg font-bold">{t("privacy.accountTitle")}</h3>
            <ul className="list-disc ps-6 space-y-1">
              <li>
                <strong>{t("privacy.account1Label")}</strong> — {t("privacy.account1")}
              </li>
              <li>
                <strong>{t("privacy.account2Label")}</strong> — {t("privacy.account2")}
              </li>
              <li>
                <strong>{t("privacy.account3Label")}</strong> — {t("privacy.account3")}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 pt-2 text-xl font-bold sm:text-2xl">
              {t("privacy.deletionTitle")}
            </h2>
            <p>
              {t("privacy.deletionPre")}{" "}
              <a href="mailto:hello@thebronxapp.org" className="text-primary underline">
                hello@thebronxapp.org
              </a>
              . {t("privacy.deletionPost")}
            </p>
          </section>

          <DataControls />

          <section>
            <h2 className="mb-2 pt-2 text-xl font-bold sm:text-2xl">{t("privacy.dontTitle")}</h2>
            <ul className="list-disc ps-6 space-y-1">
              <li>{t("privacy.dont1")}</li>
              <li>{t("privacy.dont2")}</li>
              <li>{t("privacy.dont3")}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 pt-2 text-xl font-bold sm:text-2xl">{t("privacy.thirdTitle")}</h2>
            <p>{t("privacy.third")}</p>
          </section>

          <section>
            <h2 className="mb-2 pt-2 text-xl font-bold sm:text-2xl">{t("privacy.choicesTitle")}</h2>
            <ul className="list-disc ps-6 space-y-1">
              <li>{t("privacy.choice1")}</li>
              <li>{t("privacy.choice2")}</li>
              <li>{t("privacy.choice3")}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 pt-2 text-xl font-bold sm:text-2xl">{t("privacy.contactTitle")}</h2>
            <p>
              {t("privacy.contactPre")}{" "}
              <a href="mailto:hello@thebronxapp.org" className="text-primary underline">
                hello@thebronxapp.org
              </a>{" "}
              {t("privacy.contactMid")}{" "}
              <Link to="/contact" className="text-primary underline">
                {t("privacy.contactLink")}
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
