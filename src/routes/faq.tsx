import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";

export const Route = createFileRoute("/faq")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "FAQ — The Bronx App" },
      { name: "description", content: "Frequently asked questions about The Bronx App: pricing, adding resources, elected officials, events, and more." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(0);

  const link = (to: string, label: string) => (
    <Link to={to} className="text-primary underline">{label}</Link>
  );

  const qas: { q: string; a: React.ReactNode }[] = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: <>{t("faq.a3")} — {link("/business-register", t("faq.linkRegister"))}</> },
    { q: t("faq.q4"), a: <>{t("faq.a4")} — {link("/events", t("faq.linkEvents"))}</> },
    { q: t("faq.q5"), a: <>{t("faq.a5")} — {link("/civic", t("faq.linkCivic"))}</> },
    { q: t("faq.q6"), a: t("faq.a6") },
    { q: t("faq.q7"), a: t("faq.a7") },
    { q: t("faq.q8"), a: <>{t("faq.a8")} — {link("/privacy", t("faq.linkPrivacy"))}</> },
    { q: t("faq.q9"), a: <>{t("faq.a9")} — {link("/urgent", t("faq.linkUrgent"))}</> },
  ];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/" className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline">
          <ArrowLeft className="h-4 w-4" /> {t("faq.home")}
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">{t("faq.title")}</h1>
        <ul className="space-y-2">
          {qas.map((qa, i) => (
            <li key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="no-min-h w-full text-start px-5 py-4 flex items-center justify-between gap-3 hover:bg-secondary/50"
                aria-expanded={open === i}
              >
                <span className="font-semibold">{qa.q}</span>
                <span className="text-primary text-xl font-bold shrink-0">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <div className="px-5 pb-5 text-muted-foreground leading-relaxed">{qa.a}</div>}
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
