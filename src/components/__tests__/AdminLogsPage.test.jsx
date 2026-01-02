import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminLogsPage from "../../features/admin/AdminLogsPage";
import * as api from '../../api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { vi, describe, test, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../api');
vi.mock('../../context/AuthContext');

describe('AdminLogsPage', () => {
    let queryClient;

    beforeEach(() => {
        vi.resetAllMocks();
        useAuth.mockReturnValue({ token: 'mock-token' });
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

    test('renders username in auto-bookings tab', async () => {
        const mockAutoBookings = [
            {
                id: 14,
                username: 'test-user-123',
                class_name: 'BoxFit',
                day_of_week: 'Tuesday',
                target_time: '18:55',
                status: 'pending'
            }
        ];

        api.getAdminStatus.mockResolvedValue({ status: 'ok', uptime: '1:00:00' });
        api.getAdminAutoBookings.mockResolvedValue(mockAutoBookings);

        renderWithClient(<AdminLogsPage />);

        // Wait for dashboard to load (defaults to status tab)
        await waitFor(() => {
            expect(screen.getByText(/System Status/i)).toBeInTheDocument();
        });

        // Switch to Auto Bookings tab
        const autoBookingTab = screen.getByRole('button', { name: /Auto Bookings/i });
        fireEvent.click(autoBookingTab);

        // Verify username is displayed
        await waitFor(() => {
            expect(screen.getByText('test-user-123')).toBeInTheDocument();
            expect(screen.getByText('BoxFit')).toBeInTheDocument();
        });
    });
});
