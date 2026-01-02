import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import HomePage from "../../features/home/HomePage";

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
        // "Automatic Booking System" appears in main styling and redundant spans, checking for existence is enough
        expect(screen.getAllByText(/Automatic Booking System/i)[0]).toBeInTheDocument();

        // Check for Open Source section
        expect(screen.getByText(/Proudly Open Source/i)).toBeInTheDocument();
    });
});
