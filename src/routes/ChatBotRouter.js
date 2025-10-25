const express = require('express');
const router = express.Router();

const { search } = require('../controllers/ChatBotController');
const { verifyToken } = require('../middleware/verifyToken');

// router.post('', verifyToken, search);
router.post('', search);

module.exports = router;