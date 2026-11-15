export function normalize(text) { return String(text ?? '').toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim(); }
export function exactMatch(expected, actual) { return normalize(expected) === normalize(actual) ? 1 : 0; }
export function tokenF1(expected, actual) {
  const a = normalize(expected).split(' ').filter(Boolean), b = normalize(actual).split(' ').filter(Boolean);
  if (!a.length && !b.length) return 1;
  if (!a.length || !b.length) return 0;
  const counts = new Map(); for (const t of a) counts.set(t, (counts.get(t) || 0) + 1);
  let common = 0; for (const t of b) { const n = counts.get(t) || 0; if (n) { common++; counts.set(t,n-1); } }
  return common ? 2 * common / (a.length + b.length) : 0;
}
export function keywordCoverage(keywords, actual) {
  if (!keywords.length) return 1;
  const normalized = ` ${normalize(actual)} `;
  return keywords.filter(k => normalized.includes(` ${normalize(k)} `)).length / keywords.length;
}
export function scoreRow(row, actual, threshold = 0.75) {
  const exact = exactMatch(row.expectedOutput, actual), f1 = tokenF1(row.expectedOutput, actual), keywords = keywordCoverage(row.keywords ?? [], actual);
  const composite = (exact + f1 + keywords) / 3;
  return { id: row.id, question: row.question, expectedOutput: row.expectedOutput, actualOutput: actual, exactMatch: exact, tokenF1: f1, keywordCoverage: keywords, composite, passed: composite >= threshold };
}
export function summarize(results) {
  const n = results.length, avg = k => n ? results.reduce((s,r) => s + r[k], 0) / n : 0;
  return { total: n, passed: results.filter(r=>r.passed).length, failed: results.filter(r=>!r.passed).length, exactMatchAccuracy: avg('exactMatch'), averageTokenF1: avg('tokenF1'), averageKeywordCoverage: avg('keywordCoverage'), averageComposite: avg('composite') };
}
