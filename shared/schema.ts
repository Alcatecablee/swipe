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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Applications table
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default('gen_random_uuid()'),
  userId: varchar("user_id").notNull().references(() => users.id),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  status: text("status").notNull().default("pending"), // pending, reviewing, interview, accepted, rejected, auto_applied
  coverLetter: text("cover_letter"),
  applicationUrl: text("application_url"),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true, isActive: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, appliedAt: true });
export const insertUserExperienceSchema = createInsertSchema(userExperience).omit({ id: true, createdAt: true });
export const insertSwipeSchema = createInsertSchema(swipes).omit({ id: true, createdAt: true });
export const insertBadgeSchema = createInsertSchema(badges).omit({ id: true, earnedAt: true });

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
