import type { UserProfile } from '../models/profile.ts';
import { SYSTEM_PROMPT, buildPrompt } from '../prompts/templates.ts';
import { type Advice } from './recommend.ts';
import { checkRecommendationText, DISCLAIMER } from '../safety/responsible.ts';
import { ROLES } from './catalog.ts';

export async function openAIAdvice(profile: UserProfile, options: { apiKey?: string; model?: string; fetcher?: typeof fetch } = {}): Promise<Advice> {
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is missing. Use AI_PROVIDER=offline to run without billing.');
  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: options.model ?? process.env.OPENAI_MODEL ?? 'gpt-5', instructions: SYSTEM_PROMPT,
      input: buildPrompt(profile), text: { format: { type: 'json_object' } } })
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: { code?: string; message?: string } };
    if (response.status === 429 && payload.error?.code === 'insufficient_quota') throw new Error('OpenAI quota exhausted. Set AI_PROVIDER=offline or enable API billing.');
    throw new Error(`OpenAI API error ${response.status}: ${payload.error?.message ?? 'Request failed'}`);
  }
  const payload = await response.json() as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  const text = payload.output?.flatMap(o => o.content ?? []).filter(c => c.type === 'output_text').map(c => c.text ?? '').join('') ?? '';
  if (!text) throw new Error('OpenAI response did not contain output text');
  const warnings = checkRecommendationText(text);
  if (warnings.length) throw new Error(`Responsible AI validation failed: ${warnings.join(', ')}`);
  const result: unknown = JSON.parse(text);
  if (!result || typeof result !== 'object') throw new Error('Invalid AI output structure');
  const value = result as Record<string, unknown>;
  if (!Array.isArray(value.recommendations) || value.recommendations.length < 1 || value.recommendations.length > 3 || !Array.isArray(value.roadmap) || value.roadmap.length !== 3) {
    throw new Error('Invalid AI output structure');
  }
  const allowed = new Set(ROLES.map(r => r.title));
  for (const item of value.recommendations) {
    if (!item || typeof item !== 'object' || !allowed.has(item.title) || typeof item.score !== 'number' || item.score < 0 || item.score > 100 ||
        !Array.isArray(item.matchedSkills) || !Array.isArray(item.skillGaps) || typeof item.reason !== 'string' || item.reason.length > 1000) {
      throw new Error('Invalid AI recommendation');
    }
  }
  for (const step of value.roadmap) {
    if (!step || typeof step.phase !== 'string' || typeof step.weeks !== 'string' || !Array.isArray(step.focus) || !step.focus.every((s: unknown) => typeof s === 'string') || typeof step.deliverable !== 'string') {
      throw new Error('Invalid AI roadmap');
    }
  }
  return { recommendations: value.recommendations, roadmap: value.roadmap, provider: 'openai', disclaimer: DISCLAIMER } as Advice;
}
