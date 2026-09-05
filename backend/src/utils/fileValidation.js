/**
 * SCAMVERSE 360 - Evidence File Validation (Phase 5 hardening, Module 16/31)
 *
 * Client-supplied MIME types and file extensions are trivially spoofable, so
 * evidence uploads are additionally verified by inspecting the file's actual
 * magic bytes. Only a small allowlist appropriate for scam evidence
 * (screenshots, photos, PDFs, plain-text message dumps) is accepted;
 * everything else -- executables, scripts, archives, Office macro formats --
 * is rejected outright rather than attempting to sanitize it.
 */

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt'];

function detectMagicType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (buffer.length >= 6 && buffer.slice(0, 6).toString('ascii') === 'GIF89a') return 'image/gif';
  if (buffer.length >= 6 && buffer.slice(0, 6).toString('ascii') === 'GIF87a') return 'image/gif';
  if (
    buffer.length >= 12 &&
    buffer.slice(0, 4).toString('ascii') === 'RIFF' &&
    buffer.slice(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  if (buffer.length >= 5 && buffer.slice(0, 5).toString('ascii') === '%PDF-') return 'application/pdf';
  return null;
}

/** Heuristic check that a buffer is plausibly plain text (few control bytes, no null bytes). */
function looksLikePlainText(buffer) {
  if (buffer.includes(0x00)) return false; // NUL bytes never appear in real text files
  const sampleSize = Math.min(buffer.length, 4096);
  let suspicious = 0;
  for (let i = 0; i < sampleSize; i++) {
    const byte = buffer[i];
    const isPrintable = byte === 0x09 || byte === 0x0a || byte === 0x0d || (byte >= 0x20 && byte <= 0x7e) || byte >= 0x80;
    if (!isPrintable) suspicious++;
  }
  return suspicious / sampleSize < 0.01; // allow a tiny margin for odd encodings
}

/**
 * Validates an uploaded evidence file against the allowlist using its actual
 * bytes, not the client-supplied mimetype/filename (which are advisory only).
 * Returns { valid: true, detectedType } or { valid: false, reason }.
 */
function validateEvidenceFile(buffer, originalFilename) {
  if (!buffer || buffer.length === 0) {
    return { valid: false, reason: 'File is empty.' };
  }

  const ext = (originalFilename.match(/\.[^.]+$/) || [''])[0].toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, reason: `File type "${ext || 'unknown'}" is not allowed. Accepted: images (jpg, png, gif, webp), PDF, and plain text.` };
  }

  const magicType = detectMagicType(buffer);
  if (magicType) {
    return { valid: true, detectedType: magicType };
  }

  // No image/PDF signature matched -- only acceptable if this is genuinely plain text.
  if (ext === '.txt' && looksLikePlainText(buffer)) {
    return { valid: true, detectedType: 'text/plain' };
  }

  return {
    valid: false,
    reason: 'The file\'s actual content does not match an accepted evidence type (its extension may be misleading). Accepted: images (jpg, png, gif, webp), PDF, and plain text.',
  };
}

module.exports = { validateEvidenceFile, ALLOWED_EXTENSIONS };
