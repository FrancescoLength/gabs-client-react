import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';

import { BrowserRouter } from 'react-router-dom';

// Mock AuthContext values
const mockLogin = vi.fn();
const mockContext = {
    login: mockLogin,
    isLoggedIn: false,
};

// We need to mock the useAuth hook because it's used inside Login
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => mockContext,
}));

const renderLogin = () => {
    return render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );
};

test('renders login form', () => {
    renderLogin();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
});

test('handles input changes', () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
});

test('submits form with credentials', async () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getAllByRole('button', { name: /Sign In/i })[0];

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
});
