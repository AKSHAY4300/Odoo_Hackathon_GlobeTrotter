const { calculateTripBudget } = require('../services/budget.service');
const Trip = require('../models/Trip');

const budgetController = {
  async getTripBudget(req, res, next) {
    try {
      const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Trip not found or unauthorized access.',
        });
      }

      const breakdown = await calculateTripBudget(trip._id);

      res.status(200).json({
        success: true,
        breakdown,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = budgetController;
