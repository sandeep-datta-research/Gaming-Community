import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { mockStats, pricingPlans, testimonials } from '../mockData';
import { 
  Zap, 
  Shield, 
  Globe, 
  Clock, 
  CreditCard, 
  HeadphonesIcon,
  Activity,
  Bot,
  TrendingUp,
  CheckCircle2,
  Star,
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Smart Automation',
      description: 'Our intelligent bots work 24/7 to maximize your clan glory earnings with optimized strategies and minimal resource usage.'
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: 'Real-Time Dashboard',
      description: 'Monitor your glory progress, bot status, and earnings in real-time through our intuitive web dashboard.'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Multi-Region Support',
      description: 'Support for all major regions including Middle East, India, Bangladesh, and more. Play from anywhere in the world.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Safe',
      description: 'Advanced security measures ensure your account safety. We use encrypted connections and secure authentication.'
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: 'Credit System',
      description: 'Flexible credit-based system lets you control your usage. Get refunds for unsuccessful sessions automatically.'
    },
    {
      icon: <HeadphonesIcon className="w-8 h-8" />,
      title: '24/7 Support',
      description: 'Our dedicated support team is always ready to help you with any questions or issues you might encounter.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Account',
      description: 'Sign up for a free account and get access to your personal dashboard.'
    },
    {
      number: '02',
      title: 'Add Credits',
      description: 'Purchase credits to power your glory farming sessions.'
    },
    {
      number: '03',
      title: 'Enter Clan ID',
      description: 'Input your Free Fire clan ID and select your preferred region.'
    },
    {
      number: '04',
      title: 'Watch Glory Grow',
      description: 'Sit back and watch as your clan glory increases automatically!'
    }
  ];

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
              <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-purple-600/10 blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-orange-600/20 text-orange-400 border-orange-600/50 px-4 py-1.5 text-sm">
              Most Advanced Glory Bot
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Dominate Your Clan Glory
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
                Automatically
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              The most advanced Free Fire clan glory automation system. Boost your clan's ranking while you sleep with our intelligent bot technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8" onClick={() => navigate('/register')}>
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                How It Works
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">{mockStats.totalGloryEarned / 1000000}M+</div>
                <div className="text-slate-400">Glory Earned Daily</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-purple-500 mb-2">{mockStats.uptime}%</div>
                <div className="text-slate-400">Uptime</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-blue-500 mb-2">{mockStats.activeUsers}+</div>
                <div className="text-slate-400">Active Users</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-16 px-4 bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-2xl">Live Glory Stats</CardTitle>
                  <CardDescription className="text-slate-400">Real-time monitoring</CardDescription>
                </div>
                <Badge className="bg-green-600/20 text-green-400 border-green-600/50">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Daily Progress</div>
                  <div className="text-2xl font-bold text-white">{mockStats.dailyProgress}%</div>
                  <div className="text-sm text-green-400">+12M Glory</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Bots Active</div>
                  <div className="text-2xl font-bold text-white">{mockStats.activeBots}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Running</div>
                  <div className="text-2xl font-bold text-white">24/7</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Region</div>
                  <div className="text-2xl font-bold text-white">{mockStats.region}</div>
                  <div className="text-sm text-orange-400">+{mockStats.gloryPerHour / 1000}k Glory/Hour</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose Glory Bot?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Experience the most powerful and reliable clan glory automation system built for serious players.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-900/50 border-slate-800 hover:border-orange-600/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-purple-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-slate-400">
              Get started with Glory Bot in just a few simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-orange-600/20 mb-4">{step.number}</div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Simple Pricing</h2>
            <p className="text-xl text-slate-400">
              Choose the plan that fits your needs. No hidden fees, cancel anytime.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-orange-600 bg-slate-900' : 'bg-slate-900/50 border-slate-800'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
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
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={() => navigate('/register')}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">What Players Say</h2>
            <p className="text-xl text-slate-400">
              Join thousands of satisfied clan leaders who trust Glory Bot.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6 italic">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-slate-400">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-orange-600 to-purple-600 border-0">
            <CardContent className="pt-12 pb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Dominate the Leaderboards?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join thousands of clan leaders who are already using Glory Bot to maximize their clan's potential.
              </p>
              <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100 px-8" onClick={() => navigate('/register')}>
                Start Your Journey Now
                <TrendingUp className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <p>© 2025 Glory Bot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
