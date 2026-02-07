/**
 * Mock Chrome APIs for testing
 */

export const createChromeMock = () => {
  const listeners: { [key: string]: Array<(...args: any[]) => void> } = {};

  const chromeMock = {
    runtime: {
      sendMessage: vi.fn(),
      onMessage: {
        addListener: vi.fn((callback) => {
          if (!listeners['runtime.onMessage']) {
            listeners['runtime.onMessage'] = [];
          }
          listeners['runtime.onMessage'].push(callback);
        }),
        removeListener: vi.fn()
      },
      getURL: vi.fn((path: string) => `chrome-extension://mock-id/${path}`)
    },
    storage: {
      local: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn()
      },
      sync: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn()
      }
    },
    sidePanel: {
      setOptions: vi.fn(),
      setPanelBehavior: vi.fn()
    },
    tabs: {
      query: vi.fn(),
      sendMessage: vi.fn()
    },
    downloads: {
      download: vi.fn()
    }
  };

  // Helper to trigger message listeners
  const triggerMessage = (message: any, sender: any, sendResponse: any) => {
    const messageListeners = listeners['runtime.onMessage'] || [];
    messageListeners.forEach(listener => listener(message, sender, sendResponse));
  };

  return {
    chromeMock,
    triggerMessage,
    listeners
  };
};

// Set up global chrome mock
export const setupChromeMock = () => {
  const { chromeMock, triggerMessage, listeners } = createChromeMock();
  (globalThis as any).chrome = chromeMock;
  return { chromeMock, triggerMessage, listeners };
};
