# Admin Panel - Complete Setup Guide

## ✅ What's Already Built

1. **Backend (Complete)**
   - ✅ Admin middleware (`server/admin-middleware.ts`)
   - ✅ Admin routes (`server/admin-routes.ts`)
   - ✅ Database schema updated with `isAdmin` field
   - ✅ Routes integrated in `server/index.ts`

2. **Frontend (Partial)**
   - ✅ Admin Dashboard (`client/src/pages/admin/AdminDashboard.tsx`)
   - ✅ Admin Layout (`client/src/components/AdminLayout.tsx`)

## 🚧 What You Need to Complete

### Step 1: Create Remaining Admin Pages

Create these files in `client/src/pages/admin/`:

**`AdminJobs.tsx`** - Job Management
**`AdminUsers.tsx`** - User Management  
**`AdminApplications.tsx`** - Application Monitoring
**`AdminAnalytics.tsx`** - Analytics Dashboard

### Step 2: Update App Routes

Add to `client/src/App.tsx`:

```tsx
import AdminLayout from '@/components/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminJobs from '@/pages/admin/AdminJobs';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminApplications from '@/pages/admin/AdminApplications';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';

// In Router component:
<Route path="/admin">
  <ProtectedRoute>
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  </ProtectedRoute>
</Route>
<Route path="/admin/jobs">
  <ProtectedRoute>
    <AdminLayout>
      <AdminJobs />
    </AdminLayout>
  </ProtectedRoute>
</Route>
<Route path="/admin/users">
  <ProtectedRoute>
    <AdminLayout>
      <AdminUsers />
    </AdminLayout>
  </ProtectedRoute>
</Route>
<Route path="/admin/applications">
  <ProtectedRoute>
    <AdminLayout>
      <AdminApplications />
    </AdminLayout>
  </ProtectedRoute>
</Route>
<Route path="/admin/analytics">
  <ProtectedRoute>
    <AdminLayout>
      <AdminAnalytics />
    </AdminLayout>
  </ProtectedRoute>
</Route>
```

### Step 3: Database Migration

Run this SQL to add admin field:

```sql
-- Add is_admin column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Make yourself admin (replace with your email)
UPDATE users 
SET is_admin = TRUE 
WHERE email = 'your-email@example.com';
```

### Step 4: Test Admin Access

1. Run migration to add `is_admin` column
2. Set yourself as admin
3. Login and visit `/admin`
4. Should see admin dashboard

## 📋 Admin Features

### Dashboard (`/admin`)
- Total users, jobs, applications
- Recent signups (7 days)
- Application status breakdown
- Email vs manual stats
- Platform health metrics

### Jobs Management (`/admin/jobs`)
- List all jobs
- Add new job manually
- Edit job details
- Delete job
- Import CSV
- Toggle active/inactive
- See application count per job

### User Management (`/admin/users`)
- List all users
- View user details
- See user's applications
- Make user premium (for testing)
- Disable/enable accounts
- View user badges

### Applications (`/admin/applications`)
- View all applications
- Filter by status
- See job + user details
- Monitor email submissions
- Download data

### Analytics (`/admin/analytics`)
- Signup trends
- Application trends
- Top jobs by applications
- Email vs manual breakdown
- Custom date ranges

## 🎨 Design Theme

All admin pages follow the existing app theme:
- Same color scheme (primary green)
- Same UI components (shadcn/ui)
- Responsive design
- Dark mode support
- Consistent spacing and typography

## 🔒 Security

- All routes require authentication (Supabase Auth)
- Admin middleware checks `isAdmin` field
- Non-admin users get 403 Forbidden
- Audit logs (add later if needed)

## 🚀 Quick Start

```bash
# 1. Run database migration
psql # or Supabase SQL Editor
# Paste the ALTER TABLE command above

# 2. Make yourself admin
UPDATE users SET is_admin = TRUE WHERE email = 'your@email.com';

# 3. Restart server
npm run dev

# 4. Login and visit
http://localhost:5000/admin

# 5. You should see the dashboard!
```

## 📊 API Endpoints Created

```
GET  /api/admin/dashboard          - Dashboard stats
GET  /api/admin/jobs               - List jobs
GET  /api/admin/jobs/:id           - Get job
POST /api/admin/jobs               - Create job
PATCH /api/admin/jobs/:id          - Update job
DELETE /api/admin/jobs/:id         - Delete job

GET  /api/admin/users              - List users
GET  /api/admin/users/:id          - Get user details
PATCH /api/admin/users/:id         - Update user

GET  /api/admin/applications       - List applications

GET  /api/admin/analytics          - Platform analytics
```

## 💡 Tips

### Add Job Manually

```typescript
// POST /api/admin/jobs
{
  "title": "Frontend Developer",
  "company": "Takealot",
  "salary": "R30,000 - R40,000",
  "location": "Cape Town",
  "description": "Build awesome UIs...",
  "skills": ["React", "TypeScript"],
  "applicationEmail": "jobs@takealot.com",
  "applicationMethod": "email"
}
```

### Make User Premium

```typescript
// PATCH /api/admin/users/:userId
{
  "isPremium": true,
  "dailySwipeLimit": 999999
}
```

### Filter Applications

```typescript
// GET /api/admin/applications?status=submitted
// GET /api/admin/applications?status=pending
```

## 🔧 Customization

### Add New Admin Page

1. Create page in `client/src/pages/admin/YourPage.tsx`
2. Add route in `App.tsx`
3. Add navigation item in `AdminLayout.tsx`
4. Create API endpoint in `server/admin-routes.ts`

### Add New Stat to Dashboard

Edit `server/admin-routes.ts`:

```typescript
// In GET /api/admin/dashboard
const yourNewStat = await db
  .select({ count: sql`count(*)` })
  .from(yourTable)
  .where(yourCondition);

// Return in response
res.json({
  // ... existing stats
  yourNewStat: Number(yourNewStat[0]?.count || 0),
});
```

Edit `client/src/pages/admin/AdminDashboard.tsx`:

```typescript
// Add to interface
interface DashboardStats {
  // ... existing
  yourNewStat: number;
}

// Display in UI
<Card className="p-6">
  <p className="text-3xl font-bold">{stats.yourNewStat}</p>
  <p className="text-sm text-muted-foreground">Your New Metric</p>
</Card>
```

## ⚠️ Important Notes

1. **First-time setup:** Run the database migration to add `is_admin` column
2. **Admin access:** Must set `is_admin = TRUE` in database for at least one user
3. **Security:** Don't expose admin routes publicly - always check auth
4. **CSV import:** Use existing `/api/import-jobs-csv` endpoint (already built)

## 📝 Next Steps

After basic admin is working:

1. **Add job CSV import UI** (backend already exists)
2. **Add user search** (by email/name)
3. **Add application export** (download CSV)
4. **Add audit logs** (track admin actions)
5. **Add email templates** (customize automated emails)
6. **Add settings page** (platform configuration)

## 🎯 What You Can Do Now

With admin panel, you can:

✅ Add jobs manually (no scraping needed)
✅ Manage users (make premium, disable)
✅ Monitor applications
✅ View platform stats
✅ Track email vs manual applications
✅ See which jobs are popular
✅ Analyze growth trends

This gives you **full control** over your platform without touching the database directly!

---

**Admin panel is 80% complete. Just add the remaining page files and routes, then you're done!**
