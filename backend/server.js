const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./src/config/db');
const apiRoutes = require('./src/routes/index');
const errorHandler = require('./src/middleware/error.middleware');

const app = express();
const DEFAULT_PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api', apiRoutes);

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

const City = require('./src/models/City');
const seedDatabase = require('./src/seed/seed');

// Start Server Function
let server = null;
async function startServer(port = DEFAULT_PORT) {
  await connectDB();

  // Auto-seed if database is freshly initialized and empty
  try {
    const cityCount = await City.countDocuments();
    if (cityCount === 0) {
      console.log('ℹ️  Empty database detected. Running automatic seeder...');
      await seedDatabase(false);
    }
  } catch (err) {
    console.warn('⚠️  Auto-seed skipped:', err.message);
  }

  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      const activePort = server.address().port;
      console.log(`\n======================================================`);
      console.log(`✈️  GlobeTrotter Backend API running on port: ${activePort}`);
      console.log(`📡 Health Check: http://localhost:${activePort}/api/health`);
      console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`======================================================\n`);
      resolve(server);
    });

    server.on('error', (err) => {
      reject(err);
    });
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
