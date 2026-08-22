const Trip = require('../models/Trip');
const Stop = require('../models/Stop');
const ItineraryItem = require('../models/ItineraryItem');
const { generateShareId } = require('./share.service');

async function getPopulatedTrip(tripId, userId = null) {
  const query = { _id: tripId };
  if (userId) {
    query.userId = userId;
  }

  const trip = await Trip.findOne(query);
  if (!trip) {
    return null;
  }

  const stops = await Stop.find({ tripId: trip._id })
    .populate('cityId')
    .sort({ order: 1 });

  const items = await ItineraryItem.find({ tripId: trip._id })
    .populate('activityId');

  // Nest activities inside respective stops for frontend compatibility
  const stopsWithActivities = stops.map((stop) => {
    const stopObj = stop.toJSON();
    const stopItems = items.filter((item) => String(item.stopId) === String(stop._id));

    stopObj.activities = stopItems.map((item) => {
      const itemObj = item.toJSON();
      const activityData = item.activityId ? item.activityId.toJSON() : null;
      return {
        id: itemObj._id,
        _id: itemObj._id,
        activityId: activityData ? (activityData.customId || activityData._id) : null,
        title: item.title || (activityData ? activityData.name : 'Activity'),
        category: item.category || (activityData ? activityData.category : 'culture'),
        cost: item.costOverride !== null && item.costOverride !== undefined ? item.costOverride : (activityData ? activityData.cost : 0),
        durationMinutes: item.durationMinutes || (activityData ? activityData.durationMinutes : 60),
        scheduledDate: item.scheduledDate,
        startTime: item.scheduledTime,
        notes: item.notes,
        location: item.location || stop.cityName,
      };
    });

    return stopObj;
  });

  const tripObj = trip.toJSON();
  tripObj.stops = stopsWithActivities;

  return tripObj;
}

async function cloneTrip(shareId, targetUserId) {
  const originalTrip = await Trip.findOne({ shareId, isPublic: true });
  if (!originalTrip) {
    throw new Error('Public trip not found or pass code is private/invalid');
  }

  const newTrip = new Trip({
    userId: targetUserId,
    name: `${originalTrip.name} (Copy)`,
    title: `${originalTrip.title || originalTrip.name} (Copy)`,
    description: originalTrip.description,
    coverPhotoUrl: originalTrip.coverPhotoUrl,
    startDate: originalTrip.startDate,
    endDate: originalTrip.endDate,
    targetBudget: originalTrip.targetBudget,
    dailySpendThreshold: originalTrip.dailySpendThreshold,
    isPublic: false,
    shareId: generateShareId('pass'),
    status: 'draft',
  });

  await newTrip.save();

  const originalStops = await Stop.find({ tripId: originalTrip._id }).sort({ order: 1 });
  const stopIdMap = new Map();

  for (const stop of originalStops) {
    const newStop = new Stop({
      tripId: newTrip._id,
      cityId: stop.cityId,
      cityName: stop.cityName,
      country: stop.country,
      order: stop.order,
      arrivalDate: stop.arrivalDate,
      departureDate: stop.departureDate,
      accommodationName: stop.accommodationName,
      accommodationCostPerNight: stop.accommodationCostPerNight,
      transportCostToStop: stop.transportCostToStop,
      transportMode: stop.transportMode,
      notes: stop.notes,
    });
    await newStop.save();
    stopIdMap.set(String(stop._id), newStop._id);
  }

  const originalItems = await ItineraryItem.find({ tripId: originalTrip._id });
  for (const item of originalItems) {
    const newStopId = stopIdMap.get(String(item.stopId));
    if (newStopId) {
      const newItem = new ItineraryItem({
        tripId: newTrip._id,
        stopId: newStopId,
        activityId: item.activityId,
        title: item.title,
        category: item.category,
        scheduledDate: item.scheduledDate,
        scheduledTime: item.scheduledTime,
        durationMinutes: item.durationMinutes,
        costOverride: item.costOverride,
        notes: item.notes,
        location: item.location,
      });
      await newItem.save();
    }
  }

  return getPopulatedTrip(newTrip._id);
}

module.exports = {
  getPopulatedTrip,
  cloneTrip,
};
