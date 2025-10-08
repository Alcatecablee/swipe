import { db } from "./db";
import { applications, jobs, users } from "@shared/schema";
import { eq, and, lt, gte, inArray } from "drizzle-orm";
import { sendFollowUpReminder } from "./push-notification-service";

// Configuration for follow-up reminder days
const FOLLOW_UP_REMINDER_DAYS = [3, 7, 14]; // Send reminders after 3, 7, and 14 days

/**
 * Check all pending applications and send follow-up reminders
 */
export async function checkAndSendFollowUpReminders(): Promise<{
  checked: number;
  sent: number;
  errors: number;
}> {
  try {
    const now = new Date();
    let totalChecked = 0;
    let totalSent = 0;
    let totalErrors = 0;

    // Check for each reminder day threshold
    for (const days of FOLLOW_UP_REMINDER_DAYS) {
      // Calculate date range in UTC to match database timestamps
      const nowUTC = new Date(now.toISOString().split('T')[0] + 'T00:00:00.000Z');
      const reminderDate = new Date(nowUTC);
      reminderDate.setUTCDate(reminderDate.getUTCDate() - days);
      
      const nextDay = new Date(reminderDate);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);

      // Find pending applications from exactly N days ago
      const pendingApplications = await db
        .select({
          id: applications.id,
          userId: applications.userId,
          jobId: applications.jobId,
          appliedAt: applications.appliedAt,
          status: applications.status,
        })
        .from(applications)
        .where(
          and(
            eq(applications.status, "pending"),
            gte(applications.appliedAt, reminderDate),
            lt(applications.appliedAt, nextDay)
          )
        );

      totalChecked += pendingApplications.length;

      // Send reminders for each application
      for (const app of pendingApplications) {
        try {
          // Get job details
          const [job] = await db
            .select()
            .from(jobs)
            .where(eq(jobs.id, app.jobId))
            .limit(1);

          if (!job) {
            console.warn(`Job ${app.jobId} not found for application ${app.id}`);
            continue;
          }

          // Send follow-up reminder
          await sendFollowUpReminder(
            app.userId,
            app.id,
            job.title,
            job.company,
            days
          );

          totalSent++;
          console.log(`Sent ${days}-day follow-up reminder for application ${app.id}`);
        } catch (error) {
          console.error(`Failed to send follow-up reminder for application ${app.id}:`, error);
          totalErrors++;
        }
      }
    }

    console.log(`Follow-up reminder check complete: ${totalChecked} checked, ${totalSent} sent, ${totalErrors} errors`);

    return {
      checked: totalChecked,
      sent: totalSent,
      errors: totalErrors,
    };
  } catch (error) {
    console.error("Error checking follow-up reminders:", error);
    throw error;
  }
}

/**
 * Get applications that need follow-up for a specific user
 */
export async function getUserApplicationsNeedingFollowUp(userId: string): Promise<{
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  daysSinceApplication: number;
}[]> {
  try {
    const now = new Date();

    // Get all pending applications for user
    const pendingApplications = await db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        appliedAt: applications.appliedAt,
      })
      .from(applications)
      .where(
        and(
          eq(applications.userId, userId),
          eq(applications.status, "pending")
        )
      );

    const results = [];

    for (const app of pendingApplications) {
      const appliedDate = new Date(app.appliedAt);
      const daysSince = Math.floor((now.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));

      // Only include if it's been at least 3 days
      if (daysSince >= 3) {
        // Get job details
        const [job] = await db
          .select()
          .from(jobs)
          .where(eq(jobs.id, app.jobId))
          .limit(1);

        if (job) {
          results.push({
            applicationId: app.id,
            jobId: app.jobId,
            jobTitle: job.title,
            companyName: job.company,
            daysSinceApplication: daysSince,
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Error getting applications needing follow-up:", error);
    throw error;
  }
}

/**
 * Send manual follow-up reminder for a specific application
 */
export async function sendManualFollowUpReminder(
  userId: string,
  applicationId: string
): Promise<void> {
  try {
    // Get application
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
      throw new Error("Application not found");
    }

    // Get job details
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, application.jobId))
      .limit(1);

    if (!job) {
      throw new Error("Job not found");
    }

    // Calculate days since application
    const now = new Date();
    const appliedDate = new Date(application.appliedAt);
    const daysSince = Math.floor((now.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));

    // Send follow-up reminder
    await sendFollowUpReminder(
      userId,
      applicationId,
      job.title,
      job.company,
      daysSince
    );

    console.log(`Sent manual follow-up reminder for application ${applicationId}`);
  } catch (error) {
    console.error("Error sending manual follow-up reminder:", error);
    throw error;
  }
}
