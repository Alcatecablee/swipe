import { Router, type Request, Response } from "express";
import { generateCoverLetter, parseResumeText } from "./ai-service";
import { z } from "zod";
import { db } from "./db";
import { users, jobs, applications, userExperience, swipes } from "@shared/schema";
import { eq, and, not, inArray, desc } from "drizzle-orm";
import { rankJobsByMatch } from "./matching-service";
import Stripe from "stripe";

// Initialize Stripe (reference: blueprint:javascript_stripe)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-11-20.acacia" })
  : null;

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

// Get matched jobs for user (with smart ranking)
router.get("/api/jobs/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Get user profile for matching
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get already swiped job IDs
    const swipedJobs = await db
      .select({ jobId: swipes.jobId })
      .from(swipes)
      .where(eq(swipes.userId, userId));

    const swipedJobIds = swipedJobs.map((s) => s.jobId);

    // Get active jobs that haven't been swiped yet
    let query = db.select().from(jobs).where(eq(jobs.isActive, true));

    if (swipedJobIds.length > 0) {
      query = query.where(not(inArray(jobs.id, swipedJobIds))) as any;
    }

    const availableJobs = await query.limit(50);

    // Apply smart matching algorithm to rank jobs
    const rankedJobs = rankJobsByMatch(user, availableJobs);

    // Return top 20 best matches
    res.json(rankedJobs.slice(0, 20));
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: error.message || "Failed to fetch jobs" });
  }
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

    // Check for swipe badges
    const { checkSwipeBadges, checkApplicationBadges } = await import("./badge-service");
    const swipeBadges = await checkSwipeBadges(userId);

    // If applying, create application
    if (action === 'apply') {
      const { applications: applicationsTable } = await import("@shared/schema");
      const [newApp] = await db.insert(applicationsTable).values({
        userId,
        jobId,
        status: 'pending',
      }).returning();

      // Get job details for notification
      const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

      // Send notification about successful application
      if (job) {
        const { createAndSendNotification } = await import("./push-notification-service");
        await createAndSendNotification(
          userId,
          "application_status",
          "Application Submitted!",
          `Your application for ${job.title} at ${job.company} has been submitted successfully.`,
          `/applications/${newApp.id}`,
          newApp.id,
          jobId
        ).catch(err => console.error("Failed to send application notification:", err));
      }

      // Check for application badges
      const appBadges = await checkApplicationBadges(userId);
      const allNewBadges = [...swipeBadges, ...appBadges];

      // Send notifications for new badges
      if (allNewBadges.length > 0) {
        const { createAndSendNotification } = await import("./push-notification-service");
        for (const badge of allNewBadges) {
          await createAndSendNotification(
            userId,
            "badge_earned",
            "New Achievement! 🏆",
            `You've earned the "${badge.title}" badge!`,
            `/profile`
          ).catch(err => console.error("Failed to send badge notification:", err));
        }
      }

      return res.json({ 
        success: true, 
        remaining: limitInfo.remaining - 1,
        applicationId: newApp.id,
        newBadges: allNewBadges
      });
    }

    res.json({ 
      success: true, 
      remaining: limitInfo.remaining - 1,
      newBadges: swipeBadges
    });
  } catch (error: any) {
    console.error("Error creating swipe:", error);
    res.status(500).json({ error: error.message || "Failed to create swipe" });
  }
});

// Generate referral code
function generateReferralCode(userId: string): string {
  return `SJ${userId.substring(0, 6).toUpperCase()}`;
}

