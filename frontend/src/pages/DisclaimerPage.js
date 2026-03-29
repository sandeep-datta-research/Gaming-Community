import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle, Shield, Ban, Scale } from 'lucide-react';

const DisclaimerPage = () => {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const handleAccept = () => {
    if (agreed) {
      localStorage.setItem('ffglory_disclaimer_accepted', 'true');
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        <Card className="bg-slate-900/50 border-red-800">
          <CardHeader>
            <CardTitle className="text-white text-3xl flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
              LEGAL DISCLAIMER & WARNING
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Warning */}
            <Alert className="bg-red-900/20 border-red-600">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <AlertDescription className="text-red-300 font-semibold text-lg">
                THIS SOFTWARE CONNECTS TO REAL FREE FIRE GAME SERVERS AND VIOLATES GARENA'S TERMS OF SERVICE
              </AlertDescription>
            </Alert>

            {/* Risks Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Ban className="w-6 h-6 text-orange-500 mr-2" />
                SERIOUS RISKS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-red-600/30">
                  <h4 className="font-semibold text-red-400 mb-2">⚠️ Account Bans</h4>
                  <p className="text-slate-300 text-sm">
                    Permanent bans on all Free Fire accounts used with this service. No appeals, no refunds.
                  </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-red-600/30">
                  <h4 className="font-semibold text-red-400 mb-2">⚠️ Loss of Progress</h4>
                  <p className="text-slate-300 text-sm">
                    Complete loss of all game progress, purchases, skins, and achievements.
                  </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-red-600/30">
                  <h4 className="font-semibold text-red-400 mb-2">⚠️ IP Bans</h4>
                  <p className="text-slate-300 text-sm">
                    Your device and IP address may be permanently banned from Free Fire servers.
                  </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-red-600/30">
                  <h4 className="font-semibold text-red-400 mb-2">⚠️ Legal Action</h4>
                  <p className="text-slate-300 text-sm">
                    Garena reserves the right to take legal action against users violating their ToS.
                  </p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">How This System Works</h3>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span><strong>Reverse Engineering:</strong> Uses reverse-engineered Free Fire network protocols</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span><strong>Bot Deployment:</strong> Deploys 4+ automated bots to your clan</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span><strong>Automated Gameplay:</strong> Bots play matches automatically to earn glory</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span><strong>Real Server Connection:</strong> Actually connects to Garena's game servers</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Scale className="w-6 h-6 text-purple-500 mr-2" />
                Legal Notice
              </h3>
              <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-600/30">
                <p className="text-slate-300 text-sm mb-3">
                  This software is provided for <strong>EDUCATIONAL AND RESEARCH PURPOSES ONLY</strong>.
                </p>
                <p className="text-slate-300 text-sm mb-3">
                  By using this service, you acknowledge that:
                </p>
                <ul className="space-y-1 text-slate-300 text-sm ml-4">
                  <li>• You are using it at your own risk</li>
                  <li>• You accept full responsibility for any consequences</li>
                  <li>• The developers are not liable for any damages</li>
                  <li>• You will not hold anyone responsible for bans or losses</li>
                  <li>• You understand this violates Free Fire's Terms of Service</li>
                </ul>
              </div>
            </div>

            {/* Safe Mode Option */}
            <Alert className="bg-green-900/20 border-green-600">
              <Shield className="w-5 h-5 text-green-500" />
              <AlertDescription className="text-green-300">
                <strong>SAFE MODE:</strong> You can use SIMULATION mode which does NOT connect to real servers and is 100% safe for testing purposes.
              </AlertDescription>
            </Alert>

            {/* Agreement Checkbox */}
            <div className="flex items-start space-x-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <Checkbox
                id="agree"
                checked={agreed}
                onCheckedChange={setAgreed}
                className="mt-1"
              />
              <label htmlFor="agree" className="text-slate-300 text-sm cursor-pointer">
                I have read and understood all warnings and disclaimers. I acknowledge that using this service violates Free Fire's Terms of Service and may result in permanent account bans. I accept full responsibility for any consequences and will not hold the developers liable for any damages or losses.
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Go Back
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!agreed}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                I Accept the Risks - Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DisclaimerPage;
