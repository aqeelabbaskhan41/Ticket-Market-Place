const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const { protect } = require('../middleware/auth');

// Seller routes
router.post('/', protect, withdrawalController.createWithdrawal);
router.get('/my-withdrawals', protect, withdrawalController.getMyWithdrawals);

// Admin routes
router.get('/pending', protect, withdrawalController.getPendingWithdrawals);
router.get('/all', protect, withdrawalController.getAllWithdrawals);
router.put('/:withdrawalId/approve', protect, withdrawalController.approveWithdrawal);
router.put('/:withdrawalId/reject', protect, withdrawalController.rejectWithdrawal);
router.put('/:withdrawalId/complete', protect, withdrawalController.completeWithdrawal);

module.exports = router;