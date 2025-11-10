import React, { useEffect, useState } from 'react';
import { Leaf, Menu, X, BarChart3, ChefHat, User, LogOut, Target } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function ModernNavbar() {
  const [isScrolled, setIsScrolled] = useState(false); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('User');

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const updateAuth = () => {
      const token = localStorage.getItem('token');
      const storedName = localStorage.getItem('userName');
      setIsLoggedIn(!!token && !!storedName);
      setUserName(storedName || 'User');
    };

    updateAuth();
    window.addEventListener('authChanged', updateAuth);
    return () => window.removeEventListener('authChanged', updateAuth);
  }, []);

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/analyze')) setActiveTab('Analyze');
    else if (path.includes('/pantry')) setActiveTab('Pantry');
    else if (path.includes('/profile')) setActiveTab('Profile');
    else if (path.includes('/calories')) setActiveTab('Calories'); // new
    else setActiveTab('Home');
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/', icon: BarChart3 },
    { name: 'Analyze', href: '/analyze', icon: ChefHat },
    { name: 'Pantry', href: '/pantry', icon: Leaf },
    { name: 'Calories', href: '/calories', icon: Target }, // Calorie Tracker added
  ];

  const authLinks = [
    { name: 'Login', href: '/login', isAuth: false },
    { name: 'Register', href: '/register', isAuth: false },
    { name: 'Profile', href: '/profile', isAuth: true, icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.dispatchEvent(new Event('authChanged'));
    navigate('/login');
  };

  return (
    <>
      <nav className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${isScrolled ? 'top-4 scale-95' : 'top-6 scale-100'}`}>
        <div className="bg-white/90 backdrop-blur-xl rounded-full shadow-xl border border-green-100 px-6 sm:px-8 py-4">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-full">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-green-700 via-green-600 to-green-700 bg-clip-text text-transparent">Dietly</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <button
                    key={link.name}
                    onClick={() => navigate(link.href)}
                    className={`relative px-5 py-2.5 rounded-full font-bold transition-all duration-300 text-sm ${activeTab === link.name ? 'text-white' : 'text-gray-600 hover:text-green-700 hover:bg-green-50'}`}
                  >
                    {activeTab === link.name && <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-full shadow-md"></div>}
                    <span className="relative flex items-center gap-2">
                      {IconComponent && <IconComponent className="w-4 h-4" />}
                      {link.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Auth Links */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <button onClick={() => navigate('/profile')} className={`relative px-4 py-2.5 rounded-full font-semibold transition-all duration-300 text-white flex items-center gap-2 ${activeTab === 'Profile' ? 'bg-green-700 shadow-md' : 'bg-green-600 hover:bg-green-700'}`}>
                    <User className="w-5 h-5" />
                    <span className="hidden lg:inline">{userName.split(' ')[0]}</span>
                  </button>
                  <button onClick={handleLogout} className="relative p-2.5 rounded-full font-semibold transition-all duration-300 text-gray-600 hover:bg-red-50 hover:text-red-700" title="Logout">
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                authLinks.filter(link => !link.isAuth).map((link) => (
                  <button key={link.name} onClick={() => navigate(link.href)} className={`relative px-5 py-2.5 rounded-full font-semibold transition-all duration-300 ${activeTab === link.name ? 'text-white bg-green-600 shadow-md' : 'text-green-700 hover:bg-green-50'}`}>
                    {link.name}
                  </button>
                ))
              )}
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-full hover:bg-green-50 transition-colors">
              {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-slideDown">
            <div className="space-y-3">
              {[...navLinks, ...authLinks.filter(link => isLoggedIn ? link.isAuth : !link.isAuth)].map((link) => {
                const IconComponent = link.icon;
                return (
                  <button key={link.name} onClick={() => { navigate(link.href); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === link.name ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 hover:text-white'}`}>
                    {IconComponent && <IconComponent className="w-5 h-5" />}
                    {link.name}
                  </button>
                );
              })}
              {isLoggedIn && (
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all text-red-600 hover:bg-red-50">
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
