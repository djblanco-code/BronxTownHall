/**
 * Some browsers block site storage (strict privacy settings, some private
 * windows, embedded webviews), and then merely touching `localStorage`
 * throws. Rather than guard every read in the app, this swaps in a
 * forgetful in-memory store: the app works, it just remembers nothing after
 * the tab closes. Imported first in src/router.tsx so it runs before any
 * app code.
 */
function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k) => (data.has(k) ? data.get(k)! : null),
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, String(v)),
  };
}

export function installSafeStorage(win: Window & typeof globalThis) {
  for (const name of ["localStorage", "sessionStorage"] as const) {
    try {
      const store = win[name];
      store.setItem("__bx_probe", "1");
      store.removeItem("__bx_probe");
    } catch {
      try {
        Object.defineProperty(win, name, { configurable: true, value: memoryStorage() });
      } catch {
        /* nothing more we can do */
      }
    }
  }
}

if (typeof window !== "undefined") installSafeStorage(window);
