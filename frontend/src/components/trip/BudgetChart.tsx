import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { AlertTriangle, Calendar } from 'lucide-react';
import { BudgetBreakdown, DailySpend } from '../../lib/types';
import { formatCurrency } from '../../lib/currencyUtils';
import { formatDate } from '../../lib/dateUtils';
import { Badge } from '../ui/Badge';

interface BudgetChartProps {
  breakdown: BudgetBreakdown;
  onSelectDay?: (day: DailySpend) => void;
}

export const BudgetChart: React.FC<BudgetChartProps> = ({ breakdown, onSelectDay }) => {
  const {
    totalEstimated,
    targetBudget,
    dailySpendThreshold,
    categoryBreakdown,
    dailySpends,
    overBudgetDays,
  } = breakdown;

  const isOverallOverBudget = totalEstimated > targetBudget;
  const budgetUtilization = targetBudget > 0 ? Math.round((totalEstimated / targetBudget) * 100) : 0;

  const barChartData = dailySpends.map((d) => ({
    dateStr: d.date,
    dayLabel: `Day ${d.dayNumber}`,
    formattedDate: formatDate(d.date, 'MMM d'),
    city: d.cityName,
    totalCost: d.totalDayCost,
    isOver: d.isOverThreshold,
    activitiesCost: d.activitiesCost,
    stayCost: d.accommodationCost,
    transitCost: d.transportCost,
  }));

  return (
    <div className="space-y-6">
      {overBudgetDays.length > 0 && (
        <div className="bg-stamp-red/10 border-2 border-stamp-red/30 rounded-xl p-4 md:p-5 flex items-start gap-3.5 shadow-sm">
          <div className="p-2 bg-stamp-red text-white rounded-lg shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-display font-bold text-stamp-red text-base md:text-lg">
                Daily Budget Exceeded Alert
              </h4>
              <Badge variant="red" size="sm">
                {overBudgetDays.length} {overBudgetDays.length === 1 ? 'Day Alert' : 'Days Alert'}
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-ink-navy/80 mt-1">
              The following itinerary days exceed your configured daily cap of{' '}
              <strong className="font-mono">{formatCurrency(dailySpendThreshold)}</strong>:
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {overBudgetDays.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => onSelectDay && onSelectDay(d)}
                  className="inline-flex items-center gap-1.5 bg-white border border-stamp-red/40 px-2.5 py-1 rounded text-xs font-mono font-medium text-stamp-red hover:bg-stamp-red/10 transition-colors"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Day {d.dayNumber} ({formatDate(d.date, 'MMM d')} - {d.cityName}): </span>
                  <strong className="font-bold">{formatCurrency(d.totalDayCost)}</strong>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-tarmac-grey/20 shadow-sm">
          <span className="text-[11px] font-mono uppercase text-tarmac-grey block">Total Estimated</span>
          <div className="flex items-center gap-1 mt-1 text-xl md:text-2xl font-display font-bold text-ink-navy">
            <span>{formatCurrency(totalEstimated)}</span>
          </div>
          <span className="text-[11px] font-mono text-tarmac-grey mt-1 block">
            {budgetUtilization}% of {formatCurrency(targetBudget)} target
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-tarmac-grey/20 shadow-sm">
          <span className="text-[11px] font-mono uppercase text-tarmac-grey block">Target Budget</span>
          <div className="flex items-center gap-1 mt-1 text-xl md:text-2xl font-display font-bold text-signal-teal">
            <span>{formatCurrency(targetBudget)}</span>
          </div>
          <span className={`text-[11px] font-mono mt-1 block ${isOverallOverBudget ? 'text-stamp-red font-semibold' : 'text-signal-teal'}`}>
            {isOverallOverBudget ? `Over by ${formatCurrency(totalEstimated - targetBudget)}` : `Remaining ${formatCurrency(targetBudget - totalEstimated)}`}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-tarmac-grey/20 shadow-sm">
          <span className="text-[11px] font-mono uppercase text-tarmac-grey block">Daily Limit Cap</span>
          <div className="flex items-center gap-1 mt-1 text-xl md:text-2xl font-display font-bold text-boarding-amber">
            <span>{formatCurrency(dailySpendThreshold)}</span>
          </div>
          <span className="text-[11px] font-mono text-tarmac-grey mt-1 block">
            Per day threshold
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-tarmac-grey/20 shadow-sm">
          <span className="text-[11px] font-mono uppercase text-tarmac-grey block">Over-Budget Days</span>
          <div className={`flex items-center gap-1 mt-1 text-xl md:text-2xl font-display font-bold ${overBudgetDays.length > 0 ? 'text-stamp-red' : 'text-signal-teal'}`}>
            <span>{overBudgetDays.length}</span>
          </div>
          <span className="text-[11px] font-mono text-tarmac-grey mt-1 block">
            {overBudgetDays.length === 0 ? 'All within limit' : 'Action recommended'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-tarmac-grey/20 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-display font-bold text-lg text-ink-navy">
              Expense Allocation
            </h4>
            <p className="text-xs text-tarmac-grey mt-0.5">
              Breakdown across major travel categories
            </p>
          </div>

          <div className="h-64 my-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="amount"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Estimated']}
                  contentStyle={{
                    backgroundColor: '#14213D',
                    borderRadius: '8px',
                    color: '#FAFAF7',
                    border: 'none',
                    fontSize: '12px',
                    fontFamily: 'IBM Plex Mono',
                  }}
                  itemStyle={{ color: '#F4A300' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-mono uppercase text-tarmac-grey">Total Spend</span>
              <span className="text-lg font-bold font-mono text-ink-navy">{formatCurrency(totalEstimated)}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-tarmac-grey/15">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: cat.color }} />
                  <span className="text-ink-navy font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-tarmac-grey">{cat.percentage}%</span>
                  <span className="font-bold text-ink-navy">{formatCurrency(cat.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-tarmac-grey/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-display font-bold text-lg text-ink-navy">
                Daily Spend Timeline
              </h4>
              <p className="text-xs text-tarmac-grey mt-0.5">
                Estimated day-by-day burn with threshold reference line
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-stamp-red" />
              <span className="text-tarmac-grey">Over Cap</span>
            </div>
          </div>

          <div className="h-72 my-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 15, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="dayLabel" 
                  tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'IBM Plex Mono' }} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'IBM Plex Mono' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(20, 33, 61, 0.04)' }}
                  formatter={(val: number, name: string) => [formatCurrency(val), name]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${label} (${data.formattedDate}) — ${data.city}`;
                    }
                    return label;
                  }}
                  contentStyle={{
                    backgroundColor: '#14213D',
                    borderRadius: '8px',
                    color: '#FAFAF7',
                    border: 'none',
                    fontSize: '12px',
                    fontFamily: 'IBM Plex Mono',
                  }}
                />
                <ReferenceLine 
                  y={dailySpendThreshold} 
                  stroke="#D64545" 
                  strokeDasharray="4 4" 
                  label={{ 
                    value: `Limit: $${dailySpendThreshold}`, 
                    fill: '#D64545', 
                    fontSize: 10, 
                    position: 'top',
                    fontFamily: 'IBM Plex Mono' 
                  }} 
                />
                <Bar 
                  dataKey="totalCost" 
                  name="Total Day Cost"
                  radius={[4, 4, 0, 0]}
                  onClick={(data) => {
                    const found = dailySpends.find((d) => d.date === data.dateStr);
                    if (found && onSelectDay) onSelectDay(found);
                  }}
                >
                  {barChartData.map((entry, index) => (
                    <Cell 
                      key={`bar-${index}`} 
                      fill={entry.isOver ? '#D64545' : '#0F8B8D'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-runway-white p-3 rounded-lg border border-tarmac-grey/15 text-xs text-tarmac-grey flex items-center justify-between">
            <span>Tip: Click on any chart bar to inspect daily activities and expense drivers.</span>
            <span className="font-mono text-signal-teal font-semibold">Live Reactive Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
