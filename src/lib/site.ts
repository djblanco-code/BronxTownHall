/**
 * Public address of the site, used for canonical links, share links and the
 * sitemap. Set VITE_SITE_URL on your host; on Vercel the production domain is
 * used automatically (see vite.config.ts).
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || "http://localhost:8080").replace(
  /\/+$/,
  "",
);
