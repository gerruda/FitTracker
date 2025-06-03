import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach } from 'vitest';
import { config } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createPinia } from 'pinia';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
};

global.localStorage = localStorageMock;

// Configure Vue Test Utils
beforeAll(() => {
  config.global.plugins = [
    createTestingPinia({
      createSpy: vi.fn,
    }),
    createPinia()
  ];

  config.global.mocks = {
    $router: {
      push: vi.fn(),
      replace: vi.fn(),
    },
  };
});

// Clear mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Mock window.confirm
vi.stubGlobal('confirm', vi.fn())

// Mock Intl.DateTimeFormat
const mockDateTimeFormat = vi.fn(() => ({
  format: (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU')
  }
}))

vi.stubGlobal('Intl', {
  DateTimeFormat: mockDateTimeFormat
}) 