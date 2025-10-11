import type { Job } from '@shared/schema';
import { detectApplicationMethod, getJobApplicationEmail } from './email-service';

/**
 * Job Enrichment Service
 * Analyzes job postings and enriches them with application method detection
 */

interface EnrichedJob extends Job {
  applicationEmail?: string | null;
  applicationMethod?: string | null;
  applicationUrl?: string | null;
}

/**
 * Enrich a single job with application method detection
 */
export function enrichJobWithApplicationData(job: Job): EnrichedJob {
  const enriched: EnrichedJob = { ...job };
  
  // Detect email from job data
  const email = getJobApplicationEmail(job);
  if (email) {
    enriched.applicationEmail = email;
  }
  
  // Detect application method
  const method = detectApplicationMethod(job);
  enriched.applicationMethod = method;
  
  // If no application URL and we have email, create mailto link
  if (!enriched.applicationUrl && email) {
    enriched.applicationUrl = `mailto:${email}`;
  }
  
  return enriched;
}

/**
 * Enrich multiple jobs in batch
 */
export function enrichJobsBatch(jobs: Job[]): EnrichedJob[] {
  return jobs.map(job => enrichJobWithApplicationData(job));
}

/**
 * Analyze job description and extract key application information
 */
export function analyzeJobDescription(description: string): {
  hasEmail: boolean;
  hasUrl: boolean;
  applicationInstructions?: string;
} {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  const hasEmail = emailRegex.test(description);
  const hasUrl = urlRegex.test(description);
  
  // Extract application instructions if present
  const instructionPatterns = [
    /(?:to apply|how to apply|application process)[\s\S]{0,500}/i,
    /(?:send|submit|email).*?(?:resume|cv|application)[\s\S]{0,200}/i,
  ];
  
  let applicationInstructions: string | undefined;
  for (const pattern of instructionPatterns) {
    const match = description.match(pattern);
    if (match) {
      applicationInstructions = match[0].trim();
      break;
    }
  }
  
  return {
    hasEmail,
    hasUrl,
    applicationInstructions,
  };
}

/**
 * Get statistics on job application methods
 */
export function getApplicationMethodStats(jobs: Job[]): {
  total: number;
  email: number;
  url: number;
  unknown: number;
  emailPercentage: number;
} {
  const enriched = enrichJobsBatch(jobs);
  
  const stats = {
    total: enriched.length,
    email: 0,
    url: 0,
    unknown: 0,
    emailPercentage: 0,
  };
  
  enriched.forEach(job => {
    if (job.applicationMethod === 'email') {
      stats.email++;
    } else if (job.applicationMethod === 'url') {
      stats.url++;
    } else {
      stats.unknown++;
    }
  });
  
  stats.emailPercentage = stats.total > 0 
    ? Math.round((stats.email / stats.total) * 100) 
    : 0;
  
  return stats;
}

/**
 * Validate if a job has sufficient data for automated application
 */
export function canAutoApply(job: Job): {
  canApply: boolean;
  method?: 'email' | 'url';
  reason?: string;
} {
  const enriched = enrichJobWithApplicationData(job);
  
  // Check for email application
  if (enriched.applicationEmail && enriched.applicationMethod === 'email') {
    return {
      canApply: true,
      method: 'email',
    };
  }
  
  // Check for known ATS platforms (future expansion)
  if (enriched.applicationUrl) {
    const atsPatterns = [
      'greenhouse.io',
      'lever.co',
      'workday.com',
      'myworkdayjobs.com',
      'smartrecruiters.com',
      'breezy.hr',
    ];
    
    const hasKnownATS = atsPatterns.some(pattern => 
      enriched.applicationUrl?.includes(pattern)
    );
    
    if (hasKnownATS) {
      return {
        canApply: false,
        method: 'url',
        reason: 'ATS integration not yet implemented for this platform',
      };
    }
  }
  
  // No auto-apply method available
  return {
    canApply: false,
    reason: 'No email or supported application URL found',
  };
}
