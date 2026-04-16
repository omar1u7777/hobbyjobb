'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('applications', {
      id: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
      message: { type: S.TEXT, allowNull: true },
      proposed_price: { type: S.DECIMAL(10,2), allowNull: true },
      status: { type: S.ENUM('pending','accepted','rejected','withdrawn'), defaultValue: 'pending' },
      job_id: { type: S.INTEGER, allowNull: false, references: { model: 'jobs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      applicant_id: { type: S.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('NOW()') },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('NOW()') },
    });
  },
  async down(qi) {
    await qi.dropTable('applications');
    await qi.sequelize.query('DROP TYPE IF EXISTS "enum_applications_status";');
  },
};
