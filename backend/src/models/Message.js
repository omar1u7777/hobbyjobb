const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Message', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    sender_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    receiver_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    job_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'jobs', key: 'id' } },
  }, { tableName: 'messages', timestamps: true, underscored: true });
};
