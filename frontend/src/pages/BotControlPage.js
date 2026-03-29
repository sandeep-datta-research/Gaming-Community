import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Slider } from '../components/ui/slider';
import { 
  Bot, 
  ArrowLeft,
  Zap,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { regions } from '../mockData';
import { useToast } from '../hooks/use-toast';
import { botSessionsAPI } from '../services/api';

const BotControlPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    clanId: '',
    region: '',
    botCount: 4,
    speed: 'normal'
  });
  const [isStarting, setIsStarting] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const botOptions = [4, 8, 12, 16, 20];
  const speedMultiplier = formData.botCount / 4;
  const estimatedGloryPerHour = 200000 * speedMultiplier;
  const creditsNeeded = 1;

  const handleStartSession = async (e) => {
    e.preventDefault();
    
    if (user.credits < creditsNeeded) {
      toast({
        title: 'Insufficient Credits',
        description: 'Please purchase more credits to start a session',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.clanId || !formData.region) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsStarting(true);
    
    try {
      await botSessionsAPI.start(formData.clanId, formData.region, formData.botCount);
      await refreshUser();
      
      toast({
        title: 'Session Started!',
        description: `${formData.botCount} bots are now farming glory for your clan`,
      });
      
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to start session',
        variant: 'destructive'
      });
    } finally {
      setIsStarting(false);
    }
  };

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
            <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Bot Control Panel</h1>
            <p className="text-slate-400">Configure and launch your glory farming session</p>
          </div>

          {/* Credits Info */}
          <Card className="bg-gradient-to-r from-orange-600 to-purple-600 border-0 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/80 mb-1">Available Credits</div>
                  <div className="text-3xl font-bold text-white">{user.credits}</div>
                </div>
                <Button 
                  variant="secondary" 
                  className="bg-white text-orange-600 hover:bg-slate-100"
                  onClick={() => navigate('/buy-credits')}
                >
                  Buy More
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Form */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Session Configuration</CardTitle>
              <CardDescription className="text-slate-400">
                Set up your bot parameters for optimal glory farming
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStartSession} className="space-y-6">
                {/* Clan ID */}
                <div>
                  <Label htmlFor="clanId" className="text-slate-300">Guild UID * (Not Clan ID)</Label>
                  <Input
                    id="clanId"
                    placeholder="Enter your Free Fire GUILD UID"
                    value={formData.clanId}
                    onChange={(e) => setFormData({ ...formData, clanId: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                  <p className="text-sm text-slate-400 mt-2">
                    ⚠️ Enter GUILD UID (not clan name). Bots will auto-request to join.
                  </p>
                </div>

                {/* Region */}
                <div>
                  <Label htmlFor="region" className="text-slate-300">Region *</Label>
                  <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select your region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.code} value={region.code}>
                          {region.flag} {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bot Count */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-slate-300">Number of Bots</Label>
                    <Badge className="bg-orange-600/20 text-orange-400 border-orange-600/50">
                      {formData.botCount} Bots
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <Slider
                      value={[formData.botCount]}
                      onValueChange={(value) => setFormData({ ...formData, botCount: value[0] })}
                      min={4}
                      max={20}
                      step={4}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>4 bots (Normal)</span>
                      <span>8 bots (Fast)</span>
                      <span>12+ bots (Ultra Fast)</span>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-slate-300">
                        <span className="font-semibold">Tip:</span> More bots = faster glory farming. Bots operate in groups of 4.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estimated Stats */}
                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <Zap className="w-5 h-5 text-yellow-400 mr-2" />
                    Estimated Performance
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Glory per Hour</div>
                      <div className="text-2xl font-bold text-white">{estimatedGloryPerHour / 1000}k</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Session Duration</div>
                      <div className="text-2xl font-bold text-white">~6 hours</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Total Glory</div>
                      <div className="text-2xl font-bold text-white">~{(estimatedGloryPerHour * 6) / 1000000}M</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Credits Cost</div>
                      <div className="text-2xl font-bold text-white">{creditsNeeded}</div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-lg"
                  disabled={isStarting || user.credits < creditsNeeded}
                >
                  {isStarting ? (
                    'Starting Session...'
                  ) : user.credits < creditsNeeded ? (
                    'Insufficient Credits'
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Start Glory Farming
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BotControlPage;
