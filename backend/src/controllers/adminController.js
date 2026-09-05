const ScamScenario = require('../models/ScamScenario');
const ThreatReport = require('../models/ThreatReport');
const User = require('../models/User');
const AwarenessScore = require('../models/AwarenessScore');
const SimulationSession = require('../models/SimulationSession');
const blockchainService = require('../blockchain/blockchainService');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

// GET /api/admin/analytics
async function getAnalytics(req, res, next) {
  try {
    const [totalUsers, totalSimulations, reportsByStatus, scenariosByCategory, avgScores] = await Promise.all([
      User.countDocuments(),
      SimulationSession.countDocuments({ status: 'completed' }),
      ThreatReport.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      SimulationSession.aggregate([
        { $match: { status: 'completed' } },
        { $lookup: { from: 'scamscenarios', localField: 'scenario', foreignField: '_id', as: 'scenario' } },
        { $unwind: '$scenario' },
        { $group: { _id: '$scenario.category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      AwarenessScore.aggregate([
        {
          $group: {
            _id: null,
            avgOverall: { $avg: '$overallScore' },
            avgBanking: { $avg: '$categoryScores.banking' },
            avgDigitalPayment: { $avg: '$categoryScores.digital_payment' },
            avgPhishing: { $avg: '$categoryScores.phishing' },
            avgInvestment: { $avg: '$categoryScores.investment' },
            avgJobLoan: { $avg: '$categoryScores.job_loan' },
            avgSocialEngineering: { $avg: '$categoryScores.social_engineering' },
            avgWeb3: { $avg: '$categoryScores.web3' },
          },
        },
      ]),
    ]);

    res.json({
      totalUsers,
      totalSimulationsCompleted: totalSimulations,
      reportsByStatus: reportsByStatus.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
      mostPracticedCategories: scenariosByCategory,
      averageScores: avgScores[0] || {},
    });
  } catch (err) {
    next(err);
  }
}

// --- Scenario CRUD ---

async function listAllScenarios(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query, 25);
    const [scenarios, total] = await Promise.all([
      ScamScenario.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      ScamScenario.countDocuments(),
    ]);
    res.json({ scenarios, pagination: buildPaginationMeta(page, limit, total) });
  } catch (err) {
    next(err);
  }
}

async function createScenario(req, res, next) {
  try {
    const scenario = await ScamScenario.create(req.body);
    res.status(201).json({ scenario });
  } catch (err) {
    next(err);
  }
}

async function updateScenario(req, res, next) {
  try {
    const scenario = await ScamScenario.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!scenario) return res.status(404).json({ message: 'Scenario not found' });
    res.json({ scenario });
  } catch (err) {
    next(err);
  }
}

async function deleteScenario(req, res, next) {
  try {
    // Soft delete: deactivate rather than hard-delete, so past SimulationSessions/UserDecisions
    // that reference this scenario stay valid for historical scoring.
    const scenario = await ScamScenario.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!scenario) return res.status(404).json({ message: 'Scenario not found' });
    res.json({ message: 'Scenario deactivated', scenario });
  } catch (err) {
    next(err);
  }
}

// --- Report management ---

// GET /api/admin/reports - ALL reports regardless of status (unlike the public registry)
async function listAllReports(req, res, next) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const { page, limit, skip } = parsePagination(req.query);
    const [reports, total] = await Promise.all([
      ThreatReport.find(filter)
        .populate('reporter', 'name email reporterReputation')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ThreatReport.countDocuments(filter),
    ]);
    res.json({ reports, pagination: buildPaginationMeta(page, limit, total) });
  } catch (err) {
    next(err);
  }
}

// --- Verifier management ---

async function listUsers(req, res, next) {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const { page, limit, skip } = parsePagination(req.query);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email role reporterReputation walletAddress createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({ users, pagination: buildPaginationMeta(page, limit, total) });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/users/:id/role   body: { role: 'verifier' | 'user' | 'admin' }
async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!['user', 'verifier', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('name email role walletAddress');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If promoting to verifier and they've linked a wallet, also grant the role on-chain.
    let onChain = null;
    if (role === 'verifier' && user.walletAddress) {
      onChain = await blockchainService.addVerifier(user.walletAddress);
    }

    res.json({ user, blockchainVerifierGranted: !!onChain });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAnalytics,
  listAllScenarios,
  createScenario,
  updateScenario,
  deleteScenario,
  listAllReports,
  listUsers,
  updateUserRole,
};
