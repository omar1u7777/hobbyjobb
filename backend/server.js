require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./src/models');
const routes = require('./src/routes');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'], credentials: true }));
app.use(express.json());
app.use('/api', routes);
app.get('/', (req, res) => res.json({ message: 'HobbyJobb API is running', status: 'ok' }));

const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT));
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
}
startServer();
