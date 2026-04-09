const { Sequelize } = require('sequelize');
const dbConfig = require('../../config/database');
const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];
const sequelize = new Sequelize(config.url, { dialect: config.dialect, logging: config.logging, dialectOptions: config.dialectOptions || {} });

const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Job = require('./Job')(sequelize);
const Application = require('./Application')(sequelize);
const Message = require('./Message')(sequelize);
const Review = require('./Review')(sequelize);
const Payment = require('./Payment')(sequelize);

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
Message.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
User.hasMany(Review, { foreignKey: 'reviewer_id', as: 'givenReviews' });
User.hasMany(Review, { foreignKey: 'reviewee_id', as: 'receivedReviews' });
Review.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });
Review.belongsTo(User, { foreignKey: 'reviewee_id', as: 'reviewee' });
Review.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
User.hasMany(Payment, { foreignKey: 'payer_id', as: 'paymentsMade' });
User.hasMany(Payment, { foreignKey: 'payee_id', as: 'paymentsReceived' });
Payment.belongsTo(User, { foreignKey: 'payer_id', as: 'payer' });
Payment.belongsTo(User, { foreignKey: 'payee_id', as: 'payee' });
Payment.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

module.exports = { sequelize, Sequelize, User, Category, Job, Application, Message, Review, Payment };
