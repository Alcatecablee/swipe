import { db } from './db';
import { applications, jobs, users } from '@shared/schema';
import { eq, and, desc, sql, gte } from 'drizzle-orm';

export interface ApplicationTimeline {
  applicationId: string;
  jobTitle: string;
  company: string;
  status: string;
  appliedDate: Date;
  lastUpdate: Date;
  daysElapsed: number;
  nextAction?: string;
}

export interface SuccessMetrics {
  totalApplications: number;
  responseRate: number; // % of applications with any response
  interviewRate: number; // % of applications that led to interview
  offerRate: number; // % of applications that led to offer
  averageResponseTime: number; // days until first response
  topPerformingSectors: Array<{ sector: string; successRate: number }>;
  applicationsByStatus: Record<string, number>;
  weeklyTrend: Array<{ week: string; applications: number; interviews: number }>;
}

export async function getApplicationTimeline(userId: string): Promise<ApplicationTimeline[]> {
  const userApplications = await db
    .select({
      id: applications.id,
      jobId: applications.jobId,
      status: applications.status,
      appliedAt: applications.appliedAt,
    })
    .from(applications)
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.appliedAt));

  const timeline: ApplicationTimeline[] = [];

  for (const app of userApplications) {
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, app.jobId))
      .limit(1);

    if (!job) continue;

    const appliedDate = new Date(app.appliedAt);
    const lastUpdate = new Date(app.appliedAt);
    const daysElapsed = Math.floor((Date.now() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));

    timeline.push({
      applicationId: app.id,
      jobTitle: job.title,
      company: job.company,
      status: app.status || 'pending',
      appliedDate,
      lastUpdate,
      daysElapsed,
      nextAction: getNextAction(app.status || 'pending', daysElapsed),
    });
  }

  return timeline;
}

export async function getSuccessMetrics(userId: string): Promise<SuccessMetrics> {
  const userApplications = await db
    .select({
      id: applications.id,
      jobId: applications.jobId,
      status: applications.status,
      appliedAt: applications.appliedAt,
    })
    .from(applications)
    .where(eq(applications.userId, userId));

  const total = userApplications.length;
  
  if (total === 0) {
    return {
      totalApplications: 0,
      responseRate: 0,
      interviewRate: 0,
      offerRate: 0,
      averageResponseTime: 0,
      topPerformingSectors: [],
      applicationsByStatus: {},
      weeklyTrend: [],
    };
  }

  // Calculate rates
  const withResponse = userApplications.filter(a => 
    a.status && a.status !== 'pending' && a.status !== 'applied'
  ).length;
  const interviews = userApplications.filter(a => 
    a.status === 'interview' || a.status === 'accepted'
  ).length;
  const offers = userApplications.filter(a => a.status === 'accepted').length;

  const responseRate = Math.round((withResponse / total) * 100);
  const interviewRate = Math.round((interviews / total) * 100);
  const offerRate = Math.round((offers / total) * 100);

  // Calculate average response time
  const responseTimes: number[] = [];
  for (const app of userApplications) {
    if (app.status && app.status !== 'pending' && app.status !== 'applied') {
      const appliedDate = new Date(app.appliedAt);
      const currentDate = new Date();
      const days = Math.floor((currentDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 0) responseTimes.push(days);
    }
  }
  
  const averageResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;

  // Applications by status
  const applicationsByStatus: Record<string, number> = {};
  userApplications.forEach(app => {
    const status = app.status || 'pending';
    applicationsByStatus[status] = (applicationsByStatus[status] || 0) + 1;
  });

  // Top performing sectors
  const sectorPerformance: Record<string, { total: number; success: number }> = {};
  
  for (const app of userApplications) {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, app.jobId)).limit(1);
    if (!job || !job.sector) continue;

    if (!sectorPerformance[job.sector]) {
      sectorPerformance[job.sector] = { total: 0, success: 0 };
    }
    
    sectorPerformance[job.sector].total++;
    
    if (app.status === 'interview' || app.status === 'accepted') {
      sectorPerformance[job.sector].success++;
    }
  }

  const topPerformingSectors = Object.entries(sectorPerformance)
    .map(([sector, data]) => ({
      sector,
      successRate: Math.round((data.success / data.total) * 100),
    }))
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 5);

  // Weekly trend (last 4 weeks)
  const weeklyTrend = calculateWeeklyTrend(userApplications);

  return {
    totalApplications: total,
    responseRate,
    interviewRate,
    offerRate,
    averageResponseTime,
    topPerformingSectors,
    applicationsByStatus,
    weeklyTrend,
  };
}

function getNextAction(status: string, daysElapsed: number): string | undefined {
  switch (status) {
    case 'pending':
    case 'applied':
      if (daysElapsed > 7) return 'Consider following up';
      if (daysElapsed > 14) return 'Follow up recommended';
      return undefined;
    case 'reviewing':
      if (daysElapsed > 10) return 'Reach out for update';
      return 'Wait for response';
    case 'interview':
      return 'Prepare for interview';
    case 'rejected':
      return 'Apply to similar roles';
    case 'accepted':
      return 'Celebrate! 🎉';
    default:
      return undefined;
  }
}

function calculateWeeklyTrend(applications: any[]): Array<{ week: string; applications: number; interviews: number }> {
  const weeks: Record<string, { applications: number; interviews: number }> = {};
  const now = new Date();

  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
    const weekLabel = `Week ${4 - i}`;
    weeks[weekLabel] = { applications: 0, interviews: 0 };

    applications.forEach(app => {
      const appDate = new Date(app.appliedAt);
      if (appDate >= weekStart && appDate < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        weeks[weekLabel].applications++;
        if (app.status === 'interview' || app.status === 'accepted') {
          weeks[weekLabel].interviews++;
        }
      }
    });
  }

  return Object.entries(weeks).map(([week, data]) => ({
    week,
    ...data,
  }));
}
