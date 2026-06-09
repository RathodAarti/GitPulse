import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend vitest with jest-dom matchers
expect.extend(matchers);

// Clear up DOM after each test
afterEach(() => {
  cleanup();
});
