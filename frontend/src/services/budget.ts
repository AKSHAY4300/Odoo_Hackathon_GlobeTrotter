import { Trip, BudgetBreakdown, DailySpend } from '../lib/types';
import { getDaysInRange } from '../lib/dateUtils';
import { delay } from './store';

export const budgetService = {
  async getBudgetBreakdown(trip: Trip): Promise<BudgetBreakdown> {
    await delay(100);
    return this.calculateBudgetSynchronous(trip);
  },

  calculateBudgetSynchronous(trip: Trip): BudgetBreakdown {
    const days = getDaysInRange(trip.startDate, trip.endDate);
    let totalAccommodation = 0;
    let totalTransport = 0;
    let totalActivities = 0;

    const dayMap = new Map<string, {
      cityName: string;
      accommodationCost: number;
      transportCost: number;
      activitiesCost: number;
      mealsAndIncidentalsCost: number;
      activitiesList: { title: string; cost: number; category: any }[];
    }>();

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

    trip.stops.forEach((stop) => {
      const stopDays = getDaysInRange(stop.arrivalDate, stop.departureDate);
      const nights = Math.max(1, stopDays.length - 1);
      const perNightCost = stop.accommodationCostPerNight || 0;
      const totalStopAccom = perNightCost * nights;
      totalAccommodation += totalStopAccom;

      const dailyAccomPortion = totalStopAccom / (stopDays.length || 1);
      stopDays.forEach((d) => {
        if (dayMap.has(d)) {
          const entry = dayMap.get(d)!;
          entry.cityName = stop.cityName;
          entry.accommodationCost += dailyAccomPortion;
        }
      });

      if (stop.transportCostToStop) {
        totalTransport += stop.transportCostToStop;
        if (dayMap.has(stop.arrivalDate)) {
          const entry = dayMap.get(stop.arrivalDate)!;
          entry.transportCost += stop.transportCostToStop;
        }
      }

      stop.activities.forEach((act) => {
        totalActivities += act.cost || 0;
        const targetDay = act.scheduledDate || stop.arrivalDate;
        if (dayMap.has(targetDay)) {
          const entry = dayMap.get(targetDay)!;
          entry.activitiesCost += act.cost || 0;
          entry.activitiesList.push({
            title: act.title,
            cost: act.cost,
            category: act.category,
          });
        }
      });
    });

    const totalMealsAndIncidentals = days.length * 45;
    const totalEstimated = totalAccommodation + totalTransport + totalActivities + totalMealsAndIncidentals;

    const dailySpends: DailySpend[] = days.map((dateStr, index) => {
      const entry = dayMap.get(dateStr)!;
      const totalDayCost = Math.round(
        entry.accommodationCost +
        entry.transportCost +
        entry.activitiesCost +
        entry.mealsAndIncidentalsCost
      );

      const isOverThreshold = totalDayCost > (trip.dailySpendThreshold || 250);

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
      totalEstimated: Math.round(totalEstimated),
      targetBudget: trip.targetBudget || 2500,
      dailySpendThreshold: trip.dailySpendThreshold || 250,
      totalAccommodation: Math.round(totalAccommodation),
      totalTransport: Math.round(totalTransport),
      totalActivities: Math.round(totalActivities),
      totalMealsAndIncidentals: Math.round(totalMealsAndIncidentals),
      categoryBreakdown,
      dailySpends,
      overBudgetDays,
    };
  },
};
