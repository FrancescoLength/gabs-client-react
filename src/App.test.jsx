import { render, screen } from '@testing-library/react';
import App from './App';
import { test, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mock BrowserRouter to avoid window.location issues in tests
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        BrowserRouter: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    };
});
// Mock api.js to avoid network calls
// vi.mock works similarly to jest.mock
vi.mock('./api', () => ({
    getVapidPublicKey: vi.fn(),
    subscribeToPush: vi.fn(),
}));

// Mock AuthContext if needed, but App uses AuthProvider, so we might test integration.
// However, to keep it simple and isolate App functionality:
// The App component loads AuthProvider -> Router -> Layout.
// We can test if "Home" link is present, which verifies basic rendering.

test('renders Home link', () => {
    // We might need to handle the router inside App if it's not wrapped in one, 
    // but App usually contains the Router.
    // If App creates its own Router, we can render it directly.
    render(<App />);
    // "Get Started" is on the home page
    const linkElements = screen.getAllByText(/Get Started/i);
    expect(linkElements.length).toBeGreaterThan(0);
});

test('renders Gabs Logo', () => {
    render(<App />);
    const logos = screen.getAllByAltText(/Gabs Logo/i);
    expect(logos.length).toBeGreaterThan(0);
});
