import { User, UserRole } from '../lib/types';
import { apiClient, setStoredToken, clearStoredToken, getStoredToken } from './apiClient';

interface AuthResponse {
  success: boolean;
  token?: string;
  user: User;
  error?: string;
}

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    const token = getStoredToken();
    if (!token) return null;

    try {
      const res = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
      return res.user || null;
    } catch {
      clearStoredToken();
      return null;
    }
  },

  async login(email: string, password = 'password123'): Promise<User> {
    const res = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    if (res.token) {
      setStoredToken(res.token);
    }

    return res.user;
  },

  async signup(name: string, email: string, password = 'password123'): Promise<User> {
    const res = await apiClient.post<AuthResponse>('/auth/signup', {
      name,
      email,
      password,
    });

    if (res.token) {
      setStoredToken(res.token);
    }

    return res.user;
  },

  async logout(): Promise<void> {
    clearStoredToken();
  },

  async updateProfile(updates: Partial<Pick<User, 'name' | 'email' | 'avatar' | 'preferredCurrency' | 'language' | 'bio'>>): Promise<User> {
    const res = await apiClient.put<{ success: boolean; user: User }>('/auth/profile', updates);
    return res.user;
  },

  async toggleSavedCity(cityId: string): Promise<string[]> {
    const res = await apiClient.post<{ success: boolean; savedCityIds: string[] }>('/auth/save-city', {
      cityId,
    });
    return res.savedCityIds || [];
  },

  async switchRole(role: UserRole): Promise<User> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');
    return { ...currentUser, role };
  },
};
