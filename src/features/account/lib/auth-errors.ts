/**
 * Turns a Supabase auth error into one of our translated `account.*` messages,
 * so residents never see raw English like "Invalid login credentials".
 */
export function authErrorKey(err: unknown): string {
  const e = (err ?? {}) as { code?: string; message?: string; status?: number };
  const code = e.code ?? "";
  const msg = (e.message ?? "").toLowerCase();
  if (code === "invalid_credentials" || msg.includes("invalid login")) return "account.errInvalid";
  if (code === "email_not_confirmed" || msg.includes("not confirmed"))
    return "account.errUnconfirmed";
  if (code === "user_already_exists" || msg.includes("already registered"))
    return "account.errExists";
  if (code === "weak_password" || msg.includes("password should")) return "account.errWeak";
  if (code.startsWith("over_") || e.status === 429 || msg.includes("rate limit"))
    return "account.errRate";
  return "account.errGeneric";
}
