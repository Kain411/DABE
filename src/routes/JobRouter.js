const express = require('express');
const router = express.Router();

const { createJob, getJobNew, getByUID, getJobsByUserID, getJobsByServiceType, cancelJob } = require("../controllers/JobController");
const { verifyToken } = require('../middleware/verifyToken');
const { checkPermission } = require('../middleware/checkPermission');

router.post('/:serviceType', verifyToken, checkPermission(['user']), createJob);
// router.post('/:serviceType', createJob);

router.get('', getJobNew);

router.get('/:serviceType/:jobID', getByUID);

router.get('/user/:userID/job', verifyToken, checkPermission(['user']), getJobsByUserID);

router.get('/:serviceType', getJobsByServiceType);

// router.put('/:serviceType/:jobID/cancel', verifyToken, checkPermission(['user']), cancelJob);
router.put('/:serviceType/:jobID/cancel', cancelJob);

module.exports = router;