// Apply referral code
router.post("/api/apply-referral", async (req: Request, res: Response) => {
  try {
    const { userId, referralCode } = req.body;

    if (!userId || !referralCode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find user with this referral code
    const [referrer] = await db
      .select()
      .from(users)
      .where(eq(users.referralCode, referralCode))
      .limit(1);

    if (!referrer) {
      return res.status(404).json({ error: "Invalid referral code" });
    }

    if (referrer.id === userId) {
      return res.status(400).json({ error: "Cannot use your own referral code" });
    }

    // Check if user already used a referral
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (currentUser.referredBy) {
      return res.status(400).json({ error: "You've already used a referral code" });
    }

    // Apply referral: Give both users bonus swipes
    await db
      .update(users)
      .set({
        dailySwipeLimit: (currentUser.dailySwipeLimit || 50) + 25, // +25 bonus swipes
        referredBy: referralCode,
      })
      .where(eq(users.id, userId));

    // Give referrer bonus swipes
    await db
      .update(users)
      .set({
        dailySwipeLimit: (referrer.dailySwipeLimit || 50) + 10, // +10 bonus for referrer
      })
      .where(eq(users.id, referrer.id));

    res.json({ 
      success: true,
      bonusSwipes: 25,
      message: "Referral applied! You received 25 bonus swipes!" 
    });
  } catch (error: any) {
    console.error("Error applying referral:", error);
    res.status(500).json({ error: error.message || "Failed to apply referral code" });
  }
});

// Get referral stats
router.get("/api/referral-stats/:userId", async (req: Request, res: Response) => {
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

    // Generate referral code if not exists
    if (!user.referralCode) {
      const newCode = generateReferralCode(userId);
      await db
        .update(users)
        .set({ referralCode: newCode })
        .where(eq(users.id, userId));
      
      user.referralCode = newCode;
    }

    // Count referrals
    const referrals = await db
      .select()
      .from(users)
      .where(eq(users.referredBy, user.referralCode!));

    res.json({
      referralCode: user.referralCode,
      totalReferrals: referrals.length,
      bonusSwipesEarned: referrals.length * 10,
    });
  } catch (error: any) {
    console.error("Error getting referral stats:", error);
    res.status(500).json({ error: error.message || "Failed to get referral stats" });
  }
});

// Get user badges
router.get("/api/badges/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { getUserBadges } = await import("./badge-service");
    const userBadges = await getUserBadges(userId);
    res.json(userBadges);
  } catch (error: any) {
    console.error("Error fetching badges:", error);
    res.status(500).json({ error: error.message || "Failed to fetch badges" });
  }
});

// Auto-apply: Generate application data for external ATS
router.post("/api/generate-application-data", async (req: Request, res: Response) => {
  try {
    const { userId, jobId } = req.body;

    if (!userId || !jobId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

    if (!user || !job) {
      return res.status(404).json({ error: "User or job not found" });
    }

    const { generateApplicationData } = await import("./auto-apply-service");
    const applicationData = await generateApplicationData(user, job);

    res.json(applicationData);
  } catch (error: any) {
    console.error("Error generating application data:", error);
    res.status(500).json({ error: error.message || "Failed to generate application data" });
  }
});

// Auto-apply: Extract ATS keywords from job
router.post("/api/extract-ats-keywords", async (req: Request, res: Response) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: "Missing jobId" });
    }

    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const { extractATSKeywords } = await import("./auto-apply-service");
    const keywords = await extractATSKeywords(job.description);

    res.json(keywords);
  } catch (error: any) {
    console.error("Error extracting ATS keywords:", error);
    res.status(500).json({ error: error.message || "Failed to extract keywords" });
  }
});

