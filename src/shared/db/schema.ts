/**
 * IndexedDB schema definitions
 */

import { DB_NAME, DB_VERSION, STORE_NAMES } from '@/shared/types/storage.types';

export const createSchema = (db: IDBDatabase): void => {
  // Events store
  if (!db.objectStoreNames.contains(STORE_NAMES.EVENTS)) {
    const eventsStore = db.createObjectStore(STORE_NAMES.EVENTS, { keyPath: 'id' });
    eventsStore.createIndex('by-website', 'website', { unique: false });
    eventsStore.createIndex('by-date', 'date', { unique: false });
    eventsStore.createIndex('by-type', 'type', { unique: false });
    eventsStore.createIndex('by-month', 'month', { unique: false });
  }

  // Preferences store
  if (!db.objectStoreNames.contains(STORE_NAMES.PREFERENCES)) {
    db.createObjectStore(STORE_NAMES.PREFERENCES, { keyPath: 'id' });
  }

  // Metadata store
  if (!db.objectStoreNames.contains(STORE_NAMES.METADATA)) {
    db.createObjectStore(STORE_NAMES.METADATA, { keyPath: 'id' });
  }
};

export { DB_NAME, DB_VERSION, STORE_NAMES };
