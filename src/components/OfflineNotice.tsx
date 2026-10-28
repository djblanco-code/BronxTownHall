import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/**
 * Friendly offline message for the installed app (and any browser tab).
 * Purely additive: it shows nothing at all while the device is online.
 */
export function OfflineNotice() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[100] bg-warning/95 px-4 py-2 text-center text-xs font-semibold text-foreground shadow"
    >
      <span className="inline-flex items-center gap-1.5">
        <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
        You&apos;re offline — pages you already opened still work. Emergency numbers are saved on
        this device.
      </span>
    </div>
  );
}
