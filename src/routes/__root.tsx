import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { syncBusinesses } from "@/lib/business-sync";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { I18nProvider, useI18n } from "@/lib/i18n-context";
import { Toaster } from "@/components/ui/sonner";
import { TtsProvider } from "@/lib/tts-context";
import { PackProvider } from "@/lib/pack";
import { PackShareBar } from "@/components/PackShareBar";
import { TtsPlayer } from "@/components/TtsPlayer";
import { SelectionListenButton } from "@/components/SelectionListenButton";
import { SkipLink } from "@/components/SkipLink";
import { SimplifiedModeEffect } from "@/lib/simplified-mode";
import { TextSizeEffect } from "@/lib/text-size";
import { TourOverlay } from "@/components/TourOverlay";
import { OfflineNotice } from "@/components/OfflineNotice";
import { LiveLocationProvider } from "@/lib/live-location";
import { registerServiceWorker } from "@/lib/register-sw";
import { initAnalytics } from "@/lib/analytics";
import { trackVisit } from "@/lib/track-journey";
import { logVisit } from "@/lib/visit-log";
import "@/lib/resources-extra"; // side-effect: appends new-category resources

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Page not found.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary-fill px-4 py-2 text-sm font-medium text-primary-fill-foreground"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : String(error)}
        </p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-md bg-primary-fill px-4 py-2 text-sm font-medium text-primary-fill-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "The Bronx App — Connecting 1.4 Million Neighbors" },
      {
        name: "description",
        content:
          "Free multilingual community resource finder for Bronx residents: food pantries, health clinics, legal aid, jobs, and events.",
      },
      { property: "og:title", content: "The Bronx App" },
      {
        property: "og:description",
        content: "Free multilingual community resource finder for the Bronx.",
      },
      { property: "og:type", content: "website" },
      // Installable-app (home screen) support — optional layer, the site works the same without it.
      { name: "theme-color", content: "#1d4ed8" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Bronx App" },
      { name: "application-name", content: "The Bronx App" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400..700&family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Noto+Sans+Arabic:wght@400..700&family=Noto+Sans+Bengali:wght@400..700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <SkipLink />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    registerServiceWorker();
    initAnalytics();
    trackVisit();
    void logVisit();
    void syncBusinesses();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TtsProvider>
          <LiveLocationProvider>
            <PackProvider>
              <SimplifiedModeEffect />
              <TextSizeEffect />
              <Outlet />
              <SelectionListenButton />
              <TtsPlayer />
              <TourOverlay />
              <PersonalizeNudge />
              <OfflineNotice />
              <PackShareBar />
              <ToastHost />
            </PackProvider>
          </LiveLocationProvider>
        </TtsProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

/** Toast messages (sign-in errors, "Link copied", …), just below the top bar. */
function ToastHost() {
  const { dir } = useI18n();
  return (
    <Toaster
      dir={dir}
      position="top-center"
      offset={{ top: 64 }}
      mobileOffset={{ top: 64 }}
      closeButton
    />
  );
}

function PersonalizeNudge() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const dismissed = localStorage.getItem("bronx.personalizeNudge") === "dismissed";
      const raw = localStorage.getItem("bronx.profile");
      const p = raw ? JSON.parse(raw) : null;
      if (dismissed || p?.completed) return;
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => setShow(true), 30000);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  const dismiss = () => {
    try {
      localStorage.setItem("bronx.personalizeNudge", "dismissed");
    } catch {
      /* ignore */
    }
    setShow(false);
  };
  return (
    <div
      role="region"
      aria-label="Personalize your experience"
      className="fixed app-float-bottom lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[min(420px,calc(100vw-1.5rem))] rounded-2xl border border-border bg-card shadow-2xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            Help us personalize your experience
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Answer a few quick questions to see resources tailored to you.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Link
              to="/onboarding"
              onClick={dismiss}
              className="no-min-h inline-flex items-center px-3 py-1.5 rounded-full bg-primary-fill text-primary-fill-foreground text-xs font-bold hover:opacity-90"
            >
              Personalize
            </Link>
            <button
              onClick={dismiss}
              className="no-min-h inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:bg-secondary"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="no-min-h inline-flex items-center justify-center h-7 w-7 rounded-full hover:bg-secondary text-muted-foreground"
        >
          ×
        </button>
      </div>
    </div>
  );
}
