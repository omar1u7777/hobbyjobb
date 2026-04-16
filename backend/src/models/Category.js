const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    icon: { type: DataTypes.STRING(50), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    max_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  }, { tableName: 'categories', timestamps: true, underscored: true });
};
