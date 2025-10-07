# Design Guidelines: SA Job-Matching Platform

## Design Approach

**Reference-Based Approach** drawing inspiration from:
- **Tinder**: Swipe mechanics, card-based interface, engaging animations
- **LinkedIn**: Professional credibility, skills presentation
- **Indeed/Pnet**: Job listing clarity, filtering patterns

**Localization Focus**: Vibrant, energetic design reflecting South African youth culture while maintaining professional credibility. Mobile-first with data-conscious implementation.

## Core Design Principles

1. **Empowerment Through Simplicity**: Clean, distraction-free swipe experience that reduces job search anxiety
2. **Cultural Relevance**: Colors and imagery reflecting SA diversity and optimism
3. **Performance First**: Lightweight design for low-data environments
4. **Multilingual Accessibility**: Typography and layouts accommodating English, Zulu, and Afrikaans

## Color Palette

### Primary Colors
**Light Mode:**
- Primary: 142 71% 45% (Emerald green - growth, opportunity)
- Primary Hover: 142 71% 38%
- Secondary: 221 83% 53% (Bright blue - trust, professionalism)
- Background: 0 0% 98%
- Surface: 0 0% 100%

**Dark Mode:**
- Primary: 142 71% 55%
- Primary Hover: 142 71% 48%
- Secondary: 221 83% 63%
- Background: 222 47% 11%
- Surface: 217 33% 17%

### Accent Colors
- Success: 142 76% 36% (Job matched/applied)
- Warning: 38 92% 50% (Action needed)
- Error: 0 72% 51% (Application failed)
- Muted Text: Light: 215 16% 47% / Dark: 217 33% 70%

### SA-Inspired Accent
- Sunset Orange: 24 95% 53% (Used sparingly for CTAs and highlights)

## Typography

### Font Families
- **Primary**: Inter (via Google Fonts) - Clean, multilingual support, excellent readability
- **Headings**: Poppins (via Google Fonts) - Friendly, approachable, professional

### Type Scale
- H1: 2.5rem (40px), Poppins SemiBold
- H2: 2rem (32px), Poppins SemiBold
- H3: 1.5rem (24px), Poppins Medium
- Body Large: 1.125rem (18px), Inter Regular
- Body: 1rem (16px), Inter Regular
- Small: 0.875rem (14px), Inter Regular
- Caption: 0.75rem (12px), Inter Medium

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** (e.g., p-4, m-8, gap-6)

### Mobile-First Grid
- Mobile: Single column, full-width cards
- Tablet: 2-column for dashboard/filters
- Desktop: Max-width container (max-w-6xl) with centered swipe card

### Key Measurements
- Swipe Card: w-full max-w-sm (448px) on desktop, full-width on mobile
- Card Height: min-h-[600px] to accommodate content
- Container Padding: px-4 (mobile), px-6 (tablet), px-8 (desktop)
- Section Spacing: py-12 (mobile), py-16 (desktop)

## Component Library

### A. Job Swipe Cards
**Design**: Card-based with subtle shadow (shadow-xl), rounded corners (rounded-2xl), white/surface background

**Card Structure** (top to bottom):
- Company logo (64x64, rounded-lg)
- Job title (H2, primary color)
- Company name (Body, muted)
- Salary range (Body Large, semibold, secondary color) in ZAR format
- Location with icon (Heroicons map-pin)
- Tags row: Skills/requirements as pills (rounded-full, bg-primary/10, text-primary)
- Job description (2-3 lines, Body, line-clamp-3)
- Action buttons at bottom: Skip (left, outline) / Apply (right, solid primary)

**Swipe Interaction**: 
- Right swipe: Green overlay with checkmark
- Left swipe: Red overlay with X
- Subtle rotation on drag (max 15deg)

### B. Navigation

**Top Bar** (sticky):
- Logo/brand name (left)
- Filter icon (right) - opens filter drawer
- Profile avatar (far right)
- Height: h-16, border-b, backdrop-blur for glassmorphism on scroll

### C. Filter Drawer/Modal
**Mobile**: Slide up from bottom (h-3/4)
**Desktop**: Right-side panel (w-96)

**Filter Groups** (each with heading + controls):
1. Location: Chips for major cities/townships
2. Sector: Dropdown with icons
3. Salary Range: Dual-thumb slider in ZAR
4. Skills: Multi-select tags
5. NQF Level: Number input
- Apply button (sticky bottom, full-width, primary)

### D. Application Dashboard
**Layout**: Card grid (1 col mobile, 2 col desktop)

**Job Application Card**:
- Compact height (h-32)
- Left: Company logo + job title
- Right: Status badge (pill-shaped, color-coded)
- Bottom: Application date (caption, muted)
- Hover: Slight lift (hover:shadow-lg, transition)

### E. User Profile
**Sections** (stacked, gap-8):
1. Avatar + Name + Edit button
2. Skills section: Tag cloud of skills (interactive, removable)
3. Languages: Chips showing English/Zulu/Afrikaans preferences
4. Experience: Timeline cards with role + company
5. NQF Qualifications: List with badge indicators

### F. Buttons
- **Primary**: bg-primary, hover:bg-primary-hover, rounded-lg, px-6, py-3, font-medium
- **Outline**: border-2 border-primary, text-primary, rounded-lg, px-6, py-3, hover:bg-primary/10
- **Icon Buttons**: Circular (rounded-full), p-3, for actions like skip/favorite

### G. Form Inputs
**Text Inputs**:
- Border: border-2 border-muted
- Focus: ring-2 ring-primary, border-primary
- Padding: px-4 py-3
- Rounded: rounded-lg
- Dark mode: bg-surface, text-white

**Dropdowns/Select**: Same styling as text inputs with chevron icon

## Images

### Hero Section (Landing/Marketing Page)
**Large Hero Image**: Yes
- Full-width hero (h-[600px] on desktop, h-[400px] mobile)
- Image: Young, diverse South African professionals celebrating/working together
- Image treatment: Slight gradient overlay (from transparent to bg-primary/20) for text legibility
- Overlay content: Centered
  - Headline: "Find Your Next Opportunity" (H1, white, font-bold)
  - Subheadline: "Swipe right on your dream job" (Body Large, white/90)
  - CTA button: "Get Started" (primary, with blur background if outline variant)

### Additional Images
- **Feature Cards**: Small icons (Heroicons) rather than photos
- **Testimonials**: Circular profile photos (w-16 h-16) of users
- **Dashboard**: Company logos in job cards (fetched from job data)

## Animations

**Minimal, Purposeful Only**:
- Card swipe: Transform + opacity transition (300ms ease-out)
- Button hover: Scale(1.02) + shadow change (150ms)
- Modal/drawer: Slide-in transform (250ms ease-in-out)
- Loading states: Subtle pulse on skeleton screens
- NO: Elaborate scroll animations, complex page transitions, decorative effects

## Mobile-First Optimizations

- Touch targets: Minimum 44x44px for all interactive elements
- Bottom sheet patterns for modals (easier thumb reach)
- Swipe gestures: Large, forgiving hit areas
- Lazy load: Job cards load progressively (5 at a time)
- Optimized images: WebP format, responsive srcset
- Offline indicator: Subtle banner when connection lost

## Accessibility

- All interactive elements keyboard accessible
- Focus states: ring-2 ring-primary for keyboard navigation
- ARIA labels for icon-only buttons
- Color contrast: Minimum 4.5:1 for all text
- Screen reader announcements for swipe actions
- Language switcher prominent in settings