import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - managed by Supabase Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  location: text("location"),
  nqfLevel: integer("nqf_level"),
  skills: text("skills").array(),
  languages: text("languages").array(),
  education: text("education"),
  resumeUrl: text("resume_url"),
  resumeFileName: text("resume_file_name"),
  resumeText: text("resume_text"),
  resumeUploadedAt: timestamp("resume_uploaded_at"),
  preferredJobTitle: text("preferred_job_title"),
  preferredSalary: text("preferred_salary"),
  preferredWorkType: text("preferred_work_type"),
  dailySwipeLimit: integer("daily_swipe_limit").default(50),
  swipesUsedToday: integer("swipes_used_today").default(0),
  lastSwipeResetAt: timestamp("last_swipe_reset_at"),
  referralCode: text("referral_code").unique(),
  referredBy: text("referred_by"),
  isPremium: boolean("is_premium").default(false),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default('gen_random_uuid()'),
  title: text("title").notNull(),
  company: text("company").notNull(),
  salary: text("salary").notNull(),
  location: text("location").notNull(),
  sector: text("sector"),
  description: text("description").notNull(),
  skills: text("skills").array().notNull(),
  nqfLevel: integer("nqf_level"),
  isActive: boolean("is_active").default(true).notNull(),
  workType: text("work_type"),  // remote, hybrid, onsite
  applicationUrl: text("application_url"), // URL to apply on external site
  applicationEmail: text("application_email"), // Email for direct applications
  applicationMethod: text("application_method"), // 'email', 'url', 'unknown'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Applications table
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default('gen_random_uuid()'),
  userId: varchar("user_id").notNull().references(() => users.id),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  status: text("status").notNull().default("pending"), // pending, reviewing, interview, accepted, rejected, submitted, failed
  coverLetter: text("cover_letter"),
  applicationUrl: text("application_url"),
  submissionMethod: text("submission_method"), // 'email', 'manual', 'api', 'automated'
  emailSentTo: text("email_sent_to"), // Email address where application was sent
  emailMessageId: text("email_message_id"), // Email service message ID for tracking
  aiProcessed: boolean("ai_processed").default(false).notNull(),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
});

// User experience table
export const userExperience = pgTable("user_experience", {
  id: varchar("id").primaryKey().default('gen_random_uuid()'),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull(),
  company: text("company").notNull(),
  duration: text("duration").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Swipes table - track user swipes
export const swipes = pgTable("swipes", {
  id: varchar("id").primaryKey().default('gen_random_uuid()'),
  userId: varchar("user_id").notNull().references(() => users.id),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  action: text("action").notNull(), // "skip" or "apply"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Achievement badges
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default('gen_random_uuid()'),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeType: text("badge_type").notNull(), // "first_swipe", "10_applications", "profile_complete", etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  iconName: text("icon_name").notNull(), // lucide icon name
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// Notifications table - Sprint 7
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default('gen_random_uuid()'),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "application_status", "profile_viewed", "interview_invite", "follow_up_reminder", "badge_earned"
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  actionUrl: text("action_url"), // URL to navigate when clicked
  applicationId: varchar("application_id").references(() => applications.id),
  jobId: varchar("job_id").references(() => jobs.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Push subscriptions for web push notifications - Sprint 7
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default('gen_random_uuid()'),
  userId: varchar("user_id").notNull().references(() => users.id),
  endpoint: text("endpoint").notNull().unique(),
  p256dhKey: text("p256dh_key").notNull(),
  authKey: text("auth_key").notNull(),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Profile views - Track when employers/users view profiles
export const profileViews = pgTable("profile_views", {
  id: varchar("id").primaryKey().default('gen_random_uuid()'),
  viewedUserId: varchar("viewed_user_id").notNull().references(() => users.id), // User being viewed
  viewerUserId: varchar("viewer_user_id").references(() => users.id), // User viewing (null for employers)
  viewerType: text("viewer_type").notNull(), // "employer", "user", "recruiter"
  companyName: text("company_name"), // Company name if employer
  jobId: varchar("job_id").references(() => jobs.id), // Related job if applicable
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Interview schedule - Track scheduled interviews
export const interviewSchedule = pgTable("interview_schedule", {
  id: varchar("id").primaryKey().default('gen_random_uuid()'),
  userId: varchar("user_id").notNull().references(() => users.id),
  applicationId: varchar("application_id").references(() => applications.id),
  jobId: varchar("job_id").references(() => jobs.id),
  interviewType: text("interview_type").notNull(), // "phone", "video", "in_person", "technical"
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").default(60), // minutes
  location: text("location"), // Physical address or video link
  notes: text("notes"),
  status: text("status").notNull().default("scheduled"), // "scheduled", "completed", "cancelled", "rescheduled"
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User analytics - Track user engagement and conversion metrics
export const userAnalytics = pgTable("user_analytics", {
  id: varchar("id").primaryKey().default('gen_random_uuid()'),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  totalSwipes: integer("total_swipes").default(0),
  totalApplications: integer("total_applications").default(0),
  profileViews: integer("profile_views").default(0),
  interviewsScheduled: integer("interviews_scheduled").default(0),
  hiredCount: integer("hired_count").default(0),
  applicationConversionRate: text("application_conversion_rate"), // e.g., "15%"
  avgResponseTime: text("avg_response_time"), // e.g., "3 days"
  profileCompletionScore: integer("profile_completion_score").default(0), // 0-100
  lastActivityAt: timestamp("last_activity_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true, isActive: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, appliedAt: true });
export const insertUserExperienceSchema = createInsertSchema(userExperience).omit({ id: true, createdAt: true });
export const insertSwipeSchema = createInsertSchema(swipes).omit({ id: true, createdAt: true });
export const insertBadgeSchema = createInsertSchema(badges).omit({ id: true, earnedAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({ id: true, createdAt: true });
export const insertProfileViewSchema = createInsertSchema(profileViews).omit({ id: true, createdAt: true });
export const insertInterviewScheduleSchema = createInsertSchema(interviewSchedule).omit({ id: true, createdAt: true });
export const insertUserAnalyticsSchema = createInsertSchema(userAnalytics).omit({ id: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type UserExperience = typeof userExperience.$inferSelect;
export type InsertUserExperience = z.infer<typeof insertUserExperienceSchema>;
export type Swipe = typeof swipes.$inferSelect;
export type InsertSwipe = z.infer<typeof insertSwipeSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type ProfileView = typeof profileViews.$inferSelect;
export type InsertProfileView = z.infer<typeof insertProfileViewSchema>;
export type InterviewSchedule = typeof interviewSchedule.$inferSelect;
export type InsertInterviewSchedule = z.infer<typeof insertInterviewScheduleSchema>;
export type UserAnalytics = typeof userAnalytics.$inferSelect;
export type InsertUserAnalytics = z.infer<typeof insertUserAnalyticsSchema>;
