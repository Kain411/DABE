const express = require('express');
const { verifyToken } = require('../middleware/verifyToken');
const { checkPermission } = require('../middleware/checkPermission');
const { checkPayment, getPayments, checkPaymentAdmin } = require('../controllers/PaymentController');

const router = express.Router();

router.post('/check-payment', checkPayment);

router.post('/check-payment/:orderID', verifyToken, checkPermission(['admin']), checkPaymentAdmin);

router.get('', verifyToken, checkPermission(['admin', 'user']), getPayments)

module.exports = router;