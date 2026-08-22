import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  sortableKeyboardCoordinates 
} from '@dnd-kit/sortable';
import { 
  ArrowLeft, 
  PieChart 
} from 'lucide-react';
import { tripsService } from '../../services/trips';
import { budgetService } from '../../services/budget';
import { useTripDraftStore } from '../../stores/tripDraftStore';
import { useUIStore } from '../../stores/uiStore';
import { StopActivity } from '../../lib/types';
import { CalendarDay } from '../../components/trip/CalendarDay';
import { ActivityQuickEdit } from '../../components/trip/ActivityQuickEdit';
import { Button } from '../../components/ui/Button';
import { getDaysInRange } from '../../lib/dateUtils';

export const TripCalendarPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const { openActivityDrawer, setActiveTripId } = useTripDraftStore();

  const [editingActivity, setEditingActivity] = useState<StopActivity | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => (id ? tripsService.getTripById(id) : null),
    enabled: !!id,
  });

  React.useEffect(() => {
    if (id) setActiveTripId(id);
  }, [id, setActiveTripId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-64 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
          <div className="h-64 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
          <div className="h-64 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-tarmac-grey/20 text-center space-y-4">
        <h3 className="font-display font-bold text-xl text-ink-navy">Voyage Not Found</h3>
        <Link to="/trips">
          <Button variant="primary">Return to My Trips</Button>
        </Link>
      </div>
    );
  }

  const days = getDaysInRange(trip.startDate, trip.endDate);
  const budgetBreakdown = budgetService.calculateBudgetSynchronous(trip);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    let activeDayDate: string | null = null;
    trip.stops.forEach((s) => {
      s.activities.forEach((a) => {
        if (a.id === active.id) {
          activeDayDate = a.scheduledDate;
        }
      });
    });

    if (!activeDayDate) return;

    const dayActivities: StopActivity[] = [];
    trip.stops.forEach((s) => {
      s.activities.forEach((a) => {
        if (a.scheduledDate === activeDayDate) {
          dayActivities.push(a);
        }
      });
    });

    const oldIndex = dayActivities.findIndex((a) => a.id === active.id);
    const newIndex = dayActivities.findIndex((a) => a.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = [...dayActivities];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      const reorderedIds = reordered.map((a) => a.id);

      const updated = await tripsService.reorderActivitiesInDay(trip.id, activeDayDate, reorderedIds);
      queryClient.setQueryData(['trip', id], updated);
      showToast('Schedule Reordered', 'Activity timeline updated.', 'info');
    }
  };

  const handleOpenAddForDay = (dateStr: string) => {
    const activeStop = trip.stops.find((s) => dateStr >= s.arrivalDate && dateStr <= s.departureDate);
    if (activeStop) {
      openActivityDrawer(activeStop.id, dateStr);
    } else if (trip.stops.length > 0) {
      openActivityDrawer(trip.stops[0].id, dateStr);
    } else {
      showToast('Notice', 'Please add a destination city stop in the builder first.', 'warning');
    }
  };

  const handleSaveActivityUpdates = async (activityId: string, updates: Partial<StopActivity>) => {
    let stopId: string | null = null;
    trip.stops.forEach((s) => {
      if (s.activities.some((a) => a.id === activityId)) {
        stopId = s.id;
      }
    });

    if (stopId) {
      const updated = await tripsService.updateActivityInStop(trip.id, stopId, activityId, updates);
      queryClient.setQueryData(['trip', id], updated);
      showToast('Activity Saved', 'Time and cost updated.', 'success');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    let stopId: string | null = null;
    trip.stops.forEach((s) => {
      if (s.activities.some((a) => a.id === activityId)) {
        stopId = s.id;
      }
    });

    if (stopId) {
      const updated = await tripsService.removeActivityFromStop(trip.id, stopId, activityId);
      queryClient.setQueryData(['trip', id], updated);
      showToast('Activity Removed', 'Item removed from schedule.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white p-5 rounded-2xl border border-tarmac-grey/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            Trip Timeline & Calendar Matrix
          </h1>
          <p className="text-xs sm:text-sm text-tarmac-grey mt-0.5">
            Drag and reorder activities inside any day. Click any item to modify start times and costs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/trips/${trip.id}/budget`}>
            <Button size="sm" variant="outline" leftIcon={<PieChart className="w-3.5 h-3.5 text-signal-teal" />}>
              Budget Breakdown
            </Button>
          </Link>
        </div>
      </div>

      {/* Calendar Days Matrix Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {days.map((dateStr, index) => {
            const currentStop = trip.stops.find(
              (s) => dateStr >= s.arrivalDate && dateStr <= s.departureDate
            );

            const dayActivities: StopActivity[] = [];
            trip.stops.forEach((s) => {
              s.activities.forEach((a) => {
                if (a.scheduledDate === dateStr) {
                  dayActivities.push(a);
                }
              });
            });

            const dailySpend = budgetBreakdown.dailySpends.find((d) => d.date === dateStr);

            return (
              <CalendarDay
                key={dateStr}
                dateStr={dateStr}
                dayNumber={index + 1}
                cityName={currentStop?.cityName || 'In Transit'}
                activities={dayActivities}
                dailySpend={dailySpend}
                onAddActivity={handleOpenAddForDay}
                onEditActivity={(act) => setEditingActivity(act)}
                onDeleteActivity={handleDeleteActivity}
              />
            );
          })}
        </div>
      </DndContext>

      {/* Quick Edit Popover Modal */}
      <ActivityQuickEdit
        isOpen={!!editingActivity}
        onClose={() => setEditingActivity(null)}
        activity={editingActivity}
        onSave={handleSaveActivityUpdates}
        availableDates={days}
      />
    </div>
  );
};
