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
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { 
  Plus, 
  Share2, 
  PieChart, 
  CalendarDays, 
  Eye, 
  AlertCircle, 
  Plane
} from 'lucide-react';
import { tripsService } from '../../services/trips';
import { useTripDraftStore } from '../../stores/tripDraftStore';
import { useUIStore } from '../../stores/uiStore';
import { Stop, StopActivity } from '../../lib/types';
import { StopCard } from '../../components/trip/StopCard';
import { DashedRoute } from '../../components/ui/DashedRoute';
import { TripCostSummary } from '../../components/trip/TripCostSummary';
import { ActivityQuickEdit } from '../../components/trip/ActivityQuickEdit';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { formatDate, getDaysInRange } from '../../lib/dateUtils';

export const ItineraryBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { showToast, openShareModal } = useUIStore();
  const { openCityDrawer, openActivityDrawer, setActiveTripId } = useTripDraftStore();

  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [quickEditActivity, setQuickEditActivity] = useState<StopActivity | null>(null);
  const [quickEditStopId, setQuickEditStopId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => (id ? tripsService.getTripById(id) : null),
    enabled: !!id,
  });

  React.useEffect(() => {
    if (id) {
      setActiveTripId(id);
    }
  }, [id, setActiveTripId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
        <div className="h-64 bg-white rounded-xl animate-pulse border border-tarmac-grey/20" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-tarmac-grey/20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-stamp-red mx-auto" />
        <h3 className="font-display font-bold text-xl text-ink-navy">Voyage Not Found</h3>
        <p className="text-xs text-tarmac-grey">The itinerary ID may be invalid or removed.</p>
        <Link to="/trips">
          <Button variant="primary">Return to My Trips</Button>
        </Link>
      </div>
    );
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = trip.stops.findIndex((s) => s.id === active.id);
      const newIndex = trip.stops.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = [...trip.stops];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);
        const stopIds = reordered.map((s) => s.id);
        
        queryClient.setQueryData(['trip', id], { ...trip, stops: reordered });
        await tripsService.reorderStops(trip.id, stopIds);
        showToast('Flight Path Updated', 'Stop sequence reordered.', 'info');
      }
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (window.confirm('Delete this stop and its assigned activities?')) {
      const updated = await tripsService.deleteStop(trip.id, stopId);
      queryClient.setQueryData(['trip', id], updated);
      showToast('Stop Removed', 'Destination stop deleted from route.', 'info');
    }
  };

  const handleDeleteActivity = async (stopId: string, activityId: string) => {
    const updated = await tripsService.removeActivityFromStop(trip.id, stopId, activityId);
    queryClient.setQueryData(['trip', id], updated);
    showToast('Activity Removed', 'Experience deleted from stop.', 'info');
  };

  const handleOpenEditActivity = (stopId: string, activity: StopActivity) => {
    setQuickEditStopId(stopId);
    setQuickEditActivity(activity);
  };

  const handleSaveActivityUpdates = async (activityId: string, updates: Partial<StopActivity>) => {
    if (!quickEditStopId) return;
    const updated = await tripsService.updateActivityInStop(trip.id, quickEditStopId, activityId, updates);
    queryClient.setQueryData(['trip', id], updated);
    showToast('Activity Updated', 'Schedule and pricing updated.', 'success');
  };

  const handleSaveStopUpdates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStop) return;
    const updated = await tripsService.updateStop(trip.id, editingStop.id, editingStop);
    queryClient.setQueryData(['trip', id], updated);
    setEditingStop(null);
    showToast('Stop Updated', 'Stop accommodations & dates updated.', 'success');
  };

  const availableDatesForTrip = getDaysInRange(trip.startDate, trip.endDate);

  return (
    <div className="space-y-6">
      {/* Top Itinerary Navigation Bar */}
      <div className="bg-white border border-tarmac-grey/20 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-boarding-amber text-ink-navy px-2 py-0.5 rounded">
                BUILDER MODE
              </span>
              <span className="text-xs font-mono text-tarmac-grey">
                REF: {trip.shareId.toUpperCase()}
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-ink-navy mt-1">
              {trip.title}
            </h1>
            <p className="text-xs text-tarmac-grey font-mono mt-0.5">
              {formatDate(trip.startDate, 'MMM d, yyyy')} – {formatDate(trip.endDate, 'MMM d, yyyy')} • {trip.stops.length} Stops
            </p>
          </div>

          {/* Quick Sub-Navigation Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/trips/${trip.id}`}>
              <Button size="sm" variant="outline" leftIcon={<Eye className="w-3.5 h-3.5 text-signal-teal" />}>
                View Pass
              </Button>
            </Link>
            <Link to={`/trips/${trip.id}/budget`}>
              <Button size="sm" variant="outline" leftIcon={<PieChart className="w-3.5 h-3.5 text-signal-teal" />}>
                Budget Breakdown
              </Button>
            </Link>
            <Link to={`/trips/${trip.id}/calendar`}>
              <Button size="sm" variant="outline" leftIcon={<CalendarDays className="w-3.5 h-3.5 text-ink-navy" />}>
                Calendar
              </Button>
            </Link>
            <Button
              size="sm"
              variant="navy"
              leftIcon={<Share2 className="w-3.5 h-3.5 text-boarding-amber" />}
              onClick={() => openShareModal(trip.id)}
            >
              Share
            </Button>
          </div>
        </div>

        {/* Live Budget Tracker Strip */}
        <TripCostSummary trip={trip} />
      </div>

      {/* Main Builder Route Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-ink-navy flex items-center gap-2">
              <span>Flight Path & Stop Sequence</span>
            </h2>
            <p className="text-xs text-tarmac-grey mt-0.5">
              Drag stops to reorder your sequence. Add custom tours and culinary experiences to each city.
            </p>
          </div>

          <Button
            size="md"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCityDrawer}
            className="shadow-sm"
          >
            Add Stop
          </Button>
        </div>

        {/* Vertical Connected Stops List */}
        {trip.stops.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={trip.stops.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-0 relative py-2">
                {trip.stops.map((stop, index) => (
                  <React.Fragment key={stop.id}>
                    <StopCard
                      stop={stop}
                      index={index}
                      onAddActivity={(stopId) => openActivityDrawer(stopId)}
                      onEditActivity={handleOpenEditActivity}
                      onDeleteActivity={handleDeleteActivity}
                      onDeleteStop={handleDeleteStop}
                      onEditStop={(s) => setEditingStop(s)}
                    />

                    {/* Flight Path Dashed Connector */}
                    {index < trip.stops.length - 1 && (
                      <div className="py-2">
                        <DashedRoute orientation="vertical" showPlane={true} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-dashed border-tarmac-grey/25 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-boarding-amber/15 text-boarding-amber flex items-center justify-center mx-auto">
              <Plane className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-ink-navy">
                No Destination Stops Added
              </h3>
              <p className="text-xs sm:text-sm text-tarmac-grey max-w-md mx-auto mt-1">
                Your flight path is empty. Click "Add Stop" to search destination cities from the global atlas and attach arrival dates.
              </p>
            </div>
            <Button
              size="lg"
              variant="primary"
              leftIcon={<Plus className="w-5 h-5" />}
              onClick={openCityDrawer}
            >
              Add First City Stop
            </Button>
          </div>
        )}

        {trip.stops.length > 0 && (
          <div className="text-center pt-4">
            <Button
              size="md"
              variant="outline"
              leftIcon={<Plus className="w-4 h-4 text-boarding-amber" />}
              onClick={openCityDrawer}
              className="border-dashed hover:border-boarding-amber bg-white"
            >
              Append Another Destination Stop
            </Button>
          </div>
        )}
      </div>

      {/* Edit Stop Modal */}
      {editingStop && (
        <Modal
          isOpen={!!editingStop}
          onClose={() => setEditingStop(null)}
          title={`Edit Stop: ${editingStop.cityName}`}
          subtitle="Update lodging, transit, and schedule details"
          maxWidth="md"
        >
          <form onSubmit={handleSaveStopUpdates} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Arrival Date"
                type="date"
                value={editingStop.arrivalDate}
                onChange={(e) => setEditingStop({ ...editingStop, arrivalDate: e.target.value })}
                monoLabel
              />
              <Input
                label="Departure Date"
                type="date"
                value={editingStop.departureDate}
                onChange={(e) => setEditingStop({ ...editingStop, departureDate: e.target.value })}
                monoLabel
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Accommodation Name"
                value={editingStop.accommodationName || ''}
                onChange={(e) => setEditingStop({ ...editingStop, accommodationName: e.target.value })}
                monoLabel
              />
              <Input
                label="Nightly Cost ($)"
                type="number"
                value={editingStop.accommodationCostPerNight || 0}
                onChange={(e) => setEditingStop({ ...editingStop, accommodationCostPerNight: Number(e.target.value) })}
                monoLabel
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[11px] font-semibold text-ink-navy/80 mb-1">
                  Inbound Transit Mode
                </label>
                <select
                  value={editingStop.transportMode || 'flight'}
                  onChange={(e) => setEditingStop({ ...editingStop, transportMode: e.target.value as any })}
                  className="w-full rounded-md border border-tarmac-grey/30 bg-white text-ink-navy text-sm p-2 focus:ring-2 focus:ring-boarding-amber focus:outline-none"
                >
                  <option value="flight">Flight</option>
                  <option value="train">Train</option>
                  <option value="car">Rental Car</option>
                  <option value="ferry">Ferry</option>
                  <option value="bus">Bus</option>
                </select>
              </div>

              <Input
                label="Transit Cost ($)"
                type="number"
                value={editingStop.transportCostToStop || 0}
                onChange={(e) => setEditingStop({ ...editingStop, transportCostToStop: Number(e.target.value) })}
                monoLabel
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[11px] font-semibold text-ink-navy/80 mb-1">
                Stop Notes & Transit Logistics
              </label>
              <textarea
                value={editingStop.notes || ''}
                onChange={(e) => setEditingStop({ ...editingStop, notes: e.target.value })}
                rows={2}
                className="w-full rounded-md border border-tarmac-grey/30 bg-white text-ink-navy text-sm p-2.5 focus:ring-2 focus:ring-boarding-amber focus:outline-none"
                placeholder="Airport transfer details, check-in instructions..."
              />
            </div>

            <div className="pt-3 border-t border-tarmac-grey/20 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingStop(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary">
                Save Stop Details
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Activity Quick Edit Popover */}
      <ActivityQuickEdit
        isOpen={!!quickEditActivity}
        onClose={() => setQuickEditActivity(null)}
        activity={quickEditActivity}
        onSave={handleSaveActivityUpdates}
        availableDates={availableDatesForTrip}
      />
    </div>
  );
};
