'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('categories', [
      { name: 'Trädgård', icon: '🌿', description: 'Hjälp med trädgårdsarbete och gräsklippning', max_price: 600, created_at: now, updated_at: now },
      { name: 'Städning', icon: '🧹', description: 'Hemstädning och flyttstädning', max_price: 700, created_at: now, updated_at: now },
      { name: 'Flytt', icon: '📦', description: 'Bärhjälp och mindre flyttuppdrag', max_price: 1000, created_at: now, updated_at: now },
      { name: 'Målning', icon: '🎨', description: 'Enklare målningsarbete', max_price: 900, created_at: now, updated_at: now },
      { name: 'IT-hjälp', icon: '💻', description: 'Teknikhjälp för dator, mobil och nätverk', max_price: 1200, created_at: now, updated_at: now },
      { name: 'Matlagning', icon: '🍳', description: 'Matförberedelse och catering i liten skala', max_price: 800, created_at: now, updated_at: now },
      { name: 'Musik', icon: '🎵', description: 'Musiklektioner och enklare underhållning', max_price: 1000, created_at: now, updated_at: now },
      { name: 'Foto', icon: '📷', description: 'Fotografering för enklare event', max_price: 1500, created_at: now, updated_at: now },
      { name: 'Handyman', icon: '🔧', description: 'Småreparationer och montering', max_price: 900, created_at: now, updated_at: now },
      { name: 'Barnvakt', icon: '🧸', description: 'Barnpassning vid behov', max_price: 700, created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', {
      name: [
        'Trädgård',
        'Städning',
        'Flytt',
        'Målning',
        'IT-hjälp',
        'Matlagning',
        'Musik',
        'Foto',
        'Handyman',
        'Barnvakt',
      ],
    });
  },
};
