import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import LiveBookingPage from '../LiveBookingPage';
import * as api from '../../api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, test, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../api');
vi.mock('../../context/AuthContext', () => {
    return {
        useAuth: () => ({ token: 'mock-token' })
    };
});

// Vitest components mocking
vi.mock('../MyBookings', () => ({
    default: () => 'MyBookings Mock'
}));
vi.mock('../ClassList', () => ({
    default: () => 'ClassList Mock'
}));

describe('LiveBookingPage', () => {
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

    test('renders loading state initially', async () => {
        api.getMyBookings.mockImplementation(() => new Promise(() => { }));
        api.getClasses.mockImplementation(() => new Promise(() => { }));

        renderWithClient(<LiveBookingPage />);
        // "Loading schedule..." text
        expect(screen.getByText(/Loading schedule.../i)).toBeInTheDocument();
    });

    test('renders data after fetching', { timeout: 20000 }, async () => {
        const mockBookings = [
            { name: 'Yoga', date: 'Monday 1st January', time: '10:00' }
        ];
        // Note: LiveBookingPage filters available classes based on bookings
        const mockClasses = [
            { name: 'Spinning', date: '01/01/2023', start_time: '11:00' }
        ];

        api.getMyBookings.mockResolvedValue(mockBookings);
        api.getClasses.mockResolvedValue(mockClasses);

        renderWithClient(<LiveBookingPage />);

        await waitFor(() => {
            expect(api.getMyBookings).toHaveBeenCalled();
            expect(screen.queryByText(/Loading schedule.../i)).not.toBeInTheDocument();
        }, { timeout: 10000 });

        // Headers
        expect(screen.getByText(/My Upcoming Bookings/i)).toBeInTheDocument();
        expect(screen.getByText(/Available Classes/i)).toBeInTheDocument();

        expect(screen.getByText('MyBookings Mock')).toBeInTheDocument();
        expect(screen.getByText('ClassList Mock')).toBeInTheDocument();
    });

    test('renders error state', async () => {
        api.getMyBookings.mockRejectedValue(new Error('API failure'));
        api.getClasses.mockResolvedValue([]);

        renderWithClient(<LiveBookingPage />);

        await waitFor(() => {
            // "Unavailable" heading and "API failure" message
            expect(screen.getByText(/Unavailable/i)).toBeInTheDocument();
            expect(screen.getByText(/API failure/i)).toBeInTheDocument();
        });
    });
});
