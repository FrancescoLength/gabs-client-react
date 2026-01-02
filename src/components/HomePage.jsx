import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gabsLogo from '../gabs_logo.png';
import { Calendar, Clock, Github, Code, Server, Layout } from 'lucide-react';

function HomePage() {
  const { isLoggedIn, user } = useAuth();

  const features = [
    { title: 'Automatic Booking', icon: '✅', desc: 'Set up once, never miss a class.' },
    { title: 'Smart Notifications', icon: '🔔', desc: 'Get reminders to avoid penalties.' },
    { title: 'Live Booking', icon: '📅', desc: 'Browse the full class calendar.' },
  ];

  if (isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-float p-5 md:p-8 mb-6 md:mb-8 border border-white/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red-light/20 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 relative z-10">
            <div className="h-12 w-12 md:h-16 md:w-16 bg-brand-red-light/30 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-sm text-brand-red shrink-0">
              👋
            </div>
            <div className="min-w-0"> {/* min-w-0 forces truncation if needed */}
              <h1 className="text-2xl md:text-3xl font-bold text-brand-dark mb-1 truncate">
                Welcome back, <span className="text-brand-red">{user ? user.split('@')[0] : 'Athlete'}</span>!
              </h1>
              <p className="text-brand-muted text-base md:text-lg">Ready to crush your goals today?</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          <Link to="/live-booking" className="group block p-6 md:p-8 bg-white rounded-2xl shadow-sm hover:shadow-float border border-white hover:border-brand-red/10 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4 md:mb-6">
              <div className="h-12 w-12 md:h-14 md:w-14 bg-brand-red-light/20 rounded-2xl flex items-center justify-center text-brand-red mb-2 md:mb-4 group-hover:scale-110 group-hover:bg-brand-red group-hover:text-white transition-all duration-300">
                <Calendar className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="text-gray-300 group-hover:text-brand-red/20 transition-colors">
                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-brand-dark mb-2 group-hover:text-brand-red transition-colors">Live Booking</h3>
            <p className="text-brand-muted text-sm md:text-base">View real-time schedule and book your next session instantly.</p>
          </Link>

          <Link to="/auto-booking" className="group block p-6 md:p-8 bg-white rounded-2xl shadow-sm hover:shadow-float border border-white hover:border-brand-red/10 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4 md:mb-6">
              <div className="h-12 w-12 md:h-14 md:w-14 bg-brand-dark/5 rounded-2xl flex items-center justify-center text-brand-dark mb-2 md:mb-4 group-hover:scale-110 group-hover:bg-brand-dark group-hover:text-white transition-all duration-300">
                <Clock className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="text-gray-300 group-hover:text-brand-dark/20 transition-colors">
                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-brand-dark mb-2 group-hover:text-brand-dark transition-colors">Auto Booking</h3>
            <p className="text-brand-muted text-sm md:text-base">Set up recurring bookings. Let GABS do the heavy lifting.</p>
          </Link>
        </div>

        <div className="bg-brand-dark rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red rounded-full blur-[100px] opacity-20 transform translate-x-20 -translate-y-20 group-hover:opacity-30 transition-opacity duration-500"></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-baseline justify-between mb-4 md:mb-6">
              <div>
                <span className="inline-block px-3 py-1 bg-brand-red/20 text-brand-red-light rounded-full text-xs font-bold tracking-wider mb-3 border border-brand-red/20">PRO TIP</span>
                <h3 className="text-xl md:text-2xl font-bold">Install as App</h3>
                <p className="text-gray-400 mt-2 text-sm md:text-base">Add to your home screen for the best experience.</p>
              </div>
              <div className="text-4xl opacity-20 hidden md:block">📱</div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6 pt-4 border-t border-white/10">
              {/* iOS Instructions */}
              <div className="bg-white/5 rounded-xl p-4 md:p-5 hover:bg-white/10 transition-colors">
                <div className="flex items-center mb-2 md:mb-3">
                  <span className="text-xl md:text-2xl mr-3">🍎</span>
                  <h4 className="font-bold text-base md:text-lg">iPhone (Safari)</h4>
                </div>
                <ol className="text-xs md:text-sm text-gray-400 space-y-2 list-decimal px-4">
                  <li>Tap the <span className="text-white font-bold">Share</span> button at the bottom.</li>
                  <li>Scroll down and tap <span className="text-white font-bold">Add to Home Screen</span>.</li>
                  <li>Tap <span className="text-white font-bold">Add</span> to confirm.</li>
                </ol>
              </div>

              {/* Android Instructions */}
              <div className="bg-white/5 rounded-xl p-4 md:p-5 hover:bg-white/10 transition-colors">
                <div className="flex items-center mb-2 md:mb-3">
                  <span className="text-xl md:text-2xl mr-3">🤖</span>
                  <h4 className="font-bold text-base md:text-lg">Android (Chrome)</h4>
                </div>
                <ol className="text-xs md:text-sm text-gray-400 space-y-2 list-decimal px-4">
                  <li>Tap the <span className="text-white font-bold">Menu (⋮)</span> at the top right.</li>
                  <li>Select <span className="text-white font-bold">Add to Home screen</span>.</li>
                  <li>Tap <span className="text-white font-bold">Install</span> if prompted.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Open Source Section - Dashboard */}
        <div className="mt-6 md:mt-8 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
                  <Github className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-brand-dark">Fully Open Source</h3>
              </div>
              <p className="text-gray-500 max-w-lg text-sm md:text-base">
                GABS is transparent. Check out the code and leave a star!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <a
                href="https://github.com/FrancescoLength/gabs-api-server"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-3 md:px-5 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-900/20 text-sm md:text-base"
              >
                <Server className="w-4 h-4 md:w-[18px] mr-2" />
                Backend Repo
              </a>
              <a
                href="https://github.com/FrancescoLength/gabs-client-react"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-3 md:px-5 rounded-xl bg-white text-gray-900 border-2 border-gray-200 font-bold hover:border-gray-900 hover:bg-gray-50 transition text-sm md:text-base"
              >
                <Layout className="w-4 h-4 md:w-[18px] mr-2" />
                Frontend Repo
              </a>
            </div>
          </div>
        </div>
      </div >
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-brand-gray flex flex-col">
      {/* Hero Section */}
      <div className="bg-white pb-20 pt-12 overflow-hidden rounded-b-[3rem] shadow-sm relative">
        <div className="absolute top-0 left-1/2 w-full h-full bg-brand-red-light/5 -translate-x-1/2 rounded-b-[3rem]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center mb-8">
            <img src={gabsLogo} alt="Gabs Logo" className="h-28 w-auto drop-shadow-lg" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-brand-dark tracking-tight mb-6 leading-tight">
            Gym <span className="text-brand-red inline-block relative">
              Automatic Booking System
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-red opacity-20" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C25.7501 2.99999 83.2721 -1.48116 198.001 2.49998" stroke="currentColor" strokeWidth="3" /></svg>
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10 leading-relaxed">
            Stop setting alarms at 7 AM. Let GABS handle your gym schedule automatically, securely, and reliably.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login" className="px-8 py-4 rounded-full bg-brand-red text-white font-bold text-lg hover:bg-brand-red-hover transition shadow-lg shadow-brand-red/30 hover:shadow-brand-red/50 hover:-translate-y-1 transform duration-200">
              Get Started
            </Link>
            <a href="#how-it-works" className="px-8 py-4 rounded-full bg-white text-brand-dark font-bold text-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm hover:shadow-md">
              How it Works
            </a>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="how-it-works" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <span className="text-brand-red font-bold tracking-widest uppercase text-sm">Features</span>
          <h2 className="text-4xl font-extrabold text-brand-dark mt-2">Why Athletes Choose GABS</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-10 rounded-3xl shadow-float border border-white hover:border-brand-red/20 transition-all duration-300 group hover:-translate-y-2">
              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-brand-dark mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Open Source Section - Public */}
      <div className="bg-gray-50 py-20 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-6 text-gray-900">
            <Github size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-brand-dark mb-4">Proudly Open Source</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-10 text-lg">
            We believe in transparency. Explore the codebase to see how GABS protects your data and automates your schedule.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://github.com/FrancescoLength/gabs-api-server"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-4 rounded-xl bg-brand-dark text-white font-bold hover:bg-black transition shadow-lg shadow-gray-900/10 hover:-translate-y-1 duration-200"
            >
              <Server size={20} className="mr-2.5" />
              Backend Repository
            </a>
            <a
              href="https://github.com/FrancescoLength/gabs-client-react"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-4 rounded-xl bg-white text-brand-dark border border-gray-200 font-bold hover:border-gray-400 hover:bg-gray-50 transition shadow-sm hover:shadow-md hover:-translate-y-1 duration-200"
            >
              <Layout size={20} className="mr-2.5" />
              Frontend Repository
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;