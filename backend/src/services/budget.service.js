const Trip = require('../models/Trip');
const Stop = require('../models/Stop');
const ItineraryItem = require('../models/ItineraryItem');

function getDaysInRange(startDateStr, endDateStr) {
  const dates = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return [startDateStr];
  }

  const curr = new Date(start);
  while (curr <= end) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setDate(curr.getDate() + 1);
  }

  return dates.length > 0 ? dates : [startDateStr];
}

async function calculateTripBudget(tripId) {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  const stops = await Stop.find({ tripId }).sort({ order: 1 });
  const items = await ItineraryItem.find({ tripId }).populate('activityId');

  const days = getDaysInRange(trip.startDate, trip.endDate);
  let totalAccommodation = 0;
  let totalTransport = 0;
  let totalActivities = 0;

  const dayMap = new Map();
  days.forEach((dayStr) => {
    dayMap.set(dayStr, {
      cityName: 'In Transit',
      accommodationCost: 0,
      transportCost: 0,
      activitiesCost: 0,
      mealsAndIncidentalsCost: 45,
      activitiesList: [],
    });
  });

  stops.forEach((stop) => {
    const stopDays = getDaysInRange(stop.arrivalDate, stop.departureDate);
    const nights = Math.max(1, stopDays.length - 1);
    const perNightCost = stop.accommodationCostPerNight || 0;
    const totalStopAccom = perNightCost * nights;
    totalAccommodation += totalStopAccom;

    const dailyAccomPortion = totalStopAccom / (stopDays.length || 1);
    stopDays.forEach((d) => {
      if (dayMap.has(d)) {
        const entry = dayMap.get(d);
        entry.cityName = stop.cityName;
        entry.accommodationCost += dailyAccomPortion;
      }
    });

    if (stop.transportCostToStop) {
      totalTransport += stop.transportCostToStop;
      if (dayMap.has(stop.arrivalDate)) {
        const entry = dayMap.get(stop.arrivalDate);
        entry.transportCost += stop.transportCostToStop;
      }
    }
  });

  items.forEach((item) => {
    const activityCost =
      item.costOverride !== null && item.costOverride !== undefined
        ? item.costOverride
        : item.activityId?.cost || 0;

    totalActivities += activityCost;

    if (dayMap.has(item.scheduledDate)) {
      const entry = dayMap.get(item.scheduledDate);
      entry.activitiesCost += activityCost;
      entry.activitiesList.push({
        itemId: item._id,
        title: item.title || item.activityId?.name || 'Experience',
        cost: activityCost,
        category: item.category || item.activityId?.category || 'culture',
      });
    }
  });

  const totalMealsAndIncidentals = days.length * 45;
  const totalEstimated = Math.round(
    totalAccommodation + totalTransport + totalActivities + totalMealsAndIncidentals
  );

  const dailyThreshold = trip.dailySpendThreshold || 250;

  const dailySpends = days.map((dateStr, index) => {
    const entry = dayMap.get(dateStr);
    const totalDayCost = Math.round(
      entry.accommodationCost +
        entry.transportCost +
        entry.activitiesCost +
        entry.mealsAndIncidentalsCost
    );

    const isOverThreshold = totalDayCost > dailyThreshold;

    return {
      date: dateStr,
      dayNumber: index + 1,
      cityName: entry.cityName,
      accommodationCost: Math.round(entry.accommodationCost),
      transportCost: Math.round(entry.transportCost),
      activitiesCost: Math.round(entry.activitiesCost),
      mealsAndIncidentalsCost: Math.round(entry.mealsAndIncidentalsCost),
      totalDayCost,
      isOverThreshold,
      activitiesList: entry.activitiesList,
    };
  });

  const overBudgetDays = dailySpends.filter((d) => d.isOverThreshold);

  const categoryBreakdown = [
    {
      name: 'Accommodations',
      amount: Math.round(totalAccommodation),
      color: '#14213D',
      percentage: totalEstimated > 0 ? Math.round((totalAccommodation / totalEstimated) * 100) : 0,
    },
    {
      name: 'Activities & Tours',
      amount: Math.round(totalActivities),
      color: '#F4A300',
      percentage: totalEstimated > 0 ? Math.round((totalActivities / totalEstimated) * 100) : 0,
    },
    {
      name: 'Flights & Transit',
      amount: Math.round(totalTransport),
      color: '#0F8B8D',
      percentage: totalEstimated > 0 ? Math.round((totalTransport / totalEstimated) * 100) : 0,
    },
    {
      name: 'Meals & Sundries',
      amount: Math.round(totalMealsAndIncidentals),
      color: '#6B7280',
      percentage: totalEstimated > 0 ? Math.round((totalMealsAndIncidentals / totalEstimated) * 100) : 0,
    },
  ];

  return {
    tripId: trip._id,
    totalEstimated,
    targetBudget: trip.targetBudget || 2500,
    dailySpendThreshold: dailyThreshold,
    totalAccommodation: Math.round(totalAccommodation),
    totalTransport: Math.round(totalTransport),
    totalActivities: Math.round(totalActivities),
    totalMealsAndIncidentals: Math.round(totalMealsAndIncidentals),
    categoryBreakdown,
    dailySpends,
    overBudgetDays,
  };
}

module.exports = {
  calculateTripBudget,
  getDaysInRange,
};
