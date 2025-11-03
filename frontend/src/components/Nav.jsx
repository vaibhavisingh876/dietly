import React, { useState, useEffect } from 'react';
import { Leaf, Menu, X, BarChart3, ChefHat } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function ModernNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const location = useLocation();

  // Detect current route and set active tab
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/pantry')) setActiveTab('Pantry');
    else if (path.includes('/login')) setActiveTab('Login');
    else if (path.includes('/register')) setActiveTab('Register');
    else setActiveTab('Dashboard');
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Pantry', href: '/pantry', icon: ChefHat },
  ];

  const handleNavClick = (e, href, name) => {
    e.preventDefault();
    window.location.href = href;
  };

  return (
    <>
      {/* Floating Navbar */}
      <nav className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        isScrolled ? 'top-4 scale-95' : 'top-6 scale-100'
      }`}>
        <div className="bg-white/90 backdrop-blur-xl rounded-full shadow-xl border border-green-100 px-8 py-4">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <a 
              href="/" 
              onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}
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
              {['Login', 'Register'].map((name) => (
                <a
                  key={name}
                  href={`/${name.toLowerCase()}`}
                  onClick={(e) => handleNavClick(e, `/${name.toLowerCase()}`, name)}
                  className={`relative px-5 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                    activeTab === name
                      ? 'text-white'
                      : 'text-green-700 hover:bg-green-50'
                  }`}
                >
                  {activeTab === name && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-full shadow-md"></div>
                  )}
                  <span className="relative">{name}</span>
                </a>
              ))}
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
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
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
                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                      activeTab === link.name
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    {link.name}
                  </a>
                );
              })}
              <div className="pt-4 border-t-2 border-gray-100 space-y-2">
                {['Login', 'Register'].map((name) => (
                  <a
                    key={name}
                    href={`/${name.toLowerCase()}`}
                    onClick={(e) => {
                      handleNavClick(e, `/${name.toLowerCase()}`, name);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block px-6 py-3 rounded-2xl font-semibold text-center transition-all ${
                      activeTab === name
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white'
                        : 'text-green-700 hover:bg-green-50'
                    }`}
                  >
                    {name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
