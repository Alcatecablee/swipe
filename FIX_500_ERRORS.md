# Fix 500 API Errors - Database Connection Issue

## ❌ Current Error

**All API routes returning 500:**
```
/api/profile/... → 500
/api/swipe-limits/... → 500
/api/analytics/... → 500
/api/applications/... → 500
```

**Supabase REST API returning 406:**
```
/rest/v1/users?select=*&id=eq.c7fdae44-6db1-4781-83d4-369931395714 → 406
```

---

## ✅ Root Cause

**Two issues:**
1. **DATABASE_URL not set in Vercel** (backend can't connect)
2. **Tables may not exist in Supabase** (SQL script not run)

---

## 🚀 Fix in 5 Steps

### **Step 1: Add DATABASE_URL to Vercel**

**Go to Vercel:**
1. Open: https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**

**Add this variable:**
```
Name: DATABASE_URL
Value: postgresql://postgres.evdwovhikctwcjddcpzz:@@7kfNLkPRyiVmy@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**IMPORTANT:** Replace `@@7kfNLkPRyiVmy` with your actual database password!

5. Click **"Save"**

---

### **Step 2: Add Other Missing Variables**

While you're in Environment Variables, make sure **ALL 5** are set:

```
1. VITE_SUPABASE_URL=https://evdwovhikctwcjddcpzz.supabase.co

2. VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2ZHdvdmhpa2N0d2NqZGRjcHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Mzc0NzIsImV4cCI6MjA2NzUxMzQ3Mn0.BTNWHzz3d9lwUOM-CaYi1O5qlu9WgTj5VR3sxVVIiUU

3. VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2ZHdvdmhpa2N0d2NqZGRjcHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTkzNzQ3MiwiZXhwIjoyMDY3NTEzNDcyfQ.GIr2xieo46ZpQOt3idxd_TQSDsTVIVTkvh26ELjl254

4. GROQ_API_KEY=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

5. DATABASE_URL=postgresql://postgres.evdwovhikctwcjddcpzz:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

### **Step 3: Run SQL Script in Supabase**

**Go to Supabase:**
1. Open: https://supabase.com/dashboard/project/evdwovhikctwcjddcpzz
2. Click **"SQL Editor"** (left sidebar)
3. Click **"New Query"**

**Copy & Run:**
1. Open `MANUAL_DATABASE_SETUP.sql` from your repo
2. Copy **ALL of it** (Ctrl+A, Ctrl+C)
3. Paste into SQL Editor
4. Click **"RUN"** (or Ctrl+Enter)

**Expected:**
```
✅ Success. No rows returned
```

**Verify:**
1. Click **"Table Editor"** (left sidebar)
2. Should see **11 tables**:
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

### **Step 4: Redeploy on Vercel**

After adding environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **"..."** menu on latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes for deployment

---

### **Step 5: Test Your Site**

After redeploy completes:

1. **Visit your site** (hard refresh: Ctrl+Shift+R)
2. **Open Console** (F12)
3. **Should NOT see 500 errors**
4. **Try the features:**
   - Sign up / Log in
   - Visit `/app` to see jobs
   - Visit `/dashboard` to see analytics

---

## 🔍 Verify Environment Variables Are Set

**In Vercel Dashboard → Settings → Environment Variables:**

You should see **5 variables:**

```
✅ VITE_SUPABASE_URL          Production
✅ VITE_SUPABASE_ANON_KEY     Production
✅ VITE_SUPABASE_SERVICE_...  Production
✅ GROQ_API_KEY               Production
✅ DATABASE_URL               Production
```

**If any are missing:**
- Click "Add New"
- Enter name and value
- Select "Production" environment
- Click "Save"
- **Must redeploy after adding!**

---

## 🗄️ Get Your Database Password

If you don't have your database password:

**Option 1: Find in Supabase**
1. Go to: https://supabase.com/dashboard/project/evdwovhikctwcjddcpzz/settings/database
2. Scroll to **"Connection string"**
3. Click **"Connection pooling"** tab
4. Look for: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@...`
5. Copy the password part

**Option 2: Reset Database Password**
1. Go to: https://supabase.com/dashboard/project/evdwovhikctwcjddcpzz/settings/database
2. Click **"Reset database password"**
3. Save the new password
4. Update DATABASE_URL in Vercel with new password

---

## 🧪 Test Database Connection

**After setting DATABASE_URL and redeploying:**

Visit any API endpoint directly:
```
https://your-site.vercel.app/api/jobs
```

**Expected:**
```json
[
  {
    "id": "...",
    "title": "Senior Full-Stack Developer",
    "company": "Cape Town Tech Co",
    ...
  }
]
```

**If still 500:**
- DATABASE_URL is wrong
- Database password incorrect
- SQL script didn't run
- Redeploy didn't finish

---

## 🐛 Troubleshooting

### **Issue: Still Getting 500 Errors**

**Check 1: Is DATABASE_URL Set?**
```
Vercel → Settings → Environment Variables
Look for: DATABASE_URL
If missing → Add it
If present → Check value is correct
```

**Check 2: Did You Redeploy?**
```
Vercel → Deployments
Latest status should be: "Ready" (green)
If "Building" → Wait
If "Failed" → Click to see error logs
```

**Check 3: Are Tables Created?**
```
Supabase → Table Editor
Should see 11 tables
If empty → Run SQL script
```

**Check 4: Is Password Correct?**
```
DATABASE_URL format:
postgresql://postgres.PROJECT:[PASSWORD]@aws-...

Try resetting password:
Supabase → Settings → Database → Reset password
```

---

### **Issue: 406 Error from Supabase**

**Error:**
```
/rest/v1/users?select=*&id=eq.c7fdae44... → 406
```

**Cause:**
- `users` table doesn't exist
- RLS policies not set up
- SQL script not run

**Fix:**
1. Run SQL script in Supabase
2. Verify `users` table exists
3. Refresh your site

---

### **Issue: Build Failed in Vercel**

**Check Build Logs:**
1. Vercel → Deployments → Click failed deployment
2. Look for errors in logs
3. Common issues:
   - TypeScript errors
   - Missing dependencies
   - Build timeout

**If TypeScript errors:**
```bash
# Run locally to check:
npm run build
```

---

## 📊 Expected vs Actual

### **Before (Current):**
```
❌ /api/profile → 500
❌ /api/analytics → 500
❌ /api/jobs → 500
❌ Cannot access any features
```

### **After (Fixed):**
```
✅ /api/profile → 200 (user data)
✅ /api/analytics → 200 (stats)
✅ /api/jobs → 200 (job list)
✅ All features working
```

---

## ⚡ Quick Checklist

Before testing, verify:

**Vercel:**
- [ ] DATABASE_URL is set
- [ ] All 5 environment variables present
- [ ] Latest deployment status = "Ready"
- [ ] Deployment time is recent (after adding vars)

**Supabase:**
- [ ] SQL script run successfully
- [ ] 11 tables visible in Table Editor
- [ ] 5 sample jobs in `jobs` table
- [ ] `users` table exists

**Testing:**
- [ ] Hard refresh site (Ctrl+Shift+R)
- [ ] Check console - no 500 errors
- [ ] Can sign up / log in
- [ ] Can view jobs at `/app`
- [ ] Can view dashboard at `/dashboard`

---

## 🎯 Summary

**The 500 errors are caused by:**
1. Missing DATABASE_URL in Vercel
2. Backend can't connect to database
3. Maybe tables don't exist yet

**To fix:**
1. ✅ Add DATABASE_URL to Vercel (with correct password)
2. ✅ Add all 5 environment variables
3. ✅ Run SQL script in Supabase
4. ✅ Redeploy on Vercel
5. ✅ Test your site

**Total time: 5 minutes**

---

## 📞 Need Help?

**Share with me:**
1. Screenshot of Vercel Environment Variables (hide password)
2. Screenshot of Supabase Table Editor (showing tables)
3. Console errors after redeploy
4. Which step you're stuck on

---

**Priority: Add DATABASE_URL to Vercel, then redeploy!** 🔧
