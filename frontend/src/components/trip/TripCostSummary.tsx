import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Trip } from '../../lib/types';
import { budgetService } from '../../services/budget';
import { formatCurrency } from '../../lib/currencyUtils';

interface TripCostSummaryProps {
  trip: Trip;
  className?: string;
}

export const TripCostSummary: React.FC<TripCostSummaryProps> = ({ trip, className = '' }) => {
  const breakdown = budgetService.calculateBudgetSynchronous(trip);
  const { totalEstimated, targetBudget, overBudgetDays } = breakdown;
  const isOver = totalEstimated > targetBudget;
  const percentUsed = targetBudget > 0 ? Math.min(100, Math.round((totalEstimated / targetBudget) * 100)) : 0;

  return (
    <div className={`bg-ink-navy text-runway-white p-4 rounded-xl shadow-md border border-ink-navy-700 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-boarding-amber" />
          <span className="text-xs font-mono uppercase tracking-wider text-tarmac-grey-300">
            Trip Budget Live Tracker
          </span>
        </div>
        <Link
          to={`/trips/${trip.id}/budget`}
          className="text-xs font-mono text-boarding-amber hover:underline flex items-center gap-1"
        >
          <span>Deep Breakdown</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div>
          <span className="text-xl md:text-2xl font-display font-bold text-runway-white">
            {formatCurrency(totalEstimated)}
          </span>
          <span className="text-xs font-mono text-tarmac-grey-300 ml-2">
            / {formatCurrency(targetBudget)}
          </span>
        </div>

        <span className={`text-xs font-mono font-bold ${isOver ? 'text-stamp-red' : 'text-signal-teal'}`}>
          {isOver ? `+${formatCurrency(totalEstimated - targetBudget)} over` : `${100 - percentUsed}% remaining`}
        </span>
      </div>

      <div className="w-full bg-ink-navy-950 h-2 rounded-full mt-2 overflow-hidden border border-white/10">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isOver ? 'bg-stamp-red' : 'bg-boarding-amber'
          }`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      {overBudgetDays.length > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-stamp-red font-mono bg-stamp-red/10 px-2 py-1 rounded border border-stamp-red/30">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{overBudgetDays.length} day(s) exceed daily cap ({formatCurrency(trip.dailySpendThreshold)})</span>
        </div>
      )}
    </div>
  );
};
