import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ArrowLeft, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "About — The Bronx App" },
      { name: "description", content: "The Bronx App helps residents find free, life-improving resources and hyper-local events in one place." },
      { property: "og:title", content: "About — The Bronx App" },
      { property: "og:description", content: "Our mission: help Bronx residents find resources and events, in one free app." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/" className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline">
          <ArrowLeft className="h-4 w-4" /> {t("about.home")}
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center text-primary-foreground">
            <Heart className="h-6 w-6" fill="currentColor" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">{t("about.title")}</h1>
        </div>

        <p className="text-lg text-muted-foreground mb-6">{t("about.tagline")}</p>

        <section className="space-y-4 text-foreground leading-relaxed">
          <h2 className="text-2xl font-bold mt-6">{t("about.missionTitle")}</h2>
          <p>{t("about.mission")}</p>

          <h2 className="text-2xl font-bold mt-6">{t("about.storyTitle")}</h2>
          <p>{t("about.story")}</p>

          <h2 className="text-2xl font-bold mt-6">{t("about.whoTitle")}</h2>
          <ul className="list-disc ps-6 space-y-1">
            <li>{t("about.who1")}</li>
            <li>{t("about.who2")}</li>
            <li>{t("about.who3")}</li>
            <li>{t("about.who4")}</li>
          </ul>

          <h2 className="text-2xl font-bold mt-6">{t("about.howTitle")}</h2>
          <p>{t("about.how")}</p>

          <div className="mt-8 p-5 rounded-2xl bg-secondary">
            <p className="font-semibold mb-2">{t("about.helpTitle")}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/how-to-add" className="no-min-h px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">{t("about.addResource")}</Link>
              <Link to="/contact" className="no-min-h px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-card">{t("about.getInTouch")}</Link>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
