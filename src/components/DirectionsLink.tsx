import * as React from "react";
import { Navigation } from "lucide-react";
import { useIsAppleDevice } from "@/hooks/use-apple-device";
import { getDirectionsUrl, type TravelMode } from "@/lib/maps";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n-context";

interface DirectionsLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  mode?: TravelMode;
  origin?: string;
  originLat?: number | null;
  originLng?: number | null;
  showIcon?: boolean;
  label?: string;
  fallback?: React.ReactNode;
  iconOnly?: boolean;
}

/**
 * Reusable, accessible, device-aware directions link.
 * Automatically handles Apple Maps vs Google Maps and non-specific addresses.
 */
export function DirectionsLink({
  address,
  latitude,
  longitude,
  mode = "transit",
  origin,
  originLat,
  originLng,
  showIcon = true,
  label,
  fallback = null,
  iconOnly = false,
  className,
  ...props
}: DirectionsLinkProps) {
  const isApple = useIsAppleDevice();
  const { t } = useI18n();
  
  const url = getDirectionsUrl({ 
    address, 
    latitude, 
    longitude, 
    mode, 
    origin, 
    originLat, 
    originLng 
  }, isApple);

  if (!url) {
    return <>{fallback}</>;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold text-primary hover:underline",
        className
      )}
      aria-label={label || `${t("common.btnDirections")} ${address}`}
      title={props.title ?? (label || t("common.btnDirections"))}
      {...props}
    >
      {showIcon && <Navigation className="h-4 w-4" aria-hidden="true" />}
      <span className={iconOnly ? "sr-only" : undefined}>{label || t("common.btnDirections")}</span>
    </a>
  );
}
