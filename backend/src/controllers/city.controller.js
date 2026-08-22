const City = require('../models/City');

const cityController = {
  async getCities(req, res, next) {
    try {
      const { search, country, region, maxCostIndex } = req.query;
      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { country: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { highlights: { $elemMatch: { $regex: search, $options: 'i' } } },
        ];
      }

      if (country) {
        query.country = { $regex: country, $options: 'i' };
      }

      if (region && region.toLowerCase() !== 'all') {
        query.region = { $regex: new RegExp(`^${region}$`, 'i') };
      }

      if (maxCostIndex) {
        query.costIndex = { $lte: Number(maxCostIndex) };
      }

      const cities = await City.find(query).sort({ popularityScore: -1 });

      res.status(200).json({
        success: true,
        count: cities.length,
        cities,
      });
    } catch (err) {
      next(err);
    }
  },

  async getCityById(req, res, next) {
    try {
      const { cityId } = req.params;
      let city = null;

      try {
        city = await City.findById(cityId);
      } catch {
        city = await City.findOne({ customId: cityId });
      }

      if (!city) {
        city = await City.findOne({ customId: cityId });
      }

      if (!city) {
        return res.status(404).json({
          success: false,
          error: 'City not found.',
        });
      }

      res.status(200).json({
        success: true,
        city,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = cityController;
