import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Replace the native implementations with mocks
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Clean up after each test
afterEach(() => {
  cleanup();
  window.localStorage.clear();
  global.fetch.mockClear();
});

// Mock fetch API
global.fetch = vi.fn();