import { Trip, Stop, StopActivity } from '../lib/types';
import { apiClient } from './apiClient';

export const tripsService = {
  async getTrips(): Promise<Trip[]> {
    const res = await apiClient.get<{ success: boolean; count: number; trips: Trip[] }>('/trips');
    return res.trips || [];
  },

  async getTripById(id: string): Promise<Trip | null> {
    try {
      const res = await apiClient.get<{ success: boolean; trip: Trip }>(`/trips/${id}`);
      return res.trip || null;
    } catch {
      return null;
    }
  },

  async createTrip(tripData: Partial<Trip> & { name?: string; coverPhotoUrl?: string }): Promise<Trip> {
    const payload = {
      title: tripData.title || tripData.name,
      name: tripData.name || tripData.title,
      description: tripData.description,
      coverImageUrl: tripData.coverImageUrl || tripData.coverPhotoUrl,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      targetBudget: tripData.targetBudget,
      dailySpendThreshold: tripData.dailySpendThreshold,
      stops: tripData.stops || [],
    };

    const res = await apiClient.post<{ success: boolean; trip: Trip }>('/trips', payload);
    return res.trip;
  },

  async updateTrip(id: string, updates: Partial<Trip> & { name?: string; coverPhotoUrl?: string }): Promise<Trip> {
    const res = await apiClient.put<{ success: boolean; trip: Trip }>(`/trips/${id}`, updates);
    return res.trip;
  },

  async deleteTrip(id: string): Promise<void> {
    await apiClient.delete(`/trips/${id}`);
  },

  async shareTrip(id: string): Promise<{ shareId: string; shareUrl: string }> {
    const res = await apiClient.post<{ success: boolean; shareId: string; isPublic: boolean; shareUrl: string }>(
      `/trips/${id}/share`
    );
    return {
      shareId: res.shareId,
      shareUrl: res.shareUrl || `/share/${res.shareId}`,
    };
  },

  async addStop(tripId: string, stopData: Partial<Stop>): Promise<Trip> {
    const res = await apiClient.post<{ success: boolean; stop: Stop; trip: Trip }>(
      `/trips/${tripId}/stops`,
      stopData
    );
    return res.trip || (await this.getTripById(tripId))!;
  },

  async updateStop(tripId: string, stopId: string, updates: Partial<Stop>): Promise<Trip> {
    const res = await apiClient.put<{ success: boolean; stop: Stop; trip: Trip }>(
      `/trips/${tripId}/stops/${stopId}`,
      updates
    );
    return res.trip || (await this.getTripById(tripId))!;
  },

  async deleteStop(tripId: string, stopId: string): Promise<Trip> {
    const res = await apiClient.delete<{ success: boolean; trip: Trip }>(
      `/trips/${tripId}/stops/${stopId}`
    );
    return res.trip || (await this.getTripById(tripId))!;
  },

  async reorderStops(tripId: string, stopIds: string[]): Promise<Trip> {
    const res = await apiClient.put<{ success: boolean; trip: Trip }>(
      `/trips/${tripId}/stops/reorder`,
      { stopIds }
    );
    return res.trip || (await this.getTripById(tripId))!;
  },

  async addActivityToStop(
    tripId: string,
    stopId: string,
    activityData: Partial<StopActivity>
  ): Promise<Trip> {
    const payload = {
      stopId,
      activityId: activityData.activityId,
      title: activityData.title,
      category: activityData.category,
      scheduledDate: activityData.scheduledDate,
      scheduledTime: activityData.startTime,
      durationMinutes: activityData.durationMinutes,
      costOverride: activityData.cost,
      cost: activityData.cost,
      notes: activityData.notes,
      location: activityData.location,
    };

    const res = await apiClient.post<{ success: boolean; item: any; trip: Trip }>(
      `/trips/${tripId}/items`,
      payload
    );
    return res.trip || (await this.getTripById(tripId))!;
  },

  async updateActivityInStop(
    tripId: string,
    _stopId: string,
    activityId: string,
    updates: Partial<StopActivity>
  ): Promise<Trip> {
    const payload = {
      title: updates.title,
      category: updates.category,
      scheduledDate: updates.scheduledDate,
      scheduledTime: updates.startTime,
      durationMinutes: updates.durationMinutes,
      costOverride: updates.cost,
      notes: updates.notes,
      location: updates.location,
    };

    const res = await apiClient.put<{ success: boolean; item: any; trip: Trip }>(
      `/trips/${tripId}/items/${activityId}`,
      payload
    );
    return res.trip || (await this.getTripById(tripId))!;
  },

  async removeActivityFromStop(
    tripId: string,
    _stopId: string,
    activityId: string
  ): Promise<Trip> {
    const res = await apiClient.delete<{ success: boolean; trip: Trip }>(
      `/trips/${tripId}/items/${activityId}`
    );
    return res.trip || (await this.getTripById(tripId))!;
  },

  async reorderActivitiesInDay(
    tripId: string,
    _date: string,
    activityIds: string[]
  ): Promise<Trip> {
    for (let i = 0; i < activityIds.length; i++) {
      const actId = activityIds[i];
      const hour = 9 + i * 2;
      const timeStr = `${String(hour).padStart(2, '0')}:00`;
      await apiClient.put(`/trips/${tripId}/items/${actId}`, {
        scheduledTime: timeStr,
      });
    }

    return (await this.getTripById(tripId))!;
  },

  async getTripByShareId(shareId: string): Promise<Trip | null> {
    try {
      const res = await apiClient.get<{ success: boolean; trip: Trip }>(
        `/public/trips/${shareId}`,
        { skipAuth: true }
      );
      return res.trip || null;
    } catch {
      return null;
    }
  },

  async cloneSharedTrip(shareId: string): Promise<Trip> {
    const res = await apiClient.post<{ success: boolean; message: string; trip: Trip }>(
      `/public/trips/${shareId}/clone`
    );
    return res.trip;
  },
};
