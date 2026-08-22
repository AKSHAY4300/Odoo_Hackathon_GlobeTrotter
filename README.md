# ✈️ GlobeTrotter — Smart Multi-City Travel Planning Platform

GlobeTrotter is an intuitive, all-in-one travel planning concierge designed to take the stress out of building multi-city journeys. Whether organizing a week-long road trip across Rajasthan, navigating the backwaters of Kerala, or coordinating an outbound journey across Southeast Asia, GlobeTrotter brings every flight, hotel stay, guided tour, and budget breakdown together into a clean, digital boarding pass.

Designed with an authentic travel-document aesthetic—complete with ticket notch cutouts, departure boards, and dashed flight route maps—the application offers a tactile and responsive planning experience on mobile, tablet, and desktop screens alike.

---

## 🌟 What’s Inside the Platform

### 🗺️ Dynamic Multi-City Route Builder
- **Flexible City Connections**: Add destinations in sequence, specify arrival and departure dates, record hotel stays, and choose transit modes such as flights, express trains, rental cabs, or ferries.
- **Drag-and-Drop Itinerary Organization**: Reorder stops on the fly or rearrange activities within daily schedules using smooth and accessible drag-and-drop interactions.
- **Visual Flight Path Dividers**: Interactive route connectors give travelers a quick, comprehensive view of their entire trip itinerary at a single glance.

### ⚡ Full-Stack REST Architecture & Local Database Setup
- **Live RESTful API**: Built with Node.js, Express, and Mongoose, providing persistent data management for trips, stops, activities, and user profiles.
- **Zero-Configuration Local Database**: Automatically initializes an embedded local database instance upon startup with pre-seeded travel routes, allowing the application to run completely self-contained with no external cloud accounts or internet database setups required.
- **Relational Data Integrity**: Clean schemas and foreign key associations connecting users, multi-stop itineraries, and catalogued experiences.

### 💰 Live Expense Tracking & Financial Analytics
- **Real-Time Cost Calculations**: As you add lodging, transit fares, and activity tickets, the budget engine calculates total estimated costs dynamically.
- **Visual Expense Breakdown**: Interactive donut charts for categorical allocations (lodging, transit, activities) and bar charts for day-by-day spending patterns.
- **Daily Budget Ceiling Alerts**: Set daily spending thresholds to receive helpful visual warnings if planned activities exceed your daily allowance.
- **Full Indian Rupee (₹) & Global Currency Support**: Native formatting in Indian Rupees (`₹`) with Indian number grouping, alongside options to switch preferred currencies.

### 📴 Offline Resilience & Mid-Flight Mode
- **Intelligent Local Caching**: Automatically saves viewed itineraries to browser local storage so you can reference your plans while on airplanes or in areas with limited mobile data.
- **Offline Status Notifications**: A subtle status banner appears when connectivity drops, reassuring travelers that their cached itineraries remain fully accessible.
- **Printable Boarding Passes & PDF Export**: A dedicated print view optimized for clean physical printouts and PDF downloads to keep a hard copy in your carry-on bag.

### 🤝 Shareable Public Passes & Itinerary Cloning
- **Read-Only Public URLs**: Generate clean public links that friends or family can open without needing to register or log in.
- **One-Click Trip Cloning**: Fellow travelers can duplicate any shared public itinerary directly into their personal account to customize for their own travels.

### 🇮🇳 Curated Indian & Outbound Global Itineraries
- **Pre-Loaded Domestic Circuits**:
  - *Royal Rajasthan & Golden Triangle* (Delhi ➔ Agra ➔ Jaipur ➔ Udaipur)
  - *God's Own Country Kerala Odyssey* (Kochi ➔ Munnar ➔ Alleppey)
- **Popular Outbound Travel Routes**: Multi-destination itineraries connecting Indian departures with Bangkok, Singapore, Bali, Dubai, Paris, and London.
- **Authentic Local Activities**: Curated experiences including Taj Mahal sunrise tours, Old Delhi culinary walks, high-altitude Munnar tea plantation safaris, Alleppey private houseboats with traditional Kerala Sadya, and desert safaris.

