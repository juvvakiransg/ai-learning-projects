import type { UserProfile } from '../models/profile.ts';
import { publicProfile, DISCLAIMER } from '../safety/responsible.ts';
export const SYSTEM_PROMPT = `You are a careful, helpful career advisor. Recommend career paths based only on skills, goals, interests and experience. Do not infer or use protected characteristics. Do not promise employment, fabricate job vacancies, or imply recommendations are hiring decisions. Explain gaps and uncertainty. Output valid JSON with recommendations and roadmap. ${DISCLAIMER}`;
export const FEW_SHOT = [
  { profile: { currentRole: 'Frontend Developer', experienceYears: 3, skills: ['react','typescript'], interests: ['web'], careerGoal: 'Frontend Engineer', learningHoursPerWeek: 5 }, recommendation: 'Frontend Engineer' },
  { profile: { currentRole: 'iOS Developer', experienceYears: 8, skills: ['swift','ios','ci/cd'], interests: ['architecture'], careerGoal: 'Mobile Architect', learningHoursPerWeek: 6 }, recommendation: 'Mobile Architect' }
];
export function buildPrompt(profile: UserProfile, style: 'role'|'few-shot'|'instruction' = 'few-shot'): string {
  const example = style === 'few-shot' ? `Examples (illustrative, not hiring outcomes):\n${JSON.stringify(FEW_SHOT)}\n` : '';
  const instruction = style === 'instruction' ? 'Analyze the profile and return reasoned career suggestions and a 12-week roadmap.' : 'Act as a fair career advisor. Return reasoned career suggestions and a 12-week roadmap.';
  return `${instruction}\n${example}User profile:\n${JSON.stringify(publicProfile(profile))}`;
}
