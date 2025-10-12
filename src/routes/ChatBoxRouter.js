const express = require('express');
const router = express.Router();

const { search } = require('../controllers/ChatBoxController');
const { verifyToken } = require('../middleware/verifyToken');

router.post('', search);

module.exports = router;