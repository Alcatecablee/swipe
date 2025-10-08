import { Router, type Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { generateCoverLetter } from "./ai-service";

const router = Router();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

router.post("/api/process-application", async (req: Request, res: Response) => {
  try {
    const { userId, jobId, applicationId } = req.body;

    if (!userId || !jobId || !applicationId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return res.status(404).json({ error: "Job not found" });
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

    const applicationUrl = `https://www.google.com/search?q=${encodeURIComponent(
      `${job.company} ${job.title} application`
    )}`;

    const { error: updateError } = await supabase
      .from("applications")
      .update({
        cover_letter: coverLetter,
        application_url: applicationUrl,
        ai_processed: true,
        status: "auto_applied",
      })
      .eq("id", applicationId);

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      coverLetter,
      applicationUrl,
    });
  } catch (error: any) {
    console.error("Error processing application:", error);
    res.status(500).json({ error: error.message || "Failed to process application" });
  }
});

router.post("/api/batch-process-applications", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const { data: pendingApplications, error: appsError } = await supabase
      .from("applications")
      .select("id, job_id")
      .eq("user_id", userId)
      .eq("status", "pending")
      .eq("ai_processed", false);

    if (appsError) {
      throw appsError;
    }

    const results = [];
    for (const app of pendingApplications || []) {
      try {
        const response = await fetch(`${req.protocol}://${req.get("host")}/api/process-application`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            jobId: app.job_id,
            applicationId: app.id,
          }),
        });
        
        const data = await response.json();
        results.push({ applicationId: app.id, success: true, ...data });
      } catch (error: any) {
        results.push({ applicationId: app.id, success: false, error: error.message });
      }
    }

    res.json({
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error("Error batch processing applications:", error);
    res.status(500).json({ error: error.message || "Failed to batch process applications" });
  }
});

export default router;
