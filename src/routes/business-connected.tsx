import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { useEffect, useState } from "react";
import { Business, ConnectedAccounts, getCurrentBusiness, upsertBusiness } from "@/lib/business";
import { ArrowLeft, Facebook, Instagram, MessageCircle, Twitter } from "lucide-react";

export const Route = createFileRoute("/business-connected")({
  staticData: { sitemap: false }, component: ConnectedPage });

function ConnectedPage() {
  const nav = useNavigate();
  const [biz, setBiz] = useState<Business | null>(null);
  const [waPhone, setWaPhone] = useState("");
  const [waStep, setWaStep] = useState<"idle" | "code" | "done">("idle");
  const [waCode, setWaCode] = useState("");

  useEffect(() => {
    const b = getCurrentBusiness();
    if (!b) { nav({ to: "/business-login" }); return; }
    if (b.tier !== "premium") { alert("Connected Accounts is a Premium feature."); nav({ to: "/business-dashboard" }); return; }
    setBiz(b);
  }, [nav]);

  if (!biz) return null;
  const setConnected = (k: keyof ConnectedAccounts, v: string | null) => {
    const c = { ...biz.connected, [k]: v };
    upsertBusiness({ ...biz, connected: c });
    setBiz({ ...biz, connected: c });
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => nav({ to: "/business-dashboard" })} className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"><ArrowLeft className="h-4 w-4" /> Dashboard</button>
        <h1 className="text-3xl font-bold mb-1">Connected Accounts</h1>
        <p className="text-muted-foreground mb-6">Link platforms so you can Social Sync events and updates with one click.</p>
        <div className="space-y-3">
          <Row icon={<Facebook className="h-5 w-5 text-[#1877f2]" />} label="Facebook" connected={biz.connected.facebook} onConnect={() => setConnected("facebook", "Test Page")} onDisconnect={() => setConnected("facebook", null)} />
          <Row icon={<Instagram className="h-5 w-5 text-[#e1306c]" />} label="Instagram" connected={biz.connected.instagram} onConnect={() => setConnected("instagram", "@testbusiness")} onDisconnect={() => setConnected("instagram", null)} />
          <Row icon={<Twitter className="h-5 w-5 text-[#1da1f2]" />} label="Twitter / X" connected={biz.connected.twitter} onConnect={() => setConnected("twitter", "@testbusiness")} onDisconnect={() => setConnected("twitter", null)} />
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3"><MessageCircle className="h-5 w-5 text-[#25d366]" /><div><p className="font-semibold">WhatsApp</p>{biz.connected.whatsapp && <p className="text-sm text-success">Connected: {biz.connected.whatsapp}</p>}</div></div>
              {biz.connected.whatsapp ? (
                <button onClick={() => { setConnected("whatsapp", null); setWaStep("idle"); }} className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary">Disconnect</button>
              ) : waStep === "idle" ? (
                <button onClick={() => setWaStep("code")} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">Connect</button>
              ) : null}
            </div>
            {!biz.connected.whatsapp && waStep === "code" && (
              <div className="mt-3 space-y-2">
                <input className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="WhatsApp phone number (+1...)" value={waPhone} onChange={(e) => setWaPhone(e.target.value)} />
                <input className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="Enter 6-digit verification code (try 123456)" value={waCode} onChange={(e) => setWaCode(e.target.value)} />
                <button onClick={() => { if (waPhone && waCode.length >= 4) { setConnected("whatsapp", waPhone); setWaStep("done"); } else alert("Enter phone and code"); }} className="px-3 py-1.5 rounded-lg bg-success text-success-foreground text-sm font-semibold">Verify</button>
                <p className="text-xs text-muted-foreground">Prototype: verification code is simulated.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ icon, label, connected, onConnect, onDisconnect }: { icon: React.ReactNode; label: string; connected?: string | null; onConnect: () => void; onDisconnect: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">{icon}<div><p className="font-semibold">{label}</p>{connected && <p className="text-sm text-success">Connected as {connected}</p>}</div></div>
      {connected ? (
        <button onClick={onDisconnect} className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary">Disconnect</button>
      ) : (
        <button onClick={onConnect} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">Connect</button>
      )}
    </div>
  );
}
