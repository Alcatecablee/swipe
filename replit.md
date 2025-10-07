# SwipeJob - Job Application Platform

A Tinder-style job application platform built with React, Supabase, and Express.

## Architecture

- **Frontend**: React + TypeScript + Vite + shadcn/ui + TailwindCSS
- **Backend**: Express.js (serves frontend only, no API routes)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth (email/password)
- **State Management**: TanStack Query v5

## Key Features

- ✅ Swipe interface for job applications (apply/skip)
- ✅ User authentication with protected routes
- ✅ Real-time job listings from Supabase
- ✅ Application tracking with status updates
- ✅ User profiles with skills and experience
- ✅ Secure data access with RLS policies
- ✅ Dark mode support

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

- Supabase credentials stored in Replit Secrets
- SQL schema file available at `supabase-schema.sql`
- All data queries use snake_case column names
- Frontend uses camelCase, mapped to snake_case for Supabase
