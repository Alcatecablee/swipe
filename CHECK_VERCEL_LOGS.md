# How to Check Vercel Function Logs - Step by Step

## 🚨 Your Error: FUNCTION_INVOCATION_FAILED

This means the serverless function is **crashing on startup** before it can even respond.

Most likely cause: **DATABASE_URL is wrong, missing, or the database connection is failing**.

---

## 📋 Step-by-Step: Check the Real Error

### **Method 1: Check Function Logs in Vercel Dashboard**

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Click your project

2. **Click "Deployments" tab**

3. **Click the latest "Ready" deployment**

4. **Look for one of these sections:**
   - **"Runtime Logs"** tab
   - **"Functions"** section → Click "View Logs"
   - **"Logs"** tab at the top

5. **You'll see the actual error, like:**
   ```
   Error: DATABASE_URL is not set
   ```
   or
   ```
   Error: password authentication failed
   ```
   or
   ```
   Error: connect ECONNREFUSED
   ```

6. **Screenshot that error and send it to me!**

---

### **Method 2: Use the Health Check Endpoint (NEW!)**

I just created a health check endpoint that doesn't need the database.

**After the next deployment completes (2-3 min), visit:**
```
https://swipe-flame.vercel.app/api/health
```

**You'll see:**
```json
{
  "status": "ok",
  "environment": {
    "hasSupabaseUrl": true,
    "hasSupabaseAnonKey": true,
    "hasSupabaseServiceKey": true,
    "hasGroqKey": true,
    "hasDatabaseUrl": false,  ← THIS WILL TELL US!
    "databaseUrlFormat": "NOT SET"
  }
}
```

**This tells us exactly which environment variables are missing!**

---

### **Method 3: Check Vercel Environment Variables**

1. **Go to:** Vercel → Settings → Environment Variables

2. **You should see 5 variables:**
   ```
   ✅ VITE_SUPABASE_URL
   ✅ VITE_SUPABASE_ANON_KEY
   ✅ VITE_SUPABASE_SERVICE_ROLE_KEY
   ✅ GROQ_API_KEY
   ✅ DATABASE_URL  ← Is this here?
   ```

3. **For each variable, check:**
   - Environment: Should say "Production"
   - Value: Should be filled (not empty)

4. **Click "Edit" on DATABASE_URL and verify:**
   ```
   postgresql://postgres.evdwovhikctwcjddcpzz:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

---

## 🔧 Most Common Fixes

### **Fix 1: DATABASE_URL Not Set**

**If DATABASE_URL is missing:**
1. Vercel → Settings → Environment Variables
2. Click "Add New"
3. Name: `DATABASE_URL`
4. Value: `postgresql://postgres.evdwovhikctwcjddcpzz:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
5. Click "Save"
6. Go to Deployments → Redeploy

---

### **Fix 2: Wrong Password**

**If DATABASE_URL exists but function still crashes:**

The password is probably wrong.

**Get your real password:**
1. Go to: https://supabase.com/dashboard/project/evdwovhikctwcjddcpzz/settings/database
2. Look for "Connection string" section
3. Click "URI" tab
4. You'll see: `postgresql://...:[PASSWORD]@...`
5. Copy the password (between `:` and `@`)
6. Update DATABASE_URL in Vercel
7. Redeploy

**Or reset the password:**
1. Same page → "Reset database password"
2. Copy the NEW password
3. Update DATABASE_URL in Vercel
4. Redeploy

---

### **Fix 3: Wrong URL Format**

**DATABASE_URL must be EXACTLY:**
```
postgresql://postgres.evdwovhikctwcjddcpzz:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Check for:**
- ❌ Extra spaces
- ❌ Missing `?pgbouncer=true`
- ❌ Wrong port (should be `6543` not `5432`)
- ❌ Using direct URL instead of pooler URL

---

## 🚀 After Fixing

Once you've added/fixed DATABASE_URL:

1. **Redeploy in Vercel**
2. **Wait 2-3 minutes**
3. **Visit:** `https://swipe-flame.vercel.app/api/health`
4. **Should see:** `"hasDatabaseUrl": true`
5. **Then visit:** `https://swipe-flame.vercel.app/api/jobs`
6. **Should see:** JSON with job listings (not 500 error)

---

## 📊 Diagnosis Checklist

Check each of these:

### **In Vercel:**
- [ ] DATABASE_URL exists in Environment Variables
- [ ] DATABASE_URL is set to "Production" environment
- [ ] DATABASE_URL value is not empty
- [ ] DATABASE_URL format is correct (starts with `postgresql://`)
- [ ] Password in DATABASE_URL is correct
- [ ] Latest deployment is AFTER adding DATABASE_URL

### **Test After Deploy:**
- [ ] Visit `/api/health` → Shows all env vars as `true`
- [ ] Visit `/api/jobs` → Shows JSON (not 500 error)
- [ ] Console shows no 500 errors
- [ ] Can sign up / log in

---

## 🎯 Next Steps

**Right now, do this:**

1. **Wait 2-3 minutes** for the health check endpoint to deploy
2. **Visit:** `https://swipe-flame.vercel.app/api/health`
3. **Copy the JSON response** and send it to me
4. **That will tell us exactly what's wrong!**

If health check shows `"hasDatabaseUrl": false`:
- DATABASE_URL is not set in Vercel
- Or deployment didn't pick it up

If health check shows `"hasDatabaseUrl": true`:
- The variable is set, but password might be wrong
- Check Vercel function logs for actual error

---

## 📞 What to Send Me

1. **JSON from `/api/health`** (after next deploy)
2. **Screenshot of Vercel Environment Variables** (hide password)
3. **When did you add DATABASE_URL?** (timestamp)
4. **Latest deployment timestamp** (in Deployments tab)

With those, I can tell you exactly what to fix!

---

**In 2-3 minutes, visit `/api/health` and send me what you see!** 🏥
