const mongoose = require('mongoose');

let mongoServer = null;

async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    let uri = process.env.MONGODB_URI;

    if (!uri) {
      if (!mongoServer) {
        console.log('ℹ️  No MONGODB_URI provided in environment. Initializing local MongoDB instance...');
        try {
          const { MongoMemoryServer } = require('mongodb-memory-server');
          mongoServer = await MongoMemoryServer.create();
          uri = mongoServer.getUri();
          process.env.MONGODB_URI = uri;
          console.log(`✅ Local In-Memory MongoDB running at: ${uri}`);
        } catch (memErr) {
          console.warn('⚠️  Could not start MongoMemoryServer, attempting default localhost:27017...');
          uri = 'mongodb://localhost:27017/globetrotter';
          process.env.MONGODB_URI = uri;
        }
      } else {
        uri = mongoServer.getUri();
      }
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
}

async function closeDB() {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
  } catch (err) {
    console.error('Error closing DB:', err);
  }
}

module.exports = { connectDB, closeDB };
