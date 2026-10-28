import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Lang, LANGS, T } from "./i18n";
import { translate } from "@/i18n";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string, vars?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
  speak: (text: string) => void;
  stop: () => void;
  speaking: boolean;
};

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("bx-lang") as Lang | null;
    if (stored && T[stored]) {
      setLangState(stored);
      return;
    }
    // First load: auto-detect from browser language
    const candidates = [
      ...(navigator.languages ?? []),
      navigator.language ?? "",
    ];
    for (const c of candidates) {
      const code = c.split("-")[0]?.toLowerCase() as Lang;
      if (code && T[code]) {
        setLangState(code);
        localStorage.setItem("bx-lang", code);
        return;
      }
    }
    setLangState("en");
  }, []);


  useEffect(() => {
    const meta = LANGS.find((l) => l.code === lang)!;
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = meta.dir;
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("bx-lang", l);
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const t = useCallback(
    (k: string, vars?: Record<string, string | number>) =>
      translate(lang, k, vars) ??
      (T[lang] as Record<string, string>)[k] ??
      (T.en as Record<string, string>)[k] ??
      k,
    [lang],
  );

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Sorry, your browser does not support text-to-speech.");
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const meta = LANGS.find((l) => l.code === lang)!;

    const doSpeak = (voices: SpeechSynthesisVoice[]) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = meta.bcp47;
      u.rate = 0.95;
      u.pitch = 1.05;
      const match =
        voices.find((v) => v.lang.toLowerCase().startsWith(meta.bcp47.toLowerCase())) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(lang));
      if (match) u.voice = match;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      synth.speak(u);
    };

    const voices = synth.getVoices();
    if (voices.length === 0) {
      const handler = () => {
        synth.removeEventListener("voiceschanged", handler);
        doSpeak(synth.getVoices());
      };
      synth.addEventListener("voiceschanged", handler);
      setTimeout(() => {
        if (!synth.speaking) doSpeak(synth.getVoices());
      }, 400);
    } else {
      doSpeak(voices);
    }
  }, [lang]);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const dir = LANGS.find((l) => l.code === lang)?.dir ?? "ltr";

  return <I18nCtx.Provider value={{ lang, setLang, t, dir, speak, stop, speaking }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
