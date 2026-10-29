/**
 * Google sign-in shows only when it has been set up in Supabase
 * (docs/self-hosting.md); otherwise the button would lead to a raw
 * "provider is not enabled" page.
 */
export const GOOGLE_SIGN_IN_ENABLED = import.meta.env.VITE_GOOGLE_SIGN_IN === "true";

/** Where password-reset emails send people back to. */
export function resetPasswordUrl() {
  return `${window.location.origin}/reset-password`;
}
