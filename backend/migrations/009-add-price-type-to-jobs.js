'use strict';

/**
 * Adds a `price_type` column to jobs so the UI selector (Fast pris /
 * Per timme / Förhandlingsbart) is actually persisted. Before this
 * migration the value was silently dropped on create/update and every
 * job rendered as "Fast pris" on the detail page.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('jobs', 'price_type', {
      type: Sequelize.ENUM('fixed', 'hourly', 'negotiable'),
      allowNull: false,
      defaultValue: 'fixed',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('jobs', 'price_type');
    // Postgres leaves the ENUM type behind after column removal.
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_jobs_price_type";');
  },
};
