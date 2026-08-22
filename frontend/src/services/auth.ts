import { User, UserRole } from '../lib/types';
import { mockStore, delay } from './store';

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    await delay(150);
    const db = mockStore.getDB();
    const user = db.users.find((u) => u.id === db.currentUserId);
    return user || null;
  },

  async login(email: string, _password: string): Promise<User> {
    await delay(300);
    const db = mockStore.getDB();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        email: email.toLowerCase(),
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
        role: 'traveler',
        preferredCurrency: 'USD',
        language: 'English (US)',
        bio: 'New explorer ready to stamp the passport.',
        savedCityIds: ['city-paris', 'city-tokyo'],
        createdAt: new Date().toISOString(),
      };

      mockStore.updateDB((current) => ({
        ...current,
        users: [...current.users, newUser],
        currentUserId: newUser.id,
      }));

      return newUser;
    }

    mockStore.updateDB((current) => ({
      ...current,
      currentUserId: user.id,
    }));

    return user;
  },

  async signup(name: string, email: string, _password: string): Promise<User> {
    await delay(350);
    const db = mockStore.getDB();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      mockStore.updateDB((current) => ({ ...current, currentUserId: existing.id }));
      return existing;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'traveler',
      preferredCurrency: 'USD',
      language: 'English (US)',
      bio: 'Travel enthusiast exploring the globe.',
      savedCityIds: ['city-paris', 'city-tokyo'],
      createdAt: new Date().toISOString(),
    };

    mockStore.updateDB((current) => ({
      ...current,
      users: [...current.users, newUser],
      currentUserId: newUser.id,
    }));

    return newUser;
  },

  async logout(): Promise<void> {
    await delay(150);
  },

  async updateProfile(updates: Partial<Pick<User, 'name' | 'email' | 'avatar' | 'preferredCurrency' | 'language' | 'bio'>>): Promise<User> {
    await delay(250);
    const db = mockStore.getDB();
    const userIndex = db.users.findIndex((u) => u.id === db.currentUserId);
    if (userIndex === -1) throw new Error('User not found');

    const updatedUser: User = {
      ...db.users[userIndex],
      ...updates,
    };

    mockStore.updateDB((current) => {
      const newUsers = [...current.users];
      newUsers[userIndex] = updatedUser;
      return {
        ...current,
        users: newUsers,
      };
    });

    return updatedUser;
  },

  async toggleSavedCity(cityId: string): Promise<string[]> {
    await delay(150);
    const db = mockStore.getDB();
    const user = db.users.find((u) => u.id === db.currentUserId);
    if (!user) throw new Error('User not found');

    const isSaved = user.savedCityIds.includes(cityId);
    const newSaved = isSaved
      ? user.savedCityIds.filter((id) => id !== cityId)
      : [...user.savedCityIds, cityId];

    mockStore.updateDB((current) => ({
      ...current,
      users: current.users.map((u) => (u.id === user.id ? { ...u, savedCityIds: newSaved } : u)),
    }));

    return newSaved;
  },

  async switchRole(role: UserRole): Promise<User> {
    await delay(100);
    const db = mockStore.getDB();
    const user = db.users.find((u) => u.id === db.currentUserId);
    if (!user) throw new Error('User not found');

    const updatedUser = { ...user, role };
    mockStore.updateDB((current) => ({
      ...current,
      users: current.users.map((u) => (u.id === user.id ? updatedUser : u)),
    }));

    return updatedUser;
  },
};
