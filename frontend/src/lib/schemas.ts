import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid passport/email address'),
  password: z.string().min(6, 'Security code must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().min(2, 'Traveler name must be at least 2 characters'),
  email: z.string().email('Please enter a valid passport/email address'),
  password: z.string().min(6, 'Security code must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Security codes do not match",
  path: ["confirmPassword"],
});

export type SignupFormData = z.infer<typeof signupSchema>;

export const createTripSchema = z.object({
  title: z.string().min(3, 'Itinerary title must be at least 3 characters'),
  description: z.string().optional().default(''),
  startDate: z.string().min(1, 'Departure date is required'),
  endDate: z.string().min(1, 'Return date is required'),
  targetBudget: z.number().min(0, 'Budget must be greater than or equal to 0').default(2500),
  dailySpendThreshold: z.number().min(0, 'Daily spend limit must be positive').default(250),
  coverImageUrl: z.string().optional().default('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "Return date cannot be earlier than departure date",
  path: ["endDate"],
});

export type CreateTripFormData = z.infer<typeof createTripSchema>;

export const addStopSchema = z.object({
  cityId: z.string().min(1, 'Please select a destination city'),
  arrivalDate: z.string().min(1, 'Arrival date is required'),
  departureDate: z.string().min(1, 'Departure date is required'),
  accommodationName: z.string().optional(),
  accommodationCostPerNight: z.number().min(0).optional().default(120),
  transportCostToStop: z.number().min(0).optional().default(85),
  transportMode: z.enum(['flight', 'train', 'car', 'ferry', 'bus']).optional().default('flight'),
  notes: z.string().optional(),
}).refine((data) => new Date(data.departureDate) >= new Date(data.arrivalDate), {
  message: "Departure date must be after or on arrival date",
  path: ["departureDate"],
});

export type AddStopFormData = z.infer<typeof addStopSchema>;

export const addActivitySchema = z.object({
  title: z.string().min(2, 'Activity title is required'),
  category: z.enum(['culture', 'food', 'adventure', 'sightseeing', 'transport', 'relaxation']),
  cost: z.number().min(0, 'Cost must be positive').default(0),
  durationMinutes: z.number().min(15, 'Duration must be at least 15 minutes').default(90),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  startTime: z.string().min(1, 'Start time is required').default('10:00'),
  notes: z.string().optional(),
  location: z.string().optional(),
});

export type AddActivityFormData = z.infer<typeof addActivitySchema>;

export const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  preferredCurrency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD']),
  language: z.string().min(2, 'Language is required'),
  bio: z.string().max(300, 'Bio maximum 300 characters').optional().default(''),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
