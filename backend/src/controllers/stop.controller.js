const Stop = require('../models/Stop');
const Trip = require('../models/Trip');
const City = require('../models/City');
const ItineraryItem = require('../models/ItineraryItem');
const { getPopulatedTrip } = require('../services/trip.service');

const stopController = {
  async addStop(req, res, next) {
    try {
      const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Trip not found or unauthorized access.',
        });
      }

      const {
        cityId,
        cityName,
        country,
        arrivalDate,
        departureDate,
        accommodationName,
        accommodationCostPerNight,
        transportCostToStop,
        transportMode,
        notes,
      } = req.body;

      let resolvedCityId = cityId;
      let resolvedCityName = cityName;
      let resolvedCountry = country;

      // Handle customId or ObjectId lookup
      if (cityId) {
        let city = null;
        try {
          city = await City.findById(cityId);
        } catch {
          // not a valid ObjectId, search customId
          city = await City.findOne({ customId: cityId });
        }
        if (!city) {
          city = await City.findOne({ customId: cityId });
        }
        if (city) {
          resolvedCityId = city._id;
          resolvedCityName = resolvedCityName || city.name;
          resolvedCountry = resolvedCountry || city.country;
        }
      }

      const existingCount = await Stop.countDocuments({ tripId: trip._id });

      const stop = new Stop({
        tripId: trip._id,
        cityId: resolvedCityId,
        cityName: resolvedCityName || 'City Stop',
        country: resolvedCountry || '',
        order: existingCount,
        arrivalDate: arrivalDate || trip.startDate,
        departureDate: departureDate || trip.endDate,
        accommodationName: accommodationName || 'Central Boutique Hotel',
        accommodationCostPerNight: accommodationCostPerNight || 0,
        transportCostToStop: transportCostToStop || 0,
        transportMode: transportMode || 'flight',
        notes: notes || '',
      });

      await stop.save();
      const updatedTrip = await getPopulatedTrip(trip._id);

      res.status(201).json({
        success: true,
        stop,
        trip: updatedTrip,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateStop(req, res, next) {
    try {
      const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Trip not found or unauthorized access.',
        });
      }

      const stop = await Stop.findOneAndUpdate(
        { _id: req.params.stopId, tripId: trip._id },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!stop) {
        return res.status(404).json({
          success: false,
          error: 'Stop not found in this trip.',
        });
      }

      const updatedTrip = await getPopulatedTrip(trip._id);

      res.status(200).json({
        success: true,
        stop,
        trip: updatedTrip,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteStop(req, res, next) {
    try {
      const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Trip not found or unauthorized access.',
        });
      }

      const stop = await Stop.findOneAndDelete({ _id: req.params.stopId, tripId: trip._id });
      if (!stop) {
        return res.status(404).json({
          success: false,
          error: 'Stop not found in this trip.',
        });
      }

      // Cascade delete items in this stop
      await ItineraryItem.deleteMany({ stopId: stop._id });

      const updatedTrip = await getPopulatedTrip(trip._id);

      res.status(200).json({
        success: true,
        message: 'Stop and its activities removed.',
        trip: updatedTrip,
      });
    } catch (err) {
      next(err);
    }
  },

  async reorderStops(req, res, next) {
    try {
      const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
      if (!trip) {
        return res.status(404).json({
          success: false,
          error: 'Trip not found or unauthorized access.',
        });
      }

      const { stopIds } = req.body;
      const orderList = Array.isArray(stopIds) ? stopIds : (Array.isArray(req.body) ? req.body : []);

      if (orderList.length > 0) {
        const updatePromises = orderList.map((stopId, index) =>
          Stop.updateOne({ _id: stopId, tripId: trip._id }, { $set: { order: index } })
        );
        await Promise.all(updatePromises);
      }

      const updatedTrip = await getPopulatedTrip(trip._id);

      res.status(200).json({
        success: true,
        message: 'Stops reordered successfully.',
        trip: updatedTrip,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = stopController;
