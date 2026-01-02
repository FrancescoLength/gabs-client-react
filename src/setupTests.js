import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Force cleanup after each test to prevent DOM leakage
afterEach(() => {
    cleanup();
});
