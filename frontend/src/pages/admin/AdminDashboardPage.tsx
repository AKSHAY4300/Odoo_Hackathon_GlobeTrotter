import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Shield, 
  ShieldAlert 
} from 'lucide-react';
import { adminService } from '../../services/admin';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../lib/currencyUtils';

export const AdminDashboardPage: React.FC = () => {
  const { user, switchRole } = useAuthStore();
  const { showToast } = useUIStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getAdminStats(),
  });

  const handleElevateToAdmin = async () => {
    await switchRole('admin');
    showToast('Admin Cleared', 'Elevated session to Platform Administrator', 'success');
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-tarmac-grey/25 shadow-xl text-center space-y-4 my-12">
        <div className="w-16 h-16 rounded-2xl bg-stamp-red/10 text-stamp-red flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-display font-bold text-2xl text-ink-navy">
          Restricted Flight Ops Hub
        </h2>
        <p className="text-xs sm:text-sm text-tarmac-grey">
          This dashboard requires <code>role: 'admin'</code> privileges to monitor network-wide itinerary volume, destination popularity, and platform analytics.
        </p>

        <div className="pt-2">
          <Button
            size="lg"
            variant="primary"
            leftIcon={<Shield className="w-5 h-5" />}
            onClick={handleElevateToAdmin}
            className="font-bold shadow"
          >
            Switch to Admin Role for Review
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
        <div className="h-64 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Admin Departure Header */}
      <div className="bg-ink-navy text-runway-white p-6 sm:p-8 rounded-3xl border border-ink-navy-700 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-boarding-amber/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-boarding-amber text-ink-navy font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                OPS TERMINAL CONTROL
              </span>
              <span className="text-xs font-mono text-tarmac-grey-300">
                ACTIVE ADMIN: {user.name}
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-4xl text-white">
              GlobeTrotter Platform Analytics
            </h1>
            <p className="text-xs sm:text-sm text-tarmac-grey-300">
              Live telemetry monitoring multi-city itinerary generation, booking volume, and popular routes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="amber" size="md">
              SYSTEM HEALTH: 100% OPERATIONAL
            </Badge>
          </div>
        </div>

        {/* 4 Core Stat Cards */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-tarmac-grey-300 block">Total Itineraries</span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1 block">
              {stats.totalTrips} Trips
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-tarmac-grey-300 block">Active Travelers</span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-boarding-amber mt-1 block">
              {stats.activeTravelers} Passports
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-tarmac-grey-300 block">Total Budget Volume</span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-signal-teal mt-1 block">
              {formatCurrency(stats.totalBudgetVolume)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-tarmac-grey-300 block">Avg Voyage Duration</span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1 block">
              {stats.avgTripDurationDays} Days
            </span>
          </div>
        </div>
      </div>

      {/* Trips Creation Over Time Area Chart */}
      <div className="bg-white p-6 rounded-2xl border border-tarmac-grey/20 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-xl text-ink-navy">
              Voyage Creation Growth
            </h3>
            <p className="text-xs text-tarmac-grey mt-0.5">
              Monthly trend of multi-city itineraries planned on the platform
            </p>
          </div>
          <span className="text-xs font-mono text-signal-teal font-bold bg-signal-teal/10 px-2.5 py-1 rounded">
            +38% vs prior quarter
          </span>
        </div>

        <div className="h-72 my-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.tripsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tripGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F4A300" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F4A300" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'IBM Plex Mono' }} 
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'IBM Plex Mono' }} 
              />
              <Tooltip
                formatter={(value: number) => [`${value} Trips`, 'Created']}
                contentStyle={{
                  backgroundColor: '#14213D',
                  borderRadius: '8px',
                  color: '#FAFAF7',
                  border: 'none',
                  fontSize: '12px',
                  fontFamily: 'IBM Plex Mono',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#F4A300"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#tripGrowth)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Tables: Top Cities & Top Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-tarmac-grey/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-ink-navy">
              Top Destination Stops
            </h3>
            <span className="text-xs font-mono text-tarmac-grey">Ranked by stop frequency</span>
          </div>

          <div className="divide-y divide-tarmac-grey/15">
            {stats.topCities.map((city, idx) => (
              <div key={city.cityId} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 font-mono font-bold text-xs text-tarmac-grey">
                    #{idx + 1}
                  </span>
                  <img
                    src={city.imageUrl}
                    alt={city.name}
                    className="w-10 h-10 rounded-lg object-cover border border-tarmac-grey/20"
                  />
                  <div>
                    <h5 className="font-display font-bold text-sm text-ink-navy">
                      {city.name}
                    </h5>
                    <span className="text-xs font-mono text-tarmac-grey">
                      {city.country}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-ink-navy block">
                    {city.visitCount} Stops Added
                  </span>
                  <span className="text-[10px] font-mono text-boarding-amber font-semibold">
                    {city.popularity}% Popularity
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-tarmac-grey/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-ink-navy">
              Top Experiences Booked
            </h3>
            <span className="text-xs font-mono text-tarmac-grey">Ranked by itinerary inclusion</span>
          </div>

          <div className="divide-y divide-tarmac-grey/15">
            {stats.topActivities.map((act, idx) => (
              <div key={act.activityId} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 font-mono font-bold text-xs text-tarmac-grey">
                    #{idx + 1}
                  </span>
                  <div>
                    <h5 className="font-display font-bold text-sm text-ink-navy line-clamp-1">
                      {act.name}
                    </h5>
                    <span className="text-xs font-mono text-signal-teal uppercase">
                      {act.category}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-ink-navy block">
                    {act.bookingCount} Planners
                  </span>
                  <span className="text-[10px] font-mono text-tarmac-grey">
                    Avg {formatCurrency(act.avgCost)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
