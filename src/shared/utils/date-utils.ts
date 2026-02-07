/**
 * Date utility functions
 */

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse ISO date string (YYYY-MM-DD) to ICS format [year, month, day]
 */
export const parseISODate = (isoDate: string): [number, number, number] => {
  if (!ISO_DATE_REGEX.test(isoDate)) {
    throw new Error(`Invalid ISO date format: ${isoDate}. Expected YYYY-MM-DD`);
  }

  const parts = isoDate.split('-');
  if (parts.length !== 3) {
    throw new Error(`Invalid ISO date format: ${isoDate}. Expected YYYY-MM-DD`);
  }
  const [yearStr, monthStr, dayStr] = parts;
  const year = parseInt(yearStr!, 10);
  const month = parseInt(monthStr!, 10);
  const day = parseInt(dayStr!, 10);

  // Validate date components
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}. Must be between 1 and 12`);
  }

  if (day < 1 || day > 31) {
    throw new Error(`Invalid day: ${day}. Must be between 1 and 31`);
  }

  // Validate the actual date is valid (e.g., Feb 30 is invalid)
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(`Invalid date: ${isoDate}`);
  }

  return [year, month, day];
};

/**
 * Format date array [year, month, day] to ISO string YYYY-MM-DD
 */
export const formatDateForICS = (date: [number, number, number]): string => {
  const [year, month, day] = date;
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}`;
};

/**
 * Extract month in YYYY-MM format from ISO date string
 */
export const getMonthFromDate = (isoDate: string): string => {
  if (!ISO_DATE_REGEX.test(isoDate)) {
    throw new Error(`Invalid ISO date format: ${isoDate}. Expected YYYY-MM-DD`);
  }
  return isoDate.substring(0, 7);
};

/**
 * Check if a string is a valid ISO date (YYYY-MM-DD)
 */
export const isValidISODate = (isoDate: string): boolean => {
  try {
    parseISODate(isoDate);
    return true;
  } catch {
    return false;
  }
};
