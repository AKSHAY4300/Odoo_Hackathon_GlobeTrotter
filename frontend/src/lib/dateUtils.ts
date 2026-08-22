import { 
  format, 
  parseISO, 
  differenceInDays, 
  eachDayOfInterval, 
  isWithinInterval, 
  addDays, 
  isValid 
} from 'date-fns';

export function formatDate(dateString: string, formatStr = 'MMM d, yyyy'): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, formatStr);
  } catch {
    return dateString;
  }
}

export function formatTravelDate(dateString: string): string {
  return formatDate(dateString, 'dd MMM yyyy').toUpperCase();
}

export function formatDayMonth(dateString: string): string {
  return formatDate(dateString, 'EEE, MMM d');
}

export function formatShortDate(dateString: string): string {
  return formatDate(dateString, 'dd MMM');
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '--:--';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 || 12;
  return `${displayHours}:${minutes || '00'} ${ampm}`;
}

export function calculateTripDuration(startDate: string, endDate: string): number {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (!isValid(start) || !isValid(end)) return 1;
    const diff = differenceInDays(end, start);
    return Math.max(1, diff + 1); // Inclusive days
  } catch {
    return 1;
  }
}

export function formatDurationNights(nights: number): string {
  return `${nights} ${nights === 1 ? 'night' : 'nights'}`;
}

export function formatDurationDays(days: number): string {
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function getDaysInRange(startDate: string, endDate: string): string[] {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (!isValid(start) || !isValid(end)) return [startDate];
    const days = eachDayOfInterval({ start, end });
    return days.map(d => format(d, 'yyyy-MM-dd'));
  } catch {
    return [startDate];
  }
}

export function isDateWithin(dateStr: string, startStr: string, endStr: string): boolean {
  try {
    const target = parseISO(dateStr);
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    return isWithinInterval(target, { start, end });
  } catch {
    return false;
  }
}

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function addDaysToDate(dateStr: string, days: number): string {
  try {
    const date = parseISO(dateStr);
    return format(addDays(date, days), 'yyyy-MM-dd');
  } catch {
    return dateStr;
  }
}
