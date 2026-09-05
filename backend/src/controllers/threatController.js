const crypto = require('crypto');
const ThreatReport = require('../models/ThreatReport');
const User = require('../models/User');
const blockchainService = require('../blockchain/blockchainService');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

/**
 * Normalize + SHA-256 hash the threat value, exactly as described in Module 19
 * (Raw Threat -> Normalize -> SHA-256 -> Threat Hash -> [later] Blockchain).
 * This is computed now so the record is ready for on-chain registration in Phase 4.
 */
function computeThreatHash(threatType, value) {
  const normalized = `${threatType}:${value.trim().toLowerCase()}`;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

// POST /api/threats/report
async function submitReport(req, res, next) {
  try {
    const { threatType, value, description, category } = req.body;

    if (!threatType || !value) {
      return res.status(400).json({ message: 'threatType and value are required' });
    }
    if (value.trim().length > 500) {
      return res.status(400).json({ message: 'value is too long' });
    }

    const threatHash = computeThreatHash(threatType, value);

    // Prevent exact duplicate pending reports of the same normalized value.
    const existing = await ThreatReport.findOne({ threatHash, status: { $in: ['pending', 'suspicious', 'verified'] } });
    if (existing) {
      return res.status(200).json({
        message: 'This threat has already been reported and is in the system.',
        report: existing,
        duplicate: true,
      });
    }

    const report = await ThreatReport.create({
      reporter: req.userId,
      threatType,
      value: value.trim(),
      description: description || '',
      category: category || 'other',
      threatHash,
      status: 'pending',
      statusHistory: [{ status: 'pending', note: 'Report submitted by user' }],
    });

    // Register on-chain if the blockchain layer is configured (Phase 4).
    // Fails safe: if not configured, the report still works normally off-chain.
    const onChain = await blockchainService.registerThreat(report._id, threatHash, threatType);
    if (onChain) {
      report.blockchainThreatId = onChain.threatId;
      await report.save();
    }

    res.status(201).json({
      message: onChain
        ? 'Report submitted, hashed, and registered on-chain. It is pending review before being marked verified.'
        : 'Report submitted and is pending review. It has not been automatically published as verified.',
      report,
      blockchainRegistered: !!onChain,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/threats/my-reports
async function myReports(req, res, next) {
  try {
    const reports = await ThreatReport.find({ reporter: req.userId }).sort({ createdAt: -1 });
    res.json({ reports });
  } catch (err) {
    next(err);
  }
}

// GET /api/threats/registry - public-ish view of verified/suspicious threats (no reporter identity exposed)
async function getRegistry(req, res, next) {
  try {
    const { category, threatType, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (threatType) filter.threatType = threatType;
    filter.status = status && ['verified', 'suspicious'].includes(status) ? status : { $in: ['verified', 'suspicious'] };

    const { page, limit, skip } = parsePagination(req.query);

    const [reports, total] = await Promise.all([
      ThreatReport.find(filter)
        .select('threatType value category status createdAt statusHistory blockchainThreatId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ThreatReport.countDocuments(filter),
    ]);

    res.json({
      reports: reports.map((r) => ({
        _id: r._id,
        threatType: r.threatType,
        value: r.value,
        category: r.category,
        status: r.status,
        createdAt: r.createdAt,
        registeredOnChain: !!r.blockchainThreatId,
      })),
      pagination: buildPaginationMeta(page, limit, total),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/threats/check?value=... - wallet/URL/etc threat lookup (Module 19)
async function checkThreatValue(req, res, next) {
  try {
    const { value, threatType } = req.query;
    if (!value) return res.status(400).json({ message: 'value query param is required' });

    const filter = { value: value.trim() };
    if (threatType) filter.threatType = threatType;

    const matches = await ThreatReport.find(filter).select('threatType value category status createdAt');

    if (matches.length === 0) {
      return res.json({ found: false, message: 'No matching threat records found in the registry.' });
    }

    res.json({ found: true, matches });
  } catch (err) {
    next(err);
  }
}

// --- Verifier / admin actions (Module 13, 17) ---

// PATCH /api/threats/:id/status  { status, note }
async function updateStatus(req, res, next) {
  try {
    const { status, note } = req.body;
    const validStatuses = ['pending', 'suspicious', 'verified', 'expired', 'revoked', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await ThreatReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.status = status;
    report.statusHistory.push({ status, note: note || '', changedAt: new Date() });
    await report.save();

    // Mirror the status change on-chain if this report was registered there.
    if (report.blockchainThreatId) {
      await blockchainService.updateStatus(report.blockchainThreatId, status);
    }

    // Update reporter reputation based on outcome (Module 17).
    // Reputation influences review priority; it never proves truth by itself.
    const reporter = await User.findById(report.reporter);
    if (reporter) {
      if (status === 'verified') {
        reporter.reporterReputation = Math.min(100, reporter.reporterReputation + 10);
      } else if (status === 'revoked' || status === 'archived') {
        reporter.reporterReputation = Math.max(0, reporter.reporterReputation - 8);
      }
      await reporter.save();
    }

    res.json({ report });
  } catch (err) {
    next(err);
  }
}

// GET /api/threats/:id/chain-record - compare off-chain vs on-chain state (Phase 4)
async function getChainRecord(req, res, next) {
  try {
    const report = await ThreatReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (!blockchainService.isEnabled()) {
      return res.json({
        blockchainEnabled: false,
        message: 'Blockchain layer is not configured on this deployment.',
        offChain: { status: report.status, threatHash: report.threatHash },
      });
    }

    if (!report.blockchainThreatId) {
      return res.json({
        blockchainEnabled: true,
        registeredOnChain: false,
        message: 'This report predates blockchain registration or registration failed at submit time.',
        offChain: { status: report.status, threatHash: report.threatHash },
      });
    }

    const onChain = await blockchainService.getThreat(report.blockchainThreatId);
    const history = await blockchainService.getThreatHistory(report.blockchainThreatId);

    const onChainHashMatches = onChain
      ? onChain.threatHash.toLowerCase() === `0x${report.threatHash}`.toLowerCase()
      : null;

    res.json({
      blockchainEnabled: true,
      registeredOnChain: true,
      offChain: { status: report.status, threatHash: report.threatHash },
      onChain,
      onChainHashMatches,
      history,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitReport, myReports, getRegistry, checkThreatValue, updateStatus, getChainRecord };
