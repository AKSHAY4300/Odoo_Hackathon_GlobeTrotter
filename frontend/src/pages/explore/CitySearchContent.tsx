import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin } from 'lucide-react';
import { citiesService } from '../../services/cities';
import { tripsService } from '../../services/trips';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { CityCard } from '../../components/trip/CityCard';
import { City } from '../../lib/types';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { getTodayDateString, addDaysToDate } from '../../lib/dateUtils';

interface CitySearchContentProps {
  tripId?: string | null;
  onClose?: () => void;
  onCityAdded?: () => void;
}

const REGIONS = ['All', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania', 'Middle East'];

export const CitySearchContent: React.FC<CitySearchContentProps> = ({
  tripId,
  onClose,
  onCityAdded,
}) => {
  const { user, toggleSavedCity } = useAuthStore();
  const { showToast } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [maxCostIndex, setMaxCostIndex] = useState<number>(4);

  const [selectedCityForAdd, setSelectedCityForAdd] = useState<City | null>(null);
  const [arrivalDate, setArrivalDate] = useState(getTodayDateString());
  const [departureDate, setDepartureDate] = useState(addDaysToDate(getTodayDateString(), 3));
  const [accommodationName, setAccommodationName] = useState('Central Boutique Hotel');
  const [nightlyRate, setNightlyRate] = useState(150);
  const [transportMode, setTransportMode] = useState<'flight' | 'train' | 'car' | 'ferry' | 'bus'>('flight');
  const [transportCost, setTransportCost] = useState(90);
  const [isAdding, setIsAdding] = useState(false);

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['cities', searchQuery, selectedRegion, maxCostIndex],
    queryFn: () => citiesService.searchCities(searchQuery, selectedRegion, maxCostIndex),
  });

  const handleSelectCity = (city: City) => {
    if (!tripId) {
      showToast('City Selected', `${city.name} highlighted for itinerary planning`, 'info');
      return;
    }
    setSelectedCityForAdd(city);
  };

  const handleConfirmAddStop = async () => {
    if (!tripId || !selectedCityForAdd) return;
    setIsAdding(true);
    try {
      await tripsService.addStop(tripId, {
        cityId: selectedCityForAdd.id,
        cityName: selectedCityForAdd.name,
        country: selectedCityForAdd.country,
        arrivalDate,
        departureDate,
        accommodationName,
        accommodationCostPerNight: nightlyRate,
        transportCostToStop: transportCost,
        transportMode,
      });

      showToast('Stop Added', `${selectedCityForAdd.name} inserted into your flight path!`, 'success');
      setSelectedCityForAdd(null);
      if (onCityAdded) onCityAdded();
      if (onClose) onClose();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="space-y-3 bg-white p-4 rounded-xl border border-tarmac-grey/20 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-tarmac-grey absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by city name, country, or keyword (e.g. Paris, Japan, Canals)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-runway-white border border-tarmac-grey/30 rounded-lg text-sm text-ink-navy focus:outline-none focus:ring-2 focus:ring-boarding-amber"
          />
        </div>

        {/* Region Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {REGIONS.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => setSelectedRegion(region)}
              className={`px-3 py-1 rounded-md text-xs font-mono whitespace-nowrap transition-colors ${
                selectedRegion === region
                  ? 'bg-ink-navy text-runway-white font-bold'
                  : 'bg-runway-white text-tarmac-grey hover:text-ink-navy border border-tarmac-grey/20'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Cost Index Filter */}
        <div className="flex items-center justify-between pt-2 border-t border-tarmac-grey/15 text-xs text-tarmac-grey font-mono">
          <span>Max Cost Tier:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setMaxCostIndex(tier)}
                className={`px-2.5 py-1 rounded border text-xs font-bold ${
                  maxCostIndex >= tier
                    ? 'bg-boarding-amber text-ink-navy border-boarding-amber'
                    : 'bg-runway-white text-tarmac-grey border-tarmac-grey/30'
                }`}
              >
                {'$'.repeat(tier)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cities Result Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-52 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
          <div className="h-52 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
        </div>
      ) : cities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cities.map((city) => (
            <CityCard
              key={city.id}
              city={city}
              isSaved={user?.savedCityIds.includes(city.id)}
              onToggleSave={toggleSavedCity}
              onSelect={handleSelectCity}
              actionLabel={tripId ? 'Add Stop to Route' : 'Select Destination'}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-tarmac-grey/25 p-6">
          <MapPin className="w-8 h-8 text-tarmac-grey mx-auto mb-2 opacity-60" />
          <h4 className="font-display font-bold text-base text-ink-navy">
            No Destinations Matched
          </h4>
          <p className="text-xs text-tarmac-grey mt-1">
            Try loosening search criteria or switching regions.
          </p>
        </div>
      )}

      {/* Stop Config Modal */}
      {selectedCityForAdd && (
        <Modal
          isOpen={!!selectedCityForAdd}
          onClose={() => setSelectedCityForAdd(null)}
          title={`Attach ${selectedCityForAdd.name} to Itinerary`}
          subtitle={`${selectedCityForAdd.country} • Regional Stop`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Arrival Date"
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                monoLabel
              />
              <Input
                label="Departure Date"
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                monoLabel
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Lodging Name"
                value={accommodationName}
                onChange={(e) => setAccommodationName(e.target.value)}
                placeholder="e.g. Hotel Le Marais"
                monoLabel
              />
              <Input
                label="Rate Per Night ($)"
                type="number"
                value={nightlyRate}
                onChange={(e) => setNightlyRate(Number(e.target.value))}
                monoLabel
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[11px] font-semibold text-ink-navy/80 mb-1">
                  Inbound Transit Mode
                </label>
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value as any)}
                  className="w-full rounded-md border border-tarmac-grey/30 bg-white text-ink-navy text-sm p-2 focus:ring-2 focus:ring-boarding-amber focus:outline-none"
                >
                  <option value="flight">Flight</option>
                  <option value="train">Train</option>
                  <option value="car">Rental Car</option>
                  <option value="ferry">Ferry</option>
                  <option value="bus">Bus</option>
                </select>
              </div>

              <Input
                label="Inbound Transit Cost ($)"
                type="number"
                value={transportCost}
                onChange={(e) => setTransportCost(Number(e.target.value))}
                monoLabel
              />
            </div>

            <div className="pt-3 border-t border-tarmac-grey/20 flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedCityForAdd(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                isLoading={isAdding}
                onClick={handleConfirmAddStop}
              >
                Confirm & Add Stop
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
