import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClassList from '../ClassList';
import * as api from '../../api';

// Mock dependencies
jest.mock('../../api');
jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({ token: 'mock-token' }),
}));

describe('ClassList', () => {
    const mockClasses = [
        {
            name: 'Yoga',
            date: '01/01/2023',
            start_time: '10:00',
            end_time: '11:00',
            duration: 60,
            instructor: 'Alice',
            available_spaces: 5
        },
        {
            name: 'Pilates',
            date: '01/01/2023',
            start_time: '12:00',
            end_time: '13:00',
            duration: 60,
            instructor: 'Bob',
            available_spaces: 0
        }
    ];

    const mockOnActionSuccess = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        window.alert = jest.fn();
    });

    test('renders grouped classes by date', () => {
        render(<ClassList classes={mockClasses} onActionSuccess={mockOnActionSuccess} />);

        // Check for date header (assuming 01/01/2023 is Sunday)
        expect(screen.getByText(/Sunday - 01\/01\/2023/i)).toBeInTheDocument();
    });

    test('renders class details', () => {
        render(<ClassList classes={mockClasses} onActionSuccess={mockOnActionSuccess} />);

        // Expand the accordion for the date
        fireEvent.click(screen.getByText(/Sunday - 01\/01\/2023/i));

        expect(screen.getByText('Yoga')).toBeInTheDocument();
        // Use getAllByText because multiple classes might have these labels
        expect(screen.getAllByText(/Instructor: Alice/i)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/Available Spaces:/i)[0]).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    test('bookings class successfully', async () => {
        api.bookClass.mockResolvedValue({ status: 'success' });

        render(<ClassList classes={mockClasses} onActionSuccess={mockOnActionSuccess} />);
        fireEvent.click(screen.getByText(/Sunday - 01\/01\/2023/i));

        // Click Book button for Yoga
        const bookButtons = screen.getAllByRole('button', { name: /^Book$/i });
        fireEvent.click(bookButtons[0]);

        await waitFor(() => {
            expect(api.bookClass).toHaveBeenCalledWith('mock-token', 'Yoga', '2023-01-01', '10:00');
            expect(window.alert).toHaveBeenCalledWith('Booking successful!');
            expect(mockOnActionSuccess).toHaveBeenCalled();
        });
    });

    test('books waiting list when full', async () => {
        api.bookClass.mockResolvedValue({ status: 'success' });

        render(<ClassList classes={mockClasses} onActionSuccess={mockOnActionSuccess} />);
        fireEvent.click(screen.getByText(/Sunday - 01\/01\/2023/i));

        // Finds "Book Waitinglist" button
        const waitlistButton = screen.getByRole('button', { name: /Book Waitinglist/i });
        fireEvent.click(waitlistButton);

        await waitFor(() => {
            expect(api.bookClass).toHaveBeenCalledWith('mock-token', 'Pilates', '2023-01-01', '12:00');
        });
    });

    test('handles booking error', async () => {
        api.bookClass.mockRejectedValue(new Error('Booking failed'));

        render(<ClassList classes={mockClasses} onActionSuccess={mockOnActionSuccess} />);
        fireEvent.click(screen.getByText(/Sunday - 01\/01\/2023/i));

        const bookButtons = screen.getAllByRole('button', { name: /^Book$/i });
        fireEvent.click(bookButtons[0]);

        await waitFor(() => {
            expect(screen.getByText(/Booking failed/i)).toBeInTheDocument();
        });
    });
});
