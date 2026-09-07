/**
 * Utility functions for car rental date calculations and validations.
 * Ensures consistent handling of same-day returns (1-day rental) and past date restrictions.
 */

/**
 * Returns today's local date formatted as YYYY-MM-DD string.
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adds a specified number of days to a YYYY-MM-DD date string.
 */
export function addDays(dateStr: string, days: number): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return getTodayString();
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const date = new Date(year, month, day);
  date.setDate(date.getDate() + days);

  const resYear = date.getFullYear();
  const resMonth = String(date.getMonth() + 1).padStart(2, '0');
  const resDay = String(date.getDate()).padStart(2, '0');
  return `${resYear}-${resMonth}-${resDay}`;
}

/**
 * Calculates rental duration in billable days.
 * - Same-day return (pickup === return) is valid and billed as 1 day.
 * - Multi-day rentals (return > pickup) are calculated as calendar day difference.
 * - If invalid (return < pickup), returns 1 as safe fallback.
 */
export function calculateRentalDays(pickupDate: string, returnDate: string): number {
  if (!pickupDate || !returnDate) return 1;
  if (pickupDate === returnDate) return 1;

  const [pYear, pMonth, pDay] = pickupDate.split('-').map(Number);
  const [rYear, rMonth, rDay] = returnDate.split('-').map(Number);

  if (!pYear || !rYear) return 1;

  const pDate = new Date(pYear, pMonth - 1, pDay);
  const rDate = new Date(rYear, rMonth - 1, rDay);

  const diffMs = rDate.getTime() - pDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 1;
}

export interface DateValidationResult {
  isValid: boolean;
  isPickupInPast: boolean;
  isReturnBeforePickup: boolean;
  isSameDay: boolean;
  rentalDays: number;
  errorMessage: string | null;
  helperMessage: string;
}

/**
 * Validates a rental date range.
 * Rules:
 * 1. Pickup date cannot be in the past.
 * 2. Return date cannot be before pickup date.
 * 3. Return date CAN be the same day as pickup date (same-day return, 1 day rental).
 * 4. Return date CAN be 1 or more days after pickup date.
 */
export function validateDateSelection(pickupDate: string, returnDate: string): DateValidationResult {
  const today = getTodayString();
  const isPickupInPast = Boolean(pickupDate && pickupDate < today);
  const isReturnBeforePickup = Boolean(pickupDate && returnDate && returnDate < pickupDate);
  const isSameDay = Boolean(pickupDate && returnDate && pickupDate === returnDate);
  const rentalDays = calculateRentalDays(pickupDate, returnDate);

  let errorMessage: string | null = null;
  if (!pickupDate) {
    errorMessage = 'Please select a pickup date.';
  } else if (isPickupInPast) {
    errorMessage = 'Pickup date cannot be in the past. Please select today or a future date.';
  } else if (!returnDate) {
    errorMessage = 'Please select a return date.';
  } else if (isReturnBeforePickup) {
    errorMessage = 'Return date cannot be earlier than pickup date. You may select the same day or a later date.';
  }

  let helperMessage = '';
  if (isSameDay) {
    helperMessage = 'Same-day return: Car returned on the same day (charged as 1 full day rental).';
  } else if (!errorMessage) {
    helperMessage = `${rentalDays} ${rentalDays === 1 ? 'day' : 'days'} rental duration.`;
  }

  return {
    isValid: !errorMessage,
    isPickupInPast,
    isReturnBeforePickup,
    isSameDay,
    rentalDays,
    errorMessage,
    helperMessage,
  };
}

/**
 * Formats YYYY-MM-DD for display (e.g. "Wed, 16 Sep 2026")
 */
export function formatDisplayDate(dateStr: string, options?: { includeDay?: boolean }): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);

  return d.toLocaleDateString('en-GB', {
    weekday: options?.includeDay ? 'short' : undefined,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
