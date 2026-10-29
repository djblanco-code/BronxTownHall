import { trackCallClicked } from "@/lib/track-resource";
import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { CATEGORY_PIN } from "@/lib/map-pins";
import { CATEGORY_ICONS } from "@/features/resources";
import type { Category } from "@/lib/data";
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
    <div className="overflow-x-auto border-y border-border">
      <table className="min-w-full text-sm">
        <thead className="label-caps text-muted-foreground">
          <tr>
            <th className="text-start px-3 py-2">Name</th>
            <th className="text-start px-3 py-2">Category</th>
            <th className="text-start px-3 py-2">Address</th>
            <th className="text-start px-3 py-2">Phone</th>
            <th className="text-start px-3 py-2">Dist</th>
            <th className="text-start px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const cat = CATEGORY_PIN[r.category];
            const Icon = CATEGORY_ICONS[r.category as Category];
            return (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="px-3 py-2">
                  {r.isBiz ? (
                    <span className="font-bold">{r.name}</span>
                  ) : (
                    <Link
                      to="/resource/$id"
                      params={{ id: r.id }}
                      className="no-min-h font-bold text-foreground hover:underline"
                    >
                      {r.name}
                    </Link>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold">
                    {Icon && (
                      <Icon
                        className="h-4 w-4 shrink-0"
                        style={{ color: cat?.color ?? "#475569" }}
                        aria-hidden="true"
                      />
                    )}
                    {cat?.label ?? r.category}
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
                      className="no-min-h inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:border-foreground"
                    >
                      <Phone className="h-4 w-4" aria-hidden />
                    </a>
                    {!isNonSpecificAddress(r.address) && (
                      <DirectionsLink
                        address={r.address}
                        label={`Get directions to ${r.name}`}
                        iconOnly
                        className="no-min-h h-9 w-9 justify-center rounded-md border border-border text-foreground hover:border-foreground hover:no-underline"
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
