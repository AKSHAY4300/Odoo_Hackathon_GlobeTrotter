const http = require('http');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
process.env.NODE_ENV = 'test';

const { app, startServer } = require('../server');
const seedDatabase = require('../src/seed/seed');
const { closeDB } = require('../src/config/db');

let server;
let baseUrl;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : {};
        } catch {
          parsed = { raw: data };
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting GlobeTrotter Backend API Test Suite...');
  console.log('======================================================\n');

  try {
    // 1. Seed database first
    await seedDatabase();

    // 2. Start server
    server = await startServer();
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    let travelerToken = '';
    let adminToken = '';
    let travelerUser = null;
    let createdTripId = '';
    let createdStopId = '';
    let createdItemId = '';
    let shareId = '';

    // ==========================================
    // 1. HEALTH CHECK
    // ==========================================
    console.log('\n[1] Health Check:');
    const health = await request('GET', '/api/health');
    assert(health.status === 200, 'GET /api/health returns 200 OK');
    assert(health.body.status === 'ok', 'Response status is ok');

    // ==========================================
    // 2. AUTHENTICATION
    // ==========================================
    console.log('\n[2] Authentication Suite:');
    
    // Signup new traveler
    const newTravelerEmail = `test.traveler.${Date.now()}@globetrotter.io`;
    const signupRes = await request('POST', '/api/auth/signup', {
      name: 'Test Explorer',
      email: newTravelerEmail,
      password: 'password123',
    });
    assert(signupRes.status === 201, 'POST /api/auth/signup returns 201 Created');
    assert(!!signupRes.body.token, 'Signup returns JWT token');
    assert(!signupRes.body.user.passwordHash, 'Signup response strips passwordHash');
    assert(signupRes.body.user.email === newTravelerEmail.toLowerCase(), 'User email matches');

    // Login with Alex
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'alex@globetrotter.io',
      password: 'password123',
    });
    assert(loginRes.status === 200, 'POST /api/auth/login returns 200 OK for alex');
    assert(!!loginRes.body.token, 'Login returns JWT token');
    assert(!loginRes.body.user.passwordHash, 'Login response strips passwordHash');
    travelerToken = loginRes.body.token;
    travelerUser = loginRes.body.user;

    // Login with Admin
    const adminLoginRes = await request('POST', '/api/auth/login', {
      email: 'admin@globetrotter.io',
      password: 'password123',
    });
    assert(adminLoginRes.status === 200, 'POST /api/auth/login returns 200 OK for admin');
    assert(adminLoginRes.body.user.role === 'admin', 'Admin user has role: admin');
    adminToken = adminLoginRes.body.token;

    // Login invalid credentials
    const invalidLogin = await request('POST', '/api/auth/login', {
      email: 'alex@globetrotter.io',
      password: 'wrongpassword',
    });
    assert(invalidLogin.status === 401, 'POST /api/auth/login with wrong password returns 401');

    // GET /api/auth/me (Protected)
    const meRes = await request('GET', '/api/auth/me', null, travelerToken);
    assert(meRes.status === 200, 'GET /api/auth/me returns 200 OK with valid JWT');
    assert(meRes.body.user.email === 'alex@globetrotter.io', 'Returns current traveler profile');
    assert(!meRes.body.user.passwordHash, 'GET /api/auth/me never leaks password');

    // GET /api/auth/me without token
    const meNoToken = await request('GET', '/api/auth/me');
    assert(meNoToken.status === 401, 'GET /api/auth/me without token returns 401 Unauthorized');

    // Forgot Password
    const forgotRes = await request('POST', '/api/auth/forgot-password', {
      email: 'alex@globetrotter.io',
    });
    assert(forgotRes.status === 200, 'POST /api/auth/forgot-password returns 200 and reset token');

    // ==========================================
    // 3. CITIES & ACTIVITIES
    // ==========================================
    console.log('\n[3] Cities & Activities Suite:');

    const citiesRes = await request('GET', '/api/cities');
    assert(citiesRes.status === 200, 'GET /api/cities returns 200 OK');
    assert(Array.isArray(citiesRes.body.cities) && citiesRes.body.cities.length >= 15, 'Returns 15 seeded cities');

    const europeCities = await request('GET', '/api/cities?region=Europe');
    assert(europeCities.status === 200, 'GET /api/cities?region=Europe returns 200 OK');
    assert(europeCities.body.cities.every((c) => c.region === 'Europe'), 'All returned cities are in Europe');

    const firstCity = citiesRes.body.cities[0];
    const cityDetail = await request('GET', `/api/cities/${firstCity._id}`);
    assert(cityDetail.status === 200, `GET /api/cities/${firstCity._id} returns single city`);

    const cityActivities = await request('GET', `/api/cities/${firstCity._id}/activities`);
    assert(cityActivities.status === 200, `GET /api/cities/${firstCity._id}/activities returns activities`);

    const allActivities = await request('GET', '/api/activities?category=culture');
    assert(allActivities.status === 200, 'GET /api/activities?category=culture returns 200 OK');

    // ==========================================
    // 4. TRIPS, STOPS, ITINERARY ITEMS & BUDGET
    // ==========================================
    console.log('\n[4] Trips, Stops, Itinerary Items & Budget:');

    // Create Trip
    const createTripRes = await request(
      'POST',
      '/api/trips',
      {
        title: 'Mediterranean Voyage 2026',
        description: 'Multi-city cruise through French and Italian rivieras.',
        startDate: '2026-09-01',
        endDate: '2026-09-10',
        targetBudget: 3200,
        dailySpendThreshold: 300,
      },
      travelerToken
    );
    assert(createTripRes.status === 201, 'POST /api/trips returns 201 Created');
    assert(createTripRes.body.trip.title === 'Mediterranean Voyage 2026', 'Trip title saved correctly');
    createdTripId = createTripRes.body.trip._id;

    // Get My Trips
    const myTripsRes = await request('GET', '/api/trips', null, travelerToken);
    assert(myTripsRes.status === 200, 'GET /api/trips returns 200 OK');
    assert(myTripsRes.body.trips.some((t) => String(t._id) === String(createdTripId)), 'Created trip listed in my trips');

    // Add Stop 1
    const addStop1 = await request(
      'POST',
      `/api/trips/${createdTripId}/stops`,
      {
        cityId: firstCity._id,
        cityName: firstCity.name,
        country: firstCity.country,
        arrivalDate: '2026-09-01',
        departureDate: '2026-09-05',
        accommodationName: 'Riviera Boutique Resort',
        accommodationCostPerNight: 160,
        transportCostToStop: 120,
        transportMode: 'flight',
      },
      travelerToken
    );
    assert(addStop1.status === 201, 'POST /api/trips/:id/stops returns 201 Created');
    createdStopId = addStop1.body.stop._id;

    // Add Stop 2
    const secondCity = citiesRes.body.cities[1];
    const addStop2 = await request(
      'POST',
      `/api/trips/${createdTripId}/stops`,
      {
        cityId: secondCity._id,
        cityName: secondCity.name,
        country: secondCity.country,
        arrivalDate: '2026-09-05',
        departureDate: '2026-09-10',
        accommodationName: 'Grand Coastal Suites',
        accommodationCostPerNight: 180,
        transportCostToStop: 75,
        transportMode: 'train',
      },
      travelerToken
    );
    assert(addStop2.status === 201, 'POST /api/trips/:id/stops (Stop 2) returns 201 Created');
    const secondStopId = addStop2.body.stop._id;

    // Reorder Stops
    const reorderRes = await request(
      'PUT',
      `/api/trips/${createdTripId}/stops/reorder`,
      {
        stopIds: [secondStopId, createdStopId],
      },
      travelerToken
    );
    assert(reorderRes.status === 200, 'PUT /api/trips/:id/stops/reorder returns 200 OK');

    // Add Itinerary Item with Cost Override
    const sampleActivity = allActivities.body.activities[0];
    const addItemRes = await request(
      'POST',
      `/api/trips/${createdTripId}/items`,
      {
        stopId: createdStopId,
        activityId: sampleActivity._id,
        title: 'VIP Guided Museum Tour',
        scheduledDate: '2026-09-02',
        scheduledTime: '10:00',
        durationMinutes: 120,
        costOverride: 85,
      },
      travelerToken
    );
    assert(addItemRes.status === 201, 'POST /api/trips/:id/items returns 201 Created');
    createdItemId = addItemRes.body.item._id;

    // Update Itinerary Item
    const updateItemRes = await request(
      'PUT',
      `/api/trips/${createdTripId}/items/${createdItemId}`,
      {
        costOverride: 95,
        scheduledTime: '14:30',
      },
      travelerToken
    );
    assert(updateItemRes.status === 200, 'PUT /api/trips/:id/items/:itemId returns 200 OK');
    assert(updateItemRes.body.item.costOverride === 95, 'Cost override updated');

    // Server-computed Budget Endpoint
    const budgetRes = await request('GET', `/api/trips/${createdTripId}/budget`, null, travelerToken);
    assert(budgetRes.status === 200, 'GET /api/trips/:id/budget returns 200 OK');
    assert(budgetRes.body.breakdown.totalEstimated > 0, 'Total estimated budget computed');
    assert(Array.isArray(budgetRes.body.breakdown.dailySpends), 'Daily spends array populated');
    assert(Array.isArray(budgetRes.body.breakdown.categoryBreakdown), 'Category breakdown computed');

    // ==========================================
    // 5. PUBLIC SHARE & ISOLATION
    // ==========================================
    console.log('\n[5] Public Share & Isolation Suite:');

    // Unshared trip should return 404 from public endpoint
    const unsharedPublicRes = await request('GET', `/api/public/trips/unknown-share-id`);
    assert(unsharedPublicRes.status === 404, 'GET /api/public/trips/:shareId returns 404 for invalid shareId');

    // Make trip public
    const shareRes = await request('POST', `/api/trips/${createdTripId}/share`, null, travelerToken);
    assert(shareRes.status === 200, 'POST /api/trips/:id/share returns 200 OK');
    assert(shareRes.body.isPublic === true, 'Trip is marked isPublic: true');
    assert(!!shareRes.body.shareId, 'ShareId generated');
    shareId = shareRes.body.shareId;

    // Public view without auth
    const publicViewRes = await request('GET', `/api/public/trips/${shareId}`);
    assert(publicViewRes.status === 200, 'GET /api/public/trips/:shareId returns 200 OK without any auth headers');
    assert(publicViewRes.body.trip.title === 'Mediterranean Voyage 2026', 'Public projection returns trip details');

    // Clone public trip
    const cloneRes = await request('POST', `/api/public/trips/${shareId}/clone`, null, adminToken);
    assert(cloneRes.status === 201, 'POST /api/public/trips/:shareId/clone returns 201 Created for authenticated user');
    assert(cloneRes.body.trip.title.includes('(Copy)'), 'Cloned trip title contains (Copy)');

    // ==========================================
    // 6. ADMIN SECURITY & STATS
    // ==========================================
    console.log('\n[6] Admin Security Suite:');

    // Traveler trying to access admin route -> 403 Forbidden
    const travelerForbidden = await request('GET', '/api/admin/stats', null, travelerToken);
    assert(travelerForbidden.status === 403, 'GET /api/admin/stats with traveler token returns 403 Forbidden');

    // Admin accessing admin stats -> 200 OK
    const adminStats = await request('GET', '/api/admin/stats', null, adminToken);
    assert(adminStats.status === 200, 'GET /api/admin/stats with admin token returns 200 OK');
    assert(adminStats.body.stats.totalTrips >= 3, 'Stats returns totalTrips count');
    assert(Array.isArray(adminStats.body.stats.topCities), 'Stats returns topCities rankings');

    const adminUsers = await request('GET', '/api/admin/users', null, adminToken);
    assert(adminUsers.status === 200, 'GET /api/admin/users returns 200 OK');

    // ==========================================
    // 7. CLEANUP / DELETE TRIP
    // ==========================================
    console.log('\n[7] Delete / Cascade Cleanup:');

    const deleteTripRes = await request('DELETE', `/api/trips/${createdTripId}`, null, travelerToken);
    assert(deleteTripRes.status === 200, 'DELETE /api/trips/:id returns 200 OK');

    const checkDeleted = await request('GET', `/api/trips/${createdTripId}`, null, travelerToken);
    assert(checkDeleted.status === 404, 'GET /api/trips/:id returns 404 after deletion');

    console.log('\n======================================================');
    console.log('✅ ALL BACKEND TEST SUITES PASSED CLEANLY (100%)!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Test Failure:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await closeDB();
    process.exit(process.exitCode || 0);
  }
}

runTests();
