SwipeJob South Africa - AI-Powered Job Matching Platform
A Tinder-style job application platform with AI auto-apply for the South African market. Built with React, Supabase, Express, and Groq AI.

Architecture
Frontend: React + TypeScript + Vite + shadcn/ui + TailwindCSS
Backend: Express.js with API routes for AI processing
Database: Supabase PostgreSQL with Row Level Security
Authentication: Supabase Auth (email/password + OAuth)
AI Service: Groq (free tier) with Llama 3.3 70B model
State Management: TanStack Query v5
Current Features (MVP - October 2025)
✅ Implemented (Sprint 1-6 Complete!)
Core Platform Features
Swipe interface for job applications (apply/skip)
User authentication with protected routes
Real-time job listings from Supabase
AI-powered cover letters using Groq AI (Llama 3.3 70B)
Application tracking with status updates
User profiles with skills, location, NQF level, languages
Work experience tracking
Secure data access with RLS policies
Dark mode support
🎯 Sprint 1: Resume Upload & AI Parsing (COMPLETE)
✅ Resume upload (PDF/image support, max 5MB)
✅ AI-powered resume parsing - extracts skills, experience, education, contact info
✅ Resume preview and manual edit UI
✅ Database schema with resume fields
✅ Resume text storage for AI processing
🚀 Sprint 2: Enhanced Onboarding "Sorce Passport" (COMPLETE)
✅ Multi-step onboarding wizard (2-5 minute setup)
✅ Resume upload flow with drag-and-drop
✅ AI parsing with preview & edit
✅ Preferences collection (job title, salary, work type, location)
✅ Profile completion tracking
⏳ OAuth integration (Google/LinkedIn) - pending external config
🎮 Sprint 3: Freemium Model & Gamification (COMPLETE)
✅ Daily swipe limits - 50 free swipes/day, unlimited for premium
✅ Swipe counter badge - Real-time remaining swipes display
✅ Premium user support - Unlimited swipes flag
✅ Referral system - Earn bonus swipes by inviting friends
Referrer gets +10 permanent swipes
New user gets +25 bonus swipes
Unique referral codes (format: SJ3A7B9C)
✅ Daily reset logic - Automatic midnight swipe refresh
✅ Backend API - Swipe limit enforcement with retry logic
🧠 Sprint 4: Smart Matching & Achievement System (COMPLETE)
✅ Smart matching algorithm - ML-based job ranking with:
Skill overlap scoring (60% weight)
Experience level matching (15% weight)
Salary compatibility (15% weight)
Location matching (10% weight)
✅ Achievement badges system with 10 badges:
First Swipe, Swipe Master (10, 50 swipes)
First Application, Career Climber (5, 10, 25 apps)
Profile Pro, Early Bird, Referral Master
✅ Badge tracking - Auto-awards on milestones
✅ Badge API endpoints - Real-time badge notifications
🤖 Sprint 6: AI Auto-Apply & Interview Prep (COMPLETE)
✅ Auto-form filling service - Generates application data for external ATS:
Personal details auto-population
Work authorization responses
Salary expectations
Tailored "why interested" statements
Key qualifications matching
✅ ATS keyword extraction - AI identifies must-have keywords from job descriptions
✅ Interview prep AI generator:
Behavioral questions with STAR method guidance
Technical questions based on role requirements
Culture fit questions
Smart questions to ask interviewers
✅ Answer coaching - Personalized answer suggestions
✅ Practice feedback - AI analyzes practice answers with scores
✅ All AI features use Groq (Llama 3.3 70B Versatile model)
🔧 AI Capabilities Summary
Resume parsing - Extracts structured data from documents
Cover letter generation - Contextual, professional cover letters
Application auto-fill - Pre-fills ATS forms intelligently
Interview prep - Generates tailored practice questions
Answer coaching - STAR method guidance & feedback
ATS optimization - Keyword extraction for better ranking
Batch processing - Max 10 applications at once
Error handling - Comprehensive user feedback
Database Schema
users - User profiles with resume data, preferences, swipe limits, referral codes, Stripe integration
jobs - Job listings with sector, location, skills, requirements
applications - Application tracking with status, cover letters, AI processing flags
swipes - Record of all swipe actions (apply/skip)
user_experience - User work history and roles
badges - Achievement badges (10 types: swipes, applications, profile, referrals)
Security
Row Level Security (RLS) enforced on all tables
Direct Supabase client calls from frontend (no backend proxy)
User sessions managed by Supabase Auth
All data access scoped to authenticated user
API Endpoints (Express Backend)
Resume & Profile
POST /api/parse-resume - AI resume parsing (Groq)
POST /api/profile - Update user profile
GET /api/profile/:userId - Get user profile
Smart Matching & Swipes
GET /api/jobs/:userId - Get ranked job matches (smart algorithm)
GET /api/swipe-limits/:userId - Check remaining swipes
POST /api/swipe - Create swipe (with limit enforcement & badge checks)
Badges & Referrals
GET /api/badges/:userId - Get user badges
POST /api/apply-referral - Apply referral code for bonus swipes
GET /api/referral-stats/:userId - Get referral statistics
AI Auto-Apply & Interview Prep
POST /api/generate-application-data - Generate ATS form data
POST /api/extract-ats-keywords - Extract job keywords
POST /api/generate-interview-questions - AI interview prep
POST /api/interview-answer-suggestion - Get answer coaching
POST /api/analyze-interview-answer - Practice answer feedback
Cover Letters & Applications
POST /api/generate-cover-letter - AI cover letter generation
POST /api/batch-process - Batch process pending applications
Important Notes
AI Service: Groq API key required (GROQ_API_KEY)
Supabase: Credentials in Replit Secrets (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
Payment Gateway: Stripe integration ready (requires SA-compatible alternative like PayFast for South African users)
SQL Setup: Schema in supabase-schema.sql, trigger in supabase-trigger.sql
RLS Policies: Must be configured in Supabase for data security
Column Naming: Database uses snake_case, frontend uses camelCase
Enhanced Product Roadmap - Sorce-Inspired Vision
🎯 IMMEDIATE PRIORITY - Phase 1 (Current Sprint)
Step 1: Enhanced Onboarding & Resume Upload
 Resume Upload Feature - PDF/Image upload with file validation
 Resume Parsing AI - Extract skills, experience, education from uploaded documents
 Resume Text Input - Allow copy/paste text as alternative
 Quick Setup Flow - 2-5 minute profile creation (Sorce Passport)
 OAuth Integration - Google/Apple/LinkedIn sign-in
 Email/Phone Verification - One-time code verification
 Profile Preview - Show extracted data with manual edit option
 Preference Wizard - Job title, location, salary, seniority filters
Step 2: Enhanced Swipe Interface
 Swipe Gestures - Touch/drag support for mobile-like experience
 Enhanced Job Cards - Salary estimates, remote/hybrid badges, key requirements preview
 Daily Swipe Limits - Free tier: 50-100 swipes/day, Premium: unlimited
 Swipe Counter - Display remaining swipes for the day
 Smart Algorithm - ML-based matching using skill overlap, past swipes, user preferences
 Undo Swipe - Option to undo last swipe (premium feature)
 Match Score Display - Show "80% skill match" on cards
 Company Ratings - Display employer ratings/reviews on cards
Step 3: Auto-Apply Enhancement
 Instant Application Trigger - Right swipe = immediate auto-apply
 Form Auto-Fill - Parse and fill external ATS forms (Greenhouse, Lever, etc.)
 Custom Question AI - Generate answers for employer-specific questions
 Application Preview - Show preview before final submission (optional setting)
 Submission Confirmation - In-app notifications: "Applied! Cover letter sent"
 ATS Compatibility - Support 1,000+ ATS systems
 CAPTCHA Handler - Notify user when manual verification needed
 Application Templates - Pre-filled forms with user approval workflow
Step 4: Application Tracking & Notifications
 Enhanced Dashboard - Active applications with real-time status
 Status Updates - Pending, Submitted, Viewed, Interview, Rejected, Hired
 Push Notifications - Application confirmed, employer viewed, interview invite
 Follow-Up Reminders - "Nudge this application?" suggestions
 Application Analytics - Personal insights, conversion rates
 Reapplication Logic - Smart suggestions for reapplying with improved profile
 Interview Scheduler - Calendar integration for interview bookings
Step 5: Referral & Gamification
 Referral Program - Invite friends, earn bonus swipes/credits
 Achievement Badges - Rewards for profile completion, applications sent
 Swipe Statistics - Show user patterns, success rates
 Profile Completion Score - Gamified profile building with progress bar
 Daily Streaks - Encourage daily engagement with streak tracking
 Leaderboard - Top referrers, most active users (optional)
💎 Premium Features (Freemium Model)
Free Tier
50-100 swipes per day
Basic AI cover letter generation
Application tracking
Email notifications
Basic profile features
Premium Tier (R99/month or $9.99/month)
 Unlimited Swipes - No daily limits
 Advanced AI - A/B tested cover letters, interview coaching
 Priority Matching - Top of employer queue
 Analytics Dashboard - "Your apps convert 25% better in tech"
 Undo Swipes - Correct mistakes
 Profile Boost - Increased visibility to employers
 Interview Preparation - AI-generated practice questions
 Resume Builder - Professional templates and AI suggestions
🚀 Implementation Roadmap by Sprint
Sprint 1 (Week 1-2): Resume Upload & Parsing
Goal: Enable resume upload and AI parsing

 Add file upload component (PDF/image support)
 Integrate OCR for image resumes (Tesseract.js or Google Vision API)
 Create AI resume parser (extract: name, email, skills, experience, education)
 Build resume preview/edit UI
 Update database schema for resume storage
 Add resume data to user profile
Sprint 2 (Week 3-4): OAuth & Enhanced Onboarding
Goal: Streamline user registration

 Implement Google OAuth (Supabase Auth)
 Implement LinkedIn OAuth for profile import
 Create step-by-step onboarding wizard
 Add preference collection (job title, location, salary, etc.)
 Build "Sorce Passport" profile hub
 Add email/phone verification flow
Sprint 3 (Week 5-6): Swipe Limits & Gamification
Goal: Add freemium model and engagement features

 Implement daily swipe counter (50 free swipes/day)
 Create swipe limit enforcement logic
 Build referral system (invite friends = bonus swipes)
 Add achievement badges UI
 Create profile completion score
 Build swipe statistics dashboard
Sprint 4 (Week 7-8): Smart Matching Algorithm
Goal: Improve job recommendations

 Build skill matching algorithm (overlap calculation)
 Track swipe patterns (accepted/rejected job types)
 Create ML-based recommendation engine
 Display match scores on job cards
 Filter jobs by company ratings
 Add "jobs you might like" section
Sprint 5 (Week 9-10): Auto-Apply Enhancement
Goal: Automate external application forms

 Research ATS integrations (Greenhouse, Lever, Workday)
 Build form auto-fill bot (Puppeteer/Playwright)
 Generate custom question responses via AI
 Add application preview before submission
 Implement CAPTCHA detection and user notification
 Create submission confirmation flow
Sprint 6 (Week 11-12): Premium Features & Monetization
Goal: Launch premium tier

 Build subscription system (Stripe/PayFast integration)
 Implement unlimited swipes for premium users
 Add advanced AI features (A/B tested cover letters)
 Create priority matching queue
 Build analytics dashboard for premium users
 Add undo swipe functionality
Sprint 7 (Week 13-14): Notifications & Tracking
Goal: Enhance user engagement

 Implement push notifications (web push API)
 Create email notification system
 Build real-time status tracking
 Add employer "viewed profile" notifications
 Create interview invite workflow
 Build follow-up reminder system
Sprint 8 (Week 15-16): Mobile Optimization
Goal: Perfect mobile experience

 Optimize swipe gestures for touch screens
 Improve mobile UI/UX (card animations)
 Add offline mode (cache jobs locally)
 Implement Progressive Web App (PWA)
 Add "Install App" prompt
 Optimize for low-end devices
📱 Mobile App (Future Phase)
React Native Implementation
 iOS app (React Native)
 Android app (React Native)
 Biometric login (Face ID/Fingerprint)
 Camera resume upload
 Voice search for jobs
 Location-based alerts
 Quick apply from notifications
 Offline job browsing
🌍 South African Local Features
Regional Customization
 Province/city filtering (JHB, CPT, Durban, etc.)
 Transport cost calculator
 NQF level matching
 Multi-language support (Zulu, Xhosa, Afrikaans, etc.)
 WhatsApp integration
 POPIA compliance
 PayFast payment integration
 Gig/contract work support
💼 Employer Platform (Phase 2)
Employer Features
 Employer registration & dashboard
 Job posting management
 Candidate swipe interface (reverse swipe)
 Shortlist and organize candidates
 Custom application questions
 Analytics dashboard
 Recruitment fee system (pay per hire)
 Premium employer features (boosted visibility)
 EE compliance reporting
📊 Success Metrics (KPIs)
User Metrics
Monthly Active Users (MAU) - Target: 10,000 by Month 6
Daily Active Users (DAU) - Target: 2,000 by Month 6
User Retention Rate - Target: 40% (30-day retention)
Profile Completion Rate - Target: 75%
Time to First Application - Target: < 5 minutes from signup
Applications per User - Target: 5+ per month
Engagement Metrics
Swipes per Session - Target: 20-50 jobs viewed
Application Conversion - Target: 15% (swipe to apply)
AI Cover Letter Usage - Target: 80% of applications
Return Visit Rate - Target: 50% within 7 days
Referral Conversion - Target: 20% invited users sign up
Business Metrics
Monthly Recurring Revenue (MRR) - Target: R50,000 by Month 12
Premium Conversion Rate - Target: 5% of free users upgrade
Customer Acquisition Cost (CAC) - Target: < R50 per user
Lifetime Value (LTV) - Target: R200+ per employer
Placement Success Rate - Target: 10% of applications lead to hire
🔒 Security & Compliance
Critical Security Tasks
 Backend authentication middleware (JWT/session validation)
 Implement proper RLS policies in Supabase
 Add API rate limiting (express-rate-limit)
 CSRF protection for state-changing operations
 Error tracking (Sentry/LogRocket)
 Request logging and monitoring
 POPIA compliance (data privacy)
 Secure file upload (virus scanning)
 Encrypted resume storage
🎯 Current MVP Limitations to Address
High Priority Fixes:

Resume upload not implemented → Sprint 1
No daily swipe limits → Sprint 3
No referral program → Sprint 3
No OAuth login → Sprint 2
No smart matching algorithm → Sprint 4
No auto-form filling → Sprint 5
No premium tier → Sprint 6
Backend authentication needs JWT validation
Known Issues:

Filter functionality exists in UI but not connected to backend queries
Profile editing UI lacks backend mutations
AI generates Google search URLs (not actual application links)
Backend accepts client-supplied userId (needs auth middleware)
No actual external job application submission
🏆 Competitive Advantages
Our Edge:

AI-Powered Simplicity - One-swipe applications vs 30-60 min forms
10x Faster Applying - AI handles cover letters, forms, custom questions
Mobile-First - Built for smartphone job hunting
South African Focus - POPIA compliant, local payments, NQF integration
Freemium Model - Always free for job seekers, employers pay
Gamification - Referrals, badges, streaks make job hunting engaging
1,000+ ATS Support - Auto-apply to most company career portals
📝 Technical Debt & Improvements
Backend
 Add JWT/session authentication middleware
 Connect filters to actual database queries
 Implement profile editing mutations
 Add comprehensive input validation
 Set up proper error tracking
 Implement request logging
Database
 Optimize query performance (indexes)
 Add data migration scripts
 Implement backup strategy
 Add audit logging tables
Frontend
 Improve error handling UI
 Add loading skeletons
 Optimize bundle size
 Implement code splitting
 Add accessibility features
 Improve mobile responsiveness
Environment Setup
Required Secrets
VITE_SUPABASE_URL - Supabase project URL
VITE_SUPABASE_ANON_KEY - Supabase anonymous key
GROQ_API_KEY - Groq AI API key for cover letter generation
STRIPE_SECRET_KEY - For premium subscriptions (future)
PAYFAIT_SECRET - For SA payments (future)
Database
SUPABASE_URL: https://evdwovhikctwcjddcpzz.supabase.co SUPABASE_ANON: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2ZHdvdmhpa2N0d2NqZGRjcHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Mzc0NzIsImV4cCI6MjA2NzUxMzQ3Mn0.BTNWHzz3d9lwUOM-CaYi1O5qlu9WgTj5VR3sxVVIiUU
