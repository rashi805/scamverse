/**
 * SCAMVERSE 360 - Blockchain Service (Phase 4 + Phase 5 SBT)
 *
 * Thin wrapper around ethers.js + the deployed contracts:
 *   - ScamThreatRegistry  (Phase 4)  — threat hashing & lifecycle
 *   - ScamCertificateSBT  (Phase 5)  — soulbound certificate NFTs (ERC-5192)
 *
 * Designed to fail SAFE: if any env var is missing, every function simply
 * returns null instead of throwing, so the rest of the platform keeps working.
 */
const { ethers } = require('ethers');
const { registryABI, sbtABI } = require('./contractABI');

// Mirrors the Solidity `enum Status` order exactly.
const STATUS_ENUM = {
  pending: 0,
  suspicious: 1,
  verified: 2,
  expired: 3,
  revoked: 4,
  archived: 5,
};
const STATUS_NAMES = Object.keys(STATUS_ENUM);

let provider      = null;
let signer        = null;
let contract      = null; // ScamThreatRegistry
let sbtContract   = null; // ScamCertificateSBT
let initError     = null;

function init() {
  if ((contract || sbtContract) || initError) return; // only attempt once

  const rpcUrl          = process.env.BLOCKCHAIN_RPC_URL;
  const privateKey      = process.env.BLOCKCHAIN_PRIVATE_KEY;
  const contractAddress = process.env.THREAT_REGISTRY_CONTRACT_ADDRESS;
  const sbtAddress      = process.env.SBT_CONTRACT_ADDRESS;

  if (!rpcUrl || !privateKey || !contractAddress) {
    initError = 'Blockchain not configured (missing BLOCKCHAIN_RPC_URL / BLOCKCHAIN_PRIVATE_KEY / THREAT_REGISTRY_CONTRACT_ADDRESS)';
    return;
  }

  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
    signer   = new ethers.Wallet(privateKey, provider);
    contract = new ethers.Contract(contractAddress, registryABI, signer);
    console.log('[BLOCKCHAIN] Connected to ScamThreatRegistry at', contractAddress);

    // SBT is optional — platform keeps working without it
    if (sbtAddress) {
      sbtContract = new ethers.Contract(sbtAddress, sbtABI, signer);
      console.log('[BLOCKCHAIN] Connected to ScamCertificateSBT  at', sbtAddress);
    } else {
      console.warn('[BLOCKCHAIN] SBT_CONTRACT_ADDRESS not set — certificate minting on-chain disabled');
    }
  } catch (err) {
    initError = `Failed to initialize blockchain connection: ${err.message}`;
    console.error('[BLOCKCHAIN]', initError);
  }
}

function isEnabled() {
  init();
  return !!contract;
}

function isSbtEnabled() {
  init();
  return !!sbtContract;
}

function statusNameToEnum(name) {
  return STATUS_ENUM[name] ?? 0;
}

function statusEnumToName(value) {
  return STATUS_NAMES[Number(value)] || 'pending';
}

/** Deterministically derive an on-chain threatId from the MongoDB _id. */
function deriveThreatId(mongoId) {
  return ethers.keccak256(ethers.toUtf8Bytes(`scamverse360:threat:${mongoId}`));
}

/** Convert a hex SHA-256 string (64 hex chars) into a bytes32-compatible 0x-prefixed value. */
function hexToBytes32(hexString) {
  const clean = hexString.startsWith('0x') ? hexString : `0x${hexString}`;
  if (clean.length !== 66) {
    throw new Error('Expected a 32-byte (64 hex char) hash for bytes32 conversion');
  }
  return clean;
}

// ---------------------------------------------------------------------------
// ScamThreatRegistry functions (Phase 4)
// ---------------------------------------------------------------------------

async function registerThreat(mongoId, threatHashHex, threatType) {
  if (!isEnabled()) return null;
  try {
    const threatId   = deriveThreatId(mongoId);
    const threatHash = hexToBytes32(threatHashHex);
    const tx         = await contract.registerThreat(threatId, threatHash, threatType);
    const receipt    = await tx.wait();
    return { threatId, txHash: receipt.hash };
  } catch (err) {
    console.error('[BLOCKCHAIN] registerThreat failed:', err.message);
    return null;
  }
}

