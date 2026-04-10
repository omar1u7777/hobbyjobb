const { Sequelize } = require('sequelize');
const dbConfig = require('../../config/database');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

// Skapa Sequelize-instans
const sequelize = new Sequelize(config.url, {
  dialect: config.dialect,
  logging: config.logging,
  dialectOptions: config.dialectOptions || {},
});

// Importera modeller (S2 skapar dessa filer)
// const User = require('./User')(sequelize);
// const Category = require('./Category')(sequelize);
// const Job = require('./Job')(sequelize);
// const Application = require('./Application')(sequelize);
// const Message = require('./Message')(sequelize);
// const Review = require('./Review')(sequelize);
// const Payment = require('./Payment')(sequelize);

// Definiera associationer (S2 definierar dessa)
// User.hasMany(Job, { foreignKey: 'poster_id', as: 'postedJobs' });
// Job.belongsTo(User, { foreignKey: 'poster_id', as: 'poster' });
// ... etc

module.exports = {
  sequelize,
  Sequelize,
  // Exportera modeller när de är skapade:
  // User,
  // Category,
  // Job,
  // Application,
  // Message,
  // Review,
  // Payment,
};
