import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader.jsx';

const levelColor = {
  beginner:     'bg-border text-text',
  intermediate: 'bg-primary/20 text-primary',
  advanced:     'bg-warning/20 text-warning',
  expert:       'bg-purple-500/20 text-purple-300',
};

export default function Certificate() {
  const [certificates, setCertificates] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);

  function load() {
    api.get('/certificates/mine').then((res) => setCertificates(res.data.certificates));
  }
  useEffect(() => { load(); }, []);

  async function handleGenerate() {
    setError('');
    setNotice(null);
    setGenerating(true);
    try {
      const { data } = await api.post('/certificates/generate');
      setNotice(data);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate a certificate yet');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
      <PageHeader
        eyebrow="Awareness Credential"
        title="Your Certificate"
        description="Earn a blockchain-verifiable certificate as your simulation score and completed count grow. Anyone can verify a certificate ID without needing an account."
      />

      <div className="bg-surface shadow-sm border border-border rounded-2xl p-6">
        <button onClick={handleGenerate} disabled={generating} className="bg-primary text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-50">
          {generating ? 'Generating...' : 'Generate / Refresh Certificate'}
        </button>
        {error && <p className="text-warning text-sm mt-3">{error}</p>}
        {notice && (
          <div className="mt-3 space-y-1">
            <p className="text-success text-sm">
              Certificate created ({notice.certificate.level}).{' '}
              {notice.blockchainRegistered
                ? '⛓ Hash registered in ScamThreatRegistry.'
                : 'Blockchain registry layer not configured — stored off-chain only.'}
            </p>
            {notice.sbtMinted && (
              <p className="text-purple-300 text-sm">
                🎖 Soulbound NFT minted on-chain — Token #{notice.sbtTokenId}
              </p>
            )}
          </div>
        )}
        <Link to="/certificate-verify" className="text-primary text-sm underline block mt-3">
          Verify a certificate ID →
        </Link>
      </div>

      <div>
        <h3 className="font-semibold text-text mb-3">Your Certificates</h3>
        {certificates.length === 0 && <p className="text-textMuted text-sm">No certificates yet — complete more simulations to become eligible.</p>}
        <div className="space-y-3">
          {certificates.map((c) => (
            <div key={c._id} className="bg-surface shadow-sm border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md ${levelColor[c.level]}`}>{c.level}</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {c.blockchainThreatId && (
                    <span className="text-xs text-primary border border-primary/40 bg-primary/10 px-2 py-1 rounded-full">
                      ⛓ On-chain
                    </span>
                  )}
                  {c.sbtTokenId != null && (
                    <span className="text-xs text-purple-300 border border-purple-500/40 bg-purple-500/10 px-2 py-1 rounded-full">
                      🎖 SBT #{c.sbtTokenId}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-textMuted">Score: {c.score}/100 · {c.completedSimulations} simulations completed</p>
              <p className="text-xs text-textMuted mt-2 break-all">Certificate ID: {c._id}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

