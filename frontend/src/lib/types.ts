export type ActivityCategory = 
  | 'culture' 
  | 'food' 
  | 'adventure' 
  | 'sightseeing' 
  | 'transport' 
  | 'relaxation';

export type TransportMode = 'flight' | 'train' | 'car' | 'ferry' | 'bus';

export type TripStatus = 'draft' | 'upcoming' | 'in_progress' | 'completed';

export type UserRole = 'traveler' | 'admin';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR' | 'AUD';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  preferredCurrency: CurrencyCode;
  language: string;
  bio: string;
  savedCityIds: string[];
  createdAt: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  region: 'Europe' | 'Asia' | 'Americas' | 'Africa' | 'Oceania' | 'Middle East';
  costIndex: 1 | 2 | 3 | 4; // 1 = $, 2 = $$, 3 = $$$, 4 = $$$$
  popularityScore: number; // 0 to 100
  imageUrl: string;
  description: string;
  timezone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  highlights: string[];
  bestTimeToVisit: string;
}

export interface Activity {
  id: string;
  cityId: string;
  name: string;
  category: ActivityCategory;
  cost: number;
  durationMinutes: number;
  description: string;
  imageUrl: string;
  rating: number;
  recommendedTime: 'Morning' | 'Afternoon' | 'Evening' | 'Anytime';
}

export interface StopActivity {
  id: string;
  activityId?: string;
  title: string;
  category: ActivityCategory;
  cost: number;
  durationMinutes: number;
  scheduledDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  notes?: string;
  location?: string;
}

export interface Stop {
  id: string;
  cityId: string;
  cityName: string;
  country: string;
  arrivalDate: string; // YYYY-MM-DD
  departureDate: string; // YYYY-MM-DD
  accommodationName?: string;
  accommodationCostPerNight?: number;
  transportCostToStop?: number;
  transportMode?: TransportMode;
  notes?: string;
  activities: StopActivity[];
  order: number;
}

export interface Trip {
  id: string;
  shareId: string;
  userId: string;
  title: string;
  description: string;
  coverImageUrl: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  stops: Stop[];
  targetBudget: number;
  dailySpendThreshold: number;
  status: TripStatus;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailySpend {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  cityName: string;
  accommodationCost: number;
  transportCost: number;
  activitiesCost: number;
  mealsAndIncidentalsCost: number;
  totalDayCost: number;
  isOverThreshold: boolean;
  activitiesList: { title: string; cost: number; category: ActivityCategory }[];
}

export interface BudgetBreakdown {
  totalEstimated: number;
  targetBudget: number;
  dailySpendThreshold: number;
  totalAccommodation: number;
  totalTransport: number;
  totalActivities: number;
  totalMealsAndIncidentals: number;
  categoryBreakdown: {
    name: string;
    amount: number;
    color: string;
    percentage: number;
  }[];
  dailySpends: DailySpend[];
  overBudgetDays: DailySpend[];
}

export interface AdminStats {
  totalTrips: number;
  activeTravelers: number;
  totalBudgetVolume: number;
  avgTripDurationDays: number;
  tripsOverTime: {
    month: string;
    count: number;
    budget: number;
  }[];
  topCities: {
    cityId: string;
    name: string;
    country: string;
    visitCount: number;
    popularity: number;
    imageUrl: string;
  }[];
  topActivities: {
    activityId: string;
    name: string;
    category: ActivityCategory;
    bookingCount: number;
    avgCost: number;
  }[];
}
