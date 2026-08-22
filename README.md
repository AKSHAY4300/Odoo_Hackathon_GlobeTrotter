# ✈️ GlobeTrotter — Smart Multi-City Travel Planning Platform

> **A production-grade, personalized multi-city itinerary planner and travel concierge designed around an authentic travel-document aesthetic (boarding passes, ticket notches, departure boards, and dashed flight paths).**

---

## 🏆 Competition Criteria & Requirement Compliance

GlobeTrotter was engineered specifically to meet and exceed all **Must-Have** and **Nice-to-Have** competition requirements:

### ✅ MUST-HAVE REQUIREMENTS

| Competition Requirement | Implementation in GlobeTrotter |
|---|---|
| **1. Real-time / Dynamic Data Sources** *(Avoid relying on static JSON)* | Full **Node.js / Express REST API** integrated with **MongoDB & Mongoose 8** (`http://localhost:5000/api`). Dynamic database queries, automated database seeding, live server-computed budgets, and real-time cache invalidation with TanStack Query. |
| **2. Responsive & Clean UI** *(Consistent palette & layout)* | Cohesive travel design system tokens (`runway-white`, `ink-navy`, `boarding-amber`, `signal-teal`). 100% responsive across mobile, tablet, laptop, and widescreen displays with modular layouts. |
| **3. Robust User Input Validation** | **Zod Schemas + React Hook Form** on the frontend paired with validation middleware on the backend. Enforces start/end date constraints, positive budget ceilings, email format validation, and required field checks. |
| **4. Intuitive Navigation & Spacing** | Sticky departure board navigation bar, mobile slide-out drawer, tabbed itinerary navigation (`View Pass`, `Builder`, `Budget Breakdown`, `Calendar`), accessible modals, and keyboard accessibility. |
| **5. Proper Version Control (Git)** | Clean Git commit history tracking milestones across frontend architecture, backend REST endpoints, full-stack integration, and UI enhancements. |

---

### 🌟 NICE-TO-HAVE CAPABILITIES

| Nice-to-Have Requirement | Implementation in GlobeTrotter |
|---|---|
| **1. Backend API Design, Data Modeling & Local Database** | Custom REST API architecture with 6 relational Mongoose models (`User`, `City`, `Activity`, `Trip`, `Stop`, `ItineraryItem`). Embedded in-memory MongoDB fallback (`mongodb-memory-server`) allowing the entire app to run **100% locally with zero cloud lock-in or external database setup**. |
| **2. Deep Domain Adaptation** *(No blindly copied snippets)* | Custom-built travel components: tear-off boarding passes (`TicketCard`), animated flight path connectors (`DashedRoute`), server-computed financial engine with daily spend threshold alerts (`budget.service.js`), and public pass cloning. |
| **3. Offline & Local Resilience** *(Zero cloud dependency)* | **Offline Network Detector** (`useOnlineStatus`), **Intelligent Local Cache Fallback** in `apiClient.ts` (serves cached itineraries if network drops), and **Printable / Offline PDF Pass Export** (`@media print`) for physical airport use. |
| **4. High-Value Technology Selection** | Selected tools that add concrete user value: `React 18 + Vite` (fast HMR), `Zustand` (lightweight state), `TanStack Query` (smart caching), `Recharts` (budget analytics), `dnd-kit` (drag-and-drop itinerary reordering), `date-fns` (date math). |

---

## 🇮🇳 Indian Domestic & Outbound International Travel Focus

GlobeTrotter comes pre-seeded with authentic domestic and international travel routes, complete with **Indian Rupee (₹)** currency formatting and curated local experiences:

- **Royal Rajasthan & Golden Triangle Circuit** (8 Days): New Delhi ➔ Agra ➔ Jaipur ➔ Udaipur (*Taj Mahal Sunrise, Amber Fort, Lake Pichola Private Boat Cruise*).
- **God's Own Country Kerala Odyssey** (7 Days): Kochi ➔ Munnar ➔ Alleppey (*Tea plantation jeep safari, Fort Kochi spice walk, Deluxe private backwater houseboat cruise with Kerala Sadya*).
- **India to Southeast Asia Tropical Trail** (10 Days): Mumbai outbound ➔ Bangkok ➔ Singapore ➔ Bali (*Grand Palace, Gardens by the Bay Supertrees, Ubud jungle swing & waterfalls*).
- **Featured Destinations**: 18 Global & Indian hubs (New Delhi, Jaipur, Agra, Udaipur, Kochi, Munnar, Alleppey, Goa, Mumbai, Leh Ladakh, Varanasi, Bengaluru, Dubai, Bangkok, Singapore, Bali, Paris, London).

