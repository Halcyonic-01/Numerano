const express = require('express');
const router = express.Router();
const { chatWithBot } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// Route: /api/chat
router.post('/', protect, chatWithBot);

module.exports = router;