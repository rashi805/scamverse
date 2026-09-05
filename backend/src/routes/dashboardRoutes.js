const express = require('express');
const { getDashboard, getVulnerabilityProfile } = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, getDashboard);
router.get('/vulnerability-profile', requireAuth, getVulnerabilityProfile);

module.exports = router;
