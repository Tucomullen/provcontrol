# Provcontrol - Community Property Management Platform

## Overview

Provcontrol is a mobile-first property management platform designed for Spanish-speaking homeowners' associations (Comunidades de Propietarios). The application serves as an independent control and transparency tool that connects property owners, community presidents, and service providers through a verified rating system.

**Core Purpose**: Provide a "verified reviews and quality comparisons marketplace" specifically for property maintenance, enabling communities to control spending, track incidents with full transparency, and make informed decisions about service providers through anti-fraud verification mechanisms.

**Key Differentiator**: Unlike traditional property management software controlled by administrators, Provcontrol is contracted directly by the community to ensure technological continuity and prevent vendor lock-in.

## Recent Changes

### Storage Abstraction Refactoring (Current)
- ✅ Implemented factory pattern for storage (`server/storage/factory.ts`)
- ✅ Created data storage module (`server/storage/data-storage.ts`) as single import point
- ✅ Updated all imports in routes and auth to use abstraction layer
- ✅ Created domain types (`shared/types.ts`) independent of ORM
- ✅ Created mappers (`server/storage/mappers.ts`) for type conversion
- ✅ Added validation script (`scripts/validate-dependencies.sh`) to enforce architecture rules
- ✅ Updated architecture documentation in this file
- ✅ All database access now properly abstracted for future migrations

### Previous Changes (November 7, 2025)

**Social Network Features Completed:**
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

**UI Simplification:**
- ✅ Removed redundant Feed page - Dashboard now serves as the main landing page (route "/")
- Simplified navigation menu by consolidating activity view into Dashboard
- Removed redundant "Nueva Incidencia" and "Ver Todo" buttons from Dashboard banner

**New Incident Detail Page:**
- ✅ Created comprehensive incident detail view at `/incidencias/:id`
- Displays complete incident information with description and photos
- Shows budget comparison table with all received proposals
- Highlights approved budget with visual indicator
- Displays assigned provider (clickeable to navigate to provider profile)
- Timeline view showing complete incident history with status updates
- Shows final cost and invoice for resolved incidents
- All incident cards now navigate to detail page on click

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
- Local authentication with email/password
- JWT tokens for API authentication
- Session-based authentication with PostgreSQL session store
- Role-based access control (presidente, propietario, proveedor)

### Backend Architecture

**Technology Stack**:
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database ORM**: Drizzle ORM with PostgreSQL (local or Neon serverless)
- **Session Management**: express-session (memory store for local, PostgreSQL for production)
- **Authentication**: JWT tokens with bcrypt for password hashing

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

1. **Users**: Stores user data with email/password authentication and role assignment
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

**Local Authentication**:
- Email/password authentication
- JWT tokens for API access
- Password hashing with bcrypt
- Session management with express-session
- Session encryption secret required (SESSION_SECRET env var)
- JWT secret required (JWT_SECRET env var)

### Database

**PostgreSQL**:
- Supports both standard PostgreSQL (via `pg`) and Neon serverless (via `@neondatabase/serverless`)
- Automatic detection based on connection string
- Local development: PostgreSQL 16 via Homebrew
- Production: Neon serverless or any PostgreSQL provider
- Connection pooling with pg Pool
- Required: DATABASE_URL environment variable
- Migration management via drizzle-kit

### Data Access Layer (Storage Abstraction)

**Architecture Pattern**: Repository Pattern with Factory

The application uses a strict abstraction layer for all database access to enable easy migration between different storage backends (PostgreSQL, PocketBase, etc.) without changing business logic.

**Key Components**:

1. **IStorage Interface** (`server/storage.ts`):
   - Defines all data access methods (getUser, createUser, getCommunities, etc.)
   - All methods return domain types (User, Community, etc.)
   - Implementation-agnostic contract that any storage backend must fulfill

2. **DatabaseStorage Implementation** (`server/storage.ts`):
   - Current implementation using Drizzle ORM with PostgreSQL
   - Encapsulates all direct database queries (`db.select()`, `db.insert()`, etc.)
   - **CRITICAL**: Only this class should access `db` directly

3. **Storage Factory** (`server/storage/factory.ts`):
   - Creates appropriate storage implementation based on `STORAGE_PROVIDER` env var
   - Default: `postgresql` (uses DatabaseStorage)
   - Future: Can support `pocketbase`, `mock` (for testing), etc.
   - Singleton pattern: `storage` instance exported for application-wide use

