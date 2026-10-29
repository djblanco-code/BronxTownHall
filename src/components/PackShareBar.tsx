import { useState } from "react";
import { MessageSquare, Link2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePack, generateShortLink } from "@/lib/pack";
import { RESOURCES } from "@/lib/data";
import { trackResourceShared } from "@/lib/track-resource";
import { useDockHeight } from "@/hooks/use-dock-height";

export function PackShareBar() {
  const { ids, count, clear } = usePack();
  const [busy, setBusy] = useState<null | "sms" | "whatsapp" | "copy">(null);
  const dockRef = useDockHeight();

  if (count === 0) return null;

  async function share(kind: "sms" | "whatsapp" | "copy") {
    setBusy(kind);
    try {
      const link = await generateShortLink(ids);
      const message = `Check out these Bronx resources I found: ${link}`;
      ids.forEach((id) => {
        const r = RESOURCES.find((x) => x.id === id);
        trackResourceShared({ resourceId: id, category: r?.category, method: kind });
      });
      if (kind === "sms") {
        window.location.href = `sms:?&body=${encodeURIComponent(message)}`;
      } else if (kind === "whatsapp") {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
      } else {
        await navigator.clipboard.writeText(link);
        toast.success("Link copied");
      }
    } catch {
      toast.error("Could not create the share link. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div ref={dockRef} className="fixed inset-x-0 app-dock-bottom z-40 px-3">
      <div className="mx-auto mb-3 max-w-2xl rounded-2xl border border-border bg-card shadow-lg p-3 flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">
            {count} resource{count === 1 ? "" : "s"} selected
          </p>
          <p className="text-xs text-muted-foreground truncate">
            Share this pack with someone who needs it
          </p>
        </div>
        <button
          type="button"
          onClick={() => share("sms")}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary-fill px-3 py-2 text-sm font-bold text-primary-fill-foreground disabled:opacity-60"
        >
          {busy === "sms" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
          )}
          Share via SMS
        </button>
        <button
          type="button"
          onClick={() => share("copy")}
          disabled={busy !== null}
          aria-label="Copy share link"
          className="rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground disabled:opacity-60"
        >
          {busy === "copy" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Link2 className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={clear}
          aria-label="Clear selected resources"
          className="rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
