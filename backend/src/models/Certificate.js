const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true,
    },
    score: { type: Number, required: true },
    completedSimulations: { type: Number, required: true },
    certificateHash: { type: String, required: true },
    walletAddress: { type: String, default: null },
    blockchainThreatId: { type: String, default: null }, // reuses ScamThreatRegistry's generic hash storage
    sbtTokenId: { type: Number, default: null },         // ERC-721 token ID minted by ScamCertificateSBT
    sbtTxHash:  { type: String, default: null },         // transaction hash of the SBT mint tx
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', CertificateSchema);

