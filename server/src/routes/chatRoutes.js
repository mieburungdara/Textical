const express = require('express');
const router = express.Router();
const chatController = require('../controllers/ChatController');
// const auth = require('../handlers/authHandler'); // Placeholder for actual auth middleware

/**
 * Chat Routes
 * Prefix: /api/chat
 */

// In a real scenario, we'd add auth middleware here
router.post('/send', (req, res) => chatController.sendMessage(req, res));
router.get('/history', (req, res) => chatController.getHistory(req, res));
router.get('/online-users', (req, res) => chatController.getOnlineUsers(req, res));

module.exports = router;
