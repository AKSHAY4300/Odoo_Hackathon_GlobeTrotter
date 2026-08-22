const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const City = require('../models/City');
const Activity = require('../models/Activity');
const Trip = require('../models/Trip');
const Stop = require('../models/Stop');
const ItineraryItem = require('../models/ItineraryItem');

const citiesSeed = require('./cities.json');
const activitiesSeed = require('./activities.json');
const tripsSeed = require('./trips.json');
const usersSeed = require('./users.json');

async function seedDatabase(shouldClose = false) {
  console.log('🌱 Starting GlobeTrotter Database Seeding...');
  await connectDB();

  try {
    // 1. Clear existing collections
    console.log('🧹 Purging existing collections...');
    await Promise.all([
      User.deleteMany({}),
      City.deleteMany({}),
      Activity.deleteMany({}),
      Trip.deleteMany({}),
      Stop.deleteMany({}),
      ItineraryItem.deleteMany({}),
    ]);

    // 2. Seed Users
    console.log(`👤 Seeding ${usersSeed.length} users...`);
    const userMap = new Map();
    for (const u of usersSeed) {
      const passwordHash = await User.hashPassword(u.password || 'password123');
      const user = new User({
        name: u.name,
        email: u.email.toLowerCase(),
        passwordHash,
        avatarUrl: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        language: u.language || 'English (US)',
        preferredCurrency: u.preferredCurrency || 'USD',
        bio: u.bio || 'Global explorer and traveler.',
        role: u.role === 'admin' ? 'admin' : 'user',
        savedCityIds: u.savedCityIds || ['city-paris', 'city-tokyo'],
      });
      await user.save();
      userMap.set(u.id, user);
      userMap.set(u.email.toLowerCase(), user);
    }
    const defaultUser = userMap.get('usr-alex') || userMap.get('alex@globetrotter.io') || Array.from(userMap.values())[0];

    // 3. Seed Cities
    console.log(`🌍 Seeding ${citiesSeed.length} global destination cities...`);
    const cityMap = new Map();
    for (const c of citiesSeed) {
      const city = new City({
        customId: c.id,
        name: c.name,
        country: c.country,
        region: c.region,
        costIndex: c.costIndex || 2,
        popularityScore: c.popularityScore || 90,
        imageUrl: c.imageUrl,
        description: c.description || '',
        timezone: c.timezone || 'UTC',
        coordinates: c.coordinates || { lat: 0, lng: 0 },
        highlights: c.highlights || [],
        bestTimeToVisit: c.bestTimeToVisit || 'Year-round',
      });
      await city.save();
      cityMap.set(c.id, city);
      cityMap.set(c.name.toLowerCase(), city);
    }

    // 4. Seed Activities
    console.log(`🎭 Seeding ${activitiesSeed.length} curated activities...`);
    const activityMap = new Map();
    for (const a of activitiesSeed) {
      const cityDoc = cityMap.get(a.cityId);
      if (!cityDoc) {
        console.warn(`City ${a.cityId} not found for activity ${a.name}`);
        continue;
      }

      const activity = new Activity({
        customId: a.id,
        cityId: cityDoc._id,
        cityName: cityDoc.name,
        name: a.name,
        category: a.category || 'culture',
        description: a.description || '',
        cost: a.cost || 0,
        durationMinutes: a.durationMinutes || 60,
        imageUrl: a.imageUrl,
        rating: a.rating || 4.8,
        recommendedTime: a.recommendedTime || 'Morning',
      });
      await activity.save();
      activityMap.set(a.id, activity);
    }

    // 5. Seed Trips, Stops, and Itinerary Items
    console.log(`✈️  Seeding ${tripsSeed.length} multi-city itineraries...`);
    for (const t of tripsSeed) {
      const tripOwner = userMap.get(t.userId) || defaultUser;

      const trip = new Trip({
        userId: tripOwner._id,
        name: t.title || t.name,
        title: t.title || t.name,
        description: t.description || '',
        coverPhotoUrl: t.coverImageUrl || t.coverPhotoUrl,
        startDate: t.startDate,
        endDate: t.endDate,
        targetBudget: t.targetBudget || 2500,
        dailySpendThreshold: t.dailySpendThreshold || 250,
        isPublic: t.isPublic !== undefined ? t.isPublic : true,
        shareId: t.shareId || `pass-${Math.random().toString(36).substring(2, 8)}`,
        status: t.status || 'upcoming',
      });
      await trip.save();

      // Seed Stops for this trip
      if (Array.isArray(t.stops)) {
        for (let i = 0; i < t.stops.length; i++) {
          const s = t.stops[i];
          const cityDoc = cityMap.get(s.cityId) || cityMap.get((s.cityName || '').toLowerCase());

          const stop = new Stop({
            tripId: trip._id,
            cityId: cityDoc ? cityDoc._id : new mongoose.Types.ObjectId(),
            cityName: s.cityName || (cityDoc ? cityDoc.name : 'City Stop'),
            country: s.country || (cityDoc ? cityDoc.country : 'Global'),
            order: s.order !== undefined ? s.order : i,
            arrivalDate: s.arrivalDate || trip.startDate,
            departureDate: s.departureDate || trip.endDate,
            accommodationName: s.accommodationName || 'Central Hotel',
            accommodationCostPerNight: s.accommodationCostPerNight || 0,
            transportCostToStop: s.transportCostToStop || 0,
            transportMode: s.transportMode || 'flight',
            notes: s.notes || '',
          });
          await stop.save();

          // Seed Itinerary Items for this stop
          if (Array.isArray(s.activities)) {
            for (const act of s.activities) {
              const activityDoc = activityMap.get(act.activityId);

              const item = new ItineraryItem({
                tripId: trip._id,
                stopId: stop._id,
                activityId: activityDoc ? activityDoc._id : (activityMap.values().next().value?._id || new mongoose.Types.ObjectId()),
                title: act.title || (activityDoc ? activityDoc.name : 'Tour'),
                category: act.category || (activityDoc ? activityDoc.category : 'culture'),
                scheduledDate: act.scheduledDate || stop.arrivalDate,
                scheduledTime: act.startTime || act.scheduledTime || '10:00',
                durationMinutes: act.durationMinutes || 60,
                costOverride: act.cost !== undefined ? act.cost : null,
                notes: act.notes || '',
                location: act.location || stop.cityName,
              });
              await item.save();
            }
          }
        }
      }
    }

    console.log('\n======================================================');
    console.log('🎉 GlobeTrotter Database Seed Completed Successfully!');
    console.log(`   - Users: ${await User.countDocuments()}`);
    console.log(`   - Cities: ${await City.countDocuments()}`);
    console.log(`   - Activities: ${await Activity.countDocuments()}`);
    console.log(`   - Trips: ${await Trip.countDocuments()}`);
    console.log(`   - Stops: ${await Stop.countDocuments()}`);
    console.log(`   - Itinerary Items: ${await ItineraryItem.countDocuments()}`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    throw err;
  } finally {
    if (shouldClose) {
      await closeDB();
    }
  }
}

if (require.main === module) {
  seedDatabase(true);
}

module.exports = seedDatabase;
