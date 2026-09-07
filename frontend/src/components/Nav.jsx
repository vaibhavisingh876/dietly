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
  TrendingUp,
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
    } else if (path.startsWith("/progress")) {
      setActiveTab("Progress");
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
    {
      name: "Progress",
      href: "/progress",
      icon: TrendingUp,
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
    navigate("/login");
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
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[95vw] max-w-5xl ${
          isScrolled
            ? "top-3 scale-[0.98]"
            : "top-5 scale-100"
        }`}
      >
        <div className="bg-cream-50/95 backdrop-blur-md shadow-[0_2px_20px_rgba(38,36,31,0.08)] border border-cream-300 rounded-2xl px-3 py-2 flex items-center gap-1">
          {/* LOGO */}
          <button
            type="button"
            onClick={() => handleNavigate("/")}
            className="flex items-center gap-2 px-3 py-2 shrink-0"
            aria-label="Go to Dietly home"
          >
            <img
              src="/animated-leaf.svg"
              alt="Dietly"
              className="w-9 h-9"
            />

            <span className="font-display text-lg font-semibold text-forest-700">
              Dietly
            </span>
          </button>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-0.5 ml-2">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                activeTab === link.name;

              return (
                <button
                  type="button"
                  key={link.name}
                  onClick={() => handleNavigate(link.href)}
                  className={`relative px-3.5 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? "bg-forest-700 text-white"
                      : "text-ink-600 hover:text-forest-700 hover:bg-forest-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </button>
              );
            })}
          </div>

          {/* DESKTOP AUTH SECTION */}
          <div className="hidden md:flex items-center gap-2 ml-auto shrink-0">
            {isLoggedIn ? (
              <>
                {/* USER NAME */}
                <button
                  type="button"
                  onClick={() => handleNavigate("/profile")}
                  title={userName}
                  className={`max-w-[180px] px-3.5 py-2 rounded-lg font-medium text-sm transition-colors duration-200 text-white flex items-center gap-2 ${
                    activeTab === "Profile"
                      ? "bg-clay-600"
                      : "bg-clay-500 hover:bg-clay-600"
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
                  className="px-3.5 py-2 rounded-lg font-medium text-sm text-ink-500 hover:text-clay-600 hover:bg-clay-50 transition-colors duration-200 flex items-center gap-1.5"
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
                  className={`px-3.5 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
                    activeTab === "Login"
                      ? "text-white bg-forest-700"
                      : "text-forest-700 hover:bg-forest-50"
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
                  className={`px-3.5 py-2 rounded-lg font-medium text-sm text-white bg-clay-500 hover:bg-clay-600 transition-colors duration-200 ${
                    activeTab === "Register"
                      ? "bg-clay-600"
                      : ""
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
            className="md:hidden ml-auto p-2 rounded-lg hover:bg-forest-50 transition-colors"
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-ink-700" />
            ) : (
              <Menu className="w-5 h-5 text-ink-700" />
            )}
          </button>
        </div>
      </nav>

      {/* =========================================
          MOBILE MENU
      ========================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm md:hidden">
          <div className="absolute top-24 left-4 right-4 bg-cream-50 rounded-2xl shadow-2xl border border-cream-300 p-3 space-y-1">
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
                  className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium transition-colors ${
                    isActive
                      ? "bg-forest-700 text-white"
                      : "text-ink-700 hover:bg-forest-50"
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
                  className={`w-full px-5 py-3.5 rounded-xl font-medium text-left transition-colors ${
                    activeTab === "Login"
                      ? "bg-forest-700 text-white"
                      : "text-forest-700 hover:bg-forest-50"
                  }`}
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleNavigate("/register")
                  }
                  className={`w-full px-5 py-3.5 rounded-xl font-medium text-left transition-colors ${
                    activeTab === "Register"
                      ? "bg-clay-600 text-white"
                      : "text-clay-600 hover:bg-clay-50"
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
                  className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium transition-colors ${
                    activeTab === "Profile"
                      ? "bg-forest-700 text-white"
                      : "text-ink-700 hover:bg-forest-50"
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
                  className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-clay-600 hover:bg-clay-50 font-medium"
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