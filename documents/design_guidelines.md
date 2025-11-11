# Provcontrol Design Guidelines - Compact Edition

## Core Design Principles
**Framework**: Hybrid social platform (LinkedIn professionalism + Airbnb trust + Instagram engagement) for property management communities.

**Pillars**:
1. **Vibrant Energy**: Bold visuals conveying community vitality
2. **Social-First**: Timeline feeds, activity streams, interaction-focused
3. **Visual Verification**: Prominent badges, trust indicators, transparent ratings
4. **Spacious Layout**: Generous whitespace emphasizing key content
5. **Mobile-Optimized**: Thumb-zone navigation, swipe gestures, bottom sheets

---

## Typography

**Font**: Inter or DM Sans

**Scale**:
- Hero: `text-5xl/text-6xl font-bold tracking-tight` (desktop), `text-4xl` (mobile)
- Sections: `text-3xl/text-4xl font-bold`
- Card Headlines: `text-2xl font-semibold`
- Subheadings: `text-xl font-semibold`
- Body: `text-base/text-lg`
- Meta: `text-sm font-medium`
- Captions: `text-xs uppercase tracking-wide`

**Weights**: Bold (700) headlines, Semibold (600) emphasis, Medium (500) UI, Regular (400) body.

---

## Layout & Spacing

**Spacing Units**: `4, 6, 8, 12, 16, 20, 24`

**Containers**:
- Feed/Timeline: `max-w-3xl` (centered)
- Dashboard: `max-w-7xl`
- Forms: `max-w-2xl`
- Hero: Full-width with inner `max-w-7xl`
- Padding: `px-4/px-6` mobile, `px-8/px-12` desktop

**Grids**:
- Provider cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Stats: `grid-cols-2 md:grid-cols-4`
- Feed: Single column `max-w-3xl`

---

## Navigation

**Top Bar** (Desktop):
- Left: Logo wordmark
- Center: Prominent search bar
- Right: Notifications (badge), Messages, Avatar dropdown

**Mobile**: 
- Hamburger + search icon top
- Bottom tabs (h-16): Home, Incidents, Providers, Community, Profile
- Active: Filled icon + label

**Sidebar** (Desktop):
- `w-64`, sections: Dashboard, My Community, Incidents, Providers, Documents, Forum, Settings
- Active: Background highlight, bold, left border accent

---

## Components

### Hero Sections

**Landing**:
- `min-h-screen`, gradient overlay on community photo (16:9 desktop, 4:3 mobile)
- `text-6xl font-bold` headline, compelling subtitle
- CTAs: `h-14 px-8`, blurred glass (`backdrop-blur-md bg-white/20 border border-white/30`)

**Dashboard**:
- Compact (`h-48/h-64`), community photo background
- Community name, member count, role badge
- Quick stats row, action buttons with glass effect

### Feed & Cards

**Activity Feed**:
- Vertical cards: `rounded-2xl shadow-lg p-6`
- Structure: Avatar (`size-12`) + name + role badge + timestamp → content → media → interaction row (Like/Comment/Share) → nested comments
- Post types: Incident updates (before/after), budget comparisons, announcements (border accent), provider highlights, ratings

**Card Design**:
- Base: `rounded-2xl shadow-lg`, hover `scale-102`
- Padding: `p-6/p-8`
- Image cards: Full-bleed top (`rounded-t-2xl`)
- Stat cards: Large number, label, trend arrow

**Incident Cards**:
- Thumbnail grid (`grid-cols-3 gap-2`)
- Status badge: `rounded-full px-4 py-1.5 text-sm font-semibold`
- Progress stepper (horizontal)
- Mobile: Full-width CTA

**Provider Cards**:
- Profile: `size-20 rounded-full`, verified badge overlay (top-right)
- `text-2xl font-bold` name, category pills
- Star rating: `text-3xl`, review count
- Stats grid: Jobs, response time, rating breakdown
- Hover: Shadow increase, border accent

### Budget Comparison

- Hero: Incident summary with images
- Grid: `grid-cols-1 md:grid-cols-3 gap-6`
- Provider columns: Logo, name, rating, price (`text-4xl font-bold`)
- Line items: Sticky header, alternating rows, checkmarks/highlights
- Mobile: Swipeable carousel → detailed comparison

### Ratings & Verification

**Input**:
- Stars: `size-10`, interactive
- Photo grid: Required evidence upload
- Textarea: `min-h-32`
- Verification checklist with checkmarks
- Submit: Disabled until complete

**Display**:
- Score: `text-6xl font-bold` with stars
- Breakdown: Horizontal bars
- Verified badge: `size-16`, "Calificación Verificada" label, glow effect
- Photo gallery grid below

### Badges

**Verification**: Shield + checkmark, "Verificado", size variants (large/medium/small), glow effect

**Roles**: Pill-shaped, icons (Crown/Building/Briefcase) or initials (P/O/PR)

**Status**: `rounded-full`, icon + text (Open, Budgeted, In Progress, Resolved, Disputed)

### Forms

- Labels: `text-sm font-semibold uppercase tracking-wide`
- Inputs: `h-14 rounded-xl border-2 px-4`, focus `ring-4`
- File upload: Drag-drop zone (`min-h-48`), dashed border
- Multi-step: Progress bar, step indicators
- Submit: `h-14`, full-width mobile
- Errors: Border accent, icon, message below

### Buttons

**Primary**:
- Size: `h-12/h-14 px-8/px-10 rounded-xl`
- Font: `text-base/text-lg font-semibold`
- Full-width mobile, `min-w-40` desktop

**On Images**: `backdrop-blur-md bg-white/20 border border-white/30` (or dark variant), readable contrast

**FAB** (Mobile): `size-16`, fixed `bottom-20 right-6`, `shadow-2xl`

---

## Images

**Hero**: High-res community photos, gradient overlay, 16:9 (desktop), 4:3 (mobile)

**Dashboard Banner**: Community-specific, `h-64` desktop / `h-48` mobile, blurred for overlays

**Content**:
- Incidents: `grid-cols-2/3`, `rounded-xl`, expandable gallery, before/after slider
- Providers: `size-24` profile (page), `size-12` (cards), masonry portfolio
- Feed: Full-width in card, `rounded-xl`, `grid-cols-2` (2-4 imgs), `grid-cols-3` (5+)

**Empty States**: Centered illustrations, `text-lg` supporting text, CTA button

---

## Micro-Interactions

**Hover**: Cards (`scale-102`, shadow++), Buttons (`scale-105`, brightness++), Links (underline slide)

**Loading**: Skeleton screens (pulsing gradient), spinners (branded circular), progress bars (file uploads)

**Transitions**: `duration-200/300 ease-out` - Page (fade+slide), Modal (scale 95→100), Dropdown (slide+fade)

---

## Mobile Patterns

- Pull-to-refresh on feeds
- Swipe: Delete/archive (left), quick actions (right)
- Bottom sheets: Filters, replies, share
- Tab nav within profiles (Info/Reviews/Portfolio)
- Sticky: Filters, search, CTAs
- Touch targets: Min `h-12` (48px)
- Primary actions: Bottom third (thumb zone)

---

## Accessibility

- Contrast: AA minimum, AAA preferred
- ARIA labels on icon buttons
- Keyboard: All elements focusable, visible `ring-4` focus
- Forms: Inline errors with icons
- Screen reader: Status change announcements
- Alt text: All images
- Skip-to-content links

---

**Implementation Note**: Glass morphism (blurred backgrounds on images) and verification badges are signature trust-building elements. Maintain vibrant, social energy through generous spacing, bold typography, and prominent visual verification throughout.