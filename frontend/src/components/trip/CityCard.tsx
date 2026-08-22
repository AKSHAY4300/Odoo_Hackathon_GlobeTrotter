import React from 'react';
import { MapPin, Star, Plus } from 'lucide-react';
import { City } from '../../lib/types';
import { formatCostIndex } from '../../lib/currencyUtils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface CityCardProps {
  city: City;
  onSelect?: (city: City) => void;
  isSaved?: boolean;
  onToggleSave?: (cityId: string) => void;
  actionLabel?: string;
}

export const CityCard: React.FC<CityCardProps> = ({
  city,
  onSelect,
  isSaved = false,
  onToggleSave,
  actionLabel = 'Add to Itinerary',
}) => {
  return (
    <div className="group bg-white rounded-xl border border-tarmac-grey/20 overflow-hidden shadow-sm hover:shadow-md hover:border-boarding-amber/40 transition-all duration-200 flex flex-col justify-between">
      <div className="relative h-44 overflow-hidden bg-ink-navy">
        <img
          src={city.imageUrl}
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-navy/80 via-transparent to-black/20" />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge variant="navy" size="sm">
            {city.region}
          </Badge>
          <span className="bg-boarding-amber text-ink-navy text-xs font-mono font-bold px-2 py-0.5 rounded shadow-sm">
            {formatCostIndex(city.costIndex)}
          </span>
        </div>

        {onToggleSave && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(city.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
              isSaved ? 'bg-boarding-amber text-ink-navy shadow' : 'bg-ink-navy/60 text-white hover:text-boarding-amber'
            }`}
            title={isSaved ? 'Saved to bucket list' : 'Save destination'}
          >
            <Star className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <h4 className="font-display font-bold text-xl text-white">
            {city.name}
          </h4>
          <p className="text-xs text-tarmac-grey-200 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-boarding-amber" />
            {city.country}
          </p>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <p className="text-xs text-tarmac-grey line-clamp-2">
          {city.description}
        </p>

        <div className="flex flex-wrap gap-1">
          {city.highlights.slice(0, 3).map((h, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-parchment text-ink-navy px-2 py-0.5 rounded border border-tarmac-grey/15 font-mono"
            >
              {h}
            </span>
          ))}
        </div>

        <div className="pt-3 border-t border-tarmac-grey/15 flex items-center justify-between gap-2">
          <div className="text-[11px] font-mono text-tarmac-grey">
            <span>Best: </span>
            <span className="text-ink-navy font-semibold">{city.bestTimeToVisit}</span>
          </div>

          {onSelect && (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => onSelect(city)}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
