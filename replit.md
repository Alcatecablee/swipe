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

#### AI & Machine Learning Enhancements
- [ ] **Smart Job Recommendations** - ML-based job matching based on user behavior
- [ ] **Resume Parsing AI** - Extract and structure data from PDFs/images
- [ ] **Interview Preparation** - AI-generated practice questions for specific roles
- [ ] **Salary Predictor** - Suggest market-appropriate salary expectations
- [ ] **Skills Gap Analysis** - Identify missing skills and suggest courses
- [ ] **Application Success Predictor** - Show likelihood of getting interview
- [ ] **Personalized Cover Letters** - Dynamic templates based on company culture
- [ ] **Auto-fill Application Forms** - OCR and form automation for external sites

#### Mobile Application
- [ ] **React Native App** - iOS and Android native apps
- [ ] **Offline Mode** - Cache jobs for viewing without internet
- [ ] **Push Notifications** - Real-time alerts for job matches and updates
- [ ] **Biometric Login** - Face ID / Fingerprint authentication
- [ ] **Quick Apply** - One-tap application from push notification
- [ ] **Camera Resume Upload** - Take photo of printed resume
- [ ] **Voice Search** - Search jobs by speaking
- [ ] **Location-Based Alerts** - Notify when jobs appear nearby

#### User Experience Improvements
- [ ] **Onboarding Flow** - Interactive tutorial for first-time users
- [ ] **Profile Completion Score** - Gamified profile building
- [ ] **Daily Job Recommendations** - Curated job feed based on preferences
- [ ] **Swipe Statistics** - Show user their application patterns
- [ ] **Achievement Badges** - Rewards for completing profile, applying to jobs
- [ ] **Referral Program** - Invite friends and earn credits
- [ ] **Dark/Light Mode Toggle** - User preference persistence
- [ ] **Accessibility Features** - Screen reader support, high contrast mode
- [ ] **Multi-language Support** - Support for 11 official SA languages
- [ ] **Progressive Web App** - Install as app on mobile browsers

#### Marketing & Growth Features
- [ ] **Social Sharing** - Share job postings on social media
- [ ] **Success Stories** - Highlight user testimonials and placements
- [ ] **Blog & Resources** - Career advice, interview tips, CV templates
- [ ] **Email Campaigns** - Weekly job digests, application reminders
- [ ] **Referral Tracking** - Track and reward successful referrals
- [ ] **Landing Pages** - SEO-optimized pages for different sectors
- [ ] **Affiliate Program** - Partner with universities and training providers
- [ ] **Events Calendar** - Job fairs, webinars, networking events
- [ ] **Company Profiles** - Detailed employer branding pages
- [ ] **Video Testimonials** - User success stories and employer reviews

#### Analytics & Reporting
- [ ] **User Dashboard** - Personal analytics and application insights
- [ ] **Application Funnel** - Track from swipe to hire
- [ ] **Employer Analytics** - Candidate engagement and conversion metrics
- [ ] **Geographic Heatmaps** - Job density and application patterns by region
- [ ] **Skills Demand Analysis** - Most requested skills in market
- [ ] **Salary Benchmarking** - Industry and role-based salary data
- [ ] **Time-to-Hire Metrics** - Average application to hire duration
- [ ] **A/B Testing Framework** - Test features and optimize conversion
- [ ] **Custom Reports** - Exportable data for employers
- [ ] **Predictive Analytics** - Forecast hiring trends and demand

#### Platform Integrations
- [ ] **LinkedIn OAuth** - Import profile and network connections
- [ ] **Indeed API** - Aggregate external job listings
- [ ] **Pnet Integration** - Cross-post to other SA job boards
- [ ] **Google Calendar** - Sync interview appointments
- [ ] **Zoom/Teams Integration** - Schedule virtual interviews
- [ ] **Payment Gateway** - Stripe/PayFast for SA payments
- [ ] **SMS Gateway** - Clickatell/Twilio for notifications
- [ ] **Email Service** - SendGrid/Mailgun for transactional emails
- [ ] **Cloud Storage** - S3/GCS for resume and document storage
- [ ] **CRM Integration** - Salesforce/HubSpot for employer leads

