import { format, isValid, parseISO } from 'date-fns';

export function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return isValid(date) ? format(date, 'MMM d, yyyy') : null;
}

export function isPastDue(dateStr) {
  if (!dateStr) return false;
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return isValid(date) && date < new Date();
}
