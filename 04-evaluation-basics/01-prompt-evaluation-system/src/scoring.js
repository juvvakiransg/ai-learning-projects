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
// Conservative contradiction checks for short, factual reference answers.
// These rules catch common negations and corrections, not arbitrary semantic errors.
export function detectContradiction(expected, actual) {
  const reference = normalize(expected);
  const response = normalize(actual);
  if (!reference || !response) return null;
  const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const ref = escapeRegExp(reference).replace(/\s+/g, '\\s+');
  const notReference = new RegExp(`\\b(?:not|never|isn t|isnt|wasn t|wasnt|aren t|arent|incorrectly|wrongly)\\s+(?:(?:the|a|an|in|at|actually|really)\\s+){0,3}${ref}\\b`);
  const referenceIsWrong = new RegExp(`\\b${ref}\\s+(?:is|was|are)\\s+(?:not|incorrect|wrong|false)\\b`);
  const correction = new RegExp(`\\b(?:not|isn t|isnt)\\s+${ref}\\b.*\\b(?:it\\s+is|it\\s+was|but|rather|instead)\\b`);
  if (notReference.test(response) || referenceIsWrong.test(response) || correction.test(response)) {
    return 'The response explicitly negates or rejects the expected answer.';
  }
  // An uncertain answer should not receive a passing grade for keyword presence.
  if (new RegExp(`\\b(?:not sure|unsure|uncertain|might be|could be|maybe|perhaps)\\b.*\\b${ref}\\b`).test(response)) {
    return 'The response expresses uncertainty rather than asserting the expected answer.';
  }
  return null;
}
export function scoreRow(row, actual, threshold = 0.75) {
  const exact = exactMatch(row.expectedOutput, actual), f1 = tokenF1(row.expectedOutput, actual), keywords = keywordCoverage(row.keywords ?? [], actual);
  const composite = (exact + f1 + keywords) / 3;
  const contradictionReason = detectContradiction(row.expectedOutput, actual);
  return { contradictionDetected: Boolean(contradictionReason), gradingReason: contradictionReason ?? 'Lexical metrics only; semantic correctness is not guaranteed.', id: row.id, question: row.question, expectedOutput: row.expectedOutput, actualOutput: actual, exactMatch: exact, tokenF1: f1, keywordCoverage: keywords, composite, passed: !contradictionReason && composite >= threshold };
}
export function summarize(results) {
  const n = results.length, avg = k => n ? results.reduce((s,r) => s + r[k], 0) / n : 0;
  return { total: n, passed: results.filter(r=>r.passed).length, failed: results.filter(r=>!r.passed).length, exactMatchAccuracy: avg('exactMatch'), averageTokenF1: avg('tokenF1'), averageKeywordCoverage: avg('keywordCoverage'), averageComposite: avg('composite'), contradictionsDetected: results.filter(r => r.contradictionDetected).length };
}
