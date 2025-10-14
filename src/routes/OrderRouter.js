const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrdersByJobID, getOrdersByWorkerID, putStatusByUID } = require('../controllers/OrderController');
const { verifyToken } = require('../middleware/verifyToken');
const { checkPermission } = require('../middleware/checkPermission');

router.post('/create', verifyToken, checkPermission(['worker']), createOrder);

router.get('', verifyToken, checkPermission(['admin']), getOrders);

// router.get('/:jobID', verifyToken, checkPermission(['user']), getOrdersByJobID);
router.get('/:jobID', getOrdersByJobID);

router.get('/worker/:workerID', verifyToken, checkPermission(['worker']), getOrdersByWorkerID);

router.put('/update', verifyToken, checkPermission(['user', 'worker']), putStatusByUID);

module.exports = router;