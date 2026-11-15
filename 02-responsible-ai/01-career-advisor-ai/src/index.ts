import { readFile } from 'node:fs/promises';
import { validateProfile } from './models/profile.ts';
import { offlineAdvice } from './services/recommend.ts';
import { openAIAdvice } from './services/openai.ts';

const demo = {
  currentRole: 'Senior iOS Developer', experienceYears: 14,
  skills: ['Swift','iOS','CI/CD','architecture','system design'],
  interests: ['cloud computing','architecture','AI'],
  careerGoal: 'Solution Architect', learningHoursPerWeek: 8
};
async function main(): Promise<void> {
  const file = process.argv[2];
  const raw = file ? JSON.parse(await readFile(file, 'utf8')) as unknown : demo;
  const profile = validateProfile(raw);
  const provider = process.env.AI_PROVIDER ?? 'offline';
  if (!['offline','openai'].includes(provider)) throw new Error('AI_PROVIDER must be offline or openai');
  const advice = provider === 'openai' ? await openAIAdvice(profile) : offlineAdvice(profile);
  console.log(JSON.stringify(advice, null, 2));
}
main().catch(error => { console.error(`Error: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; });
