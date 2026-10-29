import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { ArrowLeft, CheckCircle2, Mail, Send } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useI18n } from "@/lib/i18n-context";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Contact — The Bronx App" },
      {
        name: "description",
        content:
          "Get in touch with The Bronx App team. Report a resource, suggest a feature, or partner with us.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useI18n();
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const schema = z.object({
      name: z.string().trim().min(1, t("contact.errName")).max(100),
      email: z.string().trim().email(t("contact.errEmail")).max(200),
      subject: z.string().trim().min(1, t("contact.errSubject")).max(150),
      message: z.string().trim().min(5, t("contact.errMessage")).max(2000),
    });
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) {
      setErr(parsed.error.errors[0]?.message ?? t("contact.errGeneric"));
      return;
    }
    const { name, email, subject, message } = parsed.data;
    const body = `From: ${name} <${email}>\n\n${message}`;
    window.location.href = `mailto:hello@thebronxapp.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setDone(true);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Link
          to="/"
          className="no-min-h mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t("contact.home")}
        </Link>
        <h1 className="mb-2 text-3xl text-foreground sm:text-4xl">{t("contact.title")}</h1>
        <p className="mb-6 inline-flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" aria-hidden="true" /> hello@thebronxapp.org
        </p>

        {done ? (
          <div className="flex items-start gap-3 rounded-md border border-border p-4">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-lg font-bold">{t("contact.doneTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("contact.doneBody")}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 rounded-md border border-border p-4">
            <Field label={t("contact.labelName")}>
              <input
                name="name"
                required
                maxLength={100}
                placeholder={t("contact.placeholderName")}
                className={inp}
              />
            </Field>
            <Field label={t("contact.labelEmail")}>
              <input
                name="email"
                type="email"
                required
                maxLength={200}
                placeholder={t("contact.placeholderEmail")}
                className={inp}
              />
            </Field>
            <Field label={t("contact.labelSubject")}>
              <input
                name="subject"
                required
                maxLength={150}
                placeholder={t("contact.placeholderSubject")}
                className={inp}
              />
            </Field>
            <Field label={t("contact.labelMessage")}>
              <textarea
                name="message"
                required
                rows={6}
                maxLength={2000}
                placeholder={t("contact.placeholderMessage")}
                className={inp}
              />
            </Field>
            {err && (
              <p role="alert" className="text-sm font-semibold text-destructive">
                {err}
              </p>
            )}
            <button
              type="submit"
              className="no-min-h inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-primary-fill px-5 py-3 font-bold text-primary-fill-foreground hover:bg-primary-fill-hover"
            >
              <Send className="h-4 w-4" aria-hidden="true" /> {t("contact.send")}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}

const inp =
  "min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      {children}
    </label>
  );
}
