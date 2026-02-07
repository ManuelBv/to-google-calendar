/**
 * Service worker (background script)
 * Handles message routing and coordinates between content script, side panel, and database
 */

import { MessageType, ExtensionMessage } from '@/shared/types/message.types';
import { Database } from '@/shared/db/database';
import { createEventRecord } from '@/shared/utils/event-mapper';
import { ICSGenerator } from '@/shared/generators/ics-generator';

// Initialize database
const db = new Database();
db.init().catch((error) => {
  console.error('[Service Worker] Failed to initialize database:', error);
});

/**
 * Message handler
 */
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {
        case MessageType.PARSE_PAGE:
          await handleParsePage(message.payload);
          break;

        case MessageType.GET_EVENTS:
          const events = await handleGetEvents(message.payload.filters);
          sendResponse({ success: true, events });
          break;

        case MessageType.UPDATE_FILTERS:
          await handleUpdateFilters(message.payload.filters);
          sendResponse({ success: true });
          break;

        case MessageType.DOWNLOAD_ICS:
          await handleDownloadICS(message.payload.events);
          sendResponse({ success: true });
          break;

        default:
          console.warn('[Service Worker] Unknown message type:', message);
      }
    } catch (error) {
      console.error('[Service Worker] Error handling message:', error);
      sendResponse({ success: false, error: String(error) });
    }
  })();

  // Return true to indicate async response
  return true;
});

/**
 * Handle PARSE_PAGE message
 */
async function handleParsePage(payload: { events: any[]; website: string }) {
  const { events } = payload;
  const timestamp = Date.now();

  // Convert parsed events to event records
  const eventRecords = events.map((event) =>
    createEventRecord(event, 'capedge', timestamp)
  );

  // Save to database
  await db.saveEvents(eventRecords);

  // Notify side panel
  chrome.runtime.sendMessage({
    type: MessageType.PARSING_COMPLETE,
    payload: {
      count: eventRecords.length
    }
  });

  console.log(`[Service Worker] Saved ${eventRecords.length} events`);
}

/**
 * Handle GET_EVENTS message
 */
async function handleGetEvents(filters: any) {
  if (filters) {
    return await db.getFilteredEvents(filters);
  }
  return await db.getAllEvents();
}

/**
 * Handle UPDATE_FILTERS message
 */
async function handleUpdateFilters(filters: any) {
  const preferences = await db.getPreferences();
  preferences.eventFilters = filters;
  preferences.lastSync = Date.now();
  await db.updatePreferences(preferences);
  console.log('[Service Worker] Updated filters:', filters);
}

/**
 * Handle DOWNLOAD_ICS message
 */
async function handleDownloadICS(events: any[]) {
  try {
    console.log('[Service Worker] Starting ICS download for', events.length, 'events');

    const generator = new ICSGenerator();
    const icsContent = await generator.generate(events);
    console.log('[Service Worker] ICS content generated, length:', icsContent.length);

    await generator.download(icsContent);
    console.log('[Service Worker] Download triggered successfully');
  } catch (error) {
    console.error('[Service Worker] Error in handleDownloadICS:', error);
    throw error;
  }
}

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id }).catch((error) => {
      console.error('[Service Worker] Failed to open side panel:', error);
    });
  }
});

console.log('[Service Worker] Initialized');
