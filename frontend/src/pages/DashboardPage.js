import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  Bot, 
  CreditCard, 
  TrendingUp, 
  Activity,
  LogOut,
  Settings,
  PlayCircle,
  Home,
  ShieldCheck
} from 'lucide-react';
import { botSessionsAPI, transactionsAPI } from '../services/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin, refreshUser } = useAuth();
  const [activeSessions, setActiveSessions] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Refresh user data
    refreshUser();
    // Poll for updates every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [sessions, transactions] = await Promise.all([
        botSessionsAPI.getAll(),
        transactionsAPI.getAll()
      ]);
      setActiveSessions(sessions.filter(s => s.status === 'running'));
      setRecentTransactions(transactions.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="w-8 h-8 text-orange-500" />
              <span className="text-xl font-bold text-white">Glory Bot</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              {isAdmin && (
                <Button variant="ghost" className="text-purple-400 hover:text-purple-300" onClick={() => navigate('/admin')}>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user.name}!</h1>
            <p className="text-slate-400">Manage your glory farming operations from here</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-8 h-8 text-white/80" />
                  <Badge className="bg-white/20 text-white">Available</Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{user.credits}</div>
                <div className="text-sm text-white/80">Credits</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-white/80" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {(user.totalGloryEarned / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-white/80">Total Glory Earned</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Bot className="w-8 h-8 text-white/80" />
                  <Badge className="bg-green-500/20 text-white border-0">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    Active
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{activeSessions.length}</div>
                <div className="text-sm text-white/80">Active Sessions</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-8 h-8 text-white/80" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {activeSessions.reduce((acc, s) => acc + s.botCount, 0)}
                </div>
                <div className="text-sm text-white/80">Bots Running</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Start New Session
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Launch bots to farm glory for your clan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => navigate('/bot-control')}
                >
                  Start Farming
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Buy Credits
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Purchase more credits to continue farming
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => navigate('/buy-credits')}
                >
                  Add Credits
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Active Sessions */}
          {activeSessions.length > 0 && (
            <Card className="bg-slate-900/50 border-slate-800 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Active Sessions</CardTitle>
                <CardDescription className="text-slate-400">Currently running bot sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeSessions.map((session) => {
                    const progress = Math.min((session.gloryEarned / 5000000) * 100, 100);
                    const timeElapsed = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 60000);
                    
                    return (
                      <div key={session.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-semibold text-white">Clan ID: {session.clanId}</div>
                            <div className="text-sm text-slate-400">Region: {session.region} | {session.botCount} Bots</div>
                          </div>
                          <Badge className="bg-green-600/20 text-green-400 border-green-600/50">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                            Running {timeElapsed}m
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Glory Earned</span>
                            <span className="text-white font-semibold">{(session.gloryEarned / 1000000).toFixed(2)}M</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>{session.gloryPerHour / 1000}k Glory/Hour</span>
                            <span>Target: 5M</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Transactions */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <CardDescription className="text-slate-400">Your latest credit activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">
                        {txn.type === 'credit_purchase' ? 'Credit Purchase' : 'Credit Used'}
                      </div>
                      <div className="text-sm text-slate-400">
                        {new Date(txn.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`font-semibold ${txn.credits > 0 ? 'text-green-400' : 'text-orange-400'}`}>
                      {txn.credits > 0 ? '+' : ''}{txn.credits} Credits
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
