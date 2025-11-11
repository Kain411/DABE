const express = require('express');
const router = express.Router();

const { search } = require('../controllers/ChatBotController');
const { verifyToken } = require('../middleware/verifyToken');
const { checkPermission } = require('../middleware/checkPermission');

router.post('', verifyToken, checkPermission(['user', 'worker']), search);
// router.post('', search);

module.exports = router;