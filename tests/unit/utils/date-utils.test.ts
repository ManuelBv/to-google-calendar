/**
 * Tests for date utilities
 */

import { describe, it, expect } from 'vitest';
import { parseISODate, formatDateForICS, getMonthFromDate, isValidISODate } from '@/shared/utils/date-utils';

describe('date-utils', () => {
  describe('parseISODate', () => {
    it('should parse valid ISO date string to ICS format [year, month, day]', () => {
      expect(parseISODate('2026-02-11')).toEqual([2026, 2, 11]);
      expect(parseISODate('2025-01-01')).toEqual([2025, 1, 1]);
      expect(parseISODate('2026-12-31')).toEqual([2026, 12, 31]);
    });

    it('should throw error for invalid ISO date format', () => {
      expect(() => parseISODate('2026-2-11')).toThrow();
      expect(() => parseISODate('02-11-2026')).toThrow();
      expect(() => parseISODate('invalid')).toThrow();
      expect(() => parseISODate('')).toThrow();
    });

    it('should throw error for invalid dates', () => {
      expect(() => parseISODate('2026-13-01')).toThrow(); // Invalid month
      expect(() => parseISODate('2026-02-30')).toThrow(); // Invalid day
      expect(() => parseISODate('2026-00-01')).toThrow(); // Zero month
    });
  });

  describe('formatDateForICS', () => {
    it('should format date array to ISO string', () => {
      expect(formatDateForICS([2026, 2, 11])).toBe('2026-02-11');
      expect(formatDateForICS([2025, 1, 1])).toBe('2025-01-01');
      expect(formatDateForICS([2026, 12, 31])).toBe('2026-12-31');
    });

    it('should pad single-digit months and days with zero', () => {
      expect(formatDateForICS([2026, 1, 5])).toBe('2026-01-05');
      expect(formatDateForICS([2026, 9, 9])).toBe('2026-09-09');
    });
  });

  describe('getMonthFromDate', () => {
    it('should extract month in YYYY-MM format from ISO date', () => {
      expect(getMonthFromDate('2026-02-11')).toBe('2026-02');
      expect(getMonthFromDate('2025-01-15')).toBe('2025-01');
      expect(getMonthFromDate('2026-12-31')).toBe('2026-12');
    });

    it('should throw error for invalid ISO date', () => {
      expect(() => getMonthFromDate('invalid')).toThrow();
      expect(() => getMonthFromDate('2026-2-11')).toThrow();
    });
  });

  describe('isValidISODate', () => {
    it('should return true for valid ISO dates', () => {
      expect(isValidISODate('2026-02-11')).toBe(true);
      expect(isValidISODate('2025-01-01')).toBe(true);
      expect(isValidISODate('2026-12-31')).toBe(true);
    });

    it('should return false for invalid ISO date formats', () => {
      expect(isValidISODate('2026-2-11')).toBe(false);
      expect(isValidISODate('02-11-2026')).toBe(false);
      expect(isValidISODate('invalid')).toBe(false);
      expect(isValidISODate('')).toBe(false);
    });

    it('should return false for invalid dates', () => {
      expect(isValidISODate('2026-13-01')).toBe(false); // Invalid month
      expect(isValidISODate('2026-02-30')).toBe(false); // Invalid day
      expect(isValidISODate('2026-00-01')).toBe(false); // Zero month
    });
  });
});
