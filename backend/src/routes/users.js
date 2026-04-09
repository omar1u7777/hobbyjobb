const router = require('express').Router();
const c = require('../controllers/userController');
const requireAuth = require('../middleware/requireAuth');
router.get('/me/income', requireAuth, c.getIncome);
router.get('/:id', c.getProfile);
router.put('/:id', requireAuth, c.updateProfile);
router.get('/:id/reviews', c.getReviews);
module.exports = router;
