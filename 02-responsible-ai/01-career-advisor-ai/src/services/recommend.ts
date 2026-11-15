import type { UserProfile } from '../models/profile.ts';
import { ROLES } from './catalog.ts';
import { DISCLAIMER } from '../safety/responsible.ts';
export interface Recommendation { title: string; score: number; matchedSkills: string[]; skillGaps: string[]; reason: string; }
export interface Advice { recommendations: Recommendation[]; roadmap: RoadmapStep[]; disclaimer: string; provider: string; }
export interface RoadmapStep { phase: string; weeks: string; focus: string[]; deliverable: string; }
const norm = (x: string): string => x.toLowerCase().trim();
export function recommend(profile: UserProfile, limit = 3): Recommendation[] {
  const known = new Set(profile.skills.map(norm));
  const preferences = `${profile.careerGoal} ${profile.interests.join(' ')}`.toLowerCase();
  return ROLES.map(role => {
    const matchedSkills = role.skills.filter(s => known.has(norm(s)));
    const skillGaps = role.skills.filter(s => !known.has(norm(s)));
    const titleTokens = role.title.toLowerCase().split(' ');
    const goalBonus = preferences.includes(role.title.toLowerCase()) ? 40 : titleTokens.some(t => t.length > 3 && preferences.includes(t)) ? 15 : 0;
    const score = Math.min(100, Math.round(matchedSkills.length / role.skills.length * 60 + goalBonus));
    return { title: role.title, score, matchedSkills, skillGaps,
      reason: `${matchedSkills.length} of ${role.skills.length} catalog skills matched; career interests and goals contribute to ranking.` };
  }).sort((a,b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, Math.max(0, Math.min(ROLES.length, limit)));
}
export function createRoadmap(profile: UserProfile, rec: Recommendation): RoadmapStep[] {
  const gaps = rec.skillGaps;
  const chunks = [gaps.slice(0,2), gaps.slice(2,4), gaps.slice(4)];
  const hours = profile.learningHoursPerWeek;
  return [
    { phase: 'Foundation', weeks: '1–4', focus: chunks[0].length ? chunks[0] : ['strengthen existing skills'], deliverable: `Study and document core concepts (${hours} hours/week available).` },
    { phase: 'Practice', weeks: '5–8', focus: chunks[1].length ? chunks[1] : ['applied practice'], deliverable: 'Build a small portfolio project with tests and documentation.' },
    { phase: 'Portfolio & review', weeks: '9–12', focus: chunks[2].length ? chunks[2] : ['interview preparation','portfolio review'], deliverable: 'Publish a project case study and evaluate progress against role requirements.' }
  ];
}
export function offlineAdvice(profile: UserProfile): Advice {
  const recommendations = recommend(profile);
  return { recommendations, roadmap: createRoadmap(profile, recommendations[0]), disclaimer: DISCLAIMER, provider: 'offline' };
}
