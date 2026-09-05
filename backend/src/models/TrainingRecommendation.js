const mongoose = require('mongoose');

const TrainingRecommendationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    reason: { type: String, required: true }, // human-readable explanation
    recommendedDifficulty: {
      type: String,
      enum: ['beginner', 'basic', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    status: { type: String, enum: ['active', 'completed', 'dismissed'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrainingRecommendation', TrainingRecommendationSchema);
