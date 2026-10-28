import { trackCallClicked } from "@/lib/track-resource";
import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { CATEGORY_PIN } from "@/lib/map-pins";
import { isNonSpecificAddress } from "@/lib/address";
import { FavoriteStar } from "./FavoriteStar";
import { DirectionsLink } from "./DirectionsLink";

export type SheetRow = {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  distance: number;
  isBiz?: boolean;
};

export function SpreadsheetView({ rows }: { rows: SheetRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="min-w-full text-sm">
        <thead className="bg-secondary text-secondary-foreground text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-3 py-2 font-semibold">Name</th>
            <th className="text-left px-3 py-2 font-semibold">Category</th>
            <th className="text-left px-3 py-2 font-semibold">Address</th>
            <th className="text-left px-3 py-2 font-semibold">Phone</th>
            <th className="text-left px-3 py-2 font-semibold">Dist</th>
            <th className="text-left px-3 py-2 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const cat = CATEGORY_PIN[r.category];
            return (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="px-3 py-2">
                  {r.isBiz ? (
                    <span className="font-medium">{r.name}</span>
                  ) : (
                    <Link
                      to="/resource/$id"
                      params={{ id: r.id }}
                      className="no-min-h font-medium text-primary hover:underline"
                    >
                      {r.name}
                    </Link>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: cat?.color ?? "#475569" }}
                  >
                    {cat?.emoji} {cat?.label ?? r.category}
                  </span>
                </td>
                <td className="px-3 py-2 max-w-[18ch] truncate" title={r.address}>
                  {r.address}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <a
                    href={`tel:${r.phone}`}
                    onClick={() =>
                      trackCallClicked({ resourceId: r.id, category: r.category, phone: r.phone })
                    }
                    className="no-min-h text-primary hover:underline"
                  >
                    {r.phone}
                  </a>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {isNonSpecificAddress(r.address) ? "Varies" : `${r.distance} mi`}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${r.phone}`}
                      onClick={() =>
                        trackCallClicked({ resourceId: r.id, category: r.category, phone: r.phone })
                      }
                      aria-label={`Call ${r.name}`}
                      className="no-min-h inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    {!isNonSpecificAddress(r.address) && (
                      <DirectionsLink
                        address={r.address}
                        label={`Get directions to ${r.name}`}
                        iconOnly
                        className="no-min-h h-8 w-8 justify-center rounded-full bg-accent text-accent-foreground hover:no-underline"
                      />
                    )}
                    {!r.isBiz && <FavoriteStar id={r.id} />}
                  </div>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                No resources to show.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
