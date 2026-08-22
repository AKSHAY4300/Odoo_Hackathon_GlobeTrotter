import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Calendar, 
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
    name: 'Rajasthan Heritage',
    url: 'https://images.unsplash.com/photo-1603258849062-103328e100f9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Kerala Backwaters',
    url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Taj Mahal Sunrise',
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Dubai Skyline',
    url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Bali Tropical Villa',
    url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
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
      targetBudget: 55000,
      dailySpendThreshold: 7000,
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
            accommodationName: 'Central Heritage Boutique Hotel',
            accommodationCostPerNight: 4000,
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

      showToast('Voyage Initialized', 'Welcome to the Builder. Add stops and activities.', 'success');
      navigate(`/trips/${createdTrip.id}/builder`);
    } catch (err: any) {
      showToast('Error Creating Trip', err.message || 'Please try again', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <span className="text-[11px] font-mono uppercase text-boarding-amber-700 bg-boarding-amber/20 px-2.5 py-0.5 rounded-full font-bold">
          ITINERARY BLUEPRINT
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink-navy mt-1">
          Plan Your Next Journey
        </h1>
        <p className="text-xs sm:text-sm text-tarmac-grey mt-1">
          Set up your travel timeframe, target budget, and cover picture before connecting cities and booking activities.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-tarmac-grey/25 shadow-md p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Voyage Name / Title"
            placeholder="e.g. Royal Rajasthan Heritage Trail or Mumbai to Southeast Asia"
            {...register('title')}
            error={errors.title?.message}
            helperText="Give your expedition an exciting title."
            monoLabel
          />

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[11px] font-semibold text-ink-navy/80 mb-1">
              Trip Description & Notes
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="e.g. Exploring Mughal monuments, tea plantations, palace heritage, and local food trails with family..."
              className="w-full rounded-xl border border-tarmac-grey/30 bg-white text-ink-navy text-sm p-3.5 focus:outline-none focus:ring-2 focus:ring-boarding-amber placeholder-tarmac-grey/50"
            />
            {errors.description && (
              <p className="text-xs text-stamp-red mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-runway-white rounded-2xl border border-tarmac-grey/20">
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
              label="Total Target Budget (₹)"
              type="number"
              leftIcon={<span className="font-bold text-signal-teal font-sans">₹</span>}
              {...register('targetBudget', { valueAsNumber: true })}
              error={errors.targetBudget?.message}
              helperText="Overall estimated expenditure ceiling (in Rupees)."
              monoLabel
            />

            <Input
              label="Daily Spend Limit (₹)"
              type="number"
              leftIcon={<span className="font-bold text-boarding-amber font-sans">₹</span>}
              {...register('dailySpendThreshold', { valueAsNumber: true })}
              error={errors.dailySpendThreshold?.message}
              helperText="Triggers budget alerts if exceeded on any given day."
              monoLabel
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-tarmac-grey/15">
            <label className="block text-xs font-mono uppercase tracking-wider text-[11px] font-semibold text-ink-navy/80">
              Trip Cover Photo
            </label>

            <div className="relative h-48 rounded-2xl overflow-hidden border border-tarmac-grey/25 bg-ink-navy shadow-inner">
              <img
                src={selectedCover}
                alt="Trip Cover Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-navy/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 bg-ink-navy/90 backdrop-blur-md px-3.5 py-1 rounded-full text-white font-mono text-xs border border-white/10">
                LIVE COVER PREVIEW
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {COVER_PRESETS.map((preset) => {
                const isSelected = selectedCover === preset.url;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`relative rounded-xl overflow-hidden h-18 border-2 transition-all group ${
                      isSelected ? 'border-boarding-amber ring-2 ring-boarding-amber shadow-md' : 'border-tarmac-grey/30 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-center">
                      <span className="text-[11px] font-sans text-white font-semibold leading-tight">
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

            <div className="flex items-center gap-3 pt-1">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-runway-white hover:bg-parchment border border-tarmac-grey/30 rounded-xl text-xs font-mono text-ink-navy transition-colors">
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
                (Supports JPG, PNG, or WebP)
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
