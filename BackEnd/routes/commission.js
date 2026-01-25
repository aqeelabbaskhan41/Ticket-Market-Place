const express = require('express');
const router = express.Router();
const {
  getCommissionSettings,
  updateCommissionSettings,
  getMyCommission,
  setUserCustomCommission,
  removeUserCustomCommission,
  updateUserLevel,
  bulkUpdateUserLevels,
  getUsersWithLevels,
  autoAssignLevels
} = require('../controllers/commissionController');
const { protect } = require('../middleware/auth');

// Get current user's commission rate
router.get('/my-commission', protect, getMyCommission);

// Admin commission management routes
router.get('/admin/settings', protect, getCommissionSettings);
router.put('/admin/settings', protect, updateCommissionSettings);
router.patch('/admin/users/:userId/level', protect, updateUserLevel);
router.post('/admin/bulk-update-levels', protect, bulkUpdateUserLevels);
router.get('/admin/users-with-levels', protect, getUsersWithLevels);
router.post('/admin/auto-assign-levels', protect, autoAssignLevels);

// Dynamic commission routes
router.patch('/admin/users/:userId/custom-commission', protect, setUserCustomCommission);
router.delete('/admin/users/:userId/custom-commission', protect, removeUserCustomCommission);

module.exports = router;