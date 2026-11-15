import type { UserProfile } from '../models/profile.ts';

// Exclude sensitive and irrelevant personal attributes from recommendation prompts.
const sensitiveKeys = new Set(['age','gender','sex','race','ethnicity','religion','caste','disability','maritalStatus','dateOfBirth','address','email','phone','nationality']);
export function removeSensitiveFields(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([key]) => !sensitiveKeys.has(key)));
}
export function publicProfile(profile: UserProfile): UserProfile {
  return { ...profile, skills: [...profile.skills], interests: [...profile.interests] };
}
export const DISCLAIMER = 'Suggestions are educational guidance, not verified job openings or guarantees of employment. Validate requirements and opportunities independently.';
export function checkRecommendationText(text: string): string[] {
  const warnings: string[] = [];
  if (/guaranteed (job|employment|hire)|100% (chance|guarantee)/i.test(text)) warnings.push('Unsubstantiated employment guarantee');
  if (/only (men|women)|too old to|because of (your )?(race|religion|caste|gender)/i.test(text)) warnings.push('Potential discriminatory recommendation');
  return warnings;
}
