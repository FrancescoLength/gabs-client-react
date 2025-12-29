import { render, screen } from '@testing-library/react';
import App from './App';

// Mock api.js to avoid network calls
jest.mock('./api', () => ({
    getVapidPublicKey: jest.fn(),
    subscribeToPush: jest.fn(),
}));

// Mock AuthContext if needed, but App uses AuthProvider, so we might test integration.
// However, to keep it simple and isolate App functionality:
// The App component loads AuthProvider -> Router -> Layout.
// We can test if "Home" link is present, which verifies basic rendering.

test('renders Home link', () => {
    render(<App />);
    const linkElements = screen.getAllByText(/Home/i);
    expect(linkElements.length).toBeGreaterThan(0);
});

test('renders Gabs Logo', () => {
    render(<App />);
    const logo = screen.getByAltText(/Gabs Logo/i);
    expect(logo).toBeInTheDocument();
});
