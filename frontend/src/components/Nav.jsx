// frontend/src/components/Nav.jsx
import React, { useEffect, useState } from "react";
import {
  Leaf,
  Menu,
  X,
  BarChart3,
  ChefHat,
  User,
  LogOut,
  Target,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { logout, getUser } from "../utils/auth";

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");

  const location = useLocation();
  const navigate = useNavigate();

  // Update auth state from localStorage
  useEffect(() => {
    const updateAuth = () => {
      const token = localStorage.getItem("token");
      const user = getUser();

      let nameToDisplay = "User";

      if (user?.email) {
        nameToDisplay = user.email.split("@")[0];
      } else if (user?.name) {
        nameToDisplay = user.name;
      }

      setIsLoggedIn(!!token);
      setUserName(nameToDisplay);
    };

    updateAuth();

    window.addEventListener("authChanged", updateAuth);

    return () => {
      window.removeEventListener("authChanged", updateAuth);
    };
  }, []);

  // Active tab detection
  useEffect(() => {
    const path = location.pathname.toLowerCase();

    if (path === "/") setActiveTab("Home");
    else if (path.includes("/analyze")) setActiveTab("Analyze");
    else if (path.includes("/pantry")) setActiveTab("Pantry");
    else if (path.includes("/profile")) setActiveTab("Profile");
    else if (path.includes("/calories")) setActiveTab("Calories");
    else setActiveTab("");
  }, [location]);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
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
    logout();
  };

  return (
    <>
      <nav
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          isScrolled ? "top-4 scale-95" : "top-6 scale-100"
        }`}
      >
        <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-full px-4 py-2 flex items-center gap-2">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2"
          >
            <Leaf className="w-6 h-6 text-green-600" />

            <span className="text-xl font-bold text-gray-800">
              Dietly
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.name;

              return (
                <button
                  key={link.name}
                  onClick={() => navigate(link.href)}
                  className={`relative px-5 py-2.5 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? "bg-green-600 text-white shadow-md"
                      : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </button>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-2 ml-2">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => navigate("/profile")}
                  className={`px-4 py-2.5 rounded-full font-semibold transition-all duration-300 text-white flex items-center gap-2 ${
                    activeTab === "Profile"
                      ? "bg-green-700 shadow-md"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  <User className="w-4 h-4" />
                  {userName.split(" ")[0]}
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 rounded-full font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-300 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              guestLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => navigate(link.href)}
                  className={`relative px-5 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                    activeTab === link.name
                      ? "text-white bg-green-600 shadow-md"
                      : "text-green-700 hover:bg-green-50"
                  }`}
                >
                  {link.name}
                </button>
              ))
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-green-50 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden">
          <div className="absolute top-24 left-4 right-4 bg-white rounded-3xl shadow-2xl p-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;

              return (
                <button
                  key={link.name}
                  onClick={() => {
                    navigate(link.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all text-gray-700 hover:bg-green-600 hover:text-white"
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </button>
              );
            })}

            {!isLoggedIn && (
              <>
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-6 py-4 rounded-2xl text-green-700 hover:bg-green-100 font-semibold text-left"
                >
                  Login
                </button>

                <button
                  onClick={() => {
                    navigate("/register");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-6 py-4 rounded-2xl text-green-700 hover:bg-green-100 font-semibold text-left"
                >
                  Register
                </button>
              </>
            )}

            {isLoggedIn && (
              <>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-gray-700 hover:bg-green-100 font-semibold"
                >
                  <User className="w-5 h-5" />
                  Profile
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-red-600 hover:bg-red-50 font-semibold"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}