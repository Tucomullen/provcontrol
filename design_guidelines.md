# Design Guidelines for Provcontrol MVP

## Design Approach

**Selected Framework**: Material Design principles adapted for mobile-first property management
**Justification**: Provcontrol requires a trustworthy, data-dense interface that prioritizes functionality while remaining approachable for non-technical property owners. Material Design provides excellent patterns for complex information hierarchies, forms, and status tracking.

**Key Design Principles**:
1. **Transparency First**: Visual clarity in data presentation, budget comparisons, and verification states
2. **Mobile-Optimized**: Touch-friendly targets, thumb-zone navigation, collapsible sections
3. **Role-Aware Interface**: Clear visual differentiation between President, Owner, and Provider views
4. **Trust & Credibility**: Professional aesthetic emphasizing security and verified information

---

## Typography System

**Font Stack**: 
- Primary: Inter or System UI (-apple-system, BlinkMacSystemFont)
- Headings: 600-700 weight
- Body: 400 weight
- UI Elements: 500 weight

**Type Scale**:
- Hero/Page Titles: text-3xl to text-4xl (mobile), text-4xl to text-5xl (desktop)
- Section Headings: text-xl to text-2xl
- Card Titles: text-lg font-semibold
- Body Text: text-base (16px minimum for mobile readability)
- Meta/Status: text-sm
- Microcopy: text-xs

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16**
- Component padding: p-4 to p-6 (mobile), p-6 to p-8 (desktop)
- Card spacing: space-y-4 within cards
- Section margins: mb-8 to mb-12
- Grid gaps: gap-4 to gap-6

**Container Strategy**:
- Max-width: max-w-7xl for dashboards
- Max-width: max-w-2xl for forms and focused content
- Full-width: Data tables and comparison views
- Mobile: px-4, Desktop: px-6 to px-8

**Grid System**:
- Mobile: Single column (grid-cols-1)
- Tablet: 2 columns for cards (md:grid-cols-2)
- Desktop: 3-4 columns for provider directory, incident cards (lg:grid-cols-3, xl:grid-cols-4)
- Budget comparison tables: Horizontal scroll on mobile, full-width comparison on desktop

---

## Component Library

### Navigation
**Primary Navigation** (Mobile-First):
- Bottom navigation bar (fixed) with 4-5 core sections: Dashboard, Incidents, Providers, Documents, Community
- Top app bar: Logo, community name, user avatar/role indicator, notifications bell
- Desktop: Side navigation (expanded) with same sections, collapsible on tablet

**Role Indicator**: Prominent badge in header showing "Presidente", "Propietario", or "Proveedor"

### Dashboard Cards
- Elevated cards with subtle shadow (shadow-sm to shadow-md)
- Rounded corners: rounded-lg
- Status indicators: Dot badges (inline-flex items-center) with status text
- Action buttons: Bottom-right or bottom-full-width on mobile

### Incident Management
**Incident Card**:
- Thumbnail image (square, rounded) showing incident photo
- Status badge (top-right): "Abierta", "Presupuestada", "En Curso", "Resuelta"
- Timeline component showing progression through states
- Expandable accordion for full details and photo gallery

**Incident Detail View**:
- Hero image section with incident photos (swipeable gallery on mobile)
- Status timeline (vertical on mobile, horizontal on desktop)
- Attached documents list with file type icons
- Comment/update thread
- Action buttons (sticky footer on mobile)

### Provider Directory
**Provider Card**:
- Profile image or logo (rounded-full, size-16 to size-20)
- Category badge (e.g., "Fontanería", "Electricidad")
- Star rating with verification badge
- Key stats: # of jobs, avg response time
- "Solicitar Presupuesto" button

**Provider Profile**:
- Header with profile image, name, categories, overall rating
- Verified badge prominently displayed
- Stats grid: Completed jobs, response time, rating breakdown
- Reviews section with linked incidents (showing verification chain)
- Right of reply section for contested reviews

### Budget Comparison System
**Comparison Table** (Critical USP):
- Sticky header row with provider names/logos
- Left column: Line items (description of work)
- Grid cells: Prices with visual indicators (lowest highlighted)
- Bottom row: Total with visual comparison bars
- Mobile: Horizontal scroll with first column (items) sticky
- Desktop: Full-width table with fixed layout

**Budget Request Form**:
- Multi-step form on mobile (progress indicator)
- Single-page form on desktop with clear sections
- File upload for supporting documents/photos
- Category selection with icon grid
- Description textarea with character counter

