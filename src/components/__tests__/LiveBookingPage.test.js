import { render, screen, waitFor } from '@testing-library/react';
import LiveBookingPage from '../LiveBookingPage';
import * as api from '../../api';

// Mock dependencies
jest.mock('../../api');
jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({ token: 'mock-token' }),
}));
jest.mock('../MyBookings', () => () => <div data-testid="my-bookings">MyBookings</div>);
jest.mock('../ClassList', () => () => <div data-testid="class-list">ClassList</div>);

describe('LiveBookingPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders loading state initially', async () => {
        api.getMyBookings.mockImplementation(() => new Promise(() => { }));
        api.getClasses.mockImplementation(() => new Promise(() => { }));

        render(<LiveBookingPage />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('renders data after fetching', async () => {
        const mockBookings = [
            { name: 'Yoga', date: 'Monday 1st January', time: '10:00' }
        ];
        const mockClasses = [
            { name: 'Spinning', date: '01/01/2023', start_time: '11:00' }
        ];

        api.getMyBookings.mockResolvedValue(mockBookings);
        api.getClasses.mockResolvedValue(mockClasses);

        render(<LiveBookingPage />);

        await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });

        expect(screen.getByText('My bookings')).toBeInTheDocument();
        expect(screen.getByText('Available Classes')).toBeInTheDocument();
        expect(screen.getByTestId('my-bookings')).toBeInTheDocument();
        expect(screen.getByTestId('class-list')).toBeInTheDocument();
    });

    test('renders error state', async () => {
        api.getMyBookings.mockRejectedValue(new Error('API failure'));

        render(<LiveBookingPage />);

        await waitFor(() => {
            expect(screen.getByText(/Error: API failure/i)).toBeInTheDocument();
        });
    });
});
