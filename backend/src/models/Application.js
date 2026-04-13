const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Application', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    message: { type: DataTypes.TEXT, allowNull: true },
    proposed_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'withdrawn'), defaultValue: 'pending' },
    job_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'jobs', key: 'id' } },
    applicant_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  }, { tableName: 'applications', timestamps: true, underscored: true });
};
