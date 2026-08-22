const Trip = require('../models/Trip');
const { getPopulatedTrip, cloneTrip } = require('../services/trip.service');

const publicController = {
  async getPublicTrip(req, res, next) {
    try {
      const { shareId } = req.params;
      if (!shareId) {
        return res.status(400).json({
          success: false,
          error: 'Boarding pass shareId is required.',
        });
      }

      const trip = await Trip.findOne({ shareId, isPublic: true });
      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Boarding pass not found or is set to private.',
        });
      }

      const populated = await getPopulatedTrip(trip._id);

      res.status(200).json({
        success: true,
        trip: populated,
      });
    } catch (err) {
      next(err);
    }
  },

  async clonePublicTrip(req, res, next) {
    try {
      const { shareId } = req.params;
      const targetUserId = req.user._id;

      const cloned = await cloneTrip(shareId, targetUserId);

      res.status(201).json({
        success: true,
        message: 'Voyage cloned successfully into your passport portfolio.',
        trip: cloned,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = publicController;
