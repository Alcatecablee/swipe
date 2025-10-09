-- Migration: Add Email Application Support
-- Run this after supabase-schema.sql to add email application fields

-- Add email application fields to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS application_url TEXT,
ADD COLUMN IF NOT EXISTS application_email TEXT,
ADD COLUMN IF NOT EXISTS application_method TEXT;

-- Add submission tracking fields to applications table
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS submission_method TEXT,
ADD COLUMN IF NOT EXISTS email_sent_to TEXT,
ADD COLUMN IF NOT EXISTS email_message_id TEXT;

-- Create index for faster email application lookups
CREATE INDEX IF NOT EXISTS idx_jobs_application_method ON jobs(application_method);
CREATE INDEX IF NOT EXISTS idx_applications_submission_method ON applications(submission_method);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Update existing jobs to detect email applications
-- This will scan descriptions for email addresses
UPDATE jobs 
SET 
  application_email = (
    SELECT substring(description FROM '([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})')
    WHERE description ~ '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
  ),
  application_method = CASE
    WHEN description ~ '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' THEN 'email'
    WHEN application_url IS NOT NULL AND application_url != '' THEN 'url'
    ELSE 'unknown'
  END
WHERE application_method IS NULL;

-- Add sample jobs with email applications for testing
INSERT INTO jobs (title, company, salary, location, sector, description, skills, nqf_level, application_email, application_method) VALUES
  (
    'Digital Marketing Specialist',
    'Woolworths Holdings',
    'R18,000 - R25,000',
    'Cape Town, Western Cape',
    'Marketing',
    'We are looking for a creative digital marketing specialist to join our e-commerce team. Must have experience with SEO, social media marketing, and Google Analytics. To apply, please send your CV and portfolio to careers@woolworths.co.za',
    ARRAY['Digital Marketing', 'SEO', 'Social Media', 'Google Analytics', 'Content Creation'],
    6,
    'careers@woolworths.co.za',
    'email'
  ),
  (
    'Accountant - Entry Level',
    'PwC South Africa',
    'R22,000 - R30,000',
    'Johannesburg, Gauteng',
    'Finance',
    'Join our growing accounting team. Requirements: BCom Accounting, SAICA trainee status preferred. Please email your CV with subject "Entry Level Accountant" to recruitment.za@pwc.com',
    ARRAY['Accounting', 'Financial Reporting', 'Excel', 'Auditing', 'Tax'],
    7,
    'recruitment.za@pwc.com',
    'email'
  ),
  (
    'Customer Support Agent',
    'Takealot',
    'R10,000 - R15,000',
    'Cape Town, Western Cape',
    'E-commerce',
    'Help our customers have the best shopping experience! Fluent in English required. Send CV to: jobs@takealot.com with "Customer Support" in subject line.',
    ARRAY['Customer Service', 'Communication', 'Problem Solving', 'Email Support'],
    4,
    'jobs@takealot.com',
    'email'
  )
ON CONFLICT DO NOTHING;

-- Comment explaining the changes
COMMENT ON COLUMN jobs.application_email IS 'Email address for direct job applications';
COMMENT ON COLUMN jobs.application_method IS 'How to apply: email, url, or unknown';
COMMENT ON COLUMN applications.submission_method IS 'How application was submitted: email, manual, api, or automated';
COMMENT ON COLUMN applications.email_sent_to IS 'Email address where application was sent (if applicable)';
COMMENT ON COLUMN applications.email_message_id IS 'Email service message ID for tracking delivery';

-- Grant necessary permissions (adjust based on your RLS policies)
-- Users should be able to see application methods
-- CREATE POLICY "Users can view job application methods" ON jobs
--   FOR SELECT USING (auth.role() = 'authenticated');