#### Compliance & Legal
- [ ] **POPIA Compliance** - Protection of Personal Information Act adherence
- [ ] **GDPR Support** - Data privacy for international users
- [ ] **Terms of Service** - Legal agreements for users and employers
- [ ] **Privacy Policy** - Clear data handling and storage policies
- [ ] **Cookie Consent** - POPIA-compliant cookie management
- [ ] **Data Export** - Allow users to download their data
- [ ] **Right to Deletion** - POPIA-mandated data removal
- [ ] **Audit Logging** - Track data access and modifications
- [ ] **Employment Equity** - Support EE reporting for employers
- [ ] **Tax Compliance** - SARS-compliant payment processing

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

### 🗓️ Implementation Phases

#### Phase 1: MVP Enhancement (Months 1-2)
**Goal**: Fix critical issues and improve core user experience
- [ ] Implement backend authentication middleware
- [ ] Connect filter functionality to backend queries
- [ ] Add profile editing mutations
- [ ] Improve RLS policies in Supabase
- [ ] Set up error tracking (Sentry)
- [ ] Add API rate limiting
- [ ] Implement email notifications
- [ ] Create comprehensive onboarding flow
- [ ] Add profile completion gamification

#### Phase 2: Local Market Fit (Months 3-4)
**Goal**: Optimize for South African job market
- [ ] Regional filtering by province/city
- [ ] Transport cost calculator
- [ ] WhatsApp integration for applications
- [ ] Multi-language support (Zulu, Xhosa, Afrikaans, etc.)
- [ ] NQF level matching improvements
- [ ] Gig & contract work support
- [ ] Skills gap analysis and course suggestions
- [ ] POPIA compliance implementation
- [ ] PayFast payment integration

#### Phase 3: Employer Platform (Months 5-6)
**Goal**: Build employer-side features for revenue
- [ ] Employer registration and dashboard
- [ ] Employer swipe interface for candidates
- [ ] Candidate shortlisting and management
- [ ] Custom application questions
- [ ] Basic analytics dashboard
- [ ] Job posting management
- [ ] Recruitment fee payment system
- [ ] Premium employer features
- [ ] Employer CRM integration

#### Phase 4: AI & Automation (Months 7-8)
**Goal**: Advanced AI features for competitive advantage
- [ ] Resume parsing with OCR
- [ ] Smart job recommendations (ML model)
- [ ] Interview preparation AI
- [ ] Salary prediction model
- [ ] Application success predictor
- [ ] Auto-fill application forms
- [ ] Company culture analysis
- [ ] Skills demand forecasting

#### Phase 5: Mobile & Scale (Months 9-12)
**Goal**: Mobile app launch and platform scaling
- [ ] React Native mobile app (iOS & Android)
- [ ] Push notifications infrastructure
- [ ] Offline mode implementation
- [ ] Biometric authentication
- [ ] Voice search feature
- [ ] Performance optimization
- [ ] CDN implementation
- [ ] Database sharding strategy
- [ ] Load balancing setup
- [ ] Progressive Web App optimization

#### Phase 6: Market Expansion (Year 2)
**Goal**: Geographic and feature expansion
- [ ] Platform integrations (LinkedIn, Indeed, Pnet)
- [ ] Blog and content marketing
- [ ] Video testimonials platform
- [ ] Events and webinars calendar
- [ ] Affiliate program with universities
- [ ] Advanced analytics and reporting
- [ ] A/B testing framework
- [ ] Success stories showcase
- [ ] Referral program enhancement
- [ ] International expansion (Africa)

### 📊 Success Metrics (KPIs)

#### User Metrics
- **Monthly Active Users (MAU)** - Target: 10,000 by Month 6
- **Daily Active Users (DAU)** - Target: 2,000 by Month 6
- **User Retention Rate** - Target: 40% (30-day retention)
- **Average Session Duration** - Target: 8+ minutes
- **Profile Completion Rate** - Target: 75%
- **Application Conversion** - Target: 15% (swipe to apply)

#### Engagement Metrics
- **Swipes per Session** - Target: 15+ jobs viewed
- **Applications per User** - Target: 5+ per month
- **AI Cover Letter Usage** - Target: 80% of applications
- **Return Visit Rate** - Target: 50% within 7 days
- **Feature Adoption** - Target: 60% use AI auto-apply

#### Business Metrics
- **Monthly Recurring Revenue (MRR)** - Target: R50,000 by Month 12
- **Customer Acquisition Cost (CAC)** - Target: < R50 per user
- **Lifetime Value (LTV)** - Target: R200+ per employer
- **LTV:CAC Ratio** - Target: 4:1
- **Employer Conversion Rate** - Target: 5% of registered employers pay
- **Placement Success Rate** - Target: 10% of applications lead to hire

