-- ============================================
-- SwipeJob Database Setup - Run in Supabase SQL Editor
-- ============================================
-- Go to: https://supabase.com/dashboard/project/evdwovhikctwcjddcpzz/sql
-- Copy this entire file and click "Run"
-- ============================================

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS user_experience CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS swipes CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS user_analytics CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  location TEXT,
  nqf_level INTEGER,
  skills TEXT[],
  languages TEXT[],
  education TEXT,
  resume_text TEXT,
  resume_url TEXT,
  resume_file_name TEXT,
  resume_uploaded_at TIMESTAMP WITH TIME ZONE,
  preferred_job_title TEXT,
  preferred_salary TEXT,
  preferred_work_type TEXT DEFAULT 'remote',
  daily_swipe_limit INTEGER DEFAULT 50,
  swipes_used_today INTEGER DEFAULT 0,
  last_swipe_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_premium BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  salary TEXT NOT NULL,
  location TEXT NOT NULL,
  sector TEXT,
  description TEXT NOT NULL,
  skills TEXT[] NOT NULL,
  nqf_level INTEGER,
  is_active BOOLEAN DEFAULT true NOT NULL,
  application_url TEXT,
  application_email TEXT,
  application_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs
CREATE POLICY "Authenticated users can view active jobs" ON jobs
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  cover_letter TEXT,
  application_url TEXT,
  submission_method TEXT,
  email_sent_to TEXT,
  email_message_id TEXT,
  ai_processed BOOLEAN DEFAULT false NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, job_id)
);

-- Enable RLS on applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for applications
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON applications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- SWIPES TABLE
-- ============================================
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('left', 'right')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, job_id)
);

-- Enable RLS on swipes
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for swipes
CREATE POLICY "Users can view own swipes" ON swipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own swipes" ON swipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- USER EXPERIENCE TABLE
-- ============================================
CREATE TABLE user_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  duration TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on user_experience
ALTER TABLE user_experience ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_experience
CREATE POLICY "Users can view own experience" ON user_experience
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own experience" ON user_experience
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experience" ON user_experience
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experience" ON user_experience
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- BADGES TABLE
-- ============================================
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, badge_type)
);

-- Enable RLS on badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges
CREATE POLICY "Users can view own badges" ON badges
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- USER ANALYTICS TABLE
-- ============================================
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_swipes INTEGER DEFAULT 0,
  total_applications INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  interviews_scheduled INTEGER DEFAULT 0,
  application_conversion_rate TEXT DEFAULT '0%',
  profile_completion_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on user_analytics
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_analytics
CREATE POLICY "Users can view own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics" ON user_analytics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON user_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- PUSH SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, endpoint)
);

-- Enable RLS on push_subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- INTERVIEWS TABLE
-- ============================================
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  interview_date TIMESTAMP WITH TIME ZONE NOT NULL,
  interview_type TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on interviews
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for interviews
CREATE POLICY "Users can view own interviews" ON interviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own interviews" ON interviews
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Sample Jobs
INSERT INTO jobs (title, company, salary, location, sector, description, skills, nqf_level, application_email, application_method) VALUES
('Software Developer', 'Tech Corp SA', 'R35,000 - R55,000', 'Johannesburg', 'Technology', 'Looking for a skilled software developer to join our team. Work with modern technologies and build innovative solutions.', ARRAY['JavaScript', 'React', 'Node.js'], 7, 'careers@techcorp.co.za', 'email'),
('Data Analyst', 'Analytics Plus', 'R25,000 - R40,000', 'Cape Town', 'Technology', 'Analyze data, create reports, and provide insights. Experience with SQL and Python required.', ARRAY['SQL', 'Python', 'Excel'], 7, 'jobs@analyticsplus.co.za', 'email'),
('Marketing Manager', 'Brand Agency', 'R30,000 - R50,000', 'Durban', 'Marketing', 'Lead marketing campaigns and strategies. Digital marketing experience required.', ARRAY['Marketing', 'SEO', 'Social Media'], 6, 'hr@brandagency.co.za', 'email'),
('Junior Developer', 'StartupHub', 'R20,000 - R30,000', 'Remote', 'Technology', 'Entry-level position for aspiring developers. Training provided.', ARRAY['HTML', 'CSS', 'JavaScript'], 6, NULL, 'url'),
('Project Manager', 'Enterprise Solutions', 'R45,000 - R70,000', 'Johannesburg', 'Management', 'Manage projects from inception to completion. PMP certification preferred.', ARRAY['Project Management', 'Agile', 'Leadership'], 8, NULL, 'url');

-- ============================================
-- INDEXES for Performance
-- ============================================

CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_swipes_user_id ON swipes(user_id);
CREATE INDEX idx_swipes_job_id ON swipes(job_id);
CREATE INDEX idx_jobs_active ON jobs(is_active);
CREATE INDEX idx_jobs_sector ON jobs(sector);
CREATE INDEX idx_badges_user_id ON badges(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);

-- ============================================
-- FUNCTIONS for Automation
-- ============================================

-- Function to reset daily swipes at midnight
CREATE OR REPLACE FUNCTION reset_daily_swipes()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET swipes_used_today = 0,
      last_swipe_reset_at = NOW()
  WHERE last_swipe_reset_at < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '📊 Tables created: users, jobs, applications, swipes, badges, analytics, etc.';
  RAISE NOTICE '🔒 Row Level Security enabled on all tables';
  RAISE NOTICE '📝 Sample jobs added for testing';
  RAISE NOTICE '🚀 Ready to use!';
END $$;