// Interview prep: Generate practice questions
router.post("/api/generate-interview-questions", async (req: Request, res: Response) => {
  try {
    const { userId, jobId } = req.body;

    if (!userId || !jobId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

    if (!user || !job) {
      return res.status(404).json({ error: "User or job not found" });
    }

    const { generateInterviewQuestions } = await import("./interview-prep-service");
    const questions = await generateInterviewQuestions(user, job);

    res.json(questions);
  } catch (error: any) {
    console.error("Error generating interview questions:", error);
    res.status(500).json({ error: error.message || "Failed to generate questions" });
  }
});

// Interview prep: Get answer suggestion
router.post("/api/interview-answer-suggestion", async (req: Request, res: Response) => {
  try {
    const { userId, jobId, question } = req.body;

    if (!userId || !jobId || !question) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

    if (!user || !job) {
      return res.status(404).json({ error: "User or job not found" });
    }

    const { generateAnswerSuggestion } = await import("./interview-prep-service");
    const suggestion = await generateAnswerSuggestion(question, user, job);

    res.json(suggestion);
  } catch (error: any) {
    console.error("Error generating answer suggestion:", error);
    res.status(500).json({ error: error.message || "Failed to generate suggestion" });
  }
});

// Interview prep: Analyze practice answer
router.post("/api/analyze-interview-answer", async (req: Request, res: Response) => {
  try {
    const { jobId, question, userAnswer } = req.body;

    if (!jobId || !question || !userAnswer) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const { analyzeInterviewAnswer } = await import("./interview-prep-service");
    const feedback = await analyzeInterviewAnswer(question, userAnswer, job);

    res.json(feedback);
  } catch (error: any) {
    console.error("Error analyzing interview answer:", error);
    res.status(500).json({ error: error.message || "Failed to analyze answer" });
  }
});

// Premium subscription endpoint (reference: blueprint:javascript_stripe)
router.post("/api/create-subscription", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured. Please add STRIPE_SECRET_KEY to environment." });
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If user already has subscription, return existing
    if (user.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
      return;
    }

    // Create Stripe customer if doesn't exist
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      await db
        .update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, userId));
    }

    // Create subscription (R399/month for South African market)
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price_data: {
          currency: 'zar', // South African Rand
          product_data: {
            name: 'SwipeJob Premium',
            description: 'Unlimited swipes, priority matching, AI auto-apply',
          },
          unit_amount: 39900, // R399 in cents
          recurring: {
            interval: 'month',
          },
        },
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Update user with subscription ID
    await db
      .update(users)
      .set({ 
        stripeSubscriptionId: subscription.id,
        isPremium: true,
      })
      .where(eq(users.id, userId));

    res.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
    });
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: error.message || "Failed to create subscription" });
  }
});

// Update application status and send notification
router.patch("/api/applications/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, userId } = req.body;

    if (!status || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get the application
    const [application] = await db
      .select()
      .from(applications)
      .where(and(
        eq(applications.id, id),
        eq(applications.userId, userId)
      ))
      .limit(1);

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Update status
    const [updatedApp] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();

    // Get job details
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, application.jobId))
      .limit(1);

    // Send notification for status change
    if (job) {
      const { notifyApplicationStatusChange } = await import("./push-notification-service");
      await notifyApplicationStatusChange(
        userId,
        id,
        job.title,
        job.company,
        status
      ).catch(err => console.error("Failed to send status change notification:", err));
    }

    res.json(updatedApp);
  } catch (error: any) {
    console.error("Error updating application status:", error);
    res.status(500).json({ error: error.message || "Failed to update application status" });
  }
});

// Sprint 7: Notifications & Tracking API Endpoints

// Get VAPID public key for push notifications
router.get("/api/push-vapid-key", async (_req: Request, res: Response) => {
  try {
    const { VAPID_PUBLIC_KEY } = await import("./push-notification-service");
    res.json({ publicKey: VAPID_PUBLIC_KEY });
  } catch (error: any) {
    console.error("Error getting VAPID key:", error);
    res.status(500).json({ error: error.message || "Failed to get VAPID key" });
  }
});

// Get user notifications
router.get("/api/notifications/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { notifications: notificationsTable } = await import("@shared/schema");

    const userNotifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt));

    res.json(userNotifications);
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: error.message || "Failed to fetch notifications" });
  }
});

// Create notification (internal use by system)
router.post("/api/notifications", async (req: Request, res: Response) => {
  try {
    const { userId, type, title, message, actionUrl, applicationId, jobId } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { notifications: notificationsTable } = await import("@shared/schema");
    const [notification] = await db
      .insert(notificationsTable)
      .values({
        userId,
        type,
        title,
        message,
        actionUrl,
        applicationId,
        jobId,
      })
      .returning();

    res.json(notification);
  } catch (error: any) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: error.message || "Failed to create notification" });
  }
});

