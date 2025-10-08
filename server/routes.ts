import { Router, type Request, Response } from "express";
import { generateCoverLetter, parseResumeText } from "./ai-service";
import { z } from "zod";
import { db } from "./db";
import { users, jobs, applications, userExperience } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// Validation schemas
const processApplicationSchema = z.object({
  userId: z.string().min(1),
  jobId: z.string().min(1),
  applicationId: z.string().min(1),
});

const batchProcessSchema = z.object({
  userId: z.string().min(1),
});

const parseResumeSchema = z.object({
  resumeText: z.string().min(10),
});

const updateProfileSchema = z.object({
  userId: z.string().min(1),
  name: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  education: z.string().optional(),
  resumeText: z.string().optional(),
  resumeFileName: z.string().optional(),
  resumeUrl: z.string().optional(),
  resumeUploadedAt: z.string().optional(),
  preferredJobTitle: z.string().optional(),
  preferredSalary: z.string().optional(),
  preferredWorkType: z.string().optional(),
  nqfLevel: z.number().optional(),
});

// Helper function to check and update swipe limits
async function checkAndUpdateSwipeLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error("User not found");
  }

  // Check if premium user (unlimited swipes)
  if (user.isPremium) {
    return { allowed: true, remaining: -1 }; // -1 indicates unlimited
  }

  const now = new Date();
  const lastReset = user.lastSwipeResetAt ? new Date(user.lastSwipeResetAt) : null;
  
  // Check if we need to reset daily swipes
  const needsReset = !lastReset || 
    lastReset.getDate() !== now.getDate() ||
    lastReset.getMonth() !== now.getMonth() ||
    lastReset.getFullYear() !== now.getFullYear();

  if (needsReset) {
    // Reset swipes for new day
    await db
      .update(users)
      .set({
        swipesUsedToday: 0,
        lastSwipeResetAt: now,
      })
      .where(eq(users.id, userId));
    
    return { allowed: true, remaining: (user.dailySwipeLimit || 50) - 1 };
  }

  const swipesUsed = user.swipesUsedToday || 0;
  const swipeLimit = user.dailySwipeLimit || 50;
  
  if (swipesUsed >= swipeLimit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: swipeLimit - swipesUsed };
}

// Helper function to increment swipe count
async function incrementSwipeCount(userId: string): Promise<void> {
  await db
    .update(users)
    .set({
      swipesUsedToday: (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0].swipesUsedToday! + 1
    })
    .where(eq(users.id, userId));
}

