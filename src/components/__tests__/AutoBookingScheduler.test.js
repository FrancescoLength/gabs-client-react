import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AutoBookingScheduler from '../AutoBookingScheduler';
import * as api from '../../api';

// Mock dependencies
jest.mock('../../api');
jest.mock('../../context/AuthContext', () => ({
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

    const mockOnActionSuccess = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock window.alert
        window.alert = jest.fn();
        // Mock window.location.reload
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: jest.fn() },
        });
    });

    test('renders grouped classes by day', () => {
        render(<AutoBookingScheduler staticClasses={mockStaticClasses} onActionSuccess={mockOnActionSuccess} />);

        expect(screen.getByText('Monday')).toBeInTheDocument();
        expect(screen.getByText('Wednesday')).toBeInTheDocument();
    });

    test('expands accordion and shows classes', () => {
        render(<AutoBookingScheduler staticClasses={mockStaticClasses} onActionSuccess={mockOnActionSuccess} />);

        // Click on Monday header to expand
        fireEvent.click(screen.getByText('Monday'));

        expect(screen.getByText(/10:00 - 11:00 - Yoga \(Alice\)/i)).toBeInTheDocument();
    });

    test('schedules auto booking successfully', async () => {
        api.scheduleAutoBook.mockResolvedValue({ message: 'Scheduled successfully' });

        render(<AutoBookingScheduler staticClasses={mockStaticClasses} onActionSuccess={mockOnActionSuccess} />);

        // Expand Monday
        fireEvent.click(screen.getByText('Monday'));

        // Click Schedule button for the first class in Monday
        const scheduleButtons = screen.getAllByRole('button', { name: /Schedule Auto-Book/i });
        fireEvent.click(scheduleButtons[0]);

        await waitFor(() => {
            expect(api.scheduleAutoBook).toHaveBeenCalledWith(
                'mock-token',
                'Yoga',
                'Monday',
                '10:00',
                'Alice'
            );
            expect(window.alert).toHaveBeenCalledWith('"Scheduled successfully"');
            expect(window.location.reload).toHaveBeenCalled();
            expect(mockOnActionSuccess).toHaveBeenCalled();
        });
    });

    test('handles schedule error', async () => {
        api.scheduleAutoBook.mockRejectedValue(new Error('Failed to schedule'));

        render(<AutoBookingScheduler staticClasses={mockStaticClasses} onActionSuccess={mockOnActionSuccess} />);

        // Expand Monday
        fireEvent.click(screen.getByText('Monday'));

        // Click Schedule button
        const scheduleButtons = screen.getAllByRole('button', { name: /Schedule Auto-Book/i });
        fireEvent.click(scheduleButtons[0]);

        await waitFor(() => {
            expect(screen.getByText(/Failed to schedule/i)).toBeInTheDocument();
        });
    });
});
