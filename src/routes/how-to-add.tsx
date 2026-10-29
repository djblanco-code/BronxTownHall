import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

export const Route = createFileRoute("/how-to-add")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "How to Add Information — The Bronx App" },
      {
        name: "description",
        content:
          "Add your organization, submit a new resource, or share a local event with the Bronx community.",
      },
    ],
  }),
  component: HowToAddPage,
});

function HowToAddPage() {
  const { t } = useI18n();
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Link
          to="/"
          className="no-min-h mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t("howToAdd.home")}
        </Link>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{t("howToAdd.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("howToAdd.subtitle")}</p>

        <div>
          <Card
            title={t("howToAdd.membersTitle")}
            steps={[t("howToAdd.members1"), t("howToAdd.members2"), t("howToAdd.members3")]}
            action={
              <Link to="/request-resource" className={ACTION}>
                {t("howToAdd.membersCta")}
              </Link>
            }
          />

          <Card
            title={t("howToAdd.orgsTitle")}
            steps={[
              t("howToAdd.orgs1"),
              t("howToAdd.orgs2"),
              t("howToAdd.orgs3"),
              t("howToAdd.orgs4"),
            ]}
            action={
              <Link to="/portal" className={ACTION}>
                {t("howToAdd.orgsCta")}
              </Link>
            }
          />

          <Card
            title={t("howToAdd.eventsTitle")}
            steps={[t("howToAdd.events1"), t("howToAdd.events2"), t("howToAdd.events3")]}
            action={
              <Link to="/events" className={ACTION}>
                {t("howToAdd.eventsCta")}
              </Link>
            }
          />

          <Card
            title={t("howToAdd.reportTitle")}
            steps={[t("howToAdd.report1"), t("howToAdd.report2")]}
          />
        </div>
      </div>
    </AppShell>
  );
}

/** Each section's next step: the secondary outline button (docs/design-system.md). */
const ACTION =
  "no-min-h inline-flex min-h-11 items-center rounded-md border-2 border-foreground px-5 py-2 text-sm font-bold text-foreground hover:bg-foreground hover:text-background";

function Card({
  title,
  steps,
  action,
}: {
  title: string;
  steps: string[];
  action?: React.ReactNode;
}) {
  return (
    <section className="mt-8 border-t-[3px] border-foreground pt-2">
      <h2 className="mb-3 text-lg font-bold sm:text-2xl">{title}</h2>
      <ol className="mb-4 space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <span>{s}</span>
          </li>
        ))}
      </ol>
      {action}
    </section>
  );
}
