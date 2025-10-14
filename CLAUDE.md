# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Agitto** is a social events platform focused initially on Recife/PE, Brazil. It combines social network features (feed, profiles, interactions) with event management and discovery. The MVP prioritizes simplicity, performance, and low operational costs using modern, modular, and scalable architecture.

## Project Status

**Active Development** - Phase 2 in progress with events, social features, and frontend integration complete.

**Repositories:**
- `backend-agitto` - NestJS backend ✅ (deployed at https://agitto-api.fly.dev)
- `frontend-agitto` - Next.js frontend ✅ (in development)
- Infrastructure/docs repository (optional)

**Current Phase:** Phase 3 - Polish & Testing

## Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js 20
- **Backend:** NestJS with Prisma ORM
- **Frontend:** Next.js 15 (App Router) with Tailwind CSS
- **State Management:** Zustand (global event interactions)
- **Database:** PostgreSQL 16
- **Storage:** Cloudflare R2 (S3-compatible)
- **Hosting:** Fly.io (backend + Postgres), Vercel (frontend)
- **Package Manager:** pnpm (backend), yarn (frontend)
- **Authentication:** JWT with refresh tokens, OTP (SMS via ClickSend) with SHA256 hashing
- **SMS Provider:** ClickSend REST API v3

## Architecture

### Backend Structure (NestJS)

**Pattern:** Simplified Hexagonal Architecture with modular design

**Core Modules:**
- `auth` - JWT authentication, OTP verification, login, registration
- `users` - User profiles, preferences, username management
- `events` - Event CRUD, discovery feeds, location-based search
- `social` - Likes, RSVP (going/interested), follows, comments
- `notifications` - User notifications system
- `admin` - Simple backoffice for moderation (future)

**Layer Organization:**
```
src/modules/<module>/
  domain/         # Entities, repository interfaces, pure business rules, utils
  application/    # Services and use-cases orchestrating domain logic
  infrastructure/ # Prisma repositories, providers (SMS, email, storage)
  interface/      # HTTP Controllers and REST routes
```

**Communication:** All modules communicate via NestJS Dependency Injection

**Import Order Convention:** core → domain → application → infrastructure → interface

### Frontend Structure (Next.js)

```
src/
  app/(app)/         # Authenticated routes (with layout)
    events/          # Event listing and detail pages
    profile/         # User profiles
    settings/        # User settings
  components/        # Reusable UI components
    events/          # Event-specific components (cards, map, etc)
    ui/              # Generic UI components
    users/           # User-related components
  lib/
    api/             # API client functions
    queries/         # React Query hooks
    stores/          # Zustand stores (eventInteractionsStore)
    hooks/           # Custom hooks (useTokenRefresh)
    auth/            # Authentication utilities
public/              # Static assets
```

**Key Pages:**
- `/` - Landing page
- `/login` - Login with email/phone + password
- `/register` - User registration
- `/events` - Event listing (nearby, discovery, following feeds)
- `/events/[id]` - Event detail page with interactions
- `/events/new` - Create new event
- `/profile/[username]` - Public user profiles
- `/settings` - User settings and preferences

## Development Commands

### Backend
- Build: `pnpm run build`
- Development: `pnpm run start:dev:local` (local with .env.local)
- Production: `pnpm run start:prod`
- Deploy: `fly deploy -a agitto-api` (deployed at https://agitto-api.fly.dev)
- Database migrations: `pnpm prisma migrate dev`
- Generate Prisma client: `pnpm prisma:generate`

### Frontend
- Build: `yarn build`
- Development: `yarn dev`
- Lint: `yarn lint`
- Production: Automatic deployment to Vercel on push to `main`

## Database Schema (Prisma)

**Core Models:**
- `User` - uuid id, username (unique), email (required, unique), phone (optional, unique), verification flags
- `UserOtp` - OTP management with hash storage, type, expiration, attempts
- `Event` - uuid id, owner, title, description, location (lat/lng), dates, visibility, capacity, tags
- `RSVP` - Event participation (going/interested/declined)
- `Like` - Event likes
- `Comment` - Event comments
- `Follow` - User follows
- `Notification` - User notifications
- `Order` & `Ticket` - Future: payments phase

**Migration History:**
- `20251009030922_data` - Made phone optional, email required
- `20251012163444_n` - Added username field (unique, 8-20 chars)
- Social features migrations - Likes, RSVP, Follow, Comments
- Notifications migration - User notification system

## Code Generation Rules

**CRITICAL - Read Before Writing Code:**

1. **No comments in generated code** - Code must be clean and self-documenting
2. **Discussion required** - All code implementations must be discussed and explicitly approved by Jefferson before generation
3. **Minimal code** - No explanatory inline blocks, keep it functional and direct
4. **Small commits** - Clear, descriptive commit messages
5. **Justify dependencies** - New dependencies require justification

## Code Style

- **Formatting:** Prettier + ESLint (NestJS/Next.js defaults)
- **Naming:**
  - `camelCase` for variables and functions
  - `PascalCase` for classes and components
  - `snake_case` for database columns
- **Import Order:** core → domain → application → infrastructure → interface

## Infrastructure

### Backend Deployment (Fly.io)
- Region: `fra` (Frankfurt)
- Resources: 1 shared CPU, 1 GB RAM, 20 GB volume
- Database: PostgreSQL in same machine (MVP)
- Internal port: 3000
- Cost: ~$11.44/month

### Frontend Deployment (Vercel)
- Plan: Free (Hobby)
- Auto-deployment on push to `main`
- Preview deployments per PR
- Custom domain: `app.agitto.com` via Cloudflare DNS

### Storage (Cloudflare R2)
- Bucket: `agitto-assets`
- Upload flow: Frontend requests signed URL from API, uploads directly to R2
- Files: profile images, event covers, post-event galleries

## Environment Variables

### Backend
```
DATABASE_URL=postgresql://postgres@localhost:5432/agitto
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=<secure_min_32_chars>
JWT_EXPIRES_IN=15m
REFRESH_SECRET=<secure_min_32_chars>
REFRESH_EXPIRES_IN=7d

# ClickSend SMS
CLICKSEND_USERNAME=<your_clicksend_username>
CLICKSEND_API_KEY=<your_clicksend_api_key>

# Swagger (optional)
SWAGGER_BASIC_USER=admin
SWAGGER_BASIC_PASS=admin
SWAGGER_BASIC_ENFORCE=true

# R2 (Future)
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_BUCKET=agitto-assets
R2_ACCESS_KEY=<R2_ACCESS_KEY>
R2_SECRET_KEY=<R2_SECRET_KEY>
```

**Note:** Use `.env.local` for local development. Production secrets are managed via `fly secrets set` on Fly.io.

### Frontend
```
NEXT_PUBLIC_API_URL=https://agitto.fly.dev
NEXT_PUBLIC_CDN_URL=https://pub-xxxx.r2.dev
```

## Authentication Flow

### Current Implementation (Phone Optional)

**Registration Flow:**
1. User registers with name, username, email, password → `POST /auth/register`
2. System validates username (8-20 chars, lowercase, alphanumeric + underscore)
3. System returns JWT tokens immediately (no phone required)
4. User navigates to phone verification screen (authenticated)
5. User adds phone → `PATCH /auth/phone` (requires JWT) → OTP sent via ClickSend
6. User verifies OTP → `POST /auth/verify-otp` → `phoneVerified=true`
7. If user clicks "resend", phone can be updated again via `PATCH /auth/phone`

**Login Flow:**
- User logs in with email/phone + password → `POST /auth/login`
- Returns JWT + refresh token (no phone verification required)

**Password Recovery:**
- User requests recovery → `POST /auth/recovery-password` (requires phone)
- Temporary password sent via SMS using ClickSend
- User logs in with temporary password and updates it

**User States (derived):**
- `registered`: User created, no phone yet
- `pending_phone_verification`: Phone added but not verified (phoneVerified=false)
- `active`: Phone verified (phoneVerified=true)

**OTP Security:**
- Hash stored (SHA256), never plain text
- 5-minute expiration
- Attempt limiting via `attempts` counter

**SMS Messages (ClickSend):**
- OTP: "Código AGITTO: {code}"
- Temporary password: "Sua senha temporária Agitto é: {password}. Por segurança, altere-a após o login."

## API Endpoints (Implemented)

**Auth:**
- `POST /auth/register` - Register with name, username, email, password (returns JWT)
- `POST /auth/login` - Login with email/phone + password
- `POST /auth/refresh` - Refresh access token using refresh token cookie
- `PATCH /auth/phone` - Add/update phone and send OTP (authenticated)
- `POST /auth/request-otp` - Request OTP for existing phone
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/recovery-password` - Send temporary password via SMS
- `POST /auth/request-email-verification` - Request email verification
- `GET /auth/verify-email/:token` - Verify email with token

**Users:**
- `GET /users/me` - Get current user profile (authenticated)
- `GET /users/:username` - Get public user profile
- `PATCH /users/me/profile` - Update profile including username (authenticated)
- `PATCH /users/me/password` - Update password (authenticated)
- `PATCH /users/me/contact` - Update contact info (authenticated)
- `POST /users/me/upload-profile-image` - Upload profile image (authenticated)

**Events:**
- `POST /events` - Create event (authenticated, verification required)
- `GET /events` - List events with filters (supports optional JWT for userInteraction)
- `GET /events/trending` - Get trending events (supports optional JWT)
- `GET /events/popular/week` - Get popular events this week (supports optional JWT)
- `GET /events/live-map` - Get events for map visualization
- `GET /events/following-feed` - Get events from followed users (authenticated)
- `GET /events/discovery` - Get personalized event recommendations (authenticated)
- `GET /events/:id` - Get event details (supports optional JWT)
- `PATCH /events/:id` - Update event (authenticated, owner only)
- `DELETE /events/:id` - Delete event (authenticated, owner only)
- `POST /events/:id/upload-cover` - Upload event cover image (authenticated, owner only)

**Social:**
- `POST /events/:eventId/like` - Toggle event like (authenticated)
- `GET /events/:eventId/likes` - Get event likes list
- `POST /events/:eventId/rsvp` - Set RSVP status (authenticated)
- `DELETE /events/:eventId/rsvp` - Remove RSVP (authenticated)
- `GET /events/:eventId/attendees` - Get event attendees
- `POST /events/:eventId/comments` - Add comment (authenticated)
- `GET /events/:eventId/comments` - Get event comments
- `POST /users/:userId/follow` - Follow user (authenticated)
- `DELETE /users/:userId/follow` - Unfollow user (authenticated)

**Notifications:**
- `GET /notifications` - List active (unread) notifications
- `GET /notifications/read` - List read notifications
- `PATCH /notifications/:id/read` - Mark notification as read
- `PATCH /notifications/:id/complete` - Complete/dismiss notification

## Development Phases

1. **Phase 0:** Foundation ✅ COMPLETED
   - Repository setup
   - Fly.io deployment configured (https://agitto-api.fly.dev)
   - PostgreSQL database
   - CI/CD via GitHub

2. **Phase 1:** User & Auth ✅ COMPLETED
   - User registration with username
   - JWT authentication with refresh tokens
   - OTP via ClickSend SMS
   - Phone optional registration flow
   - Password recovery via SMS
   - Profile management endpoints
   - Email verification system
   - Notifications system

3. **Phase 2:** Events & Social Features ✅ COMPLETED
   - Event CRUD operations
   - Location-based search
   - Event listing and filtering (nearby, discovery, following)
   - Social features (likes, RSVP, follows, comments)
   - Frontend integration with Zustand state management
   - OptionalJwtAuthGuard for public endpoints with user context
   - Token refresh mechanism (proactive + reactive)
   - Event interaction synchronization across all pages

4. **Phase 3:** Polish & Testing (CURRENT)
   - Bug fixes and edge cases
   - Performance optimization
   - User experience improvements

5. **Phase 4:** Media & Advanced Features
   - R2 storage integration for galleries
   - Image optimization
   - Advanced event types

6. **Phase 5:** Backoffice & Observability
   - Admin moderation tools
   - Sentry integration
   - Analytics dashboard

7. **Phase 6:** Beta Testing
   - 100-300 users
   - UX adjustments
   - Performance monitoring

8. **Phase 7:** Public Launch
   - Custom domains
   - Load testing
   - Go-live

## Recent Changes

**2025-10-13:**
- ✅ Implemented Zustand store for event interactions state management
- ✅ Fixed event interaction synchronization across all pages (feed, populares, detail, profile)
- ✅ Added OptionalJwtAuthGuard for public event endpoints with optional user context
- ✅ Changed backend response from `viewer` to `userInteraction` pattern
- ✅ Implemented automatic token refresh (proactive 5min before expiry + reactive on 401)
- ✅ Fixed frontend to always send JWT token in requests for user identification
- ✅ All event cards now read from Zustand store instead of local state
- ✅ Optimistic UI updates with rollback on error for all social interactions

**2025-10-12:**
- ✅ Added username field to User model (8-20 chars, unique, lowercase)
- ✅ Implemented profile image upload functionality
- ✅ Updated registration flow to include username validation

**2025-10-09:**
- ✅ Migrated SMS provider from Telnyx to ClickSend REST API v3
- ✅ Made phone optional in registration flow
- ✅ Added `PATCH /auth/phone` endpoint for authenticated phone addition
- ✅ Removed phone verification requirement from login
- ✅ Updated SMS messages to Portuguese with brand name
- ✅ Implemented notifications system
- ✅ Email verification system with templates

## Frontend State Management

**Zustand Store (eventInteractionsStore):**
- Centralized state for event interactions (liked, going, interested, owner)
- Automatic synchronization across all components
- Populated when events load from API
- Optimistic updates with error rollback

**Key Files:**
- `/frontend-agitto/src/lib/stores/eventInteractionsStore.ts` - Zustand store
- `/frontend-agitto/src/lib/hooks/useTokenRefresh.ts` - Token refresh hook
- `/frontend-agitto/src/lib/api/http.ts` - HTTP client with token handling

## Known Issues

None currently - all critical issues resolved!

## Future Expansions

- React Native mobile app consuming same API
- Payment system (Pagar.me for PIX and cards)
- Advanced event types (competitive, premium)
- Dedicated search (Meilisearch)
- Push notifications (mobile and web)
- Managed Postgres on Fly
- Redis/BullMQ for async jobs
