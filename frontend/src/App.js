import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TournamentsPage from './pages/TournamentsPage';
import ClansPage from './pages/ClansPage';
import LeaderboardsPage from './pages/LeaderboardsPage';
import CommunityPage from './pages/CommunityPage';
import SchedulePage from './pages/SchedulePage';
import ProfilePage from './pages/ProfilePage';

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-obsidian">
      {!isAuthPage && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournaments"
          element={
            <ProtectedRoute>
              <TournamentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clans"
          element={
            <ProtectedRoute>
              <ClansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboards"
          element={
            <ProtectedRoute>
              <LeaderboardsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <SchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to landing */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
      <Toaster position="bottom-right" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
