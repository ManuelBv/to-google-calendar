/**
 * Message passing types for Chrome extension communication
 */

import { ParsedEvent, EventRecord, EventFilters } from './event.types';

export enum MessageType {
  PARSE_PAGE = 'PARSE_PAGE',
  PARSING_COMPLETE = 'PARSING_COMPLETE',
  PARSING_ERROR = 'PARSING_ERROR',
  GET_EVENTS = 'GET_EVENTS',
  DOWNLOAD_ICS = 'DOWNLOAD_ICS',
  UPDATE_FILTERS = 'UPDATE_FILTERS'
}

export interface ParsePageMessage {
  type: MessageType.PARSE_PAGE;
  payload: {
    events: ParsedEvent[];
    website: string;
  };
}

export interface ParsingCompleteMessage {
  type: MessageType.PARSING_COMPLETE;
  payload: {
    count: number;
  };
}

export interface ParsingErrorMessage {
  type: MessageType.PARSING_ERROR;
  payload: {
    error: string;
    reason?: string;
  };
}

export interface GetEventsMessage {
  type: MessageType.GET_EVENTS;
  payload: {
    filters?: EventFilters;
  };
}

export interface DownloadICSMessage {
  type: MessageType.DOWNLOAD_ICS;
  payload: {
    events: EventRecord[];
  };
}

export interface UpdateFiltersMessage {
  type: MessageType.UPDATE_FILTERS;
  payload: {
    filters: EventFilters;
  };
}

export type ExtensionMessage =
  | ParsePageMessage
  | ParsingCompleteMessage
  | ParsingErrorMessage
  | GetEventsMessage
  | DownloadICSMessage
  | UpdateFiltersMessage;
