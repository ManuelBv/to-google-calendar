/**
 * Mock event data for testing
 */

import { ParsedEvent, EventRecord } from '@/shared/types/event.types';

export const mockParsedEvents: ParsedEvent[] = [
  {
    title: 'GILT',
    date: '2026-02-04',
    type: 'News',
    url: 'https://capedge.com/filing/897322',
    metadata: '6-K'
  },
  {
    title: 'GILT',
    date: '2026-02-10',
    type: 'Earnings',
    url: 'https://capedge.com/company/897322/filings',
    metadata: 'Earnings'
  },
  {
    title: 'ELMD',
    date: '2026-02-10',
    type: 'Earnings',
    url: 'https://capedge.com/company/1488917/filings',
    metadata: 'Earnings'
  },
  {
    title: 'RDCM',
    date: '2026-02-11',
    type: 'Earnings',
    url: 'https://capedge.com/company/1016838/filings',
    metadata: 'Earnings'
  },
  {
    title: 'ACME',
    date: '2026-02-12',
    type: 'Financial',
    url: 'https://capedge.com/filing/123',
    metadata: '10-K'
  },
  {
    title: 'BETA',
    date: '2026-02-13',
    type: 'Ownership',
    url: 'https://capedge.com/filing/456',
    metadata: '4'
  },
  {
    title: 'GAMMA',
    date: '2026-02-14',
    type: 'Registration',
    url: 'https://capedge.com/filing/789',
    metadata: 'S-8'
  }
];

export const mockEventRecords: EventRecord[] = mockParsedEvents.map((event, index) => ({
  ...event,
  id: `capedge-${event.date}-${event.title}`,
  website: 'capedge' as const,
  timestamp: 1707600000000 + index * 1000,
  month: event.date.substring(0, 7)
}));
