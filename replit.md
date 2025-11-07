# Provcontrol - Community Property Management Platform

## Overview

Provcontrol is a mobile-first property management platform designed for Spanish-speaking homeowners' associations (Comunidades de Propietarios). The application serves as an independent control and transparency tool that connects property owners, community presidents, and service providers through a verified rating system.

**Core Purpose**: Provide a "verified reviews and quality comparisons marketplace" specifically for property maintenance, enabling communities to control spending, track incidents with full transparency, and make informed decisions about service providers through anti-fraud verification mechanisms.

**Key Differentiator**: Unlike traditional property management software controlled by administrators, Provcontrol is contracted directly by the community to ensure technological continuity and prevent vendor lock-in.

## Recent Changes (November 7, 2025)

**Social Network Features Completed:**
- ✅ Feed page with activity timeline combining incidents and ratings
- ✅ Interactive provider profiles with tabs (Valoraciones, Portfolio, Historial)
- ✅ Visual rating modal with multi-step wizard and photo uploads
- ✅ Rating card component with provider responses and helpful votes
- ✅ Clickable provider cards linking to detailed profiles
- ✅ All features tested end-to-end and validated

**Critical Bug Fixes:**
- ✅ **RESOLVED: Ratings API empty response bug** - Fixed duplicate `getRatings` methods in DatabaseStorage causing community_id filter to be ignored. Removed shadowing method that only supported providerId filtering. All 8 test ratings now correctly returned.
- Fixed ProviderProfile to correctly filter provider from cached list
- Fixed RatingModal to calculate overallRating before submission
- Fixed VerifiedBadge component ref handling for TooltipTrigger compatibility
- Added comprehensive data-testid attributes for testing automation
- Cleaned duplicate method declarations in IStorage interface

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**:
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Shadcn/ui (Radix UI primitives + Tailwind CSS)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system

**Design System**:
- Based on Material Design principles adapted for mobile-first property management
- Custom color system using HSL CSS variables for theming (light/dark mode support)
- Typography: Inter font family with defined scale (text-xs to text-5xl)
- Spacing primitives: Tailwind units (2, 4, 6, 8, 12, 16)
- Mobile-first responsive grid: Single column mobile, 2 columns tablet
- Component library: Extensive Radix UI components (accordion, dialog, dropdown, etc.)

**Key Design Principles**:
1. **Transparency First**: Visual clarity in data presentation and verification states
2. **Mobile-Optimized**: Touch-friendly targets, thumb-zone navigation
3. **Role-Aware Interface**: Visual differentiation between President, Owner, and Provider views
4. **Trust & Credibility**: Professional aesthetic emphasizing security and verified information

**Authentication Flow**:
- Replit Auth integration using OpenID Connect (OIDC)
- Session-based authentication with PostgreSQL session store
- Role-based access control (presidente, propietario, proveedor)

### Backend Architecture

**Technology Stack**:
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database ORM**: Drizzle ORM with Neon serverless PostgreSQL
- **Session Management**: express-session with connect-pg-simple
- **Authentication**: Passport.js with OpenID Client strategy

**API Design**:
- RESTful API structure under `/api` prefix
- All endpoints protected with `isAuthenticated` middleware
- CRUD operations for core entities (communities, providers, incidents, budgets, ratings, documents, forum)
- Request/response logging middleware for debugging

**Database Schema Design**:

**Role System**:
- Three primary roles: `presidente`, `propietario`, `proveedor`
- User role stored in users table, controls access to features
- Presidents have full approval authority (budgets, incident resolution, rating authorization)

**Core Entities**:

