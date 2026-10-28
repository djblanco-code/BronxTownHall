import { useI18n } from "@/lib/i18n-context";
import { LANGS, Lang } from "@/lib/i18n";
import { Globe } from "lucide-react";

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
              className={`no-min-h px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                lang === l.code
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:bg-secondary"
              }`}
              aria-pressed={lang === l.code}
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>
      {showAudioNote && (
        <p className="text-[11px] text-muted-foreground sm:text-end">
          🔊 {t("interface.audioSoon")}
        </p>
      )}
    </div>
  );
}
