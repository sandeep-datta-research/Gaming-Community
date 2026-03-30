import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GameController, Eye, EyeSlash, CircleNotch } from '@phosphor-icons/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <GameController size={40} weight="duotone" className="text-volt" />
            <span className="font-display text-3xl">GAMEVERSE</span>
          </Link>
        </div>

        {/* Login Form */}
        <div className="bg-surface border border-white/10 p-8">
          <h1 className="font-display text-2xl text-center mb-6">WELCOME BACK</h1>
          
          {error && (
            <div className="bg-blaze/10 border border-blaze/30 text-blaze px-4 py-3 mb-6 text-sm" data-testid="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-secondary mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="login-email"
                className="w-full px-4 py-3 bg-obsidian border border-white/20 focus:ring-2 focus:ring-volt focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="login-password"
                  className="w-full px-4 py-3 pr-12 bg-obsidian border border-white/20 focus:ring-2 focus:ring-volt focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-pure"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-secondary">
                <input type="checkbox" className="w-4 h-4 bg-obsidian border-white/20" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-volt hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit"
              className="w-full btn-primary py-3 rounded-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <CircleNotch size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-volt hover:underline" data-testid="login-register-link">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
