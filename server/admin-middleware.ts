import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { getUserId } from './auth-middleware';

/**
 * Admin Middleware
 * Checks if authenticated user has admin privileges
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user is admin
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // User is admin, proceed
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
