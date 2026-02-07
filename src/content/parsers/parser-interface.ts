/**
 * Parser interface for extensibility
 */

import { ParsedEvent } from '@/shared/types/event.types';

export interface AuthState {
  isAuthenticated: boolean;
  reason?: string;
}

export interface PageState {
  isCorrectPage: boolean;
  reason?: string;
}

export interface CalendarParser {
  name: string;
  canParse(url: string): boolean;
  detectAuthState(document: Document): AuthState;
  detectCorrectPage(document: Document): PageState;
  parse(document: Document): ParsedEvent[];
}
