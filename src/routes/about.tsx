import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { PagePhoto } from "@/features/photos";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "About — The Bronx App" },
      {
        name: "description",
        content:
          "The Bronx App helps residents find free, life-improving resources and hyper-local events in one place.",
      },
      { property: "og:title", content: "About — The Bronx App" },
      {
        property: "og:description",
        content: "Our mission: help Bronx residents find resources and events, in one free app.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Link
          to="/"
          className="no-min-h mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t("about.home")}
        </Link>
        <PagePhoto slug={"grand-concourse"} />
        <h1 className="text-3xl text-foreground sm:text-4xl">{t("about.title")}</h1>

        <p className="mt-2 mb-6 text-lg text-muted-foreground">{t("about.tagline")}</p>

        <section className="space-y-3 leading-relaxed text-foreground">
          <h2 className={H2}>{t("about.missionTitle")}</h2>
          <p>{t("about.mission")}</p>

          <h2 className={H2}>{t("about.storyTitle")}</h2>
          <p>{t("about.story")}</p>

          <h2 className={H2}>{t("about.whoTitle")}</h2>
          <ul className="list-disc space-y-1 ps-6">
            <li>{t("about.who1")}</li>
            <li>{t("about.who2")}</li>
            <li>{t("about.who3")}</li>
            <li>{t("about.who4")}</li>
          </ul>

          <h2 className={H2}>{t("about.howTitle")}</h2>
          <p>{t("about.how")}</p>

          <div className="mt-10 pt-3">
            <p className="mb-3 font-bold">{t("about.helpTitle")}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/how-to-add"
                className="no-min-h inline-flex h-11 items-center rounded-md bg-primary-fill px-5 text-sm font-bold text-primary-fill-foreground hover:bg-primary-fill-hover"
              >
                {t("about.addResource")}
              </Link>
              <Link
                to="/contact"
                className="no-min-h inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-bold text-foreground hover:bg-secondary"
              >
                {t("about.getInTouch")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

/** Section headings in running text: a heavy rule above, as on Home. */
const H2 = "mt-8 pt-2 text-xl font-bold sm:text-2xl";
