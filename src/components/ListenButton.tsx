import { useTts, TtsStyle } from "@/lib/tts-context";
import { Volume2, Square, Loader2 } from "lucide-react";

type Props = {
  text: string;
  title?: string;
  style?: TtsStyle;
  label?: string;
  variant?: "icon" | "chip" | "primary";
  className?: string;
};

/** Reusable Listen button — pairs with the persistent TtsPlayer. */
export function ListenButton({
  text,
  title,
  style,
  label = "Listen",
  variant = "icon",
  className = "",
}: Props) {
  const { speak, stop, isPlaying, isLoading, nowPlaying } = useTts();
  const active = (isPlaying || isLoading) && nowPlaying === (title ?? text.slice(0, 80));

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (active) {
      stop();
    } else {
      void speak(text, { title, style });
    }
  };

  const aria = active ? "Stop listening" : label;

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={aria}
        title={aria}
        className={`no-min-h h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-md bg-bronx-orange text-bronx-orange-foreground hover:brightness-95 transition ${className}`}
      >
        {isLoading && active ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : active ? (
          <Square className="h-4 w-4" fill="currentColor" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </button>
    );
  }
  if (variant === "chip") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={aria}
        className={`no-min-h inline-flex min-h-[44px] items-center gap-1.5 px-3 rounded-md text-sm font-bold bg-bronx-orange text-bronx-orange-foreground hover:brightness-95 transition ${className}`}
      >
        {isLoading && active ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : active ? (
          <Square className="h-3.5 w-3.5" fill="currentColor" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" />
        )}
        {active ? "Stop" : label}
      </button>
    );
  }
  // primary
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      className={`no-min-h inline-flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-bronx-orange text-bronx-orange-foreground font-bold hover:brightness-95 transition min-h-[48px] ${className}`}
    >
      {isLoading && active ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : active ? (
        <Square className="h-5 w-5" fill="currentColor" />
      ) : (
        <Volume2 className="h-5 w-5" />
      )}
      {active ? "Stop" : label}
    </button>
  );
}
