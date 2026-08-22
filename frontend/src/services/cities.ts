import { City } from '../lib/types';
import { mockStore, delay } from './store';

export const citiesService = {
  async getCities(): Promise<City[]> {
    await delay(200);
    const db = mockStore.getDB();
    return db.cities;
  },

  async getCityById(id: string): Promise<City | null> {
    await delay(150);
    const db = mockStore.getDB();
    return db.cities.find((c) => c.id === id) || null;
  },

  async searchCities(query = '', region = 'All', maxCostIndex = 4): Promise<City[]> {
    await delay(200);
    const db = mockStore.getDB();
    return db.cities.filter((city) => {
      const matchesQuery = 
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.country.toLowerCase().includes(query.toLowerCase()) ||
        city.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesRegion = region === 'All' || city.region === region;
      const matchesCost = city.costIndex <= maxCostIndex;

      return matchesQuery && matchesRegion && matchesCost;
    });
  },
};
