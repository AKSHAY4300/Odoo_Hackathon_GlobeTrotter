import { Trip, Stop, StopActivity } from '../lib/types';
import { mockStore, delay } from './store';

export const tripsService = {
  async getTrips(): Promise<Trip[]> {
    await delay(250);
    const db = mockStore.getDB();
    return db.trips.filter((t) => t.userId === db.currentUserId);
  },

  async getAllTripsAdmin(): Promise<Trip[]> {
    await delay(200);
    const db = mockStore.getDB();
    return db.trips;
  },

  async getTripById(id: string): Promise<Trip | null> {
    await delay(200);
    const db = mockStore.getDB();
    const trip = db.trips.find((t) => t.id === id);
    return trip ? JSON.parse(JSON.stringify(trip)) : null;
  },

  async getTripByShareId(shareId: string): Promise<Trip | null> {
    await delay(200);
    const db = mockStore.getDB();
    const trip = db.trips.find((t) => t.shareId === shareId);
    return trip ? JSON.parse(JSON.stringify(trip)) : null;
  },

  async createTrip(input: Omit<Trip, 'id' | 'shareId' | 'userId' | 'createdAt' | 'updatedAt' | 'stops' | 'status' | 'isPublic'> & { stops?: Stop[] }): Promise<Trip> {
    await delay(350);
    const db = mockStore.getDB();
    const newTripId = `trp-${Date.now().toString(36)}`;
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const shareId = `pass-${randomCode}`;

    const newTrip: Trip = {
      id: newTripId,
      shareId,
      userId: db.currentUserId,
      title: input.title,
      description: input.description || '',
      coverImageUrl: input.coverImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      startDate: input.startDate,
      endDate: input.endDate,
      targetBudget: input.targetBudget || 2500,
      dailySpendThreshold: input.dailySpendThreshold || 250,
      status: 'upcoming',
      isPublic: true,
      stops: input.stops || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStore.updateDB((current) => ({
      ...current,
      trips: [newTrip, ...current.trips],
    }));

    return newTrip;
  },

  async updateTrip(id: string, updates: Partial<Trip>): Promise<Trip> {
    await delay(250);
    const db = mockStore.getDB();
    const tripIndex = db.trips.findIndex((t) => t.id === id);
    if (tripIndex === -1) throw new Error('Trip not found');

    const updatedTrip: Trip = {
      ...db.trips[tripIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    mockStore.updateDB((current) => {
      const newTrips = [...current.trips];
      newTrips[tripIndex] = updatedTrip;
      return { ...current, trips: newTrips };
    });

    return updatedTrip;
  },

  async deleteTrip(id: string): Promise<void> {
    await delay(200);
    mockStore.updateDB((current) => ({
      ...current,
      trips: current.trips.filter((t) => t.id !== id),
    }));
  },

  async reorderStops(tripId: string, stopIds: string[]): Promise<Trip> {
    await delay(200);
    const db = mockStore.getDB();
    const trip = db.trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');

    const stopMap = new Map(trip.stops.map((s) => [s.id, s]));
    const reorderedStops: Stop[] = [];

    stopIds.forEach((id, index) => {
      const stop = stopMap.get(id);
      if (stop) {
        reorderedStops.push({ ...stop, order: index });
      }
    });

    return this.updateTrip(tripId, { stops: reorderedStops });
  },

  async addStop(tripId: string, stopInput: Omit<Stop, 'id' | 'activities' | 'order'>): Promise<Trip> {
    await delay(250);
    const db = mockStore.getDB();
    const trip = db.trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');

    const newStop: Stop = {
      id: `stp-${Date.now()}`,
      ...stopInput,
      order: trip.stops.length,
      activities: [],
    };

    const newStops = [...trip.stops, newStop];
    return this.updateTrip(tripId, { stops: newStops });
  },

  async updateStop(tripId: string, stopId: string, updates: Partial<Stop>): Promise<Trip> {
    await delay(200);
    const db = mockStore.getDB();
    const trip = db.trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');

    const updatedStops = trip.stops.map((s) => (s.id === stopId ? { ...s, ...updates } : s));
    return this.updateTrip(tripId, { stops: updatedStops });
  },

  async deleteStop(tripId: string, stopId: string): Promise<Trip> {
    await delay(200);
    const db = mockStore.getDB();
    const trip = db.trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');

    const filteredStops = trip.stops
      .filter((s) => s.id !== stopId)
      .map((s, idx) => ({ ...s, order: idx }));

    return this.updateTrip(tripId, { stops: filteredStops });
  },

  async addActivityToStop(tripId: string, stopId: string, activityInput: Omit<StopActivity, 'id'>): Promise<Trip> {
    await delay(250);
    const db = mockStore.getDB();
    const trip = db.trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');

    const newActivity: StopActivity = {
      id: `sact-${Date.now()}`,
      ...activityInput,
    };

    const updatedStops = trip.stops.map((s) => {
      if (s.id === stopId) {
        return {
          ...s,
          activities: [...s.activities, newActivity],
        };
      }
      return s;
    });

    return this.updateTrip(tripId, { stops: updatedStops });
  },

  async updateActivityInStop(
    tripId: string, 
    stopId: string, 
    activityId: string, 
    updates: Partial<StopActivity>
  ): Promise<Trip> {
    await delay(200);
    const db = mockStore.getDB();
    const trip = db.trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');

    const updatedStops = trip.stops.map((s) => {
      if (s.id === stopId) {
        return {
          ...s,
          activities: s.activities.map((a) => (a.id === activityId ? { ...a, ...updates } : a)),
        };
      }
      return s;
    });

    return this.updateTrip(tripId, { stops: updatedStops });
  },

  async removeActivityFromStop(tripId: string, stopId: string, activityId: string): Promise<Trip> {
    await delay(200);
    const db = mockStore.getDB();
    const trip = db.trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');

    const updatedStops = trip.stops.map((s) => {
      if (s.id === stopId) {
        return {
          ...s,
          activities: s.activities.filter((a) => a.id !== activityId),
        };
      }
      return s;
    });

    return this.updateTrip(tripId, { stops: updatedStops });
  },

  async reorderActivitiesInDay(
    tripId: string, 
    targetDate: string, 
    orderedActivityIds: string[]
  ): Promise<Trip> {
    await delay(200);
    const db = mockStore.getDB();
    const trip = db.trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');

    // Gather all activities across stops matching targetDate
    const allMatching: StopActivity[] = [];
    const stopActivityMap = new Map<string, string>(); // activityId -> stopId

    trip.stops.forEach((s) => {
      s.activities.forEach((a) => {
        if (a.scheduledDate === targetDate) {
          allMatching.push(a);
          stopActivityMap.set(a.id, s.id);
        }
      });
    });

    const idToAct = new Map(allMatching.map((a) => [a.id, a]));
    const reorderedInDay = orderedActivityIds.map((id) => idToAct.get(id)).filter(Boolean) as StopActivity[];

    // Reconstruct stops with updated activity order
    const updatedStops = trip.stops.map((s) => {
      const nonDayActs = s.activities.filter((a) => a.scheduledDate !== targetDate);
      const dayActsInThisStop = reorderedInDay.filter((a) => stopActivityMap.get(a.id) === s.id);
      return {
        ...s,
        activities: [...nonDayActs, ...dayActsInThisStop],
      };
    });

    return this.updateTrip(tripId, { stops: updatedStops });
  },

  async cloneSharedTrip(shareId: string): Promise<Trip> {
    await delay(350);
    const db = mockStore.getDB();
    const trip = db.trips.find((t) => t.shareId === shareId);
    if (!trip) throw new Error('Shared trip not found');

    const newTripId = `trp-clone-${Date.now().toString(36)}`;
    const randomCode = Math.floor(10000 + Math.random() * 90000);

    const clonedTrip: Trip = {
      ...JSON.parse(JSON.stringify(trip)),
      id: newTripId,
      shareId: `pass-${randomCode}`,
      userId: db.currentUserId,
      title: `Copy of ${trip.title}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStore.updateDB((current) => ({
      ...current,
      trips: [clonedTrip, ...current.trips],
    }));

    return clonedTrip;
  },
};