async function updateStatus(threatId, statusName) {
  if (!isEnabled() || !threatId) return null;
  try {
    const statusValue = statusNameToEnum(statusName);
    let tx;
    if (statusName === 'verified') {
      tx = await contract.verifyThreat(threatId);
    } else if (statusName === 'revoked') {
      tx = await contract.revokeThreat(threatId);
    } else {
      tx = await contract.updateThreatStatus(threatId, statusValue);
    }
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (err) {
    console.error('[BLOCKCHAIN] updateStatus failed:', err.message);
    return null;
  }
}

async function getThreat(threatId) {
  if (!isEnabled() || !threatId) return null;
  try {
    const result = await contract.getThreat(threatId);
    return {
      threatHash:  result.threatHash,
      threatType:  result.threatType,
      status:      statusEnumToName(result.status),
      reporter:    result.reporter,
      timestamp:   Number(result.timestamp),
      lastUpdated: Number(result.lastUpdated),
    };
  } catch (err) {
    console.error('[BLOCKCHAIN] getThreat failed:', err.message);
    return null;
  }
}

async function getThreatHistory(threatId) {
  if (!isEnabled() || !threatId) return [];
  try {
    const history = await contract.getThreatHistory(threatId);
    return history.map((h) => ({
      status:    statusEnumToName(h.status),
      timestamp: Number(h.timestamp),
      changedBy: h.changedBy,
    }));
  } catch (err) {
    console.error('[BLOCKCHAIN] getThreatHistory failed:', err.message);
    return [];
  }
}

async function addVerifier(address) {
  if (!isEnabled()) return null;
  try {
    const tx      = await contract.addVerifier(address);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (err) {
    console.error('[BLOCKCHAIN] addVerifier failed:', err.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// ScamCertificateSBT functions (Phase 5 / Step 3)
// ---------------------------------------------------------------------------

/**
 * Mint a Soulbound Certificate NFT on-chain.
 *
 * @param {string} recipientAddress  - Recipient's Ethereum wallet address.
 * @param {string} metadataURI       - URI pointing to the certificate JSON.
 * @param {string} certificateHashHex - Hex SHA-256 of the off-chain payload (64 chars).
 * @returns {{ tokenId: number, txHash: string } | null}
 */
async function mintCertificateSBT(recipientAddress, metadataURI, certificateHashHex) {
  if (!isSbtEnabled()) return null;
  if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
    console.warn('[BLOCKCHAIN] mintCertificateSBT skipped — invalid recipient address:', recipientAddress);
    return null;
  }
  try {
    const certHash = hexToBytes32(certificateHashHex);
    const tx       = await sbtContract.mintCertificate(recipientAddress, metadataURI, certHash);
    const receipt  = await tx.wait();

    // Parse the CertificateMinted event to get the tokenId
    const iface   = sbtContract.interface;
    let tokenId   = null;
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed && parsed.name === 'CertificateMinted') {
          tokenId = Number(parsed.args.tokenId);
          break;
        }
      } catch (_) { /* skip unparseable logs */ }
    }

    console.log(`[BLOCKCHAIN] SBT minted — tokenId: ${tokenId}, recipient: ${recipientAddress}`);
    return { tokenId, txHash: receipt.hash };
  } catch (err) {
    console.error('[BLOCKCHAIN] mintCertificateSBT failed:', err.message);
    return null;
  }
}

/**
 * Retrieve a certificate record from the SBT contract.
 * @param {number|string} tokenId
 * @returns {{ recipient, certificateHash, metadataURI, timestamp } | null}
 */
async function getCertificateSBT(tokenId) {
  if (!isSbtEnabled() || tokenId == null) return null;
  try {
    const [recipient, certHash, metadataURI, timestamp] = await sbtContract.getCertificate(BigInt(tokenId));
    return {
      recipient,
      certificateHash: certHash,
      metadataURI,
      timestamp: Number(timestamp),
    };
  } catch (err) {
    console.error('[BLOCKCHAIN] getCertificateSBT failed:', err.message);
    return null;
  }
}

module.exports = {
  isEnabled,
  isSbtEnabled,
  deriveThreatId,
  registerThreat,
  updateStatus,
  getThreat,
  getThreatHistory,
  addVerifier,
  mintCertificateSBT,
  getCertificateSBT,
  STATUS_ENUM,
};

