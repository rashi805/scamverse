const mongoose = require('mongoose');

const AwarenessScoreSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    categoryScores: {
      banking: { type: Number, default: 50, min: 0, max: 100 },
      digital_payment: { type: Number, default: 50, min: 0, max: 100 },
      phishing: { type: Number, default: 50, min: 0, max: 100 },
      investment: { type: Number, default: 50, min: 0, max: 100 },
      job_loan: { type: Number, default: 50, min: 0, max: 100 },
      social_engineering: { type: Number, default: 50, min: 0, max: 100 },
      web3: { type: Number, default: 50, min: 0, max: 100 },
    },
    overallScore: { type: Number, default: 50, min: 0, max: 100 },
    psychologicalTriggers: {
      fear: { type: Number, default: 0 },
      urgency: { type: Number, default: 0 },
      authority: { type: Number, default: 0 },
      greed: { type: Number, default: 0 },
      curiosity: { type: Number, default: 0 },
      sympathy: { type: Number, default: 0 },
    },
    totalSimulationsCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AwarenessScore', AwarenessScoreSchema);
