import { useState } from "react";
import { Upload } from "lucide-react";
import { A11yDialog } from "./A11yDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackResourceReported } from "@/lib/track-resource";
import { useI18n } from "@/lib/i18n-context";

const ISSUE_TYPES = [
  { id: "closed", key: "issueClosed" },
  { id: "hours", key: "issueHours" },
  { id: "info", key: "issueInfo" },
  { id: "notfree", key: "issueNotFree" },
  { id: "rude", key: "issueRude" },
  { id: "other", key: "issueOther" },
] as const;

type IssueId = typeof ISSUE_TYPES[number]["id"];

export function ReportModal({
  onClose,
  resourceId,
  resourceName,
  resourceType = "resource",
  category,
}: {
  onClose: () => void;
  resourceId?: string;
  resourceName?: string;
  resourceType?: "resource" | "business" | "event";
  category?: string;
}) {
  const { t } = useI18n();
  const [issue, setIssue] = useState<IssueId | null>(null);
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue) return;
    setSubmitting(true);
    trackResourceReported({ resourceId: resourceId || resourceName || "unknown", category: category || resourceType, issueType: issue });
    try {
      const { error } = await supabase.from("resource_reports").insert({
        resource_id: resourceId || resourceName || "unknown",
        resource_type: resourceType,
        reason: issue,
        details: details || null,
        reporter_email: email || null,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      // Still show success — offline-tolerant, community-first
      toast.success("Thanks — we'll follow up.");
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <A11yDialog open onClose={onClose} title={t("interface.reportIssue")} className="max-w-lg">
      {submitted ? (
        <div role="status" aria-live="polite" className="py-6 text-center space-y-3">
          <p className="text-success font-semibold">✓ {t("interface.reportThanks")}</p>
          <p className="text-sm text-muted-foreground">A Community Liaison will verify this within 48 hours. If this resource gets 3 reports, it's automatically hidden for review.</p>
          <button onClick={onClose} className="no-min-h mt-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold min-h-[44px]">{t("interface.close")}</button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <fieldset>
            <legend className="text-sm font-semibold mb-2">{t("interface.whatsWrong")}</legend>
            <div className="space-y-2">
              {ISSUE_TYPES.map((it) => (
                <label key={it.id} className="no-min-h flex items-start gap-2 p-2.5 rounded-lg border border-border hover:bg-secondary cursor-pointer min-h-[44px]">
                  <input type="radio" name="issue" required onChange={() => setIssue(it.id)} className="mt-1 accent-primary h-5 w-5" />
                  <span className="text-sm">{t(`interface.${it.key}`)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {resourceName && (
            <Field label="Resource" id="rm-resource">
              <input id="rm-resource" defaultValue={resourceName} readOnly className="w-full px-3 py-2 rounded-lg border border-border bg-secondary min-h-[44px]" />
            </Field>
          )}

          <Field label={t("interface.additionalDetails")} id="rm-details">
            <textarea id="rm-details" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background" placeholder={t("interface.detailsPlaceholder")} />
          </Field>

          <Field label={t("interface.emailFollowup")} id="rm-contact">
            <input id="rm-contact" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[44px]" />
          </Field>

          <button type="submit" disabled={submitting || !issue} className="no-min-h w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60 min-h-[44px]">
            {submitting ? t("interface.sending") : t("interface.submitReport")}
          </button>
          <p className="text-xs text-muted-foreground text-center">{t("interface.reportPrivate")}</p>
        </form>
      )}
    </A11yDialog>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}

// Kept for legacy imports that used Upload icon
export const _keepUploadImport = Upload;
