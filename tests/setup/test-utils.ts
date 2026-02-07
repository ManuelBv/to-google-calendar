/**
 * Global test utilities and setup
 */

import { setupChromeMock } from './chrome-mock';
import 'fake-indexeddb/auto';

// Set up Chrome API mocks globally
beforeEach(() => {
  setupChromeMock();
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});

/**
 * Create a mock DOM element with innerHTML
 */
export const createMockDocument = (html: string): Document => {
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
};

/**
 * Wait for a condition to be true
 */
export const waitFor = async (
  condition: () => boolean,
  timeout = 1000,
  interval = 50
): Promise<void> => {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
};
