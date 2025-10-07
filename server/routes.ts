import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabaseAdmin } from "./supabase";
import { insertSwipeSchema, insertApplicationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get jobs with optional filtering
  app.get("/api/jobs", async (req, res) => {
    try {
      const { sector, location, skills, minSalary, maxSalary, nqfLevel } = req.query;
      
      let query = supabaseAdmin
        .from('jobs')
        .select('*')
        .eq('is_active', true);

      if (sector) query = query.eq('sector', sector);
      if (location) query = query.ilike('location', `%${location}%`);
      if (nqfLevel) query = query.eq('nqf_level', parseInt(nqfLevel as string));

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get jobs for swiping (exclude already swiped)
  app.get("/api/jobs/swipe", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      // Get already swiped job IDs
      const { data: swipes } = await supabaseAdmin
        .from('swipes')
        .select('job_id')
        .eq('user_id', userId);

      const swipedJobIds = swipes?.map(s => s.job_id) || [];

      // Get jobs not yet swiped
      let query = supabaseAdmin
        .from('jobs')
        .select('*')
        .eq('is_active', true);

      if (swipedJobIds.length > 0) {
        query = query.not('id', 'in', `(${swipedJobIds.join(',')})`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Record a swipe
  app.post("/api/swipes", async (req, res) => {
    try {
      const validated = insertSwipeSchema.parse(req.body);
      
      const { data, error } = await supabaseAdmin
        .from('swipes')
        .insert(validated)
        .select()
        .single();

      if (error) throw error;

      // If action is "apply", also create an application
      if (validated.action === "apply") {
        const { error: appError } = await supabaseAdmin
          .from('applications')
          .insert({
            user_id: validated.userId,
            job_id: validated.jobId,
            status: 'pending'
          });

        if (appError) throw appError;
      }

      res.json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get user applications
  app.get("/api/applications", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const { data, error } = await supabaseAdmin
        .from('applications')
        .select(`
          *,
          jobs:job_id (
            id,
            title,
            company,
            salary,
            location
          )
        `)
        .eq('user_id', userId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user profile
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const { data: experience, error: expError } = await supabaseAdmin
        .from('user_experience')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (expError) throw expError;

      res.json({ ...user, experience });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update user profile
  app.patch("/api/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { experience, ...profileData } = req.body;

      const { data, error } = await supabaseAdmin
        .from('users')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Add user experience
  app.post("/api/experience", async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_experience')
        .insert(req.body)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
