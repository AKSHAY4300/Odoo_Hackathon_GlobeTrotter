import React from 'react';
import { 
  Clock, 
  MapPin, 
  Trash2, 
  Edit2, 
  Compass, 
  Utensils, 
  Camera, 
  Landmark, 
  Plane, 
  Heart 
} from 'lucide-react';
import { StopActivity, ActivityCategory } from '../../lib/types';
import { formatTime, formatMinutes } from '../../lib/dateUtils';
import { formatCurrency } from '../../lib/currencyUtils';

interface ActivityChipProps {
  activity: StopActivity;
  onEdit?: (activity: StopActivity) => void;
  onDelete?: (activityId: string) => void;
  readOnly?: boolean;
}

const CATEGORY_ICONS: Record<ActivityCategory, React.ReactNode> = {
  culture: <Landmark className="w-3.5 h-3.5" />,
  food: <Utensils className="w-3.5 h-3.5" />,
  adventure: <Compass className="w-3.5 h-3.5" />,
  sightseeing: <Camera className="w-3.5 h-3.5" />,
  transport: <Plane className="w-3.5 h-3.5" />,
  relaxation: <Heart className="w-3.5 h-3.5" />,
};

const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  culture: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  food: 'bg-amber-50 text-amber-800 border-amber-200',
  adventure: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  sightseeing: 'bg-sky-50 text-sky-700 border-sky-200',
  transport: 'bg-purple-50 text-purple-700 border-purple-200',
  relaxation: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const ActivityChip: React.FC<ActivityChipProps> = ({
  activity,
  onEdit,
  onDelete,
  readOnly = false,
}) => {
  return (
    <div className="group relative flex items-center justify-between p-3 bg-white border border-tarmac-grey/15 rounded-lg hover:border-boarding-amber/50 hover:shadow-sm transition-all gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`p-2 rounded-md border shrink-0 ${CATEGORY_COLORS[activity.category] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
        >
          {CATEGORY_ICONS[activity.category] || <Compass className="w-3.5 h-3.5" />}
        </div>

        <div className="min-w-0">
          <h5 className="font-semibold text-xs md:text-sm text-ink-navy truncate">
            {activity.title}
          </h5>
          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] font-mono text-tarmac-grey">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-signal-teal" />
              {formatTime(activity.startTime)} ({formatMinutes(activity.durationMinutes)})
            </span>
            {activity.location && (
              <span className="hidden sm:flex items-center gap-1 truncate max-w-[150px]">
                <MapPin className="w-3 h-3 text-boarding-amber" />
                {activity.location}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <span className="text-xs md:text-sm font-mono font-bold text-ink-navy">
            {activity.cost > 0 ? formatCurrency(activity.cost) : 'Free'}
          </span>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(activity)}
                className="p-1.5 text-tarmac-grey hover:text-signal-teal hover:bg-signal-teal/10 rounded transition-colors"
                title="Edit Activity"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(activity.id)}
                className="p-1.5 text-tarmac-grey hover:text-stamp-red hover:bg-stamp-red/10 rounded transition-colors"
                title="Remove Activity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
