const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');
const stopController = require('../controllers/stop.controller');
const itemController = require('../controllers/item.controller');
const budgetController = require('../controllers/budget.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Trip Base CRUD & Sharing
router.get('/', tripController.getTrips);
router.post('/', tripController.createTrip);
router.get('/:id', tripController.getTripById);
router.put('/:id', tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);
router.post('/:id/share', tripController.shareTrip);

// Stop Management
router.post('/:id/stops', stopController.addStop);
router.put('/:id/stops/reorder', stopController.reorderStops);
router.put('/:id/stops/:stopId', stopController.updateStop);
router.delete('/:id/stops/:stopId', stopController.deleteStop);

// Itinerary Items Management
router.post('/:id/items', itemController.createItem);
router.put('/:id/items/:itemId', itemController.updateItem);
router.delete('/:id/items/:itemId', itemController.deleteItem);

// Server-computed Budget Engine
router.get('/:id/budget', budgetController.getTripBudget);

module.exports = router;
