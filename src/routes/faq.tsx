import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { PagePhoto } from "@/features/photos";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";

export const Route = createFileRoute("/faq")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "FAQ — The Bronx App" },
      {
        name: "description",
        content:
          "Frequently asked questions about The Bronx App: pricing, adding resources, elected officials, events, and more.",
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(0);

  const link = (to: string, label: string) => (
    <Link to={to} className="text-primary underline">
      {label}
    </Link>
  );

  const qas: { q: string; a: React.ReactNode }[] = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    {
      q: t("faq.q3"),
      a: (
        <>
          {t("faq.a3")} — {link("/portal", t("faq.linkRegister"))}
        </>
      ),
    },
    {
      q: t("faq.q4"),
      a: (
        <>
          {t("faq.a4")} — {link("/events", t("faq.linkEvents"))}
        </>
      ),
    },
    {
      q: t("faq.q5"),
      a: (
        <>
          {t("faq.a5")} — {link("/civic", t("faq.linkCivic"))}
        </>
      ),
    },
    { q: t("faq.q6"), a: t("faq.a6") },
    { q: t("faq.q7"), a: t("faq.a7") },
    {
      q: t("faq.q8"),
      a: (
        <>
          {t("faq.a8")} — {link("/privacy", t("faq.linkPrivacy"))}
        </>
      ),
    },
    {
      q: t("faq.q9"),
      a: (
        <>
          {t("faq.a9")} — {link("/urgent", t("faq.linkUrgent"))}
        </>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Link
          to="/"
          className="no-min-h mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t("faq.home")}
        </Link>
        <PagePhoto slug={"el-train"} />
        <h1 className="mb-6 text-3xl text-foreground sm:text-4xl">{t("faq.title")}</h1>
        <ul className="divide-y divide-border border-y border-border">
          {qas.map((qa, i) => (
            <li key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="no-min-h group flex min-h-14 w-full items-center justify-between gap-3 py-3 text-start"
                aria-expanded={open === i}
              >
                <span className="font-bold text-foreground group-hover:underline">{qa.q}</span>
                {open === i ? (
                  <Minus className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                ) : (
                  <Plus className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                )}
              </button>
              {open === i && (
                <div className="pb-4 leading-relaxed text-muted-foreground">{qa.a}</div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
