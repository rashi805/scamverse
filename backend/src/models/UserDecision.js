const mongoose = require('mongoose');

const UserDecisionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'SimulationSession', required: true },
    scenario: { type: mongoose.Schema.Types.ObjectId, ref: 'ScamScenario', required: true },
    stepId: { type: String, required: true },
    chosenOptionId: { type: String, required: true },
    isSafe: { type: Boolean, required: true },
    isRisky: { type: Boolean, required: false, default: false },
    isCorrect: { type: Boolean, required: true }, // matches expected safe behavior
    responseTimeMs: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserDecision', UserDecisionSchema);
