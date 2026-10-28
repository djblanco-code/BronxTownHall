import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

export const Route = createFileRoute("/how-to-add")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "How to Add Information — The Bronx App" },
      { name: "description", content: "Add your organization, submit a new resource, or share a local event with the Bronx community." },
    ],
  }),
  component: HowToAddPage,
});

function HowToAddPage() {
  const { t } = useI18n();
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/" className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline">
          <ArrowLeft className="h-4 w-4" /> {t("howToAdd.home")}
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t("howToAdd.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("howToAdd.subtitle")}</p>

        <div className="space-y-8">
          <Card
            title={t("howToAdd.membersTitle")}
            steps={[t("howToAdd.members1"), t("howToAdd.members2"), t("howToAdd.members3")]}
            action={<Link to="/request-resource" className="btn-primary">{t("howToAdd.membersCta")}</Link>}
          />

          <Card
            title={t("howToAdd.orgsTitle")}
            steps={[t("howToAdd.orgs1"), t("howToAdd.orgs2"), t("howToAdd.orgs3"), t("howToAdd.orgs4")]}
            action={<Link to="/business-register" className="btn-primary">{t("howToAdd.orgsCta")}</Link>}
          />

          <Card
            title={t("howToAdd.eventsTitle")}
            steps={[t("howToAdd.events1"), t("howToAdd.events2"), t("howToAdd.events3")]}
            action={<Link to="/events" className="btn-primary">{t("howToAdd.eventsCta")}</Link>}
          />

          <Card title={t("howToAdd.reportTitle")} steps={[t("howToAdd.report1"), t("howToAdd.report2")]} />
        </div>
      </div>
    </AppShell>
  );
}

function Card({ title, steps, action }: { title: string; steps: string[]; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border-2 border-border bg-card p-6">
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      <ol className="space-y-2 mb-4">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <span>{s}</span>
          </li>
        ))}
      </ol>
      {action}
    </section>
  );
}
