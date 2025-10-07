-- Create users table (for profile data - auth.users is managed by Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  location TEXT,
  nqf_level INTEGER,
  skills TEXT[],
  languages TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own data
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read active jobs
CREATE POLICY "Authenticated users can view active jobs" ON jobs
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, job_id)
);

-- Enable RLS on applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own applications
CREATE POLICY "Users can create own applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create user_experience table
CREATE TABLE IF NOT EXISTS user_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  duration TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on user_experience
ALTER TABLE user_experience ENABLE ROW LEVEL SECURITY;

-- Users can manage their own experience
CREATE POLICY "Users can view own experience" ON user_experience
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own experience" ON user_experience
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experience" ON user_experience
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experience" ON user_experience
  FOR DELETE USING (auth.uid() = user_id);

-- Create swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, job_id)
);

-- Enable RLS on swipes
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- Users can manage their own swipes
CREATE POLICY "Users can view own swipes" ON swipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own swipes" ON swipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert some sample jobs
INSERT INTO jobs (title, company, salary, location, sector, description, skills, nqf_level) VALUES
  ('Frontend Developer', 'Shoprite Digital', 'R25,000 - R35,000', 'Cape Town, Western Cape', 'Tech & IT', 'Join our dynamic team building the next generation of e-commerce solutions for South Africa. We''re looking for a passionate frontend developer with experience in modern web technologies.', ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Git'], 6),
  ('Customer Service Representative', 'MTN Group', 'R12,000 - R18,000', 'Johannesburg, Gauteng', 'Hospitality', 'Provide exceptional customer support to MTN clients. Handle inquiries, resolve issues, and ensure customer satisfaction in a fast-paced call center environment.', ARRAY['Communication', 'Customer Service', 'Problem Solving', 'English', 'Zulu'], 4),
  ('Junior Data Analyst', 'Discovery Limited', 'R20,000 - R28,000', 'Sandton, Johannesburg', 'Finance', 'Analyze data to support business decisions in the insurance and healthcare sector. Work with large datasets to identify trends and provide actionable insights.', ARRAY['Excel', 'SQL', 'Python', 'Data Visualization', 'Statistics'], 6),
  ('Sales Associate', 'Takealot', 'R8,000 - R12,000 + Commission', 'Durban, KwaZulu-Natal', 'E-commerce', 'Drive sales growth by engaging with customers, processing orders, and maintaining excellent service standards at South Africa''s leading online retailer.', ARRAY['Sales', 'Customer Service', 'Communication', 'Time Management'], 4),
  ('Solar Installation Technician', 'GreenTech Solutions', 'R15,000 - R22,000', 'Pretoria, Gauteng', 'Renewable Energy', 'Install and maintain solar panel systems for residential and commercial clients. Join the renewable energy revolution in South Africa.', ARRAY['Electrical Work', 'Solar Energy', 'Installation', 'Safety Protocols'], 5);
