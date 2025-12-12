const express = require('express');
const router = express.Router();
const { registerTeam, getMyTeam } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Route: /api/teams/register
// 1. protect: Checks if user is logged in
// 2. upload.single: Handles the file upload
// 3. registerTeam: The controller logic
router.post('/register', protect, upload.single('idCard'), registerTeam);

// Route: /api/teams/me
// Gets the team data for the dashboard
router.get('/me', protect, getMyTeam);

module.exports = router;