### 🎨 Clean Typography, Responsive UI & Robust Validation
- **Friendly, Readable Fonts**: Styled with modern typography using **Plus Jakarta Sans** for headers and **Inter** for clean readability across all screen sizes.
- **Thoughtful Color Hierarchy**: Grounded in an aviation theme featuring deep navy, warm boarding amber, signal teal, and soft parchment canvas.
- **Airtight Input Validation**: Frontend validation powered by Zod and React Hook Form enforces date consistency, positive budget ceilings, and complete form inputs before saving.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Zustand (client session & drawer state), TanStack Query (server state & background synchronization), Recharts (interactive financial charts), dnd-kit (accessible drag-and-drop), date-fns (date formatting and calculations).
- **Backend**: Node.js, Express, MongoDB with Mongoose 8, JSON Web Tokens (JWT), Bcrypt (secure password hashing), MongoMemoryServer (embedded database fallback).
- **Tooling**: Non-destructive mock fallback layer, automated test suite runner, and Vite production bundler.

---

## 📁 Project Architecture

```
GlobeTrotter/
├── frontend/                     # React 18 + TypeScript + Vite Client
│   ├── src/
│   │   ├── app/                  # Routing system, layout wrappers, and context providers
│   │   ├── components/           # UI elements (Buttons, Cards, Modals, Drawers, DashedRoute)
│   │   │   └── trip/             # Domain components (TicketCard, ActivityChip, BudgetChart)
│   │   ├── pages/                # Screens (Dashboard, Builder, Budget, Calendar, Explore, Admin)
│   │   ├── services/             # REST API client with intelligent offline storage caching
│   │   ├── stores/               # State stores (auth session, active trip draft, UI drawers)
│   │   └── lib/                  # Zod validation schemas, currency formatting, offline hook
│   └── tailwind.config.js        # Design system tokens and typography settings
│
└── backend/                      # Node.js + Express REST API Server
    ├── src/
    │   ├── models/               # Mongoose schemas (User, Trip, Stop, City, Activity)
    │   ├── routes/               # API endpoints for auth, trips, cities, public shares, and admin
    │   ├── controllers/          # Request handlers and response formatters
    │   ├── services/             # Financial calculation engine and public pass generator
    │   ├── middleware/           # JWT auth verify, admin guards, and input validation
    │   ├── config/               # Database connection logic with embedded fallback
    │   └── seed/                 # Pre-loaded Indian & outbound international travel data
    ├── tests/                    # 28-assertion automated integration test suite
    └── server.js                 # Express server entry point
```

---

## 🚀 Quick Launch Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### Step 1: Start the Backend Server
```bash
cd backend
npm install
npm start
```
> The backend server connects to its local database, seeds the destination catalog and sample itineraries, and begins listening on `http://localhost:5000`.

### Step 2: Start the Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
> Open your browser and navigate to **`http://localhost:5173`** to access the GlobeTrotter platform.

---

## 👤 Sample Login Accounts

For quick demonstration and evaluation, the following pre-configured accounts are ready for use (or use the one-click demo login buttons on the sign-in screen):

| Profile | Email | Password | Access Level |
|---|---|---|---|
| **Traveler** | `alex@globetrotter.io` | `password123` | Create, customize, sequence, budget, and share personal voyages. |
| **Administrator** | `admin@globetrotter.io` | `password123` | View live platform telemetry, total chartered trips, and destination trends. |

---

## 🧪 Quality Assurance & Test Verification

### Backend Automated Test Suite
To run the automated integration test suite:
```bash
cd backend
npm test
```
*Runs 28 automated test assertions verifying user authentication, data isolation, budget calculations, public share cloning, and administrative access controls.*

### Frontend Production Build
To verify type safety and build the optimized production distribution:
```bash
cd frontend
npm run build
```
*Transpiles and validates all components with zero TypeScript or compilation errors.*

---

## 📜 License
Designed and developed for the hackathon competition. All rights reserved.