1. **Users**: Stores Replit Auth user data with role assignment
2. **Communities**: Homeowner associations with basic profile info
3. **Providers**: Service providers with category classification (10 categories: plumbing, electrical, masonry, gardening, painting, carpentry, cleaning, locksmith, HVAC, other)
4. **Incidents**: Issue tracking with photo support, status workflow (abierta → presupuestada → aprobada → en_curso → resuelta)
5. **Budgets**: Cost proposals linked to incidents and providers
6. **Ratings**: Verified reviews system with anti-fraud mechanisms
7. **Documents**: Community document management (actas, estatutos, facturas, presupuestos, contratos, otros)
8. **Forum Posts/Replies**: Community discussion system with pinning capability
9. **Incident Updates**: Audit trail for incident status changes

**Verification System Architecture**:

The rating system implements a multi-layer verification approach:
1. **Contractual Link**: Ratings must be tied to real incidents managed through the platform
2. **Authorization Control**: Only authorized roles (President) can mark incidents as "Resuelta" to unlock rating
3. **Economic Verification**: System validates that invoices are registered and linked to approved budgets
4. **Evidence Requirement**: Photo proof and detailed comments required for credibility
5. **Right of Reply**: Providers can respond to ratings with documented evidence

### File Upload Strategy

**Current Implementation**:
- Custom `ObjectUploader` component wrapping basic file input
- Supports AWS S3 upload via Uppy library (@uppy/core, @uppy/dashboard, @uppy/aws-s3, @uppy/react)
- Pre-signed URL pattern: `onGetUploadParameters` returns PUT URL
- File validation: Max file size (10MB default), file count limits
- Used for incident photos and document uploads

**Storage Location**:
- File URLs stored as strings/arrays in database
- Actual files stored externally (S3-compatible storage)

### State Management Patterns

**Server State**:
- TanStack Query for all API data fetching
- Custom query client with error handling
- Infinite stale time (manual invalidation on mutations)
- No automatic refetch on window focus
- 401 errors handled globally with redirect to login

**Local State**:
- React useState for form inputs and UI toggles
- Dialog/modal open states managed locally
- Search/filter states in page components

## External Dependencies

### Authentication & Sessions

**Replit Auth**:
- OpenID Connect provider (https://replit.com/oidc)
- User profile data: email, firstName, lastName, profileImageUrl
- Claims stored in session with access/refresh tokens
- Session encryption secret required (SESSION_SECRET env var)

### Database

**Neon Serverless PostgreSQL**:
- PostgreSQL dialect via @neondatabase/serverless
- WebSocket connection using ws library
- Connection pooling with pg Pool
- Required: DATABASE_URL environment variable
- Migration management via drizzle-kit

### UI Component Libraries

**Radix UI Primitives** (20+ components):
- Unstyled, accessible component primitives
- Accordion, Alert Dialog, Avatar, Checkbox, Dialog, Dropdown Menu, etc.
- Form integration via react-hook-form with @hookform/resolvers and Zod validation

**Shadcn/ui Configuration**:
- Style: "new-york"
- Path aliases configured for @/components, @/lib, @/hooks
- Tailwind integration with CSS variables

### File Upload

**Uppy**:
- @uppy/core: Core file upload functionality
- @uppy/dashboard: UI for file selection
- @uppy/aws-s3: S3 upload integration
- @uppy/react: React bindings

### Utility Libraries

- **class-variance-authority**: Component variant styling
- **clsx & tailwind-merge**: CSS class manipulation
- **cmdk**: Command palette/search functionality
- **nanoid**: Unique ID generation
- **memoizee**: Function memoization for OIDC config caching

### Development Tools

- **TypeScript**: Full type safety across client, server, and shared code
- **Vite Plugins**: Runtime error modal, dev banner, cartographer (Replit-specific)
- **ESBuild**: Server-side bundling for production

### Asset Management

**Static Assets**:
- attached_assets directory contains project documentation (Spanish product specs)
- Public assets served through Vite in development
- Font: Inter from Google Fonts (weights 400, 500, 600, 700)

### Critical Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key (required)
- `REPL_ID`: Replit environment identifier
- `ISSUER_URL`: OIDC issuer URL (defaults to https://replit.com/oidc)
- `NODE_ENV`: Environment mode (development/production)