const express = require('express');
const router = express.Router();
const { createTeam, getAllTeams, updateTeam, deleteTeam } = require('../controllers/teamController');

// Fix the path - use singular "middleware" not "middlewares"
const upload = require('../middleware/upload'); // Changed from '../middlewares/upload'

const { protect, admin } = require('../middleware/auth'); // Also check this path

// Apply auth middleware to all routes
router.use(protect);

// All routes require admin access
router.get('/', admin, getAllTeams);
router.post('/', admin, upload.single('logo'), createTeam);
router.put('/:id', admin, upload.single('logo'), updateTeam);
router.delete('/:id', admin, deleteTeam);

module.exports = router;