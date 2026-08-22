import { create } from 'zustand';
import { User, UserRole } from '../lib/types';
import { authService } from '../services';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  login: (email: string, password?: string) => Promise<User>;
  signup: (name: string, email: string, password?: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  toggleSavedCity: (cityId: string) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: !!user, isLoading: false });
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password = 'password123') => {
    set({ isLoading: true });
    try {
      const user = await authService.login(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (name: string, email: string, password = 'password123') => {
    set({ isLoading: true });
    try {
      const user = await authService.signup(name, email, password);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (data: Partial<User>) => {
    const updated = await authService.updateProfile(data);
    set({ user: updated });
  },

  toggleSavedCity: async (cityId: string) => {
    const saved = await authService.toggleSavedCity(cityId);
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, savedCityIds: saved } });
    }
  },

  switchRole: async (role: UserRole) => {
    const updated = await authService.switchRole(role);
    set({ user: updated });
  },
}));
