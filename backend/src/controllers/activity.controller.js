const Activity = require('../models/Activity');
const City = require('../models/City');

const activityController = {
  async getActivities(req, res, next) {
    try {
      const { search, category, type, cityId, maxCost } = req.query;
      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const catFilter = category || type;
      if (catFilter && catFilter.toLowerCase() !== 'all') {
        query.category = catFilter.toLowerCase();
      }

      if (cityId && cityId !== 'all') {
        let city = null;
        try {
          city = await City.findById(cityId);
        } catch {
          city = await City.findOne({ customId: cityId });
        }
        if (!city) {
          city = await City.findOne({ customId: cityId });
        }

        if (city) {
          query.cityId = city._id;
        } else {
          query.cityId = cityId;
        }
      }

      if (maxCost) {
        query.cost = { $lte: Number(maxCost) };
      }

      const activities = await Activity.find(query)
        .populate('cityId', 'name country')
        .sort({ rating: -1 });

      res.status(200).json({
        success: true,
        count: activities.length,
        activities,
      });
    } catch (err) {
      next(err);
    }
  },

  async getCityActivities(req, res, next) {
    try {
      const { cityId } = req.params;
      const { type, category, maxCost, duration, search } = req.query;

      let city = null;
      try {
        city = await City.findById(cityId);
      } catch {
        city = await City.findOne({ customId: cityId });
      }
      if (!city) {
        city = await City.findOne({ customId: cityId });
      }

      const query = {
        cityId: city ? city._id : cityId,
      };

      const catFilter = type || category;
      if (catFilter && catFilter.toLowerCase() !== 'all') {
        query.category = catFilter.toLowerCase();
      }

      if (maxCost) {
        query.cost = { $lte: Number(maxCost) };
      }

      if (duration) {
        query.durationMinutes = { $lte: Number(duration) };
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const activities = await Activity.find(query).sort({ rating: -1 });

      res.status(200).json({
        success: true,
        city: city || null,
        count: activities.length,
        activities,
      });
    } catch (err) {
      next(err);
    }
  },

  async getActivityById(req, res, next) {
    try {
      const { id } = req.params;
      let activity = null;

      try {
        activity = await Activity.findById(id).populate('cityId');
      } catch {
        activity = await Activity.findOne({ customId: id }).populate('cityId');
      }

      if (!activity) {
        activity = await Activity.findOne({ customId: id }).populate('cityId');
      }

      if (!activity) {
        return res.status(404).json({
          success: false,
          error: 'Activity not found.',
        });
      }

      res.status(200).json({
        success: true,
        activity,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = activityController;
