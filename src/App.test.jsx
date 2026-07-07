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
vi.mock('./api', () => ({
    getVapidPublicKey: vi.fn(),
    subscribeToPush: vi.fn(),
}));

test('renders Home link', () => {
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
