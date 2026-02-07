/**
 * Tests for CapEdge parser
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CapEdgeParser } from '@/content/parsers/capedge-parser';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createMockDocument } from '../../setup/test-utils';

describe('CapEdgeParser', () => {
  let parser: CapEdgeParser;
  let calendarDoc: Document;
  let emptyDoc: Document;
  let notAuthDoc: Document;

  beforeEach(() => {
    parser = new CapEdgeParser();

    // Load fixture HTML
    const fixtureHTML = readFileSync(
      resolve(__dirname, '../../fixtures/capedge-calendar.html'),
      'utf-8'
    );
    calendarDoc = createMockDocument(fixtureHTML);

    // Create empty document (no calendar)
    emptyDoc = createMockDocument('<html><body><div>Not a calendar page</div></body></html>');

    // Create not authenticated document (no logout form)
    notAuthDoc = createMockDocument(
      '<html><body><div class="calendar-container"></div></body></html>'
    );
  });

  describe('canParse', () => {
    it('should return true for CapEdge dashboard URLs', () => {
      expect(parser.canParse('https://capedge.com/user/dashboard')).toBe(true);
      expect(parser.canParse('https://capedge.com/user/dashboard#2026,1,2026-02-06')).toBe(true);
      expect(parser.canParse('https://capedge.com/user/dashboard?foo=bar')).toBe(true);
    });

    it('should return false for non-CapEdge URLs', () => {
      expect(parser.canParse('https://example.com')).toBe(false);
      expect(parser.canParse('https://capedge.com/other-page')).toBe(false);
      expect(parser.canParse('https://capedge.com/user/settings')).toBe(false);
    });

    it('should return false for invalid URLs', () => {
      expect(parser.canParse('')).toBe(false);
      expect(parser.canParse('not-a-url')).toBe(false);
    });
  });

  describe('detectAuthState', () => {
    it('should detect authenticated state when logout form exists', () => {
      const authState = parser.detectAuthState(calendarDoc);
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.reason).toBeUndefined();
    });

    it('should detect unauthenticated state when logout form is missing', () => {
      const authState = parser.detectAuthState(notAuthDoc);
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.reason).toBe('Please log in to CapEdge to extract calendar events.');
    });

    it('should detect unauthenticated state on empty document', () => {
      const authState = parser.detectAuthState(emptyDoc);
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.reason).toBeDefined();
    });
  });

  describe('detectCorrectPage', () => {
    it('should detect correct page when calendar container exists', () => {
      const pageState = parser.detectCorrectPage(calendarDoc);
      expect(pageState.isCorrectPage).toBe(true);
      expect(pageState.reason).toBeUndefined();
    });

    it('should detect incorrect page when calendar container is missing', () => {
      const pageState = parser.detectCorrectPage(emptyDoc);
      expect(pageState.isCorrectPage).toBe(false);
      expect(pageState.reason).toBe(
        'Please navigate to your CapEdge dashboard to see calendar events.'
      );
    });
  });

  describe('parse', () => {
    it('should parse all events from calendar', () => {
      const events = parser.parse(calendarDoc);

      expect(events).toHaveLength(7);
    });

    it('should correctly parse event details', () => {
      const events = parser.parse(calendarDoc);

      // Check first event (GILT 6-K on Feb 4)
      const giltNews = events.find(e => e.title === 'GILT' && e.date === '2026-02-04');
      expect(giltNews).toBeDefined();
      expect(giltNews?.type).toBe('News');
      expect(giltNews?.metadata).toBe('6-K');
      expect(giltNews?.url).toBe('https://capedge.com/filing/897322');

      // Check Earnings event
      const rdcmEarnings = events.find(e => e.title === 'RDCM');
      expect(rdcmEarnings).toBeDefined();
      expect(rdcmEarnings?.date).toBe('2026-02-11');
      expect(rdcmEarnings?.type).toBe('Earnings');
      expect(rdcmEarnings?.metadata).toBe('Earnings');

      // Check Financial event
      const acmeFinancial = events.find(e => e.title === 'ACME');
      expect(acmeFinancial).toBeDefined();
      expect(acmeFinancial?.date).toBe('2026-02-12');
      expect(acmeFinancial?.type).toBe('Financial');
      expect(acmeFinancial?.metadata).toBe('10-K');

      // Check Ownership event
      const betaOwnership = events.find(e => e.title === 'BETA');
      expect(betaOwnership).toBeDefined();
      expect(betaOwnership?.date).toBe('2026-02-13');
      expect(betaOwnership?.type).toBe('Ownership');
      expect(betaOwnership?.metadata).toBe('4');

      // Check Registration event
      const gammaReg = events.find(e => e.title === 'GAMMA');
      expect(gammaReg).toBeDefined();
      expect(gammaReg?.date).toBe('2026-02-14');
      expect(gammaReg?.type).toBe('Registration');
      expect(gammaReg?.metadata).toBe('S-8');
    });

    it('should handle multiple events on same day', () => {
      const events = parser.parse(calendarDoc);

      // Feb 10 has two earnings events
      const feb10Events = events.filter(e => e.date === '2026-02-10');
      expect(feb10Events).toHaveLength(2);
      expect(feb10Events.every(e => e.type === 'Earnings')).toBe(true);
    });

    it('should return empty array when calendar body is missing', () => {
      const events = parser.parse(emptyDoc);
      expect(events).toEqual([]);
    });

    it('should handle calendar with no events', () => {
      const noEventsHTML = `
        <html>
          <body>
            <div class="calendar-container">
              <table>
                <tbody class="calendar-body">
                  <tr>
                    <td data-date="2026-02-01"><div class="day-num">1</div></td>
                    <td data-date="2026-02-02"><div class="day-num">2</div></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </body>
        </html>
      `;
      const noEventsDoc = createMockDocument(noEventsHTML);
      const events = parser.parse(noEventsDoc);
      expect(events).toEqual([]);
    });
  });

  describe('name property', () => {
    it('should have correct parser name', () => {
      expect(parser.name).toBe('CapEdge');
    });
  });
});
