require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'],
  credentials: true
}));

// JSON parser
app.use(express.json());

// Routes placeholder - to be implemented
// app.use('/api', require('./src/routes'));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'HobbyJobb API is running', status: 'ok' });
});

// Error handling middleware - placeholder
// const errorHandler = require('./src/middleware/errorHandler');
// app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Database connection placeholder - to be implemented
    // const { sequelize } = require('./src/models');
    // await sequelize.authenticate();
    // console.log('Database connected');
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
}

startServer();
