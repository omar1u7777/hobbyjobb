const router = require('express').Router();
router.use('/auth', require('./auth'));
router.use('/jobs', require('./jobs'));
router.use('/applications', require('./applications'));
router.use('/users', require('./users'));
router.use('/categories', require('./categories'));
module.exports = router;
