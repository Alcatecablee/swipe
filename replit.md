# SwipeJob South Africa - AI-Powered Job Matching Platform

## Overview
SwipeJob South Africa is an AI-powered job matching platform designed for the South African market, offering a "Tinder-style" job application experience with AI-driven auto-apply functionality. The project's core purpose is to simplify and accelerate the job application process for job seekers, making it more engaging and efficient. It aims to leverage AI for tasks like resume parsing, personalized cover letter generation, and automated application form filling. The platform incorporates gamification, a freemium model, and strong South African localization to provide a tailored and engaging experience.

## User Preferences
I want iterative development. I prefer detailed explanations. Ask before making major changes.

## System Architecture
The platform is built with a modern web stack:
- **Frontend**: React, TypeScript, Vite, shadcn/ui, and TailwindCSS for a responsive and modern user interface, supporting dark mode.
- **Backend**: Express.js handles API routes, particularly for AI processing and custom business logic.
- **Database**: Supabase PostgreSQL is used for data storage, featuring Row Level Security (RLS) for secure data access.
- **Authentication**: Supabase Auth manages user authentication, supporting email/password and OAuth.
- **AI Service**: Groq, utilizing the Llama 3.3 70B model, powers AI features.
- **State Management**: TanStack Query v5 is employed for efficient data fetching and state management.

**Key Features & Technical Implementations:**
- **Swipe Interface**: A core feature allowing users to quickly apply or skip job listings.
- **AI-Powered Automation**:
    - **Resume Parsing**: Extracts structured data from uploaded resumes (PDF/image).
    - **Cover Letter Generation**: AI generates tailored cover letters.
    - **Auto-Apply**: Fills external ATS forms automatically, including custom question responses.
    - **Interview Prep**: Generates behavioral, technical, and culture-fit questions with STAR method guidance and answer coaching.
    - **ATS Keyword Extraction**: Identifies crucial keywords from job descriptions.
- **Gamification & Engagement**:
    - **Daily Swipe Limits**: A freemium model with limited free swipes and unlimited premium swipes.
    - **Achievement Badges**: Rewards users for milestones (e.g., "First Swipe," "Career Climber").
    - **Referral System**: Users earn bonus swipes for inviting others.
- **Smart Matching Algorithm**: A machine learning-based system that ranks job suitability based on:
    - Skill overlap (60% weight)
    - Experience level (15% weight)
    - Salary compatibility (15% weight)
    - Location matching (10% weight)
    - NQF level (10% weight for SA jobs).
- **Notifications**:
    - **Web Push Notifications**: Real-time updates using Web Push API.
    - **In-app Notifications**: A centralized system for status updates, interview invites, and badge awards.
    - **Follow-up Reminders**: Automated reminders for pending applications.
- **PWA Capabilities**: Configured with a manifest and service worker for offline caching, installability, and an enhanced mobile experience.
- **South African Localization**:
    - Integration of SA-specific constants (provinces, cities, NQF levels, 11 official languages).
    - Enhanced smart matching to include NQF level requirements.
    - POPIA (Protection of Personal Information Act) compliance with explicit consent UI.
- **Security**:
    - Row Level Security (RLS) on all database tables.
    - Backend authentication middleware for user access validation.
    - POPIA consent UI for data protection.

## External Dependencies
- **Supabase**: PostgreSQL database, Authentication, and Realtime services.
- **Groq**: AI API for large language model (Llama 3.3 70B) processing.
- **Stripe**: Payment gateway for premium subscriptions (future integration).
- **PayFast**: South African-specific payment gateway (future integration).
- **Vite**: Frontend build tool.
- **shadcn/ui**: UI component library.
- **TailwindCSS**: Utility-first CSS framework.
- **TanStack Query**: Data fetching and caching library.