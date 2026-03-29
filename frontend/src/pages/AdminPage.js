import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Bot, 
  ArrowLeft,
  Users,
  Activity,
  DollarSign,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { mockUsers, mockBotSessions, mockTransactions } from '../mockData';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    activeSessions: 0,
    totalGlory: 0
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    // Load mock data
    setAllUsers(mockUsers);
    setAllSessions(mockBotSessions);
    setAllTransactions(mockTransactions);
    
    // Calculate stats
    const revenue = mockTransactions
      .filter(t => t.type === 'credit_purchase')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const glory = mockBotSessions.reduce((sum, s) => sum + s.gloryEarned, 0);
    
    setStats({
      totalUsers: mockUsers.length,
      totalRevenue: revenue,
      activeSessions: mockBotSessions.filter(s => s.status === 'running').length,
      totalGlory: glory
    });
  }, [isAdmin, navigate]);

  if (!isAdmin || !user) {
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
              <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/50 ml-2">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
            <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">Monitor and manage the entire Glory Bot platform</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-white/80" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.totalUsers}</div>
                <div className="text-sm text-white/80">Total Users</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-white/80" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">₹{stats.totalRevenue}</div>
                <div className="text-sm text-white/80">Total Revenue</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-8 h-8 text-white/80" />
                  <Badge className="bg-white/20 text-white">Live</Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.activeSessions}</div>
                <div className="text-sm text-white/80">Active Sessions</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-white/80" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{(stats.totalGlory / 1000000).toFixed(1)}M</div>
                <div className="text-sm text-white/80">Total Glory Farmed</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-slate-900 border border-slate-800">
              <TabsTrigger value="users" className="data-[state=active]:bg-orange-600">Users</TabsTrigger>
              <TabsTrigger value="sessions" className="data-[state=active]:bg-orange-600">Sessions</TabsTrigger>
              <TabsTrigger value="transactions" className="data-[state=active]:bg-orange-600">Transactions</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">All Users</CardTitle>
                  <CardDescription className="text-slate-400">Manage registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allUsers.map((u) => (
                      <div key={u.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-white">{u.name}</span>
                              {u.role === 'admin' && (
                                <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/50">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-slate-400">{u.email}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-slate-400">Credits</div>
                            <div className="text-xl font-bold text-white">{u.credits}</div>
                          </div>
                          <div className="text-right ml-6">
                            <div className="text-sm text-slate-400">Glory Earned</div>
                            <div className="text-xl font-bold text-white">{(u.totalGloryEarned / 1000000).toFixed(1)}M</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Bot Sessions</CardTitle>
                  <CardDescription className="text-slate-400">All bot farming sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allSessions.map((session) => (
                      <div key={session.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-white">Session {session.id}</div>
                            <div className="text-sm text-slate-400">Clan: {session.clanId} | Region: {session.region}</div>
                          </div>
                          <Badge className={session.status === 'running' ? 'bg-green-600/20 text-green-400 border-green-600/50' : 'bg-slate-600/20 text-slate-400 border-slate-600/50'}>
                            {session.status === 'running' && <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>}
                            {session.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mt-3">
                          <div>
                            <div className="text-xs text-slate-400">Bots</div>
                            <div className="text-white font-semibold">{session.botCount}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400">Glory Earned</div>
                            <div className="text-white font-semibold">{(session.gloryEarned / 1000000).toFixed(2)}M</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400">Glory/Hour</div>
                            <div className="text-white font-semibold">{session.gloryPerHour / 1000}k</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400">Started</div>
                            <div className="text-white font-semibold">{new Date(session.startTime).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">All Transactions</CardTitle>
                  <CardDescription className="text-slate-400">Credit purchases and usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allTransactions.map((txn) => (
                      <div key={txn.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-white">
                              {txn.type === 'credit_purchase' ? 'Credit Purchase' : 'Credit Used'}
                            </div>
                            <div className="text-sm text-slate-400">
                              {new Date(txn.timestamp).toLocaleString()}
                            </div>
                            {txn.paymentMethod && (
                              <div className="text-sm text-slate-400 mt-1">
                                Payment: {txn.paymentMethod} ({txn.upiId})
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            {txn.amount && (
                              <div className="text-xl font-bold text-green-400 mb-1">₹{txn.amount}</div>
                            )}
                            <div className={`font-semibold ${txn.credits > 0 ? 'text-green-400' : 'text-orange-400'}`}>
                              {txn.credits > 0 ? '+' : ''}{txn.credits} Credits
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
