import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import LiveBookingPage from './components/LiveBookingPage'; // Import new page
import AutoBookingPage from './components/AutoBookingPage';   // Import new page
import ProtectedRoute from './components/ProtectedRoute';
import hackedLogo from './gabs_logo.png'; // Import the image
import './App.css';
import { getVapidPublicKey, subscribeToPush } from './api';

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
  const { isLoggedIn, logout, token } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      subscribeToPushNotifications();
    }
  }, [isLoggedIn, token]);

  const subscribeToPushNotifications = async () => {
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
  };

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
            <img src={hackedLogo} alt="Gabs Logo" style={{ height: '90px' }} />
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

function HomePage() {
  const { isLoggedIn } = useAuth();

  // If the user is logged in, redirect them to the main functional page.
  if (isLoggedIn) {
    return <Navigate to="/auto-booking" replace />;
  }

  return (
    <div>
      {/* Main Jumbotron */}
      <div className="p-5 mb-4 bg-light rounded-3">
        <div className="container-fluid py-5">
          <h1 className="display-5 fw-bold">GABS: Gym Automatic Booking System</h1>
          <p className="col-md-10 fs-4">Automate your gym bookings. No more early alarms or racing against the clock!</p>
          {!isLoggedIn && (
            <>
              <p className="lead mt-4">Please log in to get started.</p>
              <Link className="btn btn-primary btn-lg" to="/login">Login</Link>
            </>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="row align-items-md-stretch mb-4">
        <div className="col-md-12">
          <div className="h-100 p-5 bg-white border rounded-3">
            <h4>How It Works 🧐</h4>
            <p>Putting your bookings on autopilot is super simple.</p>
            <ol>
              <li><strong>Log In Securely:</strong> Use the same credentials as your gym's official website.</li>
              <li><strong>Choose Your Mode:</strong>
                <ul>
                  <li><strong>Live Booking:</strong> To see the real-time class schedule and book a single class.</li>
                  <li><strong>Auto Booking:</strong> To set up a recurring booking that GABS will handle for you automatically.</li>
                </ul>
              </li>
              <li><strong>Set It & Forget It:</strong> If you choose Auto Booking, just tell us the class, day, and time. GABS will take care of the rest. ✨</li>
              <li><strong>Manage Your Bookings:</strong> Check your active and automated bookings anytime.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Features & PWA Section */}
      <div className="row align-items-md-stretch mb-4">
        <div className="col-md-6 mb-4 mb-md-0">
          <div className="h-100 p-5 bg-light border rounded-3">
            <h4>Main Features 🌟</h4>
            <ul>
              <li>✅ <strong>Automatic Booking:</strong> Set up your favorite classes once and never think about them again.</li>
              <li>🔔 <strong>Smart Notifications:</strong> Get push reminders to cancel a class and avoid penalties.</li>
              <li>📅 <strong>Live Schedule:</strong> Browse the full class calendar right from here.</li>
              <li>👨‍🏫 <strong>Filter by Instructor:</strong> Find all classes taught by your favorite instructor.</li>
            </ul>
          </div>
        </div>
        <div className="col-md-6">
          <div className="h-100 p-5 rounded-3 bg-brand-primary">
            <h4>Take GABS With You 🚀</h4>
            <p>GABS is a Progressive Web App (PWA), ready for your smartphone's home screen.</p>
            <ul>
              <li><strong>On Android:</strong> Open the Chrome menu and tap <strong>"Install app"</strong> or "Add to Home Screen".</li>
              <li><strong>On iOS:</strong> From Safari, tap the <strong>Share</strong> button and choose <strong>"Add to Home Screen"</strong>.</li>
            </ul>
            <p className="mt-3"><strong>Friendly Reminder:</strong> Please <strong>enable push notifications!</strong> 🙏 They are essential for receiving cancellation reminders.</p>
          </div>
        </div>
      </div>

      {/* Security & Open Source Section */}
      <div className="row align-items-md-stretch mb-4">
        <div className="col-md-6 mb-4 mb-md-0">
          <div className="h-100 p-5 bg-light border rounded-3">
            <h4>Your Security is Our Priority 🛡️</h4>
            <p>Here’s exactly how we handle your credentials:</p>
            <ul>
              <li><strong>No Permanent Storage:</strong> Your gym credentials are <strong>never saved</strong> to any database. 🙅‍♀️</li>
              <li><strong>Temporary Use Only:</strong> Used only at login to create a secure, temporary session.</li>
              <li><strong>Deletion on Logout:</strong> As soon as you log out, all sensitive data is immediately erased. 🗑️</li>
            </ul>
          </div>
        </div>
        <div className="col-md-6">
          <div className="h-100 p-5 bg-light border rounded-3">
            <h4>A Free & Open Source Project ❤️</h4>
            <p>GABS is an open-source project born from a passion for technology and fitness. This service is, and always will be, <strong>completely free</strong>. If you're a developer, we welcome you to contribute on GitHub! 👩‍💻</p>
          </div>
        </div>
      </div>

      {/* Disclaimer Section */}
      <div className="p-3 mt-4 bg-light rounded-3">
        <blockquote className="blockquote text-center">
          <p className="mb-0 fst-italic small">ℹ️ GABS is an independent project and is not affiliated with or endorsed by your gym. It simply acts as an automated assistant on your behalf.</p>
        </blockquote>
      </div>
    </div>
  );
}

export default App;