import { useRef, useState } from "react";
import { Play, Download } from "lucide-react";

const SRC = "/demo/bronx-demo-90s.mp4";
const POSTER = "/demo/demo-poster.jpg";

const chapters = [
  { t: 7, label: "Home" },
  { t: 18, label: "Search" },
  { t: 29, label: "Resource detail" },
  { t: 41, label: "Call · Directions · Share · Report" },
  { t: 52, label: "Map & transit" },
  { t: 62, label: "Civic" },
  { t: 72, label: "Crisis" },
  { t: 80, label: "Events" },
];

export function DemoVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const play = () => {
    setStarted(true);
    void ref.current?.play();
  };

  const seek = (t: number) => {
    if (!ref.current) return;
    ref.current.currentTime = t;
    setStarted(true);
    void ref.current.play();
  };

  return (
    <section aria-labelledby="demo-video-heading" className="space-y-4">
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
          90-second walkthrough
        </div>
        <h2 id="demo-video-heading" className="text-3xl font-bold">
          Watch the product, no clicking required
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Home → search → resource detail → call, directions, share, report → map, civic, crisis,
          events. Recorded from the live prototype.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border-2 border-border bg-black shadow-lg">
        <video
          ref={ref}
          className="w-full aspect-video block"
          src={SRC}
          poster={POSTER}
          controls={started}
          playsInline
          preload="metadata"
          onPlay={() => setStarted(true)}
        >
          <track kind="captions" label="No dialogue — on-screen captions only" />
        </video>

        {!started && (
          <button
            type="button"
            onClick={play}
            aria-label="Play the 90-second demo video"
            className="absolute inset-0 grid place-items-center bg-black/35 hover:bg-black/25 focus-visible:bg-black/25"
          >
            <span className="grid place-items-center h-20 w-20 rounded-full bg-destructive text-destructive-foreground shadow-2xl ring-4 ring-white/30">
              <Play className="h-9 w-9 translate-x-0.5" fill="currentColor" />
            </span>
            <span className="absolute bottom-4 left-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white">
              1:30 · no sound needed
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {chapters.map((c) => (
          <button
            key={c.t}
            type="button"
            onClick={() => seek(c.t)}
            className="no-min-h rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted"
          >
            {c.label}
          </button>
        ))}
        <a
          href={SRC}
          download
          className="no-min-h inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted"
        >
          <Download className="h-3.5 w-3.5" /> Download MP4
        </a>
      </div>
    </section>
  );
}
