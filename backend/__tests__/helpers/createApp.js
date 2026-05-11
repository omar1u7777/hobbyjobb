/**
 * Creates a minimal Express app for supertest without starting the real server.
 * Models and Stripe are mocked so no real DB or API calls are made.
 */
const express = require('express');
const errorHandler = require('../../src/middleware/errorHandler');

function createApp({ authRouter, paymentsRouter, adminRouter } = {}) {
  const app = express();
  app.use(express.json());

  if (authRouter)    app.use('/api/auth', authRouter);
  if (paymentsRouter) app.use('/api/payments', paymentsRouter);
  if (adminRouter)   app.use('/api/admin', adminRouter);

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
