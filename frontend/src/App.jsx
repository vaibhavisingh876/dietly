import React from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import Nav from "./components/Nav.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Analyze from "./pages/Analyze.jsx";
import Questionnaire from "./pages/Questionnaire.jsx";
import Pantry from "./pages/Pantry.jsx";
import Calories from "./pages/Calories.jsx";
import MealAnalysisPage from "./pages/MealAnalysisPage.jsx";
import Progress from "./pages/Progress.jsx";

function PageTransitionWrapper({ children }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

function AppLayout() {
  const location = useLocation();

  const hideNavbar = ["/login", "/register", "/questionnaire"].includes(
    location.pathname
  );

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col selection:bg-clay-200 selection:text-clay-900">
      {!hideNavbar && <Nav />}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransitionWrapper>
                  <Home />
                </PageTransitionWrapper>
              }
            />

            <Route
              path="/login"
              element={
                <PageTransitionWrapper>
                  <Login />
                </PageTransitionWrapper>
              }
            />

            <Route
              path="/register"
              element={
                <PageTransitionWrapper>
                  <Register />
                </PageTransitionWrapper>
              }
            />

            <Route
              path="/questionnaire"
              element={
                <PageTransitionWrapper>
                  <Questionnaire />
                </PageTransitionWrapper>
              }
            />

            <Route
              path="/profile"
              element={
                <PageTransitionWrapper>
                  <Profile />
                </PageTransitionWrapper>
              }
            />

            <Route
              path="/analyze"
              element={
                <PageTransitionWrapper>
                  <Analyze />
                </PageTransitionWrapper>
              }
            />

            <Route
              path="/history"
              element={
                <PageTransitionWrapper>
                  <MealAnalysisPage />
                </PageTransitionWrapper>
              }
            />

            <Route
              path="/history/:id"
              element={
                <PageTransitionWrapper>
                  <MealAnalysisPage />
                </PageTransitionWrapper>
              }
            />

            <Route
              path="/pantry"
              element={
                <PageTransitionWrapper>
                  <Pantry />
                </PageTransitionWrapper>
              }
            />

            <Route
              path="/calories"
              element={
                <PageTransitionWrapper>
                  <Calories />
                </PageTransitionWrapper>
              }
            />

            <Route
              path="/progress"
              element={
                <PageTransitionWrapper>
                  <Progress />
                </PageTransitionWrapper>
              }
            />

            <Route
              path="*"
              element={
                <PageTransitionWrapper>
                  <div className="min-h-[70vh] flex items-center justify-center px-4">
                    <div className="text-center">
                      <h1 className="font-display text-6xl font-bold text-forest-800">
                        404
                      </h1>

                      <p className="mt-3 text-ink-600 font-medium">
                        The page you are looking for doesn't exist.
                      </p>

                      <Link
                        to="/"
                        className="inline-block mt-6 px-6 py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold transition-all shadow-sm"
                      >
                        Return to Home
                      </Link>
                    </div>
                  </div>
                </PageTransitionWrapper>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}
