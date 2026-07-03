import { format, addDays, parseISO } from "date-fns";

export const DATE_FORMAT = "yyyy-MM-dd";

export function todayStr(): string {
  return format(new Date(), DATE_FORMAT);
}

export function toDateStr(date: Date): string {
  return format(date, DATE_FORMAT);
}

export function shiftDate(dateStr: string, days: number): string {
  return format(addDays(parseISO(dateStr), days), DATE_FORMAT);
}

export function displayDate(dateStr: string): string {
  const today = todayStr();
  const yesterday = shiftDate(today, -1);
  const tomorrow = shiftDate(today, 1);

  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  if (dateStr === tomorrow) return "Tomorrow";

  return format(parseISO(dateStr), "EEE, MMM d");
}
