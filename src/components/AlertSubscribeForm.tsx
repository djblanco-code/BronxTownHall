import { useState } from "react";
import { Bell, Check, Loader2, Mail, MessageSquare } from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";
import { useProfile, NEED_TO_CATEGORY } from "@/lib/onboarding";
import {
  subscribeToAlerts,
  phoneIssue,
  type AlertChannel,
} from "@/lib/policy-alerts";

export function AlertSubscribeForm({
  defaultCategory,
  onDone,
}: {
  defaultCategory?: string;
  onDone?: () => void;
}) {
  const { t, lang } = useI18n();
  const profile = useProfile();
  const preset = new Set<string>([
    ...(defaultCategory ? [defaultCategory] : []),
    ...profile.userNeeds.map((n) => NEED_TO_CATEGORY[n]),
  ]);
  const [cats, setCats] = useState<string[]>([...preset]);
  const [channel, setChannel] = useState<AlertChannel>("sms");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok">("idle");
  const [err, setErr] = useState("");

  const toggle = (id: string) =>
    setCats((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (cats.length === 0) {
      setErr(t("alertsPickOne"));
      return;
    }
    if (channel === "sms") {
      const issue = phoneIssue(phone);
      if (issue) { setErr(issue); return; }
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErr(t("alertsBadEmail"));
      return;
    }
    setStatus("loading");
    try {
      await subscribeToAlerts({
        channel,
        phone,
        email,
        categories: cats,
        language: lang,
        zip: profile.userZipCode,
      });
      setStatus("ok");
    } catch (e) {
      setStatus("idle");
      setErr(e instanceof Error ? e.message : t("alertsSubErr"));
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 text-center">
        <div className="mx-auto h-10 w-10 rounded-full bg-primary/15 grid place-items-center mb-2">
          <Check className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <p className="font-bold">{t("alertsSubOk")}</p>
        <p className="text-sm text-muted-foreground mt-1">{t("alertsSubOkNote")}</p>
        {onDone && (
          <button onClick={onDone} className="no-min-h mt-3 text-sm text-primary font-semibold hover:underline">
            {t("alertsClose")}
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border-2 border-border bg-card p-4 space-y-3">
      <p className="font-bold inline-flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" aria-hidden /> {t("alertsSubTitle")}
      </p>
      <p className="text-sm text-muted-foreground">{t("alertsSubIntro")}</p>

      <div className="flex gap-2" role="group" aria-label={t("alertsHowLabel")}>
        {([
          { id: "sms" as AlertChannel, label: t("alertsByText"), Icon: MessageSquare },
          { id: "email" as AlertChannel, label: t("alertsByEmail"), Icon: Mail },
        ]).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setChannel(id)}
            aria-pressed={channel === id}
            className={`no-min-h inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-full border-2 transition ${
              channel === id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden /> {label}
          </button>
        ))}
      </div>

      {channel === "sms" ? (
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">{t("alertsPhoneLabel")}</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(718) 555-0123"
            className="mt-1 w-full px-3 py-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary min-h-[48px]"
          />
        </label>
      ) : (
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">{t("alertsEmailLabel")}</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full px-3 py-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary min-h-[48px]"
          />
        </label>
      )}

      <fieldset>
        <legend className="text-xs font-semibold text-muted-foreground mb-2">{t("alertsWhichCats")}</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = cats.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                aria-pressed={active}
                className={`no-min-h text-sm px-3 py-2 rounded-full border-2 transition ${
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"
                }`}
              >
                <span aria-hidden>{c.emoji}</span> {t(c.labelKey)}
              </button>
            );
          })}
        </div>
      </fieldset>

      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-muted-foreground">{t("alertsOptInNote")}</p>
        <button
          type="submit"
          disabled={status === "loading"}
          className="no-min-h inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow hover:opacity-90 disabled:opacity-60 min-h-[48px]"
        >
          {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bell className="h-5 w-5" />}
          {t("alertsSubCta")}
        </button>
      </div>
    </form>
  );
}
