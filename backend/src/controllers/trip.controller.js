const Trip = require('../models/Trip');
const Stop = require('../models/Stop');
const City = require('../models/City');
const ItineraryItem = require('../models/ItineraryItem');
const { getPopulatedTrip } = require('../services/trip.service');
const { generateShareId } = require('../services/share.service');

const tripController = {
  async getTrips(req, res, next) {
    try {
      const trips = await Trip.find({ userId: req.user._id }).sort({ createdAt: -1 });

      const populatedTrips = await Promise.all(
        trips.map((t) => getPopulatedTrip(t._id, req.user._id))
      );

      res.status(200).json({
        success: true,
        count: populatedTrips.length,
        trips: populatedTrips,
      });
    } catch (err) {
      next(err);
    }
  },

  async getTripById(req, res, next) {
    try {
      const trip = await getPopulatedTrip(req.params.id, req.user._id);
      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Trip not found or unauthorized access.',
        });
      }

      res.status(200).json({
        success: true,
        trip,
      });
    } catch (err) {
      next(err);
    }
  },

  async createTrip(req, res, next) {
    try {
      const {
        title,
        name,
        description,
        coverPhotoUrl,
        coverImageUrl,
        startDate,
        endDate,
        targetBudget,
        dailySpendThreshold,
        stops = [],
      } = req.body;

      const tripName = title || name;
      if (!tripName || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Trip name/title, startDate, and endDate are required.',
        });
      }

      const trip = new Trip({
        userId: req.user._id,
        name: tripName,
        title: tripName,
        description: description || '',
        coverPhotoUrl: coverImageUrl || coverPhotoUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
        startDate,
        endDate,
        targetBudget: targetBudget || 2500,
        dailySpendThreshold: dailySpendThreshold || 250,
        shareId: generateShareId('pass'),
        isPublic: false,
        status: 'upcoming',
      });

      await trip.save();

      // Insert any initial stops if provided
      if (Array.isArray(stops) && stops.length > 0) {
        for (let i = 0; i < stops.length; i++) {
          const s = stops[i];
          let resolvedCityId = s.cityId;
          let resolvedCityName = s.cityName;
          let resolvedCountry = s.country;

          if (s.cityId) {
            let city = null;
            try {
              city = await City.findById(s.cityId);
            } catch {
              city = await City.findOne({ customId: s.cityId });
            }
            if (!city) {
              city = await City.findOne({ customId: s.cityId });
            }
            if (city) {
              resolvedCityId = city._id;
              resolvedCityName = resolvedCityName || city.name;
              resolvedCountry = resolvedCountry || city.country;
            }
          }

          const newStop = new Stop({
            tripId: trip._id,
            cityId: resolvedCityId,
            cityName: resolvedCityName || 'City Stop',
            country: resolvedCountry || '',
            order: s.order !== undefined ? s.order : i,
            arrivalDate: s.arrivalDate || startDate,
            departureDate: s.departureDate || endDate,
            accommodationName: s.accommodationName || 'Central Hotel',
            accommodationCostPerNight: s.accommodationCostPerNight || 0,
            transportCostToStop: s.transportCostToStop || 0,
            transportMode: s.transportMode || 'flight',
            notes: s.notes || '',
          });
          await newStop.save();
        }
      }

      const populated = await getPopulatedTrip(trip._id);

      res.status(201).json({
        success: true,
        trip: populated,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateTrip(req, res, next) {
    try {
      const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Trip not found or unauthorized access.',
        });
      }

      const updates = req.body;
      if (updates.title && !updates.name) updates.name = updates.title;
      if (updates.coverImageUrl && !updates.coverPhotoUrl) updates.coverPhotoUrl = updates.coverImageUrl;

      Object.assign(trip, updates);
      await trip.save();

      const populated = await getPopulatedTrip(trip._id);

      res.status(200).json({
        success: true,
        trip: populated,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteTrip(req, res, next) {
    try {
      const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Trip not found or unauthorized access.',
        });
      }

      await Stop.deleteMany({ tripId: trip._id });
      await ItineraryItem.deleteMany({ tripId: trip._id });
      await Trip.deleteOne({ _id: trip._id });

      res.status(200).json({
        success: true,
        message: 'Trip and associated stops/items deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  },

  async shareTrip(req, res, next) {
    try {
      const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Trip not found or unauthorized access.',
        });
      }

      if (!trip.shareId) {
        trip.shareId = generateShareId('pass');
      }
      trip.isPublic = true;
      await trip.save();

      res.status(200).json({
        success: true,
        shareId: trip.shareId,
        isPublic: trip.isPublic,
        shareUrl: `/share/${trip.shareId}`,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = tripController;
