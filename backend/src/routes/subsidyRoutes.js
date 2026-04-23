const express = require('express');
const router = express.Router();

const { getSubsidyConfigPublic } = require('../controllers/subsidyController');

router.get('/config', getSubsidyConfigPublic);

module.exports = router;

