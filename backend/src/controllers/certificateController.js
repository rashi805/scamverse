const crypto = require('crypto');
const Certificate = require('../models/Certificate');
const AwarenessScore = require('../models/AwarenessScore');
const User = require('../models/User');
const blockchainService = require('../blockchain/blockchainService');

// Explainable eligibility ladder - mirrors the training difficulty ladder (Module 9)
// so a certificate level roughly tracks how far someone has progressed.
const LEVELS = [
  { level: 'expert', minSimulations: 15, minScore: 85 },
  { level: 'advanced', minSimulations: 10, minScore: 70 },
  { level: 'intermediate', minSimulations: 5, minScore: 50 },
  { level: 'beginner', minSimulations: 3, minScore: 0 },
];

function determineLevel(completedSimulations, overallScore) {
  for (const tier of LEVELS) {
    if (completedSimulations >= tier.minSimulations && overallScore >= tier.minScore) {
      return tier.level;
    }
  }
  return null; // not yet eligible
}

// POST /api/certificates/generate
async function generateCertificate(req, res, next) {
  try {
    const existingCert = await Certificate.findOne({ user: req.userId });
    if (existingCert) {
      return res.status(400).json({ message: 'You have already generated a certificate.' });
    }

    const scoreDoc = await AwarenessScore.findOne({ user: req.userId });
    if (!scoreDoc) {
      return res.status(400).json({ message: 'Complete at least a few simulations before generating a certificate.' });
    }

    if (scoreDoc.overallScore < 80) {
      return res.status(400).json({ message: 'A minimum score of 80 is required to generate a certificate.' });
    }

    const level = determineLevel(scoreDoc.totalSimulationsCompleted, scoreDoc.overallScore);
    if (!level) {
      return res.status(400).json({
        message: `Not yet eligible. Complete at least ${LEVELS[LEVELS.length - 1].minSimulations} simulations to earn a Beginner certificate.`,
        totalSimulationsCompleted: scoreDoc.totalSimulationsCompleted,
        overallScore: scoreDoc.overallScore,
      });
    }

    const user = await User.findById(req.userId);
    const issuedAt = new Date();

    const payload = JSON.stringify({
      userId: String(req.userId),
      level,
      score: scoreDoc.overallScore,
      completedSimulations: scoreDoc.totalSimulationsCompleted,
      issuedAt: issuedAt.toISOString(),
    });
    const certificateHash = crypto.createHash('sha256').update(payload).digest('hex');

    const certificate = await Certificate.create({
      user: req.userId,
      level,
      score: scoreDoc.overallScore,
      completedSimulations: scoreDoc.totalSimulationsCompleted,
      certificateHash,
      walletAddress: user?.walletAddress || null,
    });

    // --- Phase 4: register hash in ScamThreatRegistry ---
    const onChain = await blockchainService.registerThreat(certificate._id, certificateHash, 'certificate');
    if (onChain) {
      certificate.blockchainThreatId = onChain.threatId;
    }

    // --- Phase 5 SBT: mint a Soulbound NFT to the user's wallet (if linked) ---
    let sbtResult = null;
    const recipientWallet = user?.walletAddress || null;
    if (recipientWallet && blockchainService.isSbtEnabled()) {
      const metadataURI = `https://scamverse360.app/api/certificates/verify/${certificate._id}`;
      sbtResult = await blockchainService.mintCertificateSBT(recipientWallet, metadataURI, certificateHash);
      if (sbtResult) {
        certificate.sbtTokenId = sbtResult.tokenId;
        certificate.sbtTxHash  = sbtResult.txHash;
      }
    }

    await certificate.save();

    res.status(201).json({
      certificate,
      blockchainRegistered: !!onChain,
      sbtMinted:   !!sbtResult,
      sbtTokenId:  sbtResult?.tokenId ?? null,
      verificationId: certificate._id,
    });
  } catch (err) {
    next(err);
  }
}


// GET /api/certificates/mine
async function myCertificates(req, res, next) {
  try {
    const certificates = await Certificate.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ certificates });
  } catch (err) {
    next(err);
  }
}

// GET /api/certificates/verify/:certificateId - PUBLIC, no auth, no PII exposed (Module 18)
async function verifyCertificate(req, res, next) {
  try {
    const certificate = await Certificate.findById(req.params.certificateId);
    if (!certificate) {
      return res.json({ valid: false, message: 'NOT FOUND — no certificate with this ID exists.' });
    }

    let onChainHashMatches = null;
    if (certificate.blockchainThreatId && blockchainService.isEnabled()) {
      const onChain = await blockchainService.getThreat(certificate.blockchainThreatId);
      if (onChain) {
        onChainHashMatches = onChain.threatHash.toLowerCase() === `0x${certificate.certificateHash}`.toLowerCase();
      }
    }

    res.json({
      valid: true,
      message: 'VALID',
      level: certificate.level,
      score: certificate.score,
      completedSimulations: certificate.completedSimulations,
      issuedAt: certificate.createdAt,
      blockchainRegistered: !!certificate.blockchainThreatId,
      onChainHashMatches,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateCertificate, myCertificates, verifyCertificate };
