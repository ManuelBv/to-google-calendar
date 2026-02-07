/**
 * IndexedDB storage schema types
 */

import { EventRecord, EventFilters } from './event.types';

export interface PreferencesRecord {
  id: 'user-preferences';
  selectedWebsite: string;
  eventFilters: EventFilters;
  lastSync: number;
}

export interface MetadataRecord {
  id: string; // website name
  website: string;
  lastParsed: number;
  monthCached: string; // YYYY-MM
  eventCount: number;
}

export interface DatabaseSchema {
  events: EventRecord;
  preferences: PreferencesRecord;
  metadata: MetadataRecord;
}

export const DB_NAME = 'CalendarExtensionDB';
export const DB_VERSION = 1;

export const STORE_NAMES = {
  EVENTS: 'events',
  PREFERENCES: 'preferences',
  METADATA: 'metadata'
} as const;
