import { City } from '../lib/types';
import { apiClient } from './apiClient';

export const citiesService = {
  async getCities(): Promise<City[]> {
    const res = await apiClient.get<{ success: boolean; count: number; cities: City[] }>('/cities');
    return res.cities || [];
  },

  async getCityById(id: string): Promise<City | null> {
    try {
      const res = await apiClient.get<{ success: boolean; city: City }>(`/cities/${id}`);
      return res.city || null;
    } catch {
      return null;
    }
  },

  async searchCities(
    query = '', 
    region = 'All', 
    maxCostIndex = 4
  ): Promise<City[]> {
    const params: Record<string, any> = {};
    if (query) params.search = query;
    if (region && region !== 'All') params.region = region;
    if (maxCostIndex) params.maxCostIndex = maxCostIndex;

    const res = await apiClient.get<{ success: boolean; count: number; cities: City[] }>('/cities', {
      params,
    });
    return res.cities || [];
  },
};
