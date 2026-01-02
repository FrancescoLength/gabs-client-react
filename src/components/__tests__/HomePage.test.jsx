import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../HomePage';
import { describe, it, expect, vi } from 'vitest';

// Mock the AuthContext
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        isLoggedIn: false,
        user: null,
    }),
}));

describe('HomePage', () => {
    it('renders public landing page when not logged in', () => {
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        // Check for main heading parts
        // "Gym" might be split or multiple
        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);
        expect(screen.getByText(/Automatic Booking System/i)).toBeInTheDocument();

        // Check for Open Source section
        expect(screen.getByText(/Proudly Open Source/i)).toBeInTheDocument();
    });
});
