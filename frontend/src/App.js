import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/toaster";
import LandingPage from "./pages/LandingPage";
import DisclaimerPage from "./pages/DisclaimerPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import BotControlPage from "./pages/BotControlPage";
import BuyCreditsPage from "./pages/BuyCreditsPage";
import AdminPage from "./pages/AdminPage";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const disclaimerAccepted = localStorage.getItem('ffglory_disclaimer_accepted');
  if (!disclaimerAccepted) {
    return <Navigate to="/disclaimer" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/login" element={<ProtectedRoute><LoginPage /></ProtectedRoute>} />
            <Route path="/register" element={<ProtectedRoute><RegisterPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/bot-control" element={<ProtectedRoute><BotControlPage /></ProtectedRoute>} />
            <Route path="/buy-credits" element={<ProtectedRoute><BuyCreditsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
