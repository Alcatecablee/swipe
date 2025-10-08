import webpush from "web-push";
import { db } from "./db";
import { pushSubscriptions, notifications } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import type { Notification } from "@shared/schema";

// VAPID keys for push notifications
// In production, these should be stored as environment variables
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "BNxNTvNf-2vkIx9C3WYlCE7IqGjQ1ZW5EZ0Nq8_L7-rFq2R8-VjD4_yTgW5pJYx0vN8C9fQ7rL3xY6wZ9sN0pQ8";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "aKH-V9X_7YqT3Z8nQ5wL2jR4pC6vB9xN1mK8fG7hD5sE3tU0";

// Configure web-push with VAPID details
webpush.setVapidDetails(
  "mailto:support@swipejob.co.za",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export interface PushNotificationPayload {
  title: string;
  message: string;
  actionUrl?: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

/**
 * Send a push notification to a specific user
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<void> {
  try {
    // Get all active push subscriptions for this user
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.isActive, true)
        )
      );

    if (subscriptions.length === 0) {
      console.log(`No active push subscriptions for user ${userId}`);
      return;
    }

    // Send push notification to all user's devices
    const promises = subscriptions.map(async (subscription) => {
      try {
        const pushPayload = JSON.stringify({
          title: payload.title,
          body: payload.message,
          icon: payload.icon || "/icon-192.png",
          badge: payload.badge || "/badge-72.png",
          tag: payload.tag || "notification",
          data: {
            url: payload.actionUrl || "/",
          },
        });

        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dhKey,
              auth: subscription.authKey,
            },
          },
          pushPayload
        );

        console.log(`Push notification sent to device ${subscription.id}`);
      } catch (error: any) {
        console.error(`Failed to send push to device ${subscription.id}:`, error.message);
        
        // If subscription is no longer valid, mark it as inactive
        if (error.statusCode === 410 || error.statusCode === 404) {
          await db
            .update(pushSubscriptions)
            .set({ isActive: false })
            .where(eq(pushSubscriptions.id, subscription.id));
        }
      }
    });

    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Error sending push notifications:", error);
    throw error;
  }
}

/**
 * Create a notification and send push notification
 */
export async function createAndSendNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  actionUrl?: string,
  applicationId?: string,
  jobId?: string
): Promise<Notification> {
  try {
    // Create in-app notification
    const [notification] = await db
      .insert(notifications)
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

    // Send push notification
    await sendPushNotificationToUser(userId, {
      title,
      message,
      actionUrl,
      tag: type,
    });

    return notification;
  } catch (error) {
    console.error("Error creating and sending notification:", error);
    throw error;
  }
}

/**
 * Send notification when application status changes
 */
export async function notifyApplicationStatusChange(
  userId: string,
  applicationId: string,
  jobTitle: string,
  companyName: string,
  newStatus: string
): Promise<void> {
  const statusMessages: Record<string, { title: string; message: string }> = {
    reviewing: {
      title: "Application Under Review",
      message: `Your application for ${jobTitle} at ${companyName} is being reviewed!`,
    },
    interview: {
      title: "Interview Invitation!",
      message: `You've been invited for an interview for ${jobTitle} at ${companyName}!`,
    },
    accepted: {
      title: "Congratulations!",
      message: `Your application for ${jobTitle} at ${companyName} has been accepted!`,
    },
    rejected: {
      title: "Application Update",
      message: `Unfortunately, your application for ${jobTitle} at ${companyName} was not successful this time.`,
    },
  };

  const statusMessage = statusMessages[newStatus];
  if (statusMessage) {
    await createAndSendNotification(
      userId,
      "application_status",
      statusMessage.title,
      statusMessage.message,
      `/applications/${applicationId}`,
      applicationId
    );
  }
}

/**
 * Send follow-up reminder for pending applications
 */
export async function sendFollowUpReminder(
  userId: string,
  applicationId: string,
  jobTitle: string,
  companyName: string,
  daysSinceApplication: number
): Promise<void> {
  await createAndSendNotification(
    userId,
    "follow_up_reminder",
    "Follow-up Reminder",
    `It's been ${daysSinceApplication} days since you applied to ${jobTitle} at ${companyName}. Consider following up!`,
    `/applications/${applicationId}`,
    applicationId
  );
}

export { VAPID_PUBLIC_KEY };
