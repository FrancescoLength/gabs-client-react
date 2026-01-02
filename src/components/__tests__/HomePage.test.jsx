import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import HomePage from '../HomePage';

describe('HomePage', () => {
    it('renders public landing page when not logged in', () => {
        const mockAuthContext = {
            isLoggedIn: false,
            user: null,
            login: async () => { },
            logout: async () => { }
        };

        render(
            <AuthContext.Provider value={mockAuthContext}>
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            </AuthContext.Provider>
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
