import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
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
import { mockStore } from '../../services/store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { CityCard } from '../../components/trip/CityCard';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, toggleSavedCity, logout } = useAuthStore();
  const { showToast } = useUIStore();
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

  const handleResetData = () => {
    if (window.confirm('Restore sample itineraries, destination cities, and curated experiences?')) {
      mockStore.reset();
      window.location.reload();
    }
  };

  const handleDeleteAccount = async () => {
    showToast('Account Deleted', 'Traveler profile removed.', 'info');
    await logout();
    window.location.href = '/signup';
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

            <p className="text-xs font-mono text-tarmac-grey-300">
              PASSPORT ID: {user?.id.toUpperCase()} • STAMPED SINCE 2026
            </p>

            <p className="text-xs sm:text-sm text-tarmac-grey-200 max-w-xl">
              {user?.bio || 'Global explorer, architectural enthusiast, and route planner.'}
            </p>

            {/* Passport Stamps Badges */}
            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-mono">
              <span className="passport-stamp text-[11px] bg-white/5">
                18 COUNTRIES STAMPED
              </span>
              <span className="passport-stamp text-[11px] text-boarding-amber border-boarding-amber bg-white/5">
                GOLD MEDALLION
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form & Settings */}
      <div className="bg-white rounded-2xl border border-tarmac-grey/25 p-6 sm:p-8 shadow-sm">
        <h2 className="font-display font-bold text-xl text-ink-navy mb-4">
          Traveler Credentials & Preferences
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                className="w-full rounded-md border border-tarmac-grey/30 bg-white text-ink-navy text-sm p-2 focus:ring-2 focus:ring-boarding-amber focus:outline-none font-mono"
              >
                <option value="USD">USD ($) — United States Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="JPY">JPY (¥) — Japanese Yen</option>
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="AUD">AUD (A$) — Australian Dollar</option>
              </select>
            </div>

            <Input
              label="Preferred Language"
              {...register('language')}
              error={errors.language?.message}
              monoLabel
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[11px] font-semibold text-ink-navy/80 mb-1">
              Travel Bio & Notes
            </label>
            <textarea
              {...register('bio')}
              rows={3}
              className="w-full rounded-md border border-tarmac-grey/30 bg-white text-ink-navy text-sm p-2.5 focus:ring-2 focus:ring-boarding-amber focus:outline-none"
              placeholder="Tell other travelers about your preferred travel style..."
            />
            {errors.bio && <p className="text-xs text-stamp-red mt-1">{errors.bio.message}</p>}
          </div>

          <div className="pt-3 border-t border-tarmac-grey/15 flex items-center justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="font-bold"
            >
              Save Profile Updates
            </Button>
          </div>
        </form>
      </div>

      {/* Saved Destinations / Bucket List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-ink-navy flex items-center gap-2">
              <Star className="w-5 h-5 text-boarding-amber fill-current" />
              <span>Saved Bucket List Destinations ({savedCities.length})</span>
            </h2>
            <p className="text-xs text-tarmac-grey mt-0.5">
              Destinations bookmarked for your next multi-city circuit.
            </p>
          </div>
        </div>

        {savedCities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedCities.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                isSaved={true}
                onToggleSave={toggleSavedCity}
                actionLabel="Plan with this City"
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-tarmac-grey/25 text-xs text-tarmac-grey">
            No destinations saved yet. Explore cities to star favorites.
          </div>
        )}
      </div>

      {/* System Maintenance & Account Deletion */}
      <div className="bg-white rounded-2xl border border-tarmac-grey/25 p-6 shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-ink-navy">
          Platform Storage & Danger Zone
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-tarmac-grey/15">
          <div>
            <h5 className="font-bold text-xs text-ink-navy font-mono">Restore Sample Itineraries</h5>
            <p className="text-[11px] text-tarmac-grey">
              Restores initial sample destination cities, popular routes, and curated experiences.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-signal-teal" />}
            onClick={handleResetData}
          >
            Restore Sample Data
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-tarmac-grey/15">
          <div>
            <h5 className="font-bold text-xs text-stamp-red font-mono">Delete Traveler Account</h5>
            <p className="text-[11px] text-tarmac-grey">
              Permanently revokes this passport and associated itineraries.
            </p>
          </div>
          <Button
            size="sm"
            variant="danger"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete Passport
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Revoke & Delete Passport"
        subtitle="This action cannot be undone"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-stamp-red/10 border border-stamp-red/30 rounded-lg flex items-start gap-2.5 text-xs text-stamp-red">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Are you sure you want to permanently delete your traveler account and all planned voyages?</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={handleDeleteAccount}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
