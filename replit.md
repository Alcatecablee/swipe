# SwipeJob South Africa - AI-Powered Job Matching Platform

A Tinder-style job application platform with AI auto-apply for the South African market. Built with React, Supabase, Express, and Groq AI.

## Architecture

- **Frontend**: React + TypeScript + Vite + shadcn/ui + TailwindCSS
- **Backend**: Express.js with API routes for AI processing
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth (email/password)
- **AI Service**: Groq (free tier) with Llama 3.3 70B model
- **State Management**: TanStack Query v5

## Current Features (MVP - October 2025)

### ✅ Implemented
- **Swipe interface** for job applications (apply/skip)
- **User authentication** with protected routes
- **Real-time job listings** from Supabase
- **AI Auto-Apply** - Generates professional cover letters using Groq AI
- **Application tracking** with status updates
- **User profiles** with skills, location, NQF level, languages
- **Work experience** tracking
- **Secure data access** with RLS policies
- **Dark mode** support
- **AI-generated cover letters** displayed in application cards
- **Application URLs** generated for job searches

### 🔧 AI Auto-Apply Features
- Uses Groq's free tier (Llama 3.3 70B Versatile model)
- Generates contextual cover letters based on user profile + job requirements
- Processes applications in batches (max 10 at a time for rate limiting)
- Validates AI-generated content before saving
- Shows AI processing status with badges
- Comprehensive error handling with user feedback

## Database Schema

- `users` - User profiles (linked to Supabase Auth)
- `jobs` - Job listings with sector, location, skills
- `applications` - Track user applications with status
- `swipes` - Record of all swipe actions
- `user_experience` - User work history

## Security

- Row Level Security (RLS) enforced on all tables
- Direct Supabase client calls from frontend (no backend proxy)
- User sessions managed by Supabase Auth
- All data access scoped to authenticated user

## Important Notes

- Supabase credentials stored in Replit Secrets (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)
- SQL schema file available at `supabase-schema.sql`
- **CRITICAL**: SQL trigger in `supabase-trigger.sql` must be executed in Supabase SQL Editor for automatic user profile creation
- All data queries use snake_case column names
- Frontend uses camelCase, mapped to snake_case for Supabase

## Recent Fixes (October 2025)

- ✅ Fixed critical UUID syntax bug in swipe query (was breaking after first swipe)
- ✅ Added comprehensive error handling with retry UI to all pages
- ✅ Fixed DOM nesting warnings in marketing components
- ✅ Created SQL trigger for automatic user profile creation (needs to be executed in Supabase)

## Product Roadmap - Full Vision

### 📋 Planned Features

#### Core Job Matching Flow
- [ ] **Resume Upload** - Parse and extract user data from uploaded resumes
- [ ] **LinkedIn Integration** - Import profile and references
- [ ] **Enhanced Job Cards** - Show remote/hybrid options, detailed location info
- [ ] **Application Templates** - Pre-fill applications and ask for user approval
- [ ] **Notifications** - Interview invites, status updates, feedback alerts

#### South African Local Features
- [ ] **Regional Filtering** - Filter by province/city (JHB, Durban, CPT, Eastern Cape, etc.)
- [ ] **Gig & Contract Work** - Support for non-full-time roles
- [ ] **Transport Cost Calculator** - Show commuting cost to job location
- [ ] **Skills Matching** - Suggest upskilling modules if user doesn't meet requirements
- [ ] **Language & Cultural Matching** - Filter by language requirements (isiZulu, isiXhosa, Afrikaans, etc.)
- [ ] **WhatsApp Apply** - Chat interface for informal users
- [ ] **NQF Level Integration** - Better qualification matching

#### Employer Dashboard
- [ ] **Employer Swipe Interface** - Swipe on candidates
- [ ] **Candidate Shortlisting** - Save and organize potential hires
- [ ] **Custom Questions** - Request additional info from candidates
- [ ] **Analytics Dashboard** - Resume conversion rates, geographic activity

#### Monetization Features
- [ ] **Recruitment Fees** - Charge employers for successful hires
- [ ] **Premium Access** - Enhanced candidate access for employers
- [ ] **Candidate Boost** - Paid priority in job queue
- [ ] **Analytics & Insights** - Data reports for employers

### 🔒 Security & Technical Debt

#### Critical (Must Fix Before Production)
- **Backend Authentication** - Add JWT/session validation middleware
  - Currently: `userId` is client-supplied (trusted but can be spoofed)
  - Fix: Derive `userId` from authenticated session token
  - Impact: Prevents PII leakage and unauthorized application processing
  
#### Current Security Measures (In Place)
- ✅ Ownership verification (checks user owns application before processing)
- ✅ State validation (only processes "pending" applications)
- ✅ Input validation (Zod schemas on all API inputs)
- ✅ Rate limiting (max 10 applications per batch request)
- ✅ AI content validation (minimum length checks)
- ✅ Update verification (confirms rows were actually modified)

#### Recommended Before Scale
- [ ] Implement Supabase RLS policies (currently basic policies)
- [ ] Add API rate limiting middleware (express-rate-limit)
- [ ] Implement request logging and monitoring
- [ ] Add CSRF protection for state-changing operations
- [ ] Set up proper error tracking (Sentry, LogRocket, etc.)

## Known Limitations

### Current MVP Limitations
- Filter functionality exists in UI but not connected to backend queries (logs to console only)
- Profile editing UI exists but lacks backend mutations to save changes
- AI Auto-Apply generates Google search URLs (not actual company application links)
- Backend API endpoints accept client-supplied userId (needs auth middleware)
- No actual job application submission (just tracks intent + generates cover letter)
