/**
 * Tests for event mapping utilities
 */

import { describe, it, expect } from 'vitest';
import { mapMetadataToEventType, createEventId, createEventRecord } from '@/shared/utils/event-mapper';
import { ParsedEvent } from '@/shared/types/event.types';

describe('event-mapper', () => {
  describe('mapMetadataToEventType', () => {
    it('should map "Earnings" to Earnings type', () => {
      expect(mapMetadataToEventType('Earnings')).toBe('Earnings');
      expect(mapMetadataToEventType('earnings')).toBe('Earnings');
      expect(mapMetadataToEventType('EARNINGS')).toBe('Earnings');
    });

    it('should map financial filing types to Financial', () => {
      expect(mapMetadataToEventType('10-K')).toBe('Financial');
      expect(mapMetadataToEventType('10-Q')).toBe('Financial');
      expect(mapMetadataToEventType('10-k')).toBe('Financial');
      expect(mapMetadataToEventType('10-q')).toBe('Financial');
    });

    it('should map ownership filing types to Ownership', () => {
      expect(mapMetadataToEventType('4')).toBe('Ownership');
      expect(mapMetadataToEventType('144')).toBe('Ownership');
      expect(mapMetadataToEventType('SCHEDULE 13G')).toBe('Ownership');
      expect(mapMetadataToEventType('SCHEDULE 13D')).toBe('Ownership');
      expect(mapMetadataToEventType('schedule 13g')).toBe('Ownership');
      expect(mapMetadataToEventType('13g')).toBe('Ownership');
      expect(mapMetadataToEventType('13d')).toBe('Ownership');
    });

    it('should map registration filing types to Registration', () => {
      expect(mapMetadataToEventType('S-8')).toBe('Registration');
      expect(mapMetadataToEventType('S-1')).toBe('Registration');
      expect(mapMetadataToEventType('s-8')).toBe('Registration');
      expect(mapMetadataToEventType('registration')).toBe('Registration');
    });

    it('should map news filing types to News', () => {
      expect(mapMetadataToEventType('6-K')).toBe('News');
      expect(mapMetadataToEventType('8-K')).toBe('News');
      expect(mapMetadataToEventType('6-k')).toBe('News');
    });

    it('should default unknown types to News', () => {
      expect(mapMetadataToEventType('Unknown')).toBe('News');
      expect(mapMetadataToEventType('Something Else')).toBe('News');
      expect(mapMetadataToEventType('')).toBe('News');
    });
  });

  describe('createEventId', () => {
    it('should create unique ID from website, date, and title', () => {
      expect(createEventId('capedge', '2026-02-11', 'RDCM')).toBe('capedge-2026-02-11-RDCM');
      expect(createEventId('capedge', '2025-01-01', 'TEST')).toBe('capedge-2025-01-01-TEST');
    });

    it('should handle titles with special characters', () => {
      expect(createEventId('capedge', '2026-02-11', 'TEST & CO')).toBe('capedge-2026-02-11-TEST & CO');
    });

    it('should create different IDs for same title on different dates', () => {
      const id1 = createEventId('capedge', '2026-02-11', 'RDCM');
      const id2 = createEventId('capedge', '2026-02-12', 'RDCM');
      expect(id1).not.toBe(id2);
    });
  });

  describe('createEventRecord', () => {
    it('should create EventRecord from ParsedEvent', () => {
      const parsedEvent: ParsedEvent = {
        title: 'RDCM',
        date: '2026-02-11',
        type: 'Earnings',
        url: 'https://capedge.com/company/1016838/filings',
        metadata: 'Earnings'
      };

      const timestamp = Date.now();
      const record = createEventRecord(parsedEvent, 'capedge', timestamp);

      expect(record).toEqual({
        id: 'capedge-2026-02-11-RDCM',
        website: 'capedge',
        title: 'RDCM',
        date: '2026-02-11',
        type: 'Earnings',
        url: 'https://capedge.com/company/1016838/filings',
        metadata: 'Earnings',
        timestamp,
        month: '2026-02'
      });
    });

    it('should extract correct month from date', () => {
      const parsedEvent: ParsedEvent = {
        title: 'TEST',
        date: '2025-12-31',
        type: 'Financial',
        url: 'https://example.com',
        metadata: '10-K'
      };

      const record = createEventRecord(parsedEvent, 'capedge', Date.now());
      expect(record.month).toBe('2025-12');
    });

    it('should preserve all ParsedEvent fields', () => {
      const parsedEvent: ParsedEvent = {
        title: 'GILT',
        date: '2026-02-04',
        type: 'News',
        url: 'https://capedge.com/filing/897322',
        metadata: '6-K'
      };

      const record = createEventRecord(parsedEvent, 'capedge', Date.now());

      expect(record.title).toBe(parsedEvent.title);
      expect(record.date).toBe(parsedEvent.date);
      expect(record.type).toBe(parsedEvent.type);
      expect(record.url).toBe(parsedEvent.url);
      expect(record.metadata).toBe(parsedEvent.metadata);
    });
  });
});
