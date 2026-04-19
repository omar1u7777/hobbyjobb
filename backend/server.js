require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimiter = require('./src/middleware/rateLimiter');

const app = express();

// Security middleware
app.use(helmet());
app.use(rateLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'],
  credentials: true
}));

// Stripe webhook raw body (must be registered BEFORE express.json())
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// JSON parser
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/payments', require('./src/routes/payments'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/jobs', require('./src/routes/jobs'));
app.use('/api/applications', require('./src/routes/applications'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/messages', require('./src/routes/messages'));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'HobbyJobb API is running', status: 'ok' });
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
