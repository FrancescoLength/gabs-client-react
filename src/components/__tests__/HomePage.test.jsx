import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock must be defined before imports that use it, relying on hoisting is good but explicit is better for absolute safety
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        isLoggedIn: false,
        user: null,
    }),
}));

import HomePage from '../HomePage';

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
