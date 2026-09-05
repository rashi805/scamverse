import React, { useEffect, useState } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader.jsx';

export default function Evidence() {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [isSensitive, setIsSensitive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const [verifyTarget, setVerifyTarget] = useState(null);
  const [verifyFile, setVerifyFile] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  function loadEvidence() {
    api.get('/evidence/mine').then((res) => setItems(res.data.evidence));
  }

  useEffect(() => { loadEvidence(); }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setError('');
    setUploadResult(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('isSensitive', isSensitive ? 'true' : 'false');
      const { data } = await api.post('/evidence/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(data);
      setFile(null);
      loadEvidence();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (!verifyFile || !verifyTarget) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const form = new FormData();
      form.append('file', verifyFile);
      const { data } = await api.post(`/evidence/${verifyTarget}/verify`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setVerifyResult(data);
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
      <PageHeader
        eyebrow="Evidence Integrity"
        title="Evidence Vault"
        description="Upload screenshots or documents related to a scam. We store only a cryptographic hash on-chain — never the file itself — so you can later prove the file hasn't been altered."
      />

      <form onSubmit={handleUpload} className="bg-surface shadow-sm border border-border rounded-2xl p-6 space-y-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-textMuted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:font-semibold"
        />
        <label className="flex items-center gap-2 text-sm text-textMuted">
          <input type="checkbox" checked={isSensitive} onChange={(e) => setIsSensitive(e.target.checked)} />
          This may contain sensitive personal information (recommended default — encrypted, stored off-chain)
        </label>
        {!isSensitive && (
          <p className="text-xs text-warning">
            Non-sensitive files are pinned via IPFS (mocked in this demo environment) instead of encrypted storage.
          </p>
        )}
        <button disabled={!file || uploading} className="bg-primary text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-50">
          {uploading ? 'Processing...' : 'Upload & Hash'}
        </button>
        {error && <p className="text-danger text-sm">{error}</p>}
        {uploadResult && (
          <div className="text-sm text-success bg-success/10 border border-success/40 rounded-lg p-3">
            {uploadResult.message}
            {uploadResult.blockchainRegistered && <span className="block text-primary mt-1">⛓ Hash registered on-chain</span>}
          </div>
        )}
      </form>

      <div>
        <h3 className="font-semibold text-text mb-3">Your Evidence Records</h3>
        {items.length === 0 && <p className="text-textMuted text-sm">No evidence uploaded yet.</p>}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="bg-surface shadow-sm border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text">{item.originalFilename}</p>
                  <p className="text-xs text-textMuted break-all mt-1">SHA-256: {item.sha256Hash}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-surface shadow-smAlt text-textMuted border border-border">
                    {item.storageType === 'encrypted_offchain'
                      ? 'Encrypted'
                      : item.storageType === 'ipfs'
                        ? 'IPFS'
                        : 'IPFS (mock)'}
                  </span>
                  {item.blockchainThreatId && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/40">⛓ On-chain</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setVerifyTarget(item._id); setVerifyResult(null); }}
                className="text-xs text-primary underline mt-2"
              >
                Re-verify this file
              </button>

              {verifyTarget === item._id && (
                <form onSubmit={handleVerify} className="mt-3 pt-3 border-t border-border flex items-center gap-3 flex-wrap">
                  <input
                    type="file"
                    onChange={(e) => setVerifyFile(e.target.files?.[0] || null)}
                    className="text-xs text-textMuted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-border file:text-text"
                  />
                  <button disabled={!verifyFile || verifying} className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50">
                    {verifying ? 'Checking...' : 'Compare Hash'}
                  </button>
                </form>
              )}
              {verifyTarget === item._id && verifyResult && (
                <p className={`text-xs mt-2 font-semibold ${verifyResult.result === 'VALID' ? 'text-success' : 'text-danger'}`}>
                  {verifyResult.result}: {verifyResult.message}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
