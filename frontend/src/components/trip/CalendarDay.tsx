import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Edit3, Trash2 } from 'lucide-react';
import { StopActivity, DailySpend } from '../../lib/types';
import { formatDayMonth, formatTime, formatMinutes } from '../../lib/dateUtils';
import { formatCurrency } from '../../lib/currencyUtils';

interface SortableActivityItemProps {
  activity: StopActivity;
  onEdit: (activity: StopActivity) => void;
  onDelete: (activityId: string) => void;
}

const SortableActivityItem: React.FC<SortableActivityItemProps> = ({
  activity,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-white border border-tarmac-grey/20 rounded-md p-2.5 shadow-xs hover:border-boarding-amber/50 transition-all flex items-center justify-between gap-2"
    >
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-tarmac-grey/50 hover:text-ink-navy p-0.5"
          title="Drag activity to reorder time"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-signal-teal">
              {formatTime(activity.startTime)}
            </span>
            <span className="text-xs font-semibold text-ink-navy truncate block">
              {activity.title}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-tarmac-grey font-mono mt-0.5">
            <span>{formatMinutes(activity.durationMinutes)}</span>
            <span>•</span>
            <span className="font-bold text-ink-navy">{activity.cost > 0 ? formatCurrency(activity.cost) : 'Free'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          onClick={() => onEdit(activity)}
          className="p-1 text-tarmac-grey hover:text-signal-teal rounded hover:bg-signal-teal/10"
        >
          <Edit3 className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(activity.id)}
          className="p-1 text-tarmac-grey hover:text-stamp-red rounded hover:bg-stamp-red/10"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

interface CalendarDayProps {
  dateStr: string;
  dayNumber: number;
  cityName: string;
  activities: StopActivity[];
  dailySpend?: DailySpend;
  onAddActivity: (dateStr: string) => void;
  onEditActivity: (activity: StopActivity) => void;
  onDeleteActivity: (activityId: string) => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  dateStr,
  dayNumber,
  cityName,
  activities,
  dailySpend,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-day-${dateStr}`,
  });

  const isOverThreshold = dailySpend?.isOverThreshold;

  return (
    <div
      ref={setNodeRef}
      className={`bg-runway-white rounded-xl border flex flex-col min-h-[220px] transition-colors ${
        isOver ? 'border-boarding-amber bg-boarding-amber/5' : isOverThreshold ? 'border-stamp-red/40 bg-stamp-red/5' : 'border-tarmac-grey/20'
      }`}
    >
      <div className="p-3 border-b border-tarmac-grey/15 bg-white/70 rounded-t-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs bg-ink-navy text-runway-white px-2 py-0.5 rounded">
              DAY {dayNumber}
            </span>
            <span className="text-xs font-bold text-ink-navy">
              {formatDayMonth(dateStr)}
            </span>
          </div>
          <span className="text-[11px] font-mono text-tarmac-grey block mt-0.5">
            📍 {cityName}
          </span>
        </div>

        <div className="text-right">
          {dailySpend && (
            <span
              className={`text-xs font-mono font-bold block ${
                isOverThreshold ? 'text-stamp-red' : 'text-signal-teal'
              }`}
            >
              {formatCurrency(dailySpend.totalDayCost)}
            </span>
          )}
          {isOverThreshold && (
            <span className="text-[9px] font-mono uppercase text-stamp-red font-bold">
              Over Cap!
            </span>
          )}
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <SortableContext
          items={activities.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {activities.map((activity) => (
              <SortableActivityItem
                key={activity.id}
                activity={activity}
                onEdit={onEditActivity}
                onDelete={onDeleteActivity}
              />
            ))}
          </div>
        </SortableContext>

        {activities.length === 0 && (
          <div className="py-4 text-center text-xs text-tarmac-grey/70 italic border border-dashed border-tarmac-grey/20 rounded-md">
            No scheduled activities
          </div>
        )}

        <button
          type="button"
          onClick={() => onAddActivity(dateStr)}
          className="w-full py-1.5 mt-2 border border-dashed border-tarmac-grey/30 hover:border-boarding-amber hover:bg-white text-tarmac-grey hover:text-ink-navy rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-boarding-amber" />
          <span>Add Activity</span>
        </button>
      </div>
    </div>
  );
};
