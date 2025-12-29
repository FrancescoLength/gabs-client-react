import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

// Mock dependencies
jest.mock('../../context/AuthContext');

describe('ProtectedRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('redirects to login if not logged in', () => {
        useAuth.mockReturnValue({ isLoggedIn: false, isAdmin: false });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    test('renders children if logged in', () => {
        useAuth.mockReturnValue({ isLoggedIn: true, isAdmin: false });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    test('redirects to home if admin route and not admin', () => {
        useAuth.mockReturnValue({ isLoggedIn: true, isAdmin: false });

        render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route path="/" element={<div>Home Page</div>} />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute adminOnly={true}>
                                <div>Admin Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Home Page')).toBeInTheDocument();
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    test('renders admin content if admin', () => {
        useAuth.mockReturnValue({ isLoggedIn: true, isAdmin: true });

        render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute adminOnly={true}>
                                <div>Admin Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
});
