const { Sequelize } = require('sequelize');
const dbConfig = require('../../config/database');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

// Skapa Sequelize-instans (eller null om ingen DB_URL)
let sequelize = null;
let User = null;

if (config.url) {
  sequelize = new Sequelize(config.url, {
    dialect: config.dialect,
    logging: config.logging,
    dialectOptions: config.dialectOptions || {},
  });
  
  // Importera modeller
  User = require('./User')(sequelize);
} else {
  console.warn('⚠️  DATABASE_URL not configured - models not loaded');
}
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
  User,
  // Exportera modeller när de är skapade:
  // Category,
  // Job,
  // Application,
  // Message,
  // Review,
  // Payment,
};
