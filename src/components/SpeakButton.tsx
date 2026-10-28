import { useTts } from "@/lib/tts-context";
import { Volume2, Square, Loader2 } from "lucide-react";

/**
 * Legacy wrapper kept for compatibility — now uses the natural Lovable AI TTS
 * via the global TtsProvider + persistent TtsPlayer.
 */
export function SpeakButton({ text, large = false, label, title }: { text: string; large?: boolean; label?: string; title?: string }) {
  const { speak, stop, isPlaying, isLoading, nowPlaying } = useTts();
  const active = (isPlaying || isLoading) && nowPlaying === (title ?? text.slice(0, 80));

  const sizeCls = large ? "h-20 w-20 text-3xl" : "h-11 w-11 text-base";
  const iconCls = large ? "h-10 w-10" : "h-5 w-5";

  const aria = active ? "Stop" : (label ?? "Listen");

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (active) stop();
        else void speak(text, { title });
      }}
      className={`no-min-h ${sizeCls} inline-flex items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md hover:scale-105 active:scale-95 transition`}
      aria-label={aria}
      title={aria}
    >
      {isLoading && active ? <Loader2 className={iconCls + " animate-spin"} /> :
       active ? <Square className={iconCls} fill="currentColor" /> :
       <Volume2 className={iconCls} />}
    </button>
  );
}
