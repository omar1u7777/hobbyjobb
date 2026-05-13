'use strict';

/**
 * Lowercase befintliga email-adresser i users-tabellen.
 *
 * Bakgrund: login-flödet i authController normaliserar input till lowercase,
 * men gamla rader (från seeders, manuell DB-insert eller pre-hook tider) kan
 * ha mixed case. Det orsakade en faktisk produktions-bugg där användare med
 * `Foo@Example.com` i DB inte kunde logga in, eftersom `WHERE email = 'foo@example.com'`
 * är case-sensitive i Postgres.
 *
 * Defense in depth tillsammans med beforeValidate-hooken i src/models/User.js
 * som förhindrar att nya rader skapas med mixed case.
 *
 * Idempotent: WHERE email <> LOWER(email) — körs noll rader vid andra körningen.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE users
         SET email = LOWER(email),
             updated_at = NOW()
       WHERE email <> LOWER(email);
    `);
  },

  async down() {
    // Ingen reversibel down — vi vet inte vilket original-skiftläge raderna hade.
    // Detta är en data-correction migration, inte en schema-ändring.
  },
};
