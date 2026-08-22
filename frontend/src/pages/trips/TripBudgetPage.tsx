import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft 
} from 'lucide-react';
import { tripsService } from '../../services/trips';
import { budgetService } from '../../services/budget';
import { useUIStore } from '../../stores/uiStore';
import { BudgetChart } from '../../components/trip/BudgetChart';
import { DailySpend } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/currencyUtils';
import { formatDate } from '../../lib/dateUtils';

export const TripBudgetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  const [customThreshold, setCustomThreshold] = useState<number | null>(null);
  const [selectedDayDetail, setSelectedDayDetail] = useState<DailySpend | null>(null);

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => (id ? tripsService.getTripById(id) : null),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-44 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
        <div className="h-96 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-tarmac-grey/20 text-center space-y-4">
        <h3 className="font-display font-bold text-xl text-ink-navy">Trip Not Found</h3>
        <Link to="/trips">
          <Button variant="primary">Return to My Trips</Button>
        </Link>
      </div>
    );
  }

  const activeThreshold = customThreshold ?? trip.dailySpendThreshold ?? 250;
  const tripForCalculation = {
    ...trip,
    dailySpendThreshold: activeThreshold,
  };
  const breakdown = budgetService.calculateBudgetSynchronous(tripForCalculation);

  const handleUpdateThreshold = async (newVal: number) => {
    setCustomThreshold(newVal);
    try {
      await tripsService.updateTrip(trip.id, { dailySpendThreshold: newVal });
      queryClient.setQueryData(['trip', id], { ...trip, dailySpendThreshold: newVal });
      showToast('Threshold Saved', `Daily budget cap set to $${newVal}/day`, 'info');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header Strip */}
      <div className="bg-white p-6 rounded-2xl border border-tarmac-grey/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to={`/trips/${trip.id}/builder`}
              className="text-xs font-mono text-signal-teal hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Builder
            </Link>
            <span className="text-tarmac-grey text-xs">•</span>
            <span className="text-xs font-mono text-tarmac-grey">{trip.title}</span>
          </div>

          <h1 className="font-display font-bold text-2xl md:text-3xl text-ink-navy mt-1">
            Trip Budget & Expenditure Breakdown
          </h1>
          <p className="text-xs sm:text-sm text-tarmac-grey mt-0.5">
            Real-time financial breakdown across lodging, transportation, experiences, and meals.
          </p>
        </div>

        {/* Live Threshold Limit Controls */}
        <div className="bg-parchment p-3 rounded-xl border border-tarmac-grey/25 flex items-center gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase text-tarmac-grey block font-bold">
              Adjust Daily Limit Cap
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono font-bold text-ink-navy">$</span>
              <input
                type="number"
                value={activeThreshold}
                onChange={(e) => handleUpdateThreshold(Number(e.target.value))}
                step={25}
                min={50}
                className="w-24 px-2 py-1 bg-white border border-tarmac-grey/30 rounded-text-xs font-mono font-bold text-ink-navy focus:outline-none focus:ring-1 focus:ring-boarding-amber"
              />
              <span className="text-[11px] font-mono text-tarmac-grey">/ day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Donut & Bar Charts with Stamp-Red Warning Alerts */}
      <BudgetChart
        breakdown={breakdown}
        onSelectDay={(day) => setSelectedDayDetail(day)}
      />

      {/* Day Inspector Drawer / Details Card */}
      {selectedDayDetail && (
        <div className="bg-white rounded-2xl border-2 border-boarding-amber/40 p-6 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-tarmac-grey/15 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-ink-navy text-runway-white px-2 py-0.5 rounded">
                  DAY {selectedDayDetail.dayNumber}
                </span>
                <h3 className="font-display font-bold text-lg text-ink-navy">
                  {formatDate(selectedDayDetail.date, 'EEEE, MMM d, yyyy')}
                </h3>
              </div>
              <span className="text-xs font-mono text-tarmac-grey mt-0.5 block">
                Destination: 📍 {selectedDayDetail.cityName}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xl font-mono font-bold text-ink-navy block">
                {formatCurrency(selectedDayDetail.totalDayCost)}
              </span>
              <span
                className={`text-xs font-mono font-semibold ${
                  selectedDayDetail.isOverThreshold ? 'text-stamp-red' : 'text-signal-teal'
                }`}
              >
                {selectedDayDetail.isOverThreshold
                  ? `Over cap by ${formatCurrency(selectedDayDetail.totalDayCost - activeThreshold)}`
                  : 'Within daily cap'}
              </span>
            </div>
          </div>

          {/* Daily Component Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 bg-runway-white rounded-lg border border-tarmac-grey/15">
              <span className="text-tarmac-grey block text-[10px] uppercase">Lodging</span>
              <span className="font-bold text-ink-navy text-sm mt-0.5 block">
                {formatCurrency(selectedDayDetail.accommodationCost)}
              </span>
            </div>
            <div className="p-2.5 bg-runway-white rounded-lg border border-tarmac-grey/15">
              <span className="text-tarmac-grey block text-[10px] uppercase">Inbound Transit</span>
              <span className="font-bold text-ink-navy text-sm mt-0.5 block">
                {formatCurrency(selectedDayDetail.transportCost)}
              </span>
            </div>
            <div className="p-2.5 bg-runway-white rounded-lg border border-tarmac-grey/15">
              <span className="text-tarmac-grey block text-[10px] uppercase">Activities & Passes</span>
              <span className="font-bold text-ink-navy text-sm mt-0.5 block">
                {formatCurrency(selectedDayDetail.activitiesCost)}
              </span>
            </div>
            <div className="p-2.5 bg-runway-white rounded-lg border border-tarmac-grey/15">
              <span className="text-tarmac-grey block text-[10px] uppercase">Meals & Sundries</span>
              <span className="font-bold text-ink-navy text-sm mt-0.5 block">
                {formatCurrency(selectedDayDetail.mealsAndIncidentalsCost)}
              </span>
            </div>
          </div>

          {/* Activities on this day */}
          <div>
            <h4 className="font-mono text-xs uppercase font-bold text-tarmac-grey mb-2">
              Booked Experiences on this day ({selectedDayDetail.activitiesList.length}):
            </h4>
            {selectedDayDetail.activitiesList.length > 0 ? (
              <div className="space-y-1.5">
                {selectedDayDetail.activitiesList.map((act, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-runway-white rounded-lg border border-tarmac-grey/15 text-xs font-mono"
                  >
                    <span className="text-ink-navy font-semibold">{act.title}</span>
                    <span className="font-bold text-ink-navy">{formatCurrency(act.cost)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-tarmac-grey italic">No activities scheduled on this day.</p>
            )}
          </div>

          <div className="text-right pt-2 border-t border-tarmac-grey/15">
            <Button size="sm" variant="outline" onClick={() => setSelectedDayDetail(null)}>
              Close Day Inspector
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
