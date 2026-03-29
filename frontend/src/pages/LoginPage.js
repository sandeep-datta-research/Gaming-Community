import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Bot } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = login(formData.email, formData.password);
    
    if (result.success) {
      toast({
        title: 'Login Successful',
        description: 'Welcome back to Glory Bot!'
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Login Failed',
        description: result.error,
        variant: 'destructive'
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bot className="w-10 h-10 text-orange-500" />
            <span className="text-2xl font-bold text-white">Glory Bot</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Login to access your dashboard</p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Login</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-orange-500 hover:text-orange-400">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 mb-2">Demo Accounts:</p>
              <p className="text-xs text-slate-300">Admin: sandeepdatta866@gmail.com</p>
              <p className="text-xs text-slate-300">User: user@example.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
