import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "@tanstack/react-router";
import { ListPlus, MessageSquare, Printer, ClipboardCheck } from "lucide-react";
import { fetchMyLists, addToList, createList, type List } from "@/lib/cloud-lists";
import { logReferral } from "@/lib/cloud-pro";
import { SHOW_CASEWORKER_TOOLS } from "@/lib/first-version";
import { toast } from "sonner";
import { trackResourceShared } from "@/lib/track-resource";
import { useI18n } from "@/lib/i18n-context";

export function ResourceActions({
  resourceId,
  resourceName,
  address,
  phone,
  category,
}: {
  resourceId: string;
  resourceName: string;
  address: string;
  phone: string;
  category?: string;
}) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [showLists, setShowLists] = useState(false);
  const [lists, setLists] = useState<List[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [clientLabel, setClientLabel] = useState("");
  const [referralNote, setReferralNote] = useState("");

  useEffect(() => {
    if (showLists && user)
      fetchMyLists()
        .then(setLists)
        .catch(() => {});
  }, [showLists, user]);

  const smsBody = `Check out this resource I found: ${resourceName} at ${address}. Call them at ${phone}.${typeof window !== "undefined" ? " More info: " + window.location.href : ""}`;
  const smsHref = `sms:?&body=${encodeURIComponent(smsBody)}`;

  const handleAddToList = async (listId: string) => {
    setLoading(true);
    try {
      await addToList(listId, resourceId);
      toast.success("Added to list");
      setShowLists(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const list = await createList({ name: newName.trim() });
      await addToList(list.id, resourceId);
      toast.success(`Created "${list.name}" and added resource`);
      setShowLists(false);
      setNewName("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogReferral = async () => {
    setLoading(true);
    try {
      await logReferral({
        resource_id: resourceId,
        client_label: clientLabel || undefined,
        note: referralNote || undefined,
      });
      toast.success("Referral logged");
      setShowReferral(false);
      setClientLabel("");
      setReferralNote("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="print-hide">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => (user ? setShowLists(true) : toast.info("Sign in to save to a list"))}
          className="no-min-h inline-flex items-center justify-center gap-1.5 py-3 rounded-md border border-border bg-card text-sm font-semibold hover:border-foreground min-h-[44px]"
        >
          <ListPlus className="h-4 w-4" /> {t("interface.addList")}
        </button>
        <a
          href={smsHref}
          onClick={() => trackResourceShared({ resourceId, category, method: "sms" })}
          className="no-min-h inline-flex items-center justify-center gap-1.5 py-3 rounded-md border border-border bg-card text-sm font-semibold hover:border-foreground min-h-[44px]"
        >
          <MessageSquare className="h-4 w-4" /> {t("interface.shareSms")}
        </a>
        <button
          onClick={() => {
            trackResourceShared({ resourceId, category, method: "print" });
            if (typeof window !== "undefined") window.print();
          }}
          className="no-min-h inline-flex items-center justify-center gap-1.5 py-3 rounded-md border border-border bg-card text-sm font-semibold hover:border-foreground min-h-[44px]"
        >
          <Printer className="h-4 w-4" /> {t("interface.print")}
        </button>
        {SHOW_CASEWORKER_TOOLS && (
          <button
            onClick={() =>
              user
                ? setShowReferral(true)
                : toast.info("Sign in as a professional to log referrals")
            }
            className="no-min-h inline-flex items-center justify-center gap-1.5 py-3 rounded-md border border-border bg-card text-sm font-semibold hover:border-foreground min-h-[44px]"
          >
            <ClipboardCheck className="h-4 w-4" /> {t("interface.logReferral")}
          </button>
        )}
      </div>

      {showLists && (
        <div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setShowLists(false)}
        >
          <div
            className="bg-card rounded-md border border-border shadow-xl w-full max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg mb-3">Add to a list</h3>
            {lists.length === 0 ? (
              <p className="text-sm text-muted-foreground mb-3">You don't have any lists yet.</p>
            ) : (
              <ul className="space-y-1 mb-4 max-h-60 overflow-auto">
                {lists.map((l) => (
                  <li key={l.id}>
                    <button
                      disabled={loading}
                      onClick={() => handleAddToList(l.id)}
                      className="no-min-h w-full text-left px-3 py-2 rounded-md hover:bg-secondary"
                    >
                      {l.name}{" "}
                      {l.is_public && (
                        <span className="text-xs text-muted-foreground">· public</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New list name"
                className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm"
              />
              <button
                disabled={loading || !newName.trim()}
                onClick={handleCreateList}
                className="no-min-h px-4 py-2 rounded-md bg-primary-fill text-primary-fill-foreground text-sm font-semibold disabled:opacity-50"
              >
                Create
              </button>
            </div>
            <div className="mt-4 text-right">
              <Link to="/lists" className="text-sm text-primary underline">
                Manage all lists →
              </Link>
            </div>
          </div>
        </div>
      )}

      {showReferral && (
        <div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setShowReferral(false)}
        >
          <div
            className="bg-card rounded-md border border-border shadow-xl w-full max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg mb-1">Log a client referral</h3>
            <p className="text-xs text-muted-foreground mb-3">
              For caseworkers tracking client outcomes. Client label is optional and stays private.
            </p>
            <label className="block text-sm font-medium mb-1">Client label (optional)</label>
            <input
              value={clientLabel}
              onChange={(e) => setClientLabel(e.target.value)}
              placeholder="e.g. Case #1234"
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm mb-3"
            />
            <label className="block text-sm font-medium mb-1">Note</label>
            <textarea
              value={referralNote}
              onChange={(e) => setReferralNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm mb-3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReferral(false)}
                className="no-min-h px-3 py-2 rounded-md border border-border text-sm"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleLogReferral}
                className="no-min-h px-4 py-2 rounded-md bg-primary-fill text-primary-fill-foreground text-sm font-semibold disabled:opacity-50"
              >
                Log referral
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
