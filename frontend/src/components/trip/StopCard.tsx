import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Calendar, 
  Plus, 
  Hotel, 
  Plane, 
  Train, 
  Car, 
  Ship, 
  Bus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Edit
} from 'lucide-react';
import { Stop, StopActivity, TransportMode } from '../../lib/types';
import { formatDate, calculateTripDuration, formatDurationNights } from '../../lib/dateUtils';
import { formatCurrency } from '../../lib/currencyUtils';
import { ActivityChip } from './ActivityChip';
import { Button } from '../ui/Button';

interface StopCardProps {
  stop: Stop;
  index: number;
  onAddActivity: (stopId: string) => void;
  onEditActivity: (stopId: string, activity: StopActivity) => void;
  onDeleteActivity: (stopId: string, activityId: string) => void;
  onDeleteStop: (stopId: string) => void;
  onEditStop?: (stop: Stop) => void;
}

const TRANSPORT_ICONS: Record<TransportMode, React.ReactNode> = {
  flight: <Plane className="w-3.5 h-3.5" />,
  train: <Train className="w-3.5 h-3.5" />,
  car: <Car className="w-3.5 h-3.5" />,
  ferry: <Ship className="w-3.5 h-3.5" />,
  bus: <Bus className="w-3.5 h-3.5" />,
};

export const StopCard: React.FC<StopCardProps> = ({
  stop,
  index,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onDeleteStop,
  onEditStop,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const nights = Math.max(1, calculateTripDuration(stop.arrivalDate, stop.departureDate) - 1);
  const totalActivitiesCost = stop.activities.reduce((acc, a) => acc + (a.cost || 0), 0);
  const totalAccomCost = (stop.accommodationCostPerNight || 0) * nights;
  const totalStopEstimate = totalActivitiesCost + totalAccomCost + (stop.transportCostToStop || 0);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-xl shadow-sm transition-all duration-200 overflow-hidden ${
        isDragging ? 'border-boarding-amber ring-2 ring-boarding-amber shadow-lg' : 'border-tarmac-grey/20 hover:border-tarmac-grey/40'
      }`}
    >
      <div className="bg-ink-navy text-runway-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-tarmac-grey-400 hover:text-boarding-amber p-1 rounded transition-colors"
            title="Drag to reorder stop"
          >
            <GripVertical className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-boarding-amber text-ink-navy font-mono font-bold text-xs px-2 py-0.5 rounded">
              STOP {String(index + 1).padStart(2, '0')}
            </span>
            <h4 className="font-display font-bold text-base md:text-lg text-runway-white">
              {stop.cityName}, <span className="text-tarmac-grey-300 text-sm font-normal">{stop.country}</span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block font-mono text-xs text-boarding-amber">
            Est: {formatCurrency(totalStopEstimate)}
          </span>

          {onEditStop && (
            <button
              type="button"
              onClick={() => onEditStop(stop)}
              className="p-1.5 text-tarmac-grey-300 hover:text-white rounded hover:bg-ink-navy-700 transition-colors"
              title="Edit Stop Details"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onDeleteStop(stop.id)}
            className="p-1.5 text-tarmac-grey-300 hover:text-stamp-red rounded hover:bg-ink-navy-700 transition-colors"
            title="Delete Stop"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-tarmac-grey-300 hover:text-white rounded hover:bg-ink-navy-700 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="px-5 py-3 bg-runway-white/80 border-b border-tarmac-grey/15 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2 text-ink-navy">
          <Calendar className="w-4 h-4 text-boarding-amber shrink-0" />
          <div>
            <span className="font-mono font-medium">
              {formatDate(stop.arrivalDate, 'MMM d')} – {formatDate(stop.departureDate, 'MMM d')}
            </span>
            <span className="text-tarmac-grey text-[11px] block">
              {formatDurationNights(nights)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-ink-navy">
          <Hotel className="w-4 h-4 text-signal-teal shrink-0" />
          <div className="truncate">
            <span className="font-medium truncate block">
              {stop.accommodationName || 'Lodging unassigned'}
            </span>
            <span className="text-tarmac-grey text-[11px] font-mono block">
              {stop.accommodationCostPerNight ? `${formatCurrency(stop.accommodationCostPerNight)}/night` : 'Set rate'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-ink-navy">
          <span className="text-boarding-amber">
            {TRANSPORT_ICONS[stop.transportMode || 'flight']}
          </span>
          <div>
            <span className="font-medium capitalize block">
              {stop.transportMode || 'Flight'} Transit
            </span>
            <span className="text-tarmac-grey text-[11px] font-mono block">
              {stop.transportCostToStop ? formatCurrency(stop.transportCostToStop) : 'Included / Free'}
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase font-bold text-tarmac-grey tracking-wider">
                Planned Activities ({stop.activities.length})
              </span>
            </div>

            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => onAddActivity(stop.id)}
            >
              Add Activity
            </Button>
          </div>

          {stop.activities.length > 0 ? (
            <div className="space-y-2.5">
              {stop.activities.map((activity) => (
                <ActivityChip
                  key={activity.id}
                  activity={activity}
                  onEdit={(act) => onEditActivity(stop.id, act)}
                  onDelete={(actId) => onDeleteActivity(stop.id, actId)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 px-4 bg-runway-white rounded-lg border border-dashed border-tarmac-grey/25">
              <Sparkles className="w-6 h-6 text-boarding-amber mx-auto mb-2 opacity-80" />
              <p className="text-xs font-medium text-ink-navy">No activities scheduled in {stop.cityName} yet</p>
              <p className="text-[11px] text-tarmac-grey mt-0.5">Explore museum passes, walking tours, dining spots, and excursions.</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 text-xs"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => onAddActivity(stop.id)}
              >
                Browse {stop.cityName} Activities
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
