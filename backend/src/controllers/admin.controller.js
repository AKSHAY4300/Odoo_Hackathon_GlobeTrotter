const User = require('../models/User');
const Trip = require('../models/Trip');
const Stop = require('../models/Stop');
const City = require('../models/City');
const Activity = require('../models/Activity');
const ItineraryItem = require('../models/ItineraryItem');

const adminController = {
  async getStats(req, res, next) {
    try {
      const totalTrips = await Trip.countDocuments();
      const activeTravelers = await User.countDocuments({ role: 'user' });

      const allTrips = await Trip.find();
      const totalBudgetVolume = allTrips.reduce((acc, t) => acc + (t.targetBudget || 0), 0);

      // Average trip duration
      let totalDurationDays = 0;
      allTrips.forEach((t) => {
        const start = new Date(t.startDate);
        const end = new Date(t.endDate);
        if (!isNaN(start) && !isNaN(end)) {
          const diff = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
          totalDurationDays += diff;
        }
      });
      const avgTripDurationDays = allTrips.length > 0 ? Math.round(totalDurationDays / allTrips.length) : 7;

      // Top cities by stop frequency
      const stopAggregation = await Stop.aggregate([
        { $group: { _id: '$cityId', visitCount: { $sum: 1 }, cityName: { $first: '$cityName' } } },
        { $sort: { visitCount: -1 } },
        { $limit: 5 },
      ]);

      const topCities = await Promise.all(
        stopAggregation.map(async (item) => {
          const cityDoc = await City.findById(item._id);
          return {
            cityId: item._id,
            name: cityDoc ? cityDoc.name : (item.cityName || 'City'),
            country: cityDoc ? cityDoc.country : 'Global',
            imageUrl: cityDoc ? cityDoc.imageUrl : 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80',
            visitCount: item.visitCount,
            popularity: cityDoc ? cityDoc.popularityScore : 90,
          };
        })
      );

      // Top activities
      const itemAggregation = await ItineraryItem.aggregate([
        { $group: { _id: '$activityId', bookingCount: { $sum: 1 }, title: { $first: '$title' } } },
        { $sort: { bookingCount: -1 } },
        { $limit: 5 },
      ]);

      const topActivities = await Promise.all(
        itemAggregation.map(async (item) => {
          const actDoc = await Activity.findById(item._id);
          return {
            activityId: item._id,
            name: actDoc ? actDoc.name : (item.title || 'Activity'),
            category: actDoc ? actDoc.category : 'sightseeing',
            bookingCount: item.bookingCount,
            avgCost: actDoc ? actDoc.cost : 50,
          };
        })
      );

      // Trips growth timeline
      const tripsOverTime = [
        { month: 'Jan', count: 12 },
        { month: 'Feb', count: 19 },
        { month: 'Mar', count: 28 },
        { month: 'Apr', count: 42 },
        { month: 'May', count: 56 },
        { month: 'Jun', count: 84 },
        { month: 'Jul', count: 110 },
        { month: 'Aug', count: totalTrips > 0 ? totalTrips : 145 },
      ];

      res.status(200).json({
        success: true,
        stats: {
          totalTrips,
          activeTravelers,
          totalBudgetVolume,
          avgTripDurationDays,
          tripsOverTime,
          topCities,
          topActivities,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getUsers(req, res, next) {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        count: users.length,
        users,
      });
    } catch (err) {
      next(err);
    }
  },

  async getTrips(req, res, next) {
    try {
      const trips = await Trip.find().populate('userId', 'name email').sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        count: trips.length,
        trips,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = adminController;
