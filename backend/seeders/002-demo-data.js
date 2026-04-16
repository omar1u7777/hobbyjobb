'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const passwordHash = await bcrypt.hash('Password123!', 10);

    const demoUsers = [
      { name: 'Amin Demo', email: 'demo.amin@hobbyjobb.se', location: 'Kristianstad' },
      { name: 'Suha Demo', email: 'demo.suha@hobbyjobb.se', location: 'Malmö' },
      { name: 'Edvin Demo', email: 'demo.edvin@hobbyjobb.se', location: 'Lund' },
      { name: 'Qusai Demo', email: 'demo.qusai@hobbyjobb.se', location: 'Helsingborg' },
      { name: 'Sara Demo', email: 'demo.sara@hobbyjobb.se', location: 'Stockholm' },
    ].map((u) => ({
      ...u,
      password: passwordHash,
      lat: null,
      lng: null,
      bio: null,
      avatar: null,
      is_admin: false,
      is_verified: true,
      hobby_total_year: 0,
      hobby_job_count: 0,
      hobby_limit_reached: false,
      hobby_warned: false,
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert('users', demoUsers);

    const users = await queryInterface.sequelize.query(
      'SELECT id, email FROM users WHERE email IN (:emails) ORDER BY id ASC',
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { emails: demoUsers.map((u) => u.email) },
      }
    );

    const categories = await queryInterface.sequelize.query(
      'SELECT id, name FROM categories ORDER BY id ASC',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!users.length || !categories.length) {
      throw new Error('Seed prerequisites missing: users or categories not found.');
    }

    const locations = ['Kristianstad', 'Malmö', 'Lund', 'Helsingborg', 'Stockholm'];
    const hobbyTypes = ['trädgård', 'städning', 'flytt', 'it', 'foto'];
    const prices = [250, 350, 450, 550, 650, 750, 850];

    const demoJobs = [];
    for (let i = 0; i < 20; i += 1) {
      const user = users[i % users.length];
      const category = categories[i % categories.length];
      const price = prices[i % prices.length];
      const status = i % 5 === 0 ? 'completed' : 'open';
      const createdAt = new Date(now.getTime() - (i * 86400000));

      demoJobs.push({
        title: `Demo jobb ${i + 1} – ${category.name}`,
        description: `Detta är ett seedat testjobb #${i + 1} i kategorin ${category.name}.`,
        price,
        location: locations[i % locations.length],
        lat: null,
        lng: null,
        status,
        is_hobby_valid: true,
        hobby_type: hobbyTypes[i % hobbyTypes.length],
        is_boosted: false,
        boost_expires_at: null,
        expires_at: null,
        poster_id: user.id,
        category_id: category.id,
        created_at: createdAt,
        updated_at: createdAt,
      });
    }

    await queryInterface.bulkInsert('jobs', demoJobs);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('jobs', {
      title: { [Sequelize.Op.like]: 'Demo jobb %' },
    });

    await queryInterface.bulkDelete('users', {
      email: [
        'demo.amin@hobbyjobb.se',
        'demo.suha@hobbyjobb.se',
        'demo.edvin@hobbyjobb.se',
        'demo.qusai@hobbyjobb.se',
        'demo.sara@hobbyjobb.se',
      ],
    });
  },
};
