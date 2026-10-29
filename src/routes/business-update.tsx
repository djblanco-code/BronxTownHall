import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { useEffect, useState } from "react";
import {
  Business,
  ConnectedAccounts,
  buildShareMessage,
  getCurrentBusiness,
  whatsappShareLink,
} from "@/lib/business";
import { ArrowLeft, Send } from "lucide-react";

export const Route = createFileRoute("/business-update")({
  staticData: { sitemap: false },
  component: UpdatePage,
});

function UpdatePage() {
  const nav = useNavigate();
  const [biz, setBiz] = useState<Business | null>(null);
  const [text, setText] = useState("");
  const [share, setShare] = useState<ConnectedAccounts>({});
  const [result, setResult] = useState<string | null>(null);
  const [waLink, setWaLink] = useState<string | null>(null);

  useEffect(() => {
    const b = getCurrentBusiness();
    if (!b) {
      nav({ to: "/business-login" });
      return;
    }
    if (b.tier !== "premium") {
      nav({ to: "/business-dashboard" });
      return;
    }
    setBiz(b);
  }, [nav]);

  if (!biz) return null;

  const shareUpdate = () => {
    const platforms: string[] = [];
    if (share.facebook && biz.connected.facebook) platforms.push("Facebook");
    if (share.instagram && biz.connected.instagram) platforms.push("Instagram");
    if (share.twitter && biz.connected.twitter) platforms.push("X (Twitter)");
    if (share.whatsapp && biz.connected.whatsapp) {
      setWaLink(
        whatsappShareLink(
          buildShareMessage(biz.name, "Update", text, `https://thebronxapp.example/biz/${biz.id}`),
        ),
      );
      platforms.push("WhatsApp");
    }
    setResult(
      platforms.length
        ? `Update shared to: ${platforms.join(", ")}`
        : "Pick at least one platform to share.",
    );
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button
          onClick={() => nav({ to: "/business-dashboard" })}
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </button>
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
          <Send className="h-6 w-6" /> Post Update
        </h1>
        <p className="text-muted-foreground mb-6">Quick text updates that aren't full events.</p>

        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <label className="block">
            <span className="text-sm font-medium mb-1 block">Update text ({text.length}/280)</span>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              rows={4}
              maxLength={280}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium mb-1 block">Optional image</span>
            <input type="file" accept="image/*" className="text-sm" />
          </label>
          <div className="rounded-lg bg-secondary/40 p-3 space-y-2">
            <p className="font-semibold text-sm">Share to Social Media</p>
            {(
              [
                ["facebook", "Facebook"],
                ["instagram", "Instagram"],
                ["twitter", "X (Twitter)"],
                ["whatsapp", "WhatsApp"],
              ] as const
            ).map(([k, l]) => (
              <label
                key={k}
                className={`flex items-center gap-2 text-sm ${biz.connected[k] ? "" : "opacity-50"}`}
              >
                <input
                  type="checkbox"
                  disabled={!biz.connected[k]}
                  checked={!!share[k]}
                  onChange={(e) => setShare({ ...share, [k]: e.target.checked ? "on" : null })}
                />
                {l}
                {!biz.connected[k] && (
                  <span className="text-xs text-muted-foreground">(not connected)</span>
                )}
              </label>
            ))}
          </div>
          <button
            disabled={!text}
            onClick={shareUpdate}
            className="px-4 py-2 rounded-lg bg-primary-fill text-primary-fill-foreground font-semibold disabled:opacity-50"
          >
            Share Update
          </button>
          {result && (
            <div className="p-3 rounded-lg bg-success/10 text-success text-sm">{result}</div>
          )}
          {waLink && (
            <div className="p-3 rounded-lg border border-border bg-card space-y-2">
              <p className="text-sm font-medium">Copy this link to share on WhatsApp:</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={waLink}
                  className="flex-1 px-2 py-1 rounded border border-border bg-background text-xs"
                />
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(waLink);
                    alert("Copied!");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-success text-success-foreground text-sm font-semibold"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
