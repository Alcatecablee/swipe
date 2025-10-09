import type { Request, Response, NextFunction } from "express";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Middleware to authenticate and validate Supabase JWT tokens
 * Extracts user information from valid tokens and attaches to request
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: "Unauthorized - No token provided" 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!supabase) {
      console.error("Supabase not configured - check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
      return res.status(500).json({ 
        error: "Authentication service not configured" 
      });
    }

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error("Token validation failed:", error?.message);
      return res.status(401).json({ 
        error: "Invalid or expired token" 
      });
    }
    
    // Attach authenticated user to request
    (req as any).user = { 
      id: user.id,
      email: user.email,
      ...user.user_metadata 
    };
    
    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ 
      error: "Authentication error: " + (error.message || "Unknown error")
    });
  }
}

/**
 * Optional authentication - allows both authenticated and unauthenticated requests
 * Attaches user info if token is valid, but doesn't block unauthenticated requests
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ') && supabase) {
      const token = authHeader.substring(7);
      
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        (req as any).user = { 
          id: user.id,
          email: user.email,
          ...user.user_metadata 
        };
      }
    }
    
    next();
  } catch (error) {
    // Don't fail on auth errors for optional auth - just continue without user
    next();
  }
}

/**
 * Validate that the authenticated user matches the userId in request params/body
 * This prevents users from accessing other users' data
 */
export function validateUserAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authenticatedUserId = (req as any).user?.id;
  const requestedUserId = req.params.userId || req.body.userId;
  
  if (!authenticatedUserId) {
    return res.status(401).json({ 
      error: "Unauthorized - Authentication required" 
    });
  }
  
  if (requestedUserId && authenticatedUserId !== requestedUserId) {
    return res.status(403).json({ 
      error: "Forbidden - Cannot access other user's data" 
    });
  }
  
  next();
}

/**
 * Extract userId from authenticated request
 * Use this instead of accepting userId from request body
 */
export function getUserId(req: Request): string | null {
  return (req as any).user?.id || null;
}
