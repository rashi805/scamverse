const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { uploadEvidence, myEvidence, verifyEvidence } = require('../controllers/evidenceController');
const { requireAuth } = require('../middleware/auth');
const { ALLOWED_EXTENSIONS } = require('../utils/fileValidation');

const router = express.Router();

// In-memory storage: we hash/encrypt/pin immediately and never keep a plain temp file on disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    // Cheap first-pass filter on extension; the real check is the magic-byte
    // sniff in fileValidation.js once we actually have the buffer in hand.
    const ext = (file.originalname.match(/\.[^.]+$/) || [''])[0].toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error(`File type "${ext || 'unknown'}" is not allowed.`));
    }
    cb(null, true);
  },
});

// Evidence uploads are more expensive (crypto + disk/IPFS I/O) and more
// sensitive than ordinary API calls, so they get their own tighter limiter
// on top of the global one in server.js.
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { message: 'Too many evidence uploads. Please try again later.' },
});

router.post('/upload', requireAuth, uploadLimiter, upload.single('file'), uploadEvidence);
router.get('/mine', requireAuth, myEvidence);
router.post('/:id/verify', requireAuth, uploadLimiter, upload.single('file'), verifyEvidence);

module.exports = router;
