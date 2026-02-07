/**
 * CapEdge calendar parser implementation
 */

import { CalendarParser, AuthState, PageState } from './parser-interface';
import { ParsedEvent } from '@/shared/types/event.types';
import { mapMetadataToEventType } from '@/shared/utils/event-mapper';
import { CAPEDGE_URL_PATTERN } from '@/shared/constants';

export class CapEdgeParser implements CalendarParser {
  name = 'CapEdge';

  /**
   * Check if URL is a CapEdge dashboard page
   */
  canParse(url: string): boolean {
    return CAPEDGE_URL_PATTERN.test(url);
  }

  /**
   * Detect if user is authenticated
   * CapEdge shows a logout form when authenticated
   */
  detectAuthState(document: Document): AuthState {
    const logoutForm = document.querySelector('form[action*="/api/user/logout"]');

    if (logoutForm) {
      return { isAuthenticated: true };
    }

    return {
      isAuthenticated: false,
      reason: 'Please log in to CapEdge to extract calendar events.'
    };
  }

  /**
   * Detect if we're on the correct page with calendar
   */
  detectCorrectPage(document: Document): PageState {
    const calendarContainer = document.querySelector('.calendar-container');

    if (!calendarContainer) {
      return {
        isCorrectPage: false,
        reason: 'Please navigate to your CapEdge dashboard to see calendar events.'
      };
    }

    return { isCorrectPage: true };
  }

  /**
   * Parse calendar events from the page
   */
  parse(document: Document): ParsedEvent[] {
    const events: ParsedEvent[] = [];
    const calendarBody = document.querySelector('.calendar-body');

    if (!calendarBody) {
      return events;
    }

    // Get all calendar cells with dates
    const dateCells = calendarBody.querySelectorAll<HTMLTableCellElement>('td[data-date]');

    dateCells.forEach((cell) => {
      const date = cell.getAttribute('data-date');
      if (!date) return;

      // Find all event links in this cell
      const eventLinks = cell.querySelectorAll<HTMLAnchorElement>(
        'a.data-list-item[data-metadata]'
      );

      eventLinks.forEach((link) => {
        const metadata = link.getAttribute('data-metadata');
        const title = link.textContent?.trim();
        const url = link.href;

        if (!metadata || !title || !url) return;

        const type = mapMetadataToEventType(metadata);

        events.push({
          title,
          date,
          type,
          url,
          metadata
        });
      });
    });

    return events;
  }
}
