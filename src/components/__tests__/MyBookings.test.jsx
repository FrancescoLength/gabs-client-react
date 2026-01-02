import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MyBookings from '../MyBookings';
import * as api from '../../api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

// Mock dependencies
vi.mock('../../api');
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({ token: 'mock-token' }),
}));

describe('MyBookings', () => {
    // 2024: Jan 1 is Monday.
    // We lock time to 2024 to make parsing reliable.
    const mockBookings = [
        {
            id: 1,
            name: 'Yoga',
            date: 'Monday 1st January',
            time: '10:00',
            instructor: 'Alice'
        },
        {
            id: 2,
            name: 'Spinning',
            date: 'Tuesday 2nd January',
            time: '12:00',
            instructor: 'Bob'
        }
    ];

    const mockOnActionSuccess = vi.fn();
    let queryClient;

    beforeEach(() => {
        vi.clearAllMocks();
        // Use Real Timers to avoid promise timeouts
        vi.useRealTimers();

        // Mock Date to ensure 2024 context (Jan 1 = Monday)
        const mockDate = new Date('2024-01-01T07:00:00');
        const OriginalDate = Date;
        vi.spyOn(global, 'Date').mockImplementation(function (...args) {
            if (args.length) {
                return new OriginalDate(...args);
            }
            return mockDate;
        });

        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderWithClient = (ui) => {
        return render(
            <QueryClientProvider client={queryClient}>
                {ui}
            </QueryClientProvider>
        );
    };

    test('renders bookings list', () => {
        renderWithClient(<MyBookings bookings={mockBookings} onActionSuccess={mockOnActionSuccess} />);

        expect(screen.getByText('Yoga')).toBeInTheDocument();
        expect(screen.getByText('Spinning')).toBeInTheDocument();
    });

    test('renders message when no bookings', () => {
        renderWithClient(<MyBookings bookings={[]} onActionSuccess={mockOnActionSuccess} />);

        expect(screen.getByText(/You have no upcoming bookings./i)).toBeInTheDocument();
    });

    test('handles booking cancellation', async () => {
        api.cancelBooking.mockResolvedValue({ message: 'Cancelled successfully' });

        // Mock alert and confirm
        vi.spyOn(window, 'alert').mockImplementation(() => { });
        vi.spyOn(window, 'confirm').mockImplementation(() => true);

        renderWithClient(<MyBookings bookings={mockBookings} onActionSuccess={mockOnActionSuccess} />);

        // Find the cancel button for the first booking (Yoga)
        const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButtons[0]);

        await waitFor(() => {
            expect(api.cancelBooking).toHaveBeenCalledWith('mock-token', 'Yoga', expect.any(String), '10:00');
            expect(mockOnActionSuccess).toHaveBeenCalled();
        });
    });
});
