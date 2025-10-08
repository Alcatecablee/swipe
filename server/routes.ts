import { Router, type Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { generateCoverLetter } from "./ai-service";
import { z } from "zod";

const router = Router();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .eq("user_id", userId)
    .single();

  if (appError || !application) {
    throw new Error("Application not found or access denied");
  }

  // Verify application is in pending state and not already processed
  if (application.status !== "pending" || application.ai_processed) {
    throw new Error("Application has already been processed");
  }

  // Verify the jobId matches the application
  if (application.job_id !== jobId) {
    throw new Error("Job ID mismatch");
  }

  // Now safely fetch user data
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (userError || !user) {
    throw new Error("User not found");
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    throw new Error("Job not found");
  }

  const { data: experience } = await supabase
    .from("user_experience")
    .select("*")
    .eq("user_id", userId);

  const userProfile = {
    name: user.name,
    email: user.email,
    location: user.location,
    nqfLevel: user.nqf_level,
    skills: user.skills,
    languages: user.languages,
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
    nqfLevel: job.nqf_level,
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
  const { data: updatedApp, error: updateError } = await supabase
    .from("applications")
    .update({
      cover_letter: coverLetter,
      application_url: applicationUrl,
      ai_processed: true,
      status: "auto_applied",
    })
    .eq("id", applicationId)
    .eq("user_id", userId) // Security: double-check user owns the application
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to update application: ${updateError.message}`);
  }

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
    const { data: pendingApplications, error: appsError } = await supabase
      .from("applications")
      .select("id, job_id")
      .eq("user_id", userId)
      .eq("status", "pending")
      .eq("ai_processed", false)
      .limit(10); // Rate limiting: max 10 at a time to prevent abuse

    if (appsError) {
      throw appsError;
    }

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
        const result = await processSingleApplication(userId, app.job_id, app.id);
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
