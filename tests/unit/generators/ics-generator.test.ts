/**
 * Tests for ICS generator
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ICSGenerator } from '@/shared/generators/ics-generator';
import { mockEventRecords } from '../../fixtures/mock-events';

describe('ICSGenerator', () => {
  let generator: ICSGenerator;

  beforeEach(() => {
    generator = new ICSGenerator();
  });

  describe('generate', () => {
    it('should generate valid ICS content from events', async () => {
      const icsContent = await generator.generate(mockEventRecords);

      // Check ICS format
      expect(icsContent).toContain('BEGIN:VCALENDAR');
      expect(icsContent).toContain('END:VCALENDAR');
      expect(icsContent).toContain('VERSION:2.0');
      expect(icsContent).toContain('PRODID');
    });

    it('should include all events in ICS file', async () => {
      const icsContent = await generator.generate(mockEventRecords);

      // Should have BEGIN:VEVENT for each event
      const eventCount = (icsContent.match(/BEGIN:VEVENT/g) || []).length;
      expect(eventCount).toBe(mockEventRecords.length);
    });

    it('should include event details in ICS', async () => {
      const singleEvent = [mockEventRecords[0]!];
      const icsContent = await generator.generate(singleEvent);

      // Check for event title and type
      expect(icsContent).toContain('GILT');
      expect(icsContent).toContain('News');
    });

    it('should handle empty events array', async () => {
      const icsContent = await generator.generate([]);

      expect(icsContent).toContain('BEGIN:VCALENDAR');
      expect(icsContent).toContain('END:VCALENDAR');
      // Should have no events
      expect(icsContent).not.toContain('BEGIN:VEVENT');
    });

    it('should set events as all-day events', async () => {
      const singleEvent = [mockEventRecords[0]!];
      const icsContent = await generator.generate(singleEvent);

      // All-day events should not have time component
      expect(icsContent).toContain('DTSTART');
      // Should be VALUE=DATE format (not DATE-TIME)
      expect(icsContent).toContain('VALUE=DATE');
    });

    it('should include event URL in description or URL field', async () => {
      const singleEvent = [mockEventRecords[0]!];
      const icsContent = await generator.generate(singleEvent);

      // URL should be included
      expect(icsContent).toContain('capedge.com');
    });
  });

  describe('download', () => {
    beforeEach(() => {
      // Mock chrome.downloads.download
      (globalThis as any).chrome.downloads = {
        download: vi.fn().mockResolvedValue(1)
      };
    });

    it('should trigger download with correct filename', async () => {
      const icsContent = 'BEGIN:VCALENDAR\nEND:VCALENDAR';

      await generator.download(icsContent);

      expect(chrome.downloads.download).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'capedge-calendar.ics',
          saveAs: true
        })
      );
    });

    it('should use data URL for download', async () => {
      const icsContent = 'BEGIN:VCALENDAR\nEND:VCALENDAR';

      await generator.download(icsContent);

      expect(chrome.downloads.download).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('data:text/calendar;charset=utf-8,')
        })
      );
    });

    it('should encode ICS content in data URL', async () => {
      const icsContent = 'BEGIN:VCALENDAR\nEND:VCALENDAR';

      await generator.download(icsContent);

      const expectedUrl = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsContent);
      expect(chrome.downloads.download).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expectedUrl
        })
      );
    });
  });

  describe('parseDate', () => {
    it('should parse ISO date to ICS date array', () => {
      const result = generator.parseDate('2026-02-11');
      expect(result).toEqual([2026, 2, 11]);
    });

    it('should handle different dates correctly', () => {
      expect(generator.parseDate('2025-01-01')).toEqual([2025, 1, 1]);
      expect(generator.parseDate('2026-12-31')).toEqual([2026, 12, 31]);
    });
  });
});
