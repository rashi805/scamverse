const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  submitReport,
  myReports,
  getRegistry,
  checkThreatValue,
  updateStatus,
  getChainRecord,
} = require('../controllers/threatController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const reportLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30 });

router.post('/report', requireAuth, reportLimiter, submitReport);
router.get('/my-reports', requireAuth, myReports);
router.get('/registry', requireAuth, getRegistry);
router.get('/check', requireAuth, checkThreatValue);
router.patch('/:id/status', requireAuth, requireRole('verifier', 'admin'), updateStatus);
router.get('/:id/chain-record', requireAuth, getChainRecord);

module.exports = router;
