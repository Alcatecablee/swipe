import type { Request, Response } from "express";

// Simple health check endpoint that doesn't need database
export default async function handler(req: Request, res: Response) {
  try {
    // Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
      hasGroqKey: !!process.env.GROQ_API_KEY,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlFormat: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.substring(0, 30) + "..." : 
        "NOT SET"
    };

    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: envCheck,
      message: "Health check passed"
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      error: error.message,
      stack: error.stack
    });
  }
}
