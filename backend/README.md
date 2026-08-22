# GlobeTrotter — Backend API

Production-ready REST API for **GlobeTrotter**, the multi-city travel planning platform. Built with Node.js, Express, MongoDB (Mongoose), JWT authentication, and modular service engines.

---

## 🛠️ Tech Stack & Architecture

- **Runtime**: Node.js (v18+) & Express 4
- **Database / ODM**: MongoDB + Mongoose 8
- **Authentication**: JWT (JSON Web Tokens) with `httpOnly`-compatible bearer patterns
- **Password Security**: BcryptJS with salt work factor 10
- **Validation**: Zod schema middleware
- **Embedded Database Fallback**: `mongodb-memory-server` allows zero-configuration local execution and testing if a local MongoDB service is not pre-installed.

---

## 📁 Directory Layout

```
backend/
  src/
    config/          # Database connection (MongoDB + MongoMemoryServer fallback)
    controllers/     # Thin request handlers (auth, trip, stop, city, activity, item, budget, public, admin)
    middleware/      # JWT auth guard, Admin role guard, Zod validation, global error handler
    models/          # Mongoose schemas (User, Trip, Stop, City, Activity, ItineraryItem)
    routes/          # Express route definitions
    seed/            # Complete database seeder with matching cities/activities/trips
    services/        # Business logic (budget calculation engine, share code generation, trip aggregation)
  tests/             # Automated end-to-end integration test suite
  server.js          # Main Express server entry point
  .env.example       # Environment variable template
  README.md          # API documentation & cURL examples
```

---

## 🚀 Getting Started

### 1. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default `.env` values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=globetrotter_jwt_secret_dev_key_2026_super_secure_token
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

> **Note on MongoDB**: If `MONGODB_URI` is left blank, GlobeTrotter automatically launches an embedded in-memory MongoDB instance for immediate out-of-the-box local development. To use a local or cloud cluster, set:
> ```env
> MONGODB_URI=mongodb://localhost:27017/globetrotter
> ```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Seed Database
Populate 15 global cities, 40+ curated activities, 3 demo multi-city trips, and traveler & admin accounts:
```bash
npm run seed
```

### 4. Start the API Server
```bash
npm run dev
```
The API server will listen on `http://localhost:5000`.

### 5. Run Automated Tests
```bash
npm test
```

---

## 📖 API Reference & cURL Examples

### 🔐 Authentication

#### 1. Traveler Check-In / Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@globetrotter.io",
    "password": "password123"
  }'
```
**Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": "64f1...",
    "name": "Alex Mercer",
    "email": "alex@globetrotter.io",
    "role": "user"
  }
}
```

#### 2. Traveler Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Elena Rostova",
    "email": "elena@globetrotter.io",
    "password": "password123"
  }'
```

#### 3. Current User Profile (Protected)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

### ✈️ Trips & Itineraries

#### 1. List User's Trips
```bash
curl -X GET http://localhost:5000/api/trips \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

#### 2. Charter New Trip
```bash
curl -X POST http://localhost:5000/api/trips \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nordic Lights Expedition",
    "description": "7-day journey across Scandinavian capitals.",
    "startDate": "2026-11-01",
    "endDate": "2026-11-08",
    "targetBudget": 2800,
    "dailySpendThreshold": 350
  }'
```

#### 3. Get Trip Details with Populated Stops & Activities
```bash
curl -X GET http://localhost:5000/api/trips/<TRIP_ID> \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

#### 4. Make Trip Public / Share
```bash
curl -X POST http://localhost:5000/api/trips/<TRIP_ID>/share \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

### 📍 Stops Management

#### 1. Add Stop to Itinerary
```bash
curl -X POST http://localhost:5000/api/trips/<TRIP_ID>/stops \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "cityId": "city-paris",
    "arrivalDate": "2026-11-01",
    "departureDate": "2026-11-04",
    "accommodationName": "Boutique Hotel Opera",
    "accommodationCostPerNight": 140,
    "transportCostToStop": 95,
    "transportMode": "flight"
  }'
```

#### 2. Reorder Stops
```bash
curl -X PUT http://localhost:5000/api/trips/<TRIP_ID>/stops/reorder \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "stopIds": ["<STOP_ID_2>", "<STOP_ID_1>"]
  }'
```

---

### 🎭 Itinerary Items & Experiences

#### 1. Schedule Activity with Cost Override
```bash
curl -X POST http://localhost:5000/api/trips/<TRIP_ID>/items \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "stopId": "<STOP_ID>",
    "activityId": "act-louvre-tour",
    "title": "VIP Louvre Guided Tour",
    "scheduledDate": "2026-11-02",
    "scheduledTime": "09:30",
    "durationMinutes": 150,
    "costOverride": 75
  }'
```

---

### 💰 Server-Computed Budget Engine

```bash
curl -X GET http://localhost:5000/api/trips/<TRIP_ID>/budget \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```
**Response**:
```json
{
  "success": true,
  "breakdown": {
    "totalEstimated": 2340,
    "targetBudget": 2800,
    "dailySpendThreshold": 350,
    "totalAccommodation": 840,
    "totalTransport": 380,
    "totalActivities": 760,
    "totalMealsAndIncidentals": 360,
    "categoryBreakdown": [
      { "name": "Accommodations", "amount": 840, "percentage": 36 },
      { "name": "Activities & Tours", "amount": 760, "percentage": 32 },
      { "name": "Flights & Transit", "amount": 380, "percentage": 16 },
      { "name": "Meals & Sundries", "amount": 360, "percentage": 15 }
    ],
    "dailySpends": [ ... ],
    "overBudgetDays": [ ... ]
  }
}
```

---

### 🌍 Public Shared Itineraries

#### 1. View Public Boarding Pass (No Auth Required)
```bash
curl -X GET http://localhost:5000/api/public/trips/<SHARE_ID>
```

#### 2. Clone Public Itinerary (Requires Auth)
```bash
curl -X POST http://localhost:5000/api/public/trips/<SHARE_ID>/clone \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

### 🛡️ Platform Administration (Admin Role Guarded)

#### 1. Platform Telemetry & Growth Stats
```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```
