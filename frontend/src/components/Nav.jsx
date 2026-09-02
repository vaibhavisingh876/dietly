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
  History,
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

  // -----------------------------------------
  // AUTH STATE
  // -----------------------------------------
  useEffect(() => {
    const updateAuth = () => {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const user = getUser();

      let nameToDisplay = "User";

      // Prefer the actual registered name.
      if (user?.name?.trim()) {
        nameToDisplay = user.name.trim();
      } else if (user?.email) {
        nameToDisplay = user.email.split("@")[0];
      }

      setIsLoggedIn(Boolean(token));
      setUserName(nameToDisplay);
    };

    updateAuth();

    window.addEventListener("authChanged", updateAuth);

    return () => {
      window.removeEventListener("authChanged", updateAuth);
    };
  }, []);

  // -----------------------------------------
  // ACTIVE TAB
  // -----------------------------------------
  useEffect(() => {
    const path = location.pathname.toLowerCase();

    if (path === "/") {
      setActiveTab("Home");
    } else if (path.startsWith("/analyze")) {
      setActiveTab("Analyze");
    } else if (path.startsWith("/pantry")) {
      setActiveTab("Pantry");
    } else if (path.startsWith("/calories")) {
      setActiveTab("Calories");
    } else if (path.startsWith("/history")) {
      setActiveTab("History");
    } else if (path.startsWith("/profile")) {
      setActiveTab("Profile");
    } else if (path.startsWith("/login")) {
      setActiveTab("Login");
    } else if (path.startsWith("/register")) {
      setActiveTab("Register");
    } else {
      setActiveTab("");
    }

    // Close mobile menu whenever route changes.
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // -----------------------------------------
  // SCROLL EFFECT
  // -----------------------------------------
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // -----------------------------------------
  // NAVIGATION
  // -----------------------------------------
  const authenticatedLinks = [
    {
      name: "Home",
      href: "/",
      icon: BarChart3,
    },
    {
      name: "Analyze",
      href: "/analyze",
      icon: ChefHat,
    },
    {
      name: "History",
      href: "/history",
      icon: History,
    },
    {
      name: "Pantry",
      href: "/pantry",
      icon: Leaf,
    },
    {
      name: "Calories",
      href: "/calories",
      icon: Target,
    },
  ];

  const guestLinks = [
    {
      name: "Home",
      href: "/",
      icon: BarChart3,
    },
  ];

  const handleNavigate = (href) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
  };

  const visibleLinks = isLoggedIn
    ? authenticatedLinks
    : guestLinks;

  return (
    <>
      {/* =========================================
          DESKTOP / MAIN NAVBAR
      ========================================= */}
      <nav
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          isScrolled
            ? "top-4 scale-95"
            : "top-6 scale-100"
        }`}
      >
        <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-full px-4 py-2 flex items-center gap-2 max-w-[95vw]">
          {/* LOGO */}
          <button
            type="button"
            onClick={() => handleNavigate("/")}
            className="flex items-center gap-2 px-4 py-2 shrink-0"
            aria-label="Go to Dietly home"
          >
            <Leaf className="w-6 h-6 text-green-600" />

            <span className="text-xl font-bold text-gray-800">
              Dietly
            </span>
          </button>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                activeTab === link.name;

              return (
                <button
                  type="button"
                  key={link.name}
                  onClick={() => handleNavigate(link.href)}
                  className={`relative px-4 py-2.5 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
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

          {/* DESKTOP AUTH SECTION */}
          <div className="hidden md:flex items-center gap-2 ml-2 shrink-0">
            {isLoggedIn ? (
              <>
                {/* USER NAME */}
                <button
                  type="button"
                  onClick={() => handleNavigate("/profile")}
                  title={userName}
                  className={`max-w-[180px] px-4 py-2.5 rounded-full font-semibold transition-all duration-300 text-white flex items-center gap-2 ${
                    activeTab === "Profile"
                      ? "bg-green-700 shadow-md"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  <User className="w-4 h-4 shrink-0" />

                  <span className="truncate">
                    {userName}
                  </span>
                </button>

                {/* LOGOUT */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2.5 rounded-full font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-300 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* LOGIN */}
                <button
                  type="button"
                  onClick={() =>
                    handleNavigate("/login")
                  }
                  className={`px-4 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                    activeTab === "Login"
                      ? "text-white bg-green-600 shadow-md"
                      : "text-green-700 hover:bg-green-50"
                  }`}
                >
                  Login
                </button>

                {/* REGISTER */}
                <button
                  type="button"
                  onClick={() =>
                    handleNavigate("/register")
                  }
                  className={`px-4 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                    activeTab === "Register"
                      ? "text-white bg-green-600 shadow-md"
                      : "text-green-700 hover:bg-green-50"
                  }`}
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() =>
              setIsMobileMenuOpen((prev) => !prev)
            }
            className="md:hidden p-2 rounded-full hover:bg-green-50 transition-colors"
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* =========================================
          MOBILE MENU
      ========================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden">
          <div className="absolute top-24 left-4 right-4 bg-white rounded-3xl shadow-2xl p-4 space-y-2">
            {/* NAV LINKS */}
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                activeTab === link.name;

              return (
                <button
                  type="button"
                  key={link.name}
                  onClick={() =>
                    handleNavigate(link.href)
                  }
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                    isActive
                      ? "bg-green-600 text-white"
                      : "text-gray-700 hover:bg-green-600 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </button>
              );
            })}

            {/* GUEST ACTIONS */}
            {!isLoggedIn && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleNavigate("/login")
                  }
                  className={`w-full px-6 py-4 rounded-2xl font-semibold text-left transition-colors ${
                    activeTab === "Login"
                      ? "bg-green-600 text-white"
                      : "text-green-700 hover:bg-green-100"
                  }`}
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleNavigate("/register")
                  }
                  className={`w-full px-6 py-4 rounded-2xl font-semibold text-left transition-colors ${
                    activeTab === "Register"
                      ? "bg-green-600 text-white"
                      : "text-green-700 hover:bg-green-100"
                  }`}
                >
                  Register
                </button>
              </>
            )}

            {/* LOGGED-IN ACTIONS */}
            {isLoggedIn && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleNavigate("/profile")
                  }
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-colors ${
                    activeTab === "Profile"
                      ? "bg-green-600 text-white"
                      : "text-gray-700 hover:bg-green-100"
                  }`}
                >
                  <User className="w-5 h-5" />

                  <span className="truncate">
                    {userName}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
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