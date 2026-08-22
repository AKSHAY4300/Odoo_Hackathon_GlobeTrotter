import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  MapPin, 
  Share2, 
  Edit3, 
  Printer, 
  PieChart, 
  CalendarDays, 
  Hotel, 
  Plane 
} from 'lucide-react';
import { tripsService } from '../../services/trips';
import { useUIStore } from '../../stores/uiStore';
import { ActivityChip } from '../../components/trip/ActivityChip';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { 
  formatDate, 
  formatDayMonth, 
  calculateTripDuration, 
  formatDurationDays, 
  formatDurationNights, 
  getDaysInRange 
} from '../../lib/dateUtils';
import { formatCurrency } from '../../lib/currencyUtils';

export const ItineraryViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { openShareModal } = useUIStore();
  const [viewMode, setViewMode] = useState<'day_by_day' | 'by_city'>('day_by_day');

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => (id ? tripsService.getTripById(id) : null),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-tarmac-grey/20 text-center space-y-4">
        <h3 className="font-display font-bold text-xl text-ink-navy">Voyage Not Found</h3>
        <Link to="/trips">
          <Button variant="primary">Return to My Trips</Button>
        </Link>
      </div>
    );
  }

  const durationDays = calculateTripDuration(trip.startDate, trip.endDate);
  const allDays = getDaysInRange(trip.startDate, trip.endDate);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Boarding Pass Hero Header */}
      <div className="bg-white border border-tarmac-grey/25 rounded-2xl shadow-ticket overflow-hidden">
        {/* Cover Photo Strip */}
        <div className="relative h-64 md:h-80 overflow-hidden bg-ink-navy">
          <img
            src={trip.coverImageUrl}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-navy via-ink-navy/40 to-transparent" />

          {/* Top Bar Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-ink-navy/90 backdrop-blur-md text-runway-white px-3 py-1 rounded text-xs font-mono border border-white/15">
                PASS: {trip.shareId.toUpperCase()}
              </span>
              <Badge variant="amber" size="sm">
                {trip.status.toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="bg-ink-navy/80 hover:bg-ink-navy backdrop-blur-md text-white p-2 rounded-lg border border-white/15 transition-colors print:hidden"
                title="Print Itinerary"
              >
                <Printer className="w-4 h-4" />
              </button>
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Share2 className="w-3.5 h-3.5" />}
                onClick={() => openShareModal(trip.id)}
                className="print:hidden"
              >
                Share Pass
              </Button>
            </div>
          </div>

          {/* Title & Route Tagline */}
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight">
              {trip.title}
            </h1>
            <p className="text-xs sm:text-sm text-tarmac-grey-200 mt-2 max-w-2xl">
              {trip.description}
            </p>
          </div>
        </div>

        {/* Boarding Pass Metadata Bar */}
        <div className="p-6 bg-parchment border-t border-dashed border-tarmac-grey/25 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-[10px] uppercase text-tarmac-grey block">Timeframe</span>
            <div className="flex items-center gap-1.5 font-bold text-ink-navy mt-1">
              <Calendar className="w-4 h-4 text-boarding-amber" />
              <span>{formatDate(trip.startDate, 'MMM d')} – {formatDate(trip.endDate, 'MMM d, yyyy')}</span>
            </div>
            <span className="text-[11px] text-tarmac-grey block mt-0.5">
              {formatDurationDays(durationDays)} expedition
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase text-tarmac-grey block">Route Sequence</span>
            <span className="font-bold text-ink-navy mt-1 block">
              {trip.stops.map((s) => s.cityName).join(' → ') || 'No stops'}
            </span>
            <span className="text-[11px] text-tarmac-grey block mt-0.5">
              {trip.stops.length} global cities
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase text-tarmac-grey block">Total Budget Target</span>
            <span className="font-bold text-signal-teal text-sm mt-1 block">
              {formatCurrency(trip.targetBudget)}
            </span>
            <span className="text-[11px] text-tarmac-grey block mt-0.5">
              ${trip.dailySpendThreshold}/day threshold
            </span>
          </div>

          <div className="flex items-center justify-end">
            <Link to={`/trips/${trip.id}/builder`} className="print:hidden">
              <Button size="sm" variant="navy" leftIcon={<Edit3 className="w-3.5 h-3.5 text-boarding-amber" />}>
                Edit in Builder
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* View Switcher Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Tabs
          tabs={[
            { id: 'day_by_day', label: 'Day-by-Day View', icon: <CalendarDays className="w-4 h-4" /> },
            { id: 'by_city', label: 'Grouped by City', icon: <MapPin className="w-4 h-4" /> },
          ]}
          activeTab={viewMode}
          onChange={(t) => setViewMode(t as any)}
          variant="pills"
        />

        <div className="flex items-center gap-3">
          <Link to={`/trips/${trip.id}/budget`}>
            <Button size="sm" variant="outline" leftIcon={<PieChart className="w-3.5 h-3.5 text-signal-teal" />}>
              Budget Breakdown
            </Button>
          </Link>
          <Link to={`/trips/${trip.id}/calendar`}>
            <Button size="sm" variant="outline" leftIcon={<CalendarDays className="w-3.5 h-3.5 text-ink-navy" />}>
              Interactive Calendar
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Layout */}
      {viewMode === 'day_by_day' ? (
        <div className="space-y-6">
          {allDays.map((dayDate, dayIdx) => {
            const currentStop = trip.stops.find((s) => {
              return dayDate >= s.arrivalDate && dayDate <= s.departureDate;
            });

            const dayActivities: any[] = [];
            trip.stops.forEach((s) => {
              s.activities.forEach((a) => {
                if (a.scheduledDate === dayDate) {
                  dayActivities.push({ ...a, cityName: s.cityName });
                }
              });
            });

            return (
              <div
                key={dayDate}
                className="bg-white rounded-xl border border-tarmac-grey/20 shadow-xs overflow-hidden"
              >
                <div className="bg-runway-white p-4 border-b border-tarmac-grey/15 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs bg-ink-navy text-runway-white px-2.5 py-1 rounded">
                      DAY {dayIdx + 1}
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-base md:text-lg text-ink-navy">
                        {formatDayMonth(dayDate)}
                      </h3>
                      <span className="text-xs font-mono text-tarmac-grey">
                        {currentStop ? `📍 ${currentStop.cityName}, ${currentStop.country}` : '✈️ In Transit'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-tarmac-grey">
                    {dayActivities.length} {dayActivities.length === 1 ? 'Activity' : 'Activities'}
                  </span>
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  {dayActivities.length > 0 ? (
                    dayActivities.map((act) => (
                      <ActivityChip key={act.id} activity={act} readOnly />
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-tarmac-grey italic bg-runway-white/60 rounded-lg">
                      Free exploration day — no structured tours booked.
                    </div>
                  )}

                  {currentStop?.accommodationName && (
                    <div className="mt-3 pt-3 border-t border-tarmac-grey/15 flex items-center justify-between text-xs text-tarmac-grey font-mono">
                      <span className="flex items-center gap-1.5">
                        <Hotel className="w-3.5 h-3.5 text-signal-teal" />
                        <span>Stay: {currentStop.accommodationName}</span>
                      </span>
                      <span>${currentStop.accommodationCostPerNight}/night</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {trip.stops.map((stop, index) => {
            const nights = Math.max(1, calculateTripDuration(stop.arrivalDate, stop.departureDate) - 1);
            return (
              <div
                key={stop.id}
                className="bg-white rounded-xl border border-tarmac-grey/20 shadow-sm overflow-hidden"
              >
                <div className="bg-ink-navy text-runway-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="bg-boarding-amber text-ink-navy font-mono font-bold text-xs px-2.5 py-1 rounded">
                      STOP {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-xl text-white">
                        {stop.cityName}, {stop.country}
                      </h3>
                      <span className="text-xs font-mono text-tarmac-grey-300">
                        {formatDate(stop.arrivalDate, 'MMM d')} – {formatDate(stop.departureDate, 'MMM d, yyyy')} ({formatDurationNights(nights)})
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-boarding-amber">
                    {stop.activities.length} Experiences
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-parchment rounded-lg text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Hotel className="w-4 h-4 text-signal-teal" />
                      <span>{stop.accommodationName || 'Lodging unassigned'} (${stop.accommodationCostPerNight || 0}/night)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-boarding-amber" />
                      <span className="capitalize">{stop.transportMode || 'Flight'} Transit (${stop.transportCostToStop || 0})</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {stop.activities.map((activity) => (
                      <ActivityChip key={activity.id} activity={activity} readOnly />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
