const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Review', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT, allowNull: true },
    job_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'jobs', key: 'id' } },
    reviewer_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    reviewee_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  }, { tableName: 'reviews', timestamps: true, underscored: true });
};
