const express = require('express');
const { switchRole, getCurrentUser, requestSellerRole } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.get('/me', protect, getCurrentUser);
router.post('/switch', protect, switchRole);
router.post('/request-seller', protect, requestSellerRole);

module.exports = router;