'use strict';
module.exports = {
  async up(qi) {
    await qi.bulkInsert('categories', [
      { name: 'Tradgard & Grasklippning', icon: '🌿', description: 'Klipp gras, beskar hackar', max_price: 2000, created_at: new Date(), updated_at: new Date() },
      { name: 'Flytt & Barhjалp', icon: '📦', description: 'Hjalp med att flytta mobler', max_price: 3000, created_at: new Date(), updated_at: new Date() },
      { name: 'Hundpromenad & Djurpassning', icon: '🐕', description: 'Rasta hundar, mata katter', max_price: 1000, created_at: new Date(), updated_at: new Date() },
      { name: 'Stadning', icon: '🧹', description: 'Hemstadning, fonsterputs', max_price: 2500, created_at: new Date(), updated_at: new Date() },
      { name: 'Handyman & Montering', icon: '🔧', description: 'Montera mobler, fixa smasaker', max_price: 3000, created_at: new Date(), updated_at: new Date() },
      { name: 'Leverans & Arenden', icon: '🚗', description: 'Hamta paket, handla mat', max_price: 1500, created_at: new Date(), updated_at: new Date() },
      { name: 'Barnvakt & Laxhjalp', icon: '👶', description: 'Passa barn, hjalpa med laxor', max_price: 1500, created_at: new Date(), updated_at: new Date() },
      { name: 'IT & Teknikhjalp', icon: '💻', description: 'Installera program, fixa WiFi', max_price: 2000, created_at: new Date(), updated_at: new Date() },
      { name: 'Matlagning & Bakning', icon: '🍳', description: 'Laga mat till fest, baka tarta', max_price: 3000, created_at: new Date(), updated_at: new Date() },
      { name: 'Ovrigt', icon: '✨', description: 'Andra smajobb', max_price: 5000, created_at: new Date(), updated_at: new Date() },
    ]);
  },
  async down(qi) { await qi.bulkDelete('categories', null, {}); },
};
