import { useState, useEffect } from "react";

/**
 * SSR-safe hook to detect if the current device is an Apple device (iPhone, iPad, Mac).
 */
export function useIsAppleDevice() {
  const [isApple, setIsApple] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const isIOS =
      /iPhone|iPad|iPod/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isMacSafari =
      /Macintosh/i.test(ua) && /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|Edg/i.test(ua);
    setIsApple(isIOS || isMacSafari);
  }, []);

  return isApple;
}
