# GlobeTrotter — Multi-City Personalized Trip Planning Application

**GlobeTrotter** is a personalized multi-city trip planning platform designed around a unique **travel-document aesthetic** (boarding passes, luggage tags, departure boards, and dashed flight-path route lines).

---

## Features Overview

- **Departure Terminal Dashboard**: Comprehensive flight status headers, live passport statistics, upcoming voyages, and destination recommendations.
- **Interactive Itinerary Builder**: Full drag-and-drop stop sequencing with animated flight route lines, lodging rates, and transit logistics.
- **Curated Experience Attachments**: Attach museum passes, foodie walking trails, boat charters, and outdoor adventures to specific stops and calendar days.
- **Live Budget & Financial Breakdown**: Interactive Recharts Donut (categorical breakdown) and Daily Spend Bar Chart with daily budget thresholds and Stamp-Red alerts.
- **Calendar & Daily Timeline**: Intra-day schedule reordering, time slots, and quick activity editing.
- **Public Shareable Boarding Passes**: Clean public view rendering outside the auth shell, complete with one-click itinerary cloning and QR pass preview.
- **Platform Analytics Hub**: System monitoring for total itineraries chartered, traveler volume, and top destination rankings.

---

## Design System Tokens

- **Ink Navy** (`#14213D`): Deep text & dark surfaces.
- **Runway White** (`#FAFAF7`): Canvas background & paper texture.
- **Boarding Amber** (`#F4A300`): Primary accent, CTAs, active indicators.
- **Signal Teal** (`#0F8B8D`): Secondary accent, category tags, link highlights.
- **Tarmac Grey** (`#6B7280`): Muted text, borders, dividers.
- **Stamp Red** (`#D64545`): Destructive actions & over-budget alerts.
- **Typography**: Space Grotesk (Display), Inter (Body), IBM Plex Mono (Travel Data).

---

## Running the Application

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` to explore GlobeTrotter.
