import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Screen Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { CreateTripPage } from '../pages/trips/CreateTripPage';
import { MyTripsPage } from '../pages/trips/MyTripsPage';
import { ItineraryBuilderPage } from '../pages/trips/ItineraryBuilderPage';
import { ItineraryViewPage } from '../pages/trips/ItineraryViewPage';
import { CitySearchPage } from '../pages/explore/CitySearchPage';
import { ActivitySearchPage } from '../pages/explore/ActivitySearchPage';
import { TripBudgetPage } from '../pages/trips/TripBudgetPage';
import { TripCalendarPage } from '../pages/trips/TripCalendarPage';
import { SharedTripPage } from '../pages/share/SharedTripPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';

export const router = createBrowserRouter([
  // 1. Authenticated Application Shell (Screens 2-10, 12, 13)
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />, // Screen 2: Dashboard / Home
      },
      {
        path: 'trips',
        element: <MyTripsPage />, // Screen 4: My Trips List
      },
      {
        path: 'trips/new',
        element: <CreateTripPage />, // Screen 3: Create Trip Form
      },
      {
        path: 'trips/:id',
        element: <ItineraryViewPage />, // Screen 6: Read-only Structured Itinerary
      },
      {
        path: 'trips/:id/builder',
        element: <ItineraryBuilderPage />, // Screen 5: Core Itinerary Builder
      },
      {
        path: 'trips/:id/budget',
        element: <TripBudgetPage />, // Screen 9: Trip Budget & Cost Breakdown
      },
      {
        path: 'trips/:id/calendar',
        element: <TripCalendarPage />, // Screen 10: Trip Calendar / Timeline
      },
      {
        path: 'explore/cities',
        element: <CitySearchPage />, // Screen 7: Deep-linkable City Explorer
      },
      {
        path: 'explore/activities',
        element: <ActivitySearchPage />, // Screen 8: Deep-linkable Activity Explorer
      },
      {
        path: 'profile',
        element: <ProfilePage />, // Screen 12: User Profile & Settings
      },
      {
        path: 'admin',
        element: <AdminDashboardPage />, // Screen 13: Platform Admin Dashboard
      },
    ],
  },

  // 2. Public Shared Itinerary View (Screen 11 - Renders OUTSIDE authenticated app shell)
  {
    path: '/share',
    element: <PublicLayout />,
    children: [
      {
        path: ':shareId',
        element: <SharedTripPage />, // Screen 11: Public Itinerary View
      },
    ],
  },

  // 3. Auth Routes (Screen 1)
  {
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />, // Screen 1: Login
      },
      {
        path: 'signup',
        element: <SignupPage />, // Screen 1: Signup
      },
    ],
  },

  // Fallback 404 -> Redirect to Home
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
