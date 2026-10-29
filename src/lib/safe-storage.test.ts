import { describe, expect, it } from "vitest";
import { installSafeStorage } from "./safe-storage";

describe("installSafeStorage", () => {
  it("replaces storage that throws with a working in-memory store", () => {
    const win = {} as Window & typeof globalThis;
    for (const name of ["localStorage", "sessionStorage"]) {
      Object.defineProperty(win, name, {
        configurable: true,
        get() {
          throw new Error("SecurityError");
        },
      });
    }
    installSafeStorage(win);
    win.localStorage.setItem("a", "1");
    expect(win.localStorage.getItem("a")).toBe("1");
    expect(win.localStorage.key(0)).toBe("a");
    expect(win.localStorage.length).toBe(1);
    win.localStorage.removeItem("a");
    expect(win.localStorage.getItem("a")).toBeNull();
    expect(() => win.sessionStorage.clear()).not.toThrow();
  });

  it("leaves working storage alone", () => {
    const real = new Map<string, string>();
    const store = {
      setItem: (k: string, v: string) => real.set(k, v),
      removeItem: (k: string) => real.delete(k),
    } as unknown as Storage;
    const win = { localStorage: store, sessionStorage: store } as Window & typeof globalThis;
    installSafeStorage(win);
    expect(win.localStorage).toBe(store);
  });
});
