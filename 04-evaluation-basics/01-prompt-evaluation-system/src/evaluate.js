import { validateDataset } from './dataset.js';
import { generateAnswer } from './provider.js';
import { scoreRow, summarize } from './scoring.js';
export async function evaluate({ dataset, mode = 'mock', threshold = 0.75 }) {
  const rows = validateDataset(dataset);
  if (!['mock','provided','openai'].includes(mode)) throw new Error('Unsupported provider');
  if (typeof threshold !== 'number' || !Number.isFinite(threshold) || threshold < 0 || threshold > 1) throw new Error('Threshold must be between 0 and 1');
  const results = [];
  for (const row of rows) results.push(scoreRow(row, await generateAnswer(row, mode), threshold));
  return { mode, threshold, summary: summarize(results), results, caveat: mode === 'mock' ? 'Mock mode returns reference answers as fixtures; scores do not measure LLM accuracy.' : null };
}
