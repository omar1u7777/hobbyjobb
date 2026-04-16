const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { getPublicUser, updateUser, getMyIncome } = require('../controllers/userController');

const router = express.Router();

// NOTE: /me/income must be before /:id
router.get('/me/income', requireAuth, getMyIncome);
router.get('/:id', getPublicUser);
router.put('/:id', requireAuth, updateUser);

module.exports = router;
