const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const { checkPermission } = require('../middleware/checkPermission');
const { getClients, forgotPassword, changePassword, updateClient } = require('../controllers/ClientController');

router.get('', verifyToken, checkPermission(['admin']), getClients)

router.put('/forgot-password', forgotPassword);

router.put('/change-password', verifyToken, changePassword);

router.put('/update', verifyToken, checkPermission(['user', 'worker']), updateClient);


module.exports = router;