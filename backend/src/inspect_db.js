const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB, closeDB } = require('./config/db');
const User = require('./models/User');
const City = require('./models/City');
const Activity = require('./models/Activity');
const Trip = require('./models/Trip');
const Stop = require('./models/Stop');
const ItineraryItem = require('./models/ItineraryItem');

async function inspectDatabase() {
  console.log('\n======================================================');
  console.log('🔍 GlobeTrotter Live Database Viewer');
  console.log('======================================================\n');

  try {
    await connectDB();

    const seedDatabase = require('./seed/seed');
    const cityCount = await City.countDocuments();
    if (cityCount === 0) {
      console.log('ℹ️  Seeding database snapshot for inspection...');
      await seedDatabase(false);
    }

    console.log('📊 COLLECTION SUMMARY:');
    console.log(`   - Users:            ${await User.countDocuments()}`);
    console.log(`   - Cities:           ${await City.countDocuments()}`);
    console.log(`   - Activities:       ${await Activity.countDocuments()}`);
    console.log(`   - Trips:            ${await Trip.countDocuments()}`);
    console.log(`   - Stops:            ${await Stop.countDocuments()}`);
    console.log(`   - Itinerary Items:  ${await ItineraryItem.countDocuments()}`);

    console.log('\n👤 1. USERS:');
    const users = await User.find().select('-passwordHash');
    console.table(users.map(u => ({
      ID: u._id.toString().slice(-6),
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Currency: u.preferredCurrency,
    })));

    console.log('\n🌍 2. DESTINATION CITIES (Sample 6):');
    const cities = await City.find().limit(6);
    console.table(cities.map(c => ({
      ID: c.customId || c._id.toString().slice(-6),
      Name: c.name,
      Country: c.country,
      Region: c.region,
      Popularity: c.popularityScore,
    })));

    console.log('\n✈️  3. MULTI-CITY VOYAGES:');
    const trips = await Trip.find().populate('userId', 'name email');
    console.table(trips.map(t => ({
      ID: t._id.toString().slice(-6),
      Title: t.title,
      Owner: t.userId?.name || 'Unknown',
      Budget: `₹${(t.targetBudget || 0).toLocaleString('en-IN')}`,
      Start: t.startDate,
      End: t.endDate,
      ShareID: t.shareId,
    })));

    console.log('\n======================================================');
    console.log('✅ End of Database Inspection');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Inspection Error:', err.message);
  } finally {
    await closeDB();
    process.exit(0);
  }
}

inspectDatabase();
