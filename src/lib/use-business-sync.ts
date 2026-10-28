import { useEffect, useState } from "react";

/** Re-renders the component once cloud business data has landed locally. */
export function useBusinessSync() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const onSync = () => setTick((t) => t + 1);
    window.addEventListener("bx-businesses-synced", onSync);
    return () => window.removeEventListener("bx-businesses-synced", onSync);
  }, []);
  return tick;
}
