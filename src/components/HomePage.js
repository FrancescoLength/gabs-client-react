import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { isLoggedIn } = useAuth();
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
              <li><strong>Encrypted Storage:</strong> Your gym password is securely encrypted using a unique key and stored in our database.</li>
              <li><strong>Secure Sessions:</strong> We use your encrypted credentials to maintain a secure, temporary session with your gym's website.</li>
              <li><strong>Strict Access:</strong> Only the automated booking system can access and decrypt your password when necessary for booking tasks.</li>
              <li><strong>Deletion on Logout:</strong> Upon logout, your encrypted password and session data are immediately removed from our database. 🗑️</li>
            </ul>
          </div>
        </div>
        <div className="col-md-6">
          <div className="h-100 p-5 bg-light border rounded-3">
            <h4>A Free & Open Source Project ❤️</h4>
            <p>GABS is an open-source project born from a passion for technology and fitness. This service is, and always will be, <strong>completely free</strong>. If you're a developer, we welcome you to contribute on GitHub! 👩‍💻</p>
            <p>Check out the <a href="https://github.com/FrancescoLength/gabs-api-server">backend code</a> 🛠️ (it runs on a Raspberry Pi Zero)</p>
            <p>Check out the <a href="https://github.com/FrancescoLength/gabs-client-react">frontend code</a> 🎨 </p>
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

export default HomePage;