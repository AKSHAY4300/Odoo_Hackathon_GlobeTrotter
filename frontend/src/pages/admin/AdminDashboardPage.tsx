import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  ShieldAlert, 
  Users, 
  Compass, 
  TrendingUp, 
  RefreshCw, 
  ExternalLink,
  Lock
} from 'lucide-react';
import { adminService } from '../../services/admin';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../lib/currencyUtils';

type AdminTab = 'overview' | 'users' | 'trips';

export const AdminDashboardPage: React.FC = () => {
  const { user, switchRole, login } = useAuthStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isElevating, setIsElevating] = useState(false);

  const isAdmin = user?.role === 'admin';

  // 1. Telemetry Stats Query
  const { 
    data: stats, 
    isLoading: isLoadingStats, 
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getAdminStats(),
    enabled: isAdmin,
    retry: 1,
  });

  // 2. All Users Query
  const { 
    data: usersList = [], 
    isLoading: isLoadingUsers,
    refetch: refetchUsers 
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.getAllUsers(),
    enabled: isAdmin && activeTab === 'users',
  });

  // 3. All Trips Query
  const { 
    data: tripsList = [], 
    isLoading: isLoadingTrips,
    refetch: refetchTrips 
  } = useQuery({
    queryKey: ['admin-trips'],
    queryFn: () => adminService.getAllTrips(),
    enabled: isAdmin && activeTab === 'trips',
  });

  const handleElevateToAdmin = async () => {
    try {
      setIsElevating(true);
      await switchRole('admin');
      await queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-trips'] });
      showToast('Admin Cleared', 'Elevated session to Platform Administrator with active JWT token', 'success');
    } catch (err: any) {
      showToast('Elevation Failed', err?.message || 'Could not elevate to admin', 'error');
    } finally {
      setIsElevating(false);
    }
  };

  const handleDemoteToTraveler = async () => {
    try {
      setIsElevating(true);
      await switchRole('traveler');
      showToast('Traveler Mode', 'Switched session back to standard traveler profile', 'info');
    } catch (err: any) {
      showToast('Role Switch Failed', err?.message || 'Could not switch role', 'error');
    } finally {
      setIsElevating(false);
    }
  };

  const handleLoginAsAdmin = async () => {
    try {
      setIsElevating(true);
      await login('admin@globetrotter.io', 'password123');
      await queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      showToast('Admin Logged In', 'Authenticated as root platform administrator (admin@globetrotter.io)', 'success');
    } catch (err: any) {
      showToast('Login Failed', err?.message || 'Failed to login as admin', 'error');
    } finally {
      setIsElevating(false);
    }
  };

  // RESTRICTED ACCESS SCREEN
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-12 space-y-6">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-tarmac-grey/20 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-stamp-red/10 text-stamp-red flex items-center justify-center mx-auto ring-8 ring-stamp-red/5">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <Badge variant="red" size="md">
              ROLE RESTRICTION ENFORCED
            </Badge>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink-navy">
              Restricted Flight Ops Hub
            </h2>
            <p className="text-xs sm:text-sm text-tarmac-grey max-w-lg mx-auto">
              This operations dashboard is restricted to accounts with <code>role: 'admin'</code> privileges to monitor network-wide itinerary volume, destination popularity, and traveler analytics.
            </p>
          </div>

          <div className="bg-cream-sand/60 p-4 rounded-2xl border border-tarmac-grey/15 text-left text-xs font-mono space-y-1 text-ink-navy/80">
            <div>Current Account: <strong className="text-ink-navy">{user?.email || 'Guest'}</strong></div>
            <div>Current Role: <span className="text-stamp-red font-bold uppercase">{user?.role || 'None'}</span></div>
            <div>Required Role: <span className="text-signal-teal font-bold uppercase">admin</span></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button
              size="lg"
              variant="primary"
              leftIcon={<Shield className="w-5 h-5" />}
              onClick={handleElevateToAdmin}
              isLoading={isElevating}
              className="font-bold shadow w-full"
            >
              Elevate Role to Admin
            </Button>

            <Button
              size="lg"
              variant="outline"
              leftIcon={<Lock className="w-4 h-4" />}
              onClick={handleLoginAsAdmin}
              isLoading={isElevating}
              className="font-semibold text-xs sm:text-sm w-full"
            >
              Sign In as admin@globetrotter.io
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // LOADING STATE
  if (isLoadingStats && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-44 bg-white rounded-3xl animate-pulse border border-tarmac-grey/20" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-tarmac-grey/20" />
          ))}
        </div>
        <div className="h-80 bg-white rounded-2xl animate-pulse border border-tarmac-grey/20" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Operations Header */}
      <div className="bg-ink-navy text-runway-white p-6 sm:p-8 rounded-3xl border border-ink-navy-700 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-boarding-amber/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-boarding-amber text-ink-navy font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                OPS TERMINAL CONTROL
              </span>
              <span className="text-xs font-mono text-tarmac-grey-300">
                ADMIN: {user?.name || 'Administrator'} ({user?.email})
              </span>
              <span className="text-xs font-mono text-boarding-amber font-semibold hidden sm:inline">
                • ARCHITECT: AKSHAY
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-4xl text-white">
              GlobeTrotter Platform Analytics
            </h1>
            <p className="text-xs sm:text-sm text-tarmac-grey-300">
              Live telemetry monitoring multi-city itinerary generation, booking volume, and popular routes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDemoteToTraveler}
              className="text-xs font-mono bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Switch to Traveler View
            </Button>

            <Button
              size="sm"
              variant="secondary"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => {
                refetchStats();
                if (activeTab === 'users') refetchUsers();
                if (activeTab === 'trips') refetchTrips();
                showToast('Refreshed', 'Telemetry synchronization complete', 'info');
              }}
              className="text-xs font-mono"
            >
              Sync Live
            </Button>
          </div>
        </div>

        {/* 4 Core Stat Cards */}
        {stats && (
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] font-mono uppercase text-tarmac-grey-300 block">Total Itineraries</span>
              <span className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1 block">
                {stats.totalTrips} Trips
              </span>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] font-mono uppercase text-tarmac-grey-300 block">Active Travelers</span>
              <span className="text-2xl sm:text-3xl font-mono font-bold text-boarding-amber mt-1 block">
                {stats.activeTravelers} Passports
              </span>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] font-mono uppercase text-tarmac-grey-300 block">Total Budget Volume</span>
              <span className="text-2xl sm:text-3xl font-mono font-bold text-signal-teal mt-1 block">
                {formatCurrency(stats.totalBudgetVolume)}
              </span>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] font-mono uppercase text-tarmac-grey-300 block">Avg Voyage Duration</span>
              <span className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1 block">
                {stats.avgTripDurationDays} Days
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-tarmac-grey/20 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-ink-navy text-white shadow'
              : 'text-ink-navy hover:bg-white border border-transparent'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Overview & Telemetry
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-ink-navy text-white shadow'
              : 'text-ink-navy hover:bg-white border border-transparent'
          }`}
        >
          <Users className="w-4 h-4" />
          Travelers & Passports
        </button>

        <button
          onClick={() => setActiveTab('trips')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-bold transition-all ${
            activeTab === 'trips'
              ? 'bg-ink-navy text-white shadow'
              : 'text-ink-navy hover:bg-white border border-transparent'
          }`}
        >
          <Compass className="w-4 h-4" />
          Flight Network (All Trips)
        </button>
      </div>

      {/* TAB 1: OVERVIEW & TELEMETRY */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
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
            {/* Top Destinations */}
            <div className="bg-white p-6 rounded-2xl border border-tarmac-grey/20 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-ink-navy">
                  Top Destination Stops
                </h3>
                <span className="text-xs font-mono text-tarmac-grey">Ranked by stop frequency</span>
              </div>

              <div className="divide-y divide-tarmac-grey/15">
                {stats.topCities.map((city, idx) => (
                  <div key={city.cityId || idx} className="py-3 flex items-center justify-between gap-3">
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

            {/* Top Activities */}
            <div className="bg-white p-6 rounded-2xl border border-tarmac-grey/20 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-ink-navy">
                  Top Experiences Booked
                </h3>
                <span className="text-xs font-mono text-tarmac-grey">Ranked by itinerary inclusion</span>
              </div>

              <div className="divide-y divide-tarmac-grey/15">
                {stats.topActivities.map((act, idx) => (
                  <div key={act.activityId || idx} className="py-3 flex items-center justify-between gap-3">
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
      )}

      {/* TAB 2: REGISTERED TRAVELERS (LIVE API /api/admin/users) */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-2xl border border-tarmac-grey/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-xl text-ink-navy">
                Registered Travelers ({usersList.length})
              </h3>
              <p className="text-xs text-tarmac-grey">
                Live user accounts currently registered in the MongoDB database
              </p>
            </div>
            <Badge variant="teal" size="md">
              LIVE DATA
            </Badge>
          </div>

          {isLoadingUsers ? (
            <div className="py-12 text-center text-tarmac-grey font-mono text-xs">
              Loading traveler accounts...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-tarmac-grey/20 text-tarmac-grey font-mono uppercase text-[10px]">
                    <th className="py-3 px-2">Traveler</th>
                    <th className="py-3 px-2">Email</th>
                    <th className="py-3 px-2">Role</th>
                    <th className="py-3 px-2">Currency</th>
                    <th className="py-3 px-2">Saved Cities</th>
                    <th className="py-3 px-2">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tarmac-grey/10 font-mono">
                  {usersList.map((u: any) => (
                    <tr key={u.id || u._id} className="hover:bg-cream-sand/30">
                      <td className="py-3 px-2 flex items-center gap-2 font-sans font-semibold text-ink-navy">
                        <img
                          src={u.avatar || u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover border border-tarmac-grey/20"
                        />
                        {u.name}
                      </td>
                      <td className="py-3 px-2 text-tarmac-grey">{u.email}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-stamp-red/10 text-stamp-red' : 'bg-signal-teal/10 text-signal-teal'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-ink-navy">{u.preferredCurrency || 'USD'}</td>
                      <td className="py-3 px-2 text-boarding-amber font-bold">
                        {(u.savedCityIds || []).length} cities
                      </td>
                      <td className="py-3 px-2 text-tarmac-grey">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALL ITINERARIES (LIVE API /api/admin/trips) */}
      {activeTab === 'trips' && (
        <div className="bg-white p-6 rounded-2xl border border-tarmac-grey/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-xl text-ink-navy">
                Global Itinerary Network ({tripsList.length})
              </h3>
              <p className="text-xs text-tarmac-grey">
                All multi-city voyages generated across the platform
              </p>
            </div>
            <Badge variant="amber" size="md">
              LIVE DATABASE
            </Badge>
          </div>

          {isLoadingTrips ? (
            <div className="py-12 text-center text-tarmac-grey font-mono text-xs">
              Loading platform voyages...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-tarmac-grey/20 text-tarmac-grey font-mono uppercase text-[10px]">
                    <th className="py-3 px-2">Voyage Title</th>
                    <th className="py-3 px-2">Travel Dates</th>
                    <th className="py-3 px-2">Target Budget</th>
                    <th className="py-3 px-2">Visibility</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tarmac-grey/10 font-mono">
                  {tripsList.map((t: any) => (
                    <tr key={t.id || t._id} className="hover:bg-cream-sand/30">
                      <td className="py-3 px-2 font-sans font-bold text-ink-navy">
                        <div className="flex items-center gap-2">
                          <img
                            src={t.coverImageUrl || t.coverPhotoUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=100&q=80'}
                            alt={t.title || t.name}
                            className="w-8 h-8 rounded-lg object-cover border border-tarmac-grey/20"
                          />
                          <div>
                            <div>{t.title || t.name}</div>
                            <div className="text-[10px] text-tarmac-grey font-mono font-normal">
                              Creator: {t.userId?.name || 'Traveler'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-tarmac-grey">
                        {t.startDate} → {t.endDate}
                      </td>
                      <td className="py-3 px-2 text-signal-teal font-bold">
                        {formatCurrency(t.targetBudget || 2500)}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.isPublic ? 'bg-signal-teal/10 text-signal-teal' : 'bg-tarmac-grey/10 text-tarmac-grey'
                        }`}>
                          {t.isPublic ? 'Public Pass' : 'Private'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-ink-navy capitalize">
                        {t.status || 'upcoming'}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <a
                          href={`/trips/${t.id || t._id}`}
                          className="inline-flex items-center gap-1 text-[11px] text-boarding-amber hover:underline font-bold"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
