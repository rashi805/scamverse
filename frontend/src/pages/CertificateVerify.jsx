import React, { useState } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader.jsx';

export default function CertificateVerify() {
  const [certificateId, setCertificateId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.get(`/certificates/verify/${certificateId.trim()}`);
      setResult(data);
    } catch (err) {
      setResult({ valid: false, message: 'NOT FOUND — no certificate with this ID exists.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-8 py-10">
      <PageHeader
        eyebrow="Public Verification"
        title="Certificate Verification"
        description="Enter a SCAMVERSE 360 certificate ID to confirm it's genuine. No account required."
      />

      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <input
          value={certificateId} onChange={(e) => setCertificateId(e.target.value)} required
          placeholder="Certificate ID"
          className="flex-1 bg-surface shadow-smAlt border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary"
        />
        <button disabled={loading} className="bg-primary text-white font-semibold px-5 rounded-lg disabled:opacity-50">
          {loading ? 'Checking...' : 'Verify'}
        </button>
      </form>

      {error && <p className="text-danger text-sm">{error}</p>}

      {result && (
        <div className={`border rounded-2xl p-6 ${result.valid ? 'border-success bg-success/10' : 'border-danger bg-danger/10'}`}>
          <p className={`text-2xl font-extrabold mb-3 ${result.valid ? 'text-success' : 'text-danger'}`}>
            {result.valid ? 'VALID' : 'NOT FOUND'}
          </p>
          {result.valid && (
            <div className="text-sm text-textMuted space-y-1">
              <p>Level: <span className="capitalize">{result.level}</span></p>
              <p>Score at issuance: {result.score}/100</p>
              <p>Simulations completed: {result.completedSimulations}</p>
              <p>Issued: {new Date(result.issuedAt).toLocaleDateString()}</p>
              {result.blockchainRegistered && (
                <p className="text-primary">
                  ⛓ On-chain hash {result.onChainHashMatches ? 'MATCHES' : result.onChainHashMatches === false ? 'MISMATCH' : '(unavailable)'}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
