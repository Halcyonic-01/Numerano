const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Route: /api/auth/signup
router.post('/signup', registerUser);

// Route: /api/auth/login
router.post('/login', loginUser);

module.exports = router;