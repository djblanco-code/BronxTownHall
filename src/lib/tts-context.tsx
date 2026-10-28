import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";

export type TtsVoice = {
  id: string;
  label: string;
  gender: "female" | "male" | "neutral";
  description: string;
};

export const TTS_VOICES: TtsVoice[] = [
  { id: "alloy",   label: "Alloy (Neutral, balanced)", gender: "neutral", description: "Versatile, friendly default" },
  { id: "coral",   label: "Coral (Warm female)",       gender: "female",  description: "Warm and reassuring" },
  { id: "shimmer", label: "Shimmer (Bright female)",   gender: "female",  description: "Bright and upbeat" },
  { id: "sage",    label: "Sage (Calm female)",        gender: "female",  description: "Calm and thoughtful" },
  { id: "ash",     label: "Ash (Soft male)",           gender: "male",    description: "Soft, conversational" },
  { id: "echo",    label: "Echo (Clear male)",         gender: "male",    description: "Clear newsreader tone" },
  { id: "verse",   label: "Verse (Expressive male)",   gender: "male",    description: "Warm and expressive" },
];

export type TtsStyle = "calm" | "empathetic" | "cheerful" | "directions";

type SpeakOptions = {
  title?: string;     // shown in player as "Now playing"
  style?: TtsStyle;
};

type Ctx = {
  voice: string;
  setVoice: (v: string) => void;
  speed: number;
  setSpeed: (s: number) => void;
  isPlaying: boolean;
  isLoading: boolean;
  nowPlaying: string;
  progress: number;     // 0..1
  duration: number;     // seconds
  currentTime: number;  // seconds
  speak: (text: string, opts?: SpeakOptions) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (sec: number) => void;
  hidePlayer: () => void;
  playerVisible: boolean;
};

const TtsCtx = createContext<Ctx | null>(null);

const LS_VOICE = "bx-tts-voice";
const LS_SPEED = "bx-tts-speed";

export function TtsProvider({ children }: { children: ReactNode }) {
  const [voice, setVoiceState] = useState<string>("alloy");
  const [speed, setSpeedState] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nowPlaying, setNowPlaying] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerVisible, setPlayerVisible] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fallbackRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Restore prefs
  useEffect(() => {
    try {
      const v = localStorage.getItem(LS_VOICE);
      if (v) setVoiceState(v);
      const s = localStorage.getItem(LS_SPEED);
      if (s) setSpeedState(Math.min(Math.max(parseFloat(s) || 1, 0.5), 2));
    } catch { /* ignore */ }
  }, []);

  const setVoice = useCallback((v: string) => {
    setVoiceState(v);
    try { localStorage.setItem(LS_VOICE, v); } catch { /* ignore */ }
  }, []);
  const setSpeed = useCallback((s: number) => {
    const clamped = Math.min(Math.max(s, 0.5), 2);
    setSpeedState(clamped);
    try { localStorage.setItem(LS_SPEED, String(clamped)); } catch { /* ignore */ }
    if (audioRef.current) audioRef.current.playbackRate = clamped;
  }, []);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stopFallback = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    fallbackRef.current = null;
  }, []);

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    cleanupAudio();
    stopFallback();
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentTime(0);
    setDuration(0);
  }, [cleanupAudio, stopFallback]);

  const hidePlayer = useCallback(() => {
    stop();
    setPlayerVisible(false);
    setNowPlaying("");
  }, [stop]);

  const playWithFallback = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsPlaying(false);
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = Math.min(Math.max(speed, 0.5), 2);
    u.pitch = 1.0;
    u.onend = () => { setIsPlaying(false); fallbackRef.current = null; };
    u.onerror = () => { setIsPlaying(false); fallbackRef.current = null; };
    fallbackRef.current = u;
    setIsPlaying(true);
    synth.speak(u);
  }, [speed]);

  const speak = useCallback(async (text: string, opts?: SpeakOptions) => {
    const clean = text.trim();
    if (!clean) return;
    stop();
    setNowPlaying(opts?.title ?? clean.slice(0, 80));
    setPlayerVisible(true);
    setIsLoading(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/tts/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: clean.slice(0, 4000),
          voice,
          speed,
          style: opts?.style ?? "calm",
        }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`TTS server returned ${res.status}`);
      const blob = await res.blob();
      if (ctrl.signal.aborted) return;
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audio.playbackRate = speed;
      audioRef.current = audio;

      audio.addEventListener("loadedmetadata", () => {
        setDuration(isFinite(audio.duration) ? audio.duration : 0);
      });
      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
      });
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
      audio.addEventListener("error", () => {
        setIsPlaying(false);
        setIsLoading(false);
        // Fall back to browser TTS on playback error
        playWithFallback(clean);
      });

      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      console.warn("TTS server failed, using browser fallback", err);
      playWithFallback(clean);
    } finally {
      setIsLoading(false);
    }
  }, [voice, speed, stop, playWithFallback]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (typeof window !== "undefined" && window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    }
  }, []);
  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused && audioRef.current.src) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => undefined);
    } else if (typeof window !== "undefined" && window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    }
  }, []);
  const seek = useCallback((sec: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(sec, audioRef.current.duration || sec));
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { stop(); }, [stop]);

  const value = useMemo<Ctx>(() => ({
    voice, setVoice, speed, setSpeed,
    isPlaying, isLoading, nowPlaying,
    progress: duration > 0 ? currentTime / duration : 0,
    duration, currentTime,
    speak, pause, resume, stop, seek,
    hidePlayer, playerVisible,
  }), [voice, setVoice, speed, setSpeed, isPlaying, isLoading, nowPlaying, currentTime, duration, speak, pause, resume, stop, seek, hidePlayer, playerVisible]);

  return <TtsCtx.Provider value={value}>{children}</TtsCtx.Provider>;
}

export function useTts() {
  const ctx = useContext(TtsCtx);
  if (!ctx) throw new Error("useTts must be used inside TtsProvider");
  return ctx;
}

/** Build a natural, sectioned script for a resource. */
export function buildResourceScript(r: {
  name: string;
  address?: string;
  phone?: string;
  hours?: string;
  distance?: number;
  notes?: string;
  description?: string;
}): string {
  const parts: string[] = [];
  parts.push(`${r.name}.`);
  if (r.distance != null) parts.push(`About ${r.distance} miles away.`);
  if (r.address) parts.push(`Address: ${r.address}.`);
  if (r.phone) parts.push(`Phone: ${spellPhone(r.phone)}.`);
  if (r.hours) parts.push(`Hours: ${r.hours}.`);
  if (r.notes) parts.push(`${r.notes}.`);
  if (r.description) parts.push(r.description);
  return parts.join(" ");
}

/** Insert spaces between digits so TTS reads them clearly. */
export function spellPhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  // Format like (XXX) XXX-XXXX commas to encourage pauses
  const m = digits.match(/^\+?1?(\d{3})(\d{3})(\d{4})$/);
  if (m) return `${m[1]}, ${m[2]}, ${m[3]}`;
  return digits.split("").join(" ");
}
