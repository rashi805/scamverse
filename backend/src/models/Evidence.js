const mongoose = require('mongoose');

const EvidenceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    linkedThreatReport: { type: mongoose.Schema.Types.ObjectId, ref: 'ThreatReport', default: null },

    originalFilename: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSizeBytes: { type: Number, required: true },

    // SHA-256 of the exact original file bytes. This is what re-verification compares against.
    sha256Hash: { type: String, required: true },

    // Sensitive evidence is encrypted and stored off-chain/off-IPFS by design (Module 20).
    // Non-sensitive evidence may be pinned to IPFS (mocked in this environment - see ipfsService.js).
    isSensitive: { type: Boolean, default: true },
    storageType: { type: String, enum: ['encrypted_offchain', 'ipfs', 'ipfs_mock'], required: true },
    storageRef: { type: String, required: true }, // file path OR mock CID depending on storageType

    // Only present for encrypted_offchain storage; needed to decrypt later.
    encryption: {
      iv: { type: String, default: null },
      authTag: { type: String, default: null },
    },

    // Set once this evidence's hash is registered on-chain (Phase 4 reuse), if configured.
    blockchainThreatId: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Evidence', EvidenceSchema);
