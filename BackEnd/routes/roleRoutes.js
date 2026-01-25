const express = require('express');
const { switchRole, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.get('/me', protect, getCurrentUser);
router.post('/switch', protect, switchRole);

module.exports = router;