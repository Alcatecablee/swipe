# SwipeJob South Africa - AI-Powered Job Matching Platform

## Overview
SwipeJob South Africa is an AI-powered job matching platform designed for the South African market, offering a Tinder-style swipe interface for job applications. Its core purpose is to drastically simplify and accelerate the job application process through AI-driven automation, including auto-filling application forms and generating personalized cover letters. The platform aims to make job hunting engaging and efficient, particularly for mobile users, by integrating gamification, a freemium model, and localized features relevant to South Africa. The long-term vision includes expanding to a mobile app and an employer platform to create a comprehensive job ecosystem.

## User Preferences
I prefer iterative development with clear, concise explanations for each step. Focus on delivering functional increments. Please ask for confirmation before making significant architectural changes or adding new external dependencies. For any AI-related tasks, prioritize solutions that are cost-effective and scalable, leveraging free tiers where possible. Ensure all development adheres strictly to POPIA compliance standards for data privacy. I prefer detailed explanations for complex features, but keep summaries brief. Do not make changes to the existing Supabase credentials without explicit approval.

## System Architecture
The platform is built with a modern web stack:
-   **Frontend**: React, TypeScript, Vite, shadcn/ui, and TailwindCSS for a responsive, mobile-first user experience with dark mode support.
-   **Backend**: Express.js handles API routes, particularly for AI processing and secure data operations.
-   **Database**: Supabase PostgreSQL is used for data storage, leveraging Row Level Security (RLS) for robust data access control and Supabase Auth for user authentication (email/password and OAuth).
-   **AI Service**: Groq, utilizing the Llama 3.3 70B model (free tier), powers intelligent features like resume parsing, cover letter generation, application data pre-filling, and interview preparation.
-   **State Management**: TanStack Query v5 is employed for efficient data fetching and caching.

**Key Features Implemented:**
-   **Swipe Interface**: Intuitive 'apply/skip' functionality for job listings.
-   **AI-Powered Applications**: Auto-generation of cover letters, pre-filling application data, and email application services.
-   **User Profiles & Resume Parsing**: Comprehensive user profiles with AI-driven resume data extraction and management.
-   **Smart Matching**: ML-based algorithm for job ranking, considering skills, experience, salary, and location.
-   **Application Tracking & Analytics**: Detailed timeline and success metrics for applications.
-   **Gamification**: Daily swipe limits, referral program, and achievement badges to enhance user engagement.
-   **Security**: JWT authentication middleware, RLS policies, and secure handling of user data are paramount.
-   **Email Automation**: Nodemailer for sending professional, HTML-formatted email applications with POPIA compliance notices.
-   **CSV Job Importer**: Bulk upload functionality for job listings.

**UI/UX Decisions:**
-   Emphasis on a clean, modern, and intuitive interface with a Tinder-style swipe mechanism.
-   Mobile-first design principles using TailwindCSS and shadcn/ui for consistent styling.
-   Multi-step onboarding wizard ("Sorce Passport") for streamlined user setup.
-   Visual cues for gamification (swipe counter, badges) and clear application status updates.

## External Dependencies
-   **Supabase**: Provides PostgreSQL database, authentication services, and real-time capabilities.
-   **Groq AI**: Used for all AI-powered features, specifically with the Llama 3.3 70B model.
-   **Nodemailer**: Facilitates sending email applications directly from the platform.
-   **Stripe / PayFast (Future)**: Planned for payment processing for premium subscriptions.
-   **Tesseract.js / Google Vision API (Future)**: For OCR capabilities in resume parsing.
-   **Puppeteer / Playwright (Future)**: For advanced form auto-filling on external ATS systems.