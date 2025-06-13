import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = 'Australia/Melbourne';

export function formatTime(date: Date | string): string {
  return formatInTimeZone(new Date(date), TIMEZONE, 'h:mm a');
}

export function formatDateTime(date: Date | string): string {
  return formatInTimeZone(new Date(date), TIMEZONE, 'MMM d, yyyy h:mm a');
}

export function formatFullDateTime(date: Date | string): string {
  return formatInTimeZone(new Date(date), TIMEZONE, 'MMMM d, yyyy h:mm:ss a');
}

export function toAustralianTime(date: Date | string): Date {
  return new Date(formatInTimeZone(new Date(date), TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"));
} 