import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Trash2, 
  Star, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { profileSchema, ProfileFormData } from '../../lib/schemas';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { citiesService } from '../../services/cities';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { CityCard } from '../../components/trip/CityCard';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, toggleSavedCity, logout } = useAuthStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: user ? {
      name: user.name,
      email: user.email,
      preferredCurrency: user.preferredCurrency,
      language: user.language,
      bio: user.bio,
    } : undefined,
  });

  const { data: allCities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => citiesService.getCities(),
  });

  const savedCities = allCities.filter((c) => user?.savedCityIds.includes(c.id));

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data);
      showToast('Profile Updated', 'Passport records successfully refreshed.', 'success');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Sync latest destination cities, voyages, and curated experiences?')) {
      await queryClient.invalidateQueries();
      showToast('Data Synced', 'Portfolio cache successfully refreshed from live database.', 'success');
    }
  };

  const handleDeleteAccount = async () => {
    showToast('Account Logged Out', 'Traveler session ended.', 'info');
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Passport Profile Header Card */}
      <div className="bg-ink-navy text-runway-white rounded-3xl p-6 sm:p-8 border border-ink-navy-700 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-boarding-amber/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with Metallic Border */}
          <div className="relative">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={user?.name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-boarding-amber shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2 bg-boarding-amber text-ink-navy p-1 rounded-full shadow">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Profile Bio Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
                {user?.name}
              </h1>
              <Badge variant="amber" size="sm">
                {user?.role?.toUpperCase()} PASS
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-tarmac-grey-300 max-w-xl">
              {user?.bio || 'Global explorer, architectural enthusiast, and route planner.'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-mono text-tarmac-grey-300">
              <div>EMAIL: <span className="text-white">{user?.email}</span></div>
              <div>CURRENCY: <span className="text-boarding-amber font-bold">{user?.preferredCurrency}</span></div>
              <div>LANGUAGE: <span className="text-signal-teal font-bold">{user?.language}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white rounded-2xl border border-tarmac-grey/25 shadow-md p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-[11px] font-mono uppercase text-boarding-amber-700 bg-boarding-amber/20 px-2.5 py-0.5 rounded font-bold">
            PASSPORT PARTICULARS
          </span>
          <h2 className="font-display font-bold text-2xl text-ink-navy mt-1">
            Personal & Travel Preferences
          </h2>
          <p className="text-xs text-tarmac-grey mt-0.5">
            Manage your traveler credentials and localized currency formats.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              {...register('name')}
              error={errors.name?.message}
              monoLabel
            />
            <Input
              label="Email Address"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              monoLabel
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[11px] font-semibold text-ink-navy/80 mb-1">
                Preferred Currency
              </label>
              <select
                {...register('preferredCurrency')}
                className="w-full rounded-md border border-tarmac-grey/30 bg-white text-ink-navy text-sm p-2.5 focus:ring-2 focus:ring-boarding-amber focus:outline-none"
              >
                <option value="USD">USD ($) — United States Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="JPY">JPY (¥) — Japanese Yen</option>
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="AUD">AUD ($) — Australian Dollar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[11px] font-semibold text-ink-navy/80 mb-1">
                Interface Language
              </label>
              <select
                {...register('language')}
                className="w-full rounded-md border border-tarmac-grey/30 bg-white text-ink-navy text-sm p-2.5 focus:ring-2 focus:ring-boarding-amber focus:outline-none"
              >
                <option value="English (US)">English (US)</option>
                <option value="English (UK)">English (UK)</option>
                <option value="French">Français</option>
                <option value="Spanish">Español</option>
                <option value="German">Deutsch</option>
                <option value="Japanese">日本語</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[11px] font-semibold text-ink-navy/80 mb-1">
              Traveler Bio & Exploration Motto
            </label>
            <textarea
              {...register('bio')}
              rows={3}
              className="w-full rounded-md border border-tarmac-grey/30 bg-white text-ink-navy text-sm p-3 focus:ring-2 focus:ring-boarding-amber focus:outline-none placeholder-tarmac-grey/50"
              placeholder="Tell fellow travelers about your travel style, dream destinations, or culinary obsessions..."
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-tarmac-grey/15">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isSubmitting}
              className="font-bold shadow"
            >
              Save Passport Details
            </Button>
          </div>
        </form>
      </div>

      {/* Saved Destination Cities Section */}
      <div className="bg-white rounded-2xl border border-tarmac-grey/25 shadow-md p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-xl text-ink-navy flex items-center gap-2">
              <Star className="w-5 h-5 text-boarding-amber fill-boarding-amber" />
              <span>Saved Destination Watchlist</span>
            </h3>
            <p className="text-xs text-tarmac-grey mt-0.5">
              Cities pinned for future multi-city expedition charters
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-ink-navy bg-cream-sand px-2.5 py-1 rounded">
            {savedCities.length} Pinned
          </span>
        </div>

        {savedCities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {savedCities.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                isSaved={true}
                onToggleSave={toggleSavedCity}
                actionLabel="Charter Route"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-tarmac-grey/25 rounded-xl p-4">
            <p className="text-xs text-tarmac-grey">
              No destination cities bookmarked yet. Explore destinations to save favorites.
            </p>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-stamp-red/30 shadow-sm p-6 space-y-4">
        <h4 className="font-display font-bold text-base text-stamp-red">
          System Maintenance & Danger Zone
        </h4>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-tarmac-grey/15">
          <div>
            <h5 className="font-bold text-xs text-ink-navy font-mono">Sync Live Telemetry</h5>
            <p className="text-[11px] text-tarmac-grey">
              Refreshes destination cities, popular routes, and portfolio data from the live database.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-signal-teal" />}
            onClick={handleResetData}
          >
            Sync Database
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-tarmac-grey/15">
          <div>
            <h5 className="font-bold text-xs text-stamp-red font-mono">Sign Out / End Session</h5>
            <p className="text-[11px] text-tarmac-grey">
              Safely logs out and clears stored session tokens.
            </p>
          </div>
          <Button
            size="sm"
            variant="danger"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => setDeleteModalOpen(true)}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Sign Out of Passport"
        subtitle="End your current session"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-stamp-red/10 border border-stamp-red/30 rounded-lg flex items-start gap-2.5 text-xs text-stamp-red">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Are you sure you want to end your active session and sign out?</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={handleDeleteAccount}>
              Confirm Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
