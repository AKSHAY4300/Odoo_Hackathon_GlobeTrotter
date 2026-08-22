import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Compass, 
  Grid, 
  List, 
  Search 
} from 'lucide-react';
import { tripsService } from '../../services/trips';
import { useUIStore } from '../../stores/uiStore';
import { TripStatus } from '../../lib/types';
import { TicketCard } from '../../components/ui/TicketCard';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';

export const MyTripsPage: React.FC = () => {
  const { showToast } = useUIStore();
  const [activeFilter, setActiveFilter] = useState<'all' | TripStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  const { data: trips = [], isLoading, refetch } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripsService.getTrips(),
  });

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm('Are you sure you want to cancel and delete this itinerary?')) {
      await tripsService.deleteTrip(tripId);
      showToast('Trip Removed', 'Itinerary record deleted.', 'info');
      refetch();
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesFilter = activeFilter === 'all' || trip.status === activeFilter;
    const matchesSearch = 
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.stops.some((s) => s.cityName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: trips.length,
    upcoming: trips.filter((t) => t.status === 'upcoming').length,
    in_progress: trips.filter((t) => t.status === 'in_progress').length,
    completed: trips.filter((t) => t.status === 'completed').length,
    draft: trips.filter((t) => t.status === 'draft').length,
  };

  const filterTabs = [
    { id: 'all', label: 'All Voyages', count: statusCounts.all },
    { id: 'upcoming', label: 'Upcoming', count: statusCounts.upcoming },
    { id: 'in_progress', label: 'Active', count: statusCounts.in_progress },
    { id: 'completed', label: 'Past', count: statusCounts.completed },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase text-boarding-amber-700 bg-boarding-amber/20 px-2.5 py-0.5 rounded font-bold">
            PASSPORT PORTFOLIO
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink-navy mt-1">
            My Itineraries & Voyages
          </h1>
          <p className="text-xs sm:text-sm text-tarmac-grey mt-0.5">
            Manage your stamped boarding passes, active routes, and travel archives.
          </p>
        </div>

        <Link to="/trips/new">
          <Button size="md" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Plan New Trip
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-tarmac-grey/20 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <Tabs
          tabs={filterTabs}
          activeTab={activeFilter}
          onChange={(tab) => setActiveFilter(tab as any)}
          variant="pills"
        />

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-tarmac-grey absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by title or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-runway-white border border-tarmac-grey/25 rounded-md text-xs font-sans text-ink-navy focus:outline-none focus:ring-1 focus:ring-boarding-amber"
            />
          </div>

          <div className="flex items-center bg-parchment p-1 rounded-md border border-tarmac-grey/20">
            <button
              type="button"
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded ${layoutMode === 'grid' ? 'bg-ink-navy text-white' : 'text-tarmac-grey hover:text-ink-navy'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('list')}
              className={`p-1.5 rounded ${layoutMode === 'list' ? 'bg-ink-navy text-white' : 'text-tarmac-grey hover:text-ink-navy'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trips Grid / List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-60 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
          <div className="h-60 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
        </div>
      ) : filteredTrips.length > 0 ? (
        <div className={`grid gap-6 ${layoutMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {filteredTrips.map((trip) => (
            <TicketCard
              key={trip.id}
              trip={trip}
              onDelete={handleDeleteTrip}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-dashed border-tarmac-grey/25 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-boarding-amber/15 text-boarding-amber flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-ink-navy">
              {searchQuery ? 'No matching itineraries found' : 'No voyages found in this category'}
            </h3>
            <p className="text-xs sm:text-sm text-tarmac-grey max-w-md mx-auto mt-1">
              {searchQuery 
                ? `No itineraries matched "${searchQuery}". Clear your search query to inspect all planned voyages.`
                : 'You have no trips under this status filter. Stamp your passport with a fresh itinerary.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {searchQuery && (
              <Button size="sm" variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
            <Link to="/trips/new">
              <Button size="md" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Plan New Voyage
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
