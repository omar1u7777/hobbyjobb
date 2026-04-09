const router = require('express').Router();
const c = require('../controllers/categoryController');
router.get('/', c.getAll);
module.exports = router;
