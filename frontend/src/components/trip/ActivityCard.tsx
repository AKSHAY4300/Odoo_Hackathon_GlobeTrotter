import React from 'react';
import { Clock, Star, Plus, Check } from 'lucide-react';
import { Activity } from '../../lib/types';
import { formatMinutes } from '../../lib/dateUtils';
import { formatCurrency } from '../../lib/currencyUtils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ActivityCardProps {
  activity: Activity;
  isAdded?: boolean;
  onAdd?: (activity: Activity) => void;
  onRemove?: (activityId: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  isAdded = false,
  onAdd,
  onRemove,
}) => {
  return (
    <div className="bg-white rounded-xl border border-tarmac-grey/20 overflow-hidden shadow-sm hover:shadow-md hover:border-boarding-amber/40 transition-all duration-200 flex flex-col justify-between">
      <div className="relative h-36 overflow-hidden bg-ink-navy">
        <img
          src={activity.imageUrl}
          alt={activity.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-navy/70 via-transparent to-black/20" />

        <div className="absolute top-2.5 left-2.5">
          <Badge variant="teal" size="sm">
            {activity.category}
          </Badge>
        </div>

        <div className="absolute top-2.5 right-2.5 bg-ink-navy/85 backdrop-blur-md px-2 py-0.5 rounded text-white text-[11px] font-mono flex items-center gap-1">
          <Star className="w-3 h-3 text-boarding-amber fill-current" />
          <span>{activity.rating.toFixed(1)}</span>
        </div>

        <div className="absolute bottom-2.5 right-2.5 bg-boarding-amber text-ink-navy px-2.5 py-0.5 rounded font-mono font-bold text-xs shadow">
          {activity.cost > 0 ? formatCurrency(activity.cost) : 'Free'}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h4 className="font-display font-bold text-sm md:text-base text-ink-navy line-clamp-1">
            {activity.name}
          </h4>
          <p className="text-xs text-tarmac-grey mt-1 line-clamp-2">
            {activity.description}
          </p>
        </div>

        <div className="pt-2 border-t border-tarmac-grey/15 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-mono text-tarmac-grey">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-signal-teal" />
              {formatMinutes(activity.durationMinutes)}
            </span>
            <span>• {activity.recommendedTime}</span>
          </div>

          <div>
            {isAdded ? (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Check className="w-3.5 h-3.5 text-signal-teal" />}
                onClick={() => onRemove && onRemove(activity.id)}
                className="text-signal-teal border-signal-teal/30 hover:bg-signal-teal/10"
              >
                Added
              </Button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => onAdd && onAdd(activity)}
              >
                Add
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
