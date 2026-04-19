const express = require('express');
const { getCategories } = require('../controllers/categoryController');

const router = express.Router();

// Public
router.get('/', getCategories);

module.exports = router;
