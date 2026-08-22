import { Activity } from '../lib/types';
import { apiClient } from './apiClient';

export const activitiesService = {
  async getActivities(): Promise<Activity[]> {
    const res = await apiClient.get<{ success: boolean; count: number; activities: Activity[] }>('/activities');
    return res.activities || [];
  },

  async getActivityById(id: string): Promise<Activity | null> {
    try {
      const res = await apiClient.get<{ success: boolean; activity: Activity }>(`/activities/${id}`);
      return res.activity || null;
    } catch {
      return null;
    }
  },

  async getActivitiesByCity(cityId: string): Promise<Activity[]> {
    const res = await apiClient.get<{ success: boolean; count: number; activities: Activity[] }>(
      `/cities/${cityId}/activities`
    );
    return res.activities || [];
  },

  async searchActivities(
    query = '', 
    category = 'all', 
    cityId?: string, 
    maxCost = 500
  ): Promise<Activity[]> {
    const params: Record<string, any> = {};
    if (query) params.search = query;
    if (category && category !== 'all') params.category = category;
    if (cityId && cityId !== 'all') params.cityId = cityId;
    if (maxCost) params.maxCost = maxCost;

    const res = await apiClient.get<{ success: boolean; count: number; activities: Activity[] }>('/activities', {
      params,
    });
    return res.activities || [];
  },
};
