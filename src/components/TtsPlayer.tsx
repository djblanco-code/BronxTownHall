import { useTts, TTS_VOICES } from "@/lib/tts-context";
import { Play, Pause, Square, X, Loader2, Volume2 } from "lucide-react";
import { useDockHeight } from "@/hooks/use-dock-height";

function fmt(sec: number): string {
  if (!isFinite(sec) || sec <= 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function TtsPlayer() {
  const {
    playerVisible,
    isPlaying,
    isLoading,
    nowPlaying,
    currentTime,
    duration,
    voice,
    setVoice,
    speed,
    setSpeed,
    pause,
    resume,
    stop,
    seek,
    hidePlayer,
  } = useTts();
  const dockRef = useDockHeight();

  if (!playerVisible) return null;

  return (
    <div
      ref={dockRef}
      role="region"
      aria-label="Text to speech player"
      className="print-hide fixed app-dock-bottom inset-x-0 z-[60] border-t border-border bg-card/95 backdrop-blur shadow-[0_-8px_24px_rgba(0,0,0,0.08)]"
    >
      <div className="max-w-3xl mx-auto px-3 py-2.5 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-primary shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold leading-none">
              Now listening
            </p>
            <p className="text-sm font-medium truncate">{nowPlaying || "—"}</p>
          </div>
          <button
            onClick={hidePlayer}
            aria-label="Close player"
            className="no-min-h h-8 w-8 rounded-full grid place-items-center hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <button
              disabled
              aria-label="Loading audio"
              className="no-min-h h-10 w-10 rounded-full grid place-items-center bg-primary text-primary-foreground opacity-80"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
            </button>
          ) : isPlaying ? (
            <button
              onClick={pause}
              aria-label="Pause"
              className="no-min-h h-10 w-10 rounded-full grid place-items-center bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Pause className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={resume}
              aria-label="Play"
              className="no-min-h h-10 w-10 rounded-full grid place-items-center bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Play className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={stop}
            aria-label="Stop"
            className="no-min-h h-10 w-10 rounded-full grid place-items-center bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            <Square className="h-4 w-4" fill="currentColor" />
          </button>

          <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">
            {fmt(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(duration, 0.01)}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(e) => seek(parseFloat(e.target.value))}
            disabled={!duration}
            aria-label="Scrub position"
            className="flex-1 accent-primary h-1"
          />
          <span className="text-xs tabular-nums text-muted-foreground w-10">{fmt(duration)}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs text-muted-foreground flex items-center gap-1.5">
            Speed
            <select
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="rounded-md border border-border bg-background text-xs px-2 py-1"
              aria-label="Playback speed"
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                <option key={s} value={s}>
                  {s}x
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0">
            Voice
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="rounded-md border border-border bg-background text-xs px-2 py-1 max-w-[200px]"
              aria-label="Voice"
            >
              {TTS_VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
