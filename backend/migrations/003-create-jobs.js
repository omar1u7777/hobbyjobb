'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('jobs', {
      id: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: S.STRING(200), allowNull: false },
      description: { type: S.TEXT, allowNull: false },
      price: { type: S.DECIMAL(10,2), allowNull: false },
      location: { type: S.STRING(255), allowNull: true },
      lat: { type: S.DECIMAL(10,7), allowNull: true },
      lng: { type: S.DECIMAL(10,7), allowNull: true },
      status: { type: S.ENUM('open','in_progress','completed','cancelled'), defaultValue: 'open' },
      is_hobby_valid: { type: S.BOOLEAN, defaultValue: true },
      hobby_type: { type: S.STRING(50), allowNull: true },
      is_boosted: { type: S.BOOLEAN, defaultValue: false },
      boost_expires_at: { type: S.DATE, allowNull: true },
      expires_at: { type: S.DATE, allowNull: true },
      poster_id: { type: S.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      category_id: { type: S.INTEGER, allowNull: false, references: { model: 'categories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('NOW()') },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('NOW()') },
    });
  },
  async down(qi) {
    await qi.dropTable('jobs');
    await qi.sequelize.query('DROP TYPE IF EXISTS "enum_jobs_status";');
  },
};
