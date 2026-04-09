'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('users', {
      id: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: S.STRING(100), allowNull: false },
      email: { type: S.STRING(255), allowNull: false, unique: true },
      password: { type: S.STRING(255), allowNull: false },
      location: { type: S.STRING(255), allowNull: true },
      lat: { type: S.DECIMAL(10,7), allowNull: true },
      lng: { type: S.DECIMAL(10,7), allowNull: true },
      bio: { type: S.TEXT, allowNull: true },
      avatar: { type: S.STRING(500), allowNull: true },
      is_admin: { type: S.BOOLEAN, defaultValue: false },
      is_verified: { type: S.BOOLEAN, defaultValue: false },
      hobby_total_year: { type: S.DECIMAL(10,2), defaultValue: 0 },
      hobby_job_count: { type: S.INTEGER, defaultValue: 0 },
      hobby_limit_reached: { type: S.BOOLEAN, defaultValue: false },
      hobby_warned: { type: S.BOOLEAN, defaultValue: false },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('NOW()') },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('NOW()') },
    });
  },
  async down(qi) { await qi.dropTable('users'); },
};
