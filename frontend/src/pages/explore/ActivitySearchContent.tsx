import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Compass } from 'lucide-react';
import { activitiesService } from '../../services/activities';
import { citiesService } from '../../services/cities';
import { tripsService } from '../../services/trips';
import { useUIStore } from '../../stores/uiStore';
import { ActivityCard } from '../../components/trip/ActivityCard';
import { Activity } from '../../lib/types';
import { getTodayDateString } from '../../lib/dateUtils';
import { formatCurrency } from '../../lib/currencyUtils';

interface ActivitySearchContentProps {
  tripId?: string | null;
  stopId?: string | null;
  targetDate?: string | null;
  onClose?: () => void;
  onActivityAdded?: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'culture', label: 'Culture & Heritage' },
  { id: 'food', label: 'Food & Culinary' },
  { id: 'adventure', label: 'Adventure & Nature' },
  { id: 'sightseeing', label: 'Sightseeing' },
  { id: 'relaxation', label: 'Relaxation' },
];

export const ActivitySearchContent: React.FC<ActivitySearchContentProps> = ({
  tripId,
  stopId,
  targetDate,
  onClose,
  onActivityAdded,
}) => {
  const { showToast } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCityId, setSelectedCityId] = useState<string>('all');
  const [maxCost, setMaxCost] = useState<number>(15000);

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => citiesService.getCities(),
  });

  const { data: currentTrip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => (tripId ? tripsService.getTripById(tripId) : null),
    enabled: !!tripId,
  });

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', searchQuery, selectedCategory, selectedCityId, maxCost],
    queryFn: () => activitiesService.searchActivities(searchQuery, selectedCategory, selectedCityId, maxCost),
  });

  const addedActivityIds = new Set<string>();
  if (currentTrip) {
    currentTrip.stops.forEach((s) => {
      s.activities.forEach((a) => {
        if (a.activityId) addedActivityIds.add(a.activityId);
      });
    });
  }

  const handleAddActivity = async (activity: Activity) => {
    if (!tripId || !stopId) {
      showToast('Experience Highlighted', `Selected ${activity.name}`, 'info');
      return;
    }

    try {
      const targetStop = currentTrip?.stops.find((s) => s.id === stopId);
      const scheduledDate = targetDate || targetStop?.arrivalDate || getTodayDateString();

      await tripsService.addActivityToStop(tripId, stopId, {
        activityId: activity.id,
        title: activity.name,
        category: activity.category,
        cost: activity.cost,
        durationMinutes: activity.durationMinutes,
        scheduledDate,
        startTime: activity.recommendedTime === 'Morning' ? '09:30' : activity.recommendedTime === 'Afternoon' ? '14:00' : '18:30',
        notes: `Selected from catalogue: ${activity.description.slice(0, 80)}...`,
        location: targetStop?.cityName || undefined,
      });

      showToast('Experience Added', `"${activity.name}" added to stop!`, 'success');
      if (onActivityAdded) onActivityAdded();
      if (onClose) onClose();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleRemoveActivity = async (activityId: string) => {
    if (!tripId || !stopId || !currentTrip) return;
    try {
      const stop = currentTrip.stops.find((s) => s.id === stopId);
      const stopAct = stop?.activities.find((a) => a.activityId === activityId);
      if (stopAct) {
        await tripsService.removeActivityFromStop(tripId, stopId, stopAct.id);
        showToast('Activity Removed', 'Experience removed from stop', 'info');
        if (onActivityAdded) onActivityAdded();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Strip */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-tarmac-grey/20 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-tarmac-grey absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tours, heritage passes, food walks, safaris..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-runway-white border border-tarmac-grey/30 rounded-xl text-sm text-ink-navy focus:outline-none focus:ring-2 focus:ring-boarding-amber font-sans"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-signal-teal text-white font-bold shadow-xs'
                  : 'bg-runway-white text-tarmac-grey hover:text-ink-navy border border-tarmac-grey/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* City Filter & Price Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-tarmac-grey/15">
          <div>
            <label className="block text-[11px] font-sans font-medium text-tarmac-grey mb-1">
              Filter by City:
            </label>
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="w-full bg-runway-white border border-tarmac-grey/30 rounded-xl px-3 py-2 text-xs text-ink-navy focus:outline-none focus:ring-2 focus:ring-boarding-amber font-sans"
            >
              <option value="all">All Destination Cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}, {city.country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-sans text-tarmac-grey mb-1">
              <span>Max Budget:</span>
              <strong className="text-ink-navy font-bold">{formatCurrency(maxCost)}</strong>
            </div>
            <input
              type="range"
              min={500}
              max={20000}
              step={500}
              value={maxCost}
              onChange={(e) => setMaxCost(Number(e.target.value))}
              className="w-full accent-boarding-amber cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Activity Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-56 bg-white rounded-2xl animate-pulse border border-tarmac-grey/20" />
          <div className="h-56 bg-white rounded-2xl animate-pulse border border-tarmac-grey/20" />
        </div>
      ) : activities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activities.map((activity) => {
            const isAdded = addedActivityIds.has(activity.id);
            return (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isAdded={isAdded}
                onAdd={handleAddActivity}
                onRemove={handleRemoveActivity}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-tarmac-grey/25 p-6">
          <Compass className="w-8 h-8 text-tarmac-grey mx-auto mb-2 opacity-60" />
          <h4 className="font-display font-bold text-base text-ink-navy">
            No Experiences Match
          </h4>
          <p className="text-xs text-tarmac-grey mt-1">
            Try adjusting your budget slider or clearing category filters.
          </p>
        </div>
      )}
    </div>
  );
};
