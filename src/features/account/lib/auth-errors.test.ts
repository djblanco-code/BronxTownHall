import { describe, expect, it } from "vitest";
import { authErrorKey } from "./auth-errors";

describe("authErrorKey", () => {
  it("maps Supabase error codes to translated messages", () => {
    expect(authErrorKey({ code: "invalid_credentials" })).toBe("account.errInvalid");
    expect(authErrorKey({ code: "email_not_confirmed" })).toBe("account.errUnconfirmed");
    expect(authErrorKey({ code: "user_already_exists" })).toBe("account.errExists");
    expect(authErrorKey({ code: "weak_password" })).toBe("account.errWeak");
    expect(authErrorKey({ code: "over_email_send_rate_limit" })).toBe("account.errRate");
  });

  it("falls back to the message text, then to a generic message", () => {
    expect(authErrorKey(new Error("Invalid login credentials"))).toBe("account.errInvalid");
    expect(authErrorKey({ status: 429 })).toBe("account.errRate");
    expect(authErrorKey(new Error("Failed to fetch"))).toBe("account.errGeneric");
    expect(authErrorKey(undefined)).toBe("account.errGeneric");
  });
});
