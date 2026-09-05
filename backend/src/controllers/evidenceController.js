const Evidence = require('../models/Evidence');
const evidenceStorage = require('../services/evidenceStorage');
const ipfsService = require('../services/ipfsService');
const blockchainService = require('../blockchain/blockchainService');
const { validateEvidenceFile } = require('../utils/fileValidation');

// POST /api/evidence/upload
// multipart/form-data: file, isSensitive ('true'|'false'), linkedThreatReport (optional)
async function uploadEvidence(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const buffer = req.file.buffer;

    // Verify the file's actual bytes match an accepted evidence type -- the
    // client-supplied mimetype/extension are advisory only and easily spoofed.
    const validation = validateEvidenceFile(buffer, req.file.originalname);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.reason });
    }

    const sha256Hash = evidenceStorage.sha256(buffer);

    // Default to sensitive (safer) unless the user explicitly says otherwise.
    const isSensitive = req.body.isSensitive !== 'false';

    let storageType, storageRef, encryption = { iv: null, authTag: null };

    if (isSensitive) {
      const stored = evidenceStorage.encryptAndStore(buffer, req.file.originalname);
      storageType = 'encrypted_offchain';
      storageRef = stored.storageRef;
      encryption = { iv: stored.iv, authTag: stored.authTag };
    } else {
      const pinned = await ipfsService.pin(buffer, req.file.originalname);
      storageType = pinned.isMock ? 'ipfs_mock' : 'ipfs';
      storageRef = pinned.cid;
    }

    const evidence = await Evidence.create({
      user: req.userId,
      linkedThreatReport: req.body.linkedThreatReport || null,
      originalFilename: req.file.originalname,
      mimeType: validation.detectedType,
      fileSizeBytes: req.file.size,
      sha256Hash,
      isSensitive,
      storageType,
      storageRef,
      encryption,
    });

    // Register just the hash on-chain (never the file), reusing the threat
    // registry's generic hash-storage mechanism with threatType 'evidence'.
    const onChain = await blockchainService.registerThreat(evidence._id, sha256Hash, 'evidence');
    if (onChain) {
      evidence.blockchainThreatId = onChain.threatId;
      await evidence.save();
    }

    res.status(201).json({
      message: isSensitive
        ? 'File encrypted and stored securely off-chain. Only its hash was registered.'
        : storageType === 'ipfs'
          ? 'File pinned to IPFS as non-sensitive content.'
          : 'File hash pinned via IPFS (mock in this environment, no real IPFS node configured) as non-sensitive content.',
      evidence: sanitize(evidence),
      blockchainRegistered: !!onChain,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/evidence/mine
async function myEvidence(req, res, next) {
  try {
    const items = await Evidence.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ evidence: items.map(sanitize) });
  } catch (err) {
    next(err);
  }
}

// POST /api/evidence/:id/verify
// multipart/form-data: file  -- re-upload the same file to check it hasn't changed
async function verifyEvidence(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded for comparison' });
    }
    const evidence = await Evidence.findById(req.params.id);
    if (!evidence || String(evidence.user) !== String(req.userId)) {
      return res.status(404).json({ message: 'Evidence record not found' });
    }

    const newHash = evidenceStorage.sha256(req.file.buffer);
    const isValid = newHash === evidence.sha256Hash;

    res.json({
      result: isValid ? 'VALID' : 'MISMATCH',
      message: isValid
        ? 'This file matches the original hash exactly. Integrity confirmed.'
        : 'This file does NOT match the originally stored hash. It may have been altered or is a different file.',
      originalHash: evidence.sha256Hash,
      uploadedHash: newHash,
    });
  } catch (err) {
    next(err);
  }
}

function sanitize(evidence) {
  const obj = evidence.toObject ? evidence.toObject() : evidence;
  delete obj.encryption; // never expose IV/authTag to the client
  return obj;
}

module.exports = { uploadEvidence, myEvidence, verifyEvidence };
