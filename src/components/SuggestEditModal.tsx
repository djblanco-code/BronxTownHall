import { useState, useId } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { submitSuggestion } from "@/lib/suggestions";
import { A11yDialog } from "./A11yDialog";
import { useI18n } from "@/lib/i18n-context";

export function SuggestEditModal({
  onClose,
  resourceId,
  resourceName,
  mode,
  defaultCategory = "",
}: {
  onClose: () => void;
  resourceId?: string;
  resourceName?: string;
  mode: "edit" | "new";
  defaultCategory?: string;
}) {
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState({
    name: resourceName ?? "",
    address: "",
    phone: "",
    category: defaultCategory,
    description: "",
    note: "",
  });
  const descId = useId();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await submitSuggestion({ kind: mode, resourceId, fields });
      setSubmitted(true);
      setTimeout(onClose, 1500);
    } catch {
      // Say so instead of thanking them for something that wasn't saved.
      toast.error(t("saved.error"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <A11yDialog
      open
      onClose={onClose}
      title={mode === "edit" ? t("interface.suggestEdit") : t("interface.suggestResource")}
    >
      {submitted ? (
        <div role="status" aria-live="polite" className="py-8 text-center space-y-2">
          <CheckCircle2 className="h-10 w-10 mx-auto text-success" aria-hidden="true" />
          <p className="font-semibold">{t("interface.thankYouReview")}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <Field
            label={t("interface.name")}
            value={fields.name}
            onChange={(v) => setFields({ ...fields, name: v })}
            required
          />
          <Field
            label={t("interface.address")}
            value={fields.address}
            onChange={(v) => setFields({ ...fields, address: v })}
          />
          <Field
            label={t("interface.phone")}
            value={fields.phone}
            onChange={(v) => setFields({ ...fields, phone: v })}
          />
          {mode === "new" && (
            <Field
              label={t("interface.category")}
              value={fields.category}
              onChange={(v) => setFields({ ...fields, category: v })}
            />
          )}
          <div>
            <label htmlFor={descId} className="text-sm font-medium mb-1 block">
              {mode === "edit" ? t("interface.suggestEdit") : t("interface.description")}
            </label>
            <textarea
              id={descId}
              required
              value={fields.note || fields.description}
              onChange={(e) =>
                mode === "edit"
                  ? setFields({ ...fields, note: e.target.value })
                  : setFields({ ...fields, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="no-min-h w-full disabled:opacity-60 inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-primary-fill text-primary-fill-foreground font-semibold min-h-[44px]"
          >
            <Send className="h-4 w-4" aria-hidden="true" /> {t("interface.submit")}
          </button>
        </form>
      )}
    </A11yDialog>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium mb-1 block">
        {label}
      </label>
      <input
        id={id}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[44px]"
      />
    </div>
  );
}
