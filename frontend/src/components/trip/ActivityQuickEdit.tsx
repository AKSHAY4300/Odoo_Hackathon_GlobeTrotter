import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StopActivity } from '../../lib/types';
import { addActivitySchema, AddActivityFormData } from '../../lib/schemas';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ActivityQuickEditProps {
  isOpen: boolean;
  onClose: () => void;
  activity: StopActivity | null;
  onSave: (activityId: string, updates: Partial<StopActivity>) => void;
  availableDates?: string[];
}

export const ActivityQuickEdit: React.FC<ActivityQuickEditProps> = ({
  isOpen,
  onClose,
  activity,
  onSave,
  availableDates,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddActivityFormData>({
    resolver: zodResolver(addActivitySchema),
    values: activity ? {
      title: activity.title,
      category: activity.category,
      cost: activity.cost,
      durationMinutes: activity.durationMinutes,
      scheduledDate: activity.scheduledDate,
      startTime: activity.startTime,
      notes: activity.notes || '',
      location: activity.location || '',
    } : undefined,
  });

  const onSubmit = (data: AddActivityFormData) => {
    if (!activity) return;
    onSave(activity.id, {
      title: data.title,
      category: data.category,
      cost: data.cost,
      durationMinutes: data.durationMinutes,
      scheduledDate: data.scheduledDate,
      startTime: data.startTime,
      notes: data.notes,
      location: data.location,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Activity"
      subtitle="Modify schedule, cost, and logistics"
      maxWidth="md"
    >
      {activity && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Activity Title"
            {...register('title')}
            error={errors.title?.message}
            placeholder="e.g. Louvre Guided Tour"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-navy/80 mb-1">
                Category
              </label>
              <select
                {...register('category')}
                className="w-full rounded-md border border-tarmac-grey/30 bg-white text-ink-navy text-sm p-2 focus:ring-2 focus:ring-boarding-amber focus:outline-none"
              >
                <option value="culture">Culture</option>
                <option value="food">Food & Dining</option>
                <option value="adventure">Adventure</option>
                <option value="sightseeing">Sightseeing</option>
                <option value="transport">Transport</option>
                <option value="relaxation">Relaxation</option>
              </select>
            </div>

            <Input
              label="Estimated Cost ($)"
              type="number"
              {...register('cost', { valueAsNumber: true })}
              error={errors.cost?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-navy/80 mb-1">
                Scheduled Date
              </label>
              {availableDates && availableDates.length > 0 ? (
                <select
                  {...register('scheduledDate')}
                  className="w-full rounded-md border border-tarmac-grey/30 bg-white text-ink-navy text-sm p-2 focus:ring-2 focus:ring-boarding-amber focus:outline-none font-mono"
                >
                  {availableDates.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="date"
                  {...register('scheduledDate')}
                  className="w-full rounded-md border border-tarmac-grey/30 bg-white text-ink-navy text-sm p-2 focus:ring-2 focus:ring-boarding-amber focus:outline-none font-mono"
                />
              )}
            </div>

            <Input
              label="Start Time (HH:MM)"
              type="time"
              {...register('startTime')}
              error={errors.startTime?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (Minutes)"
              type="number"
              step={15}
              {...register('durationMinutes', { valueAsNumber: true })}
              error={errors.durationMinutes?.message}
            />

            <Input
              label="Location / Meeting Point"
              {...register('location')}
              placeholder="e.g. South Pillar Gate"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-navy/80 mb-1">
              Notes & Vouchers
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full rounded-md border border-tarmac-grey/30 bg-white text-ink-navy text-sm p-2.5 focus:ring-2 focus:ring-boarding-amber focus:outline-none placeholder-tarmac-grey/50"
              placeholder="Booking codes, attire instructions, tips..."
            />
          </div>

          <div className="pt-3 border-t border-tarmac-grey/20 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="primary" isLoading={isSubmitting}>
              Save Updates
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
