/**
 * IndexedDB database wrapper
 */

import { EventRecord, EventFilters } from '@/shared/types/event.types';
import { PreferencesRecord } from '@/shared/types/storage.types';
import { DB_NAME, DB_VERSION, STORE_NAMES, createSchema } from './schema';
import { DEFAULT_FILTERS } from '@/shared/constants';

export class Database {
  private db: IDBDatabase | null = null;

  /**
   * Initialize database connection
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        createSchema(db);
      };
    });
  }

  /**
   * Save events to database
   */
  async saveEvents(events: EventRecord[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAMES.EVENTS, 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.EVENTS);

      events.forEach((event) => {
        store.put(event);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get filtered events based on event type filters
   */
  async getFilteredEvents(filters: EventFilters): Promise<EventRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    const allEvents = await this.getAllEvents();

    // Filter by event type
    const enabledTypes: string[] = [];
    if (filters.earnings) enabledTypes.push('Earnings');
    if (filters.financial) enabledTypes.push('Financial');
    if (filters.ownership) enabledTypes.push('Ownership');
    if (filters.registration) enabledTypes.push('Registration');
    if (filters.news) enabledTypes.push('News');

    return allEvents.filter((event) => enabledTypes.includes(event.type));
  }

  /**
   * Get all events from database
   */
  async getAllEvents(): Promise<EventRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAMES.EVENTS, 'readonly');
      const store = transaction.objectStore(STORE_NAMES.EVENTS);
      const request = store.getAll();

      request.onsuccess = () => {
        const events = request.result as EventRecord[];
        // Sort by date
        events.sort((a, b) => a.date.localeCompare(b.date));
        resolve(events);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: PreferencesRecord): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAMES.PREFERENCES, 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.PREFERENCES);
      const request = store.put(preferences);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get user preferences (returns defaults if none exist)
   */
  async getPreferences(): Promise<PreferencesRecord> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAMES.PREFERENCES, 'readonly');
      const store = transaction.objectStore(STORE_NAMES.PREFERENCES);
      const request = store.get('user-preferences');

      request.onsuccess = () => {
        const result = request.result as PreferencesRecord | undefined;
        if (result) {
          resolve(result);
        } else {
          // Return default preferences
          resolve({
            id: 'user-preferences',
            selectedWebsite: 'capedge',
            eventFilters: DEFAULT_FILTERS,
            lastSync: 0
          });
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data from database
   */
  async clear(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [STORE_NAMES.EVENTS, STORE_NAMES.PREFERENCES, STORE_NAMES.METADATA],
        'readwrite'
      );

      const eventsStore = transaction.objectStore(STORE_NAMES.EVENTS);
      const prefsStore = transaction.objectStore(STORE_NAMES.PREFERENCES);
      const metadataStore = transaction.objectStore(STORE_NAMES.METADATA);

      eventsStore.clear();
      prefsStore.clear();
      metadataStore.clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
