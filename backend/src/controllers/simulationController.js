const ScamScenario = require('../models/ScamScenario');
const SimulationSession = require('../models/SimulationSession');
const UserDecision = require('../models/UserDecision');
const AwarenessScore = require('../models/AwarenessScore');
const {
  evaluateDecision,
  updateCategoryScore,
  computeOverallScore,
  updateTriggerExposure,
} = require('../utils/scoring');

// GET /api/simulations - list available scenarios (metadata only, no answers)
async function listScenarios(req, res, next) {
  try {
    const { category, difficulty, lang } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    // Language filter — fall back to 'en' for unknown/missing values
    const validLangs = ['en', 'hi', 'mr'];
    filter.lang = validLangs.includes(lang) ? lang : 'en';

    const scenarios = await ScamScenario.find(filter)
      .select('title category subType difficulty isMultiStage description lang')
      .sort({ createdAt: -1 });

    res.json({ scenarios });
  } catch (err) {
    next(err);
  }
}


// POST /api/simulations/:id/start
async function startSimulation(req, res, next) {
  try {
    const scenario = await ScamScenario.findById(req.params.id);
    if (!scenario || !scenario.isActive) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    const session = await SimulationSession.create({
      user: req.userId,
      scenario: scenario._id,
      currentStepId: scenario.steps[0].stepId,
    });

    // Return the first step WITHOUT revealing which option is safe
    const firstStep = scenario.steps[0];
    res.status(201).json({
      sessionId: session._id,
      banner: 'SIMULATION MODE — NO REAL MONEY OR PERSONAL INFORMATION IS REQUIRED',
      scenario: {
        title: scenario.title,
        category: scenario.category,
        subType: scenario.subType,
        isMultiStage: scenario.isMultiStage,
      },
      step: sanitizeStep(firstStep),
    });
  } catch (err) {
    next(err);
  }
}

function sanitizeStep(step) {
  return {
    stepId: step.stepId,
    channel: step.channel,
    narrative: step.narrative,
    options: step.options.map((o) => ({ optionId: o.optionId, text: o.text })),
  };
}

// POST /api/simulations/session/:sessionId/decide
// body: { stepId, optionId, responseTimeMs }
async function submitDecision(req, res, next) {
  try {
    const { stepId, optionId, responseTimeMs } = req.body;
    const session = await SimulationSession.findById(req.params.sessionId);
    if (!session || String(session.user) !== String(req.userId)) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (session.status !== 'in_progress') {
      return res.status(400).json({ message: 'Session already ended' });
    }

    const scenario = await ScamScenario.findById(session.scenario);
    const step = scenario.steps.find((s) => s.stepId === stepId);
    if (!step) return res.status(400).json({ message: 'Invalid stepId for this scenario' });

    const option = step.options.find((o) => o.optionId === optionId);
    if (!option) return res.status(400).json({ message: 'Invalid optionId for this step' });

    const evalResult = evaluateDecision(option);

    await UserDecision.create({
      user: req.userId,
      session: session._id,
      scenario: scenario._id,
      stepId,
      chosenOptionId: optionId,
      isSafe: evalResult.isSafe,
      isRisky: evalResult.isRisky,
      isCorrect: evalResult.isCorrect,
      responseTimeMs: responseTimeMs || null,
    });

    session.correctDecisions += evalResult.isCorrect ? 1 : 0;
    session.incorrectDecisions += evalResult.isCorrect ? 0 : 1;
    session.riskyActions += evalResult.isRisky ? 1 : 0;
    session.safeActions += evalResult.isSafe ? 1 : 0;

    // Determine next step (multi-stage chain support)
    const nextStepId = option.nextStepId;
    const nextStep = nextStepId ? scenario.steps.find((s) => s.stepId === nextStepId) : null;

    let sessionEnded = false;
    if (nextStep) {
      session.currentStepId = nextStep.stepId;
    } else {
      session.status = 'completed';
      session.completedAt = new Date();
      sessionEnded = true;
    }
    await session.save();

    let scoreUpdate = null;
    if (sessionEnded) {
      scoreUpdate = await applyScenarioResultToAwarenessScore(
        req.userId,
        scenario.category,
        session,
        scenario.triggerTags
      );
    }

    res.json({
      result: {
        isCorrect: evalResult.isCorrect,
        isSafe: evalResult.isSafe,
        isRisky: evalResult.isRisky,
        explanation: option.explanation,
        reasons: evalResult.reasons,
      },
      nextStep: nextStep ? sanitizeStep(nextStep) : null,
      sessionEnded,
      sessionSummary: sessionEnded
        ? {
            correctDecisions: session.correctDecisions,
            incorrectDecisions: session.incorrectDecisions,
            riskyActions: session.riskyActions,
            safeActions: session.safeActions,
            redFlagsSummary: scenario.redFlagsSummary,
          }
        : null,
      scoreUpdate,
    });
  } catch (err) {
    next(err);
  }
}

async function applyScenarioResultToAwarenessScore(userId, category, session, triggerTags = []) {
  let scoreDoc = await AwarenessScore.findOne({ user: userId });
  if (!scoreDoc) scoreDoc = await AwarenessScore.create({ user: userId });

  const netCorrect = session.correctDecisions - session.incorrectDecisions;
  const riskPenalty = session.riskyActions * 3;
  const delta = netCorrect * 4 - riskPenalty;

  const current = scoreDoc.categoryScores[category] ?? 50;
  const updated = updateCategoryScore(current, delta);
  scoreDoc.categoryScores[category] = updated;
  scoreDoc.overallScore = computeOverallScore(scoreDoc.categoryScores);
  scoreDoc.totalSimulationsCompleted += 1;

  // User "fell for it" if they made at least one incorrect decision in this session.
  const fellForIt = session.incorrectDecisions > 0;
  scoreDoc.psychologicalTriggers = updateTriggerExposure(
    scoreDoc.psychologicalTriggers.toObject ? scoreDoc.psychologicalTriggers.toObject() : scoreDoc.psychologicalTriggers,
    triggerTags,
    fellForIt
  );

  await scoreDoc.save();

  return {
    category,
    previousScore: current,
    newScore: updated,
    overallScore: scoreDoc.overallScore,
  };
}

module.exports = { listScenarios, startSimulation, submitDecision };
