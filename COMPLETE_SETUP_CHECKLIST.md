# Complete Setup Checklist - Get Your Site Fully Working

## Current Status

✅ **WORKING:**
- Site loads (no 404s)
- Cyan theme applied
- Logo images showing
- Theme toggle visible
- Vercel deployment successful

❌ **NOT WORKING:**
- User profiles (`Error fetching user profile`)
- Authentication/signup
- Job listings
- Database features

---

## Why Profile Error Happens

**Error in Console:**
```
Error fetching user profile: Object
```

**Cause:**
- Database tables don't exist yet
- You need to run the SQL script in Supabase
- Tables: `users`, `jobs`, `applications`, etc.

---

## 🚀 Complete Setup (5 Minutes)

### **Step 1: Run SQL Script in Supabase**

**Go to Supabase:**
1. Open: https://supabase.com/dashboard/project/evdwovhikctwcjddcpzz
2. Click **"SQL Editor"** in left sidebar
3. Click **"New Query"** button

**Copy & Paste SQL:**
1. Open `MANUAL_DATABASE_SETUP.sql` file in your repo
2. Copy **EVERYTHING** (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click **"RUN"** or press Ctrl+Enter

**Expected Result:**
```
Success. No rows returned.
✅ 11 tables created
✅ RLS policies enabled
✅ 5 sample jobs inserted
```

**Verify Tables Created:**
1. Go to **"Table Editor"** (left sidebar)
2. You should see 11 tables:
   - users
   - jobs
   - applications
   - swipes
   - badges
   - notifications
   - push_subscriptions
   - profile_views
   - interview_schedule
   - user_analytics
   - user_experience

---

### **Step 2: Verify Environment Variables in Vercel**

**Go to Vercel:**
1. Open Vercel Dashboard
2. Go to your project
3. Click **Settings** → **Environment Variables**

**Required Variables:**
```
VITE_SUPABASE_URL=https://evdwovhikctwcjddcpzz.supabase.co

VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2ZHdvdmhpa2N0d2NqZGRjcHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Mzc0NzIsImV4cCI6MjA2NzUxMzQ3Mn0.BTNWHzz3d9lwUOM-CaYi1O5qlu9WgTj5VR3sxVVIiUU

VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2ZHdvdmhpa2N0d2NqZGRjcHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTkzNzQ3MiwiZXhwIjoyMDY3NTEzNDcyfQ.GIr2xieo46ZpQOt3idxd_TQSDsTVIVTkvh26ELjl254

GROQ_API_KEY=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

DATABASE_URL=postgresql://postgres.evdwovhikctwcjddcpzz:@@7kfNLkPRyiVmy@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**After Adding:**
1. Save variables
2. Click **"Redeploy"** in Deployments tab
3. Wait 2-3 minutes

---

### **Step 3: Test Your Site**

**After SQL Script + Redeploy:**

1. **Visit Your Site**
   - Go to your Vercel URL
   - Hard refresh (Ctrl+Shift+R)

2. **Test Signup**
   - Click "Sign Up" or "Join for free"
   - Enter email and password
   - Should create account successfully
   - Should redirect to onboarding

3. **Check Console**
   - Open DevTools (F12)
   - Go to Console tab
   - **Should NOT see** "Error fetching user profile"
   - **Should see** successful API calls

4. **Browse Jobs**
   - After signup, go to `/app`
   - Should see 5 sample jobs
   - Can swipe left (skip) or right (apply)

---

## 📊 What the SQL Script Creates

### **Tables (11 total):**
1. **users** - User profiles, auth, premium status
2. **jobs** - Job listings (5 samples included)
3. **applications** - Job applications with tracking
4. **user_experience** - Work history
5. **swipes** - Swipe history (skip/apply)
6. **badges** - Achievement gamification
7. **notifications** - In-app notifications
8. **push_subscriptions** - Push notification subscriptions
9. **profile_views** - Profile view tracking
10. **interview_schedule** - Interview scheduling
11. **user_analytics** - User activity analytics

### **Security (RLS Policies):**
- ✅ Users can only see/edit their own data
- ✅ Admins can manage everything
- ✅ Public can view active jobs

### **Sample Data:**
- ✅ 5 sample jobs ready for testing:
  - Senior Full-Stack Developer (Cape Town)
  - Nursing Sister (Johannesburg)
  - Primary School Teacher (Durban)
  - Junior Financial Analyst (Cape Town)
  - Digital Marketing Specialist (Johannesburg)

---

## 🧪 Testing Checklist

After running SQL script and redeploying:

### **Landing Page:**
- [ ] Site loads with cyan theme
- [ ] Logo image visible (not "W")
- [ ] Theme toggle visible
- [ ] "Sign Up" button works
- [ ] No console errors

### **Signup:**
- [ ] Can enter email/password
- [ ] Click "Sign Up"
- [ ] See success message
- [ ] Redirect to onboarding
- [ ] No "Error fetching user profile"

### **Onboarding:**
- [ ] Multi-step form appears
- [ ] Can upload resume
- [ ] Can enter skills
- [ ] Can complete profile
- [ ] Redirect to `/app`

### **Job Swiping:**
- [ ] See 5 sample jobs
- [ ] Can swipe left (skip)
- [ ] Can swipe right (apply)
- [ ] Counter shows swipes remaining
- [ ] Jobs disappear after swiping

### **Dashboard:**
- [ ] Visit `/dashboard`
- [ ] See analytics widgets
- [ ] See application stats
- [ ] No console errors

---

## ❓ Troubleshooting

### **Issue: Still seeing "Error fetching user profile"**

**Check 1: Did SQL Script Run?**
```
1. Go to Supabase → Table Editor
2. Look for "users" table
3. If missing → SQL script didn't run
4. Go back to Step 1
```

**Check 2: Are Env Vars Set?**
```
1. Vercel → Settings → Environment Variables
2. Check if all 5 variables exist
3. If missing → Add them
4. Redeploy
```

**Check 3: Is Deployment Complete?**
```
1. Vercel → Deployments
2. Check status = "Ready" (green checkmark)
3. If building → Wait
4. If failed → Check build logs
```

---

### **Issue: Can't Sign Up**

**Error: "Error creating user"**
```
Solution:
1. Check Supabase Auth is enabled
2. Go to: Supabase → Authentication → Settings
3. Enable Email provider
4. Disable email confirmation (for testing)
```

**Error: "Invalid login credentials"**
```
Solution:
1. Try different email
2. Check password is 6+ characters
3. Clear browser cache
4. Try incognito mode
```

---

### **Issue: No Jobs Showing**

**Check 1: Are Jobs in Database?**
```
1. Supabase → Table Editor → jobs
2. Should see 5 rows
3. If empty → SQL script didn't run properly
4. Re-run SQL script
```

**Check 2: Is User Authenticated?**
```
1. Open Console (F12)
2. Type: localStorage.getItem('supabase.auth.token')
3. Should show token JSON
4. If null → Not logged in
```

---

## 🎯 Expected Final State

After completing all steps:

### **What Works:**
- ✅ Cyan theme everywhere
- ✅ Logo images with theme switching
- ✅ Theme toggle in header
- ✅ User signup/login
- ✅ Profile creation
- ✅ Job browsing (5 samples)
- ✅ Job swiping
- ✅ Application tracking
- ✅ Dashboard analytics
- ✅ No console errors

### **API Calls (Should Succeed):**
```
✅ POST /api/auth/signup
✅ GET /api/profile/:userId
✅ GET /api/jobs
✅ POST /api/swipe
✅ GET /api/applications
✅ GET /api/analytics
```

---

## 📝 Quick Reference

### **Supabase Links:**
- **Dashboard:** https://supabase.com/dashboard/project/evdwovhikctwcjddcpzz
- **SQL Editor:** Click "SQL Editor" in left sidebar
- **Table Editor:** Click "Table Editor" in left sidebar
- **Auth Settings:** Authentication → Settings

### **Vercel Links:**
- **Project:** Your Vercel dashboard
- **Settings:** Settings → Environment Variables
- **Deployments:** Deployments tab
- **Logs:** Deployment → Functions → View logs

### **Local Files:**
- **SQL Script:** `MANUAL_DATABASE_SETUP.sql`
- **Theme Docs:** `THEME_SYSTEM_COMPLETE.md`
- **Logo Docs:** `LOGO_IMPLEMENTATION.md`
- **This Guide:** `COMPLETE_SETUP_CHECKLIST.md`

---

## ⚡ Quick Commands

### **Check if Tables Exist (Supabase SQL Editor):**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Should return:**
```
applications
badges
interview_schedule
jobs
notifications
profile_views
push_subscriptions
swipes
user_analytics
user_experience
users
```

### **Check Sample Jobs (Supabase SQL Editor):**
```sql
SELECT id, title, company, location, is_active 
FROM jobs 
ORDER BY created_at DESC;
```

**Should return 5 jobs.**

### **Check if User Can Auth (Browser Console):**
```javascript
// After attempting signup
const token = localStorage.getItem('supabase.auth.token');
console.log('Token exists:', !!token);
console.log('Token value:', token);
```

---

## 🎉 You're Almost There!

**Just 2 steps to full functionality:**
1. ✅ Run SQL script in Supabase (2 min)
2. ✅ Verify env vars in Vercel (1 min)
3. 🚀 Your site is fully functional!

---

## 📞 If You Get Stuck

**Share with me:**
1. Screenshot of Supabase Table Editor (showing tables)
2. Screenshot of Vercel Environment Variables (hide sensitive values)
3. Console errors (F12 → Console tab)
4. What step you're on

I'll help you debug!

---

**Current Priority: Run the SQL script in Supabase SQL Editor!** 🗄️

This will fix the "Error fetching user profile" and enable all features.
