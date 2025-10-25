const express = require('express');
const { getPolicies } = require('../controllers/PolicyController');
const router = express.Router();

router.get('', getPolicies);

module.exports = router;