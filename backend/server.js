require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimiter = require('./src/middleware/rateLimiter');

const app = express();

// Trust first proxy (Render/Vercel/Heroku sit behind a load balancer).
// Required for express-rate-limit to see the real client IP and for
// req.secure / secure cookies to work correctly behind HTTPS termination.
app.set('trust proxy', 1);

// Security middleware.
// crossOriginResourcePolicy MUST be 'cross-origin' because the API is consumed
// from a different origin (Vercel). Helmet's default 'same-origin' causes the
// browser to reject successful responses even when CORS headers are correct,
// which surfaces as a generic "Network Error" in the frontend.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Rate-limit everything EXCEPT the Stripe webhook endpoint. Stripe webhooks come
// from a small pool of IPs and a load spike must not result in 429s — Stripe
// will retry, but throttling is a code smell and risks delayed escrow updates.
app.use((req, res, next) => {
  if (req.path === '/api/payments/webhook') return next();
  return rateLimiter(req, res, next);
});

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'],
  credentials: true
}));

// Stripe webhook raw body (must be registered BEFORE express.json())
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// JSON parser with 1mb limit (prevents DoS via huge payloads)
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/payments', require('./src/routes/payments'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/jobs', require('./src/routes/jobs'));
app.use('/api/applications', require('./src/routes/applications'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/messages', require('./src/routes/messages'));
app.use('/api/reviews', require('./src/routes/reviews'));
app.use('/api/admin', require('./src/routes/admin'));

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ message: 'HobbyJobb API is running', status: 'ok' });
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Check required env variables
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️  DATABASE_URL not set - database connection skipped');
      console.warn('   Create backend/.env file with DATABASE_URL=postgresql://...');
    } else {
      // Database connection
      const { sequelize } = require('./src/models');
      await sequelize.authenticate();
      console.log('✅ Database connected');
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
}

startServer();
