// Lightweight SVG bubble map of visitor distribution across Bronx ZIP codes.
// No map tiles or API calls — plots approximate ZIP centroids.
import { ZIP_LATLNG } from "@/lib/zip-distance";

export type ZipCount = { zip: string; count: number };

const W = 520;
const H = 420;
const PAD = 28;

export function UserZipMap({ data }: { data: ZipCount[] }) {
  const points = data.filter((d) => ZIP_LATLNG[d.zip]);
  if (points.length === 0) {
    return <p className="text-sm text-muted-foreground">No ZIP-level data yet.</p>;
  }

  const lats = Object.values(ZIP_LATLNG).map((c) => c[0]);
  const lngs = Object.values(ZIP_LATLNG).map((c) => c[1]);
  const minLat = Math.min(...lats),
    maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs),
    maxLng = Math.max(...lngs);
  const max = Math.max(...points.map((p) => p.count));

  const project = (lat: number, lng: number) => ({
    x: PAD + ((lng - minLng) / (maxLng - minLng || 1)) * (W - PAD * 2),
    y: PAD + ((maxLat - lat) / (maxLat - minLat || 1)) * (H - PAD * 2),
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto rounded-xl bg-secondary/40"
      role="img"
      aria-label="Map of visitor distribution across Bronx ZIP codes"
    >
      {Object.entries(ZIP_LATLNG).map(([zip, c]) => {
        const { x, y } = project(c[0], c[1]);
        return (
          <circle key={`bg-${zip}`} cx={x} cy={y} r={2} className="fill-muted-foreground/30" />
        );
      })}
      {points
        .slice()
        .sort((a, b) => b.count - a.count)
        .map((p) => {
          const c = ZIP_LATLNG[p.zip]!;
          const { x, y } = project(c[0], c[1]);
          const r = 6 + Math.sqrt(p.count / max) * 26;
          return (
            <g key={p.zip}>
              <title>{`${p.zip}: ${p.count} visitors`}</title>
              <circle
                cx={x}
                cy={y}
                r={r}
                className="fill-primary/25 stroke-primary"
                strokeWidth={1.5}
              />
              <text
                x={x}
                y={y + 3}
                textAnchor="middle"
                className="fill-foreground text-[9px] font-semibold"
              >
                {p.zip}
              </text>
            </g>
          );
        })}
    </svg>
  );
}
