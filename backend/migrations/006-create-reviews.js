'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('reviews', {
      id: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
      rating: { type: S.INTEGER, allowNull: false },
      comment: { type: S.TEXT, allowNull: true },
      job_id: { type: S.INTEGER, allowNull: false, references: { model: 'jobs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      reviewer_id: { type: S.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      reviewee_id: { type: S.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('NOW()') },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('NOW()') },
    });
  },
  async down(qi) { await qi.dropTable('reviews'); },
};
