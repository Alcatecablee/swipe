# Debug 500 Errors - Check Vercel Logs

## 🔍 Step 1: Check Vercel Function Logs

The 500 error means the serverless function is crashing. We need to see WHY.

### **Go to Vercel Dashboard:**

1. Open your project in Vercel
2. Click **"Deployments"** tab
3. Click on the **latest deployment** (should be "Ready")
4. Look for **"Functions"** section
5. Click **"View Function Logs"** or **"Real-time Logs"**

### **What to Look For:**

You'll see the actual error, probably one of these:

**Error 1: "DATABASE_URL is not set"**
```
Error: DATABASE_URL is not set
```
**Fix:** The environment variable wasn't picked up. Need to redeploy again.

**Error 2: "Connection refused" or "ECONNREFUSED"**
```
Error: connect ECONNREFUSED
```
**Fix:** Database URL is wrong or password is incorrect.

**Error 3: "password authentication failed"**
```
Error: password authentication failed for user "postgres"
```
**Fix:** Wrong password in DATABASE_URL.

**Error 4: "relation 'users' does not exist"**
```
Error: relation "users" does not exist
```
**Fix:** SQL script didn't run or didn't complete.

---

## 🔧 Step 2: Verify Environment Variables

### **Check if Variables Are Really Set:**

1. Go to: **Vercel → Settings → Environment Variables**
2. You should see **5 variables** with "Production" next to them
3. Click **"Edit"** on DATABASE_URL
4. **Verify** the value looks like:
   ```
   postgresql://postgres.PROJECT:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
5. **Check:** Is the password correct? No typos?

---

## 🔄 Step 3: Force New Deployment

Sometimes Vercel caches the old environment. Force a clean deploy:

### **Method 1: Redeploy with Override**
1. Go to **Deployments**
2. Click **"..."** menu on latest
3. Click **"Redeploy"**
4. ✅ **Check "Use existing Build Cache"** = OFF
5. Click **"Redeploy"**

### **Method 2: Make a Code Change**
1. Make any small change to your code (add a comment)
2. Push to GitHub
3. Vercel will auto-deploy
4. This guarantees fresh environment

---

## 🗄️ Step 4: Test Database Connection Directly

### **Test in Supabase SQL Editor:**

```sql
-- This should return your tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected:** List of 11 tables

**If empty:** SQL script didn't run or failed silently

### **Re-run SQL Script:**
1. Go to **SQL Editor** → **New Query**
2. Copy `MANUAL_DATABASE_SETUP.sql` again
3. Paste and **RUN**
4. Check for any error messages in the output

---

## 📊 Step 5: Check Deployment Time

**Make sure you're testing the NEW deployment:**

1. Go to **Vercel → Deployments**
2. Check the **timestamp** of latest "Ready" deployment
3. Should be **after** you added DATABASE_URL
4. If it's old (before adding env vars):
   - Click **"Redeploy"** again
   - Wait for new deployment to finish
   - Then test

---

## 🧪 Step 6: Test a Simple API Route

Try visiting this URL directly in your browser:
```
https://swipe-flame.vercel.app/api/jobs
```

### **Expected Response (Good):**
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

### **Actual Response (Bad):**
```json
{
  "message": "DATABASE_URL is not set"
}
```
or
```json
{
  "message": "connect ECONNREFUSED"
}
```

**This tells you the exact error!**

---

## 🔐 Step 7: Verify Database Password

### **Get Your Actual Password:**

1. Go to: https://supabase.com/dashboard/project/evdwovhikctwcjddcpzz/settings/database
2. Scroll to **"Connection string"**
3. Click **"URI"** tab
4. You'll see something like:
   ```
   postgresql://postgres.evdwovhikctwcjddcpzz:[YOUR-PASSWORD]@...
   ```
5. Copy the password (everything between `:` and `@`)

### **Update DATABASE_URL in Vercel:**

The format should be:
```
postgresql://postgres.evdwovhikctwcjddcpzz:YOUR_ACTUAL_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Common mistakes:**
- ❌ Missing password
- ❌ Wrong password
- ❌ Extra spaces
- ❌ Missing `?pgbouncer=true`
- ❌ Using direct URL instead of pooler URL

---

## 🚨 If Still Not Working: Nuclear Option

### **Reset Everything:**

1. **In Vercel:**
   - Delete ALL environment variables
   - Add them back one by one
   - Make sure to click "Save" after each
   - Redeploy

2. **In Supabase:**
   - Go to Settings → Database
   - Click "Reset database password"
   - Copy the new password
   - Update DATABASE_URL in Vercel

3. **Fresh Deployment:**
   - Make a small code change
   - Push to GitHub
   - Let Vercel auto-deploy
   - This guarantees fresh environment

---

## 📝 Checklist to Verify Everything:

### **Vercel:**
- [ ] DATABASE_URL exists in Environment Variables
- [ ] DATABASE_URL has correct format
- [ ] Password in DATABASE_URL is correct (no typos)
- [ ] All 5 environment variables are set
- [ ] Latest deployment is AFTER adding variables
- [ ] Deployment status = "Ready" (green checkmark)
- [ ] Checked Function Logs (see actual error)

### **Supabase:**
- [ ] SQL script ran without errors
- [ ] 11 tables exist in Table Editor
- [ ] `jobs` table has 5 sample rows
- [ ] `users` table exists (even if empty)
- [ ] Database password is correct

### **Testing:**
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Tried in incognito mode
- [ ] Visited `/api/jobs` directly (see error message)
- [ ] Checked Vercel Function Logs (see actual error)

---

## 🎯 Most Likely Issues:

### **Issue 1: Wrong Password (80% chance)**
```
Fix: Get password from Supabase, update DATABASE_URL, redeploy
```

### **Issue 2: Old Deployment (15% chance)**
```
Fix: Force redeploy without cache, wait for new deployment
```

### **Issue 3: Tables Don't Exist (5% chance)**
```
Fix: Re-run SQL script in Supabase SQL Editor
```

---

## 📞 What to Share With Me:

To help you further, I need:

1. **Screenshot of Vercel Environment Variables**
   - Hide the actual password value
   - But show that DATABASE_URL exists

2. **Screenshot of Vercel Function Logs**
   - The actual error message from the 500

3. **Screenshot of Supabase Table Editor**
   - Showing the list of tables

4. **What happens when you visit:**
   ```
   https://swipe-flame.vercel.app/api/jobs
   ```
   - Copy/paste the exact response

5. **Deployment timestamp:**
   - When did you add DATABASE_URL?
   - When was the latest deployment?
   - Is deployment AFTER adding the variable?

---

## ⚡ Quick Debug Command

Visit this URL in your browser:
```
https://swipe-flame.vercel.app/api/jobs
```

- If you see JSON with jobs → Database works, issue elsewhere
- If you see error message → That's your actual problem
- If you see 500 blank page → Check Vercel function logs

---

**Next Step: Check Vercel Function Logs to see the ACTUAL error!** 🔍

That will tell us exactly what's wrong.
