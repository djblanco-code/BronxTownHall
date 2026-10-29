import { Star } from "lucide-react";
import { usePersonalization } from "@/lib/personalization";
import { toast } from "sonner";
import { trackResourceSaved } from "@/lib/track-resource";
import { useI18n } from "@/lib/i18n-context";

export function FavoriteStar({
  id,
  size = "md",
  onClick,
  category,
}: {
  id: string;
  size?: "sm" | "md" | "lg";
  onClick?: (e: React.MouseEvent) => void;
  category?: string;
}) {
  const { isFavorite, toggleFavorite } = usePersonalization();
  const { t } = useI18n();
  const fav = isFavorite(id);
  const px = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const iconSize = size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = toggleFavorite(id);
        trackResourceSaved({ resourceId: id, category, saved: next.includes(id) });
        toast.success(next.includes(id) ? "Saved to Favorites ⭐" : "Removed from Favorites");
        onClick?.(e);
      }}
      aria-label={fav ? t("interface.removeFavorite") : t("interface.saveFavorite")}
      aria-pressed={fav}
      className={`no-min-h ${px} grid place-items-center rounded-md hover:bg-secondary transition shrink-0`}
    >
      <Star
        className={`${iconSize} ${fav ? "fill-warning text-warning" : "text-foreground/70"}`}
        strokeWidth={2.25}
        aria-hidden="true"
      />
    </button>
  );
}
