const express = require('express');
const rateLimit = require('express-rate-limit');
const { signup, login, guestLogin, completeOnboarding, getMe, connectWallet } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many attempts, please try again later.' },
});

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/guest', authLimiter, guestLogin);
router.get('/me', requireAuth, getMe);
router.post('/onboarding', requireAuth, completeOnboarding);
router.post('/wallet', requireAuth, connectWallet);

module.exports = router;