// Mark notification as read
router.patch("/api/notifications/:id/read", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notifications: notificationsTable } = await import("@shared/schema");

    const [notification] = await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, id))
      .returning();

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: error.message || "Failed to mark notification as read" });
  }
});

// Mark all notifications as read
router.patch("/api/notifications/mark-all-read/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { notifications: notificationsTable } = await import("@shared/schema");

    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(and(
        eq(notificationsTable.userId, userId),
        eq(notificationsTable.isRead, false)
      ));

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: error.message || "Failed to mark all notifications as read" });
  }
});

// Subscribe to push notifications
router.post("/api/push-subscriptions", async (req: Request, res: Response) => {
  try {
    const { userId, endpoint, p256dhKey, authKey, userAgent } = req.body;

    if (!userId || !endpoint || !p256dhKey || !authKey) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { pushSubscriptions } = await import("@shared/schema");

    // Check if subscription already exists
    const [existing] = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .limit(1);

    if (existing) {
      // Update existing subscription
      const [updated] = await db
        .update(pushSubscriptions)
        .set({ isActive: true, userAgent })
        .where(eq(pushSubscriptions.id, existing.id))
        .returning();
      
      return res.json(updated);
    }

    // Create new subscription
    const [subscription] = await db
      .insert(pushSubscriptions)
      .values({
        userId,
        endpoint,
        p256dhKey,
        authKey,
        userAgent,
      })
      .returning();

    res.json(subscription);
  } catch (error: any) {
    console.error("Error subscribing to push notifications:", error);
    res.status(500).json({ error: error.message || "Failed to subscribe" });
  }
});

// Unsubscribe from push notifications
router.delete("/api/push-subscriptions/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { pushSubscriptions } = await import("@shared/schema");

    await db
      .update(pushSubscriptions)
      .set({ isActive: false })
      .where(eq(pushSubscriptions.id, id));

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error unsubscribing from push notifications:", error);
    res.status(500).json({ error: error.message || "Failed to unsubscribe" });
  }
});

// Get unread notification count
router.get("/api/notifications/unread-count/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { notifications: notificationsTable } = await import("@shared/schema");

    const unreadNotifications = await db
      .select()
      .from(notificationsTable)
      .where(and(
        eq(notificationsTable.userId, userId),
        eq(notificationsTable.isRead, false)
      ));

    res.json({ count: unreadNotifications.length });
  } catch (error: any) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ error: error.message || "Failed to get unread count" });
  }
});

// Follow-up reminder endpoints - Sprint 7

// Trigger automated follow-up reminder check (for cron jobs)
router.post("/api/follow-up-reminders/check", async (_req: Request, res: Response) => {
  try {
    const { checkAndSendFollowUpReminders } = await import("./follow-up-reminder-service");
    const result = await checkAndSendFollowUpReminders();
    res.json(result);
  } catch (error: any) {
    console.error("Error checking follow-up reminders:", error);
    res.status(500).json({ error: error.message || "Failed to check follow-up reminders" });
  }
});

// Get applications needing follow-up for a user
router.get("/api/follow-up-reminders/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { getUserApplicationsNeedingFollowUp } = await import("./follow-up-reminder-service");
    const applications = await getUserApplicationsNeedingFollowUp(userId);
    res.json(applications);
  } catch (error: any) {
    console.error("Error getting applications needing follow-up:", error);
    res.status(500).json({ error: error.message || "Failed to get applications" });
  }
});

// Send manual follow-up reminder
router.post("/api/follow-up-reminders/send", async (req: Request, res: Response) => {
  try {
    const { userId, applicationId } = req.body;
    
    if (!userId || !applicationId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { sendManualFollowUpReminder } = await import("./follow-up-reminder-service");
    await sendManualFollowUpReminder(userId, applicationId);
    
    res.json({ success: true, message: "Follow-up reminder sent successfully" });
  } catch (error: any) {
    console.error("Error sending manual follow-up reminder:", error);
    res.status(500).json({ error: error.message || "Failed to send follow-up reminder" });
  }
});

export default router;
