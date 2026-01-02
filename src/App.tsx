
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Clock, Shield, LogOut, LogIn } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import LiveBookingPage from './components/LiveBookingPage';
import AutoBookingPage from './components/AutoBookingPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogsPage from './components/AdminLogsPage';
import HomePage from './components/HomePage';
import gabsLogo from './gabs_logo.png';
import { usePushNotifications } from './hooks/usePushNotifications';
import './index.css';

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

function Layout() {
  const { isLoggedIn, logout, token, isAdmin } = useAuth();
  const location = useLocation();

  usePushNotifications(token, isLoggedIn);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-brand-gray flex flex-col font-sans text-brand-dark antialiased selection:bg-brand-red-light selection:text-brand-red">
      {/* Desktop Header / Mobile Top Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group outline-none">
            <img
              src={gabsLogo}
              alt="Gabs Logo"
              className="h-9 w-auto group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to="/" icon={<Home size={18} />} label="Home" active={isActive('/')} />
            {isLoggedIn ? (
              <>
                <NavLink to="/live-booking" icon={<Calendar size={18} />} label="Live Booking" active={isActive('/live-booking')} />
                <NavLink to="/auto-booking" icon={<Clock size={18} />} label="Auto Booking" active={isActive('/auto-booking')} />
                {isAdmin && (
                  <NavLink to="/admin-logs" icon={<Shield size={18} />} label="Admin Logs" active={isActive('/admin-logs')} />
                )}
                <div className="pl-2 ml-2 border-l border-gray-200">
                  <button
                    onClick={logout}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-brand-red hover:bg-brand-red-light/20 rounded-lg transition-all"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="flex items-center px-5 py-2.5 bg-brand-red text-white text-sm font-medium rounded-full hover:bg-brand-red-hover transition shadow-lg shadow-brand-red/20 hover:shadow-brand-red/40 transform hover:-translate-y-0.5">
                <LogIn size={18} className="mr-2" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Login Link (if logged out) */}
          {!isLoggedIn && (
            <div className="md:hidden">
              <Link to="/login" className="text-sm font-bold text-brand-red hover:text-brand-red-hover">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 mb-24 md:mb-8 animate-fade-in">
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

      {/* Mobile Bottom Navigation - Glassmorphism */}
      {isLoggedIn && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-float z-50">
          <div className="flex justify-around items-center h-16 px-2">
            <MobileNavItem to="/" icon={<Home size={22} />} label="Home" active={isActive('/')} />
            <MobileNavItem to="/live-booking" icon={<Calendar size={22} />} label="Live" active={isActive('/live-booking')} />
            <div className="w-px h-8 bg-gray-200 mx-1"></div>
            <MobileNavItem to="/auto-booking" icon={<Clock size={22} />} label="Auto" active={isActive('/auto-booking')} />
            {isAdmin && (
              <MobileNavItem to="/admin-logs" icon={<Shield size={22} />} label="Admin" active={isActive('/admin-logs')} />
            )}
            <button onClick={logout} className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-brand-red transition-colors group">
              <div className="group-hover:bg-brand-red-light/30 p-1.5 rounded-xl transition-colors">
                <LogOut size={22} />
              </div>
              <span className="text-[10px] font-medium mt-0.5">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components
interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavLink = ({ to, icon, label, active }: NavLinkProps) => (
  <Link
    to={to}
    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${active
      ? 'text-brand-red bg-brand-red-light/30'
      : 'text-gray-600 hover:text-brand-dark hover:bg-gray-50'
      }`}
  >
    <span className={`mr-2 ${active ? 'text-brand-red' : 'text-gray-400 group-hover:text-gray-600'}`}>{icon}</span>
    {label}
  </Link>
);

const MobileNavItem = ({ to, icon, label, active }: NavLinkProps) => (
  <Link to={to} className={`flex flex-col items-center justify-center w-full h-full ${active ? 'text-brand-red' : 'text-gray-400 hover:text-gray-600'} group relative`}>
    <div className={`p-1.5 rounded-xl transition-all duration-300 ${active ? 'bg-brand-red-light/50 shadow-inner' : 'group-hover:bg-gray-50'}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-semibold mt-0.5 transition-colors ${active ? 'text-brand-red' : 'text-gray-400'}`}>{label}</span>
    {active && <span className="absolute -bottom-1 w-1 h-1 bg-brand-red rounded-full"></span>}
  </Link>
);
