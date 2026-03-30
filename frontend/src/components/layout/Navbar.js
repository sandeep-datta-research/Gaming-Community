import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  House,
  Trophy,
  Users,
  ChartBar,
  ChatCircle,
  Calendar,
  User,
  SignOut,
  List,
  X,
  GameController,
} from '@phosphor-icons/react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: House },
  { path: '/tournaments', label: 'Tournaments', icon: Trophy },
  { path: '/clans', label: 'Clans', icon: Users },
  { path: '/leaderboards', label: 'Leaderboards', icon: ChartBar },
  { path: '/community', label: 'Community', icon: ChatCircle },
  { path: '/schedule', label: 'Schedule', icon: Calendar },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-obsidian/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
            <GameController size={32} weight="duotone" className="text-volt" />
            <span className="font-display text-2xl tracking-tight">GAMEVERSE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated && navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-volt'
                      : 'text-secondary hover:text-pure'
                  }`}
                >
                  <Icon size={18} weight={isActive ? 'duotone' : 'regular'} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to={`/profile/${user?.username || user?.id}`}
                  data-testid="nav-profile"
                  className="flex items-center gap-2 text-secondary hover:text-pure transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center border border-white/10">
                    {user?.profile?.avatar_url ? (
                      <img src={user.profile.avatar_url} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                  <span className="text-sm font-medium">{user?.name}</span>
                </Link>
                <button
                  onClick={logout}
                  data-testid="nav-logout"
                  className="p-2 text-secondary hover:text-blaze transition-colors"
                  title="Logout"
                >
                  <SignOut size={20} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  data-testid="nav-login"
                  className="btn-secondary px-4 py-2 text-sm rounded-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  data-testid="nav-register"
                  className="btn-primary px-4 py-2 text-sm rounded-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-secondary hover:text-pure"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-t border-white/10">
          <div className="px-4 py-4 space-y-2">
            {isAuthenticated && navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${
                    isActive
                      ? 'bg-volt/10 text-volt'
                      : 'text-secondary hover:bg-surface-elevated hover:text-pure'
                  }`}
                >
                  <Icon size={20} weight={isActive ? 'duotone' : 'regular'} />
                  {item.label}
                </Link>
              );
            })}
            
            {isAuthenticated ? (
              <>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <Link
                    to={`/profile/${user?.username || user?.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-elevated hover:text-pure rounded-sm"
                  >
                    <User size={20} />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-secondary hover:bg-surface-elevated hover:text-blaze rounded-sm"
                  >
                    <SignOut size={20} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-white/10 pt-4 mt-2 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center btn-secondary px-4 py-3 rounded-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center btn-primary px-4 py-3 rounded-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
