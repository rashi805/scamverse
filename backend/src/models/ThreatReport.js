const mongoose = require('mongoose');

const StatusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const ThreatReportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    threatType: {
      type: String,
      enum: ['phishing_url', 'scam_phone_number', 'fake_upi_id', 'fake_email', 'scam_domain', 'crypto_wallet_address'],
      required: true,
    },
    value: { type: String, required: true, trim: true }, // the URL / number / UPI ID / etc.
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['banking', 'digital_payment', 'phishing', 'investment', 'job_loan', 'social_engineering', 'web3', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['pending', 'suspicious', 'verified', 'expired', 'revoked', 'archived'],
      default: 'pending',
    },
    statusHistory: { type: [StatusHistorySchema], default: [{ status: 'pending' }] },
    // Normalized-data hash placeholder for the future blockchain layer (Phase 4).
    // Computed at report time so it's ready to register on-chain later.
    threatHash: { type: String, required: true },
    reviewDate: { type: Date, default: null },
    expirationDate: { type: Date, default: null },
    blockchainThreatId: { type: String, default: null }, // populated once registered on-chain (Phase 4)
  },
  { timestamps: true }
);

module.exports = mongoose.model('ThreatReport', ThreatReportSchema);
