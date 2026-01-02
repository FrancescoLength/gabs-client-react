import { parse, isValid } from 'date-fns';

/**
 * Parses a booking date string like "Monday 1st January" into a Date object.
 * Handles year rollover (if the date is in the past relative to today, assumes next year).
 * @param dateString The date string to parse.
 * @param year Optional year to use (default: current year).
 * @returns Date object or null if parsing fails.
 */
export const parseBookingDate = (dateString: string, year = new Date().getFullYear()): Date | null => {
    if (!dateString) return null;
    // Remove ordinal suffixes (st, nd, rd, th)
    const cleanDateString = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1');
    try {
        const date = parse(cleanDateString, 'EEEE d MMMM', new Date());

        if (!isValid(date)) {
            return null;
        }

        date.setFullYear(year);

        // If the date is more than 1 day in the past, assume it's for next year.
        // Using "yesterday" as the cutoff to allow for slight time zone differences or late night checks.
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (date < yesterday) {
            date.setFullYear(year + 1);
        }
        return date;
    } catch (error) {
        console.error('Error parsing booking date:', error);
        return null;
    }
};

/**
 * Calculates the cancellation status for a booking.
 * @param bookingDate The Date object of the booking.
 * @param timeStr The time string (e.g., "10:30").
 * @param currentTime The current time (default: new Date()).
 * @param hoursBefore Deadline in hours before the class starts (default: 2).
 * @returns Object containing boolean canCancel and a descriptive status text.
 */
export const getCancellationStatus = (
    bookingDate: Date | null,
    timeStr: string,
    currentTime = new Date(),
    hoursBefore = 2
): { canCancel: boolean; statusText: string } => {
    if (!bookingDate || !timeStr) {
        return { canCancel: false, statusText: "" };
    }

    try {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const classTime = new Date(bookingDate);
        classTime.setHours(hours, minutes, 0, 0);

        const cancelDeadline = new Date(classTime.getTime() - hoursBefore * 60 * 60 * 1000);
        const diff = cancelDeadline.getTime() - currentTime.getTime();

        if (currentTime > classTime) {
            return { canCancel: false, statusText: "Class Finished" };
        } else if (diff < 0) {
            return { canCancel: false, statusText: "Cancellation closed" };
        } else {
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return { canCancel: true, statusText: `Cancel within: ${h}h ${m}m` };
        }
    } catch {
        return { canCancel: false, statusText: "Error calculating time" };
    }
};
