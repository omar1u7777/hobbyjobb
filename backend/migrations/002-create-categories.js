'use strict';
module.exports = {
  async up(qi, S) {
    await qi.createTable('categories', {
      id: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: S.STRING(100), allowNull: false, unique: true },
      icon: { type: S.STRING(50), allowNull: true },
      description: { type: S.TEXT, allowNull: true },
      max_price: { type: S.DECIMAL(10,2), allowNull: true },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('NOW()') },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('NOW()') },
    });
  },
  async down(qi) { await qi.dropTable('categories'); },
};
