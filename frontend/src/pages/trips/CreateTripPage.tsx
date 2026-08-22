import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Calendar, 
  DollarSign, 
  ArrowRight, 
  UploadCloud, 
  Check 
} from 'lucide-react';
import { createTripSchema, CreateTripFormData } from '../../lib/schemas';
import { tripsService } from '../../services/trips';
import { citiesService } from '../../services/cities';
import { useUIStore } from '../../stores/uiStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { getTodayDateString, addDaysToDate } from '../../lib/dateUtils';
import confetti from 'canvas-confetti';

const COVER_PRESETS = [
  {
    name: 'Parisian Charm',
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Tokyo Neon & Temples',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Ancient Rome',
    url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Amsterdam Canals',
    url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Mediterranean Coast',
    url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
  },
];

export const CreateTripPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCityId = searchParams.get('city');
  const { showToast } = useUIStore();

  const today = getTodayDateString();
  const defaultEnd = addDaysToDate(today, 7);

  const [selectedCover, setSelectedCover] = useState(COVER_PRESETS[0].url);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTripFormData>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: today,
      endDate: defaultEnd,
      targetBudget: 2500,
      dailySpendThreshold: 250,
      coverImageUrl: COVER_PRESETS[0].url,
    },
  });

  const handleSelectPreset = (url: string) => {
    setSelectedCover(url);
    setValue('coverImageUrl', url);
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        setSelectedCover(previewUrl);
        setValue('coverImageUrl', previewUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CreateTripFormData) => {
    try {
      let initialStops: any[] = [];
      if (preselectedCityId) {
        const city = await citiesService.getCityById(preselectedCityId);
        if (city) {
          initialStops.push({
            id: `stp-${Date.now()}`,
            cityId: city.id,
            cityName: city.name,
            country: city.country,
            arrivalDate: data.startDate,
            departureDate: data.endDate,
            accommodationName: 'Central City Boutique Hotel',
            accommodationCostPerNight: 150,
            transportCostToStop: 0,
            transportMode: 'flight',
            order: 0,
            activities: [],
          });
        }
      }

      const createdTrip = await tripsService.createTrip({
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        targetBudget: data.targetBudget,
        dailySpendThreshold: data.dailySpendThreshold,
        coverImageUrl: selectedCover,
        stops: initialStops,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F4A300', '#0F8B8D', '#14213D'],
      });

      showToast('Itinerary Initialized', 'Welcome to the Builder. Add stops and activities.', 'success');
      navigate(`/trips/${createdTrip.id}/builder`);
    } catch (err: any) {
      showToast('Error Creating Trip', err.message || 'Please try again', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <span className="text-[11px] font-mono uppercase text-boarding-amber-700 bg-boarding-amber/20 px-2.5 py-0.5 rounded font-bold">
          DEPARTURE DOCUMENTATION
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink-navy mt-1">
          Charter a New Itinerary
        </h1>
        <p className="text-xs sm:text-sm text-tarmac-grey mt-1">
          Define your voyage timeframe, target budget parameters, and visual identity before mapping city stops.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-tarmac-grey/25 shadow-md p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Itinerary Title"
            placeholder="e.g. Autumn in Southern Europe"
            {...register('title')}
            error={errors.title?.message}
            helperText="Give your expedition a distinctive travel-pass title."
            monoLabel
          />

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[11px] font-semibold text-ink-navy/80 mb-1">
              Voyage Purpose & Notes
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="e.g. A 10-day cultural journey exploring art galleries, historic railways, and coastal gastronomy..."
              className="w-full rounded-md border border-tarmac-grey/30 bg-white text-ink-navy text-sm p-3 focus:outline-none focus:ring-2 focus:ring-boarding-amber placeholder-tarmac-grey/50"
            />
            {errors.description && (
              <p className="text-xs text-stamp-red mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-runway-white rounded-xl border border-tarmac-grey/20">
            <Input
              label="Departure Date (Start)"
              type="date"
              leftIcon={<Calendar className="w-4 h-4 text-boarding-amber" />}
              {...register('startDate')}
              error={errors.startDate?.message}
              monoLabel
            />

            <Input
              label="Return Date (End)"
              type="date"
              leftIcon={<Calendar className="w-4 h-4 text-signal-teal" />}
              {...register('endDate')}
              error={errors.endDate?.message}
              monoLabel
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Total Target Budget ($)"
              type="number"
              leftIcon={<DollarSign className="w-4 h-4 text-signal-teal" />}
              {...register('targetBudget', { valueAsNumber: true })}
              error={errors.targetBudget?.message}
              helperText="Overall estimated expenditure ceiling."
              monoLabel
            />

            <Input
              label="Daily Spend Threshold ($)"
              type="number"
              leftIcon={<DollarSign className="w-4 h-4 text-boarding-amber" />}
              {...register('dailySpendThreshold', { valueAsNumber: true })}
              error={errors.dailySpendThreshold?.message}
              helperText="Triggers Stamp-Red warning alerts when exceeded."
              monoLabel
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-tarmac-grey/15">
            <label className="block text-xs font-mono uppercase tracking-wider text-[11px] font-semibold text-ink-navy/80">
              Pass Cover Photo
            </label>

            <div className="relative h-44 rounded-xl overflow-hidden border border-tarmac-grey/25 bg-ink-navy shadow-inner">
              <img
                src={selectedCover}
                alt="Trip Cover Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-navy/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 bg-ink-navy/80 backdrop-blur-md px-3 py-1 rounded text-white font-mono text-xs border border-white/10">
                LIVE COVER PREVIEW
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {COVER_PRESETS.map((preset) => {
                const isSelected = selectedCover === preset.url;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`relative rounded-lg overflow-hidden h-16 border-2 transition-all group ${
                      isSelected ? 'border-boarding-amber ring-2 ring-boarding-amber' : 'border-tarmac-grey/30 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-center">
                      <span className="text-[10px] font-mono text-white font-bold leading-tight">
                        {preset.name}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-boarding-amber text-ink-navy rounded-full p-0.5 shadow">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-runway-white hover:bg-parchment border border-tarmac-grey/30 rounded-md text-xs font-mono text-ink-navy transition-colors">
                <UploadCloud className="w-4 h-4 text-signal-teal" />
                <span>Upload Custom Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomImageUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-tarmac-grey">
                (Upload JPG, PNG, or WebP cover photo)
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-tarmac-grey/20 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-xs font-mono text-tarmac-grey hover:text-ink-navy"
            >
              Cancel
            </button>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="font-bold shadow-md"
            >
              Open Itinerary Builder
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
