'use strict';

/**
 * Adds a partial unique index on payments.stripe_payment_id.
 *
 * Two concurrent webhooks or confirm calls for the same Stripe PaymentIntent
 * could in theory race past the application-layer `findOne` check and create
 * two Payment rows for the same intent. Postgres-level unique enforcement
 * closes that window permanently.
 *
 * Partial (WHERE stripe_payment_id IS NOT NULL) so legacy/test rows without
 * an intent ID don't collide.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS payments_stripe_payment_id_unique
      ON payments (stripe_payment_id)
      WHERE stripe_payment_id IS NOT NULL;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS payments_stripe_payment_id_unique;'
    );
  },
};
