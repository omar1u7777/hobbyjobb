'use strict';

/**
 * - Adds a unique constraint on (reviewer_id, job_id) in reviews so a single
 *   user cannot leave multiple reviews for the same job even under race
 *   conditions that slip past the application-layer check.
 * - Backfills is_verified = true for existing users. No automated email
 *   verification flow exists yet; the default has been changed from false to
 *   true to reflect that accounts are considered verified on creation.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('reviews', {
      fields: ['reviewer_id', 'job_id'],
      type: 'unique',
      name: 'reviews_reviewer_job_unique',
    });

    await queryInterface.bulkUpdate(
      'users',
      { is_verified: true },
      { is_verified: false },
    );

    await queryInterface.changeColumn('users', 'is_verified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('reviews', 'reviews_reviewer_job_unique');

    await queryInterface.changeColumn('users', 'is_verified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },
};
