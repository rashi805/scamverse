const express = require('express');
const {
  generateCertificate,
  myCertificates,
  verifyCertificate,
} = require('../controllers/certificateController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/generate', requireAuth, generateCertificate);
router.get('/mine', requireAuth, myCertificates);
// Public verification endpoint - no auth required, matches Module 18's public verification page.
router.get('/verify/:certificateId', verifyCertificate);

module.exports = router;
