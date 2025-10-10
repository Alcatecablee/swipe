# Get the Correct DATABASE_URL

## ❌ **Connection Issue**

The direct connection (`db.evdwovhikctwcjddcpzz.supabase.co:5432`) is using IPv6 which doesn't work in this environment.

**Error:** `ENETUNREACH 2406:da18:...` (IPv6 address)

---

## ✅ **Solution: Use Connection Pooling URL**

### **Step-by-Step:**

1. **Go to Supabase Dashboard:**
   https://supabase.com/dashboard/project/evdwovhikctwcjddcpzz

2. **Navigate to Settings:**
   - Click ⚙️ **Project Settings** (bottom left)
   - Click 📊 **Database** (left sidebar)

3. **Scroll to "Connection string" section**

4. **Important - Select the RIGHT tab:**
   - ❌ NOT "URI" (that's what you gave me - doesn't work)
   - ✅ Click **"Connection pooling"** tab (or "Pooler" tab)

5. **Configuration:**
   - **Mode:** Select "Transaction" (dropdown)
   - This will show a connection string with port **6543** (not 5432)

6. **Copy the Connection String:**
   It should look like:
   ```
   postgresql://postgres.evdwovhikctwcjddcpzz:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

7. **Replace `[YOUR-PASSWORD]` with:** `@@7kfNLkPRyiVmy`

8. **Paste the full string here**

---

## 🎯 **What I Need:**

The connection pooling URL in format:
```
postgresql://postgres.evdwovhikctwcjddcpzz:@@7kfNLkPRyiVmy@aws-0-[region].pooler.supabase.com:6543/postgres
```

**Key differences:**
- ✅ Uses `pooler.supabase.com` (not `db.supabase.co`)
- ✅ Port **6543** (not 5432)
- ✅ Has `postgres.[project-ref]` as username format

---

## 📸 **Or Send Screenshot**

If easier, just screenshot the "Connection pooling" section and I can construct it!

---

**Waiting for the connection pooling URL...**
