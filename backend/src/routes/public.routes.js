const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public read-only itinerary pass view (Zero Auth Required)
router.get('/trips/:shareId', publicController.getPublicTrip);

// Clone public pass into authenticated traveler's portfolio (Requires Auth)
router.post('/trips/:shareId/clone', authMiddleware, publicController.clonePublicTrip);

module.exports = router;
