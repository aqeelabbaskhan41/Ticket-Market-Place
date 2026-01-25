const express = require('express');
const { 
  getAllUsers, 
  updateUserStatus, 
  addPointsToBuyer, 
  updateUserPoints,
  getProfile,
  updateProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', protect, getAllUsers);

// Update user status (admin only)
router.patch('/:id/status', protect, updateUserStatus);

// Add points to buyer (admin only)
router.patch('/add-points', protect, addPointsToBuyer);

// Update user points
router.patch('/update-points', protect, updateUserPoints);

// Simple profile routes
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);

module.exports = router;