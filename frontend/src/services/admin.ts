import { AdminStats } from '../lib/types';
import { mockStore, delay } from './store';

export const adminService = {
  async getAdminStats(): Promise<AdminStats> {
    await delay(300);
    const db = mockStore.getDB();

    const totalTrips = db.trips.length;
    const activeTravelers = db.users.length;
    const totalBudgetVolume = db.trips.reduce((acc, t) => acc + (t.targetBudget || 0), 0);

    // Calculate city frequency
    const cityCountMap = new Map<string, number>();
    db.trips.forEach((t) => {
      t.stops.forEach((s) => {
        cityCountMap.set(s.cityId, (cityCountMap.get(s.cityId) || 0) + 1);
      });
    });

    const topCities = db.cities
      .map((c) => ({
        cityId: c.id,
        name: c.name,
        country: c.country,
        visitCount: (cityCountMap.get(c.id) || 0) + Math.floor(c.popularityScore / 10),
        popularity: c.popularityScore,
        imageUrl: c.imageUrl,
      }))
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 5);

    // Calculate activity popularity
    const topActivities = db.activities.slice(0, 6).map((a, i) => ({
      activityId: a.id,
      name: a.name,
      category: a.category,
      bookingCount: 42 - i * 5,
      avgCost: a.cost,
    }));

    return {
      totalTrips,
      activeTravelers,
      totalBudgetVolume,
      avgTripDurationDays: 8.5,
      tripsOverTime: [
        { month: 'Apr', count: 18, budget: 45000 },
        { month: 'May', count: 26, budget: 68000 },
        { month: 'Jun', count: 42, budget: 112000 },
        { month: 'Jul', count: 58, budget: 154000 },
        { month: 'Aug', count: 74, budget: 198000 },
        { month: 'Sep', count: 91, budget: 242000 },
      ],
      topCities,
      topActivities,
    };
  },
};
