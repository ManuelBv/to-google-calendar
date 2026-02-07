/**
 * ICS (iCalendar) file generator
 */

import { createEvents, EventAttributes } from 'ics';
import { EventRecord } from '@/shared/types/event.types';
import { parseISODate } from '@/shared/utils/date-utils';

export class ICSGenerator {
  /**
   * Generate ICS file content from events
   */
  async generate(events: EventRecord[]): Promise<string> {
    const icsEvents: EventAttributes[] = events.map((event) => {
      const dateArray = this.parseDate(event.date);

      return {
        start: dateArray,
        startInputType: 'local',
        startOutputType: 'local',
        duration: { days: 1 },
        title: `${event.title} - ${event.type}`,
        description: `Event Type: ${event.type}\nMetadata: ${event.metadata}\nSource: ${event.website}\n\n${event.url}`,
        url: event.url,
        status: 'CONFIRMED',
        busyStatus: 'FREE'
      };
    });

    const { error, value } = createEvents(icsEvents);

    if (error) {
      throw new Error(`Failed to generate ICS: ${error.message}`);
    }

    if (!value) {
      throw new Error('Failed to generate ICS: No content returned');
    }

    return value;
  }

  /**
   * Trigger download of ICS file
   */
  async download(icsContent: string): Promise<void> {
    // Use data URL instead of blob URL (service workers don't support createObjectURL)
    const dataUrl = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsContent);

    await chrome.downloads.download({
      url: dataUrl,
      filename: 'capedge-calendar.ics',
      saveAs: true
    });
  }

  /**
   * Parse ISO date string to ICS date array [year, month, day]
   */
  parseDate(isoDate: string): [number, number, number] {
    return parseISODate(isoDate);
  }
}
