import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClassList from "../../features/booking/ClassList";
import * as api from '../../api';

// Mock dependencies
vi.mock('../../api');
vi.mock('../../context/AuthContext', () => ({
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

    const mockOnActionSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        window.alert = vi.fn();
    });

    test('renders grouped classes by date', () => {
        render(<ClassList classes={mockClasses} onActionSuccess={mockOnActionSuccess} />);

        // Check for date header components
        expect(screen.getByText('Sunday')).toBeInTheDocument();
        expect(screen.getByText('01/01/2023')).toBeInTheDocument();
    });

    test('renders class details', () => {
        render(<ClassList classes={mockClasses} onActionSuccess={mockOnActionSuccess} />);

        // Expand the accordion for the date. Click the date text.
        fireEvent.click(screen.getByText('01/01/2023'));

        expect(screen.getByText('Yoga')).toBeInTheDocument();
        // Use getAllByText because multiple classes might have these labels
        // Need to be careful with exact content matching
        expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument();
        expect(screen.getByText('5 spaces left')).toBeInTheDocument();
    });

    test('bookings class successfully', async () => {
        api.bookClass.mockResolvedValue({ status: 'success' });

        render(<ClassList classes={mockClasses} onActionSuccess={mockOnActionSuccess} />);
        fireEvent.click(screen.getByText('01/01/2023'));

        // Click Book Class button for Yoga
        const bookButtons = screen.getAllByRole('button', { name: /Book Class/i });
        fireEvent.click(bookButtons[0]);

        await waitFor(() => {
            expect(api.bookClass).toHaveBeenCalledWith('Yoga', '2023-01-01', '10:00');
            expect(window.alert).toHaveBeenCalledWith('Booking successful!');
            expect(mockOnActionSuccess).toHaveBeenCalled();
        });
    });

    test('books waiting list when full', async () => {
        api.bookClass.mockResolvedValue({ status: 'success' });

        render(<ClassList classes={mockClasses} onActionSuccess={mockOnActionSuccess} />);
        fireEvent.click(screen.getByText('01/01/2023'));

        // Finds "Join Waitlist" button
        const waitlistButton = screen.getByRole('button', { name: /Join Waitlist/i });
        fireEvent.click(waitlistButton);

        await waitFor(() => {
            expect(api.bookClass).toHaveBeenCalledWith(mockClasses[1].name, '2023-01-01', '12:00');
        });
    });

    test('handles booking error', async () => {
        api.bookClass.mockRejectedValue(new Error('Booking failed'));

        render(<ClassList classes={mockClasses} onActionSuccess={mockOnActionSuccess} />);
        fireEvent.click(screen.getByText('01/01/2023'));

        const bookButtons = screen.getAllByRole('button', { name: /Book Class/i });
        fireEvent.click(bookButtons[0]);

        await waitFor(() => {
            expect(screen.getByText(/Booking failed/i)).toBeInTheDocument();
        });
    });
});
