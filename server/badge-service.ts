import { db } from "./db";
import { badges, swipes, applications, users } from "@shared/schema";
import { eq, and, count } from "drizzle-orm";

// Badge definitions
export const BADGE_DEFINITIONS = {
  first_swipe: {
    badgeType: "first_swipe",
    title: "First Swipe",
    description: "Made your first swipe on a job",
    iconName: "Zap",
  },
  swipe_master_10: {
    badgeType: "swipe_master_10",
    title: "Swipe Enthusiast",
    description: "Swiped on 10 jobs",
    iconName: "Target",
  },
  swipe_master_50: {
    badgeType: "swipe_master_50",
    title: "Swipe Master",
    description: "Swiped on 50 jobs",
    iconName: "Flame",
  },
  first_application: {
    badgeType: "first_application",
    title: "Job Hunter",
    description: "Applied to your first job",
    iconName: "Briefcase",
  },
  application_streak_5: {
    badgeType: "application_streak_5",
    title: "Rising Star",
    description: "Applied to 5 jobs",
    iconName: "Star",
  },
  application_streak_10: {
    badgeType: "application_streak_10",
    title: "Career Climber",
    description: "Applied to 10 jobs",
    iconName: "TrendingUp",
  },
  application_streak_25: {
    badgeType: "application_streak_25",
    title: "Application Expert",
    description: "Applied to 25 jobs - you're unstoppable!",
    iconName: "Trophy",
  },
  profile_complete: {
    badgeType: "profile_complete",
    title: "Profile Pro",
    description: "Completed your profile with resume and preferences",
    iconName: "CheckCircle",
  },
  early_bird: {
    badgeType: "early_bird",
    title: "Early Bird",
    description: "Applied within 24 hours of job posting",
    iconName: "Sunrise",
  },
  referral_master: {
    badgeType: "referral_master",
    title: "Referral Master",
    description: "Referred your first friend to SwipeJob",
    iconName: "Users",
  },
};

/**
 * Check if user already has a badge
 */
async function hasBadge(userId: string, badgeType: string): Promise<boolean> {
  const [existing] = await db
    .select()
    .from(badges)
    .where(and(eq(badges.userId, userId), eq(badges.badgeType, badgeType)))
    .limit(1);

  return !!existing;
}

/**
 * Award a badge to a user
 */
async function awardBadge(userId: string, badgeType: keyof typeof BADGE_DEFINITIONS) {
  const badgeExists = await hasBadge(userId, badgeType);
  if (badgeExists) return null;

  const badgeDef = BADGE_DEFINITIONS[badgeType];
  
  const [newBadge] = await db
    .insert(badges)
    .values({
      userId,
      badgeType: badgeDef.badgeType,
      title: badgeDef.title,
      description: badgeDef.description,
      iconName: badgeDef.iconName,
    })
    .returning();

  return newBadge;
}

/**
 * Check and award swipe-related badges
 */
export async function checkSwipeBadges(userId: string) {
  const swipeCount = await db
    .select({ count: count() })
    .from(swipes)
    .where(eq(swipes.userId, userId));

  const total = swipeCount[0]?.count || 0;
  const newBadges = [];

  if (total === 1) {
    const badge = await awardBadge(userId, "first_swipe");
    if (badge) newBadges.push(badge);
  }
  
  if (total === 10) {
    const badge = await awardBadge(userId, "swipe_master_10");
    if (badge) newBadges.push(badge);
  }
  
  if (total === 50) {
    const badge = await awardBadge(userId, "swipe_master_50");
    if (badge) newBadges.push(badge);
  }

  return newBadges;
}

/**
 * Check and award application-related badges
 */
export async function checkApplicationBadges(userId: string) {
  const applicationCount = await db
    .select({ count: count() })
    .from(applications)
    .where(eq(applications.userId, userId));

  const total = applicationCount[0]?.count || 0;
  const newBadges = [];

  if (total === 1) {
    const badge = await awardBadge(userId, "first_application");
    if (badge) newBadges.push(badge);
  }
  
  if (total === 5) {
    const badge = await awardBadge(userId, "application_streak_5");
    if (badge) newBadges.push(badge);
  }
  
  if (total === 10) {
    const badge = await awardBadge(userId, "application_streak_10");
    if (badge) newBadges.push(badge);
  }
  
  if (total === 25) {
    const badge = await awardBadge(userId, "application_streak_25");
    if (badge) newBadges.push(badge);
  }

  return newBadges;
}

/**
 * Check and award profile completion badge
 */
export async function checkProfileBadge(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return [];

  // Check if profile is complete
  const isComplete = !!(
    user.resumeText &&
    user.skills &&
    user.skills.length > 0 &&
    user.preferredJobTitle &&
    user.preferredSalary &&
    user.location
  );

  if (isComplete) {
    const badge = await awardBadge(userId, "profile_complete");
    return badge ? [badge] : [];
  }

  return [];
}

/**
 * Check and award referral badge
 */
export async function checkReferralBadge(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.referralCode) return [];

  // Check if anyone used their referral code
  const referrals = await db
    .select()
    .from(users)
    .where(eq(users.referredBy, user.referralCode))
    .limit(1);

  if (referrals.length > 0) {
    const badge = await awardBadge(userId, "referral_master");
    return badge ? [badge] : [];
  }

  return [];
}

/**
 * Get all badges for a user
 */
export async function getUserBadges(userId: string) {
  return await db
    .select()
    .from(badges)
    .where(eq(badges.userId, userId))
    .orderBy(badges.earnedAt);
}
