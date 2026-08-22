const express = require('express');
const router = express.Router();
const cityController = require('../controllers/city.controller');
const activityController = require('../controllers/activity.controller');

// City queries
router.get('/', cityController.getCities);
router.get('/:cityId', cityController.getCityById);

// Activities attached to specific city
router.get('/:cityId/activities', activityController.getCityActivities);

module.exports = router;
