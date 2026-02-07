/**
 * Event mapping utilities
 */

import { EventType, ParsedEvent, EventRecord } from '@/shared/types/event.types';
import { getMonthFromDate } from './date-utils';

/**
 * Map metadata attribute to EventType
 */
export const mapMetadataToEventType = (metadata: string): EventType => {
  const normalized = metadata.toLowerCase().trim();

  // Earnings
  if (normalized === 'earnings') {
    return 'Earnings';
  }

  // Financial (10-K, 10-Q, etc.)
  if (normalized.includes('10-k') || normalized.includes('10-q')) {
    return 'Financial';
  }

  // Ownership (4, 144, 13G, 13D, etc.)
  if (
    normalized === '4' ||
    normalized === '144' ||
    normalized.includes('13g') ||
    normalized.includes('13d')
  ) {
    return 'Ownership';
  }

  // Registration (S-8, S-1, etc.)
  if (normalized.includes('s-') || normalized.includes('registration')) {
    return 'Registration';
  }

  // News (6-K, 8-K, etc.) or default
  return 'News';
};

/**
 * Create unique event ID
 */
export const createEventId = (website: string, date: string, title: string): string => {
  return `${website}-${date}-${title}`;
};

/**
 * Convert ParsedEvent to EventRecord
 */
export const createEventRecord = (
  parsedEvent: ParsedEvent,
  website: 'capedge',
  timestamp: number
): EventRecord => {
  return {
    ...parsedEvent,
    id: createEventId(website, parsedEvent.date, parsedEvent.title),
    website,
    timestamp,
    month: getMonthFromDate(parsedEvent.date)
  };
};
