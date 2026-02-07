/**
 * Side panel main application
 */

import { MessageType } from '@/shared/types/message.types';
import { EventRecord, EventFilters } from '@/shared/types/event.types';
import { DEFAULT_FILTERS } from '@/shared/constants';

class SidePanelApp {
  private events: EventRecord[] = [];
  private filters: EventFilters = { ...DEFAULT_FILTERS };

  // DOM elements
  private statusMessage!: HTMLElement;
  private eventList!: HTMLElement;
  private eventCount!: HTMLElement;
  private downloadButton!: HTMLButtonElement;
  private refreshButton!: HTMLButtonElement;

  // Filter checkboxes
  private filterCheckboxes!: {
    earnings: HTMLInputElement;
    financial: HTMLInputElement;
    ownership: HTMLInputElement;
    registration: HTMLInputElement;
    news: HTMLInputElement;
  };

  constructor() {
    this.init();
  }

  private init() {
    // Get DOM elements
    this.statusMessage = document.getElementById('status-message')!;
    this.eventList = document.getElementById('event-list')!;
    this.eventCount = document.getElementById('event-count')!;
    this.downloadButton = document.getElementById('download-button') as HTMLButtonElement;
    this.refreshButton = document.getElementById('refresh-button') as HTMLButtonElement;

    // Get filter checkboxes
    this.filterCheckboxes = {
      earnings: document.getElementById('filter-earnings') as HTMLInputElement,
      financial: document.getElementById('filter-financial') as HTMLInputElement,
      ownership: document.getElementById('filter-ownership') as HTMLInputElement,
      registration: document.getElementById('filter-registration') as HTMLInputElement,
      news: document.getElementById('filter-news') as HTMLInputElement
    };

    // Set up event listeners
    this.setupEventListeners();

    // Load initial data
    this.loadEvents();

    // Listen for messages from service worker
    this.setupMessageListener();
  }

  private setupEventListeners() {
    // Download button
    this.downloadButton.addEventListener('click', () => this.handleDownload());

    // Refresh button
    this.refreshButton.addEventListener('click', () => this.handleRefresh());

    // Filter checkboxes
    Object.keys(this.filterCheckboxes).forEach((key) => {
      const checkbox = this.filterCheckboxes[key as keyof typeof this.filterCheckboxes];
      checkbox.addEventListener('change', () => this.handleFilterChange());
    });
  }

  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === MessageType.PARSING_COMPLETE) {
        this.showSuccess(`Found ${message.payload.count} events`);
        this.loadEvents();
      } else if (message.type === MessageType.PARSING_ERROR) {
        this.showError(message.payload.reason || message.payload.error);
      }
    });
  }

  private async loadEvents() {
    try {
      // Get current filters from checkboxes
      this.updateFiltersFromUI();

      const response = await chrome.runtime.sendMessage({
        type: MessageType.GET_EVENTS,
        payload: { filters: this.filters }
      });

      if (response?.success) {
        this.events = response.events || [];
        this.renderEvents();
        this.updateDownloadButton();
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      this.showError('Failed to load events');
    }
  }

  private updateFiltersFromUI() {
    this.filters = {
      earnings: this.filterCheckboxes.earnings.checked,
      financial: this.filterCheckboxes.financial.checked,
      ownership: this.filterCheckboxes.ownership.checked,
      registration: this.filterCheckboxes.registration.checked,
      news: this.filterCheckboxes.news.checked
    };
  }

  private async handleFilterChange() {
    this.updateFiltersFromUI();

    // Save filters to database
    await chrome.runtime.sendMessage({
      type: MessageType.UPDATE_FILTERS,
      payload: { filters: this.filters }
    });

    // Reload events with new filters
    await this.loadEvents();
  }

  private async handleDownload() {
    if (this.events.length === 0) {
      this.showError('No events to download');
      return;
    }

    try {
      this.downloadButton.disabled = true;
      this.downloadButton.textContent = '⏳ Downloading...';

      const response = await chrome.runtime.sendMessage({
        type: MessageType.DOWNLOAD_ICS,
        payload: { events: this.events }
      });

      if (response?.success) {
        this.showSuccess('ICS file downloaded successfully!');
      } else {
        this.showError('Failed to download ICS file');
      }
    } catch (error) {
      console.error('Failed to download:', error);
      this.showError('Failed to download ICS file');
    } finally {
      this.downloadButton.disabled = false;
      this.downloadButton.textContent = '⬇️ Download .ics File';
    }
  }

  private async handleRefresh() {
    try {
      this.refreshButton.disabled = true;
      this.refreshButton.textContent = '🔄 Refreshing...';

      // Get the current tab and trigger content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab?.id) {
        this.showError('No active tab found');
        return;
      }

      // The content script should automatically run on CapEdge dashboard pages
      // We just need to reload the events
      await this.loadEvents();

      this.showInfo('Please navigate to CapEdge dashboard to extract events');
    } catch (error) {
      console.error('Failed to refresh:', error);
      this.showError('Failed to refresh events');
    } finally {
      this.refreshButton.disabled = false;
      this.refreshButton.textContent = '🔄 Refresh Events';
    }
  }

  private renderEvents() {
    this.eventList.innerHTML = '';

    if (this.events.length === 0) {
      this.eventList.innerHTML = '<div class="loading">No events found. Visit CapEdge dashboard to extract events.</div>';
      this.eventCount.textContent = '0 events';
      return;
    }

    this.eventCount.textContent = `${this.events.length} event${this.events.length === 1 ? '' : 's'}`;

    this.events.forEach((event) => {
      const eventItem = document.createElement('div');
      eventItem.className = 'event-item';

      eventItem.innerHTML = `
        <div class="event-info">
          <div class="event-title">${this.escapeHtml(event.title)}</div>
          <div class="event-meta">
            ${event.date}
            <span class="event-type ${event.type.toLowerCase()}">${event.type}</span>
          </div>
        </div>
      `;

      this.eventList.appendChild(eventItem);
    });
  }

  private updateDownloadButton() {
    this.downloadButton.disabled = this.events.length === 0;
  }

  private showError(message: string) {
    this.statusMessage.className = 'status-message error';
    this.statusMessage.textContent = `❌ ${message}`;
  }

  private showSuccess(message: string) {
    this.statusMessage.className = 'status-message success';
    this.statusMessage.textContent = `✅ ${message}`;

    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.statusMessage.className = 'status-message';
    }, 3000);
  }

  private showInfo(message: string) {
    this.statusMessage.className = 'status-message info';
    this.statusMessage.textContent = `ℹ️ ${message}`;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SidePanelApp());
} else {
  new SidePanelApp();
}
