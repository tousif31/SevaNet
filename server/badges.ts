import { User, badgeDefinitions } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";

/**
 * Check if user qualifies for new badges based on their activity counts
 * and award badges accordingly
 */
export async function checkAndAwardBadges(userId: number): Promise<string[]> {
  // Get user data
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user) {
    return [];
  }
  
  // Extract badge IDs the user already has
  const existingBadges = user.badges as string[] || [];
  const newBadges: string[] = [];
  
  // Check each badge definition to see if user qualifies
  for (const badge of badgeDefinitions) {
    // Skip if user already has this badge
    if (existingBadges.includes(badge.id)) {
      continue;
    }
    
    // Check if user meets criteria
    let meetsRequirement = false;
    
    switch (badge.criteria.type) {
      case 'reports':
        meetsRequirement = (user.reportCount || 0) >= badge.criteria.count;
        break;
      case 'updates':
        meetsRequirement = (user.updateCount || 0) >= badge.criteria.count;
        break;
      case 'completed':
        meetsRequirement = (user.completedCount || 0) >= badge.criteria.count;
        break;
    }
    
    // Award badge if criteria is met
    if (meetsRequirement) {
      newBadges.push(badge.id);
    }
  }
  
  // If user earned new badges, update their profile
  if (newBadges.length > 0) {
    const updatedBadges = [...existingBadges, ...newBadges];
    
    await db
      .update(users)
      .set({ badges: updatedBadges })
      .where(eq(users.id, userId));
  }
  
  return newBadges;
}

/**
 * Update user activity counters when they perform an action
 */
export async function updateUserActivity(
  userId: number, 
  activityType: 'report' | 'update' | 'completed'
): Promise<void> {
  // Get current user
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user) {
    return;
  }
  
  // Update the appropriate counter
  const updates: Partial<typeof user> = {};
  
  switch (activityType) {
    case 'report':
      updates.reportCount = (user.reportCount || 0) + 1;
      break;
    case 'update':
      updates.updateCount = (user.updateCount || 0) + 1;
      break;
    case 'completed':
      updates.completedCount = (user.completedCount || 0) + 1;
      break;
  }
  
  // Update the user record
  await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId));
    
  // Check for new badges
  await checkAndAwardBadges(userId);
}