#### Platform Metrics
- **Time to First Application** - Target: < 5 minutes from signup
- **API Response Time** - Target: < 200ms average
- **Error Rate** - Target: < 0.5%
- **Uptime** - Target: 99.9%
- **Page Load Time** - Target: < 2 seconds
- **Mobile App Rating** - Target: 4.5+ stars

### 🎯 Target Audience Segments

#### Primary Segments

**1. Young Professionals (25-35 years)**
- Recently graduated or early career
- Tech-savvy, mobile-first users
- Looking for career advancement
- High engagement with AI features
- Value speed and convenience

**2. Job Seekers in Transition (30-45 years)**
- Changing careers or industries
- Need guidance and support
- Benefit from skills gap analysis
- Value cover letter assistance
- Prefer comprehensive resources

**3. Entry-Level Candidates (18-25 years)**
- First-time job seekers
- Limited experience
- Need maximum support
- Benefit from AI auto-apply
- Mobile-first, WhatsApp native

**4. Skilled Workers (25-50 years)**
- Trade and technical skills
- Looking for contract/gig work
- Need quick application process
- Benefit from NQF matching
- Regional job preferences

#### Secondary Segments

**5. Remote Workers (Any age)**
- Location-independent
- Tech industry focus
- Higher salary expectations
- Value company culture fit
- Interested in international opportunities

**6. Career Returners (30-55 years)**
- Re-entering workforce after break
- Need confidence building
- Benefit from interview prep
- Value flexible work options
- Appreciate personalized support

### 🏆 Competitive Advantages

**1. AI-Powered Simplicity**
- One-swipe applications vs traditional lengthy forms
- AI-generated professional cover letters
- Smart matching reduces irrelevant jobs
- Saves 80% of application time

**2. South African Context**
- Built specifically for SA job market
- POPIA compliant from day one
- Local payment methods (PayFast)
- Multi-language support
- NQF level integration
- Transport cost awareness

**3. Mobile-First Design**
- Works on low-end devices
- Offline capability
- WhatsApp integration
- Voice search for accessibility
- Data-conscious design

**4. Candidate-Centric Approach**
- Free for job seekers always
- Privacy-first (no spam)
- Skills development suggestions
- Interview preparation tools
- Success tracking and insights

**5. Employer Value Proposition**
- Only pay for successful placements
- Pre-screened, motivated candidates
- Reduced time-to-hire
- Analytics and insights
- EE compliance support

### 🚀 Go-to-Market Strategy

#### Month 1-3: Beta Launch
- [ ] Launch with 50 beta users (friends, family, network)
- [ ] Partner with 3-5 local companies for job listings
- [ ] Gather feedback and iterate quickly
- [ ] Focus on Johannesburg and Cape Town
- [ ] Build initial job database (100+ listings)

#### Month 4-6: Public Launch
- [ ] Press release to local tech publications
- [ ] Social media campaign (LinkedIn, Twitter, Facebook)
- [ ] Partner with university career centers
- [ ] Launch referral program
- [ ] Target 1,000 registered users
- [ ] Onboard 20+ paying employers

#### Month 7-12: Growth Phase
- [ ] Content marketing (blog, SEO)
- [ ] Paid advertising (Google, Facebook, LinkedIn)
- [ ] Events and webinars
- [ ] Expand to Durban, Pretoria, Port Elizabeth
- [ ] Mobile app launch
- [ ] Target 10,000+ users, 100+ employers

#### Year 2: Scale & Expand
- [ ] Expand to all major SA cities
- [ ] Launch affiliate program with training providers
- [ ] Introduce premium features
- [ ] Explore regional expansion (Namibia, Botswana, Zimbabwe)
- [ ] Target 50,000+ users, 500+ employers
- [ ] Achieve profitability

## Known Limitations

### Current MVP Limitations
- Filter functionality exists in UI but not connected to backend queries (logs to console only)
- Profile editing UI exists but lacks backend mutations to save changes
- AI Auto-Apply generates Google search URLs (not actual company application links)
- Backend API endpoints accept client-supplied userId (needs auth middleware)
- No actual job application submission (just tracks intent + generates cover letter)


SUPABASE_URL- https://evdwovhikctwcjddcpzz.supabase.co
SUPABASE_ANON-yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2ZHdvdmhpa2N0d2NqZGRjcHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Mzc0NzIsImV4cCI6MjA2NzUxMzQ3Mn0.BTNWHzz3d9lwUOM-CaYi1O5qlu9WgTj5VR3sxVVIiUU
