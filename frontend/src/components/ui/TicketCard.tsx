import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Wallet, 
  ArrowRight, 
  MoreVertical, 
  Share2, 
  Trash2, 
  Edit3, 
  PieChart, 
  CalendarDays, 
  Copy 
} from 'lucide-react';
import { Trip } from '../../lib/types';
import { formatDate, calculateTripDuration, formatDurationDays } from '../../lib/dateUtils';
import { formatCurrency } from '../../lib/currencyUtils';
import { Badge } from './Badge';
import { useUIStore } from '../../stores/uiStore';

export interface TicketCardProps {
  trip: Trip;
  onDelete?: (tripId: string) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ trip, onDelete }) => {
  const navigate = useNavigate();
  const { openShareModal, showToast } = useUIStore();
  const [showMenu, setShowMenu] = React.useState(false);

  const durationDays = calculateTripDuration(trip.startDate, trip.endDate);
  const totalActivities = trip.stops.reduce((acc, s) => acc + s.activities.length, 0);

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openShareModal(trip.id);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/share/${trip.shareId}`;
    navigator.clipboard.writeText(url);
    showToast('Boarding Pass Link Copied', 'Share URL copied to clipboard', 'success');
  };

  return (
    <div className="relative group bg-white border border-tarmac-grey/20 rounded-xl overflow-hidden shadow-ticket hover:shadow-ticket-hover transition-all duration-200 flex flex-col md:flex-row">
      <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-runway-white border border-tarmac-grey/20 z-10" />
      <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-runway-white border border-tarmac-grey/20 z-10" />

      <div className="md:w-1/3 relative h-48 md:h-auto overflow-hidden bg-ink-navy">
        <img
          src={trip.coverImageUrl}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-ink-navy/80 via-ink-navy/30 to-transparent" />
        
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-ink-navy/90 backdrop-blur-md px-2.5 py-1 rounded text-white border border-white/10 font-mono text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-boarding-amber animate-ping" />
          <span>{trip.shareId.toUpperCase()}</span>
        </div>

        <div className="absolute bottom-3 left-3">
          <Badge variant={trip.status === 'upcoming' ? 'amber' : 'teal'}>
            {trip.status}
          </Badge>
        </div>
      </div>

      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link 
                to={`/trips/${trip.id}`} 
                className="font-display font-bold text-xl md:text-2xl text-ink-navy hover:text-signal-teal transition-colors line-clamp-1"
              >
                {trip.title}
              </Link>
              <p className="text-xs md:text-sm text-tarmac-grey mt-1 line-clamp-2">
                {trip.description || 'Custom multi-city voyage planned on GlobeTrotter.'}
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 text-tarmac-grey hover:text-ink-navy hover:bg-tarmac-grey/10 rounded-md transition-colors"
                aria-label="Trip options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-8 w-48 bg-white border border-tarmac-grey/20 rounded-lg shadow-xl py-1 z-30 font-sans text-xs">
                    <button
                      onClick={() => { setShowMenu(false); navigate(`/trips/${trip.id}`); }}
                      className="w-full px-3 py-2 text-left hover:bg-runway-white flex items-center gap-2 text-ink-navy"
                    >
                      <ArrowRight className="w-4 h-4 text-signal-teal" /> View Itinerary
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); navigate(`/trips/${trip.id}/builder`); }}
                      className="w-full px-3 py-2 text-left hover:bg-runway-white flex items-center gap-2 text-ink-navy"
                    >
                      <Edit3 className="w-4 h-4 text-boarding-amber" /> Itinerary Builder
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); navigate(`/trips/${trip.id}/budget`); }}
                      className="w-full px-3 py-2 text-left hover:bg-runway-white flex items-center gap-2 text-ink-navy"
                    >
                      <PieChart className="w-4 h-4 text-signal-teal" /> Cost Breakdown
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); navigate(`/trips/${trip.id}/calendar`); }}
                      className="w-full px-3 py-2 text-left hover:bg-runway-white flex items-center gap-2 text-ink-navy"
                    >
                      <CalendarDays className="w-4 h-4 text-ink-navy" /> Calendar View
                    </button>
                    <button
                      onClick={(e) => { setShowMenu(false); handleCopyLink(e); }}
                      className="w-full px-3 py-2 text-left hover:bg-runway-white flex items-center gap-2 text-ink-navy"
                    >
                      <Copy className="w-4 h-4 text-tarmac-grey" /> Copy Share Link
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => { setShowMenu(false); onDelete(trip.id); }}
                        className="w-full px-3 py-2 text-left hover:bg-stamp-red/10 flex items-center gap-2 text-stamp-red border-t border-tarmac-grey/10"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Trip
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-dashed border-tarmac-grey/20">
            <div>
              <span className="text-[10px] font-mono uppercase text-tarmac-grey block">Dates</span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-ink-navy mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-boarding-amber shrink-0" />
                <span>{formatDate(trip.startDate, 'MMM d')} – {formatDate(trip.endDate, 'MMM d, yyyy')}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-tarmac-grey block">Duration</span>
              <span className="text-xs font-mono font-medium text-ink-navy mt-0.5 block">
                {formatDurationDays(durationDays)}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-tarmac-grey block">Target Budget</span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-signal-teal mt-0.5">
                <Wallet className="w-3.5 h-3.5 shrink-0" />
                <span>{formatCurrency(trip.targetBudget)}</span>
              </div>
            </div>
          </div>

          {trip.stops.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-tarmac-grey mr-1">Route:</span>
              {trip.stops.map((stop, i) => (
                <React.Fragment key={stop.id}>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-parchment rounded text-[11px] font-mono font-medium text-ink-navy border border-tarmac-grey/20">
                    <MapPin className="w-3 h-3 text-boarding-amber" />
                    {stop.cityName}
                  </span>
                  {i < trip.stops.length - 1 && (
                    <span className="text-boarding-amber font-mono text-xs">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-xs text-tarmac-grey italic">
              No stops added yet. Ready to build route.
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-tarmac-grey/15 flex items-center justify-between gap-3">
          <span className="text-xs font-mono text-tarmac-grey">
            {trip.stops.length} {trip.stops.length === 1 ? 'Stop' : 'Stops'} • {totalActivities} Activities
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareClick}
              className="p-2 text-tarmac-grey hover:text-signal-teal hover:bg-signal-teal/10 rounded-md transition-colors"
              title="Share Boarding Pass"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <Link
              to={`/trips/${trip.id}/builder`}
              className="inline-flex items-center gap-1.5 bg-ink-navy hover:bg-ink-navy-700 text-runway-white text-xs font-semibold px-3 py-2 rounded-md transition-colors"
            >
              <span>Build</span>
              <ArrowRight className="w-3.5 h-3.5 text-boarding-amber" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
