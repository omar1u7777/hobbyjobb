const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Job', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    price_type: { type: DataTypes.ENUM('fixed', 'hourly', 'negotiable'), allowNull: false, defaultValue: 'fixed' },
    location: { type: DataTypes.STRING(255), allowNull: true },
    lat: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    lng: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    status: { type: DataTypes.ENUM('open', 'in_progress', 'completed', 'cancelled'), defaultValue: 'open' },
    is_hobby_valid: { type: DataTypes.BOOLEAN, defaultValue: true },
    hobby_type: { type: DataTypes.STRING(50), allowNull: true },
    is_boosted: { type: DataTypes.BOOLEAN, defaultValue: false },
    boost_expires_at: { type: DataTypes.DATE, allowNull: true },
    expires_at: { type: DataTypes.DATE, allowNull: true },
    poster_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    category_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'categories', key: 'id' } },
  }, { tableName: 'jobs', timestamps: true, underscored: true });
};
