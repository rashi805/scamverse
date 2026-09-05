const mongoose = require('mongoose');

const SimulationSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scenario: { type: mongoose.Schema.Types.ObjectId, ref: 'ScamScenario', required: true },
    status: { type: String, enum: ['in_progress', 'completed', 'abandoned'], default: 'in_progress' },
    currentStepId: { type: String, default: null },
    correctDecisions: { type: Number, default: 0 },
    incorrectDecisions: { type: Number, default: 0 },
    riskyActions: { type: Number, default: 0 },
    safeActions: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SimulationSession', SimulationSessionSchema);
