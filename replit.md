# SwipeJob South Africa - AI-Powered Job Matching Platform

## Overview
SwipeJob South Africa is an AI-powered job application platform designed for the South African market, offering a Tinder-style swipe interface for job applications. Its core purpose is to simplify and accelerate the job search process by leveraging AI for tasks like resume parsing, cover letter generation, and automated application form filling. The platform aims to provide a 10x faster application experience, focusing on mobile-first interaction and gamification to engage users. It includes a freemium model and plans for a comprehensive employer platform. The business vision is to become the leading AI-driven job matching service in South Africa, significantly reducing the time and effort job seekers spend on applications.

## User Preferences
I want iterative development.
Ask before making major changes.
I prefer detailed explanations.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture
The platform is built with a modern web stack:
- **Frontend**: React, TypeScript, Vite, shadcn/ui, and TailwindCSS provide a responsive and aesthetically pleasing user interface with dark mode support. The UI/UX prioritizes a mobile-like swipe experience for job applications and a multi-step onboarding wizard for user setup.
- **Backend**: An Express.js server handles API routes, primarily for AI processing tasks.
- **Database**: Supabase PostgreSQL is used for data storage, incorporating Row Level Security (RLS) for secure data access. Key tables include `users`, `jobs`, `applications`, `swipes`, `user_experience`, and `badges`.
- **Authentication**: Supabase Auth manages user authentication, supporting email/password and OAuth.
- **AI Service**: Groq, utilizing the Llama 3.3 70B model, powers all AI functionalities.
- **State Management**: TanStack Query v5 is used for efficient data fetching and state management.

### Key Technical Implementations & Features:
- **AI-Powered Core**: Includes resume parsing (PDF/image), AI-generated cover letters, automated form filling for external ATS, ATS keyword extraction, and AI-driven interview preparation with answer coaching.
- **Swipe Interface**: A Tinder-like UI for applying to or skipping job listings, with daily swipe limits for free users and unlimited for premium.
- **Gamification & Engagement**: Features daily swipe limits, a referral system, achievement badges (e.g., First Swipe, Career Climber), and a profile completion score.
- **Smart Matching Algorithm**: An ML-based system ranks jobs based on skill overlap (60%), experience (15%), salary compatibility (15%), and location (10%).
- **Application Tracking**: Users can track the status of their applications (Pending, Submitted, Viewed, Interview, Rejected, Hired).
- **Freemium Model**: Differentiates between free users (limited swipes, basic AI) and premium users (unlimited swipes, advanced AI features, priority matching).
- **Security**: RLS is enforced on all database tables, and user sessions are managed by Supabase Auth.
- **API Endpoints**: The Express backend provides endpoints for resume parsing, profile management, job matching, swipe actions, badge management, referral program, AI auto-apply, interview prep, and cover letter generation.
- **South African Localization**: Future plans include province/city filtering, NQF level matching, multi-language support (Zulu, Xhosa, Afrikaans), WhatsApp integration, and POPIA compliance.

## External Dependencies
- **Supabase**: Used for PostgreSQL database, authentication (Supabase Auth), and Row Level Security.
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
- **Groq**: AI service for all generative AI functionalities (resume parsing, cover letters, auto-apply, interview prep).
    - `GROQ_API_KEY`
- **Stripe**: Planned for premium subscriptions.
    - `STRIPE_SECRET_KEY`
- **PayFast**: Planned as a South African-compatible payment gateway.
    - `PAYFAIT_SECRET`
- **Tesseract.js or Google Vision API**: Planned for OCR in image resume parsing.
- **Puppeteer/Playwright**: Planned for ATS integration and form auto-filling.
- **External ATS Systems**: (e.g., Greenhouse, Lever, Workday) for auto-application functionality.