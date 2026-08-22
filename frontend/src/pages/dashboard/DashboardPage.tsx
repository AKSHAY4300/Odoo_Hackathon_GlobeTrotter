import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  ArrowRight, 
  Compass 
} from 'lucide-react';
import { tripsService } from '../../services/trips';
import { citiesService } from '../../services/cities';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { TicketCard } from '../../components/ui/TicketCard';
import { CityCard } from '../../components/trip/CityCard';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/currencyUtils';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, toggleSavedCity } = useAuthStore();
  const { showToast } = useUIStore();

  const { data: trips = [], isLoading: tripsLoading, refetch: refetchTrips } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripsService.getTrips(),
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => citiesService.getCities(),
  });

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm('Are you sure you want to cancel and delete this itinerary?')) {
      await tripsService.deleteTrip(tripId);
      showToast('Trip Removed', 'Itinerary record deleted.', 'info');
      refetchTrips();
    }
  };

  const totalUpcomingSpend = trips.reduce((acc, t) => {
    const tripEst = t.stops.reduce((stopAcc, s) => {
      const actCost = s.activities.reduce((aAcc, a) => aAcc + (a.cost || 0), 0);
      const stayCost = (s.accommodationCostPerNight || 0) * 3;
      return stopAcc + actCost + stayCost + (s.transportCostToStop || 0);
    }, 0);
    return acc + tripEst;
  }, 0);

  const totalDestinationsVisited = trips.reduce((acc, t) => acc + t.stops.length, 0);

  return (
    <div className="space-y-10">
      {/* 1. Departure Board Header Strip */}
      <section className="bg-ink-navy text-runway-white rounded-2xl p-6 sm:p-8 border border-ink-navy-700 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-boarding-amber/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-boarding-amber text-ink-navy font-mono text-[11px] font-bold px-2.5 py-0.5 rounded uppercase">
                TERMINAL DEPARTURE GATE
              </span>
              <span className="text-xs font-mono text-tarmac-grey-300">
                PASSPORT: {user?.id.toUpperCase()}
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-4xl text-white tracking-tight">
              Welcome aboard, {user?.name || 'Explorer'}.
            </h1>

            <p className="text-xs sm:text-sm text-tarmac-grey-200 max-w-xl">
              You have <strong className="text-boarding-amber font-mono font-bold">{trips.length} active itineraries</strong> mapped across <strong className="text-signal-teal font-mono font-bold">{totalDestinationsVisited} global stops</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link to="/trips/new" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="primary"
                leftIcon={<Plus className="w-5 h-5" />}
                className="w-full shadow-lg font-bold"
              >
                Plan New Trip
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. Budget-Highlights Summary Strip */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-tarmac-grey-300 block">Total Active Itineraries</span>
            <span className="text-xl sm:text-2xl font-mono font-bold text-white mt-0.5 block">{trips.length}</span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-tarmac-grey-300 block">Cities Bookmarked</span>
            <span className="text-xl sm:text-2xl font-mono font-bold text-boarding-amber mt-0.5 block">
              {totalDestinationsVisited}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-tarmac-grey-300 block">Allocated Spend Volume</span>
            <span className="text-xl sm:text-2xl font-mono font-bold text-signal-teal mt-0.5 block">
              {formatCurrency(totalUpcomingSpend || 8200)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-tarmac-grey-300 block">Traveler Status</span>
            <span className="text-sm font-mono font-bold text-white uppercase mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-signal-teal animate-pulse" />
              Verified Explorer
            </span>
          </div>
        </div>
      </section>

      {/* 3. Upcoming Itineraries Rail */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl md:text-2xl text-ink-navy flex items-center gap-2">
              <span>Your Boarding Passes & Itineraries</span>
            </h2>
            <p className="text-xs text-tarmac-grey mt-0.5">
              Multi-city routes currently underway or scheduled
            </p>
          </div>

          <Link
            to="/trips"
            className="text-xs font-mono font-bold text-signal-teal hover:text-signal-teal-600 flex items-center gap-1"
          >
            <span>View All ({trips.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {tripsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-56 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
            <div className="h-56 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trips.slice(0, 4).map((trip) => (
              <TicketCard
                key={trip.id}
                trip={trip}
                onDelete={handleDeleteTrip}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-dashed border-tarmac-grey/25 p-8 text-center space-y-3">
            <Compass className="w-10 h-10 text-boarding-amber mx-auto" />
            <h3 className="font-display font-bold text-lg text-ink-navy">
              No Voyages Planned Yet
            </h3>
            <p className="text-xs text-tarmac-grey max-w-sm mx-auto">
              Stamp your first passport page by creating an itinerary and connecting destination cities.
            </p>
            <Link to="/trips/new">
              <Button size="md" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Create Your First Trip
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* 4. Recommended Destinations Rail */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl md:text-2xl text-ink-navy">
              Recommended Destinations
            </h2>
            <p className="text-xs text-tarmac-grey mt-0.5">
              Hand-curated global hubs with rich activity catalogs
            </p>
          </div>

          <Link
            to="/explore/cities"
            className="text-xs font-mono font-bold text-signal-teal hover:text-signal-teal-600 flex items-center gap-1"
          >
            <span>Explore All Cities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cities.slice(0, 4).map((city) => (
            <CityCard
              key={city.id}
              city={city}
              isSaved={user?.savedCityIds.includes(city.id)}
              onToggleSave={toggleSavedCity}
              onSelect={(c) => {
                navigate(`/trips/new?city=${c.id}`);
              }}
              actionLabel="Plan with this City"
            />
          ))}
        </div>
      </section>
    </div>
  );
};
