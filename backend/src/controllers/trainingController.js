const AwarenessScore = require('../models/AwarenessScore');
const ScamScenario = require('../models/ScamScenario');
const TrainingRecommendation = require('../models/TrainingRecommendation');
const { CATEGORY_LIST, recommendDifficulty, buildVulnerabilityProfile } = require('../utils/scoring');

/**
 * GET /api/training/recommendations
 *
 * Adaptive training flow (Module 9):
 * Weakness detected -> recommend category training -> suggest scenarios at the
 * right difficulty -> (as the user improves scores, recommended difficulty rises).
 */
async function getRecommendations(req, res, next) {
  try {
    let scoreDoc = await AwarenessScore.findOne({ user: req.userId });
    if (!scoreDoc) scoreDoc = await AwarenessScore.create({ user: req.userId });

    const profile = buildVulnerabilityProfile(scoreDoc.categoryScores);

    // Prioritize: high-risk categories first, then medium.
    const priorityCategories = [...profile.high, ...profile.medium].slice(0, 3);
    const categoriesToRecommend = priorityCategories.length > 0 ? priorityCategories : CATEGORY_LIST.slice(0, 2);

    const recommendations = [];
    for (const category of categoriesToRecommend) {
      const categoryScore = scoreDoc.categoryScores[category] ?? 50;
      const difficulty = recommendDifficulty(categoryScore);

      const scenarios = await ScamScenario.find({ category, difficulty, isActive: true })
        .select('title category subType difficulty isMultiStage description')
        .limit(3);

      // Fall back to any difficulty in this category if none match exactly.
      const finalScenarios = scenarios.length > 0
        ? scenarios
        : await ScamScenario.find({ category, isActive: true })
            .select('title category subType difficulty isMultiStage description')
            .limit(3);

      const reason = categoryScore <= 40
        ? `Your ${category.replace('_', ' ')} score (${categoryScore}/100) shows repeated mistakes. Starting at ${difficulty} level to rebuild fundamentals.`
        : categoryScore <= 70
        ? `Your ${category.replace('_', ' ')} score (${categoryScore}/100) is improving. ${difficulty} level scenarios will help you progress.`
        : `Your ${category.replace('_', ' ')} score (${categoryScore}/100) is strong. ${difficulty} level scenarios will keep you sharp.`;

      await TrainingRecommendation.findOneAndUpdate(
        { user: req.userId, category, status: 'active' },
        { user: req.userId, category, reason, recommendedDifficulty: difficulty, status: 'active' },
        { upsert: true, new: true }
      );

      recommendations.push({
        category,
        categoryScore,
        recommendedDifficulty: difficulty,
        reason,
        scenarios: finalScenarios,
      });
    }

    res.json({ recommendations, psychologicalTriggers: scoreDoc.psychologicalTriggers });
  } catch (err) {
    next(err);
  }
}

module.exports = { getRecommendations };
