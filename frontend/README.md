# GlobeTrotter — Multi-City Travel Planner

GlobeTrotter is a personalized multi-city trip planning web application with a bespoke **travel-document aesthetic** (boarding passes, ticket stubs, luggage tags, departure boards, and dashed flight-path route lines).

---

## Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Launch
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Launch the development server
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## Design System Tokens & Aesthetics

GlobeTrotter's visual identity avoids generic dashboard aesthetics in favor of a tactile, travel-document look and feel:

- **Color Palette**:
  - **Ink Navy** (`#14213D`): Deep surfaces, headers, boarding pass contrast.
  - **Runway White** (`#FAFAF7`): Primary canvas, clean tactile paper texture.
  - **Boarding Amber** (`#F4A300`): Primary CTAs, active indicators, route markers.
  - **Signal Teal** (`#0F8B8D`): Secondary accents, category tags, link highlights.
  - **Tarmac Grey** (`#6B7280`): Muted text, borders, dividers.
  - **Stamp Red** (`#D64545`): Destructive actions and over-budget threshold alerts.
- **Typography**:
  - **Display / Headings**: Space Grotesk
  - **Body Copy**: Inter
  - **Travel Data Mono**: IBM Plex Mono / JetBrains Mono (for dates, times, durations, prices, PNR codes).
- **Signature Elements**:
  - Perforated ticket-stub edges (`TicketCard`) with radial notches.
  - Animated dashed flight-path route lines (`DashedRoute`).
  - Luggage tag badges with metallic eyelets.
  - Departure board status headers and passport stamps.

---

## 13 Screen Route Catalog

1. **Traveler Check-In / Login** (`/login`): Email/passcode validation with instant logins for Traveler and Admin profiles.
2. **Passport Issuance / Signup** (`/signup`): New account creation with Zod validation.
3. **Dashboard / Home** (`/`): Departure board hero, active trips rail (`TicketCard`), budget strip, recommended destinations.
4. **Charter New Itinerary** (`/trips/new`): Destination setup, date range, budget ceilings, cover photo selector/upload.
5. **My Itineraries Portfolio** (`/trips`): Grid & list views, status tabs (Upcoming, Active, Past), delete/edit actions.
6. **Itinerary Builder** (`/trips/:id/builder`): Drag-to-reorder stops via `dnd-kit`, animated route lines, expandable activities, city & activity drawers.
7. **Itinerary Structured View** (`/trips/:id`): Day-by-day and city-grouped reader, print layout, share triggers.
8. **World Atlas / City Search** (`/explore/cities`): Deep-linkable city explorer with region & cost tier ($ to $$$$) filters.
9. **Experiences / Activity Search** (`/explore/activities`): Deep-linkable catalog with category, price slider, and city filters.
10. **Trip Budget & Cost Breakdown** (`/trips/:id/budget`): Recharts Donut (categories) and Bar (daily spend), live threshold adjuster, Stamp-Red over-budget alert banner.
11. **Trip Calendar & Timeline** (`/trips/:id/calendar`): Day cell matrix, activity drag-and-drop within days, inline quick-edit popover.
12. **Shared / Public Travel Pass** (`/share/:shareId`): Renders outside authenticated app shell with "Copy Trip" cloning and QR code preview.
13. **Traveler Profile & Settings** (`/profile`): Passport card, preferences (currency/language), bucket list destinations, sample data restore.
14. **Platform Ops Hub / Admin** (`/admin`): Gated behind `role: 'admin'`, platform growth area chart, top destination rankings.

---

## Data Architecture & Services

All application data flows through modular services in `src/services/`:
- `src/services/store.ts`: Reactive data store with `localStorage` synchronization.
- `src/services/auth.ts`: Authentication, user preferences, and role switching.
- `src/services/trips.ts`: Trip CRUD, stop management, activity assignment, and trip cloning.
- `src/services/cities.ts`: City search and destination atlas queries.
- `src/services/activities.ts`: Activity search and filtering.
- `src/services/budget.ts`: Live budget calculations, category shares, and threshold checking.
- `src/services/admin.ts`: Platform growth metrics and analytics.
