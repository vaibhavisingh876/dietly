import React, { useState, useEffect } from 'react';
import { Leaf, Menu, X, BarChart3, Search, ChefHat, Sparkles } from 'lucide-react';

export default function ModernNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    
    { name: 'Pantry', href: '/pantry', icon: ChefHat },
  ];

  const handleNavClick = (e, href, name) => {
    e.preventDefault();
    setActiveTab(name);
    // Use window.location for actual navigation
    window.location.href = href;
  };


  return (
    <>_
      {/* Floating Navbar */}
      <nav className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        isScrolled ? 'top-4 scale-95' : 'top-6 scale-100'
      }`}>
        <div className="bg-white/90 backdrop-blur-xl rounded-full shadow-xl border border-green-100 px-8 py-4">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <a 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/';
              }}
              className="flex items-center gap-2 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-full">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-green-700 via-green-600 to-green-700 bg-clip-text text-transparent">
                Dietly
              </span>
            </a>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href, link.name)}
                    className={`relative px-6 py-2.5 rounded-full font-bold transition-all duration-300 ${
                      activeTab === link.name
                        ? 'text-white'
                        : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                    }`}
                  >
                    {activeTab === link.name && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-full shadow-md"></div>
                    )}
                    <span className="relative flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      {link.name}
                    </span>
                  </a>
                );
              })}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/login';
                }}
                className="px-5 py-2.5 rounded-full font-semibold text-green-700 hover:bg-green-50 transition-all"
              >
                Login
              </a>
              <a
                href="/register"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/register';
                }}
                className="relative px-6 py-2.5 rounded-full font-bold text-white overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 group-hover:from-green-700 group-hover:to-green-800 transition-all"></div>
                <span className="relative flex items-center gap-2">
                  Register
                </span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-green-50 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-slideDown">
            <div className="space-y-3">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      handleNavClick(e, link.href, link.name);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-gray-700 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 hover:text-white transition-all"
                  >
                    <IconComponent className="w-5 h-5" />
                    {link.name}
                  </a>
                );
              })}
              <div className="pt-4 border-t-2 border-gray-100 space-y-2">
                <a 
                  href="/login" 
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/login';
                  }}
                  className="block px-6 py-3 rounded-2xl font-semibold text-center text-green-700 hover:bg-green-50 transition-all"
                >
                  Login
                </a>
                <a 
                  href="/register"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/register';
                  }}
                  className="block px-6 py-3 rounded-2xl font-bold text-center text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all"
                >
                  Register
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-32"></div>

      {/* Hero Content */}
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-6xl mx-auto px-6 pt-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md mb-8 border border-green-200">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-semibold text-gray-700">AI-Powered Nutrition Tracking</span>
            </div>

            <h1 className="text-7xl md:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 bg-clip-text text-transparent">
                Welcome to
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent animate-gradient">
                Dietly
              </span>
            </h1>

            <p className="text-3xl font-bold text-gray-700 mb-6">
              Feed Your Ambition, Not Just Your Appetite
            </p>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Transform your eating habits with intelligent tracking, personalized insights, and a
              supportive community. Start your journey to better health today.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button className="group relative px-8 py-4 rounded-full font-bold text-white text-lg overflow-hidden shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 group-hover:from-green-700 group-hover:to-green-800"></div>
                <span className="relative flex items-center gap-2">
                  Get Started Free
                  <Sparkles className="w-5 h-5" />
                </span>
              </button>
              <button className="px-8 py-4 rounded-full font-bold text-green-700 bg-white border-2 border-green-200 hover:bg-green-50 text-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all">
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-20">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-green-100">
                <p className="text-4xl font-black text-green-700 mb-2">10K+</p>
                <p className="text-gray-600 font-semibold">Active Users</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-green-100">
                <p className="text-4xl font-black text-emerald-700 mb-2">50K+</p>
                <p className="text-gray-600 font-semibold">Meals Tracked</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-green-100">
                <p className="text-4xl font-black text-teal-700 mb-2">4.9★</p>
                <p className="text-gray-600 font-semibold">User Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </>
  );
}
