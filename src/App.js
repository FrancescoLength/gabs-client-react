import React, { useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import LiveBookingPage from './components/LiveBookingPage'; // Import new page
import AutoBookingPage from './components/AutoBookingPage';   // Import new page
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogsPage from './components/AdminLogsPage';
import gabsLogo from './gabs_logo.png'; // Import the image
import './App.css';
import { getVapidPublicKey, subscribeToPush } from './api';
import HomePage from './components/HomePage';

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

export default App;

// Componente che gestisce il layout e le rotte
function Layout() {
  const { isLoggedIn, logout, token, isAdmin } = useAuth();

  const subscribeToPushNotifications = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const vapidPublicKey = await getVapidPublicKey();
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      await subscribeToPush(token, subscription);

      console.log('Push subscription successful:', subscription);
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  }, [token]);

  useEffect(() => {
    if (isLoggedIn) {
      subscribeToPushNotifications();
    }
  }, [isLoggedIn, subscribeToPushNotifications]);

  // Utility function to convert VAPID key
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top">
        <div className="container-fluid">
          <div className="navbar-brand"></div>
          <Link to="/" className="navbar-brand mx-auto">
            <img src={gabsLogo} alt="Gabs Logo" style={{ height: '90px' }} />
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
                  {isAdmin && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin-logs">Admin Logs</Link>
                    </li>
                  )}
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
          <Route 
            path="/admin-logs" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminLogsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </main>
    </div>
  );
}

