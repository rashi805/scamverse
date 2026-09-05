const mongoose = require('mongoose');

// A single decision option offered to the user at a step
const OptionSchema = new mongoose.Schema(
  {
    optionId: { type: String, required: true },
    text: { type: String, required: true },
    isSafe: { type: Boolean, required: true }, // safe/correct action
    isRisky: { type: Boolean, default: false }, // risky action (not always the "wrong" one, but a red flag)
    explanation: { type: String, required: true }, // why this is right/wrong
    nextStepId: { type: String, default: null }, // for multi-stage chains
  },
  { _id: false }
);

const StepSchema = new mongoose.Schema(
  {
    stepId: { type: String, required: true },
    channel: {
      type: String,
      enum: ['sms', 'whatsapp', 'email', 'call', 'website', 'app', 'in_person', 'social_media'],
      required: true,
    },
    narrative: { type: String, required: true }, // what the user sees/receives
    options: { type: [OptionSchema], required: true },
  },
  { _id: false }
);

const ScamScenarioSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'banking',
        'digital_payment',
        'phishing',
        'investment',
        'job_loan',
        'social_engineering',
        'web3',
      ],
      required: true,
    },
    subType: { type: String, required: true }, // e.g. 'otp_scam', 'fake_airdrop'
    difficulty: {
      type: String,
      enum: ['beginner', 'basic', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    isMultiStage: { type: Boolean, default: false },
    description: { type: String, default: '' },
    steps: { type: [StepSchema], required: true },
    redFlagsSummary: { type: [String], default: [] },
    // Psychological manipulation tactics this scenario primarily relies on.
    // Used by the vulnerability engine to build trigger-exposure profiles.
    triggerTags: {
      type: [String],
      enum: ['fear', 'urgency', 'authority', 'greed', 'curiosity', 'sympathy'],
      default: [],
    },
    isActive: { type: Boolean, default: true },
    lang: { type: String, enum: ['en', 'hi', 'mr'], default: 'en' },

  },
  { timestamps: true }
);

module.exports = mongoose.model('ScamScenario', ScamScenarioSchema);
