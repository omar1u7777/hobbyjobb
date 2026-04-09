'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('payments', {
      id: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
      amount_total: { type: S.DECIMAL(10,2), allowNull: false },
      amount_platform: { type: S.DECIMAL(10,2), allowNull: false },
      amount_payee: { type: S.DECIMAL(10,2), allowNull: false },
      stripe_payment_id: { type: S.STRING(255), allowNull: true },
      stripe_transfer_id: { type: S.STRING(255), allowNull: true },
      status: { type: S.ENUM('pending','held','released','failed'), defaultValue: 'pending' },
      confirmed_at: { type: S.DATE, allowNull: true },
      job_id: { type: S.INTEGER, allowNull: false, references: { model: 'jobs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      payer_id: { type: S.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      payee_id: { type: S.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('NOW()') },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('NOW()') },
    });
  },
  async down(qi) { await qi.dropTable('payments'); },
};
