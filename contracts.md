# FF Glory Bot - API Contracts & Backend Implementation Plan

## Overview
This document outlines the API contracts, mock data replacements, and backend implementation plan for the FF Glory Bot platform.

## Current Mock Data (mockData.js)
The following data is currently mocked and needs to be replaced with actual backend API calls:

### 1. Users
- **Mock**: `mockUsers` array with admin and test users
- **Backend**: User authentication, registration, profile management
- **Admin Access**: sandeepdatta866@gmail.com

### 2. Bot Sessions
- **Mock**: `mockBotSessions` with running/completed sessions
- **Backend**: Real-time bot session management, glory tracking

### 3. Transactions
- **Mock**: `mockTransactions` with credit purchases and usage
- **Backend**: UPI payment tracking (9366183700@fam), credit management

### 4. Statistics
- **Mock**: `mockStats` with platform-wide statistics
- **Backend**: Aggregated analytics from all sessions

## API Endpoints to Implement

### Authentication
```
POST /api/auth/register
Body: { name, email, password }
Response: { user, token }

POST /api/auth/login
Body: { email, password }
Response: { user, token }

GET /api/auth/me
Headers: { Authorization: Bearer <token> }
Response: { user }
```

### User Management
```
GET /api/users/profile
Response: { id, name, email, credits, totalGloryEarned, role }

PATCH /api/users/credits
Body: { amount }
Response: { credits }
```

### Bot Sessions
```
POST /api/sessions/start
Body: { clanId, region, botCount }
Response: { sessionId, status, estimatedCompletion }

GET /api/sessions
Response: [{ id, clanId, region, botCount, status, gloryEarned, ... }]

GET /api/sessions/:id
Response: { id, clanId, region, botCount, status, gloryEarned, ... }

PATCH /api/sessions/:id/stop
Response: { status, finalGloryEarned }
```

### Transactions & Payments
```
POST /api/transactions/purchase
Body: { planId, transactionId, upiId }
Response: { transactionId, credits, status }

GET /api/transactions
Response: [{ id, type, amount, credits, timestamp, ... }]
```

### Admin Endpoints
```
GET /api/admin/users
Response: [{ all users with stats }]

GET /api/admin/sessions
Response: [{ all sessions }]

GET /api/admin/transactions
Response: [{ all transactions }]

GET /api/admin/stats
Response: { totalUsers, totalRevenue, activeSessions, totalGlory }
```

## Database Models (MongoDB)

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  credits: Number (default: 0),
  totalGloryEarned: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### BotSession Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  clanId: String,
  region: String,
  botCount: Number,
  status: String (enum: ['pending', 'running', 'completed', 'failed']),
  gloryEarned: Number (default: 0),
  gloryPerHour: Number,
  startTime: Date,
  endTime: Date,
  estimatedCompletion: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String (enum: ['credit_purchase', 'credit_usage', 'refund']),
  amount: Number (INR),
  credits: Number,
  status: String (enum: ['pending', 'completed', 'failed']),
  paymentMethod: String (default: 'UPI'),
  upiId: String,
  upiTransactionId: String,
  sessionId: ObjectId (ref: BotSession, optional),
  timestamp: Date,
  createdAt: Date
}
```

## Bot Automation Logic

### Bot Operation (4 bots per group)
- **Normal Speed**: 4 bots = 200k glory/hour
- **Fast Speed**: 8 bots = 400k glory/hour
- **Ultra Fast**: 12+ bots = 600k+ glory/hour

### Session Workflow
1. User starts session with clanId, region, botCount
2. Deduct 1 credit from user account
3. Create session document in DB
4. Start bot simulation (mock for now, can integrate real Free Fire automation later)
5. Update glory earned every minute
6. Send real-time updates via WebSocket (optional)
7. Complete session after 6 hours or manual stop
8. Update user's totalGloryEarned

### Credit System
- 1 Credit = 1 Bot Session (6 hours)
- Credits purchased via UPI (9366183700@fam)
- Admin manually verifies UPI transaction ID and approves
- Auto-refund if session fails

## Frontend-Backend Integration

### Authentication Context (AuthContext.js)
Replace mock functions with actual API calls:
- `login()` → POST /api/auth/login
- `register()` → POST /api/auth/register
- `logout()` → Clear local storage + token
- `updateCredits()` → PATCH /api/users/credits

### Pages to Integrate
1. **LoginPage.js**: Call POST /api/auth/login
2. **RegisterPage.js**: Call POST /api/auth/register
3. **DashboardPage.js**: Call GET /api/sessions, GET /api/transactions
4. **BotControlPage.js**: Call POST /api/sessions/start
5. **BuyCreditsPage.js**: Call POST /api/transactions/purchase
6. **AdminPage.js**: Call GET /api/admin/* endpoints

## Security Considerations
- JWT token-based authentication
- Password hashing with bcrypt
- Admin role verification middleware
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration

## Payment Flow
1. User selects plan on BuyCreditsPage
2. Display UPI ID: 9366183700@fam
3. User makes payment via UPI app
4. User submits transaction ID
5. Admin receives notification (optional)
6. Admin verifies payment and approves (can be automated with payment gateway later)
7. Credits added to user account

## Next Steps
1. Implement User & Auth models with JWT
2. Implement Bot Session model and CRUD endpoints
3. Implement Transaction model and payment verification
4. Create admin middleware for protected routes
5. Replace all frontend mock data with actual API calls
6. Add real-time updates for active sessions (optional WebSocket)
7. Implement bot automation logic (can be mocked initially)
8. Add error handling and validation
9. Testing and deployment
