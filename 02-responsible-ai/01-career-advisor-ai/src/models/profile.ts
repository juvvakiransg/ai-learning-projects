export interface UserProfile {
  currentRole: string;
  experienceYears: number;
  skills: string[];
  interests: string[];
  careerGoal: string;
  learningHoursPerWeek: number;
}

export function validateProfile(input: unknown): UserProfile {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Profile must be an object');
  const data = input as Record<string, unknown>;
  for (const field of ['currentRole', 'careerGoal']) {
    if (typeof data[field] !== 'string' || !(data[field] as string).trim() || (data[field] as string).length > 150) {
      throw new Error(`${field} must be a non-empty string of at most 150 characters`);
    }
  }
  for (const field of ['experienceYears', 'learningHoursPerWeek']) {
    const value = data[field];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > (field === 'experienceYears' ? 70 : 80)) {
      throw new Error(`${field} must be a valid number in range`);
    }
  }
  for (const field of ['skills', 'interests']) {
    const value = data[field];
    if (!Array.isArray(value) || value.length > 30 || !value.every(x => typeof x === 'string' && x.trim().length > 0 && x.length <= 80)) {
      throw new Error(`${field} must be an array of up to 30 non-empty strings`);
    }
  }
  return {
    currentRole: (data.currentRole as string).trim(),
    careerGoal: (data.careerGoal as string).trim(),
    experienceYears: data.experienceYears as number,
    learningHoursPerWeek: data.learningHoursPerWeek as number,
    skills: [...new Set((data.skills as string[]).map(x => x.trim()))],
    interests: [...new Set((data.interests as string[]).map(x => x.trim()))]
  };
}
