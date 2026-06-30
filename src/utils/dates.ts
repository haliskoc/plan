import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

export function formatFullDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, "d MMMM yyyy, EEEE", { locale: tr });
  } catch (error) {
    return dateStr;
  }
}

export function formatMonthName(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, "MMMM yyyy", { locale: tr });
  } catch (error) {
    return dateStr;
  }
}

export function formatDayName(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, "EEEE", { locale: tr });
  } catch (error) {
    return dateStr;
  }
}

export function getShortDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, "d MMM", { locale: tr });
  } catch (error) {
    return dateStr;
  }
}
