import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useI18n } from "@/lib/i18n-context";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Contact — The Bronx App" },
      { name: "description", content: "Get in touch with The Bronx App team. Report a resource, suggest a feature, or partner with us." },
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline">
          <ArrowLeft className="h-4 w-4" /> {t("contact.home")}
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t("contact.title")}</h1>
        <p className="text-muted-foreground mb-6 inline-flex items-center gap-2">
          <Mail className="h-4 w-4" /> hello@thebronxapp.org
        </p>

        {done ? (
          <div className="rounded-2xl border-2 border-success/40 bg-success/10 p-6 text-center">
            <p className="text-5xl mb-2">✉️</p>
            <p className="font-bold text-lg">{t("contact.doneTitle")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("contact.doneBody")}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <Field label={t("contact.labelName")}><input name="name" required maxLength={100} placeholder={t("contact.placeholderName")} className={inp} /></Field>
            <Field label={t("contact.labelEmail")}><input name="email" type="email" required maxLength={200} placeholder={t("contact.placeholderEmail")} className={inp} /></Field>
            <Field label={t("contact.labelSubject")}><input name="subject" required maxLength={150} placeholder={t("contact.placeholderSubject")} className={inp} /></Field>
            <Field label={t("contact.labelMessage")}><textarea name="message" required rows={6} maxLength={2000} placeholder={t("contact.placeholderMessage")} className={inp} /></Field>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <button type="submit" className="no-min-h w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
              <Send className="h-4 w-4" /> {t("contact.send")}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}

const inp = "w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-medium mb-1 block">{label}</span>{children}</label>;
}
