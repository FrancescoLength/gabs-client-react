import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AutoBookingScheduler from "../../features/booking/AutoBookingScheduler";
import * as api from '../../api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, test, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../api');
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({ token: 'mock-token' }),
}));

describe('AutoBookingScheduler', () => {
    const mockStaticClasses = {
        'Monday': [
            { name: 'Yoga', start_time: '10:00', end_time: '11:00', instructor: 'Alice' }
        ],
        'Wednesday': [
            { name: 'Pilates', start_time: '12:00', end_time: '13:00', instructor: 'Bob' }
        ]
    };

    const mockOnActionSuccess = vi.fn();
    let queryClient;

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window.alert
        window.alert = vi.fn();
        // Mock window.location.reload
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: vi.fn() },
        });

        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });
    });

    const renderWithClient = (ui) => {
        return render(
            <QueryClientProvider client={queryClient}>
                {ui}
            </QueryClientProvider>
        );
    };

    test('renders grouped classes by day', () => {
        renderWithClient(<AutoBookingScheduler staticClasses={mockStaticClasses} onActionSuccess={mockOnActionSuccess} />);

        expect(screen.getByText('Monday')).toBeInTheDocument();
        expect(screen.getByText('Wednesday')).toBeInTheDocument();
    });

    test('expands accordion and shows classes', () => {
        renderWithClient(<AutoBookingScheduler staticClasses={mockStaticClasses} onActionSuccess={mockOnActionSuccess} />);

        // Click on Monday header to expand
        fireEvent.click(screen.getByText('Monday'));

        expect(screen.getByText(/Yoga/i)).toBeInTheDocument();
        expect(screen.getByText(/10:00 - 11:00/i)).toBeInTheDocument();
        expect(screen.getByText(/Alice/i)).toBeInTheDocument();
    });

    test('schedules auto booking successfully', async () => {
        api.scheduleAutoBook.mockResolvedValue({ message: 'Scheduled successfully' });

        renderWithClient(<AutoBookingScheduler staticClasses={mockStaticClasses} onActionSuccess={mockOnActionSuccess} />);

        // Expand Monday
        fireEvent.click(screen.getByText('Monday'));

        // Click Add Auto-Book button
        const scheduleButtons = screen.getAllByRole('button', { name: /Add Auto-Book/i });
        fireEvent.click(scheduleButtons[0]);

        await waitFor(() => {
            expect(api.scheduleAutoBook).toHaveBeenCalledWith('Yoga', 'Monday', '10:00', 'Alice');
            expect(mockOnActionSuccess).toHaveBeenCalled();
        });
    });

    test('handles schedule error', async () => {
        api.scheduleAutoBook.mockRejectedValue(new Error('Failed to schedule'));

        renderWithClient(<AutoBookingScheduler staticClasses={mockStaticClasses} onActionSuccess={mockOnActionSuccess} />);

        // Expand Monday
        fireEvent.click(screen.getByText('Monday'));

        // Click Add Auto-Book button
        const scheduleButtons = screen.getAllByRole('button', { name: /Add Auto-Book/i });
        fireEvent.click(scheduleButtons[0]);

        await waitFor(() => {
            // It calls alert on error usually
            expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Failed to schedule/));
        });
    });
});
