'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      lat: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
      },
      lng: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      avatar: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      is_admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      hobby_total_year: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      hobby_job_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      hobby_limit_reached: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      hobby_warned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
