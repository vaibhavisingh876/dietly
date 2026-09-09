import React, { useEffect, useState, useRef } from "react";
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
  ChevronDown,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { logout, getUser } from "../utils/auth";

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // -----------------------------------------
  // AUTH STATE
  // -----------------------------------------
  useEffect(() => {
    const updateAuth = () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const user = getUser();
      let nameToDisplay = "User";

      if (user?.name?.trim()) {
        nameToDisplay = user.name.trim();
      } else if (user?.email) {
        nameToDisplay = user.email.split("@")[0];
      }

      setIsLoggedIn(Boolean(token));
      setUserName(nameToDisplay);
      setUserEmail(user?.email || "");
    };

    updateAuth();
    window.addEventListener("authChanged", updateAuth);

    return () => {
      window.removeEventListener("authChanged", updateAuth);
    };
  }, []);

  // -----------------------------------------
  // ACTIVE TAB DETECTION
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
    setIsUserDropdownOpen(false);
  }, [location.pathname]);

  // -----------------------------------------
  // SCROLL EFFECT
  // -----------------------------------------
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // -----------------------------------------
  // CLICK OUTSIDE & ESCAPE KEY LISTENERS
  // -----------------------------------------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // -----------------------------------------
  // NAVIGATION LINKS
  // -----------------------------------------
  const authenticatedLinks = [
    { name: "Home", href: "/", icon: BarChart3 },
    { name: "Analyze", href: "/analyze", icon: ChefHat },
    { name: "History", href: "/history", icon: History },
    { name: "Pantry", href: "/pantry", icon: Leaf },
    { name: "Calories", href: "/calories", icon: Target },
    { name: "Progress", href: "/progress", icon: TrendingUp },
  ];

  const guestLinks = [{ name: "Home", href: "/", icon: BarChart3 }];

  const visibleLinks = isLoggedIn ? authenticatedLinks : guestLinks;

  const handleNavigate = (href) => {
    navigate(href);
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* =========================================
          DESKTOP / MAIN NAVBAR
      ========================================= */}
      <header
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[95vw] max-w-5xl ${
          isScrolled ? "top-3" : "top-5"
        }`}
      >
        <nav
          aria-label="Main Navigation"
          className="bg-cream-50/90 backdrop-blur-md shadow-[0_4px_24px_rgba(38,36,31,0.06)] border border-cream-300/80 rounded-2xl px-3.5 py-2 flex items-center justify-between gap-2"
        >
          {/* BRAND LOGO */}
          <button
            type="button"
            onClick={() => handleNavigate("/")}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-left shrink-0 transition-opacity hover:opacity-90 focus-visible:outline-none"
            aria-label="Go to Dietly home"
          >
            <div className="w-8 h-8 rounded-lg bg-forest-100 flex items-center justify-center text-forest-700">
              <Leaf className="w-5 h-5 text-forest-600" />
            </div>
            <span className="font-display text-lg font-bold text-forest-800 tracking-tight">
              Dietly
            </span>
          </button>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:flex items-center gap-1 relative">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.name;

              return (
                <button
                  type="button"
                  key={link.name}
                  onClick={() => handleNavigate(link.href)}
                  className={`relative px-3 py-1.5 rounded-lg font-medium text-sm transition-colors duration-150 flex items-center gap-1.5 whitespace-nowrap z-10 ${
                    isActive
                      ? "text-white"
                      : "text-ink-600 hover:text-forest-700 hover:bg-forest-50/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>

                  {/* Smooth Active Tab Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId={prefersReducedMotion ? undefined : "activeNavTab"}
                      className="absolute inset-0 bg-forest-700 rounded-lg -z-10 shadow-sm"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* DESKTOP AUTH / USER DROPDOWN */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                  aria-expanded={isUserDropdownOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl border text-sm font-medium transition-all duration-150 ${
                    isUserDropdownOpen || activeTab === "Profile"
                      ? "bg-forest-50 border-forest-300 text-forest-800 shadow-sm"
                      : "bg-cream-100/80 border-cream-300 text-ink-700 hover:bg-forest-50 hover:border-forest-200"
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-clay-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[110px] truncate font-medium">
                    {userName}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-ink-500 transition-transform duration-200 ${
                      isUserDropdownOpen ? "rotate-180 text-forest-700" : ""
                    }`}
                  />
                </button>

                {/* USER DROPDOWN MENU */}
                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: 8, scale: 0.96 }
                      }
                      animate={
                        prefersReducedMotion
                          ? { opacity: 1 }
                          : { opacity: 1, y: 0, scale: 1 }
                      }
                      exit={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: 6, scale: 0.96 }
                      }
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      role="menu"
                      className="absolute right-0 mt-2 w-56 bg-cream-50 rounded-2xl shadow-xl border border-cream-300 p-1.5 z-50"
                    >
                      {/* User Info Header */}
                      <div className="px-3 py-2.5 border-b border-cream-200">
                        <p className="text-xs text-ink-400 uppercase tracking-wider font-semibold">
                          Signed in as
                        </p>
                        <p className="text-sm font-bold text-ink-900 truncate mt-0.5">
                          {userName}
                        </p>
                        {userEmail && (
                          <p className="text-xs text-ink-500 truncate">
                            {userEmail}
                          </p>
                        )}
                      </div>

                      {/* Dropdown Links */}
                      <div className="py-1">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => handleNavigate("/profile")}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                            activeTab === "Profile"
                              ? "bg-forest-50 text-forest-700"
                              : "text-ink-700 hover:bg-cream-200/70"
                          }`}
                        >
                          <User className="w-4 h-4 text-forest-600" />
                          <span>Profile & Goals</span>
                        </button>
                      </div>

                      <div className="border-t border-cream-200 pt-1">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-clay-600 hover:bg-clay-50 hover:text-clay-700 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-clay-500" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleNavigate("/login")}
                  className={`px-3.5 py-1.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    activeTab === "Login"
                      ? "text-white bg-forest-700 shadow-sm"
                      : "text-forest-700 hover:bg-forest-50"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate("/register")}
                  className="px-3.5 py-1.5 rounded-xl font-medium text-sm text-white bg-clay-500 hover:bg-clay-600 active:bg-clay-700 transition-all duration-150 shadow-sm"
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* MOBILE MENU TOGGLE BUTTON */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-xl text-ink-700 hover:bg-forest-50 transition-colors"
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </nav>
      </header>

      {/* =========================================
          MOBILE DRAWER & ANIMATED BACKDROP
      ========================================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Mobile Menu Card */}
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -16, scale: 0.98 }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, scale: 1 }
              }
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -16, scale: 0.98 }
              }
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-20 left-4 right-4 bg-cream-50 rounded-2xl shadow-2xl border border-cream-300 p-4 max-h-[85vh] overflow-y-auto"
            >
              {/* If Logged In, display user badge */}
              {isLoggedIn && (
                <div className="flex items-center gap-3 p-3 mb-2 rounded-xl bg-forest-50 border border-forest-100">
                  <div className="w-9 h-9 rounded-full bg-clay-500 text-white flex items-center justify-center font-bold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink-900 truncate">
                      {userName}
                    </p>
                    {userEmail && (
                      <p className="text-xs text-ink-500 truncate">
                        {userEmail}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Nav Links */}
              <div className="space-y-1">
                {visibleLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = activeTab === link.name;

                  return (
                    <button
                      type="button"
                      key={link.name}
                      onClick={() => handleNavigate(link.href)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                        isActive
                          ? "bg-forest-700 text-white shadow-sm"
                          : "text-ink-700 hover:bg-forest-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Guest Actions */}
              {!isLoggedIn && (
                <div className="pt-3 mt-2 border-t border-cream-200 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleNavigate("/login")}
                    className="w-full py-2.5 rounded-xl font-medium text-sm text-center text-forest-700 bg-forest-50 hover:bg-forest-100 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate("/register")}
                    className="w-full py-2.5 rounded-xl font-medium text-sm text-center text-white bg-clay-500 hover:bg-clay-600 transition-colors"
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Logged-in Profile & Logout */}
              {isLoggedIn && (
                <div className="pt-3 mt-2 border-t border-cream-200 space-y-1">
                  <button
                    type="button"
                    onClick={() => handleNavigate("/profile")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                      activeTab === "Profile"
                        ? "bg-forest-700 text-white"
                        : "text-ink-700 hover:bg-forest-50"
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span>Profile & Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-clay-600 hover:bg-clay-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
