const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    lat: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    lng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Email verification flag. No automated verification flow exists yet;
    // accounts are considered verified on creation. If/when an email-verification
    // flow is added, default should change back to false and a verification
    // token pipeline introduced.
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Hobbyverksamhet tracking
    hobby_total_year: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    hobby_job_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    hobby_limit_reached: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    hobby_warned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
  });
};
