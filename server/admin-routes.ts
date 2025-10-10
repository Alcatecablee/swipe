import { Router, type Request, Response } from 'express';
import { db } from './db';
import { users, jobs, applications, swipes, badges, userAnalytics } from '@shared/schema';
import { eq, desc, sql, and, count, gte } from 'drizzle-orm';
import { authenticateUser } from './auth-middleware';
import { requireAdmin } from './admin-middleware';
import { z } from 'zod';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticateUser);
router.use(requireAdmin);

// ============================================================
// DASHBOARD & STATISTICS
// ============================================================

router.get('/api/admin/dashboard', async (req: Request, res: Response) => {
  try {
    // Get counts
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalJobs = await db.select({ count: sql<number>`count(*)` }).from(jobs);
    const totalApplications = await db.select({ count: sql<number>`count(*)` }).from(applications);
    const activeJobs = await db.select({ count: sql<number>`count(*)` }).from(jobs).where(eq(jobs.isActive, true));
    
    // Recent sign ups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, sevenDaysAgo));
    
    // Application stats
    const appStats = await db
      .select({
        status: applications.status,
        count: sql<number>`count(*)`,
      })
      .from(applications)
      .groupBy(applications.status);
    
    // Premium users
    const premiumUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isPremium, true));
    
    // Recent applications (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recentApps = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(gte(applications.appliedAt, oneDayAgo));

    // Email vs manual applications
    const emailApps = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.submissionMethod, 'email'));

    res.json({
      totalUsers: Number(totalUsers[0]?.count || 0),
      totalJobs: Number(totalJobs[0]?.count || 0),
      totalApplications: Number(totalApplications[0]?.count || 0),
      activeJobs: Number(activeJobs[0]?.count || 0),
      recentSignups: Number(recentUsers[0]?.count || 0),
      premiumUsers: Number(premiumUsers[0]?.count || 0),
      recentApplications: Number(recentApps[0]?.count || 0),
      emailApplications: Number(emailApps[0]?.count || 0),
      applicationsByStatus: appStats.map(s => ({
        status: s.status,
        count: Number(s.count),
      })),
    });
  } catch (error: any) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch dashboard data' });
  }
});

// ============================================================
// JOB MANAGEMENT
// ============================================================

// List all jobs with filters
router.get('/api/admin/jobs', async (req: Request, res: Response) => {
  try {
    const { status, limit = '50', offset = '0' } = req.query;
    
    let query = db.select().from(jobs);
    
    if (status === 'active') {
      query = query.where(eq(jobs.isActive, true)) as any;
    } else if (status === 'inactive') {
      query = query.where(eq(jobs.isActive, false)) as any;
    }
    
    const jobList = await query
      .orderBy(desc(jobs.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    // Get application counts for each job
    const jobsWithCounts = await Promise.all(
      jobList.map(async (job) => {
        const appCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(applications)
          .where(eq(applications.jobId, job.id));
        
        return {
          ...job,
          applicationCount: Number(appCount[0]?.count || 0),
        };
      })
    );

    res.json(jobsWithCounts);
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch jobs' });
  }
});

// Get single job
router.get('/api/admin/jobs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error: any) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch job' });
  }
});

// Create job
const createJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  salary: z.string().min(1),
  location: z.string().min(1),
  sector: z.string().optional(),
  description: z.string().min(1),
  skills: z.array(z.string()),
  nqfLevel: z.number().optional(),
  workType: z.string().optional(),
  applicationUrl: z.string().optional(),
  applicationEmail: z.string().optional(),
  applicationMethod: z.string().optional(),
});

router.post('/api/admin/jobs', async (req: Request, res: Response) => {
  try {
    const jobData = createJobSchema.parse(req.body);
    
    const [newJob] = await db
      .insert(jobs)
      .values({
        ...jobData,
        isActive: true,
      })
      .returning();
    
    res.json(newJob);
  } catch (error: any) {
    console.error('Error creating job:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid job data', details: error.errors });
    }
    
    res.status(500).json({ error: error.message || 'Failed to create job' });
  }
});

