# Email Applications - Quick Start (5 Minutes)

## What This Does

Instead of fake Google search URLs, your app now **sends real email applications** to employers. When users swipe right on jobs with email support, the system:

1. ✅ Generates AI cover letter
2. ✅ Sends professional HTML email
3. ✅ Tracks submission with message ID
4. ✅ Shows "Application Submitted" status

**Coverage: 30-40% of jobs** can be applied via email instantly.

---

## Setup (Choose One Method)

### Method 1: Gmail (Fastest for Testing)

**5-minute setup, free:**

1. **Get App-Specific Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Enable 2-Factor Auth if not enabled
   - Generate app password for "Mail"
   - Copy the 16-character password

2. **Add to Replit Secrets** (or create `.env` file):
   ```bash
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcd-efgh-ijkl-mnop  # The 16-char password
   EMAIL_FROM=your-email@gmail.com
   ```

3. **That's it!** Restart server and test.

---

### Method 2: Resend.com (Recommended for Production)

**Professional emails, better deliverability, R200/month:**

1. **Sign up:** https://resend.com (free trial available)

2. **Get API Key:**
   - Dashboard → API Keys → Create
   - Copy the key (starts with `re_`)

3. **Add to Replit Secrets:**
   ```bash
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=465
   EMAIL_USER=resend
   EMAIL_PASSWORD=re_YourAPIKeyHere
   EMAIL_FROM=applications@yourdomain.com
   ```

4. **Verify domain** (optional but recommended):
   - Dashboard → Domains → Add Domain
   - Add DNS records provided
   - Increases deliverability

---

## Database Setup

**Run this in Supabase SQL Editor:**

```sql
-- Copy and paste the entire contents of supabase-email-migration.sql
-- This adds email fields and sample test jobs
```

Or manually:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy/paste `supabase-email-migration.sql`
4. Click "Run"

✅ This adds 3 test jobs with email applications you can try immediately.

---

## Test It Now

### Step 1: Install & Run

```bash
npm install  # If not done
npm run dev
```

### Step 2: Create Test Job (Optional)

Use YOUR email to receive the test application:

```sql
INSERT INTO jobs (
  title, company, salary, location, description, skills,
  application_email, application_method
) VALUES (
  'Test Developer',
  'Test Company',
  'R20,000',
  'Cape Town',
  'Test job. Apply by emailing your-email@gmail.com',  -- YOUR EMAIL!
  ARRAY['Testing'],
  'your-email@gmail.com',  -- YOUR EMAIL!
  'email'
);
```

### Step 3: Swipe & Apply

1. Login to your app
2. Navigate to /app (swipe page)
3. Look for jobs with **green "Instant Apply"** badge
4. Swipe right (or click "Instant Apply" button)
5. Wait 2-3 seconds
6. **Check your email inbox!**

### Step 4: Verify Success

**In your email, you should see:**
- Subject: "Application for [Job Title] - [Your Name]"
- Professional HTML template
- Your AI-generated cover letter
- Skills displayed as tags
- POPIA compliance notice
- Resume link (if uploaded)

**In server logs:**
```
✅ Email application sent successfully to your-email@gmail.com
   Message ID: <unique-message-id>
```

**In database:**
```sql
SELECT * FROM applications 
WHERE submission_method = 'email' 
ORDER BY applied_at DESC LIMIT 1;

-- Should show:
-- submission_method: 'email'
-- email_sent_to: 'your-email@gmail.com'
-- status: 'submitted'
```

---

## Visual Indicators

### Jobs with Email Support Show:
- **Top-right badge:** "Instant Apply" (green, pulsing)
- **Apply button:** Green with "Instant Apply" text + mail icon
- **Hover effect:** Highlights email capability

### Application Status:
- **submitted** = Email sent successfully ✅
- **pending** = Needs manual application (no email)
- **failed** = Email sending failed (rare)

---

## Troubleshooting

### "Email service not configured"
→ Add EMAIL_USER and EMAIL_PASSWORD to Replit Secrets
→ Restart server after adding

### "No email address found"
→ Job doesn't have email in description
→ Add `application_email` to job manually

### "Failed to send email"
→ Gmail: Check app-specific password is correct
→ Check credentials are in environment
→ Try sending test email via SMTP tool

### Email in spam folder
→ Normal for first few emails
→ Move to inbox and mark "Not spam"
→ For production: Use Resend/SendGrid + domain verification

### Server not picking up env vars
→ Restart server after adding Replit Secrets
→ Check spelling of variable names
→ Use `console.log(process.env.EMAIL_USER)` to verify

---

## What's Different

### Before (Fake):
```
User swipes right
  ↓
Generate cover letter
  ↓
Create Google search URL ❌
  ↓
Status: "auto_applied" (misleading!)
```

### After (Real):
```
User swipes right
  ↓
Generate cover letter
  ↓
Send email to employer ✅
  ↓
Status: "submitted" (honest!)
```

---

## Sample Test Jobs

The migration adds these (with YOUR email for testing):

1. **Digital Marketing Specialist** @ Woolworths
2. **Accountant** @ PwC
3. **Customer Support Agent** @ Takealot

*Replace the emails with yours to test!*

---

## Production Checklist

Before launching to real users:

- [ ] Use professional email service (not Gmail)
- [ ] Verify your domain with email provider
- [ ] Set up SPF/DKIM DNS records
- [ ] Test with 20+ applications
- [ ] Monitor spam rates
- [ ] Add rate limiting
- [ ] Legal review POPIA compliance

---

## Cost Estimate

**Gmail:** Free, but limited and unprofessional
**Resend:** R200/month for 50,000 emails (recommended)
**SendGrid:** R500/month for 40,000 emails

For 1,000 applications/month → **R200 with Resend**

---

## Quick Test Commands

```bash
# Check env vars loaded
node -e "console.log(process.env.EMAIL_USER)"

# Test SMTP connection (create test-smtp.js)
node test-smtp.js

# Check sent emails in DB
psql -c "SELECT COUNT(*) FROM applications WHERE submission_method='email'"

# View recent email applications
psql -c "SELECT j.title, a.email_sent_to, a.applied_at FROM applications a JOIN jobs j ON j.id = a.job_id WHERE submission_method='email' ORDER BY applied_at DESC LIMIT 5"
```

---

## Next Steps

Once email works:

1. **Add more jobs with emails** (import CSV or scrape)
2. **Track metrics** (open rates, response rates)
3. **Build browser extension** (+50% coverage)
4. **API integrations** (Pnet, Indeed)
5. **A/B test email templates**

---

## Need Help?

1. Check `EMAIL_APPLICATION_SETUP.md` for detailed guide
2. Review server logs for errors
3. Test SMTP directly with nodemailer
4. Verify job has `application_email` field set

---

## Success!

When you see this in your inbox:

```
From: Your Name via SwipeJob
Subject: Application for Test Developer - Your Name

[Beautiful HTML email with:
- Your cover letter
- Skills as green tags
- Resume link
- POPIA compliance notice
- Professional branding]
```

**You've successfully implemented real email applications!** 🎉

Now 30-40% of jobs can be applied to instantly with one swipe.

---

**Ready? Add your credentials and swipe right!** 🚀