### Rating System
**Rating Input** (Verification-Focused):
- Star rating component (large, touch-friendly)
- Required fields: Photo evidence upload, detailed text review
- Verification checklist displayed: ✓ Incident linked, ✓ Budget approved, ✓ Invoice matched
- President authorization indicator
- Submit disabled until all verification criteria met

**Rating Display**:
- Overall score (large, prominent)
- Breakdown by criteria: Quality, Timeliness, Budget Adherence
- Verification badge: "Calificación Verificada" with tooltip explaining process
- Link to source incident and documentation
- Provider reply section (if exists)

### Document Management
**Document List**:
- List view with file type icons (PDF, JPG, etc.)
- Metadata: Upload date, uploader role, file size
- Preview on tap/click
- Download/share actions
- Categories: Actas, Facturas, Estatutos, Presupuestos
- Search and filter bar (sticky on scroll)

### Forums & Community Board
**Thread List**:
- Card-based layout
- Author avatar, name, role badge
- Reply count, last activity timestamp
- Category tags
- Pin indicator for important announcements

**Thread View**:
- First post prominent (larger, different background)
- Nested replies with indent and connection lines
- Inline reply form (expanding textarea)
- Sort options: Newest, Oldest, Most Relevant

### Forms
**Form Design Principles**:
- Labels above inputs (mobile-friendly)
- Input heights: h-12 minimum (touch-friendly)
- Focus states: ring-2 ring-offset-2
- Error messages: text-sm below field
- Help text: text-xs, muted
- Required field indicator: asterisk or "(obligatorio)"
- Submit buttons: w-full on mobile, min-w-32 on desktop

### Notifications
**Notification System**:
- Bell icon with unread badge in header
- Dropdown panel (mobile: bottom sheet, desktop: dropdown)
- Grouped by type: Incidents, Budgets, Community, Ratings
- Timestamp and brief preview
- Unread indicator (bold text, background highlight)
- Mark as read action

### Status & Verification Badges
**Status Indicators**:
- Pill-shaped badges (rounded-full px-3 py-1)
- Icon + text combination
- Color-coded states (without specifying colors, design should accommodate):
  - Open/Active states
  - In Progress states
  - Completed/Resolved states
  - Attention Required states

**Verification Badge**:
- Icon (checkmark shield) + "Verificado" text
- Used on ratings, president actions, completed incidents
- Tooltip explaining verification criteria

---

## Mobile-First Specific Patterns

**Bottom Sheets**: For filters, quick actions, provider selection
**Floating Action Button**: Primary action on listing pages (e.g., "+ Nueva Incidencia")
**Swipe Gestures**: Delete/archive actions on lists, photo gallery navigation
**Pull to Refresh**: On dashboard, incident list, forum threads
**Tab Navigation**: Within complex pages (e.g., Provider profile: Info, Reviews, Stats)
**Sticky Headers**: Table headers, form section headers during scroll
**Touch Targets**: Minimum 44x44px (h-11 or h-12 in Tailwind)

---

## Data Visualization

**Budget Comparison Chart**: Horizontal bar chart showing price ranges
**Rating Distribution**: Stacked bars showing 5-star to 1-star breakdown
**Incident Timeline**: Vertical stepper component
**Community Stats Dashboard**: Card-based KPIs with large numbers and trend indicators
**Spending Overview**: Simple bar or line chart (month-over-month)

---

## Images

**Hero Image**: NOT applicable for dashboard app - focus on functional first screen (incident list or community stats dashboard)

**Incident Photos**:
- Thumbnail grid in card (2x2 or 3x2)
- Full-screen gallery view with zoom capability
- Before/after comparison layout where applicable

**Provider Logos/Photos**:
- Circular profile images
- Fallback: Initial avatar with distinct patterns

**Document Previews**:
- Thumbnail for image documents
- Icon + filename for PDFs and other files

**Empty States**:
- Illustrative images for:
  - No incidents yet
  - No providers in directory
  - No documents uploaded
  - Empty forum
- Centered, with encouraging call-to-action below

---

## Accessibility & Compliance

- High contrast text ratios throughout
- Form labels properly associated
- ARIA labels for icon-only buttons
- Keyboard navigation for all interactive elements
- Focus indicators visible and distinct
- Error messages associated with form fields
- Screen reader announcements for status changes
- Document links with descriptive text (not just "Download")

---

This design creates a professional, trustworthy platform that balances complex functionality with mobile-first usability, emphasizing the verification and transparency that differentiate Provcontrol from competitors.