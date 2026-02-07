/**
 * Content script entry point
 * Runs on CapEdge dashboard pages to extract calendar events
 */

import { CapEdgeParser } from './parsers/capedge-parser';
import { MessageType } from '@/shared/types/message.types';

// Initialize parser
const parser = new CapEdgeParser();

/**
 * Main content script logic with retry for dynamic content
 */
function init() {
  const currentUrl = window.location.href;

  // Check if we can parse this URL
  if (!parser.canParse(currentUrl)) {
    console.log('[Calendar Extension] Not a CapEdge dashboard page');
    return;
  }

  // Check authentication
  const authState = parser.detectAuthState(document);
  if (!authState.isAuthenticated) {
    console.log('[Calendar Extension] Not authenticated:', authState.reason);
    chrome.runtime.sendMessage({
      type: MessageType.PARSING_ERROR,
      payload: {
        error: 'Not authenticated',
        reason: authState.reason
      }
    });
    return;
  }

  // Check correct page
  const pageState = parser.detectCorrectPage(document);
  if (!pageState.isCorrectPage) {
    console.log('[Calendar Extension] Not on correct page:', pageState.reason);
    chrome.runtime.sendMessage({
      type: MessageType.PARSING_ERROR,
      payload: {
        error: 'Incorrect page',
        reason: pageState.reason
      }
    });
    return;
  }

  // Parse events with retry mechanism
  parseWithRetry();
}

/**
 * Parse events with retry for dynamically loaded content
 */
function parseWithRetry(attempt = 1, maxAttempts = 5) {
  const events = parser.parse(document);

  if (events.length > 0) {
    console.log(`[Calendar Extension] Found ${events.length} events on attempt ${attempt}`);

    // Send events to background script
    chrome.runtime.sendMessage({
      type: MessageType.PARSE_PAGE,
      payload: {
        events,
        website: 'capedge'
      }
    });
  } else if (attempt < maxAttempts) {
    // Calendar might still be loading, retry after a delay
    console.log(`[Calendar Extension] No events found, retrying... (${attempt}/${maxAttempts})`);
    setTimeout(() => parseWithRetry(attempt + 1, maxAttempts), 1000);
  } else {
    console.log(`[Calendar Extension] Found 0 events after ${maxAttempts} attempts`);

    // Send empty result
    chrome.runtime.sendMessage({
      type: MessageType.PARSE_PAGE,
      payload: {
        events: [],
        website: 'capedge'
      }
    });
  }
}

// Export for CRX plugin loader
export function onExecute() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
