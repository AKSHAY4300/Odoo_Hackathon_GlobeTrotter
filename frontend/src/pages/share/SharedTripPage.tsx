import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Copy, 
  Check, 
  Calendar, 
  Compass, 
  Sparkles 
} from 'lucide-react';
import { tripsService } from '../../services/trips';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { ActivityChip } from '../../components/trip/ActivityChip';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  formatDate, 
  formatDayMonth, 
  calculateTripDuration, 
  formatDurationDays, 
  getDaysInRange 
} from '../../lib/dateUtils';
import { formatCurrency } from '../../lib/currencyUtils';
import confetti from 'canvas-confetti';

export const SharedTripPage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { showToast } = useUIStore();

  const [isCloning, setIsCloning] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const { data: trip, isLoading } = useQuery({
    queryKey: ['shared-trip', shareId],
    queryFn: () => (shareId ? tripsService.getTripByShareId(shareId) : null),
    enabled: !!shareId,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-64 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-xl mx-auto bg-white p-12 rounded-2xl border border-tarmac-grey/20 text-center space-y-4 shadow-md">
        <Compass className="w-12 h-12 text-tarmac-grey mx-auto opacity-70" />
        <h2 className="font-display font-bold text-2xl text-ink-navy">
          Boarding Pass Not Found
        </h2>
        <p className="text-xs text-tarmac-grey">
          This shared pass code may have expired or is private.
        </p>
        <Link to="/">
          <Button variant="primary">Explore GlobeTrotter</Button>
        </Link>
      </div>
    );
  }

  const durationDays = calculateTripDuration(trip.startDate, trip.endDate);
  const days = getDaysInRange(trip.startDate, trip.endDate);

  const handleCopyPass = async () => {
    if (!isAuthenticated) {
      showToast('Login Required', 'Please sign in or create an account to copy this itinerary.', 'info');
      navigate('/login', { state: { from: { pathname: `/share/${trip.shareId}` } } });
      return;
    }

    setIsCloning(true);
    try {
      const cloned = await tripsService.cloneSharedTrip(trip.shareId);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      showToast('Itinerary Cloned!', 'Voyage copied into your trips portfolio.', 'success');
      navigate(`/trips/${cloned.id}/builder`);
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsCloning(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    showToast('Link Copied', 'Public pass URL copied to clipboard.', 'success');
    setTimeout(() => setLinkCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Boarding Pass Hero Container */}
      <div className="bg-white rounded-3xl border border-tarmac-grey/25 shadow-2xl overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-64 md:h-80 overflow-hidden bg-ink-navy">
          <img
            src={trip.coverImageUrl}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-navy via-ink-navy/40 to-transparent" />

          {/* Top Pass Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-ink-navy/90 backdrop-blur-md text-runway-white px-3 py-1 rounded text-xs font-mono border border-white/15">
                PASS: {trip.shareId.toUpperCase()}
              </span>
              <Badge variant="amber" size="sm">
                PUBLIC TRAVEL PASS
              </Badge>
            </div>

            <Button
              size="sm"
              variant={linkCopied ? 'secondary' : 'navy'}
              leftIcon={linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              onClick={handleCopyLink}
              className="text-xs"
            >
              {linkCopied ? 'Link Copied' : 'Share Link'}
            </Button>
          </div>

          {/* Title and Summary */}
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              {trip.title}
            </h1>
            <p className="text-xs sm:text-sm text-tarmac-grey-200 mt-2 max-w-xl">
              {trip.description}
            </p>
          </div>
        </div>

        {/* Boarding Pass Metadata Strip */}
        <div className="p-6 bg-parchment border-t border-dashed border-tarmac-grey/25 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-[10px] uppercase text-tarmac-grey block">Expedition Window</span>
            <div className="flex items-center gap-1.5 font-bold text-ink-navy mt-1">
              <Calendar className="w-3.5 h-3.5 text-boarding-amber" />
              <span>{formatDate(trip.startDate, 'MMM d')} – {formatDate(trip.endDate, 'MMM d, yyyy')}</span>
            </div>
            <span className="text-[11px] text-tarmac-grey block mt-0.5">
              {formatDurationDays(durationDays)}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase text-tarmac-grey block">Route Cities</span>
            <span className="font-bold text-ink-navy mt-1 block">
              {trip.stops.map((s) => s.cityName).join(' → ') || 'Custom route'}
            </span>
            <span className="text-[11px] text-tarmac-grey block mt-0.5">
              {trip.stops.length} Stops
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase text-tarmac-grey block">Estimated Cost</span>
            <span className="font-bold text-signal-teal text-sm mt-1 block">
              {formatCurrency(trip.targetBudget)}
            </span>
            <span className="text-[11px] text-tarmac-grey block mt-0.5">
              ${trip.dailySpendThreshold}/day cap
            </span>
          </div>

          <div className="flex items-center justify-end">
            <Button
              size="md"
              variant="primary"
              isLoading={isCloning}
              leftIcon={<Sparkles className="w-4 h-4" />}
              onClick={handleCopyPass}
              className="font-bold shadow-md w-full sm:w-auto"
            >
              Copy to My Trips
            </Button>
          </div>
        </div>
      </div>

      {/* Day by Day Itinerary Feed */}
      <div className="space-y-6">
        <h2 className="font-display font-bold text-xl text-ink-navy flex items-center gap-2">
          <span>Day-by-Day Travel Schedule</span>
        </h2>

        <div className="space-y-4">
          {days.map((dayDate, dayIdx) => {
            const currentStop = trip.stops.find(
              (s) => dayDate >= s.arrivalDate && dayDate <= s.departureDate
            );

            const dayActivities: any[] = [];
            trip.stops.forEach((s) => {
              s.activities.forEach((a) => {
                if (a.scheduledDate === dayDate) {
                  dayActivities.push(a);
                }
              });
            });

            return (
              <div
                key={dayDate}
                className="bg-white rounded-xl border border-tarmac-grey/20 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-tarmac-grey/15 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs bg-ink-navy text-runway-white px-2.5 py-0.5 rounded">
                      DAY {dayIdx + 1}
                    </span>
                    <div>
                      <h4 className="font-display font-bold text-base text-ink-navy">
                        {formatDayMonth(dayDate)}
                      </h4>
                      <span className="text-xs font-mono text-tarmac-grey">
                        {currentStop ? `📍 ${currentStop.cityName}, ${currentStop.country}` : '✈️ In Transit'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-tarmac-grey">
                    {dayActivities.length} Experiences
                  </span>
                </div>

                <div className="space-y-2">
                  {dayActivities.length > 0 ? (
                    dayActivities.map((act) => (
                      <ActivityChip key={act.id} activity={act} readOnly />
                    ))
                  ) : (
                    <p className="text-xs text-tarmac-grey italic py-2">
                      Open schedule — traveler leisure.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share & Copy CTA Footer Strip */}
      <div className="bg-ink-navy text-runway-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden border border-ink-navy-700">
        <div className="absolute right-0 top-0 w-80 h-80 bg-boarding-amber/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-boarding-amber">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ITINERARY TEMPLATE READY</span>
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
            Ready to personalize this route?
          </h3>
          <p className="text-xs sm:text-sm text-tarmac-grey-300 max-w-lg">
            Clone this curated voyage into your GlobeTrotter passport to customize stops, adjust travel dates, and track your daily budget.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
          <Button
            size="lg"
            variant="primary"
            leftIcon={<Sparkles className="w-5 h-5" />}
            onClick={handleCopyPass}
            isLoading={isCloning}
            className="font-bold shadow-lg w-full sm:w-auto"
          >
            Clone Voyage to My Passport
          </Button>
        </div>
      </div>
    </div>
  );
};
