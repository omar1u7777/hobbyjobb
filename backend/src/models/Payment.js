const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Payment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    amount_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    amount_platform: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    amount_payee: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stripe_payment_id: { type: DataTypes.STRING(255), allowNull: true },
    stripe_transfer_id: { type: DataTypes.STRING(255), allowNull: true },
    status: { type: DataTypes.ENUM('pending', 'held', 'released', 'failed'), defaultValue: 'pending' },
    confirmed_at: { type: DataTypes.DATE, allowNull: true },
    job_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'jobs', key: 'id' } },
    payer_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    payee_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  }, { tableName: 'payments', timestamps: true, underscored: true });
};
