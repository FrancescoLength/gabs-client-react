import { render, screen, waitFor } from '@testing-library/react';
import AutoBookingPage from '../AutoBookingPage';
import * as api from '../../api';

// Mock dependencies
jest.mock('../../api');
jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({ token: 'mock-token' }),
}));
// Mock child components to isolate page logic testing
jest.mock('../MyAutoBookings', () => () => <div data-testid="my-auto-bookings">MyAutoBookings</div>);
jest.mock('../AutoBookingScheduler', () => () => <div data-testid="auto-booking-scheduler">AutoBookingScheduler</div>);

describe('AutoBookingPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders loading state initially', async () => {
        // Return a promise that doesn't resolve immediately
        api.getStaticClasses.mockImplementation(() => new Promise(() => { }));

        render(<AutoBookingPage />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('renders child components after data load', async () => {
        const mockData = { classes: [] };
        api.getStaticClasses.mockResolvedValue(mockData);

        render(<AutoBookingPage />);

        await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });

        expect(screen.getByTestId('my-auto-bookings')).toBeInTheDocument();
        expect(screen.getByTestId('auto-booking-scheduler')).toBeInTheDocument();
    });

    test('renders error state on API failure', async () => {
        api.getStaticClasses.mockRejectedValue(new Error('Network error'));

        render(<AutoBookingPage />);

        await waitFor(() => {
            expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
        });
    });
});