// Update job
router.patch('/api/admin/jobs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const [updatedJob] = await db
      .update(jobs)
      .set(updateData)
      .where(eq(jobs.id, id))
      .returning();
    
    if (!updatedJob) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(updatedJob);
  } catch (error: any) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: error.message || 'Failed to update job' });
  }
});

// Delete job
router.delete('/api/admin/jobs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [deletedJob] = await db
      .delete(jobs)
      .where(eq(jobs.id, id))
      .returning();
    
    if (!deletedJob) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ success: true, job: deletedJob });
  } catch (error: any) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: error.message || 'Failed to delete job' });
  }
});

// ============================================================
// USER MANAGEMENT
// ============================================================

// List all users
router.get('/api/admin/users', async (req: Request, res: Response) => {
  try {
    const { limit = '50', offset = '0', premium, search } = req.query;
    
    let query = db.select().from(users);
    
    if (premium === 'true') {
      query = query.where(eq(users.isPremium, true)) as any;
    } else if (premium === 'false') {
      query = query.where(eq(users.isPremium, false)) as any;
    }
    
    const userList = await query
      .orderBy(desc(users.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    // Get application counts
    const usersWithCounts = await Promise.all(
      userList.map(async (user) => {
        const appCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(applications)
          .where(eq(applications.userId, user.id));
        
        return {
          ...user,
          applicationCount: Number(appCount[0]?.count || 0),
        };
      })
    );

    res.json(usersWithCounts);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
});

// Get user details
router.get('/api/admin/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's applications
    const userApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, id))
      .orderBy(desc(applications.appliedAt))
      .limit(20);
    
    // Get user's badges
    const userBadges = await db
      .select()
      .from(badges)
      .where(eq(badges.userId, id))
      .orderBy(desc(badges.earnedAt));
    
    res.json({
      ...user,
      applications: userApplications,
      badges: userBadges,
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch user' });
  }
});

// Update user
router.patch('/api/admin/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message || 'Failed to update user' });
  }
});

// ============================================================
// APPLICATION MONITORING
// ============================================================

// List all applications
router.get('/api/admin/applications', async (req: Request, res: Response) => {
  try {
    const { status, limit = '100', offset = '0' } = req.query;
    
    let query = db
      .select({
        application: applications,
        job: jobs,
        user: users,
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .leftJoin(users, eq(applications.userId, users.id));
    
    if (status && status !== 'all') {
      query = query.where(eq(applications.status, status as string)) as any;
    }
    
    const appList = await query
      .orderBy(desc(applications.appliedAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json(appList);
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch applications' });
  }
});

// ============================================================
// ANALYTICS
// ============================================================

// Platform analytics
router.get('/api/admin/analytics', async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query;
    const days = Number(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Sign-ups over time
    const signupTrend = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(users)
      .where(gte(users.createdAt, startDate))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);
    
    // Applications over time
    const appTrend = await db
      .select({
        date: sql<string>`DATE(${applications.appliedAt})`,
        count: sql<number>`count(*)`,
      })
      .from(applications)
      .where(gte(applications.appliedAt, startDate))
      .groupBy(sql`DATE(${applications.appliedAt})`)
      .orderBy(sql`DATE(${applications.appliedAt})`);
    
    // Top jobs by applications
    const topJobs = await db
      .select({
        jobId: applications.jobId,
        jobTitle: jobs.title,
        company: jobs.company,
        count: sql<number>`count(*)`,
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .groupBy(applications.jobId, jobs.title, jobs.company)
      .orderBy(desc(sql`count(*)`))
      .limit(10);
    
    // Email vs manual applications
    const methodStats = await db
      .select({
        method: applications.submissionMethod,
        count: sql<number>`count(*)`,
      })
      .from(applications)
      .groupBy(applications.submissionMethod);

    res.json({
      signupTrend: signupTrend.map(s => ({
        date: s.date,
        count: Number(s.count),
      })),
      applicationTrend: appTrend.map(a => ({
        date: a.date,
        count: Number(a.count),
      })),
      topJobs: topJobs.map(j => ({
        jobId: j.jobId,
        title: j.jobTitle,
        company: j.company,
        applications: Number(j.count),
      })),
      methodStats: methodStats.map(m => ({
        method: m.method || 'unknown',
        count: Number(m.count),
      })),
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch analytics' });
  }
});

export default router;
