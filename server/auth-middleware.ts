// Backend Authentication Middleware - Sprint 10
import type { Request, Response, NextFunction } from "express";

/**
 * Middleware to extract and validate user from session (Express session-based)
 * Note: This is a placeholder for proper JWT/Supabase token verification
 * In production, this should verify JWT tokens from Supabase Auth
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
    
    // TODO: Verify Supabase JWT token using @supabase/auth-helpers-nextjs or similar
    // For now, we extract userId from the token payload (base64 decode middle segment)
    // This is NOT secure for production - it's a placeholder
    try {
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );
      
      if (payload.sub) {
        (req as any).user = { id: payload.sub };
        next();
      } else {
        return res.status(401).json({ error: "Invalid token" });
      }
    } catch {
      return res.status(401).json({ error: "Invalid token format" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ 
      error: "Authentication error" 
    });
  }
}

/**
 * Optional authentication - allows both authenticated and unauthenticated requests
 * but attaches user info if token is valid
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString()
        );
        
        if (payload.sub) {
          (req as any).user = { id: payload.sub };
        }
      } catch {
        // Invalid token - continue without auth
      }
    }
    
    next();
  } catch (error) {
    // Don't fail on auth errors for optional auth
    next();
  }
}

/**
 * Validate that the authenticated user matches the userId in request params
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
