'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('messages', {
      id: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
      content: { type: S.TEXT, allowNull: false },
      is_read: { type: S.BOOLEAN, defaultValue: false },
      sender_id: { type: S.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      receiver_id: { type: S.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      job_id: { type: S.INTEGER, allowNull: true, references: { model: 'jobs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('NOW()') },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('NOW()') },
    });
  },
  async down(qi) { await qi.dropTable('messages'); },
};
