# Database Setup Instructions

## ⚠️ **Missing: DATABASE_URL**

To complete backend setup, you need to add your Supabase database connection string.

---

## 📝 **How to Get DATABASE_URL**

### **Step 1: Go to Supabase Dashboard**
1. Visit: https://supabase.com/dashboard
2. Select your project: `evdwovhikctwcjddcpzz`

### **Step 2: Get Connection String**
1. Click **Project Settings** (gear icon, bottom left)
2. Click **Database** (left sidebar)
3. Scroll to **Connection string**
4. Select **URI** tab
5. Enable **Use connection pooling**
6. Select **Session** mode
7. Copy the connection string

It will look like:
```
postgresql://postgres.evdwovhikctwcjddcpzz:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### **Step 3: Add to .env**
1. Open `.env` file
2. Replace `[YOUR-DB-PASSWORD]` with your actual database password
3. Uncomment the `DATABASE_URL` line

Example:
```env
DATABASE_URL=postgresql://postgres.evdwovhikctwcjddcpzz:YourActualPasswordHere@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## 🔧 **After Adding DATABASE_URL**

Run database migrations:
```bash
npm run db:push
```

This will:
- Create all tables in your Supabase database
- Set up Row Level Security policies
- Enable authentication

---

## ✅ **What Works Now (Without DATABASE_URL)**

**Frontend Features:**
- ✅ Supabase Authentication (signup/login)
- ✅ Supabase client queries (uses VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
- ✅ AI features (Groq API)

**Backend Features:**
- ❌ API routes (need DATABASE_URL)
- ❌ Database queries (need DATABASE_URL)
- ❌ User profiles (need DATABASE_URL)

---

## 📊 **Current Status**

**Configured:**
- ✅ Supabase URL
- ✅ Supabase Anonymous Key
- ✅ Supabase Service Role Key
- ✅ Groq API Key

**Missing:**
- ❌ DATABASE_URL (required for backend)

---

## 🚀 **Quick Test (What I'll Do Now)**

Even without DATABASE_URL, I can test:
1. ✅ Frontend build (Vite)
2. ✅ Groq AI API connection
3. ✅ Supabase Auth setup
4. ✅ Frontend components

Then once you add DATABASE_URL, we can test:
- Backend API routes
- Database operations
- Full end-to-end flow

---

**Want me to proceed with frontend testing while you get the DATABASE_URL?**
