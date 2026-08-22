const ItineraryItem = require('../models/ItineraryItem');
const Trip = require('../models/Trip');
const Stop = require('../models/Stop');
const Activity = require('../models/Activity');
const { getPopulatedTrip } = require('../services/trip.service');

const itemController = {
  async createItem(req, res, next) {
    try {
      const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Trip not found or unauthorized access.',
        });
      }

      const {
        stopId,
        activityId,
        title,
        category,
        scheduledDate,
        scheduledTime,
        durationMinutes,
        costOverride,
        cost,
        notes,
        location,
      } = req.body;

      if (!stopId) {
        return res.status(400).json({
          success: false,
          error: 'Stop ID is required to schedule an experience.',
        });
      }

      const stop = await Stop.findOne({ _id: stopId, tripId: trip._id });
      if (!stop) {
        return res.status(404).json({
          success: false,
          error: 'Stop not found in this trip.',
        });
      }

      let resolvedActivityId = activityId;
      let activityDoc = null;

      if (activityId) {
        try {
          activityDoc = await Activity.findById(activityId);
        } catch {
          activityDoc = await Activity.findOne({ customId: activityId });
        }
        if (!activityDoc) {
          activityDoc = await Activity.findOne({ customId: activityId });
        }
        if (activityDoc) {
          resolvedActivityId = activityDoc._id;
        }
      }

      // If no activityDoc found, create a fallback virtual activity or require activityId
      if (!activityDoc && !resolvedActivityId) {
        // Create custom user activity under stop city
        const customAct = new Activity({
          cityId: stop.cityId,
          name: title || 'Custom Experience',
          category: category || 'sightseeing',
          cost: costOverride !== undefined && costOverride !== null ? costOverride : (cost || 0),
          imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
        });
        await customAct.save();
        resolvedActivityId = customAct._id;
        activityDoc = customAct;
      }

      const finalCostOverride =
        costOverride !== undefined && costOverride !== null
          ? costOverride
          : (cost !== undefined ? cost : null);

      const item = new ItineraryItem({
        tripId: trip._id,
        stopId: stop._id,
        activityId: resolvedActivityId,
        title: title || (activityDoc ? activityDoc.name : 'Experience'),
        category: category || (activityDoc ? activityDoc.category : 'culture'),
        scheduledDate: scheduledDate || stop.arrivalDate,
        scheduledTime: scheduledTime || (activityDoc?.recommendedTime === 'Afternoon' ? '14:00' : '10:00'),
        durationMinutes: durationMinutes || (activityDoc ? activityDoc.durationMinutes : 60),
        costOverride: finalCostOverride,
        notes: notes || '',
        location: location || stop.cityName,
      });

      await item.save();
      const updatedTrip = await getPopulatedTrip(trip._id);

      res.status(201).json({
        success: true,
        item,
        trip: updatedTrip,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateItem(req, res, next) {
    try {
      const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Trip not found or unauthorized access.',
        });
      }

      const { cost, costOverride, startTime, scheduledTime, ...otherUpdates } = req.body;
      const updates = { ...otherUpdates };

      if (cost !== undefined || costOverride !== undefined) {
        updates.costOverride = costOverride !== undefined ? costOverride : cost;
      }

      if (startTime || scheduledTime) {
        updates.scheduledTime = scheduledTime || startTime;
      }

      const item = await ItineraryItem.findOneAndUpdate(
        { _id: req.params.itemId, tripId: trip._id },
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Itinerary item not found in this trip.',
        });
      }

      const updatedTrip = await getPopulatedTrip(trip._id);

      res.status(200).json({
        success: true,
        item,
        trip: updatedTrip,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteItem(req, res, next) {
    try {
      const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Trip not found or unauthorized access.',
        });
      }

      const item = await ItineraryItem.findOneAndDelete({
        _id: req.params.itemId,
        tripId: trip._id,
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Itinerary item not found.',
        });
      }

      const updatedTrip = await getPopulatedTrip(trip._id);

      res.status(200).json({
        success: true,
        message: 'Experience removed from itinerary.',
        trip: updatedTrip,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = itemController;
