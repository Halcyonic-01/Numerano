const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Route: /api/auth/signup
router.post('/signup', registerUser);

// Route: /api/auth/login
router.post('/login', loginUser);

// Route: /api/auth/verify
router.get('/verify', protect, verifyUser);

module.exports = router;