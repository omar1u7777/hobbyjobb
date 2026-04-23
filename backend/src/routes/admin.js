const express = require('express');
const requireAdmin = require('../middleware/requireAdmin');
const {
  getAdminStats,
  getFlaggedAccounts,
  updateFlaggedAccountStatus,
  getAdminCharts,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} = require('../controllers/adminController');

const router = express.Router();

router.use(...requireAdmin);

router.get('/stats', getAdminStats);
router.get('/flagged-accounts', getFlaggedAccounts);
router.patch('/flagged-accounts/:id', updateFlaggedAccountStatus);
router.get('/charts', getAdminCharts);

router.get('/categories', getAdminCategories);
router.post('/categories', createAdminCategory);
router.put('/categories/:id', updateAdminCategory);
router.delete('/categories/:id', deleteAdminCategory);

module.exports = router;