// Helper function to process a single application
async function processSingleApplication(userId: string, jobId: string, applicationId: string) {
  // SECURITY: First verify the application exists and belongs to this user
  const [application] = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.id, applicationId),
        eq(applications.userId, userId)
      )
    )
    .limit(1);

  if (!application) {
    throw new Error("Application not found or access denied");
  }

  // Verify application is in pending state and not already processed
  if (application.status !== "pending" || application.aiProcessed) {
    throw new Error("Application has already been processed");
  }

  // Verify the jobId matches the application
  if (application.jobId !== jobId) {
    throw new Error("Job ID mismatch");
  }

  // Now safely fetch user data
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error("User not found");
  }

  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);

  if (!job) {
    throw new Error("Job not found");
  }

  const experience = await db
    .select()
    .from(userExperience)
    .where(eq(userExperience.userId, userId));

  const userProfile = {
    name: user.name ?? undefined,
    email: user.email,
    location: user.location ?? undefined,
    nqfLevel: user.nqfLevel ?? undefined,
    skills: user.skills ?? undefined,
    languages: user.languages ?? undefined,
    experience: experience || [],
  };

  const jobDetails = {
    title: job.title,
    company: job.company,
    description: job.description,
    skills: job.skills,
    location: job.location,
    salary: job.salary,
    sector: job.sector ?? undefined,
    nqfLevel: job.nqfLevel ?? undefined,
  };

  const coverLetter = await generateCoverLetter(userProfile, jobDetails);

  // Validate AI-generated content
  if (!coverLetter || coverLetter.length < 50) {
    throw new Error("Generated cover letter is too short or empty");
  }

  const applicationUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `${job.company} ${job.title} application South Africa`
  )}`;

  // Update the application with AI-generated content
  const [updatedApp] = await db
    .update(applications)
    .set({
      coverLetter: coverLetter,
      applicationUrl: applicationUrl,
      aiProcessed: true,
      status: "auto_applied",
    })
    .where(
      and(
        eq(applications.id, applicationId),
        eq(applications.userId, userId) // Security: double-check user owns the application
      )
    )
    .returning();

  // Verify the update actually occurred
  if (!updatedApp) {
    throw new Error("Update failed - application may have been modified");
  }

  return { coverLetter, applicationUrl };
}

router.post("/api/process-application", async (req: Request, res: Response) => {
  try {
    const validated = processApplicationSchema.parse(req.body);
    const { userId, jobId, applicationId } = validated;

    const result = await processSingleApplication(userId, jobId, applicationId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Error processing application:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    
    res.status(500).json({ error: error.message || "Failed to process application" });
  }
});

router.post("/api/batch-process-applications", async (req: Request, res: Response) => {
  try {
    const validated = batchProcessSchema.parse(req.body);
    const { userId } = validated;

    // Fetch pending applications
    const pendingApplications = await db
      .select({
        id: applications.id,
        jobId: applications.jobId,
      })
      .from(applications)
      .where(
        and(
          eq(applications.userId, userId),
          eq(applications.status, "pending"),
          eq(applications.aiProcessed, false)
        )
      )
      .limit(10); // Rate limiting: max 10 at a time to prevent abuse

    if (!pendingApplications || pendingApplications.length === 0) {
      return res.json({
        processed: 0,
        results: [],
        message: "No pending applications to process",
      });
    }

    // Process applications directly (no internal fetch)
    const results = [];
    const errors = [];
    
    for (const app of pendingApplications) {
      try {
        const result = await processSingleApplication(userId, app.jobId, app.id);
        results.push({ 
          applicationId: app.id, 
          success: true, 
          ...result 
        });
      } catch (error: any) {
        console.error(`Failed to process application ${app.id}:`, error.message);
        errors.push({ 
          applicationId: app.id, 
          success: false, 
          error: error.message 
        });
      }
    }

    res.json({
      processed: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error batch processing applications:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    
    res.status(500).json({ error: error.message || "Failed to batch process applications" });
  }
});

// Parse resume using AI
router.post("/api/parse-resume", async (req: Request, res: Response) => {
  try {
    const validated = parseResumeSchema.parse(req.body);
    const { resumeText } = validated;

    const parsedData = await parseResumeText(resumeText);

    res.json(parsedData);
  } catch (error: any) {
    console.error("Error parsing resume:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    
    res.status(500).json({ error: error.message || "Failed to parse resume" });
  }
});

// Update user profile
router.patch("/api/profile", async (req: Request, res: Response) => {
  try {
    const validated = updateProfileSchema.parse(req.body);
    const { userId, ...profileData } = validated;

    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(profileData).filter(([_, v]) => v !== undefined)
    );

    const [updatedUser] = await db
      .update(users)
      .set(cleanData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error: any) {
    console.error("Error updating profile:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    
    res.status(500).json({ error: error.message || "Failed to update profile" });
  }
});

// Get user profile
router.get("/api/profile/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: error.message || "Failed to fetch profile" });
  }
});

// Check swipe limits
router.get("/api/swipe-limits/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limitInfo = await checkAndUpdateSwipeLimit(userId);
    
    res.json(limitInfo);
  } catch (error: any) {
    console.error("Error checking swipe limits:", error);
    res.status(500).json({ error: error.message || "Failed to check swipe limits" });
  }
});

// Create swipe (with limit enforcement)
router.post("/api/swipe", async (req: Request, res: Response) => {
  try {
    const { userId, jobId, action } = req.body;

    if (!userId || !jobId || !action) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check swipe limits
    const limitInfo = await checkAndUpdateSwipeLimit(userId);
    
    if (!limitInfo.allowed) {
      return res.status(429).json({ 
        error: "Daily swipe limit reached", 
        remaining: 0,
        resetTime: "tomorrow"
      });
    }

    // Create swipe record
    const { swipes: swipesTable } = await import("@shared/schema");
    await db.insert(swipesTable).values({
      userId,
      jobId,
      action,
    });

    // Increment swipe count
    await incrementSwipeCount(userId);

    // If applying, create application
    if (action === 'apply') {
      const { applications: applicationsTable } = await import("@shared/schema");
      const [newApp] = await db.insert(applicationsTable).values({
        userId,
        jobId,
        status: 'pending',
      }).returning();

      return res.json({ 
        success: true, 
        remaining: limitInfo.remaining - 1,
        applicationId: newApp.id 
      });
    }

    res.json({ 
      success: true, 
      remaining: limitInfo.remaining - 1 
    });
  } catch (error: any) {
    console.error("Error creating swipe:", error);
    res.status(500).json({ error: error.message || "Failed to create swipe" });
  }
});

export default router;
