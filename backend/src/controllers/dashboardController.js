const AwarenessScore = require('../models/AwarenessScore');
const SimulationSession = require('../models/SimulationSession');
const { buildVulnerabilityProfile, classifyRisk, CATEGORY_LIST } = require('../utils/scoring');

async function getDashboard(req, res, next) {
  try {
    let scoreDoc = await AwarenessScore.findOne({ user: req.userId });
    if (!scoreDoc) scoreDoc = await AwarenessScore.create({ user: req.userId });

    const recentSessions = await SimulationSession.find({ user: req.userId, status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('scenario', 'title category subType difficulty');

    const categoryEntries = CATEGORY_LIST.map((cat) => ({
      category: cat,
      score: scoreDoc.categoryScores[cat],
      risk: classifyRisk(scoreDoc.categoryScores[cat]),
    }));

    const sorted = [...categoryEntries].sort((a, b) => b.score - a.score);
    const strongAreas = sorted.slice(0, 2);
    const weakAreas = sorted.slice(-2).reverse();

    res.json({
      overallScore: scoreDoc.overallScore,
      categoryScores: categoryEntries,
      strongAreas,
      weakAreas,
      totalSimulationsCompleted: scoreDoc.totalSimulationsCompleted,
      recentSimulations: recentSessions.map((s) => ({
        id: s._id,
        title: s.scenario?.title,
        category: s.scenario?.category,
        difficulty: s.scenario?.difficulty,
        correctDecisions: s.correctDecisions,
        incorrectDecisions: s.incorrectDecisions,
        completedAt: s.completedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function getVulnerabilityProfile(req, res, next) {
  try {
    let scoreDoc = await AwarenessScore.findOne({ user: req.userId });
    if (!scoreDoc) scoreDoc = await AwarenessScore.create({ user: req.userId });

    const profile = buildVulnerabilityProfile(scoreDoc.categoryScores);

    res.json({
      profile,
      psychologicalTriggers: scoreDoc.psychologicalTriggers,
      explanation:
        'Categories with lower scores indicate more mistakes or risky choices in past simulations. Focus your training there first.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, getVulnerabilityProfile };
