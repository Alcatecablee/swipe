# Quick Database Setup - 5 Minutes

Your `.env` file is now configured with the **connection pooling URL**, which is perfect for the backend API to connect to Supabase in production.

However, **Drizzle CLI doesn't work well with PgBouncer** (connection pooling), so we need to create tables manually.

## ✅ Why Manual SQL is Better

1. **Drizzle CLI + PgBouncer = Hangs** (as you just saw)
2. **Manual SQL = Works instantly** 
3. **You have full control** over the schema
4. **No IPv6 connection issues**

---

## 🚀 Setup in 3 Steps (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/evdwovhikctwcjddcpzz
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy & Paste SQL Script
Open `MANUAL_DATABASE_SETUP.sql` and copy **everything** (Ctrl+A, Ctrl+C)

Paste it into the Supabase SQL Editor.

### Step 3: Run It
Click **RUN** or press `Ctrl+Enter`

**Expected output:**
```
Success. No rows returned.
```

---

## ✅ What This Creates

### Tables:
1. **users** - User profiles, auth, premium status, referral codes
2. **jobs** - Job listings with skills, salary, location
3. **applications** - Application tracking with status & AI-generated cover letters
4. **user_experience** - Work history
5. **swipes** - Swipe history (skip/apply)
6. **badges** - Achievement badges & gamification
7. **notifications** - In-app notifications
8. **push_subscriptions** - Push notification subscriptions
9. **profile_views** - Who viewed user profiles
10. **interview_schedule** - Interview scheduling
11. **user_analytics** - User activity analytics

### Security:
- ✅ **Row Level Security (RLS)** enabled on all tables
- ✅ Users can only see/edit their own data
- ✅ Admins can manage everything
- ✅ Public can view active jobs

### Sample Data:
- ✅ 5 sample jobs (software, healthcare, education, finance)
- ✅ Ready for immediate testing

---

## 🧪 Verify Setup

After running the SQL script:

### 1. Check Tables Were Created
In Supabase, go to **Table Editor** - you should see all 11 tables.

### 2. Check Sample Jobs
Click on the **jobs** table - you should see 5 sample jobs.

### 3. Test Locally
```bash
npm run dev
```

Then visit: http://localhost:5000

**What should work:**
- ✅ Homepage loads
- ✅ Signup/Login works
- ✅ Job swiping shows 5 sample jobs
- ✅ Dashboard shows analytics
- ✅ Profile completion tracking

---

## 🌐 Add to Vercel

### Important: Update Vercel Environment Variables

Your backend API needs the **same DATABASE_URL** to work in production.

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

**Add this variable:**
```
DATABASE_URL="postgresql://postgres.evdwovhikctwcjddcpzz:@@7kfNLkPRyiVmy@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Also add these (if not already there):**
```
VITE_SUPABASE_URL=https://evdwovhikctwcjddcpzz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2ZHdvdmhpa2N0d2NqZGRjcHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Mzc0NzIsImV4cCI6MjA2NzUxMzQ3Mn0.BTNWHzz3d9lwUOM-CaYi1O5qlu9WgTj5VR3sxVVIiUU
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2ZHdvdmhpa2N0d2NqZGRjcHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTkzNzQ3MiwiZXhwIjoyMDY3NTEzNDcyfQ.GIr2xieo46ZpQOt3idxd_TQSDsTVIVTkvh26ELjl254
GROQ_API_KEY=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
```

**Then redeploy** in Vercel.

---

## 📊 Current Status

### ✅ Completed:
- ✅ `.env` file configured with connection pooling URL
- ✅ All connections tested (Supabase, Groq, Database)
- ✅ Vercel deployment fixed (no more 404)
- ✅ Favicon added
- ✅ API serverless handler created

### ⏳ Next:
1. Run SQL script in Supabase (5 min)
2. Test locally with `npm run dev`
3. Add DATABASE_URL to Vercel env vars
4. Redeploy Vercel
5. **Your site is LIVE!** 🚀

---

## 🔧 Connection Strings Explained

### What's in Your `.env`:

**DATABASE_URL (Connection Pooling - Port 6543):**
```
postgresql://postgres.evdwovhikctwcjddcpzz:@@7kfNLkPRyiVmy@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```
- ✅ **Use this for:** Backend API (Express server, Drizzle ORM queries)
- ✅ **Why:** Handles many concurrent connections efficiently
- ✅ **Transaction mode:** Perfect for application queries

**DIRECT_URL (Direct Connection - Port 5432):**
```
postgresql://postgres.evdwovhikctwcjddcpzz:@@7kfNLkPRyiVmy@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```
- ⚠️ **Use this for:** Migrations (if you were using Drizzle migrations)
- ⚠️ **Why:** Direct connection supports all PostgreSQL features
- ❌ **Don't use for:** Production backend (less efficient for many connections)

### Why We're Using Manual SQL Instead of Drizzle CLI:
- ✅ **Drizzle CLI needs introspection queries** (checking existing schema)
- ❌ **PgBouncer blocks these queries** in transaction mode
- ✅ **Manual SQL works perfectly** - you paste it, it runs, done!

---

## 🎯 Your Action Items

### Right Now:
1. **Open Supabase SQL Editor**
2. **Copy entire `MANUAL_DATABASE_SETUP.sql`**
3. **Paste and RUN**
4. **Verify tables created** in Table Editor

### Then:
5. **Test locally:** `npm run dev`
6. **Add DATABASE_URL to Vercel**
7. **Redeploy Vercel**
8. **Test production site**

---

**Total time: 5 minutes** ⏱️

Once you run the SQL script, everything will work! 🚀
