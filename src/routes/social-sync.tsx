import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { useI18n } from "@/lib/i18n-context";
import { ArrowLeft, Upload, Facebook, Instagram, MessageSquare } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/social-sync")({
  staticData: { sitemap: false },
  // Out of the first version (docs/product-scope.md); hidden, not deleted.
  beforeLoad: () => {
    throw redirect({ to: "/events" });
  },
  component: SocialSyncPage,
});

const PLATFORMS = [
  { id: "fb", label: "Facebook", account: "Bronx Community Board", Icon: Facebook },
  { id: "ig", label: "Instagram", account: "@TheBronxOfficial", Icon: Instagram },
  { id: "x", label: "X (Twitter)", account: "@BronxApp", Icon: MessageSquare },
  {
    id: "sms",
    label: "SMS Emergency Alert",
    account: "Send urgent text to 5,200+ opted-in neighbors",
    Icon: MessageSquare,
  },
];

function SocialSyncPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [zip, setZip] = useState("10451");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    fb: true,
    ig: true,
    x: false,
    sms: false,
  });
  const [success, setSuccess] = useState(false);

  const post = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </button>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-3xl text-foreground">Create New Event</h1>
          <button
            onClick={post}
            className="no-min-h px-5 py-2.5 rounded-lg bg-primary-fill text-primary-fill-foreground font-semibold hover:bg-primary-fill-hover"
          >
            Publish
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Your post will appear with a 'Liaison-verified' badge for Bronx residents.
        </p>

        {success && (
          <div className="mt-4 rounded-2xl bg-success/15 border border-success/30 p-4 text-success font-medium">
            ✓ Your event has been posted to all connected platforms and will be sent to 5,200+
            neighbors in ZIP code {zip}.
          </div>
        )}

        <div className="mt-6 space-y-4">
          <Field label="Event Flyer / Photo">
            <label className="no-min-h flex items-center justify-center gap-2 py-8 rounded-2xl border-2 border-dashed border-border bg-card cursor-pointer hover:bg-secondary">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tap to upload image</span>
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </Field>

          <Field label="Event Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Summer Literacy Fair"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background"
            />
          </Field>

          <Field
            label="Description"
            hint="What's happening? (Multilingual TTS will be auto-generated)"
          >
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Date">
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background"
              />
            </Field>
            <Field label="Target ZIP Code (for Push Alerts)">
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="10451"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background"
              />
            </Field>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
            Social Sync
          </h2>
          <div className="space-y-2">
            {PLATFORMS.map((p) => (
              <label
                key={p.id}
                className="no-min-h flex items-center gap-3 p-4 rounded-2xl border border-border bg-card cursor-pointer hover:bg-secondary"
              >
                <input
                  type="checkbox"
                  checked={!!enabled[p.id]}
                  onChange={(e) => setEnabled((s) => ({ ...s, [p.id]: e.target.checked }))}
                  className="h-5 w-5 accent-primary"
                />
                <p.Icon className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{p.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.account}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          <button className="no-min-h py-4 rounded-2xl border border-border bg-card font-semibold hover:bg-secondary">
            Schedule for Later
          </button>
          <button
            onClick={post}
            className="no-min-h py-4 rounded-2xl bg-primary-fill text-primary-fill-foreground font-bold shadow-md hover:bg-primary-fill-hover"
          >
            Post to All Platforms
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground mb-1 block">{label}</span>
      {hint && <span className="text-xs text-muted-foreground mb-1.5 block">{hint}</span>}
      {children}
    </label>
  );
}
