// frontend/src/components/Nav.jsx
import React, { useEffect, useState } from 'react';
import { Leaf, Menu, X, BarChart3, ChefHat, User, LogOut, Target } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");

  const location = useLocation();
  const navigate = useNavigate();

  // update auth state from localStorage
  useEffect(() => {
    const updateAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user'); // Get the raw JSON string

      let nameToDisplay = 'User';

      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          
          // 🎯 FIX: Rely solely on the stored 'user' object for data.
          // Since the backend only guarantees 'email' (and not 'name'),
          // we extract the username by splitting the email address.
          if (userObj && userObj.email) {
            nameToDisplay = userObj.email.split('@')[0];
          } else if (userObj && userObj.name) {
            // Fallback in case a 'name' field is added later
            nameToDisplay = userObj.name;
          }
        } catch (e) {
          console.error("Error parsing user data from localStorage:", e);
        }
      }
      
      setIsLoggedIn(!!token);
      setUserName(nameToDisplay);
    };

    updateAuth();
    window.addEventListener('authChanged', updateAuth);
    return () => window.removeEventListener('authChanged', updateAuth);
  }, []);

  // active tab detection
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path === "/") setActiveTab("Home");
    else if (path.includes("/analyze")) setActiveTab("Analyze");
    else if (path.includes("/pantry")) setActiveTab("Pantry");
    else if (path.includes("/profile")) setActiveTab("Profile");
    else if (path.includes("/calories")) setActiveTab("Calories");
    else setActiveTab("");
  }, [location]);

  // scroll effect
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/", icon: BarChart3 },
    { name: "Analyze", href: "/analyze", icon: ChefHat },
    { name: "Pantry", href: "/pantry", icon: Leaf },
    { name: "Calories", href: "/calories", icon: Target },
  ];

  const guestLinks = [
    { name: "Login", href: "/login" },
    { name: "Register", href: "/register" },
  ];

  const handleLogout = () => {
    // Remove only necessary auth-related keys
    localStorage.removeItem('token');
    // 🎯 FIX: Only need to remove 'user' now, since others were removed in Login.jsx
    localStorage.removeItem('user'); 
    
    // Optional: Remove other potentially inconsistent keys just in case
    localStorage.removeItem('userId'); 
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');

    window.dispatchEvent(new Event('authChanged'));
    navigate('/login');
  };

  return (
    <>
      <nav className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${isScrolled ? 'top-4 scale-95' : 'top-6 scale-100'}`}>
        <div className="bg-white/90 backdrop-blur-xl rounded-full shadow-xl border border-green-100 px-6 sm:px-8 py-4">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-30"></div>
                <div className="relative bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-full">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-green-700 via-green-600 to-green-700 bg-clip-text text-transparent">
                Dietly
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.name;
                return (
                  <button
                    key={link.name}
                    onClick={() => navigate(link.href)}
                    className={`relative px-5 py-2.5 rounded-full font-semibold transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-600 hover:text-green-700 hover:bg-green-50'}`}
                  >
                    {isActive && <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-full shadow-md"></div>}
                    <span className="relative flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {link.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <button onClick={() => navigate('/profile')} className={`relative px-4 py-2.5 rounded-full font-semibold transition-all duration-300 text-white flex items-center gap-2 ${activeTab === 'Profile' ? 'bg-green-700 shadow-md' : 'bg-green-600 hover:bg-green-700'}`}>
                    <User className="w-5 h-5" />
                    <span>{userName.split(' ')[0]}</span>
                  </button>
                  <button onClick={handleLogout} className="relative p-2.5 rounded-full font-semibold transition-all duration-300 text-gray-600 hover:bg-red-50 hover:text-red-700" title="Logout">
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                guestLinks.map((l) => (
                  <button key={l.name} onClick={() => navigate(l.href)} className={`relative px-5 py-2.5 rounded-full font-semibold transition-all duration-300 ${activeTab === l.name ? 'text-white bg-green-600 shadow-md' : 'text-green-700 hover:bg-green-50'}`}>
                    {l.name}
                  </button>
                ))
              )}
            </div>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-full hover:bg-green-50 transition-colors">
              {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-slideDown">
            <div className="space-y-3">
              {navLinks.map((link) => (
                <button key={link.name} onClick={() => { navigate(link.href); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all text-gray-700 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 hover:text-white">
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </button>
              ))}

              {!isLoggedIn && (
                <>
                  <button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className="w-full px-6 py-4 rounded-2xl text-green-700 hover:bg-green-100 font-semibold">Login</button>
                  <button onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }} className="w-full px-6 py-4 rounded-2xl text-green-700 hover:bg-green-100 font-semibold">Register</button>
                </>
              )}

              {isLoggedIn && (
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-red-600 hover:bg-red-50 font-semibold">
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
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </>
  );
}