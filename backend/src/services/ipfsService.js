/**
 * SCAMVERSE 360 - IPFS Service (Phase 5, Module 20)
 *
 * Supports two modes:
 *  1. REAL: if IPFS_API_URL is set (e.g. a local Kubo node's RPC API at
 *     http://127.0.0.1:5001), files are pinned via the real IPFS HTTP API.
 *  2. MOCK (default): no real IPFS node/pinning service is contacted. A
 *     CID-shaped identifier is derived from the content hash instead, so the
 *     rest of the platform can be built and demoed against a stable
 *     interface without requiring IPFS infrastructure.
 *
 * Either way, the caller gets back { cid, isMock }. Per spec (Module 20):
 * only NON-sensitive evidence, public reports, and certificate metadata
 * should ever go through this path -- sensitive evidence must use the
 * encrypted off-chain storage in evidenceStorage.js instead. That gate is
 * enforced by the caller (evidenceController.js), not here.
 */
const crypto = require('crypto');

function mockPin(buffer) {
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  return { cid: `mockcid-${hash.slice(0, 46)}`, isMock: true };
}

async function realPin(buffer, filename) {
  const apiUrl = process.env.IPFS_API_URL.replace(/\/$/, '');
  const form = new FormData();
  form.append('file', new Blob([buffer]), filename || 'evidence');

  const response = await fetch(`${apiUrl}/api/v0/add?pin=true`, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`IPFS node responded with ${response.status}`);
  }
  const data = await response.json();
  if (!data.Hash) {
    throw new Error('IPFS node response did not include a Hash/CID');
  }
  return { cid: data.Hash, isMock: false };
}

/**
 * Pin content to IPFS. Fails safe: if a real node is configured but
 * unreachable, falls back to the mock rather than failing the whole upload,
 * and the returned `isMock: true` makes that fallback visible to the caller.
 */
async function pin(buffer, filename) {
  if (process.env.IPFS_API_URL) {
    try {
      return await realPin(buffer, filename);
    } catch (err) {
      console.error('[IPFS] Real IPFS pin failed, falling back to mock:', err.message);
    }
  }
  return mockPin(buffer);
}

module.exports = { pin };
