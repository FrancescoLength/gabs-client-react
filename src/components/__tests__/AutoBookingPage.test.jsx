import { render, screen, waitFor } from '@testing-library/react';
import AutoBookingPage from '../AutoBookingPage';
import * as api from '../../api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, test, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../api');
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({ token: 'mock-token' }),
}));
// Mock child components to isolate page logic testing
vi.mock('../MyAutoBookings', () => ({
    default: () => <div data-testid="my-auto-bookings">MyAutoBookings</div>
}));
vi.mock('../AutoBookingScheduler', () => ({
    default: () => <div data-testid="auto-booking-scheduler">AutoBookingScheduler</div>
}));

describe('AutoBookingPage', () => {
    let queryClient;

    beforeEach(() => {
        vi.resetAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    networkMode: 'always'
                },
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

    test('renders data after fetching', { timeout: 20000 }, async () => {
        // Return a promise that doesn't resolve immediately
        api.getStaticClasses.mockImplementation(() => new Promise(() => { }));
        api.getAutoBookings.mockImplementation(() => new Promise(() => { }));

        renderWithClient(<AutoBookingPage />);
        // "Loading automation data..." is the text, check for it
        expect(screen.getByText(/Loading automation data.../i)).toBeInTheDocument();
    });

    test('renders child components after data load', async () => {
        const mockData = { classes: [] };
        api.getStaticClasses.mockResolvedValue(mockData);
        api.getAutoBookings.mockResolvedValue([{ id: 1 }]); // Mock booking data too

        renderWithClient(<AutoBookingPage />);

        await waitFor(() => {
            expect(screen.queryByText(/Loading automation data.../i)).not.toBeInTheDocument();
        }, { timeout: 10000 });

        expect(screen.getByTestId('my-auto-bookings')).toBeInTheDocument();
        expect(screen.getByTestId('auto-booking-scheduler')).toBeInTheDocument();
    });

    test('renders error state on API failure', async () => {
        api.getStaticClasses.mockRejectedValue(new Error('Network error'));
        api.getAutoBookings.mockResolvedValue([]);

        renderWithClient(<AutoBookingPage />);

        await waitFor(() => {
            // "Error" content might be ambiguous if description also contains it
            expect(screen.getByRole('heading', { name: /Error/i })).toBeInTheDocument();
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });
});
