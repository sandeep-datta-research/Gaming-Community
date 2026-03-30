import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GameController, Eye, EyeSlash, CircleNotch } from '@phosphor-icons/react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    setLoading(true);
    
    const result = await register(
      formData.name,
      formData.email,
      formData.username,
      formData.password
    );
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <GameController size={40} weight="duotone" className="text-volt" />
            <span className="font-display text-3xl">GAMEVERSE</span>
          </Link>
        </div>

        {/* Register Form */}
        <div className="bg-surface border border-white/10 p-8">
          <h1 className="font-display text-2xl text-center mb-6">CREATE ACCOUNT</h1>
          
          {error && (
            <div className="bg-blaze/10 border border-blaze/30 text-blaze px-4 py-3 mb-6 text-sm" data-testid="register-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-secondary mb-2">
                Display Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                data-testid="register-name"
                className="w-full px-4 py-3 bg-obsidian border border-white/20 focus:ring-2 focus:ring-volt focus:border-transparent"
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-secondary mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                data-testid="register-username"
                className="w-full px-4 py-3 bg-obsidian border border-white/20 focus:ring-2 focus:ring-volt focus:border-transparent"
                placeholder="Choose a unique username"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-secondary mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                data-testid="register-email"
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  data-testid="register-password"
                  className="w-full px-4 py-3 pr-12 bg-obsidian border border-white/20 focus:ring-2 focus:ring-volt focus:border-transparent"
                  placeholder="Create a password"
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

            <div>
              <label className="block text-xs uppercase tracking-wider text-secondary mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                data-testid="register-confirm-password"
                className="w-full px-4 py-3 bg-obsidian border border-white/20 focus:ring-2 focus:ring-volt focus:border-transparent"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="register-submit"
              className="w-full btn-primary py-3 rounded-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <CircleNotch size={20} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-volt hover:underline" data-testid="register-login-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
