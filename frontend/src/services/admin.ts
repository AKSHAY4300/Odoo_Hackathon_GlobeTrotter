import { AdminStats, User, Trip } from '../lib/types';
import { apiClient } from './apiClient';

export const adminService = {
  async getAdminStats(): Promise<AdminStats> {
    const res = await apiClient.get<{ success: boolean; stats: AdminStats }>('/admin/stats');
    return res.stats;
  },

  async getAllUsers(): Promise<User[]> {
    const res = await apiClient.get<{ success: boolean; count: number; users: User[] }>('/admin/users');
    return res.users || [];
  },

  async getAllTrips(): Promise<Trip[]> {
    const res = await apiClient.get<{ success: boolean; count: number; trips: Trip[] }>('/admin/trips');
    return res.trips || [];
  },
};
