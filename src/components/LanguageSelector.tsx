import { useI18n } from "@/lib/i18n-context";
import { LANGS, Lang } from "@/lib/i18n";
import { Globe, Volume2 } from "lucide-react";

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  const showAudioNote = lang === "bn" || lang === "ar";
  return (
    <div className="flex flex-col gap-1">
      <div className={`flex items-center gap-2 ${compact ? "" : "flex-wrap"}`}>
        <Globe className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden />
        <label className="sr-only">{t("chooseLanguage")}</label>
        <div className="flex flex-wrap gap-1.5">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code as Lang)}
              className={`no-min-h inline-flex min-h-11 items-center rounded-md border px-3 text-sm font-semibold transition-colors ${
                lang === l.code
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-secondary"
              }`}
              aria-pressed={lang === l.code}
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>
      {showAudioNote && (
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground sm:justify-end">
          <Volume2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {t("interface.audioSoon")}
        </p>
      )}
    </div>
  );
}
