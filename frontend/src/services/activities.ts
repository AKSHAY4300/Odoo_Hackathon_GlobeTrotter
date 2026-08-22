import { Activity } from '../lib/types';
import { mockStore, delay } from './store';

export const activitiesService = {
  async getActivities(): Promise<Activity[]> {
    await delay(200);
    const db = mockStore.getDB();
    return db.activities;
  },

  async getActivityById(id: string): Promise<Activity | null> {
    await delay(150);
    const db = mockStore.getDB();
    return db.activities.find((a) => a.id === id) || null;
  },

  async getActivitiesByCity(cityId: string): Promise<Activity[]> {
    await delay(200);
    const db = mockStore.getDB();
    return db.activities.filter((a) => a.cityId === cityId);
  },

  async searchActivities(
    query = '', 
    category = 'all', 
    cityId?: string, 
    maxCost = 500
  ): Promise<Activity[]> {
    await delay(200);
    const db = mockStore.getDB();
    return db.activities.filter((act) => {
      const matchesQuery = 
        act.name.toLowerCase().includes(query.toLowerCase()) ||
        act.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = category === 'all' || act.category === category;
      const matchesCity = !cityId || cityId === 'all' || act.cityId === cityId;
      const matchesCost = act.cost <= maxCost;

      return matchesQuery && matchesCategory && matchesCity && matchesCost;
    });
  },
};
