import { create } from 'zustand';

interface TripDraftState {
  activeTripId: string | null;
  targetStopId: string | null;
  targetDate: string | null;
  isCityDrawerOpen: boolean;
  isActivityDrawerOpen: boolean;

  setActiveTripId: (id: string | null) => void;
  openCityDrawer: () => void;
  closeCityDrawer: () => void;
  openActivityDrawer: (stopId: string, scheduledDate?: string) => void;
  closeActivityDrawer: () => void;
}

export const useTripDraftStore = create<TripDraftState>((set) => ({
  activeTripId: null,
  targetStopId: null,
  targetDate: null,
  isCityDrawerOpen: false,
  isActivityDrawerOpen: false,

  setActiveTripId: (id) => set({ activeTripId: id }),
  openCityDrawer: () => set({ isCityDrawerOpen: true }),
  closeCityDrawer: () => set({ isCityDrawerOpen: false }),
  openActivityDrawer: (stopId, scheduledDate) => 
    set({ 
      isActivityDrawerOpen: true, 
      targetStopId: stopId, 
      targetDate: scheduledDate || null 
    }),
  closeActivityDrawer: () => 
    set({ 
      isActivityDrawerOpen: false, 
      targetStopId: null, 
      targetDate: null 
    }),
}));
