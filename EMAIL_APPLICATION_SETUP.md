# Email Application System - Setup Guide

## Overview

The email application system enables **real, automated job applications via email** for 30-40% of job listings. When a user swipes right on a job that accepts email applications, the system automatically:

1. Generates a personalized, AI-powered cover letter
2. Creates a professional HTML email with POPIA compliance
3. Sends the application directly to the employer's email
4. Tracks the submission with message IDs

## Features

- Professional HTML email templates with branding
- POPIA (South African data protection) compliance notices
- Support for multiple email providers (Gmail, Resend, SendGrid)
- Automatic email detection from job descriptions
- Smart fallback to manual application if email fails
- Application tracking and status updates

## Quick Start

### 1. Choose Your Email Provider

You have three options:

#### Option A: Gmail (Easiest for Testing)

**Pros:** Free, quick setup
**Cons:** Daily send limits, may be flagged as spam

```bash
# 1. Enable 2-Factor Authentication on your Gmail account
# 2. Generate App-Specific Password: https://myaccount.google.com/apppasswords
# 3. Add to Replit Secrets or .env:

EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com
```

#### Option B: Resend.com (Recommended for Production)

**Pros:** Professional, better deliverability, SA support
**Cons:** R200/month (50,000 emails)

```bash
# 1. Sign up at https://resend.com
# 2. Verify your domain (e.g., swipejob.co.za)
# 3. Get API key from dashboard
# 4. Add to Replit Secrets or .env:

SMTP_HOST=smtp.resend.com
SMTP_PORT=465
EMAIL_USER=resend
EMAIL_PASSWORD=re_YourAPIKey
EMAIL_FROM=applications@yourdomain.com
```

#### Option C: SendGrid (Alternative)

**Pros:** Free tier (100 emails/day), reliable
**Cons:** Requires domain verification

```bash
# 1. Sign up at https://sendgrid.com
# 2. Create API key with "Mail Send" permission
# 3. Verify sender email or domain
# 4. Add to Replit Secrets or .env:

SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.YourAPIKey
EMAIL_FROM=applications@yourdomain.com
```

### 2. Database Migration

Run the migration to add email application fields:

```bash
# In your Supabase SQL editor, run:
psql -h your-db-host -U postgres < supabase-email-migration.sql

# Or manually in Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy contents of supabase-email-migration.sql
# 3. Run the query
```

This adds:
- `application_email`, `application_method` to `jobs` table
- `submission_method`, `email_sent_to`, `email_message_id` to `applications` table
- Sample jobs with email applications for testing

### 3. Test the System

1. **Start the development server:**
   ```bash
   npm install  # If not already done
   npm run dev
   ```

2. **Login and navigate to the swipe page**

3. **You'll see jobs with "Instant Apply" badges** - these support email applications

4. **Swipe right on an email-enabled job:**
   - System generates cover letter with AI
   - Sends professional email automatically
   - Shows "Application Submitted" status
   - Email is sent to employer's inbox

5. **Check the logs:**
   ```bash
   # Look for:
   Email application sent successfully to careers@company.co.za. Message ID: <message-id>
   ```

## How It Works

### Email Detection

The system automatically detects emails from job descriptions using multiple patterns:

```typescript
// Detects:
"Please send CV to: jobs@company.co.za"
"Email your application to recruitment@company.com"
"Apply: mailto:careers@company.co.za"
"Contact: hr@company.co.za for applications"
```

### Application Flow

```
User swipes right
     ↓
Check: Can apply via email?
     ↓
YES                           NO
     ↓                             ↓
Generate cover letter      Generate cover letter
     ↓                             ↓
Send email application    Show manual apply link
     ↓                             ↓
Track message ID          Mark as "pending"
     ↓
Mark as "submitted"
```

### Email Template Features

- **Professional Design:** Modern, mobile-responsive HTML
- **POPIA Compliance:** Legal notice for SA data protection
- **Resume Attachment:** Links to uploaded CV
- **Skill Tags:** Visual display of candidate skills
- **Company Branding:** SwipeJob footer with disclaimer
- **Plain Text Fallback:** For email clients that don't support HTML

## Testing Email Applications

### Test with Sample Jobs

The migration script adds 3 test jobs with email applications:

1. **Digital Marketing Specialist** at Woolworths
   - Email: `careers@woolworths.co.za`
   
