/**
 * SCAMVERSE 360 - Encrypted Evidence Storage (Phase 5, Module 16/20)
 *
 * Sensitive evidence is encrypted at rest with AES-256-GCM and written to a
 * local directory that is never served statically and never touches IPFS or
 * the blockchain. Only the SHA-256 hash of the ORIGINAL file is ever put
 * on-chain - never the file contents.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STORAGE_DIR = path.join(__dirname, '..', '..', 'secure-evidence-store');

function ensureDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

function getEncryptionKey() {
  const keyHex = process.env.EVIDENCE_ENCRYPTION_KEY;
  if (keyHex && keyHex.length === 64) {
    return Buffer.from(keyHex, 'hex');
  }
  // Fallback for local/demo use only: a fixed, clearly-non-production key.
  // Production deployments MUST set EVIDENCE_ENCRYPTION_KEY (32 random bytes, hex-encoded).
  console.warn('[EVIDENCE] EVIDENCE_ENCRYPTION_KEY not set - using an insecure demo key. Do not use in production.');
  return crypto.createHash('sha256').update('scamverse360-demo-key-DO-NOT-USE-IN-PRODUCTION').digest();
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function encryptAndStore(buffer, filenameHint) {
  ensureDir();
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const safeName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${filenameHint.replace(/[^a-zA-Z0-9._-]/g, '_')}.enc`;
  const fullPath = path.join(STORAGE_DIR, safeName);
  fs.writeFileSync(fullPath, encrypted);

  return {
    storageRef: safeName, // stored relative; resolve against STORAGE_DIR when reading
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

function decrypt(storageRef, ivHex, authTagHex) {
  const key = getEncryptionKey();
  const fullPath = path.join(STORAGE_DIR, storageRef);
  const encrypted = fs.readFileSync(fullPath);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

module.exports = { sha256, encryptAndStore, decrypt };
