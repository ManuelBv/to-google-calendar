/**
 * Tests for IndexedDB database wrapper
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Database } from '@/shared/db/database';
import { mockEventRecords } from '../../fixtures/mock-events';
import { DEFAULT_FILTERS } from '@/shared/constants';

describe('Database', () => {
  let db: Database;

  beforeEach(async () => {
    db = new Database();
    await db.init();
  });

  afterEach(async () => {
    await db.clear();
    await db.close();
  });

  describe('init', () => {
    it('should initialize database successfully', async () => {
      expect(db).toBeDefined();
    });
  });

  describe('saveEvents', () => {
    it('should save events to database', async () => {
      await db.saveEvents(mockEventRecords);
      const events = await db.getAllEvents();
      expect(events).toHaveLength(mockEventRecords.length);
    });

    it('should overwrite existing events with same ID', async () => {
      await db.saveEvents([mockEventRecords[0]!]);

      // Update with same ID
      const updated = {
        ...mockEventRecords[0]!,
        timestamp: Date.now()
      };
      await db.saveEvents([updated]);

      const events = await db.getAllEvents();
      expect(events).toHaveLength(1);
      expect(events[0]?.timestamp).toBe(updated.timestamp);
    });

    it('should handle empty events array', async () => {
      await db.saveEvents([]);
      const events = await db.getAllEvents();
      expect(events).toEqual([]);
    });
  });

  describe('getFilteredEvents', () => {
    beforeEach(async () => {
      await db.saveEvents(mockEventRecords);
    });

    it('should return all events when all filters are true', async () => {
      const filters = {
        earnings: true,
        financial: true,
        ownership: true,
        registration: true,
        news: true
      };
      const events = await db.getFilteredEvents(filters);
      expect(events).toHaveLength(mockEventRecords.length);
    });

    it('should filter by earnings only', async () => {
      const filters = {
        earnings: true,
        financial: false,
        ownership: false,
        registration: false,
        news: false
      };
      const events = await db.getFilteredEvents(filters);
      expect(events.every(e => e.type === 'Earnings')).toBe(true);
      expect(events.length).toBeGreaterThan(0);
    });

    it('should filter by financial only', async () => {
      const filters = {
        earnings: false,
        financial: true,
        ownership: false,
        registration: false,
        news: false
      };
      const events = await db.getFilteredEvents(filters);
      expect(events.every(e => e.type === 'Financial')).toBe(true);
      expect(events.length).toBeGreaterThan(0);
    });

    it('should return multiple event types when multiple filters enabled', async () => {
      const filters = {
        earnings: true,
        financial: true,
        ownership: false,
        registration: false,
        news: false
      };
      const events = await db.getFilteredEvents(filters);
      expect(events.every(e => e.type === 'Earnings' || e.type === 'Financial')).toBe(true);
      expect(events.length).toBeGreaterThan(0);
    });

    it('should return empty array when all filters are false', async () => {
      const filters = {
        earnings: false,
        financial: false,
        ownership: false,
        registration: false,
        news: false
      };
      const events = await db.getFilteredEvents(filters);
      expect(events).toEqual([]);
    });
  });

  describe('updatePreferences', () => {
    it('should save preferences to database', async () => {
      const preferences = {
        id: 'user-preferences' as const,
        selectedWebsite: 'capedge',
        eventFilters: DEFAULT_FILTERS,
        lastSync: Date.now()
      };

      await db.updatePreferences(preferences);
      const saved = await db.getPreferences();

      expect(saved).toEqual(preferences);
    });

    it('should update existing preferences', async () => {
      const initial = {
        id: 'user-preferences' as const,
        selectedWebsite: 'capedge',
        eventFilters: DEFAULT_FILTERS,
        lastSync: 1000
      };

      await db.updatePreferences(initial);

      const updated = {
        ...initial,
        eventFilters: {
          ...DEFAULT_FILTERS,
          ownership: true
        },
        lastSync: 2000
      };

      await db.updatePreferences(updated);
      const saved = await db.getPreferences();

      expect(saved).toEqual(updated);
    });
  });

  describe('getPreferences', () => {
    it('should return default preferences when none exist', async () => {
      const prefs = await db.getPreferences();

      expect(prefs).toEqual({
        id: 'user-preferences',
        selectedWebsite: 'capedge',
        eventFilters: DEFAULT_FILTERS,
        lastSync: 0
      });
    });

    it('should return saved preferences', async () => {
      const preferences = {
        id: 'user-preferences' as const,
        selectedWebsite: 'capedge',
        eventFilters: {
          earnings: false,
          financial: true,
          ownership: true,
          registration: false,
          news: false
        },
        lastSync: Date.now()
      };

      await db.updatePreferences(preferences);
      const saved = await db.getPreferences();

      expect(saved).toEqual(preferences);
    });
  });

  describe('getAllEvents', () => {
    it('should return all events', async () => {
      await db.saveEvents(mockEventRecords);
      const events = await db.getAllEvents();
      expect(events).toHaveLength(mockEventRecords.length);
    });

    it('should return events sorted by date', async () => {
      await db.saveEvents(mockEventRecords);
      const events = await db.getAllEvents();

      for (let i = 1; i < events.length; i++) {
        const current = events[i];
        const previous = events[i - 1];
        if (current && previous) {
          expect(current.date >= previous.date).toBe(true);
        }
      }
    });

    it('should return empty array when no events exist', async () => {
      const events = await db.getAllEvents();
      expect(events).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should remove all data from database', async () => {
      await db.saveEvents(mockEventRecords);
      await db.updatePreferences({
        id: 'user-preferences',
        selectedWebsite: 'capedge',
        eventFilters: DEFAULT_FILTERS,
        lastSync: Date.now()
      });

      await db.clear();

      const events = await db.getAllEvents();
      const prefs = await db.getPreferences();

      expect(events).toEqual([]);
      expect(prefs.lastSync).toBe(0); // Default value
    });
  });
});
