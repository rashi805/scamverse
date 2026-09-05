const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    isGuest: { type: Boolean, default: false },

    // Onboarding info (kept minimal, per spec)
    userCategory: {
      type: String,
      enum: ['student', 'working_professional', 'senior_citizen', 'business_owner', 'general_user'],
      default: 'general_user',
    },
    ageGroup: {
      type: String,
      enum: ['under_18', '18_25', '26_40', '41_60', '60_plus'],
      default: '18_25',
    },
    preferredLanguage: { type: String, default: 'en' },
    digitalExperienceLevel: {
      type: String,
      enum: ['beginner', 'basic', 'intermediate', 'advanced'],
      default: 'basic',
    },

    walletAddress: { type: String, default: null }, // optional MetaMask link

    role: { type: String, enum: ['user', 'verifier', 'admin'], default: 'user' },

    // Reporter Reputation System (Module 17). Starts at "New Reporter" baseline.
    reporterReputation: { type: Number, default: 10, min: 0, max: 100 },

    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
