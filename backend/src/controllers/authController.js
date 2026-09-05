const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AwarenessScore = require('../models/AwarenessScore');

function signToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.passwordHash;
  return obj;
}

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash });

    await AwarenessScore.create({ user: user._id });

    const token = signToken(user);
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

async function guestLogin(req, res, next) {
  try {
    const guestEmail = `guest_${Date.now()}_${Math.floor(Math.random() * 10000)}@guest.scamverse360.local`;
    const passwordHash = await bcrypt.hash(Math.random().toString(36), 10);
    const user = await User.create({
      name: 'Guest User',
      email: guestEmail,
      passwordHash,
      isGuest: true,
      onboardingCompleted: true,
    });
    await AwarenessScore.create({ user: user._id });

    const token = signToken(user);
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

async function completeOnboarding(req, res, next) {
  try {
    const { userCategory, ageGroup, preferredLanguage, digitalExperienceLevel } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        ...(userCategory && { userCategory }),
        ...(ageGroup && { ageGroup }),
        ...(preferredLanguage && { preferredLanguage }),
        ...(digitalExperienceLevel && { digitalExperienceLevel }),
        onboardingCompleted: true,
      },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

async function connectWallet(req, res, next) {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ message: 'walletAddress is required' });
    const user = await User.findByIdAndUpdate(
      req.userId,
      { walletAddress },
      { new: true }
    );
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, guestLogin, completeOnboarding, getMe, connectWallet };
