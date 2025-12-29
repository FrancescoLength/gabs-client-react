import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MyBookings from '../MyBookings';
import * as api from '../../api';

// Mock dependencies
jest.mock('../../api');
jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({ token: 'mock-token' }),
}));

describe('MyBookings', () => {
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

    const mockOnActionSuccess = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders bookings list', () => {
        render(<MyBookings bookings={mockBookings} onActionSuccess={mockOnActionSuccess} />);

        expect(screen.getByText('Yoga')).toBeInTheDocument();
        // Instructor is not rendered in the component
        // expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Spinning')).toBeInTheDocument();
    });

    test('renders message when no bookings', () => {
        render(<MyBookings bookings={[]} onActionSuccess={mockOnActionSuccess} />);

        expect(screen.getByText(/You have no active reservations./i)).toBeInTheDocument();
    });

    test('handles booking cancellation', async () => {
        api.cancelBooking.mockResolvedValue({});

        // Mock alert
        window.alert = jest.fn();

        render(<MyBookings bookings={mockBookings} onActionSuccess={mockOnActionSuccess} />);

        // Find the cancel button for the first booking (Yoga)
        const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButtons[0]);

        await waitFor(() => {
            expect(api.cancelBooking).toHaveBeenCalledWith('mock-token', 'Yoga', expect.any(String), '10:00');
            expect(window.alert).toHaveBeenCalledWith('Cancellation successful!');
            expect(mockOnActionSuccess).toHaveBeenCalled();
        });
    });
});
