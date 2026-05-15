'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'stripe_account_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn('users', 'stripe_account_status', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'none',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'stripe_account_id');
    await queryInterface.removeColumn('users', 'stripe_account_status');
  },
};