4. **Data Storage Module** (`server/storage/data-storage.ts`):
   - Main entry point for importing storage throughout the application
   - Re-exports `storage` singleton and `IStorage` interface
   - **Always import from here**: `import { storage } from "./storage/data-storage"`

**Architectural Rules**:

1. **Never import `db` directly** outside of `DatabaseStorage` class
   - ❌ Wrong: `import { db } from "./db"` in routes.ts
   - ✅ Correct: `import { storage } from "./storage/data-storage"`

2. **Never use database operations directly** outside of storage implementations
   - ❌ Wrong: `db.select().from(users)` in routes.ts
   - ✅ Correct: `await storage.getUser(id)` in routes.ts

3. **All data access must go through `storage` instance**
   - Routes, auth, and business logic use `storage` methods only
   - Storage implementations handle all ORM/database-specific code

4. **Storage implementations are swappable**
   - Change `STORAGE_PROVIDER` env var to switch backends
   - No code changes needed in routes, auth, or business logic

**File Structure**:
```
server/
  storage/
    factory.ts          # Factory pattern for creating storage instances
    data-storage.ts    # Main export point (import from here)
    local.ts           # File storage (uploads) - separate from data storage
    s3.ts              # S3 file storage - separate from data storage
    index.ts           # File storage exports (uploads)
  storage.ts           # IStorage interface + DatabaseStorage implementation
  db.ts                # Database connection (only used by DatabaseStorage)
```

**Migration Strategy**:

To migrate to a different backend (e.g., PocketBase):

1. Create new implementation: `server/storage/pocketbase.ts` implementing `IStorage`
2. Update factory: Add `case "pocketbase": return new PocketBaseStorage()`
3. Change env var: Set `STORAGE_PROVIDER=pocketbase`
4. No other code changes needed!

**Domain Types and Mappers**:

To further decouple storage implementations from the ORM, domain types are defined in `shared/types.ts`:

- `DomainUser`, `DomainCommunity`, `DomainProvider`, etc.
- These types are independent of Drizzle ORM
- Mappers in `server/storage/mappers.ts` convert between Drizzle types and domain types
- **Current Status**: Domain types and mappers are created but not yet used in IStorage interface (for backward compatibility)
- **Future**: IStorage interface can be updated to use domain types, and DatabaseStorage will use mappers for conversion

**Validation**:
- Run `./scripts/validate-dependencies.sh` to ensure no direct `db` access
- Script checks for violations of abstraction layer rules
- Should be run before commits and in CI/CD pipeline
- Script excludes `storage.ts` (the implementation) from validation

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
- **Vite Plugins**: React plugin for JSX/TSX transformation
- **ESBuild**: Server-side bundling for production

### Asset Management

**Static Assets**:
- attached_assets directory contains project documentation (Spanish product specs)
- Public assets served through Vite in development
- Font: Inter from Google Fonts (weights 400, 500, 600, 700)

### Critical Environment Variables

**Database & Storage**:
- `DATABASE_URL`: PostgreSQL connection string (required)
- `STORAGE_PROVIDER`: Data storage backend (`postgresql` default, future: `pocketbase`, `mock`)
- `STORAGE_LOCAL_PATH`: Local file storage path (for uploads, optional)
- `S3_BUCKET`, `S3_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: S3 file storage config (optional)

**Authentication & Security**:
- `SESSION_SECRET`: Session encryption key (required)
- `JWT_SECRET`: JWT token signing secret (required)
- `JWT_EXPIRES_IN`: JWT token expiration time (default: 7d)

**Server Configuration**:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `APP_URL`: Application URL for email verification links (default: http://localhost:3000)

**Rate Limiting**:
- `RATE_LIMIT_WINDOW_MS`: Time window for rate limiting (default: 900000 = 15 min)
- `RATE_LIMIT_MAX_REGISTER`: Max registration attempts per window (default: 5)
- `RATE_LIMIT_MAX_LOGIN`: Max login attempts per window (default: 10)
- `RATE_LIMIT_MAX_UPLOAD`: Max file uploads per hour (default: 20)
- `RATE_LIMIT_MAX_COMMUNITY_CREATION`: Max community creations per 24h (default: 3)