---

## 🏗️ Architecture & Technology Stack

```
GlobeTrotter/
├── frontend/                     # React 18 + TypeScript + Vite Client
│   ├── src/
│   │   ├── app/                  # Router (AppRoutes), Layouts (AppLayout, AuthLayout, PublicLayout)
│   │   ├── components/           # UI Primitives (Button, Card, Tabs, Drawer, Modal, DashedRoute)
│   │   │   └── trip/             # Domain Components (TicketCard, StopCard, ActivityChip, BudgetChart)
│   │   ├── pages/                # Screens (Dashboard, Builder, Budget, Calendar, Explore, Admin, Auth)
│   │   ├── services/             # Real HTTP REST Client (apiClient) + Service Layer
│   │   ├── stores/               # Zustand Stores (authStore, tripDraftStore, uiStore)
│   │   └── lib/                  # Zod schemas, dateUtils, currencyUtils (₹ formatting), useOnlineStatus
│   └── tailwind.config.js        # Design System Tokens & Typography (Plus Jakarta Sans & Inter)
│
└── backend/                      # Node.js + Express REST API
    ├── src/
    │   ├── models/               # Mongoose Schemas (User, Trip, Stop, City, Activity, ItineraryItem)
    │   ├── routes/               # API Routers (auth, trips, cities, activities, public, admin)
    │   ├── controllers/          # Request Handlers with input validation
    │   ├── services/             # Business Logic (Budget calculation engine, Share link generator)
    │   ├── middleware/           # JWT verification, Admin role guard, Error handling
    │   ├── config/               # DB connection (MongoDB / MongoMemoryServer fallback)
    │   └── seed/                 # Automatic seed script with 18 cities, 25 activities, 3 trips
    ├── tests/                    # Automated Integration Test Suite (28 assertions)
    └── server.js                 # Express server entry point with dynamic port support
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### 1. Start the Backend API Server
```bash
cd backend
npm install
npm start
```
> The backend will automatically initialize its local database, seed the initial Indian and outbound travel data, and start on `http://localhost:5000`.

### 2. Start the Frontend Application
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
> Open **`http://localhost:5173`** in your browser to launch GlobeTrotter.

---

## 🔑 Demo Access Credentials

| Profile Type | Email | Password | Role | Description |
|---|---|---|---|---|
| **Traveler (Default)** | `alex@globetrotter.io` | `password123` | `traveler` | Full access to create, edit, reorder, budget, and share voyages. |
| **Platform Admin** | `admin@globetrotter.io` | `password123` | `admin` | Access to live system analytics, telemetry, and platform management. |

> *Tip: The login screen includes **1-Click Instant Sign-In** buttons for both traveler and administrator profiles.*

---

## 🧪 Automated Testing & Production Build

### Run Backend Integration Test Suite:
```bash
cd backend
npm test
```
```
======================================================
🧪 Starting GlobeTrotter Backend API Test Suite...
======================================================
[1] Health Check: 200 OK
[2] Authentication Suite: Signup, Login, Me, Password Reset
[3] Cities & Activities Suite: Region filtering, Category search
[4] Trips, Stops & Budget Engine: CRUD, Reordering, Financial Engine
[5] Public Share & Isolation: 404 on unshared trips, cloning engine
[6] Admin Security Suite: Role guards, User & Trip telemetry
[7] Delete Cascade Cleanup: Foreign key cleanup
======================================================
✅ ALL BACKEND TEST SUITES PASSED CLEANLY (100% - 28/28 assertions)!
======================================================
```

### Run Frontend Production Compilation:
```bash
cd frontend
npm run build
```
```
✓ 2806 modules transformed.
✓ built in 7.97s with 0 TypeScript / linting errors.
```

---

## 📄 Key Application Endpoints

- **`GET /api/health`** — Backend health status.
- **`POST /api/auth/login`** & **`POST /api/auth/signup`** — Traveler authentication.
- **`GET /api/trips`** & **`POST /api/trips`** — Multi-city itinerary management.
- **`GET /api/trips/:id/budget`** — Server-computed budget and daily spend overage engine.
- **`GET /api/public/trips/:shareId`** — Read-only public travel pass access.
- **`GET /api/admin/stats`** — Platform operations and route telemetry (Admin only).

---

## 📜 License
Developed for the hackathon competition. All rights reserved.
