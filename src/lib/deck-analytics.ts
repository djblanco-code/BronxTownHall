// Lightweight client-side pitch analytics.
// Stores view sessions + per-slide dwell time in localStorage.
// Not a substitute for real analytics; useful for demo/prototype tracking.

const KEY = "bronx.pitch.analytics.v1";

export type PitchSession = {
  id: string;
  startedAt: number;
  endedAt?: number;
  completed: boolean;
  slideTimes: Record<number, number>; // ms per slide index
  referrer: string;
  utm?: string;
  shares: number;
};

type Store = { sessions: PitchSession[] };

function load(): Store {
  if (typeof window === "undefined") return { sessions: [] };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { sessions: [] };
  } catch {
    return { sessions: [] };
  }
}

function save(s: Store) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
}

export function startSession(): PitchSession {
  const s: PitchSession = {
    id: Math.random().toString(36).slice(2),
    startedAt: Date.now(),
    completed: false,
    slideTimes: {},
    referrer: typeof document !== "undefined" ? document.referrer || "direct" : "direct",
    utm: typeof window !== "undefined" ? window.location.search : "",
    shares: 0,
  };
  const store = load();
  store.sessions.push(s);
  // keep last 50
  store.sessions = store.sessions.slice(-50);
  save(store);
  return s;
}

export function recordSlide(sessionId: string, slide: number, ms: number) {
  const store = load();
  const s = store.sessions.find((x) => x.id === sessionId);
  if (!s) return;
  s.slideTimes[slide] = (s.slideTimes[slide] || 0) + ms;
  save(store);
}

export function endSession(sessionId: string, completed: boolean) {
  const store = load();
  const s = store.sessions.find((x) => x.id === sessionId);
  if (!s) return;
  s.endedAt = Date.now();
  s.completed = completed;
  save(store);
}

export function recordShare(sessionId: string) {
  const store = load();
  const s = store.sessions.find((x) => x.id === sessionId);
  if (!s) return;
  s.shares += 1;
  save(store);
}

export function getSummary() {
  const store = load();
  const total = store.sessions.length;
  const completed = store.sessions.filter((s) => s.completed).length;
  const avgTime = total
    ? Math.round(
        store.sessions.reduce((a, s) => a + ((s.endedAt || Date.now()) - s.startedAt), 0) /
          total /
          1000,
      )
    : 0;
  return { total, completed, avgTimeSec: avgTime, sessions: store.sessions };
}
