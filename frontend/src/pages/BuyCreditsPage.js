import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Bot, 
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Copy,
  AlertCircle
} from 'lucide-react';
import { pricingPlans } from '../mockData';
import { useToast } from '../hooks/use-toast';
import { transactionsAPI } from '../services/api';

const BuyCreditsPage = () => {
  const navigate = useNavigate();
  const { user, updateCredits } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentStep, setPaymentStep] = useState('select'); // select, payment, confirm
  const [transactionId, setTransactionId] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  const UPI_ID = '9366183700@fam';

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'UPI ID copied to clipboard'
    });
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setPaymentStep('payment');
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!transactionId) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your transaction ID',
        variant: 'destructive'
      });
      return;
    }

    try {
      await transactionsAPI.createPurchase(selectedPlan.id, transactionId);
      
      toast({
        title: 'Payment Submitted!',
        description: 'Your payment is pending admin verification. Credits will be added once approved.'
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to submit payment',
        variant: 'destructive'
      });
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Buy Credits</h1>
            <p className="text-slate-400">Choose a plan and fuel your glory farming operations</p>
          </div>

          {paymentStep === 'select' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan) => (
                <Card key={plan.id} className={`relative ${plan.popular ? 'border-orange-600 bg-slate-900' : 'bg-slate-900/50 border-slate-800'} hover:scale-105 transition-transform duration-300`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-orange-600 text-white">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                      <span className="text-slate-400"> / {plan.credits} Credits</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-slate-300">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={() => handlePlanSelect(plan)}
                    >
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {paymentStep === 'payment' && selectedPlan && (
            <div className="max-w-2xl mx-auto">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Complete Payment</CardTitle>
                  <CardDescription className="text-slate-400">
                    Pay via UPI to activate your credits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Selected Plan */}
                  <div className="p-4 bg-gradient-to-r from-orange-600 to-purple-600 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-semibold text-lg">{selectedPlan.name} Plan</div>
                        <div className="text-white/80">{selectedPlan.credits} Credits</div>
                      </div>
                      <div className="text-3xl font-bold text-white">₹{selectedPlan.price}</div>
                    </div>
                  </div>

                  {/* UPI Payment Instructions */}
                  <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                      <CreditCard className="w-5 h-5 text-purple-400 mr-2" />
                      Payment Instructions
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-400 text-sm">Step 1: Pay to this UPI ID</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Input
                            value={UPI_ID}
                            readOnly
                            className="bg-slate-900 border-slate-700 text-white font-mono text-lg"
                          />
                          <Button
                            variant="outline"
                            className="border-slate-700 hover:bg-slate-800"
                            onClick={() => copyToClipboard(UPI_ID)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-slate-400 text-sm">Step 2: Amount to Pay</Label>
                        <div className="mt-2 p-3 bg-slate-900 rounded-lg border border-slate-700">
                          <div className="text-3xl font-bold text-white">₹{selectedPlan.price}</div>
                        </div>
                      </div>

                      <div className="flex items-start p-4 bg-blue-600/10 rounded-lg border border-blue-600/30">
                        <AlertCircle className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-slate-300">
                          After making the payment, enter your transaction ID below. Credits will be added to your account once verified.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction ID Form */}
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="transactionId" className="text-slate-300">Transaction ID / UTR Number *</Label>
                      <Input
                        id="transactionId"
                        placeholder="Enter your UPI transaction ID"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white"
                        required
                      />
                      <p className="text-sm text-slate-400 mt-2">
                        You can find this in your UPI app's transaction history
                      </p>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                        onClick={() => setPaymentStep('select')}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        Confirm Payment
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyCreditsPage;
