import type { User, Job } from "@shared/schema";

interface MatchScore {
  jobId: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceMatch: boolean;
  salaryMatch: boolean;
  locationMatch: boolean;
  nqfMatch: boolean;
}

/**
 * Calculate skill overlap between user skills and job requirements
 */
export function calculateSkillOverlap(
  userSkills: string[],
  jobSkills: string[]
): { matched: string[]; missing: string[]; score: number } {
  const userSkillsLower = userSkills.map(s => s.toLowerCase().trim());
  const jobSkillsLower = jobSkills.map(s => s.toLowerCase().trim());

  const matched: string[] = [];
  const missing: string[] = [];

  jobSkillsLower.forEach((jobSkill) => {
    if (userSkillsLower.some(userSkill => 
      userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
    )) {
      matched.push(jobSkill);
    } else {
      missing.push(jobSkill);
    }
  });

  // Calculate score: % of job skills the user has
  const score = jobSkillsLower.length > 0 
    ? (matched.length / jobSkillsLower.length) * 100 
    : 0;

  return { matched, missing, score };
}

/**
 * Check if user's experience level matches job requirements
 */
export function checkExperienceMatch(
  userExperience: string | null,
  jobExperience: string | null
): boolean {
  if (!jobExperience) return true; // No job requirement = match
  if (!userExperience) return false; // Job has requirement but user has no experience = no match

  const experienceLevels = ['entry', 'junior', 'mid', 'senior', 'lead', 'principal'];
  
  const userLevel = experienceLevels.findIndex(level => 
    userExperience.toLowerCase().includes(level)
  );
  const jobLevel = experienceLevels.findIndex(level => 
    jobExperience.toLowerCase().includes(level)
  );

  // If job level not found in our list, be lenient and match
  if (jobLevel === -1) return true;
  
  // If user level not found but job level is specified, no match
  if (userLevel === -1) return false;
  
  // Match if user level >= job level
  return userLevel >= jobLevel;
}

/**
 * Check if job salary meets user's minimum expectations
 */
export function checkSalaryMatch(
  userMinSalary: number | null,
  jobSalary: string | null
): boolean {
  if (!userMinSalary || !jobSalary) return true; // No requirement = match

  // Extract first number from salary string (e.g., "R50000-R70000" -> 50000)
  const salaryMatch = jobSalary.match(/[\d,]+/);
  if (!salaryMatch) return true;

  const jobSalaryNum = parseInt(salaryMatch[0].replace(/,/g, ''));
  return jobSalaryNum >= userMinSalary;
}

/**
 * Check if job location matches user preferences
 */
export function checkLocationMatch(
  userLocations: string[] | null,
  jobLocation: string | null
): boolean {
  if (!userLocations || userLocations.length === 0 || !jobLocation) return true;

  return userLocations.some(userLoc => 
    jobLocation.toLowerCase().includes(userLoc.toLowerCase()) ||
    userLoc.toLowerCase().includes(jobLocation.toLowerCase()) ||
    (userLoc.toLowerCase() === 'remote' && jobLocation.toLowerCase().includes('remote'))
  );
}

/**
 * Check if user's NQF level meets or exceeds job requirements (Sprint 9 - SA Features)
 */
export function checkNQFMatch(
  userNQFLevel: number | null,
  jobNQFLevel: number | null
): boolean {
  // If no job requirement, it's a match
  if (!jobNQFLevel) return true;
  
  // If no user NQF but job requires it, not a match
  if (!userNQFLevel) return false;
  
  // User's NQF level must meet or exceed job requirement
  return userNQFLevel >= jobNQFLevel;
}

/**
 * Calculate comprehensive match score for a job based on user profile
 */
export function calculateJobMatchScore(user: User, job: Job): MatchScore {
  // Use user skills from profile
  const userSkills = user.skills || [];
  const jobSkills = job.skills || [];

  // Calculate skill overlap
  const skillMatch = calculateSkillOverlap(userSkills, jobSkills);

  // Check other factors
  const experienceMatch = checkExperienceMatch(
    user.preferredJobTitle || null,
    null // Jobs don't have experience level in schema yet
  );

  // Parse salary from preferredSalary string (e.g., "R50000")
  const userMinSalary = user.preferredSalary 
    ? parseInt(user.preferredSalary.replace(/[^\d]/g, '')) 
    : null;
  const salaryMatch = checkSalaryMatch(userMinSalary, job.salary);

  // Use single location from user
  const locationMatch = checkLocationMatch(
    user.location ? [user.location] : null, 
    job.location
  );

  // Check NQF level match (Sprint 9 - SA Features)
  const nqfMatch = checkNQFMatch(
    user.nqfLevel || null,
    job.nqfLevel || null
  );

  // Calculate weighted final score
  // Skills: 60%, Experience: 15%, Salary: 15%, Location: 10%
  let finalScore = skillMatch.score * 0.60; // Skills are 60% of score

  if (experienceMatch) finalScore += 15;
  if (salaryMatch) finalScore += 15;
  if (locationMatch) finalScore += 10;

  return {
    jobId: job.id,
    score: Math.round(finalScore),
    matchedSkills: skillMatch.matched,
    missingSkills: skillMatch.missing,
    experienceMatch,
    salaryMatch,
    locationMatch,
    nqfMatch,
  };
}

/**
 * Rank jobs by match score for a user
 */
export function rankJobsByMatch(user: User, jobs: Job[]): (Job & { matchScore: MatchScore })[] {
  return jobs
    .map(job => ({
      ...job,
      matchScore: calculateJobMatchScore(user, job),
    }))
    .sort((a, b) => b.matchScore.score - a.matchScore.score);
}
