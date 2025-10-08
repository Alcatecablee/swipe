-- Add resume fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS resume_file_name TEXT,
ADD COLUMN IF NOT EXISTS resume_uploaded_at TIMESTAMP;

-- Add work_type field to jobs table for remote/hybrid/onsite
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS work_type TEXT;

-- Create index for faster resume queries
CREATE INDEX IF NOT EXISTS idx_users_resume_url ON users(resume_url);

-- Create index for work_type filtering
CREATE INDEX IF NOT EXISTS idx_jobs_work_type ON jobs(work_type);