2. **Accountant - Entry Level** at PwC
   - Email: `recruitment.za@pwc.com`
   
3. **Customer Support Agent** at Takealot
   - Email: `jobs@takealot.com`

**Warning:** These are example emails. For real testing, use your own email addresses.

### Create Test Jobs

Add test jobs via SQL or the job import CSV feature:

```sql
INSERT INTO jobs (
  title, 
  company, 
  salary, 
  location, 
  description, 
  skills, 
  application_email,
  application_method
) VALUES (
  'Test Position',
  'Test Company',
  'R15,000 - R20,000',
  'Cape Town',
  'Test job description. To apply, email your CV to test@youremail.com',
  ARRAY['Testing', 'QA'],
  'test@youremail.com',  -- Use your own email!
  'email'
);
```

## Monitoring & Debugging

### Check Email Delivery

1. **Server Logs:**
   ```bash
   # Look for:
   "Attempting email application to..."
   "Email application sent successfully..."
   "Email application failed..."
   ```

2. **Database:**
   ```sql
   -- Check submitted applications
   SELECT 
     a.id,
     j.title,
     a.submission_method,
     a.email_sent_to,
     a.status,
     a.applied_at
   FROM applications a
   JOIN jobs j ON j.id = a.job_id
   WHERE a.submission_method = 'email'
   ORDER BY a.applied_at DESC;
   ```

3. **Email Service:**
   - **Gmail:** Check "Sent" folder
   - **Resend:** Dashboard → Emails → View delivery status
   - **SendGrid:** Activity Feed → Track opens/clicks

### Common Issues

#### "Email service not configured"
- Check environment variables are set correctly
- Restart server after adding credentials

#### "No email address found for this job"
- Job description doesn't contain an email
- Add `application_email` field manually in database

#### "Failed to send email application"
- Check SMTP credentials are correct
- For Gmail: Ensure App-Specific Password is used
- Check daily send limits not exceeded
- Verify sender email is authorized

#### Emails go to spam
- Use professional email service (Resend/SendGrid)
- Set up SPF, DKIM, DMARC records for your domain
- Don't send from free email providers in production

## Production Checklist

Before launching:

- [ ] Use professional email service (Resend or SendGrid)
- [ ] Verify your domain with email provider
- [ ] Set up SPF, DKIM, DMARC DNS records
- [ ] Test with 10+ real job applications
- [ ] Monitor deliverability rates
- [ ] Set up email bounce handling
- [ ] Add rate limiting (prevent spam abuse)
- [ ] Create unsubscribe mechanism
- [ ] Add email analytics tracking
- [ ] Legal review of POPIA compliance notice

## Cost Estimation

### Monthly Email Costs (assuming 1000 applications/month)

| Provider | Free Tier | Paid Plan | SA Support |
|----------|-----------|-----------|------------|
| Gmail | 500/day | N/A | Limited |
| Resend | 100/day | R200 (50k emails) | Yes |
| SendGrid | 100/day | R500 (40k emails) | Yes |
| Mailgun | 100/day | R600 (50k emails) | Yes |

**Recommendation:** Start with Gmail for testing, migrate to Resend for production.

## Email Statistics & Reporting

Add this endpoint to track performance:

```typescript
// GET /api/email-application-stats/:userId
{
  "totalApplications": 50,
  "emailApplications": 18,
  "manualApplications": 32,
  "emailSuccessRate": "94%",
  "averageDeliveryTime": "2.3 seconds",
  "topCompanies": [
    { "company": "Woolworths", "count": 3 },
    { "company": "Takealot", "count": 2 }
  ]
}
```

## Next Steps

1. **API Integrations:** Add support for Pnet, Careers24 APIs
2. **Browser Extension:** Auto-fill forms on external sites
3. **Email Tracking:** Add read receipts and click tracking
4. **A/B Testing:** Test different email templates
5. **Follow-up Emails:** Automated follow-ups after 7 days

## Support

For issues or questions:
- Check server logs for error messages
- Test with your own email first
- Verify environment variables are set
- Try manual email send via SMTP test tool

## License & Compliance

- All emails include POPIA compliance notices
- Users consent to automated applications during onboarding
- Email addresses are detected from public job postings
- No personal data is shared without user consent
- Complies with CAN-SPAM Act (USA) and POPIA (South Africa)
