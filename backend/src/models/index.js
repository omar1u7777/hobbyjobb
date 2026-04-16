const { Sequelize } = require('sequelize');
const dbConfig = require('../../config/database');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

// Skapa Sequelize-instans (eller null om ingen DB_URL)
let sequelize = null;
let User = null;
let Category = null;
let Job = null;
let Application = null;
let Message = null;
let Review = null;

if (config.url) {
  sequelize = new Sequelize(config.url, {
    dialect: config.dialect,
    logging: config.logging,
    dialectOptions: config.dialectOptions || {},
  });
  
  // Importera modeller
  User = require('./User')(sequelize);
  Category = require('./Category')(sequelize);
  Job = require('./Job')(sequelize);
  Application = require('./Application')(sequelize);
  Message = require('./Message')(sequelize);
  Review = require('./Review')(sequelize);

  // Definiera associationer
  User.hasMany(Job, { foreignKey: 'poster_id', as: 'postedJobs' });
  Job.belongsTo(User, { foreignKey: 'poster_id', as: 'poster' });

  Category.hasMany(Job, { foreignKey: 'category_id', as: 'jobs' });
  Job.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

  Job.hasMany(Application, { foreignKey: 'job_id', as: 'applications' });
  Application.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

  User.hasMany(Application, { foreignKey: 'applicant_id', as: 'applications' });
  Application.belongsTo(User, { foreignKey: 'applicant_id', as: 'applicant' });

  User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
  User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
  Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
  Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

  Job.hasMany(Message, { foreignKey: 'job_id', as: 'messages' });
  Message.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

  Job.hasMany(Review, { foreignKey: 'job_id', as: 'reviews' });
  Review.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

  User.hasMany(Review, { foreignKey: 'reviewer_id', as: 'writtenReviews' });
  User.hasMany(Review, { foreignKey: 'reviewee_id', as: 'receivedReviews' });
  Review.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });
  Review.belongsTo(User, { foreignKey: 'reviewee_id', as: 'reviewee' });
} else {
  console.warn('⚠️  DATABASE_URL not configured - models not loaded');
}

module.exports = {
  sequelize,
  Sequelize,
  User,
  Category,
  Job,
  Application,
  Message,
  Review,
};
