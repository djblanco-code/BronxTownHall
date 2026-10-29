import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";

// Web Speech API types (not in lib.dom by default)
type SR = { new (): SRInstance };
type SRInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

export function VoiceSearchButton({
  onResult,
  className = "",
}: {
  onResult: (text: string) => void;
  className?: string;
}) {
  const { lang, t } = useI18n();
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SRInstance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    const rec = new Ctor();
    // Map UI language to BCP-47; en-US is most accent-tolerant for Bronx users.
    const langMap: Record<string, string> = {
      en: "en-US",
      es: "es-US",
      fr: "fr-FR",
      bn: "bn-IN",
      ar: "ar-EG",
    };
    rec.lang = langMap[lang] ?? "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript ?? "";
      if (text) onResult(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
    };
  }, [lang, onResult]);

  if (!supported) return null;

  const toggle = () => {
    const rec = recRef.current;
    if (!rec) return;
    if (listening) {
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
      setListening(false);
      return;
    }
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? t("stop") : t("listen")}
      title={listening ? t("stop") : t("listen")}
      className={cn(
        "no-min-h relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition",
        listening
          ? "bg-destructive text-destructive-foreground"
          : "bg-primary-fill text-primary-fill-foreground hover:bg-primary-fill-hover",
        // Callers restyle the idle button; while listening it always reads as "stop".
        className,
        listening && "bg-destructive text-destructive-foreground hover:bg-destructive",
      )}
    >
      {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      {listening && (
        <span className="absolute inset-0 rounded-full bg-destructive/40 animate-ping pointer-events-none" />
      )}
    </button>
  );
}
