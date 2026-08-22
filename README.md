# ✈️ GlobeTrotter — Smart Multi-City Travel Planning Platform

GlobeTrotter is a full-featured, multi-city trip planning platform and travel concierge designed to help travelers effortlessly map complex itineraries, organize activities across destinations, track live budgets, and share read-only digital boarding passes with friends and family.

Crafted around an authentic travel-document visual language (boarding passes, departure boards, and dashed flight routes), the platform provides a clean, responsive, and tactile planning experience on any device.

---

## 🌟 Key Highlights & Features

### 1. Dynamic Itinerary Builder & Flight Sequencing
- **Multi-City Route Mapping**: Seamlessly connect consecutive destinations with arrival/departure dates, lodging details, and transit modes (flights, trains, cabs, ferries).
- **Interactive Drag-and-Drop Reordering**: Easily adjust stop sequences or daily activity timelines with smooth, accessible drag-and-drop mechanics.
- **Visual Route Connectors**: Dashed flight lines and destination badges provide a clear visual overview of your entire route.

### 2. Live Dynamic Backend & Local Database Setup
- **RESTful API Engine**: Powered by Node.js, Express, and Mongoose for complete, real-time data persistence.
- **Relational Data Modeling**: Structured schemas for users, trips, stops, destination cities, curated activities, and daily schedules.
- **Zero-Cloud Local Resilience**: Automatically initializes an embedded local database instance on launch with automatic seed data, allowing the entire application to run seamlessly offline or in air-gapped local environments.

### 3. Smart Budget & Financial Analytics Engine
- **Automated Cost Aggregation**: Automatically calculates total expenditures across lodging, transit, and curated activities in real time.
- **Interactive Visualizations**: Categorical expenditure breakdown (donut chart) and day-by-day spend distribution (bar chart).
- **Threshold Alerts**: Set target budget limits and daily spend ceilings with visual indicators to keep trips on track.
- **Indian Rupee (₹) & Global Currency Support**: Native support for Indian Rupee formatting (`₹`) with Indian number notation, alongside user-selectable global currencies.

### 4. Offline Capability & Travel Document Export
- **Smart Local Storage Caching**: Automatically saves fetched itineraries locally so you can review your trip plans mid-flight or in areas with spotty Wi-Fi.
- **Network Status Awareness**: Gently notifies travelers when working in offline mode without disrupting the user experience.
- **Printable & PDF Boarding Passes**: One-click print-ready boarding pass view designed for physical paper printouts and mobile PDF saves.

### 5. Public Sharing & Expedition Cloning
- **Unique Shareable Travel Passes**: Generate read-only public URLs that anyone can view without creating an account.
- **One-Click Itinerary Cloning**: Fellow travelers can duplicate any shared public pass directly into their own account to customize and make it their own.

### 6. Curated Indian & Global Destinations
- **Domestic Indian Circuits**: Pre-loaded with iconic itineraries such as the *Royal Rajasthan & Golden Triangle Circuit* (Delhi, Agra, Jaipur, Udaipur) and *God's Own Country Kerala Odyssey* (Kochi, Munnar, Alleppey).
- **International Outbound Routes**: Popular outbound destinations from India including Bangkok, Singapore, Bali, Dubai, Paris, and London.
- **Authentic Local Activities**: Includes sunrise Taj Mahal visits, high-altitude Munnar tea estate treks, Alleppey backwater houseboats with traditional Sadya, and desert safaris.

### 7. Intuitive Navigation & Robust Data Validation
- **Modern Responsive Design**: Built with a curated, friendly font stack (**Plus Jakarta Sans** and **Inter**) and an aviation-themed color palette.
- **Comprehensive Form Validation**: Frontend validation powered by Zod and React Hook Form ensures accurate date ordering, valid financial values, and proper credentials, paired with backend request validation.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Zustand (client state), TanStack Query (server state & caching), Recharts (financial charts), dnd-kit (drag-and-drop), date-fns (date formatting).
- **Backend**: Node.js, Express, MongoDB with Mongoose 8, JSON Web Tokens (JWT), Bcrypt password hashing, MongoMemoryServer (local database fallback).
- **Architecture**: Decoupled client-server architecture with shared data contracts and RESTful API endpoints.

---

## 📁 Project Structure

```
GlobeTrotter/
├── frontend/                     # React 18 + TypeScript + Vite Client Application
│   ├── src/
│   │   ├── app/                  # Application routing, layout wrappers, and providers
│   │   ├── components/           # UI primitives (Buttons, Cards, Modals, Drawers)
│   │   │   └── trip/             # Domain components (TicketCard, ActivityChip, BudgetChart)
│   │   ├── pages/                # Screen views (Dashboard, Builder, Budget, Calendar, Explore, Admin)
│   │   ├── services/             # HTTP REST API client with offline storage caching
│   │   ├── stores/               # State management (auth session, trip draft, UI drawers)
│   │   └── lib/                  # Validation schemas, currency helpers, offline hook
│   └── tailwind.config.js        # Theme tokens and font configuration
│
└── backend/                      # Node.js + Express REST API Server
    ├── src/
    │   ├── models/               # Mongoose data models (User, Trip, Stop, City, Activity)
    │   ├── routes/               # API endpoint routers
    │   ├── controllers/          # Business logic handlers and request processing
    │   ├── services/             # Budget computation engine and sharing utilities
    │   ├── middleware/           # JWT authentication and payload validation
    │   ├── config/               # Database connection and environment configuration
    │   └── seed/                 # Pre-loaded Indian & international travel datasets
    ├── tests/                    # Integration test suite (28 automated assertions)
    └── server.js                 # Server entry point with dynamic port allocation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher

### 1. Launch the Backend API
```bash
cd backend
npm install
npm start
```
> The backend server will automatically connect to its local database, seed the initial travel routes and destination data, and start on `http://localhost:5000`.

### 2. Launch the Frontend Client
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
> Open your browser and navigate to **`http://localhost:5173`** to access the GlobeTrotter portal.

---

## 👤 Sample Demonstration Accounts

For convenience during evaluation, pre-configured accounts are ready to use (or you can use the instant one-click login buttons on the sign-in page):

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Traveler** | `alex@globetrotter.io` | `password123` | Full access to create, edit, customize, budget, and share personal itineraries. |
| **Administrator** | `admin@globetrotter.io` | `password123` | Access to the administrative dashboard, telemetry metrics, and platform data. |

---

## 🧪 Testing & Build Verification

### Backend Automated Test Suite
To run the automated integration test suite:
```bash
cd backend
npm test
```
*Executes 28 comprehensive test assertions covering authentication, CRUD operations, budget calculation accuracy, public pass security isolation, and administrative role guards.*

### Frontend Production Build
To verify type safety and build the optimized production bundle:
```bash
cd frontend
npm run build
```
*Transpiles and bundles all assets with zero TypeScript or linting errors.*

---

## 📜 License & Acknowledgments
Designed and built for the hackathon competition. All rights reserved.
