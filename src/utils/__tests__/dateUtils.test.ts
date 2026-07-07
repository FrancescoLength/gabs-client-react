import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { parseBookingDate, getCancellationStatus } from '../dateUtils';

describe('dateUtils', () => {
    describe('parseBookingDate', () => {
        beforeEach(() => {
            // Mock current date to a fixed point: Jan 1st 2024
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2024, 0, 1)); // 2024-01-01
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('parses a standard date string with ordinal suffix', () => {
            const result = parseBookingDate('Monday 15th January');
            expect(result).toBeInstanceOf(Date);
            expect(result?.getDate()).toBe(15);
            expect(result?.getMonth()).toBe(0); // January
            expect(result?.getFullYear()).toBe(2024);
        });

        it('handling next year rollover for past dates', () => {
            // From June 1st, "January 1st" is in the past: it must roll over to next year
            vi.setSystemTime(new Date(2024, 5, 1));

            const result = parseBookingDate('Monday 1st January');
            expect(result?.getFullYear()).toBe(2025);
        });

        it('returns null for invalid strings', () => {
            const result = parseBookingDate('Invalid Date String');
            expect(result).toBeNull();
        });
    });

    describe('getCancellationStatus', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('allows cancellation if well before deadline', () => {
            const bookingDate = new Date(2024, 0, 1, 10, 0); // Jan 1st 10:00
            const classTimeStr = "10:00";
            // 2 hours before is 08:00.
            // Current time: 06:00
            const currentTime = new Date(2024, 0, 1, 6, 0);

            const result = getCancellationStatus(bookingDate, classTimeStr, currentTime);
            expect(result.canCancel).toBe(true);
            expect(result.statusText).toContain('Cancel within:');
        });

        it('disallows cancellation if after deadline', () => {
            const bookingDate = new Date(2024, 0, 1, 10, 0);
            const classTimeStr = "10:00";
            // Deadline 08:00.
            // Current time: 09:00
            const currentTime = new Date(2024, 0, 1, 9, 0);

            const result = getCancellationStatus(bookingDate, classTimeStr, currentTime);
            expect(result.canCancel).toBe(false);
            expect(result.statusText).toBe("Cancellation closed");
        });

        it('returns finished if class time has passed', () => {
            const bookingDate = new Date(2024, 0, 1, 10, 0);
            const classTimeStr = "10:00";
            // Current time 11:00
            const currentTime = new Date(2024, 0, 1, 11, 0);
            const result = getCancellationStatus(bookingDate, classTimeStr, currentTime);
            expect(result.canCancel).toBe(false);
            expect(result.statusText).toBe("Class Finished");
        });
    });
});
