/**
 * SCAMVERSE 360 - Explainable Decision & Scoring Engine (Phase 1)
 *
 * Design goal: every score change must be traceable to a specific,
 * human-readable reason. No black-box scoring.
 */

const CATEGORY_LIST = [
  'banking',
  'digital_payment',
  'phishing',
  'investment',
  'job_loan',
  'social_engineering',
  'web3',
];

/**
 * Evaluate a single decision against the chosen option's metadata.
 * Returns an explainable result object.
 */
function evaluateDecision(option) {
  const result = {
    isCorrect: !!option.isSafe,
    isSafe: !!option.isSafe,
    isRisky: !!option.isRisky,
    delta: 0,
    reasons: [],
  };

  if (option.isSafe) {
    result.delta += 4;
    result.reasons.push('Safe action taken (+4)');
  } else {
    result.delta -= 6;
    result.reasons.push('Unsafe / incorrect action taken (-6)');
  }

  if (option.isRisky) {
    result.delta -= 3;
    result.reasons.push('Risky behavior detected (-3)');
  }

  return result;
}

/**
 * Recalculate a user's category score using an exponential moving average,
 * so recent performance matters more but history isn't erased instantly.
 * alpha closer to 1 = more weight on the new result.
 */
function updateCategoryScore(currentScore, delta, alpha = 0.25) {
  const target = clamp(currentScore + delta, 0, 100);
  const updated = currentScore + alpha * (target - currentScore);
  return Math.round(clamp(updated, 0, 100));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function computeOverallScore(categoryScores) {
  const values = CATEGORY_LIST.map((c) => categoryScores[c] ?? 50);
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round(sum / values.length);
}

/**
 * Derive simple psychological-trigger exposure percentages from a scenario's
 * declared trigger tags and whether the user fell for it (isCorrect=false).
 * This stays intentionally simple/explainable for Phase 1 - a rule-based
 * heuristic rather than an opaque ML model.
 */
function updateTriggerExposure(currentTriggers, scenarioTriggerTags = [], userFellForIt) {
  const updated = { ...currentTriggers };
  scenarioTriggerTags.forEach((tag) => {
    if (!(tag in updated)) return;
    const delta = userFellForIt ? 8 : -3;
    updated[tag] = Math.round(clamp((updated[tag] || 0) + delta, 0, 100));
  });
  return updated;
}

function classifyRisk(score) {
  if (score <= 33) return 'HIGH_RISK';
  if (score <= 66) return 'MEDIUM_RISK';
  return 'LOW_RISK';
}

/** Build a personal vulnerability profile from category scores (lower score = higher risk) */
function buildVulnerabilityProfile(categoryScores) {
  const high = [];
  const medium = [];
  const low = [];

  CATEGORY_LIST.forEach((cat) => {
    const score = categoryScores[cat] ?? 50;
    if (score <= 40) high.push(cat);
    else if (score <= 70) medium.push(cat);
    else low.push(cat);
  });

  return { high, medium, low };
}

const DIFFICULTY_LADDER = ['beginner', 'basic', 'intermediate', 'advanced', 'expert'];

/**
 * Adaptive training difficulty rule (Module 9):
 * - Low category score (<= 40): stay at / drop to beginner, more practice needed.
 * - Medium score (41-70): basic/intermediate depending on how close to the edges.
 * - High score (> 70): push the user up the ladder toward advanced/expert.
 * This is a simple, explainable rule set rather than a black-box model.
 */
function recommendDifficulty(categoryScore) {
  if (categoryScore <= 40) return 'beginner';
  if (categoryScore <= 55) return 'basic';
  if (categoryScore <= 70) return 'intermediate';
  if (categoryScore <= 85) return 'advanced';
  return 'expert';
}

module.exports = {
  CATEGORY_LIST,
  DIFFICULTY_LADDER,
  evaluateDecision,
  updateCategoryScore,
  computeOverallScore,
  updateTriggerExposure,
  classifyRisk,
  buildVulnerabilityProfile,
  recommendDifficulty,
};
