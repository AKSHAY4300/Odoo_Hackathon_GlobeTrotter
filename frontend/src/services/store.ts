import citiesSeed from '../mocks/cities.json';
import activitiesSeed from '../mocks/activities.json';
import tripsSeed from '../mocks/trips.json';
import usersSeed from '../mocks/users.json';
import { City, Activity, Trip, User } from '../lib/types';

const STORAGE_KEY = 'globetrotter_mock_db_v1';

export interface MockDatabase {
  cities: City[];
  activities: Activity[];
  trips: Trip[];
  users: User[];
  currentUserId: string;
}

function loadInitialData(): MockDatabase {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.trips && parsed.cities && parsed.users) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse saved database from localStorage, resetting to seed data.', err);
  }

  const initialData: MockDatabase = {
    cities: citiesSeed as City[],
    activities: activitiesSeed as Activity[],
    trips: tripsSeed as Trip[],
    users: usersSeed as User[],
    currentUserId: 'usr-alex-901',
  };

  saveData(initialData);
  return initialData;
}

function saveData(data: MockDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to persist mock database to localStorage', err);
  }
}

// In-memory singleton db instance
let db: MockDatabase = loadInitialData();

export const mockStore = {
  getDB(): MockDatabase {
    return JSON.parse(JSON.stringify(db)); // Cloned snapshot
  },

  updateDB(updater: (current: MockDatabase) => MockDatabase): MockDatabase {
    db = updater(db);
    saveData(db);
    return JSON.parse(JSON.stringify(db));
  },

  reset(): MockDatabase {
    db = {
      cities: JSON.parse(JSON.stringify(citiesSeed)) as City[],
      activities: JSON.parse(JSON.stringify(activitiesSeed)) as Activity[],
      trips: JSON.parse(JSON.stringify(tripsSeed)) as Trip[],
      users: JSON.parse(JSON.stringify(usersSeed)) as User[],
      currentUserId: 'usr-alex-901',
    };
    saveData(db);
    return db;
  }
};

// Simulate realistic REST network delay
export function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
