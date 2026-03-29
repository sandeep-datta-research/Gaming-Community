// Mock data for FF Glory Bot

export const mockUsers = [
  {
    id: '1',
    email: 'sandeepdatta866@gmail.com',
    name: 'Sandeep Datta',
    role: 'admin',
    credits: 100,
    totalGloryEarned: 45000000,
    createdAt: '2025-01-15'
  },
  {
    id: '2',
    email: 'user@example.com',
    name: 'Test User',
    role: 'user',
    credits: 5,
    totalGloryEarned: 12000000,
    createdAt: '2025-02-01'
  }
];

export const mockBotSessions = [
  {
    id: 'session-1',
    userId: '2',
    clanId: 'CLAN123456',
    region: 'ME',
    botCount: 4,
    status: 'running',
    gloryEarned: 2400000,
    startTime: new Date(Date.now() - 3600000).toISOString(),
    estimatedCompletion: new Date(Date.now() + 1800000).toISOString(),
    gloryPerHour: 200000
  },
  {
    id: 'session-2',
    userId: '2',
    clanId: 'CLAN123456',
    region: 'ME',
    botCount: 4,
    status: 'completed',
    gloryEarned: 4800000,
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() - 82800000).toISOString(),
    gloryPerHour: 200000
  }
];

export const mockTransactions = [
  {
    id: 'txn-1',
    userId: '2',
    type: 'credit_purchase',
    amount: 20,
    credits: 3,
    status: 'completed',
    paymentMethod: 'UPI',
    upiId: '9366183700@fam',
    timestamp: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'txn-2',
    userId: '2',
    type: 'credit_usage',
    credits: -1,
    sessionId: 'session-1',
    status: 'completed',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];

export const mockStats = {
  totalGloryEarned: 40000000,
  uptime: 101,
  activeUsers: 50,
  activeBots: 4,
  region: 'ME',
  gloryPerHour: 200000,
  dailyProgress: 78
};

export const regions = [
  { code: 'ME', name: 'Middle East', flag: '🇦🇪' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' }
];

export const pricingPlans = [
  {
    id: 'plan-1',
    name: 'Starter',
    price: 10,
    credits: 1,
    features: [
      '1 Glory Session',
      'Basic Dashboard Access',
      'Email Support',
      '1 Active Group',
      'Auto-Refund Feature'
    ]
  },
  {
    id: 'plan-2',
    name: 'Pro',
    price: 20,
    credits: 3,
    popular: true,
    features: [
      '3 Glory Sessions',
      'Full Dashboard Access',
      'Priority Support',
      '3 Active Groups',
      'Auto-Refund Feature'
    ]
  },
  {
    id: 'plan-3',
    name: 'Elite',
    price: 50,
    credits: 10,
    features: [
      '10 Glory Sessions',
      'Premium Dashboard',
      '24/7 Priority Support',
      'Unlimited Active Groups',
      'Auto-Refund + Bonus Credits'
    ]
  }
];

export const testimonials = [
  {
    id: 1,
    name: 'Ahmed K.',
    role: 'Clan Leader - Desert Storm',
    avatar: 'AK',
    rating: 5,
    text: 'Glory Bot completely changed our clan\'s ranking. We went from Top 100 to Top 10 in just two weeks. The automation is flawless!'
  },
  {
    id: 2,
    name: 'Raj S.',
    role: 'Clan Officer - Phoenix Rising',
    avatar: 'RS',
    rating: 5,
    text: 'The refund system is amazing. Had an issue with one session and got my credit back instantly. Best customer service I\'ve experienced!'
  },
  {
    id: 3,
    name: 'Mohammed H.',
    role: 'Clan Leader - Night Wolves',
    avatar: 'MH',
    rating: 5,
    text: 'Easy to use, great dashboard, and consistent results. We\'ve been using Glory Bot for 3 months now and couldn\'t be happier with the results.'
  }
];
