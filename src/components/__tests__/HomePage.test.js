import { render, screen } from '@testing-library/react';
import HomePage from '../HomePage';
import { BrowserRouter } from 'react-router-dom';

// Mock useAuth
const mockContext = {
    isLoggedIn: false,
};

jest.mock('../../context/AuthContext', () => ({
    useAuth: () => mockContext,
}));

test('renders welcome message', () => {
    render(
        <BrowserRouter>
            <HomePage />
        </BrowserRouter>
    );
    expect(screen.getByText(/GABS: Gym Automatic Booking System/i)).toBeInTheDocument();
});

test('shows login button when not logged in', () => {
    mockContext.isLoggedIn = false;
    render(
        <BrowserRouter>
            <HomePage />
        </BrowserRouter>
    );
    // Specifically look for the link button
    const loginLink = screen.getByRole('link', { name: /Login/i });
    expect(loginLink).toBeInTheDocument();
});

test('does not show login prompt when logged in', () => {
    mockContext.isLoggedIn = true;
    render(
        <BrowserRouter>
            <HomePage />
        </BrowserRouter>
    );
    // The text "Please log in to get started." should not be there
    const loginPrompt = screen.queryByText(/Please log in to get started./i);
    expect(loginPrompt).not.toBeInTheDocument();
});
