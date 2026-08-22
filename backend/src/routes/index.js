const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const tripRoutes = require('./trip.routes');
const cityRoutes = require('./city.routes');
const activityRoutes = require('./activity.routes');
const publicRoutes = require('./public.routes');
const adminRoutes = require('./admin.routes');

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'GlobeTrotter API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mounted Routes
router.use('/auth', authRoutes);
router.use('/trips', tripRoutes);
router.use('/cities', cityRoutes);
router.use('/activities', activityRoutes);
router.use('/public', publicRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
