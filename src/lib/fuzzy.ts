// Lightweight typo-tolerant suggestion engine.
// Levenshtein distance + small dictionary of common resource terms.

const DICT = [
  "pantry","food pantry","soup kitchen","shelter","clinic","legal aid","job training",
  "childcare","daycare","esl","snap","wic","medicaid","medicare","housing","section 8",
  "homeless","mental health","rehab","detox","domestic violence","immigration","asylum",
  "halal","kosher","vegetarian","wheelchair","accessible","bilingual","spanish","french",
  "bengali","arabic","tutoring","after school","summer camp","internship","resume",
  "pharmacy","dentist","urgent care","hospital","precinct","community board","library",
  "shower","laundry","clothing","diapers","formula","baby","senior","veteran","lgbtq",
  "hiv","testing","pregnancy","wic","benefits","cash assistance","unemployment",
];

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let curr = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const next = Math.min(curr + 1, prev[j] + 1, prev[j - 1] + cost);
      prev[j - 1] = curr;
      curr = next;
    }
    prev[b.length] = curr;
  }
  return prev[b.length];
}

// Returns a corrected version of the query if a close dictionary term exists.
// Only suggests when at least one token has a meaningful correction.
export function suggestCorrection(query: string): string | null {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 3) return null;
  // First try whole-phrase match against multi-word entries.
  const phraseBest = bestMatch(q, DICT.filter((d) => d.includes(" ")));
  if (phraseBest && phraseBest.dist > 0 && phraseBest.dist <= Math.max(1, Math.floor(q.length / 5))) {
    return phraseBest.term;
  }
  // Otherwise token-by-token.
  const tokens = q.split(/\s+/);
  let changed = false;
  const fixed = tokens.map((tok) => {
    if (tok.length < 3) return tok;
    const m = bestMatch(tok, DICT.filter((d) => !d.includes(" ")));
    if (m && m.dist > 0 && m.dist <= Math.max(1, Math.floor(tok.length / 4))) {
      changed = true;
      return m.term;
    }
    return tok;
  });
  return changed ? fixed.join(" ") : null;
}

function bestMatch(s: string, pool: string[]): { term: string; dist: number } | null {
  let best: { term: string; dist: number } | null = null;
  for (const term of pool) {
    const d = levenshtein(s, term);
    if (!best || d < best.dist) best = { term, dist: d };
  }
  return best;
}
