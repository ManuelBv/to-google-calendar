/**
 * Event types and interfaces
 */

export type EventType = 'Earnings' | 'Financial' | 'Ownership' | 'Registration' | 'News';

export interface ParsedEvent {
  title: string;
  date: string; // ISO format: YYYY-MM-DD
  type: EventType;
  url: string;
  metadata: string; // Original data-metadata value
}

export interface EventRecord extends ParsedEvent {
  id: string; // PK: ${website}-${date}-${title}
  website: 'capedge';
  timestamp: number; // When parsed
  month: string; // YYYY-MM format for efficient querying
}

export interface EventFilters {
  earnings: boolean;
  financial: boolean;
  ownership: boolean;
  registration: boolean;
  news: boolean;
}
