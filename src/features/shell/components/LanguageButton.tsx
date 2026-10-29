import { useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { LANGS } from "@/lib/i18n";
import { BottomSheet, BottomSheetContent, BottomSheetTrigger } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";

/**
 * One compact control in the top bar instead of a row of five language chips.
 * The current language shows in its own script so a reader can always find
 * their way back; the sheet lists every language in its own script too.
 */
export function LanguageButton() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <BottomSheet open={open} onOpenChange={setOpen}>
      <BottomSheetTrigger asChild>
        <button
          type="button"
          aria-label={`${t("chooseLanguage")} — ${current.native}`}
          className="no-min-h simplified-exempt inline-flex h-10 items-center gap-1.5 rounded-md border border-foreground px-3 text-sm font-bold text-foreground hover:bg-foreground hover:text-background"
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          <span lang={current.code}>{current.native}</span>
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </BottomSheetTrigger>
      <BottomSheetContent title={t("chooseLanguage")} closeLabel={t("shell.close")}>
        <ul className="flex flex-col gap-1">
          {LANGS.map((l) => {
            const selected = l.code === lang;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                  className={cn(
                    "no-min-h simplified-exempt flex min-h-14 w-full items-center gap-3 rounded-xl px-3 text-start transition-colors",
                    selected ? "bg-primary/10" : "hover:bg-secondary",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span lang={l.code} className="block text-base font-semibold">
                      {l.native}
                    </span>
                    {l.label !== l.native && (
                      <span className="block text-xs text-muted-foreground">{l.label}</span>
                    )}
                  </span>
                  {selected && (
                    <Check className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        {(lang === "bn" || lang === "ar") && (
          <p className="mt-3 text-xs text-muted-foreground">{t("interface.audioSoon")}</p>
        )}
      </BottomSheetContent>
    </BottomSheet>
  );
}
