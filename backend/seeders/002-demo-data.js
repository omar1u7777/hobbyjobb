'use strict';
const bcrypt = require('bcrypt');
module.exports = {
  async up(qi) {
    const hash = await bcrypt.hash('password123', 10);
    await qi.bulkInsert('users', [
      { name: 'Admin User', email: 'admin@hobbyjobb.se', password: hash, location: 'Kristianstad', lat: 56.0294, lng: 14.1567, bio: 'Platform admin', is_admin: true, is_verified: true, hobby_total_year: 0, hobby_job_count: 0, hobby_limit_reached: false, hobby_warned: false, created_at: new Date(), updated_at: new Date() },
      { name: 'Erik Svensson', email: 'erik@test.se', password: hash, location: 'Malmo', lat: 55.6050, lng: 13.0038, bio: 'Tradgardsarbete', is_admin: false, is_verified: true, hobby_total_year: 12500, hobby_job_count: 3, hobby_limit_reached: false, hobby_warned: false, created_at: new Date(), updated_at: new Date() },
      { name: 'Anna Johansson', email: 'anna@test.se', password: hash, location: 'Lund', lat: 55.7047, lng: 13.1910, bio: 'Student', is_admin: false, is_verified: true, hobby_total_year: 8200, hobby_job_count: 2, hobby_limit_reached: false, hobby_warned: false, created_at: new Date(), updated_at: new Date() },
      { name: 'Mohammed Ali', email: 'mohammed@test.se', password: hash, location: 'Helsingborg', lat: 56.0465, lng: 12.6945, bio: 'Fixare', is_admin: false, is_verified: true, hobby_total_year: 26000, hobby_job_count: 5, hobby_limit_reached: false, hobby_warned: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Sara Lindgren', email: 'sara@test.se', password: hash, location: 'Kristianstad', lat: 56.0294, lng: 14.1567, bio: 'Hundvakt', is_admin: false, is_verified: true, hobby_total_year: 4500, hobby_job_count: 1, hobby_limit_reached: false, hobby_warned: false, created_at: new Date(), updated_at: new Date() },
    ]);
    await qi.bulkInsert('jobs', [
      { title: 'Klipp graset', description: 'Ca 200 kvm gras', price: 400, location: 'Malmo', lat: 55.605, lng: 13.004, status: 'open', is_hobby_valid: true, poster_id: 2, category_id: 1, created_at: new Date(), updated_at: new Date() },
      { title: 'Flytta soffa', description: 'Bar ner soffa fran 3e van', price: 600, location: 'Malmo', lat: 55.595, lng: 13.010, status: 'open', is_hobby_valid: true, poster_id: 2, category_id: 2, created_at: new Date(), updated_at: new Date() },
      { title: 'Rasta hund i en vecka', description: '30 min per dag', price: 800, location: 'Lund', lat: 55.705, lng: 13.191, status: 'open', is_hobby_valid: true, poster_id: 3, category_id: 3, created_at: new Date(), updated_at: new Date() },
      { title: 'Storstadning', description: '3 rum och kok 75kvm', price: 1200, location: 'Helsingborg', lat: 56.047, lng: 12.695, status: 'open', is_hobby_valid: true, poster_id: 4, category_id: 4, created_at: new Date(), updated_at: new Date() },
      { title: 'Montera IKEA bokhylla', description: 'Billy bokhylla', price: 300, location: 'Kristianstad', lat: 56.029, lng: 14.157, status: 'open', is_hobby_valid: true, poster_id: 5, category_id: 5, created_at: new Date(), updated_at: new Date() },
      { title: 'Hamta paket', description: 'PostNord Malmo', price: 150, location: 'Malmo', lat: 55.610, lng: 13.020, status: 'open', is_hobby_valid: true, poster_id: 2, category_id: 6, created_at: new Date(), updated_at: new Date() },
      { title: 'Barnvakt lordag', description: '2 barn kl 18-23', price: 500, location: 'Lund', lat: 55.710, lng: 13.200, status: 'open', is_hobby_valid: true, poster_id: 3, category_id: 7, created_at: new Date(), updated_at: new Date() },
      { title: 'Installera skrivare', description: 'HP skrivare WiFi', price: 200, location: 'Helsingborg', lat: 56.050, lng: 12.700, status: 'open', is_hobby_valid: true, poster_id: 4, category_id: 8, created_at: new Date(), updated_at: new Date() },
      { title: 'Baka tarta till kalas', description: 'Chokladtarta 20 pers', price: 800, location: 'Kristianstad', lat: 56.030, lng: 14.160, status: 'open', is_hobby_valid: true, poster_id: 5, category_id: 9, created_at: new Date(), updated_at: new Date() },
      { title: 'Vattna blommor', description: '15 krukvaxter en vecka', price: 350, location: 'Malmo', lat: 55.580, lng: 12.990, status: 'open', is_hobby_valid: true, poster_id: 2, category_id: 1, created_at: new Date(), updated_at: new Date() },
    ]);
  },
  async down(qi) { await qi.bulkDelete('jobs', null, {}); await qi.bulkDelete('users', null, {}); },
};
