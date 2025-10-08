import { Router, type Request, Response } from "express";
import { generateCoverLetter } from "./ai-service";
import { z } from "zod";
import { db } from "./db";
import { applications, users, jobs, userExperience } from "../shared/schema";
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

// Helper function to process a single application
async function processSingleApplication(userId: string, jobId: string, applicationId: string) {
  // SECURITY: First verify the application exists and belongs to this user
  const application = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.id, applicationId),
        eq(applications.userId, userId)
      )
    )
    .limit(1)
    .then(rows => rows[0]);

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
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .then(rows => rows[0]);

  if (!user) {
    throw new Error("User not found");
  }

  const job = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1)
    .then(rows => rows[0]);

  if (!job) {
    throw new Error("Job not found");
  }

  const experience = await db
    .select()
    .from(userExperience)
    .where(eq(userExperience.userId, userId));

  const userProfile = {
    name: user.name || undefined,
    email: user.email,
    location: user.location || undefined,
    nqfLevel: user.nqfLevel || undefined,
    skills: user.skills || undefined,
    languages: user.languages || undefined,
    experience: experience || [],
  };

  const jobDetails = {
    title: job.title,
    company: job.company,
    description: job.description,
    skills: job.skills,
    location: job.location,
    salary: job.salary,
    sector: job.sector,
    nqfLevel: job.nqfLevel,
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
  const updatedApp = await db
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
    .returning()
    .then(rows => rows[0]);

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
      .select({ id: applications.id, jobId: applications.jobId })
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

export default router;
