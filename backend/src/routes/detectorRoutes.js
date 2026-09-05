const express = require('express');
const rateLimit = require('express-rate-limit');
const { checkUrl, checkMessage } = require('../controllers/detectorController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const detectorLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

router.post('/url', requireAuth, detectorLimiter, checkUrl);
router.post('/message', requireAuth, detectorLimiter, checkMessage);

module.exports = router;
