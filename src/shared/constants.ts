/**
 * Shared constants
 */

export const WEBSITES = {
  CAPEDGE: 'capedge'
} as const;

export const EVENT_TYPE_LABELS: Record<string, string> = {
  earnings: 'Earnings',
  financial: 'Financial',
  ownership: 'Ownership',
  registration: 'Registration',
  news: 'News'
};

export const DEFAULT_FILTERS = {
  earnings: true,
  financial: true,
  ownership: false,
  registration: false,
  news: false
};

export const CAPEDGE_URL_PATTERN = /^https:\/\/capedge\.com\/user\/dashboard/;
