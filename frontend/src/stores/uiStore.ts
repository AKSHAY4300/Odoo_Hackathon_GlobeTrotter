import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface UIState {
  toasts: ToastMessage[];
  showToast: (title: string, description?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  
  shareModalTripId: string | null;
  openShareModal: (tripId: string) => void;
  closeShareModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  showToast: (title, description, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, title, description, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  shareModalTripId: null,
  openShareModal: (tripId) => set({ shareModalTripId: tripId }),
  closeShareModal: () => set({ shareModalTripId: null }),
}));
