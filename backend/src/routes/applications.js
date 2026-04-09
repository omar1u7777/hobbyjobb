const router = require('express').Router();
const c = require('../controllers/applicationController');
const requireAuth = require('../middleware/requireAuth');
router.post('/', requireAuth, c.apply);
router.get('/received', requireAuth, c.getReceived);
router.get('/sent', requireAuth, c.getSent);
router.put('/:id', requireAuth, c.updateStatus);
module.exports = router;
