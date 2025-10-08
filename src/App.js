import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import LiveBookingPage from './components/LiveBookingPage'; // Import new page
import AutoBookingPage from './components/AutoBookingPage';   // Import new page
import ProtectedRoute from './components/ProtectedRoute';
import hackedLogo from './gabs_logo.png'; // Import the image
import './App.css';

// Wrapper per l'intera App
function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
}

// Componente che gestisce il layout e le rotte
function Layout() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <div className="navbar-brand"></div>
          <Link to="/" className="navbar-brand mx-auto">
            <img src={hackedLogo} alt="Gabs Logo" style={{ height: '120px' }} />
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              {isLoggedIn ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/live-booking">Live Booking</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/auto-booking">Auto Booking</Link>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-link nav-link" onClick={logout}>Logout</button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <main className="container mt-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/live-booking" 
            element={
              <ProtectedRoute>
                <LiveBookingPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/auto-booking" 
            element={
              <ProtectedRoute>
                <AutoBookingPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </main>
    </div>
  );
}

// Placeholder Component
function HomePage() {
  const { isLoggedIn } = useAuth();
  return (
    <div className="p-5 mb-4 bg-light rounded-3">
      <div className="container-fluid py-5">
        <h1 className="display-5 fw-bold">GABS aka Gym Automatic Booking System</h1>
        <p className="col-md-8 fs-4">Automates your gym class bookings so you’ll never have to set alarms or race against time again.</p>
        {!isLoggedIn && (
          <>
            <p>Please log in to get started.</p>
            <Link className="btn btn-primary btn-lg" to="/login">Login</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default App;